import { useRef, type ComponentPropsWithoutRef } from 'react'
import { gsap, prefersReducedMotion } from '../lib/motion'

type Props = ComponentPropsWithoutRef<'span'> & { text: string }

// Text that re-scrambles through binary on hover/focus of its closest
// interactive parent. Drop it inside a link or button.
export function ScrambleText({ text, ...rest }: Props) {
  const ref = useRef<HTMLSpanElement>(null)

  const play = () => {
    if (!ref.current || prefersReducedMotion()) return
    gsap.to(ref.current, { duration: 0.5, scrambleText: { text, chars: '01', speed: 0.8 }, overwrite: true })
  }

  return (
    <span {...rest} ref={ref} onPointerEnter={play} onFocus={play} aria-label={text}>
      {text}
    </span>
  )
}
