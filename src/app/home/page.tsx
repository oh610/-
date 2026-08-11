import { SummaryCardView } from "@/components/SummaryCard";
import { dummySummaryCard } from "@/lib/dummy-data";
import { getLatestSummaryCard } from "@/lib/supabase/queries";

export const dynamic = "force-dynamic";

export default async function Home() {
  const dbCard = await getLatestSummaryCard();
  const card = dbCard ?? dummySummaryCard;

  return (
    <div className="flex min-h-screen flex-col items-center bg-zinc-50 px-4 py-16 dark:bg-black">
      <main className="flex w-full flex-col items-center gap-6">
        <h1 className="text-lg font-medium text-zinc-500 dark:text-zinc-400">
          오늘의 정치 뉴스 요약
        </h1>
        {!dbCard && (
          <p className="text-sm text-amber-600 dark:text-amber-400">
            Supabase에서 데이터를 가져오지 못해 샘플 데이터를 표시 중입니다. (schema.sql / seed.sql 적용 여부 확인)
          </p>
        )}
        <SummaryCardView card={card} />
      </main>
    </div>
  );
}
