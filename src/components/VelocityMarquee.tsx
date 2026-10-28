import { useEffect, useRef } from 'react'
import { gsap, prefersReducedMotion, scrollState } from '../lib/motion'
import './VelocityMarquee.css'

type Props = {
  items: string[]
  /** Base drift in px/s. */
  speed?: number
  /** Start drifting right instead of left. */
  reverse?: boolean
}

const COPIES = 4

// Stas Bondar-style kinetic divider: huge type that drifts, speeds up and
// leans with scroll velocity, and flips direction with scroll direction.
// Purely decorative; parked while offscreen.
export function VelocityMarquee({ items, speed = 60, reverse = false }: Props) {
  const root = useRef<HTMLDivElement>(null)
  const track = useRef<HTMLDivElement>(null)

  useEffect(() => {
    const el = root.current
    const tr = track.current
    if (!el || !tr || prefersReducedMotion()) return

    let width = 0
    let x = 0
    let dir = reverse ? 1 : -1
    let skew = 0
    let lastY = window.scrollY
    const measure = () => {
      const seg = tr.firstElementChild as HTMLElement | null
      width = seg?.offsetWidth ?? 0
    }
    measure()
    const ro = new ResizeObserver(measure)
    ro.observe(tr)

    const setX = gsap.quickSetter(tr, 'x', 'px')
    const setSkew = gsap.quickSetter(tr, 'skewX', 'deg')

    const tick = (_t: number, dtMs: number) => {
      const dt = Math.min(dtMs, 64) / 1000
      // Lenis velocity when smooth scrolling is on; raw delta otherwise (touch).
      const y = window.scrollY
      const raw = y - lastY
      lastY = y
      const v = scrollState.velocity || raw
      if (Math.abs(v) > 0.5) dir = (v > 0 ? -1 : 1) * (reverse ? -1 : 1)
      const boost = Math.min(Math.abs(v) * 60, 2400)
      x += dir * (speed + boost) * dt
      if (width > 0) x = gsap.utils.wrap(-width, 0, x)
      setX(x)
      const targetSkew = gsap.utils.clamp(-14, 14, -v * 0.6 * (reverse ? -1 : 1))
      skew += (targetSkew - skew) * Math.min(1, dt * 8)
      setSkew(skew)
    }

    let running = false
    const io = new IntersectionObserver(([entry]) => {
      if (entry.isIntersecting && !running) {
        lastY = window.scrollY
        gsap.ticker.add(tick)
        running = true
      } else if (!entry.isIntersecting && running) {
        gsap.ticker.remove(tick)
        running = false
      }
    })
    io.observe(el)

    return () => {
      io.disconnect()
      ro.disconnect()
      gsap.ticker.remove(tick)
    }
  }, [speed, reverse])

  const segment = (
    <>
      {items.map((item, i) => (
        <span key={i} className={`vm-item${i % 2 ? ' is-outline' : ''}`}>
          {item}
          <span className="vm-sep">
            <svg viewBox="0 0 24 24" width="1em" height="1em">
              <path d="M12 0c.6 6.6 5.4 11.4 12 12-6.6.6-11.4 5.4-12 12-.6-6.6-5.4-11.4-12-12C6.6 11.4 11.4 6.6 12 0z" fill="currentColor" />
            </svg>
          </span>
        </span>
      ))}
    </>
  )

  return (
    <div className="vm" ref={root} aria-hidden="true">
      <div className="vm-track" ref={track}>
        {Array.from({ length: COPIES }, (_, i) => (
          <div key={i} className="vm-seg">
            {segment}
          </div>
        ))}
      </div>
    </div>
  )
}
