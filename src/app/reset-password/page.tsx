"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import { useEffect, useState, type FormEvent } from "react";
import { createClient } from "@/lib/supabase/browser";

type Status = "loading" | "ready" | "invalid";

export default function ResetPasswordPage() {
  const router = useRouter();
  const [status, setStatus] = useState<Status>("loading");
  const [password, setPassword] = useState("");
  const [passwordConfirm, setPasswordConfirm] = useState("");
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    const supabase = createClient();
    supabase.auth.getSession().then(({ data: { session } }) => {
      setStatus(session ? "ready" : "invalid");
    });
  }, []);

  async function handleSubmit(e: FormEvent) {
    e.preventDefault();
    setError(null);

    if (password.length < 6) {
      setError("비밀번호는 6자 이상이어야 합니다.");
      return;
    }
    if (password !== passwordConfirm) {
      setError("비밀번호가 일치하지 않습니다.");
      return;
    }

    setLoading(true);
    const supabase = createClient();
    const { error: updateError } = await supabase.auth.updateUser({ password });
    setLoading(false);

    if (updateError) {
      setError(updateError.message);
      return;
    }

    router.push("/home");
    router.refresh();
  }

  if (status === "invalid") {
    return (
      <div className="flex min-h-screen flex-col items-center bg-zinc-50 px-4 py-16 dark:bg-black">
        <main className="w-full max-w-sm text-center">
          <h1 className="mb-2 text-lg font-medium text-zinc-500 dark:text-zinc-400">
            비밀번호 재설정
          </h1>
          <p className="mb-4 text-sm text-rose-600 dark:text-rose-400">
            유효하지 않거나 만료된 링크입니다.
          </p>
          <Link href="/forgot-password" className="text-sm text-zinc-900 hover:underline dark:text-zinc-100">
            다시 요청하기
          </Link>
        </main>
      </div>
    );
  }

  if (status === "loading") {
    return (
      <div className="flex min-h-screen flex-col items-center bg-zinc-50 px-4 py-16 dark:bg-black">
        <main className="w-full max-w-sm text-center text-sm text-zinc-500 dark:text-zinc-400">
          링크 확인 중...
        </main>
      </div>
    );
  }

  return (
    <div className="flex min-h-screen flex-col items-center bg-zinc-50 px-4 py-16 dark:bg-black">
      <main className="w-full max-w-sm">
        <h1 className="mb-6 text-lg font-medium text-zinc-500 dark:text-zinc-400">
          새 비밀번호 설정
        </h1>

        <form onSubmit={handleSubmit} className="flex flex-col gap-3">
          <input
            type="password"
            required
            placeholder="새 비밀번호 (6자 이상)"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            className="rounded-lg border border-zinc-300 bg-white px-4 py-2 text-zinc-900 dark:border-zinc-700 dark:bg-zinc-900 dark:text-zinc-100"
          />
          <input
            type="password"
            required
            placeholder="새 비밀번호 확인"
            value={passwordConfirm}
            onChange={(e) => setPasswordConfirm(e.target.value)}
            className="rounded-lg border border-zinc-300 bg-white px-4 py-2 text-zinc-900 dark:border-zinc-700 dark:bg-zinc-900 dark:text-zinc-100"
          />

          {error && <p className="text-sm text-rose-600 dark:text-rose-400">{error}</p>}

          <button type="submit" disabled={loading} className="btn-primary w-full">
            {loading ? "변경 중..." : "비밀번호 변경"}
          </button>
        </form>
      </main>
    </div>
  );
}
