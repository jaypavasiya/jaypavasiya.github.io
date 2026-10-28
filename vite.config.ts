import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'

export default defineConfig({
  plugins: [react()],
  base: '/',
  build: {
    target: 'es2022',
    // Rapier inlines its wasm, so the lazy physics chunk is big on purpose.
    // No manualChunks: letting Rolldown split keeps three/rapier out of the
    // entry so the page renders before the 3D hero has loaded.
    chunkSizeWarningLimit: 3300,
  },
})
