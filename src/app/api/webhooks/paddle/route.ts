import { NextResponse, type NextRequest } from "next/server";
import { getPaddleClient } from "@/lib/paddle/server";
import { supabaseAdmin } from "@/lib/supabase/admin";

const ACTIVE_STATUSES = new Set(["active", "trialing", "past_due"]);

function mapPlan(interval: string | undefined): "월간" | "연간" {
  return interval === "year" ? "연간" : "월간";
}

export async function POST(request: NextRequest) {
  const signature = request.headers.get("paddle-signature");
  const secret = process.env.PADDLE_WEBHOOK_SECRET;
  const rawBody = await request.text();

  if (!signature || !secret) {
    return NextResponse.json({ error: "missing signature or secret" }, { status: 400 });
  }

  const paddle = getPaddleClient();
  let event;
  try {
    event = await paddle.webhooks.unmarshal(rawBody, secret, signature);
  } catch (err) {
    console.error("[paddle webhook] 서명 검증 실패", err);
    return NextResponse.json({ error: "invalid signature" }, { status: 400 });
  }
  if (!event) {
    return NextResponse.json({ error: "unrecognized event" }, { status: 400 });
  }

  switch (event.eventType) {
    case "subscription.created":
    case "subscription.updated":
    case "subscription.activated":
    case "subscription.trialing":
    case "subscription.past_due":
    case "subscription.paused":
    case "subscription.canceled": {
      const sub = event.data;
      const userId = sub.customData?.userId as string | undefined;
      if (!userId) {
        console.error("[paddle webhook] subscription 이벤트에 customData.userId 없음", sub.id);
        break;
      }

      const { error: subError } = await supabaseAdmin.from("subscriptions").upsert(
        {
          user_id: userId,
          payment_provider: "paddle",
          provider_customer_id: sub.customerId,
          provider_subscription_id: sub.id,
          plan: mapPlan(sub.billingCycle?.interval),
          status: sub.status,
          current_period_end: sub.currentBillingPeriod?.endsAt ?? null,
          updated_at: new Date().toISOString(),
        },
        { onConflict: "provider_subscription_id" },
      );
      if (subError) throw subError;

      const { error: userError } = await supabaseAdmin
        .from("users")
        .update({ tier: ACTIVE_STATUSES.has(sub.status) ? "유료" : "무료" })
        .eq("id", userId);
      if (userError) throw userError;
      break;
    }

    case "transaction.completed": {
      const tx = event.data;
      // 구독 갱신 결제는 subscription.* 이벤트에서 상태를 반영하므로 기부로 중복 기록하지 않음.
      if (tx.subscriptionId) break;

      const amount = tx.details?.totals?.grandTotal;
      if (!amount) break;

      const { error } = await supabaseAdmin.from("donations").upsert(
        {
          user_id: (tx.customData?.userId as string | undefined) ?? null,
          payment_provider: "paddle",
          provider_transaction_id: tx.id,
          amount_cents: Number(amount),
          currency: tx.currencyCode,
          donor_display_name: (tx.customData?.donorName as string | undefined) ?? null,
        },
        { onConflict: "provider_transaction_id" },
      );
      if (error) throw error;
      break;
    }

    default:
      break;
  }

  return NextResponse.json({ received: true });
}
