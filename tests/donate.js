#!/usr/bin/env node
"use strict";

const fs = require("fs");
const path = require("path");
const vm = require("vm");
const assert = require("assert");

const ROOT = path.resolve(__dirname, "..");
const src = fs.readFileSync(path.join(ROOT, "donate-config.js"), "utf8");
const game = fs.readFileSync(path.join(ROOT, "game.js"), "utf8");
const about = fs.readFileSync(path.join(ROOT, "about/index.html"), "utf8");

function load() {
  const ctx = { console };
  vm.createContext(ctx);
  vm.runInContext(src, ctx);
  return ctx;
}

const cfg = load();
assert.strictEqual(cfg.CHOPPY_LIGHTNING_ADDRESS, "", "Lightning Address stays empty until the owner sets one");
assert.ok(!cfg.choppyLightningHref(), "empty Lightning Address hides the Lightning button");
assert.ok(cfg.choppyBitcoinHref().indexOf("bitcoin:bc1q") === 0, "on-chain Bitcoin link stays");
assert.strictEqual(cfg.choppyDonateLinksHtml().indexOf("Lightning"), -1, "empty address: no Lightning markup");
assert.ok(cfg.choppyDonateLinksHtml().indexOf("bitcoin:") !== -1, "Bitcoin markup remains");

cfg.CHOPPY_LIGHTNING_ADDRESS = "player@example.com";
assert.strictEqual(cfg.choppyLightningHref(), "lightning:player@example.com");
assert.ok(cfg.choppyDonateLinksHtml().indexOf("lightning:player@example.com") !== -1);
assert.ok(cfg.choppyDonateLinksHtml().indexOf("Lightning") !== -1);

cfg.CHOPPY_LIGHTNING_ADDRESS = "not-an-address";
assert.strictEqual(cfg.choppyLightningHref(), "", "invalid value is hidden, never invented");

cfg.CHOPPY_LIGHTNING_ADDRESS = "lnurl1qpzry9x8gf2tvdw0s3jn54khce6mua7l";
assert.ok(cfg.choppyLightningHref().indexOf("lightning:lnurl1") === 0, "LNURL is accepted");

const invoice = "lnbc1p4tdeq9pp5v39yyvsws5swurns2gpmj64m469548f64t2cqjsfyka574fj0dasdqqcqzzgxqyz5vqrzjqf0wu22xsefd8gzu0m9n93g2khea86l6yy26en9v46g9e6hk7v9z8lytgux50yx2zuqqqqryqqqqthqqpyrzjqfwdd2w9y5ra5z3m4qetfa5ccu6432xfuvk6zrvg9vxwltvukd48dlytgux50yx2zuqqqqryqqqqthqqpysp5zc5j4qd90hqxklpcy4skg9rfl5aypv9rsmrypjdt62td8869kx0s9qrsgq43tqd4ujehpvccxw5rzkk8z74mk7sdhgga3tqtk3uwvtlj3tl3s3yhrv5vy5x8t6x2zfursvw7z82rqu4fmuttaj57ukyspx35np6zgq6tutga";
assert.ok(src.indexOf(invoice) < 0, "donate-config does not ship the expired invoice");
assert.ok(game.indexOf(invoice) < 0, "game.js does not ship the expired invoice");
assert.ok(about.indexOf(invoice) < 0, "about page does not ship the expired invoice");
assert.ok(about.indexOf("lnbc") < 0, "about page has no BOLT11 invoice");

const donateFn = game.match(/function donateBlock\(\) \{[\s\S]*?\n  \}/);
assert.ok(donateFn, "donateBlock exists");
assert.ok(donateFn[0].indexOf("choppyDonateLinksHtml") !== -1, "donateBlock reads the shared helper");
assert.ok(donateFn[0].indexOf("lnbc") < 0, "donateBlock has no hardcoded invoice");

const readyStart = game.indexOf('overlay.innerHTML = "<h1>Choppy Bitcoin</h1>"');
const readyEnd = game.indexOf('if (window.refreshLeaderboard)', readyStart);
assert.ok(readyStart >= 0 && readyEnd > readyStart, "title screen markup found");
assert.ok(game.slice(readyStart, readyEnd).indexOf("donateBlock") < 0, "donate block is not on the title screen");
assert.ok(((game.match(/donateBlock\(\)/g) || []).length) >= 3, "donateBlock is called on the end screens");
assert.ok(/else if \(p === "over"\)[\s\S]{0,4000}donateBlock\(\)/.test(game), "donate block is on the rekt screen");
assert.ok(/p === "win" && S\.stats[\s\S]{0,3000}donateBlock\(\)/.test(game), "donate block is on the win screen");

assert.ok(/donate-config\.js\?v=mp\d+/.test(fs.readFileSync(path.join(ROOT, "index.html"), "utf8")));
assert.ok(/donate-config\.js\?v=mp\d+/.test(about));

console.log("donate tests ok");
