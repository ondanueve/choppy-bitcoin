"use strict";

const fs = require("fs");
const path = require("path");

const root = path.join(__dirname, "..");

function read(rel) {
  return fs.readFileSync(path.join(root, rel), "utf8");
}

function sliceCatalog(src, startToken) {
  const i = src.indexOf(startToken);
  if (i < 0) throw new Error("missing " + startToken);
  const rest = src.slice(i);
  const m = rest.match(/\n[ \t]*\];/);
  if (!m) throw new Error("missing end of " + startToken);
  return rest.slice(0, m.index);
}

function catalogIds(src, startToken) {
  const ids = [];
  sliceCatalog(src, startToken).split("\n").forEach((line) => {
    const m = line.match(/\bid:\s*"([A-Za-z0-9_]+)"/);
    if (m) ids.push(m[1]);
  });
  return ids;
}

function catalogSecrets(src, startToken) {
  const ids = [];
  sliceCatalog(src, startToken).split("\n").forEach((line) => {
    const m = line.match(/\bid:\s*"([A-Za-z0-9_]+)"/);
    if (m && /secret:\s*true/.test(line)) ids.push(m[1]);
  });
  return ids;
}

function sqlArray(sql, fnName) {
  const re = new RegExp("function public\\." + fnName + "\\(\\)[\\s\\S]*?array\\[([\\s\\S]*?)\\]::text\\[\\]");
  const m = sql.match(re);
  if (!m) throw new Error("missing SQL function " + fnName);
  const ids = [];
  const reId = /'([A-Za-z0-9_]+)'/g;
  let x;
  while ((x = reId.exec(m[1]))) ids.push(x[1]);
  return ids;
}

function same(a, b) {
  if (a.length !== b.length) return false;
  for (let i = 0; i < a.length; i++) if (a[i] !== b[i]) return false;
  return true;
}

function report(label, a, b) {
  const missing = a.filter((id) => b.indexOf(id) < 0);
  const extra = b.filter((id) => a.indexOf(id) < 0);
  console.error(label);
  console.error("  left : " + a.join(" "));
  console.error("  right: " + b.join(" "));
  if (missing.length) console.error("  missing on the right: " + missing.join(" "));
  if (extra.length) console.error("  extra on the right: " + extra.join(" "));
}

const game = read("game.js");
const page = read("u/index.html");
const sql = read("supabase/supabase-awards-guard.sql");
const score = read("supabase/supabase-score-v2.sql");

if (/service_role/i.test(sql + score)) {
  console.error("service_role must not appear in the SQL files");
  process.exit(1);
}

const fromGame = catalogIds(game, "const AWARD_CATALOG = [");
const fromPage = catalogIds(page, "var CATALOG = [");
const fromSql = sqlArray(sql, "award_whitelist");
const secretsGame = catalogSecrets(game, "const AWARD_CATALOG = [");
const secretsPage = catalogSecrets(page, "var CATALOG = [");
const secretsSql = sqlArray(sql, "award_secret_ids");

let failed = false;
if (!same(fromGame, fromPage)) {
  report("game.js AWARD_CATALOG ids differ from u/index.html", fromGame, fromPage);
  failed = true;
}
if (!same(fromGame, fromSql)) {
  report("game.js AWARD_CATALOG ids differ from award_whitelist()", fromGame, fromSql);
  failed = true;
}
if (!same(secretsGame, secretsPage)) {
  report("secret ids differ between game.js and u/index.html", secretsGame, secretsPage);
  failed = true;
}
if (!same(secretsGame, secretsSql)) {
  report("secret ids differ between game.js and award_secret_ids()", secretsGame, secretsSql);
  failed = true;
}

const publicSql = fromSql.filter((id) => secretsSql.indexOf(id) < 0);
const publicGame = fromGame.filter((id) => secretsGame.indexOf(id) < 0);
if (!same(publicGame, publicSql)) {
  report("non-secret ids differ", publicGame, publicSql);
  failed = true;
}

if (failed) process.exit(1);
console.log("ok award ids " + fromGame.length + ", secrets " + secretsGame.length);
