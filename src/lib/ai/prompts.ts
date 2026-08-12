// PRD 6.4 프롬프트 문안(초안)을 그대로 구현. ISSUE_SELECTION_*은 "오늘의 이슈 자동 선정"을 위해 추가.

export const ISSUE_SELECTION_SYSTEM =
  "당신은 오늘의 한국 정치 뉴스 헤드라인을 분석해, 여당과 야당이 서로 다른 입장을 보일 만한 핵심 이슈 하나를 고르는 도구입니다.";

export function issueSelectionUserPrompt(headlines: string[]): string {
  return `아래는 오늘 수집된 정치 뉴스 헤드라인 목록이다. 다음 두 기준을 모두 만족하는 이슈 하나를 선정하라.

1. 가장 여러 매체에서 반복적으로 다루는 비중 있는 이슈일 것 (보도량 우선)
2. 여당과 야당이 서로 다른(찬성/반대) 입장을 보일 만한 이슈일 것 — 특정 정당의 당내 경선·인사·행사처럼 여야 대립 구도가 아닌 사안은 보도량이 많아도 제외하라

두 기준을 동시에 만족하는 이슈가 여럿이면 보도량이 가장 많은 것을 고르고, 하나도 없으면 그나마 여야 입장차가 있을 법한 이슈를 최선으로 골라라.

[헤드라인 목록]
${headlines.map((h, i) => `${i + 1}. ${h}`).join("\n")}

다음 JSON 형식으로만 응답하라 (설명 문구 없이 JSON만):
{
  "issue_title": "이슈를 한 문장으로 요약한 제목",
  "search_query": "이 이슈 관련 기사를 다시 검색할 때 쓸 핵심 검색어 (2~5단어)",
  "reason": "이 이슈를 고른 이유 (여야 대립 구도가 무엇인지 1문장)"
}`;
}

// ① 추출 단계
export const EXTRACTION_SYSTEM = `당신은 정치 뉴스/공식 자료에서 사실관계만 추출하는 도구입니다.
의견, 해석, 평가를 추가하지 마세요. 자료에 없는 내용은 절대 추측하지 마세요.
자료가 부족하거나 비어 있더라도 절대 자연어로 답하지 말고, 반드시 지정된 JSON 형식으로만 응답하세요.
그런 경우 core_facts에 "자료 부족으로 사실 확인 불가"라고 적으세요.`;

export function extractionUserPrompt(content: string): string {
  return `아래 자료에서 다음을 JSON으로 추출하라:
- 핵심 사실 (누가, 언제, 무엇을 했는가)
- 관련 인물 (이름, 소속)
- 날짜
- 자료에 명시되지 않은 항목은 반드시 "정보 없음"으로 표시할 것

다음 JSON 형식으로만 응답하라 (설명 문구 없이 JSON만):
{
  "core_facts": "2~4문장",
  "people": [{ "name": "string", "affiliation": "string" }],
  "dates": ["string"]
}

[자료]
${content}`;
}

// ② 진영별 요약 (여당/야당 동일 템플릿 — 원칙 4)
export const STANCE_SYSTEM = `당신은 특정 정당의 입장을 요약하는 도구입니다.
반드시 아래 [제공 자료]에 근거해서만 답하십시오.
자료에 없는 내용을 당신의 사전 지식이나 "이 정당은 보통 이렇게 생각할 것"이라는
추측으로 채우지 마십시오. 자료가 부족하면 부족하다고 명시하십시오.
자료가 부족하거나 비어 있더라도 절대 자연어로 답하지 말고, 반드시 지정된 JSON 형식으로만 응답하십시오.`;

export function stanceUserPrompt(params: {
  partyName: string;
  stance: "찬성" | "반대";
  sourceType: string;
  content: string;
}): string {
  return `정당: ${params.partyName} (${params.stance})
근거 유형: ${params.sourceType}

[제공 자료]
${params.content}

다음 JSON 형식으로만 응답하라 (설명 문구 없이 JSON만):
{
  "stance_summary": "3~5문장 요약",
  "citations": [
    { "sentence": "요약 내 문장", "source_id": "제공 자료의 [기사 N] 번호(예: \\"1\\")" }
  ]
}
citations의 각 문장은 반드시 제공 자료에서 직접 확인 가능한 내용이어야 한다.`;
}

// ③ 2차 편향 검증
export const BIAS_CHECK_SYSTEM = `당신은 요약의 균형성을 검증하는 감사자입니다.
요약 내용을 직접 수정하지 말고, 문제를 발견하면 지적만 하십시오.`;

export function biasCheckUserPrompt(params: { proSummary: string; conSummary: string }): string {
  return `아래는 여당 요약과 야당 요약, 그리고 각 요약의 근거 메타데이터(출처 종류, 인용 문장 수)이다.

[여당 요약 + 메타데이터]
${params.proSummary}

[야당 요약 + 메타데이터]
${params.conSummary}

다음을 점검하고 JSON으로만 응답하라 (설명 문구 없이 JSON만):
1. 양측 요약의 분량과 논조가 균형적인가?
2. 특정 매체나 출처에 근거가 과도하게 편중되어 있는가?
3. 요약 문장이 제공된 근거 범위를 벗어나 추측하지 않았는가?
4. source_type이 "보조 근거"인데 마치 공식 입장처럼 서술되지 않았는가?

{
  "balanced": true,
  "issues": ["구체적 문제점"],
  "recommendation": "게시 가능"
}`;
}
