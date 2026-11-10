/* Shared donation endpoints for the game and the about page.
   LIGHTNING_ADDRESS must be a Lightning Address (name@domain) or an LNURL.
   Leave it empty to hide the Lightning button. Do not invent an address. */
(function (root) {
  "use strict";

  var LIGHTNING_ADDRESS = "";
  var BITCOIN_ADDRESS = "bc1q5yrmsvdh3m7ad03txs2h5ktw5zzdxwxrgeujsj0e25s83cffzauq4vgjez";

  function trim(s) {
    return String(s == null ? "" : s).trim();
  }
  function isLightningAddress(s) {
    return /^[a-zA-Z0-9._+-]{1,64}@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}$/.test(s);
  }
  function isLnurl(s) {
    return /^lnurl1[0-9a-z]+$/i.test(s);
  }
  function lightningHref(addr) {
    var a = trim(addr);
    if (isLightningAddress(a) || isLnurl(a)) return "lightning:" + a;
    return "";
  }
  function bitcoinHref(addr) {
    var a = trim(addr);
    if (/^(bc1|[13])[a-zA-HJ-NP-Z0-9]{25,90}$/i.test(a)) return "bitcoin:" + a;
    return "";
  }
  function escapeAttr(s) {
    return String(s)
      .replace(/&/g, "&amp;")
      .replace(/"/g, "&quot;")
      .replace(/</g, "&lt;")
      .replace(/>/g, "&gt;");
  }
  function linksHtml() {
    var ln = lightningHref(root.CHOPPY_LIGHTNING_ADDRESS);
    var btc = bitcoinHref(root.CHOPPY_BITCOIN_ADDRESS);
    var parts = [];
    if (ln) parts.push("<a href=\"" + escapeAttr(ln) + "\">Lightning</a>");
    if (btc) parts.push("<a href=\"" + escapeAttr(btc) + "\">Bitcoin</a>");
    return parts.join(" · ");
  }
  function fill(el) {
    if (!el) return;
    var html = linksHtml();
    if (html) el.innerHTML = html;
    else el.setAttribute("hidden", "");
  }

  root.CHOPPY_LIGHTNING_ADDRESS = LIGHTNING_ADDRESS;
  root.CHOPPY_BITCOIN_ADDRESS = BITCOIN_ADDRESS;
  root.choppyLightningHref = function () { return lightningHref(root.CHOPPY_LIGHTNING_ADDRESS); };
  root.choppyBitcoinHref = function () { return bitcoinHref(root.CHOPPY_BITCOIN_ADDRESS); };
  root.choppyDonateLinksHtml = linksHtml;
  root.choppyFillDonateLinks = fill;
})(typeof window !== "undefined" ? window : typeof globalThis !== "undefined" ? globalThis : this);
