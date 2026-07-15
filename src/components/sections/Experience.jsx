import { useRef } from 'react'
import { motion, useScroll, useTransform, useInView } from 'framer-motion'
import { Briefcase, Calendar, MapPin, ExternalLink, GraduationCap } from 'lucide-react'

const Experience = () => {
  const containerRef = useRef()
  const { scrollYProgress } = useScroll({
    target: containerRef,
    offset: ['start end', 'end start'],
  })

  const y = useTransform(scrollYProgress, [0, 1], ['0%', '10%'])

  const experiences = [
    {
      type: 'work',
      title: 'Senior Frontend Engineer',
      company: 'Adsparkx / Vibelets',
      location: 'India',
      period: '2022 - Present',
      description: 'Leading the frontend development of Vibelets, an AI-powered marketing platform. Building scalable React applications, implementing complex UI animations with Framer Motion, and optimizing performance for enterprise clients.',
      highlights: [
        'Architected and built the core frontend platform serving 1000+ users',
        'Implemented advanced animations and micro-interactions using GSAP and Framer Motion',
        'Reduced bundle size by 40% through code splitting and lazy loading',
        'Mentored junior developers and conducted code reviews',
      ],
      tech: ['React', 'TypeScript', 'Node.js', 'GSAP', 'Framer Motion', 'GraphQL', 'AWS'],
    },
    {
      type: 'work',
      title: 'Frontend Developer',
      company: 'Light-Line',
      location: 'India',
      period: '2021 - 2022',
      description: 'Developed responsive web applications and contributed to various client projects. Worked closely with designers to implement pixel-perfect UIs and improve user experience.',
      highlights: [
        'Built 10+ responsive web applications for diverse clients',
        'Implemented reusable component library used across multiple projects',
        'Collaborated with UX team to improve user flows and conversions',
        'Reduced page load times by 50% through optimization techniques',
      ],
      tech: ['React', 'JavaScript', 'SCSS', 'Tailwind', 'REST APIs'],
    },
    {
      type: 'work',
      title: 'Junior Frontend Developer',
      company: 'Freelance',
      location: 'Remote',
      period: '2020 - 2021',
      description: 'Started my professional journey as a freelance developer, working with small businesses and startups to build their web presence and digital products.',
      highlights: [
        'Delivered 15+ projects for clients across various industries',
        'Built strong foundation in modern JavaScript and React',
        'Developed excellent communication and project management skills',
        'Maintained 100% client satisfaction rate',
      ],
      tech: ['JavaScript', 'React', 'HTML', 'CSS', 'jQuery'],
    },
  ]

  const education = [
    {
      title: 'Bachelor of Computer Applications',
      institution: 'University of Gujarat',
      period: '2017 - 2020',
      description: 'Focused on software development, web technologies, and database management.',
    },
  ]

  const containerVariants = {
    hidden: { opacity: 0 },
    visible: {
      opacity: 1,
      transition: {
        staggerChildren: 0.15,
      },
    },
  }

  const itemVariants = {
    hidden: { opacity: 0, x: -20 },
    visible: { opacity: 1, x: 0 },
  }

  return (
    <section id="experience" ref={containerRef} className="relative py-32 overflow-hidden">
      <motion.div style={{ y }} className="container-custom">
        {/* Section Header */}
        <motion.div
          initial={{ opacity: 0, y: 30 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.6 }}
          className="text-center mb-20"
        >
          <span className="text-accent font-mono text-sm tracking-wider uppercase mb-4 block">
            Career Path
          </span>
          <h2 className="text-4xl sm:text-5xl lg:text-6xl font-bold tracking-tight">
            Professional
            <br />
            <span className="text-gradient">Experience</span>
          </h2>
        </motion.div>

        {/* Timeline */}
        <div className="relative max-w-4xl mx-auto">
          {/* Timeline line */}
          <div className="absolute left-0 md:left-1/2 top-0 bottom-0 w-px bg-gradient-to-b from-accent via-accent/50 to-transparent transform md:-translate-x-1/2" />

          {/* Experience Items */}
          <motion.div
            variants={containerVariants}
            initial="hidden"
            whileInView="visible"
            viewport={{ once: true }}
            className="space-y-16"
          >
            {experiences.map((exp, index) => (
              <motion.div
                key={index}
                variants={itemVariants}
                className={`relative flex flex-col md:flex-row gap-8 ${
                  index % 2 === 0 ? 'md:flex-row-reverse' : ''
                }`}
              >
                {/* Timeline dot */}
                <div className="absolute left-0 md:left-1/2 w-4 h-4 rounded-full bg-accent border-4 border-dark-900 transform -translate-x-[6px] md:-translate-x-[8px] mt-6 z-10">
                  <div className="absolute inset-0 rounded-full bg-accent animate-ping opacity-50" />
                </div>

                {/* Content */}
                <div className={`flex-1 ml-8 md:ml-0 ${index % 2 === 0 ? 'md:pr-12' : 'md:pl-12'}`}>
                  <div className="p-6 rounded-2xl bg-dark-800/50 border border-dark-700 hover:border-accent/50 transition-all duration-300 group">
                    {/* Header */}
                    <div className="flex flex-wrap items-start justify-between gap-4 mb-4">
                      <div>
                        <div className="flex items-center gap-2 text-accent mb-1">
                          <Briefcase size={16} />
                          <span className="text-xs font-medium uppercase tracking-wider">
                            {exp.type === 'work' ? 'Work' : 'Education'}
                          </span>
                        </div>
                        <h3 className="text-xl sm:text-2xl font-bold text-white group-hover:text-accent transition-colors">
                          {exp.title}
                        </h3>
                        <p className="text-lg text-zinc-400">{exp.company}</p>
                      </div>
                      <a
                        href="#"
                        className="p-2 rounded-lg bg-dark-700 hover:bg-accent text-zinc-400 hover:text-white transition-all"
                        aria-label="Visit company website"
                      >
                        <ExternalLink size={16} />
                      </a>
                    </div>

                    {/* Meta info */}
                    <div className="flex flex-wrap gap-4 mb-4 text-sm text-[var(--color-text-secondary)]">
                      <span className="flex items-center gap-1.5">
                        <Calendar size={14} />
                        {exp.period}
                      </span>
                      <span className="flex items-center gap-1.5">
                        <MapPin size={14} />
                        {exp.location}
                      </span>
                    </div>

                    {/* Description */}
                    <p className="text-[var(--color-text-secondary)] mb-4">
                      {exp.description}
                    </p>

                    {/* Highlights */}
                    <ul className="space-y-2 mb-4">
                      {exp.highlights.map((highlight, i) => (
                        <li key={i} className="flex items-start gap-2 text-sm text-zinc-400">
                          <span className="mt-1.5 w-1.5 h-1.5 rounded-full bg-accent flex-shrink-0" />
                          {highlight}
                        </li>
                      ))}
                    </ul>

                    {/* Tech stack */}
                    <div className="flex flex-wrap gap-2">
                      {exp.tech.map((tech, i) => (
                        <span
                          key={i}
                          className="px-3 py-1 text-xs font-medium bg-dark-700 text-zinc-300 rounded-full"
                        >
                          {tech}
                        </span>
                      ))}
                    </div>
                  </div>
                </div>

                {/* Spacer for alternating layout */}
                <div className="hidden md:block flex-1" />
              </motion.div>
            ))}
          </motion.div>

          {/* Education Section */}
          <motion.div
            initial={{ opacity: 0, y: 30 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.6 }}
            className="mt-20"
          >
            <div className="flex items-center gap-3 mb-8">
              <GraduationCap size={24} className="text-accent" />
              <h3 className="text-2xl font-bold text-white">Education</h3>
            </div>

            <div className="relative pl-8 md:pl-0">
              {/* Timeline dot for education */}
              <div className="absolute left-0 md:left-1/2 w-4 h-4 rounded-full bg-accent-light border-4 border-dark-900 transform -translate-x-[6px] md:-translate-x-[8px] mt-6 z-10" />

              {education.map((edu, index) => (
                <div key={index} className={`flex flex-col md:flex-row gap-8`}>
                  <div className="flex-1 md:pr-12">
                    <div className="p-6 rounded-2xl bg-dark-800/50 border border-dark-700">
                      <div className="mb-4">
                        <h4 className="text-xl font-bold text-white">{edu.title}</h4>
                        <p className="text-zinc-400">{edu.institution}</p>
                      </div>
                      <div className="flex items-center gap-4 text-sm text-[var(--color-text-secondary)]">
                        <span className="flex items-center gap-1.5">
                          <Calendar size={14} />
                          {edu.period}
                        </span>
                      </div>
                      <p className="mt-4 text-[var(--color-text-secondary)]">{edu.description}</p>
                    </div>
                  </div>
                  <div className="hidden md:block flex-1" />
                </div>
              ))}
            </div>
          </motion.div>
        </div>
      </motion.div>

      {/* Background decoration */}
      <div className="absolute top-1/2 left-0 w-96 h-96 bg-accent/5 rounded-full blur-[150px] pointer-events-none" />
    </section>
  )
}

export default Experience
