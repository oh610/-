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
            <p className="mt-2">
              구독 결제 시에는 결제대행사(Paddle)가 카드번호 등 결제 상세 정보를 직접 수집·보관하며,
              회사는 이를 저장하지 않습니다. 회사는 구독 상태·결제 금액·다음 결제일 등 결제 관련
              메타데이터만 보관합니다.
            </p>
            <p className="mt-2">
              서비스 이용 과정에서 접속 IP, 기기·브라우저 정보, 방문 페이지 등이 자동으로 수집될 수
              있습니다(호스팅 인프라 및 접속 통계 분석 목적). 무료 이용자에게는 배너 광고가
              노출되며, 광고 네트워크가 광고 개인화를 위해 별도로 쿠키·광고식별자를 수집할 수
              있습니다.
            </p>
          </section>

          <section>
            <h2 className="mb-1 font-semibold text-zinc-900 dark:text-zinc-50">
              2. 개인정보의 수집 및 이용 목적
            </h2>
            <p>
              회원 식별 및 로그인, 서비스 이용 이력 관리, 이의제기 처리 및 결과 안내, 구독 결제
              처리 및 결제 상태 관리, 서비스 부정이용 방지 및 통계 분석.
            </p>
          </section>

          <section>
            <h2 className="mb-1 font-semibold text-zinc-900 dark:text-zinc-50">
              3. 개인정보의 보유 및 이용 기간
            </h2>
            <p>
              회원 탈퇴 시 지체 없이 파기합니다. 단, 관계 법령에 따라 보존이 필요한 경우 해당
              법령에서 정한 기간 동안 보관합니다. 전자상거래 등에서의 소비자보호에 관한 법률에 따라
              계약·청약철회 기록 및 대금결제·재화 공급에 관한 기록은 5년, 소비자 불만 또는 분쟁처리에
              관한 기록은 3년간 보관합니다.
            </p>
          </section>

          <section>
            <h2 className="mb-1 font-semibold text-zinc-900 dark:text-zinc-50">
              4. 개인정보 처리 위탁 및 제3자 제공
            </h2>
            <p>
              서비스 운영을 위해 아래와 같이 개인정보 처리를 위탁하거나 제3자에게 제공하고
              있습니다.
            </p>
            <ul className="mt-2 list-disc pl-5">
              <li>Supabase, Inc. (회원 인증 및 데이터베이스 호스팅)</li>
              <li>Resend (문의 접수 이메일 발송)</li>
              <li>Vercel Inc. (웹사이트 호스팅 및 인프라 운영, 접속 통계 분석)</li>
              <li>
                Paddle.com Market Ltd (구독 결제 처리 — Paddle은 결제대행사(Merchant of
                Record)로서 결제 정보를 자체적으로 수집·처리합니다)
              </li>
              <li>
                카카오 애드핏(Kakao AdFit) — 무료 이용자 대상 배너 광고 노출. 광고 네트워크가 광고
                개인화 목적으로 쿠키·광고식별자를 자체 수집할 수 있으며, 이용자는 브라우저 설정에서
                쿠키를 차단하거나 기기의 광고 식별자 설정을 통해 개인화 광고를 거부할 수 있습니다.
              </li>
            </ul>
            <p className="mt-2 text-xs text-zinc-500 dark:text-zinc-400">
              뉴스 검색·요약 생성에 사용하는 네이버 뉴스 API, 국회 Open API, Anthropic(Claude) API는
              공개된 뉴스·의정 활동 정보만 조회·처리할 뿐 회원의 개인정보를 전달하지 않으므로 위
              위탁 대상에 포함하지 않습니다.
            </p>
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
