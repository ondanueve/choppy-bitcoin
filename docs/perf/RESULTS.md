# Mobile performance results

Same method as `BASELINE.md`. Before: `139ecdf` / `mp192`, trace `baseline.json`. After: this branch / cache tag `mp193` on `style.css`, `audio.js`, and `game.js`, trace `after.json`. Both runs used the uncompressed Python server, Pixel 5, CPU ×4, Fast 3G, cache disabled for the cold pass.

## Before / after

| Metric | Before | After |
|---|---:|---:|
| Cold time to interactive | 8169 ms | 7773 ms |
| Bytes at interactive | 1,192,286 (11 requests) | 1,046,122 (11 requests) |
| JavaScript at interactive | 9 scripts, 1,114,062 | 7 scripts, 967,637 |
| Bytes at interactive + 3 s | 1,634,792 | 1,050,496 |
| `chance/` bytes at interactive + 3 s | 441,118 (2 images) | 0 |
| Bytes after a 60 s training run | 11,281,782 (52 requests) | 1,537,485 (17 requests) |
| Media bytes after 60 s | 10,088,108 (37 files) | 489,980 (4 files) |
| of which `chance/` wide JPEGs | 37 images, about 10.1 MB | 2 images, 441,118 |
| Frame mean | 17.68 ms | 16.82 ms |
| Frame p50 | 16.7 ms | 16.7 ms |
| Frame p95 | 33.3 ms | 16.8 ms |
| Frame max | 133.3 ms | 50.1 ms |
| Frames per second | 56.6 | 59.5 |
| Frame samples | 3401 | 3570 |
| JS heap used at interactive | 4,131,392 | 3,339,972 |
| JS heap used at end of play | 4,590,940 | 3,533,208 |
| Warm time to interactive | 891 ms | 991 ms |
| Warm encoded bytes | 104 | 104 |
| Console errors | 0 | 0 |
| Startup JS gzip (see `BUDGET.md`) | 279689 | 281168 |

The two acceptance metrics are startup bytes and frame time. Cold transfer at interactive dropped 146,164 bytes (abcjs 126,485 and `mp.js` 24,657, minus the small growth of `game.js`, `audio.js`, and `style.css`). Over 60 seconds of play, transferred bytes dropped by 9.74 MB because the catalog preload is gone. Frame p95 fell from 33.3 ms to 16.8 ms and the worst frame from 133 ms to 50 ms, which matches the decode hitch of those wide JPEGs leaving the frame loop.

Cold time to interactive improved by 396 ms. `game.js` is still about 799 KB on this uncompressed server, so it remains the bandwidth bottleneck. Warm time moved from 891 ms to 991 ms on a single sample, with the same 104 encoded bytes. Treat that 100 ms as noise unless a second warm run repeats it. Cached JS and CSS still transferred 0 encoded bytes.

Both 60 second runs ended with the overlay visible. The after run collected more frames at the 16.7 ms pace, so the p95 change is a shorter tail, not a shift caused by sitting on the game-over sheet.

The 4 media files after 60 seconds are `favicon-32.png` (2,991), `favicon-192.png` (45,871), `landfill-wide.jpg` (208,108), and `taxbill-wide.jpg` (233,010). The two card images are the idle prefetch of the first unlocked cards once training starts. They are fetched, not decoded, until a card is on screen.

JS heap is not the art-memory metric. The decoded-image cap is 3 `Image` objects on a coarse pointer and 6 otherwise. A 1920×800 bitmap is about 6 MB decoded, so the mobile cap is on the order of 18 MB of bitmaps we keep, and older ones drop their `src`.

## What changed

- `index.html` defers `i18n.js`, `supabase-lib.js`, `auth.js`, `run-stats.js`, `audio.js`, and `game.js`, in that order. abcjs and `mp.js` are not in the document.
- `audio.js` injects abcjs (same cdnjs URL, same `sha384` SRI, `crossorigin=anonymous`) from `ensureAbc()`, which `jukePlay` awaits after the synchronous `unlock()`. The options jukebox, once the player owns it, calls `ensureAbc` and redraws when the library arrives. A failed load clears the kick flag so a later open can retry.
- `audio.js` stays in the startup set. `game.js` binds `window.ArcadeAudio` at load time, and iOS only accepts an `AudioContext` created inside the tap. Loading `audio.js` on the first gesture would miss that gesture.
- Versus calls `ensureMp()`, which appends `mp.js?v=mp8` and then `wireMp()`. The lobby markup already rendered with `ChoppyMP` missing. `?room=` / `?mp=` still opens the lobby and loads the script. `mp.js` itself is unchanged.
- Boot no longer calls `preloadChanceArt`. A run with no card schedules an idle prefetch (`requestIdleCallback`, timeout 900 ms) of the next unlocked, unused wide images: 2 on a coarse pointer, 4 otherwise. The card on screen uses `Image` with `fetchPriority=high` and `decode()`, and its post-choice stills are prefetched. Arcs that fail `arcUnlocked` are skipped. The picker does not call `Math.random` and does not write `chanceUsed`. The empty `ARC_VID` video prefetch loop is gone. The visible `<img>` is `fetchpriority="high"`.
- Frame path: `metrics()` writes one reused object; particles and floats compact in place; HUD text is written only when the string changes; `#bc-ups` and the versus pill list rebuild `innerHTML` only when the HTML string changes; the jukebox title reads `clientWidth` / `scrollWidth` only when the label or the stage scale changes; the bull/bear field classes toggle only when the power changes; `numL` checks Spanish before the digit regex, and `esNum` caches up to 80 strings.
- `style.css`: `will-change: transform` applies only while the jukebox title is in the marquee state. `prefers-reduced-motion: reduce` collapses animation and transition duration. The bear-field shake, the army button, and the perk pause lose their animations on that path. The default look is unchanged. `arcResume` and `army-titilar` still animate `box-shadow` when the user has not asked for reduced motion, because a different glow would change the look. `.bc-panel` keeps `backdrop-filter`; `.hide` is `display: none`. Disabled buttons keep their grayscale filter.
- Canvas DPR is unchanged. The existing cap (2, or 1.5 on a low-end device, stepping down when frames stay slow) already kept this host at 960×1280 instead of the 2.75 device ratio. Mean frame time was already near 16.7 ms, and the measured tail was the image decode, so a lower cap would cost sharpness without a measured win.

## Derivative proposal (not in this branch)

One median wide JPEG, `chance/notYet-wide.jpg`, is 283,643 bytes at 1920×800. A local ffmpeg scale to 1280×533, written only under `/tmp`, produced a JPEG of 71,651 bytes and a WebP of 52,440 bytes (about 75% and 82% smaller on that single file). There are 153 `*-wide.jpg` files, about 42.4 MB together. Applying the same ratio to the whole set would be on the order of 30 MB saved. That is one file, not a census, and the originals stay as they are. A follow-up can add `chance/m/<id>-wide.jpg` (or WebP) from an explicit file list, served only when `MOBILE_ART` is set, and archive nothing because nothing here replaces an original.

## How this was tested

Server: `python3 -m http.server 8080 -d /tmp/site` with the repo linked at `/tmp/site/choppy-bitcoin`. Page: `http://127.0.0.1:8080/choppy-bitcoin/`.

Playwright / Chrome, Pixel 5, unthrottled:

- Menu reaches `startChoppy` with no console errors. abcjs and `mp.js` are absent, and no `chance/` request is in flight.
- Versus opens `#mp-host` and loads `mp.js`. Screenshot `shots/versus.png`.
- Sign-in opens `#auth-modal` and shows the email field. Screenshot `shots/auth.png`. No credentials were submitted.
- Options → jukebox while it is locked does not request abcjs.
- `ArcadeAudio.ensureAbc()` loads abcjs with the existing SRI. `ArcadeAudio.jukePlay("bonny")` after `unlock()` reached `jukePlaying() === true`, id `bonny`, progress advancing, duration about 38.9 s, no console errors. The on-screen lyric stage is hardcoded off (`want = false` in `paintJukeUi`), so lyric DOM was not exercised. The synth path is what abcjs is for today.
- Training starts (overlay closes, canvas is 960×1280). Eight flaps, then `dealChoppyArc("landfill")` shows `img.chance-art` for `chance/landfill-wide.jpg` with `fetchpriority="high"`. Screenshot `shots/card.png`. The `chance/` URLs in that session were taxbill, landfill, and nicoWedding. nicoWedding is `after: ["landfill"]`, so it becomes reachable once landfill is used.
- Spanish: `BZ.setLang("es")` turned a `$13.7k` price into `$13,7k` and `0.000000` BTC into `0,000000`. English at the menu kept `$2,284` and `$28.5k`.
- `node --check game.js`, `node --check audio.js`, and `node docs/perf/check-budget.mjs` pass.

The throttled before/after probe is the table above. `node docs/perf/measure.mjs` writes a new trace.

## Not tested

- A full ranked run through to the ending, on a phone or under throttle.
- A signed-in Supabase session, alias save, or score submit.
- Lyric highlighting, because that stage is disabled in the current game.
- A second warm-cache sample.
- Production gzip on the host that serves bitcoinizate. This server does not gzip.
- Seed-paired runs played to completion. The preloader does not call `Math.random` and does not write `chanceUsed`; scoring and the deal roll were not edited. That was reviewed in the diff, not replayed as two identical seeds.
