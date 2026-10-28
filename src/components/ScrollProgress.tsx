import { useEffect, useRef } from 'react'

// Hairline at the very top that fills with the page. Decorative: the
// browser's own scrollbar already conveys position to assistive tech.
export function ScrollProgress() {
  const bar = useRef<HTMLDivElement>(null)

  useEffect(() => {
    let raf = 0
    const update = () => {
      raf = 0
      const max = document.documentElement.scrollHeight - window.innerHeight
      const p = max > 0 ? Math.min(1, Math.max(0, window.scrollY / max)) : 0
      if (bar.current) bar.current.style.transform = `scaleX(${p})`
    }
    const queue = () => {
      if (!raf) raf = requestAnimationFrame(update)
    }
    update()
    window.addEventListener('scroll', queue, { passive: true })
    window.addEventListener('resize', queue)
    return () => {
      cancelAnimationFrame(raf)
      window.removeEventListener('scroll', queue)
      window.removeEventListener('resize', queue)
    }
  }, [])

  return <div className="scroll-progress" ref={bar} aria-hidden="true" />
}
