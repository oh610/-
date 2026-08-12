import { supabase } from "@/lib/supabase/client";
import type { MemberBill, MemberDetail, MemberListItem, MemberVote } from "@/types/member";

type PartyRef = { name: string; ideology: "진보" | "보수" } | { name: string; ideology: "진보" | "보수" }[] | null;

function toParty(party: PartyRef) {
  return Array.isArray(party) ? party[0] ?? null : party;
}

// 국회 API가 내려주는 지역구 명칭은 "수원시병"처럼 시/군/구 이름과 갑·을·병 구분이 붙어있어
// 정치에 관심 없는 사람은 한눈에 읽기 어렵다. 실제 관할 구역(예: 장안구)까지는 별도의
// 검증된 선거구 경계 자료가 있어야 정확히 매길 수 있어 임의로 추정하지 않고,
// 시/군/구 단위 뒤에 공백만 넣어 읽기 쉽게 다듬는다.
export function formatDistrictName(name: string): string {
  // 앞에 최소 2글자가 와야 매칭해, "구로구"처럼 지명 자체가 "구"로 시작하는
  // 경우를 접미사로 착각해 잘못 쪼개지 않도록 한다.
  return name.replace(/(?<=[가-힣]{2,})(시|군|구)(?=[가-힣])/g, "$1 ");
}

export type DistrictOption = { region: string; districtLabel: string; districtName: string };

export async function getDistrictOptions(): Promise<DistrictOption[]> {
  const { data, error } = await supabase
    .from("members")
    .select("district_name")
    .eq("district_type", "지역구")
    .not("district_name", "is", null)
    .order("district_name");

  if (error) {
    console.error("[getDistrictOptions]", error);
    return [];
  }

  const seen = new Set<string>();
  const options: DistrictOption[] = [];
  for (const m of data ?? []) {
    const full = m.district_name ?? "";
    if (seen.has(full)) continue;
    seen.add(full);

    const spaceIdx = full.indexOf(" ");
    if (spaceIdx === -1) continue;
    const region = full.slice(0, spaceIdx);
    const districtLabel = formatDistrictName(full.slice(spaceIdx + 1));
    options.push({ region, districtLabel, districtName: full });
  }
  return options;
}

export async function searchMembers(
  query: string,
  region?: string,
  district?: string,
): Promise<MemberListItem[]> {
  let request = supabase
    .from("members")
    .select("id, name, district_type, district_name, photo_url, parties(name, ideology)")
    .order("name");

  if (query.trim()) {
    request = request.ilike("name", `%${query.trim()}%`);
  }
  if (district) {
    request = request.eq("district_name", district);
  } else if (region) {
    request = request.ilike("district_name", `${region} %`);
  }

  const { data, error } = await request;
  if (error) {
    console.error("[searchMembers]", error);
    return [];
  }

  return (data ?? []).map((m) => {
    const party = toParty(m.parties as PartyRef);
    return {
      id: m.id,
      name: m.name,
      districtType: m.district_type,
      districtName: m.district_name,
      photoUrl: m.photo_url,
      partyName: party?.name ?? null,
      ideology: party?.ideology ?? null,
    };
  });
}

export async function getMemberDetail(id: string): Promise<MemberDetail | null> {
  const { data: member, error } = await supabase
    .from("members")
    .select("id, name, district_type, district_name, photo_url, parties(name, ideology)")
    .eq("id", id)
    .maybeSingle();

  if (error) console.error("[getMemberDetail]", error);
  if (error || !member) return null;

  const party = toParty(member.parties as PartyRef);

  const [{ data: sponsored }, { data: coSponsoredRows }, { data: voteRows }] = await Promise.all([
    supabase
      .from("bills")
      .select("id, title, status, proposed_date, assembly_bill_id")
      .eq("main_sponsor_id", id)
      .order("proposed_date", { ascending: false }),
    supabase
      .from("bill_sponsors")
      .select("bills(id, title, status, proposed_date, assembly_bill_id)")
      .eq("member_id", id),
    supabase
      .from("votes")
      .select("id, result, voted_at, bills(id, title, assembly_bill_id)")
      .eq("member_id", id)
      .order("voted_at", { ascending: false }),
  ]);

  const sponsoredBills: MemberBill[] = (sponsored ?? []).map((b) => ({
    id: b.id,
    title: b.title,
    status: b.status,
    proposedDate: b.proposed_date,
    role: "대표발의",
    assemblyBillId: b.assembly_bill_id,
  }));

  const coSponsoredBills: MemberBill[] = (coSponsoredRows ?? [])
    .map((row) => {
      const bill = Array.isArray(row.bills) ? row.bills[0] : row.bills;
      if (!bill) return null;
      const b: MemberBill = {
        id: bill.id,
        title: bill.title,
        status: bill.status,
        proposedDate: bill.proposed_date,
        role: "공동발의",
        assemblyBillId: bill.assembly_bill_id,
      };
      return b;
    })
    .filter((b): b is MemberBill => b !== null);

  const votes: MemberVote[] = (voteRows ?? [])
    .map((row) => {
      const bill = Array.isArray(row.bills) ? row.bills[0] : row.bills;
      if (!bill) return null;
      const v: MemberVote = {
        id: row.id,
        billId: bill.id,
        billTitle: bill.title,
        result: row.result,
        votedAt: row.voted_at,
        assemblyBillId: bill.assembly_bill_id,
      };
      return v;
    })
    .filter((v): v is MemberVote => v !== null);

  return {
    id: member.id,
    name: member.name,
    districtType: member.district_type,
    districtName: member.district_name,
    photoUrl: member.photo_url,
    partyName: party?.name ?? null,
    ideology: party?.ideology ?? null,
    bills: [...sponsoredBills, ...coSponsoredBills],
    votes,
  };
}
