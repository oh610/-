import { NextResponse, type NextRequest } from "next/server";
import { supabaseAdmin } from "@/lib/supabase/admin";
import { getPaddleClient } from "@/lib/paddle/server";

export const runtime = "nodejs";
export const maxDuration = 60;
export const dynamic = "force-dynamic";

const NORMAL_MONTHLY_PRICE_ID = process.env.NEXT_PUBLIC_PADDLE_PRICE_MONTHLY;

function generateCode(): string {
  return Math.random().toString(36).slice(2, 10).toUpperCase();
}

async function issueExpiredTrialDiscounts(log: (msg: string) => void) {
  const { data: users } = await supabaseAdmin
    .from("users")
    .select("id")
    .not("trial_expires_at", "is", null)
    .lte("trial_expires_at", new Date().toISOString())
    .is("discount_coupon_code", null);

  for (const u of users ?? []) {
    const code = generateCode();
    await supabaseAdmin
      .from("users")
      .update({ discount_coupon_code: code, discount_coupon_issued_at: new Date().toISOString() })
      .eq("id", u.id);
    log(`할인 쿠폰 발급: user=${u.id} code=${code}`);
  }
}

async function revertExpiredDiscounts(log: (msg: string) => void) {
  if (!NORMAL_MONTHLY_PRICE_ID) {
    log("NEXT_PUBLIC_PADDLE_PRICE_MONTHLY가 설정되지 않아 할인 만료 처리를 건너뜁니다.");
    return;
  }

  const { data: subs } = await supabaseAdmin
    .from("subscriptions")
    .select("id, provider_subscription_id")
    .not("discount_expires_at", "is", null)
    .lte("discount_expires_at", new Date().toISOString())
    .eq("status", "active");

  const paddle = getPaddleClient();
  for (const s of subs ?? []) {
    try {
      await paddle.subscriptions.update(s.provider_subscription_id, {
        items: [{ priceId: NORMAL_MONTHLY_PRICE_ID, quantity: 1 }],
        prorationBillingMode: "full_next_billing_period",
      });
      await supabaseAdmin.from("subscriptions").update({ discount_expires_at: null }).eq("id", s.id);
      log(`할인 종료, 정상가로 전환: subscription=${s.provider_subscription_id}`);
    } catch (err) {
      log(`할인 종료 처리 실패: subscription=${s.provider_subscription_id} ${err instanceof Error ? err.message : String(err)}`);
    }
  }
}

export async function GET(request: NextRequest) {
  const secret = process.env.CRON_SECRET;
  const authHeader = request.headers.get("authorization");
  if (!secret || authHeader !== `Bearer ${secret}`) {
    return NextResponse.json({ error: "unauthorized" }, { status: 401 });
  }

  const logs: string[] = [];
  const log = (msg: string) => logs.push(msg);

  try {
    await issueExpiredTrialDiscounts(log);
    await revertExpiredDiscounts(log);
    return NextResponse.json({ ok: true, logs });
  } catch (err) {
    console.error("[cron coupons]", err, logs.join("\n"));
    return NextResponse.json(
      { ok: false, error: err instanceof Error ? err.message : String(err), logs },
      { status: 500 },
    );
  }
}
