// A small NES-flavoured synth on top of WebAudio: two pulse voices with
// selectable duty, a triangle bass and a noise channel. No samples.

type Wave = 'p12' | 'p25' | 'p50' | 'tri' | 'noise';

interface ToneOpts {
  wave: Wave;
  freq: number;
  to?: number; // pitch slide target
  slide?: 'lin' | 'exp';
  t?: number; // start offset (s) from now
  dur: number;
  vol?: number;
  attack?: number;
  release?: number;
  vib?: number; // vibrato depth in cents
  vibRate?: number;
  bus?: 'sfx' | 'music';
  filter?: { type: BiquadFilterType; freq: number; to?: number; q?: number };
  at?: number; // absolute context time
}

const NOTE: Record<string, number> = { C: 0, D: 2, E: 4, F: 5, G: 7, A: 9, B: 11 };
export function noteFreq(n: string): number {
  const m = /^([A-G])(#|b)?(\d)$/.exec(n);
  if (!m) return 0;
  let semi = NOTE[m[1]] + (m[2] === '#' ? 1 : m[2] === 'b' ? -1 : 0);
  const midi = (Number(m[3]) + 1) * 12 + semi;
  return 440 * Math.pow(2, (midi - 69) / 12);
}

export interface Track {
  wave: Wave;
  vol: number;
  notes: string; // "A4:2 C5 E5:4 -:2"  (default length 1 step)
  vib?: number;
  release?: number;
  octave?: number;
}
export interface Song {
  bpm: number; // quarter notes; one step = a 16th
  tracks: Track[];
  loop?: boolean;
}

interface ParsedNote {
  step: number;
  len: number;
  freq: number;
  drum?: string;
}

function parseTrack(t: Track): { notes: ParsedNote[]; steps: number } {
  const out: ParsedNote[] = [];
  let step = 0;
  for (const tok of t.notes.trim().split(/\s+/)) {
    if (!tok) continue;
    const [n, l] = tok.split(':');
    const len = l ? Number(l) : 1;
    if (n !== '-' && n !== '.') {
      if (t.wave === 'noise') out.push({ step, len, freq: 0, drum: n });
      else {
        let f = noteFreq(n);
        if (t.octave) f *= Math.pow(2, t.octave);
        out.push({ step, len, freq: f });
      }
    }
    step += len;
  }
  return { notes: out, steps: step };
}

class Synth {
  ctx: AudioContext | null = null;
  private master!: GainNode;
  private sfxBus!: GainNode;
  private musicBus!: GainNode;
  private echo!: DelayNode;
  private waves: Partial<Record<Wave, PeriodicWave>> = {};
  private noise!: AudioBuffer;
  private noiseShort!: AudioBuffer;
  muted = false;
  musicOn = true;
  private song: { song: Song; parsed: { notes: ParsedNote[]; steps: number }[]; start: number; next: number; len: number } | null = null;
  private timer: number | null = null;
  private lastQuack = 0;

  /** Must be called from a user gesture (iOS). Safe to call repeatedly. */
  unlock(): void {
    if (!this.ctx) {
      const AC = window.AudioContext || (window as unknown as { webkitAudioContext: typeof AudioContext }).webkitAudioContext;
      if (!AC) return;
      // Ask iOS 17+ to treat us like media so the ringer switch doesn't mute us.
      const nav = navigator as Navigator & { audioSession?: { type: string } };
      try {
        if (nav.audioSession) nav.audioSession.type = 'playback';
      } catch {
        /* ignore */
      }
      this.ctx = new AC({ latencyHint: 'interactive' });
      this.build();
    }
    if (this.ctx.state !== 'running') void this.ctx.resume();
    // a silent blip fully unlocks older iOS
    const b = this.ctx.createBuffer(1, 1, 22050);
    const s = this.ctx.createBufferSource();
    s.buffer = b;
    s.connect(this.ctx.destination);
    s.start(0);
  }

  private build() {
    const ctx = this.ctx!;
    const comp = ctx.createDynamicsCompressor();
    comp.threshold.value = -10;
    comp.ratio.value = 4;
    this.master = ctx.createGain();
    this.master.gain.value = this.muted ? 0 : 0.55;
    this.master.connect(comp).connect(ctx.destination);
    this.sfxBus = ctx.createGain();
    this.sfxBus.connect(this.master);
    this.musicBus = ctx.createGain();
    this.musicBus.gain.value = 0.7;
    this.musicBus.connect(this.master);
    // spooky slap-back echo shared by both buses
    this.echo = ctx.createDelay(1);
    this.echo.delayTime.value = 0.19;
    const fb = ctx.createGain();
    fb.gain.value = 0.28;
    const wet = ctx.createGain();
    wet.gain.value = 0.22;
    const lp = ctx.createBiquadFilter();
    lp.type = 'lowpass';
    lp.frequency.value = 2400;
    this.echo.connect(lp).connect(fb).connect(this.echo);
    lp.connect(wet).connect(this.master);

    const pulse = (d: number) => {
      const n = 48;
      const re = new Float32Array(n);
      const im = new Float32Array(n);
      for (let i = 1; i < n; i++) re[i] = (2 / (i * Math.PI)) * Math.sin(i * Math.PI * d);
      return ctx.createPeriodicWave(re, im);
    };
    this.waves.p12 = pulse(0.125);
    this.waves.p25 = pulse(0.25);
    this.waves.p50 = pulse(0.5);
    // stepped NES-ish triangle
    {
      const n = 32;
      const re = new Float32Array(n);
      const im = new Float32Array(n);
      for (let i = 1; i < n; i += 2) im[i] = (8 / (Math.PI * Math.PI)) * (((i - 1) / 2) % 2 ? -1 : 1) / (i * i);
      this.waves.tri = ctx.createPeriodicWave(re, im);
    }
    const mk = (len: number, period?: number) => {
      const b = ctx.createBuffer(1, len, ctx.sampleRate);
      const d = b.getChannelData(0);
      let lfsr = 1;
      for (let i = 0; i < len; i++) {
        if (period) {
          // NES "short" noise: 93-step LFSR loop gives a metallic buzz
          const bit = (lfsr ^ (lfsr >> 6)) & 1;
          lfsr = (lfsr >> 1) | (bit << 14);
          d[i] = lfsr & 1 ? 0.8 : -0.8;
        } else d[i] = Math.random() * 2 - 1;
      }
      return b;
    };
    this.noise = mk(ctx.sampleRate);
    this.noiseShort = mk(Math.floor(ctx.sampleRate / 4), 93);
  }

  setMuted(m: boolean) {
    this.muted = m;
    if (this.ctx) this.master.gain.setTargetAtTime(m ? 0 : 0.55, this.ctx.currentTime, 0.02);
  }

  suspend() {
    void this.ctx?.suspend();
  }
  resume() {
    if (this.ctx && this.ctx.state !== 'running') void this.ctx.resume();
  }

  private tone(o: ToneOpts, echo = false): void {
    const ctx = this.ctx;
    if (!ctx || this.muted) return;
    const t0 = o.at ?? ctx.currentTime + (o.t ?? 0);
    const dur = o.dur;
    const atk = o.attack ?? 0.004;
    const rel = o.release ?? 0.03;
    const vol = o.vol ?? 0.3;
    const g = ctx.createGain();
    g.gain.setValueAtTime(0, t0);
    g.gain.linearRampToValueAtTime(vol, t0 + atk);
    g.gain.setValueAtTime(vol, t0 + Math.max(atk, dur - rel));
    g.gain.linearRampToValueAtTime(0, t0 + dur);
    let src: AudioScheduledSourceNode;
    if (o.wave === 'noise') {
      const s = ctx.createBufferSource();
      s.buffer = o.freq > 0 && o.freq < 1 ? this.noiseShort : this.noise;
      s.loop = true;
      const rate = o.freq >= 1 ? o.freq : 1;
      s.playbackRate.setValueAtTime(rate, t0);
      if (o.to) s.playbackRate.exponentialRampToValueAtTime(Math.max(0.01, o.to), t0 + dur);
      src = s;
    } else {
      const osc = ctx.createOscillator();
      osc.setPeriodicWave(this.waves[o.wave]!);
      osc.frequency.setValueAtTime(o.freq, t0);
      if (o.to) {
        if (o.slide === 'lin') osc.frequency.linearRampToValueAtTime(o.to, t0 + dur);
        else osc.frequency.exponentialRampToValueAtTime(Math.max(1, o.to), t0 + dur);
      }
      if (o.vib) {
        const lfo = ctx.createOscillator();
        const lg = ctx.createGain();
        lfo.frequency.value = o.vibRate ?? 6;
        lg.gain.value = o.vib;
        lfo.connect(lg).connect(osc.detune);
        lfo.start(t0);
        lfo.stop(t0 + dur + 0.05);
      }
      src = osc;
    }
    let node: AudioNode = src;
    if (o.filter) {
      const f = ctx.createBiquadFilter();
      f.type = o.filter.type;
      f.frequency.setValueAtTime(o.filter.freq, t0);
      if (o.filter.to) f.frequency.exponentialRampToValueAtTime(o.filter.to, t0 + dur);
      f.Q.value = o.filter.q ?? 1;
      node.connect(f);
      node = f;
    }
    node.connect(g);
    g.connect(o.bus === 'music' ? this.musicBus : this.sfxBus);
    if (echo) g.connect(this.echo);
    src.start(t0);
    src.stop(t0 + dur + 0.02);
  }

  // ------------------------------------------------------------ SFX ----
  shot() {
    this.tone({ wave: 'noise', freq: 1, to: 0.35, dur: 0.32, vol: 0.55, release: 0.25, filter: { type: 'lowpass', freq: 7000, to: 500 } });
    this.tone({ wave: 'p50', freq: 180, to: 40, dur: 0.14, vol: 0.35, release: 0.1 });
  }
  click() {
    this.tone({ wave: 'p12', freq: 1600, dur: 0.02, vol: 0.2 });
    this.tone({ wave: 'noise', freq: 2, dur: 0.03, vol: 0.15, t: 0.02 });
  }
  quack(pitch = 1) {
    if (!this.ctx) return;
    const now = this.ctx.currentTime;
    if (now - this.lastQuack < 0.45) return;
    this.lastQuack = now;
    // two warbly honks with a ghostly echo tail
    for (const [t, f] of [
      [0, 560],
      [0.17, 500],
    ] as const) {
      this.tone(
        { wave: 'p25', freq: f * pitch, to: f * 0.72 * pitch, dur: 0.13, vol: 0.18, vib: 40, vibRate: 28, t, filter: { type: 'bandpass', freq: 1200, q: 0.8 } },
        true,
      );
    }
  }
  flap() {
    this.tone({ wave: 'noise', freq: 1, dur: 0.05, vol: 0.05, filter: { type: 'bandpass', freq: 800, q: 2 } });
  }
  hitDuck() {
    this.tone({ wave: 'p50', freq: 880, to: 1320, dur: 0.06, vol: 0.18 });
  }
  fall() {
    this.tone({ wave: 'p12', freq: 1500, to: 220, dur: 1.0, vol: 0.13, slide: 'exp', vib: 20, vibRate: 10 }, true);
  }
  thud() {
    this.tone({ wave: 'tri', freq: 120, to: 40, dur: 0.18, vol: 0.5 });
    this.tone({ wave: 'noise', freq: 1, dur: 0.1, vol: 0.2, filter: { type: 'lowpass', freq: 600 } });
  }
  soul() {
    for (let i = 0; i < 4; i++)
      this.tone({ wave: 'p12', freq: 1200 + i * 220, dur: 0.12, vol: 0.05, t: i * 0.08, vib: 60, vibRate: 14 }, true);
  }
  bark() {
    for (const t of [0, 0.16]) {
      this.tone({ wave: 'p25', freq: 420, to: 260, dur: 0.09, vol: 0.28, t });
      this.tone({ wave: 'noise', freq: 1.4, dur: 0.06, vol: 0.12, t, filter: { type: 'bandpass', freq: 1200 } });
    }
  }
  laugh() {
    // "heh heh heh" - a wheezy bulldog snicker with a haunted wobble
    const seq = [740, 660, 740, 660, 740, 660, 784, 660, 740, 554];
    seq.forEach((f, i) => {
      const t = i * 0.13;
      this.tone({ wave: 'p25', freq: f, to: f * 0.84, dur: 0.1, vol: 0.2, t, vib: 30, vibRate: 18 }, true);
      this.tone({ wave: 'noise', freq: 1.8, dur: 0.05, vol: 0.06, t, filter: { type: 'highpass', freq: 2000 } });
    });
  }
  flyAway() {
    this.tone({ wave: 'p50', freq: 300, to: 1200, dur: 0.6, vol: 0.12, vib: 80, vibRate: 9, slide: 'exp' }, true);
  }
  blip() {
    this.tone({ wave: 'p25', freq: 990, dur: 0.05, vol: 0.18 });
  }
  select() {
    this.tone({ wave: 'p25', freq: 660, dur: 0.06, vol: 0.2 });
    this.tone({ wave: 'p25', freq: 990, dur: 0.1, vol: 0.2, t: 0.06 });
  }
  tick(i: number) {
    this.tone({ wave: 'p50', freq: 523 * Math.pow(2, i / 12), dur: 0.06, vol: 0.16 });
  }
  pop() {
    this.tone({ wave: 'noise', freq: 1.5, to: 0.4, dur: 0.22, vol: 0.4, filter: { type: 'bandpass', freq: 1800, to: 300 } });
    this.tone({ wave: 'p25', freq: 300, to: 90, dur: 0.12, vol: 0.2 });
  }
  launch() {
    this.tone({ wave: 'noise', freq: 0.8, to: 2, dur: 0.18, vol: 0.18, filter: { type: 'bandpass', freq: 900, to: 2400 } });
  }
  pumpkinGone() {
    this.tone({ wave: 'tri', freq: 300, to: 150, dur: 0.15, vol: 0.15 });
  }
  owl() {
    this.tone({ wave: 'tri', freq: 392, to: 370, dur: 0.25, vol: 0.18, t: 0 }, true);
    this.tone({ wave: 'tri', freq: 392, to: 349, dur: 0.4, vol: 0.18, t: 0.35 }, true);
  }

  // ---------------------------------------------------------- MUSIC ----
  play(song: Song): void {
    this.stopMusic();
    const ctx = this.ctx;
    if (!ctx) return;
    const parsed = song.tracks.map(parseTrack);
    const len = Math.max(...parsed.map((p) => p.steps));
    const start = ctx.currentTime + 0.06;
    this.song = { song, parsed, start, next: 0, len };
    this.pump();
    this.timer = window.setInterval(() => this.pump(), 40);
  }

  /** Total duration of a song in seconds (one pass). */
  duration(song: Song): number {
    const len = Math.max(...song.tracks.map((t) => parseTrack(t).steps));
    return (len * 60) / song.bpm / 4;
  }

  stopMusic(): void {
    if (this.timer !== null) clearInterval(this.timer);
    this.timer = null;
    this.song = null;
  }

  private pump() {
    const s = this.song;
    const ctx = this.ctx;
    if (!s || !ctx) return;
    const stepDur = 60 / s.song.bpm / 4;
    const horizon = ctx.currentTime + 0.25;
    while (s.start + s.next * stepDur < horizon) {
      const step = s.next % s.len;
      const loopIdx = Math.floor(s.next / s.len);
      if (loopIdx > 0 && !s.song.loop) {
        this.stopMusic();
        return;
      }
      const at = s.start + s.next * stepDur;
      s.parsed.forEach((p, ti) => {
        const tr = s.song.tracks[ti];
        for (const n of p.notes) {
          if (n.step !== step) continue;
          const dur = n.len * stepDur;
          if (this.musicOn) this.voice(tr, n, at, dur);
        }
      });
      s.next++;
    }
  }

  private voice(tr: Track, n: ParsedNote, at: number, dur: number) {
    if (tr.wave === 'noise') {
      const d = n.drum;
      if (d === 'k') this.tone({ wave: 'tri', freq: 160, to: 45, dur: 0.12, vol: tr.vol * 1.6, at, bus: 'music' });
      else if (d === 's') this.tone({ wave: 'noise', freq: 1, dur: 0.12, vol: tr.vol, at, bus: 'music', release: 0.1, filter: { type: 'bandpass', freq: 1800 } });
      else this.tone({ wave: 'noise', freq: 2.2, dur: 0.03, vol: tr.vol * 0.6, at, bus: 'music', filter: { type: 'highpass', freq: 6000 } });
      return;
    }
    this.tone({
      wave: tr.wave,
      freq: n.freq,
      dur: Math.max(0.04, dur * 0.92),
      vol: tr.vol,
      at,
      bus: 'music',
      vib: tr.vib,
      vibRate: 5.5,
      release: tr.release ?? Math.min(0.08, dur * 0.4),
    });
  }
}

export const audio = new Synth();
