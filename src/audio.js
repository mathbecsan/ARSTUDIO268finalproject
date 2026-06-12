// Procedural soundscape engine — no audio files required.
// Each universe gets its own sonic identity, built from oscillators and noise.

export class Soundscape {
  constructor() {
    this.ctx = null;
    this.master = null;
    this.layers = {}; // name -> { nodes:[], gain }
  }

  init() {
    if (this.ctx) return;
    this.ctx = new (window.AudioContext || window.webkitAudioContext)();
    this.master = this.ctx.createGain();
    this.master.gain.value = 0.55;
    this.master.connect(this.ctx.destination);
  }

  _noiseBuffer(seconds = 2) {
    const rate = this.ctx.sampleRate;
    const buf = this.ctx.createBuffer(1, rate * seconds, rate);
    const data = buf.getChannelData(0);
    for (let i = 0; i < data.length; i++) data[i] = Math.random() * 2 - 1;
    return buf;
  }

  _fadeLayer(layer, target, time = 2) {
    const now = this.ctx.currentTime;
    layer.gain.gain.cancelScheduledValues(now);
    layer.gain.gain.setValueAtTime(layer.gain.gain.value, now);
    layer.gain.gain.linearRampToValueAtTime(target, now + time);
  }

  stopAll(fade = 1.5) {
    for (const name of Object.keys(this.layers)) this.stopLayer(name, fade);
  }

  stopLayer(name, fade = 1.5) {
    const layer = this.layers[name];
    if (!layer) return;
    this._fadeLayer(layer, 0, fade);
    setTimeout(() => {
      layer.nodes.forEach(n => { try { n.stop ? n.stop() : n.disconnect(); } catch (e) {} });
      try { layer.gain.disconnect(); } catch (e) {}
    }, fade * 1000 + 100);
    delete this.layers[name];
    if (layer.interval) clearInterval(layer.interval);
  }

  // ---- Layers ----------------------------------------------------------

  // Low tense drone + slow heartbeat: the room, the father's approach.
  startRoomTension() {
    this.init();
    const g = this.ctx.createGain(); g.gain.value = 0; g.connect(this.master);
    const nodes = [];

    const drone = this.ctx.createOscillator();
    drone.type = 'sawtooth'; drone.frequency.value = 41; // low E-ish
    const droneFilter = this.ctx.createBiquadFilter();
    droneFilter.type = 'lowpass'; droneFilter.frequency.value = 110;
    const droneGain = this.ctx.createGain(); droneGain.gain.value = 0.22;
    drone.connect(droneFilter).connect(droneGain).connect(g);
    drone.start(); nodes.push(drone);

    // heartbeat: filtered noise thumps
    const layer = { nodes, gain: g };
    layer.interval = setInterval(() => this._thump(g), 1100);
    this.layers.room = layer;
    this._fadeLayer(layer, 0.8, 3);
  }

  _thump(dest) {
    if (!this.ctx) return;
    const o = this.ctx.createOscillator();
    o.type = 'sine'; o.frequency.value = 55;
    const eg = this.ctx.createGain();
    const t = this.ctx.currentTime;
    eg.gain.setValueAtTime(0.0, t);
    eg.gain.linearRampToValueAtTime(0.5, t + 0.02);
    eg.gain.exponentialRampToValueAtTime(0.001, t + 0.32);
    o.connect(eg).connect(dest);
    o.start(t); o.stop(t + 0.4);
  }

  // Heavy footsteps approaching — the clomp in the hallway.
  footsteps(count = 4, interval = 0.7) {
    this.init();
    for (let i = 0; i < count; i++) {
      const t = this.ctx.currentTime + i * interval;
      const src = this.ctx.createBufferSource();
      src.buffer = this._noiseBuffer(0.3);
      const f = this.ctx.createBiquadFilter();
      f.type = 'lowpass'; f.frequency.value = 200;
      const eg = this.ctx.createGain();
      eg.gain.setValueAtTime(0.9 * (0.5 + i * 0.18), t);
      eg.gain.exponentialRampToValueAtTime(0.001, t + 0.25);
      src.connect(f).connect(eg).connect(this.master);
      src.start(t); src.stop(t + 0.3);
    }
  }

  // Universe 1 — cold wind, hollow and grey.
  startColdWind() {
    this.init();
    const g = this.ctx.createGain(); g.gain.value = 0; g.connect(this.master);
    const src = this.ctx.createBufferSource();
    src.buffer = this._noiseBuffer(4); src.loop = true;
    const f = this.ctx.createBiquadFilter();
    f.type = 'bandpass'; f.frequency.value = 380; f.Q.value = 0.6;
    const lfo = this.ctx.createOscillator(); lfo.frequency.value = 0.07;
    const lfoGain = this.ctx.createGain(); lfoGain.gain.value = 220;
    lfo.connect(lfoGain).connect(f.frequency);
    src.connect(f).connect(g);
    src.start(); lfo.start();
    const layer = { nodes: [src, lfo], gain: g };
    this.layers.wind = layer;
    this._fadeLayer(layer, 0.5, 3);
  }

  // Universe 2 — digital glitch: unstable, broken.
  startGlitch() {
    this.init();
    const g = this.ctx.createGain(); g.gain.value = 0; g.connect(this.master);
    const layer = { nodes: [], gain: g };
    layer.interval = setInterval(() => {
      if (Math.random() < 0.55) return;
      const o = this.ctx.createOscillator();
      o.type = Math.random() < 0.5 ? 'square' : 'sawtooth';
      o.frequency.value = 90 + Math.random() * 1800;
      const eg = this.ctx.createGain();
      const t = this.ctx.currentTime;
      eg.gain.setValueAtTime(0.07, t);
      eg.gain.exponentialRampToValueAtTime(0.001, t + 0.05 + Math.random() * 0.1);
      o.connect(eg).connect(g);
      o.start(t); o.stop(t + 0.2);
    }, 160);
    this.layers.glitch = layer;
    this._fadeLayer(layer, 0.9, 2);
  }

  // Universe 3 — warm Andean atmosphere: pentatonic plucks over a soft pad,
  // gesturing toward huayno without pretending to be a recording.
  startAndeanWarmth() {
    this.init();
    const g = this.ctx.createGain(); g.gain.value = 0; g.connect(this.master);
    const nodes = [];

    // warm pad (two slightly detuned triangles)
    [220, 220.8, 330].forEach(freq => {
      const o = this.ctx.createOscillator();
      o.type = 'triangle'; o.frequency.value = freq / 2;
      const og = this.ctx.createGain(); og.gain.value = 0.05;
      o.connect(og).connect(g); o.start(); nodes.push(o);
    });

    // pentatonic melody plucks (A minor pentatonic — common in huayno)
    const scale = [220, 261.63, 293.66, 329.63, 392, 440, 523.25];
    const layer = { nodes, gain: g };
    layer.interval = setInterval(() => {
      if (Math.random() < 0.35) return;
      const freq = scale[Math.floor(Math.random() * scale.length)];
      const o = this.ctx.createOscillator();
      o.type = 'sine'; o.frequency.value = freq;
      const eg = this.ctx.createGain();
      const t = this.ctx.currentTime;
      eg.gain.setValueAtTime(0.18, t);
      eg.gain.exponentialRampToValueAtTime(0.001, t + 1.4);
      o.connect(eg).connect(g);
      o.start(t); o.stop(t + 1.5);
    }, 620);
    this.layers.andean = layer;
    this._fadeLayer(layer, 0.85, 4);
  }

  // A single bright chime — collecting a Quechua word.
  chime(step = 0) {
    this.init();
    const freqs = [523.25, 587.33, 659.25, 783.99, 880, 1046.5];
    const f = freqs[Math.min(step, freqs.length - 1)];
    [f, f * 2].forEach((freq, i) => {
      const o = this.ctx.createOscillator();
      o.type = 'sine'; o.frequency.value = freq;
      const eg = this.ctx.createGain();
      const t = this.ctx.currentTime;
      eg.gain.setValueAtTime(i === 0 ? 0.3 : 0.1, t);
      eg.gain.exponentialRampToValueAtTime(0.001, t + 2.2);
      o.connect(eg).connect(this.master);
      o.start(t); o.stop(t + 2.3);
    });
  }

  // Finale — held consonant chord, open sky.
  finaleChord() {
    this.init();
    [220, 277.18, 329.63, 440, 554.37].forEach((freq, i) => {
      const o = this.ctx.createOscillator();
      o.type = 'sine'; o.frequency.value = freq;
      const eg = this.ctx.createGain();
      const t = this.ctx.currentTime;
      eg.gain.setValueAtTime(0, t);
      eg.gain.linearRampToValueAtTime(0.09, t + 3 + i);
      eg.gain.linearRampToValueAtTime(0.05, t + 20);
      o.connect(eg).connect(this.master);
      o.start(t);
      this.layers['finale' + i] = { nodes: [o], gain: eg };
    });
  }

  // The Aftermath — mother's emotional journey: warmth → conflict → silence → collapse → redemption
  startAftermallTheme() {
    this.init();
    const g = this.ctx.createGain(); g.gain.value = 0; g.connect(this.master);
    const nodes = [];

    // Warm opening pad (minor 7th, A minor: A, C, E, G)
    [220, 261.63, 329.63, 392].forEach(freq => {
      const o = this.ctx.createOscillator();
      o.type = 'sine'; o.frequency.value = freq;
      const og = this.ctx.createGain(); og.gain.value = 0.08;
      o.connect(og).connect(g); o.start(); nodes.push(o);
    });

    const layer = { nodes, gain: g };

    // Pulse through emotional beats
    let state = 0; // 0=opening, 1=conflict, 2=silence, 3=collapse, 4=redemption
    let beatTimer = 0;
    layer.interval = setInterval(() => {
      beatTimer += 0.5;
      // Shot transitions every 8-10 seconds average
      if (beatTimer > 8 + Math.random() * 2) {
        state = (state + 1) % 5;
        beatTimer = 0;
        // Adjust color per state
        if (state === 1) {
          // Conflict: add dissonant bass rumble
          const b = this.ctx.createOscillator();
          b.type = 'sine'; b.frequency.value = 55;
          const bg = this.ctx.createGain(); bg.gain.value = 0.12;
          b.connect(bg).connect(g); b.start(); nodes.push(b);
        } else if (state === 2) {
          // Silence: fade out completely
          this._fadeLayer(layer, 0.01, 2);
        } else if (state === 3) {
          // Collapse: chaotic high frequencies
          for (let i = 0; i < 3; i++) {
            const h = this.ctx.createOscillator();
            h.type = 'square'; h.frequency.value = 800 + Math.random() * 2000;
            const hg = this.ctx.createGain(); hg.gain.value = 0.05;
            h.connect(hg).connect(g); h.start(); nodes.push(h);
          }
        } else if (state === 4) {
          // Redemption: warm pad returns + choir-like overtones
          this._fadeLayer(layer, 0.4, 3);
        }
      }
    }, 500);

    this.layers.afterall = layer;
    this._fadeLayer(layer, 0.3, 2);
  }
}
