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
  var FW = 61;
  var FH = 45;
  var SPRITE_SRC = "halving-surfer.png?v=mp205";

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
  var sheet = null;
  var sheetBad = false;
  var tipX = null;
  var tipY = 0;
  var lastDt = 0;

  function tick(dt, active) {
    want = !!active;
    if (dt > 0) lastDt = dt;
    if (!(dt > 0)) return intensity;
    if (want) intensity = Math.min(1, intensity + dt / FADE_IN);
    else intensity = Math.max(0, intensity - dt / FADE_OUT);
    return intensity;
  }

  function reset() {
    want = false;
    intensity = 0;
    tipX = null;
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

  // The bands are prerendered with the front tip at the right edge, on a canvas twice the field height.
  // The tip row is h. The crest of the top band starts there and every band falls away to the left on a log curve.
  function bandH(h) { return h * 0.05; }

  function bandY(i, x, cw, h) {
    var s = cw > 0 ? 1 - x / cw : 0;
    if (s < 0) s = 0;
    if (s > 1) s = 1;
    var drop = h * 0.16 * (1 - Math.log(1 + 8 * (1 - s)) / Math.log(9));
    return h - bandH(h) * 1.0 + i * bandH(h) * 0.92 + drop;
  }

  function traceBand(g, i, cw, h, inset) {
    var bh = bandH(h);
    var x;
    g.beginPath();
    g.moveTo(0, bandY(i, 0, cw, h) + inset - bh * 0.5);
    for (x = 4; x < cw; x += 4) g.lineTo(x, bandY(i, x, cw, h) + inset - bh * 0.5);
    g.lineTo(cw, bandY(i, cw, cw, h) + inset - bh * 0.5);
    g.lineTo(cw, bandY(i, cw, cw, h) + inset + bh * 0.5);
    for (x = cw - 4; x > 0; x -= 4) g.lineTo(x, bandY(i, x, cw, h) + inset + bh * 0.5);
    g.lineTo(0, bandY(i, 0, cw, h) + inset + bh * 0.5);
    g.closePath();
  }

  function buildBands(w, h) {
    if (typeof document === "undefined" || !document.createElement) return null;
    var cw = w;
    var c = document.createElement("canvas");
    c.width = cw;
    c.height = h * 2;
    var g = c.getContext("2d");
    if (!g) return null;
    var i;
    for (i = 0; i < BANDS.length; i++) {
      traceBand(g, i, cw, h, 0);
      g.fillStyle = BANDS[i].hex;
      g.fill();
      traceBand(g, i, cw, h, -h * 0.014);
      g.fillStyle = "rgba(255,255,255,0.16)";
      g.fill();
    }
    var fade = g.createLinearGradient(cw - 36, 0, cw, 0);
    fade.addColorStop(0, "rgba(0,0,0,0)");
    fade.addColorStop(1, "rgba(0,0,0,1)");
    g.globalCompositeOperation = "destination-out";
    g.fillStyle = fade;
    g.fillRect(cw - 36, 0, 36, h * 2);
    g.globalCompositeOperation = "source-over";
    bandCanvas = c;
    bandKey = w + "x" + h;
    return c;
  }

  function loadSheet() {
    if (sheet || typeof Image === "undefined") return;
    try {
      sheet = new Image();
      sheet.onerror = function () { sheetBad = true; };
      sheet.src = SPRITE_SRC;
    } catch (e) { sheet = null; sheetBad = true; }
  }

  function sheetReady() {
    return !!(sheet && !sheetBad && sheet.complete && sheet.naturalWidth >= FW * 4);
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
    loadSheet();

    var t = (typeof S.lifeT === "number") ? S.lifeT : 0;
    var still = !!reduce;
    var tip = S._tip;
    var gx = tip && tip.x === tip.x ? tip.x : w * 0.6;
    var gy = tip && tip.y === tip.y ? tip.y : h * 0.5;
    if (gx < FW * SCALE * 0.5 + 4) gx = FW * SCALE * 0.5 + 4;
    if (gx > w - 6) gx = w - 6;
    if (tipX === null) { tipX = gx; tipY = gy; }
    else {
      var k = still ? 1 : 1 - Math.exp(-(lastDt || 0.016) / 0.1);
      tipX += (gx - tipX) * k;
      tipY += (gy - tipY) * k;
    }
    var dy = still ? 0 : Math.sin(t * 0.7) * h * 0.006;
    var light = palette === "simple" || palette === "paper";
    var alpha = (light ? 0.50 : 0.42) * intensity;

    var bx = Math.round(tipX - bandCanvas.width);
    var by = Math.round(tipY + dy - h);
    ctx.save();
    ctx.globalAlpha = alpha;
    ctx.drawImage(bandCanvas, bx, by);
    ctx.restore();

    if (!sheetReady()) return;
    var frame = still ? 0 : ((t * 6) | 0) & 3;
    var bob = still ? 0 : Math.round(Math.sin(t * 4.2) * 2) * SCALE;
    var dw = FW * SCALE;
    var dh = FH * SCALE;
    var dx = Math.round(tipX - dw * 0.5);
    var dyy = Math.round(tipY + dy - dh + 4 * SCALE + bob);
    var surA = Math.min(1, 0.95 * intensity);
    var birdX = S.bird && S.bird.x != null ? S.bird.x : w * 0.18;
    var birdY = S.bird && S.bird.y != null ? S.bird.y : h * 0.42;
    if (Math.abs(tipX - birdX) < dw * 0.6 && Math.abs(tipY - dh * 0.5 - birdY) < dh * 0.8) surA *= 0.35;

    ctx.save();
    ctx.imageSmoothingEnabled = false;
    ctx.globalAlpha = surA;
    ctx.drawImage(sheet, frame * FW, 0, FW, FH, dx, dyy, dw, dh);
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

  loadSheet();
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
