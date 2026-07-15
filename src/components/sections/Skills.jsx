import { useRef, useState } from 'react'
import { motion, useScroll, useTransform, useInView } from 'framer-motion'
import { Code, Database, Palette, Wrench, Layers } from 'lucide-react'

const Skills = () => {
  const containerRef = useRef()
  const [activeCategory, setActiveCategory] = useState('all')
  
  const { scrollYProgress } = useScroll({
    target: containerRef,
    offset: ['start end', 'end start'],
  })

  const y = useTransform(scrollYProgress, [0, 1], ['0%', '15%'])

  const skillCategories = [
    {
      id: 'frontend',
      label: 'Frontend',
      icon: Code,
      color: '#61dafb',
      skills: [
        { name: 'React', level: 95 },
        { name: 'TypeScript', level: 90 },
        { name: 'JavaScript', level: 95 },
        { name: 'Next.js', level: 85 },
        { name: 'Tailwind CSS', level: 92 },
        { name: 'GSAP', level: 85 },
      ],
    },
    {
      id: 'backend',
      label: 'Backend',
      icon: Database,
      color: '#339933',
      skills: [
        { name: 'Node.js', level: 85 },
        { name: 'Express', level: 85 },
        { name: 'GraphQL', level: 80 },
        { name: 'REST APIs', level: 92 },
        { name: 'PostgreSQL', level: 75 },
        { name: 'MongoDB', level: 78 },
      ],
    },
    {
      id: 'tools',
      label: 'Tools',
      icon: Wrench,
      color: '#f05032',
      skills: [
        { name: 'Git', level: 92 },
        { name: 'GitHub', level: 95 },
        { name: 'Docker', level: 70 },
        { name: 'AWS', level: 72 },
        { name: 'Vercel', level: 90 },
        { name: 'CI/CD', level: 80 },
      ],
    },
    {
      id: 'design',
      label: 'Design',
      icon: Palette,
      color: '#f24e1e',
      skills: [
        { name: 'Figma', level: 85 },
        { name: 'UI/UX', level: 80 },
        { name: 'Responsive', level: 95 },
        { name: 'Animation', level: 88 },
        { name: 'Accessibility', level: 85 },
        { name: 'Motion', level: 82 },
      ],
    },
  ]

  const allSkills = skillCategories.flatMap(cat => cat.skills)

  const filteredSkills = activeCategory === 'all' 
    ? allSkills 
    : skillCategories.find(cat => cat.id === activeCategory)?.skills || []

  const containerVariants = {
    hidden: { opacity: 0 },
    visible: {
      opacity: 1,
      transition: {
        staggerChildren: 0.03,
      },
    },
  }

  const skillVariants = {
    hidden: { opacity: 0, scale: 0.8 },
    visible: { opacity: 1, scale: 1 },
  }

  return (
    <section id="skills" ref={containerRef} className="relative py-32 overflow-hidden">
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
            Tech Stack
          </span>
          <h2 className="text-4xl sm:text-5xl lg:text-6xl font-bold tracking-tight mb-6">
            Skills &
            <br />
            <span className="text-gradient">Expertise</span>
          </h2>
          <p className="text-lg text-zinc-400 max-w-2xl mx-auto">
            Technologies and tools I use to bring ideas to life
          </p>
        </motion.div>

        {/* Category Filter */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          className="flex flex-wrap justify-center gap-3 mb-12"
        >
          <motion.button
            onClick={() => setActiveCategory('all')}
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.95 }}
            className={`px-5 py-2.5 rounded-xl text-sm font-medium transition-all duration-300 ${
              activeCategory === 'all'
                ? 'bg-accent text-white'
                : 'bg-dark-800/50 text-zinc-400 hover:text-white hover:bg-dark-700/50 border border-white/5'
            }`}
          >
            All Skills
          </motion.button>
          {skillCategories.map((cat) => (
            <motion.button
              key={cat.id}
              onClick={() => setActiveCategory(cat.id)}
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
              className={`flex items-center gap-2 px-5 py-2.5 rounded-xl text-sm font-medium transition-all duration-300 ${
                activeCategory === cat.id
                  ? 'bg-accent text-white'
                  : 'bg-dark-800/50 text-zinc-400 hover:text-white hover:bg-dark-700/50 border border-white/5'
              }`}
            >
              <cat.icon size={16} />
              {cat.label}
            </motion.button>
          ))}
        </motion.div>

        {/* Skills Grid */}
        <motion.div
          variants={containerVariants}
          initial="hidden"
          whileInView="visible"
          viewport={{ once: true }}
          className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-6 gap-4 mb-20"
        >
          {filteredSkills.map((skill, index) => (
            <motion.div
              key={`${skill.name}-${index}`}
              variants={skillVariants}
              whileHover={{ scale: 1.05, borderColor: 'rgba(99, 102, 241, 0.5)' }}
              className="group p-5 rounded-2xl bg-dark-800/50 border border-white/5 transition-all duration-300 cursor-default"
            >
              <div className="text-center">
                <div className="w-12 h-12 mx-auto mb-3 rounded-xl flex items-center justify-center text-lg font-bold bg-accent/10 text-accent">
                  {skill.name.charAt(0)}
                </div>
                <h4 className="font-medium text-white text-sm mb-3">{skill.name}</h4>
                <div className="w-full h-1.5 bg-dark-700 rounded-full overflow-hidden">
                  <motion.div
                    initial={{ width: 0 }}
                    whileInView={{ width: `${skill.level}%` }}
                    viewport={{ once: true }}
                    transition={{ duration: 1, delay: index * 0.05, ease: 'easeOut' }}
                    className="h-full rounded-full bg-gradient-to-r from-accent to-accent-light"
                  />
                </div>
                <span className="text-xs text-zinc-500 mt-2 block">{skill.level}%</span>
              </div>
            </motion.div>
          ))}
        </motion.div>

        {/* Detailed Skills by Category */}
        <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-6">
          {skillCategories.map((category, catIndex) => (
            <motion.div
              key={category.id}
              initial={{ opacity: 0, y: 30 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.6, delay: catIndex * 0.1 }}
              className="p-6 rounded-2xl bg-dark-800/30 border border-white/5"
            >
              <div className="flex items-center gap-3 mb-6">
                <div 
                  className="p-3 rounded-xl"
                  style={{ backgroundColor: `${category.color}20` }}
                >
                  <category.icon size={24} style={{ color: category.color }} />
                </div>
                <h3 className="text-xl font-bold text-white">{category.label}</h3>
              </div>

              <div className="space-y-4">
                {category.skills.map((skill, index) => (
                  <div key={index} className="space-y-2">
                    <div className="flex justify-between text-sm">
                      <span className="text-zinc-300">{skill.name}</span>
                      <span className="text-zinc-500">{skill.level}%</span>
                    </div>
                    <div className="w-full h-2 bg-dark-700 rounded-full overflow-hidden">
                      <motion.div
                        initial={{ width: 0 }}
                        whileInView={{ width: `${skill.level}%` }}
                        viewport={{ once: true }}
                        transition={{ duration: 1, delay: index * 0.1 }}
                        className="h-full rounded-full"
                        style={{ backgroundColor: category.color }}
                      />
                    </div>
                  </div>
                ))}
              </div>
            </motion.div>
          ))}
        </div>
      </motion.div>

      {/* Background decoration */}
      <div className="absolute top-1/4 right-0 w-96 h-96 bg-accent/5 rounded-full blur-[150px] pointer-events-none" />
      <div className="absolute bottom-1/4 left-0 w-96 h-96 bg-accent-light/5 rounded-full blur-[150px] pointer-events-none" />
    </section>
  )
}

export default Skills
