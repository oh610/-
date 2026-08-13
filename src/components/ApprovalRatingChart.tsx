import type { ApprovalRating } from "@/types/president";

const WIDTH = 600;
const HEIGHT = 220;
const PADDING = 32;

function buildPath(points: { x: number; y: number }[]): string {
  return points.map((p, i) => `${i === 0 ? "M" : "L"} ${p.x.toFixed(1)} ${p.y.toFixed(1)}`).join(" ");
}

export function ApprovalRatingChart({ ratings }: { ratings: ApprovalRating[] }) {
  if (ratings.length === 0) return null;

  const chronological = [...ratings].reverse(); // 오래된 순 → 최신 순

  const xFor = (i: number) =>
    chronological.length === 1 ? WIDTH / 2 : PADDING + (i / (chronological.length - 1)) * (WIDTH - PADDING * 2);
  const yFor = (percent: number) => HEIGHT - PADDING - (percent / 100) * (HEIGHT - PADDING * 2);

  const approvalPoints = chronological.map((r, i) => ({ x: xFor(i), y: yFor(r.approvalPercent), r }));

  const disapprovalPoints = chronological
    .map((r, i) => ({ x: xFor(i), y: r.disapprovalPercent != null ? yFor(r.disapprovalPercent) : null, r }))
    .filter((p): p is { x: number; y: number; r: ApprovalRating } => p.y !== null);

  return (
    <div className="w-full">
      <div className="mb-2 flex items-center gap-4 text-xs text-zinc-500 dark:text-zinc-400">
        <span className="flex items-center gap-1.5">
          <span className="h-2 w-2 rounded-full bg-violet-500" /> 긍정
        </span>
        <span className="flex items-center gap-1.5">
          <span className="h-2 w-2 rounded-full bg-rose-500" /> 부정
        </span>
      </div>
      <div className="w-full overflow-x-auto">
        <svg
          viewBox={`0 0 ${WIDTH} ${HEIGHT}`}
          className="w-full min-w-[500px]"
          role="img"
          aria-label="대통령 지지율 긍정/부정 평가 추이 그래프"
        >
          {[0, 25, 50, 75, 100].map((v) => {
            const y = yFor(v);
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
            d={buildPath(disapprovalPoints)}
            fill="none"
            className="stroke-rose-500"
            strokeWidth={2.5}
            strokeLinejoin="round"
            strokeLinecap="round"
          />
          {disapprovalPoints.map((p, i) => (
            <circle key={`d-${i}`} cx={p.x} cy={p.y} r={3.5} className="fill-rose-500">
              <title>{`${p.r.surveyDate} ${p.r.agency} 부정 ${p.r.disapprovalPercent}%`}</title>
            </circle>
          ))}

          <path
            d={buildPath(approvalPoints)}
            fill="none"
            className="stroke-violet-500"
            strokeWidth={2.5}
            strokeLinejoin="round"
            strokeLinecap="round"
          />
          {approvalPoints.map((p, i) => (
            <circle key={`a-${i}`} cx={p.x} cy={p.y} r={4} className="fill-violet-500">
              <title>{`${p.r.surveyDate} ${p.r.agency} 긍정 ${p.r.approvalPercent}%`}</title>
            </circle>
          ))}
        </svg>
      </div>
    </div>
  );
}
