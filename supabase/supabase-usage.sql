-- Paste in the Supabase SQL editor. Safe to re-run.
-- Anonymous usage counters for Choppy Bitcoin: games started, games finished,
-- and shares. No user id, alias, email, score, IP, or other personal data is
-- stored in these objects. Clients may call the RPCs with the public anon key.
-- The game ignores RPC errors, so this file can be applied after the client
-- ships; until it is applied, counts stay at zero.

create table if not exists public.usage_counts (
  day date not null,
  kind text not null,
  n bigint not null default 0,
  primary key (day, kind),
  constraint usage_counts_kind_ok check (kind in ('start', 'finish', 'share'))
);

alter table public.usage_counts enable row level security;

revoke all on public.usage_counts from public, anon, authenticated;

drop function if exists public.bump_usage(text);
create or replace function public.bump_usage(p_kind text)
returns void
language plpgsql
security definer
set search_path = public
as $fn$
declare
  k text := lower(btrim(coalesce(p_kind, '')));
  today date := (timezone('utc', now()))::date;
  n_day bigint;
begin
  if k not in ('start', 'finish', 'share') then
    return;
  end if;
  -- Coarse cap so a tight client loop cannot inflate a single day without bound.
  select coalesce(sum(n), 0) into n_day
  from public.usage_counts
  where day = today;
  if n_day >= 100000 then
    return;
  end if;
  insert into public.usage_counts(day, kind, n)
  values (today, k, 1)
  on conflict (day, kind) do update set n = public.usage_counts.n + 1;
end;
$fn$;

revoke all on function public.bump_usage(text) from public;
grant execute on function public.bump_usage(text) to anon, authenticated;

drop function if exists public.usage_totals();
create or replace function public.usage_totals()
returns table(day date, kind text, n bigint)
language sql
stable
security definer
set search_path = public
as $fn$
  select c.day, c.kind, c.n
  from public.usage_counts c
  order by c.day desc, c.kind
  limit 90;
$fn$;

revoke all on function public.usage_totals() from public;
grant execute on function public.usage_totals() to anon, authenticated;
