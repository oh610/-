-- votes 테이블에 (bill_id, member_id) 유니크 제약 추가.
-- 표결 동기화 스크립트가 upsert(onConflict)로 재실행 시 중복 없이 갱신할 수 있도록.

alter table votes add constraint uq_votes_bill_member unique (bill_id, member_id);
