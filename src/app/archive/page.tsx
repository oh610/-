import Link from "next/link";
import { createClient } from "@/lib/supabase/server";
import { getAllSummaryCards } from "@/lib/supabase/queries";
import { hasFullAccess } from "@/lib/access";

export const dynamic = "force-dynamic";

export default async function ArchivePage() {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  let tier: string | null = null;
  let isAdmin = false;
  let trialExpiresAt: string | null = null;
  if (user) {
    const { data } = await supabase
      .from("users")
      .select("tier, is_admin, trial_expires_at")
      .eq("id", user.id)
      .maybeSingle();
    tier = data?.tier ?? null;
    isAdmin = data?.is_admin ?? false;
    trialExpiresAt = data?.trial_expires_at ?? null;
  }
  const isSubscriber = hasFullAccess(tier, isAdmin, trialExpiresAt);

  const cards = await getAllSummaryCards();

  return (
    <div className="flex min-h-screen flex-col items-center bg-zinc-50 px-4 py-16 dark:bg-black">
      <main className="w-full max-w-2xl">
        <h1 className="mb-2 text-3xl font-bold text-zinc-950 dark:text-zinc-50">지난 뉴스 요약</h1>
        <p className="mb-8 text-sm text-zinc-500 dark:text-zinc-400">
          {isSubscriber
            ? "지금까지 발행된 모든 요약카드를 볼 수 있어요."
            : "목록은 누구나 볼 수 있지만, 내용을 열람하려면 구독이 필요해요."}
        </p>

        {!isSubscriber && (
          <div className="mb-6 flex items-center justify-between rounded-xl border border-violet-200 bg-violet-50 px-4 py-3 text-sm dark:border-violet-900 dark:bg-violet-950/30">
            <span className="text-violet-800 dark:text-violet-300">
              구독하면 지난 요약을 전부 열람할 수 있어요.
            </span>
            <Link
              href="/pricing"
              className="shrink-0 rounded-full bg-violet-600 px-3.5 py-1.5 font-semibold text-white transition hover:bg-violet-500"
            >
              구독하기
            </Link>
          </div>
        )}

        {cards.length === 0 ? (
          <p className="text-sm text-zinc-500 dark:text-zinc-400">아직 발행된 요약카드가 없습니다.</p>
        ) : (
          <ul className="flex flex-col divide-y divide-zinc-200 rounded-2xl border border-zinc-200 bg-white dark:divide-zinc-800 dark:border-zinc-800 dark:bg-zinc-950">
            {cards.map((card) => (
              <li key={card.id}>
                <Link
                  href={`/archive/${card.id}`}
                  className="flex items-center justify-between gap-4 px-5 py-4 hover:bg-zinc-50 dark:hover:bg-zinc-900"
                >
                  <div className="min-w-0">
                    <p className="text-xs text-zinc-500 dark:text-zinc-400">{card.publishedDate}</p>
                    <p className="truncate text-sm font-medium text-zinc-900 dark:text-zinc-50">
                      {card.issueTitle}
                    </p>
                  </div>
                  {!isSubscriber && (
                    <span className="shrink-0 text-xs text-zinc-400 dark:text-zinc-500">🔒 구독 전용</span>
                  )}
                </Link>
              </li>
            ))}
          </ul>
        )}
      </main>
    </div>
  );
}
