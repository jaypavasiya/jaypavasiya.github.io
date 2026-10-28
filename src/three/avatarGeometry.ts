// Geometry helpers for the procedural avatar: a sculpted head that face
// features can be pinned to, shells that grow out of it (hair, beard),
// lofted clothing and tapered limbs/tubes. Everything is built once.
import {
  BufferGeometry,
  CatmullRomCurve3,
  Color,
  Float32BufferAttribute,
  LatheGeometry,
  Matrix4,
  Quaternion,
  SphereGeometry,
  TubeGeometry,
  Vector2,
  Vector3,
} from 'three'
import { mergeVertices } from 'three/examples/jsm/utils/BufferGeometryUtils.js'

export const clamp = (x: number, a: number, b: number) => Math.min(b, Math.max(a, x))
export const smoothstep = (e0: number, e1: number, x: number) => {
  const t = clamp((x - e0) / (e1 - e0), 0, 1)
  return t * t * (3 - 2 * t)
}

// Piecewise-linear lookup.
export function lerpTable(x: number, xs: number[], ys: number[]) {
  if (x <= xs[0]) return ys[0]
  for (let i = 1; i < xs.length; i++) {
    if (x <= xs[i]) return ys[i - 1] + ((ys[i] - ys[i - 1]) * (x - xs[i - 1])) / (xs[i] - xs[i - 1])
  }
  return ys[ys.length - 1]
}

// Smooth (cubic Hermite / Catmull-Rom) lookup.
export function splineTable(x: number, xs: number[], ys: number[]) {
  const n = xs.length
  if (x <= xs[0]) return ys[0]
  if (x >= xs[n - 1]) return ys[n - 1]
  let i = 1
  while (x > xs[i]) i++
  const slope = (j: number) =>
    j <= 0 ? (ys[1] - ys[0]) / (xs[1] - xs[0]) : j >= n - 1 ? (ys[n - 1] - ys[n - 2]) / (xs[n - 1] - xs[n - 2]) : (ys[j + 1] - ys[j - 1]) / (xs[j + 1] - xs[j - 1])
  const h = xs[i] - xs[i - 1]
  const t = (x - xs[i - 1]) / h
  const t2 = t * t
  const t3 = t2 * t
  return (2 * t3 - 3 * t2 + 1) * ys[i - 1] + (t3 - 2 * t2 + t) * slope(i - 1) * h + (-2 * t3 + 3 * t2) * ys[i] + (t3 - t2) * slope(i) * h
}

// Re-weld a primitive so computeVertexNormals is smooth across its seams.
function weld(g: BufferGeometry) {
  g.deleteAttribute('normal')
  g.deleteAttribute('uv')
  const w = mergeVertices(g, 1e-5)
  g.dispose()
  return w
}

// ---------------------------------------------------------------------------
// Head: an ellipsoid with a squarer jaw, a chin that comes forward and a
// cranium that extends back. Mapped from unit-sphere directions so shells
// (hair, beard) and painted regions (stubble) can be authored per direction.

export const HEAD = { a: 0.128, b: 0.158, c: 0.142 }
const W_U = [-1, -0.9, -0.72, -0.45, 0, 0.5, 1]
const W_V = [0.86, 0.94, 1.0, 0.97, 1, 0.99, 0.96]
const DF_U = [-1, -0.88, -0.6, -0.2, 0.3, 1]
const DF_V = [0.92, 1.07, 1.02, 1.0, 0.98, 1]
const DB_U = [-1, -0.5, 0, 0.5, 1]
const DB_V = [0.82, 0.9, 1.05, 1.09, 1]

const headW = (uy: number) => splineTable(uy, W_U, W_V)
const headDF = (uy: number) => splineTable(uy, DF_U, DF_V)
const headDB = (uy: number) => splineTable(uy, DB_U, DB_V)

export function headMap(ux: number, uy: number, uz: number, out = new Vector3()) {
  return out.set(HEAD.a * ux * headW(uy), HEAD.b * uy, HEAD.c * uz * (uz >= 0 ? headDF(uy) : headDB(uy)))
}

function frontSurface(x: number, y: number) {
  const uy = clamp(y / HEAD.b, -0.999, 0.999)
  const ux = x / (HEAD.a * headW(uy))
  const uz = Math.sqrt(Math.max(0, 1 - ux * ux - uy * uy))
  return headMap(ux, uy, uz)
}

// Point on the face (front hemisphere) at head-local (x, y), pushed `lift`
// along the surface normal. Returns the point and the outward normal.
export function headSurface(x: number, y: number, lift = 0) {
  const e = 1e-3
  const p = frontSurface(x, y)
  const dx = frontSurface(x + e, y).sub(p)
  const dy = frontSurface(x, y + e).sub(p)
  const n = dx.cross(dy).normalize()
  return { p: p.addScaledVector(n, lift), n }
}

export function headPoint(x: number, y: number, lift = 0): [number, number, number] {
  const { p } = headSurface(x, y, lift)
  return [p.x, p.y, p.z]
}

// |x| of the head surface at a given height and depth (for glasses temples).
export function headSideX(y: number, z: number) {
  const uy = clamp(y / HEAD.b, -0.999, 0.999)
  const uz = z / (HEAD.c * (z >= 0 ? headDF(uy) : headDB(uy)))
  const ux = Math.sqrt(Math.max(0, 1 - uy * uy - uz * uz))
  return HEAD.a * ux * headW(uy)
}

// Quaternion turning +Z to face along `n` (keeps +Y roughly up).
export function faceAlong(n: Vector3, blendForward = 0) {
  const z = n.clone().lerp(new Vector3(0, 0, 1), blendForward).normalize()
  const x = new Vector3(0, 1, 0).cross(z).normalize()
  const y = z.clone().cross(x)
  return new Quaternion().setFromRotationMatrix(new Matrix4().makeBasis(x, y, z))
}

type HeadBase = { dirs: Float32Array; pos: Float32Array; nrm: Float32Array; index: number[] }
let headBase: HeadBase | null = null

function getHeadBase(): HeadBase {
  if (headBase) return headBase
  const g = weld(new SphereGeometry(1, 128, 100, -Math.PI / 2))
  const p = g.attributes.position
  const dirs = new Float32Array(p.array as Float32Array)
  const v = new Vector3()
  for (let i = 0; i < p.count; i++) {
    headMap(dirs[i * 3], dirs[i * 3 + 1], dirs[i * 3 + 2], v)
    p.setXYZ(i, v.x, v.y, v.z)
  }
  g.computeVertexNormals()
  headBase = {
    dirs,
    pos: new Float32Array(p.array as Float32Array),
    nrm: new Float32Array(g.attributes.normal.array as Float32Array),
    index: Array.from(g.index!.array),
  }
  g.dispose()
  return headBase
}

// The skin. `paint` sets each vertex colour (stubble, goatee) and returns an
// outward displacement, so painted facial hair can also have a little volume
// without a separate, hard-edged mesh.
export function headGeometry(paint?: (ux: number, uy: number, uz: number, out: Color) => number) {
  const b = getHeadBase()
  const g = new BufferGeometry()
  g.setIndex(b.index)
  const pos = b.pos.slice()
  g.setAttribute('normal', new Float32BufferAttribute(b.nrm.slice(), 3))
  if (paint) {
    const cols = new Float32Array(b.pos.length)
    const c = new Color()
    for (let i = 0; i < b.dirs.length / 3; i++) {
      const d = paint(b.dirs[i * 3], b.dirs[i * 3 + 1], b.dirs[i * 3 + 2], c)
      cols[i * 3] = c.r
      cols[i * 3 + 1] = c.g
      cols[i * 3 + 2] = c.b
      for (let k = 0; k < 3; k++) pos[i * 3 + k] += b.nrm[i * 3 + k] * d
    }
    g.setAttribute('color', new Float32BufferAttribute(cols, 3))
  }
  g.setAttribute('position', new Float32BufferAttribute(pos, 3))
  if (paint) g.computeVertexNormals()
  return g
}

// A shell over the head: each vertex pushed out by thickness(dir). Negative
// thickness sinks it under the skin, which is how hairlines and beard edges
// are cut without any boolean geometry.
export function headShell(
  thickness: (ux: number, uy: number, uz: number) => number,
  paint?: (ux: number, uy: number, uz: number, out: Color) => void,
) {
  const b = getHeadBase()
  const pos = b.pos.slice()
  const cols = paint ? new Float32Array(pos.length) : null
  const c = new Color()
  for (let i = 0; i < pos.length / 3; i++) {
    const ux = b.dirs[i * 3]
    const uy = b.dirs[i * 3 + 1]
    const uz = b.dirs[i * 3 + 2]
    const t = thickness(ux, uy, uz)
    pos[i * 3] += b.nrm[i * 3] * t
    pos[i * 3 + 1] += b.nrm[i * 3 + 1] * t
    pos[i * 3 + 2] += b.nrm[i * 3 + 2] * t
    if (cols && paint) {
      paint(ux, uy, uz, c)
      cols[i * 3] = c.r
      cols[i * 3 + 1] = c.g
      cols[i * 3 + 2] = c.b
    }
  }
  const g = new BufferGeometry()
  g.setIndex(b.index)
  g.setAttribute('position', new Float32BufferAttribute(pos, 3))
  if (cols) g.setAttribute('color', new Float32BufferAttribute(cols, 3))
  g.computeVertexNormals()
  return g
}

// ---------------------------------------------------------------------------
// Tubes, limbs and lofts

// Catmull-Rom tube whose radius follows radius(t), t in 0..1.
export function taperTube(points: Vector3[], radius: (t: number) => number, tubular = 32, radial = 8) {
  const curve = new CatmullRomCurve3(points)
  const g = new TubeGeometry(curve, tubular, 1, radial, false)
  const pos = g.attributes.position
  const c = new Vector3()
  const v = new Vector3()
  for (let i = 0; i <= tubular; i++) {
    curve.getPointAt(i / tubular, c)
    const r = radius(i / tubular)
    for (let j = 0; j <= radial; j++) {
      const k = i * (radial + 1) + j
      v.fromBufferAttribute(pos, k).sub(c).multiplyScalar(r).add(c)
      pos.setXYZ(k, v.x, v.y, v.z)
    }
  }
  g.computeVertexNormals()
  return g
}

// Tubes pinned to the face, given head-local (x, y) control points.
export function faceTube(pts: [number, number][], lift: number, radius: (t: number) => number, tubular = 28) {
  return taperTube(
    pts.map(([x, y]) => new Vector3(...headPoint(x, y, lift))),
    radius,
    tubular,
    8,
  )
}

export type Ring = {
  y: number
  // half width (x), front depth (+z), back depth (-z)
  w: number
  df: number
  db: number
  // superellipse exponent: 2 = ellipse, higher = boxier
  n?: number
  // front of the ring drops by tilt * z (crew necklines, waistbands)
  tilt?: number
  // shifts the ring forward/back
  dz?: number
}

// Lofted closed-loop surface through rings (torso, hips, sleeves).
export function loft(rings: Ring[], seg = 48, opts: { capTop?: boolean; capBottom?: boolean; bump?: (theta: number, y: number) => number } = {}) {
  const pos: number[] = []
  const index: number[] = []
  for (const r of rings) {
    const n = r.n ?? 2
    for (let j = 0; j < seg; j++) {
      const th = (j / seg) * Math.PI * 2
      const sx = Math.sin(th)
      const cz = Math.cos(th)
      let x = r.w * Math.sign(sx) * Math.pow(Math.abs(sx), 2 / n)
      let z = (cz >= 0 ? r.df : r.db) * Math.sign(cz) * Math.pow(Math.abs(cz), 2 / n)
      if (opts.bump) {
        const b = opts.bump(th, r.y)
        const l = Math.hypot(x, z) || 1
        x += (x / l) * b
        z += (z / l) * b
      }
      pos.push(x, r.y - (r.tilt ?? 0) * z, z + (r.dz ?? 0))
    }
  }
  for (let i = 0; i < rings.length - 1; i++) {
    for (let j = 0; j < seg; j++) {
      const a = i * seg + j
      const b = i * seg + ((j + 1) % seg)
      const c = (i + 1) * seg + ((j + 1) % seg)
      const d = (i + 1) * seg + j
      index.push(a, b, d, b, c, d)
    }
  }
  const cap = (ring: number, up: boolean) => {
    const r = rings[ring]
    const centre = pos.length / 3
    pos.push(0, r.y, r.dz ?? 0)
    for (let j = 0; j < seg; j++) {
      const a = ring * seg + j
      const b = ring * seg + ((j + 1) % seg)
      if (up) index.push(centre, a, b)
      else index.push(centre, b, a)
    }
  }
  if (opts.capBottom) cap(0, false)
  if (opts.capTop) cap(rings.length - 1, true)
  const g = new BufferGeometry()
  g.setIndex(index)
  g.setAttribute('position', new Float32BufferAttribute(pos, 3))
  g.computeVertexNormals()
  return g
}

// Smooth limb from a radius profile: [y, r] pairs from the top down (pivot at
// y=0), with rounded caps at both ends. Gives tapered arms/legs with real
// muscle and joint shape instead of straight tubes.
export function limbLathe(profile: [number, number][], segs = 20) {
  const pts: Vector2[] = []
  const [yb, rb] = profile[profile.length - 1]
  const [yt, rt] = profile[0]
  const q = 5
  for (let i = 0; i <= q; i++) {
    const a = -Math.PI / 2 + (i / q) * (Math.PI / 2)
    pts.push(new Vector2(Math.cos(a) * rb, yb + Math.sin(a) * rb * 0.8))
  }
  for (let i = profile.length - 2; i >= 1; i--) pts.push(new Vector2(profile[i][1], profile[i][0]))
  for (let i = 0; i <= q; i++) {
    const a = (i / q) * (Math.PI / 2)
    pts.push(new Vector2(Math.cos(a) * rt, yt + Math.sin(a) * rt * 0.8))
  }
  const g = weld(new LatheGeometry(pts, segs))
  g.computeVertexNormals()
  return g
}

// Open lathe (no caps) from [r, y] points listed bottom-up: sleeves, hems.
export function openLathe(points: [number, number][], segs = 28) {
  const g = weld(new LatheGeometry(points.map(([r, y]) => new Vector2(r, y)), segs))
  g.computeVertexNormals()
  return g
}

// Point + outward normal on the head for a unit direction (hair placement).
export function headAt(dir: Vector3) {
  const u = dir.clone().normalize()
  const p = headMap(u.x, u.y, u.z)
  const n = new Vector3(p.x / (HEAD.a * HEAD.a), p.y / (HEAD.b * HEAD.b), p.z / (HEAD.c * HEAD.c)).normalize()
  return { p, n }
}

// Soft wedge for the nose: narrow at the bridge (+Y), wider and further
// forward at the bottom, flat at the back so it sinks into the face.
// Unit-sized; scale it per axis.
export function noseGeometry() {
  const g = weld(new SphereGeometry(1, 28, 24))
  const p = g.attributes.position
  for (let i = 0; i < p.count; i++) {
    const x = p.getX(i)
    const y = p.getY(i)
    const z = p.getZ(i)
    const t = (1 - y) / 2 // 0 at the bridge, 1 at the base
    const w = 0.4 + 0.6 * Math.pow(t, 0.8)
    const d = z > 0 ? 0.16 + 0.84 * Math.pow(t, 1.4) : 0.45
    p.setXYZ(i, x * w, y, z * d)
  }
  g.computeVertexNormals()
  return g
}

// Distance from (x, y) to the segment a-b, in 2D.
export function segDist(x: number, y: number, ax: number, ay: number, bx: number, by: number) {
  const dx = bx - ax
  const dy = by - ay
  const t = clamp(((x - ax) * dx + (y - ay) * dy) / (dx * dx + dy * dy), 0, 1)
  return Math.hypot(x - ax - dx * t, y - ay - dy * t)
}

