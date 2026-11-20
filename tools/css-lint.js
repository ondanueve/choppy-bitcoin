#!/usr/bin/env node
"use strict";

// CSS structure lint. No dependencies, no network.
//
// Checks style.css and every inline <style> block in the HTML pages for
// syntax errors that browsers forgive silently:
//   - a block that is opened and never closed (the rest of the file ends
//     up inside it),
//   - a stray "}" with no open block,
//   - an unterminated comment or string,
//   - a selector rule opened inside another selector rule. The site does
//     not use CSS nesting, so this almost always means a missing "}" above.
//     Rules inside @media, @supports, @layer, @container and @document are
//     fine; @keyframes steps ("from", "to", "50%") are fine.
//
// Usage: node tools/css-lint.js [file ...]
// Exit code 1 on the first file with an error, after listing all errors.

const fs = require("fs");
const path = require("path");

const ROOT = path.resolve(__dirname, "..");
const DEFAULT_FILES = ["style.css", "index.html", "about/index.html", "chart.html", "profile/index.html", "u/index.html"];
const GROUP_AT_RULES = /^@(media|supports|layer|container|document|scope|starting-style)\b/i;
const KEYFRAMES = /^@(-webkit-|-moz-)?keyframes\b/i;

function lineOf(text, idx) {
  let n = 1;
  for (let i = 0; i < idx && i < text.length; i++) if (text.charCodeAt(i) === 10) n++;
  return n;
}

// Lints one CSS source. `base` is the 1-based line where the source starts
// in its file, so inline <style> errors point at the right HTML line.
function lintCss(css, base) {
  const errors = [];
  const stack = []; // { kind: "group" | "keyframes" | "rule" | "other", line, head }
  let head = ""; // text since the last ";", "{" or "}"
  let headStart = 0;
  const at = (i) => base + lineOf(css, i) - 1;
  let i = 0;
  while (i < css.length) {
    const c = css[i];
    if (c === "/" && css[i + 1] === "*") {
      const end = css.indexOf("*/", i + 2);
      if (end < 0) {
        errors.push("line " + at(i) + ": comment is never closed");
        break;
      }
      i = end + 2;
      continue;
    }
    if (c === "\\") {
      head += css.slice(i, i + 2);
      i += 2;
      continue;
    }
    if (c === "\"" || c === "'") {
      let j = i + 1;
      while (j < css.length && css[j] !== c) {
        if (css[j] === "\\") j++;
        else if (css[j] === "\n") break;
        j++;
      }
      if (j >= css.length || css[j] !== c) {
        errors.push("line " + at(i) + ": string is never closed");
        i = j;
        continue;
      }
      head += css.slice(i, j + 1);
      i = j + 1;
      continue;
    }
    if (c === "{") {
      const h = head.trim();
      const parent = stack.length ? stack[stack.length - 1] : null;
      let kind = "other";
      if (h[0] === "@") kind = GROUP_AT_RULES.test(h) ? "group" : KEYFRAMES.test(h) ? "keyframes" : "other";
      else if (!parent || parent.kind === "group") kind = "rule";
      else if (parent.kind === "keyframes") kind = "step";
      else if (parent.kind === "rule") {
        errors.push("line " + at(headStart) + ": rule \"" + h.replace(/\s+/g, " ").slice(0, 60)
          + "\" is nested inside \"" + parent.head + "\" (line " + parent.line + "). Missing \"}\"?");
        kind = "rule";
      }
      stack.push({ kind, line: at(headStart), head: h.replace(/\s+/g, " ").slice(0, 60) });
      head = "";
      headStart = i + 1;
      i++;
      continue;
    }
    if (c === "}") {
      if (!stack.length) errors.push("line " + at(i) + ": \"}\" closes nothing");
      else stack.pop();
      head = "";
      headStart = i + 1;
      i++;
      continue;
    }
    if (c === ";") {
      head = "";
      headStart = i + 1;
      i++;
      continue;
    }
    if (!head.trim()) headStart = i;
    head += c;
    i++;
  }
  for (const open of stack) {
    errors.push("line " + open.line + ": block \"" + open.head + "\" is never closed");
  }
  return errors;
}

function lintFile(rel) {
  const abs = path.resolve(ROOT, rel);
  const text = fs.readFileSync(abs, "utf8");
  if (!/\.html?$/i.test(abs)) return lintCss(text, 1);
  const errors = [];
  const re = /<style\b[^>]*>([\s\S]*?)<\/style>/gi;
  let m;
  while ((m = re.exec(text))) {
    const start = m.index + m[0].indexOf(">") + 1;
    errors.push(...lintCss(m[1], lineOf(text, start)));
  }
  return errors;
}

function main() {
  const files = process.argv.slice(2).length ? process.argv.slice(2) : DEFAULT_FILES;
  let failed = 0;
  for (const f of files) {
    const errors = lintFile(f);
    if (errors.length) {
      failed++;
      for (const e of errors) console.error("FAIL css-lint " + f + " " + e);
    }
  }
  if (failed) {
    console.error("css-lint: " + failed + " file(s) with errors");
    process.exit(1);
  }
  console.log("css-lint: ok (" + files.length + " files)");
}

if (require.main === module) main();
module.exports = { lintCss };
