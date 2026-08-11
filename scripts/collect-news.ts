import "./_env";
import { searchNews } from "@/lib/collectors/naver-news";
import { supabaseAdmin } from "@/lib/supabase/admin";

function extractSourceName(url: string): string {
  try {
    return new URL(url).hostname.replace(/^www\./, "");
  } catch {
    return "unknown";
  }
}

async function main() {
  const query = process.argv[2];
  if (!query) {
    console.error('사용법: npm run collect:news -- "검색어"');
    process.exit(1);
  }

  console.log(`"${query}" 관련 뉴스 검색 중...`);
  const items = await searchNews(query, 20);
  console.log(`${items.length}건 조회됨`);

  let inserted = 0;
  let skipped = 0;

  for (const item of items) {
    const { data: existing, error: selectError } = await supabaseAdmin
      .from("articles")
      .select("id")
      .eq("url", item.link)
      .maybeSingle();
    if (selectError) throw selectError;

    if (existing) {
      skipped += 1;
      continue;
    }

    const { error: insertError } = await supabaseAdmin.from("articles").insert({
      source_name: extractSourceName(item.originallink || item.link),
      title: item.title,
      url: item.link,
      // Naver 검색 API는 발췌(description)만 제공 — 전체 원문 저장은 별도 본문 크롤러가 필요.
      raw_content: item.description,
      published_at: new Date(item.pubDate).toISOString(),
    });
    if (insertError) throw insertError;
    inserted += 1;
  }

  console.log(`\n완료: 신규 ${inserted}건, 중복 스킵 ${skipped}건`);
}

main().catch((err) => {
  console.error(err);
  process.exit(1);
});
