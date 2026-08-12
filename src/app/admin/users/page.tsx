import { supabaseAdmin } from "@/lib/supabase/admin";
import { setUserTier, setUserAdmin } from "./actions";

export const dynamic = "force-dynamic";

function trialStatus(u: { trial_redeemed_at: string | null; trial_expires_at: string | null }) {
  if (!u.trial_redeemed_at) return "미사용";
  if (u.trial_expires_at && new Date(u.trial_expires_at) > new Date()) return "체험중";
  return "만료";
}

function discountStatus(u: { discount_coupon_code: string | null; discount_coupon_redeemed_at: string | null }) {
  if (!u.discount_coupon_code) return "미발급";
  return u.discount_coupon_redeemed_at ? "사용됨" : "미사용";
}

export default async function AdminUsersPage({
  searchParams,
}: {
  searchParams: Promise<{ q?: string }>;
}) {
  const { q } = await searchParams;

  let query = supabaseAdmin
    .from("users")
    .select(
      "id, email, nickname, tier, is_admin, created_at, trial_redeemed_at, trial_expires_at, discount_coupon_code, discount_coupon_redeemed_at",
    )
    .order("created_at", { ascending: false })
    .limit(200);

  if (q?.trim()) {
    query = query.or(`email.ilike.%${q.trim()}%,nickname.ilike.%${q.trim()}%`);
  }

  const { data: users } = await query;

  return (
    <div>
      <h1 className="mb-4 text-xl font-bold text-zinc-900 dark:text-zinc-50">회원 관리</h1>
      <form className="mb-4">
        <input
          type="text"
          name="q"
          defaultValue={q ?? ""}
          placeholder="이메일 또는 닉네임 검색"
          className="w-full max-w-xs rounded-lg border border-zinc-300 bg-white px-3 py-2 text-sm text-zinc-900 dark:border-zinc-700 dark:bg-zinc-900 dark:text-zinc-100"
        />
      </form>

      <div className="overflow-x-auto rounded-2xl border border-zinc-200 dark:border-zinc-800">
        <table className="w-full text-sm">
          <thead className="bg-zinc-100 text-left text-zinc-500 dark:bg-zinc-900 dark:text-zinc-400">
            <tr>
              <th className="whitespace-nowrap px-4 py-2">이메일</th>
              <th className="whitespace-nowrap px-4 py-2">닉네임</th>
              <th className="whitespace-nowrap px-4 py-2">등급</th>
              <th className="whitespace-nowrap px-4 py-2">관리자</th>
              <th className="whitespace-nowrap px-4 py-2">체험 쿠폰</th>
              <th className="whitespace-nowrap px-4 py-2">할인 쿠폰</th>
              <th className="whitespace-nowrap px-4 py-2">가입일</th>
              <th className="whitespace-nowrap px-4 py-2">관리</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-zinc-200 dark:divide-zinc-800">
            {(users ?? []).map(
              (u: {
                id: string;
                email: string | null;
                nickname: string | null;
                tier: string;
                is_admin: boolean;
                created_at: string;
                trial_redeemed_at: string | null;
                trial_expires_at: string | null;
                discount_coupon_code: string | null;
                discount_coupon_redeemed_at: string | null;
              }) => (
              <tr key={u.id}>
                <td className="whitespace-nowrap px-4 py-2 text-zinc-900 dark:text-zinc-100">{u.email ?? "-"}</td>
                <td className="whitespace-nowrap px-4 py-2 text-zinc-700 dark:text-zinc-300">{u.nickname ?? "-"}</td>
                <td className="whitespace-nowrap px-4 py-2">{u.tier}</td>
                <td className="whitespace-nowrap px-4 py-2">{u.is_admin ? "✅" : "-"}</td>
                <td className="whitespace-nowrap px-4 py-2">{trialStatus(u)}</td>
                <td className="whitespace-nowrap px-4 py-2">{discountStatus(u)}</td>
                <td className="whitespace-nowrap px-4 py-2 text-xs text-zinc-500 dark:text-zinc-400">
                  {new Date(u.created_at).toLocaleDateString("ko-KR")}
                </td>
                <td className="whitespace-nowrap px-4 py-2">
                  <div className="flex gap-2">
                    <form action={setUserTier}>
                      <input type="hidden" name="userId" value={u.id} />
                      <input type="hidden" name="tier" value={u.tier === "유료" ? "무료" : "유료"} />
                      <button
                        type="submit"
                        className="rounded border border-zinc-300 px-2 py-1 text-xs hover:bg-zinc-100 dark:border-zinc-700 dark:hover:bg-zinc-800"
                      >
                        {u.tier === "유료" ? "무료 전환" : "유료 전환"}
                      </button>
                    </form>
                    <form action={setUserAdmin}>
                      <input type="hidden" name="userId" value={u.id} />
                      <input type="hidden" name="isAdmin" value={u.is_admin ? "false" : "true"} />
                      <button
                        type="submit"
                        className="rounded border border-zinc-300 px-2 py-1 text-xs hover:bg-zinc-100 dark:border-zinc-700 dark:hover:bg-zinc-800"
                      >
                        {u.is_admin ? "관리자 해제" : "관리자 지정"}
                      </button>
                    </form>
                  </div>
                </td>
              </tr>
            ))}
            {(users ?? []).length === 0 && (
              <tr>
                <td colSpan={8} className="px-4 py-8 text-center text-zinc-400">
                  회원이 없습니다.
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
}
