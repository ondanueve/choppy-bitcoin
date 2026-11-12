"use strict";

const fs = require("fs");
const path = require("path");
const vm = require("vm");

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
    click() {}
  };
  rec.style.setProperty = function (k, v) { style[k] = v; };
  rec.style.getPropertyValue = function (k) { return style[k] || ""; };
  rec.style.removeProperty = function (k) { delete style[k]; };
  return rec;
}

function loadChoppySim(rootDir) {
  const ROOT = rootDir || path.resolve(__dirname, "..");
  const gameSrc = fs.readFileSync(path.join(ROOT, "game.js"), "utf8");
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
  if (typeof ctx.choppySimulateMarket !== "function") {
    throw new Error("choppySimulateMarket is not exported");
  }
  return ctx;
}

module.exports = { loadChoppySim };
