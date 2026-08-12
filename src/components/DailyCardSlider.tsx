"use client";

import Link from "next/link";
import { useState, type ReactNode } from "react";
import { SummaryCardView } from "@/components/SummaryCard";
import type { SummaryCard } from "@/types/summary-card";

function ArchiveLinkPanel() {
  return (
    <div className="flex h-full min-h-[300px] w-full max-w-2xl flex-col items-center justify-center gap-3 rounded-2xl border border-zinc-200 bg-white p-8 text-center shadow-sm dark:border-zinc-800 dark:bg-zinc-950">
      <span className="text-4xl">🗂️</span>
      <p className="text-sm text-zinc-600 dark:text-zinc-400">지난 뉴스 요약을 모두 열람할 수 있어요</p>
      <Link href="/archive" className="btn-primary mt-2">
        지난 뉴스 전체 보기
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
  pastCards = [],
}: {
  children: ReactNode;
  pastCards?: SummaryCard[];
}) {
  const [index, setIndex] = useState(0); // 0 오늘, 음수 과거(최근일수록 -1에 가까움), 1 내일

  const minIndex = -(pastCards.length + 1);
  const maxIndex = 1;
  const oldestFirstPastCards = [...pastCards].reverse();

  const slides: ReactNode[] = [
    <ArchiveLinkPanel key="archive-link" />,
    ...oldestFirstPastCards.map((c) => <SummaryCardView key={c.id} card={c} />),
    children,
    <TomorrowPanel key="tomorrow" />,
  ];

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
        onClick={() => setIndex((i) => Math.max(minIndex, i - 1))}
        disabled={index <= minIndex}
        className="absolute -left-4 z-10 flex h-9 w-9 items-center justify-center rounded-full border border-zinc-200 bg-white text-zinc-500 shadow-sm hover:text-zinc-900 disabled:opacity-30 sm:-left-12 dark:border-zinc-800 dark:bg-zinc-950 dark:text-zinc-400 dark:hover:text-zinc-50"
      >
        ‹
      </button>

      <div className="w-full overflow-hidden">
        <div
          className="flex transition-transform duration-500 ease-out"
          style={{ transform: `translateX(${-(index - minIndex) * 100}%)` }}
        >
          {slides.map((slide, i) => (
            <div key={i} className="w-full shrink-0 px-1">
              {slide}
            </div>
          ))}
        </div>
      </div>

      <button
        type="button"
        aria-label="내일 업데이트 안내"
        onClick={() => setIndex((i) => Math.min(maxIndex, i + 1))}
        disabled={index >= maxIndex}
        className="absolute -right-4 z-10 flex h-9 w-9 items-center justify-center rounded-full border border-zinc-200 bg-white text-zinc-500 shadow-sm hover:text-zinc-900 disabled:opacity-30 sm:-right-12 dark:border-zinc-800 dark:bg-zinc-950 dark:text-zinc-400 dark:hover:text-zinc-50"
      >
        ›
      </button>
    </div>
  );
}
