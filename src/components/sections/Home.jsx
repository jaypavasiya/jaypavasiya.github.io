import { useRef, Suspense, useMemo, useState, useEffect } from 'react'
import { motion, useScroll, useTransform, useSpring, useInView } from 'framer-motion'
import { Canvas, useFrame, extend } from '@react-three/fiber'
import { Float, MeshDistortMaterial, Environment, Stars } from '@react-three/drei'
import * as THREE from 'three'
import { ArrowDown, Download, Sparkles } from 'lucide-react'
import { Link } from 'react-router-dom'

// Noise texture for premium feel
const NoiseOverlay = () => (
  <div 
    className="fixed inset-0 pointer-events-none z-[9999] opacity-[0.02] dark:opacity-[0.015]"
    style={{
      backgroundImage: `url("data:image/svg+xml,%3Csvg viewBox='0 0 256 256' xmlns='http://www.w3.org/2000/svg'%3E%3Cfilter id='noise'%3E%3CfeTurbulence type='fractalNoise' baseFrequency='0.65' numOctaves='3' stitchTiles='stitch'/%3E%3C/filter%3E%3Crect width='100%25' height='100%25' filter='url(%23noise)'/%3E%3C/svg%3E")`,
      backgroundRepeat: 'repeat',
    }}
  />
)

// Enhanced 3D Scene with more impressive visuals
const Scene3D = () => {
  return (
    <div className="absolute inset-0 z-0">
      <Canvas
        camera={{ position: [0, 0, 12], fov: 50 }}
        dpr={[1, 1.5]}
        gl={{ antialias: true, alpha: true, powerPreference: 'high-performance' }}
      >
        <Suspense fallback={null}>
          {/* Lighting */}
          <ambientLight intensity={0.3} />
          <directionalLight position={[10, 10, 5]} intensity={1} color="#ffffff" />
          <pointLight position={[-10, -10, -5]} intensity={0.8} color="#6366f1" />
          <pointLight position={[10, -5, 2]} intensity={0.5} color="#818cf8" />
          <spotLight position={[0, 10, 0]} intensity={0.3} color="#a5b4fc" />
          
          {/* Starfield background */}
          <Stars radius={100} depth={50} count={3000} factor={4} saturation={0} fade speed={1} />
          
          {/* Main floating orb with glass material */}
          <FloatingGlassOrb />
          
          {/* Interactive code visualization */}
          <CodeVisualization />
          
          {/* Floating geometric shapes */}
          <GeometricShapes />
          
          {/* Particle system */}
          <ParticleField />
          
          {/* Connecting lines */}
          <ConnectionLines />
          
          <Environment preset="night" />
        </Suspense>
      </Canvas>
    </div>
  )
}

// Glass orb with refraction
const FloatingGlassOrb = () => {
  const meshRef = useRef()
  const innerRef = useRef()
  const materialRef = useRef()
  
  useFrame((state) => {
    const t = state.clock.elapsedTime
    if (meshRef.current) {
      meshRef.current.rotation.x = t * 0.1
      meshRef.current.rotation.y = t * 0.15
      meshRef.current.position.y = Math.sin(t * 0.5) * 0.2
    }
    if (innerRef.current) {
      innerRef.current.rotation.x = -t * 0.2
      innerRef.current.rotation.y = t * 0.3
    }
    if (materialRef.current) {
      materialRef.current.distort = Math.sin(t * 0.5) * 0.15 + 0.2
    }
  })

  return (
    <Float speed={1.5} rotationIntensity={0.2} floatIntensity={0.5}>
      <group position={[2, 0, -4]}>
        {/* Outer glass shell */}
        <mesh ref={meshRef}>
          <sphereGeometry args={[1.5, 64, 64]} />
          <MeshDistortMaterial
            ref={materialRef}
            color="#6366f1"
            attach="material"
            distort={0.3}
            speed={2}
            roughness={0}
            metalness={0.1}
            transparent
            opacity={0.3}
            wireframe={false}
          />
        </mesh>
        
        {/* Inner rotating mesh */}
        <mesh ref={innerRef}>
          <icosahedronGeometry args={[0.8, 1]} />
          <meshStandardMaterial
            color="#818cf8"
            wireframe
            transparent
            opacity={0.6}
          />
        </mesh>
        
        {/* Glow effect */}
        <mesh scale={1.8}>
          <sphereGeometry args={[1, 32, 32]} />
          <meshBasicMaterial
            color="#6366f1"
            transparent
            opacity={0.05}
          />
        </mesh>
      </group>
    </Float>
  )
}

// Code visualization
const CodeVisualization = () => {
  const groupRef = useRef()
  const lines = useMemo(() => {
    return Array.from({ length: 15 }, (_, i) => ({
      y: (i - 7) * 0.3,
      length: Math.random() * 2 + 1,
      delay: Math.random() * 2,
    }))
  })

  useFrame((state) => {
    if (groupRef.current) {
      groupRef.current.position.x = Math.sin(state.clock.elapsedTime * 0.3) * 0.5 - 3
      groupRef.current.position.y = Math.cos(state.clock.elapsedTime * 0.2) * 0.3 + 1
    }
  })

  return (
    <group ref={groupRef}>
      {lines.map((line, i) => (
        <motion.mesh
          key={i}
          position={[0, line.y, 0]}
          animate={{
            opacity: [0.2, 0.8, 0.2],
            scaleX: [0.8, 1, 0.8],
          }}
          transition={{
            duration: 3,
            delay: line.delay,
            repeat: Infinity,
            ease: 'easeInOut',
          }}
        >
          <boxGeometry args={[line.length, 0.02, 0.02]} />
          <meshBasicMaterial color="#6366f1" transparent opacity={0.5} />
        </motion.mesh>
      ))}
    </group>
  )
}

// Particle field with more particles
const ParticleField = () => {
  const count = 500
  const mesh = useMemo(() => {
    const temp = new Float32Array(count * 3)
    for (let i = 0; i < count * 3; i++) {
      temp[i] = (Math.random() - 0.5) * 25
    }
    return temp
  }, [])

  const pointsRef = useRef()

  useFrame((state) => {
    if (pointsRef.current) {
      pointsRef.current.rotation.y = state.clock.elapsedTime * 0.02
      pointsRef.current.rotation.x = state.clock.elapsedTime * 0.01
    }
  })

  return (
    <points ref={pointsRef}>
      <bufferGeometry>
        <bufferAttribute
          attach="attributes-position"
          count={count}
          array={mesh}
          itemSize={3}
        />
      </bufferGeometry>
      <pointsMaterial
        size={0.03}
        color="#6366f1"
        transparent
        opacity={0.8}
        sizeAttenuation
        blending={THREE.AdditiveBlending}
      />
    </points>
  )
}

// Geometric shapes
const GeometricShapes = () => {
  const shapes = [
    { position: [-4, 3, -5], scale: 0.4, speed: 1.2, type: 'octahedron' },
    { position: [4, -2, -4], scale: 0.3, speed: 1.5, type: 'tetrahedron' },
    { position: [-3, -3, -3], scale: 0.25, speed: 1.8, type: 'dodecahedron' },
    { position: [5, 3, -6], scale: 0.35, speed: 1, type: 'torus' },
    { position: [-5, 0, -7], scale: 0.2, speed: 2, type: 'icosahedron' },
  ]

  return (
    <>
      {shapes.map((shape, i) => (
        <Float key={i} speed={shape.speed} rotationIntensity={0.3} floatIntensity={0.5}>
          <mesh position={shape.position} scale={shape.scale}>
            {shape.type === 'octahedron' && <octahedronGeometry args={[1, 0]} />}
            {shape.type === 'tetrahedron' && <tetrahedronGeometry args={[1, 0]} />}
            {shape.type === 'dodecahedron' && <dodecahedronGeometry args={[1, 0]} />}
            {shape.type === 'torus' && <torusGeometry args={[0.6, 0.2, 8, 16]} />}
            {shape.type === 'icosahedron' && <icosahedronGeometry args={[0.8, 0]} />}
            <meshStandardMaterial
              color="#818cf8"
              wireframe
              transparent
              opacity={0.4}
              emissive="#6366f1"
              emissiveIntensity={0.2}
            />
          </mesh>
        </Float>
      ))}
    </>
  )
}

// Connection lines between shapes
const ConnectionLines = () => {
  const points = useMemo(() => {
    const p1 = new THREE.Vector3(2, 0, -4)
    const p2 = new THREE.Vector3(-3, 1, -5)
    const p3 = new THREE.Vector3(4, -2, -4)
    return [p1, p2, p3]
  }, [])

  const lineGeometry = useMemo(() => {
    const geometry = new THREE.BufferGeometry().setFromPoints([
      points[0],
      points[1],
      points[0],
      points[2],
    ])
    return geometry
  }, [points])

  return (
    <lineSegments geometry={lineGeometry}>
      <lineBasicMaterial color="#6366f1" transparent opacity={0.2} />
    </lineSegments>
  )
}

// Word-by-word text reveal animation
const AnimatedHeading = ({ text, className = '', delay = 0 }) => {
  const words = text.split(' ')

  return (
    <span className={`inline-flex flex-wrap justify-center ${className}`}>
      {words.map((word, i) => (
        <span key={i} className="inline-block overflow-hidden">
          <motion.span
            className="inline-block"
            initial={{ y: '100%', opacity: 0 }}
            animate={{ y: 0, opacity: 1 }}
            transition={{
              duration: 0.8,
              delay: delay + i * 0.1,
              ease: [0.215, 0.61, 0.355, 1],
            }}
          >
            {word}
          </motion.span>
          {i < words.length - 1 && '\u00A0'}
        </span>
      ))}
    </span>
  )
}

// Magnetic button component
const MagneticButton = ({ children, href, className = '', ...props }) => {
  const buttonRef = useRef(null)
  const [position, setPosition] = useState({ x: 0, y: 0 })

  const handleMouseMove = (e) => {
    if (buttonRef.current) {
      const rect = buttonRef.current.getBoundingClientRect()
      const x = (e.clientX - rect.left - rect.width / 2) * 0.3
      const y = (e.clientY - rect.top - rect.height / 2) * 0.3
      setPosition({ x, y })
    }
  }

  const handleMouseLeave = () => {
    setPosition({ x: 0, y: 0 })
  }

  return (
    <motion.a
      ref={buttonRef}
      href={href}
      className={`inline-flex items-center justify-center ${className}`}
      onMouseMove={handleMouseMove}
      onMouseLeave={handleMouseLeave}
      animate={{ x: position.x, y: position.y }}
      transition={{ type: 'spring', stiffness: 150, damping: 15 }}
      {...props}
    >
      {children}
    </motion.a>
  )
}

// Stats counter animation
const AnimatedCounter = ({ value, label, delay = 0 }) => {
  const ref = useRef(null)
  const isInView = useInView(ref, { once: true })
  
  return (
    <motion.div
      ref={ref}
      initial={{ opacity: 0, y: 20 }}
      animate={isInView ? { opacity: 1, y: 0 } : {}}
      transition={{ duration: 0.6, delay }}
      className="text-center"
    >
      <motion.div
        className="text-4xl sm:text-5xl font-bold"
        style={{
          background: 'linear-gradient(135deg, #ffffff 0%, #a5b4fc 100%)',
          WebkitBackgroundClip: 'text',
          WebkitTextFillColor: 'transparent',
        }}
        initial={{ opacity: 0 }}
        animate={isInView ? { opacity: 1 } : {}}
      >
        {value}
      </motion.div>
      <div className="text-sm text-zinc-400 mt-2 uppercase tracking-wider">{label}</div>
    </motion.div>
  )
}

const Home = () => {
  const containerRef = useRef()
  const { scrollYProgress } = useScroll({
    target: containerRef,
    offset: ['start start', 'end start'],
  })

  // Smooth spring animations
  const smoothY = useSpring(useTransform(scrollYProgress, [0, 1], ['0%', '30%']), {
    stiffness: 100,
    damping: 30,
  })
  const opacity = useTransform(scrollYProgress, [0, 0.5], [1, 0])
  const scale = useTransform(scrollYProgress, [0, 0.5], [1, 0.95])

  const scrollToAbout = () => {
    const aboutSection = document.getElementById('about')
    if (aboutSection) {
      aboutSection.scrollIntoView({ behavior: 'smooth' })
    } else {
      window.scrollTo({
        top: window.innerHeight,
        behavior: 'smooth',
      })
    }
  }

  return (
    <section
      id="home"
      ref={containerRef}
      className="relative min-h-screen flex items-center justify-center overflow-hidden"
    >
      {/* Noise overlay */}
      <NoiseOverlay />

      {/* 3D Background */}
      <Scene3D />

      {/* Gradient overlays - more subtle for dark mode */}
      <div className="absolute inset-0 bg-gradient-to-b from-black/60 via-transparent to-black/80 z-[1] dark:from-black/60 dark:via-transparent dark:to-black/80" />
      <div className="absolute inset-0 bg-gradient-to-r from-accent/5 via-transparent to-accent-light/5 z-[1]" />

      {/* Content */}
      <motion.div
        style={{ y: smoothY, opacity, scale }}
        className="relative z-10 container-custom text-center px-4"
      >
        {/* Availability badge */}
        <motion.div
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6, delay: 0.2 }}
          className="inline-flex items-center gap-2 px-5 py-2.5 mb-10 rounded-full dark:bg-dark-800/50 bg-white/10 backdrop-blur-xl border border-white/10"
        >
          <motion.span
            animate={{ scale: [1, 1.2, 1] }}
            transition={{ duration: 2, repeat: Infinity }}
            className="w-2 h-2 rounded-full bg-green-500"
          />
          <span className="text-sm text-zinc-300 dark:text-zinc-400">Available for new opportunities</span>
          <Sparkles size={14} className="text-accent" />
        </motion.div>

        {/* Main Heading */}
        <h1 className="text-5xl sm:text-6xl md:text-7xl lg:text-8xl font-bold tracking-tight mb-8 leading-[1.1]">
          <AnimatedHeading
            text="Jay Pavasiya"
            delay={0.4}
            className="block"
          />
        </h1>

        {/* Role/Title */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8, delay: 0.8 }}
          className="mb-10"
        >
          <span className="inline-flex items-center gap-3 px-6 py-3 rounded-full dark:bg-dark-800/50 bg-white/10 backdrop-blur-xl border border-white/10">
            <span className="w-1.5 h-1.5 rounded-full bg-accent" />
            <span className="text-lg sm:text-xl text-zinc-200 dark:text-zinc-300">
              Senior Frontend Engineer
            </span>
          </span>
        </motion.div>

        {/* Subtitle */}
        <motion.p
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8, delay: 1 }}
          className="text-lg sm:text-xl text-zinc-400 dark:text-zinc-500 mb-12 max-w-2xl mx-auto leading-relaxed"
        >
          Crafting exceptional digital experiences with{' '}
          <span className="text-white dark:text-zinc-100 font-semibold">React</span>,{' '}
          <span className="text-white dark:text-zinc-100 font-semibold">TypeScript</span> & modern web technologies
        </motion.p>

        {/* CTA Buttons */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8, delay: 1.2 }}
          className="flex flex-col sm:flex-row items-center justify-center gap-4 mb-20"
        >
          <MagneticButton
            href="/projects"
            className="group relative px-8 py-4 bg-accent hover:bg-accent-dark text-white font-medium rounded-full overflow-hidden transition-all duration-300"
          >
            <span className="relative z-10 flex items-center gap-3">
              View Projects
              <motion.span
                animate={{ x: [0, 5, 0] }}
                transition={{ duration: 1.5, repeat: Infinity, ease: 'easeInOut' }}
              >
                →
              </motion.span>
            </span>
            <motion.div
              className="absolute inset-0 bg-gradient-to-r from-accent to-accent-light opacity-0 group-hover:opacity-100 transition-opacity duration-300"
              initial={{ x: '-100%' }}
              whileHover={{ x: '100%' }}
              transition={{ duration: 0.6 }}
            />
          </MagneticButton>

          <MagneticButton
            href="/resume.pdf"
            target="_blank"
            rel="noopener noreferrer"
            className="group px-8 py-4 border border-zinc-600 dark:border-zinc-700 hover:border-accent text-zinc-300 dark:text-zinc-400 hover:text-white dark:hover:text-white font-medium rounded-full overflow-hidden transition-all duration-300 dark:bg-dark-800/50 bg-white/10 backdrop-blur-xl"
          >
            <span className="flex items-center gap-3">
              Download Resume
              <Download size={18} className="group-hover:translate-y-0.5 transition-transform" />
            </span>
          </MagneticButton>
        </motion.div>

        {/* Stats */}
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ duration: 0.8, delay: 1.4 }}
          className="flex flex-wrap items-center justify-center gap-8 sm:gap-16"
        >
          <AnimatedCounter value="4+" label="Years Experience" delay={1.5} />
          <AnimatedCounter value="20+" label="Projects" delay={1.6} />
          <AnimatedCounter value="5+" label="Happy Clients" delay={1.7} />
          <AnimatedCounter value="10+" label="Open Source" delay={1.8} />
        </motion.div>
      </motion.div>

      {/* Scroll Indicator - Fixed to scroll to About section */}
      <motion.button
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ delay: 2 }}
        onClick={scrollToAbout}
        className="absolute bottom-10 left-1/2 -translate-x-1/2 z-20 flex flex-col items-center gap-3 cursor-pointer group"
      >
        <span className="text-[10px] uppercase tracking-[0.3em] text-zinc-500 dark:text-zinc-600 group-hover:text-zinc-300 dark:group-hover:text-zinc-400 transition-colors">
          Scroll to explore
        </span>
        <motion.div
          animate={{ y: [0, 8, 0] }}
          transition={{ duration: 1.5, repeat: Infinity, ease: 'easeInOut' }}
          className="w-5 h-8 rounded-full border border-zinc-600 dark:border-zinc-700 flex justify-center pt-1.5"
        >
          <motion.div
            animate={{ opacity: [1, 0.3, 1], y: [0, 8, 0] }}
            transition={{ duration: 1.5, repeat: Infinity, ease: 'easeInOut' }}
            className="w-1 h-1.5 rounded-full bg-zinc-500 dark:bg-zinc-600"
          />
        </motion.div>
      </motion.button>

      {/* Ambient glow effects */}
      <div className="absolute top-1/4 -left-32 w-96 h-96 bg-accent/10 rounded-full blur-[150px] pointer-events-none" />
      <div className="absolute bottom-1/4 -right-32 w-[500px] h-[500px] bg-accent-light/5 rounded-full blur-[200px] pointer-events-none" />
    </section>
  )
}

export default Home
