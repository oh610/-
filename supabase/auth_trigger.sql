-- 회원가입(auth.users insert) 시 public.users에 자동으로 행을 생성하는 트리거.
-- PRD 7.1: users.tier 기본값은 무료.

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
