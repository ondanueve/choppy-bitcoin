# Ranked ghost of the day

While playing today's Ranked chart, the best run of the day that has a recorded path flies as a semi-transparent Choppy, labelled "Today's #1 · @alias" / "N.º 1 de hoy · @alias".

## Who sees it

- Only solo Ranked runs on today's UTC chart (`ghostLive()` in `game.js`). That includes a `?seed=` link with today's seed.
- Not in Training, Versus, test loadouts, or seeded challenges from other days.
- If you are #1 yourself, you race your own best, labelled "Your best today" / "Tu mejor de hoy". Beating your best is the next step for a #1, so it stays useful.
- If #1 has no stored path (for example the path upload failed), the best-ranked run that has one is shown, with its real rank ("Today's #2").

## Recording

`game.js` keeps a tiny recorder: every 0.2 s of play time, it stores the bird height as a share of the field height, and the distance scrolled so far. Play time stops while a card, perk, or battle is open, so paused screens do not shift the path. The ghost's x position is `bird.x + (ghost distance - your distance)` at the same play time. A ghost with a faster scroll (laser, halving) pulls ahead. When it is off screen, an edge label shows where it is. When the ghost's run ends, it fades out over 1.2 s.

## Encoding

`ghost.js` loads lazily and is not on the startup path. The format is `g1.<dtMs>.<unit>.<body>`, with 3 base64url characters per sample:

- 12 bits of height.
- 6 bits of distance step in `<unit>` px. The step is error-diffused, so the total never drifts more than one unit.

A path holds at most 4000 samples and 12,100 characters. Longer runs are decimated by doubling the interval. A 90 s run is about 1.4 KB.

## Storage

`supabase/supabase-daily-ghost.sql` must be pasted after `supabase/supabase-daily.sql`. It adds:

- `daily_ghosts`: one path per user per UTC day, with RLS on and no direct access.
- `submit_daily_ghost(score, ghost, day)`: signed-in users only. It checks the format, length, and sample cap. It keeps the path only if the score equals the user's stored best for today, and only if the path is no longer than that run's `life_t` + 5 s. It allows one write every 10 s.
- `daily_top_ghost(day)`: same order as `daily_board`. It returns rank, alias, score, ghost, and `is_me`.

The client sends the path only after `submit_daily_score` succeeds, and only once per better score. Every failure is silent: if there is no Supabase client, the function is missing, the request errors or fails offline, or the payload is bad, there is simply no ghost.
