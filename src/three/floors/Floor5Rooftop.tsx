import { useLayoutEffect, useMemo, useRef } from 'react'
import { useFrame, type ThreeEvent } from '@react-three/fiber'
import { RoundedBox } from '@react-three/drei'
import { CuboidCollider, RigidBody } from '@react-three/rapier'
import { Color, DoubleSide, Group, InstancedMesh, MeshStandardMaterial, Object3D } from 'three'
import { clearFloor, floorBase, getGame, setProgress, shake } from '../../game/store'
import { confettiPop } from '../../game/audio'
import { Island, seeded, type TreeSpec } from '../Island'
import { mat } from '../materials'
import { groups, player, settings } from '../store'
import { useHoverCursor } from '../useHoverCursor'
import type { WorldColors } from '../theme'
import { tint, useNear, walkTo } from './shared'

const FLOOR = 4
const MAIL: [number, number] = [-0.8, -1.0]
const TREES: TreeSpec[] = [
  { p: [-6.4, 0.8], s: 0.8, c: 'accent4' },
  { p: [5.9, -3.2], s: 0.95, c: 'accent4' },
]
const N = 220

type Piece = { x: number; y: number; z: number; vx: number; vy: number; vz: number; rx: number; ry: number; sx: number; sy: number }

function Confetti({ colors, burst, y }: { colors: WorldColors; burst: { current: number }; y: number }) {
  const ref = useRef<InstancedMesh>(null)
  const pieces = useMemo<Piece[]>(() => Array.from({ length: N }, () => ({ x: 0, y: -999, z: 0, vx: 0, vy: 0, vz: 0, rx: 0, ry: 0, sx: 0, sy: 0 })), [])
  const life = useRef(99)
  const seen = useRef(0)
  const o = useMemo(() => new Object3D(), [])
  const material = useMemo(() => new MeshStandardMaterial({ roughness: 0.6, side: DoubleSide }), [])

  useLayoutEffect(() => {
    const m = ref.current
    if (!m) return
    const pal = [colors.accent, colors.accent2, colors.accent3, colors.accent4, colors.dark ? '#ece4d3' : '#ffffff']
    const c = new Color()
    for (let i = 0; i < N; i++) m.setColorAt(i, c.set(pal[i % pal.length]))
    if (m.instanceColor) m.instanceColor.needsUpdate = true
  }, [colors])

  useFrame((_, rawDt) => {
    const m = ref.current
    if (!m) return
    const dt = Math.min(rawDt, 0.05)
    if (burst.current !== seen.current) {
      seen.current = burst.current
      life.current = 0
      const rnd = seeded(burst.current * 977 + 3)
      const calm = settings.reducedMotion ? 0.6 : 1
      pieces.forEach((p) => {
        const a = rnd() * Math.PI * 2
        const s = (2 + rnd() * 5) * calm
        p.x = MAIL[0] + (rnd() - 0.5) * 0.6
        p.y = y + 3.6
        p.z = MAIL[1] + (rnd() - 0.5) * 0.6
        p.vx = Math.cos(a) * s
        p.vz = Math.sin(a) * s
        p.vy = (7 + rnd() * 7) * calm
        p.rx = rnd() * 6
        p.ry = rnd() * 6
        p.sx = (rnd() - 0.5) * 14
        p.sy = (rnd() - 0.5) * 14
      })
    }
    if (life.current > 6) {
      m.visible = false
      return
    }
    m.visible = true
    life.current += dt
    pieces.forEach((p, i) => {
      p.vy -= 9 * dt
      // paper flutter: strong drag, sideways wobble
      const drag = Math.exp(-1.8 * dt)
      p.vx *= drag
      p.vz *= drag
      p.vy = Math.max(p.vy * Math.exp(-0.6 * dt), -2.2)
      p.x += (p.vx + Math.sin(life.current * 4 + i) * 0.5) * dt
      p.y += p.vy * dt
      p.z += p.vz * dt
      if (p.y < y + 0.03) {
        p.y = y + 0.03
        p.vx = p.vz = p.vy = 0
      } else {
        p.rx += p.sx * dt
        p.ry += p.sy * dt
      }
      o.position.set(p.x, p.y, p.z)
      o.rotation.set(p.rx, p.ry, 0)
      const fade = life.current > 5 ? Math.max(0, 1 - (life.current - 5)) : 1
      o.scale.setScalar(fade)
      o.updateMatrix()
      m.setMatrixAt(i, o.matrix)
    })
    m.instanceMatrix.needsUpdate = true
  })

  return (
    <instancedMesh ref={ref} args={[undefined, undefined, N]} material={material} frustumCulled={false} visible={false}>
      <planeGeometry args={[0.16, 0.26]} />
    </instancedMesh>
  )
}

function Balloon({ x, z, y, color, phase }: { x: number; z: number; y: number; color: string; phase: number }) {
  const ref = useRef<Group>(null)
  useFrame((state) => {
    if (!ref.current || settings.reducedMotion) return
    const t = state.clock.elapsedTime + phase
    ref.current.position.y = Math.sin(t * 1.3) * 0.18
    ref.current.rotation.z = Math.sin(t * 0.9) * 0.06
  })
  return (
    <group position={[x, y, z]}>
      <mesh position={[0, 0.12, 0]} material={mat('#3a3128', 0.8)}>
        <cylinderGeometry args={[0.12, 0.16, 0.24, 8]} />
      </mesh>
      <group ref={ref} position={[0, 0, 0]}>
        <mesh position={[0, 2.0, 0]} material={mat('#3a3128', 0.8)}>
          <cylinderGeometry args={[0.012, 0.012, 3.6, 4]} />
        </mesh>
        <mesh position={[0, 4.2, 0]} scale={[1, 1.18, 1]} castShadow material={mat(color, 0.3)}>
          <sphereGeometry args={[0.55, 24, 18]} />
        </mesh>
        <mesh position={[0, 3.56, 0]} material={mat(color, 0.4)}>
          <coneGeometry args={[0.1, 0.16, 8]} />
        </mesh>
      </group>
    </group>
  )
}

function Bunting({ colors, y }: { colors: WorldColors; y: number }) {
  const a: [number, number] = [-5.6, -4.3]
  const b: [number, number] = [4.6, -5.6]
  const flags = useMemo(() => {
    const n = 13
    return Array.from({ length: n }, (_, i) => {
      const t = (i + 0.5) / n
      const sag = Math.sin(t * Math.PI) * 0.9
      return { x: a[0] + (b[0] - a[0]) * t, z: a[1] + (b[1] - a[1]) * t, h: 4.4 - sag, i }
    })
  }, [])
  const pal = [colors.accent, colors.accent3, colors.accent2, colors.accent4]
  const yaw = Math.atan2(-(b[1] - a[1]), b[0] - a[0])
  const ink = colors.dark ? '#2a2620' : '#3a3128'
  return (
    <group>
      {[a, b].map(([x, z], i) => (
        <mesh key={i} position={[x, y + 2.3, z]} castShadow material={mat(ink, 0.8)}>
          <cylinderGeometry args={[0.08, 0.1, 4.6, 8]} />
        </mesh>
      ))}
      {flags.map((f) => (
        <mesh key={f.i} position={[f.x, y + f.h - 0.28, f.z]} rotation={[0, yaw, Math.PI]} material={mat(pal[f.i % pal.length], 0.6, { double: true })}>
          <circleGeometry args={[0.34, 3, Math.PI / 2]} />
        </mesh>
      ))}
    </group>
  )
}

function Mailbox({ colors, y, active }: { colors: WorldColors; y: number; active: boolean }) {
  const flag = useRef<Group>(null)
  const lid = useRef<Group>(null)
  const burst = useRef(0)
  const opened = useRef(-10)
  const env = useRef<Group>(null)
  const envFrom = useRef<[number, number, number]>([0, 0, 0])
  const hover = useHoverCursor()

  useNear(MAIL[0], MAIL[1], 2.3, {
    enabled: active,
    onEnter: () => {
      burst.current += 1
      opened.current = 0
      envFrom.current = [player.position.x, player.position.y + 3, player.position.z]
      confettiPop()
      if (!settings.reducedMotion) shake(0.35)
      if (getGame().status === 'playing') clearFloor()
    },
  })

  useFrame((_, rawDt) => {
    const dt = Math.min(rawDt, 0.05)
    opened.current += dt
    const t = opened.current
    const raised = getGame().status === 'finished'
    if (flag.current) {
      const target = raised ? 0 : -Math.PI / 2
      flag.current.rotation.z += (target - flag.current.rotation.z) * (settings.reducedMotion ? 1 : Math.min(1, dt * 7))
    }
    if (lid.current) lid.current.rotation.x = t >= 0 && t < 1 ? -Math.sin((t / 1) * Math.PI) * 1.1 : 0
    const e = env.current
    if (e) {
      const k = Math.min(1, t / 0.55)
      e.visible = t >= 0 && t < 0.6
      const [fx, fy, fz] = envFrom.current
      const tx = MAIL[0]
      const ty = y + 2.9
      const tz = MAIL[1] + 0.9
      e.position.set(fx + (tx - fx) * k, fy + (ty - fy) * k + Math.sin(k * Math.PI) * 1.2, fz + (tz - fz) * k)
      e.rotation.set(0, 0, k * Math.PI * 2)
    }
  })

  const onClick = (ev: ThreeEvent<MouseEvent>) => {
    ev.stopPropagation()
    if (ev.delta > 10) return
    walkTo(MAIL[0], MAIL[1] + 2.0)
  }

  const red = colors.accent
  const ink = colors.dark ? '#2a2620' : '#3a3128'
  const white = colors.dark ? '#ece4d3' : '#fffaf0'
  return (
    <>
      <RigidBody type="fixed" colliders={false} collisionGroups={groups.ground}>
        <CuboidCollider args={[0.75, 1.9, 1.1]} position={[MAIL[0], y + 1.9, MAIL[1]]} />
      </RigidBody>
      <group position={[MAIL[0], y, MAIL[1]]} onClick={onClick} {...hover}>
        <mesh position={[0, 0.06, 0]} receiveShadow material={mat(colors.islandRockDark, 0.9, { flat: true })}>
          <cylinderGeometry args={[0.6, 0.7, 0.14, 10]} />
        </mesh>
        <RoundedBox args={[0.32, 2.4, 0.32]} radius={0.06} smoothness={2} position={[0, 1.2, 0]} castShadow material={mat(ink, 0.8)} />
        <group position={[0, 2.95, 0]}>
          <RoundedBox args={[1.3, 0.9, 2.0]} radius={0.12} smoothness={3} position={[0, -0.05, 0]} castShadow receiveShadow material={mat(red, 0.45)} />
          <mesh position={[0, 0.4, 0]} rotation={[Math.PI / 2, 0, 0]} castShadow material={mat(red, 0.45)}>
            <cylinderGeometry args={[0.65, 0.65, 2.0, 28, 1, false, -Math.PI / 2, Math.PI]} />
          </mesh>
          {/* door on the camera side, swings open on delivery */}
          <group ref={lid} position={[0, -0.5, 1.02]}>
            <mesh position={[0, 0.62, 0]} material={mat(tint(red, '#000000', 0.15), 0.5)}>
              <boxGeometry args={[1.22, 1.24, 0.06]} />
            </mesh>
            <mesh position={[0, 0.7, 0.06]} material={mat(white, 0.4)}>
              <boxGeometry args={[0.34, 0.08, 0.08]} />
            </mesh>
          </group>
          <group ref={flag} position={[0.68, 0.1, -0.4]} rotation={[0, 0, -Math.PI / 2]}>
            <mesh position={[0, 0.5, 0]} material={mat(colors.accent3, 0.5)}>
              <boxGeometry args={[0.06, 1.0, 0.1]} />
            </mesh>
            <mesh position={[0, 0.88, -0.2]} material={mat(colors.accent3, 0.5)}>
              <boxGeometry args={[0.06, 0.34, 0.46]} />
            </mesh>
          </group>
        </group>
      </group>
      <group ref={env} visible={false}>
        <mesh material={mat(white, 0.6)}>
          <boxGeometry args={[0.7, 0.46, 0.04]} />
        </mesh>
        <mesh position={[0, 0.06, 0.025]} rotation={[0, 0, Math.PI]} material={mat(colors.accent2, 0.6)}>
          <circleGeometry args={[0.26, 3]} />
        </mesh>
      </group>
      <Confetti colors={colors} burst={burst} y={y} />
    </>
  )
}

export function Floor5Rooftop({ colors, active }: { colors: WorldColors; active: boolean }) {
  const y = floorBase(FLOOR)
  useFrame(() => {
    if (!active) return
    const s = getGame().status
    if (s === 'playing') setProgress(0, 1)
  })
  const top = useMemo(() => tint(colors.islandTop, colors.accent3, colors.dark ? 0.06 : 0.12), [colors.islandTop, colors.accent3, colors.dark])
  return (
    <Island colors={colors} y={y} trees={TREES} stones={4} seed={61} ring top={top}>
      <Bunting colors={colors} y={y} />
      <Balloon x={-4.6} z={2.6} y={y} color={colors.accent2} phase={0} />
      <Balloon x={3.6} z={-3.0} y={y} color={colors.accent} phase={1.3} />
      <Balloon x={-3.4} z={-4.6} y={y} color={colors.accent3} phase={2.1} />
      <Balloon x={4.8} z={1.0} y={y} color={colors.accent4} phase={0.7} />
      <Mailbox colors={colors} y={y} active={active} />
    </Island>
  )
}
