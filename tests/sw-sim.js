#!/usr/bin/env node
"use strict";

// Pure checks for the service worker policy. No browser, no network, no DOM.
// Run from the repo root: node tests/sw-sim.js

const fs = require("fs");
const path = require("path");
const sw = require("../sw.js");

const ROOT = path.resolve(__dirname, "..");
const ORIGIN = "https://bitcoinizate.com";
const fails = [];

function fail(msg) {
  fails.push(String(msg));
}

function eq(actual, expected, msg) {
  if (actual !== expected) fail(msg + " (got " + JSON.stringify(actual) + ", expected " + JSON.stringify(expected) + ")");
}

function classify(url) {
  return sw.classifyRequest(url, ORIGIN);
}

function plan(url, method) {
  return sw.planFetch({ url: url, method: method || "GET", origin: ORIGIN });
}

function assertBudget(entries, limits, label) {
  const out = sw.trimArtEntries(entries, limits);
  if (out.count > limits.maxCount) fail(label + " count " + out.count + " > " + limits.maxCount);
  if (out.bytes > limits.maxBytes) fail(label + " bytes " + out.bytes + " > " + limits.maxBytes);
  if (out.keep.length !== out.count) fail(label + " keep length mismatch");
  const ids = new Set(out.keep.map((e) => e.url));
  if (ids.size !== out.keep.length) fail(label + " duplicate keep");
  out.keep.forEach((e) => {
    if (e.bytes > limits.maxBytes) fail(label + " kept an item over the budget");
  });
  entries.forEach((e) => {
    const kept = ids.has(e.url);
    const evicted = out.evict.indexOf(e.url) !== -1;
    if (kept === evicted) fail(label + " " + e.url + " is neither kept nor evicted, or both");
  });
  return out;
}

eq(sw.CACHE_VERSION.slice(0, 2), "mp", "CACHE_VERSION prefix");
eq(/^[0-9]+$/.test(sw.CACHE_VERSION.slice(2)), true, "CACHE_VERSION digits");
eq(sw.ART_MAX_COUNT, 40, "art count cap");
eq(sw.ART_MAX_BYTES, 30 * 1024 * 1024, "art byte cap");
eq(sw.cacheNames(sw.CACHE_VERSION).shell, "choppy-shell-" + sw.CACHE_VERSION, "shell cache name");
eq(sw.cacheNames().art, "choppy-art", "art cache name stays across shell bumps");

const html = fs.readFileSync(path.join(ROOT, "index.html"), "utf8");
eq(sw.shellVersionFromHtml(html), sw.CACHE_VERSION, "index.html game.js ?v= matches CACHE_VERSION");
eq(sw.shellVersionFromHtml("<script src=\"game.js?v=mp1\"></script>"), "mp1", "version parser");
eq(sw.shellVersionFromHtml("no tag"), "", "version parser miss");

const aliased = sw.scopeDocumentAliases(ORIGIN + "/choppy-bitcoin/?pwa=1");
eq(aliased.indexOf(ORIGIN + "/choppy-bitcoin/") !== -1, true, "opt-in visit also fills start_url");
eq(aliased.indexOf(ORIGIN + "/choppy-bitcoin/index.html") !== -1, true, "opt-in visit also fills index.html");
eq(sw.scopeDocumentAliases(ORIGIN + "/choppy-bitcoin/").indexOf(ORIGIN + "/choppy-bitcoin/index.html") !== -1, true, "bare scope also fills index.html");
eq(sw.scopeDocumentAliases(ORIGIN + "/choppy-bitcoin/about/").length, 0, "about is not aliased onto the game root");

const shellJs = plan(ORIGIN + "/choppy-bitcoin/game.js?v=" + sw.CACHE_VERSION);
eq(shellJs.bucket, "shell", "game.js bucket");
eq(shellJs.strategy, "stale-while-revalidate", "game.js strategy");
eq(shellJs.store, true, "game.js store");

eq(plan(ORIGIN + "/choppy-bitcoin/style.css?v=" + sw.CACHE_VERSION).strategy, "stale-while-revalidate", "css strategy");
eq(plan(ORIGIN + "/choppy-bitcoin/i18n.js?v=" + sw.CACHE_VERSION).bucket, "shell", "i18n bucket");
eq(plan(ORIGIN + "/choppy-bitcoin/").strategy, "network-first", "directory strategy");
eq(plan(ORIGIN + "/choppy-bitcoin/index.html").strategy, "network-first", "index strategy");
eq(plan(ORIGIN + "/choppy-bitcoin/index.html?pwa=1").strategy, "network-first", "opt-in document strategy");
eq(plan(ORIGIN + "/choppy-bitcoin/site.webmanifest").bucket, "html", "manifest is network-first");
eq(plan(ORIGIN + "/choppy-bitcoin/favicon-512.png").bucket, "shell", "512 icon is shell");
eq(plan(ORIGIN + "/choppy-bitcoin/favicon-maskable-512.png").bucket, "shell", "maskable icon is shell");

eq(plan(ORIGIN + "/choppy-bitcoin/chance/hero-wide.jpg?v=cin14").bucket, "art", "wide art bucket");
eq(plan(ORIGIN + "/choppy-bitcoin/chance/hero-wide.jpg?v=cin14").strategy, "cache-bounded", "wide art strategy");
eq(plan(ORIGIN + "/choppy-bitcoin/chance/hero-wide.jpg?v=cin14").fallback, "gradient", "missing art falls back to a gradient");
eq(plan(ORIGIN + "/choppy-bitcoin/chance/clip.mp4").bucket, "bypass", "chance video bypass");
eq(plan(ORIGIN + "/choppy-bitcoin/chance/clip.mp4").store, false, "video is not stored");
eq(plan(ORIGIN + "/choppy-bitcoin/intro.webm").reason, "video", "webm bypass");

eq(plan(ORIGIN + "/choppy-bitcoin/mp.js?v=" + sw.CACHE_VERSION).bucket, "bypass", "versus script bypass");
eq(plan(ORIGIN + "/choppy-bitcoin/mp.js?v=" + sw.CACHE_VERSION).store, false, "versus script not stored");
eq(plan(ORIGIN + "/choppy-bitcoin/sw.js").reason, "control", "worker script bypass");
eq(plan(ORIGIN + "/choppy-bitcoin/sw-kill.json").reason, "control", "kill file bypass");
eq(plan(ORIGIN + "/choppy-bitcoin/sw-kill.json").store, false, "kill file is never cached");

eq(classify("https://xhewdrhfofwpzfogthai.supabase.co/auth/v1/token?grant_type=password").bucket, "sensitive", "supabase auth");
eq(plan("https://xhewdrhfofwpzfogthai.supabase.co/rest/v1/profiles?select=*", "POST").store, false, "supabase write is not stored");
eq(plan("https://xhewdrhfofwpzfogthai.supabase.co/rest/v1/rpc/submit_choppy_score", "POST").fallback, "offline-json", "supabase offline response is synthetic");
eq(plan("https://cdnjs.cloudflare.com/ajax/libs/abcjs/6.7.0/abcjs-basic-min.js").bucket, "sensitive", "abcjs cdn");
eq(plan("https://cdnjs.cloudflare.com/ajax/libs/abcjs/6.7.0/abcjs-basic-min.js").store, false, "cdn is not stored");
eq(plan("https://example.com/choppy-bitcoin/game.js").reason, "cross-origin", "foreign origin bypass");
eq(plan(ORIGIN + "/site.webmanifest").reason, "out-of-scope", "hub manifest is out of scope");
eq(plan(ORIGIN + "/").reason, "out-of-scope", "hub root is out of scope");
eq(plan(ORIGIN + "/choppy-bitcoin/auth.js?access_token=abc").bucket, "sensitive", "token query is never stored");
eq(plan(ORIGIN + "/choppy-bitcoin/auth.js?access_token=abc").store, false, "token query store flag");
eq(plan(ORIGIN + "/choppy-bitcoin/game.js", "POST").store, false, "non-GET is not stored");

eq(sw.canStoreResponse({ ok: true, type: "basic", headers: { get: () => "" } }), true, "basic 200 can be stored");
eq(sw.canStoreResponse({ ok: false, type: "basic", headers: { get: () => "" } }), false, "error is not stored");
eq(sw.canStoreResponse({ ok: true, type: "opaque", headers: { get: () => "" } }), false, "opaque is not stored");
eq(sw.canStoreResponse({ ok: true, type: "basic", headers: { get: () => "no-store" } }), false, "no-store is not stored");

eq(sw.readKillFlag({ kill: false }), false, "kill false");
eq(sw.readKillFlag({ kill: true }), true, "kill true");
eq(sw.readKillFlag({ disabled: true }), true, "disabled flag");
eq(sw.readKillFlag({ kill: "true" }), false, "string true is not enough");
eq(sw.readKillFlag(null), false, "missing kill body");
eq(sw.readKillFlag("nope"), false, "kill body must be an object");

const limits = { maxCount: sw.ART_MAX_COUNT, maxBytes: sw.ART_MAX_BYTES };
const fortyOne = [];
for (let i = 0; i < 41; i++) fortyOne.push({ url: "a" + i, bytes: 1000, at: i });
const trimmed = assertBudget(fortyOne, limits, "41 images");
eq(trimmed.count, 40, "41 images keep 40");
eq(trimmed.evict.length, 1, "41 images evict one");
eq(trimmed.evict[0], "a0", "oldest image is evicted");
eq(trimmed.bytes, 40000, "kept bytes");

const heavy = [];
for (let i = 0; i < 10; i++) heavy.push({ url: "h" + i, bytes: 4 * 1024 * 1024, at: 100 + i });
const heavyOut = assertBudget(heavy, limits, "4MB images");
if (heavyOut.bytes > limits.maxBytes) fail("4MB set exceeded the budget");
eq(heavyOut.count, 7, "7 x 4MB fits in 30MB and 8 does not");
eq(heavyOut.evict.indexOf("h0") !== -1, true, "oldest heavy image leaves");
eq(heavyOut.evict.indexOf("h9") === -1, true, "newest heavy image stays");

const giant = [
  { url: "new", bytes: sw.ART_MAX_BYTES + 1, at: 5 },
  { url: "old", bytes: 100, at: 1 }
];
const giantOut = assertBudget(giant, limits, "oversize");
eq(giantOut.evict.indexOf("new") !== -1, true, "a single image over 30MB is not kept");
eq(giantOut.keep[0].url, "old", "smaller image still fits");
eq(giantOut.bytes <= limits.maxBytes, true, "oversize case stays under the cap");

let seed = 7;
function rnd() {
  seed = (seed * 1103515245 + 12345) % 2147483648;
  return seed / 2147483648;
}
for (let n = 0; n < 30; n++) {
  const entries = [];
  const count = 1 + Math.floor(rnd() * 80);
  for (let i = 0; i < count; i++) {
    entries.push({
      url: "r" + n + "-" + i,
      bytes: Math.floor(rnd() * (sw.ART_MAX_BYTES + 500000)),
      at: Math.floor(rnd() * 100000)
    });
  }
  assertBudget(entries, { maxCount: 40, maxBytes: sw.ART_MAX_BYTES }, "random " + n);
}
const empty = sw.trimArtEntries([], limits);
eq(empty.count, 0, "empty art cache");
eq(empty.bytes, 0, "empty art bytes");

[
  [{ signedIn: false, online: true }, "guest"],
  [{ signedIn: false, online: false }, "guest"],
  [{ signedIn: true, online: false }, "offline"],
  [{ signedIn: true, online: true }, "now"]
].forEach((row) => {
  const got = sw.scoreSendPlan(row[0]);
  eq(got.reason, row[1], "score plan " + row[1]);
  eq(got.retry, false, "score plan never retries later");
  eq(got.send, row[1] === "now", "score plan send bit");
});
eq(sw.scoreSendPlan({}).retry, false, "missing score context does not queue");

eq(sw.updatePlan({ waiting: true, controller: true }).notify, true, "update notifies");
eq(sw.updatePlan({ waiting: true, controller: true }).reload, "user", "update waits for the player");
eq(sw.updatePlan({ waiting: true, controller: true }).clearStorage, false, "update keeps localStorage");
eq(sw.updatePlan({ kill: true }).clearStorage, false, "kill switch keeps localStorage");
eq(sw.updatePlan({ kill: true }).unregister, true, "kill switch unregisters");
eq(sw.updatePlan({}).notify, false, "first install does not nag");

let shellBytes = 0;
sw.SHELL_PATHS.forEach((rel) => {
  const abs = path.join(ROOT, rel);
  if (!fs.existsSync(abs)) {
    fail("shell path missing: " + rel);
    return;
  }
  shellBytes += fs.statSync(abs).size;
});
const ceiling = shellBytes + sw.ART_MAX_BYTES;
if (ceiling > sw.ART_MAX_BYTES + 3 * 1024 * 1024) {
  fail("shell is larger than the 3MB allowance used for this budget (" + shellBytes + ")");
}
console.log("sw-sim: shell " + shellBytes + " bytes; art cap " + sw.ART_MAX_BYTES + " bytes; ceiling " + ceiling + " bytes");

if (fails.length) {
  fails.forEach((msg) => console.error("FAIL " + msg));
  console.error("sw-sim: " + fails.length + " failed");
  process.exit(1);
}
console.log("sw-sim: ok");
