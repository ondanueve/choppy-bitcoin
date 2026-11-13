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
const extra = fs.readFileSync(path.join(ROOT, "i18n-extra.js"), "utf8");
const index = fs.readFileSync(path.join(ROOT, "index.html"), "utf8");
const about = fs.readFileSync(path.join(ROOT, "about/index.html"), "utf8");

assert.ok(/id=\\"go\\"/.test(game), "title screen keeps #go as the ranked/daily entry");
assert.ok(/startGame\(true, null, "daily"\)/.test(game), "ranked entry launches the daily seed");
assert.ok(!/id=\\"go-practice\\"/.test(game), "title screen has no practice button");
assert.ok(!/startGame\(true, null, "practice"\)/.test(game), "practice mode is gone");
assert.ok(!/id=\\"go-daily\\"/.test(game), "separate daily button is gone");
assert.ok(/id=\\"go-challenge\\"/.test(game), "title screen can show a challenge button");
assert.ok(/kbClickFirst\("#go-challenge"\)/.test(game), "Enter can confirm a challenge");
assert.ok(/daily\.js\?v=mp230/.test(game), "daily.js is lazy-loaded");
assert.ok(!/daily\.js/.test(index), "daily.js is not on the game startup path");
assert.ok(/data-i18n="ranked"/.test(index), "index #go is labeled Ranked");
assert.ok(/const DAILY_ONE_ATTEMPT = false/.test(game), "one-attempt rule lives in one constant");
assert.ok(/function public\.daily_one_attempt\(\)/.test(sql) && /select false;/.test(sql), "SQL has a matching one-attempt switch, off");
assert.ok(!/submitNewHighScore/.test(game.match(/function saveBest\(n\) \{[\s\S]*?\n  \}/)[0]), "saveBest no longer writes the all-time board");
assert.ok(/queueDailySubmit/.test(game.match(/function saveBest\(n\) \{[\s\S]*?\n  \}/)[0]), "daily ranked submits through the queue");
assert.ok(/data-daily-tab=\\"legacy\\"/.test(game), "all-time board is a read-only legacy tab");
assert.ok(/boardLegacy/.test(game) && /dailyYesterday/.test(game));
assert.ok(/aboutDaily/.test(about) && /aboutDaily/.test(extra), "about page explains the new ranked rule");
assert.ok(/daily\.js\?v=mp230/.test(about), "about page loads the daily board client");

const keys = [
  "ranked", "dailyNote", "dailyBoard", "dailyYesterday", "dailyReset", "boardLegacy",
  "shareDaily", "shareRank",
  "beatBag", "beatBagNote", "beatPlay", "beatYes", "beatNo"
];
for (const key of keys) {
  assert.ok(i18n.indexOf(key + ":") !== -1, "i18n has " + key);
}
assert.ok(i18n.indexOf('ranked: "Ranked"') !== -1);
assert.ok(i18n.indexOf("intentos ilimitados") !== -1);
assert.ok(i18n.indexOf("00:00 UTC") !== -1);
assert.ok(i18n.indexOf("practice:") === -1, "practice strings are gone");
assert.ok(i18n.indexOf("Superaste la bolsa") !== -1);

assert.ok(/create table if not exists public\.daily_scores/.test(sql));
assert.ok(/submit_daily_score/.test(sql) && /daily_board/.test(sql) && /daily_my_rank/.test(sql));
assert.ok(/grant execute on function public\.submit_daily_score/.test(sql));
assert.ok(/grant execute on function public\.daily_board/.test(sql));
assert.ok(/grant execute on function public\.daily_my_rank/.test(sql));
assert.ok(/to authenticated/.test(sql.match(/grant execute on function public\.submit_daily_score[\s\S]*?;/)[0]));
assert.ok(!/drop table/.test(sql.toLowerCase()), "migration is not destructive");
assert.ok(!/profiles\.highscore/.test(sql) || /Does not drop or alter profiles.highscore/.test(sql));
assert.ok(/security definer/.test(sql));
assert.ok(/enable row level security/.test(sql));
assert.ok(/not signed in/.test(sql));
assert.ok(/interval '15 seconds'/.test(sql));

const start = game.indexOf("function utcDayKey(d) {");
const end = game.indexOf("function bumpUsage(kind) {");
assert.ok(start > 0 && end > start, "daily helpers found in game.js");
const box = vm.createContext({ URLSearchParams, Date, Math, Number, String });
vm.runInContext(
  game.slice(start, end) +
    "; this.utcDayKey=utcDayKey; this.dailySeed=dailySeed; this.utcYesterdayKey=utcYesterdayKey; this.msUntilUtcReset=msUntilUtcReset; this.parseChallenge=parseChallenge; this.challengeUrl=challengeUrl;",
  box
);

const a = box.dailySeed(new Date(Date.UTC(2026, 10, 10)));
const b = box.dailySeed(new Date(Date.UTC(2026, 10, 10, 23, 59, 59)));
const c = box.dailySeed(new Date(Date.UTC(2026, 10, 11)));
assert.strictEqual(a, b, "daily seed is the UTC date, not the time of day");
assert.notStrictEqual(a, c, "the next UTC day gets a different seed");
assert.strictEqual(box.utcDayKey(new Date(Date.UTC(2026, 10, 10))), "2026-11-10");
assert.strictEqual(box.utcYesterdayKey(new Date(Date.UTC(2026, 10, 11))), "2026-11-10");

const noon = new Date(Date.UTC(2026, 10, 11, 12, 0, 0));
assert.strictEqual(box.msUntilUtcReset(noon), 12 * 60 * 60 * 1000, "reset clock is 00:00 UTC");
const justBefore = new Date(Date.UTC(2026, 10, 11, 23, 59, 0));
assert.ok(box.msUntilUtcReset(justBefore) > 0 && box.msUntilUtcReset(justBefore) <= 60000);

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
assert.ok(typeof dailyCtx.choppyFillRankedBoards === "function");
assert.ok(typeof dailyCtx.choppySubmitDaily === "function");
assert.ok(typeof dailyCtx.choppyDailyMyRank === "function");
assert.ok(dailyCtx.choppyDailyReady());
const wrap = { hidden: false };
dailyCtx.choppyFillDailyBoard(wrap, { textContent: "x" }, "2026-11-10");
assert.strictEqual(wrap.hidden, true, "board hides when Supabase RPCs are not available");

console.log("daily tests ok (seed " + a + ")");
