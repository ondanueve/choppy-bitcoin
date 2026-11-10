/* Halving rainbow: chart bands, surfing Choppy, and the chiptune.
   Loaded on demand by ensureHalving() in game.js. Not a startup script. */
(function () {
  "use strict";
  var root = typeof window !== "undefined" ? window : globalThis;

  var FADE_IN = 0.6;
  var FADE_OUT = 0.8;
  var BPM = 156;
  var FANFARE_VOL = 0.9;
  var STEP = 60 / BPM / 4;
  var LOOK = 0.6;
  var SCALE = 2;
  var FW = 61;
  var FH = 45;
  var SPRITE_SRC = "halving-surfer.png?v=mp207";

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
  // The tip row is h. Every band narrows toward the tip and all nine centerlines meet at that one point,
  // right under the surfer; away from the tip they fan out and fall away to the left on a log curve.
  function bandH(h) { return h * 0.05; }

  function converge(x, cw) {
    var u = (cw - x) / (cw * 0.42);
    if (u < 0) u = 0;
    if (u > 1) u = 1;
    return u * u * (3 - 2 * u);
  }

  function bandMid(i, x, cw, h) {
    var s = cw > 0 ? 1 - x / cw : 0;
    if (s < 0) s = 0;
    if (s > 1) s = 1;
    var drop = h * 0.16 * (1 - Math.log(1 + 8 * (1 - s)) / Math.log(9));
    return h + drop + (i - (BANDS.length - 1) / 2) * bandH(h) * 0.92 * converge(x, cw);
  }

  // part < 1 traces only the top share of the band (the highlight).
  function traceBand(g, i, cw, h, part) {
    var bh = bandH(h);
    var x;
    var f;
    var top;
    g.beginPath();
    for (x = 0; x <= cw; x += 4) {
      f = bh * converge(x, cw);
      top = bandMid(i, x, cw, h) - f * 0.5;
      if (x === 0) g.moveTo(x, top); else g.lineTo(x, top);
    }
    for (x = cw; x >= 0; x -= 4) {
      f = bh * converge(x, cw);
      g.lineTo(x, bandMid(i, x, cw, h) - f * 0.5 + f * part);
    }
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
      traceBand(g, i, cw, h, 1);
      g.fillStyle = BANDS[i].hex;
      g.fill();
      traceBand(g, i, cw, h, 0.3);
      g.fillStyle = "rgba(255,255,255,0.16)";
      g.fill();
    }
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

  // ---- Chiptune: "Sunrise Over the Torii", an original taiko-and-shamisen fanfare in D yo scale.
  // 24 bars at 156 BPM (about 37 s): 4-bar power-up fanfare, 8-bar verse, 8-bar chorus, 4-bar climax.
  // After the first pass it loops from the verse. Voices go through one gain bus and a compressor into ctx.destination.
  var SEMI = { m: -12, n: -10, o: -7, p: -5, d: 0, e: 2, g: 5, a: 7, b: 9, D: 12, E: 14, G: 17, A: 19, B: 21, Q: 24, R: 26 };
  var D4 = 293.66;
  var ROOT_D = -24, ROOT_G = -19, ROOT_A = -17, ROOT_B = -15;
  var BARS = [];
  (function () {
    function add(sec, lead, root) { BARS.push({ sec: sec, lead: lead, root: root }); }
    var intro = ["dgbDgbDGbDGAbDGA", "DGAQ-.A.Q.R.Q---", "QQ.QQ.R.Q.A.G.A.", "A---------QQQR.."];
    var introRoots = [ROOT_D, ROOT_D, ROOT_G, ROOT_A];
    var verse = ["D.DE.D.b.D.-A.b-", "D.DE.D.b.D.-A---", "G.GA.G.D.G.-E.D-", "A.AQ.A.G.E.-D.E-",
      "D.DE.D.b.D.-A.b-", "b.bD.b.A.G.-A.b-", "G.GA.G.E.D.-E.G-", "A.GA.D.EG.AGEG.A"];
    var chorus = ["DEGAGEDE.DEGAGE.", "GAQAGAQ.A.G.E.D.", "GAQ.GAQ.AQR.QAGA", "QR.QA.GA.QRQAGAE",
      "DEGAGEDE.DEGAGE.", "bDEGEDbD.bDEGED.", "GAQ.GAQ.AQR.QAGA", "QRQAGAQR-.-.QR.Q"];
    var span = [ROOT_D, ROOT_D, ROOT_G, ROOT_A, ROOT_D, ROOT_B, ROOT_G, ROOT_A];
    var climax = ["QQ.QR.QQ.A.Q.R--", "RR.RQ.AA.Q.R.Q--", "AQ.AQ.RQ.RQ.AQRQ", "Q---------A.G.D."];
    var climaxRoots = [ROOT_G, ROOT_A, ROOT_D, ROOT_D];
    var i;
    for (i = 0; i < 4; i++) add("i", intro[i], introRoots[i]);
    for (i = 0; i < 8; i++) add("v", verse[i], span[i]);
    for (i = 0; i < 8; i++) add("c", chorus[i], span[i]);
    for (i = 0; i < 4; i++) add("x", climax[i], climaxRoots[i]);
  })();
  var TOTAL = BARS.length * 16;
  var LOOP_AT = 64;
  var BASS_PAT = [0, 0, 12, 0, 0, 12, 7, 12];
  var PLUCK = [0, 7, 12, 7];

  var bus = null;
  var busAc = null;
  var noiseBuf = null;

  function hz(s) { return D4 * Math.pow(2, s / 12); }

  function getBus(ac) {
    if (bus && busAc === ac) return bus;
    try {
      var g = ac.createGain();
      g.gain.value = 0.9;
      var comp = ac.createDynamicsCompressor ? ac.createDynamicsCompressor() : null;
      if (comp) {
        try {
          comp.threshold.value = -16;
          comp.knee.value = 12;
          comp.ratio.value = 5;
          comp.attack.value = 0.004;
          comp.release.value = 0.16;
        } catch (e0) {}
        g.connect(comp);
        comp.connect(ac.destination);
      } else g.connect(ac.destination);
      bus = g;
      busAc = ac;
      noiseBuf = null;
    } catch (e) { bus = null; }
    return bus;
  }

  function setBusLevel(ac, v) {
    if (!bus) return;
    try { bus.gain.setTargetAtTime(v, ac.currentTime, 0.03); }
    catch (e) { try { bus.gain.value = v; } catch (e2) {} }
  }

  function tone(ac, t, f, dur, type, gain, f2, dest) {
    if (!(gain > 0) || !(f > 0)) return;
    try {
      var o = ac.createOscillator();
      var g = ac.createGain();
      o.type = type;
      o.frequency.setValueAtTime(f, t);
      if (f2) o.frequency.exponentialRampToValueAtTime(Math.max(30, f2), t + dur);
      g.gain.setValueAtTime(0.0001, t);
      g.gain.linearRampToValueAtTime(gain, t + 0.007);
      g.gain.setValueAtTime(gain * 0.8, t + Math.max(0.01, dur * 0.6));
      g.gain.exponentialRampToValueAtTime(0.0001, t + dur);
      o.connect(g);
      g.connect(dest || bus);
      o.start(t);
      o.stop(t + dur + 0.03);
    } catch (e) {}
  }

  function noise(ac, t, dur, gain, ftype, fhz, dest) {
    if (!(gain > 0) || !ac.createBuffer || !(ac.sampleRate > 0)) return;
    try {
      if (!noiseBuf) {
        var n = Math.floor(ac.sampleRate * 0.8);
        noiseBuf = ac.createBuffer(1, n, ac.sampleRate);
        var d = noiseBuf.getChannelData(0);
        for (var i = 0; i < n; i++) d[i] = Math.random() * 2 - 1;
      }
      var s = ac.createBufferSource();
      s.buffer = noiseBuf;
      var f = ac.createBiquadFilter();
      f.type = ftype;
      f.frequency.value = fhz;
      var g = ac.createGain();
      g.gain.setValueAtTime(gain, t);
      g.gain.exponentialRampToValueAtTime(0.0001, t + dur);
      s.connect(f);
      f.connect(g);
      g.connect(dest || bus);
      s.start(t);
      s.stop(t + dur + 0.02);
    } catch (e) {}
  }

  // ---- Halving bull sound effects: punchy, sparkly, over the top. Own bus (its own compressor), independent of the theme level.
  var sbus = null, sbusAc = null, combo = 0, comboAt = -9;
  var PENTA = [0, 2, 4, 7, 9, 12, 14];

  function getSfxBus(ac) {
    if (sbus && sbusAc === ac) return sbus;
    try {
      var g = ac.createGain();
      g.gain.value = 0.6;
      var comp = ac.createDynamicsCompressor ? ac.createDynamicsCompressor() : null;
      if (comp) {
        try { comp.threshold.value = -12; comp.knee.value = 10; comp.ratio.value = 6; comp.attack.value = 0.002; comp.release.value = 0.12; } catch (e0) {}
        g.connect(comp);
        comp.connect(ac.destination);
      } else g.connect(ac.destination);
      sbus = g;
      sbusAc = ac;
    } catch (e) { sbus = null; }
    return sbus;
  }

  // kind: "candle" (eaten candle), "smash" (candle smashed by the bull), "power" (power-up eaten). Returns true when handled.
  function sfx(A, kind) {
    var ac = liveAc(A && A._halving);
    if (!ac) return false;
    if (A.muteSfx && A.muteSfx()) return true;
    var sb = getSfxBus(ac);
    if (!sb) return false;
    var t = (isFinite(ac.currentTime) ? ac.currentTime : 0) + 0.005;
    function T(dt, f, dur, type, gain, f2) { tone(ac, t + dt, f, dur, type, gain, f2, sb); }
    function N(dt, dur, gain, ft, fhz) { noise(ac, t + dt, dur, gain, ft, fhz, sb); }
    if (kind === "power") {
      T(0, 190, 0.32, "sine", 0.5, 42);
      N(0, 0.5, 0.24, "highpass", 2600);
      var arp = [587, 740, 880, 1175, 1480, 1760, 2349];
      for (var i = 0; i < arp.length; i++) T(0.03 + i * 0.045, arp[i], 0.14, "square", 0.13);
      T(0.05, 587, 0.55, "sawtooth", 0.09);
      T(0.05, 882, 0.55, "sawtooth", 0.07);
      var sp = [2349, 3136, 3520, 4699, 3951];
      for (var j = 0; j < sp.length; j++) T(0.3 + j * 0.055, sp[j], 0.12, "sine", 0.07);
      T(0.32, 1175, 0.55, "triangle", 0.14);
      return true;
    }
    var now = isFinite(ac.currentTime) ? ac.currentTime : 0;
    combo = now - comboAt < 1.2 ? Math.min(combo + 1, PENTA.length - 1) : 0;
    comboAt = now;
    var f = 880 * Math.pow(2, PENTA[combo] / 12);
    T(0, f, 0.1, "square", 0.16);
    T(0.035, f * 2, 0.12, "triangle", 0.14);
    T(0.07, f * 3, 0.14, "sine", 0.09);
    N(0, 0.06, 0.16, "highpass", 7000);
    if (kind === "smash") {
      T(0, 220, 0.2, "sine", 0.42, 44);
      N(0, 0.22, 0.22, "lowpass", 1800);
    }
    return true;
  }

  function schedule(ac, t, step, vol) {
    if (!bus || !(vol > 0)) return;
    var bi = (step / 16) | 0;
    var e = step % 16;
    var B = BARS[bi];
    var sec = B.sec;
    var drive = sec !== "i" || bi >= 2;
    var big = sec === "c" || sec === "x";
    var dur = STEP;

    var ch = B.lead.charAt(e);
    if (SEMI.hasOwnProperty(ch)) {
      var len = 1;
      while (e + len < 16 && B.lead.charAt(e + len) === "-") len++;
      var s = SEMI[ch];
      var ld = Math.max(0.07, len * dur * 0.94);
      tone(ac, t, hz(s), ld, "square", 0.085, null);
      tone(ac, t, hz(s) * 1.004, ld, "square", 0.03, null);
      if (big || sec === "i") tone(ac, t, hz(s - 12), ld, "sawtooth", 0.04, null);
      if (len >= 3) tone(ac, t + dur * 0.5, hz(s) * 2, ld * 0.7, "triangle", 0.02, null);
    }

    if (drive && (e & 1) === 0) {
      var bo = B.root + BASS_PAT[e >> 1];
      tone(ac, t, hz(bo), dur * 1.8, "triangle", 0.15, null);
    } else if (!drive && (e === 0 || e === 8)) {
      tone(ac, t, hz(B.root + 12), dur * 5, "triangle", 0.13, null);
    }

    if (drive && (e & 1) === 1) {
      var ps = B.root + 36 + PLUCK[(e >> 1) & 3];
      tone(ac, t, hz(ps), 0.1, "triangle", 0.05, hz(ps) * 0.96);
    }

    var fill = (sec === "i" && bi === 3) || (bi === 11) || (bi === 19) || (bi === 23);
    if ((e & 3) === 0) {
      tone(ac, t, 140, 0.2, "sine", e === 0 ? 0.3 : 0.22, 42);
      if (big || e === 0) noise(ac, t, 0.12, 0.08, "lowpass", 300);
    }
    if (drive && (e === 4 || e === 12)) noise(ac, t, 0.11, big ? 0.16 : 0.11, "highpass", 1500);
    if (drive && (big ? true : (e & 1) === 0) && (e & 3) !== 0 && e !== 4 && e !== 12) noise(ac, t, 0.035, 0.035, "highpass", 6500);
    if (fill && e >= 8 && (e >= 12 || (e & 1) === 0)) noise(ac, t, 0.09, 0.07 + (e - 8) * 0.012, "highpass", 1100);
    if (e === 0 && (bi === 4 || bi === 12 || bi === 20)) {
      noise(ac, t, 0.8, 0.13, "highpass", 4200);
      tone(ac, t, hz(-12), 0.5, "sawtooth", 0.05, null);
    }
  }

  // The finale: a rising "ta-da" and one long D major chord.
  function finale(ac, t0) {
    if (!bus) return;
    var up = [12, 17, 19, 24];
    var i;
    for (i = 0; i < up.length; i++) tone(ac, t0 + i * 0.09, hz(up[i]), i === 3 ? 1.3 : 0.12, "square", i === 3 ? 0.09 : 0.075, null);
    tone(ac, t0 + 0.27, hz(12), 1.3, "square", 0.04, null);
    tone(ac, t0 + 0.27, hz(19), 1.3, "triangle", 0.05, null);
    tone(ac, t0 + 0.27, hz(-12), 1.3, "sawtooth", 0.05, null);
    tone(ac, t0 + 0.27, hz(ROOT_D), 1.2, "triangle", 0.16, null);
    tone(ac, t0 + 0.27, 140, 0.3, "sine", 0.3, 42);
    noise(ac, t0 + 0.27, 0.9, 0.13, "highpass", 4200);
  }

  function liveAc(h) {
    var ac = h && h.ac && h.ac();
    if (!ac || !ac.createGain || !ac.createOscillator || !ac.destination) return null;
    if (ac.state && ac.state !== "running" && ac.state !== "closed" && ac.resume) {
      try { ac.resume(); } catch (e) {}
    }
    return ac;
  }

  function pump(A) {
    if (!running || !A || !A._halving) return;
    var h = A._halving;
    if (h.muted && h.muted()) return;
    if (!(intensity > 0)) return;
    var ac = liveAc(h);
    if (!ac || !getBus(ac)) return;
    var vol = FANFARE_VOL;
    if (!(vol > 0)) return;
    setBusLevel(ac, vol * (0.35 + 0.65 * Math.min(1, intensity * 1.5)));
    var now = isFinite(ac.currentTime) ? ac.currentTime : 0;
    if (nextT < now) nextT = now + 0.03;
    var horizon = now + LOOK;
    var guard = 0;
    while (nextT < horizon && guard++ < 64) {
      try { schedule(ac, nextT, stepI, vol); } catch (e) {}
      stepI++;
      if (stepI >= TOTAL) stepI = LOOP_AT;
      nextT += STEP;
    }
  }

  function armTimer(A) {
    if (timer || !running) return;
    if (typeof setTimeout !== "function") return;
    timer = setTimeout(function () {
      timer = null;
      if (!running) return;
      try { pump(A); } catch (e) {}
      if (running) armTimer(A);
    }, 60);
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
    var ac = liveAc(h);
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

  // Pause or menu overlay: keep the sequence and its place in the song, just stop scheduling notes.
  function pause() {
    running = false;
    if (timer) {
      try { clearTimeout(timer); } catch (e) {}
      timer = null;
    }
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
      if (h && !h.ac()) { try { if (A.unlock) A.unlock(); } catch (e5) {} }
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
      if (!muted && !cue && intensity > 0 && h) {
        var ac = liveAc(h);
        if (ac && getBus(ac)) {
          setBusLevel(ac, (FANFARE_VOL));
          finale(ac, (isFinite(ac.currentTime) ? ac.currentTime : 0) + 0.02);
        }
      }
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
    pause: pause,
    sfx: sfx,
    syncTheme: syncTheme
  };
})();
