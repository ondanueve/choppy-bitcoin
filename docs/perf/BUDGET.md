# Performance budget

Brief 01 is not in this tree (`tests/smoke.js` and `.github/` are absent), so the deterministic check lives here instead of a smoke test.

## Startup JavaScript gzip

`node docs/perf/check-budget.mjs` gzips these files with `zlib.gzipSync` level 9 and sums them:

`nozoom.js`, `i18n.js`, `supabase-lib.js`, `auth.js`, `run-stats.js`, `audio.js`, `game.js`.

| | Gzip bytes |
|---|---:|
| Before (`139ecdf`) | 279689 |
| After this branch | 281168 |
| Ceiling | 290000 |

abcjs and `mp.js` are outside this sum. They load when the jukebox opens and when Versus opens. Adding either one back to `index.html` fails the intent of the budget even if the gzip sum still passes.

The +1479 bytes are the proximity preloader, the lazy `mp.js` / abcjs hooks, and the frame-path rewrites in `game.js` (+1150 gzip) and `audio.js` (+329 gzip).

## Requests before the menu can start a run

On the Fast 3G method in `BASELINE.md`:

- Document + `style.css` + the seven scripts above.
- Zero requests to cdnjs.
- Zero requests to `mp.js`.
- Zero requests under `chance/` while the menu is idle.

Measured after the change: 7 scripts and 967,637 wire bytes of JavaScript at interactive, and no `chance/` image during the 3 seconds after the menu appeared. Favicons and the leaderboard fetch are separate and already existed.

## Time to interactive

On this host, cold time to interactive moved from 8169 ms to 7773 ms. The ceiling for a regression on the same machine, same script, and same uncompressed server is 10 seconds. That number is host-dependent, so `check-budget.mjs` does not enforce it.

## Art during a run

On a coarse pointer the preloader may hold 3 decoded `Image` objects (`ART_KEEP`) and may prefetch 2 further unlocked cards (`ART_NEAR`) plus the post-choice stills of the card on screen. Desktop uses 6 and 4. A 60 second training run that deals no card should transfer the two nearest unlocked wide JPEGs (landfill and taxbill today, about 441 KB) and no other `chance/` file.
