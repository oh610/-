"use client";

import { useRouter } from "next/navigation";
import { useState, type FormEvent } from "react";

export function TrialCouponRedeemForm({ code, onRedeemed }: { code: string; onRedeemed?: (expiresAt: string) => void }) {
  const router = useRouter();
  const [value, setValue] = useState(code);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  async function handleSubmit(e: FormEvent) {
    e.preventDefault();
    setError(null);
    setLoading(true);
    try {
      const res = await fetch("/api/coupon/redeem-trial", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ code: value }),
      });
      const data = await res.json();
      if (!res.ok) {
        setError(data.error ?? "쿠폰 적용에 실패했습니다.");
        return;
      }
      onRedeemed?.(data.expiresAt);
      router.refresh();
    } finally {
      setLoading(false);
    }
  }

  return (
    <form onSubmit={handleSubmit} className="flex flex-col gap-2">
      <input
        type="text"
        value={value}
        onChange={(e) => setValue(e.target.value)}
        placeholder="쿠폰 코드"
        className="rounded-xl border border-zinc-300 bg-white px-4 py-2.5 text-center font-mono text-sm tracking-widest text-zinc-900 uppercase outline-none transition focus:border-violet-500 dark:border-zinc-700 dark:bg-zinc-900 dark:text-zinc-100"
      />
      {error && <p className="text-xs text-rose-600 dark:text-rose-400">{error}</p>}
      <button type="submit" disabled={loading} className="btn-primary w-full">
        {loading ? "적용 중..." : "지금 시작하기"}
      </button>
    </form>
  );
}
