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
  activityCount: number;
};

async function getMemberActivityCounts(days: number): Promise<Map<string, number>> {
  const sinceMs = Date.now() - days * 24 * 60 * 60 * 1000;

  const [sponsoredRes, coSponsoredRes, votesRes] = await Promise.all([
    supabase
      .from("bills")
      .select("main_sponsor_id, proposed_date")
      .not("main_sponsor_id", "is", null)
      .order("proposed_date", { ascending: false })
      .limit(500),
    supabase
      .from("bill_sponsors")
      .select("member_id, bills(proposed_date)")
      .order("proposed_date", { foreignTable: "bills", ascending: false })
      .limit(500),
    supabase
      .from("votes")
      .select("member_id, voted_at")
      .order("voted_at", { ascending: false })
      .limit(500),
  ]);

  const countByMember = new Map<string, number>();

  function bump(memberId: string | null | undefined, date: string | null | undefined) {
    if (!memberId || !date) return;
    if (new Date(date).getTime() < sinceMs) return;
    countByMember.set(memberId, (countByMember.get(memberId) ?? 0) + 1);
  }

  for (const b of sponsoredRes.data ?? []) {
    bump(b.main_sponsor_id, b.proposed_date);
  }
  for (const row of coSponsoredRes.data ?? []) {
    const bill = Array.isArray(row.bills) ? row.bills[0] : row.bills;
    bump(row.member_id, bill?.proposed_date ?? null);
  }
  for (const v of votesRes.data ?? []) {
    bump(v.member_id, v.voted_at);
  }

  return countByMember;
}

async function resolveActiveMembers(
  ids: string[],
  countByMember: Map<string, number>,
): Promise<TopActiveMember[]> {
  if (ids.length === 0) return [];

  const { data: members, error } = await supabase
    .from("members")
    .select("id, name, photo_url, parties(name, ideology)")
    .in("id", ids);

  if (error) {
    console.error("[resolveActiveMembers]", error);
    return [];
  }

  const memberMap = new Map((members ?? []).map((m) => [m.id, m]));

  return ids
    .map((id) => {
      const m = memberMap.get(id);
      const count = countByMember.get(id);
      if (!m || !count) return null;
      const party = toParty(m.parties as PartyRef);
      const result: TopActiveMember = {
        id,
        name: m.name,
        partyName: party?.name ?? null,
        ideology: party?.ideology ?? null,
        photoUrl: m.photo_url,
        activityCount: count,
      };
      return result;
    })
    .filter((m): m is TopActiveMember => m !== null);
}

export async function getTopActiveMembers(limit = 10, days = 30): Promise<TopActiveMember[]> {
  const countByMember = await getMemberActivityCounts(days);
  const topIds = [...countByMember.entries()]
    .sort((a, b) => b[1] - a[1])
    .slice(0, limit)
    .map(([id]) => id);
  return resolveActiveMembers(topIds, countByMember);
}

// 활동이 0건인 의원은 300명 넘게 동률이라 순위로서 의미가 없어 제외하고,
// "그나마 활동은 있지만 가장 저조한" 의원을 보여준다.
export async function getLeastActiveMembers(limit = 5, days = 30): Promise<TopActiveMember[]> {
  const countByMember = await getMemberActivityCounts(days);
  const leastIds = [...countByMember.entries()]
    .sort((a, b) => a[1] - b[1])
    .slice(0, limit)
    .map(([id]) => id);
  return resolveActiveMembers(leastIds, countByMember);
}

async function getLastActivityDates(): Promise<Map<string, string>> {
  const [sponsoredRes, coSponsoredRes, votesRes] = await Promise.all([
    supabase
      .from("bills")
      .select("main_sponsor_id, proposed_date")
      .not("main_sponsor_id", "is", null)
      .order("proposed_date", { ascending: false })
      .limit(2000),
    supabase
      .from("bill_sponsors")
      .select("member_id, bills(proposed_date)")
      .order("proposed_date", { foreignTable: "bills", ascending: false })
      .limit(2000),
    supabase.from("votes").select("member_id, voted_at").order("voted_at", { ascending: false }).limit(2000),
  ]);

  const lastByMember = new Map<string, string>();

  function consider(memberId: string | null | undefined, date: string | null | undefined) {
    if (!memberId || !date) return;
    const existing = lastByMember.get(memberId);
    if (!existing || new Date(date).getTime() > new Date(existing).getTime()) {
      lastByMember.set(memberId, date);
    }
  }

  for (const b of sponsoredRes.data ?? []) {
    consider(b.main_sponsor_id, b.proposed_date);
  }
  for (const row of coSponsoredRes.data ?? []) {
    const bill = Array.isArray(row.bills) ? row.bills[0] : row.bills;
    consider(row.member_id, bill?.proposed_date ?? null);
  }
  for (const v of votesRes.data ?? []) {
    consider(v.member_id, v.voted_at);
  }

  return lastByMember;
}

export type InactiveMember = {
  id: string;
  name: string;
  partyName: string | null;
  ideology: "진보" | "보수" | null;
  photoUrl: string | null;
  inactiveDays: number | null; // null = 활동 이력이 아예 없음
};

// 최근 N일간 활동이 0건인 의원 중, 동률(0건)이 많으므로 "역대 마지막 활동일이 가장
// 오래된"(=미활동 기간이 가장 긴) 순으로 상위 limit명을 뽑고 나머지는 개수만 센다.
export async function getInactiveMembers(
  limit = 5,
  days = 30,
): Promise<{ members: InactiveMember[]; totalCount: number }> {
  const [countByMember, lastActivityByMember, allMembersRes] = await Promise.all([
    getMemberActivityCounts(days),
    getLastActivityDates(),
    supabase.from("members").select("id, name, photo_url, parties(name, ideology)"),
  ]);

  if (allMembersRes.error) {
    console.error("[getInactiveMembers]", allMembersRes.error);
    return { members: [], totalCount: 0 };
  }

  const inactive = (allMembersRes.data ?? [])
    .filter((m) => !countByMember.has(m.id))
    .map((m) => {
      const last = lastActivityByMember.get(m.id);
      const inactiveDays = last ? Math.floor((Date.now() - new Date(last).getTime()) / (24 * 60 * 60 * 1000)) : null;
      const party = toParty(m.parties as PartyRef);
      const result: InactiveMember = {
        id: m.id,
        name: m.name,
        partyName: party?.name ?? null,
        ideology: party?.ideology ?? null,
        photoUrl: m.photo_url,
        inactiveDays,
      };
      return result;
    });

  inactive.sort((a, b) => {
    if (a.inactiveDays === null && b.inactiveDays === null) return 0;
    if (a.inactiveDays === null) return -1; // 활동 이력이 아예 없으면 가장 오래된 것으로 취급
    if (b.inactiveDays === null) return 1;
    return b.inactiveDays - a.inactiveDays;
  });

  return { members: inactive.slice(0, limit), totalCount: inactive.length };
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
