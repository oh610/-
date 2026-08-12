"use client";

import { useEffect, useState } from "react";
import { TrialCouponRedeemForm } from "@/components/TrialCouponRedeemForm";

export function TrialCouponPopup({ code }: { code: string }) {
  const [visible, setVisible] = useState(true);
  const [redeemed, setRedeemed] = useState(false);

  useEffect(() => {
    fetch("/api/coupon/mark-trial-shown", { method: "POST" }).catch(() => {});
  }, []);

  if (!visible) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 px-4">
      <div className="relative w-full max-w-sm rounded-2xl border border-zinc-200 bg-white p-6 text-center shadow-lg dark:border-zinc-800 dark:bg-zinc-950">
        <button
          onClick={() => setVisible(false)}
          aria-label="닫기"
          className="absolute right-4 top-4 text-zinc-400 hover:text-zinc-600 dark:hover:text-zinc-200"
        >
          ✕
        </button>
        {redeemed ? (
          <>
            <span className="text-4xl">🎉</span>
            <h2 className="mt-3 text-base font-semibold text-zinc-900 dark:text-zinc-50">
              7일 무료 체험이 시작됐어요
            </h2>
            <p className="mt-2 text-sm text-zinc-600 dark:text-zinc-400">
              오늘부터 일주일간 광고 없이, 지난 뉴스 요약까지 모두 이용할 수 있어요.
            </p>
            <button onClick={() => setVisible(false)} className="btn-primary mt-4 w-full">
              확인했습니다
            </button>
          </>
        ) : (
          <>
            <span className="text-4xl">🎁</span>
            <h2 className="mt-3 text-base font-semibold text-zinc-900 dark:text-zinc-50">
              가입을 축하해요, 체험 쿠폰이 도착했어요
            </h2>
            <p className="mt-2 text-sm text-zinc-600 dark:text-zinc-400">
              아래 쿠폰을 지금 적용하면 그 순간부터 정확히 7일간 유료 기능을 무료로 체험할 수 있어요.
              나중에 마이페이지에서도 언제든 적용할 수 있어요.
            </p>
            <div className="mt-4">
              <TrialCouponRedeemForm code={code} onRedeemed={() => setRedeemed(true)} />
            </div>
          </>
        )}
      </div>
    </div>
  );
}
