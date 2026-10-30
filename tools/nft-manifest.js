#!/usr/bin/env node
"use strict";

// Reads AWARD_CATALOG from game.js and docs/nft/award-art-map.csv.
// Writes docs/nft/manifest.json: unsigned NIP-58 examples and ordinal metadata.
// No network, no dependencies, no signatures.

const crypto = require("crypto");
const fs = require("fs");
const path = require("path");

const ROOT = path.resolve(__dirname, "..");
const GAME = path.join(ROOT, "game.js");
const CSV_PATH = path.join(ROOT, "docs/nft/award-art-map.csv");
const MD_PATH = path.join(ROOT, "docs/nft/award-art-map.md");
const OUT_PATH = path.join(ROOT, "docs/nft/manifest.json");

const RARITY = new Set(["comun", "poco-comun", "rara", "epica", "legendaria"]);
const ELIGIBILITY = new Set(["ok", "excluida", "requiere arte nuevo"]);
const VINTAGE_RE = /^art-archive\/choppy\/replaced-mp\d+\/[^/]+\.jpg$/;
const BANNED_EXACT = new Set([
  "art-archive/choppy/anoffer-mp189/anOffer-b-wide.replaced-mp189.jpg"
]);
const SAFE_RELAY_BYTES = 390000;
const DERIVATIVE_MAX = 61440;
const HIDDEN = "Hidden award. / Premio oculto.";

function die(msg) {
  const err = new Error(msg);
  err.nft = true;
  throw err;
}

function findHub() {
  if (process.env.HUB_ART && fs.existsSync(process.env.HUB_ART)) return process.env.HUB_ART;
  if (fs.existsSync("/tmp/hub/art-archive/choppy")) return "/tmp/hub";
  return null;
}

function parseCatalog(src) {
  const start = src.indexOf("const AWARD_CATALOG = [");
  if (start < 0) die("AWARD_CATALOG not found");
  const end = src.indexOf("\n  ];", start);
  if (end < 0) die("AWARD_CATALOG end not found");
  const block = src.slice(start, end);
  const re = /\{\s*id:\s*"([^"]+)"\s*,\s*cat:\s*"([^"]+)"\s*(?:,\s*secret:\s*true)?\s*,\s*name:\s*"((?:\\.|[^"\\])*)"\s*,\s*nameEs:\s*"((?:\\.|[^"\\])*)"\s*,\s*why:\s*"((?:\\.|[^"\\])*)"\s*,\s*whyEs:\s*"((?:\\.|[^"\\])*)"\s*\}/g;
  const rows = [];
  let m;
  while ((m = re.exec(block))) {
    rows.push({
      id: m[1],
      cat: m[2],
      secret: /secret:\s*true/.test(m[0]),
      name: JSON.parse('"' + m[3] + '"'),
      nameEs: JSON.parse('"' + m[4] + '"'),
      why: JSON.parse('"' + m[5] + '"'),
      whyEs: JSON.parse('"' + m[6] + '"')
    });
  }
  if (rows.length !== 46) die("catalog count " + rows.length);
  return rows;
}

function parseCsv(text) {
  const rows = [];
  let i = 0;
  const len = text.length;
  function parseRow() {
    const fields = [];
    let cur = "";
    let quoted = false;
    if (i >= len) return null;
    while (i < len) {
      const c = text[i];
      if (quoted) {
        if (c === '"') {
          if (text[i + 1] === '"') {
            cur += '"';
            i += 2;
            continue;
          }
          quoted = false;
          i += 1;
          continue;
        }
        cur += c;
        i += 1;
        continue;
      }
      if (c === '"') {
        quoted = true;
        i += 1;
        continue;
      }
      if (c === ",") {
        fields.push(cur);
        cur = "";
        i += 1;
        continue;
      }
      if (c === "\n" || c === "\r") {
        if (c === "\r" && text[i + 1] === "\n") i += 1;
        i += 1;
        fields.push(cur);
        return fields;
      }
      cur += c;
      i += 1;
    }
    fields.push(cur);
    return fields;
  }
  const header = parseRow();
  if (!header) die("empty csv");
  const expect = [
    "award_id", "category", "secret", "art_current", "art_justification",
    "art_vintage", "rarity", "eligibility", "lena_check", "notes"
  ];
  if (header.join(",") !== expect.join(",")) die("csv header");
  for (;;) {
    const fields = parseRow();
    if (!fields) break;
    if (fields.length === 1 && fields[0] === "") continue;
    if (fields.length !== expect.length) die("csv width " + fields.length + " for " + fields[0]);
    const row = {};
    expect.forEach(function (key, idx) { row[key] = fields[idx]; });
    rows.push(row);
  }
  return rows;
}

function splitVintage(value) {
  if (!value) return [];
  return value.split(";").map(function (part) { return part.trim(); }).filter(Boolean);
}

function jpegInfo(buf) {
  if (buf.length < 4 || buf[0] !== 0xff || buf[1] !== 0xd8) return null;
  let i = 2;
  while (i < buf.length - 8) {
    if (buf[i] !== 0xff) {
      i += 1;
      continue;
    }
    const marker = buf[i + 1];
    if (marker === 0xc0 || marker === 0xc1 || marker === 0xc2) {
      return {
        width: buf.readUInt16BE(i + 7),
        height: buf.readUInt16BE(i + 5),
        bytes: buf.length
      };
    }
    if (marker === 0xd8 || marker === 0xd9 || (marker >= 0xd0 && marker <= 0xd7)) {
      i += 2;
      continue;
    }
    const len = buf.readUInt16BE(i + 2);
    if (len < 2) return null;
    i += 2 + len;
  }
  return null;
}

function vet(row, issuable) {
  const paths = [row.art_current].concat(splitVintage(row.art_vintage));
  paths.forEach(function (rel) {
    if (!rel) return;
    if (/unclemike/i.test(rel)) die("excluded art assigned: " + row.award_id + " " + rel);
    if (BANNED_EXACT.has(rel)) die("lena vintage banned: " + rel);
  });
  if (row.eligibility === "excluida" && issuable) {
    die("excluded row marked issuable: " + row.award_id);
  }
  if (row.category === "country" && row.lena_check === "si" && row.eligibility === "ok") {
    die("lena on country award: " + row.award_id);
  }
}

function assertThrows(fn, label) {
  let threw = false;
  try { fn(); } catch (err) { threw = true; }
  if (!threw) die("self-test did not fail: " + label);
}

function selfTest() {
  assertThrows(function () {
    vet({
      award_id: "maxi",
      category: "trading",
      eligibility: "ok",
      lena_check: "n/a",
      art_current: "chance/unclemike-wide.jpg",
      art_vintage: ""
    }, true);
  }, "unclemike");
  assertThrows(function () {
    vet({
      award_id: "landowner",
      category: "country",
      eligibility: "ok",
      lena_check: "si",
      art_current: "chance/islandInspection-a-wide.jpg",
      art_vintage: ""
    }, true);
  }, "lena-on-country");
  assertThrows(function () {
    vet({
      award_id: "maxi",
      category: "trading",
      eligibility: "excluida",
      lena_check: "n/a",
      art_current: "",
      art_vintage: ""
    }, true);
  }, "excluida-as-issuable");
  assertThrows(function () {
    vet({
      award_id: "notForSale",
      category: "country",
      eligibility: "ok",
      lena_check: "no",
      art_current: "chance/anOffer-b-wide.jpg",
      art_vintage: "art-archive/choppy/anoffer-mp189/anOffer-b-wide.replaced-mp189.jpg"
    }, true);
  }, "mp189-lena");
}

function checkMap(catalog, rows, md, hub) {
  if (rows.length !== 46) die("csv count " + rows.length);
  const byId = new Map();
  rows.forEach(function (row) {
    if (byId.has(row.award_id)) die("duplicate " + row.award_id);
    byId.set(row.award_id, row);
  });
  catalog.forEach(function (award) {
    const row = byId.get(award.id);
    if (!row) die("missing row " + award.id);
    if (row.category !== award.cat) die("category " + award.id);
    const secret = row.secret === "true";
    if (secret !== award.secret) die("secret flag " + award.id);
    if (!ELIGIBILITY.has(row.eligibility)) die("eligibility " + award.id);
    if (!RARITY.has(row.rarity)) die("rarity " + award.id);
    if (row.lena_check !== "no" && row.lena_check !== "n/a" && row.lena_check !== "si") {
      die("lena_check " + award.id);
    }
    if (row.category === "country" && row.eligibility === "ok" && row.lena_check !== "no") {
      die("country ok without a negative lena check: " + award.id);
    }
    if (!md.includes("`" + award.id + "`")) die("md missing " + award.id);
    const issuable = row.eligibility === "ok";
    vet(row, issuable);
    if (issuable && !row.art_current) die("ok without art " + award.id);
    if (row.eligibility === "requiere arte nuevo" && row.art_current) {
      die("new-art row has a current file " + award.id);
    }
    if (row.art_current) {
      if (!/^chance\/[^/]+\.jpg$/.test(row.art_current)) die("current path " + row.art_current);
      const abs = path.join(ROOT, row.art_current);
      if (!fs.existsSync(abs)) die("missing current " + row.art_current);
    }
    splitVintage(row.art_vintage).forEach(function (rel) {
      if (!VINTAGE_RE.test(rel)) die("vintage path not an archived edition: " + rel);
      if (hub) {
        const abs = path.join(hub, rel);
        if (!fs.existsSync(abs)) die("missing vintage " + rel);
      }
    });
  });
  if (!hub) {
    process.stderr.write("hub archive not found; vintage files were not opened on disk\n");
  }
}

function publicName(award) {
  if (award.secret) return "???";
  return award.name + " / " + award.nameEs;
}

function publicDescription(award) {
  if (award.secret) return HIDDEN;
  return award.why + " / " + award.whyEs;
}

function unsignedEvent(kind, tags) {
  return {
    unsigned: true,
    signed: false,
    broadcast: false,
    pubkey: "",
    issuer_pubkey_field: "ISSUER_PUBKEY",
    kind: kind,
    created_at: 0,
    tags: tags,
    content: "",
    id: "",
    sig: ""
  };
}

function buildAward(award, row) {
  const issuable = row.eligibility === "ok";
  const dTag = "choppy-" + award.id;
  const vintage = splitVintage(row.art_vintage);
  let image = null;
  if (issuable) {
    const abs = path.join(ROOT, row.art_current);
    const buf = fs.readFileSync(abs);
    const info = jpegInfo(buf);
    if (!info) die("not a jpeg " + row.art_current);
    if (info.width !== 1920 || info.height !== 800) die("dimensions " + row.art_current);
    image = {
      path: row.art_current,
      url: "https://bitcoinizate.com/choppy-bitcoin/" + row.art_current,
      width: info.width,
      height: info.height,
      bytes: info.bytes,
      sha256: crypto.createHash("sha256").update(buf).digest("hex"),
      raw_jpeg_exceeds_safe_relay_budget: info.bytes >= SAFE_RELAY_BYTES
    };
  }
  const derivative = issuable ? {
    url: "https://bitcoinizate.com/choppy-bitcoin/nft/" + award.id + "-960.webp",
    width: 960,
    height: 400,
    max_bytes: DERIVATIVE_MAX,
    content_type: "image/webp",
    built: false
  } : null;
  const tags = [
    ["d", dTag],
    ["name", publicName(award)],
    ["description", publicDescription(award)]
  ];
  if (image && !award.secret) tags.push(["image", image.url, image.width + "x" + image.height]);
  const definition = unsignedEvent(30009, tags);
  if (award.secret && image) definition.image_omitted_until_earned = true;
  definition.d_tag_policy = award.secret
    ? "example only; replace with an opaque d before any relay write"
    : "stable example d; freeze the image url after publication";
  const awardEvent = unsignedEvent(8, [
    ["a", "30009:ISSUER_PUBKEY:" + dTag],
    ["p", "PLAYER_PUBKEY"]
  ]);
  awardEvent.player_pubkey_field = "PLAYER_PUBKEY";
  return {
    award_id: award.id,
    category: award.cat,
    secret: award.secret,
    rarity: row.rarity,
    eligibility: row.eligibility,
    issuable: issuable,
    lena_check: row.lena_check,
    edition: issuable ? "actual" : null,
    art_vintage: vintage,
    image: image,
    derivative: derivative,
    nip58_definition: definition,
    nip58_award: awardEvent,
    ordinal: {
      inscribed: false,
      player_pays: true,
      project_pays: false,
      content_type: derivative ? derivative.content_type : null,
      file_url: derivative ? derivative.url : null,
      file_built: false,
      metadata_tag: 5,
      properties_tag: 17,
      metadata: {
        name: publicName(award),
        description: publicDescription(award),
        award_id: award.id,
        edition: issuable ? "actual" : null,
        collection: "Choppy Bitcoin"
      }
    }
  };
}

function assertNoSecretLeak(catalog, json) {
  catalog.forEach(function (award) {
    if (!award.secret) return;
    [award.name, award.nameEs, award.why, award.whyEs].forEach(function (text) {
      if (text && json.includes(text)) die("secret text leaked for " + award.id);
    });
  });
}

function main() {
  selfTest();
  const catalog = parseCatalog(fs.readFileSync(GAME, "utf8"));
  const rows = parseCsv(fs.readFileSync(CSV_PATH, "utf8"));
  const md = fs.readFileSync(MD_PATH, "utf8");
  const hub = findHub();
  checkMap(catalog, rows, md, hub);
  const byId = new Map(rows.map(function (row) { return [row.award_id, row]; }));
  const awards = catalog.map(function (award) { return buildAward(award, byId.get(award.id)); });
  const manifest = {
    generated_by: "tools/nft-manifest.js",
    phase: 1,
    unsigned: true,
    signed: false,
    broadcast: false,
    on_chain: false,
    issuer_pubkey_field: "ISSUER_PUBKEY",
    player_pubkey_field: "PLAYER_PUBKEY",
    nip58: {
      source: "https://github.com/nostr-protocol/nips/blob/master/58.md",
      badge_definition_kind: 30009,
      badge_award_kind: 8,
      profile_badges_kind: 10008,
      badge_set_kind: 30008,
      profile_badges_example: unsignedEvent(10008, [
        ["a", "30009:ISSUER_PUBKEY:choppy-maxi"],
        ["e", "AWARD_EVENT_ID"],
        ["a", "30009:ISSUER_PUBKEY:choppy-nocoiner"],
        ["e", "AWARD_EVENT_ID"]
      ])
    },
    ordinals: {
      source: "https://docs.ordinals.com/inscriptions.html",
      metadata_tag: 5,
      properties_tag: 17,
      push_max_bytes: 520,
      standard_relay_weight_units: 400000,
      safe_content_bytes: SAFE_RELAY_BYTES,
      derivative_max_bytes: DERIVATIVE_MAX,
      fee_is_a_quote: false
    },
    counts: {
      awards: awards.length,
      ok: awards.filter(function (a) { return a.eligibility === "ok"; }).length,
      new_art: awards.filter(function (a) { return a.eligibility === "requiere arte nuevo"; }).length,
      excluded: awards.filter(function (a) { return a.eligibility === "excluida"; }).length,
      issuable: awards.filter(function (a) { return a.issuable; }).length
    },
    awards: awards
  };
  awards.forEach(function (award) {
    if (!award.secret) return;
    const tags = award.nip58_definition.tags;
    if (tags.some(function (tag) { return tag[0] === "image" || tag[0] === "thumb"; })) {
      die("secret definition carries an image tag: " + award.award_id);
    }
  });
  const json = JSON.stringify(manifest, null, 2) + "\n";
  assertNoSecretLeak(catalog, json);
  if (json.includes("unclemike")) die("banned filename in manifest");
  fs.writeFileSync(OUT_PATH, json);
  process.stdout.write(
    "self-test ok\n" +
    "awards " + manifest.counts.awards +
    " ok " + manifest.counts.ok +
    " new " + manifest.counts.new_art +
    " excluded " + manifest.counts.excluded +
    " issuable " + manifest.counts.issuable + "\n" +
    OUT_PATH + "\n"
  );
}

main();
