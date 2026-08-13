import type { Metadata } from "next";
import { getPledges } from "@/lib/supabase/president";
import type { Pledge, PledgeStatus } from "@/types/president";
import { TaegeukWatermark } from "@/components/TaegeukWatermark";

export const dynamic = "force-dynamic";

export const metadata: Metadata = {
  title: "공약 이행현황",
  description: "분야별 대선 공약과 현재 이행 현황을 확인해 보세요.",
};

const STATUS_STYLE: Record<PledgeStatus, string> = {
  "추진 전": "bg-zinc-200 text-zinc-700 dark:bg-zinc-700 dark:text-zinc-200",
  "추진 중": "bg-amber-100 text-amber-700 dark:bg-amber-900/40 dark:text-amber-400",
  "이행 완료": "bg-emerald-100 text-emerald-700 dark:bg-emerald-900/40 dark:text-emerald-400",
};

const UNCATEGORIZED_LABEL = "기타";

function percentStyle(percent: number): string {
  if (percent >= 80) return "bg-emerald-100 text-emerald-700 dark:bg-emerald-900/40 dark:text-emerald-400";
  if (percent >= 30) return "bg-amber-100 text-amber-700 dark:bg-amber-900/40 dark:text-amber-400";
  return "bg-zinc-200 text-zinc-700 dark:bg-zinc-700 dark:text-zinc-200";
}

function groupByCategory(pledges: Pledge[]): { category: string; pledges: Pledge[] }[] {
  const order: string[] = [];
  const byCategory = new Map<string, Pledge[]>();

  for (const p of pledges) {
    const category = p.category ?? UNCATEGORIZED_LABEL;
    if (!byCategory.has(category)) {
      order.push(category);
      byCategory.set(category, []);
    }
    byCategory.get(category)!.push(p);
  }

  return order.map((category) => ({ category, pledges: byCategory.get(category)! }));
}

function PledgeCard({ pledge }: { pledge: Pledge }) {
  return (
    <li className="rounded-2xl border border-zinc-200 bg-white p-5 dark:border-zinc-800 dark:bg-zinc-950">
      <div className="flex items-start justify-between gap-3">
        <h3 className="font-semibold text-zinc-900 dark:text-zinc-50">{pledge.title}</h3>
        {pledge.completionPercent !== null && (
          <span
            className={`shrink-0 rounded-full px-2.5 py-1 text-xs font-semibold ${percentStyle(pledge.completionPercent)}`}
          >
            이행 {pledge.completionPercent}%
          </span>
        )}
      </div>

      {pledge.items.length > 0 && (
        <ul className="mt-3 flex flex-col divide-y divide-zinc-100 border-t border-zinc-100 dark:divide-zinc-900 dark:border-zinc-900">
          {pledge.items.map((item) => (
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

      {pledge.sourceUrl && (
        <a
          href={pledge.sourceUrl}
          target="_blank"
          rel="noopener noreferrer"
          className="mt-3 inline-block text-xs text-zinc-400 underline decoration-dotted hover:text-zinc-600 dark:hover:text-zinc-300"
        >
          출처 보기
        </a>
      )}
    </li>
  );
}

export default async function PresidentPledgesPage({
  searchParams,
}: {
  searchParams: Promise<{ q?: string }>;
}) {
  const { q = "" } = await searchParams;
  const pledges = await getPledges(q);
  const groups = groupByCategory(pledges);

  return (
    <div className="relative min-h-screen overflow-hidden bg-zinc-50 px-4 py-16 dark:bg-black">
      <TaegeukWatermark />
      <main className="relative mx-auto flex w-full max-w-3xl flex-col gap-6">
        <h1 className="text-lg font-medium text-zinc-500 dark:text-zinc-400">공약 이행현황</h1>

        <form className="flex gap-2">
          <input
            type="text"
            name="q"
            defaultValue={q}
            placeholder="공약 검색"
            className="w-full rounded-lg border border-zinc-300 bg-white px-4 py-2 text-sm text-zinc-900 dark:border-zinc-700 dark:bg-zinc-900 dark:text-zinc-100"
          />
          <button type="submit" className="btn-primary shrink-0">
            검색
          </button>
        </form>

        {groups.length === 0 ? (
          <p className="text-sm text-zinc-500 dark:text-zinc-400">조건에 맞는 공약이 없습니다.</p>
        ) : (
          <div className="flex flex-col-reverse gap-6 lg:flex-row lg:items-start">
            <div className="flex min-w-0 flex-1 flex-col gap-8">
              {groups.map((g, i) => (
                <section key={g.category} id={`pledge-category-${i}`} className="scroll-mt-20">
                  <h2 className="mb-3 flex items-baseline gap-2 text-base font-semibold text-zinc-800 dark:text-zinc-100">
                    {g.category}
                    <span className="text-xs font-normal text-zinc-400 dark:text-zinc-500">
                      {g.pledges.length}건
                    </span>
                  </h2>
                  <ul className="flex flex-col gap-3">
                    {g.pledges.map((p) => (
                      <PledgeCard key={p.id} pledge={p} />
                    ))}
                  </ul>
                </section>
              ))}
            </div>

            <nav className="flex gap-2 overflow-x-auto pb-1 lg:sticky lg:top-20 lg:w-44 lg:shrink-0 lg:flex-col lg:gap-1.5 lg:overflow-visible lg:pb-0">
              {groups.map((g, i) => (
                <a
                  key={g.category}
                  href={`#pledge-category-${i}`}
                  className="shrink-0 rounded-full border border-zinc-300 bg-white px-3 py-1.5 text-xs whitespace-nowrap text-zinc-600 transition hover:border-violet-400 hover:text-violet-600 dark:border-zinc-700 dark:bg-zinc-950 dark:text-zinc-300 dark:hover:border-violet-500 dark:hover:text-violet-400 lg:w-full lg:rounded-lg lg:text-sm"
                >
                  {g.category} <span className="text-zinc-400 dark:text-zinc-500">{g.pledges.length}</span>
                </a>
              ))}
            </nav>
          </div>
        )}
      </main>
    </div>
  );
}
