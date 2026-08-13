-- 의원 전체(약 300명) 언론 언급량을 매일 크론에서 미리 계산해두는 캐시 테이블.
-- 페이지 로드마다 전체 의원을 네이버 API로 실시간 조회하면 호출 수가 너무 많아지므로
-- 하루 한 번 크론에서 갱신하고, 화면에서는 이 테이블만 조회한다.
-- Supabase SQL Editor에서 실행하세요.

create table if not exists member_mention_counts (
  member_id uuid primary key references members(id) on delete cascade,
  mention_count integer not null default 0,
  updated_at timestamptz not null default now()
);

alter table member_mention_counts enable row level security;

create policy "public read member_mention_counts" on member_mention_counts for select using (true);

grant select on member_mention_counts to anon, authenticated;
