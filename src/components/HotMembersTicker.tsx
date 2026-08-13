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
          text="최근 30일간 활동이 많은 의원 중 네이버 뉴스 언급 건수가 많은 순으로 5명을 보여줘요. 언급 건수는 페이지를 열 때마다 실시간으로 조회돼요."
        />
      </div>
      <ol className="flex gap-3 overflow-x-auto pb-1">
        {members.map((m, i) => (
          <li key={m.id} className="shrink-0">
            <Link
              href={`/members/${m.id}`}
              className="flex w-24 flex-col items-center gap-1.5 rounded-xl p-2 text-center transition hover:bg-zinc-50 dark:hover:bg-zinc-900"
            >
              <span className="text-xs font-bold text-violet-500">{i + 1}</span>
              {m.photoUrl ? (
                // eslint-disable-next-line @next/next/no-img-element
                <img
                  src={m.photoUrl}
                  alt={`${m.name} 의원 사진`}
                  className="h-14 w-14 rounded-full object-cover"
                />
              ) : (
                <div className="flex h-14 w-14 items-center justify-center rounded-full bg-zinc-100 text-lg font-semibold text-zinc-400 dark:bg-zinc-800 dark:text-zinc-600">
                  {m.name.slice(0, 1)}
                </div>
              )}
              <p className="w-full truncate text-xs font-medium text-zinc-900 dark:text-zinc-50">{m.name}</p>
              <p className="w-full truncate text-[11px] text-zinc-500 dark:text-zinc-400">
                언급 {m.mentionCount.toLocaleString()}건
              </p>
            </Link>
          </li>
        ))}
      </ol>
    </div>
  );
}
