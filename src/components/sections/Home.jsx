import { useRef, Suspense } from 'react'
import { motion, useScroll, useTransform } from 'framer-motion'
import { Canvas, useFrame } from '@react-three/fiber'
import { Float, Text, Environment, MeshTransmissionMaterial } from '@react-three/drei'
import * as THREE from 'three'
import { ArrowDown, Download, Sparkles } from 'lucide-react'
import { Link } from 'react-router-dom'

// 3D Scene Component
const Scene3D = () => {
  return (
    <div className="absolute inset-0 z-0 opacity-60">
      <Canvas
        camera={{ position: [0, 0, 8], fov: 45 }}
        dpr={[1, 2]}
        gl={{ antialias: true, alpha: true }}
      >
        <Suspense fallback={null}>
          <ambientLight intensity={0.5} />
          <directionalLight position={[10, 10, 5]} intensity={1} />
          <pointLight position={[-10, -10, -5]} intensity={0.5} color="#6366f1" />
          
          {/* Floating Code Block */}
          <FloatingCodeBlock />
          
          {/* Floating Geometric Shapes */}
          <FloatingShapes />
          
          <Environment preset="city" />
        </Suspense>
      </Canvas>
    </div>
  )
}

// Floating Code Block
const FloatingCodeBlock = () => {
  const meshRef = useRef()
  const { scrollYProgress } = useScroll()
  
  useFrame((state) => {
    if (meshRef.current) {
      meshRef.current.rotation.x = state.clock.elapsedTime * 0.1
      meshRef.current.rotation.y = state.clock.elapsedTime * 0.15
    }
  })

  return (
    <Float speed={2} rotationIntensity={0.5} floatIntensity={0.5}>
      <mesh ref={meshRef} position={[2, 0, -2]} scale={1.5}>
        <boxGeometry args={[2, 1.2, 0.1]} />
        <MeshTransmissionMaterial
          backside
          samples={4}
          thickness={0.1}
          chromaticAberration={0.05}
          anisotropy={0.1}
          distortion={0.1}
          distortionScale={0.1}
          temporalDistortion={0.1}
          iridescence={1}
          iridescenceIOR={1}
          iridescenceThicknessRange={[0, 1400]}
          color="#6366f1"
        />
      </mesh>
      {/* Code lines */}
      <group position={[1.3, 0.1, -1.85]}>
        <Text fontSize={0.08} color="#fff" anchorX="left">
          {'const developer = {'}
        </Text>
      </group>
    </Float>
  )
}

// Floating Geometric Shapes
const FloatingShapes = () => {
  const shapes = [
    { position: [-3, 2, -3], geometry: 'torus', color: '#6366f1', speed: 1.5 },
    { position: [3, -1.5, -2], geometry: 'octahedron', color: '#818cf8', speed: 2 },
    { position: [-2, -2, -1], geometry: 'icosahedron', color: '#4f46e5', speed: 1.8 },
    { position: [1, 2.5, -4], geometry: 'torusKnot', color: '#a5b4fc', speed: 1.2 },
  ]

  return (
    <>
      {shapes.map((shape, index) => (
        <Float key={index} speed={shape.speed} rotationIntensity={0.3} floatIntensity={0.5}>
          <mesh position={shape.position}>
            {shape.geometry === 'torus' && <torusGeometry args={[0.5, 0.15, 16, 32]} />}
            {shape.geometry === 'octahedron' && <octahedronGeometry args={[0.4, 0]} />}
            {shape.geometry === 'icosahedron' && <icosahedronGeometry args={[0.35, 0]} />}
            {shape.geometry === 'torusKnot' && <torusKnotGeometry args={[0.3, 0.1, 64, 8]} />}
            <meshStandardMaterial
              color={shape.color}
              metalness={0.8}
              roughness={0.2}
              wireframe
            />
          </mesh>
        </Float>
      ))}
    </>
  )
}

// Animated Text Component
const AnimatedText = ({ children, delay = 0 }) => {
  return (
    <motion.span
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.8, delay, ease: [0.215, 0.61, 0.355, 1] }}
    >
      {children}
    </motion.span>
  )
}

const Home = () => {
  const containerRef = useRef()
  const { scrollYProgress } = useScroll({
    target: containerRef,
    offset: ['start start', 'end start'],
  })

  const y = useTransform(scrollYProgress, [0, 1], ['0%', '50%'])
  const opacity = useTransform(scrollYProgress, [0, 0.5], [1, 0])

  const scrollToContent = () => {
    window.scrollTo({
      top: window.innerHeight,
      behavior: 'smooth',
    })
  }

  return (
    <section
      id="home"
      ref={containerRef}
      className="relative min-h-screen flex items-center justify-center overflow-hidden"
    >
      {/* 3D Background */}
      <Scene3D />

      {/* Gradient Overlay */}
      <div className="absolute inset-0 bg-gradient-to-b from-transparent via-transparent to-[var(--color-bg)] z-[1]" />

      {/* Content */}
      <motion.div
        style={{ y, opacity }}
        className="relative z-10 container-custom text-center"
      >
        {/* Badge */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6, delay: 0.2 }}
          className="inline-flex items-center gap-2 px-4 py-2 mb-8 rounded-full glass"
        >
          <Sparkles size={14} className="text-accent" />
          <span className="text-sm text-zinc-400">Available for opportunities</span>
        </motion.div>

        {/* Main Heading */}
        <h1 className="text-5xl sm:text-7xl lg:text-8xl font-bold tracking-tight mb-6">
          <AnimatedText delay={0.3}>
            <span className="block">Jay</span>
          </AnimatedText>
          <AnimatedText delay={0.4}>
            <span className="block text-gradient bg-clip-text text-transparent bg-gradient-to-r from-white via-zinc-300 to-zinc-500">
              Pavasiya
            </span>
          </AnimatedText>
        </h1>

        {/* Subtitle */}
        <motion.p
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6, delay: 0.5 }}
          className="text-xl sm:text-2xl text-[var(--color-text-secondary)] mb-8 max-w-2xl mx-auto"
        >
          <span className="text-white">Senior Frontend Engineer</span>
          <br />
          Crafting exceptional digital experiences with React, TypeScript & modern web technologies
        </motion.p>

        {/* CTA Buttons */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6, delay: 0.6 }}
          className="flex flex-wrap items-center justify-center gap-4"
        >
          <Link
            to="/projects"
            className="group relative px-8 py-4 bg-accent hover:bg-accent-dark text-white font-medium rounded-full overflow-hidden transition-all duration-300"
          >
            <span className="relative z-10 flex items-center gap-2">
              View Projects
              <motion.span
                animate={{ x: [0, 4, 0] }}
                transition={{ duration: 1, repeat: Infinity }}
              >
                →
              </motion.span>
            </span>
          </Link>

          <a
            href="/resume.pdf"
            target="_blank"
            rel="noopener noreferrer"
            className="group px-8 py-4 border border-[var(--color-border)] hover:border-accent text-[var(--color-text)] font-medium rounded-full overflow-hidden transition-all duration-300 hover:bg-white/5"
          >
            <span className="flex items-center gap-2">
              Download Resume
              <Download size={16} className="group-hover:translate-y-1 transition-transform" />
            </span>
          </a>
        </motion.div>

        {/* Stats */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6, delay: 0.7 }}
          className="mt-16 flex flex-wrap items-center justify-center gap-8 sm:gap-16"
        >
          {[
            { value: '4+', label: 'Years Experience' },
            { value: '20+', label: 'Projects Delivered' },
            { value: '16', label: 'GitHub Followers' },
            { value: '10+', label: 'Open Source Contrib' },
          ].map((stat, index) => (
            <div key={index} className="text-center">
              <div className="text-3xl sm:text-4xl font-bold text-white">{stat.value}</div>
              <div className="text-sm text-[var(--color-text-secondary)] mt-1">{stat.label}</div>
            </div>
          ))}
        </motion.div>
      </motion.div>

      {/* Scroll Indicator */}
      <motion.button
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ delay: 1 }}
        onClick={scrollToContent}
        className="absolute bottom-8 left-1/2 -translate-x-1/2 z-20 flex flex-col items-center gap-2 text-zinc-500 hover:text-white transition-colors cursor-pointer"
      >
        <span className="text-xs uppercase tracking-widest">Scroll</span>
        <motion.div
          animate={{ y: [0, 8, 0] }}
          transition={{ duration: 1.5, repeat: Infinity }}
        >
          <ArrowDown size={20} />
        </motion.div>
      </motion.button>

      {/* Decorative Elements */}
      <div className="absolute top-20 left-10 w-72 h-72 bg-accent/20 rounded-full blur-[100px] pointer-events-none" />
      <div className="absolute bottom-20 right-10 w-96 h-96 bg-accent-light/10 rounded-full blur-[120px] pointer-events-none" />
    </section>
  )
}

export default Home
