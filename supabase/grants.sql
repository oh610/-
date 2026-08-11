-- schema.sql을 이미 실행한 프로젝트에 GRANT 문만 추가로 적용할 때 사용.
-- (anon 롤이 "permission denied for table ..." 에러를 낼 때 실행)

grant usage on schema public to anon, authenticated;

grant select on
  parties, members, member_party_history, bills, bill_sponsors, votes,
  articles, press_releases, summary_cards, summary_card_citations,
  summary_card_figures, party_ideology_classifications
to anon, authenticated;

grant select, insert on ideology_appeals to authenticated;
grant select on ideology_appeals to anon;

grant select, update on users to authenticated;
