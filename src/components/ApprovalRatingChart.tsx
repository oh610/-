import type { ApprovalRating } from "@/types/president";

const WIDTH = 600;
const HEIGHT = 220;
const PADDING = 32;

export function ApprovalRatingChart({ ratings }: { ratings: ApprovalRating[] }) {
  if (ratings.length === 0) return null;

  const chronological = [...ratings].reverse(); // 오래된 순 → 최신 순

  const points = chronological.map((r, i) => {
    const x =
      chronological.length === 1
        ? WIDTH / 2
        : PADDING + (i / (chronological.length - 1)) * (WIDTH - PADDING * 2);
    const y = HEIGHT - PADDING - (r.approvalPercent / 100) * (HEIGHT - PADDING * 2);
    return { x, y, r };
  });

  const path = points.map((p, i) => `${i === 0 ? "M" : "L"} ${p.x.toFixed(1)} ${p.y.toFixed(1)}`).join(" ");

  return (
    <div className="w-full overflow-x-auto">
      <svg
        viewBox={`0 0 ${WIDTH} ${HEIGHT}`}
        className="w-full min-w-[500px]"
        role="img"
        aria-label="대통령 지지율 추이 그래프"
      >
        {[0, 25, 50, 75, 100].map((v) => {
          const y = HEIGHT - PADDING - (v / 100) * (HEIGHT - PADDING * 2);
          return (
            <g key={v}>
              <line
                x1={PADDING}
                y1={y}
                x2={WIDTH - PADDING}
                y2={y}
                className="stroke-zinc-200 dark:stroke-zinc-800"
                strokeWidth={1}
              />
              <text x={PADDING - 8} y={y + 4} textAnchor="end" className="fill-zinc-400 text-[10px] dark:fill-zinc-500">
                {v}%
              </text>
            </g>
          );
        })}
        <path
          d={path}
          fill="none"
          className="stroke-violet-500"
          strokeWidth={2.5}
          strokeLinejoin="round"
          strokeLinecap="round"
        />
        {points.map((p, i) => (
          <circle key={i} cx={p.x} cy={p.y} r={4} className="fill-violet-500">
            <title>{`${p.r.surveyDate} ${p.r.agency} ${p.r.approvalPercent}%`}</title>
          </circle>
        ))}
      </svg>
    </div>
  );
}
