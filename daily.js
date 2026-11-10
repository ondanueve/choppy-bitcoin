/* Lazy daily-board client. Hidden until submit_daily_score / daily_board exist. */
(function (root) {
  "use strict";

  function client() {
    try {
      return root.supabase && root.supabase.createClient && root.supabase.createClient();
    } catch (e) { return null; }
  }

  function hide(wrap) {
    if (wrap) wrap.hidden = true;
  }

  function fmtBag(n) {
    const v = Number(n);
    if (!Number.isFinite(v) || v <= 0) return "0 BTC";
    let s = v.toFixed(4);
    s = s.replace(/0+$/, "").replace(/\.$/, "");
    return s + " BTC";
  }

  function fillBoard(wrap, box, day) {
    if (!box) { hide(wrap); return; }
    const sb = client();
    if (!sb || typeof sb.rpc !== "function") { hide(wrap); return; }
    Promise.resolve(sb.rpc("daily_board", { p_day: day || null, p_limit: 20 })).then(function (res) {
      if (!res || res.error || !Array.isArray(res.data)) { hide(wrap); return; }
      const rows = res.data;
      if (wrap) wrap.hidden = false;
      if (!rows.length) { box.textContent = "—"; return; }
      box.innerHTML = rows.map(function (row, i) {
        const n = row.alias || "?";
        const bag = fmtBag(row.bag != null ? row.bag : (Number(row.score) || 0) / 10000);
        return (i + 1) + ". @" + n + "  " + bag;
      }).join("\n");
    }).catch(function () { hide(wrap); });
  }

  function submit(payload) {
    const sb = client();
    if (!sb || typeof sb.rpc !== "function" || !payload) return;
    const score = Math.round(Number(payload.score) || 0);
    if (!(score > 0)) return;
    const args = {
      p_score: score,
      p_life: Number(payload.life) || 0,
      p_candles: Math.round(Number(payload.candles) || 0),
      p_day: payload.day || null
    };
    Promise.resolve(sb.rpc("submit_daily_score", args)).then(function () {}).catch(function () {});
  }

  root.choppyFillDailyBoard = fillBoard;
  root.choppySubmitDaily = submit;
  root.choppyDailyReady = function () { return true; };
})(typeof window !== "undefined" ? window : typeof globalThis !== "undefined" ? globalThis : this);
