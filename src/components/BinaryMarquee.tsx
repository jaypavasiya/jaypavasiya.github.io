import { useMemo } from 'react'
import './BinaryMarquee.css'

// Rows of drifting binary, a nod to wodniack.dev. Purely decorative.
export function BinaryMarquee({ rows = 3, word = 'JAY' }: { rows?: number; word?: string }) {
  const lines = useMemo(() => {
    const bits = [...word].map((c) => c.charCodeAt(0).toString(2).padStart(8, '0')).join(' ')
    return Array.from({ length: rows }, (_, i) => `${bits} ${shuffle(bits, i)} `.repeat(6))
  }, [rows, word])

  return (
    <div className="binary" aria-hidden="true">
      {lines.map((line, i) => (
        <div key={i} className="binary-row" style={{ animationDuration: `${60 + i * 18}s`, animationDirection: i % 2 ? 'reverse' : 'normal' }}>
          <span>{line}</span>
          <span>{line}</span>
        </div>
      ))}
    </div>
  )
}

function shuffle(bits: string, seed: number) {
  return bits
    .split('')
    .map((b, i) => (b === ' ' ? ' ' : (i * 7 + seed * 13) % 5 === 0 ? (b === '0' ? '1' : '0') : b))
    .join('')
}
