import { supabase } from "@/lib/supabase/client";
import type { ApprovalRating, Pledge, PledgeStatus, PresidentProfile } from "@/types/president";

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

export async function getPledgeCategories(): Promise<string[]> {
  const { data, error } = await supabase.from("pledges").select("category").not("category", "is", null);

  if (error) {
    console.error("[getPledgeCategories]", error);
    return [];
  }

  const categories = new Set((data ?? []).map((p) => p.category as string));
  return [...categories].sort();
}

export async function getPledges(query = "", category?: string): Promise<Pledge[]> {
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
    .filter((p) => !category || p.category === category)
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
