// Deterministic startup-byte budget. Brief 01 did not add tests/smoke.js, so this lives here.
// node docs/perf/check-budget.mjs
import fs from "fs";
import zlib from "zlib";
import path from "path";
import { fileURLToPath } from "url";

const root = path.resolve(path.dirname(fileURLToPath(import.meta.url)), "../..");
const STARTUP = ["nozoom.js", "i18n.js", "supabase-lib.js", "auth.js", "run-stats.js", "audio.js", "game.js"];
const LIMIT = 290000;

let total = 0;
for (const name of STARTUP) {
  const raw = fs.readFileSync(path.join(root, name));
  const gz = zlib.gzipSync(raw, { level: 9 }).length;
  total += gz;
  console.log(name + " gzip " + gz);
}
console.log("startup_js_gzip " + total + " limit " + LIMIT);
if (total > LIMIT) {
  console.error("over budget");
  process.exit(1);
}
