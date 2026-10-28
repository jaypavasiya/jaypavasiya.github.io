import type { ComponentType } from 'react'
import { useGameValue } from '../game/useGame'
import type { WorldColors } from './theme'
import { Floor1Hello } from './floors/Floor1Hello'
import { Floor2Journey } from './floors/Floor2Journey'
import { Floor3Work } from './floors/Floor3Work'
import { Floor4Skills } from './floors/Floor4Skills'
import { Floor5Rooftop } from './floors/Floor5Rooftop'

const FLOOR_COMPONENTS: ComponentType<{ colors: WorldColors; active: boolean }>[] = [Floor1Hello, Floor2Journey, Floor3Work, Floor4Skills, Floor5Rooftop]

// Only the active floor is mounted (physics bodies and all); during a lift
// ride the next one joins it, and the old one unmounts on arrival.
export function Floors({ colors }: { colors: WorldColors }) {
  const key = useGameValue((s) => `${s.floor}|${s.status === 'riding' ? 1 : 0}|${s.rideFrom}|${s.rideTo}|${s.epoch}`)
  const [floor, riding, rideFrom, rideTo, epoch] = key.split('|').map(Number)
  const status = riding ? 'riding' : 'playing'
  const mounted = riding ? [rideFrom, rideTo] : [floor]
  return (
    <>
      {mounted.map((i) => {
        const F = FLOOR_COMPONENTS[i]
        return <F key={`${i}-${epoch}`} colors={colors} active={i === floor && status !== 'riding'} />
      })}
    </>
  )
}
