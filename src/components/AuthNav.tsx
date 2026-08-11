"use client";

import { useRouter } from "next/navigation";
import Link from "next/link";
import { useState } from "react";
import { createClient } from "@/lib/supabase/browser";

export function AuthNav({ userEmail }: { userEmail: string | null }) {
  const router = useRouter();
  const [loading, setLoading] = useState(false);

  async function handleLogout() {
    setLoading(true);
    const supabase = createClient();
    await supabase.auth.signOut();
    router.push("/");
    router.refresh();
  }

  if (userEmail) {
    return (
      <div className="ml-auto flex items-center gap-3 text-sm">
        <Link href="/mypage" className="text-zinc-600 hover:underline dark:text-zinc-400">
          마이페이지
        </Link>
        <span className="text-zinc-500 dark:text-zinc-400">{userEmail}</span>
        <button
          onClick={handleLogout}
          disabled={loading}
          className="text-zinc-600 hover:underline disabled:opacity-50 dark:text-zinc-400"
        >
          로그아웃
        </button>
      </div>
    );
  }

  return (
    <div className="ml-auto flex items-center gap-4 text-sm">
      <Link href="/login" className="text-zinc-600 hover:underline dark:text-zinc-400">
        로그인
      </Link>
      <Link href="/signup" className="text-zinc-600 hover:underline dark:text-zinc-400">
        회원가입
      </Link>
    </div>
  );
}
