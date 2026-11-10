/* Result card for sharing. Lazy-loaded from game.js; not part of startup JS. */
(function (root) {
  "use strict";

  var W = 1200;
  var H = 630;

  function tapeValues(tape) {
    var out = [];
    if (!tape || !tape.length) return out;
    for (var i = 0; i < tape.length; i++) {
      var v = tape[i];
      var n = typeof v === "number" ? v : (v && (v.price || v.p || v.y));
      if (typeof n === "number" && isFinite(n)) out.push(n);
    }
    return out;
  }

  function drawSpark(ctx, vals, x, y, w, h) {
    if (!vals.length) return;
    var min = vals[0], max = vals[0];
    for (var i = 1; i < vals.length; i++) {
      if (vals[i] < min) min = vals[i];
      if (vals[i] > max) max = vals[i];
    }
    var span = max - min || 1;
    ctx.save();
    ctx.beginPath();
    ctx.rect(x, y, w, h);
    ctx.clip();
    ctx.beginPath();
    for (var j = 0; j < vals.length; j++) {
      var px = x + (j / Math.max(1, vals.length - 1)) * w;
      var py = y + h - ((vals[j] - min) / span) * h;
      if (j === 0) ctx.moveTo(px, py);
      else ctx.lineTo(px, py);
    }
    var up = vals[vals.length - 1] >= vals[0];
    ctx.strokeStyle = up ? "#3ecf8e" : "#e85d5d";
    ctx.lineWidth = 4;
    ctx.lineJoin = "round";
    ctx.lineCap = "round";
    ctx.stroke();
    ctx.restore();
  }

  function fillRound(ctx, x, y, w, h, r) {
    var rr = Math.min(r, w / 2, h / 2);
    ctx.beginPath();
    ctx.moveTo(x + rr, y);
    ctx.arcTo(x + w, y, x + w, y + h, rr);
    ctx.arcTo(x + w, y + h, x, y + h, rr);
    ctx.arcTo(x, y + h, x, y, rr);
    ctx.arcTo(x, y, x + w, y, rr);
    ctx.closePath();
    ctx.fill();
  }

  function renderToCanvas(data, canvas) {
    var d = data || {};
    var c = canvas || (root.document && root.document.createElement("canvas"));
    if (!c) return null;
    c.width = W;
    c.height = H;
    var ctx = c.getContext("2d");
    if (!ctx) return null;

    var bg = ctx.createLinearGradient(0, 0, 0, H);
    bg.addColorStop(0, "#16140e");
    bg.addColorStop(0.5, "#0a0a0c");
    bg.addColorStop(1, "#070708");
    ctx.fillStyle = bg;
    ctx.fillRect(0, 0, W, H);

    var glow = ctx.createRadialGradient(W * 0.5, -40, 20, W * 0.5, 80, 520);
    glow.addColorStop(0, "rgba(200,150,10,0.22)");
    glow.addColorStop(1, "rgba(200,150,10,0)");
    ctx.fillStyle = glow;
    ctx.fillRect(0, 0, W, H);

    ctx.fillStyle = "#c8960a";
    ctx.font = "700 28px 'Segoe UI', Helvetica, sans-serif";
    ctx.textAlign = "left";
    ctx.fillText("Choppy Bitcoin", 72, 78);

    ctx.fillStyle = "rgba(255,255,255,0.55)";
    ctx.font = "600 22px 'Segoe UI', Helvetica, sans-serif";
    ctx.textAlign = "right";
    ctx.fillText(d.kicker || "", W - 72, 78);

    ctx.fillStyle = "#f3f0e7";
    ctx.font = "700 120px 'Segoe UI', Helvetica, sans-serif";
    ctx.textAlign = "left";
    ctx.fillText(d.bag || "", 72, 230);

    ctx.fillStyle = d.tone === "win" ? "#3ecf8e" : "#e85d5d";
    ctx.font = "700 32px 'Segoe UI', Helvetica, sans-serif";
    ctx.fillText(d.headline || "", 72, 286);

    ctx.fillStyle = "rgba(255,255,255,0.06)";
    fillRound(ctx, 72, 330, W - 144, 200, 18);
    var vals = tapeValues(d.tape);
    if (vals.length > 1) {
      drawSpark(ctx, vals, 100, 354, W - 200, 152);
    } else {
      ctx.fillStyle = "rgba(255,255,255,0.35)";
      ctx.font = "600 22px 'Segoe UI', Helvetica, sans-serif";
      ctx.textAlign = "center";
      ctx.fillText(d.emptyChart || "", W / 2, 440);
    }

    ctx.fillStyle = "rgba(255,255,255,0.45)";
    ctx.font = "600 22px 'Segoe UI', Helvetica, sans-serif";
    ctx.textAlign = "left";
    ctx.fillText(d.url || "bitcoinizate.com/choppy-bitcoin/", 72, 580);
    return c;
  }

  function canvasToBlob(canvas) {
    return new Promise(function (resolve, reject) {
      if (!canvas) { reject(new Error("no canvas")); return; }
      if (typeof canvas.toBlob === "function") {
        canvas.toBlob(function (blob) {
          if (blob) resolve(blob);
          else reject(new Error("empty image"));
        }, "image/png");
        return;
      }
      try {
        var data = canvas.toDataURL("image/png");
        var bin = root.atob(data.split(",")[1]);
        var arr = new Uint8Array(bin.length);
        for (var i = 0; i < bin.length; i++) arr[i] = bin.charCodeAt(i);
        resolve(new Blob([arr], { type: "image/png" }));
      } catch (e) {
        reject(e);
      }
    });
  }

  function renderShareCard(data) {
    var canvas = renderToCanvas(data);
    if (!canvas) return Promise.reject(new Error("no canvas"));
    return canvasToBlob(canvas);
  }

  root.choppyRenderShareCard = renderShareCard;
  root.choppyDrawShareCard = renderToCanvas;
})(typeof window !== "undefined" ? window : typeof globalThis !== "undefined" ? globalThis : this);
