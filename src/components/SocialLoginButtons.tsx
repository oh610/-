"use client";

import { useState } from "react";
import { createClient } from "@/lib/supabase/browser";

// 카카오는 Supabase의 카카오 프로바이더가 account_email 동의항목을 강제로 요청하는데,
// 저희 카카오 앱은 비즈 인증 전이라 그 항목이 없어 KOE205 에러가 남 (비즈 인증 후 다시 노출 예정).
export function SocialLoginButtons() {
  const [loading, setLoading] = useState<"google" | null>(null);

  async function handleOAuth(provider: "google") {
    setLoading(provider);
    const supabase = createClient();
    await supabase.auth.signInWithOAuth({
      provider,
      options: { redirectTo: `${window.location.origin}/auth/callback` },
    });
  }

  return (
    <div className="flex flex-col gap-2">
      <div className="my-1 flex items-center gap-2">
        <div className="h-px flex-1 bg-zinc-200 dark:bg-zinc-800" />
        <span className="text-xs text-zinc-400 dark:text-zinc-500">또는</span>
        <div className="h-px flex-1 bg-zinc-200 dark:bg-zinc-800" />
      </div>

      <button
        type="button"
        onClick={() => handleOAuth("google")}
        disabled={loading !== null}
        className="flex items-center justify-center gap-2 rounded-lg border border-zinc-300 bg-white px-4 py-2 text-sm font-medium text-zinc-700 disabled:opacity-50 dark:border-zinc-700 dark:bg-zinc-900 dark:text-zinc-200"
      >
        {loading === "google" ? "이동 중..." : "Google로 계속하기"}
      </button>
    </div>
  );
}
