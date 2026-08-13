import type { Metadata } from "next";
import Link from "next/link";
import { getPresidentProfile } from "@/lib/supabase/president";
import { TaegeukWatermark } from "@/components/TaegeukWatermark";

export const dynamic = "force-dynamic";

export const metadata: Metadata = {
  title: "대통령 소개",
  description: "현직 대통령의 사진과 이력을 확인해 보세요.",
};

export default async function PresidentPage() {
  const profile = await getPresidentProfile();

  const bioLines = profile?.bio
    ?.split("\n")
    .map((line) => line.trim())
    .filter(Boolean);

  return (
    <div className="relative min-h-screen overflow-hidden bg-zinc-50 px-4 py-16 dark:bg-black">
      <TaegeukWatermark />
      <main className="relative mx-auto flex w-full max-w-4xl flex-col gap-8">
        <h1 className="text-lg font-medium text-zinc-500 dark:text-zinc-400">대통령 소개</h1>

        {!profile || !profile.name ? (
          <p className="text-sm text-zinc-500 dark:text-zinc-400">아직 등록된 정보가 없습니다.</p>
        ) : (
          <section className="rounded-3xl border border-zinc-200 bg-white shadow-sm dark:border-zinc-800 dark:bg-zinc-950">
            <div className="flex flex-col md:flex-row">
              <div className="aspect-[4/5] w-full shrink-0 self-start overflow-hidden rounded-t-3xl bg-zinc-100 md:w-72 md:rounded-t-none md:rounded-l-3xl lg:w-80 dark:bg-zinc-900">
                {profile.photoUrl ? (
                  // eslint-disable-next-line @next/next/no-img-element
                  <img
                    src={profile.photoUrl}
                    alt={`${profile.name} 사진`}
                    className="h-full w-full object-cover"
                  />
                ) : (
                  <div className="flex h-full min-h-64 w-full items-center justify-center text-6xl font-semibold text-zinc-300 dark:text-zinc-700">
                    {profile.name.slice(0, 1)}
                  </div>
                )}
              </div>

              <div className="flex flex-1 flex-col gap-5 p-7 sm:p-8">
                <div>
                  {profile.termStart && (
                    <span className="inline-block rounded-full bg-violet-500/10 px-3 py-1 text-xs font-semibold text-violet-600 dark:text-violet-400">
                      취임일 {profile.termStart}
                    </span>
                  )}
                  <h2 className="mt-3 text-3xl font-bold text-zinc-950 sm:text-4xl dark:text-white">
                    {profile.name}
                  </h2>
                </div>

                {bioLines && bioLines.length > 0 && (
                  <ul className="flex flex-col gap-2.5 overflow-y-auto border-t border-zinc-100 pt-5 pr-1 md:max-h-96 dark:border-zinc-900">
                    {bioLines.map((line, i) => (
                      <li key={i} className="flex gap-2.5 text-[15px] leading-relaxed text-zinc-700 dark:text-zinc-300">
                        <span aria-hidden className="mt-2 h-1.5 w-1.5 shrink-0 rounded-full bg-violet-400" />
                        <span>{line}</span>
                      </li>
                    ))}
                  </ul>
                )}
              </div>
            </div>
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
