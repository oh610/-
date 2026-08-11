import type { SummaryCard } from "@/types/summary-card";

export const dummySummaryCard: SummaryCard = {
  id: "dummy-1",
  issueTitle: "예시 이슈: 국회 본회의 쟁점 법안 처리",
  issueSummary:
    "이것은 더미 데이터입니다. 실제 서비스에서는 매일 발행되는 정치 이슈 1건이 이 자리에 표시됩니다.",
  proStanceSummary:
    "여당 측은 해당 법안이 필요한 이유로 정책 효과와 시급성을 들어 찬성 입장을 밝혔습니다. (더미 텍스트)",
  conStanceSummary:
    "야당 측은 절차적 문제와 부작용 우려를 근거로 반대 입장을 밝혔습니다. (더미 텍스트)",
  biasCheckPassed: true,
  publishedDate: "2026-08-10",
  relatedFigures: [
    { id: "dummy-member-1", name: "홍길동 의원", partyName: "더불어민주당", ideology: "진보" },
    { id: "dummy-member-2", name: "김철수 의원", partyName: "국민의힘", ideology: "보수" },
  ],
  citations: [
    {
      id: "dummy-citation-1",
      stance: "pro",
      sentenceText: "여당은 정책 효과와 시급성을 근거로 법안 처리를 지지한다고 밝혔다. (더미)",
      sourceType: "press_release",
      sourceLabel: "더불어민주당 논평(더미)",
      sourceUrl: null,
    },
    {
      id: "dummy-citation-2",
      stance: "con",
      sentenceText: "야당은 절차적 문제를 지적하며 법안 처리에 반대한다고 밝혔다. (더미)",
      sourceType: "press_release",
      sourceLabel: "국민의힘 논평(더미)",
      sourceUrl: null,
    },
  ],
};
