-- Paste in the Supabase SQL editor. Safe to re-run.
-- Do not change quotes. This file is not applied by the game.
--
-- Run supabase-elo.sql first on a database that does not have profiles.elo yet.
-- Then run this file. Do not paste supabase-elo.sql again afterwards: its copy of
-- submit_versus_result would replace this one.
-- After a successful run, reload the API schema if the new argument does not show
-- up: NOTIFY pgrst, 'reload schema';
--
-- Agreement: the row is final only when floor(n / 2) + 1 reporters name the same
-- winner. For 2 players that is both of them. Until then the call returns
-- {"status":"pending"} and ELO does not move. A split where everyone has voted
-- and nobody reaches that count returns {"status":"disputed"} and ELO does not move.
-- A client that sends p_duration_s below 15 is ignored ({"status":"short"}).
-- A null duration still counts, so the previous 3-argument call keeps working.
-- At most 8 match keys per player pair per hour, and 16 new keys per reporter
-- per hour. Over the cap the call returns {"status":"limited"} and ELO does not move.
-- The final JSON array matches the old shape, plus a delta field.
--
-- Hand checks (two signed-in users A and B, plus C when noted). Call as each user
-- with rpc submit_versus_result. Expect the status below. Confirm profiles.elo
-- only changes on final.
-- 1. A reports winner A, players {A,B}, duration 40. Expect pending. ELO unchanged.
-- 2. B reports the same winner and the same players. Expect a JSON array. ELO moves once.
-- 3. Repeat step 2. Expect the same array. elo_games does not increase again.
-- 4. New seed. A says winner A, B says winner B, duration 40. Expect disputed. ELO unchanged.
-- 5. New seed. A and B say winner B, C does not report, players {A,B,C}, duration 40.
--    Expect final (2 of 3). C is in the array. elo_games increases for all three.
-- 6. New seed. A, B and C each name a different winner, duration 40. Expect disputed.
-- 7. New seed. Both agree, duration 5. Expect short. No versus_reports row. ELO unchanged.
-- 8. After 8 committed or still-pending keys for the pair in the last hour, the next key returns limited.

alter table public.profiles add column if not exists elo integer;
alter table public.profiles add column if not exists elo_games integer;
update public.profiles set elo = 1000 where elo is null;
update public.profiles set elo_games = 0 where elo_games is null;
alter table public.profiles alter column elo set default 1000;
alter table public.profiles alter column elo_games set default 0;

create table if not exists public.versus_matches (
  id bigint generated always as identity primary key,
  match_key text not null unique,
  seed bigint,
  winner uuid,
  players uuid[] not null,
  deltas jsonb,
  created_at timestamptz not null default now()
);

alter table public.versus_matches add column if not exists status text not null default 'final';
alter table public.versus_matches alter column winner drop not null;
alter table public.versus_matches drop constraint if exists versus_matches_status_chk;
alter table public.versus_matches
  add constraint versus_matches_status_chk check (status in ('final', 'disputed'));

alter table public.versus_matches enable row level security;
drop policy if exists versus_matches_select on public.versus_matches;
create policy versus_matches_select on public.versus_matches for select using (true);

create table if not exists public.versus_reports (
  match_key text not null,
  reporter uuid not null,
  winner uuid not null,
  players uuid[] not null,
  seed bigint,
  duration_s integer,
  created_at timestamptz not null default now(),
  primary key (match_key, reporter)
);

alter table public.versus_reports enable row level security;
drop policy if exists versus_reports_select_none on public.versus_reports;
create policy versus_reports_select_none on public.versus_reports for select using (false);
revoke all on public.versus_reports from anon, authenticated;

create index if not exists versus_reports_reporter_idx
  on public.versus_reports (reporter, created_at);

create or replace function public.guard_elo()
returns trigger
language plpgsql
as '
begin
  if current_setting(''app.elo_ok'', true) = ''1'' then
    return new;
  end if;
  if tg_op = ''update'' then
    new.elo := old.elo;
    new.elo_games := old.elo_games;
  end if;
  return new;
end;
';

drop trigger if exists trg_guard_elo on public.profiles;
create trigger trg_guard_elo
before update on public.profiles
for each row execute function public.guard_elo();

drop function if exists public.submit_versus_result(bigint, uuid, uuid[]);

create or replace function public.submit_versus_result(
  p_seed bigint,
  p_winner uuid,
  p_players uuid[],
  p_duration_s integer default null
)
returns jsonb
language plpgsql
security definer
set search_path = public
as '
declare
  uid uuid := auth.uid();
  ids uuid[];
  key text;
  n integer;
  need integer;
  votes integer;
  best_winner uuid;
  best_n integer;
  already boolean := false;
  mine integer;
  pair_n integer;
  i integer;
  j integer;
  st text;
  outj jsonb;
  loser uuid;
  ra integer;
  rb integer;
  ea double precision;
  k integer := 24;
  dw integer := 0;
  dl integer;
  delta_map jsonb := ''{}''::jsonb;
begin
  if uid is null then
    raise exception ''not signed in'';
  end if;
  if p_winner is null then
    raise exception ''no winner'';
  end if;
  if p_duration_s is not null and p_duration_s < 15 then
    return jsonb_build_object(''status'', ''short'');
  end if;

  select array_agg(x order by x) into ids
  from (select distinct unnest(p_players) as x) s
  where x is not null;
  n := coalesce(array_length(ids, 1), 0);
  if n < 2 then
    raise exception ''few players'';
  end if;
  if not (uid = any (ids)) then
    raise exception ''not in match'';
  end if;
  if not (p_winner = any (ids)) then
    raise exception ''winner not in match'';
  end if;
  if (select count(*) from public.profiles where id = any (ids)) <> n then
    raise exception ''unknown player'';
  end if;

  key := coalesce(p_seed, 0)::text || '':'' || array_to_string(ids, '','');
  perform pg_advisory_xact_lock(hashtextextended(key, 0));

  select status, deltas into st, outj
  from public.versus_matches
  where match_key = key;
  if found then
    if st = ''disputed'' then
      return jsonb_build_object(''status'', ''disputed'');
    end if;
    return coalesce(outj, ''[]''::jsonb);
  end if;

  select exists(
    select 1 from public.versus_reports
    where match_key = key and reporter = uid
  ) into already;

  if not already then
    select count(distinct match_key) into mine
    from public.versus_reports
    where reporter = uid
      and created_at > now() - interval ''1 hour''
      and match_key <> key;
    if mine >= 16 then
      return jsonb_build_object(''status'', ''limited'');
    end if;

    i := 1;
    while i <= n loop
      j := i + 1;
      while j <= n loop
        select
          (select count(*) from public.versus_matches vm
            where vm.created_at > now() - interval ''1 hour''
              and vm.players @> array[ids[i], ids[j]]
              and vm.match_key <> key)
          +
          (select count(distinct r1.match_key)
            from public.versus_reports r1
            join public.versus_reports r2
              on r2.match_key = r1.match_key
             and r2.reporter = ids[j]
           where r1.reporter = ids[i]
             and r1.created_at > now() - interval ''1 hour''
             and r1.match_key <> key
             and not exists (
               select 1 from public.versus_matches vm2
               where vm2.match_key = r1.match_key
             ))
        into pair_n;
        if pair_n >= 8 then
          return jsonb_build_object(''status'', ''limited'');
        end if;
        j := j + 1;
      end loop;
      i := i + 1;
    end loop;
  end if;

  insert into public.versus_reports (match_key, reporter, winner, players, seed, duration_s)
  values (key, uid, p_winner, ids, p_seed, p_duration_s)
  on conflict (match_key, reporter) do update
    set winner = excluded.winner,
        players = excluded.players,
        seed = excluded.seed,
        duration_s = excluded.duration_s;

  select count(*)::integer into votes
  from public.versus_reports
  where match_key = key;

  select r.winner, count(*)::integer
    into best_winner, best_n
  from public.versus_reports r
  where r.match_key = key
  group by r.winner
  order by count(*) desc, r.winner
  limit 1;

  need := (n / 2) + 1;
  if best_n is null or best_n < need then
    if votes >= n then
      insert into public.versus_matches (match_key, seed, winner, players, deltas, status)
      values (key, p_seed, null, ids, null, ''disputed'');
      return jsonb_build_object(''status'', ''disputed'');
    end if;
    return jsonb_build_object(''status'', ''pending'', ''have'', coalesce(best_n, 0), ''need'', need);
  end if;

  perform set_config(''app.elo_ok'', ''1'', true);
  update public.profiles set elo = 1000 where id = any (ids) and elo is null;
  update public.profiles set elo_games = 0 where id = any (ids) and elo_games is null;

  select coalesce(elo, 1000) into ra from public.profiles where id = best_winner;
  if ra is null then ra := 1000; end if;

  foreach loser in array ids loop
    if loser = best_winner then
      continue;
    end if;
    select coalesce(elo, 1000) into rb from public.profiles where id = loser;
    if rb is null then rb := 1000; end if;
    ea := 1.0 / (1.0 + power(10.0, (rb - ra)::double precision / 400.0));
    dw := dw + round(k * (1.0 - ea))::integer;
    dl := round(k * (0.0 - (1.0 / (1.0 + power(10.0, (ra - rb)::double precision / 400.0)))))::integer;
    if dl > 48 then dl := 48; end if;
    if dl < -48 then dl := -48; end if;
    update public.profiles
       set elo = greatest(100, coalesce(elo, 1000) + dl),
           elo_games = coalesce(elo_games, 0) + 1
     where id = loser;
    delta_map := delta_map || jsonb_build_object(loser::text, dl);
  end loop;

  if dw > 48 then dw := 48; end if;
  if dw < 0 then dw := 0; end if;
  update public.profiles
     set elo = greatest(100, coalesce(elo, 1000) + dw),
         elo_games = coalesce(elo_games, 0) + 1
   where id = best_winner;
  delta_map := delta_map || jsonb_build_object(best_winner::text, dw);

  select coalesce(jsonb_agg(jsonb_build_object(
           ''id'', p.id,
           ''elo'', p.elo,
           ''games'', p.elo_games,
           ''delta'', coalesce((delta_map ->> p.id::text)::integer, 0)
         ) order by p.elo desc), ''[]''::jsonb)
    into outj
    from public.profiles p
   where p.id = any (ids);

  insert into public.versus_matches (match_key, seed, winner, players, deltas, status)
  values (key, p_seed, best_winner, ids, outj, ''final'');
  return outj;
end;
';

revoke all on function public.submit_versus_result(bigint, uuid, uuid[], integer) from public;
grant execute on function public.submit_versus_result(bigint, uuid, uuid[], integer) to authenticated;
