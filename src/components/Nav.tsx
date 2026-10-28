import { useEffect, useState } from 'react'
import { scrollToTarget } from '../lib/motion'
import { ScrambleText } from './ScrambleText'
import { ThemeToggle } from './ThemeToggle'
import './Nav.css'

const links = [
  { id: 'about', label: 'About' },
  { id: 'experience', label: 'Experience' },
  { id: 'work', label: 'Work' },
  { id: 'skills', label: 'Skills' },
  { id: 'contact', label: 'Contact' },
]

export function Nav() {
  const [time, setTime] = useState(() => istTime())
  const [scrolled, setScrolled] = useState(false)

  useEffect(() => {
    const t = window.setInterval(() => setTime(istTime()), 30_000)
    const onScroll = () => setScrolled(window.scrollY > window.innerHeight * 0.6)
    onScroll()
    window.addEventListener('scroll', onScroll, { passive: true })
    return () => {
      window.clearInterval(t)
      window.removeEventListener('scroll', onScroll)
    }
  }, [])

  const go = (e: React.MouseEvent<HTMLAnchorElement>, id: string) => {
    e.preventDefault()
    scrollToTarget(`#${id}`)
  }

  return (
    <header className={`nav ${scrolled ? 'is-scrolled' : ''}`}>
      <a href="#top" className="nav-mark mono" onClick={(e) => go(e, 'top')} aria-label="Back to the top">
        <span className="nav-dot" aria-hidden="true" />
        Jay Pavasiya
      </a>
      <nav aria-label="Sections">
        <ul className="nav-links">
          {links.map((l) => (
            <li key={l.id}>
              <a href={`#${l.id}`} className="mono" onClick={(e) => go(e, l.id)}>
                <ScrambleText text={l.label} />
              </a>
            </li>
          ))}
        </ul>
      </nav>
      <div className="nav-meta">
        <span className="mono nav-time" title="Local time in Gujarat, India">
          IN {time}
        </span>
        <ThemeToggle />
      </div>
    </header>
  )
}

function istTime() {
  return new Intl.DateTimeFormat('en-GB', { timeZone: 'Asia/Kolkata', hour: '2-digit', minute: '2-digit' }).format(new Date())
}
