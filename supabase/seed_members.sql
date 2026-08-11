-- 국회의원 검색 기능 시연용 더미 데이터. 한 번만 실행하세요 (재실행 시 정당이 중복 생성됩니다).

with new_parties as (
  insert into parties (name, ideology, is_active) values
    ('더불어민주당', '진보', true),
    ('국민의힘', '보수', true)
  returning id, name
),
new_members as (
  insert into members (name, current_party_id, district_type, district_name)
  select '홍길동', id, '지역구'::district_type, '서울 강남갑' from new_parties where name = '더불어민주당'
  union all
  select '김철수', id, '지역구'::district_type, '부산 해운대갑' from new_parties where name = '국민의힘'
  union all
  select '이영희', id, '비례'::district_type, null from new_parties where name = '더불어민주당'
  returning id, name
),
new_bills as (
  insert into bills (bill_no, title, summary, main_sponsor_id, proposer_party_id, status, proposed_date)
  select 'BILL-2026-001', '가상 법안 1호: 예시 지원법', '예시용 더미 법안입니다.', m.id, p.id, '계류'::bill_status, date '2026-05-01'
  from new_members m join new_parties p on p.name = '더불어민주당' where m.name = '홍길동'
  union all
  select 'BILL-2026-002', '가상 법안 2호: 예시 개정안', '예시용 더미 법안입니다.', m.id, p.id, '가결'::bill_status, date '2026-03-15'
  from new_members m join new_parties p on p.name = '국민의힘' where m.name = '김철수'
  union all
  select 'BILL-2026-003', '가상 법안 3호: 예시 특별법', '예시용 더미 법안입니다.', m.id, p.id, '부결'::bill_status, date '2026-06-20'
  from new_members m join new_parties p on p.name = '더불어민주당' where m.name = '이영희'
  returning id, bill_no
)
insert into bill_sponsors (bill_id, member_id)
select b.id, m.id
from new_bills b, new_members m
where b.bill_no = 'BILL-2026-001' and m.name = '김철수';

-- 표결 이력 (가상 법안 2호에 대한 3명의 표결)
insert into votes (bill_id, member_id, result, voted_at)
select b.id, m.id, v.result::vote_result, v.voted_at::timestamptz
from bills b, members m,
  (values
    ('BILL-2026-002', '홍길동', '찬성', '2026-03-20T10:00:00+09'),
    ('BILL-2026-002', '김철수', '찬성', '2026-03-20T10:00:00+09'),
    ('BILL-2026-002', '이영희', '반대', '2026-03-20T10:00:00+09')
  ) as v(bill_no, member_name, result, voted_at)
where b.bill_no = v.bill_no and m.name = v.member_name;
