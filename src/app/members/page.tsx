import Link from "next/link";
import { searchMembers } from "@/lib/supabase/members";

export const dynamic = "force-dynamic";

function IdeologyBadge({ ideology }: { ideology: "진보" | "보수" }) {
  return (
    <span
      className={
        ideology === "진보"
          ? "rounded-full bg-blue-100 px-2 py-0.5 text-xs text-blue-700 dark:bg-blue-900/40 dark:text-blue-400"
          : "rounded-full bg-rose-100 px-2 py-0.5 text-xs text-rose-700 dark:bg-rose-900/40 dark:text-rose-400"
      }
    >
      {ideology}
    </span>
  );
}

export default async function MembersPage({
  searchParams,
}: {
  searchParams: Promise<{ q?: string }>;
}) {
  const { q = "" } = await searchParams;
  const members = await searchMembers(q);

  return (
    <div className="min-h-screen bg-zinc-50 px-4 py-16 dark:bg-black">
      <main className="mx-auto flex w-full max-w-2xl flex-col gap-6">
        <h1 className="text-lg font-medium text-zinc-500 dark:text-zinc-400">국회의원 검색</h1>

        <form className="flex gap-2">
          <input
            type="text"
            name="q"
            defaultValue={q}
            placeholder="이름으로 검색"
            className="flex-1 rounded-lg border border-zinc-300 bg-white px-4 py-2 text-zinc-900 dark:border-zinc-700 dark:bg-zinc-900 dark:text-zinc-100"
          />
          <button
            type="submit"
            className="rounded-lg bg-zinc-900 px-4 py-2 text-white dark:bg-zinc-100 dark:text-zinc-900"
          >
            검색
          </button>
        </form>

        <ul className="flex flex-col gap-3">
          {members.map((m) => (
            <li key={m.id}>
              <Link
                href={`/members/${m.id}`}
                className="flex items-center gap-3 rounded-xl border border-zinc-200 bg-white p-4 hover:border-zinc-400 dark:border-zinc-800 dark:bg-zinc-950"
              >
                {m.photoUrl ? (
                  // eslint-disable-next-line @next/next/no-img-element
                  <img
                    src={m.photoUrl}
                    alt={`${m.name} 의원 사진`}
                    className="h-10 w-10 shrink-0 rounded-full object-cover"
                  />
                ) : (
                  <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-full bg-zinc-100 text-sm font-semibold text-zinc-400 dark:bg-zinc-800 dark:text-zinc-600">
                    {m.name.slice(0, 1)}
                  </div>
                )}
                <div className="min-w-0 flex-1">
                  <p className="font-semibold text-zinc-900 dark:text-zinc-50">{m.name}</p>
                  <p className="text-sm text-zinc-500 dark:text-zinc-400">
                    {m.partyName ?? "무소속"} ·{" "}
                    {m.districtType === "지역구" ? m.districtName : "비례대표"}
                  </p>
                </div>
                {m.ideology && <IdeologyBadge ideology={m.ideology} />}
              </Link>
            </li>
          ))}
          {members.length === 0 && (
            <p className="text-sm text-zinc-500 dark:text-zinc-400">검색 결과가 없습니다.</p>
          )}
        </ul>
      </main>
    </div>
  );
}
