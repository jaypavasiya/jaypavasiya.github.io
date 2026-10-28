// "Floors": the game state shared by the HUD (React, via subscribe/get) and
// the 3D scene (read every frame, never re-rendering it).

export const FLOOR_COUNT = 5
// Vertical distance between floors, in world units.
export const FLOOR_GAP = 28
export const floorBase = (i: number) => i * FLOOR_GAP

export type FloorMeta = { name: string; goal: string; done: string }

export const FLOORS: FloorMeta[] = [
  { name: 'Hello', goal: 'Knock over every letter', done: 'Letters down. Hop on the lift' },
  { name: 'Journey', goal: 'Visit all six milestones', done: 'Journey walked. Hop on the lift' },
  { name: 'Work', goal: 'Push each crate onto its pad', done: 'Crates delivered. Hop on the lift' },
  { name: 'Skills', goal: 'Knock down 7 pins in 3 rolls', done: 'Strike-ish! Hop on the lift' },
  { name: 'Rooftop', goal: 'Drop a hello in the mailbox', done: 'You made it to the roof' },
]

export type Status = 'playing' | 'cleared' | 'riding' | 'finished'

export type GameState = {
  floor: number
  status: Status
  progress: number
  total: number
  // Extra HUD detail, e.g. "Roll 2/3".
  detail: string
  cleared: boolean[]
  // Bumped to remount the active floor (restart).
  epoch: number
  // Polite screen-reader announcement; `seq` makes repeats re-announce.
  announce: { text: string; seq: number }
  music: boolean
  // Floor transition: which floors are mounted during a lift ride.
  rideFrom: number
  rideTo: number
}

const SAVE_KEY = 'floors-game'
const MUSIC_KEY = 'music'

function readMusicPref() {
  try {
    return localStorage.getItem(MUSIC_KEY) !== 'off'
  } catch {
    return true
  }
}

type Saved = { floor: number; status: Status; cleared: boolean[] }

function readSaved(): Saved | null {
  try {
    const raw = sessionStorage.getItem(SAVE_KEY)
    if (!raw) return null
    const s = JSON.parse(raw) as Partial<Saved>
    const floor = Math.max(0, Math.min(FLOOR_COUNT - 1, Number(s.floor) | 0))
    const cleared = Array.from({ length: FLOOR_COUNT }, (_, i) => !!s.cleared?.[i])
    // A cleared floor comes back with its lift ready; the rooftop replays.
    const status: Status = s.status === 'cleared' && floor < FLOOR_COUNT - 1 ? 'cleared' : 'playing'
    return { floor, status, cleared }
  } catch {
    return null
  }
}

function devFloor(): number | null {
  if (!import.meta.env.DEV || typeof location === 'undefined') return null
  const v = new URLSearchParams(location.search).get('floor')
  if (!v) return null
  const n = parseInt(v, 10)
  return Number.isFinite(n) ? Math.max(0, Math.min(FLOOR_COUNT - 1, n - 1)) : null
}

function initial(): GameState {
  const saved = readSaved()
  const dev = devFloor()
  const floor = dev ?? saved?.floor ?? 0
  return {
    floor,
    status: dev == null ? (saved?.status ?? 'playing') : 'playing',
    progress: 0,
    total: 1,
    detail: '',
    cleared: dev == null && saved ? saved.cleared : Array(FLOOR_COUNT).fill(false),
    epoch: 0,
    announce: { text: '', seq: 0 },
    music: readMusicPref(),
    rideFrom: floor,
    rideTo: floor,
  }
}

let state: GameState = initial()
const listeners = new Set<() => void>()

export const getGame = () => state

export function subscribeGame(fn: () => void) {
  listeners.add(fn)
  return () => {
    listeners.delete(fn)
  }
}

function set(patch: Partial<GameState>) {
  state = { ...state, ...patch }
  listeners.forEach((fn) => fn())
}

function save() {
  try {
    const { floor, status, cleared } = state
    sessionStorage.setItem(SAVE_KEY, JSON.stringify({ floor, status: status === 'riding' ? 'playing' : status, cleared }))
  } catch {
    // Storage blocked: progress lasts for this page view only.
  }
}

export function announce(text: string) {
  set({ announce: { text, seq: state.announce.seq + 1 } })
}

export function setMusicPref(on: boolean) {
  try {
    localStorage.setItem(MUSIC_KEY, on ? 'on' : 'off')
  } catch {
    // ignore
  }
  set({ music: on })
}

// ---------- Per-frame, render-free state ----------

export type Teleport = { x: number; y: number; z: number; seq: number; faceCamera?: boolean }

export const runtime = {
  // Lift ride: 0..1 progress, and the car's current height.
  ride: { active: false, t: 0, duration: 3.6, carY: floorBase(state.floor) },
  // Player teleports are applied by the Player on its next frame.
  teleport: null as Teleport | null,
  teleportSeq: 0,
  // Camera shake amount (decays in the camera rig).
  shake: 0,
  // Set while Jay stands still on the lift so the HUD can say so.
  onLift: false,
}

export function shake(amount: number) {
  runtime.shake = Math.min(1, runtime.shake + amount)
}

// ---------- Floor geometry shared by every floor ----------

export const ISLAND_R = 8.4
// The lift dock juts out of each island on the right, towards the camera.
export const DOCK_ANGLE = 1.2
export const DOCK_DIST = ISLAND_R + 1.25
export const DOCK = { x: Math.sin(DOCK_ANGLE) * DOCK_DIST, z: Math.cos(DOCK_ANGLE) * DOCK_DIST }
export const DOCK_RADIUS = 1.45

// Where Jay appears on a floor he did not arrive at by lift.
export function floorSpawn(floor: number): [number, number, number] {
  if (floor === 0) return [2.0, 0, 3.9]
  const d = ISLAND_R - 1.8
  return [Math.sin(DOCK_ANGLE) * d, 0, Math.cos(DOCK_ANGLE) * d]
}

// Walkable area: the island disc, the dock disc and the short bridge
// between them. Replaces wall colliders, so props can still be knocked off.
const WALK_R = 7.55
const DOCK_WALK = 0.95
const BRIDGE_HALF = 0.95
const dirX = Math.sin(DOCK_ANGLE)
const dirZ = Math.cos(DOCK_ANGLE)

export function clampWalkable(x: number, z: number): [number, number] | null {
  const r = Math.hypot(x, z)
  if (r <= WALK_R) return null
  const dx = x - DOCK.x
  const dz = z - DOCK.z
  const dd = Math.hypot(dx, dz)
  if (dd <= DOCK_WALK) return null
  // Bridge: along the dock direction from inside the island to the dock.
  const along = x * dirX + z * dirZ
  const side = -x * dirZ + z * dirX
  if (along >= WALK_R - 1 && along <= DOCK_DIST && Math.abs(side) <= BRIDGE_HALF) return null

  // Outside: project onto the nearest of the three shapes.
  const cands: [number, number][] = []
  cands.push([(x / r) * WALK_R, (z / r) * WALK_R])
  cands.push([DOCK.x + (dx / (dd || 1)) * DOCK_WALK, DOCK.z + (dz / (dd || 1)) * DOCK_WALK])
  const a = Math.max(WALK_R - 1, Math.min(DOCK_DIST, along))
  const s = Math.max(-BRIDGE_HALF, Math.min(BRIDGE_HALF, side))
  cands.push([a * dirX - s * dirZ, a * dirZ + s * dirX])
  let best = cands[0]
  let bd = Infinity
  for (const c of cands) {
    const d = (c[0] - x) ** 2 + (c[1] - z) ** 2
    if (d < bd) {
      bd = d
      best = c
    }
  }
  return best
}

// ---------- Actions ----------

export function teleportTo(x: number, y: number, z: number, faceCamera = false) {
  runtime.teleportSeq += 1
  runtime.teleport = { x, y, z, seq: runtime.teleportSeq, faceCamera }
}

export function setProgress(progress: number, total: number, detail = '') {
  if (progress === state.progress && total === state.total && detail === state.detail) return
  set({ progress, total, detail })
}

export function clearFloor() {
  if (state.status !== 'playing') return
  const cleared = state.cleared.slice()
  cleared[state.floor] = true
  const last = state.floor === FLOOR_COUNT - 1
  set({ status: last ? 'finished' : 'cleared', cleared, progress: state.total })
  save()
  emit(last ? 'finished' : 'cleared')
  announce(
    last
      ? 'Rooftop reached. Game complete. Contact details are shown.'
      : `Floor ${state.floor + 1} cleared. The lift is ready: walk onto it to go up.`,
  )
}

// Listeners for one-shot game events (sound, music).
type GameEvent = 'cleared' | 'ride-start' | 'ride-end' | 'restart' | 'finished'
const eventListeners = new Set<(e: GameEvent, floor: number) => void>()
export function onGameEvent(fn: (e: GameEvent, floor: number) => void) {
  eventListeners.add(fn)
  return () => {
    eventListeners.delete(fn)
  }
}
export function emit(e: GameEvent) {
  eventListeners.forEach((fn) => fn(e, state.floor))
}

export function startRide(reducedMotion: boolean) {
  if (state.status === 'riding' || state.floor >= FLOOR_COUNT - 1) return
  const from = state.floor
  const to = from + 1
  if (reducedMotion) {
    // Cut straight to the next floor.
    runtime.ride.active = false
    runtime.ride.carY = floorBase(to)
    set({ floor: to, status: 'playing', rideFrom: to, rideTo: to, progress: 0, detail: '' })
    teleportTo(DOCK.x, floorBase(to), DOCK.z, true)
    save()
    emit('ride-end')
    announceFloor()
    return
  }
  runtime.ride.active = true
  runtime.ride.t = 0
  runtime.ride.carY = floorBase(from)
  set({ status: 'riding', rideFrom: from, rideTo: to })
  emit('ride-start')
  announce(`Lift going up to floor ${to + 1}.`)
}

export function finishRide() {
  const to = state.rideTo
  runtime.ride.active = false
  runtime.ride.carY = floorBase(to)
  set({ floor: to, status: 'playing', rideFrom: to, rideTo: to, progress: 0, detail: '' })
  save()
  emit('ride-end')
  announceFloor()
}

function announceFloor() {
  const f = FLOORS[state.floor]
  announce(`Floor ${state.floor + 1} of ${FLOOR_COUNT}, ${f.name}. Goal: ${f.goal}.`)
}

export function skipFloor(reducedMotion: boolean) {
  if (state.status === 'riding' || state.floor >= FLOOR_COUNT - 1) return
  // Pop Jay onto the lift and go.
  teleportTo(DOCK.x, floorBase(state.floor), DOCK.z, true)
  if (state.status === 'playing') set({ status: 'cleared' })
  startRide(reducedMotion)
}

export function restartFloor() {
  if (state.status === 'riding') return
  const [x, , z] = floorSpawn(state.floor)
  teleportTo(x, floorBase(state.floor), z)
  const cleared = state.cleared.slice()
  cleared[state.floor] = false
  set({ epoch: state.epoch + 1, status: 'playing', progress: 0, detail: '', cleared })
  save()
  emit('restart')
  announce(`Floor ${state.floor + 1} restarted. Goal: ${FLOORS[state.floor].goal}.`)
}

export function playAgain() {
  runtime.ride.active = false
  runtime.ride.carY = floorBase(0)
  const [x, , z] = floorSpawn(0)
  teleportTo(x, floorBase(0), z)
  set({
    floor: 0,
    status: 'playing',
    epoch: state.epoch + 1,
    progress: 0,
    detail: '',
    cleared: Array(FLOOR_COUNT).fill(false),
    rideFrom: 0,
    rideTo: 0,
  })
  save()
  emit('restart')
  announceFloor()
}

// Dev-only handle for tests.
if (import.meta.env.DEV && typeof window !== 'undefined') {
  ;(window as unknown as { __game: unknown }).__game = { getGame, runtime, clearFloor, skipFloor, playAgain, teleportTo }
}
