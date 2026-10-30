#!/usr/bin/env node
"use strict";

// Optional headless boot. Not part of CI.
//
// Plays the static site at /choppy-bitcoin/, waits for the main menu and
// for window.startChoppy, and fails on console.error or an uncaught
// exception. The screenshot lands in tests/out/boot.png (gitignored).
//
// Playwright is not a dependency of this repo. If it is installed locally
// (`npm install --no-save playwright` and `npx playwright install chromium`)
// this script uses it. Otherwise it drives google-chrome or chromium when
// one of those binaries is on PATH. If neither is available it prints
// "omitido" and exits 0.
//
// PLAYWRIGHT_MODULE can point at a playwright or playwright-core install
// that lives outside the repo. CHROME_PATH can point at a browser binary.

const fs = require("fs");
const http = require("http");
const os = require("os");
const path = require("path");
const crypto = require("crypto");
const net = require("net");
const { spawn, spawnSync } = require("child_process");

const ROOT = path.resolve(__dirname, "..");
const OUT_DIR = path.join(ROOT, "tests", "out");
const OUT_FILE = path.join(OUT_DIR, "boot.png");
const MOUNT = "/choppy-bitcoin";

const MIME = {
  ".html": "text/html; charset=utf-8",
  ".js": "text/javascript; charset=utf-8",
  ".css": "text/css; charset=utf-8",
  ".json": "application/json",
  ".webmanifest": "application/manifest+json",
  ".png": "image/png",
  ".jpg": "image/jpeg",
  ".jpeg": "image/jpeg",
  ".svg": "image/svg+xml",
  ".ico": "image/x-icon",
  ".mp4": "video/mp4",
  ".woff2": "font/woff2"
};

function omit(reason) {
  console.log("boot: omitido (" + reason + ")");
  process.exit(0);
}

function findChrome() {
  const candidates = [
    process.env.CHROME_PATH,
    "google-chrome",
    "google-chrome-stable",
    "chromium",
    "chromium-browser",
    "/usr/bin/google-chrome",
    "/usr/bin/google-chrome-stable",
    "/usr/bin/chromium",
    "/usr/bin/chromium-browser"
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

function loadPlaywright() {
  const names = [];
  if (process.env.PLAYWRIGHT_MODULE) names.push(process.env.PLAYWRIGHT_MODULE);
  names.push("playwright", "playwright-core");
  for (const name of names) {
    try { return require(name); } catch (e) {}
  }
  return null;
}

function startServer() {
  const server = http.createServer((req, res) => {
    const u = new URL(req.url, "http://127.0.0.1");
    let pathname = decodeURIComponent(u.pathname);
    if (pathname === MOUNT || pathname === MOUNT + "/") pathname = MOUNT + "/index.html";
    if (pathname.indexOf(MOUNT + "/") !== 0) {
      res.writeHead(404);
      res.end("not found");
      return;
    }
    const rel = pathname.slice(MOUNT.length + 1);
    const abs = path.normalize(path.join(ROOT, rel));
    if (abs !== ROOT && abs.indexOf(ROOT + path.sep) !== 0) {
      res.writeHead(403);
      res.end("forbidden");
      return;
    }
    fs.readFile(abs, (err, data) => {
      if (err) {
        res.writeHead(404);
        res.end("not found");
        return;
      }
      const ext = path.extname(abs).toLowerCase();
      res.writeHead(200, { "Content-Type": MIME[ext] || "application/octet-stream", "Cache-Control": "no-store" });
      res.end(data);
    });
  });
  return new Promise((resolve) => {
    server.listen(0, "127.0.0.1", () => resolve(server));
  });
}

function menuExpression() {
  return "(function () {"
    + "var h = document.querySelector('#overlay h1');"
    + "return {"
    + "menu: !!(h && /Choppy Bitcoin/.test(h.textContent || '') && document.querySelector('#go')),"
    + "started: typeof window.startChoppy === 'function'"
    + "};"
    + "})()";
}

function argText(arg) {
  if (!arg) return "";
  if (typeof arg.value === "string") return arg.value;
  if (arg.description) return String(arg.description);
  if (arg.value != null) return String(arg.value);
  return "";
}

async function runPlaywright(url) {
  const pw = loadPlaywright();
  if (!pw || !pw.chromium) return false;
  const chrome = findChrome();
  const errors = [];
  let browser;
  const attempts = [];
  if (chrome) attempts.push({ headless: true, executablePath: chrome, args: ["--no-sandbox", "--disable-dev-shm-usage"] });
  attempts.push({ headless: true, args: ["--no-sandbox", "--disable-dev-shm-usage"] });
  let lastErr = null;
  for (const opts of attempts) {
    try {
      browser = await pw.chromium.launch(opts);
      lastErr = null;
      break;
    } catch (e) {
      lastErr = e;
    }
  }
  if (!browser) {
    console.error("boot: Playwright is installed but did not launch (" + (lastErr && lastErr.message ? lastErr.message : lastErr) + ")");
    return false;
  }
  try {
    const page = await browser.newPage({ viewport: { width: 1280, height: 800 } });
    page.on("console", (msg) => {
      if (msg.type() === "error") errors.push(msg.text());
    });
    page.on("pageerror", (err) => errors.push(String(err && err.message ? err.message : err)));
    await page.goto(url, { waitUntil: "domcontentloaded", timeout: 20000 });
    try {
      await page.waitForFunction(menuExpression(), { timeout: 15000 });
    } catch (e) {
      errors.push("main menu did not appear: " + (e && e.message ? e.message : e));
    }
    fs.mkdirSync(OUT_DIR, { recursive: true });
    await page.screenshot({ path: OUT_FILE });
  } finally {
    await browser.close();
  }
  if (errors.length) {
    for (const e of errors) console.error("FAIL boot: " + e);
    console.error("boot: failed");
    process.exit(1);
  }
  console.log("boot: ok (menu visible, no console errors) " + path.relative(ROOT, OUT_FILE));
  return true;
}

function freePort() {
  return new Promise((resolve, reject) => {
    const srv = net.createServer();
    srv.listen(0, "127.0.0.1", () => {
      const addr = srv.address();
      srv.close(() => resolve(addr.port));
    });
    srv.on("error", reject);
  });
}

function httpJson(method, url) {
  return new Promise((resolve, reject) => {
    const u = new URL(url);
    const req = http.request({
      hostname: u.hostname,
      port: u.port,
      path: u.pathname + u.search,
      method: method,
      timeout: 4000
    }, (res) => {
      const chunks = [];
      res.on("data", (c) => chunks.push(c));
      res.on("end", () => {
        const text = Buffer.concat(chunks).toString("utf8");
        if (res.statusCode && res.statusCode >= 400) {
          reject(new Error("HTTP " + res.statusCode + " " + text.slice(0, 200)));
          return;
        }
        try { resolve(text ? JSON.parse(text) : null); }
        catch (e) { reject(e); }
      });
    });
    req.on("error", reject);
    req.on("timeout", () => { req.destroy(); reject(new Error("timeout")); });
    req.end();
  });
}

function encodeClientFrame(text) {
  const payload = Buffer.from(text);
  const mask = crypto.randomBytes(4);
  let header;
  if (payload.length < 126) {
    header = Buffer.alloc(6);
    header[0] = 0x81;
    header[1] = 0x80 | payload.length;
    mask.copy(header, 2);
  } else if (payload.length < 65536) {
    header = Buffer.alloc(8);
    header[0] = 0x81;
    header[1] = 0x80 | 126;
    header.writeUInt16BE(payload.length, 2);
    mask.copy(header, 4);
  } else {
    header = Buffer.alloc(14);
    header[0] = 0x81;
    header[1] = 0x80 | 127;
    header.writeBigUInt64BE(BigInt(payload.length), 2);
    mask.copy(header, 10);
  }
  const masked = Buffer.alloc(payload.length);
  for (let i = 0; i < payload.length; i++) masked[i] = payload[i] ^ mask[i % 4];
  return Buffer.concat([header, masked]);
}

function connectCdp(wsUrl) {
  const u = new URL(wsUrl);
  return new Promise((resolve, reject) => {
    const socket = net.connect(Number(u.port), u.hostname);
    const key = crypto.randomBytes(16).toString("base64");
    let buf = Buffer.alloc(0);
    let open = false;
    const pending = new Map();
    const listeners = [];
    let nextId = 0;
    const api = {
      send(method, params) {
        const id = ++nextId;
        return new Promise((res, rej) => {
          pending.set(id, { res, rej });
          socket.write(encodeClientFrame(JSON.stringify({ id: id, method: method, params: params || {} })));
        });
      },
      on(fn) { listeners.push(fn); },
      close() { socket.end(); }
    };
    function onFrame(text) {
      let msg;
      try { msg = JSON.parse(text); } catch (e) { return; }
      if (msg.id && pending.has(msg.id)) {
        const p = pending.get(msg.id);
        pending.delete(msg.id);
        if (msg.error) p.rej(new Error(msg.error.message || "cdp error"));
        else p.res(msg.result || {});
      } else if (msg.method) {
        for (const fn of listeners) fn(msg);
      }
    }
    function sendRaw(opcode, payload) {
      const body = payload && payload.length < 126 ? payload : Buffer.alloc(0);
      const mask = crypto.randomBytes(4);
      const header = Buffer.alloc(2);
      header[0] = 0x80 | opcode;
      header[1] = 0x80 | body.length;
      const masked = Buffer.alloc(body.length);
      for (let i = 0; i < body.length; i++) masked[i] = body[i] ^ mask[i % 4];
      socket.write(Buffer.concat([header, mask, masked]));
    }
    function consumeFrames() {
      if (!open) {
        const end = buf.indexOf("\r\n\r\n");
        if (end < 0) return;
        const head = buf.slice(0, end).toString("utf8");
        buf = buf.slice(end + 4);
        if (!/^HTTP\/1\.1 101/.test(head)) {
          reject(new Error("websocket upgrade failed: " + head.split("\n")[0]));
          socket.destroy();
          return;
        }
        open = true;
        resolve(api);
      }
      while (buf.length >= 2) {
        const opcode = buf[0] & 0x0f;
        const b1 = buf[1];
        let len = b1 & 0x7f;
        let p = 2;
        if (len === 126) {
          if (buf.length < 4) return;
          len = buf.readUInt16BE(2);
          p = 4;
        } else if (len === 127) {
          if (buf.length < 10) return;
          len = Number(buf.readBigUInt64BE(2));
          p = 10;
        }
        const masked = (b1 & 0x80) !== 0;
        let mask;
        if (masked) {
          if (buf.length < p + 4) return;
          mask = buf.slice(p, p + 4);
          p += 4;
        }
        if (buf.length < p + len) return;
        let data = buf.slice(p, p + len);
        buf = buf.slice(p + len);
        if (masked) {
          data = Buffer.from(data);
          for (let i = 0; i < data.length; i++) data[i] ^= mask[i % 4];
        }
        if (opcode === 0x8) {
          socket.end();
          return;
        }
        if (opcode === 0x9) {
          sendRaw(0xA, data);
          continue;
        }
        if (opcode === 0x1) onFrame(data.toString("utf8"));
      }
    }
    socket.on("data", (chunk) => {
      buf = Buffer.concat([buf, chunk]);
      try { consumeFrames(); } catch (e) { reject(e); }
    });
    socket.on("error", reject);
    socket.write(
      "GET " + u.pathname + u.search + " HTTP/1.1\r\n"
      + "Host: " + u.host + "\r\n"
      + "Upgrade: websocket\r\n"
      + "Connection: Upgrade\r\n"
      + "Sec-WebSocket-Key: " + key + "\r\n"
      + "Sec-WebSocket-Version: 13\r\n\r\n"
    );
  });
}

async function runChrome(url) {
  const chrome = findChrome();
  if (!chrome) return false;
  const port = await freePort();
  const profile = fs.mkdtempSync(path.join(os.tmpdir(), "choppy-boot-"));
  const args = [
    "--headless=new",
    "--no-sandbox",
    "--disable-dev-shm-usage",
    "--disable-gpu",
    "--no-first-run",
    "--no-default-browser-check",
    "--disable-extensions",
    "--remote-debugging-address=127.0.0.1",
    "--remote-allow-origins=*",
    "--remote-debugging-port=" + port,
    "--user-data-dir=" + profile,
    "--window-size=1280,800",
    "about:blank"
  ];
  const proc = spawn(chrome, args, { detached: true, stdio: "ignore" });
  const errors = [];
  let cdp = null;
  try {
    let version = null;
    for (let i = 0; i < 40; i++) {
      try {
        version = await httpJson("GET", "http://127.0.0.1:" + port + "/json/version");
        break;
      } catch (e) {
        await new Promise((r) => setTimeout(r, 150));
      }
    }
    if (!version) throw new Error("Chrome did not open a debugging port");
    let target = null;
    const newUrl = "http://127.0.0.1:" + port + "/json/new?" + encodeURIComponent(url);
    try { target = await httpJson("PUT", newUrl); }
    catch (e) { target = await httpJson("GET", newUrl); }
    if (!target || !target.webSocketDebuggerUrl) throw new Error("Chrome did not return a page target");
    cdp = await connectCdp(target.webSocketDebuggerUrl);
    cdp.on((msg) => {
      if (msg.method === "Runtime.consoleAPICalled" && msg.params && msg.params.type === "error") {
        const args = (msg.params.args || []).map(argText).filter(Boolean);
        errors.push(args.join(" ") || "console.error");
      } else if (msg.method === "Runtime.exceptionThrown" && msg.params && msg.params.exceptionDetails) {
        const d = msg.params.exceptionDetails;
        const desc = d.exception && (d.exception.description || d.exception.value);
        errors.push(desc || d.text || "pageerror");
      }
    });
    await cdp.send("Runtime.enable");
    await cdp.send("Page.enable");
    await cdp.send("Page.navigate", { url: url });
    let ready = false;
    for (let i = 0; i < 60; i++) {
      await new Promise((r) => setTimeout(r, 250));
      try {
        const result = await cdp.send("Runtime.evaluate", { expression: menuExpression(), returnByValue: true });
        const value = result && result.result && result.result.value;
        if (value && value.menu && value.started) { ready = true; break; }
      } catch (e) {}
    }
    if (!ready) errors.push("main menu did not appear (overlay title and window.startChoppy)");
    const shot = await cdp.send("Page.captureScreenshot", { format: "png" });
    fs.mkdirSync(OUT_DIR, { recursive: true });
    fs.writeFileSync(OUT_FILE, Buffer.from(shot.data, "base64"));
  } finally {
    if (cdp) try { cdp.close(); } catch (e) {}
    try { process.kill(-proc.pid, "SIGTERM"); } catch (e) {
      try { proc.kill("SIGTERM"); } catch (e2) {}
    }
    await new Promise((r) => setTimeout(r, 300));
    try { process.kill(-proc.pid, "SIGKILL"); } catch (e) {}
    try { fs.rmSync(profile, { recursive: true, force: true }); } catch (e) {}
  }
  if (errors.length) {
    for (const e of errors) console.error("FAIL boot: " + e);
    console.error("boot: failed");
    process.exit(1);
  }
  console.log("boot: ok (menu visible, no console errors) " + path.relative(ROOT, OUT_FILE));
  return true;
}

async function main() {
  const server = await startServer();
  const addr = server.address();
  const url = "http://127.0.0.1:" + addr.port + MOUNT + "/";
  try {
    const usedPw = await runPlaywright(url);
    if (usedPw) return;
    const usedChrome = await runChrome(url);
    if (usedChrome) return;
    omit("Playwright no está instalado y no hay Chromium en el PATH");
  } finally {
    server.close();
  }
}

main().catch((e) => {
  console.error("boot: failed");
  console.error(e && e.stack ? e.stack : e);
  process.exit(1);
});
