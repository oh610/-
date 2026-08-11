-- 요약카드 근거 출처(citations) + 관련 인물(figures) 시연용 더미 데이터.
-- seed.sql(summary_cards)과 seed_members.sql(parties/members)을 먼저 실행한 후 한 번만 실행하세요.

with target_card as (
  select id from summary_cards where published_date = '2026-08-10' limit 1
),
new_press_releases as (
  insert into press_releases (party_id, title, content, source_url, published_at)
  select p.id, '더불어민주당 논평: 예시 법안 관련 입장', '예시용 더미 공식 논평 전문입니다.', 'https://example-party.kr/press/1', now()
  from parties p where p.name = '더불어민주당'
  union all
  select p.id, '국민의힘 논평: 예시 법안 관련 입장', '예시용 더미 공식 논평 전문입니다.', 'https://example-party.kr/press/2', now()
  from parties p where p.name = '국민의힘'
  returning id, party_id
),
new_article as (
  insert into articles (source_name, title, url, raw_content, published_at)
  values ('예시일보', '예시 법안 관련 보도', 'https://example-news.kr/article/1', '예시용 더미 기사 원문입니다.', now())
  returning id
)
insert into summary_card_citations (summary_card_id, stance, sentence_text, source_type, press_release_id, article_id, source_url)
select
  tc.id,
  'pro'::citation_stance,
  '여당은 정책 효과와 시급성을 근거로 법안 처리를 지지한다고 밝혔다.',
  'press_release'::source_type,
  pr.id,
  null::uuid,
  'https://example-party.kr/press/1'
from target_card tc, new_press_releases pr
join parties p on p.id = pr.party_id and p.name = '더불어민주당'
union all
select
  tc.id,
  'con'::citation_stance,
  '야당은 절차적 문제를 지적하며 법안 처리에 반대한다고 밝혔다.',
  'press_release'::source_type,
  pr.id,
  null::uuid,
  'https://example-party.kr/press/2'
from target_card tc, new_press_releases pr
join parties p on p.id = pr.party_id and p.name = '국민의힘'
union all
select
  tc.id,
  'con'::citation_stance,
  '해당 지역구 여론조사에서도 부정적 반응이 우세했다는 보도가 있었다.',
  'article'::source_type,
  null::uuid,
  a.id,
  'https://example-news.kr/article/1'
from target_card tc, new_article a;

-- 관련 추진 인물
insert into summary_card_figures (summary_card_id, member_id)
select sc.id, m.id
from summary_cards sc, members m
where sc.published_date = '2026-08-10' and m.name in ('홍길동', '김철수');
