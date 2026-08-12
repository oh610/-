import { supabaseAdmin } from "@/lib/supabase/admin";

export const dynamic = "force-dynamic";

type UserRef = { email: string | null; nickname: string | null } | { email: string | null; nickname: string | null }[] | null;

function toUser(ref: UserRef) {
  return Array.isArray(ref) ? (ref[0] ?? null) : ref;
}

export default async function AdminPaymentsPage() {
  const [{ data: subscriptions }, { data: donations }] = await Promise.all([
    supabaseAdmin
      .from("subscriptions")
      .select("id, plan, status, current_period_end, created_at, users(email, nickname)")
      .order("created_at", { ascending: false })
      .limit(200),
    supabaseAdmin
      .from("donations")
      .select("id, amount_cents, currency, donor_display_name, created_at, users(email, nickname)")
      .order("created_at", { ascending: false })
      .limit(200),
  ]);

  return (
    <div className="flex flex-col gap-10">
      <div>
        <h1 className="mb-4 text-xl font-bold text-zinc-900 dark:text-zinc-50">결제 관리</h1>
        <h2 className="mb-2 text-sm font-semibold text-zinc-700 dark:text-zinc-300">구독</h2>
        <div className="overflow-x-auto rounded-2xl border border-zinc-200 dark:border-zinc-800">
          <table className="w-full text-sm">
            <thead className="bg-zinc-100 text-left text-zinc-500 dark:bg-zinc-900 dark:text-zinc-400">
              <tr>
                <th className="whitespace-nowrap px-4 py-2">회원</th>
                <th className="whitespace-nowrap px-4 py-2">플랜</th>
                <th className="whitespace-nowrap px-4 py-2">상태</th>
                <th className="whitespace-nowrap px-4 py-2">다음 결제일</th>
                <th className="whitespace-nowrap px-4 py-2">시작일</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-zinc-200 dark:divide-zinc-800">
              {(subscriptions ?? []).map(
                (s: {
                  id: string;
                  plan: string;
                  status: string;
                  current_period_end: string | null;
                  created_at: string;
                  users: UserRef;
                }) => {
                  const u = toUser(s.users);
                  return (
                    <tr key={s.id}>
                      <td className="whitespace-nowrap px-4 py-2 text-zinc-900 dark:text-zinc-100">
                        {u?.email ?? u?.nickname ?? "-"}
                      </td>
                      <td className="whitespace-nowrap px-4 py-2">{s.plan}</td>
                      <td className="whitespace-nowrap px-4 py-2">{s.status}</td>
                      <td className="whitespace-nowrap px-4 py-2 text-xs text-zinc-500 dark:text-zinc-400">
                        {s.current_period_end ? new Date(s.current_period_end).toLocaleDateString("ko-KR") : "-"}
                      </td>
                      <td className="whitespace-nowrap px-4 py-2 text-xs text-zinc-500 dark:text-zinc-400">
                        {new Date(s.created_at).toLocaleDateString("ko-KR")}
                      </td>
                    </tr>
                  );
                },
              )}
              {(subscriptions ?? []).length === 0 && (
                <tr>
                  <td colSpan={5} className="px-4 py-8 text-center text-zinc-400">
                    구독 내역이 없습니다.
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </div>

      <div>
        <h2 className="mb-2 text-sm font-semibold text-zinc-700 dark:text-zinc-300">기부</h2>
        <div className="overflow-x-auto rounded-2xl border border-zinc-200 dark:border-zinc-800">
          <table className="w-full text-sm">
            <thead className="bg-zinc-100 text-left text-zinc-500 dark:bg-zinc-900 dark:text-zinc-400">
              <tr>
                <th className="whitespace-nowrap px-4 py-2">회원</th>
                <th className="whitespace-nowrap px-4 py-2">금액</th>
                <th className="whitespace-nowrap px-4 py-2">날짜</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-zinc-200 dark:divide-zinc-800">
              {(donations ?? []).map(
                (d: {
                  id: string;
                  amount_cents: number;
                  currency: string;
                  donor_display_name: string | null;
                  created_at: string;
                  users: UserRef;
                }) => {
                  const u = toUser(d.users);
                  return (
                    <tr key={d.id}>
                      <td className="whitespace-nowrap px-4 py-2 text-zinc-900 dark:text-zinc-100">
                        {d.donor_display_name ?? u?.email ?? u?.nickname ?? "-"}
                      </td>
                      <td className="whitespace-nowrap px-4 py-2">
                        {d.amount_cents.toLocaleString()}
                        {d.currency}
                      </td>
                      <td className="whitespace-nowrap px-4 py-2 text-xs text-zinc-500 dark:text-zinc-400">
                        {new Date(d.created_at).toLocaleDateString("ko-KR")}
                      </td>
                    </tr>
                  );
                },
              )}
              {(donations ?? []).length === 0 && (
                <tr>
                  <td colSpan={3} className="px-4 py-8 text-center text-zinc-400">
                    기부 내역이 없습니다.
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}
