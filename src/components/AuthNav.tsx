"use client";

import { useRouter } from "next/navigation";
import Link from "next/link";
import { useState } from "react";
import { createClient } from "@/lib/supabase/browser";

export function AuthNav({
  isLoggedIn,
  userEmail,
  nickname,
}: {
  isLoggedIn: boolean;
  userEmail: string | null;
  nickname?: string | null;
}) {
  const router = useRouter();
  const [loading, setLoading] = useState(false);

  async function handleLogout() {
    setLoading(true);
    const supabase = createClient();
    await supabase.auth.signOut();
    router.push("/");
    router.refresh();
  }

  if (isLoggedIn) {
    return (
      <div className="ml-auto flex shrink-0 items-center gap-2.5 text-[13px] whitespace-nowrap sm:gap-3 sm:text-sm">
        <Link href="/mypage" className="text-amber-50 hover:text-white hover:underline">
          마이페이지
        </Link>
        <span className="text-amber-50">{nickname ? `${nickname}님` : (userEmail ?? "회원님")}</span>
        <button
          onClick={handleLogout}
          disabled={loading}
          className="text-amber-50 hover:text-white hover:underline disabled:opacity-50"
        >
          로그아웃
        </button>
      </div>
    );
  }

  return (
    <div className="ml-auto flex shrink-0 items-center gap-3 text-[13px] whitespace-nowrap sm:gap-4 sm:text-sm">
      <Link href="/login" className="text-amber-50 hover:text-white hover:underline">
        로그인
      </Link>
      <Link href="/signup" className="text-amber-50 hover:text-white hover:underline">
        회원가입
      </Link>
    </div>
  );
}
