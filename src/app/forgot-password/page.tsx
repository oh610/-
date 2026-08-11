"use client";

import Link from "next/link";
import { useState, type FormEvent } from "react";
import { createClient } from "@/lib/supabase/browser";

export default function ForgotPasswordPage() {
  const [email, setEmail] = useState("");
  const [error, setError] = useState<string | null>(null);
  const [successMessage, setSuccessMessage] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);

  async function handleSubmit(e: FormEvent) {
    e.preventDefault();
    setError(null);
    setSuccessMessage(null);
    setLoading(true);

    const supabase = createClient();
    const { error: resetError } = await supabase.auth.resetPasswordForEmail(email, {
      redirectTo: `${window.location.origin}/reset-password`,
    });
    setLoading(false);

    if (resetError) {
      setError(resetError.message);
      return;
    }

    setSuccessMessage("비밀번호 재설정 링크를 이메일로 보냈습니다. 메일함을 확인해 주세요.");
  }

  return (
    <div className="flex min-h-screen flex-col items-center bg-zinc-50 px-4 py-16 dark:bg-black">
      <main className="w-full max-w-sm">
        <h1 className="mb-2 text-lg font-medium text-zinc-500 dark:text-zinc-400">
          비밀번호 찾기
        </h1>
        <p className="mb-6 text-sm text-zinc-500 dark:text-zinc-400">
          가입한 이메일을 입력하시면 비밀번호 재설정 링크를 보내드립니다.
        </p>

        <form onSubmit={handleSubmit} className="flex flex-col gap-3">
          <input
            type="email"
            required
            placeholder="이메일"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            className="rounded-lg border border-zinc-300 bg-white px-4 py-2 text-zinc-900 dark:border-zinc-700 dark:bg-zinc-900 dark:text-zinc-100"
          />

          {error && <p className="text-sm text-rose-600 dark:text-rose-400">{error}</p>}
          {successMessage && (
            <p className="text-sm text-emerald-600 dark:text-emerald-400">{successMessage}</p>
          )}

          <button
            type="submit"
            disabled={loading}
            className="rounded-lg bg-zinc-900 px-4 py-2 text-white disabled:opacity-50 dark:bg-zinc-100 dark:text-zinc-900"
          >
            {loading ? "전송 중..." : "재설정 링크 보내기"}
          </button>
        </form>

        <p className="mt-4 text-sm text-zinc-500 dark:text-zinc-400">
          <Link href="/login" className="text-zinc-900 hover:underline dark:text-zinc-100">
            로그인으로 돌아가기
          </Link>
        </p>
      </main>
    </div>
  );
}
