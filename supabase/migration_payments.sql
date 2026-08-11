-- 구독(월간/연간) + 일회성 기부 결제 스키마.
-- payment_provider를 텍스트 컬럼으로 두어 결제사(Paddle → 추후 토스페이먼츠 등) 전환에 대비.

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
