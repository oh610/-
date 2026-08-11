"use client";

import { useRouter } from "next/navigation";
import { useState, type FormEvent } from "react";
import { getPaddle } from "@/lib/paddle/browser";

export function DonateForm({ userId }: { userId: string | null }) {
  const router = useRouter();
  const [amount, setAmount] = useState("10000");
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
      const res = await fetch("/api/paddle/donate", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ amount: value }),
      });
      const data = await res.json();
      if (!res.ok) {
        setError(data.error ?? "후원 요청에 실패했습니다.");
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
    <form onSubmit={handleSubmit} className="flex flex-wrap items-center gap-2">
      <label className="flex items-center rounded-lg border border-zinc-300 px-3 py-2 dark:border-zinc-700">
        <input
          type="number"
          min={1000}
          step={1000}
          value={amount}
          onChange={(e) => setAmount(e.target.value)}
          className="w-28 bg-transparent text-sm text-zinc-900 outline-none dark:text-zinc-100"
        />
        <span className="ml-1 text-sm text-zinc-500 dark:text-zinc-400">원</span>
      </label>
      <button
        type="submit"
        disabled={loading}
        className="rounded-lg border border-zinc-300 px-4 py-2 text-sm text-zinc-700 disabled:opacity-50 dark:border-zinc-700 dark:text-zinc-300"
      >
        {loading ? "불러오는 중..." : "후원하기"}
      </button>
      {error && <p className="w-full text-sm text-rose-600 dark:text-rose-400">{error}</p>}
    </form>
  );
}
