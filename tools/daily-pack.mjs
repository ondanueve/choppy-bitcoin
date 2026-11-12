#!/usr/bin/env node
// Build a free English "Today's candle" pack from the seeded market. Does not post anywhere.
"use strict";

import { createRequire } from "module";
import fs from "fs";
import path from "path";
import { fileURLToPath } from "url";

const require = createRequire(import.meta.url);
const { loadChoppySim } = require("./choppy-sim.cjs");

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const ROOT = path.resolve(__dirname, "..");
const DEFAULT_N = 48;
const PLAY_URL = "https://bitcoinizate.com/choppy-bitcoin/";

function argValue(name, fallback) {
  const i = process.argv.indexOf(name);
  if (i < 0 || i + 1 >= process.argv.length) return fallback;
  return process.argv[i + 1];
}

function utcDayKey(d) {
  const x = d || new Date();
  const m = String(x.getUTCMonth() + 1).padStart(2, "0");
  const day = String(x.getUTCDate()).padStart(2, "0");
  return x.getUTCFullYear() + "-" + m + "-" + day;
}

function fmtPct(n) {
  const v = Number(n);
  const sign = v > 0 ? "+" : "";
  return sign + v.toFixed(1) + "%";
}

function fmtPx(n) {
  const v = Number(n);
  if (!Number.isFinite(v)) return "0";
  return v.toFixed(v >= 100 ? 1 : 2);
}

function stdev(values) {
  if (!values.length) return 0;
  const mean = values.reduce((a, b) => a + b, 0) / values.length;
  const varn = values.reduce((a, b) => a + (b - mean) * (b - mean), 0) / values.length;
  return Math.sqrt(varn);
}

function chartStats(ohlc) {
  const bars = (ohlc || []).filter((b) => b && Number.isFinite(b.o) && Number.isFinite(b.c));
  if (!bars.length) {
    return { start: 0, end: 0, changePct: 0, high: 0, low: 0, volatility: 0, up: 0, down: 0, flat: 0 };
  }
  const start = bars[0].o;
  const end = bars[bars.length - 1].c;
  let high = -Infinity, low = Infinity, up = 0, down = 0, flat = 0;
  const rets = [];
  for (const b of bars) {
    const h = Number.isFinite(b.h) ? b.h : Math.max(b.o, b.c);
    const l = Number.isFinite(b.l) ? b.l : Math.min(b.o, b.c);
    if (h > high) high = h;
    if (l < low) low = l;
    if (b.c > b.o) up++;
    else if (b.c < b.o) down++;
    else flat++;
    if (b.o) rets.push((b.c - b.o) / b.o);
  }
  return {
    start, end,
    changePct: start ? ((end - start) / start) * 100 : 0,
    high, low,
    volatility: stdev(rets) * 100,
    up, down, flat
  };
}

function describeChart(date, n, stats) {
  const dir = stats.changePct > 0.15 ? "closed higher" : stats.changePct < -0.15 ? "closed lower" : "finished almost flat";
  return "Today's candle " + date + " (" + n + " candles) " + dir + " at "
    + fmtPct(stats.changePct) + ". Range " + fmtPx(stats.low) + "–" + fmtPx(stats.high)
    + ", candle volatility " + stats.volatility.toFixed(2) + "%, "
    + stats.up + " up / " + stats.down + " down / " + stats.flat + " flat.";
}

function trim280(text) {
  const s = String(text || "").trim();
  if (s.length <= 280) return s;
  return s.slice(0, 279).replace(/\s+\S*$/, "").replace(/[.,;: ]+$/, "") + "…";
}

function buildPosts(date, seed, url, n, stats) {
  const move = fmtPct(stats.changePct);
  const range = fmtPx(stats.low) + "–" + fmtPx(stats.high);
  const a = trim280(
    "Today's candle on Choppy Bitcoin (" + date + "): " + move
    + " over " + n + " candles, range " + range
    + ". Same chart for everyone until 00:00 UTC. Play: " + url
  );
  const b = trim280(
    "Candle of the day " + date + " " + (stats.changePct >= 0 ? "rose" : "fell") + " " + move
    + " (high " + fmtPx(stats.high) + ", low " + fmtPx(stats.low)
    + "). One seed for the whole board. " + url
  );
  const c = trim280(
    "Choppy Bitcoin daily ranked " + date + ": seed " + seed
    + ", " + n + " candles, " + stats.up + " green / " + stats.down + " red. Beat today's bag: " + url
  );
  return [
    { id: "short", text: a },
    { id: "chart", text: b },
    { id: "challenge", text: c }
  ];
}

function sparklineSvg(ohlc, stats) {
  const w = 1200, h = 630, pad = 48;
  const closes = (ohlc || []).map((b) => Number(b && b.c)).filter(Number.isFinite);
  const lo = Math.min.apply(null, closes.length ? closes : [0]);
  const hi = Math.max.apply(null, closes.length ? closes : [1]);
  const span = (hi - lo) || 1;
  const pts = closes.map((y, i) => {
    const x = pad + (i / Math.max(closes.length - 1, 1)) * (w - pad * 2);
    const yy = pad + (1 - (y - lo) / span) * (h - pad * 2);
    return x.toFixed(1) + "," + yy.toFixed(1);
  }).join(" ");
  const color = stats.changePct >= 0 ? "#16a34a" : "#dc2626";
  const bg = "#0d0d0d";
  const title = "Today's candle  " + fmtPct(stats.changePct);
  const sub = "Choppy Bitcoin";
  return '<?xml version="1.0" encoding="UTF-8"?>\n'
    + '<svg xmlns="http://www.w3.org/2000/svg" width="' + w + '" height="' + h + '" viewBox="0 0 ' + w + " " + h + '">'
    + '<rect width="100%" height="100%" fill="' + bg + '"/>'
    + '<text x="' + pad + '" y="40" fill="#f7931a" font-family="ui-sans-serif,system-ui,sans-serif" font-size="28">' + sub + "</text>"
    + '<text x="' + pad + '" y="86" fill="#f4f4f5" font-family="ui-sans-serif,system-ui,sans-serif" font-size="44" font-weight="700">' + title + "</text>"
    + (pts ? '<polyline fill="none" stroke="' + color + '" stroke-width="5" stroke-linejoin="round" stroke-linecap="round" points="' + pts + '"/>' : "")
    + "</svg>\n";
}

function markdown(pack) {
  const posts = pack.posts.map((p) => "### " + p.id + "\n\n" + p.text + "\n").join("\n");
  return "# Today's candle " + pack.date + "\n\n"
    + pack.chart.description + "\n\n"
    + "- Seed: `" + pack.seed + "`\n"
    + "- Link: " + pack.url + "\n"
    + "- Candles: " + pack.candles + "\n"
    + "- Change: " + fmtPct(pack.chart.changePct) + "\n"
    + "- Range: " + fmtPx(pack.chart.low) + "–" + fmtPx(pack.chart.high) + "\n"
    + "- Volatility: " + pack.chart.volatility.toFixed(2) + "%\n"
    + (pack.og ? "- OG image: " + pack.og + "\n" : "")
    + "\nThis pack is for the Community Manager. It does not post itself.\n\n"
    + "## Post variants (under 280 characters)\n\n" + posts;
}

function main() {
  const day = argValue("--day", utcDayKey(new Date()));
  const outDir = path.resolve(argValue("--out", path.join(ROOT, "daily-pack")));
  const n = Math.max(8, Number(argValue("--candles", DEFAULT_N)) || DEFAULT_N);
  const ctx = loadChoppySim(ROOT);
  const seed = ctx.choppyDailySeed(new Date(day + "T00:00:00Z"));
  const sim = ctx.choppySimulateMarket(seed, n, 60);
  const ohlc = (sim.ohlc || []).slice(0, n);
  const stats = chartStats(ohlc);
  const url = PLAY_URL + "?seed=" + seed;
  const pack = {
    date: day,
    seed: seed,
    url: url,
    candles: ohlc.length,
    chart: {
      start: stats.start,
      end: stats.end,
      changePct: Number(stats.changePct.toFixed(4)),
      high: stats.high,
      low: stats.low,
      volatility: Number(stats.volatility.toFixed(4)),
      up: stats.up,
      down: stats.down,
      flat: stats.flat,
      description: describeChart(day, ohlc.length, stats)
    },
    posts: buildPosts(day, seed, url, ohlc.length, stats),
    og: "daily-pack/" + day + ".svg",
    generatedAt: new Date().toISOString()
  };
  fs.mkdirSync(outDir, { recursive: true });
  const jsonPath = path.join(outDir, day + ".json");
  const mdPath = path.join(outDir, day + ".md");
  const svgPath = path.join(outDir, day + ".svg");
  fs.writeFileSync(jsonPath, JSON.stringify(pack, null, 2) + "\n");
  fs.writeFileSync(mdPath, markdown(pack));
  fs.writeFileSync(svgPath, sparklineSvg(ohlc, stats));
  fs.writeFileSync(path.join(outDir, "latest.json"), JSON.stringify(pack, null, 2) + "\n");
  fs.writeFileSync(path.join(outDir, "latest.md"), markdown(pack));
  fs.writeFileSync(path.join(outDir, "latest.svg"), sparklineSvg(ohlc, stats));
  console.log("daily pack " + day + " seed=" + seed + " wrote " + outDir);
  return pack;
}

main();
