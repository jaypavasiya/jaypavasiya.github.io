import { useRef } from 'react'
import { motion, useScroll, useTransform, useInView } from 'framer-motion'
import { Code2, Palette, Zap, Users, Award, Globe, ArrowRight, Heart, Coffee, Laptop, Rocket } from 'lucide-react'

const About = () => {
  const containerRef = useRef()
  const imageRef = useRef()
  const isInView = useInView(imageRef, { once: true, margin: '-100px' })
  const { scrollYProgress } = useScroll({
    target: containerRef,
    offset: ['start end', 'end start'],
  })

  const y = useTransform(scrollYProgress, [0, 1], ['0%', '20%'])
  const opacity = useTransform(scrollYProgress, [0, 0.3, 0.7, 1], [0, 1, 1, 0])

  const highlights = [
    {
      icon: Code2,
      title: 'Frontend Expert',
      description: 'Building performant, accessible, and beautiful user interfaces with React, TypeScript, and modern CSS.',
      color: '#6366f1',
    },
    {
      icon: Palette,
      title: 'UI/UX Enthusiast',
      description: 'Creating intuitive user experiences with a keen eye for design, typography, and micro-interactions.',
      color: '#ec4899',
    },
    {
      icon: Zap,
      title: 'Performance Focused',
      description: 'Optimizing applications for speed, Core Web Vitals, and delivering smooth 60fps experiences.',
      color: '#f59e0b',
    },
    {
      icon: Users,
      title: 'Team Player',
      description: 'Collaborating effectively with cross-functional teams, mentoring juniors, and sharing knowledge.',
      color: '#10b981',
    },
    {
      icon: Award,
      title: 'Quality Obsessed',
      description: 'Writing clean, maintainable code with comprehensive testing and thorough documentation.',
      color: '#8b5cf6',
    },
    {
      icon: Globe,
      title: 'Open Source',
      description: 'Contributing to open source projects and building tools that benefit the developer community.',
      color: '#06b6d4',
    },
  ]

  const containerVariants = {
    hidden: { opacity: 0 },
    visible: {
      opacity: 1,
      transition: {
        staggerChildren: 0.08,
      },
    },
  }

  const itemVariants = {
    hidden: { opacity: 0, y: 30 },
    visible: { opacity: 1, y: 0 },
  }

  return (
    <section id="about" ref={containerRef} className="relative py-32 overflow-hidden">
      <motion.div style={{ y, opacity }} className="container-custom">
        {/* Section Header */}
        <motion.div
          initial={{ opacity: 0, y: 30 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.6 }}
          className="text-center mb-20"
        >
          <motion.span
            initial={{ opacity: 0, y: 10 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            className="inline-block text-accent font-mono text-sm tracking-wider uppercase mb-4"
          >
            About Me
          </motion.span>
          <h2 className="text-4xl sm:text-5xl lg:text-6xl font-bold tracking-tight">
            Crafting Digital
            <br />
            <span className="text-gradient">Excellence</span>
          </h2>
        </motion.div>

        {/* Main Content */}
        <div className="grid lg:grid-cols-2 gap-16 lg:gap-24 items-center">
          {/* Image/Visual Side */}
          <motion.div
            ref={imageRef}
            initial={{ opacity: 0, x: -50 }}
            animate={isInView ? { opacity: 1, x: 0 } : {}}
            transition={{ duration: 0.8 }}
            className="relative"
          >
            <div className="relative aspect-square max-w-md mx-auto">
              {/* Animated border */}
              <motion.div
                animate={{ rotate: 360 }}
                transition={{ duration: 20, repeat: Infinity, ease: 'linear' }}
                className="absolute inset-0 border border-dashed border-accent/30 dark:border-accent/30 rounded-3xl"
              />
              
              {/* Profile card */}
              <motion.div
                whileHover={{ scale: 1.02 }}
                transition={{ duration: 0.3 }}
                className="absolute inset-4 rounded-2xl overflow-hidden dark:bg-dark-800/80 bg-white border border-zinc-200 dark:border-white/5"
              >
                <div className="absolute inset-0 bg-gradient-to-br from-accent/5 via-transparent to-accent-light/5" />
                
                {/* Avatar placeholder */}
                <div className="absolute inset-0 flex items-center justify-center">
                  <motion.div
                    animate={{ y: [-10, 10, -10] }}
                    transition={{ duration: 4, repeat: Infinity, ease: 'easeInOut' }}
                    className="text-center"
                  >
                    <div className="text-[100px] sm:text-[120px] font-bold text-zinc-200 dark:text-white/10 mb-2">JP</div>
                    <div className="px-4 py-1.5 rounded-full bg-accent/20 text-accent text-sm font-medium">
                      Frontend Engineer
                    </div>
                  </motion.div>
                </div>

                {/* Floating badges */}
                <motion.div
                  animate={{ y: [-5, 5, -5] }}
                  transition={{ duration: 3, repeat: Infinity, ease: 'easeInOut' }}
                  className="absolute -top-3 -right-3 px-4 py-2 rounded-xl text-white text-sm font-semibold shadow-lg"
                  style={{ background: 'linear-gradient(135deg, #6366f1, #818cf8)' }}
                >
                  Open to Work
                </motion.div>
                
                <motion.div
                  animate={{ y: [5, -5, 5] }}
                  transition={{ duration: 4, repeat: Infinity, ease: 'easeInOut', delay: 0.5 }}
                  className="absolute -bottom-3 -left-3 px-4 py-2 rounded-xl dark:bg-dark-700 bg-zinc-100 text-zinc-700 dark:text-zinc-300 text-sm font-medium border border-zinc-200 dark:border-white/5"
                >
                  4+ Years Exp
                </motion.div>
              </motion.div>
            </div>

            {/* Background glow */}
            <div className="absolute -z-10 top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[150%] h-[150%] bg-gradient-radial from-accent/10 via-transparent to-transparent rounded-full blur-3xl" />
          </motion.div>

          {/* Text Content */}
          <motion.div
            initial={{ opacity: 0, x: 50 }}
            whileInView={{ opacity: 1, x: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.8, delay: 0.2 }}
            className="space-y-8"
          >
            <div className="space-y-6">
              <h3 className="text-2xl sm:text-3xl font-bold">
                <span className="text-zinc-900 dark:text-white">Hello! I'm </span>
                <span className="text-accent">Jay Pavasiya</span>
              </h3>
              <p className="text-lg text-zinc-600 dark:text-zinc-400 leading-relaxed">
                I'm a <span className="text-zinc-900 dark:text-white font-semibold">Senior Frontend Engineer</span> based in{' '}
                <span className="text-zinc-900 dark:text-white font-semibold">Gujarat, India</span>, passionate about 
                building exceptional digital experiences. With over{' '}
                <span className="text-accent font-semibold">4 years of experience</span>, I specialize 
                in creating performant, accessible, and visually stunning web applications.
              </p>
              <p className="text-lg text-zinc-600 dark:text-zinc-400 leading-relaxed">
                I have a strong foundation in <span className="text-zinc-900 dark:text-white font-medium">React</span>,{' '}
                <span className="text-zinc-900 dark:text-white font-medium">TypeScript</span>, and{' '}
                <span className="text-zinc-900 dark:text-white font-medium">Node.js</span>, with expertise in modern 
                frontend frameworks, state management, and building scalable architectures.
              </p>
              <p className="text-lg text-zinc-600 dark:text-zinc-400 leading-relaxed">
                Beyond coding, I'm passionate about <span className="text-zinc-900 dark:text-white font-medium">open source</span>, 
                contributing to projects that help developers worldwide, and continuously learning 
                new technologies to stay at the forefront of web development.
              </p>
            </div>

            {/* Quick Facts */}
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              className="grid grid-cols-2 gap-4 p-6 rounded-2xl dark:bg-dark-800/50 bg-zinc-50 border border-zinc-200 dark:border-white/5"
            >
              {[
                { label: 'Location', value: 'Gujarat, India', icon: '📍' },
                { label: 'Experience', value: '4+ Years', icon: '💼' },
                { label: 'Availability', value: 'Open to Work', icon: '✨' },
                { label: 'Remote', value: 'Available', icon: '🌍' },
              ].map((fact, index) => (
                <motion.div
                  key={index}
                  initial={{ opacity: 0, y: 10 }}
                  whileInView={{ opacity: 1, y: 0 }}
                  viewport={{ once: true }}
                  transition={{ delay: index * 0.1 }}
                  className="space-y-1"
                >
                  <div className="text-xs text-zinc-500 dark:text-zinc-500 uppercase tracking-wider">{fact.label}</div>
                  <div className="text-zinc-900 dark:text-white font-medium flex items-center gap-2">
                    <span>{fact.icon}</span>
                    {fact.value}
                  </div>
                </motion.div>
              ))}
            </motion.div>

            {/* Highlights Grid */}
            <motion.div
              variants={containerVariants}
              initial="hidden"
              whileInView="visible"
              viewport={{ once: true, margin: '-50px' }}
              className="grid sm:grid-cols-2 gap-4"
            >
              {highlights.map((item, index) => (
                <motion.div
                  key={index}
                  variants={itemVariants}
                  whileHover={{ scale: 1.02, borderColor: `${item.color}50` }}
                  className="p-5 rounded-xl dark:bg-dark-800/30 bg-zinc-50 border border-zinc-200 dark:border-white/5 transition-all duration-300 group"
                >
                  <div className="flex items-start gap-4">
                    <motion.div
                      whileHover={{ scale: 1.1, rotate: 5 }}
                      className="p-2.5 rounded-xl"
                      style={{ backgroundColor: `${item.color}20`, color: item.color }}
                    >
                      <item.icon size={20} />
                    </motion.div>
                    <div className="space-y-1">
                      <h4 className="font-semibold text-zinc-900 dark:text-white">{item.title}</h4>
                      <p className="text-sm text-zinc-500 dark:text-zinc-500 leading-relaxed">
                        {item.description}
                      </p>
                    </div>
                  </div>
                </motion.div>
              ))}
            </motion.div>

            {/* CTA */}
            <motion.div
              initial={{ opacity: 0 }}
              whileInView={{ opacity: 1 }}
              viewport={{ once: true }}
              className="pt-4 flex flex-wrap gap-4"
            >
              <motion.a
                href="/contact"
                whileHover={{ scale: 1.02 }}
                className="inline-flex items-center gap-3 px-6 py-3 rounded-xl text-white font-medium transition-all"
                style={{ background: 'linear-gradient(135deg, #6366f1, #818cf8)' }}
              >
                Let's Work Together
                <ArrowRight size={18} />
              </motion.a>
              <motion.a
                href="/experience"
                whileHover={{ scale: 1.02 }}
                className="inline-flex items-center gap-3 px-6 py-3 rounded-xl border border-zinc-300 dark:border-white/10 text-zinc-700 dark:text-zinc-300 font-medium transition-all hover:bg-zinc-100 dark:hover:bg-dark-800"
              >
                View Experience
                <Laptop size={18} />
              </motion.a>
            </motion.div>
          </motion.div>
        </div>
      </motion.div>

      {/* Background decoration */}
      <div className="absolute top-0 right-0 w-1/2 h-full bg-gradient-to-l from-accent/5 to-transparent pointer-events-none" />
    </section>
  )
}

export default About
