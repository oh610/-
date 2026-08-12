import Link from "next/link";
import { notFound } from "next/navigation";
import { createClient } from "@/lib/supabase/server";
import { getSummaryCardById } from "@/lib/supabase/queries";
import { SummaryCardView } from "@/components/SummaryCard";
import { hasFullAccess } from "@/lib/access";

export const dynamic = "force-dynamic";

export default async function ArchiveDetailPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;

  const card = await getSummaryCardById(id);
  if (!card) notFound();

  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  let tier: string | null = null;
  let isAdmin = false;
  let trialExpiresAt: string | null = null;
  if (user) {
    const { data } = await supabase
      .from("users")
      .select("tier, is_admin, trial_expires_at")
      .eq("id", user.id)
      .maybeSingle();
    tier = data?.tier ?? null;
    isAdmin = data?.is_admin ?? false;
    trialExpiresAt = data?.trial_expires_at ?? null;
  }

  if (!hasFullAccess(tier, isAdmin, trialExpiresAt)) {
    return (
      <div className="flex min-h-screen flex-col items-center bg-zinc-50 px-4 py-16 dark:bg-black">
        <main className="w-full max-w-2xl text-center">
          <p className="text-xs text-zinc-500 dark:text-zinc-400">{card.publishedDate}</p>
          <h1 className="mt-2 text-2xl font-bold text-zinc-950 dark:text-zinc-50">{card.issueTitle}</h1>
          <div className="mt-6 rounded-2xl border border-violet-200 bg-violet-50 p-8 dark:border-violet-900 dark:bg-violet-950/30">
            <p className="text-sm text-violet-800 dark:text-violet-300">
              지난 요약은 구독자만 열람할 수 있어요.
            </p>
            <Link href="/pricing" className="btn-primary mt-4">
              구독하기
            </Link>
          </div>
          <Link
            href="/archive"
            className="mt-6 inline-block text-sm text-zinc-500 hover:underline dark:text-zinc-400"
          >
            ← 목록으로
          </Link>
        </main>
      </div>
    );
  }

  return (
    <div className="flex min-h-screen flex-col items-center bg-zinc-50 px-4 py-16 dark:bg-black">
      <main className="flex w-full flex-col items-center gap-6">
        <Link
          href="/archive"
          className="self-start text-sm text-zinc-500 hover:underline dark:text-zinc-400"
        >
          ← 목록으로
        </Link>
        <SummaryCardView card={card} />
      </main>
    </div>
  );
}
