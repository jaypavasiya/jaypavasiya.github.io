import { useLayoutEffect, useMemo, useRef, type ReactNode, type RefObject } from 'react'
import { useFrame } from '@react-three/fiber'
import { RoundedBox } from '@react-three/drei'
import {
  CatmullRomCurve3,
  DoubleSide,
  ExtrudeGeometry,
  Group,
  MathUtils,
  Mesh,
  MeshPhysicalMaterial,
  MeshStandardMaterial,
  Quaternion,
  Shape,
  ShapeGeometry,
  SphereGeometry,
  TubeGeometry,
  Vector3,
} from 'three'
import { avatarConfig, type AvatarConfig } from './avatarConfig'
import { input, settings } from './store'

export type AvatarMotion = {
  // 0..1 normalised walking speed.
  speed: number
  // Current body yaw in world space (radians), so the head can look at the camera.
  yaw: number
}

// Head geometry constants. Every face feature is placed relative to the head
// centre with `onHead`, which projects a 2D (x, y) point onto the skull.
const HEAD_R = 0.4
const HEAD_Y = 0.36 // head centre above the neck pivot
const NECK_Y = 1.05 // neck pivot above the feet
const EYE_X = 0.14
const EYE_Y = 0.0
const GLASSES_Z = 0.445
const GLASSES_TILT = 0.28

function onHead(x: number, y: number, lift = 0): [number, number, number] {
  const z = Math.sqrt(Math.max(0, HEAD_R * HEAD_R - x * x - y * y))
  const len = Math.hypot(x, y, z)
  const k = (HEAD_R + lift) / len
  return [x * k, y * k, z * k]
}

function surfaceTube(points: [number, number][], lift: number, radius: number) {
  const curve = new CatmullRomCurve3(points.map(([x, y]) => new Vector3(...onHead(x, y, lift))))
  return new TubeGeometry(curve, 24, radius, 8, false)
}

function roundedRectShape(w: number, h: number, r: number) {
  const s = new Shape()
  const x = -w / 2
  const y = -h / 2
  s.moveTo(x + r, y)
  s.lineTo(x + w - r, y)
  s.quadraticCurveTo(x + w, y, x + w, y + r)
  s.lineTo(x + w, y + h - r)
  s.quadraticCurveTo(x + w, y + h, x + w - r, y + h)
  s.lineTo(x + r, y + h)
  s.quadraticCurveTo(x, y + h, x, y + h - r)
  s.lineTo(x, y + r)
  s.quadraticCurveTo(x, y, x + r, y)
  return s
}

function circleShape(r: number) {
  const s = new Shape()
  s.absarc(0, 0, r, 0, Math.PI * 2, false)
  return s
}

// Squared-off octagon, like the thin hexagonal metal frames that are
// everywhere right now. `c` is how much each corner is clipped.
function octagonShape(w: number, h: number, c: number) {
  const s = new Shape()
  const x = w / 2
  const y = h / 2
  s.moveTo(-x + c, y)
  s.lineTo(x - c, y)
  s.lineTo(x, y - c)
  s.lineTo(x, -y + c * 1.3)
  s.lineTo(x - c * 1.3, -y)
  s.lineTo(-x + c * 1.3, -y)
  s.lineTo(-x, -y + c * 1.3)
  s.lineTo(-x, y - c)
  s.closePath()
  return s
}

function useGlassesGeometry(cfg: AvatarConfig) {
  return useMemo(() => {
    const k = cfg.glassesScale
    const border = (cfg.glassesWire ? 0.011 : 0.026) * k
    let outer: Shape
    let inner: Shape
    let halfW: number
    let halfH: number
    if (cfg.glassesShape === 'round') {
      halfW = 0.112 * k
      halfH = halfW
      outer = circleShape(halfW)
      inner = circleShape(halfW - border)
    } else if (cfg.glassesShape === 'geometric') {
      const w = 0.24 * k
      const h = 0.2 * k
      halfW = w / 2
      halfH = h / 2
      outer = octagonShape(w, h, 0.045 * k)
      inner = octagonShape(w - border * 2, h - border * 2, 0.04 * k)
    } else {
      const w = 0.235 * k
      const h = 0.19 * k
      halfW = w / 2
      halfH = h / 2
      outer = roundedRectShape(w, h, 0.07 * k)
      inner = roundedRectShape(w - border * 2, h - border * 2, 0.05 * k)
    }
    outer.holes.push(inner)
    const depth = cfg.glassesWire ? 0.01 : 0.022
    const frame = new ExtrudeGeometry(outer, {
      depth,
      bevelEnabled: true,
      bevelThickness: cfg.glassesWire ? 0.003 : 0.006,
      bevelSize: cfg.glassesWire ? 0.002 : 0.005,
      bevelSegments: 2,
      curveSegments: 18,
    })
    frame.translate(0, 0, -depth / 2)
    const lens = new ShapeGeometry(inner, 18)
    return { frame, lens, halfW, halfH }
  }, [cfg.glassesShape, cfg.glassesScale, cfg.glassesWire])
}

// A thin bar from a to b (glasses arms, bridge).
function Bar({ a, b, thickness, material }: { a: Vector3; b: Vector3; thickness: number; material: MeshStandardMaterial }) {
  const { position, quaternion, length } = useMemo(() => {
    const dir = new Vector3().subVectors(b, a)
    const length = dir.length()
    const quaternion = new Quaternion().setFromUnitVectors(new Vector3(0, 0, 1), dir.normalize())
    const position = new Vector3().addVectors(a, b).multiplyScalar(0.5)
    return { position, quaternion, length }
  }, [a, b])
  return (
    <mesh position={position} quaternion={quaternion} material={material}>
      <boxGeometry args={[thickness, thickness * 1.25, length]} />
    </mesh>
  )
}

function Glasses({ cfg, frameMat, browMat, lensMat }: { cfg: AvatarConfig; frameMat: MeshStandardMaterial; browMat: MeshStandardMaterial; lensMat: MeshPhysicalMaterial }) {
  const { frame, lens, halfW, halfH } = useGlassesGeometry(cfg)
  const wire = cfg.glassesWire ? 0.55 : 1
  const pts = useMemo(() => {
    const outerX = EYE_X + halfW * Math.cos(GLASSES_TILT)
    const outerZ = GLASSES_Z - halfW * Math.sin(GLASSES_TILT)
    const innerX = EYE_X - halfW * Math.cos(GLASSES_TILT)
    const innerZ = GLASSES_Z + halfW * Math.sin(GLASSES_TILT)
    const y = EYE_Y + 0.035
    // Temples run from the hinge, hug the side of the head, then hook back
    // over the ear, so they never stick out like wings from the front.
    const sideZ = 0.12
    const sideX = Math.sqrt(HEAD_R * HEAD_R - sideZ * sideZ - y * y) + 0.014
    return {
      hingeR: new Vector3(outerX - 0.004, y, outerZ),
      sideR: new Vector3(sideX, y, sideZ),
      earR: new Vector3(HEAD_R + 0.012, y - 0.01, -0.1),
      hingeL: new Vector3(-outerX + 0.004, y, outerZ),
      sideL: new Vector3(-sideX, y, sideZ),
      earL: new Vector3(-HEAD_R - 0.012, y - 0.01, -0.1),
      bridgeA: new Vector3(-innerX - 0.004, EYE_Y + 0.03, innerZ),
      bridgeB: new Vector3(innerX + 0.004, EYE_Y + 0.03, innerZ),
    }
  }, [halfW])

  return (
    <group>
      {[-1, 1].map((s) => (
        <group key={s} position={[s * EYE_X, EYE_Y, GLASSES_Z]} rotation={[0, s * GLASSES_TILT, 0]}>
          <mesh geometry={frame} material={frameMat} />
          <mesh geometry={lens} material={lensMat} position={[0, 0, -0.004]} userData={{ noShadow: true }} />
          {cfg.glassesBrowColor && (
            <RoundedBox args={[halfW * 1.55, 0.014, 0.014]} radius={0.006} smoothness={2} position={[0, halfH - 0.005, 0.004]} material={browMat} />
          )}
        </group>
      ))}
      <Bar a={pts.bridgeA} b={pts.bridgeB} thickness={0.022 * wire} material={frameMat} />
      <Bar a={pts.hingeR} b={pts.sideR} thickness={0.02 * wire} material={browMat} />
      <Bar a={pts.sideR} b={pts.earR} thickness={0.018 * wire} material={browMat} />
      <Bar a={pts.hingeL} b={pts.sideL} thickness={0.02 * wire} material={browMat} />
      <Bar a={pts.sideL} b={pts.earL} thickness={0.018 * wire} material={browMat} />
    </group>
  )
}

function Hair({ cfg, mat }: { cfg: AvatarConfig; mat: MeshStandardMaterial }) {
  const v = cfg.hairVolume
  const cap = useMemo(() => {
    // Cap tilted back: hairline high on the forehead, low at the nape.
    const r = cfg.hairStyle === 'buzz' ? HEAD_R + 0.008 : HEAD_R + 0.022
    return new SphereGeometry(r, 36, 20, 0, Math.PI * 2, 0, 1.45)
  }, [cfg.hairStyle])

  const clumps = useMemo(() => {
    const out: { p: [number, number, number]; q: Quaternion; r: number; s: [number, number, number] }[] = []
    const up = new Vector3(0, 1, 0)
    // Each clump is an ellipsoid whose local Y follows the skull normal, so
    // `s` reads as [width, thickness, length] on the surface.
    const add = (dx: number, dy: number, dz: number, r: number, dist: number, s: [number, number, number] = [1, 1, 1], twist = 0) => {
      const n = new Vector3(dx, dy, dz).normalize()
      const q = new Quaternion().setFromUnitVectors(up, n)
      if (twist) q.multiply(new Quaternion().setFromAxisAngle(up, twist))
      const d = n.clone().multiplyScalar(dist)
      out.push({ p: [d.x, d.y, d.z], q, r, s })
    }
    if (cfg.hairStyle === 'quiff') {
      const k = 0.8 + v * 0.4
      add(0.02, 0.78, 0.62, 0.2, HEAD_R + 0.0 * k, [1.45, 0.42 * k, 0.95])
      add(0.12, 0.9, 0.42, 0.19, HEAD_R + 0.01 * k, [1.3, 0.5 * k, 1.05], 0.3)
      add(-0.12, 0.92, 0.36, 0.18, HEAD_R + 0.0, [1.2, 0.45 * k, 1.0], -0.25)
      add(0.3, 0.74, 0.5, 0.13, HEAD_R - 0.02, [1, 0.45, 1.2], 0.6)
      add(-0.3, 0.74, 0.5, 0.13, HEAD_R - 0.02, [1, 0.45, 1.2], -0.6)
      add(0, 0.85, -0.45, 0.22, HEAD_R - 0.03, [1.4, 0.4, 1.1])
    } else if (cfg.hairStyle === 'short') {
      for (let i = -2; i <= 2; i++) add(i * 0.14, 0.78, 0.6 - Math.abs(i) * 0.06, 0.11, HEAD_R - 0.01, [1.2, 0.5, 1])
      add(0, 1, 0.1, 0.18, HEAD_R - 0.02, [1.4, 0.45, 1.3])
    } else if (cfg.hairStyle === 'curly') {
      // Fibonacci points over the upper skull.
      const n = 70
      for (let i = 0; i < n; i++) {
        const y = 1 - (i / (n - 1)) * 2
        const rad = Math.sqrt(1 - y * y)
        const th = i * 2.399963
        const x = Math.cos(th) * rad
        const z = Math.sin(th) * rad
        // keep only points the tilted cap covers
        if (y * 0.93 - z * 0.37 < 0.12) continue
        add(x, y, z, 0.075 + v * 0.025, HEAD_R + 0.02)
      }
    }
    return out
  }, [cfg.hairStyle, v])

  return (
    <group>
      <mesh geometry={cap} material={mat} rotation={[-0.38, 0, 0]} />
      {clumps.map((c, i) => (
        <mesh key={i} position={c.p} quaternion={c.q} scale={c.s} material={mat}>
          <sphereGeometry args={[c.r, 24, 16]} />
        </mesh>
      ))}
      {/* sideburns */}
      {[-1, 1].map((s) => (
        <mesh key={s} position={[s * 0.372, 0.06, 0.1]} scale={[0.4, 1.2, 0.75]} material={mat}>
          <sphereGeometry args={[0.055, 16, 12]} />
        </mesh>
      ))}
    </group>
  )
}

function Face({ cfg, mats, eyesRef }: { cfg: AvatarConfig; mats: Mats; eyesRef: RefObject<Group | null> }) {
  const smile = useMemo(() => {
    const pts: [number, number][] = []
    for (let i = 0; i <= 8; i++) {
      const t = i / 8 - 0.5
      pts.push([t * 0.17, -0.165 - 0.045 * (1 - 4 * t * t)])
    }
    return surfaceTube(pts, cfg.beard ? 0.022 : 0.004, 0.017)
  }, [cfg.beard])
  const brows = useMemo(
    () =>
      [-1, 1].map((s) =>
        surfaceTube(
          [
            [s * 0.07, 0.15],
            [s * 0.135, 0.168],
            [s * 0.2, 0.152],
          ],
          0.006,
          0.017,
        ),
      ),
    [],
  )
  const mustache = useMemo(
    () =>
      surfaceTube(
        [
          [-0.1, -0.135],
          [-0.04, -0.115],
          [0, -0.12],
          [0.04, -0.115],
          [0.1, -0.135],
        ],
        0.02,
        0.022,
      ),
    [],
  )
  const beard = useMemo(
    // Starts below the cheekbones so it never reaches the lenses.
    () => new SphereGeometry(HEAD_R + 0.016, 36, 16, Math.PI / 2 - 1.45, 2.9, Math.PI * 0.615, Math.PI * 0.27),
    [],
  )

  return (
    <group>
      {/* eyes */}
      <group ref={eyesRef}>
        {[-1, 1].map((s) => {
          const p = onHead(s * EYE_X, EYE_Y, -0.012)
          return (
            <group key={s} position={p} rotation={[0, Math.asin((s * EYE_X) / HEAD_R), 0]}>
              <mesh material={mats.eye} scale={[0.85, 1.15, 0.5]}>
                <sphereGeometry args={[0.048, 20, 14]} />
              </mesh>
              <mesh material={mats.white} position={[0.014, 0.022, 0.022]}>
                <sphereGeometry args={[0.013, 10, 8]} />
              </mesh>
            </group>
          )
        })}
      </group>
      {brows.map((g, i) => (
        <mesh key={i} geometry={g} material={mats.brow} />
      ))}
      {/* nose */}
      <mesh position={onHead(0, -0.07, 0.0)} scale={[1, 0.85, 0.85]} material={mats.skinShade}>
        <sphereGeometry args={[0.045, 16, 12]} />
      </mesh>
      <mesh geometry={smile} material={mats.mouth} />
      {cfg.blush &&
        [-1, 1].map((s) => (
          <mesh
            key={s}
            position={onHead(s * 0.235, -0.1, -0.006)}
            rotation={[0, Math.asin((s * 0.235) / HEAD_R), 0]}
            scale={[1, 0.62, 0.22]}
            material={mats.blush}
            userData={{ noShadow: true }}
          >
            <sphereGeometry args={[0.058, 16, 10]} />
          </mesh>
        ))}
      {cfg.beard && <mesh geometry={beard} material={mats.beard} />}
      {cfg.mustache && <mesh geometry={mustache} material={mats.beard} />}
      {/* ears */}
      {[-1, 1].map((s) => (
        <mesh key={s} position={[s * 0.392, -0.02, -0.01]} scale={[0.5, 1, 0.78]} material={mats.skinShade}>
          <sphereGeometry args={[0.085, 16, 12]} />
        </mesh>
      ))}
    </group>
  )
}

type Mats = ReturnType<typeof makeMaterials>

function makeMaterials(cfg: AvatarConfig) {
  const clay = (color: string, roughness = 0.75) => new MeshStandardMaterial({ color, roughness, metalness: 0 })
  return {
    skin: clay(cfg.skinColor, 0.62),
    skinShade: clay(cfg.skinShadeColor, 0.62),
    hair: clay(cfg.hairColor, 0.55),
    brow: clay(cfg.browColor, 0.6),
    eye: new MeshStandardMaterial({ color: cfg.eyeColor, roughness: 0.25 }),
    white: new MeshStandardMaterial({ color: '#ffffff', emissive: '#ffffff', emissiveIntensity: 0.6, roughness: 0.2 }),
    mouth: clay('#4a1f17', 0.5),
    blush: new MeshStandardMaterial({ color: cfg.blushColor, roughness: 0.9, transparent: true, opacity: 0.45, depthWrite: false }),
    beard: clay(cfg.beardColor, 0.8),
    frame: new MeshStandardMaterial({
      color: cfg.glassesColor,
      roughness: cfg.glassesWire ? 0.22 : 0.28,
      metalness: cfg.glassesWire ? 0.85 : 0.25,
    }),
    browline: new MeshStandardMaterial({ color: cfg.glassesBrowColor ?? cfg.glassesColor, roughness: 0.3, metalness: 0.2 }),
    watch: new MeshStandardMaterial({ color: cfg.watchColor, roughness: 0.35, metalness: 0.1 }),
    watchFace: new MeshStandardMaterial({ color: '#9aa39a', roughness: 0.15, metalness: 0.3 }),
    lens: new MeshPhysicalMaterial({
      color: cfg.lensTint,
      roughness: 0.04,
      metalness: 0.1,
      clearcoat: 1,
      clearcoatRoughness: 0.05,
      transparent: true,
      opacity: cfg.lensOpacity,
      envMapIntensity: 2.2,
      side: DoubleSide,
      depthWrite: false,
    }),
    shirt: clay(cfg.shirtColor, 0.8),
    trim: clay(cfg.shirtTrimColor, 0.6),
    pants: clay(cfg.pantsColor, 0.85),
    shoe: clay(cfg.shoeColor, 0.6),
    sole: clay(cfg.soleColor, 0.8),
  }
}

function Limb({ children, groupRef, position, rotation }: { children: ReactNode; groupRef: RefObject<Group | null>; position: [number, number, number]; rotation?: [number, number, number] }) {
  return (
    <group ref={groupRef} position={position} rotation={rotation}>
      {children}
    </group>
  )
}

type Props = {
  motion: RefObject<AvatarMotion>
  cameraYaw: number
  config?: AvatarConfig
}

export function Avatar({ motion, cameraYaw, config = avatarConfig }: Props) {
  const mats = useMemo(() => makeMaterials(config), [config])
  const root = useRef<Group>(null)
  const body = useRef<Group>(null)
  const torso = useRef<Group>(null)
  const head = useRef<Group>(null)
  const eyes = useRef<Group>(null)
  const armL = useRef<Group>(null)
  const armR = useRef<Group>(null)
  const legL = useRef<Group>(null)
  const legR = useRef<Group>(null)
  const anim = useRef({ phase: 0, nextBlink: 1.5, blinkAt: -10, doubleBlink: false, waveAt: -10 })

  useLayoutEffect(() => {
    root.current?.traverse((o) => {
      if ((o as Mesh).isMesh) {
        o.castShadow = !o.userData.noShadow
        o.receiveShadow = false
      }
    })
  }, [config])

  useFrame((state, rawDt) => {
    const dt = Math.min(rawDt, 0.05)
    const t = state.clock.elapsedTime
    const a = anim.current
    const m = motion.current
    const reduced = settings.reducedMotion
    const speed = MathUtils.clamp(m.speed, 0, 1)

    // Walk cycle
    a.phase += dt * 11 * Math.min(1, speed * 1.3)
    const swing = Math.sin(a.phase) * 0.8 * speed
    if (legL.current && legR.current) {
      legL.current.rotation.x = swing
      legR.current.rotation.x = -swing
    }
    const bob = reduced ? 0 : Math.abs(Math.sin(a.phase)) * 0.07 * speed
    const breathe = reduced ? 0 : Math.sin(t * 2.1) * 0.014
    if (body.current) {
      body.current.position.y = bob
      body.current.rotation.x = MathUtils.damp(body.current.rotation.x, speed * 0.12, 8, dt)
    }
    if (torso.current) torso.current.scale.set(1 - breathe * 0.4, 1 + breathe, 1 - breathe * 0.4)

    // Wave (click / E key)
    if (input.waveQueued) {
      input.waveQueued = false
      a.waveAt = t
    }
    const wt = t - a.waveAt
    const waving = wt >= 0 && wt < 1.9
    const env = waving ? Math.min(1, wt / 0.25, (1.9 - wt) / 0.35) : 0
    const ease = env * env * (3 - 2 * env)

    if (armL.current && armR.current) {
      armL.current.rotation.x = -swing * 0.9
      armL.current.rotation.z = -0.14 - speed * 0.06
      // Right arm (character's right is -x) does the waving.
      const wiggle = Math.sin(wt * 13) * 0.35
      armR.current.rotation.x = MathUtils.lerp(swing * 0.9, -0.15, ease)
      armR.current.rotation.z = MathUtils.lerp(0.14 + speed * 0.06, 2.55 + wiggle, ease)
    }

    // Blink
    if (t > a.nextBlink) {
      a.blinkAt = t
      a.doubleBlink = Math.random() < 0.2
      a.nextBlink = t + 2 + Math.random() * 3.5
    }
    const bt = t - a.blinkAt
    let lid = 1
    if (bt < 0.16) lid = 1 - Math.sin((bt / 0.16) * Math.PI) * 0.92
    else if (a.doubleBlink && bt > 0.24 && bt < 0.4) lid = 1 - Math.sin(((bt - 0.24) / 0.16) * Math.PI) * 0.92
    if (eyes.current) eyes.current.scale.y = lid

    // Head follows the pointer (in camera space), relative to body yaw.
    if (head.current) {
      let rel = cameraYaw - m.yaw
      rel = Math.atan2(Math.sin(rel), Math.cos(rel))
      const lookYaw = speed > 0.25 ? 0 : MathUtils.clamp(rel + state.pointer.x * 0.9, -0.85, 0.85)
      const lookPitch = speed > 0.25 ? 0.05 : MathUtils.clamp(-state.pointer.y * 0.35 + 0.05, -0.3, 0.35)
      head.current.rotation.y = MathUtils.damp(head.current.rotation.y, lookYaw, 6, dt)
      head.current.rotation.x = MathUtils.damp(head.current.rotation.x, lookPitch, 6, dt)
      head.current.rotation.z = MathUtils.damp(head.current.rotation.z, waving ? 0.12 * ease : 0, 6, dt)
      head.current.position.y = NECK_Y + breathe * 0.6
    }
  })

  return (
    <group ref={root}>
      {/* legs + shoes (pivot at the hip so they swing) */}
      {([
        [legL, 1],
        [legR, -1],
      ] as const).map(([ref, s]) => (
        <Limb key={s} groupRef={ref} position={[s * 0.11, 0.4, 0]}>
          <mesh position={[0, -0.16, 0]} material={mats.pants}>
            <capsuleGeometry args={[0.092, 0.16, 6, 14]} />
          </mesh>
          <group position={[0, -0.34, 0]}>
            <RoundedBox args={[0.17, 0.11, 0.27]} radius={0.05} smoothness={3} position={[0, 0.01, 0.035]} material={mats.shoe} />
            <RoundedBox args={[0.18, 0.045, 0.285]} radius={0.02} smoothness={2} position={[0, -0.04, 0.035]} material={mats.sole} />
          </group>
        </Limb>
      ))}

      <group ref={body}>
        {/* hips */}
        <mesh position={[0, 0.43, 0]} scale={[1.08, 0.62, 0.92]} material={mats.pants}>
          <sphereGeometry args={[0.225, 24, 16]} />
        </mesh>
        {/* torso */}
        <group ref={torso} position={[0, 0.5, 0]}>
          <mesh position={[0, 0.19, 0]} scale={[1.14, 1, 0.92]} material={mats.shirt}>
            <capsuleGeometry args={[0.245, 0.2, 8, 20]} />
          </mesh>
          {config.shirtStyle === 'polo' ? (
            <>
              {/* collar: a band round the neck plus two flaps folding down */}
              <mesh position={[0, 0.5, -0.01]} rotation={[Math.PI / 2, 0, 0]} material={mats.shirt}>
                <torusGeometry args={[0.105, 0.03, 10, 24]} />
              </mesh>
              {[-1, 1].map((s) => (
                <RoundedBox
                  key={s}
                  args={[0.12, 0.024, 0.1]}
                  radius={0.01}
                  smoothness={2}
                  position={[s * 0.075, 0.47, 0.1]}
                  rotation={[0.9, s * 0.35, s * -0.5]}
                  material={mats.shirt}
                />
              ))}
              {/* placket buttons */}
              {[0.4, 0.31, 0.22].map((y) => (
                <mesh key={y} position={[0, y, 0.228 - (0.4 - y) * 0.05]} material={mats.trim}>
                  <sphereGeometry args={[0.014, 10, 8]} />
                </mesh>
              ))}
              {/* small chest emblem */}
              <mesh position={[0.12, 0.3, 0.212]} rotation={[Math.PI / 2 - 0.2, 0, 0]} material={mats.trim}>
                <cylinderGeometry args={[0.022, 0.022, 0.006, 6]} />
              </mesh>
            </>
          ) : (
            <>
              <mesh position={[0, 0.5, 0]} rotation={[Math.PI / 2, 0, 0]} material={mats.trim}>
                <torusGeometry args={[0.1, 0.026, 10, 24]} />
              </mesh>
              <mesh position={[-0.11, 0.3, 0.215]} rotation={[Math.PI / 2 - 0.15, 0, 0]} material={mats.trim}>
                <cylinderGeometry args={[0.05, 0.05, 0.02, 20]} />
              </mesh>
            </>
          )}
        </group>

        {/* arms (pivot at the shoulder) */}
        {([
          [armL, 1],
          [armR, -1],
        ] as const).map(([ref, s]) => (
          <Limb key={s} groupRef={ref} position={[s * 0.3, 0.92, 0]} rotation={[0, 0, s * 0.14]}>
            <mesh position={[0, -0.08, 0]} material={mats.shirt}>
              <capsuleGeometry args={[0.088, 0.1, 6, 14]} />
            </mesh>
            <mesh position={[0, -0.24, 0]} material={mats.skin}>
              <capsuleGeometry args={[0.066, 0.13, 6, 12]} />
            </mesh>
            <mesh position={[0, -0.37, 0.005]} material={mats.skinShade}>
              <sphereGeometry args={[0.076, 16, 12]} />
            </mesh>
            {config.watch && s === 1 && (
              <group position={[0, -0.3, 0]}>
                <mesh material={mats.watch}>
                  <cylinderGeometry args={[0.074, 0.074, 0.04, 18]} />
                </mesh>
                <RoundedBox args={[0.06, 0.05, 0.03]} radius={0.008} smoothness={2} position={[0.07, 0, 0]} rotation={[0, 0, Math.PI / 2]} material={mats.watch} />
                <mesh position={[0.087, 0, 0]} rotation={[0, 0, Math.PI / 2]} material={mats.watchFace}>
                  <boxGeometry args={[0.032, 0.002, 0.022]} />
                </mesh>
              </group>
            )}
          </Limb>
        ))}

        {/* neck */}
        <mesh position={[0, 1.02, 0]} material={mats.skinShade}>
          <cylinderGeometry args={[0.075, 0.085, 0.1, 16]} />
        </mesh>

        {/* head */}
        <group ref={head} position={[0, NECK_Y, 0]}>
          <group position={[0, HEAD_Y, 0]}>
            <mesh material={mats.skin}>
              <sphereGeometry args={[HEAD_R, 40, 28]} />
            </mesh>
            <Face cfg={config} mats={mats} eyesRef={eyes} />
            <Hair cfg={config} mat={mats.hair} />
            <Glasses cfg={config} frameMat={mats.frame} browMat={mats.browline} lensMat={mats.lens} />
          </group>
        </group>
      </group>
    </group>
  )
}
