import { NextResponse } from "next/server";
import { createClient } from "@/lib/supabase/server";

export async function POST() {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) {
    return NextResponse.json({ error: "로그인이 필요합니다." }, { status: 401 });
  }

  const { data: profile } = await supabase
    .from("users")
    .select("trial_coupon_shown_at")
    .eq("id", user.id)
    .maybeSingle();

  if (!profile?.trial_coupon_shown_at) {
    await supabase.from("users").update({ trial_coupon_shown_at: new Date().toISOString() }).eq("id", user.id);
  }

  return NextResponse.json({ ok: true });
}
