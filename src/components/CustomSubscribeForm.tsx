"use client";

import { useRouter } from "next/navigation";
import { useState, type FormEvent } from "react";
import { getPaddle } from "@/lib/paddle/browser";

export function CustomSubscribeForm({ userId }: { userId: string | null }) {
  const router = useRouter();
  const [amount, setAmount] = useState("5000");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  async function handleSubmit(e: FormEvent) {
    e.preventDefault();
    setError(null);

    if (!userId) {
      router.push("/login");
      return;
    }

    const value = Number(amount);
    if (!Number.isInteger(value) || value < 1000) {
      setError("1,000원 이상의 금액을 입력해 주세요.");
      return;
    }

    setLoading(true);
    try {
      const res = await fetch("/api/paddle/subscribe-custom", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ amount: value }),
      });
      const data = await res.json();
      if (!res.ok) {
        setError(data.error ?? "구독 요청에 실패했습니다.");
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
    <form onSubmit={handleSubmit} className="flex flex-col gap-2">
      <label className="flex items-center rounded-lg border border-zinc-300 px-3 py-2 dark:border-zinc-700">
        <input
          type="number"
          min={1000}
          step={1000}
          value={amount}
          onChange={(e) => setAmount(e.target.value)}
          className="w-full bg-transparent text-sm text-zinc-900 outline-none dark:text-zinc-100"
        />
        <span className="ml-1 shrink-0 text-sm text-zinc-500 dark:text-zinc-400">원 / 월</span>
      </label>
      <button
        type="submit"
        disabled={loading}
        className="w-full rounded-lg bg-zinc-900 px-4 py-2 text-sm font-medium text-white disabled:opacity-50 dark:bg-zinc-100 dark:text-zinc-900"
      >
        {loading ? "불러오는 중..." : "자율금액 구독하기"}
      </button>
      {error && <p className="text-sm text-rose-600 dark:text-rose-400">{error}</p>}
    </form>
  );
}
