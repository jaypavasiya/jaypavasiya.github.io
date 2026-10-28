import { useId, useLayoutEffect, useRef, useState } from 'react'
import { education, experience } from '../content/profile'
import { gsap, Flip, useGSAP, prefersReducedMotion, SCRAMBLE_CHARS } from '../lib/motion'
import { KineticHeading } from '../components/KineticHeading'
import { ScrambleText } from '../components/ScrambleText'
import './Experience.css'

type FlipState = ReturnType<typeof Flip.getState>

export function Experience() {
  const ref = useRef<HTMLElement>(null)
  const listRef = useRef<HTMLUListElement>(null)
  const flipState = useRef<FlipState | null>(null)
  const [open, setOpen] = useState<number | null>(null)
  const uid = useId()

  // Rows rise in with their rule lines drawing across.
  useGSAP(
    () => {
      if (prefersReducedMotion()) return
      gsap.from('.xp-item', {
        y: 40,
        opacity: 0,
        duration: 0.9,
        ease: 'expo.out',
        stagger: 0.08,
        scrollTrigger: { trigger: listRef.current, start: 'top 85%', once: true },
      })
    },
    { scope: ref },
  )

  // Runs after React commits the new open row: animate from the old layout.
  useLayoutEffect(() => {
    const state = flipState.current
    flipState.current = null
    if (!state || !listRef.current) return
    const tl = Flip.from(state, {
      duration: 0.75,
      ease: 'expo.inOut',
      nested: true,
      // Text inside must never stretch, so animate real width/height.
      scale: false,
    })
    const panel = listRef.current.querySelector<HTMLElement>('.xp-panel:not([hidden]) .xp-panel-inner')
    if (panel) gsap.fromTo(panel, { opacity: 0, y: 16 }, { opacity: 1, y: 0, duration: 0.6, delay: 0.25, ease: 'power3.out' })
    return () => {
      tl.progress(1).kill()
    }
  }, [open])

  const toggle = (i: number) => {
    if (listRef.current && !prefersReducedMotion()) {
      const targets = [listRef.current, ...listRef.current.querySelectorAll<HTMLElement>('.xp-item')]
      flipState.current = Flip.getState(targets)
    }
    setOpen((cur) => (cur === i ? null : i))
  }

  const scrambleCompany = (row: HTMLElement, text: string) => {
    const el = row.querySelector<HTMLElement>('.xp-company-text')
    if (!el || prefersReducedMotion()) return
    gsap.to(el, { duration: 0.5, scrambleText: { text, chars: SCRAMBLE_CHARS, speed: 0.8 }, overwrite: true })
  }

  return (
    <section id="experience" className="section xp" ref={ref}>
      <p className="section-label mono">02 · Experience</p>
      <div className="xp-head">
        <KineticHeading className="xp-title">Where I’ve worked.</KineticHeading>
        <p className="xp-hint mono" aria-hidden="true">
          Click a row to open it
        </p>
      </div>

      <ul className="xp-list" ref={listRef}>
        {experience.map((job, i) => {
          const isOpen = open === i
          const btnId = `${uid}-btn-${i}`
          const panelId = `${uid}-panel-${i}`
          return (
            <li key={job.company} className={`xp-item${isOpen ? ' is-open' : ''}`} data-flip-id={`xp-${i}`}>
              <h3 className="xp-heading">
                <button
                  type="button"
                  id={btnId}
                  className="xp-row"
                  aria-expanded={isOpen}
                  aria-controls={panelId}
                  onClick={() => toggle(i)}
                  onPointerEnter={(e) => scrambleCompany(e.currentTarget, job.company)}
                  onFocus={(e) => scrambleCompany(e.currentTarget, job.company)}
                >
                  <span className="xp-index mono" aria-hidden="true">
                    {String(i + 1).padStart(2, '0')}
                  </span>
                  <span className="xp-company">
                    <ScrambleText className="xp-company-text" text={job.company} />
                    {job.pending && <span className="pending-tag">to confirm</span>}
                  </span>
                  <span className="xp-role">{job.role}</span>
                  <span className="xp-period mono">{job.period}</span>
                  <span className="xp-toggle" aria-hidden="true" />
                  <span className="xp-sweep" aria-hidden="true" />
                </button>
              </h3>
              <div id={panelId} role="region" aria-labelledby={btnId} className="xp-panel" hidden={!isOpen}>
                <div className="xp-panel-inner">
                  <p className="xp-summary">{job.summary}</p>
                  <p className="xp-where mono">{job.location}</p>
                </div>
              </div>
            </li>
          )
        })}
      </ul>
      <p className="xp-edu">
        <span className="mono">Education</span>
        {education.degree}, {education.school} · {education.period}
      </p>
    </section>
  )
}
