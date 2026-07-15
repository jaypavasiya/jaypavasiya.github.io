import { useRef } from 'react'
import { motion, useScroll, useTransform, useInView } from 'framer-motion'
import { Code2, Palette, Zap, Users, Award, Globe } from 'lucide-react'

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
    },
    {
      icon: Palette,
      title: 'UI/UX Enthusiast',
      description: 'Creating intuitive user experiences with a keen eye for design, typography, and micro-interactions.',
    },
    {
      icon: Zap,
      title: 'Performance Focused',
      description: 'Optimizing applications for speed, Core Web Vitals, and delivering smooth 60fps experiences.',
    },
    {
      icon: Users,
      title: 'Team Player',
      description: 'Collaborating effectively with cross-functional teams, mentoring juniors, and sharing knowledge.',
    },
    {
      icon: Award,
      title: 'Quality Obsessed',
      description: 'Writing clean, maintainable code with comprehensive testing and thorough documentation.',
    },
    {
      icon: Globe,
      title: 'Open Source',
      description: 'Contributing to open source projects and building tools that benefit the developer community.',
    },
  ]

  const containerVariants = {
    hidden: { opacity: 0 },
    visible: {
      opacity: 1,
      transition: {
        staggerChildren: 0.1,
      },
    },
  }

  const itemVariants = {
    hidden: { opacity: 0, y: 20 },
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
          <span className="text-accent font-mono text-sm tracking-wider uppercase mb-4 block">
            About Me
          </span>
          <h2 className="text-4xl sm:text-5xl lg:text-6xl font-bold tracking-tight">
            Crafting Digital
            <br />
            <span className="text-gradient">Excellence</span>
          </h2>
        </motion.div>

        {/* Main Content */}
        <div className="grid lg:grid-cols-2 gap-16 items-center">
          {/* Image/Visual Side */}
          <motion.div
            ref={imageRef}
            initial={{ opacity: 0, x: -50 }}
            animate={isInView ? { opacity: 1, x: 0 } : {}}
            transition={{ duration: 0.8, ease: [0.215, 0.61, 0.355, 1] }}
            className="relative"
          >
            <div className="relative aspect-square max-w-md mx-auto">
              {/* Decorative frame */}
              <div className="absolute inset-4 border border-accent/30 rounded-3xl" />
              <div className="absolute inset-0 bg-gradient-to-br from-accent/20 to-transparent rounded-3xl" />
              
              {/* Profile visual */}
              <div className="absolute inset-8 bg-dark-800 rounded-2xl overflow-hidden">
                <div className="absolute inset-0 bg-gradient-to-br from-accent/10 via-transparent to-accent-dark/10" />
                <div className="absolute inset-0 flex items-center justify-center">
                  <div className="text-center">
                    <div className="text-8xl font-bold text-white/20 mb-2">JP</div>
                    <div className="text-sm text-zinc-500">Frontend Engineer</div>
                  </div>
                </div>
                
                {/* Floating badges */}
                <motion.div
                  animate={{ y: [-5, 5, -5] }}
                  transition={{ duration: 3, repeat: Infinity, ease: 'easeInOut' }}
                  className="absolute -top-4 -right-4 px-3 py-1.5 bg-accent text-white text-xs font-medium rounded-full"
                >
                  Open to work
                </motion.div>
                <motion.div
                  animate={{ y: [5, -5, 5] }}
                  transition={{ duration: 4, repeat: Infinity, ease: 'easeInOut' }}
                  className="absolute -bottom-4 -left-4 px-3 py-1.5 bg-dark-700 text-zinc-300 text-xs font-medium rounded-full"
                >
                  React Expert
                </motion.div>
              </div>
            </div>

            {/* Background decoration */}
            <div className="absolute -z-10 top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[120%] h-[120%] bg-gradient-to-r from-accent/5 via-transparent to-accent-light/5 rounded-full blur-3xl" />
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
              <h3 className="text-2xl sm:text-3xl font-semibold text-white">
                Hello! I'm Jay Pavasiya
              </h3>
              <p className="text-lg text-[var(--color-text-secondary)] leading-relaxed">
                I'm a <span className="text-white font-medium">Senior Frontend Engineer</span> based in{' '}
                <span className="text-white font-medium">Gujarat, India</span>, passionate about 
                building exceptional digital experiences. With over{' '}
                <span className="text-accent font-medium">4 years of experience</span>, I specialize 
                in creating performant, accessible, and visually stunning web applications.
              </p>
              <p className="text-lg text-[var(--color-text-secondary)] leading-relaxed">
                I have a strong foundation in <span className="text-white font-medium">React</span>,{' '}
                <span className="text-white font-medium">TypeScript</span>, and{' '}
                <span className="text-white font-medium">Node.js</span>, with expertise in modern 
                frontend frameworks, state management, and building scalable architectures.
              </p>
              <p className="text-lg text-[var(--color-text-secondary)] leading-relaxed">
                Beyond coding, I'm passionate about <span className="text-white font-medium">open source</span>, 
                contributing to projects that help developers worldwide, and continuously learning 
                new technologies to stay at the forefront of web development.
              </p>
            </div>

            {/* Quick Facts */}
            <div className="grid grid-cols-2 gap-4 p-6 rounded-2xl bg-dark-800/50 border border-dark-700">
              {[
                { label: 'Location', value: 'Gujarat, India' },
                { label: 'Experience', value: '4+ Years' },
                { label: 'Availability', value: 'Open to Work' },
                { label: 'Remote', value: 'Available' },
              ].map((fact, index) => (
                <div key={index} className="space-y-1">
                  <div className="text-xs text-[var(--color-text-secondary)] uppercase tracking-wider">
                    {fact.label}
                  </div>
                  <div className="text-white font-medium">{fact.value}</div>
                </div>
              ))}
            </div>

            {/* Highlights Grid */}
            <motion.div
              variants={containerVariants}
              initial="hidden"
              whileInView="visible"
              viewport={{ once: true }}
              className="grid sm:grid-cols-2 gap-4"
            >
              {highlights.map((item, index) => (
                <motion.div
                  key={index}
                  variants={itemVariants}
                  className="group p-5 rounded-xl bg-dark-800/30 border border-dark-700 hover:border-accent/50 transition-all duration-300"
                >
                  <div className="flex items-start gap-4">
                    <div className="p-2.5 rounded-lg bg-accent/10 text-accent group-hover:bg-accent/20 transition-colors">
                      <item.icon size={20} />
                    </div>
                    <div className="space-y-1">
                      <h4 className="font-medium text-white">{item.title}</h4>
                      <p className="text-sm text-[var(--color-text-secondary)]">
                        {item.description}
                      </p>
                    </div>
                  </div>
                </motion.div>
              ))}
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
