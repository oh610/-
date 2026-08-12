"use client";

import { useRouter } from "next/navigation";
import { useState, type FormEvent } from "react";
import { getPaddle } from "@/lib/paddle/browser";

const PRESET_AMOUNTS = [1000, 3000, 5000];

export function CustomSubscribeForm({ userId }: { userId: string | null }) {
  const router = useRouter();
  const [amount, setAmount] = useState("5000");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const selectedPreset = PRESET_AMOUNTS.includes(Number(amount)) ? Number(amount) : null;

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
    <form onSubmit={handleSubmit} className="flex flex-col gap-3">
      <div className="flex gap-2">
        {PRESET_AMOUNTS.map((preset) => (
          <label
            key={preset}
            className={`flex flex-1 cursor-pointer items-center justify-center gap-1.5 rounded-xl border px-2 py-2 text-sm transition ${
              selectedPreset === preset
                ? "border-violet-500 bg-violet-50 font-semibold text-violet-700 dark:bg-violet-950/40 dark:text-violet-300"
                : "border-zinc-300 text-zinc-600 hover:border-zinc-400 dark:border-zinc-700 dark:text-zinc-400"
            }`}
          >
            <input
              type="checkbox"
              checked={selectedPreset === preset}
              onChange={() => setAmount(String(preset))}
              className="sr-only"
            />
            {preset.toLocaleString()}원
          </label>
        ))}
      </div>
      <label className="flex items-center rounded-xl border border-zinc-300 px-3 py-2.5 transition focus-within:border-violet-500 dark:border-zinc-700">
        <input
          type="number"
          min={1000}
          step={1000}
          value={amount}
          onChange={(e) => setAmount(e.target.value)}
          placeholder="원하는 금액 직접 입력"
          className="w-full bg-transparent text-sm text-zinc-900 outline-none dark:text-zinc-100"
        />
        <span className="ml-1 shrink-0 text-sm text-zinc-500 dark:text-zinc-400">원 / 월</span>
      </label>
      <button type="submit" disabled={loading} className="btn-primary w-full">
        {loading ? "불러오는 중..." : "자율금액 구독하기"}
      </button>
      {error && <p className="text-sm text-rose-600 dark:text-rose-400">{error}</p>}
    </form>
  );
}
