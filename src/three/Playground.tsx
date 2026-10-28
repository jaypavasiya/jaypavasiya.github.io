import { Suspense, useEffect, useRef, useState, type PointerEvent as ReactPointerEvent, type RefObject } from 'react'
import { Canvas } from '@react-three/fiber'
import { PerformanceMonitor } from '@react-three/drei'
import { Scene } from './Scene'
import { input, markInteracted, onFirstInput, resetWorld, settings } from './store'
import { useWorldColors } from './theme'

const KEYMAP: Record<string, keyof typeof input.keys> = {
  KeyW: 'up',
  ArrowUp: 'up',
  KeyS: 'down',
  ArrowDown: 'down',
  KeyA: 'left',
  ArrowLeft: 'left',
  KeyD: 'right',
  ArrowRight: 'right',
}

const MAX_DPR = 1.75
const JOY_RADIUS = 56

function isTyping(el: Element | null) {
  return el instanceof HTMLElement && (el.isContentEditable || /^(INPUT|TEXTAREA|SELECT)$/.test(el.tagName))
}

function clearKeys() {
  input.keys.up = input.keys.down = input.keys.left = input.keys.right = false
}

// Keys steer while the playground has focus, or while the hero is mostly on
// screen and nothing editable has focus. Once the hero is scrolled away the
// arrow keys go back to scrolling the page.
function useKeyboard(wrap: RefObject<HTMLDivElement | null>) {
  useEffect(() => {
    const down = (e: KeyboardEvent) => {
      if (e.metaKey || e.ctrlKey || e.altKey) return
      const focused = document.activeElement === wrap.current
      const key = KEYMAP[e.code]
      if (key) {
        const canSteer = focused || (settings.visibility.current >= 0.6 && !isTyping(document.activeElement))
        if (!canSteer) return
        input.keys[key] = true
        if (e.code.startsWith('Arrow')) e.preventDefault()
        markInteracted()
        return
      }
      if (!focused) return
      if (e.code === 'Space') {
        e.preventDefault()
        input.jumpQueued = true
        markInteracted()
      } else if (e.code === 'KeyE' || e.code === 'Enter') {
        input.waveQueued = true
        markInteracted()
      }
    }
    const up = (e: KeyboardEvent) => {
      const key = KEYMAP[e.code]
      if (key) input.keys[key] = false
    }
    const onVis = () => document.hidden && clearKeys()
    window.addEventListener('keydown', down)
    window.addEventListener('keyup', up)
    window.addEventListener('blur', clearKeys)
    document.addEventListener('visibilitychange', onVis)
    return () => {
      window.removeEventListener('keydown', down)
      window.removeEventListener('keyup', up)
      window.removeEventListener('blur', clearKeys)
      document.removeEventListener('visibilitychange', onVis)
      clearKeys()
    }
  }, [wrap])
}

type Stick = { ox: number; oy: number; x: number; y: number }

// Touch: drag anywhere for a floating joystick. The wrapper is
// `touch-action: pan-y`, so a vertical swipe still scrolls the page (the
// browser cancels our pointer) while sideways drags become walking.
function useJoystick() {
  const start = useRef<{ id: number; x: number; y: number; active: boolean } | null>(null)
  const [stick, setStick] = useState<Stick | null>(null)

  const end = () => {
    start.current = null
    input.joy.active = false
    input.joy.x = input.joy.y = 0
    setStick(null)
  }

  const handlers = {
    onPointerDown: (e: ReactPointerEvent<HTMLDivElement>) => {
      if (e.pointerType === 'mouse' || start.current) return
      const r = e.currentTarget.getBoundingClientRect()
      start.current = { id: e.pointerId, x: e.clientX - r.left, y: e.clientY - r.top, active: false }
    },
    onPointerMove: (e: ReactPointerEvent<HTMLDivElement>) => {
      const s = start.current
      if (!s || s.id !== e.pointerId) return
      const r = e.currentTarget.getBoundingClientRect()
      const dx = e.clientX - r.left - s.x
      const dy = e.clientY - r.top - s.y
      const d = Math.hypot(dx, dy)
      if (!s.active && d < 12) return
      s.active = true
      markInteracted()
      const k = Math.min(1, d / JOY_RADIUS) / (d || 1)
      input.target = null
      input.joy.active = true
      input.joy.x = dx * k
      input.joy.y = dy * k
      setStick({ ox: s.x, oy: s.y, x: input.joy.x * JOY_RADIUS, y: input.joy.y * JOY_RADIUS })
    },
    onPointerUp: (e: ReactPointerEvent<HTMLDivElement>) => {
      if (start.current?.id === e.pointerId) end()
    },
    onPointerCancel: (e: ReactPointerEvent<HTMLDivElement>) => {
      if (start.current?.id === e.pointerId) end()
    },
  }
  return { stick, handlers }
}

type Props = {
  // Render + simulate only while true (hero on screen, tab visible).
  active: boolean
  reducedMotion: boolean
  // 0..1 share of the hero on screen, kept current by the parent.
  visibility: RefObject<number>
  // Bump to stack everything back up.
  resetKey: number
  label: string
  onFirstInput?: () => void
  onContextLost?: () => void
}

export default function Playground({ active, reducedMotion, visibility, resetKey, label, onFirstInput: onFirst, onContextLost }: Props) {
  const wrap = useRef<HTMLDivElement>(null)
  const colors = useWorldColors()

  settings.reducedMotion = reducedMotion
  useEffect(() => {
    settings.visibility = visibility
  }, [visibility])
  useEffect(() => (onFirst ? onFirstInput(onFirst) : undefined), [onFirst])
  useEffect(() => {
    if (resetKey > 0) resetWorld()
  }, [resetKey])

  const [dpr, setDpr] = useState(() => Math.min(window.devicePixelRatio || 1, MAX_DPR))
  useKeyboard(wrap)
  const { stick, handlers } = useJoystick()

  return (
    <div
      ref={wrap}
      className="hero__canvas"
      tabIndex={0}
      role="application"
      aria-label={label}
      aria-roledescription="3D playground"
      {...handlers}
    >
      <Canvas
        frameloop={active ? 'always' : 'never'}
        dpr={dpr}
        shadows="percentage"
        flat
        camera={{ fov: 30, near: 0.5, far: 120, position: [6, 15, 18] }}
        gl={{ antialias: true, alpha: true, powerPreference: 'high-performance' }}
        onCreated={({ gl }) => {
          gl.domElement.addEventListener('webglcontextlost', () => onContextLost?.(), { once: true })
        }}
        style={{ touchAction: 'pan-y' }}
      >
        <PerformanceMonitor
          flipflops={3}
          onDecline={() => setDpr(1)}
          onIncline={() => setDpr(Math.min(window.devicePixelRatio || 1, MAX_DPR))}
          onFallback={() => setDpr(1)}
        />
        <Suspense fallback={null}>
          <Scene colors={colors} paused={!active} />
        </Suspense>
      </Canvas>
      {stick && (
        <div className="hero__stick" style={{ left: stick.ox, top: stick.oy }} aria-hidden="true">
          <span style={{ transform: `translate(${stick.x}px, ${stick.y}px)` }} />
        </div>
      )}
    </div>
  )
}
