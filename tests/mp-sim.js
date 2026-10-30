#!/usr/bin/env node
"use strict";

/*
 * Versus simulator. Loads mp.js once per player in a vm, with WebSocket
 * replaced by an in-memory bus. Virtual time, so heartbeats and the stale
 * window do not wait on the wall clock.
 *
 * Usage: node tests/mp-sim.js
 * Writes tests/out/mp-sim-report.json and tests/out/mp-sim-report.md
 *
 * Hard scenarios must agree on the winner. The checks at the bottom lock
 * the host handoff, a repeated go, race order, and a return inside 20s.
 */

const fs = require("fs");
const path = require("path");
const vm = require("vm");

const ROOT = path.resolve(__dirname, "..");
const MP_SRC = fs.readFileSync(path.join(ROOT, "mp.js"), "utf8");
const OUT_DIR = path.join(__dirname, "out");

function mulberry32(seed) {
  let a = seed >>> 0;
  return function rand() {
    a |= 0;
    a = (a + 0x6d2b79f5) | 0;
    let t = Math.imul(a ^ (a >>> 15), 1 | a);
    t = (t + Math.imul(t ^ (t >>> 7), 61 | t)) ^ t;
    return ((t ^ (t >>> 14)) >>> 0) / 4294967296;
  };
}

function makeClock() {
  const clock = {
    now: 1_700_000_000_000,
    q: [],
    seq: 1,
    setTimeout(fn, ms) {
      const id = this.seq++;
      this.q.push({ id, t: this.now + Math.max(0, ms || 0), fn, seq: this.seq++ });
      return id;
    },
    setInterval(fn, ms) {
      const every = Math.max(1, ms || 1);
      const id = this.seq++;
      this.q.push({ id, t: this.now + every, fn, every, seq: this.seq++ });
      return id;
    },
    clear(id) {
      this.q = this.q.filter((item) => item.id !== id);
    },
    advance(ms) {
      const end = this.now + Math.max(0, ms || 0);
      let guard = 0;
      while (guard++ < 200000) {
        let next = null;
        for (const item of this.q) {
          if (!next || item.t < next.t || (item.t === next.t && item.seq < next.seq)) next = item;
        }
        if (!next || next.t > end) break;
        this.now = next.t;
        this.q = this.q.filter((item) => item !== next);
        if (next.every) {
          this.q.push({ id: next.id, t: this.now + next.every, fn: next.fn, every: next.every, seq: this.seq++ });
        }
        next.fn();
      }
      if (guard >= 200000) throw new Error("clock guard tripped");
      this.now = end;
    }
  };
  clock.clearTimeout = (id) => clock.clear(id);
  clock.clearInterval = (id) => clock.clear(id);
  return clock;
}

function makeBus(clock, opts) {
  const opt = opts || {};
  const sockets = [];
  return {
    latency: opt.latency || 0,
    reorder: opt.reorder || 0,
    dup: !!opt.dup,
    dupGap: opt.dupGap || 30,
    extra: opt.extra || (() => 0),
    rand: opt.rand || Math.random,
    drop: opt.drop || (() => false),
    sockets,
    reset() { sockets.length = 0; },
    add(ws) { sockets.push(ws); },
    remove(ws) {
      const i = sockets.indexOf(ws);
      if (i >= 0) sockets.splice(i, 1);
    },
    deliver(ws, obj, delay) {
      const raw = JSON.stringify(obj);
      const fire = () => {
        if (ws.readyState !== 1 || typeof ws.onmessage !== "function") return;
        ws.onmessage({ data: raw });
      };
      clock.setTimeout(fire, delay);
    },
    ingest(ws, raw) {
      let msg;
      try { msg = JSON.parse(raw); } catch (e) { return; }
      if (!msg || msg.topic === "phoenix" || msg.event === "heartbeat") return;
      if (msg.event === "phx_join") {
        if (!ws.topics) ws.topics = {};
        ws.topics[msg.topic] = 1;
        ws.topic = msg.topic;
        this.deliver(ws, { event: "phx_reply", payload: { status: "ok" }, ref: msg.ref, topic: msg.topic }, 0);
        return;
      }
      if (msg.event !== "broadcast") return;
      const ev = msg.payload && msg.payload.event;
      if (this.drop(ev, msg)) return;
      const base = this.latency + (this.extra(ev, msg) || 0);
      const jitter = this.reorder ? Math.floor(this.rand() * this.reorder) : 0;
      const targets = sockets.filter((s) => s.readyState === 1 && s.topics && s.topics[msg.topic]);
      targets.forEach((s) => {
        this.deliver(s, msg, base + jitter);
        if (this.dup) this.deliver(s, msg, base + jitter + this.dupGap);
      });
    }
  };
}

function FakeSocket(url, bus, clock) {
  this.url = url;
  this.readyState = 0;
  this.topic = "";
  this.topics = {};
  this.onopen = null;
  this.onmessage = null;
  this.onerror = null;
  this.onclose = null;
  bus.add(this);
  const self = this;
  clock.setTimeout(() => {
    if (self.readyState !== 0) return;
    self.readyState = 1;
    if (typeof self.onopen === "function") self.onopen();
  }, 1);
}
FakeSocket.prototype.send = function send(raw) {
  if (this.readyState !== 1) return;
  this._bus.ingest(this, raw);
};
FakeSocket.prototype.close = function close() {
  if (this.readyState === 3) return;
  this.readyState = 3;
  this._bus.remove(this);
  const fn = this.onclose;
  if (typeof fn === "function") fn();
};

function makeClient(clock, bus, opt) {
  const o = opt || {};
  const rand = mulberry32(o.seed || 1);
  const storage = new Map(o.storage ? [...o.storage.entries()] : []);
  const tag = {
    classList: { contains: () => false },
    textContent: o.name || "P"
  };
  const sandbox = {
    console,
    JSON, Object, Array, String, Number, Math: Object.assign(Object.create(Math), { random: rand }),
    parseInt, parseFloat, isFinite, isNaN, encodeURIComponent, decodeURIComponent,
    Date: { now: () => clock.now },
    setTimeout: (fn, ms) => clock.setTimeout(fn, ms),
    setInterval: (fn, ms) => clock.setInterval(fn, ms),
    clearTimeout: (id) => clock.clear(id),
    clearInterval: (id) => clock.clear(id),
    document: { getElementById: (id) => (id === "user-profile-tag" ? tag : null) },
    localStorage: { getItem: () => null, setItem() {}, removeItem() {} },
    sessionStorage: {
      getItem: (k) => (storage.has(k) ? storage.get(k) : null),
      setItem: (k, v) => storage.set(k, String(v)),
      removeItem: (k) => storage.delete(k)
    },
    WebSocket: function WebSocket(url) {
      const ws = new FakeSocket(url, bus, clock);
      ws._bus = bus;
      return ws;
    }
  };
  sandbox.window = sandbox;
  sandbox.globalThis = sandbox;
  sandbox.window.choppyUid = o.uid || null;
  vm.createContext(sandbox);
  vm.runInContext(MP_SRC, sandbox, { filename: "mp.js" });
  const api = sandbox.ChoppyMP || sandbox.window.ChoppyMP;
  if (!api) throw new Error("ChoppyMP missing");
  api._storage = storage;
  api._name = o.name || "P";
  return api;
}

const RULES = {
  last: { mode: "last", bestOf: 1, bull: 38, bear: 22, laser: 10, swan: 20, cold: 10, raceN: 21 },
  whale: { mode: "whale", bestOf: 1, bull: 38, bear: 22, laser: 10, swan: 20, cold: 10, raceN: 21 },
  race: { mode: "race", bestOf: 1, bull: 38, bear: 22, laser: 10, swan: 20, cold: 10, raceN: 21 }
};

function lagOf(env) {
  return (env.bus.latency || 0) + (env.settle || 0);
}

function lobby(env, n) {
  const clients = [];
  for (let i = 0; i < n; i++) {
    clients.push(makeClient(env.clock, env.bus, {
      seed: env.seedBase + i * 97 + 3,
      name: "P" + (i + 1),
      uid: "00000000-0000-4000-8000-" + String(i + 1).padStart(12, "0")
    }));
  }
  clients[0].host();
  env.clock.advance(400 + lagOf(env));
  const code = clients[0].code();
  if (!code || code.length < 4) throw new Error("host code missing");
  for (let i = 1; i < n; i++) {
    if (!clients[i].join(code)) throw new Error("join failed");
    env.clock.advance(400 + lagOf(env));
  }
  env.clock.advance(2500 + lagOf(env));
  const counts = clients.map((c) => c.players().length);
  if (counts.some((c) => c !== n)) throw new Error("roster " + counts.join(","));
  for (let i = 1; i < n; i++) clients[i].setReady(true);
  env.clock.advance(400 + lagOf(env));
  return clients;
}

function begin(env, clients, rules) {
  const r = Object.assign({}, RULES.last, rules || {});
  clients[0].setRules(r);
  env.clock.advance(200 + lagOf(env));
  clients[0].start({ rules: r });
  env.clock.advance(500 + lagOf(env));
  if (!clients.every((c) => c.get().started)) throw new Error("not started");
  const seed = clients[0].get().seed;
  if (!clients.every((c) => c.get().seed === seed)) throw new Error("seed mismatch");
  return clients;
}

function boot(env, n, rules) {
  return begin(env, lobby(env, n), rules);
}

function fresh(opt) {
  const clock = makeClock();
  const bus = makeBus(clock, opt || {});
  return { clock, bus, seedBase: (opt && opt.seedBase) || 1000 };
}

function winnerId(c) {
  const w = c.get().roundWinner;
  return w && w.id;
}

function agreeWinners(clients) {
  const ids = clients.map(winnerId);
  if (ids.some((id) => !id)) return { ok: false, ids };
  if (ids.some((id) => id !== ids[0])) return { ok: false, ids };
  const over = clients.every((c) => c.get().roundOver);
  const wins = JSON.stringify(clients[0].wins());
  const sameWins = clients.every((c) => JSON.stringify(c.wins()) === wins);
  const series = clients.map((c) => !!c.get().seriesOver);
  const sameSeries = series.every((s) => s === series[0]);
  return { ok: over && sameWins && sameSeries, ids, wins: clients[0].wins(), seriesOver: series[0] };
}

function killExcept(clients, keep) {
  clients.forEach((c, i) => {
    if (i === keep) return;
    c.dead(20 + i, 4 + i, { btc: (i + 1) * 3 });
  });
}

function playLast(env, clients, keep) {
  killExcept(clients, keep);
  env.clock.advance(800 + lagOf(env) * 2);
  return agreeWinners(clients);
}

function seriesLast(env, clients, bestOf, keep) {
  const need = Math.ceil(bestOf / 2);
  let guard = 0;
  while (guard++ < bestOf + 1) {
    const end = playLast(env, clients, keep);
    if (!end.ok) return end;
    if (end.seriesOver) return end;
    if ((clients[0].wins()[clients[keep].id()] || 0) >= need) {
      return { ok: false, reason: "need reached but series open", wins: clients[0].wins() };
    }
    clients[0].nextRound();
    env.clock.advance(600 + lagOf(env));
    if (!clients.every((c) => c.get().started && !c.get().roundOver)) {
      return { ok: false, reason: "next round did not start" };
    }
  }
  return { ok: false, reason: "series did not finish" };
}

function silence(c) {
  const mp = c.get();
  const ws = mp.ws;
  if (!ws) return;
  ws.onclose = null;
  ws.close();
  if (mp.beat) {
    /* The interval id lives in the client clock, which is shared. */
  }
}

const report = {
  generatedAt: new Date().toISOString(),
  transport: "In-memory bus. Each player loads mp.js in its own vm. WebSocket, Date.now and timers are stubs. A socket can join more than one topic, so the public-room board does not replace the room channel.",
  resolved: [
    "Host handoff elects only players who are not gone, including when the leaver had the lowest id.",
    "A second go with the same seed and game number does not revive a finished round.",
    "A death or finish that arrives before go is kept and replayed after go.",
    "Race mode keeps the earliest finishT, even if the host finished first locally.",
    "A silent player stays in the round at 16s and is dropped after 20s.",
    "A socket drop reconnects with backoff and keeps the local seed.",
    "Silence under 20s plus the same session id receives a sync snapshot. An explicit quit does not."
  ],
  scenarios: [],
  findings: []
};

function scenario(name, fn) {
  try {
    const detail = fn() || {};
    report.scenarios.push(Object.assign({ name, ok: true }, detail));
  } catch (e) {
    report.scenarios.push({ name, ok: false, error: e && e.stack ? e.stack : String(e) });
  }
}

function finding(id, title, detail) {
  report.findings.push({ id, title, detail });
}

scenario("players-2-4-8-last", () => {
  const out = {};
  [2, 4, 8].forEach((n) => {
    const env = fresh({ seedBase: 2000 + n });
    const clients = boot(env, n, { mode: "last", bestOf: 1 });
    const end = playLast(env, clients, 0);
    if (!end.ok) throw new Error(n + " players did not agree " + JSON.stringify(end));
    if (end.ids[0] !== clients[0].id()) throw new Error(n + " winner mismatch");
    if (!end.seriesOver) throw new Error(n + " best of 1 should end the series");
    out["n" + n] = { winner: end.ids[0], wins: end.wins };
  });
  return out;
});

scenario("modes-whale-and-race", () => {
  const whaleEnv = fresh({ seedBase: 3000 });
  const whales = boot(whaleEnv, 4, { mode: "whale", bestOf: 1 });
  whales.forEach((c, i) => c.dead(30 + i, 6, { btc: (i + 1) * 10 }));
  whaleEnv.clock.advance(600);
  const whaleEnd = agreeWinners(whales);
  if (!whaleEnd.ok) throw new Error("whale disagree " + JSON.stringify(whaleEnd));
  if (whaleEnd.ids[0] !== whales[3].id()) throw new Error("whale should pick highest btc");

  const raceEnv = fresh({ seedBase: 3100 });
  const racers = boot(raceEnv, 4, { mode: "race", bestOf: 1 });
  racers[2].finish({ finishT: 12, candles: 21, btc: 2, lifeT: 12 });
  raceEnv.clock.advance(200);
  racers[1].dead(40, 9, { btc: 1 });
  racers[3].dead(41, 8, { btc: 1 });
  raceEnv.clock.advance(200);
  racers[0].finish({ finishT: 18, candles: 21, btc: 4, lifeT: 18 });
  raceEnv.clock.advance(400);
  const raceEnd = agreeWinners(racers);
  if (!raceEnd.ok) throw new Error("race disagree " + JSON.stringify(raceEnd));
  if (raceEnd.ids[0] !== racers[2].id()) throw new Error("race should pick earliest finish");
  return { whale: whaleEnd.ids[0], race: raceEnd.ids[0] };
});

scenario("best-of-1-3-5", () => {
  const out = {};
  [1, 3, 5].forEach((bestOf) => {
    const env = fresh({ seedBase: 4000 + bestOf });
    const clients = boot(env, 2, { mode: "last", bestOf });
    const end = seriesLast(env, clients, bestOf, 0);
    if (!end.ok) throw new Error("best of " + bestOf + " " + JSON.stringify(end));
    const need = Math.ceil(bestOf / 2);
    const got = end.wins[clients[0].id()] || 0;
    if (got < need) throw new Error("best of " + bestOf + " wins " + got);
    if (!end.seriesOver) throw new Error("best of " + bestOf + " series still open");
    out["bo" + bestOf] = { wins: end.wins, games: clients[0].gameN() };
  });
  return out;
});

scenario("duplicate-dead-does-not-double-score", () => {
  const env = fresh({ seedBase: 5000, dup: true, dupGap: 25 });
  const clients = boot(env, 2, { mode: "last", bestOf: 3 });
  const end = playLast(env, clients, 0);
  if (!end.ok) throw new Error("dup round failed " + JSON.stringify(end));
  const w = end.wins[clients[0].id()] || 0;
  if (w !== 1) throw new Error("series score doubled: " + w);
  return { wins: end.wins };
});

scenario("high-latency-still-finishes", () => {
  const env = fresh({ seedBase: 6000, latency: 1500 });
  const clients = boot(env, 4, { mode: "last", bestOf: 1 });
  const end = playLast(env, clients, 0);
  if (!end.ok) throw new Error("latent match failed " + JSON.stringify(end));
  const aliveFlags = clients.map((c) => c.players().map((p) => p.alive !== false));
  return { winner: end.ids[0], aliveFlags };
});

scenario("room-full-at-8", () => {
  const env = fresh({ seedBase: 7000 });
  const clients = boot(env, 8, { mode: "last", bestOf: 1 });
  /* boot already started the match, and a 9th is dropped once the round is on.
     Build a lobby instead for the full-room check. */
  clients.forEach((c) => {
    try { c.leave(); } catch (e) {}
  });
  env.clock.advance(200);
  const lobby = [];
  for (let i = 0; i < 9; i++) {
    lobby.push(makeClient(env.clock, env.bus, {
      seed: 8000 + i,
      name: "L" + (i + 1),
      uid: null
    }));
  }
  lobby[0].host();
  env.clock.advance(400);
  const code = lobby[0].code();
  for (let i = 1; i < 8; i++) {
    lobby[i].join(code);
    env.clock.advance(350);
  }
  env.clock.advance(2200);
  if (lobby[0].players().length !== 8) throw new Error("expected 8 before the extra join, got " + lobby[0].players().length);
  const extraErr = [];
  lobby[8].setHandler((ev, data) => { if (ev === "err") extraErr.push(data); });
  lobby[8].join(code);
  env.clock.advance(800);
  const still = lobby[0].players().some((p) => p.id === lobby[8].id());
  if (still) throw new Error("9th player stayed in the roster");
  if (extraErr.indexOf("full") < 0 && lobby[8].code()) throw new Error("9th was not rejected");
  return { roster: lobby[0].players().length, err: extraErr };
});

scenario("host-leave-adopts-and-finishes", () => {
  let adopted = 0;
  let hostWasMinOk = 0;
  for (let t = 0; t < 24; t++) {
    const env = fresh({ seedBase: 9000 + t * 17 });
    const clients = boot(env, 4, { mode: "last", bestOf: 1 });
    const hostId = clients[0].id();
    const ids = clients.map((c) => c.id()).slice().sort();
    const hostIsMin = ids[0] === hostId;
    clients[0].leave();
    env.clock.advance(500);
    const rest = clients.slice(1);
    const hosts = rest.filter((c) => c.get().host);
    if (hosts.length !== 1) throw new Error("room " + t + " hosts " + hosts.length + " min " + hostIsMin);
    adopted++;
    if (hostIsMin) hostWasMinOk++;
    const end = playLast(env, rest, 0);
    if (!end.ok) throw new Error("room " + t + " did not finish " + JSON.stringify(end));
  }
  if (hostWasMinOk < 1) throw new Error("sample missed a leaver with the lowest id");
  return { adopted, hostWasMinOk };
});

scenario("socket-drop-keeps-the-round", () => {
  const env = fresh({ seedBase: 11000 });
  const clients = boot(env, 3, { mode: "last", bestOf: 1 });
  const seed = clients[1].get().seed;
  const ws = clients[1].get().ws;
  ws.close();
  env.clock.advance(500);
  if (clients[1].link() === "on") throw new Error("link stayed on during the gap");
  env.clock.advance(1500);
  const back = clients[1].get();
  const same = back.started && back.seed === seed && back.code === clients[0].code();
  if (!same) throw new Error("in-tab reconnect lost the round");
  if (clients[1].link() !== "on") throw new Error("link did not return, got " + clients[1].link());
  return { same, link: clients[1].link() };
});

scenario("quit-does-not-restore", () => {
  const env = fresh({ seedBase: 12000 });
  const clients = boot(env, 3, { mode: "last", bestOf: 1 });
  const code = clients[0].code();
  const id = clients[1].id();
  const storage = clients[1]._storage;
  clients[1].leave();
  env.clock.advance(300);
  const twin = makeClient(env.clock, env.bus, {
    seed: 12111,
    name: "P2",
    uid: "00000000-0000-4000-8000-000000000002",
    storage
  });
  if (twin.id() !== id) throw new Error("session id changed");
  twin.join(code);
  env.clock.advance(800);
  if (twin.get().started) throw new Error("quit received a round snapshot");
  const row = clients[0].players().find((p) => p.id === id);
  if (!row || !row.quit || row.alive !== false) throw new Error("quit did not stick " + JSON.stringify(row && { quit: row.quit, alive: row.alive }));
  return { quit: true };
});

scenario("silence-rejoin-restores-round", () => {
  const env = fresh({ seedBase: 12200 });
  const clients = boot(env, 3, { mode: "last", bestOf: 1 });
  const seed = clients[1].get().seed;
  const code = clients[0].code();
  const id = clients[1].id();
  const storage = clients[1]._storage;
  silence(clients[1]);
  env.clock.advance(500);
  const twin = makeClient(env.clock, env.bus, {
    seed: 12211,
    name: "P2",
    uid: "00000000-0000-4000-8000-000000000002",
    storage
  });
  if (twin.id() !== id) throw new Error("session id was not kept");
  twin.join(code);
  env.clock.advance(1200);
  if (!twin.get().started || twin.get().seed !== seed) throw new Error("sync missed the seed");
  const me = twin.players().find((p) => p.id === id);
  if (!me || me.alive === false) throw new Error("player was dropped inside 20s");
  return { seed };
});

scenario("probe-duplicate-go", () => {
  const env = fresh({ seedBase: 13000 });
  const clients = boot(env, 2, { mode: "last", bestOf: 1 });
  clients[1].dead(15, 3, { btc: 1 });
  env.clock.advance(200);
  const deadBefore = clients[0].players().find((p) => p.id === clients[1].id());
  const wasDead = !!(deadBefore && deadBefore.alive === false);
  const overBefore = !!clients[0].get().roundOver;
  const mp = clients[0].get();
  mp.ws.send(JSON.stringify({
    topic: "realtime:mp-" + mp.code,
    event: "broadcast",
    payload: {
      type: "broadcast",
      event: "go",
      payload: {
        seed: mp.seed,
        startAt: mp.startAt,
        sentAt: env.clock.now,
        rules: mp.rules,
        gameN: mp.gameN,
        wins: mp.seriesWins,
        seriesOver: false,
        players: mp.players.map((p) => ({ id: p.id, name: p.name, uid: p.uid || null, slot: p.slot, host: !!p.host }))
      }
    }
  }));
  env.clock.advance(200);
  const after = clients[0].players().find((p) => p.id === clients[1].id());
  const revived = !!(wasDead && after && after.alive !== false);
  if (!wasDead || !overBefore) throw new Error("round was not over before the duplicate go");
  if (revived || !clients[0].get().roundOver) throw new Error("duplicate go reopened the round");
  return { revived: false, roundOverAfter: true };
});

scenario("probe-dead-before-go", () => {
  const env = fresh({
    seedBase: 14000,
    extra: (ev) => (ev === "go" ? 700 : 0)
  });
  const clients = lobby(env, 2);
  const rules = { mode: "last", bestOf: 1, bull: 38, bear: 22, laser: 10, swan: 20, cold: 10, raceN: 21 };
  clients[0].setRules(rules);
  env.clock.advance(200);
  clients[0].start({ rules });
  clients[1].dead(10, 2, { btc: 1 });
  env.clock.advance(200);
  const mid = clients[0].players().find((p) => p.id === clients[1].id());
  const deadMid = !!(mid && mid.alive === false);
  const overMid = !!clients[0].get().roundOver;
  env.clock.advance(900);
  const late = clients[0].players().find((p) => p.id === clients[1].id());
  const guest = clients[1].players().find((p) => p.id === clients[1].id());
  if (!deadMid || !overMid) throw new Error("host missed the early death");
  if (!late || late.alive !== false || !clients[0].get().roundOver) throw new Error("delayed go wiped the death");
  if (!guest || guest.alive !== false || !clients[1].get().roundOver) throw new Error("guest did not keep the death");
  return { deadMid, roundOverAfter: true };
});

scenario("probe-race-locks-first-claim", () => {
  const env = fresh({ seedBase: 14500 });
  const clients = boot(env, 3, { mode: "race", bestOf: 1 });
  clients[0].finish({ finishT: 40, candles: 21, btc: 1, lifeT: 40 });
  clients[1].finish({ finishT: 8, candles: 21, btc: 9, lifeT: 8 });
  clients[2].dead(50, 4, { btc: 1 });
  env.clock.advance(500);
  const end = agreeWinners(clients);
  if (!end.ok || !end.ids || end.ids[0] !== clients[1].id()) {
    throw new Error("race kept the wrong finish " + JSON.stringify(end.ids));
  }
  return { winner: end.ids[0] };
});

scenario("silence-survives-16s-and-drops-after-20s", () => {
  const env = fresh({ seedBase: 15000 });
  const clients = boot(env, 3, { mode: "last", bestOf: 1 });
  const watch = clients[2].id();
  silence(clients[2]);
  env.clock.advance(16000);
  const mid = clients[0].players().find((row) => row.id === watch);
  if (!mid || mid.alive === false) throw new Error("silent player was dropped at 16s");
  env.clock.advance(8000);
  const late = clients[0].players().find((row) => row.id === watch);
  if (!late || late.alive !== false || !late.gone) throw new Error("silent player still counted at 24s");
  return { age: env.clock.now - late.last };
});

scenario("probe-out-of-order-over", () => {
  const env = fresh({
    seedBase: 16000,
    extra: (ev) => (ev === "over" ? 500 : ev === "dead" ? 0 : 0)
  });
  const clients = boot(env, 2, { mode: "last", bestOf: 1 });
  clients[1].dead(22, 5, { btc: 2 });
  env.clock.advance(200);
  const hostOverEarly = !!clients[0].get().roundOver;
  env.clock.advance(800);
  const end = agreeWinners(clients);
  if (!hostOverEarly) throw new Error("host did not close the round locally");
  if (!end.ok) throw new Error("delayed over never agreed " + JSON.stringify(end));
  if ((end.wins[clients[0].id()] || 0) !== 1) throw new Error("series score changed " + JSON.stringify(end.wins));
  return { hostOverEarly, wins: end.wins };
});

scenario("open-room-lists-and-expires", () => {
  const env = fresh({ seedBase: 17000 });
  const host = makeClient(env.clock, env.bus, { seed: 17001, name: "Host", uid: null });
  const guest = makeClient(env.clock, env.bus, { seed: 17002, name: "Guest", uid: null });
  host.host();
  env.clock.advance(500);
  host.setRules(Object.assign({}, RULES.last, { open: true }));
  guest.browse(true);
  env.clock.advance(2600);
  const code = host.code();
  const rows = guest.rooms();
  if (!rows.some((r) => r.code === code && r.mode === "last")) throw new Error("open room missing " + JSON.stringify(rows));
  host.setRules(Object.assign({}, RULES.last, { open: false }));
  env.clock.advance(8000);
  if (guest.rooms().some((r) => r.code === code)) throw new Error("closed room stayed on the board");
  return { code };
});

scenario("reaction-is-rate-limited", () => {
  const env = fresh({ seedBase: 18000 });
  const clients = boot(env, 2, { mode: "last", bestOf: 1 });
  if (clients[1].react("nope")) throw new Error("unknown reaction was accepted");
  if (!clients[1].react("gg")) throw new Error("first reaction was rejected");
  if (clients[1].react("wow")) throw new Error("second reaction ignored the limit");
  env.clock.advance(1300);
  if (!clients[1].react("rip")) throw new Error("reaction stayed blocked after 1.2s");
  env.clock.advance(300);
  const row = clients[0].players().find((p) => p.id === clients[1].id());
  if (!row || !row.react || row.react.rid !== "rip") throw new Error("peer missed the reaction");
  return { rid: row.react.rid };
});

function writeReport() {
  fs.mkdirSync(OUT_DIR, { recursive: true });
  const failed = report.scenarios.filter((s) => !s.ok);
  report.summary = {
    scenarios: report.scenarios.length,
    failed: failed.length,
    findings: report.findings.length
  };
  fs.writeFileSync(path.join(OUT_DIR, "mp-sim-report.json"), JSON.stringify(report, null, 2));
  const lines = [];
  lines.push("# Versus simulator");
  lines.push("");
  lines.push(report.transport);
  lines.push("");
  lines.push("Scenarios: " + report.summary.scenarios + ". Failed: " + report.summary.failed + ". Findings: " + report.summary.findings + ".");
  lines.push("");
  lines.push("## Scenarios");
  lines.push("");
  report.scenarios.forEach((s) => {
    lines.push("- " + (s.ok ? "PASS" : "FAIL") + " " + s.name + (s.ok ? "" : " — " + String(s.error || "").split("\n")[0]));
  });
  lines.push("");
  lines.push("## Resolved");
  lines.push("");
  (report.resolved || []).forEach((line) => { lines.push("- " + line); });
  lines.push("");
  lines.push("## Findings");
  lines.push("");
  if (!report.findings.length) lines.push("No open protocol findings in this run.");
  report.findings.forEach((f) => {
    lines.push("### " + f.id);
    lines.push("");
    lines.push(f.title);
    lines.push("");
    lines.push(f.detail);
    lines.push("");
  });
  lines.push("## Limits");
  lines.push("");
  lines.push("A client can still lie about BTC, candles, or finish time. Nothing on the server replays the match. The ELO vote only checks that enough signed-in players name the same winner. Catch-up after a sync snapshot does not replay flap presses. An explicit quit stays out of the round.");
  lines.push("");
  lines.push("The bus is not Supabase. It delivers broadcasts to every socket on the topic, including the sender, because the room channel joins with broadcast self turned on. It does not model presence or the game loop in game.js.");
  fs.writeFileSync(path.join(OUT_DIR, "mp-sim-report.md"), lines.join("\n"));
  return failed.length;
}

const failed = writeReport();
if (failed) {
  console.error("mp-sim: " + failed + " scenario(s) failed. See tests/out/mp-sim-report.md");
  process.exit(1);
}
console.log("mp-sim: " + report.summary.scenarios + " scenarios passed, " + report.summary.findings + " findings. Report in tests/out/");
