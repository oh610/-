-- 정치뉴스요약서비스 MVP DB 스키마
-- PRD 7.1 DB 스키마(MVP 상세 설계) 기준
--
-- 설계 결정 (PRD 7.1 설계 노트 반영):
-- - summary_card_citations.source_id의 polymorphic 참조는 두 개의 nullable FK
--   (press_release_id, article_id)로 분리하는 방식을 채택.
-- - 모든 PK는 uuid(gen_random_uuid())로 통일.
-- - users.id는 Supabase Auth(auth.users)와 1:1 연동.

create extension if not exists pgcrypto;

-- ========================================
-- ENUM 타입
-- ========================================

create type ideology as enum ('진보', '보수');
create type classification_ideology as enum ('진보', '보수', '분류 검토 중');
create type district_type as enum ('지역구', '비례');
create type bill_status as enum ('계류', '가결', '부결', '폐기', '철회');
create type vote_result as enum ('찬성', '반대', '기권', '불참');
create type citation_stance as enum ('pro', 'con', 'neutral');
create type source_type as enum ('press_release', 'article', 'member_statement');
create type appeal_decision as enum ('유지', '변경', '검토중');
create type user_tier as enum ('무료');

-- ========================================
-- 핵심 테이블: 정당 / 의원 / 법안 / 표결
-- ========================================

create table parties (
  id uuid primary key default gen_random_uuid(),
  name text not null,
  ideology ideology not null,
  is_active boolean not null default true,
  updated_at timestamptz not null default now()
);

create table members (
  id uuid primary key default gen_random_uuid(),
  assembly_code text unique,
  name text not null,
  current_party_id uuid references parties(id),
  is_independent boolean not null default false,
  district_type district_type not null,
  district_name text,
  photo_url text,
  updated_at timestamptz not null default now()
);
create index idx_members_current_party_id on members(current_party_id);

create table member_party_history (
  id uuid primary key default gen_random_uuid(),
  member_id uuid not null references members(id) on delete cascade,
  party_id uuid references parties(id),
  start_date date not null,
  end_date date
);
create index idx_member_party_history_member_id on member_party_history(member_id);

create table bills (
  id uuid primary key default gen_random_uuid(),
  bill_no text unique not null,
  title text not null,
  summary text,
  main_sponsor_id uuid references members(id),
  proposer_party_id uuid references parties(id),
  status bill_status not null default '계류',
  proposed_date date not null,
  updated_at timestamptz not null default now()
);
create index idx_bills_main_sponsor_id on bills(main_sponsor_id);
create index idx_bills_proposer_party_id on bills(proposer_party_id);

create table bill_sponsors (
  bill_id uuid not null references bills(id) on delete cascade,
  member_id uuid not null references members(id) on delete cascade,
  primary key (bill_id, member_id)
);

create table votes (
  id uuid primary key default gen_random_uuid(),
  bill_id uuid not null references bills(id) on delete cascade,
  member_id uuid not null references members(id) on delete cascade,
  result vote_result not null,
  voted_at timestamptz not null,
  unique (bill_id, member_id)
);
create index idx_votes_bill_id on votes(bill_id);
create index idx_votes_member_id on votes(member_id);

-- ========================================
-- 뉴스/근거 관련 테이블
-- ========================================

create table articles (
  id uuid primary key default gen_random_uuid(),
  source_name text not null,
  title text not null,
  url text not null,
  raw_content text, -- 내부 RAG 처리 전용, 사용자 화면에 직접 노출 금지 (PRD 3.4)
  published_at timestamptz,
  collected_at timestamptz not null default now()
);

create table press_releases (
  id uuid primary key default gen_random_uuid(),
  party_id uuid not null references parties(id),
  title text not null,
  content text not null,
  source_url text,
  published_at timestamptz
);
create index idx_press_releases_party_id on press_releases(party_id);

-- ========================================
-- 요약카드 관련 테이블
-- ========================================

create table summary_cards (
  id uuid primary key default gen_random_uuid(),
  issue_title text not null,
  issue_summary text not null,
  pro_stance_summary text not null,
  con_stance_summary text not null,
  bias_check_passed boolean not null default false,
  published_date date not null unique -- 1일 1건
);

create table summary_card_citations (
  id uuid primary key default gen_random_uuid(),
  summary_card_id uuid not null references summary_cards(id) on delete cascade,
  stance citation_stance not null,
  sentence_text text not null,
  source_type source_type not null,
  press_release_id uuid references press_releases(id),
  article_id uuid references articles(id),
  source_url text,
  constraint chk_summary_card_citations_source check (
    (source_type = 'press_release' and press_release_id is not null and article_id is null)
    or (source_type = 'article' and article_id is not null and press_release_id is null)
    or (source_type = 'member_statement')
  )
);
create index idx_summary_card_citations_summary_card_id on summary_card_citations(summary_card_id);

create table summary_card_figures (
  summary_card_id uuid not null references summary_cards(id) on delete cascade,
  member_id uuid not null references members(id) on delete cascade,
  primary key (summary_card_id, member_id)
);

create table party_ideology_classifications (
  id uuid primary key default gen_random_uuid(),
  party_id uuid not null references parties(id),
  ideology classification_ideology not null,
  confidence_score float,
  reasoning_summary text,
  is_auto_classified boolean not null default false,
  classified_at timestamptz not null default now()
);
create index idx_party_ideology_classifications_party_id on party_ideology_classifications(party_id);

create table ideology_appeals (
  id uuid primary key default gen_random_uuid(),
  party_id uuid not null references parties(id),
  user_id uuid not null references auth.users(id),
  reason text not null,
  evidence_url text,
  ai_reanalysis_result text,
  ai_confidence float,
  final_decision appeal_decision not null default '검토중',
  reviewer_note text,
  submitted_at timestamptz not null default now(),
  resolved_at timestamptz
);
create index idx_ideology_appeals_party_id on ideology_appeals(party_id);

-- ========================================
-- 회원 테이블
-- ========================================

create table users (
  id uuid primary key references auth.users(id) on delete cascade,
  email text not null,
  tier user_tier not null default '무료',
  created_at timestamptz not null default now()
);

-- ========================================
-- RLS (Row Level Security)
-- 공개 콘텐츠는 익명 조회 허용, 쓰기는 서비스 롤(배치 파이프라인)만 허용.
-- ========================================

alter table parties enable row level security;
alter table members enable row level security;
alter table member_party_history enable row level security;
alter table bills enable row level security;
alter table bill_sponsors enable row level security;
alter table votes enable row level security;
alter table articles enable row level security;
alter table press_releases enable row level security;
alter table summary_cards enable row level security;
alter table summary_card_citations enable row level security;
alter table summary_card_figures enable row level security;
alter table party_ideology_classifications enable row level security;
alter table ideology_appeals enable row level security;
alter table users enable row level security;

create policy "public read parties" on parties for select using (true);
create policy "public read members" on members for select using (true);
create policy "public read member_party_history" on member_party_history for select using (true);
create policy "public read bills" on bills for select using (true);
create policy "public read bill_sponsors" on bill_sponsors for select using (true);
create policy "public read votes" on votes for select using (true);
create policy "public read press_releases" on press_releases for select using (true);
create policy "public read summary_cards" on summary_cards for select using (true);
create policy "public read summary_card_citations" on summary_card_citations for select using (true);
create policy "public read summary_card_figures" on summary_card_figures for select using (true);
create policy "public read party_ideology_classifications" on party_ideology_classifications for select using (true);

-- articles.raw_content은 내부 RAG 전용이지만, PostgreSQL 컬럼 단위 RLS는 없으므로
-- 사용자 화면에는 반드시 애플리케이션 레벨에서 raw_content를 제외하고 조회할 것 (PRD 3.4).
create policy "public read articles" on articles for select using (true);

-- 이의제기: 처리 완료 건은 공개 투명성 로그로 전체 공개(PRD 4.4), 처리 중 건은 본인만 조회
create policy "public read resolved appeals" on ideology_appeals for select using (resolved_at is not null);
create policy "user read own appeals" on ideology_appeals for select using (auth.uid() = user_id);
create policy "user insert own appeals" on ideology_appeals for insert with check (auth.uid() = user_id);

-- 회원 정보: 본인 행만 조회/수정 가능
create policy "user read own row" on users for select using (auth.uid() = id);
create policy "user update own row" on users for update using (auth.uid() = id);

-- ========================================
-- GRANT: RLS 정책과 별개로 anon/authenticated 롤에 테이블 접근 권한 부여 필요
-- (RLS는 "어떤 행"을 볼 수 있는지를 걸러줄 뿐, 테이블 자체에 대한 권한은 GRANT로 별도 부여해야 함)
-- ========================================

grant usage on schema public to anon, authenticated;

grant select on
  parties, members, member_party_history, bills, bill_sponsors, votes,
  articles, press_releases, summary_cards, summary_card_citations,
  summary_card_figures, party_ideology_classifications
to anon, authenticated;

grant select, insert on ideology_appeals to authenticated;
grant select on ideology_appeals to anon; -- 정책상 resolved_at is not null 건만 조회 가능

grant select, update on users to authenticated;

-- service_role은 RLS를 우회하지만 테이블 자체 GRANT는 별도 필요 (배치/서버 스크립트 전용).
grant usage on schema public to service_role;
grant all on
  parties, members, member_party_history, bills, bill_sponsors, votes,
  articles, press_releases, summary_cards, summary_card_citations,
  summary_card_figures, party_ideology_classifications, ideology_appeals, users
to service_role;

-- ========================================
-- 회원가입 시 auth.users -> public.users 자동 동기화 트리거
-- ========================================

create function public.handle_new_user()
returns trigger
language plpgsql
security definer set search_path = public
as $$
begin
  insert into public.users (id, email)
  values (new.id, new.email);
  return new;
end;
$$;

create trigger on_auth_user_created
  after insert on auth.users
  for each row execute function public.handle_new_user();

-- ========================================
-- 구독(월간/연간) + 일회성 기부 결제 (v2, Paddle)
-- payment_provider를 텍스트 컬럼으로 두어 결제사 전환에 대비.
-- ========================================

alter type user_tier add value if not exists '유료';

create type subscription_plan as enum ('월간', '연간');
create type subscription_status as enum ('active', 'trialing', 'past_due', 'canceled', 'paused');

create table subscriptions (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references users(id) on delete cascade,
  payment_provider text not null default 'paddle',
  provider_customer_id text not null,
  provider_subscription_id text not null unique,
  plan subscription_plan not null,
  status subscription_status not null,
  current_period_end timestamptz,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);
create index idx_subscriptions_user_id on subscriptions(user_id);

create table donations (
  id uuid primary key default gen_random_uuid(),
  user_id uuid references users(id) on delete set null,
  payment_provider text not null default 'paddle',
  provider_transaction_id text not null unique,
  amount_cents integer not null,
  currency text not null,
  donor_display_name text,
  created_at timestamptz not null default now()
);
create index idx_donations_user_id on donations(user_id);

alter table subscriptions enable row level security;
alter table donations enable row level security;

create policy "user read own subscriptions" on subscriptions for select using (auth.uid() = user_id);
create policy "user read own donations" on donations for select using (auth.uid() = user_id);

grant select on subscriptions, donations to authenticated;
grant all on subscriptions, donations to service_role;

-- ========================================
-- 마이페이지: 닉네임
-- ========================================

alter table users add column if not exists nickname text;

-- ========================================
-- 자율금액구독 (매달 반복결제)
-- ========================================

alter type subscription_plan add value if not exists '자율';
