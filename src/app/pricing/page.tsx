import type { Metadata } from "next";
import { createClient } from "@/lib/supabase/server";
import { CustomSubscribeForm } from "@/components/CustomSubscribeForm";
import { DiscountCouponForm } from "@/components/DiscountCouponForm";
import { hasFullAccess } from "@/lib/access";

export const metadata: Metadata = {
  title: "요금제",
  description: "원하는 금액으로 매달 자동 결제되는 자율구독. 광고 없이, 지난 뉴스 요약까지 이용할 수 있어요.",
};

export default async function PricingPage() {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  let tier: string | null = null;
  let isAdmin = false;
  let trialExpiresAt: string | null = null;
  let discountCouponCode: string | null = null;
  if (user) {
    const { data } = await supabase
      .from("users")
      .select("tier, is_admin, trial_expires_at, discount_coupon_code, discount_coupon_redeemed_at")
      .eq("id", user.id)
      .maybeSingle();
    tier = data?.tier ?? null;
    isAdmin = data?.is_admin ?? false;
    trialExpiresAt = data?.trial_expires_at ?? null;
    if (data?.discount_coupon_code && !data.discount_coupon_redeemed_at) {
      discountCouponCode = data.discount_coupon_code;
    }
  }
  const access = hasFullAccess(tier, isAdmin, trialExpiresAt);

  return (
    <div className="flex min-h-screen flex-col items-center bg-zinc-50 px-4 py-16 dark:bg-black">
      <main className="w-full max-w-md">
        <h1 className="mb-2 text-3xl font-bold text-zinc-950 dark:text-zinc-50">요금제</h1>
        <p className="mb-6 text-sm text-zinc-500 dark:text-zinc-400">
          {isAdmin
            ? "관리자 계정입니다. 구독 없이도 모든 콘텐츠를 이용할 수 있어요."
            : access
              ? "현재 유료 구독 중입니다. 광고 없이, 지난 뉴스 요약도 모두 이용하고 계세요."
              : "무료로도 오늘의 요약을 보실 수 있어요. 광고 없이, 지난 뉴스 요약까지 보시려면 구독해 주세요."}
        </p>

        {discountCouponCode && <DiscountCouponForm code={discountCouponCode} />}

        <section className="rounded-2xl border-2 border-violet-500 bg-white p-6 shadow-md dark:bg-zinc-950">
          <h2 className="text-sm font-semibold text-zinc-500 dark:text-zinc-400">자율구독</h2>
          <p className="mt-2 text-3xl font-bold text-zinc-950 dark:text-zinc-50">
            원하는 금액<span className="text-sm font-normal text-zinc-500 dark:text-zinc-400"> / 월</span>
          </p>
          <p className="mt-3 text-sm text-zinc-500 dark:text-zinc-400">매달 원하시는 금액으로 자동 결제, 언제든 해지 가능</p>
          <p className="mt-1 mb-4 text-sm text-zinc-500 dark:text-zinc-400">광고 없이, 지난 요약까지 이용</p>
          <CustomSubscribeForm userId={user?.id ?? null} />
        </section>
      </main>
    </div>
  );
}
