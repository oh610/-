import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";
import { getMemberDetail } from "@/lib/supabase/members";
import { searchNews, type NaverNewsItem } from "@/lib/collectors/naver-news";
import { createClient } from "@/lib/supabase/server";
import { LoginPromptPopup } from "@/components/LoginPromptPopup";

export const dynamic = "force-dynamic";

export async function generateMetadata({
  params,
}: {
  params: Promise<{ id: string }>;
}): Promise<Metadata> {
  const { id } = await params;
  const member = await getMemberDetail(id);
  if (!member) return {};

  return {
    title: `${member.name} 의원`,
    description: `${member.name} 의원(${member.partyName ?? "무소속"})의 발의 법안, 표결 이력, 관련 뉴스를 확인해 보세요.`,
  };
}

function IdeologyBadge({ ideology }: { ideology: "진보" | "보수" }) {
  return (
    <span
      className={
        ideology === "진보"
          ? "rounded-full bg-blue-100 px-2 py-0.5 text-xs text-blue-700 dark:bg-blue-900/40 dark:text-blue-400"
          : "rounded-full bg-rose-100 px-2 py-0.5 text-xs text-rose-700 dark:bg-rose-900/40 dark:text-rose-400"
      }
    >
      {ideology}
    </span>
  );
}

function VoteResultBadge({ result }: { result: string }) {
  const styles: Record<string, string> = {
    찬성: "bg-blue-100 text-blue-700 dark:bg-blue-900/40 dark:text-blue-400",
    반대: "bg-rose-100 text-rose-700 dark:bg-rose-900/40 dark:text-rose-400",
    기권: "bg-zinc-200 text-zinc-700 dark:bg-zinc-700 dark:text-zinc-200",
    불참: "bg-zinc-200 text-zinc-700 dark:bg-zinc-700 dark:text-zinc-200",
  };
  return (
    <span
      className={`shrink-0 whitespace-nowrap rounded-full px-2 py-0.5 text-xs ${
        styles[result] ?? "bg-zinc-200 text-zinc-700 dark:bg-zinc-700 dark:text-zinc-200"
      }`}
    >
      {result}
    </span>
  );
}

async function getRelatedNews(name: string): Promise<NaverNewsItem[]> {
  try {
    return await searchNews(name, 5);
  } catch (err) {
    console.error("[member related news]", err);
    return [];
  }
}

export default async function MemberDetailPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;
  const member = await getMemberDetail(id);
  if (!member) notFound();

  const relatedNews = await getRelatedNews(member.name);

  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  return (
    <div className="min-h-screen bg-zinc-50 px-4 py-16 dark:bg-black">
      <main className="mx-auto flex w-full max-w-2xl flex-col gap-6">
        <Link href="/members" className="text-sm text-zinc-500 hover:underline dark:text-zinc-400">
          ← 검색으로
        </Link>

        <section className="rounded-2xl border border-zinc-200 bg-white p-6 dark:border-zinc-800 dark:bg-zinc-950">
          <div className="flex items-center gap-4">
            {member.photoUrl ? (
              // eslint-disable-next-line @next/next/no-img-element
              <img
                src={member.photoUrl}
                alt={`${member.name} 의원 사진`}
                className="h-20 w-20 shrink-0 rounded-xl object-cover"
              />
            ) : (
              <div className="flex h-20 w-20 shrink-0 items-center justify-center rounded-xl bg-zinc-100 text-2xl font-semibold text-zinc-400 dark:bg-zinc-800 dark:text-zinc-600">
                {member.name.slice(0, 1)}
              </div>
            )}
            <div className="min-w-0 flex-1">
              <div className="flex items-center justify-between">
                <h1 className="text-3xl font-bold text-zinc-950 dark:text-zinc-50">{member.name}</h1>
                {member.ideology && <IdeologyBadge ideology={member.ideology} />}
              </div>
              <p className="mt-1 text-zinc-600 dark:text-zinc-400">
                {member.partyName ?? "무소속"} ·{" "}
                {member.districtType === "지역구" ? member.districtName : "비례대표"}
              </p>
            </div>
          </div>
        </section>

        <section className="rounded-2xl border border-zinc-200 bg-white p-6 dark:border-zinc-800 dark:bg-zinc-950">
          <h2 className="mb-3 text-sm font-semibold text-zinc-500 dark:text-zinc-400">관련 뉴스</h2>
          {relatedNews.length === 0 ? (
            <p className="text-sm text-zinc-500 dark:text-zinc-400">관련 뉴스가 없습니다.</p>
          ) : (
            <ul className="flex flex-col gap-3">
              {relatedNews.map((news) => (
                <li key={news.link}>
                  <a
                    href={news.originallink || news.link}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="text-sm text-zinc-800 hover:underline dark:text-zinc-200"
                  >
                    {news.title}
                  </a>
                </li>
              ))}
            </ul>
          )}
        </section>

        <section className="rounded-2xl border border-zinc-200 bg-white p-6 dark:border-zinc-800 dark:bg-zinc-950">
          <h2 className="mb-3 text-sm font-semibold text-zinc-500 dark:text-zinc-400">발의 법안</h2>
          {member.bills.length === 0 ? (
            <p className="text-sm text-zinc-500 dark:text-zinc-400">발의한 법안이 없습니다.</p>
          ) : (
            <ul className="flex flex-col gap-2">
              {member.bills.map((b) =>
                b.assemblyBillId ? (
                  <li key={`${b.role}-${b.id}`}>
                    <a
                      href={`https://likms.assembly.go.kr/bill/billDetail.do?billId=${b.assemblyBillId}`}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="flex items-center justify-between gap-3 text-sm hover:underline"
                    >
                      <span className="min-w-0 text-zinc-800 dark:text-zinc-200">{b.title}</span>
                      <span className="shrink-0 whitespace-nowrap text-zinc-500 dark:text-zinc-400">
                        {b.role} · {b.status} · {b.proposedDate}
                      </span>
                    </a>
                  </li>
                ) : (
                  <li
                    key={`${b.role}-${b.id}`}
                    className="flex items-center justify-between gap-3 text-sm"
                  >
                    <span className="min-w-0 text-zinc-800 dark:text-zinc-200">{b.title}</span>
                    <span className="shrink-0 whitespace-nowrap text-zinc-500 dark:text-zinc-400">
                      {b.role} · {b.status} · {b.proposedDate}
                    </span>
                  </li>
                ),
              )}
            </ul>
          )}
        </section>

        <section className="rounded-2xl border border-zinc-200 bg-white p-6 dark:border-zinc-800 dark:bg-zinc-950">
          <h2 className="mb-3 text-sm font-semibold text-zinc-500 dark:text-zinc-400">표결 이력</h2>
          {member.votes.length === 0 ? (
            <p className="text-sm text-zinc-500 dark:text-zinc-400">표결 이력이 없습니다.</p>
          ) : (
            <ul className="flex flex-col gap-2">
              {member.votes.map((v) =>
                v.assemblyBillId ? (
                  <li key={v.id}>
                    <a
                      href={`https://likms.assembly.go.kr/bill/billDetail.do?billId=${v.assemblyBillId}`}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="flex items-center justify-between gap-3 text-sm hover:underline"
                    >
                      <span className="min-w-0 text-zinc-800 dark:text-zinc-200">{v.billTitle}</span>
                      <VoteResultBadge result={v.result} />
                    </a>
                  </li>
                ) : (
                  <li key={v.id} className="flex items-center justify-between gap-3 text-sm">
                    <span className="min-w-0 text-zinc-800 dark:text-zinc-200">{v.billTitle}</span>
                    <VoteResultBadge result={v.result} />
                  </li>
                ),
              )}
            </ul>
          )}
        </section>
      </main>
      {!user && <LoginPromptPopup />}
    </div>
  );
}
