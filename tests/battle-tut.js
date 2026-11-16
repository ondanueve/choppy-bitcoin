"use strict";
// Battle tutorial stays locked until unlockBattleTut(); localStorage keeps it across a fresh S.
const fs = require("fs");
const path = require("path");
const src = fs.readFileSync(path.join(__dirname, "..", "game.js"), "utf8");
const i18nSrc = fs.readFileSync(path.join(__dirname, "..", "i18n.js"), "utf8");

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

function mockStore() {
  const data = Object.create(null);
  return {
    getItem(k) { return Object.prototype.hasOwnProperty.call(data, k) ? data[k] : null; },
    setItem(k, v) { data[k] = String(v); },
    removeItem(k) { delete data[k]; }
  };
}

const code = [
  grab("battleIcos"),
  grab("battleTutInner"),
  grab("markBattleTut"),
  grab("unlockBattleTut"),
  grab("battleTutSeen"),
  grab("tutorialBody")
].join("\n") + "\nreturn {unlockBattleTut, markBattleTut, battleTutSeen, tutorialBody, S};";

const mk = (S, localStorage) => new Function("S", "localStorage", "t", "badgeIco", code)(
  S,
  localStorage,
  (k) => k,
  () => ""
);

let fails = 0;
function check(label, got, want) {
  if (got !== want) { fails++; console.error("FAIL " + label + ": got " + JSON.stringify(got) + " want " + JSON.stringify(want)); }
}

const ls = mockStore();
const a = mk({ bcBattleTut: false }, ls);
check("locked by default", a.battleTutSeen(), false);
check("locked compact body has no battle heading", a.tutorialBody().indexOf("tutBattle") < 0, true);
check("locked more-info body has no battle heading", a.tutorialBody(true).indexOf("tutBattle") < 0, true);
check("locked body has no tutB1 in compact", a.tutorialBody().indexOf("tutB1") < 0, true);
check("locked ls empty", ls.getItem("choppy-battle-tut"), null);

a.unlockBattleTut();
check("unlocked after unlockBattleTut", a.battleTutSeen(), true);
check("ls flag set", ls.getItem("choppy-battle-tut"), "1");
check("unlocked more-info body has battle heading", a.tutorialBody(true).indexOf("tutBattle") >= 0, true);
check("unlocked more-info body has tutB1", a.tutorialBody(true).indexOf("tutB1") >= 0, true);
check("compact body still hides battle", a.tutorialBody().indexOf("tutBattle") < 0, true);

const b = mk({}, ls);
check("fresh S still unlocked via ls", b.battleTutSeen(), true);
check("fresh S hydrates bcBattleTut", b.S.bcBattleTut, true);

a.unlockBattleTut();
check("idempotent ls flag", ls.getItem("choppy-battle-tut"), "1");

check("applyWarCard calls unlock", /if\(card\.id==="blocAssault"\)\{\s*unlockBattleTut\(\);/.test(src), true);
check("startDefense calls unlock", /function startDefense\(\)\{\s*unlockBattleTut\(\);/.test(src), true);
check("opt-btut gated on seen", /battleTutSeen\(\) \? "<button type=\\"button\\" class=\\"cta opt-item\\" id=\\"opt-btut\\">" \+ t\("tutBattle"\)/.test(src), true);
check("btut panel in pauseMarkup", /if \(panel === "btut"\) \{/.test(src) && /t\("tutBattle"\)/.test(src) && /battleTutInner\(true\)/.test(src), true);
check("opt-btut bound", /S\.optPanel = "btut"/.test(src), true);
check("tut option EN label", /\{k:"tut", label:"Battle tutorial", labelEs:"Tutorial de batalla"\}/.test(src), true);
check("unused tut7 gone from game.js", !/\btut7\b/.test(src), true);
check("unused tutHold gone from game.js", !/\btutHold\b/.test(src), true);
check("unused tut7 gone from i18n.js", !/\btut7\b/.test(i18nSrc), true);
check("unused tutHold gone from i18n.js", !/\btutHold\b/.test(i18nSrc), true);

if (fails) process.exit(1);
console.log("battle-tut: ok");
