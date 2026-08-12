"use server";

import { revalidatePath } from "next/cache";
import { createClient } from "@/lib/supabase/server";
import { supabaseAdmin } from "@/lib/supabase/admin";
import { PRESIDENT_PROFILE_ID } from "@/lib/supabase/president";

async function requireAdmin() {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) throw new Error("로그인이 필요합니다.");

  const { data } = await supabase.from("users").select("is_admin").eq("id", user.id).maybeSingle();
  if (!data?.is_admin) throw new Error("관리자 권한이 필요합니다.");
}

export async function updateProfile(formData: FormData) {
  await requireAdmin();
  const name = (formData.get("name") as string)?.trim();
  const photoUrl = (formData.get("photoUrl") as string)?.trim();
  const termStart = (formData.get("termStart") as string)?.trim();
  const bio = (formData.get("bio") as string)?.trim();
  if (!name) return;

  const { error } = await supabaseAdmin
    .from("president_profile")
    .update({
      name,
      photo_url: photoUrl || null,
      term_start: termStart || null,
      bio: bio || null,
      updated_at: new Date().toISOString(),
    })
    .eq("id", PRESIDENT_PROFILE_ID);
  if (error) throw error;

  revalidatePath("/admin/president");
  revalidatePath("/president");
}
