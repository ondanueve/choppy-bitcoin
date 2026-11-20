#!/usr/bin/env node
// Ranked ghost of the day: encoding, playback, graceful failure, and game hooks.
"use strict";
const assert = require("assert");
const fs = require("fs");
const path = require("path");
const vm = require("vm");

const ROOT = path.resolve(__dirname, "..");
const read = (f) => fs.readFileSync(path.join(ROOT, f), "utf8");
const src = read("ghost.js");
const game = read("game.js");
const index = read("index.html");
const sw = read("sw.js");
const daily = read("daily.js");
const i18n = read("i18n.js");
const sql = read("supabase/supabase-daily-ghost.sql");

function load(extra) {
  const box = Object.assign({ Math, Number, String, Array, Float32Array, Promise, Date, console }, extra || {});
  box.window = box;
  vm.createContext(box);
  vm.runInContext(src, box);
  return box;
}

const G = load().ChoppyGhost;
assert.ok(G && G.encode && G.decode && G.at && G.fetchTop && G.submit, "ghost.js exposes its API");

// A 90 s run at 0.2 s per sample with a wavy height and a laser speed-up halfway.
function fakeRun(seconds, dt) {
  const y = [], d = [];
  let dist = 0;
  for (let t = 0, i = 0; t <= seconds + 1e-9; t += dt, i++) {
    y.push(0.42 + 0.3 * Math.sin(t * 1.7));
    d.push(dist);
    dist += 173 * (t > seconds / 2 ? 1.28 : 1) * dt;
  }
  return { y, d };
}

const rec = fakeRun(90, 0.2);
const enc = G.encode(rec, 0.2);
assert.ok(/^g1\.200\.\d+\.[A-Za-z0-9_-]+$/.test(enc), "encoded header: " + enc.slice(0, 20));
assert.strictEqual((enc.split(".")[3].length) % 3, 0, "3 chars per sample");
assert.ok(enc.length < 1500, "90 s run stays small (" + enc.length + " chars)");
const dec = G.decode(enc);
assert.ok(dec, "decodes its own output");
assert.strictEqual(dec.n, rec.y.length, "same sample count");
const unit = Number(enc.split(".")[2]);
for (let i = 0; i < dec.n; i++) {
  assert.ok(Math.abs(dec.y[i] - rec.y[i]) < 0.001, "height within 1/1000 at " + i);
  assert.ok(Math.abs(dec.d[i] - rec.d[i]) <= unit, "distance never drifts more than one unit at " + i);
}

// Out-of-field heights clamp instead of wrapping.
const odd = G.decode(G.encode({ y: [-2, 3, NaN], d: [0, 30, 60] }, 0.2));
assert.ok(odd && Math.abs(odd.y[0] + 0.1) < 0.001 && Math.abs(odd.y[1] - 1.1) < 0.001 && Math.abs(odd.y[2] - 0.5) < 0.001);

// Long runs are decimated to the sample cap, doubling the interval.
const long = fakeRun(40 * 60, 0.2);
const encL = G.encode(long, 0.2);
const decL = G.decode(encL);
assert.ok(encL.length <= G.MAX_CHARS, "long run fits the cap");
assert.ok(decL.n <= G.MAX_SAMPLES, "long run under the sample cap");
assert.ok(decL.dt >= 0.4, "long run uses a coarser interval");
assert.ok(Math.abs(decL.end - 40 * 60) < 2, "long run keeps its duration");

// Playback interpolates and reports the end.
const two = G.decode(G.encode({ y: [0.2, 0.6], d: [0, 40] }, 0.2));
const mid = G.at(two, 0.1);
assert.ok(Math.abs(mid.y - 0.4) < 0.002 && Math.abs(mid.d - 20) <= 4 && !mid.done, "midpoint interpolation");
assert.ok(G.at(two, 0).y < 0.21, "start of the path");
const after = G.at(two, 5);
assert.ok(after.done && after.end === 0.2 && Math.abs(after.y - 0.6) < 0.002, "after the end the ghost is done");
assert.strictEqual(G.at(null, 1), null);

// Garbage never decodes.
["", null, 5, "g1.200.4.AB", "g2.200.4.AAAAAA", "g1.200.0.AAAAAA", "g1.10.4.AAAAAA", "g1.200.4.AA*AAA", "g1.200.4." + "A".repeat(12200)]
  .forEach((s) => assert.strictEqual(G.decode(s), null, "rejects " + String(s).slice(0, 20)));
assert.strictEqual(G.encode({ y: [0.5], d: [0] }, 0.2), "", "one sample is not a path");
assert.strictEqual(G.encode(null, 0.2), "");

// Graceful failure: no client, a missing RPC, a throw, a rejected fetch, a bad payload.
function tryFetch(rpcImpl, done) {
  const box = load({ supabase: rpcImpl === undefined ? undefined : { createClient: () => ({ rpc: rpcImpl }) } });
  box.ChoppyGhost.fetchTop("2026-11-20", done);
}
const cases = [
  undefined,
  () => Promise.resolve({ data: null, error: { message: "Could not find the function public.daily_top_ghost" } }),
  () => { throw new Error("boom"); },
  () => Promise.reject(new Error("offline")),
  () => Promise.resolve({ data: [{ rank: 1, alias: "x", score: 9, ghost: "nope" }], error: null }),
  () => Promise.resolve({ data: [], error: null })
];
let pending = cases.length + 4;
process.on("exit", (code) => { if (!code && pending !== 0) { console.error("ghost tests: " + pending + " checks never finished"); process.exitCode = 1; } });
const finish = () => { if (--pending === 0) console.log("ghost tests ok"); };
cases.forEach((impl, i) => tryFetch(impl, (g) => { assert.strictEqual(g, null, "case " + i + " yields no ghost"); finish(); }));

// A good row decodes with its label data, and is cached.
let calls = 0;
const good = load({ supabase: { createClient: () => ({ rpc: (name, args) => { calls++; assert.strictEqual(name, "daily_top_ghost"); assert.strictEqual(args.p_day, "2026-11-20"); return Promise.resolve({ data: [{ rank: 1, alias: "satoshi", score: 123, ghost: enc, is_me: false }], error: null }); } }) } });
good.ChoppyGhost.fetchTop("2026-11-20", (g) => {
  assert.ok(g && g.n === rec.y.length && g.rank === 1 && g.alias === "satoshi" && g.mine === false);
  good.ChoppyGhost.fetchTop("2026-11-20", (g2) => {
    assert.strictEqual(g2, g, "second fetch within a minute uses the cache");
    assert.strictEqual(calls, 1);
    finish();
  });
});

// Submit only sends valid paths, once per better score, and ignores errors.
const sent = [];
const sub = load({ supabase: { createClient: () => ({ rpc: (name, args) => { sent.push([name, args]); return Promise.resolve({ data: true, error: null }); } }) } });
sub.ChoppyGhost.submit("2026-11-20", 500, "garbage", (ok) => {
  assert.strictEqual(ok, false);
  sub.ChoppyGhost.submit("2026-11-20", 500, enc, (ok2) => {
    assert.strictEqual(ok2, true);
    assert.deepStrictEqual(sent.map((s) => s[0]), ["submit_daily_ghost"]);
    assert.strictEqual(sent[0][1].p_ghost, enc);
    sub.ChoppyGhost.submit("2026-11-20", 400, enc, (ok3) => {
      assert.strictEqual(ok3, false, "a lower score is not sent");
      assert.strictEqual(sent.length, 1);
      finish();
    });
  });
});
const bad = load({ supabase: { createClient: () => ({ rpc: () => Promise.resolve({ data: null, error: { message: "missing" } }) }) } });
bad.ChoppyGhost.submit("2026-11-20", 500, enc, (ok) => { assert.strictEqual(ok, false); finish(); });

// Game hooks: lazy, gated to solo Ranked on today's chart, labels bilingual.
assert.ok(/ghost\.js\?v=mp\d+/.test(game), "game lazy-loads ghost.js");
assert.ok(!/ghost\.js/.test(index), "ghost.js is not on the startup path");
assert.ok(sw.indexOf('"ghost.js"') !== -1, "service worker caches ghost.js");
const live = game.slice(game.indexOf("function ghostLive()"), game.indexOf("function loadGhost("));
["S.ranked", "S.daily", "!S.mp", "!S.testCheat", "S.dailyDay === utcDayKey()"].forEach((k) => assert.ok(live.indexOf(k) !== -1, "ghostLive checks " + k));
assert.ok(/if \(S\.ghRec\) ghostTick\(dt, speed\);/.test(game), "step records while a ghost run is live");
assert.ok(/if \(!keepWallet\) \{ S\.ghRec = null;/.test(game), "a fresh world clears the recorder (Versus, Training)");
assert.ok((game.match(/ghostBegin\(\);/g) || []).length >= 2, "startGame and replay start the recorder");
assert.ok(/ghost: ghost/.test(game), "daily submit carries the path");
assert.ok(/ChoppyGhost\.submit\(payload\.day, score, payload\.ghost\)/.test(daily), "daily.js sends the path after the score");
assert.ok(/ghostTop: "Today's #\{n\}"/.test(i18n) && /ghostTop: "N\.º \{n\} de hoy"/.test(i18n), "label in EN and ES");
assert.ok(/ghostMine: "Your best today"/.test(i18n) && /ghostMine: "Tu mejor de hoy"/.test(i18n), "own-best label in EN and ES");

// Ghost gating in a sandbox: only today's solo Ranked run records.
const gs = game.indexOf("function ghostLive()");
const ge = game.indexOf("function loadGhost(");
function liveFor(state, today) {
  const ctx = vm.createContext({ S: state, utcDayKey: () => today });
  vm.runInContext(game.slice(gs, ge) + "; this.ghostLive = ghostLive;", ctx);
  return ctx.ghostLive();
}
const base = { ranked: true, daily: true, mp: false, testCheat: false, humanInput: true, dailyDay: "2026-11-20" };
assert.strictEqual(liveFor(base, "2026-11-20"), true, "today's Ranked run");
assert.strictEqual(liveFor(Object.assign({}, base, { ranked: false }), "2026-11-20"), false, "Training");
assert.strictEqual(liveFor(Object.assign({}, base, { mp: true }), "2026-11-20"), false, "Versus");
assert.strictEqual(liveFor(Object.assign({}, base, { daily: false, dailyDay: "" }), "2026-11-20"), false, "other seed challenge");
assert.strictEqual(liveFor(base, "2026-11-21"), false, "run from a past UTC day");
assert.strictEqual(liveFor(Object.assign({}, base, { testCheat: true }), "2026-11-20"), false, "test loadout");

// SQL: additive, server-side limits, needs the daily board, grants.
assert.ok(/create table if not exists public\.daily_ghosts/.test(sql));
assert.ok(!/drop table/i.test(sql), "not destructive");
assert.ok(/enable row level security/.test(sql));
assert.ok(/length\(ghost\) between 16 and 12100/.test(sql));
assert.ok(/samples > 4000/.test(sql));
assert.ok(/best <> p_score/.test(sql), "keeps only the stored best score");
assert.ok(/security definer/.test(sql));
assert.ok(/grant execute on function public\.submit_daily_ghost\(bigint, text, date\) to authenticated;/.test(sql));
assert.ok(/grant execute on function public\.daily_top_ghost\(date\) to anon, authenticated;/.test(sql));
assert.ok(/AFTER supabase\/supabase-daily\.sql/.test(sql));
finish();
