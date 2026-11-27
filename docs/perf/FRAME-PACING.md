# Frame pacing (mp256)

The owner reported that the game sometimes stutters and does not feel smooth. This note covers what was measured, what caused it, and what changed. Before = `origin/main` at `81402f3` (mp252; mp253–mp255 only swapped card art). After = branch `perf/frame-pacing-mp253`, cache tag mp256.

## Cause 1, the main one: fixed step drawn without interpolation

`loop()` runs the sim in fixed 1/60 s steps, which keeps Ranked and Versus deterministic. Each frame drew the state after the **last whole step**. Whenever a frame ran 0 steps or 2 steps, the candles, grid, coins and hero froze for a frame or jumped about 3 px (173 px/s × 1/60 s, more with boosts and the halving speed-up). That happens:

- every few frames on 90, 120 and 144 Hz screens. Most current phones run at 90 or 120 Hz, and the Pixel 5 used in the probe is a 90 Hz phone.
- on 60 Hz screens whenever vsync jitter keeps the accumulator near a step boundary. That depends on the phase, so it comes and goes ("a veces").
- in Versus all the time, because `mpCatchUp()` steps against `Date.now()` in whole milliseconds.

The CPU profile could not show this, because every frame was on time and short. The motion itself was uneven.

**Fix.** The sim is unchanged: still `step(1/60)`, the same order, and the same seeded market. Before each step, `lerpSnap()` records the previous x/y of the hero, candles, power-ups, floating labels, the grid scroll and the ghost clock. `draw()` then sees them blended between the last two steps by the leftover fraction of the accumulator (`alpha`). In Versus that fraction comes from the wall clock. `lerpRestore()` puts every value back right after the draw, inside a `finally`. It also rewrites `p.wx`, and the x of power-ups riding a candle, exactly as an uninterpolated draw would have, because `step()` reads those. Moves larger than 60 px (respawn, reset) are never blended. Objects spawned during the last step are drawn where they are. The battle mode (`drawDefense`) is untouched.

`tests/frame-lerp.js` (in CI) checks four things: the state after an interpolated draw is identical to the state after a plain one, jumps are not blended, the loop still uses the fixed 1/60 step, and Versus records pre-step positions.

## Cause 2: HUD rate tied to frame count

`hudAcc += 0.016` was added per frame, so a 120 Hz phone rebuilt the HUD DOM, with a style and layout pass each time, twice as often as a 60 Hz one. It now adds the real frame time, clamped to 0.1 s. That gives about 8 HUD updates per second on every screen. Measured: 7.5 → 4.0 layouts/s with 120 Hz timestamps.

## Cause 3: `toLocaleString` on the frame path

`fmtUsd` (every floating $ label, every frame) and `fmtCostUsd` (card buttons) used `Number#toLocaleString("en-US")`. It is slow, and its first call sets up ICU (about 35 ms on the throttled phone). They now use `grpInt()`, a plain comma grouper. Its output is identical: checked against `toLocaleString` over ±2·10⁷ in 0.29 and 1234.567 steps, plus edge cases. Numbers at 1e21 and above still go through `toLocaleString`. `palRgba()` (hex → rgba string, about 10 calls per frame) is memoised.

## Measured, not changed

- Script per frame is small: p95 0.5 ms on desktop, about 2 ms on the Pixel 5 at CPU ×4. GC under 0.2 % of samples. No long tasks during play.
- Audio (`createOscillator` per sfx) is under 0.4 % of samples. Not worth touching.
- Card art already loads with `decoding="async"`, `fetchpriority=high` and `img.decode()`. The only long task around a card is the card render itself, `renderOverlay` plus the forced layout in `popOverlay`: 55–64 ms at CPU ×4, about 15 ms unthrottled, while the run is paused on the card. It is unchanged.
- Headless Chrome paints the 2D canvas in software. There, `LayerTreeHost::DoUpdateLayers` (the per-frame copy of the 960×1280 canvas) is 55–85 % of the throttled main thread, and the wave scenario drops frames at CPU ×4 both before and after. On phones with GPU canvas this copy is not on the main thread. On phones where Chrome falls back to software canvas, the existing adaptive DPR (2 → 1.5 → 1 after sustained slow frames) is what helps. It was left as is.
- Not measured: a real 90/120 Hz phone, Safari/iOS, a real Versus room with two players, ghost playback against a real daily ghost (no Supabase calls were made).

## Method

`docs/perf/frames.mjs` serves the repo at `/choppy-bitcoin/` with a probe hook appended to `game.js` in memory. The site never loads that hook. The probe plays three 12 s scenarios with an auto-flapper and `invuln` held up:

- **play**: plain candles.
- **waves**: bull, bear, black swan and halving bull every 2.5 s, with the shake classes.
- **cards**: an arc card dealt every few seconds with its 1920×800 art, then picked.

It records the rAF interval, the script time inside rAF, long tasks, Chrome `Performance.getMetrics` (layouts/s), a CPU profile, and the x where `draw()` put the first candle on every frame. "Candle motion error" is how far that on-screen move was from the candle's speed × the frame's time. A hitch is an error above 1.5 px (half a step).

Headless Chrome paints at 60 Hz. `FAKE_HZ=90` / `120` feeds the game loop the vsync timestamps of a 90/120 Hz screen, with jitter, which is exactly what `loop(now)` reads on such a phone. `docs/perf/pacing-sim.js` is the same loop logic as a pure model over 8 × 60 s runs per refresh rate, including Versus wall-clock stepping.

```
node docs/perf/frames.mjs <repo> out.json desktop 12
node docs/perf/frames.mjs <repo> out.json mobile 12              # Pixel 5, CPU x4
FAKE_HZ=90 JITTER_MS=0.4 node docs/perf/frames.mjs <repo> out.json mobile 12
node docs/perf/pacing-sim.js
```

## Results: browser probe (before → after)

| Profile | Scenario | Candle motion error p95 / p99 / max px (before → after) | Hitch frames > 1.5 px | Frame p95 / p99 ms | Dropped frames > 20 ms | Script per frame p95 / p99 / max ms | Long tasks (max ms) | HUD layouts/s |
|---|---|---|---|---|---|---|---|---|
| Desktop 1280×900 DPR2, 60 Hz | play | 0.02 / 0.03 / 0.03 → 0 / 0 / 0 | 0% → 0% | 16.7 / 16.8 → 16.7 / 16.8 | 0 → 0 | 0.5 / 0.6 / 3 → 0.5 / 0.7 / 3.2 | 0 (0) → 0 (0) | 7.5 → 7.5 |
| Desktop 1280×900 DPR2, 60 Hz | waves | 0.02 / 0.04 / 0.05 → 0 / 0 / 0 | 0% → 0% | 16.7 / 16.8 → 16.7 / 16.8 | 0 → 0 | 0.7 / 1 / 7 → 0.7 / 0.8 / 5.4 | 0 (0) → 0 (0) | 7.6 → 7.6 |
| Desktop 1280×900 DPR2, 60 Hz | cards | n/a (sim paused on card) | n/a | 16.8 / 16.8 → 16.7 / 16.8 | 1 → 1 | 0.5 / 0.6 / 2 → 0.4 / 0.5 / 0.7 | 0 (0) → 0 (0) | 8.2 → 8.2 |
| Pixel 5, CPU ×4, 60 Hz | play | 0.02 / 0.03 / 0.03 → 0 / 0 / 0 | 0% → 0% | 16.7 / 16.8 → 16.8 / 16.8 | 1 → 1 | 1.8 / 2.3 / 5.1 → 1.7 / 2.2 / 10.1 | 0 (0) → 0 (0) | 7.5 → 7.6 |
| Pixel 5, CPU ×4, 60 Hz | waves | 0.02 / 0.04 / 188.02 → 0 / 0 / 188 | 0.1% → 0.3% | 16.8 / 33.4 → 16.8 / 33.4 | 17 → 23 | 2.8 / 3.8 / 18.4 → 2.6 / 3.7 / 19.6 | 0 (0) → 0 (0) | 7.4 → 7.6 |
| Pixel 5, CPU ×4, 60 Hz | cards | n/a (sim paused on card) | n/a | 16.7 / 16.8 → 16.7 / 16.8 | 1 → 2 | 1.6 / 2.2 / 4.6 → 1.6 / 2.1 / 3.5 | 1 (55) → 1 (64) | 8.2 → 8.2 |
| Pixel 5, CPU ×4, 60 Hz ±0.4 ms jitter | play | 0.12 / 0.14 / 0.17 → 0 / 0 / 0 | 0% → 0% | 17.19 / 17.31 → 17.19 / 17.31 | 0 → 0 | 2 / 2.6 / 14.9 → 1.8 / 2.9 / 10.9 | 1 (54) → 0 (0) | 7.5 → 7.5 |
| Pixel 5, CPU ×4, 60 Hz ±0.4 ms jitter | waves | 0.15 / 0.18 / 188.1 → 0 / 0 / 0.17 | 0.4% → 0% | 17.21 / 17.39 → 17.22 / 17.39 | 0 → 0 | 2.7 / 3.9 / 18.3 → 2.8 / 3.3 / 18.9 | 0 (0) → 0 (0) | 7.3 → 7.2 |
| Pixel 5, CPU ×4, 60 Hz ±0.4 ms jitter | cards | n/a (sim paused on card) | n/a | 17.22 / 17.36 → 17.22 / 17.36 | 0 → 0 | 2 / 2.7 / 3.9 → 1.4 / 1.8 / 2.5 | 0 (0) → 1 (60) | 8.2 → 8.2 |
| Pixel 5, CPU ×4, 90 Hz timestamps | play | 2.94 / 3 / 3.06 → 0 / 0 / 0 | 33.8% → 0% | 11.63 / 11.75 → 11.63 / 11.75 | 0 → 0 | 1.9 / 2.2 / 13.7 → 1.8 / 2.4 / 11 | 0 (0) → 0 (0) | 7.5 → 5.4 |
| Pixel 5, CPU ×4, 90 Hz timestamps | waves | 3.83 / 3.94 / 4.09 → 0 / 0 / 188 | 33.8% → 0.1% | 11.65 / 11.83 → 11.65 / 11.83 | 0 → 0 | 2.9 / 4 / 19.1 → 2.5 / 3.3 / 19.4 | 0 (0) → 0 (0) | 7.3 → 5.5 |
| Pixel 5, CPU ×4, 90 Hz timestamps | cards | n/a (sim paused on card) | n/a | 11.67 / 11.8 → 11.66 / 11.8 | 0 → 0 | 1.8 / 2.3 / 4.4 → 1.4 / 1.9 / 5.2 | 1 (54) → 1 (56) | 8.2 → 6.2 |
| Pixel 5, CPU ×4, 120 Hz timestamps | play | 2.91 / 2.98 / 3.02 → 0 / 0 / 0 | 94.4% → 0% | 8.73 / 8.81 → 8.73 / 8.81 | 0 → 0 | 1.9 / 2.8 / 21.2 → 1.8 / 2.2 / 11.2 | 0 (0) → 0 (0) | 7.5 → 4.0 |
| Pixel 5, CPU ×4, 120 Hz timestamps | waves | 3.88 / 3.89 / 4.06 → 0 / 0 / 0.43 | 91.9% → 0% | 8.74 / 8.88 → 8.74 / 8.88 | 0 → 0 | 2.7 / 3.8 / 21.3 → 2.5 / 3.4 / 23.1 | 0 (0) → 0 (0) | 7.6 → 4.0 |
| Pixel 5, CPU ×4, 120 Hz timestamps | cards | n/a (sim paused on card) | n/a | 8.74 / 8.85 → 8.74 / 8.85 | 0 → 0 | 1.8 / 2.9 / 8.7 → 1.5 / 2.1 / 3.5 | 1 (60) → 1 (57) | 8.2 → 4.8 |

The single 188 px "max" in a waves row is the probe, not the game. A bull wave smashed the first candle, and the next one shares its gap height, so the probe took the jump to the next candle as one move.

## Results: pacing model (worst of 8 runs, 60 s each)

```
mode        display   | before p95/p99/max px  hitch% | after p95/p99/max px  hitch%
solo/ranked 60 Hz     | 2.88/2.88/2.88        49.8  | 0.11/0.13/0.14           0
solo/ranked 59.94 Hz  | 0/2.88/2.89            2.1  | 0.11/0.13/0.14           0
solo/ranked 90 Hz     | 1.92/1.92/1.92        33.3  | 0.11/0.13/1.02           0
solo/ranked 120 Hz    | 1.44/1.44/1.44           0  | 0.08/0.09/1.44           0
solo/ranked 144 Hz    | 1.68/1.68/1.68        41.7  | 0.08/0.09/1.2            0
versus      60 Hz     | 0/0/0                    0  | 0.12/0.23/0.29           0
versus      59.94 Hz  | 0/2.89/2.89            2.8  | 0.12/0.23/0.29           0
versus      90 Hz     | 1.92/1.92/1.92        33.3  | 0.19/0.19/0.19           0
versus      120 Hz    | 1.44/1.44/1.44           0  | 0.12/0.23/0.23           0
versus      144 Hz    | 1.68/1.68/1.68        41.7  | 0.18/0.18/0.36           0
```

## Screens

`shots/mp256/`: Pixel 5, Spanish, CPU ×4, after the change: `qa-play.png`, `qa-swan.png` (black swan shake), `qa-halving.png`, `qa-perk.png`.
