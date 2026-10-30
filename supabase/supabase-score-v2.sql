-- Paste in the Supabase SQL editor. Safe to re-run.
-- Not applied to production by the commit that added this file.
--
-- Replaces submit_choppy_score. Same argument names and the same return:
-- the stored high score, or the submitted score when it becomes the new best.
-- The current client keeps working, including the retry that omits p_stats
-- (PostgREST fills the default null).
--
-- What changed, and why:
--   * Shape and size of p_stats. The column is free-form JSON from the client.
--     A megabyte tape or a candles value that disagrees with p_candles could
--     back a fake award. Reject that payload. The client retries without stats
--     and the numeric score can still be stored.
--   * stats_summary on score_log. Award checks need sells, swans, and the
--     other counters from runs that are not the current high score. The chart
--     tape stays on profiles.run_stats for the best score only.
--   * Every accepted submit is logged, not only a new high score. Otherwise
--     longHaul on a run that did not beat the board has no row to point at.
--     The high score columns still move only when the score is actually better.
--   * 240 accepted submits per user per day, and the existing 15 second gap
--     now also applies to non-record submits. Stops a script from filling
--     score_log. 240 is one hour of back-to-back 15 second submits.
--   * guard_highscore. profiles_update_own lets the player write highscore,
--     score_time, last_score_at, and run_stats directly. The RPC sets
--     app.score_ok = '1' before it writes. Anything else keeps the old values.
--     If a guard that already checks app.score_ok is installed, the pre-check
--     in docs/security/MIGRATION.md says how to compare them. Two BEFORE
--     triggers that restore the same columns are safe.

drop function if exists public.submit_choppy_score(double precision, double precision, integer);
drop function if exists public.submit_choppy_score(bigint, double precision, integer);
drop function if exists public.submit_choppy_score(bigint, double precision, integer, jsonb);

alter table public.profiles add column if not exists score_time double precision;
alter table public.profiles add column if not exists run_stats jsonb;

create table if not exists public.score_log (
  id bigint generated always as identity primary key,
  user_id uuid not null,
  score bigint,
  life_t double precision,
  candles integer,
  logged_at timestamptz,
  stats_summary jsonb
);

alter table public.score_log add column if not exists logged_at timestamptz;
alter table public.score_log add column if not exists stats_summary jsonb;

create index if not exists score_log_user_candles_idx
  on public.score_log (user_id, candles);

create table if not exists public.score_rate (
  user_id uuid primary key references public.profiles (id) on delete cascade,
  last_at timestamptz not null default now(),
  day_start timestamptz not null default now(),
  day_count integer not null default 0
);

alter table public.score_rate enable row level security;
revoke all on public.score_rate from public, anon, authenticated;

create or replace function public.award_num(p jsonb, p_key text)
returns numeric
language plpgsql
immutable
set search_path = public
as $sql$
begin
  if p is null or jsonb_typeof(p -> p_key) is distinct from 'number' then
    return null;
  end if;
  return (p ->> p_key)::numeric;
exception
  when others then
    return null;
end;
$sql$;

create or replace function public.award_bool(p jsonb, p_key text)
returns boolean
language sql
immutable
set search_path = public
as $sql$
  select case
    when p is null or p ->> p_key is null then null
    when p ->> p_key in ('true', 't') then true
    when p ->> p_key in ('false', 'f') then false
    else null
  end;
$sql$;

-- Null means the payload is acceptable. Otherwise a short reason the RPC raises.
create or replace function public.score_stats_error(
  p_stats jsonb,
  p_life double precision,
  p_candles integer
)
returns text
language plpgsql
stable
set search_path = public
as $sql$
declare
  v_n numeric;
  v_key text;
  v_len integer;
begin
  if p_stats is null then
    return null;
  end if;
  if jsonb_typeof(p_stats) <> 'object' then
    return 'bad stats';
  end if;
  -- Chart tapes are capped at 240 points in the client. Trades are not.
  -- 750 KB blocks a multi-megabyte blob and still fits a long ranked run.
  if octet_length(p_stats::text) > 750000 then
    return 'bad stats';
  end if;

  foreach v_key in array array['tape', 'tapeCash', 'tapeBtc', 'tapeNet'] loop
    if p_stats ? v_key then
      if jsonb_typeof(p_stats -> v_key) <> 'array' then
        return 'bad stats';
      end if;
      v_len := jsonb_array_length(p_stats -> v_key);
      if v_len > 400 then
        return 'bad stats';
      end if;
    end if;
  end loop;
  if p_stats ? 'marks' then
    if jsonb_typeof(p_stats -> 'marks') <> 'array' or jsonb_array_length(p_stats -> 'marks') > 80 then
      return 'bad stats';
    end if;
  end if;
  if p_stats ? 'trades' then
    if jsonb_typeof(p_stats -> 'trades') <> 'array' or jsonb_array_length(p_stats -> 'trades') > 20000 then
      return 'bad stats';
    end if;
  end if;

  if p_stats ? 'candles' then
    v_n := public.award_num(p_stats, 'candles');
    if v_n is null or abs(v_n - p_candles) > 1 then
      return 'stats mismatch';
    end if;
  end if;
  if p_stats ? 'time' then
    v_n := public.award_num(p_stats, 'time');
    if v_n is null or abs(v_n - p_life) > 2 then
      return 'stats mismatch';
    end if;
  end if;

  foreach v_key in array array['buys', 'sells', 'sellsBear', 'coldLost', 'swans', 'lasers', 'halvings', 'halveMiss', 'haveSum', 'iabud', 'job'] loop
    if p_stats ? v_key then
      v_n := public.award_num(p_stats, v_key);
      if v_n is null or v_n < 0 or v_n > 1000000 then
        return 'bad stats';
      end if;
    end if;
  end loop;

  foreach v_key in array array['boughtBtc', 'hitCap', 'perkMaxed'] loop
    if p_stats ? v_key and jsonb_typeof(p_stats -> v_key) <> 'boolean' then
      return 'bad stats';
    end if;
  end loop;

  if p_stats ? 'endBtc' then
    v_n := public.award_num(p_stats, 'endBtc');
    if v_n is null or v_n < 0 or v_n > 22000000 then
      return 'bad stats';
    end if;
  end if;

  foreach v_key in array array['startCash', 'startPrice', 'endCash', 'endPrice', 'net', 'peakNet', 'iaProfit'] loop
    if p_stats ? v_key then
      v_n := public.award_num(p_stats, v_key);
      if v_n is null or v_n < -1e24 or v_n > 1e24 then
        return 'bad stats';
      end if;
    end if;
  end loop;

  return null;
end;
$sql$;

create or replace function public.score_summary(p_stats jsonb)
returns jsonb
language sql
stable
set search_path = public
as $sql$
  select case
    when p_stats is null then null
    else jsonb_strip_nulls(jsonb_build_object(
      'time', public.award_num(p_stats, 'time'),
      'candles', public.award_num(p_stats, 'candles'),
      'buys', public.award_num(p_stats, 'buys'),
      'sells', public.award_num(p_stats, 'sells'),
      'sellsBear', public.award_num(p_stats, 'sellsBear'),
      'coldLost', public.award_num(p_stats, 'coldLost'),
      'swans', public.award_num(p_stats, 'swans'),
      'lasers', public.award_num(p_stats, 'lasers'),
      'halvings', public.award_num(p_stats, 'halvings'),
      'halveMiss', public.award_num(p_stats, 'halveMiss'),
      'haveSum', public.award_num(p_stats, 'haveSum'),
      'iabud', public.award_num(p_stats, 'iabud'),
      'iaProfit', public.award_num(p_stats, 'iaProfit'),
      'job', public.award_num(p_stats, 'job'),
      'endBtc', public.award_num(p_stats, 'endBtc'),
      'net', public.award_num(p_stats, 'net'),
      'startCash', public.award_num(p_stats, 'startCash'),
      'startPrice', public.award_num(p_stats, 'startPrice'),
      'boughtBtc', public.award_bool(p_stats, 'boughtBtc'),
      'hitCap', public.award_bool(p_stats, 'hitCap'),
      'perkMaxed', public.award_bool(p_stats, 'perkMaxed')
    ))
  end;
$sql$;

create or replace function public.guard_highscore()
returns trigger
language plpgsql
set search_path = public
as $sql$
begin
  if current_setting('app.score_ok', true) = '1' then
    return new;
  end if;
  if tg_op = 'UPDATE' then
    new.highscore := old.highscore;
    new.score_time := old.score_time;
    new.last_score_at := old.last_score_at;
    new.run_stats := old.run_stats;
  elsif tg_op = 'INSERT' then
    new.highscore := 0;
    new.score_time := null;
    new.last_score_at := null;
    new.run_stats := null;
  end if;
  return new;
end;
$sql$;

drop trigger if exists trg_guard_highscore on public.profiles;
create trigger trg_guard_highscore
before insert or update on public.profiles
for each row execute function public.guard_highscore();

create or replace function public.submit_choppy_score(
  p_score bigint,
  p_life double precision,
  p_candles integer,
  p_stats jsonb default null
)
returns bigint
language plpgsql
security definer
set search_path = public
as $sql$
declare
  uid uuid := auth.uid();
  v_prev bigint;
  v_time double precision;
  v_at timestamptz;
  v_rate_at timestamptz;
  v_day timestamptz;
  v_day_count integer;
  v_err text;
  v_summary jsonb;
  v_improving boolean;
begin
  if uid is null then
    raise exception 'not signed in';
  end if;
  if p_score is null or p_score <= 0 or p_score > 2100000000000 then
    raise exception 'bad score';
  end if;
  if p_life is null or p_life < 12 then
    raise exception 'short run';
  end if;
  if p_candles is null or p_candles < 3 then
    raise exception 'few candles';
  end if;
  -- Same candle-rate and score-vs-candles bounds as the previous function.
  if p_candles > (p_life * 5 + 8) then
    raise exception 'candle rate';
  end if;
  if p_score > (8000 + p_candles * 200000) then
    raise exception 'score vs candles';
  end if;

  select highscore, score_time, last_score_at
    into v_prev, v_time, v_at
    from public.profiles
   where id = uid
   for update;
  if not found then
    raise exception 'no profile';
  end if;
  if v_prev is null then
    v_prev := 0;
  end if;

  -- last_at must not be now() on the first row. The gap check below would
  -- then raise 'slow down' and roll the insert back, so no score would ever land.
  insert into public.score_rate (user_id, last_at, day_start, day_count)
  values (uid, timestamptz 'epoch', now(), 0)
  on conflict (user_id) do nothing;

  select last_at, day_start, day_count
    into v_rate_at, v_day, v_day_count
    from public.score_rate
   where user_id = uid
   for update;

  if v_at is not null and v_at > now() - interval '15 seconds' then
    raise exception 'slow down';
  end if;
  if v_rate_at is not null and v_rate_at > now() - interval '15 seconds' then
    raise exception 'slow down';
  end if;
  if v_day is null or v_day < now() - interval '1 day' then
    v_day := now();
    v_day_count := 0;
  end if;
  if v_day_count >= 240 then
    raise exception 'daily limit';
  end if;

  -- Shape is checked before score_rate is updated, so the client's retry
  -- without p_stats can still store the numeric score. A bad tape never
  -- becomes stats_summary or profiles.run_stats.
  v_err := public.score_stats_error(p_stats, p_life, p_candles);
  if v_err is not null then
    raise exception '%', v_err;
  end if;
  v_summary := public.score_summary(p_stats);

  v_improving := p_score > v_prev
    or (p_score = v_prev and (v_time is null or p_life < v_time));

  if v_improving then
    perform set_config('app.score_ok', '1', true);
    update public.profiles
       set highscore = p_score,
           last_score_at = now(),
           score_time = p_life,
           run_stats = p_stats
     where id = uid;
  end if;

  insert into public.score_log (user_id, score, life_t, candles, logged_at, stats_summary)
  values (uid, p_score, p_life, p_candles, now(), v_summary);

  update public.score_rate
     set last_at = now(),
         day_start = v_day,
         day_count = v_day_count + 1
   where user_id = uid;

  if v_improving then
    return p_score;
  end if;
  return v_prev;
end;
$sql$;

revoke all on function public.award_num(jsonb, text) from public, anon, authenticated;
revoke all on function public.award_bool(jsonb, text) from public, anon, authenticated;
revoke all on function public.score_stats_error(jsonb, double precision, integer) from public, anon, authenticated;
revoke all on function public.score_summary(jsonb) from public, anon, authenticated;
revoke all on function public.guard_highscore() from public, anon, authenticated;
revoke all on function public.submit_choppy_score(bigint, double precision, integer, jsonb) from public, anon;
grant execute on function public.submit_choppy_score(bigint, double precision, integer, jsonb) to authenticated;
