# Awards and scores: what a player can fake

This note is the threat model for phase 1. It describes the hole that exists before `supabase/supabase-awards-guard.sql` and `supabase/supabase-score-v2.sql` are applied, what those files change, and what they deliberately leave alone. Nothing here was run against production.

The client is a static page. A signed-in player can call the Supabase REST API with the public anon key and their own JWT. Row level security on `profiles` lets that player update their own row (`profiles_update_own`, `auth.uid() = id`). A trigger can put a column back. A column without a trigger accepts whatever the client sends.

## Awards

Today `window.persistAwards` writes `profiles.awards` with a direct update. There is no trigger on that column. Any signed-in player can set the array to any text ids, including ids they never earned and ids that are not in the catalog.

Impact: the public profile at `/choppy-bitcoin/u/` renders `profiles.awards`. A faked id shows the award name. Secret awards stay hidden in the client until the id is in that array, so writing the id also reveals the in-game description on that profile. Leaderboard trust and the later NFT phase both depend on this column meaning "the server agreed".

What the new SQL changes:

- `trg_guard_awards` restores `profiles.awards` unless the transaction set `app.awards_ok = '1'`. The same pattern as `guard_elo` and `app.elo_ok`. A direct update from the browser no longer sticks.
- `grant_awards(p_ids, p_run)` is the only path granted to `authenticated`. It keeps ids that are on the whitelist copied from `AWARD_CATALOG` (46 ids). `tests/award-ids.js` fails if `game.js`, `u/index.html`, and the SQL arrays diverge.
- `regular`, `veteran`, `collector`, and `curator` are computed in the function from `score_log` and `award_grants`. Ids for those four sent by the client are ignored.
- Stat awards have to match a recorded run: `longHaul` needs some `score_log.candles >= 1000`, `marathon` needs `>= 2100`, and the end-of-run trading awards need a `stats_summary` (or the best-score `profiles.run_stats`, when a log row has the same candle count) of at least 420 candles. The thresholds match `runAwardIds()` in `game.js`.
- Story awards are not a replay. They need a recorded ranked run (`score_log.candles >= 3`), and `fourth`, `noAid`, and `freeNation` need `>= 420`. The function also enforces the one-choice pairs (`married` / `runaway`, `notForSale` / `sellout`, `familyOffice` / `classicFartface`) and the chain the cards already imply: `engaged` before the wedding choice, `babyBoard` before the baby choice, `chessWin` then `chess3` then `chess7`, and `landowner` → `nodes100` → `declared` → `beachHolds` → `fourth` before `noAid` and `freeNation`. `miner` and `citadel` need `landowner` and do not gate `fourth`.
- At most 46 ids per call (the client sends the whole owned set). At most 80 calls per 10 minutes, and at most 46 brand-new rows per 24 hours. Repeats do not count toward the daily cap. Crossing the call cap does not raise: the counter has to commit, and the function returns the current list with nothing new. A bad shape (`bad ids`, `bad run`) does raise, so the legacy absorb in that call rolls back with it.
- The first successful call copies whitelist ids already stored on `profiles.awards` into `award_grants` with evidence `{"legacy": true}` before it judges the new ids. That way a player who hits the RPC before `migrate_legacy_awards()` does not lose the column, and a held `married` still blocks a new `runaway`.

What this does not prove:

- The server does not resimulate a run, a story card, or a chess position. A modified client that has one logged ranked run can still ask for story ids whose candle floor and prerequisites are met. Rejecting those without a replay would also reject honest grants: several story awards are stored before `submit_choppy_score` runs.
- `p_run` is size-checked and then ignored. Authorization reads `score_log` and `profiles.run_stats` only.
- Legacy rows are copied, not judged. Cheated awards already on `profiles.awards` stay until a person reads `award_audit_suspicious()` and deletes the rows they do not trust. The migration does not delete them.
- `regular` and `veteran` count `score_log` rows with `candles >= 420`. Until `supabase-score-v2.sql` has been logging every accepted ranked run for a while, that count is only old high scores. Honest veterans will be short. Do not delete `regular` or `veteran` from the audit on day one.
- The client still toasts and keeps a local award when the server skips it. The next `syncAwards` merges the server list in and does not delete local ids the server refused. The public profile shows the server column, not the local set.
- `profiles.awards` stays world-readable, which is how `/u/` works today. Earned secret ids remain visible as ids. `award_grants` is stricter: anon can read a row only when the id is not secret, or the row is their own.

## Scores and run_stats

`submit_choppy_score` already rejects an unsigned call, a non-positive score, a score above 2.1e12, a life under 12 seconds, fewer than 3 candles, a candle rate above `life * 5 + 8`, a score above `8000 + candles * 200000`, a missing profile, and a second submit within 15 seconds of `last_score_at`. It only writes a new high, and only the new high is inserted into `score_log`. `p_stats` is stored as `profiles.run_stats` with no shape check. The public chart reads that object, including the tape.

A player cannot put an absurd score on the board without a matching candle count. They can submit any score inside that band, and any JSON object as `p_stats`, as often as once every 15 seconds when they beat their high score. They can also write `highscore`, `score_time`, `last_score_at`, and `run_stats` with a direct update if no guard is installed. The brief records a production guard on the high score that honors `app.score_ok`. That trigger is not in this repo. `docs/security/MIGRATION.md` tells you to read it before applying `guard_highscore`.

Impact: a plausible fake score moves the ranked board. A fake `run_stats` changes the public chart and, once awards trust that JSON, backs a fake `maxi`, `longHaul`, or similar. `score_log` today cannot vouch for a long run that was not a new high, so a server-side `longHaul` check against the old log would reject honest players.

What `supabase-score-v2.sql` changes, without breaking the current client (same argument names, same early error strings, `p_stats` still optional):

- `p_stats` may be null. When it is present it must be an object of at most 750 KB, with tape arrays of at most 400 points, at most 80 marks, and at most 20,000 trades. The client caps the chart tape at 240 and marks at 36. Trades are not capped in `game.js`, so the server cap is high on purpose. Counters, booleans, `endBtc`, and the money fields have to sit in a wide but finite range. `candles` and `time` inside the object, when present, have to agree with `p_candles` and `p_life`. A failure raises `bad stats` or `stats mismatch` before `score_rate` moves, and the client retries once without `p_stats`.
- Every accepted submit is inserted into `score_log` with `logged_at` and a small `stats_summary` (no tape). `profiles.highscore`, `last_score_at`, `score_time`, and `run_stats` still change only when the score is a better high score. A worse run must not replace the chart tape.
- 240 accepted submits per user per rolling day, plus the old 15 second gap, now also measured on non-record submits via `score_rate`. 240 is one hour of submits spaced 15 seconds apart. The new error string is `daily limit`.
- `trg_guard_highscore` restores `highscore`, `score_time`, `last_score_at`, and `run_stats` unless `app.score_ok = '1'`. The RPC sets that flag only for an improving write.

What this still does not prove: the tape is not executed. A client can send `sells: 0`, `swans: 3`, and a score inside the candle band without having played that way. Closing that gap means simulating the market, the perk deck, and the input stream on the server. That is out of scope for this phase, and a strict replay would false-reject honest runs whenever the client and the server physics drifted.

The client now calls `submit_choppy_score` for a ranked run even when the score does not beat the board, so the new log has rows to point at. Versus sets `S.ranked = false` before the round, and test mode sets `S.testCheat`. `saveBest` still skips both, and `submitNewHighScore` still drops guests, `human === false`, life under 12 seconds, and fewer than 3 candles. After a successful score RPC the client calls `persistAwards` again, because story and live awards are granted in the run before the score exists.

## Alias

`change_alias` checks the shape and uniqueness. `loadUserProfile` and the profile page still try `profiles.update({ username })` first. `profiles_update_own` allows that write, so the uniqueness check is skipped whenever the direct update succeeds. Two accounts can display the same alias. `email_for_alias` returns the email stored on the profile to `anon`. Neither is changed here. Fixing the alias means stopping the direct username write and reviewing that email RPC on their own.

## Avatar

`profiles.avatar` is a text column with no check. The profile page writes it with the same direct update. `/u/` assigns it to an image `src`. A player can store any string the column will hold. This phase does not add a guard, a length cap, or a host allow-list.

## Guests, versus, and test mode

Guests have no `currentUser`, so `persistAwards` returns immediately and no award RPC is sent. Versus is not ranked. Test mode is marked cheated and does not persist a ranked score or call `mergeAwards`. The server never sees those modes except as "no row in `score_log`". That is enough to refuse stat awards. It is not enough to tell a forged story award from a real one after a single honest ranked run, which is the residual risk above.

## Local flag that used to wipe the server

`game.js` sets `localStorage["choppy-reset-420"]` to `"1"` once and clears local scores and awards on that browser. `auth.js` used to treat that flag as "delete server awards and the high score, and skip the merge" on every later `loadUserProfile`. The flag is set by the game for everyone who loads the current client, so the wipe ran on every signed-in load and `syncAwards` never ran. The flag check is gone from `auth.js`. Login merges `profiles.awards` again. The one-shot local clear in `game.js` is unchanged. Server rows are not deleted by that flag anymore.
