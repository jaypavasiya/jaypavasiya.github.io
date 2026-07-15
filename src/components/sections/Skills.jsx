import { useRef, useState } from 'react'
import { motion, useScroll, useTransform, useInView } from 'framer-motion'
import { Code, Layers, Palette, Zap, Globe, Database, Cloud, Terminal, Wrench } from 'lucide-react'

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
      skills: [
        { name: 'React', level: 95, color: '#61dafb' },
        { name: 'TypeScript', level: 90, color: '#3178c6' },
        { name: 'JavaScript', level: 95, color: '#f7df1e' },
        { name: 'Next.js', level: 85, color: '#ffffff' },
        { name: 'HTML/CSS', level: 95, color: '#e34c26' },
        { name: 'Tailwind CSS', level: 92, color: '#38b2ac' },
        { name: 'GSAP', level: 85, color: '#88ce02' },
        { name: 'Framer Motion', level: 88, color: '#ff0055' },
      ],
    },
    {
      id: 'backend',
      label: 'Backend',
      icon: Database,
      skills: [
        { name: 'Node.js', level: 85, color: '#339933' },
        { name: 'Express', level: 85, color: '#ffffff' },
        { name: 'GraphQL', level: 80, color: '#e10098' },
        { name: 'REST APIs', level: 92, color: '#6ba539' },
        { name: 'PostgreSQL', level: 75, color: '#336791' },
        { name: 'MongoDB', level: 78, color: '#47a248' },
      ],
    },
    {
      id: 'tools',
      label: 'Tools & DevOps',
      icon: Wrench,
      skills: [
        { name: 'Git', level: 92, color: '#f05032' },
        { name: 'GitHub', level: 95, color: '#181717' },
        { name: 'Docker', level: 70, color: '#2496ed' },
        { name: 'AWS', level: 72, color: '#ff9900' },
        { name: 'Vercel', level: 90, color: '#ffffff' },
        { name: 'CI/CD', level: 80, color: '#40b5ad' },
      ],
    },
    {
      id: 'design',
      label: 'Design & UI',
      icon: Palette,
      skills: [
        { name: 'Figma', level: 85, color: '#f24e1e' },
        { name: 'UI/UX Design', level: 80, color: '#ff61f6' },
        { name: 'Responsive Design', level: 95, color: '#38bdf8' },
        { name: 'Animation', level: 88, color: '#a78bfa' },
        { name: 'Motion Design', level: 82, color: '#fb923c' },
        { name: 'Accessibility', level: 85, color: '#4ade80' },
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
        staggerChildren: 0.05,
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
          <span className="text-accent font-mono text-sm tracking-wider uppercase mb-4 block">
            Tech Stack
          </span>
          <h2 className="text-4xl sm:text-5xl lg:text-6xl font-bold tracking-tight">
            Skills &
            <br />
            <span className="text-gradient">Expertise</span>
          </h2>
        </motion.div>

        {/* Category Filter */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.6, delay: 0.2 }}
          className="flex flex-wrap justify-center gap-3 mb-12"
        >
          <button
            onClick={() => setActiveCategory('all')}
            className={`px-5 py-2.5 rounded-full text-sm font-medium transition-all duration-300 ${
              activeCategory === 'all'
                ? 'bg-accent text-white'
                : 'bg-dark-800 text-zinc-400 hover:text-white hover:bg-dark-700'
            }`}
          >
            All Skills
          </button>
          {skillCategories.map((cat) => (
            <button
              key={cat.id}
              onClick={() => setActiveCategory(cat.id)}
              className={`flex items-center gap-2 px-5 py-2.5 rounded-full text-sm font-medium transition-all duration-300 ${
                activeCategory === cat.id
                  ? 'bg-accent text-white'
                  : 'bg-dark-800 text-zinc-400 hover:text-white hover:bg-dark-700'
              }`}
            >
              <cat.icon size={16} />
              {cat.label}
            </button>
          ))}
        </motion.div>

        {/* Skills Grid */}
        <motion.div
          variants={containerVariants}
          initial="hidden"
          whileInView="visible"
          viewport={{ once: true }}
          className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 gap-4 mb-20"
        >
          {filteredSkills.map((skill, index) => (
            <motion.div
              key={`${skill.name}-${index}`}
              variants={skillVariants}
              className="group relative p-6 rounded-2xl bg-dark-800/50 border border-dark-700 hover:border-accent/50 transition-all duration-300 cursor-default"
            >
              {/* Skill name */}
              <div className="text-center">
                <div 
                  className="w-12 h-12 mx-auto mb-3 rounded-xl flex items-center justify-center text-lg font-bold"
                  style={{ backgroundColor: `${skill.color}20`, color: skill.color }}
                >
                  {skill.name.charAt(0)}
                </div>
                <h4 className="font-medium text-white text-sm mb-2">{skill.name}</h4>
                <div className="w-full h-1.5 bg-dark-700 rounded-full overflow-hidden">
                  <motion.div
                    initial={{ width: 0 }}
                    whileInView={{ width: `${skill.level}%` }}
                    viewport={{ once: true }}
                    transition={{ duration: 1, delay: index * 0.1, ease: 'easeOut' }}
                    className="h-full rounded-full"
                    style={{ backgroundColor: skill.color }}
                  />
                </div>
                <span className="text-xs text-[var(--color-text-secondary)] mt-1 block">
                  {skill.level}%
                </span>
              </div>

              {/* Hover glow effect */}
              <div
                className="absolute inset-0 rounded-2xl opacity-0 group-hover:opacity-100 transition-opacity duration-300 pointer-events-none"
                style={{
                  background: `radial-gradient(circle at center, ${skill.color}10 0%, transparent 70%)`,
                }}
              />
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
              className="p-6 rounded-2xl bg-dark-800/30 border border-dark-700"
            >
              <div className="flex items-center gap-3 mb-6">
                <div className="p-3 rounded-xl bg-accent/10 text-accent">
                  <category.icon size={24} />
                </div>
                <h3 className="text-xl font-bold text-white">{category.label}</h3>
              </div>

              <div className="space-y-4">
                {category.skills.slice(0, 5).map((skill, index) => (
                  <div key={index} className="space-y-2">
                    <div className="flex justify-between text-sm">
                      <span className="text-zinc-300">{skill.name}</span>
                      <span className="text-[var(--color-text-secondary)]">{skill.level}%</span>
                    </div>
                    <div className="w-full h-2 bg-dark-700 rounded-full overflow-hidden">
                      <motion.div
                        initial={{ width: 0 }}
                        whileInView={{ width: `${skill.level}%` }}
                        viewport={{ once: true }}
                        transition={{ duration: 1, delay: index * 0.1 }}
                        className="h-full rounded-full"
                        style={{ backgroundColor: skill.color }}
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
