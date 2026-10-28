import { useEffect, useRef, useState } from 'react'
import { useFrame, type ThreeEvent } from '@react-three/fiber'
import { CapsuleCollider, RigidBody, useRapier, type RapierRigidBody } from '@react-three/rapier'
import { CanvasTexture, Group, MathUtils, Mesh, MeshBasicMaterial, Vector3 } from 'three'
import { Avatar, AVATAR_HEIGHT, type AvatarMotion } from './Avatar'
import { bodies, groups, input, markInteracted, player, type Resettable } from './store'
import { useHoverCursor } from './useHoverCursor'
import { clampWalkable, DOCK, floorBase, floorSpawn, getGame, runtime } from '../game/store'
import { footstep } from '../game/audio'

export const CAMERA_YAW = 0.32
const SPEED = 6.2
const JUMP_VELOCITY = 9
// The avatar is modelled ~1.96 units tall; scaled so Jay stands roughly
// twice the height of the big letters and is clearly the hero of the scene.
export const AVATAR_SCALE = 2.2
export const PLAYER_HEIGHT = AVATAR_HEIGHT * AVATAR_SCALE
const RADIUS = 0.29 * AVATAR_SCALE
const HALF_HEIGHT = PLAYER_HEIGHT / 2 - RADIUS
export const FOOT_OFFSET = HALF_HEIGHT + RADIUS
export const PLAYER_SPAWN: [number, number, number] = [2.0, FOOT_OFFSET + 0.05, 3.9]

function spawnFor(floor: number): [number, number, number] {
  const [x, , z] = floorSpawn(floor)
  return [x, floorBase(floor) + FOOT_OFFSET + 0.05, z]
}

// Soft radial blob under the feet: cheap contact shadow that grounds the
// character even where the shadow map is soft.
function useBlobTexture() {
  const ref = useRef<CanvasTexture | null>(null)
  if (!ref.current) {
    const c = document.createElement('canvas')
    c.width = c.height = 128
    const ctx = c.getContext('2d')!
    const g = ctx.createRadialGradient(64, 64, 0, 64, 64, 64)
    g.addColorStop(0, 'rgba(0,0,0,0.55)')
    g.addColorStop(0.45, 'rgba(0,0,0,0.28)')
    g.addColorStop(1, 'rgba(0,0,0,0)')
    ctx.fillStyle = g
    ctx.fillRect(0, 0, 128, 128)
    ref.current = new CanvasTexture(c)
  }
  return ref.current
}

// Screen-space input -> world direction, relative to the fixed camera yaw.
const fwd = new Vector3(-Math.sin(CAMERA_YAW), 0, -Math.cos(CAMERA_YAW))
const right = new Vector3(Math.cos(CAMERA_YAW), 0, -Math.sin(CAMERA_YAW))
const dir = new Vector3()
const tmp = new Vector3()

export function Player() {
  const body = useRef<RapierRigidBody>(null)
  const visual = useRef<Group>(null)
  const motion = useRef<AvatarMotion>({ speed: 0, yaw: CAMERA_YAW, airborne: false })
  const blob = useRef<Mesh>(null)
  const blobTex = useBlobTexture()
  const { world, rapier } = useRapier()
  const hover = useHoverCursor()
  // Mirrors the avatar's gait clock so footsteps land with the feet.
  const gait = useRef({ g: 0, phase: 0, riding: false, lastTeleport: 0 })
  const spawn = useRef(spawnFor(getGame().floor))
  // Seed the shared position before any floor reads it on the first frame.
  useState(() => player.position.set(spawn.current[0], spawn.current[1] - FOOT_OFFSET, spawn.current[2]))

  useEffect(() => {
    const b = body.current
    if (!b) return
    const entry: Resettable = { body: b, position: spawn.current, rotation: [0, 0, 0, 1], loose: false }
    bodies.add(entry)
    return () => {
      bodies.delete(entry)
    }
  }, [])

  useFrame((_, rawDt) => {
    const b = body.current
    if (!b) return
    const dt = Math.min(rawDt, 0.05)
    const st = gait.current
    const game = getGame()
    const base = floorBase(game.floor)

    // Teleports (restart, skip, play again, lift arrival in reduced motion).
    const tp = runtime.teleport
    if (tp && tp.seq !== st.lastTeleport) {
      st.lastTeleport = tp.seq
      b.setTranslation({ x: tp.x, y: tp.y + FOOT_OFFSET + 0.05, z: tp.z }, true)
      b.setLinvel({ x: 0, y: 0, z: 0 }, true)
      input.target = null
      input.route = []
      if (tp.faceCamera) motion.current.yaw = CAMERA_YAW
    }

    // Lift ride: Jay is carried by the car, physics off, facing the camera.
    const ride = runtime.ride
    if (ride.active) {
      if (!st.riding) {
        st.riding = true
        b.setGravityScale(0, true)
        input.target = null
        input.route = []
      }
      b.setTranslation({ x: DOCK.x, y: ride.carY + FOOT_OFFSET + 0.06, z: DOCK.z }, true)
      b.setLinvel({ x: 0, y: 0, z: 0 }, true)
      player.position.set(DOCK.x, ride.carY + 0.06, DOCK.z)
      player.velocity.set(0, 0, 0)
      player.grounded = true
      motion.current.speed = 0
      motion.current.airborne = false
      let delta = CAMERA_YAW - motion.current.yaw
      delta = Math.atan2(Math.sin(delta), Math.cos(delta))
      motion.current.yaw += delta * (1 - Math.exp(-5 * dt))
      if (visual.current) visual.current.rotation.y = motion.current.yaw
      if (blob.current) {
        blob.current.position.y = -FOOT_OFFSET + 0.02
        ;(blob.current.material as MeshBasicMaterial).opacity = 1
      }
      return
    }
    if (st.riding) {
      st.riding = false
      b.setGravityScale(1, true)
      b.setLinvel({ x: 0, y: 0, z: 0 }, true)
      input.waveQueued = true
    }

    const pos = b.translation()
    player.position.set(pos.x, pos.y - FOOT_OFFSET, pos.z)

    // Fell off somehow: drop back in at this floor's spawn.
    if (pos.y < base - 7) {
      const [sx, sy, sz] = spawnFor(game.floor)
      b.setTranslation({ x: sx, y: sy + 3, z: sz }, true)
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
      input.route = []
      dir.addScaledVector(fwd, iy).addScaledVector(right, ix)
      mag = Math.min(1, dir.length())
      if (dir.lengthSq() > 0) dir.normalize()
    } else if (input.target) {
      tmp.set(input.target.x - pos.x, 0, input.target.z - pos.z)
      const d = tmp.length()
      const last = input.route.length === 0
      if (d < (last ? 0.25 : 0.45)) {
        input.target = input.route.shift() ?? null
      } else {
        dir.copy(tmp).divideScalar(d)
        mag = last ? Math.min(1, d / 0.8) : 1
      }
    }

    const v = b.linvel()
    const blend = 1 - Math.exp(-12 * dt)
    let vx = MathUtils.lerp(v.x, dir.x * SPEED * mag, blend)
    let vz = MathUtils.lerp(v.z, dir.z * SPEED * mag, blend)

    let vy = v.y
    const ray = new rapier.Ray({ x: pos.x, y: pos.y, z: pos.z }, { x: 0, y: -1, z: 0 })
    const hit = world.castRay(ray, 40, true, undefined, undefined, undefined, b)
    const groundDist = hit ? hit.timeOfImpact - FOOT_OFFSET : 40
    const grounded = groundDist < 0.15
    if (input.jumpQueued) {
      input.jumpQueued = false
      if (grounded) vy = JUMP_VELOCITY
    }

    // Invisible fence: keep Jay on the island, the bridge and the dock.
    if (pos.y > base - 1.5) {
      const c = clampWalkable(pos.x, pos.z)
      if (c) {
        const nx = pos.x - c[0]
        const nz = pos.z - c[1]
        const nl = Math.hypot(nx, nz) || 1
        const out = (vx * nx + vz * nz) / nl
        if (out > 0) {
          vx -= (out * nx) / nl
          vz -= (out * nz) / nl
        }
        b.setTranslation({ x: c[0], y: pos.y, z: c[1] }, true)
        if (input.target && Math.hypot(input.target.x - c[0], input.target.z - c[1]) > 0.3 && clampWalkable(input.target.x, input.target.z)) {
          input.target = null
          input.route = []
        }
      }
    }

    b.setLinvel({ x: vx, y: vy, z: vz }, true)
    motion.current.airborne = !grounded && Math.abs(vy) > 1.5
    player.velocity.set(vx, vy, vz)
    player.grounded = grounded

    // Keep the blob shadow on the ground under the feet, fading with height.
    if (blob.current) {
      const gd = Math.max(0, groundDist)
      blob.current.position.y = -FOOT_OFFSET - gd + 0.02
      const kk = 1 / (1 + gd * 0.35)
      blob.current.scale.setScalar(kk)
      ;(blob.current.material as MeshBasicMaterial).opacity = (hit ? 1 : 0) * kk * kk
    }

    const hSpeed = Math.hypot(vx, vz)
    motion.current.speed = hSpeed / SPEED
    if (hSpeed > 0.4 && visual.current) {
      const targetYaw = Math.atan2(vx, vz)
      let delta = targetYaw - motion.current.yaw
      delta = Math.atan2(Math.sin(delta), Math.cos(delta))
      motion.current.yaw += delta * (1 - Math.exp(-14 * dt))
    }
    if (visual.current) visual.current.rotation.y = motion.current.yaw

    // Footsteps: same gait clock as the avatar; a foot lands every half cycle.
    const speed = Math.min(1, motion.current.speed)
    st.g = MathUtils.damp(st.g, speed, 10, dt)
    if (st.g > 0.01) {
      const before = Math.floor(st.phase / Math.PI)
      st.phase += dt * (7 + 6.5 * st.g)
      if (Math.floor(st.phase / Math.PI) !== before && st.g > 0.3 && grounded) footstep(st.g)
    }
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
      position={spawn.current}
      enabledRotations={[false, false, false]}
      canSleep={false}
      ccd
      collisionGroups={groups.player}
      userData={{ kind: 'player' }}
    >
      <CapsuleCollider args={[HALF_HEIGHT, RADIUS]} friction={0} density={1.5} />
      <mesh ref={blob} rotation={[-Math.PI / 2, 0, 0]} position={[0, -FOOT_OFFSET + 0.02, 0]} renderOrder={1}>
        <planeGeometry args={[RADIUS * 4.2, RADIUS * 4.2]} />
        <meshBasicMaterial map={blobTex} transparent depthWrite={false} opacity={1} toneMapped={false} />
      </mesh>
      <group ref={visual} position={[0, -FOOT_OFFSET, 0]} scale={AVATAR_SCALE} onClick={onClick} {...hover}>
        <Avatar motion={motion} cameraYaw={CAMERA_YAW} />
      </group>
    </RigidBody>
  )
}
