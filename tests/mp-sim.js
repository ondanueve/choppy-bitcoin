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
 * Hard scenarios must agree on the winner. Probes record protocol gaps
 * without changing mp.js. A later patch can turn a resolved probe into a
 * hard check by setting EXPECT on that probe.
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
        ws.topic = msg.topic;
        this.deliver(ws, { event: "phx_reply", payload: { status: "ok" }, ref: msg.ref, topic: msg.topic }, 0);
        return;
      }
      if (msg.event !== "broadcast") return;
      const ev = msg.payload && msg.payload.event;
      if (this.drop(ev, msg)) return;
      const base = this.latency + (this.extra(ev, msg) || 0);
      const jitter = this.reorder ? Math.floor(this.rand() * this.reorder) : 0;
      const targets = sockets.filter((s) => s.readyState === 1 && s.topic === msg.topic);
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
  transport: "In-memory bus. Each player loads mp.js in its own vm. WebSocket, Date.now and timers are stubs. No edit to mp.js was required for the harness.",
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

scenario("probe-host-leave", () => {
  let adopted = 0;
  let stuck = 0;
  let hostWasMinStuck = 0;
  let hostWasMinOk = 0;
  const samples = [];
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
    const row = { hostIsMin, hosts: hosts.length };
    samples.push(row);
    if (hosts.length === 1) {
      adopted++;
      if (hostIsMin) hostWasMinOk++;
      const end = playLast(env, rest, 0);
      row.finished = !!end.ok;
      if (!end.ok) row.finish = end;
    } else {
      stuck++;
      if (hostIsMin) hostWasMinStuck++;
      row.finished = false;
    }
  }
  finding(
    "host-adopt",
    "tryAdoptHost keeps the departed host in the election",
    "markGone clears the host flag but leaves that player in the list. Election sorts every id, including the player who left. When that id is first, every remaining client sees the leaver as the candidate and adopts nobody. The round then has no host, so considerOver never declares a winner. Across 24 rooms: adopted " + adopted + ", stuck " + stuck + ", stuck while the leaver had the lowest id " + hostWasMinStuck + ", adopted while the leaver had the lowest id " + hostWasMinOk + "."
  );
  if (!stuck) finding("host-adopt-sample", "This run did not stick a hostless room", "Random ids did not put the leaver first. The code path is still present.");
  return { adopted, stuck, hostWasMinStuck, hostWasMinOk };
});

scenario("probe-socket-rejoin", () => {
  const env = fresh({ seedBase: 11000 });
  const clients = boot(env, 3, { mode: "last", bestOf: 1 });
  const seed = clients[1].get().seed;
  const ws = clients[1].get().ws;
  ws.close();
  env.clock.advance(2000);
  const back = clients[1].get();
  const same = back.started && back.seed === seed && back.code === clients[0].code();
  const rejoinAt = back.rejoinAt || 0;
  finding(
    "rejoin-at",
    "Socket drop auto-reconnects after 1.2s and keeps the local round",
    "After close(), onclose waits 1200ms and calls joinSocket because the room code is still set. started and seed stayed " + String(same) + ". rejoinAt after settle is " + rejoinAt + ". handle('host') sets rejoinAt back to 0, so the 800ms considerOver grace usually ends as soon as the host beacon arrives, which is well under 800ms on a live socket."
  );
  if (!same) throw new Error("in-tab reconnect lost the round");
  return { same, rejoinAt };
});

scenario("probe-leave-and-rejoin", () => {
  const env = fresh({ seedBase: 12000 });
  const clients = boot(env, 3, { mode: "last", bestOf: 1 });
  const seed = clients[1].get().seed;
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
  twin.join(code);
  env.clock.advance(800);
  const restored = twin.get().started && twin.get().seed === seed;
  const known = clients[0].players().some((p) => p.id === id);
  finding(
    "rejoin-page",
    "leave() plus join() does not restore the round",
    "The same session id is still known to the host (" + known + ") because a mid-round left marks the player gone instead of deleting them. The returning client sets started to false and never receives the seed. started restored: " + restored + ". A refresh that does not call leave() is only a silent socket: the player is removed from contention after the 12s stale window, and nothing replays the round."
  );
  return { restored, known, seed: twin.get().seed || 0 };
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
  finding(
    "dup-go",
    "A second go for the same seed resets the round",
    "handle('go') always marks every player alive and clears the round. After the guest was dead (" + wasDead + ", round over " + overBefore + "), the same go payload was delivered again. That player is alive afterwards: " + revived + ", roundOver " + !!clients[0].get().roundOver + "."
  );
  return { wasDead, overBefore, revived, roundOverAfter: !!clients[0].get().roundOver };
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
  finding(
    "reorder-go",
    "go overwrites a death that was applied first",
    "go is held 700ms. The guest sends dead before that copy arrives. Host saw the player dead at 200ms: " + deadMid + " (round already over: " + overMid + "). After the delayed go, alive is " + (late ? late.alive !== false : "missing") + " and roundOver is " + !!clients[0].get().roundOver + ". handle('go') forces every player alive and clears the round, so a death that arrived first is lost."
  );
  return { deadMid, overMid, aliveAfter: late ? late.alive !== false : null, roundOverAfter: !!clients[0].get().roundOver };
});

scenario("probe-race-locks-first-claim", () => {
  const env = fresh({ seedBase: 14500 });
  const clients = boot(env, 3, { mode: "race", bestOf: 1 });
  clients[0].finish({ finishT: 40, candles: 21, btc: 1, lifeT: 40 });
  clients[1].finish({ finishT: 8, candles: 21, btc: 9, lifeT: 8 });
  clients[2].dead(50, 4, { btc: 1 });
  env.clock.advance(500);
  const end = agreeWinners(clients);
  const fair = end.ids && end.ids[0] === clients[1].id();
  finding(
    "race-lock",
    "Race mode keeps the first finish the host applies, not the earliest finishT",
    "considerOver uses `winner || fins[0]`, and the host applies their own finish() before the network is pumped. The host finished at 40s and a guest at 8s, but the guest message was still queued. Agreed winner is the guest: " + fair + ". Winner id " + (end.ids && end.ids[0]) + ", guest id " + clients[1].id() + ", host id " + clients[0].id() + "."
  );
  return { fair, ids: end.ids, ok: end.ok };
});

scenario("probe-stale-window", () => {
  const env = fresh({ seedBase: 15000 });
  const clients = boot(env, 3, { mode: "last", bestOf: 1 });
  const watch = clients[2].id();
  silence(clients[2]);
  const marks = [];
  for (let s = 2; s <= 16; s += 2) {
    env.clock.advance(2000);
    const p = clients[0].players().find((row) => row.id === watch);
    const age = p && p.last ? env.clock.now - p.last : null;
    marks.push({ s, dead: !!(p && p.alive === false), age });
  }
  const firstDead = marks.find((m) => m.dead);
  finding(
    "stale-12s",
    "A silent player is marked dead about 12s after the last packet",
    "pruneStale cuts at Date.now() - 12000 and runs on the 2s heartbeat. First sample with alive false: " + (firstDead ? (firstDead.s + "s of silence, last packet age " + firstDead.age + "ms") : "none") + ". Samples: " + marks.map((m) => m.s + "s dead=" + m.dead + " age=" + m.age).join("; ") + ". That window is shorter than 20s, so a reload cannot resume the round. Explicit leave() marks them dead immediately, with no snapshot to restore seed or score."
  );
  return { marks };
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
  finding(
    "over-delay",
    "The host applies over locally before guests see the delayed copy",
    "declareOver updates the host at once and broadcasts over. With over delayed 500ms, the host was already round-over at 200ms (" + hostOverEarly + "). Guests agreed after the delay: " + end.ok + ". A late over still replaces seriesWins from the payload, so it does not add a second point."
  );
  if (!end.ok) throw new Error("delayed over never agreed " + JSON.stringify(end));
  return { hostOverEarly, agreed: end.ok, wins: end.wins };
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
  lines.push("## Findings");
  lines.push("");
  report.findings.forEach((f) => {
    lines.push("### " + f.id);
    lines.push("");
    lines.push(f.title);
    lines.push("");
    lines.push(f.detail);
    lines.push("");
  });
  lines.push("## What this run does not claim");
  lines.push("");
  lines.push("The bus is not Supabase. It delivers broadcasts to every socket on the topic, including the sender, because the client joins with broadcast self turned on. It does not model presence, packet loss beyond the probes, or the game loop in game.js.");
  fs.writeFileSync(path.join(OUT_DIR, "mp-sim-report.md"), lines.join("\n"));
  return failed.length;
}

const failed = writeReport();
if (failed) {
  console.error("mp-sim: " + failed + " scenario(s) failed. See tests/out/mp-sim-report.md");
  process.exit(1);
}
console.log("mp-sim: " + report.summary.scenarios + " scenarios passed, " + report.summary.findings + " findings. Report in tests/out/");
