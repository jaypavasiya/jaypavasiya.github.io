import { useEffect, useRef, useState, type PointerEvent } from 'react'
import { projects } from '../content/profile'
import { gsap, useGSAP, prefersReducedMotion, SCRAMBLE_CHARS } from '../lib/motion'
import { KineticHeading } from '../components/KineticHeading'
import './Projects.css'

const pad = (n: number) => String(n).padStart(2, '0')

// Deterministic 0/1 string from a project name, so each card's binary is its own.
function binaryOf(seed: string, length: number) {
  let h = 2166136261
  for (const c of seed) h = Math.imul(h ^ c.charCodeAt(0), 16777619)
  let out = ''
  for (let i = 0; i < length; i++) {
    h = Math.imul(h ^ (h >>> 13), 1274126177)
    out += (h >>> 7) & 1 ? '1' : '0'
  }
  return out
}

// No screenshots exist, so every project gets a generated poster instead.
// The pattern is picked by index; colours come from the accent tokens.
function ProjectVisual({ index, name }: { index: number; name: string }) {
  const W = 400
  const H = 260
  const kind = index % 6
  return (
    <svg className={`pv pv-${kind}`} viewBox={`0 0 ${W} ${H}`} preserveAspectRatio="xMidYMid slice" aria-hidden="true">
      <rect className="pv-bg" width={W} height={H} />
      {kind === 0 &&
        Array.from({ length: 22 }, (_, i) => (
          <rect key={i} className="pv-a" x={i * 26 - 120} y={-40} width={10} height={H + 80} transform={`rotate(28 ${i * 26 - 120} 0)`} />
        ))}
      {kind === 1 &&
        Array.from({ length: 10 * 16 }, (_, i) => {
          const col = i % 16
          const row = Math.floor(i / 16)
          const r = 2 + 9 * Math.abs(Math.sin((col + row * 0.7) * 0.45))
          return <circle key={i} className="pv-b" cx={14 + col * 25} cy={14 + row * 26} r={r} />
        })}
      {kind === 2 && (
        <>
          {Array.from({ length: 17 }, (_, i) => (
            <line key={`v${i}`} className="pv-line" x1={i * 25} y1={0} x2={i * 25} y2={H} />
          ))}
          {Array.from({ length: 11 }, (_, i) => (
            <line key={`h${i}`} className="pv-line" x1={0} y1={i * 26} x2={W} y2={i * 26} />
          ))}
          {binaryOf(name, 40).split('').map((b, i) =>
            b === '1' && i % 3 === 0 ? (
              <rect key={`c${i}`} className={i % 2 ? 'pv-a' : 'pv-b'} x={(i % 16) * 25} y={(Math.floor(i / 4) % 10) * 26} width={25} height={26} />
            ) : null,
          )}
        </>
      )}
      {kind === 3 &&
        Array.from({ length: 9 }, (_, row) => (
          <text key={row} className={row === 4 ? 'pv-bin pv-bin-hot' : 'pv-bin'} x={-6} y={30 + row * 28}>
            {binaryOf(`${name}${row}`, 30)}
          </text>
        ))}
      {kind === 4 && (
        <>
          {Array.from({ length: 12 }, (_, i) => (
            <circle key={i} className={i % 3 === 0 ? 'pv-ring pv-ring-hot' : 'pv-ring'} cx={W * 0.62} cy={H * 0.55} r={12 + i * 20} />
          ))}
          <circle className="pv-c" cx={W * 0.62} cy={H * 0.55} r={10} />
        </>
      )}
      {kind === 5 &&
        Array.from({ length: 20 }, (_, i) => {
          const h = 30 + 170 * Math.abs(Math.sin(i * 0.55 + name.length))
          return <rect key={i} className={i % 5 === 2 ? 'pv-a' : 'pv-d'} x={10 + i * 19.5} y={H - h} width={12} height={h} rx={6} />
        })}
    </svg>
  )
}

const canHover = () => typeof window !== 'undefined' && window.matchMedia('(hover: hover) and (pointer: fine)').matches

export function Projects() {
  const ref = useRef<HTMLElement>(null)
  const cardRef = useRef<HTMLDivElement>(null)
  const stripRef = useRef<HTMLDivElement>(null)
  const [active, setActive] = useState(0)
  const mover = useRef<{ x: gsap.QuickToFunc; y: gsap.QuickToFunc; r: gsap.QuickToFunc } | null>(null)
  const visible = useRef(false)
  const lastX = useRef(0)

  useGSAP(
    () => {
      if (!prefersReducedMotion()) {
        gsap.fromTo('.pj-row', { yPercent: 60, opacity: 0 }, {
          yPercent: 0,
          opacity: 1,
          duration: 1.1,
          ease: 'expo.out',
          stagger: 0.09,
          scrollTrigger: { trigger: '.pj-list', start: 'top 82%', once: true },
        })
        gsap.from('.pj-rule', {
          scaleX: 0,
          duration: 1.2,
          ease: 'expo.inOut',
          stagger: 0.09,
          scrollTrigger: { trigger: '.pj-list', start: 'top 82%', once: true },
        })
      }
      const card = cardRef.current
      if (!card || !canHover()) return
      gsap.set(card, { xPercent: 0, yPercent: -50, scale: 0.6, autoAlpha: 0 })
      // Spring lag: the card trails the cursor instead of sticking to it.
      mover.current = {
        x: gsap.quickTo(card, 'x', { duration: 0.6, ease: 'power3.out' }),
        y: gsap.quickTo(card, 'y', { duration: 0.6, ease: 'power3.out' }),
        r: gsap.quickTo(card, 'rotation', { duration: 0.8, ease: 'power3.out' }),
      }
    },
    { scope: ref },
  )

  // Slide the poster strip to the hovered project.
  useEffect(() => {
    if (!stripRef.current) return
    gsap.to(stripRef.current, {
      yPercent: (-100 * active) / projects.length,
      duration: prefersReducedMotion() ? 0 : 0.7,
      ease: 'expo.out',
      overwrite: true,
    })
  }, [active])

  const place = (e: PointerEvent, instant = false) => {
    const m = mover.current
    const card = cardRef.current
    if (!m || !card || e.pointerType !== 'mouse') return
    const w = card.offsetWidth
    // Sit right of the cursor, flipping left near the viewport edge.
    const x = e.clientX + 28 + w > window.innerWidth - 16 ? e.clientX - 28 - w : e.clientX + 28
    const y = Math.min(Math.max(e.clientY, card.offsetHeight / 2 + 16), window.innerHeight - card.offsetHeight / 2 - 16)
    const dx = e.clientX - lastX.current
    lastX.current = e.clientX
    if (instant) {
      gsap.set(card, { x, y })
      m.x(x, x)
      m.y(y, y)
    } else {
      m.x(x)
      m.y(y)
    }
    m.r(gsap.utils.clamp(-6, 6, dx * 0.4))
  }

  const show = (e: PointerEvent) => {
    if (!mover.current || e.pointerType !== 'mouse') return
    if (!visible.current) place(e, true)
    visible.current = true
    gsap.to(cardRef.current, { autoAlpha: 1, scale: 1, duration: 0.5, ease: 'expo.out', overwrite: 'auto' })
  }

  const hide = () => {
    if (!mover.current) return
    visible.current = false
    gsap.to(cardRef.current, { autoAlpha: 0, scale: 0.6, duration: 0.35, ease: 'power3.in', overwrite: 'auto' })
  }

  const enterRow = (i: number, row: HTMLElement) => {
    setActive(i)
    const idx = row.querySelector<HTMLElement>('.pj-index')
    if (idx && !prefersReducedMotion()) {
      gsap.to(idx, { duration: 0.45, scrambleText: { text: `(${pad(i + 1)})`, chars: SCRAMBLE_CHARS, speed: 0.8 }, overwrite: true })
    }
  }

  return (
    <section id="work" className="section pj" ref={ref}>
      <p className="section-label mono">03 · Work</p>
      <div className="pj-head">
        <KineticHeading className="pj-title">Selected work</KineticHeading>
        <p className="pj-count mono" aria-hidden="true">
          ({pad(projects.length)}) on GitHub
        </p>
      </div>

      <ul className="pj-list" onPointerEnter={show} onPointerMove={(e) => place(e)} onPointerLeave={hide}>
        {projects.map((p, i) => (
          <li key={p.href} className="pj-item">
            <a
              className="pj-row"
              href={p.href}
              target="_blank"
              rel="noopener noreferrer"
              onPointerEnter={(e) => enterRow(i, e.currentTarget)}
              onFocus={(e) => enterRow(i, e.currentTarget)}
            >
              <span className="pj-index mono" aria-hidden="true">
                ({pad(i + 1)})
              </span>
              <span className="pj-name">{p.name}</span>
              <span className="pj-meta">
                <span className="pj-tags mono">
                  {p.tags.map((t) => (
                    <span key={t} className="pj-tag">
                      {t}
                    </span>
                  ))}
                </span>
                <span className="pj-year mono">{p.year}</span>
              </span>
              <span className="pj-arrow" aria-hidden="true">
                <svg viewBox="0 0 24 24" width="24" height="24">
                  <path d="M7 17 17 7M8 7h9v9" fill="none" stroke="currentColor" strokeWidth="1.5" />
                </svg>
              </span>
              <span className="pj-blurb">{p.blurb}</span>
              <span className="visually-hidden"> (opens in a new tab)</span>
            </a>
            <span className="pj-rule" aria-hidden="true" />
          </li>
        ))}
      </ul>

      <div className="pj-card" ref={cardRef} aria-hidden="true">
        <div className="pj-card-media">
          <div className="pj-card-strip" ref={stripRef}>
            {projects.map((p, i) => (
              <div key={p.href} className="pj-card-frame">
                <ProjectVisual index={i} name={p.name} />
              </div>
            ))}
          </div>
          <span className="pj-card-index mono">
            {pad(active + 1)} / {pad(projects.length)}
          </span>
        </div>
        <p className="pj-card-blurb">{projects[active]?.blurb}</p>
        <p className="pj-card-cta mono">Open on GitHub ↗</p>
      </div>
    </section>
  )
}
