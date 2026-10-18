create table if not exists public.feedback (
  id bigint generated always as identity primary key,
  user_id uuid,
  message text not null,
  created_at timestamptz not null default now()
);

alter table public.feedback enable row level security;

drop policy if exists "feedback_insert" on public.feedback;
drop policy if exists "feedback_select_none" on public.feedback;
create policy "feedback_select_none" on public.feedback
  for select using (false);

revoke all on public.feedback from anon, authenticated;
grant select on public.feedback to postgres;

drop function if exists public.submit_feedback(text);

create or replace function public.submit_feedback(p_message text)
returns boolean
language plpgsql
security definer
set search_path = public
as '
declare
  uid uuid := auth.uid();
  n_recent int;
  n_user int;
  msg text := btrim(p_message);
begin
  if msg is null or char_length(msg) < 8 or char_length(msg) > 2000 then
    raise exception ''bad message'';
  end if;

  select count(*) into n_recent
  from public.feedback
  where created_at > now() - interval ''10 minutes'';
  if n_recent >= 20 then
    raise exception ''busy'';
  end if;

  if uid is not null then
    select count(*) into n_user
    from public.feedback
    where user_id = uid
      and created_at > now() - interval ''1 hour'';
    if n_user >= 3 then
      raise exception ''slow down'';
    end if;
  else
    select count(*) into n_recent
    from public.feedback
    where user_id is null
      and created_at > now() - interval ''10 minutes'';
    if n_recent >= 8 then
      raise exception ''slow down'';
    end if;
  end if;

  insert into public.feedback (user_id, message) values (uid, msg);
  return true;
end;
';

revoke all on function public.submit_feedback(text) from public;
grant execute on function public.submit_feedback(text) to anon, authenticated;
