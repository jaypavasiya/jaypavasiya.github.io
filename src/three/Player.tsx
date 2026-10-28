import { useEffect, useRef } from 'react'
import { useFrame, type ThreeEvent } from '@react-three/fiber'
import { CapsuleCollider, RigidBody, useRapier, type RapierRigidBody } from '@react-three/rapier'
import { Group, MathUtils, Vector3 } from 'three'
import { Avatar, type AvatarMotion } from './Avatar'
import { bodies, groups, input, markInteracted, player, type Resettable } from './store'
import { useHoverCursor } from './useHoverCursor'

export const CAMERA_YAW = 0.32
const SPEED = 5
// The avatar is modelled ~1.9 units tall; scale it up so it holds its own
// next to the big letters.
const AVATAR_SCALE = 1.3
const HALF_HEIGHT = 0.55 * AVATAR_SCALE
const RADIUS = 0.36 * AVATAR_SCALE
const FOOT_OFFSET = HALF_HEIGHT + RADIUS
export const PLAYER_SPAWN: [number, number, number] = [0.2, FOOT_OFFSET + 0.05, 4.4]

// Screen-space input -> world direction, relative to the fixed camera yaw.
const fwd = new Vector3(-Math.sin(CAMERA_YAW), 0, -Math.cos(CAMERA_YAW))
const right = new Vector3(Math.cos(CAMERA_YAW), 0, -Math.sin(CAMERA_YAW))
const dir = new Vector3()
const tmp = new Vector3()

export function Player() {
  const body = useRef<RapierRigidBody>(null)
  const visual = useRef<Group>(null)
  const motion = useRef<AvatarMotion>({ speed: 0, yaw: CAMERA_YAW })
  const { world, rapier } = useRapier()
  const hover = useHoverCursor()

  useEffect(() => {
    const b = body.current
    if (!b) return
    const entry: Resettable = { body: b, position: PLAYER_SPAWN, rotation: [0, 0, 0, 1], loose: false }
    bodies.add(entry)
    return () => {
      bodies.delete(entry)
    }
  }, [])

  useFrame((_, rawDt) => {
    const b = body.current
    if (!b) return
    const dt = Math.min(rawDt, 0.05)
    const pos = b.translation()
    player.position.set(pos.x, pos.y - FOOT_OFFSET, pos.z)

    // Fell off somehow: drop back in at spawn.
    if (pos.y < -6) {
      b.setTranslation({ x: PLAYER_SPAWN[0], y: PLAYER_SPAWN[1] + 3, z: PLAYER_SPAWN[2] }, true)
      b.setLinvel({ x: 0, y: 0, z: 0 }, true)
      return
    }

    const k = input.keys
    const ix = (k.right ? 1 : 0) - (k.left ? 1 : 0) + (input.joy.active ? input.joy.x : 0)
    const iy = (k.up ? 1 : 0) - (k.down ? 1 : 0) - (input.joy.active ? input.joy.y : 0)
    dir.set(0, 0, 0)
    let mag = 0
    if (ix !== 0 || iy !== 0) {
      input.target = null
      dir.addScaledVector(fwd, iy).addScaledVector(right, ix)
      mag = Math.min(1, dir.length())
      if (dir.lengthSq() > 0) dir.normalize()
    } else if (input.target) {
      tmp.set(input.target.x - pos.x, 0, input.target.z - pos.z)
      const d = tmp.length()
      if (d < 0.25) input.target = null
      else {
        dir.copy(tmp).divideScalar(d)
        mag = Math.min(1, d / 0.8)
      }
    }

    const v = b.linvel()
    const blend = 1 - Math.exp(-12 * dt)
    const vx = MathUtils.lerp(v.x, dir.x * SPEED * mag, blend)
    const vz = MathUtils.lerp(v.z, dir.z * SPEED * mag, blend)

    let vy = v.y
    if (input.jumpQueued) {
      input.jumpQueued = false
      const ray = new rapier.Ray({ x: pos.x, y: pos.y, z: pos.z }, { x: 0, y: -1, z: 0 })
      const hit = world.castRay(ray, FOOT_OFFSET + 0.15, true, undefined, undefined, undefined, b)
      if (hit) vy = 7
    }
    b.setLinvel({ x: vx, y: vy, z: vz }, true)

    const hSpeed = Math.hypot(vx, vz)
    motion.current.speed = hSpeed / SPEED
    if (hSpeed > 0.4 && visual.current) {
      const targetYaw = Math.atan2(vx, vz)
      let delta = targetYaw - motion.current.yaw
      delta = Math.atan2(Math.sin(delta), Math.cos(delta))
      motion.current.yaw += delta * (1 - Math.exp(-14 * dt))
    }
    if (visual.current) visual.current.rotation.y = motion.current.yaw
  })

  const onClick = (e: ThreeEvent<MouseEvent>) => {
    e.stopPropagation()
    markInteracted()
    input.waveQueued = true
  }

  return (
    <RigidBody
      ref={body}
      colliders={false}
      position={PLAYER_SPAWN}
      enabledRotations={[false, false, false]}
      canSleep={false}
      ccd
      collisionGroups={groups.player}
      userData={{ kind: 'player' }}
    >
      <CapsuleCollider args={[HALF_HEIGHT, RADIUS]} friction={0} density={3} />
      <group ref={visual} position={[0, -FOOT_OFFSET, 0]} scale={AVATAR_SCALE} onClick={onClick} {...hover}>
        <Avatar motion={motion} cameraYaw={CAMERA_YAW} />
      </group>
    </RigidBody>
  )
}
