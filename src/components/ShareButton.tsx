"use client";

import { useState } from "react";

export function ShareButton({ title, text, url }: { title: string; text: string; url: string }) {
  const [menuOpen, setMenuOpen] = useState(false);
  const [copied, setCopied] = useState(false);

  async function handleShareClick() {
    if (typeof navigator !== "undefined" && typeof navigator.share === "function") {
      try {
        await navigator.share({ title, text, url });
      } catch {
        // 사용자가 공유를 취소한 경우 등은 무시
      }
      return;
    }
    setMenuOpen(true);
  }

  async function handleCopyLink() {
    await navigator.clipboard.writeText(url);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  }

  const mailHref = `mailto:?subject=${encodeURIComponent(title)}&body=${encodeURIComponent(`${text}\n\n${url}`)}`;

  return (
    <div className="relative">
      <button
        type="button"
        onClick={handleShareClick}
        className="flex items-center gap-1 rounded-full bg-zinc-100 px-2.5 py-1 text-xs font-medium text-zinc-600 hover:bg-zinc-200 dark:bg-zinc-800 dark:text-zinc-300 dark:hover:bg-zinc-700"
      >
        <span aria-hidden>🔗</span>
        공유
      </button>

      {menuOpen && (
        <>
          <div className="fixed inset-0 z-40" onClick={() => setMenuOpen(false)} />
          <div className="absolute right-0 z-50 mt-2 w-44 rounded-xl border border-zinc-200 bg-white p-1.5 shadow-lg dark:border-zinc-800 dark:bg-zinc-900">
            <button
              type="button"
              onClick={handleCopyLink}
              className="w-full rounded-lg px-3 py-2 text-left text-sm text-zinc-700 hover:bg-zinc-100 dark:text-zinc-300 dark:hover:bg-zinc-800"
            >
              {copied ? "링크가 복사됐어요 ✓" : "링크 복사"}
            </button>
            <a
              href={mailHref}
              className="block w-full rounded-lg px-3 py-2 text-left text-sm text-zinc-700 hover:bg-zinc-100 dark:text-zinc-300 dark:hover:bg-zinc-800"
              onClick={() => setMenuOpen(false)}
            >
              이메일로 보내기
            </a>
          </div>
        </>
      )}
    </div>
  );
}
