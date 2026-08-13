import Link from "next/link";
import type { InactiveMember } from "@/lib/supabase/members";

export function InactiveMembersPanel({
  members,
  totalCount,
  icon = "😴",
  heading = "최근 30일 미활동 TOP 5",
}: {
  members: InactiveMember[];
  totalCount: number;
  icon?: string;
  heading?: string;
}) {
  if (members.length === 0) return null;
  const restCount = totalCount - members.length;

  return (
    <div className="rounded-2xl border border-zinc-200 bg-white p-5 dark:border-zinc-800 dark:bg-zinc-950">
      <h2 className="mb-4 flex items-center gap-1.5 text-sm font-semibold text-zinc-900 dark:text-zinc-50">
        <span aria-hidden>{icon}</span> {heading}
      </h2>
      <ol className="flex flex-col gap-1">
        {members.map((m, i) => (
          <li key={m.id}>
            <Link
              href={`/members/${m.id}`}
              className="flex items-center gap-2.5 rounded-lg p-1.5 transition hover:bg-zinc-50 dark:hover:bg-zinc-900"
            >
              <span className="w-5 shrink-0 text-center text-sm font-bold text-zinc-400 dark:text-zinc-600">
                {i + 1}
              </span>
              {m.photoUrl ? (
                // eslint-disable-next-line @next/next/no-img-element
                <img
                  src={m.photoUrl}
                  alt={`${m.name} 의원 사진`}
                  className="h-9 w-9 shrink-0 rounded-full object-cover"
                />
              ) : (
                <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-full bg-zinc-100 text-xs font-semibold text-zinc-400 dark:bg-zinc-800 dark:text-zinc-600">
                  {m.name.slice(0, 1)}
                </div>
              )}
              <div className="min-w-0 flex-1">
                <p className="truncate text-sm font-medium text-zinc-900 dark:text-zinc-50">
                  {m.name}
                  {m.partyName && (
                    <span className="ml-1 text-xs font-normal text-zinc-400 dark:text-zinc-500">
                      · {m.partyName}
                    </span>
                  )}
                </p>
                <p className="truncate text-xs text-zinc-500 dark:text-zinc-400">
                  {m.inactiveDays === null ? "활동 이력 없음" : `${m.inactiveDays}일째 활동 없음`}
                </p>
              </div>
            </Link>
          </li>
        ))}
      </ol>
      {restCount > 0 && (
        <p className="mt-2 text-center text-xs text-zinc-400 dark:text-zinc-600">그 외 {restCount}명</p>
      )}
    </div>
  );
}
