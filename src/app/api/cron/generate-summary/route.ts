import { NextResponse, type NextRequest } from "next/server";
import { generateDailySummary } from "@/lib/pipeline/generate-summary";

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
  try {
    const result = await generateDailySummary((msg) => logs.push(msg));
    return NextResponse.json({ ok: true, result, logs });
  } catch (err) {
    console.error("[cron generate-summary]", err, logs.join("\n"));
    return NextResponse.json(
      { ok: false, error: err instanceof Error ? err.message : String(err), logs },
      { status: 500 },
    );
  }
}
