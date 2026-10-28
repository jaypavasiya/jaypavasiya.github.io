import { useLayoutEffect, useMemo, useRef, type RefObject } from 'react'
import { useFrame } from '@react-three/fiber'
import { RoundedBox } from '@react-three/drei'
import {
  Color,
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
  TorusGeometry,
  Vector3,
} from 'three'
import { avatarConfig, type AvatarConfig } from './avatarConfig'
import {
  clamp,
  faceAlong,
  faceTube,
  headGeometry,
  headPoint,
  headShell,
  headSideX,
  headSurface,
  lerpTable,
  loft,
  smoothstep,
  limbLathe,
  noseGeometry,
  segDist,
  openLathe,
  taperTube,
  type Ring,
} from './avatarGeometry'
import { input, settings } from './store'

export type AvatarMotion = {
  // 0..1 normalised walking speed.
  speed: number
  // Current body yaw in world space (radians), so the head can look at the camera.
  yaw: number
  // True while off the ground (jumping / falling).
  airborne?: boolean
}

// Model space: feet at y=0, ~1.92 units to the top of the hair, facing +Z.
// Stylised Ready Player Me / Fortnite-ish proportions: head ~1/6 of the
// height, short thick neck, broad shoulders and chest, tapered waist, thick
// tapered limbs with readable elbows and knees, relaxed A-pose.
export const AVATAR_HEIGHT = 1.92
const HEAD_SCALE = 1.1
const NECK_Y = 1.47 // head pivot
const HEAD_CY = 0.2 // head centre above the pivot (in body units)
const SHOULDER_X = 0.212
const SHOULDER_Y = 1.355
const HIP_X = 0.088
const HIP_Y = 0.86
const THIGH = 0.39
const SHIN = 0.37
const UPPER_ARM = 0.285
const FOREARM = 0.24
const A_POSE = 0.2 // arms out from the body (rad)
const ELBOW_REST = 0.3 // relaxed elbow bend (rad)
const EYE_X = 0.047
const EYE_Y = 0.004

// ---------------------------------------------------------------------------
// Materials

type Mats = ReturnType<typeof makeMaterials>

function makeMaterials(cfg: AvatarConfig) {
  const std = (color: string, roughness = 0.75, metalness = 0) => new MeshStandardMaterial({ color, roughness, metalness })
  const fabric = (color: string, sheenColor: string, roughness = 0.92) =>
    new MeshPhysicalMaterial({ color, roughness, metalness: 0, sheen: 0.45, sheenColor, sheenRoughness: 0.5 })
  return {
    // Head skin carries per-vertex colour (stubble), so its base is white.
    skinPainted: new MeshStandardMaterial({ color: '#ffffff', vertexColors: true, roughness: 0.58 }),
    skin: std(cfg.skinColor, 0.58),
    skinShade: std(cfg.skinShadeColor, 0.62),
    nostril: std('#7a4636', 0.8),
    lip: std(cfg.lipColor, 0.45),
    mouthLine: std('#4b2420', 0.6),
    hair: new MeshStandardMaterial({ color: '#ffffff', vertexColors: true, roughness: 0.55 }),
    brow: std(cfg.browColor, 0.7),
    facialHair: std(cfg.facialHairColor, 0.85),
    eyeWhite: new MeshStandardMaterial({ color: cfg.eyeWhiteColor, roughness: 0.28 }),
    iris: new MeshStandardMaterial({ color: cfg.irisColor, roughness: 0.2 }),
    pupil: new MeshStandardMaterial({ color: '#080605', roughness: 0.15 }),
    glint: new MeshStandardMaterial({ color: '#ffffff', emissive: '#ffffff', emissiveIntensity: 0.8 }),
    lash: std('#120d0b', 0.7),
    frame: std(cfg.glassesColor, cfg.glassesMetal ? 0.25 : 0.32, cfg.glassesMetal ? 0.85 : 0.15),
    lens: new MeshPhysicalMaterial({
      color: cfg.lensTint,
      roughness: 0.05,
      metalness: 0,
      clearcoat: 1,
      clearcoatRoughness: 0.04,
      transparent: true,
      opacity: cfg.lensOpacity,
      envMapIntensity: 2.5,
      side: DoubleSide,
      depthWrite: false,
    }),
    shirt: fabric(cfg.shirtColor, '#4a4a56'),
    rib: fabric(cfg.neckRibColor, '#55555f', 0.85),
    pants: fabric(cfg.pantsColor, '#3a4866', 0.88),
    seam: std(cfg.pantsSeamColor, 0.8),
    shoe: std(cfg.shoeColor, 0.55),
    sole: std(cfg.soleColor, 0.7),
    shoeAccent: std(cfg.shoeAccentColor, 0.5),
    watch: std(cfg.watchColor, 0.35, 0.1),
    watchFace: new MeshStandardMaterial({ color: '#8e9a90', roughness: 0.15, metalness: 0.3, emissive: '#1d221e' }),
  }
}

// ---------------------------------------------------------------------------
// Head, face and facial hair

function useHeadGeometry(cfg: AvatarConfig) {
  return useMemo(() => {
    const skin = new Color(cfg.skinColor)
    const stub = new Color(cfg.stubbleColor)
    const beard = new Color(cfg.facialHairColor)
    const k = cfg.stubble ? cfg.stubbleStrength : 0
    return headGeometry((ux, uy, uz, out) => {
      const phi = Math.abs(Math.atan2(ux, uz))
      // Stubble: below a line that rises from the cheeks to the sideburns,
      // fading out behind the jaw; covers the chin and upper lip.
      const line = lerpTable(phi, [0, 0.55, 0.95, 1.2, 1.55, 1.85], [-0.4, -0.37, -0.24, -0.02, -0.12, -0.55])
      let s = smoothstep(line + 0.04, line - 0.1, uy) * (1 - smoothstep(1.5, 1.85, phi))
      // lighter right around the lower lip
      s *= 1 - 0.4 * smoothstep(0.1, 0, Math.hypot(ux * 1.4, uy + 0.57)) * (uz > 0 ? 1 : 0)
      out.copy(skin).lerp(stub, s * k)
      if (!cfg.goatee) return 0
      // Goatee: narrow soul patch under the lip widening over the chin,
      // with a soft point at the bottom. Painted + raised slightly.
      const front = smoothstep(0.1, 0.4, uz)
      const below = 1 - smoothstep(-0.69, -0.61, uy)
      const wl = lerpTable(uy, [-1, -0.95, -0.85, -0.75, -0.67, -0.6], [0.08, 0.22, 0.3, 0.21, 0.1, 0.07])
      const width = 1 - smoothstep(wl - 0.06, wl + 0.03, Math.abs(ux))
      // thin strips from the mustache ends down past the mouth corners,
      // joining the chin beard (RPM-style "anchor")
      const strip = 1 - smoothstep(0.02, 0.05, segDist(Math.abs(ux), uy, 0.345, -0.53, 0.25, -0.76))
      const g = Math.max(front * below * width, strip * front)
      out.lerp(beard, smoothstep(0.15, 0.7, g))
      return g * 0.0045
    })
  }, [cfg.skinColor, cfg.stubbleColor, cfg.facialHairColor, cfg.stubble, cfg.stubbleStrength, cfg.goatee])
}

function Eye({ side, mats, groupRef, irisRef }: { side: number; mats: Mats; groupRef: RefObject<Group | null>; irisRef: RefObject<Group | null> }) {
  const { pos, quat, irisQuat, irisPos, lash, crease } = useMemo(() => {
    const ex = side * EYE_X
    const { p, n } = headSurface(ex, EYE_Y, -0.0098)
    const quat = faceAlong(n, 0.8)
    const irisQuat = faceAlong(n, 1)
    // the visible opening is centred on the skin surface point, not on the
    // (sunk) eyeball centre
    const irisPos: [number, number, number] = [side * 0.0034, -0.0002, 0]
    const off = p.clone().negate()
    const lashPts: [number, number][] = [
      [ex - side * 0.0245, EYE_Y + 0.002],
      [ex - side * 0.01, EYE_Y + 0.0112],
      [ex + side * 0.008, EYE_Y + 0.0118],
      [ex + side * 0.0265, EYE_Y + 0.0045],
    ]
    const lash = faceTube(lashPts, 0.0008, (t) => 0.0017 + 0.0012 * t)
    lash.translate(off.x, off.y, off.z)
    const crease = faceTube(
      [
        [ex - side * 0.019, EYE_Y + 0.0155],
        [ex, EYE_Y + 0.022],
        [ex + side * 0.021, EYE_Y + 0.016],
      ],
      0.0002,
      (t) => 0.0011 * Math.sin(Math.PI * t) + 0.0002,
    )
    return { pos: p, quat, irisQuat, irisPos, lash, crease }
  }, [side])

  return (
    <>
      <group ref={groupRef} position={pos}>
        <group quaternion={quat}>
          <mesh material={mats.eyeWhite} scale={[1.25, 0.62, 0.6]}>
            <sphereGeometry args={[0.0262, 24, 16]} />
          </mesh>
        </group>
        <group position={irisPos} quaternion={irisQuat}>
          <group ref={irisRef}>
            <mesh material={mats.iris} position={[0, 0, 0.014]} scale={[1, 1, 0.38]}>
              <sphereGeometry args={[0.0112, 20, 12]} />
            </mesh>
            <mesh material={mats.pupil} position={[0, 0, 0.0161]} scale={[1, 1, 0.45]}>
              <sphereGeometry args={[0.0052, 14, 10]} />
            </mesh>
            <mesh material={mats.glint} position={[side * 0.0035, 0.004, 0.0184]}>
              <sphereGeometry args={[0.0017, 8, 6]} />
            </mesh>
          </group>
        </group>
        <mesh geometry={lash} material={mats.lash} />
      </group>
      <mesh geometry={crease} material={mats.skinShade} />
    </>
  )
}

function Face({ cfg, mats, eyeRefs, irisRefs }: { cfg: AvatarConfig; mats: Mats; eyeRefs: RefObject<Group | null>[]; irisRefs: RefObject<Group | null>[] }) {
  const parts = useMemo(() => {
    const brows = [-1, 1].map((s) =>
      faceTube(
        [
          [s * 0.017, 0.045],
          [s * 0.039, 0.0525],
          [s * 0.064, 0.0535],
          [s * 0.088, 0.0455],
        ],
        0.0032,
        (t) => (0.0058 - 0.0022 * t) * Math.min(1, (1 - t) * 7 + 0.25, t * 9 + 0.55),
      ),
    )
    const mustache = faceTube(
      [
        [-0.045, -0.0855],
        [-0.034, -0.0782],
        [-0.016, -0.0742],
        [0, -0.0752],
        [0.016, -0.0742],
        [0.034, -0.0782],
        [0.045, -0.0855],
      ],
      0.0032,
      (t) => 0.0012 + 0.0042 * Math.pow(Math.sin(Math.PI * t), 0.8),
      40,
    )
    const mouth = faceTube(
      [
        [-0.029, -0.0838],
        [-0.014, -0.0893],
        [0, -0.0905],
        [0.014, -0.0893],
        [0.029, -0.0838],
      ],
      0.0008,
      (t) => 0.0007 + 0.0021 * Math.pow(Math.sin(Math.PI * t), 0.5),
    )
    const lowerLip = headSurface(0, -0.0985, -0.0035)
    // Nose: a soft wedge (bridge blending into the face), rounded tip,
    // small wings and a shaded underside with nostrils.
    const wedge = headSurface(0, -0.026, -0.007)
    const nose = {
      geo: noseGeometry(),
      p: wedge.p,
      q: faceAlong(wedge.n, 0.55),
      tip: headPoint(0, -0.0455, 0.0088),
      under: headSurface(0, -0.0555, 0.0045),
    }
    const ear = (s: number) => {
      const y = -0.008
      const z = -0.012
      return [s * (headSideX(y, z) + 0.002), y, z] as [number, number, number]
    }
    return { brows, mustache, mouth, lowerLip, nose, ear }
  }, [])

  return (
    <group userData={{ noShadow: true }}>
      <Eye side={-1} mats={mats} groupRef={eyeRefs[0]} irisRef={irisRefs[0]} />
      <Eye side={1} mats={mats} groupRef={eyeRefs[1]} irisRef={irisRefs[1]} />
      {parts.brows.map((g, i) => (
        <mesh key={i} geometry={g} material={mats.brow} />
      ))}
      <mesh geometry={parts.nose.geo} position={parts.nose.p} quaternion={parts.nose.q} scale={[0.0158, 0.0275, 0.022]} material={mats.skin} />
      <mesh position={parts.nose.tip} scale={[1.08, 0.9, 0.92]} material={mats.skin}>
        <sphereGeometry args={[0.0122, 20, 16]} />
      </mesh>
      {[-1, 1].map((s) => (
        <mesh key={s} position={headPoint(s * 0.0128, -0.0505, 0.0005)} rotation={[0, s * 0.3, 0]} scale={[1, 0.78, 0.9]} material={mats.skin}>
          <sphereGeometry args={[0.0085, 16, 12]} />
        </mesh>
      ))}
      {/* shaded underside + nostrils */}
      <group position={parts.nose.under.p} quaternion={faceAlong(parts.nose.under.n, 0.4)}>
        <mesh rotation={[0.9, 0, 0]} scale={[0.0135, 0.0045, 0.0075]} position={[0, 0, -0.001]} material={mats.skinShade}>
          <sphereGeometry args={[1, 16, 10]} />
        </mesh>
        {[-1, 1].map((s) => (
          <mesh key={s} position={[s * 0.0058, -0.0012, 0.0015]} rotation={[0.9, 0, s * 0.3]} scale={[0.0034, 0.0016, 0.0024]} material={mats.nostril}>
            <sphereGeometry args={[1, 10, 8]} />
          </mesh>
        ))}
      </group>
      <mesh geometry={parts.mouth} material={mats.mouthLine} />
      <mesh position={parts.lowerLip.p} quaternion={faceAlong(parts.lowerLip.n)} scale={[1.2, 0.42, 0.5]} material={mats.lip}>
        <sphereGeometry args={[0.02, 18, 12]} />
      </mesh>
      {cfg.mustache && <mesh geometry={parts.mustache} material={mats.facialHair} />}
      {/* ears */}
      {[-1, 1].map((s) => (
        <group key={s} position={parts.ear(s)} rotation={[0, s * 0.35, s * -0.08]}>
          <mesh scale={[0.013, 0.036, 0.024]} material={mats.skin}>
            <sphereGeometry args={[1, 16, 12]} />
          </mesh>
          <mesh position={[s * 0.006, 0.002, 0.002]} scale={[0.006, 0.024, 0.014]} material={mats.skinShade}>
            <sphereGeometry args={[1, 12, 10]} />
          </mesh>
        </group>
      ))}
    </group>
  )
}

// Hairline height (unit-sphere y) around the head; phi 0 = front, pi = back.
// Forehead hairline sits high (no fringe), recedes slightly at the temples,
// short sideburns, tight at the back.
const HAIRLINE_PHI = [0, 0.35, 0.7, 0.95, 1.1, 1.2, 1.33, 1.45, 1.8, 2.35, Math.PI]
const HAIRLINE_Y = [0.6, 0.58, 0.48, 0.33, 0.18, -0.12, -0.12, 0.14, 0.1, -0.35, -0.58]
// Where the quiff is tallest: front-centre, a little to Jay's left.
const QUIFF_PEAK = new Vector3(0.13, 0.86, 0.5).normalize()

// Shared hair field: returns the shell thickness and how "ridge" vs "groove"
// a point is, so geometry and shading agree.
function hairField(cfg: AvatarConfig, ux: number, uy: number, uz: number) {
  const v = cfg.hairVolume
  const fwd = cfg.hairForward
  const phi = Math.abs(Math.atan2(ux, uz))
  const h = lerpTable(phi, HAIRLINE_PHI, HAIRLINE_Y)
  if (cfg.hairStyle === 'buzz') {
    const m = smoothstep(h - 0.035, h + 0.06, uy)
    return { t: m * 0.0035 - (1 - m) * 0.003, ridge: 1, top: 0, m }
  }
  const top = smoothstep(0.2, 0.8, uy)
  // Strand ridges run from the hairline back over the top and fan out a
  // little, like hair combed up and back.
  const across = Math.atan2(ux, uy + 0.35) + (0.25 * uz * ux) / (Math.abs(ux) + 0.08)
  const ridge = Math.pow(Math.abs(Math.cos(across * 6)), 0.6)
  // Quiff mass: a soft lobe centred just behind the front hairline, rising
  // from a thin edge at the hairline so it reads as swept UP and back.
  const near = Math.exp(-(1 - (ux * QUIFF_PEAK.x + uy * QUIFF_PEAK.y + uz * QUIFF_PEAK.z)) / 0.22)
  const rise = smoothstep(h - 0.01, h + 0.26 - 0.06 * fwd, uy)
  const lobe = rise * near
  const quiff = cfg.hairStyle === 'quiff' ? lobe * (0.022 + 0.028 * v) : cfg.hairStyle === 'crop' ? lobe * 0.012 : 0
  const tex = (0.0018 + 0.006 * lobe) * ridge * top
  // Undercut silhouette: faded sides/back hug the skull, then the longer
  // top steps out as a broad, rounded mass.
  const mass = cfg.hairStyle === 'quiff' ? smoothstep(0.38, 0.72, uy) * smoothstep(-0.55, 0.0, uz) * (0.012 + 0.01 * v) : 0
  const t = 0.0026 + 0.0045 * top + mass + quiff + tex
  const notch = (1 - ridge) * smoothstep(0.2, 0.8, uz) * 0.03
  const m = smoothstep(h - 0.03 + notch, h + 0.05 + notch, uy)
  return { t: m * t - (1 - m) * 0.003, ridge, top, m }
}

function Hair({ cfg, mats }: { cfg: AvatarConfig; mats: Mats }) {
  const shell = useMemo(() => {
    const base = new Color(cfg.hairColor)
    const hi = new Color(cfg.hairHighlightColor)
    const skin = new Color(cfg.skinShadeColor)
    const dark = base.clone().multiplyScalar(0.45)
    return headShell(
      (ux, uy, uz) => hairField(cfg, ux, uy, uz).t,
      (ux, uy, uz, out) => {
        const f = hairField(cfg, ux, uy, uz)
        // grooves darker, crests catch a warm brown highlight on top
        out.copy(dark).lerp(base, smoothstep(0.05, 0.6, f.ridge))
        out.lerp(hi, smoothstep(0.75, 1, f.ridge) * f.top * 0.8)
        // fade: skin shows through the short sides near the edges
        out.lerp(skin, (1 - smoothstep(-0.2, 0.45, uy)) * 0.32 * (1 - smoothstep(0.55, 0.8, uz)))
      },
    )
  }, [cfg])

  return (
    // The shell is sculpted with ridges and highlights; separate strand
    // clumps on top read as spikes, so the quiff is the shell alone.
    <mesh geometry={shell} material={mats.hair} />
  )
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

function lensShape(cfg: AvatarConfig, w: number, h: number) {
  if (cfg.glassesShape === 'round') {
    const s = new Shape()
    s.absellipse(0, 0, w / 2, h / 2, 0, Math.PI * 2, false, 0)
    return s
  }
  if (cfg.glassesShape === 'geometric') {
    const c = Math.min(w, h) * 0.24
    const s = new Shape()
    s.moveTo(-w / 2 + c, h / 2)
    s.lineTo(w / 2 - c, h / 2)
    s.lineTo(w / 2, h / 2 - c)
    s.lineTo(w / 2, -h / 2 + c)
    s.lineTo(w / 2 - c, -h / 2)
    s.lineTo(-w / 2 + c, -h / 2)
    s.lineTo(-w / 2, -h / 2 + c)
    s.lineTo(-w / 2, h / 2 - c)
    s.closePath()
    return s
  }
  return roundedRectShape(w, h, Math.min(w, h) * 0.46)
}

function Glasses({ cfg, mats }: { cfg: AvatarConfig; mats: Mats }) {
  const g = useMemo(() => {
    const k = cfg.glassesScale
    const w = 0.061 * k
    const h = 0.041 * k
    const rim = cfg.glassesRim
    const outer = lensShape(cfg, w + rim * 2, h + rim * 2)
    const inner = lensShape(cfg, w, h)
    outer.holes.push(inner)
    const depth = 0.0035
    const frame = new ExtrudeGeometry(outer, { depth, bevelEnabled: true, bevelThickness: 0.0012, bevelSize: 0.0009, bevelSegments: 2, curveSegments: 20 })
    frame.translate(0, 0, -depth / 2)
    const lens = new ShapeGeometry(lensShape(cfg, w, h), 20)
    const tilt = 0.12
    const cy = EYE_Y + 0.003
    const cz = headSurface(EYE_X, EYE_Y).p.z + 0.021
    const halfW = w / 2 + rim
    const hingeX = EYE_X + halfW * Math.cos(tilt)
    const hingeZ = cz - halfW * Math.sin(tilt)
    const innerX = EYE_X - halfW * Math.cos(tilt)
    const innerZ = cz + halfW * Math.sin(tilt)
    const by = cy + h * 0.22
    const bridge = taperTube(
      [new Vector3(-innerX - 0.001, by, innerZ), new Vector3(0, by + 0.006, innerZ + 0.003), new Vector3(innerX + 0.001, by, innerZ)],
      () => 0.0026,
      12,
      8,
    )
    const ty = cy + h * 0.3
    const temple = (s: number) => {
      const pts = [new Vector3(s * (hingeX - 0.001), ty, hingeZ - 0.002), new Vector3(s * (hingeX + 0.012), ty, hingeZ - 0.03)]
      for (const z of [0.07, 0.025, -0.015]) pts.push(new Vector3(s * (headSideX(ty, z) + 0.0075), ty - (0.07 - z) * 0.08, z))
      pts.push(new Vector3(s * (headSideX(ty - 0.03, -0.04) + 0.004), ty - 0.032, -0.045))
      return taperTube(pts, () => 0.0028, 40, 6)
    }
    return { frame, lens, tilt, cy, cz, temples: [temple(-1), temple(1)], bridge, hinge: [hingeX, ty, hingeZ] as const }
  }, [cfg])

  return (
    <group userData={{ noShadow: true }}>
      {[-1, 1].map((s) => (
        <group key={s} position={[s * EYE_X, g.cy, g.cz]} rotation={[0.04, s * g.tilt, 0]}>
          <mesh geometry={g.frame} material={mats.frame} />
          <mesh geometry={g.lens} material={mats.lens} position={[0, 0, -0.001]} />
        </group>
      ))}
      <mesh geometry={g.bridge} material={mats.frame} />
      {g.temples.map((t, i) => (
        <mesh key={i} geometry={t} material={mats.frame} />
      ))}
      {[-1, 1].map((s) => (
        <mesh key={s} position={[s * g.hinge[0], g.hinge[1] - 0.004, g.hinge[2] - 0.002]} rotation={[0, s * g.tilt, 0]} material={mats.frame}>
          <boxGeometry args={[0.009, 0.009, 0.008]} />
        </mesh>
      ))}
    </group>
  )
}

// ---------------------------------------------------------------------------
// Body

// The tee: a smooth lofted silhouette from a loose hem over the jeans, in
// at the waist, out over the chest to broad, rounded shoulders and a crew
// neck opening. [y, half width, front depth, back depth, roundness]
const SHIRT_RINGS: Ring[] = [
  { y: 0.938, w: 0.164, df: 0.1, db: 0.098, n: 2.2 },
  { y: 0.928, w: 0.18, df: 0.114, db: 0.11, n: 2.2 },
  { y: 0.97, w: 0.176, df: 0.111, db: 0.106, n: 2.25 },
  { y: 1.05, w: 0.166, df: 0.105, db: 0.1, n: 2.3 },
  { y: 1.13, w: 0.174, df: 0.11, db: 0.103, n: 2.4 },
  { y: 1.21, w: 0.197, df: 0.122, db: 0.108, n: 2.5 },
  { y: 1.28, w: 0.214, df: 0.128, db: 0.113, n: 2.6 },
  { y: 1.335, w: 0.226, df: 0.122, db: 0.114, n: 2.6 },
  { y: 1.38, w: 0.228, df: 0.11, db: 0.11, n: 2.5 },
  { y: 1.41, w: 0.214, df: 0.097, db: 0.1, n: 2.4 },
  { y: 1.435, w: 0.172, df: 0.083, db: 0.089, n: 2.3 },
  { y: 1.452, w: 0.118, df: 0.072, db: 0.077, n: 2.15, tilt: 0.22 },
  { y: 1.46, w: 0.088, df: 0.067, db: 0.071, n: 2, tilt: 0.3 },
]

// Jeans seat/hips, tucked under the tee. Closed underneath; the thighs
// overlap it so there's no V at the crotch. The bottom stays shallow at the
// front (well behind the thighs' front surface) so it never reads as a pouch.
const PANTS_RINGS: Ring[] = [
  { y: 0.815, w: 0.1, df: 0.03, db: 0.07, n: 2.2 },
  { y: 0.845, w: 0.17, df: 0.07, db: 0.105, n: 2.4 },
  { y: 0.88, w: 0.182, df: 0.108, db: 0.118, n: 2.5 },
  { y: 0.95, w: 0.174, df: 0.102, db: 0.106, n: 2.4 },
  { y: 1.0, w: 0.158, df: 0.092, db: 0.094, n: 2.3 },
]

function useBodyGeometry() {
  return useMemo(() => {
    const shirt = loft(SHIRT_RINGS, 64, {
      bump: (th, y) => {
        // soft horizontal folds where the tee gathers above the waist, and
        // gentle vertical drape lines towards the loose hem
        const waist = smoothstep(0.96, 1.02, y) * (1 - smoothstep(1.1, 1.18, y))
        const hem = 1 - smoothstep(0.94, 1.08, y)
        const side = Math.abs(Math.sin(th))
        return 0.0034 * waist * Math.sin(y * 95 + Math.cos(th * 2) * 1.8) * (0.35 + 0.65 * side) + 0.003 * hem * Math.sin(th * 6 + 0.6)
      },
    })
    const pants = loft(PANTS_RINGS, 48, { capBottom: true })
    // Ribbed crew neck: a fat torus with fine radial ridges.
    const R = 0.075
    const rib = new TorusGeometry(R, 0.0125, 12, 120)
    const p = rib.attributes.position
    const c = new Vector3()
    const v = new Vector3()
    for (let i = 0; i < p.count; i++) {
      v.fromBufferAttribute(p, i)
      const a = Math.atan2(v.y, v.x)
      c.set(Math.cos(a) * R, Math.sin(a) * R, 0)
      v.sub(c).multiplyScalar(1 + 0.1 * Math.sin(a * 110)).add(c)
      p.setXYZ(i, v.x, v.y, v.z)
    }
    rib.computeVertexNormals()
    // Short sleeve that flares out from the shoulder, with a turned hem.
    const sleeve = openLathe(
      [
        [0.081, -0.168],
        [0.09, -0.163],
        [0.088, -0.1],
        [0.083, -0.02],
        [0.072, 0.03],
        [0.05, 0.064],
        [0.0, 0.076],
      ],
      32,
    )
    // Straight-leg hem with a slight break where it sits on the sneaker.
    const legHem = openLathe(
      [
        [0.07, -0.002],
        [0.084, 0.004],
        [0.085, 0.03],
        [0.08, 0.075],
      ],
      28,
    )
    return {
      shirt,
      pants,
      rib,
      sleeve,
      legHem,
      // [y, r] profiles, pivot at the top joint
      thigh: limbLathe([[0, 0.1], [-0.08, 0.1], [-0.2, 0.091], [-0.33, 0.081], [-0.39, 0.079]], 24),
      shin: limbLathe([[0, 0.079], [-0.04, 0.08], [-0.16, 0.077], [-0.28, 0.077], [-0.33, 0.08]], 24),
      upperArm: limbLathe([[-0.02, 0.068], [-0.08, 0.071], [-0.15, 0.067], [-0.24, 0.058], [-0.285, 0.056]], 24),
      forearm: limbLathe([[0, 0.057], [-0.02, 0.06], [-0.065, 0.061], [-0.13, 0.054], [-0.2, 0.045], [-0.235, 0.041]], 24),
      neck: limbLathe([[0.07, 0.064], [0.02, 0.066], [-0.04, 0.072], [-0.06, 0.075]], 20),
    }
  }, [])
}

type Rig = {
  pelvis: RefObject<Group | null>
  torso: RefObject<Group | null>
  chest: RefObject<Group | null>
  head: RefObject<Group | null>
  arm: RefObject<Group | null>[]
  fore: RefObject<Group | null>[]
  hand: RefObject<Group | null>[]
  thigh: RefObject<Group | null>[]
  shin: RefObject<Group | null>[]
  foot: RefObject<Group | null>[]
  eye: RefObject<Group | null>[]
  iris: RefObject<Group | null>[]
}

// Chunky clean sneaker; pivot at the ankle, sole bottom at y=-0.1.
function Shoe({ mats }: { mats: Mats }) {
  return (
    <group>
      <RoundedBox args={[0.124, 0.042, 0.29]} radius={0.016} smoothness={3} position={[0, -0.079, 0.042]} material={mats.sole} />
      <RoundedBox args={[0.114, 0.082, 0.272]} radius={0.04} smoothness={4} position={[0, -0.036, 0.038]} rotation={[0.05, 0, 0]} material={mats.shoe} />
      <mesh position={[0, 0.002, -0.022]} material={mats.shoe}>
        <cylinderGeometry args={[0.064, 0.068, 0.05, 24]} />
      </mesh>
      <RoundedBox args={[0.04, 0.05, 0.014]} radius={0.006} smoothness={2} position={[0, -0.006, -0.098]} material={mats.shoeAccent} />
      {[0.04, 0.068, 0.096].map((z) => (
        <RoundedBox key={z} args={[0.056, 0.007, 0.013]} radius={0.003} smoothness={2} position={[0, 0.006 - (z - 0.04) * 0.2, z]} rotation={[0.2, 0, 0]} material={mats.sole} />
      ))}
      {/* side accent stripe */}
      {[-1, 1].map((s) => (
        <RoundedBox key={s} args={[0.004, 0.014, 0.13]} radius={0.002} smoothness={1} position={[s * 0.057, -0.042, 0.03]} rotation={[-0.22, 0, 0]} material={mats.shoeAccent} />
      ))}
    </group>
  )
}

// Rounded mitten hand, relaxed and slightly cupped. The palm starts inside
// the wrist (no step) and the fingers overlap it heavily, curling towards
// the thigh (-side * x), so it reads as one hand rather than stacked balls.
// Thin across the palm (x), wide across the knuckles (z). Wrist to
// fingertip ~0.19, about chin-to-brow.
function Hand({ mats, side }: { mats: Mats; side: number }) {
  return (
    <group rotation={[0, 0, side * 0.04]}>
      {/* palm */}
      <mesh position={[0, -0.05, 0.004]} scale={[0.66, 1, 1]} material={mats.skin}>
        <capsuleGeometry args={[0.04, 0.05, 8, 20]} />
      </mesh>
      {/* fingers, together, curling in */}
      <group position={[0, -0.085, 0.004]} rotation={[0, 0, -side * 0.22]}>
        <mesh position={[0, -0.045, 0]} scale={[0.62, 1, 0.94]} material={mats.skin}>
          <capsuleGeometry args={[0.037, 0.05, 8, 20]} />
        </mesh>
      </group>
      {/* thumb, on the front, angled down and in */}
      <mesh position={[-side * 0.006, -0.062, 0.036]} rotation={[-0.38, 0, side * 0.4]} material={mats.skin}>
        <capsuleGeometry args={[0.0155, 0.042, 6, 14]} />
      </mesh>
    </group>
  )
}

function Arm({ side, mats, geo, rig, cfg }: { side: number; mats: Mats; geo: ReturnType<typeof useBodyGeometry>; rig: Rig; cfg: AvatarConfig }) {
  const i = side > 0 ? 1 : 0
  return (
    <group ref={rig.arm[i]} position={[side * SHOULDER_X, SHOULDER_Y, 0]} rotation={[0, 0, side * A_POSE]}>
      {/* sleeve angles out a little more than the arm, so it flares */}
      <mesh geometry={geo.sleeve} rotation={[0, 0, side * 0.1]} scale={[1, 1, 0.92]} material={mats.shirt} />
      <mesh geometry={geo.upperArm} material={mats.skin} />
      <group ref={rig.fore[i]} position={[0, -UPPER_ARM, 0]} rotation={[-ELBOW_REST, 0, 0]}>
        <mesh geometry={geo.forearm} material={mats.skin} />
        {cfg.watch && side > 0 && (
          <group position={[0, -0.198, 0]}>
            <mesh material={mats.watch}>
              <cylinderGeometry args={[0.0475, 0.0475, 0.026, 24]} />
            </mesh>
            <RoundedBox args={[0.014, 0.042, 0.038]} radius={0.005} smoothness={2} position={[side * 0.048, 0, 0]} material={mats.watch} />
            <mesh position={[side * 0.0555, 0, 0]} material={mats.watchFace}>
              <boxGeometry args={[0.002, 0.024, 0.024]} />
            </mesh>
          </group>
        )}
        <group ref={rig.hand[i]} position={[0, -FOREARM, 0]}>
          <Hand mats={mats} side={side} />
        </group>
      </group>
    </group>
  )
}

function Leg({ side, mats, geo, rig }: { side: number; mats: Mats; geo: ReturnType<typeof useBodyGeometry>; rig: Rig }) {
  const i = side > 0 ? 1 : 0
  return (
    <group ref={rig.thigh[i]} position={[side * HIP_X, HIP_Y, 0]}>
      <mesh geometry={geo.thigh} material={mats.pants} />
      <group ref={rig.shin[i]} position={[0, -THIGH, 0]}>
        <mesh geometry={geo.shin} material={mats.pants} />
        <mesh geometry={geo.legHem} position={[0, -SHIN + 0.012, 0.004]} rotation={[0.12, 0, 0]} material={mats.pants} />
        <group ref={rig.foot[i]} position={[0, -SHIN, 0]}>
          <Shoe mats={mats} />
        </group>
      </group>
    </group>
  )
}

// ---------------------------------------------------------------------------

type Props = {
  motion: RefObject<AvatarMotion>
  cameraYaw: number
  config?: AvatarConfig
}

// Scratch objects for the look-at maths (no per-frame allocation).
const lookTmp = { head: new Vector3(), dir: new Vector3(), q: new Quaternion() }

// `cameraYaw` is kept for API compatibility; the gaze now uses the live
// camera position, so it works for any camera.
export function Avatar({ motion, config = avatarConfig }: Props) {
  const mats = useMemo(() => makeMaterials(config), [config])
  const head = useHeadGeometry(config)
  const geo = useBodyGeometry()
  const root = useRef<Group>(null)
  const body = useRef<Group>(null)
  const rig: Rig = {
    pelvis: useRef<Group>(null),
    torso: useRef<Group>(null),
    chest: useRef<Group>(null),
    head: useRef<Group>(null),
    arm: [useRef<Group>(null), useRef<Group>(null)],
    fore: [useRef<Group>(null), useRef<Group>(null)],
    hand: [useRef<Group>(null), useRef<Group>(null)],
    thigh: [useRef<Group>(null), useRef<Group>(null)],
    shin: [useRef<Group>(null), useRef<Group>(null)],
    foot: [useRef<Group>(null), useRef<Group>(null)],
    eye: [useRef<Group>(null), useRef<Group>(null)],
    iris: [useRef<Group>(null), useRef<Group>(null)],
  }
  const anim = useRef({ phase: 0, gait: 0, nextBlink: 1.5, blinkAt: -10, doubleBlink: false, waveAt: -10 })

  useLayoutEffect(() => {
    // Only the big shapes cast shadows; face details and lenses don't.
    root.current?.traverse((o) => {
      if (!(o as Mesh).isMesh) return
      let cast = true
      o.traverseAncestors((p) => {
        if (p.userData.noShadow) cast = false
      })
      o.castShadow = cast
      o.receiveShadow = false
    })
  }, [config])

  useFrame((state, rawDt) => {
    const dt = Math.min(rawDt, 0.05)
    const t = state.clock.elapsedTime
    const a = anim.current
    const m = motion.current
    const reduced = settings.reducedMotion
    const speed = clamp(m.speed, 0, 1)
    // gait eases in/out so stopping doesn't snap the legs straight
    a.gait = MathUtils.damp(a.gait, speed, 10, dt)
    const g = a.gait
    if (g > 0.01) a.phase += dt * (7 + 6.5 * g)
    else a.phase = MathUtils.damp(a.phase, Math.round(a.phase / Math.PI) * Math.PI, 6, dt)
    const ph = a.phase
    const sin = Math.sin(ph)
    const cos = Math.cos(ph)
    const air = m.airborne ? 1 : 0

    // Legs: hip swing, knee flexes during the forward swing, foot stays level.
    const A = 0.44 * g
    for (const [i, s] of [
      [1, 1],
      [0, -1],
    ] as const) {
      const hip = -A * sin * s - air * 0.25
      const swingPhase = Math.max(0, cos * s)
      const knee = g * (0.1 + 1.05 * Math.pow(swingPhase, 1.4)) + air * 0.55
      rig.thigh[i].current?.rotation.set(hip, 0, s * 0.02)
      rig.shin[i].current?.rotation.set(knee, 0, 0)
      rig.foot[i].current?.rotation.set(-(hip + knee) * 0.85 + g * 0.12 * Math.max(0, -cos * s), 0, 0)
    }

    // Body: drop at double support, forward lean, counter-rotating hips/chest.
    const breathe = reduced ? 0 : Math.sin(t * 2.0) * 0.012
    if (body.current) {
      const drop = (THIGH + SHIN) * (1 - Math.cos(A * Math.abs(sin)))
      body.current.position.y = -drop + g * 0.018 * Math.abs(cos)
      body.current.rotation.x = MathUtils.damp(body.current.rotation.x, g * 0.09, 8, dt)
      body.current.rotation.z = reduced ? 0 : Math.sin(t * 0.9) * 0.008 * (1 - g) + sin * 0.025 * g
    }
    if (rig.pelvis.current) rig.pelvis.current.rotation.y = -sin * 0.09 * g
    if (rig.torso.current) rig.torso.current.rotation.y = sin * 0.11 * g
    if (rig.chest.current) rig.chest.current.scale.set(1 + breathe * 0.35, 1 + breathe * 0.5, 1 + breathe * 0.9)

    // Wave (click / E key) with the right arm.
    if (input.waveQueued) {
      input.waveQueued = false
      a.waveAt = t
    }
    const wt = t - a.waveAt
    const waving = wt >= 0 && wt < 2.1
    const env = waving ? Math.min(1, wt / 0.3, (2.1 - wt) / 0.4) : 0
    const ease = env * env * (3 - 2 * env)
    const wiggle = Math.sin(wt * 12) * 0.38

    // Arms swing opposite the legs, elbows bend more as the arm comes forward.
    for (const [i, s] of [
      [1, 1],
      [0, -1],
    ] as const) {
      const swing = 0.42 * g * sin * s
      const fwd = Math.max(0, -sin * s)
      const idle = reduced ? 0 : Math.sin(t * 2.0 + i) * 0.015
      const arm = rig.arm[i].current
      const fore = rig.fore[i].current
      const hand = rig.hand[i].current
      if (!arm || !fore || !hand) continue
      let ax = swing + idle
      let az = s * (A_POSE - g * 0.06 + air * 0.35)
      let fx = -(ELBOW_REST + 0.15 * g + 0.45 * g * fwd) - air * 0.3
      let fz = 0
      let hy = 0
      if (s < 0 && ease > 0) {
        ax = MathUtils.lerp(ax, -0.25, ease)
        az = MathUtils.lerp(az, -2.05, ease)
        fx = MathUtils.lerp(fx, 0, ease)
        fz = MathUtils.lerp(0, -0.95 + wiggle, ease)
        hy = MathUtils.lerp(0, -1.2, ease)
      }
      arm.rotation.set(ax, 0, az)
      fore.rotation.set(fx, 0, fz)
      hand.rotation.set(0, hy, 0)
    }

    // Blink
    if (t > a.nextBlink) {
      a.blinkAt = t
      a.doubleBlink = Math.random() < 0.2
      a.nextBlink = t + 2 + Math.random() * 3.5
    }
    const bt = t - a.blinkAt
    let lid = 1
    if (bt < 0.15) lid = 1 - Math.sin((bt / 0.15) * Math.PI) * 0.93
    else if (a.doubleBlink && bt > 0.22 && bt < 0.37) lid = 1 - Math.sin(((bt - 0.22) / 0.15) * Math.PI) * 0.93
    rig.eye[0].current?.scale.set(1, lid, 1)
    rig.eye[1].current?.scale.set(1, lid, 1)

    // Head and eyes look at the camera at rest, and follow the pointer.
    const h = rig.head.current
    if (h && root.current) {
      h.getWorldPosition(lookTmp.head)
      lookTmp.dir.copy(state.camera.position).sub(lookTmp.head)
      root.current.getWorldQuaternion(lookTmp.q).invert()
      lookTmp.dir.applyQuaternion(lookTmp.q)
      const camYaw = Math.atan2(lookTmp.dir.x, lookTmp.dir.z)
      const camPitch = Math.atan2(lookTmp.dir.y, Math.hypot(lookTmp.dir.x, lookTmp.dir.z))
      const walking = g > 0.3
      const wantYaw = walking ? 0 : clamp(camYaw + state.pointer.x * 0.6, -1.2, 1.2)
      const wantPitch = walking ? -0.05 : clamp(camPitch + state.pointer.y * 0.35, -0.6, 0.6)
      // the head takes most of it, the eyes do the rest
      const headYaw = clamp(wantYaw * 0.75, -0.75, 0.75)
      const headPitch = clamp(wantPitch * 0.55, -0.3, 0.25)
      h.rotation.y = MathUtils.damp(h.rotation.y, headYaw, 6, dt)
      h.rotation.x = MathUtils.damp(h.rotation.x, -headPitch, 6, dt)
      h.rotation.z = MathUtils.damp(h.rotation.z, waving ? 0.1 * ease : 0, 6, dt)
      h.position.y = NECK_Y + breathe * 0.4
      const ix = clamp(wantYaw - h.rotation.y, -0.3, 0.3)
      const iy = clamp(wantPitch + h.rotation.x, -0.25, 0.3)
      for (const r of rig.iris) r.current?.rotation.set(-iy, ix, 0)
    }
  })

  return (
    <group ref={root}>
      <group ref={body}>
        <Leg side={1} mats={mats} geo={geo} rig={rig} />
        <Leg side={-1} mats={mats} geo={geo} rig={rig} />
        <group ref={rig.pelvis}>
          <mesh geometry={geo.pants} material={mats.pants} />
        </group>

        <group ref={rig.torso} position={[0, 1.0, 0]}>
          <group position={[0, -1.0, 0]}>
            <group ref={rig.chest} position={[0, 1.0, 0]}>
              <mesh geometry={geo.shirt} position={[0, -1.0, 0]} material={mats.shirt} />
            </group>
            <mesh geometry={geo.rib} position={[0, 1.457, 0.003]} rotation={[Math.PI / 2 + 0.3, 0, 0]} scale={[1, 0.9, 1]} material={mats.rib} />
            <Arm side={1} mats={mats} geo={geo} rig={rig} cfg={config} />
            <Arm side={-1} mats={mats} geo={geo} rig={rig} cfg={config} />
            <mesh geometry={geo.neck} position={[0, 1.47, 0]} material={mats.skinShade} />

            <group ref={rig.head} position={[0, NECK_Y, 0]}>
              <group position={[0, HEAD_CY, 0]} scale={HEAD_SCALE}>
                <mesh geometry={head} material={mats.skinPainted} />
                <Face cfg={config} mats={mats} eyeRefs={rig.eye} irisRefs={rig.iris} />
                <Hair cfg={config} mats={mats} />
                {config.glasses && <Glasses cfg={config} mats={mats} />}
              </group>
            </group>
          </group>
        </group>
      </group>
    </group>
  )
}
