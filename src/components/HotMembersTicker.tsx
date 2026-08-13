import Link from "next/link";
import { InfoTooltip } from "@/components/InfoTooltip";
import type { HotMember } from "@/lib/supabase/members";

export function HotMembersTicker({ members }: { members: HotMember[] }) {
  if (members.length === 0) return null;

  return (
    <div className="rounded-2xl border border-zinc-200 bg-white p-4 dark:border-zinc-800 dark:bg-zinc-950">
      <div className="mb-3 flex items-center justify-between gap-2">
        <h2 className="flex items-center gap-1.5 text-sm font-semibold text-zinc-900 dark:text-zinc-50">
          <span aria-hidden>📢</span> 실시간 언론 언급 TOP 5
        </h2>
        <InfoTooltip
          label="실시간 언론 언급 TOP 5 기준 설명"
          text="활동 여부와 관계없이 전체 국회의원 중 네이버 뉴스 언급 건수가 많은 순으로 5명을 보여줘요. 언급 건수는 매일 자동으로 갱신돼요."
        />
      </div>
      <ol className="grid grid-cols-5 gap-1.5">
        {members.map((m, i) => (
          <li key={m.id} className="min-w-0">
            <Link
              href={`/members/${m.id}`}
              className="flex flex-col items-center gap-1 rounded-xl px-1 py-2.5 text-center transition hover:bg-zinc-50 dark:hover:bg-zinc-900"
            >
              <span className="text-xs font-bold text-violet-500">{i + 1}</span>
              <p className="w-full truncate text-sm font-medium text-zinc-900 dark:text-zinc-50">{m.name}</p>
              <p className="w-full truncate text-[11px] text-zinc-500 dark:text-zinc-400">
                {m.mentionCount.toLocaleString()}건
              </p>
            </Link>
          </li>
        ))}
      </ol>
    </div>
  );
}
