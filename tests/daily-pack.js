#!/usr/bin/env node
"use strict";

const fs = require("fs");
const path = require("path");
const assert = require("assert");
const { spawnSync } = require("child_process");
const { loadChoppySim } = require("../tools/choppy-sim.cjs");

const ROOT = path.resolve(__dirname, "..");
const out = path.join("/tmp", "daily-pack-test-" + process.pid);
fs.rmSync(out, { recursive: true, force: true });

const day = "2026-11-12";
const run = spawnSync("node", ["tools/daily-pack.mjs", "--day", day, "--out", out], {
  cwd: ROOT,
  encoding: "utf8"
});
assert.strictEqual(run.status, 0, "daily-pack.mjs exits 0\n" + (run.stdout || "") + (run.stderr || ""));

const jsonPath = path.join(out, day + ".json");
const mdPath = path.join(out, day + ".md");
const svgPath = path.join(out, day + ".svg");
assert.ok(fs.existsSync(jsonPath) && fs.existsSync(mdPath) && fs.existsSync(svgPath), "writes json, md, and svg");
assert.ok(fs.existsSync(path.join(out, "latest.json")), "writes latest.json");

const pack = JSON.parse(fs.readFileSync(jsonPath, "utf8"));
const ctx = loadChoppySim(ROOT);
const seed = ctx.choppyDailySeed(new Date(day + "T00:00:00Z"));
assert.strictEqual(pack.date, day);
assert.strictEqual(pack.seed, seed, "seed matches choppyDailySeed");
assert.ok(pack.url.indexOf("?seed=" + seed) !== -1, "link includes the daily seed");
assert.ok(pack.candles >= 8, "simulates a run of candles");
assert.ok(pack.chart && Number.isFinite(pack.chart.changePct), "chart has percent change");
assert.ok(Number.isFinite(pack.chart.high) && Number.isFinite(pack.chart.low), "chart has high/low");
assert.ok(Number.isFinite(pack.chart.volatility), "chart has volatility");
assert.ok(String(pack.chart.description).length > 20, "chart description present");
assert.ok(Array.isArray(pack.posts) && pack.posts.length >= 2 && pack.posts.length <= 3, "2–3 post variants");
pack.posts.forEach(function (p) {
  assert.ok(p.text && p.text.length <= 280, p.id + " stays under 280 chars (" + (p.text && p.text.length) + ")");
  assert.ok(p.text.indexOf("http") !== -1, p.id + " includes the daily link");
});
const md = fs.readFileSync(mdPath, "utf8");
assert.ok(md.indexOf(String(seed)) !== -1 && md.indexOf(pack.url) !== -1, "markdown includes seed and link");
assert.ok(/does not post/i.test(md), "markdown says it does not post");
const svg = fs.readFileSync(svgPath, "utf8");
assert.ok(/^<svg[\s\S]*<\/svg>\s*$/.test(svg) || svg.indexOf("<svg") !== -1, "og file is an svg");

const wf = fs.readFileSync(path.join(ROOT, ".github/workflows/daily-pack.yml"), "utf8");
assert.ok(wf.indexOf("10 0 * * *") !== -1, "action scheduled at 00:10 UTC");
assert.ok(/does not post/i.test(wf), "workflow comments that it does not post");
assert.ok(wf.indexOf("daily-pack") !== -1, "publishes to the daily-pack branch");

console.log("daily-pack tests ok (seed " + seed + ", " + pack.candles + " candles, " + pack.posts.length + " posts)");
