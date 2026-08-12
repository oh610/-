import { SummaryCardView } from "@/components/SummaryCard";
import { DailyCardSlider } from "@/components/DailyCardSlider";
import { ReviewPromptPopup } from "@/components/ReviewPromptPopup";
import { SubscribePromptPopup } from "@/components/SubscribePromptPopup";
import { LoginPromptPopup } from "@/components/LoginPromptPopup";
import { TrialCouponPopup } from "@/components/TrialCouponPopup";
import { dummySummaryCard } from "@/lib/dummy-data";
import { getLatestSummaryCard } from "@/lib/supabase/queries";
import { createClient } from "@/lib/supabase/server";
import { hasFullAccess } from "@/lib/access";

export const dynamic = "force-dynamic";

export default async function Home() {
  const dbCard = await getLatestSummaryCard();
  const card = dbCard ?? dummySummaryCard;

  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  let tier: string | null = null;
  let isAdmin = false;
  let trialExpiresAt: string | null = null;
  let trialCouponCode: string | null = null;
  let showTrialCouponPopup = false;
  if (user) {
    const { data } = await supabase
      .from("users")
      .select("tier, is_admin, trial_expires_at, trial_coupon_code, trial_coupon_shown_at, trial_redeemed_at")
      .eq("id", user.id)
      .maybeSingle();
    tier = data?.tier ?? null;
    isAdmin = data?.is_admin ?? false;
    trialExpiresAt = data?.trial_expires_at ?? null;
    trialCouponCode = data?.trial_coupon_code ?? null;
    showTrialCouponPopup = !!trialCouponCode && !data?.trial_coupon_shown_at && !data?.trial_redeemed_at;
  }
  const access = hasFullAccess(tier, isAdmin, trialExpiresAt);

  return (
    <div className="flex min-h-screen flex-col items-center bg-zinc-50 px-4 py-16 dark:bg-black">
      <main className="flex w-full flex-col items-center gap-6">
        <div className="text-center">
          <span className="rounded-full bg-violet-500/10 px-3 py-1 text-xs font-semibold tracking-wide text-violet-600 dark:text-violet-400">
            {card.publishedDate} 발행
          </span>
          <h1 className="mt-3 text-3xl font-bold text-zinc-950 sm:text-4xl dark:text-white">
            오늘의 <span className="text-violet-500">진짜 논쟁</span>을 한눈에
          </h1>
        </div>
        {!dbCard && (
          <p className="text-sm text-amber-600 dark:text-amber-400">
            Supabase에서 데이터를 가져오지 못해 샘플 데이터를 표시 중입니다. (schema.sql / seed.sql 적용 여부 확인)
          </p>
        )}
        <DailyCardSlider hasAccess={access} userId={user?.id ?? null} userEmail={user?.email ?? null}>
          <SummaryCardView card={card} />
        </DailyCardSlider>
      </main>
      {user ? (
        <>
          {showTrialCouponPopup && trialCouponCode ? (
            <TrialCouponPopup code={trialCouponCode} />
          ) : (
            <>
              <ReviewPromptPopup />
              {!access && <SubscribePromptPopup userId={user.id} userEmail={user.email ?? null} />}
            </>
          )}
        </>
      ) : (
        <LoginPromptPopup />
      )}
    </div>
  );
}
