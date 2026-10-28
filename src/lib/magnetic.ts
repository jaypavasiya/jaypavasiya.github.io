// Magnetic hover for a few primary buttons, via document delegation so the
// sections stay untouched. Uses the standalone CSS `translate` property so it
// composes with whatever `transform` the element's own CSS or GSAP sets.

const SELECTOR = '.hero__btn, .contact-email, .contact-copy, .sk-shake, .nav-sound, .theme-toggle, [data-magnetic]'
const STRENGTH = 0.28
const MAX = 10

type State = { x: number; y: number; tx: number; ty: number; raf: number }
const states = new WeakMap<HTMLElement, State>()

function step(el: HTMLElement, s: State) {
  s.x += (s.tx - s.x) * 0.18
  s.y += (s.ty - s.y) * 0.18
  if (Math.abs(s.tx - s.x) < 0.05 && Math.abs(s.ty - s.y) < 0.05) {
    s.x = s.tx
    s.y = s.ty
    s.raf = 0
  } else {
    s.raf = requestAnimationFrame(() => step(el, s))
  }
  el.style.translate = s.x || s.y ? `${s.x.toFixed(2)}px ${s.y.toFixed(2)}px` : ''
}

function pull(el: HTMLElement, tx: number, ty: number) {
  let s = states.get(el)
  if (!s) {
    s = { x: 0, y: 0, tx: 0, ty: 0, raf: 0 }
    states.set(el, s)
  }
  s.tx = tx
  s.ty = ty
  if (!s.raf) s.raf = requestAnimationFrame(() => step(el, s))
}

let wired = false
export function initMagnetic() {
  if (wired || typeof window === 'undefined') return () => {}
  const fine = window.matchMedia('(hover: hover) and (pointer: fine) and (prefers-reduced-motion: no-preference)')
  wired = true
  let current: HTMLElement | null = null

  const onMove = (e: PointerEvent) => {
    if (e.pointerType !== 'mouse' || !fine.matches) return
    const el = (e.target as Element | null)?.closest?.<HTMLElement>(SELECTOR) ?? null
    if (current && current !== el) pull(current, 0, 0)
    current = el
    if (!el) return
    const r = el.getBoundingClientRect()
    const clamp = (v: number) => Math.max(-MAX, Math.min(MAX, v))
    // Measure against the un-pulled box so the pull doesn't feed back on itself.
    const s = states.get(el)
    const cx = r.left + r.width / 2 - (s?.x ?? 0)
    const cy = r.top + r.height / 2 - (s?.y ?? 0)
    pull(el, clamp((e.clientX - cx) * STRENGTH), clamp((e.clientY - cy) * STRENGTH))
  }
  const release = () => {
    if (current) pull(current, 0, 0)
    current = null
  }

  window.addEventListener('pointermove', onMove, { passive: true })
  document.addEventListener('mouseleave', release)
  window.addEventListener('blur', release)
  return () => {
    wired = false
    window.removeEventListener('pointermove', onMove)
    document.removeEventListener('mouseleave', release)
    window.removeEventListener('blur', release)
  }
}
