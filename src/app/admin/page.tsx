import { supabaseAdmin } from "@/lib/supabase/admin";

export const dynamic = "force-dynamic";

function StatCard({ label, value }: { label: string; value: string }) {
  return (
    <div className="rounded-2xl border border-zinc-200 bg-white p-5 dark:border-zinc-800 dark:bg-zinc-950">
      <p className="text-sm text-zinc-500 dark:text-zinc-400">{label}</p>
      <p className="mt-1 text-2xl font-bold text-zinc-900 dark:text-zinc-50">{value}</p>
    </div>
  );
}

export default async function AdminDashboardPage() {
  const [{ count: totalUsers }, { count: paidUsers }, { count: activeSubs }, { data: donations }] =
    await Promise.all([
      supabaseAdmin.from("users").select("*", { count: "exact", head: true }),
      supabaseAdmin.from("users").select("*", { count: "exact", head: true }).eq("tier", "유료"),
      supabaseAdmin.from("subscriptions").select("*", { count: "exact", head: true }).eq("status", "active"),
      supabaseAdmin.from("donations").select("amount_cents"),
    ]);

  const totalDonations = (donations ?? []).reduce((sum: number, d: { amount_cents: number }) => sum + d.amount_cents, 0);

  return (
    <div>
      <h1 className="mb-6 text-2xl font-bold text-zinc-900 dark:text-zinc-50">관리자 대시보드</h1>
      <div className="grid gap-4 sm:grid-cols-3">
        <StatCard label="전체 회원" value={`${totalUsers ?? 0}명`} />
        <StatCard label="유료 구독자" value={`${paidUsers ?? 0}명`} />
        <StatCard label="활성 구독" value={`${activeSubs ?? 0}건`} />
      </div>
      <p className="mt-4 text-sm text-zinc-500 dark:text-zinc-400">
        누적 기부금: {totalDonations.toLocaleString()}원
      </p>
    </div>
  );
}
