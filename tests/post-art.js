"use strict";
// Outcome art lookup: postArtKey(id, opt, variant) falls back "<opt>-<variant>" -> "<variant>" -> "<opt>" -> "" (card art).
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
const code = [grab("postArtKeys"), grab("postArtKey")].join("\n") + "\nreturn postArtKey;";
const mk = (POST_ART, POST_ART_MISS) => new Function("POST_ART", "POST_ART_MISS", code)(POST_ART, POST_ART_MISS || new Set());

let fails = 0;
function check(label, got, want) {
  if (got !== want) { fails++; console.error("FAIL " + label + ": got " + JSON.stringify(got) + " want " + JSON.stringify(want)); }
}
const k = mk({
  old: "abc",
  casino: ["win", "lose", "c"],
  landfill: ["a-nokia", "a-nothing", "c"],
  uncle2: ["a", "b-win"],
  chess: ["win", "miss"]
});
check("letters", k("old", "b", ""), "b");
check("letters unknown opt", k("old", "z", ""), "");
check("letters ignore variant", k("old", "a", "win"), "a");
check("variant only, small bet", k("casino", "a", "win"), "win");
check("variant only, big bet", k("casino", "b", "lose"), "lose");
check("single outcome", k("casino", "c", ""), "c");
check("opt+variant", k("landfill", "a", "nokia"), "a-nokia");
check("opt+variant, other opt has no art", k("landfill", "b", "nokia"), "");
check("jackpot has no art", k("landfill", "a", "jackpot"), "");
check("opt falls back from unknown variant", k("uncle2", "a", "x"), "a");
check("chess ignores the typed move", k("chess", "move:Qh7", "win"), "win");
check("chess miss", k("chess", "move:", "miss"), "miss");
check("chess without variant", k("chess", "move:Qh7", ""), "");
check("unknown card", k("nope", "a", "win"), "");
check("missed file is skipped", mk({ casino: ["win", "lose"] }, new Set(["casino-win"]))("casino", "a", "win"), "");
// Wiring: random branches must set S.chanceVar, and the result screen must pass it on.
check("result screen passes the variant", /postArtHtml\(card\.id, S\.chanceOpt, S\.chanceVar\)/.test(src), true);
for (const id of ["casino", "poker", "startup", "cousin", "usedcar", "landfill", "chess"]) {
  const at = src.indexOf('card.id === "' + id + '") {', src.indexOf("function resolveChance("));
  check("resolveChance sets a variant for " + id, at > 0 && /S\.chanceVar = /.test(src.slice(at, at + 2600)), true);
}
if (fails) process.exit(1);
console.log("post-art: ok");
