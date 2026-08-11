-- 카카오 로그인은 이메일 동의항목을 받지 못할 수 있어(비즈 앱 전환 필요) email을 선택값으로 변경.
-- 대신 소셜 로그인 시 제공되는 닉네임을 자동으로 초기 닉네임에 채워 넣는다.
-- Supabase SQL Editor에서 실행하세요.

alter table users alter column email drop not null;

create or replace function public.handle_new_user()
returns trigger
language plpgsql
security definer set search_path = public
as $$
begin
  insert into public.users (id, email, nickname)
  values (
    new.id,
    new.email,
    coalesce(
      new.raw_user_meta_data->>'nickname',
      new.raw_user_meta_data->>'full_name',
      new.raw_user_meta_data->>'name'
    )
  );
  return new;
end;
$$;
