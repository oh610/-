import Link from "next/link";

export default function PrivacyPage() {
  return (
    <div className="flex min-h-screen justify-center bg-zinc-50 px-4 py-16 dark:bg-black">
      <main className="w-full max-w-2xl">
        <h1 className="text-2xl font-bold text-zinc-900 dark:text-zinc-50">
          개인정보처리방침
        </h1>
        <p className="mt-2 rounded-lg bg-amber-100 px-3 py-2 text-sm text-amber-800 dark:bg-amber-900/40 dark:text-amber-300">
          본 문서는 초안이며, 개인정보보호법 등 관련 법령에 따른 법률 검토 전에는 실제 서비스에
          그대로 사용할 수 없습니다.
        </p>

        <div className="mt-6 flex flex-col gap-5 text-sm leading-6 text-zinc-700 dark:text-zinc-300">
          <section>
            <h2 className="mb-1 font-semibold text-zinc-900 dark:text-zinc-50">
              1. 수집하는 개인정보 항목
            </h2>
            <p>
              회원가입 시 이메일 주소를 수집합니다. 비밀번호는 인증 서비스(Supabase Auth)를 통해
              암호화되어 저장되며 회사는 평문 비밀번호를 보관하지 않습니다. 진영 분류 이의제기를
              제출하는 경우 사유 및 첨부한 근거 자료 링크가 추가로 수집됩니다.
            </p>
          </section>

          <section>
            <h2 className="mb-1 font-semibold text-zinc-900 dark:text-zinc-50">
              2. 개인정보의 수집 및 이용 목적
            </h2>
            <p>회원 식별 및 로그인, 서비스 이용 이력 관리, 이의제기 처리 및 결과 안내.</p>
          </section>

          <section>
            <h2 className="mb-1 font-semibold text-zinc-900 dark:text-zinc-50">
              3. 개인정보의 보유 및 이용 기간
            </h2>
            <p>
              회원 탈퇴 시 지체 없이 파기합니다. 단, 관계 법령에 따라 보존이 필요한 경우 해당
              법령에서 정한 기간 동안 보관합니다.
            </p>
          </section>

          <section>
            <h2 className="mb-1 font-semibold text-zinc-900 dark:text-zinc-50">
              4. 개인정보 처리 위탁
            </h2>
            <p>
              서비스 운영을 위해 아래와 같이 개인정보 처리를 위탁하고 있습니다.
            </p>
            <ul className="mt-2 list-disc pl-5">
              <li>Supabase (인증 및 데이터베이스 호스팅)</li>
              <li>Resend (이메일 발송)</li>
            </ul>
          </section>

          <section>
            <h2 className="mb-1 font-semibold text-zinc-900 dark:text-zinc-50">
              5. 이용자의 권리
            </h2>
            <p>
              회원은 언제든지 본인의 개인정보를 열람·정정·삭제하거나 처리 정지를 요청할 수
              있습니다.
            </p>
          </section>

          <section>
            <h2 className="mb-1 font-semibold text-zinc-900 dark:text-zinc-50">
              6. 개인정보 보호책임자
            </h2>
            <p>연락처: dhaostk@gmail.com</p>
          </section>

          <section>
            <h2 className="mb-1 font-semibold text-zinc-900 dark:text-zinc-50">시행일</h2>
            <p>이 방침은 (시행일자)부터 적용됩니다.</p>
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
