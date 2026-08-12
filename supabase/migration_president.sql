-- ========================================
-- 대통령 페이지: 소개 / 지지율 / 공약 이행현황
-- ========================================

create table president_profile (
  id uuid primary key default gen_random_uuid(),
  name text not null default '',
  photo_url text,
  term_start date,
  bio text,
  updated_at timestamptz not null default now()
);
insert into president_profile (id, name)
values ('00000000-0000-0000-0000-000000000001', '')
on conflict (id) do nothing;

alter table president_profile enable row level security;
create policy "public read president_profile" on president_profile for select using (true);
grant select on president_profile to anon, authenticated;
grant all on president_profile to service_role;

create table approval_ratings (
  id uuid primary key default gen_random_uuid(),
  survey_date date not null,
  agency text not null,
  approval_percent numeric(5,2) not null,
  disapproval_percent numeric(5,2),
  source_url text,
  created_at timestamptz not null default now(),
  unique (survey_date, agency)
);
create index idx_approval_ratings_survey_date on approval_ratings(survey_date);

alter table approval_ratings enable row level security;
create policy "public read approval_ratings" on approval_ratings for select using (true);
grant select on approval_ratings to anon, authenticated;
grant all on approval_ratings to service_role;

create type pledge_status as enum ('추진 전', '추진 중', '이행 완료');

create table pledges (
  id uuid primary key default gen_random_uuid(),
  title text not null,
  category text,
  description text,
  status pledge_status not null default '추진 전',
  source_url text,
  display_order int not null default 0,
  updated_at timestamptz not null default now()
);
create index idx_pledges_display_order on pledges(display_order);

alter table pledges enable row level security;
create policy "public read pledges" on pledges for select using (true);
grant select on pledges to anon, authenticated;
grant all on pledges to service_role;
