(() => {
  const canvas = document.getElementById("c");
  const field = document.getElementById("field");
  const overlay = document.getElementById("overlay");
  const A = window.ArcadeAudio;
  const POWER_S = 5;
  const WAVE_UP = 3;
  const WAVE_BACK = 2;
  const HALVE_N = 21;
  const HALVE_GAP = 210;
  const BTC_CAP = 21e6;
  let GREEN = "#4f9d6e";
  let RED = "#c45c4a";
  let BTC = "#c8960a";
  const PALETTES = {
    classic: {
      nameKey: "palClassic",
      bg: "#0a0a0c", bgTop: "#16140e", bgBot: "#070708", glow: "rgba(200,150,10,0.18)",
      fg: "#f3efe6", gold: "#c8960a", ink: "#09090b",
      line: "#2a2a2e", muted: "#8a8680", surface: "#141416", border: "#3a3a40",
      hud: "#fff6d0", green: "#4f9d6e", red: "#c45c4a",
      grid: "rgba(243,239,230,0.14)", bullBg: "#052010", bearBg: "#200505",
      halo: "rgba(0,0,0,0.88)", labelUp: "#8ee0a8", labelDn: "#ff9a8c",
      card: "#1a1a1e", cardFg: "#f3efe6", desc: "#c4c0b6"
    },
    midnight: {
      nameKey: "palMidnight",
      bg: "#070b18", bgTop: "#122048", bgBot: "#03040c", glow: "rgba(90,150,255,0.38)",
      fg: "#dce6f5", gold: "#7eb6ff", ink: "#041018",
      line: "#1c2740", muted: "#7a88a4", surface: "#0e1524", border: "#2a3a58",
      hud: "#d6e8ff", green: "#3dba8c", red: "#e06a7a",
      grid: "rgba(126,182,255,0.12)", bullBg: "#041820", bearBg: "#180814",
      halo: "rgba(0,0,0,0.9)", labelUp: "#b8f0d0", labelDn: "#ffb4bc",
      card: "#0e1524", cardFg: "#e8f0fc", desc: "#b4c4dc"
    },
    terminal: {
      nameKey: "palTerminal",
      bg: "#020904", bgTop: "#063014", bgBot: "#010402", glow: "rgba(70,255,100,0.22)",
      fg: "#b6f5b0", gold: "#5dff6a", ink: "#021004",
      line: "#143318", muted: "#5a8a58", surface: "#06140a", border: "#1c4a22",
      hud: "#c8ffc4", green: "#3adf5a", red: "#ff5a4a",
      grid: "rgba(93,255,106,0.1)", bullBg: "#032010", bearBg: "#180808",
      halo: "rgba(0,0,0,0.92)", labelUp: "#d0ffcc", labelDn: "#ffc0b4",
      card: "#06140a", cardFg: "#d8ffd4", desc: "#a8e0b0"
    },
    paper: {
      nameKey: "palPaper",
      bg: "#f3ead8", bgTop: "#fbf6ea", bgBot: "#e4d5bc", glow: "rgba(176,122,16,0.16)",
      fg: "#1a1610", gold: "#b07a10", ink: "#1a1610",
      line: "#c8bba4", muted: "#4a443c", surface: "#f6efe2", border: "#b8aa90",
      hud: "#5a4010", green: "#2f7a4a", red: "#b44a3a",
      grid: "rgba(26,22,16,0.1)", bullBg: "#d8ead8", bearBg: "#ead8d4",
      halo: "rgba(255,255,255,0.92)", labelUp: "#14532d", labelDn: "#9a2218",
      card: "#fff8ee", cardFg: "#1a1610", desc: "#4a443c"
    },
    neon: {
      nameKey: "palNeon",
      bg: "#0c0314", bgTop: "#2a0a48", bgBot: "#050108", glow: "rgba(255,74,210,0.42)",
      fg: "#f4e8ff", gold: "#ff4ad2", ink: "#120414",
      line: "#3a1848", muted: "#a888b8", surface: "#16081c", border: "#5a2870",
      hud: "#ffd0f4", green: "#2ee6c8", red: "#ff4a7a",
      grid: "rgba(255,74,210,0.12)", bullBg: "#041816", bearBg: "#180410",
      halo: "rgba(0,0,0,0.9)", labelUp: "#b8fff4", labelDn: "#ffc0dc",
      card: "#16081c", cardFg: "#ffe8ff", desc: "#e0c4f0"
    },
    sunset: {
      nameKey: "palSunset",
      bg: "#2a1018", bgTop: "#4a1c16", bgBot: "#12080c", glow: "rgba(255,138,58,0.42)",
      fg: "#fff6ee", gold: "#ffb15a", ink: "#1a0808",
      line: "#4a2030", muted: "#f0c8b8", surface: "#221018", border: "#6a3040",
      hud: "#fff6ec", green: "#e8a040", red: "#ff7a72",
      grid: "rgba(255,138,58,0.12)", bullBg: "#181000", bearBg: "#180808",
      halo: "rgba(0,0,0,0.92)", labelUp: "#fff8ea", labelDn: "#ffd4cc",
      card: "#2a1018", cardFg: "#fff0e4", desc: "#f0c8b8"
    },
    flower: {
      nameKey: "palFlower",
      bg: "#3a1050", bgTop: "#e040a8", bgBot: "#1a0840", glow: "rgba(255,80,220,0.5)",
      fg: "#fff4c8", gold: "#ffe14a", ink: "#2a0838",
      line: "#6a2880", muted: "#e8a8d8", surface: "#4a1868", border: "#c050c8",
      hud: "#fff0a0", green: "#7dff6a", red: "#ff4aa8",
      grid: "rgba(255,80,220,0.14)", bullBg: "#143018", bearBg: "#301018",
      halo: "rgba(0,0,0,0.9)", labelUp: "#f0ffc0", labelDn: "#ffe0f8",
      card: "#2a0840", cardFg: "#fff8d8", desc: "#f4d0ec"
    },
    simple: {
      nameKey: "palSimple",
      bg: "#f2f2f0", bgTop: "#f2f2f0", bgBot: "#f2f2f0", glow: "transparent",
      fg: "#161616", gold: "#222222", ink: "#ffffff",
      line: "#d0d0cc", muted: "#3a3a38", surface: "#ffffff", border: "#b8b8b4",
      hud: "#161616", green: "#2a2a2a", red: "#2a2a2a",
      grid: "rgba(22,22,22,0.06)", bullBg: "#e8e8e6", bearBg: "#e8e8e6",
      halo: "rgba(255,255,255,0.95)", labelUp: "#111111", labelDn: "#111111",
      card: "#ffffff", cardFg: "#161616", desc: "#3a3a38"
    }
  };
  let PAL = PALETTES.classic;
  let PALETTE_ID = "classic";
  const HERO_SKINS = {
    classic: { fill:"#f2a900", rim:"#ffe7a0", dark:"#c48400", edge:"#8a5a00", ink:"#1a0c06", btc:"#f7f7f8", band:"#e02420", halo:"#fff4d6", lensF:"#0a0a0c", lensB:"#1a1a1e", limb:"#1a0c06", mark:"₿", style:"coin" },
    midnight:{ fill:"#9ec4ff", rim:"#e8f0ff", dark:"#4a6aa0", edge:"#2a4068", ink:"#041018", btc:"#e8eefc", band:"#3d6adf", halo:"#d6e8ff", lensF:"#0a1428", lensB:"#1a2848", limb:"#c5d8ff", mark:"₿", style:"rocket", glow:"rgba(126,182,255,0.4)" },
    terminal:{ fill:"#163416", rim:"#5dff6a", dark:"#0a200a", edge:"#082008", ink:"#021004", btc:"#5dff6a", band:"#3adf5a", halo:"#c8ffc4", lensF:"#021004", lensB:"#0a280a", limb:"#5dff6a", mark:"₿", style:"pixel", glow:"rgba(93,255,106,0.28)" },
    paper:   { fill:"#e6c24a", rim:"#1a1610", dark:"#d4a06a", edge:"#b8aa90", ink:"#1a1610", btc:"#1a1610", band:"#e07a8a", halo:"#fff8ee", lensF:"#1a1610", lensB:"#3a3228", limb:"#1a1610", mark:"₿", style:"pencil" },
    neon:    { fill:"#ff4ad2", rim:"#ffd0f4", dark:"#a02080", edge:"#5a1060", ink:"#120414", btc:"#fff0ff", band:"#2ee6c8", halo:"#ffd0f4", lensF:"#1a0420", lensB:"#3a0850", limb:"#2ee6c8", mark:"₿", style:"glow", glow:"rgba(255,74,210,0.48)" },
    sunset:  { fill:"#ff8a3a", rim:"#ffd0b0", dark:"#c45a40", edge:"#8a3020", ink:"#1a0808", btc:"#ffe8d4", band:"#e05050", halo:"#ffe0c8", lensF:"#2a1010", lensB:"#4a1818", limb:"#1a0808", mark:"₿", style:"sun", glow:"rgba(255,138,58,0.4)" },
    flower:  { fill:"#ffe14a", rim:"#fff4c8", dark:"#e040a8", edge:"#c050c8", ink:"#2a0838", btc:"#6a2880", band:"#ff4aa8", halo:"#fff0a0", lensF:"#3a1050", lensB:"#5a2080", limb:"#7dff6a", mark:"₿", style:"hippie", glow:"rgba(255,80,220,0.32)" },
    simple:  { fill:"#222222", rim:"#161616", dark:"#111111", edge:"#000000", ink:"#ffffff", btc:"#f2f2f0", band:"#222222", halo:"#ffffff", lensF:"#000000", lensB:"#333333", limb:"#161616", mark:"₿", style:"flat" }
  };
  let HERO_SKIN = "classic";
  let HERO_ANIM = false;
  function heroSkin(id) { return HERO_SKINS[id] || HERO_SKINS.classic; }
  function currentPaletteId() { return PALETTE_ID; }
  function applyPalette(id) {
    if (!PALETTES[id]) id = "classic";
    const p = PALETTES[id];
    PALETTE_ID = id;
    PAL = p;
    GREEN = p.green;
    RED = p.red;
    BTC = p.gold;
    try { localStorage.setItem("choppy-palette", id); } catch (e) {}
    const vars = {
      "--bg": p.bg, "--fg": p.fg, "--gold": p.gold, "--ink": p.ink,
      "--line": p.line, "--muted": p.muted, "--surface": p.surface,
      "--border": p.border, "--hud": p.hud, "--green": p.green, "--red": p.red,
      "--bg-top": p.bgTop || p.bg, "--bg-bot": p.bgBot || p.bg, "--bg-glow": p.glow || "transparent",
      "--card": p.card || p.surface, "--card-fg": p.cardFg || p.fg, "--desc": p.desc || p.muted
    };
    [document.documentElement, document.body, document.getElementById("app")].forEach((el) => {
      if (!el) return;
      el.setAttribute("data-palette", id);
      Object.keys(vars).forEach((k) => el.style.setProperty(k, vars[k]));
    });
  }
  function loadPalette() {
    let id = "";
    try { id = localStorage.getItem("choppy-palette") || ""; } catch (e) { id = ""; }
    if (!id || !PALETTES[id]) id = "classic";
    applyPalette(id);
  }
  let SHOW_GAIN = true;
  let SHOW_TRADE = true;
  let BATTLE_360 = true;
  function loadBattleMove(){
    try { BATTLE_360 = localStorage.getItem("choppy-battle-move") !== "ortho"; } catch (e) { BATTLE_360 = true; }
  }
  function setBattleMove(mode){
    BATTLE_360 = mode !== "ortho";
    try { localStorage.setItem("choppy-battle-move", BATTLE_360 ? "360" : "ortho"); } catch (e) {}
  }
  function axisSnap(vx,vy){
    if(BATTLE_360) return [vx,vy];
    const ax=Math.abs(vx), ay=Math.abs(vy);
    if(ax<1e-4&&ay<1e-4) return [0,0];
    if(ax>=ay) return [vx>=0?1:-1, 0];
    return [0, vy>=0?1:-1];
  }
  loadBattleMove();
  let PRICE_MODE = "dyn";
  let ARC_TEXT = "m";
  function applyArcTextAttr() {
    try { document.documentElement.setAttribute("data-arc-text", ARC_TEXT); } catch (e) {}
  }
  function loadTextPrefs() {
    try {
      const s = localStorage.getItem("choppy-arc-text");
      if (s === "s" || s === "m" || s === "l") ARC_TEXT = s;
      if (localStorage.getItem("choppy-show-gain") === "0") SHOW_GAIN = false;
      if (localStorage.getItem("choppy-show-trade") === "0") SHOW_TRADE = false;
      const pm = localStorage.getItem("choppy-price-mode");
      if (pm === "usd" || pm === "btc" || pm === "dyn") PRICE_MODE = pm;
    } catch (e) {}
    applyArcTextAttr();
  }
  function cycleArcText() {
    ARC_TEXT = ARC_TEXT === "s" ? "m" : ARC_TEXT === "m" ? "l" : "s";
    try { localStorage.setItem("choppy-arc-text", ARC_TEXT); } catch (e) {}
    applyArcTextAttr();
  }
  function setShowGain(on) {
    SHOW_GAIN = !!on;
    try { localStorage.setItem("choppy-show-gain", SHOW_GAIN ? "1" : "0"); } catch (e) {}
  }
  function setShowTrade(on) {
    SHOW_TRADE = !!on;
    try { localStorage.setItem("choppy-show-trade", SHOW_TRADE ? "1" : "0"); } catch (e) {}
  }
  function cyclePriceMode() {
    PRICE_MODE = PRICE_MODE === "dyn" ? "usd" : PRICE_MODE === "usd" ? "btc" : "dyn";
    try { localStorage.setItem("choppy-price-mode", PRICE_MODE); } catch (e) {}
  }
  function priceModeLabel() {
    if (PRICE_MODE === "usd") return t("priceUsd");
    if (PRICE_MODE === "btc") return t("priceBtc");
    return t("priceDyn");
  }
  function setHero(skin, anim) {
    HERO_SKIN = HERO_SKINS[skin] ? skin : "classic";
    HERO_ANIM = !!anim;
    try { localStorage.setItem("choppy-hero", HERO_SKIN + ":" + (HERO_ANIM ? "1" : "0")); } catch (e) {}
  }
  function loadHero() {
    try {
      const raw = localStorage.getItem("choppy-hero") || "";
      if (raw.indexOf(":") >= 0) {
        const p = raw.split(":");
        HERO_SKIN = HERO_SKINS[p[0]] ? p[0] : PALETTE_ID;
        HERO_ANIM = p[1] === "1";
        return;
      }
      if (localStorage.getItem("choppy-anim-hero") === "1") {
        HERO_SKIN = "classic";
        HERO_ANIM = true;
        return;
      }
    } catch (e) {}
    HERO_SKIN = PALETTE_ID;
    HERO_ANIM = false;
  }
  let ARC_TLDR = false;
  function setArcTldr(on) {
    ARC_TLDR = !!on;
    try { localStorage.setItem("choppy-arc-tldr", ARC_TLDR ? "1" : "0"); } catch (e) {}
  }
  function loadArcTldr() {
    try { ARC_TLDR = localStorage.getItem("choppy-arc-tldr") === "1"; } catch (e) { ARC_TLDR = false; }
  }
  function palRgba(hex, a) {
    let h = String(hex || "#000").replace("#", "");
    if (h.length === 3) h = h[0] + h[0] + h[1] + h[1] + h[2] + h[2];
    const n = parseInt(h.slice(0, 6), 16);
    if (!isFinite(n)) return "rgba(0,0,0," + a + ")";
    return "rgba(" + ((n >> 16) & 255) + "," + ((n >> 8) & 255) + "," + (n & 255) + "," + a + ")";
  }
  loadPalette();
  loadTextPrefs();
  loadHero();
  loadArcTldr();
  const PX_MIN = 1;
  const DRIFT0 = 0.0006;
  const PHI = (1 + Math.sqrt(5)) / 2;
  const DRIFT_GROW = 1 + (PHI - 1) * 0.5;
  function clampPx(v) {
    const n = Number(v);
    if (!isFinite(n) || n < PX_MIN) return PX_MIN;
    return n;
  }
  const KEY = "bitcoinizate-v1";
  try {
    if (localStorage.getItem("choppy-reset-420") !== "1") {
      localStorage.removeItem("choppy-awards");
      const raw = JSON.parse(localStorage.getItem(KEY) || "{}");
      if (raw.scores) { raw.scores.choppy = 0; raw.scores.choppy2 = 0; raw.scores.choppy3 = 0; }
      localStorage.setItem(KEY, JSON.stringify(raw));
      localStorage.setItem("choppy-reset-420", "1");
    }
  } catch (e) {}

  const $ = (id) => document.getElementById(id);
  // Spanish number display: 1,234.5 -> 1.234,5 (English keeps the point). Display-only; game strings stay en-US internally.
  const ES_NUM_RE = /(^|[^A-Za-wyz_])(\d[\d,]*\.\d+|\d{1,3}(?:,\d{3})+)/g;
  const esNum = (v) => String(v).replace(ES_NUM_RE, (m, pre, n) => pre + n.replace(/[.,]/g, (c) => c === "." ? "," : "."));
  const numL = (v) => (typeof v === "string" && /\d[.,]\d/.test(v) && window.BZ && BZ.lang && BZ.lang() === "es") ? esNum(v) : v;
  const setTxt = (id, v) => { const el = $(id); if (!el) return; const u = numL(v); el.textContent = u; if (el.firstChild && u !== v) ES_NUM_DONE.set(el.firstChild, String(u)); };
  // esNum is not idempotent ("1.234" could flip back), so remember what we wrote and never convert a node twice.
  const ES_NUM_DONE = new WeakMap();
  function localizeTextNode(n) {
    const t = n.nodeValue;
    if (!t || ES_NUM_DONE.get(n) === t || !/\d[.,]\d/.test(t)) return;
    const u = esNum(t);
    ES_NUM_DONE.set(n, u);
    if (u !== t) n.nodeValue = u;
  }
  function localizeNums(root) {
    if (!root || !(window.BZ && BZ.lang && BZ.lang() === "es")) return;
    if (root.nodeType === 3) { localizeTextNode(root); return; }
    const w = document.createTreeWalker(root, NodeFilter.SHOW_TEXT);
    for (let n = w.nextNode(); n; n = w.nextNode()) localizeTextNode(n);
  }
  const fmtUsd = (n) => {
    const x = Number(n) || 0;
    const a = Math.abs(x);
    const sign = x < 0 ? "-" : "";
    if (a >= 1e12) return sign + "$" + (a / 1e12).toFixed(2) + "T";
    if (a >= 1e9) return sign + "$" + (a / 1e9).toFixed(2) + "B";
    if (a >= 1e6) return sign + "$" + (a / 1e6).toFixed(2) + "M";
    if (a >= 10000) return sign + "$" + (a / 1000).toFixed(1) + "k";
    return (x < 0 ? "-$" : "$") + Math.round(a).toLocaleString("en-US");
  };
  const money = fmtUsd;
  const fmtBtcAmt = (n) => {
    const x = Number(n) || 0;
    const a = Math.abs(x);
    const sign = x < 0 ? "-" : "";
    if (a >= 1e12) return sign + (a / 1e12).toFixed(2) + "T";
    if (a >= 1e9) return sign + (a / 1e9).toFixed(2) + "B";
    if (a >= 1e6) return sign + (a / 1e6).toFixed(2) + "M";
    if (a >= 1000) return sign + (a / 1000).toFixed(2) + "k";
    if (a >= 100) return sign + a.toFixed(2);
    if (a >= 1) return sign + a.toFixed(4);
    return sign + a.toFixed(6);
  };
  const fmtBtc = (n) => fmtBtcAmt(n) + " BTC";
  const fmtVtAmt = (n) => fmtBtcAmt(n);
  const fmtVt = (n) => fmtVtAmt(n) + " VT";
  const fmtTime = (t) => {
    const s = Math.max(0, Math.floor(t));
    return Math.floor(s / 60) + ":" + String(s % 60).padStart(2, "0");
  };
  function pairUsd(usd) {
    const px = S.price > 0 ? S.price : 0;
    const btc = px > 0 ? Number(usd) / px : 0;
    return fmtUsd(usd) + " (" + fmtBtc(btc) + ")";
  }
  function badgeIco(kind) {
    const wrap = (inner, fill, ring) =>
      "<span class=\"help-ico\"><svg width=\"28\" height=\"28\" viewBox=\"-14 -14 28 28\">"
      + "<circle r=\"13\" fill=\"" + fill + "\" stroke=\"" + ring + "\" stroke-width=\"1.8\"/>"
      + inner + "</svg></span>";
    if (kind === "hero") return wrap("<text x=\"0\" y=\"1.2\" text-anchor=\"middle\" dominant-baseline=\"middle\" font-size=\"16\" font-weight=\"700\" fill=\"#120c02\" font-family=\"Georgia,serif\">₿</text>", "#F2A900", "#ffe7a0");
    if (kind === "cash") return wrap("<g>"
      + "<rect x=\"-8\" y=\"-5\" width=\"5.2\" height=\"10\" fill=\"#1f8a4c\"/>"
      + "<rect x=\"-8\" y=\"-7\" width=\"5.2\" height=\"2\" fill=\"#9dffc4\"/>"
      + "<rect x=\"-1.2\" y=\"-3\" width=\"4.2\" height=\"8\" fill=\"#a33a32\"/>"
      + "<rect x=\"-1.2\" y=\"-6\" width=\"4.2\" height=\"3\" fill=\"#ff9b92\"/>"
      + "<rect x=\"4.4\" y=\"-4\" width=\"4.6\" height=\"9\" fill=\"#1f8a4c\"/>"
      + "<rect x=\"4.4\" y=\"-6.5\" width=\"4.6\" height=\"2.5\" fill=\"#9dffc4\"/>"
      + "</g>", "#141416", "#3a3a40");
    if (kind === "bull") return wrap("<polygon points=\"0,-7 6.5,5.5 -6.5,5.5\" fill=\"#04150c\"/>", "#1f8a4c", "#9dffc4");
    if (kind === "bear") return wrap("<polygon points=\"0,7 6.5,-5.5 -6.5,-5.5\" fill=\"#1a0605\"/>", "#a33a32", "#ff9b92");
    if (kind === "halve") return wrap("<text x=\"0\" y=\"1\" text-anchor=\"middle\" dominant-baseline=\"middle\" font-size=\"13\" font-weight=\"700\" fill=\"#1a1204\" font-family=\"IBM Plex Mono,monospace\">½</text>", "#c8960a", "#ffe7a0");
    if (kind === "cold") return wrap("<g stroke=\"#041318\" stroke-width=\"1.5\" fill=\"none\"><path d=\"M0-7V7M-6.1-3.5 6.1 3.5M-6.1 3.5 6.1-3.5\"/><path d=\"M-2.2-5.4 0-3.6 2.2-5.4M-2.2 5.4 0 3.6 2.2 5.4\"/></g>", "#1788a6", "#9befff");
    if (kind === "laser") return wrap("<g stroke-linecap=\"butt\"><path d=\"M-11-2.4H11M-11 2.4H11\" stroke=\"#fff4e8\" stroke-width=\"3.2\"/><path d=\"M-11-2.4H11M-11 2.4H11\" stroke=\"#ff2a22\" stroke-width=\"1.8\"/></g>", "#120806", "#ffe7c2");
    if (kind === "swan") return wrap("<g fill=\"#0a0a0c\"><ellipse cx=\"1\" cy=\"3\" rx=\"5.2\" ry=\"3.4\" transform=\"rotate(-16)\"/><path d=\"M-1 1 Q-6-4 -1-7 Q2-7 3-5\" fill=\"none\" stroke=\"#0a0a0c\" stroke-width=\"1.8\"/><polygon points=\"2.4,-5.8 6.2,-5 2.4,-4.2\" fill=\"#c45c4a\"/></g>", "#f3efe6", "#1a1a1c");
    if (kind === "dca") return wrap("<g><path d=\"M-6 8 Q-7 3 -3 2 L-1 5 Q-4 7 -6 8Z\" fill=\"#c9a070\" stroke=\"#6a4a28\" stroke-width=\"0.8\"/><path d=\"M-3 2 L4 1 L5 4 L-1 5Z\" fill=\"#e8c49a\"/><polygon points=\"1,-6 6,-1 1,4 -4,-1\" fill=\"#c8960a\" stroke=\"#ffe7a0\" stroke-width=\"1\"/></g>", "#141416", "#3a3a40");
    if (kind === "rank") return wrap("<text x=\"0\" y=\"1.2\" text-anchor=\"middle\" dominant-baseline=\"middle\" font-size=\"11\" font-weight=\"700\" fill=\"#120c02\" font-family=\"IBM Plex Mono,monospace\">#1</text>", "#c8960a", "#ffe7a0");
    if (kind === "perk") return wrap("<polygon points=\"0,-8 2.2,-2.2 8,-2.2 3.4,1.6 5.2,7.5 0,4 -5.2,7.5 -3.4,1.6 -8,-2.2 -2.2,-2.2\" fill=\"#ffe7a0\"/>", "#141416", "#c8960a");
    if (kind === "gfx") return wrap("<g><circle cx=\"-4.2\" cy=\"1.2\" r=\"3.4\" fill=\"#0a0a0c\"/><circle cx=\"0.4\" cy=\"-3.2\" r=\"3.4\" fill=\"#c8960a\"/><circle cx=\"4\" cy=\"2.4\" r=\"3.4\" fill=\"#4f9d6e\"/></g>", "#141416", "#c8960a");
    if (kind === "heart") return wrap("<path d=\"M0 4.6 C-4.4 1.4 -6.4-1.5 -4.3-3.4 C-2.6-4.9 -0.6-3.6 0-2.1 C0.6-3.6 2.6-4.9 4.3-3.4 C6.4-1.5 4.4 1.4 0 4.6Z\" fill=\"#e23b3b\"/>", "#1a0c0c", "#ffb4ac");
    if (kind === "sand") return wrap("<rect x=\"-8\" y=\"-8\" width=\"16\" height=\"16\" fill=\"#e0c27a\"/><rect x=\"-6\" y=\"1\" width=\"10\" height=\"2\" fill=\"#c9a45e\"/>", "#6a4e22", "#e0c27a");
    if (kind === "grass") return wrap("<rect x=\"-8\" y=\"-8\" width=\"16\" height=\"16\" fill=\"#62b33a\"/><rect x=\"-2\" y=\"-2\" width=\"3\" height=\"3\" fill=\"#ffe56a\"/>", "#143018", "#8ed44e");
    if (kind === "dirt") return wrap("<rect x=\"-8\" y=\"-8\" width=\"16\" height=\"16\" fill=\"#e2c56a\"/><rect x=\"-8\" y=\"-1\" width=\"16\" height=\"3\" fill=\"#c49a42\"/>", "#5a3e14", "#e2c56a");
    if (kind === "brick") return wrap("<rect x=\"-8\" y=\"-8\" width=\"16\" height=\"16\" fill=\"#b07a3a\"/><path d=\"M-8 0H8M0-8V0M-4 0V8\" stroke=\"#6a4218\" stroke-width=\"1.2\"/>", "#3a2410", "#e0b07a");
    if (kind === "metal") return wrap("<rect x=\"-8\" y=\"-8\" width=\"16\" height=\"16\" fill=\"#6d6a66\"/><rect x=\"-4\" y=\"-5\" width=\"8\" height=\"6\" fill=\"#b0aca6\"/>", "#222224", "#d0ccc6");
    if (kind === "tree") return wrap("<rect x=\"-1.2\" y=\"1.5\" width=\"2.4\" height=\"6\" fill=\"#6b4423\"/><circle cy=\"-1.5\" r=\"5.5\" fill=\"#1c7a34\"/>", "#102818", "#8ed44e");
    if (kind === "water") return wrap("<rect x=\"-8\" y=\"-8\" width=\"16\" height=\"16\" fill=\"#1c7484\"/><path d=\"M-7-1H7M-7 4H7\" stroke=\"#b4f0ff\" stroke-width=\"1.4\"/>", "#0c3038", "#9befff");
    if (kind === "tank") return wrap("<g><rect x=\"-8\" y=\"-6\" width=\"3\" height=\"13\" fill=\"#1c1f16\"/><rect x=\"5\" y=\"-6\" width=\"3\" height=\"13\" fill=\"#1c1f16\"/><path d=\"M-5-5 H5 L6 2 L4 7 H-4 L-6 2Z\" fill=\"#3f5344\"/><rect x=\"-1\" y=\"-11\" width=\"2\" height=\"7\" fill=\"#1a1c14\"/></g>", "#1a2218", "#8a9078");
    if (kind === "fast") return wrap("<g><rect x=\"-7\" y=\"-5\" width=\"2.4\" height=\"11\" fill=\"#1c1f16\"/><rect x=\"4.6\" y=\"-5\" width=\"2.4\" height=\"11\" fill=\"#1c1f16\"/><path d=\"M0-8 L5-1 L4 6 H-4 L-5-1Z\" fill=\"#8a8f55\"/><rect x=\"-0.8\" y=\"-12\" width=\"1.6\" height=\"6\" fill=\"#1a1c14\"/></g>", "#1a2218", "#c5c48a");
    if (kind === "heavy") return wrap("<g><rect x=\"-9\" y=\"-6\" width=\"3.2\" height=\"13\" fill=\"#1c1f16\"/><rect x=\"5.8\" y=\"-6\" width=\"3.2\" height=\"13\" fill=\"#1c1f16\"/><rect x=\"-6\" y=\"-6\" width=\"12\" height=\"12\" fill=\"#2e352c\"/><circle r=\"3.2\" cy=\"-1\" fill=\"#3d4638\"/><rect x=\"-1.4\" y=\"-11\" width=\"2.8\" height=\"6\" fill=\"#1a1c14\"/></g>", "#121612", "#8a9080");
    if (kind === "elite") return wrap("<g><rect x=\"-8\" y=\"-6\" width=\"3\" height=\"13\" fill=\"#1c1f16\"/><rect x=\"5\" y=\"-6\" width=\"3\" height=\"13\" fill=\"#1c1f16\"/><path d=\"M-5-5 H5 L6 2 L4 7 H-4 L-6 2Z\" fill=\"#4d5340\"/><rect x=\"-1\" y=\"-11\" width=\"2\" height=\"7\" fill=\"#1a1c14\"/><path d=\"M-3 4 L0 1 L3 4\" fill=\"none\" stroke=\"#d7c27a\" stroke-width=\"1.3\"/></g>", "#1a2218", "#d7c27a");
    if (kind === "ship") return wrap("<path d=\"M0-8 L6-2 L5.2 6 H-5.2 L-6-2 Z\" fill=\"#3c4f42\"/><rect x=\"-2\" y=\"-2\" width=\"4\" height=\"5\" fill=\"#d9d4c6\"/>", "#102018", "#9aab96");
    if (kind === "heli") return wrap("<rect x=\"-7\" y=\"-2.5\" width=\"14\" height=\"6\" rx=\"1\" fill=\"#5c6b4a\"/><path d=\"M-9 0H9\" stroke=\"#d7d4c4\" stroke-width=\"1.7\"/>", "#1a2218", "#c5c8b0");
    if (kind === "heal") return wrap("<text x=\"0\" y=\"1.2\" text-anchor=\"middle\" dominant-baseline=\"middle\" font-size=\"16\" font-weight=\"700\" fill=\"#fff\" font-family=\"IBM Plex Mono,monospace\">+</text>", "#e23b3b", "#ffd0d0");
    if (kind === "shot") return wrap("<text x=\"0\" y=\"1.2\" text-anchor=\"middle\" dominant-baseline=\"middle\" font-size=\"13\" font-weight=\"700\" fill=\"#062028\" font-family=\"IBM Plex Mono,monospace\">S</text>", "#7fd0ff", "#e8f7ff");
    if (kind === "star") return wrap("<polygon points=\"0,-7.2 2.1,-2.2 7.2,-2.2 3.1,1.2 4.6,6.4 0,3.2 -4.6,6.4 -3.1,1.2 -7.2,-2.2 -2.1,-2.2\" fill=\"#ffe14a\"/>", "#2a2208", "#ffe7a0");
    if (kind === "freeze") return wrap("<path d=\"M0-7V7M-6-3.4 6 3.4M-6 3.4 6-3.4\" stroke=\"#e8f7ff\" stroke-width=\"1.6\" fill=\"none\"/>", "#1a4a66", "#9fd0ff");
    if (kind === "bomb") return wrap("<circle r=\"4.2\" fill=\"#2a1208\"/><path d=\"M0-8V-5M5.2-5.2 3.2-3.2M8 0H5M5.2 5.2 3.2 3.2M0 8V5M-5.2 5.2-3.2 3.2M-8 0H-5M-5.2-5.2-3.2-3.2\" stroke=\"#ffb088\" stroke-width=\"1.3\"/>", "#ff6a2a", "#ffe0c8");
    if (kind === "wall") return wrap("<rect x=\"-7\" y=\"-7\" width=\"14\" height=\"14\" fill=\"#6d6a66\"/><rect x=\"-3.5\" y=\"-4\" width=\"7\" height=\"5\" fill=\"#d0ccc6\"/>", "#222224", "#eeeae4");
    if (kind === "rock") return wrap("<polygon points=\"-7,6 -3,-1 1,3 4,-6 8,6\" fill=\"#6a6864\"/>", "#222220", "#c8c4bc");
    if (kind === "lh") return wrap("<g><rect x=\"-2\" y=\"-2\" width=\"4\" height=\"9\" fill=\"#f4f1ea\"/><rect x=\"-3.2\" y=\"-6\" width=\"6.4\" height=\"4\" fill=\"#b42318\"/><rect x=\"-1\" y=\"-5\" width=\"2\" height=\"2\" fill=\"#ffe56a\"/></g>", "#6a4e22", "#f4f1ea");
    if (kind === "aa" || kind === "lrm") return wrap("<g><path d=\"M0-8 L2.2-1.5 L2 5 H-2 L-2.2-1.5Z\" fill=\"#e8e2d4\"/><path d=\"M-4 3 L0 1 L4 3 L0 6Z\" fill=\"#c45c4a\"/></g>", "#1a0808", "#ff9b92");
    return wrap("", "#141416", "#3a3a40");
  }
  const HEROES = [
    { id: "btc", fill: "#F2A900", ink: "#120c02", ring: "#ffe7a0", mark: "btc" },
    { id: "usdt", fill: "#26A17B", ink: "#ffffff", ring: "#9dffc4", mark: "usdt" },
    { id: "eth", fill: "#627EEA", ink: "#ffffff", ring: "#c5d4ff", mark: "eth" },
    { id: "bch", fill: "#0AC18E", ink: "#04120c", ring: "#9dffc4", mark: "bch" },
    { id: "xrp", fill: "#23292F", ink: "#E5E5E5", ring: "#8a9098", mark: "xrp" },
    { id: "bnb", fill: "#F3BA2F", ink: "#120c02", ring: "#ffe7a0", mark: "bnb" },
    { id: "sol", fill: "#9945FF", ink: "#ffffff", ring: "#d4b3ff", mark: "sol" },
    { id: "trx", fill: "#FF0013", ink: "#ffffff", ring: "#ff9b92", mark: "trx" }
  ];
  function heroOf(slot) { return HEROES[(slot | 0) % HEROES.length] || HEROES[0]; }
  function myHero() {
    const slot = (window.ChoppyMP && window.ChoppyMP.slot) ? window.ChoppyMP.slot() : (S.mpSlot || 0);
    return heroOf(S.mp ? slot : 0);
  }
  function drawHeroMark(ctx, hero, r) {
    ctx.save();
    const ink = hero.ink;
    ctx.fillStyle = ink;
    ctx.strokeStyle = ink;
    ctx.lineWidth = Math.max(1.4, r * 0.16);
    ctx.lineJoin = "round";
    ctx.lineCap = "round";
    const m = hero.mark;
    if (m === "btc") {
      ctx.font = "700 " + Math.round(r * 1.15) + "px Georgia, serif";
      ctx.textAlign = "center"; ctx.textBaseline = "middle";
      ctx.fillText("₿", 0, 1);
    } else if (m === "usdt") {
      ctx.font = "700 " + Math.round(r * 1.05) + "px Georgia, serif";
      ctx.textAlign = "center"; ctx.textBaseline = "middle";
      ctx.fillText("₮", 0, 1);
    } else if (m === "eth") {
      ctx.beginPath();
      ctx.moveTo(0, -r * 0.55);
      ctx.lineTo(r * 0.38, r * 0.02);
      ctx.lineTo(0, r * 0.18);
      ctx.lineTo(-r * 0.38, r * 0.02);
      ctx.closePath(); ctx.fill();
      ctx.beginPath();
      ctx.moveTo(0, r * 0.22);
      ctx.lineTo(r * 0.38, r * 0.06);
      ctx.lineTo(0, r * 0.58);
      ctx.lineTo(-r * 0.38, r * 0.06);
      ctx.closePath(); ctx.globalAlpha *= 0.85; ctx.fill(); ctx.globalAlpha = 1;
    } else if (m === "bch") {
      ctx.font = "700 " + Math.round(r * 0.95) + "px Georgia, serif";
      ctx.textAlign = "center"; ctx.textBaseline = "middle";
      ctx.fillText("₿", 0, 1);
      ctx.lineWidth = Math.max(1.2, r * 0.12);
      ctx.beginPath(); ctx.moveTo(r * 0.18, -r * 0.42); ctx.lineTo(r * 0.48, -r * 0.18); ctx.stroke();
    } else if (m === "xrp") {
      ctx.beginPath();
      ctx.moveTo(-r * 0.38, -r * 0.34); ctx.lineTo(-r * 0.08, 0); ctx.lineTo(-r * 0.38, r * 0.34);
      ctx.moveTo(r * 0.38, -r * 0.34); ctx.lineTo(r * 0.08, 0); ctx.lineTo(r * 0.38, r * 0.34);
      ctx.stroke();
    } else if (m === "bnb") {
      ctx.save(); ctx.rotate(Math.PI / 4);
      const s = r * 0.42;
      ctx.fillRect(-s, -s, s * 2, s * 2);
      ctx.restore();
    } else if (m === "sol") {
      ctx.lineWidth = Math.max(2.2, r * 0.2);
      ctx.beginPath(); ctx.moveTo(-r * 0.4, -r * 0.28); ctx.lineTo(r * 0.4, -r * 0.12); ctx.stroke();
      ctx.beginPath(); ctx.moveTo(-r * 0.4, 0.02); ctx.lineTo(r * 0.4, 0.02); ctx.stroke();
      ctx.beginPath(); ctx.moveTo(-r * 0.4, r * 0.16); ctx.lineTo(r * 0.4, r * 0.32); ctx.stroke();
    } else {
      ctx.font = "700 " + Math.round(r * 1.05) + "px Georgia, serif";
      ctx.textAlign = "center"; ctx.textBaseline = "middle";
      ctx.fillText("T", 0, 1);
    }
    ctx.restore();
  }

  const T_UI = {
    aiOn: "A.I. BUD ON", aiOff: "A.I. BUD OFF",
    dcaOn: "DCA ON", dcaOff: "DCA OFF",
    trendUp: "TREND ↑", trendDown: "TREND ↓", trendOff: "TREND OFF",
    buyBtc: "BUY BTC", sellBtc: "SELL BTC",
    keepPlaying: "KEEP PLAYING", playAgain: "PLAY AGAIN",
    options: "OPTIONS", paused: "PAUSED", resume: "RESUME", back: "BACK",
    gameplay: "GAMEPLAY", battleMove: "BATTLE MOVE",
    priceShow: "PRICES", priceDyn: "DYNAMIC", priceUsd: "USD", priceBtc: "BTC",
    sound: "SOUND", jukebox: "JUKEBOX", tutorial: "TUTORIAL", feedback: "FEEDBACK",
    language: "LANGUAGE", aiLog: "A.I. BUD LOG", signIn: "SIGN IN",
    ranked: "RANKED", training: "TRAINING", versus: "VERSUS",
    comingSoon: "COMING SOON",
    mpAlpha: "ALPHA",
    mpAlphaNote: "Alpha. Testers welcome. Send feedback to",
    donateTitle: "Donations",
    donateBody: "Donations keep the game going. 70% of every donation is distributed as leaderboard prizes.",
    boardBtc: "Most BTC",
    boardInd: "Fastest independence",
    mpHost: "HOST ROOM", mpJoin: "JOIN", mpStart: "START MATCH", mpBack: "BACK",
    mpWait: "WAITING FOR PLAYERS", mpNeed: "Need 2+ players", mpCode: "ROOM",
    mpYouWin: "LAST ONE STANDING", mpWins: "WINS", mpDead: "ELIMINATED",
    mpNote: "Same candles. Last to die wins. Does not count for the board.",
    mpAlive: "ALIVE", mpCopy: "COPY CODE", mpCopied: "COPIED",
    mpReady: "I'M READY", mpUnready: "NOT READY", mpNeedReady: "Players must be ready",
    mpFull: "Room is full (8)", mpRules: "MATCH OPTIONS",
    mpCold0: "Starting cold", mpMsig0: "Starting multisig",
    mpMix: "Power-up mix (100)", mpBull: "Bull", mpBear: "Bear", mpLaserW: "Laser", mpSwanW: "Swan",
    mpColdW: "Cold", mpYou: "you",
    mpMixNeed: "Must total 100",
    mpMode: "Mode", mpLast: "Last man standing", mpWhale: "Whale", mpRace: "Race",
    mpRaceN: "Finish candle", mpBestOf: "Best of",
    mpSpec: "Spectating", mpRematch: "REMATCH", mpQuit: "QUIT",
    mpNext: "Next game", mpSeries: "Series", mpFinished: "FINISHED",
    mpNote: "Same candles. Last standing, whale, or race. Does not count for the board.",
    eloBoard: "VERSUS ELO", eloGuest: "Sign in to record ELO", eloUpdated: "ELO updated", eloPending: "ELO not saved",
    soundOn: "ON", soundOff: "OFF",
    bullSongs: "BULL/BEAR SONGS", gameFx: "GAME FX", voices: "VOICES",
    chanceHead: "ARC", chanceAck: "GOT IT", chanceTldr: "TLDR", chanceOutcome: "OUTCOME",
    arcCards: "ARC CARDS", arcTldrOn: "TLDR", arcFullOn: "FULL TEXT",
    testing: "Testing",
    testPerk: "Perk",
    testGrant: "Grant",
    testArc: "Candles per arc",
    testArcSet: "Set",
    testArcHint: "0 = default. Default is one random card inside every 21 candles.",
    testArcNext: "Next arc in {n} candles · passed {now}",
    testMoney: "Add money",
    testAdd: "Add",
    testQueued: "Applies when the run starts. Sticks for this session.",
    testBoard: "This run will not count for the board.",
    testMaxed: "Maxed",
    testNow: "Now",
    testRevealed: "Revealed",
    testPool: "Still in the pool",
    testCopy: "Copy",
    testCopied: "Copied",
    testNoneRevealed: "(none yet)",
    testNonePool: "(pool is empty)",
    testPreInd: "Independence",
    testPreIndHint: "The country is already independent. Starts the battle now. Easy is a full army, moderate is half, hard is none. Does not count for the board.",
    testBattle: "BATTLE",
    testEasy: "EASY",
    testMod: "MODERATE",
    testHard: "HARD",
    retryBattle: "Restart battle",
    retryBattleNote: "The beach fell. Build another map and hold it again.",
    testArmy: "YOUR ARMY",
    testWorld: "ENEMY",
    howPlay: "HOW TO PLAY", market: "MARKETPLACE",
    runStats: "STATS", runChart: "CHART", runRecap: "RUN TAPE",
    graphics: "GRAPHICS",
    palClassic: "Classic", palMidnight: "Midnight", palTerminal: "Terminal",
    palPaper: "Paper", palNeon: "Neon", palSunset: "Sunset", palFlower: "Flower Power", palSimple: "Simple",
    animHero: "3D",
    hero2d: "2D",
    tapHero: "Tap the hero to switch 2D / 3D",
    candleText: "CANDLE INCOME",
    tradeText: "BUY / SELL",
    priceShow: "PRICES",
    priceDyn: "DYNAMIC",
    priceUsd: "USD",
    priceBtc: "BTC",
    tut1: "You are the ₿. Tap or press space to flap through the candle gaps. A wick liquidates you. The floor only counts when you fully leave the screen.",
    tut2: "Candles pay cash. Buy BTC on the dip, sell on the rip. Score is play-money net worth in BTC at the live in-game price.",
    tut3a: "Bull pumps price.",
    tut3b: "Bear dumps it.",
    tut4a: "Black swan is a black crash that dumps hard and stretches the bear.",
    tut4b: "Halving is a fat bull. It rides between candles, at the top or just above Buy/Sell.",
    halveTipUp: "Halving. Look up!",
    halveTipDown: "Halving. Look down!",
    aidTitle: "San Arnaldo",
    aidNote: "The beach fell. San Arnaldo offers military help for {n}. ({i}/3)",
    aidPay: "Accept help",
    aidShort: "Not enough BTC and cash. Together they cover {have}.",
    aidDecline: "Refuse",
    tut5: "Cold storage saves a hit. Ten colds become one multisig life.",
    tut6: "Laser eyes eat a bear and unlock a perk.",
    tut7: "Ranked is 0 cold and 0 multisig and counts for the board. Training is 9 cold and 999 multisig and does not. Versus does not count for ranked scores or awards.",
    tut8: "Pick a perk and the menu vanishes like an Arc card — then tap ▶. DCA, A.I. bud, Jukebox, Marketplace and Arc sit on the HUD. Speed is the 1x button between Buy and Sell.",
    tut9: "Options → Graphics: pick a look, then tap the hero in the preview to switch 2D / 3D.",
    tutBattle: "Battle tutorial",
    tutHold: "Hold the beach",
    tutB1: "On land you drive the tank. Sea battles put you in a ship — those maps keep water on at least two edges. The stick moves you. The right side of the screen fires.",
    tutB2: "You start with 3 hearts. Each hit empties one. Empty hearts means you lose. The citadel shield is separate — if it breaks, the island falls. You carry 12 shots: empty them and you reload for 1.7 seconds. Stop firing and they refill on their own, and every kill gives a few back.",
    tutB3: "Sand is beach. Grass and dirt are open. Brick breaks. Metal, rock and the lighthouse do not. Trees block too. The coast is jagged, except beside docks and roads. Tanks stay on land. Ships stay on water.",
    tutB4: "One pickup at a time. After the field is empty, the next waits a random 5–15 seconds, then lasts 12.5 seconds. + restores a heart, or adds a fourth at 3/3. S stays: faster shot, then two bullets, then it breaks metal and one-shots heavies and trees. The star is 7.5s of invulnerability. F freezes enemies for 7.5s. X blows up every enemy. W wraps the citadel in metal for 7.5s, then that metal becomes ordinary brick.",
    tutB5: "Fury, the long-range missile, sits above the stick. Hold it until the ring fills, move the red circle with the stick, then tap again to fire. After each strike it needs a few seconds to recharge. It reaches helicopters, and troops on the wrong ground: a tank in a sea battle, a ship in a land battle.",
    tutB6: "Light, medium and heavy hulls. Some units come for you. Some go for the citadel. Up to 15% of them use the other element. KIA is destroyed over sent. A higher World number sends more troops, and each battle fields more than the one before."
  };
  function t(k) {
    if (window.BZ && typeof BZ.t === "function") {
      const v = BZ.t(k);
      if (v != null && v !== k) return v;
    }
    return T_UI[k] || k;
  }

  function donateBlock() {
    const ln = "lnbc1p4tdeq9pp5v39yyvsws5swurns2gpmj64m469548f64t2cqjsfyka574fj0dasdqqcqzzgxqyz5vqrzjqf0wu22xsefd8gzu0m9n93g2khea86l6yy26en9v46g9e6hk7v9z8lytgux50yx2zuqqqqryqqqqthqqpyrzjqfwdd2w9y5ra5z3m4qetfa5ccu6432xfuvk6zrvg9vxwltvukd48dlytgux50yx2zuqqqqryqqqqthqqpysp5zc5j4qd90hqxklpcy4skg9rfl5aypv9rsmrypjdt62td8869kx0s9qrsgq43tqd4ujehpvccxw5rzkk8z74mk7sdhgga3tqtk3uwvtlj3tl3s3yhrv5vy5x8t6x2zfursvw7z82rqu4fmuttaj57ukyspx35np6zgq6tutga";
    const btc = "bc1q5yrmsvdh3m7ad03txs2h5ktw5zzdxwxrgeujsj0e25s83cffzauq4vgjez";
    return "<section class=\"donate-note\">"
      + "<h3 class=\"k\">" + t("donateTitle") + "</h3>"
      + "<p>" + t("donateBody") + "</p>"
      + "<p class=\"donate-links\"><a href=\"lightning:" + ln + "\">Lightning</a> · <a href=\"bitcoin:" + btc + "\">Bitcoin</a></p>"
      + "</section>";
  }
  function battleIcos(kinds){
    return "<span class=\"help-icos\">" + kinds.map(badgeIco).join("") + "</span>";
  }
  function battleTutInner(){
    const line = (icos, key) => "<p>" + icos + "<span>" + t(key) + "</span></p>";
    return line(badgeIco("tank") + badgeIco("ship"), "tutB1")
      + line(badgeIco("heart"), "tutB2")
      + line(battleIcos(["sand", "grass", "dirt", "brick", "metal", "tree", "rock", "lh", "water"]), "tutB3")
      + line(battleIcos(["heal", "shot", "star", "freeze", "bomb", "wall"]), "tutB4")
      + line(battleIcos(["tank", "fast", "heavy", "elite", "ship"]), "tutB6")
      + line(badgeIco("heli") + badgeIco("aa"), "tutB5");
  }
  function battleTutHtml(){ return "<div class=\"help battle-help\">" + battleTutInner() + "</div>"; }
  function battleTutParas() {
    return [t("tutB1"), t("tutB2"), t("tutB3"), t("tutB4"), t("tutB5"), t("tutB6")];
  }
  function battleTutPlain() { return battleTutParas().join("\n\n"); }
  function markBattleTut() {
    S.bcBattleTut = true;
    try { localStorage.setItem("choppy-battle-tut", "1"); } catch (e) {}
  }
  function battleTutSeen() {
    if (S.bcBattleTut) return true;
    try { if (localStorage.getItem("choppy-battle-tut") === "1") { S.bcBattleTut = true; return true; } } catch (e) {}
    return false;
  }
  function tutorialBody() {
    return "<div class=\"help\">"
      + "<p>" + badgeIco("hero") + " " + t("tut1") + "</p>"
      + "<p>" + badgeIco("cash") + " " + t("tut2") + "</p>"
      + "<p>" + badgeIco("bull") + " " + t("tut3a") + " " + badgeIco("bear") + " " + t("tut3b") + "</p>"
      + "<p>" + badgeIco("swan") + " " + t("tut4a") + " " + badgeIco("halve") + " " + t("tut4b") + "</p>"
      + "<p>" + badgeIco("cold") + " " + t("tut5") + "</p>"
      + "<p>" + badgeIco("laser") + " " + t("tut6") + "</p>"
      + (battleTutSeen()
        ? "<p class=\"k\">" + t("tutBattle") + "</p>" + battleTutInner()
        : "")
      + "</div>";
  }
  const ROMAN = ["", "I", "II", "III", "IV", "V", "VI", "VII", "VIII", "IX", "X", "XI", "XII"];
  const PERK_NAME = { dca: "DCA", ff: "FastForward", adopt: "Adoption", manip: "Manipulation", candy: "Candle candy", juke: "Jukebox", aibud: "A.I. bud", job: "Employment", market: "Marketplace", chance: "Arc", opsec: "Opsec" };
  const PERK_NAME_ES = { dca: "DCA", ff: "FastForward", adopt: "Adopción", manip: "Manipulación", candy: "Caramelo de vela", juke: "Jukebox", aibud: "A.I. bud", job: "Empleo", market: "Mercado", chance: "Arco", opsec: "Opsec" };
  const PERK_MAX = { dca: 1, ff: 3, adopt: 7, manip: 7, candy: 7, juke: 7, aibud: 6, job: 7, market: 1, chance: 7, opsec: 5 };
  const OPSEC_GIFT = [
    { cold: 1, msig: 0 },
    { cold: 2, msig: 0 },
    { cold: 3, msig: 0 },
    { cold: 0, msig: 1 },
    { cold: 0, msig: 2 }
  ];
  const JOBS = [
    { name: "Acting career", nameEs: "Carrera de actuación", curve: "hit",
      pay: [240, 260, 310, 420, 780, 2100, 5600],
      titles: ["Background extra", "Community-theater lead", "Soap regular", "Festival film lead", "Prestige-TV regular", "Blockbuster support", "A-list lead"],
      titlesEs: ["Extra de fondo", "Protagonista de teatro barrial", "Fijo en una telenovela", "Protagonista de festival", "Fijo en serie de prestigio", "Soporte de blockbuster", "Estrella A-list"] },
    { name: "Diving career", nameEs: "Carrera de buceo", curve: "steady",
      pay: [360, 480, 620, 780, 980, 1220, 1520],
      titles: ["Pool attendant", "Open-water intern", "Harbor salvage hand", "Commercial welder-diver", "Saturation diver", "Deep-wreck chief", "Expedition dive master"],
      titlesEs: ["Playero de pileta", "Pasante de aguas abiertas", "Salvamento de puerto", "Soldador submarino", "Buzo de saturación", "Jefe de pecios profundos", "Maestro de expedición"] },
    { name: "Science career", nameEs: "Carrera científica", curve: "steady",
      pay: [400, 520, 660, 840, 1060, 1320, 1640],
      titles: ["Lab dishwasher", "Grad-school grunt", "Postdoc", "Staff researcher", "Principal investigator", "National-lab fellow", "Prize shortlist"],
      titlesEs: ["Lava tubos", "Becario agotado", "Postdoc", "Investigador de planta", "Investigador principal", "Fellow de laboratorio nacional", "Lista al premio"] },
    { name: "Law career", nameEs: "Carrera de derecho", curve: "steady",
      pay: [440, 580, 740, 940, 1180, 1460, 1800],
      titles: ["Mailroom clerk", "Paralegal", "Public-defender grind", "Junior associate", "Trial counsel", "Name-on-the-door partner", "Chief counsel"],
      titlesEs: ["Mailroom", "Paralegal", "Defensoría pública", "Asociado junior", "Litigante", "Socio con el nombre en la puerta", "Consejero jefe"] },
    { name: "Culinary career", nameEs: "Carrera culinaria", curve: "steady",
      pay: [320, 440, 580, 740, 940, 1180, 1480],
      titles: ["Dish pit", "Line cook", "Sous-chef", "Head chef", "Michelin kitchen", "Private-yacht chef", "World's-best kitchen"],
      titlesEs: ["Fregadero", "Cocinero de línea", "Sous-chef", "Chef ejecutivo", "Cocina Michelin", "Chef de yate", "Cocina top mundial"] },
    { name: "Aviation career", nameEs: "Carrera de aviación", curve: "hit",
      pay: [240, 290, 380, 560, 980, 1900, 4200],
      titles: ["Banner-tow grunt", "Bush hopper", "Regional first officer", "Major-airline first officer", "Captain", "Long-haul captain", "Test pilot"],
      titlesEs: ["Arrastra carteles", "Piloto de monte", "Primer oficial regional", "Primer oficial de major", "Capitán", "Capitán de largo haul", "Piloto de pruebas"] },
    { name: "Music career", nameEs: "Carrera musical", curve: "hit",
      pay: [240, 270, 330, 460, 820, 1750, 4800],
      titles: ["Subway busker", "Wedding-band hire", "Studio session", "Touring sideman", "Festival headliner", "Symphony soloist", "World-tour closer"],
      titlesEs: ["Callejero del subte", "Banda de casamientos", "Sesionista", "Músico de gira", "Headliner de festival", "Solista de sinfónica", "Cierre de gira mundial"] },
    { name: "Athletic career", nameEs: "Carrera atlética", curve: "hit",
      pay: [240, 255, 300, 410, 760, 2200, 6200],
      titles: ["Rec-league bench", "Semi-pro", "Minors call-up", "Starting roster", "All-star", "Champion", "Hall of fame"],
      titlesEs: ["Banca del rec", "Semi-pro", "Ascenso a menores", "Titular", "All-star", "Campeón", "Salón de la fama"] },
    { name: "Medical career", nameEs: "Carrera médica", curve: "steady",
      pay: [480, 620, 780, 980, 1220, 1500, 2450],
      titles: ["Orderly", "Nursing assistant", "Resident", "Attending", "Surgeon", "Department chief", "IMI Bariloche hospital director"],
      titlesEs: ["Camillero", "Ayudante de enfermería", "Residente", "Médico de planta", "Cirujano", "Jefe de servicio", "Director del hospital IMI Bariloche"] },
    { name: "Maritime career", nameEs: "Carrera marítima", curve: "steady",
      pay: [340, 460, 600, 770, 970, 1220, 1520],
      titles: ["Deck swab", "Able seaman", "Bosun", "First mate", "Ship captain", "Fleet commander", "Harbor master"],
      titlesEs: ["Limpia cubierta", "Marinero", "Contramaestre", "Primer oficial", "Capitán", "Comandante de flota", "Capitán de puerto"] }
  ];
  const FF_SPEEDS = [1.5, 2, 3];
  function perkTitle(id, tier) {
    if (id === "skip") return (window.BZ && BZ.t("declinePerk")) || "Gently decline";
    if (id === "job") {
      const job = currentJob();
      const pack = (window.BZ && BZ.lang && BZ.lang() === "es") ? PERK_NAME_ES : PERK_NAME;
      const base = job ? ((window.BZ && BZ.lang && BZ.lang() === "es") ? job.nameEs : job.name) : (pack.job || "Employment");
      return tier <= 1 ? base : base + " " + ROMAN[Math.min(ROMAN.length - 1, tier)];
    }
    const pack = (window.BZ && BZ.lang && BZ.lang() === "es") ? PERK_NAME_ES : PERK_NAME;
    const n = pack[id] || id;
    return tier <= 1 || id === "dca" ? n : n + " " + ROMAN[Math.min(ROMAN.length - 1, tier)];
  }
  function perkBlurb(id, tier) {
    try {
      tier = Math.max(1, Math.min(PERK_MAX[id] || 12, tier));
      const es = window.BZ && BZ.lang && BZ.lang() === "es";
      if (id === "skip") return es ? "seguir sin perk" : "keep flying, no perk";
      if (id === "candy") return candyLabel(tier) + (es ? " ingreso de velas" : " candle income");
      if (id === "dca") return es ? "ingreso en btc" : "income in btc";
      if (id === "ff") return es
        ? "añade " + (FF_SPEEDS[tier - 1] || 1.5) + "x a la rotación"
        : "adds " + (FF_SPEEDS[tier - 1] || 1.5) + "x to the speed rotation";
      if (id === "adopt") {
        const bear = adoptBearLabel(tier);
        const bull = adoptBullLabel(tier);
        return es ? "bulls +" + bull + " y bears " + bear : "bulls +" + bull + ", bears " + bear;
      }
      if (id === "manip") return (es ? "tendencia ×" : "trend ×") + tier;
      if (id === "juke") {
        const n = jukeUnlockCount(tier);
        const add = Math.max(1, n - jukeUnlockCount(tier - 1));
        if (tier <= 1) return es ? "jukebox · " + n + " temas" : "jukebox · " + n + " random tunes";
        return es ? "+" + add + " temas al azar" : "+" + add + " random tunes";
      }
      if (id === "job") {
        const job = currentJob();
        const title = jobTitleAt(job, tier);
        const pay = jobPayAt(job, tier);
        return title + " · $" + pay + (es ? " / 21 velas" : " / 21 candles");
      }
      if (id === "market") return es ? "abre el mercado en el HUD" : "opens the market in the HUD";
      if (id === "chance") {
        if (tier <= 1) return es ? "1 carta Arc cada 21 velas" : "1 Arc card every 21 candles";
        if (tier === 2) return es ? "2 cartas Arc cada 21 velas" : "2 Arc cards every 21 candles";
        return es ? "2 cartas Arc + chance de 3ra" : "2 Arc cards + odds of a 3rd";
      }
      if (id === "opsec") {
        const g = OPSEC_GIFT[tier - 1] || OPSEC_GIFT[0];
        if (g.msig) return "+" + g.msig + " multisig";
        return "+" + g.cold + " cold storage";
      }
      if (id === "aibud") {
        if (tier <= 1) return es ? "Mira arriba/abajo + pistas de perk" : "Look up/down + perk hints";
        if (tier === 2) return es ? "elige perks solo" : "auto-picks perks";
        if (tier === 3) return es ? "DCA y tendencia solos" : "auto DCA and trend";
        if (tier === 4) return es ? "trade cada 10 velas" : "trade every 10 candles";
        if (tier === 5) return es ? "trade cada 5 velas" : "trade every 5 candles";
        return es ? "trade cada 2 velas" : "trade every 2 candles";
      }
      return "";
    } catch (e) {
      return "";
    }
  }

  function packRunStats() {
    const st = Object.assign({}, S.stats || collectRunStats());
    const tape = S.runTape && S.runTape.length ? S.runTape : (S.tape || []);
    const maxN = 240;
    const n = tape.length;
    let packed = tape;
    let scale = 1;
    if (n > maxN) {
      packed = [];
      scale = (maxN - 1) / Math.max(1, n - 1);
      for (let i = 0; i < maxN; i++) packed.push(tape[Math.min(n - 1, Math.round(i / scale))]);
    }
    const remap = (arr) => (arr || []).map((m) => ({
      kind: m.kind, price: m.price, i: n > maxN ? Math.round((m.i || 0) * scale) : (m.i || 0)
    }));
    const packArr = (arr) => {
      const src = arr || [];
      if (n <= maxN) return src.slice();
      const out = [];
      for (let i = 0; i < maxN; i++) out.push(src[Math.min(src.length - 1, Math.round(i / scale))] || 0);
      return out;
    };
    st.tape = packed;
    st.marks = remap(S.runMarks);
    st.trades = remap(S.runTrades);
    st.tapeCash = packArr(S.runCash && S.runCash.length ? S.runCash : S.tapeCash);
    st.tapeBtc = packArr(S.runBtcBag && S.runBtcBag.length ? S.runBtcBag : S.tapeBtcBag);
    st.tapeNet = packArr(S.runNet && S.runNet.length ? S.runNet : S.tapeNet);
    return st;
  }
  function loadBest() {
    try {
      const s = JSON.parse(localStorage.getItem(KEY) || "{}");
      return (s.scores && s.scores.choppy3) || 0;
    } catch (e) { return 0; }
  }
  function saveBest(n) {
    if (!S.ranked || S.testCheat) return S.best || 0;
    if (!S.ranked) return S.best || 0;
    let s = { scores: { choppy: 0 } };
    try { s = Object.assign({ scores: { choppy: 0 } }, JSON.parse(localStorage.getItem(KEY) || "{}")); } catch (e) {}
    s.scores = s.scores || {};
    const stats = packRunStats();
    const old = s.scores.choppy3 || 0;
    const oldT = s.choppyTime != null ? s.choppyTime : 1e18;
    const better = n > old || (n === old && (stats.time || 0) < oldT);
    if (better) {
      s.scores.choppy3 = n;
      s.choppyTime = stats.time || 0;
      s.choppyStats = stats;
    }
    try { localStorage.setItem(KEY, JSON.stringify(s)); } catch (e) {}
    if (typeof window.submitNewHighScore === "function") {
      window.submitNewHighScore(n, { lifeT: S.lifeT, candles: S.candles, human: !!S.humanInput, stats: stats });
    }
    return s.scores.choppy3;
  }
  function noteIndependence() {
    if (S.indepNoted || S.mp || !S.ranked || S.testCheat || S.humanInput === false) return;
    const life = Number(S.lifeT) || 0;
    const candles = S.candles || 0;
    if (life < 12 || candles < 3) return;
    S.indepNoted = true;
    S.indepAt = life;
    if (typeof window.submitIndependence === "function") window.submitIndependence(life, candles);
  }

  function mulberry32(seed) {
    let a = (seed >>> 0) || 1;
    return function () {
      a |= 0;
      a = a + 0x6D2B79F5 | 0;
      let t = Math.imul(a ^ a >>> 15, 1 | a);
      t = t + Math.imul(t ^ t >>> 7, 61 | t) ^ t;
      return ((t ^ t >>> 14) >>> 0) / 4294967296;
    };
  }
  function wrng() { return S.worldRand ? S.worldRand() : Math.random(); }

  function gauss(mean, lo, hi) {
    let u = 0, v = 0;
    while (!u) u = wrng();
    while (!v) v = wrng();
    const z = Math.sqrt(-2 * Math.log(u)) * Math.cos(2 * Math.PI * v);
    return Math.max(lo, Math.min(hi, mean + z * ((hi - lo) / 5)));
  }

  function adoptSoft(tier) {
    return Math.min(1, Math.max(0, Number(tier) || 0) / 7);
  }
  function adoptBearRange(tier) {
    const soft = adoptSoft(tier);
    const lo = -0.09 * (1 - soft * 0.75);
    let hi = -0.045 * (1 - soft * 0.80);
    if (hi >= -0.007) hi = -0.007;
    if (lo >= hi) return { lo: hi - 0.011, hi };
    return { lo, hi };
  }
  function adoptBullRange(tier) {
    const soft = adoptSoft(tier);
    return { lo: 0.05 * (1 - soft * 0.80), hi: 0.10 * (1 - soft * 0.75) };
  }
  function adoptSwanRange(tier) {
    const soft = adoptSoft(tier);
    return { lo: -0.375 * (1 - soft * 0.50), hi: -0.1875 * (1 - soft * 0.50) };
  }
  function adoptBearLabel(tier) {
    const r = adoptBearRange(tier);
    return Math.round(r.lo * 100) + "/" + Math.round(r.hi * 100) + "%";
  }
  function adoptBullLabel(tier) {
    const r = adoptBullRange(tier);
    return Math.round(r.lo * 100) + "/" + Math.round(r.hi * 100) + "%";
  }
  function crashGuard() {
    const px = clampPx(S.price);
    if (px < 2500) return 4;
    if (px < 5000) return 3;
    if (px < 7500) return 2;
    if (px < 10000) return 1;
    return 0;
  }
  function crashScale(kind, dir) {
    const g = crashGuard();
    let k = 1;
    if (g > 0) {
      const down = dir < 0 || kind === "BEAR" || kind === "SWAN";
      if (down) k = Math.max(0.16, 1 - 0.21 * g);
    }
    if (kind === "SWAN") k *= 0.95;
    return k;
  }

  function pickCycleAmp(kind) {
    const t = S.have.adopt || 0;
    const soft = adoptSoft(t);
    let amp;
    if (kind === "HALVE") amp = 1 + (Math.random() * 0.2 - 0.1);
    else if (kind === "SWAN") amp = (0.75 + (Math.random() * 0.2 - 0.1)) * (1 - soft * 0.4) * 0.75;
    else if (kind === "BEAR") amp = (0.17 + Math.random() * 0.05) * (1 - soft * 0.45) * 0.9;
    else if (clampPx(S.price) < 10000) {
      const add = 2500 + Math.random() * 7500;
      amp = add / Math.max(PX_MIN, clampPx(S.price));
    }
    else amp = (0.17 + Math.random() * 0.05) * (1 - soft * 0.45);
    return amp;
  }

  function pickCycleResid(kind, amp) {
    let mag;
    if (kind === "HALVE") mag = 0.50 + Math.random() * 0.25;
    else if (kind === "SWAN") {
      const r = adoptSwanRange(S.have.adopt || 0);
      mag = Math.abs(r.lo + Math.random() * (r.hi - r.lo));
    } else if (kind === "BULL") {
      if (clampPx(S.price) < 10000) mag = amp * (1 - Math.random() * 0.15);
      else {
        const r = adoptBullRange(S.have.adopt || 0);
        mag = r.lo + Math.random() * (r.hi - r.lo);
      }
    } else {
      const r = adoptBearRange(S.have.adopt || 0);
      mag = Math.abs(r.lo + Math.random() * (r.hi - r.lo));
    }
    mag = Math.max(0.004, mag);
    if (kind === "BULL" && clampPx(S.price) < 10000) return mag;
    if (mag > amp * 0.92) mag = amp * 0.72;
    return mag;
  }

  function pickItem() {
    if (S.mp) {
      const r = S.mpRules || {};
      const w = [
        ["BULL", Math.max(0, Number(r.bull) || 0)],
        ["BEAR", Math.max(0, Number(r.bear) || 0)],
        ["LASER", Math.max(0, Number(r.laser) || 0)],
        ["SWAN", Math.max(0, Number(r.swan) || 0)],
        ["COLD", Math.max(0, Number(r.cold) || 0)]
      ];
      let tot = 0;
      w.forEach((x) => { tot += x[1]; });
      if (tot <= 0) return "BULL";
      let x = wrng() * tot;
      for (let i = 0; i < w.length; i++) {
        x -= w[i][1];
        if (x <= 0) {
          const type = w[i][0];
          if (type === "SWAN" && S.spawnedPipes < 7) return "BULL";
          return type;
        }
      }
      return "BULL";
    }
    const bag = ["BULL","BULL","BULL","BULL","BULL","BULL","BULL","BULL","BEAR","BEAR","BEAR","BEAR","BEAR","LASER","LASER","COLD","COLD","COLD","SWAN","SWAN","SWAN","SWAN"];
    let type = bag[(wrng() * bag.length) | 0];
    if (type === "SWAN" && S.spawnedPipes < 7) {
      const safe = bag.filter((t) => t !== "SWAN");
      type = safe[(wrng() * safe.length) | 0];
    }
    return type;
  }

  const S = {
    phase: "ready",
    countN: 3,
    speedMul: 1,
    W: 480, H: 640,
    bird: { x: 72, y: 280, v: 0, r: 14 },
    pipes: [], items: [], particles: [], floats: [],
    cash: 0, btc: 0, vt: 0, cold: 0, msig: 0, invuln: 0,
    power: "NONE", powerT: 0, laserOn: false, laserT: 0,
    widthMul: 1, widthT: 1, heightMul: 1, heightT: 1,
    price: 20000, vtPrice: 0,
    bg: 0, ticker: "", tickerT: 0,
    lastGapY: 0, spawnX: 0, best: loadBest(),
    dead: false, cycleStart: 20000, cycleDur: POWER_S, cycleElapsed: 0,
    vtCycle: 200, hitCap: false, lifeT: 0, sampleAcc: 0,
    tape: [], tapeVt: [], tapeCash: [], tapeBtcBag: [], tapeNet: [], tapeMarks: [], tapeTrades: [], eventPeaks: [], eventBottoms: [], waves: [], priceBase: 20000, drift: DRIFT0, level: 1, markAt: -99,
    startCash: 0, startPrice: 0, peakNet: 0, candles: 0, shownCandles: 0, buys: 0, sells: 0, swans: 0, lasers: 0,
    halvings: 0, halveLeft: HALVE_GAP, halveBull: false, halveFloor: 0, spawnedPipes: 0, halveSide: "up",
    swanBear: false, halveSpeechUntil: 0,
    stats: null, welcomed: false, introCounted: false, speechUntil: 0, speechRank: 0, humanInput: false, ranked: true,
    mp: false, worldSeed: 0, worldRand: null, mpOver: false, mpErr: "", mpJoinCode: "",
    mpRules: null, mpPlayAt: 0, mpSlot: 0, btcColdAt: 0, spectate: false, finished: false,
    mpRoundOver: false, mpSeriesOver: false, mpSeriesWins: {}, mpGameN: 1, mpNextAt: 0, mpRematchOn: false,
    jobTrack: null, jobOffer: null, jobName: "",
    have: { dca: 0, ff: 0, adopt: 0, manip: 0, candy: 0, juke: 0, aibud: 0, job: 0, market: 0, chance: 0, opsec: 0 },
    poolTier: { dca: 1, ff: 1, adopt: 1, manip: 1, candy: 1, juke: 1, aibud: 1, job: 1, market: 1, chance: 1, opsec: 1 },
    offerSeq: [1, 2], nextOffer: 1, offersDone: 0, perkResume: null, perkFib: 0,
    optPanel: null, optBack: "ready",
    testArcEvery: 0, testArcNext: 0, testPerkSeed: {}, testPerkPick: "dca", testCashOnce: 0, testBtcOnce: 0, testCur: "usd", testCheat: false, testBattle: "mod",
    sellsBear: 0, coldLost: 0, boughtBtc: false, halveMiss: 0, halveSpawned: 0,
    jukeList: [], jukeUnlock: [], jukeTrack: 0, jukeOn: false, jukeShuffle: false, jukeRepeat: "off", jukeOff: {},
    aibudOn: false, aibudLit: {}, iaLog: [], iaProfit: 0, aibudSpeechUntil: 0, aiAcc: 0,
  };

  function netUsd() { return S.cash + S.btc * S.price + S.vt * S.vtPrice; }
  function netBtc() {
    const px = clampPx(S.price);
    return S.btc + S.cash / px + (S.vt * (S.vtPrice || 0)) / px;
  }
  function net() { return netBtc(); }
  function scoreSats() { return Math.max(0, Math.round(netBtc() * 1e4)); }
  function btcRoom() { return Math.max(0, BTC_CAP - (S.btc || 0)); }
  function creditBtc(amount) {
    const want = Math.max(0, Number(amount) || 0);
    if (!want) return { take: 0, cash: 0 };
    const take = Math.min(want, btcRoom());
    const extra = want - take;
    S.btc = (S.btc || 0) + take;
    const cash = extra * clampPx(S.price);
    if (cash > 0) S.cash += cash;
    awardBtcColds();
    return { take, cash };
  }
  function awardBtcColds() {
    if (!S.mp) return;
    const u = Math.floor(S.btc || 0);
    const had = S.btcColdAt || 0;
    if (u > had) {
      S.cold = (S.cold || 0) + (u - had);
      S.btcColdAt = u;
      packCold();
    }
  }
  function clampHoldings() {
    if ((S.btc || 0) <= BTC_CAP) return;
    const extra = S.btc - BTC_CAP;
    S.btc = BTC_CAP;
    S.cash += extra * clampPx(S.price);
  }

  function ffSpeeds() {
    const out = [1];
    const n = Math.max(0, Math.min(FF_SPEEDS.length, S.have.ff || 0));
    for (let i = 0; i < n; i++) out.push(FF_SPEEDS[i]);
    return out;
  }
  function ffMax() {
    const list = ffSpeeds();
    return list[list.length - 1] || 1;
  }
  function cycleSpeed() {
    const list = ffSpeeds();
    if (list.length <= 1) { S.speedMul = 1; return; }
    const cur = S.speedMul || 1;
    let i = list.findIndex((x) => Math.abs(x - cur) < 0.001);
    S.speedMul = list[(i < 0 ? 0 : i + 1) % list.length];
  }

  function metrics() {
    const birdR = Math.min(17, Math.max(13, S.H * 0.021));
    const sm = S.speedMul || 1;
    const extra = Math.max(0, sm - 1);
    const gapBoost = 1 + extra * 0.12;
    const spaceBoost = 1 + extra * 0.08;
    const yMul = 1 + extra * 0.24;
    const gapH = Math.min(S.H * 0.3, Math.max(132, birdR * 5.4)) * gapBoost;
    const pipeW = Math.min(56, Math.max(42, S.W * 0.12));
    const spacing = 188 * spaceBoost;
    const speed = 173;
    return { birdR, gapH, pipeW, spacing, speed, gravity: 907 * yMul, jump: -302 * yMul, margin: Math.max(52, S.H * 0.085) };
  }

  function scrollMul() {
    return S.have.ff > 0 ? (S.speedMul || 1) : 1;
  }

  function burst(x, y, color, n, solid) {
    n = n || 10;
    const cap = LOW_END ? 90 : 180;
    if (S.particles.length > cap) S.particles.splice(0, S.particles.length - cap + n);
    for (let i = 0; i < n; i++) S.particles.push({ x, y, vx: (Math.random() - 0.5) * 180, vy: (Math.random() - 0.5) * 180 - 20, life: 0.35 + Math.random() * 0.3, color, solid: !!solid });
  }
  function heroFill() { return heroSkin(HERO_SKIN).fill || "#f2a900"; }
  const CASH_GREEN = "#3ecf73";

  function candyMul(tier) {
    const t = Math.max(0, Number(tier != null ? tier : S.have.candy) || 0);
    if (t <= 0) return 1;
    return Math.pow((1 + Math.sqrt(5)) / 2, t);
  }
  function candyLabel(tier) {
    const base = 100;
    const n = Math.round(base * candyMul(tier));
    return "+" + String(Math.max(0, n)) + " usd";
  }

  function usdIntLabel(text) {
    let s = String(text == null ? "" : text);
    s = s.replace(/([+-]?)\$?\s*(\d+(?:\.\d+)?)k(?=\s*usd\b)/gi, (_, sig, num) => {
      const n = Math.round(Math.abs(Number(num) || 0) * 1000);
      return (sig === "-" ? "-" : "+") + String(n);
    });
    s = s.replace(/([+-]?)\$?\s*(\d+(?:\.\d+)?)(?=\s*usd\b)/gi, (_, sig, num) => {
      const n = Math.round(Math.abs(Number(num) || 0));
      return (sig === "-" ? "-" : "+") + String(n);
    });
    return s;
  }
  function grantUsd(n, x, y, kind) {
    n = Number(n) || 0;
    if (!(n > 0)) return 0;
    if (kind === "gain" && S.have.candy > 0) n *= candyMul();
    if (kind === "gain") n = Math.round(n);
    if (!(n > 0)) return 0;
    const px = x == null ? S.bird.x : x;
    const py = y == null ? S.bird.y - 24 : y;
    const wholeUsd = (v) => usdIntLabel("+" + String(Math.max(0, Math.round(Number(v) || 0))) + " usd");
    if (kind === "gain") {
      if (S.dcaOn && S.have.dca > 0 && clampPx(S.price) > 0) {
        const price = clampPx(S.price);
        const out = creditBtc(n / price);
        if (out.take > 0) pop(px, py, "+" + fmtAmt(out.take, "btc"), PAL.hud || BTC, "gain");
        if (out.cash > 0) pop(px, py + (out.take > 0 ? 14 : 0), wholeUsd(out.cash), CASH_GREEN, "gain");
        if (out.take <= 0 && out.cash <= 0) { S.cash += n; pop(px, py, wholeUsd(n), CASH_GREEN, "gain"); }
        return n;
      }
      S.cash += n;
      pop(px, py, wholeUsd(n), CASH_GREEN, "gain");
      return n;
    }
    const usdPop = (v) => "+" + fmtAmt(v, "usd");
    if (S.dcaOn && S.have.dca > 0 && clampPx(S.price) > 0) {
      const price = clampPx(S.price);
      const want = n / price;
      const out = creditBtc(want);
      if (out.take > 0) pop(px, py, "+" + fmtAmt(out.take, "btc"), PAL.hud || BTC, kind);
      if (out.cash > 0) pop(px, py + (out.take > 0 ? 14 : 0), usdPop(out.cash), PAL.labelUp || GREEN, kind);
      if (out.take <= 0 && out.cash <= 0) {
        S.cash += n;
        pop(px, py, kind === "gain" ? usdPop(n) : "+" + n + " usd", GREEN, kind);
      }
    } else {
      S.cash += n;
      pop(px, py, kind === "gain" ? usdPop(n) : "+" + n + " usd", GREEN, kind);
    }
    return n;
  }

  function pop(x, y, text, color, kind) {
    if (kind === "gain" && !SHOW_GAIN) return;
    if (kind === "trade" && !SHOW_TRADE) return;
    const gain = kind === "gain";
    const shown = gain ? usdIntLabel(text) : text;
    const power = kind === "power";
    const flowerTalk = PALETTE_ID === "flower" && kind === "trade";
    S.floats.push({
      x, y, text: shown, color, kind: kind || "",
      life: gain || power ? 0.825 : 1.1,
      vy: gain || power ? -32 : -38,
      size: flowerTalk ? 16 : (gain ? 7.35 * 1.05 * 1.1 : (power ? 7.35 * 1.05 : 13)),
      maxA: flowerTalk ? 1 : (gain || power ? 0.75 : 0.875),
    });
  }

  function fmtAmt(n, ticker) {
    const tag = ticker.toLowerCase();
    if (tag === "usd") return fmtUsd(n).replace(/^\$/, "") + " usd";
    if (tag === "btc") return fmtBtcAmt(n) + " btc";
    return (n >= 1 ? n.toFixed(3) : n.toFixed(4)) + " " + tag;
  }

  function lineDur(line) {
    if (!line) return 0;
    return Math.max(0.75, line.length * 0.078);
  }

  function spoken(line) {
    if (line === "There is no second best") return "Therese no second best";
    if (line === "You got F. T. X.'d!") return "you got F T Xed";
    return line;
  }

  function formatVoice(line) {
    let s = String(line || "").replace(/\s+/g, " ").trim();
    if (!s) return "";
    s = s.replace(/[.]+$/g, "");
    s = s.replace(/(^|[.!?]\s+)([a-záéíóúüñ])/g, (m, a, b) => a + b.toUpperCase());
    return s;
  }

  function voiceRank(kind) {
    if (kind === "halve") return 80;
    if (kind === "aibud") return 70;
    if (kind === "trade") return 10;
    if (kind === "cycle") return 20;
    return 40;
  }

  const VOICE_ES = {
    "Black swan!": "¡Cisne negro!",
    "Cold storage lost!": "¡Perdiste el cold storage!",
    "Oh oh, Funds not SAFU!": "Oh oh, ¡los fondos no están SAFU!",
    "Coldcard randomness!": "¡Aleatoriedad de Coldcard!",
    "China ban!": "¡Prohibición en China!",
    "In before oceans evaporation!": "¡Antes de que se evaporen los océanos!",
    "You got F. T. X.'d!": "¡Te aplicaron un F. T. X.!",
    "Bull market!": "¡Mercado bull!",
    "To the moon!": "¡A la luna!",
    "We are SO back!": "¡Volvimos con todo!",
    "Luke, I am your spammer": "Luke, soy tu spammer",
    "Bitcoin C.E.O. to increase prices": "El C.E.O. de Bitcoin va a subir los precios",
    "Going up forever Laura!": "¡Esto sube para siempre, Laura!",
    "Laser eyes!": "¡Ojos láser!",
    "Nothing stops this train": "Nada frena este tren",
    "Conviction addiction": "Adicción a la convicción",
    "There is no second best": "No hay un segundo mejor",
    "Stay humble stack Sats": "Humildad y a juntar sats",
    "Have fun staying poor!": "¡Diviértete quedándote pobre!",
    "Fix the money fix the world!": "¡Arregla el dinero, arregla el mundo!",
    "Unconfiscable power!": "¡Poder inconfiscable!",
    "Do it for Scottie Pippen": "Hazlo por Scottie Pippen",
    "Halving in sight!": "¡Halving a la vista!",
    "Tick tock, next block": "Tic tac, el próximo bloque",
    "Bear market! Crash!": "¡Mercado bear! ¡Caída!",
    "Quantum conundrum!": "¡Dilema cuántico!",
    "Bukele all-in ethereum": "Bukele, todo a ethereum",
    "Bitcoin Depravement Proposals": "Propuestas de depravación de Bitcoin",
    "Rat poison squared!": "¡Veneno para ratas al cuadrado!",
    "Block size wars!": "¡Guerras del tamaño de bloque!",
    "Long it!": "¡Ponte en largo!",
    "Bitcoin bought": "Bitcoin comprado",
    "All-in corn!": "¡Todo al maíz!",
    "Stack it!": "¡Júntalo!",
    "Buy the dip!": "¡Compra la baja!",
    "Greater fool found": "Apareció un tonto mayor",
    "Short it!": "¡Ponte en corto!",
    "You are now a nocoiner": "Ahora eres nocoiner",
    "Bitcoin sold": "Bitcoin vendido",
    "Exit all crypto markets": "Sal de todos los mercados cripto",
    "Halving aborted": "Halving abortado",
    "The grinch stole the halving": "El Grinch se robó el halving",
    "Bitcoin C.E.O to cancel halving": "El C.E.O. de Bitcoin cancela el halving",
    "Gary Gensler stole the halving": "Gary Gensler se robó el halving",
    "Oh no, Peter Schiff stole the halving": "Oh no, Peter Schiff se robó el halving",
    "Faketoshi stole the halving": "Faketoshi se robó el halving",
    "No halving soup for you!": "¡No hay sopa de halving para ti!",
    "Halving missed": "Halving fallido",
    "Cold storage secured!": "¡Cold storage asegurado!",
    "Multisig enabled": "Multisig activado",
    "Security improved to multisig": "Seguridad mejorada a multisig",
    "Multisig rescue!": "¡Rescate multisig!",
    "Cold storage rescue!": "¡Rescate de cold storage!",
    "Black swan vaporized!": "¡Cisne negro vaporizado!",
    "A.I. bud is timing the market for you!": "¡A.I. bud está midiendo el mercado por ti!",
    "Fibonacci treshold reached, grab your perk!": "Umbral de Fibonacci. ¡Toma tu perk!"
  };
  const PERK_VOICE_ES = {
    "D.C.A.": "D.C.A.",
    "Candle candy": "Caramelo de vela",
    "Employment": "Empleo",
    "an A.I. bud upgrade": "una mejora de A.I. bud",
    "Manipulation": "Manipulación",
    "Adoption": "Adopción",
    "Marketplace": "Mercado",
    "Arc": "Arco",
    "FastForward": "FastForward",
    "Jukebox": "Jukebox",
    "Opsec": "Opsec",
    "a perk": "una perk"
  };
  const CAPTION_RES = [
    { re: /^Halving number (\d+)$/, es: (m) => "Halving número " + m[1] },
    { re: /^Liberty Nodes (\d+)\/100$/, es: (m) => "Nodos de Libertad " + m[1] + "/100" },
    { re: /^You cannot cover (.+) yet\.?$/, es: (m) => "Todavía no cubres " + m[1] + "." },
    { re: /^Army tier (\d+)\/7 · speed \+(.+)% · shield -(.+)% · −(.+)$/, es: (m) => "Nivel de ejército " + m[1] + "/7 · velocidad +" + m[2] + "% · escudo −" + m[3] + "% · −" + m[4] },
    { re: /^Defense force formed\. (.+)$/, es: (m) => "Fuerza de defensa formada. " + m[1] },
    { re: /^A\.I\. bud takes (.+)$/, es: (m) => "A.I. bud toma " + (PERK_VOICE_ES[m[1]] || m[1]) },
    { re: /^A\.I\. bud picks (.+)$/, es: (m) => "A.I. bud elige " + (PERK_VOICE_ES[m[1]] || m[1]) },
    { re: /^Stacking with (.+)$/, es: (m) => "Juntas con " + (PERK_VOICE_ES[m[1]] || m[1]) }
  ];
  function visLine(line) {
    if (!(window.BZ && BZ.lang && BZ.lang() === "es")) return line;
    if (Object.prototype.hasOwnProperty.call(VOICE_ES, line)) return VOICE_ES[line];
    for (let i = 0; i < CAPTION_RES.length; i++) {
      const m = CAPTION_RES[i].re.exec(line);
      if (m) return CAPTION_RES[i].es(m);
    }
    return line;
  }

  function say(line, urgent, kind) {
    if (!line) return;
    line = formatVoice(line);
    const rank = voiceRank(kind);
    const prev = S.speechRank || 0;
    const busy = S.lifeT < (S.speechUntil || 0);
    if (busy && rank <= prev) return;
    if (rank < 80 && S.lifeT < S.halveSpeechUntil) return;
    if (rank < 70 && S.lifeT < (S.aibudSpeechUntil || 0)) return;
    S.ticker = visLine(line);
    S.tickerT = Math.max(1.5, lineDur(line));
    S.speechUntil = S.lifeT + lineDur(spoken(line));
    S.speechRank = rank;
    if (kind === "halve") S.halveSpeechUntil = S.speechUntil + 0.2;
    if (kind === "aibud") S.aibudSpeechUntil = S.speechUntil + 0.15;
    const cut = rank >= 70 || (busy && rank > prev);
    A.speak(spoken(line), !!(urgent && rank > 10) || cut);
  }

  function sayEn(en, cap, urgent, kind) {
    say(en, urgent, kind);
    if (cap) S.ticker = cap;
  }

  function pickLine(pool) {
    const short = pool.filter((l) => l.length <= 18);
    const busy = S.lifeT < S.speechUntil - 0.12;
    const m = metrics();
    let speed = m.speed * scrollMul();
    if (S.power === "BULL" || S.power === "BEAR" || S.laserOn) speed *= 1.28;
    let soon = false;
    for (const it of S.items) {
      const eta = (it.x - S.bird.x) / Math.max(40, speed);
      if (eta > 0.08 && eta < 2.3) { soon = true; break; }
    }
    const bag = (!busy && !soon ? pool : short).concat([""]);
    let line = bag[(Math.random() * bag.length) | 0];
    if (line === "Luke, I am your spammer" && Math.random() < 0.5) {
      const rest = bag.filter((l) => l !== "Luke, I am your spammer");
      line = rest[(Math.random() * rest.length) | 0] || "";
    }
    return line;
  }

  function drawLine(pool, silentP) {
    if (Math.random() < (silentP || 0)) return "";
    if (!pool || !pool.length) return "";
    return pickLine(pool);
  }

  function applyLaser(on) {
    S.laserOn = on;
    if (on) {
      S.laserT = POWER_S; S.widthT = 0.378; S.heightT = 0.9;
    } else { S.laserT = 0; S.widthT = 1; S.heightT = 1; }
  }

  function pipePw() {
    return metrics().pipeW * (S.widthMul || 1);
  }
  function pipeWx(p, pw) {
    const w = pw != null ? pw : pipePw();
    return p.x + w * 0.5;
  }

  function pipeEnds(p) {
    let top0 = p.gapY - p.gapH / 2;
    let bot0 = p.gapY + p.gapH / 2;
    if (S.power === "BEAR") {
      const cut = S.swanBear ? 0.045 : 0.025;
      top0 += p.gapH * cut;
      bot0 -= p.gapH * cut;
    }
    return { top: top0 * S.heightMul, bot: S.H - (S.H - bot0) * S.heightMul };
  }

  function pipeEndsRaw(p) {
    let top0 = p.gapY - p.gapH / 2;
    let bot0 = p.gapY + p.gapH / 2;
    if (S.power === "BEAR") {
      const cut = S.swanBear ? 0.045 : 0.025;
      top0 += p.gapH * cut;
      bot0 -= p.gapH * cut;
    }
    return { top: top0, bot: bot0 };
  }

  function wickAxis(p, r) {
    const pw = pipePw();
    const ends = pipeEndsRaw(p);
    const wick = Math.min(22, p.gapH * 0.14);
    const rad = r || 14;
    const lo = ends.top + rad;
    const hi = ends.bot - rad;
    return { x: pipeWx(p, pw), pw, lo, hi: Math.max(lo + 8, hi), wick, ends };
  }

  function itemsOnPipe(pipe) {
    return S.items.filter((it) => it.pipe === pipe);
  }

  function pinItem(it) {
    if (it.pipe && S.pipes.indexOf(it.pipe) >= 0) {
      const box = wickAxis(it.pipe, it.r);
      it.x = box.x;
      it.lo = box.lo;
      it.hi = box.hi;
      it.freeX = false;
    } else {
      it.pipe = null;
      it.freeX = true;
    }
    if (it.type === "HALVE") it.y = halveSlotY(it.halveUp, it.r);
    return true;
  }

  function spawnPipe(x) {
    const m = metrics();
    const gapH = m.gapH;
    const minY = m.margin + gapH / 2;
    const maxY = S.H - m.margin - gapH / 2;
    let gapY;
    if (!S.pipes.length) gapY = S.bird.y + (wrng() > 0.5 ? 1 : -1) * gapH * 0.28;
    else {
      const sign = wrng() > 0.5 ? 1 : -1;
      gapY = S.lastGapY + sign * (0.42 + wrng() * 0.42) * gapH;
    }
    gapY = Math.max(minY, Math.min(maxY, gapY));
    if (S.pipes.length && Math.abs(gapY - S.lastGapY) < gapH * 0.32) {
      gapY = S.lastGapY + (gapY >= S.lastGapY ? 1 : -1) * gapH * 0.4;
      gapY = Math.max(minY, Math.min(maxY, gapY));
    }
    S.lastGapY = gapY;
    S.spawnedPipes += 1;
    const raceN = S.mp ? ((S.mpRules && S.mpRules.mode === "race") ? (S.mpRules.raceN | 0) : 0) : 0;
    const isFinish = !!(raceN && S.spawnedPipes === raceN);
    const pipe = { x, gapY, gapH, green: wrng() > 0.45, scored: false, seen: false, finish: isFinish };
    S.pipes.push(pipe);
    if (!isFinish && wrng() < 0.52 && !itemsOnPipe(pipe).length) {
      const type = pickItem();
      const r = type === "SWAN" ? 17 : 14;
      const box = wickAxis(pipe, r);
      const span = Math.max(8, box.hi - box.lo);
      const y = box.lo + wrng() * span;
      S.items.push({
        pipe,
        x: box.x,
        y,
        lo: box.lo,
        hi: box.hi,
        vy: (wrng() < 0.5 ? -1 : 1) * (22 + wrng() * 16),
        type, r, freeX: false,
      });
    }
  }

  function tickHalve() {
    if (S.phase !== "play") return;
    if (S.halveLeft > 0) S.halveLeft -= 1;
    if (S.halveLeft === 4) {
      const pool = A.HALVE_SOON || ["Halving in sight!"];
      say(pool[(Math.random() * pool.length) | 0], true, "halve");
    }
    if (S.halveLeft === 1) {
      S.halveSide = wrng() < 0.5 ? "up" : "down";
      if (S.aibudOn && (S.have.aibud || 0) >= 1) {
        sayEn(
          S.halveSide === "up" ? "Halving. Look up!" : "Halving. Look down!",
          S.halveSide === "up" ? t("halveTipUp") : t("halveTipDown"),
          true,
          "halve"
        );
      }
    }
    if (S.halveLeft === 0) {
      spawnHalve();
      S.halveLeft = HALVE_GAP;
    }
  }

  function resetWorld(keepWallet) {
    const m = metrics();
    if (S.mp && S.worldSeed) S.worldRand = mulberry32(S.worldSeed);
    else S.worldRand = null;
    S.bird.x = Math.max(64, S.W * 0.18);
    S.bird.y = S.H * 0.42;
    S.bird.v = 0;
    S.bird.r = m.birdR;
    S.pipes = []; S.items = []; S.particles = []; S.floats = [];
    if (!keepWallet) {
      S.cash = gauss(2000, 0, 4000);
      S.btc = 0; S.vt = 0; S.vtPrice = 0; S.level = 1; S.hitCap = false;
      S.price = gauss(20000, 0, 40000);
      S.startCash = S.cash; S.startPrice = S.price;
      S.peakNet = netBtc(); S.candles = 0; S.shownCandles = 0; S.buys = 0; S.sells = 0; S.swans = 0; S.lasers = 0;
      S.halvings = 0; S.halveMiss = 0; S.halveSpawned = 0; S.lasers = 0; S.perkPick = ""; S.perkHint = ""; S.perkChain = 0; S.dcaOn = false; S.trend = "off"; S.perkOffers = []; S.speedMul = 1;
      S.have = { dca: 0, ff: 0, adopt: 0, manip: 0, candy: 0, juke: 0, aibud: 0, job: 0, market: 0, chance: 0, opsec: 0 };
      S.poolTier = { dca: 1, ff: 1, adopt: 1, manip: 1, candy: 1, juke: 1, aibud: 1, job: 1, market: 1, chance: 1, opsec: 1 };
      S.offerSeq = S.ranked ? fibSeq(16) : [10, 20, 30];
      S.nextOffer = S.ranked ? 1 : 10;
      S.offersDone = 0;
      S.perkResume = null; S.perkFib = 0;
      S.jukeList = []; S.jukeUnlock = []; S.jukeTrack = 0; S.jukeOn = false; S.jukeShuffle = false; S.jukeRepeat = "off"; S.jukeOff = {};
      S.aibudOn = false; S.aibudLit = {}; S.aibudLitAt = {}; S.iaLog = []; S.iaProfit = 0; S.aibudSpeechUntil = 0; S.aiAcc = 0; S.aiTimingStart = null; S.aiTimingLast = 0; S.aiTradeAt = -999;
      S.jobName = ""; S.jobTrack = null; S.jobOffer = null; S.chanceAt = []; S.chanceUntil = 0; S.chanceUsed = {}; S.chessPick = -1; S.winKind = ""; S.indepEnded = false; S.bcFourthDone = false; S.chanceCard = null; S.chanceNote = ""; S.chanceReadyNote = ""; S.chanceSettled = false; S.chanceMet = {}; S.chanceLead = ""; S.arcHold = false; S.arcTldr = ""; S.arcPending = null; S.hasRing=false; S.engaged=false; S.familyClosed=false; S.familyPath=false; S.arcSeen=[]; S.arcBias=""; S.bcBook=false; S.bcBookOffer=false; S.bcIslandOffer=0; S.bcIsland=false; S.bcOg=false; S.bcNodes=0; S.bcNodeTick=0; S.bcSettlement=false; S.bcPower=false; S.bcMine=false; S.bcCitadel=false; S.bcArmyUnlocked=false; S.bcArmy=0; S.bcArmyTier=0; S.bcWorld=20; S.bcIndependent=false; S.bcVictory=false; S.bcArcClosed=false; S.bcDefense=null; S.bcDefensePending=false; S.bcArmySpend=0; S.bcBattlesWon=0; S.bcPerks={}; S.bcAidUsed=0; S.bcAssaultAt=0; S.bcMapPlan=null; S.bcMapSeed=0; S.bcReactions=null; S.bcPeacePct=0; S.bcArtPick={}; rollBlocs(); S.bcRepliesDone=false; S.indepNoted=false; S.indepAt=0; S.bcCountryName=""; S.bcNameAsk=false; S.bcShotTier=0; S.bcShotSpread=0; S.bcRuinTiles=0; S.bcRuinGone=0; S.bcRebuild=null; S.awRunCounted=false;
      if (A && A.jukeStop) A.jukeStop();
    }
    S.halveLeft = HALVE_GAP; S.halveBull = false; S.halveFloor = 0; S.spawnedPipes = 0; S.halveSide = "up";
    S.shownCandles = 0;
    S.swanBear = false; S.halveSpeechUntil = 0;
    S.cold = S.ranked ? 0 : 9;
    S.invuln = 0;
    if (!keepWallet) S.msig = S.ranked ? 0 : 999;
    if (S.mp) {
      const r = S.mpRules || (window.ChoppyMP && window.ChoppyMP.rules && window.ChoppyMP.rules()) || {};
      S.cold = (r.startCold | 0) || 0;
      if (!keepWallet) S.msig = 0;
      S.btcColdAt = 0;
    }
    S.power = "NONE"; S.powerT = 0; S.powerUntil = 0;
    applyLaser(false);
    S.widthMul = S.heightMul = 1;
    S.bg = 0; S.ticker = ""; S.tickerT = 0;
    S.lastGapY = S.bird.y; S.dead = false;
    S.cycleStart = S.price; S.cycleDur = POWER_S; S.cycleElapsed = 0;
    S.cycleAmp = 0;
    S.cycleMax = S.price; S.cycleMin = S.price; S.cycleMaxI = 0; S.cycleMinI = 0;
    S.lifeT = 0; S.sampleAcc = 0; S.tape = []; S.tapeVt = []; S.tapeCash = []; S.tapeBtcBag = []; S.tapeNet = []; S.tapeLo = null; S.tapeHi = null;
    S._tapeVis = null; S._tvN = -1; S._tvStart = -1; S._tapeT = 0;
    S.tapeMarks = []; S.tapeTrades = []; S.eventPeaks = []; S.eventBottoms = []; S.tapeLive = null;
    S.markAt = -99;
    S.cycleEnv = 0; S.cycleManip = 1; S.cycleStacks = 0;
    S.waves = []; S.priceBase = clampPx(S.price);
    S.drift = DRIFT0 * (1 + (wrng() * 2 - 1));
    S.runTab = null; S.runTape = []; S.runMarks = []; S.runTrades = []; S.runCash = []; S.runBtcBag = []; S.runNet = []; S.chartFlags = { trades: false, btc: false, usd: false, net: false };
    S.speechUntil = 0;
    S.speechRank = 0;
    const first = S.bird.x + 210;
    spawnPipe(first); spawnPipe(first + m.spacing); spawnPipe(first + m.spacing * 2);
    S.spawnX = first + m.spacing * 2;
  }

  function sameDirN(w) {
    const waves = S.waves || [];
    const idx = waves.indexOf(w);
    if (idx < 0) return 1;
    let n = 0;
    for (let i = 0; i <= idx; i++) if (waves[i].dir === w.dir) n++;
    return Math.max(1, n);
  }
  function stackW(w) {
    return 1 / sameDirN(w);
  }
  function waveMul(sum) {
    return Math.max(0.18, Math.min(3.2, 1 + sum));
  }

  function waveDur() { return WAVE_UP + WAVE_BACK; }
  function bankGain(n, remain) {
    const add = waveDur();
    if (n <= 1) return add;
    const tax = 1 - 1 / (n - 1);
    const room = Math.max(0, add - remain);
    const overflow = Math.max(0, add - room);
    return room + overflow * (1 - tax);
  }
  function streakLeft(now) {
    return Math.max(0, (S.powerUntil || 0) - (now != null ? now : S.lifeT));
  }
  function waveAge(w, now) { return (now != null ? now : S.lifeT) - w.t0; }
  function waveLive(w, now) { return waveAge(w, now) < waveDur(); }
  function liveWaves(now) { return (S.waves || []).filter((w) => waveLive(w, now)); }

  function waveK(w, now) {
    const t = waveAge(w, now);
    if (t <= 0) return 0;
    const dir = w.dir;
    const k = crashScale(w.kind, dir) * stackW(w);
    if (t <= WAVE_UP) {
      const u = Math.min(1, t / WAVE_UP);
      const e = u * u * (3 - 2 * u);
      return dir * w.amp * e * k;
    }
    if (t < waveDur()) {
      const u = Math.min(1, (t - WAVE_UP) / WAVE_BACK);
      const e = u * u * (3 - 2 * u);
      return dir * (w.amp + (w.resid - w.amp) * e) * k;
    }
    return dir * w.resid * k;
  }

  function syncWaveFlags() {
    const now = S.lifeT;
    const live = liveWaves(now);
    S.halveBull = live.some((w) => w.kind === "HALVE");
    S.swanBear = live.some((w) => w.kind === "SWAN");
    S.cycleStacks = (S.waves || []).length;
    S.powerT = streakLeft(now);
    const last = (S.waves || []).length ? S.waves[S.waves.length - 1] : null;
    S.power = S.powerT > 0 && last ? last.type : ((S.waves || []).length ? S.power : "NONE");
    if (!((S.waves || []).length) || S.powerT <= 0) {
      if (!((S.waves || []).length)) { S.power = "NONE"; S.powerT = 0; }
    }
  }

  function beginCycle(type, kind) {
    const k = kind || type;
    const dir = type === "BULL" ? 1 : -1;
    const amp = pickCycleAmp(k);
    const resid = pickCycleResid(k, amp);
    if (!(S.waves && S.waves.length)) {
      S.priceBase = clampPx(S.price);
      S.cycleStart = S.priceBase;
      S.vtCycle = S.vtPrice;
      S.cycleManip = 1;
      S.cycleMax = S.price;
      S.cycleMin = S.price;
      S.cycleMaxI = S.tape.length;
      S.cycleMinI = S.tape.length;
      S.waves = [];
    }
    S.waves.push({ type: type, kind: k, dir: dir, amp: amp, resid: resid, t0: S.lifeT, marked: false });
    const now = S.lifeT;
    const n = S.waves.length;
    const remain = n <= 1 ? 0 : Math.max(0, (S.powerUntil || now) - now);
    S.powerUntil = now + remain + bankGain(n, remain);
    S.power = type;
    S.tapeLive = { kind: dir > 0 ? "peak" : "bottom", price: S.price, i: S.tape.length };
    if (k === "HALVE") S.halveBull = true;
    if (k === "SWAN") S.swanBear = true;
    syncWaveFlags();
    kickTheme();
  }

  function endCycle() {
    if (!(S.waves && S.waves.length)) return;
    let sum = 0;
    for (const w of S.waves) sum += w.dir * w.resid * crashScale(w.kind, w.dir) * stackW(w);
    let next = (S.priceBase || S.price) * waveMul(sum) * (S.cycleManip || 1);
    if (S.halveFloor > 0 && S.waves.some((w) => w.kind === "HALVE")) next = Math.max(next, S.halveFloor);
    S.price = clampPx(next);
    S.priceBase = S.price;
    if (S.level >= 2 && S.vtCycle > 0) S.vtPrice = Math.max(1, S.vtCycle * (1 + sum * 0.45) * (S.cycleManip || 1));
    S.waves = [];
    S.powerUntil = 0;
    S.power = "NONE"; S.powerT = 0; S.halveBull = false; S.swanBear = false;
    S.cycleStacks = 0; S.cycleManip = 1; S.cycleEnv = 0; S.tapeLive = null;
  }

  function halveMinRise() {
    return 15000 * Math.max(1, S.halvings);
  }

  function stampWaveMark(w) {
    if (!w || w.marked) return;
    if ((S.lifeT - (S.markAt || -99)) < 3) { w.marked = true; return; }
    w.marked = true;
    if (!S.tapeMarks) S.tapeMarks = [];
    S.tapeMarks.push({
      kind: w.dir > 0 ? "peak" : "bottom",
      price: S.price,
      i: S.tape.length
    });
    S.markAt = S.lifeT;
    if (S.tapeMarks.length > 36) S.tapeMarks = S.tapeMarks.slice(-36);
  }

  function updateTapeLive(now) {
    let follow = null;
    for (const w of (S.waves || [])) {
      const t = waveAge(w, now);
      if (t >= WAVE_UP) stampWaveMark(w);
      else if (t >= 0) follow = w;
    }
    if (follow) {
      S.tapeLive = { kind: follow.dir > 0 ? "peak" : "bottom", price: S.price, i: S.tape.length };
    } else {
      S.tapeLive = null;
    }
  }

  function noteCyclePrice() {
    if (S.power !== "BULL" && S.power !== "BEAR") return;
    const i = S.tape.length;
    if (S.cycleMax == null || S.price >= S.cycleMax) { S.cycleMax = S.price; S.cycleMaxI = i; }
    if (S.cycleMin == null || S.price <= S.cycleMin) { S.cycleMin = S.price; S.cycleMinI = i; }
    const peak = S.power === "BULL";
    S.tapeLive = {
      kind: peak ? "peak" : "bottom",
      price: peak ? S.cycleMax : S.cycleMin,
      i: peak ? S.cycleMaxI : S.cycleMinI
    };
  }

  function trendBias() {
    const base = (S.drift != null ? S.drift : DRIFT0);
    let bias = base * (1 + (Math.random() * 2 - 1) * 0.05);
    if ((S.have.manip || 0) > 0) {
      const k = (S.have.manip || 0) * (12 / 7);
      if (S.trend === "up") bias += 0.004 * k;
      else if (S.trend === "down") bias -= 0.004 * k;
    }
    return bias;
  }

  function fibAt(n) {
    const i = Math.max(1, n | 0);
    const s = fibSeq(Math.max(2, i));
    return s[i - 1] || 1;
  }

  function halveSlotY(up, r) {
    const rad = r || 17;
    const pad = rad + 10;
    if (up) return pad;
    const buy = $("buy-btc");
    const c = $("c");
    if (buy && c) {
      const cb = c.getBoundingClientRect();
      const bb = buy.getBoundingClientRect();
      const scale = S.H / Math.max(1, cb.height);
      const y = (bb.top - cb.top) * scale - pad;
      if (isFinite(y)) return Math.max(pad, Math.min(S.H - pad, y));
    }
    return S.H - 78;
  }

  function spawnHalve() {
    if (S.items.some((it) => it.type === "HALVE")) return;
    const r = 17;
    const up = S.halveSide !== "down";
    const y = halveSlotY(up, r);
    const m = metrics();
    let x = S.W + m.spacing * 0.5;
    const pipes = S.pipes;
    if (pipes.length >= 2) {
      const a = pipes[pipes.length - 2];
      const b = pipes[pipes.length - 1];
      x = (pipeWx(a) + pipeWx(b)) * 0.5;
    } else if (pipes.length === 1) {
      x = pipeWx(pipes[0]) + m.spacing * 0.5;
    }
    S.items.push({
      pipe: null, x, y, lo: y, hi: y,
      type: "HALVE", r, halveUp: up, freeX: true
    });
    S.drift = (S.drift != null ? S.drift : DRIFT0) * DRIFT_GROW;
    S.halveSpawned = (S.halveSpawned || 0) + 1;
    A.sfx.cap();
  }

  function missHalve() {
    S.halveMiss = (S.halveMiss || 0) + 1;
    const pool = A.HALVE_MISS || ["Halving aborted", "The grinch stole the halving", "Bitcoin C.E.O to cancel halving", "Gary Gensler stole the halving", "Oh no, Peter Schiff stole the halving", "Faketoshi stole the halving", "No halving soup for you!", "Halving missed"];
    const line = pool[(Math.random() * pool.length) | 0];
    if (line) say(line, true, "halve");
    S.halveSide = "up";
  }

  function collect(it) {
    const color = it.type === "BULL" || it.type === "HALVE" ? GREEN : it.type === "BEAR" ? RED : it.type === "COLD" ? "#33c6e8" : it.type === "LASER" ? "#e8902a" : "#c9a0ff";
    burst(it.x, it.y, color, 12);
    grantUsd(500, it.x, it.y - 18, "power");
    if (it.type === "SWAN") {
      const pool = S.cold >= 1
        ? A.SWAN
        : A.SWAN.filter((l) => l !== "Cold storage lost!");
      const line = Math.random() < 0.15 ? "" : pool[(Math.random() * pool.length) | 0];
      if (line) say(line, true, "cycle");
      A.sfx.boom();
      applyLaser(false);
      if (S.cold > 0) { S.coldLost = (S.coldLost || 0) + S.cold; S.cold = 0; }
      S.swanBear = true;
      beginCycle("BEAR", "SWAN");
      return;
    }
    if (it.type === "LASER") {
      S.lasers += 1;
      if (S.laserOn) S.laserT += POWER_S; else applyLaser(true);
      const line = drawLine(A.LASER && A.LASER.length ? A.LASER : ["Laser eyes!"], 0.15);
      say(line || "Laser eyes!", true);
      A.sfx.power();
      if (S.ranked) tryRankedPerk(false);
      return;
    }
    if (it.type === "COLD") {
      S.cold += 1;
      packCold();
      if (S.cold === 0) {
        const line = Math.random() < 0.5 ? "Multisig enabled" : "Security improved to multisig";
        say(line, true);
      } else say("Cold storage secured!");
      A.sfx.coin();
      return;
    }
    if (it.type === "BEAR" && S.laserOn) {
      A.sfx.wave();
      return;
    }
    if (it.type === "HALVE") {
      S.halvings += 1;
      const gift = fibAt(S.halvings);
      const out = creditBtc(gift);
      if (out.take > 0) pop(it.x, it.y - 36, "+" + fmtAmt(out.take, "btc"), BTC, "power");
      if (out.cash > 0) pop(it.x, it.y - 50, "+" + fmtAmt(out.cash, "usd"), GREEN, "power");
      const floorFrom = S.power === "BULL" ? (S.priceBase || S.price) : S.price;
      S.halveFloor = Math.max(S.halveFloor, floorFrom + halveMinRise());
      beginCycle("BULL", "HALVE");
      say("Halving number " + S.halvings, true, "halve");
      A.sfx.cap();
      S.perkChain = 3;
      openPerkOffer("halve", true);
      if (S.phase !== "perk") S.perkChain = 0;
      return;
    }
    beginCycle(it.type);
    const line = drawLine(it.type === "BULL" ? A.BULL : A.BEAR, 0.15);
    if (line) say(line, true, "cycle");
    if (it.type === "BULL") A.sfx.wave();
    else A.sfx.hit();
  }

  function hitFatal() {
    if (S.spectate || S.finished) return;
    if (S.invuln > 0) return;
    if (S.cold > 0) { rescue(); return; }
    if (S.msig > 0) {
      S.msig -= 1;
      S.cold = 9;
      S.invuln = 1.4;
      S.bird.v = metrics().jump * 0.7;
      S.bird.y = Math.min(Math.max(S.bird.y, 70), S.H - 70);
      say("Multisig rescue!", true);
      A.sfx.coin();
      burst(S.bird.x, S.bird.y, "#c8960a", 14);
      return;
    }
    die();
  }

  function rescue() {
    S.cold -= 1; S.coldLost = (S.coldLost || 0) + 1; S.invuln = 1.4;
    S.bird.v = metrics().jump * 0.7;
    S.bird.y = Math.min(Math.max(S.bird.y, 70), S.H - 70);
    say("Cold storage rescue!", true); A.sfx.coin();
    burst(S.bird.x, S.bird.y, "#33c6e8", 14);
  }

  function die() {
    if (S.dead) return;
    S.dead = true;
    S.phase = "over";
    try { applyLaser(false); } catch (e) {}
    S.power = "NONE"; S.powerT = 0;
    try { if (A && A.sfx && A.sfx.die) A.sfx.die(); } catch (e) {}
    try { if (A && A.cancelSpeech) A.cancelSpeech(); } catch (e) {}
    try { if (A && A.speak) A.speak(formatVoice("Rekt! You got liquidated"), true); } catch (e) {}
    S.ticker = t("liquidated");
    if (!S.mp) {
      try { S.best = saveBest(scoreSats()); } catch (e) {}
      snapshotRun();
    }
    if (field) field.classList.remove("is-play");
    if (S.mp && window.ChoppyMP) {
      try { snapshotRun(); } catch (e) {}
      try { window.ChoppyMP.dead(S.lifeT, S.candles, { btc: S.btc }); } catch (e) {}
      S.spectate = true;
      if (field) field.classList.add("is-play");
      S.phase = "play";
      renderHud();
      renderOverlay();
      return;
    }
    try { setPhase("over"); } catch (e) { try { renderOverlay(); } catch (err) {} }
  }

  function flapBlocked(e) {
    const buy = $("buy-btc");
    if (!buy || buy.classList.contains("hide")) return false;
    const box = buy.getBoundingClientRect();
    const y = e.clientY != null ? e.clientY : (e.touches && e.touches[0] && e.touches[0].clientY);
    return y != null && y >= box.top - 4;
  }

  let flapAt = 0;
  let flapHold = false;
  let flapQueued = false;
  function flap() {
    if (S.phase !== "play" || S.dead || S.spectate || S.finished) return;
    const now = performance.now();
    if (now - flapAt < 20) return;
    flapAt = now;
    const jump = metrics().jump || -280;
    if (flapHold) { flapQueued = true; return; }
    S.bird.v = jump;
    flapHold = true;
    try { if (A && A.sfx && A.sfx.jump) A.sfx.jump(); } catch (e) {}
  }
  function buyBtc() {
    if (S.phase !== "play" || S.cash <= 0 || clampPx(S.price) <= 0 || S.spectate || S.dead || S.finished) return;
    const px = clampPx(S.price);
    const room = btcRoom();
    if (room <= 0) return;
    const spent = Math.min(S.cash, room * px);
    if (spent <= 0) return;
    const got = spent / px;
    creditBtc(got);
    S.cash -= spent;
    S.buys++; S.boughtBtc = true; A.sfx.buy();
    if (!S.aiSilent) {
      const buyLine = drawLine(A.BUY, 0.3);
      if (buyLine) say(buyLine, false, "trade");
      if (S.aibudLit) { S.aibudLit.buy = false; S.aibudLit.sell = false; }
    }
    pop(S.bird.x + 28, S.bird.y - 12, "+" + fmtAmt(got, "btc"), CASH_GREEN, "trade");
    pop(S.bird.x + 28, S.bird.y + 8, "-" + fmtAmt(spent, "usd"), RED, "trade");
    markTrade("buy");
  }
  function sellBtc() {
    if (S.phase !== "play" || S.btc <= 0 || S.spectate || S.dead || S.finished) return;
    const btc = S.btc, usd = btc * S.price;
    S.cash += usd; S.btc = 0; S.sells++;
    if (S.power === "BEAR" || S.swanBear) S.sellsBear = (S.sellsBear || 0) + 1; A.sfx.sell();
    if (!S.aiSilent) {
      const sellLine = drawLine(A.SELL, 0.3);
      if (sellLine) say(sellLine, false, "trade");
      if (S.aibudLit) { S.aibudLit.buy = false; S.aibudLit.sell = false; }
    }
    pop(S.bird.x + 28, S.bird.y - 12, "+" + fmtAmt(usd, "usd"), GREEN, "trade");
    pop(S.bird.x + 28, S.bird.y + 8, "-" + fmtAmt(btc, "btc"), RED, "trade");
    markTrade("sell");
  }
  function buyVt() {
    if (S.phase !== "play" || S.level < 2 || S.cash <= 0 || S.vtPrice <= 0) return;
    const usd = S.cash, got = usd / S.vtPrice;
    S.vt += got; S.cash = 0; S.buys++; A.sfx.buy();
    pop(S.bird.x + 28, S.bird.y - 12, "+" + fmtAmt(got, "vt"), GREEN, "trade");
    pop(S.bird.x + 28, S.bird.y + 8, "-" + fmtAmt(usd, "usd"), RED, "trade");
  }
  function sellVt() {
    if (S.phase !== "play" || S.level < 2 || S.vt <= 0) return;
    const vt = S.vt, usd = vt * S.vtPrice;
    S.cash += usd; S.vt = 0; S.sells++; A.sfx.sell();
    const sellLine = drawLine(A.SELL, 0.3);
    if (sellLine) say(sellLine, false, "trade");
    pop(S.bird.x + 28, S.bird.y - 12, "+" + fmtAmt(usd, "usd"), GREEN, "trade");
    pop(S.bird.x + 28, S.bird.y + 8, "-" + fmtAmt(vt, "vt"), RED, "trade");
  }
  function togglePause() {
    if (S.mp) return;
    if (S.phase === "chance") return;
    if (S.phase === "perk") {
      if (S.optPanel) { S.optPanel = null; renderOverlay(); return; }
      if (S.perkPick) confirmPerk();
      return;
    }
    if (S.phase === "play") { S.optBack = "play"; S.optPanel = null; S.arcHold = false; setPhase("paused"); armWindowLock(); }
    else if (S.phase === "paused") {
      S.optPanel = null;
      S.arcHold = false;
      setPhase(S.optBack || "play");
    }
  }

  function markTrade(kind) {
    if (!S.tapeTrades) S.tapeTrades = [];
    S.tapeTrades.push({ i: (S.tape || []).length, kind, price: clampPx(S.price) });
  }
  function pickPerk(kind) {
    S.perkPick = kind;
    confirmPerk();
  }

  function confirmPerk() {
    if (S.phase !== "perk" || !S.perkPick) return;
    const chained = (S.perkChain | 0) > 0;
    grantPerk(S.perkPick);
    S.perkPick = "";
    S.perkOffers = [];
    if (chained) {
      S.perkChain = (S.perkChain | 0) - 1;
      if (S.perkChain > 0) {
        openPerkOffer("halve", true);
        if (S.phase === "perk") return;
      }
      S.perkChain = 0;
    } else bumpOffer();
    S.perkResume = null;
    S.optPanel = null;
    S.optBack = "play";
    S.arcHold = true;
    setPhase("paused");
  }

  function grantPerk(kind) {
    if (!kind || kind === "skip") return;
    const cap = PERK_MAX[kind] || 10;
    if (kind === "dca") S.have.dca = 1;
    else S.have[kind] = Math.min(cap, (S.have[kind] || 0) + 1);
    S.poolTier[kind] = Math.min(cap, (S.have[kind] || 0) + 1);
    if (kind === "dca") S.dcaOn = false;
    if (kind === "manip" && !S.trend) S.trend = "off";
    if (kind === "juke") fillJukebox();
    if (kind === "job") {
      if (S.jobTrack == null) S.jobTrack = (S.jobOffer != null ? S.jobOffer : ((Math.random() * JOBS.length) | 0));
      S.jobOffer = S.jobTrack;
      assignJob();
    }
    if (kind === "chance") planChanceWindow(S.candles || 0);
    if (kind === "opsec") applyOpsec(S.have.opsec);
  }

  function packCold() {
    while ((S.cold || 0) >= 10) {
      S.cold -= 10;
      S.msig = (S.msig || 0) + 1;
    }
  }

  function applyOpsec(tier) {
    const g = OPSEC_GIFT[Math.max(0, (tier || 1) - 1)] || OPSEC_GIFT[0];
    if (g.cold) S.cold = (S.cold || 0) + g.cold;
    if (g.msig) S.msig = (S.msig || 0) + g.msig;
    packCold();
  }

  function currentJob() {
    const i = S.jobTrack != null ? S.jobTrack : S.jobOffer;
    if (i == null) return null;
    return JOBS[((i % JOBS.length) + JOBS.length) % JOBS.length];
  }

  function jobTitleAt(job, tier) {
    if (!job) return "";
    const es = window.BZ && BZ.lang && BZ.lang() === "es";
    const list = es && job.titlesEs ? job.titlesEs : job.titles;
    return list[Math.max(0, Math.min(list.length - 1, (tier || 1) - 1))] || "";
  }

  function pickJobOffer() {
    if (S.jobTrack != null) { S.jobOffer = S.jobTrack; return; }
    S.jobOffer = (Math.random() * JOBS.length) | 0;
  }

  function assignJob() {
    const t = S.have.job || 0;
    if (t <= 0) { S.jobName = ""; return; }
    if (S.jobTrack == null) S.jobTrack = S.jobOffer != null ? S.jobOffer : ((Math.random() * JOBS.length) | 0);
    S.jobName = jobTitleAt(currentJob(), t);
  }

  function jobPayAt(job, tier) {
    const t = Math.max(1, Math.min(7, tier || 1));
    if (job && job.pay && job.pay[t - 1]) return job.pay[t - 1];
    return 240;
  }

  function jobPay() {
    return jobPayAt(currentJob(), S.have.job || 0);
  }
  function fillJob(text, tierOverride) {
    const job = currentJob();
    const tier = Math.max(1, Math.min(7, tierOverride || S.have.job || 1));
    const es = chanceLang();
    const title = job ? jobTitleAt(job, tier) : (es ? "el puesto" : "the job");
    const career = job ? (es ? (job.nameEs || job.name) : job.name) : (es ? "el trabajo" : "work");
    const pay = jobPayAt(job, tier);
    const half = Math.max(1, Math.round(pay / 2));
    return String(text || "")
      .replace(/\{title\}/g, title)
      .replace(/\{career\}/g, career)
      .replace(/\{pay\}/g, money(pay))
      .replace(/\{half\}/g, money(half))
      .replace(/\{double\}/g, money(pay * 2));
  }

  function payJob() {
    const n = jobPay();
    if (n <= 0) return;
    grantUsd(n, S.bird.x, S.bird.y - 24, "gain");
    const job = currentJob();
    const t = Math.max(1, Math.min(7, S.have.job || 1));
    const titleEn = (job && job.titles && job.titles[t - 1]) || "Job";
    const titleShow = jobTitleAt(job, t) || titleEn;
    sayEn(titleEn + " payday", titleShow + (chanceLang() ? ": día de pago" : " payday"), false);
  }

  function chanceP3(tier) {
    return Math.min(0.72, 0.12 + Math.max(0, tier - 3) * 0.15);
  }

  function planChanceWindow(from) {
    const t = S.have.chance || 0;
    if (t <= 0) { S.chanceAt = []; S.chanceUntil = 0; return; }
    const start = from + 1;
    const end = from + 21;
    const used = {};
    const pick = () => {
      let c, n = 0;
      do { c = start + ((Math.random() * 21) | 0); n++; } while (used[c] && n < 30);
      used[c] = true;
      return c;
    };
    const slots = [pick()];
    if (t >= 2) slots.push(pick());
    if (t >= 3 && Math.random() < chanceP3(t)) slots.push(pick());
    S.chanceAt = slots;
    S.chanceUntil = end;
  }

  function wealthUsd() {
    return Math.max(0, (S.cash || 0) + (S.btc || 0) * clampPx(S.price));
  }
  function holdMoreBtc() {
    const px = clampPx(S.price);
    return px > 0 && Math.max(0, (S.btc || 0) * px) > Math.max(0, S.cash || 0);
  }
  function preferBtcDisplay() {
    if (PRICE_MODE === "btc") return true;
    if (PRICE_MODE === "usd") return false;
    return holdMoreBtc();
  }
  function fmtCostUsd(n) {
    const v = Number(n) || 0;
    const sign = v < 0 ? "-" : "";
    return sign + "$" + Math.round(Math.abs(v)).toLocaleString("en-US");
  }
  function fmtCostBtc(n) {
    const x = Number(n) || 0;
    const a = Math.abs(x);
    const sign = x < 0 ? "-" : "";
    if (a >= 1e12) return sign + (a / 1e12).toFixed(2) + "T BTC";
    if (a >= 1e9) return sign + (a / 1e9).toFixed(2) + "B BTC";
    if (a >= 1e6) return sign + (a / 1e6).toFixed(2) + "M BTC";
    if (a > 0 && a < 0.01) return sign + a.toFixed(4) + " BTC";
    return sign + a.toFixed(2) + " BTC";
  }
  let costAsBtc = null;
  function costLabel(usd) {
    const n = Math.max(0, Number(usd) || 0);
    const px = clampPx(S.price);
    const asBtc = costAsBtc == null ? preferBtcDisplay() : costAsBtc;
    if (asBtc) return fmtCostBtc(px > 0 ? n / px : n);
    return fmtCostUsd(n);
  }
  function payUsd(usdNeed) {
    if (costAsBtc == null) costAsBtc = preferBtcDisplay();
    const asBtc = costAsBtc;
    let left = Math.max(0, Number(usdNeed) || 0);
    const start = left;
    const px = clampPx(S.price);
    const takeBtc = () => {
      if (left <= 1e-6 || px <= 0 || !(S.btc > 0)) return;
      const b = Math.min(S.btc, left / px);
      S.btc = Math.max(0, S.btc - b);
      left -= b * px;
    };
    const takeCash = () => {
      if (left <= 1e-6 || !(S.cash > 0)) return;
      const c = Math.min(S.cash, left);
      S.cash = Math.max(0, S.cash - c);
      left -= c;
    };
    if (asBtc) { takeBtc(); takeCash(); }
    else { takeCash(); takeBtc(); }
    return Math.max(0, start - Math.max(0, left));
  }
  function takeWealthPct(p) {
    const need = wealthUsd() * Math.max(0, Math.min(1, p));
    return payUsd(need);
  }
  function takeCash(n) {
    const got = Math.min(S.cash, Math.max(0, n)); S.cash -= got; return got;
  }
  function takeUsdEquivalent(n) {
    return payUsd(n);
  }
  function grantWealthPct(p) {
    const n = wealthUsd() * Math.max(0, p);
    if (n > 0) grantUsd(n, S.bird.x, S.bird.y - 24, "arc");
    return n;
  }
  function arcPay(n) {
    if (n > 0) grantUsd(n, S.bird.x, S.bird.y - 24, "arc");
  }
  function cutPct(p) {
    return takeWealthPct(p);
  }
  function cutBill(usd) {
    return takeUsdEquivalent(usd);
  }
  function payPlan(usdNeed) {
    const need = Math.max(0, Number(usdNeed) || 0);
    const cash = Math.max(0, S.cash || 0);
    const px = clampPx(S.price);
    const btc = Math.max(0, S.btc || 0);
    const btcUsd = btc * px;
    if (need <= 0.0001) return { cash: 0, btc: 0 };
    if (cash + 1e-6 >= need) return { cash: need, btc: 0 };
    if (btcUsd + 1e-6 >= need) return { cash: 0, btc: px > 0 ? need / px : 0 };
    return { cash: cash, btc: px > 0 ? Math.min(btc, Math.max(0, need - cash) / px) : 0 };
  }
  function formatPayCost(usdNeed) {
    return costLabel(usdNeed);
  }
  function formatSlicePct(p) {
    return costLabel(wealthUsd() * Math.max(0, p));
  }
  function formatBagDelta(before, after) {
    const dCash = (after.cash || 0) - (before.cash || 0);
    const dBtc = (after.btc || 0) - (before.btc || 0);
    const px = clampPx(S.price);
    if (Math.abs(dCash) > 0.49 && Math.abs(dBtc) > 1e-8 && px > 0) {
      const net = Math.abs(dCash + dBtc * px);
      return preferBtcDisplay() ? fmtBtcAmt(net / px) + " BTC" : money(net);
    }
    const bits = [];
    if (Math.abs(dCash) > 0.49) bits.push(money(Math.abs(dCash)));
    if (Math.abs(dBtc) > 1e-8) bits.push(fmtBtcAmt(Math.abs(dBtc)) + " BTC");
    return bits.join(" + ");
  }
  // Peace offer after the declaration: 3–13% of net worth, rolled once per run (saved with S).
  function bcPeacePct() {
    if (!(S.bcPeacePct >= 0.03 && S.bcPeacePct <= 0.13)) S.bcPeacePct = 0.03 + Math.random() * 0.10;
    return S.bcPeacePct;
  }
  function arcCostUsd(card, k) {
    if (card.id === "blocReplies" && k === "a") return wealthUsd() * bcPeacePct();
    const pct = {
      landfill: { a: .25, b: .75 }, nicoWedding: { a: .04, b: .006 }, mexico: { a: .08 },
      phish: { a: .18 }, casino: { a: .1, b: .3 }, poker: { a: .08, b: .25 }, startup: { a: .2 },
      ring: { a: .08, b: .03 }, proposal: { a: .02, c: .01 },
      wedding: { a: .12, b: .05, c: .01 }, honeymoon: { a: .1, b: .06, c: .04 },
      baby: { a: .05, b: .02 }, cousin: { a: .4 }, potluck: { a: .05 }, usedcar: { a: .12 },
      peopleAsking: { a: .03 }, extensionCord: { a: .04 }, obviously: { a: .05 },
      protectIsland: { a: .02 }, citadelQuestion: { a: .08 }
    };
    if (pct[card.id] && pct[card.id][k] != null) return wealthUsd() * pct[card.id][k];
    const bill = {
      pieceWorld: { a: 1800 }, nobodyKnows: { a: 5000 }, stateVisit: { a: 15000, b: 5000 },
      protectIsland: { b: 50000 }, ortegaCalls: { a: 25000 }, school: { a: 300 },
      date: { a: 180, b: 60 }, wine: { b: 17, c: 25 }, tetris: { a: 20 },
      unclemike: { a: 216, b: 180, c: 198 }
    };
    if (card.id === "islandInspection" && k === "a") return S.bcIslandOffer || 0;
    if (bill[card.id] && bill[card.id][k] != null) return bill[card.id][k];
    return null;
  }
  function arcOptionLabel(card, o, es) {
    if (o.hideCost) return es ? (o.labelEs || o.label) : o.label;
    let lab = es ? (o.labelEs || o.label) : o.label;
    lab = lab.replace(/\s*·\s*\d+(?:\.\d+)?%\s*(?:of net worth|del patrimonio)?/gi, "");
    lab = lab.replace(/\s+\d+(?:\.\d+)?%\s+of net worth/gi, "");
    lab = lab.replace(/\s+\d+(?:\.\d+)?%\s+del patrimonio/gi, "");
    lab = lab.replace(/\s*·\s*\$[\d,]+(?:\.\d+)?/g, "");
    lab = lab.replace(/\s+\d+(?:\.\d+)?%\s*$/g, "");
    lab = lab.replace(/\s+·\s*$/g, "").trim();
    if (card.id === "landfill" && (o.k === "a" || o.k === "b")) {
      return lab + " · " + formatSlicePct(o.k === "b" ? 0.75 : 0.25);
    }
    if (card.id === "anOffer" && o.k === "a") {
      return lab + " · +" + formatPayCost(wealthUsd() * 0.35);
    }
    const usd = arcCostUsd(card, o.k);
    if (usd != null && usd > 0) return lab + " · " + formatPayCost(usd);
    return lab;
  }
  function chanceLang() {
    return window.BZ && BZ.lang && BZ.lang() === "es";
  }
  const CHANCE_CAST = {
    lena: {
      names: ["Lena"],
      en: ["Lena, the love of your life", "Lena, who still calls you Fartface", "Lena, your person since the cheap-rent years"],
      es: ["Lena, el amor de tu vida", "Lena, la que todavía te dice Cara de Pedo", "Lena, tu compañera desde los años de alquiler barato"]
    },
    paco: {
      names: ["Paco"],
      en: ["Paco, your French bulldog", "Paco, who votes by eating the brochure", "Paco, who sits under the leak on purpose"],
      es: ["Paco, tu bulldog francés", "Paco, el que vota comiéndose el folleto", "Paco, el que se sienta bajo la gotera a propósito"]
    },
    marek: {
      names: ["Marek"],
      en: ["Marek, your friend who always has wine on the table", "Marek, who talks like certainty is optional", "Marek, who takes you to machines in the back of bars"],
      es: ["Marek, tu amigo que siempre tiene vino en la mesa", "Marek, el que habla como si la certeza fuera opcional", "Marek, el que te lleva a las máquinas del fondo del bar"]
    },
    nico: {
      names: ["Nico"],
      en: ["Nico, your cousin", "Nico, who always has three things going before lunch", "Nico, family by blood and by group chat"],
      es: ["Nico, tu primo", "Nico, el que siempre tiene tres proyectos en marcha antes del mediodía", "Nico, familia de sangre y de chat grupal"]
    },
    sofi: {
      names: ["Sofi"],
      en: ["Sofi, Nico's daughter", "Sofi, Nico's kid who sends photos you cannot parse", "Sofi, who treats you like an uncle"],
      es: ["Sofi, la hija de Nico", "Sofi, la hija de Nico que manda fotos que no entiendes", "Sofi, la que te trata como a un tío"]
    },
    hector: {
      names: ["Uncle Héctor", "Uncle Hector", "tío Héctor", "Tío Héctor", "El tío Héctor", "el tío Héctor"],
      en: ["Uncle Héctor, your mother's brother", "Uncle Héctor, who wires money with no explanation", "Uncle Héctor, family from your mother's side"],
      es: ["El tío Héctor, el hermano de tu mamá", "El tío Héctor, el que transfiere dinero sin explicar", "El tío Héctor, familia del lado de tu mamá"]
    },
    mike: {
      names: ["Uncle Mike", "tío Mike", "Tío Mike"],
      en: ["Uncle Mike, who treats a tip line like a debate stage", "Uncle Mike, in town for one dinner", "Uncle Mike, family who studies the check first"],
      es: ["El tío Mike, el que trata la propina como un debate", "El tío Mike, de paso por una cena", "El tío Mike, familia que mira la cuenta primero"]
    }
  };
  const CHANCE_WHO = {
    landfill: ["nico", "lena"], taxbill: [], nicoWedding: ["nico", "lena", "paco"], mexico: ["lena", "paco"],
    flu: ["lena", "paco"], phish: [], crash: [], casino: ["nico"], poker: ["marek"],
    uncle: ["hector"], school: ["sofi", "lena"], roof: ["paco"],
    hospital: ["lena"], startup: ["nico"], tow: [], courage: ["marek", "lena"],
    ring: ["lena"], date: ["lena"], proposal: ["lena"], wedding: ["lena", "nico", "paco"],
    honeymoon: ["lena", "paco"], pregnancy: ["lena"], baby: ["lena", "paco"], cousin: ["nico"],
    speeding: [], wallet: [], potluck: ["lena", "paco"], usedcar: ["nico"], tetris: ["marek"], chess: ["marek"],
    unclemike: ["mike"]
  };
  function cleanCountryName(raw){
    return String(raw||"").replace(/[<>&"'`]/g,"").replace(/\s+/g," ").trim().slice(0,24);
  }
  function nationName(){
    return cleanCountryName(S.bcCountryName) || "Bitcoin Country";
  }
  function stampNation(text){
    const name=nationName();
    if(!text) return "";
    if(name==="Bitcoin Country") return String(text);
    return String(text).replace(/Bitcoin Country/g, name);
  }
  function askCountryName(){
    S.bcNameAsk=true;
    S.optPanel=null;
    S.arcHold=false;
    S.optBack="play";
    if(S.phase!=="chance") setPhase("chance");
    else { try{ renderOverlay(); }catch(e){} }
  }
  function commitCountryName(raw){
    const name=cleanCountryName(raw);
    const input=$("bc-name-in");
    if(!name){ if(input) input.classList.add("bad"); return; }
    S.bcCountryName=name;
    S.bcNameAsk=false;
    S.bcIndependent=true;
    if(!S.chanceUsed) S.chanceUsed={};
    S.chanceUsed.theQuestion=true;
    noteArcSeen("theQuestion");
    S.optPanel=null;
    const card=(S.chanceCard&&S.chanceCard.id==="theQuestion")?S.chanceCard:{id:"theQuestion"};
    closeArc(card);
  }
  function weaveCast(text) { return text; }
  const CHANCE_TLDR = {
    justInCase: { en: "A new emergency law widens government power whenever the economy looks unstable. They call it temporary. The definition seems to cover most years.", es: "Una nueva ley de emergencia amplía las facultades del Estado ante la inestabilidad económica. La llaman temporal, aunque la definición parece abarcar casi todos los años." },
    nothingToHide: { en: "An optional digital ID spreads to airports, banks, and public services. A TV host asks what the problem is.", es: "Un documento digital opcional se extiende a aeropuertos, bancos y servicios públicos. Un presentador pregunta cuál es el problema." },
    somethingBetter: { en: "On a run with Marek you say that, with enough money, you could build something better than a company or a charity. You do not yet know what.", es: "Mientras corres con Marek, dices que con suficiente dinero podrías construir algo mejor que una empresa o una organización benéfica. Aún no sabes qué sería." },
    timeTraveler: { en: "An old post claims to be from a future of citadels. A search turns up a self-published book, THE BITCOIN STATE, for $666.", es: "Una publicación antigua describe un futuro de ciudadelas y gobiernos debilitados. La búsqueda te lleva a un libro autoeditado, THE BITCOIN STATE, por $666." },
    temporaryMeasures: { en: "A financial emergency brings transfer limits and payment apps that stop working. Officials promise ninety days; the previous temporary measures are entering their fourth year.", es: "Una emergencia financiera impone límites a las transferencias y al efectivo, y varias aplicaciones de pago dejan de funcionar. Las autoridades prometen noventa días; las medidas temporales anteriores están por cumplir cuatro años." },
    citadelProblem: { en: "You tell Marek you want to build a country. He laughs, then asks how much land, and adds a flag to your list.", es: "Le dices a Marek que quieres construir un país. Se ríe, pero luego pregunta cuánta tierra y agrega una bandera a tu lista." },
    pieceWorld: { en: "Nico finds a listing for an isolated island that calls itself a sovereign opportunity. It is not sovereign.", es: "Nico encuentra el anuncio de una isla aislada que se presenta como una oportunidad para una vida soberana. La isla no es soberana." },
    islandInspection: { en: "At sunrise the island is more beautiful than the listing. At sunset the seller's offer arrives.", es: "Al amanecer, la isla resulta más hermosa que en el anuncio. Después de recorrerla, al atardecer llega la oferta del vendedor." },
    paperwork: { en: "Lawyers turn the purchase into something that looks serious. Nico signs in the wrong place. Paco eats a corner of the last page.", es: "Los abogados formalizan la compra. Nico firma donde no corresponde y Paco se come una esquina del documento final." },
    nobodyKnows: { en: "You have land and paperwork, and almost no reason for anyone to care. The only name you are given is Madame Luck.", es: "Tienes tierra y documentos, pero aún no tienes ciudadanos, reconocimiento ni atención. La única pista es Madame Luck." },
    theOg: { en: "Madame Luck asks very good questions, says she will tell some people, and your phone starts vibrating.", es: "Madame Luck hace preguntas muy acertadas, dice que hablará del proyecto con algunas personas y tu teléfono empieza a vibrar." },
    peopleAsking: { en: "People ask if they can move in. Nico makes a spreadsheet. There are no houses.", es: "Desarrolladores, mineros y familias quieren mudarse a la isla. Nico organiza los nombres, pero Marek señala que no hay viviendas." },
    extensionCord: { en: "The new residents bring more machines than the island can feed. The lights go out. Someone asks who was mining.", es: "Los nuevos residentes conectan más equipos de los que la isla puede abastecer. La energía se corta y alguien pregunta quién estaba minando." },
    obviously: { en: "The grid works. Nico says you should mine Bitcoin. The proposal is four words: cheap power, we mine.", es: "La red eléctrica funciona y Nico propone minar Bitcoin. Su propuesta se resume en cuatro palabras: energía barata, minamos Bitcoin." },
    principality: { en: "A micro-state of 614 claimed citizens writes to propose diplomatic relations.", es: "Un microestado de 614 ciudadanos declarados te escribe para proponer relaciones diplomáticas." },
    stateVisit: { en: "San Arnaldo, whose government sits in a former restaurant, asks for a Bitcoin node; you could gain your first ally.", es: "San Arnaldo, cuyo gobierno funciona en un antiguo restaurante, pide un nodo de Bitcoin; podrías ganar tu primer aliado." },
    firstBloc: { en: "Germany, France, Italy, Spain, the Netherlands, Belgium, and Austria form the Meridian Stability Pact. Its language is administrative; its restrictions are not optional.", es: "Alemania, Francia, Italia, España, los Países Bajos, Bélgica y Austria forman el Pacto de Estabilidad Meridiano. Su lenguaje es administrativo, pero sus restricciones no son opcionales." },
    protectIsland: { en: "A boat disappears from the dock overnight. One camera caught nothing, and Paco slept through it. The island now needs a security plan.", es: "Un bote desaparece del muelle durante la noche. La única cámara no registró nada y Paco no despertó. La isla necesita un plan de seguridad." },
    placeNow: { en: "At fifty nodes, the island gains a coffee shop, a bakery, a bar, and a newspaper. Its first editorial criticizes you. Nico calls that progress.", es: "Al alcanzar cincuenta nodos, la isla ya tiene cafetería, panadería, bar y periódico. Su primer editorial te critica. Nico considera que eso es progreso." },
    citadelQuestion: { en: "Marek proposes a citadel with protected power, walls, and a hardened center. It could defend the community, but it would also turn their home into a fortress.", es: "Marek propone una ciudadela con energía protegida, muros y un centro reforzado. Podría defender a la comunidad, pero también convertiría su hogar en una fortaleza." },
    rearmament: { en: "The Meridian Pact announces a frigate program and calls it maintenance. Russia, Belarus, China, North Korea, and Cuba answer by forming the Red Ledger Compact. Both blocs begin building warships.", es: "El Pacto Meridiano anuncia un programa de fragatas y lo llama mantenimiento. Rusia, Bielorrusia, China, Corea del Norte y Cuba responden con el Compacto del Libro Rojo. Ambos bloques comienzan a construir buques de guerra." },
    anOffer: { en: "A private consortium offers {offer} for the island and everything built on it. Selling would secure the profit and end Bitcoin Country. Madame Luck asks why you began.", es: "Un consorcio privado ofrece {offer} por la isla y todo lo construido en ella. Vender aseguraría la ganancia y pondría fin a Bitcoin Country. Madame Luck pregunta por qué comenzaste." },
    ambassador: { en: "An ambassador makes an unofficial visit, inspects the island, and leaves a direct number. If Bitcoin Country becomes more than a project, she wants the first call.", es: "Una embajadora realiza una visita extraoficial, recorre la isla y deja un número directo. Si Bitcoin Country se convierte en algo más que un proyecto, quiere recibir la primera llamada." },
    threeColors: { en: "Saudi Arabia, Jordan, Morocco, Thailand, and Brunei form the Crown Lattice, the third bloc surrounding Bitcoin Country. To High Warden Soren Pell, a people who will not kneel is an administrative error.", es: "Arabia Saudita, Jordania, Marruecos, Tailandia y Brunéi forman la Celosía de la Corona, el tercer bloque que rodea a Bitcoin Country. Para el Alto Guardián Soren Pell, un pueblo que no se arrodilla es un error administrativo." },
    ortegaCalls: { en: "Mr Ortega & Gambette has a ninety-three-page diplomatic package covering recognition, treaties, fisheries, and protocol. He offers the complete service, or a shorter review that may still help.", es: "El señor Ortega & Gambette ofrece un paquete diplomático de 93 páginas sobre reconocimiento, tratados, pesca y protocolo. Ofrece el servicio completo, aunque una revisión más breve también podría ayudar." },
    theQuestion: { en: "Land, power, water, people, money, rules, security, and recognition are checked off, or close enough. Only one line remains: independence. Declaring it will turn the project into a country—and make the three blocs respond.", es: "Tierra, energía, agua, población, dinero, normas, seguridad y reconocimiento ya están marcados, o casi. Solo queda una línea: independencia. Declararla convertirá el proyecto en un país y obligará a los tres bloques a responder." },
    cabinet: { en: "Bitcoin Country forms its first cabinet: you become Head of State, Marek takes Finance, Nico takes Commerce, and Paco becomes Minister of Defense. Madame Luck declines a ministry.", es: "Bitcoin Country forma su primer gabinete: asumes la jefatura de Estado, Marek asume Finanzas, Nico se encarga de Comercio y Paco se convierte en ministro de Defensa. Madame Luck rechaza un ministerio." },
    declaration: { en: "The declaration is signed and published. San Arnaldo recognizes Bitcoin Country thirty-seven seconds later. Ortega replies with a thumbs-up and a fourteen-page protocol memo.", es: "La declaración queda firmada y publicada. San Arnaldo reconoce a Bitcoin Country 37 segundos después. Ortega responde con un pulgar arriba y un memorando de protocolo de 14 páginas." },
    theAnswer: { en: "The blocs use different words, but their answer is the same: Bitcoin Country will not be allowed to stand outside their map. Their fleets are already moving.", es: "Los bloques usan palabras distintas, pero su respuesta es la misma: no permitirán que Bitcoin Country permanezca fuera de su mapa. Sus flotas ya están en movimiento." },
    fourthColor: { en: "All three blocs attacked and failed. The island still stands: Bitcoin Country is independent.", es: "Los tres bloques atacaron y fracasaron. La isla sigue en pie: Bitcoin Country es independiente." },
    notYet: { en: "The defense collapses, Bitcoin Country loses the island, and the run ends.", es: "La defensa colapsa, Bitcoin Country pierde la isla y la partida termina." },
    landfill: { en: "At 1:14 a.m., Nico wants a partner to dig up a hard drive that supposedly holds 8,000 BTC. Lena threatens to call you Fartface if you fund it.", es: "A la 1:14 a. m., Nico busca un socio para desenterrar un disco duro que supuestamente guarda 8000 BTC. Lena amenaza con llamarte Cara de Pedo si lo financias." },
    taxbill: { en: "The quarterly tax bill arrives. You check the total twice in case it was blurry. It was not.", es: "Llega la factura trimestral de impuestos. Revisas el total dos veces por si estaba borroso. No lo estaba." },
    nicoWedding: { en: "At Nico's 400-guest wedding, you recognize twelve people. Lena warns you about his schemes before you choose a gift.", es: "En la boda de Nico hay 400 invitados y solo reconoces a doce. Lena te advierte sobre sus planes antes de que elijas un regalo." },
    mexico: { en: "Lena wants five days in Tulum; you would settle for three. Paco has already voted.", es: "Lena quiere cinco días en Tulum; a ti te alcanzan tres. Paco ya votó." },
    flu: { en: "Lena wakes with the flu. You spend the day bringing her water, medicine, and soup; Paco quietly eats half the soup.", es: "Lena despierta con gripe. Pasas el día llevándole agua, medicinas y sopa; Paco se come la mitad de la sopa sin que ella lo note." },
    phish: { en: "Support emails you about a problem with your account. To verify your identity, it asks you to enter your seed phrase.", es: "Soporte te escribe por un problema con tu cuenta. Para verificar tu identidad, te pide ingresar tu frase semilla." },
    crash: { en: "A delivery rider bumps your car at a red light and apologizes six times. You apologize twice without knowing why.", es: "Un repartidor en moto te choca el auto en un semáforo y se disculpa seis veces. Tú te disculpas dos, sin saber por qué." },
    wine: { en: "Friday at Marek's is wine and 12 Monkeys on pause. The talk turns to A.I., as usual. Neither of you wins.", es: "Una noche de vino y 12 Monkeys en casa de Marek termina en otra discusión sobre la IA y el futuro. Ninguno convence al otro." },
    casino: { en: "Nico calls late. He found a table at a casino and has already decided the game is interesting.", es: "Nico llama tarde desde un casino y ya eligió un juego. Deberías hacer más preguntas, pero vas igual." },
    poker: { en: "Marek invites you to a late poker game with people he knows. It is not a casino. He nods at the empty chair: are you playing?", es: "Marek te invita a una partida de póker de madrugada con gente conocida. No es un casino. Señala la silla vacía: ¿juegas?" },
    uncle: { en: "Uncle Héctor wires you money and refuses to say why.", es: "El tío Héctor te transfiere dinero y se niega a decir por qué." },
    school: { en: "Nico's daughter Sofi has a school trip to the Mint Museum, and money is tight at home. Lena wants you to chip in.", es: "Sofi, la hija de Nico, tiene una excursión al museo de la Casa de Moneda y en su casa no alcanza. Lena quiere que ayudes." },
    roof: { en: "Paco finds the leak and sits under it. When the workers arrive, he finds another place to sit.", es: "Paco encuentra la gotera y se sienta debajo. Cuando llegan los reparadores, busca otro lugar donde sentarse." },
    hospital: { en: "You need stitches. Lena drives you to the hospital and, on the way home, tells you not to bleed on anything.", es: "Necesitas puntos de sutura. Lena te lleva al hospital y, de regreso, te pide que no sangres sobre nada." },
    startup: { en: "Nico has a long deck for an app that mixes subscriptions, A.I., and something he calls community ownership. He says the upside is enormous.", es: "Nico preparó una presentación para una app que combina suscripciones, IA y propiedad comunitaria. Dice que el potencial de ganancias es enorme." },
    tow: { en: "A nine-minute coffee stop in a no-parking zone ends with a ticket and a tow truck idling behind your car.", es: "Una parada de nueve minutos por un café en zona prohibida termina en multa, con una grúa esperando detrás." },
    courage: { en: "At Marek's, with 12 Monkeys paused, you mention Lena. He says you may be waiting for certainty, then presses play.", es: "En casa de Marek, con 12 Monkeys en pausa, mencionas a Lena. Dice que tal vez esperas certeza absoluta y reanuda la película." },
    ring: { en: "You are in the jewelry store, and you know why. You do not know which diamond looks responsible.", es: "Estás en la joyería y sabes por qué. No sabes qué diamante te hace ver responsable." },
    date: { en: "The ring is in your pocket and Lena is waiting by the door. Dinner first, then the lake at sunset. Even Paco is behaving, which feels suspicious.", es: "El anillo está en tu bolsillo y Lena espera junto a la puerta. Primero la cena, después el lago al atardecer. Hasta Paco se porta bien, lo cual resulta sospechoso." },
    proposal: { en: "The lake is getting dark and the ring is in your pocket. You have not asked yet.", es: "El lago se oscurece y el anillo está en tu bolsillo. Todavía no hiciste la pregunta." },
    wedding: { en: "You and Lena are getting married, and every detail turns into a negotiation she wins.", es: "Lena y tú se van a casar, y cada detalle se vuelve una negociación que gana ella." },
    honeymoon: { en: "You and Lena leave with one rule: no checking the portfolio. She takes your phone. There are three possible trips.", es: "Se van de viaje con una sola regla: no revisar el portafolio. Ella te quita el teléfono. Hay tres viajes posibles." },
    pregnancy: { en: "Two lines on a test: you and Lena are having a baby. Paco yawns. You look at him and say, “Four.”", es: "Dos líneas en una prueba: Lena y tú van a tener un bebé. Paco bosteza. Lo miras y dices: “Cuatro”." },
    baby: { en: "The baby arrives. Everyone is tired, including Paco. You start thinking about the future you want.", es: "Llega el bebé. Todos están cansados, incluido Paco. Empiezas a pensar en el futuro que quieres." },
    cousin: { en: "Nico found FridayCoin ($FRY) and swears it will multiply by Friday. What it does is not the important part, he says.", es: "Nico encontró FridayCoin ($FRY) y jura que multiplicará su valor para el viernes. Según él, lo que hace no es lo importante." },
    speeding: { en: "Six miles per hour over the limit, on the same corner, with the same officer. He recognizes you before you lower the window.", es: "Diez kilómetros por hora por encima del límite, en la misma esquina y con el mismo oficial. Te reconoce antes de que bajes la ventanilla." },
    wallet: { en: "You forget your wallet on the bus and get it back at the terminal, minus the cash.", es: "Olvidas la billetera en el autobús y la recuperas en la terminal, sin el efectivo." },
    potluck: { en: "Lena signs you and Paco up for the neighborhood potluck. He eats half of what you brought before you arrive.", es: "Lena los anota a ti y a Paco en la comida comunitaria del vecindario. Paco se come la mitad de lo que prepararon antes de llegar." },
    usedcar: { en: "Nico has found a 2009 Honda Fit. He looks under the hood, sees Sharpie, and calls it basically new.", es: "Nico encontró un Honda Fit 2009. Mira debajo del capó, ve una marca de Sharpie y lo considera básicamente nuevo." },
    tetris: { en: "Marek takes you to a bar with a Tetris cabinet nobody uses. He plays, then says it is your turn.", es: "Marek te lleva a un bar con una máquina de Tetris que nadie usa. Juega un rato y luego te cede el turno." },
    chess: { en: "Marek sets up a famous historical chess position and offers a bitcoin if you find the winning move. A miss costs nothing.", es: "Marek arma una posición histórica famosa y te ofrece un bitcoin si encuentras la jugada ganadora. Fallar no cuesta nada." },
    unclemike: { en: "Dinner with Uncle Mike is excellent until the check. He will not tip, because he thinks the restaurant should pay its staff. The waiter is still standing there.", es: "La cena con el tío Mike es excelente hasta que llega la cuenta. Se niega a dejar propina porque cree que el restaurante debería pagarle sueldos dignos a los empleados. El mesero sigue esperando de pie." },

  };
  function cardTldr(card) {
    if (!card) return "";
    if (card.id === "blocReplies" || card.id === "blocAssault" || card.id === "blocTriumph" || card.id === "battleWon") return stampNation(warTldr(card.id));
    if (card.id === "firstBloc" || card.id === "rearmament" || card.id === "threeColors") return stampNation(blocIntroTldr(card.id, chanceLang()));
    if (card.id === "chess") { const cp = chessProblem(); return chanceLang() ? cp.tldrEs : cp.tldr; }
    const row = card.tldr || CHANCE_TLDR[card.id];
    if (!row) return "";
    let line = chanceLang() ? (row.es || row.en) : row.en;
    if (card.job) line = fillJob(line, card.jobTier);
    if (line.indexOf("{offer}") >= 0) line = line.replace(/\{offer\}/g, S.bcOfferTxt || formatPayCost(wealthUsd() * 1.35));
    if (line.indexOf("{gift}") >= 0) {
      const gift = S.arcPending ? formatBagDelta(bagSnap(), S.arcPending) : "";
      if (gift) line = line.replace(/\{gift\}/g, gift);
      else if (card.id === "uncle") line = chanceLang()
        ? "El tío Héctor te transfiere dinero y se niega a decir por qué."
        : "Uncle Héctor wires you money and refuses to say why.";
      else line = line.replace(/\s*(It is|Son)\s*\{gift\}\.?/g, "").replace(/:\s*\{gift\}/g, "").replace(/\{gift\}/g, "").replace(/\s+/g, " ").trim();
    }
    return stampNation(line);
  }
  function bodyIsLong(text) {
    const s = String(text || "");
    return s.length >= 220 || s.split(/\n+/).filter(Boolean).length >= 4;
  }
  const JOB_ARC_MILESTONES = [2, 4, 6];
  const JOB_ARC_STORIES = [{"slug":"acting","cards":[{"tier":2,"title":"The Missing Cue","titleEs":"La entrada perdida","body":"On opening night, the cue sheet skips a page just before {title} enters. You listen for the breath before the line and carry the scene. The director asks you to teach the company how.","bodyEs":"En el estreno, el libreto técnico salta una página justo antes de la entrada de {title}. Esperas la respiración previa a la frase y sostienes la escena. El director te pide que enseñes al elenco cómo lo resolviste.","tldr":"A missed stage cue becomes a lesson for the company.","tldrEs":"Una entrada perdida se convierte en una lección para el elenco."},{"tier":4,"title":"One Quiet Take","titleEs":"Una toma en silencio","body":"The sound cart dies during the festival film's final setup. As {title}, you keep the camera rolling and play the scene without its planned line. The editor says the silence tells the story better.","bodyEs":"El sonido falla durante la última escena de la película del festival. Como {title}, mantienes la cámara grabando y haces la escena sin la frase prevista. La editora dice que el silencio cuenta mejor la historia.","tldr":"A sound failure improves the scene when you keep filming.","tldrEs":"Una falla de sonido mejora la escena cuando decides seguir filmando."},{"tier":6,"title":"The Stunt Delay","titleEs":"El retraso de la escena","body":"A delayed rig leaves the blockbuster setup without its stunt performer. As {title}, you reset the scene and give the crew a safer mark, keeping production moving without taking a risk that is not yours.","bodyEs":"Un retraso del equipo deja la escena del éxito de taquilla sin especialista. Como {title}, reorganizas la escena y marcas una posición más segura, sin asumir un riesgo que no te corresponde.","tldr":"You keep a film set moving while protecting the stunt crew.","tldrEs":"Mantienes el rodaje en marcha y proteges al equipo de especialistas."}]},{"slug":"diving","cards":[{"tier":2,"title":"The Mooring Line","titleEs":"La línea de amarre","body":"A workboat keeps drifting from its berth. As {title}, you find an old mooring line caught beneath a piling and bring it up before the next tide. The harbor master stops calling your dives practice.","bodyEs":"Una lancha de trabajo se aleja una y otra vez de su amarre. Como {title}, encuentras una línea enganchada bajo un pilote y la sacas antes de la siguiente marea. El jefe del puerto deja de llamar prácticas a tus inmersiones.","tldr":"You find the snagged line that kept a workboat drifting.","tldrEs":"Encuentras la línea enganchada que hacía derivar una lancha."},{"tier":4,"title":"The Pressure Check","titleEs":"La revisión de presión","body":"The intake-frame weld looks sound from shore, but the gauge twitches underwater. As {title}, you stop the repair and find a hairline leak before the pump goes back online.","bodyEs":"La soldadura del marco de entrada parece firme desde la costa, pero el medidor vibra bajo el agua. Como {title}, detienes la reparación y encuentras una fuga mínima antes de reiniciar la bomba.","tldr":"A restless gauge reveals a leak before the pump restarts.","tldrEs":"Un medidor inestable revela una fuga antes de reiniciar la bomba."},{"tier":6,"title":"The Wreck Map","titleEs":"El mapa del naufragio","body":"The survey team loses its bearing where the wreck splits into two dark passages. As {title}, you mark the current against the hull, guide the divers back to the entry line, and save the survey slate.","bodyEs":"El equipo pierde el rumbo donde el naufragio se divide en dos pasajes oscuros. Como {title}, marcas la corriente junto al casco, guías a los buzos hasta la línea de entrada y salvas la tablilla de registro.","tldr":"You guide a survey team out of a split passage and save its records.","tldrEs":"Guías al equipo fuera del pasaje y salvas sus registros."}]},{"slug":"science","cards":[{"tier":2,"title":"The Labeled Control","titleEs":"La muestra de control","body":"A result looks extraordinary until you notice the control tube has yesterday's label. As {title}, you rerun the samples before anyone writes the headline. The corrected result is smaller, but sound.","bodyEs":"Un resultado parece extraordinario hasta que notas que el tubo de control tiene la etiqueta de ayer. Como {title}, repites las pruebas antes de que alguien redacte el anuncio. El resultado es menos llamativo, pero confiable.","tldr":"You catch a mislabeled control before the lab publishes a false result.","tldrEs":"Detectas una muestra mal rotulada antes de publicar un resultado falso."},{"tier":4,"title":"The Drifting Instrument","titleEs":"El instrumento descalibrado","body":"Three runs disagree by the same small amount. As {title}, you trace the difference to a drifting calibration lamp, not the samples. The corrected series answers the team's real question.","bodyEs":"Tres pruebas discrepan por el mismo margen pequeño. Como {title}, descubres que la causa es una lámpara de calibración inestable, no las muestras. La serie corregida responde la pregunta del equipo.","tldr":"You trace a repeated discrepancy to a calibration fault.","tldrEs":"Encuentras una falla de calibración detrás de una discrepancia repetida."},{"tier":6,"title":"The Freezer Alarm","titleEs":"La alarma del congelador","body":"A brief power dip trips the archive freezer alarm after the night crew has left. As {title}, you move the vulnerable samples to backup storage and log the temperature excursion before morning.","bodyEs":"Una breve caída de tensión activa la alarma del congelador cuando el turno nocturno ya se fue. Como {title}, trasladas las muestras más vulnerables al respaldo y registras la variación antes de la mañana.","tldr":"You protect archived samples after a power interruption.","tldrEs":"Proteges las muestras archivadas tras un corte de energía."}]},{"slug":"law","cards":[{"tier":2,"title":"The Filing Date","titleEs":"La fecha de presentación","body":"The hearing packet is ready, but a service receipt is dated one day late. As {title}, you compare the docket against the courier log and catch the mismatch before it reaches the judge.","bodyEs":"El expediente está listo, pero un comprobante de notificación tiene una fecha con un día de diferencia. Como {title}, comparas el registro judicial con el del mensajero y detectas el error antes de que llegue al juez.","tldr":"You catch a date mismatch before filing the hearing packet.","tldrEs":"Detectas una fecha incorrecta antes de presentar el expediente."},{"tier":4,"title":"The Missing Witness","titleEs":"El testigo ausente","body":"A witness changes the meeting time on trial morning. As {title}, you rebuild the sequence from the call log, tell the court what can be verified, and keep the argument inside the facts.","bodyEs":"Un testigo cambia la hora de la reunión la mañana del juicio. Como {title}, reconstruyes la secuencia con el registro de llamadas, informas qué puede verificarse y mantienes el argumento dentro de los hechos.","tldr":"You rebuild the timeline when a witness changes their account.","tldrEs":"Reconstruyes la cronología cuando un testigo cambia su versión."},{"tier":6,"title":"The Settlement Room","titleEs":"La sala de negociación","body":"Both sides bring a draft that solves the loudest problem and hides the expensive one. As {title}, you point out the overlooked term, explain its cost, and give your client room to decide.","bodyEs":"Ambas partes presentan un borrador que resuelve el problema más visible y oculta el más costoso. Como {title}, señalas la cláusula olvidada, explicas su costo y dejas que tu cliente decida.","tldr":"You surface a costly term and give your client a clear choice.","tldrEs":"Señalas una cláusula costosa y das a tu cliente una decisión clara."}]},{"slug":"culinary","cards":[{"tier":2,"title":"The Dead Burner","titleEs":"El quemador averiado","body":"The dinner rush starts just as one burner goes cold. As {title}, you rearrange the pans, call the delay early, and serve every table without sending out undercooked fish.","bodyEs":"El servicio empieza justo cuando falla un quemador. Como {title}, reorganizas las sartenes, avisas la demora a tiempo y atiendes todas las mesas sin servir pescado a medio cocinar.","tldr":"You reorganize service around a failed burner.","tldrEs":"Reorganizas el servicio tras la falla de un quemador."},{"tier":4,"title":"The Allergy Ticket","titleEs":"La orden por alergia","body":"A regular dish comes back with an allergy note the kitchen has not seen. As {title}, you stop the plate, check every sauce, and remake the order on a clean station.","bodyEs":"Una orden habitual vuelve con una nota de alergia que la cocina no había visto. Como {title}, detienes el plato, revisas cada salsa y preparas la orden en una estación limpia.","tldr":"You catch an allergy note and remake the dish safely.","tldrEs":"Detectas una alergia y preparas el plato de forma segura."},{"tier":6,"title":"The Galley in Weather","titleEs":"La cocina con mal tiempo","body":"The yacht rolls hard as the weather closes in. As {title}, you secure the hot pans, switch to a meal that can be served in a calmer interval, and keep the crew fed safely.","bodyEs":"El yate se balancea con fuerza cuando empeora el tiempo. Como {title}, aseguras las sartenes calientes, cambias a un plato que puede servirse durante la pausa y alimentas al equipo sin riesgos.","tldr":"You adapt the galley service to rough seas.","tldrEs":"Adaptas el servicio de cocina al oleaje."}]},{"slug":"aviation","cards":[{"tier":2,"title":"The Short Strip","titleEs":"La pista corta","body":"Weather closes the ridge route while a survey crew waits at the far strip. As {title}, you check the wind against the short runway, call the diversion early, and land with fuel to spare.","bodyEs":"El clima cierra la ruta sobre la sierra mientras un equipo espera en la pista remota. Como {title}, comparas el viento con la pista corta, decides desviarte a tiempo y aterrizas con combustible de sobra.","tldr":"You divert early when weather closes the short runway.","tldrEs":"Te desvías a tiempo cuando el clima cierra la pista corta."},{"tier":4,"title":"The Go-Around","titleEs":"La aproximación frustrada","body":"The runway appears through the rain, but a crosswind is pushing the aircraft off center. As {title}, you call a go-around before landing becomes a correction, then brief the crew for another approach.","bodyEs":"La pista aparece entre la lluvia, pero el viento cruzado desplaza el avión del centro. Como {title}, ordenas frustrar la aproximación antes de tener que corregir el aterrizaje y preparas al equipo para intentarlo otra vez.","tldr":"You reject an unstable approach and prepare a safer landing.","tldrEs":"Interrumpes una aproximación inestable y preparas un aterrizaje más seguro."},{"tier":6,"title":"The Medical Diversion","titleEs":"El desvío médico","body":"A passenger becomes seriously ill halfway across the ocean. As {title}, you compare nearby airports, coordinate with the cabin crew, and divert while the medical team is still on the line.","bodyEs":"Un pasajero se enferma gravemente a mitad del cruce oceánico. Como {title}, comparas los aeropuertos cercanos, coordinas con la tripulación de cabina y cambias el rumbo mientras el equipo médico sigue en línea.","tldr":"You coordinate a medical diversion before the passenger worsens.","tldrEs":"Coordinas un desvío médico antes de que empeore el pasajero."}]},{"slug":"music","cards":[{"tier":2,"title":"The Silent Ballroom","titleEs":"El salón sin sonido","body":"The ballroom loses power between the first dance and the speeches. As {title}, you move the band closer, switch to an unplugged set, and give the venue time to restore the lights.","bodyEs":"El salón se queda sin electricidad entre el primer baile y los discursos. Como {title}, acercas a la banda, cambias a un repertorio acústico y das tiempo al lugar para restablecer la luz.","tldr":"You keep a wedding set going through a power outage.","tldrEs":"Mantienes la música de una boda durante un corte de luz."},{"tier":4,"title":"The Wrong Chart","titleEs":"La partitura equivocada","body":"The touring set begins in a new key, but the chart on your stand is yesterday's arrangement. As {title}, you follow the singer's cue and bring the band back together before the chorus.","bodyEs":"El concierto empieza en una tonalidad nueva, pero la partitura de tu atril es del arreglo de ayer. Como {title}, sigues la señal de la cantante y reúnes a la banda antes del estribillo.","tldr":"You recover a live set when the chart does not match.","tldrEs":"Recuperas el concierto cuando la partitura no coincide."},{"tier":6,"title":"The Broken String","titleEs":"La cuerda rota","body":"The solo begins and a string snaps under the hall lights. As {title}, you shift the phrase to the open strings, meet the orchestra on the next entrance, and finish without stopping.","bodyEs":"El solo empieza y una cuerda se rompe bajo las luces. Como {title}, adaptas la frase a las cuerdas al aire, vuelves a entrar con la orquesta y terminas sin detener la función.","tldr":"You adapt a solo after a string breaks.","tldrEs":"Adaptas el solo tras romperse una cuerda."}]},{"slug":"athletic","cards":[{"tier":2,"title":"The Scouting Note","titleEs":"La nota de observación","body":"The other team steals the same base whenever the pitcher looks home. As {title}, you spot the runner's first step in the video, share it with the coach, and turn it into a better pickoff drill.","bodyEs":"El otro equipo roba la misma base cada vez que el lanzador mira al home. Como {title}, detectas en el video el primer movimiento del corredor, se lo muestras al entrenador y lo conviertes en un mejor ejercicio de control.","tldr":"You turn a repeatable move on film into a useful drill.","tldrEs":"Conviertes un movimiento repetido en video en un ejercicio útil."},{"tier":4,"title":"The Shape of the Press","titleEs":"La forma de la presión","body":"The opposing defense changes its press after every timeout. As {title}, you recognize the same weak side in both setups, call the switch before the inbound, and open a path through the trap.","bodyEs":"La defensa rival cambia la presión después de cada tiempo muerto. Como {title}, reconoces el mismo punto débil en ambas formaciones, indicas el cambio antes del saque y abres una salida de la trampa.","tldr":"You read the defense's weak side before the trap closes.","tldrEs":"Lees el punto débil de la defensa antes de que cierre la trampa."},{"tier":6,"title":"The Sponsor's Clock","titleEs":"El horario del patrocinador","body":"A sponsor asks the team to add an appearance before the final, cutting into warm-ups. As {title}, you set a firm end time, protect preparation, and still give the sponsor a moment worth filming.","bodyEs":"Un patrocinador pide una aparición antes de la final y reduce el calentamiento. Como {title}, acuerdas una hora de cierre, proteges la preparación y aun así le das un momento que pueda grabar.","tldr":"You protect final preparation while meeting a sponsor's request.","tldrEs":"Proteges la preparación para la final y atiendes al patrocinador."}]},{"slug":"medical","cards":[{"tier":2,"title":"The Medication List","titleEs":"La lista de medicamentos","body":"A patient says the new tablet is the same one they already take, but the label lists another dose. As {title}, you pause the handoff, compare the medication record, and call the nurse.","bodyEs":"Un paciente dice que la nueva pastilla es igual a la que ya toma, pero la etiqueta indica otra dosis. Como {title}, detienes la entrega, comparas el registro y avisas a enfermería.","tldr":"You catch a medication mismatch before the next round.","tldrEs":"Detectas una discrepancia en la medicación antes de la siguiente ronda."},{"tier":4,"title":"The Returning Fever","titleEs":"La fiebre que regresa","body":"A patient's fever drops, then rises again just before discharge. As {title}, you compare the latest readings with the morning labs and ask the team to wait for one more result.","bodyEs":"La fiebre de un paciente baja y vuelve a subir justo antes del alta. Como {title}, comparas las últimas mediciones con los análisis y pides esperar un resultado más.","tldr":"You connect a returning fever with the latest labs before discharge.","tldrEs":"Relacionas el regreso de la fiebre con los análisis antes del alta."},{"tier":6,"title":"The Night Roster","titleEs":"El turno nocturno","body":"Two emergencies arrive as a nurse calls out sick and the night roster is already thin. As {title}, you move the float team, keep critical beds staffed, and make the handoff unmistakable.","bodyEs":"Llegan dos emergencias mientras una enfermera avisa que está enferma y el turno nocturno ya tiene poco personal. Como {title}, reorganizas al equipo de apoyo, cubres las camas críticas y dejas instrucciones claras.","tldr":"You rebalance a thin night roster during two emergencies.","tldrEs":"Reorganizas un turno nocturno reducido durante dos emergencias."}]},{"slug":"maritime","cards":[{"tier":2,"title":"The Frayed Line","titleEs":"El cabo desgastado","body":"A deckhand says the mooring line is sound, but one strand is lifting near the cleat. As {title}, you stop departure, replace it, and test the knot under load.","bodyEs":"Un marinero dice que el cabo está bien, pero una hebra se levanta junto a la cornamusa. Como {title}, detienes la salida, lo cambias y pruebas el nudo bajo carga.","tldr":"You replace a damaged mooring line before departure.","tldrEs":"Cambias un cabo dañado antes de la partida."},{"tier":4,"title":"The Shifting Hold","titleEs":"La carga que se mueve","body":"A rough patch sends a pallet against the hold braces. As {title}, you reduce speed, secure the cargo, and check the rest of the bay before the next swell.","bodyEs":"Un tramo agitado empuja una tarima contra los soportes de la bodega. Como {title}, reduces la velocidad, aseguras la carga y revisas el compartimento antes de la siguiente ola.","tldr":"You secure a shifted pallet before the next swell.","tldrEs":"Aseguras una tarima desplazada antes de la siguiente ola."},{"tier":6,"title":"The Fishing Boat","titleEs":"El barco pesquero","body":"A fishing boat reports engine trouble as the weather turns and the harbor channel begins to close. As {title}, you send a launch with a towline and bring the crew in before dark.","bodyEs":"Un barco pesquero informa una falla de motor cuando empeora el clima y el canal del puerto empieza a cerrar. Como {title}, envías una lancha con un cabo de remolque y llevas a la tripulación a puerto antes de anochecer.","tldr":"You bring a disabled fishing boat safely through a closing harbor.","tldrEs":"Llevas a puerto un pesquero averiado antes del cierre del canal."}]}];
  function jobArcCardId(jobIndex, tier) {
    const pack = JOB_ARC_STORIES[jobIndex];
    return pack && JOB_ARC_MILESTONES.indexOf(tier) >= 0 ? "jobCareer" + pack.slug + "Tier" + tier : "";
  }
  const JOB_ARC_CARDS = JOBS.flatMap((job, jobIndex) => JOB_ARC_STORIES[jobIndex].cards.map((story) => {
    const id = jobArcCardId(jobIndex, story.tier);
    return { id, job:true, jobMilestone:true, jobTrack:jobIndex, jobTier:story.tier, kind:"report",
      when:() => S.jobTrack === jobIndex && (S.have.job || 0) === story.tier,
      title:story.title, titleEs:story.titleEs, body:story.body, bodyEs:story.bodyEs,
      tldr:{en:story.tldr, es:story.tldrEs} };
  }));
  const CHANCE_CARDS = [
    { id: "landfill", kind: "choice",
      title: "The Landfill", titleEs: "El vertedero",
      body: "At 1:14 a.m., Nico sends a voice message with a dark photo of a truck and a shovel leaning against its hood.\n\n\"I'm in Wales,\" he says. \"They let me dig at Docksway. Supposedly, a hard drive holding 8,000 BTC mined in 2009 was thrown out here in 2013. I need a partner, not a spectator.\"\n\nHe offers two deals: put in a little for a small share, or put in a lot and split whatever turns up half and half.\n\nLena opens one eye from the other side of the bed. \"If you fund a treasure hunt at 1:14 a.m., the next time you're about to come, I'm calling you Fartface.\"\n\nYou look at the photo again. Somehow, the shovel makes the plan seem credible.",
      bodyEs: "A la 1:14 a. m., Nico envía un mensaje de voz con una foto oscura de un camión y una pala apoyada en el capó.\n\n\"Estoy en Gales\", dice. \"Me dejaron excavar en Docksway. Al parecer, en 2013 tiraron aquí un disco duro con 8000 BTC minados en 2009. Necesito un socio, no un espectador.\"\n\nTe ofrece dos tratos: poner poco a cambio de una parte pequeña, o poner mucho y repartir a medias lo que aparezca.\n\nDesde el otro lado de la cama, Lena abre un ojo: \"Si financias una búsqueda del tesoro a la 1:14 a. m., la próxima vez que estés a punto de terminar te llamaré Cara de Pedo.\"\n\nMiras la foto otra vez. Por alguna razón, la pala hace que el plan parezca creíble.",
      opts: [
        { k: "a", label: "Put in a little", labelEs: "Poner poco" },
        { k: "b", label: "Go halves with Nico", labelEs: "Ir a medias con Nico" },
        { k: "c", label: "Stay in bed", labelEs: "Quedarte en la cama" }
      ] },
    { id: "taxbill", kind: "report",
      title: "Quarterly Tax Bill", titleEs: "La factura trimestral",
      body: "An official-looking envelope waits on the desk. You put on your reading glasses, read the total, take them off, and put them back on in case the number was blurry. It was not blurry.",
      bodyEs: "Un sobre de aspecto oficial espera sobre el escritorio. Te pones los anteojos de leer, lees el total, te los quitas y vuelves a ponértelos por si el número estaba borroso. No lo estaba." },
    { id: "nicoWedding", kind: "choice", after: ["landfill"],
      title: "Nico Gets Married", titleEs: "La boda de Nico",
      body: "Nico is getting married. You arrive with Lena and Paco, who has already decided he dislikes the venue. There are 400 guests, and you recognize about twelve. The DJ is playing CDs from 1998. Near the bar, Nico is pitching an elaborate idea to a stranger who did not ask. Lena looks at you. \"Do not let your cousin talk you into anything tonight.\" At the gift table, you decide how much to give.",
      bodyEs: "Nico se casa. Llegas con Lena y Paco, quien ya decidió que el lugar no le gusta. Hay 400 invitados y apenas reconoces a unos doce. El DJ pone música de 1998. Cerca de la barra, Nico le explica una idea complicadísima a un desconocido que no preguntó nada. Lena te mira: \"No permitas que tu primo te convenza de nada esta noche\". En la mesa de regalos debes decidir cuánto dar.",
      opts: [
        { k: "a", label: "Give a generous gift", labelEs: "Dar un regalo generoso" },
        { k: "b", label: "Give a modest gift", labelEs: "Dar un regalo modesto" },
        { k: "c", label: "Skip the gift", labelEs: "No dar regalo" }
      ] },
    { id: "mexico", kind: "choice", after: ["landfill"],
      title: "Five Days in Tulum", titleEs: "Cinco días en Tulum",
      body: "Lena proposes five days in Tulum: warm water, white sand, tiny restaurants, and a hotel that probably looks better in its photos. You compare flights and say three days is plenty. Lena wants five. Paco eats a brochure, which settles his vote.",
      bodyEs: "Lena propone pasar cinco días en Tulum: agua tibia, arena blanca, restaurantes diminutos y un hotel que seguramente se ve mejor en las fotos. Comparas vuelos y dices que tres días alcanzan. Lena quiere cinco. Paco se come un folleto y deja claro su voto.",
      opts: [
        { k: "a", label: "Book five days · 8%", labelEs: "Reservar cinco días · 8%" },
        { k: "b", label: "Stay home with Paco", labelEs: "Quedarte en casa con Paco" }
      ] },
    { id: "flu", kind: "report", after: ["landfill"],
      title: "A Day with the Flu", titleEs: "Un día de gripe",
      body: "Lena wakes with the flu. You spend the day bringing her water, medicine, soup, and anything else she needs. By evening she is resting, the pharmacy receipt is longer than expected, and Paco has quietly eaten half the soup.",
      bodyEs: "Lena despierta con gripe. Pasas el día llevándole agua, medicinas, sopa y todo lo que necesita. Al anochecer, ella descansa, la cuenta de la farmacia es más alta de lo esperado y Paco se comió la mitad de la sopa sin que nadie lo notara." },
    { id: "phish", kind: "choice",
      title: "Account Verification", titleEs: "Verificación de cuenta",
      body: "A customer support email says there is a problem with your account. The logo, formatting, and urgent tone all look legitimate. To verify your identity, the message asks you to open a link and enter your seed phrase.",
      bodyEs: "Un correo del equipo de soporte afirma que hay un problema con tu cuenta. El logotipo, el formato y el tono urgente parecen legítimos. Para verificar tu identidad, el mensaje te pide abrir un enlace e ingresar tu frase semilla.",
      opts: [
        { k: "a", label: "Enter the seed phrase", labelEs: "Ingresar la frase semilla", hideCost: true },
        { k: "b", label: "Delete the email", labelEs: "Eliminar el correo" }
      ] },
    { id: "crash", kind: "report",
      title: "A Low-Speed Collision", titleEs: "Choque a baja velocidad",
      body: "At a red light, a delivery rider rolls into your rear bumper at walking pace. He gets off, stares at the dent, and apologizes six times. You apologize twice without knowing why. You swap numbers while his order goes cold in his backpack.",
      bodyEs: "En un semáforo, un repartidor en moto se te viene encima muy despacio y te abolla el parachoques trasero. Se baja, mira el golpe y se disculpa seis veces. Tú te disculpas dos, sin saber bien por qué. Intercambian teléfonos mientras su pedido se enfría en la mochila." },
    { id: "wine", kind: "choice", after: ["landfill"],
      title: "Wine", titleEs: "Vino",
      body: "It's Friday night at Marek's. There is a bottle of wine, dinner half finished, and 12 Monkeys paused on the TV. This is how the two of you usually spend time: wine, old movies, and a conversation that runs longer than either of you planned. Tonight, as usual, it turns into an argument about A.I. and the future. You are the enthusiastic one. Marek knows more, and trusts people less.",
      bodyEs: "Es viernes por la noche en casa de Marek. Hay una botella de vino, la cena a medio terminar y 12 Monkeys en pausa. Así suelen pasar el tiempo: vino, películas antiguas y una conversación que siempre se alarga más de lo previsto. Esta vez, como de costumbre, terminan debatiendo sobre la IA y el futuro. Tú eres el entusiasta; Marek sabe más, pero confía menos en la gente.",
      opts: [
        { k: "a", label: "Keep talking", labelEs: "Seguir conversando" },
        { k: "b", label: "Get ice cream", labelEs: "Comprar helado" },
        { k: "c", label: "Cab home", labelEs: "Tomar un taxi a casa" }
      ] },
    { id: "casino", kind: "choice", after: ["landfill"],
      title: "Nico Finds a Table", titleEs: "Nico encuentra una mesa",
      body: "Nico calls at 11:40 p.m. \"I found a table.\" You ask where. \"A casino.\" You should probably ask more questions. Instead, you go. He has already found a game that he considers interesting.",
      bodyEs: "Nico llama a las 11:40 p. m.: \"Encontré una mesa\". Le preguntas en dónde: \"En un casino\". Deberías hacer más preguntas, pero decides acompañarlo. Cuando llegas, Nico ya eligió un juego que le parece interesante.",
      opts: [
        { k: "a", label: "Bet small", labelEs: "Apostar poco" },
        { k: "b", label: "Bet big", labelEs: "Apostar fuerte" },
        { k: "c", label: "Leave", labelEs: "Salir del casino" }
      ] },
    { id: "poker", kind: "choice", after: ["wine", "casino"],
      title: "Poker", titleEs: "Póker",
      body: "Marek invites you to a poker game. Not a casino. Just people he knows, sitting around a table late at night. He is already there when you arrive, drinking wine and watching the game. He nods at the empty chair. \"You're playing?\"",
      bodyEs: "Marek te invita a una partida de póker. No es en un casino: es con gente conocida alrededor de una mesa de madrugada. Ya está ahí cuando llegas, tomando vino y observando la partida. Señala con la cabeza la silla vacía: \"¿Juegas?\"",
      opts: [
        { k: "a", label: "Buy in · 8%", labelEs: "Comprar fichas · 8%" },
        { k: "b", label: "Buy in · 25%", labelEs: "Comprar fichas · 25%" },
        { k: "c", label: "Sit this one out", labelEs: "No jugar esta vez" }
      ] },
    { id: "uncle", kind: "report",
      title: "Uncle Héctor", titleEs: "El tío Héctor",
      body: "Uncle Héctor sends a message. No explanation. Just: \"Check your account.\" He has transferred you some money. You call him. He refuses to explain why.",
      bodyEs: "El tío Héctor envía un mensaje sin explicación: \"Revisa tu cuenta\". Te transfirió dinero. Lo llamas, pero se niega a decirte por qué." },
    { id: "school", kind: "choice", after: ["nicoWedding"],
      title: "School Trip", titleEs: "La excursión escolar",
      body: "Sofi, Nico's ten-year-old daughter, is going on a school trip to the Mint Museum. With Nico's latest plans, money at their house is a little short this month. Lena thinks you should help.",
      bodyEs: "Sofi, la hija de diez años de Nico, tiene una excursión escolar al museo de la Casa de Moneda. Con los últimos planes de Nico, este mes el dinero en su casa está ajustado. Lena cree que deberías ayudar.",
      opts: [
        { k: "a", label: "Cover the trip", labelEs: "Pagar la excursión" },
        { k: "b", label: "Let them handle it", labelEs: "Que lo resuelvan ellos" }
      ] },
    { id: "roof", kind: "report",
      title: "Roof", titleEs: "La gotera en el techo",
      body: "Paco finds the leak in the roof before you do. He sits directly underneath it. The workers arrive. He moves. He immediately finds another place to sit.",
      bodyEs: "Paco encuentra la gotera en el techo antes que tú. Se sienta justo debajo. Llegan los reparadores. Se quita de ahí, pero de inmediato encuentra otro lugar donde sentarse." },
    { id: "hospital", kind: "report", after: ["landfill"],
      title: "Four Stitches", titleEs: "Cuatro puntos de sutura",
      body: "You need four stitches. Lena drives you to the hospital. She waits with you. On the way home she says: \"Try not to bleed on anything.\"",
      bodyEs: "Necesitas cuatro puntos de sutura. Lena te lleva al hospital y espera contigo. De regreso a casa te dice: \"Intenta no sangrar sobre nada\"." },
    { id: "startup", kind: "choice", after: ["landfill"],
      title: "Startup", titleEs: "La startup",
      body: "Nico calls. \"I have a plan.\" You already know this is going somewhere. He has built a 47-slide presentation for an app that combines subscriptions, artificial intelligence, and something he calls community ownership. He says the upside is massive.",
      bodyEs: "Llama Nico: \"Tengo un plan\". Ya sabes hacia dónde va esto. Preparó una presentación de 47 diapositivas para una app que combina suscripciones, inteligencia artificial y algo que llama propiedad comunitaria. Dice que el potencial de ganancias es enorme.",
      opts: [
        { k: "a", label: "Invest", labelEs: "Invertir" },
        { k: "b", label: "Pass", labelEs: "Dejar pasar la oportunidad" }
      ] },
    { id: "tow", kind: "report",
      title: "Nine Minutes", titleEs: "Nueve minutos",
      body: "You leave the car for nine minutes while you run in for a coffee. When you come back, there is a ticket under the wiper and a tow truck idling behind it. The No Parking sign is exactly where it has always been.",
      bodyEs: "Dejas el auto nueve minutos mientras entras a comprar un café. Al volver, hay una multa bajo el limpiaparabrisas y una grúa esperando detrás. El cartel de prohibido estacionar sigue exactamente donde siempre estuvo." },
    { id: "courage", kind: "choice", after: ["landfill","nicoWedding","mexico","flu","school","hospital","potluck","wine","justInCase","nothingToHide","somethingBetter"],
      title: "Courage", titleEs: "Coraje",
      body: "You are at Marek's apartment. There is wine on the table and 12 Monkeys paused on the TV. You end up talking about A.I., futurism, and whether people actually know what they want. Eventually you mention Lena. Marek looks at you. \"So?\" You shrug. \"We've been together for years.\" He takes a sip. \"Maybe you're waiting for certainty.\" Then he presses play again. You keep thinking about it.",
      bodyEs: "Estás en el departamento de Marek. Hay vino en la mesa y 12 Monkeys en pausa. Terminan hablando de IA, futurismo y de si la gente realmente sabe lo que quiere. En algún momento mencionas a Lena. Marek te mira: \"¿Y bien?\". Te encoges de hombros: \"Llevamos años juntos\". Da un sorbo: \"Quizá estás esperando tener certeza absoluta\". Vuelve a poner la película. Te quedas pensándolo.",
      opts: [
        { k: "a", label: "Go buy a ring", labelEs: "Ir a comprar un anillo" },
        { k: "b", label: "Wait", labelEs: "Esperar" }
      ] },
    { id: "ring", kind: "choice", after: ["courage"], when:()=>!!S.hasRing,
      title: "The Ring", titleEs: "El anillo",
      body: "You go to the jewelry store. You know exactly why you are there. You do not know what size of diamond makes you look responsible without looking ridiculous.",
      bodyEs: "Vas a la joyería. Sabes con exactitud por qué estás ahí. Lo que no sabes es qué tamaño de diamante te hace ver responsable sin parecer ridículo.",
      opts: [
        { k: "a", label: "Buy the ring · 8%", labelEs: "Comprar el anillo · 8%" },
        { k: "b", label: "Buy the cheaper one · 3%", labelEs: "Comprar el más económico · 3%" }
      ] },
    { id: "date", kind: "choice", after: ["ring"],
      title: "Date", titleEs: "La cita",
      body: "Tonight is the night. The ring is in your coat pocket and the plan is simple: dinner first, then a walk by the lake at sunset. Lena is already waiting by the door. Even Paco is behaving, which feels deeply suspicious. All you have to do is pick the place and get through dinner without giving yourself away.",
      bodyEs: "Esta noche es la noche. El anillo está en el bolsillo de tu abrigo y el plan es sencillo: primero la cena y después una caminata junto al lago al atardecer. Lena ya espera junto a la puerta. Hasta Paco se porta bien, lo cual resulta muy sospechoso. Solo tienes que elegir el lugar y superar la cena sin delatarte.",
      opts: [
        { k: "a", label: "Nice restaurant", labelEs: "Buen restaurante" },
        { k: "b", label: "Keep it simple", labelEs: "Mantenerlo sencillo" },
        { k: "c", label: "Cancel (try another day)", labelEs: "Cancelar (otro día)" }
      ] },
    { id: "proposal", kind: "choice", after: ["date"],
      title: "Proposal", titleEs: "La propuesta",
      body: "The lake is getting dark. You and Lena are standing by the water. The date went well enough that you are starting to worry. The ring is in your pocket. You have not asked yet.",
      bodyEs: "El lago se va oscureciendo. Lena y tú están de pie junto al agua. La cita salió tan bien que comienzas a preocuparte. El anillo está en tu bolsillo. Todavía no has hecho la pregunta.",
      opts: [
        { k: "a", label: "Propose properly · 2%", labelEs: "Pedirle matrimonio formalmente · 2%" },
        { k: "b", label: "Panic and stand there", labelEs: "Entrar en pánico y quedarte callado" },
        { k: "c", label: "Make a joke and run · 1%", labelEs: "Hacer una broma y salir corriendo · 1%" }
      ] },
    { id: "wedding", kind: "choice", after: ["proposal"], when:()=>!!S.engaged,
      title: "Wedding", titleEs: "La boda",
      body: "You and Lena are getting married. There are invitations, food, relatives, flowers, music, and several decisions you did not realize were decisions. Lena has opinions. You have some opinions. Most of hers win.",
      bodyEs: "Lena y tú se van a casar. Hay invitaciones, comida, familiares, flores, música y varias decisiones que ni siquiera sabías que eran decisiones. Lena tiene opiniones firmes. Tú tienes algunas. Casi todas las de ella ganan.",
      opts: [
        { k: "a", label: "The wedding Lena wants · 12%", labelEs: "La boda que Lena quiere · 12%" },
        { k: "b", label: "Keep it small · 5%", labelEs: "Hacer una fiesta pequeña · 5%" },
        { k: "c", label: "Run", labelEs: "Salir huyendo" }
      ] },
    { id: "honeymoon", kind: "choice", after: ["wedding"], when:()=>!!S.familyPath&&!S.familyClosed,
      title: "Honeymoon", titleEs: "La luna de miel",
      body: "You and Lena finally leave. For several days you agree on one rule: no checking the portfolio. You immediately wonder whether looking at the total counts. Lena takes your phone away. You have three possible itineraries.",
      bodyEs: "Por fin se van de viaje. Acuerdan una sola regla para esos días: no revisar el portafolio. De inmediato te preguntas si ver solo el total cuenta como trampa. Lena te quita el teléfono. Hay tres itinerarios posibles.",
      opts: [
        { k: "a", label: "Japan · 10%", labelEs: "Japón · 10%" },
        { k: "b", label: "Italy · 6%", labelEs: "Italia · 6%" },
        { k: "c", label: "Patagonia · 4%", labelEs: "Patagonia · 4%" }
      ] },
    { id: "pregnancy", kind: "report", after: ["honeymoon"],
      title: "Being Four", titleEs: "Ahora somos cuatro",
      body: "Two lines on a test change everything. You and Lena are going to have a baby. For a few seconds neither of you says anything. Paco yawns. You look at him and say, “Four.” Lena smiles. There will be doctors, appointments, preparations, and a lot of things to pay for. The first costs come to $450. You sleep surprisingly well that night.",
      bodyEs: "Dos líneas en una prueba de embarazo lo cambian todo. Lena y tú van a tener un bebé. Durante unos segundos ninguno dice nada. Paco bosteza. Lo miras y dices: \"Cuatro\". Lena sonríe. Vendrán médicos, citas, preparativos y muchas cosas que pagar. Los primeros gastos suman $450. Esa noche duermes sorprendentemente bien." },
    { id: "baby", kind: "choice", after: ["pregnancy"],
      title: "The night must fade and give to light a brand new day",
      titleEs: "Un nuevo amanecer",
      body: "The baby arrives. You are tired, Lena is tired, and Paco is confused. Kids grow fast. You start thinking about the kind of future you want to build.",
      bodyEs: "Llega el bebé. Tú estás agotado, Lena está agotada y Paco está confundido. Los niños crecen muy rápido. Empiezas a pensar en la clase de futuro que quieres construir.",
      opts: [
        { k: "a", label: "Set things up properly", labelEs: "Organizar todo debidamente" },
        { k: "b", label: "Keep it simple", labelEs: "Mantenerlo sencillo" },
        { k: "c", label: "Send a PDF of financial advice", labelEs: "Enviar un PDF con consejos financieros" }
      ] },
    { id: "cousin", kind: "choice", after: ["landfill"],
      title: "Nico's New Thing", titleEs: "La nueva idea de Nico",
      body: "Nico calls again. \"I found something.\" Of course he did. This time it is a new token called FridayCoin, ticker $FRY. He says it will do ten times by Friday. You ask what it actually does. He says that is not the important part.",
      bodyEs: "Nico llama otra vez: \"Encontré algo\". Por supuesto que sí. Esta vez se trata de un nuevo token: FridayCoin, símbolo $FRY. Asegura que multiplicará por diez su valor para el viernes. Le preguntas qué hace realmente. Responde que esa no es la parte importante.",
      opts: [
        { k: "a", label: "Invest", labelEs: "Invertir" },
        { k: "b", label: "Walk away", labelEs: "Rechazar la oferta" }
      ] },
    { id: "speeding", kind: "report", after: ["tow"],
      title: "Six Miles Per Hour", titleEs: "Diez kilómetros de más",
      body: "You are six miles per hour over the limit, on the same corner where you were stopped last time. The officer recognizes you before you lower the window.",
      bodyEs: "Vas diez kilómetros por hora por encima del límite, en la misma esquina donde te pararon la última vez. El oficial te reconoce antes de que bajes la ventanilla." },
    { id: "wallet", kind: "report",
      title: "Found It", titleEs: "Billetera encontrada",
      body: "You get off the bus and, two blocks later, your pocket feels wrong: the wallet stayed on the seat. You call the bus line. A driver found it, so you ride back to the terminal and he hands it over on the same bus. Your cards and ID are there. The cash is not.",
      bodyEs: "Te bajas del autobús y, dos cuadras después, el bolsillo se siente raro: la billetera quedó en el asiento. Llamas a la línea. Un chofer la encontró, así que vuelves a la terminal y te la devuelve en el mismo autobús. Las tarjetas y el documento están. El efectivo, no." },
    { id: "potluck", kind: "choice", after: ["landfill"],
      title: "Neighborhood Potluck", titleEs: "Comida vecinal",
      body: "Lena signs both of you up for a neighborhood potluck. She also signs Paco up. You explain that Paco cannot cook. She says: \"He can attend.\" Paco eats half of what you brought before you arrive.",
      bodyEs: "Lena los inscribe a los dos en una comida comunitaria del vecindario. También inscribe a Paco. Le explicas que Paco no sabe cocinar. Ella responde: \"Puede asistir\". Paco se come la mitad de lo que prepararon antes de que alcancen a llegar.",
      opts: [
        { k: "a", label: "Buy more food on the way · 5%", labelEs: "Comprar más comida en el camino · 5%" },
        { k: "b", label: "Bring what is left", labelEs: "Llevar lo que quedó" }
      ] },
    { id: "usedcar", kind: "choice", after: ["landfill"],
      title: "The Used Car", titleEs: "El auto usado",
      body: "Nico has another opportunity. A 2009 Honda Fit. The seller says it has a new timing belt. Nico looks under the hood. \"It has Sharpie.\" You are not sure what that means. Nico says it means \"basically new.\"",
      bodyEs: "Nico tiene otra oportunidad: un Honda Fit 2009. El vendedor afirma que tiene una correa de distribución nueva. Nico mira debajo del capó: \"Está marcado con Sharpie\". No sabes qué significa eso. Nico asegura que significa \"básicamente nuevo\".",
      opts: [
        { k: "a", label: "Buy it · 12%", labelEs: "Comprarlo · 12%" },
        { k: "b", label: "Walk away", labelEs: "Dejarlo pasar" }
      ] },
    { id: "tetris", kind: "choice", after: ["wine"],
      title: "Tetris", titleEs: "Tetris",
      body: "Marek takes you to an old bar with an arcade machine in the back. There is a Tetris cabinet nobody seems to use. He starts playing. He gets unusually focused. \"Trying not to make it worse.\" After a few minutes he steps aside. \"Your turn.\"",
      bodyEs: "Marek te lleva a un bar antiguo con una máquina de arcade al fondo. Hay una máquina de Tetris que nadie parece usar. Empieza a jugar y se concentra de una manera inusual: \"Intento no empeorarlo\". Tras unos minutos, se hace a un lado: \"Tu turno\".",
      opts: [
        { k: "a", label: "Put money in", labelEs: "Insertar monedas" },
        { k: "b", label: "Watch Marek play", labelEs: "Mirar a Marek jugar" }
      ] },
    { id: "chess", kind: "choice", after: ["tetris", "poker"], input: "move",
      title: "Marek's Chess Problem", titleEs: "El problema de ajedrez de Marek",
      body: "Marek clears the wine glasses off the table and sets up a chessboard from memory.\n\n\"Paris, 1858. The opera house, during The Barber of Seville. Paul Morphy is twenty-one, American, and the guest of the Duke of Brunswick in his private box. The duke and Count Isouard play him together, consulting on every move. Morphy sits with his back to the stage and keeps turning to hear the singers, so he doesn't take long.\"\n\nHe places the last piece: the position after 14...Qe6.\n\n\"White to move. Morphy needed three more moves to finish it. Type the first one. Find it and the bitcoin is yours. Miss it and you owe me nothing but an apology to Morphy.\"",
      bodyEs: "Marek retira las copas de la mesa y arma un tablero de ajedrez de memoria.\n\n\"París, 1858. La ópera, durante El barbero de Sevilla. Paul Morphy tiene veintiún años, es estadounidense y es invitado del duque de Brunswick en su palco. El duque y el conde Isouard juegan juntos contra él y discuten cada jugada. Morphy está de espaldas al escenario y se da vuelta a cada rato para escuchar a los cantantes, así que no se demora\".\n\nColoca la última pieza: la posición después de 14...De6.\n\n\"Juegan las blancas. A Morphy le bastaron tres jugadas más para terminar. Escribe la primera. Si la encuentras, el bitcoin es tuyo. Si fallas, solo le debes una disculpa a Morphy\"." },
    { id: "unclemike", kind: "choice",
      title: "Fancy Dinner with Uncle Mike", titleEs: "Cena elegante con el tío Mike",
      body: "Uncle Mike is in town, so you meet him at a fancy restaurant. The food is excellent and the wine is excellent, right up until the check arrives: $180 before tip. He studies it, looks at the tip line, and puts the pen down. Why, he wants to know, is he paying their salary? You tell him the tip is expected. That, he says, is the problem, and he goes on about restaurants that should pay their people instead of leaving it to the customers. You agree with him. You also want to go home. The waiter is still standing there, and you look at the tip line again.",
      bodyEs: "El tío Mike está de visita en la ciudad y se reúnen en un restaurante elegante. La comida y el vino son excelentes, hasta que llega la cuenta: $180 sin propina. La revisa con detenimiento, mira la línea de la propina y suelta el bolígrafo. Pregunta con molestia por qué tiene que pagar él los sueldos de los empleados. Le explicas que la propina es habitual. Ese, insiste él, es el verdadero problema, y empieza un discurso sobre restaurantes que deberían pagarles sueldos dignos a sus empleados en lugar de transferirles la carga a los clientes. Estás de acuerdo con él, pero también quieres irte a casa. El mesero sigue ahí de pie, y tú vuelves a mirar la línea de la propina.",
      opts: [
        { k: "a", label: "Leave a 20% tip", labelEs: "Dejar 20% de propina" },
        { k: "b", label: "Leave no tip", labelEs: "No dejar propina" },
        { k: "c", label: "Leave a 10% tip", labelEs: "Dejar 10% de propina" }
      ] }
,
    { id:"justInCase", kind:"report", title:"Just in Case", titleEs:"Por si acaso", body:"A new emergency law passes after three days of debate. It gives government broader powers during economic instability. Temporary. You read the definition twice. It seems to include most years.", bodyEs:"Tras tres días de debate, se aprueba una nueva ley de emergencia. Amplía las facultades del Estado durante períodos de inestabilidad económica. La presentan como temporal. Lees la definición dos veces: parece abarcar casi todos los años." },
    { id:"nothingToHide", kind:"report", after:["justInCase"], title:"Nothing to Hide", titleEs:"Nada que ocultar", body:"A new digital ID rolls out as optional. Airports get faster. Banks offer discounts. Government services begin moving to it. A TV host asks: “If you've got nothing to hide, what's the problem?” You have nothing to hide. The question still bothers you.", bodyEs:"Se lanza un nuevo documento de identidad digital. Es opcional. Los controles en los aeropuertos se agilizan. Los bancos ofrecen descuentos. Los servicios públicos comienzan a trasladarse al sistema. Un presentador de televisión pregunta: «Si no tienes nada que ocultar, ¿cuál es el problema?». No tienes nada que ocultar. Aun así, la pregunta te incomoda." },
    { id:"somethingBetter", kind:"report", after:["nothingToHide","wine"], title:"Something Better", titleEs:"Algo mejor", body:"You are running with Marek through the woods. The trail follows a river between low hills. “Given enough money,” you say, “you could actually build something better.” Marek glances over. “A company?” “No.” “A charity?” “No.” You keep running. You do not yet know what.", bodyEs:"Corres con Marek por el bosque. El sendero sigue un río entre colinas bajas. «Con suficiente dinero», dices, «podrías construir algo mejor». Marek te mira de reojo. «¿Una empresa?». «No». «¿Una organización benéfica?». «No». Sigues corriendo. Aún no sabes qué sería." },
    { id:"timeTraveler", kind:"report", after:["wedding"], when:()=>!!S.familyClosed, title:"The Time Traveler", titleEs:"El viajero del tiempo", body:"Late at night you find an old Bitcoin forum post. The author claims to be writing from the future. Bitcoin is enormous. Governments are weaker. Rich holders live in Citadels that began as mining compounds, then fortified communities, then something else. What bothers you is not the walls. It is that they stopped trying to fix the places they lived in. A search leads to a book: THE BITCOIN STATE — $666. It looks self-published.", bodyEs:"Una noche encuentras una publicación antigua en un foro de Bitcoin. El autor asegura escribir desde el futuro: Bitcoin es enorme, los gobiernos son más débiles y los grandes tenedores viven en ciudadelas que comenzaron como complejos mineros, se convirtieron en comunidades fortificadas y luego en algo más. Lo que te inquieta no son los muros, sino que dejaron de intentar mejorar los lugares donde vivían. La búsqueda te conduce a un libro: THE BITCOIN STATE — $666. Parece autoeditado." },
    { id:"temporaryMeasures", kind:"report", after:["timeTraveler"], when:()=>!!S.familyClosed, title:"Temporary Measures", titleEs:"Medidas temporales", body:"A financial emergency is declared. Transfer restrictions arrive. Cash limits follow. Several payment apps stop working. Officials say the measures will last ninety days. The previous temporary measures are entering their fourth year.", bodyEs:"Se declara una emergencia financiera. Primero llegan las restricciones a las transferencias; después, los límites al uso de efectivo. Varias aplicaciones de pago dejan de funcionar. Las autoridades aseguran que las medidas durarán noventa días. Las medidas temporales anteriores están por cumplir cuatro años." },
    { id:"citadelProblem", kind:"report", after:["timeTraveler","temporaryMeasures"], when:()=>!!S.bcBook&&!!S.familyClosed, title:"The Citadel Problem", titleEs:"El problema de la ciudadela", body:"The book arrives. Four hundred and seventeen pages. It uses the word sovereignty 186 times. You send Marek several questionable pages. Later, on a run through the hills, you say it anyway. “A country.” Marek laughs once, then realizes you are serious. Twenty minutes later he asks: “How much land?” You make a checklist: Land. Power. Water. People. Money. Rules. Security. Recognition. Marek adds Flag. “No.” “You need a flag.”", bodyEs:"El libro llega: 417 páginas y 186 usos de la palabra «soberanía». Le envías a Marek varias páginas dudosas. Más tarde, mientras corren por las colinas, lo dices de todos modos: «Un país». Marek se ríe una vez y después comprende que hablas en serio. Veinte minutos más tarde pregunta: «¿Cuánta tierra?». Preparas una lista: tierra, energía, agua, población, dinero, normas, seguridad y reconocimiento. Marek añade una bandera. «No». «Necesitas una bandera»." },
    { id:"pieceWorld", kind:"choice", after:["citadelProblem"], title:"A Piece of the World", titleEs:"Un pedazo del mundo", body:"Nico finds an isolated island listing. Two coves. A bad dock. Green hills. The phrase UNIQUE SOVEREIGN LIFESTYLE OPPORTUNITY appears twice. It is not sovereign. You check. Three times.", bodyEs:"Nico encuentra el anuncio de una isla aislada. Dos caletas. Un muelle en mal estado. Colinas verdes. La frase OPORTUNIDAD ÚNICA PARA UN ESTILO DE VIDA SOBERANO aparece dos veces. La isla no es soberana. Lo verificas. Tres veces.", opts:[{k:"a",label:"Go see the island · $1,800",labelEs:"Ir a conocer la isla · $1,800"},{k:"b",label:"This is insane",labelEs:"Esto es una locura"}] },
    { id:"islandInspection", kind:"choice", after:["pieceWorld"], when:()=>!!S.chanceMet.islandTrip&&!S.bcIsland, title:"Island Inspection", titleEs:"Inspección de la isla", body:"The boat reaches the island at sunrise. Nico jumps onto the dock. It makes a bad noise. Green hills rise behind two coves. Pine and coastal forest cover most of the interior. Cliffs run along the eastern side. It is more beautiful than the listing. Marek looks around. “No way,” he says, in the best possible sense. Paco disappears into the trees. At sunset you stand on the high point with water in every direction. The seller's offer arrives.", bodyEs:"El barco llega a la isla al amanecer. Nico salta al muelle. La estructura emite un crujido preocupante. Detrás de dos caletas se elevan colinas verdes. Pinos y bosque costero cubren casi todo el interior; los acantilados recorren el lado oriental. Es más hermosa que en el anuncio. Marek observa alrededor. «No puede ser», dice, en el buen sentido. Paco desaparece entre los árboles. Al atardecer, están en el punto más alto, rodeados de agua. Entonces llega la oferta del vendedor.", opts:[{k:"a",label:"Buy the island",labelEs:"Comprar la isla"},{k:"b",label:"Walk away",labelEs:"Rechazar la oferta"}] },
    { id:"paperwork", kind:"report", after:["islandInspection"], when:()=>!!S.bcIsland, title:"Paperwork", titleEs:"Los trámites", body:"Lawyers spend several weeks turning the purchase into something that looks increasingly serious on paper. Nico signs in the wrong place. Paco eats the corner of the final document. “Country,” Nico says. “Island,” you say. “For now.”", bodyEs:"Durante varias semanas, los abogados convierten la compra en algo que se ve cada vez más serio sobre el papel. Nico firma donde no corresponde. Paco se come una esquina del documento final. «País», dice Nico. «Isla», respondes. «Por ahora»." },
    { id:"nobodyKnows", kind:"choice", after:["paperwork"], title:"Nobody Knows We Exist", titleEs:"Nadie sabe que existimos", body:"You have land. You have paperwork. You do not have citizens, recognition, or much reason for anyone to care. An old contact gives you one name: Madame Luck. Marek reads the name twice. Nico says he knows her. Of course he does.", bodyEs:"Tienes tierra. Tienes documentos. No tienes ciudadanos, reconocimiento ni demasiadas razones para que alguien se interese. Un antiguo contacto te da un solo nombre: Madame Luck. Marek lo lee dos veces. Nico dice que la conoce. Por supuesto que sí.", opts:[{k:"a",label:"Make contact · $5,000",labelEs:"Contactar a Madame Luck · $5,000"},{k:"b",label:"Post about it",labelEs:"Publicar sobre el proyecto"}] },
    { id:"theOg", kind:"report", after:["nobodyKnows"], when:()=>!!S.bcOg, title:"The OG", titleEs:"La veterana", body:"Madame Luck joins seventeen minutes late and asks very good questions. Then she says she will tell some people. Your phone starts vibrating.", bodyEs:"Madame Luck se conecta diecisiete minutos tarde y hace preguntas muy acertadas. Después dice que hablará del proyecto con algunas personas. Tu teléfono empieza a vibrar." },
    { id:"peopleAsking", kind:"choice", after:["theOg"], when:()=>S.bcNodes>=10, title:"People Start Asking", titleEs:"La gente empieza a preguntar", body:"Developers, miners and families ask whether they can move in. Nico makes a spreadsheet. Marek finds the problem. “We do not have houses.”", bodyEs:"Desarrolladores, mineros y familias preguntan si pueden mudarse a la isla. Nico prepara una hoja de cálculo. Marek detecta el problema. «No tenemos viviendas».", opts:[{k:"a",label:"Build a settlement · 3%",labelEs:"Construir un asentamiento · 3%"},{k:"b",label:"Not yet",labelEs:"Todavía no"}] },
    { id:"extensionCord", kind:"choice", after:["peopleAsking"], when:()=>!!S.bcSettlement, title:"The Extension Cord Problem", titleEs:"El problema de los cables de extensión", body:"Residents bring refrigerators, computers, pumps, servers and a sauna nobody admits owning. At 8:43 p.m. the island goes dark. Someone asks who was mining.", bodyEs:"Los residentes llevan refrigeradores, computadoras, bombas, servidores y un sauna que nadie admite que sea suyo. A las 8:43 p. m., toda la isla queda a oscuras. Alguien pregunta quién estaba minando.", opts:[{k:"a",label:"Build proper power · 4%",labelEs:"Construir una red eléctrica adecuada · 4%"},{k:"b",label:"More extension cords",labelEs:"Añadir más cables de extensión"}] },
    { id:"obviously", kind:"choice", after:["extensionCord"], when:()=>!!S.bcPower, title:"Obviously", titleEs:"Era obvio", body:"The grid works. Nico says you should mine Bitcoin. Obviously. One proposal contains only four words: CHEAP POWER. WE MINE.", bodyEs:"La red eléctrica funciona. Nico dice que deberían minar Bitcoin. Era obvio. Una de las propuestas contiene solo cuatro palabras: ENERGÍA BARATA. MINAMOS BITCOIN.", opts:[{k:"a",label:"Build the mine · 5%",labelEs:"Construir la mina · 5%"},{k:"b",label:"Not yet",labelEs:"Todavía no"}] },
    { id:"principality", kind:"report", after:["theOg"], when:()=>S.bcNodes>=25, title:"The Principality", titleEs:"El principado", body:"An email arrives from Mr Ortega & Gambette, Foreign Minister of San Arnaldo. San Arnaldo has a flag, an anthem, a website and 614 claimed citizens. They would like relations.", bodyEs:"Llega un correo del señor Ortega & Gambette, ministro de Relaciones Exteriores de San Arnaldo. San Arnaldo tiene bandera, himno, sitio web y 614 ciudadanos declarados. Quieren establecer relaciones." },
    { id:"stateVisit", kind:"choice", after:["principality"], title:"State Visit", titleEs:"Visita de Estado", body:"San Arnaldo is a coastal town nestled among hills. Its government building was a restaurant three months ago; the menu board still hangs behind the ministerial desk. Ortega & Gambette asks for help building Bitcoin infrastructure. The principality needs a node. Bitcoin Country needs its first diplomatic ally.", bodyEs:"San Arnaldo es un pueblo costero entre colinas. Su edificio de gobierno era un restaurante hace tres meses; el menú aún cuelga detrás del escritorio ministerial. Ortega & Gambette solicita ayuda para desarrollar infraestructura de Bitcoin. El principado necesita un nodo. Bitcoin Country necesita su primer aliado diplomático.", opts:[{k:"a",label:"Build and install a node · $15,000",labelEs:"Construir e instalar un nodo · $15,000"},{k:"b",label:"Fund basic equipment · $5,000",labelEs:"Financiar equipamiento básico · $5,000"},{k:"c",label:"Make a courtesy visit",labelEs:"Realizar una visita de cortesía"}] },
    { id:"firstBloc", kind:"report", after:["stateVisit"], title:"The First Bloc", titleEs:"El primer bloque", body:"Seven capitals announce the Meridian Stability Pact on the same morning. The treaty is brief. Its annexes are not.\n\nGermany, France, Italy, Spain, the Netherlands, Belgium, and Austria coordinate trade, energy, a shared payment network, and a defense clause nobody reads aloud.\n\nChancellor Ivo Voss chairs the first session. He never raises his voice. After thanking the cameras for their patience, he calls instability a form of violence and lists what now requires permission: large transfers, foreign accounts, unsanctioned ports, and newspapers that refuse to cooperate.\n\nThe Pact does not look like a boot. It looks like a form. The form is mandatory.", bodyEs:"Siete capitales anuncian el Pacto de Estabilidad Meridiano la misma mañana. El tratado es breve. Sus anexos no.\n\nAlemania, Francia, Italia, España, los Países Bajos, Bélgica y Austria coordinan el comercio, la energía, una red de pagos compartida y una cláusula de defensa que nadie lee en voz alta.\n\nEl canciller Ivo Voss preside la primera sesión. Nunca alza la voz. Tras agradecer la paciencia de las cámaras, define la inestabilidad como una forma de violencia y enumera lo que ahora requiere autorización: grandes transferencias, cuentas en el extranjero, puertos no autorizados y periódicos que se nieguen a cooperar.\n\nEl Pacto no parece una bota. Parece un formulario. El formulario es obligatorio." },
    { id:"protectIsland", kind:"choice", after:["firstBloc"], title:"Who Protects the Island?", titleEs:"¿Quién protege la isla?", body:"At sunrise, an empty mooring line is all that remains of a boat. The island’s only camera was aimed at the wrong section of the dock. Paco, officially the night watch, slept through everything. Marek says the problem is no longer the missing boat: a growing community needs a real security plan.", bodyEs:"Al amanecer, una amarra vacía es lo único que queda de un bote. La única cámara de la isla apuntaba al sector equivocado del muelle. Paco, encargado oficialmente de la guardia nocturna, durmió durante todo el incidente. Marek señala que el problema ya no es el bote desaparecido: una comunidad en crecimiento necesita un verdadero plan de seguridad.", opts:[{k:"a",label:"Establish a defense force · 2%",labelEs:"Establecer una fuerza de defensa · 2%"},{k:"b",label:"Hire private security · $50,000",labelEs:"Contratar seguridad privada · $50,000"},{k:"c",label:"Issue Paco a security vest",labelEs:"Entregarle a Paco un chaleco de seguridad"}] },
    { id:"placeNow", kind:"report", after:["protectIsland"], when:()=>S.bcNodes>=50, title:"This Is Apparently a Place Now", titleEs:"Esto ya parece un lugar", body:"At fifty nodes, daily life begins filling the spaces you never planned. A coffee shop opens near the dock, followed by a bakery whose sign promises it will close only on national holidays. The island does not have any. Then come a bar and a newspaper. The paper's first editorial complains that the generators are too loud and your decisions are too quiet. Nico reads it twice, delighted. “You made it. You have opposition.”", bodyEs:"Al alcanzar cincuenta nodos, la vida cotidiana comienza a ocupar los espacios que nunca planificaste. Cerca del muelle abre una cafetería y después una panadería con un cartel que promete cerrar solo en feriados nacionales. La isla no tiene ninguno. Luego llegan un bar y un periódico. El primer editorial del periódico se queja de que los generadores hacen demasiado ruido y tus decisiones se explican demasiado poco. Nico lo lee dos veces, encantado. «Lo lograste. Ya tienes oposición»." },
    { id:"citadelQuestion", kind:"choice", after:["placeNow"], title:"The Citadel Question", titleEs:"La cuestión de la ciudadela", body:"Marek unrolls plans for protected power, perimeter walls, and a hardened center supplied for a siege. “Citadel.” The island now has families, shops, and a newspaper. The same walls that could protect that community would also turn its home into a fortress.", bodyEs:"Marek despliega planos para proteger el suministro eléctrico, levantar muros perimetrales y construir un centro reforzado con suministros para resistir un asedio. «Ciudadela». La isla ya tiene familias, comercios y un periódico. Los mismos muros que podrían proteger a esa comunidad también convertirían su hogar en una fortaleza.", opts:[{k:"a",label:"Build the citadel · 8%",labelEs:"Construir la ciudadela · 8%"},{k:"b",label:"Keep the plans on hold",labelEs:"Dejar los planos en espera"}] },
    { id:"rearmament", kind:"report", after:["citadelQuestion"], title:"Rearmament", titleEs:"Rearme", body:"The Meridian Stability Pact announces a new frigate program and calls it maintenance.\n\nAcross the water, Russia, Belarus, China, North Korea, and Cuba answer with a different kind of order. They sign the Red Ledger Compact in a hall lit too brightly. Marshal Amina Kade reads the preamble herself. She was a dock officer, then a prosecutor, and now decides which shortages count as patriotic.\n\nThe Compact does not speak of stability. It speaks of purity. Hoarding is treason. Private mines are unfinished revolutions. Posters appear before bread does. Police notebooks grow thicker. The speeches are beautiful. The queues are not.\n\nBoth blocs begin building warships. Neither calls it an arms race.", bodyEs:"El Pacto de Estabilidad Meridiano anuncia un nuevo programa de fragatas y lo llama mantenimiento.\n\nDel otro lado del agua, Rusia, Bielorrusia, China, Corea del Norte y Cuba responden con otro tipo de orden. Firman el Compacto del Libro Rojo en un salón iluminado en exceso. La mariscal Amina Kade lee personalmente el preámbulo. Primero fue oficial de muelle, después fiscal y ahora decide qué escasez cuenta como patriótica.\n\nEl Compacto no habla de estabilidad, sino de pureza. Acaparar es traición. Las minas privadas son revoluciones inconclusas. Los carteles aparecen antes que el pan. Los cuadernos de la policía se vuelven más gruesos. Los discursos son hermosos. Las filas no.\n\nAmbos bloques comienzan a construir buques de guerra. Ninguno lo llama carrera armamentista." },
    { id:"anOffer", kind:"choice", after:["rearmament"], title:"An Offer", titleEs:"Una oferta", body:"A private consortium sends a contract to buy the island, settlement, power grid, mine, and every other part of the project for 35% more than your current net worth. The sale would secure the profit and end Bitcoin Country. Madame Luck reads the final page and asks one question: “Why did you build it?”", bodyEs:"Un consorcio privado envía un contrato para comprar la isla, el asentamiento, la red eléctrica, la mina y todo lo demás por 35% más que tu patrimonio actual. La venta aseguraría la ganancia y pondría fin a Bitcoin Country. Madame Luck lee la última página y hace una sola pregunta: «¿Por qué lo construiste?»", opts:[{k:"a",label:"Accept the offer",labelEs:"Aceptar la oferta"},{k:"b",label:"Bitcoin Country is not for sale",labelEs:"Bitcoin Country no está en venta"}] },
    { id:"ambassador", kind:"report", after:["anOffer"], when:()=>!S.bcArcClosed&&S.bcNodes>=75, title:"The Ambassador", titleEs:"La embajadora", body:"An ambassador arrives without flags, cameras, or an official announcement. She walks through the settlement, inspects the port, power grid, and mine, and asks careful questions about the people who live here. Before boarding her boat, she hands you a direct number. “If you ever decide this is more than a project, call me first.”", bodyEs:"Una embajadora llega sin banderas, cámaras ni anuncio oficial. Recorre el asentamiento, inspecciona el puerto, la red eléctrica y la mina, y hace preguntas precisas sobre las personas que viven aquí. Antes de subir a su barco, te entrega un número directo. «Si alguna vez decides que esto es más que un proyecto, llámame primero»." },
    { id:"threeColors", kind:"report", after:["ambassador"], title:"Three Colors", titleEs:"Tres colores", body:"A third color closes the map.\n\nSaudi Arabia, Jordan, Morocco, Thailand, and Brunei form the Crown Lattice around dynastic authority, port agreements, and the belief that borders are inherited rather than negotiated. High Warden Soren Pell walks at the front of the procession and does not wave. To him, a people who will not kneel are an administrative error.\n\nWhere the Meridian Pact files a form and the Red Ledger prints a poster, the Crown Lattice holds a parade and then imposes silence. Dissent is not debated. It is omitted. Gray areas on the map—including a small island that keeps buying generators—are now labeled unassigned.", bodyEs:"Un tercer color cierra el mapa.\n\nArabia Saudita, Jordania, Marruecos, Tailandia y Brunéi forman la Celosía de la Corona en torno a la autoridad dinástica, los acuerdos portuarios y la idea de que las fronteras se heredan en lugar de negociarse. El Alto Guardián Soren Pell camina al frente del cortejo y no saluda. Para él, un pueblo que no se arrodilla es un error administrativo.\n\nMientras el Pacto Meridiano presenta formularios y el Libro Rojo imprime carteles, la Celosía de la Corona organiza un desfile y después impone silencio. La disidencia no se debate: se omite. Las zonas grises del mapa —incluida una pequeña isla que continúa comprando generadores— ahora aparecen como territorios sin asignar." },
    { id:"ortegaCalls", kind:"choice", after:["threeColors"], title:"Mr Ortega & Gambette Calls", titleEs:"Llama el señor Ortega & Gambette", body:"Mr Ortega & Gambette calls after studying the three blocs now surrounding the island. He has prepared ninety-three pages on recognition, treaties, fisheries, ceremonial precedence, and the exact order in which ministers should enter a room. He offers the complete diplomatic package, though he admits that a shorter review could still be useful.", bodyEs:"El señor Ortega & Gambette llama después de estudiar los tres bloques que ahora rodean la isla. Ha preparado 93 páginas sobre reconocimiento, tratados, pesca, precedencia ceremonial y el orden exacto en que los ministros deben entrar a una sala. Ofrece el paquete diplomático completo, aunque admite que una revisión más breve también podría ser útil.", opts:[{k:"a",label:"Hire him for the full package · $25,000",labelEs:"Contratar el paquete completo · $25,000"},{k:"b",label:"Review only the essential pages",labelEs:"Revisar solo las páginas esenciales"},{k:"c",label:"Decline diplomatic assistance",labelEs:"Rechazar la asistencia diplomática"}] },
    { id:"theQuestion", kind:"choice", after:["ortegaCalls"], when:()=>S.bcNodes>=100&&!S.bcIndependent&&!S.bcVictory, title:"The Question", titleEs:"La pregunta", body:"The checklist is complete enough to become dangerous. Land. Power. Water. People. Money. Rules. Security. Recognition. Marek looks at the only unchecked line: independence. Crossing it out will turn the island from a project into a country. It will also force all three blocs to decide what they think that country is.", bodyEs:"La lista está lo bastante completa como para volverse peligrosa. Tierra. Energía. Agua. Población. Dinero. Normas. Seguridad. Reconocimiento. Marek observa la única línea pendiente: independencia. Marcarla convertirá la isla de un proyecto en un país. También obligará a los tres bloques a decidir qué representa ese país para ellos.", opts:[{k:"a",label:"Declare independence",labelEs:"Declarar la independencia"},{k:"b",label:"Not yet",labelEs:"Aún no"}] },
    { id:"cabinet", kind:"report", after:["theQuestion"], when:()=>!!S.bcIndependent&&!S.bcVictory, title:"The Cabinet", titleEs:"El gabinete", body:"The declaration needs a government—and names beside every office.\n\nYou become Head of State. Marek takes Finance and asks you not to spend the first week proving why the job is necessary. Nico claims Commerce and repeats the title as if the ministry had been his idea. Paco is Minister of Defense. He says it once and laughs, then says it again. The second time, he does not.\n\nMadame Luck declines a ministry. She says the island already has enough titles and someone should remember why all of this began.", bodyEs:"La declaración necesita un gobierno y un nombre junto a cada cargo.\n\nAsumes la jefatura de Estado. Marek asume Finanzas y te pide que no pases la primera semana demostrando por qué su cargo es necesario. Nico reclama Comercio y repite el título como si el ministerio hubiera sido idea suya. Paco es ministro de Defensa. Lo dice una vez y se ríe; después lo repite. La segunda vez ya no se ríe.\n\nMadame Luck rechaza un ministerio. Dice que la isla ya tiene suficientes títulos y que alguien debería recordar por qué comenzó todo esto." },
    { id:"declaration", kind:"report", after:["cabinet"], when:()=>!!S.bcIndependent, title:"Declaration", titleEs:"La declaración", body:"The cabinet gathers around the final page. You sign the declaration and publish it to the world. For thirty-seven seconds, nothing happens. Then San Arnaldo recognizes Bitcoin Country. Mr Ortega & Gambette responds with a thumbs-up and a fourteen-page attachment on the proper protocol for receiving recognition.", bodyEs:"El gabinete se reúne alrededor de la última página. Firmas la declaración y la publicas para el mundo. Durante 37 segundos no ocurre nada. Entonces San Arnaldo reconoce a Bitcoin Country. El señor Ortega & Gambette responde con un pulgar arriba y un documento adjunto de 14 páginas sobre el protocolo adecuado para recibir un reconocimiento." },
    { id:"theAnswer", kind:"report", after:["declaration"], when:()=>false, title:"The Answer", titleEs:"La respuesta", body:"The statements arrive in different formats: a formal rejection, a request for time, a recognition with conditions. The wording changes from bloc to bloc. The consequence does not. None of them will accept Bitcoin Country outside the borders they drew, and their fleets are already leaving port.", bodyEs:"Los comunicados llegan en formatos distintos: un rechazo formal, una solicitud de tiempo, un reconocimiento sujeto a condiciones. Las palabras cambian de un bloque a otro. La consecuencia no. Ninguno aceptará a Bitcoin Country fuera de las fronteras que trazó, y sus flotas ya están saliendo de puerto." },
    { id:"blocReplies", kind:"report", when:()=>false, title:"The Replies", titleEs:"Las respuestas", body:"The three blocs answer the declaration in different ways, but every response conceals the same military preparation.", bodyEs:"Los tres bloques responden a la declaración de maneras distintas, pero todas las respuestas ocultan la misma preparación militar." },
    { id:"blocAssault", kind:"report", when:()=>false, title:"Incoming Fire", titleEs:"Fuego enemigo", body:"A bloc opens fire while its prepared communiqué declares the attack unavoidable. Bitcoin Country must hold the island.", bodyEs:"Un bloque abre fuego mientras su comunicado preparado declara que el ataque era inevitable. Bitcoin Country debe defender la isla." },
    { id:"battleWon", kind:"report", when:()=>false, title:"The Beach Holds", titleEs:"La playa resiste", body:"The landing is repelled. Bitcoin Country holds the shore, but the campaign is not over.", bodyEs:"El desembarco es rechazado. Bitcoin Country conserva la costa, pero la campaña aún no ha terminado." },
    { id:"blocTriumph", kind:"report", when:()=>false, title:"Bloc Defeated", titleEs:"Bloque derrotado", body:"After its third failed assault, a bloc withdraws and recognizes Bitcoin Country as a nation.", bodyEs:"Tras su tercer ataque fallido, un bloque se retira y reconoce a Bitcoin Country como nación." },
    { id:"fourthColor", kind:"report", after:["theAnswer"], when:()=>(S.bcBattlesWon||0)>=9, opts:[{k:"keep",label:"Keep playing",labelEs:"Seguir jugando",hideCost:true},{k:"end",label:"End the game",labelEs:"Terminar la partida",hideCost:true}], title:"A Fourth Color", titleEs:"Un cuarto color", body:"It is over. One bloc filed its final protest and lost the sea lane. Another ran out of ships it was willing to acknowledge. The third, which never apologizes, stopped answering the radio.\n\nThe island still stands. By morning, statements begin to arrive. Some governments call for negotiations; others carefully avoid the word country. San Arnaldo does not. Marek studies the map for a moment, then points to the new border. “You really did it.” At noon, the bakery reopens. The baker has amended the sign: national holidays, three a year at most.", bodyEs:"Se acabó. Un bloque presentó su última protesta y perdió la ruta marítima. Otro se quedó sin barcos que estuviera dispuesto a reconocer. El tercero, que nunca se disculpa, dejó de responder por radio.\n\nLa isla sigue en pie. Por la mañana comienzan a llegar comunicados. Algunos gobiernos piden negociaciones; otros evitan cuidadosamente la palabra país. San Arnaldo no. Marek estudia el mapa por un momento y señala la nueva frontera. «De verdad lo lograste». Al mediodía, la panadería vuelve a abrir. El panadero corrigió el cartel: feriados nacionales, tres por año como máximo." },
    { id:"notYet", kind:"report", after:["theAnswer"], when:()=>false, title:"Not Yet", titleEs:"Todavía no", body:"The defensive line breaks. The last defenders fall back from the shore as the fleet takes the port. By nightfall, the flag is down and the transmitters are silent.", bodyEs:"La línea defensiva se rompe. Los últimos defensores retroceden desde la costa mientras la flota toma el puerto. Al caer la noche, la bandera ha sido retirada y los transmisores están en silencio." },
    
  ];
  CHANCE_CARDS.push(...JOB_ARC_CARDS);
  // Marek's chess card: a pool of seven historical positions (all verified with python-chess + Stockfish 17.1).
  // One is picked per appearance; the pick lives in S.chessPick and the last four picks (across runs) are
  // kept in localStorage so the same problem never comes back too soon.
  const CHESS_POOL = [
    { slug: "opera", side: "w", n: 15, key: "Bxd7+", uci: "b5d7",
      fen: "4kb1r/p2r1ppp/4qn2/1B2p1B1/4P3/1Q6/PPP2PPP/2KR4 w k - 2 15", last: "e7e6",
      title: "The Opera Game", titleEs: "La partida de la ópera",
      tldr: "Marek sets up Morphy's Opera Game (Paris, 1858) and offers a bitcoin if you type White's first move of the finish. A miss costs nothing.",
      tldrEs: "Marek arma la partida de la ópera de Morphy (París, 1858) y te ofrece un bitcoin si escribes la primera jugada blanca del final. Fallar no cuesta nada.",
      body: "Marek clears the wine glasses off the table and sets up a chessboard from memory.\n\n\"Paris, 1858. The opera house, during The Barber of Seville. Paul Morphy is twenty-one, American, and the guest of the Duke of Brunswick in his private box. The duke and Count Isouard play him together, consulting on every move. Morphy sits with his back to the stage and keeps turning to hear the singers, so he doesn't take long.\"\n\nHe places the last piece: the position after 14...Qe6.\n\n\"White to move. Morphy needed three more moves to finish it. Type the first one. Find it and the bitcoin is yours. Miss it and you owe me nothing but an apology to Morphy.\"",
      bodyEs: "Marek retira las copas de la mesa y arma un tablero de ajedrez de memoria.\n\n\"París, 1858. La ópera, durante El barbero de Sevilla. Paul Morphy tiene veintiún años, es estadounidense y es invitado del duque de Brunswick en su palco. El duque y el conde Isouard juegan juntos contra él y discuten cada jugada. Morphy está de espaldas al escenario y se da vuelta a cada rato para escuchar a los cantantes, así que no se demora\".\n\nColoca la última pieza: la posición después de 14...De6.\n\n\"Juegan las blancas. A Morphy le bastaron tres jugadas más para terminar. Escribe la primera. Si la encuentras, el bitcoin es tuyo. Si fallas, solo le debes una disculpa a Morphy\".",
      line: "15. Bxd7+ Nxd7 16. Qb8+!! Nxb8 17. Rd8#", lineEs: "15. Axd7+ Cxd7 16. Db8+!! Cxb8 17. Td8#",
      win: "\"The bishop first, then the queen, then the rook. Morphy saw it from a box seat.\"",
      winEs: "\"Primero el alfil, después la dama, después la torre. Morphy lo vio desde un palco\".",
      miss: "\"The bishop opens the file, the queen gives herself up, the rook mates. You can pay me in wine.\"",
      missEs: "\"El alfil abre la columna, la dama se entrega y la torre da mate. Págame con vino\".",
      tWin: "Marek plays it out: 15. Bxd7+ Nxd7 16. Qb8+!! Nxb8 17. Rd8#. He slides the bitcoin across the table.",
      tWinEs: "Marek lo juega por ti: 15. Axd7+ Cxd7 16. Db8+!! Cxb8 17. Td8#. Te pasa el bitcoin por la mesa.",
      tMiss: "Marek shows you Morphy's line: 15. Bxd7+ Nxd7 16. Qb8+!! Nxb8 17. Rd8#. “You can pay me in wine.”",
      tMissEs: "Marek te muestra la línea de Morphy: 15. Axd7+ Cxd7 16. Db8+!! Cxb8 17. Td8#. “Págame con vino”." },
    { slug: "immortal", side: "w", n: 21, key: "Nxg7+", uci: "f5g7",
      fen: "r1b1k1nr/p2p1ppp/n2B4/1p1NPN1P/6P1/3P1Q2/P1P1K3/q5b1 w kq - 2 21", last: "b8a6",
      title: "The Immortal Game", titleEs: "La partida inmortal",
      tldr: "Marek sets up Anderssen's Immortal Game (London, 1851) and offers a bitcoin for White's first move of a mate in three. A miss costs nothing.",
      tldrEs: "Marek arma la partida inmortal de Anderssen (Londres, 1851) y te ofrece un bitcoin por la primera jugada blanca de un mate en tres. Fallar no cuesta nada.",
      body: "Marek pours the last of the wine and sets up the pieces with unusual care.\n\n\"London, 1851. The first international tournament is on, but this is only a casual game at Simpson's Divan, a smoky coffee house on the Strand. Adolf Anderssen, a mathematics teacher from Breslau, against Lionel Kieseritzky, who earns his living in Paris giving lessons by the hour. Anderssen has already given away a bishop and both rooks, and Black's queen is gobbling up his back rank. Kieseritzky thinks he is winning.\"\n\nHe places the last piece: the position after 20...Na6.\n\n\"White to move and mate in three. Type the first move. Find it and the bitcoin is yours. Miss it and it costs you nothing.\"",
      bodyEs: "Marek sirve lo que queda del vino y acomoda las piezas con un cuidado poco habitual.\n\n\"Londres, 1851. Se juega el primer torneo internacional, pero esta es apenas una partida amistosa en el Simpson's Divan, un café lleno de humo en el Strand. Adolf Anderssen, profesor de matemáticas de Breslau, contra Lionel Kieseritzky, que en París se gana la vida dando clases por hora. Anderssen ya regaló un alfil y las dos torres, y la dama negra se está comiendo su primera fila. Kieseritzky cree que va ganando\".\n\nColoca la última pieza: la posición después de 20...Ca6.\n\n\"Juegan las blancas y dan mate en tres. Escribe la primera jugada. Si la encuentras, el bitcoin es tuyo. Si fallas, no te cuesta nada\".",
      line: "21. Nxg7+ Kd8 22. Qf6+!! Nxf6 23. Be7#", lineEs: "21. Cxg7+ Rd8 22. Df6+!! Cxf6 23. Ae7#",
      win: "\"Two rooks, a bishop, then the queen. Three minor pieces finish the job. Kieseritzky was so impressed he sent the moves to his club in Paris himself.\"",
      winEs: "\"Dos torres, un alfil y después la dama. Tres piezas menores terminan el trabajo. A Kieseritzky le impresionó tanto que él mismo envió las jugadas a su club de París\".",
      miss: "\"The knight checks, the queen is offered, the bishop mates. Anderssen gave away almost everything and kept exactly enough.\"",
      missEs: "\"El caballo da jaque, la dama se ofrece y el alfil da mate. Anderssen regaló casi todo y se quedó con lo justo\".",
      tWin: "Marek plays it out: 21. Nxg7+ Kd8 22. Qf6+!! Nxf6 23. Be7#. Three minor pieces finish the job. The bitcoin is yours.",
      tWinEs: "Marek lo juega por ti: 21. Cxg7+ Rd8 22. Df6+!! Cxf6 23. Ae7#. Tres piezas menores terminan el trabajo. El bitcoin es tuyo.",
      tMiss: "Marek shows you Anderssen's line: 21. Nxg7+ Kd8 22. Qf6+!! Nxf6 23. Be7#. “He gave away almost everything and kept exactly enough.”",
      tMissEs: "Marek te muestra la línea de Anderssen: 21. Cxg7+ Rd8 22. Df6+!! Cxf6 23. Ae7#. “Regaló casi todo y se quedó con lo justo”." },
    { slug: "evergreen", side: "w", n: 21, key: "Qxd7+", uci: "a4d7",
      fen: "1r2k1r1/pbppnp1p/1b3P2/8/Q7/B1PB1q2/P4PPP/3R2K1 w - - 0 21", last: "c6e7",
      title: "The Evergreen Game", titleEs: "La siempreviva",
      tldr: "Marek sets up Anderssen's Evergreen Game (Berlin, 1852) and offers a bitcoin for White's first move of a mate in four. A miss costs nothing.",
      tldrEs: "Marek arma la siempreviva de Anderssen (Berlín, 1852) y te ofrece un bitcoin por la primera jugada blanca de un mate en cuatro. Fallar no cuesta nada.",
      body: "Marek turns the board so the white pieces face you.\n\n\"Berlin, 1852. Another friendly game, another Anderssen sacrifice. His opponent, Jean Dufresne, wrote one of the most popular chess handbooks in Germany. Black's queen has just taken the knight on f3 and aims at g2, one move from mate. Years later Steinitz called this game an evergreen in Anderssen's laurel wreath, and the name stuck.\"\n\nHe places the last piece: the position after 20...Nxe7.\n\n\"White to move and mate in four, before that queen gets her turn. Type the first move. Find it and the bitcoin is yours. Miss it and it costs you nothing.\"",
      bodyEs: "Marek gira el tablero para que las blancas queden de tu lado.\n\n\"Berlín, 1852. Otra partida amistosa, otro sacrificio de Anderssen. Su rival, Jean Dufresne, escribió uno de los manuales de ajedrez más populares de Alemania. La dama negra acaba de tomar el caballo de f3 y apunta a g2, a una jugada del mate. Años después, Steinitz llamó a esta partida la siempreviva de la corona de laureles de Anderssen, y el nombre quedó\".\n\nColoca la última pieza: la posición después de 20...Cxe7.\n\n\"Juegan las blancas y dan mate en cuatro, antes de que esa dama tenga su turno. Escribe la primera jugada. Si la encuentras, el bitcoin es tuyo. Si fallas, no te cuesta nada\".",
      line: "21. Qxd7+!! Kxd7 22. Bf5+ Ke8 23. Bd7+ Kf8 24. Bxe7#", lineEs: "21. Dxd7+!! Rxd7 22. Af5+ Re8 23. Ad7+ Rf8 24. Axe7#",
      win: "\"A queen for a pawn, then two bishops on a wide-open board. Dufresne never got to play Qxg2.\"",
      winEs: "\"Una dama por un peón y después dos alfiles en un tablero abierto. Dufresne nunca llegó a jugar Dxg2\".",
      miss: "\"Every move has to be check, or her queen mates you on g2. Anderssen started with the biggest one.\"",
      missEs: "\"Cada jugada tiene que ser jaque, o su dama te da mate en g2. Anderssen empezó por el más grande\".",
      tWin: "Marek plays it out: 21. Qxd7+!! Kxd7 22. Bf5+ Ke8 23. Bd7+ Kf8 24. Bxe7#. “Dufresne never got to play Qxg2.”",
      tWinEs: "Marek lo juega por ti: 21. Dxd7+!! Rxd7 22. Af5+ Re8 23. Ad7+ Rf8 24. Axe7#. “Dufresne nunca llegó a jugar Dxg2”.",
      tMiss: "Marek shows you Anderssen's line: 21. Qxd7+!! Kxd7 22. Bf5+ Ke8 23. Bd7+ Kf8 24. Bxe7#. “Every move has to be check.”",
      tMissEs: "Marek te muestra la línea de Anderssen: 21. Dxd7+!! Rxd7 22. Af5+ Re8 23. Ad7+ Rf8 24. Axe7#. “Cada jugada tiene que ser jaque”." },
    { slug: "saavedra", side: "w", n: 6, key: "c8=R", uci: "c7c8r",
      fen: "8/2P5/8/8/3r4/8/2K5/k7 w - - 9 6", last: "d3d4",
      title: "The Saavedra Position", titleEs: "La posición de Saavedra",
      tldr: "Marek sets up an 1895 endgame from Glasgow, a pawn against a rook, and offers a bitcoin for the move that wins. A miss costs nothing.",
      tldrEs: "Marek arma un final de Glasgow de 1895, un peón contra una torre, y te ofrece un bitcoin por la jugada que gana. Fallar no cuesta nada.",
      body: "Marek sweeps almost every piece off the board. Two kings, one white pawn, one black rook.\n\n\"Glasgow, 1895. A newspaper chess column prints this ending, taken from an old game, and declares it a draw. A Spanish priest living in the city, Father Fernando Saavedra, reads it and writes in to say the column is wrong. His name is now on the most famous endgame study ever made.\"\n\nHe places the last piece: the position after 5...Rd4.\n\n\"White to move and win. One warning: the obvious move only draws. Type the move that wins. Find it and the bitcoin is yours. Miss it and it costs you nothing.\"",
      bodyEs: "Marek retira casi todas las piezas del tablero. Dos reyes, un peón blanco y una torre negra.\n\n\"Glasgow, 1895. La columna de ajedrez de un periódico publica este final, sacado de una partida vieja, y lo declara tablas. Un sacerdote español que vive en la ciudad, el padre Fernando Saavedra, lo lee y escribe para decir que la columna se equivoca. Hoy su nombre está en el estudio de finales más famoso de la historia\".\n\nColoca la última pieza: la posición después de 5...Td4.\n\n\"Juegan las blancas y ganan. Una advertencia: la jugada obvia solo empata. Escribe la jugada que gana. Si la encuentras, el bitcoin es tuyo. Si fallas, no te cuesta nada\".",
      line: "6. c8=R!! Ra4 7. Kb3", lineEs: "6. c8=T!! Ta4 7. Rb3",
      win: "\"A queen walks into 6...Rc4+ 7. Qxc4, stalemate. A rook threatens Rc1# and Kxa4 at the same time. Saavedra wanted less, and won.\"",
      winEs: "\"Con dama llega 6...Tc4+ 7. Dxc4, ahogado. Con torre amenazas Tc1# y Rxa4 a la vez. Saavedra pidió menos y ganó\".",
      miss: "\"Crown a queen and Black plays 6...Rc4+, and taking the rook is stalemate. A rook threatens Rc1# and Kxa4 at once.\"",
      missEs: "\"Si coronas dama, las negras juegan 6...Tc4+, y tomar la torre es ahogado. Con torre amenazas Tc1# y Rxa4 a la vez\".",
      tWin: "Marek plays it out: 6. c8=R!! Ra4 7. Kb3, threatening Rc1# and Kxa4. “Saavedra wanted less, and won.” The bitcoin is yours.",
      tWinEs: "Marek lo juega por ti: 6. c8=T!! Ta4 7. Rb3, con amenaza de Tc1# y Rxa4. “Saavedra pidió menos y ganó”. El bitcoin es tuyo.",
      tMiss: "Marek shows you Saavedra's move: 6. c8=R!! A queen allows 6...Rc4+ and stalemate. A rook threatens Rc1# and Kxa4.",
      tMissEs: "Marek te muestra la jugada de Saavedra: 6. c8=T!! Con dama llega 6...Tc4+ y el ahogado. Con torre amenazas Tc1# y Rxa4." },
    { slug: "kinghunt", side: "w", n: 11, key: "Qxh7+", uci: "h5h7",
      fen: "rn3rk1/pbppq1pp/1p2pb2/4N2Q/3PN3/3B4/PPP2PPP/R3K2R w KQ - 6 11", last: "d8e7",
      title: "The King Hunt", titleEs: "La cacería del rey",
      tldr: "Marek sets up a casual London game from 1912 and offers a bitcoin for White's first move of a forced mate. A miss costs nothing.",
      tldrEs: "Marek arma una partida amistosa de Londres de 1912 y te ofrece un bitcoin por la primera jugada blanca de un mate forzado. Fallar no cuesta nada.",
      body: "Marek sets up the board quickly, as if he has done it many times.\n\n\"London, 1912. Edward Lasker, a young German engineer, plays a casual game against George Thomas, who will later be British chess champion and is already one of the best badminton players in England. Black has castled and feels safe behind his pawns. What comes next is the most famous king hunt ever played: the black king will walk from one side of the board to the other, and it will not walk back.\"\n\nHe places the last piece: the position after 10...Qe7.\n\n\"White to move and force mate. Type the first move. Find it and the bitcoin is yours. Miss it and it costs you nothing.\"",
      bodyEs: "Marek arma el tablero rápido, como si lo hubiera hecho muchas veces.\n\n\"Londres, 1912. Edward Lasker, un joven ingeniero alemán, juega una partida amistosa contra George Thomas, que después será campeón británico de ajedrez y ya es uno de los mejores jugadores de bádminton de Inglaterra. Las negras enrocaron y se sienten seguras detrás de sus peones. Lo que sigue es la cacería de rey más famosa de la historia: el rey negro cruzará el tablero de un lado al otro, y no va a volver\".\n\nColoca la última pieza: la posición después de 10...De7.\n\n\"Juegan las blancas y fuerzan el mate. Escribe la primera jugada. Si la encuentras, el bitcoin es tuyo. Si fallas, no te cuesta nada\".",
      line: "11. Qxh7+!! Kxh7 12. Nxf6+ Kh6 13. Neg4+ Kg5 14. h4+ Kf4 15. g3+ Kf3 16. Be2+ Kg2 17. Rh2+ Kg1 18. Kd2#",
      lineEs: "11. Dxh7+!! Rxh7 12. Cxf6+ Rh6 13. Ceg4+ Rg5 14. h4+ Rf4 15. g3+ Rf3 16. Ae2+ Rg2 17. Th2+ Rg1 18. Rd2#",
      win: "\"From g8 to g1, and Lasker mates him with a king move. Thomas went on to win the British championship twice.\"",
      winEs: "\"De g8 a g1, y Lasker le da mate con una jugada de rey. Thomas igual ganó dos veces el campeonato británico\".",
      miss: "\"The queen goes first, and then the king never gets a quiet move again.\"",
      missEs: "\"Primero se entrega la dama, y después el rey no vuelve a tener una jugada tranquila\".",
      tWin: "Marek plays it out: the queen sacrifice 11. Qxh7+!! drives the black king from g8 to g1, where 18. Kd2# ends it. The bitcoin is yours.",
      tWinEs: "Marek lo juega por ti: el sacrificio 11. Dxh7+!! lleva al rey negro de g8 a g1, donde 18. Rd2# termina todo. El bitcoin es tuyo.",
      tMiss: "Marek shows you Lasker's hunt: 11. Qxh7+!! drags the black king all the way to g1, and 18. Kd2# ends it.",
      tMissEs: "Marek te muestra la cacería de Lasker: 11. Dxh7+!! arrastra al rey negro hasta g1, y 18. Rd2# termina todo." },
    { slug: "goldcoins", side: "b", n: 23, key: "Qg3", uci: "c3g3",
      fen: "5rk1/pp4pp/4p3/2R3Q1/3n4/2q4r/P1P2PPP/5RK1 b - - 1 23", last: "e5c5",
      title: "The Gold Coins Game", titleEs: "La partida de las monedas de oro",
      tldr: "Marek sets up Marshall's most famous game (Breslau, 1912) and offers a bitcoin if you find Black's move. A miss costs nothing.",
      tldrEs: "Marek arma la partida más famosa de Marshall (Breslavia, 1912) y te ofrece un bitcoin si encuentras la jugada de las negras. Fallar no cuesta nada.",
      body: "Marek turns the board around. This time you have the black pieces.\n\n\"Breslau, 1912. Frank Marshall, the American champion, has Black against Stepan Levitsky of Russia. Levitsky's rook has just attacked Marshall's queen. Marshall later wrote that, after his reply, the spectators showered the board with gold coins. Historians doubt the coins. Nobody doubts the move.\"\n\nHe places the last piece: the position after 23. Rc5.\n\n\"Black to move. Marshall put his queen on a square where three white pieces could take her, and every capture lost. Type his move. Find it and the bitcoin is yours. Miss it and it costs you nothing.\"",
      bodyEs: "Marek gira el tablero. Esta vez llevas las negras.\n\n\"Breslavia, 1912. Frank Marshall, campeón de Estados Unidos, juega con negras contra el ruso Stepan Levitsky. La torre de Levitsky acaba de atacar la dama de Marshall. Marshall escribió después que, tras su respuesta, el público llenó el tablero de monedas de oro. Los historiadores dudan de las monedas. Nadie duda de la jugada\".\n\nColoca la última pieza: la posición después de 23. Tc5.\n\n\"Juegan las negras. Marshall puso la dama en una casilla donde tres piezas blancas podían tomarla, y cualquier captura perdía. Escribe su jugada. Si la encuentras, el bitcoin es tuyo. Si fallas, no te cuesta nada\".",
      line: "23... Qg3!!", lineEs: "23... Dg3!!",
      win: "\"24. hxg3 Ne2#. 24. fxg3 Ne2+ 25. Kh1 Rxf1#. 24. Qxg3 Ne2+ 25. Kh1 Nxg3+ and Black stays a piece up. Levitsky resigned on the spot.\"",
      winEs: "\"24. hxg3 Ce2#. 24. fxg3 Ce2+ 25. Rh1 Txf1#. 24. Dxg3 Ce2+ 25. Rh1 Cxg3+ y las negras quedan con una pieza de más. Levitsky abandonó en el acto\".",
      miss: "\"Take it with the h-pawn and Ne2 is mate. Take it with the f-pawn and the rook mates on f1. Levitsky resigned.\"",
      missEs: "\"Si la toma el peón h, Ce2 es mate. Si la toma el peón f, la torre da mate en f1. Levitsky abandonó\".",
      tWin: "Marek plays it out: 23... Qg3!! Every capture loses, and Levitsky resigned on the spot. The bitcoin is yours.",
      tWinEs: "Marek lo juega por ti: 23... Dg3!! Cualquier captura pierde, y Levitsky abandonó en el acto. El bitcoin es tuyo.",
      tMiss: "Marek shows you Marshall's move: 23... Qg3!! Three white pieces can take the queen, and every capture loses. Levitsky resigned.",
      tMissEs: "Marek te muestra la jugada de Marshall: 23... Dg3!! Tres piezas blancas pueden tomar la dama, y cualquier captura pierde. Levitsky abandonó." },
    { slug: "century", side: "b", n: 17, key: "Be6", uci: "g4e6",
      fen: "r3r1k1/pp3pbp/1qp3p1/2B5/2BP2b1/Q1n2N2/P4PPP/3R1K1R b - - 3 17", last: "e1f1",
      title: "The Game of the Century", titleEs: "La partida del siglo",
      tldr: "Marek sets up Byrne–Fischer (New York, 1956) and offers a bitcoin if you find the move a thirteen-year-old played. A miss costs nothing.",
      tldrEs: "Marek arma Byrne–Fischer (Nueva York, 1956) y te ofrece un bitcoin si encuentras la jugada de un chico de trece años. Fallar no cuesta nada.",
      body: "Marek sets up the board with the black pieces on your side.\n\n\"New York, October 1956. The Rosenwald tournament at the Marshall Chess Club. Donald Byrne is one of the strongest players in the country. Across the board sits Bobby Fischer, thirteen years old. Byrne's bishop has just attacked Fischer's queen, and any sensible player would move her. Hans Kmoch, the editor who annotated it for Chess Review, called it the Game of the Century.\"\n\nHe places the last piece: the position after 17. Kf1.\n\n\"Black to move. Fischer did not save his queen. Type his move. Find it and the bitcoin is yours. Miss it and it costs you nothing.\"",
      bodyEs: "Marek arma el tablero con las negras de tu lado.\n\n\"Nueva York, octubre de 1956. El torneo Rosenwald, en el Marshall Chess Club. Donald Byrne es uno de los mejores jugadores del país. Frente a él se sienta Bobby Fischer, de trece años. El alfil de Byrne acaba de atacar la dama de Fischer, y cualquier jugador sensato la movería. Hans Kmoch, el editor que la comentó para Chess Review, la llamó la partida del siglo\".\n\nColoca la última pieza: la posición después de 17. Rf1.\n\n\"Juegan las negras. Fischer no salvó su dama. Escribe su jugada. Si la encuentras, el bitcoin es tuyo. Si fallas, no te cuesta nada\".",
      line: "17... Be6!! 18. Bxb6 Bxc4+ 19. Kg1 Ne2+ 20. Kf1 Nxd4+ 21. Kg1 Ne2+ 22. Kf1 Nc3+ 23. Kg1 axb6",
      lineEs: "17... Ae6!! 18. Axb6 Axc4+ 19. Rg1 Ce2+ 20. Rf1 Cxd4+ 21. Rg1 Ce2+ 22. Rf1 Cc3+ 23. Rg1 axb6",
      win: "\"The windmill. For the queen he takes a rook, two bishops and a pawn, and he mates Byrne on move 41.\"",
      winEs: "\"El molino. Por la dama se lleva una torre, dos alfiles y un peón, y le da mate a Byrne en la jugada 41\".",
      miss: "\"He lets the queen go and the knight starts spinning. Byrne played on until Fischer mated him on move 41.\"",
      missEs: "\"Deja ir la dama y el caballo empieza a girar. Byrne siguió jugando hasta que Fischer le dio mate en la jugada 41\".",
      tWin: "Marek plays it out: 17... Be6!! gives up the queen for a rook, two bishops and a pawn. Fischer mates on move 41. The bitcoin is yours.",
      tWinEs: "Marek lo juega por ti: 17... Ae6!! entrega la dama por una torre, dos alfiles y un peón. Fischer da mate en la jugada 41. El bitcoin es tuyo.",
      tMiss: "Marek shows you Fischer's move: 17... Be6!! He lets the queen go and mates Byrne on move 41.",
      tMissEs: "Marek te muestra la jugada de Fischer: 17... Ae6!! Deja ir la dama y le da mate a Byrne en la jugada 41." }
  ];
  // Board diagram of the chess problem, drawn at runtime from its FEN as inline SVG (no downloads, crisp on any screen).
  // Oriented from the side to move, with coordinates and the previous move highlighted; it never shows the answer.
  // Piece shapes: Colin M.L. Burnett's set (BSD/GPL/GFDL tri-licensed), as shipped in python-chess.
  const CHESS_PIECE_SVG = {"b":"<g fill=\"none\" fill-rule=\"evenodd\" stroke=\"#000\" stroke-width=\"1.5\" stroke-linecap=\"round\" stroke-linejoin=\"round\"><path d=\"M9 36c3.39-.97 10.11.43 13.5-2 3.39 2.43 10.11 1.03 13.5 2 0 0 1.65.54 3 2-.68.97-1.65.99-3 .5-3.39-.97-10.11.46-13.5-1-3.39 1.46-10.11.03-13.5 1-1.354.49-2.323.47-3-.5 1.354-1.94 3-2 3-2zm6-4c2.5 2.5 12.5 2.5 15 0 .5-1.5 0-2 0-2 0-2.5-2.5-4-2.5-4 5.5-1.5 6-11.5-5-15.5-11 4-10.5 14-5 15.5 0 0-2.5 1.5-2.5 4 0 0-.5.5 0 2zM25 8a2.5 2.5 0 1 1-5 0 2.5 2.5 0 1 1 5 0z\" fill=\"#000\" stroke-linecap=\"butt\"/><path d=\"M17.5 26h10M15 30h15m-7.5-14.5v5M20 18h5\" stroke=\"#fff\" stroke-linejoin=\"miter\"/></g>","k":"<g fill=\"none\" fill-rule=\"evenodd\" stroke=\"#000\" stroke-width=\"1.5\" stroke-linecap=\"round\" stroke-linejoin=\"round\"><path d=\"M22.5 11.63V6\" stroke-linejoin=\"miter\"/><path d=\"M22.5 25s4.5-7.5 3-10.5c0 0-1-2.5-3-2.5s-3 2.5-3 2.5c-1.5 3 3 10.5 3 10.5\" fill=\"#000\" stroke-linecap=\"butt\" stroke-linejoin=\"miter\"/><path d=\"M11.5 37c5.5 3.5 15.5 3.5 21 0v-7s9-4.5 6-10.5c-4-6.5-13.5-3.5-16 4V27v-3.5c-3.5-7.5-13-10.5-16-4-3 6 5 10 5 10V37z\" fill=\"#000\"/><path d=\"M20 8h5\" stroke-linejoin=\"miter\"/><path d=\"M32 29.5s8.5-4 6.03-9.65C34.15 14 25 18 22.5 24.5l.01 2.1-.01-2.1C20 18 9.906 14 6.997 19.85c-2.497 5.65 4.853 9 4.853 9M11.5 30c5.5-3 15.5-3 21 0m-21 3.5c5.5-3 15.5-3 21 0m-21 3.5c5.5-3 15.5-3 21 0\" stroke=\"#fff\"/></g>","n":"<g fill=\"none\" fill-rule=\"evenodd\" stroke=\"#000\" stroke-width=\"1.5\" stroke-linecap=\"round\" stroke-linejoin=\"round\"><path d=\"M 22,10 C 32.5,11 38.5,18 38,39 L 15,39 C 15,30 25,32.5 23,18\" style=\"fill:#000000; stroke:#000000;\"/><path d=\"M 24,18 C 24.38,20.91 18.45,25.37 16,27 C 13,29 13.18,31.34 11,31 C 9.958,30.06 12.41,27.96 11,28 C 10,28 11.19,29.23 10,30 C 9,30 5.997,31 6,26 C 6,24 12,14 12,14 C 12,14 13.89,12.1 14,10.5 C 13.27,9.506 13.5,8.5 13.5,7.5 C 14.5,6.5 16.5,10 16.5,10 L 18.5,10 C 18.5,10 19.28,8.008 21,7 C 22,7 22,10 22,10\" style=\"fill:#000000; stroke:#000000;\"/><path d=\"M 9.5 25.5 A 0.5 0.5 0 1 1 8.5,25.5 A 0.5 0.5 0 1 1 9.5 25.5 z\" style=\"fill:#ececec; stroke:#ececec;\"/><path d=\"M 15 15.5 A 0.5 1.5 0 1 1 14,15.5 A 0.5 1.5 0 1 1 15 15.5 z\" transform=\"matrix(0.866,0.5,-0.5,0.866,9.693,-5.173)\" style=\"fill:#ececec; stroke:#ececec;\"/><path d=\"M 24.55,10.4 L 24.1,11.85 L 24.6,12 C 27.75,13 30.25,14.49 32.5,18.75 C 34.75,23.01 35.75,29.06 35.25,39 L 35.2,39.5 L 37.45,39.5 L 37.5,39 C 38,28.94 36.62,22.15 34.25,17.66 C 31.88,13.17 28.46,11.02 25.06,10.5 L 24.55,10.4 z \" style=\"fill:#ececec; stroke:none;\"/></g>","p":"<g><path d=\"M22.5 9c-2.21 0-4 1.79-4 4 0 .89.29 1.71.78 2.38C17.33 16.5 16 18.59 16 21c0 2.03.94 3.84 2.41 5.03-3 1.06-7.41 5.55-7.41 13.47h23c0-7.92-4.41-12.41-7.41-13.47 1.47-1.19 2.41-3 2.41-5.03 0-2.41-1.33-4.5-3.28-5.62.49-.67.78-1.49.78-2.38 0-2.21-1.79-4-4-4z\" fill=\"#000\" stroke=\"#000\" stroke-width=\"1.5\" stroke-linecap=\"round\"/></g>","q":"<g fill=\"#000\" fill-rule=\"evenodd\" stroke=\"#000\" stroke-width=\"1.5\" stroke-linecap=\"round\" stroke-linejoin=\"round\"><g fill=\"#000\" stroke=\"none\"><circle cx=\"6\" cy=\"12\" r=\"2.75\"/><circle cx=\"14\" cy=\"9\" r=\"2.75\"/><circle cx=\"22.5\" cy=\"8\" r=\"2.75\"/><circle cx=\"31\" cy=\"9\" r=\"2.75\"/><circle cx=\"39\" cy=\"12\" r=\"2.75\"/></g><path d=\"M9 26c8.5-1.5 21-1.5 27 0l2.5-12.5L31 25l-.3-14.1-5.2 13.6-3-14.5-3 14.5-5.2-13.6L14 25 6.5 13.5 9 26zM9 26c0 2 1.5 2 2.5 4 1 1.5 1 1 .5 3.5-1.5 1-1.5 2.5-1.5 2.5-1.5 1.5.5 2.5.5 2.5 6.5 1 16.5 1 23 0 0 0 1.5-1 0-2.5 0 0 .5-1.5-1-2.5-.5-2.5-.5-2 .5-3.5 1-2 2.5-2 2.5-4-8.5-1.5-18.5-1.5-27 0z\" stroke-linecap=\"butt\"/><path d=\"M11 38.5a35 35 1 0 0 23 0\" fill=\"none\" stroke-linecap=\"butt\"/><path d=\"M11 29a35 35 1 0 1 23 0M12.5 31.5h20M11.5 34.5a35 35 1 0 0 22 0M10.5 37.5a35 35 1 0 0 24 0\" fill=\"none\" stroke=\"#fff\"/></g>","r":"<g fill=\"#000\" fill-rule=\"evenodd\" stroke=\"#000\" stroke-width=\"1.5\" stroke-linecap=\"round\" stroke-linejoin=\"round\"><path d=\"M9 39h27v-3H9v3zM12.5 32l1.5-2.5h17l1.5 2.5h-20zM12 36v-4h21v4H12z\" stroke-linecap=\"butt\"/><path d=\"M14 29.5v-13h17v13H14z\" stroke-linecap=\"butt\" stroke-linejoin=\"miter\"/><path d=\"M14 16.5L11 14h23l-3 2.5H14zM11 14V9h4v2h5V9h5v2h5V9h4v5H11z\" stroke-linecap=\"butt\"/><path d=\"M12 35.5h21M13 31.5h19M14 29.5h17M14 16.5h17M11 14h23\" fill=\"none\" stroke=\"#fff\" stroke-width=\"1\" stroke-linejoin=\"miter\"/></g>","B":"<g fill=\"none\" fill-rule=\"evenodd\" stroke=\"#000\" stroke-width=\"1.5\" stroke-linecap=\"round\" stroke-linejoin=\"round\"><g fill=\"#fff\" stroke-linecap=\"butt\"><path d=\"M9 36c3.39-.97 10.11.43 13.5-2 3.39 2.43 10.11 1.03 13.5 2 0 0 1.65.54 3 2-.68.97-1.65.99-3 .5-3.39-.97-10.11.46-13.5-1-3.39 1.46-10.11.03-13.5 1-1.354.49-2.323.47-3-.5 1.354-1.94 3-2 3-2zM15 32c2.5 2.5 12.5 2.5 15 0 .5-1.5 0-2 0-2 0-2.5-2.5-4-2.5-4 5.5-1.5 6-11.5-5-15.5-11 4-10.5 14-5 15.5 0 0-2.5 1.5-2.5 4 0 0-.5.5 0 2zM25 8a2.5 2.5 0 1 1-5 0 2.5 2.5 0 1 1 5 0z\"/></g><path d=\"M17.5 26h10M15 30h15m-7.5-14.5v5M20 18h5\" stroke-linejoin=\"miter\"/></g>","K":"<g fill=\"none\" fill-rule=\"evenodd\" stroke=\"#000\" stroke-width=\"1.5\" stroke-linecap=\"round\" stroke-linejoin=\"round\"><path d=\"M22.5 11.63V6M20 8h5\" stroke-linejoin=\"miter\"/><path d=\"M22.5 25s4.5-7.5 3-10.5c0 0-1-2.5-3-2.5s-3 2.5-3 2.5c-1.5 3 3 10.5 3 10.5\" fill=\"#fff\" stroke-linecap=\"butt\" stroke-linejoin=\"miter\"/><path d=\"M11.5 37c5.5 3.5 15.5 3.5 21 0v-7s9-4.5 6-10.5c-4-6.5-13.5-3.5-16 4V27v-3.5c-3.5-7.5-13-10.5-16-4-3 6 5 10 5 10V37z\" fill=\"#fff\"/><path d=\"M11.5 30c5.5-3 15.5-3 21 0m-21 3.5c5.5-3 15.5-3 21 0m-21 3.5c5.5-3 15.5-3 21 0\"/></g>","N":"<g fill=\"none\" fill-rule=\"evenodd\" stroke=\"#000\" stroke-width=\"1.5\" stroke-linecap=\"round\" stroke-linejoin=\"round\"><path d=\"M 22,10 C 32.5,11 38.5,18 38,39 L 15,39 C 15,30 25,32.5 23,18\" style=\"fill:#ffffff; stroke:#000000;\"/><path d=\"M 24,18 C 24.38,20.91 18.45,25.37 16,27 C 13,29 13.18,31.34 11,31 C 9.958,30.06 12.41,27.96 11,28 C 10,28 11.19,29.23 10,30 C 9,30 5.997,31 6,26 C 6,24 12,14 12,14 C 12,14 13.89,12.1 14,10.5 C 13.27,9.506 13.5,8.5 13.5,7.5 C 14.5,6.5 16.5,10 16.5,10 L 18.5,10 C 18.5,10 19.28,8.008 21,7 C 22,7 22,10 22,10\" style=\"fill:#ffffff; stroke:#000000;\"/><path d=\"M 9.5 25.5 A 0.5 0.5 0 1 1 8.5,25.5 A 0.5 0.5 0 1 1 9.5 25.5 z\" style=\"fill:#000000; stroke:#000000;\"/><path d=\"M 15 15.5 A 0.5 1.5 0 1 1 14,15.5 A 0.5 1.5 0 1 1 15 15.5 z\" transform=\"matrix(0.866,0.5,-0.5,0.866,9.693,-5.173)\" style=\"fill:#000000; stroke:#000000;\"/></g>","P":"<g><path d=\"M22.5 9c-2.21 0-4 1.79-4 4 0 .89.29 1.71.78 2.38C17.33 16.5 16 18.59 16 21c0 2.03.94 3.84 2.41 5.03-3 1.06-7.41 5.55-7.41 13.47h23c0-7.92-4.41-12.41-7.41-13.47 1.47-1.19 2.41-3 2.41-5.03 0-2.41-1.33-4.5-3.28-5.62.49-.67.78-1.49.78-2.38 0-2.21-1.79-4-4-4z\" fill=\"#fff\" stroke=\"#000\" stroke-width=\"1.5\" stroke-linecap=\"round\"/></g>","Q":"<g fill=\"#fff\" fill-rule=\"evenodd\" stroke=\"#000\" stroke-width=\"1.5\" stroke-linecap=\"round\" stroke-linejoin=\"round\"><path d=\"M8 12a2 2 0 1 1-4 0 2 2 0 1 1 4 0zM24.5 7.5a2 2 0 1 1-4 0 2 2 0 1 1 4 0zM41 12a2 2 0 1 1-4 0 2 2 0 1 1 4 0zM16 8.5a2 2 0 1 1-4 0 2 2 0 1 1 4 0zM33 9a2 2 0 1 1-4 0 2 2 0 1 1 4 0z\"/><path d=\"M9 26c8.5-1.5 21-1.5 27 0l2-12-7 11V11l-5.5 13.5-3-15-3 15-5.5-14V25L7 14l2 12zM9 26c0 2 1.5 2 2.5 4 1 1.5 1 1 .5 3.5-1.5 1-1.5 2.5-1.5 2.5-1.5 1.5.5 2.5.5 2.5 6.5 1 16.5 1 23 0 0 0 1.5-1 0-2.5 0 0 .5-1.5-1-2.5-.5-2.5-.5-2 .5-3.5 1-2 2.5-2 2.5-4-8.5-1.5-18.5-1.5-27 0z\" stroke-linecap=\"butt\"/><path d=\"M11.5 30c3.5-1 18.5-1 22 0M12 33.5c6-1 15-1 21 0\" fill=\"none\"/></g>","R":"<g fill=\"#fff\" fill-rule=\"evenodd\" stroke=\"#000\" stroke-width=\"1.5\" stroke-linecap=\"round\" stroke-linejoin=\"round\"><path d=\"M9 39h27v-3H9v3zM12 36v-4h21v4H12zM11 14V9h4v2h5V9h5v2h5V9h4v5\" stroke-linecap=\"butt\"/><path d=\"M34 14l-3 3H14l-3-3\"/><path d=\"M31 17v12.5H14V17\" stroke-linecap=\"butt\" stroke-linejoin=\"miter\"/><path d=\"M31 29.5l1.5 2.5h-20l1.5-2.5\"/><path d=\"M11 14h23\" fill=\"none\" stroke-linejoin=\"miter\"/></g>"};
  function chessDiagramHtml(cp, es) {
    if (!cp || !cp.fen) return "";
    const rows = cp.fen.split(" ")[0].split("/");
    const blackView = cp.side === "b";
    const SQ = 45, M = 20, N = 8 * SQ;
    const hi = new Set(cp.last ? [cp.last.slice(0, 2), cp.last.slice(2, 4)] : []);
    let sq = "", pcs = "", coords = "";
    for (let r = 0; r < 8; r++) {
      let f = 0;
      for (const ch of rows[r]) {
        if (/[1-8]/.test(ch)) { f += +ch; continue; }
        const x = (blackView ? 7 - f : f) * SQ + M, y = (blackView ? 7 - r : r) * SQ;
        pcs += "<g transform=\"translate(" + x + " " + y + ")\">" + (CHESS_PIECE_SVG[ch] || "") + "</g>";
        f++;
      }
    }
    for (let rank = 0; rank < 8; rank++) for (let file = 0; file < 8; file++) {
      const name = "abcdefgh"[file] + (8 - rank);
      const x = (blackView ? 7 - file : file) * SQ + M, y = (blackView ? 7 - rank : rank) * SQ;
      const light = (rank + file) % 2 === 0;
      sq += "<rect x=\"" + x + "\" y=\"" + y + "\" width=\"" + SQ + "\" height=\"" + SQ + "\" fill=\"" + (hi.has(name) ? (light ? "#e9d77a" : "#c4a94a") : (light ? "#f0d9b5" : "#b58863")) + "\"/>";
    }
    for (let i = 0; i < 8; i++) {
      const file = blackView ? "hgfedcba"[i] : "abcdefgh"[i], rank = blackView ? i + 1 : 8 - i;
      coords += "<text x=\"" + (M + i * SQ + SQ / 2) + "\" y=\"" + (N + 15) + "\" text-anchor=\"middle\">" + file + "</text>"
        + "<text x=\"" + (M / 2) + "\" y=\"" + (i * SQ + SQ / 2 + 5) + "\" text-anchor=\"middle\">" + rank + "</text>";
    }
    const who = cp.side === "w" ? (es ? "Juegan las blancas" : "White to move") : (es ? "Juegan las negras" : "Black to move");
    const lastTxt = cp.last ? (es ? " · última jugada: " : " · last move: ") + cp.last.slice(0, 2) + "–" + cp.last.slice(2, 4) : "";
    const alt = (es ? "Diagrama de la posición. " : "Position diagram. ") + who + ".";
    return "<figure class=\"chess-diagram\" data-fen=\"" + cp.fen + "\">"
      + "<svg viewBox=\"0 0 " + (N + M) + " " + (N + M) + "\" role=\"img\" aria-label=\"" + alt + "\" xmlns=\"http://www.w3.org/2000/svg\">"
      + sq + "<rect x=\"" + M + "\" y=\"0\" width=\"" + N + "\" height=\"" + N + "\" fill=\"none\" stroke=\"#5a4632\" stroke-width=\"1.5\"/>"
      + "<g class=\"chess-coords\" font-family=\"system-ui, sans-serif\" font-size=\"13\" font-weight=\"600\" fill=\"#e8dcc8\">" + coords + "</g>"
      + pcs + "</svg>"
      + "<figcaption><strong>" + who + "</strong>" + lastTxt + "</figcaption></figure>";
  }
  // Per-slug art version: bump one entry when that illustration is redrawn. A slug listed here must have
  // chance/chess-<slug>-wide.jpg (1920x800); a missing file falls back to chance/chess-wide.jpg.
  const CHESS_ART_VER = { opera: "chs1", immortal: "chs1", evergreen: "chs1", saavedra: "chs2", kinghunt: "chs2", goldcoins: "chs2", century: "chs2" };
  const CHESS_ART_READY = new Set(Object.keys(CHESS_ART_VER));
  const CHESS_HIST_KEY = "choppy-chess-hist";
  const CHESS_GAP = 4;  // never repeat any of the last four problems
  let chessHistMem = [];
  function chessHistory() {
    let h = chessHistMem;
    try { const raw = JSON.parse(localStorage.getItem(CHESS_HIST_KEY) || "[]"); if (Array.isArray(raw)) h = raw; } catch (e) {}
    return h.filter((s) => CHESS_POOL.some((p) => p.slug === s));
  }
  function pickChessProblem() {
    if (S.chessPick != null && S.chessPick >= 0 && S.chessPick < CHESS_POOL.length) return S.chessPick;
    const hist = chessHistory();
    const recent = hist.slice(-CHESS_GAP);
    let free = CHESS_POOL.map((p, i) => i).filter((i) => recent.indexOf(CHESS_POOL[i].slug) < 0);
    if (!free.length) free = CHESS_POOL.map((p, i) => i);
    const i = free[(Math.random() * free.length) | 0];
    S.chessPick = i;
    const next = hist.concat([CHESS_POOL[i].slug]).slice(-(CHESS_POOL.length - 1));
    chessHistMem = next;
    try { localStorage.setItem(CHESS_HIST_KEY, JSON.stringify(next)); } catch (e) {}
    return i;
  }
  function chessProblem() {
    const i = S.chessPick;
    return CHESS_POOL[(i != null && i >= 0 && i < CHESS_POOL.length) ? i : 0];
  }
  // Normalizes a typed move: lowercase, no move number, no x/×/:/-/=/+/#/!/? or spaces.
  function chessNorm(raw) {
    return String(raw || "").toLowerCase().replace(/^\s*\d*\s*\.+\s*/, "").replace(/[\s+#!?×x:\-=()]/g, "");
  }
  // Every reasonable way to write the key move: SAN in English or Spanish letters, long algebraic, coordinates.
  function chessAnswers(p) {
    const es = { k: "r", q: "d", r: "t", b: "a", n: "c" };
    const san = String(p.key).replace(/[+#!?x=]/g, "");
    const from = p.uci.slice(0, 2), to = p.uci.slice(2, 4), promo = p.uci.slice(4);
    const out = new Set();
    const m = san.match(/^([KQRBN])/);
    if (m) {
      const pc = m[1].toLowerCase();
      [pc, es[pc]].forEach((l) => { out.add(l + san.slice(1).toLowerCase()); out.add(l + from + to); });
      out.add(from + to);
    } else if (promo) {
      [promo, es[promo]].forEach((l) => { out.add(to + l); out.add(from + to + l); });
    } else {
      out.add(san.toLowerCase()); out.add(from + to);
    }
    return out;
  }
  function chessMoveOk(raw, prob) {
    const p = prob || chessProblem();
    return chessAnswers(p).has(chessNorm(raw));
  }
  function resolveChance(card, opt) {
    const es = chanceLang();
    const say = (en, esTxt) => (es && esTxt ? esTxt : en);
    if (card && card.jobMilestone) {
      const job = currentJob();
      const title = jobTitleAt(job, card.jobTier);
      const pay = jobPayAt(job, card.jobTier);
      arcPay(pay);
      return say("You handle the moment as " + title + " and earn " + money(pay) + ".", "Resuelves el momento como " + title + " y ganas " + money(pay) + ".");
    }
    if (card.id === "landfill") {
      if (opt === "c") return say("You stay in bed. Nico can dig at Docksway without you.",
        "Te quedas en la cama. Nico puede excavar en Docksway sin ti.");
      const pct = opt === "b" ? 0.75 : 0.25;
      const cashCut = (S.cash || 0) * pct;
      const btcCut = (S.btc || 0) * pct;
      S.cash -= cashCut;
      S.btc -= btcCut;
      const r = Math.random();
      if (r < 0.00029) {
        const share = opt === "b" ? 4000 : (4000 / 3);
        creditBtc(share);
        return say("You find the hard drive. +" + share.toFixed(2) + " BTC.",
          "Encuentras el disco duro. +" + share.toFixed(2) + " BTC.");
      }
      if (r < 0.00029 + 0.22) {
        arcPay(8);
        return say("You find an old Nokia. +$8.",
          "Encuentras un Nokia viejo. +$8.");
      }
      return say("Three weeks of digging through clay turn up nothing.",
        "Tres semanas excavando arcilla no dan ningún resultado.");
    }
    if (card.id === "taxbill") {
      const paid = cutPct(0.1);
      return say("You pay it online and file the envelope with the others. −" + costLabel(paid) + ".", "La pagas en línea y archivas el sobre con los demás. −" + costLabel(paid) + ".");
    }
    if (card.id === "nicoWedding") {
      if (opt === "c") return say("You spend the rest of the night avoiding Nico near the bar.", "Pasas el resto de la noche evitando a Nico cerca de la barra.");
      if (opt === "a") {
        const paid = cutPct(0.04);
        S.cold += 1;
        return say("They toast you. −" + costLabel(paid) + ". Nico hands you a cold-storage device. \"Part of the wedding experience.\"",
          "Brindan por ti. −" + costLabel(paid) + ". Nico te entrega un dispositivo de almacenamiento en frío. \"Es parte de la experiencia.\"");
      }
      const paid = cutPct(0.006);
      return say("Nico looks at the envelope, then at you. \"Fair.\" −" + costLabel(paid) + ".",
        "Nico mira el sobre y luego te mira a ti. \"Es justo.\" −" + costLabel(paid) + ".");
    }
    if (card.id === "mexico") {
      if (opt === "b") return say("Lena puts the swimsuit back in the drawer. Paco celebrates by destroying a cushion.", "Lena vuelve a guardar el traje de baño en el cajón. Paco lo celebra destrozando un cojín.");
      const paid = cutPct(0.08);
      S.invuln = Math.max(S.invuln || 0, 4);
      return say("You come back tanned and so relaxed that, for the next four seconds, no candle can touch you. −" + costLabel(paid) + ".",
        "Vuelves bronceado y tan relajado que, durante los próximos cuatro segundos, ninguna vela puede tocarte. −" + costLabel(paid) + ".");
    }
    if (card.id === "flu") {
      const paid = cutBill(120);
      return say("By morning her fever breaks. She asks what happened to the soup. Paco looks away. −" + costLabel(paid) + ".", "A la mañana le baja la fiebre. Pregunta qué pasó con la sopa. Paco mira para otro lado. −" + costLabel(paid) + ".");
    }
    if (card.id === "phish") {
      if (opt === "b") return say("You delete it, then spend thirty seconds checking that it is really gone.", "Lo eliminas y pasas treinta segundos comprobando que realmente desapareció.");
      const paid = cutPct(0.18);
      return say("The page looked convincing. The transfer was real. −" + costLabel(paid) + ".",
        "La página parecía convincente. La transferencia fue real. −" + costLabel(paid) + ".");
    }
    if (card.id === "crash") {
      const paid = cutBill(650);
      return say("The body shop replaces the bumper. −" + costLabel(paid) + ".",
        "El taller cambia el parachoques. −" + costLabel(paid) + ".");
    }
    if (card.id === "wine") {
      if (opt === "a") return say("The conversation eventually turns to free will and incentives.",
        "Al final, la conversación deriva hacia el libre albedrío y los incentivos.");
      if (opt === "b") {
        cutBill(17);
        return say("You finish the movie over ice cream. Marek says the ending is overrated.\n\n−$17.",
          "Terminan la película con helado. Marek dice que el final está sobrevalorado.\n\n−$17.");
      }
      cutBill(25);
      return say("You leave thinking Marek may have made a good point.\n\n−$25.",
        "Te vas pensando que quizá Marek tenía razón.\n\n−$25.");
    }
    if (card.id === "casino") {
      if (opt === "c") return say("You leave. Nico stays.", "Te vas. Nico se queda.");
      const stake = cutPct(opt === "b" ? 0.3 : 0.1);
      if (Math.random() < 0.46) {
        arcPay(stake * 2);
        if (opt === "b") { try { grantAward("highRoller"); } catch (e) {} }
        return say("The number hits. +" + money(stake * 2) + " on " + costLabel(stake) + ".",
          "Sale el número. +" + money(stake * 2) + " sobre " + costLabel(stake) + ".");
      }
      return say("The table does not know you. −" + costLabel(stake) + ".", "La mesa no te conoce. −" + costLabel(stake) + ".");
    }
    if (card.id === "poker") {
      if (opt === "c") return say("Marek gets up from the table ten minutes later. \"Probably better.\" He says it without looking at you.",
        "Marek se levanta de la mesa diez minutos después. \"Probablemente fue mejor así.\" Lo dice sin mirarte.");
      const stake = cutPct(opt === "b" ? 0.25 : 0.08);
      const r = Math.random();
      if (r < 0.06) { arcPay(stake * 8); try { grantAward("scoop"); } catch (e) {} return say("You scoop the table. +" + money(stake * 8) + ".", "Te llevas toda la mesa. +" + money(stake * 8) + "."); }
      if (r < 0.28) { arcPay(stake * 3); return say("+" + money(stake * 3) + " on a " + costLabel(stake) + " buy-in.", "+" + money(stake * 3) + " con una entrada de " + costLabel(stake) + "."); }
      if (r < 0.52) { arcPay(stake * 1.4); return say("Min-cash. +" + money(stake * 1.4) + ".", "Cobras un premio menor. +" + money(stake * 1.4) + "."); }
      return say("Busted. −" + costLabel(stake) + ".", "Eliminado. −" + costLabel(stake) + ".");
    }
    if (card.id === "uncle") {
      if (Math.random() < 0.55) {
        const n = grantWealthPct(0.07);
        return say("He hangs up before you can thank him. +" + money(n) + ".", "Cuelga antes de que puedas agradecerle. +" + money(n) + ".");
      }
      const b = Math.max(0.0001, (wealthUsd() * 0.07) / clampPx(S.price));
      const out = creditBtc(b);
      return say("He sent sats. +" + out.take.toFixed(4) + " BTC" + (out.cash ? " and +" + money(out.cash) : "") + ".",
        "Te envió sats. +" + out.take.toFixed(4) + " BTC" + (out.cash ? " y +" + money(out.cash) : "") + ".");
    }
    if (card.id === "school") {
      if (opt === "b") return say("They handle it. Sofi still sends a photo you cannot parse.", "Lo resuelven solos. Sofi te envía de todos modos una foto que no entiendes.");
      const paid = cutBill(300);
      return say("Sofi sends a photo from the museum. You have no idea what is in it. −" + costLabel(paid) + ".",
        "Sofi te envía una foto del museo. No tienes idea de qué aparece en ella. −" + costLabel(paid) + ".");
    }
    if (card.id === "roof") {
      const paid = cutBill(900);
      return say("The roof is sealed. The bill is not small. −" + costLabel(paid) + ".", "El techo queda sellado. La cuenta no es pequeña. −" + costLabel(paid) + ".");
    }
    if (card.id === "hospital") {
      const paid = cutBill(250);
      return say("The hospital bill arrives before the stitches come out. −" + costLabel(paid) + ".", "La cuenta del hospital llega antes de que te saquen los puntos. −" + costLabel(paid) + ".");
    }
    if (card.id === "startup") {
      if (opt === "b") return say("Nico says: \"Your loss.\" You are fairly sure that is not how losses work.",
        "Nico: \"Tú te lo pierdes\". Estás bastante seguro de que el que pierde no eres tú.");
      const paid = cutPct(0.2);
      if (Math.random() < 0.28) {
        arcPay(paid * 4);
        try { grantAward("unicorn"); } catch (e) {}
        return say("They actually ship. 4× on " + costLabel(paid) + ".", "De verdad lanzan la app. 4× sobre " + costLabel(paid) + ".");
      }
      return say("The domain expired. " + costLabel(paid) + " is a case study.", "El dominio venció. " + costLabel(paid) + " ahora es un caso de estudio.");
    }
    if (card.id === "tow") {
      const paid = cutBill(85);
      return say("You pay the ticket before the tow truck hooks the car. −" + costLabel(paid) + ".", "Pagas la multa antes de que la grúa enganche el auto. −" + costLabel(paid) + ".");
    }
    if (card.id === "courage") {
      if(opt==="b"){delete S.chanceUsed.courage;return say("You wait. The question does not go away.","Esperas. La pregunta no desaparece.");}
      S.hasRing=true; // opt "b" already returned above; the ring itself is paid once, on the Ring card
      return say("You are officially doing this. Next stop: the jewelry store.", "Es oficial: vas a hacerlo. Próxima parada: la joyería.");
    }
    if (card.id === "ring") {
      const paid = cutPct(opt === "b" ? 0.03 : 0.08);
      if (opt === "b") return say("You still have a ring. Lena later finds the receipt. She says nothing. She just looks at you. −" + costLabel(paid) + ".",
        "Aun así tienes anillo. Más tarde, Lena encuentra el recibo. No dice nada. Solo te mira. −" + costLabel(paid) + ".");
      return say("You now have a ring. −" + costLabel(paid) + ".", "Ya tienes el anillo. −" + costLabel(paid) + ".");
    }
    if (card.id === "date") {
      if (opt === "c") { delete S.chanceUsed.date; return say("Tomorrow is probably better.", "Mañana probablemente sea mejor día."); }
      const paid = cutBill(opt === "a" ? 180 : 60);
      if (opt === "a") return say("The check arrives exactly on time, like everything else tonight. −" + costLabel(paid) + ".",
        "La cuenta llega puntual, como todo lo demás esta noche. −" + costLabel(paid) + ".");
      return say("Dinner is good anyway. −" + costLabel(paid) + ".", "La cena sale bien de todos modos. −" + costLabel(paid) + ".");
    }
    if (card.id === "proposal") {
      if (opt === "b") {
        delete S.chanceUsed.proposal;
        delete S.chanceUsed.date;
        S.engaged = false;
        return say("You forget every word. You eventually say, \"So… anyway.\" The moment passes.",
          "Se te olvidan todas las palabras. Terminas diciendo: \"Bueno… en fin\". El momento pasa.");
      }
      if (opt === "c") {
        delete S.chanceUsed.proposal;
        delete S.chanceUsed.date;
        S.engaged = false;
        const paid = cutPct(0.01);
        return say("You make a joke and start walking. She lets you go. The question can wait. −" + costLabel(paid) + ".",
          "Haces una broma y empiezas a caminar. Ella te deja ir. La pregunta puede esperar. −" + costLabel(paid) + ".");
      }
      S.engaged = true;
      const paid = cutPct(0.02);
      return say("You put the ring on her finger. \"Yes, Fartface.\" There will be a wedding. −" + costLabel(paid) + ".",
        "Le pones el anillo. \"Sí, Cara de Pedo\". Habrá boda. −" + costLabel(paid) + ".");
    }
    if (card.id === "wedding") {
      if(opt==="c"){let p=cutPct(.01);S.familyClosed=true;S.familyPath=false;S.arcBias="timeTraveler";return say("You look at Lena. Then at the room. The flowers, the tables, the relatives, the life waiting on the other side of the ceremony. It is a good life. That's the problem. For months, another thought has been getting harder to ignore. That conversation with Marek. Building something. Not a company. Not a charity. Something else. You still don't know what. You tell Lena. There is a very long silence. Then she looks at you. “I'll miss you, Fartface.” You leave. Paco comes with you. You are not entirely sure whether that was his decision. −"+costLabel(p)+".","Miras a Lena. Después el salón: las flores, las mesas, los parientes, la vida que espera del otro lado de la ceremonia. Es una buena vida. Ese es el problema. Hace meses que otra idea se hace más difícil de ignorar. Aquella conversación con Marek. Construir algo. No una empresa. No una organización benéfica. Otra cosa. Todavía no sabes qué. Se lo dices a Lena. Hay un silencio muy largo. Después te mira. “Te voy a extrañar, Cara de Pedo”. Te vas. Paco se va contigo. No estás del todo seguro de que haya sido decisión de él. −"+costLabel(p)+".");}
      S.familyPath=true;
      S.arcBias="honeymoon";
      if (opt === "a") {
        const paid = cutPct(0.12);
        return say("Everyone has a good time. Even Nico. His speech lasts eleven minutes. −" + costLabel(paid) + ".",
          "Todos la pasan bien. Incluso Nico. Su discurso dura once minutos. −" + costLabel(paid) + ".");
      }
      if (opt === "b") {
        const paid = cutPct(0.05);
        return say("Fewer people. Less noise. Paco is not allowed to attend. He does not know why. −" + costLabel(paid) + ".",
          "Menos gente. Menos ruido. A Paco no lo dejan entrar. No entiende por qué. −" + costLabel(paid) + ".");
      }
    }
    if(card.id==="justInCase"||card.id==="nothingToHide"||card.id==="somethingBetter")return say(card.id==="justInCase"?"You close the news tab. The definition stays open in your head.":card.id==="nothingToHide"?"You sign up for the ID anyway. The question takes longer to leave.":"The trail ends at the river. The idea keeps running.",card.id==="justInCase"?"Cierras la pestaña de noticias. La definición sigue abierta en tu cabeza.":card.id==="nothingToHide"?"Igual tramitas el documento. La pregunta tarda más en irse.":"El sendero termina en el río. La idea sigue corriendo.");
    if(card.id==="timeTraveler"){S.bcBookOffer=true;S.have.market=Math.max(S.have.market||0,1);return say("THE BITCOIN STATE is now in the Marketplace for "+costLabel(666)+".","THE BITCOIN STATE ya está en el Mercado por "+costLabel(666)+".");}
    if(card.id==="temporaryMeasures")return say("Markets fall. Bitcoin does not.","Los mercados caen. Bitcoin no.");
    if(card.id==="citadelProblem")return say("Marek starts pricing land the same night.","Esa misma noche, Marek empieza a cotizar terrenos.");
    if(card.id==="pieceWorld"){if(!S.chanceMet)S.chanceMet={};if(opt==="a"){let p=cutBill(1800);S.chanceMet.islandTrip=true;return say("Trip booked. −"+costLabel(p)+".","Viaje reservado. −"+costLabel(p)+".");}delete S.chanceUsed.pieceWorld;return say("Nico sends the listing again tomorrow.","Mañana, Nico te enviará el anuncio otra vez.");}
    if(card.id==="islandInspection"){if(!(S.bcIslandOffer>0))S.bcIslandOffer=Math.max(1,wealthUsd()*(.10+Math.random()*.15));if(opt==="a"){let p=cutBill(S.bcIslandOffer);S.bcIsland=true;return say("You own an island. −"+costLabel(p)+".","Tienes una isla. −"+costLabel(p)+".");}return say("The island remains in the Marketplace at "+costLabel(S.bcIslandOffer)+".","La isla sigue en el Mercado a "+costLabel(S.bcIslandOffer)+".");}
    if(card.id==="paperwork")return say("Signed. The island is yours.","Firmado. La isla es tuya.");
    if(card.id==="nobodyKnows"){if(opt==="a"){let p=cutBill(5000);S.bcOg=true;return say("INTERESTING. CALL ME. −"+costLabel(p)+".","INTERESANTE. LLÁMAME. −"+costLabel(p)+".");}delete S.chanceUsed.nobodyKnows;return say("Three followers. One is Nico.","Tres seguidores. Uno es Nico.");}
    if(card.id==="theOg"){S.bcNodes=Math.max(1,S.bcNodes);S.bcNodeTick=S.candles||0;return say("Liberty Nodes: "+S.bcNodes+"/100.","Nodos de Libertad: "+S.bcNodes+"/100.");}
    if(card.id==="peopleAsking"){if(opt==="a"){let p=cutPct(.03);S.bcSettlement=true;return say("Settlement built. −"+costLabel(p)+".","Asentamiento construido. −"+costLabel(p)+".");}delete S.chanceUsed.peopleAsking;return say("Nico saves the spreadsheet for later.","Nico guarda la hoja de cálculo para más adelante.");}
    if(card.id==="extensionCord"){if(opt==="a"){let p=cutPct(.04);S.bcPower=true;return say("Power grid built. −"+costLabel(p)+".","Red eléctrica construida. −"+costLabel(p)+".");}delete S.chanceUsed.extensionCord;return say("Nico buys another power strip. The lights flicker.","Nico compra otra regleta. Las luces parpadean.");}
    if(card.id==="obviously"){if(opt==="a"){let p=cutPct(.05);S.bcMine=true;return say("Bitcoin mine online. −"+costLabel(p)+".","Mina de bitcoin en línea. −"+costLabel(p)+".");}delete S.chanceUsed.obviously;return say("Nico pins the four-word proposal to the wall.","Nico pega la propuesta de cuatro palabras en la pared.");}
    if(card.id==="principality")return say("You reply. Ortega & Gambette answers within the minute.","Respondes. Ortega & Gambette contesta en menos de un minuto.");
    if(card.id==="stateVisit"){if(opt==="a"){let p=cutBill(15000);S.bcNodes=Math.min(100,S.bcNodes+10);S.bcWorld=Math.max(14,(S.bcWorld||20)-2);return say("+10 Liberty Nodes. World Military Strength −2. −"+costLabel(p)+".","+10 Nodos de Libertad. Fuerza militar mundial −2. −"+costLabel(p)+".");}if(opt==="b"){let p=cutBill(5000);S.bcNodes=Math.min(100,S.bcNodes+4);return say("The node is not plugged in. +4 Liberty Nodes. −"+costLabel(p)+".","El nodo no está enchufado. +4 Nodos de Libertad. −"+costLabel(p)+".");}return say("Nico takes some stamps.","Nico se lleva unas estampillas.");}
    if(card.id==="firstBloc"){S.bcWorld+=4;return say("World Military Strength: "+S.bcWorld+".","Fuerza militar mundial: "+S.bcWorld+".");}
    if(card.id==="protectIsland"){if(opt==="a"){let p=cutPct(.02);S.bcArmyUnlocked=true;if(S.bcArmyTier==null)S.bcArmyTier=0;return say("Army unlocked. −"+costLabel(p)+".","Ejército desbloqueado. −"+costLabel(p)+".");}if(opt==="b"){let p=cutBill(50000);return say("Private security. For now. −"+costLabel(p)+".","Seguridad privada. Por ahora. −"+costLabel(p)+".");}return say("Paco gets a SECURITY vest.","Paco recibe un chaleco de SEGURIDAD.");}
    if(card.id==="placeNow"){S.bcNodes=Math.min(100,S.bcNodes+5);return say("+5 Liberty Nodes.","+5 Nodos de Libertad.");}
    if(card.id==="citadelQuestion"){if(opt==="a"){let p=cutPct(.08);S.bcCitadel=true;return say("Citadel built. −"+costLabel(p)+".","Ciudadela construida. −"+costLabel(p)+".");}return say("The plans stay on the table.","Los planos se quedan sobre la mesa.");}
    if(card.id==="rearmament"){S.bcWorld+=S.bcArmyUnlocked?8:4;return say("World Military Strength: "+S.bcWorld+".","Fuerza militar mundial: "+S.bcWorld+".");}
    if(card.id==="anOffer"){if(opt==="a"){grantWealthPct(.35);S.bcArcClosed=true;return say("You sign. The island is no longer yours. +35% net worth.","Firmas. La isla ya no es tuya. +35% de patrimonio.");}S.bcNodes=Math.min(100,S.bcNodes+10);return say("BITCOIN COUNTRY IS NOT FOR SALE. +10 Liberty Nodes.","BITCOIN COUNTRY NO ESTÁ EN VENTA. +10 Nodos de Libertad.");}
    if(card.id==="ambassador")return say("You save the number.","Guardas el número.");
    if(card.id==="threeColors"){S.bcWorld+=5;return say("World Military Strength: "+S.bcWorld+".","Fuerza militar mundial: "+S.bcWorld+".");}
    if(card.id==="ortegaCalls"){if(opt==="a"){let p=cutBill(25000);S.bcNodes=Math.min(100,S.bcNodes+10);S.bcWorld=Math.max(14,(S.bcWorld||20)-2);return say("A Ministry of Fisheries asks whether Bitcoin Country produces pickled bluefin sand eel. You say yes. This appears to help. +10 Liberty Nodes. World Military Strength −2. −"+costLabel(p)+".","Un Ministerio de Pesca pregunta si Bitcoin Country produce lanzón de aleta azul en escabeche. Dices que sí. Parece que ayuda. +10 Nodos de Libertad. Fuerza militar mundial −2. −"+costLabel(p)+".");}if(opt==="b"){S.bcNodes=Math.min(100,S.bcNodes+4);return say("+4 Liberty Nodes.","+4 Nodos de Libertad.");}return say("Mr Ortega & Gambette emails the 93 pages anyway.","El señor Ortega & Gambette te envía las 93 páginas de todos modos.");}
    if(card.id==="theQuestion"){if(S.bcVictory||S.bcIndependent){return say(stampNation("Bitcoin Country is already independent."),stampNation("Bitcoin Country ya es independiente."));}if(opt==="a"){S.bcIndependent=true;return say("You declare.","Declaras.");}return say("Not yet.","Todavía no.");}
    if(card.id==="cabinet")return say("Every office has a name beside it. Paco accepts his by sitting on the decree.","Cada cargo tiene un nombre al lado. Paco acepta el suyo sentándose sobre el decreto.");
    if(card.id==="declaration")return say(stampNation("One recognition is on the record. Now the three blocs have to answer."),stampNation("Ya hay un reconocimiento en las actas. Ahora les toca responder a los tres bloques."));
    if(card.id==="theAnswer"){return say("The blocs already answered.","Los bloques ya respondieron.");}
    if(card.id==="blocReplies"){
      if(opt==="a"){const p=cutPct(bcPeacePct());return say("The recognition letter grows warmer. The fleets do not change course. −"+costLabel(p)+".","La carta de reconocimiento adopta un tono más cordial. Las flotas no cambian de rumbo. −"+costLabel(p)+".");}
      if(opt==="b")return say("You refuse the payment. The fleets were never waiting for your answer.","Rechazas el pago. Las flotas nunca estuvieron esperando tu respuesta.");
      return say("All three statements have arrived. Their ships are already moving.","Ya llegaron los tres comunicados. Sus barcos ya están en movimiento.");
    }
    if(card.id==="blocAssault"){S.bcDefensePending=true;return say("The first ships enter range.","Los primeros barcos entran en alcance.");}
    if(card.id==="battleWon"){return say("Repairs start before the smoke clears.","Las reparaciones empiezan antes de que se disipe el humo.");}
    if(card.id==="blocTriumph"){return say("One flag fewer on the horizon.","Una bandera menos en el horizonte.");}
    if(card.id==="fourthColor"){S.bcIndependent=true;S.bcVictory=true;if(!S.bcFourthDone){S.bcFourthDone=true;try{noteIndependence();}catch(e){}try{grantAward("fourth");if(!(S.bcAidUsed|0))grantAward("noAid");}catch(e){}}return say(stampNation("THE FOURTH COLOR. Independence is won. You can end the game here or keep trading as a free nation."),stampNation("EL CUARTO COLOR. La independencia está ganada. Puedes terminar la partida aquí o seguir operando como nación libre."));}
    if(card.id==="notYet"){return say("Game over.","Fin de la partida.");}
    if (card.id === "honeymoon") {
      const map = { a: 0.1, b: 0.06, c: 0.04 };
      const paid = cutPct(map[opt] || 0.04);
      if (opt === "a") return say("Tokyo, Kyoto, too many trains. The system works better than you do. −" + costLabel(paid) + ".",
        "Tokio, Kioto, demasiados trenes. El sistema funciona mejor que tú. −" + costLabel(paid) + ".");
      if (opt === "b") return say("Rome, Florence, long dinners. Lena buys something she refuses to explain until you get home. −" + costLabel(paid) + ".",
        "Roma, Florencia, cenas largas. Lena compra algo que se niega a explicar hasta volver a casa. −" + costLabel(paid) + ".");
      return say("Mountains, lakes, fewer people. You miss Paco after two days. He does not appear to miss you. −" + costLabel(paid) + ".",
        "Montañas, lagos, menos gente. A los dos días extrañas a Paco. Él no parece extrañarte. −" + costLabel(paid) + ".");
    }
    if (card.id === "pregnancy") {
      const paid = cutBill(450);
      return say("First appointment booked and paid. −" + costLabel(paid) + ".", "Primera consulta reservada y pagada. −" + costLabel(paid) + ".");
    }
    if (card.id === "baby") {
      if (opt === "c") return say("Lena looks at the PDF.\n\nThen at you. She is furious.\n\n\"Classic Fartface.\"", "Lena mira el PDF.\n\nLuego te mira a ti. Está furiosa.\n\n\"Típico de Cara de Pedo\".");
      if (opt === "a") {
        const paid = cutPct(0.05);
        S.cold += 1;
        return say("Money set aside, and a cold-storage device in the house. −" + costLabel(paid) + ".",
          "Dinero apartado y un dispositivo de almacenamiento en frío en casa. −" + costLabel(paid) + ".");
      }
      const paid = cutPct(0.02);
      return say("You buy what you need and figure out the rest later. −" + costLabel(paid) + ".",
        "Compran lo necesario y resuelven el resto después. −" + costLabel(paid) + ".");
    }
    if (card.id === "cousin") {
      if (opt === "b") return say("Three hours later Nico texts you a chart: $FRY is already down 40%. \"Temporary.\"",
        "Tres horas después, Nico te manda un gráfico: $FRY ya cayó un 40%. \"Es temporal\".");
      const paid = cutPct(0.4);
      if (Math.random() < 0.5) {
        arcPay(paid * 2.2);
        try { grantAward("soldPump"); } catch (e) {}
        return say("$FRY really does pump. You sell on Thursday: 2.2× on " + costLabel(paid) + ".", "$FRY sube de verdad. Vendes el jueves: 2.2× sobre " + costLabel(paid) + ".");
      }
      return say("The developers pull the liquidity and vanish. Your $FRY can no longer be sold. −" + costLabel(paid) + ".", "Los desarrolladores retiran la liquidez y desaparecen. Tus $FRY ya no se pueden vender. −" + costLabel(paid) + ".");
    }
    if (card.id === "speeding") {
      const paid = cutBill(75);
      return say("He writes the ticket without asking for your name. −" + costLabel(paid) + ".", "Escribe la multa sin preguntarte el nombre. −" + costLabel(paid) + ".");
    }
    if (card.id === "wallet") {
      const paid = cutBill(40);
      return say("You thank the driver and check every pocket twice on the ride home. −" + costLabel(paid) + ".",
        "Le agradeces al chofer y revisas cada bolsillo dos veces en el viaje de vuelta. −" + costLabel(paid) + ".");
    }
    if (card.id === "potluck") {
      if (opt === "b") return say("Lena looks at you. \"You are unbelievable.\"", "Lena te mira. \"Eres increíble\".");
      const paid = cutPct(0.05);
      return say("People remember your name. Paco remembers the food. −" + costLabel(paid) + ".",
        "La gente recuerda tu nombre. Paco recuerda la comida. −" + costLabel(paid) + ".");
    }
    if (card.id === "usedcar") {
      if (opt === "b") return say("You walk. Nico buys it anyway.", "Te vas. Nico lo compra de todos modos.");
      const paid = cutPct(0.12);
      if (Math.random() < 0.3) {
        const back = grantWealthPct(0.03);
        return say("It works. −" + costLabel(paid) + " then +" + money(back) + ".", "Funciona. −" + costLabel(paid) + " y después +" + money(back) + ".");
      }
      const extra = cutPct(0.04);
      return say("Lemon. The Sharpie was the honest part. −" + costLabel(paid + extra) + ".",
        "Es un cacharro. Lo único honesto era el Sharpie. −" + costLabel(paid + extra) + ".");
    }
    if (card.id === "tetris") {
      if (opt === "b") return say("Marek gets to level 18. Then loses. He nods. \"Good enough.\"",
        "Marek llega al nivel 18. Pierde. Asiente: \"Suficiente\".");
      const stake = cutBill(20);
      if (Math.random() < 0.42) {
        arcPay(stake * 3);
        return say("The well stays clean. +" + money(stake * 3) + ".", "El tablero queda limpio. +" + money(stake * 3) + ".");
      }
      return say("A long bar would have saved you. −" + costLabel(stake) + ".", "Una pieza larga te habría salvado. −" + costLabel(stake) + ".");
    }
    if (card.id === "chess") {
      const cp = chessProblem();
      const line = es ? cp.lineEs : cp.line;
      const typed = String(opt || "").replace(/^move:/, "").trim().slice(0, 16).replace(/[<>&"]/g, "");
      if (chessMoveOk(typed, cp)) {
        const out = creditBtc(1);
        try { noteChessSolved(S.chessPick); } catch (e) {}
        return say("Marek looks at the board for a long moment, then plays it out for you: " + line + " " + cp.win + " He slides the bitcoin across the table. +" + out.take.toFixed(4) + " BTC" + (out.cash ? " and +" + money(out.cash) : "") + ".",
          "Marek mira el tablero un largo rato y luego lo juega por ti: " + line + " " + cp.winEs + " Te pasa el bitcoin por la mesa. +" + out.take.toFixed(4) + " BTC" + (out.cash ? " y +" + money(out.cash) : "") + ".");
      }
      // a wrong move costs nothing: Marek shows the line and waves off the bet
      return say((typed ? "Marek shakes his head at " + typed : "Marek waits, then shrugs") + " and shows you the line: " + line + " " + cp.miss,
        (typed ? "Marek niega con la cabeza ante " + typed : "Marek espera y luego se encoge de hombros") + " y te muestra la línea: " + line + " " + cp.missEs);
    }
    if (card.id === "unclemike") {
      const bill = opt === "a" ? 216 : opt === "c" ? 198 : 180;
      cutBill(bill);
      if (opt === "a") return say("Uncle Mike watches you sign.\n\n“That just encourages the system.”\n\nYou leave the restaurant.\n\n−$216.",
        "El tío Mike te mira firmar.\n\n“Eso solo alimenta el sistema”.\n\nSalen del restaurante.\n\n−$216.");
      if (opt === "b") return say("Uncle Mike seems satisfied.\n\nThe waiter does not.\n\nYou just want to go home.\n\n−$180.",
        "El tío Mike parece satisfecho.\n\nEl mesero no.\n\nSolo quieres irte a casa.\n\n−$180.");
      return say("Uncle Mike nods.\n\n“That's different.”\n\nYou are not sure it is.\n\nHe is.\n\n−$198.",
        "El tío Mike asiente.\n\n“Eso es distinto”.\n\nNo estás seguro de que lo sea.\n\nÉl sí.\n\n−$198.");
    }
    return say("Nothing else happens.", "No pasa nada más.");
  }

  const ARC_VID = {};
  const WIDE_ART_PNG = new Set([]);  // all wide art is JPG now (mobile weight)
  const WIDE_ART_JPG = new Set([
    "citadelProblem", "pieceWorld", "islandInspection", "paperwork",
    "ortegaCalls", "ambassador", "anOffer",
    "cabinet", "blocReplies", "blocAssault", "battleWon", "blocTriumph",
    // job-career milestone art (1920x800 JPG; PNG could not stay under 400KB for mobile)
    "jobCareeractingTier2", "jobCareeractingTier4", "jobCareeractingTier6",
    "jobCareerdivingTier2", "jobCareerculinaryTier6", "jobCareeraviationTier2",
    "jobCareeraviationTier4", "jobCareeraviationTier6", "jobCareermusicTier2",
    "jobCareermusicTier4", "jobCareermusicTier6", "jobCareerathleticTier2",
    "jobCareerathleticTier4", "jobCareerathleticTier6", "jobCareermedicalTier2",
    "jobCareermedicalTier4", "jobCareermedicalTier6", "jobCareermaritimeTier2",
    "jobCareermaritimeTier4", "jobCareermaritimeTier6",
    // former PNG panoramas + Marek restyles
    "taxbill", "nicoWedding", "mexico", "casino", "uncle", "hospital",
    "startup", "tow", "date", "wedding", "cousin", "wallet",
    "potluck", "usedcar", "unclemike",
    "landfill", "phish", "crash", "flu", "roof", "proposal",
    "pregnancy", "honeymoon", "baby", "school", "ring", "speeding",
    "citadelQuestion", "declaration", "justInCase", "nothingToHide", "extensionCord",
    "firstBloc", "somethingBetter", "temporaryMeasures", "timeTraveler", "nobodyKnows",
    "theOg", "obviously", "peopleAsking", "placeNow", "principality",
    "stateVisit", "protectIsland", "rearmament", "threeColors", "notYet",
    "theAnswer", "festival", "chess", "poker", "wine",
    "courage", "tetris", "theQuestion", "fourthColor",
    "jobCareerdivingTier4", "jobCareerdivingTier6", "jobCareerscienceTier2",
    "jobCareerscienceTier4", "jobCareerscienceTier6", "jobCareerlawTier2",
    "jobCareerlawTier4", "jobCareerlawTier6", "jobCareerculinaryTier2",
    "jobCareerculinaryTier4"
  ]);
  const ARC_ART_ALIAS = {};
  const ARC_ART_VERSIONS = {
    justInCase: "gpt6",
    somethingBetter: "gpt5",
    protectIsland: "gpt5",
    theOg: "gpt5",
    fourthColor: "gpt5",
    notYet: "gpt5",
    theAnswer: "gpt5",
    festival: "gpt5",
    chess: "board1"
  };

  // Per-card cache bust for redrawn wide art, so one new image does not re-download every card.
  const WIDE_JPG_VER = { unclemike: "cin15", islandInspection: "cin16", chess: "cin16" };
  const SQ_JPG_VER = { unclemike: "sq2" };
  const PRELOADED_ART = new Map();
  const MOBILE_ART = (() => { try { return matchMedia("(pointer: coarse)").matches || Math.min(screen.width, screen.height) < 820; } catch (e) { return false; } })();

  function getChanceArtMeta(cardOrId) {
    const card = typeof cardOrId === "object" && cardOrId ? cardOrId : (CHANCE_CARDS.find((c) => c.id === cardOrId) || null);
    const id = typeof cardOrId === "string" ? cardOrId : (card ? card.id : "");
    const artId = ARC_ART_ALIAS[id] || (card && card.artId) || id;

    if (card && card.art) {
      const isWide = !!(card.wide || card.panoramic || card.art.includes("-wide"));
      return { id, artId, src: card.art, wide: isWide, isVideo: false };
    }

    if (id === "chess" && typeof S !== "undefined" && S && S.chessPick != null && S.chessPick >= 0) {
      const cp = CHESS_POOL[S.chessPick];
      if (cp && CHESS_ART_READY.has(cp.slug)) return { id, artId: "chess-" + cp.slug, src: "chance/chess-" + cp.slug + "-wide.jpg?v=" + (CHESS_ART_VER[cp.slug] || "chs1"), fallbackSrc: "chance/chess-wide.jpg?v=" + (WIDE_JPG_VER.chess || "cin14"), wide: true, isVideo: false };
    }
    if (ARC_VID[id]) {
      const poster = "chance/" + artId + ".jpg?v=mp86";
      return { id, artId, src: "chance/" + id + ".mp4", poster, wide: false, isVideo: true };
    }

    const isWide = !!(card && (card.wide || card.panoramic)) || WIDE_ART_PNG.has(artId) || WIDE_ART_JPG.has(artId) || (artId && artId.endsWith("-wide"));

    let src = "";
    if (WIDE_ART_PNG.has(artId) || (card && card.artFormat === "png") || (isWide && !WIDE_ART_JPG.has(artId) && !artId.endsWith(".jpg"))) {
      const v = ARC_ART_VERSIONS[artId] || "gpt4";
      src = "chance/" + artId + "-wide.png?v=" + v;
    } else if (isWide) {
      src = "chance/" + (artId.endsWith("-wide") ? artId : artId + "-wide") + ".jpg?v=" + (WIDE_JPG_VER[artId] || "cin14");
    } else {
      src = "chance/" + artId + ".jpg?v=" + (SQ_JPG_VER[artId] || "mp86");
    }

    return { id, artId, src, wide: isWide, isVideo: false };
  }

  function preloadSingleArt(src, eager = false) {
    if (!src || PRELOADED_ART.has(src)) return PRELOADED_ART.get(src);
    const im = new Image();
    im.loading = eager ? "eager" : "auto";
    im.decoding = "async";
    PRELOADED_ART.set(src, im);
    im.src = src;
    // Only decode the card about to be shown; decoding every 1920x800 card up front pins hundreds of MB on phones.
    if (eager && "decode" in im) {
      im.decode().catch(() => {});
    }
    return im;
  }

  let chanceArtBusy = false;
  function preloadChanceArt() {
    if (chanceArtBusy) return;
    chanceArtBusy = true;

    const allMetas = CHANCE_CARDS.map((c) => getChanceArtMeta(c));
    Object.keys(ARC_ART_ALIAS).forEach((aliasId) => {
      allMetas.push(getChanceArtMeta(aliasId));
    });
    allMetas.push({ src: "chance/hero.jpg?v=mp86", wide: false, isVideo: false });

    // Deduplicate image sources
    const seen = new Set();
    const queue = [];
    // Prioritize panoramic wide images first
    allMetas.filter((m) => m && m.wide && !m.isVideo).forEach((m) => {
      if (!seen.has(m.src)) { seen.add(m.src); queue.push(m.src); }
    });
    // Then standard images
    allMetas.filter((m) => m && !m.wide && !m.isVideo).forEach((m) => {
      if (!seen.has(m.src)) { seen.add(m.src); queue.push(m.src); }
    });

    let qIdx = 0;
    const kick = (concurrency) => {
      while (concurrency-- > 0 && qIdx < queue.length) {
        const src = queue[qIdx++];
        const im = preloadSingleArt(src);
        if (im) {
          im.onload = im.onerror = () => kick(1);
        } else {
          kick(1);
        }
      }
    };
    kick(MOBILE_ART ? 2 : 3);

    // Videos
    Object.keys(ARC_VID).forEach((id) => {
      const v = document.createElement("video");
      v.muted = true;
      v.preload = "auto";
      v.playsInline = true;
      v.src = "chance/" + id + ".mp4";
    });
  }

  function arcAltText(id) {
    const c = typeof id === "object" && id ? id : CHANCE_CARDS.find((x) => x.id === id);
    const tt = c ? (chanceLang() ? (c.titleEs || c.title) : c.title) : "";
    return String(tt || "").replace(/[<>&"]/g, "");
  }
  // Post-decision art: drop chance/<id>-<choice>-wide.jpg in and it shows on the result screen; falls back to the card art if missing.
  const POST_ART = {
    proposal:"abc", wedding:"abc", honeymoon:"abc", phish:"ab", courage:"a", islandInspection:"a",
    protectIsland:"abc", citadelQuestion:"ab", anOffer:"ab", theQuestion:"a"
  };
  // Cache tags per post image: bump only the files that change (default post3).
  const POST_ART_VER = {
    "honeymoon-a":"post5", "citadelQuestion-a":"post4", "islandInspection-a":"post4", "phish-a":"post4", "phish-b":"post4",
    "anOffer-b":"post5", "anOffer-a":"post5", "protectIsland-a":"post4", "protectIsland-b":"post4", "protectIsland-c":"post4", "theQuestion-a":"post4",
    "wedding-a":"post4", "wedding-b":"post5", "wedding-c":"post4"
  };
  const POST_ART_MISS = new Set();
  function postArtHtml(id, opt) {
    const base = chanceArtHtml(id);
    const key = id + "-" + opt;
    if (!opt || !POST_ART[id] || POST_ART[id].indexOf(opt) < 0 || POST_ART_MISS.has(key) || base.indexOf("<img") !== 0) return base;
    const m = base.match(/ src="([^"]*)"/);
    if (!m) return base;
    const src = "chance/" + key + "-wide.jpg?v=" + (POST_ART_VER[key] || "post3");
    return base.replace(/ onerror="[^"]*"/, "").replace(m[0], " src=\"" + src + "\" data-base=\"" + m[1] + "\"")
      .replace("<img ", "<img onerror=\"this.onerror=null;window.__choppyPostMiss&&window.__choppyPostMiss('" + key + "');this.src=this.dataset.base;\" ");
  }
  window.__choppyPostMiss = (k) => POST_ART_MISS.add(k);
  // Bloc intro cards show the art of whichever bloc fills that slot this run (falls back to the card's own art).
  // Battle art variants: chance/battle-<bloc>-<n>-pre-wide.jpg (before a battle), battle-<bloc>-<n>-post-wide.jpg
  // (after a won battle), battle-<bloc>-win-wide.jpg (bloc defeated) and generic battle-gen-<n>-pre/post.
  // A run never shows the same variant twice; a missing file falls back to the card's own art and is skipped next time.
  const BATTLE_ART_MISS = new Set();
  window.__choppyBattleMiss = (k) => BATTLE_ART_MISS.add(k);
  function battleArtPick(card) {
    const kind = card.id === "blocAssault" ? "pre" : card.id === "battleWon" ? "post" : card.id === "blocTriumph" ? "win" : "";
    if (!kind) return "";
    const won = S.bcBattlesWon || 0;
    const idx = kind === "pre" ? won : Math.max(0, won - 1);
    const memo = S.bcArtPick || (S.bcArtPick = {});
    const mk = kind + idx;
    if (memo[mk] && !BATTLE_ART_MISS.has(memo[mk])) return memo[mk];
    const bloc = (warBloc(Math.min(2, Math.floor(idx / 3))) || {}).key || "pact";
    const used = new Set(Object.keys(memo).filter((k) => k !== mk).map((k) => memo[k]));
    const free = (c) => !used.has(c) && !BATTLE_ART_MISS.has(c);
    let pick = "";
    if (kind === "win") pick = free("battle-" + bloc + "-win") ? "battle-" + bloc + "-win" : "";
    else {
      // Random mix of this bloc's two variants and the generic ones. Each bloc takes at most one generic per kind,
      // so the three generics spread across the three blocs and every slot still has something unused.
      const blocNo = Math.floor(idx / 3);
      const blocHasGen = Object.keys(memo).some((k) => k !== mk && k.indexOf(kind) === 0 && Math.floor((+k.slice(kind.length)) / 3) === blocNo && String(memo[k]).indexOf("battle-gen-") === 0);
      const own = ["battle-" + bloc + "-1-" + kind, "battle-" + bloc + "-2-" + kind].filter(free);
      const gens = ["battle-gen-1-" + kind, "battle-gen-2-" + kind, "battle-gen-3-" + kind].filter(free);
      let pool = own.concat(blocHasGen ? [] : gens);
      if (!pool.length) pool = gens;
      if (pool.length) pick = pool[Math.floor(Math.random() * pool.length)];
    }
    memo[mk] = pick;
    return pick;
  }
  function blocArtHtml(card) {
    const base = chanceArtHtml(card.id);
    const va = battleArtPick(card);
    if (va && base.indexOf("<img") === 0) {
      const m0 = base.match(/ src="([^"]*)"/);
      if (m0) return base.replace(/ onerror="[^"]*"/, "").replace(m0[0], " src=\"chance/" + va + "-wide.jpg?v=bat3\" data-base=\"" + m0[1] + "\"")
        .replace("<img ", "<img onerror=\"this.onerror=null;window.__choppyBattleMiss&&window.__choppyBattleMiss('" + va + "');this.src=this.dataset.base;\" ");
    }
    const aid = blocArtId(card);
    if (!aid || aid === card.id || base.indexOf("<img") !== 0) return base;
    const m = base.match(/ src="([^"]*)"/);
    if (!m) return base;
    const src = "chance/" + aid + "-wide.jpg?v=cin14";
    return base.replace(/ onerror="[^"]*"/, "").replace(m[0], " src=\"" + src + "\" data-base=\"" + m[1] + "\"")
      .replace("<img ", "<img onerror=\"this.onerror=null;this.src=this.dataset.base;\" ");
  }
  function chanceArtHtml(id) {
    const meta = getChanceArtMeta(id);
    if (meta.isVideo) {
      return "<video class=\"chance-art\" src=\"" + meta.src + "\" poster=\"" + meta.poster + "\" autoplay muted loop playsinline preload=\"auto\"></video>";
    }
    const wideClass = meta.wide ? " wide-art" : "";
    const festClass = (id === "blocTriumph" || meta.artId === "festival") ? " fest-art" : "";
    const fallback = meta.fallbackSrc ? meta.fallbackSrc : meta.artId && meta.artId !== "hero" ? "chance/" + meta.artId + ".jpg?v=" + (SQ_JPG_VER[meta.artId] || "mp86") : "chance/hero.jpg";
    return "<img class=\"chance-art" + festClass + wideClass + "\" src=\"" + meta.src + "\" alt=\"" + arcAltText(id) + "\" loading=\"eager\" decoding=\"async\" onerror=\"this.onerror=null;this.src='" + fallback + "';\">";
  }

  // Four enemy blocs exist; each run fights three of them, picked and ordered at random (S.bcBlocs).
  const ALL_BLOCS = [
    { key:"pact", en:"Meridian Stability Pact", es:"Pacto de Estabilidad Meridiano", esFull:"el Pacto de Estabilidad Meridiano", enThe:"the Meridian Pact", esThe:"el Pacto Meridiano", short:"PACT", shortEs:"PACTO",
      leader:"Chancellor Ivo Voss", leaderEs:"el canciller Ivo Voss", paint:"#4a5340", mix:"heavy", art:"firstBloc",
      members:"Germany, France, Italy, Spain, the Netherlands, Belgium, and Austria", membersEs:"Alemania, Francia, Italia, España, los Países Bajos, Bélgica y Austria",
      verb:"files a form", verbEs:"presenta formularios",
      tag:"Its language is administrative; its restrictions are not optional.", tagEs:"Su lenguaje es administrativo, pero sus restricciones no son opcionales.",
      core:"Seven capitals announce the Meridian Stability Pact on the same morning. The treaty is brief. Its annexes are not.\n\nGermany, France, Italy, Spain, the Netherlands, Belgium, and Austria coordinate trade, energy, a shared payment network, and a defense clause nobody reads aloud.\n\nChancellor Ivo Voss chairs the first session. He never raises his voice. After thanking the cameras for their patience, he calls instability a form of violence and lists what now requires permission: large transfers, foreign accounts, unsanctioned ports, and newspapers that refuse to cooperate.\n\nThe Pact does not look like a boot. It looks like a form. The form is mandatory.",
      coreEs:"Siete capitales anuncian el Pacto de Estabilidad Meridiano la misma mañana. El tratado es breve. Sus anexos no.\n\nAlemania, Francia, Italia, España, los Países Bajos, Bélgica y Austria coordinan el comercio, la energía, una red de pagos compartida y una cláusula de defensa que nadie lee en voz alta.\n\nEl canciller Ivo Voss preside la primera sesión. Nunca alza la voz. Tras agradecer la paciencia de las cámaras, define la inestabilidad como una forma de violencia y enumera lo que ahora requiere autorización: grandes transferencias, cuentas en el extranjero, puertos no autorizados y periódicos que se nieguen a cooperar.\n\nEl Pacto no parece una bota. Parece un formulario. El formulario es obligatorio." },
    { key:"ledger", en:"Red Ledger Compact", es:"Compacto del Libro Rojo", esFull:"el Compacto del Libro Rojo", enThe:"the Red Ledger", esThe:"el Libro Rojo", short:"LEDGER", shortEs:"LIBRO",
      leader:"Marshal Amina Kade", leaderEs:"la mariscal Amina Kade", paint:"#6a3834", mix:"fast", art:"rearmament",
      members:"Russia, Belarus, China, North Korea, and Cuba", membersEs:"Rusia, Bielorrusia, China, Corea del Norte y Cuba",
      verb:"prints a poster", verbEs:"imprime carteles",
      tag:"It speaks of purity, and its posters arrive before the bread.", tagEs:"Habla de pureza, y sus carteles llegan antes que el pan.",
      core:"Russia, Belarus, China, North Korea, and Cuba sign the Red Ledger Compact in a hall lit too brightly. Marshal Amina Kade reads the preamble herself. She was a dock officer, then a prosecutor, and now decides which shortages count as patriotic.\n\nThe Compact does not speak of stability. It speaks of purity. Hoarding is treason. Private mines are unfinished revolutions. Posters appear before bread does. Police notebooks grow thicker. The speeches are beautiful. The queues are not.",
      coreEs:"Rusia, Bielorrusia, China, Corea del Norte y Cuba firman el Compacto del Libro Rojo en un salón iluminado en exceso. La mariscal Amina Kade lee personalmente el preámbulo. Primero fue oficial de muelle, después fiscal y ahora decide qué escasez cuenta como patriótica.\n\nEl Compacto no habla de estabilidad, sino de pureza. Acaparar es traición. Las minas privadas son revoluciones inconclusas. Los carteles aparecen antes que el pan. Los cuadernos de la policía se vuelven más gruesos. Los discursos son hermosos. Las filas no." },
    { key:"lattice", en:"Crown Lattice", es:"Celosía de la Corona", esFull:"la Celosía de la Corona", enThe:"the Crown Lattice", esThe:"la Celosía de la Corona", short:"LATTICE", shortEs:"CORONA",
      leader:"High Warden Soren Pell", leaderEs:"el Alto Guardián Soren Pell", paint:"#5c4936", mix:"elite", art:"threeColors",
      members:"Saudi Arabia, Jordan, Morocco, Thailand, and Brunei", membersEs:"Arabia Saudita, Jordania, Marruecos, Tailandia y Brunéi",
      verb:"holds a parade and then imposes silence", verbEs:"organiza un desfile y después impone silencio",
      tag:"To High Warden Soren Pell, a people who will not kneel is an administrative error.", tagEs:"Para el Alto Guardián Soren Pell, un pueblo que no se arrodilla es un error administrativo.",
      core:"Saudi Arabia, Jordan, Morocco, Thailand, and Brunei form the Crown Lattice around dynastic authority, port agreements, and the belief that borders are inherited rather than negotiated. High Warden Soren Pell walks at the front of the procession and does not wave. To him, a people who will not kneel are an administrative error.\n\nDissent is not debated. It is omitted.",
      coreEs:"Arabia Saudita, Jordania, Marruecos, Tailandia y Brunéi forman la Celosía de la Corona en torno a la autoridad dinástica, los acuerdos portuarios y la idea de que las fronteras se heredan en lugar de negociarse. El Alto Guardián Soren Pell camina al frente del cortejo y no saluda. Para él, un pueblo que no se arrodilla es un error administrativo.\n\nLa disidencia no se debate: se omite." },
    { key:"trust", en:"Open Hemisphere Trust", es:"Fideicomiso del Hemisferio Abierto", esFull:"el Fideicomiso del Hemisferio Abierto", enThe:"the Hemisphere Trust", esThe:"el Fideicomiso del Hemisferio", short:"TRUST", shortEs:"FIDEICOMISO",
      leader:"Chief Compliance Officer Dana Holt", leaderEs:"la directora de cumplimiento Dana Holt", paint:"#34485e", mix:"snipe", art:"blocTrust",
      members:"the United States, Canada, Mexico, Brazil, Chile, Argentina, Peru, Colombia, and Australia", membersEs:"Estados Unidos, Canadá, México, Brasil, Chile, Argentina, Perú, Colombia y Australia",
      verb:"updates its terms of service", verbEs:"actualiza sus términos de servicio",
      tag:"Membership is free; declining its terms is not an option.", tagEs:"La membresía es gratuita; rechazar sus términos no es una opción.",
      core:"The United States, Canada, Mexico, Brazil, Chile, Argentina, Peru, Colombia, and Australia launch the Open Hemisphere Trust from a stage with very good lighting. Membership is free. The terms of service run four hundred pages, and accepting them is the only way to keep a bank account.\n\nChief Compliance Officer Dana Holt presents it in sneakers. She smiles while explaining that every payment now carries a trust score, that low scores simply see fewer options, and that nobody is being banned, only deprioritized.\n\nThe Trust does not confiscate anything. It recommends. The recommendations cannot be declined.",
      coreEs:"Estados Unidos, Canadá, México, Brasil, Chile, Argentina, Perú, Colombia y Australia lanzan el Fideicomiso del Hemisferio Abierto desde un escenario muy bien iluminado. La membresía es gratuita. Los términos de servicio tienen cuatrocientas páginas, y aceptarlos es la única forma de conservar una cuenta bancaria.\n\nLa directora de cumplimiento Dana Holt lo presenta en zapatillas. Sonríe mientras explica que cada pago llevará un puntaje de confianza, que los puntajes bajos simplemente verán menos opciones y que a nadie se le prohíbe nada: solo se le resta prioridad.\n\nEl Fideicomiso no confisca nada. Recomienda. Las recomendaciones no se pueden rechazar." }
  ];
  const BLOC_BY_KEY = {}; ALL_BLOCS.forEach((b) => { BLOC_BY_KEY[b.key] = b; });
  function rollBlocs(){ const k=ALL_BLOCS.map((b)=>b.key); for(let i=k.length-1;i>0;i--){const j=(Math.random()*(i+1))|0;const t=k[i];k[i]=k[j];k[j]=t;} S.bcBlocs=k.slice(0,3); return S.bcBlocs; }
  function activeBlocKeys(){
    const ok=Array.isArray(S.bcBlocs)&&S.bcBlocs.length===3&&S.bcBlocs.every((k)=>BLOC_BY_KEY[k])&&new Set(S.bcBlocs).size===3;
    if(!ok){
      // Runs already into the bloc story keep the original three; fresh runs draw 3 of 4 in random order.
      const started=!!(S.chanceUsed&&(S.chanceUsed.firstBloc||S.chanceUsed.rearmament||S.chanceUsed.threeColors))||(S.bcBattlesWon||0)>0;
      if(started) S.bcBlocs=["pact","ledger","lattice"];
      else rollBlocs();
    }
    return S.bcBlocs;
  }
  function activeBlocs(){ return activeBlocKeys().map((k)=>BLOC_BY_KEY[k]); }
  function warBloc(i){ return activeBlocs()[Math.max(0, Math.min(2, i|0))]; }
  function blocIntroText(id, es){
    const B=activeBlocs();
    const cap=(t)=>t.charAt(0).toUpperCase()+t.slice(1);
    if(id==="firstBloc") return es?B[0].coreEs:B[0].core;
    if(id==="rearmament") return es
      ? cap(B[0].esThe)+" anuncia un nuevo programa de fragatas y lo llama mantenimiento.\n\nDel otro lado del agua responde otro tipo de orden.\n\n"+B[1].coreEs+"\n\nAmbos bloques comienzan a construir buques de guerra. Ninguno lo llama carrera armamentista."
      : cap(B[0].enThe)+" announces a new frigate program and calls it maintenance.\n\nAcross the water, a different kind of order answers.\n\n"+B[1].core+"\n\nBoth blocs begin building warships. Neither calls it an arms race.";
    if(id==="threeColors") return es
      ? "Un tercer color cierra el mapa.\n\n"+B[2].coreEs+"\n\nMientras "+B[0].esThe+" "+B[0].verbEs+" y "+B[1].esThe+" "+B[1].verbEs+", "+B[2].esThe+" "+B[2].verbEs+". Las zonas grises del mapa —incluida una pequeña isla que continúa comprando generadores— ahora aparecen como territorios sin asignar."
      : "A third color closes the map.\n\n"+B[2].core+"\n\nWhere "+B[0].enThe+" "+B[0].verb+" and "+B[1].enThe+" "+B[1].verb+", "+B[2].enThe+" "+B[2].verb+". Gray areas on the map—including a small island that keeps buying generators—are now labeled unassigned.";
    return null;
  }
  function blocIntroTldr(id, es){
    const B=activeBlocs();
    const cap=(t)=>t.charAt(0).toUpperCase()+t.slice(1);
    if(id==="firstBloc") return es ? cap(B[0].membersEs)+" forman "+B[0].esFull+". "+B[0].tagEs : cap(B[0].members)+" form the "+B[0].en+". "+B[0].tag;
    if(id==="rearmament") return es
      ? cap(B[0].esThe)+" anuncia un programa de fragatas y lo llama mantenimiento. "+cap(B[1].membersEs)+" responden con "+B[1].esFull+". Ambos bloques comienzan a construir buques de guerra."
      : cap(B[0].enThe)+" announces a frigate program and calls it maintenance. "+cap(B[1].members)+" answer by forming the "+B[1].en+". Both blocs begin building warships.";
    if(id==="threeColors") return es
      ? cap(B[2].membersEs)+" forman "+B[2].esFull+", el tercer bloque que rodea a Bitcoin Country. "+B[2].tagEs
      : cap(B[2].members)+" form the "+B[2].en+", the third bloc surrounding Bitcoin Country. "+B[2].tag;
    return "";
  }
  function blocArtId(card){
    if(!card) return "";
    const slot=card.id==="firstBloc"?0:card.id==="rearmament"?1:card.id==="threeColors"?2:-1;
    if(slot<0) return card.id;
    return warBloc(slot).art||card.id;
  }
  const BC_ARC = {
    justInCase:1, nothingToHide:1, somethingBetter:1, timeTraveler:1, temporaryMeasures:1,
    citadelProblem:1, pieceWorld:1, islandInspection:1, paperwork:1, nobodyKnows:1, theOg:1,
    peopleAsking:1, extensionCord:1, obviously:1, principality:1, stateVisit:1, firstBloc:1,
    protectIsland:1, placeNow:1, citadelQuestion:1, rearmament:1, anOffer:1, ambassador:1,
    threeColors:1, ortegaCalls:1, theQuestion:1, cabinet:1, declaration:1, theAnswer:1,
    blocReplies:1, blocAssault:1, battleWon:1, blocTriumph:1, fourthColor:1, notYet:1
  };
  function warSeason(){ return !!S.bcIndependent && !S.bcVictory; }
  function arcInPool(c){ return !warSeason() || !!(c && BC_ARC[c.id]); }
  function rollBlocReactions(){
    const keys=["accept","reject","time","money"];
    for(let i=keys.length-1;i>0;i--){ const j=(Math.random()*(i+1))|0; const t=keys[i]; keys[i]=keys[j]; keys[j]=t; }
    S.bcPeacePct=0.03+Math.random()*0.10;
    S.bcReactions={}; activeBlocKeys().forEach((k,i)=>{ S.bcReactions[k]=keys[i]; });
  }
  function blocReplyIsReport(){
    const r=S.bcReactions||{};
    return activeBlocKeys().every((k)=>r[k]!=="money");
  }
  const capF=(t)=>t.charAt(0).toUpperCase()+t.slice(1);
  function reactionLine(bloc, kind, es){
    const name=capF(es?bloc.esThe:bloc.enThe), who=capF(es?bloc.leaderEs:bloc.leader);
    if(kind==="accept") return es
      ? name+" envía una nota fría de reconocimiento. "+who+" la llama una cortesía provisional. El agregado que la entrega no toma asiento."
      : name+" sends a cold note of recognition. "+who+" calls it a provisional courtesy. The attaché who delivers it does not sit down.";
    if(kind==="reject") return es
      ? name+" rechaza la declaración en una sola oración. "+who+" agrega otra sobre las consecuencias."
      : name+" rejects the declaration in one sentence. "+who+" adds a second one about consequences.";
    if(kind==="time") return es
      ? name+" pide tiempo para preparar un comunicado. "+who+" lo usa para contar barcos."
      : name+" asks for time to prepare a statement. "+who+" uses it to count ships.";
    return es
      ? name+" ofrece reconocimiento político a cambio de una contribución a la estabilidad regional. "+who+" fija una cifra y evita llamarla soborno."
      : name+" offers political recognition in exchange for a contribution to regional stability. "+who+" names a figure and avoids calling it a bribe.";
  }
  function repliesText(){
    const es=chanceLang();
    const r=S.bcReactions||{};
    const dflt=["reject","time","accept"];
    const lines=activeBlocs().map((b,i)=>reactionLine(b, r[b.key]||dflt[i], es));
    const tail=es
      ? "Nada de eso cambia el final de la semana. Los reconocimientos quedan como notas al pie. Las demoras encubren calendarios de carga. Un pago, si lo haces, solo compra una carta más cordial. Los tres bloques siguen armando sus flotas."
      : "None of it changes the end of the week. Recognition becomes a footnote. Delays hide loading schedules. A payment, if you make one, only buys a warmer letter. All three blocs keep arming their fleets.";
    return lines.join("\n\n")+ "\n\n"+tail;
  }
  // Pre-battle briefings: one per bloc and battle (slot 0, 1, 2), each in that bloc's voice.
  const ASSAULT_TEXT={
    pact:[
      { en:"The Meridian Pact opens fire at nine sharp, when its offices open. Chancellor Ivo Voss's communiqué was stamped the day before and calls the attack an unavoidable administrative measure.\n\nThe ships are already visible from the dock.",
        es:"El Pacto Meridiano abre fuego a las nueve en punto, cuando abren sus oficinas. El comunicado del canciller Ivo Voss se selló el día anterior y llama al ataque una medida administrativa inevitable.\n\nLos barcos ya se ven desde el muelle.",
        tEn:"The Meridian Pact attacks right on schedule.", tEs:"El Pacto Meridiano ataca puntualmente." },
      { en:"The Pact comes back through another cove with a second form, longer than the first. This one includes tanks.\n\nVoss does not raise his voice. The landing craft do it for him.",
        es:"El Pacto vuelve por otra caleta con un segundo formulario, más largo que el primero. Este incluye tanques.\n\nVoss no alza la voz. Las lanchas de desembarco lo hacen por él.",
        tEn:"The Pact lands again, this time with tanks.", tEs:"El Pacto vuelve a desembarcar, esta vez con tanques." },
      { en:"Final notice. The Pact sends everything it has left, in triplicate.\n\nVoss signs the order himself. His staff says that has never happened before.",
        es:"Último aviso. El Pacto envía todo lo que le queda, por triplicado.\n\nVoss firma la orden en persona. Su equipo asegura que eso nunca había ocurrido.",
        tEn:"The Pact sends everything it has left.", tEs:"El Pacto envía todo lo que le queda." }
    ],
    ledger:[
      { en:"The Red Ledger announces the island's liberation over loudspeakers, then opens fire. Marshal Amina Kade's speech lasts longer than the first barrage.\n\nThe posters are already printed. They spell the island's name wrong.",
        es:"El Libro Rojo anuncia por altavoces la liberación de la isla y después abre fuego. El discurso de la mariscal Amina Kade dura más que la primera andanada.\n\nLos carteles ya están impresos. Tienen mal escrito el nombre de la isla.",
        tEn:"The Red Ledger attacks after a very long speech.", tEs:"El Libro Rojo ataca después de un discurso larguísimo." },
      { en:"The Ledger returns with fewer troops, more loudspeakers, and reprinted posters. The island's name is spelled correctly now.\n\nKade blames the first defeat on a provocation by the waves.",
        es:"El Libro vuelve con menos tropas, más altavoces y carteles reimpresos. Ahora el nombre de la isla está bien escrito.\n\nKade atribuye la primera derrota a una provocación de las olas.",
        tEn:"The Ledger comes back, louder than before.", tEs:"El Libro vuelve, más ruidoso que antes." },
      { en:"Kade declares the island an enemy of history and sends every hull the Compact can spare.\n\nThe speeches have stopped. That is how the island knows this is the last push.",
        es:"Kade declara a la isla enemiga de la historia y envía todos los cascos que el Compacto puede reunir.\n\nLos discursos se terminaron. Así sabe la isla que es el último empuje.",
        tEn:"The Ledger makes its last push.", tEs:"El Libro hace su último intento." }
    ],
    lattice:[
      { en:"The Crown Lattice arrives in formation, banners first, as if the island had asked for a coronation.\n\nHigh Warden Soren Pell does not issue a statement. He issues an expectation: kneel by noon.",
        es:"La Celosía de la Corona llega en formación, estandartes por delante, como si la isla hubiera pedido una coronación.\n\nEl Alto Guardián Soren Pell no emite un comunicado. Emite una expectativa: arrodillarse antes del mediodía.",
        tEn:"The Crown Lattice demands that the island kneel, then attacks.", tEs:"La Celosía de la Corona exige que la isla se arrodille y ataca." },
      { en:"Noon has passed. The Lattice changes its approach and lands below the eastern cliff.\n\nPell watches from the flagship. He still does not wave.",
        es:"El mediodía ya pasó. La Celosía cambia de rumbo y desembarca bajo el acantilado oriental.\n\nPell observa desde la nave insignia. Sigue sin saludar.",
        tEn:"The Lattice lands below the eastern cliff.", tEs:"La Celosía desembarca bajo el acantilado oriental." },
      { en:"The Lattice sends its royal guard, the ships it was saving for parades.\n\nPell's herald reads a decree to the waves: the island does not exist. The island disagrees.",
        es:"La Celosía envía su guardia real, los barcos que reservaba para los desfiles.\n\nEl heraldo de Pell lee un decreto ante las olas: la isla no existe. La isla no está de acuerdo.",
        tEn:"The Lattice sends its royal guard.", tEs:"La Celosía envía su guardia real." }
    ],
    trust:[
      { en:"The Open Hemisphere Trust notifies the island that its account has been suspended, then opens fire.\n\nChief Compliance Officer Dana Holt livestreams the landing and thanks everyone for their patience.",
        es:"El Fideicomiso del Hemisferio Abierto notifica a la isla que su cuenta fue suspendida y después abre fuego.\n\nLa directora de cumplimiento Dana Holt transmite el desembarco en vivo y agradece la paciencia de todos.",
        tEn:"The Hemisphere Trust suspends the island's account and attacks.", tEs:"El Fideicomiso del Hemisferio suspende la cuenta de la isla y ataca." },
      { en:"The Trust pushes an update: Invasion 2.0, now with more drones.\n\nHolt promises a smoother experience and asks residents to rate it.",
        es:"El Fideicomiso publica una actualización: Invasión 2.0, ahora con más drones.\n\nHolt promete una experiencia más fluida y pide a los residentes que la califiquen.",
        tEn:"The Trust attacks again, with more drones.", tEs:"El Fideicomiso vuelve a atacar, con más drones." },
      { en:"Holt escalates the ticket to top priority. Every drone, boat and lawyer the Trust has left is on its way.\n\nThe terms of service are now forty pages longer.",
        es:"Holt escala el ticket a máxima prioridad. Todos los drones, botes y abogados que le quedan al Fideicomiso van en camino.\n\nLos términos de servicio ahora tienen cuarenta páginas más.",
        tEn:"The Trust sends everything it has left.", tEs:"El Fideicomiso envía todo lo que le queda." }
    ]
  };
  function assaultRow(){
    const n=(S.bcBattlesWon||0);
    const b=warBloc((n/3)|0);
    const rows=ASSAULT_TEXT[b.key]||ASSAULT_TEXT.pact;
    return rows[Math.max(0,Math.min(2,n%3))];
  }
  function assaultText(){
    const r=assaultRow();
    return chanceLang()?r.es:r.en;
  }
  // Post-battle reports (battles 1 and 2 of each bloc; the 3rd is the triumph).
  const REPORT_TEXT={
    pact:[
      { enT:"The Beach Holds", esT:"La playa resiste",
        en:"The Pact's landing collapses on the beach. Its occupation order had already been stamped.\n\nPaco comes back with one of the seals in his mouth and does not explain what happened to the clerk.",
        es:"El desembarco del Pacto se derrumba en la playa. Su orden de ocupación ya estaba sellada.\n\nPaco vuelve con uno de los sellos en la boca y no explica qué pasó con el funcionario.",
        tEn:"The Pact's landing collapses. Paco brings back one of its seals in his mouth.", tEs:"El desembarco del Pacto se derrumba. Paco trae uno de sus sellos." },
      { enT:"The Other Cove", esT:"La otra caleta",
        en:"The tanks reach the coast road but never clear the hill. Marek watches what the tide brings back and refuses to call it a victory.\n\nNico opens the bar anyway.",
        es:"Los tanques llegan al camino de la costa, pero nunca superan la colina. Marek mira lo que devuelve la marea y se niega a llamarlo victoria.\n\nNico abre el bar de todos modos.",
        tEn:"The tanks never clear the hill. Marek will not call it a victory; Nico opens the bar.", tEs:"Los tanques no superan la colina. Marek no lo llama victoria; Nico abre el bar." }
    ],
    ledger:[
      { enT:"The Posters", esT:"Los carteles",
        en:"The posters reach the water before the soldiers do. Marshal Kade is still speaking on the radio when the radio falls into the sea.\n\nSomeone on the dock starts laughing and cannot stop.",
        es:"Los carteles llegan al agua antes que los soldados. La mariscal Kade todavía habla por radio cuando el aparato cae al mar.\n\nAlguien en el muelle empieza a reírse y no puede parar.",
        tEn:"The Ledger's posters reach the water before its soldiers. Kade's radio ends up in the sea.", tEs:"Los carteles del Libro llegan al agua antes que sus soldados. La radio de Kade termina en el mar." },
      { enT:"The Line Breaks", esT:"La línea cede",
        en:"The assault line breaks against the wall. Paco sits on a disabled turret and chews on a poster.\n\nThe island does not celebrate. It exhales.",
        es:"La línea de ataque se rompe contra el muro. Paco se sienta sobre una torreta inutilizada y mordisquea un cartel.\n\nLa isla no celebra. Respira.",
        tEn:"The Ledger's line breaks against the wall. The island exhales.", tEs:"La línea del Libro se rompe contra el muro. La isla respira." }
    ],
    lattice:[
      { enT:"The Parade Stops", esT:"El desfile se detiene",
        en:"The procession breaks up on the reef. Its gray ships turn back when the island refuses to kneel.\n\nSoren Pell says nothing. For once, the silence belongs to the island.",
        es:"La procesión se desarma contra el arrecife. Sus barcos grises dan la vuelta cuando la isla se niega a arrodillarse.\n\nSoren Pell no dice nada. Por una vez, el silencio es de la isla.",
        tEn:"The Lattice's procession breaks up on the reef. The island does not kneel.", tEs:"La procesión de la Celosía se desarma en el arrecife. La isla no se arrodilla." },
      { enT:"Ash on the Water", esT:"Ceniza en el agua",
        en:"The Lattice's hulls burn in a low, even line below the cliff. By dusk, the cliff belongs to the island again.\n\nMarek watches the smoke without a word. On this island, that counts as a toast.",
        es:"Los cascos de la Celosía arden en una línea baja y pareja bajo el acantilado. Al anochecer, el acantilado vuelve a ser de la isla.\n\nMarek mira el humo sin decir nada. En esta isla, eso cuenta como un brindis.",
        tEn:"The Lattice burns below the cliff. By dusk the cliff is the island's again.", tEs:"La Celosía arde bajo el acantilado. Al anochecer, vuelve a ser de la isla." }
    ],
    trust:[
      { enT:"Terms Rejected", esT:"Términos rechazados",
        en:"The Trust lands drones first and lawyers second. Every soldier wears a camera, and every camera is live. The feed cuts out when the first boat turns back.\n\nDana Holt's statement calls the retreat a temporary service interruption.",
        es:"El Fideicomiso desembarca primero drones y después abogados. Cada soldado lleva una cámara, y cada cámara transmite en vivo. La señal se corta cuando el primer bote da la vuelta.\n\nEl comunicado de Dana Holt llama a la retirada una interrupción temporal del servicio.",
        tEn:"The Trust's feed cuts out when its first boat turns back.", tEs:"La transmisión del Fideicomiso se corta cuando su primer bote da la vuelta." },
      { enT:"Deprioritized", esT:"Despriorizados",
        en:"The new version gets the same result. The landing craft run aground on a reef the Trust had rated low risk. Nico collects three helmets with the price tags still on.\n\nThe island turns off the floodlights and goes to sleep.",
        es:"La nueva versión obtiene el mismo resultado. Las lanchas encallan en un arrecife que el Fideicomiso había calificado de bajo riesgo. Nico junta tres cascos que todavía tienen la etiqueta del precio.\n\nLa isla apaga los reflectores y se va a dormir.",
        tEn:"The Trust's boats run aground on a reef it had rated low risk.", tEs:"Los botes del Fideicomiso encallan en un arrecife que había calificado de bajo riesgo." }
    ]
  };
  function reportRow(){
    const won=S.bcBattlesWon||1;
    const i=Math.max(0,won-1);
    const b=warBloc((i/3)|0);
    const rows=REPORT_TEXT[b.key]||REPORT_TEXT.pact;
    return rows[(i%3)===1?1:0];
  }
  function battleReportText(){
    const row=reportRow();
    S.chanceTitle={ en:row.enT, es:row.esT };
    return chanceLang()?row.es:row.en;
  }
  const TRIUMPH_OPEN={
    pact:{ en:"The Meridian Pact is beaten. Its ships head home with their flags still up: lowering them requires a form nobody wants to sign.",
           es:"El Pacto Meridiano está derrotado. Sus barcos vuelven a casa con las banderas izadas: bajarlas exige un formulario que nadie quiere firmar." },
    ledger:{ en:"The Red Ledger is beaten. Its ships sail home in silence. For the first time in weeks, nobody on board is giving a speech.",
             es:"El Libro Rojo está derrotado. Sus barcos regresan en silencio. Por primera vez en semanas, nadie a bordo da un discurso." },
    lattice:{ en:"The Crown Lattice is beaten. Its fleet withdraws in perfect formation, the one thing it has left.",
              es:"La Celosía de la Corona está derrotada. Su flota se retira en formación perfecta, lo único que le queda." },
    trust:{ en:"The Hemisphere Trust is beaten. Its fleet logs off one ship at a time.",
            es:"El Fideicomiso del Hemisferio está derrotado. Su flota se desconecta barco por barco." }
  };
  const TRIUMPH_RECOG={
    pact:{ en:"Voss sends a one-line note. It uses the word recognition. It avoids the word surrender. Bitcoin Country appears in the typeface they reserve for countries they dislike.",
           es:"Voss envía una nota de una línea. Usa la palabra reconocimiento y evita la palabra rendición. Bitcoin Country aparece con la tipografía que reservan para los países que no les agradan." },
    ledger:{ en:"Kade signs a paper that calls the island a nation and the campaign a miscalculation. Back home, the posters will have to be reprinted.",
             es:"Kade firma un documento que llama nación a la isla y error de cálculo a la campaña. En su país tendrán que reimprimir los carteles." },
    lattice:{ en:"Pell does not apologize. He sends a herald to a harbor the Lattice no longer holds to say one word, recognition, in the tone of someone correcting a clerical error.",
              es:"Pell no se disculpa. Envía a un heraldo a un puerto que la Celosía ya no controla para pronunciar una sola palabra, reconocimiento, con el tono de quien corrige un error administrativo." },
    trust:{ en:"Holt pushes a terms-of-service update: Bitcoin Country is now listed as a sovereign nation, on page 412, in very small print.",
            es:"Holt publica una actualización de los términos de servicio: Bitcoin Country figura ahora como nación soberana, en la página 412, en letra muy pequeña." }
  };
  function triumphText(){
    const es=chanceLang();
    const won=S.bcBattlesWon||0;
    const b=warBloc(((won-1)/3)|0);
    const titles={
      pact:{en:"The Pact Falls Back",es:"El Pacto retrocede"},
      ledger:{en:"The Ledger Breaks",es:"El Libro se rompe"},
      lattice:{en:"The Lattice Goes Quiet",es:"La Celosía se calla"},
      trust:{en:"The Trust Logs Off",es:"El Fideicomiso se desconecta"}
    };
    S.chanceTitle=titles[b.key]||titles.pact;
    const L=(o)=>es?o.es:o.en;
    const open=L(TRIUMPH_OPEN[b.key]||TRIUMPH_OPEN.pact);
    const recog=L(TRIUMPH_RECOG[b.key]||TRIUMPH_RECOG.pact);
    // The bakery only closes on national holidays (set up in "This Is Apparently a Place Now"): each bloc defeat gives it one.
    const holiday=won>=9
      ? (es?"Tercer feriado nacional, y la panadería cierra otra vez. Nadie organiza nada: toda la isla termina en el muelle y se queda ahí hasta que oscurece."
           :"A third national holiday, and the bakery closes again. Nobody organizes anything: the whole island simply ends up on the dock and stays until dark.")
      : won>=6
      ? (es?"Segundo feriado nacional. La panadería cierra otra vez, el altavoz regresa a su cajón junto al muelle y esta vez la isla ya se sabe las canciones."
           :"A second national holiday. The bakery closes again, the speaker goes back on its crate by the dock, and this time the island knows the songs.")
      : (es?"Por primera vez desde que abrió, la panadería cierra: su cartel decía «solo feriados nacionales», y la isla por fin tiene uno. Alguien pone un altavoz sobre un cajón junto al muelle y los niños corren por la playa con banderas que no combinan."
           :"For the first time since it opened, the bakery closes: its sign said national holidays only, and the island finally has one. Someone sets a speaker on a crate by the dock, and children run along the beach with flags that do not match.");
    const tail=won>=9
      ? (es?"La radio queda en silencio. Por una vez, nadie se apura a encenderla.":"The radio goes quiet. For once, nobody hurries to turn it back on.")
      : won>=6
      ? (es?"Queda "+warBloc(2).esThe+". Si ataca, lo hará dentro de 210 velas.":"Only "+warBloc(2).enThe+" remains. If it attacks, it will be within 210 candles.")
      : (es?"Quedan dos bloques. Si el próximo ataca, lo hará dentro de 210 velas.":"Two blocs remain. If the next one attacks, it will be within 210 candles.");
    return open+"\n\n"+recog+"\n\n"+holiday+"\n\n"+rebuildNote()+"\n\n"+tail;
  }
  function warTldr(id){
    const es=chanceLang();
    const n=(S.bcBattlesWon||0);
    if(id==="blocReplies") return es
      ? "Los tres bloques responden de forma distinta: reconocimiento, rechazo, demora o una exigencia de pago. Al final de la semana, los tres están movilizando sus flotas."
      : "The three blocs answer differently: recognition, rejection, delay, or a demand for payment. By the end of the week, all three are mobilizing their fleets.";
    if(id==="blocAssault"){ const r=assaultRow(); return es?r.tEs:r.tEn; }
    if(id==="battleWon"){ const r=reportRow(); return es?r.tEs:r.tEn; }
    if(id==="blocTriumph"){
      const won=n;
      const b=warBloc(((won-1)/3)|0);
      const name=capF(es?b.esThe:b.enThe);
      const head=es?name+" reconoce a la nación.":name+" recognizes the nation.";
      if(won>=9) return head+" "+rebuildShort();
      const mid=won<6?(es?" La panadería cierra por primera vez: es feriado nacional.":" The bakery closes for the first time: it is a national holiday."):"";
      return head+mid+" "+rebuildShort()+(es?" Si el próximo bloque ataca, lo hará dentro de 210 velas.":" If the next bloc attacks, it will be within 210 candles.");
    }
    return "";
  }
  function applyWarCard(card){
    if(!card) return null;
    if(card.id==="firstBloc"||card.id==="rearmament"||card.id==="threeColors") return blocIntroText(card.id, chanceLang());
    if(card.id==="blocReplies"){
      const report=blocReplyIsReport();
      card.kind=report?"report":"choice";
      card.opts=report?[]:[
        {k:"a", label:"Pay for formal recognition", labelEs:"Pagar por el reconocimiento formal"},
        {k:"b", label:"Refuse the payment", labelEs:"Rechazar el pago"}
      ];
      return repliesText();
    }
    if(card.id==="blocAssault"){
      if((S.bcBattlesWon||0)===0){
        card.kind="choice";
        card.opts=[
          {k:"go", label:"Defend the beach", labelEs:"Defender la playa"},
          {k:"tut", label:"Review the battle tutorial", labelEs:"Revisar el tutorial de batalla"}
        ];
      }else{
        card.kind="report";
        card.opts=[];
      }
      return assaultText();
    }
    if(card.id==="battleWon") return battleReportText();
    if(card.id==="blocTriumph") return triumphText();
    return null;
  }
  function scheduleAssault(max){
    const cap=Math.max(8, max|0);
    const wait=cap<=40 ? (8+((Math.random()*32)|0)) : (24+((Math.random()*(cap-24))|0));
    S.bcAssaultAt=(S.candles||0)+wait;
  }
  function dueAssault(){
    if(!(S.bcAssaultAt>0)) return false;
    if((S.candles||0)<S.bcAssaultAt) return false;
    if(S.phase!=="play" || S.bcVictory) return false;
    if(S.bcDefense && !S.bcDefense.done) return false;
    const phase=S.phase;
    window.__arcForce="blocAssault";
    try{ dealChance(); } finally { window.__arcForce=""; }
    if(S.phase!==phase){ S.bcAssaultAt=0; return true; }
    return false;
  }
  function chainArc(id){
    window.__arcForce=id;
    S.optPanel=null;
    S.bcNameAsk=false;
    if(S.phase!=="chance") S.phase="chance";
    try{ dealChance(); } finally { window.__arcForce=""; }
  }
  function clearBattleField(){
    S.bcDefense=null;
    S.battleTutOpen=false;
    if(field)field.classList.remove("defense-mode");
    releaseBattleLoad();
    try{if(A&&A.battleMusic)A.battleMusic(false);}catch(e){}
    const pad=$("def-pad");if(pad)pad.classList.add("hide");
    const aa=$("def-aa");if(aa)aa.classList.add("hide");
    S.defPtr=null;
    S.defHeld={u:0,d:0,l:0,r:0,f:0,aa:0};
  }
  function closeArc(card){
    const id=card&&card.id;
    if(id==="notYet"&&S.bcLostPending){S.bcLostPending=false;S.battleTutOpen=false;finishArcHold();battleLostScreen();return;}
    const launch=(id==="theAnswer"||id==="blocAssault")&&S.bcDefensePending;
    const chainCabinet=id==="theQuestion"&&!!S.bcIndependent&&!S.chanceUsed.cabinet;
    const chainDecl=id==="cabinet";
    const chainReplies=id==="declaration"&&!!S.bcIndependent&&!S.bcRepliesDone;
    const afterTriumph=id==="blocTriumph";
    const afterBattle=id==="battleWon";
    const afterReplies=id==="blocReplies";
    const chainFourth=id==="blocTriumph"&&(S.bcBattlesWon||0)>=9;
    const chainTriumph=afterTriumph&&!chainFourth;
    const chainBattle=afterBattle;
    if((id==="battleWon"||id==="blocTriumph")&&S.bcDefense&&S.bcDefense.frozen)clearBattleField();
    S.battleTutOpen=false;
    if(launch||chainCabinet||chainDecl||chainReplies||chainFourth||chainBattle||chainTriumph) S.arcChain=true;
    finishArcHold();
    if(launch){
      S.bcDefensePending=false;
      startDefense();
      return;
    }
    if(chainCabinet){ chainArc("cabinet"); return; }
    if(chainDecl){ chainArc("declaration"); return; }
    if(chainReplies){
      rollBlocReactions();
      S.bcRepliesDone=true;
      chainArc("blocReplies");
      return;
    }
    if(afterTriumph && (S.bcBattlesWon||0)>=9){
      chainArc("fourthColor");
      return;
    }
    if(afterBattle) scheduleAssault(40);
    if(afterTriumph || afterReplies) scheduleAssault(210);
    if (!launch && !chainReplies) nudgeArcWindow();
  }
  function nudgeArcWindow() {
    const now = S.candles || 0;
    if ((S.testArcEvery | 0) > 0) S.testArcNext = now + Math.max(1, S.testArcEvery | 0);
    if ((S.have.chance || 0) > 0) {
      const future = (S.chanceAt || []).some((c) => c > now);
      if (!future) planChanceWindow(now);
    }
  }
  function noteArcSeen(id) {
    if (!id) return;
    if (!S.arcSeen) S.arcSeen = [];
    if (S.arcSeen.indexOf(id) < 0) S.arcSeen.push(id);
  }

  function arcUnlocked(c) {
    if (!c) return false;
    if (!arcInPool(c)) return false;
    if (!S.chanceUsed) S.chanceUsed = {};
    const introOf = {
      nico: "landfill", lena: "landfill", paco: "nicoWedding",
      marek: "wine", sofi: "school", hector: "uncle", mike: "unclemike"
    };
    const namesOf = {
      nico: ["Nico"], lena: ["Lena"], paco: ["Paco"],
      marek: ["Marek"], sofi: ["Sofi"],
      hector: ["Héctor", "Hector"], mike: ["Uncle Mike", "Mike"]
    };
    if (c.after && c.after.some((id) => !S.chanceUsed[id])) return false;
    if (c.when) {
      let pass = false;
      try { pass = !!c.when(); } catch (err) { pass = false; }
      if (!pass) return false;
    }
    if (S.familyClosed && c.id !== "wedding") {
      const nm = ((c.title || "") + " " + (c.body || "") + " " + (c.bodyEs || "")).toLowerCase();
      if (/\blena\b/.test(nm)) return false;
    }
    if (c.after && c.after.length) return true;
    const who = Object.keys(introOf);
    for (let i = 0; i < who.length; i++) {
      const key = who[i];
      if (c.id === introOf[key]) continue;
      if (!arcMentions(c, key, namesOf[key])) continue;
      if (!S.chanceUsed[introOf[key]]) return false;
    }
    return true;
  }
  function arcMentions(c, key, aliases) {
    const cast = CHANCE_WHO[c.id];
    if (cast && cast.indexOf(key) >= 0) return true;
    const blob = ((c.title || "") + "\n" + (c.body || "") + "\n" + (c.bodyEs || "")).toLowerCase();
    const list = aliases || [];
    for (let j = 0; j < list.length; j++) {
      const a = String(list[j] || "").toLowerCase();
      if (!a) continue;
      const re = new RegExp("(^|[^a-z0-9áéíóúüñ])" + a.replace(/[.*+?^${}()|[\]\\]/g, "\\$&") + "([^a-z0-9áéíóúüñ]|$)");
      if (re.test(blob)) return true;
    }
    return false;
  }

  function dealChance() {
    const chaining = !!(window.__arcForce && S.phase === "chance");
    if (S.phase !== "play" && !chaining) return;
    if (!S.chanceUsed) S.chanceUsed = {};
    const weighted = (cards) => cards.flatMap((c) => c.jobMilestone ? [c, c, c] : [c]);
    const pool = weighted(CHANCE_CARDS.filter((c) => !S.chanceUsed[c.id] && arcUnlocked(c) && arcInPool(c)));
    const src = pool.length ? pool : weighted(CHANCE_CARDS.filter((c) => arcUnlocked(c) && !S.chanceUsed[c.id]));
    if (!src.length && !window.__arcForce) return;
    const forced = window.__arcForce && CHANCE_CARDS.find((c) => c.id === window.__arcForce);
    let card = forced || (src.length ? src[(Math.random() * src.length) | 0] : null);
    if (!forced && S.arcBias) {
      const bias = CHANCE_CARDS.find((c) => c.id === S.arcBias);
      if (bias && !S.chanceUsed[bias.id] && arcUnlocked(bias)) card = bias;
      else S.arcBias = "";
    }
    if (!card) return;
    if (card.id==="islandInspection" && !(S.bcIslandOffer>0)) S.bcIslandOffer=Math.max(1,wealthUsd()*(.10+Math.random()*.15));
    S.chanceUsed[card.id] = true;
    if (card.id === S.arcBias) S.arcBias = "";
    noteArcSeen(card.id);
    S.chanceCard = card; S.chanceOpt = null;
    if (card.id === "chess") pickChessProblem();
    try { preloadSingleArt(getChanceArtMeta(card).src, true); } catch (e) {}
    S.chanceNote = "";
    S.chanceReadyNote = "";
    S.chanceLead = "";
    S.chanceSettled = false;
    S.arcPending = null;
    S.arcTldr = "";
    S.arcHold = false;
    S.chanceTitle = null;
    const es0 = chanceLang();
    const warBody = applyWarCard(card);
    let body = warBody != null ? warBody : weaveCast(es0 ? (card.bodyEs || card.body) : card.body);
    if (card.id === "chess") {
      const cp = CHESS_POOL[pickChessProblem()];
      body = weaveCast(es0 ? cp.bodyEs : cp.body);
      S.chanceTitle = { en: cp.title, es: cp.titleEs };
    }
    if (card.job) body = fillJob(body, card.jobTier);
    if (card.id === "anOffer" || card.id === "ambassador") body = bcAssetBody(card.id, body, es0);
    if (card.kind === "report") {
      const before = bagSnap();
      S.chanceReadyNote = stampNation(resolveChance(card, "ok"));
      S.arcPending = bagSnap();
      S.arcTldr = formatArcTldr(before, S.arcPending);
      S.cash = before.cash; S.btc = before.btc; S.cold = before.cold;
      S.invuln = before.invuln;
      S.msig = before.msig;
      S.chanceSettled = true;
      S.chanceBody = body;
    } else {
      if (card.id === "anOffer") {
        const offer = formatPayCost(wealthUsd() * 1.35);
        S.bcOfferTxt = offer;
        body = es0
          ? body.replace("por 35% más que tu patrimonio actual", "por " + offer)
          : body.replace("for 35% more than your current net worth", "for " + offer);
      }
      S.chanceBody = body;
    }
    const cue = (card.id === "blocAssault" || card.id === "theAnswer") ? "war" : "";
    S.optPanel = null;
    S.bcNameAsk = false;
    setPhase("chance");
    if (card.id === "blocTriumph") {
      try { if (A.playVictory) A.playVictory(); } catch (e) {}
    } else if (cue) {
      try { if (A.playCue) A.playCue(cue); } catch (e) {}
    } else {
      try { A.speak("Arc"); } catch (e) {}
    }
    renderHud();
  }

  // anOffer and ambassador list what was built; declined builds (settlement, grid, mine) must not appear.
  function bcAssetBody(id, body, es) {
    const andJoin = (a) => a.length < 2 ? a.join("") : es ? a.slice(0, -1).join(", ") + " y " + a[a.length - 1] : a.length === 2 ? a.join(" and ") : a.slice(0, -1).join(", ") + ", and " + a[a.length - 1];
    if (id === "anOffer") {
      const own = [];
      if (S.bcSettlement) own.push(es ? "el asentamiento" : "settlement");
      if (S.bcPower) own.push(es ? "la red eléctrica" : "power grid");
      if (S.bcMine) own.push(es ? "la mina" : "mine");
      if (S.bcCitadel) own.push(es ? "la ciudadela" : "citadel");
      return es
        ? body.replace("comprar la isla, el asentamiento, la red eléctrica, la mina y todo lo demás", "comprar " + andJoin(["la isla"].concat(own, ["todo lo demás"])))
        : body.replace("buy the island, settlement, power grid, mine, and every other part of the project", "buy " + andJoin(["the island"].concat(own, ["every other part of the project"])));
    }
    const sites = [es ? "el puerto" : "port"];
    if (S.bcPower) sites.push(es ? "la red eléctrica" : "power grid");
    if (S.bcMine) sites.push(es ? "la mina" : "mine");
    return es
      ? body.replace("Recorre el asentamiento, inspecciona el puerto, la red eléctrica y la mina,", (S.bcSettlement ? "Recorre el asentamiento" : "Recorre la isla") + ", inspecciona " + andJoin(sites) + (sites.length > 1 ? "," : ""))
      : body.replace("She walks through the settlement, inspects the port, power grid, and mine,", "She walks through the " + (S.bcSettlement ? "settlement" : "island") + ", inspects the " + andJoin(sites) + ",");
  }

  function bagSnap() {
    return { cash: S.cash, btc: S.btc, cold: S.cold, invuln: S.invuln || 0, msig: S.msig || 0 };
  }
  function formatArcTldr(before, after) {
    const es = chanceLang();
    const bits = [];
    const dCash = (after.cash || 0) - (before.cash || 0);
    const dBtc = (after.btc || 0) - (before.btc || 0);
    const dCold = (after.cold || 0) - (before.cold || 0);
    const dMsig = (after.msig || 0) - (before.msig || 0);
    {
      // One currency per result: net the cash and BTC deltas into the player's display currency.
      const px = clampPx(S.price);
      const mixed = Math.abs(dCash) >= 0.5 && Math.abs(dBtc) >= 1e-8 && px > 0;
      if (mixed) {
        const netUsd = dCash + dBtc * px;
        if (preferBtcDisplay()) { const nb = netUsd / px; if (Math.abs(nb) >= 1e-8) bits.push((nb > 0 ? "+" : "−") + fmtBtcAmt(Math.abs(nb)) + " BTC"); }
        else if (Math.abs(netUsd) >= 0.5) bits.push((netUsd > 0 ? "+" : "−") + money(Math.abs(netUsd)));
      } else {
        if (Math.abs(dCash) >= 0.5) bits.push((dCash > 0 ? "+" : "−") + money(Math.abs(dCash)));
        if (Math.abs(dBtc) >= 1e-8) bits.push((dBtc > 0 ? "+" : "−") + fmtBtcAmt(Math.abs(dBtc)) + " BTC");
      }
    }
    if (dCold) bits.push((dCold > 0 ? "+" : "") + dCold + " cold");
    if (dMsig) bits.push((dMsig > 0 ? "+" : "") + dMsig + " multisig");
    if ((after.invuln || 0) > (before.invuln || 0) + 0.4) {
      bits.push(es ? "unos segundos de invulnerabilidad" : "a few seconds of invuln");
    }
    if (!bits.length) return "";
    return (es ? "Resultado · " : "Result · ") + bits.join(" · ");
  }
  function stripOutcomeMoney(text) {
    if (!String(S.arcTldr || "").trim()) return String(text || "").trim();
    let s = String(text || "");
    s = s.replace(/\s*(?:\d+(?:\.\d+)?×)\s+(?:on|sobre)\s+(?:\$[\d.,]+[kMBT]?|[\d.,]+\s*BTC)\b\.?/gi, "");
    s = s.replace(/\s+(?:on|sobre|on a)\s+(?:\$[\d.,]+[kMBT]?|[\d.,]+\s*BTC)(?:\s+buy-in)?\.?/gi, "");
    s = s.replace(/\s+(?:then|y después)\s+\+?(?:\$[\d.,]+[kMBT]?|[\d.,]+\s*BTC)\b\.?/gi, "");
    s = s.replace(/\s*[+\-−–]\s*\$[\d.,]+[kMBT]?\b\.?/g, "");
    s = s.replace(/\s*[+\-−–]\s*[\d.,]+\s*BTC\b\.?/gi, "");
    s = s.replace(/\$[\d.,]+[kMBT]?\s+is\b/gi, "That money is");
    s = s.replace(/[\d.,]+\s*BTC\s+is\b/gi, "That money is");
    s = s.replace(/\$[\d.,]+[kMBT]?\s+es\b/gi, "Ese dinero es");
    s = s.replace(/[\d.,]+\s*BTC\s+es\b/gi, "Ese dinero es");
    s = s.replace(/\$[\d.,]+[kMBT]?\s+ahora es\b/gi, "Ese dinero ahora es");
    s = s.replace(/[\d.,]+\s*BTC\s+ahora es\b/gi, "Ese dinero ahora es");
    s = s.replace(/:\s*(?=\n|$)/g, ".");
    s = s.replace(/\.\s*(?:and|y)\s*\.?$/gi, ".");
    s = s.replace(/\s+(?:and|y)\s*\.?$/gi, ".");
    s = s.replace(/[ \t]+\n/g, "\n").replace(/\n{3,}/g, "\n\n").replace(/[ \t]{2,}/g, " ").replace(/\s+\./g, ".");
    return s.trim();
  }
  function arcMoneyHtml(prose) {
    const story = stripOutcomeMoney(prose);
    const d = String(S.arcTldr || "").trim();
    const show = !!(d && story.indexOf(d) < 0);
    let html = story ? "<p class=\"arc-body\">" + story + "</p>" : "";
    if (show) html += "<p class=\"arc-result\">" + d + "</p>";
    return html;
  }
  function peelArcNote(note) {
    return String(note || "")
      .replace(/(?:\n\s*)+[+\-−–]?\s*\$[\d.,]+[kMBT]?\.?\s*$/gi, "")
      .replace(/(?:\n\s*)+[+\-−–]\s*[\d.,]+\s*BTC\.?\s*$/gi, "")
      .trim();
  }
  // TL;DR outcome: first sentence, plus the next one or two when the joke needs them.
  // Dots in "a.m."/"p. m.", "Mr."/"Dr." and chess moves ("15. Bxd7+", "Qb8+!!") are not sentence ends.
  const PUNCH_STAT = /^(?:[+\-−]\s*\d|World Military|Fuerza militar|Liberty Nodes|Nodos de Libertad)/i;
  function punchline(note) {
    const s = peelArcNote(note);
    if (!s) return "";
    const compact = String(s).replace(/\s+/g, " ").trim();
    const prot = compact
      .replace(/\b([ap])\.\s?m\./gi, (m) => m.replace(/\./g, "\u0000"))
      .replace(/\b(Mr|Mrs|Ms|Dr|Sr|Sra)\.(?=\s)/g, "$1\u0000")
      .replace(/\b(\d+)\.(\.\.)?(?=\s*(?:[KQRBNDTAC]?[a-h]?[1-8]?x?[a-h][1-8]|O-O))/g, (m) => m.replace(/\./g, "\u0000"))
      .replace(/([a-h][1-8](?:=[QRBNDTAC])?[+#]?)([!?]{1,2})(?=\s)/g, (m, a, b) => a + b.replace(/!/g, "\u0001").replace(/\?/g, "\u0002"));
    const parts = prot.split(/(?<=[.!?…]["”'»]?)\s+(?=["“'«¿¡]?[A-ZÁÉÍÓÚÑ0-9$+\-−])/)
      .map((p) => p.replace(/\u0000/g, ".").replace(/\u0001/g, "!").replace(/\u0002/g, "?").trim())
      .filter(Boolean);
    let line = parts[0] || compact;
    for (let i = 1; i < parts.length && i < 4; i++) {
      const nx = parts[i];
      if (PUNCH_STAT.test(nx)) break;
      if (!(line.length < 48 || nx.length <= 40)) break;
      if (line.length + 1 + nx.length > 165) break;
      line += " " + nx;
    }
    if (line.length > 165) line = line.slice(0, 162).replace(/\s+\S*$/, "") + "…";
    if ((line.match(/"/g) || []).length % 2) line += "\"";
    if ((line.match(/“/g) || []).length > (line.match(/”/g) || []).length) line += "”";
    return line;
  }
  // Hand-written TL;DR outcomes for long scenes that no single sentence can carry.
  const OUTCOME_TLDR = {
    "wedding:c": { en: "You tell Lena. “I'll miss you, Fartface.” You leave. Paco comes with you.",
      es: "Se lo dices a Lena. “Te voy a extrañar, Cara de Pedo”. Te vas. Paco se va contigo." }
  };
  function withArcDelta(text) {
    const d = String(S.arcTldr || "").trim();
    const s = String(text || "").trim();
    if (!d) return s;
    if (s && s.indexOf(d) >= 0) return s;
    return s ? s + "\n" + d : d;
  }
  function arcTldrBtn() {
    const size = ARC_TEXT === "s" ? "S" : ARC_TEXT === "l" ? "L" : "M";
    return "<div class=\"arc-top-actions\">"
      + "<button type=\"button\" class=\"arc-tldr-tog" + (ARC_TLDR ? " on" : "") + "\" id=\"arc-tldr-tog\" aria-pressed=\"" + (ARC_TLDR ? "true" : "false") + "\" title=\"" + (chanceLang() ? "Resumen corto" : "Short summary") + "\">" + t("chanceTldr") + "</button>"
      + "<button type=\"button\" class=\"arc-size-tog\" id=\"arc-size-tog\" aria-label=\"" + (chanceLang() ? "Tamaño del texto: " : "Text size: ") + size + "\" title=\"" + (chanceLang() ? "Tamaño del texto (S/M/L)" : "Text size (S/M/L)") + "\">" + size + "</button>"
      + "</div>";
  }
  function arcStoryHtml(card, body) {
    const tldr = cardTldr(card);
    const text = ARC_TLDR ? (tldr || body) : body;
    return "<p class=\"arc-body\">" + text + "</p>";
  }
  function arcOutcomeHtml() {
    const raw = peelArcNote(S.chanceNote) || S.chanceNote || "";
    let text;
    if (ARC_TLDR) {
      const peeled = stripOutcomeMoney(raw);
      const cid = S.chanceCard ? S.chanceCard.id : "";
      let fixed = cid && S.chanceOpt ? OUTCOME_TLDR[cid + ":" + S.chanceOpt] : null;
      if (cid === "chess") {
        const cp = chessProblem();
        const won = chessMoveOk(String(S.chanceOpt || "").replace(/^move:/, ""), cp);
        fixed = won ? { en: cp.tWin, es: cp.tWinEs } : { en: cp.tMiss, es: cp.tMissEs };
      }
      const punch = fixed ? (chanceLang() ? fixed.es : fixed.en) : (punchline(peeled) || peeled);
      const tldr = S.chanceCard ? cardTldr(S.chanceCard) : "";
      text = punch || tldr;
    } else {
      text = raw;
    }
    return arcMoneyHtml(text);
  }

  function commitArcBooks() {
    if (S.arcPending) {
      S.cash = S.arcPending.cash;
      S.btc = S.arcPending.btc;
      S.cold = S.arcPending.cold;
      if (S.arcPending.invuln != null) S.invuln = S.arcPending.invuln;
      if (S.arcPending.msig != null) S.msig = S.arcPending.msig;
      S.arcPending = null;
      clampHoldings();
    }
    try { renderHud(); } catch (e) {}
  }
  function finishArcHold() {
    commitArcBooks();
    S.chanceCard = null;
    S.chanceNote = "";
    S.chanceReadyNote = "";
    S.chanceBody = "";
    S.chanceSettled = false;
    S.chanceTitle = null;
    S.arcTldr = "";
    S.arcHold = true;
    if (S.arcChain) {
      const intoBattle = !!S.bcDefensePending;
      S.arcChain = false;
      S.arcHold = false;
      S.optPanel = null;
      if (!intoBattle) {
        S.phase = "chance";
        return;
      }
      S.phase = "play";
      try { hideOverlay(); overlay.classList.remove("chance-ui", "dock", "juke-ui", "fest-ui"); } catch (e) {}
      if (field) field.classList.add("is-play");
      return;
    }
    S.optBack = "play";
    S.optPanel = null;
    setPhase("paused");
  }

  let arcClickLock = 0;
  let arcChoiceAt = 0;
  let arcChoiceKey = "";
  let arcChoiceTimer = 0;
  function bindArcChoices(card) {
    const key = ((card && card.id) || "") + (S.chanceNote ? ":note" : ":ask") + (S.battleTutOpen ? ":tut" : "");
    const now = performance.now();
    if (key !== arcChoiceKey) {
      arcChoiceKey = key;
      arcChoiceAt = now + 500;
    }
    const waiting = () => performance.now() < arcChoiceAt;
    overlay.querySelectorAll("[data-ch]").forEach((btn) => {
      const hold = waiting();
      btn.disabled = hold;
      const go = (e) => {
        if (waiting()) { e.preventDefault(); e.stopPropagation(); return; }
        e.preventDefault();
        e.stopPropagation();
        pickChance(btn.getAttribute("data-ch"));
      };
      btn.onclick = go;
      btn.onpointerdown = (e) => { if (waiting()) { e.preventDefault(); e.stopPropagation(); } };
    });
    if (arcChoiceTimer) clearTimeout(arcChoiceTimer);
    const left = arcChoiceAt - now;
    if (left > 0) {
      arcChoiceTimer = setTimeout(() => {
        arcChoiceTimer = 0;
        if (S.phase !== "chance") return;
        overlay.querySelectorAll("[data-ch]").forEach((btn) => { btn.disabled = false; });
      }, left + 20);
    }
  }
  function pickChance(opt) {
    const now = performance.now();
    if (now - arcClickLock < 280) return;
    arcClickLock = now;
    const card = S.chanceCard;
    if (!card) { finishArcHold(); return; }
    if (card.id==="blocAssault" && opt==="tut") {
      markBattleTut();
      S.battleTutOpen=true;
      S.chanceBody=battleTutPlain();
      S.chanceTitle={en:"Battle tutorial", es:"Tutorial de batalla"};
      card.kind="choice";
      card.opts=[{k:"go", label:"Begin the defense", labelEs:"Iniciar la defensa"}];
      S.chanceNote="";
      renderOverlay();
      return;
    }
    if (card.id==="blocAssault" && opt==="go") {
      S.battleTutOpen=false;
      S.bcDefensePending=true;
      closeArc(card);
      return;
    }
    if (card.id==="fourthColor") {
      closeArc(card);
      if (opt==="keep") { try { grantAward("freeNation"); } catch (e) {} }
      if (opt==="end") endIndependence();
      return;
    }
    if (card.id==="theQuestion" && opt==="a" && !S.bcVictory) {
      askCountryName();
      return;
    }
    if (!S.chanceNote) {
      if (card.kind === "report" || S.chanceSettled) {
        closeArc(card);
        return;
      }
      const before = bagSnap();
      let note = "";
      try { note = stampNation(resolveChance(card, opt) || ""); } catch (err) { note = ""; }
      try { cardAwards(card, opt); } catch (e) {}
      if (!note) note = chanceLang() ? "Listo." : "Done.";
      S.chanceNote = note;
      S.chanceOpt = opt;
      S.arcPending = bagSnap();
      S.arcTldr = formatArcTldr(before, S.arcPending);
      S.cash = before.cash; S.btc = before.btc; S.cold = before.cold;
      S.invuln = before.invuln;
      S.msig = before.msig;
      renderOverlay();
      renderHud();
      return;
    }
    closeArc(card);
  }

  function tickJobChance() {
    if(S.bcOg&&!S.bcArcClosed&&(S.candles||0)>0&&(S.candles||0)%21===0&&S.bcNodeTick!==(S.candles||0)){S.bcNodeTick=S.candles||0;S.bcNodes=Math.min(100,(S.bcNodes||0)+(S.bcSettlement?2:1));if(S.bcMine)creditBtc(.01);say("Liberty Nodes "+S.bcNodes+"/100",false,"ui");}
    if ((S.have.job || 0) > 0 && S.candles > 0 && S.candles % 21 === 0) payJob();
    if (S.mp) return;
    if (dueAssault()) return;
    const every = S.testArcEvery | 0;
    if (every > 0) {
      if (!(S.testArcNext > 0)) S.testArcNext = (S.candles || 0) + every;
      if ((S.candles || 0) >= S.testArcNext && S.phase === "play") {
        const phase = S.phase;
        dealChance();
        S.testArcNext = (S.candles || 0) + (S.phase !== phase ? every : 1);
      }
      return;
    }
    if ((S.have.chance || 0) > 0) {
      if (!S.chanceAt || !S.chanceAt.length) planChanceWindow(S.candles || 0);
      if (S.chanceAt && S.chanceAt.indexOf(S.candles) >= 0 && S.phase === "play") dealChance();
      if (S.chanceUntil && S.candles >= S.chanceUntil) planChanceWindow(S.candles);
    }
  }

  function perkOpen() {
    const ids = ["dca", "ff", "adopt", "manip", "candy", "juke", "aibud", "job", "market", "chance", "opsec"].filter((id) => {
      const have = S.have[id] || 0;
      const max = PERK_MAX[id] || 10;
      if (id === "dca") return have <= 0;
      if (id === "aibud") {
        if (have >= max) return false;
        if (have === 2 && S.have.dca <= 0 && S.have.manip <= 0) return false;
        return true;
      }
      return have < max;
    });
    return ids;
  }

  function perkOfferTitle() {
    if (S.ranked) {
      const n = S.perkFib || S.nextOffer || 1;
      const es = window.BZ && BZ.lang && BZ.lang() === "es";
      return es ? ("Fibonacci " + n + ": ¡toma tu perk!") : ("Fibonacci " + n + ": grab your perk!");
    }
    return t("grabPerk");
  }

  function tryRankedPerk(fromMarket) {
    if (S.mp) return false;
    if (!S.ranked) return false;
    if (S.phase === "perk") return false;
    if ((S.lasers || 0) < (S.nextOffer || 1)) return false;
    if (fromMarket || S.phase === "paused") {
      S.perkResume = { phase: "paused", panel: S.optPanel || "market" };
    } else {
      S.perkResume = null;
    }
    S.perkFib = S.nextOffer;
    openPerkOffer("laser", fromMarket || S.phase === "paused");
    return S.phase === "perk";
  }

  function openPerkOffer(why, forceUi) {
    if (S.mp) return;
    const left = perkOpen();
    if (!left.length) return;
    rollPerks();
    if (!S.perkOffers || !S.perkOffers.length) return;
    if (S.perkOffers[S.perkOffers.length - 1] !== "skip") S.perkOffers.push("skip");
    S.perkPick = "";
    if (!forceUi && S.aibudOn && (S.have.aibud || 0) >= 2) {
      // Never Adoption: if only Adoption is left next to "Gently decline", decline.
      const real = S.perkOffers.filter((id) => id !== "skip" && id !== "adopt");
      if (!real.length) { bumpOffer(); return; }
      const pick = bestAiPerk(real);
      grantPerk(pick.id);
      bumpOffer();
      aiAct("perk:" + pick.id + ":" + (S.have[pick.id] || 1), pick.why);
      say(aiPerkVoice(pick.id), true, "aibud");
      return;
    }
    if (why === "laser") say("Fibonacci treshold reached, grab your perk!", true);
    if (S.aibudOn && (S.have.aibud || 0) >= 1) {
      const opts = S.perkOffers.filter((id) => id !== "skip" && id !== "adopt");
      S.perkHint = opts.length ? bestAiPerk(opts).id : "skip";
    } else S.perkHint = "";
    setPhase("perk");
  }

  function fibSeq(n) {
    const s = [1, 2];
    while (s.length < n) {
      s.push(s[s.length - 1] + s[s.length - 2]);
    }
    return s;
  }

  function bumpOffer() {
    S.offersDone += 1;
    if (S.ranked) {
      const s = S.offerSeq && S.offerSeq.length ? S.offerSeq : fibSeq(16);
      S.offerSeq = s;
      while (s.length <= S.offersDone) {
        const i = s.length;
        s.push(s[i - 1] + s[i - 2]);
      }
      S.nextOffer = s[S.offersDone];
      return;
    }
    const s = S.offerSeq;
    if (S.offersDone < s.length) S.nextOffer = s[S.offersDone];
    else {
      const n = 10 * (S.offersDone + 1);
      s.push(n);
      S.nextOffer = n;
    }
  }

  function rollPerks() {
    const ids = perkOpen();
    if (!ids.length) { S.perkOffers = []; return; }
    if (ids.length === 1) S.perkOffers = [ids[0]];
    else {
      const copy = ids.slice();
      const a = copy.splice((Math.random() * copy.length) | 0, 1)[0];
      const b = copy.splice((Math.random() * copy.length) | 0, 1)[0];
      S.perkOffers = [a, b];
    }
    if (S.perkOffers.indexOf("job") >= 0) pickJobOffer();
  }

  function perkWhy(id) {
    if (id === "skip") return "Adoption is not worth it here";
    if (id === "dca") return "Income becomes bitcoin";
    if (id === "candy") return "More candle cash to stack sats";
    if (id === "job") return "Paycheck to convert into bitcoin";
    if (id === "aibud") return "Better timing for the stack";
    if (id === "manip") return "Steer price while we accumulate";
    if (id === "market") return "Lasers and lives to keep stacking";
    if (id === "adopt") return "Tamer bears protect the bag";
    if (id === "chance") return "Arc shots at more bitcoin";
    if (id === "ff") return "More candles, more cash to stack";
    if (id === "juke") return "No stack value, last resort";
    if (id === "opsec") return "Extra lives to keep stacking";
    return "Best for stacking bitcoin";
  }

  function aiPerkVoice(id) {
    const name = {
      dca: "D.C.A.",
      candy: "Candle candy",
      job: "Employment",
      aibud: "an A.I. bud upgrade",
      manip: "Manipulation",
      adopt: "Adoption",
      market: "Marketplace",
      chance: "Arc",
      ff: "FastForward",
      juke: "Jukebox",
      opsec: "Opsec"
    }[id] || "a perk";
    const lines = [
      "A.I. bud takes " + name,
      "A.I. bud picks " + name,
      "Stacking with " + name
    ];
    return lines[(Math.random() * lines.length) | 0];
  }

  function bestAiPerk(ids) {
    const have = S.have || {};
    const aiT = have.aibud || 0;
    const dca = (have.dca || 0) > 0;
    const holding = (S.btc || 0) > 1e-8;
    const lives = (S.cold || 0) + (S.msig || 0);
    const score = (id) => {
      if (!id || id === "skip") return -1;
      if (id === "market" && S.ranked && lives < 1) return 110;
      if (id === "opsec" && S.ranked && lives < 1) return 108;
      if (id === "dca" && !dca) return 100;
      if (id === "aibud" && aiT < 4) return 96;
      if (id === "manip") return 90;
      if (id === "market") return 86;
      if (id === "candy") return dca ? 82 : 76;
      if (id === "job") return dca ? 80 : 64;
      if (id === "aibud" && aiT < 6) return 72;
      if (id === "chance") return 54;
      if (id === "ff") return 36;
      if (id === "aibud") return 22;
      if (id === "juke") return 18;
      if (id === "adopt") return 8;
      if (id === "opsec") return 4;
      return 10;
    };
    let best = ids[0], bestS = -1;
    ids.forEach((id) => {
      const n = score(id);
      if (n > bestS) { bestS = n; best = id; }
    });
    return { id: best, why: perkWhy(best) };
  }

  function aiLocks() {
    const t = S.have.aibud || 0;
    return {
      dca: !!(S.aibudOn && t >= 3 && S.have.dca > 0),
      trend: !!(S.aibudOn && t >= 3 && S.have.manip > 0),
      trade: !!(S.aibudOn && t >= 4)
    };
  }

  const AI_ES = {
    "Sold BTC": "Vendió BTC",
    "Bought BTC": "Compró BTC",
    "DCA ON": "DCA ACTIVADO",
    "DCA OFF": "DCA APAGADO",
    "Trend UP": "TENDENCIA ↑",
    "Trend DOWN": "TENDENCIA ↓",
    "Dump incoming · raise cash for the dip": "Viene una caída · junta efectivo para la baja",
    "Sold the bull · raise cash for the dip": "Vendió el bull · junta efectivo para la baja",
    "Pump incoming · accumulate": "Viene una subida · acumula",
    "Bought the black swan": "Compró el cisne negro",
    "Bought the bear": "Compró el bear",
    "Bear/swan · income to bitcoin": "Bear o cisne · el ingreso va a bitcoin",
    "Bull · do not buy the top": "Bull · no compres el máximo",
    "Holding · pump the bag": "Con bolsa · empuja el precio",
    "Flat · cheaper next buy": "Sin bolsa · la próxima compra sale más barata",
    "Stronger army for the next battle": "Un ejército más fuerte para la próxima batalla",
    "Adoption is not worth it here": "Aquí la adopción no conviene",
    "Income becomes bitcoin": "El ingreso se vuelve bitcoin",
    "More candle cash to stack sats": "Más cash de velas para juntar sats",
    "Paycheck to convert into bitcoin": "El sueldo se convierte en bitcoin",
    "Better timing for the stack": "Mejor momento para el stack",
    "Steer price while we accumulate": "Guía el precio mientras acumulamos",
    "Lasers and lives to keep stacking": "Láseres y vidas para seguir juntando",
    "Tamer bears protect the bag": "Bears más suaves protegen la bolsa",
    "Arc shots at more bitcoin": "Tiros de Arc para más bitcoin",
    "More candles, more cash to stack": "Más velas, más cash para juntar",
    "No stack value, last resort": "No suma al stack, último recurso",
    "Extra lives to keep stacking": "Vidas extra para seguir juntando",
    "Best for stacking bitcoin": "Lo mejor para juntar bitcoin"
  };
  const AI_RES = [
    /^Army tier (\d+)\/7$/,
    /^perk:([A-Za-z0-9]+):(\d+)$/
  ];
  function aiVis(s) {
    const text = String(s || "");
    const perk = AI_RES[1].exec(text);
    if (perk) return "Perk " + perkTitle(perk[1], Number(perk[2]) || 1);
    if (window.BZ && BZ.lang && BZ.lang() === "es") {
      if (Object.prototype.hasOwnProperty.call(AI_ES, text)) return AI_ES[text];
      const army = AI_RES[0].exec(text);
      if (army) return "Nivel de ejército " + army[1] + "/7";
    }
    return text;
  }

  function aiAct(act, why) {
    if (!S.iaLog) S.iaLog = [];
    S.iaLog.unshift({ t: S.lifeT, act: act, why: why || "", btc: netBtc(), candles: S.candles || 0 });
    if (S.iaLog.length > 48) S.iaLog.pop();
    if (A.sfx && A.sfx.iabud) A.sfx.iabud();
  }

  function aiTradeGap() {
    const t = S.have.aibud || 0;
    if (t >= 6) return 2;
    if (t >= 5) return 5;
    if (t >= 4) return 10;
    return 9999;
  }

  function canAiTrade() {
    return (S.candles || 0) - (S.aiTradeAt == null ? -9999 : S.aiTradeAt) >= aiTradeGap();
  }

  function markAiTrade() {
    if (S.aiTimingStart == null) {
      S.aiTimingStart = S.lifeT;
      S.aiTimingLast = S.lifeT;
      say("A.I. bud is timing the market for you!", true, "aibud");
    }
  }

  function tickAiTiming() {
    if (S.aiTimingStart == null || S.phase !== "play") return;
    if ((S.aiTimingLast || 0) && S.lifeT - S.aiTimingLast < 60) return;
    if (!S.aiTimingLast && S.lifeT - S.aiTimingStart < 60) return;
    S.aiTimingLast = S.lifeT;
    say("A.I. bud is timing the market for you!", true, "aibud");
  }

  function incomingKind(kinds, horizon) {
    const m = metrics();
    let speed = m.speed * scrollMul();
    if (S.power === "BULL" || S.power === "BEAR" || S.laserOn) speed *= 1.28;
    for (const it of S.items) {
      if (kinds.indexOf(it.type) < 0) continue;
      const eta = (it.x - S.bird.x) / Math.max(40, speed);
      if (eta > 0.12 && eta < horizon) return it;
    }
    return null;
  }

  function cycleU() {
    return Math.min(1, S.cycleElapsed / Math.max(0.001, S.cycleDur));
  }

  function tickAi(dt) {
    // A.I. bud always buys the next Army tier as soon as it is affordable.
    if (S.aibudOn && S.phase === "play" && (S.have.aibud || 0) >= 1 && S.bcArmyUnlocked && !S.bcVictory && !S.bcArcClosed && armyTier() < 7) {
      S.aiArmyAcc = (S.aiArmyAcc || 0) + dt;
      if (S.aiArmyAcc >= 0.5) {
        S.aiArmyAcc = 0;
        if (armyTierQuote().affordable && buyArmy()) { aiAct("Army tier " + armyTier() + "/7", "Stronger army for the next battle"); try { renderBitcoinCountry(); } catch (e) {} }
      }
    }
    if (!S.aibudOn || S.phase !== "play" || (S.have.aibud || 0) < 3) return;
    S.aiAcc = (S.aiAcc || 0) + dt;
    tickAiTiming();
    if (S.aiAcc < 0.22) return;
    S.aiAcc = 0;
    const t = S.have.aibud;
    const inSwan = !!S.swanBear;
    const inBear = S.power === "BEAR" || inSwan;
    const inBull = S.power === "BULL";
    const incomingDump = incomingKind(["BEAR", "SWAN"], 2.8);
    const incomingPump = incomingKind(["BULL", "HALVE"], 2.8);
    const u = cycleU();
    const bullPeak = inBull && (u >= 0.52 || S.powerT < 1.35);
    let acted = false;

    if (t >= 4 && canAiTrade()) {
      const bag = netBtc();
      const shouldSell = S.btc > 0 && !inBear && (bullPeak || incomingDump);
      const shouldBuy = S.cash > 0 && !inBull && (inBear || incomingPump);
      if (shouldSell) {
        S.aiSilent = true; sellBtc(); S.aiSilent = false;
        S.iaProfit += netBtc() - bag;
        S.aibudLit = Object.assign({}, S.aibudLit, { sell: true, buy: false });
        S.aibudLitAt = Object.assign({}, S.aibudLitAt, { sell: S.lifeT, buy: 0 });
        S.aiTradeAt = S.candles || 0;
        markAiTrade();
        aiAct("Sold BTC", incomingDump ? "Dump incoming · raise cash for the dip" : "Sold the bull · raise cash for the dip");
        acted = true;
      } else if (shouldBuy) {
        S.aiSilent = true; buyBtc(); S.aiSilent = false;
        S.iaProfit += netBtc() - bag;
        S.aibudLit = Object.assign({}, S.aibudLit, { buy: true, sell: false });
        S.aibudLitAt = Object.assign({}, S.aibudLitAt, { buy: S.lifeT, sell: 0 });
        S.aiTradeAt = S.candles || 0;
        markAiTrade();
        aiAct("Bought BTC", incomingPump ? "Pump incoming · accumulate" : (inSwan ? "Bought the black swan" : "Bought the bear"));
        acted = true;
      }
    }

    if (t >= 3 && S.have.dca > 0) {
      const want = !!(inBear && !inBull);
      if (want !== !!S.dcaOn) {
        S.dcaOn = want;
        S.aibudLit = Object.assign({}, S.aibudLit, { dca: true });
        aiAct(want ? "DCA ON" : "DCA OFF", want ? "Bear/swan · income to bitcoin" : "Bull · do not buy the top");
        acted = true;
      }
    }

    if (t >= 3 && S.have.manip > 0) {
      const holding = (S.btc || 0) > 1e-12;
      const want = holding ? "up" : "down";
      if (want !== S.trend) {
        S.trend = want;
        S.aibudLit = Object.assign({}, S.aibudLit, { trend: true });
        aiAct(want === "up" ? "Trend UP" : "Trend DOWN", holding ? "Holding · pump the bag" : "Flat · cheaper next buy");
        acted = true;
      }
    }
    if (acted) {
      try { renderHud(); } catch (e) {}
    }
  }

  function continueBonus() {
    S.level = 2;
    S.vtPrice = 100 + Math.random() * 200;
    S.vt = 0; S.vtCycle = S.vtPrice;
    resetWorld(true);
    startCount();
  }

  let countTimer = 0;
  function startCount() {
    S.countN = 3; setPhase("count");
    if (A && A.sfx && A.sfx.count) A.sfx.count();
    clearInterval(countTimer);
    countTimer = setInterval(() => {
      S.countN -= 1;
      if (S.countN <= 0) {
        clearInterval(countTimer);
        if (A && A.sfx && A.sfx.go) A.sfx.go();
        setPhase("play");
      } else {
        if (A && A.sfx && A.sfx.count) A.sfx.count();
        renderOverlay();
      }
    }, 1000);
  }

  function themeHooks() {
    return [
      () => S.power,
      () => S.phase === "play",
      () => !!(S.jukeOn && A && A.jukePlaying && A.jukePlaying())
    ];
  }
  function kickTheme() {
    if (!A || !A.startMusic) return;
    try {
      if (A.unlock) A.unlock();
      A.startMusic.apply(A, themeHooks());
    } catch (e) {}
  }

  function armyBattleMods(tier){
    tier=Math.max(0,Math.min(7,tier|0));
    const lives=Math.floor(tier/2);
    // Every tier now matters: shot speed, fewer attackers, the citadel wall from tier 5 and double-damage shells at tier 7.
    return {speed:tier*5,shot:tier*4,shield:tier*5,power:tier>=7?2:1,medic:lives>0,wall:tier>=5,fewer:tier*0.04,lives,hearts:3+lives};
  }
  function armyTier(){
    let tier=S.bcArmyTier|0;
    if(S.bcArmyTier==null && (S.bcArmy|0)>0) tier=Math.round((S.bcArmy||0)/100*7);
    if((S.bcArmy|0)>=100) tier=Math.max(tier,7);
    return Math.max(0,Math.min(7,tier));
  }
  function defenseUpgrades(){return armyBattleMods(armyTier());}
  function armyTierQuote(){
    const px=clampPx(S.price);
    const net=Math.max(0,netUsd());
    // Scales with the tier being bought: 250, 500 … 1750 BTC (same 7000 BTC total as the old flat 1000/tier, cheaper to start).
    const nextTier=Math.min(7,armyTier()+1);
    const usd=Math.max(250*nextTier*px, net*0.05);
    const cash=Math.max(0,S.cash||0);
    const btcUsd=Math.max(0,(S.btc||0)*px);
    const preferBtc=preferBtcDisplay();
    const btc=px>0?usd/px:1000;
    const liquid=cash+btcUsd;
    return {usd,btc,preferBtc,label:costLabel(usd),affordable:liquid+1e-4>=usd};
  }
  function payArmyTier(){
    const q=armyTierQuote();
    if(!q.affordable) return null;
    payUsd(q.usd);
    return q;
  }
  function buyArmy(){
    if(!S.bcArmyUnlocked||S.bcVictory||S.bcArcClosed) return false;
    const tier=armyTier();
    if(tier>=7) return false;
    const q=payArmyTier();
    if(!q) return false;
    S.bcArmyTier=tier+1;
    S.bcArmy=Math.round(S.bcArmyTier*100/7);
    S.bcArmySpend=(S.bcArmySpend||0)+q.usd;
    const m=armyBattleMods(S.bcArmyTier);
    say("Army tier "+S.bcArmyTier+"/7 · speed +"+m.speed+"% · shield -"+m.shield+"% · −"+q.label,false,"ui");
    return true;
  }
  window.ChoppyBitcoinCountry=window.ChoppyBitcoinCountry||{};
  window.ChoppyBitcoinCountry.buyArmy=buyArmy;
  window.ChoppyBitcoinCountry.status=()=>({nodes:S.bcNodes||0,army:S.bcArmy||0,world:S.bcWorld||20,citadel:!!S.bcCitadel,independent:!!S.bcIndependent});
  function formArmy(){
    if(S.bcArmyUnlocked||S.bcVictory||S.bcArcClosed)return false;
    const p=cutPct(.02);S.bcArmyUnlocked=true;if(S.bcArmyTier==null)S.bcArmyTier=0;S.bcArmySpend=(S.bcArmySpend||0)+p;
    say("Defense force formed. −"+costLabel(p),false,"ui");return true;
  }
  window.ChoppyBitcoinCountry.formArmy=formArmy;
  const BC_TS=16,BC_C=30,BC_R=40;
  function bcAt(m,x,y){if(x<0||y<0||x>=BC_C||y>=BC_R)return 3;return m[y*BC_C+x];}
  function bcSet(m,x,y,t){if(x>=0&&y>=0&&x<BC_C&&y<BC_R)m[y*BC_C+x]=t;}
// MAPGEN_START
  const MAP_TYPES=[
    {id:"harbor", naval:false, theme:"docks"},
    {id:"docks", naval:false, theme:"docks"},
    {id:"riverWoods", naval:false, theme:"woods", river:true},
    {id:"peninsula", naval:false, theme:"wild"},
    {id:"beachAirport", naval:false, theme:"airport"},
    {id:"cliffs", naval:false, theme:"cliffs"},
    {id:"seatown", naval:false, theme:"village"},
    {id:"bay", naval:false, theme:"wild"},
    {id:"cove", naval:false, theme:"wild"},
    {id:"headland", naval:false, theme:"cliffs"},
    {id:"brickYard", naval:false, theme:"maze"},
    {id:"canalMaze", naval:false, theme:"maze"},
    {id:"blockFort", naval:false, theme:"maze"},
    {id:"caribbean", naval:true, theme:"caribbean"},
    {id:"openSea", naval:true, theme:"sea"},
    {id:"channel", naval:true, theme:"sea"},
    {id:"roadstead", naval:true, theme:"docks"},
    {id:"twinPiers", naval:true, theme:"docks"},
    {id:"seaHarbor", naval:true, theme:"docks"},
    {id:"seaBay", naval:true, theme:"wild"},
    {id:"seaPeninsula", naval:true, theme:"cliffs"},
    {id:"archipelago", naval:true, theme:"caribbean"},
    {id:"seaVillage", naval:true, theme:"village"}
  ];
  const SKEL_PAD={
    beach:{x:12,y:26,gate:"n"},
    bay:{x:12,y:24,gate:"n"},
    peninsula:{x:12,y:33,gate:"n"},
    harbor:{x:12,y:27,gate:"n"},
    docks:{x:12,y:26,gate:"n"},
    cove:{x:2,y:16,gate:"e"},
    headland:{x:1,y:22,gate:"e"},
    coastVillage:{x:18,y:26,gate:"n"},
    seatown:{x:14,y:26,gate:"n"},
    riverWoods:{x:12,y:24,gate:"n"},
    beachAirport:{x:8,y:28,gate:"n"},
    cliffs:{x:12,y:26,gate:"n"},
    caribbean:{x:10,y:22,gate:"s"},
    openSea:{x:2,y:35,gate:"n"},
    channel:{x:0,y:17,gate:"e"},
    roadstead:{x:8,y:32,gate:"n"},
    twinPiers:{x:13,y:31,gate:"n"},
    seaHarbor:{x:23,y:34,gate:"n"},
    seaBay:{x:0,y:31,gate:"e"},
    seaPeninsula:{x:12,y:34,gate:"n"},
    archipelago:{x:22,y:16,gate:"w"},
    seaVillage:{x:16,y:34,gate:"n"},
    brickYard:{x:11,y:14,gate:"n"},
    canalMaze:{x:8,y:16,gate:"w"},
    blockFort:{x:12,y:12,gate:"n"}
  };
  function mapMulberry(seed){
    let s=seed>>>0;
    return function(){
      s=(Math.imul(1664525,s)+1013904223)>>>0;
      return s/4294967296;
    };
  }
  function shuffleIds(rng,arr){
    const a=arr.slice();
    for(let i=a.length-1;i>0;i--){
      const j=(rng()*(i+1))|0;
      const t=a[i];a[i]=a[j];a[j]=t;
    }
    return a;
  }
  // Coherent island geography: each bloc invades a different zone of the island, and its three
  // battles move inland from open coast -> mixed land/water -> closed or labyrinthine ground (the finale stays on land).
  const MAP_ZONES=[
    {key:"north", en:"NORTH PORT", es:"PUERTO NORTE",
     open:["harbor","bay"], mixed:["roadstead","twinPiers","seaHarbor"], closed:["docks","brickYard"]},
    {key:"west", en:"WEST WILDS", es:"MONTE OESTE",
     open:["cove","peninsula"], mixed:["seaBay","archipelago","channel"], closed:["riverWoods","canalMaze"]},
    {key:"east", en:"EAST CAPITAL", es:"CAPITAL ESTE",
     open:["beachAirport","headland"], mixed:["seaPeninsula","caribbean","openSea","seaVillage"], closed:["cliffs","seatown","blockFort"]}
  ];
  const MAP_STAGE_NAME={open:["OPEN COAST","COSTA ABIERTA"],mixed:["LAND AND SEA","TIERRA Y MAR"],closed:["INLAND","TIERRA ADENTRO"]};
  function ensureMapPlan(){
    if(S.bcMapPlan&&S.bcMapPlan.length===9&&S.bcMapPlan[0].zone)return S.bcMapPlan;
    if(!S.bcMapSeed)S.bcMapSeed=(Math.random()*0x7fffffff)|1;
    const rng=mapMulberry(S.bcMapSeed);
    const byId={};MAP_TYPES.forEach((t)=>{byId[t.id]=t;});
    const plan=[];
    const order=shuffleIds(rng,[0,1,2]); // which zone each bloc lands on varies per run
    const seaAt=[0,1,2].map(()=>rng()<0.5?0:1); // exactly one sea battle per bloc: its 1st or 2nd, never the finale
    for(let level=0;level<9;level++){
      const zone=MAP_ZONES[order[(level/3)|0]];
      const slot=level%3;
      const stage=slot===2?"closed":(slot===seaAt[(level/3)|0]?"mixed":"open");
      const pool=zone[stage];
      const type=byId[pool[(rng()*pool.length)|0]]||MAP_TYPES[0];
      plan.push({
        id:type.id, naval:!!type.naval, theme:type.theme, river:!!type.river,
        fx:rng()<0.5, fy:rng()<0.5,
        dress:type.theme, light:type.theme==="caribbean"?rng()<0.85:rng()<0.5,
        zone:zone.key, zoneEn:zone.en, zoneEs:zone.es, stage
      });
    }
    S.bcMapPlan=plan;
    return plan;
  }
  function mfill(m,x0,y0,x1,y1,t){
    const xa=Math.max(0,Math.min(x0,x1)|0), xb=Math.min(BC_C-1,Math.max(x0,x1)|0);
    const ya=Math.max(0,Math.min(y0,y1)|0), yb=Math.min(BC_R-1,Math.max(y0,y1)|0);
    for(let y=ya;y<=yb;y++)for(let x=xa;x<=xb;x++)m[y*BC_C+x]=t;
  }
  function paintSkel(m,id){
    if(id==="beach")mfill(m,0,12,29,39,6);
    else if(id==="bay"){mfill(m,0,8,29,39,6);mfill(m,9,8,20,18,3);}
    else if(id==="peninsula"){
      for(let y=22;y<=39;y++){
        const k=(y-22)/17, half=Math.round(3+k*6), cx=15;
        mfill(m,cx-half,y,cx+half,y,6);
      }
    }else if(id==="harbor"){
      mfill(m,0,14,29,39,6);
      mfill(m,10,14,19,24,3);
      mfill(m,6,6,6,14,7);
      mfill(m,22,6,22,14,7);
      mfill(m,13,18,13,24,7); // basin docks: straight from the south quay into open basin water
      mfill(m,16,18,16,24,7);
    }else if(id==="docks"){
      mfill(m,0,12,29,39,6);
      mfill(m,6,3,6,12,7);
      mfill(m,14,3,14,12,7);
      mfill(m,22,3,22,12,7);
    }else if(id==="cove"){
      mfill(m,0,0,18,39,6);
      mfill(m,12,12,29,27,3);
    }else if(id==="headland"){
      mfill(m,0,12,12,28,6);
      mfill(m,12,16,18,24,6);
      mfill(m,3,19,12,20,2);
    }else if(id==="coastVillage"||id==="seatown"){
      mfill(m,0,11,29,39,6);
      mfill(m,8,11,16,16,3);
    }else if(id==="riverWoods"){
      mfill(m,0,9,29,39,6);
    }else if(id==="beachAirport"){
      mfill(m,0,16,29,39,6);
    }else if(id==="cliffs"){
      mfill(m,0,15,29,39,6);
      mfill(m,0,15,7,20,3);
      mfill(m,21,15,29,19,3);
    }else if(id==="caribbean"){
      for(let y=16;y<=34;y++){
        const k=Math.sin(((y-16)/18)*Math.PI);
        const half=Math.round(3+k*7);
        mfill(m,15-half,y,15+half,y,6);
      }
    }else if(id==="openSea"){
      mfill(m,0,28,14,39,6);
      mfill(m,3,28,10,34,3);
    }else if(id==="channel"){
      mfill(m,0,6,9,33,6);
      mfill(m,6,15,9,24,3);
    }else if(id==="roadstead"){
      mfill(m,0,16,7,39,6);
      mfill(m,0,31,16,39,6);
      mfill(m,12,24,12,31,7);
    }else if(id==="twinPiers"){
      mfill(m,8,30,22,39,6);
      mfill(m,10,22,10,30,7);
      mfill(m,19,22,19,30,7);
    }else if(id==="seaHarbor"){
      mfill(m,0,30,29,39,6);
      mfill(m,0,26,8,39,6);
      mfill(m,22,26,29,39,6);
      mfill(m,9,30,20,36,3);
      mfill(m,9,36,9,39,7);
      mfill(m,20,36,20,39,7);
      mfill(m,12,33,12,36,7);
      mfill(m,17,33,17,36,7);
    }else if(id==="seaBay"){
      mfill(m,0,0,10,39,6);
      mfill(m,5,10,10,28,3);
      mfill(m,6,18,8,18,7);
    }else if(id==="seaPeninsula"){
      mfill(m,0,33,29,39,6);
      for(let y=14;y<=33;y++){
        const half=Math.round(2+((33-y)/19)*5);
        mfill(m,15-half,y,15+half,y,6);
      }
      mfill(m,15,16,15,24,7);
    }else if(id==="archipelago"){
      for(let y=8;y<=30;y++){
        const k=Math.sin(((y-8)/22)*Math.PI);
        const w=Math.round(4+k*6);
        mfill(m,29-w,y,29,y,6);
      }
      [[3,4,5,8],[2,30,6,35],[14,4,18,8],[16,32,21,37],[8,16,11,20]].forEach(([x0,y0,x1,y1])=>{
        const cx=(x0+x1)/2, cy=(y0+y1)/2, rx=Math.max(1,(x1-x0)/2), ry=Math.max(1,(y1-y0)/2);
        for(let y=y0;y<=y1;y++)for(let x=x0;x<=x1;x++){
          const dx=(x-cx)/rx, dy=(y-cy)/ry;
          if(dx*dx+dy*dy<=1)m[y*BC_C+x]=6;
        }
      });
    }else if(id==="seaVillage"){
      mfill(m,0,31,29,39,6);
      mfill(m,6,31,14,35,3);
      mfill(m,18,27,27,31,6);
      mfill(m,21,25,23,31,7);
      mfill(m,8,36,8,39,7);
      mfill(m,12,36,12,38,7);
    }
  }
  function padFits(m,x,y){
    if(x<0||y<0||x+5>=BC_C||y+4>=BC_R)return false;
    for(let dy=0;dy<5;dy++)for(let dx=0;dx<6;dx++)if(m[(y+dy)*BC_C+(x+dx)]===3)return false;
    return true;
  }
  function fitPad(m,x,y){
    if(padFits(m,x,y))return {x,y};
    for(let r=1;r<22;r++){
      for(let dy=-r;dy<=r;dy++)for(let dx=-r;dx<=r;dx++){
        if(Math.abs(dx)!==r&&Math.abs(dy)!==r)continue;
        if(padFits(m,x+dx,y+dy))return {x:x+dx,y:y+dy};
      }
    }
    return {x:Math.max(0,Math.min(BC_C-6,x)),y:Math.max(0,Math.min(BC_R-5,y))};
  }
  function inlandGate(pad){
    const cx=pad.x+2.5, cy=pad.y+2;
    const sides=[
      {g:"s", d:cy},
      {g:"n", d:(BC_R-1)-cy},
      {g:"e", d:cx},
      {g:"w", d:(BC_C-1)-cx}
    ];
    sides.sort((a,b)=>a.d-b.d);
    return sides[0].g;
  }
  function pickEdgePad(m,rng,ok){
    const cand=[];
    for(let y=0;y<BC_R-4;y++)for(let x=0;x<BC_C-5;x++){
      if(!padFits(m,x,y))continue;
      if(ok && !ok({x,y}))continue;
      const cx=x+2.5, cy=y+2;
      const edge=Math.min(cx,cy,(BC_C-1)-cx,(BC_R-1)-cy);
      const w=edge<=3?12:edge<=6?2.4:edge<=9?0.32:0.05;
      cand.push({x,y,w});
    }
    if(!cand.length)return null;
    let sum=0;
    for(const c of cand)sum+=c.w;
    let r=rng()*sum;
    for(const c of cand){r-=c.w;if(r<=0)return {x:c.x,y:c.y};}
    return {x:cand[0].x,y:cand[0].y};
  }
  function controlZones(){
    return [[0,468,168,640],[132,484,216,640],[184,520,296,640]];
  }
  function boxHitsZones(box){
    const zones=controlZones();
    for(let i=0;i<zones.length;i++){
      const z=zones[i];
      if(box.x1>z[0]&&box.x0<z[2]&&box.y1>z[1]&&box.y0<z[3])return true;
    }
    return false;
  }
  function citadelHitsUi(pad,fx,fy){
    if(!pad)return true;
    let x0=pad.x-1, y0=pad.y-1, x1=pad.x+6, y1=pad.y+5;
    if(fx){ const a=BC_C-1-x1, b=BC_C-1-x0; x0=a; x1=b; }
    if(fy){ const a=BC_R-1-y1, b=BC_R-1-y0; y0=a; y1=b; }
    return boxHitsZones({x0:x0*BC_TS, y0:y0*BC_TS, x1:(x1+1)*BC_TS, y1:(y1+1)*BC_TS});
  }
  function moveShieldOffUi(m){
    const cells=[];
    let x0=BC_C,y0=BC_R,x1=-1,y1=-1;
    for(let y=0;y<BC_R;y++)for(let x=0;x<BC_C;x++){
      if(m[y*BC_C+x]!==5)continue;
      cells.push({x,y});
      if(x<x0)x0=x; if(y<y0)y0=y; if(x>x1)x1=x; if(y>y1)y1=y;
    }
    if(!cells.length)return null;
    if(!boxHitsZones({x0:x0*BC_TS-4,y0:y0*BC_TS-4,x1:(x1+1)*BC_TS+4,y1:(y1+1)*BC_TS+4}))return null;
    let best=null, bestD=1e9;
    for(let y=1;y<BC_R-2;y++)for(let x=1;x<BC_C-2;x++){
      if(boxHitsZones({x0:(x-1)*BC_TS,y0:(y-1)*BC_TS,x1:(x+3)*BC_TS,y1:(y+3)*BC_TS}))continue;
      let dry=true;
      for(let dy=0;dy<2&&dry;dy++)for(let dx=0;dx<2;dx++)if(m[(y+dy)*BC_C+(x+dx)]===3)dry=false;
      if(!dry)continue;
      const d=(x-x0)*(x-x0)+(y-y0)*(y-y0);
      if(d<bestD){bestD=d;best={x,y};}
    }
    if(!best)return null;
    const ring=[];
    eachShieldRing(x0,y0,(x,y)=>{
      if(x<0||y<0||x>=BC_C||y>=BC_R)return;
      const i=y*BC_C+x;
      if(m[i]===1)ring.push(i);
    });
    for(let i=0;i<cells.length;i++)m[cells[i].y*BC_C+cells[i].x]=6;
    for(let i=0;i<ring.length;i++)if(m[ring[i]]===1)m[ring[i]]=6;
    for(let dy=0;dy<2;dy++)for(let dx=0;dx<2;dx++)m[(best.y+dy)*BC_C+(best.x+dx)]=5;
    sealShield(m);
    return {x:best.x*BC_TS+BC_TS,y:best.y*BC_TS+BC_TS};
  }
  function nudgeHomeOffUi(built){
    const h=built&&built.home;
    if(!h||!boxHitsZones({x0:h.x-12,y0:h.y-12,x1:h.x+12,y1:h.y+12}))return;
    const m=built.map, naval=!!built.naval;
    let best=null, bd=1e9;
    for(let y=0;y<BC_R;y++)for(let x=0;x<BC_C;x++){
      const t=m[y*BC_C+x];
      const ok=naval?t===3:(t===0||t===6||t===7);
      if(!ok)continue;
      const px=x*BC_TS+8, py=y*BC_TS+8;
      if(boxHitsZones({x0:px-18,y0:py-18,x1:px+18,y1:py+18}))continue;
      const d=(px-h.x)*(px-h.x)+(py-h.y)*(py-h.y);
      if(d<bd){bd=d;best={x:px,y:py};}
    }
    if(best)built.home=best;
  }
  function shieldCorner(map){
    let ox=BC_C,oy=BC_R,n=0;
    for(let y=0;y<BC_R;y++)for(let x=0;x<BC_C;x++){
      if(map[y*BC_C+x]!==5)continue;
      if(x<ox)ox=x;if(y<oy)oy=y;n++;
    }
    return n?{x:ox,y:oy}:null;
  }
  function eachShieldRing(ox,oy,fn){
    for(let dy=-1;dy<=2;dy++)for(let dx=-1;dx<=2;dx++){
      if(dx>=0&&dx<=1&&dy>=0&&dy<=1)continue;
      fn(ox+dx,oy+dy);
    }
  }
  function stampCitadel(m,pad){
    const ox=pad.x+2,oy=pad.y+1;
    const set=(x,y,t)=>{if(x>=0&&y>=0&&x<BC_C&&y<BC_R)m[y*BC_C+x]=t;};
    for(let dy=-1;dy<=2;dy++)for(let dx=-1;dx<=2;dx++)set(ox+dx,oy+dy,6);
    set(ox,oy,5);set(ox+1,oy,5);set(ox,oy+1,5);set(ox+1,oy+1,5);
    eachShieldRing(ox,oy,(x,y)=>set(x,y,1));
  }
  function addFort(m,pad){
    stampCitadel(m,pad);
  }
  function sandFringe(m,pad,depth){
    const prot=(x,y)=>x>=pad.x-1&&x<=pad.x+6&&y>=pad.y-1&&y<=pad.y+5;
    for(let pass=0;pass<depth;pass++){
      const mark=[];
      for(let y=0;y<BC_R;y++)for(let x=0;x<BC_C;x++){
        if(m[y*BC_C+x]!==6||prot(x,y))continue;
        let wet=false;
        for(const [dx,dy] of [[1,0],[-1,0],[0,1],[0,-1]]){
          const xx=x+dx,yy=y+dy;
          if(xx<0||yy<0||xx>=BC_C||yy>=BC_R)continue;
          const tv=m[yy*BC_C+xx];
          if(tv===3||(pass&&tv===0))wet=true;
        }
        if(wet)mark.push(y*BC_C+x);
      }
      for(const i of mark)m[i]=0;
    }
  }
  function raiseBuilding(m,x,y){
    if(x<0||y<0||x>=BC_C||y>=BC_R)return;
    const i=y*BC_C+x;
    if(!m.bed){m.bed=new Uint8Array(m.length);m.bedSet=new Uint8Array(m.length);}
    const t=m[i];
    if((t===0||t===6)&&!m.bedSet[i]){m.bed[i]=t;m.bedSet[i]=1;}
    m[i]=1;
  }
  function layRoad(m,pad,gate,road){
    const set=(x,y)=>{
      if(x<1||y<1||x>=BC_C-1||y>=BC_R-1)return;
      const i=y*BC_C+x,t=m[i];
      if(t===0||t===6){m[i]=7;road[i]=1;}
    };
    let x=pad.x+2,y=pad.y+2;
    const legs=gate==="n"?[[0,-1],[1,0]]:gate==="s"?[[0,1],[-1,0]]:gate==="w"?[[-1,0],[0,1]]:[[1,0],[0,-1]];
    let dx=legs[0][0],dy=legs[0][1];
    for(let n=0;n<12;n++){
      x+=dx;y+=dy;
      const t=mtile(m,x,y);
      if(t===3||t===1||t===2||t===5||t===8||t===9)break;
      set(x,y);
      if(n===5){dx=legs[1][0];dy=legs[1][1];}
    }
  }
  function placeHouses(m,pad,road){
    const near=(x,y)=>x>=pad.x-2&&x<=pad.x+7&&y>=pad.y-2&&y<=pad.y+6;
    const shapes=[[2,2],[3,2],[2,3],[2,2]];
    let placed=0;
    for(let y=2;y<BC_R-4&&placed<5;y++){
      for(let x=2;x<BC_C-4&&placed<5;x++){
        if(((x*5+y*3)%7)!==0)continue;
        const sh=shapes[(x*3+y)&3], w=sh[0], h=sh[1];
        if(x+w>=BC_C-1||y+h>=BC_R-1)continue;
        let fit=true;
        for(let dy=-1;dy<=h&&fit;dy++)for(let dx=-1;dx<=w&&fit;dx++){
          const xx=x+dx, yy=y+dy;
          if(xx<1||yy<1||xx>=BC_C-1||yy>=BC_R-1||near(xx,yy)){fit=false;break;}
          const edge=dx<0||dy<0||dx>=w||dy>=h;
          const t=m[yy*BC_C+xx];
          if(!edge){ if(t!==6||road[yy*BC_C+xx])fit=false; }
          else if(t===1||t===2||t===5||t===9)fit=false;
        }
        if(!fit)continue;
        for(let dy=0;dy<h;dy++)for(let dx=0;dx<w;dx++)raiseBuilding(m,x+dx,y+dy);
        placed++;
        x+=w+1;
      }
    }
  }
  function canTree(m,x,y,pad,road){
    if(x<1||y<1||x>=BC_C-1||y>=BC_R-1)return false;
    const i=y*BC_C+x;
    if(m[i]!==6||road[i])return false;
    if(x>=pad.x-2&&x<=pad.x+7&&y>=pad.y-2&&y<=pad.y+6)return false;
    return true;
  }
  function putTree(m,x,y,pad,road){if(canTree(m,x,y,pad,road))m[y*BC_C+x]=4;}
  function groveAt(m,cx,cy,pad,road){
    [[0,0],[1,0],[0,1],[1,1],[-1,0],[0,-1],[2,0],[-1,1]].forEach(([dx,dy])=>putTree(m,cx+dx,cy+dy,pad,road));
  }
  function wildGroves(m,pad,road){
    const spots=[];
    for(let y=3;y<BC_R-3;y+=4)for(let x=3;x<BC_C-3;x+=5)if(canTree(m,x,y,pad,road))spots.push({x,y});
    spots.filter((_,i)=>i%5===0).slice(0,1).forEach((s)=>groveAt(m,s.x,s.y,pad,road));
  }
  function beachTrees(m,pad,road){
    for(let y=1;y<BC_R-1;y++)for(let x=1;x<BC_C-1;x++){
      if(!canTree(m,x,y,pad,road))continue;
      let sand=false,path=false;
      for(const [dx,dy] of [[1,0],[-1,0],[0,1],[0,-1]]){
        const t=m[(y+dy)*BC_C+(x+dx)];
        if(t===0)sand=true;
        if(t===7)path=true;
      }
      if(!sand||path||((x+y)%7)!==0)continue;
      putTree(m,x,y,pad,road);
      for(const [dx,dy] of [[1,0],[-1,0],[0,1],[0,-1]]){
        if(m[(y+dy)*BC_C+(x+dx)]!==0)continue;
        putTree(m,x-dx,y-dy,pad,road);
        break;
      }
    }
  }
  function edgeLine(edge){
    const cells=[];
    if(edge==="n"){for(let x=0;x<BC_C;x++)cells.push([x,0]);}
    else if(edge==="s"){for(let x=0;x<BC_C;x++)cells.push([x,BC_R-1]);}
    else if(edge==="w"){for(let y=0;y<BC_R;y++)cells.push([0,y]);}
    else {for(let y=0;y<BC_R;y++)cells.push([BC_C-1,y]);}
    return cells;
  }
  function edgeBand(edge,depth){
    const cells=[];
    const d=Math.max(1,depth|0);
    if(edge==="n"){for(let y=0;y<d;y++)for(let x=0;x<BC_C;x++)cells.push([x,y]);}
    else if(edge==="s"){for(let y=BC_R-d;y<BC_R;y++)for(let x=0;x<BC_C;x++)cells.push([x,y]);}
    else if(edge==="w"){for(let x=0;x<d;x++)for(let y=0;y<BC_R;y++)cells.push([x,y]);}
    else {for(let x=BC_C-d;x<BC_C;x++)for(let y=0;y<BC_R;y++)cells.push([x,y]);}
    return cells;
  }
  function fortGuard(m){
    const o=shieldCorner(m);
    if(!o)return ()=>false;
    const x0=o.x-1,y0=o.y-1,x1=o.x+2,y1=o.y+2;
    return (x,y)=>x>=x0&&x<=x1&&y>=y0&&y<=y1;
  }
  function edgeReport(m){
    return ["n","s","w","e"].map((e)=>{
      const cells=edgeLine(e);
      let water=0;
      for(const [x,y] of cells)if(m[y*BC_C+x]===3)water++;
      const n=cells.length||1;
      return {e, water, n, waterFrac:water/n, landFrac:(n-water)/n};
    });
  }
  function repairEdges(m,naval){
    const guard=fortGuard(m);
    const box=shieldCorner(m);
    const far=(e)=>{
      if(!box)return e==="n"?0:e==="s"?BC_R:e==="w"?0:BC_C;
      const cx=box.x+1, cy=box.y+1;
      if(e==="n")return cy;
      if(e==="s")return (BC_R-1)-cy;
      if(e==="w")return cx;
      return (BC_C-1)-cx;
    };
    const waterN=()=>edgeReport(m).filter((s)=>s.waterFrac>=0.62).length;
    const landN=()=>edgeReport(m).filter((s)=>s.landFrac>=0.62).length;
    const openWater=(e)=>{
      for(const [x,y] of edgeBand(e,3)){
        if(guard(x,y))continue;
        const t=m[y*BC_C+x];
        if(t!==5&&t!==9)m[y*BC_C+x]=3;
      }
    };
    const layLand=(e)=>{
      for(const [x,y] of edgeBand(e,3)){
        if(guard(x,y))continue;
        if(m[y*BC_C+x]===3)m[y*BC_C+x]=6;
      }
    };
    for(let pass=0;pass<3;pass++){
      if(naval){
        if(waterN()>=2)break;
        const pick=edgeReport(m).filter((s)=>s.waterFrac<0.62).sort((a,b)=>far(b.e)-far(a.e))[0];
        if(!pick)break;
        openWater(pick.e);
      }else{
        if(waterN()>=1&&landN()>=2&&landN()<4)break;
        if(landN()<2){
          const pick=edgeReport(m).filter((s)=>s.landFrac<0.62).sort((a,b)=>far(a.e)-far(b.e))[0];
          if(!pick)break;
          layLand(pick.e);
        }else if(waterN()<1||landN()>=4){
          const pick=edgeReport(m).filter((s)=>s.waterFrac<0.62).sort((a,b)=>far(b.e)-far(a.e))[0];
          if(!pick)break;
          openWater(pick.e);
        }else if(landN()<1){
          const pick=edgeReport(m).slice().sort((a,b)=>far(a.e)-far(b.e))[0];
          if(!pick)break;
          layLand(pick.e);
        }else break;
      }
    }
    if(landN()<1){
      const edges=edgeReport(m).slice().sort((a,b)=>b.landFrac-a.landFrac);
      for(let i=0;i<edges.length&&landN()<1;i++)layLand(edges[i].e);
    }
  }
  function mtile(m,x,y){if(x<0||y<0||x>=BC_C||y>=BC_R)return 3;return m[y*BC_C+x];}
  function homeFrom(m,pad,gate,naval){
    const step=gate==="n"?[0,-1]:gate==="s"?[0,1]:gate==="w"?[-1,0]:[1,0];
    let x=(gate==="n"||gate==="s")?pad.x+2:(gate==="w"?pad.x-1:pad.x+6);
    let y=(gate==="w"||gate==="e")?pad.y+2:(gate==="n"?pad.y-1:pad.y+5);
    for(let i=0;i<14;i++){
      const t=mtile(m,x,y);
      const ok=naval?t===3:(t===0||t===6||t===7);
      if(ok&&x>=0&&y>=0&&x<BC_C&&y<BC_R)return {x:x*BC_TS+8,y:y*BC_TS+8};
      x+=step[0];y+=step[1];
    }
    let best=null,bd=1e9;
    const gx=(pad.x+3)*BC_TS, gy=(pad.y+2)*BC_TS;
    for(let y2=0;y2<BC_R;y2++)for(let x2=0;x2<BC_C;x2++){
      const t=m[y2*BC_C+x2];
      const ok=naval?t===3:(t===0||t===6||t===7);
      if(!ok)continue;
      const px=x2*BC_TS+8,py=y2*BC_TS+8,d=Math.hypot(px-gx,py-gy);
      if(d<bd){bd=d;best={x:px,y:py};}
    }
    return best||{x:gx,y:gy};
  }
  function fortCenter(pad){return {x:(pad.x+2)*BC_TS+16,y:(pad.y+1)*BC_TS+16};}
  function onMainLand(m,x,y,home){
    const hx=Math.floor(home.x/BC_TS),hy=Math.floor(home.y/BC_TS);
    const key=hy*BC_C+hx;
    const land=(t)=>t===0||t===6||t===7||t===1||t===4||t===5;
    if(!land(m[y*BC_C+x]))return false;
    const seen=new Uint8Array(BC_C*BC_R);
    const q=[key]; seen[key]=1;
    let qi=0, found=false, n=0;
    while(qi<q.length && n<900){
      const i=q[qi++]; n++;
      const cx=i%BC_C, cy=(i/BC_C)|0;
      if(cx===x&&cy===y){found=true;break;}
      for(const [dx,dy] of [[1,0],[-1,0],[0,1],[0,-1]]){
        const xx=cx+dx,yy=cy+dy;
        if(xx<0||yy<0||xx>=BC_C||yy>=BC_R)continue;
        const j=yy*BC_C+xx;
        if(seen[j]||!land(m[j]))continue;
        seen[j]=1;q.push(j);
      }
    }
    return found;
  }
  function collectSpawns(m,home,naval){
    const pts=[];
    for(let y=1;y<BC_R-1;y++)for(let x=1;x<BC_C-1;x++){
      const t=m[y*BC_C+x];
      const px=x*BC_TS+8,py=y*BC_TS+8;
      if(Math.hypot(px-home.x,py-home.y)<110)continue;
      if(naval){
        if(t!==3)continue;
        let open=0;
        for(const [dx,dy] of [[1,0],[-1,0],[0,1],[0,-1]]){
          const xx=x+dx,yy=y+dy;
          if(xx<0||yy<0||xx>=BC_C||yy>=BC_R||m[yy*BC_C+xx]===3)open++;
        }
        if(open<3)continue;
        const edge=x<=3||y<=3||x>=BC_C-4||y>=BC_R-4;
        pts.push({x:px,y:py,d:Math.hypot(px-home.x,py-home.y)+(edge?50:0)});
      }else if(t===0||t===6||t===7){
        if(!onMainLand(m,x,y,home))continue;
        let wet=false;
        for(const [dx,dy] of [[1,0],[-1,0],[0,1],[0,-1]]){
          const xx=x+dx,yy=y+dy;
          if(xx<0||yy<0||xx>=BC_C||yy>=BC_R||m[yy*BC_C+xx]===3)wet=true;
        }
        if(!wet)continue;
        pts.push({x:px,y:py,d:Math.hypot(px-home.x,py-home.y)});
      }
    }
    pts.sort((a,b)=>b.d-a.d);
    const out=[];
    for(const p of pts){
      if(out.length>=4)break;
      if(out.some((q)=>Math.hypot(q.x-p.x,q.y-p.y)<72))continue;
      out.push({x:p.x,y:p.y});
    }
    if(out.length<4){
      for(let y=1;y<BC_R-1&&out.length<4;y+=2)for(let x=1;x<BC_C-1&&out.length<4;x+=2){
        const t=m[y*BC_C+x];
        const ok=naval?t===3:(t===0||t===6||t===7);
        if(!ok)continue;
        const px=x*BC_TS+8,py=y*BC_TS+8;
        if(Math.hypot(px-home.x,py-home.y)<70)continue;
        if(out.some((q)=>Math.hypot(q.x-px,q.y-py)<48))continue;
        out.push({x:px,y:py});
      }
    }
    while(out.length<3)out.push({x:Math.max(24,Math.min(BC_C*BC_TS-24,home.x+90)),y:Math.max(24,Math.min(BC_R*BC_TS-24,home.y))});
    return out;
  }
  function flipAll(built,fx,fy){
    if(!fx&&!fy)return built;
    const m=built.map,o=new Uint8Array(m.length);
    for(let y=0;y<BC_R;y++)for(let x=0;x<BC_C;x++){
      const nx=fx?BC_C-1-x:x, ny=fy?BC_R-1-y:y;
      o[ny*BC_C+nx]=m[y*BC_C+x];
    }
    const pt=(p)=>({x:fx?BC_C*BC_TS-p.x:p.x,y:fy?BC_R*BC_TS-p.y:p.y});
    if(m.bed){
      const b=new Uint8Array(m.length), s=new Uint8Array(m.length);
      for(let y=0;y<BC_R;y++)for(let x=0;x<BC_C;x++){
        const nx=fx?BC_C-1-x:x, ny=fy?BC_R-1-y:y;
        const i=y*BC_C+x, j=ny*BC_C+nx;
        b[j]=m.bed[i]; s[j]=m.bedSet[i];
      }
      o.bed=b; o.bedSet=s;
    }
    return {map:o,home:pt(built.home),fort:pt(built.fort),spawns:built.spawns.map(pt),landSpawns:(built.landSpawns||[]).map(pt),seaSpawns:(built.seaSpawns||[]).map(pt),naval:built.naval,skel:built.skel,maze:!!built.maze};
  }
  function faceIn(p){
    const dx=BC_C*BC_TS/2-p.x, dy=BC_R*BC_TS/2-p.y;
    if(Math.abs(dx)>Math.abs(dy))return dx>0?1:3;
    return dy>0?2:0;
  }
  function coastHash(x,y,salt){
    let n=(Math.imul(x,374761393)+Math.imul(y,668265263)+Math.imul(salt,1442695041))>>>0;
    n=Math.imul(n^(n>>>13),1274126177)>>>0;
    return n%100;
  }
  function jaggedCoast(m,pad,salt,keepTown){
    const prot=(x,y)=>x>=pad.x-2&&x<=pad.x+7&&y>=pad.y-2&&y<=pad.y+6;
    const pier=(x,y)=>{
      for(let dy=-2;dy<=2;dy++)for(let dx=-2;dx<=2;dx++)if(mtile(m,x+dx,y+dy)===7)return true;
      return false;
    };
    const town=(x,y)=>keepTown&&y>=pad.y-8&&y<=pad.y+10&&x>=pad.x-6&&x<=pad.x+12;
    const bites=[];
    for(let y=1;y<BC_R-1;y++)for(let x=1;x<BC_C-1;x++){
      const t=m[y*BC_C+x];
      if(t!==6&&t!==0)continue;
      if(prot(x,y)||pier(x,y)||town(x,y))continue;
      let wet=0;
      for(const [dx,dy] of [[1,0],[-1,0],[0,1],[0,-1]])if(mtile(m,x+dx,y+dy)===3)wet++;
      if(!wet)continue;
      const h=coastHash(x,y,salt);
      if(h<22||(wet>=2&&h<38))bites.push(y*BC_C+x);
    }
    for(const i of bites)m[i]=3;
    for(let y=2;y<BC_R-2;y++)for(let x=2;x<BC_C-2;x++){
      if(m[y*BC_C+x]!==3||prot(x,y)||pier(x,y)||town(x,y))continue;
      let land=0;
      for(const [dx,dy] of [[1,0],[-1,0],[0,1],[0,-1]]){
        const t=mtile(m,x+dx,y+dy);
        if(t===6||t===0)land++;
      }
      if(land===1&&coastHash(x,y,salt+3)<12)m[y*BC_C+x]=6;
    }
  }
  // Straight orthogonal bridge from any cell of `cells` to the first tile accepted by `isTarget`,
  // crossing only open water. Picks the shortest such span; no staircases.
  function straightBridge(m,cells,isTarget,maxLen){
    let best=null;
    for(const i of cells){
      const x0=i%BC_C,y0=(i/BC_C)|0;
      for(const [dx,dy] of [[1,0],[-1,0],[0,1],[0,-1]]){
        const span=[];let x=x0+dx,y=y0+dy;
        while(x>0&&y>0&&x<BC_C-1&&y<BC_R-1&&span.length<=maxLen&&m[y*BC_C+x]===3){span.push(y*BC_C+x);x+=dx;y+=dy;}
        if(!span.length||span.length>maxLen)continue;
        if(x<0||y<0||x>=BC_C||y>=BC_R)continue;
        const j=y*BC_C+x;
        if(!isTarget(j))continue;
        // keep water on both sides of the span so it reads as a bridge, not a causeway glued to land
        const px=dy?1:0,py=dx?1:0;
        if(span.some((k)=>{const kx=k%BC_C,ky=(k/BC_C)|0;return m[(ky+py)*BC_C+kx+px]!==3||m[(ky-py)*BC_C+kx-px]!==3;}))continue;
        if(!best||span.length<best.length)best=span;
      }
    }
    if(best)for(const k of best)m[k]=7;
    return best?best.length:0;
  }
  function seedIslands(m,rng){
    const N=BC_C*BC_R;
    const main=new Uint8Array(N);
    const landish=(t)=>t&&t!==3;
    let start=-1;
    for(let i=0;i<N;i++)if(m[i]===5){start=i;break;}
    if(start<0){for(let i=0;i<N;i++)if(landish(m[i])){start=i;break;}}
    if(start>=0){
      const q=[start]; main[start]=1;
      while(q.length){
        const i=q.pop(), x=i%BC_C, y=(i/BC_C)|0;
        for(const [dx,dy] of [[1,0],[-1,0],[0,1],[0,-1]]){
          const xx=x+dx, yy=y+dy;
          if(xx<0||yy<0||xx>=BC_C||yy>=BC_R)continue;
          const j=yy*BC_C+xx;
          if(main[j]||!landish(m[j]))continue;
          main[j]=1; q.push(j);
        }
      }
    }
    const blocked=new Uint8Array(main);
    const count=3+(rng()*3|0)+(rng()<0.4?1:0);
    const islands=[];
    let guard=0;
    while(islands.length<count&&guard++<160){
      const x=2+(rng()*(BC_C-6)|0), y=2+(rng()*(BC_R-6)|0);
      if(m[y*BC_C+x]!==3)continue;
      let near=false;
      for(let dy=-2;dy<=2&&!near;dy++)for(let dx=-2;dx<=2;dx++){
        const xx=x+dx, yy=y+dy;
        if(xx<1||yy<1||xx>=BC_C-1||yy>=BC_R-1){near=true;break;}
        if(main[yy*BC_C+xx])near=true;
      }
      if(!near){
        for(let dy=-1;dy<=1&&!near;dy++)for(let dx=-1;dx<=1;dx++){
          const xx=x+dx, yy=y+dy;
          const j=yy*BC_C+xx;
          if(blocked[j]&&!main[j])near=true;
        }
      }
      if(near)continue;
      const size=rng()<0.55?(2+(rng()*3|0)):(5+(rng()*4|0));
      const cells=[{x:x,y:y}];
      const mark=new Uint8Array(N);
      mark[y*BC_C+x]=1;
      let grow=0;
      while(cells.length<size&&grow++<48){
        const c=cells[(rng()*cells.length)|0];
        const dir=[[1,0],[-1,0],[0,1],[0,-1]][(rng()*4)|0];
        const xx=c.x+dir[0], yy=c.y+dir[1];
        if(xx<2||yy<2||xx>=BC_C-2||yy>=BC_R-2)continue;
        const j=yy*BC_C+xx;
        if(mark[j]||m[j]!==3)continue;
        let touch=false;
        for(let dy=-1;dy<=1&&!touch;dy++)for(let dx=-1;dx<=1;dx++){
          if(blocked[(yy+dy)*BC_C+(xx+dx)])touch=true;
        }
        if(touch)continue;
        mark[j]=1;
        cells.push({x:xx,y:yy});
      }
      if(cells.length<2)continue;
      for(const c of cells)m[c.y*BC_C+c.x]=6;
      const rim=[];
      for(const c of cells){
        let wet=false;
        for(const [dx,dy] of [[1,0],[-1,0],[0,1],[0,-1]])if(mtile(m,c.x+dx,c.y+dy)===3)wet=true;
        if(wet){m[c.y*BC_C+c.x]=0;rim.push(c);}
      }
      if(cells.length>3){
        const inn=cells.filter((c)=>m[c.y*BC_C+c.x]===0);
        if(inn.length===cells.length){
          const k=cells[(rng()*cells.length)|0];
          m[k.y*BC_C+k.x]=6;
        }
      }
      const rocks=Math.min(rim.length,1+(rng()*3|0));
      const used={};
      for(let r=0;r<rocks;r++){
        const c=rim[(rng()*rim.length)|0];
        const k=c.y*BC_C+c.x;
        if(used[k])continue;
        used[k]=1;
        m[k]=8;
      }
      let stand=false;
      for(const c of cells)if(m[c.y*BC_C+c.x]!==8)stand=true;
      if(!stand)m[cells[0].y*BC_C+cells[0].x]=0;
      const ids=cells.map((c)=>c.y*BC_C+c.x);
      for(const id of ids)blocked[id]=1;
      islands.push(ids);
    }
    islands.forEach((cells,idx)=>{
      let link;
      if(islands.length===1)link=rng()<0.55;
      else if(idx%2===0)link=true;
      else link=rng()<0.4;
      if(!link)return;
      const own={};for(const id of cells)own[id]=1;
      straightBridge(m,cells,(j)=>!!main[j]&&!own[j],12);
    });
    let links=0;
    for(let a=0;a<islands.length&&links<2;a++){
      for(let b=a+1;b<islands.length&&links<2;b++){
        if(rng()>0.5)continue;
        const inB={};for(const id of islands[b])inB[id]=1;
        const laid=straightBridge(m,islands[a],(j)=>!!inB[j],8);
        if(laid)links++;
      }
    }
    return islands;
  }
  function openTransit(m,pad){
    const prot=(x,y)=>x>=pad.x-1&&x<=pad.x+6&&y>=pad.y-1&&y<=pad.y+5;
    for(let y=1;y<BC_R-1;y++)for(let x=1;x<BC_C-1;x++){
      const t=m[y*BC_C+x];
      if(t!==8&&t!==4)continue;
      if(prot(x,y))continue;
      let sea=0,land=0;
      for(const [dx,dy] of [[1,0],[-1,0],[0,1],[0,-1]]){
        const tv=mtile(m,x+dx,y+dy);
        if(tv===3)sea++;
        if(tv===0||tv===6||tv===7)land++;
      }
      if(t===8&&sea>=2)m[y*BC_C+x]=3;
      if(t===4&&land>=2&&((x+y)%3===0))m[y*BC_C+x]=6;
    }
  }
  function rockyCoast(m,pad,salt){
    const prot=(x,y)=>x>=pad.x-1&&x<=pad.x+6&&y>=pad.y-1&&y<=pad.y+5;
    const pier=(x,y)=>{
      for(let dy=-1;dy<=1;dy++)for(let dx=-1;dx<=1;dx++)if(mtile(m,x+dx,y+dy)===7)return true;
      return false;
    };
    const marks=[];
    for(let y=1;y<BC_R-1;y++)for(let x=1;x<BC_C-1;x++){
      const t=m[y*BC_C+x];
      if((t!==0&&t!==6)||prot(x,y)||pier(x,y))continue;
      let wet=false;
      for(const [dx,dy] of [[1,0],[-1,0],[0,1],[0,-1]])if(mtile(m,x+dx,y+dy)===3)wet=true;
      if(!wet)continue;
      const h=coastHash(x,y,salt+9);
      if(h<1)marks.push(y*BC_C+x);
    }
    for(const i of marks)m[i]=8;
  }
  function placeLighthouse(m,pad,rng,isles){
    const small=new Uint8Array(m.length);
    for(const cells of isles||[]){
      if(cells.length>14)continue;
      for(const i of cells)small[i]=1;
    }
    const cand=[];
    for(let y=2;y<BC_R-2;y++)for(let x=2;x<BC_C-2;x++){
      if(x>=pad.x-2&&x<=pad.x+7&&y>=pad.y-2&&y<=pad.y+6)continue;
      const i=y*BC_C+x, t=m[i];
      if(t!==0&&t!==6)continue;
      let wet=0, rock=0, pier=false;
      for(const [dx,dy] of [[1,0],[-1,0],[0,1],[0,-1],[1,1],[1,-1],[-1,1],[-1,-1]]){
        const tv=mtile(m,x+dx,y+dy);
        if(tv===3)wet++;
        if(tv===8)rock++;
        if(tv===7)pier=true;
      }
      if(pier||!wet)continue;
      let s=wet+(rock?8+rock*4:0);
      if(small[i])s+=14;
      else if(rock)s+=2;
      cand.push({i:i,s:s});
    }
    if(!cand.length)return;
    const plant=(i)=>{
      if(!m.bed){m.bed=new Uint8Array(m.length);m.bedSet=new Uint8Array(m.length);}
      const prev=m[i];
      if((prev===0||prev===6)&&!m.bedSet[i]){m.bed[i]=prev;m.bedSet[i]=1;}
      m[i]=9;
      const x=i%BC_C, y=(i/BC_C)|0;
      const dry=(t)=>t===0||t===6||t===8;
      const water=[];
      let n=0;
      for(let dy=-1;dy<=1;dy++)for(let dx=-1;dx<=1;dx++){
        if(!dx&&!dy)continue;
        const xx=x+dx, yy=y+dy;
        if(xx<0||yy<0||xx>=BC_C||yy>=BC_R)continue;
        const t=m[yy*BC_C+xx];
        if(dry(t))n++;
        else if(t===3)water.push(yy*BC_C+xx);
      }
      const fill=[0,6,8];
      for(let k=0;n<3&&k<water.length;k++){m[water[k]]=fill[k%3];n++;}
    };
    cand.sort((a,b)=>b.s-a.s);
    const top=cand.slice(0,Math.min(5,cand.length));
    let sum=0;
    for(const c of top)sum+=c.s;
    let r=rng()*sum;
    for(const c of top){
      r-=c.s;
      if(r<=0){plant(c.i);return;}
    }
    plant(top[0].i);
  }
  function placeFarm(m,pad){
    const near=(x,y)=>x>=pad.x-2&&x<=pad.x+7&&y>=pad.y-2&&y<=pad.y+6;
    for(let y=3;y<BC_R-8;y+=3)for(let x=3;x<BC_C-9;x+=4){
      if(near(x,y))continue;
      let ok=true;
      for(let dy=0;dy<5&&ok;dy++)for(let dx=0;dx<6;dx++)if(m[(y+dy)*BC_C+(x+dx)]!==6)ok=false;
      if(!ok)continue;
      for(let dx=0;dx<6;dx++){m[y*BC_C+(x+dx)]=1;m[(y+4)*BC_C+(x+dx)]=1;}
      for(let dy=1;dy<4;dy++){m[(y+dy)*BC_C+x]=1;m[(y+dy)*BC_C+(x+5)]=1;}
      m[(y+4)*BC_C+(x+2)]=7;m[(y+4)*BC_C+(x+3)]=7;
      for(let i=1;i<=4;i++){
        const yy=y+4+i;
        if(yy>=BC_R-1)break;
        if(m[yy*BC_C+(x+2)]===6||m[yy*BC_C+(x+2)]===0)m[yy*BC_C+(x+2)]=7;
      }
      return;
    }
  }
  function placeHamlet(m,pad,rng){
    const near=(x,y)=>x>=pad.x-3&&x<=pad.x+8&&y>=pad.y-3&&y<=pad.y+7;
    const open=(x,y)=>{
      if(x<1||y<1||x>=BC_C-1||y>=BC_R-1||near(x,y))return false;
      const t=m[y*BC_C+x];
      return t===0||t===6;
    };
    const spots=[];
    for(let y=2;y<BC_R-7;y++)for(let x=2;x<BC_C-8;x++){
      let ok=true;
      for(let dy=0;dy<6&&ok;dy++)for(let dx=0;dx<7;dx++)if(!open(x+dx,y+dy))ok=false;
      if(ok)spots.push({x,y});
    }
    if(!spots.length)return;
    const s=spots[(rng()*spots.length)|0];
    const stamp=(x,y,w,h)=>{for(let dy=0;dy<h;dy++)for(let dx=0;dx<w;dx++)raiseBuilding(m,x+dx,y+dy);};
    const road=(x,y)=>{if(open(x,y))m[y*BC_C+x]=7;};
    if(rng()<0.5){
      stamp(s.x,s.y,2,2);
      stamp(s.x+4,s.y,2,2);
      for(let i=0;i<6;i++)road(s.x+i,s.y+2);
      stamp(s.x,s.y+3,2,2);
      stamp(s.x+4,s.y+3,rng()<0.5?3:2,2);
      if(open(s.x+2,s.y))m[s.y*BC_C+(s.x+2)]=4;
    }else{
      stamp(s.x,s.y,2,2);
      stamp(s.x,s.y+3,2,2);
      for(let i=0;i<6;i++)road(s.x+2,s.y+i);
      stamp(s.x+3,s.y,2,2);
      stamp(s.x+3,s.y+3,2,2);
      if(open(s.x+5,s.y+2))m[(s.y+2)*BC_C+(s.x+5)]=4;
    }
  }
  function placeBuildings(m,pad,rng,maxN){
    const near=(x,y)=>x>=pad.x-3&&x<=pad.x+8&&y>=pad.y-3&&y<=pad.y+7;
    let left=Math.max(1,Math.min(2,maxN|0));
    if(left>1&&rng()<0.45)left=1;
    let placed=0, guard=0;
    while(placed<left&&guard++<40){
      const w=rng()<0.34?3:2, h=w===2&&rng()<0.45?3:2;
      const spots=[];
      for(let y=2;y<BC_R-h-1;y++)for(let x=2;x<BC_C-w-1;x++){
        let ok=true;
        for(let dy=-1;dy<=h&&ok;dy++)for(let dx=-1;dx<=w&&ok;dx++){
          const xx=x+dx, yy=y+dy;
          if(xx<1||yy<1||xx>=BC_C-1||yy>=BC_R-1||near(xx,yy)){ok=false;break;}
          const edge=dx<0||dy<0||dx>=w||dy>=h;
          const t=m[yy*BC_C+xx];
          if(!edge){ if(t!==0&&t!==6)ok=false; }
          else if(t===1||t===2||t===5||t===9)ok=false;
        }
        if(ok)spots.push({x,y});
      }
      if(!spots.length)continue;
      const s=spots[(rng()*spots.length)|0];
      for(let dy=0;dy<h;dy++)for(let dx=0;dx<w;dx++)raiseBuilding(m,s.x+dx,s.y+dy);
      placed++;
    }
  }
  function breakLanes(m,pad){
    const prot=(x,y)=>x>=pad.x&&x<=pad.x+5&&y>=pad.y&&y<=pad.y+4;
    const landOpen=(t)=>t===0||t===6||t===7;
    const sideOpen=(x,y,horiz,water)=>{
      const open=(xx,yy)=>{
        const t=mtile(m,xx,yy);
        return water?t===3:(t===0||t===6||t===7);
      };
      if(horiz)return open(x,y-1)||open(x,y+1)||open(x,y-2)||open(x,y+2);
      return open(x-1,y)||open(x+1,y)||open(x-2,y)||open(x+2,y);
    };
    const pier=(x,y)=>m[y*BC_C+x]===7&&((mtile(m,x-1,y)===3&&mtile(m,x+1,y)===3)||(mtile(m,x,y-1)===3&&mtile(m,x,y+1)===3));
    const edge=(x,y)=>x<=0||y<=0||x>=BC_C-1||y>=BC_R-1;
    const plug=(x,y,water,horiz)=>{
      if(x<0||y<0||x>=BC_C||y>=BC_R||prot(x,y)||pier(x,y))return;
      if(water&&edge(x,y))return;
      const t=m[y*BC_C+x];
      if(t===5||t===9||t===1||t===2||t===4||t===8)return;
      if(!water&&(t===0||t===6||t===7)){m[y*BC_C+x]=t===7&&!edge(x,y)?8:4;return;}
      if(t===3)return;
    };
    const MAX=14;
    function scan(horiz){
      const outer=horiz?BC_R:BC_C, inner=horiz?BC_C:BC_R;
      for(let a=0;a<outer;a++){
        let run=0,b0=0,water=false;
        for(let b=0;b<=inner;b++){
          const x=horiz?b:a, y=horiz?a:b;
          const t=b<inner?m[y*BC_C+x]:-1;
          const land=landOpen(t), sea=t===3;
          if(run&&((water&&sea)||(!water&&land)))run++;
          else{
            if(run>MAX){
              for(let k=MAX;k<run;k+=MAX){
                const shift=((a*5+k)%5)-2;
                const at=b0+k+shift;
                if(at<=b0||at>=b0+run-1)continue;
                if(horiz)plug(at,a,water,true);
                else plug(a,at,water,false);
              }
            }
            run=(land||sea)?1:0;b0=b;water=!!sea;
          }
        }
      }
    }
    scan(true);scan(false);
  }
  function seaNeighbors(m,x,y){
    let n=0;
    for(const [dx,dy] of [[1,0],[-1,0],[0,1],[0,-1]])if(mtile(m,x+dx,y+dy)===3)n++;
    return n;
  }
  function thinSeaRocks(m){
    const kill=[];
    for(let y=0;y<BC_R;y++)for(let x=0;x<BC_C;x++){
      const i=y*BC_C+x;
      if(m[i]!==8)continue;
      if(seaNeighbors(m,x,y)>=2)kill.push(i);
    }
    const keep=Math.floor(kill.length*0.05);
    for(let i=keep;i<kill.length;i++)m[kill[i]]=3;
  }
  function unsealWater(m){
    const N=BC_C*BC_R;
    const seen=new Uint8Array(N);
    const q=[];
    const pushSea=(i)=>{ if(i<0||i>=N||seen[i]||m[i]!==3)return; seen[i]=1; q.push(i); };
    for(let x=0;x<BC_C;x++){ pushSea(x); pushSea((BC_R-1)*BC_C+x); }
    for(let y=0;y<BC_R;y++){ pushSea(y*BC_C); pushSea(y*BC_C+BC_C-1); }
    for(let qi=0;qi<q.length;qi++){
      const i=q[qi], x=i%BC_C, y=(i/BC_C)|0;
      if(x>0)pushSea(i-1);
      if(x<BC_C-1)pushSea(i+1);
      if(y>0)pushSea(i-BC_C);
      if(y<BC_R-1)pushSea(i+BC_C);
    }
    const comp=new Int32Array(N);
    comp.fill(-1);
    let cid=0;
    for(let i=0;i<N;i++){
      if(m[i]!==3||seen[i]||comp[i]>=0)continue;
      const cells=[i];
      comp[i]=cid;
      for(let qi=0;qi<cells.length;qi++){
        const c=cells[qi], x=c%BC_C, y=(c/BC_C)|0;
        const nbs=[];
        if(x>0)nbs.push(c-1);
        if(x<BC_C-1)nbs.push(c+1);
        if(y>0)nbs.push(c-BC_C);
        if(y<BC_R-1)nbs.push(c+BC_C);
        for(const j of nbs){
          if(m[j]===3&&!seen[j]&&comp[j]<0){comp[j]=cid;cells.push(j);}
        }
      }
      const inComp=new Uint8Array(N);
      for(const c of cells)inComp[c]=1;
      const prev=new Int32Array(N);
      prev.fill(-2);
      const vis=new Uint8Array(N);
      const bfs=cells.slice();
      for(const c of cells){vis[c]=1;prev[c]=-1;}
      let hit=-1, from=-1;
      for(let qi=0;qi<bfs.length&&hit<0;qi++){
        const c=bfs[qi], x=c%BC_C, y=(c/BC_C)|0;
        const nbs=[];
        if(x>0)nbs.push(c-1);
        if(x<BC_C-1)nbs.push(c+1);
        if(y>0)nbs.push(c-BC_C);
        if(y<BC_R-1)nbs.push(c+BC_C);
        for(const j of nbs){
          if(vis[j]||m[j]===5)continue;
          if(seen[j]&&m[j]===3){hit=j;from=c;break;}
          vis[j]=1;prev[j]=c;bfs.push(j);
        }
      }
      if(hit<0){
        for(const c of cells)m[c]=0;
      }else{
        let c=from;
        let guard=0;
        while(c>=0&&!inComp[c]&&guard++<N){
          if(m[c]!==5)m[c]=3;
          seen[c]=1;
          c=prev[c];
        }
        for(const c of cells)seen[c]=1;
      }
      cid++;
    }
  }
  function triCover(rng){
    const a=0.40,b=0.90,c=0.73,u=rng();
    const f=(c-a)/(b-a);
    if(u<f)return a+Math.sqrt(u*(b-a)*(c-a));
    return b-Math.sqrt((1-u)*(b-a)*(b-c));
  }
  function landCount(m){
    let n=0;
    for(let i=0;i<m.length;i++)if(m[i]!==3)n++;
    return n;
  }
  function balanceCover(m,wantLand,pad){
    const N=m.length;
    const goal=Math.max(0,Math.min(N,Math.round(wantLand*N)));
    const guard=(x,y)=>{
      if(x>=pad.x-1&&x<=pad.x+6&&y>=pad.y-1&&y<=pad.y+5)return true;
      const t=m[y*BC_C+x];
      return t===5||t===9;
    };
    for(let pass=0;pass<48;pass++){
      const land=landCount(m);
      const diff=land-goal;
      if(Math.abs(diff)<=8)return;
      const cand=[];
      if(diff>0){
        for(let y=0;y<BC_R;y++)for(let x=0;x<BC_C;x++){
          const i=y*BC_C+x;
          if(m[i]===3||guard(x,y)||m[i]===1||m[i]===7)continue;
          let wet=x===0||y===0||x===BC_C-1||y===BC_R-1;
          if(!wet){
            for(const [dx,dy] of [[1,0],[-1,0],[0,1],[0,-1]]){
              if(m[(y+dy)*BC_C+(x+dx)]===3){wet=true;break;}
            }
          }
          if(wet)cand.push(i);
        }
        if(!cand.length)return;
        const pcx=pad.x+3,pcy=pad.y+2;
        cand.sort((a,b)=>{
          const ax=a%BC_C,ay=(a/BC_C)|0,bx=b%BC_C,by=(b/BC_C)|0;
          return ((bx-pcx)*(bx-pcx)+(by-pcy)*(by-pcy))-((ax-pcx)*(ax-pcx)+(ay-pcy)*(ay-pcy));
        });
        const n=Math.min(cand.length,diff);
        for(let k=0;k<n;k++)m[cand[k]]=3;
      }else{
        for(let y=1;y<BC_R-1;y++)for(let x=1;x<BC_C-1;x++){
          const i=y*BC_C+x;
          if(m[i]!==3||guard(x,y))continue;
          let dry=false;
          for(const [dx,dy] of [[1,0],[-1,0],[0,1],[0,-1]]){
            if(m[(y+dy)*BC_C+(x+dx)]!==3){dry=true;break;}
          }
          if(dry)cand.push(i);
        }
        if(!cand.length)return;
        const pcx=pad.x+3,pcy=pad.y+2;
        cand.sort((a,b)=>{
          const ax=a%BC_C,ay=(a/BC_C)|0,bx=b%BC_C,by=(b/BC_C)|0;
          return ((ax-pcx)*(ax-pcx)+(ay-pcy)*(ay-pcy))-((bx-pcx)*(bx-pcx)+(by-pcy)*(by-pcy));
        });
        const n=Math.min(cand.length,-diff);
        for(let k=0;k<n;k++)m[cand[k]]=0;
      }
    }
  }
  function fitCover(m,naval,rng,pad){
    const roll=triCover(rng);
    const span=Math.max(0,Math.min(1,(roll-0.40)/0.50));
    let want=naval?(0.30-span*0.16):(0.70+span*0.16);
    const lo=naval?0.10:0.70, hi=naval?0.30:0.88;
    for(let round=0;round<4;round++){
      balanceCover(m,want,pad);
      unsealWater(m);
      thinSeaRocks(m);
      repairEdges(m,naval);
      const f=landCount(m)/m.length;
      if(f>=lo-0.008&&f<=hi+0.008&&Math.abs(f-want)<=0.025)return;
      if(f<lo)want=lo+0.02;
      else if(f>hi)want=hi-0.02;
    }
  }
  function sealShield(m){
    const o=shieldCorner(m);
    if(!o)return;
    eachShieldRing(o.x,o.y,(x,y)=>{
      if(x<0||y<0||x>=BC_C||y>=BC_R)return;
      const i=y*BC_C+x;
      if(m[i]!==5)m[i]=1;
    });
  }
  function woodsGroves(m,pad,road){
    const spots=[];
    for(let y=3;y<BC_R-3;y+=3)for(let x=3;x<BC_C-3;x+=4)if(canTree(m,x,y,pad,road))spots.push({x,y});
    spots.filter((_,i)=>i%2===0).slice(0,6).forEach((s)=>groveAt(m,s.x,s.y,pad,road));
  }
  function placeRunway(m,pad,rng){
    const near=(x,y)=>x>=pad.x-2&&x<=pad.x+7&&y>=pad.y-2&&y<=pad.y+6;
    const spans=[];
    for(let y=4;y<BC_R-4;y++){
      let run=0,sx=0;
      for(let x=2;x<BC_C-2;x++){
        const t=m[y*BC_C+x];
        if((t===6||t===0)&&!near(x,y)){
          if(!run)sx=x;
          run++;
        }else{
          if(run>=12)spans.push({x:sx,y,n:run});
          run=0;
        }
      }
      if(run>=12)spans.push({x:sx,y,n:run});
    }
    if(!spans.length)return;
    const s=spans[(rng()*spans.length)|0];
    const n=Math.min(s.n,14+(rng()*4|0));
    const x0=s.x+(((s.n-n)/2)|0);
    for(let i=0;i<n;i++)m[s.y*BC_C+(x0+i)]=7;
    const tx=x0+n-2, ty=s.y+2;
    if(ty<BC_R-1&&tx>1){
      for(let dy=0;dy<2;dy++)for(let dx=0;dx<2;dx++){
        const t=m[(ty+dy)*BC_C+(tx+dx)];
        if(t===6||t===0)raiseBuilding(m,tx+dx,ty+dy);
      }
    }
  }
  function cliffShore(m,pad,rng){
    const prot=(x,y)=>x>=pad.x-1&&x<=pad.x+6&&y>=pad.y-1&&y<=pad.y+5;
    for(let y=1;y<BC_R-1;y++)for(let x=1;x<BC_C-1;x++){
      const t=m[y*BC_C+x];
      if((t!==0&&t!==6)||prot(x,y))continue;
      let wet=0, pier=false;
      for(const [dx,dy] of [[1,0],[-1,0],[0,1],[0,-1]]){
        const tv=mtile(m,x+dx,y+dy);
        if(tv===3)wet++;
        if(tv===7)pier=true;
      }
      if(pier||wet!==1)continue;
      if(rng()<0.22)m[y*BC_C+x]=8;
    }
  }
  function carveRiver(m,rng,pad){
    const prot=(x,y)=>x>=pad.x-1&&x<=pad.x+6&&y>=pad.y-1&&y<=pad.y+5;
    const dry=(t)=>t===0||t===6||t===4||t===7||t===8;
    const N=BC_C*BC_R;
    const sea=new Uint8Array(N);
    const sq=[];
    const pushSea=(x,y)=>{
      if(x<0||y<0||x>=BC_C||y>=BC_R)return;
      const i=y*BC_C+x;
      if(sea[i]||m[i]!==3)return;
      sea[i]=1;sq.push(i);
    };
    for(let x=0;x<BC_C;x++){pushSea(x,0);pushSea(x,BC_R-1);}
    for(let y=0;y<BC_R;y++){pushSea(0,y);pushSea(BC_C-1,y);}
    for(let qi=0;qi<sq.length;qi++){
      const i=sq[qi],x=i%BC_C,y=(i/BC_C)|0;
      pushSea(x+1,y);pushSea(x-1,y);pushSea(x,y+1);pushSea(x,y-1);
    }
    const onEdge=(x,y)=>x===0||y===0||x===BC_C-1||y===BC_R-1;
    const sideOf=(x,y)=>y===0?"n":y===BC_R-1?"s":x===0?"w":x===BC_C-1?"e":"";
    const landAt=(x,y)=>{
      if(x<0||y<0||x>=BC_C||y>=BC_R||prot(x,y))return false;
      const t=m[y*BC_C+x];
      return dry(t)&&!sea[y*BC_C+x];
    };
    function route(starts,isGoal){
      const prev=new Int32Array(N);
      prev.fill(-2);
      const dist=new Int32Array(N);
      const q=[];
      for(const s of starts){
        if(!landAt(s.x,s.y))continue;
        const i=s.y*BC_C+s.x;
        if(prev[i]!==-2)continue;
        prev[i]=-1;q.push(i);
      }
      const goals=[];
      const dirs=[[1,0],[-1,0],[0,1],[0,-1]];
      for(let qi=0;qi<q.length;qi++){
        const i=q[qi],x=i%BC_C,y=(i/BC_C)|0,nd=dist[i]+1;
        const rot=(x*5+y*3)&3;
        for(let k=0;k<4;k++){
          const d=dirs[(k+rot)&3],xx=x+d[0],yy=y+d[1];
          if(xx<0||yy<0||xx>=BC_C||yy>=BC_R)continue;
          const j=yy*BC_C+xx;
          if(prev[j]!==-2)continue;
          if(sea[j]||m[j]===3){
            if(isGoal(xx,yy,j)){prev[j]=i;dist[j]=nd;goals.push(j);}
            continue;
          }
          if(!landAt(xx,yy))continue;
          prev[j]=i;dist[j]=nd;q.push(j);
          if(isGoal(xx,yy,j))goals.push(j);
        }
      }
      return {prev,dist,goals};
    }
    function chain(prev,hit){
      const path=[];
      let c=hit,g=0;
      while(c>=0&&g++<N){
        path.push({x:c%BC_C,y:(c/BC_C)|0});
        c=prev[c];
      }
      path.reverse();
      return path;
    }
    function bend(starts,goal){
      const s=starts[(rng()*starts.length)|0];
      const mx=(s.x+goal.x)>>1,my=(s.y+goal.y)>>1;
      const dx=goal.x-s.x,dy=goal.y-s.y,len=Math.hypot(dx,dy)||1;
      const mag=(3+(rng()*6|0))*(rng()<0.5?-1:1);
      let wx=Math.round(mx+(-dy/len)*mag), wy=Math.round(my+(dx/len)*mag);
      wx=Math.max(0,Math.min(BC_C-1,wx));
      wy=Math.max(0,Math.min(BC_R-1,wy));
      if(landAt(wx,wy)&&(wx!==s.x||wy!==s.y)&&(wx!==goal.x||wy!==goal.y)){
        const a=route(starts,(x,y)=>x===wx&&y===wy);
        if(a.goals.length){
          const b=route([{x:wx,y:wy}],(x,y)=>x===goal.x&&y===goal.y);
          if(b.goals.length){
            const p1=chain(a.prev,a.goals[0]), p2=chain(b.prev,b.goals[0]);
            return p1.concat(p2.slice(1));
          }
        }
      }
      const direct=route(starts,(x,y)=>x===goal.x&&y===goal.y);
      if(!direct.goals.length)return null;
      return chain(direct.prev,direct.goals[0]);
    }
    function paint(path,lake){
      const carved=[];
      const seen=new Uint8Array(N);
      const put=(x,y)=>{
        const i=y*BC_C+x;
        if(seen[i]||sea[i]||m[i]===3)return;
        if(!landAt(x,y))return;
        m[i]=3;seen[i]=1;carved.push({x,y});
      };
      for(const c of lake||[])put(c.x,c.y);
      for(const c of path)put(c.x,c.y);
      const spans=[];
      for(const p of carved){
        if(onEdge(p.x,p.y))continue;
        let lakeCell=false;
        for(const c of lake||[])if(c.x===p.x&&c.y===p.y)lakeCell=true;
        if(lakeCell)continue;
        const L=dry(mtile(m,p.x-1,p.y)),R=dry(mtile(m,p.x+1,p.y));
        const U=dry(mtile(m,p.x,p.y-1)),D=dry(mtile(m,p.x,p.y+1));
        const wL=mtile(m,p.x-1,p.y)===3,wR=mtile(m,p.x+1,p.y)===3;
        const wU=mtile(m,p.x,p.y-1)===3,wD=mtile(m,p.x,p.y+1)===3;
        if((L&&R&&(wU||wD))||(U&&D&&(wL||wR)))spans.push(p);
      }
      const want=spans.length>6&&rng()<0.55?2:1;
      const used=[];
      for(let n=0;n<want&&spans.length;n++){
        const p=spans[(rng()*spans.length)|0];
        if(used.some((u)=>Math.abs(u.x-p.x)+Math.abs(u.y-p.y)<5))continue;
        m[p.y*BC_C+p.x]=7;
        used.push(p);
      }
      return carved.length>=4;
    }
    function pickGoal(res,ok){
      const pool=res.goals.filter((i)=>ok(i,res.dist[i]));
      if(!pool.length)return -1;
      let max=0;
      for(const i of pool)if(res.dist[i]>max)max=res.dist[i];
      const far=pool.filter((i)=>res.dist[i]>=Math.max(8,max*0.5));
      const bag=far.length?far:pool;
      return bag[(rng()*bag.length)|0];
    }
    const snap=m.slice();
    const fail=()=>{m.set(snap);return false;};
    function edgeEdge(){
      const cells=[];
      for(let x=0;x<BC_C;x++){
        if(landAt(x,0))cells.push({x,y:0,side:"n"});
        if(landAt(x,BC_R-1))cells.push({x,y:BC_R-1,side:"s"});
      }
      for(let y=1;y<BC_R-1;y++){
        if(landAt(0,y))cells.push({x:0,y,side:"w"});
        if(landAt(BC_C-1,y))cells.push({x:BC_C-1,y,side:"e"});
      }
      if(cells.length<2)return false;
      for(let attempt=0;attempt<8;attempt++){
        const a=cells[(rng()*cells.length)|0];
        const res=route([a],(x,y)=>onEdge(x,y)&&sideOf(x,y)!==a.side);
        const hit=pickGoal(res,(i,d)=>d>=10&&sideOf(i%BC_C,(i/BC_C)|0)!==a.side);
        if(hit<0)continue;
        const goal={x:hit%BC_C,y:(hit/BC_C)|0};
        const path=bend([a],goal);
        if(!path||path.length<10)continue;
        const A=path[0],B=path[path.length-1];
        if(!onEdge(A.x,A.y)||!onEdge(B.x,B.y)||sideOf(A.x,A.y)===sideOf(B.x,B.y))continue;
        if(paint(path,null))return true;
        m.set(snap);
      }
      return false;
    }
    function edgeSea(){
      const cells=[];
      for(let x=0;x<BC_C;x++){
        if(landAt(x,0))cells.push({x,y:0,side:"n"});
        if(landAt(x,BC_R-1))cells.push({x,y:BC_R-1,side:"s"});
      }
      for(let y=1;y<BC_R-1;y++){
        if(landAt(0,y))cells.push({x:0,y,side:"w"});
        if(landAt(BC_C-1,y))cells.push({x:BC_C-1,y,side:"e"});
      }
      if(!cells.length)return false;
      for(let attempt=0;attempt<8;attempt++){
        const a=cells[(rng()*cells.length)|0];
        const res=route([a],(x,y,i)=>!!sea[i]);
        const hit=pickGoal(res,(i,d)=>d>=8&&sideOf(i%BC_C,(i/BC_C)|0)!==a.side);
        if(hit<0)continue;
        const goal={x:hit%BC_C,y:(hit/BC_C)|0};
        const path=bend([a],goal);
        if(!path||path.length<8)continue;
        const A=path[0],B=path[path.length-1];
        if(!onEdge(A.x,A.y)||!sea[B.y*BC_C+B.x])continue;
        if(paint(path,null))return true;
        m.set(snap);
      }
      return false;
    }
    function findLake(){
      const spots=[];
      for(let y=3;y<BC_R-4;y++)for(let x=3;x<BC_C-4;x++){
        let ok=true;
        const cells=[];
        for(let dy=0;dy<2&&ok;dy++)for(let dx=0;dx<2;dx++){
          const xx=x+dx,yy=y+dy;
          if(!landAt(xx,yy)||onEdge(xx,yy)){ok=false;break;}
          for(const [ax,ay] of [[1,0],[-1,0],[0,1],[0,-1]]){
            const sx=xx+ax,sy=yy+ay;
            if(sx<0||sy<0||sx>=BC_C||sy>=BC_R)continue;
            if(sea[sy*BC_C+sx]){ok=false;break;}
          }
          if(ok)cells.push({x:xx,y:yy});
        }
        if(!ok)continue;
        const d=(x-(pad.x+2))**2+(y-(pad.y+2))**2;
        if(d<49)continue;
        spots.push({cells,d});
      }
      if(!spots.length)return null;
      spots.sort((a,b)=>b.d-a.d);
      const top=spots.slice(0,Math.max(6,spots.length>>2));
      return top[(rng()*top.length)|0].cells;
    }
    function lakeRun(toSea){
      for(let attempt=0;attempt<6;attempt++){
        const lake=findLake();
        if(!lake)return false;
        const res=route(lake,toSea?(x,y,i)=>!!sea[i]:(x,y)=>onEdge(x,y)&&landAt(x,y));
        const hit=pickGoal(res,(i,d)=>d>=6);
        if(hit<0)continue;
        const goal={x:hit%BC_C,y:(hit/BC_C)|0};
        const path=bend(lake,goal);
        if(!path||path.length<6)continue;
        const B=path[path.length-1];
        const seaEnd=!!sea[B.y*BC_C+B.x];
        const edgeEnd=onEdge(B.x,B.y)&&!seaEnd;
        if(toSea?!seaEnd:!edgeEnd)continue;
        if(paint(path,lake))return true;
        m.set(snap);
      }
      return false;
    }
    const modes=["ee","es","ls","le"];
    for(let i=modes.length-1;i>0;i--){
      const j=(rng()*(i+1))|0;
      const t=modes[i];modes[i]=modes[j];modes[j]=t;
    }
    for(const mode of modes){
      m.set(snap);
      let ok=false;
      if(mode==="ee")ok=edgeEdge();
      else if(mode==="es")ok=edgeSea();
      else if(mode==="ls")ok=lakeRun(true);
      else ok=lakeRun(false);
      if(ok)return;
    }
    fail();
  }
  function mazeWalk(t){return t===0||t===6||t===7;}
  function mazeReach(m,sx,sy){
    const seen=new Uint8Array(BC_C*BC_R);
    if(sx<0||sy<0||sx>=BC_C||sy>=BC_R||!mazeWalk(m[sy*BC_C+sx]))return {seen,beaches:0};
    const q=[[sx,sy]];
    seen[sy*BC_C+sx]=1;
    let beaches=0;
    for(let qi=0;qi<q.length;qi++){
      const x=q[qi][0], y=q[qi][1];
      let wet=false;
      for(const [dx,dy] of [[1,0],[-1,0],[0,1],[0,-1]]){
        const xx=x+dx, yy=y+dy;
        if(xx<0||yy<0||xx>=BC_C||yy>=BC_R){wet=true;continue;}
        if(m[yy*BC_C+xx]===3)wet=true;
        const j=yy*BC_C+xx;
        if(seen[j]||!mazeWalk(m[j]))continue;
        seen[j]=1; q.push([xx,yy]);
      }
      if(wet)beaches++;
    }
    return {seen,beaches};
  }
  function openMaze(m,sx,sy){
    // only tiles on the shield's own landmass (walls count as land, water does not) must become reachable
    let walk=0;
    {const seen=new Uint8Array(m.length),q=[sy*BC_C+sx];seen[q[0]]=1;
     for(let k=0;k<q.length;k++){const c=q[k],x=c%BC_C,y=(c/BC_C)|0;if(mazeWalk(m[c]))walk++;
       for(const [dx,dy] of [[1,0],[-1,0],[0,1],[0,-1]]){const xx=x+dx,yy=y+dy;if(xx<0||yy<0||xx>=BC_C||yy>=BC_R)continue;const j=yy*BC_C+xx;if(!seen[j]&&m[j]!==3){seen[j]=1;q.push(j);}}}}
    for(let pass=0;pass<240;pass++){
      const hit=mazeReach(m,sx,sy);
      let got=0;for(let i=0;i<m.length;i++)if(hit.seen[i])got++;
      if(hit.beaches>=4&&got>=walk)return;
      let best=null;
      for(let y=1;y<BC_R-1&&!best;y++)for(let x=1;x<BC_C-1;x++){
        const t=m[y*BC_C+x];
        if(t!==1&&t!==2)continue;
        let seen=false, goal=false;
        for(const [dx,dy] of [[1,0],[-1,0],[0,1],[0,-1]]){
          const xx=x+dx, yy=y+dy, j=yy*BC_C+xx, tv=m[j];
          if(hit.seen[j]&&mazeWalk(tv))seen=true;
          if(!hit.seen[j]&&(mazeWalk(tv)||tv===3))goal=true;
        }
        if(seen&&goal){best={x,y};break;}
      }
      if(!best)return;
      m[best.y*BC_C+best.x]=6;
      const nx=best.x+1<BC_C-1?best.x+1:best.x-1;
      if(m[best.y*BC_C+nx]===1)m[best.y*BC_C+nx]=6;
    }
  }
  function carveLane(m,x0,y0,x1,y1){
    let x=x0|0, y=y0|0;
    const steps=Math.abs(x1-x0)+Math.abs(y1-y0)+3;
    for(let n=0;n<steps;n++){
      for(let dy=0;dy<2;dy++)for(let dx=0;dx<2;dx++){
        const xx=x+dx, yy=y+dy;
        if(xx<1||yy<1||xx>=BC_C-1||yy>=BC_R-1)continue;
        const t=m[yy*BC_C+xx];
        if(t===1||t===2)m[yy*BC_C+xx]=6;
      }
      if(x!==x1)x+=x1>x?1:-1;
      else if(y!==y1)y+=y1>y?1:-1;
      else break;
    }
  }
  // Maze maps are a coherent piece of the island: either the southern half (coast across the north) or a
  // corner of the island (coast curving between two edges). Land naturally reaches 2-3 map edges.
  function paintMazeBed(m,rng){
    const p=rng()*6.28,q=rng()*6.28,corner=rng()<0.5;
    for(let y=0;y<BC_R;y++)for(let x=0;x<BC_C;x++){
      let land;
      if(corner){
        const dx=x+2,dy=(BC_R+1)-y,th=Math.atan2(dy,dx);
        const R=31+2.4*Math.sin(th*5+p)+1.4*Math.sin(th*11+q);
        land=Math.hypot(dx,dy)<R;
      }else{
        const cy=7.5+2.2*Math.sin(x*0.31+p)+1.3*Math.sin(x*0.83+q);
        land=y>cy;
      }
      m[y*BC_C+x]=land?6:3;
    }
    for(let y=0;y<BC_R;y++)for(let x=0;x<BC_C;x++){
      const i=y*BC_C+x;if(m[i]!==6)continue;
      for(const [dx,dy] of [[1,0],[-1,0],[0,1],[0,-1]]){const xx=x+dx,yy=y+dy;if(xx>=0&&yy>=0&&xx<BC_C&&yy<BC_R&&m[yy*BC_C+xx]===3){m[i]=0;break;}}
    }
  }
  // canalMaze gets a real river: it rises at the inland point farthest from the sea and meanders down
  // the distance field to the coast, widening into an estuary. The other mazes keep dry land.
  function carveMazeWater(m,id,rng){
    if(id!=="canalMaze")return;
    const N=BC_C*BC_R,dist=new Int16Array(N).fill(-1),q=[];
    for(let i=0;i<N;i++)if(m[i]===3){dist[i]=0;q.push(i);}
    for(let k=0;k<q.length;k++){const c=q[k],x=c%BC_C,y=(c/BC_C)|0;for(const [dx,dy] of [[1,0],[-1,0],[0,1],[0,-1]]){const xx=x+dx,yy=y+dy;if(xx<0||yy<0||xx>=BC_C||yy>=BC_R)continue;const j=yy*BC_C+xx;if(dist[j]<0){dist[j]=dist[c]+1;q.push(j);}}}
    let cur=-1,md=-1;for(let i=0;i<N;i++){const x=i%BC_C,y=(i/BC_C)|0;if(x<7||y<5||x>BC_C-8||y>BC_R-6)continue;if(dist[i]>md){md=dist[i];cur=i;}}
    if(cur<0)return;
    const ph=rng()*6.28;
    for(let step=0;step<120&&cur>=0;step++){
      const x=cur%BC_C,y=(cur/BC_C)|0,dHere=dist[cur];
      const w=dHere<=3?3:2;
      for(let oy=0;oy<w;oy++)for(let ox=0;ox<w;ox++){const xx=x+ox-((w/2)|0),yy=y+oy-((w/2)|0);if(xx>=1&&yy>=1&&xx<BC_C-1&&yy<BC_R-1)m[yy*BC_C+xx]=3;}
      if(dHere<=0)break;
      // prefer going downhill, with a sideways swing so the river meanders instead of running straight
      const swing=Math.sin(step*0.45+ph);
      let best=-1,bs=1e9;
      for(const [dx,dy] of [[1,0],[-1,0],[0,1],[0,-1]]){
        const xx=x+dx,yy=y+dy;if(xx<1||yy<1||xx>=BC_C-1||yy>=BC_R-1)continue;
        const j=yy*BC_C+xx;const edgeP=(xx<4||xx>BC_C-5||yy<3||yy>BC_R-4)?2.5:0;const sc=edgeP+dist[j]*1.0-(dist[j]===dHere?0.6:0)*Math.abs(swing)+(dx*swing+dy*swing>0?-0.35:0.35);
        if(dist[j]<=dHere&&sc<bs){bs=sc;best=j;}
      }
      cur=best;
    }
    for(let y=0;y<BC_R;y++)for(let x=0;x<BC_C;x++){
      const i=y*BC_C+x;if(m[i]!==6)continue;
      for(const [dx,dy] of [[1,0],[-1,0],[0,1],[0,-1]]){const xx=x+dx,yy=y+dy;if(xx>=0&&yy>=0&&xx<BC_C&&yy<BC_R&&m[yy*BC_C+xx]===3){m[i]=0;break;}}
    }
  }
  function pruneMazeStubs(m,prot){
    // drop wall specks: 4-connected wall pieces of 1-2 tiles read as noise; real walls/blocks are kept whole
    const seen=new Uint8Array(m.length);
    for(let i=0;i<m.length;i++){
      if(seen[i]||(m[i]!==1&&m[i]!==2))continue;
      const q=[i];seen[i]=1;
      for(let k=0;k<q.length;k++){const c=q[k],x=c%BC_C,y=(c/BC_C)|0;for(const [dx,dy] of [[1,0],[-1,0],[0,1],[0,-1]]){const xx=x+dx,yy=y+dy;if(xx<0||yy<0||xx>=BC_C||yy>=BC_R)continue;const jj=yy*BC_C+xx;if(!seen[jj]&&(m[jj]===1||m[jj]===2)){seen[jj]=1;q.push(jj);}}}
      if(q.length<=2&&!q.some((c)=>prot(c%BC_C,(c/BC_C)|0)))for(const c of q)m[c]=6;
    }
  }
  function stampMazeWalls(m,id,prot,rng,fortC){
    const dry=(x,y)=>{
      if(x<2||y<2||x>=BC_C-2||y>=BC_R-2||prot(x,y))return false;
      if(m[y*BC_C+x]!==6)return false;
      for(let dy=-1;dy<=1;dy++)for(let dx=-1;dx<=1;dx++)if(mtile(m,x+dx,y+dy)===3)return false;
      return true;
    };
    const wall=(x,y)=>{if(dry(x,y))m[y*BC_C+x]=1;};
    let cx=0,cy=0,n=0;
    for(let y=0;y<BC_R;y++)for(let x=0;x<BC_C;x++)if(m[y*BC_C+x]===6){cx+=x;cy+=y;n++;}
    cx=n?Math.round(cx/n):15;cy=n?Math.round(cy/n):22;
    if(id==="blockFort"){
      // Simple geometric fortification in indestructible metal (tile 2): two concentric rectangular rings
      // around the citadel with fixed 2-tile gates (inner ring N/S, outer ring E/W), plus four straight
      // blocks between the rings. Walls are only dropped where the coast cuts the ring.
      const pc=fortC||{x:cx,y:cy};
      const steel=(x,y)=>{if(dry(x,y))m[y*BC_C+x]=2;};
      const ring=(hx,hy,gatesNS,gatesEW)=>{
        for(let x=pc.x-hx;x<=pc.x+hx;x++){
          const mid=Math.abs(x-pc.x)<=1&&gatesNS;
          if(!mid){steel(x,pc.y-hy);steel(x,pc.y+hy);}
        }
        for(let y=pc.y-hy;y<=pc.y+hy;y++){
          const mid=Math.abs(y-pc.y)<=1&&gatesEW;
          if(!mid){steel(pc.x-hx,y);steel(pc.x+hx,y);}
        }
      };
      // size the outer ring so it sits entirely on dry land inside the map; inner ring and blocks scale with it
      const ringDry=(hx,hy)=>{
        for(let x=pc.x-hx;x<=pc.x+hx;x++)if(!dry(x,pc.y-hy)||!dry(x,pc.y+hy))return false;
        for(let y=pc.y-hy;y<=pc.y+hy;y++)if(!dry(pc.x-hx,y)||!dry(pc.x+hx,y))return false;
        return true;
      };
      let ox=Math.min(12,pc.x-2,BC_C-3-pc.x),oy=Math.min(13,pc.y-2,BC_R-3-pc.y);
      while((ox>7||oy>7)&&!ringDry(ox,oy)){if(ox>7)ox--;if(oy>7)oy--;}
      const ix=Math.max(6,Math.round(ox*0.62)),iy=Math.max(6,Math.round(oy*0.62)); // >=6 keeps the inner ring clear of the citadel pad
      ring(ix,iy,true,false);
      ring(ox,oy,false,true);
      const bx=Math.round((ix+ox)/2),byy=Math.round((iy+oy)/2);
      if(ox-ix>=3&&oy-iy>=3)for(const [sx,sy] of [[-1,-1],[1,-1],[-1,1],[1,1]]){
        for(let k=0;k<2;k++){steel(pc.x+sx*bx,pc.y+sy*(byy-k));steel(pc.x+sx*(bx-k),pc.y+sy*byy);}
      }
    }else if(id==="brickYard"){
      // A real town: rows of destructible houses (tile 1) in 2-deep blocks along a street grid,
      // some blocks left as tree-lined plazas. No walls.
      const ox=(rng()*4)|0,oy=(rng()*3)|0;
      for(let by=2+oy;by<BC_R-2;by+=4)for(let bx=2+ox;bx<BC_C-2;bx+=6){
        if(rng()<0.2){ // plaza: corner trees, open square
          for(const [tx,ty] of [[bx,by],[bx+3,by],[bx,by+2],[bx+3,by+2]])if(dry(tx,ty))m[ty*BC_C+tx]=4;
          continue;
        }
        for(const hx of [bx,bx+3]){
          let ok=true;for(let y=by;y<by+2;y++)for(let x=hx;x<hx+2;x++)if(!dry(x,y))ok=false;
          if(ok)for(let y=by;y<by+2;y++)for(let x=hx;x<hx+2;x++)m[y*BC_C+x]=1;
        }
      }
    }else{
      // hedgerows: broken field boundaries
      for(let y=3;y<BC_R-2;y+=4){
        let x=2+((rng()*3)|0);
        while(x<BC_C-2){const len=3+((rng()*4)|0);for(let k=0;k<len;k++)wall(x+k,y);x+=len+2+((rng()*2)|0);}
      }
      for(let x=4;x<BC_C-2;x+=7){
        let y=3+((rng()*3)|0);
        while(y<BC_R-2){const len=2+((rng()*3)|0);for(let k=0;k<len;k++)wall(x,y+k);y+=len+3;}
      }
    }
  }
  function settleCoast(built){
    const m=built&&built.map;
    if(!m)return built;
    const naval=!!built.naval;
    const N=BC_C*BC_R;
    const keep=new Uint8Array(N);
    const shieldAt=()=>{
      let n=0,sx=0,sy=0;
      for(let y=0;y<BC_R;y++)for(let x=0;x<BC_C;x++)if(m[y*BC_C+x]===5){sx+=x;sy+=y;n++;}
      return n?{x:sx/n,y:sy/n}:{x:BC_C/2,y:BC_R/2};
    };
    const ring=(x,y)=>{
      const t=m[y*BC_C+x];
      if(t===5)return true;
      if(t!==1)return false;
      for(let dy=-3;dy<=3;dy++)for(let dx=-3;dx<=3;dx++){
        const xx=x+dx,yy=y+dy;
        if(xx<0||yy<0||xx>=BC_C||yy>=BC_R)continue;
        if(m[yy*BC_C+xx]===5)return true;
      }
      return false;
    };
    const pinCore=()=>{
      const s=shieldAt();
      for(let y=0;y<BC_R;y++)for(let x=0;x<BC_C;x++){
        if(m[y*BC_C+x]===3)continue;
        const dx=x-s.x,dy=y-s.y;
        if(dx*dx+dy*dy<=36||ring(x,y))keep[y*BC_C+x]=1;
      }
    };
    const reach=()=>{
      const seen=new Uint8Array(N);
      const q=[];
      for(let i=0;i<N;i++)if(m[i]===5){seen[i]=1;q.push(i);}
      let qi=0;
      while(qi<q.length){
        const i=q[qi++],x=i%BC_C,y=(i/BC_C)|0;
        for(const [dx,dy] of [[1,0],[-1,0],[0,1],[0,-1]]){
          const xx=x+dx,yy=y+dy;
          if(xx<0||yy<0||xx>=BC_C||yy>=BC_R)continue;
          const j=yy*BC_C+xx;
          if(seen[j]||m[j]===3)continue;
          seen[j]=1;q.push(j);
        }
      }
      return seen;
    };
    const edgesOf=(seen)=>{
      return ["n","s","w","e"].map((e)=>{
        const cells=edgeLine(e);
        let water=0,linked=0;
        for(const [x,y] of cells){
          const i=y*BC_C+x;
          if(m[i]===3)water++;
          else if(seen&&seen[i])linked++;
        }
        const n=cells.length||1;
        return {e,waterFrac:water/n,landFrac:(n-water)/n,linked};
      });
    };
    const distE=(s,e)=>e==="n"?s.y:e==="s"?(BC_R-1)-s.y:e==="w"?s.x:(BC_C-1)-s.x;
    const hx=Math.max(0,Math.min(BC_C-1,Math.floor(((built.home&&built.home.x)||0)/BC_TS)));
    const hy=Math.max(0,Math.min(BC_R-1,Math.floor(((built.home&&built.home.y)||0)/BC_TS)));
    const homeish=(x,y)=>Math.abs(x-hx)+Math.abs(y-hy)<=1;
    const setLand=(x,y)=>{
      if(x<0||y<0||x>=BC_C||y>=BC_R)return;
      const i=y*BC_C+x;
      if(keep[i]===2)return;
      if(naval&&x===hx&&y===hy)return;
      if(m[i]===3)m[i]=6;
      if(m[i]!==3)keep[i]=1;
    };
    const bridge=(e,s)=>{
      const line=edgeLine(e);
      let tx=line[0][0],ty=line[0][1],bd=1e9;
      for(const [x,y] of line){
        const d=(x-s.x)*(x-s.x)+(y-s.y)*(y-s.y);
        if(d<bd){bd=d;tx=x;ty=y;}
      }
      const x0=Math.round(s.x),y0=Math.round(s.y);
      const steps=Math.max(Math.abs(tx-x0),Math.abs(ty-y0),1);
      for(let i=0;i<=steps;i++){
        const px=Math.round(x0+(tx-x0)*i/steps);
        const py=Math.round(y0+(ty-y0)*i/steps);
        for(let dy=-1;dy<=1;dy++)for(let dx=-1;dx<=1;dx++)setLand(px+dx,py+dy);
      }
      for(const [x,y] of line){
        setLand(x,y);
        if(e==="n")setLand(x,1);
        else if(e==="s")setLand(x,BC_R-2);
        else if(e==="w")setLand(1,y);
        else setLand(BC_C-2,y);
      }
    };
    const drownEdge=(e)=>{
      for(const [x,y] of edgeBand(e,2)){
        const i=y*BC_C+x;
        if(m[i]===5||ring(x,y))continue;
        if(!naval&&homeish(x,y))continue;
        m[i]=3;
        keep[i]=2;
      }
    };
    const rebalance=()=>{
      const minL=naval?Math.ceil(N*0.08):Math.ceil(N*0.70);
      const maxL=naval?Math.floor(N*0.30):Math.floor(N*0.88);
      const s=shieldAt();
      let guard=0;
      while(landCount(m)<minL&&guard++<10){
        const cand=[];
        for(let y=0;y<BC_R;y++)for(let x=0;x<BC_C;x++){
          const i=y*BC_C+x;
          if(m[i]!==3||keep[i]===2)continue;
          if(naval&&x===hx&&y===hy)continue;
          let touch=false;
          for(const [dx,dy] of [[1,0],[-1,0],[0,1],[0,-1]]){
            const xx=x+dx,yy=y+dy;
            if(xx<0||yy<0||xx>=BC_C||yy>=BC_R)continue;
            if(m[yy*BC_C+xx]!==3){touch=true;break;}
          }
          if(!touch)continue;
          const dx=x-s.x,dy=y-s.y;
          cand.push({i,d:dx*dx+dy*dy});
        }
        if(!cand.length)break;
        cand.sort((a,b)=>b.d-a.d);
        const need=minL-landCount(m);
        for(let k=0;k<need&&k<cand.length;k++){m[cand[k].i]=6;keep[cand[k].i]=keep[cand[k].i]||0;}
      }
      guard=0;
      while(landCount(m)>maxL&&guard++<10){
        const seen=reach();
        const cand=[];
        for(let y=0;y<BC_R;y++)for(let x=0;x<BC_C;x++){
          const i=y*BC_C+x;
          if(m[i]===3||keep[i]===1||m[i]===5||ring(x,y))continue;
          if(!naval&&homeish(x,y))continue;
          let wet=x===0||y===0||x===BC_C-1||y===BC_R-1;
          if(!wet){
            for(const [dx,dy] of [[1,0],[-1,0],[0,1],[0,-1]]){
              const xx=x+dx,yy=y+dy;
              if(xx<0||yy<0||xx>=BC_C||yy>=BC_R||m[yy*BC_C+xx]===3){wet=true;break;}
            }
          }
          if(!wet)continue;
          const dx=x-s.x,dy=y-s.y;
          cand.push({i,d:dx*dx+dy*dy,main:seen[i]?1:0});
        }
        if(!cand.length)break;
        cand.sort((a,b)=>a.main-b.main||b.d-a.d);
        const need=landCount(m)-maxL;
        for(let k=0;k<need&&k<cand.length;k++)m[cand[k].i]=3;
      }
    };
    const landEdges=()=>edgesOf(reach()).filter((e)=>e.landFrac>=0.6&&e.linked>0);
    const waterEdges=()=>edgesOf(reach()).filter((e)=>e.waterFrac>=0.6);
    const waterCommit=[];
    const landCommit=[];
    pinCore();
    const s0=shieldAt();
    const byFar=(a,b)=>distE(s0,b)-distE(s0,a);
    const byNear=(a,b)=>distE(s0,a)-distE(s0,b);
    if(naval){
      for(const e of ["n","s","w","e"].slice().sort(byFar)){
        if(waterCommit.length>=2)break;
        drownEdge(e);
        waterCommit.push(e);
      }
      for(const e of ["n","s","w","e"].slice().sort(byNear)){
        if(landCommit.length>=1)break;
        if(waterCommit.indexOf(e)>=0)continue;
        bridge(e,s0);
        landCommit.push(e);
      }
    }else{
      for(const e of ["n","s","w","e"].slice().sort(byNear)){
        if(landCommit.length>=2)break;
        bridge(e,s0);
        landCommit.push(e);
      }
    }
    rebalance();
    if(naval){
      for(const e of ["n","s","w","e"].slice().sort(byFar)){
        if(waterEdges().length>=2)break;
        if(landCommit.indexOf(e)>=0)continue;
        drownEdge(e);
        if(waterCommit.indexOf(e)<0)waterCommit.push(e);
      }
      for(const e of ["n","s","w","e"].slice().sort(byNear)){
        if(landEdges().length>=1)break;
        if(waterCommit.indexOf(e)>=0)continue;
        bridge(e,s0);
        if(landCommit.indexOf(e)<0)landCommit.push(e);
      }
    }else{
      for(const e of ["n","s","w","e"].slice().sort(byNear)){
        if(landEdges().length>=2)break;
        if(landCommit.indexOf(e)>=0)continue;
        bridge(e,s0);
        landCommit.push(e);
      }
    }
    rebalance();
    const ht=m[hy*BC_C+hx];
    const homeOk=naval?ht===3:(ht===0||ht===6||ht===7);
    if(!homeOk){
      let best=null,bd=1e9;
      const fx=built.fort?built.fort.x:built.home.x, fy=built.fort?built.fort.y:built.home.y;
      for(let y=0;y<BC_R;y++)for(let x=0;x<BC_C;x++){
        const tv=m[y*BC_C+x];
        const good=naval?tv===3:(tv===0||tv===6||tv===7);
        if(!good)continue;
        const px=x*BC_TS+8,py=y*BC_TS+8;
        const d=(px-fx)*(px-fx)+(py-fy)*(py-fy);
        if(d<bd){bd=d;best={x:px,y:py};}
      }
      if(best)built.home=best;
    }
    built.spawns=collectSpawns(m,built.home,naval);
    built.landSpawns=collectSpawns(m,built.home,false);
    built.seaSpawns=collectSpawns(m,built.home,true);
    built.dir=faceIn(built.home);
    return built;
  }
  // ---- Geography tidy-up, run on every generated map before spawns are picked ----
  // Water must be the sea (touching the map edge), a river/canal that reaches it, or a real pond; piers run
  // straight from land into open water; exactly one lighthouse on a plausible coastal spot.
  // The harbor's basin is its whole point: later coast/cover passes may silt it up, so re-open it as a
  // rectangular basin with a mouth to the sea and two straight docks rooted on the south quay.
  function keepHarborBasin(m,pad){
    const prot=(x,y)=>pad&&x>=pad.x-2&&x<=pad.x+8&&y>=pad.y-2&&y<=pad.y+7;
    const soft=(t)=>t===0||t===6||t===4||t===8||t===7||t===3;
    for(let y=15;y<=23;y++)for(let x=11;x<=18;x++){if(!prot(x,y)&&soft(m[y*BC_C+x]))m[y*BC_C+x]=3;}
    for(let x=11;x<=18;x++)for(let y=14;y>=1;y--){const i=y*BC_C+x;if(m[i]===3)break;if(prot(x,y)||!soft(m[i]))break;m[i]=3;}
    for(const x of [13,16]){for(let y=19;y<=24;y++)if(!prot(x,y))m[y*BC_C+x]=7;}
    // outer docks at x=6 and x=22 run north from the shore: keep open water in front of and beside them
    for(const px of [6,22]){
      let shore=14;for(let y=14;y>=2;y--){if(m[y*BC_C+px]===7||m[y*BC_C+px]===3)continue;shore=y;break;}
      for(let y=2;y<=13;y++)for(let x=px-1;x<=px+1;x++){if(!prot(x,y)&&soft(m[y*BC_C+x]))m[y*BC_C+x]=3;}
      for(let y=7;y<=14;y++)if(!prot(px,y))m[y*BC_C+px]=7;
      void shore;
    }
  }
  function tidyGeography(m,pad,rng,built){
    const W=BC_C,H=BC_R,N=W*H;
    const prot=(x,y)=>pad&&x>=pad.x-2&&x<=pad.x+8&&y>=pad.y-2&&y<=pad.y+7;
    const at=(x,y)=>(x<0||y<0||x>=W||y>=H)?3:m[y*W+x];
    const landish=(t)=>t===0||t===6||t===1||t===4||t===5||t===9||t===2;
    const O4=[[1,0],[-1,0],[0,1],[0,-1]];
    // 1) water bodies
    const comp=new Int32Array(N).fill(-1);let cid=0;
    for(let i=0;i<N;i++){
      if(m[i]!==3||comp[i]>=0)continue;
      const q=[i];comp[i]=cid;let edge=false,x0=W,x1=0,y0=H,y1=0;
      for(let k=0;k<q.length;k++){
        const c=q[k],cx=c%W,cy=(c/W)|0;
        if(cx===0||cy===0||cx===W-1||cy===H-1)edge=true;
        x0=Math.min(x0,cx);x1=Math.max(x1,cx);y0=Math.min(y0,cy);y1=Math.max(y1,cy);
        for(const [dx,dy] of O4){const nx=cx+dx,ny=cy+dy;if(nx<0||ny<0||nx>=W||ny>=H)continue;const j=ny*W+nx;if(m[j]===3&&comp[j]<0){comp[j]=cid;q.push(j);}}
      }
      const fill=q.length/((x1-x0+1)*(y1-y0+1));
      const pond=q.length>=8&&fill>=0.45;
      if(!edge&&!pond)for(const c of q){const cx=c%W,cy=(c/W)|0;if(!prot(cx,cy))m[c]=6;}
      cid++;
    }
    // notches: a water tile boxed in by land on 3-4 sides is a pixel artefact, not a bay
    for(let y=1;y<H-1;y++)for(let x=1;x<W-1;x++){
      if(at(x,y)!==3||prot(x,y))continue;
      let l=0,pier=false;for(const [dx,dy] of O4){const t=at(x+dx,y+dy);if(landish(t))l++;if(t===7)pier=true;}
      if(!pier&&l>=4)m[y*W+x]=6;
    }
    // lone land specks floating in the sea
    for(let y=1;y<H-1;y++)for(let x=1;x<W-1;x++){
      const t=at(x,y);if((t!==0&&t!==6)||prot(x,y))continue;
      let l=0;for(const [dx,dy] of O4)if(at(x+dx,y+dy)!==3)l++;
      if(l===0)m[y*W+x]=3;
    }
    // 2) piers: straight, uninterrupted, from land out to open water
    const wetish=(t)=>t===3||t===8;
    for(const vert of [true,false]){
      const A=vert?W:H,B=vert?H:W;
      const g=(a,b)=>vert?at(a,b):at(b,a);
      const put=(a,b,t)=>{const x=vert?a:b,y=vert?b:a;if(x>=0&&y>=0&&x<W&&y<H&&!prot(x,y))m[y*W+x]=t;};
      const pierAt=(a,b)=>g(a,b)===7&&wetish(g(a-1,b))&&wetish(g(a+1,b));
      for(let a=0;a<A;a++){
        let b=0;
        while(b<B){
          if(!pierAt(a,b)){b++;continue;}
          let s0=b,e0=b;
          // merge runs split by up to 2 rock/sand/tree tiles that sit in the water
          for(;;){
            let k=e0+1;while(k<B&&pierAt(a,k))k++;
            e0=k-1;let gap=0;
            while(gap<2&&k+gap<B&&!pierAt(a,k+gap)&&wetish(g(a-1,k+gap))&&wetish(g(a+1,k+gap))&&g(a,k+gap)!==3)gap++;
            if(gap>0&&k+gap<B&&pierAt(a,k+gap)){e0=k+gap;continue;}
            break;
          }
          const before=g(a,s0-1),after=g(a,e0+1);
          const rootA=landish(before)||before===7,rootB=landish(after)||after===7;
          if(rootA&&rootB){for(let k=s0;k<=e0;k++)put(a,k,7);} // a bridge: just make it continuous
          else if(!rootA&&!rootB){for(let k=s0;k<=e0;k++)put(a,k,3);} // floating plank: drop it
          else{
            const dir=rootA?1:-1,start=rootA?s0:e0,len=e0-s0+1;
            for(let k=0;k<len;k++){const bb=start+dir*k;put(a,bb,7);if(g(a-1,bb)===8)put(a-1,bb,3);if(g(a+1,bb)===8)put(a+1,bb,3);}
            // the tip must open onto water: clear rocks right past it, or trim the pier back if land is there
            let tip=start+dir*(len-1);
            for(let k=1;k<=2;k++){const bb=tip+dir*k;if(g(a,bb)===8)put(a,bb,3);[-1,1].forEach((o)=>{if(g(a+o,bb)===8)put(a+o,bb,3);});}
            while(len>1&&g(a,tip+dir)!==3){put(a,tip,3);tip-=dir;}
          }
          b=e0+1;
        }
      }
    }
    // 3) exactly one lighthouse, on a coastal point (most water around it), never inland
    const spawnPts=built?[].concat(built.spawns||[],built.landSpawns||[],built.seaSpawns||[],built.home?[built.home]:[]):[];
    const lightOk=(x,y)=>{
      // the sprite is ~3 tiles tall, so also keep the tiles above it clear of docks/roads/bridges
      for(let dy=-4;dy<=3;dy++)for(let dx=-3;dx<=3;dx++)if(at(x+dx,y+dy)===7||at(x+dx,y+dy)===5)return false;
      for(const p of spawnPts){if(Math.hypot(p.x/BC_TS-x,p.y/BC_TS-y)<4)return false;}
      return x>=2&&y>=2&&x<W-2&&y<H-2;
    };
    const lights=[];for(let i=0;i<N;i++)if(m[i]===9){if(lightOk(i%W,(i/W)|0))lights.push(i);else m[i]=0;}
    const coastScore=(x,y)=>{let w=0;for(let dy=-1;dy<=1;dy++)for(let dx=-1;dx<=1;dx++)if((dx||dy)&&at(x+dx,y+dy)===3)w++;return w;};
    let keep=-1,best=-1;
    for(const i of lights){const sc=coastScore(i%W,(i/W)|0);if(sc>best){best=sc;keep=i;}}
    for(const i of lights)if(i!==keep)m[i]=0;
    if(keep>=0&&best<2){m[keep]=0;keep=-1;}
    if(keep<0){
      let cand=-1,cs=-1;
      for(let y=2;y<H-2;y++)for(let x=2;x<W-2;x++){
        const t=at(x,y);if((t!==0&&t!==6&&t!==8)||prot(x,y)||!lightOk(x,y))continue;
        let land=0;for(const [dx,dy] of O4)if(at(x+dx,y+dy)!==3)land++;
        if(land<1)continue;
        const sc=coastScore(x,y)*10+(t===8?15:0)+((x*7+y*13)%7); // rocky points first
        if(coastScore(x,y)>=4&&sc>cs){cs=sc;cand=y*W+x;}
      }
      if(cand<0){ // no headland: settle for any clear beach tile with water on 3 sides of its ring
        for(let y=2;y<H-2;y++)for(let x=2;x<W-2;x++){
          const t=at(x,y);if((t!==0&&t!==8)||prot(x,y)||!lightOk(x,y))continue;
          const sc=coastScore(x,y)*10+((x*7+y*13)%7);
          if(coastScore(x,y)>=3&&sc>cs){cs=sc;cand=y*W+x;}
        }
      }
      if(cand>=0)m[cand]=9;
    }
  }
  function makeMazeIsland(level,fort,plan){
    const m=new Uint8Array(BC_C*BC_R);
    m.fill(3);
    const salt=(((S.bcMapSeed||1)>>>0)+level*17)>>>0;
    const rng=mapMulberry((salt*131+level*97)>>>0);
    paintMazeBed(m,rng);
    carveMazeWater(m,plan.id,rng);
    const clearPad=(p)=>!!(p&&padFits(m,p.x,p.y)&&!citadelHitsUi(p,!!plan.fx,!!plan.fy));
    const candidates=[];
    for(let y=6;y<BC_R-12;y+=2)for(let x=3;x<BC_C-10;x+=2)if(clearPad({x,y}))candidates.push({x,y});
    if(plan.id==="blockFort"){
      const wd=(p)=>{const fx=p.x+3,fy=p.y+2;let best=Math.min(fx,fy,BC_C-1-fx,BC_R-1-fy);for(let y=0;y<BC_R;y++)for(let x=0;x<BC_C;x++)if(m[y*BC_C+x]===3)best=Math.min(best,Math.max(Math.abs(x-(p.x+3)),Math.abs(y-(p.y+2))));return best;};
      candidates.forEach((c)=>{c.wd=wd(c);});
      candidates.sort((a,b)=>b.wd-a.wd);
    }else candidates.sort((a,b)=>Math.hypot(a.x-11,a.y-14)-Math.hypot(b.x-11,b.y-14));
    const pool=candidates.slice(0,plan.id==="blockFort"?2:8);
    let pad=pool.length?pool[(rng()*pool.length)|0]:fitPad(m,10,14);
    if(!clearPad(pad)){
      pad=null;
      for(let y=4;y<BC_R-8&&!pad;y++)for(let x=2;x<BC_C-8;x++)if(clearPad({x,y})){pad={x,y};break;}
    }
    if(!pad)pad={x:10,y:14};
    const prot=(x,y)=>x>=pad.x-2&&x<=pad.x+8&&y>=pad.y-2&&y<=pad.y+7;
    stampMazeWalls(m,plan.id,prot,rng,{x:pad.x+3,y:pad.y+2});
    if(plan.id!=="brickYard")pruneMazeStubs(m,prot);
    let steel=plan.id==="canalMaze"?0:99;
    for(let y=2;y<BC_R-2&&steel<12;y++)for(let x=2;x<BC_C-2&&steel<12;x++){
      if(m[y*BC_C+x]!==1||prot(x,y))continue;
      let n=0;
      for(const [dx,dy] of [[1,0],[-1,0],[0,1],[0,-1]])if(mtile(m,x+dx,y+dy)===1)n++;
      if(n>=2&&((x*13+y*7+salt)%11)===0){m[y*BC_C+x]=2;steel++;}
    }
    if(plan.id==="canalMaze"){carveLane(m,pad.x+2,pad.y+2,15,20);carveLane(m,pad.x+2,pad.y+2,8,28);}
    const sx=Math.max(1,Math.min(BC_C-2,pad.x+2)), sy=Math.max(1,Math.min(BC_R-2,pad.y+2));
    if(!mazeWalk(m[sy*BC_C+sx]))m[sy*BC_C+sx]=6;
    openMaze(m,sx,sy);
    let palms=0;
    for(let y=2;y<BC_R-2&&palms<8;y++)for(let x=2;x<BC_C-2&&palms<8;x++){
      if(m[y*BC_C+x]!==0||prot(x,y))continue;
      if(((x*5+y*9+salt)%6)!==0)continue;
      let wet=false, side=false;
      for(const [dx,dy] of [[1,0],[-1,0],[0,1],[0,-1]]){
        const tv=mtile(m,x+dx,y+dy);
        if(tv===3)wet=true;
        if(tv===0||tv===6)side=true;
      }
      if(!wet||!side)continue;
      m[y*BC_C+x]=4;
      palms++;
    }
    {
      const lights=[];
      for(let y=2;y<BC_R-2;y++)for(let x=2;x<BC_C-2;x++){
        if(m[y*BC_C+x]!==0)continue;
        let wet=0;
        for(const [dx,dy] of [[1,0],[-1,0],[0,1],[0,-1]])if(mtile(m,x+dx,y+dy)===3)wet++;
        if(wet===1)lights.push(y*BC_C+x);
      }
      if(lights.length)m[lights[(rng()*lights.length)|0]]=9;
    }
    for(let y=2;y<BC_R-2;y++)for(let x=2;x<BC_C-2;x++){
      if(m[y*BC_C+x]!==0)continue;
      let sea=false, land=false;
      for(const [dx,dy] of [[1,0],[-1,0],[0,1],[0,-1]]){
        const tv=mtile(m,x+dx,y+dy);
        if(tv===3)sea=true;
        if(tv===6||tv===1)land=true;
      }
      void sea;void land; // (random beach planks removed: docks are placed as real piers only)
    }
    const gate=inlandGate(pad);
    stampCitadel(m,pad);
    if(fort)addFort(m,pad);
    sealShield(m);
    seedIslands(m,rng);
    tidyGeography(m,pad,rng);
    const home=homeFrom(m,pad,gate,false);
    const built=flipAll({
      map:m,home,fort:fortCenter(pad),
      spawns:collectSpawns(m,home,false),
      landSpawns:collectSpawns(m,home,false),
      seaSpawns:collectSpawns(m,home,true),
      naval:false,skel:plan.id,maze:true
    },!!plan.fx,!!plan.fy);
    // the fort rings are built around the citadel, so it must not be shifted afterwards
    const moved=plan.id==="blockFort"?null:moveShieldOffUi(built.map);
    if(moved)built.fort=moved;
    nudgeHomeOffUi(built);
    tidyGeography(built.map,null,rng,built);
    // brickYard is a town: its tile-1 blocks are houses (drawn, burnt and billed as houses), not maze masonry
    built.maze=plan.id!=="brickYard";
    built.steel=plan.id==="blockFort";
    return built;
  }
  function makeIslandMap(level, fort){
    level=Math.max(0,Math.min(8,level|0));
    const plan=ensureMapPlan()[level];
    if(plan&&(plan.theme==="maze"||plan.dress==="maze"))return makeMazeIsland(level,fort,plan);
    const m=new Uint8Array(BC_C*BC_R);
    m.fill(3);
    paintSkel(m,plan.id);
    const pref=SKEL_PAD[plan.id]||SKEL_PAD.beach;
    const salt=(((S.bcMapSeed||1)>>>0)+level*17)>>>0;
    const dress=plan.theme||plan.dress||"wild";
    const keepTown=dress==="village"||dress==="docks";
    jaggedCoast(m,{x:pref.x,y:pref.y},salt,keepTown);
    const rng=mapMulberry((salt*131+level*97)>>>0);
    const clearPad=(p)=>!!(p&&padFits(m,p.x,p.y)&&!citadelHitsUi(p,!!plan.fx,!!plan.fy));
    let edgePad=pickEdgePad(m,rng,clearPad);
    let pad=clearPad(edgePad)?edgePad:null;
    if(!pad){
      const prefPad=fitPad(m,pref.x,pref.y);
      if(clearPad(prefPad))pad=prefPad;
      else{
        const opts=[];
        for(let y=0;y<BC_R-4;y++)for(let x=0;x<BC_C-5;x++)if(clearPad({x,y}))opts.push({x,y});
        pad=opts.length?opts[(rng()*opts.length)|0]:prefPad;
      }
    }
    const gate=edgePad?inlandGate(pad):pref.gate;
    stampCitadel(m,pad,gate);
    sandFringe(m,pad,plan.naval?1:2);
    rockyCoast(m,pad,salt);
    openTransit(m,pad);
    if(fort)addFort(m,pad,gate);
    const road={};
    if(dress==="village"||dress==="docks"){
      layRoad(m,pad,gate,road);
      placeHouses(m,pad,road);
      placeHamlet(m,pad,rng);
      if(rng()<0.6)placeHamlet(m,pad,rng);
      placeBuildings(m,pad,rng,2);
    }else if(dress==="woods"){
      if(rng()<0.7)placeHamlet(m,pad,rng); // a clearing village in the woods
      woodsGroves(m,pad,road);
    }else if(dress==="airport"){
      placeRunway(m,pad,rng);
      if(rng()<0.7)placeHamlet(m,pad,rng);
    }else if(dress==="caribbean"){
      placeHamlet(m,pad,rng);
      placeBuildings(m,pad,rng,1);
    }else if(dress!=="cliffs"&&dress!=="sea"){
      if(rng()<0.75)placeHamlet(m,pad,rng); // fishing village on the open coast
      wildGroves(m,pad,road);
    }
    if(dress!=="airport"&&dress!=="sea")beachTrees(m,pad,road);
    breakLanes(m,pad);
    repairEdges(m,!!plan.naval);
    thinSeaRocks(m);
    unsealWater(m);
    fitCover(m,!!plan.naval,rng,pad);
    sealShield(m);
    if(dress==="cliffs")cliffShore(m,pad,rng);
    repairEdges(m,!!plan.naval);
    const isles=seedIslands(m,rng);
    placeLighthouse(m,pad,rng,isles);
    if(plan.river)carveRiver(m,rng,pad);
    if(dress==="cliffs"||dress==="sea"){if(rng()<0.6)placeHamlet(m,pad,rng);}
    if(plan.id==="harbor")keepHarborBasin(m,pad);
    tidyGeography(m,pad,rng);
    const home=homeFrom(m,pad,gate,!!plan.naval);
    const built=flipAll({
      map:m,home,fort:fortCenter(pad),
      spawns:collectSpawns(m,home,!!plan.naval),
      landSpawns:collectSpawns(m,home,false),
      seaSpawns:collectSpawns(m,home,true),
      naval:!!plan.naval,skel:plan.id
    },!!plan.fx,!!plan.fy);
    const moved=moveShieldOffUi(built.map);
    if(moved)built.fort=moved;
    nudgeHomeOffUi(built);
    settleCoast(built);
    tidyGeography(built.map,null,rng,built);
    return built;
  }
// MAPGEN_END
  function bcTileHp(t){return t===1?2:t===2?1:t===5?99:0;}
  function unitAlive(u){
    if(!u||u.fly||u.type==="HELI")return false;
    const hp=u.hearts!=null?u.hearts:u.hp;
    return hp>0;
  }
  function unitsOverlap(d,x,y,sz,ignore){
    const needOf=(u)=>(sz+(u.sz||12))*0.8;
    const hit=(u)=>{
      if(!unitAlive(u)||u===ignore||(ignore&&ignore.slip===u))return false;
      return Math.hypot(u.x-x,u.y-y)<needOf(u);
    };
    if(hit(d.player))return true;
    const list=d.enemies||[];
    for(let i=0;i<list.length;i++)if(hit(list[i]))return true;
    return false;
  }
  function beaconBase(tx,ty){
    const cx=tx*BC_TS+8, by=ty*BC_TS+15;
    return {x0:cx-11,y0:by-2,x1:cx+12,y1:by+4};
  }
  function hitsBeaconBase(x,y,hw,d){
    const tx=Math.floor(x/BC_TS), ty=Math.floor(y/BC_TS);
    for(let dy=-1;dy<=1;dy++)for(let dx=-1;dx<=1;dx++){
      if(bcAt(d.map,tx+dx,ty+dy)!==9)continue;
      const b=beaconBase(tx+dx,ty+dy);
      if(x+hw>b.x0&&x-hw<b.x1&&y+hw>b.y0&&y-hw<b.y1)return true;
    }
    return false;
  }
  function edgeSlack(sz){return (sz||12)*0.5;}
  function tankBlocked(d,x,y,sz,ignore){
    const hw=sz*.40;
    let n=0,wet=0,solid=false;
    for(let iy=0;iy<4;iy++)for(let ix=0;ix<4;ix++){
      const px=x-hw+(hw*2)*ix/3, py=y-hw+(hw*2)*iy/3;
      const tx=Math.floor(px/BC_TS), ty=Math.floor(py/BC_TS);
      n++;
      if(tx<0||ty<0||tx>=BC_C||ty>=BC_R)continue;
      const t=bcAt(d.map,tx,ty);
      if(t===1||t===2||t===4||t===5||t===8)solid=true;
      else if(t===3)wet++;
    }
    if(solid||(n&&wet/n>0.5))return true;
    if(hitsBeaconBase(x,y,hw,d))return true;
    return unitsOverlap(d,x,y,sz,ignore);
  }
  function dirVec(dir){
    switch(dir|0){
      case 1: return [1,0];
      case 2: return [0,1];
      case 3: return [-1,0];
      case 4: return [1,-1];
      case 5: return [1,1];
      case 6: return [-1,1];
      case 7: return [-1,-1];
      default: return [0,-1];
    }
  }
  function vecDir(vx,vy){
    const ax=Math.abs(vx), ay=Math.abs(vy);
    if(ax<1e-4&&ay<1e-4) return -1;
    if(ax>1e-4&&ay>1e-4&&Math.min(ax,ay)/Math.max(ax,ay)>=0.42){
      if(vx>0&&vy<0) return 4;
      if(vx>0&&vy>0) return 5;
      if(vx<0&&vy>0) return 6;
      return 7;
    }
    if(ax>=ay) return vx>=0?1:3;
    return vy>=0?2:0;
  }
  function heading(t){
    if(t&&t.ang!=null)return t.ang;
    const v=dirVec(t?t.dir:0);
    return Math.atan2(v[1],v[0]);
  }
  function aimVec(t){
    const a=heading(t);
    return [Math.cos(a),Math.sin(a)];
  }
  function faceVec(t,vx,vy){
    if(!t||(Math.abs(vx)<1e-4&&Math.abs(vy)<1e-4))return;
    if(!BATTLE_360){
      const s=axisSnap(vx,vy);
      vx=s[0]; vy=s[1];
      if(!vx&&!vy)return;
    }
    const nd=vecDir(vx,vy);
    if(!BATTLE_360&&!t.hero&&nd>=0&&(t.dir|0)!==nd){
      if((t.turnCd||0)>0)return;
      t.turnCd=0.1;
    }
    t.ang=Math.atan2(vy,vx);
    if(nd>=0)t.dir=nd;
  }
  function facingRot(t){return heading(t)+Math.PI/2;}
  function slideUnit(d,t,vx,vy,spd,dt){
    spd*=0.9;
    const len=Math.hypot(vx,vy);
    if(len<1e-4) return;
    const ux=vx/len, uy=vy/len;
    const slack=edgeSlack(t.sz);
    const nx=Math.max(slack,Math.min(S.W-slack,t.x+ux*spd*dt));
    const ny=Math.max(slack,Math.min(S.H-slack,t.y+uy*spd*dt));
    const blocked=(x,y)=>t.ship?shipBlocked(d,x,y,t.sz,t):tankBlocked(d,x,y,t.sz,t);
    if(!blocked(nx,ny)){t.x=nx;t.y=ny;return;}
    if(!blocked(nx,t.y)) t.x=nx;
    if(!blocked(t.x,ny)) t.y=ny;
  }
  function unitRot(dir){
    return [0,Math.PI/2,Math.PI,-Math.PI/2,Math.PI/4,3*Math.PI/4,-3*Math.PI/4,-Math.PI/4][dir|0]||0;
  }
  function snapTank(t,dir,d){
    const ox=t.x,oy=t.y,g=8;
    if(dir===0||dir===2)t.x=Math.round(t.x/g)*g;else t.y=Math.round(t.y/g)*g;
    if(d&&tankBlocked(d,t.x,t.y,t.sz,t)){t.x=ox;t.y=oy;}
    t.dir=dir;
  }
  function moveTank(d,t,dir,spd,dt,back){
    let m=dir;
    if(back)m=(t.dir+2)&3;
    else{
      if(dir<0)return;
      if(t.dir!==dir)snapTank(t,dir,d);
    }
    const vx=m===1?spd:m===3?-spd:0,vy=m===2?spd:m===0?-spd:0;
    const slack=edgeSlack(t.sz);
    const nx=Math.max(slack,Math.min(S.W-slack,t.x+vx*dt));
    const ny=Math.max(slack,Math.min(S.H-slack,t.y+vy*dt));
    if(!tankBlocked(d,nx,ny,t.sz,t)){t.x=nx;t.y=ny;}
  }
  function shipBlocked(d,x,y,sz,ignore){
    const hw=sz*.42;
    let n=0,land=0;
    for(let iy=0;iy<4;iy++)for(let ix=0;ix<4;ix++){
      const px=x-hw+(hw*2)*ix/3, py=y-hw+(hw*2)*iy/3;
      const tx=Math.floor(px/BC_TS), ty=Math.floor(py/BC_TS);
      n++;
      if(tx<0||ty<0||tx>=BC_C||ty>=BC_R)continue;
      if(bcAt(d.map,tx,ty)!==3)land++;
    }
    if(n&&land/n>0.5)return true;
    return unitsOverlap(d,x,y,sz,ignore);
  }
  function moveShip(d,t,dir,spd,dt,back){
    let m=dir;
    if(back)m=(t.dir+2)&3;
    else{
      if(dir<0)return;
      if(t.dir!==dir){
        const ox=t.x,oy=t.y,g=8;
        if(dir===0||dir===2)t.x=Math.round(t.x/g)*g;else t.y=Math.round(t.y/g)*g;
        if(shipBlocked(d,t.x,t.y,t.sz,t)){t.x=ox;t.y=oy;}
        t.dir=dir;
      }
    }
    const vx=m===1?spd:m===3?-spd:0,vy=m===2?spd:m===0?-spd:0;
    const slack=edgeSlack(t.sz);
    const nx=Math.max(slack,Math.min(S.W-slack,t.x+vx*dt));
    const ny=Math.max(slack,Math.min(S.H-slack,t.y+vy*dt));
    if(!shipBlocked(d,nx,ny,t.sz,t)){t.x=nx;t.y=ny;}
  }
  const AMMO_MAX=12, AMMO_RELOAD=1.7;
  function fireTank(d,t){
    if(t.fire>0)return;
    const hero=t===d.player;
    if(hero&&!d.infAmmo){
      if((d.reloadT||0)>0)return;
      if((d.ammo|0)<=0){d.reloadT=AMMO_RELOAD;return;}
      d.ammo--;d.ammoIdle=0;
      if(d.ammo<=0){d.reloadT=AMMO_RELOAD;warSfx("warClank");}
    }
    const tier=hero?Math.min(3,(d.shotTier|0)+((d.boostT||0)>0?1:0)):0;
    if(!hero){
      const mine=d.shots.filter(s=>s.owner===t&&!s.hit).length;
      if(mine>=(t.boss?2:1))return;
    }
    const n=t.flag?3:(tier>=2?2:1);
    t.fire=hero?(tier>=1?.1:.22):0.1;
    const shotMul=t===d.player?(1+((d.up&&d.up.shot)||0)/100)*(tier>=1?1.5:1):1;
    const v=t===d.player?180*shotMul:((t.bspd||180)*(0.81+0.05*((d.level/3)|0)));
    const dmg=t===d.player?((d.up&&d.up.power)||1):(t.dmg||1);
    const vdir=aimVec(t);
    const dx=vdir[0], dy=vdir[1];
    let base=Math.atan2(dy,dx);
    if(hero&&d.assistTgt){const a=d.assistTgt;base=Math.atan2(a.y-t.y,a.x-t.x);}
    const spread=t.flag?0.22:(n>1&&t===d.player?((d.shotSpread==null?0:d.shotSpread)*Math.PI/180):0);
    for(let i=0;i<n;i++){
      const side=n===1?0:n===3?i-1:(i===0?-1:1);
      const ang=base+side*spread;
      const sdx=Math.cos(ang), sdy=Math.sin(ang);
      const off=side*6;
      d.shots.push({x:t.x+sdx*14-sdy*off,y:t.y+sdy*14+sdx*off,dx:sdx,dy:sdy,v,damage:dmg,mine:t===d.player,owner:t,hit:false,pierce:tier>=3,fromShip:!!(t.ship&&t!==d.player),rico:hero?(d.rico|0):0});
    }
    if(t===d.player)warSfx("warShot");
    else warSfx("warEnemy");
  }
  function los(d,a,x,y){
    const dist=Math.hypot(a.x-x,a.y-y);
    if(dist<14) return true;
    const n=Math.max(6,Math.ceil(dist/14));
    for(let i=1;i<n;i++){
      const px=a.x+(x-a.x)*i/n, py=a.y+(y-a.y)*i/n;
      const t=bcAt(d.map,Math.floor(px/BC_TS),Math.floor(py/BC_TS));
      if(t===1||t===2||t===4||t===8||t===9)return false;
    }
    return true;
  }
  function losShield(d,a,x,y){
    const dist=Math.hypot(a.x-x,a.y-y);
    if(dist<14)return true;
    const n=Math.max(6,Math.ceil(dist/14));
    for(let i=1;i<n;i++){
      const px=a.x+(x-a.x)*i/n, py=a.y+(y-a.y)*i/n;
      const tx=Math.floor(px/BC_TS), ty=Math.floor(py/BC_TS);
      const t=bcAt(d.map,tx,ty);
      if(t===5||(t===1&&citadelSkin(d,tx,ty)))continue;
      if(t===1||t===2||t===4||t===8||t===9)return false;
    }
    return true;
  }
  function laneMate(tx){
    const pairs=[[6,7],[14,15],[22,23]];
    for(const [a,b] of pairs){if(tx===a)return b;if(tx===b)return a;}
    return -1;
  }
  function placeTank(d,x,y,sz){
    for(let rad=0;rad<=160;rad+=8){
      for(let dy=-rad;dy<=rad;dy+=8)for(let dx=-rad;dx<=rad;dx+=8){
        if(rad&&Math.abs(dx)!==rad&&Math.abs(dy)!==rad)continue;
        const nx=x+dx,ny=y+dy;
        if(nx<24||ny<24||nx>S.W-24||ny>S.H-24)continue;
        if(!tankBlocked(d,nx,ny,sz,null))return {x:nx,y:ny};
      }
    }
    return {x,y};
  }
  function placeShip(d,x,y,sz,ignore){
    for(let rad=0;rad<=176;rad+=8){
      for(let dy=-rad;dy<=rad;dy+=8)for(let dx=-rad;dx<=rad;dx+=8){
        if(rad&&Math.abs(dx)!==rad&&Math.abs(dy)!==rad)continue;
        const nx=x+dx,ny=y+dy;
        if(nx<20||ny<20||nx>S.W-20||ny>S.H-20)continue;
        if(!shipBlocked(d,nx,ny,sz,ignore||null))return {x:nx,y:ny};
      }
    }
    return {x,y};
  }
  function separateUnits(d){
    const units=[];
    for(const e of d.enemies)if(unitAlive(e))units.push(e);
    const p=d.player;
    for(let n=0;n<4;n++){
      let moved=false;
      for(const a of units){
        if((a.spawn||0)>0)continue;
        const others=p&&unitAlive(p)?units.concat([p]):units;
        for(const b of others){
          if(a===b)continue;
          const min=(a.sz+(b.sz||12))*0.8;
          let dx=a.x-b.x,dy=a.y-b.y,dist=Math.hypot(dx,dy);
          if(dist>=min)continue;
          if(dist<0.01){dx=(n%2?1:-1);dy=0;dist=1;}
          const push=(min-dist)+0.4;
          const slack=edgeSlack(a.sz);
          const nx=Math.max(slack,Math.min(S.W-slack,a.x+dx/dist*push));
          const ny=Math.max(slack,Math.min(S.H-slack,a.y+dy/dist*push));
          const blocked=a.ship?shipBlocked(d,nx,ny,a.sz,a):tankBlocked(d,nx,ny,a.sz,a);
          if(!blocked){a.x=nx;a.y=ny;moved=true;}
        }
      }
      if(!moved)break;
    }
  }
  function battleWaveQuota(level,wave,world,fewer){
    const boost=Math.max(0,Math.round((((world|0)||20)-20)/4));
    const base=6+Math.floor(level*1.5)+boost;
    let n=base+(wave<=1?0:wave===2?2:4);
    if((level|0)===0)n=Math.max(1,Math.floor((n*3+(wave<=1?2:1))/4));
    return Math.max(1,Math.floor(n*0.9*(1-Math.max(0,Math.min(0.5,fewer||0)))));
  }
  const shotKeep={tier:0,spread:0};
  function rememberShot(d){
    if(!d)return;
    const tier=d.shotTier|0;
    if(tier>shotKeep.tier)shotKeep.tier=tier;
    if(d.shotSpread!=null)shotKeep.spread=Math.max(0,Math.min(45,+d.shotSpread||0));
    S.bcShotTier=shotKeep.tier;
    S.bcShotSpread=shotKeep.spread;
    try{sessionStorage.setItem("bc-shot",JSON.stringify({tier:shotKeep.tier,spread:shotKeep.spread}));}catch(e){}
  }
  function recallShot(){
    try{
      const o=JSON.parse(sessionStorage.getItem("bc-shot")||"null");
      if(o){
        if((o.tier|0)>shotKeep.tier)shotKeep.tier=o.tier|0;
        if(o.spread!=null)shotKeep.spread=Math.max(0,Math.min(45,+o.spread||0));
      }
    }catch(e){}
    S.bcShotTier=shotKeep.tier;
    S.bcShotSpread=shotKeep.spread;
  }
  function wipeShotKeep(){
    shotKeep.tier=0;shotKeep.spread=0;
    S.bcShotTier=0;S.bcShotSpread=0;
    try{sessionStorage.removeItem("bc-shot");}catch(e){}
  }
  function parkMarketLoad(){
    if(field){
      field.classList.remove("is-play","bull","bear","swan-bear");
      field.classList.add("defense-mode");
    }
    if(canvas){
      canvas.style.animation="none";
      canvas.style.webkitAnimation="none";
      canvas.style.filter="none";
      canvas.style.transform="none";
    }
    if(S.particles)S.particles.length=0;
    if(S.floats)S.floats.length=0;
    S._battleJuke=!!(A&&A.jukePlaying&&A.jukePlaying());
    if(S._battleJuke&&A.jukePause){ try{ A.jukePause(); }catch(e){} }
    try{ if(A&&A.stopMusic)A.stopMusic(); }catch(e){}
    try{ if(A&&A.cancelSpeech)A.cancelSpeech(); }catch(e){}
  }
  function releaseBattleLoad(){
    if(canvas){
      canvas.style.animation="";
      canvas.style.webkitAnimation="";
      canvas.style.filter="";
      canvas.style.transform="";
    }
    if(S._battleJuke&&A&&A.jukeResume){
      S._battleJuke=false;
      try{ A.jukeResume(); }catch(e){}
    }else S._battleJuke=false;
  }
  function startDefense(){
    recallShot();
    const level=Math.max(0,Math.min(8,S.bcBattlesWon|0));
    const bloc=(level/3)|0;
    const u=defenseUpgrades();
    const built=makeIslandMap(level,!!u.wall);
    const zplan=ensureMapPlan()[level]||{};
    const map=built.map;
    const hp=new Uint8Array(map.length);
    for(let i=0;i<map.length;i++)hp[i]=bcTileHp(map[i]);
    S.defHeld={u:0,d:0,l:0,r:0,f:0,aa:0};S.defPtr=null;
    const world=S.bcWorld||20;
    const troopMul=zplan.id==="blockFort"?1.5:1; // the fortress draws a bigger assault
    const quota=Math.ceil(battleWaveQuota(level,1,world,u.fewer)*troopMul);
    const naval=!!built.naval;
    const heliN=(!naval && (level%3===2))?2:0;
    const ground=Math.ceil(battleWaveQuota(level,1,world,u.fewer)*troopMul)+Math.ceil(battleWaveQuota(level,2,world,u.fewer)*troopMul);
    const delta=(S.bcArmy||0)-world;
    const pressure=delta<=-20?1.18:delta<=-5?1.08:delta>=25?.86:delta>=10?.94:1;
    const hearts=u.hearts||3;
    const spread0=shotKeep.spread;
    const tier0=shotKeep.tier;
    const face0=built.dir||0;
    const faceV=dirVec(face0);
    S.bcDefense={
      map,hp,player:{x:built.home.x,y:built.home.y,dir:face0,ang:Math.atan2(faceV[1],faceV[0]),hp:hearts,hearts,maxHearts:hearts,sz:naval?14:13,fire:0,ship:naval,hero:true},
      shots:[],enemies:[],picks:[],wave:1,waves:2,spawn:.6,spawned:0,kills:0,quota,enemyTotal:ground+heliN,
      fortSteel:!!built.steel,troopMul,
      integrity:100,wall:u.wall?100:0,done:false,frozen:false,inv:0,playerInv:0,god:0,shotTier:Math.max(0,Math.min(3,tier0|0)),freeze:0,aegisT:0,aegis:null,seal:new Uint8Array(map.length),aa:0,aaBeep:0,aaArmed:false,aaTap:0,aaCharging:false,aaCharge:0,reticle:null,shotSpread:spread0,fx:[],shards:[],
      heliLeft:heliN,naval,fort:built.fort||built.home,maze:!!built.maze,
      profile:{rate:(.76+bloc*.1)*pressure,enemy:(.92+level*.03)*pressure},
      up:u,t:0,level,bloc,spawnI:0,
      home:built.home,
      theme:zplan.theme||"wild",zoneEn:zplan.zoneEn||"",zoneEs:zplan.zoneEs||"",stage:zplan.stage||"",
      spawns:built.spawns,
      landSpawns:built.landSpawns&&built.landSpawns.length?built.landSpawns:built.spawns,
      seaSpawns:built.seaSpawns&&built.seaSpawns.length?built.seaSpawns:built.spawns,
      // ~12% of attackers come from the other element: ships on land maps, landing tanks on sea maps.
      foreignLeft:Math.max(1,Math.round(ground*0.12)),
      groundLeft:ground,
      pickIn:5+Math.random()*10,
      bed:map.bed||null,
      bedSet:map.bedSet||null,
      rubble:new Uint8Array(map.length)
    };
    S.bcDefense.groundTotal=ground;
    planWaves(S.bcDefense);
    applyBattlePerks(S.bcDefense);
    if(naval){
      const at=placeShip(S.bcDefense,built.home.x,built.home.y,14,S.bcDefense.player);
      S.bcDefense.player.x=at.x;S.bcDefense.player.y=at.y;
    }
    S.optPanel=null;S.arcHold=false;
    markBuildings(S.bcDefense);
    if(field){
      field.classList.remove("is-play","bull","bear","swan-bear");
      field.classList.add("defense-mode");
    }
    parkMarketLoad();
    setPhase("defense");
    syncAaButton(S.bcDefense);
    warSfx("warWave");
  }
  const BOMB_R=120;
  function blastEnemies(d,x,y){
    if(x==null){x=d.player.x;y=d.player.y;}
    for(const e of d.enemies){
      if(e.hp<=0)continue;
      if((e.spawn||0)>0)continue;
      if(Math.hypot(e.x-x,e.y-y)>BOMB_R+(e.sz||12))continue;
      if(e.boss){dmgEnemy(d,e,4);continue;}
      e.hp=0;d.kills++;
      addFx(d,{kind:"treeBurn",x:e.x,y:e.y,life:.55,hot:3});
    }
    addFx(d,{kind:"boom",x,y,life:.6,r:BOMB_R});
    bShake(d,7);bBuzz(70);
    warSfx("warBoom");
  }
  function raiseAegis(d){
    const o=shieldCorner(d.map);
    if(!o)return;
    const ring=[];
    eachShieldRing(o.x,o.y,(x,y)=>{if(x>=0&&y>=0&&x<BC_C&&y<BC_R)ring.push(y*BC_C+x);});
    const onRing=(x,y)=>ring.indexOf(y*BC_C+x)>=0;
    const p=d.player;
    const c=shieldCenter(d);
    if(p){
      const tx=Math.floor(p.x/BC_TS),ty=Math.floor(p.y/BC_TS);
      if(onRing(tx,ty)){
        const dx=p.x-c.x,dy=p.y-c.y,len=Math.hypot(dx,dy)||1;
        for(let step=1;step<=10;step++){
          const nx=p.x+(dx/len)*step*BC_TS,ny=p.y+(dy/len)*step*BC_TS;
          if(onRing(Math.floor(nx/BC_TS),Math.floor(ny/BC_TS)))continue;
          const blocked=p.ship?shipBlocked(d,nx,ny,p.sz,p):tankBlocked(d,nx,ny,p.sz,p);
          if(!blocked){p.x=nx;p.y=ny;break;}
        }
      }
    }
    const hx=p?Math.floor(p.x/BC_TS):-1,hy=p?Math.floor(p.y/BC_TS):-1;
    const placed=[];
    for(const j of ring){
      const x=j%BC_C,y=(j/BC_C)|0;
      if(x===hx&&y===hy)continue;
      if(d.map[j]===5)continue;
      d.map[j]=2;
      if(d.seal)d.seal[j]=0;
      placed.push(j);
    }
    d.aegis=placed;
    d.aegisT=7.5;
    warSfx("warWall");
  }
  function settleAegis(d){
    d.aegisT=0;
    for(const i of d.aegis||[]){
      if(d.map[i]!==2)continue;
      d.map[i]=1;
      d.hp[i]=2;
      if(d.seal)d.seal[i]=1;
    }
    d.aegis=null;
    warSfx("warBrick");
  }
  const PICK_TTL=12.5; // seconds a battle pickup stays on the ground (was 10, +25%)
  function scatterPickups(d,n){
    // Powerups that already hit their tier cap are left out of the pool (S at tier 3, + at 4/4 hearts).
    const pl=d.player||{};
    const kinds=["heal","shot","god","freeze","bomb","wall"].filter((k)=>{
      if(k==="shot")return (d.shotTier|0)<3;
      if(k==="heal")return (pl.hearts|0)<(pl.maxHearts||3)||(pl.maxHearts||3)<4;
      return true;
    });
    const sea=!!(d.naval||(d.player&&d.player.ship));
    const ok=(t)=>sea?t===3:(t===0||t===6||t===7);
    const seen=new Uint8Array(BC_C*BC_R);
    const cells=[];
    const home=d.home||d.player||{x:0,y:0};
    const sx=Math.max(0,Math.min(BC_C-1,Math.floor(((d.player&&d.player.x)||home.x)/BC_TS)));
    const sy=Math.max(0,Math.min(BC_R-1,Math.floor(((d.player&&d.player.y)||home.y)/BC_TS)));
    let seed=null;
    for(let r=0;r<Math.max(BC_C,BC_R)&&!seed;r++){
      for(let y=sy-r;y<=sy+r&&!seed;y++)for(let x=sx-r;x<=sx+r;x++){
        if(x<1||y<1||x>=BC_C-1||y>=BC_R-1)continue;
        if(r&&Math.max(Math.abs(x-sx),Math.abs(y-sy))!==r)continue;
        if(ok(bcAt(d.map,x,y)))seed={x:x,y:y};
      }
    }
    const q=seed?[seed]:[];
    if(seed)seen[seed.y*BC_C+seed.x]=1;
    while(q.length){
      const c=q.pop();
      const px=c.x*BC_TS+8,py=c.y*BC_TS+8;
      if(Math.hypot(px-home.x,py-home.y)>=70)cells.push({x:px,y:py});
      for(const [dx,dy] of [[1,0],[-1,0],[0,1],[0,-1]]){
        const xx=c.x+dx,yy=c.y+dy;
        if(xx<1||yy<1||xx>=BC_C-1||yy>=BC_R-1)continue;
        const i=yy*BC_C+xx;
        if(seen[i]||!ok(bcAt(d.map,xx,yy)))continue;
        seen[i]=1;
        q.push({x:xx,y:yy});
      }
    }
    if(!cells.length){
      for(let y=1;y<BC_R-1;y++)for(let x=1;x<BC_C-1;x++){
        if(!ok(bcAt(d.map,x,y)))continue;
        cells.push({x:x*BC_TS+8,y:y*BC_TS+8});
      }
    }
    // Spawn toward the fighting: cells 50-150px from a live enemy and away from the hero (risk/reward).
    const foes=(d.enemies||[]).filter(e=>e.hp>0&&!(e.spawn>0)&&e.type!=="HELI");
    if(foes.length){
      const near=cells.filter(c=>{
        if(pl.x!=null&&Math.hypot(c.x-pl.x,c.y-pl.y)<60)return false;
        let m=1e9;for(const e of foes){const q=Math.hypot(c.x-e.x,c.y-e.y);if(q<m)m=q;}
        return m>=50&&m<=150;
      });
      if(near.length){cells.length=0;for(const c of near)cells.push(c);}
    }
    for(let i=0;i<n&&cells.length;i++){
      const k=(Math.random()*cells.length)|0;
      const c=cells.splice(k,1)[0];
      d.picks.push({x:c.x,y:c.y,kind:kinds[(Math.random()*kinds.length)|0],life:1,ttl:PICK_TTL});
    }
  }
  function armSpawn(d,e){
    e.spawn=1.3;
    e.want=false;
    addFx(d,{kind:"spawn",x:e.x,y:e.y,life:.65});
    warSfx("warSpawn");
  }
  function spawnHeli(d){
    const sp=d.spawns[(Math.random()*d.spawns.length)|0]||{x:240,y:80};
    const e={x:sp.x,y:Math.max(28,sp.y-20),dir:2,ang:Math.PI/2,hp:1,maxHp:1,sz:15,spd:54*(d.profile.enemy||1),bspd:150,dmg:1,leak:16,type:"HELI",fire:.1,think:.2,fly:true,role:Math.random()<0.5?"hero":"shield"};
    d.enemies.push(e);
    armSpawn(d,e);
    warSfx("warHeli");
  }
  function defenseEnemy(d,boss){
    const r=Math.random(),bloc=d.bloc|0;
    const wk=waveKind(d);
    let type="STANDARD",hp=2,spd=62,bspd=168,dmg=1,leak=10;
    const mix=warBloc(bloc).mix, heavy=mix==="heavy",fast=mix==="fast",snipe=mix==="snipe";
    if(heavy){
      if(r<.46){type="HEAVY";hp=3;spd=42;bspd=150;dmg=2;leak=18;}
      else if(r<.72){type="STANDARD";hp=2;}
      else if(r<.88){type="FAST";hp=1;spd=96;bspd=200;leak=8;}
      else {type="ELITE";hp=2;spd=74;bspd=210;leak=14;}
    }else if(fast){
      if(r<.5){type="FAST";hp=1;spd=100;bspd=210;leak=8;}
      else if(r<.74){type="STANDARD";hp=2;}
      else if(r<.9){type="ELITE";hp=2;spd=76;bspd=220;leak=14;}
      else {type="HEAVY";hp=3;spd=40;bspd=148;dmg=2;leak=18;}
    }else if(snipe){
      if(r<.46){type="STANDARD";hp=2;spd=66;bspd=236;}
      else if(r<.72){type="FAST";hp=1;spd=98;bspd=205;leak=8;}
      else if(r<.9){type="ELITE";hp=2;spd=76;bspd=228;leak=14;}
      else {type="HEAVY";hp=3;spd=40;bspd=150;dmg=2;leak=18;}
    }else{
      if(r<.44){type="ELITE";hp=2;spd=78;bspd=226;leak=15;}
      else if(r<.7){type="STANDARD";hp=2;}
      else if(r<.86){type="FAST";hp=1;spd=94;bspd=200;leak=8;}
      else {type="HEAVY";hp=3;spd=40;bspd=150;dmg=2;leak=18;}
    }
    if(wk==="rush"&&Math.random()<.55){type="FAST";hp=1;spd=98;bspd=205;dmg=1;leak=8;}
    else if(wk==="column"&&Math.random()<.45){type="HEAVY";hp=3;spd=41;bspd=150;dmg=2;leak=18;}
    let role2="";
    if(type==="FAST"&&Math.random()<.45)role2="rusher";
    else if(type==="HEAVY"&&Math.random()<.35)role2="sapper";
    else if((type==="STANDARD"||type==="ELITE")&&Math.random()<(wk==="column"?.5:.18))role2="escort";
    else if((type==="STANDARD"||type==="ELITE")&&Math.random()<(snipe?.5:.3))role2="sniper";
    if(role2==="rusher")spd*=1.12;
    if(role2==="sniper")bspd*=1.25;
    if(role2==="sapper")dmg=2;
    spd*=d.profile.enemy||1;
    const hull=type==="FAST"?"light":type==="HEAVY"?"heavy":type==="ELITE"?"elite":"medium";
    if(hull==="light")spd*=0.9;
    const sz=hull==="light"?11:hull==="heavy"?16:13;
    let asShip=!!d.naval,foreign=false,cargo=false;
    const left=d.groundLeft|0;
    if(!boss&&(d.foreignLeft|0)>0&&left>0&&Math.random()<d.foreignLeft/left){
      // Land maps: a few ships from the sea. Sea maps: transports that carry the landing troops ashore.
      const pool=d.seaSpawns;
      if(pool&&pool.length){foreign=true;asShip=true;cargo=!!d.naval;d.foreignLeft--;}
    }
    if(left>0)d.groundLeft=left-1;
    const pool=asShip?(d.seaSpawns&&d.seaSpawns.length?d.seaSpawns:d.spawns):(d.landSpawns&&d.landSpawns.length?d.landSpawns:d.spawns);
    let si=d.spawnI;
    if(wk==="flank"&&pool.length>1){const half=Math.floor(pool.length/2);si=half+(d.spawnI%(pool.length-half));}
    const sp=pool[si%pool.length];d.spawnI++;
    let bsz=sz;
    if(boss)bsz=d.flagBoss?(asShip?18:17):15;
    const at=asShip?placeShip(d,sp.x,sp.y,bsz,null):placeTank(d,sp.x,sp.y,bsz);
    const role=role2==="rusher"||role2==="sapper"||cargo?"shield":role2?"hero":(Math.random()<0.5?"hero":"shield");
    const e={x:at.x,y:at.y,dir:2,ang:Math.PI/2,hp,maxHp:hp,sz,spd,bspd,dmg,leak,type,hull,fire:.1,think:.05,ship:asShip,foreign,role,role2,cargo,age:0};
    if(boss){
      const pm=d.profile.enemy||1;
      e.boss=true;e.role="hero";e.role2="";e.sz=bsz;
      if(d.flagBoss){e.flag=true;e.type="HEAVY";e.hull="heavy";e.hp=e.maxHp=20+bloc*4;e.spd=36*pm;e.bspd=175;e.dmg=2;e.leak=24;e.scale=1.45;e.barT=3.5;}
      else{e.type="ELITE";e.hull="elite";e.hp=e.maxHp=10+bloc*3;e.spd=70*pm;e.bspd=232;e.dmg=1;e.leak=16;e.scale=1.25;}
    }
    d.enemies.push(e);
    armSpawn(d,e);
  }
  function finishDefense(win){
    const d=S.bcDefense;if(!d||(d.done&&!(win&&d.postDone&&!d.postFinal)))return;
    if(d.postDone)d.postFinal=true;
    rememberShot(d);
    d.done=true;
    d.frozen=!!win;
    try{if(A&&A.battleMusic)A.battleMusic(false);}catch(e){}
    S.chanceMet.bcDefenseResult=win?"win":"lose";
    S.defHeld={u:0,d:0,l:0,r:0,f:0,aa:0};S.defPtr=null;
    const pad=$("def-pad");if(pad)pad.classList.add("hide");
    const aa=$("def-aa");if(aa)aa.classList.add("hide");
    if(win&&!d.postDone){
      showBattlePost(d);
      return;
    }
    if(win){
      addRuin(d);
      S.bcBattlesWon=(S.bcBattlesWon||0)+1;
      const won=S.bcBattlesWon;
      if(won%3===0)chargeRebuild();
      if(won>=9){S.bcIndependent=true;S.bcVictory=true;try{noteIndependence();}catch(e){}}
      warSfx("warWin");
      window.__arcForce=(won%3===0)?"blocTriumph":"battleWon";
      S.phase="play";
      try{dealChance();}finally{window.__arcForce="";}
      if(S.phase==="play")clearBattleField();
      return;
    }
    clearBattleField();
    S.bcAssaultAt=0;
    S.trainBattleLose=true;
    S.dead=false;
    S.ticker=chanceLang()?(nationName()+" cayó."):(nationName()+" fell.");
    try{if(A&&A.sfx&&A.sfx.die)A.sfx.die();}catch(e){}
    // Show the "Not Yet" report card first; closing it lands on the defeat / military-aid screen.
    S.bcLostPending=true;
    S.phase="play";
    window.__arcForce="notYet";
    try{dealChance();}catch(e){}finally{window.__arcForce="";}
    if(S.phase==="chance")return;
    S.bcLostPending=false;
    battleLostScreen();
  }
  function battleLostScreen(){
    if(field)field.classList.remove("is-play");
    try{setPhase("over");}catch(e){try{renderOverlay();}catch(err){}}
  }
  function hitBase(d,dmg){
    if(d.wall>0){d.wall=Math.max(0,d.wall-dmg*2);return;}
    if(d.inv>0)return;
    const resist=Math.max(0,Math.min(50,(d.up&&d.up.shield)||0));
    const before=d.integrity;
    d.integrity=Math.max(0,d.integrity-dmg*(1-resist/100));
    d.inv=0.18;
    spawnShieldBreak(d, before, d.integrity);
    warSfx("warShield");
    if(d.integrity<=0)finishDefense(false);
  }
  function igniteTree(d,tx,ty,forceKill){
    if(bcAt(d.map,tx,ty)!==4)return false;
    const i=ty*BC_C+tx;
    const burn=d.hp[i]||0;
    const cx=tx*BC_TS+BC_TS/2, cy=ty*BC_TS+BC_TS/2;
    if(forceKill||burn>=2){
      d.map[i]=6;d.hp[i]=0;
      addFx(d,{kind:"treeBurn",x:cx,y:cy,life:.48,hot:3});
      return true;
    }
    d.hp[i]=burn+1;
    addFx(d,{kind:"treeBurn",x:cx,y:cy,life:.36,hot:d.hp[i]});
    return true;
  }
  function citadelSkin(d,tx,ty){
    const t=bcAt(d.map,tx,ty);
    if(t===5)return true;
    if(t!==1)return false;
    for(let dy=-3;dy<=3;dy++)for(let dx=-3;dx<=3;dx++){
      if(bcAt(d.map,tx+dx,ty+dy)===5)return true;
    }
    return false;
  }
  function markBuildings(d){
    const n=d.map.length;
    const mark=new Uint8Array(n);
    let tiles=0;
    for(let i=0;i<n;i++){
      const t=d.map[i];
      const x=i%BC_C, y=(i/BC_C)|0;
      const house=t===1&&!d.maze&&!citadelSkin(d,x,y)&&!(d.seal&&d.seal[i]);
      if(t===9||house){mark[i]=1;tiles++;}
    }
    d.buildMark=mark;
    d.buildTiles=tiles;
  }
  function addRuin(d){
    if(!d||!d.buildMark)return;
    let gone=0;
    for(let i=0;i<d.buildMark.length;i++){
      if(!d.buildMark[i])continue;
      const t=d.map[i];
      if(t!==1&&t!==9)gone++;
    }
    S.bcRuinTiles=(S.bcRuinTiles|0)+(d.buildTiles|0);
    S.bcRuinGone=(S.bcRuinGone|0)+gone;
  }
  function chargeRebuild(){
    const tiles=S.bcRuinTiles|0;
    const gone=Math.max(0,S.bcRuinGone|0);
    const pct=tiles?Math.max(0,Math.min(100,Math.round(gone*100/tiles))):0;
    const net=Math.max(0,netUsd());
    const usd=net*Math.min(50,pct)/100; // reconstruction never takes more than half of net worth
    if(usd>0){
      const paid=payUsd(usd);
      let left=usd-paid;
      const vtPx=S.vtPrice||0;
      if(left>1e-4&&vtPx>0&&S.vt>0){
        const take=Math.min(S.vt,left/vtPx);
        S.vt=Math.max(0,S.vt-take);
      }
    }
    S.bcRebuild={pct,usd,tiles,gone};
    S.bcRuinTiles=0;
    S.bcRuinGone=0;
  }
  function rebuildShort(){
    const b=S.bcRebuild;
    const es=chanceLang();
    if(!b)return "";
    if((b.pct|0)<=0)return es?"Sin daños que reconstruir.":"No damage to rebuild.";
    return (es?"Reconstrucción: ":"Rebuilding: ")+costLabel(b.usd||0)+".";
  }
  function rebuildNote(){
    const b=S.bcRebuild;
    const es=chanceLang();
    if(!b)return "";
    const pct=b.pct|0;
    if(pct<=0){
      return es
        ? "Después de las tres batallas, las casas y el faro siguen en pie. No hay nada que reconstruir."
        : "After all three battles, the houses and the lighthouse are still standing. There is nothing to rebuild.";
    }
    const label=costLabel(b.usd||0);
    return es
      ? "Las tres batallas destruyeron el "+pct+"% de las casas y el faro. Reconstruir cuesta ese mismo porcentaje del patrimonio (máximo 50%): "+label+", ya descontado."
      : "The three battles destroyed "+pct+"% of the houses and the lighthouse. Rebuilding costs the same share of your net worth (capped at 50%): "+label+", already paid.";
  }
  function groundUnder(d,i){
    if(d.bedSet&&d.bedSet[i])return d.bed[i]===0?0:6;
    return 6;
  }
  function layRubble(d,i,kind){
    d.map[i]=groundUnder(d,i);
    d.hp[i]=0;
    if(!d.rubble)d.rubble=new Uint8Array(d.map.length);
    d.rubble[i]=kind||1;
  }
  function smashTile(d,tx,ty,dmg,friendly,dx,dy){
    const t=bcAt(d.map,tx,ty);
    if(t===5){
      if(friendly)return false;
      hitBase(d,10);return true;
    }
    if(t===4){
      const kill=!!(friendly&&(d.shotTier|0)>=3);
      igniteTree(d,tx,ty,kill);
      if(friendly&&(d.shotTier|0)>=2&&(dx||dy)){
        const p=d.player;
        const alongX=Math.abs(dx)>=Math.abs(dy);
        const perp=alongX?(p?p.y:ty*BC_TS+8):(p?p.x:tx*BC_TS+8);
        const hw=(p&&p.sz||13)*0.4+8;
        const a0=Math.floor((perp-hw)/BC_TS), a1=Math.floor((perp+hw)/BC_TS);
        for(let a=a0;a<=a1;a++){
          const x=alongX?tx:a, y=alongX?a:ty;
          if((x!==tx||y!==ty)&&bcAt(d.map,x,y)===4)igniteTree(d,x,y,kill);
        }
      }
      warSfx(bcAt(d.map,tx,ty)===4?"warHit":"warBrick");
      return true;
    }
    if(t===2||t===9){
      if(friendly&&(d.shotTier|0)>=3&&t!==9&&!d.fortSteel){
        const i=ty*BC_C+tx;
        d.map[i]=6;
        if(d.seal)d.seal[i]=0;
        warSfx("warBrick");
        return true;
      }
      warSfx("warClank");return true;
    }
    if(t===8){
      let wet=0;
      for(const [ox,oy] of [[1,0],[-1,0],[0,1],[0,-1]])if(bcAt(d.map,tx+ox,ty+oy)===3)wet++;
      if(wet>=2)return false;
      if(friendly&&(d.shotTier|0)>=3){
        const i=ty*BC_C+tx;
        d.map[i]=6;
        if(d.seal)d.seal[i]=0;
        warSfx("warBrick");
        return true;
      }
      warSfx("warClank");
      return true;
    }
    if(t===1){
      const i=ty*BC_C+tx;
      d.hp[i]=Math.max(0,(d.hp[i]||0)-1);
      if(d.hp[i]<=0){
        if(citadelSkin(d,tx,ty)||(d.seal&&d.seal[i]))d.map[i]=6;
        else layRubble(d,i);
        warSfx("warBrick");
        return true;
      }
      warSfx("warHit");
      return true;
    }
    if(t===7){
      if(!(friendly&&(d.shotTier|0)>=3)||!(dx||dy))return false;
      const ns=bcAt(d.map,tx,ty-1)===3&&bcAt(d.map,tx,ty+1)===3;
      const ew=bcAt(d.map,tx-1,ty)===3&&bcAt(d.map,tx+1,ty)===3;
      if(!ns&&!ew)return false;
      const across=(ns&&Math.abs(dy)>=Math.abs(dx))||(ew&&Math.abs(dx)>Math.abs(dy));
      if(!across)return false;
      const i=ty*BC_C+tx;
      d.map[i]=3;
      if(d.hp)d.hp[i]=0;
      if(d.seal)d.seal[i]=0;
      warSfx("warCrack");
      return true;
    }
    return false;
  }
  function warSfx(name){try{if(A&&A.sfx&&A.sfx[name])A.sfx[name]();}catch(e){}}
  function facePoint(e,x,y){faceVec(e,x-e.x,y-e.y);}
  function aimDir(e,dir){
    if(dir<0||!e)return false;
    if(!BATTLE_360&&!e.hero&&(e.dir|0)!==(dir|0)){
      if((e.turnCd||0)>0)return false;
      e.turnCd=0.1;
    }
    const turned=e.dir!==dir;
    e.dir=dir;
    const v=dirVec(dir);
    e.ang=Math.atan2(v[1],v[0]);
    if(turned)e.fire=Math.max(e.fire||0,0.05);
    return true;
  }
  function openStep(d,e,dir){
    const s=12;
    const x=e.x+(dir===1?s:dir===3?-s:0), y=e.y+(dir===2?s:dir===0?-s:0);
    return e.ship?!shipBlocked(d,x,y,e.sz,e):!tankBlocked(d,x,y,e.sz,e);
  }
  function laneCenter(d,e){
    const blocked=e.ship?(x,y)=>shipBlocked(d,x,y,e.sz,e):(x,y)=>tankBlocked(d,x,y,e.sz,e);
    if(e.dir===1||e.dir===3){
      const c=Math.floor(e.y/BC_TS)*BC_TS+8;
      const ny=e.y+Math.sign(c-e.y)*Math.min(10,Math.abs(c-e.y));
      if(Math.abs(ny-e.y)>0.4&&!blocked(e.x,ny))e.y=ny;
    }else if(e.dir===0||e.dir===2){
      const c=Math.floor(e.x/BC_TS)*BC_TS+8;
      const nx=e.x+Math.sign(c-e.x)*Math.min(10,Math.abs(c-e.x));
      if(Math.abs(nx-e.x)>0.4&&!blocked(nx,e.y))e.x=nx;
    }
  }
  function nearestWalk(d,e,gx,gy){
    const ok=(t)=>e.ship?t===3:(t===0||t===6||t===7);
    let best=null,bd=1e9;
    const tx0=Math.floor(gx/BC_TS),ty0=Math.floor(gy/BC_TS);
    for(let r=0;r<16;r++){
      for(let dy=-r;dy<=r;dy++)for(let dx=-r;dx<=r;dx++){
        if(r&&Math.abs(dx)!==r&&Math.abs(dy)!==r)continue;
        const x=tx0+dx,y=ty0+dy;
        if(x<0||y<0||x>=BC_C||y>=BC_R||!ok(bcAt(d.map,x,y)))continue;
        const dist=dx*dx+dy*dy;
        if(dist<bd){bd=dist;best={x,y};}
      }
      if(best&&r>1)break;
    }
    return best;
  }
  function gridRoute(d,e,goal,allowTree){
    const pass=(t)=>e.ship?t===3:(t===0||t===6||t===7||(allowTree&&(t===4||(t===1&&!d.maze))));
    const sx=Math.max(0,Math.min(BC_C-1,Math.floor(e.x/BC_TS)));
    const sy=Math.max(0,Math.min(BC_R-1,Math.floor(e.y/BC_TS)));
    // No passable tile near the goal (e.g. an inland fort for a ship): aim the search at the goal tile itself
    // and let the closest-reachable fallback below bring the unit as near as it can get.
    const dest=nearestWalk(d,e,goal.x,goal.y)||{x:Math.max(0,Math.min(BC_C-1,Math.floor(goal.x/BC_TS))),y:Math.max(0,Math.min(BC_R-1,Math.floor(goal.y/BC_TS)))};
    const W=BC_C,start=sy*W+sx,destI=dest.y*W+dest.x;
    if(start===destI)return {dir:e.dir,len:0,tree:false,trees:0,wx:goal.x,wy:goal.y};
    const prev=new Int16Array(W*BC_R);
    prev.fill(-1);
    const q=[start];
    prev[start]=start;
    let found=-1,near=-1,nearD=1e9;
    for(let qi=0;qi<q.length;qi++){
      const cur=q[qi];
      if(cur===destI){found=cur;break;}
      {const ddx=(cur%W)-dest.x,ddy=((cur/W)|0)-dest.y,dd=ddx*ddx+ddy*ddy;if(dd<nearD){nearD=dd;near=cur;}}
      const cx=cur%W,cy=(cur/W)|0;
      const steps=BATTLE_360?[[1,0],[-1,0],[0,1],[0,-1],[1,1],[1,-1],[-1,1],[-1,-1]]:[[1,0],[-1,0],[0,1],[0,-1]];
      for(const [dx,dy] of steps){
        const nx=cx+dx,ny=cy+dy;
        if(nx<0||ny<0||nx>=W||ny>=BC_R)continue;
        const ni=ny*W+nx;
        if(prev[ni]!==-1||!pass(bcAt(d.map,nx,ny)))continue;
        if(dx&&dy&&(!pass(bcAt(d.map,cx+dx,cy))||!pass(bcAt(d.map,cx,cy+dy))))continue;
        prev[ni]=cur;q.push(ni);
      }
    }
    // Goal unreachable (e.g. a ship whose water does not touch the fort): head for the closest reachable tile
    // instead of returning null and ramming the old heading.
    if(found<0){if(near<0||near===start)return null;found=near;}
    const path=[];
    let cur=found,guard=0;
    while(cur!==start&&guard++<500){path.push(cur);cur=prev[cur];}
    path.reverse();
    const next=path[0];
    const nx=next%W,ny=(next/W)|0;
    let trees=0;
    for(const c of path){const pt=bcAt(d.map,c%W,(c/W)|0);if(pt===4)trees++;else if(pt===1)trees+=3;}
    const dir=vecDir(nx-sx,ny-sy);
    const nt=bcAt(d.map,nx,ny);
    return {dir:dir<0?e.dir:dir,len:path.length,tree:nt===4||nt===1,trees,wx:nx*BC_TS+BC_TS/2,wy:ny*BC_TS+BC_TS/2};
  }
  // True when a tank/ship can actually drive the straight segment toward (x,y), not just see it.
  function driveClear(d,e,x,y){
    const dist=Math.hypot(x-e.x,y-e.y);
    const reach=Math.min(dist,96);
    if(reach<4)return true;
    const n=Math.ceil(reach/8);
    for(let i=1;i<=n;i++){
      const px=e.x+(x-e.x)*(reach/dist)*i/n, py=e.y+(y-e.y)*(reach/dist)*i/n;
      const t=bcAt(d.map,Math.floor(px/BC_TS),Math.floor(py/BC_TS));
      if(e.ship?t!==3:!(t===0||t===6||t===7))return false;
    }
    return true;
  }
  function nearHouse(d,e,r){
    if(d.maze)return null;
    const tx0=Math.floor(e.x/BC_TS),ty0=Math.floor(e.y/BC_TS),R=Math.ceil(r/BC_TS);
    let best=null,bd=r*r;
    for(let y=ty0-R;y<=ty0+R;y++)for(let x=tx0-R;x<=tx0+R;x++){
      if(bcAt(d.map,x,y)!==1||citadelSkin(d,x,y)||(d.seal&&d.seal[y*BC_C+x]))continue;
      const cx=x*BC_TS+8,cy=y*BC_TS+8,dd=(cx-e.x)**2+(cy-e.y)**2;
      if(dd>=bd)continue;
      const L=Math.sqrt(dd)||1,ex=cx-(cx-e.x)/L*10,ey=cy-(cy-e.y)/L*10;
      if(!los(d,e,ex,ey))continue;
      bd=dd;best={x:cx,y:cy};
    }
    return best;
  }
  function pathDir(d,e,goal){
    e.fell=false;
    const plain=gridRoute(d,e,goal,false);
    let pick=plain;
    if(!e.ship){
      const cut=gridRoute(d,e,goal,true);
      const worth=cut&&(!plain||(plain.len-cut.len)>4+cut.trees*3);
      if(worth){pick=cut;if(cut.tree)e.fell=true;}
      else if(!plain&&cut){pick=cut;if(cut.tree)e.fell=true;}
    }
    if(pick&&pick.wx!=null)e.aimAt={x:pick.wx,y:pick.wy};
    return pick?pick.dir:e.dir;
  }
  function sortTraffic(d){
    const live=[];
    const goal=d.fort||d.home||{x:0,y:0};
    for(const e of d.enemies)if(unitAlive(e)&&e.type!=="HELI")live.push(e);
    for(let i=0;i<live.length;i++){
      for(let j=i+1;j<live.length;j++){
        const a=live[i], b=live[j];
        const dist=Math.hypot(a.x-b.x,a.y-b.y);
        const need=(a.sz+b.sz)*0.92;
        if(dist>need)continue;
        if((a.jam||0)<0.1&&(b.jam||0)<0.1&&dist>need*0.7)continue;
        const da=Math.hypot(a.x-goal.x,a.y-goal.y), db=Math.hypot(b.x-goal.x,b.y-goal.y);
        const lead=da<=db?a:b, back=lead===a?b:a;
        if((back.backup||0)>0.15)continue;
        back.backup=0.55;
        back.slip=lead;
        back.jam=0;
        if(lead.slip===back)lead.slip=null;
      }
    }
  }
  // ---------- Battle feel: juice, waves, bosses, combo, perks, report ----------
  function liteFx(){return LOW_END||perfEma>26;}
  function bShake(d,a){if(!d||liteFx())return;d.shake=Math.min(9,Math.max(d.shake||0,a));}
  function bBuzz(ms){try{if(!KB_DESK&&navigator.vibrate)navigator.vibrate(ms);}catch(e){}}
  function AIM_ASSIST(){return !KB_DESK;}
  function assistTarget(d){
    const p=d.player;let best=null,bs=1e9;
    const fa=heading(p);
    for(const e of d.enemies){
      if(e.hp<=0||(e.spawn||0)>0||e.type==="HELI")continue;
      const dx=e.x-p.x,dy=e.y-p.y,dist=Math.hypot(dx,dy);
      if(dist>230)continue;
      const da=Math.abs(Math.atan2(Math.sin(Math.atan2(dy,dx)-fa),Math.cos(Math.atan2(dy,dx)-fa)));
      if(da>0.62||!los(d,p,e.x,e.y))continue; // ~35° cone: it helps the aim, it does not aim for you
      const sc=dist*(1+da);
      if(sc<bs){bs=sc;best=e;}
    }
    return best;
  }
  function waveKind(d){return (d&&d.wavePlan&&d.wavePlan[(d.wave|0)-1])||"";}
  function planWaves(d){
    const n=(d.level%3===2)?4:3;
    d.flagBoss=(d.level%3===2);
    const kinds=n===4?["rush","column","flank","assault"]:["rush","column","flank"];
    const share=n===4?[.22,.26,.24,.28]:[.3,.34,.36];
    // Waves replace the old slow trickle: same enemy mix, ~40% more bodies so a battle lasts ~1-2 minutes.
    const total=Math.max(n,Math.round((d.groundTotal|0)*1.55)+4);
    const q=share.map(x=>Math.max(1,Math.round(total*x)));
    q[n-1]=Math.max(1,total-q.slice(0,n-1).reduce((a,b)=>a+b,0));
    d.enemyTotal=total+(d.heliLeft|0);d.groundLeft=total;d.foreignLeft=Math.max(1,Math.round(total*0.12));
    d.wavePlan=kinds;d.waveQ=q;d.waves=n;d.wave=1;d.quota=q[0];d.spawned=0;
    d.combo=0;d.comboT=0;d.bestCombo=0;d.heartsLost=0;d.debris=[];d.marks=[];
    startWave(d,true);
  }
  const WAVE_NAMES={rush:["Rush","Asalto rápido"],column:["Heavy column","Columna pesada"],flank:["Flank attack","Ataque por el flanco"],assault:["Final assault","Asalto final"]};
  function startWave(d,first){
    d.lull=first?1.2:3;
    d.armor=1;
    const es=chanceLang();
    const nm=WAVE_NAMES[waveKind(d)]||["",""];
    d.banner={t:0,life:first?2.2:2.8,txt:(es?"OLEADA ":"WAVE ")+d.wave+"/"+d.waves,sub:nm[es?1:0]+(d.wave===d.waves?(es?" · JEFE AL FINAL":" · BOSS AT THE END"):"")};
    if(!first)warSfx("warWave");
  }
  const PERKS=[
    {id:"heart",max:2,en:["+1 heart","Start every battle with one more heart."],es:["+1 corazón","Empiezas cada batalla con un corazón más."]},
    {id:"fury",max:2,en:["Quick fury","Fury recharges 30% faster."],es:["Furia rápida","La Furia recarga un 30% más rápido."]},
    {id:"double",max:1,en:["Double shot","Start every battle with double shot (S2)."],es:["Disparo doble","Empiezas cada batalla con disparo doble (S2)."]},
    {id:"ricochet",max:1,en:["Ricochet","Your shells bounce once off walls and rocks."],es:["Rebote","Tus balas rebotan una vez en muros y rocas."]},
    {id:"mine",max:1,en:["Mines","You drop a mine every 5 s (up to 3)."],es:["Minas","Sueltas una mina cada 5 s (máx. 3)."]},
    {id:"regen",max:1,en:["Regenerating shield","The shield repairs 1.2% per second."],es:["Escudo regenerativo","El escudo se repara un 1,2% por segundo."]},
    {id:"ammo",max:1,en:["Endless belt","No ammo limit: fire without reloading."],es:["Cinta infinita","Sin límite de munición: disparas sin recargar."]},
    {id:"militia",max:1,en:["Village militia","Villages shoot at nearby enemies."],es:["Milicia","Las aldeas disparan a los enemigos cercanos."]}
  ];
  function applyBattlePerks(d){
    const k=S.bcPerks||(S.bcPerks={});
    const p=d.player;
    if(k.heart){p.maxHearts=Math.min(6,(p.maxHearts||3)+(k.heart|0));p.hearts=p.maxHearts;p.hp=p.maxHearts;}
    d.furyMul=Math.pow(0.7,k.fury|0);
    if(k.double)d.shotTier=Math.max(2,d.shotTier|0);
    d.rico=k.ricochet?1:0;
    d.infAmmo=!!k.ammo;d.ammo=AMMO_MAX;d.reloadT=0;
    d.mines=k.mine?[]:null;d.mineT=3;
    d.regen=k.regen?1.2:0;
    d.militia=null;
    if(k.militia&&d.buildMark){
      const spots=[];
      for(let i=0;i<d.buildMark.length;i++){
        if(!d.buildMark[i]||d.map[i]!==1)continue;
        const x=(i%BC_C)*BC_TS+8,y=((i/BC_C)|0)*BC_TS+8;
        if(spots.some(o=>Math.hypot(o.x-x,o.y-y)<48))continue;
        spots.push({x,y,i});
      }
      d.militia=spots.slice(0,8);d.milT=2;
    }
  }
  function dmgEnemy(d,e,n){
    if(!e||e.hp<=0||(e.spawn||0)>0)return;
    e.hp-=n;e.hurt=1;
    if(e.boss&&!e.phase2&&e.hp>0&&e.hp<=e.maxHp/2){
      // Boss phase 2 at half health: a bit faster, and it calls two escorts.
      e.phase2=1;e.spd*=1.15;e.bspd=(e.bspd||180)*1.1;
      const adds=d.flagBoss?2:1;
      for(let i=0;i<adds;i++){try{defenseEnemy(d);d.enemyTotal=(d.enemyTotal|0)+1;}catch(err){}}
      d.banner={t:0,life:1.8,txt:chanceLang()?"¡REFUERZOS!":"REINFORCEMENTS!",sub:""};
      bShake(d,4);warSfx("warWave");
    }
    if(e.hp<=0){d.kills++;warSfx("warPop");}
  }
  function hurtHero(d,n){
    const p=d.player;
    if(d.god>0||d.playerInv>0)return false;
    if(d.armor>0){
      d.armor=0;d.playerInv=1.2;
      addFx(d,{kind:"eat",x:p.x,y:p.y,life:.6,col:"#9fd0ff",label:chanceLang()?"BLINDAJE":"ARMOR"});
      bShake(d,3);bBuzz(25);warSfx("warClank");
      return false;
    }
    const before=p.hearts|0;
    p.hearts=Math.max(0,before-n);
    d.heartsLost=(d.heartsLost|0)+(before-p.hearts);
    rememberShot(d);
    warSfx("warHurt");
    bShake(d,6);bBuzz(70);d.hitstop=.06;d.hurtT=.35;
    if(p.hearts<=0){finishDefense(false);return true;}
    d.playerInv=0.9;
    return false;
  }
  function onKill(d,e){
    if(!d.infAmmo&&d.ammo!=null&&!(d.reloadT>0))d.ammo=Math.min(AMMO_MAX,(d.ammo|0)+(e.boss?6:2));
    const lite=liteFx();
    const heavy=e.hull==="heavy"||e.type==="HEAVY";
    addFx(d,{kind:"boom",x:e.x,y:e.y,life:e.boss?.9:.5,r:e.boss?48:heavy?28:20});
    if(!d.debris)d.debris=[];
    const nd=lite?2:e.boss?18:heavy?9:6;
    for(let i=0;i<nd;i++){
      const a=Math.random()*Math.PI*2,sp=50+Math.random()*(e.boss?160:100);
      d.debris.push({x:e.x,y:e.y,vx:Math.cos(a)*sp,vy:Math.sin(a)*sp,rot:Math.random()*6,vr:(Math.random()-.5)*10,t:0,life:.45+Math.random()*.4,col:i%3?"#3a3a34":"#ff9a2a",s:e.boss?4:2.6});
    }
    if(d.debris.length>80)d.debris.splice(0,d.debris.length-80);
    bShake(d,e.boss?9:heavy?4:2.5);
    d.hitstop=Math.max(d.hitstop||0,e.boss?.14:.035);
    bBuzz(e.boss?140:15);
    if(e.boss){
      d.banner={t:0,life:2.2,txt:chanceLang()?"¡JEFE DERROTADO!":"BOSS DOWN!",sub:""};
      d.slow=Math.max(d.slow||0,1.2);
    }
    if(e.rammed)return;
    d.combo=(d.comboT>0?(d.combo|0):0)+1;d.comboT=2.5;
    d.bestCombo=Math.max(d.bestCombo|0,d.combo);
    const p=d.player,es=chanceLang();
    if(d.combo===3){d.boostT=6;addFx(d,{kind:"eat",x:p.x,y:p.y,life:.7,col:"#7fd0ff",label:es?"COMBO x3 · DISPARO+":"COMBO x3 · SHOT+"});warSfx("warPick");}
    else if(d.combo===5){d.lrmCd=0;d.quickFury=1;addFx(d,{kind:"eat",x:p.x,y:p.y,life:.8,col:"#ffe14a",label:es?"COMBO x5 · FURIA LISTA":"COMBO x5 · FURY READY"});warSfx("warAa");}
  }
  function escortLead(d,e){
    let best=null,bd=220;
    for(const o of d.enemies){
      if(o===e||o.hp<=0||!(o.boss||o.type==="HEAVY")||o.ship!==e.ship)continue;
      const q=Math.hypot(o.x-e.x,o.y-e.y);if(q<bd){bd=q;best=o;}
    }
    return best;
  }
  function tryUnload(d,e){
    e.unT=(e.unT||0)-1/60;
    if(e.age<3||e.unT>0)return;
    e.unT=.5;
    let at=placeTank(d,e.x,e.y,13);
    let ok=!tankBlocked(d,at.x,at.y,13,null)&&Math.hypot(at.x-e.x,at.y-e.y)<=64;
    if(!ok&&e.age>14&&d.landSpawns&&d.landSpawns.length){
      let ls=d.landSpawns[0],bd=1e9;for(const o of d.landSpawns){const q=Math.hypot(o.x-e.x,o.y-e.y);if(q<bd){bd=q;ls=o;}}
      at=placeTank(d,ls.x,ls.y,13);ok=!tankBlocked(d,at.x,at.y,13,null);
    }
    if(!ok)return;
    // The transport beaches and its landing troop rolls ashore (same unit, so the troop count is unchanged).
    addFx(d,{kind:"eat",x:at.x,y:at.y,life:.7,col:"#ffe14a",label:chanceLang()?"DESEMBARCO":"LANDING"});
    e.ship=false;e.cargo=false;e.x=at.x;e.y=at.y;e.sz=13;e.hull="medium";e.type="STANDARD";e.hp=Math.max(e.hp,2);e.maxHp=2;
    e.spd=62*(d.profile.enemy||1);e.navAt=null;e.aimAt=null;e.think=0;e.wdX=null;
    warSfx("warSpawn");
  }
  function bossBarrage(d,e,dt){
    if((e.spawn||0)>0)return;
    e.barT=(e.barT||4)-dt;
    if(e.barT>0)return;
    e.barT=4.5;
    const p=d.player;
    for(let i=0;i<3;i++){
      const a=Math.random()*Math.PI*2,r=i?14+Math.random()*24:0;
      d.marks.push({x:p.x+Math.cos(a)*r,y:p.y+Math.sin(a)*r,t:1.1,life:1.1});
    }
    warSfx("warCharge");
  }
  function battleTick(d,dt){
    const p=d.player;
    if(d.comboT>0){d.comboT-=dt;if(d.comboT<=0)d.combo=0;}
    if(d.boostT>0)d.boostT-=dt;
    if(d.hurtT>0)d.hurtT-=dt;
    if(d.banner){d.banner.t+=dt;if(d.banner.t>d.banner.life)d.banner=null;}
    if(d.debris&&d.debris.length){
      for(const b of d.debris){b.t+=dt;b.x+=b.vx*dt;b.y+=b.vy*dt;b.vx*=.92;b.vy*=.92;b.rot+=b.vr*dt;}
      d.debris=d.debris.filter(b=>b.t<b.life);
    }
    if(d.marks&&d.marks.length){
      for(const m of d.marks){
        m.t-=dt;
        if(m.t<=0&&!m.done){
          m.done=1;
          addFx(d,{kind:"boom",x:m.x,y:m.y,life:.45,r:24});bShake(d,4);warSfx("warBoom");
          if(Math.hypot(p.x-m.x,p.y-m.y)<20){if(hurtHero(d,1))return;}
          const c=shieldCenter(d);if(Math.hypot(c.x-m.x,c.y-m.y)<30)hitBase(d,6);
        }
      }
      d.marks=d.marks.filter(m=>!m.done);
    }
    if(d.regen&&d.integrity>0&&d.integrity<100)d.integrity=Math.min(100,d.integrity+d.regen*dt);
    if(d.mines){
      d.mineT-=dt;
      if(d.mineT<=0){d.mineT=5;if(d.mines.length<3){d.mines.push({x:p.x,y:p.y,arm:.8});warSfx("warPick");}}
      for(const m of d.mines){
        if(m.arm>0){m.arm-=dt;continue;}
        if(m.boom)continue;
        const hit=d.enemies.find(e=>e.hp>0&&!(e.spawn>0)&&e.type!=="HELI"&&Math.hypot(e.x-m.x,e.y-m.y)<(e.sz||12)+6);
        if(hit){
          m.boom=1;
          for(const e of d.enemies)if(e.type!=="HELI"&&Math.hypot(e.x-m.x,e.y-m.y)<40)dmgEnemy(d,e,2);
          addFx(d,{kind:"boom",x:m.x,y:m.y,life:.5,r:40});bShake(d,4);warSfx("warBoom");
        }
      }
      d.mines=d.mines.filter(m=>!m.boom);
    }
    if(d.militia&&d.militia.length){
      d.milT-=dt;
      if(d.milT<=0){
        d.milT=2.2;
        for(const h of d.militia){
          if(d.map[h.i]!==1)continue;
          let best=null,bd=95;
          for(const e of d.enemies){if(e.hp<=0||(e.spawn||0)>0||e.type==="HELI")continue;const q=Math.hypot(e.x-h.x,e.y-h.y);if(q<bd){bd=q;best=e;}}
          if(!best)continue;
          addFx(d,{kind:"tracer",x:h.x,y:h.y,x2:best.x,y2:best.y,life:.18});
          if(Math.random()<.6){best.shots=(best.shots|0)+1;dmgEnemy(d,best,1);if(best.hp>0&&!best.boss&&woundKill(best)){best.hp=0;d.kills++;}}
        }
      }
    }
  }
  function drawEnemyMarks(ctx,d,e,t){
    if(e.cargo){ctx.fillStyle="#c9a24a";ctx.fillRect(e.x-4,e.y-4,8,8);ctx.strokeStyle="#3a2a10";ctx.lineWidth=1;ctx.strokeRect(e.x-4,e.y-4,8,8);}
    if(e.boss){
      ctx.save();ctx.strokeStyle="rgba(255,214,90,.8)";ctx.lineWidth=1.6;ctx.setLineDash([4,3]);
      ctx.beginPath();ctx.arc(e.x,e.y,(e.sz||14)*1.35+4,0,Math.PI*2);ctx.stroke();ctx.restore();
    }
    if((e.tele||0)>0){
      const v=aimVec(e),r=(e.sz||12)*(e.scale||1)+5;
      const mx=e.x+v[0]*r,my=e.y+v[1]*r;
      const k=Math.sin(t*40)*.25+.75;
      ctx.save();
      if(e.role2==="sniper"){
        ctx.strokeStyle="rgba(255,60,60,"+(0.55*k).toFixed(2)+")";ctx.lineWidth=1;
        ctx.beginPath();ctx.moveTo(mx,my);ctx.lineTo(mx+v[0]*240,my+v[1]*240);ctx.stroke();
      }
      ctx.fillStyle="rgba(255,120,40,"+(0.5*k).toFixed(2)+")";
      ctx.beginPath();ctx.arc(mx,my,7,0,Math.PI*2);ctx.fill();
      ctx.fillStyle="rgba(255,240,180,"+k.toFixed(2)+")";
      ctx.beginPath();ctx.arc(mx,my,3,0,Math.PI*2);ctx.fill();
      ctx.restore();
    }
  }
  function drawBattleJuice(ctx,d,t){
    const p=d.player;
    if(d.mines)for(const m of d.mines){
      ctx.fillStyle=m.arm>0?"#6b6b60":"#2b2b26";ctx.beginPath();ctx.arc(m.x,m.y,4,0,Math.PI*2);ctx.fill();
      ctx.fillStyle=m.arm>0||Math.floor(t*4)%2?"#e23b3b":"#5a1a14";ctx.fillRect(m.x-1,m.y-1,2,2);
    }
    if(d.debris)for(const b of d.debris){
      ctx.save();ctx.translate(b.x,b.y);ctx.rotate(b.rot);ctx.globalAlpha=Math.max(0,1-b.t/b.life);
      ctx.fillStyle=b.col;ctx.fillRect(-b.s,-b.s*.6,b.s*2,b.s*1.2);ctx.restore();
    }
    if(d.marks)for(const m of d.marks){
      const u=1-m.t/m.life;
      ctx.save();ctx.strokeStyle="rgba(226,59,59,.9)";ctx.lineWidth=2;
      ctx.beginPath();ctx.arc(m.x,m.y,20,0,Math.PI*2);ctx.stroke();
      ctx.fillStyle="rgba(226,59,59,"+(0.12+u*0.3).toFixed(2)+")";
      ctx.beginPath();ctx.arc(m.x,m.y,20*u,0,Math.PI*2);ctx.fill();
      ctx.beginPath();ctx.moveTo(m.x-6,m.y);ctx.lineTo(m.x+6,m.y);ctx.moveTo(m.x,m.y-6);ctx.lineTo(m.x,m.y+6);ctx.stroke();
      ctx.restore();
    }
    if(d.armor>0&&!d.done){
      ctx.save();ctx.strokeStyle="rgba(159,208,255,.65)";ctx.lineWidth=1.5;
      ctx.beginPath();ctx.arc(p.x,p.y,(p.sz||13)+5,0,Math.PI*2);ctx.stroke();ctx.restore();
    }
    if(d.assistTgt&&d.assistTgt.hp>0&&!d.aaArmed){
      const a=d.assistTgt;
      ctx.save();ctx.strokeStyle="rgba(255,225,74,.7)";ctx.lineWidth=1.2;
      const r=(a.sz||12)*(a.scale||1)+4;
      ctx.beginPath();
      ctx.moveTo(a.x-r,a.y-r+4);ctx.lineTo(a.x-r,a.y-r);ctx.lineTo(a.x-r+4,a.y-r);
      ctx.moveTo(a.x+r-4,a.y-r);ctx.lineTo(a.x+r,a.y-r);ctx.lineTo(a.x+r,a.y-r+4);
      ctx.moveTo(a.x-r,a.y+r-4);ctx.lineTo(a.x-r,a.y+r);ctx.lineTo(a.x-r+4,a.y+r);
      ctx.moveTo(a.x+r-4,a.y+r);ctx.lineTo(a.x+r,a.y+r);ctx.lineTo(a.x+r,a.y+r-4);
      ctx.stroke();ctx.restore();
    }
  }
  function drawBattleHud2(ctx,d,t){
    const es=chanceLang(),p=d.player;
    // low-HP vignette + hurt flash
    if(!d.done&&((p.hearts|0)<=1||d.hurtT>0)&&!liteFx()){
      const k=(p.hearts|0)<=1?0.28+0.12*Math.sin(t*5):0;
      const a=Math.max(k,(d.hurtT||0)*1.1);
      const g=ctx.createRadialGradient(S.W/2,S.H/2,Math.min(S.W,S.H)*0.32,S.W/2,S.H/2,Math.max(S.W,S.H)*0.62);
      g.addColorStop(0,"rgba(180,0,0,0)");g.addColorStop(1,"rgba(180,0,0,"+Math.min(.6,a).toFixed(2)+")");
      ctx.fillStyle=g;ctx.fillRect(0,0,S.W,S.H);
    }
    // wave counter
    ctx.save();
    ctx.textAlign="right";ctx.textBaseline="alphabetic";ctx.font='700 11px "IBM Plex Mono",monospace';
    if(d.waves)paintHaloText(ctx,(es?"OLEADA ":"WAVE ")+Math.min(d.wave,d.waves)+"/"+d.waves,S.W-12,94,"#ffe14a");
    // boss bar
    const boss=d.enemies.find(e=>e.boss&&e.hp>0);
    if(boss){
      const w=Math.min(220,S.W*0.6),x=(S.W-w)/2,y=44;
      ctx.fillStyle="rgba(10,8,4,.75)";ctx.fillRect(x-2,y-2,w+4,10);
      ctx.fillStyle="#e23b3b";ctx.fillRect(x,y,w*Math.max(0,boss.hp/boss.maxHp),6);
      ctx.textAlign="center";ctx.font='700 10px "IBM Plex Mono",monospace';
      paintHaloText(ctx,boss.flag?(es?(d.naval?"CRUCERO INSIGNIA":"TANQUE INSIGNIA"):(d.naval?"FLAGSHIP CRUISER":"FLAGSHIP TANK")):(es?"ÉLITE":"ELITE"),S.W/2,y+20,"#fff1c4");
    }
    // combo
    if((d.combo|0)>=2&&d.comboT>0){
      ctx.textAlign="center";ctx.font='800 '+(14+Math.min(6,d.combo))+'px "IBM Plex Mono",monospace';
      ctx.globalAlpha=Math.min(1,d.comboT/0.6);
      paintHaloText(ctx,"COMBO x"+d.combo,S.W/2,boss?84:66,d.combo>=5?"#ffe14a":d.combo>=3?"#7fd0ff":"#f3efe6");
      ctx.globalAlpha=1;
    }
    // banner
    const b=d.banner;
    if(b){
      const u=b.t/b.life,a=u<.15?u/.15:u>.8?(1-u)/.2:1;
      ctx.globalAlpha=Math.max(0,a);
      ctx.fillStyle="rgba(10,8,4,.6)";ctx.fillRect(0,S.H*0.36-30,S.W,b.sub?58:44);
      ctx.textAlign="center";ctx.font='800 24px "IBM Plex Mono",monospace';
      paintHaloText(ctx,b.txt,S.W/2,S.H*0.36,"#ffe14a");
      if(b.sub){ctx.font='700 12px "IBM Plex Mono",monospace';paintHaloText(ctx,b.sub,S.W/2,S.H*0.36+20,"#f3efe6");}
      ctx.globalAlpha=1;
    }
    ctx.restore();
  }
  function battleStars(r){return 1+(r.shield>=60&&r.villages>=60?1:0)+(r.lost<=1?1:0);}
  function bcPostHide(){const el=$("bc-post");if(el)el.remove();}
  function showBattlePost(d){
    const es=chanceLang();
    let up=0;
    if(d.buildMark){for(let i=0;i<d.buildMark.length;i++)if(d.buildMark[i]&&(d.map[i]===1||d.map[i]===9))up++;}
    const villages=d.buildTiles?Math.round(up*100/d.buildTiles):100;
    const r={time:d.t||0,kills:d.kills|0,total:d.enemyTotal|0,shield:Math.round(d.integrity),villages,combo:d.bestCombo|0,lost:d.heartsLost|0};
    const stars=battleStars(r);
    const btc=stars, army=stars;
    S.btc=(S.btc||0)+btc;
    S.bcArmy=Math.min(100,(S.bcArmy||0)+army);
    d.report=r;d.stars=stars;
    const final=((S.bcBattlesWon||0)+1)>=9;
    const own=S.bcPerks||(S.bcPerks={});
    const pool=PERKS.filter(k=>(own[k.id]|0)<k.max);
    const pick=[];
    while(pick.length<3&&pool.length)pick.push(pool.splice((Math.random()*pool.length)|0,1)[0]);
    d.perkOffer=final?[]:pick;
    const mm=Math.floor(r.time/60),ss=String(Math.floor(r.time%60)).padStart(2,"0");
    const star="★".repeat(stars)+"☆".repeat(3-stars);
    const row=(a,b)=>"<div class=\"bp-row\"><span>"+a+"</span><b>"+b+"</b></div>";
    let h="<div class=\"bp-box\"><p class=\"bp-title\">"+(es?"VICTORIA":"VICTORY")+"</p><p class=\"bp-stars\">"+star+"</p>"
      +row(es?"Tiempo":"Time",mm+":"+ss)+row(es?"Bajas":"Kills",r.kills+"/"+r.total)+row(es?"Escudo":"Shield",r.shield+"%")
      +row(es?"Aldeas en pie":"Villages standing",r.villages+"%")+row(es?"Mejor combo":"Best combo","x"+r.combo)+row(es?"Corazones perdidos":"Hearts lost",r.lost)
      +row(es?"Recompensa":"Reward","+"+btc+" BTC · +"+army+(es?" Ejército":" Army"))
      +"<p class=\"bp-hint\">"+(es?"★★ escudo y aldeas ≥60% · ★★★ perder 1 corazón o menos":"★★ shield and villages ≥60% · ★★★ lose 1 heart or less")+"</p>";
    if(d.perkOffer.length){
      h+="<p class=\"bp-sub\">"+(es?"ELIGE UNA MEJORA":"CHOOSE AN UPGRADE")+"</p><div class=\"bp-perks\">";
      d.perkOffer.forEach((k,i)=>{const L=es?k.es:k.en;h+="<button type=\"button\" class=\"bp-perk\" data-perk=\""+i+"\"><kbd>"+(i+1)+"</kbd><b>"+L[0]+"</b><span>"+L[1]+"</span></button>";});
      h+="</div>";
    }else h+="<button type=\"button\" class=\"cta bp-go\" data-perk=\"-1\">"+(es?"Continuar":"Continue")+"</button>";
    h+="</div>";
    bcPostHide();
    const el=document.createElement("div");el.id="bc-post";el.className="bc-post";el.innerHTML=h;
    el.addEventListener("click",(ev)=>{const b=ev.target.closest&&ev.target.closest("[data-perk]");if(b)bcPostPick(+b.getAttribute("data-perk"));});
    (document.body).appendChild(el);
  }
  function bcPostPick(i){
    const d=S.bcDefense;if(!d||d.postDone)return;
    const k=d.perkOffer&&d.perkOffer[i];
    if(k){const own=S.bcPerks||(S.bcPerks={});own[k.id]=(own[k.id]|0)+1;}
    d.postDone=true;
    bcPostHide();
    finishDefense(true);
  }
  function bcPostKey(e){
    const el=$("bc-post");if(!el)return false;
    const d=S.bcDefense;
    e.preventDefault();e.stopPropagation();
    if(e.repeat)return true;
    const m=/^Digit([1-3])$/.exec(e.code||"")||/^Numpad([1-3])$/.exec(e.code||"");
    if(m&&d&&d.perkOffer&&d.perkOffer[+m[1]-1])bcPostPick(+m[1]-1);
    else if((e.code==="Enter"||e.code==="Space")&&d&&!(d.perkOffer&&d.perkOffer.length))bcPostPick(-1);
    return true;
  }
  window.__bcPostPick=bcPostPick;
  function stepDefense(dt){
    const d=S.bcDefense;if(!d||d.done||d.frozen)return;
    d.t=(d.t||0)+dt;d.inv=Math.max(0,d.inv-dt);d.playerInv=Math.max(0,(d.playerInv||0)-dt);d.god=Math.max(0,(d.god||0)-dt);d.freeze=Math.max(0,(d.freeze||0)-dt);d.spawn-=dt;
    if((d.aegisT||0)>0){
      d.aegisT-=dt;
      if(d.aegisT<=0)settleAegis(d);
    }
    if((d.lrmCd||0)>0)d.lrmCd=Math.max(0,d.lrmCd-dt);
    if(d.aaCharging&&!d.aaArmed&&(d.lrmCd||0)>0){d.aaCharging=false;d.aaCharge=0;}
    if(d.aaCharging&&!d.aaArmed){
      if(!(S.defHeld&&S.defHeld.aa)){d.aaCharging=false;d.aaCharge=0;}
      else{
        d.aaCharge=Math.min(1,(d.aaCharge||0)+dt/(d.quickFury?0.15:1.2));
        d.aaBeep=(d.aaBeep||0)+dt;
        if(d.aaBeep>0.16){d.aaBeep=0;warSfx("warCharge");}
        if(d.aaCharge>=1){
          d.aaCharging=false;d.aaArmed=true;d.aa=1;d.quickFury=0;
          d.reticle={x:d.player.x,y:d.player.y};
          addFx(d,{kind:"scopeOn",x:d.reticle.x,y:d.reticle.y,life:.4});
          warSfx("warAa");
        }
      }
    }
    stepFx(d,dt);
    const p=d.player;p.fire=Math.max(0,p.fire-dt);p.hearts=p.hearts==null?p.hp:p.hearts;
    if(!d.infAmmo){
      if(d.ammo==null)d.ammo=AMMO_MAX;
      if((d.reloadT||0)>0){d.reloadT-=dt;if(d.reloadT<=0){d.reloadT=0;d.ammo=AMMO_MAX;}}
      else if(!(S.defHeld&&S.defHeld.f)){d.ammoIdle=(d.ammoIdle||0)+dt;if(d.ammoIdle>0.6&&d.ammo<AMMO_MAX){d.ammoAcc=(d.ammoAcc||0)+dt*4;if(d.ammoAcc>=1){d.ammoAcc-=1;d.ammo++;}}}
    }
    if((d.heliLeft||0)>0 && d.t>3.2 && (d.enemies.filter((e)=>e.type==="HELI").length<1)){d.heliLeft--;spawnHeli(d);}
    battleTick(d,dt);
    if((d.lull||0)>0)d.lull-=dt;
    else{
      const wk=waveKind(d),cap=wk==="rush"||wk==="assault"?7:6;
      const bossNext=d.wave>=d.waves&&d.spawned===d.quota-1&&!d.bossSpawned;
      if(bossNext){
        if(d.spawn<=0&&d.enemies.filter(e=>e.hp>0&&e.type!=="HELI").length<=1){
          defenseEnemy(d,true);d.spawned++;d.bossSpawned=1;
          d.banner={t:0,life:2.4,txt:chanceLang()?(d.flagBoss?"¡BUQUE INSIGNIA!":"¡JEFE!"):(d.flagBoss?"FLAGSHIP!":"BOSS!"),sub:""};
          bShake(d,5);bBuzz(80);warSfx("warWave");
        }
      }else if(d.enemies.length<cap&&d.spawned<d.quota&&d.spawn<=0){
        defenseEnemy(d);d.spawned++;
        const gap=wk==="rush"?.55+Math.random()*.25:wk==="column"?1.15+Math.random()*.35:.8+Math.random()*.35;
        d.spawn=gap/(d.profile.rate||1);
      }
    }
    let mvx=0, mvy=0;
    const h=S.defHeld||{};
    const st0=S.defStick;
    d.assistTgt=AIM_ASSIST()?assistTarget(d):null;
    if(st0&&st0.x*st0.x+st0.y*st0.y>0.04){mvx=st0.x;mvy=st0.y;}
    else{
      if(h.l)mvx-=1; if(h.r)mvx+=1;
      if(h.u)mvy-=1; if(h.d)mvy+=1;
    }
    const pspd=72*(1+((d.up&&d.up.speed)||0)/100);
    if(d.aaArmed&&d.reticle){
      const rspd=220;
      let rdx=0,rdy=0;
      const st=S.defStick;
      if(st&&st.x*st.x+st.y*st.y>0.02){rdx=st.x;rdy=st.y;}
      else{
        if(h.l)rdx-=1;if(h.r)rdx+=1;
        if(h.u)rdy-=1;if(h.d)rdy+=1;
      }
      const len=Math.hypot(rdx,rdy);
      if(len>1){rdx/=len;rdy/=len;}
      d.reticle.x=Math.max(-40,Math.min(S.W+40,d.reticle.x+rdx*rspd*dt));
      d.reticle.y=Math.max(-40,Math.min(S.H+40,d.reticle.y+rdy*rspd*dt));
      const rox=d.reticle.x-p.x, roy=d.reticle.y-p.y, rlen=Math.hypot(rox,roy);
      if(rlen>LRM_RANGE){d.reticle.x=p.x+rox/rlen*LRM_RANGE;d.reticle.y=p.y+roy/rlen*LRM_RANGE;}
    }else{
      if(h.rev){
        const back=aimVec(p);
        slideUnit(d,p,-back[0],-back[1],pspd,dt);
      }else if(Math.hypot(mvx,mvy)>0.04){
        const snap=axisSnap(mvx,mvy);
        mvx=snap[0]; mvy=snap[1];
        faceVec(p,mvx,mvy);
        slideUnit(d,p,mvx,mvy,pspd,dt);
      }
      if(h.f)fireTank(d,p);
    }
    if(d.aaTap){
      d.aaTap=0;
      if(d.aaArmed)fireReticle(d);
    }
    const iced=(d.freeze||0)>0;
    sortTraffic(d);
    for(const e of d.enemies){
      if((e.turnCd||0)>0)e.turnCd=Math.max(0,e.turnCd-dt);
      e.fire=Math.max(0,e.fire-dt);
      if((e.spawn||0)>0){
        e.spawn-=dt;
        e.want=false;
        if(e.spawn<=0)e.spawn=0;
        continue;
      }
      if(iced){e.want=false;continue;}
      e.think-=dt;
      const goal=e.role==="shield"?(d.fort||d.home):p;
      const other=e.role==="shield"?p:(d.fort||d.home);
      let nav=goal;
      if(e.role2==="escort"){const L=escortLead(d,e);if(L&&Math.hypot(L.x-e.x,L.y-e.y)>44)nav=L;}
      e.age=(e.age||0)+dt;
      if(e.think<=0){
        e.think=.28+Math.random()*.22;
        e.want=false;
        e.hold=e.role2==="sniper"&&Math.hypot(p.x-e.x,p.y-e.y)<260&&los(d,e,p.x,p.y);
        const base=d.fort||d.home;
        if(e.ship&&e.role==="shield"&&base&&losShield(d,e,base.x,base.y)){e.aimAt=base;e.want=true;}
        else if(los(d,e,goal.x,goal.y)){e.aimAt=goal;e.want=true;}
        else if(los(d,e,other.x,other.y)){e.aimAt=other;e.want=true;}
        else if(e.type!=="HELI"){
          pathDir(d,e,nav);
          if(e.fell)e.want=true;
        }
        // Seeing the target is not the same as being able to drive to it (water, rocks, houses in between):
        // keep firing at the target but steer along the BFS route instead of ramming the obstacle.
        e.navAt=null;
        if(e.type!=="HELI"&&e.want&&e.aimAt&&!driveClear(d,e,e.aimAt.x,e.aimAt.y)){
          const fireAt=e.aimAt;
          pathDir(d,e,nav);
          if(e.aimAt&&e.aimAt!==fireAt)e.navAt=e.aimAt;
          e.aimAt=fireAt;
        }
        // Nothing to shoot at (no line to the hero or the shield): occasionally shell a nearby house/village.
        if(e.type!=="HELI"&&!e.want&&Math.random()<0.3){
          const h=nearHouse(d,e,88);
          if(h){if(e.aimAt)e.navAt=e.aimAt;e.aimAt=h;e.want=true;}
        }
      }
      const ox=e.x,oy=e.y;
      if(e.type==="HELI"){
        let dx=goal.x-e.x, dy=goal.y-e.y;
        if(!BATTLE_360){ const s=axisSnap(dx,dy); dx=s[0]; dy=s[1]; }
        const ang=Math.atan2(dy,dx);
        const hspd=e.spd*0.729;
        e.x=Math.max(16,Math.min(S.W-16,e.x+Math.cos(ang)*hspd*dt));
        e.y=Math.max(16,Math.min(S.H-16,e.y+Math.sin(ang)*hspd*dt));
        faceVec(e,Math.cos(ang),Math.sin(ang));
        if(Math.hypot(e.x-goal.x,e.y-goal.y)<200)e.want=true;
        const ram=e.role==="shield"?(d.fort||d.home):p;
        if(e.role==="shield"&&Math.hypot(e.x-ram.x,e.y-ram.y)<28){hitBase(d,e.leak||12);if(e.hp>0){e.hp=0;e.rammed=1;d.kills++;}warSfx("warPop");}
      }else{
        const backing=(e.backup||0)>0;
        if(backing){
          e.backup-=dt;
          if(e.backup<=0)e.slip=null;
        }
        const steer=e.navAt||e.aimAt;
        if(steer)faceVec(e,steer.x-e.x,steer.y-e.y);
        const step=aimVec(e);
        const sx=backing?-step[0]:step[0], sy=backing?-step[1]:step[1];
        if(!(e.hold&&!backing))slideUnit(d,e,sx,sy,e.spd*0.81,dt);
        else{e.wdX=e.x;e.wdY=e.y;e.wdT=0;}
        // Watchdog: a unit that has not covered 10px in 4s gets a forced re-route (trees/houses allowed) and a short reverse.
        e.wdT=(e.wdT||0)+dt;
        if(e.wdX==null){e.wdX=e.x;e.wdY=e.y;}
        if(Math.hypot(e.x-e.wdX,e.y-e.wdY)>10){e.wdX=e.x;e.wdY=e.y;e.wdT=0;}
        else if(e.wdT>4&&!iced){e.wdT=0;e.navAt=null;e.backup=0.4;pathDir(d,e,nav);e.want=true;e.think=0.6;}
        if(Math.hypot(e.x-ox,e.y-oy)<0.4){
          const probe=aimVec(e);
          const tx=Math.floor((e.x+probe[0]*12)/BC_TS);
          const ty=Math.floor((e.y+probe[1]*12)/BC_TS);
          const kt=bcAt(d.map,tx,ty);
          const beach=e.ship&&e.role==="shield"&&(d.fort||d.home)&&losShield(d,e,(d.fort||d.home).x,(d.fort||d.home).y);
          if(beach){e.aimAt=d.fort||d.home;facePoint(e,e.aimAt.x,e.aimAt.y);e.want=true;e.jam=0;}
          else if(kt===1&&!e.ship&&!d.maze){e.want=true;e.jam=0;} // a house blocks the route: shell it out of the way
          else if(kt===1||kt===5){e.aimAt=d.fort||d.home;facePoint(e,e.aimAt.x,e.aimAt.y);e.want=true;e.jam=0;}
          else if(kt===4&&!e.ship&&(e.fell||e.jam>0.35)){e.want=true;e.jam=0;}
          else if(!backing){
            e.jam=(e.jam||0)+dt;
            if(e.jam>0.35){
              const bias=e.bias||(e.bias=Math.random()<0.5?1:3);
              const opts=[(e.dir+bias)&3,(e.dir+(bias===1?3:1))&3];
              for(const nd of opts)if(openStep(d,e,nd)){
                if(!aimDir(e,nd))continue;
                const v=aimVec(e);
                e.aimAt={x:e.x+v[0]*64,y:e.y+v[1]*64};
                break;
              }
              e.jam=0;
              e.think=0.32;
              // Repeatedly jammed: drop the current target and re-route (allowing tree cuts) next think.
              e.jamN=(e.jamN||0)+1;
              if(e.jamN>=3){e.jamN=0;e.navAt=null;pathDir(d,e,nav);e.think=0.05;}
            }
          }
        }else{e.jam=0;e.jamN=0;}
        if(e.ship&&e.role==="shield"&&Math.hypot(e.x-(d.fort||d.home).x,e.y-(d.fort||d.home).y)<36){
          hitBase(d,e.leak||8);if(e.hp>0){e.hp=0;e.rammed=1;d.kills++;}warSfx("warPop");
        }
        if(e.role2==="rusher"&&!e.ship&&Math.hypot(e.x-(d.fort||d.home).x,e.y-(d.fort||d.home).y)<34){
          hitBase(d,5);if(e.hp>0){e.hp=0;e.rammed=1;d.kills++;}warSfx("warPop");
        }
        if(e.cargo)tryUnload(d,e);
        if(e.flag)bossBarrage(d,e,dt);
      }
      if((e.tele||0)>0){
        e.tele-=dt;
        if(e.aimAt)faceVec(e,e.aimAt.x-e.x,e.aimAt.y-e.y);
        if(e.tele<=0){e.tele=0;fireTank(d,e);}
      }else if(e.want&&!(e.fire>0)){
        // Telegraph: a short muzzle flash before every enemy shell so hits are readable and dodgeable.
        const inFlight=d.shots.reduce((n,s)=>n+(s.owner===e&&!s.hit?1:0),0);
        if(inFlight<(e.boss?2:1)){
          if(e.navAt&&e.aimAt)faceVec(e,e.aimAt.x-e.x,e.aimAt.y-e.y);
          e.tele=e.role2==="sniper"?0.5:e.flag?0.4:0.25;
        }
        e.want=false;
      }
    }
    separateUnits(d);
    function shotHits(s,t){return Math.abs(t.x-s.x)<t.sz+3&&Math.abs(t.y-s.y)<t.sz+3;}
    for(const s of d.shots){
      if(s.hit)continue;
      if(s.aa){
        const htarget=d.enemies.filter((e)=>e.type==="HELI"&&e.hp>0).sort((a,b)=>Math.hypot(a.x-s.x,a.y-s.y)-Math.hypot(b.x-s.x,b.y-s.y))[0];
        if(htarget){const ang=Math.atan2(htarget.y-s.y,htarget.x-s.x);s.dx=Math.cos(ang);s.dy=Math.sin(ang);}
        s.x+=s.dx*s.v*dt;s.y+=s.dy*s.v*dt;
        if(s.x<4||s.y<4||s.x>S.W-4||s.y>S.H-4){s.hit=true;continue;}
        for(const t of d.enemies){
          if(t.type!=="HELI"||t.hp<=0||!shotHits(s,t))continue;
          s.hit=true;
          if((t.spawn||0)>0){warSfx("warClank");break;}
          t.hp-=3;if(t.hp<=0){d.kills++;warSfx("warPop");}
          break;
        }
        continue;
      }
      s.x+=s.dx*s.v*dt;s.y+=s.dy*s.v*dt;
      if(s.x<4||s.y<4||s.x>S.W-4||s.y>S.H-4){s.hit=true;continue;}
      const tx=Math.floor(s.x/BC_TS),ty=Math.floor(s.y/BC_TS);
      const tile=bcAt(d.map,tx,ty);
      let hit=smashTile(d,tx,ty,s.damage,!!s.mine,s.dx,s.dy);
      if(s.fromShip&&!s.mine&&tile===1&&citadelSkin(d,tx,ty)){hitBase(d,10);hit=true;}
      if(!(s.mine&&bcAt(d.map,tx,ty)===5)){
        const mate=laneMate(tx);
        if(mate>=0&&bcAt(d.map,mate,ty)===1){smashTile(d,mate,ty,s.damage,!!s.mine);hit=true;}
      }
      if(hit){
        if(s.mine&&(s.rico|0)>0){
          const px=s.x-s.dx*s.v*dt,py=s.y-s.dy*s.v*dt;
          const ptx=Math.floor(px/BC_TS),pty=Math.floor(py/BC_TS);
          let fx=ptx!==tx,fy=pty!==ty;if(!fx&&!fy){fx=fy=true;}
          if(fx)s.dx=-s.dx;if(fy)s.dy=-s.dy;
          s.x=px;s.y=py;s.rico--;s.damage=Math.max(1,s.damage);
          continue;
        }
        s.hit=true;continue;
      }
      const targets=s.mine?d.enemies:[p];
      for(const t of targets){
        if(!t||(t!==p&&t.hp<=0))continue;
        if(t.type==="HELI")continue;
        if(!shotHits(s,t))continue;
        s.hit=true;
        if(t===p){
          if(hurtHero(d,1))return;
        }else if((t.spawn||0)>0){
          warSfx("warClank");
        }else{
          t.shots=(t.shots|0)+1;
          t.hp-=s.damage;
          t.hurt=1;
          if(t.boss){}
          else if(s.mine&&(d.shotTier|0)>=3&&(t.hull==="heavy"||t.type==="HEAVY"))t.hp=0;
          else if(woundKill(t))t.hp=0;
          if(t.boss&&t.hp>0){bShake(d,1.5);}
          warSfx("warHit");
          if(t.hp<=0){d.kills++;warSfx("warPop");}
        }
        break;
      }
    }
    for(let i=0;i<d.shots.length;i++)for(let j=i+1;j<d.shots.length;j++){
      const a=d.shots[i],b=d.shots[j];
      if(a.hit||b.hit||a.mine===b.mine)continue;
      if(Math.abs(a.x-b.x)<8&&Math.abs(a.y-b.y)<8){a.hit=true;b.hit=true;warSfx("warClank");}
    }
    d.shots=d.shots.filter(s=>!s.hit);
    for(const e of d.enemies)if(e.hp<=0&&!e.gone){e.gone=1;onKill(d,e);}
    d.enemies=d.enemies.filter(e=>e.hp>0);
    if(d.picks){
      for(const pk of d.picks){
        if(pk.got||pk.dead)continue;
        pk.ttl=(pk.ttl==null?PICK_TTL:pk.ttl)-dt;
        if(pk.ttl<=0){pk.dead=true;continue;}
        if(Math.hypot(pk.x-p.x,pk.y-p.y)<18){
          pk.got=true;
          if(pk.kind==="heal"){
            const max=p.maxHearts||3;
            if((p.hearts|0)>=max && max===3){p.maxHearts=4;p.hearts=4;}
            else p.hearts=Math.min(p.maxHearts||3,(p.hearts|0)+1);
          }
          else if(pk.kind==="shot"){d.shotTier=Math.min(3,(d.shotTier|0)+1);rememberShot(d);}
          else if(pk.kind==="freeze")d.freeze=7.5;
          else if(pk.kind==="bomb")blastEnemies(d,pk.x,pk.y);
          else if(pk.kind==="wall")raiseAegis(d);
          else d.god=7.5;
          const tag=pk.kind==="heal"?"+HP":pk.kind==="shot"?"S"+(d.shotTier|0):pk.kind==="freeze"?"ICE":pk.kind==="bomb"?"BOOM":pk.kind==="wall"?"WALL":"GOD";
          addFx(d,{kind:"eat",x:pk.x,y:pk.y,life:.55,col:pk.kind==="heal"?"#e23b3b":pk.kind==="shot"?"#7fd0ff":pk.kind==="freeze"?"#9fd0ff":pk.kind==="bomb"?"#ff6a2a":pk.kind==="wall"?"#d0ccc6":"#ffe14a",label:tag});
          if(pk.kind==="heal")warSfx("warHeal");
          else if(pk.kind==="freeze")warSfx("warIce");
          else if(pk.kind==="god")warSfx("warGod");
          else if(pk.kind==="shot")warSfx("warPick");
        }
      }
      d.picks=d.picks.filter((pk)=>!pk.got&&!pk.dead);
    }
    if((d.picks?d.picks.length:0)<2){
      d.pickIn=(d.pickIn==null?5+Math.random()*10:d.pickIn)-dt;
      if(d.pickIn<=0){
        const before=d.picks.length;
        scatterPickups(d,1);
        d.pickIn=d.picks.length>before?(5+Math.random()*10):1.2;
      }
    }
    if(d.integrity<=0){finishDefense(false);return;}
    if(d.spawned>=d.quota&&d.enemies.length===0&&!(d.heliLeft>0)){
      if(d.wave>=d.waves){
        // Final kill: a short slow-motion beat before the victory report.
        if(d.winHold==null){d.winHold=.6;d.slow=1.6;}
        d.winHold-=dt;
        if(d.winHold<=0){finishDefense(true);return;}
        syncAaButton(d);
        return;
      }
      d.wave++;d.spawned=0;d.quota=d.waveQ[d.wave-1]||1;d.spawn=.8;
      startWave(d);
    }
    syncAaButton(d);
  }
  const AA_R=52;
  function lrmScale(d){
    const tier=d?d.shotTier|0:0;
    return tier>=3?1.25:tier>=2?1:0.75;
  }
  function lrmR(d){return AA_R*lrmScale(d);}
  const LRM_COOLDOWN=5.25; // seconds (was 7, -25%) after each strike before it can charge again
  const LRM_RANGE=230;    // max reticle distance from the player tank (px)
  function lrmDeg(){return 360;}
  function lrmAim(d,rx,ry){
    const p=d&&d.player;
    let dx=rx-(p?p.x:rx), dy=ry-(p?p.y:ry);
    if(!p||dx*dx+dy*dy<36){
      const v=aimVec(p||{dir:0});
      dx=v[0];dy=v[1];
    }
    return Math.atan2(dy,dx);
  }
  function inLrmWedge(d,x,y,rx,ry){
    if(!d||(d.shotTier|0)<3)return true;
    const aim=lrmAim(d,rx,ry);
    const ang=Math.atan2(y-ry,x-rx);
    const dlt=Math.atan2(Math.sin(ang-aim),Math.cos(ang-aim));
    return Math.abs(dlt)<=(lrmDeg(d)*Math.PI/180)/2;
  }
  function unitRadius(e){return Math.max(6,(e.sz||12)*0.55);}
  function circleOverlapFrac(dist,R,r){
    if(dist+r<=R)return 1;
    if(dist>=R+r)return 0;
    return Math.max(0,Math.min(1,(R+r-dist)/(2*r)));
  }
  function woundKill(e){
    const cls=lrmClass(e);
    const b=e.shots|0, a=e.lrm|0;
    if(cls==="light")return b>=1||a>=1;
    if(cls==="heavy")return b>=3||a>=2||(a>=1&&b>=2);
    return b>=2||a>=2||(a>=1&&b>=1);
  }
  function lrmClass(e){
    if(e.hull==="heavy"||e.type==="HEAVY")return "heavy";
    if(e.hull==="light"||e.type==="FAST"||e.type==="HELI")return "light";
    return "medium";
  }
  function crossHits(x,y,r,rx,ry,R,rot){
    let dx=x-rx, dy=y-ry;
    if(rot){
      const c=Math.cos(rot), s=Math.sin(rot);
      const nx=dx*c+dy*s, ny=-dx*s+dy*c;
      dx=nx; dy=ny;
    }
    dx=Math.abs(dx); dy=Math.abs(dy);
    const arm=(R==null?AA_R:R)+8, thick=r+2;
    return (dy<=thick&&dx<=arm)||(dx<=thick&&dy<=arm);
  }
  function scorchTrees(d,rx,ry){
    let n=0;
    for(let y=0;y<BC_R;y++)for(let x=0;x<BC_C;x++){
      if(bcAt(d.map,x,y)!==4)continue;
      const cx=x*BC_TS+BC_TS/2, cy=y*BC_TS+BC_TS/2;
      const R=lrmR(d);
      const dist=Math.hypot(cx-rx,cy-ry);
      const rot=(d.shotTier|0)>=3?lrmAim(d,rx,ry):0;
      const onCross=crossHits(cx,cy,6,rx,ry,R,rot);
      if(dist>R&&!onCross)continue;
      if(!onCross&&!inLrmWedge(d,cx,cy,rx,ry))continue;
      const u=1-Math.min(1,dist/R);
      if(igniteTree(d,x,y,Math.random()<u*u))n++;
    }
    return n;
  }
  function razeBuilding(d,x,y){
    const i=y*BC_C+x;
    const cx=x*BC_TS+8, cy=y*BC_TS+8;
    if(d.map[i]===9)layRubble(d,i,2);
    else if(d.map[i]===1&&!citadelSkin(d,x,y)&&!(d.seal&&d.seal[i]))layRubble(d,i,1);
    else d.map[i]=6;
    d.hp[i]=0;
    if(d.bHits)d.bHits[i]=0;
    if(d.seal)d.seal[i]=0;
    addFx(d,{kind:"lrmKill",x:cx,y:cy,life:.5});
  }
  function lrmBuildings(d,rx,ry){
    if(!d.bHits)d.bHits=new Uint8Array(d.map.length);
    let burned=0, wrecked=0;
    for(let y=0;y<BC_R;y++)for(let x=0;x<BC_C;x++){
      const t=bcAt(d.map,x,y);
      const i=y*BC_C+x;
      const house=t===1&&!d.maze&&!citadelSkin(d,x,y)&&!(d.seal&&d.seal[i]);
      if(t!==9&&!house)continue;
      const b=t===9?beaconBase(x,y):null;
      const cx=b?(b.x0+b.x1)/2:x*BC_TS+8;
      const cy=b?(b.y0+b.y1)/2:y*BC_TS+8;
      const dist=Math.hypot(cx-rx,cy-ry);
      const R=lrmR(d);
      const rot=(d.shotTier|0)>=3?lrmAim(d,rx,ry):0;
      if(crossHits(cx,cy,10,rx,ry,R,rot)){razeBuilding(d,x,y);wrecked++;}
      else if(dist<=R&&inLrmWedge(d,cx,cy,rx,ry)){
        d.bHits[i]=(d.bHits[i]||0)+1;
        if(t===9)d.hp[i]=Math.max(d.hp[i]||0,1);
        addFx(d,{kind:"treeBurn",x:cx,y:cy,life:.4,hot:2});
        if(d.bHits[i]>=2){razeBuilding(d,x,y);wrecked++;}
        else burned++;
      }
    }
    return {burned,wrecked};
  }
  function lrmHeroHearts(d,rx,ry){
    const p=d&&d.player;
    if(!p||(p.hearts|0)<=0||d.god>0)return 0;
    const r=unitRadius(p);
    const dist=Math.hypot(p.x-rx,p.y-ry);
    const R=lrmR(d);
    const rot=(d.shotTier|0)>=3?lrmAim(d,rx,ry):0;
    const onCross=crossHits(p.x,p.y,r,rx,ry,R,rot);
    const inArea=circleOverlapFrac(dist,R,r)>=0.5&&inLrmWedge(d,p.x,p.y,rx,ry);
    if(onCross)return 2;
    if(inArea)return 1;
    return 0;
  }
  function cancelReticle(d){
    if(!d)return;
    d.aaArmed=false;d.aa=0;d.aaCharge=0;d.aaCharging=false;d.reticle=null;d.aaTap=0;
    const h=S.defHeld;if(h)h.aa=0;
  }
  function reticleHit(d,x,y){
    const R=lrmR(d)+8;
    const dx=x-d.reticle.x, dy=y-d.reticle.y;
    return dx*dx+dy*dy<=R*R;
  }
  function fireReticle(d){
    if(!d||!d.aaArmed||!d.reticle)return;
    const rx=d.reticle.x,ry=d.reticle.y;
    const heroHearts=lrmHeroHearts(d,rx,ry);
    const hits=[];
    for(const e of d.enemies){
      if(e.hp<=0||(e.spawn||0)>0)continue;
      const dist=Math.hypot(e.x-rx,e.y-ry);
      const r=unitRadius(e);
      if(e.boss){if(dist<=lrmR(d)+r){dmgEnemy(d,e,3);addFx(d,{kind:"treeBurn",x:e.x,y:e.y,life:.4,hot:3});}continue;}
      const cls=lrmClass(e);
      const R=lrmR(d);
      const rot=(d.shotTier|0)>=3?lrmAim(d,rx,ry):0;
      const onCross=crossHits(e.x,e.y,r,rx,ry,R,rot);
      const inArea=circleOverlapFrac(dist,R,r)>=0.5&&inLrmWedge(d,e.x,e.y,rx,ry);
      let ok=false;
      if(cls==="light")ok=onCross||inArea;
      else if(onCross&&cls==="medium")ok=true;
      else if(onCross||inArea){
        e.lrm=(e.lrm|0)+1;
        e.hurt=1;
        addFx(d,{kind:"treeBurn",x:e.x,y:e.y,life:.4,hot:2});
        if(woundKill(e))ok=true;
      }
      if(ok)hits.push(e);
    }
    addFx(d,{kind:"lrmFire",x:rx,y:ry,life:.45});
    const burned=scorchTrees(d,rx,ry);
    const lamps=lrmBuildings(d,rx,ry);
    d.aaArmed=false;d.aa=0;d.aaCharge=0;d.aaCharging=false;d.reticle=null;
    d.lrmCd=LRM_COOLDOWN*(d.furyMul||1);
    bShake(d,4);
    warSfx("warLrm");
    if(heroHearts){
      const p=d.player;
      p.hearts=Math.max(0,(p.hearts|0)-heroHearts);
      rememberShot(d);
      addFx(d,{kind:"shieldHit",x:p.x,y:p.y,life:.4});
      warSfx("warHurt");
      if(p.hearts<=0){finishDefense(false);return;}
      d.playerInv=0.45;
    }
    if(hits.length||lamps.wrecked){
      for(const hit of hits){
        hit.hp=0;d.kills++;
        addFx(d,{kind:"lrmKill",x:hit.x,y:hit.y,life:.5});
      }
      warSfx("warPop");
    }else if(burned||lamps.burned)warSfx("warHit");
    else warSfx("warClank");
  }
  function addFx(d,fx){
    if(!d)return;
    if(!d.fx)d.fx=[];
    fx.t=0;fx.life=fx.life||.4;
    d.fx.push(fx);
  }
  function spawnShieldBreak(d,before,after){
    if(!d)return;
    const drop=Math.max(0,(before||0)-(after||0));
    if(drop<=0)return;
    const c=shieldCenter(d);
    const n=Math.max(3,Math.min(10,2+Math.round(drop/8)));
    if(!d.shards)d.shards=[];
    for(let i=0;i<n;i++){
      const a=Math.random()*Math.PI*2;
      const sp=40+Math.random()*90;
      d.shards.push({x:c.x+(Math.random()-0.5)*18,y:c.y+(Math.random()-0.5)*18,vx:Math.cos(a)*sp,vy:Math.sin(a)*sp-20,rot:Math.random()*6,vr:(Math.random()-.5)*8,life:.7+Math.random()*.5,t:0});
    }
    addFx(d,{kind:"shieldHit",x:c.x,y:c.y,life:.35});
  }
  function shieldCenter(d){
    if(d.shieldAnchor)return d.shieldAnchor;
    let sx=0,sy=0,n=0;
    for(let y=0;y<BC_R;y++)for(let x=0;x<BC_C;x++)if(bcAt(d.map,x,y)===5){sx+=x*BC_TS+BC_TS/2;sy+=y*BC_TS+BC_TS/2;n++;}
    d.shieldAnchor=n?{x:sx/n,y:sy/n}:(d.fort||d.home||{x:S.W/2,y:S.H/2});
    return d.shieldAnchor;
  }
  function stepFx(d,dt){
    if(!d)return;
    if(d.fx){
      for(const f of d.fx)f.t=(f.t||0)+dt;
      d.fx=d.fx.filter(f=>f.t<f.life);
    }
    if(d.shards){
      for(const sh of d.shards){
        sh.t+=dt;sh.x+=sh.vx*dt;sh.y+=sh.vy*dt;sh.vy+=180*dt;sh.rot+=sh.vr*dt;
      }
      d.shards=d.shards.filter(sh=>sh.t<sh.life);
    }
  }
  function syncAaButton(d){
    const btn=$("def-aa");
    if(!btn)return;
    const show=!!(d&&!d.done&&!d.frozen);
    btn.classList.toggle("hide",!show);
    const cd=d?(d.lrmCd||0):0;
    const pct=d?(d.aaArmed?1:cd>0?1-cd/(LRM_COOLDOWN*(d.furyMul||1)):(d.aaCharge||0)):0;
    btn.classList.toggle("cooldown",cd>0);
    const aaLab=chanceLang()?"FURIA":"FURY";if(btn.textContent!==aaLab)btn.textContent=aaLab;
    btn.style.setProperty("--aa",(pct*360)+"deg");
    btn.classList.toggle("armed",!!(d&&d.aaArmed));
    btn.classList.toggle("charging",!!(d&&d.aaCharging&&!d.aaArmed));
    // touch hint under the button: what the next action is (desktop shows the key badge instead)
    if(!KB_DESK&&show){
      const es=chanceLang();
      const h=d.aaArmed?(es?"TOCA PARA LANZAR":"TAP TO FIRE"):cd>0?(es?"RECARGANDO":"RELOADING"):d.aaCharging?(es?"CARGANDO…":"CHARGING…"):(es?"MANTÉN":"HOLD");
      if(btn.getAttribute("data-hint")!==h)btn.setAttribute("data-hint",h);
    }
    const arc=$("def-arc");
    if(arc){
      const on=show&&(d.shotTier|0)>=2;
      arc.classList.toggle("hide",!on);
      const knob=$("def-arc-knob");
      if(knob&&on){
        const deg=d.shotSpread==null?0:d.shotSpread;
        const t=Math.max(0,Math.min(1,deg/45));
        const travel=Math.max(20,arc.clientHeight-46);
        knob.style.top=(18+t*travel)+"px";
      }
    }
  }
  function fireAa(d){
    const p=d.player;
    const target=d.enemies.filter((e)=>e.type==="HELI"&&e.hp>0).sort((a,b)=>Math.hypot(a.x-p.x,a.y-p.y)-Math.hypot(b.x-p.x,b.y-p.y))[0];
    const ang=target?Math.atan2(target.y-p.y,target.x-p.x):-Math.PI/2;
    d.shots.push({x:p.x,y:p.y-8,dx:Math.cos(ang),dy:Math.sin(ang),v:360,damage:3,mine:true,aa:true,hit:false});
    warSfx("warAa");
  }
  function tone(hex, amt){
    if(!hex||hex[0]!=="#"||hex.length<7)return hex||"#3f5344";
    const n=parseInt(hex.slice(1,7),16);
    const ch=(c)=>Math.max(0,Math.min(255,c+amt));
    const r=ch((n>>16)&255),g=ch((n>>8)&255),b=ch(n&255);
    return "#"+((1<<24)|(r<<16)|(g<<8)|b).toString(16).slice(1);
  }
  function drawHeroBulk(ctx,tier){
    if(tier<=0)return;
    ctx.fillStyle="#10140c";
    ctx.fillRect(-1.5-tier*0.4,-16.5-tier*1.5,3+tier*0.8,5+tier);
    if(tier>=2){
      ctx.fillRect(-3.5,-16-tier,1.7,5);
      ctx.fillRect(1.8,-16-tier,1.7,5);
    }
  }
  function drawShip(ctx,t,col){
    ctx.save();ctx.translate(t.x,t.y);
    const rot=facingRot(t);ctx.rotate(rot);
    const hero=!!t.hero;
    const tier=hero?(t.tier|0):0;
    if(tier)ctx.scale(1+tier*0.08,1+tier*0.08);
    const hull=hero?"medium":(t.hull||"medium");
    const fill=col||"#3e5148";
    const dark=tone(fill,-42),lite=tone(fill,18);
    const heavy=hull==="heavy", light=hull==="light";
    const beam=heavy?9:light?4.4:6.4;
    const bow=heavy?15:light?12:13.5;
    const stern=heavy?11:light?8:10;
    ctx.fillStyle="rgba(214,232,226,.3)";
    ctx.beginPath();ctx.moveTo(-beam*0.35,stern-1);ctx.lineTo(0,stern+8);ctx.lineTo(beam*0.35,stern-1);ctx.closePath();ctx.fill();
    ctx.fillStyle="rgba(8,16,16,.34)";
    ctx.beginPath();ctx.ellipse(1.4,2.2,beam*0.95,(bow+stern)*0.38,0,0,Math.PI*2);ctx.fill();
    ctx.fillStyle=dark;
    ctx.beginPath();
    ctx.moveTo(0,-bow);ctx.lineTo(beam,-bow*0.12);ctx.lineTo(beam*0.78,stern);ctx.lineTo(-beam*0.78,stern);ctx.lineTo(-beam,-bow*0.12);
    ctx.closePath();ctx.fill();
    ctx.fillStyle=fill;
    ctx.beginPath();
    ctx.moveTo(0,-bow+2.2);ctx.lineTo(beam-1.3,-bow*0.08);ctx.lineTo(beam*0.62,stern-1.6);ctx.lineTo(-beam*0.62,stern-1.6);ctx.lineTo(-(beam-1.3),-bow*0.08);
    ctx.closePath();ctx.fill();
    ctx.fillStyle=lite;ctx.globalAlpha=.4;
    ctx.fillRect(-0.6,-bow+5,1.2,bow+stern-9);
    ctx.globalAlpha=1;
    ctx.fillStyle="#ddd6c6";
    ctx.fillRect(-beam*0.36,-1.2,beam*0.72,heavy?6.2:4.4);
    ctx.fillStyle="#1c282c";
    ctx.fillRect(-beam*0.2,0.2,1.2,1.5);ctx.fillRect(beam*0.02,0.2,1.2,1.5);
    ctx.fillStyle="#141812";
    ctx.fillRect(-0.75,-bow-1.2,1.5,5);
    if(heavy){ctx.fillRect(-2.6,-bow+2,1.3,4);ctx.fillRect(1.3,-bow+2,1.3,4);}
    if(hull==="elite"){ctx.strokeStyle="#c6a15a";ctx.lineWidth=.8;ctx.strokeRect(-beam*0.36,-1.2,beam*0.72,4);}
    if(hero){ctx.strokeStyle="rgba(255,236,210,.8)";ctx.lineWidth=.8;ctx.strokeRect(-beam*0.36,-1.2,beam*0.72,4.2);}
    if(hero)drawHeroBulk(ctx,tier);
    ctx.restore();
  }
  function drawTank(ctx,t,col){
    ctx.save();ctx.translate(t.x,t.y);
    const rot=facingRot(t);ctx.rotate(rot);
    const hero=!!t.hero;
    const tier=hero?(t.tier|0):0;
    if(tier)ctx.scale(1+tier*0.08,1+tier*0.08);
    const hull=hero?"medium":(t.hull||"medium");
    const fill=col||"#6a7058";
    const dark=tone(fill,-46);
    const heavy=hull==="heavy", light=hull==="light";
    const hw=heavy?7.6:light?4.8:6.2;
    const hl=heavy?10.2:light?7.2:8.8;
    const tw=heavy?3.1:light?2:2.5;
    ctx.fillStyle="rgba(10,12,8,.4)";
    ctx.beginPath();ctx.ellipse(1.3,2.6,hw+tw+1.2,hl*0.72,0,0,Math.PI*2);ctx.fill();
    ctx.fillStyle="#171910";
    ctx.fillRect(-hw-tw,-hl,tw,hl*2);
    ctx.fillRect(hw,-hl,tw,hl*2);
    ctx.fillStyle="#3c4034";
    const step=heavy?3.05:2.65;
    for(let y=-hl+1.1;y<hl-1;y+=step){
      ctx.fillRect(-hw-tw+0.2,y,tw-0.4,0.85);
      ctx.fillRect(hw+0.2,y,tw-0.4,0.85);
    }
    ctx.fillStyle=dark;
    ctx.beginPath();
    ctx.moveTo(-hw,-hl+1);ctx.lineTo(hw,-hl+1);ctx.lineTo(hw+0.4,hl-0.6);ctx.lineTo(-hw-0.4,hl-0.6);ctx.closePath();
    ctx.fill();
    ctx.fillStyle=fill;
    ctx.beginPath();
    ctx.moveTo(-hw+0.8,-hl+2.1);ctx.lineTo(hw-0.8,-hl+2.1);ctx.lineTo(hw-0.3,hl-1.6);ctx.lineTo(-hw+0.3,hl-1.6);ctx.closePath();
    ctx.fill();
    ctx.fillStyle="rgba(255,255,255,.14)";
    ctx.fillRect(-hw+1.1,-hl+2.4,1.6,hl*0.9);
    const tr=heavy?4.5:light?2.7:3.5;
    ctx.fillStyle=dark;
    ctx.beginPath();ctx.arc(0,-0.5,tr+0.8,0,Math.PI*2);ctx.fill();
    ctx.fillStyle=tone(fill,-10);
    ctx.beginPath();ctx.arc(0,-0.5,tr,0,Math.PI*2);ctx.fill();
    ctx.strokeStyle="#1a1c14";ctx.lineWidth=.6;
    ctx.strokeRect(-1.15,-1.7,2.3,1.7);
    const gun=heavy?7.2:light?4.4:5.6;
    const gw=heavy?1.35:light?0.75:0.95;
    ctx.fillStyle="#12140e";
    ctx.fillRect(-gw,-hl-gun,gw*2,hl+gun-tr);
    ctx.fillStyle="#c4c0b2";
    ctx.fillRect(-gw-0.2,-hl-gun,gw*2+0.4,1.2);
    if(hull==="elite"){ctx.strokeStyle="#c6a15a";ctx.lineWidth=.8;ctx.beginPath();ctx.arc(0,-0.5,tr+1.2,0,Math.PI*2);ctx.stroke();}
    if(hero){ctx.strokeStyle="rgba(255,236,210,.9)";ctx.lineWidth=.9;ctx.beginPath();ctx.arc(0,-0.5,tr-0.3,0.15,Math.PI-0.15);ctx.stroke();}
    if(hero)drawHeroBulk(ctx,tier);
    ctx.restore();
  }
  function drawRubble(ctx,px,py,x,y){
    const h=(x*13+y*7)&7;
    ctx.fillStyle="#6a4634";
    ctx.fillRect(px+1+(h%3),py+11,6,2);
    ctx.fillRect(px+9,py+3+(h%4),4,2);
    ctx.fillStyle="#a85b3a";
    ctx.fillRect(px+3,py+5,3,2);
    ctx.fillRect(px+8,py+8,4,2);
    ctx.fillStyle="#d7c4a2";
    ctx.fillRect(px+6,py+12,2,2);
    ctx.fillRect(px+11,py+6,2,1);
    ctx.fillStyle="#3a2a22";
    ctx.fillRect(px+2,py+8,2,1);
  }
  function drawHouseFire(ctx,px,py,t,x,y,sc){
    sc=sc||1;
    const flick=0.45+0.55*Math.sin((t||0)*16+x*2.1+y);
    ctx.save();
    ctx.translate(px+8,py+8);
    ctx.scale(sc,sc);
    ctx.translate(-8,-8);
    ctx.globalAlpha=0.9;
    ctx.fillStyle="#5a2414";
    ctx.beginPath();ctx.ellipse(8,12,5,1.6,0,0,Math.PI*2);ctx.fill();
    ctx.globalAlpha=flick;
    ctx.fillStyle="#e25822";
    ctx.beginPath();ctx.moveTo(5,12);ctx.lineTo(7,4);ctx.lineTo(9,12);ctx.closePath();ctx.fill();
    ctx.beginPath();ctx.moveTo(9,12);ctx.lineTo(12,6);ctx.lineTo(13,12);ctx.closePath();ctx.fill();
    ctx.fillStyle="#ffb020";
    ctx.beginPath();ctx.moveTo(6,12);ctx.lineTo(7.5,7);ctx.lineTo(9,12);ctx.closePath();ctx.fill();
    ctx.fillStyle="#ffe08a";
    ctx.beginPath();ctx.moveTo(7,12);ctx.lineTo(7.6,9);ctx.lineTo(8.4,12);ctx.closePath();ctx.fill();
    ctx.restore();
  }
  function drawLampRuin(ctx,px,py,x,y){
    const h=(x*9+y*5)&7;
    ctx.save();
    ctx.translate(px+8,py+8);
    ctx.rotate(-0.5+(h%3)*0.15);
    ctx.fillStyle="rgba(0,0,0,.28)";
    ctx.beginPath();ctx.ellipse(1,6,14,4,0,0,Math.PI*2);ctx.fill();
    ctx.fillStyle="#8a8680";
    ctx.beginPath();ctx.moveTo(-12,6);ctx.lineTo(-8,-1);ctx.lineTo(-2,3);ctx.lineTo(4,-2);ctx.lineTo(12,5);ctx.lineTo(13,7);ctx.lineTo(-13,7);ctx.closePath();ctx.fill();
    ctx.fillStyle="#f4efe4";
    ctx.fillRect(-13,-2,22,6);
    ctx.fillStyle="#c4372c";
    ctx.fillRect(-4,-2,6,6);
    ctx.fillStyle="#2c261e";
    ctx.fillRect(7,-4,6,4);
    ctx.fillStyle="#f2d56a";
    ctx.beginPath();ctx.arc(10,-1,3.2,0,Math.PI*2);ctx.fill();
    ctx.fillStyle="#fff6c8";
    ctx.fillRect(9,-2,2,2);
    ctx.fillStyle="#5e5c58";
    ctx.fillRect(-15,2,5,4);
    ctx.fillRect(4,3,4,3);
    ctx.restore();
  }
  function drawMasonry(ctx,px,py,x,y,steel){
    const h=(x*5+y*3)&3;
    ctx.fillStyle=steel?"#2c322e":"#5a4336";
    ctx.fillRect(px,py,BC_TS,BC_TS);
    ctx.fillStyle=steel?(h?"#7a8278":"#6a7268"):(h?"#c2a488":"#b09078");
    ctx.fillRect(px+1,py+1,14,12);
    ctx.fillStyle=steel?"rgba(18,22,20,.5)":"rgba(62,40,28,.42)";
    ctx.fillRect(px+1,py+7,14,1);
    if((x+y)&1)ctx.fillRect(px+8,py+1,1,6);
    else ctx.fillRect(px+4,py+8,1,5);
    ctx.fillStyle="rgba(255,246,232,.16)";
    ctx.fillRect(px+2,py+2,5,1);
  }
  // ---- Map polish pass (drawn over the tile grid, under units) ----
  const THEME_TINT={caribbean:"#2fd8c8",cliffs:"#7d8aa0",woods:"#2f7a34",maze:"#9a5a32",village:"#e0a062",docks:"#5b7fa6",airport:"#b9b9b9",sea:"#1f5fa0",wild:"#93a04c"};
  function tileHash(x,y){let h=(x*374761393+y*668265263)|0;h=(h^(h>>>13))*1274126177|0;return ((h^(h>>>16))>>>0)/4294967295;}
  function smoothNoise(x,y){
    const x0=Math.floor(x),y0=Math.floor(y),fx=x-x0,fy=y-y0;
    const sx=fx*fx*(3-2*fx),sy=fy*fy*(3-2*fy);
    const a=tileHash(x0,y0),b=tileHash(x0+1,y0),c=tileHash(x0,y0+1),e=tileHash(x0+1,y0+1);
    return (a+(b-a)*sx)+((c+(e-c)*sx)-(a+(b-a)*sx))*sy;
  }
  function isWater(m,x,y){return bcAt(m,x,y)===3;}
  function isGround(k){return k===0||k===6||k===4||k===7||k===9;}
  function drawTerrainPolish(ctx,d,t){
    const m=d.map,T=BC_TS,seed=(S.bcMapSeed|0)%997;
    ctx.save();
    for(let y=0;y<BC_R;y++)for(let x=0;x<BC_C;x++){
      const k=bcAt(m,x,y),px=x*T,py=y*T;
      // 1) smooth low-frequency light/shade so big areas stop looking like a flat checkerboard
      if(k!==3&&k!==5){
        const n=smoothNoise((x+seed)*0.22,(y+seed)*0.22)*0.6+smoothNoise((x+seed)*0.55,(y-seed)*0.55)*0.4;
        const v=n-0.5;
        ctx.fillStyle=v>0?"rgba(255,248,220,"+(v*0.22).toFixed(3)+")":"rgba(20,24,10,"+(-v*0.26).toFixed(3)+")";
        ctx.fillRect(px,py,T,T);
      }else if(k===3){
        const n=smoothNoise((x-seed)*0.18+t*0.05,(y+seed)*0.18)-0.5;
        ctx.fillStyle=n>0?"rgba(120,210,220,"+(n*0.16).toFixed(3)+")":"rgba(0,10,20,"+(-n*0.2).toFixed(3)+")";
        ctx.fillRect(px,py,T,T);
      }
      // 2) blended sand <-> grass transitions
      if(k===0){
        const g=(a)=>a===6||a===4;
        ctx.fillStyle="rgba(106,118,68,.45)";
        if(g(bcAt(m,x,y-1)))ctx.fillRect(px,py,T,3);
        if(g(bcAt(m,x,y+1)))ctx.fillRect(px,py+T-3,T,3);
        if(g(bcAt(m,x-1,y)))ctx.fillRect(px,py,3,T);
        if(g(bcAt(m,x+1,y)))ctx.fillRect(px+T-3,py,3,T);
      }
      // 3) soft shadows: light from the top-left, so solids cast onto the ground below/right of them
      if(isGround(k)){
        const solid=(a)=>a===1||a===2||a===5||a===8;
        ctx.fillStyle="rgba(10,12,6,.28)";
        if(solid(bcAt(m,x,y-1)))ctx.fillRect(px,py,T,4);
        if(solid(bcAt(m,x-1,y)))ctx.fillRect(px,py,4,T);
      }
    }
    // 4) rounded coasts: convex land corners get eaten by water, concave water corners get filled with sand
    const R=7;
    for(let y=0;y<BC_R;y++)for(let x=0;x<BC_C;x++){
      const k=bcAt(m,x,y),px=x*T,py=y*T;
      const corners=[[-1,-1,px,py],[1,-1,px+T,py],[-1,1,px,py+T],[1,1,px+T,py+T]];
      if(k!==3&&k!==7){
        for(const [dx,dy,cx,cy] of corners){
          if(!(isWater(m,x+dx,y)&&isWater(m,x,y+dy)&&isWater(m,x+dx,y+dy)))continue;
          ctx.fillStyle="#1f6f74";
          ctx.beginPath();
          ctx.moveTo(cx,cy);ctx.lineTo(cx-dx*R,cy);
          ctx.arc(cx-dx*R,cy-dy*R,R,dy>0?Math.PI/2:-Math.PI/2,dx>0?0:Math.PI,(dx>0)===(dy>0));
          ctx.closePath();ctx.fill();
          ctx.strokeStyle="rgba(226,232,220,.55)";ctx.lineWidth=2;
          ctx.beginPath();ctx.arc(cx-dx*R,cy-dy*R,R,dy>0?Math.PI/2:-Math.PI/2,dx>0?0:Math.PI,(dx>0)===(dy>0));ctx.stroke();
        }
      }else if(k===3){
        for(const [dx,dy,cx,cy] of corners){
          const l=(a)=>a===0||a===6||a===4||a===9;
          if(!(l(bcAt(m,x+dx,y))&&l(bcAt(m,x,y+dy))))continue;
          ctx.fillStyle="#b7a06e";
          ctx.beginPath();
          ctx.moveTo(cx,cy);ctx.lineTo(cx-dx*R*0.8,cy);
          ctx.quadraticCurveTo(cx-dx*R*0.15,cy-dy*R*0.15,cx,cy-dy*R*0.8);
          ctx.closePath();ctx.fill();
        }
      }
    }
    // 5) per-theme colour grade so each zone of the island reads differently
    const tint=THEME_TINT[d.theme]||THEME_TINT.wild;
    ctx.globalCompositeOperation="soft-light";
    ctx.globalAlpha=0.42;
    ctx.fillStyle=tint;ctx.fillRect(0,0,BC_C*T,BC_R*T);
    ctx.restore();
  }
  // ---- Static terrain cache ----
  // The tile grid + polish pass is ~1200 tiles of fillRect/paths and dominated battle frame time on phones.
  // It is baked into an offscreen canvas and only repainted when the map/damage changes, or at most
  // TERRAIN_HZ times a second for the slow water/foam animation. Fires are drawn live on top.
  let TERRAIN_BAKING=false;
  const TERRAIN_HZ=2;
  const terrainCache={cv:null,key:"",tq:-1,dpr:0};
  function terrainKey(d){
    let h=2166136261>>>0;
    const mix=(a)=>{if(!a)return;for(let i=0;i<a.length;i++){h=Math.imul(h^(a[i]|0),16777619);}};
    mix(d.map);mix(d.hp);mix(d.rubble);mix(d.seal);mix(d.bHits);
    return (h>>>0)+":"+(d.maze?1:0)+":"+(d.theme||"")+":"+(S.bcMapSeed|0)+":"+d.map.length;
  }
  function drawTerrainBase(ctx,d,t,houseMemo){
    ctx.fillStyle="#0c3c46";ctx.fillRect(0,0,S.W,S.H);
    for(let y=0;y<BC_R;y++)for(let x=0;x<BC_C;x++){
      const k=bcAt(d.map,x,y),px=x*BC_TS,py=y*BC_TS;
      if(k===3){
        const n=((x*17+y*13)^((x+y)*3))&7;
        const shore=bcAt(d.map,x,y-1)!==3||bcAt(d.map,x,y+1)!==3||bcAt(d.map,x-1,y)!==3||bcAt(d.map,x+1,y)!==3;
        ctx.fillStyle=shore?(n<4?"#1f6f74":"#22787b"):(n<3?"#0d4550":n<6?"#115564":"#0a3a44");
        ctx.fillRect(px,py,BC_TS,BC_TS);
        ctx.fillStyle="rgba(170,220,210,.07)";
        if((x*3+y)%5===0)ctx.fillRect(px+3,py+6,3,1);
        if((x+y*2)%7===1)ctx.fillRect(px+9,py+11,2,1);
        let foam=0;
        if(bcAt(d.map,x,y-1)!==3)foam|=1;
        if(bcAt(d.map,x,y+1)!==3)foam|=2;
        if(bcAt(d.map,x-1,y)!==3)foam|=4;
        if(bcAt(d.map,x+1,y)!==3)foam|=8;
        if(foam){
          const wob=Math.sin(t*1.6+x*0.9+y*1.3)>0?1:0;
          ctx.fillStyle="rgba(226,232,220,.5)";
          if(foam&1)ctx.fillRect(px,py,BC_TS,2+wob);
          if(foam&2)ctx.fillRect(px,py+BC_TS-2-wob,BC_TS,2+wob);
          if(foam&4)ctx.fillRect(px,py,2+wob,BC_TS);
          if(foam&8)ctx.fillRect(px+BC_TS-2-wob,py,2+wob,BC_TS);
        }
        continue;
      }
      if(k===0){
        const wet=bcAt(d.map,x-1,y)===3||bcAt(d.map,x+1,y)===3||bcAt(d.map,x,y-1)===3||bcAt(d.map,x,y+1)===3;
        const g=(x*9+y*5)&3;
        ctx.fillStyle=wet?"#b7a06e":(g===0?"#d4bc8e":g===1?"#cbb488":"#dec69a");
        ctx.fillRect(px,py,BC_TS,BC_TS);
        ctx.fillStyle=wet?"rgba(90,70,40,.28)":"rgba(120,88,48,.22)";
        if(g===0)ctx.fillRect(px+2,py+4,2,1);
        if(g===1)ctx.fillRect(px+9,py+8,2,1);
        if(g===2)ctx.fillRect(px+5,py+12,3,1);
        if(g===3)ctx.fillRect(px+11,py+3,1,2);
        if(d.rubble&&d.rubble[y*BC_C+x]===1)drawRubble(ctx,px,py,x,y);
        continue;
      }
      if(k===6||k===4){
        const g=((x*13+y*17)^((x*3+y)*7))&7;
        ctx.fillStyle=g<2?"#6a7644":g<4?"#5e6c3e":g<6?"#74844c":"#55683a";
        ctx.fillRect(px,py,BC_TS,BC_TS);
        ctx.fillStyle="rgba(32,42,18,.35)";
        if(g%3===0){ctx.fillRect(px+3,py+6,3,1);ctx.fillRect(px+4,py+7,1,2);}
        if(g%4===1){ctx.fillRect(px+10,py+4,2,1);ctx.fillRect(px+11,py+5,1,2);}
        if(g%5===2){ctx.fillStyle="rgba(150,140,70,.28)";ctx.fillRect(px+6,py+11,2,1);}
        if(k===6&&d.rubble&&d.rubble[y*BC_C+x]===1)drawRubble(ctx,px,py,x,y);
        if(k===4){
          const burn=d.hp[y*BC_C+x]||0;
          ctx.fillStyle="rgba(16,24,10,.35)";
          ctx.beginPath();ctx.ellipse(px+9,py+10,6.2,3.6,0.2,0,Math.PI*2);ctx.fill();
          const leaf=burn>=2?"#5a3018":burn>=1?"#6a4018":"#2c5228";
          const leaf2=burn?"#4a3014":"#3d6a34";
          for(let i=0;i<6;i++){
            const a=i/6*Math.PI*2+(x%5)*0.2;
            ctx.fillStyle=i%2?leaf:leaf2;
            ctx.beginPath();
            ctx.ellipse(px+8+Math.cos(a)*3.1,py+7+Math.sin(a)*2.3,3.1,1.25,a,0,Math.PI*2);
            ctx.fill();
          }
          ctx.fillStyle=burn?"#6a3a16":"#24461e";
          ctx.beginPath();ctx.arc(px+8,py+7,2.1,0,Math.PI*2);ctx.fill();
          if(burn>=1&&!TERRAIN_BAKING){
            const flick=0.65+0.35*Math.sin(t*16+x*2.2+y);
            ctx.globalAlpha=flick;
            ctx.fillStyle=burn>=2?"#ffb020":"#e25822";
            ctx.beginPath();ctx.arc(px+8,py+6,burn>=2?3.4:2,0,Math.PI*2);ctx.fill();
            ctx.globalAlpha=1;
          }
        }
        continue;
      }
      if(k===7){
        const pier=(bcAt(d.map,x-1,y)===3&&bcAt(d.map,x+1,y)===3)||(bcAt(d.map,x,y-1)===3&&bcAt(d.map,x,y+1)===3);
        if(pier){
          ctx.fillStyle="#0d4550";ctx.fillRect(px,py,BC_TS,BC_TS);
          ctx.fillStyle="#6e4a2c";
          if(bcAt(d.map,x,y-1)===3||bcAt(d.map,x,y+1)===3){
            ctx.fillRect(px+2,py,3,BC_TS);ctx.fillRect(px+8,py,3,BC_TS);ctx.fillRect(px+13,py,2,BC_TS);
          }else{
            ctx.fillRect(px,py+2,BC_TS,3);ctx.fillRect(px,py+8,BC_TS,3);ctx.fillRect(px,py+13,BC_TS,2);
          }
          ctx.fillStyle="rgba(255,236,210,.18)";
          if(bcAt(d.map,x,y-1)===3||bcAt(d.map,x,y+1)===3)ctx.fillRect(px+2,py,3,1);
          else ctx.fillRect(px,py+2,2,3);
        }else{
          ctx.fillStyle="#8d734c";ctx.fillRect(px,py,BC_TS,BC_TS);
          ctx.fillStyle="#c2a56e";
          ctx.fillRect(px+1,py+2,14,2);ctx.fillRect(px+1,py+7,14,2);ctx.fillRect(px+1,py+12,14,2);
          ctx.fillStyle="rgba(70,48,24,.35)";
          ctx.fillRect(px+6,py,1,BC_TS);
        }
        continue;
      }
      if(k===1){
        const sealed=!!(d.seal&&d.seal[y*BC_C+x]);
        let fort=!!d.maze;
        if(!fort)fort=nearFort(d,x,y);
        if(fort||sealed){
          drawMasonry(ctx,px,py,x,y,false);
        }else{
          drawHouseCell(ctx,d.map,x,y,px,py,houseMemo);
          const hi=y*BC_C+x;
          if(!TERRAIN_BAKING&&((d.hp[hi]||0)<2||(d.bHits&&d.bHits[hi]>0)))drawHouseFire(ctx,px,py,t,x,y,1);
        }
        continue;
      }
      if(k===8){
        const wet=bcAt(d.map,x-1,y)===3||bcAt(d.map,x+1,y)===3||bcAt(d.map,x,y-1)===3||bcAt(d.map,x,y+1)===3;
        ctx.fillStyle=wet?"#0d4550":"#cbb488";ctx.fillRect(px,py,BC_TS,BC_TS);
        ctx.fillStyle="rgba(16,18,16,.35)";
        ctx.beginPath();ctx.ellipse(px+9,py+10,5.4,3.2,0.4,0,Math.PI*2);ctx.fill();
        ctx.fillStyle=wet?"#5e6868":"#6e726c";
        ctx.beginPath();ctx.ellipse(px+8,py+8,5.2,3.6,-0.3,0,Math.PI*2);ctx.fill();
        ctx.fillStyle=wet?"#8d9694":"#9a9c94";
        ctx.beginPath();ctx.ellipse(px+6.5,py+6.5,2.4,1.6,0.2,0,Math.PI*2);ctx.fill();
        continue;
      }
      if(k===9){
        ctx.fillStyle="#cbb488";ctx.fillRect(px,py,BC_TS,BC_TS);
        continue;
      }
      if(k===2){drawMasonry(ctx,px,py,x,y,true);continue;}
      if(k===5){
        ctx.fillStyle="#1c1610";ctx.fillRect(px,py,BC_TS,BC_TS);
        ctx.fillStyle="#2a2218";ctx.fillRect(px+1,py+1,BC_TS-2,BC_TS-2);
        continue;
      }
    }
    drawTerrainPolish(ctx,d,t);
  }
  // Fort metal (tile 5) is indestructible, so the 7x7 "near a fort" mask is computed once per map.
  function nearFort(d,x,y){
    let m=d._nearFort;
    if(!m||m.n!==d.map.length){
      m=new Uint8Array(BC_C*BC_R);m.n=d.map.length;
      for(let yy=0;yy<BC_R;yy++)for(let xx=0;xx<BC_C;xx++){if(bcAt(d.map,xx,yy)!==5)continue;
        for(let dy=-3;dy<=3;dy++)for(let dx=-3;dx<=3;dx++){const X=xx+dx,Y=yy+dy;if(X>=0&&Y>=0&&X<BC_C&&Y<BC_R)m[Y*BC_C+X]=1;}}
      d._nearFort=m;
    }
    return m[y*BC_C+x]===1;
  }
  function drawTerrainCached(ctx,d,t,houseMemo){
    const dpr=canvasDpr();
    const W=BC_C*BC_TS,H=Math.max(S.H,BC_R*BC_TS);
    const c=terrainCache;
    // The baked layer is static (t=0) and only rebuilt when tiles change; the shoreline foam wobble is
    // drawn live on top from a cached list, so water animation no longer forces full-map rebakes.
    c.fr=(c.fr|0)+1;
    if(c.key==null||(c.fr&3)===0||c.d!==d){c.k2=terrainKey(d);c.d=d;}
    const key=c.k2;
    if(!c.cv||c.dpr!==dpr||c.key!==key){
      if(!c.cv)c.cv=document.createElement("canvas");
      if(c.dpr!==dpr||c.cv.width!==Math.round(Math.max(S.W,W)*dpr)){c.cv.width=Math.round(Math.max(S.W,W)*dpr);c.cv.height=Math.round(H*dpr);}
      const g=c.cv.getContext("2d");
      g.setTransform(dpr,0,0,dpr,0,0);
      TERRAIN_BAKING=true;
      try{drawTerrainBase(g,d,0,houseMemo);}finally{TERRAIN_BAKING=false;}
      c.dpr=dpr;c.key=key;
      const foam=[];
      for(let y=0;y<BC_R;y++)for(let x=0;x<BC_C;x++){
        if(bcAt(d.map,x,y)!==3)continue;
        let f=0;
        if(bcAt(d.map,x,y-1)!==3)f|=1;if(bcAt(d.map,x,y+1)!==3)f|=2;if(bcAt(d.map,x-1,y)!==3)f|=4;if(bcAt(d.map,x+1,y)!==3)f|=8;
        if(f)foam.push(x,y,f);
      }
      c.foam=foam;
    }
    ctx.drawImage(c.cv,0,0,c.cv.width,c.cv.height,0,0,c.cv.width/dpr,c.cv.height/dpr);
    if(c.foam&&c.foam.length){
      const tw=Math.floor(t*(LOW_END||DPR_CAP<2?2:4))/(LOW_END||DPR_CAP<2?2:4);
      ctx.fillStyle="rgba(226,232,220,.5)";
      const F=c.foam,T=BC_TS;
      for(let i=0;i<F.length;i+=3){
        const x=F[i],y=F[i+1],f=F[i+2];
        if(Math.sin(tw*1.6+x*0.9+y*1.3)<=0)continue;
        const px=x*T,py=y*T;
        if(f&1)ctx.fillRect(px,py+2,T,1);
        if(f&2)ctx.fillRect(px,py+T-3,T,1);
        if(f&4)ctx.fillRect(px+2,py,1,T);
        if(f&8)ctx.fillRect(px+T-3,py,1,T);
      }
    }
    // live fires (trees and houses), skipped while baking
    for(let y=0;y<BC_R;y++)for(let x=0;x<BC_C;x++){
      const k=bcAt(d.map,x,y);
      if(k!==4&&k!==1)continue;
      const hi=y*BC_C+x,px=x*BC_TS,py=y*BC_TS;
      if(k===4){
        const burn=d.hp[hi]||0;
        if(burn>=1){
          const flick=0.65+0.35*Math.sin(t*16+x*2.2+y);
          ctx.globalAlpha=flick;
          ctx.fillStyle=burn>=2?"#ffb020":"#e25822";
          ctx.beginPath();ctx.arc(px+8,py+6,burn>=2?3.4:2,0,Math.PI*2);ctx.fill();
          ctx.globalAlpha=1;
        }
        continue;
      }
      if(d.maze||(d.seal&&d.seal[hi]))continue;
      if(!((d.hp[hi]||0)<2||(d.bHits&&d.bHits[hi]>0)))continue;
      if(nearFort(d,x,y))continue;
      drawHouseFire(ctx,px,py,t,x,y,1);
    }
  }
  function drawDefense(ctx){
    const d=S.bcDefense;if(!d)return;
    const t=d.t||0;
    const houseMemo=new Map();
    ctx.save();
    const shk=(d.shake||0)>0.3?d.shake:0;
    const shx=shk?(Math.random()-.5)*2*shk:0, shy=shk?(Math.random()-.5)*2*shk:0;
    if(shk)ctx.translate(shx,shy);
    drawTerrainCached(ctx,d,t,houseMemo);
    if(!d.maze)for(let y=0;y<BC_R;y++)for(let x=0;x<BC_C;x++){
      if(bcAt(d.map,x,y)!==1)continue;
      if(d.seal&&d.seal[y*BC_C+x])continue;
      const info=houseInfo(d.map,x,y,houseMemo);
      if(x!==info.x0||y!==info.y0||!houseStruck(d,info))continue;
      if(nearFort(d,x,y))continue;
      drawHouseFire(ctx,info.x0*BC_TS+info.w*BC_TS/2-8,info.y0*BC_TS+info.h*BC_TS/2-10,t,x,y,1.85);
    }
    drawCitadelShield(ctx,d,t);
    drawWarFx(ctx,d,t);
    const blink=(d.playerInv>0||d.god>0)&&Math.floor(t*12)%2===0;
    const heroOrange="#c9843a";
    const ecol=(warBloc(d.bloc|0).paint)||"#4a5340";
    const pcol=d.god>0?"#ffe14a":heroOrange;
    d.player.tier=d.shotTier|0;
    if(!blink){if(d.naval)drawShip(ctx,d.player,pcol);else drawTank(ctx,d.player,pcol);}
    for(const e of d.enemies){
      const freeze=d.freeze||0;
      const thaw=freeze>0&&freeze<2;
      const hz=freeze<0.7?14:8;
      const paint=freeze<=0?ecol:(thaw&&Math.floor((d.t||0)*hz)%2===0?ecol:"#b7e4ff");
      const arriving=(e.spawn||0)>0;
      ctx.save();
      if(arriving)ctx.globalAlpha=0.5+0.22*Math.abs(Math.sin((d.t||0)*7));
      if(e.scale){ctx.translate(e.x,e.y);ctx.scale(e.scale,e.scale);ctx.translate(-e.x,-e.y);}
      if(e.type==="HELI")drawHeli(ctx,e,t,paint);
      else if(e.ship)drawShip(ctx,e,paint);
      else drawTank(ctx,e,paint);
      ctx.restore();
      drawEnemyMarks(ctx,d,e,t);
      if(arriving){
        const left=e.spawn;
        const rad=(e.sz||13)+8;
        ctx.save();
        ctx.translate(e.x,e.y);
        ctx.strokeStyle="rgba(255,225,74,.95)";
        ctx.lineWidth=2;
        ctx.setLineDash([3,3]);
        ctx.beginPath();ctx.arc(0,0,rad+Math.sin((d.t||0)*9)*1.4,0,Math.PI*2);ctx.stroke();
        ctx.setLineDash([]);
        ctx.strokeStyle="#fff6d0";
        ctx.lineWidth=2.4;
        ctx.beginPath();ctx.arc(0,0,rad+7,-Math.PI/2,-Math.PI/2+Math.PI*2*(left/1.3));ctx.stroke();
        ctx.fillStyle="#fff6d0";
        ctx.font='700 9px "IBM Plex Mono",monospace';
        ctx.textAlign="center";
        ctx.textBaseline="middle";
        ctx.fillText(String(Math.ceil(left)),0,-rad-12);
        ctx.restore();
      }
      if(!e.hero&&e.hp>0&&((e.shots|0)>0||(e.lrm|0)>0))drawUnitSmoke(ctx,e,t);
    }
    for(const pk of d.picks||[]){
      if(pk.ttl!=null&&pk.ttl<2.6&&Math.floor(t*8)%2===0)continue;
      const col=pk.kind==="heal"?"#e23b3b":pk.kind==="shot"?"#7fd0ff":pk.kind==="freeze"?"#9fd0ff":pk.kind==="bomb"?"#ff6a2a":pk.kind==="wall"?"#c8c4bc":"#ffe14a";
      const ink=pk.kind==="heal"||pk.kind==="bomb"?"#fff":"#120c02";
      const glyph=pk.kind==="heal"?"+":pk.kind==="shot"?"S":pk.kind==="freeze"?"F":pk.kind==="bomb"?"X":pk.kind==="wall"?"W":"★";
      ctx.save();
      ctx.translate(pk.x,pk.y);
      ctx.fillStyle="rgba(8,10,8,.35)";
      ctx.fillRect(-4,-2,12,10);
      ctx.fillStyle=col;
      ctx.fillRect(-6,-6,12,10);
      ctx.fillStyle="rgba(255,255,255,.28)";
      ctx.fillRect(-5,-5,10,2);
      ctx.fillStyle=ink;ctx.font="700 8px \"IBM Plex Mono\",monospace";ctx.textAlign="center";ctx.textBaseline="middle";
      ctx.fillText(glyph,0,-1);
      ctx.restore();
    }
    for(const s of d.shots){
      if(s.aa){ctx.fillStyle="#ffe14a";ctx.fillRect(s.x-1.2,s.y-6,2.4,12);}
      else{
        ctx.save();
        ctx.translate(s.x,s.y);
        ctx.rotate(Math.atan2(s.dy||0,s.dx||1));
        ctx.fillStyle=s.mine?BTC:"#efe6d4";
        ctx.fillRect(-6,-1.15,10,2.3);
        ctx.fillStyle="rgba(255,214,120,.9)";
        ctx.fillRect(-2,-0.55,3,1.1);
        ctx.restore();
      }
    }
    for(let y=0;y<BC_R;y++)for(let x=0;x<BC_C;x++){
      if(d.rubble&&d.rubble[y*BC_C+x]===2)drawLampRuin(ctx,x*BC_TS,y*BC_TS,x,y);
      if(bcAt(d.map,x,y)===9)drawBeacon(ctx,x*BC_TS,y*BC_TS,t,d.hp[y*BC_C+x]||0);
    }
    if(d.aaArmed&&d.reticle&&!d.frozen){
      const rx=d.reticle.x,ry=d.reticle.y;
      const R=lrmR(d);
      const aim=(d.shotTier|0)>=3?lrmAim(d,rx,ry):0;
      ctx.save();
      ctx.fillStyle="rgba(4,8,6,.28)";
      ctx.beginPath();
      ctx.rect(0,0,S.W,S.H);
      ctx.arc(rx,ry,R+18,0,Math.PI*2,true);
      ctx.fill("evenodd");
      ctx.strokeStyle="rgba(226,59,59,.95)";ctx.lineWidth=2.4;
      ctx.beginPath();ctx.arc(rx,ry,R,0,Math.PI*2);ctx.stroke();
      ctx.strokeStyle="rgba(226,59,59,.55)";ctx.lineWidth=1.2;
      ctx.beginPath();ctx.arc(rx,ry,R*0.62,0,Math.PI*2);ctx.stroke();
      ctx.strokeStyle="#ffe14a";ctx.lineWidth=1.6;
      ctx.beginPath();ctx.arc(rx,ry,Math.max(4,R*0.10),0,Math.PI*2);ctx.stroke();
      ctx.strokeStyle="#e23b3b";ctx.lineWidth=1.4;
      ctx.beginPath();
      const ux=Math.cos(aim), uy=Math.sin(aim), px=-uy, py=ux;
      ctx.moveTo(rx-ux*(R+8),ry-uy*(R+8));ctx.lineTo(rx-ux*R*0.12,ry-uy*R*0.12);
      ctx.moveTo(rx+ux*R*0.12,ry+uy*R*0.12);ctx.lineTo(rx+ux*(R+8),ry+uy*(R+8));
      ctx.moveTo(rx-px*(R+8),ry-py*(R+8));ctx.lineTo(rx-px*R*0.12,ry-py*R*0.12);
      ctx.moveTo(rx+px*R*0.12,ry+py*R*0.12);ctx.lineTo(rx+px*(R+8),ry+py*(R+8));
      ctx.stroke();
      ctx.restore();
    }
    drawBattleJuice(ctx,d,t);
    if(shk)ctx.translate(-shx,-shy);
    drawBattleHud2(ctx,d,t);
    drawHearts(ctx,d.player.hearts||0,d.player.maxHearts||3);
    ctx.textBaseline="alphabetic";ctx.textAlign="left";ctx.font='700 12px "IBM Plex Mono",monospace';
    const bname=chanceLang()?warBloc(d.bloc|0).shortEs:warBloc(d.bloc|0).short;
    const am=d.infAmmo?"∞":(d.reloadT>0?(chanceLang()?"RECARGA":"RELOAD"):((d.ammo|0)+"/"+AMMO_MAX));
    ctx.font='700 14px "IBM Plex Mono",monospace';
    paintHaloText(ctx,(chanceLang()?"BALAS ":"AMMO ")+am,12,54,d.reloadT>0||(!d.infAmmo&&(d.ammo|0)<=3)?"#ff6a4a":"#ffd24a");
    ctx.font='700 12px "IBM Plex Mono",monospace';
    paintHaloText(ctx,"KIA "+(d.kills|0)+"/"+(d.enemyTotal||0),12,70,PAL.fg);
    paintHaloText(ctx,bname,12,86,PAL.fg);
    if(d.naval)paintHaloText(ctx,chanceLang()?"MAR":"SEA",12,102,"#9befff");
    if(d.zoneEn){
      const st=MAP_STAGE_NAME[d.stage];
      const zl=(chanceLang()?d.zoneEs:d.zoneEn)+(st?" · "+st[chanceLang()?1:0]:"");
      ctx.textAlign="right";paintHaloText(ctx,zl,S.W-12,46,"#f3efe6");ctx.textAlign="left";
    }
    if(d.wall>0){ctx.textAlign="right";paintHaloText(ctx,(chanceLang()?"MURO ":"WALL ")+d.wall+"%",S.W-12,62,BTC);}
    if((d.shotTier|0)>0){ctx.textAlign="right";paintHaloText(ctx,"S"+(d.shotTier|0),S.W-12,78,"#9befff");}
    if(!d.frozen){
      ctx.textAlign="left";ctx.font='700 11px "IBM Plex Mono",monospace';
      paintHaloText(ctx,(chanceLang()?"EJÉRCITO ":"ARMY ")+(S.bcArmy||0)+(chanceLang()?"  MUNDO ":"  WORLD ")+(S.bcWorld||20),12,S.H-12,PAL.fg);
    }
    ctx.textAlign="center";ctx.font='700 10px "IBM Plex Mono",monospace';
    ctx.restore();
  }
  function paintBtcSign(ctx,s,col){
    ctx.save();
    ctx.strokeStyle=col;ctx.fillStyle=col;
    ctx.lineCap="round";ctx.lineJoin="round";
    ctx.lineWidth=Math.max(1.15,s*0.11);
    ctx.beginPath();
    ctx.moveTo(-s*0.16,-s*0.58);ctx.lineTo(-s*0.16,s*0.58);
    ctx.moveTo(s*0.08,-s*0.58);ctx.lineTo(s*0.08,s*0.58);
    ctx.stroke();
    ctx.lineWidth=Math.max(1.5,s*0.16);
    ctx.beginPath();
    ctx.moveTo(-s*0.22,-s*0.4);ctx.lineTo(-s*0.22,s*0.4);
    ctx.moveTo(-s*0.22,-s*0.4);
    ctx.bezierCurveTo(s*0.46,-s*0.4,s*0.42,-s*0.04,-s*0.22,-s*0.02);
    ctx.moveTo(-s*0.22,0);
    ctx.bezierCurveTo(s*0.52,0,s*0.5,s*0.42,-s*0.22,s*0.4);
    ctx.stroke();
    ctx.restore();
  }
  function drawBeacon(ctx,px,py,t,burn){
    ctx.save();
    ctx.translate(px+8,py+15);
    ctx.fillStyle="rgba(0,0,0,.28)";
    ctx.beginPath();ctx.ellipse(0,2,12,3.4,0,0,Math.PI*2);ctx.fill();
    ctx.fillStyle="#5e5c58";
    ctx.beginPath();ctx.moveTo(-11,3);ctx.lineTo(-7,-2);ctx.lineTo(-2,1);ctx.lineTo(3,-4);ctx.lineTo(9,1);ctx.lineTo(12,3);ctx.closePath();ctx.fill();
    ctx.fillStyle="#f6f1e6";
    ctx.beginPath();ctx.moveTo(-6,3);ctx.lineTo(-4,-28);ctx.lineTo(4,-28);ctx.lineTo(6,3);ctx.closePath();ctx.fill();
    ctx.fillStyle="#c4372c";
    ctx.beginPath();ctx.moveTo(-5.6,-4);ctx.lineTo(-5.2,-10);ctx.lineTo(5.2,-10);ctx.lineTo(5.6,-4);ctx.closePath();ctx.fill();
    ctx.beginPath();ctx.moveTo(-4.9,-16);ctx.lineTo(-4.5,-22);ctx.lineTo(4.5,-22);ctx.lineTo(4.9,-16);ctx.closePath();ctx.fill();
    ctx.fillStyle="#e7e0d2";
    ctx.fillRect(-2.4,-12,1.6,2.4);ctx.fillRect(0.8,-12,1.6,2.4);
    ctx.fillRect(-2.4,-7,1.6,2.4);ctx.fillRect(0.8,-7,1.6,2.4);
    ctx.fillStyle="#2c261e";ctx.fillRect(-6.5,-31,13,3.2);
    const glow=ctx.createRadialGradient(0,-34,1,0,-34,16);
    glow.addColorStop(0,"rgba(255,240,170,"+(0.75+0.25*Math.sin((t||0)*3)).toFixed(2)+")");glow.addColorStop(1,"rgba(255,240,170,0)");
    ctx.fillStyle=glow;ctx.beginPath();ctx.arc(0,-34,16,0,Math.PI*2);ctx.fill();
    ctx.fillStyle="#f2d56a";ctx.fillRect(-4,-38,8,7);
    ctx.fillStyle="#fff8d0";ctx.fillRect(-1.6,-36.5,3,4);
    ctx.fillStyle="#8e1e18";ctx.beginPath();ctx.arc(0,-38,4.2,Math.PI,0);ctx.fill();
    ctx.fillStyle="#f4efe4";ctx.fillRect(-0.6,-44,1.2,4);
    ctx.save();
    ctx.translate(0,-34);
    ctx.rotate((t||0)*0.8);
    ctx.globalAlpha=0.34;
    ctx.fillStyle="#ffe9a0";
    ctx.beginPath();ctx.moveTo(0,0);ctx.lineTo(48,-6);ctx.lineTo(48,6);ctx.closePath();ctx.fill();
    ctx.rotate(Math.PI);
    ctx.beginPath();ctx.moveTo(0,0);ctx.lineTo(34,-4);ctx.lineTo(34,4);ctx.closePath();ctx.fill();
    ctx.restore();
    if(burn){
      const flick=0.55+0.45*Math.sin((t||0)*16);
      ctx.globalAlpha=flick;
      ctx.fillStyle="#e25822";
      ctx.beginPath();ctx.ellipse(0,1,7,3.2,0,0,Math.PI*2);ctx.fill();
      ctx.fillStyle="#ffb020";
      ctx.beginPath();ctx.moveTo(0,-12);ctx.lineTo(3.4,2);ctx.lineTo(-3.4,2);ctx.closePath();ctx.fill();
      ctx.fillStyle="#ffe08a";
      ctx.beginPath();ctx.moveTo(0,-8);ctx.lineTo(1.6,0);ctx.lineTo(-1.6,0);ctx.closePath();ctx.fill();
      ctx.globalAlpha=1;
    }
    ctx.restore();
  }
  const HOUSE_LOOK=[
    {wall:"#f4e7cf",roof:"#a33b2b",trim:"#6e241c",door:"#6b3e22",win:"#d7eef8",frame:"#f7f3ea"},
    {wall:"#b85a45",roof:"#3e4654",trim:"#d8d4cc",door:"#24160e",win:"#c5d6e0",frame:"#f4efe6",chim:"#7a3b32"},
    {wall:"#f7f3e8",roof:"#6b3a22",trim:"#3a2418",door:"#3a2418",win:"#d5e2ea",frame:"#f7f3e8",beam:"#3a2418"},
    {wall:"#f6f3ee",roof:"#d06a3a",trim:"#a84e2c",door:"#2a5f86",win:"#d5e6ef",frame:"#f6f3ee",shutter:"#2a5f86"},
    {wall:"#e7e0d2",roof:"#4a5560",trim:"#2c3136",door:"#6b3e22",win:"#b7d7ea",frame:"#f4efe6",awning:"#c23b3b",shop:1},
    {wall:"#f0d78a",roof:"#2c3340",trim:"#1c2228",door:"#1a120c",win:"#d5e4ee",frame:"#f7f1dc",dormer:1},
    {wall:"#e4ddcf",roof:"#4a4038",trim:"#2c261e",door:"#6e2420",win:"#d5dde4",frame:"#efe8da",tower:1},
    {wall:"#8d4e3c",roof:"#6a7178",trim:"#3a4046",door:"#2a211c",win:"#9ec4d4",frame:"#d7d0c4",flat:1}
  ];
  function houseStruck(d,info){
    if(!info)return false;
    if(info.n!==info.w*info.h)return true;
    for(let y=info.y0;y<info.y0+info.h;y++)for(let x=info.x0;x<info.x0+info.w;x++){
      if(bcAt(d.map,x,y)!==1)continue;
      const i=y*BC_C+x;
      if((d.hp[i]||0)<2||(d.bHits&&d.bHits[i]>0))return true;
    }
    return false;
  }
  function houseInfo(m,x,y,memo){
    const key=y*BC_C+x;
    if(memo.has(key))return memo.get(key);
    const qx=[x], qy=[y];
    const mark=new Uint8Array(m.length);
    mark[key]=1;
    let x0=x,y0=y,x1=x,y1=y;
    for(let i=0;i<qx.length&&qx.length<48;i++){
      const cx=qx[i], cy=qy[i];
      if(cx<x0)x0=cx; if(cy<y0)y0=cy; if(cx>x1)x1=cx; if(cy>y1)y1=cy;
      for(let k=0;k<4;k++){
        const nx=cx+(k===0?1:k===1?-1:0), ny=cy+(k===2?1:k===3?-1:0);
        if(nx<0||ny<0||nx>=BC_C||ny>=BC_R)continue;
        const id=ny*BC_C+nx;
        if(mark[id]||m[id]!==1)continue;
        mark[id]=1; qx.push(nx); qy.push(ny);
      }
    }
    const w=x1-x0+1, h=y1-y0+1;
    const info={x0,y0,w,h,n:qx.length,style:(x0*5+y0*3)&7};
    for(let i=0;i<qx.length;i++)memo.set(qy[i]*BC_C+qx[i],info);
    return info;
  }
  function drawBuilding(ctx,W,H,s){
    ctx.fillStyle="rgba(18,14,10,.38)";
    ctx.fillRect(2,3,Math.max(1,W-1),Math.max(1,H-1));
    ctx.fillStyle=tone(s.wall,-30);
    ctx.fillRect(0,0,Math.max(2,W-1),Math.max(2,H-2));
    ctx.fillStyle=s.roof;
    ctx.fillRect(1,1,Math.max(2,W-3),Math.max(2,H-4));
    ctx.fillStyle=tone(s.roof,-26);
    ctx.beginPath();
    ctx.moveTo(1,H-4);
    ctx.lineTo(Math.max(2,W-3),H-4);
    ctx.lineTo(Math.max(2,W-6),H*0.55);
    ctx.lineTo(4,H*0.55);
    ctx.closePath();
    ctx.fill();
    ctx.fillStyle=tone(s.roof,16);
    ctx.fillRect(2,2,Math.max(2,W*0.46),1.3);
    ctx.strokeStyle=tone(s.roof,-34);
    ctx.lineWidth=1;
    ctx.beginPath();
    ctx.moveTo(W*0.5,2);
    ctx.lineTo(W*0.5,Math.max(3,H-5));
    ctx.stroke();
    if(W>18&&H>14){
      ctx.fillStyle=s.win;
      const sw=Math.max(3,W*0.14), sh=Math.max(2,H*0.12);
      ctx.fillRect(W*0.3,H*0.26,sw,sh);
      ctx.fillStyle="rgba(255,255,255,.4)";
      ctx.fillRect(W*0.3,H*0.26,1,sh);
    }
    ctx.fillStyle=s.trim;
    ctx.fillRect(Math.max(2,W-8),3,4,3);
    if(s.tower&&W>=24&&H>=24){
      ctx.fillStyle=tone(s.roof,-14);
      ctx.fillRect(W*0.58,H*0.18,W*0.26,H*0.26);
      ctx.strokeStyle=tone(s.roof,-36);
      ctx.strokeRect(W*0.58,H*0.18,W*0.26,H*0.26);
    }
  }
  function drawHouseRuin(ctx,m,x,y,px,py,s){
    ctx.fillStyle="#5c6840";
    ctx.fillRect(px,py,BC_TS,BC_TS);
    ctx.fillStyle=s.roof;
    ctx.fillRect(px+1,py+1,9,7);
    ctx.fillStyle=tone(s.roof,-28);
    ctx.fillRect(px+1,py+7,9,1);
    ctx.fillStyle="rgba(16,12,8,.6)";
    ctx.fillRect(px+3,py+3,4,3);
    ctx.fillStyle=s.wall;
    ctx.fillRect(px+8,py+10,6,3);
    ctx.fillRect(px+2,py+12,4,2);
  }
  function drawHouseCell(ctx,m,x,y,px,py,memo){
    const info=houseInfo(m,x,y,memo);
    const s=HOUSE_LOOK[info.style]||HOUSE_LOOK[0];
    const broken=info.n!==info.w*info.h||info.w<2||info.h<2;
    ctx.save();
    ctx.beginPath();
    ctx.rect(px,py,BC_TS,BC_TS);
    ctx.clip();
    if(broken){
      drawHouseRuin(ctx,m,x,y,px,py,s);
      ctx.restore();
      return;
    }
    const W=info.w*BC_TS, H=info.h*BC_TS;
    ctx.translate(px-(x-info.x0)*BC_TS, py-(y-info.y0)*BC_TS);
    drawBuilding(ctx,W,H,s);
    ctx.restore();
  }
  function drawUnitSmoke(ctx,e,t){
    const n=(e.maxHp||2)>=3?3:2;
    ctx.save();
    for(let i=0;i<n;i++){
      const ph=(t*0.7+i*0.41)%1;
      const sx=e.x+Math.sin(t*2.4+i*2)*3;
      const sy=e.y-8-ph*18;
      ctx.globalAlpha=(1-ph)*0.5;
      ctx.fillStyle=i%2?"#b7b7b7":"#ececec";
      ctx.beginPath();
      ctx.arc(sx,sy,1.8+ph*2.6,0,Math.PI*2);
      ctx.fill();
    }
    ctx.restore();
  }
  function drawCitadelShield(ctx,d,t){
    const c=shieldCenter(d);
    const hp=Math.max(0,Math.min(100,d.integrity||0))/100;
    const col=hp>.66?"#f2a900":hp>.33?"#d07a14":"#9a3a18";
    ctx.save();
    ctx.translate(c.x,c.y);
    ctx.beginPath();
    ctx.rect(-16,-16,32,32);
    ctx.clip();
    const plate=ctx.createLinearGradient(-16,-16,16,16);
    plate.addColorStop(0,"#fff4c8");
    plate.addColorStop(0.42,"#f2a900");
    plate.addColorStop(1,"#8a4e08");
    ctx.fillStyle=plate;
    ctx.fillRect(-16,-16,32,32);
    ctx.fillStyle="#2a1c0c";
    ctx.fillRect(-13,-13,26,26);
    ctx.strokeStyle="#ffe7a0";
    ctx.lineWidth=1.2;
    ctx.strokeRect(-13.5,-13.5,27,27);
    ctx.save();
    ctx.beginPath();
    ctx.rect(-12,-12,24,24);
    ctx.clip();
    const wash=ctx.createLinearGradient(0,12,0,-12);
    wash.addColorStop(0,col);
    wash.addColorStop(1,hp>.66?"#ffe08a":col);
    ctx.fillStyle=wash;
    ctx.fillRect(-12,12-24*hp,24,24*hp+1);
    ctx.fillStyle="rgba(255,255,255,.2)";
    ctx.fillRect(-10,-10,4,16*hp);
    ctx.restore();
    ctx.fillStyle="#6a3e08";
    [[-14,-14],[12,-14],[-14,12],[12,12]].forEach(([x,y])=>{
      ctx.beginPath();ctx.arc(x+1,y+1,1.3,0,Math.PI*2);ctx.fill();
    });
    paintBtcSign(ctx,11,"#fff6d0");
    ctx.restore();
    if(d.shards){
      for(const sh of d.shards){
        const a=1-sh.t/sh.life;
        ctx.save();
        ctx.translate(sh.x,sh.y);ctx.rotate(sh.rot);
        ctx.globalAlpha=Math.max(0,a);
        ctx.fillStyle=col;
        ctx.beginPath();ctx.moveTo(-4,-3);ctx.lineTo(5,-2);ctx.lineTo(2,5);ctx.lineTo(-3,4);ctx.closePath();ctx.fill();
        ctx.restore();
      }
    }
  }
  function drawWarFx(ctx,d,t){
    if(!d.fx)return;
    for(const f of d.fx){
      const u=Math.max(0,Math.min(1,f.t/f.life));
      ctx.save();
      if(f.kind==="eat"){
        const r=6+u*22;
        ctx.globalAlpha=1-u;
        ctx.strokeStyle=f.col||"#ffe14a";ctx.lineWidth=2.4;
        ctx.beginPath();ctx.arc(f.x,f.y,r,0,Math.PI*2);ctx.stroke();
        for(let i=0;i<8;i++){
          const a=i*Math.PI/4+(t||0);
          ctx.fillStyle=f.col||"#ffe14a";
          ctx.beginPath();ctx.arc(f.x+Math.cos(a)*r,f.y+Math.sin(a)*r,2.2*(1-u),0,Math.PI*2);ctx.fill();
        }
        ctx.globalAlpha=1-u;
        ctx.fillStyle="#fff6d8";ctx.font='700 11px "IBM Plex Mono",monospace';
        ctx.textAlign="center";ctx.fillText(numL(f.label||"+"),f.x,f.y-10-u*16);
      }else if(f.kind==="spawn"){
        ctx.globalAlpha=1-u;
        ctx.strokeStyle="#ffe14a";ctx.lineWidth=2.2;
        ctx.beginPath();ctx.arc(f.x,f.y,5+u*28,0,Math.PI*2);ctx.stroke();
        ctx.strokeStyle="rgba(255,246,208,.85)";ctx.lineWidth=1.4;
        ctx.beginPath();ctx.arc(f.x,f.y,2+u*12,0,Math.PI*2);ctx.stroke();
        ctx.fillStyle="#f2a900";
        for(let i=0;i<6;i++){
          const a=i*Math.PI/3;
          ctx.fillRect(f.x+Math.cos(a)*u*20-1.3,f.y+Math.sin(a)*u*20-1.3,2.6,2.6);
        }
      }else if(f.kind==="lrmFire"){
        ctx.globalAlpha=1-u;
        ctx.strokeStyle="#ffe14a";ctx.lineWidth=3;
        ctx.beginPath();ctx.arc(f.x,f.y,8+u*70,0,Math.PI*2);ctx.stroke();
        ctx.strokeStyle="#e23b3b";ctx.lineWidth=1.5;
        ctx.beginPath();ctx.arc(f.x,f.y,4+u*28,0,Math.PI*2);ctx.stroke();
      }else if(f.kind==="lrmKill"){
        ctx.globalAlpha=1-u;
        ctx.fillStyle="#ffe14a";
        for(let i=0;i<10;i++){
          const a=i*Math.PI/5;
          ctx.fillRect(f.x+Math.cos(a)*u*28-1.5,f.y+Math.sin(a)*u*28-1.5,3,3);
        }
      }else if(f.kind==="scopeOn"){
        ctx.globalAlpha=1-u;
        ctx.strokeStyle="#9befff";ctx.lineWidth=2;
        ctx.beginPath();ctx.arc(f.x,f.y,20+u*40,0,Math.PI*2);ctx.stroke();
      }else if(f.kind==="treeBurn"){
        ctx.globalAlpha=1-u;
        const hot=f.hot||1;
        ctx.fillStyle=hot>=3?"#ffd27a":"#ff8a1e";
        for(let i=0;i<5;i++){
          const a=-Math.PI/2+(i-2)*0.45;
          ctx.beginPath();
          ctx.ellipse(f.x+Math.cos(a)*u*6,f.y-4-u*(8+hot*3)+Math.sin(a)*2,1.4,3.2+hot,0,0,Math.PI*2);
          ctx.fill();
        }
      }else if(f.kind==="boom"){
        const R0=f.r||22;
        ctx.globalAlpha=Math.max(0,1-u);
        ctx.fillStyle="rgba(255,190,80,"+(0.55*(1-u)).toFixed(2)+")";
        ctx.beginPath();ctx.arc(f.x,f.y,R0*(0.35+u*0.65),0,Math.PI*2);ctx.fill();
        ctx.strokeStyle="#fff1c4";ctx.lineWidth=2.5*(1-u)+0.5;
        ctx.beginPath();ctx.arc(f.x,f.y,R0*(0.5+u*0.7),0,Math.PI*2);ctx.stroke();
        if(u<.3){ctx.fillStyle="#fffbe8";ctx.beginPath();ctx.arc(f.x,f.y,R0*0.28*(1-u*3),0,Math.PI*2);ctx.fill();}
      }else if(f.kind==="tracer"){
        ctx.globalAlpha=1-u;ctx.strokeStyle="#ffe14a";ctx.lineWidth=1.4;
        ctx.beginPath();ctx.moveTo(f.x,f.y);ctx.lineTo(f.x2,f.y2);ctx.stroke();
      }else if(f.kind==="shieldHit"){
        ctx.globalAlpha=1-u;
        ctx.strokeStyle="#f2a900";ctx.lineWidth=3;
        ctx.beginPath();ctx.arc(f.x,f.y,10+u*26,0,Math.PI*2);ctx.stroke();
      }
      ctx.restore();
    }
  }
  function drawHearts(ctx,hearts,max){
    const n=Math.max(1,Math.min(6,max|0||3));
    const filled=Math.max(0,Math.min(n,hearts|0));
    const gap=n>4?16:20, s=n>4?6.4:7.6;
    const label=filled+"/"+n;
    ctx.save();
    ctx.font='700 12px "IBM Plex Mono",monospace';
    const lw=ctx.measureText(label).width;
    const w=14+n*gap+lw+10, h=30, px=6, py=6;
    ctx.fillStyle="rgba(10,8,4,.72)";
    ctx.strokeStyle="rgba(243,239,230,.35)";
    ctx.lineWidth=1.5;
    ctx.beginPath();
    ctx.roundRect(px,py,w,h,8);
    ctx.fill();ctx.stroke();
    for(let i=0;i<n;i++){
      const x=px+14+i*gap, y=py+15, on=i<filled;
      ctx.beginPath();
      ctx.moveTo(x,y+s*0.55);
      ctx.bezierCurveTo(x-s*0.15,y+s*0.25,x-s*0.95,y+s*0.2,x-s*0.95,y-s*0.15);
      ctx.bezierCurveTo(x-s*0.95,y-s*0.55,x-s*0.45,y-s*0.75,x,y-s*0.35);
      ctx.bezierCurveTo(x+s*0.45,y-s*0.75,x+s*0.95,y-s*0.55,x+s*0.95,y-s*0.15);
      ctx.bezierCurveTo(x+s*0.95,y+s*0.2,x+s*0.15,y+s*0.25,x,y+s*0.55);
      ctx.closePath();
      ctx.fillStyle=on?"#e23b3b":"#141414";
      ctx.fill();
      ctx.lineWidth=1.6;
      ctx.strokeStyle=on?"#ffe4e4":"#8a8680";
      ctx.stroke();
      if(on){
        ctx.fillStyle="rgba(255,255,255,.55)";
        ctx.beginPath();ctx.arc(x-s*0.38,y-s*0.22,1.4,0,Math.PI*2);ctx.fill();
      }
    }
    ctx.fillStyle="#f3efe6";
    ctx.textAlign="left";
    ctx.textBaseline="middle";
    ctx.fillText(label, px+10+n*gap, py+h/2+0.5);
    ctx.restore();
  }
  function drawHeli(ctx,e,t,col){
    ctx.save();ctx.translate(e.x,e.y);
    const fill=col||"#4a5340";
    const dark=tone(fill,-42);
    ctx.fillStyle="rgba(10,14,10,.32)";
    ctx.beginPath();ctx.ellipse(2,4,10,5.5,0,0,Math.PI*2);ctx.fill();
    ctx.rotate(facingRot(e));
    const spin=(t||0)*14;
    ctx.strokeStyle="rgba(232,234,226,.4)";ctx.lineWidth=1;
    ctx.beginPath();ctx.arc(0,-1,11,0,Math.PI*2);ctx.stroke();
    ctx.save();
    ctx.translate(0,-1);ctx.rotate(spin);ctx.globalAlpha=.5;
    ctx.strokeStyle="rgba(28,30,24,.85)";
    ctx.beginPath();ctx.moveTo(-12,0);ctx.lineTo(12,0);ctx.moveTo(0,-12);ctx.lineTo(0,12);ctx.stroke();
    ctx.restore();
    ctx.fillStyle=dark;
    ctx.beginPath();ctx.moveTo(0,-8);ctx.lineTo(3.1,-1);ctx.lineTo(2.1,5.5);ctx.lineTo(0,8.5);ctx.lineTo(-2.1,5.5);ctx.lineTo(-3.1,-1);ctx.closePath();ctx.fill();
    ctx.fillStyle=fill;
    ctx.beginPath();ctx.moveTo(0,-6.4);ctx.lineTo(2.1,-1);ctx.lineTo(1.4,4.6);ctx.lineTo(-1.4,4.6);ctx.lineTo(-2.1,-1);ctx.closePath();ctx.fill();
    ctx.fillStyle="rgba(186,214,208,.8)";
    ctx.beginPath();ctx.ellipse(0,-3.1,1.5,2,0,0,Math.PI*2);ctx.fill();
    ctx.fillStyle=dark;ctx.fillRect(-0.65,4.2,1.3,5.2);
    ctx.strokeStyle="rgba(28,30,24,.75)";ctx.lineWidth=1;
    ctx.beginPath();ctx.moveTo(-2.6,9.2);ctx.lineTo(2.6,9.2);ctx.stroke();
    ctx.fillStyle="#1c1e16";
    ctx.beginPath();ctx.arc(0,-1,1.25,0,Math.PI*2);ctx.fill();
    ctx.restore();
  }
  function defenseInput(){}
  function setPhase(p) {
    S.phase = p;
    try {
      if (A) {
        if (p === "play") {
          try { if (A.releaseCue) A.releaseCue(); } catch (e) {}
          if (A.battleMusic) A.battleMusic(false);
          kickTheme();
        }
        else {
          if (A.stopMusic) A.stopMusic();
          if (A.battleMusic) A.battleMusic(false);
        }
      }
    } catch (e) {}
    const fieldBattle = p === "defense" || !!(S.bcDefense && S.bcDefense.frozen && p === "chance");
    if (field) {
      field.classList.toggle("bull", !fieldBattle && S.power === "BULL");
      field.classList.toggle("bear", !fieldBattle && S.power === "BEAR");
      field.classList.toggle("swan-bear", !fieldBattle && S.power === "BEAR" && S.swanBear);
      field.classList.toggle("perk-ui", p === "perk" || p === "chance" || (p === "paused" && S.arcHold));
      field.classList.toggle("is-play", p === "play");
      field.classList.toggle("defense-mode", fieldBattle);
    }
    const pad=$("def-pad");if(pad)pad.classList.toggle("hide", p!=="defense" || !!(S.bcDefense && S.bcDefense.frozen));
    if(p!=="defense"){S.defPtr=null;if(S.defHeld)S.defHeld={u:0,d:0,l:0,r:0,f:0,aa:0};}
    try { renderOverlay(); } catch (e) { if (p !== "play") showOverlay(); }
    try { renderHud(); } catch (e) {}
  }

  function startGame(ranked) {
    if (!S.mp) { S.worldSeed = 0; S.worldRand = null; S.mpOver = false; S.mpPlayAt = 0; }
    S.ranked = ranked !== false;
    wipeShotKeep();
    if (A && A.unlock) try { A.unlock(); } catch (e) {}
    if (A && A.sfx && A.sfx.start) try { A.sfx.start(); } catch (e) {}
    S.humanInput = true;
    S.introCounted = true;
    preloadChanceArt();
    if (!S.welcomed) {
      S.welcomed = true;
      try {
        A.speak(formatVoice("Welcome to Choppy Bitcoin: Survive the market!"));
        S.ticker = t("welcome");
        S.tickerT = 3;
      } catch (e) {}
    }
    resetWorld(false);
    applyTestLoadout();
    S.dead = false;
    S.trainBattleLose = false;
    S.phase = "play";
    if (field) field.classList.add("is-play");
    if (overlay) hideOverlay();
    if (field) field.style.pointerEvents = "auto";
    if (canvas) canvas.style.pointerEvents = "auto";
    if (A && A.startMusic) kickTheme();
    renderHud();
  }

  function keepPlaying() {
    if (S.winKind !== "indep") S.hitCap = true;
    S.winKind = "";
    S.runTab = null;
    S.arcHold = false;
    setPhase("play");
  }
  // Independence ending: freeze the run as a victory (best score saved, stats snapshot) with the
  // same Keep playing / Stats / Play again / Share screen as the 21M cap.
  function endIndependence() {
    if (S.mp || !S.bcVictory || S.dead || S.phase === "over" || S.phase === "win") return;
    if (S.phase === "defense" || S.chanceCard) return;
    S.winKind = "indep";
    S.indepEnded = true;
    try { const p = $("bc-panel"); if (p) p.classList.add("hide"); } catch (e) {}
    S.optPanel = null;
    snapshotRun();
    try { S.best = saveBest(scoreSats()); } catch (e) {}
    setPhase("win");
  }

  function retryLostBattle(){
    recallShot();
    const tier=shotKeep.tier, spread=shotKeep.spread;
    S.trainBattleLose=false;
    S.dead=false;
    S.runTab=null;
    S.bcMapPlan=null;
    S.bcMapSeed=(Math.random()*0x7fffffff)|1;
    shotKeep.tier=tier;
    shotKeep.spread=spread;
    S.bcShotTier=tier;
    S.bcShotSpread=spread;
    if(field)field.classList.add("is-play");
    startDefense();
  }
  const AID_COSTS=[2.1,21,210];
  function aidOffer(){
    const i=S.bcAidUsed|0;
    return i<AID_COSTS.length?AID_COSTS[i]:0;
  }
  function aidBtcLabel(n){
    const v=Math.round((Number(n)||0)*10)/10;
    const whole=Math.abs(v-Math.round(v))<1e-6;
    const s=v.toLocaleString("en-US",{minimumFractionDigits:whole?0:1,maximumFractionDigits:1});
    return s+" BTC";
  }
  // Military aid is priced in BTC but can be topped up with cash at the current price.
  function aidReach(){
    const px=clampPx(S.price);
    return (S.btc||0)+Math.max(0,S.cash||0)/px;
  }
  function payMilitaryAid(){
    const cost=aidOffer();
    if(!cost||aidReach()+1e-6<cost) return;
    const fromBtc=Math.min(S.btc||0,cost);
    S.btc=Math.max(0,(S.btc||0)-fromBtc);
    const restUsd=(cost-fromBtc)*clampPx(S.price);
    if(restUsd>0)S.cash=Math.max(0,(S.cash||0)-restUsd);
    S.bcAidUsed=(S.bcAidUsed|0)+1;
    retryLostBattle();
  }
  function refuseMilitaryAid(){
    S.trainBattleLose=false;
    renderOverlay();
  }
  function replay() {
    A.cancelSpeech();
    S.trainBattleLose = false;
    wipeShotKeep();
    resetWorld(false);
    applyTestLoadout();
    setPhase("play");
  }

  function step(dt) {
    if (S.phase === "defense" || (S.bcDefense && S.bcDefense.frozen)) {
      S.lifeT += dt;
      if (S.bcDefense && S.bcDefense.frozen) S.bcDefense.t = (S.bcDefense.t || 0) + dt;
      if (S.phase === "defense") {
        const bd = S.bcDefense;
        if (bd) bd.shake = (bd.shake || 0) * 0.86;
        if (bd && bd.hitstop > 0) bd.hitstop -= dt;
        else {
          let k = 1;
          if (bd && bd.slow > 0) { bd.slow -= dt; k = 0.35; }
          stepDefense(dt * k);
        }
      }
      return;
    }
    const m = metrics();
    S.bird.r = m.birdR;
    S.bg += m.speed * 0.35 * dt;
    S.widthMul += (S.widthT - S.widthMul) * Math.min(1, 1.7 * dt);
    S.heightMul += (S.heightT - S.heightMul) * Math.min(1, 1.7 * dt);
    if (S.tickerT > 0) { S.tickerT -= dt; if (S.tickerT <= 0) S.ticker = ""; }
    for (const p of S.particles) { p.x += p.vx * dt; p.y += p.vy * dt; p.vy += 420 * dt; p.life -= dt; }
    S.particles = S.particles.filter((p) => p.life > 0);
    for (const f of S.floats) { f.y += f.vy * dt; f.life -= dt; }
    S.floats = S.floats.filter((f) => f.life > 0);
    if (S.phase !== "play") return;
    if (S.invuln > 0) S.invuln -= dt;

    let speed = m.speed * scrollMul();
    if (S.laserOn || streakLeft(S.lifeT) > 0) speed *= 1.28;
    for (const f of S.floats) f.x -= speed * dt;
    if ((S.waves || []).length) {
      S.cycleManip = Math.max(0.15, (S.cycleManip || 1) * (1 + trendBias() * dt));
      const now = S.lifeT;
      let sum = 0;
      for (const w of S.waves) sum += waveK(w, now);
      S.price = clampPx((S.priceBase || S.cycleStart || S.price) * waveMul(sum) * S.cycleManip);
      if (S.level >= 2 && S.vtCycle > 0) S.vtPrice = Math.max(1, S.vtCycle * (1 + sum * 0.45) * S.cycleManip);
      noteCyclePrice();
      updateTapeLive(now);
      syncWaveFlags();
      if (streakLeft(now) <= 0) endCycle();
    } else {
      const bias = trendBias();
      const mid = bias > 0.001 ? 0.42 : bias < -0.001 ? 0.58 : 0.48;
      const px = clampPx(S.price);
      S.price = clampPx(px + (Math.random() - mid) * px * 0.012 * dt + px * bias * dt);
      if (S.level >= 2) S.vtPrice = Math.max(1, S.vtPrice + (Math.random() - 0.45) * S.vtPrice * 0.01 * dt + S.vtPrice * 0.0012 * dt);
    }
    S.lifeT += dt; S.sampleAcc += dt;
    try { awardTick(dt); } catch (e) {}
    tickAi(dt);
    while (S.sampleAcc >= 0.12) {
      S.tape.push(S.price);
      S.tapeCash.push(S.cash);
      S.tapeBtcBag.push(S.btc);
      S.tapeNet.push(netBtc());
      if (S.level >= 2) S.tapeVt.push(S.vtPrice);
      S.sampleAcc -= 0.12;
    }
    if (!S.hitCap && (S.btc || 0) >= BTC_CAP) {
      S.btc = BTC_CAP;
      S.hitCap = true; A.sfx.cap();
      if (S.mp) return;
      A.speak(t("floatYours"), true);
      snapshotRun();
      try { S.best = saveBest(scoreSats()); } catch (e) {}
      setPhase("win");
      return;
    }
    if (S.laserOn) { S.laserT -= dt; if (S.laserT <= 0) applyLaser(false); }
    const watching = !!(S.mp && S.spectate);
    flapHold = false;
    if (watching) {
      flapQueued = false;
      const foc = mpFocusPlayer();
      if (foc && foc.y != null) {
        S.bird.y = foc.y;
        S.bird.v = foc.v || 0;
      }
    } else {
      if (flapQueued) {
        flapQueued = false;
        S.bird.v = m.jump || -280;
      }
      S.bird.v += m.gravity * dt; S.bird.y += S.bird.v * dt;
      if (S.power === "BEAR") {
        const k = S.swanBear ? 1 : 0.52;
        S.bird.y += Math.sin(S.lifeT * 36) * 26 * dt * k;
        S.bird.v += Math.sin(S.lifeT * 21) * 55 * dt * k;
      }
      if (S.bird.y - S.bird.r > S.H) {
        if (S.invuln > 0) {
          S.bird.y = Math.min(S.H - 70, S.H - S.bird.r - 8);
          S.bird.v = metrics().jump * 0.7;
        } else {
          hitFatal();
          if (S.dead && !S.spectate) return;
        }
      }
      if (S.bird.y + S.bird.r < 0) { S.bird.y = -S.bird.r + 1; S.bird.v = 0; }
    }

    const pw = m.pipeW * S.widthMul;
    let guard = 0;
    while (guard++ < 8) {
      const last = S.pipes[S.pipes.length - 1];
      if (last && last.x > S.W - 8) break;
      const nx = last ? last.x + m.spacing : S.W + 40;
      spawnPipe(nx);
    }
    const hitR = S.bird.r * 0.78;
    for (let i = S.pipes.length - 1; i >= 0; i--) {
      const p = S.pipes[i];
      p.x -= speed * dt;
      if (!p.seen && p.x + pw >= 0 && p.x <= S.W) {
        p.seen = true;
        S.shownCandles = (S.shownCandles || 0) + 1;
        tickHalve();
      }
      if (!p.scored && p.x + pw < S.bird.x) {
        p.scored = true;
        if (p.finish) {
          if (!watching) mpFinishRace();
        } else {
          S.candles++; A.sfx.coin();
          grantUsd(100, p.x + pw * 0.5, p.gapY - 50, "gain");
          tickJobChance();
          if (S.phase === "play" && !S.ranked && S.candles > 0 && S.candles % 10 === 0) openPerkOffer();
        }
      }
      const inX = S.bird.x + hitR > p.x + 2 && S.bird.x - hitR < p.x + pw - 2;
      if (inX && !p.finish && !watching) {
        const ends = pipeEnds(p);
        if (S.bird.y - hitR < ends.top + 2 || S.bird.y + hitR > ends.bot - 2) {
          if (!p.spark || S.lifeT - p.spark > 0.22) {
            p.spark = S.lifeT;
            burst(p.x + pw * 0.5, S.bird.y, heroFill(), 2, true);
          }
          if (S.power === "BULL") { A.sfx.wave(); grantUsd(200, p.x + pw * 0.5, S.bird.y - 66, "gain"); S.pipes.splice(i, 1); continue; }
          else if (S.invuln <= 0) hitFatal();
        }
      }
      if (p.x + pw < -60) S.pipes.splice(i, 1);
    }
    for (let j = S.items.length - 1; j >= 0; j--) {
      const it = S.items[j];
      pinItem(it);
      if (it.freeX) it.x -= speed * dt;
      if (it.type !== "HALVE") {
        it.y += (it.vy || 0) * dt;
        const lo = it.lo != null ? it.lo : 20;
        const hi = it.hi != null ? it.hi : S.H - 20;
        if (it.y <= lo) { it.y = lo; it.vy = Math.abs(it.vy || 26); }
        else if (it.y >= hi) { it.y = hi; it.vy = -Math.abs(it.vy || 26); }
      }
      if (S.laserOn && (it.type === "SWAN" || it.type === "BEAR") && it.x > S.bird.x - 8 && Math.abs(it.y - S.bird.y) < it.r + 14) {
        burst(it.x, it.y, "#e8902a", 16);
        if (it.type === "SWAN") { S.swans++; A.sfx.boom(); say("Black swan vaporized!", true); }
        else A.sfx.wave();
        S.items.splice(j, 1); continue;
      }
      const dx = S.bird.x - it.x, dy = S.bird.y - it.y;
      if (!watching && dx * dx + dy * dy < (hitR + it.r) * (hitR + it.r)) { collect(it); S.items.splice(j, 1); continue; }
      if (it.x < -40) {
        if (it.type === "HALVE") missHalve();
        S.items.splice(j, 1);
      }
    }
    const n = net();
    if (n > S.peakNet) S.peakNet = n;
    field.classList.toggle("bull", S.power === "BULL");
    field.classList.toggle("bear", S.power === "BEAR");
    field.classList.toggle("swan-bear", S.power === "BEAR" && S.swanBear);
  }

  function powerPal(type) {
    const simple = PALETTE_ID === "simple";
    const paper = PALETTE_ID === "paper";
    const light = simple || paper;
    const flower = PALETTE_ID === "flower";
    const sunset = PALETTE_ID === "sunset";
    const halo = light ? "#111111" : "rgba(0,0,0,0.9)";
    if (simple) {
      return {
        BULL: { fill: "#0c8a34", ring: "#ffffff", ink: "#ffffff", halo: "#063018" },
        BEAR: { fill: "#e10600", ring: "#ffffff", ink: "#ffffff", halo: "#4a0000" },
        LASER: { fill: "#1a0a08", ring: "#ffffff", ink: "#ff2a22", halo: "#111111" },
        COLD: { fill: "#0878a8", ring: "#ffffff", ink: "#ffffff", halo: "#042028" },
        SWAN: { fill: "#111111", ring: "#ffffff", ink: "#ffffff", halo: "#000000" },
        HALVE: { fill: "#e8a808", ring: "#111111", ink: "#1a1204", halo: "#111111" }
      }[type];
    }
    const pal = {
      BULL: { fill: "#1f8a4c", ring: "#9dffc4", ink: light ? "#04150c" : "#04150c", halo: halo },
      BEAR: { fill: "#a33a32", ring: "#ff9b92", ink: "#1a0605", halo: halo },
      LASER: { fill: "#120806", ring: "#ffe7c2", ink: "#ff2d24", halo: halo },
      COLD: { fill: "#1788a6", ring: "#9befff", ink: light ? "#ffffff" : "#041318", halo: halo },
      SWAN: light
        ? { fill: "#1a1a1c", ring: "#0a0a0c", ink: "#f3efe6", halo: halo }
        : { fill: "#f3efe6", ring: "#1a1a1c", ink: "#0a0a0c", halo: halo },
      HALVE: { fill: "#c8960a", ring: "#ffe7a0", ink: "#1a1204", halo: halo }
    }[type];
    if (!pal) return null;
    if (flower && type === "HALVE") { pal.fill = "#fff4c8"; pal.ring = "#2a0838"; pal.ink = "#2a0838"; }
    if (sunset && type === "HALVE") { pal.fill = "#ffe9b8"; pal.ring = "#1a0808"; pal.ink = "#1a0808"; }
    if (sunset && type === "BULL") { pal.fill = "#2a8a48"; pal.ring = "#04150c"; }
    if (paper && type === "COLD") pal.ink = "#ffffff";
    return pal;
  }
  function powerWash() {
    if (S.power === "BULL") return PALETTE_ID === "simple" ? "#128a38" : GREEN;
    if (S.power === "BEAR") return PALETTE_ID === "simple" ? (S.swanBear ? "#0a0a0a" : "#d01212") : RED;
    return null;
  }
  function drawPowerIcon(ctx, it, wash) {
    const r = it.r;
    const pal = powerPal(it.type);
    if (!pal) return;
    const fill = wash || pal.fill;
    const ring = wash || pal.ring;
    const ink = wash ? "#04150c" : pal.ink;
    ctx.save();
    ctx.translate(it.x, it.y);
    ctx.beginPath(); ctx.arc(0, 0, r, 0, Math.PI * 2);
    ctx.fillStyle = fill; ctx.fill();
    ctx.strokeStyle = pal.halo || "#000";
    ctx.lineWidth = 3.6;
    ctx.stroke();
    ctx.strokeStyle = ring;
    ctx.lineWidth = 1.8;
    ctx.stroke();
    ctx.beginPath(); ctx.arc(-r * 0.28, -r * 0.3, r * 0.34, 0, Math.PI * 2);
    ctx.fillStyle = "rgba(255,255,255,0.16)"; ctx.fill();
    ctx.fillStyle = ink; ctx.strokeStyle = ink; ctx.lineWidth = 1.7; ctx.lineJoin = "round"; ctx.lineCap = "round";
    if (it.type === "BULL") {
      ctx.fillStyle = ink;
      ctx.beginPath();
      ctx.moveTo(0, -r * 0.52);
      ctx.lineTo(r * 0.48, r * 0.38);
      ctx.lineTo(-r * 0.48, r * 0.38);
      ctx.closePath(); ctx.fill();
    } else if (it.type === "BEAR") {
      ctx.fillStyle = ink;
      ctx.beginPath();
      ctx.moveTo(0, r * 0.52);
      ctx.lineTo(r * 0.48, -r * 0.38);
      ctx.lineTo(-r * 0.48, -r * 0.38);
      ctx.closePath(); ctx.fill();
    } else if (it.type === "LASER") {
      ctx.strokeStyle = wash ? "#04150c" : "#fff4e8";
      ctx.lineWidth = Math.max(3.6, r * 0.28);
      ctx.lineCap = "butt";
      ctx.beginPath();
      ctx.moveTo(-r * 0.92, -r * 0.18); ctx.lineTo(r * 0.92, -r * 0.18);
      ctx.moveTo(-r * 0.92, r * 0.18); ctx.lineTo(r * 0.92, r * 0.18);
      ctx.stroke();
      ctx.strokeStyle = wash || "#ff2a22";
      ctx.lineWidth = Math.max(2.1, r * 0.16);
      ctx.beginPath();
      ctx.moveTo(-r * 0.92, -r * 0.18); ctx.lineTo(r * 0.92, -r * 0.18);
      ctx.moveTo(-r * 0.92, r * 0.18); ctx.lineTo(r * 0.92, r * 0.18);
      ctx.stroke();
    } else if (it.type === "COLD") {
      for (let a = 0; a < 6; a++) {
        const ang = (a * Math.PI) / 3;
        ctx.beginPath(); ctx.moveTo(0, 0); ctx.lineTo(Math.cos(ang) * r * 0.54, Math.sin(ang) * r * 0.54); ctx.stroke();
        const bx = Math.cos(ang) * r * 0.3, by = Math.sin(ang) * r * 0.3;
        ctx.beginPath();
        ctx.moveTo(bx + Math.cos(ang + 0.85) * r * 0.16, by + Math.sin(ang + 0.85) * r * 0.16);
        ctx.lineTo(bx, by);
        ctx.lineTo(bx + Math.cos(ang - 0.85) * r * 0.16, by + Math.sin(ang - 0.85) * r * 0.16);
        ctx.stroke();
      }
    } else if (it.type === "HALVE") {
      ctx.fillStyle = ink;
      ctx.font = "700 " + Math.round(r * 1.05) + "px \"IBM Plex Mono\", monospace";
      ctx.textAlign = "center"; ctx.textBaseline = "middle";
      ctx.fillText("½", 0, 1);
    } else {
      ctx.beginPath(); ctx.ellipse(r * 0.06, r * 0.2, r * 0.4, r * 0.26, -0.28, 0, Math.PI * 2); ctx.fill();
      ctx.beginPath(); ctx.moveTo(-r * 0.02, r * 0.06); ctx.quadraticCurveTo(-r * 0.42, -r * 0.32, -r * 0.04, -r * 0.5); ctx.quadraticCurveTo(r * 0.16, -r * 0.52, r * 0.22, -r * 0.38);
      ctx.strokeStyle = ink; ctx.lineWidth = 2.3; ctx.stroke();
      ctx.fillStyle = wash ? ink : (PALETTE_ID === "simple" ? "#ff3b30" : RED);
      ctx.beginPath(); ctx.moveTo(r * 0.18, -r * 0.42); ctx.lineTo(r * 0.46, -r * 0.36); ctx.lineTo(r * 0.18, -r * 0.3); ctx.fill();
    }
    ctx.restore();
  }

  function tapeBucket(data, i, n, prevC) {
    const end = Math.min(n, i + 4);
    let o = prevC != null ? prevC : data[i];
    let h = data[i], l = data[i];
    for (let j = i + 1; j < end; j++) {
      const v = data[j];
      if (v > h) h = v;
      if (v < l) l = v;
    }
    return { o: o, h: h, l: l, c: data[end - 1] };
  }

  function paintSharpText(ctx, text, x, y, fill) {
    text = numL(text);
    const px = Math.round(x), py = Math.round(y);
    ctx.save();
    ctx.lineJoin = "miter";
    ctx.miterLimit = 2;
    ctx.lineWidth = 2;
    ctx.strokeStyle = (PALETTE_ID === "paper" || PALETTE_ID === "simple") ? "#ffffff" : "#000000";
    ctx.strokeText(text, px, py);
    ctx.fillStyle = fill;
    ctx.fillText(text, px, py);
    ctx.restore();
  }
  function paintHaloText(ctx, text, x, y, fill) {
    text = numL(text);
    ctx.save();
    ctx.lineJoin = "round";
    ctx.lineCap = "round";
    const id = PALETTE_ID;
    if (id === "sunset") {
      ctx.lineWidth = 6;
      ctx.strokeStyle = "#140604";
      ctx.strokeText(text, x, y);
      ctx.fillStyle = sunsetInk(fill);
    } else if (id === "flower") {
      ctx.lineWidth = 5.5;
      ctx.strokeStyle = "rgba(18, 4, 28, 0.94)";
      ctx.strokeText(text, x, y);
      ctx.fillStyle = fill || "#fff8ef";
    } else if (id === "paper" || id === "simple") {
      ctx.lineWidth = 4.5;
      ctx.strokeStyle = "rgba(255, 252, 246, 0.96)";
      ctx.strokeText(text, x, y);
      ctx.lineWidth = 1.15;
      ctx.strokeStyle = "rgba(20, 16, 12, 0.55)";
      ctx.strokeText(text, x, y);
      ctx.fillStyle = fill || "#1a1610";
    } else {
      ctx.lineWidth = 4.2;
      ctx.strokeStyle = "rgba(0,0,0,0.92)";
      ctx.strokeText(text, x, y);
      ctx.lineWidth = 1.1;
      ctx.strokeStyle = "rgba(255,255,255,0.7)";
      ctx.strokeText(text, x, y);
      ctx.fillStyle = fill;
    }
    ctx.fillText(text, x, y);
    ctx.restore();
  }
  function paintFlowerFloat(ctx, text, x, y) {
    text = numL(text);
    const w = ctx.measureText(text).width;
    const size = parseFloat(ctx.font) || 15;
    const padX = 6, padY = 4;
    const left = x - w / 2 - padX;
    const top = y - size / 2 - padY;
    ctx.save();
    ctx.fillStyle = "rgba(16, 4, 24, 0.94)";
    ctx.fillRect(left, top, w + padX * 2, size + padY * 2);
    ctx.strokeStyle = "#ffe14a";
    ctx.lineWidth = 1.4;
    ctx.strokeRect(left, top, w + padX * 2, size + padY * 2);
    ctx.fillStyle = "#fffaf4";
    ctx.fillText(text, x, y);
    ctx.restore();
  }
  function sunsetInk(fill) {
    const f = String(fill || "").toLowerCase();
    const down = f === String(PAL.labelDn || "").toLowerCase() || f === String(RED || "").toLowerCase() || f === String(PAL.red || "").toLowerCase();
    return down ? "#ffd0c8" : "#fff8ef";
  }
  const wickUp = [], wickDn = [];
  function drawTape(ctx, data, y0, y1, up, dn) {
    if (data.length < 2) return;
    const bucket = 4, cw = 4.75, stepX = 5.1;
    const maxFit = Math.max(10, (S.W * 0.78 / stepX) | 0);
    const n = data.length;
    const extra = n - ((n / bucket) | 0) * bucket;
    const phase = n + Math.min(1, (S.sampleAcc || 0) / 0.12);
    const candles = phase / bucket;
    const scrolling = candles >= maxFit;
    const raw = scrolling ? candles - maxFit : 0;
    const startB = raw | 0;
    const startI = startB * bucket;
    const offsetX = scrolling ? (raw - startB) * stepX : 0;

    let vis = S._tapeVis;
    if (!vis) vis = S._tapeVis = [];
    const want = Math.ceil((n - startI) / bucket);

    if (S._tvStart !== startI || !vis.length) {
      vis.length = 0;
      let prevC = null;
      for (let i = startI; i < n; i += bucket) {
        const b = tapeBucket(data, i, n, prevC);
        vis.push(b);
        prevC = b.c;
      }
      S._tvStart = startI;
      S._tvN = n;
      if (!vis.length) return;
      let vlo = vis[0].l, vhi = vis[0].h;
      for (let k = 1; k < vis.length; k++) {
        const b = vis[k];
        if (b.l < vlo) vlo = b.l;
        if (b.h > vhi) vhi = b.h;
      }
      S._tvLo = vlo;
      S._tvHi = vhi;
    } else if (S._tvN !== n) {
      if (vis.length > want) vis.length = want;
      while (vis.length < want) {
        const i = startI + vis.length * bucket;
        vis.push(tapeBucket(data, i, n, vis.length ? vis[vis.length - 1].c : null));
      }
      if (vis.length) {
        const idx = vis.length - 1;
        const last = tapeBucket(data, startI + idx * bucket, n, idx ? vis[idx - 1].c : null);
        vis[idx] = last;
        if (last.l < S._tvLo) S._tvLo = last.l;
        if (last.h > S._tvHi) S._tvHi = last.h;
      }
      S._tvN = n;
    }
    if (!vis.length) return;

    const last = vis[vis.length - 1];
    const live = extra > 0 ? S.price : last.c;
    const lastH = live > last.h ? live : last.h;
    const lastL = live < last.l ? live : last.l;
    const lastC = extra > 0 ? live : last.c;

    let visLo = lastL < S._tvLo ? lastL : S._tvLo;
    let visHi = lastH > S._tvHi ? lastH : S._tvHi;
    const span = visHi - visLo < 0.01 ? 0.01 : visHi - visLo;
    const mid = (visLo + visHi) * 0.5;
    const fade = n < 100 ? 1 - n * 0.01 : 0;
    const view = span * (1 + 0.5 * fade);
    const lo = mid - view * 0.5 - span * 0.08;
    const hi = mid + view * 0.5 + span * 0.08;

    const now = performance.now();
    const dt = Math.min(0.05, (now - (S._tapeT || now)) * 0.001);
    S._tapeT = now;
    if (S.tapeLo == null) {
      S.tapeLo = lo;
      S.tapeHi = hi;
    } else {
      const a = dt > 0 ? 1 - Math.exp(-dt / 6) : 0;
      if (lo < S.tapeLo) S.tapeLo = lo;
      else S.tapeLo += (lo - S.tapeLo) * a;
      if (hi > S.tapeHi) S.tapeHi = hi;
      else S.tapeHi += (hi - S.tapeHi) * a;
    }

    const rng = S.tapeHi - S.tapeLo;
    const inv = (y1 - y0) / (rng < 0.01 ? 0.01 : rng);
    // Clamp to just outside the clip rect: a wick with huge off-screen coordinates (tiny range + price shock)
    // made a single stroke() take seconds on software/mobile rasterizers.
    const pyLo = y0 - 16, pyHi = y1 + 16;
    const py = (v) => { const y = y1 - (v - S.tapeLo) * inv; return y < pyLo ? pyLo : y > pyHi ? pyHi : (y === y ? y : y1); };

    ctx.save();
    ctx.beginPath();
    ctx.rect(0, y0 - 12, S.W, y1 - y0 + 24);
    ctx.clip();
    const lastI = vis.length - 1;
    for (let i = 0; i < vis.length; i++) {
      const b = vis[i];
      const x = 10 + i * stepX - offsetX;
      if (x + cw < -4 || x > S.W + 4) continue;
      const h = i === lastI ? lastH : b.h;
      const l = i === lastI ? lastL : b.l;
      const c = i === lastI ? lastC : b.c;
      const bull = c >= b.o;
      // wicks are batched into one path per colour (2 strokes per frame instead of one per candle)
      const wick = bull ? wickUp : wickDn;
      wick.push(x + cw * 0.5, py(h), py(l));
      ctx.fillStyle = bull ? up : dn;
      const yO = py(b.o), yC = py(c);
      ctx.fillRect(x, yO < yC ? yO : yC, cw, Math.max(1.2, yO < yC ? yC - yO : yO - yC));
    }
    ctx.lineWidth = 1;
    for (const [w, col] of [[wickUp, up], [wickDn, dn]]) {
      if (!w.length) continue;
      ctx.strokeStyle = col;
      ctx.beginPath();
      for (let k = 0; k < w.length; k += 3) { ctx.moveTo(w[k], w[k + 1]); ctx.lineTo(w[k], w[k + 2]); }
      ctx.stroke();
    }
    wickUp.length = 0; wickDn.length = 0;
    const marks = (S.tapeMarks || []).concat(S.tapeLive ? [S.tapeLive] : []);
    if (marks.length) {
      ctx.font = "700 8px \"IBM Plex Mono\", monospace";
      ctx.textAlign = "center";
      ctx.lineWidth = 3;
      ctx.strokeStyle = "rgba(10,10,12,0.82)";
      for (const mk of marks) {
        const vi = ((mk.i || 0) / bucket | 0) - startB;
        if (vi < 0 || vi >= vis.length) continue;
        const peak = mk.kind === "peak";
        const x = 10 + vi * stepX + cw * 0.5 - offsetX;
        const y = py(mk.price) + (peak ? -5 : 5);
        ctx.textBaseline = peak ? "bottom" : "top";
        const lab = fmtUsd(mk.price);
        paintHaloText(ctx, lab, x, y, peak ? (PAL.labelUp || GREEN) : (PAL.labelDn || RED));
      }
    }
    ctx.restore();
  }


  const RIBBON_BAGS = Object.create(null);
  function ribbonBag(key) {
    return RIBBON_BAGS[key] || (RIBBON_BAGS[key] = {
      lastT: 0,
      init: false,
      segs: [
        { x: 0, y: 0, px: 0, py: 0, x2: 0, y2: 0, px2: 0, py2: 0 },
        { x: 0, y: 0, px: 0, py: 0, x2: 0, y2: 0, px2: 0, py2: 0 }
      ]
    });
  }
  function stepCloth(bag, attaches, v, time) {
    let dt = time - bag.lastT;
    if (!(dt > 0) || dt > 0.05) dt = 0.016;
    bag.lastT = time;
    const dt2 = dt * dt;
    const gY = 860 * dt2;
    const trail = -(v || 0) * dt * 0.7;
    if (!bag.init) {
      for (let i = 0; i < 2; i++) {
        const a = attaches[i];
        const s = bag.segs[i];
        s.x = a.x - a.len * 0.42;
        s.y = a.y + a.len * 0.62;
        s.px = s.x; s.py = s.y;
        s.x2 = a.x - a.len * 0.82;
        s.y2 = a.y + a.len * 1.05;
        s.px2 = s.x2; s.py2 = s.y2;
      }
      bag.init = true;
    }
    const pull = (ax, ay, bx, by, dist) => {
      const dx = bx - ax, dy = by - ay;
      const d = Math.hypot(dx, dy) || 0.001;
      const f = (d - dist) / d;
      return { x: bx - dx * f, y: by - dy * f };
    };
    for (let i = 0; i < 2; i++) {
      const a = attaches[i];
      const s = bag.segs[i];
      let vx = (s.x - s.px) * 0.86;
      let vy = (s.y - s.py) * 0.86;
      s.px = s.x; s.py = s.y;
      s.x += vx;
      s.y += vy + gY + trail;
      vx = (s.x2 - s.px2) * 0.86;
      vy = (s.y2 - s.py2) * 0.86;
      s.px2 = s.x2; s.py2 = s.y2;
      s.x2 += vx;
      s.y2 += vy + gY * 1.2 + trail * 1.15;
      const d1 = a.len * 0.5, d2 = a.len * 0.55;
      for (let k = 0; k < 4; k++) {
        let c = pull(a.x, a.y, s.x, s.y, d1);
        s.x = c.x; s.y = c.y;
        c = pull(s.x, s.y, s.x2, s.y2, d2);
        s.x2 = c.x; s.y2 = c.y;
      }
    }
  }

  function drawChoppyHero(ctx, r, v, t, wash, laser, worldX, skinId) {
    const sk = heroSkin(skinId || HERO_SKIN);
    const tilt = Math.max(-0.65, Math.min(0.95, (v || 0) * 0.0022));
    const g = Math.max(-1, Math.min(1, (v || 0) / 420));
    const time = t || 0;
    const gold = wash || (laser ? "#e8902a" : sk.fill);
    const rim = wash || (laser ? "#ffc878" : sk.rim);
    const ink = sk.ink;
    const btcInk = sk.btc;
    const red = wash || sk.band;
    const halo = sk.halo;
    const limbCol = sk.limb;
    const flat = sk.style === "flat";
    const rx = r * (flat ? 0.92 : 0.62);
    ctx.save();
    ctx.lineCap = "round";
    ctx.lineJoin = "round";

    const noodle = (ax, ay, ang, len, phase, col, colHalo) => {
      const sag = r * (0.22 + Math.max(0, g) * 0.42);
      const wig = Math.sin(time * 9.6 + phase) * r * 0.16;
      const flop = Math.sin(time * 6.3 + phase * 0.8) * r * 0.1;
      const ex = ax + Math.cos(ang) * len + flop;
      const ey = ay + Math.sin(ang) * len;
      const mx = (ax + ex) * 0.5 + wig;
      const my = (ay + ey) * 0.5 + sag;
      const path = () => {
        ctx.beginPath();
        ctx.moveTo(ax, ay);
        ctx.quadraticCurveTo(mx, my, ex, ey);
        ctx.stroke();
      };
      ctx.strokeStyle = colHalo || halo;
      ctx.lineWidth = Math.max(3, r * 0.22);
      path();
      ctx.strokeStyle = col || ink;
      ctx.lineWidth = Math.max(1.4, r * 0.11);
      path();
    };

    ctx.save();
    ctx.rotate(-tilt);
    const down = Math.PI / 2;
    const kickL = Math.sin(time * 8.9) * 0.5 + g * 0.7;
    const kickR = Math.sin(time * 8.9 + 2.5) * 0.5 + g * 0.55;
    const armL = Math.sin(time * 7.5 + 0.4) * 0.62 + g * 0.4;
    const armR = Math.sin(time * 7.5 + 2.7) * 0.62 + g * 0.34;
    noodle(-r * 0.12, r * 0.58, down + 0.42 + kickL, r * 1.28, 0.2, limbCol, halo);
    noodle(r * 0.14, r * 0.56, down - 0.12 + kickR, r * 1.22, 2.3, limbCol, halo);
    noodle(-rx * 0.85, r * 0.08, down + 1.05 + armL, r * 1.08, 1.2, limbCol, halo);
    noodle(rx * 0.85, r * 0.04, down - 1.12 + armR, r * 1.04, 3.0, limbCol, halo);
    ctx.restore();

    const thick = flat ? 0 : Math.max(3.2, r * 0.3);
    const dark = wash || sk.dark;
    const edge = wash || sk.edge;
    ctx.fillStyle = dark;
    ctx.beginPath();
    ctx.ellipse(-thick, 0, rx, r, 0, Math.PI * 0.5, Math.PI * 1.5);
    ctx.lineTo(0, -r);
    ctx.ellipse(0, 0, rx, r, 0, -Math.PI * 0.5, Math.PI * 0.5, true);
    ctx.closePath();
    ctx.fill();
    ctx.strokeStyle = edge;
    ctx.lineWidth = Math.max(1, r * 0.06);
    ctx.stroke();

    ctx.beginPath();
    ctx.ellipse(0, 0, rx, r, 0, 0, Math.PI * 2);
    ctx.fillStyle = gold;
    ctx.fill();
    ctx.strokeStyle = rim;
    ctx.lineWidth = Math.max(1.6, r * 0.1);
    ctx.stroke();
    ctx.beginPath();
    ctx.ellipse(0, 0, rx * 0.84, r * 0.84, 0, 0, Math.PI * 2);
    ctx.strokeStyle = "rgba(80,40,0,0.3)";
    ctx.lineWidth = Math.max(1.3, r * 0.08);
    ctx.stroke();

    ctx.save();
    ctx.translate(0, r * 0.06);
    ctx.transform(0.84, 0.03, -0.14, 0.97, 0, 0);
    ctx.fillStyle = btcInk;
    ctx.strokeStyle = "rgba(255,244,214,0.28)";
    ctx.lineWidth = Math.max(1.1, r * 0.05);
    ctx.font = "700 " + Math.round(r * 1.38) + "px Georgia, serif";
    ctx.textAlign = "center";
    ctx.textBaseline = "middle";
    ctx.strokeText("₿", 0, 0);
    ctx.fillText("₿", 0, 0);
    ctx.restore();

    const lr = r * 0.21;
    const leftL = { x: rx * 0.32, y: -r * 0.16 };
    const rightL = { x: rx * 0.78, y: -r * 0.22 };
    if (!flat) {
      ctx.strokeStyle = ink;
      ctx.lineWidth = Math.max(1.6, r * 0.1);
      ctx.beginPath();
      ctx.moveTo(leftL.x - lr * 0.7, leftL.y + lr * 0.04);
      ctx.lineTo(-rx * 0.52, leftL.y + r * 0.01);
      ctx.quadraticCurveTo(-rx * 1.04, leftL.y + r * 0.04, -rx * 1.12, leftL.y + r * 0.26);
      ctx.stroke();
      const lens = (c, rad, shade) => {
        ctx.beginPath();
        ctx.arc(c.x + rad * 0.14, c.y + rad * 0.12, rad, 0, Math.PI * 2);
        ctx.fillStyle = "rgba(0,0,0,0.28)";
        ctx.fill();
        ctx.beginPath();
        ctx.arc(c.x, c.y, rad, 0, Math.PI * 2);
        ctx.fillStyle = shade;
        ctx.fill();
        ctx.strokeStyle = "#111";
        ctx.lineWidth = Math.max(1.1, r * 0.07);
        ctx.stroke();
        ctx.fillStyle = "rgba(255,255,255,0.45)";
        ctx.beginPath();
        ctx.arc(c.x - rad * 0.28, c.y - rad * 0.32, rad * 0.28, 0, Math.PI * 2);
        ctx.fill();
      };
      lens(rightL, lr * 0.86, sk.lensB);
      lens(leftL, lr, sk.lensF);
      ctx.strokeStyle = ink;
      ctx.lineWidth = Math.max(0.9, r * 0.055);
      ctx.beginPath();
      ctx.moveTo(leftL.x + lr * 0.72, leftL.y - lr * 0.08);
      ctx.lineTo(rightL.x - lr * 0.55, rightL.y + lr * 0.06);
      ctx.stroke();
    }

    const bandH = Math.max(3.2, r * 0.2);
    const bandY = -r * 0.56;
    const span = rx * Math.sqrt(Math.max(0, 1 - (bandY * bandY) / (r * r)));
    const leftA = Math.atan2(bandY, -span);
    const rightA = Math.atan2(bandY, span);
    ctx.save();
    ctx.lineCap = "butt";
    ctx.strokeStyle = red;
    ctx.lineWidth = bandH;
    ctx.beginPath();
    ctx.ellipse(0, 0, rx * 1.02, r * 1.005, 0, leftA, rightA, false);
    ctx.stroke();
    ctx.beginPath();
    ctx.ellipse(-thick, 0, rx * 1.02, r * 1.005, 0, leftA, Math.PI, true);
    ctx.stroke();
    ctx.strokeStyle = "rgba(0,0,0,0.2)";
    ctx.lineWidth = Math.max(1, bandH * 0.22);
    ctx.beginPath();
    ctx.ellipse(0, 0, rx * 1.02, r * 1.005, 0, leftA, rightA, false);
    ctx.stroke();
    ctx.restore();

    const bandLeft = -thick - span;
    if (flat) {
      if (laser) {
        ctx.strokeStyle = wash || "rgba(255,150,40,0.78)";
        ctx.lineWidth = 3.4;
        ctx.beginPath();
        ctx.moveTo(rx * 0.92, -r * 0.08);
        ctx.lineTo((worldX != null ? (S.W - worldX + 80) : r * 12), -r * 0.16);
        ctx.moveTo(rx * 0.92, r * 0.08);
        ctx.lineTo((worldX != null ? (S.W - worldX + 80) : r * 12), r * 0.16);
        ctx.stroke();
      }
      ctx.restore();
      return;
    }
    const bag = ribbonBag((ctx.canvas && ctx.canvas.id) || "c");
    const cs = Math.cos(tilt), sn = Math.sin(tilt);
    const toWorld = (x, y) => ({ x: x * cs - y * sn, y: x * sn + y * cs });
    const a0 = toWorld(bandLeft, bandY - bandH * 0.12);
    const a1 = toWorld(bandLeft, bandY + bandH * 0.18);
    a0.len = r * 1.18;
    a1.len = r * 0.98;
    stepCloth(bag, [a0, a1], v, time);
    ctx.save();
    ctx.rotate(-tilt);
    ctx.strokeStyle = red;
    ctx.lineWidth = Math.max(1.7, r * 0.13);
    for (let i = 0; i < 2; i++) {
      const a = i ? a1 : a0;
      const sg = bag.segs[i];
      ctx.beginPath();
      ctx.moveTo(a.x, a.y);
      ctx.quadraticCurveTo(sg.x, sg.y, sg.x2, sg.y2);
      ctx.stroke();
    }
    ctx.restore();

    if (laser) {
      ctx.strokeStyle = wash || "rgba(255,150,40,0.78)";
      ctx.lineWidth = 3.4;
      ctx.beginPath();
      ctx.moveTo(leftL.x + lr, leftL.y - 2);
      ctx.lineTo((worldX != null ? (S.W - worldX + 80) : r * 12), leftL.y - 8);
      ctx.moveTo(rightL.x + lr * 0.4, rightL.y + 2);
      ctx.lineTo((worldX != null ? (S.W - worldX + 80) : r * 12), rightL.y + 8);
      ctx.stroke();
    }
    ctx.restore();
  }

  function drawHeroLaser(ctx, x0, y0, worldX, r, wash) {
    ctx.strokeStyle = wash || "rgba(255,150,40,0.78)";
    ctx.lineWidth = 3.4;
    ctx.beginPath();
    ctx.moveTo(x0, y0 - 2);
    ctx.lineTo((worldX != null ? (S.W - worldX + 80) : r * 12), y0 - 8);
    ctx.moveTo(x0, y0 + 2);
    ctx.lineTo((worldX != null ? (S.W - worldX + 80) : r * 12), y0 + 8);
    ctx.stroke();
  }

  function drawRocketHero(ctx, r, v, t, wash, laser, worldX, anim) {
    const time = t || 0;
    const body = wash || "#9ec4ff";
    const dark = wash || "#3d5a90";
    const rim = wash || "#e8f0ff";
    ctx.save();
    ctx.lineJoin = "round";
    ctx.lineCap = "round";
    if (anim) ctx.rotate(Math.sin(time * 5.4) * 0.05);
    const boost = anim ? Math.max(0.75, Math.min(2.0, 1.1 - (v || 0) / 340)) : 0.42;
    const flick = anim ? 1 + Math.sin(time * 28) * 0.26 : 1;
    const fl = r * (anim ? 1.22 * boost * flick : 0.5);
    if (anim) {
      const fg = ctx.createRadialGradient(-r * 0.72, 0, r * 0.04, -r * 0.72, 0, fl + r * 0.45);
      fg.addColorStop(0, "rgba(255,245,190,0.95)");
      fg.addColorStop(0.28, "rgba(255,140,50,0.8)");
      fg.addColorStop(1, "rgba(255,40,20,0)");
      ctx.fillStyle = fg;
      ctx.beginPath();
      ctx.ellipse(-r * 0.58 - fl * 0.28, 0, fl * 0.9, r * 0.46 * flick, 0, 0, Math.PI * 2);
      ctx.fill();
    }
    ctx.fillStyle = wash || "#ff6a3a";
    ctx.beginPath();
    ctx.moveTo(-r * 0.5, -r * 0.26);
    ctx.quadraticCurveTo(-r * 0.78 - fl, 0, -r * 0.5, r * 0.26);
    ctx.closePath();
    ctx.fill();
    ctx.fillStyle = wash || "#ffe14a";
    ctx.beginPath();
    ctx.moveTo(-r * 0.48, -r * 0.14);
    ctx.quadraticCurveTo(-r * 0.58 - fl * (anim ? 0.72 : 0.45), 0, -r * 0.48, r * 0.14);
    ctx.closePath();
    ctx.fill();
    if (anim) {
      ctx.fillStyle = rim;
      ctx.beginPath();
      ctx.moveTo(-r * 0.46, -r * 0.07);
      ctx.quadraticCurveTo(-r * 0.34 - fl * 0.4, 0, -r * 0.46, r * 0.07);
      ctx.closePath();
      ctx.fill();
      ctx.fillStyle = "rgba(4,16,40,0.38)";
      ctx.beginPath();
      ctx.moveTo(-r * 0.08, r * 0.22);
      ctx.lineTo(-r * 0.5, r * 0.9);
      ctx.lineTo(r * 0.16, r * 0.44);
      ctx.closePath();
      ctx.fill();
      ctx.beginPath();
      ctx.moveTo(-r * 0.08, -r * 0.22);
      ctx.lineTo(-r * 0.5, -r * 0.9);
      ctx.lineTo(r * 0.16, -r * 0.44);
      ctx.closePath();
      ctx.fill();
    }
    ctx.fillStyle = dark;
    ctx.beginPath();
    ctx.moveTo(-r * 0.1, r * 0.26);
    ctx.lineTo(-r * 0.54, r * 0.82);
    ctx.lineTo(r * 0.12, r * 0.42);
    ctx.closePath();
    ctx.fill();
    ctx.beginPath();
    ctx.moveTo(-r * 0.1, -r * 0.26);
    ctx.lineTo(-r * 0.54, -r * 0.82);
    ctx.lineTo(r * 0.12, -r * 0.42);
    ctx.closePath();
    ctx.fill();
    if (anim) {
      const bg = ctx.createLinearGradient(0, -r * 0.48, 0, r * 0.48);
      bg.addColorStop(0, rim);
      bg.addColorStop(0.38, body);
      bg.addColorStop(1, dark);
      ctx.fillStyle = bg;
    } else {
      ctx.fillStyle = body;
    }
    ctx.strokeStyle = rim;
    ctx.lineWidth = Math.max(1.4, r * (anim ? 0.12 : 0.1));
    ctx.beginPath();
    ctx.moveTo(-r * 0.52, -r * 0.4);
    ctx.lineTo(r * 0.3, -r * 0.4);
    ctx.quadraticCurveTo(r * 1.18, 0, r * 0.3, r * 0.4);
    ctx.lineTo(-r * 0.52, r * 0.4);
    ctx.closePath();
    ctx.fill();
    ctx.stroke();
    if (anim) {
      ctx.fillStyle = "#041018";
      ctx.beginPath();
      ctx.ellipse(r * 0.16, -r * 0.02, r * 0.2, r * 0.22, 0, 0, Math.PI * 2);
      ctx.fill();
      ctx.strokeStyle = rim;
      ctx.lineWidth = Math.max(1, r * 0.06);
      ctx.stroke();
      ctx.fillStyle = "rgba(210,235,255,0.5)";
      ctx.beginPath();
      ctx.ellipse(r * 0.1, -r * 0.08, r * 0.08, r * 0.1, -0.3, 0, Math.PI * 2);
      ctx.fill();
      ctx.strokeStyle = "rgba(4,16,24,0.28)";
      ctx.lineWidth = Math.max(1, r * 0.06);
      ctx.beginPath();
      ctx.ellipse(-r * 0.08, 0, r * 0.14, r * 0.32, 0, 0, Math.PI * 2);
      ctx.stroke();
    }
    ctx.fillStyle = wash || "#f4f8ff";
    ctx.font = "700 " + Math.round(r * (anim ? 0.86 : 0.92)) + "px Georgia, serif";
    ctx.textAlign = "center";
    ctx.textBaseline = "middle";
    ctx.fillText("₿", anim ? r * 0.16 : r * 0.04, 1);
    if (laser) drawHeroLaser(ctx, r * 0.92, 0, worldX, r, wash);
    ctx.restore();
  }

  function drawPencilHero(ctx, r, v, t, wash, laser, worldX, anim) {
    const time = t || 0;
    const yellow = wash || "#e6c24a";
    const wood = wash || "#d4a06a";
    const ink = "#1a1610";
    ctx.save();
    if (anim) ctx.rotate(Math.sin(time * 6.4) * 0.08);
    ctx.lineJoin = "round";
    ctx.lineCap = "round";
    if (anim) {
      ctx.fillStyle = "rgba(26,22,16,0.16)";
      ctx.beginPath();
      ctx.ellipse(r * 0.05, r * 0.42, r * 1.05, r * 0.16, 0, 0, Math.PI * 2);
      ctx.fill();
    }
    ctx.fillStyle = wash || "#e07a8a";
    ctx.beginPath();
    if (ctx.roundRect) ctx.roundRect(-r * 1.12, -r * (anim ? 0.32 : 0.28), r * 0.36, r * (anim ? 0.64 : 0.56), r * 0.14);
    else ctx.rect(-r * 1.12, -r * 0.28, r * 0.36, r * 0.56);
    ctx.fill();
    if (anim) {
      ctx.fillStyle = "rgba(255,220,220,0.35)";
      ctx.beginPath();
      ctx.ellipse(-r * 0.96, -r * 0.1, r * 0.08, r * 0.12, 0, 0, Math.PI * 2);
      ctx.fill();
    }
    ctx.fillStyle = "#c8ccd0";
    ctx.fillRect(-r * 0.8, -r * (anim ? 0.32 : 0.3), r * (anim ? 0.2 : 0.16), r * (anim ? 0.64 : 0.6));
    ctx.strokeStyle = ink;
    ctx.lineWidth = Math.max(1.1, r * 0.07);
    ctx.strokeRect(-r * 0.8, -r * (anim ? 0.32 : 0.3), r * (anim ? 0.2 : 0.16), r * (anim ? 0.64 : 0.6));
    if (anim) {
      ctx.strokeStyle = "rgba(255,255,255,0.45)";
      ctx.lineWidth = 1;
      ctx.beginPath();
      ctx.moveTo(-r * 0.76, -r * 0.18);
      ctx.lineTo(-r * 0.64, -r * 0.18);
      ctx.stroke();
      ctx.strokeStyle = ink;
    }
    if (anim) {
      const faces = 6;
      for (let i = 0; i < faces; i++) {
        const y0 = -r * 0.32 + (i / faces) * r * 0.64;
        const y1 = -r * 0.32 + ((i + 1) / faces) * r * 0.64;
        ctx.fillStyle = i % 2 ? yellow : "#d4ad3a";
        ctx.fillRect(-r * 0.64, y0, r * 1.02, y1 - y0 + 0.4);
      }
      ctx.strokeStyle = ink;
      ctx.lineWidth = Math.max(1.1, r * 0.07);
      ctx.strokeRect(-r * 0.64, -r * 0.32, r * 1.02, r * 0.64);
      ctx.strokeStyle = "rgba(26,22,16,0.22)";
      ctx.lineWidth = 1;
      for (let i = 1; i < faces; i++) {
        const y = -r * 0.32 + (i / faces) * r * 0.64;
        ctx.beginPath();
        ctx.moveTo(-r * 0.64, y);
        ctx.lineTo(r * 0.38, y);
        ctx.stroke();
      }
    } else {
      ctx.fillStyle = yellow;
      ctx.beginPath();
      ctx.rect(-r * 0.64, -r * 0.3, r * 1.02, r * 0.6);
      ctx.fill();
      ctx.stroke();
    }
    ctx.fillStyle = wood;
    ctx.beginPath();
    ctx.moveTo(r * 0.38, -r * (anim ? 0.32 : 0.3));
    ctx.lineTo(r * 0.98, 0);
    ctx.lineTo(r * 0.38, r * (anim ? 0.32 : 0.3));
    ctx.closePath();
    ctx.fill();
    ctx.strokeStyle = ink;
    ctx.stroke();
    if (anim) {
      ctx.strokeStyle = "rgba(90,50,20,0.35)";
      ctx.beginPath();
      ctx.moveTo(r * 0.46, -r * 0.16);
      ctx.lineTo(r * 0.82, 0);
      ctx.moveTo(r * 0.46, r * 0.16);
      ctx.lineTo(r * 0.82, 0);
      ctx.stroke();
    }
    ctx.fillStyle = "#2a241c";
    ctx.beginPath();
    ctx.moveTo(r * 0.76, -r * 0.1);
    ctx.lineTo(r * 1.14, 0);
    ctx.lineTo(r * 0.76, r * 0.1);
    ctx.closePath();
    ctx.fill();
    ctx.fillStyle = ink;
    ctx.font = "700 " + Math.round(r * 0.7) + "px Georgia, serif";
    ctx.textAlign = "center";
    ctx.textBaseline = "middle";
    ctx.fillText("₿", -r * 0.12, 1);
    if (anim) {
      ctx.strokeStyle = "rgba(26,22,16,0.55)";
      ctx.lineWidth = 1.4;
      ctx.beginPath();
      ctx.moveTo(r * 1.14, 0);
      ctx.quadraticCurveTo(r * 1.4, Math.sin(time * 9) * r * 0.2, r * 1.85, Math.sin(time * 7) * r * 0.32);
      ctx.stroke();
      ctx.strokeStyle = "rgba(26,22,16,0.22)";
      ctx.lineWidth = 0.8;
      ctx.beginPath();
      ctx.moveTo(r * 1.16, 2);
      ctx.quadraticCurveTo(r * 1.46, Math.sin(time * 8.2) * r * 0.16, r * 1.7, Math.sin(time * 6.1) * r * 0.24);
      ctx.stroke();
    }
    if (laser) drawHeroLaser(ctx, r * 1.08, 0, worldX, r, wash);
    ctx.restore();
  }

  function drawFlowerHero(ctx, r, v, t, wash, laser, worldX, anim) {
    const time = t || 0;
    const pink = wash || "#ff4aa8";
    const gold = wash || "#ffe14a";
    const lime = wash || "#7dff6a";
    const center = wash || "#fff4c8";
    const ink = "#2a0838";
    ctx.save();
    ctx.lineJoin = "round";
    ctx.lineCap = "round";
    if (anim) {
      ctx.strokeStyle = lime;
      ctx.lineWidth = Math.max(2.2, r * 0.16);
      const sag = Math.max(0, (v || 0) * 0.05);
      ctx.beginPath();
      ctx.moveTo(0, r * 0.18);
      ctx.quadraticCurveTo(-r * 0.42, r * 1.15 + sag, Math.sin(time * 4.4) * r * 0.22, r * 2.45);
      ctx.stroke();
    }
    const n = anim ? 8 : 6;
    for (let i = 0; i < n; i++) {
      const a = i * Math.PI * 2 / n + 0.18 + (anim ? Math.sin(time * 3.1 + i) * 0.14 : 0);
      const stretch = anim ? 1 + Math.sin(time * 4.2 + i * 0.8) * 0.14 - Math.max(-0.08, Math.min(0.18, (v || 0) / 900)) : 1;
      ctx.save();
      ctx.rotate(a);
      ctx.fillStyle = i % 2 ? pink : gold;
      ctx.beginPath();
      ctx.ellipse(0, -r * 0.7 * stretch, r * 0.3, r * 0.52 * stretch, 0, 0, Math.PI * 2);
      ctx.fill();
      ctx.restore();
    }
    ctx.beginPath();
    ctx.arc(0, 0, r * 0.5, 0, Math.PI * 2);
    ctx.fillStyle = center;
    ctx.fill();
    ctx.strokeStyle = ink;
    ctx.lineWidth = Math.max(1.4, r * 0.08);
    ctx.stroke();
    ctx.fillStyle = "#6a2880";
    ctx.font = "700 " + Math.round(r * 0.72) + "px Georgia, serif";
    ctx.textAlign = "center";
    ctx.textBaseline = "middle";
    ctx.fillText("₿", 0, 1);
    if (laser) drawHeroLaser(ctx, r * 0.5, -2, worldX, r, wash);
    ctx.restore();
  }

  function drawThemedOrb(ctx, r, wash, laser, worldX, skinId) {
    const sk = heroSkin(skinId);
    const fill = wash || (laser ? "#e8902a" : sk.fill);
    if (sk.glow) {
      const gg = ctx.createRadialGradient(0, 0, r * 0.15, 0, 0, r * 1.55);
      gg.addColorStop(0, sk.glow);
      gg.addColorStop(1, "rgba(0,0,0,0)");
      ctx.fillStyle = gg;
      ctx.beginPath(); ctx.arc(0, 0, r * 1.55, 0, Math.PI * 2); ctx.fill();
    }
    if (sk.style === "petal") {
      ctx.fillStyle = wash || sk.band;
      for (let i = 0; i < 6; i++) {
        const a = i * Math.PI / 3 + 0.2;
        ctx.beginPath();
        ctx.ellipse(Math.cos(a) * r * 0.72, Math.sin(a) * r * 0.72, r * 0.4, r * 0.22, a, 0, Math.PI * 2);
        ctx.fill();
      }
    }
    ctx.fillStyle = fill;
    ctx.strokeStyle = sk.rim;
    ctx.lineWidth = sk.style === "ink" ? 2.8 : sk.style === "flat" ? 2.2 : 2;
    ctx.beginPath();
    if (sk.style === "pixel") {
      const s = r * 1.15;
      if (ctx.roundRect) ctx.roundRect(-s / 2, -s / 2, s, s, 3);
      else ctx.rect(-s / 2, -s / 2, s, s);
    } else {
      ctx.arc(0, 0, r, 0, Math.PI * 2);
    }
    ctx.fill();
    ctx.stroke();
    if (sk.style === "moon") {
      ctx.fillStyle = palRgba(sk.dark, 0.45);
      ctx.beginPath();
      ctx.arc(r * 0.22, -r * 0.1, r * 0.72, 0, Math.PI * 2);
      ctx.fill();
    }
    ctx.fillStyle = sk.btc;
    ctx.font = "700 " + Math.round(r * 1.12) + "px Georgia, serif";
    ctx.textAlign = "center";
    ctx.textBaseline = "middle";
    ctx.fillText(sk.mark, 0, 1);
    if (laser) {
      ctx.strokeStyle = wash || "rgba(255,150,40,0.78)";
      ctx.lineWidth = 3.4;
      ctx.beginPath();
      ctx.moveTo(r - 2, -3);
      ctx.lineTo((worldX != null ? (S.W - worldX + 80) : r * 12), -8);
      ctx.moveTo(r - 2, 3);
      ctx.lineTo((worldX != null ? (S.W - worldX + 80) : r * 12), 8);
      ctx.stroke();
    }
  }

  function heroDrawR(r, st, anim) {
    if (st === "rocket") return r * (anim ? 1.14 : 1.04);
    if (st === "pencil") return r * (anim ? 1.08 : 0.98);
    if (st === "hippie") return r * 0.8;
    if (st === "pixel") return r * 0.92;
    if (anim) return r * 0.78;
    return r;
  }
  function drawBirdAt(ctx, x, y, v, r, hero, wash, alpha, laser, choppy, skinId) {
    ctx.save();
    ctx.globalAlpha = alpha == null ? 1 : alpha;
    ctx.translate(x, y);
    ctx.rotate(Math.max(-0.65, Math.min(0.95, (v || 0) * 0.0022)));
    const skin = skinId || HERO_SKIN;
    const st = heroSkin(skin).style;
    const now = performance.now() * 0.001;
    const vis = heroDrawR(r, st, !!choppy);
    if (st === "rocket") {
      drawRocketHero(ctx, vis, v, now, wash, laser, x, !!choppy);
      ctx.restore();
      return;
    }
    if (st === "pencil") {
      drawPencilHero(ctx, vis, v, now, wash, laser, x, !!choppy);
      ctx.restore();
      return;
    }
    if (st === "hippie") {
      drawFlowerHero(ctx, vis, v, now, wash, laser, x, !!choppy);
      ctx.restore();
      return;
    }
    if (choppy) {
      drawChoppyHero(ctx, vis, v, now, wash, laser, x, skin);
      ctx.restore();
      return;
    }
    if (!S.mp || skinId) {
      drawThemedOrb(ctx, r, wash, laser, x, skin);
      ctx.restore();
      return;
    }
    const col = wash || (laser ? "#e8902a" : (hero && hero.fill) || BTC);
    ctx.beginPath(); ctx.arc(0, 0, r, 0, Math.PI * 2);
    ctx.fillStyle = col; ctx.fill();
    ctx.strokeStyle = (hero && hero.ring) || "#09090b";
    ctx.lineWidth = 2; ctx.stroke();
    if (hero) drawHeroMark(ctx, hero, r);
    else {
      ctx.fillStyle = "#09090b";
      ctx.font = "700 " + Math.round(r) + "px sans-serif";
      ctx.textAlign = "center"; ctx.textBaseline = "middle";
      ctx.fillText("B", 0, 1);
    }
    if (laser) {
      ctx.strokeStyle = wash || "rgba(255,150,40,0.78)"; ctx.lineWidth = 3.4;
      ctx.beginPath(); ctx.moveTo(r - 2, -3); ctx.lineTo(S.W - x + 80, -8);
      ctx.moveTo(r - 2, 3); ctx.lineTo(S.W - x + 80, 8); ctx.stroke();
    }
    ctx.restore();
  }

  function hashU(n) {
    n = Math.imul(n ^ (n >>> 16), 2246822519);
    n = Math.imul(n ^ (n >>> 13), 3266489917);
    return (n ^ (n >>> 16)) >>> 0;
  }
  let STAR_CACHE = null;
  let STAR_CACHE_KEY = "";
  let FLOWER_CACHE = null;
  let FLOWER_CACHE_KEY = "";
  function starsFor(w, h, n) {
    const key = w + "x" + h + ":" + n;
    if (STAR_CACHE && STAR_CACHE_KEY === key) return STAR_CACHE;
    const out = [];
    for (let i = 0; i < n; i++) {
      const a = hashU((i + 1) * 2654435761);
      const b = hashU((i + 19) * 1597334677);
      const c = hashU((i + 41) * 374761393);
      out.push({
        x: (a % 10007) / 10007 * w,
        y: (b % 10009) / 10009 * h * 0.8,
        r: 0.35 + (c % 90) / 90 * 1.7,
        a: 0.16 + (c % 70) / 180
      });
    }
    STAR_CACHE = out;
    STAR_CACHE_KEY = key;
    return out;
  }
  function flowersFor(w, h) {
    const key = w + "x" + h + ":v4";
    if (FLOWER_CACHE && FLOWER_CACHE_KEY === key) return FLOWER_CACHE;
    const bird = Math.min(17, Math.max(13, (S.H || h) * 0.021));
    const heroD = bird * 2;
    const minR = heroD * 2.8 * 0.5;
    const kinds = [
      { petals: 11, shape: "ellipse", tex: "silk", layers: 2, hue: 318, sat: 68, lite: 60, alpha: 0.5, size: 3.7, squash: 0.88, skew: 0.1, tilt: 0.16, center: "gold", shift: 12, x: 0.5, y: 0.46, blend: "source-over" },
      { petals: 6, shape: "heart", tex: "ruffle", layers: 1, hue: 344, sat: 42, lite: 80, alpha: 0.78, size: 2.35, squash: 0.94, skew: 0.06, tilt: -0.18, center: "cream", shift: 4, x: 0.16, y: 0.2, blend: "source-over" },
      { petals: 22, shape: "thin", tex: "silk", layers: 1, hue: 48, sat: 96, lite: 56, alpha: 0.22, size: 3.1, squash: 0.42, skew: -0.4, tilt: 0.7, center: "dark", shift: 2, x: 0.82, y: 0.12, blend: "lighter" },
      { petals: 7, shape: "pointed", tex: "vein", layers: 1, hue: 10, sat: 84, lite: 50, alpha: 0.7, size: 2.15, squash: 0.86, skew: 0.14, tilt: 0.38, center: "gold", shift: 7, x: 0.14, y: 0.62, blend: "source-over" },
      { petals: 9, shape: "notch", tex: "spots", layers: 2, hue: 164, sat: 52, lite: 44, alpha: 0.52, size: 2.5, squash: 0.62, skew: 0.3, tilt: -0.48, center: "lime", shift: 22, x: 0.86, y: 0.38, blend: "source-over" },
      { petals: 4, shape: "wide", tex: "glow", layers: 1, hue: 26, sat: 100, lite: 62, alpha: 0.28, size: 2.9, squash: 0.4, skew: 0.48, tilt: -0.85, center: "gold", shift: 18, x: 0.78, y: 0.7, blend: "lighter" },
      { petals: 16, shape: "ellipse", tex: "silk", layers: 2, hue: 274, sat: 40, lite: 34, alpha: 0.62, size: 2.2, squash: 0.76, skew: -0.14, tilt: 0.2, center: "magenta", shift: 5, x: 0.32, y: 0.82, blend: "source-over" },
      { petals: 8, shape: "teardrop", tex: "ragged", layers: 1, hue: 198, sat: 22, lite: 78, alpha: 0.42, size: 2.45, squash: 0.58, skew: -0.32, tilt: 0.9, center: "cream", shift: 11, x: 0.62, y: 0.78, blend: "source-over" },
      { petals: 12, shape: "pointed", tex: "stripes", layers: 1, hue: 318, sat: 70, lite: 54, alpha: 0.36, size: 2.6, squash: 0.5, skew: 0.36, tilt: 0.55, center: "dark", shift: 9, x: 0.28, y: 0.08, blend: "source-over" },
      { petals: 8, shape: "ellipse", tex: "spots", layers: 1, hue: 78, sat: 64, lite: 46, alpha: 0.58, size: 2.05, squash: 0.84, skew: -0.08, tilt: -0.28, center: "lime", shift: 30, x: 0.88, y: 0.88, blend: "source-over" },
      { petals: 5, shape: "wide", tex: "ruffle", layers: 1, hue: 352, sat: 54, lite: 28, alpha: 0.76, size: 2.3, squash: 0.7, skew: 0.22, tilt: 0.08, center: "dark", shift: 8, x: 0.08, y: 0.88, blend: "source-over" },
      { petals: 9, shape: "heart", tex: "vein", layers: 1, hue: 290, sat: 58, lite: 66, alpha: 0.44, size: 2.7, squash: 0.8, skew: -0.2, tilt: -0.4, center: "magenta", shift: 16, x: 0.68, y: 0.28, blend: "source-over" }
    ];
    const out = [];
    for (let i = 0; i < kinds.length; i++) {
      const k = kinds[i];
      const a = hashU((i + 203) * 2654435761);
      const b = hashU((i + 71) * 1597334677);
      out.push({
        x: (k.x + ((a % 900) / 900 - 0.5) * 0.03) * w,
        y: (k.y + ((b % 900) / 900 - 0.5) * 0.03) * h,
        r: minR * k.size,
        petals: k.petals,
        shape: k.shape,
        layers: k.layers,
        tilt: k.tilt,
        squash: k.squash,
        skew: k.skew,
        hue: k.hue,
        sat: k.sat,
        lite: k.lite,
        alpha: k.alpha,
        tex: k.tex,
        center: k.center,
        shift: k.shift,
        blend: k.blend,
        seed: a >>> 0
      });
    }
    FLOWER_CACHE = out;
    FLOWER_CACHE_KEY = key;
    return out;
  }
  function drawBgFlower(ctx, fl, t) {
    ctx.save();
    ctx.translate(fl.x, fl.y);
    ctx.rotate(fl.tilt + Math.sin(t * (0.1 + (fl.seed % 13) * 0.018) + fl.seed) * (0.025 + (fl.seed % 7) * 0.008));
    ctx.transform(1, fl.skew * 0.64, fl.skew * 0.32, fl.squash, 0, 0);
    ctx.globalAlpha = fl.alpha;
    ctx.globalCompositeOperation = fl.blend || "source-over";
    const n = fl.petals;
    const r = fl.r;
    const tex = fl.tex;
    const shape = fl.shape || "ellipse";
    const layers = fl.layers || 1;
    const petalPath = (pr, pw, twist) => {
      ctx.beginPath();
      if (shape === "heart") {
        ctx.moveTo(0, -pr * 0.12);
        ctx.bezierCurveTo(-pw * 1.35, -pr * 0.52, -pw * 0.18, -pr * 1.08, 0, -pr * 0.86);
        ctx.bezierCurveTo(pw * 0.18, -pr * 1.08, pw * 1.35, -pr * 0.52, 0, -pr * 0.12);
      } else if (shape === "pointed") {
        ctx.moveTo(0, r * 0.02);
        ctx.quadraticCurveTo(-pw * 1.2, -pr * 0.3, 0, -pr);
        ctx.quadraticCurveTo(pw * 1.2, -pr * 0.3, 0, r * 0.02);
      } else if (shape === "teardrop") {
        ctx.moveTo(0, r * 0.04);
        ctx.bezierCurveTo(-pw * 1.1, -pr * 0.18, -pw * 0.42, -pr * 0.82, 0, -pr * 1.04);
        ctx.bezierCurveTo(pw * 0.42, -pr * 0.82, pw * 1.1, -pr * 0.18, 0, r * 0.04);
      } else if (shape === "notch") {
        ctx.moveTo(0, -r * 0.04);
        ctx.quadraticCurveTo(-pw, -pr * 0.32, -pw * 0.58, -pr * 0.8);
        ctx.lineTo(0, -pr * 0.52);
        ctx.lineTo(pw * 0.58, -pr * 0.8);
        ctx.quadraticCurveTo(pw, -pr * 0.32, 0, -r * 0.04);
      } else if (shape === "wide") {
        ctx.ellipse(0, -pr * 0.36, pw * 1.4, pr * 0.4, twist * 0.18, 0, Math.PI * 2);
      } else if (shape === "thin") {
        ctx.ellipse(0, -pr * 0.52, pw * 0.5, pr * 0.56, twist * 0.12, 0, Math.PI * 2);
      } else if (tex === "ruffle") {
        ctx.moveTo(0, -r * 0.06);
        for (let k = 0; k <= 10; k++) {
          const u = k / 10;
          const ang = -Math.PI * 0.5 + (u - 0.5) * 1.7;
          const scallop = 1 + Math.sin(u * Math.PI * 5) * 0.16;
          ctx.lineTo(Math.cos(ang) * pw * 1.2 * scallop, -pr * 0.1 + Math.sin(ang) * pr * 0.92 * scallop);
        }
        ctx.closePath();
      } else if (tex === "ragged") {
        ctx.moveTo(0, -r * 0.06);
        ctx.quadraticCurveTo(-pw * 1.15, -pr * 0.32, -pw * 0.5, -pr * 0.86);
        ctx.quadraticCurveTo(0, -pr * 1.12, pw * 0.42, -pr * 0.68);
        ctx.quadraticCurveTo(pw * 1.05, -pr * 0.26, 0, -r * 0.06);
      } else {
        ctx.ellipse(0, -pr * 0.5, pw, pr * 0.52, twist * 0.35, 0, Math.PI * 2);
      }
    };
    for (let layer = layers - 1; layer >= 0; layer--) {
      const scale = 1 - layer * 0.3;
      for (let p = 0; p < n; p++) {
        const twist = (((fl.seed >>> (p * 2 + layer)) & 15) / 15 - 0.5) * (tex === "ragged" ? 0.62 : 0.2);
        const stretch = (shape === "thin" ? 1.02 : 0.76) + ((fl.seed >>> (p * 3)) & 7) / 7 * (shape === "thin" ? 0.1 : 0.44);
        const fat = shape === "thin" ? 0.09 : shape === "wide" ? 0.5 : tex === "silk" ? 0.17 : 0.25 + ((fl.seed >>> p) & 3) * 0.05;
        const pa = p * Math.PI * 2 / n + twist + layer * 0.2 + (tex === "ragged" ? p * 0.08 : 0);
        ctx.save();
        ctx.rotate(pa);
        const pr = r * stretch * scale;
        const pw = r * fat * scale;
        const hue = (fl.hue + p * fl.shift + layer * 16) % 360;
        const sat = Math.max(6, fl.sat - layer * 12);
        const lite = fl.lite + layer * 8;
        const g = ctx.createRadialGradient(0, -pr * 0.16, r * 0.03, 0, -pr * 0.48, pr);
        if (tex === "silk") {
          g.addColorStop(0, "hsla(" + hue + "," + sat + "%," + Math.min(94, lite + 26) + "%,0.82)");
          g.addColorStop(0.5, "hsla(" + hue + "," + sat + "%," + lite + "%,0.4)");
          g.addColorStop(1, "hsla(" + hue + "," + Math.max(8, sat - 28) + "%," + (lite - 16) + "%,0.03)");
        } else if (tex === "glow") {
          g.addColorStop(0, "hsla(" + hue + ",100%,88%,0.78)");
          g.addColorStop(0.4, "hsla(" + ((hue + 30) % 360) + ",92%,58%,0.32)");
          g.addColorStop(1, "hsla(" + hue + ",80%,48%,0)");
        } else {
          g.addColorStop(0, "hsla(" + hue + "," + sat + "%," + Math.min(92, lite + 18) + "%,0.95)");
          g.addColorStop(0.42, "hsla(" + hue + "," + sat + "%," + lite + "%,0.76)");
          g.addColorStop(1, "hsla(" + ((hue + 40) % 360) + "," + Math.max(10, sat - 20) + "%," + (lite - 14) + "%,0.07)");
        }
        ctx.fillStyle = g;
        petalPath(pr, pw, twist);
        ctx.fill();
        if (tex === "vein") {
          ctx.strokeStyle = "hsla(" + hue + ",38%,96%,0.42)";
          ctx.lineWidth = Math.max(0.7, r * 0.02);
          ctx.beginPath();
          ctx.moveTo(0, -r * 0.06);
          ctx.quadraticCurveTo(pw * 0.14, -pr * 0.4, 0, -pr * 0.92);
          ctx.stroke();
          ctx.strokeStyle = "hsla(" + hue + ",28%,18%,0.14)";
          ctx.beginPath();
          ctx.moveTo(-pw * 0.28, -pr * 0.25);
          ctx.quadraticCurveTo(-pw * 0.08, -pr * 0.5, -pw * 0.1, -pr * 0.75);
          ctx.stroke();
        }
        if (tex === "stripes") {
          ctx.strokeStyle = "hsla(" + ((hue + 52) % 360) + ",42%,26%,0.32)";
          ctx.lineWidth = Math.max(1, r * 0.026);
          for (let s = 0; s < 4; s++) {
            const yy = -pr * (0.2 + s * 0.16);
            ctx.beginPath();
            ctx.ellipse(0, yy, pw * (0.72 - s * 0.1), pr * 0.045, 0, 0, Math.PI * 2);
            ctx.stroke();
          }
        }
        if (tex === "spots") {
          ctx.fillStyle = "hsla(" + ((hue + 168) % 360) + ",32%,94%,0.4)";
          const spots = 4 + (p % 4);
          for (let s = 0; s < spots; s++) {
            const sx = ((((fl.seed >>> (s + p * 3)) & 15) / 15) - 0.5) * pw * 1.05;
            const sy = -pr * (0.18 + ((fl.seed >>> (s * 2 + p)) & 7) / 11);
            ctx.beginPath();
            ctx.ellipse(sx, sy, r * (0.032 + (s % 4) * 0.018), r * 0.026, pa, 0, Math.PI * 2);
            ctx.fill();
          }
        }
        if (tex === "ruffle") {
          ctx.strokeStyle = "hsla(" + hue + ",30%,96%,0.26)";
          ctx.lineWidth = Math.max(0.6, r * 0.016);
          ctx.beginPath();
          ctx.moveTo(0, -r * 0.08);
          ctx.quadraticCurveTo(pw * 0.2, -pr * 0.42, 0, -pr * 0.88);
          ctx.stroke();
        }
        ctx.restore();
      }
    }
    ctx.globalCompositeOperation = "source-over";
    const centers = {
      gold: ["rgba(255,250,210,0.95)", "rgba(255,210,60,0.9)", "rgba(180,60,160,0.5)"],
      dark: ["rgba(28,6,36,0.92)", "rgba(70,16,90,0.78)", "rgba(12,2,18,0.65)"],
      lime: ["rgba(236,255,170,0.92)", "rgba(90,200,50,0.84)", "rgba(24,70,28,0.48)"],
      magenta: ["rgba(255,190,220,0.9)", "rgba(200,50,140,0.82)", "rgba(70,12,60,0.5)"],
      cream: ["rgba(255,255,246,0.96)", "rgba(255,236,198,0.78)", "rgba(190,150,110,0.4)"]
    };
    const cc = centers[fl.center] || centers.gold;
    const cg = ctx.createRadialGradient(-r * 0.1, -r * 0.1, r * 0.02, 0, 0, r * (shape === "thin" ? 0.2 : 0.34));
    cg.addColorStop(0, cc[0]);
    cg.addColorStop(0.45, cc[1]);
    cg.addColorStop(1, cc[2]);
    ctx.fillStyle = cg;
    ctx.beginPath();
    const crx = r * (fl.center === "dark" ? 0.2 : shape === "thin" ? 0.16 : 0.3);
    const cry = r * (fl.center === "dark" ? 0.14 : 0.22);
    ctx.ellipse(0, 0, crx, cry, fl.skew * 0.3, 0, Math.PI * 2);
    ctx.fill();
    ctx.fillStyle = fl.center === "dark" ? "rgba(255,220,120,0.32)" : "rgba(70,16,90,0.28)";
    const dots = fl.center === "cream" ? 5 : fl.center === "dark" ? 18 : 12;
    for (let d = 0; d < dots; d++) {
      const ang = d * 2.399 + (fl.seed % 13) * 0.15;
      const rr = r * (0.03 + (d % 6) * 0.03);
      ctx.beginPath();
      ctx.ellipse(Math.cos(ang) * rr, Math.sin(ang) * rr * 0.62, r * (0.018 + (d % 3) * 0.008), r * 0.014, ang, 0, Math.PI * 2);
      ctx.fill();
    }
    ctx.restore();
  }

  // The gradient sky, stars, sun/moon glow and vignette never change for a palette + size, but full-canvas
  // gradient fills are the most expensive thing to rasterize on phones. Bake them once per palette/size.
  const BG_CACHE = new Map();
  function paintBgStatic(ctx, w, h) {
    const g = ctx.createLinearGradient(0, 0, 0, h);
    g.addColorStop(0, PAL.bgTop || PAL.bg);
    g.addColorStop(0.52, PAL.bg);
    g.addColorStop(1, PAL.bgBot || PAL.bg);
    ctx.fillStyle = g;
    ctx.fillRect(0, 0, w, h);
    const id = PALETTE_ID;
    if (id === "midnight" || id === "neon") {
      const stars = starsFor(w, h, id === "midnight" ? 72 : 48);
      for (let i = 0; i < stars.length; i++) {
        const st = stars[i];
        ctx.fillStyle = palRgba(PAL.fg, st.a);
        ctx.beginPath();
        ctx.arc(st.x, st.y, st.r, 0, Math.PI * 2);
        ctx.fill();
      }
    }
    if (id === "sunset") {
      const cx = w * 0.78, cy = h * 0.2, rad = Math.max(70, h * 0.16);
      const sun = ctx.createRadialGradient(cx, cy, 6, cx, cy, rad);
      sun.addColorStop(0, palRgba("#ffd0a0", 0.95));
      sun.addColorStop(0.18, palRgba(PAL.gold, 0.72));
      sun.addColorStop(0.48, palRgba(PAL.gold, 0.16));
      sun.addColorStop(1, "rgba(0,0,0,0)");
      ctx.fillStyle = sun;
      ctx.fillRect(0, 0, w, h);
      ctx.fillStyle = palRgba(PAL.gold, 0.14);
      ctx.fillRect(0, cy + 10, w, 3);
    }
    if (id === "midnight") {
      const cx = w * 0.78, cy = h * 0.2, rad = Math.max(70, h * 0.16);
      const moonR = Math.max(15, h * 0.036);
      const glow = ctx.createRadialGradient(cx, cy, 4, cx, cy, rad);
      glow.addColorStop(0, palRgba("#e8eefc", 0.7));
      glow.addColorStop(0.2, palRgba(PAL.gold, 0.28));
      glow.addColorStop(0.55, palRgba(PAL.gold, 0.08));
      glow.addColorStop(1, "rgba(0,0,0,0)");
      ctx.fillStyle = glow;
      ctx.fillRect(0, 0, w, h);
      ctx.fillStyle = "#eef3ff";
      ctx.beginPath();
      ctx.arc(cx, cy, moonR, 0, Math.PI * 2);
      ctx.fill();
      ctx.fillStyle = palRgba("#c5d2ee", 0.55);
      ctx.beginPath();
      ctx.arc(cx - moonR * 0.22, cy + moonR * 0.12, moonR * 0.18, 0, Math.PI * 2);
      ctx.fill();
      ctx.beginPath();
      ctx.arc(cx + moonR * 0.28, cy - moonR * 0.2, moonR * 0.12, 0, Math.PI * 2);
      ctx.fill();
      ctx.beginPath();
      ctx.arc(cx + moonR * 0.08, cy + moonR * 0.32, moonR * 0.09, 0, Math.PI * 2);
      ctx.fill();
    }
    if (id === "neon") {
      const a = ctx.createRadialGradient(w * 0.18, h * 0.12, 2, w * 0.18, h * 0.12, 170);
      a.addColorStop(0, palRgba(PAL.gold, 0.34));
      a.addColorStop(1, "rgba(0,0,0,0)");
      ctx.fillStyle = a;
      ctx.fillRect(0, 0, w, h);
      const b = ctx.createRadialGradient(w * 0.88, h * 0.78, 2, w * 0.88, h * 0.78, 190);
      b.addColorStop(0, palRgba(PAL.green, 0.22));
      b.addColorStop(1, "rgba(0,0,0,0)");
      ctx.fillStyle = b;
      ctx.fillRect(0, 0, w, h);
    }
    if (id === "terminal") {
      ctx.fillStyle = palRgba(PAL.gold, 0.05);
      for (let y = 0; y < h; y += 3) ctx.fillRect(0, y, w, 1);
      const vg = ctx.createRadialGradient(w * 0.5, h * 0.5, h * 0.2, w * 0.5, h * 0.5, h * 0.74);
      vg.addColorStop(0, "rgba(0,0,0,0)");
      vg.addColorStop(1, "rgba(0,0,0,0.38)");
      ctx.fillStyle = vg;
      ctx.fillRect(0, 0, w, h);
    }
  }
  function drawWorldBg(ctx, wash, w, h) {
    w = w || S.W;
    h = h || S.H;
    const id = PALETTE_ID;
    const dpr = canvasDpr();
    const key = id + "|" + w + "|" + h + "|" + dpr + "|" + PAL.bgTop + PAL.bg + PAL.bgBot + PAL.gold + PAL.green + PAL.fg;
    let bc = BG_CACHE.get(key);
    if (!bc) {
      if (BG_CACHE.size > 6) BG_CACHE.clear();
      bc = document.createElement("canvas");
      bc.width = Math.round(w * dpr); bc.height = Math.round(h * dpr);
      const g = bc.getContext("2d");
      g.setTransform(dpr, 0, 0, dpr, 0, 0);
      paintBgStatic(g, w, h);
      BG_CACHE.set(key, bc);
    }
    ctx.drawImage(bc, 0, 0, bc.width, bc.height, 0, 0, w, h);
    if (id === "flower") {
      const tnow = performance.now() * 0.001;
      for (let i = 6; i >= 0; i--) {
        const rad = 36 + i * 38 + Math.sin(tnow * 0.7 + i) * 8;
        ctx.beginPath();
        ctx.arc(w * 0.5 + Math.cos(tnow * 0.35) * 18, h * 0.42 + Math.sin(tnow * 0.28) * 12, rad, 0, Math.PI * 2);
        ctx.strokeStyle = "hsla(" + ((tnow * 48 + i * 52) % 360) + ",85%,62%,0.14)";
        ctx.lineWidth = 10;
        ctx.stroke();
      }
      const blooms = flowersFor(w, h);
      for (let i = 0; i < blooms.length; i++) drawBgFlower(ctx, blooms[i], tnow);
    }
    if (id === "paper") {
      ctx.strokeStyle = palRgba(PAL.line, 0.7);
      ctx.lineWidth = 1;
      for (let y = 22; y < h; y += 20) {
        ctx.beginPath();
        ctx.moveTo(8, y);
        ctx.lineTo(w - 8, y);
        ctx.stroke();
      }
      ctx.strokeStyle = palRgba(PAL.red, 0.24);
      ctx.beginPath();
      ctx.moveTo(40, 0);
      ctx.lineTo(40, h);
      ctx.stroke();
    } else if (id !== "simple") {
      ctx.strokeStyle = wash ? palRgba(wash, 0.38) : PAL.grid;
      ctx.lineWidth = 1;
      const stepG = id === "terminal" ? 28 : 36;
      const ox = -(((S.bg || 0) * 0.5) % stepG);
      ctx.beginPath();
      for (let x = ox; x < w + stepG; x += stepG) { ctx.moveTo(x, 0); ctx.lineTo(x, h); }
      for (let y = 0; y < h; y += stepG) { ctx.moveTo(0, y); ctx.lineTo(w, y); }
      ctx.stroke();
    }
    if (S.power === "BULL" || S.power === "BEAR") {
      const tint = wash || (S.power === "BULL" ? PAL.green : PAL.red);
      const a = PALETTE_ID === "simple" ? (S.swanBear ? 0.16 : 0.1) : 0.16;
      ctx.fillStyle = palRgba(tint, a);
      ctx.fillRect(0, 0, w, h);
    }
  }

  function draw(ctx) {
    const wash = powerWash();
    drawWorldBg(ctx, wash);
    drawTape(ctx, S.tape, S.H * 0.196, S.H * 0.804, palRgba(GREEN, 0.58), palRgba(RED, 0.58));

    const m = metrics();
    const pw = pipePw();
    const endingFlash = S.power === "BULL" && S.powerT < 1.15 && Math.floor(S.powerT * 9) % 2 === 0;
    const edge = (PALETTE_ID === "simple" && wash) ? "#ffffff" : (wash || (S.laserOn ? "#e8902a" : palRgba(PAL.fg, 0.85)));
    for (const p of S.pipes) {
      const col = endingFlash ? RED : wash || (p.green ? GREEN : RED);
      const ends = pipeEnds(p);
      const wx = pipeWx(p, pw);
      p.wx = wx;
      if (p.finish) {
        ctx.save();
        const stripe = 12;
        for (let y = 0; y < S.H; y += stripe) {
          ctx.fillStyle = ((y / stripe) | 0) % 2 === 0 ? PAL.fg : PAL.ink;
          ctx.fillRect(p.x, y, Math.max(10, pw * 0.42), stripe);
        }
        ctx.fillStyle = BTC;
        ctx.fillRect(p.x - 3, 0, 5, S.H);
        ctx.fillStyle = PAL.hud;
        ctx.font = "700 13px \"IBM Plex Mono\", monospace";
        ctx.textAlign = "center"; ctx.textBaseline = "top";
        paintHaloText(ctx, t("mpRace").toUpperCase(), p.x + pw * 0.2, 10, PAL.hud);
        ctx.restore();
        continue;
      }
      ctx.fillStyle = col; ctx.strokeStyle = edge; ctx.lineWidth = S.laserOn ? 2.4 : 1.6;
      ctx.fillRect(p.x, 0, pw, ends.top); ctx.strokeRect(p.x + 0.5, 0.5, pw - 1, Math.max(0, ends.top - 1));
      ctx.fillRect(p.x, ends.bot, pw, S.H - ends.bot); ctx.strokeRect(p.x + 0.5, ends.bot + 0.5, pw - 1, Math.max(0, S.H - ends.bot - 1));
      const wick = Math.min(22, p.gapH * 0.14);
      ctx.beginPath(); ctx.strokeStyle = wash ? wash : S.laserOn ? "rgba(232,144,42,0.75)" : palRgba(PAL.fg, 0.5); ctx.lineWidth = 2;
      ctx.moveTo(wx, ends.top); ctx.lineTo(wx, ends.top + wick); ctx.moveTo(wx, ends.bot); ctx.lineTo(wx, ends.bot - wick); ctx.stroke();
    }
    for (const it of S.items) {
      const p = it.pipe && S.pipes.indexOf(it.pipe) >= 0 ? it.pipe : null;
      if (p && !it.freeX) it.x = p.wx;
      drawPowerIcon(ctx, it, wash);
    }
    const blink = S.invuln > 0 && Math.floor(S.invuln * 10) % 2 === 0;
    const foc = S.mp ? mpFocusPlayer() : null;
    const mineId = window.ChoppyMP && window.ChoppyMP.id ? window.ChoppyMP.id() : null;
    const selfGhost = !!(S.mp && (S.spectate || S.dead || S.finished) && foc && foc.id !== mineId);
    if (!blink && !selfGhost) drawBirdAt(ctx, S.bird.x, S.bird.y, S.bird.v, S.bird.r, myHero(), wash, 1, S.laserOn, HERO_ANIM, HERO_SKIN);
    if (S.mp && window.ChoppyMP) {
      (window.ChoppyMP.players() || []).forEach((p) => {
        if (!p || p.id === mineId) return;
        if (p.x == null || p.y == null) return;
        const h = heroOf(p.slot || 0);
        const lead = foc && p.id === foc.id;
        const gone = p.alive === false && !p.finished;
        if (gone && !lead) return;
        if (p._gx == null) { p._gx = p.x; p._gy = p.y; }
        else {
          p._gx += (p.x - p._gx) * 0.28;
          p._gy += (p.y - p._gy) * 0.28;
        }
        drawBirdAt(ctx, p._gx, p._gy, p.v || 0, S.bird.r, h, wash, lead ? 1 : 0.25, !!p.laser, false);
      });
    }
    for (const pt of S.particles) {
      ctx.globalAlpha = Math.max(0, pt.life / 0.5);
      ctx.fillStyle = pt.solid ? pt.color : (wash || pt.color); ctx.fillRect(pt.x, pt.y, 3, 3);
    }
    ctx.textAlign = "center"; ctx.textBaseline = "middle";
    for (const f of S.floats) {
      ctx.font = "700 " + f.size + "px \"IBM Plex Mono\", monospace";
      ctx.globalAlpha = f.maxA * Math.max(0, Math.min(1, f.life / 0.28));
      const label = f.kind === "gain" ? usdIntLabel(f.text) : f.text;
      if (f.kind === "trade") paintSharpText(ctx, label, f.x, f.y, f.color || PAL.fg);
      else paintHaloText(ctx, label, f.x, f.y, f.color || PAL.fg);
    }
    ctx.globalAlpha = 1;
    if (wash) {
      const a = PALETTE_ID === "simple" ? (S.swanBear ? 0.2 : 0.14) : 0.22;
      ctx.fillStyle = palRgba(wash, a);
      ctx.fillRect(0, 0, S.W, S.H);
    }
    ctx.fillStyle = wash || BTC; ctx.fillRect(0, S.H - 3, S.W, 3);
  }

  function paintHeroPreview() {
    const el = $("hero-prev");
    if (!el) return;
    const dpr = canvasDpr();
    const w = 168, h = 120;
    if (el.width !== w * dpr || el.height !== h * dpr) {
      el.width = w * dpr;
      el.height = h * dpr;
    }
    const ctx = el.getContext("2d");
    if (!ctx) return;
    ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
    drawWorldBg(ctx, null, w, h);
    ctx.fillStyle = GREEN;
    ctx.fillRect(14, 0, 14, 36);
    ctx.fillRect(14, 78, 14, 42);
    ctx.fillStyle = RED;
    ctx.fillRect(140, 0, 14, 46);
    ctx.fillRect(140, 86, 14, 34);
    const t = performance.now() * 0.001;
    drawBirdAt(ctx, w * 0.5, h * 0.54, Math.sin(t * 4.2) * 90, 15, myHero(), null, 1, false, HERO_ANIM, HERO_SKIN);
    ctx.font = "700 10px \"IBM Plex Mono\", monospace";
    ctx.textAlign = "right";
    ctx.textBaseline = "bottom";
    paintHaloText(ctx, HERO_ANIM ? "3D" : "2D", w - 6, h - 5, PAL.hud || PAL.fg);
  }

  const GAME_W = 480;
  const GAME_H = 640;

  let fitW = 0, fitH = 0, fitCtx = null;
  // Backing-store scale for the main canvas. Capped at 2: DPR 3 phones would otherwise push 2.25x the pixels
  // every frame for no visible gain on a 480x640 pixel-art stage.
  // Low-end phones (<=4 cores or <=3GB) start at 1.5x; any device that sustains slow frames steps down to 1x.
  const LOW_END = (navigator.hardwareConcurrency || 8) <= 4 || ((navigator.deviceMemory || 8) <= 3);
  let DPR_CAP = LOW_END ? 1.5 : 2;
  let perfEma = 16.7, perfSlow = 0;
  function perfSample(ms) {
    if (!(ms > 0 && ms < 250)) return;
    perfEma += (ms - perfEma) * 0.05;
    if (perfEma > 24 && DPR_CAP > 1 && Math.min(DPR_CAP, window.devicePixelRatio || 1) > 1) {
      if (++perfSlow > 180) { DPR_CAP = Math.max(1, DPR_CAP - 0.5); perfSlow = 0; perfEma = 16.7; fitW = 0; }
    } else perfSlow = 0;
  }
  function canvasDpr() { return Math.min(DPR_CAP, window.devicePixelRatio || 1); }
  function fit() {
    const dpr = canvasDpr();
    const W = GAME_W, H = GAME_H;
    S.W = W; S.H = H;
    if (fitCtx && W === fitW && H === fitH) return fitCtx;
    fitW = W; fitH = H;
    canvas.width = W * dpr;
    canvas.height = H * dpr;
    canvas.style.width = "100%";
    canvas.style.height = "100%";
    fitCtx = canvas.getContext("2d");
    fitCtx.setTransform(dpr, 0, 0, dpr, 0, 0);
    return fitCtx;
  }

  function layoutStage() {
    renderBitcoinCountry();
    const app = $("app");
    if (!app) return;
    app.style.transform = "none";
    const baseW = GAME_W;
    const baseH = app.offsetHeight || (GAME_H + 160);
    const pad = 8;
    const bs = getComputedStyle(document.body);
    const inset = (parseFloat(bs.paddingBottom) || 0) + (parseFloat(bs.paddingTop) || 0);
    const insetX = (parseFloat(bs.paddingLeft) || 0) + (parseFloat(bs.paddingRight) || 0);
    const viewW = (window.visualViewport && window.visualViewport.width) || window.innerWidth;
    const viewH = (window.visualViewport && window.visualViewport.height) || window.innerHeight;
    const sx = (viewW - pad - insetX) / baseW;
    const sy = (viewH - pad - inset) / baseH;
    const s = Math.max(0.35, Math.min(sx, sy));
    app.style.transform = "scale(" + s + ")";
    S.stageScale = s;
    popOverlay();
  }
  // Short landscape screens (phones on their side) shrink the 480px stage to ~0.5x, which made arc cards
  // and popups 5-7px text. While the overlay is open there, it is lifted out of the stage scale: laid out
  // in a box sized to the real viewport and scaled to a readable size, centred on screen.
  function popOverlay() {
    const o = overlay, fld = $("field"), app = $("app");
    if (!o || !fld || !app) return;
    const viewW = (window.visualViewport && window.visualViewport.width) || window.innerWidth;
    const viewH = (window.visualViewport && window.visualViewport.height) || window.innerHeight;
    const s = S.stageScale || 1;
    const want = o.classList.contains("open") && viewW > viewH * 1.15 && s < 0.8;
    const was = o.classList.contains("pop");
    if (!want) {
      if (was) {
        o.classList.remove("pop");
        o.style.left = o.style.top = o.style.width = o.style.height = o.style.transform = "";
        document.documentElement.classList.remove("ui-pop");
      }
      return;
    }
    const k = Math.max(0.62, Math.min(1, viewH / 440));
    const Wn = Math.min(560, (viewW * 0.94) / k), Hn = (viewH * 0.96) / k;
    if (!document.documentElement.classList.contains("ui-pop")) document.documentElement.classList.add("ui-pop");
    if (!was) o.classList.add("pop"); // guarded: classList.add re-fires the class observer even when unchanged
    o.style.transform = "none";
    const fr = fld.getBoundingClientRect();
    const visL = (viewW - Wn * k) / 2, visT = (viewH - Hn * k) / 2;
    o.style.left = ((visL - fr.left) / s) + "px";
    o.style.top = ((visT - fr.top) / s) + "px";
    o.style.width = Wn + "px";
    o.style.height = Hn + "px";
    o.style.transform = "scale(" + (k / s) + ")";
  }
  if (overlay && window.MutationObserver) {
    new MutationObserver(() => popOverlay()).observe(overlay, { attributes: true, attributeFilter: ["class"] });
  }

  function renderBitcoinCountry(){
    costAsBtc = null;
    const bar=$("bc-bar"),panel=$("bc-panel");if(!bar)return;
    const unlocked=!!(S.chanceUsed&&S.chanceUsed.citadelProblem)&&!S.bcArcClosed;
    bar.classList.toggle("hide",!unlocked);
    if(!unlocked){
      if(panel)panel.classList.add("hide");
      const open=$("bc-open");if(open)open.classList.remove("army-ready");
      armyAlarmAt=0;
      return;
    }
    const named=cleanCountryName(S.bcCountryName);
    const brand=named?named.toUpperCase():"BITCOIN COUNTRY";
    const openBtn=$("bc-open"); if(openBtn) openBtn.textContent=brand;
    const headB=document.querySelector("#bc-panel .bc-head b"); if(headB) headB.textContent=brand;
    const warBit=S.bcRepliesDone&&!S.bcVictory?(chanceLang()?" · EN GUERRA":" · AT WAR"):"";
    setTxt("bc-mini",chanceLang()?("NODOS "+(S.bcNodes||0)+"/100 · EJÉR "+armyTier()+"/7 · MUNDO "+(S.bcWorld||20)+warBit):("NODES "+(S.bcNodes||0)+"/100 · ARMY "+armyTier()+"/7 · WORLD "+(S.bcWorld||20)+warBit));
    setTxt("bc-nodes",(S.bcNodes||0)+" / 100");setTxt("bc-army",armyTier()+" / 7");setTxt("bc-world",String(S.bcWorld||20));
    const esP=chanceLang();
    const labs=esP?["NODOS DE LIBERTAD","EJÉRCITO","MUNDO","CIUDADELA","MINA","ESTADO"]:["LIBERTY NODES","ARMY","WORLD","CITADEL","MINE","STATUS"];
    document.querySelectorAll("#bc-panel .bc-grid > div > span").forEach((sp,i)=>{if(labs[i]&&sp.textContent!==labs[i])sp.textContent=labs[i];});
    setTxt("bc-citadel",S.bcCitadel?(esP?"CONSTRUIDA":"BUILT"):(esP?"SIN CONSTRUIR":"NOT BUILT"));setTxt("bc-mine",S.bcMine?(esP?"ACTIVA":"ONLINE"):(esP?"INACTIVA":"OFFLINE"));
    setTxt("bc-status",S.bcVictory?(esP?"INDEPENDIENTE":"INDEPENDENT"):S.bcIndependent?(esP?"DECLARADA":"DECLARED"):S.bcIsland?(esP?"PROYECTO":"PROJECT"):(esP?"BUSCANDO":"SEARCHING"));
    setTxt("bc-declare",esP?"DECLARAR LA INDEPENDENCIA":"DECLARE INDEPENDENCE");
    const form=$("bc-form-army");
    if(form){
      const show=!S.bcArmyUnlocked&&!S.bcVictory&&!S.bcArcClosed&&!!(S.chanceUsed&&S.chanceUsed.citadelProblem);
      form.classList.toggle("hide",!show);
      if(show) form.textContent=(chanceLang()?"FORMAR DEFENSA · ":"FORM DEFENSE · ")+costLabel(wealthUsd()*0.02);
    }
    const ab=$("bc-army10"),ab2=$("bc-army-bar");
    const tier=armyTier();
    const quote=armyTierQuote();
    const canBuy=!!S.bcArmyUnlocked&&!S.bcVictory&&!S.bcArcClosed&&tier<7&&quote.affordable;
    const es=chanceLang();
    const nextLab=tier>=7?(es?"MÁXIMO":"MAX"):("TIER "+(tier+1)+"/7 · "+quote.label);
    if(ab){ab.disabled=!canBuy;ab.classList.toggle("hide",!S.bcArmyUnlocked||S.bcVictory);ab.textContent=nextLab;}
    if(ab2)ab2.classList.add("hide");
    const openBtnReady=$("bc-open");
    if(openBtnReady)openBtnReady.classList.toggle("army-ready",!!canBuy);
    tickArmyAlarm(canBuy);
    const dec=$("bc-declare");if(dec){const ready=(S.bcNodes||0)>=100&&!S.bcIndependent&&!S.bcVictory;dec.classList.toggle("hide",!ready);}
    const ups=$("bc-ups");
    if(ups){
      if(!S.bcArmyUnlocked){
        ups.innerHTML="<p class=\"bc-note\">"+(es?"Forma una fuerza de defensa para entrenar el ejército.":"Form a defense force to train the army.")+"</p>";
      }else{
        const tierNow=armyTier();
        const m=armyBattleMods(tierNow);
        const bits=[];
        if(m.speed)bits.push((es?"Velocidad +":"Speed +")+m.speed+"%");
        if(m.shield)bits.push((es?"Escudo −":"Shield −")+m.shield+"%"+(es?" de daño":" damage"));
        bits.push((m.hearts)+" "+(es?"corazones":"hearts"));
        const now=(es?"En batalla: ":"In battle: ")+bits.join(" · ");
        const steps=[];
        for(let n=1;n<=7;n++){
          const life=n%2===0;
          const lab=(es?"Velocidad +":"Speed +")+(n*5)+"% · "+(es?"escudo −":"shield −")+(n*5)+"%"+(life?(es?" · +1 corazón":" · +1 heart"):"");
          steps.push([n,lab]);
        }
        const list=steps.map(([n,lab])=>"<li class=\""+(tierNow>=n?"on":"")+"\">"+(tierNow>=n?"●":"○")+" "+n+" · "+lab+"</li>").join("");
        const hint=es?"Cada tier suma 5% de velocidad, 5% de defensa del escudo, 4% de velocidad de disparo y 4% menos enemigos. Los pares suman 1 corazón, el tier 5 levanta el muro de la ciudadela y el tier 7 duplica el daño. El tier N cuesta N×250 BTC o el 5% del patrimonio (lo que sea mayor), en la moneda que más tienes.":"Each tier adds 5% speed, 5% shield defense, 4% shot speed and 4% fewer attackers. Even tiers add 1 heart, tier 5 raises the citadel wall and tier 7 doubles damage. Tier N costs N×250 BTC or 5% of net worth (whichever is higher), shown in whichever you hold more of.";
        ups.innerHTML="<p class=\"bc-up-now\">"+now+"</p><ul class=\"bc-up-list\">"+list+"</ul><p class=\"bc-note\">"+hint+"</p>";
      }
    }
    {const endB=$("bc-end");if(endB){endB.classList.toggle("hide",!S.bcVictory||!!S.mp);endB.textContent=es?"TERMINAR LA PARTIDA":"END THE GAME";}}
    setTxt("bc-note",S.bcVictory?(es?"Independiente. Puedes seguir jugando o terminar la partida cuando quieras.":"Independent. Keep playing, or end the game whenever you like."):S.bcArmyUnlocked?(es?"Las compras de ejército son permanentes. La fuerza mundial puede seguir subiendo.":"Army purchases are permanent. World strength can keep rising."):(es?"El ejército se entrena aquí. Forma una fuerza de defensa (2%) si la omitiste.":"Army is trained here. Form a defense force (2%) if you skipped it."));
  }
  let armyAlarmAt=0;
  function tickArmyAlarm(canBuy){
    if(!canBuy){armyAlarmAt=0;return;}
    if(S.phase==="defense"||(S.bcDefense&&S.bcDefense.frozen))return;
    const now=performance.now();
    if(armyAlarmAt&&now<armyAlarmAt)return;
    armyAlarmAt=now+4800;
    warSfx("armyReady");
  }
  function renderHud() {
    try { renderBitcoinCountry(); } catch (e) {}
    const app = $("app");
    if (app) app.classList.toggle("vs-on", !!(S.phase === "mplobby" || S.phase === "mpwin" || S.phase === "mpwait" || S.phase === "count" || (S.mp && S.phase === "play")));
    const clock = $("clock");
    const candles = $("h-candles");
    const battleHud = S.phase === "defense" || !!(S.bcDefense && S.bcDefense.frozen);
    const hideClock = S.phase === "ready" || S.phase === "count";
    if (clock) {
      clock.textContent = fmtTime(S.lifeT);
      clock.classList.toggle("hide", hideClock);
    }
    if (candles) {
      candles.textContent = String(S.shownCandles || 0);
      candles.classList.toggle("hide", hideClock || battleHud);
    }
    const box = $("clock-box");
    if (box) box.classList.toggle("hide", hideClock);
    setTxt("h-cash", money(S.cash));
    setTxt("h-btc", fmtBtcAmt(S.btc));
    setTxt("h-price", money(S.price));
    setTxt("h-cold", String(S.cold));
    setTxt("h-msig", String(S.msig));
    setTxt("h-laser", String(S.lasers || 0));
    setTxt("h-fib", String(S.ranked ? (S.nextOffer || 1) : 0));
    setTxt("h-halve", String(S.halveLeft));
    setTxt("h-halves", String(S.halvings || 0) + "/" + String(S.halveSpawned || 0));
    const chip = $("mp-chip");
    if (chip) {
      const show = !!(S.mp && (S.phase === "play" || S.phase === "mpwait" || S.phase === "count"));
      chip.classList.toggle("hide", !show);
      if (show && window.ChoppyMP) {
        const live = window.ChoppyMP.alive() || [];
        const all = window.ChoppyMP.players() || [];
        const mode = (S.mpRules && S.mpRules.mode) || "last";
        const g = S.mpGameN || (window.ChoppyMP.gameN && window.ChoppyMP.gameN()) || 1;
        const bo = (S.mpRules && S.mpRules.bestOf) || 1;
        const tag = mode === "whale" ? t("mpWhale") : mode === "race" ? t("mpRace") : t("mpLast");
        chip.textContent = live.length + "/" + Math.max(all.length, 1) + " · " + tag + (bo > 1 ? " · " + g + "/" + bo : "");
      }
      if (show && S.mp && S.phase === "play" && !S.dead && !S.finished && !S.spectate && window.ChoppyMP && window.ChoppyMP.pulse) {
        if (!S.mpPulseAt || S.lifeT - S.mpPulseAt > 0.12) {
          S.mpPulseAt = S.lifeT;
          window.ChoppyMP.pulse({
            candles: S.candles, lifeT: S.lifeT, alive: true, finished: false,
            x: S.bird.x, y: S.bird.y, v: S.bird.v,
            laser: !!S.laserOn, power: S.power,
            btc: S.btc, cold: S.cold, slot: S.mpSlot
          });
        }
      }
    }
    const listEl = $("mp-hud-list");
    if (listEl) {
      const vs = !!(S.mp && (S.phase === "play" || S.phase === "count" || S.phase === "mpwait"));
      listEl.classList.toggle("hide", !vs);
      if (vs && window.ChoppyMP) {
        const mine = window.ChoppyMP.id();
        const wins = S.mpSeriesWins || (window.ChoppyMP.wins && window.ChoppyMP.wins()) || {};
        const foc = mpFocusPlayer();
        listEl.innerHTML = (window.ChoppyMP.players() || []).map((p) => {
          const h = heroOf(p.slot || 0);
          const dead = p.alive === false;
          const fin = !!p.finished;
          const you = p.id === mine;
          const lead = foc && p.id === foc.id;
          const w = wins[p.id] != null ? wins[p.id] : 0;
          const extra = (lead && S.mpRoundOver) ? t("mpWins") : dead ? t("mpDead") : fin ? t("mpFinished") : "";
          return "<span class=\"mp-pill" + (dead || fin ? " out" : "") + (lead ? " lead" : "") + "\"><span class=\"dot\" style=\"background:" + h.fill + "\"></span>"
            + (p.name || "?") + (you ? " · " + t("mpYou") : "")
            + (S.mpRules && S.mpRules.bestOf > 1 ? " · " + w : "")
            + (extra ? " · " + extra : "") + "</span>";
        }).join("");
      }
    }
    const bonus = S.level >= 2;
    $("hud").className = "hud-grid hud-4";
    const lockBtn = (id, ready) => {
      const el = $(id);
      if (!el) return;
      el.disabled = !ready;
      el.classList.toggle("locked", !ready);
    };
    lockBtn("spd-2", S.have.ff > 0);
    const spd2 = $("spd-2");
    if (spd2) {
      const list = ffSpeeds();
      if (!list.some((x) => Math.abs(x - (S.speedMul || 1)) < 0.001)) S.speedMul = 1;
      const sm = S.speedMul || 1;
      spd2.textContent = (sm % 1 ? sm.toFixed(1) : String(sm)) + "X";
      spd2.classList.add("on");
    }
    lockBtn("dca-btn", S.have.dca > 0);
    lockBtn("iabud-btn", (S.have.aibud || 0) > 0);
    lockBtn("trend-btn", S.have.manip > 0);
    lockBtn("market-btn", (S.have.market || 0) > 0);
    const locks = aiLocks();
    const dca = $("dca-btn");
    if (dca) {
      dca.classList.toggle("on", S.dcaOn);
      dca.classList.toggle("ai-lit", !!(S.aibudLit && S.aibudLit.dca && S.dcaOn));
      dca.classList.toggle("ai-lock", locks.dca);
      dca.disabled = S.have.dca <= 0 || locks.dca;
      dca.textContent = S.dcaOn ? t("dcaOn") : t("dcaOff");
      dca.setAttribute("aria-pressed", S.dcaOn ? "true" : "false");
    }
    const bud = $("iabud-btn");
    if (bud) {
      bud.classList.toggle("on", S.aibudOn);
      bud.disabled = (S.have.aibud || 0) <= 0;
      bud.textContent = S.aibudOn ? t("aiOn") : t("aiOff");
      bud.setAttribute("aria-pressed", S.aibudOn ? "true" : "false");
    }
    const tr = $("trend-btn");
    if (tr) {
      const lab = S.trend === "up" ? t("trendUp") : S.trend === "down" ? t("trendDown") : t("trendOff");
      tr.textContent = lab;
      tr.classList.toggle("on", S.trend !== "off");
      tr.classList.toggle("ai-lit", !!(S.aibudLit && S.aibudLit.trend && S.trend !== "off"));
      tr.classList.toggle("ai-lock", locks.trend);
      tr.disabled = S.have.manip <= 0 || locks.trend;
    }
    const buy = $("buy-btc"), sell = $("sell-btc");
    if (buy) {
      buy.disabled = locks.trade;
      buy.classList.toggle("ai-lock", locks.trade);
      buy.classList.toggle("ai-lit", !!(S.aibudOn && S.aibudLit && S.aibudLit.buy));
      buy.classList.remove("on");
      buy.textContent = t("buyBtc");
    }
    if (sell) {
      sell.disabled = locks.trade;
      sell.classList.toggle("ai-lock", locks.trade);
      sell.classList.toggle("ai-lit", !!(S.aibudOn && S.aibudLit && S.aibudLit.sell));
      sell.classList.remove("on");
      sell.textContent = t("sellBtc");
    }
    const playing = S.phase === "play" || S.phase === "paused" || S.phase === "perk" || S.phase === "chance";
    const pauseBtn = $("pause-btn");
    if (pauseBtn) {
      const paused = S.phase === "paused" || S.phase === "perk" || !!S.arcHold;
      pauseBtn.textContent = paused ? "▶" : "||";
      pauseBtn.setAttribute("aria-label", paused ? t("ariaPlay") : t("ariaPause"));
      pauseBtn.classList.toggle("arc-resume", !!(S.arcHold && S.phase === "paused"));
    }
    if (S.have.ff <= 0) S.speedMul = 1;
    const battleFreeze = !!(S.bcDefense && S.bcDefense.frozen);
    $("trades").classList.toggle("hide", !playing || battleFreeze);
    $("pause-btn").classList.toggle("hide", !playing || !!S.mp || S.phase === "chance");
    let powers = "";
    const now = S.lifeT;
    const live = liveWaves(now);
    const leftOf = (pred) => {
      let left = 0;
      for (const w of live) if (pred(w)) left = Math.max(left, w.t0 + waveDur() - now);
      return left;
    };
    const hLeft = leftOf((w) => w.kind === "HALVE");
    const bLeft = leftOf((w) => w.type === "BULL" && w.kind !== "HALVE");
    const rLeft = leftOf((w) => w.type === "BEAR");
    const bits = [];
    if (hLeft > 0) bits.push(t("halvingNow") + "  " + Math.ceil(hLeft) + "s");
    if (bLeft > 0) bits.push(t("bullRun") + "  " + Math.ceil(bLeft) + "s");
    if (rLeft > 0) bits.push(t("bearCrash") + "  " + Math.ceil(rLeft) + "s");
    powers = bits.join("  ·  ");
    if (S.laserOn) powers = powers ? powers + "  ·  " + t("laserNow") + " " + Math.ceil(S.laserT) + "s" : t("laserNow") + "  " + Math.ceil(S.laserT) + "s";
    const jobEl = $("job-title");
    const powEl = $("status-powers");
    if (powEl) { powEl.textContent = powers; powEl.classList.toggle("hide", !powers); }
    if (jobEl) {
      jobEl.textContent = S.jobName || "";
      jobEl.classList.toggle("hide", !S.jobName || S.phase !== "play");
    }
    $("status").classList.toggle("hide", !(powers && S.phase === "play"));
    const cap = $("caption");
    if (cap) {
      cap.textContent = S.ticker || "";
      cap.classList.toggle("hide", !S.ticker || S.phase !== "play");
    }
    paintJukeUi();
  }

  function fmtJuke(sec) {
    sec = Math.max(0, Math.round(Number(sec) || 0));
    const m = Math.floor(sec / 60);
    const s = sec % 60;
    return m + ":" + (s < 10 ? "0" : "") + s;
  }
  function fmtJukeLeft(sec) {
    sec = Math.max(0, Math.ceil((Number(sec) || 0) - 0.001));
    const m = Math.floor(sec / 60);
    const s = sec % 60;
    return m + ":" + (s < 10 ? "0" : "") + s;
  }
  function paintJukeHud() {
    const box = $("juke-hud");
    if (!box) return;
    const ready = (S.have.juke || 0) > 0;
    box.classList.toggle("locked", !ready);
    const title = $("juke-hud-title");
    const id = (S.jukeList || [])[S.jukeTrack];
    const song = id && A.SONGS && A.SONGS[id];
    const playing = !!(A.jukePlaying && A.jukePlaying());
    const paused = !!(A.jukePaused && A.jukePaused());
    if (title) {
      const text = (song && (playing || paused || S.jukeOn)) ? (song.title || t("jukebox")) : t("jukebox");
      let inner = title.firstElementChild;
      if (!inner || inner.tagName !== "SPAN") {
        inner = document.createElement("span");
        inner.textContent = text;
        title.textContent = "";
        title.appendChild(inner);
      }
      if (inner.textContent !== text) inner.textContent = text;
      const boxW = title.clientWidth;
      const overflow = boxW > 0 ? inner.scrollWidth - boxW : 0;
      const shift = overflow > 4 ? (-Math.ceil(overflow) + "px") : "";
      const boxKey = String(boxW);
      if (title.dataset.jukeText !== text || title.dataset.box !== boxKey) {
        title.dataset.jukeText = text;
        title.dataset.box = boxKey;
        title.dataset.shift = shift;
        if (shift) {
          title.style.setProperty("--juke-shift", shift);
          title.style.setProperty("--juke-dur", Math.max(10, overflow / 8).toFixed(1) + "s");
          title.classList.add("marquee");
        } else {
          title.classList.remove("marquee");
          title.style.removeProperty("--juke-shift");
        }
      }
    }
    const play = $("juke-hud-play");
    if (play) {
      play.textContent = playing ? "❚❚" : "▶";
      play.classList.toggle("on", playing);
      play.disabled = !ready;
    }
    const clock = $("juke-hud-time");
    if (clock) {
      const prog = A.jukeProgress ? A.jukeProgress() : null;
      const same = !A.jukeId || A.jukeId() === id;
      const live = (playing || paused) && same && prog && prog.dur > 0;
      const text = live ? fmtJukeLeft(prog.dur - prog.t) : "";
      if (clock.textContent !== text) clock.textContent = text;
      clock.classList.toggle("hide", !text);
    }
    const vol = $("juke-hud-vol");
    if (vol) {
      vol.disabled = !ready;
      if (!vol.matches(":active") && document.activeElement !== vol) {
        const pct = Math.round(((A.jukeVolume && A.jukeVolume()) || 0.8) * 100);
        if (String(vol.value) !== String(pct)) vol.value = String(pct);
      }
    }
  }

  function paintJukeUi() {
    if(S.phase==="defense") return;
    paintJukeHud();
    const bar = $("juke-bar");
    const prog = A.jukeProgress ? A.jukeProgress() : null;
    if (bar && prog) bar.style.width = Math.round((prog.pct || 0) * 100) + "%";
    const el = $("juke-el");
    const left = $("juke-left");
    if (el || left) {
      const cur = (S.jukeList || [])[S.jukeTrack];
      const playingNow = !!(A.jukePlaying && A.jukePlaying());
      const pausedNow = !!(A.jukePaused && A.jukePaused());
      const same = !A.jukeId || A.jukeId() === cur;
      const live = (playingNow || pausedNow) && same && prog && prog.dur > 0;
      const total = live ? prog.dur : ((A.tuneSeconds && A.tuneSeconds(cur)) || 0);
      const elapsed = live ? prog.t : 0;
      const remain = live ? Math.max(0, prog.dur - prog.t) : total;
      if (el) {
        const a = fmtJuke(elapsed);
        if (el.textContent !== a) el.textContent = a;
      }
      if (left) {
        const b = live ? fmtJukeLeft(remain) : (total ? fmtJuke(total) : "");
        if (left.textContent !== b) left.textContent = b;
      }
    }
    const stage = $("lyric-stage");
    const titleEl = $("lyric-title");
    const prevEl = $("lyric-prev");
    const nowEl = $("lyric-now");
    const nextEl = $("lyric-next");
    const np = $("now-playing");
    const live = S.jukeOn && A.jukePlaying && (A.jukePlaying() || (A.jukePaused && A.jukePaused()));
    const id = (S.jukeList || [])[S.jukeTrack];
    const song = id && A.SONGS && A.SONGS[id];
    const cues = (song && song.lyrics) || [];
    const onField = S.phase === "play" || S.phase === "paused";
    const want = false;
    if (np) {
      np.textContent = "";
      np.classList.add("hide");
    }
    if (!stage) return;
    stage.classList.toggle("hide", !want);
    if (!want) return;
    const pct = A.jukeProgress ? (A.jukeProgress().pct || 0) : 0;
    let i = 0;
    while (i + 1 < cues.length && cues[i + 1].p <= pct + 0.001) i++;
    if (titleEl) titleEl.textContent = song.title || "";
    if (prevEl) prevEl.textContent = cues[i - 1] ? cues[i - 1].text : "";
    if (nextEl) nextEl.textContent = cues[i + 1] ? cues[i + 1].text : "";
    if (!nowEl) return;
    if (!cues.length) { nowEl.textContent = ""; return; }
    const words = String(cues[i].text || "").split(/\s+/).filter(Boolean);
    const end = cues[i + 1] ? cues[i + 1].p : 1;
    const span = Math.max(0.001, end - cues[i].p);
    const local = Math.max(0, Math.min(1, (pct - cues[i].p) / span));
    const wi = words.length ? Math.min(words.length - 1, Math.floor(local * words.length)) : 0;
    nowEl.innerHTML = words.map((w, k) => "<span class=\"w" + (k < wi ? " on" : k === wi ? " hot" : "") + "\">" + w + "</span>").join(" ");
  }

  function collectRunStats() {
    return {
      time: S.lifeT, startCash: S.startCash, startPrice: S.startPrice, peakNet: S.peakNet,
      candles: S.candles, buys: S.buys, sells: S.sells, sellsBear: S.sellsBear || 0,
      coldLost: S.coldLost || 0, boughtBtc: !!S.boughtBtc, swans: S.swans, lasers: S.lasers,
      halvings: S.halvings || 0, halveMiss: S.halveMiss || 0,
      endCash: S.cash, endBtc: S.btc, endPrice: S.price, net: net(),
      haveSum: Object.keys(S.have).reduce((n, k) => n + (S.have[k] || 0), 0),
      iabud: S.have.iabud || 0,
      iaProfit: S.iaProfit || 0, job: S.have.job || 0, hitCap: !!S.hitCap,
      perkMaxed: Object.keys(PERK_MAX).some((k) => PERK_MAX[k] >= 5 && k !== "job" && (S.have[k] || 0) >= PERK_MAX[k])
    };
  }
  function snapshotRun() {
    S.stats = collectRunStats();
    S.runTape = (S.tape || []).slice();
    S.runMarks = (S.tapeMarks || []).slice();
    S.runTrades = (S.tapeTrades || []).slice();
    S.runCash = (S.tapeCash || []).slice();
    S.runBtcBag = (S.tapeBtcBag || []).slice();
    S.runNet = (S.tapeNet || []).slice();
  }

  function recapL(en, es) {
    return (window.BZ && BZ.lang && BZ.lang() === "es") ? es : en;
  }

  function recapRow(k, v) {
    return "<li><span class=\"k\">" + k + "</span><span>" + v + "</span></li>";
  }

  function runRecapHtml() {
    const st = S.stats || collectRunStats();
    const tab = S.runTab === "chart" ? "chart" : "stats";
    const tabs = "<div class=\"recap-tabs\">"
      + "<button type=\"button\" class=\"cta play-alt" + (tab === "stats" ? " on" : "") + "\" id=\"recap-stats\">" + t("runStats") + "</button>"
      + "<button type=\"button\" class=\"cta play-alt" + (tab === "chart" ? " on" : "") + "\" id=\"recap-chart\">" + t("runChart") + "</button>"
      + "</div>";
    let body;
    if (tab === "chart") {
      body = "<canvas id=\"run-tape\" width=\"420\" height=\"228\"></canvas>"
        + (window.chartOptsHtml ? window.chartOptsHtml(S.chartFlags || { trades: false, btc: false, usd: false, net: false }) : "");
    } else {
      const startNet = (st.startCash || 0) / Math.max(0.01, st.startPrice || 1);
      const pxMul = (st.endPrice || 0) / Math.max(0.01, st.startPrice || 1);
      const netMul = (st.net || 0) / Math.max(1e-9, startNet);
      const awards = runAwards(st);
      body = "<ul class=\"recap-list\">"
        + recapRow(recapL("Time", "Tiempo"), fmtTime(st.time))
        + recapRow(recapL("Candles", "Velas"), String(st.candles || 0))
        + recapRow(recapL("Start cash", "Cash inicial"), money(st.startCash))
        + recapRow(recapL("End cash", "Cash final"), money(st.endCash))
        + recapRow(recapL("BTC stacked", "BTC apilado"), fmtBtc(st.endBtc))
        + recapRow(recapL("Start BTC px", "Precio inicial"), money(st.startPrice))
        + recapRow(recapL("End BTC px", "Precio final"), money(st.endPrice))
        + recapRow(recapL("Price multiple", "Múltiplo de precio"), pxMul.toFixed(2) + "x")
        + recapRow(recapL("Peak net", "Pico patrimonio"), fmtBtc(st.peakNet))
        + recapRow(recapL("Net worth", "Patrimonio"), fmtBtc(st.net))
        + recapRow(recapL("Stack multiple", "Múltiplo de stack"), netMul.toFixed(2) + "x")
        + recapRow(recapL("Buys / sells", "Compras / ventas"), (st.buys || 0) + " / " + (st.sells || 0))
        + recapRow(recapL("Bear sells", "Ventas en bear"), String(st.sellsBear || 0))
        + recapRow(recapL("Halvings", "Halvings"), (st.halvings || 0) + " · miss " + (st.halveMiss || 0))
        + recapRow(recapL("Swans vaporized", "Swans vaporizados"), String(st.swans || 0))
        + recapRow(recapL("Laser eyes", "Ojos láser"), String(st.lasers || 0))
        + recapRow(recapL("Cold lost", "Cold perdidos"), String(st.coldLost || 0))
        + recapRow(recapL("Perks taken", "Perks tomadas"), String(st.haveSum || 0))
        + "</ul>"
        + (awards.length
          ? "<div class=\"awards\"><p class=\"k\">" + recapL("Awards", "Premios") + "</p>"
            + awards.map((a) => "<p><span class=\"ia-act\">" + awardName(a) + "</span> — " + awardWhy(a) + "</p>").join("")
            + "</div>"
          : "");
    }
    return "<h1>" + t("runRecap") + "</h1>" + tabs + body
      + "<button type=\"button\" class=\"cta\" id=\"recap-back\">" + t("back") + "</button>";
  }

  function recapBag() {
    return {
      tape: S.runTape || S.tape || [],
      marks: S.runMarks || [],
      trades: S.runTrades || [],
      tapeCash: S.runCash || S.tapeCash || [],
      tapeBtc: S.runBtcBag || S.tapeBtcBag || [],
      tapeNet: S.runNet || S.tapeNet || []
    };
  }

  function bindRunRecap() {
    const stBtn = $("recap-stats");
    const chBtn = $("recap-chart");
    const back = $("recap-back");
    if (stBtn) stBtn.onclick = (e) => { e.stopPropagation(); S.runTab = "stats"; renderOverlay(); };
    if (chBtn) chBtn.onclick = (e) => { e.stopPropagation(); S.runTab = "chart"; renderOverlay(); };
    if (back) back.onclick = (e) => { e.stopPropagation(); S.runTab = null; renderOverlay(); };
    if (S.runTab === "chart") paintRunTape();
  }

  function paintRunTape() {
    const canvas = $("run-tape");
    if (!canvas) return;
    if (!S.chartFlags) S.chartFlags = { trades: false, btc: false, usd: false, net: false };
    const bag = recapBag();
    if (window.paintRunChart) {
      window.paintRunChart(canvas, bag, S.chartFlags);
      if (window.bindChartControls) window.bindChartControls(overlay, bag, S.chartFlags, canvas);
      return;
    }
    const data = bag.tape || [];
    const ctx = canvas.getContext("2d");
    const W = canvas.width, H = canvas.height;
    ctx.fillStyle = "#0a0a0c";
    ctx.fillRect(0, 0, W, H);
    if (data.length < 2) {
      ctx.fillStyle = "#8a8680";
      ctx.font = "12px \"IBM Plex Mono\", monospace";
      ctx.textAlign = "center";
      ctx.fillText("—", W / 2, H / 2);
      return;
    }
    const target = 92;
    const bucket = Math.max(4, Math.ceil(data.length / target));
    const bars = [];
    for (let i = 0; i < data.length; i += bucket) {
      const sl = data.slice(i, i + bucket);
      const o = bars.length ? bars[bars.length - 1].c : sl[0];
      bars.push({ o: o, h: Math.max.apply(null, sl), l: Math.min.apply(null, sl), c: sl[sl.length - 1], i: i });
    }
    let lo = bars[0].l, hi = bars[0].h;
    for (const b of bars) { if (b.l < lo) lo = b.l; if (b.h > hi) hi = b.h; }
    const pad = Math.max(0.01, (hi - lo) * 0.08);
    lo -= pad; hi += pad;
    const left = 8, right = 8, top = 16, bot = 14;
    const innerW = W - left - right, innerH = H - top - bot;
    const stepX = innerW / Math.max(1, bars.length);
    const cw = Math.max(1.2, Math.min(5.2, stepX * 0.72));
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
    const marks = S.runMarks || [];
    ctx.save();
    ctx.font = "700 8px \"IBM Plex Mono\", monospace";
    ctx.textAlign = "center";
    ctx.lineWidth = 3;
    ctx.strokeStyle = "rgba(10,10,12,0.82)";
    let lastX = -99;
    for (const mk of marks) {
      const vi = Math.floor((mk.i || 0) / bucket);
      if (vi < 0 || vi >= bars.length) continue;
      const x = left + vi * stepX + cw / 2;
      if (Math.abs(x - lastX) < 28) continue;
      lastX = x;
      const peak = mk.kind === "peak";
      const y = py(mk.price) + (peak ? -4 : 4);
      ctx.textBaseline = peak ? "bottom" : "top";
      const lab = fmtUsd(mk.price);
      paintHaloText(ctx, lab, x, y, peak ? (PAL.labelUp || GREEN) : (PAL.labelDn || RED));
    }
    const trades = S.runTrades || [];
    ctx.font = "700 9px \"IBM Plex Mono\", monospace";
    ctx.textBaseline = "middle";
    for (const tr of trades) {
      const vi = Math.floor((tr.i || 0) / bucket);
      if (vi < 0 || vi >= bars.length) continue;
      const x = left + vi * stepX + cw / 2;
      const y = py(tr.price);
      const buy = tr.kind === "buy";
      ctx.fillStyle = buy ? GREEN : RED;
      ctx.beginPath();
      if (buy) {
        ctx.moveTo(x, y - 8); ctx.lineTo(x + 5.5, y + 3); ctx.lineTo(x - 5.5, y + 3);
      } else {
        ctx.moveTo(x, y + 8); ctx.lineTo(x + 5.5, y - 3); ctx.lineTo(x - 5.5, y - 3);
      }
      ctx.closePath();
      ctx.stroke();
      ctx.fill();
      ctx.textBaseline = buy ? "bottom" : "top";
      paintHaloText(ctx, buy ? "B" : "S", x, buy ? y - 9 : y + 9, buy ? (PAL.labelUp || GREEN) : (PAL.labelDn || RED));
    }
    ctx.restore();
    ctx.font = "700 9px \"IBM Plex Mono\", monospace";
    ctx.textAlign = "left";
    ctx.textBaseline = "top";
    paintHaloText(ctx, "▲ B buy", 10, H - 12, PAL.labelUp || GREEN);
    paintHaloText(ctx, "▼ S sell", 96, H - 12, PAL.labelDn || RED);
  }
  const AWARD_CATS = [
    { id: "trading", en: "Trading", es: "Operaciones" },
    { id: "survival", en: "Survival", es: "Supervivencia" },
    { id: "perks", en: "Perks", es: "Perks" },
    { id: "family", en: "Family", es: "Familia" },
    { id: "country", en: "Bitcoin Country", es: "Bitcoin Country" },
    { id: "challenge", en: "Challenges", es: "Desafíos" },
    { id: "meta", en: "Career", es: "Trayectoria" }
  ];
  // secret: locked awards show as "???" so the list never spoils a story beat.
  const AWARD_CATALOG = [
    { id: "maxi", cat: "trading", name: "Maxi Soul", nameEs: "Alma maxi", why: "Never sold BTC — not by hand, not by A.I. bud.", whyEs: "Nunca vendió BTC, ni a mano ni por A.I. bud." },
    { id: "nocoiner", cat: "trading", name: "Nocoiner", nameEs: "Nocoiner", why: "Never bought BTC in that run.", whyEs: "Nunca compró BTC en esa partida." },
    { id: "paper", cat: "trading", name: "Paper Hands", nameEs: "Manos de papel", why: "Sold BTC in a bear market.", whyEs: "Vendió BTC en un bear market." },
    { id: "doubler", cat: "trading", name: "Double Stack", nameEs: "Stack doble", why: "Finished a run with at least 2× the starting net worth in BTC.", whyEs: "Terminó una partida con al menos el doble del patrimonio inicial en BTC." },
    { id: "tenx", cat: "trading", name: "Ten Bagger", nameEs: "Diez veces", why: "Finished a run with at least 10× the starting net worth in BTC.", whyEs: "Terminó una partida con al menos 10 veces el patrimonio inicial en BTC." },
    { id: "dayTrader", cat: "trading", name: "Day Trader", nameEs: "Trader del día", why: "Made 50 or more trades in one run.", whyEs: "Hizo 50 operaciones o más en una partida." },
    { id: "cap21", cat: "trading", name: "Twenty One Million", nameEs: "Veintiún millones", why: "Stacked 21M BTC.", whyEs: "Juntó 21M BTC." },
    { id: "halver", cat: "survival", name: "Halving Catcher", nameEs: "Atrapa halvings", why: "Every halving that spawned was eaten.", whyEs: "Comió todos los halvings que salieron." },
    { id: "greedy", cat: "survival", name: "Greedy Miner", nameEs: "Minero greedy", why: "Ate 0 halvings.", whyEs: "Comió 0 halvings." },
    { id: "opsec", cat: "survival", name: "Opsec Warrior", nameEs: "Guerrero opsec", why: "Lost 0 cold storage.", whyEs: "No perdió cold storage." },
    { id: "longHaul", cat: "survival", name: "Long Haul", nameEs: "Larga distancia", why: "Survived 1,000 candles in one run.", whyEs: "Sobrevivió 1.000 velas en una partida." },
    { id: "marathon", cat: "survival", name: "Marathon", nameEs: "Maratón", why: "Survived 2,100 candles in one run.", whyEs: "Sobrevivió 2.100 velas en una partida." },
    { id: "swanHunter", cat: "survival", name: "Swan Hunter", nameEs: "Cazador de cisnes", why: "Vaporized 3 black swans in one run.", whyEs: "Vaporizó 3 cisnes negros en una partida." },
    { id: "laserEyes", cat: "survival", name: "Laser Eyes", nameEs: "Ojos láser", why: "Grabbed laser eyes 5 times in one run.", whyEs: "Agarró ojos láser 5 veces en una partida." },
    { id: "maxedPerk", cat: "perks", name: "Maxed Out", nameEs: "Al máximo", why: "Took a perk to its top tier.", whyEs: "Llevó una perk a su nivel máximo." },
    { id: "perkHoarder", cat: "perks", name: "Perk Hoarder", nameEs: "Coleccionista de perks", why: "Took 15 perk tiers in one run.", whyEs: "Tomó 15 niveles de perks en una partida." },
    { id: "goodBud", cat: "perks", name: "Good Bud", nameEs: "Buen compañero", why: "A.I. bud finished a run in profit.", whyEs: "El A.I. bud terminó una partida con ganancia." },
    { id: "career", cat: "perks", name: "Career Ladder", nameEs: "Escalera profesional", why: "Reached the top of the job ladder.", whyEs: "Llegó a lo más alto de su carrera." },
    { id: "engaged", cat: "family", secret: true, name: "Yes, Fartface", nameEs: "Sí, Cara de Pedo", why: "Lena said yes.", whyEs: "Lena dijo que sí." },
    { id: "married", cat: "family", secret: true, name: "Just Married", nameEs: "Recién casados", why: "Married Lena.", whyEs: "Se casó con Lena." },
    { id: "runaway", cat: "family", secret: true, name: "Something Else", nameEs: "Otra cosa", why: "Walked away from the wedding to build something else.", whyEs: "Dejó la boda para construir otra cosa." },
    { id: "babyBoard", cat: "family", secret: true, name: "A Brand New Day", nameEs: "Un nuevo amanecer", why: "Welcomed the baby.", whyEs: "Le dio la bienvenida al bebé." },
    { id: "familyOffice", cat: "family", secret: true, name: "Family Office", nameEs: "Oficina familiar", why: "Set money and a cold-storage device aside for the baby.", whyEs: "Apartó dinero y un dispositivo de almacenamiento en frío para el bebé." },
    { id: "classicFartface", cat: "family", secret: true, name: "Classic Fartface", nameEs: "Típico de Cara de Pedo", why: "Sent Lena a PDF of financial advice.", whyEs: "Le envió a Lena un PDF con consejos financieros." },
    { id: "landowner", cat: "country", secret: true, name: "Landowner", nameEs: "Terrateniente", why: "Bought the island.", whyEs: "Compró la isla." },
    { id: "notForSale", cat: "country", secret: true, name: "Not for Sale", nameEs: "No está en venta", why: "Turned down the consortium's offer.", whyEs: "Rechazó la oferta del consorcio." },
    { id: "sellout", cat: "country", secret: true, name: "Exit Liquidity", nameEs: "Liquidez de salida", why: "Sold the island to the consortium.", whyEs: "Le vendió la isla al consorcio." },
    { id: "miner", cat: "country", secret: true, name: "Island Miner", nameEs: "Minero isleño", why: "Put a Bitcoin mine online.", whyEs: "Puso en línea una mina de bitcoin." },
    { id: "citadel", cat: "country", secret: true, name: "Citadel", nameEs: "Ciudadela", why: "Built the citadel.", whyEs: "Construyó la ciudadela." },
    { id: "nodes100", cat: "country", secret: true, name: "Hundred Nodes", nameEs: "Cien nodos", why: "Reached 100 Liberty Nodes.", whyEs: "Llegó a 100 Nodos de Libertad." },
    { id: "declared", cat: "country", secret: true, name: "Declaration", nameEs: "Declaración", why: "Declared independence.", whyEs: "Declaró la independencia." },
    { id: "beachHolds", cat: "country", secret: true, name: "The Beach Holds", nameEs: "La playa resiste", why: "Repelled a landing.", whyEs: "Rechazó un desembarco." },
    { id: "fourth", cat: "country", secret: true, name: "The Fourth Color", nameEs: "El cuarto color", why: "Bitcoin Country survived the attack.", whyEs: "Bitcoin Country sobrevivió el ataque." },
    { id: "noAid", cat: "country", secret: true, name: "On Our Own", nameEs: "Por cuenta propia", why: "Won independence without paying for military aid.", whyEs: "Ganó la independencia sin pagar ayuda militar." },
    { id: "freeNation", cat: "country", secret: true, name: "Free Nation", nameEs: "Nación libre", why: "Kept trading after independence.", whyEs: "Siguió operando después de la independencia." },
    { id: "chessWin", cat: "challenge", secret: true, name: "Over the Board", nameEs: "Sobre el tablero", why: "Found the winning move in a chess problem.", whyEs: "Encontró la jugada ganadora de un problema de ajedrez." },
    { id: "chess3", cat: "challenge", secret: true, name: "Chess Scholar", nameEs: "Erudito del ajedrez", why: "Solved 3 different historical chess problems.", whyEs: "Resolvió 3 problemas de ajedrez históricos distintos." },
    { id: "chess7", cat: "challenge", secret: true, name: "Hall of Fame", nameEs: "Salón de la fama", why: "Solved all 7 historical chess problems.", whyEs: "Resolvió los 7 problemas de ajedrez históricos." },
    { id: "scoop", cat: "challenge", secret: true, name: "Scoop", nameEs: "Toda la mesa", why: "Won the whole poker table.", whyEs: "Se llevó toda la mesa de póker." },
    { id: "unicorn", cat: "challenge", secret: true, name: "Unicorn", nameEs: "Unicornio", why: "Backed a startup that actually shipped.", whyEs: "Invirtió en una startup que de verdad lanzó." },
    { id: "highRoller", cat: "challenge", secret: true, name: "High Roller", nameEs: "Apostador fuerte", why: "Hit the number on the big casino bet.", whyEs: "Acertó el número con la apuesta fuerte del casino." },
    { id: "soldPump", cat: "challenge", secret: true, name: "Sold the Pump", nameEs: "Vendió en la subida", why: "Got out of $FRY with a profit.", whyEs: "Salió de $FRY con ganancia." },
    { id: "regular", cat: "meta", name: "Regular", nameEs: "Habitual", why: "Finished 10 ranked runs of 420+ candles.", whyEs: "Terminó 10 partidas ranked de 420 velas o más." },
    { id: "veteran", cat: "meta", name: "Veteran", nameEs: "Veterano", why: "Finished 50 ranked runs of 420+ candles.", whyEs: "Terminó 50 partidas ranked de 420 velas o más." },
    { id: "collector", cat: "meta", name: "Collector", nameEs: "Coleccionista", why: "Earned 10 awards.", whyEs: "Ganó 10 premios." },
    { id: "curator", cat: "meta", name: "Curator", nameEs: "Curador", why: "Earned 25 awards.", whyEs: "Ganó 25 premios." }
  ];
  function awardById(id) { return AWARD_CATALOG.find((a) => a.id === id) || null; }
  // Awards belong to real accounts only: auth.js sets choppySignedIn + choppyUid once a
  // Supabase session with a profile is loaded, and clears both on sign-out. Guests get nothing.
  function isRegistered() {
    return !!(window.choppySignedIn === true && window.choppyUid && window.choppyUserId && window.choppyUid === window.choppyUserId);
  }
  function awardsLive() {
    return isRegistered() && !!S.ranked && !S.testCheat && !S.mp;
  }
  const AWARD_TOAST_MS = 3000;
  const awardToastQ = [];
  let awardToastOn = 0;
  function awardToastBox() {
    let box = document.getElementById("award-toasts");
    if (!box) {
      box = document.createElement("div");
      box.id = "award-toasts";
      box.className = "award-toasts";
      box.setAttribute("aria-live", "polite");
      box.setAttribute("role", "status");
      document.body.appendChild(box);
    }
    return box;
  }
  function pumpAwardToasts() {
    while (awardToastOn < 3 && awardToastQ.length) {
      const a = awardToastQ.shift();
      const es = window.BZ && BZ.lang && BZ.lang() === "es";
      const el = document.createElement("div");
      el.className = "award-toast";
      const k = document.createElement("span");
      k.className = "award-toast-k";
      k.textContent = es ? "Premio desbloqueado" : "Award unlocked";
      const n = document.createElement("b");
      n.className = "award-toast-n";
      n.textContent = "🏆 " + awardName(a);
      el.appendChild(k);
      el.appendChild(n);
      awardToastBox().appendChild(el);
      awardToastOn += 1;
      setTimeout(() => {
        try { el.remove(); } catch (e) {}
        awardToastOn = Math.max(0, awardToastOn - 1);
        pumpAwardToasts();
      }, AWARD_TOAST_MS);
    }
  }
  function showAwardToast(award) {
    const a = typeof award === "string" ? awardById(award) : award;
    if (!a || !isRegistered()) return;
    if (awardToastQ.length >= 12) return;
    awardToastQ.push(a);
    try { pumpAwardToasts(); } catch (e) {}
  }
  function metaAwardIds(map) {
    const out = [];
    const n = AWARD_CATALOG.filter((a) => map[a.id]).length;
    if (n >= 10) out.push("collector");
    if (n >= 25) out.push("curator");
    return out;
  }
  // Adds ids to the signed-in user's set; toasts only the ones that are new.
  function addAwards(ids) {
    const map = loadAwards();
    const fresh = [];
    (ids || []).forEach((id) => {
      if (!id || map[id] || !awardById(id)) return;
      map[id] = true;
      fresh.push(id);
    });
    if (!fresh.length) return map;
    for (let i = 0; i < 2; i++) metaAwardIds(map).forEach((id) => { if (!map[id]) { map[id] = true; fresh.push(id); } });
    saveAwards(map);
    fresh.forEach((id) => showAwardToast(id));
    return map;
  }
  function grantAward(id) {
    if (!id || !awardsLive()) return false;
    const before = loadAwards()[id];
    addAwards([id]);
    return !before;
  }
  function awardName(a) {
    return (window.BZ && BZ.lang && BZ.lang() === "es") ? (a.nameEs || a.name) : a.name;
  }
  function awardWhy(a) {
    return (window.BZ && BZ.lang && BZ.lang() === "es") ? (a.whyEs || a.why) : a.why;
  }
  function awardStore() {
    try { return JSON.parse(localStorage.getItem("choppy-awards") || "{}"); } catch (e) { return {}; }
  }
  function awardOwner() {
    return (window.choppyUserId || "guest");
  }
  function loadAwards() {
    const bag = awardStore();
    return bag[awardOwner()] || {};
  }
  function saveAwards(map) {
    const bag = awardStore();
    bag[awardOwner()] = map;
    localStorage.setItem("choppy-awards", JSON.stringify(bag));
    if (typeof window.persistAwards === "function") window.persistAwards(Object.keys(map).filter((k) => map[k]));
  }
  function mergeAwards(ids) {
    if (!S.ranked || !isRegistered() || S.testCheat) return loadAwards();
    return addAwards(ids);
  }
  // Server copy (profiles.awards) loaded by auth.js: merged silently, no toasts.
  function syncAwards(ids) {
    if (!window.choppyUserId || !Array.isArray(ids)) return loadAwards();
    const map = loadAwards();
    let changed = false;
    ids.forEach((id) => { if (id && !map[id]) { map[id] = true; changed = true; } });
    if (changed) {
      const bag = awardStore();
      bag[awardOwner()] = map;
      try { localStorage.setItem("choppy-awards", JSON.stringify(bag)); } catch (e) {}
    }
    return map;
  }
  function awardCounter(key) {
    try {
      const bag = JSON.parse(localStorage.getItem(key) || "{}");
      return bag && typeof bag === "object" ? bag : {};
    } catch (e) { return {}; }
  }
  function noteChessSolved(idx) {
    if (!awardsLive() || !(idx >= 0)) return;
    const bag = awardCounter("choppy-chess-solved");
    const mine = Array.isArray(bag[awardOwner()]) ? bag[awardOwner()] : [];
    if (mine.indexOf(idx) < 0) mine.push(idx);
    bag[awardOwner()] = mine;
    try { localStorage.setItem("choppy-chess-solved", JSON.stringify(bag)); } catch (e) {}
    const ids = ["chessWin"];
    if (mine.length >= 3) ids.push("chess3");
    if (mine.length >= CHESS_POOL.length) ids.push("chess7");
    addAwards(ids);
  }
  // Story choices that earn an award (called once, right after the choice resolves).
  function cardAwards(card, opt) {
    if (!card || !awardsLive()) return;
    const id = card.id;
    if (id === "proposal" && S.engaged) grantAward("engaged");
    else if (id === "wedding") grantAward(opt === "c" ? "runaway" : "married");
    else if (id === "baby") addAwards(opt === "a" ? ["babyBoard", "familyOffice"] : opt === "c" ? ["babyBoard", "classicFartface"] : ["babyBoard"]);
    else if (id === "anOffer") grantAward(opt === "a" ? "sellout" : "notForSale");
  }
  function perkMaxed(skipJob) {
    return Object.keys(PERK_MAX).some((k) => PERK_MAX[k] >= 5 && !(skipJob && k === "job") && (S.have[k] || 0) >= PERK_MAX[k]);
  }
  // Live checks on run state, throttled from step(): awards land the moment they are earned.
  let awardTickAcc = 0;
  function awardTick(dt) {
    awardTickAcc += dt || 0;
    if (awardTickAcc < 1.5) return;
    awardTickAcc = 0;
    if (!awardsLive() || S.dead) return;
    const ids = [];
    const c = S.candles || 0;
    if (c >= 1000) ids.push("longHaul");
    if (c >= 2100) ids.push("marathon");
    if ((S.swans || 0) >= 3) ids.push("swanHunter");
    if ((S.lasers || 0) >= 5) ids.push("laserEyes");
    if (S.have) {
      if (perkMaxed(true)) ids.push("maxedPerk");
      if ((S.have.job || 0) >= PERK_MAX.job) ids.push("career");
      if (Object.keys(S.have).reduce((n, k) => n + (S.have[k] || 0), 0) >= 15) ids.push("perkHoarder");
    }
    if ((S.btc || 0) >= BTC_CAP) ids.push("cap21");
    if (S.bcIsland) ids.push("landowner");
    if (S.bcMine) ids.push("miner");
    if (S.bcCitadel) ids.push("citadel");
    if ((S.bcNodes || 0) >= 100) ids.push("nodes100");
    if (S.bcIndependent) ids.push("declared");
    if ((S.bcBattlesWon || 0) >= 1) ids.push("beachHolds");
    const own = loadAwards();
    const fresh = ids.filter((id) => !own[id]);
    if (fresh.length) addAwards(fresh);
  }
  function runAwardIds(st) {
    if (!st || (st.candles || 0) < 420) return [];
    const out = [];
    if ((st.sells || 0) === 0) out.push("maxi");
    if ((st.halveMiss || 0) === 0 && (st.halvings || 0) > 0) out.push("halver");
    if (!st.boughtBtc) out.push("nocoiner");
    if ((st.halvings || 0) === 0) out.push("greedy");
    if ((st.coldLost || 0) === 0) out.push("opsec");
    if ((st.sellsBear || 0) >= 1) out.push("paper");
    const startNet = (st.startCash || 0) / Math.max(0.01, st.startPrice || 1);
    const mul = startNet > 0 ? (st.net || 0) / startNet : 0;
    if (mul >= 2) out.push("doubler");
    if (mul >= 10) out.push("tenx");
    if ((st.buys || 0) + (st.sells || 0) >= 50) out.push("dayTrader");
    if (st.hitCap || (st.endBtc || 0) >= BTC_CAP) out.push("cap21");
    if ((st.candles || 0) >= 1000) out.push("longHaul");
    if ((st.candles || 0) >= 2100) out.push("marathon");
    if ((st.swans || 0) >= 3) out.push("swanHunter");
    if ((st.lasers || 0) >= 5) out.push("laserEyes");
    if (st.perkMaxed) out.push("maxedPerk");
    if ((st.haveSum || 0) >= 15) out.push("perkHoarder");
    if ((st.iabud || 0) > 0 && (st.iaProfit || 0) > 0) out.push("goodBud");
    if ((st.job || 0) >= PERK_MAX.job) out.push("career");
    return out;
  }
  // End of a ranked run: run awards + run counter for the career awards, once per run.
  function endRunAwards() {
    if (!S.stats) return;
    const ids = runAwardIds(S.stats);
    if (awardsLive() && !S.awRunCounted && (S.stats.candles || 0) >= 420) {
      S.awRunCounted = true;
      const bag = awardCounter("choppy-aw-runs");
      const n = (Number(bag[awardOwner()]) || 0) + 1;
      bag[awardOwner()] = n;
      try { localStorage.setItem("choppy-aw-runs", JSON.stringify(bag)); } catch (e) {}
      if (n >= 10) ids.push("regular");
      if (n >= 50) ids.push("veteran");
    }
    mergeAwards(ids);
  }
  function runAwards(st) {
    return runAwardIds(st).map((id) => awardById(id)).filter(Boolean);
  }
  function awardRowHtml(a, on) {
    const es = window.BZ && BZ.lang && BZ.lang() === "es";
    if (!on && a.secret) return "<p class=\"aw-off\"><b>○ ???</b> — " + (es ? "Premio oculto. Sigue jugando para descubrirlo." : "Hidden award. Keep playing to find it.") + "</p>";
    return "<p class=\"" + (on ? "aw-on" : "aw-off") + "\"><b>" + (on ? "✓ " : "○ ") + awardName(a) + "</b> — " + awardWhy(a) + "</p>";
  }
  function awardListHtml(owned, mode) {
    owned = owned || loadAwards();
    const es = window.BZ && BZ.lang && BZ.lang() === "es";
    if (mode === "owned") {
      const rows = AWARD_CATALOG.filter((a) => owned[a.id]).map((a) => awardRowHtml(a, true)).join("");
      const n = AWARD_CATALOG.filter((a) => owned[a.id]).length;
      return "<details class=\"aw-box\"><summary>" + (es ? "Premios" : "Awards") + " (" + n + ")</summary>" + (rows || "<p>" + (es ? "Todavía no hay premios." : "No awards yet.") + "</p>") + "</details>";
    }
    const reg = isRegistered();
    const n = reg ? AWARD_CATALOG.filter((a) => owned[a.id]).length : 0;
    const groups = AWARD_CATS.map((c) => {
      const list = AWARD_CATALOG.filter((a) => a.cat === c.id);
      if (!list.length) return "";
      return "<p class=\"k aw-cat\">" + (es ? c.es : c.en) + "</p>" + list.map((a) => awardRowHtml(a, reg && !!owned[a.id])).join("");
    }).join("");
    const note = reg ? "" : "<p class=\"k\">" + (es ? "Inicia sesión para ganar premios." : "Sign in to earn awards.") + "</p>";
    return "<div class=\"awards\"><details class=\"aw-all\"><summary class=\"k\">" + (es ? "Premios" : "Awards") + " (" + n + "/" + AWARD_CATALOG.length + ")</summary>" + note + groups + "</details></div>";
  }
  function shareRun(kind) {
    const btc = fmtBtc(netBtc());
    const names = runAwards(S.stats || collectRunStats()).map((a) => awardName(a)).join(", ");
    let who = (window.choppyUsername || "").trim();
    if (!who) {
      const tagEl = $("user-profile-tag");
      const raw = tagEl && !tagEl.classList.contains("hide") ? (tagEl.textContent || "") : "";
      who = raw.replace(/^@/, "").replace(/\s.*/, "").trim();
    }
    who = who.replace(/^@/, "");
    const tag = who ? "@" + who + " " : "";
    const es = window.BZ && BZ.lang && BZ.lang() === "es";
    const text = kind === "indep"
      ? (es
        ? tag + "ganó la independencia de " + stampNation("Bitcoin Country") + " en Choppy Bitcoin. Bag " + btc + (names ? " Premios: " + names : "")
        : tag + "won independence for " + stampNation("Bitcoin Country") + " on Choppy Bitcoin. Bag " + btc + (names ? " Awards: " + names : ""))
      : kind === "win"
      ? (es
        ? tag + "juntó 21M en Choppy Bitcoin. Bag " + btc + (names ? " Premios: " + names : "")
        : tag + "stacked 21M on Choppy Bitcoin. Bag " + btc + (names ? " Awards: " + names : ""))
      : (es
        ? tag + "quedó rekt en Choppy Bitcoin. Bag " + btc + ". Juega gratis en Bitcoinizate."
        : tag + "got rekt on Choppy Bitcoin. Bag " + btc + ". Play free on Bitcoinizate.");
    const url = "https://bitcoinizate.com/choppy-bitcoin/";
    const imgUrl = "https://bitcoinizate.com/choppy-bitcoin/share-icon.png";
    const goTweet = () => {
      window.open("https://twitter.com/intent/tweet?text=" + encodeURIComponent(text + " " + url), "_blank", "noopener");
    };
    const payload = { title: "Choppy Bitcoin", text: text, url: url };
    const send = (data) => {
      if (!navigator.share) { goTweet(); return; }
      navigator.share(data).catch(goTweet);
    };
    if (navigator.canShare) {
      fetch("share-icon.png").then((r) => r.blob()).then((blob) => {
        const file = new File([blob], "choppy-bitcoin.png", { type: blob.type || "image/png" });
        const withFile = { title: payload.title, text: payload.text, url: payload.url, files: [file] };
        if (navigator.canShare(withFile)) send(withFile);
        else send(payload);
      }).catch(() => send(payload));
      return;
    }
    send(payload);
  }
  window.CHOPPY_AWARDS = AWARD_CATALOG;
  window.choppyAwardHtml = () => awardListHtml(loadAwards(), "owned");
  window.mergeChoppyAwards = syncAwards;
  function jukeLyricsOn() { return localStorage.getItem("choppy-juke-lyrics") === "1"; }
  function setJukeLyrics(on) { localStorage.setItem("choppy-juke-lyrics", on ? "1" : "0"); }
  function jukeEnabledList() {
    if (!S.jukeOff) S.jukeOff = {};
    return (S.jukeList || []).filter((id) => !S.jukeOff[id]);
  }
  function jukeUnlockCount(tier) {
    const total = (A && A.jukeSize) ? A.jukeSize() : 0;
    if (A && A.jukeSplit) return A.jukeSplit(total, tier || 0);
    const cap = (typeof PERK_MAX !== "undefined" && PERK_MAX.juke) || 7;
    const t = Math.max(0, tier || 0);
    if (t <= 0 || !total) return 0;
    if (t >= cap) return total;
    return Math.min(total, t * Math.floor(total / cap));
  }
  function fillJukebox() {
    const all = (A && A.JUKE_CORE && A.JUKE_CORE.slice()) || Object.keys((A && A.SONGS) || {});
    if (!S.jukeUnlock) S.jukeUnlock = [];
    const known = {};
    all.forEach((id) => { known[id] = true; });
    S.jukeUnlock = S.jukeUnlock.filter((id) => known[id]);
    const seen = {};
    S.jukeUnlock.forEach((id) => { seen[id] = true; });
    const extra = all.filter((id) => !seen[id]);
    for (let i = extra.length - 1; i > 0; i--) {
      const j = (Math.random() * (i + 1)) | 0;
      const tmp = extra[i]; extra[i] = extra[j]; extra[j] = tmp;
    }
    S.jukeUnlock = S.jukeUnlock.concat(extra);
    const t = Math.max(0, S.have.juke || 0);
    const n = jukeUnlockCount(t);
    const keep = (S.jukeList || [])[S.jukeTrack];
    S.jukeList = S.jukeUnlock.slice(0, n);
    const idx = keep ? S.jukeList.indexOf(keep) : -1;
    S.jukeTrack = idx >= 0 ? idx : 0;
  }
  function jukeSelect(i) {
    fillJukebox();
    const n = S.jukeList.length;
    if (!n) return;
    S.jukeTrack = ((i % n) + n) % n;
    if (S.jukeOn || (A.jukePaused && A.jukePaused())) {
      S.jukeOn = false;
      if (A && A.jukeStop) A.jukeStop();
    }
    renderOverlay();
  }
  function jukePlay() {
    fillJukebox();
    const pool = jukeEnabledList();
    if (!pool.length || !A.jukePlay) return;
    if (!pool.includes(S.jukeList[S.jukeTrack])) S.jukeTrack = S.jukeList.indexOf(pool[0]);
    const id = S.jukeList[S.jukeTrack];
    A.unlock();
    A.jukePlay(id);
    S.jukeOn = true;
    renderOverlay();
  }
  function jukePause() {
    if (A.jukePaused && A.jukePaused()) {
      if (A.jukeResume) A.jukeResume();
    } else if (A.jukePause) A.jukePause();
    renderOverlay();
  }
  A.onJukeEnd = function () {
    if (!S.jukeOn) return;
    fillJukebox();
    const pool = jukeEnabledList();
    if (!pool.length) { S.jukeOn = false; if (A.jukeStop) A.jukeStop(); return; }
    const cur = S.jukeList[S.jukeTrack];
    let next;
    if (S.jukeRepeat === "one") next = cur;
    else if (S.jukeShuffle) next = pool[(Math.random() * pool.length) | 0];
    else {
      const i = pool.indexOf(cur);
      if (i >= 0 && i < pool.length - 1) next = pool[i + 1];
      else if (S.jukeRepeat === "all") next = pool[0];
      else { S.jukeOn = false; if (A.jukeStop) A.jukeStop(); renderOverlay(); return; }
    }
    S.jukeTrack = S.jukeList.indexOf(next);
    if (A.jukePlay) A.jukePlay(next);
    if (S.phase === "paused") renderOverlay();
  };

  function testInRun() {
    return S.phase === "paused" || S.phase === "perk" || S.phase === "chance" || S.phase === "play";
  }
  function testSeedOf(id) {
    return (S.testPerkSeed && S.testPerkSeed[id]) || 0;
  }
  function applyTestLoadout() {
    S.testCheat = false;
    let cheated = false;
    const seed = S.testPerkSeed || {};
    Object.keys(seed).forEach((k) => {
      const n = seed[k] | 0;
      for (let i = 0; i < n; i++) grantPerk(k);
      if (n > 0) cheated = true;
    });
    if ((S.testArcEvery | 0) > 0) {
      S.testArcNext = (S.candles || 0) + (S.testArcEvery | 0);
      cheated = true;
    }
    if (S.testCashOnce > 0) { S.cash += S.testCashOnce; S.testCashOnce = 0; cheated = true; }
    if (S.testBtcOnce > 0) { creditBtc(S.testBtcOnce); S.testBtcOnce = 0; cheated = true; }
    if (S.testIndepQueued) {
      applyPreIndependence();
      S.testIndepQueued = false;
      cheated = true;
    }
    if (cheated) S.testCheat = true;
  }
  const PRE_INDEP_CARDS = [
    "landfill", "wine", "justInCase", "nothingToHide", "somethingBetter", "wedding",
    "timeTraveler", "temporaryMeasures", "citadelProblem",
    "pieceWorld", "islandInspection", "paperwork", "nobodyKnows", "theOg",
    "peopleAsking", "extensionCord", "obviously",
    "principality", "stateVisit", "firstBloc", "protectIsland", "placeNow",
    "citadelQuestion", "rearmament", "anOffer", "ambassador", "threeColors", "ortegaCalls"
  ];
  function battlePreset(id) {
    if (id === "easy") return { army: 100, world: 20 };
    if (id === "hard") return { army: 0, world: 20 };
    return { army: 50, world: 20 };
  }
  function testBattleNote() {
    const p = battlePreset(S.testBattle);
    return t("testArmy") + " " + p.army + " · " + t("testWorld") + " " + p.world;
  }
  function applyPreIndependence() {
    if (!S.chanceUsed) S.chanceUsed = {};
    if (!S.chanceMet) S.chanceMet = {};
    PRE_INDEP_CARDS.forEach((id) => {
      S.chanceUsed[id] = true;
      noteArcSeen(id);
    });
    S.familyClosed = true;
    S.familyPath = false;
    S.engaged = false;
    S.arcBias = "";
    S.bcBook = true;
    S.bcBookOffer = false;
    S.chanceMet.islandTrip = true;
    S.bcIsland = true;
    S.bcIslandOffer = 0;
    S.bcOg = true;
    S.bcSettlement = true;
    S.bcPower = true;
    S.bcMine = true;
    S.bcCitadel = true;
    S.bcArmyUnlocked = true;
    const fight = battlePreset(S.testBattle);
    S.bcArmy = fight.army;
    S.bcArmyTier = fight.army>=100?7:fight.army<=0?0:Math.max(1,Math.min(6,Math.round(fight.army/100*7)));
    S.bcWorld = fight.world;
    S.bcNodes = 100;
    ["theQuestion","cabinet","declaration","theAnswer","blocReplies"].forEach((id) => {
      S.chanceUsed[id] = true;
      noteArcSeen(id);
    });
    S.bcIndependent = true;
    S.bcNameAsk = false;
    if (!cleanCountryName(S.bcCountryName)) S.bcCountryName = "Bitcoin Country";
    if (!S.bcReactions) rollBlocReactions();
    S.bcRepliesDone = true;
    S.bcVictory = false;
    S.bcArcClosed = false;
    S.bcDefense = null;
    S.bcDefensePending = false;
    S.bcBattlesWon = 0;
    S.bcPerks = {};
    S.bcAidUsed = 0;
    S.bcMapPlan = null;
    rollBlocs();
    S.bcMapSeed = 0;
    S.bcShotTier = 0;
    S.bcShotSpread = 0;
    shotKeep.tier = 0;
    shotKeep.spread = 0;
    try{sessionStorage.removeItem("bc-shot");}catch(e){}
    S.bcRuinTiles = 0;
    S.bcRuinGone = 0;
    S.bcRebuild = null;
    S.bcAssaultAt = 0;
    if (!S.bcReactions) rollBlocReactions();
    S.bcRepliesDone = true;
    S.indepNoted = false;
    if (!S.have) S.have = {};
    S.have.market = Math.max(S.have.market || 0, 1);
    S.have.chance = Math.max(S.have.chance || 0, 2);
    if ((S.cash || 0) < 120000) S.cash = 120000;
    if ((S.btc || 0) < 0.85) S.btc = 0.85;
    if (!(S.price > 1000)) S.price = 42000;
    S.candles = Math.max(S.candles || 0, 336);
    S.shownCandles = S.candles;
    S.bcNodeTick = S.candles;
    S.chanceAt = [(S.candles || 0) + 1];
    S.chanceUntil = (S.candles || 0) + 21;
    S.testCheat = true;
    S.peakNet = Math.max(S.peakNet || 0, netBtc());
  }
  function testPreIndependence() {
    S.testCheat = true;
    if (!testInRun()) {
      S.testIndepQueued = true;
      S.optPanel = null;
      startGame(false);
    } else {
      applyPreIndependence();
      S.optPanel = null;
    }
    startDefense();
  }
  function testGrantPerk(kind) {
    if (!kind || !PERK_MAX[kind]) return;
    const cap = PERK_MAX[kind];
    const cur = testInRun() ? (S.have[kind] || 0) : testSeedOf(kind);
    if (cur >= cap) return;
    if (!S.testPerkSeed) S.testPerkSeed = {};
    S.testPerkSeed[kind] = testSeedOf(kind) + 1;
    S.testPerkPick = kind;
    S.testCheat = true;
    if (testInRun()) grantPerk(kind);
    try { renderHud(); } catch (e) {}
  }
  function testSetArcEvery(n) {
    let v = Math.floor(Number(n));
    if (!isFinite(v) || v < 0) v = 0;
    if (v > 999) v = 999;
    S.testArcEvery = v;
    if (v > 0) {
      S.testCheat = true;
      S.testArcNext = (S.candles || 0) + v;
      return;
    }
    S.testArcNext = 0;
    if (!testInRun()) return;
    if ((S.have.chance || 0) > 0) planChanceWindow(S.candles || 0);
    else { S.chanceAt = []; S.chanceUntil = 0; }
  }
  function testAddMoney(amount, cur) {
    const n = Math.max(0, Number(amount) || 0);
    if (!(n > 0)) return;
    S.testCur = cur === "btc" ? "btc" : "usd";
    S.testCheat = true;
    if (!testInRun()) {
      if (S.testCur === "btc") S.testBtcOnce = (S.testBtcOnce || 0) + n;
      else S.testCashOnce = (S.testCashOnce || 0) + n;
      return;
    }
    if (S.testCur === "btc") creditBtc(n);
    else S.cash += n;
    try { renderHud(); } catch (e) {}
  }
  function testPerkOptionsHtml() {
    const pick = S.testPerkPick || "dca";
    const es = window.BZ && BZ.lang && BZ.lang() === "es";
    const pack = es ? PERK_NAME_ES : PERK_NAME;
    return Object.keys(PERK_MAX).map((id) => {
      const cap = PERK_MAX[id];
      const have = testInRun() ? (S.have[id] || 0) : testSeedOf(id);
      const name = pack[id] || id;
      return "<option value=\"" + id + "\"" + (id === pick ? " selected" : "") + ">" + name + " · " + have + "/" + cap + "</option>";
    }).join("");
  }
  function testArcStatus() {
    const n = S.testArcEvery | 0;
    if (n <= 0) return t("testArcHint");
    const left = testInRun()
      ? Math.max(0, (S.testArcNext || ((S.candles || 0) + n)) - (S.candles || 0))
      : n;
    const line = t("testArcNext").replace("{n}", String(left)).replace("{now}", String(S.candles || 0));
    return testInRun() ? line : line + " " + t("testQueued");
  }
  function testMoneyStatus() {
    if (testInRun()) return money(S.cash) + " · " + fmtBtc(S.btc);
    const bits = [];
    if (S.testCashOnce > 0) bits.push(money(S.testCashOnce));
    if (S.testBtcOnce > 0) bits.push(fmtBtc(S.testBtcOnce));
    if (!bits.length) return "—";
    return bits.join(" · ") + " · " + t("testQueued");
  }
  let testLogDraft = null;
  let testLogHold = false;
  function escTxt(s) {
    return String(s == null ? "" : s).split("&").join("&" + "amp;").split("<").join("&" + "lt;").split(">").join("&" + "gt;");
  }
  function arcCardLine(c) {
    const es = window.BZ && BZ.lang && BZ.lang() === "es";
    const title = (es && c.titleEs) ? c.titleEs : (c.title || c.id);
    return c.id + " — " + (c.job ? fillJob(title) : title);
  }
  function revealedArcText() {
    try {
      const used = S.chanceUsed || {};
      const byId = {};
      CHANCE_CARDS.forEach((c) => { byId[c.id] = c; });
      const seen = [];
      const push = (id) => {
        if (!id || seen.indexOf(id) >= 0) return;
        if (!used[id] && !(S.arcSeen && S.arcSeen.indexOf(id) >= 0) && !(S.chanceCard && S.chanceCard.id === id)) return;
        seen.push(id);
      };
      (S.arcSeen || []).forEach(push);
      Object.keys(used).forEach((id) => { if (used[id]) push(id); });
      if (S.chanceCard && S.chanceCard.id) push(S.chanceCard.id);
      const lines = seen.map((id) => {
        const c = byId[id];
        return c ? arcCardLine(c) : id;
      });
      return lines.length ? lines.join("\n") : t("testNoneRevealed");
    } catch (err) {
      return t("testNoneRevealed");
    }
  }
  function remainingArcText() {
    try {
      const lines = [];
      CHANCE_CARDS.forEach((c) => {
        if (S.chanceUsed && S.chanceUsed[c.id]) return;
        if (!arcUnlocked(c)) return;
        lines.push(arcCardLine(c));
      });
      return lines.length ? lines.join("\n") : t("testNonePool");
    } catch (err) {
      return t("testNonePool");
    }
  }
  function testLogValue() {
    const auto = revealedArcText();
    if (!testLogHold || testLogDraft == null) testLogDraft = auto;
    return testLogDraft;
  }
  function testMarkup() {
    const arcVal = S.testArcEvery > 0 ? S.testArcEvery : 0;
    const moneyVal = S.testCur === "btc" ? "0.1" : "10000";
    const note = (S.testCheat || (S.testArcEvery | 0) > 0 || S.testCashOnce > 0 || S.testBtcOnce > 0 || Object.keys(S.testPerkSeed || {}).some((k) => testSeedOf(k) > 0))
      ? "<p class=\"k\">" + t("testBoard") + "</p>" : "";
    return "<div class=\"opt-head\">" + optHead(t("testing")) + "</div><div class=\"test-box\">"
      + "<p class=\"test-lab\">" + t("testRevealed") + "</p>"
      + "<textarea id=\"test-arc-log\" class=\"test-log\" rows=\"8\" spellcheck=\"false\">" + escTxt(testLogValue()) + "</textarea>"
      + "<div class=\"test-row\">"
      + "<button type=\"button\" class=\"cta\" id=\"test-copy-log\">" + t("testCopy") + "</button>"
      + "</div>"
      + "<p class=\"test-lab\">" + t("testPool") + "</p>"
      + "<pre class=\"test-pool\" id=\"test-arc-pool\">" + escTxt(remainingArcText()) + "</pre>"
      + "<p class=\"test-lab\">" + t("testPerk") + "</p>"
      + "<div class=\"test-row\">"
      + "<select id=\"test-perk\">" + testPerkOptionsHtml() + "</select>"
      + "<button type=\"button\" class=\"cta\" id=\"test-grant\">" + t("testGrant") + "</button>"
      + "</div>"
      + "<p class=\"test-lab\">" + (chanceLang() ? "Forzar arc card" : "Force arc card") + "</p>"
      + "<div class=\"test-row\"><select id=\"test-force\">" + CHANCE_CARDS.map((c) => "<option value=\"" + c.id + "\">" + escTxt(c.id + " · " + ((chanceLang() ? c.titleEs : 0) || c.title || "")) + "</option>").join("") + "</select>"
      + "<button type=\"button\" class=\"cta\" id=\"test-force-go\">" + (chanceLang() ? "Mostrar" : "Show") + "</button></div>"
      + "<p class=\"k\" id=\"test-force-note\"></p>"
      + "<p class=\"test-lab\">" + t("testArc") + "</p>"
      + "<div class=\"test-row\">"
      + "<input id=\"test-arc-n\" type=\"number\" min=\"0\" max=\"999\" inputmode=\"numeric\" value=\"" + arcVal + "\">"
      + "<button type=\"button\" class=\"cta\" id=\"test-arc-set\">" + t("testArcSet") + "</button>"
      + "</div>"
      + "<p class=\"k\" id=\"test-arc-status\">" + testArcStatus() + "</p>"
      + "<p class=\"test-lab\">" + t("testMoney") + "</p>"
      + "<div class=\"test-row\">"
      + "<input id=\"test-money\" type=\"number\" min=\"0\" step=\"any\" inputmode=\"decimal\" value=\"" + moneyVal + "\">"
      + "<select id=\"test-cur\">"
      + "<option value=\"usd\"" + (S.testCur === "btc" ? "" : " selected") + ">USD</option>"
      + "<option value=\"btc\"" + (S.testCur === "btc" ? " selected" : "") + ">BTC</option>"
      + "</select>"
      + "<button type=\"button\" class=\"cta\" id=\"test-add\">" + t("testAdd") + "</button>"
      + "</div>"
      + "<p class=\"k\">" + testMoneyStatus() + "</p>"
      + "<p class=\"test-lab\">" + t("testBattle") + "</p>"
      + "<div class=\"gfx-seg\">"
      + "<button type=\"button\" class=\"cta" + (S.testBattle === "easy" ? " on" : "") + "\" data-battle=\"easy\">" + t("testEasy") + "</button>"
      + "<button type=\"button\" class=\"cta" + (S.testBattle === "mod" ? " on" : "") + "\" data-battle=\"mod\">" + t("testMod") + "</button>"
      + "<button type=\"button\" class=\"cta" + (S.testBattle === "hard" ? " on" : "") + "\" data-battle=\"hard\">" + t("testHard") + "</button>"
      + "</div>"
      + "<p class=\"k\" id=\"test-battle-note\">" + testBattleNote() + "</p>"
      + "<p class=\"test-lab\">" + t("testPreInd") + "</p>"
      + "<div class=\"test-row\">"
      + "<button type=\"button\" class=\"cta\" id=\"test-preindep\">" + t("testPreInd") + "</button>"
      + "</div>"
      + "<p class=\"k\">" + t("testPreIndHint") + "</p>"
      + note
      + "</div>";
  }

  function optHead(title) {
    return "<h1>" + title + "</h1><button type=\"button\" class=\"opt-x\" id=\"opt-x\" aria-label=\"" + t("close") + "\">×</button>";
  }
  function pauseMarkup() {
    const panel = S.optPanel || "";
    if (panel === "help") {
      return "<div class=\"opt-head\">" + optHead(t("howPlay")) + "</div>" + tutorialBody();
    }
    if (panel === "market") {
      const mul = S.ranked ? 10 : 1;
      const cold = 1200 * mul, laser = 1800 * mul, msig = 9000 * mul;
      const book = S.bcBookOffer&&!S.bcBook ? "<button class=\"cta\" data-buy=\"bcbook\">THE BITCOIN STATE · "+costLabel(666)+"</button>" : "";
      const island = S.bcIslandOffer&&!S.bcIsland&&S.chanceMet&&S.chanceMet.islandTrip ? "<button class=\"cta\" data-buy=\"bcisland\">" + (chanceLang() ? "La isla" : "The Island") + " · "+costLabel(S.bcIslandOffer)+"</button>" : "";
      return "<div class=\"opt-head\">" + optHead(t("market")) + "</div>"
        + "<p class=\"k\">" + fmtCostUsd(S.cash) + " · " + fmtCostBtc(S.btc) + "</p>" + book + island
        + "<button class=\"cta\" data-buy=\"cold\">Cold storage · " + costLabel(cold) + "</button>"
        + "<button class=\"cta\" data-buy=\"laser\">Laser eyes · " + costLabel(laser) + "</button>"
        + "<button class=\"cta\" data-buy=\"msig\">Multisig · " + costLabel(msig) + "</button>";
    }
    if (panel === "feed") {
      return "<div class=\"opt-head\">" + optHead(t("feedback")) + "</div>"
        + "<textarea id=\"feed-text\" rows=\"5\" style=\"width:100%;max-width:360px;background:#0a0a0c;color:#f3efe6;border:1px solid #3a3a40;padding:8px;font:inherit\"></textarea>"
        + "<p class=\"k\" id=\"feed-msg\"></p>"
        + "<button class=\"cta\" id=\"feed-send\">" + t("send") + "</button>";
    }
    if (panel === "aibud") {
      if ((S.have.aibud || 0) <= 0) {
        return "<div class=\"opt-head\">" + optHead(t("aiLog")) + "</div><p>" + t("aiNeed") + "</p>";
      }
      const rows = (S.iaLog || []).map((e) => {
        const sec = Math.floor(e.t);
        return "<p><span class=\"ia-act\">" + aiVis(e.act) + "</span> — " + aiVis(e.why) + " <span class=\"k\">" + sec + "s · " + fmtBtc(e.btc != null ? e.btc : 0) + "</span></p>";
      }).join("") || "<p>" + t("noAiCalls") + "</p>";
      return "<div class=\"opt-head\">" + optHead(t("aiLog")) + "</div><p class=\"k\">" + t("markedPl") + " " + fmtBtc(S.iaProfit || 0) + " · T" + (S.have.aibud || 0) + "</p><div class=\"awards\">" + rows + "</div>";
    }
    if (panel === "juke") {
      if ((S.have.juke || 0) <= 0) {
        return "<div class=\"opt-head\">" + optHead(t("jukebox")) + "</div><p>" + t("jukeNeed") + "</p>";
      }
      fillJukebox();
      const labPrev = t("ariaPrev");
      const labPlay = t("ariaPlay");
      const labPause = t("ariaPause");
      const labNext = t("ariaNext");
      const labShuf = t("ariaShuffle");
      const labRep = t("ariaRepeat");
      const labOn = t("ariaEnable");
      const labOff = t("ariaDisable");
      const labRetro = t("jukeRetro");
      const id = S.jukeList[S.jukeTrack] || "";
      const live = !!(A.jukePlaying && A.jukePlaying());
      const paused = !!(A.jukePaused && A.jukePaused());
      const song = A.SONGS && A.SONGS[id];
      const rows = S.jukeList.map((sid, i) => {
        const t = (A.SONGS && A.SONGS[sid] && A.SONGS[sid].title) || sid;
        const off = S.jukeOff && S.jukeOff[sid];
        const len = (A.tuneSeconds && A.tuneSeconds(sid)) || 0;
        return "<div class=\"juke-line" + (i === S.jukeTrack ? " on" : "") + (off ? " dim" : "") + "\">"
          + "<button type=\"button\" class=\"juke-track\" data-juke=\"" + i + "\">" + t + "</button>"
          + "<span class=\"juke-len\">" + (len ? fmtJuke(len) : "") + "</span>"
          + "<button type=\"button\" class=\"juke-arm" + (off ? " off" : " on") + "\" data-skip=\"" + sid + "\" aria-label=\"" + (off ? labOn : labOff) + "\">" + (off ? "✕" : "✓") + "</button>"
          + "</div>";
      }).join("");
      const rpt = S.jukeRepeat || "off";
      return "<div class=\"opt-head\">" + optHead(t("jukebox")) + "</div><div class=\"juke retro\">"
        + "<p class=\"juke-lab\">" + labRetro + "</p>"
        + "<p class=\"juke-now\">" + (song ? song.title : id) + "</p>"
        + "<p class=\"juke-gen\">" + (song && song.genre ? song.genre : "") + "</p>"
        + "<div class=\"juke-row\">"
        + "<button type=\"button\" class=\"juke-btn ico\" id=\"juke-prev\" aria-label=\"" + labPrev + "\">⏮</button>"
        + "<button type=\"button\" class=\"juke-btn ico juke-play" + (live ? " on" : "") + "\" id=\"juke-play\" aria-label=\"" + labPlay + "\">▶</button>"
        + "<button type=\"button\" class=\"juke-btn ico" + (paused ? " on" : "") + "\" id=\"juke-pause\" aria-label=\"" + labPause + "\">❚❚</button>"
        + "<button type=\"button\" class=\"juke-btn ico\" id=\"juke-next\" aria-label=\"" + labNext + "\">⏭</button>"
        + "</div>"
        + "<div class=\"juke-prog\"><div class=\"juke-prog-bar\" id=\"juke-bar\"></div></div>"
        + "<div class=\"juke-times\"><span id=\"juke-el\">0:00</span><span id=\"juke-left\"></span></div>"
        + "<div class=\"juke-row\">"
        + "<button type=\"button\" class=\"juke-btn ico" + (S.jukeShuffle ? " on" : "") + "\" id=\"juke-shuf\" aria-label=\"" + labShuf + "\">🔀</button>"
        + "<button type=\"button\" class=\"juke-btn ico" + (rpt !== "off" ? " on" : "") + "\" id=\"juke-rep\" aria-label=\"" + labRep + "\">" + (rpt === "one" ? "🔂" : "🔁") + "</button>"
        + "</div>"
        + "<div class=\"juke-list\">" + rows + "</div>"
        + "</div>";
    }
    if (panel === "sound") {
      const themeOn = !A.muteTheme();
      const sfxOn = !A.muteSfx();
      const voiceOn = !A.muteVoice();
      return "<div class=\"opt-head\">" + optHead(t("sound")) + "</div><div class=\"mute-row\">"
        + "<button type=\"button\" class=\"mute-tog" + (themeOn ? "" : " on") + "\" id=\"mute-theme\">" + t("bullSongs") + " " + (themeOn ? t("soundOn") : t("soundOff")) + "</button>"
        + "<button type=\"button\" class=\"mute-tog" + (sfxOn ? "" : " on") + "\" id=\"mute-sfx\">" + t("gameFx") + " " + (sfxOn ? t("soundOn") : t("soundOff")) + "</button>"
        + "<button type=\"button\" class=\"mute-tog" + (voiceOn ? "" : " on") + "\" id=\"mute-voice\">" + t("voices") + " " + (voiceOn ? t("soundOn") : t("soundOff")) + "</button>"
        + "</div>";
    }
    if (panel === "lang") {
      const cur = (window.BZ && BZ.lang && BZ.lang()) || "en";
      return "<div class=\"opt-head\">" + optHead(t("language")) + "</div><div class=\"opt-menu\">"
        + "<button type=\"button\" class=\"cta opt-item" + (cur === "en" ? " on" : "") + "\" data-lang=\"en\">English</button>"
        + "<button type=\"button\" class=\"cta opt-item" + (cur === "es" ? " on" : "") + "\" data-lang=\"es\">Español</button>"
        + "</div>";
    }
    if (panel === "gfx") {
      const pal = currentPaletteId();
      const swatches = Object.keys(PALETTES).map((id) => {
        const p = PALETTES[id];
        return "<button type=\"button\" class=\"cta opt-item pal-swatch" + (pal === id ? " on" : "") + "\" data-pal=\"" + id + "\">"
          + "<span class=\"pal-dots\" aria-hidden=\"true\"><i style=\"background:" + p.bg + "\"></i><i style=\"background:" + p.gold + "\"></i><i style=\"background:" + p.green + "\"></i><i style=\"background:" + p.red + "\"></i></span>"
          + t(p.nameKey) + "</button>";
      }).join("");
      return "<div class=\"opt-head\">" + optHead(t("graphics")) + "</div>"
        + "<div class=\"gfx-sheet\">"
        + "<button type=\"button\" class=\"hero-tog\" id=\"hero-tog\" aria-label=\"" + t("tapHero") + "\">"
        + "<canvas id=\"hero-prev\" class=\"hero-prev\" width=\"120\" height=\"84\"></canvas>"
        + "</button>"
        + "<p class=\"hero-prev-cap\">" + t("tapHero") + "</p>"
        + "<div class=\"gfx-toggles\">"
        + "<button type=\"button\" class=\"cta opt-item\" id=\"opt-price\">" + t("priceShow") + " · " + priceModeLabel() + "</button>"
        + "<button type=\"button\" class=\"mute-tog" + (SHOW_GAIN ? "" : " on") + "\" id=\"tog-gain\">" + t("candleText") + " " + (SHOW_GAIN ? t("soundOn") : t("soundOff")) + "</button>"
        + "<button type=\"button\" class=\"mute-tog" + (SHOW_TRADE ? "" : " on") + "\" id=\"tog-trade\">" + t("tradeText") + " " + (SHOW_TRADE ? t("soundOn") : t("soundOff")) + "</button>"
        + "</div>"
        + "<div class=\"pal-grid\">" + swatches + "</div>"
        + "</div>";
    }
    if (panel === "game") {
      return "<div class=\"opt-head\">" + optHead(t("gameplay")) + "</div>"
        + "<div class=\"opt-menu\">"
        + "<button type=\"button\" class=\"cta opt-item\" id=\"opt-move\">" + t("battleMove") + " · " + (BATTLE_360 ? "360°" : "↑↓←→") + "</button>"
        + (KB_DESK || /[?&]kb=1/.test(location.search) ? "<button type=\"button\" class=\"cta opt-item\" id=\"opt-keys\">" + (chanceLang() ? "TECLAS (PC)" : "HOTKEYS (PC)") + "</button>" : "")
        + "</div>";
    }
    if (panel === "keys") {
      return "<div class=\"opt-head\">" + optHead(chanceLang() ? "TECLAS" : "HOTKEYS") + "</div>" + kbRows();
    }
    if (panel === "test") return testMarkup();
    const fromPlay = S.phase === "paused" && (S.optBack === "play" || !S.optBack);
    return "<div class=\"opt-head\">" + optHead(fromPlay ? t("paused") : t("options")) + "</div>"
      + "<div class=\"opt-menu\">"
      + "<button type=\"button\" class=\"cta opt-item\" id=\"opt-lang\">" + t("language") + "</button>"
      + "<button type=\"button\" class=\"cta opt-item\" id=\"opt-game\">" + t("gameplay") + "</button>"
      + "<button type=\"button\" class=\"cta opt-item\" id=\"opt-sound\">" + t("sound") + "</button>"
      + "<button type=\"button\" class=\"cta opt-item\" id=\"opt-gfx\">" + t("graphics") + "</button>"
      + (S.ranked ? "" : "<button type=\"button\" class=\"cta opt-item\" id=\"opt-test\">" + t("testing") + "</button>")
      + "<button type=\"button\" class=\"cta opt-item" + ((S.have.juke || 0) > 0 ? "" : " dim") + "\" id=\"opt-juke\">" + t("jukebox") + "</button>"
      + "<button type=\"button\" class=\"cta opt-item" + ((S.have.aibud || 0) > 0 ? "" : " dim") + "\" id=\"opt-aibud\">" + t("aiLog") + "</button>"
      + "<button type=\"button\" class=\"cta opt-item\" id=\"opt-help\">" + t("tutorial") + "</button>"
      + "<button type=\"button\" class=\"cta opt-item\" id=\"opt-feed\">" + t("feedback") + "</button>"
      + "</div>";
  }
  function bindPauseUi() {
    const go = $("go");
    if (go) go.onclick = () => {
      S.optPanel = null;
      if (S.optBack === "ready") { S.phase = "ready"; renderOverlay(); }
      else setPhase(S.optBack || "play");
    };
    const optClose = $("opt-close");
    if (optClose) optClose.onclick = (e) => {
      e.stopPropagation();
      S.optPanel = null;
      if (S.phase === "chance" || S.phase === "perk") { renderOverlay(); return; }
      if (S.optBack === "ready" || S.phase === "ready") { S.phase = "ready"; renderOverlay(); }
      else setPhase(S.optBack || "play");
    };
    const helpBack = $("help-back");
    if (helpBack) helpBack.onclick = (e) => { e.stopPropagation(); S.optPanel = "menu"; renderOverlay(); };
    const optX = $("opt-x");
    if (optX) optX.onclick = (e) => {
      e.stopPropagation();
      const panel = S.optPanel || "";
      const nested = panel && panel !== "menu" && panel !== "off";
      if (nested) { kbCapture = null; S.optPanel = panel === "keys" ? "game" : "menu"; renderOverlay(); return; }
      S.optPanel = null;
      if (S.phase === "chance" || S.phase === "perk") { renderOverlay(); return; }
      if (S.optBack === "ready" || S.phase === "ready") { S.phase = "ready"; renderOverlay(); return; }
      if (S.phase === "paused") { S.optPanel = S.arcHold ? null : "off"; renderOverlay(); return; }
      setPhase(S.optBack || "play");
    };
    overlay.querySelectorAll("[data-buy]").forEach((btn) => {
      btn.onclick = (e) => {
        e.stopPropagation();
        const kind = btn.getAttribute("data-buy");
        const mul = S.ranked ? 10 : 1;
        if(kind==="bcbook"){
          if(wealthUsd()+1e-4<666){say("You cannot cover "+costLabel(666)+" yet.",false);renderOverlay();return;}
          payUsd(666);S.bcBook=true;A.sfx.coin();renderOverlay();renderHud();return;
        }
        if(kind==="bcisland"){
          const cost=S.bcIslandOffer||0;
          if(!cost||S.bcIsland){renderOverlay();return;}
          if(wealthUsd()+1e-4<cost){say("You cannot cover "+costLabel(cost)+" yet.",false);renderOverlay();return;}
          payUsd(cost);S.bcIsland=true;A.sfx.coin();renderOverlay();renderHud();return;
        }
        const cost = (kind === "cold" ? 1200 : kind === "laser" ? 1800 : 9000) * mul;
        if (wealthUsd()+1e-4 < cost) { say("You cannot cover "+costLabel(cost)+" yet.", false); renderOverlay(); return; }
        payUsd(cost);
        if (kind === "cold") { S.cold += 1; packCold(); }
        else if (kind === "laser") {
          S.lasers += 1;
          if (S.laserOn) S.laserT += POWER_S; else applyLaser(true);
          A.sfx.coin();
          renderHud();
          if (tryRankedPerk(true)) return;
          renderOverlay();
          return;
        } else S.msig += 1;
        A.sfx.coin();
        renderOverlay();
        renderHud();
      };
    });
    const optJuke = $("opt-juke");
    if (optJuke) optJuke.onclick = (e) => { e.stopPropagation(); S.optPanel = "juke"; renderOverlay(); };
    const jp = $("juke-play");
    if (jp) jp.onclick = (e) => { e.stopPropagation(); jukePlay(); };
    const jpa = $("juke-pause");
    if (jpa) jpa.onclick = (e) => { e.stopPropagation(); jukePause(); };
    const jpr = $("juke-prev");
    if (jpr) jpr.onclick = (e) => { e.stopPropagation(); jukeSelect(S.jukeTrack - 1); };
    const jn = $("juke-next");
    if (jn) jn.onclick = (e) => { e.stopPropagation(); jukeSelect(S.jukeTrack + 1); };
    overlay.querySelectorAll("[data-juke]").forEach((btn) => {
      btn.onclick = (e) => { e.stopPropagation(); jukeSelect(+btn.getAttribute("data-juke")); };
    });
    overlay.querySelectorAll("[data-skip]").forEach((btn) => {
      btn.onclick = (e) => {
        e.stopPropagation();
        const sid = btn.getAttribute("data-skip");
        if (!S.jukeOff) S.jukeOff = {};
        if (S.jukeOff[sid]) delete S.jukeOff[sid];
        else if (jukeEnabledList().length > 1) S.jukeOff[sid] = true;
        renderOverlay();
      };
    });
    const sh = $("juke-shuf");
    if (sh) sh.onclick = (e) => { e.stopPropagation(); S.jukeShuffle = !S.jukeShuffle; renderOverlay(); };
    const rp = $("juke-rep");
    if (rp) rp.onclick = (e) => {
      e.stopPropagation();
      S.jukeRepeat = S.jukeRepeat === "off" ? "all" : S.jukeRepeat === "all" ? "one" : "off";
      renderOverlay();
    };
    const optHelp = $("opt-help");
    if (optHelp) optHelp.onclick = (e) => { e.stopPropagation(); S.optPanel = "help"; renderOverlay(); };
    const optFeed = $("opt-feed");
    if (optFeed) optFeed.onclick = (e) => { e.stopPropagation(); S.optPanel = "feed"; renderOverlay(); };
    const feedSend = $("feed-send");
    if (feedSend) feedSend.onclick = async (e) => {
      e.stopPropagation();
      const text = (($("feed-text") && $("feed-text").value) || "").trim();
      if (text.length < 8) {
        if ($("feed-msg")) $("feed-msg").textContent = "8+";
        return;
      }
      const ok = window.sendFeedback ? await window.sendFeedback(text) : false;
      if ($("feed-msg")) $("feed-msg").textContent = ok ? t("thanks") : "…";
      if (ok && $("feed-text")) $("feed-text").value = "";
    };
    const optLang = $("opt-lang");
    if (optLang) optLang.onclick = (e) => { e.stopPropagation(); S.optPanel = "lang"; renderOverlay(); };
    const optPrice = $("opt-price");
    if (optPrice) optPrice.onclick = (e) => { e.stopPropagation(); cyclePriceMode(); renderOverlay(); renderHud(); };
    const optSound = $("opt-sound");
    if (optSound) optSound.onclick = (e) => { e.stopPropagation(); S.optPanel = "sound"; renderOverlay(); };
    const optAi = $("opt-aibud");
    if (optAi) optAi.onclick = (e) => { e.stopPropagation(); S.optPanel = "aibud"; renderOverlay(); };
    const mt = $("mute-theme");
    if (mt) mt.onclick = (e) => { e.stopPropagation(); A.setMuteTheme(!A.muteTheme()); renderOverlay(); };
    const ms = $("mute-sfx");
    if (ms) ms.onclick = (e) => { e.stopPropagation(); A.setMuteSfx(!A.muteSfx()); renderOverlay(); };
    const mv = $("mute-voice");
    if (mv) mv.onclick = (e) => { e.stopPropagation(); A.setMuteVoice(!A.muteVoice()); renderOverlay(); };
    const optGfx = $("opt-gfx");
    if (optGfx) optGfx.onclick = (e) => { e.stopPropagation(); S.optPanel = "gfx"; renderOverlay(); };
    const optGame = $("opt-game");
    if (optGame) optGame.onclick = (e) => { e.stopPropagation(); S.optPanel = "game"; renderOverlay(); };
    const optKeys = $("opt-keys");
    if (optKeys) optKeys.onclick = (e) => { e.stopPropagation(); kbCapture = null; kbMsg = ""; S.optPanel = "keys"; renderOverlay(); };
    if (S.optPanel === "keys") kbBind();
    const optMove = $("opt-move");
    if (optMove) optMove.onclick = (e) => {
      e.stopPropagation();
      setBattleMove(BATTLE_360 ? "ortho" : "360");
      renderOverlay();
    };
    const optTest = $("opt-test");
    if (optTest) optTest.onclick = (e) => {
      e.stopPropagation();
      testLogHold = false;
      testLogDraft = null;
      S.optPanel = "test";
      renderOverlay();
    };
    const testLog = $("test-arc-log");
    if (testLog) {
      testLog.onpointerdown = (e) => e.stopPropagation();
      testLog.onclick = (e) => e.stopPropagation();
      testLog.onkeydown = (e) => e.stopPropagation();
      testLog.oninput = (e) => {
        e.stopPropagation();
        testLogDraft = testLog.value;
        testLogHold = true;
      };
    }
    const testCopy = $("test-copy-log");
    if (testCopy) testCopy.onclick = (e) => {
      e.stopPropagation();
      const ta = $("test-arc-log");
      const text = ta ? ta.value : "";
      const done = () => {
        testCopy.textContent = t("testCopied");
        setTimeout(() => { if ($("test-copy-log")) $("test-copy-log").textContent = t("testCopy"); }, 1400);
      };
      const fallback = () => {
        try {
          if (ta) { ta.focus(); ta.select(); document.execCommand("copy"); }
        } catch (err) {}
        done();
      };
      if (navigator.clipboard && navigator.clipboard.writeText) {
        navigator.clipboard.writeText(text).then(done).catch(fallback);
      } else fallback();
    };
    const testGrant = $("test-grant");
    if (testGrant) testGrant.onclick = (e) => {
      e.stopPropagation();
      const sel = $("test-perk");
      testGrantPerk(sel ? sel.value : S.testPerkPick);
      renderOverlay();
    };
    const testForceGo = $("test-force-go");
    if (testForceGo) testForceGo.onclick = (e) => {
      e.stopPropagation();
      const sel = $("test-force");
      const id = sel ? sel.value : "";
      if (!id || S.ranked) return;
      if (S.phase !== "paused" || S.optBack !== "play") {
        const n = $("test-force-note");
        if (n) n.textContent = chanceLang() ? "Empieza la partida y vuelve a abrir Opciones." : "Start the run, then reopen Options.";
        return;
      }
      // test-only: show the chosen card now, even if it was already seen this run
      if (S.chanceUsed) delete S.chanceUsed[id];
      S.optPanel = null;
      setPhase("play");
      window.__arcForce = id;
      try { dealChance(); } finally { window.__arcForce = ""; }
      renderOverlay();
    };
    const testArcSet = $("test-arc-set");
    const testArcInp = $("test-arc-n");
    const pushArc = () => {
      testSetArcEvery(testArcInp ? testArcInp.value : 0);
      const st = $("test-arc-status");
      if (st) st.textContent = testArcStatus();
    };
    if (testArcInp) testArcInp.oninput = (e) => { e.stopPropagation(); pushArc(); };
    if (testArcSet) testArcSet.onclick = (e) => { e.stopPropagation(); pushArc(); };
    const testAdd = $("test-add");
    if (testAdd) testAdd.onclick = (e) => {
      e.stopPropagation();
      const inp = $("test-money");
      const cur = $("test-cur");
      testAddMoney(inp ? inp.value : 0, cur ? cur.value : "usd");
      renderOverlay();
    };
    const testPre = $("test-preindep");
    if (testPre) testPre.onclick = (e) => { e.stopPropagation(); testPreIndependence(); };
    overlay.querySelectorAll("[data-battle]").forEach((btn) => {
      btn.onclick = (e) => {
        e.stopPropagation();
        const id = btn.getAttribute("data-battle");
        S.testBattle = id === "easy" || id === "hard" ? id : "mod";
        renderOverlay();
      };
    });
    const testPerkSel = $("test-perk");
    if (testPerkSel) testPerkSel.onchange = (e) => { e.stopPropagation(); S.testPerkPick = testPerkSel.value; };
    const testCur = $("test-cur");
    if (testCur) testCur.onchange = (e) => { e.stopPropagation(); S.testCur = testCur.value; renderOverlay(); };
    overlay.querySelectorAll("[data-pal]").forEach((btn) => {
      btn.onclick = (e) => {
        e.stopPropagation();
        applyPalette(btn.getAttribute("data-pal"));
        setHero(btn.getAttribute("data-pal"), false);
        renderOverlay();
      };
    });
    const togGain = $("tog-gain");
    if (togGain) togGain.onclick = (e) => { e.stopPropagation(); setShowGain(!SHOW_GAIN); renderOverlay(); };
    const togTrade = $("tog-trade");
    if (togTrade) togTrade.onclick = (e) => { e.stopPropagation(); setShowTrade(!SHOW_TRADE); renderOverlay(); };
    const heroTog = $("hero-tog") || $("hero-prev");
    if (heroTog) {
      heroTog.onpointerdown = (e) => {
        e.stopPropagation();
        e.preventDefault();
        const skin = HERO_SKIN || currentPaletteId();
        setHero(skin, !HERO_ANIM);
      };
    }
  }

  function mpRosterHtml() {
    const list = (window.ChoppyMP && window.ChoppyMP.players()) || [];
    if (!list.length) return "<p class=\"k\">—</p>";
    return "<ul class=\"mp-list\">" + list.map((p) => {
      const you = window.ChoppyMP && p.id === window.ChoppyMP.id();
      const dead = p.alive === false;
      const h = heroOf(p.slot || 0);
      const ready = p.ready ? " · " + t("mpReady") : "";
      const glyphs = { btc: "₿", usdt: "₮", eth: "Ξ", bch: "₿", xrp: "X", bnb: "B", sol: "S", trx: "T" };
      const glyph = glyphs[h.mark] || "₿";
      return "<li class=\"" + (dead ? "out" : "") + "\"><span class=\"hero-dot\" style=\"background:" + h.fill + ";color:" + h.ink + "\">" + glyph + "</span>"
        + (p.name || "?") + (you ? " · " + t("mpYou") : "") + (p.host ? " · host" : "")
        + (dead ? " · " + t("mpDead") : ready) + eloBit(p) + "</li>";
    }).join("") + "</ul>";
  }
  function eloBit(p) {
    const bag = S.mpElo;
    if (Array.isArray(bag) && p.uid) {
      const row = bag.find((r) => r.id === p.uid);
      if (row && row.elo != null) return " · " + Math.round(row.elo);
    }
    return p.uid ? "" : " · guest";
  }
  function mpRulesNow() {
    return S.mpRules || (window.ChoppyMP && window.ChoppyMP.rules && window.ChoppyMP.rules()) || {
      startCold: 0, msig: 0, bull: 38, bear: 22, laser: 10, swan: 20, cold: 10,
      mode: "last", raceN: 21, bestOf: 1,
      muteTheme: false, muteSfx: false, muteVoice: false
    };
  }
  function mpMixTotal(r) {
    r = r || mpRulesNow();
    return (r.bull | 0) + (r.bear | 0) + (r.laser | 0) + (r.swan | 0) + (r.cold | 0);
  }
  function mpFocusPlayer() {
    const list = (window.ChoppyMP && window.ChoppyMP.players && window.ChoppyMP.players()) || [];
    if (!list.length) return null;
    if (S.mpWinner && S.mpWinner.id) {
      const w = list.find((p) => p.id === S.mpWinner.id);
      if (w) return w;
    }
    const mode = (S.mpRules && S.mpRules.mode) || "last";
    if (mode === "whale") {
      return list.slice().sort((a, b) => (Number(b.btc) || 0) - (Number(a.btc) || 0))[0];
    }
    if (mode === "race") {
      const fin = list.filter((p) => p.finished).sort((a, b) => (Number(a.finishT) || 0) - (Number(b.finishT) || 0))[0];
      if (fin) return fin;
      return list.filter((p) => p.alive !== false).sort((a, b) => (Number(b.candles) || 0) - (Number(a.candles) || 0))[0] || list[0];
    }
    const live = list.filter((p) => p.alive !== false && !p.finished);
    return live.slice().sort((a, b) => (Number(b.lifeT) || 0) - (Number(a.lifeT) || 0) || (Number(b.candles) || 0) - (Number(a.candles) || 0))[0] || list[0];
  }
  function mpFinishRace() {
    if (!S.mp || S.finished || S.dead) return;
    S.finished = true;
    try { snapshotRun(); } catch (e) {}
    try {
      if (window.ChoppyMP && window.ChoppyMP.finish) {
        window.ChoppyMP.finish({
          candles: S.candles, lifeT: S.lifeT, btc: S.btc, finishT: S.lifeT,
          x: S.bird.x, y: S.bird.y, v: S.bird.v
        });
      }
    } catch (e) {}
    const foc = mpFocusPlayer();
    const me = window.ChoppyMP && window.ChoppyMP.id();
    if (foc && foc.id !== me) S.spectate = true;
    renderHud();
    renderOverlay();
  }
  function mpRulesHtml() {
    const r = mpRulesNow();
    const host = !!(window.ChoppyMP && window.ChoppyMP.get && window.ChoppyMP.get().host);
    const dis = host ? "" : " disabled";
    const sum = mpMixTotal(r);
    const open = S.mpRulesOpen === false ? "" : " open";
    const mode = r.mode || "last";
    const raceHide = mode === "race" ? "" : " hide";
    const radio = (val, lab) =>
      "<label class=\"mp-mode" + (mode === val ? " on" : "") + "\"><input type=\"radio\" name=\"mp-mode\" value=\"" + val + "\""
      + (mode === val ? " checked" : "") + dis + "> " + lab + "</label>";
    return "<details class=\"mp-rules\"" + open + "><summary>" + t("mpRules") + (host ? "" : " · view") + "</summary>"
      + "<div class=\"mp-modes\">"
      + radio("last", t("mpLast"))
      + radio("whale", t("mpWhale"))
      + radio("race", t("mpRace"))
      + "</div>"
      + "<div class=\"mp-rule" + raceHide + "\" id=\"mp-race-row\"><span>" + t("mpRaceN") + "</span><input type=\"number\" id=\"mp-race-n\" min=\"5\" max=\"210\" value=\"" + (r.raceN | 0 || 21) + "\"" + dis + "></div>"
      + "<div class=\"mp-rule\"><span>" + t("mpBestOf") + "</span><select id=\"mp-bestof\"" + dis + ">"
      + [1, 3, 5, 7].map((n) => "<option value=\"" + n + "\"" + ((r.bestOf | 0) === n ? " selected" : "") + ">" + n + "</option>").join("")
      + "</select></div>"
      + "<div class=\"mp-rule\"><span>" + t("mpCold0") + "</span><input type=\"number\" id=\"mp-cold\" min=\"0\" max=\"99\" value=\"" + (r.startCold | 0) + "\"" + dis + "></div>"
      + "<p class=\"k mp-mix-sum" + (sum !== 100 ? " bad" : "") + "\" id=\"mp-mix-sum\">" + t("mpMix") + " · " + Math.round(sum) + (sum !== 100 ? " · " + t("mpMixNeed") : "") + "</p>"
      + "<div class=\"mp-w\">"
      + "<label>" + t("mpBull") + "</label><input type=\"number\" id=\"mp-w-bull\" min=\"0\" max=\"100\" value=\"" + (r.bull | 0) + "\"" + dis + ">"
      + "<label>" + t("mpBear") + "</label><input type=\"number\" id=\"mp-w-bear\" min=\"0\" max=\"100\" value=\"" + (r.bear | 0) + "\"" + dis + ">"
      + "<label>" + t("mpLaserW") + "</label><input type=\"number\" id=\"mp-w-laser\" min=\"0\" max=\"100\" value=\"" + (r.laser | 0) + "\"" + dis + ">"
      + "<label>" + t("mpSwanW") + "</label><input type=\"number\" id=\"mp-w-swan\" min=\"0\" max=\"100\" value=\"" + (r.swan | 0) + "\"" + dis + ">"
      + "<label>" + t("mpColdW") + "</label><input type=\"number\" id=\"mp-w-cold\" min=\"0\" max=\"100\" value=\"" + (r.cold | 0) + "\"" + dis + ">"
      + "</div>"
      + "<div class=\"mute-row\" style=\"margin-top:8px\">"
      + "<button type=\"button\" class=\"mute-tog" + (r.muteTheme ? " on" : "") + "\" id=\"mp-mute-theme\"" + (host ? "" : " disabled") + ">" + t("bullSongs") + " " + (r.muteTheme ? t("soundOff") : t("soundOn")) + "</button>"
      + "<button type=\"button\" class=\"mute-tog" + (r.muteSfx ? " on" : "") + "\" id=\"mp-mute-sfx\"" + (host ? "" : " disabled") + ">" + t("gameFx") + " " + (r.muteSfx ? t("soundOff") : t("soundOn")) + "</button>"
      + "<button type=\"button\" class=\"mute-tog" + (r.muteVoice ? " on" : "") + "\" id=\"mp-mute-voice\"" + (host ? "" : " disabled") + ">" + t("voices") + " " + (r.muteVoice ? t("soundOff") : t("soundOn")) + "</button>"
      + "</div></details>";
  }
  function readMpRulesForm() {
    const num = (id, d) => {
      const el = $(id);
      const v = el ? Number(el.value) : d;
      return isFinite(v) ? v : d;
    };
    const r = mpRulesNow();
    let mode = r.mode || "last";
    const picked = overlay && overlay.querySelector && overlay.querySelector("input[name=\"mp-mode\"]:checked");
    if (picked) mode = picked.value;
    const boEl = $("mp-bestof");
    const bestOf = boEl ? (Number(boEl.value) || 1) : (r.bestOf || 1);
    return {
      startCold: Math.max(0, Math.min(99, num("mp-cold", r.startCold) | 0)),
      msig: 0,
      bull: Math.max(0, Math.min(100, num("mp-w-bull", r.bull) | 0)),
      bear: Math.max(0, Math.min(100, num("mp-w-bear", r.bear) | 0)),
      laser: Math.max(0, Math.min(100, num("mp-w-laser", r.laser) | 0)),
      swan: Math.max(0, Math.min(100, num("mp-w-swan", r.swan) | 0)),
      cold: Math.max(0, Math.min(100, num("mp-w-cold", r.cold) | 0)),
      mode: mode === "whale" || mode === "race" ? mode : "last",
      raceN: Math.max(5, Math.min(210, num("mp-race-n", r.raceN) | 0)),
      bestOf: bestOf === 3 || bestOf === 5 || bestOf === 7 ? bestOf : 1,
      muteTheme: !!(r.muteTheme),
      muteSfx: !!(r.muteSfx),
      muteVoice: !!(r.muteVoice)
    };
  }
  function pushHostRules(extra) {
    if (!window.ChoppyMP || !window.ChoppyMP.get().host) return;
    const r = Object.assign(readMpRulesForm(), extra || {});
    S.mpRules = r;
    window.ChoppyMP.setRules(r);
  }
  function mpLobbyHtml() {
    const mp = window.ChoppyMP && window.ChoppyMP.get();
    const code = (mp && mp.code) || "----";
    const n = ((mp && mp.players) || []).length;
    const host = !!(mp && mp.host);
    const ready = !!(mp && mp.ready);
    const all = !!(window.ChoppyMP && window.ChoppyMP.allReady && window.ChoppyMP.allReady());
    const mix = mpRulesNow();
    const mixSum = mpMixTotal(mix);
    const canStart = host && n >= 2 && all && mixSum === 100;
    const err = S.mpErr ? "<p class=\"k\">" + S.mpErr + "</p>" : "";
    if (!mp || !mp.code) {
      return "<h1>" + t("versus") + " · " + t("mpAlpha") + "</h1><p class=\"k\">" + t("mpAlphaNote") + " <a href=\"mailto:versus@bitcoinizate.com\">versus@bitcoinizate.com</a></p><p class=\"k\">" + t("mpNote") + "</p>"
        + "<button class=\"cta mp-cta\" id=\"mp-host\">" + t("mpHost") + "</button>"
        + "<div class=\"mp-join\"><input id=\"mp-code\" maxlength=\"6\" placeholder=\"CODE\" value=\"" + (S.mpJoinCode || "") + "\" autocomplete=\"off\">"
        + "<button class=\"cta play-alt\" id=\"mp-join\">" + t("mpJoin") + "</button></div>"
        + err
        + "<button class=\"cta play-alt mp-cta\" id=\"mp-back\">" + t("mpBack") + "</button>";
    }
    return "<h1>" + t("versus") + "</h1><p class=\"k\">" + t("mpCode") + " <b id=\"mp-code-lab\">" + code + "</b></p>"
      + "<button class=\"cta play-alt mp-cta\" id=\"mp-copy\">" + t("mpCopy") + "</button>"
      + "<p class=\"k\">" + n + "/8 · " + (mix.mode === "whale" ? t("mpWhale") : mix.mode === "race" ? t("mpRace") : t("mpLast"))
      + (mix.bestOf > 1 ? " · " + t("mpBestOf") + " " + mix.bestOf : "") + "</p>"
      + mpRosterHtml()
      + (n < 2 ? "<p class=\"k\">" + t("mpNeed") + "</p>" : (all ? (mixSum === 100 ? "" : "<p class=\"k\">" + t("mpMixNeed") + "</p>") : "<p class=\"k\">" + t("mpNeedReady") + "</p>"))
      + err
      + (host
        ? "<button class=\"cta mp-cta\" id=\"mp-start\"" + (canStart ? "" : " disabled") + ">" + t("mpStart") + "</button>"
        : "<button class=\"cta mp-cta\" id=\"mp-ready\">" + (ready ? t("mpUnready") : t("mpReady")) + "</button>")
      + mpRulesHtml()
      + "<button class=\"cta play-alt mp-cta\" id=\"mp-back\">" + t("mpBack") + "</button>";
  }
  function bindMpLobby() {
    if ($("mp-host")) $("mp-host").onclick = (e) => { e.stopPropagation(); S.mpErr = ""; if (window.ChoppyMP) window.ChoppyMP.host(); };
    if ($("mp-join")) $("mp-join").onclick = (e) => {
      e.stopPropagation();
      const inp = $("mp-code");
      S.mpJoinCode = inp ? inp.value : "";
      S.mpErr = "";
      if (window.ChoppyMP) window.ChoppyMP.join(S.mpJoinCode);
    };
    if ($("mp-ready")) $("mp-ready").onclick = (e) => {
      e.stopPropagation();
      const mp = window.ChoppyMP && window.ChoppyMP.get();
      if (window.ChoppyMP && window.ChoppyMP.setReady) window.ChoppyMP.setReady(!(mp && mp.ready));
    };
    if ($("mp-start")) $("mp-start").onclick = (e) => {
      e.stopPropagation();
      const r = readMpRulesForm();
      const sum = mpMixTotal(r);
      if (sum !== 100) { S.mpErr = t("mpMixNeed"); renderOverlay(); return; }
      pushHostRules();
      if (window.ChoppyMP) {
        if (window.ChoppyMP.setReady) window.ChoppyMP.setReady(true);
        window.ChoppyMP.start({ rules: r });
      }
    };
    const rulesEl = overlay && overlay.querySelector && overlay.querySelector("details.mp-rules");
    if (rulesEl) rulesEl.ontoggle = () => { S.mpRulesOpen = !!rulesEl.open; };
    const paintMix = () => {
      const r = readMpRulesForm();
      const sum = mpMixTotal(r);
      const el = $("mp-mix-sum");
      if (el) {
        el.textContent = t("mpMix") + " · " + sum + (sum !== 100 ? " · " + t("mpMixNeed") : "");
        el.classList.toggle("bad", sum !== 100);
      }
      const start = $("mp-start");
      if (start) {
        const all = window.ChoppyMP && window.ChoppyMP.allReady && window.ChoppyMP.allReady();
        const n = ((window.ChoppyMP && window.ChoppyMP.players && window.ChoppyMP.players()) || []).length;
        start.disabled = !all || sum !== 100 || n < 2;
      }
      const row = $("mp-race-row");
      if (row) row.classList.toggle("hide", r.mode !== "race");
      overlay.querySelectorAll(".mp-mode").forEach((lab) => {
        const inp = lab.querySelector("input");
        lab.classList.toggle("on", !!(inp && inp.checked));
      });
    };
    if ($("mp-copy")) $("mp-copy").onclick = (e) => {
      e.stopPropagation();
      const c = window.ChoppyMP && window.ChoppyMP.code();
      const btn = $("mp-copy");
      const done = () => {
        if (!btn) return;
        btn.textContent = t("mpCopied");
        setTimeout(() => { if ($("mp-copy")) $("mp-copy").textContent = t("mpCopy"); }, 1400);
      };
      if (c && navigator.clipboard && navigator.clipboard.writeText) {
        navigator.clipboard.writeText(c).then(done).catch(() => { try { done(); } catch (err) {} });
      }
    };
    if ($("mp-back")) $("mp-back").onclick = (e) => { e.stopPropagation(); leaveMp(); };
    const inp = $("mp-code");
    if (inp) {
      inp.oninput = () => {
        inp.value = String(inp.value || "").toUpperCase().replace(/[^A-Z0-9]/g, "").slice(0, 6);
        S.mpJoinCode = inp.value;
      };
      inp.onkeydown = (e) => { if (e.key === "Enter" && $("mp-join")) $("mp-join").click(); };
    }
    ["mp-cold", "mp-w-bull", "mp-w-bear", "mp-w-laser", "mp-w-swan", "mp-w-cold", "mp-race-n", "mp-bestof"].forEach((id) => {
      const el = $(id);
      if (!el) return;
      el.oninput = () => { pushHostRules(); paintMix(); };
      el.onchange = () => { pushHostRules(); paintMix(); };
    });
    overlay.querySelectorAll("input[name=\"mp-mode\"]").forEach((inp) => {
      inp.onchange = () => { pushHostRules(); paintMix(); };
    });
    const bindMute = (id, key) => {
      const el = $(id);
      if (!el) return;
      el.onclick = (e) => {
        e.stopPropagation();
        const r = mpRulesNow();
        r[key] = !r[key];
        pushHostRules(r);
        if (window.ChoppyMP && window.ChoppyMP.get().host) applyMpSound(r);
      };
    };
    bindMute("mp-mute-theme", "muteTheme");
    bindMute("mp-mute-sfx", "muteSfx");
    bindMute("mp-mute-voice", "muteVoice");
  }
  function applyMpSound(r) {
    if (!A) return;
    try { if (A.setMuteTheme) A.setMuteTheme(!!r.muteTheme); } catch (e) {}
    try { if (A.setMuteSfx) A.setMuteSfx(!!r.muteSfx); } catch (e) {}
    try { if (A.setMuteVoice) A.setMuteVoice(!!r.muteVoice); } catch (e) {}
  }
  function mpWaitHtml() {
    return mpSpecHtml();
  }
  function mpSpecHtml() {
    const foc = mpFocusPlayer() || S.mpWinner || {};
    const mine = window.ChoppyMP && window.ChoppyMP.id();
    const win = S.mpWinner || {};
    const last = !!S.mpSeriesOver;
    const left = S.mpNextAt ? Math.max(0, Math.ceil((S.mpNextAt - Date.now()) / 1000)) : 0;
    const title = S.mpRoundOver
      ? (win.id === mine ? t("mpYouWin") : ((win.name || foc.name || "?") + " " + t("mpWins")))
      : (t("mpSpec") + " · " + (foc.name || ""));
    const bo = (S.mpRules && S.mpRules.bestOf) || 1;
    const series = bo > 1
      ? "<p class=\"k\">" + t("mpSeries") + " " + (S.mpGameN || 1) + "/" + bo + (S.mpEloNote ? " · " + S.mpEloNote : "") + "</p>"
      : (S.mpEloNote ? "<p class=\"k\">" + S.mpEloNote + "</p>" : "");
    const pool = last ? ((window.ChoppyMP && window.ChoppyMP.players && window.ChoppyMP.players()) || []).filter((p) => !p.gone) : [];
    const votes = pool.filter((p) => p.rematch).length;
    const voteN = pool.length;
    const timer = S.mpRoundOver && left
      ? "<p class=\"k\">" + (last ? t("mpRematch") + (voteN ? " " + votes + "/" + voteN : "") : t("mpNext")) + " · " + left + "s</p>"
      : "";
    return "<p class=\"k\">" + title + "</p>" + series + timer
      + "<div class=\"overlay-actions\">"
      + "<button type=\"button\" class=\"cta play-alt\" id=\"mp-quit\">" + t("mpQuit") + "</button>"
      + "<button type=\"button\" class=\"cta play-alt\" id=\"mp-stats\">" + t("runStats") + "</button>"
      + (last ? "<button type=\"button\" class=\"cta" + (S.mpRematchOn ? " on" : "") + "\" id=\"mp-rematch\">" + t("mpRematch") + "</button>" : "")
      + "</div>";
  }
  function bindMpSpec() {
    if ($("mp-quit")) $("mp-quit").onclick = (e) => { e.stopPropagation(); leaveMp(); };
    if ($("mp-stats")) $("mp-stats").onclick = (e) => {
      e.stopPropagation();
      if (!S.stats) try { snapshotRun(); } catch (err) {}
      S.runTab = "stats";
      renderOverlay();
    };
    if ($("mp-rematch")) $("mp-rematch").onclick = (e) => {
      e.stopPropagation();
      S.mpRematchOn = !S.mpRematchOn;
      if (window.ChoppyMP && window.ChoppyMP.setRematch) window.ChoppyMP.setRematch(S.mpRematchOn);
      renderOverlay();
    };
  }
  function mpWinHtml() {
    const w = S.mpWinner || {};
    const mine = window.ChoppyMP && w.id === window.ChoppyMP.id();
    const host = window.ChoppyMP && window.ChoppyMP.get().host;
    return "<p class=\"k\">" + t("versus") + "</p><h1>" + (mine ? t("mpYouWin") : (w.name || "?") + " " + t("mpWins")) + "</h1>"
      + (S.mpEloNote ? "<p class=\"k\">" + S.mpEloNote + "</p>" : "")
      + mpRosterHtml()
      + "<div class=\"overlay-actions\">"
      + (host ? "<button class=\"cta\" id=\"mp-again\">" + t("mpReady") + "</button>" : "")
      + "<button class=\"cta play-alt\" id=\"go\">" + t("mpBack") + "</button></div>";
  }
  function openMpLobby() {
    S.mpErr = "";
    S.mp = false;
    setPhase("mplobby");
  }
  function playAtFromGo(data) {
    const now = Date.now();
    if (data && data.sentAt && data.startAt) {
      const delay = data.startAt - data.sentAt;
      return now + Math.max(900, Math.min(5000, delay));
    }
    if (data && data.startAt) {
      const remain = data.startAt - now;
      if (remain > 500 && remain < 8000) return data.startAt;
    }
    return now + 3200;
  }
  function beginMpCountdown(data) {
    S.mp = true;
    S.mpOver = false;
    S.mpRoundOver = false;
    S.mpSeriesOver = false;
    S.mpWinner = null;
    S.spectate = false;
    S.finished = false;
    S.mpRematchOn = false;
    S.mpNextAt = 0;
    S.runTab = null;
    S.worldSeed = (data && data.seed) >>> 0 || 1;
    S.mpRules = (data && data.rules) || mpRulesNow();
    S.mpPlayAt = playAtFromGo(data);
    S.mpSlot = (window.ChoppyMP && window.ChoppyMP.slot && window.ChoppyMP.slot()) || 0;
    S.mpSeriesWins = (data && data.wins) || (window.ChoppyMP && window.ChoppyMP.wins && window.ChoppyMP.wins()) || {};
    S.mpGameN = (data && data.gameN) || (window.ChoppyMP && window.ChoppyMP.gameN && window.ChoppyMP.gameN()) || 1;
    S.ranked = false;
    applyMpSound(S.mpRules);
    resetWorld(false);
    S.dead = false;
    S.countN = 3;
    setPhase("count");
  }
  function startMpPlay() {
    if (!S.mp || S.phase === "play") return;
    S.dead = false;
    S.phase = "play";
    if (field) field.classList.add("is-play");
    if (overlay) hideOverlay();
    if (A && A.startMusic) kickTheme();
    renderHud();
  }
  function startMpMatch(seed) {
    beginMpCountdown({ seed: seed, startAt: Date.now() + 3200, rules: mpRulesNow() });
  }
  function reportMpElo() {
    S.mpElo = null;
    S.mpEloNote = "";
    const list = (window.ChoppyMP && window.ChoppyMP.players()) || [];
    const uids = [];
    list.forEach((p) => { if (p.uid && uids.indexOf(p.uid) < 0) uids.push(p.uid); });
    const w = S.mpWinner || {};
    if (!w.uid || uids.length < 2) {
      S.mpEloNote = t("eloGuest");
      return;
    }
    if (typeof window.submitVersusResult !== "function") {
      S.mpEloNote = t("eloGuest");
      return;
    }
    Promise.resolve(window.submitVersusResult(S.worldSeed, w.uid, uids)).then((rows) => {
      if (Array.isArray(rows) && rows.length) {
        S.mpElo = rows;
        S.mpEloNote = t("eloUpdated");
      } else S.mpEloNote = t("eloPending");
      if (S.phase === "mpwin" || S.mpRoundOver) renderOverlay();
    }).catch(() => {
      S.mpEloNote = t("eloPending");
      if (S.phase === "mpwin" || S.mpRoundOver) renderOverlay();
    });
  }
  function leaveMp() {
    try { if (window.ChoppyMP) window.ChoppyMP.leave(); } catch (e) {}
    S.mp = false; S.mpOver = false; S.mpRoundOver = false; S.worldSeed = 0; S.worldRand = null; S.mpWinner = null; S.mpElo = null; S.mpEloNote = "";
    S.mpRules = null; S.mpPlayAt = 0; S.dead = false; S.spectate = false; S.finished = false; S.mpNextAt = 0; S.mpRematchOn = false; S.runTab = null;
    const app = $("app");
    if (app) app.classList.remove("vs-on");
    setPhase("ready");
  }
  function wireMp() {
    if (!window.ChoppyMP) return;
    window.ChoppyMP.setHandler((ev, data) => {
      const typing = () => {
        const ae = document.activeElement;
        return !!(ae && overlay && overlay.contains(ae) && (ae.tagName === "INPUT" || ae.tagName === "TEXTAREA"));
      };
      if (ev === "lobby" || ev === "roster") {
        if (S.phase === "mplobby" || S.phase === "mpwait") {
          if (!typing()) renderOverlay();
        }
        else if (S.phase === "play" || S.phase === "count") {
          renderHud();
          if (S.phase === "play" && (S.spectate || S.mpRoundOver) && !S.runTab) renderOverlay();
        }
      } else if (ev === "rules") {
        S.mpRules = data || S.mpRules;
        if (S.phase === "mplobby" && !typing()) renderOverlay();
      } else if (ev === "reset") {
        S.mpOver = false;
        S.mpRoundOver = false;
        S.mp = false;
        S.dead = false;
        S.spectate = false;
        S.finished = false;
        S.mpPlayAt = 0;
        S.mpNextAt = 0;
        setPhase("mplobby");
      } else if (ev === "dropped") {
        leaveMp();
      } else if (ev === "go") {
        const ids = ((data && data.players) || []).map((p) => p.id);
        if (ids.length && window.ChoppyMP && ids.indexOf(window.ChoppyMP.id()) < 0) {
          leaveMp();
          return;
        }
        if (S.phase === "count" && S.worldSeed && data && ((data.seed >>> 0) === S.worldSeed)) return;
        beginMpCountdown(data || {});
      } else if (ev === "lead") {
        S.mpWinner = data && data.winner;
        if (S.phase === "play") {
          renderHud();
          if (S.spectate || S.mpRoundOver) renderOverlay();
        }
      } else if (ev === "over") {
        if (S.mpRoundOver) return;
        S.mpRoundOver = true;
        S.mpOver = true;
        S.mpWinner = data && data.winner;
        S.mpSeriesWins = (data && data.wins) || S.mpSeriesWins || {};
        S.mpGameN = (data && data.gameN) || S.mpGameN || 1;
        S.mpSeriesOver = !!(data && data.seriesOver);
        S.mpNextAt = Date.now() + Math.max(4000, (data && data.waitMs) || (S.mpSeriesOver ? 12000 : 8000));
        const me = window.ChoppyMP && window.ChoppyMP.id();
        if (S.mpWinner && me && S.mpWinner.id !== me) S.spectate = true;
        if (S.mpSeriesOver) reportMpElo();
        renderHud();
        renderOverlay();
      } else if (ev === "err") {
        S.mpErr = data === "need 2" ? t("mpNeed") : data === "not ready" ? t("mpNeedReady") : data === "full" ? t("mpFull") : data === "mix" ? t("mpMixNeed") : String(data || "error");
        if (S.phase === "mplobby") renderOverlay();
      }
    });
  }

  function showOverlay() {
    overlay.classList.remove("hide");
    overlay.classList.add("open");
    overlay.style.setProperty("display", "flex", "important");
    overlay.style.setProperty("pointer-events", "auto", "important");
  }
  function hideOverlay() {
    overlay.classList.add("hide");
    overlay.classList.remove("open");
    overlay.style.setProperty("display", "none", "important");
    overlay.style.pointerEvents = "none";
    overlay.innerHTML = "";
  }

  function renderOverlay() {
    costAsBtc = null;
    const p = S.phase;
    if (p === "defense") {
      hideOverlay();
      overlay.classList.remove("chance-ui", "dock", "juke-ui", "mp-ui", "mp-spec", "fest-ui", "battle-report", "opt-ui");
      return;
    }
    if (p === "play") {
      if (S.mp && (S.spectate || S.mpRoundOver || S.finished)) {
        showOverlay();
        overlay.classList.add("dock", "mp-spec");
        overlay.classList.remove("mp-ui", "chance-ui", "juke-ui", "opt-ui");
        if (S.runTab) {
          overlay.innerHTML = runRecapHtml();
          bindRunRecap();
        } else {
          overlay.innerHTML = mpSpecHtml();
          bindMpSpec();
        }
        return;
      }
      hideOverlay();
      overlay.classList.remove("mp-spec", "dock", "fest-ui", "battle-report", "opt-ui");
      return;
    }
    overlay.classList.remove("mp-spec");
    showOverlay();
    overlay.classList.toggle("dock", p === "perk" || p === "paused" || p === "chance");
    overlay.classList.toggle("mp-ui", p === "mplobby" || p === "mpwait" || p === "mpwin");
    overlay.classList.toggle("chance-ui", p === "chance");
    const battleSheet = p === "chance" && !S.optPanel && !!(S.bcDefense && S.bcDefense.frozen) && !!(S.chanceCard && (S.chanceCard.id === "battleWon" || S.chanceCard.id === "blocTriumph"));
    overlay.classList.toggle("fest-ui", false);
    overlay.classList.toggle("battle-report", battleSheet);
    overlay.classList.toggle("juke-ui", (p === "paused" || p === "ready" || p === "perk" || p === "chance") && S.optPanel === "juke");
    overlay.classList.toggle("test-ui", S.optPanel === "test");
    overlay.classList.toggle("gfx-ui", S.optPanel === "gfx");
    const optName = S.optPanel || "";
    const optMenuOpen = optName === "menu" || optName === "lang" || optName === "sound" || optName === "game" || (p === "paused" && !optName && !(S.arcHold && !S.optPanel));
    overlay.classList.toggle("opt-ui", optMenuOpen);
    if (p === "ready") {
      if (S.optPanel) {
        overlay.innerHTML = pauseMarkup();
        bindPauseUi();
      } else {
        overlay.innerHTML = "<h1>Choppy Bitcoin</h1>"
          + "<button class=\"cta\" id=\"go\">" + t("ranked") + "</button>"
          + "<p class=\"k\">" + t("playSub") + "</p>"
          + "<button type=\"button\" class=\"cta play-alt\" id=\"go-train\">" + t("training") + "</button>"
          + "<p class=\"k\">" + t("trainNote") + "</p>"
          + "<button type=\"button\" class=\"cta play-alt\" id=\"go-mp\">" + t("versus") + "<small class=\"alpha-tag\">" + t("mpAlpha") + "</small></button>"
          + "<p class=\"k\">" + t("mpAlphaNote") + " <a href=\"mailto:versus@bitcoinizate.com\">versus@bitcoinizate.com</a></p>"
          + (window.choppySignedIn ? "" : "<button type=\"button\" class=\"cta play-alt\" id=\"overlay-auth\">" + t("signIn") + "</button>")
          + tutorialBody()
          + awardListHtml(loadAwards(), "full")
          + "<h3 class=\"k\">" + t("boardBtc") + "</h3><pre id=\"ready-board\" class=\"board\">—</pre>"
          + "<h3 class=\"k\">" + t("boardInd") + "</h3><pre id=\"ready-indep\" class=\"board\">—</pre>"
          + donateBlock();
        $("go").onclick = () => startGame(true);
        $("go").onpointerdown = (e) => { e.stopPropagation(); startGame(true); };
        if ($("go-train")) {
          $("go-train").onclick = () => startGame(false);
          $("go-train").onpointerdown = (e) => { e.stopPropagation(); startGame(false); };
        }
        const mpGo = $("go-mp");
        if (mpGo) {
          mpGo.onclick = () => openMpLobby();
          mpGo.onpointerdown = (e) => { e.stopPropagation(); openMpLobby(); };
        }
        const oa = $("overlay-auth");
        if (oa) oa.onclick = (e) => { e.stopPropagation(); if (window.openAuth) window.openAuth(); };
        if (window.refreshLeaderboard) window.refreshLeaderboard("ready-board");
      }
    } else if (p === "mplobby") {
      overlay.innerHTML = mpLobbyHtml();
      const mpCodeIn = $("mp-code");
      if (mpCodeIn) mpCodeIn.setAttribute("place" + "holder", chanceLang() ? "CÓDIGO" : "CODE");
      bindMpLobby();
    } else if (p === "mpwait") {
      overlay.innerHTML = mpSpecHtml();
      bindMpSpec();
    } else if (p === "mpwin") {
      overlay.innerHTML = mpWinHtml();
      if ($("go")) $("go").onclick = (e) => { e.stopPropagation(); leaveMp(); };
      if ($("mp-again") && window.ChoppyMP && window.ChoppyMP.get().host) {
        $("mp-again").onclick = (e) => {
          e.stopPropagation();
          S.mpOver = false;
          if (window.ChoppyMP.resetLobby) window.ChoppyMP.resetLobby();
          setPhase("mplobby");
        };
      }
    } else if (p === "count") {
      overlay.innerHTML = "<p class=\"count\">" + S.countN + "</p>";
    } else if (p === "chance") {
      if (S.bcNameAsk) {
        overlay.classList.remove("chance-options");
        const esN = chanceLang();
        overlay.innerHTML = "<h1>" + (esN ? "El nombre" : "The name") + "</h1>"
          + "<p class=\"arc-title\">" + (esN ? "¿Cómo se llama el país?" : "What is the country called?") + "</p>"
          + "<p class=\"arc-body\">" + (esN
            ? "Ese nombre queda en la declaración, en las respuestas y en las cartas que siguen."
            : "That name stays on the declaration, the replies, and the cards that follow.") + "</p>"
          + "<form id=\"bc-name-form\" class=\"nation-ask\" autocomplete=\"off\">"
          + "<input id=\"bc-name-in\" maxlength=\"24\" autocomplete=\"off\" spellcheck=\"false\" placeholder=\"" + (esN ? "País Bitcoin" : "Bitcoin Country") + "\">"
          + "<button type=\"submit\" class=\"cta\">" + (esN ? "Declarar" : "Declare") + "</button>"
          + "</form>";
        const nameForm = $("bc-name-form");
        const nameIn = $("bc-name-in");
        if (nameIn) setTimeout(() => { try { nameIn.focus(); } catch (e) {} }, 40);
        if (nameForm) nameForm.onsubmit = (e) => {
          e.preventDefault();
          e.stopPropagation();
          commitCountryName(nameIn ? nameIn.value : "");
        };
        return;
      }
      if (S.optPanel && S.optPanel !== "off") {
        overlay.classList.add("chance-options");
        overlay.innerHTML = "<div class=\"chance-options-sheet\">" + pauseMarkup() + "</div>";
        bindPauseUi();
        return;
      }
      overlay.classList.remove("chance-options");
      const card = S.chanceCard;
      if (!card) { finishArcHold(); return; }
      const es = chanceLang();
      let title = es ? (card.titleEs || card.title) : card.title;
      if (S.chanceTitle) title = es ? (S.chanceTitle.es || S.chanceTitle.en || title) : (S.chanceTitle.en || title);
      if (S.battleTutOpen) title = t("tutBattle");
      if (card.job) title = fillJob(title, card.jobTier);
      title = stampNation(title);
      const snapBody = card.job || card.input === "move" || card.id === "chess" || card.id === "anOffer" || card.id === "ambassador"
        || card.id === "firstBloc" || card.id === "rearmament" || card.id === "threeColors"
        || card.id === "blocReplies" || card.id === "blocAssault" || card.id === "battleWon" || card.id === "blocTriumph";
      const rawBody = S.battleTutOpen ? battleTutPlain()
        : (!snapBody ? weaveCast(es ? (card.bodyEs || card.body) : card.body) : (S.chanceBody || (es ? (card.bodyEs || card.body) : card.body)));
      const body = stampNation(rawBody);
      const pic = (S.chanceNote && S.chanceOpt) ? postArtHtml(card.id, S.chanceOpt) : blocArtHtml(card);
      let btns = "";
      if (S.chanceNote) {
        btns = "<button class=\"cta\" data-ch=\"ok\">" + t("chanceAck") + "</button>";
        overlay.innerHTML = "<div class=\"arc-head\"><h1>" + t("chanceHead") + "</h1>" + arcTldrBtn() + "</div>"
          + pic + "<p class=\"arc-title\" role=\"heading\" aria-level=\"2\">" + title + "</p>"
          + arcOutcomeHtml()
          + "<div class=\"arc-actions\">" + btns + "</div>";
      } else {
        if (card.input === "move") {
          const esM = chanceLang();
          const cpM = chessProblem(), wM = cpM.side === "w";
          btns = "<form id=\"arc-move-form\" class=\"nation-ask arc-move\" autocomplete=\"off\">"
            + "<label for=\"arc-move-in\" class=\"arc-move-label\">" + (esM ? "Tu jugada (" + (wM ? "blancas" : "negras") + ", jugada " + cpM.n + ")" : "Your move (" + (wM ? "White" : "Black") + ", move " + cpM.n + ")") + "</label>"
            + "<input id=\"arc-move-in\" maxlength=\"16\" autocomplete=\"off\" autocorrect=\"off\" autocapitalize=\"none\" spellcheck=\"false\" enterkeyhint=\"done\" inputmode=\"text\" placeholder=\"" + (esM ? (wM ? "p. ej. Cf3" : "p. ej. Cf6") : (wM ? "e.g. Nf3" : "e.g. Nf6")) + "\">"
            + "<button type=\"submit\" class=\"cta\">" + (esM ? "Jugar" : "Play") + "</button>"
            + "</form>";
        } else
        btns = (card.opts || []).map((o) => {
          const lab = stampNation(arcOptionLabel(card,o,es));
          return "<button class=\"cta\" data-ch=\"" + o.k + "\">" + lab + "</button>";
        }).join("");
        const ack = !btns;
        if (ack) btns = "<button class=\"cta\" data-ch=\"ok\">" + t("chanceAck") + "</button>";
        const settled = (S.chanceSettled && S.chanceReadyNote && !S.battleTutOpen)
          ? arcMoneyHtml(ARC_TLDR ? (punchline(stripOutcomeMoney(S.chanceReadyNote)) || S.chanceReadyNote) : S.chanceReadyNote)
          : "";
        overlay.innerHTML = "<div class=\"arc-head\"><h1>" + t("chanceHead") + "</h1>" + arcTldrBtn() + "</div>"
          + pic + "<p class=\"arc-title\" role=\"heading\" aria-level=\"2\">" + title + "</p>"
          + (S.battleTutOpen ? battleTutHtml() : arcStoryHtml(card, body))
          + (card.input === "move" ? chessDiagramHtml(chessProblem(), es) : "")
          + settled
          + "<div class=\"arc-actions\">" + btns + "</div>";
      }
      const tog = $("arc-tldr-tog");
      if (tog) tog.onclick = (e) => {
        e.preventDefault();
        e.stopPropagation();
        setArcTldr(!ARC_TLDR);
        renderOverlay();
      };
      const sizeTog = $("arc-size-tog");
      if (sizeTog) sizeTog.onclick = (e) => {
        e.preventDefault();
        e.stopPropagation();
        cycleArcText();
        renderOverlay();
      };
      bindArcChoices(card);
      const mvForm = $("arc-move-form"), mvIn = $("arc-move-in");
      if (mvForm && mvIn) {
        // keys typed here never reach the game (the global keydown handler skips inputs); stop bubbling anyway
        mvIn.addEventListener("keydown", (e) => e.stopPropagation());
        mvIn.addEventListener("pointerdown", (e) => e.stopPropagation());
        mvForm.onsubmit = (e) => {
          e.preventDefault();
          e.stopPropagation();
          try { mvIn.blur(); } catch (err) {}
          pickChance("move:" + (mvIn.value || ""));
        };
      }
    } else if (p === "perk") {
      if (S.optPanel) {
        overlay.classList.add("chance-options");
        overlay.innerHTML = "<div class=\"chance-options-sheet\">" + pauseMarkup() + "</div>";
        bindPauseUi();
        return;
      }
      overlay.classList.remove("chance-options");
      if (!S.perkOffers || !S.perkOffers.length) { setPhase("play"); return; }
      const chosen = S.perkPick;
      const btns = S.perkOffers.map((id) => {
        const tier = (S.have[id] || 0) + 1;
        const sel = chosen === id;
        const label = id === "skip"
          ? "<span class=\"perk-name\">" + t("declinePerk") + "</span><span class=\"perk-desc\">" + t("declinePerkSub") + "</span>"
          : "<span class=\"perk-name\">" + perkTitle(id, tier) + "</span><span class=\"perk-desc\">" + perkBlurb(id, tier) + "</span>";
        return "<button class=\"cta" + (id === "skip" ? " play-alt" : "") + (sel ? " on" : "") + "\" data-perk=\"" + id + "\">" + (sel ? "✓ " : "") + label + "</button>";
      }).join("");
      overlay.innerHTML = "<h1>" + perkOfferTitle() + "</h1><p>" + (chosen ? t("selected") : t("pickOne")) + (S.perkHint ? "</p><p class=\"k\">A.I. bud: " + perkTitle(S.perkHint, S.poolTier[S.perkHint] || 1) + " — " + perkWhy(S.perkHint) : "") + "</p><div class=\"perk-list\">" + btns + "</div>";
      overlay.querySelectorAll("[data-perk]").forEach((btn) => {
        const go = (e) => { e.preventDefault(); e.stopPropagation(); pickPerk(btn.getAttribute("data-perk")); };
        btn.onpointerdown = go;
        btn.onclick = go;
      });
    } else if (p === "paused") {
      if (S.optPanel === "off" || (S.arcHold && !S.optPanel)) {
        hideOverlay();
        overlay.classList.remove("chance-ui", "dock", "juke-ui", "mp-ui", "opt-ui");
        return;
      }
      overlay.innerHTML = pauseMarkup();
      bindPauseUi();
    } else if (p === "over") {
      try {
        if (!S.stats) snapshotRun();
        endRunAwards();
      } catch (e) {}
      if (S.trainBattleLose && aidOffer()) {
        const cost = aidOffer();
        const have = aidReach();
        const ok = have + 1e-6 >= cost;
        const n = aidBtcLabel(cost);
        const note = t("aidNote").replace("{n}", n).replace("{i}", String((S.bcAidUsed | 0) + 1));
        const short = ok ? "" : ("<p class=\"k\">" + t("aidShort").replace("{have}", aidBtcLabel(have)) + "</p>");
        overlay.innerHTML = "<p class=\"k\">" + t("aidTitle") + "</p><h1>" + n + "</h1><p>" + note + "</p>" + short + "<div class=\"overlay-actions\"><button class=\"cta\" id=\"aid-yes\"" + (ok ? "" : " disabled") + ">" + t("aidPay") + "</button><button type=\"button\" class=\"cta play-alt\" id=\"aid-no\">" + t("aidDecline") + "</button></div>";
        const yes = $("aid-yes");
        if (yes && ok) {
          const go = (e) => { e.preventDefault(); e.stopPropagation(); payMilitaryAid(); };
          yes.onclick = go;
          yes.onpointerdown = go;
        }
        const no = $("aid-no");
        if (no) {
          const stop = (e) => { e.preventDefault(); e.stopPropagation(); refuseMilitaryAid(); };
          no.onclick = stop;
          no.onpointerdown = stop;
        }
      } else if (S.runTab) {
        overlay.innerHTML = runRecapHtml();
        bindRunRecap();
      } else {
        overlay.innerHTML = "<p class=\"k\">" + t("rekt") + (S.ranked ? "" : " · " + t("trainCamp")) + "</p><h1>" + fmtBtc(netBtc()) + "</h1><p>" + money(S.cash) + " + " + fmtBtc(S.btc) + " @ " + money(S.price) + "</p><p class=\"k\">" + (S.ranked ? t("best") + " " + fmtBtc((S.best || 0) / 1e4) : t("trainNote")) + "</p><div class=\"overlay-actions\"><button class=\"cta\" id=\"go\">" + t("tryAgain") + "</button><button type=\"button\" class=\"cta play-alt\" id=\"run-stats\">" + t("runStats") + "</button><button type=\"button\" class=\"cta play-alt\" id=\"share-run\">" + t("share") + "</button></div>";
        if ($("go")) {
          $("go").onclick = replay;
          $("go").onpointerdown = (e) => { e.stopPropagation(); replay(); };
        }
        if ($("run-stats")) $("run-stats").onclick = (e) => { e.stopPropagation(); S.runTab = "stats"; renderOverlay(); };
        if ($("share-run")) $("share-run").onclick = () => shareRun("over");
      }
    } else if (p === "win" && S.stats) {
      endRunAwards();
      if (S.runTab) {
        overlay.innerHTML = runRecapHtml();
        bindRunRecap();
      } else {
        const indep = S.winKind === "indep", esW = chanceLang();
        const nation = indep ? stampNation("Bitcoin Country") : "";
        overlay.innerHTML = (indep
          ? "<p class=\"k\">" + (esW ? "EL CUARTO COLOR" : "THE FOURTH COLOR") + "</p><h1>" + (esW ? nation + " es libre" : nation + " is free") + "</h1>"
            + "<p>" + (esW ? "Tu partida queda registrada como una victoria. Puedes seguir operando como nación libre o empezar de nuevo." : "Your run is recorded as a victory. Keep trading as a free nation, or start over.") + "</p>"
          : "<p class=\"k\">TWENTY ONE MILLION</p><h1>" + t("congrats") + "</h1>"
            + "<p>" + t("stacked") + "</p>")
          + "<div class=\"overlay-actions\"><button class=\"cta\" id=\"go\">" + t("keepPlaying") + "</button><button type=\"button\" class=\"cta play-alt\" id=\"run-stats\">" + t("runStats") + "</button><button type=\"button\" class=\"cta play-alt\" id=\"go-again\">" + t("playAgain") + "</button><button type=\"button\" class=\"cta play-alt\" id=\"share-run\">" + t("share") + "</button></div>";
        if ($("go")) $("go").onclick = keepPlaying;
        if ($("run-stats")) $("run-stats").onclick = (e) => { e.stopPropagation(); S.runTab = "stats"; renderOverlay(); };
        if ($("go-again")) $("go-again").onclick = replay;
        if ($("share-run")) $("share-run").onclick = () => shareRun(indep ? "indep" : "win");
      }
    }
  }

  let last = performance.now(), acc = 0, hudAcc = 0;
  function mpCatchUp() {
    if (!S.mp || S.phase !== "play" || !S.mpPlayAt) return;
    const target = Math.max(0, (Date.now() - S.mpPlayAt) / 1000);
    let guard = 0;
    while (S.lifeT + 1 / 60 <= target && guard++ < 1800) step(1 / 60);
  }
  function mpTickClock() {
    if (S.phase === "count" && S.mp && S.mpPlayAt) {
      const ms = S.mpPlayAt - Date.now();
      const n = ms > 0 ? Math.min(3, Math.max(1, Math.ceil(ms / 1000))) : 0;
      if (n !== S.countN) { S.countN = n; try { renderOverlay(); } catch (e) {} }
      if (ms <= 0) startMpPlay();
    }
    if (S.mp && S.phase === "play") mpCatchUp();
    if (S.mp && S.mpRoundOver && S.mpNextAt) {
      const left = S.mpNextAt - Date.now();
      const sec = Math.max(0, Math.ceil(left / 1000));
      if (left <= 0) {
        S.mpNextAt = 0;
        const host = window.ChoppyMP && window.ChoppyMP.get && window.ChoppyMP.get().host;
        if (host && window.ChoppyMP.nextRound) window.ChoppyMP.nextRound();
      } else if (S.mpNextShown !== sec) {
        S.mpNextShown = sec;
        if (S.phase === "play" && !S.runTab) try { renderOverlay(); } catch (e) {}
      }
    }
  }
  function loop(now) {
    mpTickClock();
    if (S.mp && S.phase === "play") {
      last = now;
      acc = 0;
    } else if (!(S.mp && S.phase === "count")) {
      perfSample(now - last);
      const dt = Math.min(0.1, (now - last) / 1000);
      last = now; acc += dt;
      while (acc >= 1 / 60) { step(1 / 60); acc -= 1 / 60; }
    } else {
      last = now;
    }
    hudAcc += 0.016;
    const ctx = fit();
    if(S.phase==="defense" || (S.bcDefense && S.bcDefense.frozen && S.phase==="chance")) drawDefense(ctx); else draw(ctx);
    if(S.phase!=="defense") paintHeroPreview();
    if (hudAcc > 0.12) { renderHud(); hudAcc = 0; }
    requestAnimationFrame(loop);
  }
  setInterval(mpTickClock, 250);
  document.addEventListener("visibilitychange", mpTickClock);
  window.addEventListener("focus", mpTickClock);
  window.addEventListener("pageshow", mpTickClock);

  canvas.addEventListener("pointerdown", (e) => {
    if (flapBlocked(e)) return;
    e.preventDefault();
    if (A && A.unlock) try { A.unlock(); } catch (err) {}
    S.humanInput = true;
    if(S.phase==="defense")return;
    if (S.phase === "play") flap();
  });
  const flapLayer = $("flap-layer");
  function bindFlap(el) {
    if (!el) return;
    const go = (e) => {
      if (S.phase !== "play") return;
      if (flapBlocked(e)) return;
      e.preventDefault();
      e.stopPropagation();
      S.humanInput = true;
      if (A && A.unlock) try { A.unlock(); } catch (err) {}
      flap();
    };
    el.addEventListener("pointerdown", go);
    el.addEventListener("touchstart", go, { passive: false });
  }
  bindFlap(flapLayer);
  bindFlap(canvas);
  let winLockUntil = 0;
  let winLockEl = null;
  function armWindowLock() {
    winLockUntil = performance.now() + 250;
    winLockEl = null;
  }
  function resumesLive(el) {
    if (!el) return false;
    if (el.closest("#hud, #def-pad, #juke-hud, #bc-bar, #bc-panel, #trades, #perk-bar")) return true;
    if (el.id === "pause-btn") return true;
    if (el.id === "go" && (S.phase === "paused" || S.phase === "win")) return true;
    return false;
  }
  function windowBtnOf(node) {
    const el = node && node.closest && node.closest("button, [role='button'], input[type='button'], input[type='submit']");
    if (!el || resumesLive(el)) return null;
    if (el.closest("#overlay, #auth-modal, #profile-modal, .modal, .auth-modal")) return el;
    return null;
  }
  function guardWindowBtn(e) {
    const btn = windowBtnOf(e.target);
    if (!btn) return;
    const now = performance.now();
    if (now < winLockUntil && btn !== winLockEl) {
      e.preventDefault();
      e.stopPropagation();
      return;
    }
    if (e.type === "pointerdown" || e.type === "click") {
      winLockUntil = now + 250;
      winLockEl = btn;
    }
  }
  document.addEventListener("pointerdown", guardWindowBtn, true);
  document.addEventListener("pointerup", guardWindowBtn, true);
  document.addEventListener("click", guardWindowBtn, true);
  overlay.addEventListener("click", (e) => {
    const go = e.target.closest("#go");
    if (!go) return;
    e.preventDefault();
    e.stopPropagation();
    if (S.phase === "ready") startGame();
    else if (S.phase === "win") keepPlaying();
    else if (S.phase === "over") replay();
    else if (S.phase === "paused" || S.optPanel) {
      S.optPanel = null;
      S.arcHold = false;
      setPhase(S.optBack === "play" || S.phase === "paused" ? (S.optBack || "play") : "ready");
    }
  });
  // ---- keybindings (desktop hotkeys, rebindable in Options > Gameplay) ----
  const KB_DEFS=[
    {id:"flap",g:"play",k:"Space",en:"Jump / flap",es:"Saltar / aletear"},
    {id:"buy",g:"play",k:"KeyB",en:"Buy BTC",es:"Comprar BTC",btn:"buy-btc"},
    {id:"sell",g:"play",k:"KeyS",en:"Sell BTC",es:"Vender BTC",btn:"sell-btc"},
    {id:"dca",g:"play",k:"KeyD",en:"DCA on/off",es:"DCA activado/apagado",btn:"dca-btn"},
    {id:"aibud",g:"play",k:"KeyI",en:"A.I. Bud on/off",es:"A.I. Bud activado/apagado",btn:"iabud-btn"},
    {id:"trend",g:"play",k:"KeyT",en:"Trend (manipulation)",es:"Tendencia (manipulación)",btn:"trend-btn"},
    {id:"market",g:"play",k:"KeyM",en:"Market",es:"Mercado",btn:"market-btn"},
    {id:"pause",g:"play",k:"KeyP",en:"Pause",es:"Pausa",btn:"pause-btn"},
    {id:"options",g:"play",k:"KeyO",en:"Options",es:"Opciones",btn:"opt-btn"},
    {id:"up",g:"battle",k:"KeyW",en:"Battle: up",es:"Batalla: arriba"},
    {id:"down",g:"battle",k:"KeyS",en:"Battle: down",es:"Batalla: abajo"},
    {id:"left",g:"battle",k:"KeyA",en:"Battle: left",es:"Batalla: izquierda"},
    {id:"right",g:"battle",k:"KeyD",en:"Battle: right",es:"Batalla: derecha"},
    {id:"fire",g:"battle",k:"Space",en:"Battle: fire",es:"Batalla: disparar"},
    {id:"fury",g:"battle",k:"KeyQ",en:"Battle: fury / anti-air",es:"Batalla: Furia (misil)",btn:"def-aa"},
    {id:"confirm",g:"ui",k:"Enter",en:"Confirm / OK",es:"Confirmar / OK"},
    {id:"close",g:"ui",k:"Escape",en:"Close / back",es:"Cerrar / volver"},
    {id:"opt1",g:"ui",k:"Digit1",en:"Card option 1",es:"Opción de carta 1"},
    {id:"opt2",g:"ui",k:"Digit2",en:"Card option 2",es:"Opción de carta 2"},
    {id:"opt3",g:"ui",k:"Digit3",en:"Card option 3",es:"Opción de carta 3"}
  ];
  const KB_STORE="choppy-keys";
  let KB={};
  function kbLoad(){KB={};KB_DEFS.forEach(d=>KB[d.id]=d.k);try{const o=JSON.parse(localStorage.getItem(KB_STORE)||"{}");for(const id in o)if(id in KB&&typeof o[id]==="string")KB[id]=o[id];}catch(e){}}
  function kbSave(){const o={};KB_DEFS.forEach(d=>{if(KB[d.id]!==d.k)o[d.id]=KB[d.id];});try{if(Object.keys(o).length)localStorage.setItem(KB_STORE,JSON.stringify(o));else localStorage.removeItem(KB_STORE);}catch(e){}}
  kbLoad();
  function kbLabel(c){if(!c)return"—";if(c==="Space")return chanceLang()?"Espacio":"Space";if(c==="Escape")return"Esc";if(c.startsWith("Key"))return c.slice(3);if(c.startsWith("Digit"))return c.slice(5);if(c.startsWith("Numpad"))return"Num"+c.slice(6);
    const ar={ArrowUp:"↑",ArrowDown:"↓",ArrowLeft:"←",ArrowRight:"→"};return ar[c]||c;}
  const kbOverlap=(a,b)=>a===b||a==="ui"||b==="ui";
  function kbIs(e,id){return e.code===KB[id];}
  const KB_DESK=(()=>{try{return matchMedia("(hover: hover) and (pointer: fine)").matches;}catch(e){return false;}})();
  function kbHints(){
    if(!KB_DESK)return;
    document.body.classList.add("kb-desk");
    KB_DEFS.forEach(d=>{if(!d.btn)return;const el=$(d.btn);if(el){el.setAttribute("data-key",kbLabel(KB[d.id]));el.title=(chanceLang()?d.es:d.en)+" ["+kbLabel(KB[d.id])+"]";}});
  }
  kbHints();
  let kbCapture=null,kbMsg="";
  function kbRows(){
    const es=chanceLang();
    const head={play:es?"Juego":"Run",battle:es?"Batalla":"Battle",ui:es?"Menús y cartas":"Menus & cards"};
    let h="",g="";
    KB_DEFS.forEach(d=>{
      if(d.g!==g){g=d.g;h+="<p class=\"kb-sec\">"+head[g]+"</p>";}
      const cap=kbCapture===d.id;
      h+="<div class=\"kb-row\"><span>"+(es?d.es:d.en)+"</span><button type=\"button\" class=\"kb-key"+(cap?" cap":"")+"\" data-kb=\""+d.id+"\">"+(cap?(es?"Pulsa una tecla…":"Press a key…"):kbLabel(KB[d.id]))+"</button></div>";
    });
    return "<div class=\"kb-list\">"+(kbMsg?"<p class=\"kb-msg\">"+kbMsg+"</p>":"")+h+"</div>"
      +"<button type=\"button\" class=\"cta opt-item\" id=\"kb-reset\">"+(es?"Restablecer teclas":"Reset to defaults")+"</button>"
      +"<p class=\"kb-note\">"+(es?"Flechas también mueven en batalla; ↑ también salta. Esc cancela la reasignación.":"Arrow keys also move in battle; ↑ also jumps. Esc cancels rebinding.")+"</p>";
  }
  function kbBind(){
    overlay.querySelectorAll("[data-kb]").forEach(b=>{b.onclick=(e)=>{e.stopPropagation();kbCapture=b.getAttribute("data-kb");kbMsg="";renderOverlay();};});
    const r=$("kb-reset");if(r)r.onclick=(e)=>{e.stopPropagation();kbCapture=null;try{localStorage.removeItem(KB_STORE);}catch(_){}kbLoad();kbMsg=chanceLang()?"Teclas restablecidas.":"Keys reset.";kbHints();renderOverlay();};
  }
  function kbAssign(id,code){
    const d=KB_DEFS.find(x=>x.id===id);const es=chanceLang();
    const clash=KB_DEFS.find(x=>x.id!==id&&KB[x.id]===code&&kbOverlap(x.g,d.g));
    if(clash){KB[clash.id]=KB[id];kbMsg=(es?"Intercambiada con ":"Swapped with ")+"“"+(es?clash.es:clash.en)+"” → "+kbLabel(KB[clash.id]);}
    else kbMsg="";
    KB[id]=code;kbSave();kbHints();
  }
  // "?" opens a read-only cheat sheet of the current bindings (desktop). Esc, "?" or a click closes it.
  function kbSheetToggle(force){
    let el=$("kb-sheet");
    const show=force!=null?force:!(el&&el.classList.contains("open"));
    if(!show){if(el)el.classList.remove("open");document.body.classList.remove("kb-sheet-on");return;}
    if(!el){el=document.createElement("div");el.id="kb-sheet";el.setAttribute("role","dialog");el.onclick=()=>kbSheetToggle(false);document.body.appendChild(el);}
    const es=chanceLang();
    const head={play:es?"Juego":"Run",battle:es?"Batalla":"Battle",ui:es?"Menús y cartas":"Menus & cards"};
    let h="<div class=\"kb-sheet-box\"><p class=\"k\">"+(es?"ATAJOS DE TECLADO":"KEYBOARD SHORTCUTS")+"</p><div class=\"kb-sheet-cols\">",g="";
    KB_DEFS.forEach(d=>{if(d.g!==g){if(g)h+="</div>";g=d.g;h+="<div><p class=\"kb-sec\">"+head[g]+"</p>";}
      h+="<div class=\"kb-row\"><span>"+(es?d.es:d.en)+"</span><kbd>"+kbLabel(KB[d.id])+"</kbd></div>";});
    h+="</div></div><p class=\"kb-note\">"+(es?"? o Esc cierra · Cámbialas en Opciones → Juego → Teclas (PC)":"? or Esc closes · Rebind in Options → Gameplay → Keys (PC)")+"</p></div>";
    el.innerHTML=h;el.classList.add("open");document.body.classList.add("kb-sheet-on");
    if(S.phase==="play"&&!S.mp)togglePause();
  }
  function kbClickFirst(sel){const el=overlay.querySelector(sel);if(el&&!el.disabled&&el.offsetParent!==null){el.click();return true;}return false;}
  window.addEventListener("keyup", (e) => {
    if(S.phase!=="defense")return;
    const h=S.defHeld;if(!h)return;
    if(e.code==="ArrowUp"||kbIs(e,"up"))h.u=0;
    if(e.code==="ArrowDown"||kbIs(e,"down"))h.d=0;
    if(e.code==="ArrowLeft"||kbIs(e,"left"))h.l=0;
    if(e.code==="ArrowRight"||kbIs(e,"right"))h.r=0;
    if(kbIs(e,"fire"))h.f=0;
    if(kbIs(e,"fury")||e.code==="KeyE"){
      h.aa=0;
      const d=S.bcDefense;
      if(d&&d.aaCharging&&!d.aaArmed){d.aaCharging=false;d.aaCharge=0;}
    }
  });
  window.addEventListener("keydown", (e) => {
    if (kbCapture) {
      e.preventDefault(); e.stopPropagation();
      if (e.code === "Escape") kbMsg = "";
      else if (e.code && !/^(Shift|Control|Alt|Meta)/.test(e.code)) kbAssign(kbCapture, e.code);
      else return;
      kbCapture = null; renderOverlay(); return;
    }
    const tag = (e.target && e.target.tagName ? e.target.tagName : "").toLowerCase();
    const typing = tag === "input" || tag === "textarea" || tag === "select" || (e.target && e.target.isContentEditable);
    if (typing) return;
    if (e.ctrlKey || e.metaKey || e.altKey) return;
    const sheet = $("kb-sheet");
    if (sheet && sheet.classList.contains("open") && (e.code === "Escape" || e.key === "?")) { e.preventDefault(); kbSheetToggle(false); return; }
    if (e.key === "?" && !e.repeat && S.phase !== "defense") { e.preventDefault(); kbSheetToggle(true); return; }
    if (document.querySelector(".modal.open, .modal.show, #modal-auth.open, #auth-modal.open")) return;
    if(bcPostKey(e))return;
    if(S.phase==="defense"){
      const h=S.defHeld||(S.defHeld={u:0,d:0,l:0,r:0,f:0});
      let hit=true;
      if(e.code==="ArrowUp"||kbIs(e,"up"))h.u=1;
      else if(e.code==="ArrowDown"||kbIs(e,"down"))h.d=1;
      else if(e.code==="ArrowLeft"||kbIs(e,"left"))h.l=1;
      else if(e.code==="ArrowRight"||kbIs(e,"right"))h.r=1;
      else if(kbIs(e,"fire")){h.f=1;if(!e.repeat&&S.bcDefense&&!S.bcDefense.aaArmed)fireTank(S.bcDefense,S.bcDefense.player);}
      else if(kbIs(e,"fury")||e.code==="KeyE"){
        const d=S.bcDefense;
        if(d&&!e.repeat){
          h.aa=1;
          if(d.aaArmed)d.aaTap=1;
          else if(!d.aaCharging){d.aaCharging=true;d.aaCharge=0;d.aaArmed=false;d.reticle=null;}
        }
      } else hit=false;
      if(hit)e.preventDefault();
      return;
    }
    const ovOpen = overlay && !overlay.classList.contains("hide") && overlay.offsetParent !== null && overlay.innerHTML.trim() !== "";
    if (ovOpen && !e.repeat) {
      if (kbIs(e, "close")) {
        e.preventDefault();
        if (kbClickFirst("#opt-x") || kbClickFirst("#opt-close") || kbClickFirst("#help-back")) return;
        if (S.phase === "paused" && !S.mp) { togglePause(); return; }
        return;
      }
      if (kbIs(e, "confirm")) {
        e.preventDefault();
        if (kbClickFirst("#arc-move-form button[type=submit]") || kbClickFirst("[data-ch=\"ok\"]") || kbClickFirst("#go") || kbClickFirst("[data-ch]")) return;
        return;
      }
      const oi = ["opt1","opt2","opt3"].findIndex((id) => kbIs(e, id));
      if (oi >= 0) {
        const bs = Array.prototype.filter.call(overlay.querySelectorAll("[data-ch]"), (b) => b.offsetParent !== null);
        if (bs[oi]) { e.preventDefault(); if (!bs[oi].disabled) bs[oi].click(); return; }
      }
    }
    if (S.arcHold || S.phase === "chance") {
      if (kbIs(e, "flap") || e.code === "ArrowUp" || kbIs(e, "pause")) { e.preventDefault(); return; }
    }
    if (!ovOpen && kbIs(e, "close") && S.phase === "play" && !S.mp) { e.preventDefault(); togglePause(); return; }
    if (kbIs(e, "flap") || e.code === "ArrowUp") { e.preventDefault(); if (!e.repeat) flap(); return; }
    if (e.repeat) return;
    const fire = (id) => { const el = $(id); if (el && el.onpointerdown) el.onpointerdown({ stopPropagation(){}, preventDefault(){}, target: el }); };
    if (kbIs(e, "buy")) { e.preventDefault(); if (!aiLocks().trade) { buyBtc(); unstickTrades(); renderHud(); } }
    else if (kbIs(e, "sell")) { e.preventDefault(); if (!aiLocks().trade) { sellBtc(); unstickTrades(); renderHud(); } }
    else if (kbIs(e, "pause")) { e.preventDefault(); if (!S.mp) togglePause(); }
    else if (kbIs(e, "options")) { e.preventDefault(); toggleOptions(); }
    else if (kbIs(e, "dca")) { e.preventDefault(); fire("dca-btn"); }
    else if (kbIs(e, "aibud")) { e.preventDefault(); fire("iabud-btn"); }
    else if (kbIs(e, "trend")) { e.preventDefault(); fire("trend-btn"); }
    else if (kbIs(e, "market")) { e.preventDefault(); fire("market-btn"); }
  });
  $("pause-btn").onpointerdown = (e) => { e.stopPropagation(); e.preventDefault(); if (!S.mp) togglePause(); };
  function optionsVisible() {
    if (S.phase === "chance") return !!(S.optPanel && S.optPanel !== "off");
    if (S.phase === "perk") return !!(S.optPanel && S.optPanel !== "off");
    if (S.phase === "ready") return !!(S.optPanel && S.optPanel !== "off");
    if (S.phase === "paused") {
      if (S.optPanel === "off") return false;
      if (S.arcHold && !S.optPanel) return false;
      return true;
    }
    return false;
  }
  function toggleOptions() {
    if (S.mp) return;
    if (S.phase === "defense") return;
    let opened = false;
    if (S.phase === "chance" || S.phase === "perk") {
      S.optBack = S.phase;
      opened = !optionsVisible();
      S.optPanel = opened ? "menu" : null;
      renderOverlay();
      if (opened) armWindowLock();
      return;
    }
    if (S.phase === "play") {
      S.optBack = "play";
      S.optPanel = "menu";
      setPhase("paused");
      armWindowLock();
      return;
    }
    if (S.phase === "ready") {
      S.optBack = "ready";
      opened = !optionsVisible();
      S.optPanel = opened ? "menu" : null;
      renderOverlay();
      if (opened) armWindowLock();
      return;
    }
    if (S.phase === "paused") {
      if (optionsVisible()) S.optPanel = S.arcHold ? null : "off";
      else { S.optPanel = "menu"; opened = true; }
      renderOverlay();
      if (opened) armWindowLock();
    }
  }
  const optBtn = $("opt-btn");
  if (optBtn) optBtn.onpointerdown = (e) => {
    e.stopPropagation(); e.preventDefault();
    toggleOptions();
  };
  const authHud = $("btn-show-auth");
  if (authHud) authHud.onpointerdown = (e) => {
    e.stopPropagation();
    if (S.mp) return;
    if (S.phase === "play") { S.optBack = "play"; S.optPanel = null; setPhase("paused"); armWindowLock(); }
  };
  window.pauseChoppyForAuth = function () {
    if (S.mp) return;
    if (S.phase === "play") { S.optBack = "play"; S.optPanel = null; setPhase("paused"); armWindowLock(); }
  };
  const jukeHudPlay = $("juke-hud-play");
  if (jukeHudPlay) jukeHudPlay.onpointerdown = (e) => {
    e.stopPropagation(); e.preventDefault();
    if ((S.have.juke || 0) <= 0) return;
    if ((A.jukePlaying && A.jukePlaying()) || (A.jukePaused && A.jukePaused())) jukePause();
    else jukePlay();
    paintJukeHud();
  };
  const jukeVol = $("juke-hud-vol");
  if (jukeVol) {
    const applyVol = (e) => {
      if (e) e.stopPropagation();
      if ((S.have.juke || 0) <= 0 || !A.setJukeVolume) return;
      A.setJukeVolume((Number(jukeVol.value) || 0) / 100);
    };
    jukeVol.onpointerdown = (e) => e.stopPropagation();
    jukeVol.onpointerup = (e) => e.stopPropagation();
    jukeVol.onclick = (e) => e.stopPropagation();
    jukeVol.oninput = applyVol;
    jukeVol.onchange = applyVol;
  }
  $("dca-btn").onpointerdown = (e) => {
    e.stopPropagation(); e.preventDefault();
    if (S.have.dca <= 0 || aiLocks().dca) return;
    S.dcaOn = !S.dcaOn;
    if (S.aibudLit) S.aibudLit.dca = false;
    renderHud();
  };
  const iaBtn = $("iabud-btn");
  if (iaBtn) iaBtn.onpointerdown = (e) => {
    e.stopPropagation(); e.preventDefault();
    if ((S.have.aibud || 0) <= 0) return;
    S.aibudOn = !S.aibudOn;
    if (!S.aibudOn) { S.aibudLit = {}; S.aibudLitAt = {}; }
    renderHud();
  };
  const trendBtn = $("trend-btn");
  if (trendBtn) trendBtn.onpointerdown = (e) => {
    e.stopPropagation(); e.preventDefault();
    if (S.have.manip <= 0 || aiLocks().trend) return;
    S.trend = S.trend === "off" ? "up" : S.trend === "up" ? "down" : "off";
    if (S.aibudLit) S.aibudLit.trend = false;
    renderHud();
  };
  const mkt = $("market-btn");
  if (mkt) mkt.onpointerdown = (e) => {
    e.stopPropagation(); e.preventDefault();
    if ((S.have.market || 0) <= 0 || S.mp) return;
    S.optBack = S.phase === "play" ? "play" : (S.optBack || "ready");
    S.optPanel = "market";
    if (S.phase === "play") setPhase("paused");
    else renderOverlay();
    armWindowLock();
  };
  $("buy-btc").onpointerdown = (e) => {
    e.stopPropagation();
    if (aiLocks().trade) return;
    buyBtc();
    clearManualTradePaint();
    renderHud();
  };
  $("sell-btc").onpointerdown = (e) => {
    e.stopPropagation();
    if (aiLocks().trade) return;
    sellBtc();
    clearManualTradePaint();
    renderHud();
  };
  function keepAiTradeLit(id) {
    return !!(S.aibudOn && S.aibudLit && ((id === "buy-btc" && S.aibudLit.buy) || (id === "sell-btc" && S.aibudLit.sell)));
  }
  function clearManualTradePaint() {
    ["buy-btc", "sell-btc"].forEach((id) => {
      const el = $(id);
      if (!el) return;
      el.classList.remove("on", "press");
      if (!keepAiTradeLit(id)) el.classList.remove("ai-lit");
      try { el.blur(); } catch (err) {}
    });
    setTimeout(() => {
      ["buy-btc", "sell-btc"].forEach((id) => {
        const el = $(id);
        if (!el) return;
        el.classList.remove("on", "press");
        if (!keepAiTradeLit(id)) el.classList.remove("ai-lit");
        try { el.blur(); } catch (err) {}
      });
    }, 80);
  }
  function unstickTrades() { clearManualTradePaint(); }
  const unstickTrade = (id) => {
    const el = $(id);
    if (!el) return;
    const release = () => {
      el.classList.remove("on", "press");
      if (!keepAiTradeLit(id)) el.classList.remove("ai-lit");
      try { el.blur(); } catch (err) {}
    };
    el.onpointerup = release;
    el.onpointercancel = release;
    el.onpointerleave = release;
    el.onlostpointercapture = release;
  };
  unstickTrade("buy-btc");
  unstickTrade("sell-btc");
  document.addEventListener("pointerup", unstickTrades, true);
  document.addEventListener("pointercancel", unstickTrades, true);
  document.querySelectorAll(".spd").forEach((btn) => {
    btn.onpointerdown = (e) => {
      e.stopPropagation(); e.preventDefault();
      if (S.have.ff <= 0) return;
      cycleSpeed();
      renderHud();
    };
  });

  window.addEventListener("bz-lang", () => {
    if (window.BZ) BZ.apply(document);
    if (A && A.setLang && window.BZ && BZ.lang) A.setLang(BZ.lang());
    renderOverlay();
    renderHud();
    try { renderBitcoinCountry(); } catch (e) {}
  });
  const bcOpen=$("bc-open"),bcClose=$("bc-close"),bcArmy10=$("bc-army10"),bcArmyBar=$("bc-army-bar"),bcDeclare=$("bc-declare"),bcForm=$("bc-form-army");
  if(bcOpen)bcOpen.addEventListener("click",()=>{const p=$("bc-panel");if(p)p.classList.remove("hide");renderBitcoinCountry();});
  if(bcClose)bcClose.addEventListener("click",()=>{const p=$("bc-panel");if(p)p.classList.add("hide");});
  function onBuyArmy(){buyArmy(10);renderBitcoinCountry();renderHud();}
  if(bcArmy10)bcArmy10.addEventListener("click",onBuyArmy);
  if(bcArmyBar)bcArmyBar.addEventListener("click",onBuyArmy);
  if(bcForm)bcForm.addEventListener("click",()=>{formArmy();renderBitcoinCountry();renderHud();});
  const bcEnd=$("bc-end");
  if(bcEnd)bcEnd.addEventListener("click",(e)=>{e.preventDefault();e.stopPropagation();endIndependence();});
  if(bcDeclare)bcDeclare.addEventListener("click",(e)=>{
    e.preventDefault();
    e.stopPropagation();
    if((S.bcNodes||0)<100||S.bcIndependent||S.bcVictory)return;
    const p=$("bc-panel");if(p)p.classList.add("hide");
    S.optPanel=null;
    askCountryName();
  });
  (function bindDefensePad(){
    const stick=$("def-stick"), knob=$("def-knob"), fire=$("def-fire"), rev=$("def-rev");
    if(!stick||!fire)return;
    const fireIds=new Set();
    function held(){return S.defHeld||(S.defHeld={u:0,d:0,l:0,r:0,f:0});}
    function resetStick(){
      S.defStick=null;
      const h=held();h.u=h.d=h.l=h.r=0;
      if(knob)knob.style.transform="translate(0px,0px)";
    }
    function applyStick(cx,cy){
      const r=stick.getBoundingClientRect();
      let dx=cx-(r.left+r.width/2), dy=cy-(r.top+r.height/2);
      const max=r.width*0.32, len=Math.hypot(dx,dy)||1;
      if(len>max){dx*=max/len;dy*=max/len;}
      if(knob)knob.style.transform="translate("+dx+"px,"+dy+"px)";
      const nx=dx/max, ny=dy/max;
      S.defStick={x:nx,y:ny};
      const h=held();h.u=h.d=h.l=h.r=0;
      if(nx*nx+ny*ny<0.08)return;
      if(Math.abs(nx)>Math.abs(ny)) h[nx>0?"r":"l"]=1;
      else h[ny>0?"d":"u"]=1;
    }
    stick.addEventListener("pointerdown",(e)=>{
      e.preventDefault();e.stopPropagation();
      try{stick.setPointerCapture(e.pointerId);}catch(err){}
      applyStick(e.clientX,e.clientY);
    });
    stick.addEventListener("pointermove",(e)=>{
      if(!(e.buttons||e.pointerType==="touch"))return;
      e.preventDefault();applyStick(e.clientX,e.clientY);
    });
    stick.addEventListener("pointerup",resetStick);
    stick.addEventListener("pointercancel",resetStick);
    if(rev){
      const revOn=(e)=>{
        e.preventDefault();e.stopPropagation();
        try{rev.setPointerCapture(e.pointerId);}catch(err){}
        held().rev=1;
        rev.classList.add("on");
      };
      const revOff=()=>{held().rev=0;rev.classList.remove("on");};
      rev.addEventListener("pointerdown",revOn);
      rev.addEventListener("pointerup",revOff);
      rev.addEventListener("pointercancel",revOff);
      rev.addEventListener("lostpointercapture",revOff);
    }
    fire.addEventListener("pointerdown",(e)=>{
      e.preventDefault();e.stopPropagation();
      try{fire.setPointerCapture(e.pointerId);}catch(err){}
      fireIds.add(e.pointerId);
      held().f=1;
      if(S.bcDefense)fireTank(S.bcDefense,S.bcDefense.player);
    });
    function endFire(e){
      fireIds.delete(e.pointerId);
      if(!fireIds.size)held().f=0;
    }
    fire.addEventListener("pointerup",endFire);
    fire.addEventListener("pointercancel",endFire);
    const aa=$("def-aa");
    if(aa){
      aa.addEventListener("pointerdown",(e)=>{
        e.preventDefault();e.stopPropagation();
        try{aa.setPointerCapture(e.pointerId);}catch(err){}
        const d=S.bcDefense;
        if(!d||d.done||d.frozen)return;
        held().aa=1;
        if(d.aaArmed)d.aaTap=1;
        else if(!d.aaCharging){
          d.aaCharging=true;d.aaCharge=0;d.aaArmed=false;d.reticle=null;
        }
      });
      const endAa=()=>{
        held().aa=0;
        const d=S.bcDefense;
        if(d&&d.aaCharging&&!d.aaArmed){d.aaCharging=false;d.aaCharge=0;}
      };
      aa.addEventListener("pointerup",endAa);
      aa.addEventListener("pointercancel",endAa);
    }
    const arc=$("def-arc");
    if(arc){
      let arcDrag=0;
      const setAng=(clientY)=>{
        const d=S.bcDefense;
        if(!d||(d.shotTier|0)<2)return;
        const box=arc.getBoundingClientRect();
        const travel=Math.max(1,box.height-22);
        let t=(clientY-box.top-11)/travel;
        t=Math.max(0,Math.min(1,t));
        d.shotSpread=45*t;
        rememberShot(d);
        syncAaButton(d);
      };
      arc.addEventListener("pointerdown",(e)=>{
        e.preventDefault();e.stopPropagation();
        try{arc.setPointerCapture(e.pointerId);}catch(err){}
        arcDrag=e.pointerId;
        setAng(e.clientY);
      });
      arc.addEventListener("pointermove",(e)=>{
        if(arcDrag!==e.pointerId)return;
        setAng(e.clientY);
      });
      const endArc=(e)=>{if(arcDrag===e.pointerId)arcDrag=0;};
      arc.addEventListener("pointerup",endArc);
      arc.addEventListener("pointercancel",endArc);
    }
    const fieldEl=$("field");
    let aimPtr=null;
    function aimPoint(e){
      const r=canvas.getBoundingClientRect();
      const w=r.width||1, h=r.height||1;
      return {x:(e.clientX-r.left)/w*S.W, y:(e.clientY-r.top)/h*S.H};
    }
    function aimDown(e){
      const d=S.bcDefense;
      if(S.phase!=="defense"||!d||d.done||d.frozen||!d.aaArmed||!d.reticle)return;
      const t=e.target;
      if(t&&t.closest&&t.closest("#def-stick,#def-aa,#def-arc,#def-rev"))return;
      e.preventDefault();
      e.stopPropagation();
      const p=aimPoint(e);
      aimPtr={id:e.pointerId,sx:e.clientX,sy:e.clientY,hit:reticleHit(d,p.x,p.y),moved:false};
      try{fieldEl.setPointerCapture(e.pointerId);}catch(err){}
    }
    function aimMove(e){
      if(!aimPtr||e.pointerId!==aimPtr.id)return;
      const d=S.bcDefense;
      if(!d||!d.reticle){aimPtr=null;return;}
      if(Math.hypot(e.clientX-aimPtr.sx,e.clientY-aimPtr.sy)>10)aimPtr.moved=true;
      if(!aimPtr.hit||!aimPtr.moved)return;
      const p=aimPoint(e);
      d.reticle.x=Math.max(0,Math.min(S.W,p.x));
      d.reticle.y=Math.max(0,Math.min(S.H,p.y));
    }
    function aimUp(e,drop){
      if(!aimPtr||e.pointerId!==aimPtr.id)return;
      const g=aimPtr; aimPtr=null;
      const d=S.bcDefense;
      if(drop||!d||!d.aaArmed||!d.reticle||g.moved)return;
      if(g.hit)fireReticle(d);
      else cancelReticle(d);
    }
    if(fieldEl){
      fieldEl.addEventListener("pointerdown",aimDown,true);
      fieldEl.addEventListener("pointermove",aimMove,true);
      fieldEl.addEventListener("pointerup",aimUp,true);
      fieldEl.addEventListener("pointercancel",(e)=>aimUp(e,true),true);
    }
  })();
  window.startChoppy = startGame;
  window.replayChoppy = replay;
  window.dealChoppyArc = function (id) {
    window.__arcForce = id || "";
    if ((S.have.chance || 0) < 1) S.have.chance = 1;
    if (S.phase !== "play") S.phase = "play";
    dealChance();
  };
  window.offerChoppyPerk = function (ids) {
    S.perkOffers = (ids && ids.length) ? ids.slice() : ["dca", "aibud", "skip"];
    S.perkPick = "";
    S.perkHint = "";
    setPhase("perk");
  };
  window.refreshChoppyAuth = () => {
    if (S.phase === "ready" && !S.optPanel) renderOverlay();
  };
  window.addEventListener("resize", layoutStage);
  window.addEventListener("orientationchange", layoutStage);
  if (window.visualViewport) window.visualViewport.addEventListener("resize", layoutStage);
  try {
    resetWorld(false);
    fillJukebox();
    renderOverlay();
    renderHud();
    layoutStage();
    preloadChanceArt();
    try {
      const mo = new MutationObserver((recs) => {
        if (!(window.BZ && BZ.lang && BZ.lang() === "es")) return;
        for (const r of recs) {
          if (r.type === "characterData") localizeTextNode(r.target);
          else r.addedNodes.forEach((n) => { if (n.nodeType === 3) localizeTextNode(n); else if (n.nodeType === 1) localizeNums(n); });
        }
      });
      ["overlay", "bc-panel", "bc-bar", "trades", "status", "caption", "perk-bar", "voice-stack", "mp-hud-list", "now-playing"].forEach((id) => { const el = $(id); if (el) mo.observe(el, { childList: true, subtree: true, characterData: true }); });
    } catch (e) {}
    wireMp();
    try {
      const q = new URLSearchParams(location.search || "");
      const room = (q.get("room") || q.get("mp") || "").toUpperCase();
      if (room.length >= 4) { S.mpJoinCode = room; openMpLobby(); }
    } catch (e) {}
    requestAnimationFrame(loop);
  } catch (e) {
    try { console.error(e); } catch (err) {}
    try { renderOverlay(); } catch (err) {}
  }
})();
