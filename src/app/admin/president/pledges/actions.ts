"use server";

import { revalidatePath } from "next/cache";
import { createClient } from "@/lib/supabase/server";
import { supabaseAdmin } from "@/lib/supabase/admin";

const STATUSES = ["추진 전", "추진 중", "이행 완료"];

async function requireAdmin() {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) throw new Error("로그인이 필요합니다.");

  const { data } = await supabase.from("users").select("is_admin").eq("id", user.id).maybeSingle();
  if (!data?.is_admin) throw new Error("관리자 권한이 필요합니다.");
}

function revalidatePledgePages() {
  revalidatePath("/admin/president/pledges");
  revalidatePath("/president/pledges");
}

export async function addPledge(formData: FormData) {
  await requireAdmin();
  const title = (formData.get("title") as string)?.trim();
  const category = (formData.get("category") as string)?.trim();
  const sourceUrl = (formData.get("sourceUrl") as string)?.trim();
  const displayOrder = Number(formData.get("displayOrder")) || 0;
  if (!title) return;

  const { error } = await supabaseAdmin.from("pledges").insert({
    title,
    category: category || null,
    source_url: sourceUrl || null,
    display_order: displayOrder,
  });
  if (error) throw error;

  revalidatePledgePages();
}

export async function deletePledge(formData: FormData) {
  await requireAdmin();
  const id = formData.get("id") as string;
  if (!id) return;

  const { error } = await supabaseAdmin.from("pledges").delete().eq("id", id);
  if (error) throw error;

  revalidatePledgePages();
}

export async function addPledgeItem(formData: FormData) {
  await requireAdmin();
  const pledgeId = formData.get("pledgeId") as string;
  const content = (formData.get("content") as string)?.trim();
  const status = (formData.get("status") as string) || "추진 전";
  if (!pledgeId || !content || !STATUSES.includes(status)) return;

  const { count } = await supabaseAdmin
    .from("pledge_items")
    .select("id", { count: "exact", head: true })
    .eq("pledge_id", pledgeId);

  const { error } = await supabaseAdmin.from("pledge_items").insert({
    pledge_id: pledgeId,
    content,
    status,
    display_order: count ?? 0,
  });
  if (error) throw error;

  revalidatePledgePages();
}

export async function updatePledgeItemStatus(formData: FormData) {
  await requireAdmin();
  const id = formData.get("id") as string;
  const status = formData.get("status") as string;
  if (!id || !STATUSES.includes(status)) return;

  const { error } = await supabaseAdmin
    .from("pledge_items")
    .update({ status, updated_at: new Date().toISOString() })
    .eq("id", id);
  if (error) throw error;

  revalidatePledgePages();
}

export async function deletePledgeItem(formData: FormData) {
  await requireAdmin();
  const id = formData.get("id") as string;
  if (!id) return;

  const { error } = await supabaseAdmin.from("pledge_items").delete().eq("id", id);
  if (error) throw error;

  revalidatePledgePages();
}
