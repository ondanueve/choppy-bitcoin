"use strict";
// Keyboard (mp210 / mp217): arrow focus nav + Enter confirm in perk selection,
// arc card options and the options menu; Left=buy / Right=sell during normal
// candle play only; P toggles pause, including the post-perk/arc hold pause.
const fs = require("fs");
const path = require("path");

const ROOT = path.join(__dirname, "..");
const game = fs.readFileSync(path.join(ROOT, "game.js"), "utf8");
const css = fs.readFileSync(path.join(ROOT, "style.css"), "utf8");

let fails = 0;
function check(label, got, want) {
  if (got !== want) {
    fails++;
    console.error("FAIL " + label + ": got " + JSON.stringify(got) + " want " + JSON.stringify(want));
  }
}

function body(src, head) {
  const at = src.indexOf(head);
  if (at < 0) return "";
  let depth = 0, i = src.indexOf("{", at);
  for (let j = i; j < src.length; j++) {
    if (src[j] === "{") depth++;
    else if (src[j] === "}" && --depth === 0) return src.slice(i, j + 1);
  }
  return "";
}

// ---- source contracts -------------------------------------------------------
check("overlay arrows call kbNav", /ovOpen && \/\^Arrow\/\.test\(e\.key\) && kbNav\(overlay, e\)/.test(game), true);
check("Enter confirm is wired in open overlays", /ovOpen && !e\.repeat[\s\S]{0,400}kbIs\(e, "confirm"\)/.test(game), true);
check("confirm does not click the first of many card choices", /kbClickFirst\("\[data-ch\]"\)/.test(game), false);
check("confirm still accepts form submit, ok and #go", /kbClickFirst\("#arc-move-form button\[type=submit\]"\)/.test(game) && /kbClickFirst\("\[data-ch=\\"ok\\"\]"\)/.test(game) && /kbClickFirst\("#go"\)/.test(game), true);

check("left/right trade only in play with no overlay", /S\.phase === "play" && !ovOpen && \(e\.code === "ArrowLeft" \|\| e\.code === "ArrowRight"\)/.test(game), true);
check("left buys and right sells", /if \(e\.code === "ArrowLeft"\) buyBtc\(\); else sellBtc\(\)/.test(game), true);

// Battle handles arrows and returns before the candle trade branch.
{
  const handler = body(game, "window.addEventListener(\"keydown\"");
  const defAt = handler.indexOf("S.phase===\"defense\"");
  const tradeAt = handler.indexOf("ArrowLeft\") buyBtc");
  const defReturn = handler.indexOf("return;", defAt);
  check("battle arrows are handled before candle trades", defAt >= 0 && tradeAt > defReturn && defReturn > defAt, true);
  check("battle left/right move the tank, they do not trade", /e\.code==="ArrowLeft"\|\|kbIs\(e,"left"\)\)h\.l=1/.test(handler) && /e\.code==="ArrowRight"\|\|kbIs\(e,"right"\)\)h\.r=1/.test(handler), true);
}

check("P unpauses the post-perk/arc hold", /if \(S\.arcHold \|\| S\.phase === "chance"\) \{[\s\S]*?kbIs\(e, "pause"\) && S\.phase === "paused" && !S\.mp\) \{ e\.preventDefault\(\); togglePause\(\); return; \}/.test(game), true);
check("P is not swallowed when a slider or checkbox is focused", /toggleIn && kbIs\(e, "pause"\)/.test(game), true);
check("togglePause from paused clears arcHold and resumes", /else if \(S\.phase === "paused"\) \{\s*S\.optPanel = null;\s*S\.arcHold = false;\s*setPhase\(S\.optBack \|\| "play"\);/.test(game), true);

// Auto-focusing the first perk/arc/option button made Enter confirm a choice
// that was not visibly selected (:focus-visible is off for programmatic focus).
{
  const sync = body(game, "function a11ySyncOverlay()");
  check("a11y does not auto-focus perk or arc or options choices", /\.perk-list button|\.arc-actions button|\.opt-menu button|button\.cta/.test(sync), false);
  check("a11y still focuses name and lobby text fields", /#bc-name-in, #arc-move-in, #mp-host, #mp-code/.test(sync), true);
  check("a11y falls back to the dialog title", /h1, h2, \.arc-title/.test(sync) && /tabIndex = -1/.test(sync), true);
}

check("overlay keyboard focus has a gold outline", /#overlay button:focus-visible/.test(css) && /outline: 3px solid #f2a900/.test(css), true);

check("EN note: arrows move, Enter confirms, left buys, right sells", /Arrow keys also move in battle; ↑ also jumps; ← buys and → sells during candles\. In menus, arrows move between options and Enter confirms/.test(game), true);
check("ES note is neutral tú, no voseo", /Flechas también mueven en batalla; ↑ también salta; ← compra y → vende durante las velas\. En menús, las flechas cambian de opción y Enter confirma/.test(game), true);
{
  const voseo = new RegExp(["pod", "és|ten", "és|quer", "és|eleg", "í|hac", "é|mir", "á"].join(""));
  const note = game.slice(game.indexOf("Flechas también"), game.indexOf("Flechas también") + 400);
  check("no voseo in the keyboard note", voseo.test(note), false);
}

// ---- kbNav behavior ---------------------------------------------------------
{
  const fn = body(game, "function kbNav(box,e)");
  check("kbNav extracted", fn.length > 80, true);
  const document = { activeElement: null };
  const kbNav = new Function("document", "return function kbNav(box,e)" + fn)(document);

  function el(id, extra) {
    const classList = { contains: (c) => (extra && extra.className || "").split(/\s+/).indexOf(c) >= 0 };
    return Object.assign({
      id: id,
      disabled: false,
      offsetParent: {},
      classList: classList,
      focused: false,
      getAttribute: () => null,
      focus: function () { this.focused = true; document.activeElement = this; },
      scrollIntoView: function () {}
    }, extra || {});
  }
  function ev(key) {
    return { key: key, prevented: false, stopped: false, preventDefault() { this.prevented = true; }, stopPropagation() { this.stopped = true; } };
  }
  function boxOf(list) {
    return { querySelectorAll: () => list };
  }

  const perks = [el("p1"), el("p2"), el("p3")];
  const box = boxOf(perks);
  document.activeElement = null;
  const e1 = ev("ArrowDown");
  check("first ArrowDown focuses the first perk", kbNav(box, e1) && perks[0].focused && document.activeElement === perks[0], true);
  check("arrow is consumed", e1.prevented && e1.stopped, true);
  const e2 = ev("ArrowRight");
  check("ArrowRight moves to the next perk", kbNav(box, e2) && document.activeElement === perks[1], true);
  const e3 = ev("ArrowDown");
  check("ArrowDown moves to the third perk", kbNav(box, e3) && document.activeElement === perks[2], true);
  const e4 = ev("ArrowDown");
  check("ArrowDown wraps to the first perk", kbNav(box, e4) && document.activeElement === perks[0], true);
  const e5 = ev("ArrowUp");
  check("ArrowUp wraps to the last perk", kbNav(box, e5) && document.activeElement === perks[2], true);
  const e6 = ev("ArrowLeft");
  check("ArrowLeft moves back", kbNav(box, e6) && document.activeElement === perks[1], true);
  check("non-arrow is ignored", kbNav(box, ev("Enter")), false);

  const hidden = el("hidden", { offsetParent: null });
  const disabled = el("disabled", { disabled: true });
  const opts = [el("opt-x", { className: "opt-x" }), el("lang"), el("sound")];
  const optBox = boxOf(opts.concat([hidden, disabled]));
  document.activeElement = null;
  check("first ArrowDown skips the close button and hidden or disabled items", kbNav(optBox, ev("ArrowDown")) && document.activeElement === opts[1], true);
  document.activeElement = null;
  check("first ArrowUp lands on the last real option", kbNav(optBox, ev("ArrowUp")) && document.activeElement === opts[2], true);
  document.activeElement = opts[1];
  check("once moving, arrows can still reach the close button", kbNav(optBox, ev("ArrowUp")) && document.activeElement === opts[0], true);
  check("empty box is a no-op", kbNav(boxOf([]), ev("ArrowDown")), false);
}

// ---- togglePause, including the hold-pause resume ---------------------------
{
  const fn = body(game, "function togglePause()");
  check("togglePause extracted", fn.length > 80, true);
  function run(seed) {
    const S = Object.assign({ mp: false, phase: "play", optPanel: null, optBack: "play", arcHold: false, perkPick: "" }, seed || {});
    const log = [];
    const api = new Function("S", "renderOverlay", "confirmPerk", "setPhase", "armWindowLock",
      "function togglePause()" + fn + "\nreturn { togglePause: togglePause, S: S };")(
      S,
      function () { log.push("render"); },
      function () { log.push("confirmPerk"); },
      function (p) { log.push("phase:" + p); S.phase = p; },
      function () { log.push("lock"); }
    );
    api.togglePause();
    return { S: api.S, log: log.join(",") };
  }
  let r = run({ phase: "play" });
  check("P from play pauses", r.S.phase === "paused" && r.S.arcHold === false && /phase:paused/.test(r.log), true);
  r = run({ phase: "paused", optBack: "play", arcHold: true, optPanel: null });
  check("P from post-perk/arc hold resumes play", r.S.phase === "play" && r.S.arcHold === false && r.log === "phase:play", true);
  r = run({ phase: "paused", optBack: "ready", arcHold: false });
  check("P from a ready-origin pause returns to ready", r.S.phase === "ready" && r.log === "phase:ready", true);
  r = run({ phase: "chance", arcHold: false });
  check("P does not leave an open arc card", r.S.phase === "chance" && r.log === "", true);
  r = run({ mp: true, phase: "play" });
  check("P is ignored in versus", r.S.phase === "play" && r.log === "", true);
  r = run({ phase: "perk", optPanel: "menu" });
  check("P on a perk screen closes the options sheet first", r.S.phase === "perk" && r.S.optPanel === null && r.log === "render", true);
  r = run({ phase: "perk", optPanel: null, perkPick: "dca" });
  check("P on a perk screen with a pick confirms it", r.log === "confirmPerk", true);
}

// buy/sell themselves refuse anything but live candle play
{
  check("buyBtc requires phase play", /function buyBtc\(\) \{\s*if \(S\.phase !== "play"/.test(game), true);
  check("sellBtc requires phase play", /function sellBtc\(\) \{\s*if \(S\.phase !== "play"/.test(game), true);
}

if (fails) { console.error("keyboard: " + fails + " failed"); process.exit(1); }
console.log("keyboard: ok");
