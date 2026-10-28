import { Vector3 } from 'three'
import type { RapierRigidBody } from '@react-three/rapier'
import { interactionGroups } from '@react-three/rapier'

// Mutable, render-free state shared between the DOM overlay, input handlers
// and the R3F scene. Nothing here triggers React renders; useFrame reads it.

// Collision groups: walls only stop the player, so letters and props can be
// knocked off the island (they respawn from the sky).
const G_PLAYER = 0
const G_PROP = 1
const G_WALL = 2
const G_GROUND = 3
export const groups = {
  player: interactionGroups(G_PLAYER, [G_PROP, G_WALL, G_GROUND]),
  prop: interactionGroups(G_PROP, [G_PLAYER, G_PROP, G_GROUND]),
  wall: interactionGroups(G_WALL, [G_PLAYER]),
  ground: interactionGroups(G_GROUND, [G_PLAYER, G_PROP]),
}

export const ISLAND_RADIUS = 8.4

export const input = {
  keys: { up: false, down: false, left: false, right: false },
  // Virtual joystick, screen space, each axis in -1..1 (y down = toward camera).
  joy: { x: 0, y: 0, active: false },
  // Tap / click-to-walk destination on the island.
  target: null as Vector3 | null,
  jumpQueued: false,
  waveQueued: false,
}

export const settings = {
  reducedMotion: false,
  // 0..1, how much of the hero is on screen (written by Hero's observer).
  visibility: { current: 1 } as { current: number },
}

export const player = {
  position: new Vector3(0, 1, 3.6),
}

// One-shot "the visitor did something" signal, used to fade the controls hint.
let firstInputFired = false
const firstInputListeners = new Set<() => void>()
export function markInteracted() {
  if (firstInputFired) return
  firstInputFired = true
  firstInputListeners.forEach((fn) => fn())
}
export function onFirstInput(fn: () => void) {
  if (firstInputFired) {
    fn()
    return () => {}
  }
  firstInputListeners.add(fn)
  return () => {
    firstInputListeners.delete(fn)
  }
}

export type Resettable = {
  body: RapierRigidBody
  position: [number, number, number]
  rotation: [number, number, number, number]
  // Loose bodies get scroll kicks and respawn when they fall off the island.
  loose: boolean
}

export const bodies = new Set<Resettable>()

export function placeBody(r: Resettable, dropFrom = 0) {
  const [x, y, z] = r.position
  const [qx, qy, qz, qw] = r.rotation
  r.body.setTranslation({ x, y: y + dropFrom, z }, true)
  r.body.setRotation({ x: qx, y: qy, z: qz, w: qw }, true)
  r.body.setLinvel({ x: 0, y: 0, z: 0 }, true)
  r.body.setAngvel({ x: 0, y: 0, z: 0 }, true)
}

export function resetWorld() {
  input.target = null
  bodies.forEach((r) => placeBody(r))
}
