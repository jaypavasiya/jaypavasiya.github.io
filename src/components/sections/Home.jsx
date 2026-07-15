import { useRef, Suspense, useState } from 'react'
import { motion, useScroll, useTransform, useSpring } from 'framer-motion'
import { ArrowDown, Download } from 'lucide-react'

const Home = () => {
  const containerRef = useRef()
  const { scrollYProgress } = useScroll({
    target: containerRef,
    offset: ['start start', 'end start'],
  })

  const y = useSpring(useTransform(scrollYProgress, [0, 1], ['0%', '20%']), { stiffness: 100, damping: 30 })
  const opacity = useTransform(scrollYProgress, [0, 0.5], [1, 0])

  const scrollToAbout = () => {
    document.getElementById('about')?.scrollIntoView({ behavior: 'smooth' })
  }

  return (
    <section id="home" ref={containerRef} className="relative min-h-screen flex items-center justify-center">
      <motion.div style={{ y, opacity }} className="container-custom text-center py-20">
        {/* Badge */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.2 }}
          className="inline-flex items-center gap-2 px-4 py-2 mb-8 rounded-full bg-indigo-500/10 dark:bg-indigo-500/20 text-indigo-600 dark:text-indigo-400 text-sm"
        >
          <span className="w-2 h-2 rounded-full bg-green-500 animate-pulse" />
          Available for work
        </motion.div>

        {/* Name */}
        <motion.h1
          initial={{ opacity: 0, y: 30 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.3, duration: 0.6 }}
          className="text-5xl sm:text-6xl md:text-7xl font-bold tracking-tight mb-4"
        >
          Jay Pavasiya
        </motion.h1>

        {/* Title */}
        <motion.p
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.4, duration: 0.6 }}
          className="text-xl sm:text-2xl text-slate-600 dark:text-slate-400 mb-8"
        >
          Frontend Developer
        </motion.p>

        {/* Description */}
        <motion.p
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.5, duration: 0.6 }}
          className="text-base sm:text-lg text-slate-500 dark:text-slate-500 max-w-xl mx-auto mb-10"
        >
          Building beautiful, performant web applications with React, TypeScript, and modern web technologies.
        </motion.p>

        {/* Buttons */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.6, duration: 0.6 }}
          className="flex flex-wrap items-center justify-center gap-4"
        >
          <a
            href="/projects"
            className="px-6 py-3 bg-indigo-600 hover:bg-indigo-700 text-white font-medium rounded-lg transition-colors"
          >
            View Projects
          </a>
          <a
            href="/resume.pdf"
            target="_blank"
            className="px-6 py-3 border border-slate-300 dark:border-slate-600 hover:border-indigo-600 dark:hover:border-indigo-400 text-slate-700 dark:text-slate-300 font-medium rounded-lg transition-colors flex items-center gap-2"
          >
            Resume <Download size={16} />
          </a>
        </motion.div>

        {/* Stats */}
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.8 }}
          className="flex flex-wrap items-center justify-center gap-8 sm:gap-12 mt-16"
        >
          {[
            { value: '4+', label: 'Years' },
            { value: '20+', label: 'Projects' },
            { value: '16', label: 'GitHub' },
          ].map((stat, i) => (
            <div key={i} className="text-center">
              <div className="text-3xl font-bold text-slate-900 dark:text-white">{stat.value}</div>
              <div className="text-sm text-slate-500">{stat.label}</div>
            </div>
          ))}
        </motion.div>
      </motion.div>

      {/* Scroll indicator */}
      <motion.button
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ delay: 1.2 }}
        onClick={scrollToAbout}
        className="absolute bottom-8 left-1/2 -translate-x-1/2 flex flex-col items-center gap-2 text-slate-400 hover:text-slate-600 dark:hover:text-slate-300 transition-colors cursor-pointer"
      >
        <span className="text-xs uppercase tracking-widest">Scroll</span>
        <motion.div animate={{ y: [0, 6, 0] }} transition={{ duration: 1.5, repeat: Infinity }}>
          <ArrowDown size={20} />
        </motion.div>
      </motion.button>
    </section>
  )
}

export default Home
