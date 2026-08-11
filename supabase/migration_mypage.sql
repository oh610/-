-- 마이페이지: 닉네임 컬럼 추가
-- Supabase SQL Editor에서 실행하세요.

alter table users add column if not exists nickname text;
