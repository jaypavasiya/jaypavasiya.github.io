import { useRef, useState } from 'react'
import { motion, useScroll, useTransform, useInView } from 'framer-motion'
import { ExternalLink, Github, Star, GitFork, ArrowRight, Filter, Layers, Zap, Code, Smartphone, Globe, ShoppingCart, Bot, Megaphone, BarChart3 } from 'lucide-react'

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
      tagline: 'AI-Powered Marketing Automation',
      description: 'Leading the frontend development of an AI-powered marketing platform. Building scalable React applications, implementing complex UI animations, and optimizing performance for enterprise clients.',
      problem: 'Marketing teams struggled with fragmented tools, slow campaign creation, and lack of AI integration for content generation.',
      solution: 'Built a unified platform with AI content generation, real-time analytics, multi-channel campaign management, and automated optimization.',
      image: 'https://images.unsplash.com/photo-1551288049-bebda4e38f71?w=1200&q=80',
      tech: ['React', 'TypeScript', 'Node.js', 'GraphQL', 'AWS', 'Framer Motion'],
      github: 'https://github.com/adsparkx/vibelets',
      live: 'https://vibelets.com',
      featured: true,
      stars: 45,
      forks: 12,
      metrics: { users: '1000+', performance: '+40%', reduction: '-40%' },
      icon: Bot,
      color: '#6366f1',
    },
    {
      id: 2,
      title: 'E-Commerce Dashboard',
      category: 'web',
      tagline: 'Enterprise Analytics Platform',
      description: 'A comprehensive analytics dashboard for e-commerce businesses. Features real-time sales tracking, inventory management, and customer insights.',
      problem: 'E-commerce businesses needed a unified view of their operations across multiple marketplaces.',
      solution: 'Created an intuitive dashboard with real-time data visualization, predictive analytics, and automated reporting.',
      image: 'https://images.unsplash.com/photo-1460925895917-afdab827c52f?w=1200&q=80',
      tech: ['React', 'Redux', 'D3.js', 'Node.js', 'PostgreSQL'],
      github: null,
      live: null,
      featured: true,
      stars: 0,
      forks: 0,
      metrics: { insights: '50+', reports: '100+', accuracy: '98%' },
      icon: BarChart3,
      color: '#10b981',
    },
    {
      id: 3,
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
      icon: Code,
      color: '#f59e0b',
    },
    {
      id: 4,
      title: 'Mobile Banking App',
      category: 'mobile',
      tagline: 'Digital Banking Experience',
      description: 'A modern mobile banking application with seamless user experience, biometric authentication, and real-time transaction monitoring.',
      problem: 'Traditional banking apps were clunky and lacked modern UX patterns.',
      solution: 'Built a sleek mobile-first banking experience with smooth animations and intuitive navigation.',
      image: 'https://images.unsplash.com/photo-1563986768609-322da13575f3?w=1200&q=80',
      tech: ['React Native', 'TypeScript', 'Redux', 'Node.js'],
      github: null,
      live: null,
      featured: false,
      stars: 0,
      forks: 0,
      metrics: { rating: '4.8', users: '10K+', uptime: '99.9%' },
      icon: Smartphone,
      color: '#ec4899',
    },
    {
      id: 5,
      title: 'Social Media Scheduler',
      category: 'web',
      tagline: 'Content Calendar & Automation',
      description: 'A social media management tool for scheduling posts, analyzing performance, and managing multiple accounts from one dashboard.',
      problem: 'Social media managers juggle multiple platforms with no unified view.',
      solution: 'Created an all-in-one platform with post scheduling, analytics, and team collaboration.',
      image: 'https://images.unsplash.com/photo-1611162617474-5b21e879e113?w=1200&q=80',
      tech: ['React', 'Next.js', 'Prisma', 'PostgreSQL', 'Twitter API'],
      github: null,
      live: null,
      featured: false,
      stars: 0,
      forks: 0,
      metrics: { scheduling: '5K+', accounts: '500+', saves: '20hrs/week' },
      icon: Megaphone,
      color: '#8b5cf6',
    },
    {
      id: 6,
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
      icon: Globe,
      color: '#06b6d4',
    },
    {
      id: 7,
      title: 'E-Learning Platform',
      category: 'web',
      tagline: 'Online Course Marketplace',
      description: 'A full-featured e-learning platform with video courses, quizzes, certificates, and progress tracking for students and instructors.',
      problem: 'Existing platforms were either too expensive or lacked interactive features.',
      solution: 'Built a feature-rich platform with live sessions, coding environments, and peer discussions.',
      image: 'https://images.unsplash.com/photo-1501504905252-473c47e087f8?w=1200&q=80',
      tech: ['React', 'Node.js', 'MongoDB', 'AWS S3', 'Stripe'],
      github: null,
      live: null,
      featured: false,
      stars: 0,
      forks: 0,
      metrics: { courses: '200+', students: '5K+', completion: '85%' },
      icon: ShoppingCart,
      color: '#14b8a6',
    },
  ]

  const filters = [
    { id: 'all', label: 'All Projects', icon: Layers },
    { id: 'web', label: 'Web Apps', icon: Globe },
    { id: 'mobile', label: 'Mobile', icon: Smartphone },
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
          <p className="text-lg text-zinc-500 dark:text-zinc-400 max-w-2xl mx-auto">
            A selection of projects that showcase my expertise in building scalable, 
            performant, and beautiful digital products.
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
                  : 'dark:bg-dark-800/50 dark:text-zinc-400 dark:hover:text-white dark:bg-zinc-200/50 text-zinc-600 hover:text-zinc-900 bg-zinc-100 hover:bg-zinc-200 border border-zinc-200 dark:border-white/5'
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
          <motion.a
            href="https://github.com/jaypavasiya"
            target="_blank"
            rel="noopener noreferrer"
            whileHover={{ scale: 1.02 }}
            className="group inline-flex items-center gap-3 px-8 py-4 rounded-2xl border dark:border-white/10 dark:bg-dark-800/50 dark:hover:bg-accent/10 bg-zinc-100 hover:bg-zinc-200 border-zinc-200 transition-all duration-300"
          >
            <Github size={20} />
            <span className="font-medium text-zinc-700 dark:text-zinc-300">View All Projects on GitHub</span>
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
      <div className="grid lg:grid-cols-2 gap-0 rounded-3xl dark:bg-dark-800/50 bg-white border border-zinc-200 dark:border-white/5 overflow-hidden">
        {/* Content */}
        <div className="p-8 lg:p-12 flex flex-col justify-center order-2 lg:order-1">
          <div className="flex items-center gap-2 text-accent mb-4">
            <project.icon size={14} style={{ color: project.color }} />
            <span className="text-xs font-medium uppercase tracking-wider">Featured Project</span>
          </div>
          
          <h3 className="text-3xl lg:text-4xl font-bold text-zinc-900 dark:text-white mb-3 group-hover:text-accent transition-colors">
            {project.title}
          </h3>
          
          <p className="text-lg mb-6" style={{ color: project.color }}>{project.tagline}</p>
          
          <p className="text-zinc-600 dark:text-zinc-400 mb-6 leading-relaxed">
            {project.description}
          </p>

          {/* Problem/Solution */}
          <div className="space-y-4 mb-8">
            <div className="p-4 rounded-xl dark:bg-zinc-800/50 bg-zinc-100">
              <div className="text-xs text-zinc-500 dark:text-zinc-400 uppercase tracking-wider mb-2">The Challenge</div>
              <p className="text-sm text-zinc-600 dark:text-zinc-400">{project.problem}</p>
            </div>
            <div className="p-4 rounded-xl border" style={{ backgroundColor: `${project.color}10`, borderColor: `${project.color}30` }}>
              <div className="text-xs uppercase tracking-wider mb-2" style={{ color: project.color }}>The Solution</div>
              <p className="text-sm text-zinc-700 dark:text-zinc-300">{project.solution}</p>
            </div>
          </div>

          {/* Tech stack */}
          <div className="flex flex-wrap gap-2 mb-8">
            {project.tech.map((tech) => (
              <span
                key={tech}
                className="px-3 py-1 text-xs font-medium rounded-full"
                style={{ backgroundColor: `${project.color}15`, color: project.color }}
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
                className="flex items-center gap-2 px-5 py-2.5 rounded-xl dark:bg-zinc-800 hover:bg-zinc-700 bg-zinc-200 hover:bg-zinc-300 text-zinc-700 dark:text-zinc-300 dark:hover:text-white transition-all"
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
                className="flex items-center gap-2 px-5 py-2.5 rounded-xl text-white transition-all"
                style={{ backgroundColor: project.color }}
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
            className="absolute inset-0"
            style={{ background: `linear-gradient(135deg, ${project.color}20, ${project.color}05)` }}
          />
          <motion.img
            whileHover={{ scale: 1.05 }}
            transition={{ duration: 0.6 }}
            src={project.image}
            alt={project.title}
            className="w-full h-full object-cover mix-blend-luminosity opacity-80 dark:opacity-60"
          />
          
          {/* Stats overlay */}
          <div className="absolute bottom-0 left-0 right-0 p-6 bg-gradient-to-t from-white dark:from-dark-900 to-transparent">
            <div className="flex gap-6">
              {Object.entries(project.metrics).map(([key, value]) => (
                <div key={key}>
                  <div className="text-2xl font-bold text-zinc-900 dark:text-white">{value}</div>
                  <div className="text-xs text-zinc-500 dark:text-zinc-400 uppercase">{key}</div>
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
      className="group relative rounded-2xl overflow-hidden dark:bg-dark-800/50 bg-white border border-zinc-200 dark:border-white/5 hover:border-accent/30 transition-all duration-300"
    >
      {/* Image */}
      <div className="relative aspect-video overflow-hidden">
        <img
          src={project.image}
          alt={project.title}
          className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-105"
          loading="lazy"
        />
        <div className="absolute inset-0 bg-gradient-to-t from-white dark:from-dark-900 via-transparent to-transparent opacity-80" />
        
        {/* Icon badge */}
        <div 
          className="absolute top-4 left-4 p-2 rounded-lg backdrop-blur-sm"
          style={{ backgroundColor: `${project.color}80` }}
        >
          <project.icon size={16} className="text-white" />
        </div>
      </div>

      {/* Content */}
      <div className="p-6 -mt-8 relative">
        <h3 className="text-xl font-bold text-zinc-900 dark:text-white mb-2 group-hover:text-accent transition-colors">
          {project.title}
        </h3>
        
        <p className="text-sm text-zinc-500 dark:text-zinc-400 mb-4 line-clamp-2">
          {project.tagline}
        </p>
        
        {/* Tech stack */}
        <div className="flex flex-wrap gap-1.5 mb-4">
          {project.tech.slice(0, 3).map((tech) => (
            <span
              key={tech}
              className="px-2 py-0.5 text-[10px] font-medium rounded-full"
              style={{ backgroundColor: `${project.color}15`, color: project.color }}
            >
              {tech}
            </span>
          ))}
        </div>

        {/* Stats and Links */}
        <div className="flex items-center justify-between pt-4 border-t border-zinc-200 dark:border-white/5">
          <div className="flex items-center gap-4 text-xs text-zinc-500 dark:text-zinc-400">
            {project.github ? (
              <>
                <span className="flex items-center gap-1">
                  <Star size={12} />
                  {project.stars}
                </span>
                <span className="flex items-center gap-1">
                  <GitFork size={12} />
                  {project.forks}
                </span>
              </>
            ) : (
              <span className="flex items-center gap-1">
                <ExternalLink size={12} />
                Private Project
              </span>
            )}
          </div>
          
          {project.github ? (
            <a
              href={project.github}
              target="_blank"
              rel="noopener noreferrer"
              className="text-xs text-accent hover:underline"
            >
              View →
            </a>
          ) : (
            <span className="text-xs text-zinc-400">
              Contact for details
            </span>
          )}
        </div>
      </div>
    </motion.div>
  )
}

export default Projects
