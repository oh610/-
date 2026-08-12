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

  return user.id;
}

export async function setUserTier(formData: FormData) {
  await requireAdmin();
  const userId = formData.get("userId") as string;
  const tier = formData.get("tier") as string;
  if (!userId || (tier !== "무료" && tier !== "유료")) return;

  const { error } = await supabaseAdmin.from("users").update({ tier }).eq("id", userId);
  if (error) throw error;
  revalidatePath("/admin/users");
}

export async function setUserAdmin(formData: FormData) {
  const callerId = await requireAdmin();
  const userId = formData.get("userId") as string;
  const isAdmin = formData.get("isAdmin") === "true";
  if (!userId) return;
  if (userId === callerId && !isAdmin) {
    throw new Error("본인의 관리자 권한은 해제할 수 없습니다.");
  }

  const { error } = await supabaseAdmin.from("users").update({ is_admin: isAdmin }).eq("id", userId);
  if (error) throw error;
  revalidatePath("/admin/users");
}
