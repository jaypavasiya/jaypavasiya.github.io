import { lazy, Suspense, useCallback, useEffect, useRef, useState } from 'react'
import { KineticHeading } from '../components/KineticHeading'
import { profile } from '../content/profile'
import { isTouch, prefersReducedMotion, scrollToTarget } from '../lib/motion'
import { CanvasErrorBoundary, hasWebGL } from '../three/support'
import './Hero.css'

// The 3D world (three + rapier) streams in after the overlay has painted.
const Playground = lazy(() => import('../three/Playground'))

const CANVAS_LABEL =
  'Interactive 3D playground. Use W, A, S, D or the arrow keys to walk Jay around, Space to jump and E to wave. Click or tap the letters and toys to knock them over.'

function HeroFallback() {
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

export default function Hero() {
  const section = useRef<HTMLElement>(null)
  const visibility = useRef(1)
  const [inView, setInView] = useState(true)
  const [tabVisible, setTabVisible] = useState(() => !document.hidden)
  const [webgl, setWebgl] = useState(hasWebGL)
  const [touched, setTouched] = useState(false)
  const [resetKey, setResetKey] = useState(0)
  const [touch] = useState(isTouch)
  const reduced = useReducedMotion()

  useEffect(() => {
    const el = section.current
    if (!el) return
    const io = new IntersectionObserver(
      ([entry]) => {
        visibility.current = entry.intersectionRatio
        setInView(entry.isIntersecting)
      },
      { threshold: [0, 0.05, 0.25, 0.5, 0.6, 0.75, 1] },
    )
    io.observe(el)
    const onVis = () => setTabVisible(!document.hidden)
    document.addEventListener('visibilitychange', onVis)
    return () => {
      io.disconnect()
      document.removeEventListener('visibilitychange', onVis)
    }
  }, [])

  const onFirstInput = useCallback(() => setTouched(true), [])
  const onContextLost = useCallback(() => setWebgl(false), [])
  const fallback = <HeroFallback />

  return (
    <section id="top" ref={section} className="hero" aria-label="Interactive 3D playground">
      <div className="hero__stage">
        {webgl ? (
          <CanvasErrorBoundary fallback={fallback} onError={onContextLost}>
            <Suspense fallback={<div className="hero__loading" aria-hidden="true" />}>
              <Playground
                active={inView && tabVisible}
                reducedMotion={reduced}
                visibility={visibility}
                resetKey={resetKey}
                label={CANVAS_LABEL}
                onFirstInput={onFirstInput}
                onContextLost={onContextLost}
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
          {profile.role} · {profile.tagline}
        </p>

        <div className="hero__bottom">
          <KineticHeading as="h1" immediate effect="rise" className="hero__name">
            {profile.name}
          </KineticHeading>

          <div className="hero__actions">
            {webgl && (
              <p className={`hero__hint mono${touched ? ' is-hidden' : ''}`} aria-hidden={touched}>
                {touch ? 'Tap or drag to walk · tap letters' : 'WASD / arrows to walk · click letters'}
              </p>
            )}
            <div className="hero__buttons">
              {webgl && (
                <button type="button" className="hero__btn hero__btn--ghost mono" onClick={() => setResetKey((k) => k + 1)}>
                  <svg viewBox="0 0 16 16" width="14" height="14" aria-hidden="true">
                    <path
                      d="M13.5 8a5.5 5.5 0 1 1-1.6-3.9M13.5 2.5v3h-3"
                      fill="none"
                      stroke="currentColor"
                      strokeWidth="1.6"
                      strokeLinecap="round"
                      strokeLinejoin="round"
                    />
                  </svg>
                  Reset
                </button>
              )}
              <button type="button" className="hero__btn mono" onClick={() => scrollToTarget('#about')}>
                Scroll to explore
                <svg viewBox="0 0 16 16" width="14" height="14" aria-hidden="true">
                  <path d="M8 2.5v11M3.5 9 8 13.5 12.5 9" fill="none" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round" strokeLinejoin="round" />
                </svg>
              </button>
            </div>
          </div>
        </div>
      </div>
    </section>
  )
}
