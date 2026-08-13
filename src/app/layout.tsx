import type { Metadata, Viewport } from "next";
import { Geist, Geist_Mono } from "next/font/google";
import Link from "next/link";
import { Analytics } from "@vercel/analytics/next";
import { AuthNav } from "@/components/AuthNav";
import { MainNav } from "@/components/MainNav";
import { AdBanner } from "@/components/AdBanner";
import { BetaNoticePopup } from "@/components/BetaNoticePopup";
import { createClient } from "@/lib/supabase/server";
import { hasFullAccess } from "@/lib/access";
import "./globals.css";

const ADFIT_UNIT_ID = process.env.NEXT_PUBLIC_ADFIT_UNIT_ID;

const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
});

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
});

const SITE_URL = process.env.NEXT_PUBLIC_SITE_URL ?? "https://polispoon.vercel.app";
const SITE_DESCRIPTION =
  "매일 하나의 정치 이슈를 골라 여당·야당의 논리를 나란히 비교하는 정치 뉴스 요약 서비스, 정론관.";

export const metadata: Metadata = {
  metadataBase: new URL(SITE_URL),
  title: {
    default: "정론관 | 진보·보수 양쪽 입장을 한눈에",
    template: "%s | 정론관",
  },
  description: SITE_DESCRIPTION,
  openGraph: {
    type: "website",
    locale: "ko_KR",
    siteName: "정론관",
    title: "정론관 | 진보·보수 양쪽 입장을 한눈에",
    description: SITE_DESCRIPTION,
    url: SITE_URL,
  },
  twitter: {
    card: "summary",
    title: "정론관 | 진보·보수 양쪽 입장을 한눈에",
    description: SITE_DESCRIPTION,
  },
  verification: {
    google: "S3BE9_o0O6-JXh6qVAYCJhfUYVsBgLbRziQkVzPSD_s",
    other: {
      "naver-site-verification": "d02251146c69e7dc74092b09de504ba4fad8dbc6",
    },
  },
};

export const viewport: Viewport = {
  width: "device-width",
  initialScale: 1,
};

export default async function RootLayout({ children }: LayoutProps<"/">) {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  let tier: string | null = null;
  let nickname: string | null = null;
  let isAdmin = false;
  let trialExpiresAt: string | null = null;
  if (user) {
    const { data } = await supabase
      .from("users")
      .select("tier, nickname, is_admin, trial_expires_at")
      .eq("id", user.id)
      .maybeSingle();
    tier = data?.tier ?? null;
    nickname = data?.nickname ?? null;
    isAdmin = data?.is_admin ?? false;
    trialExpiresAt = data?.trial_expires_at ?? null;
  }
  const showAd = ADFIT_UNIT_ID && !hasFullAccess(tier, isAdmin, trialExpiresAt);

  return (
    <html
      lang="ko"
      className={`${geistSans.variable} ${geistMono.variable} h-full antialiased`}
    >
      <body className="min-h-full flex flex-col">
        <nav className="sticky top-0 z-40 flex flex-wrap items-center gap-x-4 gap-y-1.5 bg-zinc-950 px-3 py-2.5 text-[13px] sm:gap-x-6 sm:px-6 sm:py-3.5 sm:text-sm">
          <Link href="/" className="shrink-0 text-base font-bold text-white sm:text-lg">
            정론<span className="text-violet-400">관</span>
          </Link>
          <MainNav />
          {isAdmin && (
            <Link
              href="/admin"
              className="shrink-0 rounded-full bg-violet-400/10 px-2.5 py-1 text-xs font-semibold text-violet-400 transition hover:bg-violet-400/20"
            >
              관리자
            </Link>
          )}
          <AuthNav isLoggedIn={!!user} userEmail={user?.email ?? null} nickname={nickname} />
        </nav>
        {showAd && (
          <div className="border-b border-zinc-200 bg-white py-2 dark:border-zinc-800 dark:bg-zinc-950">
            <AdBanner unitId={ADFIT_UNIT_ID!} width={320} height={100} />
          </div>
        )}
        <div className="flex flex-1 flex-col">{children}</div>
        <footer className="flex flex-col items-center gap-3 border-t border-zinc-200 bg-zinc-50 px-6 py-8 text-xs text-zinc-500 dark:border-zinc-800 dark:bg-zinc-950 dark:text-zinc-400">
          <span className="text-sm font-bold text-zinc-900 dark:text-zinc-50">
            정론<span className="text-violet-500">관</span>
          </span>
          <div className="flex gap-4">
            <Link href="/terms" className="hover:underline">
              이용약관
            </Link>
            <Link href="/privacy" className="hover:underline">
              개인정보처리방침
            </Link>
            <Link href="/contact" className="hover:underline">
              문의
            </Link>
          </div>
        </footer>
        <BetaNoticePopup />
        <Analytics />
      </body>
    </html>
  );
}
