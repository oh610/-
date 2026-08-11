"use client";

import { useRouter } from "next/navigation";
import { useState } from "react";
import { getPaddle } from "@/lib/paddle/browser";

export function CheckoutButton({
  priceId,
  label,
  userId,
  userEmail,
  customData,
  className,
}: {
  priceId: string | undefined;
  label: string;
  userId: string | null;
  userEmail: string | null;
  customData?: Record<string, unknown>;
  className?: string;
}) {
  const router = useRouter();
  const [loading, setLoading] = useState(false);

  async function handleClick() {
    if (!userId) {
      router.push("/login");
      return;
    }
    if (!priceId) {
      alert("아직 준비되지 않은 상품입니다.");
      return;
    }

    setLoading(true);
    const paddle = await getPaddle();
    setLoading(false);

    if (!paddle) {
      alert("결제 모듈을 불러오지 못했습니다. 잠시 후 다시 시도해 주세요.");
      return;
    }

    paddle.Checkout.open({
      items: [{ priceId, quantity: 1 }],
      customer: userEmail ? { email: userEmail } : undefined,
      customData: { userId, ...customData },
    });
  }

  return (
    <button onClick={handleClick} disabled={loading} className={className}>
      {loading ? "불러오는 중..." : label}
    </button>
  );
}
