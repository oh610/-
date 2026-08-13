import type { Metadata } from "next";
import Link from "next/link";
import { getPartyList } from "@/lib/supabase/parties";
import { IdeologyBadge } from "@/components/IdeologyBadge";
import { InfoTooltip } from "@/components/InfoTooltip";
import { createClient } from "@/lib/supabase/server";
import { LoginPromptPopup } from "@/components/LoginPromptPopup";

export const dynamic = "force-dynamic";

export const metadata: Metadata = {
  title: "정당",
  description: "국회 정당별 소속 의원, 관련 뉴스, 홈페이지를 확인해 보세요.",
};

export default async function PartiesPage() {
  const parties = await getPartyList();

  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  return (
    <div className="min-h-screen bg-zinc-50 px-4 py-16 dark:bg-black">
      <main className="mx-auto flex w-full max-w-2xl flex-col gap-6">
        <div className="flex items-center justify-between">
          <h1 className="text-lg font-medium text-zinc-500 dark:text-zinc-400">정당</h1>
          <InfoTooltip
            label="정당 이념 성향 분류 기준 설명"
            text="특정 기관의 공식 판정이 아니라 언론·학계에서 통상적으로 쓰는 분류를 참고한 정론관 자체 기준이에요. 정권 교체와 무관하게 고정 적용하고, 신설 정당은 강령과 소속 의원 이력을 참고해 분류해요."
          />
        </div>

        <ul className="flex flex-col gap-3">
          {parties.map((p) => (
            <li key={p.id}>
              <Link
                href={`/parties/${p.id}`}
                className="flex items-center justify-between gap-3 rounded-xl border border-zinc-200 bg-white p-4 hover:border-zinc-400 dark:border-zinc-800 dark:bg-zinc-950"
              >
                <div className="flex min-w-0 items-center gap-2">
                  <p className="truncate font-semibold text-zinc-900 dark:text-zinc-50">{p.name}</p>
                  <IdeologyBadge ideology={p.ideology} />
                </div>
                <span className="shrink-0 text-sm text-zinc-500 dark:text-zinc-400">
                  소속 의원 {p.memberCount}명
                </span>
              </Link>
            </li>
          ))}
          {parties.length === 0 && (
            <p className="text-sm text-zinc-500 dark:text-zinc-400">등록된 정당이 없습니다.</p>
          )}
        </ul>
      </main>
      {!user && <LoginPromptPopup />}
    </div>
  );
}
