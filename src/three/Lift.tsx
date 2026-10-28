import { useMemo, useRef } from 'react'
import { useFrame, type ThreeEvent } from '@react-three/fiber'
import { Group, MeshStandardMaterial, Vector3 } from 'three'
import { DOCK, DOCK_ANGLE, floorBase, getGame, runtime, startRide, finishRide } from '../game/store'
import { useGameValue } from '../game/useGame'
import { input, markInteracted, player, settings } from './store'
import { mat } from './materials'
import { useHoverCursor } from './useHoverCursor'
import type { WorldColors } from './theme'

const POST_H = 5
const CAR_R = 1.3
const ease = (t: number) => (t < 0.5 ? 4 * t * t * t : 1 - Math.pow(-2 * t + 2, 3) / 2)

// Drives the ride (progress, car height) and calls the lift when Jay steps
// on it after clearing the floor.
export function LiftDirector() {
  const onFor = useRef(0)
  useFrame((_, rawDt) => {
    const dt = Math.min(rawDt, 0.05)
    const ride = runtime.ride
    const g = getGame()
    if (ride.active) {
      ride.t = Math.min(1, ride.t + dt / ride.duration)
      const from = floorBase(g.rideFrom)
      const to = floorBase(g.rideTo)
      ride.carY = from + (to - from) * ease(ride.t)
      if (ride.t >= 1) finishRide()
      return
    }
    ride.carY = floorBase(g.floor)
    const d = Math.hypot(player.position.x - DOCK.x, player.position.z - DOCK.z)
    const on = d < 1.05 && Math.abs(player.position.y - floorBase(g.floor)) < 0.6
    runtime.onLift = on
    if (g.status === 'cleared' && on && player.grounded) {
      onFor.current += dt
      if (onFor.current > 0.45) {
        onFor.current = 0
        startRide(settings.reducedMotion)
      }
    } else onFor.current = 0
  })
  return null
}

const outward = (a: number, r: number): [number, number] => [Math.sin(a) * r, Math.cos(a) * r]

// The lift car: a chunky yellow platform with three posts, a halo ring and a
// beacon that lights up once the floor is cleared.
export function LiftCar({ colors }: { colors: WorldColors }) {
  const group = useRef<Group>(null)
  const arrow = useRef<Group>(null)
  const rails = useRef<Group>(null)
  const hover = useHoverCursor()
  const status = useGameValue((s) => s.status)
  const rideFrom = useGameValue((s) => s.rideFrom)
  const rideTo = useGameValue((s) => s.rideTo)
  const beacon = useMemo(() => new MeshStandardMaterial({ color: colors.accent4, roughness: 0.3, emissive: colors.accent4, emissiveIntensity: 0 }), [colors.accent4])
  const ink = colors.dark ? '#2a2620' : '#26221d'
  const ready = status === 'cleared' || status === 'riding'

  // Posts sit on the outer half of the car so Jay can walk on from the island.
  const posts = useMemo(() => [-1.15, 0, 1.15].map((a) => outward(a, CAR_R - 0.12)), [])

  useFrame((state) => {
    const y = runtime.ride.carY
    group.current?.position.set(DOCK.x, y, DOCK.z)
    const t = state.clock.elapsedTime
    beacon.emissiveIntensity = ready ? 1.6 + (settings.reducedMotion ? 0 : Math.sin(t * 5) * 0.6) : 0.05
    beacon.color.set(ready ? colors.accent4 : colors.islandRim)
    if (arrow.current) {
      arrow.current.visible = status === 'cleared'
      arrow.current.position.y = POST_H + 1.1 + (settings.reducedMotion ? 0 : Math.sin(t * 3) * 0.18)
      arrow.current.rotation.y = settings.reducedMotion ? 0 : t * 1.2
    }
    if (rails.current) rails.current.visible = runtime.ride.active
  })

  const onClick = (e: ThreeEvent<MouseEvent>) => {
    e.stopPropagation()
    if (e.delta > 10) return
    markInteracted()
    input.route = []
    input.target = new Vector3(DOCK.x, 0, DOCK.z)
  }

  const from = floorBase(rideFrom)
  const to = floorBase(rideTo)
  const railH = to - from + POST_H

  return (
    <>
      <group ref={group} position={[DOCK.x, runtime.ride.carY, DOCK.z]}>
        <group rotation={[0, DOCK_ANGLE, 0]}>
          <mesh position={[0, -0.06, 0]} castShadow receiveShadow onClick={onClick} {...hover} material={mat(colors.accent3, 0.45)}>
            <cylinderGeometry args={[CAR_R, CAR_R * 0.96, 0.2, 40]} />
          </mesh>
          <mesh position={[0, 0.045, 0]} rotation={[Math.PI / 2, 0, 0]} material={mat(ink, 0.5)}>
            <torusGeometry args={[CAR_R - 0.08, 0.05, 8, 48]} />
          </mesh>
          {/* hazard chevrons on the floor */}
          {[0, 1, 2, 3, 4, 5].map((i) => (
            <mesh key={i} position={[Math.sin((i / 6) * Math.PI * 2) * 0.86, 0.042, Math.cos((i / 6) * Math.PI * 2) * 0.86]} rotation={[-Math.PI / 2, 0, (i / 6) * Math.PI * 2]} material={mat(ink, 0.5)}>
              <circleGeometry args={[0.12, 3]} />
            </mesh>
          ))}
          {posts.map(([x, z], i) => (
            <mesh key={i} position={[x, POST_H / 2, z]} castShadow material={mat(ink, 0.5)}>
              <cylinderGeometry args={[0.075, 0.09, POST_H, 10]} />
            </mesh>
          ))}
          <mesh position={[0, POST_H, 0]} rotation={[Math.PI / 2, 0, 0]} material={mat(colors.accent, 0.45)}>
            <torusGeometry args={[CAR_R - 0.12, 0.09, 10, 48, Math.PI * 1.25]} />
          </mesh>
          <mesh position={[posts[1][0], POST_H + 0.22, posts[1][1]]} material={beacon}>
            <sphereGeometry args={[0.24, 20, 14]} />
          </mesh>
        </group>
        <group ref={arrow} visible={false}>
          <mesh position={[0, 0.2, 0]} material={mat(colors.accent4, 0.4)}>
            <coneGeometry args={[0.42, 0.6, 4]} />
          </mesh>
          <mesh position={[0, -0.32, 0]} material={mat(colors.accent4, 0.4)}>
            <boxGeometry args={[0.24, 0.5, 0.24]} />
          </mesh>
        </group>
      </group>
      {/* guide rails up the shaft, only while riding */}
      <group ref={rails} visible={false} position={[DOCK.x, from + railH / 2, DOCK.z]} rotation={[0, DOCK_ANGLE, 0]}>
        {[posts[0], posts[2]].map(([x, z], i) => (
          <mesh key={i} position={[x * 1.12, 0, z * 1.12]} material={mat(colors.islandRockDark, 0.7)}>
            <cylinderGeometry args={[0.05, 0.05, railH, 6]} />
          </mesh>
        ))}
      </group>
    </>
  )
}
