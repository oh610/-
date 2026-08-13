"use client";

import { useEffect, useRef, useState, type ReactNode } from "react";

const LABELS = ["🆕 법안", "🔍 검색", "🔥 활동"];

export function MembersSwipeContainer({ children }: { children: ReactNode }) {
  const ref = useRef<HTMLDivElement>(null);
  const [active, setActive] = useState(1);

  useEffect(() => {
    const el = ref.current;
    if (!el || window.matchMedia("(min-width: 1024px)").matches) return;
    // 3개 화면 중 가운데(검색)에서 시작
    el.scrollLeft = el.clientWidth;
  }, []);

  function handleScroll() {
    const el = ref.current;
    if (!el || el.clientWidth === 0) return;
    setActive(Math.round(el.scrollLeft / el.clientWidth));
  }

  function scrollToIndex(i: number) {
    const el = ref.current;
    if (!el) return;
    el.scrollTo({ left: i * el.clientWidth, behavior: "smooth" });
  }

  return (
    <div>
      <div ref={ref} onScroll={handleScroll} className="members-layout mx-auto w-full max-w-7xl">
        {children}
      </div>
      <div className="mt-3 flex justify-center gap-4 lg:hidden">
        {LABELS.map((label, i) => (
          <button
            key={label}
            type="button"
            onClick={() => scrollToIndex(i)}
            className={`flex flex-col items-center gap-1 text-xs transition ${
              active === i ? "text-violet-600 dark:text-violet-400" : "text-zinc-400 dark:text-zinc-600"
            }`}
          >
            <span
              className={`h-1.5 rounded-full transition-all ${
                active === i ? "w-6 bg-violet-500" : "w-1.5 bg-zinc-300 dark:bg-zinc-700"
              }`}
            />
            {label}
          </button>
        ))}
      </div>
    </div>
  );
}
