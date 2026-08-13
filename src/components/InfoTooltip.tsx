"use client";

import { useState } from "react";

export function InfoTooltip({ label, text }: { label: string; text: string }) {
  const [show, setShow] = useState(false);

  return (
    <div className="relative shrink-0" onMouseEnter={() => setShow(true)} onMouseLeave={() => setShow(false)}>
      <button
        type="button"
        aria-label={label}
        aria-expanded={show}
        onClick={() => setShow((v) => !v)}
        className="flex h-4 w-4 items-center justify-center rounded-full border border-zinc-300 text-[10px] leading-none text-zinc-400 transition hover:border-zinc-400 hover:text-zinc-600 dark:border-zinc-700 dark:text-zinc-500 dark:hover:border-zinc-500 dark:hover:text-zinc-300"
      >
        i
      </button>
      {show && (
        <div className="absolute right-0 top-6 z-20 w-56 rounded-lg border border-zinc-200 bg-white p-2.5 text-[11px] leading-snug text-zinc-600 shadow-lg dark:border-zinc-800 dark:bg-zinc-900 dark:text-zinc-300">
          {text}
        </div>
      )}
    </div>
  );
}
