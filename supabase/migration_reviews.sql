-- 이용자 후기 (로그인 페이지 캐러셀 + 후기 작성 팝업)
-- Supabase SQL Editor에서 실행하세요.

create table reviews (
  id uuid primary key default gen_random_uuid(),
  user_id uuid references users(id) on delete set null,
  display_name text not null,
  content text not null check (char_length(content) between 1 and 300),
  approved boolean not null default true,
  created_at timestamptz not null default now()
);
create index idx_reviews_approved on reviews(approved);

alter table reviews enable row level security;

create policy "public read approved reviews" on reviews for select using (approved = true);
create policy "user insert own review" on reviews for insert with check (auth.uid() = user_id);

grant select on reviews to anon, authenticated;
grant insert on reviews to authenticated;
grant all on reviews to service_role;
