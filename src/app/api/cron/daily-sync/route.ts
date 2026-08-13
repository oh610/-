import { NextResponse, type NextRequest } from "next/server";
import { generateDailySummary } from "@/lib/pipeline/generate-summary";
import { syncBills } from "@/lib/pipeline/sync-bills";
import { syncMemberMentions } from "@/lib/pipeline/sync-member-mentions";

export const runtime = "nodejs";
export const maxDuration = 300;
export const dynamic = "force-dynamic";

export async function GET(request: NextRequest) {
  const secret = process.env.CRON_SECRET;
  const authHeader = request.headers.get("authorization");
  if (!secret || authHeader !== `Bearer ${secret}`) {
    return NextResponse.json({ error: "unauthorized" }, { status: 401 });
  }

  const logs: string[] = [];
  const errors: string[] = [];

  try {
    await generateDailySummary((msg) => logs.push(`[summary] ${msg}`));
  } catch (err) {
    const message = err instanceof Error ? err.message : String(err);
    console.error("[cron daily-sync] summary 실패", err);
    errors.push(`요약 생성 실패: ${message}`);
  }

  try {
    await syncBills(100, (msg) => logs.push(`[bills] ${msg}`));
  } catch (err) {
    const message = err instanceof Error ? err.message : String(err);
    console.error("[cron daily-sync] bills sync 실패", err);
    errors.push(`법안 동기화 실패: ${message}`);
  }

  try {
    await syncMemberMentions((msg) => logs.push(`[member-mentions] ${msg}`));
  } catch (err) {
    const message = err instanceof Error ? err.message : String(err);
    console.error("[cron daily-sync] 의원 언급량 동기화 실패", err);
    errors.push(`의원 언급량 동기화 실패: ${message}`);
  }

  return NextResponse.json({ ok: errors.length === 0, errors, logs }, { status: errors.length === 0 ? 200 : 500 });
}
