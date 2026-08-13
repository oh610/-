-- service_role은 기본적으로 RLS를 우회하지만, 테이블 자체 권한(GRANT)은 별도로 필요합니다.
-- (anon 키 때와 동일한 이슈) 배치/서버 스크립트가 모든 테이블에 쓰기 가능하도록 전체 권한 부여.

grant usage on schema public to service_role;

grant all on
  parties, members, member_party_history, bills, bill_sponsors, votes,
  articles, press_releases, summary_cards, summary_card_citations,
  summary_card_figures, party_ideology_classifications, ideology_appeals, users,
  member_mention_counts
to service_role;
