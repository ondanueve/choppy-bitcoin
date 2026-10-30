# Accessibility audit — Choppy Bitcoin

Date: 2026-10-30. Branch `grokbuild/accesibilidad`. Production baseline was `mp192`; changed assets in this branch use `?v=mp193`.

## Method

`axe-core` and Lighthouse are not installed in this environment (no `node_modules`, no `lighthouse` binary). This audit is a manual pass over `index.html`, `about/index.html`, `u/index.html`, `profile/index.html`, and `chart.html`, plus the overlays `game.js` builds with `innerHTML`.

Contrast ratios below were computed locally with the WCAG relative-luminance formula. Keyboard behavior was then checked in headless Chrome 156 against `http://127.0.0.1:8080/choppy-bitcoin/`. That does not replace a screen reader, a physical phone, or a pinch-zoom test.

Screenshot of the Spanish “how to play” panel, including the keyboard list: [help-keyboard-es.png](help-keyboard-es.png).

## Owner decisions (shipped off)

### Page zoom

Blocking zoom is an accessibility barrier. It also stops accidental pinch-zoom during a touch game. The behavior in production stays the default.

Options → Gameplay → **PAGE ZOOM** / **ZOOM DE PÁGINA** (`choppy-allow-zoom`, default off).

- Off: `nozoom.js` keeps today’s multitouch, gesture, ctrl+wheel, and double-click blocks, and the viewport stays `maximum-scale=1, user-scalable=no`.
- On: the viewport allows scaling in menus and on the support pages that read the same flag (`about/` loads `nozoom.js`; `u/` and `profile/` only relax the viewport when the flag is `1`). During `play` and `defense`, the game locks zoom again until the match returns to a menu.
- `chart.html` never locked zoom. It is unchanged.

### Colorblind mode

Not built. `PALETTES` in `game.js` (classic, midnight, terminal, paper, neon, sunset, flower, simple) are themes stored in `choppy-palette`. None is a color-vision palette, and Simple already draws candles without a green/red split.

Buy and Sell already say BUY BTC / SELL BTC (COMPRAR / VENDER). A future mode could add a shape or pattern on up versus down candles, and a second cue on the trade buttons, without replacing the theme list. Leave it off until that design exists. Do not infer a mode from the theme picker.

## Fixes in this branch

| Area | Change |
| --- | --- |
| Language | `i18n.js` already set `document.documentElement.lang` on the game, about, and public profile. `profile/` and `chart.html` now set `lang` from `bitcoinizate-lang` or the browser, and translate the strings they own. |
| Illustrations | Card art `alt` and video `aria-label` come from the card title (`arcAltText`), in EN or ES. Empty `alt` stays empty when there is no picture. Chess diagrams say who moves. They do not include the move. |
| Dialogs | Options, cards, perks, versus lobby, game over, the shortcut sheet, and the auth/profile modals use `role="dialog"` and `aria-modal="true"`, move focus in, trap Tab, and restore focus. Escape closes them. The main menu stays a `region` so Tab can reach Options and Sign in. |
| Keyboard | Space and Enter on a focused button, link, or summary are not stolen by flap. The 250ms window lock ignores keyboard clicks (`detail === 0`) so it still blocks a second accidental tap. |
| Shortcuts | Options → How to play lists the current bindings in EN/ES, plus Tab / Enter / Space. `?` still opens the shortcut sheet. |
| Motion | `prefers-reduced-motion: reduce` and the Gameplay switch (`choppy-reduce-motion`, default off) stop decorative shakes, the army blink, the jukebox marquee, the resume pulse, the award-toast slide, and the canvas strobe. The bird stays visible while invulnerable. The static “ready” gold state remains. |
| Live region | `#a11y-live` is visually clipped. Death and halving are announced in one short line. The periodic cash/price/candle summary is Options → **MATCH ANNOUNCEMENTS** / **ANUNCIOS DE LA PARTIDA**, off by default, and it only writes every 8 seconds from the existing HUD tick. |
| Contrast | Failing text colors were adjusted with CSS. Theme gold fills used as buttons were left alone when the label already passed. |
| Touch | Controls that were under 44px grow to at least 44px under `@media (pointer: coarse)` on the game, and on the small support pages. |

No new libraries. The focus trap is a few dozen lines inside `auth.js` and `game.js`.

## Findings

Severity is the state before this branch. “Fixed” means this branch changes it.

### Critical

1. **Space and Enter never reached a focused control.** The window `keydown` listener treated Space as flap and called `preventDefault`, including when focus was on a button. Fixed: if the active element is a `button`, link, `summary`, or `role="button"`, Space and Enter return before that logic. Flap still runs when focus is on the page during play.

2. **The next control inside a just-opened menu ignored activation for 250ms.** `guardWindowBtn` / `armWindowLock` stop a tap from falling through onto whatever button appears underneath. A keyboard click is trusted and was stopped the same way, so Enter on Gameplay immediately after opening Options did nothing. Fixed: a click with `detail === 0` skips the lock. Pointer clicks are still locked.

3. **The canvas had no text alternative for the match.** One `<canvas id="c">` is the whole playfield. Fixed in part: `role="img"` and a bilingual name. Death (“Liquidated. Run over.” / “Liquidado. Fin de la partida.”) and a spawned halving are written to `#a11y-live`. Awards keep using the existing toast live region. A periodic summary exists and is off by default so the frame loop does not format strings.

4. **Zoom is hard-locked.** `index.html` ships `maximum-scale=1, user-scalable=no`, and `nozoom.js` blocks pinch, gesture, and ctrl+wheel. This stays the default. The visible option above is the proposed alternative and is off.

### High

5. **`lang` did not follow the reader on every page.** `i18n.js` already does `document.documentElement.lang = lang` for pages that load it. Confirmed in Chrome: with `bitcoinizate-lang=es`, the game, about, and `u/` render `lang=es`. `profile/` and `chart.html` do not load `i18n.js`; they now set `lang` themselves. The game’s `<html lang="en">` is only the value until the blocking script at the end of `body` runs.

6. **Modals were not dialogs.** Before this branch, `profileModal` in `auth.js` and the generated overlays had almost no `role="dialog"`, no initial focus, no trap, and no focus return. Fixed for the surfaces in the acceptance list. The ready menu is intentionally not modal:

```js
overlay.setAttribute("role", "region");
overlay.setAttribute("aria-label", chanceLang() ? "Menú principal" : "Main menu");
```

7. **Informative pictures had no alt text.** `chanceArtHtml` now sets `alt` from the card title. Videos get the same string as `aria-label`. `u/` sets the logo alt to “Bitcoinizate” and, when a photo exists, “Avatar of @name” / “Avatar de @name”. The profile preview stays `alt=""` until a file is chosen. Chess:

```js
const alt = (es ? "Diagrama de la posición. " : "Position diagram. ") + who + ".";
```

`who` is only “White to move” or “Black to move”. The solution is not in the alt text. Secret award descriptions are not used as alt text.

8. **Reduced motion covered only the award toast.** `style.css` had a single `prefers-reduced-motion` rule. It now also stops the bear/swan canvas shake, the jukebox title marquee, the resume pulse, and the army-ready blink (the gold border stays). `html[data-reduce-motion="1"]` repeats those rules for the Gameplay switch. Canvas blink and the hero-preview bob check `REDUCE_MOTION` and do no extra work when it is false.

9. **Some text missed 4.5:1.** Measured on the palette hex values (normal text). Button fills are separate from text.

| Pair | Ratio | Result |
| --- | --- | --- |
| Classic fg `#f3efe6` on `#0a0a0c` | 17.24 | pass |
| Classic muted `#8a8680` on `#0a0a0c` | 5.47 | pass |
| Classic gold `#c8960a` on `#0a0a0c` | 7.37 | pass |
| Paper gold `#b07a10` on `#f3ead8` | 3.12 | fail as text |
| Paper fg `#1a1610` on the dark story card `#16120c` | 1.04 | fail |
| Paper gold `#b07a10` on the chess caption `#2a2018` | 4.28 | fail |
| Terminal muted `#5a8a58` on `#020904` | 4.99 | pass |

Fixes, without recoloring classic gold:

- Buy `#e7ffef` on a dark green scrim, Sell `#ffe8e4` on a dark red scrim (about 15:1). Focus outline restored.
- Pause label `#f7f4ee` on `rgba(10,10,12,.78)`.
- `.aw-off` `#b7b3ac` on the dark UI (9.47). Paper and Simple use `#3a3a38` on the light page.
- Paper gold *text* on light surfaces uses `#6e4208` (7.18 on `#f3ead8`). Gold button fills stay `#b07a10`; the dark ink on that fill is 4.83.
- Story cards keep their dark panel. On Paper and Simple, title and body are `#f3efe6`. The TL;DR box stays a light plate with `#1a1610` text. Gold labels on that dark panel use `#f2c14a`.
- Auth card headings and labels on Paper/Simple are light, because the card background is always `#121214`.

Large countdown text (72px) can meet the 3:1 large-text bar with paper gold. It was left on the theme color.

### Medium

10. **Touch targets under 44px.** Several HUD and card controls were shorter than 44px (speed buttons, jukebox buttons, the options close control, arc text toggles, profile inputs in the narrow layout). `@media (pointer: coarse)` raises the game controls to 44px so a fine pointer on desktop stays compact. The narrow profile modal no longer shrinks inputs and buttons to 28px and 32px.

11. **Icon buttons were unlabeled in one language.** Pause, jukebox transport, defense buttons, and the options close control get bilingual `aria-label`s from `syncStaticAria` or from the markup at render time. The about language group uses `data-i18n-label="language"` (`LANGUAGE` / `IDIOMA`).

12. **Shortcuts were undiscoverable on a phone.** Rebinding stays desktop-only (`hover` + fine pointer, or `?kb=1`). The how-to-play panel now lists every `KB_DEFS` binding for both languages.

### Low

13. **Award toast.** Already `role="status"`, `aria-live="polite"`, `pointer-events: none`, removed after 3 seconds. It now also sets `aria-atomic="true"`. Reduced motion keeps it visible (opacity 1) until the timer removes it. It does not take focus.

14. **Support pages.** About and the game share `i18n.js`. `u/` had an empty logo alt and an empty avatar alt. `chart.html` had an unlabeled canvas and an English-only heading. Those are fixed as far as each page’s own copy goes. Chart filters still come from `run-stats.js`, which was already bilingual.

15. **Main menu is a long single column.** Awards and both leaderboards sit in the same tab order as Play. They are real buttons and links. This audit does not add a skip link; that would be a separate layout change.

## Keyboard shortcuts (defaults)

Listed in the game under Options → How to play, in the active language. Rebinding is Options → Gameplay → Hotkeys on a desktop pointer.

| Action | Key |
| --- | --- |
| Jump / flap | Space |
| Buy BTC | B |
| Sell BTC | S |
| DCA | D |
| A.I. Bud | I |
| Trend | T |
| Market | M |
| Pause | P |
| Options | O |
| Battle move | W A S D (arrows also move) |
| Battle fire | Space |
| Battle fury | Q |
| Confirm | Enter |
| Close / back | Escape |
| Card option 1 / 2 / 3 | 1 / 2 / 3 |
| Shortcut sheet | ? |
| Move through controls | Tab, Shift+Tab |
| Activate a focused control | Enter or Space |

## Verification

Headless Chrome 156, cache disabled, `http://127.0.0.1:8080/choppy-bitcoin/` served as `/choppy-bitcoin/`.

Startup, one reload, menu idle:

| Sample | Before edits | After edits |
| --- | --- | --- |
| First contentful paint | 72 ms | 72 ms |
| DOMContentLoaded | 93 ms | 137 ms |
| Load | 292 ms | 375 ms |
| Frames in ~1 s on the menu | 61 | 61 |

Gzip size: `game.js` 235645 → 238886 bytes (+3241). `style.css` 13912 → 14740 bytes (+828). The DCL and load samples are single cache-disabled reloads, so the gap is not a frame-time regression. The play loop was not given per-frame string work. `REDUCE_MOTION` is a boolean checked where a blink already did arithmetic.

Keyboard, trusted `Input.dispatchKeyEvent` (no page console errors):

- Main menu is a region named “Main menu”, not a dialog. Viewport stays non-scalable while page zoom is off.
- Enter on Options opens a dialog labelled by the heading. Focus starts on the first option. Tab moves to the next option and stays inside the dialog.
- Gameplay shows Reduce motion, Match announcements, and Page zoom, all off, with the bilingual note.
- Enter on Reduce motion sets `data-reduce-motion="1"` and `aria-pressed="true"`.
- Escape returns to the options list, then closes it and restores focus to the Options button.
- Enter on Versus opens the lobby dialog, focuses Host, and Back returns to the main menu.
- Enter on Sign in opens the auth dialog, focuses the email field. Escape closes it and restores focus to Sign in.
- Enter on Training hides the menu and shows Pause. Space leaves the menu hidden. P opens a Paused dialog. How to play includes the keyboard list.
- With `prefers-reduced-motion: reduce`, the bear shake animation is `none`, and an award toast has animation `none` and opacity `1`.
- `BZ.setLang("es")` sets `lang=es`, the canvas name to “Campo de juego de Choppy Bitcoin”, and the close button to “Cerrar”.
- `about/`, `u/`, `profile/`, and `chart.html` load with no console exception. With Spanish saved, each has `lang=es`.

Not verified: VoiceOver, NVDA, or TalkBack output; a real pinch gesture; a physical 44px finger target; axe or Lighthouse scores; a full ranked run through a story card and a chess problem.

## Left out on purpose

- No colorblind palette.
- Page zoom stays off unless the player turns it on.
- No skip link, no change to story copy, difficulty, or illustrations.
- No screen-reader library and no new network request.
- `run-stats.js` was not rewritten. Chart control text was already bilingual.
- Rebinding UI stays desktop-only. The list itself is in How to play for everyone.
