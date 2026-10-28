import { useLayoutEffect, useMemo, useRef, useState } from 'react'
import { useFrame, type ThreeEvent } from '@react-three/fiber'
import { Html, RoundedBox } from '@react-three/drei'
import { CuboidCollider, RigidBody, useRapier, type RapierRigidBody } from '@react-three/rapier'
import { Group, MeshStandardMaterial } from 'three'
import { companyWork, projects, type CompanyProject } from '../../content/profile'
import { clearFloor, floorBase, getGame, setProgress, shake } from '../../game/store'
import { blipUp, vaultThunk } from '../../game/audio'
import { Island, type TreeSpec } from '../Island'
import { canvasTexture, DISPLAY_FONT, fitText, MONO_FONT, roundRect, wrapText } from '../labels'
import { mat } from '../materials'
import { groups, player, settings } from '../store'
import { useImpactSound } from '../Toy'
import { useHoverCursor } from '../useHoverCursor'
import type { WorldColors } from '../theme'
import { clampedSign, tint, useNear, walkTo } from './shared'

const signPos = clampedSign(300)

const FLOOR = 2
const TREES: TreeSpec[] = [
  { p: [-6.7, 1.6], s: 0.8, c: 'accent4' },
  { p: [6.3, -3.0], s: 0.9, c: 'accent3' },
]

const VAULTS = [
  { x: -3.0, z: -5.0, color: 'accent2' as const },
  { x: 2.7, z: -5.0, color: 'accent4' as const },
]
const CRATES = [
  { start: [-4.2, 1.5], pad: [-4.2, -1.9], color: 'accent' as const },
  { start: [-0.6, 1.5], pad: [-0.6, -1.9], color: 'accent2' as const },
  { start: [3.0, 1.5], pad: [3.0, -1.9], color: 'accent3' as const },
]
const CRATE = 1.2

function plateTexture(text: string, colors: WorldColors) {
  return canvasTexture(`plate-${text}-${colors.paper}`, 512, 128, (ctx, w, h) => {
    ctx.fillStyle = '#f6f1e6'
    roundRect(ctx, 4, 4, w - 8, h - 8, 26)
    ctx.fill()
    ctx.lineWidth = 6
    ctx.strokeStyle = '#0f0e0c'
    ctx.stroke()
    ctx.fillStyle = '#0f0e0c'
    ctx.textAlign = 'center'
    ctx.textBaseline = 'middle'
    fitText(ctx, text.toUpperCase(), w - 70, 66, 700, DISPLAY_FONT)
    ctx.fillText(text.toUpperCase(), w / 2, h / 2 + 4)
  })
}

function stampTexture(colors: WorldColors) {
  return canvasTexture(`stamp-${colors.accent}`, 512, 160, (ctx, w, h) => {
    ctx.fillStyle = 'rgba(246,241,230,0.94)'
    ctx.fillRect(0, 18, w, h - 36)
    ctx.strokeStyle = colors.accent
    ctx.lineWidth = 8
    roundRect(ctx, 22, 30, w - 44, h - 60, 12)
    ctx.stroke()
    ctx.fillStyle = colors.accent
    ctx.textAlign = 'center'
    ctx.textBaseline = 'middle'
    ctx.font = `800 46px ${MONO_FONT}`
    ctx.fillText('CONFIDENTIAL · NDA', w / 2, h / 2 + 2)
  })
}

function crateTexture(name: string, color: string) {
  return canvasTexture(`crate-${name}-${color}`, 512, 512, (ctx, w, h) => {
    ctx.fillStyle = '#f6f1e6'
    roundRect(ctx, 20, 20, w - 40, h - 40, 36)
    ctx.fill()
    ctx.fillStyle = color
    roundRect(ctx, 20, 20, w - 40, 92, 36)
    ctx.fill()
    ctx.fillRect(20, 76, w - 40, 36)
    ctx.fillStyle = '#0f0e0c'
    ctx.textAlign = 'center'
    ctx.textBaseline = 'middle'
    ctx.font = `700 38px ${MONO_FONT}`
    ctx.fillText('PROJECT', w / 2, 68)
    ctx.font = `700 64px ${DISPLAY_FONT}`
    const lines = wrapText(ctx, name, w - 90, 3)
    const size = lines.length > 2 ? 54 : 64
    ctx.font = `700 ${size}px ${DISPLAY_FONT}`
    const lh = size * 1.12
    const y0 = 300 - ((lines.length - 1) * lh) / 2
    lines.forEach((l, i) => ctx.fillText(l, w / 2, y0 + i * lh))
  })
}

function Vault({ work, x, z, y, color, colors, active }: { work: CompanyProject; x: number; z: number; y: number; color: string; colors: WorldColors; active: boolean }) {
  const door = useRef<Group>(null)
  const wheel = useRef<Group>(null)
  const jiggle = useRef(-10)
  const hover = useHoverCursor()
  const near = useNear(x, z + 2.3, 1.9, {
    enabled: active,
    onEnter: () => {
      vaultThunk()
      jiggle.current = 0
      if (!settings.reducedMotion) shake(0.25)
    },
  })
  const plate = plateTexture(work.product, colors)
  const stamp = stampTexture(colors)
  const steel = colors.dark ? '#8f897d' : '#cfc8bb'

  useFrame((_, dt) => {
    jiggle.current += dt
    const t = jiggle.current
    const k = settings.reducedMotion ? 0 : Math.max(0, 1 - t / 0.7)
    if (door.current) door.current.position.x = Math.sin(t * 60) * 0.03 * k
    if (wheel.current) wheel.current.rotation.z = Math.sin(t * 22) * 0.35 * k
  })

  const onClick = (e: ThreeEvent<MouseEvent>) => {
    e.stopPropagation()
    if (e.delta > 10) return
    walkTo(x, z + 2.2)
  }

  const bolts = useMemo(() => Array.from({ length: 10 }, (_, i) => (i / 10) * Math.PI * 2), [])

  return (
    <>
    <RigidBody type="fixed" colliders={false} collisionGroups={groups.ground}>
      <CuboidCollider args={[1.7, 1.9, 0.6]} position={[x, y + 1.9, z]} />
    </RigidBody>
    <group position={[x, y, z]}>
      <group onClick={onClick} {...hover}>
        <RoundedBox args={[3.4, 3.8, 1.2]} radius={0.22} smoothness={3} position={[0, 1.9, 0]} castShadow receiveShadow material={mat(colors.islandRim, 0.85)} />
        <mesh position={[0, 1.7, 0.62]} rotation={[Math.PI / 2, 0, 0]} material={mat(colors.islandRockDark, 0.8)}>
          <cylinderGeometry args={[1.38, 1.38, 0.1, 40]} />
        </mesh>
        <group ref={door} position={[0, 1.7, 0.7]}>
          <mesh rotation={[Math.PI / 2, 0, 0]} castShadow material={mat(color, 0.4, { metalness: 0.15 })}>
            <cylinderGeometry args={[1.24, 1.24, 0.24, 40]} />
          </mesh>
          {bolts.map((a, i) => (
            <mesh key={i} position={[Math.cos(a) * 1.04, Math.sin(a) * 1.04, 0.13]} material={mat(steel, 0.35, { metalness: 0.6 })}>
              <sphereGeometry args={[0.07, 10, 8]} />
            </mesh>
          ))}
          <group ref={wheel} position={[0, 0, 0.2]}>
            <mesh material={mat(steel, 0.3, { metalness: 0.6 })}>
              <torusGeometry args={[0.52, 0.065, 10, 32]} />
            </mesh>
            {[0, 1, 2].map((i) => (
              <mesh key={i} rotation={[0, 0, (i / 3) * Math.PI]} material={mat(steel, 0.3, { metalness: 0.6 })}>
                <boxGeometry args={[1.08, 0.08, 0.08]} />
              </mesh>
            ))}
            <mesh material={mat(steel, 0.3, { metalness: 0.6 })}>
              <sphereGeometry args={[0.14, 14, 10]} />
            </mesh>
          </group>
          <mesh position={[0, -0.62, 0.135]} rotation={[0, 0, -0.16]} material={mat('#ffffff', 0.7, { map: stamp, transparent: true })}>
            <planeGeometry args={[2.0, 0.62]} />
          </mesh>
        </group>
        <mesh position={[0, 3.45, 0.61]} material={mat('#ffffff', 0.7, { map: plate })}>
          <planeGeometry args={[2.6, 0.65]} />
        </mesh>
      </group>
      {near && (
        <Html position={[0, 4.4, 0.6]} zIndexRange={[30, 0]} wrapperClass="game-html" calculatePosition={signPos}>
          <div className="game-sign game-sign--vault" role="note">
            <span className="game-sign__stamp mono">Confidential · NDA</span>
            <strong className="game-sign__title">{work.product}</strong>
            <span className="game-sign__meta mono">
              {work.company} · {work.period}
            </span>
            <span className="game-sign__body">{work.pitch}</span>
            <span className="game-sign__meta mono">Locked. The details stay inside.</span>
          </div>
        </Html>
      )}
    </group>
    </>
  )
}

function Pad({ x, z, y, color, done }: { x: number; z: number; y: number; color: string; done: boolean }) {
  const glow = useMemo(() => new MeshStandardMaterial({ color, emissive: color, emissiveIntensity: 0.5, roughness: 0.5, transparent: true, opacity: 0.85 }), [color])
  useFrame((state) => {
    const t = state.clock.elapsedTime
    glow.emissiveIntensity = done ? 0.9 : 0.35 + (settings.reducedMotion ? 0.2 : (Math.sin(t * 3) * 0.5 + 0.5) * 0.5)
  })
  return (
    <group position={[x, y, z]}>
      <mesh rotation={[-Math.PI / 2, 0, 0]} position={[0, 0.02, 0]} material={glow} receiveShadow>
        <circleGeometry args={[0.98, 40]} />
      </mesh>
      <mesh rotation={[-Math.PI / 2, 0, 0]} position={[0, 0.03, 0]} material={mat(color, 0.5)}>
        <ringGeometry args={[0.98, 1.12, 40]} />
      </mesh>
    </group>
  )
}

function Crate({ i, y, colors, onLock }: { i: number; y: number; colors: WorldColors; onLock: (i: number) => void }) {
  const spec = CRATES[i]
  const color = colors[spec.color]
  const body = useRef<RapierRigidBody>(null)
  const locked = useRef(false)
  const { rapier } = useRapier()
  const hover = useHoverCursor()
  const onImpact = useImpactSound(body, 0.75)
  const label = crateTexture(projects[i]?.name ?? 'Project', color)
  const start: [number, number, number] = [spec.start[0], y + CRATE / 2 + 0.02, spec.start[1]]
  const wood = tint(colors.islandRock, '#f6f1e6', 0.35)

  useFrame((_, rawDt) => {
    const b = body.current
    if (!b) return
    const dt = Math.min(rawDt, 0.05)
    const p = b.translation()
    const [px, pz] = spec.pad
    const dx = px - p.x
    const dz = pz - p.z
    const d = Math.hypot(dx, dz)
    if (locked.current) {
      // Glide to the pad centre.
      const k = Math.min(1, dt * 10)
      b.setNextKinematicTranslation({ x: p.x + dx * k, y: y + CRATE / 2 + 0.02, z: p.z + dz * k })
      return
    }
    if (p.y < y - 10) {
      b.setTranslation({ x: start[0], y: start[1] + 4, z: start[2] }, true)
      b.setLinvel({ x: 0, y: 0, z: 0 }, true)
      return
    }
    // Gentle magnet near the pad so pushes don't need to be pixel-perfect.
    if (d < 1.8 && d > 0.02) {
      const lv = b.linvel()
      const pull = 2.2 * dt
      b.setLinvel({ x: lv.x + (dx / d) * pull * 3, y: lv.y, z: lv.z + (dz / d) * pull * 3 }, true)
    }
    const lv = b.linvel()
    if (d < 0.6 && Math.hypot(lv.x, lv.z) < 2.5 && Math.abs(p.y - (y + CRATE / 2)) < 0.4) {
      locked.current = true
      b.setBodyType(rapier.RigidBodyType.KinematicPositionBased, true)
      onLock(i)
    }
  })

  const onClick = (e: ThreeEvent<MouseEvent>) => {
    e.stopPropagation()
    if (e.delta > 10 || locked.current) return
    const b = body.current
    if (!b) return
    const c = b.translation()
    const [px, pz] = spec.pad
    let nx = px - c.x
    let nz = pz - c.z
    const l = Math.hypot(nx, nz) || 1
    nx /= l
    nz /= l
    const behind: [number, number] = [c.x - nx * 1.6, c.z - nz * 1.6]
    const push: [number, number] = [px - nx * 1.1, pz - nz * 1.1]
    const via: [number, number][] = []
    // Jay is on the wrong side: walk round the crate first.
    const jx = player.position.x - c.x
    const jz = player.position.z - c.z
    if (jx * nx + jz * nz > -0.4) {
      const side = jx * -nz + jz * nx > 0 ? 1 : -1
      via.push([c.x - nz * 1.8 * side, c.z + nx * 1.8 * side])
    }
    via.push(behind)
    walkTo(push[0], push[1], via)
  }

  return (
    <RigidBody
      ref={body}
      position={start}
      colliders={false}
      enabledRotations={[false, false, false]}
      linearDamping={2.2}
      friction={0.35}
      collisionGroups={groups.prop}
      onContactForce={onImpact}
      ccd
    >
      <CuboidCollider args={[CRATE / 2, CRATE / 2, CRATE / 2]} density={0.35} />
      <group onClick={onClick} {...hover}>
        <RoundedBox args={[CRATE, CRATE, CRATE]} radius={0.1} smoothness={3} castShadow receiveShadow material={mat(wood, 0.8)} />
        {[-1, 1].map((s) => (
          <mesh key={s} position={[0, s * 0.38, 0]} material={mat(color, 0.55)}>
            <boxGeometry args={[CRATE + 0.02, 0.12, CRATE + 0.02]} />
          </mesh>
        ))}
        <mesh position={[0, 0, CRATE / 2 + 0.012]} material={mat('#ffffff', 0.7, { map: label })}>
          <planeGeometry args={[0.96, 0.96]} />
        </mesh>
        <mesh position={[0, CRATE / 2 + 0.012, 0]} rotation={[-Math.PI / 2, 0, 0]} material={mat('#ffffff', 0.7, { map: label })}>
          <planeGeometry args={[0.96, 0.96]} />
        </mesh>
      </group>
    </RigidBody>
  )
}

export function Floor3Work({ colors, active }: { colors: WorldColors; active: boolean }) {
  const y = floorBase(FLOOR)
  const [done, setDone] = useState<boolean[]>(() => CRATES.map(() => false))
  const count = done.filter(Boolean).length

  const onLock = (i: number) => {
    setDone((d) => {
      if (d[i]) return d
      const next = d.slice()
      next[i] = true
      return next
    })
  }

  const prev = useRef(0)
  useLayoutEffect(() => {
    if (count > prev.current && count < CRATES.length) blipUp(count)
    prev.current = count
  }, [count])

  useFrame(() => {
    if (!active || getGame().status !== 'playing') return
    setProgress(count, CRATES.length)
    if (count >= CRATES.length) clearFloor()
  })

  const top = useMemo(() => tint(colors.islandTop, colors.accent2, colors.dark ? 0 : 0.06), [colors.islandTop, colors.accent2, colors.dark])

  return (
    <Island colors={colors} y={y} trees={TREES} stones={5} seed={33} ring={false} top={top}>
      {VAULTS.map((v, i) => (
        <Vault key={i} work={companyWork[i]} x={v.x} z={v.z} y={y} color={colors[v.color]} colors={colors} active={active} />
      ))}
      {CRATES.map((c, i) => (
        <Pad key={i} x={c.pad[0]} z={c.pad[1]} y={y} color={colors[c.color]} done={done[i]} />
      ))}
      {CRATES.map((_, i) => (
        <Crate key={i} i={i} y={y} colors={colors} onLock={onLock} />
      ))}
    </Island>
  )
}
