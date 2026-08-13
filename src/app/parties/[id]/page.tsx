import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";
import { getPartyDetail } from "@/lib/supabase/parties";
import { formatDistrictName } from "@/lib/supabase/members";
import { IdeologyBadge } from "@/components/IdeologyBadge";
import { createClient } from "@/lib/supabase/server";
import { LoginPromptPopup } from "@/components/LoginPromptPopup";

export const dynamic = "force-dynamic";

export async function generateMetadata({
  params,
}: {
  params: Promise<{ id: string }>;
}): Promise<Metadata> {
  const { id } = await params;
  const party = await getPartyDetail(id);
  if (!party) return {};

  return {
    title: party.name,
    description: `${party.name}의 소속 의원, 관련 뉴스, 홈페이지를 확인해 보세요.`,
  };
}

function formatNewsDate(pubDate: string): string {
  const d = new Date(pubDate);
  if (Number.isNaN(d.getTime())) return pubDate;
  return d.toLocaleDateString("ko-KR", { year: "numeric", month: "2-digit", day: "2-digit" });
}

export default async function PartyDetailPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;
  const party = await getPartyDetail(id);
  if (!party) notFound();

  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  return (
    <div className="min-h-screen bg-zinc-50 px-4 py-16 dark:bg-black">
      <main className="mx-auto flex w-full max-w-2xl flex-col gap-6">
        <Link href="/parties" className="text-sm text-zinc-500 hover:underline dark:text-zinc-400">
          ← 정당 목록으로
        </Link>

        <section className="rounded-2xl border border-zinc-200 bg-white p-6 dark:border-zinc-800 dark:bg-zinc-950">
          <div className="flex items-center justify-between">
            <h1 className="text-3xl font-bold text-zinc-950 dark:text-zinc-50">{party.name}</h1>
            <IdeologyBadge ideology={party.ideology} />
          </div>
          {party.description && (
            <p className="mt-2 text-sm text-zinc-600 dark:text-zinc-400">{party.description}</p>
          )}
          <div className="mt-3 flex items-center gap-3 text-sm text-zinc-500 dark:text-zinc-400">
            <span>소속 의원 {party.members.length}명</span>
            {party.homepageUrl && (
              <a
                href={party.homepageUrl}
                target="_blank"
                rel="noopener noreferrer"
                className="text-violet-600 hover:underline dark:text-violet-400"
              >
                정당 홈페이지 ↗
              </a>
            )}
          </div>
        </section>

        <section className="rounded-2xl border border-zinc-200 bg-white p-6 dark:border-zinc-800 dark:bg-zinc-950">
          <h2 className="mb-3 text-sm font-semibold text-zinc-500 dark:text-zinc-400">정당 활동 관련 뉴스</h2>
          {party.news.length === 0 ? (
            <p className="text-sm text-zinc-500 dark:text-zinc-400">관련 뉴스가 없습니다.</p>
          ) : (
            <ul className="flex flex-col gap-3">
              {party.news.map((news) => (
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

        <section className="rounded-2xl border border-zinc-200 bg-white p-6 dark:border-zinc-800 dark:bg-zinc-950">
          <h2 className="mb-3 text-sm font-semibold text-zinc-500 dark:text-zinc-400">소속 국회의원</h2>
          {party.members.length === 0 ? (
            <p className="text-sm text-zinc-500 dark:text-zinc-400">소속 의원이 없습니다.</p>
          ) : (
            <ul className="flex flex-col gap-2">
              {party.members.map((m) => (
                <li key={m.id}>
                  <Link
                    href={`/members/${m.id}`}
                    className="flex items-center gap-3 rounded-lg p-2 text-sm hover:bg-zinc-50 dark:hover:bg-zinc-900"
                  >
                    {m.photoUrl ? (
                      // eslint-disable-next-line @next/next/no-img-element
                      <img
                        src={m.photoUrl}
                        alt={`${m.name} 의원 사진`}
                        className="h-8 w-8 shrink-0 rounded-full object-cover"
                      />
                    ) : (
                      <div className="flex h-8 w-8 shrink-0 items-center justify-center rounded-full bg-zinc-100 text-xs font-semibold text-zinc-400 dark:bg-zinc-800 dark:text-zinc-600">
                        {m.name.slice(0, 1)}
                      </div>
                    )}
                    <span className="min-w-0 flex-1 text-zinc-900 dark:text-zinc-50">{m.name}</span>
                    <span className="shrink-0 whitespace-nowrap text-xs text-zinc-500 dark:text-zinc-400">
                      {m.districtType === "지역구" && m.districtName ? formatDistrictName(m.districtName) : "비례대표"}
                    </span>
                  </Link>
                </li>
              ))}
            </ul>
          )}
        </section>
      </main>
      {!user && <LoginPromptPopup />}
    </div>
  );
}
