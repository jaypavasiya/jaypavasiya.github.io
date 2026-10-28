// Game sound effects and a small generative lo-fi/chiptune loop, all
// synthesised with Web Audio. Everything routes through lib/sound's master
// bus, so the Nav toggle (which suspends the context) mutes all of it.
import { getAudio, isSoundOn, onSoundChange } from '../lib/sound'

type Buses = { ctx: AudioContext; sfx: GainNode; music: GainNode; musicFade: GainNode; noise: AudioBuffer }

let buses: Buses | null = null

function getBuses(create = false): Buses | null {
  const a = getAudio(create)
  if (!a) return null
  if (buses && buses.ctx === a.ctx) return buses
  const { ctx, out } = a
  const sfx = ctx.createGain()
  sfx.gain.value = 0.7
  sfx.connect(out)
  // Music: fade stage -> gentle lowpass for the lo-fi warmth -> level.
  const musicFade = ctx.createGain()
  musicFade.gain.value = 0
  const lp = ctx.createBiquadFilter()
  lp.type = 'lowpass'
  lp.frequency.value = 3600
  lp.Q.value = 0.4
  const music = ctx.createGain()
  music.gain.value = 0.25
  musicFade.connect(lp).connect(music).connect(out)
  const len = ctx.sampleRate
  const noise = ctx.createBuffer(1, len, ctx.sampleRate)
  const d = noise.getChannelData(0)
  for (let i = 0; i < len; i++) d[i] = Math.random() * 2 - 1
  buses = { ctx, sfx, music, musicFade, noise }
  return buses
}

const ready = () => (isSoundOn() ? getBuses() : null)
const live = () => {
  const b = ready()
  return b && b.ctx.state === 'running' ? b : null
}
const vary = (n: number, amt = 0.06) => n * (1 + (Math.random() * 2 - 1) * amt)

function tone(b: Buses, dest: AudioNode, o: { f: number; f2?: number; t: number; dur: number; gain: number; type?: OscillatorType; attack?: number; detune?: number }) {
  const osc = b.ctx.createOscillator()
  const g = b.ctx.createGain()
  osc.type = o.type ?? 'sine'
  osc.frequency.setValueAtTime(o.f, o.t)
  if (o.f2) osc.frequency.exponentialRampToValueAtTime(o.f2, o.t + o.dur)
  if (o.detune) osc.detune.value = o.detune
  const a = o.attack ?? 0.005
  g.gain.setValueAtTime(0.0001, o.t)
  g.gain.exponentialRampToValueAtTime(o.gain, o.t + a)
  g.gain.exponentialRampToValueAtTime(0.0001, o.t + o.dur)
  osc.connect(g).connect(dest)
  osc.start(o.t)
  osc.stop(o.t + o.dur + 0.05)
}

function noise(b: Buses, dest: AudioNode, o: { t: number; dur: number; gain: number; type: BiquadFilterType; f: number; f2?: number; q?: number; attack?: number }) {
  const src = b.ctx.createBufferSource()
  src.buffer = b.noise
  const filt = b.ctx.createBiquadFilter()
  filt.type = o.type
  filt.frequency.setValueAtTime(o.f, o.t)
  if (o.f2) filt.frequency.exponentialRampToValueAtTime(o.f2, o.t + o.dur)
  filt.Q.value = o.q ?? 0.8
  const g = b.ctx.createGain()
  const a = o.attack ?? 0.003
  g.gain.setValueAtTime(0.0001, o.t)
  g.gain.exponentialRampToValueAtTime(o.gain, o.t + a)
  g.gain.exponentialRampToValueAtTime(0.0001, o.t + o.dur)
  src.connect(filt).connect(g).connect(dest)
  const off = Math.random() * 0.5
  src.start(o.t, off, o.dur + 0.05)
}

const midi = (n: number) => 440 * Math.pow(2, (n - 69) / 12)

// ---------- SFX ----------

let lastStep = 0
/** Soft footstep; `k` 0..1 is the walk speed. */
export function footstep(k: number) {
  const b = live()
  if (!b) return
  const now = performance.now()
  if (now - lastStep < 140) return
  lastStep = now
  const t = b.ctx.currentTime
  const g = 0.05 + 0.05 * k
  noise(b, b.sfx, { t, dur: 0.07, gain: g, type: 'bandpass', f: vary(900, 0.15), q: 1.1 })
  tone(b, b.sfx, { f: vary(130, 0.08), f2: 70, t, dur: 0.08, gain: g * 0.9 })
}

let lastThud = 0
/** Wooden/plastic thud; `v` 0..1 is the impact strength. */
export function thud(v: number, pitch = 1) {
  const b = live()
  if (!b) return
  const now = performance.now()
  if (now - lastThud < 45) return
  lastThud = now
  const t = b.ctx.currentTime
  const g = 0.04 + Math.min(1, v) * 0.22
  tone(b, b.sfx, { f: vary(150 * pitch, 0.1), f2: 55 * pitch, t, dur: 0.16 + v * 0.1, gain: g })
  noise(b, b.sfx, { t, dur: 0.06 + v * 0.05, gain: g * 0.6, type: 'lowpass', f: 1400 + v * 1800 })
}

let lastPin = 0
export function pinCrash(v: number) {
  const b = live()
  if (!b) return
  const now = performance.now()
  if (now - lastPin < 60) return
  lastPin = now
  const t = b.ctx.currentTime
  const n = 2 + Math.round(Math.min(1, v) * 4)
  for (let i = 0; i < n; i++) {
    const tt = t + i * vary(0.028, 0.5)
    noise(b, b.sfx, { t: tt, dur: 0.05, gain: 0.05 + v * 0.12, type: 'bandpass', f: vary(1900, 0.3), q: 4 })
    tone(b, b.sfx, { f: vary(620, 0.25), f2: 380, t: tt, dur: 0.06, gain: 0.03 + v * 0.06, type: 'triangle' })
  }
}

export function vaultThunk() {
  const b = live()
  if (!b) return
  const t = b.ctx.currentTime
  tone(b, b.sfx, { f: 92, f2: 48, t, dur: 0.32, gain: 0.32 })
  tone(b, b.sfx, { f: 210, f2: 160, t: t + 0.01, dur: 0.09, gain: 0.08, type: 'square' })
  noise(b, b.sfx, { t, dur: 0.12, gain: 0.12, type: 'lowpass', f: 900 })
  // the latch rattling back
  noise(b, b.sfx, { t: t + 0.16, dur: 0.05, gain: 0.05, type: 'bandpass', f: 2600, q: 6 })
  noise(b, b.sfx, { t: t + 0.22, dur: 0.04, gain: 0.035, type: 'bandpass', f: 3100, q: 6 })
}

export function liftDing() {
  const b = live()
  if (!b) return
  const t = b.ctx.currentTime
  for (const [f, d] of [
    [midi(88), 0],
    [midi(84), 0.32],
  ] as const) {
    tone(b, b.sfx, { f, t: t + d, dur: 1.3, gain: 0.11, attack: 0.004 })
    tone(b, b.sfx, { f: f * 2.76, t: t + d, dur: 0.5, gain: 0.025 })
  }
}

export function whoosh(duration = 3) {
  const b = live()
  if (!b) return
  const t = b.ctx.currentTime
  noise(b, b.sfx, { t, dur: duration * 0.55, gain: 0.09, type: 'bandpass', f: 260, f2: 1700, q: 1.4, attack: duration * 0.35 })
  noise(b, b.sfx, { t: t + duration * 0.45, dur: duration * 0.55, gain: 0.06, type: 'bandpass', f: 1700, f2: 320, q: 1.2, attack: 0.2 })
}

export function goalChime() {
  const b = live()
  if (!b) return
  const t = b.ctx.currentTime
  ;[72, 76, 79, 84].forEach((n, i) => {
    tone(b, b.sfx, { f: midi(n), t: t + i * 0.09, dur: 0.6, gain: 0.09, type: 'triangle' })
    tone(b, b.sfx, { f: midi(n + 12), t: t + i * 0.09, dur: 0.3, gain: 0.025 })
  })
}

/** Small "got it" blip for partial progress. */
export function blipUp(step = 0) {
  const b = live()
  if (!b) return
  const t = b.ctx.currentTime
  const base = 76 + (step % 5) * 2
  tone(b, b.sfx, { f: midi(base), t, dur: 0.14, gain: 0.07, type: 'square' })
  tone(b, b.sfx, { f: midi(base + 7), t: t + 0.07, dur: 0.18, gain: 0.06, type: 'square' })
}

export function confettiPop() {
  const b = live()
  if (!b) return
  const t = b.ctx.currentTime
  tone(b, b.sfx, { f: 700, f2: 140, t, dur: 0.14, gain: 0.2 })
  noise(b, b.sfx, { t, dur: 0.25, gain: 0.16, type: 'highpass', f: 2500 })
  for (let i = 0; i < 6; i++) noise(b, b.sfx, { t: t + 0.05 + Math.random() * 0.4, dur: 0.03, gain: 0.04, type: 'bandpass', f: vary(5000, 0.3), q: 3 })
}

export function fanfare() {
  const b = live()
  if (!b) return
  const t = b.ctx.currentTime + 0.12
  const notes: [number, number, number][] = [
    [67, 0, 0.12],
    [67, 0.13, 0.12],
    [67, 0.26, 0.12],
    [72, 0.4, 0.5],
    [76, 0.62, 0.3],
    [79, 0.8, 0.9],
  ]
  for (const [n, d, len] of notes) {
    tone(b, b.sfx, { f: midi(n), t: t + d, dur: len + 0.1, gain: 0.07, type: 'square' })
    tone(b, b.sfx, { f: midi(n - 12), t: t + d, dur: len + 0.1, gain: 0.05, type: 'triangle' })
  }
  for (const n of [60, 64, 67, 72]) tone(b, b.sfx, { f: midi(n), t: t + 0.8, dur: 1.6, gain: 0.035, type: 'triangle', attack: 0.04 })
}

// ---------- Music ----------

type Arrangement = {
  root: number
  // Chord tones (semitones above root) per bar, 4 bars.
  chords: number[][]
  bass: number[] // 16-step pattern: 1 = root, 2 = fifth, 0 = rest
  kick: number[]
  hat: number // 1 = 8ths, 2 = 16ths
  arp: boolean
  cutoff: number
  lead: OscillatorType
}

const K = [1, 0, 0, 0, 0, 0, 0, 0, 1, 0, 1, 0, 0, 0, 0, 0]
const K2 = [1, 0, 0, 0, 0, 0, 1, 0, 0, 0, 1, 0, 0, 0, 0, 0]
const B1 = [1, 0, 0, 0, 0, 0, 1, 0, 2, 0, 0, 0, 1, 0, 0, 0]
const B2 = [1, 0, 0, 1, 0, 0, 2, 0, 1, 0, 0, 0, 2, 0, 1, 0]

// Each floor shifts the key and the arrangement a little.
const ARRANGEMENTS: Arrangement[] = [
  // Hello: C major, warm and simple
  { root: 48, chords: [[0, 4, 7, 11], [9, 12, 16, 19], [5, 9, 12, 16], [7, 11, 14, 17]], bass: B1, kick: K, hat: 1, arp: false, cutoff: 1400, lead: 'triangle' },
  // Journey: D dorian, a walking arp
  { root: 50, chords: [[0, 3, 7, 10], [5, 9, 12, 16], [3, 7, 10, 14], [7, 10, 14, 17]], bass: B1, kick: K, hat: 1, arp: true, cutoff: 1700, lead: 'triangle' },
  // Work: A minor, darker filter
  { root: 45, chords: [[0, 3, 7, 10], [8, 12, 15, 19], [5, 8, 12, 15], [7, 11, 14, 17]], bass: B2, kick: K2, hat: 1, arp: false, cutoff: 1100, lead: 'triangle' },
  // Skills: F, busier hats and a chip arp
  { root: 41, chords: [[0, 4, 7, 11], [2, 5, 9, 12], [4, 7, 11, 14], [5, 9, 12, 16]], bass: B2, kick: K2, hat: 2, arp: true, cutoff: 1900, lead: 'square' },
  // Rooftop: E flat, bright and open
  { root: 51, chords: [[0, 4, 7, 11], [9, 12, 16, 19], [8, 12, 15, 19], [10, 14, 17, 21]], bass: B1, kick: K, hat: 2, arp: true, cutoff: 2300, lead: 'square' },
]

const BPM = 90
const STEP = 60 / BPM / 4
const LOOKAHEAD = 0.14

const music = {
  playing: false,
  timer: 0 as ReturnType<typeof setInterval> | 0,
  step: 0,
  next: 0,
  arr: 0,
  pending: -1,
  stopAt: 0,
}

function scheduleStep(b: Buses, step: number, t: number) {
  const arr = ARRANGEMENTS[music.arr]
  const s = step % 16
  const bar = Math.floor(step / 16) % 4
  const chord = arr.chords[bar]
  const out = b.musicFade
  const swing = s % 2 === 1 ? STEP * 0.18 : 0
  const tt = t + swing

  if (s === 0) {
    // Pad: two detuned voices per chord tone, slow attack, long release.
    const dur = STEP * 16 + 0.4
    const filt = b.ctx.createBiquadFilter()
    filt.type = 'lowpass'
    filt.frequency.setValueAtTime(arr.cutoff * 0.6, t)
    filt.frequency.linearRampToValueAtTime(arr.cutoff, t + dur * 0.5)
    filt.frequency.linearRampToValueAtTime(arr.cutoff * 0.6, t + dur)
    filt.connect(out)
    for (const n of chord) {
      for (const det of [-7, 6]) {
        const osc = b.ctx.createOscillator()
        const g = b.ctx.createGain()
        osc.type = 'sawtooth'
        osc.frequency.value = midi(arr.root + 12 + n)
        osc.detune.value = det
        g.gain.setValueAtTime(0.0001, t)
        g.gain.linearRampToValueAtTime(0.022, t + 0.6)
        g.gain.setValueAtTime(0.022, t + dur - 0.6)
        g.gain.linearRampToValueAtTime(0.0001, t + dur)
        osc.connect(g).connect(filt)
        osc.start(t)
        osc.stop(t + dur + 0.05)
      }
    }
  }

  const bn = arr.bass[s]
  if (bn) {
    const note = arr.root - 12 + chord[0] + (bn === 2 ? 7 : 0)
    tone(b, out, { f: midi(note), t: tt, dur: STEP * 2.6, gain: 0.16, type: 'triangle', attack: 0.01 })
    tone(b, out, { f: midi(note + 12), t: tt, dur: STEP * 1.5, gain: 0.025, type: 'square', attack: 0.01 })
  }

  if (arr.kick[s]) {
    tone(b, out, { f: 120, f2: 42, t, dur: 0.28, gain: 0.32 })
  }
  // soft snare-ish rim on the backbeat
  if (s === 4 || s === 12) {
    noise(b, out, { t, dur: 0.12, gain: 0.05, type: 'bandpass', f: 1800, q: 0.9 })
  }
  const hatOn = arr.hat === 2 ? true : s % 2 === 0
  if (hatOn) {
    const accent = s % 4 === 2 ? 1 : 0.55
    noise(b, out, { t: tt, dur: 0.035, gain: 0.025 * accent, type: 'highpass', f: 7000 })
  }

  if (arr.arp && s % 2 === 0) {
    // Gentle up-down arpeggio over the chord, with rests for air.
    const pattern = [0, 1, 2, 3, 2, 1, -1, 2]
    const idx = pattern[(s / 2) % pattern.length]
    if (idx >= 0) {
      const n = arr.root + 24 + chord[idx]
      tone(b, out, { f: midi(n), t: tt, dur: STEP * 1.6, gain: arr.lead === 'square' ? 0.018 : 0.03, type: arr.lead })
    }
  }
}

function tickMusic() {
  const b = getBuses()
  if (!b || b.ctx.state !== 'running') return
  const now = b.ctx.currentTime
  if (music.next < now) music.next = now + 0.05
  while (music.next < now + LOOKAHEAD) {
    // Change arrangement on a bar boundary.
    if (music.step % 16 === 0 && music.pending >= 0) {
      music.arr = music.pending
      music.pending = -1
    }
    scheduleStep(b, music.step, music.next)
    music.step = (music.step + 1) % 64
    music.next += STEP
  }
  if (!music.playing && music.stopAt && now > music.stopAt) {
    clearInterval(music.timer)
    music.timer = 0
    music.stopAt = 0
  }
}

function fadeTo(b: Buses, v: number, time: number) {
  const g = b.musicFade.gain
  const now = b.ctx.currentTime
  g.cancelScheduledValues(now)
  g.setValueAtTime(g.value, now)
  g.setTargetAtTime(v, now, time / 3)
}

export function setMusicFloor(floor: number) {
  const f = Math.max(0, Math.min(ARRANGEMENTS.length - 1, floor))
  if (!music.timer) {
    music.arr = f
    music.pending = -1
  } else if (f !== music.arr) music.pending = f
}

/** Turns the loop on/off with a smooth fade. Safe to call often. */
export function setMusicPlaying(on: boolean, create = false) {
  const b = isSoundOn() ? getBuses(create) : null
  if (!b) {
    // Sound is off (context suspended): stop the scheduler outright.
    music.playing = false
    if (music.timer) clearInterval(music.timer)
    music.timer = 0
    music.stopAt = 0
    if (buses) buses.musicFade.gain.value = 0
    return
  }
  if (on === music.playing && (on ? !!music.timer : true)) return
  music.playing = on
  if (on) {
    music.stopAt = 0
    if (!music.timer) {
      music.step = 0
      music.next = b.ctx.currentTime + 0.1
      music.timer = setInterval(tickMusic, 25)
    }
    fadeTo(b, 1, 1.6)
  } else {
    fadeTo(b, 0, 1.2)
    music.stopAt = b.ctx.currentTime + 1.6
  }
}

export { onSoundChange, isSoundOn }
