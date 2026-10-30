# Mobile performance baseline

Measured on 2026-10-30 against commit `139ecdf` (production cache tag `mp192`), before the changes on `grokbuild/rendimiento-movil`. The after numbers are in `RESULTS.md`. Raw traces: `baseline.json` and `after.json`.

## Method

Same script both times: `docs/perf/measure.mjs`.

- Browser: Playwright driving `/usr/bin/google-chrome` headless, device profile Pixel 5 (393×727, `deviceScaleFactor` 2.75, touch, coarse pointer).
- CPU: Chrome DevTools Protocol `Emulation.setCPUThrottlingRate` rate 4.
- Network: Chrome DevTools “Fast 3G”. Latency 562.5 ms, download `(1.6 * 1000 * 1000 / 8) * 0.9` = 180000 bytes/s, upload `(750 * 1000 / 8) * 0.9` = 84375 bytes/s. HTTP cache disabled for the cold run.
- Server: `python3 -m http.server 8080 -d /tmp/site`, with `/tmp/site/choppy-bitcoin` linked at the repo. This server does not gzip. `Network.loadingFinished.encodedDataLength` is the uncompressed body plus response headers (about 200 bytes above the file size on this host). Production transfer will be smaller once a gzip-capable host serves the same files. The before/after comparison uses this server for both runs.
- Time to interactive: wall clock from navigation commit until `window.startChoppy` is a function and `#go` exists. `domContentLoaded` from the navigation entry was 0 on the cold run because it was read at that instant, so the wall-clock figure is the one to compare.
- Then 3 seconds of idle on the menu, then a 60 second training run (`startChoppy(false)`) with a flap every 320 ms and a click on `#go` when its label contains “again”, “otra”, or “intent”.
- Frames: `requestAnimationFrame` deltas during those 60 seconds. Mean, p50, p95, max, and fps.
- Warm run: same browser context, `window.stop()`, then `reload`. A new context would miss the disk cache. Bytes are counted only for requests that finish at or after the reload.
- JS heap comes from `Performance.getMetrics`. It does not include decoded image bitmaps. Art cost is the transferred media bytes.

Command:

```
node docs/perf/measure.mjs http://127.0.0.1:8080/choppy-bitcoin/ /tmp/perf-result.json 60000
```

## Cold startup (cache disabled)

| | Value |
|---|---|
| Time to interactive | 8169 ms |
| Requests / bytes at interactive | 11 / 1,192,286 |
| Document | 1 / 10,802 |
| CSS | 1 / 67,422 (`style.css?v=mp192`) |
| JavaScript | 9 / 1,114,062 |
| Requests / bytes at interactive + 3 s | 17 / 1,634,792 |
| Media at interactive + 3 s | 2 images / 441,118 (`landfill-wide.jpg`, `taxbill-wide.jpg`) |
| Other at interactive + 3 s | 4 / 1,388 (leaderboard fetch + preflight) |

Scripts at interactive, wire bytes: `nozoom.js` 1009, `supabase-lib.js` 14904, `run-stats.js` 15662, `i18n.js` 28437, `auth.js` 30349, `mp.js` 24657, `audio.js` 77155, abcjs 126485, `game.js` 795404.

Resource timing marked `style.css` and `nozoom.js` as render-blocking. The other scripts sat at the end of `body` without `defer`, so the parser still ran them in order before the menu could start a run. abcjs came from cdnjs with the existing SRI hash.

## 60 second training run

| | Value |
|---|---|
| Requests / bytes | 52 / 11,281,782 |
| JavaScript | 9 / 1,114,062 (no further scripts) |
| Media | 37 / 10,088,108 |
| Frames | n=3401 over 60114 ms |
| Frame mean / p50 / p95 / max | 17.68 / 16.7 / 33.3 / 133.3 ms |
| Frames per second | 56.6 |
| Overlay at the end | visible (the run had ended on the game-over sheet) |
| JS heap at interactive | used 4,131,392 / total 5,042,176 / nodes 828 |
| JS heap at end of play | used 4,590,940 / total 6,090,752 / nodes 1288 |
| Console errors | none |

The 37 images are the boot preload of `*-wide.jpg`. `preloadChanceArt` walked the whole catalog at startup (concurrency 2 on a coarse pointer) and again from `startGame`.

## Warm reload

| | Value |
|---|---|
| Time to interactive | 891 ms |
| Encoded bytes at interactive | 104 (document revalidation; JS and CSS encoded length 0) |
| Requests at interactive | 13 |

## What the baseline already did

`canvasDpr()` is `min(DPR_CAP, devicePixelRatio)`. `DPR_CAP` is 1.5 when `hardwareConcurrency <= 4` or `deviceMemory <= 3`, otherwise 2, and it steps down by 0.5 after a sustained `perfEma > 24`. On this host the emulated page reported `devicePixelRatio` 2.75, 8 cores, `deviceMemory` 16, and a canvas backing store of 960×1280. The cap of 2 was already in effect, so the baseline did not paint at 2.75×.

`ARC_VID` is empty, so the video `preload="auto"` loop inside the old preloader transferred nothing. The visible card `<video preload="auto">` path is unused.

## Gzip of the files (separate from the wire trace)

`node:zlib` `gzipSync` level 9, the same function as `check-budget.mjs`. Startup set is `nozoom.js`, `i18n.js`, `supabase-lib.js`, `auth.js`, `run-stats.js`, `audio.js`, `game.js` (abcjs and `mp.js` excluded, because the change removes them from startup):

| File | Bytes | Gzip |
|---|---:|---:|
| nozoom.js | 817 | 341 |
| i18n.js | 28243 | 10211 |
| supabase-lib.js | 14710 | 2855 |
| auth.js | 30155 | 7047 |
| run-stats.js | 15468 | 4928 |
| audio.js | 76961 | 19046 |
| game.js | 795209 | 235261 |
| Startup JS | | 279689 |
| mp.js (not in the startup sum) | 24463 | 6118 |
| style.css | 67235 | 13793 |
