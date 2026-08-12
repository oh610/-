import { supabase } from "@/lib/supabase/client";
import type { MemberBill, MemberDetail, MemberListItem, MemberVote } from "@/types/member";

type PartyRef = { name: string; ideology: "진보" | "보수" } | { name: string; ideology: "진보" | "보수" }[] | null;

function toParty(party: PartyRef) {
  return Array.isArray(party) ? party[0] ?? null : party;
}

// 국회 API가 내려주는 지역구 명칭은 "수원시병"처럼 시/군/구 이름과 갑·을·병 구분이 붙어있어
// 정치에 관심 없는 사람은 한눈에 읽기 어렵다. 실제 관할 구역(예: 장안구)까지는 별도의
// 검증된 선거구 경계 자료가 있어야 정확히 매길 수 있고, 지명 중간을 임의로 쪼개면
// "동구군위군을" 같은 병합 지역구가 "동구군 위군 을"처럼 엉뚱하게 잘릴 위험이 있어
// 하지 않는다. 대신 끝에 붙는 갑/을/병/정/무 구분자 앞에만 안전하게 공백을 넣는다.
export function formatDistrictName(name: string): string {
  return name.replace(/([시군구])(갑|을|병|정|무)$/, "$1 $2");
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

export type TopActiveMember = {
  id: string;
  name: string;
  partyName: string | null;
  ideology: "진보" | "보수" | null;
  photoUrl: string | null;
  latestActivityLabel: string;
};

export async function getTopActiveMembers(limit = 10): Promise<TopActiveMember[]> {
  const [sponsoredRes, coSponsoredRes, votesRes] = await Promise.all([
    supabase
      .from("bills")
      .select("main_sponsor_id, proposed_date, title")
      .not("main_sponsor_id", "is", null)
      .order("proposed_date", { ascending: false })
      .limit(300),
    supabase
      .from("bill_sponsors")
      .select("member_id, bills(proposed_date, title)")
      .order("proposed_date", { foreignTable: "bills", ascending: false })
      .limit(300),
    supabase
      .from("votes")
      .select("member_id, voted_at, bills(title)")
      .order("voted_at", { ascending: false })
      .limit(300),
  ]);

  const latestByMember = new Map<string, { date: string; label: string }>();

  function consider(memberId: string | null | undefined, date: string | null | undefined, label: string) {
    if (!memberId || !date) return;
    const current = latestByMember.get(memberId);
    if (!current || date > current.date) {
      latestByMember.set(memberId, { date, label });
    }
  }

  for (const b of sponsoredRes.data ?? []) {
    consider(b.main_sponsor_id, b.proposed_date, `'${b.title}' 대표발의`);
  }
  for (const row of coSponsoredRes.data ?? []) {
    const bill = Array.isArray(row.bills) ? row.bills[0] : row.bills;
    if (bill) consider(row.member_id, bill.proposed_date, `'${bill.title}' 공동발의`);
  }
  for (const v of votesRes.data ?? []) {
    const bill = Array.isArray(v.bills) ? v.bills[0] : v.bills;
    consider(v.member_id, v.voted_at, bill ? `'${bill.title}' 표결` : "표결 참여");
  }

  const topIds = [...latestByMember.entries()]
    .sort((a, b) => (a[1].date < b[1].date ? 1 : -1))
    .slice(0, limit)
    .map(([id]) => id);

  if (topIds.length === 0) return [];

  const { data: members, error } = await supabase
    .from("members")
    .select("id, name, photo_url, parties(name, ideology)")
    .in("id", topIds);

  if (error) {
    console.error("[getTopActiveMembers]", error);
    return [];
  }

  const memberMap = new Map((members ?? []).map((m) => [m.id, m]));

  return topIds
    .map((id) => {
      const m = memberMap.get(id);
      const activity = latestByMember.get(id);
      if (!m || !activity) return null;
      const party = toParty(m.parties as PartyRef);
      const result: TopActiveMember = {
        id,
        name: m.name,
        partyName: party?.name ?? null,
        ideology: party?.ideology ?? null,
        photoUrl: m.photo_url,
        latestActivityLabel: activity.label,
      };
      return result;
    })
    .filter((m): m is TopActiveMember => m !== null);
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
