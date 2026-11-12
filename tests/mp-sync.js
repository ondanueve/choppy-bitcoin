#!/usr/bin/env node
"use strict";

/*
 * Versus lobby resume, join links, shared startAt, and power-up wave share.
 */

const fs = require("fs");
const path = require("path");
const vm = require("vm");
const assert = require("assert");

const ROOT = path.resolve(__dirname, "..");
const game = fs.readFileSync(path.join(ROOT, "game.js"), "utf8");
const i18n = fs.readFileSync(path.join(ROOT, "i18n.js"), "utf8");
const mp = fs.readFileSync(path.join(ROOT, "mp.js"), "utf8");

function slice(src, startTok, endTok) {
  const start = src.indexOf(startTok);
  const end = src.indexOf(endTok, start);
  assert.ok(start >= 0 && end > start, "missing " + startTok);
  return src.slice(start, end);
}

assert.ok(/ensureMp\(\)\.then\(\(mp\) => \{[\s\S]*mp\.browse\(true\)/.test(game), "openMpLobby browses after ensureMp");
assert.ok(/S\.mpAutoJoin = true/.test(game) && /if \(S\.mpAutoJoin\)/.test(game), "join link sets auto-join once");
assert.ok(/sessionStorage\.getItem\("choppy-mp-room"\)/.test(game) && /tryResumeMp\(\)/.test(game), "reload resume waits for mp.js");
assert.ok(/ChoppyMP\.joinUrl\(c\)/.test(game) && /https:\/\/bitcoinizate\.com\/choppy-bitcoin\/\?room=/.test(mp), "copy uses the full join URL");
assert.ok(/t\("mpHostRole"\)/.test(game) && /t\("mpGuest"\)/.test(game) && /t\("mpView"\)/.test(game), "leftover English roster/rules strings are translated");
assert.ok(/youWinText/.test(mp) && /mpYouWinWhale/.test(mp) && /mpYouWinRace/.test(mp), "win text is mode-specific");
assert.ok(/function take\(info\)/.test(mp) && /ev === "take"/.test(mp) && /function shareTake/.test(mp) && /function applyTake/.test(mp), "pickup take is on the wire");
assert.ok(/beginCycle\(w\.type, w\.kind, w\)/.test(mp) && /bindGame/.test(game), "peers apply the shared wave bag");
assert.ok(/sid: S\.spawnedPipes/.test(game), "items get a stable spawn id");
assert.ok(/if \(!watching && !S\.mpCatch/.test(game), "reconnect catch-up does not collect items");

function hasKey(lang, key, value) {
  const blockStart = i18n.indexOf(lang + ": {");
  assert.ok(blockStart > 0, lang + " block");
  const next = i18n.indexOf("\n    },", blockStart);
  const block = i18n.slice(blockStart, next);
  const re = new RegExp(key + ": \"" + value.replace(/[.*+?^${}()|[\]\\]/g, "\\$&") + "\"");
  assert.ok(re.test(block), lang + " " + key + " should be " + value);
}

hasKey("en", "mpCopy", "COPY LINK");
hasKey("es", "mpCopy", "COPIAR ENLACE");
hasKey("en", "mpHostRole", "host");
hasKey("es", "mpHostRole", "anfitrión");
hasKey("en", "mpGuest", "guest");
hasKey("es", "mpGuest", "invitado");
hasKey("en", "mpView", "view");
hasKey("es", "mpView", "solo ver");
hasKey("en", "mpYouWinWhale", "TOP WHALE");
hasKey("es", "mpYouWinWhale", "LA MAYOR BALLENA");
hasKey("en", "mpYouWinRace", "RACE WON");
hasKey("es", "mpYouWinRace", "CARRERA GANADA");
hasKey("en", "runStats", "STATS");
hasKey("es", "runStats", "ESTADÍSTICAS");

const start = game.indexOf("function playAtFromGo(data)");
const end = game.indexOf("function beginMpCountdown", start);
assert.ok(start > 0 && end > start, "playAtFromGo found");
const box = { now: 1_000_000, Date: { now: () => box.now } };
vm.createContext(box);
vm.runInContext(game.slice(start, end) + "; this.playAtFromGo = playAtFromGo;", box);

box.now = 10_000;
assert.strictEqual(box.playAtFromGo({ startAt: 13_000, sentAt: 9_800 }), 13_000, "shared startAt is used when clocks agree");
assert.strictEqual(box.playAtFromGo({ startAt: 13_200, sentAt: 10_000 }), 13_200, "host startAt within the window wins");
const skewed = box.playAtFromGo({ startAt: 10_000 + 20_000, sentAt: 10_000 });
assert.ok(skewed !== 30_000, "far-skewed startAt is not used as an absolute time");
assert.strictEqual(skewed, 10_000 + 5000, "far-skewed startAt falls back to the clamped delay");
assert.strictEqual(box.playAtFromGo({}), 13_200, "missing startAt keeps the 3.2s countdown");

console.log("mp-sync tests ok (lobby after ensureMp, join link, startAt, shared waves, i18n)");
