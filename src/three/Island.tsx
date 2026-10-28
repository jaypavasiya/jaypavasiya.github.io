import { useMemo, useRef, type ReactNode } from 'react'
import { useFrame, type ThreeEvent } from '@react-three/fiber'
import { BallCollider, CylinderCollider, RigidBody } from '@react-three/rapier'
import { BufferGeometry, ConeGeometry, Group, LatheGeometry, Vector2, Vector3 } from 'three'
import { DOCK, DOCK_RADIUS, ISLAND_R as R } from '../game/store'
import { groups, input, markInteracted, settings } from './store'
import { mat } from './materials'
import type { WorldColors } from './theme'

// Seeded noise so the low-poly rock looks the same on every visit.
export function seeded(seed: number) {
  let s = seed
  return () => {
    s = (s * 16807) % 2147483647
    return (s - 1) / 2147483646
  }
}

// Geometry is shared by every floor (two floors are mounted during a ride).
const geoCache = new Map<string, BufferGeometry>()
function cached<T extends BufferGeometry>(key: string, make: () => T): T {
  let g = geoCache.get(key) as T | undefined
  if (!g) {
    g = make()
    geoCache.set(key, g)
  }
  return g
}

function topGeometry() {
  return cached('top', () => {
    // Profile of a soft clay slab: flat top, rounded lip, slightly tucked side.
    const pts: Vector2[] = [new Vector2(0, 0)]
    const lip = 0.32
    pts.push(new Vector2(R - lip, 0))
    for (let i = 1; i <= 8; i++) {
      const a = (i / 8) * (Math.PI / 2)
      pts.push(new Vector2(R - lip + Math.sin(a) * lip, -lip + Math.cos(a) * lip))
    }
    pts.push(new Vector2(R - 0.02, -0.75))
    pts.push(new Vector2(R - 0.25, -0.95))
    pts.push(new Vector2(0, -0.95))
    // Lathe faces point along (dy, -dx), so walk the profile bottom-up.
    return new LatheGeometry(pts.reverse(), 72)
  })
}

function rockGeometry(radius: number, height: number, seed: number) {
  return cached(`rock-${radius}-${height}-${seed}`, () => {
    const g = new ConeGeometry(radius, height, 11, 4, false)
    g.rotateX(Math.PI)
    const rnd = seeded(seed)
    const pos = g.attributes.position
    const v = new Vector3()
    // Jitter shared vertices consistently by keying on their rounded position.
    const offsets = new Map<string, [number, number, number]>()
    for (let i = 0; i < pos.count; i++) {
      v.fromBufferAttribute(pos, i)
      const key = `${v.x.toFixed(3)},${v.y.toFixed(3)},${v.z.toFixed(3)}`
      let o = offsets.get(key)
      if (!o) {
        const top = v.y > height / 2 - 0.01
        const k = top ? 0 : 0.28
        o = [(rnd() - 0.5) * k * radius * 0.4, top ? 0 : (rnd() - 0.5) * k * 1.4, (rnd() - 0.5) * k * radius * 0.4]
        offsets.set(key, o)
      }
      pos.setXYZ(i, v.x + o[0], v.y + o[1], v.z + o[2])
    }
    g.computeVertexNormals()
    return g.toNonIndexed()
  })
}

export type TreeSpec = { p: [number, number]; s: number; c: 'accent3' | 'accent4' }

export function Tree({ position, scale = 1, color, trunk }: { position: [number, number, number]; scale?: number; color: string; trunk: string }) {
  return (
    <RigidBody type="fixed" position={position} colliders={false} collisionGroups={groups.ground}>
      <CylinderCollider args={[0.6 * scale, 0.18 * scale]} position={[0, 0.6 * scale, 0]} />
      <BallCollider args={[0.75 * scale]} position={[0, 1.65 * scale, 0]} />
      <group scale={scale}>
        <mesh position={[0, 0.5, 0]} castShadow receiveShadow material={mat(trunk, 0.9, { flat: true })}>
          <cylinderGeometry args={[0.13, 0.19, 1, 7]} />
        </mesh>
        <mesh position={[0, 1.55, 0]} castShadow receiveShadow material={mat(color, 0.8, { flat: true })}>
          <icosahedronGeometry args={[0.8, 0]} />
        </mesh>
        <mesh position={[0.25, 2.05, 0.1]} castShadow material={mat(color, 0.8, { flat: true })}>
          <icosahedronGeometry args={[0.48, 0]} />
        </mesh>
      </group>
    </RigidBody>
  )
}

function Cloud({ position, scale, color, speed }: { position: [number, number, number]; scale: number; color: string; speed: number }) {
  const ref = useRef<Group>(null)
  const m = mat(color, 1, { flat: true, opacity: 0.92 })
  useFrame((state) => {
    if (!ref.current || settings.reducedMotion) return
    const t = state.clock.elapsedTime * speed
    ref.current.position.x = position[0] + Math.sin(t) * 0.6
    ref.current.position.y = position[1] + Math.sin(t * 1.3) * 0.15
  })
  return (
    <group ref={ref} position={position} scale={scale}>
      {[
        [0, 0, 0, 0.7],
        [0.7, -0.1, 0.1, 0.5],
        [-0.65, -0.15, 0, 0.45],
        [0.25, 0.3, -0.1, 0.5],
      ].map(([x, y, z, r], i) => (
        <mesh key={i} position={[x, y, z]} scale={r} material={m}>
          <icosahedronGeometry args={[1, 1]} />
        </mesh>
      ))}
    </group>
  )
}

export const FLOOR1_TREES: TreeSpec[] = [
  { p: [-6.2, -3.6], s: 1.15, c: 'accent4' },
  { p: [-6.9, -1.4], s: 0.75, c: 'accent3' },
  { p: [6.4, -3.2], s: 0.95, c: 'accent4' },
]

type Props = {
  colors: WorldColors
  y?: number
  trees?: TreeSpec[]
  stones?: number
  seed?: number
  ring?: boolean
  // Tint for the island top, to give each floor its own mood.
  top?: string
  children?: ReactNode
}

export function Island({ colors, y = 0, trees = FLOOR1_TREES, stones: stoneCount = 9, seed = 91, ring = true, top: topColor, children }: Props) {
  const top = topGeometry()
  const rockA = rockGeometry(R * 0.95, 7, 7)
  const rockB = rockGeometry(R * 0.55, 11, 23)
  const dockRock = rockGeometry(DOCK_RADIUS * 0.9, 3.2, 41)

  const stones = useMemo(() => {
    const rnd = seeded(seed)
    return Array.from({ length: stoneCount }, (_, i) => {
      const a = rnd() * Math.PI * 2
      const d = 5.6 + rnd() * 2
      return { p: [Math.sin(a) * d, y + 0.04, Math.cos(a) * d] as [number, number, number], s: 0.18 + rnd() * 0.22, i }
    })
  }, [seed, stoneCount, y])

  const onGroundClick = (e: ThreeEvent<MouseEvent>) => {
    if (e.delta > 10) return
    markInteracted()
    input.route = []
    input.target = new Vector3(e.point.x, 0, e.point.z)
  }

  const rim = mat(colors.islandRim, 0.95)
  return (
    <group>
      <RigidBody type="fixed" colliders={false} collisionGroups={groups.ground}>
        <CylinderCollider args={[0.5, R]} position={[0, y - 0.5, 0]} friction={0.9} />
        <CylinderCollider args={[0.25, DOCK_RADIUS]} position={[DOCK.x, y - 0.25, DOCK.z]} friction={0.9} />
      </RigidBody>

      <mesh geometry={top} position={[0, y, 0]} receiveShadow onClick={onGroundClick} material={mat(topColor ?? colors.islandTop, 0.95)} />
      {ring && (
        <mesh rotation={[-Math.PI / 2, 0, 0]} position={[0, y + 0.005, -0.4]} receiveShadow material={rim}>
          <ringGeometry args={[4.6, 4.75, 72]} />
        </mesh>
      )}
      <mesh geometry={rockA} position={[0, y - 0.95 - 3.5, 0]} material={mat(colors.islandRock, 0.95, { flat: true })} />
      <mesh geometry={rockB} position={[0.8, y - 0.95 - 5.5, 0.6]} rotation={[0, 0.7, 0]} material={mat(colors.islandRockDark, 0.95, { flat: true })} />
      <mesh position={[0, y - 0.9, 0]} material={rim}>
        <cylinderGeometry args={[R - 0.02, R * 0.93, 0.16, 72]} />
      </mesh>

      {/* the lift dock: a little stone landing jutting out on the right */}
      <mesh position={[DOCK.x, y - 0.2, DOCK.z]} receiveShadow onClick={onGroundClick} material={rim}>
        <cylinderGeometry args={[DOCK_RADIUS, DOCK_RADIUS * 0.92, 0.4, 40]} />
      </mesh>
      <mesh geometry={dockRock} position={[DOCK.x, y - 0.4 - 1.6, DOCK.z]} material={mat(colors.islandRock, 0.95, { flat: true })} />

      {stones.map((s) => (
        <mesh key={s.i} position={s.p} scale={[s.s * 1.4, s.s * 0.5, s.s]} receiveShadow castShadow material={mat(colors.islandRim, 1, { flat: true })}>
          <icosahedronGeometry args={[1, 0]} />
        </mesh>
      ))}

      {trees.map((t, i) => (
        <Tree key={i} position={[t.p[0], y, t.p[1]]} scale={t.s} color={colors[t.c]} trunk={colors.islandRockDark} />
      ))}

      <Cloud position={[-11, y + 1.5, -6]} scale={1.3} color={colors.cloud} speed={0.25} />
      <Cloud position={[11.5, y + 3, -8]} scale={1.6} color={colors.cloud} speed={0.2} />
      <Cloud position={[-9, y - 4.5, 3]} scale={1.2} color={colors.cloud} speed={0.22} />
      {children}
    </group>
  )
}
