-- Paste in the Supabase SQL editor after supabase-daily.sql. Safe to re-run.
-- Consecutive UTC days with a daily_scores row for the signed-in user.
-- The client keeps a localStorage streak and only uses this RPC if it exists.
-- Does not alter daily_scores or profiles.highscore.

create or replace function public.daily_streak()
returns integer
language plpgsql
stable
security definer
set search_path = public
as $fn$
declare
  uid uuid := auth.uid();
  today date := (timezone('utc', now()))::date;
  d date;
  n integer := 0;
begin
  if uid is null then
    return 0;
  end if;
  d := today;
  if not exists (
    select 1 from public.daily_scores s where s.user_id = uid and s.day = d
  ) then
    d := today - 1;
  end if;
  loop
    exit when not exists (
      select 1 from public.daily_scores s where s.user_id = uid and s.day = d
    );
    n := n + 1;
    d := d - 1;
  end loop;
  return n;
end;
$fn$;

revoke all on function public.daily_streak() from public;
grant execute on function public.daily_streak() to authenticated;
