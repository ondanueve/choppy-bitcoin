#!/usr/bin/env node
"use strict";
// Frame-pacing model of game.js loop(): fixed 1/60 s sim step, drawn either from the latest step
// (before mp256) or blended between the last two steps (mp256 render interpolation).
// A candle moves left at 173 px/s (base metrics().speed). For each display refresh rate we feed the
// loop vsync timestamps with a little jitter, like a real phone, and compare the distance the candle
// moved on screen in each frame with the distance it should have moved in that frame's real time.
// "Hitch" = a frame whose on-screen move is off by more than 1.5 px (half a step) — a visible tirón.
// Usage: node docs/perf/pacing-sim.js
const SPEED = 173, STEP = 1 / 60, LERP_JUMP = 60;
function rng(seed) { let s = seed >>> 0; return () => { s = (s * 1664525 + 1013904223) >>> 0; return s / 4294967296; }; }
function stamps(hz, n, jitterMs, seed) {
  // rAF timestamps: true vsync plus jitter; the photons still land on true vsync (score() uses 1/hz).
  const r = rng(seed), out = []; let t = 1000 + r() * 1000 / hz;
  for (let i = 0; i < n; i++) { t += 1000 / hz; out.push(t + (r() * 2 - 1) * jitterMs); }
  return out;
}
function runSolo(ts, interp) {
  let last = ts[0], acc = 0, x = 0, px = 0; const drawn = [];
  for (let i = 1; i < ts.length; i++) {
    const now = ts[i];
    acc += Math.min(0.1, (now - last) / 1000); last = now;
    while (acc >= STEP) { px = x; x -= SPEED * STEP; acc -= STEP; }
    const a = Math.max(0, Math.min(1, acc * 60));
    drawn.push(interp && Math.abs(x - px) <= LERP_JUMP ? px + (x - px) * a : x);
  }
  return drawn;
}
function runVersus(ts, interp, playAt) {
  // Versus steps against Date.now() (integer ms), as mpCatchUp does every frame.
  let life = 0, x = 0, px = 0; const drawn = [];
  for (let i = 1; i < ts.length; i++) {
    const wall = Math.floor(ts[i]);
    const target = Math.max(0, (wall - playAt) / 1000);
    while (life + STEP <= target) { px = x; x -= SPEED * STEP; life += STEP; }
    const a = Math.max(0, Math.min(1, (target - life) * 60));
    drawn.push(interp && Math.abs(x - px) <= LERP_JUMP ? px + (x - px) * a : x);
  }
  return drawn;
}
function score(hz, drawn) {
  const err = [];
  for (let i = 1; i < drawn.length; i++) {
    const want = -SPEED / hz;
    err.push(Math.abs((drawn[i] - drawn[i - 1]) - want));
  }
  const s = err.slice().sort((a, b) => a - b);
  const q = (p) => s[Math.min(s.length - 1, Math.floor(p * s.length))];
  return { p95: +q(0.95).toFixed(2), p99: +q(0.99).toFixed(2), max: +s[s.length - 1].toFixed(2), hitchPct: +(100 * err.filter((e) => e > 1.5).length / err.length).toFixed(1) };
}
const CASES = [["60 Hz", 60, 0.4], ["59.94 Hz", 59.94, 0.4], ["90 Hz", 90, 0.4], ["120 Hz", 120, 0.3], ["144 Hz", 144, 0.3]];
// 8 runs of 60 s per case, each with its own jitter and vsync phase; the worst run is reported.
function worst(list) {
  const o = {}; for (const k of ["p95", "p99", "max", "hitchPct"]) o[k] = Math.max(...list.map((x) => x[k])); return o;
}
const rows = [];
for (const [name, hz, j] of CASES) {
  const b = [], a = [];
  for (let seed = 1; seed <= 8; seed++) { const ts = stamps(hz, hz * 60, j, seed * 97); b.push(score(hz, runSolo(ts, false))); a.push(score(hz, runSolo(ts, true))); }
  rows.push({ mode: "solo/ranked", display: name, before: worst(b), after: worst(a) });
}
for (const [name, hz, j] of CASES) {
  const b = [], a = [];
  for (let seed = 1; seed <= 8; seed++) { const ts = stamps(hz, hz * 60, j, seed * 131); const at = 1000 + seed * 0.37; b.push(score(hz, runVersus(ts, false, at))); a.push(score(hz, runVersus(ts, true, at))); }
  rows.push({ mode: "versus", display: name, before: worst(b), after: worst(a) });
}
console.log("mode        display   | before p95/p99/max px  hitch% | after p95/p99/max px  hitch%");
for (const r of rows) {
  const f = (o) => (o.p95 + "/" + o.p99 + "/" + o.max).padEnd(20) + String(o.hitchPct).padStart(6);
  console.log(r.mode.padEnd(12) + r.display.padEnd(10) + "| " + f(r.before) + "  | " + f(r.after));
}
if (process.argv.includes("--json")) console.log(JSON.stringify(rows));
