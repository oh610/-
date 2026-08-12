import type { Metadata } from "next";
import Link from "next/link";
import { createClient } from "@/lib/supabase/server";
import { getAllSummaryCards } from "@/lib/supabase/queries";
import { LoginPromptPopup } from "@/components/LoginPromptPopup";

export const dynamic = "force-dynamic";

export const metadata: Metadata = {
  title: "지난 뉴스 요약",
  description: "그동안 발행된 정치 이슈 요약카드를 모아봤어요.",
};

export default async function ArchivePage() {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  const cards = await getAllSummaryCards();

  return (
    <div className="flex min-h-screen flex-col items-center bg-zinc-50 px-4 py-16 dark:bg-black">
      <main className="w-full max-w-2xl">
        <h1 className="mb-2 text-3xl font-bold text-zinc-950 dark:text-zinc-50">지난 뉴스 요약</h1>
        <p className="mb-8 text-sm text-zinc-500 dark:text-zinc-400">
          지금까지 발행된 모든 요약카드를 볼 수 있어요.
        </p>

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
                </Link>
              </li>
            ))}
          </ul>
        )}
      </main>
      {!user && <LoginPromptPopup />}
    </div>
  );
}
