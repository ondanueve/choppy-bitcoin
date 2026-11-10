#!/usr/bin/env node
"use strict";

const fs = require("fs");
const path = require("path");
const assert = require("assert");

const ROOT = path.resolve(__dirname, "..");
const sql = fs.readFileSync(path.join(ROOT, "supabase/supabase-usage.sql"), "utf8");
const game = fs.readFileSync(path.join(ROOT, "game.js"), "utf8");
const extra = fs.readFileSync(path.join(ROOT, "i18n-extra.js"), "utf8");

assert.ok(/create table if not exists public\.usage_counts/.test(sql));
assert.ok(/kind in \('start', 'finish', 'share'\)/.test(sql));
const table = sql.match(/create table if not exists public\.usage_counts \([^;]+?\)/s)[0];
assert.ok(!/user_id|email|alias|ip_/.test(table), "usage_counts stores only day, kind, and n");
assert.ok(/grant execute on function public\.bump_usage\(text\) to anon/.test(sql));
assert.ok(/enable row level security/.test(sql));
assert.ok(/revoke all on public\.usage_counts from public, anon, authenticated/.test(sql));

assert.ok(/function bumpUsage\(kind\)/.test(game));
assert.ok(/sb\.rpc\("bump_usage", \{ p_kind: kind \}\)/.test(game));
const startFn = game.match(/function startGame\(ranked, seed, mode\) \{[\s\S]{0,900}/)[0];
assert.ok(startFn.indexOf('bumpUsage("start")') !== -1, "startGame counts a start");
const replayFn = game.match(/function replay\(\) \{[\s\S]{0,500}/)[0];
assert.ok(replayFn.indexOf('bumpUsage("start")') !== -1, "replay counts a start");
const dieFn = game.match(/function die\(\) \{[\s\S]*?\n  \}/)[0];
assert.ok(dieFn.indexOf('bumpUsage("finish")') !== -1, "die counts a finish");
assert.ok(dieFn.indexOf("S.mp && window.ChoppyMP") < dieFn.indexOf('bumpUsage("finish")'), "versus deaths are not counted as a finish");
assert.ok(/function endIndependence\([\s\S]{0,600}bumpUsage\("finish"\)/.test(game), "independence win counts a finish");
assert.ok(/S\.hitCap = true[\s\S]{0,400}bumpUsage\("finish"\)/.test(game), "21M win counts a finish");
const shareFn = game.match(/function shareRun\(kind\) \{[\s\S]{0,200}/)[0];
assert.ok(shareFn.indexOf('bumpUsage("share")') !== -1, "shareRun counts a share");

assert.ok(/anonymous counts of games started/.test(extra), "privacy EN mentions anonymous counts");
assert.ok(/recuentos anónimos de partidas empezadas/.test(extra), "privacy ES mentions anonymous counts");
console.log("usage tests ok");
