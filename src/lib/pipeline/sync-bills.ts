import { fetchRecentBills, fetchVotesForBill } from "@/lib/collectors/assembly";
import { supabaseAdmin } from "@/lib/supabase/admin";

type BillStatus = "계류" | "가결" | "부결" | "폐기" | "철회";

const VOTE_DATE_RE = /^(\d{4})(\d{2})(\d{2}) (\d{2})(\d{2})(\d{2})$/;

function parseVoteDate(raw: string): string {
  const m = VOTE_DATE_RE.exec(raw);
  if (!m) return new Date().toISOString();
  const [, y, mo, d, h, mi, s] = m;
  return new Date(`${y}-${mo}-${d}T${h}:${mi}:${s}+09:00`).toISOString();
}

function mapBillStatus(procResultCd: string | null, passGubun: string | null): BillStatus {
  const text = procResultCd ?? passGubun ?? "";
  if (text.includes("부결")) return "부결";
  if (text.includes("가결")) return "가결";
  if (text.includes("철회")) return "철회";
  if (text.includes("폐기")) return "폐기";
  return "계류";
}

export async function syncBills(billCount = 100, log: (msg: string) => void = console.log) {
  log(`열린국회정보에서 최근 의안 ${billCount}건 조회 중...`);
  const bills = await fetchRecentBills(billCount);
  log(`${bills.length}건 조회됨`);

  const { data: members, error: membersError } = await supabaseAdmin
    .from("members")
    .select("id, assembly_code, current_party_id")
    .not("assembly_code", "is", null);
  if (membersError) throw membersError;

  const memberByCode = new Map(members.map((m) => [m.assembly_code as string, m]));

  let billsUpserted = 0;
  let voteBillsProcessed = 0;
  let votesUpserted = 0;

  for (const row of bills) {
    const sponsor = row.RST_MONA_CD ? memberByCode.get(row.RST_MONA_CD) : undefined;
    const status = mapBillStatus(row.PROC_RESULT_CD, row.PASS_GUBUN);

    const { data: bill, error: billError } = await supabaseAdmin
      .from("bills")
      .upsert(
        {
          bill_no: row.BILL_NO,
          title: row.BILL_NAME,
          main_sponsor_id: sponsor?.id ?? null,
          proposer_party_id: sponsor?.current_party_id ?? null,
          status,
          proposed_date: row.PROPOSE_DT,
          assembly_bill_id: row.BILL_ID,
        },
        { onConflict: "bill_no" },
      )
      .select("id")
      .single();
    if (billError) throw billError;
    billsUpserted += 1;

    if (status !== "가결" && status !== "부결") continue;

    voteBillsProcessed += 1;
    const votes = await fetchVotesForBill(row.BILL_ID);

    for (const v of votes) {
      const member = memberByCode.get(v.MONA_CD);
      if (!member) continue;

      const { error: voteError } = await supabaseAdmin.from("votes").upsert(
        {
          bill_id: bill.id,
          member_id: member.id,
          result: v.RESULT_VOTE_MOD,
          voted_at: parseVoteDate(v.VOTE_DATE),
        },
        { onConflict: "bill_id,member_id" },
      );
      if (voteError) throw voteError;
      votesUpserted += 1;
    }
  }

  log(`완료: 법안 ${billsUpserted}건 upsert, 표결 조회 대상 ${voteBillsProcessed}건, 표결 ${votesUpserted}건 upsert`);
  return { billsUpserted, voteBillsProcessed, votesUpserted };
}
