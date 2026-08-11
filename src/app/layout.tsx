import type { Metadata } from "next";
import { Geist, Geist_Mono } from "next/font/google";
import Link from "next/link";
import { AuthNav } from "@/components/AuthNav";
import { AdBanner } from "@/components/AdBanner";
import { createClient } from "@/lib/supabase/server";
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

export const metadata: Metadata = {
  title: "정치한스푼",
  description: "진보·보수 양쪽 입장을 한눈에 비교하는 정치 뉴스 요약 서비스",
};

export default async function RootLayout({ children }: LayoutProps<"/">) {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  let tier: string | null = null;
  let nickname: string | null = null;
  if (user) {
    const { data } = await supabase.from("users").select("tier, nickname").eq("id", user.id).maybeSingle();
    tier = data?.tier ?? null;
    nickname = data?.nickname ?? null;
  }
  const showAd = ADFIT_UNIT_ID && tier !== "유료";

  return (
    <html
      lang="ko"
      className={`${geistSans.variable} ${geistMono.variable} h-full antialiased`}
    >
      <body className="min-h-full flex flex-col">
        <nav className="flex items-center gap-5 bg-amber-600 px-6 py-3 text-sm dark:bg-amber-800">
          <Link href="/" className="font-bold text-white">
            정치한스푼
          </Link>
          <Link href="/home" className="text-amber-50 hover:text-white hover:underline">
            오늘의 요약
          </Link>
          <Link href="/archive" className="text-amber-50 hover:text-white hover:underline">
            지난 뉴스 요약
          </Link>
          <Link href="/members" className="text-amber-50 hover:text-white hover:underline">
            국회의원 정보
          </Link>
          <Link href="/pricing" className="text-amber-50 hover:text-white hover:underline">
            요금제
          </Link>
          <Link href="/guide" className="text-amber-50 hover:text-white hover:underline">
            사용 방법
          </Link>
          <Link href="/contact" className="text-amber-50 hover:text-white hover:underline">
            문의
          </Link>
          <AuthNav isLoggedIn={!!user} userEmail={user?.email ?? null} nickname={nickname} />
        </nav>
        {showAd && (
          <div className="border-b border-zinc-200 bg-white py-2 dark:border-zinc-800 dark:bg-zinc-950">
            <AdBanner unitId={ADFIT_UNIT_ID!} width={320} height={100} />
          </div>
        )}
        <div className="flex flex-1 flex-col">{children}</div>
        <footer className="flex justify-center gap-4 border-t border-zinc-200 px-6 py-4 text-xs text-zinc-500 dark:border-zinc-800 dark:text-zinc-400">
          <Link href="/terms" className="hover:underline">
            이용약관
          </Link>
          <Link href="/privacy" className="hover:underline">
            개인정보처리방침
          </Link>
          <Link href="/contact" className="hover:underline">
            문의
          </Link>
        </footer>
      </body>
    </html>
  );
}
