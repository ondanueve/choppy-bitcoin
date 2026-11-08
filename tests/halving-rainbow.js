"use strict";
// Halving rainbow: lazy module API, band order, fade, and chiptune jukebox rules.
const fs = require("fs");
const path = require("path");
const vm = require("vm");

const ROOT = path.join(__dirname, "..");
const src = fs.readFileSync(path.join(ROOT, "halving.js"), "utf8");
const game = fs.readFileSync(path.join(ROOT, "game.js"), "utf8");
const html = fs.readFileSync(path.join(ROOT, "index.html"), "utf8");
const audio = fs.readFileSync(path.join(ROOT, "audio.js"), "utf8");

let fails = 0;
function check(label, got, want) {
  if (got !== want) {
    fails++;
    console.error("FAIL " + label + ": got " + JSON.stringify(got) + " want " + JSON.stringify(want));
  }
}

new vm.Script(src, { filename: "halving.js" });

const sandbox = {
  console: console,
  setTimeout: function () { return 0; },
  clearTimeout: function () {},
  Math: Math,
  document: {
    createElement: function () { throw new Error("draw touched the document"); }
  }
};
sandbox.window = sandbox;
sandbox.globalThis = sandbox;
vm.runInNewContext(src, sandbox, { filename: "halving.js" });
const H = sandbox.ChoppyHalving;
check("api", !!H && typeof H.tick === "function" && typeof H.draw === "function" && typeof H.syncTheme === "function" && typeof H.reset === "function", true);

const NAMES = ["deep red", "red-orange", "orange", "yellow-orange", "yellow", "light green", "green", "teal-green", "blue"];
check("band count", H.BANDS.length, 9);
check("band order", H.BANDS.map((b) => b.name).join("|"), NAMES.join("|"));
H.BANDS.forEach((b, i) => {
  check("hex " + i, /^#[0-9A-Fa-f]{6}$/.test(b.hex), true);
});
function rgb(hex) {
  const n = parseInt(hex.slice(1), 16);
  return { r: n >> 16, g: (n >> 8) & 255, b: n & 255 };
}
const cols = H.BANDS.map((b) => rgb(b.hex));
check("deep red is red", cols[0].r > cols[0].g && cols[0].r > cols[0].b, true);
check("yellow is bright", cols[4].r > 180 && cols[4].g > 160 && cols[4].b < 80, true);
check("green is green", cols[6].g > cols[6].r && cols[6].g > cols[6].b, true);
check("blue is blue", cols[8].b > cols[8].r && cols[8].b > cols[8].g, true);

check("fade in", H.tick(H.FADE_IN, true), 1);
check("stays up", H.tick(2, true), 1);
const mid = H.tick(H.FADE_OUT / 2, false);
check("half out", Math.abs(mid - 0.5) < 1e-9, true);
check("fade out", H.tick(H.FADE_OUT / 2, false), 0);
check("stays down", H.tick(1, false), 0);
H.reset();
check("reset", H.intensity(), 0);

const ctx = new Proxy({}, { get: function () { throw new Error("draw call"); } });
H.draw(ctx, { W: 480, H: 640 });
check("silent draw", true, true);

// A recording AudioContext: every node remembers what it connects to, so a test can walk from a voice to ctx.destination.
function mockCtx(state) {
  const c = { currentTime: 0, sampleRate: 8000, state: state || "running", resumed: 0, oscs: [], nodes: [] };
  function param(v) {
    return { value: v == null ? 0 : v, setValueAtTime: function () {}, linearRampToValueAtTime: function () {},
      exponentialRampToValueAtTime: function () {}, setTargetAtTime: function (x) { this.value = x; } };
  }
  function node(kind, extra) {
    const n = Object.assign({ kind: kind, out: [], connect: function (to) { this.out.push(to); return to; }, disconnect: function () {} }, extra || {});
    c.nodes.push(n);
    return n;
  }
  c.destination = { kind: "destination", out: [] };
  c.resume = function () { c.resumed++; c.state = "running"; return null; };
  c.createGain = function () { return node("gain", { gain: param(1) }); };
  c.createDynamicsCompressor = function () {
    return node("comp", { threshold: param(), knee: param(), ratio: param(), attack: param(), release: param() });
  };
  c.createOscillator = function () {
    const n = node("osc", { type: "sine", frequency: param(440), started: null, start: function (t) { this.started = t; }, stop: function () {} });
    c.oscs.push(n);
    return n;
  };
  c.createBiquadFilter = function () { return node("filter", { type: "lowpass", frequency: param() }); };
  c.createBuffer = function (ch, n) { return { getChannelData: function () { return new Float32Array(n); } }; };
  c.createBufferSource = function () { return node("src", { buffer: null, start: function () {}, stop: function () {} }); };
  return c;
}

// Does a node reach ctx.destination, and does every gain on the way stay above zero?
function audible(c, n, seen) {
  seen = seen || [];
  if (n === c.destination) return true;
  if (seen.indexOf(n) >= 0) return false;
  seen.push(n);
  if (n.kind === "gain" && !(n.gain.value > 0)) return false;
  return n.out.some(function (o) { return audible(c, o, seen); });
}

function fakeAudio(opts) {
  const ev = [];
  let paused = false;
  let on = !!opts.playing;
  let stopped = false;
  opts.ctx = opts.ctx || mockCtx(opts.state);
  const origOsc = opts.ctx.createOscillator;
  opts.ctx.createOscillator = function () { ev.push("beep"); return origOsc.call(opts.ctx); };
  const api = {
    ctx: opts.ctx,
    _cueHeld: false,
    _resumeJuke: false,
    muteTheme: function () { return !!opts.muted; },
    jukePlaying: function () { return on && !paused && !stopped; },
    jukePaused: function () { return paused && !stopped; },
    jukePause: function () {
      if (on && !paused && !stopped) { paused = true; ev.push("pause"); }
    },
    jukeResume: function () {
      ev.push("resume");
      paused = false;
    },
    _halving: {
      held: false,
      ac: function () { return opts.ctx; },
      hold: function (v) { if (v != null) this.held = !!v; return this.held; },
      muted: function () { return !!opts.muted; },
      vol: function () { return 0.8; },
      onMute: null
    },
    ev: ev,
    stopJuke: function () { stopped = true; paused = false; on = false; }
  };
  return api;
}

function beeps(ev) { return ev.filter((x) => x === "beep").length; }
function pauses(ev) { return ev.filter((x) => x === "pause").length; }
function resumes(ev) { return ev.filter((x) => x === "resume").length; }

H.reset();
const quiet = fakeAudio({ playing: true, muted: false });
H.syncTheme(quiet);
check("idle beeps", beeps(quiet.ev), 0);
check("idle pause", pauses(quiet.ev), 0);
check("idle hold", quiet._halving.held, false);

H.reset();
const muted = fakeAudio({ playing: true, muted: true });
H.tick(H.FADE_IN, true);
H.syncTheme(muted);
check("muted beeps", beeps(muted.ev), 0);
check("muted pause", pauses(muted.ev), 0);
H.tick(H.FADE_OUT, false);
H.syncTheme(muted);
check("muted resume", resumes(muted.ev), 0);

H.reset();
const off = fakeAudio({ playing: false });
H.tick(H.FADE_IN, true);
H.syncTheme(off);
check("no juke still plays", beeps(off.ev) > 0, true);
check("no juke no pause", pauses(off.ev), 0);
check("hold while on", off._halving.held, true);
H.tick(H.FADE_OUT, false);
H.syncTheme(off);
check("no juke no resume", resumes(off.ev), 0);
check("hold off", off._halving.held, false);

H.reset();
const on = fakeAudio({ playing: true });
H.tick(H.FADE_IN, true);
H.syncTheme(on);
check("pauses when playing", pauses(on.ev), 1);
check("notes while on", beeps(on.ev) > 0, true);
const notes = beeps(on.ev);
H.syncTheme(on);
check("does not pause twice", pauses(on.ev), 1);
H.tick(H.FADE_OUT, false);
H.syncTheme(on);
check("resumes once", resumes(on.ev), 1);
H.syncTheme(on);
check("does not resume twice", resumes(on.ev), 1);
check("stopped notes", beeps(on.ev) >= notes, true);

H.reset();
const stopped = fakeAudio({ playing: true });
H.tick(H.FADE_IN, true);
H.syncTheme(stopped);
check("stopped setup pause", pauses(stopped.ev), 1);
stopped.stopJuke();
H.tick(H.FADE_OUT, false);
H.syncTheme(stopped);
check("no resume after user stop", resumes(stopped.ev), 0);

H.reset();
const cued = fakeAudio({ playing: true });
H.tick(H.FADE_IN, true);
H.syncTheme(cued);
const beforeCue = beeps(cued.ev);
cued._cueHeld = true;
H.syncTheme(cued);
check("cue does not resume", resumes(cued.ev), 0);
check("cue adds no notes", beeps(cued.ev), beforeCue);
cued._cueHeld = false;
H.syncTheme(cued);
check("theme returns without a second pause", pauses(cued.ev), 1);
H.tick(H.FADE_OUT, false);
H.syncTheme(cued);
check("resumes after cue", resumes(cued.ev), 1);

check("relative loader", /s\.src = "halving\.js\?v=mp215"/.test(game), true);
check("not absolute", game.indexOf("/choppy-bitcoin/halving.js") < 0, true);
check("not in index", html.indexOf("halving.js") < 0, true);
check("draw hook", /drawWorldBg\(ctx, wash\);\s*halveFrame\(ctx\);\s*drawTape\(/.test(game), true);
check("audio hold", /muteTheme \|\| halveHold/.test(audio), true);
check("audio api", /A\._halving = \{/.test(audio), true);

// ---- Audio is really wired: oscillators reach ctx.destination through gains above zero.
H.reset();
const wired = fakeAudio({ playing: true });
H.tick(H.FADE_IN, true);
H.syncTheme(wired);
check("voices scheduled", wired.ctx.oscs.length >= 8, true);
check("every voice reaches destination", wired.ctx.oscs.every((o) => audible(wired.ctx, o)), true);
const busGains = wired.ctx.nodes.filter((n) => n.kind === "gain" && n.out.some((o) => o.kind === "comp"));
check("one master bus into a compressor", busGains.length, 1);
check("bus gain is audible", busGains[0].gain.value >= 0.3, true);
check("compressor feeds destination", wired.ctx.nodes.some((n) => n.kind === "comp" && n.out.indexOf(wired.ctx.destination) >= 0), true);
check("first note starts now", wired.ctx.oscs.every((o) => o.started >= 0 && o.started < 1), true);

H.reset();
const asleep = fakeAudio({ playing: false, state: "suspended" });
H.tick(H.FADE_IN, true);
H.syncTheme(asleep);
check("suspended context is resumed", asleep.ctx.resumed >= 1, true);

H.reset();
const stalled = fakeAudio({ playing: false });
stalled.ctx.currentTime = 50;
H.tick(H.FADE_IN, true);
H.syncTheme(stalled);
check("late context still plays", stalled.ctx.oscs.length > 0 && stalled.ctx.oscs.every((o) => o.started >= 50), true);

// Pause keeps the sequence and the song position; resume plays again without a second juke pause.
H.reset();
const pz = fakeAudio({ playing: true });
H.tick(H.FADE_IN, true);
H.syncTheme(pz);
check("pause api", typeof H.pause, "function");
H.pause();
const heard = pz.ctx.oscs.length;
check("pause keeps intensity", H.intensity(), 1);
pz.ctx.currentTime = 10;
H.tick(0.05, true);
H.syncTheme(pz);
check("resume plays", pz.ctx.oscs.length > heard, true);
check("resume does not pause juke again", pauses(pz.ev), 1);

// The song covers the 30 s sequence: sample the first pass in steps of 0.5 s of audio time.
H.reset();
const long = fakeAudio({ playing: false });
H.tick(H.FADE_IN, true);
H.syncTheme(long);
let stamp = 0;
const marks = [];
for (let tt = 0; tt <= 34; tt += 0.4) {
  long.ctx.currentTime = tt;
  H.syncTheme(long);
}
const lastStart = Math.max.apply(null, long.ctx.oscs.map((o) => o.started));
check("music keeps coming for 30 s", lastStart > 33, true);
const gaps = {};
long.ctx.oscs.forEach((o) => { gaps[Math.floor(o.started)] = 1; });
let silent = 0;
for (let sec = 0; sec < 33; sec++) if (!gaps[sec]) silent++;
check("no silent second in the first 33 s", silent, 0);
H.tick(0.05, false);
const before = long.ctx.oscs.length;
H.syncTheme(long);
check("finale plays when the sequence ends", long.ctx.oscs.length > before, true);

// Rainbow tip: every band narrows to a point at the right edge (under the surfer).
const calls = [];
const g2d = new Proxy({}, { get: function (t, k) {
  if (k === "createLinearGradient") return function () { return { addColorStop: function () {} }; };
  return function () { calls.push(k); };
} });
const sb = { console: console, setTimeout: function () { return 0; }, clearTimeout: function () {}, Math: Math };
sb.window = sb; sb.globalThis = sb;
sb.document = { createElement: function () { return { width: 0, height: 0, getContext: function () { return g2d; } }; } };
vm.runInNewContext(src, sb, { filename: "halving.js" });
check("tip converges in source", /converge\(x, cw\)/.test(src) && /\(i - \(BANDS\.length - 1\) \/ 2\) \* bandH\(h\) \* 0\.92 \* converge/.test(src), true);
check("tip has no fade-out band", src.indexOf("destination-out") < 0, true);

// ---- game.js: spawn, timing, perks after the sequence, uninterrupted bull.
function body(name) {
  const i = game.indexOf("function " + name + "(");
  if (i < 0) return "";
  let d = 0, j = game.indexOf("{", i);
  for (let k = j; k < game.length; k++) {
    if (game[k] === "{") d++;
    else if (game[k] === "}" && --d === 0) return game.slice(i, k + 1);
  }
  return "";
}
const HU = Number((game.match(/const HALVE_UP = (\d+);/) || [])[1]);
const HB = Number((game.match(/const HALVE_BACK = (\d+);/) || [])[1]);
check("halving wave lasts at least 30 s", HU + HB >= 30, true);
check("waveDur uses the halving length", /waveDur\(w\) \{ return waveUpOf\(w\) \+ waveBackOf\(w\); \}/.test(game), true);
check("halving powerUntil covers the wave", /if \(k === "HALVE"\) S\.powerUntil = Math\.max\(S\.powerUntil, now \+ waveDur\(nw\)\)/.test(game), true);

const sh = body("spawnHalve");
check("spawnHalve queues, does not place mid-screen", /S\.halvePend = true/.test(sh) && sh.indexOf("freeX: true") < 0 && sh.indexOf("pipeWx") < 0, true);
const sp = body("spawnPipe");
check("halving rides the next off-screen pipe", /S\.halvePend && !isFinish/.test(sp) && /pipe, x: box\.x/.test(sp) && /freeX: false/.test(sp) && /spawnPipe\(nx\)/.test(game), true);
check("pipes spawn off-screen right", /const nx = last \? last\.x \+ m\.spacing : S\.W \+ 40;/.test(game) && /last\.x > S\.W - 8\) break/.test(game), true);
check("halving y stays inside the gap", /box\.lo \+ \(box\.hi - box\.lo\) \* \(up \? 0\.18 : 0\.82\)/.test(sp), true);
check("pinned halving keeps its y", /it\.type === "HALVE" && !it\.pipe\) it\.y = halveSlotY/.test(game), true);

const th = body("tickHalve");
check("hint 2 candles earlier", /halveLeft === 3\) \{\s*S\.halveSide/.test(th) && /halveLeft === 5\) \{/.test(th), true);
check("hint also shows as text", /sayEn\(\s*S\.halveSide === "up"[\s\S]*t\("halveTipUp"\)/.test(th), true);
check("caption has time on screen", /S\.tickerT = Math\.max\(S\.tickerT \|\| 0, 3\)/.test(body("sayEn")), true);

const col = body("collect");
const hv = col.slice(col.indexOf('it.type === "HALVE"'), col.indexOf("beginCycle(it.type)"));
check("collect does not open perks", hv.indexOf("openPerkOffer") < 0 && /S\.halvePerks = 3/.test(hv), true);
check("collect clears older waves first", /endCycle\(\)/.test(hv) && /beginCycle\("BULL", "HALVE"\)/.test(hv), true);
check("wave items are inert during halving", /halveLock\(\) && \(it\.type === "SWAN"/.test(col), true);
check("no wave items spawn during halving", /halveLock\(\) && \(type === "BULL" \|\| type === "BEAR" \|\| type === "SWAN"\)/.test(sp), true);

// Run the real halveAfter / halveLock against a stub world.
function world(S, H) {
  const log = [];
  const fn = new Function("S", "window", "openPerkOffer", "tryRankedPerk", "dealChance",
    body("halveLock") + "\n" + body("halveAfter") + "\nreturn { halveAfter: halveAfter, halveLock: halveLock };");
  const w = {
    ChoppyHalving: H
  };
  const api = fn(S, w,
    function (why) { log.push("perk:" + why); if (why === "halve") S.phase = "perk"; },
    function () { log.push("ranked"); return false; },
    function () { log.push("card"); });
  return { api: api, log: log };
}
{
  const S = { phase: "play", halveBull: true, halvePerks: 3, perkLater: true, cardLater: true, perkChain: 0, ranked: false };
  const hs = { v: 1 };
  const x = world(S, { intensity: function () { return hs.v; } });
  check("locked while the bull runs", x.api.halveLock(), true);
  x.api.halveAfter();
  check("no perk during the bull", x.log.length, 0);
  S.halveBull = false;
  x.api.halveAfter();
  check("no perk while the rainbow fades", x.log.length, 0);
  check("still locked while perks are pending", x.api.halveLock(), true);
  hs.v = 0;
  x.api.halveAfter();
  check("halving perks open after the sequence", x.log.join(","), "perk:halve");
  check("three perk chain", S.perkChain, 3);
  check("lock released", x.api.halveLock(), false);
  S.phase = "play";
  x.api.halveAfter();
  check("held back perk and card come next", x.log.join(","), "perk:halve,perk:undefined,card");
}
{
  const S = { phase: "paused", halveBull: false, halvePerks: 3, perkChain: 0 };
  const x = world(S, { intensity: function () { return 0; } });
  x.api.halveAfter();
  check("nothing opens while paused", x.log.length, 0);
}

// Chance cards and battles wait for the sequence too.
check("cards wait", /if \(halveLock\(\)\) \{\s*if \(S\.chanceAt/.test(body("tickJobChance")), true);
check("assaults wait", /S\.bcVictory \|\| halveLock\(\)/.test(body("dueAssault")), true);
check("perks wait", /why !== "halve" && halveLock\(\)/.test(body("openPerkOffer")) && /halveLock\(\)\) \{ S\.perkLater/.test(body("tryRankedPerk")), true);
check("new run clears the halving state", /S\.halvePend = false; S\.halvePerks = 0; S\.perkLater = false; S\.cardLater = false;/.test(game), true);
check("pause hook", /H\.pause\(\)/.test(game), true);

if (fails) process.exit(1);
console.log("halving-rainbow: ok");
