"use client";

import { useState } from "react";
import { getPaddle } from "@/lib/paddle/browser";

export function UpdatePaymentMethodButton() {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  async function handleClick() {
    setError(null);
    setLoading(true);
    try {
      const res = await fetch("/api/paddle/update-payment-method", { method: "POST" });
      const data = await res.json();
      if (!res.ok) {
        setError(data.error ?? "결제 수단 변경 요청에 실패했습니다.");
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
    <div>
      <button
        onClick={handleClick}
        disabled={loading}
        className="rounded-lg border border-zinc-300 px-4 py-2 text-sm text-zinc-700 disabled:opacity-50 dark:border-zinc-700 dark:text-zinc-300"
      >
        {loading ? "불러오는 중..." : "결제 수단 변경/추가"}
      </button>
      {error && <p className="mt-2 text-sm text-rose-600 dark:text-rose-400">{error}</p>}
    </div>
  );
}
