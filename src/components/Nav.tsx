import { useEffect, useLayoutEffect, useRef, useState } from 'react'
import { scrollToTarget } from '../lib/motion'
import { ScrambleText } from './ScrambleText'
import { SoundToggle } from './SoundToggle'
import { ThemeToggle } from './ThemeToggle'
import './Nav.css'

const links = [
  { id: 'about', label: 'About' },
  { id: 'experience', label: 'Experience' },
  { id: 'work', label: 'Work' },
  { id: 'skills', label: 'Skills' },
  { id: 'contact', label: 'Contact' },
]

// Which section owns the middle band of the viewport.
function useActiveSection(ids: string[]) {
  const [active, setActive] = useState<string | null>(null)
  useEffect(() => {
    const visible = new Map<string, boolean>()
    const io = new IntersectionObserver(
      (entries) => {
        entries.forEach((e) => visible.set(e.target.id, e.isIntersecting))
        setActive(ids.find((id) => visible.get(id)) ?? null)
      },
      { rootMargin: '-45% 0px -50% 0px' },
    )
    // Sections can mount late (the hero is lazy); retry briefly until all are found.
    const observed = new Set<string>()
    const observe = () => {
      ids.forEach((id) => {
        const el = document.getElementById(id)
        if (el && !observed.has(id)) {
          observed.add(id)
          io.observe(el)
        }
      })
      return observed.size === ids.length
    }
    let timer = 0
    if (!observe()) timer = window.setInterval(() => observe() && window.clearInterval(timer), 400)
    return () => {
      window.clearInterval(timer)
      io.disconnect()
    }
  }, [ids])
  return active
}

const ids = links.map((l) => l.id)

export function Nav() {
  const [scrolled, setScrolled] = useState(false)
  const active = useActiveSection(ids)
  const list = useRef<HTMLUListElement>(null)

  useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > window.innerHeight * 0.6)
    onScroll()
    window.addEventListener('scroll', onScroll, { passive: true })
    return () => window.removeEventListener('scroll', onScroll)
  }, [])

  // Slide a single pill under the current link instead of toggling backgrounds.
  useLayoutEffect(() => {
    const place = () => {
      const ul = list.current
      const a = active ? ul?.querySelector<HTMLElement>(`a[href="#${active}"]`) : null
      if (!ul) return
      ul.classList.toggle('has-active', !!a)
      if (!a) return
      // Drawn by .nav-links::before; a list may only hold <li> children.
      ul.style.setProperty('--pill-x', `${a.offsetLeft}px`)
      ul.style.setProperty('--pill-w', `${a.offsetWidth}px`)
    }
    place()
    window.addEventListener('resize', place)
    document.fonts?.ready.then(place).catch(() => {})
    return () => window.removeEventListener('resize', place)
  }, [active])

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
        <ul className="nav-links" ref={list}>
          {links.map((l) => (
            <li key={l.id}>
              <a
                href={`#${l.id}`}
                className={`mono${active === l.id ? ' is-active' : ''}`}
                aria-current={active === l.id ? 'location' : undefined}
                onClick={(e) => go(e, l.id)}
              >
                <ScrambleText text={l.label} />
              </a>
            </li>
          ))}
        </ul>
      </nav>
      <div className="nav-meta">
        <SoundToggle />
        <ThemeToggle />
      </div>
    </header>
  )
}
