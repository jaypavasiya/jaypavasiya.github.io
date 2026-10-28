// Tiny synthesized UI sounds (Josh Comeau / Bruno Simon style). Off by
// default; no audio files. The AudioContext is only created once the
// visitor has turned sound on, inside a user gesture.

const KEY = 'sound'
const HOVER = 'a[href], button, [role="button"], summary, label[for], .xp-row'

let enabled = readStored()
let ctx: AudioContext | null = null
let master: GainNode | null = null
let lastTick = 0
let lastHovered: Element | null = null
const listeners = new Set<(on: boolean) => void>()

function readStored() {
  try {
    return localStorage.getItem(KEY) === 'on'
  } catch {
    return false
  }
}

export const isSoundOn = () => enabled

export function onSoundChange(cb: (on: boolean) => void) {
  listeners.add(cb)
  return () => {
    listeners.delete(cb)
  }
}

export function setSound(on: boolean) {
  enabled = on
  try {
    localStorage.setItem(KEY, on ? 'on' : 'off')
  } catch {
    // Private mode: still works for this visit.
  }
  if (on) {
    audio()
    chime()
  } else if (ctx && ctx.state === 'running') {
    void ctx.suspend()
  }
  listeners.forEach((cb) => cb(on))
}

// Only called from user gestures (toggle click, pointerdown, keydown), so
// the browser lets the context start without autoplay warnings.
function audio() {
  if (!enabled) return null
  if (!ctx) {
    const AC = window.AudioContext ?? (window as unknown as { webkitAudioContext?: typeof AudioContext }).webkitAudioContext
    if (!AC) return null
    ctx = new AC()
    master = ctx.createGain()
    master.gain.value = 0.6
    master.connect(ctx.destination)
  }
  if (ctx.state === 'suspended') void ctx.resume()
  return ctx
}

/**
 * The shared context and master bus for other synths (the hero game), or
 * null while sound is off. Only creates the context when `create` is true,
 * which callers pass from inside a user gesture.
 */
export function getAudio(create = false): { ctx: AudioContext; out: GainNode } | null {
  if (!enabled) return null
  if (!ctx && !create) return null
  const c = audio()
  return c && master ? { ctx: c, out: master } : null
}

function blip(freq: number, endFreq: number, dur: number, gain: number, type: OscillatorType, delay = 0) {
  const c = ctx
  if (!enabled || !c || !master || c.state !== 'running') return
  const t = c.currentTime + delay
  const osc = c.createOscillator()
  const g = c.createGain()
  osc.type = type
  osc.frequency.setValueAtTime(freq, t)
  osc.frequency.exponentialRampToValueAtTime(endFreq, t + dur)
  g.gain.setValueAtTime(0.0001, t)
  g.gain.exponentialRampToValueAtTime(gain, t + 0.004)
  g.gain.exponentialRampToValueAtTime(0.0001, t + dur)
  osc.connect(g).connect(master)
  osc.start(t)
  osc.stop(t + dur + 0.02)
}

const jitter = (n: number, amt = 0.06) => n * (1 + (Math.random() * 2 - 1) * amt)

/** A soft, high, very short tick. */
export function tick() {
  const now = performance.now()
  if (now - lastTick < 70) return
  lastTick = now
  blip(jitter(2400), 1800, 0.035, 0.035, 'triangle')
}

/** A rounder pop with a quick downward pitch bend. */
export function pop() {
  blip(jitter(620, 0.08), 160, 0.11, 0.12, 'sine')
  blip(jitter(1800), 900, 0.02, 0.025, 'triangle')
}

function chime() {
  // Wait a frame for resume() to settle so the confirmation is audible.
  const play = () => {
    blip(880, 860, 0.16, 0.06, 'sine')
    blip(1320, 1300, 0.22, 0.05, 'sine', 0.07)
  }
  if (ctx?.state === 'running') play()
  else void ctx?.resume().then(play)
}

let wired = false
/** Document-level delegation, so sections never need to know about sound. */
export function initSound() {
  if (wired || typeof document === 'undefined') return
  wired = true
  document.addEventListener(
    'pointerover',
    (e) => {
      if (!enabled || e.pointerType !== 'mouse') return
      const el = (e.target as Element | null)?.closest?.(HOVER) ?? null
      if (el && el !== lastHovered) tick()
      lastHovered = el
    },
    { passive: true },
  )
  document.addEventListener(
    'click',
    (e) => {
      if (!enabled) return
      const el = (e.target as Element | null)?.closest?.(HOVER)
      // The toggle plays its own chime.
      if (el && !el.closest('[data-sound-toggle]')) pop()
    },
    { passive: true, capture: true },
  )
  // A remembered "on" can only start audio after a gesture.
  const wake = () => {
    if (enabled) audio()
  }
  document.addEventListener('pointerdown', wake, { passive: true })
  document.addEventListener('keydown', wake, { passive: true })
}
