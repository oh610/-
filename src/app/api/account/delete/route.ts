import { NextResponse } from "next/server";
import { createClient } from "@/lib/supabase/server";
import { getPaddleClient } from "@/lib/paddle/server";
import { supabaseAdmin } from "@/lib/supabase/admin";

const ACTIVE_STATUSES = new Set(["active", "trialing", "past_due", "paused"]);

export async function POST() {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) {
    return NextResponse.json({ error: "로그인이 필요합니다." }, { status: 401 });
  }

  const { data: subscriptions } = await supabaseAdmin
    .from("subscriptions")
    .select("provider_subscription_id, status")
    .eq("user_id", user.id);

  const paddle = getPaddleClient();
  for (const sub of subscriptions ?? []) {
    if (!ACTIVE_STATUSES.has(sub.status)) continue;
    try {
      await paddle.subscriptions.cancel(sub.provider_subscription_id, { effectiveFrom: "immediately" });
    } catch (err) {
      console.error("[account delete] 구독 해지 실패", sub.provider_subscription_id, err);
      return NextResponse.json({ error: "구독 해지에 실패했습니다. 잠시 후 다시 시도해 주세요." }, { status: 500 });
    }
  }

  const { error: deleteError } = await supabaseAdmin.auth.admin.deleteUser(user.id);
  if (deleteError) {
    console.error("[account delete] 계정 삭제 실패", deleteError);
    return NextResponse.json({ error: "회원 탈퇴에 실패했습니다." }, { status: 500 });
  }

  return NextResponse.json({ ok: true });
}
