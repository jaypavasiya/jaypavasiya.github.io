import { CanvasTexture, SRGBColorSpace } from 'three'

// Canvas-drawn text for signs, crates, pins and stamps. Cached by key so
// remounting a floor reuses the same textures.

export const DISPLAY_FONT = '"Space Grotesk Variable", "Space Grotesk", system-ui, sans-serif'
export const MONO_FONT = '"JetBrains Mono Variable", "JetBrains Mono", ui-monospace, monospace'

const cache = new Map<string, CanvasTexture>()

export function canvasTexture(key: string, w: number, h: number, draw: (ctx: CanvasRenderingContext2D, w: number, h: number) => void) {
  const hit = cache.get(key)
  if (hit) return hit
  const c = document.createElement('canvas')
  c.width = w
  c.height = h
  const ctx = c.getContext('2d')!
  draw(ctx, w, h)
  const tex = new CanvasTexture(c)
  tex.colorSpace = SRGBColorSpace
  tex.anisotropy = 4
  cache.set(key, tex)
  return tex
}

export function roundRect(ctx: CanvasRenderingContext2D, x: number, y: number, w: number, h: number, r: number) {
  ctx.beginPath()
  ctx.moveTo(x + r, y)
  ctx.arcTo(x + w, y, x + w, y + h, r)
  ctx.arcTo(x + w, y + h, x, y + h, r)
  ctx.arcTo(x, y + h, x, y, r)
  ctx.arcTo(x, y, x + w, y, r)
  ctx.closePath()
}

/** Fits `text` into `maxW` by shrinking the font, returns the size used. */
export function fitText(ctx: CanvasRenderingContext2D, text: string, maxW: number, size: number, weight: number, family: string) {
  let s = size
  ctx.font = `${weight} ${s}px ${family}`
  while (s > 10 && ctx.measureText(text).width > maxW) {
    s -= 2
    ctx.font = `${weight} ${s}px ${family}`
  }
  return s
}

/** Wraps words into at most `lines` lines that fit `maxW`. */
export function wrapText(ctx: CanvasRenderingContext2D, text: string, maxW: number, lines: number) {
  const words = text.split(' ')
  const out: string[] = []
  let cur = ''
  for (const w of words) {
    const next = cur ? `${cur} ${w}` : w
    if (ctx.measureText(next).width > maxW && cur) {
      out.push(cur)
      cur = w
    } else cur = next
  }
  if (cur) out.push(cur)
  if (out.length > lines) {
    const head = out.slice(0, lines - 1)
    head.push(out.slice(lines - 1).join(' '))
    return head
  }
  return out
}
