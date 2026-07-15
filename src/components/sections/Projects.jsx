import { useRef, useState } from 'react'
import { motion, useScroll, useTransform, useInView } from 'framer-motion'
import { ExternalLink, Github, Star, GitFork, ArrowRight, Filter, Layers, Zap, Code } from 'lucide-react'

const Projects = () => {
  const containerRef = useRef()
  const [activeFilter, setActiveFilter] = useState('all')
  
  const { scrollYProgress } = useScroll({
    target: containerRef,
    offset: ['start end', 'end start'],
  })

  const y = useTransform(scrollYProgress, [0, 1], ['0%', '10%'])

  const projects = [
    {
      id: 1,
      title: 'Vibelets AI Platform',
      category: 'web',
      tagline: 'AI-Powered Marketing Revolution',
      description: 'Leading the frontend development of an AI-powered marketing platform. Building scalable React applications, implementing complex UI animations, and optimizing performance for enterprise clients.',
      problem: 'Marketing teams struggled with fragmented tools, slow campaign creation, and lack of AI integration for content generation.',
      solution: 'Built a unified platform with AI content generation, real-time analytics, and multi-channel campaign management.',
      image: 'https://images.unsplash.com/photo-1551288049-bebda4e38f71?w=1200&q=80',
      tech: ['React', 'TypeScript', 'Node.js', 'GraphQL', 'AWS', 'Framer Motion'],
      github: 'https://github.com/adsparkx/vibelets',
      live: 'https://vibelets.com',
      featured: true,
      stars: 45,
      forks: 12,
      metrics: { users: '1000+', performance: '+40%', reduction: '-40%' },
    },
    {
      id: 2,
      title: 'React Boilerplate',
      category: 'library',
      tagline: 'Production-Ready React Starter',
      description: 'A comprehensive React boilerplate with Redux, TypeScript, testing setup, and best practices pre-configured for rapid development.',
      problem: 'Developers spend too much time setting up project infrastructure instead of building features.',
      solution: 'Created a battle-tested boilerplate with authentication, routing, API patterns, and comprehensive documentation.',
      image: 'https://images.unsplash.com/photo-1633356122544-f134324a6cee?w=1200&q=80',
      tech: ['React', 'Redux', 'TypeScript', 'Jest', 'Webpack'],
      github: 'https://github.com/jaypavasiya/react-boilerplate-with-redux',
      live: null,
      featured: true,
      stars: 128,
      forks: 34,
      metrics: { downloads: '2K+', satisfaction: '98%', time: '-60%' },
    },
    {
      id: 3,
      title: 'Chat Server',
      category: 'web',
      tagline: 'Real-Time Communication',
      description: 'Real-time chat application with Socket.io, featuring instant messaging, rooms, typing indicators, and online status.',
      problem: 'Existing chat solutions were either too complex or lacked real-time features.',
      solution: 'Built a lightweight, scalable chat server with WebSocket for instant communication.',
      image: 'https://images.unsplash.com/photo-1611746872915-64382b5c76da?w=1200&q=80',
      tech: ['Node.js', 'Socket.io', 'Express', 'React', 'MongoDB'],
      github: 'https://github.com/jaypavasiya/chat-server',
      live: null,
      featured: false,
      stars: 67,
      forks: 23,
      metrics: { messages: '1M+', uptime: '99.9%', latency: '<50ms' },
    },
    {
      id: 4,
      title: 'Portfolio Website',
      category: 'web',
      tagline: 'This Very Website',
      description: 'A modern, performant portfolio showcasing skills and projects with smooth animations, 3D elements, and excellent accessibility.',
      problem: 'Standing out as a developer requires more than just listing skills.',
      solution: 'Created an immersive experience with 3D elements, premium animations, and thoughtful UX.',
      image: 'https://images.unsplash.com/photo-1467232004584-a241de8bcf5d?w=1200&q=80',
      tech: ['React', 'Vite', 'Tailwind CSS', 'Framer Motion', 'Three.js'],
      github: 'https://github.com/jaypavasiya/jaypavasiya.github.io',
      live: 'https://jaypavasiya.dev',
      featured: true,
      stars: 15,
      forks: 5,
      metrics: { performance: '95+', lighthouse: '100', bundle: '~150KB' },
    },
  ]

  const filters = [
    { id: 'all', label: 'All', icon: Layers },
    { id: 'web', label: 'Web Apps', icon: Zap },
    { id: 'library', label: 'Libraries', icon: Code },
  ]

  const filteredProjects = activeFilter === 'all' 
    ? projects 
    : projects.filter(p => p.category === activeFilter)

  const featuredProjects = projects.filter(p => p.featured)

  return (
    <section id="projects" ref={containerRef} className="relative py-32 overflow-hidden">
      <motion.div style={{ y }} className="container-custom">
        {/* Section Header */}
        <motion.div
          initial={{ opacity: 0, y: 30 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.6 }}
          className="text-center mb-16"
        >
          <span className="inline-block text-accent font-mono text-sm tracking-wider uppercase mb-4">
            My Work
          </span>
          <h2 className="text-4xl sm:text-5xl lg:text-6xl font-bold tracking-tight mb-6">
            Featured
            <br />
            <span className="text-gradient">Projects</span>
          </h2>
          <p className="text-lg text-zinc-400 max-w-2xl mx-auto">
            A selection of projects that showcase my expertise in building scalable, 
            performant, and beautiful web applications.
          </p>
        </motion.div>

        {/* Filter Buttons */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          className="flex flex-wrap justify-center gap-3 mb-12"
        >
          {filters.map((filter) => (
            <motion.button
              key={filter.id}
              onClick={() => setActiveFilter(filter.id)}
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
              className={`flex items-center gap-2 px-5 py-2.5 rounded-xl text-sm font-medium transition-all duration-300 ${
                activeFilter === filter.id
                  ? 'bg-accent text-white'
                  : 'bg-dark-800/50 text-zinc-400 hover:text-white hover:bg-dark-700/50 border border-white/5'
              }`}
            >
              <filter.icon size={16} />
              {filter.label}
            </motion.button>
          ))}
        </motion.div>

        {/* Featured Projects - Case Study Style */}
        {activeFilter === 'all' && (
          <div className="mb-16 space-y-8">
            {featuredProjects.slice(0, 2).map((project, index) => (
              <FeaturedProjectCase key={project.id} project={project} index={index} />
            ))}
          </div>
        )}

        {/* All Projects Grid */}
        <motion.div
          initial="hidden"
          whileInView="visible"
          viewport={{ once: true }}
          className="grid md:grid-cols-2 gap-6"
        >
          {filteredProjects.map((project, index) => (
            <ProjectCard key={project.id} project={project} index={index} />
          ))}
        </motion.div>

        {/* GitHub CTA */}
        <motion.div
          initial={{ opacity: 0, y: 30 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.6 }}
          className="mt-16 text-center"
        >
          <motion.a
            href="https://github.com/jaypavasiya"
            target="_blank"
            rel="noopener noreferrer"
            whileHover={{ scale: 1.02 }}
            className="group inline-flex items-center gap-3 px-8 py-4 rounded-2xl border border-white/10 hover:border-accent/50 bg-dark-800/50 hover:bg-accent/10 transition-all duration-300"
          >
            <Github size={20} />
            <span className="font-medium">View All Projects on GitHub</span>
            <ArrowRight size={18} className="group-hover:translate-x-1 transition-transform" />
          </motion.a>
        </motion.div>
      </motion.div>

      {/* Background decoration */}
      <div className="absolute top-1/3 right-0 w-96 h-96 bg-accent/5 rounded-full blur-[150px] pointer-events-none" />
      <div className="absolute bottom-1/4 left-0 w-96 h-96 bg-accent-light/5 rounded-full blur-[150px] pointer-events-none" />
    </section>
  )
}

// Featured Case Study Component
const FeaturedProjectCase = ({ project, index }) => {
  const ref = useRef()
  const isInView = useInView(ref, { once: true, margin: '-100px' })

  return (
    <motion.div
      ref={ref}
      initial={{ opacity: 0, y: 50 }}
      animate={isInView ? { opacity: 1, y: 0 } : {}}
      transition={{ duration: 0.8 }}
      className="group relative rounded-3xl overflow-hidden"
    >
      <div className="grid lg:grid-cols-2 gap-0 rounded-3xl bg-dark-800/50 border border-white/5 overflow-hidden">
        {/* Content */}
        <div className="p-8 lg:p-12 flex flex-col justify-center order-2 lg:order-1">
          <div className="flex items-center gap-2 text-accent mb-4">
            <Star size={14} />
            <span className="text-xs font-medium uppercase tracking-wider">Featured Project</span>
          </div>
          
          <h3 className="text-3xl lg:text-4xl font-bold text-white mb-3 group-hover:text-accent transition-colors">
            {project.title}
          </h3>
          
          <p className="text-lg text-accent-light mb-6">{project.tagline}</p>
          
          <p className="text-zinc-400 mb-6 leading-relaxed">
            {project.description}
          </p>

          {/* Problem/Solution */}
          <div className="space-y-4 mb-8">
            <div className="p-4 rounded-xl bg-white/5">
              <div className="text-xs text-zinc-500 uppercase tracking-wider mb-2">The Problem</div>
              <p className="text-sm text-zinc-400">{project.problem}</p>
            </div>
            <div className="p-4 rounded-xl bg-accent/10 border border-accent/20">
              <div className="text-xs text-accent uppercase tracking-wider mb-2">The Solution</div>
              <p className="text-sm text-zinc-300">{project.solution}</p>
            </div>
          </div>

          {/* Tech stack */}
          <div className="flex flex-wrap gap-2 mb-8">
            {project.tech.map((tech) => (
              <span
                key={tech}
                className="px-3 py-1 text-xs font-medium bg-white/5 text-zinc-400 rounded-full"
              >
                {tech}
              </span>
            ))}
          </div>

          {/* Links */}
          <div className="flex items-center gap-4">
            {project.github && (
              <motion.a
                href={project.github}
                target="_blank"
                rel="noopener noreferrer"
                whileHover={{ scale: 1.05 }}
                className="flex items-center gap-2 px-5 py-2.5 rounded-xl bg-white/5 hover:bg-white/10 text-zinc-400 hover:text-white transition-all"
              >
                <Github size={18} />
                <span className="text-sm font-medium">View Code</span>
              </motion.a>
            )}
            {project.live && (
              <motion.a
                href={project.live}
                target="_blank"
                rel="noopener noreferrer"
                whileHover={{ scale: 1.05 }}
                className="flex items-center gap-2 px-5 py-2.5 rounded-xl bg-accent hover:bg-accent-dark text-white transition-all"
              >
                <ExternalLink size={18} />
                <span className="text-sm font-medium">Live Demo</span>
              </motion.a>
            )}
          </div>
        </div>

        {/* Image */}
        <div className="relative order-1 lg:order-2 overflow-hidden">
          <motion.div
            className="absolute inset-0 bg-gradient-to-br from-accent/20 to-accent-light/10"
          />
          <motion.img
            whileHover={{ scale: 1.05 }}
            transition={{ duration: 0.6 }}
            src={project.image}
            alt={project.title}
            className="w-full h-full object-cover mix-blend-luminosity opacity-80"
          />
          
          {/* Stats overlay */}
          <div className="absolute bottom-0 left-0 right-0 p-6 bg-gradient-to-t from-dark-900 to-transparent">
            <div className="flex gap-6">
              {Object.entries(project.metrics).map(([key, value]) => (
                <div key={key}>
                  <div className="text-2xl font-bold text-white">{value}</div>
                  <div className="text-xs text-zinc-500 uppercase">{key}</div>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>
    </motion.div>
  )
}

// Project Card Component
const ProjectCard = ({ project, index }) => {
  const ref = useRef()
  const isInView = useInView(ref, { once: true, margin: '-50px' })

  return (
    <motion.div
      ref={ref}
      initial={{ opacity: 0, y: 30 }}
      animate={isInView ? { opacity: 1, y: 0 } : {}}
      transition={{ duration: 0.5, delay: index * 0.1 }}
      className="group relative rounded-2xl overflow-hidden bg-dark-800/50 border border-white/5 hover:border-accent/30 transition-all duration-300"
    >
      {/* Image */}
      <div className="relative aspect-video overflow-hidden">
        <img
          src={project.image}
          alt={project.title}
          className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-105"
          loading="lazy"
        />
        <div className="absolute inset-0 bg-gradient-to-t from-dark-900 via-dark-900/50 to-transparent opacity-80" />
      </div>

      {/* Content */}
      <div className="p-6 -mt-16 relative">
        <h3 className="text-xl font-bold text-white mb-2 group-hover:text-accent transition-colors">
          {project.title}
        </h3>
        
        <p className="text-sm text-zinc-400 mb-4 line-clamp-2">
          {project.tagline}
        </p>
        
        {/* Tech stack */}
        <div className="flex flex-wrap gap-1.5 mb-4">
          {project.tech.slice(0, 3).map((tech) => (
            <span
              key={tech}
              className="px-2 py-0.5 text-[10px] font-medium bg-white/5 text-zinc-500 rounded-full"
            >
              {tech}
            </span>
          ))}
        </div>

        {/* Stats */}
        <div className="flex items-center gap-4 text-xs text-zinc-500">
          <span className="flex items-center gap-1">
            <Star size={12} />
            {project.stars}
          </span>
          <span className="flex items-center gap-1">
            <GitFork size={12} />
            {project.forks}
          </span>
        </div>
      </div>
    </motion.div>
  )
}

export default Projects
