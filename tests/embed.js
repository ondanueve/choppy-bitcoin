#!/usr/bin/env node
"use strict";

// Embed mode (?embed=1): today's Ranked in a third-party iframe.
// Static checks on game.js / index.html / i18n.js, plus the inline head script run in a VM
// with blocked storage (sandboxed or third-party iframes throw on localStorage).

const fs = require("fs");
const path = require("path");
const vm = require("vm");
const assert = require("assert");

const ROOT = path.resolve(__dirname, "..");
const game = fs.readFileSync(path.join(ROOT, "game.js"), "utf8");
const index = fs.readFileSync(path.join(ROOT, "index.html"), "utf8");
const i18n = fs.readFileSync(path.join(ROOT, "i18n.js"), "utf8");
const about = fs.readFileSync(path.join(ROOT, "about/index.html"), "utf8");
const css = fs.readFileSync(path.join(ROOT, "style.css"), "utf8");
const sw = fs.readFileSync(path.join(ROOT, "sw.js"), "utf8");

// Flag and helpers live in game.js, with no extra startup script.
assert.ok(/const EMBED = !!window\.choppyEmbed;/.test(game), "game.js reads the embed flag");
assert.ok(game.indexOf('const EMBED_URL = "https://bitcoinizate.com/choppy-bitcoin/?embed=1";') !== -1, "embed URL is the public ?embed=1 path");
assert.ok(!/<script[^>]+embed[^>]*\.js/.test(index), "no extra embed script on the startup path");

// The snippet: 400 px wide, sensible height, no sandbox that would block storage or scripts.
const snipFn = game.match(/function embedSnippet\(\) \{[\s\S]*?\n  \}/);
assert.ok(snipFn, "embedSnippet exists");
const snippet = vm.runInNewContext("(function(){ const EMBED_URL = 'https://bitcoinizate.com/choppy-bitcoin/?embed=1'; " + snipFn[0] + " return embedSnippet(); })()");
assert.ok(/^<iframe src="https:\/\/bitcoinizate\.com\/choppy-bitcoin\/\?embed=1"/.test(snippet), "snippet points at the embed URL");
assert.ok(/ width="400"/.test(snippet) && / height="640"/.test(snippet), "snippet is 400x640");
assert.ok(/ title="[^"]+"/.test(snippet), "snippet has an accessible title");
assert.ok(/clipboard-write/.test(snippet), "snippet allows clipboard-write for Copy result");
assert.ok(!/sandbox=/.test(snippet), "snippet does not sandbox the frame");
const aboutSnip = (about.match(/<textarea id="embed-code"[^>]*>([^<]*)<\/textarea>/) || [])[1] || "";
assert.strictEqual(aboutSnip.replace(/&lt;/g, "<").replace(/&gt;/g, ">"), snippet, "about page shows the same snippet as the game");
assert.ok(/id="embed-copy"/.test(about) && /navigator\.clipboard/.test(about), "about page has a copy button");

// Backlink: visible, new tab, noopener, never navigates the top window.
assert.ok(/<a id="embed-full"[^>]*href="https:\/\/bitcoinizate\.com\/choppy-bitcoin\/"[^>]*target="_blank"[^>]*rel="noopener"/.test(index), "persistent backlink in index.html");
const fullFn = game.match(/function embedFullHtml\(\) \{[\s\S]*?\n  \}/);
assert.ok(fullFn && /target=\\"_blank\\" rel=\\"noopener\\"/.test(fullFn[0]), "overlay backlink opens a new tab with noopener");
assert.ok(/html\.embed \.embed-full \{ display: block;/.test(css) && /^\.embed-full \{ display: none; \}/m.test(css), "backlink only shows in embed mode");
const embedCssAt = css.indexOf("/* Embed (?embed=1)");
const cssBefore = css.slice(0, embedCssAt).replace(/\/\*[\s\S]*?\*\//g, "");
assert.ok(embedCssAt > 0 && (cssBefore.match(/\{/g) || []).length === (cssBefore.match(/\}/g) || []).length, "embed CSS sits at top level, not nested in an open block");
for (const src of [game, index]) {
  assert.ok(!/\btop\.location|window\.top\b|parent\.location/.test(src), "no top-navigation hijacking");
}

// Embed title screen: Ranked only, no Training / Versus / awards.
const ready = game.match(/if \(EMBED\) \{\n {10}overlay\.innerHTML = "<h1>Choppy Bitcoin<\/h1>"[\s\S]*?\n {10}return;\n {8}\}/);
assert.ok(ready, "embed title branch exists");
assert.ok(/startGame\(true, null, "daily"\)/.test(ready[0]), "embed plays today's daily seed");
assert.ok(!/go-train|go-mp|go-challenge|awardListHtml/.test(ready[0]), "embed title hides Training, Versus, challenges and awards");
assert.ok(/embedFullHtml\(\)/.test(ready[0]) && /embedGuest/.test(ready[0]), "embed title links back and explains guest play");
assert.ok(/if \(ch && !EMBED\) S\.pendingChallenge = ch;/.test(game), "challenge links are ignored inside the embed");
assert.ok(/const room = EMBED \? "" :/.test(game), "Versus room links are ignored inside the embed");
assert.ok((game.match(/\(EMBED \? embedFullHtml\(\) : donateBlock\(\)\)/g) || []).length === 2, "end screens link back instead of the donation block");

// Options: no PWA / feedback in the embed; the full game offers the snippet.
assert.ok(/\(EMBED \? "" : "<button type=\\"button\\" class=\\"cta opt-item\\" id=\\"opt-pwa\\">/.test(game), "PWA toggle hidden in embed");
assert.ok(/id=\\"opt-embed\\"/.test(game) && /S\.optPanel = "embed"/.test(game), "Options has an Embed panel");
assert.ok(/id=\\"embed-code\\"/.test(game) && /id=\\"embed-copy\\"/.test(game), "Embed panel has code and copy button");
assert.ok(/if \(EMBED \|\| !\("serviceWorker" in navigator\)\) return;/.test(game), "embed never registers or unregisters the service worker");
assert.ok(!/frame-ancestors|X-Frame-Options/i.test(index + sw), "nothing in the page or worker blocks framing");

// Bilingual strings.
for (const k of ["embedFull", "embedOpt", "embedTitle", "embedNote", "embedCopy", "embedGuest"]) {
  const n = (i18n.match(new RegExp("\\b" + k + ": \"", "g")) || []).length;
  assert.strictEqual(n, 2, k + " has EN and ES");
}
assert.ok(i18n.indexOf('embedOpt: "Insertar"') !== -1 && i18n.indexOf("Juega el juego completo") !== -1);

// Inline head script: blocked storage falls back to memory; ?embed=1 sets the flag and class.
const inline = index.match(/<script>(\(function\(\)\{function m\(\)[\s\S]*?)<\/script>/);
assert.ok(inline, "storage fallback + embed flag run inline in <head>");
function runHead(search, blocked) {
  const html = { className: "" };
  const deny = { get() { throw new Error("SecurityError"); }, configurable: true };
  const win = { location: { search: search }, document: { documentElement: html } };
  if (blocked) {
    Object.defineProperty(win, "localStorage", deny);
    Object.defineProperty(win, "sessionStorage", deny);
  } else {
    const real = () => { const d = {}; return { getItem: (k) => (k in d ? d[k] : null), setItem: (k, v) => { d[k] = String(v); }, removeItem: (k) => { delete d[k]; } }; };
    win.localStorage = real();
    win.sessionStorage = real();
  }
  win.window = win;
  vm.runInNewContext(inline[1], win);
  return win;
}
const blocked = runHead("?embed=1", true);
assert.strictEqual(blocked.choppyEmbed, true, "embed flag set");
assert.ok(/\bembed\b/.test(blocked.document.documentElement.className), "html.embed class set before paint");
blocked.localStorage.setItem("choppy-onboard", "1");
assert.strictEqual(blocked.localStorage.getItem("choppy-onboard"), "1", "memory storage works when localStorage is blocked");
assert.strictEqual(blocked.localStorage.getItem("missing"), null);
blocked.sessionStorage.setItem("a", 2);
assert.strictEqual(blocked.sessionStorage.getItem("a"), "2");
assert.strictEqual(blocked.localStorage.length, 1);
const open = runHead("?seed=5", false);
assert.ok(!open.choppyEmbed && !/embed/.test(open.document.documentElement.className), "plain page is not in embed mode");
open.localStorage.setItem("k", "v");
assert.strictEqual(open.localStorage.getItem("k"), "v", "working storage is left alone");
assert.ok(!runHead("?embed=10", false).choppyEmbed, "only embed=1 turns embed on");
assert.ok(runHead("?lang=es&embed=1", false).choppyEmbed, "embed=1 works after other params");

console.log("embed: ok");
