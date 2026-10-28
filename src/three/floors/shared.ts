import { useRef, useState } from 'react'
import { useFrame } from '@react-three/fiber'
import { Color, Vector3, type Camera, type Object3D } from 'three'
import { input, markInteracted, player } from '../store'

export function tint(a: string, b: string, t: number) {
  return '#' + new Color(a).lerp(new Color(b), t).getHexString()
}

/**
 * True while Jay is within `radius` of (x, z). Re-renders only on change.
 * `onEnter` fires on each approach.
 */
export function useNear(x: number, z: number, radius: number, opts: { onEnter?: () => void; leave?: number; enabled?: boolean } = {}) {
  const { onEnter, leave = radius + 0.8, enabled = true } = opts
  const [near, setNear] = useState(false)
  const state = useRef(false)
  useFrame(() => {
    if (!enabled) {
      if (state.current) {
        state.current = false
        setNear(false)
      }
      return
    }
    const d = Math.hypot(player.position.x - x, player.position.z - z)
    if (!state.current && d < radius) {
      state.current = true
      setNear(true)
      onEnter?.()
    } else if (state.current && d > leave) {
      state.current = false
      setNear(false)
    }
  })
  return near
}

/** Walk Jay to a point (tap/click on a game object). */
export function walkTo(x: number, z: number, via?: [number, number][]) {
  markInteracted()
  const pts = [...(via ?? []), [x, z] as [number, number]].map(([px, pz]) => new Vector3(px, 0, pz))
  input.target = pts.shift() ?? null
  input.route = pts
}

const proj = new Vector3()
/**
 * drei <Html> positioner that keeps a sign on screen: the anchor (the
 * sign's bottom centre) never rises above `minY` px or leaves the sides.
 */
export function clampedSign(minY: number) {
  return (el: Object3D, camera: Camera, size: { width: number; height: number }) => {
    proj.setFromMatrixPosition(el.matrixWorld).project(camera)
    const pad = Math.min(150, size.width / 2 - 10)
    const x = (proj.x * 0.5 + 0.5) * size.width
    const y = (-proj.y * 0.5 + 0.5) * size.height
    return [Math.max(pad, Math.min(size.width - pad, x)), Math.max(Math.min(minY, size.height * 0.45), Math.min(size.height - 20, y))]
  }
}
