#!/usr/bin/env node
"use strict";
// Optional OfflineAudioContext RMS measurement of the halving fanfare vs the
// main theme. Uses headless Chrome when available; otherwise prints "omitido"
// and exits 0. Not required by CI.
const http = require("http");
const fs = require("fs");
const path = require("path");
const os = require("os");
const { spawn, spawnSync } = require("child_process");

const ROOT = path.resolve(__dirname, "..");

function findChrome() {
  const candidates = [
    process.env.CHROME_PATH,
    "google-chrome",
    "google-chrome-stable",
    "chromium",
    "chromium-browser",
    "/usr/bin/google-chrome",
    "/usr/bin/google-chrome-stable"
  ].filter(Boolean);
  for (const c of candidates) {
    if (c.indexOf("/") >= 0) {
      if (fs.existsSync(c)) return c;
      continue;
    }
    const r = spawnSync("sh", ["-c", "command -v " + c], { encoding: "utf8" });
    if (r.status === 0 && r.stdout.trim()) return r.stdout.trim();
  }
  return null;
}

function mime(p) {
  const ext = path.extname(p);
  return ({
    ".html": "text/html; charset=utf-8",
    ".js": "text/javascript; charset=utf-8",
    ".css": "text/css; charset=utf-8",
    ".png": "image/png"
  })[ext] || "application/octet-stream";
}

(async function main() {
  const chrome = findChrome();
  if (!chrome) {
    console.log("halving-rms: omitido (no Chrome)");
    process.exit(0);
  }
  let settle;
  const got = new Promise((resolve, reject) => {
    settle = { resolve, reject };
    setTimeout(() => reject(new Error("timeout waiting for RMS result")), 25000);
  });
  const server = http.createServer((req, res) => {
    const url = decodeURIComponent((req.url || "/").split("?")[0]);
    if (req.method === "POST" && url === "/result") {
      let body = "";
      req.on("data", (c) => { body += c; });
      req.on("end", () => {
        res.writeHead(200, { "content-type": "text/plain" });
        res.end("ok");
        try { settle.resolve(JSON.parse(body)); }
        catch (e) { settle.reject(new Error("bad JSON: " + body.slice(0, 400))); }
      });
      return;
    }
    let filePath = url === "/" ? "/tests/halving-rms.html" : url;
    const file = path.join(ROOT, filePath.replace(/^\/+/, ""));
    if (!file.startsWith(ROOT) || !fs.existsSync(file) || fs.statSync(file).isDirectory()) {
      res.writeHead(404); res.end("not found"); return;
    }
    res.writeHead(200, { "content-type": mime(file), "cache-control": "no-store" });
    fs.createReadStream(file).pipe(res);
  });
  await new Promise((r) => server.listen(0, "127.0.0.1", r));
  const port = server.address().port;
  const url = "http://127.0.0.1:" + port + "/tests/halving-rms.html";
  const profile = fs.mkdtempSync(path.join(os.tmpdir(), "choppy-rms-"));
  const proc = spawn(chrome, [
    "--headless=new",
    "--no-sandbox",
    "--disable-dev-shm-usage",
    "--disable-gpu",
    "--no-first-run",
    "--no-default-browser-check",
    "--user-data-dir=" + profile,
    url
  ], { stdio: "ignore" });
  let data;
  try {
    data = await got;
  } finally {
    try { proc.kill("SIGTERM"); } catch (e) {}
    await new Promise((r) => setTimeout(r, 200));
    try { proc.kill("SIGKILL"); } catch (e) {}
    server.close();
    try { fs.rmSync(profile, { recursive: true, force: true }); } catch (e) {}
  }
  if (!data.ok) {
    console.error("halving-rms: " + data.error);
    process.exit(1);
  }
  function line(n, x) {
    console.log(n + "  rms=" + x.rms.toFixed(5) + "  peak=" + x.peak.toFixed(4) + "  clipped=" + x.clipped);
  }
  line("main idle      ", data.idle);
  line("main bull      ", data.bull);
  line("cap sting      ", data.cap);
  line("halving fanfare", data.fanfare);
  console.log("fanfare / main bull  " + data.ratioVsBull.toFixed(2) + "x");
  console.log("fanfare / main idle  " + data.ratioVsIdle.toFixed(2) + "x");
  console.log("halving-rms: ok");
})().catch((e) => {
  console.error("halving-rms: " + e.message);
  process.exit(1);
});
