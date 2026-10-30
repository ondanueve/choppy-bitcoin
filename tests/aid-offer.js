"use strict";
// Military aid (San Arnaldo) is offered after a lost battle only when the player can pay it.
const fs = require("fs");
const path = require("path");
const src = fs.readFileSync(path.join(__dirname, "..", "game.js"), "utf8");

function grab(name) {
  const i = src.indexOf("function " + name + "(");
  if (i < 0) throw new Error("missing " + name);
  let d = 0, j = src.indexOf("{", i);
  for (let k = j; k < src.length; k++) {
    if (src[k] === "{") d++;
    else if (src[k] === "}" && --d === 0) return src.slice(i, k + 1);
  }
  throw new Error("unbalanced " + name);
}
const aidCosts = src.match(/const AID_COSTS=\[[^\]]*\];/)[0];
const code = aidCosts + [grab("aidOffer"), grab("aidReach"), grab("aidAffordable")].join("\n") +
  "\nreturn {aidAffordable, aidOffer, aidReach, S};";
const mk = (S) => new Function("S", "clampPx", code)(S, (p) => Math.max(1, Number(p) || 1));

let fails = 0;
function check(label, got, want) {
  if (got !== want) { fails++; console.error("FAIL " + label + ": got " + got + " want " + want); }
}
// First offer costs 2.1 BTC
check("broke", mk({ btc: 0, cash: 0, price: 100000, bcAidUsed: 0 }).aidAffordable(), false);
check("1 btc only", mk({ btc: 1, cash: 0, price: 100000, bcAidUsed: 0 }).aidAffordable(), false);
check("btc exact", mk({ btc: 2.1, cash: 0, price: 100000, bcAidUsed: 0 }).aidAffordable(), true);
check("btc + cash tops up", mk({ btc: 1, cash: 110000, price: 100000, bcAidUsed: 0 }).aidAffordable(), true);
check("cash short", mk({ btc: 1, cash: 100000, price: 100000, bcAidUsed: 0 }).aidAffordable(), false);
check("second offer 21", mk({ btc: 5, cash: 0, price: 100000, bcAidUsed: 1 }).aidAffordable(), false);
check("second offer ok", mk({ btc: 21, cash: 0, price: 100000, bcAidUsed: 1 }).aidAffordable(), true);
check("exhausted", mk({ btc: 9999, cash: 0, price: 100000, bcAidUsed: 3 }).aidAffordable(), false);
// The defeat screen must be gated on affordability (no raw aidOffer() gate, no disabled accept button).
check("render gated", /if \(S\.trainBattleLose && aidAffordable\(\)\)/.test(src), true);
check("no disabled accept", /id=\\"aid-yes\\"" \+ \(ok/.test(src), false);
if (fails) process.exit(1);
console.log("aid-offer: ok");
