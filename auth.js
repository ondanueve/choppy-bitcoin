(() => {
  const supabase = window.supabase && window.supabase.createClient
    ? window.supabase.createClient()
    : null;

  let currentUser = null;
  let currentProfile = null;
  let isSignUpMode = false;
  const BOARD_SEASON = "2026-09-07T18:00:00.000Z";
  function seasonScore(row) {
    if (!row) return 0;
    const at = row.last_score_at ? Date.parse(row.last_score_at) : 0;
    if (!at || at < Date.parse(BOARD_SEASON)) return 0;
    return Number(row.highscore != null ? row.highscore : row.high_score) || 0;
  }

  const AWARD_FALLBACK = [
    { id: "maxi", name: "Maxi Soul", nameEs: "Alma maxi", why: "Never sold BTC — not by hand, not by A.I. bud.", whyEs: "Nunca vendió BTC, ni a mano ni por A.I. bud." },
    { id: "halver", name: "Halving Catcher", nameEs: "Atrapa halvings", why: "Every halving that spawned was eaten.", whyEs: "Comió todos los halvings que salieron." },
    { id: "nocoiner", name: "Nocoiner", nameEs: "Nocoiner", why: "Never bought BTC in that run.", whyEs: "Nunca compró BTC en esa partida." },
    { id: "greedy", name: "Greedy Miner", nameEs: "Minero greedy", why: "Ate 0 halvings.", whyEs: "Comió 0 halvings." },
    { id: "opsec", name: "Opsec Warrior", nameEs: "Guerrero opsec", why: "Lost 0 cold storage.", whyEs: "No perdió cold storage." },
    { id: "paper", name: "Paper Hands", nameEs: "Manos de papel", why: "Sold BTC in a bear market.", whyEs: "Vendió BTC en un bear market." }
  ];
  function awardHtmlLocal() {
    if (window.choppyAwardHtml) return window.choppyAwardHtml();
    let owned = {};
    try {
      const bag = JSON.parse(localStorage.getItem("choppy-awards") || "{}");
      owned = bag[window.choppyUserId || "guest"] || {};
    } catch (e) {}
    const es = window.BZ && BZ.lang && BZ.lang() === "es";
    const got = AWARD_FALLBACK.filter((a) => owned[a.id]);
    const head = tr("awards", "Awards");
    if (!got.length) return "<details class=\"aw-box\"><summary>" + head + " (0)</summary><p>" + tr("noAwards", "No awards yet.") + "</p></details>";
    return "<details class=\"aw-box\"><summary>" + head + " (" + got.length + ")</summary>" + got.map((a) => {
      const name = es ? (a.nameEs || a.name) : a.name;
      const why = es ? (a.whyEs || a.why) : a.why;
      return "<p class=\"aw-on\"><b>✓ " + name + "</b> — " + why + "</p>";
    }).join("") + "</details>";
  }
  const $ = (id) => document.getElementById(id);
  const authModal = $("auth-modal");
  const profileModal = $("profile-modal");
  const a11yReturn = new WeakMap();
  function a11yNodes(root) {
    return Array.prototype.filter.call(root.querySelectorAll("a[href],button:not([disabled]),input:not([disabled]):not([type=hidden]),select:not([disabled]),textarea:not([disabled])"), (el) => {
      if (el.tabIndex < 0 || el.classList.contains("hp") || el.closest(".hide")) return false;
      return el.getClientRects().length > 0;
    });
  }
  function onModalKey(e) {
    const root = e.currentTarget;
    if (!root.classList.contains("open")) return;
    if (e.key === "Escape") {
      e.preventDefault();
      e.stopPropagation();
      closeModal(root);
      return;
    }
    if (e.key !== "Tab") return;
    const list = a11yNodes(root);
    if (!list.length) { e.preventDefault(); return; }
    const first = list[0], last = list[list.length - 1], cur = document.activeElement;
    if (e.shiftKey && (cur === first || !root.contains(cur))) { e.preventDefault(); last.focus(); }
    else if (!e.shiftKey && (cur === last || !root.contains(cur))) { e.preventDefault(); first.focus(); }
  }
  function armModal(el) {
    if (!el || el.dataset.a11yTrap) return;
    el.dataset.a11yTrap = "1";
    el.setAttribute("role", "dialog");
    el.setAttribute("aria-modal", "true");
    const h = el.querySelector("h1, h2");
    if (h) {
      if (!h.id) h.id = el.id + "-title";
      el.setAttribute("aria-labelledby", h.id);
    }
    el.addEventListener("keydown", onModalKey);
  }
  function openModal(el) {
    if (!el) return;
    armModal(el);
    const prev = document.activeElement;
    if (prev && prev !== document.body) a11yReturn.set(el, prev);
    el.classList.add("open");
    el.classList.remove("hide");
    el.hidden = false;
    el.style.setProperty("display", "flex", "important");
    el.style.setProperty("pointer-events", "auto", "important");
    el.style.zIndex = "9999";
    const nodes = a11yNodes(el);
    const first = nodes.filter((n) => n.tagName === "INPUT")[0] || nodes[0];
    setTimeout(() => { try { if (first && el.classList.contains("open")) first.focus(); } catch (err) {} }, 30);
  }
  function closeModal(el) {
    if (!el) return;
    const was = el.classList.contains("open");
    el.classList.remove("open");
    el.classList.add("hide");
    el.hidden = true;
    el.style.setProperty("display", "none", "important");
    el.style.setProperty("pointer-events", "none", "important");
    if (!was) return;
    const prev = a11yReturn.get(el);
    a11yReturn.delete(el);
    if (prev && prev.focus && document.contains(prev)) { try { prev.focus(); } catch (err) {} }
  }
  const authMsg = $("auth-msg");

  let lastMsgKey = "";
  let lastMsgFb = "";
  let lastMsgBad = false;
  let lastMsgVars = null;
  let lastHintKey = "";
  let lastHintFb = "";
  let lastHintVars = null;

  function tr(key, fb) {
    if (window.BZ && typeof BZ.t === "function") {
      const v = BZ.t(key);
      if (v && v !== key) return v;
    }
    return fb;
  }

  function setMsg(text, bad) {
    if (!text) {
      lastMsgKey = "";
      lastMsgFb = "";
      lastMsgVars = null;
    }
    if (!authMsg) return;
    authMsg.textContent = text || "";
    authMsg.classList.toggle("bad", !!bad);
  }

  function netDown() {
    return typeof navigator !== "undefined" && navigator.onLine === false;
  }
  function netErr(err) {
    const msg = String(err && err.message || err || "");
    return netDown() || /offline|failed to fetch|networkerror|load failed|network request failed/i.test(msg);
  }
  function showNet(kind) {
    if (typeof window.choppyNetBlock === "function") window.choppyNetBlock(kind);
  }
  function sayMsg(key, fb, bad, vars) {
    lastMsgKey = key;
    lastMsgFb = fb;
    lastMsgBad = !!bad;
    lastMsgVars = vars || null;
    let text = tr(key, fb);
    if (vars) Object.keys(vars).forEach((k) => { text = text.split("{" + k + "}").join(String(vars[k])); });
    setMsg(text, bad);
  }

  function sayHint(el, key, fb, vars) {
    lastHintKey = key;
    lastHintFb = fb;
    lastHintVars = vars || null;
    if (!el) return;
    let text = tr(key, fb);
    if (vars) Object.keys(vars).forEach((k) => { text = text.split("{" + k + "}").join(String(vars[k])); });
    el.textContent = text;
  }

  function validAlias(s) {
    return /^[a-zA-Z0-9_]{3,16}$/.test(s);
  }

  function profileHref(name) {
    const n = String(name || "").replace(/^@/, "").trim();
    return "/choppy-bitcoin/u/?u=" + encodeURIComponent(n);
  }

  function fmtScoreBtc(sats) {
    const btc = (Number(sats) || 0) / 1e4;
    if (btc >= 1) return btc.toFixed(4) + " BTC";
    if (btc >= 0.0001) return btc.toFixed(6) + " BTC";
    return btc.toFixed(8) + " BTC";
  }

  function aliasReady(profile) {
    if (!profile || !profile.alias_changed_at) return true;
    const t = Date.parse(profile.alias_changed_at);
    if (!t) return true;
    return Date.now() - t >= 30 * 24 * 3600 * 1000;
  }

  function aliasNextDate(profile) {
    const t = Date.parse(profile && profile.alias_changed_at);
    if (!t) return "";
    return new Date(t + 30 * 24 * 3600 * 1000).toLocaleDateString();
  }

  function updateAuthUI(profile) {
    const btn = $("btn-show-auth");
    const tag = $("user-profile-tag");
    const localAlias = (function () {
      try { return localStorage.getItem("choppy-alias") || ""; } catch (e) { return ""; }
    })();
    const name = (localAlias || (profile && profile.username) || "").trim();
    if (profile && name) {
      window.choppyUsername = name;
      window.choppySignedIn = true;
      window.choppyUid = currentUser && currentUser.id || null;
      window.choppyElo = profile && profile.elo != null ? Number(profile.elo) : 1000;
      if (btn) btn.classList.add("hide");
      if (tag) {
        tag.classList.remove("hide");
        tag.innerHTML = "<a class=\"user-link\" href=\"" + profileHref(name) + "\" target=\"_blank\" rel=\"noopener\">@" + name + "</a>";
      }
    } else {
      window.choppySignedIn = false;
      window.choppyUsername = "";
      window.choppyUid = null;
      window.choppyElo = null;
      if (btn) btn.classList.remove("hide");
      if (tag) {
        tag.classList.add("hide");
        tag.textContent = "";
      }
    }
    const cta = $("cta-signup");
    if (cta) cta.classList.toggle("hide", !!(profile && name));
    fetchGlobalLeaderboard();
    fetchIndepBoard();
    fetchEloBoard("site-elo");
    if (typeof window.refreshChoppyAuth === "function") window.refreshChoppyAuth();
  }

  async function checkActiveSession() {
    if (!supabase) { updateAuthUI(null); return; }
    const { data, error } = await supabase.auth.getSession();
    if (error || !data.session) {
      currentUser = null; currentProfile = null;
      updateAuthUI(null);
      return;
    }
    currentUser = data.session.user || { id: "" };
    window.choppyUserId = currentUser.id || "";
    const rec = /[?&#]type=recovery\b/.test(location.hash + location.search);
    await loadUserProfile();
    if (rec) openReset();
    else closeModal(authModal);
  }

  function loadType() {
    try {
      const s = JSON.parse(localStorage.getItem("bitcoinizate-sb") || "null");
      return s && s.type === "recovery";
    } catch (e) { return false; }
  }

  async function sendReset() {
    const email = ($("auth-email") && $("auth-email").value || "").trim();
    if (!email) { sayMsg("authEmailFirst", "Enter your email first.", true); return; }
    if (!supabase) { sayMsg("authOffline", "Auth is offline.", true); return; }
    sayMsg("authSending", "Sending reset mail…");
    const { error } = await supabase.auth.resetPasswordForEmail(email, {
      redirectTo: location.origin + "/choppy-bitcoin/"
    });
    if (error) {
      lastMsgKey = "";
      setMsg(error.message || tr("authMailFail", "Could not send mail."), true);
    } else sayMsg("authMailSent", "If that inbox exists, a reset link is on the way.");
  }

  function openReset() {
    if ($("modal-auth-title")) $("modal-auth-title").textContent = tr("newPass", "New password");
    if ($("group-alias")) $("group-alias").classList.add("hide");
    const emailLab = $("auth-email") && $("auth-email").closest("label");
    if (emailLab) emailLab.classList.add("hide");
    if ($("group-pass2")) $("group-pass2").classList.remove("hide");
    if ($("auth-password")) {
      $("auth-password").value = "";
      $("auth-password").autocomplete = "new-password";
    }
    if ($("auth-password2")) $("auth-password2").value = "";
    if ($("btn-submit-auth")) {
      $("btn-submit-auth").textContent = tr("savePass", "Save password");
      $("btn-submit-auth").dataset.reset = "1";
    }
    if ($("btn-forgot")) $("btn-forgot").classList.add("hide");
    if ($("btn-toggle-auth")) $("btn-toggle-auth").classList.add("hide");
    if (authModal) openModal(authModal);
    sayMsg("choosePass", "Choose a new password.");
  }

  function showSignFields() {
    const emailLab = $("auth-email") && $("auth-email").closest("label");
    if (emailLab) emailLab.classList.remove("hide");
    if ($("group-pass2")) $("group-pass2").classList.add("hide");
    if ($("auth-password")) $("auth-password").autocomplete = "current-password";
    if ($("btn-forgot")) $("btn-forgot").classList.remove("hide");
    if ($("btn-toggle-auth")) $("btn-toggle-auth").classList.remove("hide");
    if ($("btn-submit-auth")) delete $("btn-submit-auth").dataset.reset;
  }

  async function saveNewPassword() {
    const password = ($("auth-password") && $("auth-password").value || "").trim();
    const again = ($("auth-password2") && $("auth-password2").value || "").trim();
    if (password.length < 8) { sayMsg("authPassShort", "Password must be at least 8 characters.", true); return; }
    if (password !== again) { sayMsg("authPassMatch", "Passwords do not match.", true); return; }
    const { error } = await supabase.auth.updateUser({ password });
    if (error) {
      lastMsgKey = "";
      setMsg(error.message || tr("authPassFail", "Could not update password."), true);
      return;
    }
    try {
      const s = JSON.parse(localStorage.getItem("bitcoinizate-sb") || "null");
      if (s) { delete s.type; localStorage.setItem("bitcoinizate-sb", JSON.stringify(s)); }
    } catch (e) {}
    if ($("btn-submit-auth")) delete $("btn-submit-auth").dataset.reset;
    showSignFields();
    sayMsg("authPassSaved", "Password saved. You are signed in.");
    await checkActiveSession();
  }

  async function loadUserProfile() {
    if (!currentUser || !supabase) return;
    const localAlias = (function () {
      try { return localStorage.getItem("choppy-alias") || ""; } catch (e) { return ""; }
    })();
    const fallbackName = localAlias
      || (currentUser.user_metadata && currentUser.user_metadata.username)
      || "trader";
    let { data, error } = await supabase.from("profiles").select("*").eq("id", currentUser.id).single();
    if (error || !data) {
      await supabase.from("profiles").insert([{
        id: currentUser.id,
        username: fallbackName,
        email: currentUser.email || null,
        highscore: 0
      }]);
      const again = await supabase.from("profiles").select("*").eq("id", currentUser.id).single();
      data = again.data;
      error = again.error;
    }
    if (error || !data) {
      currentProfile = { id: currentUser.id, username: fallbackName, highscore: 0 };
      updateAuthUI(currentProfile);
      return;
    }
    if (localAlias && validAlias(localAlias) && data.username !== localAlias) {
      const up = await supabase.from("profiles").update({ username: localAlias }).eq("id", currentUser.id);
      if (!up || up.error) {
        try { await supabase.rpc("change_alias", { p_alias: localAlias }); } catch (e) {}
      }
      data.username = localAlias;
    }
    currentProfile = data;
    window.choppyUserId = currentUser.id || "";
    if (currentUser.email && data.email !== currentUser.email) {
      try { await supabase.from("profiles").update({ email: currentUser.email }).eq("id", currentUser.id); } catch (e) {}
      currentProfile.email = currentUser.email;
    }
    if (Array.isArray(data.awards) && window.mergeChoppyAwards) window.mergeChoppyAwards(data.awards);
    updateAuthUI(currentProfile);
  }

  async function handleAuthSubmit() {
    if ($("arcade-honeypot") && $("arcade-honeypot").value) {
      if (authModal) closeModal(authModal);
      return;
    }
    const email = ($("auth-email") && $("auth-email").value || "").trim();
    const password = ($("auth-password") && $("auth-password").value || "").trim();
    const username = ($("auth-username") && $("auth-username").value || "").trim();
    if (!email || !password) { sayMsg("authNeedBoth", "Enter email or alias, and password.", true); return; }
    if (password.length < 8) { sayMsg("authPassShort", "Password must be at least 8 characters.", true); return; }
    if (!supabase || netDown()) {
      sayMsg("netSignIn", "Sign-in needs a connection. You can keep playing as a guest on this device.", true);
      showNet("signIn");
      return;
    }
    sayMsg("authWorking", "Working…");
    try {
      if (isSignUpMode) {
        if (!validAlias(username)) { sayMsg("authAliasRule", "Alias: 3–16 letters, numbers or _.", true); return; }
        const { data, error } = await supabase.auth.signUp({
          email, password, options: { data: { username } }
        });
        if (error) throw error;
        if (data.session && data.user) {
          currentUser = data.user;
          try {
            await supabase.from("profiles").insert([{ id: data.user.id, username, email, highscore: 0 }]);
          } catch (e) {}
          await loadUserProfile();
          if (authModal) closeModal(authModal);
          setMsg("");
        } else {
          sayMsg("authConfirmEmail", "Check your email to confirm the account.");
        }
      } else {
        let loginId = email;
        if (loginId.indexOf("@") < 0) {
          const look = await supabase.rpc("email_for_alias", { p_alias: loginId });
          if (look.error || !look.data) throw new Error(tr("authNoAlias", "No account for that alias."));
          loginId = typeof look.data === "string" ? look.data : (look.data.email || look.data);
        }
        const { data, error } = await supabase.auth.signInWithPassword({ email: loginId, password });
        if (error) throw error;
        currentUser = data.user;
        await loadUserProfile();
        if (authModal) closeModal(authModal);
        setMsg("");
      }
    } catch (e) {
      if (netErr(e)) {
        sayMsg("netSignIn", "Sign-in needs a connection. You can keep playing as a guest on this device.", true);
        showNet("signIn");
        return;
      }
      lastMsgKey = "";
      setMsg(e.message || tr("authFailed", "Authentication failed."), true);
    }
  }

  async function saveAliasOnly() {
    if (!currentUser) return;
    const hint = $("alias-hint");
    const aliasEl = $("profile-alias");
    const next = aliasEl ? aliasEl.value.trim() : "";
    if (!validAlias(next)) {
      sayHint(hint, "authAliasRule", "Alias: 3–16 letters, numbers or _.");
      return;
    }
    try { localStorage.setItem("choppy-alias", next); } catch (e) {}
    if (currentProfile) currentProfile.username = next;
    window.choppyUsername = next;
    updateAuthUI(currentProfile || { username: next, highscore: 0 });
    sayHint(hint, "authSavingAlias", "Saving alias…");
    if (!supabase) return;
    try {
      let { error } = await supabase.from("profiles").update({ username: next }).eq("id", currentUser.id);
      if (error) {
        const rpc = await supabase.rpc("change_alias", { p_alias: next });
        error = rpc && rpc.error;
      }
      if (error) {
        await supabase.from("profiles").insert([{ id: currentUser.id, username: next, email: currentUser.email || null, highscore: 0 }]);
      }
      sayHint(hint, "authAliasSaved", "Alias updated.");
    } catch (e) {
      sayHint(hint, "authAliasOnline", "Could not save alias online.");
    }
  }

  function addrReady() {
    try {
      const t = Number(localStorage.getItem("choppy-addr-at") || 0);
      if (!t) return true;
      return Date.now() - t >= 24 * 3600 * 1000;
    } catch (e) { return true; }
  }
  function addrNextDate() {
    try {
      const t = Number(localStorage.getItem("choppy-addr-at") || 0);
      if (!t) return "";
      return new Date(t + 24 * 3600 * 1000).toLocaleString();
    } catch (e) { return ""; }
  }
  async function updateProfileAddresses() {
    if (!currentUser || !supabase) return;
    const hint = $("alias-hint");
    const btcEl = $("profile-btc-addr");
    const lnEl = $("profile-ln-addr");
    const btcAddr = (btcEl && btcEl.value || "").trim();
    const lnAddr = (lnEl && lnEl.value || "").trim();
    const same = btcAddr === (currentProfile && currentProfile.btc_address || "")
      && lnAddr === (currentProfile && currentProfile.ln_address || "");
    if (same) {
      sayHint(hint, "authNoChange", "No changes.");
      return;
    }
    if (!addrReady()) {
      const when = addrNextDate();
      sayHint(hint, "authAddrDaily", "Addresses can change once a day. Next: {when}", { when: when });
      sayMsg("authAddrDaily", "Addresses can change once a day. Next: {when}", true, { when: when });
      return;
    }
    try {
      const res = await supabase.from("profiles").update({ btc_address: btcAddr, ln_address: lnAddr }).eq("id", currentUser.id);
      if (res && res.error) {
        lastHintKey = "";
        lastMsgKey = "";
        const msg = res.error.message || tr("authSaveFail", "Could not save.");
        if (hint) hint.textContent = msg;
        setMsg(msg, true);
        return;
      }
      try { localStorage.setItem("choppy-addr-at", String(Date.now())); } catch (e) {}
      await loadUserProfile();
      sayHint(hint, "authSaved24", "Saved. Next change after 24h.");
      if (btcEl) btcEl.disabled = true;
      if (lnEl) lnEl.disabled = true;
    } catch (e) {
      const why = e.message || tr("authFailed", "Authentication failed.");
      lastHintKey = "";
      lastMsgKey = "";
      const msg = tr("authUpdateFail", "Update failed: {why}").split("{why}").join(why);
      if (hint) hint.textContent = msg;
      setMsg(msg, true);
    }
  }

  async function fetchGlobalLeaderboard(targetId) {
    const box = $(targetId || "leaderboard-box") || $("site-board");
    if (!box || !supabase) return;
    try {
      let rows = [];
      let res = await supabase.from("profiles").select("username, highscore, last_score_at, score_time, run_stats").order("highscore", { ascending: false }).limit(40);
      if (res.error) {
        res = await supabase.from("profiles").select("username, highscore, last_score_at").order("highscore", { ascending: false }).limit(40);
        if (res.error) throw res.error;
      }
      rows = (res.data || []).filter((row) => seasonScore(row) > 0);
      rows.sort((a, b) => {
        const sa = seasonScore(a), sb = seasonScore(b);
        if (sb !== sa) return sb - sa;
        const ta = a.score_time != null ? Number(a.score_time) : 1e18;
        const tb = b.score_time != null ? Number(b.score_time) : 1e18;
        return ta - tb;
      });
      rows = rows.slice(0, 20);
      if (!rows.length) { box.textContent = "—"; return; }
      box.innerHTML = rows.map((row, i) => {
        const n = row.username || "?";
        const href = validAlias(n) ? profileHref(n) : "#";
        const has = row.run_stats ? "1" : "";
        const clock = row.score_time != null ? fmtClock(row.score_time) : "";
        return "<div class=\"board-row\">" + (i + 1) + ". <a class=\"user-link\" href=\"" + href + "\" target=\"_blank\" rel=\"noopener\">@" + n + "</a> <span>" + fmtScoreBtc(seasonScore(row)) + "</span>"
          + (clock ? " <small>" + clock + "</small>" : "")
          + (has ? " <button type=\"button\" class=\"stats-mini\" data-run=\"" + i + "\">STATS</button>" : "")
          + "</div>";
      }).join("");
      box.querySelectorAll("[data-run]").forEach((btn) => {
        btn.onclick = (e) => {
          e.preventDefault();
          e.stopPropagation();
          const i = Number(btn.getAttribute("data-run"));
          const bag = rows[i] && rows[i].run_stats;
          if (bag && window.openSavedRunStats) window.openSavedRunStats(bag);
        };
      });
    } catch (e) {
      box.textContent = "—";
    }
  }

  function fmtClock(t) {
    const s = Math.max(0, Math.floor(Number(t) || 0));
    return Math.floor(s / 60) + ":" + String(s % 60).padStart(2, "0");
  }

  async function fetchIndepBoard(targetId) {
    const box = $(targetId || "site-indep") || $("ready-indep");
    if (!box || !supabase) return;
    try {
      const res = await supabase.from("profiles").select("username, indep_s, indep_at").limit(80);
      if (res.error) { box.textContent = "—"; return; }
      const season = Date.parse(BOARD_SEASON);
      let rows = (res.data || []).filter((row) => {
        const t = Number(row.indep_s);
        if (!(t > 0)) return false;
        const at = row.indep_at ? Date.parse(row.indep_at) : 0;
        return at && at >= season;
      });
      rows.sort((a, b) => Number(a.indep_s) - Number(b.indep_s) || Date.parse(a.indep_at) - Date.parse(b.indep_at));
      rows = rows.slice(0, 20);
      if (!rows.length) { box.textContent = "—"; return; }
      box.innerHTML = rows.map((row, i) => {
        const n = row.username || "?";
        const href = validAlias(n) ? profileHref(n) : "#";
        return "<div class=\"board-row\">" + (i + 1) + ". <a class=\"user-link\" href=\"" + href + "\" target=\"_blank\" rel=\"noopener\">@" + n + "</a> <span>" + fmtClock(row.indep_s) + "</span></div>";
      }).join("");
    } catch (e) {
      box.textContent = "—";
    }
  }

  async function submitIndependence(life, candles) {
    if (!currentUser || !supabase) return;
    const t = Number(life) || 0;
    const c = Math.round(Number(candles) || 0);
    if (t < 12 || c < 3) return;
    try {
      const { error } = await supabase.rpc("submit_independence", { p_life: t, p_candles: c });
      if (error) return;
      fetchIndepBoard("ready-indep");
      fetchIndepBoard("site-indep");
    } catch (e) {}
  }

  async function fetchEloBoard(targetId) {
    const box = $(targetId || "site-elo") || $("ready-elo");
    if (!box || !supabase) return;
    try {
      let res = await supabase.from("profiles").select("username, elo, elo_games").order("elo", { ascending: false }).limit(40);
      if (res.error) { box.textContent = "—"; return; }
      const rows = (res.data || []).filter((r) => (Number(r.elo_games) || 0) > 0 || (Number(r.elo) || 0) !== 1000);
      rows.sort((a, b) => (Number(b.elo) || 0) - (Number(a.elo) || 0) || (Number(b.elo_games) || 0) - (Number(a.elo_games) || 0));
      const top = rows.slice(0, 20);
      if (!top.length) { box.textContent = "—"; return; }
      box.innerHTML = top.map((row, i) => {
        const n = row.username || "?";
        const href = validAlias(n) ? profileHref(n) : "#";
        const elo = Math.round(Number(row.elo) || 1000);
        const g = Number(row.elo_games) || 0;
        return "<div class=\"board-row\">" + (i + 1) + ". <a class=\"user-link\" href=\"" + href + "\" target=\"_blank\" rel=\"noopener\">@" + n + "</a> <span>" + elo + "</span>"
          + (g ? " <small>" + g + "</small>" : "") + "</div>";
      }).join("");
    } catch (e) {
      box.textContent = "—";
    }
  }

  function versusRpcMiss(error) {
    const msg = String((error && (error.message || error.code)) || "");
    return /duration|PGRST202|schema cache|Could not find the function/i.test(msg);
  }

  async function submitVersusResult(seed, winnerUid, playerUids, durationS) {
    if (!supabase || !currentUser) return { status: "guest" };
    const ids = (playerUids || []).filter((id) => typeof id === "string" && id.length > 20);
    if (!winnerUid || ids.length < 2 || ids.indexOf(currentUser.id) < 0) return { status: "guest" };
    const body = {
      p_seed: Number(seed) || 0,
      p_winner: winnerUid,
      p_players: ids
    };
    const dur = Number(durationS);
    if (isFinite(dur) && dur >= 0) body.p_duration_s = Math.max(0, Math.round(dur));
    try {
      let res = await supabase.rpc("submit_versus_result", body);
      if (res.error && body.p_duration_s != null && versusRpcMiss(res.error)) {
        res = await supabase.rpc("submit_versus_result", {
          p_seed: body.p_seed,
          p_winner: body.p_winner,
          p_players: body.p_players
        });
      }
      if (res.error) return { status: "pending" };
      let rows = res.data;
      if (typeof rows === "string") try { rows = JSON.parse(rows); } catch (e) { rows = null; }
      if (Array.isArray(rows) && rows.length) {
        await loadUserProfile();
        fetchEloBoard("ready-elo");
        fetchEloBoard("site-elo");
      }
      return rows;
    } catch (e) {
      return { status: "pending" };
    }
  }

  async function submitNewHighScore(n, meta) {
    if (!currentUser || !currentProfile) return;
    if (!supabase) return;
    const next = Number(n) || 0;
    if (next <= 0 || !isFinite(next)) return;
    if (next > 21e6 * 250000) return;
    const life = meta && Number(meta.lifeT) || 0;
    const candles = meta && Number(meta.candles) || 0;
    if (life < 12 || candles < 3) return;
    if (meta && meta.human === false) return;
    const old = seasonScore(currentProfile);
    const oldT = currentProfile.score_time != null ? Number(currentProfile.score_time) : null;
    const improving = next > old || (next === old && (oldT == null || life < oldT));
    const stats = meta && meta.stats ? meta.stats : null;
    if (netDown()) {
      showNet("score");
      return;
    }
    try {
      let { error } = await supabase.rpc("submit_choppy_score", {
        p_score: next,
        p_life: life,
        p_candles: candles,
        p_stats: stats
      });
      if (error) {
        if (netErr(error)) {
          showNet("score");
          return;
        }
        const msg = String(error.message || "");
        const statsRejected = /bad stats|stats mismatch/i.test(msg);
        const retry = await supabase.rpc("submit_choppy_score", {
          p_score: next,
          p_life: life,
          p_candles: candles
        });
        error = retry.error;
        if (!error && stats && improving && !statsRejected) {
          try { await supabase.from("profiles").update({ run_stats: stats, score_time: life }).eq("id", currentUser.id); } catch (e2) {}
        }
      }
      if (error) {
        if (netErr(error)) showNet("score");
        return;
      }
      if (improving) await loadUserProfile();
      const mine = localAwardIds();
      if (mine.length && window.persistAwards) await window.persistAwards(mine);
    } catch (e) {
      if (netErr(e)) showNet("score");
    }
  }

  function toggleAuthMode() {
    isSignUpMode = !isSignUpMode;
    showSignFields();
    const title = $("modal-auth-title");
    const group = $("group-alias");
    if (title) title.textContent = isSignUpMode ? tr("signUp", "Sign up") : tr("signIn", "Sign in");
    if (group) group.classList.toggle("hide", !isSignUpMode);
    if ($("btn-submit-auth")) $("btn-submit-auth").textContent = isSignUpMode ? tr("createAccount", "Create account") : tr("signIn", "Sign in");
    if ($("btn-toggle-auth")) $("btn-toggle-auth").textContent = isSignUpMode ? tr("haveAccount", "Have an account?") : tr("needAccount", "Need an account?");
    setMsg("");
  }

  function openAuth() {
    if (currentUser && currentProfile) {
      const tag = $("user-profile-tag");
      if (tag) tag.click();
      return;
    }
    if (netDown()) {
      sayMsg("netSignIn", "Sign-in needs a connection. You can keep playing as a guest on this device.", true);
      showNet("signIn");
      return;
    }
    isSignUpMode = false;
    showSignFields();
    if ($("modal-auth-title")) $("modal-auth-title").textContent = tr("signIn", "Sign in");
    if ($("group-alias")) $("group-alias").classList.add("hide");
    if ($("btn-submit-auth")) $("btn-submit-auth").textContent = tr("signIn", "Sign in");
    if ($("btn-toggle-auth")) $("btn-toggle-auth").textContent = tr("needAccount", "Need an account?");
    setMsg("");
    if (authModal) openModal(authModal);
  }

  function refreshAuthText() {
    const title = $("modal-auth-title");
    const submit = $("btn-submit-auth");
    const toggle = $("btn-toggle-auth");
    const reset = submit && submit.dataset.reset === "1";
    if (reset) {
      if (title) title.textContent = tr("newPass", "New password");
      if (submit) submit.textContent = tr("savePass", "Save password");
    } else if (isSignUpMode) {
      if (title) title.textContent = tr("signUp", "Sign up");
      if (submit) submit.textContent = tr("createAccount", "Create account");
      if (toggle) toggle.textContent = tr("haveAccount", "Have an account?");
    } else {
      if (title) title.textContent = tr("signIn", "Sign in");
      if (submit) submit.textContent = tr("signIn", "Sign in");
      if (toggle) toggle.textContent = tr("needAccount", "Need an account?");
    }
    if (lastMsgKey) {
      let text = tr(lastMsgKey, lastMsgFb);
      if (lastMsgVars) Object.keys(lastMsgVars).forEach((k) => { text = text.split("{" + k + "}").join(String(lastMsgVars[k])); });
      setMsg(text, lastMsgBad);
    }
    const hint = $("alias-hint");
    if (lastHintKey && hint) sayHint(hint, lastHintKey, lastHintFb, lastHintVars);
    const box = $("profile-awards");
    if (box && profileModal && !profileModal.classList.contains("hide")) box.innerHTML = awardHtmlLocal();
    const score = $("profile-score-info");
    if (score && currentProfile && profileModal && !profileModal.classList.contains("hide")) {
      const hs = seasonScore(currentProfile);
      score.innerHTML = tr("highScore", "High score") + "  " + fmtScoreBtc(hs)
        + (currentProfile.run_stats ? " <button type=\"button\" class=\"stats-mini\" id=\"profile-stats-btn\">" + tr("runStats", "STATS") + "</button>" : "");
      const ps = $("profile-stats-btn");
      if (ps) ps.onclick = (ev) => {
        ev.preventDefault();
        ev.stopPropagation();
        if (window.openSavedRunStats) window.openSavedRunStats(currentProfile.run_stats);
      };
    }
  }
  window.addEventListener("bz-lang", refreshAuthText);

  window.openAuth = openAuth;
  window.closeAuth = () => closeModal(authModal);
  document.addEventListener("click", (e) => {
    const btn = e.target.closest && e.target.closest("#btn-show-auth, #overlay-auth");
    if (!btn) return;
    e.preventDefault();
    e.stopPropagation();
    if (window.pauseChoppyForAuth) window.pauseChoppyForAuth();
    openAuth();
  }, true);
  if ($("btn-close-auth")) $("btn-close-auth").onclick = () => authModal && closeModal(authModal);
  if ($("btn-toggle-auth")) $("btn-toggle-auth").onclick = toggleAuthMode;
  if ($("btn-submit-auth")) $("btn-submit-auth").onclick = () => {
    if ($("btn-submit-auth").dataset.reset === "1") saveNewPassword();
    else handleAuthSubmit();
  };
  if ($("btn-forgot")) $("btn-forgot").onclick = (e) => { e.preventDefault(); sendReset(); };
  ["auth-email", "auth-password", "auth-username", "auth-password2"].forEach((id) => {
    const el = $(id);
    if (el) el.addEventListener("keydown", (e) => {
      if (e.key !== "Enter") return;
      if ($("btn-submit-auth") && $("btn-submit-auth").dataset.reset === "1") saveNewPassword();
      else handleAuthSubmit();
    });
  });

  if ($("user-profile-tag")) {
    $("user-profile-tag").onclick = (e) => {
      if (e.target && e.target.closest && e.target.closest("a")) return;
      if (!currentProfile) return;
      if ($("profile-score-info")) {
        const hs = seasonScore(currentProfile);
        $("profile-score-info").innerHTML = tr("highScore", "High score") + "  " + fmtScoreBtc(hs)
          + (currentProfile.run_stats ? " <button type=\"button\" class=\"stats-mini\" id=\"profile-stats-btn\">" + tr("runStats", "STATS") + "</button>" : "");
        const ps = $("profile-stats-btn");
        if (ps) ps.onclick = (e) => {
          e.preventDefault();
          e.stopPropagation();
          if (window.openSavedRunStats) window.openSavedRunStats(currentProfile.run_stats);
        };
      }
      if ($("profile-alias")) {
        const localA = (function () { try { return localStorage.getItem("choppy-alias") || ""; } catch (e) { return ""; } })();
        $("profile-alias").value = localA || currentProfile.username || "";
        $("profile-alias").disabled = false;
      }
      if ($("alias-hint")) {
        if (addrReady()) {
          lastHintKey = "";
          $("alias-hint").textContent = "";
        } else sayHint($("alias-hint"), "authAddrLock", "Addresses locked until {when}", { when: addrNextDate() });
      }
      if ($("profile-btc-addr")) {
        $("profile-btc-addr").value = currentProfile.btc_address || "";
        $("profile-btc-addr").disabled = !addrReady();
      }
      if ($("profile-ln-addr")) {
        $("profile-ln-addr").value = currentProfile.ln_address || "";
        $("profile-ln-addr").disabled = !addrReady();
      }
      const box = $("profile-awards");
      if (box) box.innerHTML = awardHtmlLocal();
      if (profileModal) openModal(profileModal);
    };
  }
  if ($("btn-close-profile")) $("btn-close-profile").onclick = () => profileModal && closeModal(profileModal);
  if (profileModal) profileModal.addEventListener("click", (e) => {
    if (e.target === profileModal) closeModal(profileModal);
  });
  if (authModal) authModal.addEventListener("click", (e) => {
    if (e.target === authModal) closeModal(authModal);
  });
  if ($("btn-save-profile")) $("btn-save-profile").onclick = updateProfileAddresses;
  if ($("btn-save-alias")) $("btn-save-alias").onclick = saveAliasOnly;
  if ($("btn-logout")) {
    $("btn-logout").onclick = async () => {
      if (supabase) await supabase.auth.signOut();
      currentUser = null; currentProfile = null;
      window.choppyUserId = "";
      window.choppyUsername = "";
      updateAuthUI(null);
      if (profileModal) closeModal(profileModal);
    };
  }

  let awardsRpcWarned = false;
  function rpcMissing(error) {
    if (!error) return false;
    const code = String(error.code || "");
    const status = Number(error.status || error.statusCode || 0);
    const msg = String(error.message || error.msg || "");
    if (code === "PGRST202" || code === "404" || status === 404) return true;
    if (/PGRST202/i.test(msg)) return true;
    if (/could not find the function/i.test(msg)) return true;
    if (/schema cache/i.test(msg) && /grant_awards/i.test(msg)) return true;
    return false;
  }
  function localAwardIds() {
    if (!currentUser) return [];
    try {
      const bag = JSON.parse(localStorage.getItem("choppy-awards") || "{}");
      const map = bag[currentUser.id] || {};
      return Object.keys(map).filter((k) => map[k] && typeof k === "string");
    } catch (e) {
      return [];
    }
  }
  function compactAwardRun() {
    try {
      const saved = JSON.parse(localStorage.getItem("bitcoinizate-v1") || "{}");
      const st = saved && saved.choppyStats;
      if (!st || typeof st !== "object") return null;
      const keep = ["time", "candles", "buys", "sells", "sellsBear", "coldLost", "boughtBtc", "swans", "lasers", "halvings", "halveMiss", "endBtc", "net", "startCash", "startPrice", "haveSum", "iabud", "iaProfit", "job", "hitCap", "perkMaxed"];
      const out = {};
      keep.forEach((k) => {
        if (st[k] != null) out[k] = st[k];
      });
      return out;
    } catch (e) {
      return null;
    }
  }
  window.persistAwards = async function (ids) {
    if (!currentUser || !supabase || !ids || !Array.isArray(ids) || !ids.length) return;
    try {
      const { data, error } = await supabase.rpc("grant_awards", {
        p_ids: ids,
        p_run: compactAwardRun()
      });
      if (error) {
        if (rpcMissing(error)) {
          if (!awardsRpcWarned) {
            awardsRpcWarned = true;
            console.warn("grant_awards is not available yet; awards stay on this device.");
          }
        }
        return;
      }
      let back = data;
      if (typeof back === "string") {
        try { back = JSON.parse(back); } catch (e) { back = null; }
      }
      if (Array.isArray(back)) {
        if (currentProfile) currentProfile.awards = back;
        if (window.mergeChoppyAwards) {
          try { window.mergeChoppyAwards(back); } catch (e) {}
        }
      }
    } catch (e) {}
  };
  window.submitNewHighScore = submitNewHighScore;
  window.sendFeedback = async function (text) {
    const msg = String(text || "").trim();
    if (msg.length < 8 || msg.length > 2000) return false;
    try {
      const last = Number(localStorage.getItem("choppy-feed-at") || 0);
      if (Date.now() - last < 60000) return false;
    } catch (e) {}
    try {
      if (!supabase || !supabase.rpc) return false;
      const { error } = await supabase.rpc("submit_feedback", { p_message: msg.slice(0, 2000) });
      if (error) return false;
      try { localStorage.setItem("choppy-feed-at", String(Date.now())); } catch (e) {}
      return true;
    } catch (e) {
      return false;
    }
  };
  window.refreshLeaderboard = (id) => {
    fetchGlobalLeaderboard(id);
    fetchIndepBoard(id === "ready-board" ? "ready-indep" : "site-indep");
    if (id === "ready-board") fetchIndepBoard("site-indep");
    fetchEloBoard(id === "ready-board" ? "ready-elo" : (id || "site-elo"));
    if (id === "ready-board") fetchEloBoard("site-elo");
  };
  window.submitIndependence = submitIndependence;
  window.submitVersusResult = submitVersusResult;
  window.refreshEloBoard = fetchEloBoard;
  window.profileHref = profileHref;
  window.openSignUp = function () {
    openAuth();
    if (!isSignUpMode) toggleAuthMode();
  };
  const cta = $("cta-signup");
  if (cta) cta.onclick = () => window.openSignUp();
  window.addEventListener("DOMContentLoaded", checkActiveSession);
  closeModal(authModal);
  closeModal(profileModal);
  checkActiveSession();
})();
