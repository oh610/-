"use client";

import { useRouter } from "next/navigation";
import { useState, type FormEvent } from "react";
import { createClient } from "@/lib/supabase/browser";

const CONFIRM_TEXT = "탈퇴합니다";

export function DeleteAccountForm() {
  const router = useRouter();
  const [confirmInput, setConfirmInput] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  async function handleSubmit(e: FormEvent) {
    e.preventDefault();
    setError(null);

    if (confirmInput !== CONFIRM_TEXT) {
      setError(`탈퇴하려면 "${CONFIRM_TEXT}"를 정확히 입력해 주세요.`);
      return;
    }

    setLoading(true);
    try {
      const res = await fetch("/api/account/delete", { method: "POST" });
      const data = await res.json().catch(() => ({}));
      if (!res.ok) {
        setError(data.error ?? "회원 탈퇴에 실패했습니다.");
        setLoading(false);
        return;
      }

      const supabase = createClient();
      await supabase.auth.signOut();
      router.push("/");
      router.refresh();
    } catch {
      setError("회원 탈퇴에 실패했습니다.");
      setLoading(false);
    }
  }

  return (
    <form onSubmit={handleSubmit} className="flex flex-col gap-2 sm:max-w-sm">
      <p className="text-sm text-zinc-500 dark:text-zinc-400">
        탈퇴 시 계정 정보와 구독/후원 내역이 삭제되며, 진행 중인 구독은 자동으로 해지됩니다. 이 작업은 되돌릴 수
        없습니다.
      </p>
      <label className="text-sm text-zinc-600 dark:text-zinc-400">
        계속하려면 아래에 <span className="font-medium text-zinc-900 dark:text-zinc-100">{CONFIRM_TEXT}</span>를
        입력하세요.
      </label>
      <input
        type="text"
        value={confirmInput}
        onChange={(e) => setConfirmInput(e.target.value)}
        placeholder={CONFIRM_TEXT}
        className="rounded-lg border border-zinc-300 bg-white px-4 py-2 text-sm text-zinc-900 dark:border-zinc-700 dark:bg-zinc-900 dark:text-zinc-100"
      />
      <button
        type="submit"
        disabled={loading}
        className="w-fit rounded-lg bg-rose-600 px-4 py-2 text-sm font-medium text-white disabled:opacity-50"
      >
        {loading ? "처리 중..." : "회원 탈퇴"}
      </button>
      {error && <p className="text-sm text-rose-600 dark:text-rose-400">{error}</p>}
    </form>
  );
}
