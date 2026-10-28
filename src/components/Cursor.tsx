import { useEffect, useRef, useState } from 'react'
import { gsap } from '../lib/motion'
import './Cursor.css'

// Areas that swap the ring for a short label. First match wins.
const LABELS: [selector: string, label: string][] = [
  ['[data-cursor]', ''],
  ['.sk-stage', 'Drag'],
  ['.pj-row', 'Open'],
  ['.hero__canvas', 'Play'],
]
const INTERACTIVE = 'a[href], button, [role="button"], label[for], summary, select, [tabindex]:not([tabindex="-1"]):not(.hero__canvas)'
const TEXT_INPUT =
  'input:not([type="button"]):not([type="submit"]):not([type="reset"]):not([type="checkbox"]):not([type="radio"]):not([type="range"]), textarea, [contenteditable=""], [contenteditable="true"]'

const QUERY = '(hover: hover) and (pointer: fine) and (prefers-reduced-motion: no-preference)'

function useFinePointer() {
  const [ok, setOk] = useState(() => typeof window !== 'undefined' && window.matchMedia(QUERY).matches)
  useEffect(() => {
    const mq = window.matchMedia(QUERY)
    const update = () => setOk(mq.matches)
    mq.addEventListener('change', update)
    return () => mq.removeEventListener('change', update)
  }, [])
  return ok
}

// Ink dot + lagging ring, blended with `difference` so it reads on any
// background. Mouse only; touch and reduced-motion visitors keep the
// native cursor and never mount this.
export function Cursor() {
  const enabled = useFinePointer()
  if (!enabled) return null
  return <CursorInner />
}

function CursorInner() {
  const dot = useRef<HTMLDivElement>(null)
  const ring = useRef<HTMLDivElement>(null)
  const tag = useRef<HTMLDivElement>(null)
  const label = useRef<HTMLSpanElement>(null)

  useEffect(() => {
    const html = document.documentElement
    html.classList.add('has-cursor')
    const d = dot.current!
    const r = ring.current!
    const t = tag.current!
    const dx = gsap.quickTo(d, 'x', { duration: 0.08, ease: 'power3' })
    const dy = gsap.quickTo(d, 'y', { duration: 0.08, ease: 'power3' })
    const rx = gsap.quickTo(r, 'x', { duration: 0.45, ease: 'power3' })
    const ry = gsap.quickTo(r, 'y', { duration: 0.45, ease: 'power3' })
    const tx = gsap.quickTo(t, 'x', { duration: 0.3, ease: 'power3' })
    const ty = gsap.quickTo(t, 'y', { duration: 0.3, ease: 'power3' })

    let visible = false
    let state = ''
    let current = ''

    const setState = (next: string, text: string) => {
      const key = `${next}:${text}`
      if (key === state) return
      state = key
      html.dataset.cursorState = next
      if (next === 'label' && label.current && text !== current) {
        current = text
        label.current.textContent = text
      }
    }

    const classify = (el: Element | null, target: EventTarget | null) => {
      if (!el) return setState('', '')
      if (el.closest(TEXT_INPUT)) return setState('text', '')
      for (const [sel, text] of LABELS) {
        const hit = el.closest<HTMLElement>(sel)
        if (!hit) continue
        // A real control inside a labelled area still wins (e.g. hero buttons).
        const control = el.closest(INTERACTIVE)
        if (control && hit.contains(control) && control !== hit) break
        return setState('label', text || hit.dataset.cursor || '')
      }
      if (el.closest(INTERACTIVE)) return setState('hover', '')
      // three.js meshes flip the canvas to a pointer cursor when clickable.
      if (target instanceof HTMLCanvasElement && target.style.cursor === 'pointer') return setState('hover', '')
      setState('', '')
    }

    const show = (on: boolean) => {
      if (on === visible) return
      visible = on
      html.classList.toggle('cursor-visible', on)
    }

    let px = -1
    let py = -1
    let raf = 0
    // Content slides under a still pointer while scrolling; re-check what's there.
    const onScroll = () => {
      if (!visible || raf) return
      raf = requestAnimationFrame(() => {
        raf = 0
        const el = document.elementFromPoint(px, py)
        classify(el, el)
      })
    }

    const onMove = (e: PointerEvent) => {
      if (e.pointerType !== 'mouse') return show(false)
      px = e.clientX
      py = e.clientY
      dx(e.clientX)
      dy(e.clientY)
      rx(e.clientX)
      ry(e.clientY)
      tx(e.clientX)
      ty(e.clientY)
      if (!visible) {
        gsap.set([d, r, t], { x: e.clientX, y: e.clientY })
        show(true)
      }
      classify(e.target instanceof Element ? e.target : null, e.target)
    }
    const onDown = () => html.classList.add('cursor-down')
    const onUp = () => html.classList.remove('cursor-down')
    const onLeave = (e: MouseEvent) => {
      if (!e.relatedTarget) show(false)
    }
    const onBlur = () => show(false)

    window.addEventListener('pointermove', onMove, { passive: true })
    window.addEventListener('pointerdown', onDown, { passive: true })
    window.addEventListener('pointerup', onUp, { passive: true })
    document.addEventListener('mouseout', onLeave)
    window.addEventListener('blur', onBlur)
    window.addEventListener('scroll', onScroll, { passive: true })
    return () => {
      cancelAnimationFrame(raf)
      window.removeEventListener('scroll', onScroll)
      window.removeEventListener('pointermove', onMove)
      window.removeEventListener('pointerdown', onDown)
      window.removeEventListener('pointerup', onUp)
      document.removeEventListener('mouseout', onLeave)
      window.removeEventListener('blur', onBlur)
      html.classList.remove('has-cursor', 'cursor-visible', 'cursor-down')
      delete html.dataset.cursorState
    }
  }, [])

  return (
    // GSAP owns the outer transforms (position); CSS scales the inner shapes.
    <div className="cursor" aria-hidden="true">
      <div className="cursor-pos cursor-blend" ref={ring}>
        <div className="cursor-ring" />
      </div>
      <div className="cursor-pos cursor-blend" ref={dot}>
        <div className="cursor-dot" />
      </div>
      <div className="cursor-pos" ref={tag}>
        <div className="cursor-tag">
          <span className="cursor-label mono" ref={label} />
        </div>
      </div>
    </div>
  )
}
