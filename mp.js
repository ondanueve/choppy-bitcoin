(() => {
  const DB_URL = "https://xhewdrhfofwpzfogthai.supabase.co";
  const DB_KEY = "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InhoZXdkcmhmb2Z3cHpmb2d0aGFpIiwicm9sZSI6ImFub24iLCJpYXQiOjE3ODc0MDM0OTMsImV4cCI6MjEwMjk3OTQ5M30.zch7bpyq2kaYaQeW4wMrQhkSPxyzzKKiD6jRLTWYidY";
  const ABC = "ABCDEFGHJKLMNPQRSTUVWXYZ23456789";
  const MAX = 8;
  const STALE_MS = 20000;
  const BOARD = "realtime:mp-board";
  const REACTS = [
    { id: "gg", glyph: "GG" },
    { id: "nice", glyph: "Nice" },
    { id: "wow", glyph: "Wow" },
    { id: "rip", glyph: "RIP" },
    { id: "up", glyph: "UP" },
    { id: "down", glyph: "DOWN" },
    { id: "gl", glyph: "GL" },
    { id: "hf", glyph: "HF" }
  ];
  const DEFAULT_RULES = {
    startCold: 0,
    msig: 0,
    bull: 38,
    bear: 22,
    laser: 10,
    swan: 20,
    cold: 10,
    mode: "last",
    raceN: 21,
    bestOf: 1,
    muteTheme: false,
    muteSfx: false,
    muteVoice: false,
    open: false
  };

  function rid(n) {
    let s = "";
    for (let i = 0; i < (n || 8); i++) s += ABC[(Math.random() * ABC.length) | 0];
    return s;
  }
  function storedId() {
    try {
      const prev = sessionStorage.getItem("choppy-mp-id");
      if (prev && /^[A-Z0-9]{8}$/.test(prev)) return prev;
      const id = rid(8);
      sessionStorage.setItem("choppy-mp-id", id);
      return id;
    } catch (e) {
      return rid(8);
    }
  }
  function myName() {
    try {
      const tag = document.getElementById("user-profile-tag");
      const t = tag && !tag.classList.contains("hide") ? (tag.textContent || "") : "";
      const n = String(t).replace(/^@/, "").trim();
      if (n) return n.slice(0, 16);
    } catch (e) {}
    return "P-" + rid(4);
  }
  function copyRules(src) {
    const r = Object.assign({}, DEFAULT_RULES, src || {});
    if (src && src.startCold == null && src.mode == null && src.cold != null && src.bull != null) {
      r.startCold = Math.max(0, Math.min(99, src.cold | 0));
      r.cold = DEFAULT_RULES.cold;
    }
    r.startCold = Math.max(0, Math.min(99, r.startCold | 0));
    r.msig = 0;
    ["bull", "bear", "laser", "swan", "cold"].forEach((k) => {
      r[k] = Math.max(0, Math.min(100, Number(r[k]) || 0));
    });
    r.mode = r.mode === "whale" || r.mode === "race" ? r.mode : "last";
    r.raceN = Math.max(5, Math.min(210, r.raceN | 0 || 21));
    const bo = r.bestOf | 0;
    r.bestOf = bo === 3 || bo === 5 || bo === 7 ? bo : 1;
    r.muteTheme = !!r.muteTheme;
    r.muteSfx = !!r.muteSfx;
    r.muteVoice = !!r.muteVoice;
    r.open = !!r.open;
    return r;
  }
  function compact(p) {
    if (!p) return null;
    return {
      id: p.id, name: p.name, uid: p.uid || null, slot: p.slot, host: !!p.host,
      btc: p.btc || 0, candles: p.candles || 0, lifeT: p.lifeT || 0
    };
  }

  const MP = {
    id: storedId(),
    name: "P",
    code: "",
    host: false,
    seed: 0,
    started: false,
    ready: false,
    rematch: false,
    slot: 0,
    players: [],
    rules: copyRules(),
    startAt: 0,
    gameN: 1,
    seriesWins: {},
    roundOver: false,
    roundWinner: null,
    seriesOver: false,
    seriesT0: 0,
    ws: null,
    joinRef: "1",
    refN: 1,
    beat: 0,
    hb: 0,
    on: null,
    backoff: 1000,
    link: "off",
    browsing: false,
    boardOn: false,
    rooms: {},
    reactAt: 0,
    early: []
  };

  function emit(ev, data) {
    if (typeof MP.on === "function") try { MP.on(ev, data); } catch (e) {}
  }
  function setLink(state) {
    if (MP.link === state) return;
    MP.link = state;
    emit("link", state);
  }
  function topic() { return "realtime:mp-" + MP.code; }
  function reactGlyph(id) {
    for (let i = 0; i < REACTS.length; i++) if (REACTS[i].id === id) return REACTS[i].glyph;
    return "";
  }
  function push(msg) {
    if (!MP.ws || MP.ws.readyState !== 1) return;
    msg.ref = String(++MP.refN);
    if (!msg.join_ref) msg.join_ref = MP.joinRef;
    try { MP.ws.send(JSON.stringify(msg)); } catch (e) {}
  }
  function send(event, payload) {
    if (!MP.code) return;
    push({
      topic: topic(),
      event: "broadcast",
      payload: { type: "broadcast", event: event, payload: payload || {} }
    });
  }

  function assignSlots() {
    const host = MP.players.find((p) => p.host) || MP.players[0];
    const rest = MP.players.filter((p) => !host || p.id !== host.id)
      .sort((a, b) => String(a.id).localeCompare(String(b.id)));
    const ordered = host ? [host].concat(rest) : rest;
    ordered.forEach((p, i) => { p.slot = i; });
    const me = MP.players.find((p) => p.id === MP.id);
    if (me) MP.slot = me.slot || 0;
  }
  function upsert(p) {
    if (!p || !p.id) return false;
    const i = MP.players.findIndex((x) => x.id === p.id);
    if (i < 0) {
      if (MP.players.length >= MAX) return false;
      MP.players.push(Object.assign({
        alive: true, candles: 0, lifeT: 0, ready: false, rematch: false,
        finished: false, slot: MP.players.length, btc: 0,
        x: 72, y: 280, v: 0, last: Date.now()
      }, p));
    } else {
      const wasDead = MP.players[i].alive === false;
      const wasFin = !!MP.players[i].finished;
      const keepHost = MP.players[i].host;
      MP.players[i] = Object.assign({}, MP.players[i], p, { last: Date.now() });
      if (p.host == null) MP.players[i].host = keepHost;
      if (wasDead && p.alive !== true) MP.players[i].alive = false;
      if (wasFin) MP.players[i].finished = true;
      if (MP.roundOver && wasDead) MP.players[i].alive = false;
      if (p.alive === true) MP.players[i].gone = false;
    }
    assignSlots();
    return true;
  }
  function myUid() {
    try {
      if (window.choppyUid) return window.choppyUid;
      const s = JSON.parse(localStorage.getItem("bitcoinizate-sb") || "null");
      return (s && s.user && s.user.id) || null;
    } catch (e) { return null; }
  }
  function myPlayState() {
    const me = MP.players.find((p) => p.id === MP.id) || {};
    if (!MP.started) {
      return { alive: true, ready: !!MP.ready, finished: false, rematch: !!MP.rematch };
    }
    return {
      alive: me.alive !== false,
      finished: !!me.finished,
      rematch: !!MP.rematch,
      candles: me.candles || 0,
      lifeT: me.lifeT || 0,
      btc: me.btc || 0,
      x: me.x, y: me.y, v: me.v
    };
  }
  function ident(extra) {
    return Object.assign({
      id: MP.id, name: MP.name, host: MP.host, uid: myUid(),
      ready: !!MP.ready, rematch: !!MP.rematch, slot: MP.slot,
      gameN: MP.started ? (MP.gameN || 1) : 0
    }, extra || {});
  }
  function staleGame(pl) {
    if (!pl || !MP.started) return false;
    if (pl.gameN == null || pl.gameN === 0) return false;
    return (pl.gameN | 0) !== (MP.gameN | 0);
  }
  function aliveList() { return MP.players.filter((p) => p.alive !== false && !p.finished); }
  function allReady() {
    if (MP.players.length < 2) return false;
    const guests = MP.players.filter((p) => !p.host);
    const need = guests.length ? guests : MP.players;
    return need.every((p) => !!p.ready);
  }
  function bestBy(key, fallback) {
    const list = MP.players.slice().sort((a, b) => {
      const d = (Number(b[key]) || 0) - (Number(a[key]) || 0);
      if (d) return d;
      return (Number(b[fallback]) || 0) - (Number(a[fallback]) || 0);
    });
    return list[0] || null;
  }
  function mixSum(r) {
    r = r || MP.rules;
    return (r.bull | 0) + (r.bear | 0) + (r.laser | 0) + (r.swan | 0) + (r.cold | 0);
  }
  function hostPlayer() {
    return MP.players.find((p) => p.host) || null;
  }
  function tryAdoptHost() {
    if (!MP.code || !MP.players.length) return false;
    const cur = hostPlayer();
    if (cur && !cur.gone) {
      MP.host = cur.id === MP.id;
      const me = MP.players.find((p) => p.id === MP.id);
      if (me) me.host = MP.host;
      return false;
    }
    if (cur) cur.host = false;
    const next = MP.players.filter((p) => !p.gone).sort((a, b) => String(a.id).localeCompare(String(b.id)))[0];
    if (!next) return false;
    if (next.id !== MP.id) {
      MP.host = false;
      return false;
    }
    MP.host = true;
    MP.players.forEach((p) => { p.host = p.id === MP.id; });
    assignSlots();
    send("host", { id: MP.id, name: MP.name });
    if (MP.started && MP.seed) send("sync", roundSnap());
    emit("roster", MP.players);
    if (MP.started && !MP.roundOver) considerOver();
    return true;
  }
  function markGone(id, quit) {
    const p = MP.players.find((x) => x.id === id);
    if (!p) return;
    p.gone = true;
    p.goneAt = p.last || Date.now();
    if (quit) {
      p.quit = true;
      p.alive = false;
    }
    if (p.host) p.host = false;
    if (p.id === MP.id) MP.host = false;
  }
  function roundSnap() {
    return {
      seed: MP.seed,
      startAt: MP.startAt,
      sentAt: MP.sentAt || MP.startAt || Date.now(),
      rules: MP.rules,
      gameN: MP.gameN || 1,
      wins: Object.assign({}, MP.seriesWins || {}),
      seriesOver: !!MP.seriesOver,
      seriesT0: MP.seriesT0 || 0,
      roundOver: !!MP.roundOver,
      winner: MP.roundWinner ? compact(MP.roundWinner) : null,
      players: MP.players.map((p) => ({
        id: p.id, name: p.name, uid: p.uid || null, slot: p.slot, host: !!p.host,
        alive: p.alive !== false, finished: !!p.finished, gone: !!p.gone, quit: !!p.quit,
        btc: p.btc || 0, candles: p.candles || 0, lifeT: p.lifeT || 0,
        x: p.x, y: p.y, v: p.v, finishT: p.finishT || 0
      }))
    };
  }
  function replayEarly() {
    const early = MP.early || [];
    MP.early = [];
    early.forEach((e) => handle(e.ev, e.pl));
  }
  function applySync(pl) {
    if (!pl || !pl.seed) return;
    const seed = pl.seed >>> 0;
    const gn = (pl.gameN | 0) || 1;
    const same = MP.started && (MP.seed >>> 0) === seed && (MP.gameN | 0) === gn;
    MP.seed = seed;
    MP.startAt = pl.startAt || MP.startAt;
    MP.sentAt = pl.sentAt || MP.sentAt || 0;
    if (pl.rules) MP.rules = copyRules(pl.rules);
    MP.gameN = gn;
    if (pl.wins) MP.seriesWins = Object.assign({}, pl.wins);
    MP.seriesOver = !!pl.seriesOver;
    MP.seriesT0 = pl.seriesT0 || MP.seriesT0 || 0;
    MP.roundOver = !!pl.roundOver;
    MP.roundWinner = pl.winner || null;
    MP.started = true;
    if (Array.isArray(pl.players)) pl.players.forEach(upsert);
    const me = MP.players.find((p) => p.id === MP.id);
    if (me) { MP.slot = me.slot || 0; MP.host = !!me.host; }
    assignSlots();
    if (same) { emit("roster", MP.players); return; }
    emit("sync", pl);
  }
  function rememberRoom() {
    try {
      if (!MP.code) {
        sessionStorage.removeItem("choppy-mp-room");
        return;
      }
      sessionStorage.setItem("choppy-mp-room", JSON.stringify({
        code: MP.code, host: !!MP.host, at: Date.now()
      }));
    } catch (e) {}
  }
  function resumeRoom() {
    try {
      const raw = sessionStorage.getItem("choppy-mp-room");
      if (!raw) return null;
      const row = JSON.parse(raw);
      if (!row || !row.code || !row.at) return null;
      if (Date.now() - Number(row.at) > STALE_MS) {
        sessionStorage.removeItem("choppy-mp-room");
        return null;
      }
      return { code: String(row.code).slice(0, 6), host: !!row.host, at: Number(row.at) };
    } catch (e) { return null; }
  }
  function joinRoomChannel() {
    MP.joinRef = String(++MP.refN);
    push({
      topic: topic(),
      event: "phx_join",
      payload: {
        config: {
          broadcast: { ack: false, self: true },
          presence: { key: MP.id },
          postgres_changes: [],
          private: false
        },
        access_token: DB_KEY
      },
      ref: MP.joinRef,
      join_ref: MP.joinRef
    });
  }
  function joinBoard() {
    if (!MP.ws || MP.ws.readyState !== 1 || MP.boardOn) return;
    const ref = String(++MP.refN);
    MP.boardRef = ref;
    try {
      MP.ws.send(JSON.stringify({
        topic: BOARD,
        event: "phx_join",
        payload: {
          config: {
            broadcast: { ack: false, self: false },
            presence: { key: MP.id },
            postgres_changes: [],
            private: false
          },
          access_token: DB_KEY
        },
        ref: ref,
        join_ref: ref
      }));
      MP.boardOn = true;
    } catch (e) {}
  }
  function publishRoom() {
    if (!MP.code || !MP.host || MP.started || !MP.rules || !MP.rules.open) return;
    if (!MP.ws || MP.ws.readyState !== 1) return;
    if (!MP.boardOn) joinBoard();
    const ref = String(++MP.refN);
    try {
      MP.ws.send(JSON.stringify({
        topic: BOARD,
        event: "broadcast",
        payload: {
          type: "broadcast",
          event: "pub",
          payload: {
            code: MP.code,
            mode: MP.rules.mode,
            bestOf: MP.rules.bestOf | 0,
            n: MP.players.length,
            name: MP.name
          }
        },
        ref: ref,
        join_ref: MP.boardRef || ref
      }));
    } catch (e) {}
  }
  function browse(on) {
    MP.browsing = on !== false;
    if (!MP.browsing) {
      MP.rooms = {};
      emit("rooms", []);
      return;
    }
    if (MP.ws && MP.ws.readyState === 1) joinBoard();
    else joinSocket();
  }
  function bindGame(api) { MP.game = api || null; if (MP.game) attachUi(MP.game); }
  function takeSid(S, sid) {
    S.mpTaken = S.mpTaken || Object.create(null);
    return !sid || (!S.mpTaken[sid] && (S.mpTaken[sid] = 1));
  }
  function lastWaveBag() {
    const S = MP.game && MP.game.S;
    const w = S && S.waves && S.waves[S.waves.length - 1];
    return w && { type: w.type, kind: w.kind, dir: w.dir, amp: w.amp, resid: w.resid, t0: w.t0 };
  }
  function youWinText() {
    const S = MP.game && MP.game.S;
    const tt = (MP.game && MP.game.t) || (function (k) { return k; });
    const m = (S && S.mpRules && S.mpRules.mode) || "last";
    return tt(m === "whale" ? "mpYouWinWhale" : m === "race" ? "mpYouWinRace" : "mpYouWin");
  }
  function joinUrl(c) { return "https://bitcoinizate.com/choppy-bitcoin/?room=" + c; }
  function shareTake(it, waveOn) {
    const S = MP.game && MP.game.S;
    if (!S || !S.mp || S.mpCatch || !it || !takeSid(S, it.sid)) return;
    const wave = waveOn && waveOn !== true ? waveOn : (waveOn ? lastWaveBag() : null);
    take({ sid: it.sid | 0, typ: it.type || "", wave: wave || null });
  }
  function applyTake(data) {
    const g = MP.game, S = g && g.S;
    if (!S || !S.mp || !data || data.id === MP.id || !takeSid(S, data.sid)) return;
    if (S.items) for (let i = S.items.length - 1; i >= 0; i--) if (S.items[i].sid === data.sid) S.items.splice(i, 1);
    const w = data.wave;
    if (!w || !w.type) return;
    if ((w.kind || w.type) === "HALVE") {
      if (S.waves && S.waves.length) g.endCycle();
      for (const o of S.items) if (o.type === "BULL" || o.type === "BEAR" || o.type === "SWAN") { o.pipe = null; o.freeX = true; o.x = -100; }
    }
    g.beginCycle(w.type, w.kind, w);
  }
  function take(info) {
    if (!MP.started || !info) return;
    const w = info.wave;
    send("take", ident({
      sid: info.sid | 0,
      typ: String(info.typ || "").slice(0, 8),
      wave: w && w.type ? { type: w.type, kind: w.kind || w.type, dir: w.dir, amp: Number(w.amp), resid: Number(w.resid), t0: Number(w.t0) } : null
    }));
  }
  function react(id) {
    if (!MP.code || !MP.started) return false;
    const now = Date.now();
    if (MP.reactAt && now - MP.reactAt < 1200) return false;
    if (!reactGlyph(id)) return false;
    MP.reactAt = now;
    showReact(MP.id, id, now);
    send("react", ident({ g: id }));
    return true;
  }
  function queueEarly(ev, pl) {
    MP.early = MP.early || [];
    if (MP.early.length < 40) MP.early.push({ ev: ev, pl: pl });
  }

  function considerOver() {
    if (!MP.started || MP.roundOver) return;
    if (!MP.host) return;
    if (MP.rejoinAt && Date.now() - MP.rejoinAt < 800) return;
    if (MP.players.length < 1) return;
    const mode = (MP.rules && MP.rules.mode) || "last";
    let winner = MP.roundWinner;
    let allDone = false;
    if (MP.players.length === 1) {
      winner = winner || MP.players[0];
      allDone = true;
    } else if (mode === "whale") {
      if (MP.players.every((p) => p.alive === false)) {
        winner = winner || bestBy("btc", "lifeT");
        allDone = true;
      }
    } else if (mode === "race") {
      const fins = MP.players.filter((p) => p.finished)
        .sort((a, b) => (Number(a.finishT) || 1e15) - (Number(b.finishT) || 1e15));
      if (fins[0]) winner = fins[0];
      allDone = MP.players.every((p) => p.alive === false || p.finished);
    } else {
      const live = aliveList();
      if (live.length === 1) { winner = winner || live[0]; allDone = true; }
      else if (live.length === 0) { winner = winner || bestBy("lifeT", "btc"); allDone = true; }
    }
    if (winner && !MP.roundOver && (!MP.roundWinner || MP.roundWinner.id !== winner.id)) {
      MP.roundWinner = winner;
      const lead = { winner: compact(winner) };
      send("lead", lead);
      emit("lead", lead);
    }
    if (allDone && (winner || MP.roundWinner)) declareOver(winner || MP.roundWinner);
  }
  function declareOver(winner) {
    if (MP.roundOver || !winner) return;
    MP.roundOver = true;
    MP.roundWinner = winner;
    MP.seriesWins = MP.seriesWins || {};
    MP.seriesWins[winner.id] = (MP.seriesWins[winner.id] || 0) + 1;
    const bestOf = (MP.rules && MP.rules.bestOf) || 1;
    const need = Math.ceil(bestOf / 2);
    const gameN = MP.gameN || 1;
    MP.seriesOver = MP.seriesWins[winner.id] >= need || gameN >= bestOf;
    const waitMs = MP.seriesOver ? 12000 : 8000;
    const payload = {
      winner: compact(winner),
      wins: Object.assign({}, MP.seriesWins),
      gameN,
      bestOf,
      seriesOver: MP.seriesOver,
      waitMs
    };
    send("over", payload);
    emit("over", payload);
  }

  function onMsg(raw) {
    let m;
    try { m = JSON.parse(raw); } catch (e) { return; }
    if (!m) return;
    if (m.event === "phx_reply" && m.payload && m.payload.status === "error") {
      emit("err", (m.payload.response && m.payload.response.reason) || "join failed");
      return;
    }
    if (m.event === "broadcast") {
      const ev = (m.payload && (m.payload.event || (m.payload.payload && m.payload.payload.t))) || "";
      const pl = (m.payload && m.payload.payload) || {};
      if (m.topic === BOARD) { handleBoard(ev, pl); return; }
      handle(ev, pl);
    }
  }
  function roomList() {
    const now = Date.now();
    const rows = [];
    const bag = MP.rooms || {};
    Object.keys(bag).forEach((code) => {
      const row = bag[code];
      if (!row || now - row.at > 7000) delete bag[code];
      else rows.push(row);
    });
    rows.sort((a, b) => String(a.code).localeCompare(String(b.code)));
    return rows;
  }
  function handleBoard(ev, pl) {
    if (ev !== "pub" || !pl || !pl.code || pl.code === MP.code) return;
    MP.rooms[pl.code] = {
      code: String(pl.code).slice(0, 6),
      mode: pl.mode === "whale" || pl.mode === "race" ? pl.mode : "last",
      bestOf: pl.bestOf | 0 || 1,
      n: Math.max(0, Math.min(MAX, pl.n | 0)),
      name: String(pl.name || "").slice(0, 16),
      at: Date.now()
    };
    emit("rooms", roomList());
  }
  function showReact(pid, id, at) {
    const glyph = reactGlyph(id);
    if (!glyph) return;
    const p = MP.players.find((x) => x.id === pid);
    if (!p) return;
    const now = Date.now();
    if (p.react && p.react.at && pid !== MP.id && now - p.react.at < 700) return;
    if (!p.react) p.react = { glyph: "", until: 0, at: 0 };
    p.react.glyph = glyph;
    p.react.rid = id;
    p.react.until = now + 1600;
    p.react.at = at || now;
    emit("react", { id: pid, rid: id, glyph: glyph, until: p.react.until });
  }
  function handle(ev, pl) {
    if (!pl) return;
    if (ev === "hello" || ev === "pulse" || ev === "ready" || ev === "rematch") {
      if (staleGame(pl)) return;
      const known = MP.players.some((p) => p.id === pl.id);
      if (!known && MP.started) {
        if (MP.host) send("dropped", { id: pl.id });
        return;
      }
      if (ev === "hello" && MP.host && !MP.started) {
        if (!known && MP.players.length >= MAX) {
          send("full", { id: pl.id });
          return;
        }
      }
      const bag = Object.assign({}, pl);
      if (MP.started) delete bag.host;
      if (MP.started && known) {
        const cur = MP.players.find((p) => p.id === pl.id);
        if (cur && (cur.quit || (cur.alive === false && !cur.gone))) bag.alive = false;
        else if (cur && cur.gone && cur.goneAt && Date.now() - cur.goneAt > STALE_MS) bag.alive = false;
      }
      upsert(bag);
      emit("roster", MP.players);
      if (MP.host && !MP.started) {
        send("roster", { players: MP.players, host: MP.id, code: MP.code, rules: MP.rules });
      }
      if (MP.host && ev === "hello") send("host", { id: MP.id, name: MP.name });
      if (ev === "hello" && MP.started && MP.seed && pl.id !== MP.id) {
        const curp = MP.players.find((p) => p.id === pl.id);
        if (!curp || !curp.quit) send("sync", roundSnap());
      }
      if (ev === "rematch" && MP.host) maybeEarlyNext();
      return;
    }
    if (ev === "react") {
      if (!pl || !pl.id || pl.id === MP.id) return;
      showReact(pl.id, pl.g, 0);
      return;
    }
    if (ev === "take") {
      if (!pl || !pl.id || pl.id === MP.id) return;
      emit("take", pl);
      return;
    }
    if (ev === "sync") {
      applySync(pl);
      return;
    }
    if (ev === "full") {
      if (pl.id === MP.id) {
        emit("err", "full");
        leave();
      }
      return;
    }
    if (ev === "host") {
      if (!pl.id) return;
      MP.rejoinAt = 0;
      MP.players.forEach((p) => { p.host = p.id === pl.id; });
      MP.host = pl.id === MP.id;
      assignSlots();
      emit("roster", MP.players);
      return;
    }
    if (ev === "rules") {
      MP.rules = copyRules(pl);
      emit("rules", MP.rules);
      return;
    }
    if (ev === "roster") {
      if (Array.isArray(pl.players)) {
        pl.players.forEach(upsert);
        emit("roster", MP.players);
      }
      if (pl.rules) {
        MP.rules = copyRules(pl.rules);
        emit("rules", MP.rules);
      }
      if (pl.host) {
        MP.players.forEach((p) => { p.host = p.id === pl.host; });
        MP.host = pl.host === MP.id;
        assignSlots();
      }
      return;
    }
    if (!MP.started && (ev === "dead" || ev === "finish" || ev === "over" || ev === "lead")) {
      if (pl) queueEarly(ev, pl);
      return;
    }
    if (ev === "go") {
      const seed = pl.seed >>> 0;
      const gn = (pl.gameN | 0) || 1;
      if (MP.started && (MP.seed >>> 0) === seed && (MP.gameN | 0) === gn) return;
      MP.started = true;
      MP.roundOver = false;
      MP.roundWinner = null;
      MP.rematch = false;
      MP.seed = pl.seed >>> 0;
      MP.startAt = pl.startAt || (Date.now() + 3200);
      MP.sentAt = pl.sentAt || Date.now();
      if (pl.rules) MP.rules = copyRules(pl.rules);
      if (pl.gameN) MP.gameN = pl.gameN;
      if (pl.wins) MP.seriesWins = Object.assign({}, pl.wins);
      if (pl.seriesT0) MP.seriesT0 = pl.seriesT0;
      if (pl.seriesOver != null) MP.seriesOver = !!pl.seriesOver;
      if (Array.isArray(pl.players)) {
        const ids = {};
        pl.players.forEach((p) => { ids[p.id] = 1; upsert(p); });
        MP.players = MP.players.filter((p) => ids[p.id]);
      }
      MP.players.forEach((p) => {
        p.alive = true; p.lifeT = 0; p.finished = false; p.rematch = false; p.btc = 0;
        p.candles = 0; p.x = 72; p.y = 280; p.v = 0; p._gx = 72; p._gy = 280;
        p.gone = false; p.quit = false;
      });
      assignSlots();
      const hp = hostPlayer();
      if (hp) MP.host = hp.id === MP.id;
      emit("go", {
        seed: MP.seed, startAt: MP.startAt, sentAt: MP.sentAt, rules: MP.rules,
        players: MP.players, gameN: MP.gameN, wins: MP.seriesWins, seriesOver: MP.seriesOver,
        seriesT0: MP.seriesT0 || 0
      });
      replayEarly();
      return;
    }
    if (ev === "reset") {
      MP.started = false;
      MP.ready = false;
      MP.rematch = false;
      MP.startAt = 0;
      MP.roundOver = false;
      MP.roundWinner = null;
      MP.seriesOver = false;
      MP.gameN = 1;
      MP.seriesWins = {};
      MP.seriesT0 = 0;
      MP.early = [];
      MP.players.forEach((p) => {
        p.ready = false; p.alive = true; p.lifeT = 0; p.finished = false; p.rematch = false;
      });
      const me = MP.players.find((p) => p.id === MP.id);
      if (me) me.ready = false;
      if (pl && pl.rules) MP.rules = copyRules(pl.rules);
      assignSlots();
      emit("reset", MP);
      emit("roster", MP.players);
      return;
    }
    if (ev === "lead") {
      if (pl.winner) MP.roundWinner = pl.winner;
      emit("lead", pl);
      return;
    }
    if (ev === "over") {
      MP.roundOver = true;
      MP.roundWinner = pl.winner || MP.roundWinner;
      if (pl.wins) MP.seriesWins = Object.assign({}, pl.wins);
      if (pl.gameN) MP.gameN = pl.gameN;
      MP.seriesOver = !!pl.seriesOver;
      emit("over", pl);
      return;
    }
    if (ev === "finish") {
      if (staleGame(pl)) return;
      upsert({
        id: pl.id, name: pl.name, finished: true, finishT: pl.finishT || pl.lifeT || 0,
        candles: pl.candles || 0, btc: pl.btc || 0, lifeT: pl.lifeT || 0,
        x: pl.x, y: pl.y, v: pl.v
      });
      emit("roster", MP.players);
      considerOver();
      return;
    }
    if (ev === "dead") {
      if (staleGame(pl)) return;
      upsert({
        id: pl.id, name: pl.name, alive: false, lifeT: pl.lifeT || 0,
        candles: pl.candles || 0, btc: pl.btc || 0
      });
      emit("roster", MP.players);
      considerOver();
      return;
    }
    if (ev === "dropped") {
      if (pl.id === MP.id) emit("dropped");
      MP.players = MP.players.filter((p) => p.id !== pl.id);
      assignSlots();
      tryAdoptHost();
      emit("roster", MP.players);
      if (MP.started) considerOver();
      return;
    }
    if (ev === "left") {
      if (MP.started) {
        markGone(pl.id, pl.quit !== false);
        tryAdoptHost();
        emit("roster", MP.players);
        considerOver();
      } else {
        MP.players = MP.players.filter((p) => p.id !== pl.id);
        assignSlots();
        tryAdoptHost();
        emit("roster", MP.players);
      }
    }
  }

  function pruneStale() {
    const cut = Date.now() - STALE_MS;
    let changed = false;
    if (MP.started) {
      MP.players.forEach((p) => {
        if (p.id === MP.id || !p.last || p.last >= cut || p.gone) return;
        p.gone = true;
        p.goneAt = p.last;
        if (p.alive !== false && !p.finished) p.alive = false;
        if (p.host) p.host = false;
        changed = true;
      });
    } else {
      const keep = MP.players.filter((p) => p.id === MP.id || !p.last || p.last >= cut);
      if (keep.length !== MP.players.length) {
        MP.players = keep;
        assignSlots();
        changed = true;
      }
    }
    if (changed) tryAdoptHost();
    if (changed && MP.started) considerOver();
    if (changed) emit("roster", MP.players);
  }

  function joinSocket() {
    closeSocket();
    setLink("wait");
    const url = DB_URL.replace(/^https:/, "wss:") + "/realtime/v1/websocket?apikey=" + encodeURIComponent(DB_KEY) + "&vsn=1.0.0";
    let ws;
    try { ws = new WebSocket(url); } catch (e) { setLink("off"); emit("err", "no socket"); return; }
    MP.ws = ws;
    MP.boardOn = false;
    ws.onopen = () => {
      MP.backoff = 1000;
      setLink("on");
      if (MP.code) joinRoomChannel();
      if (MP.browsing || (MP.host && MP.rules && MP.rules.open)) joinBoard();
      setTimeout(() => {
        if (!MP.code) return;
        if (MP.started) MP.rejoinAt = Date.now();
        const st = myPlayState();
        upsert(Object.assign({ id: MP.id, name: MP.name, host: MP.host }, st));
        send("hello", ident(Object.assign({}, st, MP.started ? { host: false } : {})));
        if (MP.host && !MP.started) {
          send("rules", MP.rules);
          send("host", { id: MP.id, name: MP.name });
        }
        rememberRoom();
        emit("roster", MP.players);
      }, 180);
      clearInterval(MP.beat);
      MP.beat = setInterval(() => {
        push({ topic: "phoenix", event: "heartbeat", payload: {}, ref: String(++MP.refN) });
        if (!MP.code) return;
        const st = myPlayState();
        if (MP.started) send("pulse", ident(st));
        else send("hello", ident(st));
        pruneStale();
        if (MP.host && !MP.started && MP.rules && MP.rules.open) publishRoom();
        rememberRoom();
      }, 2000);
    };
    ws.onmessage = (e) => onMsg(e.data);
    ws.onerror = () => emit("err", "socket error");
    ws.onclose = () => {
      if (MP.ws !== ws) return;
      MP.ws = null;
      MP.boardOn = false;
      if (!MP.code && !MP.browsing) { setLink("off"); return; }
      setLink("wait");
      const wait = MP.backoff || 1000;
      MP.backoff = Math.min(15000, wait * 2);
      setTimeout(() => {
        if ((MP.code || MP.browsing) && (!MP.ws || MP.ws.readyState > 1)) joinSocket();
      }, wait);
    };
  }
  function closeSocket() {
    clearInterval(MP.beat);
    MP.beat = 0;
    const ws = MP.ws;
    MP.ws = null;
    MP.boardOn = false;
    if (!ws) return;
    ws.onclose = null;
    ws.onmessage = null;
    ws.onerror = null;
    try { ws.close(); } catch (e) {}
  }

  function host() {
    MP.name = myName();
    MP.host = true;
    MP.started = false;
    MP.ready = false;
    MP.rematch = false;
    MP.slot = 0;
    MP.players = [];
    MP.code = rid(4);
    MP.seed = 0;
    MP.rules = copyRules();
    MP.gameN = 1;
    MP.seriesWins = {};
    MP.roundOver = false;
    MP.roundWinner = null;
    MP.seriesOver = false;
    upsert(ident({ host: true, alive: true, ready: false }));
    joinSocket();
    emit("lobby", MP);
    return MP.code;
  }
  function join(code) {
    const c = String(code || "").toUpperCase().replace(/[^A-Z0-9]/g, "").slice(0, 6);
    if (c.length < 4) { emit("err", "bad code"); return false; }
    MP.name = myName();
    MP.host = false;
    MP.started = false;
    MP.ready = false;
    MP.rematch = false;
    MP.players = [];
    MP.code = c;
    MP.rules = copyRules();
    MP.gameN = 1;
    MP.seriesWins = {};
    upsert(ident({ host: false, alive: true, ready: false }));
    joinSocket();
    emit("lobby", MP);
    return true;
  }
  function setReady(on) {
    MP.ready = !!on;
    const me = MP.players.find((p) => p.id === MP.id);
    if (me) me.ready = MP.ready;
    send("ready", ident({ ready: MP.ready }));
    emit("roster", MP.players);
  }
  function setRematch(on) {
    MP.rematch = !!on;
    const me = MP.players.find((p) => p.id === MP.id);
    if (me) me.rematch = MP.rematch;
    send("rematch", ident({ rematch: MP.rematch }));
    emit("roster", MP.players);
    if (MP.host) maybeEarlyNext();
  }
  function setRules(next) {
    if (!MP.host || MP.started) return;
    MP.rules = copyRules(next);
    send("rules", MP.rules);
    emit("rules", MP.rules);
    if (MP.rules.open && MP.ws && MP.ws.readyState === 1) joinBoard();
  }
  function launchGo() {
    MP.seed = (Math.floor(Math.random() * 0x7fffffff) ^ Date.now()) >>> 0;
    if (!MP.seed) MP.seed = 1;
    MP.started = true;
    MP.roundOver = false;
    MP.roundWinner = null;
    MP.rematch = false;
    MP.startAt = Date.now() + 3200;
    const sentAt = Date.now();
    MP.sentAt = sentAt;
    if ((MP.gameN | 0) <= 1 || !MP.seriesT0) MP.seriesT0 = sentAt;
    MP.players.forEach((p) => {
      p.alive = true; p.lifeT = 0; p.finished = false; p.rematch = false; p.btc = 0; p.candles = 0;
      p.x = 72; p.y = 280; p.v = 0; p._gx = 72; p._gy = 280;
      p.gone = false; p.quit = false;
    });
    assignSlots();
    const payload = {
      seed: MP.seed,
      startAt: MP.startAt,
      sentAt: sentAt,
      rules: MP.rules,
      gameN: MP.gameN || 1,
      wins: Object.assign({}, MP.seriesWins || {}),
      seriesOver: false,
      seriesT0: MP.seriesT0 || sentAt,
      players: MP.players.map((p) => ({
        id: p.id, name: p.name, uid: p.uid || null, slot: p.slot, host: !!p.host
      }))
    };
    send("go", payload);
    emit("go", Object.assign({}, payload, { players: MP.players }));
    replayEarly();
  }
  function start(opts) {
    if (!MP.host || MP.started) return;
    if (MP.players.length < 2) { emit("err", "need 2"); return; }
    if (MP.players.length > MAX) { emit("err", "full"); return; }
    MP.ready = true;
    const me = MP.players.find((p) => p.id === MP.id);
    if (me) me.ready = true;
    if (opts && opts.rules) MP.rules = copyRules(opts.rules);
    if (!(opts && opts.skipReady) && !allReady()) { emit("err", "not ready"); return; }
    if (mixSum() !== 100) { emit("err", "mix"); return; }
    if (!MP.gameN) MP.gameN = 1;
    if (!MP.seriesWins) MP.seriesWins = {};
    launchGo();
  }
  function maybeEarlyNext() {
    if (!MP.host || !MP.roundOver || !MP.seriesOver) return;
    if (!MP.players.length) return;
    if (MP.players.every((p) => p.rematch)) nextRound();
  }
  function nextRound() {
    if (!MP.host || !MP.roundOver) return;
    const last = !!MP.seriesOver;
    const keep = MP.players.filter((p) => {
      if (p.gone) return false;
      return last ? !!p.rematch : true;
    });
    if (keep.length < 2 || (last && !keep.some((p) => p.id === MP.id))) {
      resetLobby();
      return;
    }
    const drop = MP.players.filter((p) => keep.indexOf(p) < 0);
    drop.forEach((p) => send("dropped", { id: p.id }));
    MP.players = keep;
    if (MP.players.length < 2) {
      resetLobby();
      return;
    }
    if (last) {
      MP.seriesWins = {};
      MP.gameN = 1;
      MP.seriesOver = false;
      MP.seriesT0 = 0;
    } else {
      MP.gameN = (MP.gameN || 1) + 1;
    }
    MP.started = false;
    MP.roundOver = false;
    MP.roundWinner = null;
    MP.ready = true;
    MP.players.forEach((p) => { p.ready = true; p.rematch = false; p.host = p.id === MP.id; });
    launchGo();
  }
  function pulse(info) {
    if (!MP.started) return;
    const me = MP.players.find((p) => p.id === MP.id) || {};
    const bag = Object.assign({
      alive: me.alive !== false,
      finished: !!me.finished
    }, info || {});
    upsert(ident(bag));
    send("pulse", ident(bag));
  }
  function dead(lifeT, candles, extra) {
    const info = Object.assign({
      alive: false, lifeT: lifeT || 0, candles: candles || 0
    }, extra || {});
    const pl = ident(info);
    if (!MP.started) queueEarly("dead", pl);
    else upsert(pl);
    send("dead", pl);
    if (MP.started) considerOver();
  }
  function finish(info) {
    const bag = Object.assign({
      finished: true, finishT: (info && info.finishT) || (info && info.lifeT) || 0,
      alive: true
    }, info || {});
    const pl = ident(bag);
    if (!MP.started) queueEarly("finish", pl);
    else upsert(pl);
    send("finish", pl);
    if (MP.started) considerOver();
  }
  function resetLobby() {
    MP.started = false;
    MP.ready = false;
    MP.rematch = false;
    MP.startAt = 0;
    MP.roundOver = false;
    MP.roundWinner = null;
    MP.seriesOver = false;
    MP.gameN = 1;
    MP.seriesWins = {};
    MP.seriesT0 = 0;
    MP.early = [];
    MP.players.forEach((p) => {
      p.ready = false; p.alive = true; p.lifeT = 0; p.finished = false; p.rematch = false;
    });
    send("reset", { rules: MP.rules });
    emit("reset", MP);
    emit("roster", MP.players);
  }
  function leave() {
    if (MP.code) send("left", ident({ quit: true }));
    MP.code = "";
    MP.browsing = false;
    MP.started = false;
    MP.host = false;
    MP.ready = false;
    MP.rematch = false;
    MP.players = [];
    MP.rooms = {};
    MP.rules = copyRules();
    MP.roundOver = false;
    MP.seriesT0 = 0;
    MP.early = [];
    MP.backoff = 1000;
    try { sessionStorage.removeItem("choppy-mp-room"); } catch (e) {}
    closeSocket();
    setLink("off");
    emit("left");
  }


  function attachUi(g) {
    if (!g) return;
    const S = g.S, t = g.t, $ = g.$, overlay = g.overlay;
    const mpRulesNow = g.rulesNow, mpMixTotal = g.mixTotal, mpFocusPlayer = g.focusPlayer;
    const applyMpSound = g.applySound, ensureMp = g.ensureMp, leaveMp = g.leave;
    const heroOf = g.heroOf, renderOverlay = g.renderOverlay, snapshotRun = g.snapshotRun;
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
        + (p.name || "?") + (you ? " · " + t("mpYou") : "") + (p.host ? " · " + t("mpHostRole") : "")
        + (dead ? " · " + t("mpDead") : ready) + eloBit(p) + "</li>";
    }).join("") + "</ul>";
  }
  function eloBit(p) {
    const bag = S.mpElo;
    if (Array.isArray(bag) && p.uid) {
      const row = bag.find((r) => r.id === p.uid);
      if (row && row.elo != null) return " · " + Math.round(row.elo);
    }
    return p.uid ? "" : " · " + t("mpGuest");
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
    return "<details class=\"mp-rules\"" + open + "><summary>" + t("mpRules") + (host ? "" : " · " + t("mpView")) + "</summary>"
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
      + "<label class=\"mp-open\"><input type=\"checkbox\" id=\"mp-open\"" + (r.open ? " checked" : "") + dis + "> " + t("mpOpen") + "</label>"
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
      muteVoice: !!(r.muteVoice),
      open: $("mp-open") ? !!$("mp-open").checked : !!r.open
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
    if ($("mp-host")) $("mp-host").onclick = (e) => {
      e.stopPropagation();
      S.mpErr = "";
      ensureMp().then((mp) => { if (mp) mp.host(); });
    };
    if ($("mp-join")) $("mp-join").onclick = (e) => {
      e.stopPropagation();
      const inp = $("mp-code");
      S.mpJoinCode = inp ? inp.value : "";
      S.mpErr = "";
      ensureMp().then((mp) => { if (mp) mp.join(S.mpJoinCode); });
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
        navigator.clipboard.writeText(window.ChoppyMP.joinUrl(c)).then(done).catch(() => { try { done(); } catch (err) {} });
      }
    };
    if ($("mp-back")) $("mp-back").onclick = (e) => { e.stopPropagation(); leaveMp(); };
    const mpBack = $("mp-back");
    if (mpBack && window.ChoppyMP && window.ChoppyMP.get && !window.ChoppyMP.get().code) {
      const rooms = document.createElement("div");
      rooms.innerHTML = mpPublicHtml();
      mpBack.parentNode.insertBefore(rooms, mpBack);
    }
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
    if ($("mp-open")) $("mp-open").onchange = () => { pushHostRules(); };
    if (overlay && overlay.querySelectorAll) overlay.querySelectorAll("[data-room]").forEach((btn) => {
      btn.onclick = (e) => {
        e.stopPropagation();
        const code = btn.getAttribute("data-room") || "";
        S.mpJoinCode = code;
        S.mpErr = "";
        if (window.ChoppyMP) window.ChoppyMP.join(code);
      };
    });
  }
  function mpPublicHtml() {
    const rows = (window.ChoppyMP && window.ChoppyMP.rooms && window.ChoppyMP.rooms()) || [];
    let html = "<p class=\"k\">" + t("mpPublic") + "</p>";
    if (!rows.length) return html + "<p class=\"k\">" + t("mpNoRooms") + "</p>";
    html += "<div class=\"mp-rooms\">";
    rows.forEach((r) => {
      const mode = r.mode === "whale" ? t("mpWhale") : r.mode === "race" ? t("mpRace") : t("mpLast");
      html += "<button type=\"button\" class=\"mp-room\" data-room=\"" + r.code + "\">" + r.code + " · " + mode + " · " + (r.n | 0) + "/8</button>";
    });
    return html + "</div>";
  }
  function mpRoundLines() {
    const rows = S.mpLog || [];
    if (!rows.length) return "";
    let html = "<div class=\"mp-rounds\">";
    rows.forEach((r) => { html += "<div>" + t("mpRound") + " " + r.n + " · " + (r.name || "?") + "</div>"; });
    return html + "</div>";
  }
  function mpEloLines() {
    if (!Array.isArray(S.mpElo) || !S.mpElo.length) return "";
    const list = (window.ChoppyMP && window.ChoppyMP.players && window.ChoppyMP.players()) || [];
    let html = "<div class=\"mp-rounds\">";
    S.mpElo.forEach((row) => {
      let name = "";
      for (let i = 0; i < list.length; i++) if (list[i].uid === row.id) name = list[i].name || "";
      if (!name) name = String(row.id || "").slice(0, 8);
      const after = row.elo | 0;
      const before = after - (row.delta | 0);
      const delta = row.delta | 0;
      html += "<div>" + name + " " + before + " → " + after + " (" + (delta > 0 ? "+" : "") + delta + ")</div>";
    });
    return html + "</div>";
  }
  function mpShareText() {
    const w = S.mpWinner || {};
    const lines = [t("versus"), (w.name || "?") + " " + t("mpSeriesWin")];
    (S.mpLog || []).forEach((r) => { lines.push(t("mpRound") + " " + r.n + ": " + (r.name || "?")); });
    if (Array.isArray(S.mpElo)) {
      const list = (window.ChoppyMP && window.ChoppyMP.players && window.ChoppyMP.players()) || [];
      S.mpElo.forEach((row) => {
        let name = "?";
        for (let i = 0; i < list.length; i++) if (list[i].uid === row.id && list[i].name) name = list[i].name;
        lines.push(name + " " + ((row.elo | 0) - (row.delta | 0)) + " → " + (row.elo | 0));
      });
    } else if (S.mpEloNote) lines.push(S.mpEloNote);
    return lines.join("\n");
  }

  function copyMpResult(btn) {
    const text = mpShareText();
    const done = () => {
      if (!btn) return;
      btn.textContent = t("mpShared");
      setTimeout(() => { if (btn) btn.textContent = t("mpShare"); }, 1400);
    };
    if (navigator.clipboard && navigator.clipboard.writeText) {
      navigator.clipboard.writeText(text).then(done).catch(done);
    } else done();
  }

  function mpWaitHtml() {
    return mpSpecHtml();
  }
  function mpYouWinText() { const m = window.ChoppyMP; return m && m.youWinText ? m.youWinText() : t("mpYouWin"); }
  function mpSpecHtml() {
    const foc = mpFocusPlayer() || S.mpWinner || {};
    const mine = window.ChoppyMP && window.ChoppyMP.id();
    const win = S.mpWinner || {};
    const last = !!S.mpSeriesOver;
    const left = S.mpNextAt ? Math.max(0, Math.ceil((S.mpNextAt - Date.now()) / 1000)) : 0;
    const title = S.mpRoundOver
      ? (last ? ((win.name || "?") + " " + t("mpSeriesWin")) : (win.id === mine ? mpYouWinText() : ((win.name || foc.name || "?") + " " + t("mpWins"))))
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
    const recap = last ? (mpRoundLines() + mpEloLines() + "<button type=\"button\" class=\"cta play-alt\" id=\"mp-share\">" + t("mpShare") + "</button>") : "";
    return "<p class=\"k\">" + title + "</p>" + (last && win.id === mine ? "<p class=\"k\">" + mpYouWinText() + "</p>" : "") + series + timer + recap
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
    if ($("mp-share")) $("mp-share").onclick = (e) => { e.stopPropagation(); copyMpResult($("mp-share")); };
  }
  function mpWinHtml() {
    const w = S.mpWinner || {};
    const mine = window.ChoppyMP && w.id === window.ChoppyMP.id();
    const host = window.ChoppyMP && window.ChoppyMP.get().host;
    return "<p class=\"k\">" + t("versus") + "</p><h1>" + ((w.name || "?") + " " + t("mpSeriesWin")) + "</h1>"
      + (mine ? "<p class=\"k\">" + mpYouWinText() + "</p>" : "")
      + (S.mpEloNote ? "<p class=\"k\">" + S.mpEloNote + "</p>" : "")
      + mpRoundLines()
      + mpEloLines()
      + mpRosterHtml()
      + "<div class=\"overlay-actions\">"
      + "<button type=\"button\" class=\"cta play-alt\" id=\"mp-share\">" + t("mpShare") + "</button>"
      + (host ? "<button class=\"cta\" id=\"mp-again\">" + t("mpRematch") + "</button>" : "<button class=\"cta\" id=\"mp-rematch\">" + t("mpRematch") + "</button>")
      + "<button class=\"cta play-alt\" id=\"go\">" + t("mpBack") + "</button></div>";
  }

    const api = window.ChoppyMP;
    if (!api) return;
    api.lobbyHtml = mpLobbyHtml;
    api.bindLobby = bindMpLobby;
    api.specHtml = mpSpecHtml;
    api.bindSpec = bindMpSpec;
    api.winHtml = mpWinHtml;
    api.copyResult = copyMpResult;
  }

  window.ChoppyMP = {
    host, join, start, pulse, dead, finish, leave, setReady, setRematch, setRules,
    resetLobby, nextRound, react, take, shareTake, applyTake, bindGame, lastWaveBag, youWinText, joinUrl, browse, resumeRoom,
    rooms: roomList,
    link: () => MP.link,
    REACTS,
    get: () => MP,
    setHandler: (fn) => { MP.on = fn; },
    players: () => MP.players.slice(),
    alive: aliveList,
    allReady,
    rules: () => copyRules(MP.rules),
    id: () => MP.id,
    code: () => MP.code,
    slot: () => MP.slot,
    wins: () => Object.assign({}, MP.seriesWins || {}),
    gameN: () => MP.gameN || 1,
    MAX,
    DEFAULT_RULES
  };
})();
