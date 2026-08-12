"use client";

import { useEffect, useState } from "react";

const STORAGE_KEY = "betaNoticeDismissed";

export function BetaNoticePopup() {
  const [visible, setVisible] = useState(false);

  useEffect(() => {
    if (typeof window === "undefined") return;
    if (localStorage.getItem(STORAGE_KEY)) return;
    setVisible(true);
  }, []);

  function close() {
    setVisible(false);
    localStorage.setItem(STORAGE_KEY, "1");
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
        <span className="text-4xl">📢</span>
        <h2 className="mt-3 text-base font-semibold text-zinc-900 dark:text-zinc-50">베타 서비스 안내</h2>
        <p className="mt-2 text-sm leading-relaxed text-zinc-600 dark:text-zinc-400">
          정론관은 현재 베타 서비스로 운영되고 있습니다. 향후 원하는 키워드를 검색하면
          즉시 요약해드리는 기능을 포함해 다양한 개선 사항이 순차적으로 제공될 예정입니다.
        </p>
        <button onClick={close} className="btn-primary mt-4 w-full">
          확인했습니다
        </button>
      </div>
    </div>
  );
}
