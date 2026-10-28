import { Suspense, useRef } from 'react'
import { useFrame } from '@react-three/fiber'
import { Environment, Lightformer } from '@react-three/drei'
import { Physics } from '@react-three/rapier'
import { MathUtils, Vector3 } from 'three'
import { scrollState } from '../lib/motion'
import { Island } from './Island'
import { Letters } from './Letters'
import { Playthings } from './Playthings'
import { CAMERA_YAW, Player } from './Player'
import { bodies, placeBody, player, settings } from './store'
import type { WorldColors } from './theme'

const camOffset = new Vector3(Math.sin(CAMERA_YAW), 0.72, Math.cos(CAMERA_YAW)).normalize()
const camTarget = new Vector3()
const lookAt = new Vector3()
const desired = new Vector3()
// Dev-only portrait camera for tuning the avatar: http://localhost:5173/?cam=close
const CLOSE_UP = import.meta.env.DEV && typeof location !== 'undefined' && location.search.includes('cam=close')

// Fixed isometric-ish angle; follows the player softly. With reduced motion
// the camera holds one wide shot and never moves on its own.
function CameraRig() {
  const look = useRef(new Vector3(0, 0, 0))
  useFrame((state, rawDt) => {
    const dt = Math.min(rawDt, 0.05)
    const { width, height } = state.size
    const aspect = width / height
    // Portrait screens need to back off to fit the island.
    const dist = aspect < 0.75 ? 46 : aspect < 1.1 ? 33 : 27
    const follow = settings.reducedMotion ? 0 : aspect < 0.75 ? 0.45 : 0.4
    camTarget.set(player.position.x * follow, 0, player.position.z * follow)
    // Aim below the island centre so it sits in the upper part of the frame
    // and leaves room for the big name in the overlay.
    lookAt.set(camTarget.x, aspect < 0.75 ? -3.4 : -1.6, camTarget.z + (aspect < 0.75 ? 1.2 : 1.2))
    desired.copy(camOffset).multiplyScalar(dist).add(camTarget)
    if (CLOSE_UP) {
      lookAt.copy(player.position).y += 1.5
      desired.set(player.position.x + 1.2, player.position.y + 2.6, player.position.z + 5.5)
    }
    const k = settings.reducedMotion ? 1 : 1 - Math.exp(-3 * dt)
    state.camera.position.lerp(desired, k)
    look.current.lerp(lookAt, k)
    state.camera.lookAt(look.current)
  })
  return null
}

// Respawns fallen toys and does the Stas-style scroll kick.
function WorldKeeper() {
  const lastKick = useRef(0)
  useFrame((state) => {
    const t = state.clock.elapsedTime
    bodies.forEach((r) => {
      if (r.loose && r.body.translation().y < -14) placeBody(r, 7)
    })

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

function Lights({ colors }: { colors: WorldColors }) {
  const d = colors.dark
  return (
    <>
      <hemisphereLight args={[colors.sky, colors.ground, d ? 0.95 : 1.05]} />
      <directionalLight
        castShadow
        position={[7, 13, 8]}
        intensity={d ? 2.2 : 2.7}
        color={d ? '#ffe2c4' : '#fff1de'}
        shadow-mapSize={[1024, 1024]}
        shadow-camera-left={-11}
        shadow-camera-right={11}
        shadow-camera-top={11}
        shadow-camera-bottom={-11}
        shadow-camera-near={1}
        shadow-camera-far={40}
        shadow-bias={-0.0006}
        shadow-normalBias={0.03}
        shadow-radius={5}
      />
      {/* Local light-formers give lenses and plastic toys soft reflections
          without fetching an HDR. */}
      <Environment resolution={64} frames={1} environmentIntensity={d ? 0.3 : 0.4}>
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
        <Island colors={colors} />
        <Player />
        <Playthings colors={colors} />
        <Suspense fallback={null}>
          <Letters colors={colors} />
        </Suspense>
      </Physics>
    </>
  )
}
