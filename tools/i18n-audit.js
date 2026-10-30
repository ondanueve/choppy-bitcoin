#!/usr/bin/env node
"use strict";

/*
 * Bilingual audit for Choppy Bitcoin. No dependencies.
 *   node tools/i18n-audit.js
 * Writes tests/out/i18n-report.md and exits 1 when any error
 * or unjustified warning remains.
 *
 * Spanish voseo is matched with Unicode letter boundaries so
 * infinitives like poner + te + los are not treated as commands.
 */

const fs = require("fs");
const path = require("path");

const ROOT = path.resolve(__dirname, "..");
const OUT = path.join(ROOT, "tests", "out", "i18n-report.md");

const FILES = [
  "i18n.js",
  "game.js",
  "auth.js",
  "audio.js",
  "run-stats.js",
  "mp.js",
  "index.html",
  "chart.html",
  "about/index.html",
  "profile/index.html",
  "u/index.html"
];

const KNOWN_TOKENS = new Set([
  "n", "i", "have", "offer", "title", "now", "career", "pay", "half", "double", "when", "why"
]);

const VOSEO = [
  "podés", "tenés", "querés", "sabés", "hacés", "decís", "venís",
  "andá", "decime", "fijate", "poné", "vení", "salí", "tené", "acordate",
  "vosotros", "sos", "mirá", "hacé", "llegá", "esperá", "tocá", "jugá",
  "seguí", "probá", "decí"
];

const EN_FN = new Set([
  "the", "you", "your", "with", "from", "this", "that", "have", "was",
  "were", "are", "but", "what", "when", "would", "could", "should", "there",
  "their", "them", "then", "than", "into", "about", "because"
]);

/* Exact ES text that is allowed to match EN. Reason is required. */
const EXCEPT = new Map([
  ["Alias", "Same spelling in both languages"],
  ["Avatar", "Same spelling in both languages"],
  ["Feedback", "Loanword kept in the UI"],
  ["Discord", "Product name"],
  ["Lightning", "Product name of the payment network"],
  ["JUKEBOX", "Loanword used as the control label"],
  ["Jukebox", "Loanword used as the perk and feature name"],
  ["TUTORIAL", "Same spelling in both languages"],
  ["USD", "Currency code"],
  ["BTC", "Ticker"],
  ["Terminal", "Palette name; same word in Spanish"],
  ["Flower Power", "Palette name kept as a proper style name"],
  ["3D", "Abbreviation"],
  ["2D", "Abbreviation"],
  ["Cold storage", "Glossary term kept in Spanish"],
  ["Multisig", "Glossary term kept in Spanish"],
  ["Laser eyes", "Glossary term kept in Spanish"],
  ["Fibonacci", "Proper name"],
  ["Perks", "Loanword kept for the perk system"],
  ["Perk", "Loanword kept for the perk system"],
  ["TLDR", "Label abbreviation, same in both languages"],
  ["Ranked", "Mode name kept in Spanish copy"],
  ["VERSUS", "Mode name kept in Spanish copy"],
  ["ALPHA", "Build tag"],
  ["Bull", "Glossary term for the bull power-up"],
  ["Bear", "Glossary term for the bear power-up"],
  ["Laser", "Short glossary label"],
  ["Swan", "Short glossary label"],
  ["Cold", "Short glossary label"],
  ["STATS", "Abbreviation shared by both languages"],
  ["CHART", "Abbreviation shared by both languages"],
  ["San Arnaldo", "Character name"],
  ["HALVINGS", "Glossary term, displayed in capitals"],
  ["Halvings", "Glossary term kept in Spanish"],
  ["HALVING", "Glossary term, displayed in capitals"],
  ["ON", "Short switch state"],
  ["OFF", "Short switch state"],
  ["Nocoiner", "Glossary term named in the brief"],
  ["A.I. bud", "Product name of the perk"],
  ["A.I. Bud", "Product name of the perk"],
  ["Opsec", "Perk name kept as a loanword"],
  ["FastForward", "Perk name kept as a loanword"],
  ["D.C.A.", "Spelled-out perk abbreviation, same in both languages"],
  ["DCA", "Glossary abbreviation"],
  ["Postdoc", "Career-ladder title kept as the same loanword"],
  ["Paralegal", "Career-ladder title kept; renaming the rung would change the job"],
  ["Sous-chef", "Kitchen rank kept as the same loanword"],
  ["Semi-pro", "Career-ladder rank kept as the same loanword"],
  ["All-star", "Career-ladder rank kept as the same loanword"],
  ["Patagonia · 4%", "Place name spelled the same in Spanish, with the same percent"],
  ["Tetris", "Game title kept as a proper name"],
  ["Bitcoin Country", "Place name kept in both languages"],
  ["THE BITCOIN STATE", "Book title kept in both languages"],
  ["ELO", "Rating abbreviation"],
  ["OK", "Same spelling"],
  ["Esc", "Key-cap abbreviation"],
  ["KIA", "Battle abbreviation kept in the tutorial"],
  ["HUD", "Interface abbreviation"],
  ["REV", "Control abbreviation"],
  ["GG", "Gaming chat reaction used as-is in Spanish"],
  ["RIP", "Gaming chat reaction used as-is in Spanish"],
  ["HF", "Gaming chat reaction used as-is in Spanish"],
  ["Trading", "Category loanword — replaced in the catalogs, not excepted here"]
]);
EXCEPT.delete("Trading");

const CHESS_FIELDS = new Set(["line", "win", "miss", "tWin", "tMiss"]);

const errors = [];
const warnings = [];
const notes = [];
const exceptions = [];
const seenExcept = new Map();

function err(file, line, msg) {
  errors.push({ file, line: line || 1, msg });
}
function warn(file, line, msg, justify) {
  warnings.push({ file, line: line || 1, msg, justify: justify || "" });
}
function note(msg) {
  notes.push(msg);
}
function allow(text, reason, where) {
  const key = text + "\n" + reason;
  if (!seenExcept.has(key)) seenExcept.set(key, { text, reason, where: where || "", n: 0 });
  seenExcept.get(key).n += 1;
}

function exceptionReason(en, es, field) {
  const a = String(en == null ? "" : en);
  const b = String(es == null ? "" : es);
  if (a !== b && a.toLowerCase() !== b.toLowerCase()) return null;
  if (EXCEPT.has(a)) return EXCEPT.get(a);
  if (EXCEPT.has(a.toLowerCase()) && a.toLowerCase() === b.toLowerCase()) return EXCEPT.get(a.toLowerCase());
  if (!/[A-Za-zÁÉÍÓÚÜÑáéíóúüñ]/.test(a)) return "No words: amount, symbol, or punctuation";
  if (CHESS_FIELDS.has(field) && looksChess(a) && looksChess(b)) {
    return "Chess move written the same in both languages";
  }
  return null;
}

function looksChess(s) {
  const t = String(s || "").trim();
  if (t.length < 2 || t.length > 18) return false;
  if (!/\d/.test(t)) return false;
  if (/[áéíóúüñ¿¡]/.test(t)) return false;
  return /^[A-Za-z0-9+#=\-x×. ]+$/.test(t) && /[a-h][1-8]/.test(t);
}

function read(rel) {
  return fs.readFileSync(path.join(ROOT, rel), "utf8");
}

const KEYWORDS = new Set([
  "return", "typeof", "case", "void", "else", "throw", "new", "in", "of",
  "instanceof", "delete", "await", "yield", "do", "if", "for", "while",
  "switch", "catch", "finally", "try", "function", "class", "const", "let",
  "var", "break", "continue", "debugger", "default", "export", "import",
  "extends", "super", "this", "with"
]);

const VALUE_ENDER = new Set(["ident", "num", "str", "tmpl", "regex"]);

function tokenize(src) {
  const tokens = [];
  const n = src.length;
  let i = 0;
  let line = 1;
  let last = null;

  function adv() {
    const c = src[i++];
    if (c === "\n") line += 1;
    return c;
  }
  function peek(k) {
    return src[i + (k || 0)];
  }
  function push(tok) {
    tokens.push(tok);
    if (tok.type !== "comment") last = tok;
  }
  function expectsRegex() {
    if (!last) return true;
    if (last.type === "keyword") return KEYWORDS.has(last.value) && last.value !== "this" && last.value !== "super";
    if (VALUE_ENDER.has(last.type)) return false;
    if (last.type === "punct" && (last.value === ")" || last.value === "]")) return false;
    return true;
  }

  while (i < n) {
    const c = peek();
    if (c === " " || c === "\t" || c === "\r" || c === "\n") { adv(); continue; }
    if (c === "/" && peek(1) === "/") {
      const start = line;
      while (i < n && peek() !== "\n") adv();
      push({ type: "comment", value: "", line: start });
      continue;
    }
    if (c === "/" && peek(1) === "*") {
      const start = line;
      adv(); adv();
      while (i < n && !(peek() === "*" && peek(1) === "/")) adv();
      if (i < n) { adv(); adv(); }
      push({ type: "comment", value: "", line: start });
      continue;
    }
    if (c === "/" && expectsRegex()) {
      const start = line;
      const from = i;
      adv();
      let cls = false;
      let ok = false;
      while (i < n) {
        const d = peek();
        if (d === "\n") break;
        if (d === "\\") { adv(); if (i < n) adv(); continue; }
        if (d === "[") cls = true;
        else if (d === "]") cls = false;
        else if (d === "/" && !cls) { adv(); ok = true; break; }
        adv();
      }
      while (ok && i < n && /[a-z]/i.test(peek())) adv();
      push({ type: ok ? "regex" : "punct", value: src.slice(from, i), line: start, raw: src.slice(from, i) });
      continue;
    }
    if (c === "'" || c === '"') {
      const q = c;
      const start = line;
      adv();
      let v = "";
      let closed = false;
      while (i < n) {
        const d = adv();
        if (d === "\\") {
          const e = adv();
          if (e === "n") v += "\n";
          else if (e === "r") v += "\r";
          else if (e === "t") v += "\t";
          else if (e === "u" && /[0-9a-fA-F]{4}/.test(src.slice(i, i + 4))) {
            v += String.fromCharCode(parseInt(src.slice(i, i + 4), 16));
            i += 4;
          } else v += e || "";
          continue;
        }
        if (d === q) { closed = true; break; }
        if (d === "\n") { v += d; break; }
        v += d;
      }
      push({ type: "str", value: v, line: start, closed });
      continue;
    }
    if (c === "`") {
      const start = line;
      adv();
      const parts = [];
      let cur = "";
      let holes = 0;
      let depth = 0;
      while (i < n) {
        const d = adv();
        if (d === "\\") {
          const e = adv();
          cur += e === "n" ? "\n" : (e || "");
          continue;
        }
        if (d === "`" && depth === 0) { parts.push(cur); break; }
        if (d === "$" && peek() === "{") {
          parts.push(cur);
          cur = "";
          holes += 1;
          adv();
          depth = 1;
          continue;
        }
        if (depth > 0) {
          if (d === "{") depth += 1;
          else if (d === "}") {
            depth -= 1;
            if (depth === 0) continue;
          }
          continue;
        }
        cur += d;
      }
      push({ type: "tmpl", value: parts.join("${}"), parts, holes, line: start });
      continue;
    }
    if (/[0-9]/.test(c) || (c === "." && /[0-9]/.test(peek(1) || ""))) {
      const start = line;
      const from = i;
      if (c === "0" && (peek(1) === "x" || peek(1) === "X")) {
        adv(); adv();
        while (i < n && /[0-9a-fA-F]/.test(peek())) adv();
      } else {
        while (i < n && /[0-9]/.test(peek())) adv();
        if (peek() === "." && /[0-9]/.test(peek(1) || "")) {
          adv();
          while (i < n && /[0-9]/.test(peek())) adv();
        }
        if (peek() === "e" || peek() === "E") {
          const e1 = peek(1);
          const e2 = peek(2);
          if (/[0-9]/.test(e1 || "") || ((e1 === "+" || e1 === "-") && /[0-9]/.test(e2 || ""))) {
            adv();
            if (peek() === "+" || peek() === "-") adv();
            while (i < n && /[0-9]/.test(peek())) adv();
          }
        }
      }
      push({ type: "num", value: src.slice(from, i), line: start });
      continue;
    }
    if (/[A-Za-z_$]/.test(c) || c.charCodeAt(0) > 127) {
      const start = line;
      const from = i;
      adv();
      while (i < n) {
        const d = peek();
        if (/[A-Za-z0-9_$]/.test(d) || d.charCodeAt(0) > 127) adv();
        else break;
      }
      const value = src.slice(from, i);
      push({ type: KEYWORDS.has(value) ? "keyword" : "ident", value, line: start });
      continue;
    }
    const start = line;
    const three = src.slice(i, i + 3);
    const two = src.slice(i, i + 2);
    const ops3 = ["===", "!==", ">>>"];
    const ops2 = ["==", "!=", "<=", ">=", "&&", "||", "??", "=>", "++", "--", "+=", "-=", "*=", "%=", "**", "<<", ">>", "?.", "||"];
    if (ops3.indexOf(three) >= 0) {
      i += 3;
      if (src[i - 1] === "\n") line += 1;
      push({ type: "punct", value: three, line: start });
      continue;
    }
    if (ops2.indexOf(two) >= 0 || two === "||") {
      i += 2;
      push({ type: "punct", value: two, line: start });
      continue;
    }
    if (c === "." && peek(1) === "." && peek(2) === ".") {
      i += 3;
      push({ type: "punct", value: "...", line: start });
      continue;
    }
    adv();
    push({ type: "punct", value: c, line: start });
  }
  return tokens.filter((t) => t.type !== "comment");
}

function braceMap(tokens) {
  const match = new Map();
  const stack = [];
  const pair = { "{": "}", "[": "]", "(": ")" };
  const close = { "}": "{", "]": "[", ")": "(" };
  for (let i = 0; i < tokens.length; i++) {
    if (tokens[i].type !== "punct") continue;
    const v = tokens[i].value;
    if (pair[v]) stack.push(i);
    else if (close[v]) {
      const open = stack.pop();
      if (open == null) return { match, bad: tokens[i] };
      if (pair[tokens[open].value] !== v) return { match, bad: tokens[i] };
      match.set(open, i);
    }
  }
  if (stack.length) return { match, bad: tokens[stack[stack.length - 1]] };
  return { match, bad: null };
}

function skip(tokens, i) {
  return i;
}

function parsePrimary(tokens, i, match) {
  if (i >= tokens.length) return null;
  const t = tokens[i];
  if (t.type === "str") return { node: { k: "str", v: t.value, line: t.line }, i: i + 1 };
  if (t.type === "tmpl") return { node: { k: "tmpl", parts: t.parts || [t.value], holes: t.holes || 0, line: t.line }, i: i + 1 };
  if (t.type === "num") return { node: { k: "num", v: t.value, line: t.line }, i: i + 1 };
  if (t.type === "regex") return { node: { k: "regex", v: t.value, line: t.line }, i: i + 1 };
  if (t.type === "ident" || t.type === "keyword") {
    let j = i + 1;
    let name = t.value;
    while (j < tokens.length && tokens[j].type === "punct" && tokens[j].value === "." && tokens[j + 1] && (tokens[j + 1].type === "ident" || tokens[j + 1].type === "keyword")) {
      name += "." + tokens[j + 1].value;
      j += 2;
    }
    if (j < tokens.length && tokens[j].type === "punct" && tokens[j].value === "(") {
      const end = match.get(j);
      const args = [];
      let k = j + 1;
      while (k < end) {
        if (tokens[k].value === ",") { k += 1; continue; }
        const arg = parseExpr(tokens, k, match);
        if (!arg) break;
        args.push(arg.node);
        k = arg.i;
      }
      return { node: { k: "call", name, args, line: t.line }, i: (end == null ? j : end) + 1 };
    }
    return { node: { k: "ident", v: name, line: t.line }, i: j };
  }
  if (t.type === "punct" && t.value === "(") {
    const inner = parseExpr(tokens, i + 1, match);
    const end = match.get(i);
    if (!inner) return { node: { k: "other", line: t.line }, i: (end == null ? i : end) + 1 };
    return { node: inner.node, i: (end == null ? inner.i : end) + 1 };
  }
  if (t.type === "punct" && t.value === "[") {
    const end = match.get(i);
    const els = [];
    let k = i + 1;
    while (end != null && k < end) {
      if (tokens[k].value === ",") { k += 1; continue; }
      const el = parseExpr(tokens, k, match);
      if (!el) break;
      els.push(el.node);
      k = el.i;
    }
    return { node: { k: "arr", els, line: t.line }, i: (end == null ? i : end) + 1 };
  }
  if (t.type === "punct" && t.value === "{") {
    const end = match.get(i);
    return { node: { k: "obj", line: t.line, open: i, close: end == null ? i : end }, i: (end == null ? i : end) + 1 };
  }
  if (t.value === "!" || t.value === "~" || t.value === "+" || t.value === "-" || t.value === "void" || t.value === "typeof") {
    const inner = parsePrimary(tokens, i + 1, match);
    if (!inner) return { node: { k: "other", line: t.line }, i: i + 1 };
    return { node: { k: "other", line: t.line, inner: inner.node }, i: inner.i };
  }
  return null;
}

function parseAdd(tokens, i, match) {
  let left = parsePrimary(tokens, i, match);
  if (!left) return null;
  let j = left.i;
  while (j < tokens.length && tokens[j].type === "punct" && tokens[j].value === "+") {
    const right = parsePrimary(tokens, j + 1, match);
    if (!right) break;
    left = { node: { k: "add", a: left.node, b: right.node, line: left.node.line }, i: right.i };
    j = left.i;
  }
  return left;
}

function parseAnd(tokens, i, match) {
  let left = parseAdd(tokens, i, match);
  if (!left) return null;
  let j = left.i;
  while (j < tokens.length && tokens[j].type === "punct" && tokens[j].value === "&&") {
    const right = parseAdd(tokens, j + 1, match);
    if (!right) break;
    left = { node: { k: "and", a: left.node, b: right.node, line: left.node.line }, i: right.i };
    j = left.i;
  }
  return left;
}

function parseOr(tokens, i, match) {
  let left = parseAnd(tokens, i, match);
  if (!left) return null;
  let j = left.i;
  while (j < tokens.length && tokens[j].type === "punct" && (tokens[j].value === "||" || tokens[j].value === "??")) {
    const right = parseAnd(tokens, j + 1, match);
    if (!right) break;
    left = { node: { k: "or", a: left.node, b: right.node, line: left.node.line }, i: right.i };
    j = left.i;
  }
  return left;
}

function parseCmp(tokens, i, match) {
  let left = parseOr(tokens, i, match);
  if (!left) return null;
  let j = left.i;
  const cmp = { "<": 1, ">": 1, "<=": 1, ">=": 1, "===": 1, "!==": 1, "==": 1, "!=": 1 };
  while (j < tokens.length && tokens[j].type === "punct" && cmp[tokens[j].value]) {
    const right = parseOr(tokens, j + 1, match);
    if (!right) break;
    left = { node: { k: "cmp", a: left.node, b: right.node, line: left.node.line }, i: right.i };
    j = left.i;
  }
  return left;
}

function parseExpr(tokens, i, match) {
  const left = parseCmp(tokens, i, match);
  if (!left) return null;
  let j = left.i;
  if (j < tokens.length && tokens[j].type === "punct" && tokens[j].value === "?") {
    const mid = parseExpr(tokens, j + 1, match);
    if (!mid) return left;
    let k = mid.i;
    if (k < tokens.length && tokens[k].type === "punct" && tokens[k].value === ":") {
      const rhs = parseExpr(tokens, k + 1, match);
      if (!rhs) return left;
      return { node: { k: "tern", c: left.node, a: mid.node, b: rhs.node, line: left.node.line }, i: rhs.i };
    }
  }
  return left;
}

function propsOf(tokens, open, close, match) {
  const props = [];
  let depth = 0;
  let i = open + 1;
  while (i < close) {
    const t = tokens[i];
    if (t.type === "punct" && (t.value === "{" || t.value === "[" || t.value === "(")) { depth += 1; i += 1; continue; }
    if (t.type === "punct" && (t.value === "}" || t.value === "]" || t.value === ")")) { depth -= 1; i += 1; continue; }
    if (depth === 0 && (t.type === "ident" || t.type === "str" || t.type === "keyword") && tokens[i + 1] && tokens[i + 1].type === "punct" && tokens[i + 1].value === ":") {
      const key = t.value;
      const expr = parseExpr(tokens, i + 2, match);
      if (expr && expr.i <= close + 1) {
        props.push({ key, node: expr.node, line: t.line });
        i = expr.i;
        continue;
      }
    }
    i += 1;
  }
  return props;
}

function flatten(node) {
  if (!node) return null;
  if (node.k === "str") return { text: node.v, holes: 0, line: node.line, pure: node.v };
  if (node.k === "tmpl") {
    const text = (node.parts || []).join("\u0001");
    return { text, holes: node.holes || 0, line: node.line, pure: node.holes ? null : text };
  }
  if (node.k === "add") {
    const a = flatten(node.a);
    const b = flatten(node.b);
    if (!a || !b) return null;
    return { text: a.text + "\u0001" + b.text, holes: a.holes + b.holes + 0, line: a.line, pure: null };
  }
  if (node.k === "call" && node.name === "stampNation" && node.args && node.args[0]) return flatten(node.args[0]);
  if (node.k === "ident" || node.k === "call" || node.k === "num") {
    return { text: "\u0001", holes: 1, line: node.line, pure: null };
  }
  return null;
}

function pureString(node) {
  const f = flatten(node);
  if (!f || f.holes || f.pure == null) return null;
  return f.pure;
}

function sampleOf(node) {
  if (!node) return null;
  if (node.k === "str") return node.v;
  if (node.k === "num") return String(node.v);
  if (node.k === "ident" || node.k === "call") return "1";
  if (node.k === "add") {
    const a = sampleOf(node.a);
    const b = sampleOf(node.b);
    if (a == null || b == null) return null;
    return a + b;
  }
  if (node.k === "tmpl") {
    const parts = node.parts || [];
    let s = "";
    for (let i = 0; i < parts.length; i++) {
      s += parts[i];
      if (i < parts.length - 1) s += "1";
    }
    return s;
  }
  return null;
}

function staticTexts(node, out) {
  if (!node) return;
  if (node.k === "str") out.push(node.v);
  else if (node.k === "add" || node.k === "or" || node.k === "and") {
    staticTexts(node.a, out);
    staticTexts(node.b, out);
  } else if (node.k === "tern") {
    staticTexts(node.a, out);
    staticTexts(node.b, out);
  } else if (node.k === "tmpl") {
    (node.parts || []).forEach((p) => { if (p) out.push(p); });
  }
}

function tokensIn(text) {
  const found = new Set();
  const re = /\{([A-Za-z]+)\}/g;
  let m;
  while ((m = re.exec(text))) found.add(m[1]);
  return found;
}

function badMarkers(text) {
  if (text.indexOf("{{") >= 0) return "{{";
  if (/PLACEHOLDER|TODO_REPLACE|lorem ipsum|<insert/i.test(text)) return "filler marker";
  return "";
}

function hasSpanish(s) {
  if (/[áéíóúüñ¿¡]/.test(s)) return true;
  return /(^|[^A-Za-zÁÉÍÓÚÜÑáéíóúüñ])(el|la|los|las|una|unos|para|por|con|del|que|como|está|están|tienes|puedes|elige|juego|partida)(?![A-Za-zÁÉÍÓÚÜÑáéíóúüñ])/i.test(s);
}

function englishFunctionHits(s) {
  const words = String(s || "").toLowerCase().match(/[a-z']+/g) || [];
  let n = 0;
  const seen = new Set();
  words.forEach((w) => {
    if (EN_FN.has(w) && !seen.has(w)) { seen.add(w); n += 1; }
  });
  return n;
}

function pairProblem(file, line, field, enNode, esNode) {
  if (enNode && esNode && enNode.k === "tern" && esNode.k === "tern") {
    pairProblem(file, line, field, enNode.a, esNode.a);
    pairProblem(file, line, field, enNode.b, esNode.b);
    return;
  }
  const enF = flatten(enNode);
  const esF = flatten(esNode);
  if (!enF || !esF) return;
  const enStatic = enF.text.replace(/\u0001/g, "");
  const esStatic = esF.text.replace(/\u0001/g, "");
  const markerEn = badMarkers(enF.text);
  const markerEs = badMarkers(esF.text);
  if (markerEn) err(file, line, "Unresolved template marker in EN " + field + ": " + markerEn);
  if (markerEs) err(file, line, "Unresolved template marker in ES " + field + ": " + markerEs);
  const te = tokensIn(enStatic);
  const ts = tokensIn(esStatic);
  te.forEach((tok) => {
    if (!ts.has(tok)) err(file, line, "Placeholder {" + tok + "} missing on the Spanish side of " + field);
    if (!KNOWN_TOKENS.has(tok)) err(file, line, "Unknown placeholder {" + tok + "} in " + field);
  });
  ts.forEach((tok) => {
    if (!te.has(tok)) err(file, line, "Placeholder {" + tok + "} missing on the English side of " + field);
  });
  if (/\{[^{}\n]*$/.test(enStatic) || /\{[^{}\n]*$/.test(esStatic)) {
    err(file, line, "Unclosed { in " + field);
  }
  const same = enF.text === esF.text;
  const caseOnly = !same && enF.text.toLowerCase() === esF.text.toLowerCase();
  if ((same || caseOnly) && /[A-Za-zÁÉÍÓÚÜÑáéíóúüñ]/.test(enStatic)) {
    const reason = exceptionReason(enStatic.trim(), esStatic.trim(), field);
    if (reason) allow(enStatic.trim(), reason, file + ":" + field);
    else if (caseOnly) err(file, line, "Spanish " + field + " only changes capitals: " + JSON.stringify(esStatic.trim()) + " / " + JSON.stringify(enStatic.trim()));
    else err(file, line, "Spanish " + field + " is identical to English: " + JSON.stringify(enStatic.trim()));
  }
  const enLen = enStatic.trim().length;
  const esLen = esStatic.trim().length;
  const short = Math.min(enLen, esLen);
  const long = Math.max(enLen, esLen);
  if (short >= 28 && long / short >= 2.8) {
    warn(file, line, "Length ratio " + (long / short).toFixed(2) + " on " + field + " (" + enLen + " EN / " + esLen + " ES): " + JSON.stringify(esStatic.trim().slice(0, 80)));
  }
  if (esLen > 16 && englishFunctionHits(esStatic) >= 2 && !hasSpanish(esStatic)) {
    warn(file, line, "Spanish " + field + " still reads as English: " + JSON.stringify(esStatic.trim().slice(0, 140)));
  }
  voseoScan(file, line, esStatic);
  voseoScan(file, line, enStatic);
}

function voseoScan(file, line, text) {
  const s = String(text || "");
  VOSEO.forEach((w) => {
    const re = new RegExp("(?<![\\p{L}\\p{N}_])" + w + "(?![\\p{L}\\p{N}_])", "iu");
    if (re.test(s)) err(file, line, "Voseo form " + JSON.stringify(w));
  });
  const elegi = /(?<![\p{L}\p{N}_])elegí(?![\p{L}\p{N}_])/iu;
  if (elegi.test(s) && !/yo elegí/i.test(s)) err(file, line, "Voseo form \"elegí\"");
  if (/(?<![\p{L}\p{N}_])vos(?![\p{L}\p{N}_])/iu.test(s)) err(file, line, "Voseo form \"vos\"");
}

function arrayPairs(file, field, enNode, esNode) {
  if (!enNode || !esNode || enNode.k !== "arr" || esNode.k !== "arr") return false;
  if (enNode.els.length !== esNode.els.length) {
    err(file, enNode.line, field + "Es has " + esNode.els.length + " entries and " + field + " has " + enNode.els.length);
  }
  const n = Math.max(enNode.els.length, esNode.els.length);
  for (let i = 0; i < n; i++) {
    if (enNode.els[i] && esNode.els[i]) pairProblem(file, enNode.els[i].line, field + "[" + i + "]", enNode.els[i], esNode.els[i]);
  }
  return true;
}

function isStringish(node) {
  if (!node) return false;
  if (node.k === "str" || node.k === "tmpl" || node.k === "add") return true;
  if (node.k === "or" || node.k === "and") return isStringish(node.a) || isStringish(node.b);
  if (node.k === "tern") return isStringish(node.a) || isStringish(node.b);
  if (node.k === "call" && node.name === "stampNation") return !!(node.args && node.args[0] && isStringish(node.args[0]));
  return false;
}

function findAssignName(tokens, open) {
  let i = open - 1;
  if (i >= 0 && tokens[i].type === "punct" && tokens[i].value === "=") i -= 1;
  else return "";
  if (i >= 0 && (tokens[i].type === "ident" || tokens[i].type === "keyword")) {
    let name = tokens[i].value;
    if (i >= 2 && tokens[i - 1].value === "." && tokens[i - 2].type === "ident") name = tokens[i - 2].value + "." + name;
    return name;
  }
  return "";
}

function langLookback(tokens, qIndex) {
  let i = qIndex - 1;
  let steps = 0;
  while (i >= 0 && steps < 24) {
    const v = tokens[i].value;
    if (v === ";" || v === "{" || v === "}" || v === ":" || v === "?") break;
    if (v === "es" || v === "chanceLang" || v === "\"es\"" || v === "es") return true;
    if (tokens[i].type === "str" && tokens[i].value === "es") return true;
    if (v === "lang") return true;
    i -= 1;
    steps += 1;
  }
  return false;
}

function analyzeJs(file, src, stats) {
  let tokens;
  try {
    tokens = tokenize(src);
  } catch (e) {
    err(file, 1, "Tokenizer failed: " + e.message);
    return;
  }
  const { match, bad } = braceMap(tokens);
  if (bad) err(file, bad.line, "Unbalanced " + bad.value + " while tokenizing. Later pairs in this file may be incomplete.");
  stats.files += 1;

  const objects = [];
  for (let i = 0; i < tokens.length; i++) {
    if (tokens[i].type !== "punct" || tokens[i].value !== "{") continue;
    const close = match.get(i);
    if (close == null) continue;
    const name = findAssignName(tokens, i);
    const props = propsOf(tokens, i, close, match);
    objects.push({ name, open: i, close, props, line: tokens[i].line });
  }

  let dict = null;
  let tui = null;
  let voice = null;
  const namedObjs = new Map();
  objects.forEach((obj) => {
    if (obj.name) namedObjs.set(obj.name, obj);
    if (obj.name === "dict") dict = obj;
    if (obj.name === "T_UI") tui = obj;
    if (obj.name === "VOICE_ES") voice = obj;
  });

  if (file === "game.js" && tui) {
    const map = {};
    const seen = {};
    tui.props.forEach((p) => {
      if (seen[p.key]) note("T_UI key " + p.key + " is assigned more than once; the later one wins (line " + p.line + ").");
      seen[p.key] = true;
      map[p.key] = p;
    });
    stats.tui = map;
    if (Object.keys(map).length < 160) err(file, tui.line, "T_UI parsed " + Object.keys(map).length + " keys; expected about 169.");
  }

  namedObjs.forEach((obj, name) => {
    if (!name.endsWith("_ES") && namedObjs.has(name + "_ES")) {
      const a = obj;
      const b = namedObjs.get(name + "_ES");
      const am = {};
      const bm = {};
      a.props.forEach((p) => { am[p.key] = p; });
      b.props.forEach((p) => { bm[p.key] = p; });
      Object.keys(am).forEach((k) => {
        if (!bm[k]) err(file, am[k].line, name + "_ES missing " + k);
        else pairProblem(file, am[k].line, name + "." + k, am[k].node, bm[k].node);
      });
      Object.keys(bm).forEach((k) => {
        if (!am[k]) err(file, bm[k].line, name + " missing " + k + " present on " + name + "_ES");
      });
    }
  });

  const ES_SUFFIX = /Es$/;
  objects.forEach((obj) => {
    const by = {};
    obj.props.forEach((p) => { by[p.key] = p; });
    if (by.en && by.es && by.en.node && by.es.node && by.en.node.k !== "obj") {
      if (by.en.node.k === "arr" || by.es.node.k === "arr") arrayPairs(file, "en", by.en.node, by.es.node);
      else {
        pairProblem(file, by.en.line, (obj.name || "object") + ".en", by.en.node, by.es.node);
        stats.pairs += 1;
      }
    }
    Object.keys(by).forEach((k) => {
      if (!ES_SUFFIX.test(k) || k === "es") return;
      const base = k.slice(0, -2);
      if (!by[base]) return;
      if (arrayPairs(file, base, by[base].node, by[k].node)) stats.pairs += 1;
      else {
        pairProblem(file, by[base].line, (obj.name || "object") + "." + base, by[base].node, by[k].node);
        stats.pairs += 1;
      }
    });
    if ((obj.name === "AWARD_CATALOG" || obj.name === "CATALOG") && false) {
      /* catalogs are arrays, handled below */
    }
  });

  /* Catalog arrays: const AWARD_CATALOG = [ ... ] and var CATALOG = [ ... ] */
  for (let i = 0; i < tokens.length; i++) {
    if (tokens[i].value !== "[") continue;
    const name = findAssignName(tokens, i);
    if (name !== "AWARD_CATALOG" && name !== "CATALOG") continue;
    const expr = parsePrimary(tokens, i, match);
    if (!expr || expr.node.k !== "arr") continue;
    const rows = [];
    expr.node.els.forEach((el) => {
      if (el.k !== "obj") return;
      const props = propsOf(tokens, el.open, el.close, match);
      const row = { line: el.line };
      props.forEach((p) => {
        if (p.node.k === "str") row[p.key] = p.node.v;
        else if (p.node.k === "ident") row[p.key] = p.node.v;
      });
      if (row.id) rows.push(row);
    });
    stats.catalogs.push({ file, name, rows });
  }

  /* Ternary language pairs. */
  for (let i = 0; i < tokens.length; i++) {
    if (tokens[i].value !== "?") continue;
    if (!langLookback(tokens, i)) continue;
    const mid = parseExpr(tokens, i + 1, match);
    if (!mid) continue;
    if (mid.i >= tokens.length || tokens[mid.i].value !== ":") continue;
    const rhs = parseExpr(tokens, mid.i + 1, match);
    if (!rhs) continue;
    if (!isStringish(mid.node) || !isStringish(rhs.node)) continue;
    /* Condition true means Spanish in this codebase (es ? esText : enText). */
    pairProblem(file, tokens[i].line, "ternary", rhs.node, mid.node);
    stats.ternaries += 1;
    i = rhs.i - 1;
  }

  /* t("key") and BZ.t("key"). run-stats uses t(en, es). */
  const twoArgT = file === "run-stats.js";
  for (let i = 0; i < tokens.length; i++) {
    const t = tokens[i];
    const isT = t.value === "t" && tokens[i + 1] && tokens[i + 1].value === "(";
    const isBz = t.value === "BZ" && tokens[i + 1] && tokens[i + 1].value === "." && tokens[i + 2] && tokens[i + 2].value === "t" && tokens[i + 3] && tokens[i + 3].value === "(";
    if (!isT && !isBz) continue;
    if (isT && i > 0 && (tokens[i - 1].value === "function" || tokens[i - 1].value === ".")) continue;
    const callAt = isBz ? i + 3 : i + 1;
    const end = match.get(callAt);
    if (end == null) continue;
    const args = [];
    let k = callAt + 1;
    while (k < end) {
      if (tokens[k].value === ",") { k += 1; continue; }
      const arg = parseExpr(tokens, k, match);
      if (!arg) break;
      args.push(arg.node);
      k = arg.i;
    }
    if (twoArgT && args.length >= 2 && isStringish(args[0]) && isStringish(args[1])) {
      pairProblem(file, t.line, "t()", args[0], args[1]);
      stats.pairs += 1;
      continue;
    }
    if (args.length === 1 && args[0].k === "str") {
      stats.tCalls.push({ file, line: t.line, key: args[0].v });
    }
  }

  /* say() captions. Local say inside resolveChance is the bilingual outcome helper. */
  let resolveRange = null;
  for (let i = 0; i < tokens.length; i++) {
    if (tokens[i].value === "function" && tokens[i + 1] && tokens[i + 1].value === "resolveChance") {
      let j = i + 2;
      while (j < tokens.length && !(tokens[j].type === "punct" && tokens[j].value === "{")) j += 1;
      if (tokens[j] && tokens[j].type === "punct" && tokens[j].value === "{" && match.get(j) != null) {
        resolveRange = [tokens[j].line, tokens[match.get(j)].line];
      }
    }
  }
  for (let i = 0; i < tokens.length; i++) {
    if (tokens[i].value !== "say" || !tokens[i + 1] || tokens[i + 1].value !== "(") continue;
    if (i > 0 && tokens[i - 1].value === "function") continue;
    const end = match.get(i + 1);
    if (end == null) continue;
    const args = [];
    let k = i + 2;
    while (k < end) {
      if (tokens[k].value === ",") { k += 1; continue; }
      const arg = parseExpr(tokens, k, match);
      if (!arg) break;
      args.push(arg.node);
      k = arg.i;
    }
    const local = resolveRange && tokens[i].line >= resolveRange[0] && tokens[i].line <= resolveRange[1];
    if (local) {
      if (!args[1] || !isStringish(args[1])) {
        err(file, tokens[i].line, "Story outcome say() is missing a Spanish string");
      } else if (isStringish(args[0])) {
        pairProblem(file, tokens[i].line, "say()", args[0], args[1]);
        stats.sayPairs += 1;
      }
      continue;
    }
    if (!args[0]) continue;
    const whole = pureString(args[0]);
    if (whole != null) {
      stats.captions.push({ file, line: tokens[i].line, sample: whole, kind: "static" });
      continue;
    }
    const sample = sampleOf(args[0]);
    if (sample && sample !== "1") stats.captions.push({ file, line: tokens[i].line, sample, kind: "dynamic" });
    else {
      const leaves = [];
      staticTexts(args[0], leaves);
      leaves.forEach((text) => {
        if (text && /[A-Za-z]/.test(text)) stats.captions.push({ file, line: tokens[i].line, sample: text, kind: "fragment" });
      });
    }
  }

  /* Auth messages must go through BZ.t / tr(), not a raw string. */
  if (file === "auth.js") {
    function rawBits(node, out) {
      if (!node) return;
      if (node.k === "call" && (node.name === "tr" || node.name === "BZ.t" || node.name === "t")) return;
      if (node.k === "str") { if (node.v) out.push(node.v); return; }
      if (node.k === "add" || node.k === "or" || node.k === "and" || node.k === "cmp") {
        rawBits(node.a, out); rawBits(node.b, out); return;
      }
      if (node.k === "tern") { rawBits(node.a, out); rawBits(node.b, out); }
    }
    for (let i = 0; i < tokens.length; i++) {
      const isSet = tokens[i].value === "setMsg" && tokens[i + 1] && tokens[i + 1].type === "punct" && tokens[i + 1].value === "(";
      const isText = tokens[i].value === "textContent" && tokens[i + 1] && tokens[i + 1].type === "punct" && tokens[i + 1].value === "=";
      if (!isSet && !isText) continue;
      const arg = parseExpr(tokens, i + 2, match);
      const bits = [];
      if (arg) rawBits(arg.node, bits);
      bits.forEach((text) => {
        if (text === "—" || text === "error") return;
        err(file, tokens[i].line, (isSet ? "setMsg" : "textContent") + " uses a raw string. Route it through tr(): " + JSON.stringify(text));
      });
    }
  }

  /* Pools spoken on the ticker. */
  if (file === "audio.js") {
    const pools = ["SWAN", "BULL", "LASER", "HALVE_SOON", "BEAR", "BUY", "SELL", "HALVE_MISS"];
    for (let i = 0; i < tokens.length; i++) {
      if (tokens[i].value !== "=" || tokens[i + 1] == null || tokens[i + 1].value !== "[") continue;
      const prev = tokens[i - 1];
      if (!prev || pools.indexOf(prev.value) < 0) continue;
      const expr = parsePrimary(tokens, i + 1, match);
      if (!expr || expr.node.k !== "arr") continue;
      expr.node.els.forEach((el) => {
        const text = pureString(el);
        if (text) stats.pools.push({ file, line: el.line, text, pool: prev.value });
      });
    }
  }

  /* Caption patterns, if the game defines them. */
  if (file === "game.js") {
    for (let i = 0; i < tokens.length; i++) {
      if ((tokens[i].value === "CAPTION_RES" || tokens[i].value === "AI_RES") && tokens[i + 1] && tokens[i + 1].value === "=" && tokens[i + 2] && tokens[i + 2].value === "[") {
        const end = match.get(i + 2);
        const bucket = tokens[i].value === "AI_RES" ? stats.aiRes : stats.captionRes;
        for (let k = i + 2; end != null && k < end; k++) {
          if (tokens[k].type === "regex") {
            const body = String(tokens[k].value || "");
            const m = /^\/([\s\S]*)\/[a-z]*$/.exec(body);
            if (m) {
              try { bucket.push(new RegExp(m[1])); } catch (e) { err(file, tokens[k].line, tokens[i].value + " regex did not compile"); }
            }
          }
        }
      }
    }
    voseoScan(file, 1, "");
  }

  /* data-i18n in any file, including JS-built HTML. */
  const attr = /data-i18n(?:-html|-aria)?="([^"]+)"/g;
  let m;
  const lines = src.split(/\n/);
  while ((m = attr.exec(src))) {
    const upto = src.slice(0, m.index);
    const line = upto.split("\n").length;
    stats.attrKeys.push({ file, line, key: m[1] });
  }
  lines.forEach((ln, idx) => {
    if (/TODO_REPLACE|lorem ipsum|<insert here|\bPLACEHOLDER\b/.test(ln)) {
      err(file, idx + 1, "Filler marker in source");
    }
  });
}

function objMap(dictObj, side) {
  const prop = dictObj.props.find((p) => p.key === side);
  const map = {};
  if (!prop || prop.node.k !== "obj") return { map, line: dictObj.line };
  /* Re-read props from the stored open/close. The node has open/close. */
  return { map: null, node: prop.node, line: prop.line };
}

function fillDict(stats, tokens, match) {
  /* Recomputed inside analyzeJs via a second pass stored on stats. */
}

function rebuildDict(file, src, stats) {
  if (file !== "i18n.js" && file !== "game.js") return;
  const tokens = tokenize(src);
  const { match } = braceMap(tokens);
  for (let i = 0; i < tokens.length; i++) {
    if (tokens[i].type !== "punct" || tokens[i].value !== "{") continue;
    const name = findAssignName(tokens, i);
    if (file === "i18n.js" && name === "dict") {
      const close = match.get(i);
      const props = propsOf(tokens, i, close, match);
      const out = { en: {}, es: {} };
      props.forEach((side) => {
        if ((side.key !== "en" && side.key !== "es") || side.node.k !== "obj") return;
        const inner = propsOf(tokens, side.node.open, side.node.close, match);
        inner.forEach((p) => {
          const text = pureString(p.node);
          if (text == null) err(file, p.line, "dict." + side.key + "." + p.key + " is not a plain string");
          out[side.key][p.key] = { text: text == null ? "" : text, line: p.line };
        });
      });
      stats.dict = out;
    }
    if (file === "game.js" && name === "T_UI") {
      const close = match.get(i);
      const props = propsOf(tokens, i, close, match);
      const map = {};
      const seen = {};
      props.forEach((p) => {
        if (seen[p.key]) note("T_UI key " + p.key + " is assigned more than once; the later value wins (line " + p.line + ").");
        seen[p.key] = true;
        const text = pureString(p.node);
        map[p.key] = { text: text == null ? "" : text, line: p.line };
      });
      stats.tui = map;
    }
    if (file === "game.js" && (name === "VOICE_ES" || name === "AI_ES")) {
      const close = match.get(i);
      const props = propsOf(tokens, i, close, match);
      const map = {};
      props.forEach((p) => {
        map[p.key] = { es: pureString(p.node) || "", line: p.line };
      });
      if (name === "VOICE_ES") stats.voice = map;
      else stats.ai = map;
    }
  }
}

function structural(stats) {
  const profile = read("profile/index.html");
  if (profile.indexOf("i18n.js") < 0) err("profile/index.html", 1, "Profile page does not load i18n.js");
  if (!/BZ\.lang/.test(profile)) err("profile/index.html", 1, "Profile page does not read BZ.lang()");
  if (/navigator\.language/.test(profile)) err("profile/index.html", 1, "Profile page still picks language from navigator.language");
  for (const key of ["profileUser", "profileAvatar", "profilePublic", "profileEdit"]) {
    if (profile.indexOf('data-i18n="' + key + '"') < 0) err("profile/index.html", 1, "Missing data-i18n=\"" + key + "\"");
  }

  const chart = read("chart.html");
  if (chart.indexOf("i18n.js") < 0) err("chart.html", 1, "Chart page does not load i18n.js");
  const chartI18 = chart.indexOf("i18n.js");
  const chartStats = chart.indexOf("run-stats.js");
  if (chartI18 < 0 || chartStats < 0 || chartI18 > chartStats) {
    err("chart.html", 1, "i18n.js must load before run-stats.js so chart labels can read BZ.lang()");
  }

  const index = read("index.html");
  ["email", "password", "confirmPass", "alias", "signIn", "needAccount", "forgot", "close", "signOut", "save", "btcAddr", "profile", "lightning"].forEach((key) => {
    if (index.indexOf('data-i18n="' + key + '"') < 0) err("index.html", 1, "Missing data-i18n=\"" + key + "\"");
  });
  ["ariaPlayPause", "ariaVolume", "ariaPause", "ariaCountry", "ariaReverse", "ariaSpread", "ariaFury"].forEach((key) => {
    if (index.indexOf('data-i18n-aria="' + key + '"') < 0) err("index.html", 1, "Missing data-i18n-aria=\"" + key + "\"");
  });

  const game = read("game.js");
  const at = game.indexOf('addEventListener("bz-lang"');
  const handler = at < 0 ? "" : game.slice(at, at + 500);
  if (handler.indexOf("renderOverlay") < 0 || handler.indexOf("renderHud") < 0) {
    err("game.js", 1, "bz-lang handler must refresh the overlay and the HUD");
  }
  if (handler.indexOf("renderBitcoinCountry") < 0) {
    err("game.js", 1, "bz-lang handler does not refresh the Bitcoin Country panel");
  }
  if (game.indexOf("VOICE_ES") < 0) err("game.js", 1, "Missing VOICE_ES caption map");
  if (game.indexOf("function visLine") < 0) err("game.js", 1, "Missing visLine(), so spoken English lines stay on the ticker");
  if (game.indexOf("AI_ES") < 0) err("game.js", 1, "Missing AI_ES, so the A.I. bud log stays in English");
  if (game.indexOf("aiVis(") < 0) err("game.js", 1, "The A.I. bud log does not translate lines at display time");
  if (game.indexOf("La isla") < 0) err("game.js", 1, "Marketplace still lacks a Spanish label for the island");
  ["ariaPrev", "ariaNext", "ariaShuffle", "ariaRepeat", "ariaEnable", "ariaDisable", "jukeRetro"].forEach((key) => {
    if (game.indexOf('t("' + key + '")') < 0) err("game.js", 1, "Jukebox control is missing t(\"" + key + "\")");
  });
  if (game.indexOf('CÓDIGO') < 0) err("game.js", 1, "Versus room field has no Spanish code label");
  const aiNeed = [
    "Sold BTC", "Bought BTC", "DCA ON", "DCA OFF", "Trend UP", "Trend DOWN",
    "Dump incoming · raise cash for the dip", "Sold the bull · raise cash for the dip",
    "Pump incoming · accumulate", "Bought the black swan", "Bought the bear",
    "Bear/swan · income to bitcoin", "Bull · do not buy the top",
    "Holding · pump the bag", "Flat · cheaper next buy",
    "Stronger army for the next battle",
    "Adoption is not worth it here", "Income becomes bitcoin",
    "More candle cash to stack sats", "Paycheck to convert into bitcoin",
    "Better timing for the stack", "Steer price while we accumulate",
    "Lasers and lives to keep stacking", "Tamer bears protect the bag",
    "Arc shots at more bitcoin", "More candles, more cash to stack",
    "No stack value, last resort", "Extra lives to keep stacking",
    "Best for stacking bitcoin"
  ];
  if (stats.ai) {
    aiNeed.forEach((k) => {
      if (!Object.prototype.hasOwnProperty.call(stats.ai, k)) err("game.js", 1, "A.I. bud line missing from AI_ES: " + JSON.stringify(k));
    });
  }
  if (!stats.aiRes.some((re) => re.test("Army tier 3/7")) || !stats.aiRes.some((re) => re.test("perk:job:2"))) {
    err("game.js", 1, "AI_RES must cover army tier lines and perk:id:tier lines");
  }
  if (game.indexOf("Premio oculto") < 0 || game.indexOf("???") < 0) {
    err("game.js", 1, "Secret awards must stay masked as ??? until they are earned");
  }
  if (!/function awardRowHtml[\s\S]{0,400}a\.secret/.test(game)) {
    err("game.js", 1, "awardRowHtml must keep the secret-award mask");
  }

  const pub = read("u/index.html");
  if (pub.indexOf('data-i18n="play"') < 0 && pub.indexOf('BZ.t("play")') < 0) {
    err("u/index.html", 1, "Play link is not wired to the play string");
  }
  if (pub.indexOf('BZ.t("eloBoard")') < 0 && pub.indexOf("eloBoard") < 0) {
    err("u/index.html", 1, "Versus ELO label is not wired to eloBoard");
  }
  if (pub.indexOf("owned[a.id]") < 0) err("u/index.html", 1, "Public profile must list only awards the player has earned");

  const rs = read("run-stats.js");
  if (!/t\(\s*" · miss "\s*,\s*" · fallos "\s*\)/.test(rs)) {
    err("run-stats.js", 1, "Halving row still says \"miss\" in Spanish");
  }

  const i18 = read("i18n.js");
  if (i18.indexOf("data-i18n-aria") < 0) err("i18n.js", 1, "BZ.apply does not copy data-i18n-aria onto aria-label");

  if (stats.dict && stats.dict.en.testing && stats.dict.es.testing && stats.dict.es.testing.text === "Testing") {
    err("i18n.js", stats.dict.es.testing.line, "dict.es.testing is still the English word Testing");
  }
}

function checkKeys(stats) {
  const dict = stats.dict;
  if (!dict) {
    err("i18n.js", 1, "Dictionary was not extracted");
    return;
  }
  const enN = Object.keys(dict.en).length;
  const esN = Object.keys(dict.es).length;
  if (enN !== esN) err("i18n.js", 1, "Key count differs: EN " + enN + ", ES " + esN);
  stats.tCalls.forEach((call) => {
    if (!Object.prototype.hasOwnProperty.call(dict.en, call.key) || !Object.prototype.hasOwnProperty.call(dict.es, call.key)) {
      const inUi = stats.tui && Object.prototype.hasOwnProperty.call(stats.tui, call.key);
      err(call.file, call.line, "t(\"" + call.key + "\") is missing from dict.en/dict.es" + (inUi ? " (present only in T_UI)" : ""));
    }
  });
  stats.attrKeys.forEach((call) => {
    if (!Object.prototype.hasOwnProperty.call(dict.en, call.key) || !Object.prototype.hasOwnProperty.call(dict.es, call.key)) {
      err(call.file, call.line, "data-i18n key \"" + call.key + "\" is missing from dict.en/dict.es");
    }
  });
  if (stats.tui && dict) {
    Object.keys(stats.tui).forEach((k) => {
      if (!Object.prototype.hasOwnProperty.call(dict.en, k)) err("game.js", stats.tui[k].line, "T_UI." + k + " has no dict.en entry");
      if (!Object.prototype.hasOwnProperty.call(dict.es, k)) err("game.js", stats.tui[k].line, "T_UI." + k + " has no dict.es entry");
      else if (dict.en[k] && stats.tui[k].text && stats.tui[k].text !== dict.en[k].text) {
        if (stats.tui[k].text.toLowerCase() === dict.en[k].text.toLowerCase()) {
          note("T_UI." + k + " differs from dict.en only by capitals. Live copy comes from dict; T_UI is the English fallback.");
        } else {
          note("T_UI." + k + " text differs from dict.en. Live copy comes from dict; T_UI is the English fallback.");
        }
      }
    });
  }
}

function checkCaptions(stats) {
  const voice = stats.voice || {};
  stats.pools.forEach((p) => {
    if (!Object.prototype.hasOwnProperty.call(voice, p.text)) {
      err(p.file, p.line, "Voice line has no Spanish caption in VOICE_ES: " + JSON.stringify(p.text));
    }
  });
  stats.captions.forEach((c) => {
    if (c.kind === "static" || c.kind === "fragment") {
      if (!Object.prototype.hasOwnProperty.call(voice, c.sample)) {
        err(c.file, c.line, "Ticker line has no Spanish caption in VOICE_ES: " + JSON.stringify(c.sample));
      }
      return;
    }
    const hit = stats.captionRes.some((re) => re.test(c.sample));
    if (!hit) err(c.file, c.line, "Ticker line matches no CAPTION_RES pattern: " + JSON.stringify(c.sample));
  });
}

function checkCatalogs(stats) {
  const lists = stats.catalogs.filter((c) => c.rows && c.rows.length);
  if (lists.length < 2) {
    err("game.js", 1, "Expected AWARD_CATALOG in game.js and CATALOG in u/index.html");
    return;
  }
  const base = lists.find((c) => c.name === "AWARD_CATALOG") || lists[0];
  lists.forEach((other) => {
    if (other === base) return;
    const by = {};
    other.rows.forEach((r) => { by[r.id] = r; });
    base.rows.forEach((r) => {
      const b = by[r.id];
      if (!b) {
        err(other.file, other.rows[0].line, "Award catalog missing id " + r.id);
        return;
      }
      ["name", "nameEs", "why", "whyEs"].forEach((f) => {
        if ((r[f] || "") !== (b[f] || "")) {
          err(other.file, b.line, "Award " + r.id + " field " + f + " does not match game.js");
        }
      });
    });
  });
  base.rows.forEach((r) => {
    if (r.name != null && r.nameEs != null) {
      pairProblem(base.file, r.line, "award." + r.id + ".name", { k: "str", v: r.name, line: r.line }, { k: "str", v: r.nameEs, line: r.line });
    }
    if (r.why != null && r.whyEs != null) {
      pairProblem(base.file, r.line, "award." + r.id + ".why", { k: "str", v: r.why, line: r.line }, { k: "str", v: r.whyEs, line: r.line });
    }
  });
}

function extractScripts(html) {
  const out = [];
  const re = /<script\b([^>]*)>([\s\S]*?)<\/script>/gi;
  let m;
  while ((m = re.exec(html))) {
    if (/\ssrc\s*=/i.test(m[1]) && !m[2].trim()) continue;
    const line = html.slice(0, m.index).split("\n").length;
    out.push({ code: m[2], line });
  }
  return out;
}

function htmlText(html) {
  return html
    .replace(/<script\b[\s\S]*?<\/script>/gi, " ")
    .replace(/<style\b[\s\S]*?<\/style>/gi, " ")
    .replace(/<[^>]+>/g, " ");
}

function main() {
  const stats = {
    files: 0,
    pairs: 0,
    ternaries: 0,
    sayPairs: 0,
    tCalls: [],
    attrKeys: [],
    captions: [],
    pools: [],
    captionRes: [],
    aiRes: [],
    ai: null,
    catalogs: [],
    dict: null,
    tui: null,
    voice: null
  };

  FILES.forEach((rel) => {
    const abs = path.join(ROOT, rel);
    if (!fs.existsSync(abs)) {
      err(rel, 1, "Missing file");
      return;
    }
    const src = fs.readFileSync(abs, "utf8");
    if (rel.endsWith(".html")) {
      voseoScan(rel, 1, htmlText(src));
      const attr = /data-i18n(?:-html|-aria)?="([^"]+)"/g;
      let m;
      while ((m = attr.exec(src))) {
        stats.attrKeys.push({ file: rel, line: src.slice(0, m.index).split("\n").length, key: m[1] });
      }
      extractScripts(src).forEach((block) => {
        const padded = "\n".repeat(block.line - 1) + block.code;
        analyzeJs(rel, padded, stats);
      });
      src.split("\n").forEach((ln, idx) => {
        if (/TODO_REPLACE|lorem ipsum|<insert here|\bPLACEHOLDER\b/.test(ln)) err(rel, idx + 1, "Filler marker in source");
      });
    } else {
      analyzeJs(rel, src, stats);
      rebuildDict(rel, src, stats);
    }
  });

  /* analyzeJs also tries to fill dict via objMap, which is incomplete.
     rebuildDict is the source of truth for dict, T_UI and VOICE_ES. */
  if (stats.dict) {
    const enKeys = Object.keys(stats.dict.en);
    const esKeys = Object.keys(stats.dict.es);
    enKeys.forEach((k) => {
      if (!stats.dict.es[k]) err("i18n.js", stats.dict.en[k].line, "dict.es missing " + k);
    });
    esKeys.forEach((k) => {
      if (!stats.dict.en[k]) err("i18n.js", stats.dict.es[k].line, "dict.en missing " + k);
    });
    enKeys.forEach((k) => {
      if (!stats.dict.es[k]) return;
      pairProblem("i18n.js", stats.dict.en[k].line, "dict." + k,
        { k: "str", v: stats.dict.en[k].text, line: stats.dict.en[k].line },
        { k: "str", v: stats.dict.es[k].text, line: stats.dict.es[k].line });
    });
    if (enKeys.length < 267) err("i18n.js", 1, "Parsed " + enKeys.length + " EN keys; expected at least 267");
  }
  if (stats.voice) {
    Object.keys(stats.voice).forEach((k) => {
      pairProblem("game.js", stats.voice[k].line, "VOICE_ES",
        { k: "str", v: k, line: stats.voice[k].line },
        { k: "str", v: stats.voice[k].es, line: stats.voice[k].line });
    });
  }
  if (stats.ai) {
    Object.keys(stats.ai).forEach((k) => {
      pairProblem("game.js", stats.ai[k].line, "AI_ES",
        { k: "str", v: k, line: stats.ai[k].line },
        { k: "str", v: stats.ai[k].es, line: stats.ai[k].line });
    });
  }

  structural(stats);
  checkKeys(stats);
  checkCaptions(stats);
  checkCatalogs(stats);

  /* Duplicate dict pairing: analyzeJs currently records dict pairs only when
     values are plain strings on the outer object, which they are not.
     rebuildDict above is the one that emits dict pairs. */

  const enN = stats.dict ? Object.keys(stats.dict.en).length : 0;
  const esN = stats.dict ? Object.keys(stats.dict.es).length : 0;
  const tuiN = stats.tui ? Object.keys(stats.tui).length : 0;

  seenExcept.forEach((v) => exceptions.push(v));
  exceptions.sort((a, b) => a.text.localeCompare(b.text));

  const unjust = warnings.filter((w) => !w.justify);
  const lines = [];
  lines.push("# i18n audit");
  lines.push("");
  lines.push("Generated by `node tools/i18n-audit.js`.");
  lines.push("");
  lines.push("## Summary");
  lines.push("");
  lines.push("- dict keys: " + enN + " EN / " + esN + " ES");
  lines.push("- T_UI keys: " + tuiN);
  lines.push("- voice captions: " + (stats.voice ? Object.keys(stats.voice).length : 0));
  lines.push("- caption patterns: " + stats.captionRes.length);
  lines.push("- object and call pairs: " + stats.pairs);
  lines.push("- story say() pairs: " + stats.sayPairs);
  lines.push("- language ternaries: " + stats.ternaries);
  lines.push("- t() / data-i18n lookups: " + (stats.tCalls.length + stats.attrKeys.length));
  lines.push("- errors: " + errors.length);
  lines.push("- warnings: " + unjust.length);
  lines.push("- exceptions: " + exceptions.length);
  lines.push("");
  lines.push("## Errors");
  lines.push("");
  if (!errors.length) lines.push("None.");
  else errors.forEach((e) => lines.push("- `" + e.file + ":" + e.line + "` " + e.msg));
  lines.push("");
  lines.push("## Warnings");
  lines.push("");
  if (!unjust.length) lines.push("None.");
  else unjust.forEach((w) => lines.push("- `" + w.file + ":" + w.line + "` " + w.msg));
  lines.push("");
  lines.push("## Exceptions");
  lines.push("");
  lines.push("These strings are the same in English and Spanish on purpose.");
  lines.push("");
  if (!exceptions.length) lines.push("None.");
  else {
    lines.push("| Text | Reason | Uses |");
    lines.push("| --- | --- | --- |");
    exceptions.forEach((ex) => {
      const text = ex.text.replace(/\|/g, "\\|").replace(/\n/g, " ");
      lines.push("| " + text + " | " + ex.reason + " | " + ex.n + " |");
    });
  }
  lines.push("");
  lines.push("## Notes");
  lines.push("");
  if (!notes.length) lines.push("None.");
  else notes.forEach((n) => lines.push("- " + n));
  lines.push("");
  lines.push("## Hot language switch");
  lines.push("");
  lines.push("On the game page, `bz-lang` calls `BZ.apply` (so `[data-i18n]` and `[data-i18n-aria]` update), then `renderOverlay`, `renderHud`, and `renderBitcoinCountry`. The ready menu, perk picker, pause menu, and versus lobby are rebuilt. A static arc card re-reads `body` / `bodyEs` on that rebuild. Cards whose body was filled when the card was dealt stay in that language until the next card: a job card, a chess card (`input === \"move\"` or id `chess`), and ids `anOffer`, `ambassador`, `firstBloc`, `rearmament`, `threeColors`, `blocReplies`, `blocAssault`, `battleWon`, and `blocTriumph`. The pause button aria-label is set in `renderHud` from `t(\"ariaPlay\")` / `t(\"ariaPause\")`. The HUD caption changes on the next `say()`; the line already on screen stays until then. An award toast that is already visible keeps the language it opened in (about 3 seconds). An auth error returned by the server stays as the server sent it. `chart.html` and `profile/index.html` listen for `bz-lang` on that same document and refresh the document title. `about/index.html` updates any `data-i18n` node if `setLang` runs there. `u/index.html` paints its headings, the missing-player lines, and owned awards from the language at load. A switch on the game page does not rewrite any other document until that document loads again.");
  lines.push("");
  lines.push("## Voseo");
  lines.push("");
  lines.push("The scan uses Unicode letter boundaries on every extracted string and on HTML text. It looks for vos, sos, vosotros, podés, tenés, querés, sabés, hacés, decís, venís, andá, decime, fijate, poné, vení, salí, tené, acordate, mirá, hacé, llegá, esperá, tocá, jugá, seguí, probá, decí, and elegí (not the standard preterite \"yo elegí\"). A hit is an error above. Infinitives such as poner + te + los do not match.");
  lines.push("");
  lines.push("## What this does not prove");
  lines.push("");
  lines.push("Layout at 390 px is checked in the browser, not here. Speech stays English on purpose; this report checks the visible caption. Identical glossary terms are listed as exceptions, not as translations.");
  lines.push("");

  fs.mkdirSync(path.dirname(OUT), { recursive: true });
  fs.writeFileSync(OUT, lines.join("\n"));

  const summary = "errors=" + errors.length + " warnings=" + unjust.length + " dict=" + enN + "/" + esN + " tui=" + tuiN + " pairs=" + stats.pairs + " say=" + stats.sayPairs + " tern=" + stats.ternaries + " voice=" + (stats.voice ? Object.keys(stats.voice).length : 0);
  console.log(summary);
  if (errors.length || unjust.length) process.exit(1);
}

main();
