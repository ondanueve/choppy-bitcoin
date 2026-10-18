(() => {
  let ctx = null;
  let musicInterval = null;
  let musicStep = 0;
  let jukeTimer = null;
  let jukeOn = false;
  let jukeGen = 0;
  let muteTheme = localStorage.getItem("choppy-mute-theme") === "1";
  let muteSfx = localStorage.getItem("choppy-mute-sfx") === "1";
  let muteVoice = localStorage.getItem("choppy-mute-voice") === "1";

  let speechUnlocked = false;
  let silentKeep = null;
  const isIOS = /iPad|iPhone|iPod/.test(navigator.userAgent || "")
    || (navigator.platform === "MacIntel" && navigator.maxTouchPoints > 1);

  function keepSilentStream() {
    if (!isIOS || !ctx || silentKeep) return;
    try {
      const osc = ctx.createOscillator();
      const g = ctx.createGain();
      osc.frequency.value = 20;
      g.gain.value = 0.00008;
      osc.connect(g);
      g.connect(ctx.destination);
      osc.start();
      silentKeep = osc;
    } catch (e) {}
  }

  function unlockSpeech() {
    if (!isIOS || !window.speechSynthesis) return;
    try {
      if (ctx && ctx.state === "suspended") ctx.resume();
      speechSynthesis.cancel();
      const silentUtterance = new SpeechSynthesisUtterance("");
      silentUtterance.volume = 0;
      silentUtterance.lang = "en-US";
      speechSynthesis.speak(silentUtterance);
      speechUnlocked = true;
      keepSilentStream();
    } catch (e) {}
  }

  window.ArcadeAudio = {
    unlock() {
      const AC = window.AudioContext || window.webkitAudioContext;
      if (!AC) return;
      if (!ctx) {
        ctx = new AC({ latencyHint: "interactive" });
        // iOS Safari: a silent buffer played inside the gesture fully unlocks output.
        try { const b = ctx.createBuffer(1, 1, 22050), s = ctx.createBufferSource(); s.buffer = b; s.connect(ctx.destination); s.start(0); } catch (e) {}
      }
      // iOS reports "interrupted" after calls, Siri or backgrounding; treat it like "suspended".
      if (ctx.state !== "running" && ctx.state !== "closed") try { ctx.resume(); } catch (e) {}
      if (window.speechSynthesis) {
        window.speechSynthesis.getVoices();
        pickVoice();
        unlockSpeech();
      }
    },
    sfx: {}, speak() {}, cancelSpeech() {}, startMusic() {}, stopMusic() {},
    muteTheme() { return muteTheme; },
    muteSfx() { return muteSfx; },
    muteVoice() { return muteVoice; },
    setMuteTheme(v) {
      muteTheme = !!v;
      localStorage.setItem("choppy-mute-theme", muteTheme ? "1" : "0");
      if (muteTheme && musicInterval != null) { /* keep clock, skip notes */ }
    },
    setMuteSfx(v) {
      muteSfx = !!v;
      localStorage.setItem("choppy-mute-sfx", muteSfx ? "1" : "0");
    },
    setMuteVoice(v) {
      muteVoice = !!v;
      localStorage.setItem("choppy-mute-voice", muteVoice ? "1" : "0");
      if (muteVoice && window.speechSynthesis) speechSynthesis.cancel();
    },
    jukePlay() {}, jukeStop() {}, jukePlaying() { return jukeOn; },
  };
  function bus() { if (!ctx || muteSfx) return null; return ctx; }
  function toneBus() { if (!ctx) return null; return ctx; }
  function beep(freq, dur, type, gain, slide, delay, ch) {
    ch = ch || "sfx";
    if (ch === "sfx" && muteSfx) return;
    if (ch === "theme" && muteTheme) return;
    const ac = toneBus();
    if (!ac) return;
    gain = gain == null ? 0.08 : gain; delay = delay || 0;
    const now = ac.currentTime + delay;
    const osc = ac.createOscillator(); const g = ac.createGain();
    osc.type = type; osc.frequency.setValueAtTime(Math.max(30, freq), now);
    if (slide) osc.frequency.exponentialRampToValueAtTime(Math.max(40, slide), now + dur);
    g.gain.setValueAtTime(0.0001, now);
    g.gain.exponentialRampToValueAtTime(gain, now + 0.012);
    g.gain.exponentialRampToValueAtTime(0.0001, now + dur);
    osc.connect(g); g.connect(ac.destination); osc.start(now); osc.stop(now + dur + 0.02);
  }
  const A = window.ArcadeAudio;
  A.sfx = {
    start: () => beep(220, 0.12, "square", 0.05),
    buy: () => { beep(440, 0.08, "square", 0.06); beep(660, 0.12, "triangle", 0.04); },
    sell: () => { beep(330, 0.08, "square", 0.06); beep(220, 0.14, "triangle", 0.04); },
    jump: () => beep(420, 0.09, "square", 0.05, 280),
    coin: () => beep(880, 0.07, "triangle", 0.045),
    hit: () => beep(90, 0.16, "sawtooth", 0.07, 50),
    die: () => beep(160, 0.35, "sawtooth", 0.08, 40),
    wave: () => beep(520, 0.18, "triangle", 0.05),
    power: () => beep(480, 0.14, "triangle", 0.05),
    count: () => beep(392, 0.12, "sine", 0.05),
    go: () => beep(523, 0.18, "triangle", 0.06),
    cap: () => {
      beep(523.25, 0.16, "sine", 0.05, undefined, 0);
      beep(659.25, 0.16, "sine", 0.05, undefined, 0.14);
      beep(783.99, 0.16, "sine", 0.05, undefined, 0.28);
      beep(1046.5, 0.42, "triangle", 0.06, undefined, 0.44);
    },
    iabud: () => {
      beep(1480, 0.05, "square", 0.035, 2100, 0);
      beep(2100, 0.07, "triangle", 0.04, 1320, 0.04);
      beep(880, 0.09, "sine", 0.03, 1760, 0.08);
    },
    boom: () => {
      const ac = bus();
      if (ac) {
        const now = ac.currentTime;
        const n = ac.createBuffer(1, Math.floor(ac.sampleRate * 0.62), ac.sampleRate);
        const d = n.getChannelData(0);
        for (let i = 0; i < d.length; i++) d[i] = (Math.random() * 2 - 1) * (1 - i / d.length);
        const src = ac.createBufferSource(); src.buffer = n;
        const f = ac.createBiquadFilter(); f.type = "lowpass";
        f.frequency.setValueAtTime(1800, now);
        f.frequency.exponentialRampToValueAtTime(40, now + 0.52);
        const g = ac.createGain();
        g.gain.setValueAtTime(0.58, now);
        g.gain.exponentialRampToValueAtTime(0.0001, now + 0.58);
        src.connect(f); f.connect(g); g.connect(ac.destination); src.start(now);
      }
      beep(130, 0.32, "sawtooth", 0.2, 28);
      beep(55, 0.48, "square", 0.16, 18, 0.02);
      beep(38, 0.55, "sawtooth", 0.12, 16, 0.04);
    },
    warShot: () => beep(640, 0.05, "square", 0.04, 280),
    warHit: () => beep(180, 0.08, "square", 0.05, 90),
    warBrick: () => beep(110, 0.1, "sawtooth", 0.05, 60),
    warClank: () => beep(520, 0.04, "square", 0.03, 740),
    warPop: () => { beep(220, 0.08, "square", 0.05, 80); beep(90, 0.12, "sawtooth", 0.04, 40, 0.04); },
    warHurt: () => beep(140, 0.14, "sawtooth", 0.06, 50),
    warPick: () => { beep(660, 0.06, "triangle", 0.045); beep(880, 0.08, "triangle", 0.04, null, 0.05); },
    warHeli: () => { beep(90, 0.16, "sawtooth", 0.04, 140); beep(70, 0.18, "square", 0.03, 110, 0.08); },
    warCharge: () => beep(480, 0.04, "square", 0.025, 720),
    warAa: () => { beep(280, 0.1, "sawtooth", 0.06, 90); beep(740, 0.16, "square", 0.05, 180, 0.06); },
    warEnemy: () => beep(380, 0.03, "square", 0.018, 210),
    warShield: () => { beep(150, 0.08, "square", 0.05, 70); beep(80, 0.12, "sawtooth", 0.04, 36, 0.04); },
    warLrm: () => { beep(160, 0.14, "sawtooth", 0.06, 60); beep(480, 0.2, "square", 0.05, 120, 0.06); },
    warIce: () => { beep(880, 0.07, "sine", 0.035, 1400); beep(1400, 0.1, "triangle", 0.03, 1860, 0.06); },
    warWall: () => { beep(130, 0.08, "square", 0.05, 240); beep(260, 0.12, "square", 0.04, 380, 0.07); },
    warGod: () => { beep(660, 0.07, "triangle", 0.04); beep(880, 0.09, "triangle", 0.035, null, 0.06); beep(1320, 0.14, "sine", 0.03, null, 0.12); },
    warHeal: () => { beep(520, 0.06, "sine", 0.04, 780); beep(780, 0.08, "triangle", 0.03, null, 0.05); },
    warCrack: () => { beep(100, 0.08, "sawtooth", 0.06, 40); beep(220, 0.05, "square", 0.04, 80, 0.04); },
    warWave: () => { beep(330, 0.09, "square", 0.04); beep(494, 0.12, "triangle", 0.04, null, 0.08); },
    warSpawn: () => { beep(150, 0.07, "square", 0.05, 70); beep(420, 0.06, "triangle", 0.035, 680, 0.05); beep(760, 0.11, "sine", 0.028, 980, 0.1); },
    armyReady: () => { beep(392, 0.42, "sine", 0.022, 494); beep(494, 0.55, "sine", 0.016, 392, 0.32); },
    warWin: () => { beep(523, 0.09, "triangle", 0.045); beep(659, 0.09, "triangle", 0.04, null, 0.08); beep(784, 0.16, "triangle", 0.05, null, 0.16); },
    warBoom: () => { if (A.sfx && A.sfx.boom) A.sfx.boom(); },
  };
  A.stopMusic = () => { if (musicInterval != null) { clearInterval(musicInterval); musicInterval = null; } };
  A.musicOn = () => musicInterval != null;
  A.playCue = (kind) => {
    try { if (A.unlock) A.unlock(); } catch (e) {}
    if (!A._cueHeld) {
      A._resumeJuke = !!(A.jukePlaying && A.jukePlaying());
      if (A._resumeJuke && A.jukePause) {
        try { A.jukePause(); } catch (e) {}
      }
    }
    A._cueHeld = true;
    A.stopMusic();
    const war = kind !== "triumph";
    const notes = war
      ? [[220, 0.22], [196, 0.22], [175, 0.28], [156, 0.34], [131, 0.4], [98, 0.28], [131, 0.22], [156, 0.36], [87, 0.3], [110, 0.24], [131, 0.46], [98, 0.7]]
      : [[392, 0.14], [494, 0.14], [587, 0.16], [784, 0.36], [659, 0.14], [784, 0.18], [988, 0.28], [784, 0.16], [880, 0.2], [1174, 0.62]];
    let at = 0;
    notes.forEach((n, i) => {
      beep(n[0], Math.max(0.08, n[1] - 0.02), war ? "sawtooth" : "triangle", war ? 0.07 : 0.055, null, at, "theme");
      if (war && i % 2 === 0) beep(52, 0.14, "square", 0.045, 36, at, "theme");
      if (!war && i === notes.length - 1) beep(n[0] / 2, 0.4, "triangle", 0.04, null, at, "theme");
      at += n[1];
    });
  };
  A.releaseCue = () => {
    stopOde();
    if (!A._cueHeld && !A._resumeJuke) return;
    const resume = !!A._resumeJuke;
    A._cueHeld = false;
    A._resumeJuke = false;
    if (resume && A.jukeResume) {
      try { A.jukeResume(); } catch (e) {}
    }
  };
  let odeGen = 0;
  let odeSrc = null;
  let odeSynth = null;
  function haltOdeAudio() {
    const src = odeSrc; odeSrc = null;
    const synth = odeSynth; odeSynth = null;
    if (src) { try { src.onended = null; src.stop(); } catch (e) {} }
    if (synth && synth.stop) { try { synth.stop(); } catch (e) {} }
  }
  function stopOde() { odeGen++; haltOdeAudio(); }
  function startOde() {
    if (muteTheme) return;
    const lib = window.ABCJS;
    if (!lib || !lib.synth || !lib.synth.supportsAudio || !lib.synth.supportsAudio()) return;
    const abc = A.SONGS && A.SONGS.ode && A.SONGS.ode.abc;
    if (!abc) return;
    try { A.unlock(); } catch (e) {}
    if (!ctx) return;
    const gen = ++odeGen;
    haltOdeAudio();
    let el = document.getElementById("ode-hold");
    if (!el) {
      el = document.createElement("div");
      el.id = "ode-hold";
      el.hidden = true;
      document.body.appendChild(el);
    }
    const run = async () => {
      try {
        const vis = lib.renderAbc("ode-hold", abc, { add_classes: false, staffwidth: 640, paddingtop: 1, paddingbottom: 1 });
        const visual = vis && vis[0];
        if (!visual || gen !== odeGen) return;
        const synth = new lib.synth.CreateSynth();
        await synth.init({
          visualObj: visual,
          audioContext: ctx,
          millisecondsPerMeasure: visual.millisecondsPerMeasure ? visual.millisecondsPerMeasure() : 1778
        });
        const primed = await synth.prime();
        if (gen !== odeGen) { try { synth.stop(); } catch (e) {} return; }
        odeSynth = synth;
        const buf = (synth.getAudioBuffer && synth.getAudioBuffer()) || null;
        const dur = (buf && buf.duration) || (primed && primed.duration) || synth.duration || 0;
        if (buf) {
          const src = ctx.createBufferSource();
          const g = ctx.createGain();
          // Match the jukebox: follow the music volume, and trim the brass chords (peaks ~1.0, brighter than the reels) by ~5 dB.
          g.gain.value = 0.55 * (typeof jukeVol === "number" ? jukeVol : 0.8);
          src.buffer = buf;
          src.connect(g);
          g.connect(ctx.destination);
          src.onended = () => { if (odeSrc === src) odeSrc = null; };
          src.start();
          odeSrc = src;
        } else if (synth.start) {
          synth.start();
        }
        if (dur) setTimeout(() => { if (gen === odeGen) haltOdeAudio(); }, Math.ceil(dur * 1000) + 400);
      } catch (e) {}
    };
    run();
  }
  A.playVictory = () => {
    try { if (A.unlock) A.unlock(); } catch (e) {}
    if (!A._cueHeld) {
      A._resumeJuke = !!(A.jukePlaying && A.jukePlaying());
      if (A._resumeJuke && A.jukePause) {
        try { A.jukePause(); } catch (e) {}
      }
    }
    A._cueHeld = true;
    A.stopMusic();
    startOde();
  };
  const BEAR = [98, 110, 87, 110, 73, 87, 65, 73];
  const BULL = [329, 392, 523, 659, 523, 659, 783, 1046];
  const IDLE = [146, 220, 293, 220, 164, 246, 329, 246];
  let musicGetPower = () => "NONE";
  let musicIsPlay = () => false;
  let musicJuke = () => false;
  A.startMusic = (getPower, isPlaying, jukePlaying) => {
    if (typeof getPower === "function") musicGetPower = getPower;
    if (typeof isPlaying === "function") musicIsPlay = isPlaying;
    if (typeof jukePlaying === "function") musicJuke = jukePlaying;
    if (musicInterval != null) return;
    musicStep = 0;
    if (ctx && ctx.state === "suspended") try { ctx.resume(); } catch (e) {}
    musicInterval = setInterval(() => {
      if (!musicIsPlay()) return;
      if (ctx && ctx.state === "suspended") try { ctx.resume(); } catch (e) {}
      if (muteTheme) { musicStep++; return; }
      const p = musicGetPower();
      const juke = !!(musicJuke && musicJuke());
      if (juke && p !== "BULL" && p !== "BEAR") { musicStep++; return; }
      if (p === "BEAR") beep(BEAR[musicStep % 8], 0.22, "sawtooth", 0.07, null, 0, "theme");
      else if (p === "BULL") beep(BULL[musicStep % 8], 0.11, "square", 0.05, null, 0, "theme");
      else beep(IDLE[musicStep % 8], 0.18, "sine", 0.05, null, 0, "theme");
      musicStep++;
    }, 200);
  };
  A.ensureMusic = (getPower, isPlaying, jukePlaying) => {
    A.startMusic(getPower, isPlaying, jukePlaying);
  };
  let battleTimer = null;
  A.battleMusic = () => {
    if (battleTimer != null) { clearInterval(battleTimer); battleTimer = null; }
  };


  const BONNY_ABC = `X:1
T:Bonny at Morn
C:Traditional Northumbrian
O:Northumberland
R:Slow air
M:3/4
L:1/8
Q:1/4=76
K:Em
%%MIDI program 73
E2 | "Em"B3 c BA | B2 E2 FG | "D"A3 G FE | D2 E2 F2 |
w: The sheep's in the mea-dows, the kye's in the corn,
w: The bird's in the nest,* the trout's in the burn,
w: We're all laid i-dle wi' keep-ing the bairn,
"Em"B3 c BA | B2 E2 FG | "D"A2 F2 D2 | "Em"E4 E2 |
w: Thou's ow-er lang in thy bed, bon-ny at morn.
w: Thou hin-ders thy mo-ther at ma-ny a turn.
w: The lad win-not work and the lass win-not lairn.
"Em"B3 c BA | B2 E2 FG | "D"A3 G FE | D2 E2 F2 |
w: Can-ny at night, bon-ny at morn, thou's ow-er lang
w: Can-ny at night, bon-ny at morn, thou's ow-er lang
w: Can-ny at night, bon-ny at morn, thou's ow-er lang
"Em"ED EF GA | B2 e2 d2 | "Bm"B d3 F2 | "Em"E6 |]
w: in thy bed, bon-ny at morn.
w: in thy bed, bon-ny at morn.
w: in thy bed, bon-ny at morn.`;

  function lyricsFromAbc(abc) {
    const inline = [];
    let take = true;
    String(abc || "").split(/\n/).forEach((l) => {
      if (/^w:/i.test(l)) {
        if (!take) return;
        const text = l.replace(/^w:\s*/i, "").replace(/[_*]/g, "").replace(/-/g, "").replace(/\s+/g, " ").trim();
        if (text) inline.push(text);
        take = false;
        return;
      }
      if (/^W:|^%%|^[XTCOMRLQKN]:/i.test(l) || !l.trim()) return;
      take = true;
    });
    const src = inline.length ? inline : String(abc || "").split(/\n/).map((l) => {
      const m = l.match(/^W:\s*(.*)$/);
      if (!m) return "";
      return m[1].replace(/[_*]/g, "").replace(/-/g, "").replace(/\s+/g, " ").trim();
    }).filter(Boolean);
    return src.map((text, i) => ({ p: src.length ? i / src.length : 0, text: text }));
  }

  function tune(id, title, genre, abc) {
    return { title: title, genre: genre, abc: abc, lyrics: lyricsFromAbc(abc) };
  }

  const SHADY_ABC = `X:1
T:Shady Grove
C:Traditional
O:Appalachia (Kentucky / North Carolina)
R:Play-party / air
M:4/4
L:1/8
Q:1/4=112
K:Edor
%%MIDI program 71
"Em"E2 G2 A2 B2 A2 G2 | "D"E2 D2 E4 E2 D2 |
w: Sha-dy Grove, my lit-tle love, Sha-dy Grove I
w: Cheeks as red as a bloom-ing rose, eyes of the
w: Went to see my Sha-dy Grove, she was stand-ing
w: Wish I had a big fine horse, corn to feed him
w: When I was a lit-tle boy I want-ed a
w: Peach-es in the sum-mer-time, ap-ples in the
"Em"E2 G2 A2 B2 A2 G2 | "D"A6 G2 |
w: say,
w: deep-est brown,
w: in the door,
w: on,
w: Bar-low knife,
w: fall,
"Em"E2 G2 A2 B2 A2 G2 | "D"E2 D2 E2 D2 |
w: Sha-dy Grove, my lit-tle love, I'm bound to
w: You are the dar-ling of my heart, stay till the
w: Shoes and stock-ings in her hand, lit-tle bare
w: Sha-dy Grove to stay at home, feed him when I'm
w: Now I want lit-tle Sha-dy Grove to say she'll
w: If I can't have lit-tle Sha-dy Grove I don't want
"Em"E2 G2 "D"F2 D2 "Em"E8 |]
w: go a-way.
w: sun goes down.
w: feet on the floor.
w: gone.
w: be my wife.
w: no gal at all.`;

  const ODE_ABC = `X:1
T:Ode to Joy - Victory Fanfare
C:Ludwig van Beethoven (Arr. AI)
M:4/4
L:1/4
Q:1/4=135
K:D
%%MIDI program 56
%%MIDI chordprog 61
%%MIDI bassprog 58
|: [FAd]>[FAd] [GBe] [Adf] | [Adf] [GBe] [FAd] [EAc] | [DFBd] [DFBd] [EAc] [FAd] | [FAd]>[EAc] [EAc]2 |
[FAd]>[FAd] [GBe] [Adf] | [Adf] [GBe] [FAd] [EAc] | [DFBd] [DFBd] [EAc] [FAd] | [EAc]>[DFA] [DFA]2 |
[EAc] [EAc] [FAd] [DFBd] | [EAc] [FAd]/[GBe]/ [FAd] [DFBd] | [EAc] [FAd]/[GBe]/ [FAd] [EAc] | [DFBd] [EAc] [A,,E,A,]2 |
[FAd]>[FAd] [GBe] [Adf] | [Adf] [GBe] [FAd] [EAc] | [DFBd] [DFBd] [EAc] [FAd] | [EAc]>[DFA] [DFA]2 :|`;

  A.SONGS = {
    ode: tune("ode", "Ode to Joy", "fanfare", ODE_ABC),
    bonny: tune("bonny", "Bonny at Morn", "slow air", BONNY_ABC),
    shady: tune("shady", "Shady Grove", "play-party", SHADY_ABC),
    fisher: tune("fisher", "Fisher's Hornpipe", "hornpipe", `X:1
T:Fisher's Hornpipe
T:Hornpipe
C:James A. Fishar (London, 1778)
M:C|
L:1/8
Q:1/2=84
K:D
%%MIDI program 71
P:A
|: dc | "D"dAFA GBAG | FAFA GBAG | "D"FDFD "A"GEGE | "D"FDFD "A"E2 dc |
"D"dAFA GBAG | FAFA GBAG | "D"FAdf "A"gecA | "D"d2 d2 d2 :|
P:B
|: cd | "A"ecAc ecge | "D"fdAd fdaf | "A"ecAc ecgf | "A"edcB A2 A2 |
"G"BGDG BGdB | "D"AFDF AFdA | "G"BdcB "A"AGFE | "D"D2 D2 D2 :|`),
    hole: tune("hole", "Hole in the Wall", "hornpipe", `X:1
T:Hole in the Wall
C:Henry Purcell (1695)
O:England
R:Hornpipe
M:3/2
L:1/4
Q:1/2=84
K:G
%%MIDI program 71
P:A
|: "G"B>c B/c/d "D"Ad | "Em"G>A G/A/B "Bm"FB | "C"E>F E/F/G "G"DB | "Am"G2- "D"GF "G"G2 :|
P:B
"Em"g>f e/f/g "Am"fe | "B7"^d>e d/e/f Bf | "Em"g>f e/f/g "Am"fe | "B7"e2- e^d "Em"e2 |
"C"E>F E/F/G "D"F/G/A | "Em"G>A G/A/B "D"A/B/c | "G"B>c B/c/d "D"Dd | "Em"B2- "D"BA/B/ "G"G2 |]`),
    nightingale: tune("nightingale", "The Nightingale", "air", `X:1
T:The Nightingale
T:One Morning in May
C:Traditional
O:England / Appalachia
R:Air
M:4/4
L:1/8
Q:1/4=92
K:G
%%MIDI program 73
D2 |
"G"G2 G2 G2 B2 A2 G2 | "Em"E2 D2 E2 G2 "D"A2 D2 |
w: One morn-ing, one morn-ing, one morn-ing in May,
w: Good morn-ing, good morn-ing, good morn-ing to thee,
w: They had not been stand-ing but one hour or two,
w: Pret-ty la-dy, pret-ty la-dy, 'tis time to give o'er.
w: Pret-ty sol-dier, pret-ty sol-dier, will you mar-ry me?
w: I'll go back to Lon-don and stay there one year,
"G"G2 G2 G2 B2 A2 G2 | "Em"E2 D2 "D"D2 F2 "G"G2 D2 |
w: I met a fair coup-le a-mak-ing their way,
w: O where are you go-ing, my pret-ty la-dy?
w: When out of his knap-sack a fid-dle he drew.
w: O no, pret-ty sol-dier, please play one tune more.
w: O no, pret-ty la-dy, that nev-er can be;
w: And of-ten I'll think of you, my lit-tle dear;
"G"G2 G2 G2 B2 A2 G2 | "Em"E2 D2 E2 G2 "D"A2 D2 |
w: And one was a la-dy so neat and so fair,
w: O I'm go-ing a-walk-ing to the banks of the sea,
w: The tune that he played made the val-leys to ring.
w: I'd rath-er hear your fid-dle or the touch of one string,
w: I have a wife in Lon-don and chil-dren twice three;
w: If ev-er I re-turn, it will be in the spring,
"G"G2 G2 B2 A2 G2 E2 | "D"D2 G2 F2 A2 "G"G4 |]
w: The o-ther a sol-dier, a brave vo-lun-teer.
w: To see the wa-ters a-glid-ing, hear the night-in-gale sing.
w: O hear-ken, says the la-dy, how the night-in-gales sing.
w: Than see the wa-ters a-glid-ing, hear the night-in-gale sing.
w: Two wives in the ar-my's too man-y for me.
w: To see the wa-ters a-glid-ing, hear the night-in-gale sing.`),
    joeclark: tune("joeclark", "Old Joe Clark", "play-party", `X:1
T:Old Joe Clark
C:Traditional
O:Appalachia / American South
R:Breakdown / play-party
M:2/4
L:1/8
Q:1/4=120
K:Amix
%%MIDI program 71
P:A
|: "A"A2 A>B | c2 c>d | e2 d>c | "G"B2 A2 |
w: Old Joe Clark, the preach-er's son,
w: Once I lived on a moun-tain top,
w: Old Joe Clark he had a mule,
w: Old Joe Clark had a yel-low cat,
w: Old Joe Clark, he had a house
w: I went down to old Joe's house,
"A"A2 A>B | c2 c>d | e2 d>c | A4 :|
w: preached all o-ver the plain.
w: now I live in town.
w: his name was Mor-gan Brown,
w: she would nei-ther sing nor pray,
w: fif-teen stor-ies high,
w: he in-vit-ed me to sup-per.
P:B
|: "A"e2 e>f | g2 g>a | g2 f>e | "G"d2 c2 |
w: The on-ly text he ev-er knew
w: I'm stay-ing at a big ho-tel
w: And ev-ery tooth in that mule's head
w: She stuck her head in the but-ter-milk jar
w: And ev-ery stor-y in that house
w: I stubbed my toe on the ta-ble leg
"A"A2 A>B | c2 c>d | "G"e2 d>c | "A"A4 :|
w: was High, Low, Jack and the game.
w: court-in' Bet-sy Brown.
w: was six-teen inch-es 'round.
w: and washed her sins a-way.
w: was filled with chick-en pie.
w: and stuck my nose in the but-ter.
P:C
|: "A"A2 A>B | c2 c>d | e2 d>c | "G"B2 A2 |
w: Fare thee well, Old Joe Clark,
w: Fare thee well, Old Joe Clark,
w: Fare thee well, Old Joe Clark,
w: Fare thee well, Old Joe Clark,
w: Fare thee well, Old Joe Clark,
w: Fare thee well, Old Joe Clark,
"A"A2 A>B | c2 c>d | e2 d>c | A4 :|
w: fare thee well, I say,
w: fare thee well, I say,
w: fare thee well, I say,
w: fare thee well, I say,
w: fare thee well, I say,
w: fare thee well, I say,
|: "A"e2 e>f | g2 g>a | g2 f>e | "G"d2 c2 |
w: Fare thee well, Old Joe Clark,
w: Fare thee well, Old Joe Clark,
w: Fare thee well, Old Joe Clark,
w: Fare thee well, Old Joe Clark,
w: Fare thee well, Old Joe Clark,
w: Fare thee well, Old Joe Clark,
"A"A2 A>B | c2 c>d | "G"e2 d>c | "A"A4 :|
w: I'm a-go-in' a-way.
w: I'm a-go-in' a-way.
w: I'm a-go-in' a-way.
w: I'm a-go-in' a-way.
w: I'm a-go-in' a-way.
w: I'm a-go-in' a-way.`),
    pigfoot: tune("pigfoot", "Shove the Pig's Foot a Little Further into the Fire", "reel", `X:1
T:Shove the Pig's Foot a Little Further into the Fire
T:Little Fiddle
C:Traditional
M:C|
L:1/8
Q:1/2=92
K:G
%%MIDI program 71
P:A
|: "G"BcBA G2 EF | GAGE "D"D4 | "G"DG G2 B3 c | "D"B2 A2 A4 |
"G"BcBA G2 EF | GAGE "D"D4 | "G"DG G2 B2 G2 | "D"A2 "G"G2 G4 :|
P:B
|: "G"Bd de d4 | edBc d2 BA | Bd d2 g3 d | "C"e2 "G"d2 d4 |
"G"Bd de d4 | edBc d2 g2 | B3 c BAGB | "D"A2 "G"G2 G4 :|`),
    cavalry: tune("cavalry", "Jine the Cavalry", "march", `X:1
T:Jine the Cavalry
C:Traditional (American Civil War)
O:Virginia, c.1862
R:March
M:6/8
L:1/8
Q:3/8=108
K:D
%%MIDI program 71
P:A
"D"d2 d dcd | e2 e e2 f | "G"g2 f e2 d | "A"c2 B A2 A |
w: We're the boys that rode a-round Mc-Clel-lan,
w: We're the boys that crossed the Po-to-mac,
w: Then we went in-to Penn-syl-van-ia,
w: Ol' Joe Hook-er, won't you come out of the Wil-der-ness,
"D"d2 d dcd | e2 e e2 f | "G"g2 f "A"edc | "D"d3 d2 A |
w: rode a-round Mc-Clel-lan, rode a-round Mc-Clel-lan,
w: crossed the Po-to-mac, crossed the Po-to-mac,
w: in-to Penn-syl-van-ia, in-to Penn-syl-van-ia,
w: come out of the Wil-der-ness, come out of the Wil-der-ness,
"D"d2 d dcd | e2 e e2 f | "G"g2 f e2 d | "A"c2 B A3 |
w: We're the boys that rode a-round Mc-Clel-lan,
w: We're the boys that crossed the Po-to-mac,
w: Then we went in-to Penn-syl-van-ia,
w: Ol' Joe Hook-er, won't you come out of the Wil-der-ness,
"D"f2 f "A"e2 e | "D"d3 d3 |]
w: Bul-ly boys, hey! Bul-ly boys, ho!
w: Bul-ly boys, hey! Bul-ly boys, ho!
w: Bul-ly boys, hey! Bul-ly boys, ho!
w: Bul-ly boys, hey! Bul-ly boys, ho!
P:B
"D"d2 d dcd | e2 e e2 f | "G"g2 f e2 d | "A"c2 B A2 A |
w: If you want to have a good time, jine the cav-al-ry!
w: If you want to have a good time, jine the cav-al-ry!
w: If you want to have a good time, jine the cav-al-ry!
w: If you want to have a good time, jine the cav-al-ry!
"D"f2 f fef | "G"g2 g g2 a | "D"f2 a f2 d | "A"e3 e2 A |
w: Jine the cav-al-ry! Jine the cav-al-ry!
w: Jine the cav-al-ry! Jine the cav-al-ry!
w: Jine the cav-al-ry! Jine the cav-al-ry!
w: Jine the cav-al-ry! Jine the cav-al-ry!
"D"d2 d dcd | e2 e e2 f | "G"g2 f e2 d | "A"c2 B A3 |
w: If you want to catch the Dev-il, if you want to have fun,
w: If you want to catch the Dev-il, if you want to have fun,
w: If you want to catch the Dev-il, if you want to have fun,
w: If you want to catch the Dev-il, if you want to have fun,
"D"g2 f "A"edc | "D"d3 d3 |]
w: If you want to smell Hell, jine the cav-al-ry!
w: If you want to smell Hell, jine the cav-al-ry!
w: If you want to smell Hell, jine the cav-al-ry!
w: If you want to smell Hell, jine the cav-al-ry!`),
    blueridge: tune("blueridge", "My Home's Across the Blue Ridge Mountains", "air", `X:1
T:My Home's Across the Blue Ridge Mountains
T:Smoky Tune
C:Traditional
O:Southern Appalachia
R:Air
M:4/4
L:1/8
Q:1/4=96
K:G
%%MIDI program 73
D2 |
"G"G2 G2 B2 AG B2 G2 | "G"D2 D2 G4 G2 D2 |
w: My home's a-cross the Blue Ridge Moun-tains,
w: How can I keep from cry-ing,
w: I'm leav-ing here this Mon-day morn-ing,
w: Good-bye, my lit-tle dar-ling,
w: Don't the road look rough and rock-y?
w: I thought I heard a freight train blow-ing,
"G"G2 G2 B2 AG B2 G2 | "D"A6 G2 D2 |
w: My home's a-cross the Blue Ridge Moun-tains,
w: How can I keep from cry-ing,
w: I'm leav-ing here this Mon-day morn-ing,
w: Good-bye, my lit-tle dar-ling,
w: Don't the road look rough and rock-y?
w: I thought I heard a freight train blow-ing,
"G"G2 G2 B2 AG B2 G2 | "G"D2 D2 G4 G2 D2 |
w: My home's a-cross the Blue Ridge Moun-tains,
w: How can I keep from cry-ing,
w: I'm leav-ing here this Mon-day morn-ing,
w: Good-bye, my lit-tle dar-ling,
w: Don't the road look rough and rock-y?
w: I thought I heard a freight train blow-ing,
"D"A2 B2 A2 F2 "G"G4 |]
w: I nev-er ex-pect to see you an-y more.
w: I nev-er ex-pect to see you an-y more.
w: I nev-er ex-pect to see you an-y more.
w: I nev-er ex-pect to see you an-y more.
w: I nev-er ex-pect to see you an-y more.
w: I nev-er ex-pect to hear it blown no more.`),
    campaign: tune("campaign", "Success to the Campaign", "reel", `X:1
T:Success to the Campaign
T:The Successful Campaign
C:Traditional
M:C|
L:1/8
Q:1/2=88
K:G
%%MIDI program 71
P:A
|: "G"G2 GB "D"A2 Ac | "G"BGBd g4 | gfed edcB | "C"cBAG "D"GFED |
"G"G2 GB "D"A2 Ac | "G"BGBd g4 | gfed "A"efge | "D"fde^c d4 :|
P:B
|: "D"d2 d=f e2 d2 | "C"c2 B2 c2 A2 | c2 ce d2 c2 | "G"B2 A2 B2 G2 |
"G"G2 GB "D"A2 Ac | "G"BGBd g4 | gfed edcB | "D"AGAB "G"G4 :|`),
    morelli: tune("morelli", "Morelli's Lesson", "march", `X:1
T:Morelli's Lesson
C:Traditional
M:C
L:1/8
Q:1/4=108
K:G
%%MIDI program 72
P:A
|: D2 | "G"G2 G>G GBAc | B2 B>B Bdce | dgfe dcBA | G2 G>G G2 dB |
G2 G>G GBAc | B2 B>B Bdce | dgfe dcBA | G2 G>G G2 :|
P:B
|: Bc | "G"d2 d>d dgfe | d2 d>d d2 Bc | dBGB dBGB | "D"cAFA cAFA |
"Em"BGEG BGEG | "D"A2 A>A AcBA | "G"G2 G>G GBAc | B2 B>B Bdce |
dgfe dcBA | G2 G>G G2 :|`),
    boston: tune("boston", "Road to Boston", "march", `X:1
T:Road to Boston
T:We are on the march to Boston
C:Traditional
M:2/4
L:1/8
Q:1/4=100
K:G
%%MIDI program 72
P:A
|: "G"B2 B A/B/ | cB AG | "D"FG AB | G/F/G/A/ GA |
"G"B2 B A/B/ | cB AG | "D"FG AB | "G"G2 G2 :|
P:B
|: "G"d2 d c/d/ | ed cB | "C"c2 c B/c/ | dc BA |
"G"B2 B A/B/ | cB AG | "D"FG A/c/B/A/ | "G"G2 G2 :|`),
    york: tune("york", "York Fusiliers", "march", `X:1
T:York Fusiliers
C:Traditional
M:2/4
L:1/8
Q:1/4=96
K:D
%%MIDI program 72
P:A
|: "D"D2 FA | de/f/ ge | fd cd | "A"e/d/c/B/ A/G/F/E/ |
"D"D2 FA | de/f/ ge | fd "A"c/d/e/c/ | "D"d4 :|
P:B
|: "A"fe e2 | "D"fa a2 | fa fd | "A"e/d/c/B/ A/B/c/d/ |
fe e2 | "D"fa a2 | fa fd | "A"e4 :|
P:C
|: "D"DA A2 | DB B2 | AB A/G/F/E/ | Dd cd |
DA A2 | DB B2 | AB A/G/F/E/ | "A"E2 "D"D2 :|
P:D
|: "D"A>G Fd | A>G Fd | "G"BA GF | "A"E/D/E/F/ E2 |
"D"A>G Fd | A>G Fd | "G"Bg "A"f/d/e/c/ | "D"d4 :|`),
    artillery: tune("artillery", "Washington's Artillery March", "march", `X:1
T:Washington's Artillery March
C:Traditional
M:2/4
L:1/8
Q:1/4=100
K:D
%%MIDI program 72
P:A
|: f/e/ | "D"dd AA | BB Ad | "A"c/d/e/f/ gf | f2 e f/e/ |
"D"dd AA | BB Ad | "A"c/d/e/f/ g/f/e/d/ | e2 "D"d :|
P:B
|: A | "D"AA A/A/A | dA/A/ Af | "G"gg "D"ff | f2 e A |
AA A/A/A | dA/A/ Ad | "A"c/d/e/f/ g/e/d/c/ | e2 "D"d :|
P:C
|: A | "D"dA fA | dA/d/ fA | dA df | d2 ff |
"G"ge ea/g/ | "D"fd dd | "A"c/d/e/f/ g/e/d/c/ | e2 "D"d :|`),
    misty: tune("misty", "One Misty Moisty Morning", "air", `X:1
T:One Misty Moisty Morning
T:The Wiltshire Wedding
C:Traditional
O:England
R:Air
M:6/8
L:1/8
Q:3/8=96
K:G
%%MIDI program 73
D |
"G"G2 G GAB | "C"c2 B A2 G | "D"F2 G A2 B | "G"G3 G2 D |
w: One mis-ty mois-ty morn-ing when cloud-y was the wea-ther,
w: This rus-tic was a thresh-er as on his way he hied,
w: I went a lit-tle fur-ther and there I met a maid,
w: This maid, her name was Dol-ly, clothed in a gown of grey,
w: I said that I would mar-ried be and she would be my bride,
"G"G2 G GAB | "C"c2 B A2 G | "D"F2 G A2 B | "G"G3 G2 B |
w: I met with an old man a-cloth-ed all in leath-er.
w: And with a leath-er bot-tle fast buck-led by his side.
w: A-go-ing a-milk-ing, a-milk-ing, sir, she said.
w: I be-ing some-what jol-ly, per-suad-ed her to stay.
w: And long we should not tar-ry, and twen-ty things be-side.
"G"d2 d d2 B | "C"c2 B A2 G | "D"F2 G A2 B | "Em"G3 G2 D |
w: He was cloth-ed all in leath-er with a cap be-neath his chin,
w: He wore no shirt up-on his back but wool un-to his skin,
w: Then I be-gan to com-pli-ment and she be-gan to sing,
w: And straight I fell a-court-ing her in hopes her love to win,
w: I'll plough and sow and reap and mow and you shall sit and spin,
"G"G2 B d2 B | "C"c2 A "D"F2 D | "G"G2 B "D"A2 F | "G"G3 G2 |]
w: Sing-ing, How do you do and how do you do and how do you do a-gain.
w: Sing-ing, How do you do and how do you do and how do you do a-gain.
w: Say-ing, How do you do and how do you do and how do you do a-gain.
w: Sing-ing, How do you do and how do you do and how do you do a-gain.
w: Sing-ing, How do you do and how do you do and how do you do a-gain.`),
    toarms: tune("toarms", "To Arms", "duty call", `X:1
T:To Arms
C:Traditional (camp duty)
M:2/4
L:1/8
Q:1/4=100
K:G
%%MIDI program 72
P:A
|: "G"d2 d>B | "C"e2 e>c | "G"d2 d>B | "D"A2 G2 :|
P:B
|: "G"B2 B>G | "C"c2 c>A | "G"d2 d>B | "D"A2 G2 :|`),
    reveille: tune("reveille", "The Reveille", "duty call", `X:1
T:The Reveille
T:The Three Camps
C:Traditional (camp duty)
M:2/4
L:1/8
Q:1/4=108
K:G
%%MIDI program 72
P:A
|: c | "G"B2 A2 | G3 g | "D"f2 e2 | d/^c/d/e/ d>=c | "G"B2 A2 | G3 g | "D"f2 e2 | d3 :|
P:B
|: d | "G"gd BA/G/ | "C"e3 d | c2 B2 | "D"A3 c | "G"B2 A2 | G2 g2 | B2 "D"cA | "G"G3 :|`),
    bird: tune("bird", "The Bird Song", "air", `X:1
T:The Bird Song
T:The Birds' Courting Song
C:Traditional
O:England / Appalachia / Vermont
R:Air
M:4/4
L:1/8
Q:1/4=92
K:G
%%MIDI program 73
D2 |
"G"G2 G2 A2 B2 c2 B2 | "D"A2 G2 B2 A2 G2 E2 |
w: Hi! says the black-bird, sit-ting on a chair,
w: Hi! says the blue-jay as she flew,
w: Hi! says the lit-tle leath-er-wing-ed bat,
w: Hi! says the lit-tle mourn-ing dove,
w: Hi! said the wood-peck-er sit-ting on a fence,
"G"D6 D2 G2 G2 | "D"A2 B2 c2 B2 A2 G2 |
w: Once I court-ed a la-dy fair;
w: If I was a young man I'd have two;
w: I will tell you the rea-son that,
w: I'll tell you how to gain her love;
w: Once I court-ed a hand-some wench;
"Em"B2 A2 G2 E2 D4 | "G"G2 G2 A2 B2 c2 B2 |
w: She proved fick-le and turned her back,
w: If one proved fick-le and chanced for to go,
w: The rea-son that I fly in the night
w: Court her night and court her day,
w: She proved fick-le and from me fled,
"D"A2 F2 "G"G6 |]
w: And ev-er since then I'm dressed in black.
w: I'd have a new string to my bow.
w: Is be-cause I lost my heart's de-light.
w: Nev-er give her time to say O nay.
w: And ev-er since then my head's been red.`),
    stilly: tune("stilly", "Oft in the Stilly Night", "air", `X:1
T:Oft in the Stilly Night
T:Scanlon's Fiddle Setting
C:Tradicional (Arr. Batt Scanlon, 1923)
R:Air
M:2/4
L:1/8
Q:1/4=72
K:C
%%MIDI gchord off
%%MIDI nobeataccents
%%MIDI gracedivider 4
V:1
%%MIDI program 40
%%MIDI channel 1
V:2
%%MIDI program 42
%%MIDI channel 2
V:1
!mf! e2 e>d | c>A A/B/c | G>G ce | de/f/ e2 |
V:2
!pppp! [C,G,]4 | [A,,E,]4 | [C,G,]4 | [B,,F,]2 [C,G,]2 |
V:1
e2 e>d | c>A Ac | G<G e>c | d2 c z/G/ ||
V:2
[C,G,]4 | [A,,E,]4 | [C,G,]2 [A,,E,]2 | [B,,F,]2 [C,G,]2 |
V:1
G>c c>c | d>c c z/c/ | e>c cc | d2 c z/G/ |
V:2
[C,G,]4 | [B,,F,]2 [C,G,]2 | [A,,E,]4 | [B,,F,]2 [C,G,]2 |
V:1
G>c c>c | d>c c z/c/ | e>c cc | de/f/ e2 ||
V:2
[F,,C,]2 [C,G,]2 | [D,A,]2 [B,,F,]2 | [C,G,]2 [A,,E,]2 | [B,,F,]2 [C,G,]2 |
V:1
e2 e>d | c<A A>c | G>G ce | de/f/ e2 |
V:2
[C,G,]4 | [A,,E,]4 | [C,G,]4 | [B,,F,]2 [C,G,]2 |
V:1
e2 e>d | c>A Ac | G<G e>c | d2 c2 ||
V:2
[C,G,]4 | [A,,E,]4 | [C,G,]2 [A,,E,]2 | [B,,F,]2 [C,G,]2 |
V:1
!p! e2 e>d | c>A A/B/c | G>G ce | de/f/ e2 |
V:2
[C,G,]4 | [A,,E,]4 | [C,G,]4 | [B,,F,]2 [C,G,]2 |
V:1
e2 e>d | c>A Ac | G<G e>c | d2 c z/G/ ||
V:2
[C,G,]4 | [A,,E,]4 | [C,G,]2 [A,,E,]2 | [B,,F,]2 [C,G,]2 |
V:1
G>c c>c | d>c c z/c/ | e>c cc | d2 c z/G/ |
V:2
[C,G,]4 | [B,,F,]2 [C,G,]2 | [A,,E,]4 | [B,,F,]2 [C,G,]2 |
V:1
G>c c>c | d>c c z/c/ | e>c cc | de/f/ e2 ||
V:2
[F,,C,]2 [C,G,]2 | [D,A,]2 [B,,F,]2 | [C,G,]2 [A,,E,]2 | [B,,F,]2 [C,G,]2 |
V:1
e2 e>d | c<A A>c | G>G ce | de/f/ e2 |
V:2
[C,G,]4 | [A,,E,]4 | [C,G,]4 | [B,,F,]2 [C,G,]2 |
V:1
e2 e>d | c>A Ac | G<G e>c | d2 !fermata!c2 |]
V:2
[C,G,]4 | [A,,E,]4 | [C,G,]2 [A,,E,]2 | [B,,F,]2 !fermata![C,G,]2 |]`),
    arkansas: tune("arkansas", "Arkansas Traveler", "reel", `X:1
T:Arkansas Traveler
C:Traditional
M:2/4
L:1/16
Q:1/4=112
R:Reel
K:D
%%MIDI gchord off
%%score (Melodia) (Bajo)
V:Melodia clef=treble name="Melodia"
%%MIDI program 40
%%MIDI channel 1
V:Bajo clef=bass name="Fondo"
%%MIDI program 32
%%MIDI channel 2
V:Melodia
|: DFED B,2B,2 | A,2A,2 D4 | B,2B,2 D2D2 | E2E2 E2FE |
DFED B,2B,2 | A,2A,2 D4 | d2B2 A2F2 |1 E2FE D4 :|2 E2FE D2fg ||
|: fedf e2d2 | B,2B,2 d4 | c2c2 e2e2 | defg a2fg |
fedf e2d2 | B,2B,2 d2A2 | d2B2 A2F2 |1 E2FE D2fg :|2 E2FE D4 ||
V:Bajo
|: D,2[F,A,]2 D,2[F,A,]2 | A,,2[E,A,]2 D,2[F,A,]2 | G,,2[G,B,]2 D,2[F,A,]2 | A,,2[E,A,]2 A,,2[E,A,]2 |
D,2[F,A,]2 D,2[F,A,]2 | A,,2[E,A,]2 D,2[F,A,]2 | G,,2[G,B,]2 D,2[F,A,]2 |1 A,,2[E,A,]2 D,4 :|2 A,,2[E,A,]2 D,2z2 ||
|: D,2[F,A,]2 D,2[F,A,]2 | G,,2[G,B,]2 D,2[F,A,]2 | A,,2[E,A,]2 A,,2[E,A,]2 | D,2[F,A,]2 D,2z2 |
D,2[F,A,]2 D,2[F,A,]2 | G,,2[G,B,]2 D,2[F,A,]2 | G,,2[G,B,]2 D,2[F,A,]2 |1 A,,2[E,A,]2 D,2z2 :|2 A,,2[E,A,]2 D,4 ||`),
    cripple: tune("cripple", "Cripple Creek", "reel", `X:1
T:Cripple Creek
C:Traditional
M:2/4
L:1/16
Q:1/4=120
R:Reel
K:D
%%MIDI gchord off
%%score (Melodia) (Bajo)
V:Melodia clef=treble name="Melodia"
%%MIDI program 40
%%MIDI channel 1
V:Bajo clef=bass name="Fondo"
%%MIDI program 32
%%MIDI channel 2
V:Melodia
|: f2af e2de | f2f2 d4 | f2af e2dB | A2Bc d4 :|
|: B2B2 d2d2 | B2B2 A4 | f2af e2dB | A2Bc d4 :|
V:Bajo
|: D,2[F,A,]2 A,,2[E,A,]2 | D,2[F,A,]2 D,2[F,A,]2 | D,2[F,A,]2 A,,2[E,A,]2 | A,,2[E,A,]2 D,4 :|
|: G,,2[G,B,]2 D,2[F,A,]2 | G,,2[G,B,]2 D,2[F,A,]2 | D,2[F,A,]2 A,,2[E,A,]2 | A,,2[E,A,]2 D,4 :|`),
    cluck: tune("cluck", "Cluck Old Hen", "reel", `X:1
T:Cluck Old Hen
C:Traditional
M:2/4
L:1/16
Q:1/4=108
R:Reel
K:Dmix
%%MIDI gchord off
%%score (Melodia) (Bajo)
V:Melodia clef=treble name="Melodia"
%%MIDI program 40
%%MIDI channel 1
V:Bajo clef=bass name="Fondo"
%%MIDI program 32
%%MIDI channel 2
V:Melodia
|: f2fg a2a2 | g2ge d4 | f2fg a2a2 | e2fe d4 :|
|: d2d2 B2A2 | g2ge d4 | d2dB c2c2 | e2fe d4 :|
V:Bajo
|: D,2[F,A,]2 D,2[F,A,]2 | C,2[E,G,]2 D,2[F,A,]2 | D,2[F,A,]2 D,2[F,A,]2 | A,,2[E,A,]2 D,4 :|
|: D,2[F,A,]2 G,,2[G,B,]2 | C,2[E,G,]2 D,2[F,A,]2 | D,2[F,A,]2 C,2[E,G,]2 | A,,2[E,A,]2 D,4 :|`),
    turkey: tune("turkey", "Turkey in the Straw", "reel", `X:1
T:Turkey in the Straw
C:Traditional
M:2/4
L:1/16
Q:1/4=116
R:Reel
K:G
%%MIDI gchord off
%%score (Melodia) (Bajo)
V:Melodia clef=treble name="Melodia"
%%MIDI program 40
%%MIDI channel 1
V:Bajo clef=bass name="Fondo"
%%MIDI program 32
%%MIDI channel 2
V:Melodia
|: BA | G2G2 G2GA | B2B2 B2Bc | d2d2 edBc | d2d2 B2A2 |
G2G2 G2GA | B2B2 B2Bc | d2d2 B2A2 | G2G2 G2 :|
|: d2 | b2b2 g2ga | b2b2 g4 | c'2c'2 a2ab | c'2c'2 a2ga |
b2b2 g2ga | b2d2 e2fg | d2d2 B2A2 | G2G2 G2 :|
V:Bajo
|: z2 | G,,2[G,B,]2 G,,2[G,B,]2 | G,,2[G,B,]2 G,,2[G,B,]2 | G,,2[G,B,]2 G,,2[G,B,]2 | D,2[F,A,]2 D,2[F,A,]2 |
G,,2[G,B,]2 G,,2[G,B,]2 | G,,2[G,B,]2 G,,2[G,B,]2 | D,2[F,A,]2 D,2[F,A,]2 | G,,2[G,B,]2 G,,2 :|
|: z2 | G,,2[G,B,]2 G,,2[G,B,]2 | G,,2[G,B,]2 G,,2[G,B,]2 | D,2[F,A,]2 D,2[F,A,]2 | D,2[F,A,]2 D,2[F,A,]2 |
G,,2[G,B,]2 G,,2[G,B,]2 | G,,2[G,B,]2 C,2[G,C]2 | D,2[F,A,]2 D,2[F,A,]2 | G,,2[G,B,]2 G,,2 :|`),
    soldiers: tune("soldiers", "Soldier's Joy", "reel", `X:1
T:Soldier's Joy
C:Traditional
M:2/4
L:1/16
Q:1/4=120
R:Reel
K:D
%%MIDI gchord off
%%score (Melodia) (Bajo)
V:Melodia clef=treble name="Melodia"
%%MIDI program 40
%%MIDI channel 1
V:Bajo clef=bass name="Fondo"
%%MIDI program 32
%%MIDI channel 2
V:Melodia
|: FG | AFDF AFDF | A2d2 d2cB | AFDF AFDF | G2E2 E2FG |
AFDF AFDF | A2d2 d2fg | afdf e2fe | d2d2 d2 :|
|: fg | a2f2 f2ef | g2e2 e2de | f2df edcB | A2A2 A2fg |
a2f2 f2ef | g2e2 e2de | f2df edce | d2d2 d2 :|
V:Bajo
|: z2 | D,2[F,A,]2 D,2[F,A,]2 | D,2[F,A,]2 D,2[F,A,]2 | D,2[F,A,]2 D,2[F,A,]2 | A,,2[E,A,]2 A,,2[E,A,]2 |
D,2[F,A,]2 D,2[F,A,]2 | D,2[F,A,]2 D,2[F,A,]2 | D,2[F,A,]2 A,,2[E,A,]2 | D,2[F,A,]2 D,2 :|
|: z2 | D,2[F,A,]2 D,2[F,A,]2 | A,,2[E,A,]2 A,,2[E,A,]2 | D,2[F,A,]2 D,2[F,A,]2 | A,,2[E,A,]2 A,,2[E,A,]2 |
D,2[F,A,]2 D,2[F,A,]2 | A,,2[E,A,]2 A,,2[E,A,]2 | D,2[F,A,]2 A,,2[E,A,]2 | D,2[F,A,]2 D,2 :|`),
    redwing: tune("redwing", "Red Wing", "reel", `X:1
T:Red Wing
C:Traditional / F.A. Mills
M:2/4
L:1/16
Q:1/4=108
R:Reel
K:G
%%MIDI gchord off
%%score (Melodia) (Bajo)
V:Melodia clef=treble name="Melodia"
%%MIDI program 40
%%MIDI channel 1
V:Bajo clef=bass name="Fondo"
%%MIDI program 32
%%MIDI channel 2
V:Melodia
|: D2 | G3G G2B2 | d6 g2 | e2e2 e2g2 | d6 B2 |
c2c2 c2e2 | B2B2 B2d2 | A2A2 B2B2 | A6 D2 |
G3G G2B2 | d6 g2 | e2e2 e2g2 | d6 B2 |
c2c2 c2e2 | B2B2 B2d2 | A2A2 B2A2 | G6 :|
V:Bajo
|: z2 | G,,2[G,B,]2 G,,2[G,B,]2 | G,,2[G,B,]2 G,,2[G,B,]2 | C,2[G,C]2 C,2[G,C]2 | G,,2[G,B,]2 G,,2[G,B,]2 |
C,2[G,C]2 C,2[G,C]2 | G,,2[G,B,]2 G,,2[G,B,]2 | A,,2[E,A,]2 A,,2[E,A,]2 | D,2[F,A,]2 D,2z2 |
G,,2[G,B,]2 G,,2[G,B,]2 | G,,2[G,B,]2 G,,2[G,B,]2 | C,2[G,C]2 C,2[G,C]2 | G,,2[G,B,]2 G,,2[G,B,]2 |
C,2[G,C]2 C,2[G,C]2 | G,,2[G,B,]2 G,,2[G,B,]2 | D,2[F,A,]2 D,2[F,A,]2 | G,,2[G,B,]2 G,,2 :|`),
    whiskey: tune("whiskey", "Whiskey Before Breakfast", "reel", `X:1
T:Whiskey Before Breakfast
C:Traditional
M:2/4
L:1/16
Q:1/4=120
R:Reel
K:D
%%MIDI gchord off
%%score (Melodia) (Bajo)
V:Melodia clef=treble name="Melodia"
%%MIDI program 40
%%MIDI channel 1
V:Bajo clef=bass name="Fondo"
%%MIDI program 32
%%MIDI channel 2
V:Melodia
|: A,2 | D2D2 DEFG | A2B2 A2FA | d2d2 c2A2 | B2Bc B2A2 |
D2D2 DEFG | A2B2 A2FA | d2B2 A2F2 | G2FE D2 :|
|: z2 | d2d2 c2A2 | B2Bc B2A2 | defg a2f2 | e2e2 e2A2 |
D2D2 DEFG | A2B2 A2FA | d2B2 A2F2 | G2FE D2 :|
V:Bajo
|: z2 | D,2[F,A,]2 D,2[F,A,]2 | D,2[F,A,]2 D,2[F,A,]2 | D,2[F,A,]2 A,,2[E,A,]2 | G,,2[G,B,]2 G,,2[G,B,]2 |
D,2[F,A,]2 D,2[F,A,]2 | D,2[F,A,]2 D,2[F,A,]2 | G,,2[G,B,]2 D,2[F,A,]2 | A,,2[E,A,]2 D,2 :|
|: z2 | D,2[F,A,]2 A,,2[E,A,]2 | G,,2[G,B,]2 G,,2[G,B,]2 | D,2[F,A,]2 D,2[F,A,]2 | A,,2[E,A,]2 A,,2[E,A,]2 |
D,2[F,A,]2 D,2[F,A,]2 | D,2[F,A,]2 D,2[F,A,]2 | G,,2[G,B,]2 D,2[F,A,]2 | A,,2[E,A,]2 D,2 :|`),
    grenadiers: tune("grenadiers", "The British Grenadiers", "march", `X:1
T:The British Grenadiers
C:Traditional
M:2/4
L:1/16
Q:1/4=100
R:March
K:G
%%MIDI gchord off
%%score (Melodia) (Bajo)
V:Melodia clef=treble name="Melodia"
%%MIDI program 72
%%MIDI channel 1
V:Bajo clef=bass name="Fondo"
%%MIDI program 32
%%MIDI channel 2
V:Melodia
|: D2 | G2D2 G2A2 | B2cB A2GA | B2c2 d2cB | A6 D2 |
G2D2 G2A2 | B2cB A2GA | B2cB A2BA | G6 :|
|: d2 | d3e d2c2 | B2c2 d2d2 | e2e2 d2cB | A6 D2 |
G2D2 G2A2 | B2d2 g2fg | edcB A2BA | G6 :|
V:Bajo
|: z2 | G,,2[G,B,]2 G,,2[G,B,]2 | G,,2[G,B,]2 D,2[F,A,]2 | G,,2[G,B,]2 G,,2[G,B,]2 | D,2[F,A,]2 D,2z2 |
G,,2[G,B,]2 G,,2[G,B,]2 | G,,2[G,B,]2 D,2[F,A,]2 | G,,2[G,B,]2 D,2[F,A,]2 | G,,2[G,B,]2 G,,2 :|
|: z2 | G,,2[G,B,]2 D,2[F,A,]2 | G,,2[G,B,]2 G,,2[G,B,]2 | C,2[G,C]2 G,,2[G,B,]2 | D,2[F,A,]2 D,2z2 |
G,,2[G,B,]2 G,,2[G,B,]2 | G,,2[G,B,]2 G,,2[G,B,]2 | C,2[G,C]2 D,2[F,A,]2 | G,,2[G,B,]2 G,,2 :|`),
    leftbehind: tune("leftbehind", "The Girl I Left Behind Me", "march", `X:1
T:The Girl I Left Behind Me
C:Traditional
M:2/4
L:1/16
Q:1/4=108
R:March
K:G
%%MIDI gchord off
%%score (Melodia) (Bajo)
V:Melodia clef=treble name="Melodia"
%%MIDI program 72
%%MIDI channel 1
V:Bajo clef=bass name="Fondo"
%%MIDI program 32
%%MIDI channel 2
V:Melodia
|: g2fg e2dB | A2G2 E2F2 | G2G2 G2AB | c2BA B2d2 |
g2fg e2dB | A2G2 E2F2 | G2GA F2EF | G4 G4 :|
|: B2cd e2f2 | g2dB B2A2 | B2cd e2fg | a2f2 d4 |
g2fg e2dB | A2G2 E2F2 | G2GA F2EF | G4 G4 :|
V:Bajo
|: G,,2[G,B,]2 C,2[G,C]2 | D,2[F,A,]2 C,2[G,C]2 | G,,2[G,B,]2 G,,2[G,B,]2 | D,2[F,A,]2 G,,2[G,B,]2 |
G,,2[G,B,]2 C,2[G,C]2 | D,2[F,A,]2 C,2[G,C]2 | G,,2[G,B,]2 D,2[F,A,]2 | G,,2[G,B,]2 G,,4 :|
|: G,,2[G,B,]2 C,2[G,C]2 | G,,2[G,B,]2 D,2[F,A,]2 | G,,2[G,B,]2 C,2[G,C]2 | D,2[F,A,]2 D,4 |
G,,2[G,B,]2 C,2[G,C]2 | D,2[F,A,]2 C,2[G,C]2 | G,,2[G,B,]2 D,2[F,A,]2 | G,,2[G,B,]2 G,,4 :|`),
    yankee: tune("yankee", "Yankee Doodle", "march", `X:1
T:Yankee Doodle
C:Traditional
M:2/4
L:1/16
Q:1/4=112
R:March
K:G
%%MIDI gchord off
%%score (Melodia) (Bajo)
V:Melodia clef=treble name="Melodia"
%%MIDI program 72
%%MIDI channel 1
V:Bajo clef=bass name="Fondo"
%%MIDI program 32
%%MIDI channel 2
V:Melodia
|: G2G2 A2B2 | G2B2 A2D2 | G2G2 A2B2 | G4 F4 |
G2G2 A2B2 | c2B2 A2G2 | F2D2 E2F2 | G4 G4 :|
|: E3F E2F2 | G2G2 E4 | D3E D2E2 | F2F2 D4 |
G2G2 A2B2 | c2B2 A2G2 | F2D2 E2F2 | G4 G4 :|
V:Bajo
|: G,,2[G,B,]2 D,2[F,A,]2 | G,,2[G,B,]2 D,2[F,A,]2 | G,,2[G,B,]2 D,2[F,A,]2 | G,,2[G,B,]2 D,2[F,A,]2 |
G,,2[G,B,]2 D,2[F,A,]2 | C,2[G,C]2 G,,2[G,B,]2 | D,2[F,A,]2 D,2[F,A,]2 | G,,2[G,B,]2 G,,4 :|
|: C,2[G,C]2 C,2[G,C]2 | G,,2[G,B,]2 C,2[G,C]2 | G,,2[G,B,]2 G,,2[G,B,]2 | D,2[F,A,]2 D,2[F,A,]2 |
G,,2[G,B,]2 D,2[F,A,]2 | C,2[G,C]2 G,,2[G,B,]2 | D,2[F,A,]2 D,2[F,A,]2 | G,,2[G,B,]2 G,,4 :|`),
    garyowen: tune("garyowen", "Garyowen", "march", `X:1
T:Garyowen
C:Traditional
M:6/8
L:1/8
Q:3/8=112
R:March
K:G
%%MIDI gchord off
%%score (Melodia) (Bajo)
V:Melodia clef=treble name="Melodia"
%%MIDI program 72
%%MIDI channel 1
V:Bajo clef=bass name="Fondo"
%%MIDI program 32
%%MIDI channel 2
V:Melodia
|: g/f/ | edB BAG | B2B B2 g/f/ | edB BAG | A2A A2 g/f/ |
edB BAG | B2B B2 d | def g2e | d2B G2 :|
|: B/A/ | G2B d2B | g2d d2 B/A/ | G2B d2B | a2e e2 f/g/ |
g2f e2d | B2d g2 d | def g2e | d2B G2 :|
V:Bajo
|: z | G,,3 G,,3 | G,,3 G,,3 | G,,3 G,,3 | D,3 D,3 |
G,,3 G,,3 | G,,3 G,,3 | D,3 D,3 | G,,3 G,,2 :|
|: z | G,,3 G,,3 | G,,3 G,,3 | G,,3 G,,3 | C,3 C,3 |
G,,3 C,3 | G,,3 G,,3 | D,3 D,3 | G,,3 G,,2 :|`),
    chester: tune("chester", "Chester", "march", `X:1
T:Chester
C:William Billings (1770)
M:2/4
L:1/8
Q:1/4=92
R:March
K:G
%%MIDI gchord off
%%score (Melodia) (Bajo)
V:Melodia clef=treble name="Melodia"
%%MIDI program 72
%%MIDI channel 1
V:Bajo clef=bass name="Fondo"
%%MIDI program 32
%%MIDI channel 2
V:Melodia
|: G2 G2 | A2 B2 | G2 F2 | G4 | B2 B2 | A2 G2 | c2 B2 | A4 |
B2 d2 | c2 B2 | A2 G2 | F4 | G2 A2 | B2 c2 | B2 A2 | G4 :|
V:Bajo
|: G,,2 [G,B,]2 | D,2 [F,A,]2 | G,,2 [G,B,]2 | G,,4 | G,,2 [G,B,]2 | D,2 [F,A,]2 | C,2 [G,C]2 | D,4 |
G,,2 [G,B,]2 | C,2 [G,C]2 | D,2 [F,A,]2 | D,4 | G,,2 [G,B,]2 | G,,2 [G,B,]2 | D,2 [F,A,]2 | G,,4 :|`),
    coocoo: tune("coocoo", "The Coo Coo Bird", "ballad", `X:1
T:The Coo Coo Bird
C:Traditional
M:2/4
L:1/16
Q:1/4=88
R:Folk Ballad
K:Dmix
%%MIDI gchord off
%%score (Melodia) (Bajo)
V:Melodia clef=treble name="Melodia"
%%MIDI program 40
%%MIDI channel 1
V:Bajo clef=bass name="Fondo"
%%MIDI program 32
%%MIDI channel 2
V:Melodia
|: d4 d2e2 | f2d2 B2A2 | d4 d2e2 | f2a2 a4 |
b4 a2f2 | e2d2 B2A2 | B2dB A2F2 | E2D2 D4 :|
V:Bajo
|: D,2[F,A,]2 D,2[F,A,]2 | G,,2[G,B,]2 D,2[F,A,]2 | D,2[F,A,]2 D,2[F,A,]2 | D,2[F,A,]2 D,4 |
G,,2[G,B,]2 D,2[F,A,]2 | C,2[E,G,]2 D,2[F,A,]2 | G,,2[G,B,]2 D,2[F,A,]2 | A,,2[E,A,]2 D,4 :|`),
    wildwood: tune("wildwood", "Wildwood Flower", "ballad", `X:1
T:Wildwood Flower
C:Traditional / J.P. Carter
M:2/4
L:1/16
Q:1/4=96
R:Folk Ballad
K:C
%%MIDI gchord off
%%score (Melodia) (Bajo)
V:Melodia clef=treble name="Melodia"
%%MIDI program 40
%%MIDI channel 1
V:Bajo clef=bass name="Fondo"
%%MIDI program 32
%%MIDI channel 2
V:Melodia
|: G2 | C2E2 G2G2 | A2A2 G4 | G2c2 B2A2 | G2E2 D2z2 |
C2E2 G2G2 | A2A2 G4 | G2A2 G2E2 | D2C2 C3 :|
|: G2 | c2c2 c2d2 | e2e2 d2c2 | e2e2 d2c2 | A2G2 G2z2 |
C2E2 G2G2 | A2A2 G4 | G2A2 G2E2 | D2C2 C3 :|
V:Bajo
|: z2 | C,2[E,G,]2 C,2[E,G,]2 | F,,2[F,A,]2 C,2[E,G,]2 | C,2[E,G,]2 G,,2[D,G,]2 | C,2[E,G,]2 G,,2z2 |
C,2[E,G,]2 C,2[E,G,]2 | F,,2[F,A,]2 C,2[E,G,]2 | C,2[E,G,]2 C,2[E,G,]2 | G,,2[D,G,]2 C,3 :|
|: z2 | C,2[E,G,]2 C,2[E,G,]2 | C,2[E,G,]2 C,2[E,G,]2 | C,2[E,G,]2 C,2[E,G,]2 | F,,2[F,A,]2 C,2z2 |
C,2[E,G,]2 C,2[E,G,]2 | F,,2[F,A,]2 C,2[E,G,]2 | C,2[E,G,]2 C,2[E,G,]2 | G,,2[D,G,]2 C,3 :|`),
    barley: tune("barley", "The Wind That Shakes the Barley", "reel", `X:1
T:The Wind That Shakes the Barley
C:Traditional
M:2/4
L:1/16
Q:1/4=120
R:Reel
K:D
%%MIDI gchord off
%%score (Melodia) (Bajo)
V:Melodia clef=treble name="Melodia"
%%MIDI program 40
%%MIDI channel 1
V:Bajo clef=bass name="Fondo"
%%MIDI program 32
%%MIDI channel 2
V:Melodia
|: B2 | A2FA B2GB | A2FA fedB | A2FA B2GB | gfed B2 :|
|: de | f2fd g2ge | f2fd edBA | f2fd g2ge | fedB d2 :|
V:Bajo
|: z2 | D,2[F,A,]2 G,,2[G,B,]2 | D,2[F,A,]2 G,,2[G,B,]2 | D,2[F,A,]2 G,,2[G,B,]2 | A,,2[E,A,]2 G,,2 :|
|: z2 | D,2[F,A,]2 G,,2[G,B,]2 | D,2[F,A,]2 A,,2[E,A,]2 | D,2[F,A,]2 G,,2[G,B,]2 | A,,2[E,A,]2 D,2 :|`),
    blossom: tune("blossom", "Blackberry Blossom", "reel", `X:1
T:Blackberry Blossom
C:Traditional
M:2/4
L:1/16
Q:1/4=120
R:Reel
K:G
%%MIDI gchord off
%%score (Melodia) (Bajo)
V:Melodia clef=treble name="Melodia"
%%MIDI program 40
%%MIDI channel 1
V:Bajo clef=bass name="Fondo"
%%MIDI program 32
%%MIDI channel 2
V:Melodia
|: gabg fgaf | efge dBGB | cdec BcdB | ABcA GFED |
gabg fgaf | efge dBGB | cdec BcdB |1 AGFA G4 :|2 AGFA G2ef ||
|: e2B2 e3B | e2B2 BAGB | d2A2 d3A | d2A2 Adef |
g2g2 f2f2 | e2e2 d2B2 | cdec BcdB |1 AGFA G2ef :|2 AGFA G4 ||
V:Bajo
|: G,,2[G,B,]2 D,2[F,A,]2 | C,2[G,C]2 G,,2[G,B,]2 | C,2[G,C]2 G,,2[G,B,]2 | D,2[F,A,]2 D,2[F,A,]2 |
G,,2[G,B,]2 D,2[F,A,]2 | C,2[G,C]2 G,,2[G,B,]2 | C,2[G,C]2 G,,2[G,B,]2 |1 D,2[F,A,]2 G,,4 :|2 D,2[F,A,]2 G,,2z2 ||
|: E,2[E,G,]2 E,2[E,G,]2 | E,2[E,G,]2 E,2[E,G,]2 | D,2[F,A,]2 D,2[F,A,]2 | D,2[F,A,]2 D,2z2 |
G,,2[G,B,]2 D,2[F,A,]2 | C,2[G,C]2 G,,2[G,B,]2 | C,2[G,C]2 G,,2[G,B,]2 |1 D,2[F,A,]2 G,,2z2 :|2 D,2[F,A,]2 G,,4 ||`),
    nearer: tune("nearer", "Nearer, My God, to Thee", "hymn", `X:1
T:Nearer, My God, to Thee
T:Bethany
C:Lowell Mason (1856)
M:4/4
L:1/4
Q:1/4=80
R:Hymn
K:G
%%MIDI gchord off
%%score (Melodia) (Bajo)
V:Melodia clef=treble name="Melodia"
%%MIDI program 73
%%MIDI channel 1
V:Bajo clef=bass name="Fondo"
%%MIDI program 19
%%MIDI channel 2
V:Melodia
|: B2 A>G | E2 D2 | G2 B2 | A4 | B2 A>G | E2 D2 | G2 F>A | G4 :|
|: d2 e>d | d2 B2 | d2 c>B | A4 | B2 A>G | E2 D2 | G2 F>A | G4 :|
V:Bajo
|: G,2 F,>G, | C,2 B,,2 | B,,2 G,2 | D,4 | G,2 F,>G, | C,2 B,,2 | C,2 D,2 | G,,4 :|
|: G,2 G,2 | G,2 G,2 | G,2 G,2 | D,4 | G,2 F,>G, | C,2 B,,2 | C,2 D,2 | G,,4 :|`),
    dolore: tune("dolore", "Primo Dolore", "classical", `X:1
T:Erster Verlust
T:First Loss / Primo Dolore
C:Robert Schumann (1848)
M:2/4
L:1/8
Q:1/4=72
R:Classical
K:Em
%%MIDI gchord off
%%score (Melodia) (Bajo)
V:Melodia clef=treble name="Mano Der."
%%MIDI program 0
%%MIDI channel 1
V:Bajo clef=bass name="Mano Izq."
%%MIDI program 0
%%MIDI channel 2
V:Melodia
g | f e ^d e | B3 e | c3 e | B3 c | B c B A | (3G2F2E2 | ^d3 E | [E^G]2 z g |
f e ^d e | B3 e | c3 e | B3 c | B c B A | (3G2F2E2 | ^d3 E | E4 |]
V:Bajo
z | z4 | z G E2 | z A E2 | z G E2 | z G ^D E | E4 | B,3 E, | [E,^G,]2 z2 |
z4 | z G E2 | z A E2 | z G E2 | z G ^D E | E4 | B,3 E, | E,4 |]
`),
    egans: tune("egans", "Egan's Polka", "polka", `X:1
T:Egan's Polka
C:Traditional
M:2/4
L:1/8
Q:1/4=130
R:Polka
K:D
%%MIDI gchord off
%%score (Melodia) (Bajo)
V:Melodia clef=treble name="Melodia"
%%MIDI program 40
%%MIDI channel 1
V:Bajo clef=bass name="Fondo"
%%MIDI program 32
%%MIDI channel 2
V:Melodia
|: fA BA | fA BA | d2 e>f | ed BA |
fA BA | fA BA | d2 e>f | ed d2 :|
|: fa f>e | ed BA | fa f>e | ed e2 |
fa f>e | ed BA | d2 e>f | ed d2 :|
V:Bajo
|: D,2 [F,A,]2 | D,2 [F,A,]2 | G,,2 [G,B,]2 | A,,2 [E,A,]2 |
D,2 [F,A,]2 | D,2 [F,A,]2 | G,,2 [G,B,]2 | A,,2 D,2 :|
|: D,2 [F,A,]2 | G,,2 [G,B,]2 | D,2 [F,A,]2 | A,,2 [E,A,]2 |
D,2 [F,A,]2 | G,,2 [G,B,]2 | G,,2 [G,B,]2 | A,,2 D,2 :|`),
    gym1: tune("gym1", "Gymnopédie No. 1", "classical", `X:1
T:Gymnopédie No. 1
C:Erik Satie (1888)
M:3/4
L:1/4
Q:1/4=66
K:D
%%MIDI gchord off
%%score (Melodia) (Acorde) (Bajo)
V:Melodia clef=treble name="Melodia"
%%MIDI program 0
%%MIDI channel 1
V:Acorde clef=treble name="Acorde"
%%MIDI program 0
%%MIDI channel 2
V:Bajo clef=bass name="Bajo"
%%MIDI program 0
%%MIDI channel 3
V:Melodia
z3 | z3 | z3 | z3 |
z f a | g f c | B c d | A3 |
F3- | F3- | F3- | F3 |
z f a | g f c | B c d | A3 |
z f a | g f c | B c d | A3 |
F3- | F3- | F3- | F3 |
z f a | g f c | B c d | A3 |
V:Acorde
z [FDB,]2 | z [FCA,]2 | z [FDB,]2 | z [FCA,]2 |
z [FDB,]2 | z [FCA,]2 | z [FDB,]2 | z [FCA,]2 |
z [FDB,]2 | z [FCA,]2 | z [FDB,]2 | z [FCA,]2 |
z [FDB,]2 | z [FCA,]2 | z [FDB,]2 | z [FCA,]2 |
z [FDB,]2 | z [FCA,]2 | z [FDB,]2 | z [FCA,]2 |
z [FDB,]2 | z [FCA,]2 | z [FDB,]2 | z [FCA,]2 |
z [FDB,]2 | z [FCA,]2 | z [FDB,]2 | z [FCA,]2 |
V:Bajo
G,,3 | D,,3 | G,,3 | D,,3 |
G,,3 | D,,3 | G,,3 | D,,3 |
G,,3 | D,,3 | G,,3 | D,,3 |
G,,3 | D,,3 | G,,3 | D,,3 |
G,,3 | D,,3 | G,,3 | D,,3 |
G,,3 | D,,3 | G,,3 | D,,3 |
G,,3 | D,,3 | G,,3 | D,,3 |]
`),
    gym2: tune("gym2", "Gymnopédie No. 2", "classical", `X:1
T:Gymnopédie No. 2
C:Erik Satie (1888)
M:3/4
L:1/4
Q:1/4=66
K:C
%%MIDI gchord off
%%score (Melodia) (Acorde) (Bajo)
V:Melodia clef=treble name="Melodia"
%%MIDI program 0
%%MIDI channel 1
V:Acorde clef=treble name="Acorde"
%%MIDI program 0
%%MIDI channel 2
V:Bajo clef=bass name="Bajo"
%%MIDI program 0
%%MIDI channel 3
V:Melodia
z3 | z3 | z3 | z3 |
g3 | a g f | e f g | d3 |
g3 | a g f | e f g | d c2 |
g3 | a g f | e f g | d3 |
g3 | a g f | e f g | d c2 |
V:Acorde
z [GEB,]2 | z [AFCA,]2 | z [GEB,]2 | z [AFCA,]2 |
z [GEB,]2 | z [AFCA,]2 | z [GEB,]2 | z [AFCA,]2 |
z [GEB,]2 | z [AFCA,]2 | z [GEB,]2 | z [AFCA,]2 |
z [GEB,]2 | z [AFCA,]2 | z [GEB,]2 | z [AFCA,]2 |
z [GEB,]2 | z [AFCA,]2 | z [GEB,]2 | z [AFCA,]2 |
V:Bajo
G,,3 | D,,3 | G,,3 | D,,3 |
G,,3 | D,,3 | G,,3 | D,,3 |
G,,3 | D,,3 | G,,3 | D,,3 |
G,,3 | D,,3 | G,,3 | D,,3 |
G,,3 | D,,3 | G,,3 | D,,3 |]
`),
    gym3: tune("gym3", "Gymnopédie No. 3", "classical", `X:1
T:Gymnopédie No. 3
C:Erik Satie (1888)
M:3/4
L:1/4
Q:1/4=66
K:Am
%%MIDI gchord off
%%score (Melodia) (Acorde) (Bajo)
V:Melodia clef=treble name="Melodia"
%%MIDI program 0
%%MIDI channel 1
V:Acorde clef=treble name="Acorde"
%%MIDI program 0
%%MIDI channel 2
V:Bajo clef=bass name="Bajo"
%%MIDI program 0
%%MIDI channel 3
V:Melodia
z3 | z3 | z3 | z3 |
a3 | g f e | d e f | e d c |
e3 | g2 g | d3- | d3 |
d3 | z c f | g2 a | d e f |
B A G | A3 | D3- | D3 |
e3 | f g f | e d e- | e3- |
e d c | B c B | A3 | z3 |
V:Acorde
z [AEC]2 | z [GEB,]2 | z [AEC]2 | z [GEB,]2 |
z [AEC]2 | z [AEC]2 | z [GD_B,]2 | z [FDA,]2 |
z [ECA,]2 | z [EB,G,]2 | z [B,G,D,]2 | z [fcA]2 |
z [BGD]2 | z [f'c'a]2 | z [g'e'b]2 | z [f'c'a]2 |
z [e'c'a]2 | z [f'c'a]2 | z [f'c'a]2 | z [g'e'b]2 |
z [a'e'c']2 | z [g'e'b]2 | z [a'e'c']2 | z [g'e'b]2 |
z [a'e'c']2 | z [g'e'b]2 | z [f'c'a]2 | z [g'e'b]2 |
V:Bajo
A,,3 | D,,3 | A,,3 | D,,3 |
A,,3 | C,3 | G,,3 | D,,3 |
A,,3 | E,,3 | G,,3 | D,,3 |
G,,3 | D,,3 | G,,,3 | G,,,3 |
G,,,3 | D,,3 | G,,,3 | G,,,3 |
C,,3 | E,,3 | C,,3 | E,,3 |
C,,3 | E,,3 | A,,3 | D,,3 |]
`),
    alhambra: tune("alhambra", "Recuerdos de la Alhambra", "classical", `X:1
T:Recuerdos de la Alhambra
C:Francisco Tárrega
M:3/4
L:1/32
Q:1/4=72
K:C
%%MIDI gchord off
%%score (Melodia) (Bajo)
V:Melodia clef=treble name="Melodia"
%%MIDI program 24
%%MIDI channel 1
V:Bajo clef=bass name="Bajo"
%%MIDI program 24
%%MIDI channel 2
V:Melodia
EEEEEEEE EEEEEEEE DDDDDDDD |
CCCCCCCC CCCCCCCC DDDDDDDD |
EEEEEEEE EEEEEEEE EEEEEEEE |
EEEEEEEE EEEEEEEE FFFFFFFF |
GGGGGGGG GGGGGGGG FFFFFFFF |
EEEEEEEE EEEEEEEE FFFFFFFF |
GGGGGGGG GGGGGGGG GGGGGGGG |
GGGGGGGG GGGGGGGG GGGGGGGG |
cccccccc cccccccc BBBBBBBB |
AAAAAAAA AAAAAAAA BBBBBBBB |
AAAAAA (3ABA ^G^G^G^G^G^G^G^G ^G^G^G^G^G^G^G^G |
^G^G^G^G^G^G^G^G ^G^G^G^G^G^G^G^G ^G^G^G^G^G^G^G^G |
_B_B_B_B_B_B_B_B _B_B_B_B_B_B_B_B AAAAAAAA |
GGGGGGGG GGGGGGGG AAAAAAAA |
GGGGGG (3GAG FFFFFFFF FFFFFFFF |
FFFFFFFF FFFFFFFF FFFFFFFF |
EEEEEEEE EEEEEEEE DDDDDDDD |
CCCCCCCC CCCCCCCC DDDDDDDD |
CCCCCC (3CDC B,B,B,B,B,B,B,B, B,B,B,B,B,B,B,B, |
B,B,B,B,B,B,B,B, B,B,B,B,B,B,B,B, B,B,B,B,B,B,B,B, |
EEEEEEEE EEEEEEEE DDDDDDDD |
^C^C^C^C^C^C^C^C ^C^C^C^C^C^C^C^C DDDDDDDD |
EEEEEEEE EEEEEEEE EEEEEEEE |
EEEEEEEE EEEEEEEE EEEEEEEE |
^F^F^F^F^F^F^F^F ^F^F^F^F^F^F^F^F ^F^F^F^F^F^F^F^F |
dddddddd dddddddd ^F^F^F^F^F^F^F^F |
^F^F^F^F^F^F (3^F^G^F EEEEEEEE EEEEEEEE |
EEEEEEEE EEEEEEEE EEEEEEEE |
AAAAAAAA AAAAAAAA AAAAAAAA |
^G^G^G^G^G^G^G^G ^G^G^G^G^G^G^G^G ^D^D^D^D^D^D^D^D |
^F^F^F^F^F^F^F^F EEEEEEEE EEEEEEEE |
EEEEEEEE EEEEEEEE EEEEEEEE |
DDDDDDDD DDDDDDDD DDDDDDDD |
^C^C^C^C^C^C^C^C ^C^C^C^C^C^C^C^C B,B,B,B,B,B,B,B, |
B,B,B,B,B,B, (3B,^CB, A,A,A,A,A,A,A,A, A,A,A,A,A,A,A,A, |
Q:1/4=52
A,,4 E,4 A,4 ^C4 E4 A4 |
[eA]24 |
[A,E,]24 |]
V:Bajo
A,,24 |
A,,24 |
A,,24 |
A,,24 |
C,24 |
C,24 |
C,24 |
C,24 |
F,24 |
F,16 D,8 |
E,,24 |
E,,24 |
A,,24 |
^C,24 |
D,24 |
D,24 |
D,24 |
F,,24 |
E,,24 |
E,,24 |
A,,24 |
A,,24 |
A,,24 |
A,,24 |
A,,24 |
A,,24 |
A,,24 |
A,,24 |
^F,,24 |
^G,,24 |
^C,24 |
^C,24 |
B,,24 |
E,,24 |
A,,24 |
A,,24 |
A,,24 |
A,,24 |]`),

    gnossienne: tune("gnossienne", "Gnossienne No. 1", "classical", `X:1
T:Gnossienne No. 1
C:Erik Satie (1890)
M:4/4
L:1/8
Q:1/4=66
K:C
%%MIDI gchord off
%%score (Melodia) (Bajo)
V:Melodia clef=treble name="Melodia"
%%MIDI program 0
%%MIDI channel 1
V:Bajo clef=bass name="Bajo"
%%MIDI program 0
%%MIDI channel 2
V:Melodia
z2 c _e d2 c2 | c =B3 c =B3 | z2 c _e d2 c2 | _e f3 _e f3 |
z2 c _e d2 c2 | c =B3 _A G3 | F G3 F G3 | _A G3 F4 |
z2 c _e d2 c2 | c =B3 c =B3 | z2 c _e d2 c2 | _e f3 _e f3 |
z2 c _e d2 c2 | c =B3 _A G3 | F G3 F G3 | _A G3 F4 |
_A2 _B2 _A2 G2 | _A2 _B2 _A2 G2 | _A2 G2 G2 F2 | F4 z4 |
c2 d2 e2 f2 | g2 =b2 g2 f2 | g2 f2 g2 f2 | f2 e2 _d2 c2 |
c2 =B2 _A2 G2 | G2 F4 z2 |
z2 c _e d2 c2 | c =B3 _A G3 | F G3 _A G3 | F8 |]
V:Bajo
F,,2 [_A,C F]2 F,,2 [_A,C F]2 | F,,2 [_A,C F]2 F,,2 [_A,C F]2 | C,,2 [_E,G, C]2 C,,2 [_E,G, C]2 | F,,2 [_A,C F]2 F,,2 [_A,C F]2 |
F,,2 [_A,C F]2 F,,2 [_A,C F]2 | F,,2 [_A,C F]2 F,,2 [_A,C F]2 | F,,2 [_A,C F]2 F,,2 [_A,C F]2 | F,,2 [_A,C F]2 F,,2 [_A,C F]2 |
F,,2 [_A,C F]2 F,,2 [_A,C F]2 | F,,2 [_A,C F]2 F,,2 [_A,C F]2 | C,,2 [_E,G, C]2 C,,2 [_E,G, C]2 | F,,2 [_A,C F]2 F,,2 [_A,C F]2 |
F,,2 [_A,C F]2 F,,2 [_A,C F]2 | F,,2 [_A,C F]2 F,,2 [_A,C F]2 | F,,2 [_A,C F]2 F,,2 [_A,C F]2 | F,,2 [_A,C F]2 F,,2 [_A,C F]2 |
_B,,2 [_B,_D F]2 _B,,2 [_B,_D F]2 | _B,,2 [_B,_D F]2 _B,,2 [_B,_D F]2 | _B,,2 [_B,_D F]2 _B,,2 [_B,_D F]2 | _B,,2 [_B,_D F]2 _B,,4 |
F,,2 [_A,C F]2 F,,2 [_A,C F]2 | F,,2 [_A,C F]2 F,,2 [_A,C F]2 | F,,2 [_A,C F]2 F,,2 [_A,C F]2 | F,,2 [_A,C F]2 F,,2 [_A,C F]2 |
F,,2 [_A,C F]2 F,,2 [_A,C F]2 | F,,2 [_A,C F]2 F,,2 [_A,C F]2 |
F,,2 [_A,C F]2 F,,2 [_A,C F]2 | F,,2 [_A,C F]2 F,,2 [_A,C F]2 | F,,2 [_A,C F]2 F,,2 [_A,C F]2 | [F,,_A,C F]8 |]
`),
    barricadas: tune("barricadas", "A las barricadas", "march", `X:1
T:A las barricadas
C:Melodía tradicional (Warszawianka, s. XIX)
M:4/4
L:1/8
Q:1/4=104
K:Emin
%%MIDI gchord off
%%score (Melodia) (Bajo)
V:Melodia clef=treble name="Melodia"
%%MIDI program 24
%%MIDI channel 1
V:Bajo clef=bass name="Bajo"
%%MIDI program 24
%%MIDI channel 2
V:Melodia
G2 G2 A2 B2 | c2 c2 d2 e2 | e2 d2 c2 B2 | A2 G2 E4 |
G2 G2 A2 B2 | c2 c2 d2 e2 | e2 d2 c2 B2 | E4 E4 |
B2 B2 c2 B2 | A2 G2 A2 B2 | c2 d2 e2 d2 | c2 B2 A2 G2 |
G2 G2 A2 B2 | c2 d2 e2 d2 | c2 B2 A2 G2 | E4 E4 |
G2 G2 A2 B2 | c2 c2 d2 e2 | e2 d2 c2 B2 | A2 G2 E4 |
G2 G2 A2 B2 | c2 c2 d2 e2 | e2 d2 c2 B2 | E4 E4 |
B2 B2 c2 B2 | A2 G2 A2 B2 | c2 d2 e2 d2 | c2 B2 A2 G2 |
G2 G2 A2 B2 | c2 d2 e2 d2 | c2 B2 A2 G2 | E4 E4 |]
V:Bajo
E,2 [E,G,B,]2 B,,2 [E,G,B,]2 | E,2 [E,G,B,]2 E,2 [G,B,E]2 | A,,2 [A,,C,E,]2 A,,2 [C,E,A,]2 | B,,2 [B,,D,F,]2 E,4 |
E,2 [E,G,B,]2 B,,2 [E,G,B,]2 | E,2 [E,G,B,]2 E,2 [G,B,E]2 | A,,2 [A,,C,E,]2 B,,2 [B,,D,F,]2 | E,4 E,4 |
B,,2 [B,,D,F,]2 B,,2 [D,F,A,]2 | A,,2 [A,,C,E,]2 E,2 [E,G,B,]2 | A,,2 [A,,C,E,]2 G,,2 [G,B,D]2 | A,,2 [A,,C,E,]2 B,,2 [B,,D,F,]2 |
E,2 [E,G,B,]2 B,,2 [E,G,B,]2 | A,,2 [A,,C,E,]2 G,,2 [G,B,D]2 | A,,2 [A,,C,E,]2 B,,2 [B,,D,F,]2 | E,4 E,4 |
E,2 [E,G,B,]2 B,,2 [E,G,B,]2 | E,2 [E,G,B,]2 E,2 [G,B,E]2 | A,,2 [A,,C,E,]2 A,,2 [C,E,A,]2 | B,,2 [B,,D,F,]2 E,4 |
E,2 [E,G,B,]2 B,,2 [E,G,B,]2 | E,2 [E,G,B,]2 E,2 [G,B,E]2 | A,,2 [A,,C,E,]2 B,,2 [B,,D,F,]2 | E,4 E,4 |
B,,2 [B,,D,F,]2 B,,2 [D,F,A,]2 | A,,2 [A,,C,E,]2 E,2 [E,G,B,]2 | A,,2 [A,,C,E,]2 G,,2 [G,B,D]2 | A,,2 [A,,C,E,]2 B,,2 [B,,D,F,]2 |
E,2 [E,G,B,]2 B,,2 [E,G,B,]2 | A,,2 [A,,C,E,]2 G,,2 [G,B,D]2 | A,,2 [A,,C,E,]2 B,,2 [B,,D,F,]2 | E,4 E,4 |]
`),
    ebro: tune("ebro", "El paso del Ebro", "march", `X:1
T:El paso del Ebro (Ay, Carmela)
C:Tradicional
M:2/4
L:1/8
Q:1/4=108
K:Amin
%%MIDI gchord off
%%score (Melodia) (Bajo)
V:Melodia clef=treble name="Melodia"
%%MIDI program 24
%%MIDI channel 1
V:Bajo clef=bass name="Bajo"
%%MIDI program 24
%%MIDI channel 2
V:Melodia
|: E E E G | F E D2 | E F G2 | F E D2 | E E E G | F E D2 | E F G F | E2 E2 |
c2 c2 | c B A G | A B c2 | B A E2 | c2 c B | A G A B | c B A G | A2 A2 :|
E E E G | F E D2 | E F G F | E2 E2 | c2 c2 | c B A G | A B c B | A2 A2 |]
V:Bajo
|: A,,2 [A,,C,E,]2 | D,2 [D,F,A,]2 | E,2 [E,G,B,]2 | D,2 [D,F,A,]2 | A,,2 [A,,C,E,]2 | D,2 [G,,B,,D,]2 | E,2 D,2 | A,,2 A,,2 |
A,,2 [A,,C,E,]2 | E,2 [E,G,B,]2 | A,,2 [A,,C,E,]2 | E,2 [E,G,B,]2 | A,,2 [A,,C,E,]2 | G,,2 [G,,B,,D,]2 | E,2 [E,G,B,]2 | A,,2 A,,2 :|
A,,2 [A,,C,E,]2 | D,2 [D,F,A,]2 | E,2 D,2 | A,,2 A,,2 | A,,2 [A,,C,E,]2 | E,2 [E,G,B,]2 | A,,2 E,2 | A,,2 A,,2 |]
`),
    bellaciao: tune("bellaciao", "Bella Ciao", "march", `X:1
T:Bella Ciao
C:Tradicional
M:4/4
L:1/8
Q:1/4=96
K:Emin
%%MIDI gchord off
%%score (Melodia) (Bajo)
V:Melodia clef=treble name="Melodia"
%%MIDI program 24
%%MIDI channel 1
V:Bajo clef=bass name="Bajo"
%%MIDI program 24
%%MIDI channel 2
V:Melodia
|: E2 G2 B2 B2 | B2 A G F2 E2 | D2 F2 A2 A2 | A2 G F E4 |
E2 G2 B2 B2 | B2 A G F2 E2 | D2 F2 G2 F2 | E4 E4 |
B2 B2 B2 A G | F2 F2 F2 E D | E2 G2 B2 B2 | B4 z4 |
B2 B2 B A G F | E2 F2 G2 F2 | E4 E4 | z8 :|
V:Bajo
|: E,2 [E,G,B,]2 B,,2 [E,G,B,]2 | E,2 [E,G,B,]2 B,,2 [B,,D,F,]2 | D,2 [D,F,A,]2 A,,2 [D,F,A,]2 | B,,2 [B,,D,F,]2 E,4 |
E,2 [E,G,B,]2 B,,2 [E,G,B,]2 | E,2 [E,G,B,]2 B,,2 [B,,D,F,]2 | D,2 [D,F,A,]2 B,,2 [B,,D,F,]2 | E,4 E,4 |
E,2 [E,G,B,]2 B,,2 [B,,D,F,]2 | D,2 [D,F,A,]2 B,,2 [B,,D,F,]2 | E,2 [E,G,B,]2 B,,2 [E,G,B,]2 | E,4 z4 |
E,2 [E,G,B,]2 B,,2 [B,,D,F,]2 | D,2 [D,F,A,]2 B,,2 [B,,D,F,]2 | E,4 E,4 | z8 :|
`),
    plaza: tune("plaza", "En la plaza de mi pueblo", "folk", `X:1
T:En la plaza de mi pueblo
C:Melodía tradicional (El café de Chinitas)
M:3/4
L:1/8
Q:1/4=96
K:C
%%MIDI gchord off
%%score (Melodia) (Bajo)
V:Melodia clef=treble name="Melodia"
%%MIDI program 24
%%MIDI channel 1
V:Bajo clef=bass name="Bajo"
%%MIDI program 24
%%MIDI channel 2
V:Melodia
|: E2 E2 F2 | G2 A2 G2 | F2 E2 D2 | E4 z2 | E2 E2 F2 | G2 A2 B2 | A2 G2 F2 | E4 z2 |
G2 G2 A2 | B2 c2 B2 | A2 G2 F2 | E2 D2 E2 | E2 F2 G2 | A2 G2 F2 | E2 D2 B,2 | E4 z2 :|
V:Bajo
|: E,,2 [E,G,B,]4 | E,,2 [E,G,B,]4 | D,2 [D,F,A,]4 | E,,2 [E,G,B,]4 | E,,2 [E,G,B,]4 | E,,2 [E,G,B,]4 | C,2 [C,E,G,]4 | E,,2 [E,G,B,]4 |
G,,2 [G,B,D]4 | C,2 [C,E,G,]4 | D,2 [D,F,A,]4 | E,,2 [E,G,B,]4 | E,,2 [E,G,B,]4 | D,2 [D,F,A,]4 | B,,2 [B,,E,G,]4 | E,,2 [E,G,B,]4 :|
`),
    internacional: tune("internacional", "La Internacional", "march", `X:1
T:La Internacional
C:Pierre De Geyter (1888)
M:2/4
L:1/8
Q:1/4=96
K:C
%%MIDI gchord off
%%score (Melodia) (Bajo)
V:Melodia clef=treble name="Melodia"
%%MIDI program 24
%%MIDI channel 1
V:Bajo clef=bass name="Bajo"
%%MIDI program 24
%%MIDI channel 2
V:Melodia
z3 G | c3 B | d c G E | A4 |
F2 z A | d3 c | B A G F | E4 |
z3 G | c3 B | d c G E | A4 |
F2 d c | B3 d | f3 B | c4 |
z2 e d | B4 | A B c A | B4 |
G2 ^F G | A3 A | d3 c | B4 |
z3 d | d3 B | G G ^F G | e4 |
z A B c | B2 d2 | c2 A2 | G4 |
z2 e2 | c4 | G3 A | A4 |
F2 d2 | B4 | A3 G | G4 |
z2 G2 | e4 | d2 G2 | c4 |
B3 B | A3 ^G | A2 d2 | d4 |
z2 e2 | c4 | G3 A | A4 |
F2 d2 | B4 | A3 G | e4 |
z2 e2 | g4 | f2 e2 | d ^c d e |
f3 f | e3 e | d3 d | c4 |]
V:Bajo
G,,2 [G,B,D]2 | C,2 [E,G,C]2 | G,,2 [G,B,D]2 | F,,2 [F,A,C]2 |
F,,2 [F,A,C]2 | G,,2 [G,B,D]2 | G,,2 [F,B,D]2 | C,2 [E,G,C]2 |
G,,2 [G,B,D]2 | C,2 [E,G,C]2 | G,,2 [G,B,D]2 | F,,2 [F,A,C]2 |
G,,2 [F,B,D]2 | G,,2 [G,B,D]2 | G,,2 [F,B,D]2 | C,2 [E,G,C]2 |
E,,2 [E,G,B,]2 | G,,2 [G,B,D]2 | A,,2 [A,,C,E,]2 | G,,2 [G,B,D]2 |
G,,2 [G,B,D]2 | F,,2 [F,A,C]2 | G,,2 [G,B,D]2 | G,,2 [G,B,D]2 |
G,,2 [G,B,D]2 | G,,2 [G,B,D]2 | G,,2 [G,B,D]2 | C,2 [E,G,C]2 |
F,,2 [F,A,C]2 | G,,2 [G,B,D]2 | A,,2 [A,,C,E,]2 | G,,2 [G,B,D]2 |
C,2 [E,G,C]2 | C,2 [E,G,C]2 | F,,2 [F,A,C]2 | F,,2 [F,A,C]2 |
G,,2 [F,B,D]2 | G,,2 [G,B,D]2 | G,,2 [G,B,D]2 | G,,2 [G,B,D]2 |
C,2 [E,G,C]2 | C,2 [E,G,C]2 | G,,2 [G,B,D]2 | C,2 [E,G,C]2 |
G,,2 [G,B,D]2 | A,,2 [A,,C,E,]2 | D,,2 [D,F,A,]2 | G,,2 [G,B,D]2 |
C,2 [E,G,C]2 | C,2 [E,G,C]2 | F,,2 [F,A,C]2 | F,,2 [F,A,C]2 |
G,,2 [F,B,D]2 | G,,2 [G,B,D]2 | C,2 [E,G,C]2 | C,2 [E,G,C]2 |
C,2 [E,G,C]2 | C,2 [E,G,C]2 | F,,2 [F,A,C]2 | G,,2 [G,B,D]2 |
F,,2 [F,A,C]2 | C,2 [E,G,C]2 | G,,2 [F,B,D]2 | [C,,E,G,C]4 |]
`),
    katyusha: tune("katyusha", "Katyusha - Matvey Blanter", "march", `X:1
T:Katyusha - Matvey Blanter
C:Matvey Blanter (1938)
% Melody used by permission of the composer's heirs, CC BY-SA 4.0
M:4/4
L:1/8
Q:1/4=112
K:Emin
%%MIDI gchord off
%%score (Melodia) (Bajo)
V:Melodia clef=treble name="Melodia"
%%MIDI program 24
%%MIDI channel 1
V:Bajo clef=bass name="Bajo"
%%MIDI program 24
%%MIDI channel 2
V:Melodia
|: B2 B2 B2 G2 | A2 B2 e4 | d2 c2 B2 A2 | G2 A2 B4 |
B2 B2 B2 G2 | A2 B2 e2 g2 | f2 d2 e2 B2 | e4 e4 :|
g2 g2 g2 e2 | f2 g2 a4 | g2 f2 e2 d2 | e2 f2 g4 |
g2 g2 g2 e2 | f2 g2 a2 b2 | a2 f2 g2 e2 | e4 e4 |
B2 B2 B2 G2 | A2 B2 e2 g2 | f2 d2 e2 B2 | e4 e4 |]
V:Bajo
|: E,2 [E,G,B,]2 E,2 [E,G,B,]2 | A,,2 [A,,C,E,]2 A,,2 [C,E,A,]2 | B,,2 [D,F,A,]2 B,,2 [D,F,A,]2 | E,2 [E,G,B,]2 E,2 [G,B,E]2 |
E,2 [E,G,B,]2 E,2 [E,G,B,]2 | C,2 [C,E,G,]2 C,2 [E,G,C]2 | B,,2 [D,F,A,]2 B,,2 [D,F,A,]2 | E,2 [E,G,B,]2 E,4 :|
E,2 [E,G,B,]2 E,2 [E,G,B,]2 | D,2 [D,F,A,]2 D,2 [F,A,D]2 | C,2 [C,E,G,]2 C,2 [E,G,C]2 | G,,2 [G,B,D]2 G,,2 [B,D G]2 |
E,2 [E,G,B,]2 E,2 [E,G,B,]2 | D,2 [D,F,A,]2 D,2 [F,A,D]2 | B,,2 [D,F,A,]2 B,,2 [D,F,A,]2 | E,2 [E,G,B,]2 E,4 |
E,2 [E,G,B,]2 E,2 [E,G,B,]2 | C,2 [C,E,G,]2 C,2 [E,G,C]2 | B,,2 [D,F,A,]2 B,,2 [D,F,A,]2 | E,2 [E,G,B,]2 E,4 |]
`),

  };
  A.JUKE_CORE = Object.keys(A.SONGS);
  A.jukeSplit = (total, tier) => {
    const cap = 7;
    const n = Math.max(0, total | 0);
    const t = Math.max(0, tier | 0);
    if (!n || !t) return 0;
    const base = Math.floor(n / cap);
    if (t >= cap) return n;
    return Math.min(n, t * base);
  };
  A.JUKE_TIERS = (() => {
    const cap = 7;
    const ids = A.JUKE_CORE;
    const base = Math.floor(ids.length / cap);
    const tiers = [];
    let at = 0;
    for (let t = 1; t <= cap; t++) {
      const take = t === cap ? ids.length - at : base;
      tiers.push(ids.slice(at, at + take));
      at += take;
    }
    return tiers;
  })();
  A.jukePool = (tier) => {
    const n = A.jukeSplit(A.JUKE_CORE.length, tier || 0);
    return A.JUKE_CORE.slice(0, n);
  };
  A.jukeSize = () => A.JUKE_CORE.length;
  A.onJukeEnd = null;

  let abcVisual = null;
  let abcSynth = null;
  let abcPaused = false;
  let abcStart = 0;
  let abcElapsed = 0;
  let abcDur = 0;
  let abcWant = false;
  let abcId = "bonny";
  let jukeVol = 0.8;
  try {
    const saved = parseFloat(localStorage.getItem("choppy-juke-vol"));
    if (saved >= 0 && saved <= 1) jukeVol = saved;
  } catch (e) {}
  let jukeGainNode = null;
  let jukeSrc = null;
  let jukeBuf = null;

  function jukeDest() {
    if (!ctx) return null;
    if (!jukeGainNode) {
      jukeGainNode = ctx.createGain();
      jukeGainNode.connect(ctx.destination);
    }
    jukeGainNode.gain.value = jukeVol;
    return jukeGainNode;
  }
  A.jukeVolume = () => jukeVol;
  A.setJukeVolume = (v) => {
    const n = Number(v);
    jukeVol = Math.max(0, Math.min(1, isNaN(n) ? jukeVol : n));
    try { localStorage.setItem("choppy-juke-vol", String(jukeVol)); } catch (e) {}
    try { if (!ctx) A.unlock(); } catch (e) {}
    const g = jukeDest();
    if (g && ctx) {
      try { g.gain.setTargetAtTime(jukeVol, ctx.currentTime, 0.015); }
      catch (e) { g.gain.value = jukeVol; }
    }
    return jukeVol;
  };

  function stopJukeSource() {
    if (!jukeSrc) return;
    try { jukeSrc.onended = null; } catch (e) {}
    try { jukeSrc.stop(); } catch (e) {}
    try { jukeSrc.disconnect(); } catch (e) {}
    jukeSrc = null;
  }

  function playJukeBuffer(offset) {
    const dest = jukeDest();
    if (!ctx || !jukeBuf || !dest) return false;
    stopJukeSource();
    const src = ctx.createBufferSource();
    src.buffer = jukeBuf;
    src.connect(dest);
    const dur = jukeBuf.duration || abcDur || 0;
    const off = Math.max(0, Math.min(Math.max(0, dur - 0.04), offset || 0));
    src.onended = () => {
      if (src !== jukeSrc || abcPaused || !abcWant) return;
      jukeOn = false;
      jukeSrc = null;
      abcElapsed = dur;
      if (typeof A.onJukeEnd === "function") A.onJukeEnd();
    };
    src.start(0, off);
    jukeSrc = src;
    abcStart = ctx.currentTime;
    abcElapsed = off;
    abcDur = dur;
    return true;
  }

  function abcLib() { return window.ABCJS || null; }
  function songAbc(id) {
    return (A.SONGS[id] && A.SONGS[id].abc) || BONNY_ABC;
  }
  function hiddenPaper() {
    let el = document.getElementById("abc-hold");
    if (!el) {
      el = document.createElement("div");
      el.id = "abc-hold";
      el.setAttribute("aria-hidden", "true");
      el.style.cssText = "position:absolute;left:-9999px;width:640px;height:1px;overflow:hidden;";
      document.body.appendChild(el);
    }
    return el;
  }
  function renderTune(id) {
    const lib = abcLib();
    if (!lib) return null;
    const el = hiddenPaper();
    el.innerHTML = "";
    try {
      const vis = lib.renderAbc("abc-hold", songAbc(id), { add_classes: false, staffwidth: 640, paddingtop: 1, paddingbottom: 1 });
      abcVisual = vis && vis[0] ? vis[0] : null;
      abcId = id;
      return abcVisual;
    } catch (err) {
      abcVisual = null;
      return null;
    }
  }

  function armJukeEnd(dur, gen) {
    if (jukeTimer != null) { clearTimeout(jukeTimer); jukeTimer = null; }
    const ms = Math.max(400, (dur || abcDur || 8) * 1000 + 120);
    const g = gen == null ? jukeGen : gen;
    jukeTimer = setTimeout(() => {
      jukeTimer = null;
      if (g !== jukeGen || !abcWant || abcPaused) return;
      jukeOn = false;
      abcElapsed = abcDur;
      if (typeof A.onJukeEnd === "function") A.onJukeEnd();
    }, ms);
  }

  function stopJukeTimer() {
    if (jukeTimer != null) { clearTimeout(jukeTimer); jukeTimer = null; }
    stopJukeSource();
    if (abcSynth && abcSynth.stop) try { abcSynth.stop(); } catch (e) {}
    jukeOn = false;
    abcPaused = false;
    abcWant = false;
    abcElapsed = 0;
    abcStart = 0;
  }
  A.jukeStop = () => stopJukeTimer();
  A.jukePlaying = () => jukeOn && !abcPaused;
  A.jukePaused = () => abcPaused;
  A.jukeId = () => abcId;
  A.tuneSeconds = (id) => {
    const song = A.SONGS && A.SONGS[id];
    if (!song) return 0;
    if (song.secs > 0) return song.secs;
    const lib = abcLib();
    if (!lib || !lib.parseOnly) return 0;
    try {
      const tune = lib.parseOnly(song.abc)[0];
      if (!tune || !tune.setUpAudio) return 0;
      const seq = tune.setUpAudio();
      const m = tune.getMeterFraction && tune.getMeterFraction();
      const meter = m && m.den ? m.num / m.den : 0;
      const mpm = tune.millisecondsPerMeasure ? tune.millisecondsPerMeasure() : 0;
      const whole = seq && seq.totalDuration;
      if (!(whole > 0) || !(meter > 0) || !(mpm > 0)) return 0;
      song.secs = whole / meter * (mpm / 1000);
      return song.secs;
    } catch (e) {
      return 0;
    }
  };
  A.jukeProgress = () => {
    let t = abcElapsed;
    if (jukeOn && !abcPaused && ctx) t += Math.max(0, ctx.currentTime - abcStart);
    t = Math.max(0, Math.min(abcDur || t, t));
    return { t: t, dur: abcDur, pct: abcDur ? Math.min(1, t / abcDur) : 0 };
  };

  async function ensureSynth(id) {
    const lib = abcLib();
    if (!lib || !lib.synth || !lib.synth.supportsAudio()) return null;
    A.unlock();
    id = id || abcId || "bonny";
    if (!abcVisual || abcId !== id) renderTune(id);
    if (!abcVisual) return null;
    const synth = new lib.synth.CreateSynth();
    await synth.init({
      visualObj: abcVisual,
      audioContext: ctx,
      millisecondsPerMeasure: abcVisual.millisecondsPerMeasure ? abcVisual.millisecondsPerMeasure() : 1800
    });
    const primed = await synth.prime();
    abcDur = (primed && primed.duration) || synth.duration || 0;
    if (!abcDur && abcVisual.millisecondsPerMeasure) {
      const bars = (abcVisual.getTotalBeats && abcVisual.getTotalBeats()) || 32;
      abcDur = (abcVisual.millisecondsPerMeasure() * Math.max(8, bars / 3)) / 1000;
    }
    try { jukeBuf = synth.getAudioBuffer ? synth.getAudioBuffer() : null; } catch (e) { jukeBuf = null; }
    if (jukeBuf && jukeBuf.duration) abcDur = jukeBuf.duration;
    if (A.SONGS[id] && abcDur > 0) A.SONGS[id].secs = abcDur;
    abcSynth = synth;
    return synth;
  }

  A.jukePlay = (id) => {
    A.unlock();
    abcWant = true;
    abcPaused = false;
    const gen = ++jukeGen;
    const run = async () => {
      try {
        stopJukeSource();
        if (abcSynth && abcSynth.stop) try { abcSynth.stop(); } catch (e) {}
        const synth = await ensureSynth(id || "bonny");
        if (!synth || !abcWant || gen !== jukeGen) return;
        jukeOn = true;
        abcElapsed = 0;
        abcStart = ctx ? ctx.currentTime : 0;
        if (!playJukeBuffer(0)) {
          const done = synth.start();
          if (done && typeof done.then === "function") {
            done.then(() => {
              if (gen !== jukeGen || !abcWant || abcPaused) return;
              if (jukeTimer != null) { clearTimeout(jukeTimer); jukeTimer = null; }
              jukeOn = false;
              abcElapsed = abcDur;
              if (typeof A.onJukeEnd === "function") A.onJukeEnd();
            });
          }
        }
        armJukeEnd(abcDur, gen);
      } catch (err) {
        jukeOn = false;
      }
    };
    run();
  };

  A.jukePause = () => {
    if (!jukeOn || abcPaused) return;
    abcPaused = true;
    if (jukeTimer != null) { clearTimeout(jukeTimer); jukeTimer = null; }
    if (ctx) abcElapsed += Math.max(0, ctx.currentTime - abcStart);
    stopJukeSource();
    if (abcSynth && abcSynth.pause) try { abcSynth.pause(); } catch (e) {}
  };

  A.jukeResume = () => {
    if (!abcPaused) {
      if (!jukeOn) A.jukePlay(abcId || "bonny");
      return;
    }
    abcPaused = false;
    abcWant = true;
    jukeOn = true;
    if (jukeBuf && playJukeBuffer(abcElapsed)) {
      armJukeEnd(Math.max(0.2, (abcDur || 0) - abcElapsed));
      return;
    }
    abcStart = ctx ? ctx.currentTime : 0;
    armJukeEnd(Math.max(0.2, (abcDur || 0) - abcElapsed));
    if (abcSynth && abcSynth.resume) try { abcSynth.resume(); } catch (e) { A.jukePlay(abcId || "bonny"); }
  };

  A.SWAN = [
    "Black swan!",
    "Cold storage lost!",
    "Oh oh, Funds not SAFU!",
    "Coldcard randomness!",
    "China ban!",
    "In before oceans evaporation!",
    "You got F. T. X.'d!"
  ];
  A.BULL = [
    "Bull market!",
    "To the moon!",
    "We are SO back!",
    "Luke, I am your spammer",
    "Bitcoin C.E.O. to increase prices",
    "Going up forever Laura!"
  ];
  A.LASER = [
    "Laser eyes!",
    "Nothing stops this train",
    "Conviction addiction",
    "There is no second best",
    "Stay humble stack Sats",
    "Have fun staying poor!",
    "Fix the money fix the world!",
    "Unconfiscable power!",
    "Do it for Scottie Pippen"
  ];
  A.HALVE_SOON = [
    "Halving in sight!",
    "Tick tock, next block"
  ];
  A.BEAR = [
    "Bear market! Crash!",
    "Quantum conundrum!",
    "Bukele all-in ethereum",
    "Bitcoin Depravement Proposals",
    "Rat poison squared!",
    "Block size wars!"
  ];
  A.BUY = [
    "Long it!",
    "Bitcoin bought",
    "All-in corn!",
    "Stack it!",
    "Buy the dip!"
  ];
  A.SELL = [
    "Greater fool found",
    "Short it!",
    "You are now a nocoiner",
    "Bitcoin sold",
    "Exit all crypto markets"
  ];
  A.HALVE_MISS = [
    "Halving aborted",
    "The grinch stole the halving",
    "Bitcoin C.E.O to cancel halving",
    "Gary Gensler stole the halving",
    "Oh no, Peter Schiff stole the halving",
    "Faketoshi stole the halving",
    "No halving soup for you!",
    "Halving missed"
  ];
  let cachedVoice = null;
  function scoreVoice(v) {
    const n = (v.name || "").toLowerCase();
    const lang = (v.lang || "").toLowerCase();
    if (lang.startsWith("es")) return -1000;
    if (n.includes("spanish") || n.includes("español") || n.includes("mexico") || n.includes("argentina")) return -1000;
    let s = 0;
    if (lang.startsWith("en")) s += 40;
    if (lang === "en-us" || lang === "en_us") s += 20;
    if (n.includes("fred")) s += 120;
    if (n.includes("ralph")) s += 90;
    if (n.includes("daniel")) s += 70;
    if (n.includes("alex")) s += 45;
    if (n.includes("google us english")) s += 85;
    if (n.includes("english united states") || n.includes("us english")) s += 70;
    if (n.includes("google uk english male")) s += 75;
    if (n.includes("microsoft david") || n.includes("microsoft mark")) s += 55;
    if (n.includes("samsung") && n.includes("english")) s += 50;
    if (n.includes("compact") || n.includes("novelty") || n.includes("robot") || n.includes("espeak")) s += 40;
    if (n.includes("male")) s += 10;
    if (n.includes("female") || n.includes("samantha") || n.includes("zira") || n.includes("karen")) s -= 25;
    return s;
  }
  function pickVoice() {
    if (!window.speechSynthesis) return cachedVoice;
    const voices = speechSynthesis.getVoices();
    if (!voices.length) return cachedVoice;
    const ranked = voices.slice().sort((a, b) => scoreVoice(b) - scoreVoice(a));
    const best = ranked[0] && scoreVoice(ranked[0]) > 0 ? ranked[0] : null;
    if (best) cachedVoice = best;
    return cachedVoice;
  }
  if (typeof speechSynthesis !== "undefined") {
    speechSynthesis.addEventListener("voiceschanged", pickVoice);
    pickVoice();
  }
  A.cancelSpeech = () => { if (window.speechSynthesis) speechSynthesis.cancel(); };
  A.speak = (line, urgent) => {
    if (muteVoice || !window.speechSynthesis || !line) return;
    if (isIOS) {
      speechSynthesis.cancel();
      const utterance = new SpeechSynthesisUtterance(String(line));
      utterance.lang = "en-US";
      utterance.volume = 1;
      utterance.rate = 1;
      utterance.pitch = 1;
      setTimeout(() => {
        try { if (ctx && ctx.state === "suspended") ctx.resume(); } catch (e) {}
        speechSynthesis.speak(utterance);
      }, 100);
      return;
    }
    if (urgent) speechSynthesis.cancel();
    const u = new SpeechSynthesisUtterance(line);
    u.lang = "en-US";
    u.rate = 0.78;
    u.pitch = 0.18;
    u.volume = 1;
    const v = pickVoice();
    if (v) { u.voice = v; u.lang = v.lang && v.lang.startsWith("en") ? v.lang : "en-US"; }
    speechSynthesis.speak(u);
  };
  if (isIOS) {
    const warm = () => { try { A.unlock(); } catch (e) {} };
    document.addEventListener("touchstart", warm, { passive: true });
    document.addEventListener("pointerdown", warm, { passive: true });
  }
})();
(() => {
  // Re-unlock on any user gesture (iOS only honors resume() inside touchend/click/keydown) and when returning to the tab.
  const kick = () => { try { if (window.ArcadeAudio && window.ArcadeAudio.unlock) window.ArcadeAudio.unlock(); } catch (e) {} };
  ["touchend", "click", "keydown"].forEach((ev) => document.addEventListener(ev, kick, { passive: true, capture: true }));
  document.addEventListener("visibilitychange", () => { if (document.visibilityState === "visible") kick(); });
  window.addEventListener("pageshow", kick);
})();
