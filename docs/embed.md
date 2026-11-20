# Embed: today's Ranked in an iframe

For blogs, sites and stream overlays. The embed is the normal game page with `?embed=1`.
It plays today's Ranked (the UTC daily seed, same rules and scoring) with lighter chrome and a link back to the full game.

## Snippet

```html
<iframe src="https://bitcoinizate.com/choppy-bitcoin/?embed=1" width="400" height="640" title="Choppy Bitcoin · Ranked" style="border:0;max-width:100%" allow="autoplay; clipboard-write; web-share; fullscreen" loading="lazy"></iframe>
```

- Players copy it from **Options → Embed** (ES: **Opciones → Insertar**) in the game, or from the "Embed today's Ranked" section on the about page.
- Width 400 and height 640 are the defaults. The stage scales to fit any frame size without scrolling. Taller frames (for example 400×700) leave more room around the board.
- `&lang=es` or `&lang=en` fixes the language. Without it the game follows the visitor's saved choice or browser language.
- `clipboard-write` lets "Copy result" and "Share" work inside the frame. Without it they fall back to a select-and-copy path.
- Do not add `sandbox`. If a host does, the game still runs (storage falls back to memory), but links need `allow-popups`.

## What changes inside the embed

| Full game | Embed |
| --- | --- |
| Title: Ranked, Training, challenge link, Versus, awards, all boards | Title: Ranked only, reset clock, today's board (when the board SQL is live), sign-in, link back |
| Donation block on the end screens | "Play the full game ↗" link on the end screens |
| Jukebox widget in the HUD | Hidden (the jukebox perk still works from Options) |
| Options: offline app, feedback, embed | Hidden |
| `?seed=` challenges, `?room=` / `?versus=1` | Ignored. The embed always plays today's Ranked |
| Service worker (opt-in offline app) | Never registered or removed from inside a frame |

Kept: the 3-step first-run tutorial (skippable), the battle tutorial, all game rules, Ranked scoring, run stats, share and copy result, language and sound options.

A persistent "Play the full game ↗" link sits under the stage. Every link opens a new tab (`target="_blank" rel="noopener"`). The game never touches `window.top`.

## Sign-in and storage inside a third-party frame

- Sign-in is email or alias plus password against Supabase. No cookies or popups, so it works inside the frame.
- Browsers partition third-party storage. A player signed in on bitcoinizate.com is signed out inside an embed on another site and has to sign in there once. Guests see a one-line note that signing in puts the score on today's board.
- If storage is blocked outright (sandboxed frames, strict privacy settings), an inline script in `<head>` swaps `localStorage` and `sessionStorage` for in-memory stores. The game runs. Settings, onboarding and the session last only for that page view.

## Framing headers

GitHub Pages (behind Fastly) sends no `X-Frame-Options` and no `Content-Security-Policy` / `frame-ancestors` for `/choppy-bitcoin/`. The repo has no CSP meta tag, and `sw.js` does not add framing headers. Nothing blocks the embed.

## Tests

- `node tests/embed.js`: flag, snippet, backlink, hidden chrome, ignored URL params, service-worker guard, bilingual strings, and the head script with blocked storage.
