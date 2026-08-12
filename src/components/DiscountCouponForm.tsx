"use client";

import { useState, type FormEvent } from "react";
import { getPaddle } from "@/lib/paddle/browser";

export function DiscountCouponForm({ code }: { code: string }) {
  const [value, setValue] = useState(code);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  async function handleSubmit(e: FormEvent) {
    e.preventDefault();
    setError(null);
    setLoading(true);
    try {
      const res = await fetch("/api/paddle/subscribe-discount", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ code: value }),
      });
      const data = await res.json();
      if (!res.ok) {
        setError(data.error ?? "쿠폰 적용에 실패했습니다.");
        return;
      }

      const paddle = await getPaddle();
      if (!paddle) {
        setError("결제 모듈을 불러오지 못했습니다.");
        return;
      }
      paddle.Checkout.open({ transactionId: data.transactionId });
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="mb-10 rounded-2xl border border-violet-200 bg-violet-50 p-5 dark:border-violet-900 dark:bg-violet-950/30">
      <p className="text-sm font-semibold text-violet-800 dark:text-violet-300">
        🎟️ 20% 할인 쿠폰(3개월)이 도착했어요
      </p>
      <p className="mt-1 text-sm text-violet-700 dark:text-violet-400">
        아래에 쿠폰 코드를 입력하면 월 3,920원으로 3개월간 구독할 수 있어요. 이후 자동으로 정상가로 전환돼요.
      </p>
      <form onSubmit={handleSubmit} className="mt-3 flex flex-col gap-2 sm:flex-row">
        <input
          type="text"
          value={value}
          onChange={(e) => setValue(e.target.value)}
          placeholder="쿠폰 코드"
          className="flex-1 rounded-xl border border-zinc-300 bg-white px-4 py-2.5 text-center font-mono text-sm tracking-widest text-zinc-900 uppercase outline-none transition focus:border-violet-500 dark:border-zinc-700 dark:bg-zinc-900 dark:text-zinc-100"
        />
        <button type="submit" disabled={loading} className="btn-primary shrink-0">
          {loading ? "불러오는 중..." : "할인 적용하기"}
        </button>
      </form>
      {error && <p className="mt-2 text-xs text-rose-600 dark:text-rose-400">{error}</p>}
    </div>
  );
}
