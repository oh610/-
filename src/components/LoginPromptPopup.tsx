"use client";

import Link from "next/link";
import { useEffect, useState } from "react";

const STORAGE_KEY = "loginPromptShown";
const DELAY_MS = 15000;

export function LoginPromptPopup() {
  const [visible, setVisible] = useState(false);

  useEffect(() => {
    if (typeof window === "undefined") return;
    if (sessionStorage.getItem(STORAGE_KEY)) return;

    const timer = setTimeout(() => setVisible(true), DELAY_MS);
    return () => clearTimeout(timer);
  }, []);

  function close() {
    setVisible(false);
    sessionStorage.setItem(STORAGE_KEY, "1");
  }

  if (!visible) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 px-4">
      <div className="relative w-full max-w-sm rounded-2xl border border-zinc-200 bg-white p-6 text-center shadow-lg dark:border-zinc-800 dark:bg-zinc-950">
        <button
          onClick={close}
          aria-label="닫기"
          className="absolute right-4 top-4 text-zinc-400 hover:text-zinc-600 dark:hover:text-zinc-200"
        >
          ✕
        </button>
        <span className="text-4xl">👋</span>
        <h2 className="mt-3 text-base font-semibold text-zinc-900 dark:text-zinc-50">
          로그인하고 더 많은 기능을 이용해보세요
        </h2>
        <p className="mt-2 text-sm text-zinc-600 dark:text-zinc-400">
          지난 뉴스 요약, 국회의원 정보, 마이페이지까지 로그인하면 모두 이용할 수 있어요.
        </p>
        <div className="mt-4 flex gap-2">
          <Link href="/login" className="btn-secondary flex-1" onClick={close}>
            로그인
          </Link>
          <Link href="/signup" className="btn-primary flex-1" onClick={close}>
            회원가입
          </Link>
        </div>
        <button
          onClick={close}
          className="mt-2 w-full text-xs text-zinc-400 hover:text-zinc-600 dark:hover:text-zinc-300"
        >
          나중에 할게요
        </button>
      </div>
    </div>
  );
}
