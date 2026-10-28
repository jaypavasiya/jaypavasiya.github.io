import { Suspense, useRef } from 'react'
import { useFrame } from '@react-three/fiber'
import { clearFloor, getGame, setProgress } from '../../game/store'
import { blipUp } from '../../game/audio'
import { Island } from '../Island'
import { Letters } from '../Letters'
import { Playthings } from '../Playthings'
import { bodies, type Resettable } from '../store'
import type { WorldColors } from '../theme'

const LETTERS = 'JAYPAVASIYA'.length

// Floor 1 · Hello: knock over every letter of JAY PAVASIYA. A letter counts
// once it tilts past ~60 degrees or falls off, and stays counted.
function LetterGoal({ active }: { active: boolean }) {
  const down = useRef(new Set<Resettable>())
  useFrame(() => {
    if (!active) return
    const g = getGame()
    let changed = false
    bodies.forEach((r) => {
      if (r.tag !== 'letter' || down.current.has(r)) return
      const q = r.body.rotation()
      // World up of the letter: y component of the rotated Y axis.
      const upY = 1 - 2 * (q.x * q.x + q.z * q.z)
      const p = r.body.translation()
      if (upY < 0.5 || p.y < -2) {
        down.current.add(r)
        changed = true
      }
    })
    // Bodies that were remounted no longer exist in the registry.
    down.current.forEach((r) => {
      if (!bodies.has(r)) down.current.delete(r)
    })
    const n = Math.min(LETTERS, down.current.size)
    if (changed && g.status === 'playing') blipUp(n)
    if (g.status === 'playing') {
      setProgress(n, LETTERS)
      if (n >= LETTERS) clearFloor()
    }
  })
  return null
}

export function Floor1Hello({ colors, active }: { colors: WorldColors; active: boolean }) {
  return (
    <>
      <Island colors={colors} />
      <Playthings colors={colors} />
      <Suspense fallback={null}>
        <Letters colors={colors} />
      </Suspense>
      <LetterGoal active={active} />
    </>
  )
}
