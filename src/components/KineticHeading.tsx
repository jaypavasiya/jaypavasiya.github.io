import { useRef, type ElementType, type ReactNode } from 'react'
import { gsap, SplitText, useGSAP, prefersReducedMotion } from '../lib/motion'

type Props = {
  as?: ElementType
  children: ReactNode
  className?: string
  // 'rise': chars slide up out of a mask. 'scramble': chars resolve from binary.
  effect?: 'rise' | 'scramble'
  delay?: number
  // Play on mount instead of when scrolled into view (hero only).
  immediate?: boolean
}

// Wodniack-style kinetic heading: split into chars, animate in once.
export function KineticHeading({ as: Tag = 'h2', children, className, effect = 'rise', delay = 0, immediate }: Props) {
  const ref = useRef<HTMLElement>(null)

  useGSAP(
    () => {
      const el = ref.current
      if (!el || prefersReducedMotion()) return
      const split = SplitText.create(el, { type: 'lines,chars', linesClass: 'split-line', aria: 'auto' })
      const trigger = immediate ? undefined : { trigger: el, start: 'top 85%', once: true }

      if (effect === 'scramble') {
        split.chars.forEach((c) => ((c as HTMLElement).dataset.final = c.textContent ?? ''))
        gsap.from(split.chars, { autoAlpha: 0, duration: 0.01, stagger: 0.025, delay, scrollTrigger: trigger })
        split.chars.forEach((c, i) => {
          const final = (c as HTMLElement).dataset.final ?? ''
          if (!final.trim()) return
          gsap.to(c, {
            duration: 0.6,
            delay: delay + i * 0.025,
            scrambleText: { text: final, chars: '01', speed: 0.6 },
            scrollTrigger: trigger,
          })
        })
      } else {
        gsap.from(split.chars, {
          yPercent: 110,
          rotate: 6,
          duration: 0.9,
          ease: 'expo.out',
          stagger: 0.018,
          delay,
          scrollTrigger: trigger,
        })
      }
      return () => split.revert()
    },
    { scope: ref },
  )

  return (
    <Tag ref={ref} className={className}>
      {children}
    </Tag>
  )
}
