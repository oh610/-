import { supabase } from "@/lib/supabase/client";

export type Review = {
  id: string;
  displayName: string;
  content: string;
};

export async function getApprovedReviews(limit = 20): Promise<Review[]> {
  const { data, error } = await supabase
    .from("reviews")
    .select("id, display_name, content")
    .eq("approved", true)
    .order("created_at", { ascending: false })
    .limit(limit);

  if (error) {
    console.error("[getApprovedReviews]", error);
    return [];
  }

  return (data ?? []).map((row) => ({
    id: row.id,
    displayName: row.display_name,
    content: row.content,
  }));
}
