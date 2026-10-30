/*
Choppy Bitcoin service worker. Scope is /choppy-bitcoin/ only.
The page registers this file only after an explicit opt-in (?pwa=1 or the
options switch). Install precaches the versioned shell plus the lazy files.

CACHE_VERSION matches the ?v=mpNNN tag on game.js in index.html.
Shell responses use a versioned cache. Chance art uses one bounded cache
that survives a shell bump. Supabase, tokens, versus, and video are never stored.
*/
(function () {
  "use strict";

  var CACHE_VERSION = "mp196";
  var SCOPE_PATH = "/choppy-bitcoin/";
  var ART_MAX_COUNT = 40;
  var ART_MAX_BYTES = 30 * 1024 * 1024;
  var SHELL_PATHS = [
    "index.html",
    "game.js",
    "i18n.js",
    "i18n-extra.js",
    "auth.js",
    "supabase-lib.js",
    "run-stats.js",
    "audio.js",
    "nozoom.js",
    "style.css",
    "site.webmanifest",
    "favicon.svg",
    "favicon.ico",
    "favicon-32.png",
    "favicon-48.png",
    "favicon-96.png",
    "favicon-192.png",
    "favicon-512.png",
    "favicon-maskable-512.png",
    "apple-touch-icon.png",
    "i18n-extra.js",
    "chess-data.js",
    "mp.js",
    "nft-preview.js"
  ];
  // Code files the pages request with ?v=CACHE_VERSION. The cache key keeps that tag,
  // so a cached copy can only answer a request for the exact same version.
  var VERSIONED = /\.(js|css)$/i;

  function precacheUrls(version) {
    var v = version || CACHE_VERSION;
    var seen = {};
    var out = [];
    SHELL_PATHS.forEach(function (rel) {
      var url = SCOPE_PATH + rel + (VERSIONED.test(rel) ? "?v=" + v : "");
      if (rel === "index.html") url = SCOPE_PATH;
      if (!seen[url]) { seen[url] = true; out.push(url); }
    });
    return out;
  }

  function hasVersionTag(urlString) {
    try { return /^mp\d+$/.test(new URL(String(urlString), "https://bitcoinizate.com").searchParams.get("v") || ""); } catch (e) { return false; }
  }

  function cacheNames(version) {
    return {
      shell: "choppy-shell-" + (version || CACHE_VERSION),
      art: "choppy-art"
    };
  }

  function classifyRequest(urlString, scopeOrigin) {
    var fallbackOrigin = "https://bitcoinizate.com";
    var u;
    try {
      u = new URL(String(urlString), scopeOrigin || fallbackOrigin);
    } catch (e) {
      return { bucket: "bypass", reason: "bad-url" };
    }
    var origin = scopeOrigin || fallbackOrigin;
    if (u.origin !== origin) {
      if (/(^|\.)supabase\.co$/i.test(u.hostname)) return { bucket: "sensitive", reason: "supabase" };
      if (u.hostname === "cdnjs.cloudflare.com") return { bucket: "sensitive", reason: "cdn" };
      return { bucket: "bypass", reason: "cross-origin" };
    }
    if (u.pathname.indexOf(SCOPE_PATH) !== 0) return { bucket: "bypass", reason: "out-of-scope" };
    if (/access_token|refresh_token/i.test(u.search) || /access_token|refresh_token/i.test(u.pathname)) {
      return { bucket: "sensitive", reason: "token" };
    }
    var path = u.pathname;
    if (/\/sw\.js$/i.test(path) || /\/sw-kill\.json$/i.test(path)) return { bucket: "bypass", reason: "control" };
    if (/\.(mp4|webm|mov|m4v)$/i.test(path)) return { bucket: "bypass", reason: "video" };
    if (path.indexOf("/chance/") !== -1) {
      if (/\.(jpe?g|png|webp|gif)$/i.test(path)) return { bucket: "art", reason: "chance-image" };
      return { bucket: "bypass", reason: "chance-other" };
    }
    if (path.endsWith(".html") || path.endsWith("/") || path.endsWith(".webmanifest")) {
      return { bucket: "html", reason: "document" };
    }
    if (/\.(js|mjs|css|woff2?|ttf|otf)$/i.test(path)) return { bucket: "shell", reason: "code" };
    if (/\.(png|svg|ico|jpe?g|webp)$/i.test(path)) return { bucket: "shell", reason: "icon" };
    return { bucket: "bypass", reason: "unknown" };
  }

  function planFetch(opts) {
    opts = opts || {};
    var method = String(opts.method || "GET").toUpperCase();
    var cls = classifyRequest(opts.url, opts.origin);
    var get = method === "GET" || method === "HEAD";
    if (cls.bucket === "sensitive") {
      return { bucket: "sensitive", reason: cls.reason, strategy: "network-only", store: false, fallback: "offline-json" };
    }
    if (!get || cls.bucket === "bypass") {
      return { bucket: cls.bucket, reason: cls.reason, strategy: "network-only", store: false, fallback: "none" };
    }
    if (cls.bucket === "html") {
      return { bucket: "html", reason: cls.reason, strategy: "network-first", store: method === "GET", fallback: "shell" };
    }
    if (cls.bucket === "shell") {
      // Version-tagged code is cache-first on its exact URL; anything untagged is network-first,
      // so the worker can never answer with an older game build while online.
      var tagged = hasVersionTag(opts.url);
      return { bucket: "shell", reason: cls.reason, strategy: tagged ? "cache-first-versioned" : "network-first", store: method === "GET", fallback: "none" };
    }
    if (cls.bucket === "art") {
      return { bucket: "art", reason: cls.reason, strategy: "cache-bounded", store: method === "GET", fallback: "gradient" };
    }
    return { bucket: "bypass", reason: cls.reason, strategy: "network-only", store: false, fallback: "none" };
  }

  function canStoreResponse(res) {
    if (!res || res.ok !== true) return false;
    var type = res.type || "basic";
    if (type !== "basic" && type !== "default") return false;
    var cc = "";
    if (res.headers && typeof res.headers.get === "function") cc = res.headers.get("Cache-Control") || "";
    if (/no-store/i.test(cc)) return false;
    return true;
  }

  function readKillFlag(data) {
    if (!data || typeof data !== "object") return false;
    if (data.kill === true || data.disabled === true) return true;
    return false;
  }

  function trimArtEntries(entries, limits) {
    var maxCount = limits && limits.maxCount != null ? limits.maxCount : ART_MAX_COUNT;
    var maxBytes = limits && limits.maxBytes != null ? limits.maxBytes : ART_MAX_BYTES;
    var list = (entries || []).map(function (entry) {
      return {
        url: String(entry.url),
        bytes: Math.max(0, Number(entry.bytes) || 0),
        at: Number(entry.at) || 0
      };
    });
    list.sort(function (a, b) {
      if (b.at !== a.at) return b.at - a.at;
      if (a.url < b.url) return -1;
      if (a.url > b.url) return 1;
      return 0;
    });
    var keep = [];
    var bytes = 0;
    for (var i = 0; i < list.length; i++) {
      var entry = list[i];
      if (keep.length >= maxCount) break;
      if (entry.bytes > maxBytes) continue;
      if (bytes + entry.bytes > maxBytes) continue;
      keep.push(entry);
      bytes += entry.bytes;
    }
    var keepSet = {};
    keep.forEach(function (entry) { keepSet[entry.url] = true; });
    var evict = [];
    list.forEach(function (entry) {
      if (!keepSet[entry.url]) evict.push(entry.url);
    });
    return { keep: keep, evict: evict, bytes: bytes, count: keep.length };
  }

  function scoreSendPlan(ctx) {
    var info = ctx || {};
    if (!info.signedIn) return { send: false, retry: false, reason: "guest" };
    if (!info.online) return { send: false, retry: false, reason: "offline" };
    return { send: true, retry: false, reason: "now" };
  }

  function updatePlan(state) {
    var s = state || {};
    if (s.kill) return { notify: false, reload: "next-start", clearStorage: false, unregister: true };
    if (s.waiting && s.controller) return { notify: true, reload: "user", clearStorage: false, unregister: false };
    return { notify: false, reload: "none", clearStorage: false, unregister: false };
  }

  function shellVersionFromHtml(html) {
    var m = String(html || "").match(/game\.js\?v=(mp\d+)/);
    return m ? m[1] : "";
  }

  function scopeDocumentAliases(urlString) {
    var u;
    try { u = new URL(String(urlString)); } catch (e) { return []; }
    if (u.pathname !== SCOPE_PATH && u.pathname !== SCOPE_PATH + "index.html") return [];
    var bare = u.origin + SCOPE_PATH;
    var index = u.origin + SCOPE_PATH + "index.html";
    var self = u.origin + u.pathname + u.search;
    var out = [];
    if (bare !== self) out.push(bare);
    if (index !== self) out.push(index);
    return out;
  }

  var api = {
    CACHE_VERSION: CACHE_VERSION,
    SCOPE_PATH: SCOPE_PATH,
    ART_MAX_COUNT: ART_MAX_COUNT,
    ART_MAX_BYTES: ART_MAX_BYTES,
    SHELL_PATHS: SHELL_PATHS,
    precacheUrls: precacheUrls,
    hasVersionTag: hasVersionTag,
    cacheNames: cacheNames,
    classifyRequest: classifyRequest,
    planFetch: planFetch,
    canStoreResponse: canStoreResponse,
    readKillFlag: readKillFlag,
    trimArtEntries: trimArtEntries,
    scoreSendPlan: scoreSendPlan,
    updatePlan: updatePlan,
    shellVersionFromHtml: shellVersionFromHtml,
    scopeDocumentAliases: scopeDocumentAliases
  };

  if (typeof module === "object" && module && module.exports) module.exports = api;

  var inWorker = typeof ServiceWorkerGlobalScope !== "undefined"
    && typeof self !== "undefined"
    && self instanceof ServiceWorkerGlobalScope;
  if (!inWorker) return;

  var artChain = Promise.resolve();
  var lastKillCheck = 0;
  var acceptStore = true;

  async function putIfLive(cache, key, body) {
    if (!acceptStore) return;
    await cache.put(key, body);
    if (!acceptStore) {
      try { await cache.delete(key); } catch (e) {}
    }
  }

  function offlineJson() {
    return new Response(JSON.stringify({ offline: true, error: "offline", message: "offline" }), {
      status: 503,
      headers: { "Content-Type": "application/json", "Cache-Control": "no-store" }
    });
  }

  function artFallbackResponse() {
    var svg = "<svg xmlns=\"http://www.w3.org/2000/svg\" viewBox=\"0 0 240 100\"><defs><linearGradient id=\"g\" x1=\"0\" y1=\"0\" x2=\"1\" y2=\"1\"><stop offset=\"0\" stop-color=\"#1a1408\"/><stop offset=\"0.5\" stop-color=\"#0a0a0c\"/><stop offset=\"1\" stop-color=\"#3a2a10\"/></linearGradient></defs><rect width=\"240\" height=\"100\" fill=\"url(#g)\"/></svg>";
    return new Response(svg, {
      status: 200,
      headers: {
        "Content-Type": "image/svg+xml",
        "Cache-Control": "no-store",
        "X-Choppy-Art": "fallback"
      }
    });
  }

  function offlineShellResponse() {
    var html = "<!DOCTYPE html><html lang=\"en\"><head><meta charset=\"utf-8\"><meta name=\"viewport\" content=\"width=device-width,initial-scale=1\"><title>Choppy Bitcoin</title></head><body style=\"margin:0;background:#0a0a0c;color:#f3efe6;font:16px/1.45 ui-monospace,monospace;display:flex;min-height:100vh;align-items:center;justify-content:center;padding:24px\"><main style=\"max-width:28rem\"><h1 style=\"font-size:22px\">Choppy Bitcoin</h1><p>You are offline, and this device does not have the game saved yet. Connect once so it can be stored.</p><p>No hay conexión y este dispositivo todavía no tiene el juego guardado. Conéctate una vez para guardarlo.</p></main></body></html>";
    return new Response(html, {
      status: 503,
      headers: { "Content-Type": "text/html; charset=utf-8", "Cache-Control": "no-store" }
    });
  }

  function chainArt(fn) {
    var run = artChain.then(fn, fn);
    artChain = run.then(function () {}, function () {});
    return run;
  }

  async function wipeCaches() {
    var keys = await caches.keys();
    await Promise.all(keys.filter(function (name) {
      return name.indexOf("choppy-") === 0;
    }).map(function (name) {
      return caches.delete(name);
    }));
  }

  async function tellClients(message) {
    var clients = await self.clients.matchAll({ type: "window", includeUncontrolled: true });
    clients.forEach(function (client) {
      try { client.postMessage(message); } catch (e) {}
    });
  }

  async function wipeAndUnregister() {
    acceptStore = false;
    await wipeCaches();
    try { await self.registration.unregister(); } catch (e) {}
    await tellClients({ type: "killed" });
  }

  async function killIfFlagged() {
    var url = new URL("sw-kill.json", self.registration.scope);
    try {
      var res = await fetch(url.href, { cache: "no-store" });
      if (!res || !res.ok) return false;
      var data = await res.json();
      if (!readKillFlag(data)) return false;
    } catch (e) {
      return false;
    }
    acceptStore = false;
    await wipeAndUnregister();
    return true;
  }

  async function maybeKill() {
    var now = Date.now();
    if (now - lastKillCheck < 60000) return false;
    lastKillCheck = now;
    return killIfFlagged();
  }

  async function matchDocument(cache, req) {
    var hit = await cache.match(req);
    if (hit) return hit;
    var u;
    try { u = new URL(req.url); } catch (e) { return null; }
    if (u.pathname === SCOPE_PATH || u.pathname === SCOPE_PATH + "index.html") {
      hit = await cache.match(u.origin + SCOPE_PATH);
      if (hit) return hit;
      hit = await cache.match(u.origin + SCOPE_PATH + "index.html");
      if (hit) return hit;
    }
    return null;
  }

  async function networkOnlySensitive(req) {
    try {
      return await fetch(req);
    } catch (e) {
      return offlineJson();
    }
  }

  async function networkFirst(req, store) {
    var cache = await caches.open(cacheNames().shell);
    try {
      var res = await fetch(req);
      if (store && acceptStore && canStoreResponse(res)) {
        await putIfLive(cache, req, res.clone());
        var aliases = scopeDocumentAliases(req.url);
        for (var i = 0; i < aliases.length; i++) await putIfLive(cache, aliases[i], res.clone());
      }
      return res;
    } catch (e) {
      var hit = await matchDocument(cache, req);
      if (hit) return hit;
      var accept = req.headers && req.headers.get ? (req.headers.get("accept") || "") : "";
      if (req.mode === "navigate" || accept.indexOf("text/html") !== -1) return offlineShellResponse();
      return new Response("offline", { status: 503, headers: { "Cache-Control": "no-store" } });
    }
  }

  async function cacheFirstVersioned(req, store) {
    var cache = await caches.open(cacheNames().shell);
    var cached = await cache.match(req);
    if (cached) return cached;
    try {
      var res = await fetch(req);
      if (store && acceptStore && canStoreResponse(res)) await putIfLive(cache, req, res.clone());
      return res;
    } catch (e) {
      return new Response("offline", { status: 503, headers: { "Cache-Control": "no-store" } });
    }
  }

  async function storeArt(cache, req, buf, type) {
    if (buf.byteLength > ART_MAX_BYTES) return;
    var keys = await cache.keys();
    var now = Date.now();
    var entries = [{ url: req.url, bytes: buf.byteLength, at: now }];
    for (var i = 0; i < keys.length; i++) {
      if (keys[i].url === req.url) continue;
      var rec = await cache.match(keys[i]);
      if (!rec) continue;
      var bytes = Number(rec.headers.get("X-Choppy-Bytes") || 0);
      if (!bytes) {
        var blob = await rec.clone().blob();
        bytes = blob.size || 0;
      }
      entries.push({
        url: keys[i].url,
        bytes: bytes,
        at: Number(rec.headers.get("X-Choppy-Cached-At") || 0)
      });
    }
    var trimmed = trimArtEntries(entries, { maxCount: ART_MAX_COUNT, maxBytes: ART_MAX_BYTES });
    var keep = {};
    trimmed.keep.forEach(function (entry) { keep[entry.url] = true; });
    if (!keep[req.url] || !acceptStore) return;
    await Promise.all(trimmed.evict.map(function (url) { return cache.delete(url); }));
    var headers = new Headers();
    headers.set("Content-Type", type || "application/octet-stream");
    headers.set("X-Choppy-Cached-At", String(now));
    headers.set("X-Choppy-Bytes", String(buf.byteLength));
    headers.set("Cache-Control", "no-store");
    await putIfLive(cache, req, new Response(buf.slice(0), { status: 200, headers: headers }));
  }

  async function boundedArt(req, store) {
    var cache = await caches.open(cacheNames().art);
    var hit = await cache.match(req);
    if (hit) return hit;
    try {
      var res = await fetch(req);
      if (!(res && res.ok && (res.type === "basic" || res.type === "default"))) return res;
      var buf = await res.clone().arrayBuffer();
      var type = res.headers.get("Content-Type") || "image/jpeg";
      if (store) {
        await chainArt(function () { return storeArt(cache, req, buf, type); });
      }
      return new Response(buf, { status: 200, headers: { "Content-Type": type, "Cache-Control": "no-store" } });
    } catch (e) {
      return artFallbackResponse();
    }
  }

  self.addEventListener("install", function (event) {
    event.waitUntil((async function () {
      var cache = await caches.open(cacheNames().shell);
      await Promise.all(precacheUrls().map(function (url) {
        return fetch(url, { cache: "no-cache" }).then(function (res) {
          if (acceptStore && canStoreResponse(res)) return putIfLive(cache, url, res);
        }).catch(function () {});
      }));
      if (!self.registration.active) return;
      await tellClients({ type: "update-ready", version: CACHE_VERSION });
    })());
  });

  self.addEventListener("activate", function (event) {
    event.waitUntil((async function () {
      var killed = await killIfFlagged();
      if (killed) return;
      var names = cacheNames();
      var keys = await caches.keys();
      await Promise.all(keys.map(function (name) {
        if (name.indexOf("choppy-shell-") === 0 && name !== names.shell) return caches.delete(name);
        return Promise.resolve(false);
      }));
      await self.clients.claim();
    })());
  });

  self.addEventListener("message", function (event) {
    var data = event.data || {};
    if (data.type === "skip-waiting") {
      self.skipWaiting();
      return;
    }
    if (data.type === "wipe") {
      acceptStore = false;
      event.waitUntil(wipeAndUnregister());
    }
  });

  self.addEventListener("fetch", function (event) {
    if (!acceptStore) return;
    var req = event.request;
    if (req.headers && req.headers.has && req.headers.has("range")) return;
    var plan = planFetch({ url: req.url, method: req.method, origin: self.location.origin });
    if (plan.fallback === "none" && plan.strategy === "network-only") return;
    if (plan.bucket === "sensitive") {
      event.respondWith(networkOnlySensitive(req));
      return;
    }
    if (plan.bucket === "html") {
      event.respondWith(networkFirst(req, plan.store));
      event.waitUntil(maybeKill());
      return;
    }
    if (plan.bucket === "shell") {
      event.respondWith(plan.strategy === "cache-first-versioned" ? cacheFirstVersioned(req, plan.store) : networkFirst(req, plan.store));
      return;
    }
    if (plan.bucket === "art") {
      event.respondWith(boundedArt(req, plan.store));
    }
  });
})();
