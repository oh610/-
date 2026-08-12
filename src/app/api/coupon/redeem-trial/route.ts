import { NextResponse, type NextRequest } from "next/server";
import { createClient } from "@/lib/supabase/server";

const TRIAL_DAYS = 7;

export async function POST(request: NextRequest) {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) {
    return NextResponse.json({ error: "로그인이 필요합니다." }, { status: 401 });
  }

  const body = await request.json().catch(() => null);
  const code = typeof body?.code === "string" ? body.code.trim().toUpperCase() : "";
  if (!code) {
    return NextResponse.json({ error: "쿠폰 코드를 입력해 주세요." }, { status: 400 });
  }

  const { data: profile } = await supabase
    .from("users")
    .select("trial_coupon_code, trial_redeemed_at")
    .eq("id", user.id)
    .maybeSingle();

  if (!profile?.trial_coupon_code || profile.trial_coupon_code.toUpperCase() !== code) {
    return NextResponse.json({ error: "유효하지 않은 쿠폰 코드입니다." }, { status: 400 });
  }
  if (profile.trial_redeemed_at) {
    return NextResponse.json({ error: "이미 사용한 쿠폰입니다." }, { status: 400 });
  }

  const now = new Date();
  const expiresAt = new Date(now.getTime() + TRIAL_DAYS * 24 * 60 * 60 * 1000);

  const { error } = await supabase
    .from("users")
    .update({ trial_redeemed_at: now.toISOString(), trial_expires_at: expiresAt.toISOString() })
    .eq("id", user.id);
  if (error) {
    return NextResponse.json({ error: "쿠폰 적용에 실패했습니다." }, { status: 500 });
  }

  return NextResponse.json({ ok: true, expiresAt: expiresAt.toISOString() });
}
