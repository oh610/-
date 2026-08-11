import { createClient } from "@/lib/supabase/server";
import { CheckoutButton } from "@/components/CheckoutButton";
import { DonateForm } from "@/components/DonateForm";

const MONTHLY_PRICE_ID = process.env.NEXT_PUBLIC_PADDLE_PRICE_MONTHLY;
const ANNUAL_PRICE_ID = process.env.NEXT_PUBLIC_PADDLE_PRICE_ANNUAL;

export default async function PricingPage() {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  let tier: string | null = null;
  if (user) {
    const { data } = await supabase.from("users").select("tier").eq("id", user.id).maybeSingle();
    tier = data?.tier ?? null;
  }

  const buttonClass =
    "mt-4 w-full rounded-lg bg-zinc-900 px-4 py-2 text-sm font-medium text-white disabled:opacity-50 dark:bg-zinc-100 dark:text-zinc-900";

  return (
    <div className="flex min-h-screen flex-col items-center bg-zinc-50 px-4 py-16 dark:bg-black">
      <main className="w-full max-w-2xl">
        <h1 className="mb-2 text-2xl font-bold text-zinc-900 dark:text-zinc-50">요금제</h1>
        <p className="mb-8 text-sm text-zinc-500 dark:text-zinc-400">
          {tier === "유료"
            ? "현재 유료 구독 중입니다. 광고 없이 이용하고 계세요."
            : "무료로도 모든 요약을 보실 수 있어요. 서비스 운영을 응원하고 싶으시면 구독하거나 후원해 주세요."}
        </p>

        <div className="grid gap-4 sm:grid-cols-2">
          <section className="rounded-2xl border border-zinc-200 bg-white p-6 dark:border-zinc-800 dark:bg-zinc-950">
            <h2 className="text-lg font-semibold text-zinc-900 dark:text-zinc-50">월간 구독</h2>
            <p className="mt-1 text-2xl font-bold text-zinc-900 dark:text-zinc-50">
              4,900<span className="text-sm font-normal text-zinc-500 dark:text-zinc-400">원 / 월</span>
            </p>
            <p className="mt-1 text-sm text-zinc-500 dark:text-zinc-400">매달 결제, 언제든 해지 가능</p>
            <p className="mt-1 text-sm text-zinc-500 dark:text-zinc-400">광고 없이 이용</p>
            <CheckoutButton
              priceId={MONTHLY_PRICE_ID}
              label="월간 구독하기"
              userId={user?.id ?? null}
              userEmail={user?.email ?? null}
              className={buttonClass}
            />
          </section>

          <section className="rounded-2xl border border-zinc-200 bg-white p-6 dark:border-zinc-800 dark:bg-zinc-950">
            <h2 className="text-lg font-semibold text-zinc-900 dark:text-zinc-50">연간 구독</h2>
            <p className="mt-1 text-2xl font-bold text-zinc-900 dark:text-zinc-50">
              46,800<span className="text-sm font-normal text-zinc-500 dark:text-zinc-400">원 / 년</span>
            </p>
            <p className="mt-1 text-sm text-zinc-500 dark:text-zinc-400">월 3,900원 상당 · 연 1회 결제</p>
            <p className="mt-1 text-sm text-zinc-500 dark:text-zinc-400">광고 없이 이용</p>
            <CheckoutButton
              priceId={ANNUAL_PRICE_ID}
              label="연간 구독하기"
              userId={user?.id ?? null}
              userEmail={user?.email ?? null}
              className={buttonClass}
            />
          </section>
        </div>

        <section className="mt-4 rounded-2xl border border-zinc-200 bg-white p-6 dark:border-zinc-800 dark:bg-zinc-950">
          <h2 className="text-lg font-semibold text-zinc-900 dark:text-zinc-50">후원하기</h2>
          <p className="mt-1 mb-4 text-sm text-zinc-500 dark:text-zinc-400">
            구독 없이, 원하시는 금액을 자유롭게 후원할 수 있어요.
          </p>
          <DonateForm userId={user?.id ?? null} />
        </section>
      </main>
    </div>
  );
}
