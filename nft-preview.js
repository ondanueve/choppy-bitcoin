/* Collection preview. Loaded only when the profile URL has nftpreview=1.
   Shows earned awards. Does not sign, inscribe, or ask for a key. */
(function () {
  "use strict";

  var CATS = {
    trading: { en: "Trading", es: "Trading" },
    survival: { en: "Survival", es: "Supervivencia" },
    perks: { en: "Perks", es: "Perks" },
    family: { en: "Family", es: "Familia" },
    country: { en: "Bitcoin Country", es: "Bitcoin Country" },
    challenge: { en: "Challenges", es: "Desafíos" },
    meta: { en: "Career", es: "Trayectoria" }
  };

  function copy(lang) {
    var es = lang === "es";
    return {
      title: es ? "Colección" : "Collection",
      preview: es ? "Vista previa. No se emite nada." : "Preview. Nothing is issued.",
      signin: es ? "Inicia sesión para ver tu colección." : "Sign in to see your collection.",
      empty: es ? "Todavía no hay premios." : "No awards yet.",
      pending: es ? "Esta ilustración todavía no está lista." : "Art not ready yet.",
      current: es ? "Actual" : "Current",
      vintage: "Vintage",
      vintageNote: es
        ? "Hay una edición archivada. No está publicada en este sitio."
        : "An archived edition exists. It is not published on this site.",
      error: es ? "No se pudo leer el mapa de ilustraciones." : "Could not read the illustration map.",
      awardsCol: es
        ? "La lista del servidor no incluye premios todavía. Se muestran los de este dispositivo."
        : "The server list has no awards column yet. Showing awards stored on this device."
    };
  }

  function currentLang() {
    try {
      var stored = localStorage.getItem("bitcoinizate-lang");
      if (stored === "en" || stored === "es") return stored;
    } catch (err) {}
    var nav = (typeof navigator !== "undefined" && navigator.language) ? navigator.language : "";
    return nav.toLowerCase().indexOf("es") === 0 ? "es" : "en";
  }

  function parseCsv(text) {
    var rows = [];
    var i = 0;
    var len = text.length;
    function parseRow() {
      var fields = [];
      var cur = "";
      var quoted = false;
      if (i >= len) return null;
      while (i < len) {
        var c = text.charAt(i);
        if (quoted) {
          if (c === '"') {
            if (text.charAt(i + 1) === '"') {
              cur += '"';
              i += 2;
              continue;
            }
            quoted = false;
            i += 1;
            continue;
          }
          cur += c;
          i += 1;
          continue;
        }
        if (c === '"') {
          quoted = true;
          i += 1;
          continue;
        }
        if (c === ",") {
          fields.push(cur);
          cur = "";
          i += 1;
          continue;
        }
        if (c === "\n" || c === "\r") {
          if (c === "\r" && text.charAt(i + 1) === "\n") i += 1;
          i += 1;
          fields.push(cur);
          return fields;
        }
        cur += c;
        i += 1;
      }
      fields.push(cur);
      return fields;
    }
    var header = parseRow();
    if (!header) return rows;
    var keys = header;
    for (;;) {
      var fields = parseRow();
      if (!fields) break;
      if (fields.length === 1 && fields[0] === "") continue;
      var row = {};
      for (var n = 0; n < keys.length; n++) row[keys[n]] = fields[n] || "";
      rows.push(row);
    }
    return rows;
  }

  function injectCss() {
    if (document.getElementById("nft-preview-css")) return;
    var style = document.createElement("style");
    style.id = "nft-preview-css";
    style.textContent = [
      "#nft-collection, #nft-collection * { box-sizing: border-box; }",
      "#nft-collection { margin: 20px 0 8px; max-width: 720px; }",
      "#nft-collection h2 { font-size: 16px; margin: 0 0 6px; }",
      "#nft-collection .nft-note { color: #aaa; font-size: 12px; margin: 0 0 8px; }",
      "#nft-collection .nft-card { border: 1px solid #333; margin: 0 0 12px; background: #181818; }",
      "#nft-collection .nft-card img { width: 100%; max-width: 100%; height: auto; display: block; background: #222; object-fit: contain; }",
      "#nft-collection .nft-meta { padding: 12px; }",
      "#nft-collection .nft-id { font-weight: 700; }",
      "#nft-collection .nft-chip { display: inline-block; margin: 6px 6px 0 0; padding: 2px 8px; border: 1px solid #F2A900; font-size: 11px; }",
      "#nft-collection .nft-pending { min-height: 120px; display: flex; align-items: center; justify-content: center; color: #aaa; padding: 12px; text-align: center; }",
      "#nft-collection .nft-vintage-note { color: #aaa; font-size: 12px; margin: 6px 0 0; }"
    ].join("\n");
    document.head.appendChild(style);
  }

  function el(tag, text, className) {
    var node = document.createElement(tag);
    if (className) node.className = className;
    if (text) node.textContent = text;
    return node;
  }

  function chip(text) {
    return el("span", text, "nft-chip");
  }

  function card(row, t, lang) {
    var box = document.createElement("article");
    box.className = "nft-card";
    if (row.eligibility === "ok" && row.art_current) {
      var img = document.createElement("img");
      img.loading = "lazy";
      img.decoding = "async";
      img.width = 1920;
      img.height = 800;
      img.alt = row.award_id;
      img.src = "/choppy-bitcoin/" + String(row.art_current).replace(/^\/+/, "");
      box.appendChild(img);
    } else {
      box.appendChild(el("div", t.pending, "nft-pending"));
    }
    var meta = document.createElement("div");
    meta.className = "nft-meta";
    meta.appendChild(el("div", row.award_id, "nft-id"));
    var cat = CATS[row.category];
    meta.appendChild(el("div", cat ? cat[lang] : row.category, "nft-note"));
    if (row.eligibility === "ok") meta.appendChild(chip(t.current));
    if (row.art_vintage) {
      meta.appendChild(chip(t.vintage));
      meta.appendChild(el("p", t.vintageNote, "nft-vintage-note"));
    }
    box.appendChild(meta);
    return box;
  }

  function render(root, model) {
    if (!root) return;
    injectCss();
    var lang = model && model.lang === "es" ? "es" : "en";
    var t = copy(lang);
    root.innerHTML = "";
    root.id = root.id || "nft-collection";
    root.setAttribute("aria-label", t.title);
    root.appendChild(el("h2", t.title));
    root.appendChild(el("p", t.preview, "nft-note"));
    if (model && model.note) root.appendChild(el("p", model.note, "nft-note"));
    if (model && model.error) {
      root.appendChild(el("p", model.error));
      return;
    }
    if (!model || !model.signedIn) {
      root.appendChild(el("p", t.signin));
      return;
    }
    var byId = {};
    (model.rows || []).forEach(function (row) {
      if (row && row.award_id) byId[row.award_id] = row;
    });
    var shown = 0;
    (model.awards || []).forEach(function (id) {
      var row = byId[id];
      if (!row || row.eligibility === "excluida") return;
      shown += 1;
      root.appendChild(card(row, t, lang));
    });
    if (!shown) root.appendChild(el("p", t.empty));
  }

  function localAwardIds(uid) {
    try {
      var bag = JSON.parse(localStorage.getItem("choppy-awards") || "{}");
      var map = bag && bag[uid] ? bag[uid] : {};
      return Object.keys(map).filter(function (key) { return map[key]; });
    } catch (err) {
      return [];
    }
  }

  function mergeIds(serverIds, localIds) {
    var seen = {};
    var out = [];
    serverIds.concat(localIds).forEach(function (id) {
      if (!id || seen[id]) return;
      seen[id] = true;
      out.push(id);
    });
    return out;
  }

  function ensureRoot() {
    var root = document.getElementById("nft-collection");
    if (!root) {
      root = document.createElement("section");
      root.id = "nft-collection";
      document.body.appendChild(root);
    }
    return root;
  }

  async function boot() {
    var on = false;
    try { on = new URLSearchParams(location.search).get("nftpreview") === "1"; } catch (err) { on = false; }
    if (!on) return;
    var lang = currentLang();
    var t = copy(lang);
    injectCss();
    var root = ensureRoot();
    var sb = window.supabase && window.supabase.createClient && window.supabase.createClient();
    if (!sb || !sb.auth || !sb.auth.getSession) {
      render(root, { lang: lang, signedIn: false });
      return;
    }
    var sess = null;
    try { sess = await sb.auth.getSession(); } catch (err) { sess = null; }
    var user = sess && sess.data && sess.data.session && sess.data.session.user;
    if (!user || !user.id) {
      render(root, { lang: lang, signedIn: false });
      return;
    }
    var serverIds = [];
    var note = "";
    var profileOk = false;
    try {
      var res = await sb.from("profiles").select("id,username,awards").eq("id", user.id).single();
      if (res && !res.error && res.data) {
        profileOk = true;
        if (Array.isArray(res.data.awards)) serverIds = res.data.awards;
      } else {
        var res2 = await sb.from("profiles").select("id,username").eq("id", user.id).single();
        if (res2 && !res2.error && res2.data) {
          profileOk = true;
          note = t.awardsCol;
        }
      }
    } catch (err) {
      profileOk = false;
    }
    if (!profileOk) {
      render(root, { lang: lang, signedIn: false });
      return;
    }
    var csvText = "";
    try {
      var response = await fetch("/choppy-bitcoin/docs/nft/award-art-map.csv");
      if (!response.ok) throw new Error("csv");
      csvText = await response.text();
    } catch (err) {
      render(root, { lang: lang, signedIn: true, awards: [], rows: [], error: t.error });
      return;
    }
    render(root, {
      lang: lang,
      signedIn: true,
      awards: mergeIds(serverIds, localAwardIds(user.id)),
      rows: parseCsv(csvText),
      note: note
    });
  }

  window.choppyNftPreview = { render: render, parseCsv: parseCsv, boot: boot };

  if (typeof document !== "undefined") {
    if (document.readyState === "loading") document.addEventListener("DOMContentLoaded", boot);
    else boot();
  }
})();
