import { getPartyColor, INDEPENDENT_COLOR } from "@/lib/party-visuals";
import type { PartyListItem } from "@/types/party";

export function PartySeatChart({
  parties,
  independentCount,
}: {
  parties: PartyListItem[];
  independentCount: number;
}) {
  const total = parties.reduce((sum, p) => sum + p.memberCount, 0) + independentCount;
  if (total === 0) return null;

  const segments = [
    ...parties.map((p) => ({ name: p.name, count: p.memberCount, color: getPartyColor(p.name) })),
    ...(independentCount > 0 ? [{ name: "무소속", count: independentCount, color: INDEPENDENT_COLOR }] : []),
  ].filter((s) => s.count > 0);

  return (
    <div className="rounded-2xl border border-zinc-200 bg-white p-5 dark:border-zinc-800 dark:bg-zinc-950">
      <p className="mb-3 text-sm font-semibold text-zinc-500 dark:text-zinc-400">국회 의석 비율 ({total}석)</p>

      <div className="flex h-4 w-full overflow-hidden rounded-full bg-zinc-100 dark:bg-zinc-900">
        {segments.map((s) => (
          <div
            key={s.name}
            style={{ width: `${(s.count / total) * 100}%`, backgroundColor: s.color }}
            title={`${s.name} ${s.count}석 (${((s.count / total) * 100).toFixed(1)}%)`}
          />
        ))}
      </div>

      <ul className="mt-4 grid grid-cols-2 gap-x-4 gap-y-2 sm:grid-cols-3">
        {segments.map((s) => (
          <li key={s.name} className="flex items-center gap-1.5 text-xs text-zinc-600 dark:text-zinc-400">
            <span className="h-2.5 w-2.5 shrink-0 rounded-full" style={{ backgroundColor: s.color }} />
            <span className="min-w-0 truncate">{s.name}</span>
            <span className="shrink-0 text-zinc-400 dark:text-zinc-500">
              {((s.count / total) * 100).toFixed(1)}%
            </span>
          </li>
        ))}
      </ul>
    </div>
  );
}
