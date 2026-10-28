import { useMemo } from 'react'
import { useThree, type ThreeEvent } from '@react-three/fiber'

// Pointer cursor while hovering clickable meshes.
export function useHoverCursor() {
  const el = useThree((s) => s.gl.domElement)
  return useMemo(
    () => ({
      onPointerOver: (e: ThreeEvent<PointerEvent>) => {
        e.stopPropagation()
        el.style.cursor = 'pointer'
      },
      onPointerOut: () => {
        el.style.cursor = ''
      },
    }),
    [el],
  )
}
