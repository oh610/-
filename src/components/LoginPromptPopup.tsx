"use client";

import Link from "next/link";
import { useEffect, useState } from "react";

const DELAY_MS = 15000;
const STORAGE_KEY = "loginPopupHiddenUntil";

function endOfTodayISOString() {
  const d = new Date();
  d.setHours(23, 59, 59, 999);
  return d.toISOString();
}

export function LoginPromptPopup() {
  const [visible, setVisible] = useState(false);

  useEffect(() => {
    const hiddenUntil = localStorage.getItem(STORAGE_KEY);
    if (hiddenUntil && new Date(hiddenUntil).getTime() > Date.now()) return;

    const timer = setTimeout(() => setVisible(true), DELAY_MS);
    return () => clearTimeout(timer);
  }, []);

  useEffect(() => {
    if (!visible) return;
    const original = document.body.style.overflow;
    document.body.style.overflow = "hidden";
    return () => {
      document.body.style.overflow = original;
    };
  }, [visible]);

  function handleHideToday(checked: boolean) {
    if (!checked) return;
    localStorage.setItem(STORAGE_KEY, endOfTodayISOString());
    setVisible(false);
  }

  if (!visible) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/70 px-4 backdrop-blur-sm">
      <div className="w-full max-w-sm rounded-2xl border border-zinc-200 bg-white p-7 text-center shadow-xl dark:border-zinc-800 dark:bg-zinc-950">
        <span className="text-4xl">🔒</span>
        <h2 className="mt-3 text-lg font-bold text-zinc-900 dark:text-zinc-50">
          계속 보려면 로그인이 필요해요
        </h2>
        <p className="mt-2 text-sm text-zinc-600 dark:text-zinc-400">
          정론관의 모든 콘텐츠는 로그인 후 이용할 수 있어요. 가입은 무료예요.
        </p>
        <div className="mt-5 flex flex-col gap-2">
          <Link href="/signup" className="btn-primary w-full">
            회원가입
          </Link>
          <Link href="/login" className="btn-secondary w-full">
            로그인
          </Link>
        </div>
        <label className="mt-4 flex items-center justify-center gap-1.5 text-xs text-zinc-400 dark:text-zinc-500">
          <input
            type="checkbox"
            onChange={(e) => handleHideToday(e.target.checked)}
            className="h-3.5 w-3.5 rounded border-zinc-300 dark:border-zinc-700"
          />
          오늘 하루만 보지 않기
        </label>
      </div>
    </div>
  );
}
