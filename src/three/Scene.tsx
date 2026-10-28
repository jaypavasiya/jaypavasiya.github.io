import { useMemo, useRef } from 'react'
import { useFrame } from '@react-three/fiber'
import { Environment, Lightformer } from '@react-three/drei'
import { Physics } from '@react-three/rapier'
import { DirectionalLight, MathUtils, Object3D, Vector3 } from 'three'
import { scrollState } from '../lib/motion'
import { DOCK, floorBase, getGame, runtime } from '../game/store'
import { Floors } from './Floors'
import { LiftCar, LiftDirector } from './Lift'
import { CAMERA_YAW, Player, PLAYER_HEIGHT } from './Player'
import { bodies, placeBody, player, settings } from './store'
import type { WorldColors } from './theme'

// Camera sits ~27deg above the ground on a fixed yaw. It frames Jay large and
// slightly right of centre (the big name lives bottom-left in the overlay),
// and follows him softly, biased towards the middle of the island.
const screenRight = new Vector3(Math.cos(CAMERA_YAW), 0, -Math.sin(CAMERA_YAW))
const ANCHOR = new Vector3(1.4, 0, 2.2)
// Game floors are wider puzzles: frame more of the island around Jay.
const GAME_ANCHOR = new Vector3(0.6, 0, 0.8)
const camOffset = new Vector3()
const camTarget = new Vector3()
const lookAt = new Vector3()
const desired = new Vector3()
const tmp = new Vector3()
// Dev-only cameras for tuning the avatar: ?cam=close (full body), ?cam=head
// (portrait) and ?cam=side (walk cycle profile).
const DEV_CAM = import.meta.env.DEV && typeof location !== 'undefined' ? (new URLSearchParams(location.search).get('cam') ?? '') : ''

type Framing = { dist: number; follow: number; lift: number; shift: number }

function framing(aspect: number, full: boolean): Framing {
  // Portrait phones: Jay centred, a little below the HUD.
  if (aspect < 0.75) return { dist: 21, follow: 0.9, lift: 0.5, shift: 0 }
  if (aspect < 1.1) return { dist: 16.5, follow: 0.85, lift: 0.6, shift: full ? 0 : 0.5 }
  return { dist: full ? 14 : 13.5, follow: 0.8, lift: 0.7, shift: full ? 0.2 : 1.2 }
}

function CameraRig() {
  const look = useRef(new Vector3(0, 0, 0))
  // Reduced motion: the shot only changes in cuts, when Jay nears the edge.
  const cut = useRef({ target: new Vector3(), floor: -1 })
  useFrame((state, rawDt) => {
    const dt = Math.min(rawDt, 0.05)
    const { width, height } = state.size
    const f = framing(width / height, settings.fullscreen)
    const reduced = settings.reducedMotion
    const ride = runtime.ride
    const g = getGame()
    const groundY = ride.active ? ride.carY : floorBase(g.floor)

    // The lift ride swings the camera round and back for a cinematic beat.
    const e = ride.active ? Math.sin(Math.PI * ride.t) : 0
    const yaw = CAMERA_YAW + e * 0.75
    camOffset.set(Math.sin(yaw), 0.5 - e * 0.22, Math.cos(yaw)).normalize()

    // With reduced motion the camera holds one wider shot per floor.
    const game = g.floor > 0 || ride.active
    const follow = reduced ? 0.5 : game ? f.follow * (width / height < 0.75 ? 0.92 : 0.72) : f.follow
    const zoom = game ? (width / height < 0.75 ? 1.5 : 1.42) : 1
    const dist = (reduced ? f.dist * 1.15 : f.dist) * zoom * (1 + e * 0.3)
    if (ride.active) camTarget.set(DOCK.x * 0.6, 0, DOCK.z * 0.6)
    else {
      camTarget.copy(game ? GAME_ANCHOR : ANCHOR).lerp(tmp.set(player.position.x, 0, player.position.z), follow)
      // Floor cleared: drift towards the lift so it's in shot.
      if (g.status === 'cleared' && !reduced) camTarget.lerp(tmp.set(DOCK.x, 0, DOCK.z), 0.35)
      if (reduced) {
        const c = cut.current
        if (c.floor !== g.floor || c.target.distanceTo(camTarget) > 3.2) {
          c.floor = g.floor
          c.target.copy(camTarget)
        }
        camTarget.copy(c.target)
      }
    }
    lookAt.copy(camTarget).addScaledVector(screenRight, -f.shift * (1 - e))
    lookAt.y = groundY + f.lift + PLAYER_HEIGHT * 0.32
    desired.copy(camOffset).multiplyScalar(dist).add(lookAt)

    if (runtime.shake > 0.001) {
      if (!reduced) {
        const s = runtime.shake * 0.22
        desired.x += (Math.random() - 0.5) * s
        desired.y += (Math.random() - 0.5) * s
      }
      runtime.shake *= Math.exp(-5 * dt)
    }

    if (DEV_CAM) {
      const p = player.position
      const fwd = tmp.set(Math.sin(CAMERA_YAW), 0, Math.cos(CAMERA_YAW))
      if (DEV_CAM === 'head') {
        lookAt.set(p.x, p.y + PLAYER_HEIGHT * 0.875, p.z)
        desired.copy(lookAt).addScaledVector(fwd, PLAYER_HEIGHT * 0.95).add({ x: 0, y: PLAYER_HEIGHT * 0.12, z: 0 })
      } else if (DEV_CAM === 'side') {
        lookAt.set(p.x, p.y + PLAYER_HEIGHT * 0.5, p.z)
        desired.set(p.x + 9, p.y + PLAYER_HEIGHT * 0.55, p.z)
      } else {
        lookAt.set(p.x, p.y + PLAYER_HEIGHT * 0.52, p.z)
        desired.copy(lookAt).addScaledVector(fwd, PLAYER_HEIGHT * 2.1).add({ x: 0, y: PLAYER_HEIGHT * 0.28, z: 0 })
      }
    }
    // Snap on big jumps (play again from the roof, reduced-motion cuts).
    const far = state.camera.position.distanceToSquared(desired) > 30 * 30
    const k = reduced || DEV_CAM || far ? 1 : 1 - Math.exp(-(ride.active ? 4 : 3) * dt)
    state.camera.position.lerp(desired, k)
    look.current.lerp(lookAt, k)
    state.camera.lookAt(look.current)
  })
  return null
}

// Respawns fallen toys and does the Stas-style scroll kick (floor 1 only).
function WorldKeeper() {
  const lastKick = useRef(0)
  useFrame((state) => {
    const t = state.clock.elapsedTime
    bodies.forEach((r) => {
      if (r.loose && r.body.translation().y < r.position[1] - 14) placeBody(r, 7)
    })

    const g = getGame()
    if (g.floor !== 0 || g.status === 'riding') return
    const v = scrollState.velocity
    if (settings.reducedMotion || settings.visibility.current < 0.05 || Math.abs(v) < 1.5) return
    if (t - lastKick.current < 0.14) return
    lastKick.current = t
    const s = MathUtils.clamp(Math.abs(v) / 45, 0, 1)
    const dirSign = Math.sign(v)
    bodies.forEach((r) => {
      if (!r.loose || Math.random() > 0.75) return
      const lv = r.body.linvel()
      if (Math.abs(lv.y) > 0.6) return
      const m = r.body.mass()
      const up = 1.2 + s * 4.6
      r.body.applyImpulse(
        {
          x: (Math.random() - 0.5) * s * 2.4 * m,
          y: up * m,
          z: (Math.random() - 0.5) * s * 1.6 * m - dirSign * s * 0.6 * m,
        },
        true,
      )
      r.body.applyTorqueImpulse(
        { x: (Math.random() - 0.5) * 0.25 * m * s, y: (Math.random() - 0.5) * 0.25 * m * s, z: (Math.random() - 0.5) * 0.25 * m * s },
        true,
      )
    })
  })
  return null
}

// Soft hemisphere fill, one warm shadow-casting key that follows Jay (so its
// shadow map stays tight and crisp around him), and a cool rim from behind
// that separates the black tee and dark hair from the background.
function Lights({ colors }: { colors: WorldColors }) {
  const d = colors.dark
  const key = useRef<DirectionalLight>(null)
  const rim = useRef<DirectionalLight>(null)
  const target = useMemo(() => new Object3D(), [])
  useFrame(() => {
    const p = player.position
    const y = runtime.ride.active ? runtime.ride.carY : floorBase(getGame().floor)
    target.position.set(p.x * 0.6, y, p.z * 0.6)
    target.updateMatrixWorld()
    key.current?.position.set(p.x * 0.6 + 6, y + 14, p.z * 0.6 + 8)
    rim.current?.position.set(p.x - 7, y + 9, p.z - 10)
  })
  return (
    <>
      <hemisphereLight args={[colors.sky, colors.ground, d ? 0.85 : 0.95]} />
      <primitive object={target} />
      <directionalLight
        ref={key}
        castShadow
        target={target}
        intensity={d ? 2.3 : 2.75}
        color={d ? '#ffe2c4' : '#fff0dc'}
        shadow-mapSize={[1024, 1024]}
        shadow-camera-left={-11}
        shadow-camera-right={11}
        shadow-camera-top={11}
        shadow-camera-bottom={-11}
        shadow-camera-near={1}
        shadow-camera-far={40}
        shadow-bias={-0.0005}
        shadow-normalBias={0.025}
        shadow-radius={6}
      />
      <directionalLight ref={rim} target={target} intensity={d ? 1.6 : 1.25} color={d ? '#a9b8ff' : '#e4ecff'} />
      {/* Local light-formers give lenses and plastic toys soft reflections
          without fetching an HDR. */}
      <Environment resolution={64} frames={1} environmentIntensity={d ? 0.32 : 0.42}>
        <Lightformer form="rect" intensity={3} position={[0, 6, 6]} scale={[10, 4, 1]} />
        <Lightformer form="rect" intensity={1.2} position={[-8, 3, -2]} rotation-y={Math.PI / 2} scale={[8, 3, 1]} />
        <Lightformer form="ring" intensity={2} position={[6, 4, -6]} scale={3} />
      </Environment>
    </>
  )
}

export function Scene({ colors, paused }: { colors: WorldColors; paused: boolean }) {
  return (
    <>
      <Lights colors={colors} />
      <CameraRig />
      <Physics gravity={[0, -20, 0]} paused={paused} timeStep={1 / 60}>
        <WorldKeeper />
        <LiftDirector />
        <Floors colors={colors} />
        <LiftCar colors={colors} />
        <Player />
      </Physics>
    </>
  )
}
