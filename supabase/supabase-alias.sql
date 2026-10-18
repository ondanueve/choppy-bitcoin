alter table public.profiles add column if not exists email text;

create or replace function public.change_alias(p_alias text)
returns text
language plpgsql
security definer
set search_path = public
as '
declare
  uid uuid := auth.uid();
  clean text := btrim(p_alias);
begin
  if uid is null then
    raise exception ''not signed in'';
  end if;
  if clean !~ ''^[a-zA-Z0-9_]{3,16}$'' then
    raise exception ''bad alias'';
  end if;
  if exists (
    select 1 from public.profiles
    where lower(username) = lower(clean) and id <> uid
  ) then
    raise exception ''alias taken'';
  end if;
  update public.profiles set username = clean where id = uid;
  return clean;
end;
';

create or replace function public.email_for_alias(p_alias text)
returns text
language sql
security definer
set search_path = public
as '
  select email from public.profiles
  where lower(username) = lower(btrim(p_alias))
  limit 1
';

grant execute on function public.change_alias(text) to authenticated;
grant execute on function public.email_for_alias(text) to anon, authenticated;
