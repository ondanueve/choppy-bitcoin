-- Paste in the Supabase SQL editor. Safe to re-run.
-- Daily candle board for Choppy Bitcoin (the ranked mode): one best bag
-- per signed-in user per UTC day. No user IP, email, or other personal
-- data is stored here beyond the existing profiles.username used to show
-- the board.
-- The client hides the board if these RPCs are missing, so this file can
-- be applied after the client ships.
-- Does not drop or alter profiles.highscore or other all-time data.
--
-- To switch ranked to one attempt per UTC day, set daily_one_attempt()
-- below to true AND set DAILY_ONE_ATTEMPT in game.js to true, then
-- re-paste this file (it only replaces functions).

create table if not exists public.daily_scores (
  day date not null,
  user_id uuid not null references auth.users (id) on delete cascade,
  score bigint not null,
  bag double precision not null,
  life_t double precision,
  candles integer,
  updated_at timestamptz not null default now(),
  primary key (day, user_id),
  constraint daily_scores_score_ok check (score > 0 and score <= 2100000000000)
);

alter table public.daily_scores enable row level security;

revoke all on public.daily_scores from public, anon, authenticated;

create or replace function public.daily_one_attempt()
returns boolean
language sql
immutable
as $fn$
  select false;
$fn$;

revoke all on function public.daily_one_attempt() from public, anon, authenticated;

drop function if exists public.submit_daily_score(bigint, double precision, integer, date);
create or replace function public.submit_daily_score(
  p_score bigint,
  p_life double precision,
  p_candles integer,
  p_day date default null
)
returns bigint
language plpgsql
security definer
set search_path = public
as $fn$
declare
  uid uuid := auth.uid();
  today date := (timezone('utc', now()))::date;
  d date := coalesce(p_day, today);
  prev bigint;
  prev_life double precision;
  prev_at timestamptz;
begin
  if uid is null then
    raise exception 'not signed in';
  end if;
  if d <> today then
    raise exception 'stale day';
  end if;
  if p_score is null or p_score <= 0 or p_score > 2100000000000 then
    raise exception 'bad score';
  end if;
  if coalesce(p_life, 0) < 12 or coalesce(p_candles, 0) < 3 then
    raise exception 'short run';
  end if;
  if p_candles > (p_life * 5 + 8) then
    raise exception 'short run';
  end if;
  if p_score > (8000 + coalesce(p_candles, 0) * 200000) then
    raise exception 'score vs candles';
  end if;

  select s.score, s.life_t, s.updated_at into prev, prev_life, prev_at
  from public.daily_scores s
  where s.day = d and s.user_id = uid;

  if prev is not null and public.daily_one_attempt() then
    return prev;
  end if;
  if prev_at is not null and prev_at > now() - interval '15 seconds' then
    raise exception 'too fast';
  end if;
  if prev is not null and p_score < prev then
    return prev;
  end if;
  if prev is not null and p_score = prev and prev_life is not null and p_life >= prev_life then
    return prev;
  end if;

  insert into public.daily_scores (day, user_id, score, bag, life_t, candles, updated_at)
  values (d, uid, p_score, p_score / 10000.0, p_life, p_candles, now())
  on conflict (day, user_id) do update
    set score = excluded.score,
        bag = excluded.bag,
        life_t = excluded.life_t,
        candles = excluded.candles,
        updated_at = now();

  return p_score;
end;
$fn$;

revoke all on function public.submit_daily_score(bigint, double precision, integer, date) from public;
grant execute on function public.submit_daily_score(bigint, double precision, integer, date) to authenticated;

drop function if exists public.daily_board(date, integer);
create or replace function public.daily_board(
  p_day date default null,
  p_limit integer default 20
)
returns table(alias text, bag double precision, score bigint, life_t double precision, candles integer)
language sql
stable
security definer
set search_path = public
as $fn$
  select coalesce(nullif(btrim(p.username), ''), '?') as alias,
         s.bag,
         s.score,
         s.life_t,
         s.candles
  from public.daily_scores s
  join public.profiles p on p.id = s.user_id
  where s.day = coalesce(p_day, (timezone('utc', now()))::date)
  order by s.score desc, s.life_t asc nulls last, s.updated_at asc
  limit greatest(1, least(coalesce(p_limit, 20), 40));
$fn$;

revoke all on function public.daily_board(date, integer) from public;
grant execute on function public.daily_board(date, integer) to anon, authenticated;

drop function if exists public.daily_my_rank(date);
create or replace function public.daily_my_rank(
  p_day date default null
)
returns table(rank integer, alias text, bag double precision, score bigint, life_t double precision, candles integer)
language plpgsql
stable
security definer
set search_path = public
as $fn$
declare
  uid uuid := auth.uid();
  d date := coalesce(p_day, (timezone('utc', now()))::date);
begin
  if uid is null then
    return;
  end if;
  return query
  with ranked as (
    select s.user_id,
           s.bag,
           s.score,
           s.life_t,
           s.candles,
           coalesce(nullif(btrim(p.username), ''), '?') as alias,
           (row_number() over (order by s.score desc, s.life_t asc nulls last, s.updated_at asc))::integer as rnk
    from public.daily_scores s
    join public.profiles p on p.id = s.user_id
    where s.day = d
  )
  select r.rnk, r.alias, r.bag, r.score, r.life_t, r.candles
  from ranked r
  where r.user_id = uid;
end;
$fn$;

revoke all on function public.daily_my_rank(date) from public;
grant execute on function public.daily_my_rank(date) to authenticated;
