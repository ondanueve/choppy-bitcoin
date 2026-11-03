"use strict";
// Halving v4: perk title, x3 earnings, over-the-top sfx, +5% speed, half-strength shake, and the chess cards being gone.
const fs = require("fs");
const path = require("path");
const vm = require("vm");

const ROOT = path.join(__dirname, "..");
const rd = (f) => fs.readFileSync(path.join(ROOT, f), "utf8");
const game = rd("game.js");
const css = rd("style.css");
const i18n = rd("i18n.js");
const halving = rd("halving.js");
const sw = rd("sw.js");

let fails = 0;
function check(label, got, want) {
  if (got !== want) { fails++; console.error("FAIL " + label + ": got " + JSON.stringify(got) + " want " + JSON.stringify(want)); }
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

// 1) Perk dialog title (halving-triggered offers only).
check("title EN", /halvePerkTitle: "Choose your halving upgrades"/.test(i18n), true);
check("title ES", /halvePerkTitle: "Elige tus mejoras de halving"/.test(i18n), true);
{
  const fn = body(game, "function perkOfferTitle()");
  const t = (k) => "<" + k + ">";
  const mk = (S) => new Function("S", "t", "window", "return function perkOfferTitle()" + fn)(S, t, {});
  check("halving chain title", mk({ perkChain: 3, ranked: true })(), "<halvePerkTitle>");
  check("halving chain last perk", mk({ perkChain: 1 })(), "<halvePerkTitle>");
  check("normal offer keeps grabPerk", mk({ perkChain: 0, ranked: false })(), "<grabPerk>");
  check("ranked offer is not the halving title", mk({ perkChain: 0, ranked: true })() !== "<halvePerkTitle>", true);
}

// 2) x3 earnings only while the halving bull lasts, at all three sites.
{
  const he = body(game, "function halveEarn()");
  const f = (S) => new Function("S", "return function halveEarn()" + he)(S);
  check("x3 during halving bull", f({ halveBull: true })(), 3);
  check("x1 otherwise", f({ halveBull: false })(), 1);
  check("x1 undefined", f({})(), 1);
  check("candle pass x3", /grantUsd\(100 \* halveEarn\(\), p\.x \+ pw \* 0\.5, p\.gapY - 50, "gain"\)/.test(game), true);
  check("bull smash x3", /grantUsd\(200 \* halveEarn\(\), p\.x \+ pw \* 0\.5, S\.bird\.y - 66, "gain"\)/.test(game), true);
  check("power-up x3", /grantUsd\(500 \* halveEarn\(\), it\.x, it\.y - 18, "power"\)/.test(game), true);
  check("no un-tripled grants left", /grantUsd\((100|200|500), /.test(game), false);
}

// 3) Speed: 5% over every other power (the black swan runs at the shared 1.28 power speed).
check("speed const", /const HALVE_SPEED = 1\.05;/.test(game), true);
check("speed applied at 3 sites", (game.match(/if \(S\.halveBull\) speed \*= HALVE_SPEED;/g) || []).length, 3);
check("swan has no extra speed", /swanBear[^\n]*speed \*=/.test(game), false);

// 4) Shake: shake-half is exactly half of shake-hard, same timing, only during the halving bull.
function frames(name) {
  const m = css.match(new RegExp("@keyframes " + name + " \\{([\\s\\S]*?)\\n\\}"));
  const out = {};
  if (!m) return out;
  const re = /([\d%,\s]+)\{ transform: translate\(([-\d.]+)(?:px)?, ([-\d.]+)(?:px)?\); \}/g;
  let r;
  while ((r = re.exec(m[1]))) r[1].split(",").forEach((k) => { out[k.trim()] = [parseFloat(r[2]), parseFloat(r[3])]; });
  return out;
}
const hard = frames("shake-hard"), half = frames("shake-half");
check("shake frames", Object.keys(hard).length >= 5 && Object.keys(hard).join() === Object.keys(half).join(), true);
Object.keys(hard).forEach((k) => {
  check("half amplitude " + k, half[k] && Math.abs(half[k][0] - hard[k][0] / 2) < 1e-9 && Math.abs(half[k][1] - hard[k][1] / 2) < 1e-9, true);
});
check("same period as black swan", /\.field\.bear\.swan-bear #c \{ animation: shake-hard 0\.11s infinite; \}/.test(css) && /\.field\.bull\.halve-shake #c \{ animation: shake-half 0\.11s infinite; \}/.test(css), true);
check("reduce-motion off switch", /html\[data-reduce-motion="1"\] \.field\.bull\.halve-shake #c/.test(css), true);
check("low-FX off switch", /\.field\.bull\.halve-shake #c, #bc-open/.test(css), true);
check("class toggled by halving bull", /const fx = S\.power === "BULL" \? \(S\.halveBull \? "h" : "b"\)/.test(game) && /toggle\("halve-shake", fx === "h"\)/.test(game), true);
check("class cleared on reset", (game.match(/"is-play","bull","bear","swan-bear","halve-shake"/g) || []).length >= 2, true);

// 5) Halving sfx voices: audible, louder and richer than the normal ones, distinct per kind, mute-aware.
function mockCtx() {
  const c = { currentTime: 0, sampleRate: 8000, state: "running", oscs: [], nodes: [], srcs: 0 };
  function param(v) {
    const p = { value: v || 0, peak: 0, setValueAtTime: function (x) { p.value = x; },
      linearRampToValueAtTime: function (x) { p.peak = Math.max(p.peak, x); },
      exponentialRampToValueAtTime: function () {}, setTargetAtTime: function () {} };
    return p;
  }
  function node(kind, extra) {
    const n = Object.assign({ kind: kind, out: [], connect: function (to) { this.out.push(to); return to; } }, extra || {});
    c.nodes.push(n);
    return n;
  }
  c.destination = { kind: "destination", out: [] };
  c.createGain = () => node("gain", { gain: param(1) });
  c.createDynamicsCompressor = () => node("comp", { threshold: param(), knee: param(), ratio: param(), attack: param(), release: param() });
  c.createOscillator = () => {
    const n = node("osc", { type: "sine", frequency: param(440), start: function () {}, stop: function () {} });
    c.oscs.push(n);
    return n;
  };
  c.createBiquadFilter = () => node("filter", { type: "lowpass", frequency: param() });
  c.createBuffer = (ch, n) => ({ getChannelData: () => new Float32Array(n) });
  c.createBufferSource = () => { c.srcs++; return node("src", { buffer: null, start: function () {}, stop: function () {} }); };
  return c;
}
function reaches(c, n, seen) {
  seen = seen || [];
  if (n === c.destination) return true;
  if (seen.indexOf(n) >= 0) return false;
  seen.push(n);
  return n.out.some((o) => reaches(c, o, seen));
}
function load() {
  const sb = { console, setTimeout: () => 0, clearTimeout: () => {}, Math, document: {} };
  sb.window = sb; sb.globalThis = sb;
  vm.runInNewContext(halving, sb, { filename: "halving.js" });
  return sb.ChoppyHalving;
}
function audio(ctx, muted) {
  return { muteSfx: () => !!muted, _halving: { ac: () => ctx } };
}
{
  const H = load();
  check("sfx exported", typeof H.sfx, "function");
  check("no audio context -> not handled", H.sfx({ muteSfx: () => false, _halving: { ac: () => null } }, "candle"), false);
  const peak = {};
  const count = {};
  ["candle", "smash", "power"].forEach((kind) => {
    const c = mockCtx();
    const A = audio(c);
    check(kind + " handled", H.sfx(A, kind), true);
    count[kind] = c.oscs.length;
    check(kind + " has voices", c.oscs.length >= 3, true);
    check(kind + " every voice reaches the speakers", c.oscs.length > 0 && c.oscs.every((o) => reaches(c, o)), true);
    const gains = c.nodes.filter((n) => n.kind === "gain" && n.gain.peak > 0);
    peak[kind] = Math.max.apply(null, gains.map((n) => n.gain.peak));
    check(kind + " audible peak", peak[kind] >= 0.15, true);
    check(kind + " goes through a compressor", c.nodes.some((n) => n.kind === "comp" && n.out.indexOf(c.destination) >= 0), true);
    check(kind + " sparkle noise", c.srcs >= 1, true);
  });
  check("smash is richer than candle", count.smash > count.candle, true);
  check("power-up is the biggest", count.power > count.smash && count.power >= 12, true);
  check("power-up has a thump louder than a candle", peak.power > peak.candle, true);
  // combo: consecutive candles climb in pitch, then it resets after a pause
  const H2 = load();
  const c = mockCtx();
  const A = audio(c);
  const lead = [];
  for (let i = 0; i < 4; i++) {
    const before = c.oscs.length;
    c.currentTime = i * 0.3;
    H2.sfx(A, "candle");
    lead.push(c.oscs[before].frequency.value);
  }
  check("candle pitch climbs", lead[1] > lead[0] && lead[2] > lead[1] && lead[3] > lead[2], true);
  c.currentTime = 10;
  const b2 = c.oscs.length;
  H2.sfx(A, "candle");
  check("candle pitch resets after a pause", c.oscs[b2].frequency.value, lead[0]);
  // muted: handled (so the plain sound does not play either) but silent
  const cm = mockCtx();
  check("muted is handled", H.sfx(audio(cm, true), "power"), true);
  check("muted makes no sound", cm.oscs.length, 0);
}

// 6) game.js wiring of the sounds.
{
  const hs = body(game, "function halveSfx(");
  const run = (S, H, A) => {
    const log = [];
    const a = { sfx: { coin: () => log.push("coin"), wave: () => log.push("wave"), power: () => log.push("power") } };
    new Function("S", "window", "A", "return function halveSfx(kind, plain)" + hs)(S, { ChoppyHalving: H }, a)("candle", "coin");
    return log.join();
  };
  check("plain sound outside halving", run({ halveBull: false }, { sfx: () => true }, null), "coin");
  check("halving sound during the bull", run({ halveBull: true }, { sfx: () => true }, null), "");
  check("falls back while halving.js is loading", run({ halveBull: true }, undefined, null), "coin");
  check("falls back when there is no audio context", run({ halveBull: true }, { sfx: () => false }, null), "coin");
  check("candle uses the halving sound", /halveSfx\("candle", "coin"\)/.test(game), true);
  check("bull smash uses the halving sound", /halveSfx\("smash", "wave"\)/.test(game), true);
  check("power-ups use the halving sound", /const sfx = \(n\) => \{ if \(it\.type !== "HALVE"\) halveSfx\("power", n\); else A\.sfx\[n\]\(\); \};/.test(game), true);
  const col = body(game, "function collect(it)");
  check("halving pickup keeps its own fanfare", /A\.sfx\.cap\(\)/.test(col), true);
}

// 7) Chess cards are gone: no card, no lazy data, no precache, awards stay valid but hidden.
check("no chess card", /id: "chess"/.test(game), false);
check("no chess data loader", /chess-data|loadChessData|CHESS_POOL/.test(game), false);
check("chess data not precached", /chess-data/.test(sw), false);
check("no chess text in the card list", /Marek's Chess|ajedrez de Marek/i.test(game), false);
check("chess awards kept valid and retired", ["chessWin", "chess3", "chess7"].every((id) => new RegExp('\\{ id: "' + id + '", cat: "challenge", secret: true, retired: true').test(game)), true);
check("retired awards hidden until earned", /const shown = AWARD_CATALOG\.filter\(\(a\) => !a\.retired \|\| \(reg && owned\[a\.id\]\)\)/.test(game), true);
check("award total ignores hidden ones", /n \+ "\/" \+ shown\.length/.test(game), true);

if (fails) { console.error("halving-v4: " + fails + " failed"); process.exit(1); }
console.log("halving-v4: ok");
