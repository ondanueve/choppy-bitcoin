/* Halving rainbow: chart bands, surfing Choppy, and the chiptune.
   Loaded on demand by ensureHalving() in game.js. Not a startup script. */
(function () {
  "use strict";
  var root = typeof window !== "undefined" ? window : globalThis;

  var FADE_IN = 0.6;
  var FADE_OUT = 0.8;
  var BPM = 150;
  var STEP = 60 / BPM / 2;
  var LOOP = 128;
  var LOOK = 0.26;
  var SCALE = 2;
  var SPRITE = 32;
  var ANCHOR = 24;

  var BANDS = [
    { name: "deep red", hex: "#8E1A2F" },
    { name: "red-orange", hex: "#E03A1C" },
    { name: "orange", hex: "#F06E14" },
    { name: "yellow-orange", hex: "#F5A30C" },
    { name: "yellow", hex: "#F6DC12" },
    { name: "light green", hex: "#B6E04C" },
    { name: "green", hex: "#3CB44B" },
    { name: "teal-green", hex: "#149A84" },
    { name: "blue", hex: "#2A6FE0" }
  ];

  var DEG = [0, 293.66, 329.63, 392, 440, 493.88];
  var LEAD = "12345432134543212345543212354321";
  var PAD = [1, 5, 3, 4];

  var intensity = 0;
  var want = false;
  var boundA = null;
  var running = false;
  var heldJuke = false;
  var nextT = 0;
  var stepI = 0;
  var timer = null;

  var bandCanvas = null;
  var bandKey = "";
  var bandPad = 0;
  var frames = null;

  function tick(dt, active) {
    want = !!active;
    if (!(dt > 0)) return intensity;
    if (want) intensity = Math.min(1, intensity + dt / FADE_IN);
    else intensity = Math.max(0, intensity - dt / FADE_OUT);
    return intensity;
  }

  function reset() {
    want = false;
    intensity = 0;
    running = false;
    nextT = 0;
    stepI = 0;
    if (timer) {
      try { clearTimeout(timer); } catch (e) {}
      timer = null;
    }
    var A = boundA;
    if (A && A._halving && A._halving.hold) {
      try { A._halving.hold(false); } catch (e) {}
    }
    if (!heldJuke || !A) return;
    if (A._cueHeld) {
      heldJuke = false;
      A._resumeJuke = true;
      return;
    }
    releaseJuke(A);
  }

  function centerY(i, x, span, h) {
    var u = span > 0 ? x / span : 0;
    if (u < 0) u = 0;
    var mid = h * 0.72 - h * 0.30 * (Math.log(1 + u * 8) / Math.log(9));
    return mid + (i - 4) * h * 0.075;
  }

  function traceBand(g, i, cw, h, inset) {
    var bh = h * 0.086;
    var yAt = function (x) { return centerY(i, x, cw, h) + inset; };
    g.beginPath();
    g.moveTo(0, yAt(0) - bh * 0.5);
    var x;
    for (x = 4; x <= cw; x += 4) g.lineTo(x, yAt(x) - bh * 0.5);
    g.lineTo(cw, yAt(cw) + bh * 0.5);
    for (x = cw; x >= 0; x -= 4) g.lineTo(x, yAt(x) + bh * 0.5);
    g.closePath();
  }

  function buildBands(w, h) {
    if (typeof document === "undefined" || !document.createElement) return null;
    var pad = Math.round(w * 0.14);
    var cw = w + pad * 2;
    var c = document.createElement("canvas");
    c.width = cw;
    c.height = h;
    var g = c.getContext("2d");
    if (!g) return null;
    var i;
    for (i = 0; i < BANDS.length; i++) {
      traceBand(g, i, cw, h, 0);
      g.fillStyle = BANDS[i].hex;
      g.fill();
      traceBand(g, i, cw, h, -h * 0.018);
      g.fillStyle = "rgba(255,255,255,0.16)";
      g.fill();
    }
    bandCanvas = c;
    bandPad = pad;
    bandKey = w + "x" + h;
    return c;
  }

  function disc(g, cx, cy, r) {
    var y, half;
    for (y = -r; y <= r; y++) {
      half = Math.round(Math.sqrt(Math.max(0, r * r - y * y)));
      g.fillRect(cx - half, cy + y, half * 2 + 1, 1);
    }
  }

  var BTC = [".##.#.", "#.#.#.", "#.#.#.", ".##.#.", "#.#.#.", "#.#.#.", ".##.#."];

  function put(g, x, y) {
    if (x < 0 || y < 0 || x >= SPRITE || y >= SPRITE) return;
    g.fillRect(x, y, 1, 1);
  }

  function paintChoppy(g, frame) {
    g.clearRect(0, 0, SPRITE, SPRITE);
    var bob = [0, -1, 0, 1][frame & 3];
    var lean = [0, 1, 0, -1][frame & 3];
    var ox = lean;
    var oy = bob;
    var cx = 14 + ox;
    var cy = 12 + oy;
    var f = frame & 3;
    var curls = [
      [[24, 16], [25, 15], [26, 14], [27, 14], [28, 15], [29, 16], [29, 17], [28, 18], [27, 19], [26, 19], [25, 18], [26, 16], [27, 16], [27, 17]],
      [[24, 15], [25, 14], [26, 13], [27, 13], [28, 14], [29, 15], [29, 16], [28, 17], [27, 18], [26, 18], [25, 17], [26, 15], [27, 15], [27, 16]],
      [[24, 16], [25, 15], [26, 14], [27, 13], [28, 14], [29, 15], [30, 16], [29, 17], [28, 18], [27, 19], [26, 18], [26, 16], [27, 16], [28, 16]],
      [[24, 17], [25, 16], [26, 15], [27, 15], [28, 16], [29, 17], [29, 18], [28, 19], [27, 20], [26, 20], [25, 19], [26, 17], [27, 17], [27, 18]]
    ][f];
    var i, p, x, y, row, col, line;
    for (i = 0; i < curls.length; i++) {
      p = curls[i];
      g.fillStyle = i < 6 ? "#ffffff" : (i < 11 ? "#7ecee8" : "#409cc6");
      put(g, p[0] + ox, p[1] + oy);
    }
    var by = 22 + oy;
    for (x = 2 + ox; x < 25 + ox; x++) {
      g.fillStyle = (x >= 6 + ox && x <= 14 + ox) ? "#ffecc4" : "#ecb85c";
      put(g, x, by);
      g.fillStyle = "#ecb85c";
      put(g, x, by + 1);
      g.fillStyle = "#7a4612";
      put(g, x, by + 2);
      g.fillStyle = "#4a280a";
      put(g, x, by + 3);
    }
    var nose = [[25, 0], [26, 1], [27, 1], [28, 2]];
    for (i = 0; i < nose.length; i++) {
      x = nose[i][0] + ox;
      y = by - nose[i][1];
      g.fillStyle = "#ecb85c";
      put(g, x, y);
      g.fillStyle = "#7a4612";
      put(g, x, y + 1);
      g.fillStyle = "#4a280a";
      put(g, x, y + 2);
    }
    g.fillStyle = "#1a0c06";
    disc(g, cx + 1, cy + 1, 11);
    disc(g, cx, cy, 11);
    g.fillStyle = "#fff4d6";
    disc(g, cx, cy, 10);
    g.fillStyle = "#f2a900";
    disc(g, cx, cy, 9);
    g.fillStyle = "#b06c0c";
    for (y = -2; y < 8; y++) {
      var half = Math.round(Math.sqrt(Math.max(0, 64 - y * y)));
      for (x = 2; x <= half; x++) put(g, cx + x, cy + y);
    }
    g.fillStyle = "#ffe7a0";
    for (y = -7; y < -1; y++) {
      for (x = -7; x < -1; x++) {
        if (x * x + y * y <= 28) put(g, cx + x, cy + y);
      }
    }
    g.fillStyle = "#ffb0a0";
    for (x = cx - 9; x < cx + 10; x++) put(g, x, cy - 7);
    g.fillStyle = "#e02420";
    for (x = cx - 9; x < cx + 10; x++) {
      put(g, x, cy - 6);
      put(g, x, cy - 5);
    }
    put(g, cx - 10, cy - 6);
    put(g, cx - 10, cy - 5);
    var tails = [
      [[-12, -5], [-13, -4], [-14, -3], [-13, -6], [-14, -7], [-12, -4]],
      [[-12, -6], [-13, -7], [-14, -8], [-13, -5], [-14, -4], [-12, -7]],
      [[-12, -5], [-13, -5], [-14, -4], [-15, -3], [-14, -6], [-13, -7]],
      [[-12, -4], [-13, -3], [-14, -2], [-13, -5], [-14, -6], [-12, -3]]
    ][f];
    for (i = 0; i < tails.length; i++) {
      put(g, cx + tails[i][0], cy + tails[i][1]);
      put(g, cx + tails[i][0], cy + tails[i][1] + 1);
    }
    g.fillStyle = "#0e0a08";
    for (x = cx - 7; x < cx - 1; x++) {
      put(g, x, cy - 2);
      put(g, x, cy - 1);
      put(g, x, cy);
    }
    for (x = cx + 2; x < cx + 8; x++) {
      put(g, x, cy - 2);
      put(g, x, cy - 1);
      put(g, x, cy);
    }
    put(g, cx - 1, cy - 1);
    put(g, cx, cy - 1);
    put(g, cx + 1, cy - 1);
    put(g, cx - 8, cy - 1);
    put(g, cx + 8, cy - 1);
    g.fillStyle = "#ffffff";
    put(g, cx - 6, cy - 2);
    put(g, cx + 3, cy - 2);
    g.fillStyle = "#ff929c";
    put(g, cx - 8, cy + 3);
    put(g, cx - 7, cy + 3);
    put(g, cx + 8, cy + 3);
    put(g, cx + 9, cy + 3);
    g.fillStyle = "#160a04";
    for (row = 0; row < BTC.length; row++) {
      line = BTC[row];
      for (col = 0; col < line.length; col++) {
        if (line.charAt(col) === "#") put(g, cx - 3 + col, cy + 2 + row);
      }
    }
    g.fillStyle = "#160a04";
    put(g, cx - 9, by - 1);
    put(g, cx + 8, by - 1);
    g.fillStyle = "#f2a900";
    put(g, cx - 8, by - 1);
    put(g, cx - 8, by);
    put(g, cx + 7, by - 1);
    put(g, cx + 7, by);
  }

  function spriteFrames() {
    if (frames) return frames;
    if (typeof document === "undefined" || !document.createElement) return null;
    var out = [];
    var i, c, g;
    for (i = 0; i < 4; i++) {
      c = document.createElement("canvas");
      c.width = SPRITE;
      c.height = SPRITE;
      g = c.getContext("2d");
      if (g) paintChoppy(g, i);
      out.push(c);
    }
    frames = out;
    return out;
  }

  function gapNear(S, x) {
    var pipes = S.pipes || [];
    var best = null;
    var bestD = 1e9;
    var i, p, d;
    for (i = 0; i < pipes.length; i++) {
      p = pipes[i];
      if (!p || p.finish || p.gapH == null) continue;
      d = Math.abs((p.x || 0) + 24 - x);
      if (d < bestD) { bestD = d; best = p; }
    }
    if (!best || bestD > 140) return null;
    return { top: best.gapY - best.gapH * 0.5, bot: best.gapY + best.gapH * 0.5 };
  }

  function draw(ctx, S, reduce, palette) {
    if (!(intensity > 0)) return;
    if (!ctx || !S) return;
    var w = S.W | 0;
    var h = S.H | 0;
    if (w < 8 || h < 8) return;
    var key = w + "x" + h;
    if (!bandCanvas || bandKey !== key) buildBands(w, h);
    if (!bandCanvas) return;

    var t = (typeof S.lifeT === "number") ? S.lifeT : 0;
    var still = !!reduce;
    var scroll = still ? 0 : Math.sin(t * 0.23) * bandPad * 0.85;
    var dy = still ? 0 : Math.sin(t * 0.7) * h * 0.008;
    var light = palette === "simple" || palette === "paper";
    var alpha = (light ? 0.40 : 0.33) * intensity;

    ctx.save();
    ctx.globalAlpha = alpha;
    var sx = Math.round(bandPad + scroll);
    if (sx < 0) sx = 0;
    if (sx + w > bandCanvas.width) sx = Math.max(0, bandCanvas.width - w);
    ctx.drawImage(bandCanvas, sx, 0, w, h, 0, dy, w, h);
    ctx.restore();

    var sheet = spriteFrames();
    if (!sheet) return;
    var travel = w * 0.64;
    var x = still ? w * 0.32 : (w * 0.24 + ((t * (w / 20)) % travel));
    var cacheX = sx + x;
    var y = centerY(0, cacheX, bandCanvas.width, h) + dy;
    var frame = still ? 0 : ((t * 7) | 0) & 3;
    var birdX = S.bird && S.bird.x != null ? S.bird.x : w * 0.18;
    var birdY = S.bird && S.bird.y != null ? S.bird.y : h * 0.42;
    var surA = Math.min(1, 0.94 * intensity);
    if (Math.abs(x - birdX) < 84) {
      var gap = gapNear(S, birdX);
      if (gap && y > gap.top - 6 && y < gap.bot + 6) {
        y = gap.top - 30;
        if (y < 18) y = gap.bot + 26;
      }
      if (Math.abs(y - birdY) < 70) surA *= 0.35;
    }
    if (y < 14) y = 14;
    if (y > h - 18) y = h - 18;

    var dw = SPRITE * SCALE;
    var dh = SPRITE * SCALE;
    var dx = Math.round(x - (SPRITE * 0.5) * SCALE);
    var destY = Math.round(y - ANCHOR * SCALE);

    ctx.save();
    ctx.imageSmoothingEnabled = false;
    ctx.globalAlpha = surA;
    ctx.drawImage(sheet[frame] || sheet[0], dx, destY, dw, dh);
    if (!still) {
      ctx.fillStyle = "rgba(255,246,194," + (0.7 * intensity) + ")";
      var s, sx0, sy0;
      for (s = 1; s <= 4; s++) {
        sx0 = Math.round(x - 36 - s * 8);
        sy0 = Math.round(y - 6 + ((frame + s) % 3) * 3);
        ctx.fillRect(sx0, sy0, 2, 2);
        ctx.fillRect(sx0 - 2, sy0, 2, 2);
        ctx.fillRect(sx0 + 2, sy0, 2, 2);
        ctx.fillRect(sx0, sy0 - 2, 2, 2);
        ctx.fillRect(sx0, sy0 + 2, 2, 2);
      }
    }
    ctx.restore();
  }

  function beepAt(h, freq, dur, type, gain, slide, delay) {
    if (!h || !h.beep || !(gain > 0) || !(freq > 0)) return;
    try { h.beep(freq, dur, type, gain, slide, delay, "theme"); } catch (e) {}
  }

  function noiseAt(h, when, dur, gain) {
    var ac = h.ac && h.ac();
    if (!ac || !ac.createBuffer || !(ac.sampleRate > 0) || !(gain > 0)) return;
    try {
      var n = Math.max(8, Math.floor(ac.sampleRate * dur));
      var buf = ac.createBuffer(1, n, ac.sampleRate);
      var d = buf.getChannelData(0);
      var i;
      for (i = 0; i < n; i++) d[i] = (Math.random() * 2 - 1) * (1 - i / n);
      var src = ac.createBufferSource();
      src.buffer = buf;
      var f = ac.createBiquadFilter();
      f.type = "lowpass";
      f.frequency.setValueAtTime(220, when);
      f.frequency.exponentialRampToValueAtTime(70, when + dur);
      var g = ac.createGain();
      g.gain.setValueAtTime(gain, when);
      g.gain.exponentialRampToValueAtTime(0.0001, when + dur);
      src.connect(f);
      f.connect(g);
      g.connect(ac.destination);
      src.start(when);
      src.stop(when + dur + 0.02);
    } catch (e) {}
  }

  function schedule(h, when, step) {
    var ac = h.ac();
    if (!ac) return;
    var now = isFinite(ac.currentTime) ? ac.currentTime : 0;
    var delay = when - now;
    if (delay < 0) delay = 0;
    var vol = h.vol ? h.vol() : 0.8;
    if (!(vol > 0)) return;
    vol *= 0.85;
    if (!(intensity > 0)) return;
    var bar = (step / 8) | 0;
    var e = step % 8;
    var fill = (bar % 4) === 3;
    if (e === 0 || e === 4 || (fill && (e === 5 || e === 7))) {
      var f0 = e === 0 ? 86 : 72;
      beepAt(h, f0, 0.16, "sine", 0.1 * vol, 40, delay);
      noiseAt(h, now + delay, 0.09, 0.07 * vol);
    }
    if (e === 2 || e === 6 || (fill && e >= 4)) {
      beepAt(h, 880, 0.03, "square", 0.028 * vol, null, delay);
    }
    if (e === 0) beepAt(h, 146.83, 0.32, "sine", 0.035 * vol, null, delay);
    if ((e & 1) === 0) {
      var ni = (bar % 8) * 4 + (e >> 1);
      var deg = LEAD.charCodeAt(ni) - 48;
      if (deg >= 1 && deg <= 5) {
        var freq = DEG[deg] * 2;
        beepAt(h, freq * 1.035, 0.11, "triangle", 0.048 * vol, freq, delay);
        if (bar >= 8) beepAt(h, freq * 2, 0.08, "triangle", 0.016 * vol, freq * 2, delay + 0.02);
      }
    }
    if (fill && e >= 4) {
      var fd = [3, 4, 5, 4][e - 4];
      beepAt(h, DEG[fd] * 2, 0.07, "square", 0.026 * vol, DEG[fd] * 1.5, delay);
    }
    if (e === 0 && (bar % 2) === 0) {
      var pd = PAD[(bar >> 1) % PAD.length];
      beepAt(h, DEG[pd] * 2, 0.55, "sine", 0.02 * vol, null, delay);
    }
  }

  function cadence(h) {
    var vol = (h.vol ? h.vol() : 0.8) * 0.85;
    if (!(vol > 0)) return;
    beepAt(h, 587.33, 0.16, "triangle", 0.05 * vol, null, 0.02);
    beepAt(h, 493.88, 0.16, "triangle", 0.045 * vol, null, 0.18);
    beepAt(h, 293.66, 0.4, "sine", 0.04 * vol, null, 0.34);
  }

  function pump(A) {
    if (!running || !A || !A._halving) return;
    var h = A._halving;
    if (!h.beep || !h.ac) return;
    if (h.muted && h.muted()) return;
    if (!(intensity > 0)) return;
    var ac = h.ac();
    if (!ac) return;
    var now = isFinite(ac.currentTime) ? ac.currentTime : 0;
    var horizon = now + LOOK;
    var guard = 0;
    while (nextT < horizon && guard++ < 16) {
      try { schedule(h, nextT, stepI); } catch (e) {}
      stepI = (stepI + 1) % LOOP;
      nextT += STEP;
    }
  }

  function armTimer(A) {
    if (timer || !running) return;
    var h = A && A._halving;
    var ac = h && h.ac && h.ac();
    if (!ac || !(ac.sampleRate > 0) || typeof setTimeout !== "function") return;
    timer = setTimeout(function () {
      timer = null;
      if (!running) return;
      try { pump(A); } catch (e) {}
      if (running) armTimer(A);
    }, 70);
  }

  function releaseJuke(A) {
    if (!heldJuke) return;
    heldJuke = false;
    if (!A || A._cueHeld) {
      if (A && A._cueHeld) A._resumeJuke = true;
      return;
    }
    var paused = false;
    try { paused = !!(A.jukePaused && A.jukePaused()); } catch (e) { paused = false; }
    if (paused && A.jukeResume) {
      try { A.jukeResume(); } catch (e2) {}
    }
  }

  function startTheme(A) {
    running = true;
    var h = A._halving;
    var ac = h && h.ac && h.ac();
    var now = ac && isFinite(ac.currentTime) ? ac.currentTime : 0;
    if (!(nextT > now)) nextT = now + 0.05;
    if (!heldJuke) {
      var on = false;
      try { on = !!(A.jukePlaying && A.jukePlaying()); } catch (e) { on = false; }
      if (on && A.jukePause) {
        try { A.jukePause(); } catch (e2) {}
        var paused = false;
        try { paused = !!(A.jukePaused && A.jukePaused()); } catch (e3) { paused = false; }
        heldJuke = !!paused;
      }
    }
    if (h && h.hold) {
      try { h.hold(true); } catch (e4) {}
    }
    pump(A);
    armTimer(A);
  }

  function syncTheme(A) {
    if (!A) return;
    boundA = A;
    var h = A._halving;
    if (h && !h.onMute) {
      h.onMute = function () { try { syncTheme(A); } catch (e) {} };
    }
    var muted = !!((h && h.muted && h.muted()) || (A.muteTheme && A.muteTheme()));
    var cue = !!A._cueHeld;
    var live = !!(want && intensity > 0 && !muted && !cue);
    if (h && h.hold) {
      try { h.hold(intensity > 0 && !muted && !cue); } catch (e) {}
    }
    if (live) {
      if (!running) startTheme(A);
      else pump(A);
      return;
    }
    if (running) {
      running = false;
      if (timer) {
        try { clearTimeout(timer); } catch (e2) {}
        timer = null;
      }
      if (!muted && !cue && intensity > 0 && h && h.beep) cadence(h);
    }
    if (heldJuke && !cue && (muted || intensity <= 0)) releaseJuke(A);
  }

  root.ChoppyHalving = {
    BANDS: BANDS,
    FADE_IN: FADE_IN,
    FADE_OUT: FADE_OUT,
    tick: tick,
    reset: reset,
    intensity: function () { return intensity; },
    draw: draw,
    syncTheme: syncTheme
  };
})();
