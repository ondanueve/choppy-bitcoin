-- Paste in the Supabase SQL editor AFTER supabase/supabase-daily.sql. Safe to re-run.
-- Ranked ghost of the day for Choppy Bitcoin: one compact flight path per signed-in
-- user per UTC day, kept only for the score that is that user's best of the day.
-- While playing today's Ranked chart, the client shows the best run on the board that
-- has a path as a semi-transparent ghost.
-- The client hides the ghost if these functions are missing, so this file can be
-- applied after the client ships. It stores no IP, email, or other personal data.
-- Does not drop or alter daily_scores, profiles, or any other existing table.
--
-- Path format (written by ghost.js): g1.<dtMs>.<unit>.<body>, base64url body,
-- 3 characters per sample, at most 4000 samples (12100 characters in total).

create table if not exists public.daily_ghosts (
  day date not null,
  user_id uuid not null references auth.users (id) on delete cascade,
  score bigint not null,
  ghost text not null,
  updated_at timestamptz not null default now(),
  primary key (day, user_id),
  constraint daily_ghosts_len check (length(ghost) between 16 and 12100),
  constraint daily_ghosts_fmt check (ghost ~ '^g1\.[0-9]{2,5}\.[0-9]{1,3}\.[A-Za-z0-9_-]+$')
);

alter table public.daily_ghosts enable row level security;

revoke all on public.daily_ghosts from public, anon, authenticated;

drop function if exists public.submit_daily_ghost(bigint, text, date);
create or replace function public.submit_daily_ghost(
  p_score bigint,
  p_ghost text,
  p_day date default null
)
returns boolean
language plpgsql
security definer
set search_path = public
as $fn$
declare
  uid uuid := auth.uid();
  today date := (timezone('utc', now()))::date;
  d date := coalesce(p_day, today);
  body text;
  dt_ms integer;
  unit integer;
  samples integer;
  best bigint;
  best_life double precision;
  prev_at timestamptz;
begin
  if uid is null then
    raise exception 'not signed in';
  end if;
  if d <> today then
    return false;
  end if;
  if p_ghost is null or length(p_ghost) < 16 or length(p_ghost) > 12100 then
    return false;
  end if;
  if p_ghost !~ '^g1\.[0-9]{2,5}\.[0-9]{1,3}\.[A-Za-z0-9_-]+$' then
    return false;
  end if;
  dt_ms := split_part(p_ghost, '.', 2)::integer;
  unit := split_part(p_ghost, '.', 3)::integer;
  body := split_part(p_ghost, '.', 4);
  if dt_ms < 50 or dt_ms > 6400 or unit < 1 or unit > 255 then
    return false;
  end if;
  if length(body) % 3 <> 0 then
    return false;
  end if;
  samples := length(body) / 3;
  if samples < 2 or samples > 4000 then
    return false;
  end if;

  -- Only the score already stored by submit_daily_score as this user's best today.
  select s.score, s.life_t into best, best_life
  from public.daily_scores s
  where s.day = d and s.user_id = uid;
  if best is null or best <> p_score then
    return false;
  end if;
  -- The path cannot be longer than the run itself (play time is at most the run time).
  if (samples - 1) * dt_ms / 1000.0 > coalesce(best_life, 0) + 5 then
    return false;
  end if;

  select g.updated_at into prev_at
  from public.daily_ghosts g
  where g.day = d and g.user_id = uid;
  if prev_at is not null and prev_at > now() - interval '10 seconds' then
    return false;
  end if;

  insert into public.daily_ghosts (day, user_id, score, ghost, updated_at)
  values (d, uid, p_score, p_ghost, now())
  on conflict (day, user_id) do update
    set score = excluded.score,
        ghost = excluded.ghost,
        updated_at = now();

  return true;
end;
$fn$;

revoke all on function public.submit_daily_ghost(bigint, text, date) from public;
grant execute on function public.submit_daily_ghost(bigint, text, date) to authenticated;

-- The best-ranked run of the day that has a path for its current best score.
-- Ranking matches daily_board. is_me tells the client the ghost is the caller's own.
drop function if exists public.daily_top_ghost(date);
create or replace function public.daily_top_ghost(
  p_day date default null
)
returns table(rank integer, alias text, score bigint, ghost text, is_me boolean)
language sql
stable
security definer
set search_path = public
as $fn$
  with ranked as (
    select s.day,
           s.user_id,
           s.score,
           coalesce(nullif(btrim(p.username), ''), '?') as alias,
           (row_number() over (order by s.score desc, s.life_t asc nulls last, s.updated_at asc))::integer as rnk
    from public.daily_scores s
    join public.profiles p on p.id = s.user_id
    where s.day = coalesce(p_day, (timezone('utc', now()))::date)
  )
  select r.rnk, r.alias, r.score, g.ghost, (r.user_id = auth.uid()) is true
  from ranked r
  join public.daily_ghosts g on g.day = r.day and g.user_id = r.user_id and g.score = r.score
  order by r.rnk
  limit 1;
$fn$;

revoke all on function public.daily_top_ghost(date) from public;
grant execute on function public.daily_top_ghost(date) to anon, authenticated;
