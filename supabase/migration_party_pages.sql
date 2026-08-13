-- 정당 소개 페이지에 쓸 홈페이지 링크/소개 문구 컬럼 추가.
-- parties 테이블은 이미 grants.sql / grants_service_role.sql에서 anon·authenticated·service_role
-- 권한을 부여받고 있으므로 별도 GRANT는 필요 없다.
-- Supabase SQL Editor에서 실행하세요.

alter table parties add column if not exists homepage_url text;
alter table parties add column if not exists description text;
