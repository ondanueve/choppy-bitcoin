/* Lazy "Copy result" helper. Wordle-style plain text for Nostr, X, Stacker News. */
(function (root) {
  "use strict";

  var ROW = 20;
  var MAX_ROWS = 5;
  var STREAK_KEY = "choppy-daily-streak";

  function padDay(d) {
    var x = d || new Date();
    if (typeof x === "string") return x;
    var m = String(x.getUTCMonth() + 1).padStart(2, "0");
    var day = String(x.getUTCDate()).padStart(2, "0");
    return x.getUTCFullYear() + "-" + m + "-" + day;
  }

  function yesterdayOf(day) {
    var p = String(day || "").split("-");
    if (p.length !== 3) return "";
    var dt = new Date(Date.UTC(+p[0], +p[1] - 1, +p[2]));
    dt.setUTCDate(dt.getUTCDate() - 1);
    return padDay(dt);
  }

  function symbolForBar(bar) {
    if (bar == null) return "⬜";
    var o = typeof bar === "number" ? bar : (bar.o != null ? bar.o : bar.open);
    var c = typeof bar === "number" ? bar : (bar.c != null ? bar.c : bar.close);
    if (typeof o !== "number" || typeof c !== "number" || !isFinite(o) || !isFinite(c)) return "⬜";
    if (c > o) return "🟩";
    if (c < o) return "🟥";
    return "⬜";
  }

  function bucket(syms, size) {
    var out = [];
    for (var i = 0; i < syms.length; i += size) {
      var chunk = syms.slice(i, i + size);
      var up = 0, down = 0;
      for (var j = 0; j < chunk.length; j++) {
        if (chunk[j] === "🟩") up++;
        else if (chunk[j] === "🟥") down++;
      }
      out.push(up > down ? "🟩" : down > up ? "🟥" : "⬜");
    }
    return out;
  }

  function buildGrid(bars) {
    var list = Array.isArray(bars) ? bars : [];
    var syms = list.map(symbolForBar);
    var cap = ROW * MAX_ROWS;
    if (syms.length > cap) {
      syms = bucket(syms, Math.ceil(syms.length / cap));
    }
    if (!syms.length) return "";
    var rows = [];
    for (var i = 0; i < syms.length && rows.length < MAX_ROWS; i += ROW) {
      rows.push(syms.slice(i, i + ROW).join(""));
    }
    return rows.join("\n");
  }

  function fmtBag(n) {
    var v = Number(n);
    if (!Number.isFinite(v)) return "0 BTC";
    var s = v.toFixed(4).replace(/0+$/, "").replace(/\.$/, "");
    return s + " BTC";
  }

  function buildCopyText(data) {
    var d = data || {};
    var lines = ["Choppy Bitcoin"];
    if (d.daily && d.date) lines[0] += "  " + String(d.date);
    var bagLine = d.bagText ? String(d.bagText) : fmtBag(d.bag);
    if (d.rank) bagLine += "  #" + String(d.rank);
    var streak = Number(d.streak) || 0;
    if (streak >= 2) bagLine += "  🔥" + String(streak);
    lines.push(bagLine);
    var grid = buildGrid(d.bars || d.ohlc || []);
    if (grid) {
      lines.push("");
      lines.push(grid);
    }
    if (d.url) {
      lines.push("");
      lines.push(String(d.url));
    }
    return lines.join("\n");
  }

  function readStreak() {
    try {
      var raw = root.localStorage && root.localStorage.getItem(STREAK_KEY);
      var s = raw ? JSON.parse(raw) : null;
      if (!s || !s.day) return { day: "", n: 0 };
      return { day: String(s.day), n: Math.max(0, Number(s.n) || 0) };
    } catch (e) {
      return { day: "", n: 0 };
    }
  }

  function writeStreak(day, n) {
    try {
      if (root.localStorage) {
        root.localStorage.setItem(STREAK_KEY, JSON.stringify({ day: day, n: n }));
      }
    } catch (e) {}
    return n;
  }

  function noteStreak(day) {
    var key = padDay(day);
    var cur = readStreak();
    if (cur.day === key) return cur.n || 1;
    var n = (cur.day && cur.day === yesterdayOf(key)) ? (cur.n + 1) : 1;
    return writeStreak(key, n);
  }

  function copyText(text) {
    var str = String(text || "");
    if (!str) return Promise.resolve(false);
    if (root.navigator && root.navigator.clipboard && root.navigator.clipboard.writeText) {
      return root.navigator.clipboard.writeText(str).then(function () { return true; }).catch(function () {
        return fallbackCopy(str);
      });
    }
    return Promise.resolve(fallbackCopy(str));
  }

  function fallbackCopy(str) {
    var doc = root.document;
    if (!doc || !doc.createElement) return false;
    var ta = doc.createElement("textarea");
    ta.value = str;
    ta.setAttribute("readonly", "");
    ta.style.position = "fixed";
    ta.style.left = "-9999px";
    ta.style.top = "0";
    doc.body.appendChild(ta);
    ta.focus();
    ta.select();
    ta.setSelectionRange(0, ta.value.length);
    var ok = false;
    try { ok = !!(doc.execCommand && doc.execCommand("copy")); } catch (e) { ok = false; }
    try { ta.remove(); } catch (e2) {}
    return ok;
  }

  function client() {
    try {
      return root.supabase && root.supabase.createClient && root.supabase.createClient();
    } catch (e) { return null; }
  }

  function fetchServerStreak(done) {
    var sb = client();
    if (!sb || typeof sb.rpc !== "function") { if (done) done(null); return; }
    Promise.resolve(sb.rpc("daily_streak")).then(function (res) {
      if (!res || res.error) { if (done) done(null); return; }
      var n = Array.isArray(res.data) ? res.data[0] : res.data;
      if (n && typeof n === "object") n = n.streak != null ? n.streak : n.daily_streak;
      n = Number(n) || 0;
      if (done) done(n > 0 ? n : null);
    }).catch(function () { if (done) done(null); });
  }

  root.choppyBuildCopyText = buildCopyText;
  root.choppyCopyResultText = copyText;
  root.choppyBuildCopyGrid = buildGrid;
  root.choppyReadDailyStreak = function () { return readStreak().n; };
  root.choppyWriteDailyStreak = writeStreak;
  root.choppyNoteDailyStreak = noteStreak;
  root.choppyFetchDailyStreak = fetchServerStreak;
})(typeof window !== "undefined" ? window : typeof globalThis !== "undefined" ? globalThis : this);
