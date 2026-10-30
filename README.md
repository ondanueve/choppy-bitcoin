# Choppy Bitcoin

Trading arcade in the browser: fly the ₿ through Japanese candlesticks, buy the dip, sell the rip, survive black swans. Scores are play money.

Live: https://bitcoinizate.com/choppy-bitcoin/ — part of [Bitcoinizate](https://bitcoinizate.com/), the hub that lists all projects.

## How it is published

This repo is a plain static site meant to be **mounted at `/choppy-bitcoin/`**. It has no Pages site of its own: the [`bitcoinizate`](https://github.com/ondanueve/bitcoinizate) hub's Pages workflow checks out this repo and copies it under `/choppy-bitcoin/` of bitcoinizate.com. All in-site paths are absolute (`/choppy-bitcoin/...`) for that reason.

The hub redeploys on its own schedule (and on demand), so a push here goes live on the next hub run. To publish right away: `gh workflow run pages.yml -R ondanueve/bitcoinizate`.

| Path | What |
|---|---|
| `index.html`, `game.js`, `style.css`, `audio.js`, `mp.js`, `chance/` | the game |
| `chart.html` | chart view (`/choppy-bitcoin/chart`) |
| `about/` | game landing: how to play, leaderboard, Discord, donations |
| `u/` | public player profile (`/choppy-bitcoin/u/?u=alias`; the hub redirects `/alias` and `/u/alias` here) |
| `profile/` | edit your profile (the hub redirects the old `/dashboard/profile/` here) |
| `auth.js`, `supabase-lib.js`, `run-stats.js` | accounts, cloud scores, run stats (Supabase, public anon key only) |
| `i18n.js` | EN/ES strings (language choice is shared with the hub via `localStorage` key `bitcoinizate-lang`) |
| `supabase/` | SQL for the database (not published) |
| `docs/` | card copy notes (not published) |

## Local preview

Serve it under the same path it has in production:

```sh
mkdir -p /tmp/site && ln -sfn "$PWD" /tmp/site/choppy-bitcoin
python3 -m http.server 8080 -d /tmp/site
# open http://localhost:8080/choppy-bitcoin/
```

Or clone the hub and run its `scripts/assemble.sh` to preview the whole site.

## Pruebas

`node tests/smoke.js` revisa sintaxis, relleno, nombres prohibidos, tamaño de `game.js`/`style.css` frente a `origin/main`, etiquetas `?v=mpNNN`, imágenes `chance/` y paridad EN/ES. Sin red ni dependencias; debe tardar menos de 10 s.

`node tests/boot.js` abre el menú en headless. Sin Playwright ni Chromium sale con código 0 y avisa «omitido». Instalación local, fuera del repo: `npm install --no-save playwright` y `npx playwright install chromium`.

GitHub Actions (workflow `ci`) ejecuta el smoke test en cada pull request y en cada push a ramas distintas de `main`.

## License

MIT, see [LICENSE](LICENSE).
