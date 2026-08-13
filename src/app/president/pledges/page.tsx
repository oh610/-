import type { Metadata } from "next";
import { getPledges } from "@/lib/supabase/president";
import type { PledgeStatus } from "@/types/president";
import { TaegeukWatermark } from "@/components/TaegeukWatermark";

export const dynamic = "force-dynamic";

export const metadata: Metadata = {
  title: "공약 이행현황",
  description: "대선 공약과 현재 이행 현황을 확인해 보세요.",
};

const STATUS_STYLE: Record<PledgeStatus, string> = {
  "추진 전": "bg-zinc-200 text-zinc-700 dark:bg-zinc-700 dark:text-zinc-200",
  "추진 중": "bg-amber-100 text-amber-700 dark:bg-amber-900/40 dark:text-amber-400",
  "이행 완료": "bg-emerald-100 text-emerald-700 dark:bg-emerald-900/40 dark:text-emerald-400",
};

function percentStyle(percent: number): string {
  if (percent >= 80) return "bg-emerald-100 text-emerald-700 dark:bg-emerald-900/40 dark:text-emerald-400";
  if (percent >= 30) return "bg-amber-100 text-amber-700 dark:bg-amber-900/40 dark:text-amber-400";
  return "bg-zinc-200 text-zinc-700 dark:bg-zinc-700 dark:text-zinc-200";
}

export default async function PresidentPledgesPage() {
  const pledges = await getPledges();

  return (
    <div className="relative min-h-screen overflow-hidden bg-zinc-50 px-4 py-16 dark:bg-black">
      <TaegeukWatermark />
      <main className="relative mx-auto flex w-full max-w-2xl flex-col gap-6">
        <h1 className="text-lg font-medium text-zinc-500 dark:text-zinc-400">공약 이행현황</h1>

        {pledges.length === 0 ? (
          <p className="text-sm text-zinc-500 dark:text-zinc-400">아직 등록된 공약이 없습니다.</p>
        ) : (
          <ul className="flex flex-col gap-3">
            {pledges.map((p) => (
              <li
                key={p.id}
                className="rounded-2xl border border-zinc-200 bg-white p-5 dark:border-zinc-800 dark:bg-zinc-950"
              >
                <div className="flex items-start justify-between gap-3">
                  <div className="min-w-0">
                    {p.category && (
                      <p className="text-xs font-medium text-zinc-400 dark:text-zinc-500">{p.category}</p>
                    )}
                    <h2 className="mt-0.5 font-semibold text-zinc-900 dark:text-zinc-50">{p.title}</h2>
                  </div>
                  {p.completionPercent !== null && (
                    <span
                      className={`shrink-0 rounded-full px-2.5 py-1 text-xs font-semibold ${percentStyle(p.completionPercent)}`}
                    >
                      이행 {p.completionPercent}%
                    </span>
                  )}
                </div>

                {p.items.length > 0 && (
                  <ul className="mt-3 flex flex-col divide-y divide-zinc-100 border-t border-zinc-100 dark:divide-zinc-900 dark:border-zinc-900">
                    {p.items.map((item) => (
                      <li key={item.id} className="flex items-center justify-between gap-3 py-2.5">
                        <span className="min-w-0 flex-1 text-sm leading-relaxed text-zinc-600 dark:text-zinc-400">
                          {item.content}
                        </span>
                        <span
                          className={`shrink-0 whitespace-nowrap rounded-full px-2 py-0.5 text-[11px] font-medium ${STATUS_STYLE[item.status]}`}
                        >
                          {item.status}
                        </span>
                      </li>
                    ))}
                  </ul>
                )}

                {p.sourceUrl && (
                  <a
                    href={p.sourceUrl}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="mt-3 inline-block text-xs text-zinc-400 underline decoration-dotted hover:text-zinc-600 dark:hover:text-zinc-300"
                  >
                    출처 보기
                  </a>
                )}
              </li>
            ))}
          </ul>
        )}
      </main>
    </div>
  );
}
