import { useEffect, useState } from 'react'
import { Color } from 'three'

export type WorldColors = {
  dark: boolean
  paper: string
  ink: string
  accent: string
  accent2: string
  accent3: string
  accent4: string
  islandTop: string
  islandRim: string
  islandRock: string
  islandRockDark: string
  cloud: string
  sky: string
  ground: string
}

const FALLBACK = {
  paper: '#ece8df',
  ink: '#0f0e0c',
  accent: '#ff4d1a',
  accent2: '#2d5bff',
  accent3: '#ffc83d',
  accent4: '#1fb57a',
}

function readVar(style: CSSStyleDeclaration, name: string, fallback: string) {
  const v = style.getPropertyValue(name).trim()
  if (!v) return fallback
  try {
    new Color(v)
    return v
  } catch {
    return fallback
  }
}

function mix(a: string, b: string, t: number) {
  return '#' + new Color(a).lerp(new Color(b), t).getHexString()
}

export function readWorldColors(): WorldColors {
  const style = getComputedStyle(document.documentElement)
  const paper = readVar(style, '--paper', FALLBACK.paper)
  const ink = readVar(style, '--ink', FALLBACK.ink)
  const hsl = { h: 0, s: 0, l: 0 }
  new Color(paper).getHSL(hsl)
  const dark = hsl.l < 0.4

  // The island is warm clay in both themes; in dark mode it is a dusk version
  // so it still reads as "paper world" against the ink background.
  const clayTop = dark ? '#4d453a' : '#f3ecdc'
  const clayRim = dark ? '#5c4a39' : '#e0c9a6'
  const rock = dark ? '#6b4c38' : '#d49a6a'
  const rockDark = dark ? '#4a3427' : '#b8774c'

  return {
    dark,
    paper,
    ink,
    accent: readVar(style, '--accent', FALLBACK.accent),
    accent2: readVar(style, '--accent-2', FALLBACK.accent2),
    accent3: readVar(style, '--accent-3', FALLBACK.accent3),
    accent4: readVar(style, '--accent-4', FALLBACK.accent4),
    islandTop: mix(clayTop, paper, dark ? 0.1 : 0.15),
    islandRim: clayRim,
    islandRock: rock,
    islandRockDark: rockDark,
    cloud: dark ? '#3d3932' : '#ffffff',
    sky: dark ? '#8d93b8' : '#fffaf3',
    ground: dark ? '#2b2118' : '#d9c4ab',
  }
}

// Re-reads the design tokens whenever the OS scheme or the site's data-theme
// toggle changes, so the 3D world always matches the page.
export function useWorldColors() {
  const [colors, setColors] = useState<WorldColors>(() => readWorldColors())

  useEffect(() => {
    const update = () => setColors(readWorldColors())
    const mq = window.matchMedia('(prefers-color-scheme: dark)')
    mq.addEventListener('change', update)
    const mo = new MutationObserver(update)
    mo.observe(document.documentElement, { attributes: true, attributeFilter: ['data-theme', 'class', 'style'] })
    return () => {
      mq.removeEventListener('change', update)
      mo.disconnect()
    }
  }, [])

  return colors
}
