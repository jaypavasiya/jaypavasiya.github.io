import { useRef, useState } from 'react'
import { motion, useScroll, useTransform, useInView } from 'framer-motion'
import { ExternalLink, Github, Star, GitFork, ArrowRight, Filter } from 'lucide-react'

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
      description: 'AI-powered marketing platform for creating, managing, and optimizing campaigns. Built with React, featuring real-time analytics, AI content generation, and multi-channel campaign management.',
      image: 'https://images.unsplash.com/photo-1551288049-bebda4e38f71?w=800&q=80',
      tech: ['React', 'TypeScript', 'Node.js', 'GraphQL', 'AWS', 'Framer Motion'],
      github: 'https://github.com/adsparkx/vibelets',
      live: 'https://vibelets.com',
      featured: true,
      stars: 45,
      forks: 12,
    },
    {
      id: 2,
      title: 'React Boilerplate',
      category: 'library',
      description: 'A production-ready React boilerplate with Redux, TypeScript, testing setup, and best practices pre-configured. Includes authentication, routing, and API integration patterns.',
      image: 'https://images.unsplash.com/photo-1633356122544-f134324a6cee?w=800&q=80',
      tech: ['React', 'Redux', 'TypeScript', 'Jest', 'Webpack'],
      github: 'https://github.com/jaypavasiya/react-boilerplate-with-redux',
      live: null,
      featured: true,
      stars: 128,
      forks: 34,
    },
    {
      id: 3,
      title: 'Chat Server',
      category: 'web',
      description: 'Real-time chat application with Socket.io, featuring instant messaging, rooms, typing indicators, and online status. Built with Node.js for scalable backend communication.',
      image: 'https://images.unsplash.com/photo-1611746872915-64382b5c76da?w=800&q=80',
      tech: ['Node.js', 'Socket.io', 'Express', 'React', 'MongoDB'],
      github: 'https://github.com/jaypavasiya/chat-server',
      live: null,
      featured: false,
      stars: 67,
      forks: 23,
    },
    {
      id: 4,
      title: 'Awesome GitHub Profiles',
      category: 'open-source',
      description: 'Curated collection of best GitHub profile READMEs. A comprehensive resource for developers looking to create impressive developer profiles.',
      image: 'https://images.unsplash.com/photo-1556075798-4825dfaaf498?w=800&q=80',
      tech: ['JavaScript', 'HTML', 'CSS', 'Markdown'],
      github: 'https://github.com/jaypavasiya/awesome-github-profile-readme-templates',
      live: null,
      featured: false,
      stars: 256,
      forks: 89,
    },
    {
      id: 5,
      title: 'Knowledge Share',
      category: 'open-source',
      description: 'Community-driven collection of "Hello World" examples in every programming language. A fun way to explore syntax across different programming languages.',
      image: 'https://images.unsplash.com/photo-1516116216624-53e697fedbea?w=800&q=80',
      tech: ['JavaScript', 'Node.js', 'GitHub Actions'],
      github: 'https://github.com/jaypavasiya/knowledge-share-multi-language',
      live: null,
      featured: false,
      stars: 89,
      forks: 45,
    },
    {
      id: 6,
      title: 'Portfolio Website',
      category: 'web',
      description: 'This very website! A modern, performant portfolio showcasing skills and projects with smooth animations, 3D elements, and excellent accessibility.',
      image: 'https://images.unsplash.com/photo-1467232004584-a241de8bcf5d?w=800&q=80',
      tech: ['React', 'Vite', 'Tailwind CSS', 'Framer Motion', 'Three.js'],
      github: 'https://github.com/jaypavasiya/jaypavasiya.github.io',
      live: 'https://jaypavasiya.dev',
      featured: true,
      stars: 15,
      forks: 5,
    },
  ]

  const filters = [
    { id: 'all', label: 'All Projects' },
    { id: 'web', label: 'Web Apps' },
    { id: 'library', label: 'Libraries' },
    { id: 'open-source', label: 'Open Source' },
  ]

  const filteredProjects = activeFilter === 'all' 
    ? projects 
    : projects.filter(p => p.category === activeFilter)

  const featuredProjects = projects.filter(p => p.featured)

  const containerVariants = {
    hidden: { opacity: 0 },
    visible: {
      opacity: 1,
      transition: {
        staggerChildren: 0.1,
      },
    },
  }

  const projectVariants = {
    hidden: { opacity: 0, y: 30 },
    visible: { opacity: 1, y: 0 },
  }

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
          <span className="text-accent font-mono text-sm tracking-wider uppercase mb-4 block">
            My Work
          </span>
          <h2 className="text-4xl sm:text-5xl lg:text-6xl font-bold tracking-tight">
            Featured
            <br />
            <span className="text-gradient">Projects</span>
          </h2>
        </motion.div>

        {/* Filter Buttons */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.6, delay: 0.2 }}
          className="flex flex-wrap justify-center gap-3 mb-12"
        >
          {filters.map((filter) => (
            <button
              key={filter.id}
              onClick={() => setActiveFilter(filter.id)}
              className={`flex items-center gap-2 px-5 py-2.5 rounded-full text-sm font-medium transition-all duration-300 ${
                activeFilter === filter.id
                  ? 'bg-accent text-white'
                  : 'bg-dark-800 text-zinc-400 hover:text-white hover:bg-dark-700'
              }`}
            >
              <Filter size={14} />
              {filter.label}
            </button>
          ))}
        </motion.div>

        {/* Featured Projects */}
        {activeFilter === 'all' && (
          <div className="mb-16">
            <h3 className="text-xl font-bold text-white mb-6 flex items-center gap-2">
              <Star size={18} className="text-accent" />
              Featured Work
            </h3>
            <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
              {featuredProjects.map((project, index) => (
                <FeaturedProjectCard key={project.id} project={project} index={index} />
              ))}
            </div>
          </div>
        )}

        {/* All Projects Grid */}
        <motion.div
          variants={containerVariants}
          initial="hidden"
          whileInView="visible"
          viewport={{ once: true }}
          className="grid md:grid-cols-2 lg:grid-cols-3 gap-6"
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
          <a
            href="https://github.com/jaypavasiya"
            target="_blank"
            rel="noopener noreferrer"
            className="group inline-flex items-center gap-3 px-8 py-4 rounded-full border border-[var(--color-border)] hover:border-accent bg-dark-800/50 hover:bg-accent/10 transition-all duration-300"
          >
            <Github size={20} />
            <span className="font-medium">View All Projects on GitHub</span>
            <ArrowRight size={18} className="group-hover:translate-x-1 transition-transform" />
          </a>
        </motion.div>
      </motion.div>

      {/* Background decoration */}
      <div className="absolute top-1/3 right-0 w-96 h-96 bg-accent/5 rounded-full blur-[150px] pointer-events-none" />
    </section>
  )
}

const FeaturedProjectCard = ({ project, index }) => {
  const ref = useRef()
  const isInView = useInView(ref, { once: true, margin: '-100px' })

  return (
    <motion.div
      ref={ref}
      initial={{ opacity: 0, y: 50 }}
      animate={isInView ? { opacity: 1, y: 0 } : {}}
      transition={{ duration: 0.6, delay: index * 0.1 }}
      className="group relative rounded-3xl overflow-hidden bg-dark-800 border border-dark-700 hover:border-accent/50 transition-all duration-500"
    >
      {/* Image */}
      <div className="relative aspect-[4/3] overflow-hidden">
        <img
          src={project.image}
          alt={project.title}
          className="w-full h-full object-cover transition-transform duration-700 group-hover:scale-110"
        />
        <div className="absolute inset-0 bg-gradient-to-t from-dark-900 via-dark-900/50 to-transparent" />
        
        {/* Overlay with links */}
        <div className="absolute inset-0 flex items-center justify-center gap-4 opacity-0 group-hover:opacity-100 transition-opacity duration-300 bg-dark-900/60 backdrop-blur-sm">
          {project.github && (
            <a
              href={project.github}
              target="_blank"
              rel="noopener noreferrer"
              className="p-3 rounded-full bg-white/10 hover:bg-white/20 transition-colors"
              aria-label="View on GitHub"
            >
              <Github size={20} />
            </a>
          )}
          {project.live && (
            <a
              href={project.live}
              target="_blank"
              rel="noopener noreferrer"
              className="p-3 rounded-full bg-white/10 hover:bg-white/20 transition-colors"
              aria-label="View live site"
            >
              <ExternalLink size={20} />
            </a>
          )}
        </div>

        {/* Featured badge */}
        <div className="absolute top-4 left-4 flex items-center gap-1.5 px-3 py-1.5 rounded-full bg-accent/90 text-white text-xs font-medium">
          <Star size={12} />
          Featured
        </div>
      </div>

      {/* Content */}
      <div className="p-6">
        <h3 className="text-xl font-bold text-white mb-2 group-hover:text-accent transition-colors">
          {project.title}
        </h3>
        <p className="text-[var(--color-text-secondary)] text-sm mb-4 line-clamp-2">
          {project.description}
        </p>
        
        {/* Tech stack */}
        <div className="flex flex-wrap gap-2 mb-4">
          {project.tech.slice(0, 4).map((tech) => (
            <span
              key={tech}
              className="px-2.5 py-1 text-xs font-medium bg-dark-700 text-zinc-400 rounded-full"
            >
              {tech}
            </span>
          ))}
          {project.tech.length > 4 && (
            <span className="px-2.5 py-1 text-xs font-medium bg-dark-700 text-zinc-500 rounded-full">
              +{project.tech.length - 4}
            </span>
          )}
        </div>

        {/* Stats */}
        <div className="flex items-center gap-4 text-sm text-[var(--color-text-secondary)]">
          <span className="flex items-center gap-1">
            <Star size={14} />
            {project.stars}
          </span>
          <span className="flex items-center gap-1">
            <GitFork size={14} />
            {project.forks}
          </span>
        </div>
      </div>
    </motion.div>
  )
}

const ProjectCard = ({ project, index }) => {
  const ref = useRef()
  const isInView = useInView(ref, { once: true, margin: '-50px' })

  return (
    <motion.div
      ref={ref}
      initial={{ opacity: 0, y: 30 }}
      animate={isInView ? { opacity: 1, y: 0 } : {}}
      transition={{ duration: 0.5, delay: index * 0.05 }}
      className="group relative rounded-2xl overflow-hidden bg-dark-800/50 border border-dark-700 hover:border-accent/50 transition-all duration-300"
    >
      {/* Image */}
      <div className="relative aspect-video overflow-hidden">
        <img
          src={project.image}
          alt={project.title}
          className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-105"
          loading="lazy"
        />
        <div className="absolute inset-0 bg-gradient-to-t from-dark-900 via-transparent to-transparent opacity-60" />
      </div>

      {/* Content */}
      <div className="p-5 -mt-16 relative">
        <h3 className="text-lg font-bold text-white mb-2 group-hover:text-accent transition-colors">
          {project.title}
        </h3>
        
        {/* Tech stack */}
        <div className="flex flex-wrap gap-1.5 mb-3">
          {project.tech.slice(0, 3).map((tech) => (
            <span
              key={tech}
              className="px-2 py-0.5 text-[10px] font-medium bg-dark-700/80 text-zinc-400 rounded-full backdrop-blur-sm"
            >
              {tech}
            </span>
          ))}
        </div>

        {/* Links */}
        <div className="flex items-center gap-3">
          {project.github && (
            <a
              href={project.github}
              target="_blank"
              rel="noopener noreferrer"
              className="flex items-center gap-1.5 text-xs text-zinc-400 hover:text-white transition-colors"
            >
              <Github size={14} />
              Code
            </a>
          )}
          {project.live && (
            <a
              href={project.live}
              target="_blank"
              rel="noopener noreferrer"
              className="flex items-center gap-1.5 text-xs text-zinc-400 hover:text-white transition-colors"
            >
              <ExternalLink size={14} />
              Live Demo
            </a>
          )}
        </div>
      </div>
    </motion.div>
  )
}

export default Projects
