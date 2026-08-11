import Link from "next/link";

export default function TermsPage() {
  return (
    <div className="flex min-h-screen justify-center bg-zinc-50 px-4 py-16 dark:bg-black">
      <main className="w-full max-w-2xl">
        <h1 className="text-2xl font-bold text-zinc-900 dark:text-zinc-50">이용약관</h1>
        <p className="mt-2 rounded-lg bg-amber-100 px-3 py-2 text-sm text-amber-800 dark:bg-amber-900/40 dark:text-amber-300">
          본 문서는 초안이며, 법률 자문 전에는 실제 서비스에 그대로 사용할 수 없습니다.
        </p>

        <div className="mt-6 flex flex-col gap-5 text-sm leading-6 text-zinc-700 dark:text-zinc-300">
          <section>
            <h2 className="mb-1 font-semibold text-zinc-900 dark:text-zinc-50">제1조 (목적)</h2>
            <p>
              이 약관은 정치 뉴스 분석 및 정당·인물 요약 서비스(이하 &ldquo;서비스&rdquo;)를
              이용함에 있어 회사와 회원의 권리·의무 및 책임사항을 규정함을 목적으로 합니다.
            </p>
          </section>

          <section>
            <h2 className="mb-1 font-semibold text-zinc-900 dark:text-zinc-50">
              제2조 (회원가입 및 계정)
            </h2>
            <p>
              서비스 이용을 위해서는 이메일을 통한 회원가입이 필요합니다. 회원은 가입 시 제공한
              정보가 정확함을 보증하며, 계정 정보 관리에 대한 책임은 회원 본인에게 있습니다.
            </p>
          </section>

          <section>
            <h2 className="mb-1 font-semibold text-zinc-900 dark:text-zinc-50">
              제3조 (콘텐츠의 성격 및 면책)
            </h2>
            <p>
              서비스가 제공하는 이슈 요약, 진영별 입장 비교는 AI가 검색된 공식 논평·뉴스 자료를
              근거로 재구성한 요약이며, 회사의 정치적 견해를 반영하지 않습니다. 요약의 사실관계는
              원문 출처를 통해 확인하시기 바라며, 회사는 요약 내용의 완전성·정확성을 보증하지
              않습니다.
            </p>
          </section>

          <section>
            <h2 className="mb-1 font-semibold text-zinc-900 dark:text-zinc-50">
              제4조 (저작권)
            </h2>
            <p>
              서비스가 제공하는 요약·분석 콘텐츠의 저작권은 회사에 귀속됩니다. 인용된 원문
              발췌·링크는 각 저작권자에게 저작권이 있으며, 회원은 회사의 사전 동의 없이 콘텐츠를
              상업적으로 재배포할 수 없습니다.
            </p>
          </section>

          <section>
            <h2 className="mb-1 font-semibold text-zinc-900 dark:text-zinc-50">
              제5조 (회원의 의무)
            </h2>
            <p>
              회원은 관계 법령, 이 약관의 규정, 이용안내 및 서비스와 관련하여 공지한 사항 등을
              준수하여야 하며, 서비스 운영을 방해하는 행위를 해서는 안 됩니다.
            </p>
          </section>

          <section>
            <h2 className="mb-1 font-semibold text-zinc-900 dark:text-zinc-50">
              제6조 (약관의 변경)
            </h2>
            <p>
              회사는 필요한 경우 관련 법령을 위배하지 않는 범위에서 이 약관을 변경할 수 있으며,
              변경 시 서비스 내 공지사항을 통해 사전 안내합니다.
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
