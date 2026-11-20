/* Ranked ghost of the day (lazy). game.js records a compact path of every Ranked run:
 * one sample every 0.2 s of play time with the bird height (as a share of the field
 * height) and the distance scrolled. This file packs that path into a short text
 * string, sends it with the day's best score, fetches the day's best run that has a
 * path, and samples it during play. Every network step fails quietly: if the
 * Supabase functions from supabase/supabase-daily-ghost.sql are missing, there is
 * simply no ghost.
 *
 * Format "g1.<dtMs>.<unit>.<body>": body is 3 base64url chars per sample.
 *   chars 1-2: height, 12 bits, (y + 0.1) / 1.2 * 4095, so -0.1..1.1 of the field
 *   char 3: distance since the previous sample, in steps of <unit> px (0..63).
 * The distance is error-diffused, so the total never drifts more than one unit.
 */
(function (root) {
  "use strict";

  const ALPH = "ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789-_";
  const MAX_SAMPLES = 4000;
  const MAX_CHARS = 12100;
  const RE = /^g1\.(\d{2,5})\.(\d{1,3})\.([A-Za-z0-9_-]+)$/;
  const CACHE_MS = 60000;
  const IDX = {};
  for (let i = 0; i < ALPH.length; i++) IDX[ALPH.charAt(i)] = i;

  function clamp(v, lo, hi) { return v < lo ? lo : v > hi ? hi : v; }

  // rec: { y: [share of field height], d: [cumulative px] }, one sample per dt seconds.
  function encode(rec, dt) {
    if (!rec || !rec.y || !rec.d) return "";
    let ys = Array.prototype.slice.call(rec.y);
    let ds = Array.prototype.slice.call(rec.d);
    let n = Math.min(ys.length, ds.length);
    if (n < 2) return "";
    ys.length = n; ds.length = n;
    let ms = Math.round((Number(dt) || 0.2) * 1000);
    while (n > MAX_SAMPLES) {
      const y2 = [], d2 = [];
      for (let i = 0; i < n; i += 2) { y2.push(ys[i]); d2.push(ds[i]); }
      ys = y2; ds = d2; n = ys.length; ms *= 2;
    }
    let maxStep = 0;
    for (let i = 1; i < n; i++) maxStep = Math.max(maxStep, (Number(ds[i]) || 0) - (Number(ds[i - 1]) || 0));
    const unit = clamp(Math.ceil(maxStep / 63), 4, 255);
    let out = "";
    let sent = Number(ds[0]) || 0;
    for (let i = 0; i < n; i++) {
      const y = Number(ys[i]);
      const q = Math.round(clamp(((Number.isFinite(y) ? y : 0.5) + 0.1) / 1.2, 0, 1) * 4095);
      let k = 0;
      if (i > 0) {
        k = clamp(Math.round(((Number(ds[i]) || 0) - sent) / unit), 0, 63);
        sent += k * unit;
      }
      out += ALPH.charAt(q >> 6) + ALPH.charAt(q & 63) + ALPH.charAt(k);
    }
    const s = "g1." + ms + "." + unit + "." + out;
    return s.length <= MAX_CHARS ? s : "";
  }

  function decode(str) {
    if (typeof str !== "string" || str.length > MAX_CHARS) return null;
    const m = RE.exec(str);
    if (!m) return null;
    const ms = Number(m[1]);
    const unit = Number(m[2]);
    const body = m[3];
    if (!(ms >= 50 && ms <= 6400) || !(unit >= 1 && unit <= 255) || body.length % 3) return null;
    const n = body.length / 3;
    if (n < 2 || n > MAX_SAMPLES) return null;
    const y = new Float32Array(n);
    const d = new Float32Array(n);
    let acc = 0;
    for (let i = 0; i < n; i++) {
      const a = IDX[body.charAt(i * 3)], b = IDX[body.charAt(i * 3 + 1)], c = IDX[body.charAt(i * 3 + 2)];
      if (a == null || b == null || c == null) return null;
      y[i] = ((a << 6) | b) / 4095 * 1.2 - 0.1;
      if (i > 0) acc += c * unit;
      d[i] = acc;
    }
    return { dt: ms / 1000, n: n, y: y, d: d, end: (n - 1) * ms / 1000 };
  }

  // Position of the ghost at play time t (seconds). done is true after its run ended.
  function at(g, t) {
    if (!g || !g.n) return null;
    const tt = Math.max(0, Number(t) || 0);
    const f = tt / g.dt;
    const i = Math.floor(f);
    if (i >= g.n - 1) {
      return { y: g.y[g.n - 1], d: g.d[g.n - 1], v: 0, done: tt > g.end, end: g.end };
    }
    const k = f - i;
    const y = g.y[i] + (g.y[i + 1] - g.y[i]) * k;
    const d = g.d[i] + (g.d[i + 1] - g.d[i]) * k;
    return { y: y, d: d, v: (g.y[i + 1] - g.y[i]) / g.dt, done: false, end: g.end };
  }

  function client() {
    try {
      const sb = root.supabase && root.supabase.createClient && root.supabase.createClient();
      return sb && typeof sb.rpc === "function" ? sb : null;
    } catch (e) { return null; }
  }

  const cache = { day: "", at: 0, data: null, busy: null };
  const sentBest = {};

  // cb(ghost|null). ghost = decoded path + { rank, alias, score, mine }.
  function fetchTop(day, cb) {
    const done = function (v) { if (cb) try { cb(v); } catch (e) {} };
    const now = Date.now();
    if (cache.day === day && cache.at && now - cache.at < CACHE_MS) { done(cache.data); return; }
    if (cache.busy && cache.day === day) { cache.busy.push(done); return; }
    const sb = client();
    if (!sb) { done(null); return; }
    cache.day = day; cache.busy = [done]; cache.at = 0;
    const finish = function (v) {
      const q = cache.busy || [];
      cache.busy = null;
      if (cache.day === day) { cache.data = v; cache.at = Date.now(); }
      q.forEach(function (fn) { fn(v); });
    };
    let p;
    try { p = sb.rpc("daily_top_ghost", { p_day: day || null }); } catch (e) { finish(null); return; }
    Promise.resolve(p).then(function (res) {
      if (!res || res.error || !Array.isArray(res.data) || !res.data.length) { finish(null); return; }
      const row = res.data[0] || {};
      const g = decode(row.ghost);
      if (!g) { finish(null); return; }
      g.rank = Math.max(1, Number(row.rank) || 1);
      g.alias = typeof row.alias === "string" ? row.alias.slice(0, 24) : "";
      g.score = Number(row.score) || 0;
      g.mine = row.is_me === true;
      finish(g);
    }).catch(function () { finish(null); });
  }

  // Sends the path for a score already accepted by submit_daily_score. The server keeps it
  // only when the score matches the player's stored best for the day.
  function submit(day, score, ghost, cb) {
    const done = function (ok) { if (cb) try { cb(!!ok); } catch (e) {} };
    const n = Math.round(Number(score) || 0);
    if (!day || !(n > 0) || !decode(ghost)) { done(false); return; }
    if (sentBest[day] && sentBest[day] >= n) { done(false); return; }
    const sb = client();
    if (!sb) { done(false); return; }
    let p;
    try { p = sb.rpc("submit_daily_ghost", { p_score: n, p_ghost: ghost, p_day: day }); } catch (e) { done(false); return; }
    Promise.resolve(p).then(function (res) {
      const ok = !!(res && !res.error && res.data === true);
      if (ok) { sentBest[day] = n; cache.at = 0; }
      done(ok);
    }).catch(function () { done(false); });
  }

  root.ChoppyGhost = {
    encode: encode,
    decode: decode,
    at: at,
    fetchTop: fetchTop,
    submit: submit,
    forget: function () { cache.at = 0; },
    MAX_SAMPLES: MAX_SAMPLES,
    MAX_CHARS: MAX_CHARS
  };
})(typeof window !== "undefined" ? window : typeof globalThis !== "undefined" ? globalThis : this);
