// Shared state for the first-visit intro so other code (the hero heading,
// reveal timelines) can wait for the curtain to lift before animating.

const KEY = 'intro-seen'

let done = false
const waiters = new Set<() => void>()

export function introSeen() {
  try {
    return sessionStorage.getItem(KEY) === '1'
  } catch {
    return false
  }
}

export function markIntroSeen() {
  try {
    sessionStorage.setItem(KEY, '1')
  } catch {
    // Private mode: the intro simply plays again next load.
  }
}

export function isIntroDone() {
  return done
}

/** Runs `cb` once the intro curtain has lifted (or right away if it already has). */
export function onIntroDone(cb: () => void) {
  if (done) {
    cb()
    return () => {}
  }
  waiters.add(cb)
  return () => {
    waiters.delete(cb)
  }
}

export function finishIntro() {
  if (done) return
  done = true
  document.documentElement.classList.remove('is-intro')
  waiters.forEach((cb) => cb())
  waiters.clear()
  window.dispatchEvent(new Event('intro:done'))
}

// The hero announces when its 3D scene has painted a frame. It can fire
// before the preloader mounts, so remember it.
let heroReady = false
if (typeof window !== 'undefined') {
  window.addEventListener('hero:ready', () => (heroReady = true), { once: true })
}
export const isHeroReady = () => heroReady
