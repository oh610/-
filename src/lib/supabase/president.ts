import { supabase } from "@/lib/supabase/client";
import { searchNews } from "@/lib/collectors/naver-news";
import type { ApprovalRating, Pledge, PledgeItemDetail, PledgeStatus, PresidentProfile } from "@/types/president";

const STATUS_WEIGHT: Record<PledgeStatus, number> = { "추진 전": 0, "추진 중": 50, "이행 완료": 100 };

export const PRESIDENT_PROFILE_ID = "00000000-0000-0000-0000-000000000001";

export async function getPresidentProfile(): Promise<PresidentProfile | null> {
  const { data, error } = await supabase
    .from("president_profile")
    .select("id, name, photo_url, term_start, bio, updated_at")
    .eq("id", PRESIDENT_PROFILE_ID)
    .maybeSingle();

  if (error) {
    console.error("[getPresidentProfile]", error);
    return null;
  }
  if (!data) return null;

  return {
    id: data.id,
    name: data.name,
    photoUrl: data.photo_url,
    termStart: data.term_start,
    bio: data.bio,
    updatedAt: data.updated_at,
  };
}

export async function getApprovalRatings(limit = 26): Promise<ApprovalRating[]> {
  const { data, error } = await supabase
    .from("approval_ratings")
    .select("id, survey_date, agency, approval_percent, disapproval_percent, source_url")
    .order("survey_date", { ascending: false })
    .limit(limit);

  if (error) {
    console.error("[getApprovalRatings]", error);
    return [];
  }

  return (data ?? []).map((r) => ({
    id: r.id,
    surveyDate: r.survey_date,
    agency: r.agency,
    approvalPercent: Number(r.approval_percent),
    disapprovalPercent: r.disapproval_percent === null ? null : Number(r.disapproval_percent),
    sourceUrl: r.source_url,
  }));
}

export async function getApprovalRatingsPage(
  page = 1,
  pageSize = 26,
): Promise<{ ratings: ApprovalRating[]; totalPages: number }> {
  const from = (page - 1) * pageSize;
  const to = from + pageSize - 1;

  const { data, error, count } = await supabase
    .from("approval_ratings")
    .select("id, survey_date, agency, approval_percent, disapproval_percent, source_url", { count: "exact" })
    .order("survey_date", { ascending: false })
    .range(from, to);

  if (error) {
    console.error("[getApprovalRatingsPage]", error);
    return { ratings: [], totalPages: 1 };
  }

  const ratings = (data ?? []).map((r) => ({
    id: r.id,
    surveyDate: r.survey_date,
    agency: r.agency,
    approvalPercent: Number(r.approval_percent),
    disapprovalPercent: r.disapproval_percent === null ? null : Number(r.disapproval_percent),
    sourceUrl: r.source_url,
  }));

  return { ratings, totalPages: Math.max(1, Math.ceil((count ?? 0) / pageSize)) };
}

export async function getPledgeItemDetail(id: string): Promise<PledgeItemDetail | null> {
  const { data, error } = await supabase
    .from("pledge_items")
    .select("id, content, status, pledge_id, pledges(title, category)")
    .eq("id", id)
    .maybeSingle();

  if (error || !data) {
    console.error("[getPledgeItemDetail]", error);
    return null;
  }

  const pledge = Array.isArray(data.pledges) ? data.pledges[0] : data.pledges;
  if (!pledge) return null;

  let news: PledgeItemDetail["news"] = [];
  try {
    const items = await searchNews(data.content, 8);
    news = items.map((n) => ({ title: n.title, link: n.link, description: n.description, pubDate: n.pubDate }));
  } catch (err) {
    console.error("[getPledgeItemDetail] 뉴스 조회 실패", err);
  }

  return {
    id: data.id,
    content: data.content,
    status: data.status,
    pledgeId: data.pledge_id,
    pledgeTitle: pledge.title,
    category: pledge.category,
    news,
  };
}

export async function getPledges(query = ""): Promise<Pledge[]> {
  const [pledgesRes, itemsRes] = await Promise.all([
    supabase
      .from("pledges")
      .select("id, title, category, source_url, display_order")
      .order("display_order", { ascending: true }),
    supabase
      .from("pledge_items")
      .select("id, pledge_id, content, status, display_order")
      .order("display_order", { ascending: true }),
  ]);

  if (pledgesRes.error) {
    console.error("[getPledges]", pledgesRes.error);
    return [];
  }
  if (itemsRes.error) {
    console.error("[getPledges] items", itemsRes.error);
  }

  const itemsByPledge = new Map<string, Pledge["items"]>();
  for (const item of itemsRes.data ?? []) {
    const list = itemsByPledge.get(item.pledge_id) ?? [];
    list.push({ id: item.id, content: item.content, status: item.status, displayOrder: item.display_order });
    itemsByPledge.set(item.pledge_id, list);
  }

  const trimmedQuery = query.trim().toLowerCase();

  return (pledgesRes.data ?? [])
    .filter((p) => {
      if (!trimmedQuery) return true;
      const items = itemsByPledge.get(p.id) ?? [];
      return (
        p.title.toLowerCase().includes(trimmedQuery) ||
        items.some((i) => i.content.toLowerCase().includes(trimmedQuery))
      );
    })
    .map((p) => {
      const items = itemsByPledge.get(p.id) ?? [];
      const completionPercent =
        items.length === 0
          ? null
          : Math.round(items.reduce((sum, i) => sum + STATUS_WEIGHT[i.status], 0) / items.length);

      return {
        id: p.id,
        title: p.title,
        category: p.category,
        sourceUrl: p.source_url,
        displayOrder: p.display_order,
        items,
        completionPercent,
      };
    });
}
