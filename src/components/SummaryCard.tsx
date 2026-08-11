import Link from "next/link";
import type { SummaryCard, SummaryCardCitation } from "@/types/summary-card";

const SOURCE_TYPE_LABEL: Record<SummaryCardCitation["sourceType"], string> = {
  press_release: "공식 논평",
  article: "뉴스 기사(참고자료)",
  member_statement: "의원 발언(참고자료)",
};

function CitationList({ citations }: { citations: SummaryCardCitation[] }) {
  if (citations.length === 0) return null;

  const hasSupplementary = citations.some((c) => c.sourceType !== "press_release");

  return (
    <div className="mt-3 border-t border-black/5 pt-3 dark:border-white/10">
      <p className="mb-1.5 text-xs font-semibold text-zinc-500 dark:text-zinc-400">근거 출처</p>
      <ul className="flex flex-col gap-1.5">
        {citations.map((c) => (
          <li key={c.id} className="text-xs text-zinc-600 dark:text-zinc-400">
            <span
              className={
                c.sourceType === "press_release"
                  ? "mr-1.5 rounded-full bg-zinc-200 px-1.5 py-0.5 text-zinc-700 dark:bg-zinc-700 dark:text-zinc-200"
                  : "mr-1.5 rounded-full bg-amber-200 px-1.5 py-0.5 text-amber-800 dark:bg-amber-900/50 dark:text-amber-300"
              }
            >
              {SOURCE_TYPE_LABEL[c.sourceType]}
            </span>
            {c.sentenceText}
            {c.sourceUrl && (
              <a
                href={c.sourceUrl}
                target="_blank"
                rel="noopener noreferrer"
                className="ml-1.5 underline decoration-dotted"
              >
                원문
              </a>
            )}
            {c.sourceLabel && <span className="ml-1 text-zinc-400">({c.sourceLabel})</span>}
          </li>
        ))}
      </ul>
      {hasSupplementary && (
        <p className="mt-2 text-[11px] italic text-amber-700 dark:text-amber-400">
          정당 공식 입장이 아닌, 소속 의원 발언 및 언론 보도를 종합한 참고 자료가 포함되어 있습니다.
        </p>
      )}
    </div>
  );
}

function IdeologyBadge({ ideology }: { ideology: "진보" | "보수" }) {
  return (
    <span
      className={
        ideology === "진보"
          ? "rounded-full bg-blue-100 px-1.5 py-0.5 text-[11px] text-blue-700 dark:bg-blue-900/40 dark:text-blue-400"
          : "rounded-full bg-rose-100 px-1.5 py-0.5 text-[11px] text-rose-700 dark:bg-rose-900/40 dark:text-rose-400"
      }
    >
      {ideology}
    </span>
  );
}

export function SummaryCardView({ card }: { card: SummaryCard }) {
  const proCitations = card.citations.filter((c) => c.stance === "pro");
  const conCitations = card.citations.filter((c) => c.stance === "con");

  return (
    <article className="w-full max-w-2xl rounded-2xl border border-zinc-200 bg-white p-6 shadow-sm dark:border-zinc-800 dark:bg-zinc-950">
      <div className="flex items-center justify-between text-sm text-zinc-500 dark:text-zinc-400">
        <span>{card.publishedDate}</span>
        <span
          className={
            card.biasCheckPassed
              ? "rounded-full bg-emerald-100 px-2 py-0.5 text-emerald-700 dark:bg-emerald-900/40 dark:text-emerald-400"
              : "rounded-full bg-amber-100 px-2 py-0.5 text-amber-700 dark:bg-amber-900/40 dark:text-amber-400"
          }
        >
          {card.biasCheckPassed ? "편향 검증 통과" : "편향 검증 대기"}
        </span>
      </div>

      <h1 className="mt-3 text-2xl font-bold text-zinc-900 dark:text-zinc-50">
        {card.issueTitle}
      </h1>
      <p className="mt-2 text-zinc-600 dark:text-zinc-400">{card.issueSummary}</p>

      <div className="mt-6 grid gap-4 sm:grid-cols-2">
        <section className="rounded-xl border border-blue-200 bg-blue-50 p-4 dark:border-blue-900 dark:bg-blue-950/30">
          <h2 className="mb-2 text-sm font-semibold text-blue-700 dark:text-blue-400">
            찬성(여당) 측 논리
          </h2>
          <p className="text-sm text-zinc-700 dark:text-zinc-300">{card.proStanceSummary}</p>
          <CitationList citations={proCitations} />
        </section>

        <section className="rounded-xl border border-rose-200 bg-rose-50 p-4 dark:border-rose-900 dark:bg-rose-950/30">
          <h2 className="mb-2 text-sm font-semibold text-rose-700 dark:text-rose-400">
            반대(야당) 측 논리
          </h2>
          <p className="text-sm text-zinc-700 dark:text-zinc-300">{card.conStanceSummary}</p>
          <CitationList citations={conCitations} />
        </section>
      </div>

      {card.relatedFigures.length > 0 && (
        <div className="mt-6">
          <h2 className="mb-2 text-sm font-semibold text-zinc-500 dark:text-zinc-400">
            관련 추진 인물
          </h2>
          <div className="flex flex-wrap gap-2">
            {card.relatedFigures.map((figure) => (
              <Link
                key={figure.id}
                href={`/members/${figure.id}`}
                className="flex items-center gap-1.5 rounded-full bg-zinc-100 px-3 py-1 text-sm text-zinc-700 hover:bg-zinc-200 dark:bg-zinc-800 dark:text-zinc-300 dark:hover:bg-zinc-700"
              >
                {figure.name}
                {figure.ideology && <IdeologyBadge ideology={figure.ideology} />}
              </Link>
            ))}
          </div>
        </div>
      )}
    </article>
  );
}
