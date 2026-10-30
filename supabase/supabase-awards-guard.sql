-- Paste in the Supabase SQL editor. Safe to re-run.
-- Not applied to production by the commit that added this file.
--
-- profiles_update_own lets a signed-in player update every unprotected column
-- of their own row. elo and highscore already have guards. awards did not,
-- so a player could write any award id straight onto profiles.awards.
--
-- After this file:
--   * trg_guard_awards puts the old awards back unless app.awards_ok = '1'.
--   * grant_awards() is the only authenticated writer. It checks the whitelist,
--     refuses the four cumulative ids from the client, and checks the claim
--     against score_log / run_stats.
--   * award_grants is the ledger. Players can read their own rows and other
--     people's non-secret rows. They cannot insert, update, or delete.
--
-- The whitelist and the secret list are copied from game.js AWARD_CATALOG.
-- tests/award-ids.js fails if game.js, u/index.html, and these two arrays differ.
--
-- Story awards are not a replay of the run. The checks below are plausibility
-- only. See docs/security/awards-and-scores.md.

create table if not exists public.award_grants (
  user_id uuid not null references public.profiles (id) on delete cascade,
  award_id text not null,
  granted_at timestamptz not null default now(),
  run_ref text,
  evidence jsonb not null default '{}'::jsonb,
  primary key (user_id, award_id)
);

create table if not exists public.award_rate (
  user_id uuid primary key references public.profiles (id) on delete cascade,
  window_start timestamptz not null default now(),
  calls integer not null default 0,
  day_start timestamptz not null default now(),
  new_grants integer not null default 0
);

-- score_log already exists wherever scores are submitted. Add the summary
-- column here too so this file works even if supabase-score-v2.sql is applied
-- later. Old rows stay null and are judged on candles only.
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

alter table public.award_grants enable row level security;
alter table public.award_rate enable row level security;

revoke all on public.award_grants from public, anon, authenticated;
revoke all on public.award_rate from public, anon, authenticated;
grant select on public.award_grants to anon, authenticated;

create or replace function public.award_whitelist()
returns text[]
language sql
immutable
set search_path = public
as $sql$
  select array[
    'maxi',
    'nocoiner',
    'paper',
    'doubler',
    'tenx',
    'dayTrader',
    'cap21',
    'halver',
    'greedy',
    'opsec',
    'longHaul',
    'marathon',
    'swanHunter',
    'laserEyes',
    'maxedPerk',
    'perkHoarder',
    'goodBud',
    'career',
    'engaged',
    'married',
    'runaway',
    'babyBoard',
    'familyOffice',
    'classicFartface',
    'landowner',
    'notForSale',
    'sellout',
    'miner',
    'citadel',
    'nodes100',
    'declared',
    'beachHolds',
    'fourth',
    'noAid',
    'freeNation',
    'chessWin',
    'chess3',
    'chess7',
    'scoop',
    'unicorn',
    'highRoller',
    'soldPump',
    'regular',
    'veteran',
    'collector',
    'curator'
  ]::text[];
$sql$;

create or replace function public.award_secret_ids()
returns text[]
language sql
immutable
set search_path = public
as $sql$
  select array[
    'engaged',
    'married',
    'runaway',
    'babyBoard',
    'familyOffice',
    'classicFartface',
    'landowner',
    'notForSale',
    'sellout',
    'miner',
    'citadel',
    'nodes100',
    'declared',
    'beachHolds',
    'fourth',
    'noAid',
    'freeNation',
    'chessWin',
    'chess3',
    'chess7',
    'scoop',
    'unicorn',
    'highRoller',
    'soldPump'
  ]::text[];
$sql$;

grant execute on function public.award_whitelist() to anon, authenticated;
grant execute on function public.award_secret_ids() to anon, authenticated;

do $sql$
begin
  if not exists (
    select 1 from pg_constraint
    where conname = 'award_grants_known_id'
      and conrelid = 'public.award_grants'::regclass
  ) then
    alter table public.award_grants
      add constraint award_grants_known_id
      check (award_id = any (public.award_whitelist()));
  end if;
end
$sql$;

drop policy if exists award_grants_select on public.award_grants;
create policy award_grants_select on public.award_grants
  for select
  using (
    auth.uid() = user_id
    or not (award_id = any (public.award_secret_ids()))
  );

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

-- True when this user already holds every id in p_need. Sees rows inserted
-- earlier in the same grant_awards() call.
create or replace function public.award_holds(p_user uuid, p_need text[])
returns boolean
language sql
stable
security definer
set search_path = public
as $sql$
  select coalesce(cardinality(p_need), 0) = 0
    or (
      select count(*)
        from public.award_grants g
       where g.user_id = p_user
         and g.award_id = any (p_need)
    ) = cardinality(p_need);
$sql$;

-- Plausibility against recorded runs. Does not replay the match.
-- Candle awards trust score_log.candles (longHaul >= 1000, marathon >= 2100).
-- Other stat awards trust stats_summary, or profiles.run_stats when a
-- score_log row has the same candle count (the best-score tape).
-- End-of-run trading awards still need 420 candles on that same summary,
-- matching runAwardIds() in game.js. Live awards (swans, lasers, perks,
-- cap, career) do not.
-- Secret story awards need some recorded ranked run. fourth / noAid /
-- freeNation need a recorded run of at least 420 candles. Prerequisite
-- order is enforced in grant_awards(), not here.
create or replace function public.award_supported(p_user uuid, p_id text)
returns boolean
language plpgsql
stable
security definer
set search_path = public
as $sql$
declare
  v_max integer;
  s record;
  v_c numeric;
  v_start numeric;
  v_mul numeric;
begin
  select coalesce(max(candles), 0)
    into v_max
    from public.score_log
   where user_id = p_user;

  if p_id = 'longHaul' and v_max >= 1000 then
    return true;
  end if;
  if p_id = 'marathon' and v_max >= 2100 then
    return true;
  end if;
  if p_id in ('fourth', 'noAid', 'freeNation') then
    return v_max >= 420;
  end if;
  if p_id = any (public.award_secret_ids()) then
    return exists (
      select 1 from public.score_log sl
      where sl.user_id = p_user and sl.candles >= 3
    );
  end if;

  for s in
    select sl.stats_summary as doc
      from public.score_log sl
     where sl.user_id = p_user
       and sl.stats_summary is not null
       and jsonb_typeof(sl.stats_summary) = 'object'
    union all
    select p.run_stats as doc
      from public.profiles p
     where p.id = p_user
       and p.run_stats is not null
       and jsonb_typeof(p.run_stats) = 'object'
       and public.award_num(p.run_stats, 'candles') is not null
       and exists (
         select 1 from public.score_log sl2
          where sl2.user_id = p_user
            and sl2.candles = trunc(public.award_num(p.run_stats, 'candles'))::integer
       )
  loop
    v_c := coalesce(public.award_num(s.doc, 'candles'), 0);

    if p_id = 'longHaul' and v_c >= 1000 then return true; end if;
    if p_id = 'marathon' and v_c >= 2100 then return true; end if;
    if p_id = 'swanHunter' and coalesce(public.award_num(s.doc, 'swans'), 0) >= 3 then return true; end if;
    if p_id = 'laserEyes' and coalesce(public.award_num(s.doc, 'lasers'), 0) >= 5 then return true; end if;
    if p_id = 'maxedPerk' and public.award_bool(s.doc, 'perkMaxed') is true then return true; end if;
    if p_id = 'perkHoarder' and coalesce(public.award_num(s.doc, 'haveSum'), 0) >= 15 then return true; end if;
    if p_id = 'career' and coalesce(public.award_num(s.doc, 'job'), 0) >= 7 then return true; end if;
    if p_id = 'cap21' and (
      public.award_bool(s.doc, 'hitCap') is true
      or coalesce(public.award_num(s.doc, 'endBtc'), 0) >= 21000000
    ) then return true; end if;

    if v_c >= 420 then
      if p_id = 'maxi' and public.award_num(s.doc, 'sells') = 0 then return true; end if;
      if p_id = 'nocoiner' and public.award_bool(s.doc, 'boughtBtc') is false then return true; end if;
      if p_id = 'greedy' and public.award_num(s.doc, 'halvings') = 0 then return true; end if;
      if p_id = 'halver'
         and public.award_num(s.doc, 'halveMiss') = 0
         and coalesce(public.award_num(s.doc, 'halvings'), 0) > 0 then return true; end if;
      if p_id = 'opsec' and public.award_num(s.doc, 'coldLost') = 0 then return true; end if;
      if p_id = 'paper' and coalesce(public.award_num(s.doc, 'sellsBear'), 0) >= 1 then return true; end if;
      if p_id = 'dayTrader'
         and coalesce(public.award_num(s.doc, 'buys'), 0) + coalesce(public.award_num(s.doc, 'sells'), 0) >= 50 then
        return true;
      end if;
      if p_id = 'goodBud'
         and coalesce(public.award_num(s.doc, 'iabud'), 0) > 0
         and coalesce(public.award_num(s.doc, 'iaProfit'), 0) > 0 then
        return true;
      end if;
      if p_id in ('doubler', 'tenx') then
        v_start := coalesce(public.award_num(s.doc, 'startCash'), 0)
          / greatest(0.01, coalesce(public.award_num(s.doc, 'startPrice'), 1));
        v_mul := case
          when v_start > 0 then coalesce(public.award_num(s.doc, 'net'), 0) / v_start
          else 0
        end;
        if p_id = 'doubler' and v_mul >= 2 then return true; end if;
        if p_id = 'tenx' and v_mul >= 10 then return true; end if;
      end if;
    end if;
  end loop;

  return false;
end;
$sql$;

create or replace function public.guard_awards()
returns trigger
language plpgsql
set search_path = public
as $sql$
begin
  if current_setting('app.awards_ok', true) = '1' then
    return new;
  end if;
  if tg_op = 'UPDATE' then
    new.awards := old.awards;
  elsif tg_op = 'INSERT' then
    new.awards := '{}';
  end if;
  return new;
end;
$sql$;

drop trigger if exists trg_guard_awards on public.profiles;
create trigger trg_guard_awards
before insert or update on public.profiles
for each row execute function public.guard_awards();

create or replace function public.award_ids_for(p_user uuid)
returns text[]
language sql
stable
security definer
set search_path = public
as $sql$
  select coalesce(
    array_agg(w.id order by w.ord),
    '{}'::text[]
  )
  from unnest(public.award_whitelist()) with ordinality as w(id, ord)
  join public.award_grants g
    on g.award_id = w.id
   and g.user_id = p_user;
$sql$;

create or replace function public.grant_awards(p_ids text[], p_run jsonb)
returns text[]
language plpgsql
security definer
set search_path = public
as $sql$
declare
  uid uuid;
  aid text;
  v_ids text[] := '{}';
  v_window timestamptz;
  v_calls integer;
  v_day timestamptz;
  v_new_today integer;
  v_max integer;
  v_runs integer;
  v_skip boolean := false;
  v_n integer;
  v_pass integer;
  v_existing text[];
begin
  begin
    uid := auth.uid();
  exception
    when others then
      uid := null;
  end;
  if uid is null then
    raise exception 'not signed in';
  end if;
  if not exists (select 1 from public.profiles where id = uid) then
    raise exception 'no profile';
  end if;

  -- Copy ids already on the profile into the ledger before this call is judged.
  -- A grant that lands before migrate_legacy_awards() must not erase them, and
  -- married/runaway (and the other pairs) must see what the player already holds.
  -- on conflict do nothing keeps a real evidence row from being relabeled.
  select awards into v_existing from public.profiles where id = uid;
  if v_existing is not null then
    foreach aid in array v_existing loop
      if aid is null or not (aid = any (public.award_whitelist())) then
        continue;
      end if;
      insert into public.award_grants (user_id, award_id, granted_at, run_ref, evidence)
      values (uid, aid, now(), 'legacy', '{"legacy": true}'::jsonb)
      on conflict (user_id, award_id) do nothing;
    end loop;
  end if;

  if p_ids is null or cardinality(p_ids) > 46 then
    raise exception 'bad ids';
  end if;
  -- p_run is recorded only as a size check. Authorization uses score_log
  -- and profiles.run_stats, never the client's object.
  if p_run is not null then
    if octet_length(p_run::text) > 8000 or jsonb_typeof(p_run) <> 'object' then
      raise exception 'bad run';
    end if;
  end if;

  foreach aid in array p_ids loop
    if aid is null or char_length(aid) > 32 or aid !~ '^[A-Za-z0-9_]+$' then
      continue;
    end if;
    if not (aid = any (public.award_whitelist())) then
      continue;
    end if;
    if aid = any (v_ids) then
      continue;
    end if;
    v_ids := v_ids || array[aid];
  end loop;

  insert into public.award_rate (user_id)
  values (uid)
  on conflict (user_id) do nothing;

  select window_start, calls, day_start, new_grants
    into v_window, v_calls, v_day, v_new_today
    from public.award_rate
   where user_id = uid
   for update;

  if v_window < now() - interval '10 minutes' then
    v_window := now();
    v_calls := 0;
  end if;
  if v_day < now() - interval '1 day' then
    v_day := now();
    v_new_today := 0;
  end if;
  -- 80 calls / 10 minutes. One ranked run persists once per new award plus
  -- one retry after the score lands. 80 leaves room for that without letting
  -- a script spin the function all afternoon.
  if v_calls >= 80 then
    v_skip := true;
  else
    v_calls := v_calls + 1;
  end if;

  select coalesce(max(candles), 0),
         coalesce(count(*) filter (where candles >= 420), 0)
    into v_max, v_runs
    from public.score_log
   where user_id = uid;

  if not v_skip then
    foreach aid in array public.award_whitelist() loop
      if aid in ('regular', 'veteran', 'collector', 'curator') then
        continue;
      end if;
      if not (aid = any (v_ids)) then
        continue;
      end if;
      if public.award_holds(uid, array[aid]) then
        continue;
      end if;

      -- Both sides of a one-choice card in one call: grant neither.
      if aid in ('married', 'runaway')
         and 'married' = any (v_ids) and 'runaway' = any (v_ids)
         and not public.award_holds(uid, array['married'])
         and not public.award_holds(uid, array['runaway']) then
        continue;
      end if;
      if aid in ('notForSale', 'sellout')
         and 'notForSale' = any (v_ids) and 'sellout' = any (v_ids)
         and not public.award_holds(uid, array['notForSale'])
         and not public.award_holds(uid, array['sellout']) then
        continue;
      end if;
      if aid in ('familyOffice', 'classicFartface')
         and 'familyOffice' = any (v_ids) and 'classicFartface' = any (v_ids)
         and not public.award_holds(uid, array['familyOffice'])
         and not public.award_holds(uid, array['classicFartface']) then
        continue;
      end if;

      if aid in ('married', 'runaway') and not public.award_holds(uid, array['engaged']) then
        continue;
      end if;
      if aid = 'married' and public.award_holds(uid, array['runaway']) then
        continue;
      end if;
      if aid = 'runaway' and public.award_holds(uid, array['married']) then
        continue;
      end if;
      if aid in ('familyOffice', 'classicFartface') and not public.award_holds(uid, array['babyBoard']) then
        continue;
      end if;
      if aid = 'familyOffice' and public.award_holds(uid, array['classicFartface']) then
        continue;
      end if;
      if aid = 'classicFartface' and public.award_holds(uid, array['familyOffice']) then
        continue;
      end if;
      if aid = 'chess3' and not public.award_holds(uid, array['chessWin']) then
        continue;
      end if;
      if aid = 'chess7' and not public.award_holds(uid, array['chess3']) then
        continue;
      end if;
      if aid in (
        'miner', 'citadel', 'nodes100', 'notForSale', 'sellout',
        'declared', 'beachHolds', 'fourth', 'noAid', 'freeNation'
      ) and not public.award_holds(uid, array['landowner']) then
        continue;
      end if;
      if aid in ('declared', 'beachHolds', 'fourth', 'noAid', 'freeNation')
         and not public.award_holds(uid, array['nodes100']) then
        continue;
      end if;
      if aid in ('beachHolds', 'fourth', 'noAid', 'freeNation')
         and not public.award_holds(uid, array['declared']) then
        continue;
      end if;
      if aid in ('fourth', 'noAid', 'freeNation')
         and not public.award_holds(uid, array['beachHolds']) then
        continue;
      end if;
      if aid in ('noAid', 'freeNation') and not public.award_holds(uid, array['fourth']) then
        continue;
      end if;
      if aid in ('notForSale', 'sellout') and not public.award_holds(uid, array['landowner']) then
        continue;
      end if;

      if not public.award_supported(uid, aid) then
        continue;
      end if;
      -- At most one full catalog of brand-new rows per day. Repeats do not count.
      if v_new_today >= 46 then
        continue;
      end if;

      insert into public.award_grants (user_id, award_id, granted_at, run_ref, evidence)
      values (
        uid,
        aid,
        now(),
        'candles:' || v_max::text,
        jsonb_build_object('rule', aid, 'maxCandles', v_max, 'runs420', v_runs)
      )
      on conflict (user_id, award_id) do nothing;
      if found then
        v_new_today := v_new_today + 1;
      end if;
    end loop;

    -- Cumulative awards are computed here. Ids sent by the client are ignored.
    if v_runs >= 10 and not public.award_holds(uid, array['regular']) and v_new_today < 46 then
      insert into public.award_grants (user_id, award_id, granted_at, run_ref, evidence)
      values (uid, 'regular', now(), 'runs420:' || v_runs::text,
              jsonb_build_object('rule', 'regular', 'runs420', v_runs))
      on conflict (user_id, award_id) do nothing;
      if found then v_new_today := v_new_today + 1; end if;
    end if;
    if v_runs >= 50 and not public.award_holds(uid, array['veteran']) and v_new_today < 46 then
      insert into public.award_grants (user_id, award_id, granted_at, run_ref, evidence)
      values (uid, 'veteran', now(), 'runs420:' || v_runs::text,
              jsonb_build_object('rule', 'veteran', 'runs420', v_runs))
      on conflict (user_id, award_id) do nothing;
      if found then v_new_today := v_new_today + 1; end if;
    end if;

    -- Same two-pass count as metaAwardIds() in game.js, including regular
    -- and veteran, excluding nothing that is already stored.
    for v_pass in 1..2 loop
      select count(*) into v_n from public.award_grants where user_id = uid;
      if v_n >= 10 and not public.award_holds(uid, array['collector']) and v_new_today < 46 then
        insert into public.award_grants (user_id, award_id, granted_at, run_ref, evidence)
        values (uid, 'collector', now(), 'count:' || v_n::text,
                jsonb_build_object('rule', 'collector', 'count', v_n))
        on conflict (user_id, award_id) do nothing;
        if found then v_new_today := v_new_today + 1; end if;
      end if;
      select count(*) into v_n from public.award_grants where user_id = uid;
      if v_n >= 25 and not public.award_holds(uid, array['curator']) and v_new_today < 46 then
        insert into public.award_grants (user_id, award_id, granted_at, run_ref, evidence)
        values (uid, 'curator', now(), 'count:' || v_n::text,
                jsonb_build_object('rule', 'curator', 'count', v_n))
        on conflict (user_id, award_id) do nothing;
        if found then v_new_today := v_new_today + 1; end if;
      end if;
    end loop;
  end if;

  update public.award_rate
     set window_start = v_window,
         calls = v_calls,
         day_start = v_day,
         new_grants = v_new_today
   where user_id = uid;

  perform set_config('app.awards_ok', '1', true);
  update public.profiles
     set awards = public.award_ids_for(uid)
   where id = uid;

  return public.award_ids_for(uid);
end;
$sql$;

-- One-shot copy of profiles.awards into the ledger so legitimate rows are not
-- dropped when the guard turns on. Evidence is exactly {"legacy": true}.
-- Does not delete suspicious rows. Run award_audit_suspicious() and decide.
-- Dashboard only. Not granted to anon or authenticated.
create or replace function public.migrate_legacy_awards()
returns integer
language plpgsql
security definer
set search_path = public
as $sql$
declare
  n integer := 0;
  added integer;
  r record;
  aid text;
begin
  for r in
    select id, awards
      from public.profiles
     where awards is not null
       and cardinality(awards) > 0
  loop
    foreach aid in array r.awards loop
      if aid is null or not (aid = any (public.award_whitelist())) then
        continue;
      end if;
      insert into public.award_grants (user_id, award_id, granted_at, run_ref, evidence)
      values (r.id, aid, now(), 'legacy', '{"legacy": true}'::jsonb)
      on conflict (user_id, award_id) do nothing;
      get diagnostics added = row_count;
      n := n + added;
    end loop;
  end loop;

  perform set_config('app.awards_ok', '1', true);
  update public.profiles p
     set awards = public.award_ids_for(p.id);

  return n;
end;
$sql$;

-- Read-only report for the SQL editor. Does not delete anything.
-- Legacy copies are included: {"legacy": true} is not proof the award was earned.
create or replace function public.award_audit_suspicious()
returns table (user_id uuid, username text, reason text, detail text)
language sql
stable
security definer
set search_path = public
as $sql$
  with base as (
    select
      p.id,
      p.username,
      coalesce(c.secrets, 0) as secrets,
      coalesce(c.base_n, 0) as base_n,
      coalesce(c.has_long, false) as has_long,
      coalesce(c.has_marathon, false) as has_marathon,
      coalesce(c.has_regular, false) as has_regular,
      coalesce(c.has_veteran, false) as has_veteran,
      coalesce(c.has_collector, false) as has_collector,
      coalesce(c.has_curator, false) as has_curator,
      coalesce(c.has_fourth, false) as has_fourth,
      coalesce(c.pair_wedding, false) as pair_wedding,
      coalesce(c.pair_island, false) as pair_island,
      coalesce(c.pair_baby, false) as pair_baby,
      coalesce(s.runs, 0) as runs,
      coalesce(s.max_candles, 0) as max_candles,
      coalesce(s.runs420, 0) as runs420
    from public.profiles p
    left join lateral (
      select
        count(*) filter (where g.award_id = any (public.award_secret_ids())) as secrets,
        count(*) filter (where g.award_id not in ('collector', 'curator')) as base_n,
        bool_or(g.award_id = 'longHaul') as has_long,
        bool_or(g.award_id = 'marathon') as has_marathon,
        bool_or(g.award_id = 'regular') as has_regular,
        bool_or(g.award_id = 'veteran') as has_veteran,
        bool_or(g.award_id = 'collector') as has_collector,
        bool_or(g.award_id = 'curator') as has_curator,
        bool_or(g.award_id = 'fourth') as has_fourth,
        (bool_or(g.award_id = 'married') and bool_or(g.award_id = 'runaway')) as pair_wedding,
        (bool_or(g.award_id = 'notForSale') and bool_or(g.award_id = 'sellout')) as pair_island,
        (bool_or(g.award_id = 'familyOffice') and bool_or(g.award_id = 'classicFartface')) as pair_baby
      from public.award_grants g
      where g.user_id = p.id
    ) c on true
    left join lateral (
      select
        count(*) as runs,
        coalesce(max(sl.candles), 0) as max_candles,
        count(*) filter (where sl.candles >= 420) as runs420
      from public.score_log sl
      where sl.user_id = p.id
    ) s on true
  )
  select b.id, b.username, v.reason, v.detail
    from base b
    cross join lateral (
      values
        ('secrets_and_no_runs', b.secrets >= 3 and b.runs = 0,
          b.secrets::text || ' secret awards and 0 score_log rows'),
        ('secret_without_runs', b.secrets >= 1 and b.runs = 0,
          b.secrets::text || ' secret awards and 0 score_log rows'),
        ('exclusive_wedding', b.pair_wedding,
          'married and runaway'),
        ('exclusive_island', b.pair_island,
          'notForSale and sellout'),
        ('exclusive_baby', b.pair_baby,
          'familyOffice and classicFartface'),
        ('long_haul_short', b.has_long and b.max_candles < 1000,
          'longHaul with max candles ' || b.max_candles::text),
        ('marathon_short', b.has_marathon and b.max_candles < 2100,
          'marathon with max candles ' || b.max_candles::text),
        ('fourth_short', b.has_fourth and b.max_candles < 420,
          'fourth with max candles ' || b.max_candles::text),
        ('regular_thin', b.has_regular and b.runs420 < 10,
          'regular with ' || b.runs420::text || ' runs of 420+ candles'),
        ('veteran_thin', b.has_veteran and b.runs420 < 50,
          'veteran with ' || b.runs420::text || ' runs of 420+ candles'),
        ('collector_thin', b.has_collector and b.base_n < 10,
          'collector with ' || b.base_n::text || ' other awards'),
        ('curator_thin', b.has_curator and b.base_n < 24,
          'curator with ' || b.base_n::text || ' awards besides collector and curator')
    ) as v(reason, hit, detail)
   where v.hit
   order by b.username, v.reason;
$sql$;

revoke all on function public.award_num(jsonb, text) from public, anon, authenticated;
revoke all on function public.award_bool(jsonb, text) from public, anon, authenticated;
revoke all on function public.award_holds(uuid, text[]) from public, anon, authenticated;
revoke all on function public.award_supported(uuid, text) from public, anon, authenticated;
revoke all on function public.award_ids_for(uuid) from public, anon, authenticated;
revoke all on function public.guard_awards() from public, anon, authenticated;
revoke all on function public.grant_awards(text[], jsonb) from public, anon, authenticated;
revoke all on function public.migrate_legacy_awards() from public, anon, authenticated;
revoke all on function public.award_audit_suspicious() from public, anon, authenticated;

grant execute on function public.grant_awards(text[], jsonb) to authenticated;

-- Checks to run by hand after migrate_legacy_awards(). Expect zero rows.
--
-- select p.id, p.username, a.award_id
--   from public.profiles p
--   cross join lateral unnest(p.awards) as a(award_id)
--  where a.award_id = any (public.award_whitelist())
--    and not exists (
--      select 1 from public.award_grants g
--       where g.user_id = p.id and g.award_id = a.award_id
--    );
--
-- select * from public.award_audit_suspicious();
