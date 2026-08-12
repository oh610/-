import Link from "next/link";
import { createClient } from "@/lib/supabase/server";

export default async function LandingPage() {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  return (
    <div className="flex min-h-screen flex-col bg-white dark:bg-black">
      <main className="flex flex-1 flex-col items-center justify-center px-4 py-28 text-center">
        <span className="rounded-full bg-violet-500/10 px-3.5 py-1.5 text-xs font-semibold tracking-wide text-violet-600 dark:text-violet-400">
          정치 뉴스를 올바르게, 정론관
        </span>

        <h1 className="mt-6 max-w-3xl text-4xl leading-[1.15] font-bold text-zinc-950 sm:text-5xl dark:text-white">
          진보·보수,
          <br />
          양쪽 입장을 <span className="text-violet-500">한눈에</span>
        </h1>

        <p className="mt-6 max-w-md text-base text-zinc-500 sm:text-lg dark:text-zinc-400">
          매일 하나의 정치 이슈를 골라 여당·야당의 논리를 나란히 비교합니다.
          검증된 공식 논평·뉴스만 근거로 요약합니다.
        </p>

        <div className="mt-10 flex flex-wrap items-center justify-center gap-3">
          <Link href="/home" className="btn-primary">
            서비스 이용하기
          </Link>
          {!user && (
            <Link href="/login" className="btn-secondary">
              로그인
            </Link>
          )}
        </div>

        <div className="mt-20 grid w-full max-w-3xl gap-4 text-left sm:grid-cols-3">
          <div className="rounded-2xl border border-zinc-200 p-5 dark:border-zinc-800">
            <p className="text-2xl">⚖️</p>
            <p className="mt-3 text-sm font-semibold text-zinc-900 dark:text-zinc-50">
              1일 1이슈, 병렬 비교
            </p>
            <p className="mt-1 text-sm text-zinc-500 dark:text-zinc-400">
              여당·야당 논리를 나란히 놓은 요약카드
            </p>
          </div>
          <div className="rounded-2xl border border-zinc-200 p-5 dark:border-zinc-800">
            <p className="text-2xl">🏛️</p>
            <p className="mt-3 text-sm font-semibold text-zinc-900 dark:text-zinc-50">
              국회의원 프로필
            </p>
            <p className="mt-1 text-sm text-zinc-500 dark:text-zinc-400">
              발의 법안, 표결 이력까지 한 번에 검색
            </p>
          </div>
          <div className="rounded-2xl border border-zinc-200 p-5 dark:border-zinc-800">
            <p className="text-2xl">🔎</p>
            <p className="mt-3 text-sm font-semibold text-zinc-900 dark:text-zinc-50">
              문장 단위 출처 각주
            </p>
            <p className="mt-1 text-sm text-zinc-500 dark:text-zinc-400">
              공식 입장 vs 참고자료를 명확히 구분
            </p>
          </div>
        </div>
      </main>
    </div>
  );
}
