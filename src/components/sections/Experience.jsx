import { useRef } from 'react'
import { motion, useScroll, useTransform, useInView } from 'framer-motion'
import { Briefcase, Calendar, MapPin, ExternalLink, GraduationCap, Award, Code, Rocket, Users, TrendingUp } from 'lucide-react'

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
      company: 'Vibelets / Adsparkx',
      location: 'India (Remote)',
      period: '2022 - Present',
      description: 'Leading the frontend development of Vibelets, an AI-powered marketing platform. Building scalable React applications, implementing complex UI animations, and optimizing performance for enterprise clients.',
      highlights: [
        'Architected and built the core frontend platform serving 1000+ users',
        'Led the development of AI-powered marketing campaign features',
        'Implemented advanced animations with Framer Motion and GSAP',
        'Reduced bundle size by 40% through code splitting and lazy loading',
        'Mentored junior developers and conducted code reviews',
        'Integrated GraphQL APIs for real-time data updates',
      ],
      tech: ['React', 'TypeScript', 'Node.js', 'GSAP', 'Framer Motion', 'GraphQL', 'AWS', 'Vercel'],
      icon: Rocket,
      color: '#6366f1',
    },
    {
      type: 'work',
      title: 'Frontend Developer',
      company: 'Light-Line',
      location: 'India',
      period: '2021 - 2022',
      description: 'Developed responsive web applications and contributed to various client projects. Worked closely with designers to implement pixel-perfect UIs and improve user experience.',
      highlights: [
        'Built 15+ responsive web applications for diverse clients',
        'Implemented reusable component library used across multiple projects',
        'Collaborated with UX team to improve user flows and conversions',
        'Reduced page load times by 50% through optimization techniques',
        'Integrated REST APIs and third-party services',
        'Participated in agile development and sprint planning',
      ],
      tech: ['React', 'JavaScript', 'SCSS', 'Tailwind CSS', 'REST APIs', 'Git'],
      icon: Code,
      color: '#10b981',
    },
    {
      type: 'work',
      title: 'Freelance Web Developer',
      company: 'Self-Employed',
      location: 'Remote',
      period: '2020 - 2021',
      description: 'Started professional journey as a freelance developer, working with small businesses and startups to build their web presence and digital products.',
      highlights: [
        'Delivered 20+ projects for clients across various industries',
        'Built strong foundation in modern JavaScript and React',
        'Developed excellent communication and project management skills',
        'Maintained 100% client satisfaction rate',
        'Created custom WordPress themes and plugins',
        'Built e-commerce solutions with Shopify and WooCommerce',
      ],
      tech: ['JavaScript', 'React', 'HTML', 'CSS', 'jQuery', 'WordPress', 'Shopify'],
      icon: Users,
      color: '#f59e0b',
    },
  ]

  const education = [
    {
      title: 'Bachelor of Computer Applications (BCA)',
      institution: 'University of Gujarat',
      period: '2017 - 2020',
      description: 'Focused on software development, web technologies, database management, and computer fundamentals. Completed projects in web development and mobile applications.',
      icon: GraduationCap,
    },
  ]

  const achievements = [
    { icon: Award, text: 'Pull Shark - GitHub Achievement (3+ PRs)' },
    { icon: TrendingUp, text: 'Developer Program Member' },
    { icon: Code, text: '20+ Projects Completed' },
    { icon: Users, text: '5+ Happy Clients' },
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
    hidden: { opacity: 0, x: -30 },
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
          <span className="inline-block text-accent font-mono text-sm tracking-wider uppercase mb-4">
            Career Path
          </span>
          <h2 className="text-4xl sm:text-5xl lg:text-6xl font-bold tracking-tight">
            Professional
            <br />
            <span className="text-gradient">Experience</span>
          </h2>
          <p className="mt-6 text-lg text-zinc-500 dark:text-zinc-400 max-w-2xl mx-auto">
            A journey of continuous growth and learning in the frontend development space
          </p>
        </motion.div>

        {/* Achievements badges */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          className="flex flex-wrap justify-center gap-4 mb-16"
        >
          {achievements.map((item, index) => (
            <motion.div
              key={index}
              initial={{ opacity: 0, scale: 0.8 }}
              whileInView={{ opacity: 1, scale: 1 }}
              viewport={{ once: true }}
              transition={{ delay: index * 0.1 }}
              className="flex items-center gap-2 px-4 py-2 rounded-full dark:bg-dark-800/50 bg-white border border-zinc-200 dark:border-white/10"
            >
              <item.icon size={16} className="text-accent" />
              <span className="text-sm text-zinc-600 dark:text-zinc-400">{item.text}</span>
            </motion.div>
          ))}
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
                <div className="absolute left-0 md:left-1/2 w-4 h-4 rounded-full border-4 border-dark-900 dark:border-dark-900 transform -translate-x-[6px] md:-translate-x-[8px] mt-6 z-10" 
                     style={{ backgroundColor: exp.color }}>
                  <motion.div
                    animate={{ scale: [1, 1.5, 1], opacity: [1, 0, 1] }}
                    transition={{ duration: 2, repeat: Infinity }}
                    className="absolute inset-0 rounded-full"
                    style={{ backgroundColor: exp.color }}
                  />
                </div>

                {/* Content */}
                <div className={`flex-1 ml-8 md:ml-0 ${index % 2 === 0 ? 'md:pr-12' : 'md:pl-12'}`}>
                  <motion.div
                    whileHover={{ scale: 1.01, borderColor: exp.color }}
                    className="p-6 rounded-2xl dark:bg-dark-800/50 bg-white border border-zinc-200 dark:border-white/5 hover:shadow-lg transition-all duration-300 group"
                  >
                    {/* Header */}
                    <div className="flex flex-wrap items-start justify-between gap-4 mb-4">
                      <div className="flex items-start gap-4">
                        <div 
                          className="p-3 rounded-xl"
                          style={{ backgroundColor: `${exp.color}20` }}
                        >
                          <exp.icon size={24} style={{ color: exp.color }} />
                        </div>
                        <div>
                          <h3 className="text-xl sm:text-2xl font-bold text-zinc-900 dark:text-white group-hover:text-accent transition-colors">
                            {exp.title}
                          </h3>
                          <p className="text-zinc-600 dark:text-zinc-400 mt-1">{exp.company}</p>
                        </div>
                      </div>
                    </div>

                    {/* Meta info */}
                    <div className="flex flex-wrap gap-4 mb-4 text-sm text-zinc-500 dark:text-zinc-500">
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
                    <p className="text-zinc-600 dark:text-zinc-400 mb-4 leading-relaxed">
                      {exp.description}
                    </p>

                    {/* Highlights */}
                    <ul className="space-y-2 mb-4">
                      {exp.highlights.map((highlight, i) => (
                        <li key={i} className="flex items-start gap-3 text-sm text-zinc-500 dark:text-zinc-500">
                          <span className="mt-2 w-1.5 h-1.5 rounded-full flex-shrink-0" style={{ backgroundColor: exp.color }} />
                          {highlight}
                        </li>
                      ))}
                    </ul>

                    {/* Tech stack */}
                    <div className="flex flex-wrap gap-2">
                      {exp.tech.map((tech, i) => (
                        <span
                          key={i}
                          className="px-3 py-1 text-xs font-medium rounded-full"
                          style={{ backgroundColor: `${exp.color}15`, color: exp.color }}
                        >
                          {tech}
                        </span>
                      ))}
                    </div>
                  </motion.div>
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
              <h3 className="text-2xl font-bold text-zinc-900 dark:text-white">Education</h3>
            </div>

            <div className="relative pl-8 md:pl-0">
              {/* Timeline dot for education */}
              <div className="absolute left-0 md:left-1/2 w-4 h-4 rounded-full bg-accent-light border-4 border-dark-900 dark:border-dark-900 transform -translate-x-[6px] md:-translate-x-[8px] mt-6 z-10" />

              {education.map((edu, index) => (
                <div key={index} className="flex flex-col md:flex-row gap-8">
                  <div className="flex-1 md:pr-12">
                    <motion.div
                      whileHover={{ scale: 1.01 }}
                      className="p-6 rounded-2xl dark:bg-dark-800/50 bg-white border border-zinc-200 dark:border-white/5"
                    >
                      <div className="flex items-start gap-4 mb-4">
                        <div className="p-3 rounded-xl bg-accent/10">
                          <edu.icon size={24} className="text-accent" />
                        </div>
                        <div>
                          <h4 className="text-xl font-bold text-zinc-900 dark:text-white">{edu.title}</h4>
                          <p className="text-zinc-600 dark:text-zinc-400">{edu.institution}</p>
                        </div>
                      </div>
                      <div className="flex items-center gap-4 text-sm text-zinc-500 dark:text-zinc-500 mb-4">
                        <span className="flex items-center gap-1.5">
                          <Calendar size={14} />
                          {edu.period}
                        </span>
                      </div>
                      <p className="text-zinc-600 dark:text-zinc-400 leading-relaxed">{edu.description}</p>
                    </motion.div>
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
