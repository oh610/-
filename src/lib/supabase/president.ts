import { supabase } from "@/lib/supabase/client";
import type { ApprovalRating, Pledge, PresidentProfile } from "@/types/president";

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

export async function getPledges(): Promise<Pledge[]> {
  const { data, error } = await supabase
    .from("pledges")
    .select("id, title, category, description, status, source_url, display_order")
    .order("display_order", { ascending: true });

  if (error) {
    console.error("[getPledges]", error);
    return [];
  }

  return (data ?? []).map((p) => ({
    id: p.id,
    title: p.title,
    category: p.category,
    description: p.description,
    status: p.status,
    sourceUrl: p.source_url,
    displayOrder: p.display_order,
  }));
}
