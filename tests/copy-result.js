#!/usr/bin/env node
"use strict";

const fs = require("fs");
const path = require("path");
const assert = require("assert");
const vm = require("vm");

const ROOT = path.resolve(__dirname, "..");
const src = fs.readFileSync(path.join(ROOT, "copy-result.js"), "utf8");
const game = fs.readFileSync(path.join(ROOT, "game.js"), "utf8");
const i18n = fs.readFileSync(path.join(ROOT, "i18n.js"), "utf8");
const sw = fs.readFileSync(path.join(ROOT, "sw.js"), "utf8");

assert.ok(game.indexOf("copy-result.js?v=mp228") !== -1, "game lazy-loads copy-result.js");
assert.ok(/id=\\"copy-result\\"/.test(game), "end screen has copy-result button");
assert.ok(game.indexOf('t("copyResult")') !== -1, "button uses bilingual copyResult key");
assert.ok(/copyResult:\s*"Copy result"/.test(i18n) && /copyResult:\s*"Copiar resultado"/.test(i18n), "EN/ES button labels");
assert.ok(!/vosotros|\bpodés\b|\btenés\b/.test(i18n), "no voseo in i18n");
assert.ok(sw.indexOf('"copy-result.js"') !== -1, "service worker caches copy-result.js");

const store = {};
const ctx = {
  window: {},
  document: {
    createElement: function () {
      return { value: "", style: {}, setAttribute: function () {}, focus: function () {}, select: function () {}, setSelectionRange: function () {}, remove: function () {} };
    },
    body: { appendChild: function () {} },
    execCommand: function () { return true; }
  },
  navigator: {},
  localStorage: {
    getItem: function (k) { return Object.prototype.hasOwnProperty.call(store, k) ? store[k] : null; },
    setItem: function (k, v) { store[k] = String(v); }
  }
};
ctx.window = ctx;
vm.runInNewContext(src, ctx);

const bars = [];
for (let i = 0; i < 8; i++) bars.push({ o: 100, c: i % 2 === 0 ? 101 : 99 });
const text = ctx.choppyBuildCopyText({
  daily: true,
  date: "2026-11-11",
  bag: 2.1,
  rank: 4,
  streak: 3,
  bars: bars,
  url: "https://bitcoinizate.com/choppy-bitcoin/?seed=42&bag=2.1"
});
assert.ok(text.indexOf("Choppy Bitcoin  2026-11-11") === 0, "english header with date");
assert.ok(text.indexOf("2.1 BTC") !== -1, "bag in text");
assert.ok(text.indexOf("#4") !== -1, "rank in text");
assert.ok(text.indexOf("🔥3") !== -1, "streak in text");
assert.ok(text.indexOf("🟩🟥🟩🟥🟩🟥🟩🟥") !== -1, "emoji grid of candle direction");
assert.ok(text.indexOf("https://bitcoinizate.com/choppy-bitcoin/?seed=42&bag=2.1") !== -1, "challenge link");
assert.ok(!/[\u00A0\u200B]/.test(text), "plain ascii/emoji only, no nbsp");
// Must paste as plain text: no HTML
assert.ok(text.indexOf("<") === -1 && text.indexOf(">") === -1, "no HTML in copied text");

// Practice / non-daily omits date, rank, streak
const practice = ctx.choppyBuildCopyText({ daily: false, bag: 1, bars: [{ o: 1, c: 2 }], url: "https://bitcoinizate.com/choppy-bitcoin/?seed=1" });
assert.ok(practice.indexOf("Choppy Bitcoin\n1 BTC") === 0, "practice header has no date");
assert.ok(practice.indexOf("🔥") === -1 && practice.indexOf("#") === -1, "practice omits rank and streak");

// Wrap at 20, cap at 5 rows; bucket when longer
const many = [];
for (let i = 0; i < 200; i++) many.push({ o: 10, c: i % 3 === 0 ? 11 : 9 });
const grid = ctx.choppyBuildCopyGrid(many);
const rows = grid.split("\n");
assert.ok(rows.length <= 5, "at most 5 grid rows");
rows.forEach(function (r) {
  assert.ok(Array.from(r).length <= 20, "row has at most 20 emoji");
});

// Streak: consecutive UTC days
assert.equal(ctx.choppyNoteDailyStreak("2026-11-10"), 1);
assert.equal(ctx.choppyNoteDailyStreak("2026-11-10"), 1, "same day is idempotent");
assert.equal(ctx.choppyNoteDailyStreak("2026-11-11"), 2);
assert.equal(ctx.choppyNoteDailyStreak("2026-11-13"), 1, "gap resets streak");
assert.equal(ctx.choppyReadDailyStreak(), 1);
ctx.choppyWriteDailyStreak("2026-11-13", 9);
assert.equal(ctx.choppyReadDailyStreak(), 9);

// Clipboard API path
let wrote = "";
ctx.navigator.clipboard = { writeText: function (s) { wrote = s; return Promise.resolve(); } };
ctx.choppyCopyResultText("hello").then(function (ok) {
  assert.ok(ok);
  assert.equal(wrote, "hello");
  // textarea fallback
  delete ctx.navigator.clipboard;
  let copied = "";
  ctx.document.execCommand = function (cmd) { copied = cmd; return true; };
  return Promise.resolve(ctx.choppyCopyResultText("fallback"));
}).then(function (ok) {
  assert.ok(ok);
  console.log("copy-result tests ok");
}).catch(function (err) {
  console.error(err);
  process.exit(1);
});
