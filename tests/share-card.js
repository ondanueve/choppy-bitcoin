#!/usr/bin/env node
"use strict";

const fs = require("fs");
const path = require("path");
const vm = require("vm");
const assert = require("assert");

const ROOT = path.resolve(__dirname, "..");
const src = fs.readFileSync(path.join(ROOT, "share-card.js"), "utf8");
const game = fs.readFileSync(path.join(ROOT, "game.js"), "utf8");
const i18n = fs.readFileSync(path.join(ROOT, "i18n.js"), "utf8");

assert.ok(game.indexOf("share-card.js?v=mp229") !== -1, "game lazy-loads share-card.js");
assert.ok(/function loadShareCard\(cb\)/.test(game));
assert.ok(/function fallbackShare\(blob, text, url\)/.test(game));
assert.ok(game.indexOf("share-icon.png") < 0, "generic share icon is no longer the card");
assert.ok(game.indexOf("navigator.share") !== -1);
assert.ok(game.indexOf("downloadShareBlob") !== -1);
assert.ok(game.indexOf("clipboard.writeText") !== -1);

for (const key of ["shareCopied", "shareSaved", "shareChart", "shareEmpty"]) {
  const en = new RegExp(key + ":\\s*\"[^\"]+\"");
  const es = new RegExp(key + ":\\s*\"[^\"]+\"");
  const hits = i18n.match(new RegExp(key + ":\\s*\"[^\"]+\"", "g")) || [];
  assert.strictEqual(hits.length, 2, key + " exists in EN and ES");
}
assert.ok(i18n.indexOf('shareCopied: "Copiado"') !== -1);
assert.ok(i18n.indexOf('shareSaved: "Imagen guardada"') !== -1);
assert.ok(i18n.indexOf('shareEmpty: "No hay gráfico de esta partida"') !== -1);

class MockCtx {
  constructor() { this.ops = []; this.fillStyle = ""; this.strokeStyle = ""; this.font = ""; this.textAlign = "left"; this.lineWidth = 1; this.lineJoin = ""; this.lineCap = ""; }
  fillRect() { this.ops.push("fillRect"); }
  fillText(t) { this.ops.push("fillText:" + t); }
  beginPath() { this.ops.push("beginPath"); }
  moveTo() { this.ops.push("moveTo"); }
  lineTo() { this.ops.push("lineTo"); }
  stroke() { this.ops.push("stroke"); }
  fill() { this.ops.push("fill"); }
  save() { this.ops.push("save"); }
  restore() { this.ops.push("restore"); }
  rect() {}
  clip() {}
  closePath() {}
  arcTo() {}
  measureText(t) { return { width: String(t).length * 8 }; }
  createLinearGradient() { return { addColorStop() {} }; }
  createRadialGradient() { return { addColorStop() {} }; }
}

class MockCanvas {
  constructor() { this.width = 0; this.height = 0; this.ctx = new MockCtx(); }
  getContext() { return this.ctx; }
  toBlob(cb) { cb({ type: "image/png", size: 8 }); }
}

const canvas = new MockCanvas();
const ctx = {
  document: { createElement(name) { assert.strictEqual(name, "canvas"); return canvas; } },
  Blob: class Blob { constructor() { this.type = "image/png"; } }
};
vm.createContext(ctx);
vm.runInContext(src, ctx);

const drawn = ctx.choppyDrawShareCard({
  bag: "3.21 BTC",
  headline: "Rekt",
  kicker: "Run over",
  tone: "rekt",
  tape: [100, 120, 90, 140],
  url: "bitcoinizate.com/choppy-bitcoin/"
}, canvas);
assert.strictEqual(drawn, canvas);
assert.strictEqual(canvas.width, 1200);
assert.strictEqual(canvas.height, 630);
assert.ok(canvas.ctx.ops.some((o) => o === "fillText:3.21 BTC"));
assert.ok(canvas.ctx.ops.some((o) => o === "fillText:Rekt"));
assert.ok(canvas.ctx.ops.some((o) => o === "stroke"), "sparkline is drawn");

const dailyCanvas = new MockCanvas();
ctx.document.createElement = function (name) { assert.strictEqual(name, "canvas"); return dailyCanvas; };
const daily = ctx.choppyDrawShareCard({
  bag: "1.00 BTC",
  headline: "Rekt",
  kicker: "Candle of the day",
  subline: "Candle of the day · 2026-11-11 · Rank #3",
  tone: "rekt",
  tape: [100, 110],
  url: "bitcoinizate.com/choppy-bitcoin/"
}, dailyCanvas);
assert.strictEqual(daily, dailyCanvas);
assert.ok(dailyCanvas.ctx.ops.some((o) => o === "fillText:Candle of the day"));
assert.ok(dailyCanvas.ctx.ops.some((o) => o === "fillText:Candle of the day · 2026-11-11 · Rank #3"));

console.log("share-card tests ok");
