import { useEffect, useRef, useState } from 'react'
import { profile } from '../content/profile'
import { gsap, prefersReducedMotion, isTouch, scrollToTarget } from '../lib/motion'
import { ScrambleText } from '../components/ScrambleText'
import { BinaryMarquee } from '../components/BinaryMarquee'
import './Contact.css'

const HEADLINE = "Let's talk"

export function Contact() {
  const titleRef = useRef<HTMLHeadingElement>(null)
  const [copied, setCopied] = useState(false)

  // Each letter's weight swells as the pointer gets close: the variable
  // font's wght axis does the work, so it stays crisp at any size.
  useEffect(() => {
    const title = titleRef.current
    if (!title || prefersReducedMotion() || isTouch()) return
    const chars = [...title.querySelectorAll<HTMLElement>('.contact-char')]
    const setters = chars.map((c) => gsap.quickTo(c, '--w', { duration: 0.5, ease: 'power3.out' }))

    const onMove = (e: PointerEvent) => {
      chars.forEach((c, i) => {
        const r = c.getBoundingClientRect()
        const d = Math.hypot(e.clientX - (r.left + r.width / 2), e.clientY - (r.top + r.height / 2))
        setters[i](gsap.utils.mapRange(0, 380, 700, 300, Math.min(d, 380)))
      })
    }
    const onLeave = () => setters.forEach((s) => s(400))
    window.addEventListener('pointermove', onMove)
    title.addEventListener('pointerleave', onLeave)
    return () => {
      window.removeEventListener('pointermove', onMove)
      title.removeEventListener('pointerleave', onLeave)
    }
  }, [])

  const copy = async () => {
    try {
      await navigator.clipboard.writeText(profile.email)
      setCopied(true)
      window.setTimeout(() => setCopied(false), 2200)
    } catch {
      window.location.href = `mailto:${profile.email}`
    }
  }

  return (
    <section id="contact" className="section contact">
      <p className="section-label mono">05 · Contact</p>
      <h2 className="contact-title" ref={titleRef} aria-label={HEADLINE}>
        {[...HEADLINE].map((ch, i) => (
          <span key={i} className="contact-char" aria-hidden="true">
            {ch === ' ' ? ' ' : ch}
          </span>
        ))}
      </h2>
      <p className="contact-sub">Got a product to build, a team that needs a frontend lead, or just want to talk shop? My inbox is open.</p>

      <div className="contact-actions">
        <a className="contact-email" href={`mailto:${profile.email}`}>
          <ScrambleText text={profile.email} />
          <span aria-hidden="true">↗</span>
        </a>
        <button type="button" className="contact-copy mono" onClick={copy} aria-live="polite">
          {copied ? 'Copied ✓' : 'Copy email'}
        </button>
      </div>

      <ul className="contact-socials">
        {profile.socials.map((s) => (
          <li key={s.label}>
            <a href={s.href} target="_blank" rel="noopener noreferrer" className="mono">
              <ScrambleText text={s.label} />
              <span aria-hidden="true"> ↗</span>
            </a>
          </li>
        ))}
      </ul>

      <footer className="contact-footer">
        <BinaryMarquee rows={2} word="BYE" />
        <div className="contact-footer-row mono">
          <span>© {new Date().getFullYear()} {profile.name}</span>
          <span>Built with React, Three.js, Rapier &amp; GSAP</span>
          <a
            href="#top"
            onClick={(e) => {
              e.preventDefault()
              scrollToTarget('#top')
            }}
          >
            Back to the playground ↑
          </a>
        </div>
      </footer>
    </section>
  )
}
