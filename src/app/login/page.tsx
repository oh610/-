"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import { useState, type FormEvent } from "react";
import { createClient } from "@/lib/supabase/browser";
import { SocialLoginButtons } from "@/components/SocialLoginButtons";
import { ReviewCarousel } from "@/components/ReviewCarousel";

export default function LoginPage() {
  const router = useRouter();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);

  async function handleSubmit(e: FormEvent) {
    e.preventDefault();
    setError(null);
    setLoading(true);

    const supabase = createClient();
    const { error: signInError } = await supabase.auth.signInWithPassword({ email, password });
    setLoading(false);

    if (signInError) {
      setError(signInError.message);
      return;
    }

    router.push("/home");
    router.refresh();
  }

  return (
    <div className="flex min-h-screen flex-col items-center bg-zinc-50 px-4 py-16 dark:bg-black">
      <main className="w-full max-w-sm">
        <h1 className="mb-6 text-2xl font-bold text-zinc-950 dark:text-zinc-50">로그인</h1>

        <form onSubmit={handleSubmit} className="flex flex-col gap-3">
          <input
            type="email"
            required
            placeholder="이메일"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            className="rounded-xl border border-zinc-300 bg-white px-4 py-2.5 text-zinc-900 outline-none transition focus:border-violet-500 dark:border-zinc-700 dark:bg-zinc-900 dark:text-zinc-100"
          />
          <input
            type="password"
            required
            placeholder="비밀번호"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            className="rounded-xl border border-zinc-300 bg-white px-4 py-2.5 text-zinc-900 outline-none transition focus:border-violet-500 dark:border-zinc-700 dark:bg-zinc-900 dark:text-zinc-100"
          />

          {error && <p className="text-sm text-rose-600 dark:text-rose-400">{error}</p>}

          <button type="submit" disabled={loading} className="btn-primary mt-1 w-full">
            {loading ? "로그인 중..." : "로그인"}
          </button>
        </form>

        <div className="mt-4">
          <SocialLoginButtons />
        </div>

        <p className="mt-3 text-sm text-zinc-500 dark:text-zinc-400">
          <Link href="/forgot-password" className="font-medium text-violet-600 hover:underline dark:text-violet-400">
            비밀번호를 잊으셨나요?
          </Link>
        </p>

        <p className="mt-4 text-sm text-zinc-500 dark:text-zinc-400">
          계정이 없으신가요?{" "}
          <Link href="/signup" className="font-medium text-violet-600 hover:underline dark:text-violet-400">
            회원가입
          </Link>
        </p>
      </main>

      <div className="mt-12 w-full">
        <ReviewCarousel />
      </div>
    </div>
  );
}
