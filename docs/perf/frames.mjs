// Frame-pacing probe for choppy-bitcoin (local tool, not loaded by the site).
// Serves a repo dir at /choppy-bitcoin/ with a test hook appended to game.js (exposes S and a few
// functions on window), then plays scripted scenarios in headless Chrome and records per frame:
//   rAF delta, time spent inside rAF callbacks (script work), sim seconds advanced (S.lifeT delta),
//   long tasks (> 50 ms) and a CPU profile (top self-time functions).
// Usage: node docs/perf/frames.mjs <repoDir> <out.json> [desktop|mobile] [secondsPerScenario]
import fs from "fs";
import http from "http";
import path from "path";
import { createRequire } from "module";
const require = createRequire(import.meta.url);
let pw;
for (const p of [process.env.PLAYWRIGHT_MODULE, "playwright", "/workspace/pw/node_modules/playwright"]) {
  if (!p) continue;
  try { pw = require(p); break; } catch (e) {}
}
if (!pw) { console.log("frames: playwright not found"); process.exit(0); }
const { chromium, devices } = pw;

const ROOT = path.resolve(process.argv[2] || ".");
const OUT = process.argv[3] || "/tmp/frames.json";
const PROFILE = process.argv[4] || "desktop";
const SECS = Number(process.argv[5] || 12);
// FAKE_HZ=90 feeds the game loop vsync timestamps of a 90 Hz screen (with JITTER_MS of noise) while
// Chrome still paints at 60: the loop only reads time from that argument, so this is what a 90 Hz phone sees.
const FAKE_HZ = Number(process.env.FAKE_HZ || 0), JITTER = Number(process.env.JITTER_MS || 0);
const MIME = { ".html": "text/html", ".js": "text/javascript", ".css": "text/css", ".json": "application/json",
  ".png": "image/png", ".jpg": "image/jpeg", ".svg": "image/svg+xml", ".webmanifest": "application/manifest+json", ".ico": "image/x-icon" };
const HOOK = "\n;(function(){try{window.__probe={S:function(){return window.__probeS&&window.__probeS();}};}catch(e){}})();\n";

function patchGame(src) {
  // Expose the closure state for the probe only. The site never loads this.
  const at = src.indexOf("window.startChoppy = startGame;");
  if (at < 0) throw new Error("hook anchor missing");
  const hook = "window.__probeS=()=>S;window.__probeBegin=beginCycle;window.__probeDeal=(id)=>{window.__arcForce=id;try{dealChance();}finally{window.__arcForce=\"\";}};window.__probeFlap=()=>flap();";
  let out = src.slice(0, at) + hook + src.slice(at) + HOOK;
  // Record where draw() puts the first candle each frame (pacing check).
  out = out.replace("      p.wx = wx;\n", "      p.wx = wx; if (window.__dx && p === S.pipes[0] && S.phase === \"play\") window.__dx.push([window.__gameT || 0, p.x, p.gapY]);\n");
  return out;
}

const server = http.createServer((req, res) => {
  let u = decodeURIComponent(req.url.split("?")[0]);
  if (!u.startsWith("/choppy-bitcoin/")) { res.writeHead(404); return res.end(); }
  let f = path.join(ROOT, u.slice("/choppy-bitcoin/".length));
  if (u.endsWith("/")) f = path.join(f, "index.html");
  fs.readFile(f, (err, buf) => {
    if (err) { res.writeHead(404); return res.end(); }
    if (f.endsWith(path.sep + "game.js") && path.dirname(f) === ROOT) buf = Buffer.from(patchGame(buf.toString("utf8")));
    res.writeHead(200, { "content-type": MIME[path.extname(f)] || "application/octet-stream", "cache-control": "no-cache" });
    res.end(buf);
  });
});
await new Promise((r) => server.listen(0, "127.0.0.1", r));
const URL = "http://127.0.0.1:" + server.address().port + "/choppy-bitcoin/?lang=en";

const browser = await chromium.launch({ executablePath: process.env.CHROME_PATH || "/usr/bin/google-chrome", headless: true,
  args: ["--autoplay-policy=no-user-gesture-required", "--enable-gpu-rasterization", "--ignore-gpu-blocklist"] });
const ctxOpts = PROFILE === "mobile" ? Object.assign({}, devices["Pixel 5"]) : { viewport: { width: 1280, height: 900 }, deviceScaleFactor: 2 };
const context = await browser.newContext(ctxOpts);
const page = await context.newPage();
const errors = [];
page.on("pageerror", (e) => errors.push(String(e)));
page.on("console", (m) => { if (m.type() === "error") errors.push(m.text()); });
page.on("response", (r) => { if (r.status() >= 400) errors.push(r.status() + " " + r.url()); });
await page.addInitScript(([hz, jit]) => {
  window.__fakeHz = hz; window.__jit = jit;
  // Time every rAF callback: total script work per frame.
  const raf = window.requestAnimationFrame.bind(window);
  window.__work = 0;
  let n = 0, seed = 12345; const rnd = () => { seed = (seed * 1664525 + 1013904223) >>> 0; return seed / 4294967296; };
  let fakeBase = null, lastFrame = -1, fakeNow = 0;
  window.requestAnimationFrame = (cb) => raf((t) => {
    if (hz) {
      if (fakeBase == null) fakeBase = t;
      if (t !== lastFrame) { lastFrame = t; n++; fakeNow = fakeBase + n * 1000 / hz + (rnd() * 2 - 1) * jit; }
      window.__gameT = fakeNow;
    } else window.__gameT = t + (jit ? 0 : 0);
    const a = performance.now(); try { cb(hz ? fakeNow : t); } finally { window.__work += performance.now() - a; }
  });
  window.__long = [];
  try { new PerformanceObserver((l) => { for (const e of l.getEntries()) window.__long.push(e.duration); }).observe({ entryTypes: ["longtask"] }); } catch (e) {}
}, [FAKE_HZ, JITTER]);
const client = await context.newCDPSession(page);
if (PROFILE === "mobile") await client.send("Emulation.setCPUThrottlingRate", { rate: 4 });
await page.goto(URL, { waitUntil: "load" });
await page.waitForFunction(() => typeof window.startChoppy === "function" && window.__probeS, null, { timeout: 60000 });
await page.waitForTimeout(1500);

async function perfMetrics() {
  const m = await client.send("Performance.getMetrics");
  const o = {}; for (const r of m.metrics) o[r.name] = r.value; return o;
}
let m0 = null;
async function arm() {
  try { await client.send("Performance.enable"); } catch (e) {}
  m0 = await perfMetrics();
  await page.evaluate(() => {
    window.__ovMut = 0; window.__dx = [];
    if (!window.__ovObs) { const ov = document.getElementById("overlay"); window.__ovObs = new MutationObserver((l) => { window.__ovMut += l.length; }); if (ov) window.__ovObs.observe(ov, { attributes: true, childList: true }); }
    window.__rec = { dt: [], work: [], sim: [], play: [] };
    window.__long = [];
    let last = performance.now(), lastW = window.__work, lastSim = null;
    const tick = (t) => {
      const S = window.__probeS();
      const sim = S ? S.lifeT : 0;
      window.__rec.dt.push(t - last); window.__rec.work.push(window.__work - lastW);
      window.__rec.sim.push(lastSim == null ? 0 : sim - lastSim); window.__rec.play.push(S && S.phase === "play" ? 1 : 0);
      const wk = window.__work - lastW; if (wk > 6) (window.__rec.spikes = window.__rec.spikes || []).push([+wk.toFixed(1), S && S.phase, S && S.power, window.__lastAct || ""]);
      last = t; lastW = window.__work; lastSim = sim;
      if (window.__recOn) requestAnimationFrame(tick);
    };
    window.__recOn = true;
    requestAnimationFrame(tick);
  });
}
function stats(a) {
  const s = a.slice().sort((x, y) => x - y);
  const q = (p) => s.length ? s[Math.min(s.length - 1, Math.floor(p * s.length))] : 0;
  const mean = s.reduce((x, y) => x + y, 0) / (s.length || 1);
  return { n: s.length, mean: +mean.toFixed(2), p50: +q(0.5).toFixed(2), p95: +q(0.95).toFixed(2), p99: +q(0.99).toFixed(2), max: +(s[s.length - 1] || 0).toFixed(2) };
}
async function collect(name) {
  const r = await page.evaluate(() => { window.__recOn = false; const dx = window.__dx; window.__dx = null; return { rec: window.__rec, long: window.__long.slice(), ovMut: window.__ovMut, dx }; });
  // On-screen candle motion: per frame, how far the first candle moved vs. what its speed says for that
  // frame's time. Speed = median px/ms over the surrounding 15 frames (boosts change it slowly).
  const mv = [];
  for (let i = 1; i < (r.dx || []).length; i++) {
    const a = r.dx[i - 1], b = r.dx[i];
    if (a[2] !== b[2] || !(b[0] > a[0])) continue;
    mv.push([b[0] - a[0], b[1] - a[1]]);
  }
  const errs = [];
  for (let i = 0; i < mv.length; i++) {
    const win = mv.slice(Math.max(0, i - 7), i + 8).map((m) => m[1] / m[0]).sort((x, y) => x - y);
    const v = win[win.length >> 1];
    errs.push(Math.abs(mv[i][1] - v * mv[i][0]));
  }
  const motion = Object.assign(stats(errs), { hitchPct: errs.length ? +(100 * errs.filter((e) => e > 1.5).length / errs.length).toFixed(1) : 0 });
  const m1 = await perfMetrics();
  const secs = (m1.Timestamp - m0.Timestamp) || 1;
  const per = (k) => +(((m1[k] || 0) - (m0[k] || 0)) / secs).toFixed(3);
  const main = { layoutsPerSec: per("LayoutCount"), stylePerSec: per("RecalcStyleCount"), layoutMsPerSec: +(per("LayoutDuration") * 1000).toFixed(1),
    styleMsPerSec: +(per("RecalcStyleDuration") * 1000).toFixed(1), scriptMsPerSec: +(per("ScriptDuration") * 1000).toFixed(1), taskMsPerSec: +(per("TaskDuration") * 1000).toFixed(1), overlayMutPerSec: +(r.ovMut / secs).toFixed(1) };
  const dt = r.rec.dt.slice(2), work = r.rec.work.slice(2), sim = r.rec.sim.slice(2), play = r.rec.play.slice(2);
  // Judder: frames where the sim advanced 0 or >=2 steps of 1/60 while the frame interval was ~1 vsync.
  let judder = 0, frames60 = 0;
  for (let i = 0; i < dt.length; i++) {
    if (play[i] && play[i - 1] && dt[i] > 12 && dt[i] < 21) { frames60++; const st = Math.round(sim[i] * 60); if (st !== 1) judder++; }
  }
  return { name, motion, main, spikes: (r.rec.spikes || []).slice(0, 12), frame: stats(dt), work: stats(work), dropped: dt.filter((x) => x > 20).length, long: r.long.length,
    longMax: r.long.length ? Math.max(...r.long) : 0, simJudderPct: frames60 ? +(100 * judder / frames60).toFixed(1) : 0 };
}

const SCEN = {
  play: async () => {},
  waves: async (i) => {
    const kinds = [["BULL"], ["BEAR"], ["BEAR", "SWAN"], ["BULL", "HALVE"]];
    const k = kinds[i % kinds.length];
    await page.evaluate((k) => { try { window.__lastAct = "begin " + k.join("/"); window.__probeBegin(k[0], k[1]); } catch (e) {} }, k);
  },
  cards: async (i) => {
    const ids = ["landfill", "taxbill", "notYet", "phish", "casino", "poker", "wedding", "honeymoon"];
    await page.evaluate((id) => {
      const S = window.__probeS();
      if (S.phase !== "play") { const b = document.querySelector("#overlay button.cta, #overlay .chance-opt, #overlay button"); if (b) b.click(); }
      if (S.phase === "play") { window.__lastAct = "deal " + id; window.__probeDeal(id); }
    }, ids[i % ids.length]);
    await page.waitForTimeout(1200);
    await page.evaluate(() => { window.__lastAct = "pick"; const b = document.querySelector("#overlay .chance-opts button, #overlay button.chance-btn, #overlay button"); if (b) b.click(); });
    await page.waitForTimeout(600);
    await page.evaluate(() => { const S = window.__probeS(); if (S.phase !== "play") { const b = document.querySelector("#overlay button"); if (b) b.click(); } });
  }
};

const results = [];
for (const name of Object.keys(SCEN)) {
  await page.evaluate(() => {
    if (window.__flapT) clearInterval(window.__flapT);
    try { window.startChoppy(false); } catch (e) {}
    window.__flapT = setInterval(() => {
      const S = window.__probeS(); if (!S) return;
      if (S.phase === "play") { S.invuln = Math.max(S.invuln || 0, 3); if (S.bird.y > S.H * 0.5 || S.bird.v > 80) window.__probeFlap(); }
    }, 60);
  });
  await page.waitForTimeout(1500);
  try { await client.send("Profiler.enable"); await client.send("Profiler.setSamplingInterval", { interval: 200 }); await client.send("Profiler.start"); } catch (e) {}
  await arm();
  const t0 = Date.now(); let i = 0;
  while (Date.now() - t0 < SECS * 1000) { await SCEN[name](i++); await page.waitForTimeout(name === "play" ? 1000 : 2500); }
  const r = await collect(name);
  try {
    const { profile } = await client.send("Profiler.stop");
    const self = new Map(); const byId = new Map(profile.nodes.map((n) => [n.id, n]));
    const dts = profile.timeDeltas; let total = 0;
    profile.samples.forEach((id, k) => { const n = byId.get(id); const key = n.callFrame.functionName + " " + (n.callFrame.url || "").split("/").pop().split("?")[0] + ":" + n.callFrame.lineNumber; const d = dts[k] || 0; total += d; self.set(key, (self.get(key) || 0) + d); });
    r.topSelf = [...self.entries()].filter(([k]) => !/^\(idle\)|^\(program\)/.test(k)).sort((a, b) => b[1] - a[1]).slice(0, 14).map(([k, v]) => [k, +(100 * v / total).toFixed(2)]);
  } catch (e) {}
  results.push(r);
  console.log(JSON.stringify(r));
}
await page.screenshot({ path: OUT.replace(/\.json$/, ".png") });
fs.writeFileSync(OUT, JSON.stringify({ profile: PROFILE, results, errors }, null, 1));
console.log("errors", errors.length, errors.slice(0, 3));
await browser.close();
server.close();
