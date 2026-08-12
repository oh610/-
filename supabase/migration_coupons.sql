-- ========================================
-- 체험 쿠폰(7일 무료 체험) + 할인 쿠폰(체험 종료 시 20% 3개월 할인)
-- ========================================

alter table users add column if not exists trial_coupon_code text;
alter table users add column if not exists trial_coupon_shown_at timestamptz;
alter table users add column if not exists trial_redeemed_at timestamptz;
alter table users add column if not exists trial_expires_at timestamptz;
alter table users add column if not exists discount_coupon_code text;
alter table users add column if not exists discount_coupon_issued_at timestamptz;
alter table users add column if not exists discount_coupon_redeemed_at timestamptz;

-- 기존 회원에게도 체험 쿠폰 코드 부여
update users set trial_coupon_code = upper(substr(md5(random()::text || id::text), 1, 8))
where trial_coupon_code is null;

-- 할인 구독 시작 시점(생성 트랜잭션의 customData.discountUntil)을 반영해두는 컬럼.
-- 매일 배치가 이 시각이 지난 구독을 찾아 정상가로 되돌린다.
alter table subscriptions add column if not exists discount_expires_at timestamptz;

-- 신규 가입 시 trial_coupon_code도 함께 발급하도록 트리거 갱신
create or replace function public.handle_new_user()
returns trigger
language plpgsql
security definer set search_path = public
as $$
begin
  insert into public.users (id, email, nickname, trial_coupon_code)
  values (
    new.id,
    new.email,
    coalesce(
      new.raw_user_meta_data->>'nickname',
      new.raw_user_meta_data->>'full_name',
      new.raw_user_meta_data->>'name'
    ),
    upper(substr(md5(random()::text || new.id::text), 1, 8))
  );
  return new;
end;
$$;
