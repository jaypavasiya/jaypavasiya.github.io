import { Component, type ErrorInfo, type ReactNode } from 'react'

export function hasWebGL() {
  if (typeof document === 'undefined') return false
  try {
    const c = document.createElement('canvas')
    const gl = c.getContext('webgl2') || c.getContext('webgl')
    if (!gl) return false
    // Release the probe context right away; browsers cap live contexts.
    ;(gl as WebGLRenderingContext).getExtension('WEBGL_lose_context')?.loseContext()
    return true
  } catch {
    return false
  }
}

// Preloader contract: announce once, when the hero's first 3D frame has been
// painted or the static fallback is showing instead.
let heroReadySent = false
export function signalHeroReady() {
  if (heroReadySent || typeof window === 'undefined') return
  heroReadySent = true
  window.dispatchEvent(new Event('hero:ready'))
}

type Props = { fallback: ReactNode; children: ReactNode; onError?: () => void }

// Anything that blows up inside the 3D tree (no WebGL, shader compile
// failure, wasm load error) swaps in the static fallback instead.
export class CanvasErrorBoundary extends Component<Props, { failed: boolean }> {
  state = { failed: false }

  static getDerivedStateFromError() {
    return { failed: true }
  }

  componentDidCatch(error: Error, info: ErrorInfo) {
    console.warn('[hero] 3D playground disabled:', error, info.componentStack)
    this.props.onError?.()
  }

  render() {
    return this.state.failed ? this.props.fallback : this.props.children
  }
}
