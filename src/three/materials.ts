import { DoubleSide, FrontSide, MeshStandardMaterial, type Texture } from 'three'

// Shared, cached materials: every floor asks for the same few colours, so
// they compile once and are reused across floors and remounts. Never mutate
// a material returned from here; make a local one for anything animated.

type Opts = {
  flat?: boolean
  metalness?: number
  emissive?: string
  emissiveIntensity?: number
  opacity?: number
  map?: Texture
  double?: boolean
  transparent?: boolean
}

const cache = new Map<string, MeshStandardMaterial>()

export function mat(color: string, roughness = 0.6, o: Opts = {}) {
  const key = `${color}|${roughness}|${o.flat ? 1 : 0}|${o.metalness ?? 0}|${o.emissive ?? ''}|${o.emissiveIntensity ?? 0}|${o.opacity ?? 1}|${o.map?.uuid ?? ''}|${o.double ? 1 : 0}|${o.transparent ? 1 : 0}`
  let m = cache.get(key)
  if (!m) {
    m = new MeshStandardMaterial({
      color,
      roughness,
      metalness: o.metalness ?? 0,
      flatShading: !!o.flat,
      emissive: o.emissive ?? '#000000',
      emissiveIntensity: o.emissiveIntensity ?? 0,
      transparent: (o.opacity ?? 1) < 1 || !!o.transparent,
      opacity: o.opacity ?? 1,
      map: o.map ?? null,
      side: o.double ? DoubleSide : FrontSide,
    })
    cache.set(key, m)
  }
  return m
}
