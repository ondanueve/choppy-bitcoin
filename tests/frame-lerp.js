#!/usr/bin/env node
"use strict";

/*
 * mp254 render interpolation. draw() may see positions blended between the last two
 * fixed steps, but the sim state must come back exactly as it was, so Ranked replays and
 * Versus stay step-for-step identical. Also checks the loop still uses a fixed 1/60 step.
 */

const fs = require("fs");
const path = require("path");
const vm = require("vm");
const assert = require("assert");
const { execFileSync } = require("child_process");

const ROOT = path.resolve(__dirname, "..");
const game = fs.readFileSync(path.join(ROOT, "game.js"), "utf8");
const start = game.indexOf("const LERP_JUMP = ");
const end = game.indexOf("function loop(now)");
assert.ok(start > 0 && end > start, "lerp helpers found before loop()");
const loopSrc = game.slice(end, game.indexOf("setInterval(mpTickClock", end));
assert.ok(/while \(acc >= 1 \/ 60\) \{ lerpSnap\(\); step\(1 \/ 60\); acc -= 1 \/ 60; \}/.test(loopSrc), "solo loop keeps the fixed 1/60 step");
assert.ok(/lerpApply\(alpha\);\s*try \{ draw\(ctx\); \} finally \{ lerpRestore\(\); \}/.test(loopSrc), "interpolated draw is always restored");
assert.ok(/guard\+\+ < 1800\) \{ lerpSnap\(\); step\(1 \/ 60\); \}/.test(game), "Versus wall-clock stepping records pre-step positions");

const box = { S: null, pipePw: () => 30, pipeWx: (p, pw) => p.x + pw * 0.5, Math };
vm.createContext(box);
vm.runInContext(game.slice(start, end) + "; this.lerpSnap = lerpSnap; this.lerpApply = lerpApply; this.lerpRestore = lerpRestore;", box);

function world() {
  const pipe = { x: 300, gapY: 200, wx: 0 };
  const pipe2 = { x: 120, gapY: 300, wx: 0 };
  return {
    bird: { x: 120, y: 250, v: 40, r: 12 },
    bg: 1000, ghT: 3, ghD: 500,
    pipes: [pipe, pipe2],
    items: [{ pipe: pipe, x: 0, y: 200, vy: 0 }, { freeX: true, x: 400, y: 100, vy: 30 }],
    floats: [{ x: 200, y: 90 }]
  };
}
function stepWorld(S) {
  S.bird.v += 900 / 60; S.bird.y += S.bird.v / 60;
  S.bg += 60 / 60; S.ghT += 1 / 60; S.ghD += 173 / 60;
  for (const p of S.pipes) p.x -= 173 / 60;
  for (const it of S.items) { if (it.freeX) it.x -= 173 / 60; it.y += it.vy / 60; }
  for (const f of S.floats) { f.x -= 173 / 60; f.y -= 20 / 60; }
}
function realDrawSideEffects(S) {
  for (const p of S.pipes) p.wx = box.pipeWx(p, 30);
  for (const it of S.items) if (it.pipe && !it.freeX) it.x = it.pipe.wx;
}
function plain(S) {
  return JSON.stringify(S, (k, v) => (k.charAt(0) === "_" || k === "pipe") ? undefined : v);
}

const S = world();
box.S = S;
for (let i = 0; i < 5; i++) { box.lerpSnap(); stepWorld(S); }
realDrawSideEffects(S);
const want = plain(S);
const prevX = S.pipes[0]._px, curX = S.pipes[0].x;
box.lerpApply(0.25);
assert.ok(Math.abs(S.pipes[0].x - (prevX + (curX - prevX) * 0.25)) < 1e-9, "pipe drawn a quarter step behind");
assert.ok(S.bird.y < S.bird._cy && S.bird.y > S.bird._py, "hero drawn between the last two steps");
// draw() writes these with the blended values:
for (const p of S.pipes) p.wx = box.pipeWx(p, 30);
for (const it of S.items) if (it.pipe && !it.freeX) it.x = it.pipe.wx;
box.lerpRestore();
assert.strictEqual(plain(S), want, "state after the interpolated draw equals the uninterpolated draw");

// A teleport (respawn, reset) is never blended across.
box.lerpSnap(); S.bird.y = 20; box.lerpApply(0.5);
assert.strictEqual(S.bird.y, 20, "jumps above LERP_JUMP are drawn as-is");
box.lerpRestore();
// New objects (spawned during the last step) have no snapshot and draw where they are.
S.pipes.push({ x: 520, gapY: 100 }); box.lerpApply(0.5);
assert.strictEqual(S.pipes[2].x, 520, "new candle drawn at its spawn x");
box.lerpRestore();
assert.strictEqual(S.pipes[2].x, 520);

// Frame-pacing model: no visible hitches after the change on 60/90/120/144 Hz.
const out = execFileSync(process.execPath, [path.join(ROOT, "docs/perf/pacing-sim.js"), "--json"], { encoding: "utf8" });
const rows = JSON.parse(out.trim().split("\n").pop());
for (const r of rows) assert.strictEqual(r.after.hitchPct, 0, r.mode + " " + r.display + " has no hitches");
assert.ok(rows.some((r) => r.before.hitchPct > 20), "model reproduces the old judder");
console.log("frame-lerp tests ok (state restored, no blend across jumps, " + rows.length + " pacing cases hitch-free)");
