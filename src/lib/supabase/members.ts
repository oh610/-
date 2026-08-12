import { supabase } from "@/lib/supabase/client";
import type { MemberBill, MemberDetail, MemberListItem, MemberVote } from "@/types/member";

type PartyRef = { name: string; ideology: "진보" | "보수" } | { name: string; ideology: "진보" | "보수" }[] | null;

function toParty(party: PartyRef) {
  return Array.isArray(party) ? party[0] ?? null : party;
}

export type DistrictOption = { id: string; region: string; districtLabel: string };

export async function getDistrictOptions(): Promise<DistrictOption[]> {
  const { data, error } = await supabase
    .from("members")
    .select("id, district_name")
    .eq("district_type", "지역구")
    .not("district_name", "is", null)
    .order("district_name");

  if (error) {
    console.error("[getDistrictOptions]", error);
    return [];
  }

  return (data ?? [])
    .map((m) => {
      const full = m.district_name ?? "";
      const spaceIdx = full.indexOf(" ");
      if (spaceIdx === -1) return null;
      const region = full.slice(0, spaceIdx);
      const districtLabel = full.slice(spaceIdx + 1);
      return { id: m.id, region, districtLabel };
    })
    .filter((d): d is DistrictOption => d !== null);
}

export async function searchMembers(query: string): Promise<MemberListItem[]> {
  let request = supabase
    .from("members")
    .select("id, name, district_type, district_name, photo_url, parties(name, ideology)")
    .order("name");

  if (query.trim()) {
    request = request.ilike("name", `%${query.trim()}%`);
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
