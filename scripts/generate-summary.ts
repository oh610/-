import "./_env";
import { searchNews } from "@/lib/collectors/naver-news";
import { supabaseAdmin } from "@/lib/supabase/admin";
import { callClaude, parseJsonResponse, MODELS } from "@/lib/ai/claude";
import {
  ISSUE_SELECTION_SYSTEM,
  issueSelectionUserPrompt,
  EXTRACTION_SYSTEM,
  extractionUserPrompt,
  STANCE_SYSTEM,
  stanceUserPrompt,
  BIAS_CHECK_SYSTEM,
  biasCheckUserPrompt,
} from "@/lib/ai/prompts";

// PRD 4.4 기준 현재(2026-08) 여당/야당 — 정권 교체 시 갱신 필요.
const RULING_PARTY = "더불어민주당";
const OPPOSITION_PARTY = "국민의힘";
const SUPPLEMENTARY_SOURCE_TYPE = "보조 근거(뉴스 기사) — 정당 공식 논평 아님";

type IssueSelection = { issue_title: string; search_query: string; reason: string };
type ExtractedFacts = {
  core_facts: string;
  people: { name: string; affiliation: string }[];
  dates: string[];
};
type StanceResult = {
  stance_summary: string;
  citations: { sentence: string; source_id: string }[];
};
type BiasCheckResult = { balanced: boolean; issues: string[]; recommendation: string };

type ArticleRow = { id: string; title: string; description: string; sourceName: string; url: string };

function extractSourceName(url: string): string {
  try {
    return new URL(url).hostname.replace(/^www\./, "");
  } catch {
    return "unknown";
  }
}

async function upsertArticle(item: {
  title: string;
  description: string;
  link: string;
  originallink: string;
  pubDate: string;
}): Promise<ArticleRow> {
  const sourceName = extractSourceName(item.originallink || item.link);

  const { data: existing } = await supabaseAdmin
    .from("articles")
    .select("id")
    .eq("url", item.link)
    .maybeSingle();

  if (existing) {
    return { id: existing.id, title: item.title, description: item.description, sourceName, url: item.link };
  }

  const { data: inserted, error } = await supabaseAdmin
    .from("articles")
    .insert({
      source_name: sourceName,
      title: item.title,
      url: item.link,
      raw_content: item.description,
      published_at: new Date(item.pubDate).toISOString(),
    })
    .select("id")
    .single();
  if (error) throw error;

  return { id: inserted.id, title: item.title, description: item.description, sourceName, url: item.link };
}

function resolveArticleId(sourceId: string, articles: ArticleRow[]): ArticleRow | null {
  const match = sourceId.match(/\d+/);
  if (!match) return null;
  const idx = Number(match[0]) - 1;
  return articles[idx] ?? null;
}

async function main() {
  console.log("1/6 정치 뉴스 헤드라인 수집 중...");
  const broad = await searchNews("정치", 50);

  console.log("2/6 핵심 이슈 선정 중...");
  const issueRaw = await callClaude({
    model: MODELS.summarize,
    system: ISSUE_SELECTION_SYSTEM,
    user: issueSelectionUserPrompt(broad.map((a) => a.title)),
  });
  const issue = parseJsonResponse<IssueSelection>(issueRaw);
  console.log(`    -> "${issue.issue_title}" (검색어: ${issue.search_query})`);
  console.log(`    -> 선정 이유: ${issue.reason}`);

  console.log("3/6 관련 기사 수집 중...");
  const focused = await searchNews(issue.search_query, 12);
  const articles: ArticleRow[] = [];
  for (const item of focused) {
    articles.push(await upsertArticle(item));
  }
  const combinedContent = articles
    .map((a, i) => `[기사 ${i + 1}] (${a.sourceName}) ${a.title}\n${a.description}`)
    .join("\n\n");

  console.log("4/6 핵심 사실 추출 중...");
  const factsRaw = await callClaude({
    model: MODELS.extract,
    system: EXTRACTION_SYSTEM,
    user: extractionUserPrompt(combinedContent),
  });
  const facts = parseJsonResponse<ExtractedFacts>(factsRaw);

  console.log("5/6 여당/야당 입장 요약 생성 중...");
  const [proRaw, conRaw] = await Promise.all([
    callClaude({
      model: MODELS.summarize,
      system: STANCE_SYSTEM,
      user: stanceUserPrompt({
        partyName: `여당(${RULING_PARTY})`,
        stance: "찬성",
        sourceType: SUPPLEMENTARY_SOURCE_TYPE,
        content: combinedContent,
      }),
      maxTokens: 2500,
    }),
    callClaude({
      model: MODELS.summarize,
      system: STANCE_SYSTEM,
      user: stanceUserPrompt({
        partyName: `야당(${OPPOSITION_PARTY})`,
        stance: "반대",
        sourceType: SUPPLEMENTARY_SOURCE_TYPE,
        content: combinedContent,
      }),
      maxTokens: 2500,
    }),
  ]);
  const pro = parseJsonResponse<StanceResult>(proRaw);
  const con = parseJsonResponse<StanceResult>(conRaw);

  console.log("6/6 편향 검증 중...");
  const biasRaw = await callClaude({
    model: MODELS.audit,
    system: BIAS_CHECK_SYSTEM,
    user: biasCheckUserPrompt({
      proSummary: JSON.stringify(pro),
      conSummary: JSON.stringify(con),
    }),
    maxTokens: 2000,
  });
  const bias = parseJsonResponse<BiasCheckResult>(biasRaw);
  console.log(`    -> ${bias.recommendation}${bias.issues.length ? ": " + bias.issues.join(", ") : ""}`);

  const publishedDate = new Date().toISOString().slice(0, 10);
  const { data: card, error: cardError } = await supabaseAdmin
    .from("summary_cards")
    .upsert(
      {
        issue_title: issue.issue_title,
        issue_summary: facts.core_facts,
        pro_stance_summary: pro.stance_summary,
        con_stance_summary: con.stance_summary,
        bias_check_passed: bias.balanced,
        published_date: publishedDate,
      },
      { onConflict: "published_date" },
    )
    .select("id")
    .single();
  if (cardError) throw cardError;

  // 재실행 시 이전 근거/인물 매핑을 정리하고 새로 채운다.
  await supabaseAdmin.from("summary_card_citations").delete().eq("summary_card_id", card.id);
  await supabaseAdmin.from("summary_card_figures").delete().eq("summary_card_id", card.id);

  const citationRows = [
    ...pro.citations.map((c) => ({ stance: "pro" as const, ...c })),
    ...con.citations.map((c) => ({ stance: "con" as const, ...c })),
  ];
  for (const c of citationRows) {
    const article = resolveArticleId(c.source_id, articles);
    const { error } = await supabaseAdmin.from("summary_card_citations").insert({
      summary_card_id: card.id,
      stance: c.stance,
      sentence_text: c.sentence,
      source_type: "article",
      article_id: article?.id ?? null,
      source_url: article?.url ?? null,
    });
    if (error) throw error;
  }

  const peopleNames = facts.people.map((p) => p.name).filter(Boolean);
  if (peopleNames.length > 0) {
    const { data: matchedMembers } = await supabaseAdmin
      .from("members")
      .select("id, name")
      .in("name", peopleNames);
    for (const m of matchedMembers ?? []) {
      await supabaseAdmin.from("summary_card_figures").insert({ summary_card_id: card.id, member_id: m.id });
    }
  }

  console.log(`\n완료: 요약카드 생성됨 (id: ${card.id}, published_date: ${publishedDate})`);
}

main().catch((err) => {
  console.error(err);
  process.exit(1);
});
