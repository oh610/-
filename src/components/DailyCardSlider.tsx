"use client";

import Link from "next/link";
import { useState, type ReactNode } from "react";

function PastPanel({ hasAccess }: { hasAccess: boolean }) {
  if (hasAccess) {
    return (
      <div className="flex h-full min-h-[300px] w-full max-w-2xl flex-col items-center justify-center gap-3 rounded-2xl border border-zinc-200 bg-white p-8 text-center shadow-sm dark:border-zinc-800 dark:bg-zinc-950">
        <span className="text-4xl">🗂️</span>
        <p className="text-sm text-zinc-600 dark:text-zinc-400">지난 뉴스 요약을 모두 열람할 수 있어요</p>
        <Link href="/archive" className="btn-primary mt-2">
          지난 뉴스 보러 가기
        </Link>
      </div>
    );
  }

  return (
    <div className="flex h-full min-h-[300px] w-full max-w-2xl flex-col items-center justify-center gap-3 rounded-2xl border border-zinc-200 bg-white p-8 text-center shadow-sm dark:border-zinc-800 dark:bg-zinc-950">
      <span className="text-4xl">🔒</span>
      <p className="text-sm text-zinc-600 dark:text-zinc-400">구독하면 지난 뉴스 요약을 볼 수 있어요</p>
      <Link href="/pricing" className="btn-primary mt-2">
        구독하기
      </Link>
    </div>
  );
}

function TomorrowPanel() {
  return (
    <div className="flex h-full min-h-[300px] w-full max-w-2xl flex-col items-center justify-center gap-3 rounded-2xl border border-zinc-200 bg-white p-8 text-center shadow-sm dark:border-zinc-800 dark:bg-zinc-950">
      <span className="text-4xl">🔒</span>
      <p className="text-sm text-zinc-600 dark:text-zinc-400">내일 아침 9시에 새로운 요약이 업데이트돼요</p>
    </div>
  );
}

function GhostPeek({ side }: { side: "left" | "right" }) {
  return (
    <div
      aria-hidden
      className={`pointer-events-none absolute top-3 hidden h-[calc(100%-1.5rem)] w-16 rounded-2xl bg-zinc-200/60 blur-[2px] dark:bg-zinc-800/60 sm:block ${
        side === "left" ? "-left-8" : "-right-8"
      }`}
    />
  );
}

export function DailyCardSlider({
  children,
  hasAccess = false,
}: {
  children: ReactNode;
  hasAccess?: boolean;
}) {
  const [index, setIndex] = useState(0); // -1 지난 뉴스, 0 오늘, 1 내일

  return (
    <div className="relative flex w-full max-w-2xl items-center justify-center">
      {index === 0 && (
        <>
          <GhostPeek side="left" />
          <GhostPeek side="right" />
        </>
      )}

      <button
        type="button"
        aria-label="지난 뉴스 요약"
        onClick={() => setIndex((i) => Math.max(-1, i - 1))}
        disabled={index <= -1}
        className="absolute -left-4 z-10 flex h-9 w-9 items-center justify-center rounded-full border border-zinc-200 bg-white text-zinc-500 shadow-sm hover:text-zinc-900 disabled:opacity-30 sm:-left-12 dark:border-zinc-800 dark:bg-zinc-950 dark:text-zinc-400 dark:hover:text-zinc-50"
      >
        ‹
      </button>

      <div className="w-full overflow-hidden">
        <div
          className="flex transition-transform duration-500 ease-out"
          style={{ transform: `translateX(${-(index + 1) * 100}%)` }}
        >
          <div className="w-full shrink-0 px-1">
            <PastPanel hasAccess={hasAccess} />
          </div>
          <div className="w-full shrink-0 px-1">{children}</div>
          <div className="w-full shrink-0 px-1">
            <TomorrowPanel />
          </div>
        </div>
      </div>

      <button
        type="button"
        aria-label="내일 업데이트 안내"
        onClick={() => setIndex((i) => Math.min(1, i + 1))}
        disabled={index >= 1}
        className="absolute -right-4 z-10 flex h-9 w-9 items-center justify-center rounded-full border border-zinc-200 bg-white text-zinc-500 shadow-sm hover:text-zinc-900 disabled:opacity-30 sm:-right-12 dark:border-zinc-800 dark:bg-zinc-950 dark:text-zinc-400 dark:hover:text-zinc-50"
      >
        ›
      </button>
    </div>
  );
}
