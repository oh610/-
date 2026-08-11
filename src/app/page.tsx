import Link from "next/link";
import { createClient } from "@/lib/supabase/server";

export default async function LandingPage() {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  return (
    <div className="flex min-h-screen flex-col items-center justify-center bg-zinc-50 px-4 py-24 dark:bg-black">
      <main className="flex w-full max-w-xl flex-col items-center gap-6 text-center">
        <span className="rounded-full bg-zinc-200 px-3 py-1 text-xs font-medium text-zinc-600 dark:bg-zinc-800 dark:text-zinc-400">
          정치 뉴스를 올바르게, 정치한스푼
        </span>

        <h1 className="text-3xl font-bold text-zinc-900 dark:text-zinc-50">
          진보·보수, 양쪽 입장을 한눈에
        </h1>

        <p className="text-zinc-600 dark:text-zinc-400">
          매일 하나의 정치 이슈를 골라 여당·야당의 논리를 나란히 비교합니다. 검증된 공식
          논평·뉴스만 근거로 요약합니다.
        </p>

        <ul className="flex flex-col gap-2 text-left text-sm text-zinc-600 dark:text-zinc-400">
          <li>· 1일 1이슈, 여당·야당 논리를 병렬로 비교하는 요약카드</li>
          <li>· 국회의원 프로필, 발의 법안, 표결 이력 검색</li>
          <li>· 문장 단위 인라인 각주로 출처 추적 (공식 입장 vs 참고자료 구분)</li>
        </ul>

        <div className="mt-4 flex gap-3">
          {user ? (
            <Link
              href="/home"
              className="rounded-lg bg-zinc-900 px-5 py-2.5 text-sm font-medium text-white dark:bg-zinc-100 dark:text-zinc-900"
            >
              서비스 이용하기
            </Link>
          ) : (
            <>
              <Link
                href="/signup"
                className="rounded-lg bg-zinc-900 px-5 py-2.5 text-sm font-medium text-white dark:bg-zinc-100 dark:text-zinc-900"
              >
                회원가입
              </Link>
              <Link
                href="/login"
                className="rounded-lg border border-zinc-300 px-5 py-2.5 text-sm font-medium text-zinc-700 dark:border-zinc-700 dark:text-zinc-300"
              >
                로그인
              </Link>
            </>
          )}
        </div>
      </main>
    </div>
  );
}
