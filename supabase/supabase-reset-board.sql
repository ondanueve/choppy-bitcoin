-- Paste in the Supabase SQL editor. Safe to re-run.
-- Empties the board. The award and score guards ignore a direct write unless
-- app.awards_ok and app.score_ok are set for this transaction, so this script
-- sets both and then clears the ledger tables when they exist.

do $reset$
declare
  sets text := 'highscore = 0, last_score_at = null, awards = ''{}''';
begin
  perform set_config('app.awards_ok', '1', true);
  perform set_config('app.score_ok', '1', true);
  if exists (
    select 1 from information_schema.columns
    where table_schema = 'public' and table_name = 'profiles' and column_name = 'score_time'
  ) then
    sets := sets || ', score_time = null';
  end if;
  if exists (
    select 1 from information_schema.columns
    where table_schema = 'public' and table_name = 'profiles' and column_name = 'run_stats'
  ) then
    sets := sets || ', run_stats = null';
  end if;
  execute 'update public.profiles set ' || sets;
  if to_regclass('public.score_log') is not null then
    execute 'truncate table public.score_log';
  end if;
  if to_regclass('public.award_grants') is not null then
    execute 'truncate table public.award_grants';
  end if;
  if to_regclass('public.award_rate') is not null then
    execute 'truncate table public.award_rate';
  end if;
  if to_regclass('public.score_rate') is not null then
    execute 'truncate table public.score_rate';
  end if;
end
$reset$;
