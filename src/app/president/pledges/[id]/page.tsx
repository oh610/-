import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";
import { getPledgeItemDetail } from "@/lib/supabase/president";
import type { PledgeStatus } from "@/types/president";
import { TaegeukWatermark } from "@/components/TaegeukWatermark";

export const dynamic = "force-dynamic";

const STATUS_STYLE: Record<PledgeStatus, string> = {
  "추진 전": "bg-zinc-200 text-zinc-700 dark:bg-zinc-700 dark:text-zinc-200",
  "추진 중": "bg-amber-100 text-amber-700 dark:bg-amber-900/40 dark:text-amber-400",
  "이행 완료": "bg-emerald-100 text-emerald-700 dark:bg-emerald-900/40 dark:text-emerald-400",
};

export async function generateMetadata({
  params,
}: {
  params: Promise<{ id: string }>;
}): Promise<Metadata> {
  const { id } = await params;
  const item = await getPledgeItemDetail(id);
  if (!item) return {};

  return {
    title: item.content,
    description: `${item.pledgeTitle} 세부 공약 "${item.content}" 관련 뉴스를 확인해 보세요.`,
  };
}

function formatNewsDate(pubDate: string): string {
  const d = new Date(pubDate);
  if (Number.isNaN(d.getTime())) return pubDate;
  return d.toLocaleDateString("ko-KR", { year: "numeric", month: "2-digit", day: "2-digit" });
}

export default async function PledgeItemDetailPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;
  const item = await getPledgeItemDetail(id);
  if (!item) notFound();

  return (
    <div className="relative min-h-screen overflow-hidden bg-zinc-50 px-4 py-16 dark:bg-black">
      <TaegeukWatermark />
      <main className="relative mx-auto flex w-full max-w-2xl flex-col gap-6">
        <Link href="/president/pledges" className="text-sm text-zinc-500 hover:underline dark:text-zinc-400">
          ← 공약 이행현황으로
        </Link>

        <section className="rounded-2xl border border-zinc-200 bg-white p-6 dark:border-zinc-800 dark:bg-zinc-950">
          <div className="flex items-center gap-1.5 text-xs text-zinc-400 dark:text-zinc-500">
            {item.category && <span>{item.category}</span>}
            {item.category && <span>·</span>}
            <span>{item.pledgeTitle}</span>
          </div>
          <div className="mt-1 flex items-start justify-between gap-3">
            <h1 className="text-xl font-bold text-zinc-950 dark:text-zinc-50">{item.content}</h1>
            <span
              className={`shrink-0 rounded-full px-2.5 py-1 text-xs font-semibold ${STATUS_STYLE[item.status]}`}
            >
              {item.status}
            </span>
          </div>
        </section>

        <section className="rounded-2xl border border-zinc-200 bg-white p-6 dark:border-zinc-800 dark:bg-zinc-950">
          <h2 className="mb-3 text-sm font-semibold text-zinc-500 dark:text-zinc-400">관련 뉴스</h2>
          {item.news.length === 0 ? (
            <p className="text-sm text-zinc-500 dark:text-zinc-400">관련 뉴스가 없습니다.</p>
          ) : (
            <ul className="flex flex-col gap-3">
              {item.news.map((news) => (
                <li key={news.link}>
                  <a
                    href={news.link}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="flex items-center justify-between gap-3 text-sm hover:underline"
                  >
                    <span className="min-w-0 truncate text-zinc-800 dark:text-zinc-200">{news.title}</span>
                    <span className="shrink-0 whitespace-nowrap text-xs text-zinc-500 dark:text-zinc-400">
                      {formatNewsDate(news.pubDate)}
                    </span>
                  </a>
                </li>
              ))}
            </ul>
          )}
        </section>

        {item.sourceUrl && (
          <section className="rounded-2xl border border-zinc-200 bg-white p-6 dark:border-zinc-800 dark:bg-zinc-950">
            <h2 className="mb-3 text-sm font-semibold text-zinc-500 dark:text-zinc-400">출처</h2>
            <a
              href={item.sourceUrl}
              target="_blank"
              rel="noopener noreferrer"
              className="break-all text-sm text-violet-600 hover:underline dark:text-violet-400"
            >
              {item.sourceUrl}
            </a>
          </section>
        )}
      </main>
    </div>
  );
}
