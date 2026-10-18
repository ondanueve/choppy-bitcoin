(() => {
  const DB_URL = "https://xhewdrhfofwpzfogthai.supabase.co";
  const DB_KEY = "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InhoZXdkcmhmb2Z3cHpmb2d0aGFpIiwicm9sZSI6ImFub24iLCJpYXQiOjE3ODc0MDM0OTMsImV4cCI6MjEwMjk3OTQ5M30.zch7bpyq2kaYaQeW4wMrQhkSPxyzzKKiD6jRLTWYidY";
  const ABC = "ABCDEFGHJKLMNPQRSTUVWXYZ23456789";
  const MAX = 8;
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
    muteVoice: false
  };

  function rid(n) {
    let s = "";
    for (let i = 0; i < (n || 8); i++) s += ABC[(Math.random() * ABC.length) | 0];
    return s;
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
    id: rid(8),
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
    ws: null,
    joinRef: "1",
    refN: 1,
    beat: 0,
    hb: 0,
    on: null
  };

  function emit(ev, data) {
    if (typeof MP.on === "function") try { MP.on(ev, data); } catch (e) {}
  }
  function topic() { return "realtime:mp-" + MP.code; }
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
    if (cur) {
      MP.host = cur.id === MP.id;
      const me = MP.players.find((p) => p.id === MP.id);
      if (me) me.host = MP.host;
      return false;
    }
    const next = MP.players.slice().sort((a, b) => String(a.id).localeCompare(String(b.id)))[0];
    if (!next) return false;
    if (next.id !== MP.id) {
      MP.host = false;
      return false;
    }
    MP.host = true;
    MP.players.forEach((p) => { p.host = p.id === MP.id; });
    assignSlots();
    send("host", { id: MP.id, name: MP.name });
    emit("roster", MP.players);
    if (MP.started && !MP.roundOver) considerOver();
    return true;
  }
  function markGone(id) {
    const p = MP.players.find((x) => x.id === id);
    if (!p) return;
    p.alive = false;
    p.gone = true;
    if (p.host) p.host = false;
    if (p.id === MP.id) MP.host = false;
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
      if (fins[0]) winner = winner || fins[0];
      allDone = MP.players.every((p) => p.alive === false || p.finished);
    } else {
      const live = aliveList();
      if (live.length === 1) { winner = winner || live[0]; allDone = true; }
      else if (live.length === 0) { winner = winner || bestBy("lifeT", "btc"); allDone = true; }
    }
    if (winner && !MP.roundWinner) {
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
      handle(ev, pl);
    }
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
      upsert(bag);
      emit("roster", MP.players);
      if (MP.host && !MP.started) {
        send("roster", { players: MP.players, host: MP.id, code: MP.code, rules: MP.rules });
      }
      if (MP.host && ev === "hello") send("host", { id: MP.id, name: MP.name });
      if (ev === "rematch" && MP.host) maybeEarlyNext();
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
    if (ev === "go") {
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
      if (pl.seriesOver != null) MP.seriesOver = !!pl.seriesOver;
      if (Array.isArray(pl.players)) {
        const ids = {};
        pl.players.forEach((p) => { ids[p.id] = 1; upsert(p); });
        MP.players = MP.players.filter((p) => ids[p.id]);
      }
      MP.players.forEach((p) => {
        p.alive = true; p.lifeT = 0; p.finished = false; p.rematch = false; p.btc = 0;
        p.candles = 0; p.x = 72; p.y = 280; p.v = 0; p._gx = 72; p._gy = 280;
      });
      assignSlots();
      const hp = hostPlayer();
      if (hp) MP.host = hp.id === MP.id;
      emit("go", {
        seed: MP.seed, startAt: MP.startAt, sentAt: MP.sentAt, rules: MP.rules,
        players: MP.players, gameN: MP.gameN, wins: MP.seriesWins, seriesOver: MP.seriesOver
      });
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
        markGone(pl.id);
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
    const cut = Date.now() - 12000;
    let changed = false;
    if (MP.started) {
      MP.players.forEach((p) => {
        if (p.id === MP.id || !p.last || p.last >= cut) return;
        if (p.alive !== false && !p.finished) {
          p.alive = false;
          changed = true;
        }
        if (p.host) {
          p.host = false;
          changed = true;
        }
        p.gone = true;
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
    const url = DB_URL.replace(/^https:/, "wss:") + "/realtime/v1/websocket?apikey=" + encodeURIComponent(DB_KEY) + "&vsn=1.0.0";
    let ws;
    try { ws = new WebSocket(url); } catch (e) { emit("err", "no socket"); return; }
    MP.ws = ws;
    MP.joinRef = String(++MP.refN);
    ws.onopen = () => {
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
      setTimeout(() => {
        if (MP.started) MP.rejoinAt = Date.now();
        const st = myPlayState();
        upsert(Object.assign({ id: MP.id, name: MP.name, host: MP.host }, st));
        send("hello", ident(Object.assign({}, st, MP.started ? { host: false } : {})));
        if (MP.host && !MP.started) {
          send("rules", MP.rules);
          send("host", { id: MP.id, name: MP.name });
        }
        emit("roster", MP.players);
      }, 180);
      clearInterval(MP.beat);
      MP.beat = setInterval(() => {
        push({ topic: "phoenix", event: "heartbeat", payload: {}, ref: String(++MP.refN) });
        const st = myPlayState();
        if (MP.started) send("pulse", ident(st));
        else send("hello", ident(st));
        pruneStale();
      }, 2000);
    };
    ws.onmessage = (e) => onMsg(e.data);
    ws.onerror = () => emit("err", "socket error");
    ws.onclose = () => {
      if (MP.code) setTimeout(() => { if (MP.code && (!MP.ws || MP.ws.readyState > 1)) joinSocket(); }, 1200);
    };
  }
  function closeSocket() {
    clearInterval(MP.beat);
    MP.beat = 0;
    try { if (MP.ws) MP.ws.close(); } catch (e) {}
    MP.ws = null;
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
    MP.players.forEach((p) => {
      p.alive = true; p.lifeT = 0; p.finished = false; p.rematch = false; p.btc = 0; p.candles = 0;
      p.x = 72; p.y = 280; p.v = 0; p._gx = 72; p._gy = 280;
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
      players: MP.players.map((p) => ({
        id: p.id, name: p.name, uid: p.uid || null, slot: p.slot, host: !!p.host
      }))
    };
    send("go", payload);
    emit("go", Object.assign({}, payload, { players: MP.players }));
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
    upsert(ident(info));
    send("dead", ident(info));
    considerOver();
  }
  function finish(info) {
    const bag = Object.assign({
      finished: true, finishT: (info && info.finishT) || (info && info.lifeT) || 0,
      alive: true
    }, info || {});
    upsert(ident(bag));
    send("finish", ident(bag));
    considerOver();
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
    MP.players.forEach((p) => {
      p.ready = false; p.alive = true; p.lifeT = 0; p.finished = false; p.rematch = false;
    });
    send("reset", { rules: MP.rules });
    emit("reset", MP);
    emit("roster", MP.players);
  }
  function leave() {
    if (MP.code) send("left", { id: MP.id });
    MP.code = "";
    MP.started = false;
    MP.host = false;
    MP.ready = false;
    MP.rematch = false;
    MP.players = [];
    MP.rules = copyRules();
    MP.roundOver = false;
    closeSocket();
    emit("left");
  }

  window.ChoppyMP = {
    host, join, start, pulse, dead, finish, leave, setReady, setRematch, setRules,
    resetLobby, nextRound,
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
