import { useMemo, useRef } from 'react'
import { useFrame, type ThreeEvent } from '@react-three/fiber'
import { BallCollider, CuboidCollider, CylinderCollider, RigidBody } from '@react-three/rapier'
import { ConeGeometry, Group, LatheGeometry, Vector2, Vector3 } from 'three'
import { groups, input, ISLAND_RADIUS as R, markInteracted, settings } from './store'
import type { WorldColors } from './theme'

// Seeded noise so the low-poly rock looks the same on every visit.
function seeded(seed: number) {
  let s = seed
  return () => {
    s = (s * 16807) % 2147483647
    return (s - 1) / 2147483646
  }
}

function useTopGeometry() {
  return useMemo(() => {
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
  }, [])
}

function useRockGeometry(radius: number, height: number, seed: number) {
  return useMemo(() => {
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
  }, [radius, height, seed])
}

function Tree({ position, scale = 1, color, trunk }: { position: [number, number, number]; scale?: number; color: string; trunk: string }) {
  return (
    <RigidBody type="fixed" position={position} colliders={false} collisionGroups={groups.ground}>
      <CylinderCollider args={[0.6 * scale, 0.18 * scale]} position={[0, 0.6 * scale, 0]} />
      <BallCollider args={[0.75 * scale]} position={[0, 1.65 * scale, 0]} />
      <group scale={scale}>
        <mesh position={[0, 0.5, 0]} castShadow receiveShadow>
          <cylinderGeometry args={[0.13, 0.19, 1, 7]} />
          <meshStandardMaterial color={trunk} roughness={0.9} flatShading />
        </mesh>
        <mesh position={[0, 1.55, 0]} castShadow receiveShadow>
          <icosahedronGeometry args={[0.8, 0]} />
          <meshStandardMaterial color={color} roughness={0.8} flatShading />
        </mesh>
        <mesh position={[0.25, 2.05, 0.1]} castShadow>
          <icosahedronGeometry args={[0.48, 0]} />
          <meshStandardMaterial color={color} roughness={0.8} flatShading />
        </mesh>
      </group>
    </RigidBody>
  )
}

function Cloud({ position, scale, color, speed }: { position: [number, number, number]; scale: number; color: string; speed: number }) {
  const ref = useRef<Group>(null)
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
        <mesh key={i} position={[x, y, z]}>
          <icosahedronGeometry args={[r, 1]} />
          <meshStandardMaterial color={color} roughness={1} flatShading transparent opacity={0.92} />
        </mesh>
      ))}
    </group>
  )
}

export function Island({ colors }: { colors: WorldColors }) {
  const top = useTopGeometry()
  const rockA = useRockGeometry(R * 0.95, 7, 7)
  const rockB = useRockGeometry(R * 0.55, 11, 23)

  const walls = useMemo(() => {
    const n = 28
    const r = R - 0.2
    const w = ((2 * Math.PI * r) / n) * 0.6
    return Array.from({ length: n }, (_, i) => {
      const a = (i / n) * Math.PI * 2
      return { pos: [Math.sin(a) * r, 1.5, Math.cos(a) * r] as [number, number, number], rot: [0, a, 0] as [number, number, number], w }
    })
  }, [])

  const stones = useMemo(() => {
    const rnd = seeded(91)
    return Array.from({ length: 9 }, (_, i) => {
      const a = rnd() * Math.PI * 2
      const d = 5.6 + rnd() * 2
      return { p: [Math.sin(a) * d, 0.04, Math.cos(a) * d] as [number, number, number], s: 0.18 + rnd() * 0.22, i }
    })
  }, [])

  const onGroundClick = (e: ThreeEvent<MouseEvent>) => {
    if (e.delta > 10) return
    markInteracted()
    input.target = new Vector3(e.point.x, 0, e.point.z)
  }

  return (
    <group>
      <RigidBody type="fixed" colliders={false} collisionGroups={groups.ground}>
        <CylinderCollider args={[0.5, R]} position={[0, -0.5, 0]} friction={0.9} />
      </RigidBody>
      <RigidBody type="fixed" colliders={false} collisionGroups={groups.wall}>
        {walls.map((w, i) => (
          <CuboidCollider key={i} args={[w.w, 1.5, 0.2]} position={w.pos} rotation={w.rot} />
        ))}
      </RigidBody>

      <mesh geometry={top} receiveShadow onClick={onGroundClick}>
        <meshStandardMaterial color={colors.islandTop} roughness={0.95} />
      </mesh>
      {/* soft painted ring around the "stage" */}
      <mesh rotation={[-Math.PI / 2, 0, 0]} position={[0, 0.005, -0.4]} receiveShadow>
        <ringGeometry args={[4.6, 4.75, 72]} />
        <meshStandardMaterial color={colors.islandRim} roughness={1} />
      </mesh>
      <mesh geometry={rockA} position={[0, -0.95 - 3.5, 0]}>
        <meshStandardMaterial color={colors.islandRock} roughness={0.95} flatShading />
      </mesh>
      <mesh geometry={rockB} position={[0.8, -0.95 - 5.5, 0.6]} rotation={[0, 0.7, 0]}>
        <meshStandardMaterial color={colors.islandRockDark} roughness={0.95} flatShading />
      </mesh>
      <mesh position={[0, -0.9, 0]}>
        <cylinderGeometry args={[R - 0.02, R * 0.93, 0.16, 72]} />
        <meshStandardMaterial color={colors.islandRim} roughness={0.95} />
      </mesh>

      {stones.map((s) => (
        <mesh key={s.i} position={s.p} scale={[s.s * 1.4, s.s * 0.5, s.s]} receiveShadow castShadow>
          <icosahedronGeometry args={[1, 0]} />
          <meshStandardMaterial color={colors.islandRim} roughness={1} flatShading />
        </mesh>
      ))}

      <Tree position={[-6.2, 0, -3.6]} scale={1.15} color={colors.accent4} trunk={colors.islandRockDark} />
      <Tree position={[-6.9, 0, -1.4]} scale={0.75} color={colors.accent3} trunk={colors.islandRockDark} />
      <Tree position={[6.4, 0, -3.2]} scale={0.95} color={colors.accent4} trunk={colors.islandRockDark} />

      <Cloud position={[-11, 1.5, -6]} scale={1.3} color={colors.cloud} speed={0.25} />
      <Cloud position={[11.5, 3, -8]} scale={1.6} color={colors.cloud} speed={0.2} />
      <Cloud position={[9, -3.5, 2]} scale={1} color={colors.cloud} speed={0.3} />
      <Cloud position={[-9, -4.5, 3]} scale={1.2} color={colors.cloud} speed={0.22} />
    </group>
  )
}
