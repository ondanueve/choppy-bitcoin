#!/usr/bin/env node
"use strict";

// Local safety net for the static site. No npm dependencies and no network.
// Run from anywhere: node tests/smoke.js
// Finish line: under 10 seconds on a clean tree.

const fs = require("fs");
const os = require("os");
const path = require("path");
const vm = require("vm");
const { spawnSync } = require("child_process");

const ROOT = path.resolve(__dirname, "..");
const PUBLISHED_JS = [
  "game.js",
  "audio.js",
  "mp.js",
  "auth.js",
  "supabase-lib.js",
  "run-stats.js",
  "i18n.js",
  "nozoom.js"
];
const HTML_WITH_INLINE = [
  "index.html",
  "u/index.html",
  "about/index.html",
  "profile/index.html",
  "chart.html"
];
const TEXT_EXT = new Set([
  ".js", ".mjs", ".cjs", ".html", ".css", ".md", ".sql", ".svg",
  ".json", ".webmanifest", ".txt", ".yml", ".yaml", ".xml", ".toml"
]);
// The detector lists these patterns on purpose. Scanning this file would
// match the list itself.
// The i18n audit, its report and docs/i18n.md list the same filler and voseo patterns this file checks for.
const SKIP_CONTENT_SCAN = new Set(["tests/smoke.js", "tools/i18n-audit.js", "tests/out/i18n-report.md", "docs/i18n.md"]);

// Scripts that ship today without a cache-bust query. Presence is allowed
// on an unchanged tree. A byte change versus origin/main still fails,
// because there is no bumped tag to point at.
const LEGACY_UNVERSIONED = new Set(["supabase-lib.js", "run-stats.js"]);

const fails = [];
const notes = [];

function fail(msg) {
  fails.push(String(msg));
}

function note(msg) {
  notes.push(String(msg));
}

function relPosix(p) {
  return p.split(path.sep).join("/");
}

function readText(rel) {
  return fs.readFileSync(path.join(ROOT, rel), "utf8");
}

function git(args, opts) {
  return spawnSync("git", args, Object.assign({ cwd: ROOT, maxBuffer: 20 * 1024 * 1024 }, opts));
}

function hasOriginMain() {
  const r = git(["rev-parse", "--verify", "--quiet", "origin/main"], { encoding: "utf8" });
  return r.status === 0;
}

function gitShow(spec) {
  const r = git(["show", spec]);
  if (r.error || r.status !== 0) return null;
  return r.stdout;
}

function listRepoFiles() {
  const r = git(["ls-files", "-co", "--exclude-standard", "-z"]);
  if (r.status === 0 && r.stdout) {
    return r.stdout.toString("utf8").split("\0").filter(Boolean).map(relPosix);
  }
  const out = [];
  function walk(dir, prefix) {
    for (const ent of fs.readdirSync(dir, { withFileTypes: true })) {
      if (ent.name === ".git" || ent.name === "node_modules" || ent.name === "PR.md") continue;
      if (ent.name === "out" && prefix === "tests") continue;
      const rel = prefix ? prefix + "/" + ent.name : ent.name;
      const abs = path.join(dir, ent.name);
      if (ent.isDirectory()) walk(abs, rel);
      else if (ent.isFile()) out.push(rel);
    }
  }
  walk(ROOT, "");
  return out;
}

function isTextFile(rel) {
  const base = path.basename(rel);
  if (base === ".gitignore" || base === "LICENSE" || base === "AGENTS.md" || base === "README.md") return true;
  return TEXT_EXT.has(path.extname(base).toLowerCase());
}

function balanced(src, openIdx, openCh, closeCh) {
  let depth = 0;
  let inStr = null;
  let esc = false;
  for (let i = openIdx; i < src.length; i++) {
    const c = src[i];
    if (inStr) {
      if (esc) { esc = false; continue; }
      if (c === "\\") { esc = true; continue; }
      if (c === inStr) inStr = null;
      continue;
    }
    if (c === '"' || c === "'" || c === "`") { inStr = c; continue; }
    if (c === openCh) depth++;
    else if (c === closeCh) {
      depth--;
      if (depth === 0) return src.slice(openIdx, i + 1);
    }
  }
  return null;
}

function extractAfter(src, marker, openCh, closeCh) {
  const at = src.indexOf(marker);
  if (at < 0) return null;
  const open = src.indexOf(openCh, at);
  if (open < 0) return null;
  return balanced(src, open, openCh, closeCh);
}

function evalExpr(expr, label) {
  try {
    return vm.runInNewContext("(" + expr + ")", Object.create(null), { timeout: 2000 });
  } catch (e) {
    fail("parse: could not evaluate " + label + ": " + (e && e.message ? e.message : e));
    return null;
  }
}

function quotedStrings(body) {
  const out = [];
  const re = /"((?:\\.|[^"\\])*)"|'((?:\\.|[^'\\])*)'/g;
  let m;
  while ((m = re.exec(body))) out.push(m[1] != null ? m[1] : m[2]);
  return out;
}

function objectKeys(body) {
  const keys = [];
  const re = /(?:"([^"]+)"|'([^']+)'|([A-Za-z_$][\w$-]*))\s*:/g;
  let m;
  while ((m = re.exec(body))) keys.push(m[1] || m[2] || m[3]);
  return keys;
}

function lineOf(text, index) {
  let n = 1;
  for (let i = 0; i < index && i < text.length; i++) if (text[i] === "\n") n++;
  return n;
}

function checkSyntaxFiles() {
  let inline = 0;
  for (const rel of PUBLISHED_JS) {
    const abs = path.join(ROOT, rel);
    if (!fs.existsSync(abs)) {
      fail("syntax: missing published script " + rel);
      continue;
    }
    const r = spawnSync(process.execPath, ["--check", abs], { encoding: "utf8", timeout: 30000 });
    if (r.status !== 0) {
      fail("syntax: " + rel + "\n" + (r.stderr || r.stdout || "node --check failed").trim());
    }
  }
  for (const rel of HTML_WITH_INLINE) {
    const abs = path.join(ROOT, rel);
    if (!fs.existsSync(abs)) {
      fail("syntax: missing " + rel);
      continue;
    }
    const html = fs.readFileSync(abs, "utf8");
    const re = /<script\b([^>]*)>([\s\S]*?)<\/script>/gi;
    let m;
    let n = 0;
    while ((m = re.exec(html))) {
      const attrs = m[1] || "";
      const body = m[2] || "";
      if (/\bsrc\s*=/i.test(attrs)) continue;
      const typeMatch = attrs.match(/\btype\s*=\s*["']([^"']+)["']/i);
      if (typeMatch) {
        const t = typeMatch[1].toLowerCase();
        if (t !== "text/javascript" && t !== "application/javascript" && t !== "module") continue;
      }
      if (!body.trim()) continue;
      n += 1;
      inline += 1;
      const tmp = path.join(os.tmpdir(), "choppy-smoke-" + rel.replace(/[^\w.]+/g, "_") + "-" + n + ".js");
      fs.writeFileSync(tmp, body);
      try {
        const r = spawnSync(process.execPath, ["--check", tmp], { encoding: "utf8", timeout: 30000 });
        if (r.status !== 0) {
          const msg = (r.stderr || r.stdout || "node --check failed").split(tmp).join(rel + " inline script " + n);
          fail("syntax: " + rel + " inline script " + n + "\n" + msg.trim());
        }
      } finally {
        fs.unlinkSync(tmp);
      }
    }
  }
  if (!fails.length) note("syntax: ok (" + PUBLISHED_JS.length + " scripts, " + inline + " inline)");
}

// Patterns live in this file. tests/smoke.js is not scanned (see SKIP_CONTENT_SCAN).
const FILLER_PATTERNS = [
  { name: "PLACEHOLDER", re: /placeholder/gi },
  { name: "TODO_REPLACE", re: /todo_replace/gi },
  { name: "lorem ipsum", re: /lorem ipsum/gi },
  { name: "insert here", re: /insert here/gi },
  { name: "{{...}}", re: /\{\{[^{}\n]*\}\}/g },
  { name: "// ... rest of", re: /\/\/[^\n]*(?:\.\.\.\s*rest of|resto del c[oó]digo)/gi }
];

// Justified exceptions. Each one names a real hit that is not filler.
const FILLER_EXCEPTIONS = [
  {
    id: "html-placeholder-attribute",
    reason: "HTML placeholder attribute: hint text on an input, not a filler marker.",
    allow(rel, line, patternName, index, length) {
      if (patternName !== "PLACEHOLDER") return false;
      return /^\s*\\*=/.test(line.slice(index + length));
    }
  },
  {
    id: "docs-removed-wording",
    reason: "docs/arc-card-copy-polish.md records that old filler wording was removed.",
    allow(rel, line, patternName) {
      return patternName === "PLACEHOLDER"
        && rel === "docs/arc-card-copy-polish.md"
        && /removed placeholder wording/i.test(line);
    }
  }
];

function exceptionAllows(rel, line, patternName, index, length) {
  return FILLER_EXCEPTIONS.some((ex) => ex.allow(rel, line, patternName, index, length));
}

function checkFiller(files) {
  let scanned = 0;
  for (const rel of files) {
    if (SKIP_CONTENT_SCAN.has(rel) || !isTextFile(rel)) continue;
    const text = readText(rel);
    scanned += 1;
    const lines = text.split(/\n/);
    for (let i = 0; i < lines.length; i++) {
      const line = lines[i];
      for (const pat of FILLER_PATTERNS) {
        pat.re.lastIndex = 0;
        let m;
        while ((m = pat.re.exec(line))) {
          if (exceptionAllows(rel, line, pat.name, m.index, m[0].length)) continue;
          const snippet = line.trim().slice(0, 140);
          fail("filler: " + rel + ":" + (i + 1) + " matches " + pat.name + ": " + snippet);
          break;
        }
      }
    }
    const block = /\/\*[\s\S]*?\*\//g;
    let m;
    while ((m = block.exec(text))) {
      const inner = m[0].slice(2, -2);
      if (/^[\s.…]*$/.test(inner)) {
        fail("filler: " + rel + ":" + lineOf(text, m.index) + " matches empty block comment");
      }
    }
  }
  if (!fails.some((f) => f.startsWith("filler:"))) note("filler: ok (" + scanned + " text files)");
}

// Built by concatenation so the joined names never appear in this file.
const FORBIDDEN_NAMES = [
  { label: "food-chain name", re: new RegExp("Mc" + "Donald", "gi") },
  { label: "watch-brand name", re: new RegExp("Tim" + "ex", "gi") }
];

function checkForbiddenNames(files) {
  let scanned = 0;
  for (const rel of files) {
    if (!isTextFile(rel)) continue;
    const text = readText(rel);
    scanned += 1;
    const lines = text.split(/\n/);
    for (const item of FORBIDDEN_NAMES) {
      for (let i = 0; i < lines.length; i++) {
        item.re.lastIndex = 0;
        if (item.re.test(lines[i])) {
          // Line text is omitted: it would reprint the forbidden name.
          fail("names: " + rel + ":" + (i + 1) + " matches the forbidden " + item.label);
        }
      }
    }
  }
  if (!fails.some((f) => f.startsWith("names:"))) note("names: ok (" + scanned + " text files)");
}

function checkSize() {
  if (!hasOriginMain()) {
    note("size: skipped (origin/main is not available)");
    return;
  }
  const parts = [];
  for (const rel of ["game.js", "style.css"]) {
    const base = gitShow("origin/main:" + rel);
    if (!base) {
      note("size: skipped " + rel + " (missing on origin/main)");
      continue;
    }
    const cur = fs.readFileSync(path.join(ROOT, rel));
    const ratio = (cur.length - base.length) / base.length;
    const pct = (ratio * 100).toFixed(1);
    parts.push(rel + " " + cur.length + " vs " + base.length + " (" + (ratio >= 0 ? "+" : "") + pct + "%)");
    if (ratio < -0.05 || ratio > 0.15) {
      if (process.env.ALLOW_SIZE_CHANGE === "1") {
        note("size: " + rel + " changed " + pct + "% and ALLOW_SIZE_CHANGE=1 is set");
      } else {
        fail("size: " + rel + " is " + cur.length + " bytes vs origin/main " + base.length + " bytes (" + pct + "%). Allowed range is -5% to +15%. Set ALLOW_SIZE_CHANGE=1 to override.");
      }
    }
  }
  if (!fails.some((f) => f.startsWith("size:"))) note("size: ok (" + parts.join("; ") + ")");
}

function isRemoteUrl(url) {
  return /^(?:[a-z][a-z0-9+.-]*:)?\/\//i.test(url);
}

function localAssetPath(url) {
  const clean = url.split("#")[0].split("?")[0];
  let p = clean;
  if (p.startsWith("/choppy-bitcoin/")) p = p.slice("/choppy-bitcoin/".length);
  else if (p.startsWith("/")) p = p.slice(1);
  return p;
}

function versionOf(url) {
  const q = url.split("#")[0].split("?")[1] || "";
  if (!q) return null;
  return new URLSearchParams(q).get("v");
}

function isBrandAsset(assetPath) {
  return /^(?:favicon(?:-\d+)?\.(?:png|ico|svg)|apple-touch-icon\.png|site\.webmanifest)$/.test(assetPath);
}

function parseAssetTags(html) {
  const tags = [];
  const re = /<(script|link)\b([^>]*)>/gi;
  let m;
  while ((m = re.exec(html))) {
    const kind = m[1].toLowerCase();
    const attrs = m[2];
    const attr = kind === "script" ? "src" : "href";
    const um = attrs.match(new RegExp("\\b" + attr + "\\s*=\\s*([\"'])(.*?)\\1", "i"));
    if (!um) continue;
    const url = um[2].trim();
    if (!url || isRemoteUrl(url)) continue;
    tags.push({
      kind: kind,
      url: url,
      path: localAssetPath(url),
      version: versionOf(url),
      line: lineOf(html, m.index)
    });
  }
  return tags;
}

function checkVersions() {
  const html = readText("index.html");
  const tags = parseAssetTags(html);
  let tagged = 0;
  const legacy = [];
  const brand = [];
  for (const tag of tags) {
    const okVersion = tag.version != null && /^mp\d+$/.test(tag.version);
    if (okVersion) {
      tagged += 1;
      if (!fs.existsSync(path.join(ROOT, tag.path))) {
        fail("version: index.html:" + tag.line + " points at " + tag.path + " which is not on disk");
      }
      continue;
    }
    if (LEGACY_UNVERSIONED.has(tag.path)) {
      legacy.push(tag.path);
      continue;
    }
    if (isBrandAsset(tag.path)) {
      brand.push(tag.path);
      continue;
    }
    const got = tag.version == null ? "no ?v= query" : "?v=" + tag.version;
    fail("version: index.html:" + tag.line + " " + tag.kind + " " + tag.path + " has " + got + "; expected ?v=mpNNN");
  }

  if (!hasOriginMain()) {
    note("version: " + tagged + " tagged mpNNN; staleness skipped (origin/main is not available)");
    if (legacy.length) note("version: legacy unversioned scripts: " + legacy.join(", "));
    return;
  }
  const baseHtmlBuf = gitShow("origin/main:index.html");
  if (!baseHtmlBuf) {
    note("version: staleness skipped (origin/main:index.html unreadable)");
    return;
  }
  const baseTags = parseAssetTags(baseHtmlBuf.toString("utf8"));
  const baseByPath = new Map();
  for (const t of baseTags) baseByPath.set(t.path, t);
  for (const tag of tags) {
    if (!tag.path.endsWith(".js") && !tag.path.endsWith(".css")) continue;
    const baseFile = gitShow("origin/main:" + tag.path);
    const abs = path.join(ROOT, tag.path);
    if (!fs.existsSync(abs)) continue;
    const cur = fs.readFileSync(abs);
    if (baseFile && cur.equals(baseFile)) continue;
    const baseTag = baseByPath.get(tag.path);
    const baseV = baseTag ? baseTag.version : null;
    if (tag.version === baseV) {
      const shown = tag.version == null ? "(no ?v= tag)" : "?v=" + tag.version;
      fail("version: " + tag.path + " changed vs origin/main but index.html still has " + shown);
    }
  }
  if (!fails.some((f) => f.startsWith("version:"))) {
    note("version: ok (" + tagged + " tagged ?v=mpNNN"
      + (legacy.length ? "; legacy unversioned: " + legacy.join(", ") : "")
      + (brand.length ? "; " + brand.length + " brand links without a cache-bust" : "")
      + ")");
  }
}

const SOF = new Set([0xC0, 0xC1, 0xC2, 0xC3, 0xC5, 0xC6, 0xC7, 0xC9, 0xCA, 0xCB, 0xCD, 0xCE, 0xCF]);

function jpegSize(buf) {
  if (buf.length < 4 || buf[0] !== 0xFF || buf[1] !== 0xD8) return null;
  let i = 2;
  while (i < buf.length - 8) {
    if (buf[i] !== 0xFF) return null;
    while (i < buf.length && buf[i] === 0xFF) i++;
    if (i >= buf.length) return null;
    const marker = buf[i++];
    if (marker === 0xD9) break;
    if (marker === 0x00 || (marker >= 0xD0 && marker <= 0xD7)) continue;
    if (i + 2 > buf.length) return null;
    const len = buf.readUInt16BE(i);
    if (len < 2) return null;
    if (SOF.has(marker)) {
      if (i + 7 > buf.length) return null;
      return { h: buf.readUInt16BE(i + 3), w: buf.readUInt16BE(i + 5) };
    }
    i += len;
  }
  return null;
}

function jpegSizeFile(abs) {
  const fd = fs.openSync(abs, "r");
  try {
    const stat = fs.fstatSync(fd);
    const chunk = Buffer.alloc(Math.min(stat.size, 512 * 1024));
    fs.readSync(fd, chunk, 0, chunk.length, 0);
    let size = jpegSize(chunk);
    if (!size && stat.size > chunk.length) {
      const all = Buffer.alloc(stat.size);
      fs.readSync(fd, all, 0, stat.size, 0);
      size = jpegSize(all);
    }
    if (size) return size;
  } finally {
    fs.closeSync(fd);
  }
  const fileBin = spawnSync("file", ["-b", abs], { encoding: "utf8", timeout: 5000 });
  if (fileBin.status === 0) {
    const m = String(fileBin.stdout || "").match(/(\d+)\s*x\s*(\d+)/);
    if (m) return { w: Number(m[1]), h: Number(m[2]) };
  }
  return null;
}

function walkFiles(relDir) {
  const abs = path.join(ROOT, relDir);
  if (!fs.existsSync(abs)) return [];
  const out = [];
  function walk(dir) {
    for (const ent of fs.readdirSync(dir, { withFileTypes: true })) {
      const p = path.join(dir, ent.name);
      if (ent.isDirectory()) walk(p);
      else if (ent.isFile()) out.push(p);
    }
  }
  const st = fs.statSync(abs);
  if (st.isFile()) out.push(abs);
  else if (st.isDirectory()) walk(abs);
  return out;
}

function checkImages() {
  const game = readText("game.js");
  const refs = new Set();
  const roots = [path.join(ROOT, "game.js"), path.join(ROOT, "index.html")].concat(walkFiles("u"), walkFiles("about"));
  const imgRe = /chance\/([A-Za-z0-9_.-]+\.(?:jpg|png|svg))(?![A-Za-z0-9_])/g;
  for (const abs of roots) {
    const text = abs === path.join(ROOT, "game.js") ? game : fs.readFileSync(abs, "utf8");
    imgRe.lastIndex = 0;
    let m;
    while ((m = imgRe.exec(text))) refs.add("chance/" + m[1]);
  }

  function takeSet(marker) {
    const body = extractAfter(game, marker, "[", "]");
    if (body == null) {
      fail("images: could not find " + marker + " in game.js");
      return [];
    }
    const ids = quotedStrings(body);
    if (body.indexOf('"') >= 0 && ids.length === 0) {
      fail("images: " + marker + " has quotes but no ids were parsed");
    }
    return ids;
  }
  function takeKeys(marker) {
    const body = extractAfter(game, marker, "{", "}");
    if (body == null) {
      fail("images: could not find " + marker + " in game.js");
      return [];
    }
    const keys = objectKeys(body);
    if (keys.length === 0) fail("images: " + marker + " parsed no keys");
    return keys;
  }

  for (const id of takeSet("const WIDE_ART_JPG")) refs.add("chance/" + id + "-wide.jpg");
  for (const id of takeSet("const WIDE_ART_PNG")) refs.add("chance/" + id + "-wide.png");
  for (const slug of takeKeys("const CHESS_ART_VER")) refs.add("chance/chess-" + slug + "-wide.jpg");
  for (const key of takeKeys("const POST_ART_VER")) refs.add("chance/" + key + "-wide.jpg");
  // Post-decision (outcome) art: every key listed in POST_ART must exist on disk, and every POST_ART_VER key must be a listed one.
  {
    const body = extractAfter(game, "const POST_ART =", "{", "}");
    const postKeys = new Set();
    if (body == null) fail("images: could not find const POST_ART in game.js");
    else {
      const table = evalExpr("{" + body.slice(1, -1) + "}", "POST_ART");
      if (table) {
        for (const id of Object.keys(table)) {
          const list = Array.isArray(table[id]) ? table[id] : String(table[id]).split("");
          if (!list.length) fail("images: POST_ART." + id + " is empty");
          if (new Set(list).size !== list.length) fail("images: POST_ART." + id + " has duplicate keys");
          for (const k of list) {
            postKeys.add(id + "-" + k);
            refs.add("chance/" + id + "-" + k + "-wide.jpg");
          }
        }
      }
    }
    for (const key of takeKeys("const POST_ART_VER")) {
      if (postKeys.size && !postKeys.has(key)) fail("images: POST_ART_VER." + key + " has no matching POST_ART entry");
    }
  }

  let missing = 0;
  for (const ref of refs) {
    if (!fs.existsSync(path.join(ROOT, ref))) {
      missing += 1;
      fail("images: referenced " + ref + " is not on disk");
    }
  }

  const chanceDir = path.join(ROOT, "chance");
  let wide = 0;
  if (!fs.existsSync(chanceDir)) {
    fail("images: chance/ directory is missing");
  } else {
    for (const name of fs.readdirSync(chanceDir)) {
      if (!name.endsWith("-wide.jpg")) continue;
      wide += 1;
      const abs = path.join(chanceDir, name);
      const size = jpegSizeFile(abs);
      if (!size) {
        fail("images: chance/" + name + " is not a readable JPEG");
      } else if (size.w !== 1920 || size.h !== 800) {
        fail("images: chance/" + name + " is " + size.w + "x" + size.h + "; expected 1920x800");
      }
    }
  }
  if (!missing && !fails.some((f) => f.startsWith("images:"))) {
    note("images: ok (" + refs.size + " referenced paths, " + wide + " wide jpg at 1920x800)");
  }
}

function checkI18n() {
  const src = readText("i18n.js");
  const body = extractAfter(src, "const dict", "{", "}");
  if (!body) {
    fail("i18n: could not find const dict in i18n.js");
    return;
  }
  const dict = evalExpr(body, "i18n dict");
  if (!dict || !dict.en || !dict.es) {
    fail("i18n: dict.en or dict.es is missing");
    return;
  }
  const en = Object.keys(dict.en);
  const es = Object.keys(dict.es);
  const esSet = new Set(es);
  const enSet = new Set(en);
  const onlyEn = en.filter((k) => !esSet.has(k));
  const onlyEs = es.filter((k) => !enSet.has(k));
  if (onlyEn.length) fail("i18n: dict.es is missing " + onlyEn.length + " key(s) present in dict.en: " + onlyEn.slice(0, 12).join(", "));
  if (onlyEs.length) fail("i18n: dict.en is missing " + onlyEs.length + " key(s) present in dict.es: " + onlyEs.slice(0, 12).join(", "));
  if (!onlyEn.length && !onlyEs.length) note("i18n: ok (" + en.length + " keys match)");
}

// nocoiner is a loanword spelled the same in both languages.
const LOANWORD_NAME = new Set(["nocoiner"]);

function checkAwardFields(list, where) {
  const seen = new Set();
  for (const a of list) {
    const id = a && a.id != null ? String(a.id).trim() : "";
    if (!id) {
      fail("awards: " + where + " has an entry with an empty id");
      continue;
    }
    if (seen.has(id)) fail("awards: " + where + " duplicate id \"" + id + "\"");
    seen.add(id);
    for (const field of ["name", "nameEs", "why", "whyEs"]) {
      const value = a[field] == null ? "" : String(a[field]).trim();
      if (!value) fail("awards: " + where + " id \"" + id + "\" has empty " + field);
    }
    const name = a.name == null ? "" : String(a.name).trim();
    const nameEs = a.nameEs == null ? "" : String(a.nameEs).trim();
    const why = a.why == null ? "" : String(a.why).trim();
    const whyEs = a.whyEs == null ? "" : String(a.whyEs).trim();
    const pairs = [
      ["name", name, "nameEs", nameEs],
      ["why", why, "whyEs", whyEs],
      ["name", name, "why", why],
      ["name", name, "whyEs", whyEs],
      ["nameEs", nameEs, "why", why],
      ["nameEs", nameEs, "whyEs", whyEs]
    ];
    for (const pair of pairs) {
      if (!pair[1] || !pair[3] || pair[1] !== pair[3]) continue;
      if (pair[0] === "name" && pair[2] === "nameEs" && LOANWORD_NAME.has(id)) continue;
      fail("awards: " + where + " id \"" + id + "\" " + pair[0] + " and " + pair[2] + " are the same");
    }
  }
  return seen;
}

function checkAwards() {
  const gameSrc = readText("game.js");
  const gameBody = extractAfter(gameSrc, "const AWARD_CATALOG", "[", "]");
  if (!gameBody) {
    fail("awards: could not find AWARD_CATALOG in game.js");
    return;
  }
  const gameList = evalExpr(gameBody, "AWARD_CATALOG");
  const html = readText("u/index.html");
  const uBody = extractAfter(html, "var CATALOG", "[", "]");
  if (!uBody) {
    fail("awards: could not find var CATALOG in u/index.html");
    return;
  }
  const uList = evalExpr(uBody, "u/index.html CATALOG");
  if (!Array.isArray(gameList) || !Array.isArray(uList)) return;
  if (!gameList.length) fail("awards: AWARD_CATALOG is empty");
  if (!uList.length) fail("awards: u/index.html catalog is empty");
  const gameIds = checkAwardFields(gameList, "game.js");
  const uIds = checkAwardFields(uList, "u/index.html");
  for (const id of gameIds) {
    if (!uIds.has(id)) fail("awards: id \"" + id + "\" is in game.js but not in u/index.html");
  }
  for (const id of uIds) {
    if (!gameIds.has(id)) fail("awards: id \"" + id + "\" is in u/index.html but not in game.js");
  }
  const uById = new Map(uList.filter((a) => a && a.id).map((a) => [String(a.id), a]));
  for (const a of gameList) {
    if (!a || !a.id) continue;
    const b = uById.get(String(a.id));
    if (!b) continue;
    for (const field of ["name", "nameEs", "why", "whyEs", "cat"]) {
      if (a[field] !== b[field]) {
        fail("awards: id \"" + a.id + "\" field " + field + " differs between game.js and u/index.html");
      }
    }
    if (!!a.secret !== !!b.secret) {
      fail("awards: id \"" + a.id + "\" secret flag differs between game.js and u/index.html");
    }
  }
  if (!fails.some((f) => f.startsWith("awards:"))) {
    note("awards: ok (" + gameIds.size + " ids match, bilingual fields set)");
  }
}

// Accented forms use a Unicode letter boundary. ASCII \b misses a word
// that ends in é, í or á. "sos" / "vos" stay whole words so "esos" and
// "vosotros" do not match. "elegí" after "yo" is standard preterite.
const VOSEO_SPECS = [
  { name: "podés", re: boundaryWord("podés") },
  { name: "tenés", re: boundaryWord("tenés") },
  { name: "querés", re: boundaryWord("querés") },
  { name: "elegí", re: boundaryWord("elegí"), yoPreterite: true },
  { name: "hacé", re: boundaryWord("hacé") },
  { name: "mirá", re: boundaryWord("mirá") },
  { name: "sos", re: boundaryWord("sos") },
  { name: "vos", re: boundaryWord("vos") }
];

function boundaryWord(word) {
  return new RegExp("(?<![\\p{L}\\p{N}_])" + word + "(?![\\p{L}\\p{N}_])", "giu");
}

function checkVoseo(files) {
  let hits = 0;
  for (const rel of files) {
    if (SKIP_CONTENT_SCAN.has(rel) || !isTextFile(rel)) continue;
    const lines = readText(rel).split(/\n/);
    for (let i = 0; i < lines.length; i++) {
      const line = lines[i];
      for (const spec of VOSEO_SPECS) {
        spec.re.lastIndex = 0;
        let m;
        while ((m = spec.re.exec(line))) {
          if (spec.yoPreterite && /\byo\s+$/i.test(line.slice(0, m.index))) continue;
          hits += 1;
          const snippet = line.trim().slice(0, 140);
          fail("voseo: " + rel + ":" + (i + 1) + " matches \"" + spec.name + "\": " + snippet);
        }
      }
    }
  }
  if (!hits) note("voseo: ok");
}

function main() {
  const t0 = Date.now();
  const files = listRepoFiles();
  checkSyntaxFiles();
  checkFiller(files);
  checkForbiddenNames(files);
  checkSize();
  checkVersions();
  checkImages();
  checkI18n();
  checkAwards();
  checkVoseo(files);
  const secs = ((Date.now() - t0) / 1000).toFixed(2);
  for (const line of notes) console.log(line);
  if (fails.length) {
    for (const line of fails) console.error("FAIL " + line);
    console.error("smoke: " + fails.length + " failed in " + secs + "s");
    process.exit(1);
  }
  console.log("smoke: ok in " + secs + "s");
}

main();
