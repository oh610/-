import "./_env";
import { fetchCurrentMembers } from "@/lib/collectors/assembly";
import { supabaseAdmin } from "@/lib/supabase/admin";

// PRD 4.4 진영 이념 분류 기준표(초안) — 정권 교체와 무관하게 고정.
const IDEOLOGY_MAP: Record<string, "진보" | "보수"> = {
  더불어민주당: "진보",
  조국혁신당: "진보",
  진보당: "진보",
  기본소득당: "진보",
  사회민주당: "진보",
  국민의힘: "보수",
  개혁신당: "보수",
};

const partyIdCache = new Map<string, string>();

async function getOrCreateParty(name: string, ideology: "진보" | "보수"): Promise<string> {
  const cached = partyIdCache.get(name);
  if (cached) return cached;

  const { data: existing, error: selectError } = await supabaseAdmin
    .from("parties")
    .select("id")
    .eq("name", name)
    .maybeSingle();
  if (selectError) throw selectError;

  if (existing) {
    partyIdCache.set(name, existing.id);
    return existing.id;
  }

  const { data: created, error: insertError } = await supabaseAdmin
    .from("parties")
    .insert({ name, ideology, is_active: true })
    .select("id")
    .single();
  if (insertError) throw insertError;

  partyIdCache.set(name, created.id);
  return created.id;
}

async function main() {
  console.log("열린국회정보에서 현직 의원 목록 조회 중...");
  const members = await fetchCurrentMembers();
  console.log(`${members.length}명 조회됨`);

  const skipped: string[] = [];
  let upserted = 0;

  for (const row of members) {
    const partyName = row.POLY_NM?.trim();
    const districtType = row.ELECT_GBN_NM === "비례대표" ? "비례" : "지역구";
    const districtName = districtType === "비례" ? null : row.ORIG_NM;

    let currentPartyId: string | null = null;
    let isIndependent = false;

    if (!partyName || partyName === "무소속") {
      isIndependent = true;
    } else {
      const ideology = IDEOLOGY_MAP[partyName];
      if (!ideology) {
        skipped.push(`${row.HG_NM} (${partyName} — 미분류 정당, PRD 4.4 분류표에 없음)`);
        continue;
      }
      currentPartyId = await getOrCreateParty(partyName, ideology);
    }

    const { error } = await supabaseAdmin.from("members").upsert(
      {
        assembly_code: row.MONA_CD,
        name: row.HG_NM,
        current_party_id: currentPartyId,
        is_independent: isIndependent,
        district_type: districtType,
        district_name: districtName,
      },
      { onConflict: "assembly_code" },
    );
    if (error) throw error;
    upserted += 1;
  }

  console.log(`\n완료: ${upserted}명 upsert`);
  if (skipped.length > 0) {
    console.log(`\n스킵됨 (${skipped.length}명):`);
    skipped.forEach((line) => console.log(`  - ${line}`));
  }
}

main().catch((err) => {
  console.error(err);
  process.exit(1);
});
