import Link from "next/link";
import { supabaseAdmin } from "@/lib/supabase/admin";
import { addRating, deleteRating } from "./actions";

export const dynamic = "force-dynamic";

export default async function AdminPresidentApprovalPage() {
  const { data: ratings } = await supabaseAdmin
    .from("approval_ratings")
    .select("id, survey_date, agency, approval_percent, disapproval_percent, source_url")
    .order("survey_date", { ascending: false })
    .limit(100);

  return (
    <div>
      <h1 className="mb-4 text-xl font-bold text-zinc-900 dark:text-zinc-50">지지율 관리</h1>
      <Link
        href="/admin/president"
        className="mb-4 inline-block text-sm text-violet-600 hover:underline dark:text-violet-400"
      >
        ← 대통령 소개 관리
      </Link>

      <form
        action={addRating}
        className="mb-6 flex flex-wrap items-end gap-3 rounded-2xl border border-zinc-200 bg-white p-5 dark:border-zinc-800 dark:bg-zinc-950"
      >
        <label className="flex flex-col gap-1 text-xs">
          조사일
          <input
            type="date"
            name="surveyDate"
            required
            className="rounded-lg border border-zinc-300 px-3 py-2 text-sm dark:border-zinc-700 dark:bg-zinc-900"
          />
        </label>
        <label className="flex flex-col gap-1 text-xs">
          조사 기관
          <input
            type="text"
            name="agency"
            required
            placeholder="예: 한국갤럽"
            className="rounded-lg border border-zinc-300 px-3 py-2 text-sm dark:border-zinc-700 dark:bg-zinc-900"
          />
        </label>
        <label className="flex flex-col gap-1 text-xs">
          긍정 평가(%)
          <input
            type="number"
            name="approvalPercent"
            step="0.1"
            min="0"
            max="100"
            required
            className="w-24 rounded-lg border border-zinc-300 px-3 py-2 text-sm dark:border-zinc-700 dark:bg-zinc-900"
          />
        </label>
        <label className="flex flex-col gap-1 text-xs">
          부정 평가(%)
          <input
            type="number"
            name="disapprovalPercent"
            step="0.1"
            min="0"
            max="100"
            className="w-24 rounded-lg border border-zinc-300 px-3 py-2 text-sm dark:border-zinc-700 dark:bg-zinc-900"
          />
        </label>
        <label className="flex min-w-[160px] flex-1 flex-col gap-1 text-xs">
          출처 URL
          <input
            type="url"
            name="sourceUrl"
            className="rounded-lg border border-zinc-300 px-3 py-2 text-sm dark:border-zinc-700 dark:bg-zinc-900"
          />
        </label>
        <button type="submit" className="btn-primary shrink-0">
          추가
        </button>
      </form>

      <div className="overflow-x-auto rounded-2xl border border-zinc-200 dark:border-zinc-800">
        <table className="w-full text-sm">
          <thead className="bg-zinc-100 text-left text-zinc-500 dark:bg-zinc-900 dark:text-zinc-400">
            <tr>
              <th className="whitespace-nowrap px-4 py-2">조사일</th>
              <th className="whitespace-nowrap px-4 py-2">기관</th>
              <th className="whitespace-nowrap px-4 py-2">긍정</th>
              <th className="whitespace-nowrap px-4 py-2">부정</th>
              <th className="whitespace-nowrap px-4 py-2">출처</th>
              <th className="whitespace-nowrap px-4 py-2">관리</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-zinc-200 dark:divide-zinc-800">
            {(ratings ?? []).map((r) => (
              <tr key={r.id}>
                <td className="whitespace-nowrap px-4 py-2 text-zinc-900 dark:text-zinc-100">{r.survey_date}</td>
                <td className="whitespace-nowrap px-4 py-2 text-zinc-700 dark:text-zinc-300">{r.agency}</td>
                <td className="whitespace-nowrap px-4 py-2">{r.approval_percent}%</td>
                <td className="whitespace-nowrap px-4 py-2">
                  {r.disapproval_percent === null ? "-" : `${r.disapproval_percent}%`}
                </td>
                <td className="whitespace-nowrap px-4 py-2">
                  {r.source_url ? (
                    <a
                      href={r.source_url}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="text-violet-600 hover:underline dark:text-violet-400"
                    >
                      링크
                    </a>
                  ) : (
                    "-"
                  )}
                </td>
                <td className="whitespace-nowrap px-4 py-2">
                  <form action={deleteRating}>
                    <input type="hidden" name="id" value={r.id} />
                    <button
                      type="submit"
                      className="rounded border border-zinc-300 px-2 py-1 text-xs hover:bg-zinc-100 dark:border-zinc-700 dark:hover:bg-zinc-800"
                    >
                      삭제
                    </button>
                  </form>
                </td>
              </tr>
            ))}
            {(ratings ?? []).length === 0 && (
              <tr>
                <td colSpan={6} className="px-4 py-8 text-center text-zinc-400">
                  등록된 조사가 없습니다.
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
}
