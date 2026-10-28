import { useEffect, useMemo, useRef, type ReactNode } from 'react'
import type { ThreeEvent } from '@react-three/fiber'
import { RigidBody, type RapierRigidBody } from '@react-three/rapier'
import { Euler, Quaternion } from 'three'
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
}

// A loose dynamic body: registered for reset/respawn/scroll kicks, and
// clickable for a little shove away from the camera.
export function Toy({ position, rotation = [0, 0, 0], children, punch = 4.5, friction = 0.7, restitution = 0.15 }: Props) {
  const ref = useRef<RapierRigidBody>(null)
  const hover = useHoverCursor()
  const quat = useMemo(() => {
    const q = new Quaternion().setFromEuler(new Euler(...rotation))
    return [q.x, q.y, q.z, q.w] as [number, number, number, number]
  }, [rotation[0], rotation[1], rotation[2]])

  useEffect(() => {
    const b = ref.current
    if (!b) return
    const entry: Resettable = { body: b, position, rotation: quat, loose: true }
    bodies.add(entry)
    return () => {
      bodies.delete(entry)
    }
  }, [position, quat])

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
    >
      <group onClick={onClick} {...hover}>
        {children}
      </group>
    </RigidBody>
  )
}
