import Link from "next/link";
import { supabaseAdmin } from "@/lib/supabase/admin";
import { addPledge, updatePledgeStatus, deletePledge } from "./actions";

export const dynamic = "force-dynamic";

const STATUSES = ["추진 전", "추진 중", "이행 완료"] as const;

export default async function AdminPresidentPledgesPage() {
  const { data: pledges } = await supabaseAdmin
    .from("pledges")
    .select("id, title, category, description, status, source_url, display_order")
    .order("display_order", { ascending: true });

  return (
    <div>
      <h1 className="mb-4 text-xl font-bold text-zinc-900 dark:text-zinc-50">공약 관리</h1>
      <Link
        href="/admin/president"
        className="mb-4 inline-block text-sm text-violet-600 hover:underline dark:text-violet-400"
      >
        ← 대통령 소개 관리
      </Link>

      <form
        action={addPledge}
        className="mb-6 flex flex-col gap-3 rounded-2xl border border-zinc-200 bg-white p-5 dark:border-zinc-800 dark:bg-zinc-950"
      >
        <div className="flex flex-wrap gap-3">
          <label className="flex min-w-[200px] flex-1 flex-col gap-1 text-xs">
            공약명
            <input
              type="text"
              name="title"
              required
              className="rounded-lg border border-zinc-300 px-3 py-2 text-sm dark:border-zinc-700 dark:bg-zinc-900"
            />
          </label>
          <label className="flex w-32 flex-col gap-1 text-xs">
            분야
            <input
              type="text"
              name="category"
              placeholder="예: 경제"
              className="rounded-lg border border-zinc-300 px-3 py-2 text-sm dark:border-zinc-700 dark:bg-zinc-900"
            />
          </label>
          <label className="flex w-24 flex-col gap-1 text-xs">
            순서
            <input
              type="number"
              name="displayOrder"
              defaultValue={0}
              className="rounded-lg border border-zinc-300 px-3 py-2 text-sm dark:border-zinc-700 dark:bg-zinc-900"
            />
          </label>
        </div>
        <label className="flex flex-col gap-1 text-xs">
          설명
          <textarea
            name="description"
            rows={2}
            className="rounded-lg border border-zinc-300 px-3 py-2 text-sm dark:border-zinc-700 dark:bg-zinc-900"
          />
        </label>
        <label className="flex flex-col gap-1 text-xs">
          출처 URL
          <input
            type="url"
            name="sourceUrl"
            className="rounded-lg border border-zinc-300 px-3 py-2 text-sm dark:border-zinc-700 dark:bg-zinc-900"
          />
        </label>
        <button type="submit" className="btn-primary self-start">
          추가
        </button>
      </form>

      <ul className="flex flex-col gap-3">
        {(pledges ?? []).map((p) => (
          <li
            key={p.id}
            className="rounded-2xl border border-zinc-200 bg-white p-5 dark:border-zinc-800 dark:bg-zinc-950"
          >
            <div className="flex items-start justify-between gap-3">
              <div className="min-w-0">
                {p.category && <p className="text-xs text-zinc-400">{p.category}</p>}
                <p className="font-semibold text-zinc-900 dark:text-zinc-50">{p.title}</p>
                {p.description && (
                  <p className="mt-1 text-sm text-zinc-500 dark:text-zinc-400">{p.description}</p>
                )}
              </div>
              <form action={deletePledge}>
                <input type="hidden" name="id" value={p.id} />
                <button
                  type="submit"
                  className="shrink-0 rounded border border-zinc-300 px-2 py-1 text-xs hover:bg-zinc-100 dark:border-zinc-700 dark:hover:bg-zinc-800"
                >
                  삭제
                </button>
              </form>
            </div>
            <form action={updatePledgeStatus} className="mt-3 flex items-center gap-2">
              <input type="hidden" name="id" value={p.id} />
              <select
                name="status"
                defaultValue={p.status}
                className="rounded-lg border border-zinc-300 px-2 py-1 text-xs dark:border-zinc-700 dark:bg-zinc-900"
              >
                {STATUSES.map((s) => (
                  <option key={s} value={s}>
                    {s}
                  </option>
                ))}
              </select>
              <button
                type="submit"
                className="rounded border border-zinc-300 px-2 py-1 text-xs hover:bg-zinc-100 dark:border-zinc-700 dark:hover:bg-zinc-800"
              >
                상태 변경
              </button>
            </form>
          </li>
        ))}
        {(pledges ?? []).length === 0 && <p className="text-sm text-zinc-400">등록된 공약이 없습니다.</p>}
      </ul>
    </div>
  );
}
