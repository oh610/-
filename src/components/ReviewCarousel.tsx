"use client";

import { useEffect, useState } from "react";
import { getApprovedReviews, type Review } from "@/lib/supabase/reviews";

function ReviewCard({ review }: { review: Review }) {
  return (
    <div className="flex w-72 shrink-0 flex-col gap-3 rounded-2xl border border-zinc-200 bg-white p-5 shadow-sm dark:border-zinc-800 dark:bg-zinc-950">
      <p className="text-sm leading-relaxed text-zinc-700 dark:text-zinc-300">
        &ldquo;{review.content}&rdquo;
      </p>
      <p className="text-right text-xs text-zinc-500 dark:text-zinc-400">-{review.displayName}-</p>
    </div>
  );
}

export function ReviewCarousel() {
  const [reviews, setReviews] = useState<Review[]>([]);

  useEffect(() => {
    getApprovedReviews().then(setReviews);
  }, []);

  if (reviews.length === 0) return null;

  // 끊김 없이 반복되도록 목록을 두 번 이어붙인다.
  const track = [...reviews, ...reviews];

  return (
    <div className="w-full max-w-3xl overflow-hidden">
      <p className="mb-3 text-center text-xs font-medium text-zinc-400 dark:text-zinc-500">
        이용자 후기
      </p>
      <div className="review-marquee flex gap-4" style={{ ["--review-count" as string]: reviews.length }}>
        {track.map((review, i) => (
          <ReviewCard key={`${review.id}-${i}`} review={review} />
        ))}
      </div>
      <style>{`
        .review-marquee {
          width: max-content;
          animation: review-scroll linear infinite;
          animation-duration: calc(var(--review-count) * 6s);
        }
        .review-marquee:hover {
          animation-play-state: paused;
        }
        @keyframes review-scroll {
          from { transform: translateX(0); }
          to { transform: translateX(-50%); }
        }
      `}</style>
    </div>
  );
}
