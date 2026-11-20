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
assert.ok(/joinUrl\(c\)/.test(game + mp) && /https:\/\/bitcoinizate\.com\/choppy-bitcoin\/\?room=/.test(mp), "copy uses the full join URL");
assert.ok(/t\("mpHostRole"\)/.test(game + mp) && /t\("mpGuest"\)/.test(game + mp) && /t\("mpView"\)/.test(game + mp), "leftover English roster/rules strings are translated");
assert.ok(/youWinText/.test(mp) && /mpYouWinWhale/.test(mp) && /mpYouWinRace/.test(mp), "win text is mode-specific");
assert.ok(/function take\(info\)/.test(mp) && /ev === "take"/.test(mp) && /function shareTake/.test(mp) && /function applyTake/.test(mp), "pickup take is on the wire");
assert.ok(/beginCycle\(w\.type, w\.kind, w\)/.test(mp) && /bindGame/.test(game), "peers apply the shared wave bag");
assert.ok(/sid: S\.spawnedPipes/.test(game), "items get a stable spawn id");
assert.ok(/if \(!watching && !S\.mpCatch/.test(game), "reconnect catch-up does not collect items");
assert.ok(/S\.mpRules && S\.mpRules.mode === "race"/.test(game) && /S\.mpRules.raceN/.test(game) && /spawnedPipes === raceN/.test(game), "finish pipe uses the room raceN");
assert.ok(/raceCap && \(S\.spawnedPipes \|\| 0\) >= raceCap/.test(game), "race stops spawning pipes past the finish");
assert.ok(/last \? "<p class=\\"k\\">" \+ mpYouWinText\(\)/.test(mp), "series-over screen includes mode-specific win text for every player");

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

// Laser scroll is room-wide: shared lifeT window, peer pickups extend it.
{
  const src = slice(game, "function laserScroll()", "function pipePw()");
  const S = { mp: true, lifeT: 10, phase: "play", laserOn: false, halveBull: false, pipes: [{ x: 300 }], items: [{ x: 200, freeX: true }, { x: 150 }], floats: [] };
  const lb = { S, POWER_S: 5, HALVE_SPEED: 1.5, metrics: () => ({ speed: 100 }), scrollMul: () => 1, streakLeft: () => 0 };
  vm.createContext(lb);
  vm.runInContext(src + "; this.laserScroll = laserScroll; this.mpLaserScroll = mpLaserScroll; this.mpLaserTake = mpLaserTake;", lb);
  assert.strictEqual(lb.laserScroll(), false, "no laser, no Versus boost");
  S.laserOn = true;
  assert.strictEqual(lb.laserScroll(), false, "in Versus the personal laser flag alone does not boost");
  lb.mpLaserScroll(10);
  assert.strictEqual(S.mpScrollUntil, 15, "local pickup opens a 5s shared window");
  lb.mpLaserScroll(12);
  assert.strictEqual(S.mpScrollUntil, 20, "a second pickup inside the window extends it like laserT");
  S.lifeT = 19.9; assert.strictEqual(lb.laserScroll(), true, "boost still on inside the window");
  S.lifeT = 20; assert.strictEqual(lb.laserScroll(), false, "boost ends at the shared lifeT");
  // Peer pickup at lifeT 30 received at 30.25: window 30..35, world moved by the missed 0.25s of boost.
  S.lifeT = 30.25;
  const dx = lb.mpLaserTake(30);
  assert.strictEqual(S.mpScrollUntil, 35, "peer pickup uses the sender lifeT");
  assert.ok(Math.abs(dx - 100 * 0.28 * 0.25) < 1e-9, "missed boost distance is compensated");
  assert.ok(Math.abs(S.pipes[0].x - (300 - dx)) < 1e-9 && Math.abs(S.items[0].x - (200 - dx)) < 1e-9 && S.items[1].x === 150, "pipes and free items shift, pinned items do not");
  assert.strictEqual(lb.mpLaserTake(30.1), 0, "no extra shift while the window was already running");
  assert.strictEqual(S.mpScrollUntil, 40, "but the window still extends");
  S.mp = false; S.laserOn = true; S.mpScrollUntil = 0;
  assert.strictEqual(lb.laserScroll(), true, "solo keeps the personal laser scroll");
  assert.ok(/if \(S\.mp\) mpLaserScroll\(S\.lifeT\)/.test(game), "local laser pickup opens the shared window");
  assert.ok(/laserTake: mpLaserTake/.test(game), "mp.js gets the laser hook");
  assert.strictEqual((game.match(/laserScroll\(\)\) speed \*= 1\.28|laserScroll\(\) \|\| streakLeft/g) || []).length, 3, "all scroll speed paths use laserScroll()");
  assert.ok(/at: Number\(S\.lifeT\) \|\| 0/.test(mp) && /at: Math\.max\(0, Number\(info\.at\) \|\| 0\)/.test(mp), "take carries the pickup lifeT");

  const msrc = slice(mp, "function takeSid(S, sid)", "function lastWaveBag()") + slice(mp, "function applyTake(data)", "function take(info)");
  const seen = [];
  const PS = { mp: true, items: [{ sid: 7, type: "LASER" }], mpGameN: 2 };
  const mb = { MP: { id: "me", game: { S: PS, laserTake: (at) => seen.push(at), beginCycle: () => {}, endCycle: () => {} } } };
  vm.createContext(mb);
  vm.runInContext(msrc + "; this.applyTake = applyTake;", mb);
  mb.applyTake({ id: "peer", sid: 7, typ: "LASER", at: 12.5, gameN: 2, wave: null });
  assert.deepStrictEqual(seen, [12.5], "peer laser take calls laserTake with the sender lifeT");
  assert.strictEqual(PS.items.length, 0, "taken laser leaves the peer screen");
  mb.applyTake({ id: "peer", sid: 7, typ: "LASER", at: 12.5, gameN: 2 });
  mb.applyTake({ id: "me", sid: 8, typ: "LASER", at: 13, gameN: 2 });
  mb.applyTake({ id: "peer", sid: 9, typ: "LASER", at: 1, gameN: 1 });
  mb.applyTake({ id: "peer", sid: 10, typ: "SWAN", at: 14, gameN: 2 });
  assert.deepStrictEqual(seen, [12.5], "duplicate, own, stale-round and non-laser takes do not boost");
}

console.log("mp-sync tests ok (lobby after ensureMp, join link, startAt, shared waves, laser scroll, i18n)");
