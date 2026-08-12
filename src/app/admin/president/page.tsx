import Link from "next/link";
import { supabaseAdmin } from "@/lib/supabase/admin";
import { PRESIDENT_PROFILE_ID } from "@/lib/supabase/president";
import { updateProfile } from "./actions";

export const dynamic = "force-dynamic";

export default async function AdminPresidentPage() {
  const { data: profile } = await supabaseAdmin
    .from("president_profile")
    .select("name, photo_url, term_start, bio")
    .eq("id", PRESIDENT_PROFILE_ID)
    .maybeSingle();

  return (
    <div>
      <h1 className="mb-4 text-xl font-bold text-zinc-900 dark:text-zinc-50">대통령 소개 관리</h1>
      <div className="mb-4 flex gap-3 text-sm">
        <Link href="/admin/president/approval" className="text-violet-600 hover:underline dark:text-violet-400">
          지지율 관리
        </Link>
        <Link href="/admin/president/pledges" className="text-violet-600 hover:underline dark:text-violet-400">
          공약 관리
        </Link>
      </div>

      <form
        action={updateProfile}
        className="flex max-w-lg flex-col gap-4 rounded-2xl border border-zinc-200 bg-white p-6 dark:border-zinc-800 dark:bg-zinc-950"
      >
        <label className="flex flex-col gap-1 text-sm">
          이름
          <input
            type="text"
            name="name"
            defaultValue={profile?.name ?? ""}
            required
            className="rounded-lg border border-zinc-300 px-3 py-2 dark:border-zinc-700 dark:bg-zinc-900"
          />
        </label>
        <label className="flex flex-col gap-1 text-sm">
          사진 URL
          <input
            type="url"
            name="photoUrl"
            defaultValue={profile?.photo_url ?? ""}
            className="rounded-lg border border-zinc-300 px-3 py-2 dark:border-zinc-700 dark:bg-zinc-900"
          />
        </label>
        <label className="flex flex-col gap-1 text-sm">
          취임일
          <input
            type="date"
            name="termStart"
            defaultValue={profile?.term_start ?? ""}
            className="rounded-lg border border-zinc-300 px-3 py-2 dark:border-zinc-700 dark:bg-zinc-900"
          />
        </label>
        <label className="flex flex-col gap-1 text-sm">
          이력 (한 줄에 하나씩)
          <textarea
            name="bio"
            rows={8}
            defaultValue={profile?.bio ?? ""}
            className="rounded-lg border border-zinc-300 px-3 py-2 dark:border-zinc-700 dark:bg-zinc-900"
          />
        </label>
        <button type="submit" className="btn-primary self-start">
          저장
        </button>
      </form>
    </div>
  );
}
