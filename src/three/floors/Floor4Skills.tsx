import { useEffect, useMemo, useRef, useState } from 'react'
import { useFrame, type ThreeEvent } from '@react-three/fiber'
import { Html, RoundedBox } from '@react-three/drei'
import { BallCollider, CapsuleCollider, CuboidCollider, RigidBody, type CollisionEnterPayload, type RapierRigidBody } from '@react-three/rapier'
import { Group, LatheGeometry, Vector2 } from 'three'
import { skills } from '../../content/profile'
import { clearFloor, floorBase, getGame, setProgress, shake } from '../../game/store'
import { blipUp, pinCrash, thud } from '../../game/audio'
import { Island, type TreeSpec } from '../Island'
import { canvasTexture, DISPLAY_FONT, fitText, roundRect } from '../labels'
import { mat } from '../materials'
import { groups, input, markInteracted, player, settings } from '../store'
import { useImpactSound } from '../Toy'
import { useHoverCursor } from '../useHoverCursor'
import type { WorldColors } from '../theme'
import { tint } from './shared'

const FLOOR = 3
const TARGET = 7
const ROLLS = 3
const LX = -1.4
const S = 1.35
const PIN_H = 1.28 * S
const PIN_R = 0.2 * S
const BALL_R = 0.55
const SPOT: [number, number] = [LX, 3.1]
const HEAD_Z = -2.2
const ROW = 0.8 * 0.866
const TREES: TreeSpec[] = [
  { p: [5.7, -3.0], s: 1.0, c: 'accent4' },
  { p: [-6.5, 1.4], s: 0.8, c: 'accent3' },
  { p: [3.9, -5.6], s: 0.7, c: 'accent4' },
]

// Ten skills from the profile, one per pin.
const WANT = ['React', 'TypeScript', 'Next.js', 'Redux', 'Three.js', 'GSAP', 'Node.js', 'Python', 'WebSockets', 'Vite']
const ALL = [...skills.frontend, ...skills.backend, ...skills.tools]
const PIN_SKILLS = [...WANT.filter((s) => ALL.includes(s)), ...ALL.filter((s) => !WANT.includes(s))].slice(0, 10)

const RACK: [number, number][] = []
for (let r = 0; r < 4; r++) for (let c = 0; c <= r; c++) RACK.push([LX + (c - r / 2) * 0.8, HEAD_Z - r * ROW])

let pinGeo: LatheGeometry | null = null
function pinGeometry() {
  if (pinGeo) return pinGeo
  const prof: [number, number][] = [
    [0, 0],
    [0.11, 0],
    [0.17, 0.06],
    [0.225, 0.22],
    [0.24, 0.4],
    [0.215, 0.56],
    [0.15, 0.7],
    [0.098, 0.82],
    [0.1, 0.9],
    [0.124, 1.02],
    [0.115, 1.13],
    [0.08, 1.22],
    [0.03, 1.27],
    [0, 1.28],
  ]
  pinGeo = new LatheGeometry(
    prof.map(([r, y]) => new Vector2(r * S, (y - 0.64) * S)),
    28,
  )
  return pinGeo
}

function bandTexture(text: string, ink: string) {
  return canvasTexture(`band-${text}-${ink}`, 1024, 96, (ctx, w, h) => {
    ctx.clearRect(0, 0, w, h)
    ctx.fillStyle = ink
    ctx.textAlign = 'center'
    ctx.textBaseline = 'middle'
    const size = fitText(ctx, text, w * 0.4, 64, 700, DISPLAY_FONT)
    ctx.font = `700 ${size}px ${DISPLAY_FONT}`
    // Twice round the pin, centred where the camera looks.
    for (const cx of [0.05, 0.55, 1.05]) ctx.fillText(text, cx * w, h / 2 + 3)
  })
}

function signTexture() {
  return canvasTexture('skills-sign', 512, 128, (ctx, w, h) => {
    ctx.fillStyle = '#f6f1e6'
    roundRect(ctx, 4, 4, w - 8, h - 8, 30)
    ctx.fill()
    ctx.lineWidth = 6
    ctx.strokeStyle = '#0f0e0c'
    ctx.stroke()
    ctx.fillStyle = '#0f0e0c'
    ctx.textAlign = 'center'
    ctx.textBaseline = 'middle'
    ctx.font = `700 64px ${DISPLAY_FONT}`
    ctx.fillText('SKILL BOWL', w / 2, h / 2 + 4)
  })
}

type PinHandle = { body: RapierRigidBody | null; down: boolean; group: Group | null }

function Pin({ i, y, colors, handle }: { i: number; y: number; colors: WorldColors; handle: PinHandle }) {
  const ref = useRef<RapierRigidBody>(null)
  const group = useRef<Group>(null)
  const onImpact = useImpactSound(ref, 1, (v) => pinCrash(v))
  const [x, z] = RACK[i]
  const white = colors.dark ? '#ece4d3' : '#fffaf0'
  const band = bandTexture(PIN_SKILLS[i] ?? '', '#0f0e0c')
  useEffect(() => {
    handle.body = ref.current
    handle.group = group.current
  })
  return (
    <RigidBody
      ref={ref}
      position={[x, y + PIN_H / 2 + 0.01, z]}
      colliders={false}
      collisionGroups={groups.prop}
      angularDamping={0.3}
      friction={0.5}
      restitution={0.2}
      onContactForce={onImpact}
    >
      <CapsuleCollider args={[PIN_H / 2 - PIN_R, PIN_R]} density={0.45} />
      <group ref={group}>
        <mesh geometry={pinGeometry()} castShadow receiveShadow material={mat(white, 0.3)} />
        <mesh position={[0, 0.12 * S, 0]} material={mat(colors.accent, 0.4)}>
          <cylinderGeometry args={[0.1 * S + 0.012, 0.1 * S + 0.012, 0.05, 20, 1, true]} />
        </mesh>
        <mesh position={[0, 0.2 * S, 0]} material={mat(colors.accent, 0.4)}>
          <cylinderGeometry args={[0.1 * S + 0.012, 0.1 * S + 0.012, 0.05, 20, 1, true]} />
        </mesh>
        <mesh position={[0, -0.22 * S, 0]} material={mat('#ffffff', 0.5, { map: band, transparent: true })}>
          <cylinderGeometry args={[0.24 * S + 0.006, 0.236 * S + 0.006, 0.17, 32, 1, true]} />
        </mesh>
      </group>
    </RigidBody>
  )
}

type Phase = 'ready' | 'rolling' | 'settling' | 'reset'

export function Floor4Skills({ colors, active }: { colors: WorldColors; active: boolean }) {
  const y = floorBase(FLOOR)
  const ball = useRef<RapierRigidBody>(null)
  const pins = useMemo<PinHandle[]>(() => RACK.map(() => ({ body: null, down: false, group: null })), [])
  const game = useRef({ phase: 'ready' as Phase, t: 0, rolls: 0, down: 0 })
  const [pops, setPops] = useState<{ i: number; id: number }[]>([])
  const popId = useRef(0)
  const hover = useHoverCursor()
  const onBallImpact = useImpactSound(ball, 0.6)

  const report = () => {
    const g = game.current
    const roll = Math.min(ROLLS, g.rolls + (g.phase === 'ready' ? 1 : 0))
    setProgress(Math.min(TARGET, g.down), TARGET, `Roll ${Math.max(1, roll)}/${ROLLS}`)
  }

  const resetBall = () => {
    const b = ball.current
    if (!b) return
    b.setTranslation({ x: SPOT[0], y: y + BALL_R + 0.05, z: SPOT[1] }, true)
    b.setLinvel({ x: 0, y: 0, z: 0 }, true)
    b.setAngvel({ x: 0, y: 0, z: 0 }, true)
  }

  const rack = () => {
    pins.forEach((p, i) => {
      const b = p.body
      if (!b) return
      p.down = false
      b.setEnabled(true)
      b.setTranslation({ x: RACK[i][0], y: y + PIN_H / 2 + 0.01, z: RACK[i][1] }, true)
      b.setRotation({ x: 0, y: 0, z: 0, w: 1 }, true)
      b.setLinvel({ x: 0, y: 0, z: 0 }, true)
      b.setAngvel({ x: 0, y: 0, z: 0 }, true)
      if (p.group) p.group.visible = true
    })
  }

  const evaluate = () => {
    const g = game.current
    const fresh: number[] = []
    pins.forEach((p, i) => {
      const b = p.body
      if (!b || p.down) return
      const q = b.rotation()
      const upY = 1 - 2 * (q.x * q.x + q.z * q.z)
      const t = b.translation()
      const moved = Math.hypot(t.x - RACK[i][0], t.z - RACK[i][1])
      if (upY < 0.72 || moved > 0.5 || t.y < y - 1) {
        p.down = true
        fresh.push(i)
        // Sweep it off the deck.
        b.setEnabled(false)
        if (p.group) p.group.visible = false
      }
    })
    g.down += fresh.length
    if (fresh.length) {
      const base = popId.current
      popId.current += fresh.length
      setPops((ps) => [...ps, ...fresh.map((i, k) => ({ i, id: base + k }))])
      if (g.down < TARGET) blipUp(g.down)
    }
    if (g.down >= TARGET) {
      if (!settings.reducedMotion) shake(0.5)
      report()
      if (getGame().status === 'playing') clearFloor()
      g.phase = 'ready'
      resetBall()
      return
    }
    if (g.rolls >= ROLLS) {
      g.phase = 'reset'
      g.t = 0
    } else {
      g.phase = 'ready'
      resetBall()
    }
    report()
  }

  useFrame((_, rawDt) => {
    const dt = Math.min(rawDt, 0.05)
    const b = ball.current
    if (!b || !active) return
    const g = game.current
    const p = b.translation()
    const v = b.linvel()
    const speed = Math.hypot(v.x, v.z)
    g.t += dt
    if (p.y < y - 6 && g.phase !== 'rolling') resetBall()
    const cleared = getGame().status !== 'playing'

    if (g.phase === 'ready') {
      if (cleared) return
      if (p.z < SPOT[1] - 1.6 || (speed > 3 && v.z < -1.5 && p.z < SPOT[1] - 0.3)) {
        g.phase = 'rolling'
        g.t = 0
        g.rolls += 1
        report()
      }
    } else if (g.phase === 'rolling') {
      const done = p.z < HEAD_Z - 2.8 || p.y < y - 3 || (g.t > 1.4 && speed < 0.3) || g.t > 7
      if (done) {
        g.phase = 'settling'
        g.t = 0
      }
    } else if (g.phase === 'settling') {
      if (g.t > 1.3) evaluate()
    } else if (g.phase === 'reset') {
      if (g.t > 1.2) {
        g.rolls = 0
        g.down = 0
        rack()
        resetBall()
        g.phase = 'ready'
        report()
      }
    }
  })

  useEffect(() => {
    if (active) report()
  }, [active])

  const launch = (e: ThreeEvent<MouseEvent>) => {
    e.stopPropagation()
    if (e.delta > 10) return
    markInteracted()
    const b = ball.current
    if (!b || game.current.phase !== 'ready' || getGame().status !== 'playing') return
    const p = b.translation()
    const aim = (Math.random() - 0.5) * 0.35
    const dx = LX + aim - p.x
    const dz = HEAD_Z - p.z
    const l = Math.hypot(dx, dz) || 1
    b.setLinvel({ x: (dx / l) * 11.5, y: 0.3, z: (dz / l) * 11.5 }, true)
    input.waveQueued = true
    thud(0.5, 0.6)
  }

  // Jay's kick: nudge the push towards the head pin so it's forgiving.
  const onBallHit = (e: CollisionEnterPayload) => {
    if ((e.other.rigidBodyObject?.userData as { kind?: string } | undefined)?.kind !== 'player') return
    const b = ball.current
    if (!b || game.current.phase !== 'ready') return
    const pv = player.velocity
    const sp = Math.hypot(pv.x, pv.z)
    if (sp < 1.5) return
    const p = b.translation()
    let dx = LX - p.x
    let dz = HEAD_Z - p.z
    const l = Math.hypot(dx, dz) || 1
    dx = (dx / l) * 0.65 + (pv.x / sp) * 0.35
    dz = (dz / l) * 0.65 + (pv.z / sp) * 0.35
    if (dz > -0.2) return
    const k = Math.hypot(dx, dz) || 1
    const kick = 7 + sp * 0.8
    b.setLinvel({ x: (dx / k) * kick, y: 0.4, z: (dz / k) * kick }, true)
    thud(0.6, 0.6)
  }

  const wood = tint(colors.accent3, colors.islandTop, colors.dark ? 0.7 : 0.5)
  const plank = tint(wood, colors.islandRockDark, 0.25)
  const ink = colors.dark ? '#2a2620' : '#26221d'
  const laneLen = 9.8
  const laneZ = (4.4 + -5.4) / 2
  const sign = signTexture()
  const top = useMemo(() => tint(colors.islandTop, colors.accent, colors.dark ? 0.04 : 0.05), [colors.islandTop, colors.accent, colors.dark])

  return (
    <Island colors={colors} y={y} trees={TREES} stones={5} seed={47} ring={false} top={top}>
      {/* lane */}
      <mesh position={[LX, y + 0.008, laneZ]} receiveShadow material={mat(wood, 0.55)}>
        <boxGeometry args={[3.3, 0.02, laneLen]} />
      </mesh>
      {[-1, -0.5, 0, 0.5, 1].map((k) => (
        <mesh key={k} position={[LX + k * 1.3, y + 0.02, laneZ]} material={mat(plank, 0.6)}>
          <boxGeometry args={[0.025, 0.004, laneLen]} />
        </mesh>
      ))}
      <mesh position={[LX, y + 0.022, 2.4]} material={mat(ink, 0.6)}>
        <boxGeometry args={[3.3, 0.006, 0.08]} />
      </mesh>
      {[-2, -1, 0, 1, 2].map((k) => (
        <mesh key={k} position={[LX + k * 0.55, y + 0.022, 0.4 - Math.abs(k) * 0.3]} rotation={[-Math.PI / 2, 0, Math.PI]} material={mat(colors.accent, 0.5)}>
          <circleGeometry args={[0.13, 3]} />
        </mesh>
      ))}
      {/* gutters + bumpers */}
      <RigidBody type="fixed" colliders={false} collisionGroups={groups.ground}>
        <CuboidCollider args={[0.16, 0.22, 4.1]} position={[LX - 1.95, y + 0.22, -1.9]} />
        <CuboidCollider args={[0.16, 0.22, 4.1]} position={[LX + 1.95, y + 0.22, -1.9]} />
        <CuboidCollider args={[2.2, 0.8, 0.2]} position={[LX, y + 0.8, -6.2]} />
      </RigidBody>
      {[-1, 1].map((s) => (
        <group key={s}>
          <mesh position={[LX + s * 1.72, y + 0.01, laneZ]} material={mat(colors.islandRockDark, 0.8)}>
            <boxGeometry args={[0.16, 0.02, laneLen]} />
          </mesh>
          <RoundedBox args={[0.32, 0.44, 8.2]} radius={0.12} smoothness={3} position={[LX + s * 1.95, y + 0.22, -1.9]} castShadow receiveShadow material={mat(colors.accent, 0.5)} />
        </group>
      ))}
      <RoundedBox args={[4.4, 1.6, 0.4]} radius={0.14} smoothness={3} position={[LX, y + 0.8, -6.2]} castShadow receiveShadow material={mat(ink, 0.7)} />
      <mesh position={[LX, y + 0.02, -5.8]} material={mat(colors.islandRockDark, 0.9)}>
        <boxGeometry args={[3.3, 0.02, 0.8]} />
      </mesh>
      <mesh position={[LX, y + 2.25, -6.0]} material={mat('#ffffff', 0.7, { map: sign })}>
        <planeGeometry args={[3.2, 0.8]} />
      </mesh>
      {[-1, 1].map((s) => (
        <mesh key={s} position={[LX + s * 1.5, y + 1.6, -6.15]} material={mat(ink, 0.6)}>
          <cylinderGeometry args={[0.05, 0.05, 0.9, 6]} />
        </mesh>
      ))}

      {RACK.map((_, i) => (
        <Pin key={i} i={i} y={y} colors={colors} handle={pins[i]} />
      ))}

      <RigidBody
        ref={ball}
        position={[SPOT[0], y + BALL_R + 0.05, SPOT[1]]}
        colliders={false}
        collisionGroups={groups.prop}
        ccd
        friction={0.4}
        restitution={0.1}
        linearDamping={0.15}
        angularDamping={0.2}
        onCollisionEnter={onBallHit}
        onContactForce={onBallImpact}
      >
        <BallCollider args={[BALL_R]} density={2.6} />
        <group onClick={launch} {...hover}>
          <mesh castShadow receiveShadow material={mat(colors.accent2, 0.22, { metalness: 0.05 })}>
            <sphereGeometry args={[BALL_R, 36, 24]} />
          </mesh>
          <mesh rotation={[Math.PI / 2, 0, 0.5]} scale={1.004} material={mat(colors.accent3, 0.4)}>
            <torusGeometry args={[BALL_R, BALL_R * 0.09, 8, 40]} />
          </mesh>
        </group>
      </RigidBody>

      {pops.map((p) => (
        <PinPop key={p.id} x={RACK[p.i][0]} z={RACK[p.i][1]} y={y} text={PIN_SKILLS[p.i] ?? ''} onDone={() => setPops((ps) => ps.filter((q) => q.id !== p.id))} />
      ))}
    </Island>
  )
}

function PinPop({ x, y, z, text, onDone }: { x: number; y: number; z: number; text: string; onDone: () => void }) {
  useEffect(() => {
    const t = setTimeout(onDone, 1700)
    return () => clearTimeout(t)
  }, [])
  return (
    <Html center position={[x, y + 2.4, z]} zIndexRange={[30, 0]} wrapperClass="game-html">
      <span className="game-pop mono">+ {text}</span>
    </Html>
  )
}
