import type { Metadata } from "next";
import { createClient } from "@/lib/supabase/server";
import { CustomSubscribeForm } from "@/components/CustomSubscribeForm";
import { DiscountCouponForm } from "@/components/DiscountCouponForm";
import { hasFullAccess } from "@/lib/access";

export const metadata: Metadata = {
  title: "요금제",
  description: "광고 없는 화면과 키워드 검색 요약을 가장 먼저 만나는 자율구독으로 정론관을 응원해 주세요.",
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
              ? "광고 없이 정론관을 이용해 주셔서 감사해요. 앞으로 선보일 키워드 검색 요약도 가장 먼저 만나보실 수 있어요."
              : "오늘의 요약과 지난 요약 모두 무료로 보실 수 있어요. 광고 없는 화면과 키워드 검색 요약을 가장 먼저 만나고 싶다면 자율구독으로 응원해 주세요."}
        </p>

        {discountCouponCode && <DiscountCouponForm code={discountCouponCode} />}

        <section className="rounded-2xl border-2 border-violet-500 bg-white p-6 shadow-md dark:bg-zinc-950">
          <h2 className="text-sm font-semibold text-zinc-500 dark:text-zinc-400">자율구독</h2>
          <p className="mt-2 text-3xl font-bold text-zinc-950 dark:text-zinc-50">
            원하는 금액<span className="text-sm font-normal text-zinc-500 dark:text-zinc-400"> / 월</span>
          </p>
          <p className="mt-3 text-sm text-zinc-500 dark:text-zinc-400">매달 원하시는 금액으로 자동 결제, 언제든 해지 가능</p>
          <ul className="mt-4 mb-5 flex flex-col gap-2 text-sm text-zinc-600 dark:text-zinc-400">
            <li className="flex items-start gap-2">
              <span aria-hidden>✨</span>
              <span>광고 없는 깨끗한 화면으로 뉴스를 봐요</span>
            </li>
            <li className="flex items-start gap-2">
              <span aria-hidden>🔍</span>
              <span>원하는 키워드를 검색해 바로 요약받는 기능을 구독자에게 가장 먼저 열어드려요 (출시 예정)</span>
            </li>
            <li className="flex items-start gap-2">
              <span aria-hidden>💜</span>
              <span>정론관이 광고 없이도 계속 운영될 수 있도록 돕는 후원이 돼요</span>
            </li>
          </ul>
          <CustomSubscribeForm userId={user?.id ?? null} />
        </section>
      </main>
    </div>
  );
}
