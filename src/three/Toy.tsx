import { useEffect, useMemo, useRef, type ReactNode } from 'react'
import type { ThreeEvent } from '@react-three/fiber'
import { RigidBody, type ContactForcePayload, type RapierRigidBody } from '@react-three/rapier'
import { Euler, Quaternion } from 'three'
import { isSoundOn } from '../lib/sound'
import { thud } from '../game/audio'
import { bodies, groups, markInteracted, type Resettable } from './store'
import { useHoverCursor } from './useHoverCursor'

type Props = {
  position: [number, number, number]
  rotation?: [number, number, number]
  children: ReactNode
  friction?: number
  restitution?: number
  // Strength of the click impulse, in m/s of velocity change.
  punch?: number
  tag?: string
  // Lower pitch for heavy things.
  pitch?: number
}

// Impact detection from Rapier contact-force events: resting contacts report
// roughly m*g every step, so only a rising edge well above that is a hit.
const HIT = 95
export function useImpactSound(body: { current: RapierRigidBody | null }, pitch = 1, play: (v: number, pitch: number) => void = thud) {
  const last = useRef(0)
  return (p: ContactForcePayload) => {
    const b = body.current
    if (!b || !isSoundOn()) return
    const a = p.totalForceMagnitude / Math.max(0.05, b.mass())
    const prev = last.current
    last.current = a
    if (a > HIT && prev < HIT * 0.6) play(Math.min(1, (a - HIT) / 900), pitch)
  }
}

// A loose dynamic body: registered for reset/respawn/scroll kicks, and
// clickable for a little shove away from the camera.
export function Toy({ position, rotation = [0, 0, 0], children, punch = 4.5, friction = 0.7, restitution = 0.15, tag, pitch = 1 }: Props) {
  const ref = useRef<RapierRigidBody>(null)
  const hover = useHoverCursor()
  const onImpact = useImpactSound(ref, pitch)
  const quat = useMemo(() => {
    const q = new Quaternion().setFromEuler(new Euler(...rotation))
    return [q.x, q.y, q.z, q.w] as [number, number, number, number]
  }, [rotation[0], rotation[1], rotation[2]])

  useEffect(() => {
    const b = ref.current
    if (!b) return
    const entry: Resettable = { body: b, position, rotation: quat, loose: true, tag }
    bodies.add(entry)
    return () => {
      bodies.delete(entry)
    }
  }, [position, quat, tag])

  const onClick = (e: ThreeEvent<MouseEvent>) => {
    e.stopPropagation()
    if (e.delta > 10) return
    const b = ref.current
    if (!b) return
    markInteracted()
    const m = b.mass()
    const d = e.ray.direction
    const h = Math.hypot(d.x, d.z) || 1
    b.applyImpulseAtPoint(
      { x: (d.x / h) * punch * m, y: punch * 0.75 * m, z: (d.z / h) * punch * m },
      { x: e.point.x, y: e.point.y, z: e.point.z },
      true,
    )
  }

  return (
    <RigidBody
      ref={ref}
      position={position}
      rotation={rotation}
      colliders={false}
      friction={friction}
      restitution={restitution}
      collisionGroups={groups.prop}
      angularDamping={0.15}
      linearDamping={0.05}
      onContactForce={onImpact}
    >
      <group onClick={onClick} {...hover}>
        {children}
      </group>
    </RigidBody>
  )
}
