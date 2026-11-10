#!/usr/bin/env node
"use strict";

const fs = require("fs");
const path = require("path");
const vm = require("vm");
const assert = require("assert");

const ROOT = path.resolve(__dirname, "..");
const game = fs.readFileSync(path.join(ROOT, "game.js"), "utf8");
const dailySrc = fs.readFileSync(path.join(ROOT, "daily.js"), "utf8");
const sql = fs.readFileSync(path.join(ROOT, "supabase", "supabase-daily.sql"), "utf8");
const i18n = fs.readFileSync(path.join(ROOT, "i18n.js"), "utf8");
const index = fs.readFileSync(path.join(ROOT, "index.html"), "utf8");

assert.ok(/id=\\"go-daily\\"/.test(game), "title screen has a daily button");
assert.ok(/id=\\"go-challenge\\"/.test(game), "title screen can show a challenge button");
assert.ok(/kbClickFirst\("#go-challenge"\)/.test(game), "Enter can confirm a challenge");
assert.ok(/startGame\(true, null, "daily"\)/.test(game));
assert.ok(/daily\.js\?v=mp222/.test(game), "daily.js is lazy-loaded");
assert.ok(!/daily\.js/.test(index), "daily.js is not on the startup path");

const keys = ["daily", "dailyNote", "dailyBoard", "beatBag", "beatBagNote", "beatPlay", "beatYes", "beatNo"];
for (const key of keys) {
  assert.ok(i18n.indexOf(key + ":") !== -1, "i18n has " + key);
}
assert.ok(i18n.indexOf('daily: "Vela del día"') !== -1);
assert.ok(i18n.indexOf('dailyNote: "El mismo gráfico para todos hoy."') !== -1);
assert.ok(i18n.indexOf("Superaste la bolsa") !== -1);
assert.ok(/create table if not exists public\.daily_scores/.test(sql));
assert.ok(/submit_daily_score/.test(sql) && /daily_board/.test(sql));
assert.ok(/grant execute on function public\.submit_daily_score/.test(sql));
assert.ok(/grant execute on function public\.daily_board/.test(sql));
assert.ok(/security definer/.test(sql));
assert.ok(/enable row level security/.test(sql));

const start = game.indexOf("function utcDayKey(d) {");
const end = game.indexOf("function bumpUsage(kind) {");
assert.ok(start > 0 && end > start, "daily helpers found in game.js");
const box = vm.createContext({ URLSearchParams, Date, Math, Number, String });
vm.runInContext(
  game.slice(start, end) +
    "; this.utcDayKey=utcDayKey; this.dailySeed=dailySeed; this.parseChallenge=parseChallenge; this.challengeUrl=challengeUrl;",
  box
);

const a = box.dailySeed(new Date(Date.UTC(2026, 10, 10)));
const b = box.dailySeed(new Date(Date.UTC(2026, 10, 10, 23, 59, 59)));
const c = box.dailySeed(new Date(Date.UTC(2026, 10, 11)));
assert.strictEqual(a, b, "daily seed is the UTC date, not the time of day");
assert.notStrictEqual(a, c, "the next UTC day gets a different seed");
assert.strictEqual(box.utcDayKey(new Date(Date.UTC(2026, 10, 10))), "2026-11-10");

const spec = box.parseChallenge("?seed=12345&bag=0.210000");
assert.ok(spec);
assert.strictEqual(spec.seed, 12345);
assert.ok(Math.abs(spec.bag - 0.21) < 1e-9);
assert.strictEqual(box.parseChallenge(""), null);
const url = box.challengeUrl(12345, 0.21);
assert.ok(url.indexOf("seed=12345") !== -1 && url.indexOf("bag=0.21") !== -1);

const dailyCtx = { window: null };
dailyCtx.window = dailyCtx;
vm.createContext(dailyCtx);
vm.runInContext(dailySrc, dailyCtx);
assert.ok(typeof dailyCtx.choppyFillDailyBoard === "function");
assert.ok(typeof dailyCtx.choppySubmitDaily === "function");
assert.ok(dailyCtx.choppyDailyReady());
const wrap = { hidden: false };
dailyCtx.choppyFillDailyBoard(wrap, { textContent: "x" }, "2026-11-10");
assert.strictEqual(wrap.hidden, true, "board hides when Supabase RPCs are not available");

console.log("daily tests ok (seed " + a + ")");
