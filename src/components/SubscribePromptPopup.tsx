"use client";

import Link from "next/link";
import { useEffect, useState } from "react";

const STORAGE_KEY = "subscribePromptShown";

export function SubscribePromptPopup() {
  const [visible, setVisible] = useState(false);

  useEffect(() => {
    if (typeof window === "undefined") return;
    if (sessionStorage.getItem(STORAGE_KEY)) return;

    const timer = setTimeout(() => setVisible(true), 3000);
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
        <span className="text-4xl">🔓</span>
        <h2 className="mt-3 text-base font-semibold text-zinc-900 dark:text-zinc-50">
          구독하고 더 많은 정치 뉴스를 만나보세요
        </h2>
        <p className="mt-2 text-sm text-zinc-600 dark:text-zinc-400">
          광고 없이, 지난 뉴스 요약까지 전부 확인할 수 있어요.
        </p>
        <Link href="/pricing" className="btn-primary mt-4 w-full">
          구독하기
        </Link>
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
