import { useEffect, useRef, useState } from 'react'
import { gsap, prefersReducedMotion, setScrollLocked, startSmoothScroll } from '../lib/motion'
import { finishIntro, introSeen, isHeroReady, markIntroSeen } from '../lib/intro'
import { hasWebGL } from '../three/support'
import './Preloader.css'

const NAME = 'Jay Pavasiya'
const CAP_MS = 4500
// How much of the bar each real signal is worth.
const WEIGHTS = { fonts: 30, hero: 70 }

const toBinary = (s: string) => s.replace(/\S/g, (_, i: number) => ((i * 7) % 3 ? '1' : '0'))

// Wodniack-style intro: an ink panel, a counter fed by real load signals
// (webfonts + the hero's first rendered frame), the name resolving from
// binary, then a clip-path curtain. Once per session.
export function Preloader() {
  const [show] = useState(() => !introSeen())
  const [gone, setGone] = useState(false)
  const root = useRef<HTMLDivElement>(null)
  const panel = useRef<HTMLDivElement>(null)
  const accent = useRef<HTMLDivElement>(null)
  const count = useRef<HTMLSpanElement>(null)
  const bits = useRef<HTMLSpanElement>(null)
  const name = useRef<HTMLSpanElement>(null)
  const bar = useRef<HTMLSpanElement>(null)

  useEffect(() => {
    if (!show) {
      finishIntro()
      return
    }
    document.documentElement.classList.add('is-intro')
    startSmoothScroll()
    setScrollLocked(true)

    const reduced = prefersReducedMotion()
    const start = performance.now()
    const ready = { fonts: false, hero: isHeroReady() || !hasWebGL() }
    let shown = 0
    let finished = false
    let exitTl: gsap.core.Timeline | null = null

    const fontsP = document.fonts?.ready ?? Promise.resolve()
    fontsP.then(() => (ready.fonts = true)).catch(() => (ready.fonts = true))
    const onHero = () => (ready.hero = true)
    window.addEventListener('hero:ready', onHero)

    const scramble = gsap.to(name.current, {
      duration: 1,
      ease: 'none',
      paused: true,
      scrambleText: { text: NAME, chars: '01', speed: 1, revealDelay: 0.1 },
    })

    const release = () => {
      markIntroSeen()
      setScrollLocked(false)
      finishIntro()
      setGone(true)
    }

    const exit = () => {
      if (finished) return
      finished = true
      gsap.ticker.remove(tick)
      if (root.current) root.current.style.pointerEvents = 'none'
      if (reduced) {
        gsap.to(root.current, { autoAlpha: 0, duration: 0.3, onComplete: release })
        return
      }
      scramble.progress(1)
      exitTl = gsap
        .timeline({ delay: 0.25, onComplete: release })
        .to(panel.current?.querySelectorAll('.intro-line > *') ?? [], {
          yPercent: -110,
          duration: 0.6,
          ease: 'power3.in',
          stagger: 0.04,
        })
        .to(panel.current, { clipPath: 'inset(0% 0% 100% 0%)', duration: 0.95, ease: 'expo.inOut' }, '-=0.25')
        .to(accent.current, { clipPath: 'inset(0% 0% 100% 0%)', duration: 0.95, ease: 'expo.inOut' }, '<0.12')
        // Hand off to the release a beat early so the page feels live as the curtain clears.
        .call(() => setScrollLocked(false), [], '-=0.35')
    }

    function render(v: number) {
      const n = Math.round(v)
      if (count.current) count.current.textContent = String(n).padStart(3, '0')
      if (bits.current) bits.current.textContent = n.toString(2).padStart(7, '0')
      if (bar.current) bar.current.style.transform = `scaleX(${v / 100})`
      if (!reduced) scramble.progress(Math.min(1, v / 92))
    }

    function tick(_t: number, dtMs: number) {
      const elapsed = performance.now() - start
      const capped = elapsed > CAP_MS
      // Pending signals creep toward 85% of their share so the counter never stalls.
      const creep = Math.min(0.85, (elapsed / 2600) ** 0.7)
      let target = 0
      for (const k of ['fonts', 'hero'] as const) target += WEIGHTS[k] * (ready[k] || capped ? 1 : creep)
      // Real elapsed time, so a main thread busy compiling shaders can't stretch the intro.
      const dt = Math.min(dtMs, 250) / 1000
      // Cap the climb rate so even an instant load reads as a count, not a jump.
      shown = Math.min(target, shown + Math.max((target - shown) * dt * 4, dt * 40), shown + dt * 110)
      if (target - shown < 0.25 || elapsed > CAP_MS + 900) shown = target
      render(shown)
      if (shown >= 100) exit()
    }

    render(0)
    if (reduced) {
      // A static card: the name, no counting, then a short fade.
      root.current?.classList.add('is-reduced')
      if (name.current) name.current.textContent = NAME
      // No counting: just wait for the real signals (briefly) and fade.
      const poll = window.setInterval(() => {
        if ((ready.fonts && ready.hero) || performance.now() - start > 2000) {
          window.clearInterval(poll)
          exit()
        }
      }, 100)
      return () => {
        window.clearInterval(poll)
        window.removeEventListener('hero:ready', onHero)
        setScrollLocked(false)
      }
    }

    gsap.ticker.add(tick)
    return () => {
      gsap.ticker.remove(tick)
      window.removeEventListener('hero:ready', onHero)
      scramble.kill()
      exitTl?.kill()
      // Not finishIntro(): StrictMode re-runs this effect in dev.
      setScrollLocked(false)
    }
  }, [show])

  if (!show || gone) return null

  return (
    <div className="intro" ref={root}>
      <p className="visually-hidden" role="status">
        Loading
      </p>
      <div className="intro-accent" ref={accent} aria-hidden="true" />
      <div className="intro-panel" ref={panel} aria-hidden="true">
        <div className="intro-top mono">
          <span className="intro-line">
            <span>
              <span className="intro-pulse" /> Loading playground
            </span>
          </span>
          <span className="intro-line">
            <span ref={bits}>0000000</span>
          </span>
        </div>
        <div className="intro-bottom">
          <span className="intro-line intro-name-line">
            <span className="intro-name" ref={name}>
              {toBinary(NAME)}
            </span>
          </span>
          <span className="intro-line intro-count-line">
            <span className="intro-count mono" ref={count}>
              000
            </span>
          </span>
        </div>
        <span className="intro-bar" ref={bar} />
      </div>
    </div>
  )
}
