-- ========================================
-- 관리자 계정
-- is_admin = true 인 계정은 구독(tier='유료') 없이도 전체 콘텐츠에 접근 가능.
-- ========================================

alter table users add column if not exists is_admin boolean not null default false;

-- 관리자 지정 예시 (본인 계정을 관리자로 지정):
-- update users set is_admin = true where email = 'dhaostk@gmail.com';
