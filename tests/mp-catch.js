#!/usr/bin/env node
"use strict";

/*
 * Versus live stepping must not use reconnect catch-up flags.
 * If every wall-clock step sets mpCatch and resets invuln to 2.5,
 * candle cash never lands and an idle bird cannot die.
 */

const fs = require("fs");
const path = require("path");
const vm = require("vm");
const assert = require("assert");

const ROOT = path.resolve(__dirname, "..");
const game = fs.readFileSync(path.join(ROOT, "game.js"), "utf8");

const start = game.indexOf("const MP_CATCH_GAP = ");
const end = game.indexOf("function mpTickClock()");
assert.ok(start > 0 && end > start, "mpCatchUp helpers found in game.js");
assert.ok(/if \(catching\) \{\s*S\.mpCatch = true;\s*S\.invuln = 10000;/.test(game.slice(start, end)), "catch-up flags are gated on a large gap");
assert.ok(/if \(catching\) S\.invuln = 2\.5;/.test(game.slice(start, end)), "post-catch invuln is only applied after a large gap");
assert.ok(!/S\.mpCatch = true;\s*S\.invuln = 10000;\s*let guard/.test(game), "live frames must not always set catch-up flags");

const cashAt = game.indexOf("grantUsd(100 * halveEarn()");
assert.ok(cashAt > 0, "candle cash grant exists");
assert.ok(game.slice(Math.max(0, cashAt - 200), cashAt).indexOf("if (!S.mpCatch)") !== -1, "candle cash is still skipped only while mpCatch is set");

const box = {
  S: { mp: true, phase: "play", mpPlayAt: 0, lifeT: 0, invuln: 0, mpCatch: false, cash: 0 },
  Date: { now: () => box.now },
  now: 0,
  steps: [],
  step(dt) {
    box.steps.push({ dt: dt, mpCatch: !!box.S.mpCatch, invuln: box.S.invuln });
    box.S.lifeT += dt;
    if (box.S.invuln > 0) box.S.invuln -= dt;
    if (!box.S.mpCatch) box.S.cash += 100;
  }
};
vm.createContext(box);
vm.runInContext(
  game.slice(start, end) +
    "; this.MP_CATCH_GAP = MP_CATCH_GAP; this.mpShouldCatch = mpShouldCatch; this.mpCatchUp = mpCatchUp;",
  box
);

assert.strictEqual(box.MP_CATCH_GAP, 0.5);
assert.strictEqual(box.mpShouldCatch(1.0, 0.9), false);
assert.strictEqual(box.mpShouldCatch(1.0, 0.4), true);

// Ordinary live frames: a few 1/60s ticks behind the wall clock.
box.S.mpPlayAt = 10_000;
box.S.lifeT = 0;
box.S.invuln = 2.5;
box.S.cash = 0;
box.S.mpCatch = false;
box.steps = [];
box.now = 10_000 + Math.round((1 / 60) * 3 * 1000);
box.mpCatchUp();
assert.ok(box.steps.length >= 2, "live catch-up steps the short gap");
assert.ok(box.steps.every((s) => s.mpCatch === false), "live steps do not set mpCatch");
assert.ok(box.S.invuln < 2.5 && box.S.invuln > 0, "invuln decays on live versus frames, got " + box.S.invuln);
assert.ok(box.S.cash === box.steps.length * 100, "candle cash is granted on live versus frames");
assert.strictEqual(box.S.mpCatch, false);

// After enough live frames, starting invuln of 2.5 must be able to expire.
// Advance the clock one tick at a time, as the game loop does, so the gap
// stays under MP_CATCH_GAP and the reconnect path is not used.
box.S.lifeT = 0;
box.S.invuln = 2.5;
box.S.cash = 0;
box.S.mpCatch = false;
box.steps = [];
box.S.mpPlayAt = 10_000;
for (let i = 1; i <= 180; i++) {
  box.now = 10_000 + Math.round((i / 60) * 1000);
  box.mpCatchUp();
}
assert.ok(box.S.lifeT > 2.5, "simulated more than 2.5s of live time, got " + box.S.lifeT);
assert.ok(box.S.invuln <= 0, "invuln can expire during a live versus stretch, got " + box.S.invuln);
assert.ok(box.S.cash > 0, "cash was granted during the live stretch");
assert.ok(box.steps.every((st) => st.mpCatch === false), "the 3s live stretch never used catch-up flags");

// Reconnect / tab-hide: a gap larger than MP_CATCH_GAP keeps the old catch-up behaviour.
box.S.lifeT = 1;
box.S.invuln = 0;
box.S.cash = 0;
box.S.mpCatch = false;
box.steps = [];
box.S.mpPlayAt = 10_000;
box.now = 10_000 + 4000;
box.mpCatchUp();
assert.ok(box.steps.length > 10, "large gap is fast-forwarded");
assert.ok(box.steps.every((s) => s.mpCatch === true), "reconnect steps set mpCatch");
assert.ok(box.steps[0].invuln === 10000, "reconnect holds invulnerability");
assert.strictEqual(box.S.mpCatch, false);
assert.strictEqual(box.S.invuln, 2.5, "reconnect leaves 2.5s of invulnerability");
assert.strictEqual(box.S.cash, 0, "reconnect catch-up still skips grants");

console.log("mp-catch tests ok (gap " + box.MP_CATCH_GAP + "s, live cash, decaying invuln, reconnect catch-up)");
