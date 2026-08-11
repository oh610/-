-- 발의 법안/표결 이력에서 국회 의안정보시스템 원문으로 연결하기 위한 컬럼
-- Supabase SQL Editor에서 실행하세요.

alter table bills add column if not exists assembly_bill_id text;
