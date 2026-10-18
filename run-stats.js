(() => {
  const GREEN = "#4f9d6e";
  const RED = "#c45c4a";
  const GOLD = "#F2A900";
  const CYAN = "#9befff";
  const CREAM = "#fff6d0";
  function es() { return window.BZ && BZ.lang && BZ.lang() === "es"; }
  function t(en, esTxt) { return es() ? esTxt : en; }
  function fmtTime(sec) {
    const s = Math.max(0, Math.floor(Number(sec) || 0));
    return Math.floor(s / 60) + ":" + String(s % 60).padStart(2, "0");
  }
  function money(n) {
    const x = Number(n) || 0;
    const a = Math.abs(x);
    const sign = x < 0 ? "-" : "";
    if (a >= 1e12) return sign + "$" + (a / 1e12).toFixed(2) + "T";
    if (a >= 1e9) return sign + "$" + (a / 1e9).toFixed(2) + "B";
    if (a >= 1e6) return sign + "$" + (a / 1e6).toFixed(2) + "M";
    if (a >= 1e4) return sign + "$" + (a / 1e3).toFixed(1) + "k";
    return sign + "$" + a.toFixed(a >= 100 ? 0 : 2);
  }
  function fmtBtc(n) {
    const x = Number(n) || 0;
    const a = Math.abs(x);
    if (a >= 1e6) return (x / 1e6).toFixed(2) + "M BTC";
    if (a >= 1000) return (x / 1e3).toFixed(2) + "k BTC";
    if (a >= 1) return x.toFixed(4) + " BTC";
    if (a >= 0.0001) return x.toFixed(6) + " BTC";
    return x.toFixed(8) + " BTC";
  }
  function row(k, v) { return "<li><span class=\"k\">" + k + "</span><span>" + v + "</span></li>"; }

  function statsList(st) {
    if (!st) return "<p>—</p>";
    const startNet = (st.startCash || 0) / Math.max(0.01, st.startPrice || 1);
    const pxMul = (st.endPrice || 0) / Math.max(0.01, st.startPrice || 1);
    const netMul = (st.net || 0) / Math.max(1e-9, startNet);
    return "<ul class=\"recap-list\">"
      + row(t("Time", "Tiempo"), fmtTime(st.time))
      + row(t("Candles", "Velas"), String(st.candles || 0))
      + row(t("Start cash", "Cash inicial"), money(st.startCash))
      + row(t("End cash", "Cash final"), money(st.endCash))
      + row(t("BTC stacked", "BTC apilado"), fmtBtc(st.endBtc))
      + row(t("Start BTC px", "Precio inicial"), money(st.startPrice))
      + row(t("End BTC px", "Precio final"), money(st.endPrice))
      + row(t("Price multiple", "Múltiplo de precio"), pxMul.toFixed(2) + "x")
      + row(t("Peak net", "Pico patrimonio"), fmtBtc(st.peakNet))
      + row(t("Net worth", "Patrimonio"), fmtBtc(st.net))
      + row(t("Stack multiple", "Múltiplo de stack"), netMul.toFixed(2) + "x")
      + row(t("Buys / sells", "Compras / ventas"), (st.buys || 0) + " / " + (st.sells || 0))
      + row(t("Halvings", "Halvings"), (st.halvings || 0) + " · miss " + (st.halveMiss || 0))
      + row(t("Swans vaporized", "Swans vaporizados"), String(st.swans || 0))
      + row(t("Laser eyes", "Ojos láser"), String(st.lasers || 0))
      + row(t("Cold lost", "Cold perdidos"), String(st.coldLost || 0))
      + "</ul>";
  }

  function emptyOpts() { return { trades: false, btc: false, usd: false, net: false }; }

  function chartOptsHtml(opts) {
    opts = opts || emptyOpts();
    const box = (key, lab) => "<label class=\"chart-opt\"><input type=\"checkbox\" data-opt=\"" + key + "\"" + (opts[key] ? " checked" : "") + "> " + lab + "</label>";
    return "<div class=\"chart-opts\">"
      + box("trades", t("Buys / sells", "Compras / ventas"))
      + box("btc", t("BTC bag", "Bolsa BTC"))
      + box("usd", t("USD bag", "Bolsa USD"))
      + box("net", t("Net worth", "Patrimonio"))
      + "<button type=\"button\" class=\"stats-mini\" data-chart-large=\"1\">" + t("Open large", "Abrir grande") + "</button>"
      + "</div>";
  }

  function bucketSeries(arr, bucket, nBars) {
    const src = arr || [];
    const out = [];
    for (let i = 0; i < nBars; i++) {
      const sl = src.slice(i * bucket, i * bucket + bucket);
      out.push(sl.length ? sl[sl.length - 1] : (out.length ? out[out.length - 1] : 0));
    }
    return out;
  }

  function paintRunChart(canvas, bag, opts) {
    if (!canvas || !bag) return;
    opts = opts || emptyOpts();
    const data = bag.tape || [];
    const ctx = canvas.getContext("2d");
    const W = canvas.width, H = canvas.height;
    ctx.fillStyle = "#0a0a0c";
    ctx.fillRect(0, 0, W, H);
    if (data.length < 2) {
      ctx.fillStyle = "#8a8680";
      ctx.font = "12px monospace";
      ctx.textAlign = "center";
      ctx.fillText("—", W / 2, H / 2);
      return;
    }
    const target = Math.max(80, Math.min(220, Math.floor(W / 6)));
    const bucket = Math.max(1, Math.ceil(data.length / target));
    const bars = [];
    for (let i = 0; i < data.length; i += bucket) {
      const sl = data.slice(i, i + bucket);
      const o = bars.length ? bars[bars.length - 1].c : sl[0];
      bars.push({ o: o, h: Math.max.apply(null, sl), l: Math.min.apply(null, sl), c: sl[sl.length - 1] });
    }
    let lo = bars[0].l, hi = bars[0].h;
    for (const b of bars) { if (b.l < lo) lo = b.l; if (b.h > hi) hi = b.h; }
    const pad = Math.max(0.01, (hi - lo) * 0.08);
    lo -= pad; hi += pad;
    const left = 10, right = 10, top = 16, bot = 22;
    const innerW = W - left - right, innerH = H - top - bot;
    const stepX = innerW / Math.max(1, bars.length);
    const cw = Math.max(1.2, Math.min(6.5, stepX * 0.72));
    const py = (v) => top + (1 - (v - lo) / Math.max(0.01, hi - lo)) * innerH;
    bars.forEach((b, i) => {
      const x = left + i * stepX;
      const up = b.c >= b.o;
      ctx.strokeStyle = up ? GREEN : RED;
      ctx.fillStyle = up ? GREEN : RED;
      ctx.lineWidth = 1;
      ctx.beginPath();
      ctx.moveTo(x + cw / 2, py(b.h));
      ctx.lineTo(x + cw / 2, py(b.l));
      ctx.stroke();
      ctx.fillRect(x, Math.min(py(b.o), py(b.c)), cw, Math.max(1.1, Math.abs(py(b.c) - py(b.o))));
    });
    ctx.save();
    ctx.font = "700 8px monospace";
    ctx.textAlign = "center";
    ctx.lineWidth = 3;
    ctx.strokeStyle = "rgba(10,10,12,0.82)";
    (bag.marks || []).forEach((mk) => {
      const vi = Math.floor((mk.i || 0) / bucket);
      if (vi < 0 || vi >= bars.length) return;
      const x = left + vi * stepX + cw / 2;
      const peak = mk.kind === "peak";
      const y = py(mk.price) + (peak ? -4 : 4);
      ctx.textBaseline = peak ? "bottom" : "top";
      ctx.fillStyle = peak ? GREEN : RED;
      const lab = money(mk.price);
      ctx.strokeText(lab, x, y);
      ctx.fillText(lab, x, y);
    });
    if (opts.trades) {
      (bag.trades || []).forEach((tr) => {
        const vi = Math.floor((tr.i || 0) / bucket);
        if (vi < 0 || vi >= bars.length) return;
        const x = left + vi * stepX + cw / 2;
        const y = py(tr.price);
        const buy = tr.kind === "buy";
        ctx.fillStyle = buy ? GREEN : RED;
        ctx.beginPath();
        if (buy) { ctx.moveTo(x, y - 8); ctx.lineTo(x + 5.5, y + 3); ctx.lineTo(x - 5.5, y + 3); }
        else { ctx.moveTo(x, y + 8); ctx.lineTo(x + 5.5, y - 3); ctx.lineTo(x - 5.5, y - 3); }
        ctx.closePath(); ctx.fill();
        ctx.textBaseline = buy ? "bottom" : "top";
        ctx.strokeText(buy ? "B" : "S", x, buy ? y - 9 : y + 9);
        ctx.fillText(buy ? "B" : "S", x, buy ? y - 9 : y + 9);
      });
    }
    function strokeSeries(arr, color) {
      if (!arr || arr.length < 2) return;
      const vals = bucketSeries(arr, bucket, bars.length);
      let sLo = vals[0], sHi = vals[0];
      for (let i = 1; i < vals.length; i++) { if (vals[i] < sLo) sLo = vals[i]; if (vals[i] > sHi) sHi = vals[i]; }
      if (sHi - sLo < 1e-12) { sLo -= 1; sHi += 1; }
      ctx.beginPath();
      ctx.strokeStyle = color;
      ctx.lineWidth = 1.8;
      vals.forEach((v, i) => {
        const x = left + i * stepX + cw / 2;
        const y = top + (1 - (v - sLo) / (sHi - sLo)) * innerH;
        if (i) ctx.lineTo(x, y); else ctx.moveTo(x, y);
      });
      ctx.stroke();
    }
    if (opts.btc) strokeSeries(bag.tapeBtc, GOLD);
    if (opts.usd) strokeSeries(bag.tapeCash, CYAN);
    if (opts.net) strokeSeries(bag.tapeNet, CREAM);
    ctx.restore();
    ctx.font = "700 9px monospace";
    ctx.textAlign = "left";
    ctx.textBaseline = "top";
    let lx = 10;
    function legend(color, lab) {
      ctx.fillStyle = color;
      ctx.fillText(lab, lx, H - 14);
      lx += ctx.measureText(lab).width + 12;
    }
    legend("#8a8680", t("Price", "Precio"));
    if (opts.trades) { legend(GREEN, "B"); legend(RED, "S"); }
    if (opts.btc) legend(GOLD, t("BTC bag", "BTC"));
    if (opts.usd) legend(CYAN, t("USD bag", "USD"));
    if (opts.net) legend(CREAM, t("Net", "Net"));
  }

  function runStatsUrl() {
    try {
      const tags = document.getElementsByTagName("script");
      for (let i = 0; i < tags.length; i++) {
        const s = tags[i].src || "";
        if (/run-stats\.js/i.test(s)) return s;
      }
      return new URL("run-stats.js", location.href).href;
    } catch (e) {
      return "run-stats.js";
    }
  }

  function openRunChartTab(bag, opts) {
    const payload = JSON.stringify({ bag: bag || {}, opts: opts || emptyOpts() }).replace(/</g, "\\u003c");
    const w = window.open("", "_blank");
    if (!w) return;
    const src = runStatsUrl().replace(/"/g, "");
    w.document.open();
    w.document.write("<!DOCTYPE html><html><head><meta charset=\"UTF-8\"><meta name=\"viewport\" content=\"width=device-width,initial-scale=1\"><title>Run chart</title>"
      + "<style>html,body{margin:0;background:#0a0a0c;color:#f3efe6;font-family:IBM Plex Mono,ui-monospace,monospace}"
      + "header{display:flex;flex-wrap:wrap;gap:10px;align-items:center;padding:10px 12px;border-bottom:1px solid #2a2a2e}"
      + "h1{margin:0;font-size:16px;letter-spacing:.08em}.chart-opts{display:flex;flex-wrap:wrap;gap:10px;align-items:center;font-size:12px}"
      + ".chart-opt{display:flex;align-items:center;gap:4px;color:#c8c4bc}.chart-opt input{accent-color:#c8960a}"
      + "canvas{display:block;width:100%;background:#0a0a0c}</style></head><body>"
      + "<header><h1>CHART</h1><div class=\"chart-opts\" id=\"opts\"></div></header>"
      + "<canvas id=\"big-chart\"></canvas>"
      + "<script>window.__CHART__=" + payload + ";"
      + "window.__bootChart=function(){var packed=window.__CHART__||{};var bag=packed.bag||{};var opts=packed.opts||{trades:false,btc:false,usd:false,net:false};"
      + "var box=document.getElementById('opts');if(!window.chartOptsHtml||!window.paintRunChart)return;"
      + "box.innerHTML=window.chartOptsHtml(opts);"
      + "var large=box.querySelector('[data-chart-large]');if(large)large.remove();"
      + "var canvas=document.getElementById('big-chart');"
      + "function size(){canvas.width=Math.max(320,window.innerWidth);canvas.height=Math.max(240,window.innerHeight-56);window.paintRunChart(canvas,bag,opts);}"
      + "window.bindChartControls(box,bag,opts,canvas);window.addEventListener('resize',size);size();};</script>"
      + "<script src=\"" + src + "\" onload=\"window.__bootChart()\"></script>"
      + "</body></html>");
    w.document.close();
  }

  function bindChartControls(root, bag, opts, canvas, onChange) {
    if (!root) return;
    root.querySelectorAll("[data-opt]").forEach((el) => {
      el.onchange = () => {
        opts[el.getAttribute("data-opt")] = !!el.checked;
        if (onChange) onChange(opts);
        paintRunChart(canvas, bag, opts);
      };
    });
    const large = root.querySelector("[data-chart-large]");
    if (large) large.onclick = (e) => {
      e.preventDefault();
      e.stopPropagation();
      openRunChartTab(bag, opts);
    };
  }

  function ensureModal() {
    let m = document.getElementById("saved-run-modal");
    if (m) return m;
    if (!document.getElementById("saved-run-css")) {
      const css = document.createElement("style");
      css.id = "saved-run-css";
      css.textContent = "#saved-run-modal{position:fixed;inset:0;background:rgba(0,0,0,.72);display:none;align-items:center;justify-content:center;z-index:10000;padding:16px}"
        + "#saved-run-modal.open{display:flex}"
        + "#saved-run-modal .recap-card{background:#0a0a0c;border:1px solid #2a2a2e;max-width:440px;width:100%;max-height:90vh;overflow:auto;padding:16px;color:#f3efe6;font-family:IBM Plex Mono,monospace}"
        + "#saved-run-modal h1{font-size:18px;margin:0 0 10px}"
        + "#saved-run-modal .recap-tabs{display:flex;gap:8px;margin-bottom:10px}"
        + "#saved-run-modal .recap-tabs button{flex:1;min-height:34px;background:#141416;color:#f3efe6;border:1px solid #3a3a40;font:inherit;cursor:pointer}"
        + "#saved-run-modal .recap-tabs button.on{background:#c8960a;color:#09090b;border-color:#f0d060}"
        + "#saved-run-modal .recap-list{list-style:none;padding:8px;margin:0;border:1px solid #2a2a2e}"
        + "#saved-run-modal .recap-list li{display:flex;justify-content:space-between;padding:2px 0;font-size:12px}"
        + "#saved-run-modal .k{color:#8a8680}"
        + "#saved-run-modal #saved-run-tape{width:100%;height:220px;background:#0a0a0c;border:1px solid #2a2a2e}"
        + "#saved-run-modal .chart-opts{display:flex;flex-wrap:wrap;gap:8px;align-items:center;margin:8px 0;font-size:11px}"
        + "#saved-run-modal .chart-opt{display:flex;align-items:center;gap:4px;color:#c8c4bc}"
        + "#saved-run-modal .chart-opt input{accent-color:#c8960a}"
        + "#saved-run-modal .recap-close{margin-top:12px;width:100%;min-height:40px;background:#c8960a;color:#09090b;border:0;font:inherit;font-weight:700;cursor:pointer}";
      document.head.appendChild(css);
    }
    m = document.createElement("div");
    m.id = "saved-run-modal";
    m.innerHTML = "<div class=\"recap-card\" id=\"saved-run-card\"></div>";
    document.body.appendChild(m);
    m.addEventListener("click", (e) => { if (e.target === m) closeSavedRunStats(); });
    return m;
  }

  function closeSavedRunStats() {
    const m = document.getElementById("saved-run-modal");
    if (!m) return;
    m.classList.remove("open");
    m.style.display = "none";
  }

  function openSavedRunStats(bag) {
    if (!bag) return;
    const m = ensureModal();
    const card = document.getElementById("saved-run-card");
    let tab = "stats";
    const opts = emptyOpts();
    function draw() {
      card.innerHTML = "<h1>" + t("RUN TAPE", "CINTA DE LA RUN") + "</h1>"
        + "<div class=\"recap-tabs\">"
        + "<button type=\"button\" class=\"" + (tab === "stats" ? "on" : "") + "\" data-tab=\"stats\">STATS</button>"
        + "<button type=\"button\" class=\"" + (tab === "chart" ? "on" : "") + "\" data-tab=\"chart\">CHART</button>"
        + "</div>"
        + (tab === "chart"
          ? "<canvas id=\"saved-run-tape\" width=\"420\" height=\"228\"></canvas>" + chartOptsHtml(opts)
          : statsList(bag))
        + "<button type=\"button\" class=\"recap-close\" id=\"saved-run-close\">" + t("BACK", "VOLVER") + "</button>";
      card.querySelectorAll("[data-tab]").forEach((btn) => {
        btn.onclick = () => { tab = btn.getAttribute("data-tab"); draw(); };
      });
      const close = document.getElementById("saved-run-close");
      if (close) close.onclick = closeSavedRunStats;
      if (tab === "chart") {
        const canvas = document.getElementById("saved-run-tape");
        paintRunChart(canvas, bag, opts);
        bindChartControls(card, bag, opts, canvas);
      }
    }
    draw();
    m.classList.add("open");
    m.style.display = "flex";
  }

  window.paintRunChart = paintRunChart;
  window.chartOptsHtml = chartOptsHtml;
  window.bindChartControls = bindChartControls;
  window.openRunChartTab = openRunChartTab;
  window.openSavedRunStats = openSavedRunStats;
  window.closeSavedRunStats = closeSavedRunStats;
})();
