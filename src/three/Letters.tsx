import { useMemo } from 'react'
import { useLoader } from '@react-three/fiber'
import { CuboidCollider } from '@react-three/rapier'
import { FontLoader, type Font } from 'three/examples/jsm/loaders/FontLoader.js'
import { TextGeometry } from 'three/examples/jsm/geometries/TextGeometry.js'
import { Toy } from './Toy'
import type { WorldColors } from './theme'

export const FONT_URL = `${import.meta.env.BASE_URL}fonts/helvetiker_bold.typeface.json`

type Glyph = {
  char: string
  geometry: TextGeometry
  half: [number, number, number]
}

function buildGlyphs(font: Font, text: string, size: number, depth: number): Glyph[] {
  return [...text].map((char) => {
    const geometry = new TextGeometry(char, {
      font,
      size,
      depth,
      curveSegments: 8,
      bevelEnabled: true,
      bevelThickness: size * 0.09,
      bevelSize: size * 0.055,
      bevelSegments: 5,
    })
    geometry.center()
    geometry.computeBoundingBox()
    const bb = geometry.boundingBox!
    return {
      char,
      geometry,
      half: [(bb.max.x - bb.min.x) / 2, (bb.max.y - bb.min.y) / 2, (bb.max.z - bb.min.z) / 2],
    }
  })
}

type RowProps = {
  font: Font
  text: string
  size: number
  depth: number
  gap: number
  z: number
  colors: string[]
  // Small per-letter yaw so the row looks hand-placed, not typeset.
  jitter?: number
  punch?: number
}

function LetterRow({ font, text, size, depth, gap, z, colors, jitter = 0.08, punch }: RowProps) {
  const glyphs = useMemo(() => buildGlyphs(font, text, size, depth), [font, text, size, depth])
  const layout = useMemo(() => {
    const total = glyphs.reduce((w, g) => w + g.half[0] * 2, 0) + gap * (glyphs.length - 1)
    let x = -total / 2
    return glyphs.map((g, i) => {
      const cx = x + g.half[0]
      x += g.half[0] * 2 + gap
      const yaw = (i % 2 === 0 ? 1 : -1) * jitter * (0.6 + ((i * 37) % 10) / 25)
      return { g, position: [cx, g.half[1] + 0.02, z + Math.sin(i * 1.7) * 0.12] as [number, number, number], yaw }
    })
  }, [glyphs, gap, z, jitter])

  return (
    <>
      {layout.map(({ g, position, yaw }, i) => (
        <Toy key={`${text}-${i}`} position={position} rotation={[0, yaw, 0]} punch={punch}>
          <CuboidCollider args={g.half} density={0.6} />
          <mesh geometry={g.geometry} castShadow receiveShadow>
            <meshStandardMaterial color={colors[i % colors.length]} roughness={0.38} metalness={0.02} />
          </mesh>
        </Toy>
      ))}
    </>
  )
}

export function Letters({ colors }: { colors: WorldColors }) {
  const font = useLoader(FontLoader, FONT_URL)
  const ink = colors.dark ? '#f3ecdc' : '#26221d'
  return (
    <>
      <LetterRow font={font} text="JAY" size={1.9} depth={0.75} gap={0.22} z={-2.4} colors={[colors.accent, colors.accent2, colors.accent3]} />
      <LetterRow
        font={font}
        text="PAVASIYA"
        size={0.62}
        depth={0.42}
        gap={0.26}
        z={0.5}
        jitter={0.1}
        punch={3.5}
        colors={[ink, colors.accent4, ink, colors.accent, ink, colors.accent2, ink, colors.accent3]}
      />
    </>
  )
}
