import Anthropic from "@anthropic-ai/sdk";

let client: Anthropic | null = null;

function getClient(): Anthropic {
  if (!client) {
    const apiKey = process.env.ANTHROPIC_API_KEY;
    if (!apiKey) throw new Error("ANTHROPIC_API_KEY is not set");
    client = new Anthropic({ apiKey });
  }
  return client;
}

// PRD 6.2: 작업 등급별 모델 분리 (추출=경량, 요약=중간, 검증=고성능).
export const MODELS = {
  extract: "claude-haiku-4-5-20251001",
  summarize: "claude-sonnet-5",
  audit: "claude-opus-5",
} as const;

export async function callClaude(params: {
  model: string;
  system: string;
  user: string;
  maxTokens?: number;
}): Promise<string> {
  const res = await getClient().messages.create({
    model: params.model,
    max_tokens: params.maxTokens ?? 1500,
    system: params.system,
    messages: [{ role: "user", content: params.user }],
  });

  if (res.stop_reason === "max_tokens") {
    console.warn(`[callClaude] max_tokens(${params.maxTokens ?? 1500})에 도달해 응답이 잘렸을 수 있습니다.`);
  }

  const block = res.content.find((b) => b.type === "text");
  if (!block || block.type !== "text") {
    console.error("[callClaude] stop_reason:", res.stop_reason, "content:", JSON.stringify(res.content));
    throw new Error("Claude 응답에 텍스트 블록이 없습니다.");
  }
  return block.text;
}

export function parseJsonResponse<T>(text: string): T {
  const cleaned = text
    .trim()
    .replace(/^```(json)?/i, "")
    .replace(/```$/, "")
    .trim();
  try {
    return JSON.parse(cleaned) as T;
  } catch (err) {
    console.error("[parseJsonResponse] 원본 응답:\n", text);
    throw err;
  }
}
