-- Paste in Supabase SQL editor. Safe to re-run.
-- Do not change quotes. Versus ELO lives on profiles.elo

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
  winner uuid not null,
  players uuid[] not null,
  deltas jsonb,
  created_at timestamptz not null default now()
);

alter table public.versus_matches enable row level security;
drop policy if exists versus_matches_select on public.versus_matches;
create policy versus_matches_select on public.versus_matches for select using (true);

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

create or replace function public.submit_versus_result(
  p_seed bigint,
  p_winner uuid,
  p_players uuid[]
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
  loser uuid;
  ra integer;
  rb integer;
  ea double precision;
  k integer := 24;
  dw integer := 0;
  dl integer;
  inserted bigint;
  outj jsonb;
begin
  if uid is null then
    raise exception ''not signed in'';
  end if;
  if p_winner is null then
    raise exception ''no winner'';
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
  key := coalesce(p_seed, 0)::text || '':'' || array_to_string(ids, '','');

  insert into public.versus_matches (match_key, seed, winner, players)
  values (key, p_seed, p_winner, ids)
  on conflict (match_key) do nothing
  returning id into inserted;

  if inserted is null then
    select deltas into outj from public.versus_matches where match_key = key;
    return coalesce(outj, ''[]''::jsonb);
  end if;

  perform set_config(''app.elo_ok'', ''1'', true);
  update public.profiles set elo = 1000 where id = any (ids) and elo is null;
  update public.profiles set elo_games = 0 where id = any (ids) and elo_games is null;

  select coalesce(elo, 1000) into ra from public.profiles where id = p_winner;
  if ra is null then ra := 1000; end if;

  foreach loser in array ids loop
    if loser = p_winner then
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
  end loop;

  if dw > 48 then dw := 48; end if;
  if dw < 0 then dw := 0; end if;
  update public.profiles
     set elo = greatest(100, coalesce(elo, 1000) + dw),
         elo_games = coalesce(elo_games, 0) + 1
   where id = p_winner;

  select coalesce(jsonb_agg(jsonb_build_object(
           ''id'', p.id,
           ''elo'', p.elo,
           ''games'', p.elo_games
         ) order by p.elo desc), ''[]''::jsonb)
    into outj
    from public.profiles p
   where p.id = any (ids);

  update public.versus_matches set deltas = outj where match_key = key;
  return outj;
end;
';

revoke all on function public.submit_versus_result(bigint, uuid, uuid[]) from public;
grant execute on function public.submit_versus_result(bigint, uuid, uuid[]) to authenticated;
