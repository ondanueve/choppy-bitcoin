#!/usr/bin/env node
"use strict";

const fs = require("fs");
const path = require("path");
const vm = require("vm");
const assert = require("assert");

const ROOT = path.resolve(__dirname, "..");
const gameSrc = fs.readFileSync(path.join(ROOT, "game.js"), "utf8");

function body(src, head) {
  const at = src.indexOf(head);
  if (at < 0) return "";
  let depth = 0, i = src.indexOf("{", at);
  for (let j = i; j < src.length; j++) {
    if (src[j] === "{") depth++;
    else if (src[j] === "}" && --depth === 0) return src.slice(i, j + 1);
  }
  return "";
}

const amp = body(gameSrc, "function pickCycleAmp(");
const resid = body(gameSrc, "function pickCycleResid(");
const trend = body(gameSrc, "function trendBias(");
assert.ok(amp && resid && trend, "market helpers found");
assert.ok(!/Math\.random/.test(amp + resid + trend), "cycle amplitude, residual, and trend do not use Math.random");
assert.ok(/waveRand\(\)/.test(amp) && /waveRand\(\)/.test(resid) && /srand\(/.test(trend));
assert.ok(/srand\(2, n\)/.test(gameSrc), "idle price shock uses indexed srand");
assert.ok(/srand\(3, n\)/.test(gameSrc), "level-2 price uses indexed srand");
assert.ok(/S\.vtPrice = 100 \+ srand\(11, 0\)/.test(gameSrc), "continue-bonus price uses srand");
assert.ok(/function applyMarketTick/.test(gameSrc), "market ticks are applied on a fixed clock");
assert.ok(/function rollWorldSeed\(seed\)/.test(gameSrc));
assert.ok(/function startGame\(ranked, seed, mode\)/.test(gameSrc));
assert.ok(/window\.choppySimulateMarket/.test(gameSrc));

function el(id) {
  const style = {};
  const cls = new Set();
  const rec = {
    id: id || "",
    style,
    className: "",
    hidden: false,
    width: 480,
    height: 640,
    textContent: "",
    innerHTML: "",
    innerText: "",
    dataset: {},
    value: "",
    checked: false,
    disabled: false,
    children: [],
    parentNode: null,
    classList: {
      add(n) { cls.add(n); rec.className = [...cls].join(" "); },
      remove(n) { cls.delete(n); rec.className = [...cls].join(" "); },
      contains(n) { return cls.has(n); },
      toggle(n, f) { if (f === false) this.remove(n); else if (f === true || !cls.has(n)) this.add(n); else this.remove(n); }
    },
    getContext() {
      return {
        canvas: rec,
        fillRect() {}, clearRect() {}, fillText() {}, strokeRect() {},
        beginPath() {}, moveTo() {}, lineTo() {}, stroke() {}, fill() {},
        closePath() {}, arc() {}, save() {}, restore() {}, translate() {},
        rotate() {}, scale() {}, drawImage() {}, setTransform() {},
        measureText(t) { return { width: String(t).length * 8 }; },
        createLinearGradient() { return { addColorStop() {} }; },
        createRadialGradient() { return { addColorStop() {} }; }
      };
    },
    getBoundingClientRect() { return { left: 0, top: 0, right: 480, bottom: 640, width: 480, height: 640, x: 0, y: 0 }; },
    addEventListener() {},
    removeEventListener() {},
    appendChild(c) { rec.children.push(c); if (c) c.parentNode = rec; return c; },
    removeChild() {},
    insertBefore(c) { return c; },
    querySelector() { return el("q"); },
    querySelectorAll() { return []; },
    setAttribute() {},
    getAttribute() { return null; },
    removeAttribute() {},
    setPointerCapture() {},
    releasePointerCapture() {},
    closest() { return null; },
    matches() { return false; },
    focus() {},
    blur() {},
    click() {},
    getAttribute() { return null; }
  };
  rec.style.setProperty = function (k, v) { style[k] = v; };
  rec.style.getPropertyValue = function (k) { return style[k] || ""; };
  rec.style.removeProperty = function (k) { delete style[k]; };
  return rec;
}

const nodes = {};
function byId(id) {
  if (!nodes[id]) nodes[id] = el(id);
  return nodes[id];
}

const local = {};
const store = {
  getItem(k) { return Object.prototype.hasOwnProperty.call(local, k) ? local[k] : null; },
  setItem(k, v) { local[k] = String(v); },
  removeItem(k) { delete local[k]; }
};

const raf = [];
const ctx = {
  addEventListener() {},
  removeEventListener() {},
  window: null,
  document: {
    documentElement: el("html"),
    body: el("body"),
    readyState: "complete",
    head: null,
    getElementById: byId,
    querySelector() { return el("q"); },
    querySelectorAll() { return []; },
    createElement(name) { return el(name); },
    createTextNode(t) { return { nodeType: 3, textContent: String(t) }; },
    addEventListener() {},
    removeEventListener() {}
  },
  localStorage: store,
  sessionStorage: store,
  location: { search: "", href: "http://127.0.0.1/choppy-bitcoin/", hash: "", pathname: "/choppy-bitcoin/" },
  performance: { now() { return Date.now(); } },
  requestAnimationFrame(fn) { raf.push(fn); return raf.length; },
  cancelAnimationFrame() {},
  MutationObserver: function () { this.observe = function () {}; this.disconnect = function () {}; },
  URLSearchParams,
  console,
  setTimeout() { return 0; },
  clearTimeout() {},
  setInterval() { return 0; },
  clearInterval() {},
  Image: function () { this.onload = null; this.src = ""; },
  Audio: function () {},
  URL: { createObjectURL() { return ""; }, revokeObjectURL() {} },
  getComputedStyle() { return { getPropertyValue() { return ""; } }; },
  navigator: { onLine: true, language: "en", userAgent: "node" }
};
ctx.document.head = ctx.document.createElement("head");
ctx.window = ctx;
ctx.globalThis = ctx;
ctx.self = ctx;
const noop = function () {};
ctx.ArcadeAudio = {
  unlock: noop, startMusic: noop,
  sfx: new Proxy({}, { get() { return noop; } }),
  speak: noop, cancelSpeech: noop, jukeStop: noop, jukePlay: noop, jukePause: noop, jukeResume: noop,
  jukePaused() { return false; }, jukeSize() { return 0; }, jukeSplit() { return 0; },
  SWAN: [], BEAR: [], BULL: [], BUY: [], JUKE_CORE: [], SONGS: {}
};
ctx.BZ = { t(k) { return k; }, lang() { return "en"; } };
ctx.visualViewport = { addEventListener() {}, width: 480, height: 640 };

vm.createContext(ctx);
vm.runInContext(gameSrc, ctx);

const sim = ctx.choppySimulateMarket;
assert.ok(typeof sim === "function", "choppySimulateMarket is exported");

const SEED = 0xC0FFEE;
const N = 48;
const a = sim(SEED, N);
const b = sim(SEED, N);
assert.strictEqual(a.seed, SEED >>> 0);
assert.strictEqual(b.seed, a.seed);
assert.ok(a.candles >= N, "first run reached " + N + " candles, got " + a.candles + " after " + a.steps + " steps");
assert.ok(b.candles >= N, "second run reached " + N + " candles, got " + b.candles);
assert.strictEqual(a.startPrice, b.startPrice, "same seed starts at the same price");
assert.strictEqual(a.startCash, b.startCash, "same seed starts with the same cash");
assert.strictEqual(a.drift, b.drift, "same seed has the same drift");
assert.deepStrictEqual(a.tape, b.tape, "same seed produces an identical price tape");
assert.deepStrictEqual(
  a.pipes.map((p) => ({ gapY: p.gapY, gapH: p.gapH, green: p.green })),
  b.pipes.map((p) => ({ gapY: p.gapY, gapH: p.gapH, green: p.green })),
  "same seed leaves the same candle geometry"
);

const c = sim(SEED ^ 0x5a5a5a5a, N);
assert.ok(c.candles >= N, "other seed also reached " + N + " candles");
assert.notDeepStrictEqual(c.tape, a.tape, "a different seed produces a different chart");

const N2 = 32;
const fps30 = sim(SEED, N2, 30);
const fps144 = sim(SEED, N2, 144);
assert.ok(fps30.candles >= N2 && fps144.candles >= N2, "fps runs reached " + N2 + " candles");
assert.ok(fps30.ohlc.length >= N2 && fps144.ohlc.length >= N2, "fps runs recorded OHLC bars");
assert.deepStrictEqual(fps30.ohlc.slice(0, N2), fps144.ohlc.slice(0, N2), "30 fps and 144 fps produce identical OHLC for the same seed");
assert.deepStrictEqual(fps30.tape.slice(0, fps144.tape.length), fps144.tape.slice(0, fps30.tape.length), "30 fps and 144 fps produce the same price tape");

console.log("seeded-market tests ok (" + a.candles + " candles, tape " + a.tape.length + "; 30 vs 144 fps ohlc " + N2 + ")");
