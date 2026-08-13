-- 공약 이행현황: 메인 공약(pledges) 안에 세부 공약을 별도 행으로 관리하기 위한 테이블.
-- 기존에는 세부 공약이 pledges.description 안에 "- ..." 줄글로 뭉쳐 있어 가독성이 떨어지고
-- 세부 공약별 추진 상태를 따로 관리할 수 없었다. pledge_items로 분리해 세부 공약마다
-- 상태(추진 전/추진 중/이행 완료)를 개별 지정하고, 메인 공약의 이행 %는 세부 공약들의
-- 상태를 집계해 계산한다.
-- Supabase SQL Editor에서 실행하세요.

create table if not exists pledge_items (
  id uuid primary key default gen_random_uuid(),
  pledge_id uuid not null references pledges(id) on delete cascade,
  content text not null,
  status pledge_status not null default '추진 전',
  display_order integer not null default 0,
  updated_at timestamptz not null default now()
);
create index if not exists idx_pledge_items_pledge_id on pledge_items(pledge_id);

alter table pledge_items enable row level security;
create policy "public read pledge_items" on pledge_items for select using (true);
grant select on pledge_items to anon, authenticated;
grant all on pledge_items to service_role;
