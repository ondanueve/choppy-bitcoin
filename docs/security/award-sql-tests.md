# Manual SQL cases for the award and score guards

Run this in the Supabase SQL editor of a **test project**, after `supabase-score-v2.sql`, `supabase-awards-guard.sql`, and `select public.migrate_legacy_awards();`. It was not run while this file was written. Do not point it at production.

The script deletes `score_log`, `award_grants`, `award_rate`, and `score_rate` for one profile, then zeroes that profile's score and awards. Change the uuid in the `declare` block to a `profiles.id` that exists only in the test project. If the id is missing, or if `auth.uid()` does not follow the jwt setting, the script raises before it writes.

Paste the whole script in one run. The last statement is the report. Every `ok` value must be true. `detail` is the observed value when a step fails, and a short confirmation when it passes.

What the pass steps mean:

- `grant set` is the catalog-ordered list after one call that asks for a mix of earned, unearned, unknown, and cumulative ids. `collector` is included because the server counts stored awards. `curator`, `regular`, and `veteran` are not.
- The summary used for that call is one inserted `score_log` row: 1200 candles, `sells` 0, `boughtBtc` false, `sellsBear` 1, `halveMiss` 0, `halvings` 1, `coldLost` 0, `swans` 3, `lasers` 5, `haveSum` 15, `job` 7, `perkMaxed` true, `iabud` 1, `iaProfit` 1, `endBtc` 1, `hitCap` false, `startCash` 2, `startPrice` 1, `net` 3. That is 1.5× starting net worth, so `doubler` and `tenx` stay off. One halving was eaten, so `greedy` stays off. 1200 candles is `longHaul` and not `marathon`.
- `fourth` is in the ask together with `landowner`, `nodes100`, `declared`, and `beachHolds`. The candle floor alone is not enough.
- `evidence ignores client` checks that `p_run` is not copied into `award_grants.evidence`.
- `repeat` asks for the same ids again. `longHaul` stays one row.
- `runaway blocked` asks for `runaway` after `married` is already stored.
- `exclusive pair` deletes `engaged` and `married`, asks for both wedding ids in one call, and expects neither.
- `wedding restored` asks for `engaged` and `married` together and expects both.
- `bad ids`, `bad ids null`, and `bad run` must raise. The 47-long array is forty-seven copies of `maxi`. The unique-row count stays 1.
- `direct awards write` sets `app.awards_ok` back to empty and updates `profiles.awards` to `array['fourth']`. The guard puts the ledger list back.
- `legacy absorb` deletes the `opsec` grant, puts `opsec` back on the column only, then calls `grant_awards` with `array['maxi']`. The id returns as `{"legacy": true}` even though this call did not ask for it.
- Score steps use the same profile. Shape errors (`bad score`, `short run`, `few candles`, `candle rate`, `score vs candles`, `stats mismatch`, `bad stats`) raise the same strings the client already handles. `stats mismatch` and `bad stats` must not insert a log row and must not move `score_rate.day_count`.
- `first score` stores 50000. `slow down` is a second call in the same second. `non improving logged` is a later 40000 that adds a `score_log` row and leaves `highscore` at 50000. `daily limit` sets `day_count` to 240 and expects the raise, then sets `day_count` back to 1 so the test profile is not capped for the rest of the day.
- `direct highscore write` clears `app.score_ok` and tries to set `highscore` to 9. The guard keeps the previous value.

The forged jwt is `set_config(..., true)`, so it dies when the script's transaction ends.

```sql
drop table if exists choppy_test_out;
create temporary table choppy_test_out (
  n integer generated always as identity,
  step text not null,
  ok boolean not null,
  detail text
);

do $tests$
declare
  uid uuid := '00000000-0000-4000-8000-000000000001';
  ask text[] := array[
    'maxi', 'nocoiner', 'paper', 'halver', 'opsec', 'longHaul',
    'swanHunter', 'laserEyes', 'perkHoarder', 'career', 'maxedPerk', 'goodBud',
    'greedy', 'marathon', 'doubler', 'tenx', 'dayTrader', 'cap21', 'regular',
    'engaged', 'married',
    'landowner', 'nodes100', 'declared', 'beachHolds', 'fourth',
    'nope'
  ];
  expected text[] := array[
    'maxi', 'nocoiner', 'paper', 'halver', 'opsec', 'longHaul',
    'swanHunter', 'laserEyes', 'maxedPerk', 'perkHoarder', 'goodBud', 'career',
    'engaged', 'married', 'landowner', 'nodes100', 'declared', 'beachHolds',
    'fourth', 'collector'
  ];
  got text[];
  got2 text[];
  n integer;
  n2 integer;
  hs bigint;
  prev bigint;
  logs integer;
  logs2 integer;
  dayc integer;
  ev text;
  awards_now text[];
begin
  if to_regprocedure('public.grant_awards(text[], jsonb)') is null
     or to_regprocedure('public.submit_choppy_score(bigint, double precision, integer, jsonb)') is null
     or to_regprocedure('public.migrate_legacy_awards()') is null then
    raise exception 'apply supabase-score-v2.sql and supabase-awards-guard.sql before this script';
  end if;
  if not exists (
    select 1 from information_schema.columns
     where table_schema = 'public' and table_name = 'profiles' and column_name = 'highscore'
  ) then
    raise exception 'profiles.highscore is missing';
  end if;
  if not exists (select 1 from public.profiles where id = uid) then
    raise exception 'point uid at a profiles.id that exists only in this test project';
  end if;

  perform set_config('request.jwt.claim.sub', uid::text, true);
  perform set_config(
    'request.jwt.claims',
    json_build_object('sub', uid::text, 'role', 'authenticated')::text,
    true
  );
  if auth.uid() is distinct from uid then
    raise exception 'auth.uid() did not follow the jwt setting';
  end if;

  perform set_config('app.awards_ok', '1', true);
  perform set_config('app.score_ok', '1', true);
  delete from public.award_grants where user_id = uid;
  delete from public.award_rate where user_id = uid;
  delete from public.score_rate where user_id = uid;
  delete from public.score_log where user_id = uid;
  update public.profiles
     set awards = '{}',
         highscore = 0,
         last_score_at = null,
         score_time = null,
         run_stats = null
   where id = uid;
  perform set_config('app.awards_ok', '', true);
  perform set_config('app.score_ok', '', true);

  insert into public.score_log (user_id, score, life_t, candles, logged_at, stats_summary)
  values (
    uid,
    100000,
    250,
    1200,
    now(),
    jsonb_build_object(
      'time', 250,
      'candles', 1200,
      'buys', 1,
      'sells', 0,
      'sellsBear', 1,
      'coldLost', 0,
      'boughtBtc', false,
      'swans', 3,
      'lasers', 5,
      'halvings', 1,
      'halveMiss', 0,
      'haveSum', 15,
      'iabud', 1,
      'iaProfit', 1,
      'job', 7,
      'endBtc', 1,
      'net', 3,
      'startCash', 2,
      'startPrice', 1,
      'hitCap', false,
      'perkMaxed', true
    )
  );

  got := public.grant_awards(ask, '{"candles": 99999, "note": "client"}'::jsonb);
  insert into choppy_test_out (step, ok, detail)
  values ('grant set', got = expected, got::text);

  select count(*) into n
    from public.award_grants
   where user_id = uid
     and award_id = any (array[
       'greedy', 'marathon', 'doubler', 'tenx', 'dayTrader', 'cap21',
       'regular', 'veteran', 'curator', 'nope', 'runaway'
     ]);
  insert into choppy_test_out (step, ok, detail)
  values ('refused ids', n = 0, n::text);

  select evidence::text into ev
    from public.award_grants
   where user_id = uid and award_id = 'longHaul';
  insert into choppy_test_out (step, ok, detail)
  values (
    'evidence ignores client',
    ev not like '%client%' and ev not like '%99999%' and ev like '%longHaul%',
    ev
  );

  got2 := public.grant_awards(ask, '{}'::jsonb);
  select count(*) into n
    from public.award_grants
   where user_id = uid and award_id = 'longHaul';
  insert into choppy_test_out (step, ok, detail)
  values ('repeat', got2 = got and n = 1, n::text);

  perform public.grant_awards(array['runaway'], '{}'::jsonb);
  select count(*) into n
    from public.award_grants
   where user_id = uid and award_id = 'runaway';
  insert into choppy_test_out (step, ok, detail)
  values ('runaway blocked', n = 0, n::text);

  delete from public.award_grants
   where user_id = uid and award_id in ('engaged', 'married');
  perform set_config('app.awards_ok', '1', true);
  update public.profiles
     set awards = public.award_ids_for(uid)
   where id = uid;
  perform set_config('app.awards_ok', '', true);
  perform public.grant_awards(array['married', 'runaway'], '{}'::jsonb);
  select count(*) into n
    from public.award_grants
   where user_id = uid and award_id in ('married', 'runaway');
  insert into choppy_test_out (step, ok, detail)
  values ('exclusive pair', n = 0, n::text);

  perform public.grant_awards(array['engaged', 'married'], '{}'::jsonb);
  select count(*) into n
    from public.award_grants
   where user_id = uid and award_id in ('engaged', 'married');
  select count(*) into n2
    from public.award_grants
   where user_id = uid and award_id = 'runaway';
  insert into choppy_test_out (step, ok, detail)
  values ('wedding restored', n = 2 and n2 = 0, n::text || ' runaway ' || n2::text);

  begin
    perform public.grant_awards(array_fill('maxi'::text, array[47]), '{}'::jsonb);
    insert into choppy_test_out (step, ok, detail) values ('bad ids', false, 'no raise');
  exception
    when others then
      insert into choppy_test_out (step, ok, detail)
      values ('bad ids', sqlerrm = 'bad ids', sqlerrm);
  end;
  select count(*) into n
    from public.award_grants
   where user_id = uid and award_id = 'maxi';
  insert into choppy_test_out (step, ok, detail)
  values ('bad ids kept one row', n = 1, n::text);

  begin
    perform public.grant_awards(null, '{}'::jsonb);
    insert into choppy_test_out (step, ok, detail) values ('bad ids null', false, 'no raise');
  exception
    when others then
      insert into choppy_test_out (step, ok, detail)
      values ('bad ids null', sqlerrm = 'bad ids', sqlerrm);
  end;

  begin
    perform public.grant_awards(array['maxi'], '[]'::jsonb);
    insert into choppy_test_out (step, ok, detail) values ('bad run', false, 'no raise');
  exception
    when others then
      insert into choppy_test_out (step, ok, detail)
      values ('bad run', sqlerrm = 'bad run', sqlerrm);
  end;

  perform set_config('app.awards_ok', '', true);
  update public.profiles set awards = array['fourth'] where id = uid;
  select awards into awards_now from public.profiles where id = uid;
  insert into choppy_test_out (step, ok, detail)
  values (
    'direct awards write',
    awards_now = public.award_ids_for(uid) and cardinality(awards_now) > 1,
    awards_now::text
  );

  delete from public.award_grants where user_id = uid and award_id = 'opsec';
  perform set_config('app.awards_ok', '1', true);
  update public.profiles
     set awards = public.award_ids_for(uid) || array['opsec']
   where id = uid;
  perform set_config('app.awards_ok', '', true);
  perform public.grant_awards(array['maxi'], '{}'::jsonb);
  select case
           when evidence = '{"legacy": true}'::jsonb then 'yes'
           else coalesce(evidence::text, 'missing')
         end
    into ev
    from public.award_grants
   where user_id = uid and award_id = 'opsec';
  select awards into awards_now from public.profiles where id = uid;
  insert into choppy_test_out (step, ok, detail)
  values (
    'legacy absorb',
    ev = 'yes' and 'opsec' = any (awards_now),
    coalesce(ev, 'missing')
  );

  begin
    perform public.submit_choppy_score(0, 30, 10, null);
    insert into choppy_test_out (step, ok, detail) values ('bad score', false, 'no raise');
  exception
    when others then
      insert into choppy_test_out (step, ok, detail)
      values ('bad score', sqlerrm = 'bad score', sqlerrm);
  end;

  begin
    perform public.submit_choppy_score(50000, 11, 10, null);
    insert into choppy_test_out (step, ok, detail) values ('short run', false, 'no raise');
  exception
    when others then
      insert into choppy_test_out (step, ok, detail)
      values ('short run', sqlerrm = 'short run', sqlerrm);
  end;

  begin
    perform public.submit_choppy_score(50000, 30, 2, null);
    insert into choppy_test_out (step, ok, detail) values ('few candles', false, 'no raise');
  exception
    when others then
      insert into choppy_test_out (step, ok, detail)
      values ('few candles', sqlerrm = 'few candles', sqlerrm);
  end;

  begin
    perform public.submit_choppy_score(50000, 12, 100, null);
    insert into choppy_test_out (step, ok, detail) values ('candle rate', false, 'no raise');
  exception
    when others then
      insert into choppy_test_out (step, ok, detail)
      values ('candle rate', sqlerrm = 'candle rate', sqlerrm);
  end;

  begin
    perform public.submit_choppy_score(8000 + 10 * 200000 + 1, 30, 10, null);
    insert into choppy_test_out (step, ok, detail) values ('score vs candles', false, 'no raise');
  exception
    when others then
      insert into choppy_test_out (step, ok, detail)
      values ('score vs candles', sqlerrm = 'score vs candles', sqlerrm);
  end;

  select count(*) into logs from public.score_log where user_id = uid;
  hs := public.submit_choppy_score(50000, 30, 10, null);
  select highscore into prev from public.profiles where id = uid;
  select count(*) into logs2 from public.score_log where user_id = uid;
  insert into choppy_test_out (step, ok, detail)
  values (
    'first score',
    hs = 50000 and prev = 50000 and logs2 = logs + 1,
    hs::text || ' highscore ' || prev::text || ' logs ' || logs2::text
  );

  begin
    perform public.submit_choppy_score(50000, 30, 10, null);
    insert into choppy_test_out (step, ok, detail) values ('slow down', false, 'no raise');
  exception
    when others then
      insert into choppy_test_out (step, ok, detail)
      values ('slow down', sqlerrm = 'slow down', sqlerrm);
  end;

  perform set_config('app.score_ok', '1', true);
  update public.profiles
     set last_score_at = now() - interval '20 seconds'
   where id = uid;
  perform set_config('app.score_ok', '', true);
  update public.score_rate
     set last_at = now() - interval '20 seconds'
   where user_id = uid;

  select day_count into dayc from public.score_rate where user_id = uid;
  select count(*) into logs from public.score_log where user_id = uid;
  begin
    perform public.submit_choppy_score(50000, 30, 10, '{"candles": 99, "time": 30}'::jsonb);
    insert into choppy_test_out (step, ok, detail) values ('stats mismatch', false, 'no raise');
  exception
    when others then
      insert into choppy_test_out (step, ok, detail)
      values ('stats mismatch', sqlerrm = 'stats mismatch', sqlerrm);
  end;
  select day_count into n from public.score_rate where user_id = uid;
  select count(*) into logs2 from public.score_log where user_id = uid;
  insert into choppy_test_out (step, ok, detail)
  values ('mismatch did not log', n = dayc and logs2 = logs, n::text || ' logs ' || logs2::text);

  begin
    perform public.submit_choppy_score(
      50000,
      30,
      10,
      jsonb_build_object('tape', to_jsonb(array_fill(1, array[401])))
    );
    insert into choppy_test_out (step, ok, detail) values ('bad stats', false, 'no raise');
  exception
    when others then
      insert into choppy_test_out (step, ok, detail)
      values ('bad stats', sqlerrm = 'bad stats', sqlerrm);
  end;

  select highscore into prev from public.profiles where id = uid;
  select count(*) into logs from public.score_log where user_id = uid;
  hs := public.submit_choppy_score(40000, 40, 12, null);
  select highscore into n from public.profiles where id = uid;
  select count(*) into logs2 from public.score_log where user_id = uid;
  insert into choppy_test_out (step, ok, detail)
  values (
    'non improving logged',
    hs = prev and n = prev and logs2 = logs + 1,
    hs::text || ' highscore ' || n::text || ' logs ' || logs2::text
  );

  perform set_config('app.score_ok', '1', true);
  update public.profiles
     set last_score_at = now() - interval '20 seconds'
   where id = uid;
  perform set_config('app.score_ok', '', true);
  update public.score_rate
     set last_at = now() - interval '20 seconds',
         day_count = 240
   where user_id = uid;
  begin
    perform public.submit_choppy_score(40000, 40, 12, null);
    insert into choppy_test_out (step, ok, detail) values ('daily limit', false, 'no raise');
  exception
    when others then
      insert into choppy_test_out (step, ok, detail)
      values ('daily limit', sqlerrm = 'daily limit', sqlerrm);
  end;
  update public.score_rate set day_count = 1 where user_id = uid;

  select highscore into prev from public.profiles where id = uid;
  perform set_config('app.score_ok', '', true);
  update public.profiles set highscore = 9 where id = uid;
  select highscore into n from public.profiles where id = uid;
  insert into choppy_test_out (step, ok, detail)
  values ('direct highscore write', n = prev and n <> 9, n::text);
end
$tests$;

select n, step, ok, detail
  from choppy_test_out
 order by n;
```
