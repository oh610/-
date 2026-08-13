import { supabase } from "@/lib/supabase/client";
import { searchNews } from "@/lib/collectors/naver-news";
import type { PartyDetail, PartyListItem, PartyMemberItem, PartyNewsItem } from "@/types/party";

export async function getPartyList(): Promise<PartyListItem[]> {
  const [partiesRes, membersRes] = await Promise.all([
    supabase.from("parties").select("id, name, ideology").eq("is_active", true),
    supabase.from("members").select("current_party_id").not("current_party_id", "is", null),
  ]);

  if (partiesRes.error) {
    console.error("[getPartyList]", partiesRes.error);
    return [];
  }

  const countByParty = new Map<string, number>();
  for (const m of membersRes.data ?? []) {
    const id = m.current_party_id as string;
    countByParty.set(id, (countByParty.get(id) ?? 0) + 1);
  }

  return (partiesRes.data ?? [])
    .map((p) => ({
      id: p.id,
      name: p.name,
      ideology: p.ideology,
      memberCount: countByParty.get(p.id) ?? 0,
    }))
    .sort((a, b) => b.memberCount - a.memberCount);
}

export async function getIndependentMemberCount(): Promise<number> {
  const { count, error } = await supabase
    .from("members")
    .select("id", { count: "exact", head: true })
    .is("current_party_id", null);

  if (error) {
    console.error("[getIndependentMemberCount]", error);
    return 0;
  }
  return count ?? 0;
}

export async function getPartyDetail(id: string): Promise<PartyDetail | null> {
  const [partyRes, membersRes] = await Promise.all([
    supabase.from("parties").select("id, name, ideology, description, homepage_url").eq("id", id).single(),
    supabase
      .from("members")
      .select("id, name, photo_url, district_type, district_name")
      .eq("current_party_id", id)
      .order("name"),
  ]);

  if (partyRes.error || !partyRes.data) {
    console.error("[getPartyDetail]", partyRes.error);
    return null;
  }

  const members: PartyMemberItem[] = (membersRes.data ?? []).map((m) => ({
    id: m.id,
    name: m.name,
    photoUrl: m.photo_url,
    districtType: m.district_type,
    districtName: m.district_name,
  }));

  let news: PartyNewsItem[] = [];
  try {
    const items = await searchNews(partyRes.data.name, 8);
    news = items.map((n) => ({ title: n.title, link: n.link, description: n.description, pubDate: n.pubDate }));
  } catch (err) {
    console.error("[getPartyDetail] 뉴스 조회 실패", err);
  }

  return {
    id: partyRes.data.id,
    name: partyRes.data.name,
    ideology: partyRes.data.ideology,
    description: partyRes.data.description,
    homepageUrl: partyRes.data.homepage_url,
    members,
    news,
  };
}
