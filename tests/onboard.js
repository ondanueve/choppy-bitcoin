#!/usr/bin/env node
"use strict";
const fs = require("fs");
const path = require("path");
const assert = require("assert");

const ROOT = path.resolve(__dirname, "..");
const game = fs.readFileSync(path.join(ROOT, "game.js"), "utf8");
const i18n = fs.readFileSync(path.join(ROOT, "i18n.js"), "utf8");
const extra = fs.readFileSync(path.join(ROOT, "i18n-extra.js"), "utf8");
const index = fs.readFileSync(path.join(ROOT, "index.html"), "utf8");
const about = fs.readFileSync(path.join(ROOT, "about/index.html"), "utf8");

assert.ok(/data-i18n="ranked"/.test(index));
assert.ok(/id=\\"go\\"/.test(game) && /t\("ranked"\)/.test(game));
assert.ok(!/go-practice/.test(game));
assert.ok(!/practiceNote/.test(game) && !/practiceNote/.test(i18n));
assert.ok(!/Candle of the day|Today's candle|Vela del d[ií]a/i.test(game + i18n + extra + index + about));
assert.ok(/shouldShowOnboard/.test(game) && /choppy-onboard/.test(game));
assert.ok(/pendingChallenge/.test(game.match(/function shouldShowOnboard\(\) \{[\s\S]*?\n  \}/)[0]), "?seed= challenge skips first-run overlay");
assert.ok(/tut-skip/.test(game) && /tutSkip/.test(i18n));
assert.ok(i18n.indexOf('tut1: "Tap or press Space') !== -1);
assert.ok(i18n.indexOf("Buy BTC with") !== -1);
assert.ok(i18n.indexOf("A bull pumps the price") !== -1);
assert.ok(i18n.indexOf("Toca o aprieta Espacio") !== -1);
assert.ok(i18n.indexOf("Compra BTC con") !== -1);
assert.ok(!/vosotros|\bpodés\b|\btenés\b|\bquerés\b/.test(i18n));
// No goal/objective copy in the short tips
["tut1", "tut2", "tut3a", "tut3b"].forEach(function (k) {
  const re = new RegExp(k + ': "([^"]*)"');
  const en = i18n.match(new RegExp(k + ': "([^"]*)"'));
  const es = i18n.split("es: {")[1].match(new RegExp(k + ': "([^"]*)"'));
  assert.ok(en && es, k + " in both langs");
  const blob = (en[1] + " " + es[1]).toLowerCase();
  assert.ok(!/finish with more|termina la partida con más|that's your score|ese es tu puntaje/.test(blob), k + " has no goal text");
});
assert.ok(/choppy-battle-onboard/.test(game));
assert.ok(/battleOnboardHtml/.test(game) && /bindBattleOnboard/.test(game));
assert.ok(/!battleOnboardSeen\(\)/.test(game), "first blocAssault auto-opens the mini tutorial");
assert.ok(i18n.indexOf("The stick moves you; the right side") !== -1);
assert.ok(i18n.indexOf("La palanca te mueve; el lado derecho") !== -1);
assert.ok(!/daily-pack/.test(fs.readFileSync(path.join(ROOT, ".github/workflows/ci.yml"), "utf8")));
assert.ok(!fs.existsSync(path.join(ROOT, ".github/workflows/daily-pack.yml")));
assert.ok(!fs.existsSync(path.join(ROOT, "tools/daily-pack.mjs")));
assert.ok(!fs.existsSync(path.join(ROOT, "daily-pack")));
console.log("onboard tests ok");
