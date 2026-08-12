import type { Metadata } from "next";
import Link from "next/link";
import { getPresidentProfile } from "@/lib/supabase/president";

export const dynamic = "force-dynamic";

export const metadata: Metadata = {
  title: "대통령 소개",
  description: "현직 대통령의 사진과 이력을 확인해 보세요.",
};

export default async function PresidentPage() {
  const profile = await getPresidentProfile();

  return (
    <div className="min-h-screen bg-zinc-50 px-4 py-16 dark:bg-black">
      <main className="mx-auto flex w-full max-w-2xl flex-col gap-6">
        <h1 className="text-lg font-medium text-zinc-500 dark:text-zinc-400">대통령 소개</h1>

        {!profile || !profile.name ? (
          <p className="text-sm text-zinc-500 dark:text-zinc-400">아직 등록된 정보가 없습니다.</p>
        ) : (
          <section className="rounded-2xl border border-zinc-200 bg-white p-6 dark:border-zinc-800 dark:bg-zinc-950">
            <div className="flex items-center gap-5">
              {profile.photoUrl ? (
                // eslint-disable-next-line @next/next/no-img-element
                <img
                  src={profile.photoUrl}
                  alt={`${profile.name} 사진`}
                  className="h-24 w-24 shrink-0 rounded-2xl object-cover"
                />
              ) : (
                <div className="flex h-24 w-24 shrink-0 items-center justify-center rounded-2xl bg-zinc-100 text-3xl font-semibold text-zinc-400 dark:bg-zinc-800 dark:text-zinc-600">
                  {profile.name.slice(0, 1)}
                </div>
              )}
              <div className="min-w-0">
                <h2 className="text-2xl font-bold text-zinc-950 dark:text-zinc-50">{profile.name}</h2>
                {profile.termStart && (
                  <p className="mt-1 text-sm text-zinc-500 dark:text-zinc-400">취임일 {profile.termStart}</p>
                )}
              </div>
            </div>

            {profile.bio && (
              <div className="mt-6 flex flex-col gap-1.5 border-t border-black/5 pt-5 text-[15px] leading-relaxed text-zinc-700 dark:border-white/10 dark:text-zinc-300">
                {profile.bio
                  .split("\n")
                  .map((line) => line.trim())
                  .filter(Boolean)
                  .map((line, i) => (
                    <p key={i}>{line}</p>
                  ))}
              </div>
            )}
          </section>
        )}

        <div className="flex gap-3">
          <Link href="/president/approval" className="btn-secondary">
            지지율 보기
          </Link>
          <Link href="/president/pledges" className="btn-secondary">
            공약 이행현황 보기
          </Link>
        </div>
      </main>
    </div>
  );
}
