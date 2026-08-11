"use client";

import { useEffect, useState } from "react";
import { createClient } from "@/lib/supabase/browser";

const STORAGE_KEY = "reviewPromptDone";

export function ReviewPromptPopup() {
  const [visible, setVisible] = useState(false);
  const [content, setContent] = useState("");
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [done, setDone] = useState(false);

  useEffect(() => {
    if (typeof window === "undefined") return;
    if (localStorage.getItem(STORAGE_KEY)) return;

    const timer = setTimeout(() => setVisible(true), 4000);
    return () => clearTimeout(timer);
  }, []);

  function close() {
    setVisible(false);
    localStorage.setItem(STORAGE_KEY, "1");
  }

  async function handleSubmit() {
    setError(null);
    const trimmed = content.trim();
    if (trimmed.length < 1) {
      setError("후기를 입력해 주세요.");
      return;
    }

    setSubmitting(true);
    const supabase = createClient();
    const {
      data: { user },
    } = await supabase.auth.getUser();

    if (!user) {
      setSubmitting(false);
      setError("로그인이 필요합니다.");
      return;
    }

    const { data: profile } = await supabase
      .from("users")
      .select("nickname")
      .eq("id", user.id)
      .maybeSingle();
    const displayName = profile?.nickname || user.email?.split("@")[0] || "익명";

    const { error: insertError } = await supabase.from("reviews").insert({
      user_id: user.id,
      display_name: displayName,
      content: trimmed,
    });
    setSubmitting(false);

    if (insertError) {
      setError("후기 등록에 실패했습니다.");
      return;
    }

    setDone(true);
    localStorage.setItem(STORAGE_KEY, "1");
    setTimeout(close, 1500);
  }

  if (!visible) return null;

  return (
    <div className="fixed inset-x-0 bottom-4 z-50 flex justify-center px-4">
      <div className="w-full max-w-sm rounded-2xl border border-zinc-200 bg-white p-5 shadow-lg dark:border-zinc-800 dark:bg-zinc-950">
        {done ? (
          <p className="text-center text-sm text-emerald-600 dark:text-emerald-400">
            소중한 후기 감사합니다!
          </p>
        ) : (
          <>
            <div className="flex items-start justify-between gap-2">
              <p className="text-sm text-zinc-700 dark:text-zinc-300">
                당신의 후기 한 줄이 사이트 운영에 큰 도움이 됩니다 :)
              </p>
              <button
                onClick={close}
                aria-label="닫기"
                className="shrink-0 text-zinc-400 hover:text-zinc-600 dark:hover:text-zinc-200"
              >
                ✕
              </button>
            </div>
            <textarea
              value={content}
              onChange={(e) => setContent(e.target.value)}
              maxLength={300}
              rows={2}
              placeholder="한 줄 후기를 남겨주세요"
              className="mt-3 w-full resize-none rounded-lg border border-zinc-300 bg-white px-3 py-2 text-sm text-zinc-900 dark:border-zinc-700 dark:bg-zinc-900 dark:text-zinc-100"
            />
            {error && <p className="mt-1 text-xs text-rose-600 dark:text-rose-400">{error}</p>}
            <button
              onClick={handleSubmit}
              disabled={submitting}
              className="mt-2 w-full rounded-lg bg-zinc-900 px-4 py-2 text-sm font-medium text-white disabled:opacity-50 dark:bg-zinc-100 dark:text-zinc-900"
            >
              {submitting ? "등록 중..." : "후기 남기기"}
            </button>
          </>
        )}
      </div>
    </div>
  );
}
