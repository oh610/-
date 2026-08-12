import { supabase } from "@/lib/supabase/client";
import type { SummaryCard, SummaryCardCitation, SummaryCardFigure } from "@/types/summary-card";

function one<T>(value: T | T[] | null): T | null {
  return Array.isArray(value) ? value[0] ?? null : value;
}

export type SummaryCardListItem = {
  id: string;
  issueTitle: string;
  publishedDate: string;
  biasCheckPassed: boolean;
};

export async function getAllSummaryCards(): Promise<SummaryCardListItem[]> {
  const { data, error } = await supabase
    .from("summary_cards")
    .select("id, issue_title, published_date, bias_check_passed")
    .order("published_date", { ascending: false });

  if (error) {
    console.error("[getAllSummaryCards]", error);
    return [];
  }

  return (data ?? []).map((row) => ({
    id: row.id,
    issueTitle: row.issue_title,
    publishedDate: row.published_date,
    biasCheckPassed: row.bias_check_passed,
  }));
}

export async function getLatestSummaryCard(): Promise<SummaryCard | null> {
  const { data: card, error } = await supabase
    .from("summary_cards")
    .select("*")
    .order("published_date", { ascending: false })
    .limit(1)
    .maybeSingle();

  if (error) console.error("[getLatestSummaryCard]", error);
  if (error || !card) return null;

  return buildSummaryCard(card);
}

export async function getPastSummaryCards(excludeId: string, limit = 10): Promise<SummaryCard[]> {
  const { data, error } = await supabase
    .from("summary_cards")
    .select("*")
    .neq("id", excludeId)
    .order("published_date", { ascending: false })
    .limit(limit);

  if (error) {
    console.error("[getPastSummaryCards]", error);
    return [];
  }

  return Promise.all((data ?? []).map((card) => buildSummaryCard(card)));
}

export async function getSummaryCardById(id: string): Promise<SummaryCard | null> {
  const { data: card, error } = await supabase
    .from("summary_cards")
    .select("*")
    .eq("id", id)
    .maybeSingle();

  if (error) console.error("[getSummaryCardById]", error);
  if (error || !card) return null;

  return buildSummaryCard(card);
}

async function buildSummaryCard(card: {
  id: string;
  issue_title: string;
  issue_summary: string;
  pro_stance_summary: string;
  con_stance_summary: string;
  bias_check_passed: boolean;
  published_date: string;
}): Promise<SummaryCard> {
  const [{ data: figureRows }, { data: citationRows }] = await Promise.all([
    supabase
      .from("summary_card_figures")
      .select("members(id, name, parties(name, ideology))")
      .eq("summary_card_id", card.id),
    supabase
      .from("summary_card_citations")
      .select("id, stance, sentence_text, source_type, source_url, press_releases(title), articles(source_name)")
      .eq("summary_card_id", card.id),
  ]);

  const relatedFigures: SummaryCardFigure[] = (figureRows ?? [])
    .map((row) => {
      const member = one(row.members as unknown as { id: string; name: string; parties: unknown } | { id: string; name: string; parties: unknown }[] | null);
      if (!member) return null;
      const party = one(member.parties as { name: string; ideology: "진보" | "보수" } | { name: string; ideology: "진보" | "보수" }[] | null);
      const figure: SummaryCardFigure = {
        id: member.id,
        name: member.name,
        partyName: party?.name ?? null,
        ideology: party?.ideology ?? null,
      };
      return figure;
    })
    .filter((f): f is SummaryCardFigure => f !== null);

  const citations: SummaryCardCitation[] = (citationRows ?? []).map((row) => {
    const pressRelease = one(row.press_releases as unknown as { title: string } | { title: string }[] | null);
    const article = one(row.articles as unknown as { source_name: string } | { source_name: string }[] | null);
    return {
      id: row.id,
      stance: row.stance,
      sentenceText: row.sentence_text,
      sourceType: row.source_type,
      sourceLabel: pressRelease?.title ?? article?.source_name ?? null,
      sourceUrl: row.source_url,
    };
  });

  return {
    id: card.id,
    issueTitle: card.issue_title,
    issueSummary: card.issue_summary,
    proStanceSummary: card.pro_stance_summary,
    conStanceSummary: card.con_stance_summary,
    biasCheckPassed: card.bias_check_passed,
    publishedDate: card.published_date,
    relatedFigures,
    citations,
  };
}
