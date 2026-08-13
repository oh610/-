"use client";

import { useState } from "react";
import Link from "next/link";
import type { InactiveMember } from "@/lib/supabase/members";
import { InfoTooltip } from "@/components/InfoTooltip";

const PREVIEW_COUNT = 5;

function MemberRow({ m, rank }: { m: InactiveMember; rank: number }) {
  return (
    <li>
      <Link
        href={`/members/${m.id}`}
        className="flex items-center gap-2.5 rounded-lg p-1.5 transition hover:bg-zinc-50 dark:hover:bg-zinc-900"
      >
        <span className="w-5 shrink-0 text-center text-sm font-bold text-zinc-400 dark:text-zinc-600">{rank}</span>
        {m.photoUrl ? (
          // eslint-disable-next-line @next/next/no-img-element
          <img
            src={m.photoUrl}
            alt={`${m.name} 의원 사진`}
            className="h-9 w-9 shrink-0 rounded-full object-cover"
          />
        ) : (
          <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-full bg-zinc-100 text-xs font-semibold text-zinc-400 dark:bg-zinc-800 dark:text-zinc-600">
            {m.name.slice(0, 1)}
          </div>
        )}
        <div className="min-w-0 flex-1">
          <p className="truncate text-sm font-medium text-zinc-900 dark:text-zinc-50">
            {m.name}
            {m.partyName && (
              <span className="ml-1 text-xs font-normal text-zinc-400 dark:text-zinc-500">· {m.partyName}</span>
            )}
          </p>
          <p className="truncate text-xs text-zinc-500 dark:text-zinc-400">
            {m.inactiveDays === null ? "활동 이력 없음" : `${m.inactiveDays}일째 활동 없음`}
          </p>
        </div>
      </Link>
    </li>
  );
}

export function InactiveMembersPanel({
  members,
  icon = "😴",
  heading = "최근 30일 미활동 TOP 5",
}: {
  members: InactiveMember[];
  icon?: string;
  heading?: string;
}) {
  const [expanded, setExpanded] = useState(false);

  if (members.length === 0) return null;

  const preview = members.slice(0, PREVIEW_COUNT);
  const rest = members.slice(PREVIEW_COUNT);

  return (
    <div className="rounded-2xl border border-zinc-200 bg-white p-5 dark:border-zinc-800 dark:bg-zinc-950">
      <div className="mb-4 flex items-center justify-between gap-2">
        <h2 className="flex items-center gap-1.5 text-sm font-semibold text-zinc-900 dark:text-zinc-50">
          <span aria-hidden>{icon}</span> {heading}
        </h2>
        <InfoTooltip
          label="미활동 기준 설명"
          text="'미활동'은 최근 30일간 대표/공동발의·표결 기록이 0건이라는 뜻이에요. '활동 이력 없음'은 저희가 동기화한 데이터 전체 기간을 통틀어도 기록이 없다는 의미로, 실제 의정 활동이 전혀 없었다는 보장은 아니에요."
        />
      </div>
      <ol className="flex flex-col gap-1">
        {preview.map((m, i) => (
          <MemberRow key={m.id} m={m} rank={i + 1} />
        ))}
      </ol>
      {rest.length > 0 && (
        <>
          <button
            type="button"
            onClick={() => setExpanded((v) => !v)}
            aria-expanded={expanded}
            className="mt-2 flex w-full items-center justify-center gap-1 rounded-lg py-1.5 text-xs text-zinc-400 transition hover:bg-zinc-50 hover:text-zinc-600 dark:text-zinc-600 dark:hover:bg-zinc-900 dark:hover:text-zinc-400"
          >
            그 외 {rest.length}명
            <span aria-hidden className={`transition-transform ${expanded ? "rotate-180" : ""}`}>
              ▾
            </span>
          </button>
          {expanded && (
            <ol className="mt-1 flex flex-col gap-1 border-t border-zinc-100 pt-2 dark:border-zinc-900">
              {rest.map((m, i) => (
                <MemberRow key={m.id} m={m} rank={PREVIEW_COUNT + i + 1} />
              ))}
            </ol>
          )}
        </>
      )}
    </div>
  );
}
