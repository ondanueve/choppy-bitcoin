"use strict";
// Halving theme QA: the Japanese fanfare starts at the catch, stays audible
// through the bull, is not masked by the main theme, and is not tied to the
// jukebox volume. Also re-states the bull speed / shake / duration / x3 rules.
const fs = require("fs");
const path = require("path");
const vm = require("vm");

const ROOT = path.join(__dirname, "..");
const rd = (f) => fs.readFileSync(path.join(ROOT, f), "utf8");
const game = rd("game.js");
const audio = rd("audio.js");
const halving = rd("halving.js");
const css = rd("style.css");

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

// ---- bull rules (speed, shake, duration, x3) --------------------------------
const HU = Number((game.match(/const HALVE_UP = (\d+);/) || [])[1]);
const HB = Number((game.match(/const HALVE_BACK = (\d+);/) || [])[1]);
const HS = Number((game.match(/const HALVE_SPEED = ([0-9.]+);/) || [])[1]);
console.log("halving wave: HALVE_UP=" + HU + "s HALVE_BACK=" + HB + "s duration=" + (HU + HB) + "s HALVE_SPEED=" + HS);
check("halving lasts at least 30 s uninterrupted", HU + HB >= 30, true);
check("actual duration is 32 s", HU + HB, 32);
check("speed is 5% over the shared power speed", HS, 1.05);
check("shared power speed (black swan included) is 1.28", (game.match(/if \(S\.power === "BULL" \|\| S\.power === "BEAR" \|\| S\.laserOn\) speed \*= 1\.28;/g) || []).length >= 2, true);
check("halving multiplies HALVE_SPEED at 3 sites", (game.match(/if \(S\.halveBull\) speed \*= HALVE_SPEED;/g) || []).length, 3);
const effective = 1.28 * HS;
console.log("effective speeds: black swan 1.28, halving bull " + effective.toFixed(4) + " (" + ((effective / 1.28 - 1) * 100).toFixed(1) + "% faster)");
check("effective speed is 5% faster than the black swan", Math.abs(effective / 1.28 - 1.05) < 1e-12, true);
check("x3 earnings while the bull lasts", /function halveEarn\(\) \{ return S\.halveBull \? 3 : 1; \}/.test(game), true);
check("shake-half is used only during the halving bull", /\.field\.bull\.halve-shake #c \{ animation: shake-half 0\.11s infinite; \}/.test(css), true);
check("black swan uses full shake-hard", /\.field\.bear\.swan-bear #c \{ animation: shake-hard 0\.11s infinite; \}/.test(css), true);
{
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
  const keys = Object.keys(hard);
  check("half-strength shake has the same timing as the swan", keys.length >= 5 && keys.join() === Object.keys(half).join(), true);
  const ok = keys.every((k) => half[k] && Math.abs(half[k][0] - hard[k][0] / 2) < 1e-9 && Math.abs(half[k][1] - hard[k][1] / 2) < 1e-9);
  check("halving vibration is 50% of the black swan's", ok, true);
}

// ---- theme length and wiring ------------------------------------------------
const bpm = Number((halving.match(/var BPM = (\d+);/) || [])[1]);
const introBars = Number((halving.match(/for \(i = 0; i < (\d+); i\+\+\) add\("i"/) || [])[1]);
const verseBars = Number((halving.match(/for \(i = 0; i < (\d+); i\+\+\) add\("v"/) || [])[1]);
const chorusBars = Number((halving.match(/for \(i = 0; i < (\d+); i\+\+\) add\("c"/) || [])[1]);
const climaxBars = Number((halving.match(/for \(i = 0; i < (\d+); i\+\+\) add\("x"/) || [])[1]);
const bars = introBars + verseBars + chorusBars + climaxBars;
const step = 60 / bpm / 4;
const pass = bars * 16 * step;
console.log("fanfare: BPM=" + bpm + " bars=" + bars + " (intro " + introBars + " verse " + verseBars + " chorus " + chorusBars + " climax " + climaxBars + ") first pass=" + pass.toFixed(2) + "s");
check("156 BPM taiko-and-shamisen fanfare is present", /Sunrise Over the Torii/.test(halving) && /taiko-and-shamisen fanfare in D yo scale/.test(halving) && bpm, 156);
check("24-bar arrangement", bars, 24);
check("first pass outlasts the 32 s bull", pass > 32, true);
check("loops from the verse after the first pass", /var LOOP_AT = 64;/.test(halving) && /if \(stepI >= TOTAL\) stepI = LOOP_AT;/.test(halving), true);

{
  const col = body(game, "function collect(it)");
  const hv = col.slice(col.indexOf('it.type === "HALVE"'));
  check("catch starts the bull cycle", /beginCycle\("BULL", "HALVE"\)/.test(hv), true);
  check("catch plays the cap pickup sting", /A\.sfx\.cap\(\)/.test(hv), true);
}
check("beginCycle loads halving.js and kicks audio", /if \(k === "HALVE"\) \{ S\.halveBull = true; ensureHalving\(\); \}/.test(game) && /kickTheme\(\);/.test(body(game, "function beginCycle(")), true);
check("each play frame syncs the fanfare while the bull is on", /H\.syncTheme\(A\)/.test(body(game, "function ensureHalving()")) || /H\.syncTheme\(A\)/.test(body(game, "function halveFrame(")), true);
check("lazy load still starts the theme if the catch already happened", /s\.onload[\s\S]*?S\.halveBull[\s\S]*?syncTheme/.test(body(game, "function ensureHalving()")), true);

// Main bull theme is held (silenced) while the fanfare is running.
check("halveHold skips the looping main theme", /if \(muteTheme \|\| halveHold\) \{ musicStep\+\+; return; \}/.test(audio), true);
check("syncTheme sets hold when the fanfare is live", /h\.hold\(intensity > 0 && !muted && !cue\)/.test(halving), true);
check("mute theme also mutes the fanfare", /h\.muted && h\.muted\(\)/.test(halving) && /muted: function \(\) \{ return muteTheme; \}/.test(audio), true);

// Volume must not follow the jukebox fader: a user who turned the jukebox
// down (or to 0) would otherwise get a quiet or silent fanfare.
check("fanfare volume is not the jukebox fader", /h\.vol\(\)/.test(halving) || /return jukeVol/.test(halving), false);
check("fanfare has its own level around 0.9", /themeVol|FANFARE_VOL|var vol = 0\.9/.test(halving), true);
check("cap sting is audible", /beep\(523\.25, 0\.16, "sine", 0\.05/.test(audio) && /beep\(1046\.5, 0\.42, "triangle", 0\.06/.test(audio), true);

// ---- behavioural theme start / hold / mute ---------------------------------
function mockCtx() {
  const c = { currentTime: 0, sampleRate: 8000, state: "running", oscs: [], nodes: [], srcs: 0 };
  function param(v) {
    const p = { value: v || 0, peak: 0, setValueAtTime: function (x) { p.value = x; p.peak = Math.max(p.peak, x); },
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
function loadH() {
  const sb = { console, setTimeout: () => 0, clearTimeout: () => {}, Math, document: {} };
  sb.window = sb; sb.globalThis = sb;
  vm.runInNewContext(halving, sb, { filename: "halving.js" });
  return sb.ChoppyHalving;
}
{
  const H = loadH();
  const ctx = mockCtx();
  let held = false, muted = false;
  const A = {
    muteTheme: () => muted,
    _cueHeld: false,
    _halving: { ac: () => ctx, hold: (v) => { if (v != null) held = !!v; return held; }, muted: () => muted }
  };
  check("idle intensity is 0", H.intensity(), 0);
  H.tick(0.05, true);
  check("tick while the bull is on raises intensity", H.intensity() > 0, true);
  H.syncTheme(A);
  check("syncTheme starts the fanfare and holds the main theme", held === true && ctx.oscs.length > 0, true);
  const voices = ctx.oscs.length;
  const gains = ctx.nodes.filter((n) => n.kind === "gain" && n.gain.peak > 0);
  const peak = gains.length ? Math.max.apply(null, gains.map((n) => n.gain.peak)) : 0;
  console.log("fanfare voices at start: " + voices + " peak gain " + peak.toFixed(3));
  check("fanfare has several voices at the catch", voices >= 4, true);
  check("fanfare peak is audible (lead or kick)", peak >= 0.2, true);

  // mute: hold releases, no new notes after a reset+mute
  muted = true;
  H.syncTheme(A);
  check("muting theme releases the main-theme hold", held, false);

  const H2 = loadH();
  const ctx2 = mockCtx();
  let held2 = false;
  const A2 = { muteTheme: () => false, _cueHeld: false, _halving: { ac: () => ctx2, hold: (v) => { if (v != null) held2 = !!v; return held2; }, muted: () => false } };
  H2.tick(0.6, true);
  check("full fade-in in 0.6 s", H2.intensity(), 1);
  H2.syncTheme(A2);
  const mid = ctx2.oscs.length;
  // Run past the 32 s bull: intensity stays 1 while want is on, and notes keep scheduling.
  for (let t = 0; t < 34; t += 0.5) { ctx2.currentTime = t; H2.tick(0.5, true); H2.syncTheme(A2); }
  check("fanfare still scheduling notes past 32 s", ctx2.oscs.length > mid + 20, true);
  check("hold stays on for the whole bull", held2, true);
  H2.tick(1, false);
  H2.syncTheme(A2);
  check("ending the bull releases the hold after the fade", held2 === false || H2.intensity() < 1, true);
}

if (fails) { console.error("halving-theme: " + fails + " failed"); process.exit(1); }
console.log("halving-theme: ok");
