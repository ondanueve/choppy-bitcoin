"use strict";

const fs = require("fs");
const path = require("path");
const vm = require("vm");

const authPath = path.join(__dirname, "..", "auth.js");
const uid = "11111111-1111-4111-8111-111111111111";

function assert(cond, msg) {
  if (!cond) throw new Error(msg);
}

function boot(opts) {
  const updates = [];
  const rpcs = [];
  const warnings = [];
  const store = {
    "choppy-awards": JSON.stringify({ [uid]: { maxi: true } }),
    "bitcoinizate-v1": JSON.stringify({
      choppyStats: { candles: 12, sells: 0, tape: [1, 2, 3], time: 20 }
    })
  };
  const localStorage = {
    getItem(k) { return Object.prototype.hasOwnProperty.call(store, k) ? store[k] : null; },
    setItem(k, v) { store[k] = String(v); },
    removeItem(k) { delete store[k]; }
  };
  function el() {
    return {
      className: "",
      textContent: "",
      innerHTML: "",
      hidden: false,
      value: "",
      dataset: {},
      style: { setProperty() {}, zIndex: "" },
      classList: { add() {}, remove() {}, toggle() {}, contains() { return false; } },
      addEventListener() {},
      removeEventListener() {},
      appendChild() {},
      closest() { return null; },
      focus() {},
      click() {}
    };
  }
  const elements = {};
  const document = {
    getElementById(id) { return elements[id] || (elements[id] = el()); },
    addEventListener() {},
    body: { appendChild() {} },
    getElementsByTagName() { return []; }
  };
  const user = opts.user || null;
  const profile = opts.profile || null;
  function builder() {
    const state = { op: "select", payload: null };
    const b = {
      select() { state.op = "select"; return b; },
      order() { return b; },
      limit() { return Promise.resolve({ data: [], error: null }); },
      ilike() { return Promise.resolve({ data: [], error: null }); },
      eq() {
        if (state.op === "update") {
          updates.push(state.payload);
          return Promise.resolve({ data: null, error: null });
        }
        return b;
      },
      update(payload) { state.op = "update"; state.payload = payload; return b; },
      insert() { return Promise.resolve({ error: null }); },
      single() {
        if (!profile) return Promise.resolve({ data: null, error: { message: "no row" } });
        return Promise.resolve({ data: profile, error: null });
      }
    };
    return b;
  }
  const supabase = {
    auth: {
      getSession: async () => ({ data: { session: user ? { user: user } : null }, error: null }),
      signOut: async () => ({})
    },
    from() { return builder(); },
    rpc: async (name, args) => {
      rpcs.push({ name: name, args: args });
      return opts.rpc(name, args);
    }
  };
  const merged = [];
  const windowObj = {
    document: document,
    localStorage: localStorage,
    location: { hash: "", search: "", origin: "http://localhost", pathname: "/choppy-bitcoin/" },
    addEventListener() {},
    supabase: { createClient() { return supabase; } },
    mergeChoppyAwards(ids) { merged.push(ids); },
    choppyUserId: ""
  };
  windowObj.window = windowObj;
  const context = {
    window: windowObj,
    document: document,
    localStorage: localStorage,
    location: windowObj.location,
    console: {
      warn() { warnings.push(Array.prototype.join.call(arguments, " ")); },
      error() { warnings.push("ERR " + Array.prototype.join.call(arguments, " ")); },
      log() {}
    },
    setTimeout: setTimeout,
    clearTimeout: clearTimeout,
    URL: URL,
    URLSearchParams: URLSearchParams,
    Promise: Promise,
    JSON: JSON,
    Math: Math,
    Date: Date,
    Number: Number,
    String: String,
    Object: Object,
    Array: Array,
    RegExp: RegExp,
    parseInt: parseInt,
    isFinite: isFinite,
    encodeURIComponent: encodeURIComponent,
    decodeURIComponent: decodeURIComponent,
    Error: Error,
    TypeError: TypeError
  };
  context.globalThis = context;
  vm.createContext(context);
  vm.runInContext(fs.readFileSync(authPath, "utf8"), context, { filename: "auth.js" });
  return { window: windowObj, updates: updates, rpcs: rpcs, warnings: warnings, merged: merged };
}

function waitFor(fn) {
  return new Promise((resolve, reject) => {
    let n = 0;
    (function tick() {
      if (fn()) return resolve();
      if (++n > 50) return reject(new Error("timeout"));
      setTimeout(tick, 10);
    })();
  });
}

function awardUpdates(updates) {
  return updates.filter((p) => p && Object.prototype.hasOwnProperty.call(p, "awards"));
}

(async () => {
  const src = fs.readFileSync(authPath, "utf8");
  assert(!/from\("profiles"\)\.update\(\{[^}]*awards/.test(src), "auth.js still writes profiles.awards directly");

  const user = { id: uid, email: null };
  const profile = { id: uid, username: "tester", highscore: 0, awards: [], email: null };

  const ok = boot({
    user: user,
    profile: profile,
    rpc(name, args) {
      if (name === "grant_awards") return { data: args.p_ids.slice(), error: null };
      return { data: 1, error: null };
    }
  });
  await waitFor(() => ok.window.choppyUserId === uid);
  ok.rpcs.length = 0;
  ok.updates.length = 0;
  ok.merged.length = 0;
  await ok.window.persistAwards(["maxi", "longHaul"]);
  assert(ok.rpcs.length === 1, "expected one RPC, got " + ok.rpcs.length);
  assert(ok.rpcs[0].name === "grant_awards", "expected grant_awards");
  assert(ok.rpcs[0].args.p_ids.join(",") === "maxi,longHaul", "ids were not forwarded");
  assert(ok.rpcs[0].args.p_run && ok.rpcs[0].args.p_run.candles === 12, "compact run missing");
  assert(ok.rpcs[0].args.p_run.tape === undefined, "tape must not be sent");
  assert(awardUpdates(ok.updates).length === 0, "RPC success still updated awards directly");
  assert(ok.merged.length === 1 && ok.merged[0].join(",") === "maxi,longHaul", "server ids were not merged");

  const missing = boot({
    user: user,
    profile: profile,
    rpc() {
      return { data: null, error: { code: "PGRST202", message: "Could not find the function public.grant_awards" } };
    }
  });
  await waitFor(() => missing.window.choppyUserId === uid);
  missing.updates.length = 0;
  missing.warnings.length = 0;
  await missing.window.persistAwards(["maxi"]);
  await missing.window.persistAwards(["paper"]);
  assert(missing.warnings.length === 1, "missing RPC should warn once, got " + missing.warnings.length);
  assert(/not available yet/.test(missing.warnings[0]), "warning text");
  assert(awardUpdates(missing.updates).length === 0, "missing RPC fell back to a direct update");

  const byMessage = boot({
    user: user,
    profile: profile,
    rpc() {
      const err = new Error("Could not find the function public.grant_awards(p_ids, p_run) in the schema cache");
      err.status = 404;
      return { data: null, error: err };
    }
  });
  await waitFor(() => byMessage.window.choppyUserId === uid);
  byMessage.updates.length = 0;
  await byMessage.window.persistAwards(["opsec"]);
  assert(byMessage.warnings.length === 1, "404 message should warn");
  assert(awardUpdates(byMessage.updates).length === 0, "404 fell back to a direct update");

  const guest = boot({
    user: null,
    profile: null,
    rpc() { return { data: null, error: null }; }
  });
  await new Promise((r) => setTimeout(r, 40));
  guest.rpcs.length = 0;
  await guest.window.persistAwards(["maxi"]);
  assert(guest.rpcs.length === 0, "guest sent an award RPC");
  assert(awardUpdates(guest.updates).length === 0, "guest wrote awards");

  console.log("ok persist-awards");
})().catch((err) => {
  console.error(err && err.stack || err);
  process.exit(1);
});
