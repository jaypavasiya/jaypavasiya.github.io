import { lazy, Suspense, useEffect } from 'react'
import { startSmoothScroll } from './lib/motion'
import { initMagnetic } from './lib/magnetic'
import { Nav } from './components/Nav'
import { Preloader } from './components/Preloader'
import { Cursor } from './components/Cursor'
import { ScrollProgress } from './components/ScrollProgress'
import { VelocityMarquee } from './components/VelocityMarquee'
import { About } from './sections/About'
import { Experience } from './sections/Experience'
import { Projects } from './sections/Projects'
import { Skills } from './sections/Skills'
import { Contact } from './sections/Contact'

// The 3D world is the heaviest chunk; everything below it renders without it.
const Hero = lazy(() => import('./sections/Hero'))

const STACK = ['React', 'TypeScript', 'Real-time UI', 'Three.js']
const OUTRO = ['Say hello', 'Let’s build', 'Something playful']

export function App() {
  useEffect(() => {
    startSmoothScroll()
    return initMagnetic()
  }, [])

  return (
    <>
      <Preloader />
      <a className="skip-link" href="#about">
        Skip the playground
      </a>
      <ScrollProgress />
      <Nav />
      <main>
        <Suspense fallback={<section id="top" style={{ height: '100svh' }} aria-busy="true" />}>
          <Hero />
        </Suspense>
        <About />
        <VelocityMarquee items={STACK} />
        <Experience />
        <Projects />
        <Skills />
        <VelocityMarquee items={OUTRO} reverse speed={50} />
        <Contact />
      </main>
      <div className="grain" aria-hidden="true" />
      <Cursor />
    </>
  )
}
