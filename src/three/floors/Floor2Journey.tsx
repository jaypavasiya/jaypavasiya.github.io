import { useLayoutEffect, useMemo, useRef, useState } from 'react'
import { useFrame, type ThreeEvent } from '@react-three/fiber'
import { Html } from '@react-three/drei'
import { CatmullRomCurve3, Group, InstancedMesh, Object3D, Vector3 } from 'three'
import { experience } from '../../content/profile'
import { clearFloor, floorBase, getGame, setProgress } from '../../game/store'
import { blipUp } from '../../game/audio'
import { Island, seeded, type TreeSpec } from '../Island'
import { canvasTexture, DISPLAY_FONT, MONO_FONT } from '../labels'
import { mat } from '../materials'
import { CAMERA_YAW } from '../Player'
import { settings } from '../store'
import { useHoverCursor } from '../useHoverCursor'
import type { WorldColors } from '../theme'
import { clampedSign, tint, useNear, walkTo } from './shared'

const signPos = clampedSign(220)

const FLOOR = 1
// Oldest first: where it started to where it is now.
const JOBS = [...experience].reverse()

// The winding path, from the lift dock round to the back of the island.
const PATH: [number, number][] = [
  [7.4, 2.9],
  [3.7, 4.4],
  [0.9, 4.6],
  [-2.9, 3.3],
  [-4.9, 0.1],
  [-2.8, -2.6],
  [0.9, -3.6],
  [4.3, -4.7],
]

const TREES: TreeSpec[] = [
  { p: [5.9, -0.7], s: 1.0, c: 'accent4' },
  { p: [-0.9, 0.6], s: 1.25, c: 'accent3' },
  { p: [-6.4, -3.4], s: 0.85, c: 'accent4' },
  { p: [-6.0, 3.6], s: 0.7, c: 'accent4' },
]

function startYear(period: string) {
  return period.match(/\d{4}/)?.[0] ?? ''
}

type PostSpec = { x: number; z: number; walk: [number, number]; i: number }

function usePosts(): PostSpec[] {
  return useMemo(() => {
    return JOBS.map((_, i) => {
      const [px, pz] = PATH[i + 1]
      const [nx, nz] = PATH[i + 2] ?? PATH[i + 1]
      const [ax, az] = PATH[i]
      // Perpendicular to the path, alternating sides.
      let tx = nx - ax
      let tz = nz - az
      const l = Math.hypot(tx, tz) || 1
      tx /= l
      tz /= l
      const side = i % 2 === 0 ? 1 : -1
      const off = 1.15
      return { x: px - tz * off * side, z: pz + tx * off * side, walk: [px, pz] as [number, number], i }
    })
  }, [])
}

function Stones({ colors, y }: { colors: WorldColors; y: number }) {
  const ref = useRef<InstancedMesh>(null)
  const pts = useMemo(() => {
    const curve = new CatmullRomCurve3(PATH.map(([x, z]) => new Vector3(x, 0, z)), false, 'catmullrom', 0.5)
    const n = Math.round(curve.getLength() / 0.62)
    return curve.getSpacedPoints(n)
  }, [])
  useLayoutEffect(() => {
    const m = ref.current
    if (!m) return
    const o = new Object3D()
    const rnd = seeded(5)
    pts.forEach((p, i) => {
      o.position.set(p.x + (rnd() - 0.5) * 0.18, y + 0.02, p.z + (rnd() - 0.5) * 0.18)
      o.rotation.set(0, rnd() * Math.PI, 0)
      const s = 0.85 + rnd() * 0.3
      o.scale.set(s * 1.15, 1, s)
      o.updateMatrix()
      m.setMatrixAt(i, o.matrix)
    })
    m.instanceMatrix.needsUpdate = true
    m.computeBoundingSphere()
  }, [pts, y])
  return (
    <instancedMesh ref={ref} args={[undefined, undefined, pts.length]} receiveShadow material={mat(colors.islandRim, 0.95, { flat: true })}>
      <cylinderGeometry args={[0.34, 0.38, 0.07, 9]} />
    </instancedMesh>
  )
}

function yearTexture(year: string, n: number, colors: WorldColors, visited: boolean) {
  const bg = visited ? colors.accent4 : colors.paper
  const fg = colors.dark && !visited ? colors.ink : '#0f0e0c'
  return canvasTexture(`year-${year}-${n}-${bg}-${fg}`, 256, 256, (ctx, w, h) => {
    ctx.fillStyle = bg
    ctx.beginPath()
    ctx.arc(w / 2, h / 2, w / 2 - 4, 0, Math.PI * 2)
    ctx.fill()
    ctx.fillStyle = fg
    ctx.textAlign = 'center'
    ctx.textBaseline = 'middle'
    ctx.font = `600 34px ${MONO_FONT}`
    ctx.fillText(`0${n}`, w / 2, h / 2 - 52)
    ctx.font = `700 76px ${DISPLAY_FONT}`
    ctx.fillText(year, w / 2, h / 2 + 18)
  })
}

function Post({ spec, colors, y, visited, active, onVisit }: { spec: PostSpec; colors: WorldColors; y: number; visited: boolean; active: boolean; onVisit: (i: number) => void }) {
  const job = JOBS[spec.i]
  const year = startYear(job.period)
  const flag = useRef<Group>(null)
  const sign = useRef<Group>(null)
  const hover = useHoverCursor()
  const near = useNear(spec.x, spec.z, 2.5, { enabled: active, onEnter: () => onVisit(spec.i) })
  const tex = yearTexture(year, spec.i + 1, colors, visited)
  const ink = colors.dark ? '#2a2620' : '#3a3128'

  useFrame((_, dt) => {
    const f = flag.current
    if (f) {
      const target = visited ? 0 : -Math.PI / 2.2
      f.rotation.z += (target - f.rotation.z) * (settings.reducedMotion ? 1 : Math.min(1, dt * 6))
    }
    const s = sign.current
    if (s) {
      const target = near ? 1 : 0
      const k = settings.reducedMotion ? 1 : Math.min(1, dt * 8)
      s.scale.y += (target * 0.999 + 0.001 - s.scale.y) * k
    }
  })

  const onClick = (e: ThreeEvent<MouseEvent>) => {
    e.stopPropagation()
    if (e.delta > 10) return
    walkTo(spec.walk[0], spec.walk[1])
  }

  return (
    <group position={[spec.x, y, spec.z]}>
      <group onClick={onClick} {...hover}>
        <mesh position={[0, 1.1, 0]} castShadow material={mat(ink, 0.8)}>
          <cylinderGeometry args={[0.08, 0.11, 2.2, 8]} />
        </mesh>
        <mesh position={[0, 0.08, 0]} receiveShadow material={mat(colors.islandRockDark, 0.9, { flat: true })}>
          <cylinderGeometry args={[0.32, 0.4, 0.18, 8]} />
        </mesh>
        <group position={[0, 2.35, 0]} rotation={[-0.25, CAMERA_YAW, 0]}>
          <mesh rotation={[Math.PI / 2, 0, 0]} castShadow material={mat(visited ? colors.accent4 : colors.accent3, 0.5)}>
            <cylinderGeometry args={[0.6, 0.6, 0.12, 32]} />
          </mesh>
          <mesh position={[0, 0, 0.065]} material={mat('#ffffff', 0.6, { map: tex })}>
            <circleGeometry args={[0.55, 32]} />
          </mesh>
        </group>
      </group>
      {/* pennant that swings up when visited */}
      <group ref={flag} position={[0, 1.55, 0]} rotation={[0, CAMERA_YAW, -Math.PI / 2.2]}>
        <mesh position={[0.36, 0, 0]} material={mat(colors.accent, 0.6, { double: true })}>
          <circleGeometry args={[0.34, 3]} />
        </mesh>
      </group>
      <group ref={sign} scale={[1, 0.001, 1]} position={[0, 2.9, 0]}>
        {near && (
          <Html position={[0, 0.8, 0]} zIndexRange={[30, 0]} wrapperClass="game-html" calculatePosition={signPos}>
            <div className="game-sign" role="note">
              <span className="game-sign__no mono">
                Milestone {spec.i + 1}/{JOBS.length} · {year}
              </span>
              <strong className="game-sign__title">{job.company}</strong>
              <span className="game-sign__role">{job.role}</span>
              <span className="game-sign__meta mono">{job.period}</span>
            </div>
          </Html>
        )}
      </group>
    </group>
  )
}

export function Floor2Journey({ colors, active }: { colors: WorldColors; active: boolean }) {
  const y = floorBase(FLOOR)
  const posts = usePosts()
  const [visited, setVisited] = useState<boolean[]>(() => JOBS.map(() => false))
  const count = visited.filter(Boolean).length

  const onVisit = (i: number) => {
    setVisited((v) => {
      if (v[i]) return v
      const next = v.slice()
      next[i] = true
      return next
    })
  }

  useFrame(() => {
    if (!active || getGame().status !== 'playing') return
    setProgress(count, JOBS.length)
    if (count >= JOBS.length) clearFloor()
  })

  const prev = useRef(0)
  useLayoutEffect(() => {
    if (count > prev.current && count < JOBS.length) blipUp(count)
    prev.current = count
  }, [count])

  const top = useMemo(() => tint(colors.islandTop, colors.accent4, colors.dark ? 0.06 : 0.1), [colors.islandTop, colors.accent4, colors.dark])

  return (
    <Island colors={colors} y={y} trees={TREES} stones={6} seed={17} ring={false} top={top}>
      <Stones colors={colors} y={y} />
      {posts.map((p) => (
        <Post key={p.i} spec={p} colors={colors} y={y} visited={visited[p.i]} active={active} onVisit={onVisit} />
      ))}
    </Island>
  )
}
