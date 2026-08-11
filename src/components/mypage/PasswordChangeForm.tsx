"use client";

import { useState, type FormEvent } from "react";
import { createClient } from "@/lib/supabase/browser";

export function PasswordChangeForm() {
  const [password, setPassword] = useState("");
  const [passwordConfirm, setPasswordConfirm] = useState("");
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [saved, setSaved] = useState(false);

  async function handleSubmit(e: FormEvent) {
    e.preventDefault();
    setError(null);
    setSaved(false);

    if (password.length < 6) {
      setError("비밀번호는 6자 이상이어야 합니다.");
      return;
    }
    if (password !== passwordConfirm) {
      setError("비밀번호가 일치하지 않습니다.");
      return;
    }

    setSaving(true);
    const supabase = createClient();
    const { error: updateError } = await supabase.auth.updateUser({ password });
    setSaving(false);

    if (updateError) {
      setError(updateError.message);
      return;
    }
    setPassword("");
    setPasswordConfirm("");
    setSaved(true);
  }

  return (
    <form onSubmit={handleSubmit} className="flex flex-col gap-2 sm:max-w-sm">
      <input
        type="password"
        placeholder="새 비밀번호 (6자 이상)"
        value={password}
        onChange={(e) => setPassword(e.target.value)}
        className="rounded-lg border border-zinc-300 bg-white px-4 py-2 text-sm text-zinc-900 dark:border-zinc-700 dark:bg-zinc-900 dark:text-zinc-100"
      />
      <input
        type="password"
        placeholder="새 비밀번호 확인"
        value={passwordConfirm}
        onChange={(e) => setPasswordConfirm(e.target.value)}
        className="rounded-lg border border-zinc-300 bg-white px-4 py-2 text-sm text-zinc-900 dark:border-zinc-700 dark:bg-zinc-900 dark:text-zinc-100"
      />
      <button
        type="submit"
        disabled={saving}
        className="w-fit rounded-lg border border-zinc-300 px-4 py-2 text-sm text-zinc-700 disabled:opacity-50 dark:border-zinc-700 dark:text-zinc-300"
      >
        {saving ? "변경 중..." : "비밀번호 변경"}
      </button>
      {saved && <span className="text-sm text-emerald-600 dark:text-emerald-400">변경되었습니다.</span>}
      {error && <p className="text-sm text-rose-600 dark:text-rose-400">{error}</p>}
    </form>
  );
}
