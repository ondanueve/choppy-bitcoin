# Applying the award and score guards

These files were not executed against production while they were written. Apply them in the Supabase SQL editor of a test project first. Read every result in the pre-check before pasting the next file. The editor runs as the database owner, which bypasses row level security and still fires triggers.

Do not run `supabase/supabase-reset-board.sql` as part of this migration. That script empties the board. It was only updated so that a later, deliberate reset still works after the guards exist: it sets `app.awards_ok` and `app.score_ok`, then clears the ledger tables when they are present.

## Already applied

Production already has the pieces these files alter. On a fresh test project, apply the existing scripts first, in this order, and skip any you have already applied:

1. `supabase/supabase-profiles.sql`
2. `supabase/supabase-awards.sql`
3. `supabase/supabase-score.sql`
4. `supabase/supabase-run-stats.sql`
5. `supabase/supabase-elo.sql`

The client and `supabase-score.sql` use the column name `highscore`. `supabase-profiles.sql` creates `high_score`. If the pre-check shows `high_score` and not `highscore`, stop. Do not guess a rename. The score guard and the score RPC both name `highscore`, and applying them on a `high_score` database will fail on the first scored game.

## Pre-check

Run this and keep the output.

```sql
select column_name
  from information_schema.columns
 where table_schema = 'public'
   and table_name = 'profiles'
   and column_name in (
     'id', 'awards', 'highscore', 'high_score',
     'score_time', 'run_stats', 'last_score_at', 'username', 'elo'
   )
 order by column_name;

select tgname, pg_get_triggerdef(t.oid) as def
  from pg_trigger t
 where t.tgrelid = 'public.profiles'::regclass
   and not t.tgisinternal
 order by tgname;

select p.proname, pg_get_function_identity_arguments(p.oid) as args
  from pg_proc p
 where p.pronamespace = 'public'::regnamespace
   and p.proname in (
     'submit_choppy_score', 'guard_elo', 'guard_highscore', 'grant_awards'
   )
 order by p.proname;

select column_name, is_nullable, column_default
  from information_schema.columns
 where table_schema = 'public'
   and table_name = 'score_log'
 order by ordinal_position;
```

Stop when any of these is true:

- `profiles.awards` is missing. Apply `supabase-awards.sql` first.
- `profiles.highscore` is missing.
- `score_log` exists and has a `NOT NULL` column without a default other than `user_id`, `score`, `life_t`, and `candles`. `supabase-score-v2.sql` inserts `user_id`, `score`, `life_t`, `candles`, `logged_at`, and `stats_summary`. An extra required column will reject every score. Add a default or include that column in the insert before applying.
- A trigger on `profiles` already rewrites `highscore` (or `score_time`, `last_score_at`, `run_stats`) and its function does not return early when `current_setting('app.score_ok', true) = '1'`. Read the body with `select pg_get_functiondef(oid) from pg_proc where proname = '...'`. Two BEFORE triggers that both honor `app.score_ok` and restore the same columns are safe. A trigger that restores the columns even when the flag is set will silently discard every new high score. Do not apply `supabase-score-v2.sql` until that function is reconciled. This repo does not contain that production trigger, so the comparison has to happen in the editor.

`CREATE TABLE IF NOT EXISTS public.score_log` in both new files runs only when the table is absent. An existing `score_log` without an `id` column is left without one. Neither RPC reads `score_log.id`.

## Order

Paste each file as one script. `supabase-score-v2.sql` drops `submit_choppy_score` before it creates the new function. If that script stops in the middle, scores fail until you paste the same file again and it finishes without an error.

1. `supabase/supabase-score-v2.sql`
2. `supabase/supabase-awards-guard.sql`
3. `select public.migrate_legacy_awards();`

Score v2 first so new ranked runs land with a `stats_summary` before anyone calls `grant_awards`. The other order is safe: both files add `logged_at` and `stats_summary` if they are missing, and old log rows stay null. Null summaries are judged on `candles` only, which is enough for `longHaul`, `marathon`, and the story floor, and not enough for `maxi` or `paper` until a later run writes a summary.

`migrate_legacy_awards()` copies whitelist ids from `profiles.awards` into `award_grants` with evidence exactly `{"legacy": true}`. It does not delete suspicious rows. It then rewrites every `profiles.awards` from the ledger, in catalog order, which drops ids that are not on the whitelist. It is not granted to `anon` or `authenticated`. Run it once from the SQL editor. Running it again inserts nothing new (`on conflict do nothing`) and rewrites the column again.

`grant_awards` does the same copy for the signed-in player before it judges the call. Players who open the game between steps 2 and 3 do not lose the column. The editor migration is still required so accounts that never call the RPC keep their ids, and so the audit sees everyone.

## Post-check

Expect zero rows from the first query. The second query is the audit. Legacy copies are included on purpose: `{"legacy": true}` is not proof the award was earned. `regular_thin` and `veteran_thin` will fire for honest players until `score_log` holds their old 420-candle runs. Do not delete those from this query alone.

```sql
select p.id, p.username, a.award_id
  from public.profiles p
  cross join lateral unnest(p.awards) as a(award_id)
 where a.award_id = any (public.award_whitelist())
   and not exists (
     select 1
       from public.award_grants g
      where g.user_id = p.id
        and g.award_id = a.award_id
   );

select * from public.award_audit_suspicious();
```

Privileges. `grant_awards` and `submit_choppy_score` must be executable by `authenticated` and not by `anon`. `migrate_legacy_awards`, `award_audit_suspicious`, `award_supported`, and `award_holds` must not be executable by `anon` or `authenticated`. `award_whitelist` and `award_secret_ids` must be executable by both, because the read policy on `award_grants` calls the secret list.

```sql
select p.proname,
       pg_get_function_identity_arguments(p.oid) as args,
       p.proacl
  from pg_proc p
 where p.pronamespace = 'public'::regnamespace
   and p.proname in (
     'grant_awards', 'migrate_legacy_awards', 'award_audit_suspicious',
     'award_supported', 'award_holds', 'submit_choppy_score',
     'award_whitelist', 'award_secret_ids'
   )
 order by p.proname;
```

Then run `docs/security/award-sql-tests.md` against the test project. That script deletes one profile's scores and awards. Do not point it at a production id.

Ship the client in the same release as the SQL, or after it. The client calls `grant_awards` and, when PostgREST returns 404 or `PGRST202` or "Could not find the function", warns once and leaves the local awards in place. The toast already happened. With the SQL applied, a missing client still cannot write `profiles.awards` directly; those players keep local awards until they load the new `auth.js`.

`app.awards_ok` and `app.score_ok` are transaction-local. PostgREST ends the transaction when the RPC returns, so a browser call cannot leave the flag set. In the SQL editor the flag stays for the rest of that transaction. Clear it with `select set_config('app.awards_ok', '', true)` before a manual update you expect the guard to block.

## Rollback

Run this in the SQL editor. It does not drop `award_grants`, so the ledger survives a rollback. Dropping the tables is optional and loses the copy.

```sql
drop trigger if exists trg_guard_awards on public.profiles;
drop function if exists public.grant_awards(text[], jsonb);

drop trigger if exists trg_guard_highscore on public.profiles;
```

Then paste `supabase/supabase-score.sql` again. That restores `submit_choppy_score` to the previous body: same arguments, log only a new high, no stats shape check, no daily cap. Leave `trg_guard_highscore` in place only if you are sure the restored function still sets `app.score_ok` before it writes. The copy in `supabase-score.sql` does set it.

If you drop `grant_awards` and leave `trg_guard_awards`, the client warns and keeps awards on the device, and a direct update no longer sticks. Drop the trigger in the same rollback if you want the old direct write back.

The client does not need a code rollback for a missing RPC. It already degrades. `auth.js` is cached as `mp193`. Serving the previous `auth.js` means changing that query back to `mp66` and redeploying the hub, which is a separate step from this repo.

## After a deliberate board reset

`supabase-reset-board.sql` sets both flags, zeroes `highscore`, clears `last_score_at`, `awards`, `score_time`, and `run_stats` when those columns exist, and truncates `score_log`, `award_grants`, `award_rate`, and `score_rate` when those tables exist. Run it only when you mean to empty the season. It is safe to run twice. It is not part of the forward migration.
