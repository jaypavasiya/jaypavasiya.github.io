import { lazy, Suspense, useCallback, useEffect, useRef, useState, type RefObject } from 'react'
import { profile } from '../content/profile'
import { onIntroDone } from '../lib/intro'
import { gsap, isTouch, prefersReducedMotion, scrollToTarget, setScrollLocked, SplitText } from '../lib/motion'
import { CanvasErrorBoundary, hasWebGL, signalHeroReady } from '../three/support'
import './Hero.css'

// The 3D world (three + rapier + the game) streams in after the overlay has painted.
const Playground = lazy(() => import('../three/Playground'))

const CANVAS_LABEL =
  'Floors, a five-floor mini game. Use W, A, S, D or the arrow keys to walk Jay, Space to jump and E to wave; on touch, tap or drag to walk. Click or tap objects to use them. Each floor has one goal; clearing it calls a lift to the next floor.'

function HeroFallback() {
  useEffect(() => signalHeroReady(), [])
  return (
    <div className="hero__fallback" aria-hidden="true">
      <div className="hero__fallback-island">
        <span className="hero__fallback-block is-j">J</span>
        <span className="hero__fallback-block is-a">A</span>
        <span className="hero__fallback-block is-y">Y</span>
      </div>
    </div>
  )
}

function useReducedMotion() {
  const [reduced, setReduced] = useState(prefersReducedMotion)
  useEffect(() => {
    const mq = window.matchMedia('(prefers-reduced-motion: reduce)')
    const update = () => setReduced(mq.matches)
    mq.addEventListener('change', update)
    return () => mq.removeEventListener('change', update)
  }, [])
  return reduced
}

// The name rises in once the intro curtain has lifted (not behind it).
function useHeadingRise(ref: RefObject<HTMLHeadingElement | null>) {
  useEffect(() => {
    const el = ref.current
    if (!el || prefersReducedMotion()) return
    const split = SplitText.create(el, { type: 'lines,chars', linesClass: 'split-line', aria: 'auto' })
    gsap.set(split.chars, { yPercent: 110, rotate: 6 })
    let tween: gsap.core.Tween | null = null
    const off = onIntroDone(() => {
      tween = gsap.to(split.chars, { yPercent: 0, rotate: 0, duration: 0.9, ease: 'expo.out', stagger: 0.018, delay: 0.05 })
    })
    return () => {
      off()
      tween?.kill()
      split.revert()
    }
  }, [ref])
}

type FullMode = 'off' | 'api' | 'overlay'

type FsDoc = Document & { webkitFullscreenElement?: Element | null; webkitExitFullscreen?: () => Promise<void> | void }
type FsEl = HTMLElement & { webkitRequestFullscreen?: () => Promise<void> | void }

const fsElement = () => document.fullscreenElement ?? (document as FsDoc).webkitFullscreenElement ?? null

export default function Hero() {
  const section = useRef<HTMLElement>(null)
  const heading = useRef<HTMLHeadingElement>(null)
  const fullBtn = useRef<HTMLButtonElement>(null)
  const visibility = useRef(1)
  const savedScroll = useRef(0)
  const [inView, setInView] = useState(true)
  const [mostlyInView, setMostlyInView] = useState(true)
  const [tabVisible, setTabVisible] = useState(() => !document.hidden)
  const [webgl, setWebgl] = useState(hasWebGL)
  const [touched, setTouched] = useState(false)
  const [full, setFull] = useState<FullMode>('off')
  const [touch] = useState(isTouch)
  const reduced = useReducedMotion()
  useHeadingRise(heading)

  useEffect(() => {
    const el = section.current
    if (!el) return
    const io = new IntersectionObserver(
      ([entry]) => {
        visibility.current = entry.intersectionRatio
        setInView(entry.isIntersecting)
        setMostlyInView(entry.intersectionRatio >= 0.35)
      },
      { threshold: [0, 0.05, 0.25, 0.35, 0.5, 0.6, 0.75, 1] },
    )
    io.observe(el)
    const onVis = () => setTabVisible(!document.hidden)
    document.addEventListener('visibilitychange', onVis)
    return () => {
      io.disconnect()
      document.removeEventListener('visibilitychange', onVis)
    }
  }, [])

  // ---------- Full screen ----------

  const enterFull = useCallback(async () => {
    const el = section.current as FsEl | null
    if (!el) return
    savedScroll.current = window.scrollY
    const req = el.requestFullscreen ?? el.webkitRequestFullscreen
    if (req && document.fullscreenEnabled !== false) {
      try {
        await req.call(el)
        setFull('api')
        return
      } catch {
        // Fall through to the edge-to-edge overlay.
      }
    }
    setFull('overlay')
  }, [])

  const exitFull = useCallback(() => {
    if (fsElement()) {
      const d = document as FsDoc
      void (d.exitFullscreen ?? d.webkitExitFullscreen)?.call(d)
    } else setFull('off')
  }, [])

  // Browser-driven exits (Esc in the Fullscreen API, gestures).
  useEffect(() => {
    const onChange = () => {
      if (!fsElement()) setFull((m) => (m === 'api' ? 'off' : m))
    }
    document.addEventListener('fullscreenchange', onChange)
    document.addEventListener('webkitfullscreenchange', onChange)
    return () => {
      document.removeEventListener('fullscreenchange', onChange)
      document.removeEventListener('webkitfullscreenchange', onChange)
    }
  }, [])

  // Esc exits (the browser also handles it natively in API mode).
  useEffect(() => {
    if (full === 'off') return
    const onKey = (e: KeyboardEvent) => {
      if (e.key === 'Escape') exitFull()
    }
    window.addEventListener('keydown', onKey)
    return () => window.removeEventListener('keydown', onKey)
  }, [full, exitFull])

  const wasFull = useRef(false)
  useEffect(() => {
    const root = document.documentElement
    if (full !== 'off') {
      wasFull.current = true
      setScrollLocked(true)
      root.classList.add('is-game-full')
      // Focus the game so keys work straight away.
      const id = requestAnimationFrame(() => section.current?.querySelector<HTMLElement>('.hero__canvas')?.focus({ preventScroll: true }))
      return () => cancelAnimationFrame(id)
    }
    if (wasFull.current) {
      wasFull.current = false
      root.classList.remove('is-game-full')
      setScrollLocked(false)
      const y = savedScroll.current
      requestAnimationFrame(() => {
        window.scrollTo(0, y)
        fullBtn.current?.focus({ preventScroll: true })
      })
    }
  }, [full])

  useEffect(
    () => () => {
      document.documentElement.classList.remove('is-game-full')
    },
    [],
  )

  const onReadMore = useCallback(() => {
    if (full !== 'off') exitFull()
    setTimeout(() => scrollToTarget('#about'), full !== 'off' ? 250 : 0)
  }, [full, exitFull])

  const onFirstInput = useCallback(() => setTouched(true), [])
  const onContextLost = useCallback(() => {
    setWebgl(false)
    setFull('off')
  }, [])
  const fallback = <HeroFallback />
  const isFull = full !== 'off'

  return (
    <section
      id="top"
      ref={section}
      className={`hero${isFull ? ' is-full' : ''}${full === 'api' ? ' is-fs-api' : ''}${full === 'overlay' ? ' is-overlay' : ''}`}
      aria-label="Floors: a playable 3D intro"
    >
      <div className="hero__stage">
        {webgl ? (
          <CanvasErrorBoundary fallback={fallback} onError={onContextLost}>
            <Suspense fallback={<div className="hero__loading" aria-hidden="true" />}>
              <Playground
                active={(inView || isFull) && tabVisible}
                audible={(mostlyInView || isFull) && tabVisible}
                reducedMotion={reduced}
                visibility={visibility}
                fullscreen={isFull}
                label={CANVAS_LABEL}
                onFirstInput={onFirstInput}
                onContextLost={onContextLost}
                onReadMore={onReadMore}
              />
            </Suspense>
          </CanvasErrorBoundary>
        ) : (
          fallback
        )}
      </div>

      <div className="hero__overlay">
        <p className="hero__label mono">
          <span className="hero__dot" aria-hidden="true" />
          {profile.role} · {profile.focus}
        </p>

        <div className="hero__bottom">
          <h1 ref={heading} className="hero__name">
            {profile.name}
          </h1>

          <div className="hero__actions">
            {webgl && (
              <p className="hero__hint mono">
                <span className={touched ? 'is-hidden' : ''} aria-hidden={touched}>
                  {touch ? 'Tap or drag to walk' : 'WASD / arrows · Space jump · E wave'}
                </span>
                <span>Best played full screen</span>
              </p>
            )}
            <div className="hero__buttons">
              {webgl && (
                <button ref={fullBtn} type="button" className="hero__btn mono" onClick={() => void enterFull()}>
                  <svg viewBox="0 0 16 16" width="14" height="14" aria-hidden="true">
                    <path
                      d="M2.5 6V2.5H6M10 2.5h3.5V6M13.5 10v3.5H10M6 13.5H2.5V10"
                      fill="none"
                      stroke="currentColor"
                      strokeWidth="1.6"
                      strokeLinecap="round"
                      strokeLinejoin="round"
                    />
                  </svg>
                  <span className="hero__btn-extra">Play </span>full screen
                </button>
              )}
              <button type="button" className="hero__btn hero__btn--ghost mono" onClick={() => scrollToTarget('#about')}>
                Scroll to explore
                <svg viewBox="0 0 16 16" width="14" height="14" aria-hidden="true">
                  <path d="M8 2.5v11M3.5 9 8 13.5 12.5 9" fill="none" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round" strokeLinejoin="round" />
                </svg>
              </button>
            </div>
          </div>
        </div>

        {isFull && (
          <button type="button" className="hero__exit" onClick={exitFull} aria-label="Exit full screen">
            <svg viewBox="0 0 16 16" width="16" height="16" aria-hidden="true">
              <path d="M3.5 3.5l9 9M12.5 3.5l-9 9" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" />
            </svg>
          </button>
        )}
      </div>
    </section>
  )
}
