-- 세부 공약에도 메인 공약처럼 출처 URL을 개별로 달 수 있도록 컬럼 추가.
-- Supabase SQL Editor에서 실행하세요.

alter table pledge_items add column if not exists source_url text;
