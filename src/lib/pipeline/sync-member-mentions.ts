import { supabaseAdmin } from "@/lib/supabase/admin";
import { getNewsMentionCount } from "@/lib/collectors/naver-news";

const CONCURRENCY = 10;

// 전체 의원(약 300명)의 네이버 뉴스 언급 건수를 조회해 member_mention_counts 테이블에 저장한다.
// 페이지 로드마다 300명 전체를 실시간 조회하면 호출 수가 너무 많아 하루 한 번 크론에서만 갱신한다.
export async function syncMemberMentions(log: (msg: string) => void = console.log) {
  const { data: members, error } = await supabaseAdmin.from("members").select("id, name");
  if (error) throw error;
  if (!members) return { updated: 0 };
  const list = members;

  log(`의원 ${list.length}명 언론 언급량 조회 중...`);

  const results: { member_id: string; mention_count: number; updated_at: string }[] = [];
  const now = new Date().toISOString();
  let cursor = 0;

  async function worker() {
    while (cursor < list.length) {
      const member = list[cursor];
      cursor += 1;
      try {
        const count = await getNewsMentionCount(`${member.name} 의원`);
        results.push({ member_id: member.id, mention_count: count, updated_at: now });
      } catch (err) {
        log(`언급량 조회 실패: ${member.name} - ${err instanceof Error ? err.message : String(err)}`);
        results.push({ member_id: member.id, mention_count: 0, updated_at: now });
      }
    }
  }

  await Promise.all(Array.from({ length: CONCURRENCY }, worker));

  const { error: upsertError } = await supabaseAdmin
    .from("member_mention_counts")
    .upsert(results, { onConflict: "member_id" });
  if (upsertError) throw upsertError;

  log(`완료: ${results.length}명 언급량 갱신`);
  return { updated: results.length };
}
