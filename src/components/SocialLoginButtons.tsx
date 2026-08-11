"use client";

import { useState } from "react";
import { createClient } from "@/lib/supabase/browser";

export function SocialLoginButtons() {
  const [loading, setLoading] = useState<"google" | "kakao" | null>(null);

  async function handleOAuth(provider: "google" | "kakao") {
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

      <button
        type="button"
        onClick={() => handleOAuth("kakao")}
        disabled={loading !== null}
        className="flex items-center justify-center gap-2 rounded-lg bg-[#FEE500] px-4 py-2 text-sm font-medium text-[#191919] disabled:opacity-50"
      >
        {loading === "kakao" ? "이동 중..." : "카카오로 계속하기"}
      </button>
    </div>
  );
}
