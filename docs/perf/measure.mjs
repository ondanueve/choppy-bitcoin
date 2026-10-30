// Mobile perf probe for choppy-bitcoin. Same method before and after.
// Chrome DevTools "Fast 3G": latency 562.5 ms, down 1.6 Mbps * 0.9, up 750 Kbps * 0.9, CPU 4x.
// Usage: node docs/perf/measure.mjs http://127.0.0.1:8080/choppy-bitcoin/ /tmp/perf-result.json 60000
// Playwright is a local tool, not a site dependency. This environment resolved it from the pnpm path below.
import fs from "fs";
let chromium, devices;
try {
  ({ chromium, devices } = await import("playwright"));
} catch (e) {
  ({ chromium, devices } = await import("/usr/local/lib/pnpm/5/.pnpm/playwright@1.63.0-alpha-2026-08-31/node_modules/playwright/index.mjs"));
}

const URL = process.argv[2] || "http://127.0.0.1:8080/choppy-bitcoin/";
const OUT = process.argv[3] || "/tmp/perf-result.json";
const PLAY_MS = Number(process.argv[4] || 60000);

const FAST_3G = {
  offline: false,
  latency: 562.5,
  downloadThroughput: (1.6 * 1000 * 1000 / 8) * 0.9,
  uploadThroughput: (750 * 1000 / 8) * 0.9,
};

function sum(rows, pred) {
  let n = 0, bytes = 0;
  for (const r of rows) if (!pred || pred(r)) { n++; bytes += r.bytes || 0; }
  return { n, bytes };
}

async function armNet(context, page, cacheDisabled) {
  const client = await context.newCDPSession(page);
  await client.send("Network.enable");
  await client.send("Network.setCacheDisabled", { cacheDisabled: !!cacheDisabled });
  await client.send("Network.emulateNetworkConditions", FAST_3G);
  await client.send("Emulation.setCPUThrottlingRate", { rate: 4 });
  try { await client.send("Performance.enable"); } catch (e) {}
  const reqs = [];
  client.on("Network.loadingFinished", (ev) => {
    reqs.push({ id: ev.requestId, bytes: ev.encodedDataLength || 0, t: Date.now() });
  });
  const meta = new Map();
  client.on("Network.responseReceived", (ev) => {
    const u = ev.response && ev.response.url || "";
    const mime = ev.response && ev.response.mimeType || "";
    meta.set(ev.requestId, { url: u, mime, status: ev.response && ev.response.status, type: ev.type });
  });
  return {
    client,
    snapshot() {
      return reqs.map((r) => Object.assign({}, r, meta.get(r.id) || {}));
    }
  };
}

async function readHeap(client) {
  try {
    const m = await client.send("Performance.getMetrics");
    const o = {};
    for (const row of m.metrics || []) o[row.name] = row.value;
    return {
      jsHeapUsed: o.JSHeapUsedSize || 0,
      jsHeapTotal: o.JSHeapTotalSize || 0,
      nodes: o.Nodes || 0
    };
  } catch (e) {
    return { jsHeapUsed: 0, jsHeapTotal: 0, nodes: 0, err: String(e) };
  }
}

async function loadOnce(browser, cacheDisabled) {
  const context = await browser.newContext({ ...devices["Pixel 5"] });
  const page = await context.newPage();
  const errors = [];
  page.on("pageerror", (e) => errors.push(String(e)));
  page.on("console", (msg) => { if (msg.type() === "error") errors.push(msg.text()); });
  const net = await armNet(context, page, cacheDisabled);
  const t0 = Date.now();
  await page.goto(URL, { waitUntil: "commit", timeout: 120000 });
  await page.waitForFunction(() => {
    const go = document.getElementById("go");
    return typeof window.startChoppy === "function" && !!go;
  }, { timeout: 120000 });
  const ttiMs = Date.now() - t0;
  const nav = await page.evaluate(() => {
    const n = performance.getEntriesByType("navigation")[0];
    const resources = performance.getEntriesByType("resource").map((r) => ({
      name: r.name,
      type: r.initiatorType,
      transfer: r.transferSize || 0,
      encoded: r.encodedBodySize || 0,
      blocking: r.renderBlockingStatus || ""
    }));
    return {
      dcl: n ? n.domContentLoadedEventEnd : 0,
      load: n ? n.loadEventEnd : 0,
      responseEnd: n ? n.responseEnd : 0,
      resources
    };
  });
  const atTti = net.snapshot();
  const heapTti = await readHeap(net.client);
  await page.waitForTimeout(3000);
  const atSettle = net.snapshot();
  return { context, page, net, errors, ttiMs, nav, atTti, atSettle, heapTti };
}

function klass(url) {
  const u = String(url || "").split("?")[0];
  if (/\.(js)$/.test(u) || u.indexOf("abcjs") >= 0) return "js";
  if (/\.css$/.test(u)) return "css";
  if (/\.(jpg|jpeg|png|webp|gif|mp4|webm)$/.test(u)) return "media";
  if (u.indexOf("choppy-bitcoin/") >= 0 && !u.split("/").pop().includes(".")) return "doc";
  return "other";
}

function pack(rows) {
  const groups = {};
  for (const r of rows) {
    const k = klass(r.url);
    if (!groups[k]) groups[k] = { n: 0, bytes: 0 };
    groups[k].n++;
    groups[k].bytes += r.bytes || 0;
  }
  const all = sum(rows);
  return { all, groups, sample: rows.slice(0, 40).map((r) => ({ url: r.url, bytes: r.bytes, mime: r.mime, type: r.type })) };
}

async function play(page, client) {
  const heap0 = await readHeap(client);
  await page.evaluate(() => {
    window.__frames = [];
    let last = performance.now();
    const tick = (t) => {
      window.__frames.push(t - last);
      last = t;
      requestAnimationFrame(tick);
    };
    requestAnimationFrame(tick);
    const flap = () => {
      const c = document.getElementById("c");
      if (c) {
        c.dispatchEvent(new PointerEvent("pointerdown", {
          bubbles: true, cancelable: true, clientX: 180, clientY: 320, pointerId: 1, pointerType: "touch"
        }));
      }
      const ov = document.getElementById("overlay");
      const go = document.getElementById("go");
      if (go && ov && !ov.classList.contains("hide")) {
        const label = (go.textContent || "").toLowerCase();
        if (label.indexOf("again") >= 0 || label.indexOf("intent") >= 0 || label.indexOf("otra") >= 0) go.click();
      }
    };
    window.__flapTimer = setInterval(flap, 320);
    window.startChoppy(false);
  });
  await page.waitForTimeout(PLAY_MS);
  const heap1 = await readHeap(client);
  const frames = await page.evaluate(() => {
    clearInterval(window.__flapTimer);
    const f = (window.__frames || []).slice(1).filter((x) => x > 0 && x < 1000);
    const sum = f.reduce((s, x) => s + x, 0);
    const sorted = f.slice().sort((a, b) => a - b);
    const q = (p) => sorted.length ? sorted[Math.min(sorted.length - 1, Math.floor(p * (sorted.length - 1)))] : 0;
    const phase = document.getElementById("overlay");
    return {
      n: f.length,
      sum,
      mean: f.length ? sum / f.length : 0,
      p50: q(0.5),
      p95: q(0.95),
      max: sorted.length ? sorted[sorted.length - 1] : 0,
      fps: sum > 0 ? (f.length / (sum / 1000)) : 0,
      overlayHidden: !!(phase && phase.classList.contains("hide"))
    };
  });
  return { heap0, heap1, frames };
}

const browser = await chromium.launch({
  executablePath: process.env.CHROME || "/usr/bin/google-chrome",
  headless: true,
  args: ["--no-sandbox", "--disable-dev-shm-usage"]
});

const cold = await loadOnce(browser, true);
const played = await play(cold.page, cold.net.client);
const afterPlay = cold.net.snapshot();
const coldErrors = cold.errors.slice();
await cold.context.close();

// Warm: fill the cache in this context, then measure a reload. A new context would miss the cache.
const warmFill = await loadOnce(browser, false);
try { await warmFill.page.evaluate(() => window.stop()); } catch (e) {}
const warmT0 = Date.now();
await warmFill.page.reload({ waitUntil: "commit", timeout: 120000 });
await warmFill.page.waitForFunction(() => {
  const go = document.getElementById("go");
  return typeof window.startChoppy === "function" && !!go;
}, { timeout: 120000 });
const warmTtiMs = Date.now() - warmT0;
const warmRows = warmFill.net.snapshot().filter((r) => r.t >= warmT0 - 50);
const warmNav = await warmFill.page.evaluate(() => {
  const n = performance.getEntriesByType("navigation")[0];
  return { dcl: n ? n.domContentLoadedEventEnd : 0, load: n ? n.loadEventEnd : 0 };
});
const warmErrors = warmFill.errors.slice();
const warmHeap = await readHeap(warmFill.net.client);
await warmFill.page.waitForTimeout(3000);
const warmRows3 = warmFill.net.snapshot().filter((r) => r.t >= warmT0 - 50);
await warmFill.context.close();
await browser.close();

const result = {
  url: URL,
  at: new Date().toISOString(),
  device: "Pixel 5",
  cpu: 4,
  net: FAST_3G,
  playMs: PLAY_MS,
  cold: {
    ttiMs: cold.ttiMs,
    dcl: cold.nav.dcl,
    requestsAtTti: pack(cold.atTti),
    requestsAtTtiPlus3s: pack(cold.atSettle),
    heapTti: cold.heapTti,
    play: played.frames,
    heapPlayStart: played.heap0,
    heapPlayEnd: played.heap1,
    requestsAfterPlay: pack(afterPlay),
    errors: coldErrors.slice(0, 20),
    blocking: (cold.nav.resources || []).filter((r) => r.blocking && r.blocking !== "non-blocking")
  },
  warm: {
    ttiMs: warmTtiMs,
    dcl: warmNav.dcl,
    requestsAtTti: pack(warmRows),
    requestsAtTtiPlus3s: pack(warmRows3),
    heapTti: warmHeap,
    errors: warmErrors.slice(0, 20)
  }
};

fs.writeFileSync(OUT, JSON.stringify(result, null, 2));
console.log(JSON.stringify({
  coldTti: result.cold.ttiMs,
  coldBytesTti: result.cold.requestsAtTti.all,
  coldGroupsTti: result.cold.requestsAtTti.groups,
  coldBytes3s: result.cold.requestsAtTtiPlus3s.all,
  coldGroups3s: result.cold.requestsAtTtiPlus3s.groups,
  frames: result.cold.play,
  heapTti: result.cold.heapTti,
  heapEnd: result.cold.heapPlayEnd,
  warmTti: result.warm.ttiMs,
  warmBytesTti: result.warm.requestsAtTti.all,
  warmGroups: result.warm.requestsAtTti.groups,
  errors: result.cold.errors
}, null, 2));
