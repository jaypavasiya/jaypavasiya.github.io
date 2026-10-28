import { useRef } from 'react'
import { profile } from '../content/profile'
import { gsap, SplitText, useGSAP, prefersReducedMotion } from '../lib/motion'
import { KineticHeading } from '../components/KineticHeading'
import { BinaryMarquee } from '../components/BinaryMarquee'
import './About.css'

export function About() {
  const ref = useRef<HTMLElement>(null)

  useGSAP(
    () => {
      if (prefersReducedMotion()) return
      // Words light up as they scroll past, like reading along with a pen.
      const split = SplitText.create('.about-lead', { type: 'words' })
      gsap.fromTo(
        split.words,
        { opacity: 0.14 },
        {
          opacity: 1,
          stagger: 0.08,
          ease: 'none',
          scrollTrigger: { trigger: '.about-lead', start: 'top 80%', end: 'bottom 45%', scrub: true },
        },
      )
      gsap.from('.about-chip', {
        y: 24,
        opacity: 0,
        rotate: () => gsap.utils.random(-8, 8),
        duration: 0.8,
        ease: 'back.out(2)',
        stagger: 0.06,
        scrollTrigger: { trigger: '.about-chips', start: 'top 90%', once: true },
      })
      return () => split.revert()
    },
    { scope: ref },
  )

  return (
    <section id="about" className="section about" ref={ref}>
      <p className="section-label mono">01 · About</p>
      <div className="about-grid">
        <KineticHeading className="about-title" effect="scramble">
          Frontend roots, full-stack reach.
        </KineticHeading>
        <div className="about-body">
          <p className="about-lead">{profile.intro}</p>
          {profile.about.map((p) => (
            <p key={p.slice(0, 16)}>{p}</p>
          ))}
          <p className="mono about-ask">Ask me about</p>
          <ul className="about-chips">
            {profile.askMeAbout.map((t) => (
              <li key={t} className="about-chip">
                {t}
              </li>
            ))}
          </ul>
        </div>
      </div>
      <dl className="about-facts">
        <div>
          <dt className="mono">Based in</dt>
          <dd>{profile.location}</dd>
        </div>
        <div>
          <dt className="mono">Doing</dt>
          <dd>{profile.role}</dd>
        </div>
        <div>
          <dt className="mono">Workflow</dt>
          <dd>{profile.tagline}</dd>
        </div>
      </dl>
      <BinaryMarquee rows={3} word="HELLO" />
    </section>
  )
}
