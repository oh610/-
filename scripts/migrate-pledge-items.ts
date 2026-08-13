import "./_env";
import { supabaseAdmin } from "@/lib/supabase/admin";

// 일회성 마이그레이션: pledges.description에 "- ..." 줄글로 뭉쳐 있던 세부 공약을
// pledge_items 행으로 분리한다. migration_pledge_items.sql 실행 후 한 번만 돌리면 된다.
// 이미 pledge_items가 있는 공약은 건너뛰어 중복 실행해도 안전하다.
async function main() {
  const { data: pledges, error } = await supabaseAdmin
    .from("pledges")
    .select("id, title, description, status");
  if (error) throw error;
  if (!pledges) return;

  let migrated = 0;
  let skipped = 0;

  for (const pledge of pledges) {
    const { count } = await supabaseAdmin
      .from("pledge_items")
      .select("id", { count: "exact", head: true })
      .eq("pledge_id", pledge.id);
    if (count && count > 0) {
      skipped += 1;
      continue;
    }

    const raw = (pledge.description as string | null)?.trim();
    if (!raw) continue;

    const bulletLines = raw
      .split(/\r?\n/)
      .map((line: string) => line.trim())
      .filter((line: string) => line.startsWith("-"))
      .map((line: string) => line.replace(/^-+\s*/, "").trim())
      .filter(Boolean);

    const contents = bulletLines.length > 0 ? bulletLines : [raw];

    const rows = contents.map((content: string, i: number) => ({
      pledge_id: pledge.id,
      content,
      status: pledge.status,
      display_order: i,
    }));

    const { error: insertError } = await supabaseAdmin.from("pledge_items").insert(rows);
    if (insertError) throw insertError;

    console.log(`[${pledge.title}] 세부 공약 ${rows.length}건 생성`);
    migrated += 1;
  }

  console.log(`완료: ${migrated}건 마이그레이션, ${skipped}건 건너뜀`);
}

main().catch((err) => {
  console.error(err);
  process.exit(1);
});
