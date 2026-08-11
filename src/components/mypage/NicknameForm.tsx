"use client";

import { useState, type FormEvent } from "react";
import { createClient } from "@/lib/supabase/browser";

export function NicknameForm({ userId, initialNickname }: { userId: string; initialNickname: string }) {
  const [nickname, setNickname] = useState(initialNickname);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [saved, setSaved] = useState(false);

  async function handleSubmit(e: FormEvent) {
    e.preventDefault();
    setError(null);
    setSaved(false);

    const trimmed = nickname.trim();
    if (trimmed.length < 1 || trimmed.length > 20) {
      setError("닉네임은 1자 이상 20자 이하로 입력해 주세요.");
      return;
    }

    setSaving(true);
    const supabase = createClient();
    const { error: updateError } = await supabase
      .from("users")
      .update({ nickname: trimmed })
      .eq("id", userId);
    setSaving(false);

    if (updateError) {
      setError(updateError.message);
      return;
    }
    setSaved(true);
  }

  return (
    <form onSubmit={handleSubmit} className="flex flex-wrap items-center gap-2">
      <input
        type="text"
        maxLength={20}
        value={nickname}
        onChange={(e) => setNickname(e.target.value)}
        placeholder="닉네임"
        className="rounded-lg border border-zinc-300 bg-white px-4 py-2 text-sm text-zinc-900 dark:border-zinc-700 dark:bg-zinc-900 dark:text-zinc-100"
      />
      <button
        type="submit"
        disabled={saving}
        className="rounded-lg border border-zinc-300 px-4 py-2 text-sm text-zinc-700 disabled:opacity-50 dark:border-zinc-700 dark:text-zinc-300"
      >
        {saving ? "저장 중..." : "저장"}
      </button>
      {saved && <span className="text-sm text-emerald-600 dark:text-emerald-400">저장되었습니다.</span>}
      {error && <p className="w-full text-sm text-rose-600 dark:text-rose-400">{error}</p>}
    </form>
  );
}
