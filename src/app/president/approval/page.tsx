import type { Metadata } from "next";
import { getApprovalRatings } from "@/lib/supabase/president";
import { ApprovalRatingChart } from "@/components/ApprovalRatingChart";
import { TaegeukWatermark } from "@/components/TaegeukWatermark";

export const dynamic = "force-dynamic";

export const metadata: Metadata = {
  title: "대통령 지지율",
  description: "매주 발표되는 대통령 지지율 변동 추이를 확인해 보세요.",
};

export default async function PresidentApprovalPage() {
  const ratings = await getApprovalRatings(26);
  const latest = ratings[0] ?? null;

  return (
    <div className="relative min-h-screen overflow-hidden bg-zinc-50 px-4 py-16 dark:bg-black">
      <TaegeukWatermark />
      <main className="relative mx-auto flex w-full max-w-2xl flex-col gap-6">
        <h1 className="text-lg font-medium text-zinc-500 dark:text-zinc-400">대통령 지지율</h1>

        {!latest ? (
          <p className="text-sm text-zinc-500 dark:text-zinc-400">아직 등록된 지지율 조사가 없습니다.</p>
        ) : (
          <>
            <section className="rounded-2xl border border-zinc-200 bg-white p-6 dark:border-zinc-800 dark:bg-zinc-950">
              <p className="text-center text-xs text-zinc-500 dark:text-zinc-400">
                {latest.surveyDate} · {latest.agency} 조사
              </p>
              <div className="mt-2 grid grid-cols-2 divide-x divide-zinc-100 dark:divide-zinc-900">
                <div className="text-center">
                  <p className="text-5xl font-bold text-violet-500">{latest.approvalPercent}%</p>
                  <p className="mt-1 text-sm text-zinc-500 dark:text-zinc-400">긍정 평가</p>
                </div>
                <div className="text-center">
                  <p className="text-5xl font-bold text-rose-500">
                    {latest.disapprovalPercent != null ? `${latest.disapprovalPercent}%` : "—"}
                  </p>
                  <p className="mt-1 text-sm text-zinc-500 dark:text-zinc-400">부정 평가</p>
                </div>
              </div>
            </section>

            <section className="rounded-2xl border border-zinc-200 bg-white p-6 dark:border-zinc-800 dark:bg-zinc-950">
              <h2 className="mb-4 text-sm font-semibold text-zinc-500 dark:text-zinc-400">최근 추이</h2>
              <ApprovalRatingChart ratings={ratings} />
            </section>

            <section className="rounded-2xl border border-zinc-200 bg-white dark:border-zinc-800 dark:bg-zinc-950">
              <ul className="divide-y divide-zinc-200 dark:divide-zinc-800">
                {ratings.map((r) => (
                  <li key={r.id} className="flex items-center justify-between gap-3 px-5 py-3 text-sm">
                    <div className="min-w-0">
                      <p className="text-zinc-900 dark:text-zinc-50">{r.surveyDate}</p>
                      <p className="text-xs text-zinc-500 dark:text-zinc-400">{r.agency}</p>
                    </div>
                    <div className="flex shrink-0 items-center gap-3">
                      <span className="font-semibold text-violet-500">긍정 {r.approvalPercent}%</span>
                      {r.disapprovalPercent != null && (
                        <span className="font-semibold text-rose-500">부정 {r.disapprovalPercent}%</span>
                      )}
                      {r.sourceUrl && (
                        <a
                          href={r.sourceUrl}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="text-xs text-zinc-400 underline decoration-dotted hover:text-zinc-600 dark:hover:text-zinc-300"
                        >
                          출처
                        </a>
                      )}
                    </div>
                  </li>
                ))}
              </ul>
            </section>
          </>
        )}
      </main>
    </div>
  );
}
