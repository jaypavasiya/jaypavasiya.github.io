import { motion } from 'framer-motion'
import { Github, ExternalLink } from 'lucide-react'

const Projects = () => {
  const projects = [
    {
      title: 'Vibelets',
      tagline: 'AI-Powered Marketing Platform',
      description: 'Building the frontend for an AI-powered marketing platform. Implementing complex UI with React, TypeScript, and advanced animations.',
      tech: ['React', 'TypeScript', 'GSAP', 'Node.js'],
      github: 'https://github.com/adsparkx/vibelets',
      live: 'https://vibelets.com',
    },
    {
      title: 'React Boilerplate',
      tagline: 'Production-Ready Starter',
      description: 'A comprehensive React boilerplate with Redux, TypeScript, testing setup, and best practices pre-configured.',
      tech: ['React', 'Redux', 'TypeScript', 'Jest'],
      github: 'https://github.com/jaypavasiya/react-boilerplate-with-redux',
      live: null,
    },
    {
      title: 'Portfolio',
      tagline: 'This Website',
      description: 'A modern portfolio built with React, featuring smooth animations and clean design.',
      tech: ['React', 'Vite', 'Tailwind', 'Framer Motion'],
      github: 'https://github.com/jaypavasiya/jaypavasiya.github.io',
      live: 'https://jaypavasiya.dev',
    },
  ]

  return (
    <section id="projects" className="py-24 sm:py-32">
      <div className="container-custom">
        {/* Header */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          className="text-center mb-16"
        >
          <h1 className="text-4xl sm:text-5xl font-bold mb-4">Projects</h1>
          <p className="text-slate-600 dark:text-slate-400 max-w-2xl mx-auto">
            Selected work showcasing frontend development skills
          </p>
        </motion.div>

        {/* Projects Grid */}
        <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6 max-w-5xl mx-auto">
          {projects.map((project, index) => (
            <motion.div
              key={project.title}
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ delay: index * 0.1 }}
              className="group p-6 rounded-2xl bg-slate-100 dark:bg-slate-800 hover:bg-slate-200 dark:hover:bg-slate-700 transition-colors"
            >
              {/* Icon */}
              <div className="w-12 h-12 rounded-xl bg-indigo-500/10 flex items-center justify-center mb-4">
                <span className="text-2xl font-bold text-indigo-600 dark:text-indigo-400">
                  {project.title.charAt(0)}
                </span>
              </div>

              {/* Content */}
              <h3 className="text-xl font-bold text-slate-900 dark:text-white mb-1">
                {project.title}
              </h3>
              <p className="text-sm text-indigo-600 dark:text-indigo-400 mb-3">
                {project.tagline}
              </p>
              <p className="text-sm text-slate-600 dark:text-slate-400 mb-4 line-clamp-3">
                {project.description}
              </p>

              {/* Tech */}
              <div className="flex flex-wrap gap-2 mb-4">
                {project.tech.map(t => (
                  <span key={t} className="px-2 py-1 text-xs rounded bg-slate-200 dark:bg-slate-700 text-slate-600 dark:text-slate-300">
                    {t}
                  </span>
                ))}
              </div>

              {/* Links */}
              <div className="flex gap-3">
                {project.github && (
                  <a
                    href={project.github}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="flex items-center gap-1 text-sm text-slate-600 dark:text-slate-400 hover:text-indigo-600 dark:hover:text-indigo-400 transition-colors"
                  >
                    <Github size={16} />
                    Code
                  </a>
                )}
                {project.live && (
                  <a
                    href={project.live}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="flex items-center gap-1 text-sm text-slate-600 dark:text-slate-400 hover:text-indigo-600 dark:hover:text-indigo-400 transition-colors"
                  >
                    <ExternalLink size={16} />
                    Live
                  </a>
                )}
              </div>
            </motion.div>
          ))}
        </div>

        {/* GitHub CTA */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          className="text-center mt-12"
        >
          <a
            href="https://github.com/jaypavasiya"
            target="_blank"
            rel="noopener noreferrer"
            className="inline-flex items-center gap-2 px-6 py-3 rounded-lg border border-slate-300 dark:border-slate-600 text-slate-700 dark:text-slate-300 hover:border-indigo-600 dark:hover:border-indigo-400 transition-colors"
          >
            <Github size={18} />
            View all on GitHub
          </a>
        </motion.div>
      </div>
    </section>
  )
}

export default Projects
