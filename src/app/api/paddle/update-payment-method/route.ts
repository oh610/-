import { NextResponse } from "next/server";
import { createClient } from "@/lib/supabase/server";
import { getPaddleClient } from "@/lib/paddle/server";

const ACTIVE_STATUSES = new Set(["active", "trialing", "past_due"]);

export async function POST() {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) {
    return NextResponse.json({ error: "로그인이 필요합니다." }, { status: 401 });
  }

  const { data: subscription } = await supabase
    .from("subscriptions")
    .select("provider_subscription_id, status")
    .eq("user_id", user.id)
    .order("created_at", { ascending: false })
    .limit(1)
    .maybeSingle();

  if (!subscription || !ACTIVE_STATUSES.has(subscription.status)) {
    return NextResponse.json({ error: "변경할 구독 결제 수단이 없습니다." }, { status: 400 });
  }

  const paddle = getPaddleClient();
  const transaction = await paddle.subscriptions.getPaymentMethodChangeTransaction(
    subscription.provider_subscription_id,
  );

  return NextResponse.json({ transactionId: transaction.id });
}
