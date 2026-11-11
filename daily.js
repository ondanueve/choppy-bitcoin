/* Lazy daily-board client. Hidden until submit_daily_score / daily_board exist. */
(function (root) {
  "use strict";

  function client() {
    try {
      return root.supabase && root.supabase.createClient && root.supabase.createClient();
    } catch (e) { return null; }
  }

  function hide(el) {
    if (el) el.hidden = true;
  }

  function show(el) {
    if (el) el.hidden = false;
  }

  function fmtBag(n) {
    const v = Number(n);
    if (!Number.isFinite(v) || v <= 0) return "0 BTC";
    let s = v.toFixed(4);
    s = s.replace(/0+$/, "").replace(/\.$/, "");
    return s + " BTC";
  }

  function rowsHtml(rows) {
    if (!rows || !rows.length) return "—";
    return rows.map(function (row, i) {
      const n = row.alias || "?";
      const bag = fmtBag(row.bag != null ? row.bag : (Number(row.score) || 0) / 10000);
      return (i + 1) + ". @" + n + "  " + bag;
    }).join("\n");
  }

  function fillOne(box, wrap, day, opts) {
    opts = opts || {};
    if (!box) { hide(wrap); return Promise.resolve(false); }
    const sb = client();
    if (!sb || typeof sb.rpc !== "function") { hide(wrap); return Promise.resolve(false); }
    return Promise.resolve(sb.rpc("daily_board", { p_day: day || null, p_limit: opts.limit || 20 })).then(function (res) {
      if (!res || res.error || !Array.isArray(res.data)) { hide(wrap); return false; }
      if (wrap) wrap.hidden = false;
      const rows = res.data;
      if (!rows.length && opts.hideIfEmpty) { hide(wrap); return false; }
      box.innerHTML = rowsHtml(rows);
      return true;
    }).catch(function () { hide(wrap); return false; });
  }

  function fillBoard(wrap, box, day) {
    fillOne(box, wrap, day, { limit: 20 });
  }

  function $(id) {
    return root.document && root.document.getElementById(id);
  }

  function bindTabs(rootEl) {
    if (!rootEl || rootEl.__choppyTabs) return;
    rootEl.__choppyTabs = true;
    rootEl.addEventListener("click", function (e) {
      const btn = e.target && e.target.closest && e.target.closest("[data-daily-tab]");
      if (!btn) return;
      e.preventDefault();
      e.stopPropagation();
      showTab(rootEl, btn.getAttribute("data-daily-tab"));
    });
  }

  function showTab(rootEl, name) {
    const tabs = rootEl.querySelectorAll("[data-daily-tab]");
    const panes = {
      today: $("ready-daily") || $("site-daily"),
      yesterday: $("ready-daily-y") || $("site-daily-y"),
      legacy: $("ready-board") || $("site-board")
    };
    const wraps = {
      today: $("daily-today-wrap") || panes.today,
      yesterday: $("daily-y-wrap") || panes.yesterday,
      legacy: $("daily-legacy-wrap") || panes.legacy
    };
    ["today", "yesterday", "legacy"].forEach(function (key) {
      const on = key === name;
      if (wraps[key]) wraps[key].hidden = !on;
      tabs.forEach(function (t) {
        if (t.getAttribute("data-daily-tab") === key) {
          if (on) t.classList.add("on");
          else t.classList.remove("on");
        }
      });
    });
    if (name === "legacy" && root.refreshLeaderboard) {
      const id = ($("ready-board") && "ready-board") || "site-board";
      root.refreshLeaderboard(id);
    }
  }

  function fillRankedBoards(todayKey, yesterdayKey) {
    const wrap = $("daily-board-wrap");
    const todayBox = $("ready-daily") || $("site-daily");
    const yBox = $("ready-daily-y") || $("site-daily-y");
    const yWrap = $("daily-y-wrap");
    if (!wrap || !todayBox) return;
    bindTabs(wrap);
    Promise.all([
      fillOne(todayBox, wrap, todayKey, { limit: 20 }),
      yBox ? fillOne(yBox, yWrap || yBox, yesterdayKey, { limit: 10, hideIfEmpty: false }) : Promise.resolve(false)
    ]).then(function (ok) {
      if (!ok[0]) {
        if (wrap.querySelector("[data-daily-tab=legacy]")) {
          show(wrap);
          showTab(wrap, "legacy");
        } else {
          hide(wrap);
        }
        return;
      }
      show(wrap);
      if (wrap.querySelector("[data-daily-tab]")) showTab(wrap, "today");
    });
  }

  function submit(payload, done) {
    const sb = client();
    if (!sb || typeof sb.rpc !== "function" || !payload) {
      if (done) done(null);
      return;
    }
    const score = Math.round(Number(payload.score) || 0);
    if (!(score > 0)) { if (done) done(null); return; }
    const args = {
      p_score: score,
      p_life: Number(payload.life) || 0,
      p_candles: Math.round(Number(payload.candles) || 0),
      p_day: payload.day || null
    };
    Promise.resolve(sb.rpc("submit_daily_score", args)).then(function (res) {
      if (res && res.error) { if (done) done(null); return; }
      fetchMyRank(payload.day, done);
    }).catch(function () { if (done) done(null); });
  }

  function fetchMyRank(day, done) {
    const sb = client();
    if (!sb || typeof sb.rpc !== "function") { if (done) done(null); return; }
    Promise.resolve(sb.rpc("daily_my_rank", { p_day: day || null })).then(function (res) {
      if (!res || res.error || !Array.isArray(res.data) || !res.data.length) {
        if (done) done(null);
        return;
      }
      const row = res.data[0];
      if (done) done(row && row.rank ? Number(row.rank) : null, row);
    }).catch(function () { if (done) done(null); });
  }

  function tickReset(el, text) {
    if (!el) return;
    if (text) el.textContent = text;
  }

  root.choppyFillDailyBoard = fillBoard;
  root.choppyFillRankedBoards = fillRankedBoards;
  root.choppySubmitDaily = submit;
  root.choppyDailyMyRank = fetchMyRank;
  root.choppyTickDailyReset = tickReset;
  root.choppyShowDailyTab = function (name) {
    const wrap = $("daily-board-wrap");
    if (wrap) showTab(wrap, name);
  };
  root.choppyDailyReady = function () { return true; };
})(typeof window !== "undefined" ? window : typeof globalThis !== "undefined" ? globalThis : this);
