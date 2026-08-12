import { supabase } from "@/lib/supabase/client";
import { getNewsMentionCount } from "@/lib/collectors/naver-news";

type SponsorRef = { name: string } | { name: string }[] | null;

function toSponsor(sponsor: SponsorRef) {
  return Array.isArray(sponsor) ? sponsor[0] ?? null : sponsor;
}

export type RecentBill = {
  id: string;
  title: string;
  status: string;
  proposedDate: string;
  assemblyBillId: string | null;
  sponsorName: string | null;
};

export async function getRecentBills(limit = 5): Promise<RecentBill[]> {
  const { data, error } = await supabase
    .from("bills")
    .select("id, title, status, proposed_date, assembly_bill_id, members!bills_main_sponsor_id_fkey(name)")
    .order("proposed_date", { ascending: false })
    .limit(limit);

  if (error) {
    console.error("[getRecentBills]", error);
    return [];
  }

  return (data ?? []).map((b) => {
    const sponsor = toSponsor(b.members as SponsorRef);
    return {
      id: b.id,
      title: b.title,
      status: b.status,
      proposedDate: b.proposed_date,
      assemblyBillId: b.assembly_bill_id,
      sponsorName: sponsor?.name ?? null,
    };
  });
}

export type HotBill = RecentBill & { mentionCount: number };

// 최근 발의 법안 중에서 언론 언급량이 많은 순으로 뽑는다. 네이버 검색 API를 후보 법안
// 개수만큼 호출하므로 poolSize를 과도하게 키우지 않는다.
export async function getHotBills(limit: number, poolSize: number): Promise<HotBill[]> {
  const candidates = await getRecentBills(poolSize);
  if (candidates.length === 0) return [];

  const counts = await Promise.all(
    candidates.map((b) =>
      getNewsMentionCount(b.title).catch((err) => {
        console.error("[getHotBills] 언급량 조회 실패", b.title, err);
        return 0;
      }),
    ),
  );

  return candidates
    .map((b, i) => ({ ...b, mentionCount: counts[i] }))
    .sort((a, b) => b.mentionCount - a.mentionCount)
    .slice(0, limit);
}
