import type { Metadata } from "next";
import Link from "next/link";

export const metadata: Metadata = {
  title: "사용 방법",
  description: "정론관을 이용하는 방법을 안내해 드려요.",
};

export default function GuidePage() {
  return (
    <div className="flex min-h-screen justify-center bg-zinc-50 px-4 py-16 dark:bg-black">
      <main className="w-full max-w-2xl">
        <h1 className="text-3xl font-bold text-zinc-950 dark:text-zinc-50">사용 방법</h1>
        <p className="mt-2 text-sm text-zinc-500 dark:text-zinc-400">
          정론관을 이용하는 방법을 안내해 드려요.
        </p>

        <div className="mt-6 flex flex-col gap-5 text-sm leading-relaxed text-zinc-700 dark:text-zinc-300">
          <section>
            <h2 className="mb-1 font-semibold text-zinc-900 dark:text-zinc-50">
              1. 오늘의 요약
            </h2>
            <p>
              매일 오전 새로 발행되는 정치 이슈 하나를 여당·야당 입장으로 나란히 비교해서
              보여드려요. 모든 문장에는 근거가 된 뉴스 원문 출처가 달려 있어서, 직접 사실관계를
              확인하실 수 있어요.
            </p>
          </section>

          <section>
            <h2 className="mb-1 font-semibold text-zinc-900 dark:text-zinc-50">
              2. 지난 뉴스 요약
            </h2>
            <p>
              지금까지 발행된 요약을 날짜별로 모아볼 수 있어요. 목록은 누구나 볼 수 있고, 내용을
              열람하려면 구독이 필요해요.
            </p>
          </section>

          <section>
            <h2 className="mb-1 font-semibold text-zinc-900 dark:text-zinc-50">
              3. 국회의원 정보
            </h2>
            <p>
              이름으로 국회의원을 검색해서 소속 정당, 발의 법안, 표결 이력을 확인할 수 있어요.
            </p>
          </section>

          <section>
            <h2 className="mb-1 font-semibold text-zinc-900 dark:text-zinc-50">
              4. 구독 및 후원
            </h2>
            <p>
              월간·연간 구독, 또는 원하시는 금액으로 매달 자동 결제되는 자율금액구독 중 선택할 수
              있어요. 구독하시면 광고 없이, 지난 뉴스 요약까지 모두 이용하실 수 있습니다.
            </p>
          </section>

          <section>
            <h2 className="mb-1 font-semibold text-zinc-900 dark:text-zinc-50">
              5. 마이페이지
            </h2>
            <p>
              닉네임 변경, 비밀번호 변경, 결제 수단 변경, 회원 탈퇴 등 계정 관련 설정을 관리할 수
              있어요.
            </p>
          </section>
        </div>

        <p className="mt-8 text-sm">
          <Link href="/" className="text-zinc-900 hover:underline dark:text-zinc-100">
            ← 홈으로
          </Link>
        </p>
      </main>
    </div>
  );
}
