"use server";

import { revalidatePath } from "next/cache";
import { createClient } from "@/lib/supabase/server";
import { supabaseAdmin } from "@/lib/supabase/admin";

async function requireAdmin() {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) throw new Error("로그인이 필요합니다.");

  const { data } = await supabase.from("users").select("is_admin").eq("id", user.id).maybeSingle();
  if (!data?.is_admin) throw new Error("관리자 권한이 필요합니다.");
}

export async function addRating(formData: FormData) {
  await requireAdmin();
  const surveyDate = formData.get("surveyDate") as string;
  const agency = (formData.get("agency") as string)?.trim();
  const approvalPercent = Number(formData.get("approvalPercent"));
  const disapprovalRaw = formData.get("disapprovalPercent") as string;
  const sourceUrl = (formData.get("sourceUrl") as string)?.trim();

  if (!surveyDate || !agency || Number.isNaN(approvalPercent)) return;

  const { error } = await supabaseAdmin.from("approval_ratings").upsert(
    {
      survey_date: surveyDate,
      agency,
      approval_percent: approvalPercent,
      disapproval_percent: disapprovalRaw ? Number(disapprovalRaw) : null,
      source_url: sourceUrl || null,
    },
    { onConflict: "survey_date,agency" },
  );
  if (error) throw error;

  revalidatePath("/admin/president/approval");
  revalidatePath("/president/approval");
}

export async function deleteRating(formData: FormData) {
  await requireAdmin();
  const id = formData.get("id") as string;
  if (!id) return;

  const { error } = await supabaseAdmin.from("approval_ratings").delete().eq("id", id);
  if (error) throw error;

  revalidatePath("/admin/president/approval");
  revalidatePath("/president/approval");
}
