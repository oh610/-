import Link from "next/link";
import { redirect } from "next/navigation";
import { createClient } from "@/lib/supabase/server";
import { NicknameForm } from "@/components/mypage/NicknameForm";
import { PasswordChangeForm } from "@/components/mypage/PasswordChangeForm";
import { UpdatePaymentMethodButton } from "@/components/mypage/UpdatePaymentMethodButton";
import { DeleteAccountForm } from "@/components/mypage/DeleteAccountForm";
import { TrialCouponRedeemForm } from "@/components/TrialCouponRedeemForm";

const ACTIVE_STATUSES = new Set(["active", "trialing", "past_due"]);

export default async function MyPage() {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) redirect("/login");

  const { data: profile } = await supabase
    .from("users")
    .select(
      "nickname, tier, trial_coupon_code, trial_redeemed_at, trial_expires_at, discount_coupon_code, discount_coupon_redeemed_at",
    )
    .eq("id", user.id)
    .maybeSingle();

  const { data: subscription } = await supabase
    .from("subscriptions")
    .select("plan, status, current_period_end")
    .eq("user_id", user.id)
    .order("created_at", { ascending: false })
    .limit(1)
    .maybeSingle();

  const hasActiveSubscription = !!subscription && ACTIVE_STATUSES.has(subscription.status);

  return (
    <div className="flex min-h-screen flex-col items-center bg-zinc-50 px-4 py-16 dark:bg-black">
      <main className="w-full max-w-2xl">
        <h1 className="mb-8 text-3xl font-bold text-zinc-950 dark:text-zinc-50">마이페이지</h1>

        <section className="mb-6 rounded-2xl border border-zinc-200 bg-white p-6 dark:border-zinc-800 dark:bg-zinc-950">
          <h2 className="mb-1 text-lg font-semibold text-zinc-900 dark:text-zinc-50">기본 정보</h2>
          <p className="mb-4 text-sm text-zinc-500 dark:text-zinc-400">
            {user.email ?? "이메일 미제공 (소셜 로그인)"}
          </p>
          <NicknameForm userId={user.id} initialNickname={profile?.nickname ?? ""} />
        </section>

        <section className="mb-6 rounded-2xl border border-zinc-200 bg-white p-6 dark:border-zinc-800 dark:bg-zinc-950">
          <h2 className="mb-4 text-lg font-semibold text-zinc-900 dark:text-zinc-50">비밀번호 변경</h2>
          <PasswordChangeForm />
        </section>

        <section className="mb-6 rounded-2xl border border-zinc-200 bg-white p-6 dark:border-zinc-800 dark:bg-zinc-950">
          <h2 className="mb-1 text-lg font-semibold text-zinc-900 dark:text-zinc-50">결제 수단</h2>
          <p className="mb-4 text-sm text-zinc-500 dark:text-zinc-400">
            {hasActiveSubscription
              ? `현재 ${subscription!.plan} 구독 중입니다.`
              : "현재 구독 중인 결제 수단이 없습니다."}
          </p>
          {hasActiveSubscription ? (
            <UpdatePaymentMethodButton />
          ) : (
            <a
              href="/pricing"
              className="text-sm text-zinc-900 hover:underline dark:text-zinc-100"
            >
              요금제 보러 가기
            </a>
          )}
        </section>

        <section className="mb-6 rounded-2xl border border-zinc-200 bg-white p-6 dark:border-zinc-800 dark:bg-zinc-950">
          <h2 className="mb-1 text-lg font-semibold text-zinc-900 dark:text-zinc-50">쿠폰함</h2>

          {profile?.trial_redeemed_at ? (
            <p className="mt-3 text-sm text-zinc-600 dark:text-zinc-400">
              {profile.trial_expires_at && new Date(profile.trial_expires_at) > new Date()
                ? `체험 이용 중 · ${new Date(profile.trial_expires_at).toLocaleDateString("ko-KR")}까지`
                : "7일 무료 체험을 이미 사용했어요."}
            </p>
          ) : profile?.trial_coupon_code ? (
            <div className="mt-3">
              <p className="mb-2 text-sm text-zinc-600 dark:text-zinc-400">
                7일 무료 체험 쿠폰이 아직 남아있어요. 지금 적용하면 그 순간부터 일주일간 유료 기능을 이용할 수 있어요.
              </p>
              <TrialCouponRedeemForm code={profile.trial_coupon_code} />
            </div>
          ) : null}

          {profile?.discount_coupon_code && (
            <div className="mt-4 border-t border-zinc-200 pt-4 dark:border-zinc-800">
              {profile.discount_coupon_redeemed_at ? (
                <p className="text-sm text-zinc-600 dark:text-zinc-400">20% 할인 쿠폰을 이미 사용했어요.</p>
              ) : (
                <p className="text-sm text-zinc-600 dark:text-zinc-400">
                  20% 할인(3개월) 쿠폰이 도착했어요.{" "}
                  <Link href="/pricing" className="font-medium text-violet-600 hover:underline dark:text-violet-400">
                    요금제에서 사용하기
                  </Link>
                </p>
              )}
            </div>
          )}
        </section>

        <section className="rounded-2xl border border-rose-200 bg-white p-6 dark:border-rose-900/50 dark:bg-zinc-950">
          <h2 className="mb-4 text-lg font-semibold text-zinc-900 dark:text-zinc-50">회원 탈퇴</h2>
          <DeleteAccountForm />
        </section>
      </main>
    </div>
  );
}
