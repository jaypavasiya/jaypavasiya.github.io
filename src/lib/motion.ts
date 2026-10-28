import gsap from 'gsap'
import { ScrollTrigger } from 'gsap/ScrollTrigger'
import { SplitText } from 'gsap/SplitText'
import { ScrambleTextPlugin } from 'gsap/ScrambleTextPlugin'
import { Flip } from 'gsap/Flip'
import { useGSAP } from '@gsap/react'
import Lenis from 'lenis'

gsap.registerPlugin(ScrollTrigger, SplitText, ScrambleTextPlugin, Flip, useGSAP)

export { gsap, ScrollTrigger, SplitText, Flip, useGSAP }

export const prefersReducedMotion = () =>
  typeof window !== 'undefined' && window.matchMedia('(prefers-reduced-motion: reduce)').matches

export const isTouch = () => typeof window !== 'undefined' && window.matchMedia('(pointer: coarse)').matches

export const SCRAMBLE_CHARS = '01'

// Shared scroll state so non-DOM code (Matter.js, the 3D scene) can react
// to how fast the visitor is scrolling, Stas Bondar style.
export const scrollState = { velocity: 0, progress: 0 }

let lenis: Lenis | null = null

export function startSmoothScroll() {
  if (lenis || prefersReducedMotion()) return lenis
  lenis = new Lenis({ lerp: 0.1, wheelMultiplier: 1 })
  lenis.on('scroll', (l: Lenis) => {
    scrollState.velocity = l.velocity
    scrollState.progress = l.progress
    ScrollTrigger.update()
  })
  gsap.ticker.add((time) => lenis?.raf(time * 1000))
  gsap.ticker.lagSmoothing(0)
  return lenis
}

export function scrollToTarget(target: string | HTMLElement) {
  if (lenis) lenis.scrollTo(target, { offset: 0, duration: 1.4 })
  else {
    const el = typeof target === 'string' ? document.querySelector(target) : target
    el?.scrollIntoView({ behavior: prefersReducedMotion() ? 'auto' : 'smooth' })
  }
}

export function setScrollLocked(locked: boolean) {
  if (!lenis) return
  if (locked) lenis.stop()
  else lenis.start()
}
