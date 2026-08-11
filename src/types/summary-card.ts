export type SummaryCardCitation = {
  id: string;
  stance: "pro" | "con" | "neutral";
  sentenceText: string;
  sourceType: "press_release" | "article" | "member_statement";
  sourceLabel: string | null;
  sourceUrl: string | null;
};

export type SummaryCardFigure = {
  id: string;
  name: string;
  partyName: string | null;
  ideology: "진보" | "보수" | null;
};

export type SummaryCard = {
  id: string;
  issueTitle: string;
  issueSummary: string;
  proStanceSummary: string;
  conStanceSummary: string;
  biasCheckPassed: boolean;
  publishedDate: string;
  relatedFigures: SummaryCardFigure[];
  citations: SummaryCardCitation[];
};
