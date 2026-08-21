import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";
import { createClient } from "@/lib/supabase/server";
import { getSummaryCardById } from "@/lib/supabase/queries";
import { SummaryCardView } from "@/components/SummaryCard";
import { LoginPromptPopup } from "@/components/LoginPromptPopup";

export const dynamic = "force-dynamic";

export async function generateMetadata({
  params,
}: {
  params: Promise<{ id: string }>;
}): Promise<Metadata> {
  const { id } = await params;
  const card = await getSummaryCardById(id);
  if (!card) return {};

  const description = `여당: ${card.proStanceSummary} / 야당: ${card.conStanceSummary}`.slice(0, 140);

  return {
    title: card.issueTitle,
    description,
    openGraph: {
      title: card.issueTitle,
      description,
      type: "article",
    },
    twitter: {
      card: "summary_large_image",
      title: card.issueTitle,
      description,
    },
  };
}

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
      {!user && <LoginPromptPopup />}
    </div>
  );
}
