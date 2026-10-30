# Versus

Versus is a room of up to 8 players on the same candle seed. It does not count for ranked and it does not grant awards. `awardsLive()` requires `!S.mp`, and a versus countdown sets `S.ranked` to false. Guests can play. Only a signed-in player submits ELO.

The browser talks to Supabase Realtime directly. There is no extra game server. The host's browser decides the round. ELO changes only after enough signed-in players report the same winner.

## Architecture

`mp.js` is an IIFE on `window.ChoppyMP`. It opens one WebSocket to

`wss://<project>.supabase.co/realtime/v1/websocket`

and joins Phoenix channel `realtime:mp-<CODE>`. Broadcast is `self: true`, so the sender also receives the event. Presence key is the player id. The public anon key in `mp.js` is the only credential. Do not add another key.

A second channel, `realtime:mp-board`, carries open-room announcements. It uses broadcast `self: false`. No new table is involved. A private room never publishes.

`game.js` listens with `ChoppyMP.setHandler` and runs the local bird. `auth.js` calls `submit_versus_result`. The SQL lives in `supabase/supabase-versus-v2.sql` and is not applied by the site.

Room codes are 4 characters from `ABCDEFGHJKLMNPQRSTUVWXYZ23456789`. Player ids are 8 characters from the same alphabet and are stored in `sessionStorage` under `choppy-mp-id`. The room stamp `choppy-mp-room` is refreshed on the 2 second heartbeat and cleared on quit.

## Time and reconnect

The steady heartbeat stays at 2 seconds: `hello` in the lobby, `pulse` during a round, plus a Phoenix heartbeat on `phoenix`. `pruneStale()` uses the same timer. A silent player is removed from contention 20 seconds after their last packet (`STALE_MS`). The `goneAt` stamp is that last packet, not the moment of the prune.

A dropped socket retries with backoff 1s, 2s, 4s, 8s, then 15s. The wait resets when the socket opens. `closeSocket()` clears `onclose` before closing so a deliberate leave does not schedule another join. The link states are `off`, `wait`, and `on`. The label is updated on the link event and on phase changes, not inside the frame loop.

If the same browser profile returns to the code within 20 seconds without quitting, any client that still has the round sends `sync`. The snapshot keeps the original `startAt`. The returning client fast-forwards with `mpCatchUp` (at most 1800 steps). During that catch-up the game skips coin sounds, cash grants, perk offers, and award ticks, holds invulnerability, then leaves 2.5 seconds of invulnerability. Flap presses from the missing interval are not replayed.

An explicit quit sends `left` with `quit: true`. That player is not sent `sync` and is not returned to the round.

## Events

Room channel `realtime:mp-<CODE>`:

| Event | Who sends it | What it carries |
| --- | --- | --- |
| `hello` | each client, lobby and on socket open | id, name, uid, ready, alive |
| `pulse` | each client, every 2s during a round | position, btc, candles, lifeT, alive |
| `host` | the host, and a client that adopts the seat | id, name |
| `rules` | the host | the rule object |
| `roster` | the host, while the match has not started | players, host id, code, rules |
| `ready` | a guest | ready flag |
| `rematch` | any client after the series | rematch flag |
| `go` | the host | seed, startAt, sentAt, rules, gameN, wins, seriesT0, players |
| `dead` | the client that dies | lifeT, candles, btc |
| `finish` | the client that reaches the race candle | finishT, candles, btc |
| `lead` | the host | current winner, compact |
| `over` | the host | winner, wins, gameN, seriesOver, bestOf, waitMs |
| `sync` | any client that still has the round, in reply to `hello` | full round snapshot |
| `react` | a client, at most once per 1.2s | reaction id `g` |
| `left` | a client that quits | id, quit true |
| `dropped` | the host | id to remove |
| `full` | the host | id of the player who did not fit |
| `reset` | the host | rules, back to the lobby |

Board channel `realtime:mp-board`:

| Event | Who sends it | What it carries |
| --- | --- | --- |
| `pub` | host of an open room, only while the match has not started, on the same 2s timer | code, mode, bestOf, player count, name |

A repeated `go` with the same seed and game number is ignored. `dead`, `finish`, `lead`, and `over` that arrive before `go` are queued (cap 40) and applied after that `go`.

`tryAdoptHost` runs when the host flag is gone. It elects the lowest id among players who are not marked gone. The elected client announces `host` and, if a round is in progress, sends `sync`.

## Rules

`copyRules` clamps the object:

- `mode`: `last` (one alive, or best life time if everyone is dead), `whale` (best BTC when everyone is dead), `race` (earliest `finishT`, once every player is finished or dead)
- `bestOf`: 1, 3, 5, or 7. First to `ceil(bestOf / 2)`, or the round count reaching `bestOf`, ends the series
- `raceN`: 5 to 210, default 21
- power mix `bull + bear + laser + swan + cold` must total 100. `msig` is forced to 0
- `startCold`: 0 to 99
- `open`: public listing. Default false
- mute flags for theme, effects, and voice

Reactions are the fixed set `gg`, `nice`, `wow`, `rip`, `up`, `down`, `gl`, `hf`. Keys 1–8 send them during a round. A client may send one every 1.2 seconds. A peer's repeat inside 0.7 seconds is ignored. The glyph stays about 1.6 seconds. There is no free text and no new audio. The draw loop reads a glyph only while one is on screen.

After the series, the overlay lists each round winner and, once ELO is final, the rating before and after. Copy result writes that text to the clipboard. It does not include story text.

Quick rematch is the existing `rematch` flag. When every player who has not left marks rematch, the host starts the next series.

## ELO agreement

`submit_versus_result(p_seed, p_winner, p_players, p_duration_s default null)` is `security definer` with `search_path = public`. The old 3-argument overload is dropped so PostgREST is not ambiguous. A null duration still counts, which is how a client from before this file keeps working. The current client sends the series length and, if the server does not know `p_duration_s` yet, retries without it.

`match_key` is `seed` plus the sorted distinct player uuids. The call takes an advisory lock on that key.

- Duration under 15 seconds returns `{status:short}` and writes nothing.
- Unknown profiles, a caller outside the list, or a winner outside the list raise.
- A reporter is limited to 16 distinct new keys per hour.
- Each pair of players is limited to 8 keys per hour. The count is committed rows (final or disputed) plus keys where both have reported and the match is not committed yet. A final row is not counted twice.
- The vote row is upserted. A later vote from the same reporter replaces the winner and does not refresh `created_at`.
- Quorum is `floor(n / 2) + 1`. For 2 players that is both of them. Two different winners cannot both reach quorum.
- Below quorum, with someone still to vote: `{status:pending, have, need}`. ELO does not move.
- Everyone has voted and nobody reached quorum: insert `status = disputed` and return `{status:disputed}`. ELO does not move. Later calls on that key return the same status.
- Quorum met: the same K=24, clamp ±48, floor 100 math as `supabase-elo.sql`. The return is a JSON array of `{id, elo, games, delta}`. A second call returns the stored array and does not add games again.

Every signed-in participant calls this, not only the winner. The client shows pending, updated, no agreement, too short, rate limit, or the guest line, in English and Spanish. Pending is retried a few times. Leaving the room cancels the retry.

The uid list is every uid still on the roster. Clients that drop a different set of players will not share a `match_key` and will stay pending. That is a limit, not a silent ELO change.

## Migration

Do this in the Supabase SQL editor. Do not run it from the game, and do not commit a service key.

1. If `profiles.elo` does not exist yet, run `supabase/supabase-elo.sql` once.
2. Run `supabase/supabase-versus-v2.sql`. It is safe to run again.
3. Do not run `supabase-elo.sql` again after that. Its copy of `submit_versus_result` would replace the agreement function.
4. If the API does not show `p_duration_s`, run `NOTIFY pgrst, 'reload schema';`.
5. Walk the hand cases below with two or three signed-in users. Check `profiles.elo` and `profiles.elo_games` after each one.
6. Ship the client when you want duration and the pending label. The client already falls back to the 3-argument call until step 2 is done.

### Hand cases

Call `submit_versus_result` as each user. ELO may change only on a final array.

1. A reports winner A, players `{A,B}`, duration 40. Expect `pending`. ELO unchanged. No `versus_matches` row.
2. B reports the same winner and the same players. Expect a JSON array. ELO moves once. `elo_games` increases by 1 for A and for B.
3. Repeat step 2. Expect the same array, including the same `delta`. `elo_games` does not increase again.
4. New seed. A says winner A, B says winner B, duration 40. Expect `disputed`. ELO unchanged.
5. New seed. A and B say winner B, C does not report, players `{A,B,C}`, duration 40. Expect a final array (2 of 3). C is in the array. `elo_games` increases for all three.
6. New seed. A, B, and C each name a different winner, duration 40. Expect `disputed`. ELO unchanged.
7. New seed. Both agree, duration 5. Expect `short`. No `versus_reports` row. ELO unchanged.
8. After 8 committed or still-pending keys for that pair in the last hour, the next key returns `limited`. ELO unchanged.

## Threat model and limits

The server does not see the room and does not replay inputs. A client can report any BTC, candle count, finish time, or winner. Agreement only checks that enough accounts in the submitted list name the same winner.

A majority that knows another real `profiles.id` can include that id and name a winner. The function checks that the ids exist and that the caller is in the list. It cannot check that the person was in the room.

Duration is whatever the client sends. Null skips the short-match check so the previous client still records a match. The new client always sends a duration.

`guard_elo` still blocks direct updates of `profiles.elo` unless `app.elo_ok` is set inside this function.

Public rooms are announcements, not a directory with access control. Anyone who knows a code can join until the room is full or the match has started. A started match rejects unknown ids with `dropped`.

The in-memory simulator (`node tests/mp-sim.js`) covers 2, 4, and 8 players, the three modes, best of 1/3/5, host leave, duplicate `go`, death before `go`, race order, high latency, the 20 second silence window, quit versus sync, open-room expiry, and the reaction limit. It writes `tests/out/`, which git ignores. It is not Supabase and it does not run the bird loop.

## Files

- `mp.js` — socket, rules, host, sync, reactions, open-room broadcast
- `game.js` — lobby, round, series recap, ELO report, catch-up
- `auth.js` — `submitVersusResult`
- `i18n.js` — English and Spanish strings
- `supabase/supabase-elo.sql` — original RPC, do not re-apply after v2
- `supabase/supabase-versus-v2.sql` — agreement RPC, not applied from here
- `tests/mp-sim.js` — protocol simulator
