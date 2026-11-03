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

function fakeAudio(opts) {
  const ev = [];
  let paused = false;
  let on = !!opts.playing;
  let stopped = false;
  const api = {
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
      ac: function () { return { currentTime: opts.now || 0, sampleRate: 0 }; },
      hold: function (v) { if (v != null) this.held = !!v; return this.held; },
      muted: function () { return !!opts.muted; },
      vol: function () { return 0.8; },
      beep: function () { ev.push("beep"); },
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

check("relative loader", /s\.src = "halving\.js\?v=mp204"/.test(game), true);
check("not absolute", game.indexOf("/choppy-bitcoin/halving.js") < 0, true);
check("not in index", html.indexOf("halving.js") < 0, true);
check("draw hook", /drawWorldBg\(ctx, wash\);\s*halveFrame\(ctx\);\s*drawTape\(/.test(game), true);
check("audio hold", /muteTheme \|\| halveHold/.test(audio), true);
check("audio api", /A\._halving = \{/.test(audio), true);

if (fails) process.exit(1);
console.log("halving-rainbow: ok");
