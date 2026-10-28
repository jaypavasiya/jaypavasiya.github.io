import { lazy, Suspense, useEffect } from 'react'
import { startSmoothScroll } from './lib/motion'
import { Nav } from './components/Nav'
import { About } from './sections/About'
import { Experience } from './sections/Experience'
import { Projects } from './sections/Projects'
import { Skills } from './sections/Skills'
import { Contact } from './sections/Contact'

// The 3D world is the heaviest chunk; everything below it renders without it.
const Hero = lazy(() => import('./sections/Hero'))

export function App() {
  useEffect(() => {
    startSmoothScroll()
  }, [])

  return (
    <>
      <a className="skip-link" href="#about">
        Skip the playground
      </a>
      <Nav />
      <main>
        <Suspense fallback={<section id="top" style={{ height: '100svh' }} aria-busy="true" />}>
          <Hero />
        </Suspense>
        <About />
        <Experience />
        <Projects />
        <Skills />
        <Contact />
      </main>
    </>
  )
}
