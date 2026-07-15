import { motion } from 'framer-motion'

const Skills = () => {
  const skills = [
    { name: 'React', level: 95 },
    { name: 'JavaScript', level: 95 },
    { name: 'TypeScript', level: 85 },
    { name: 'HTML/CSS', level: 95 },
    { name: 'Tailwind CSS', level: 90 },
    { name: 'Next.js', level: 80 },
    { name: 'React Native', level: 75 },
    { name: 'GSAP', level: 80 },
    { name: 'Framer Motion', level: 85 },
    { name: 'Git', level: 90 },
    { name: 'Figma', level: 75 },
    { name: 'Node.js', level: 70 },
  ]

  return (
    <section id="skills" className="py-24 sm:py-32">
      <div className="container-custom">
        {/* Header */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          className="text-center mb-16"
        >
          <h1 className="text-4xl sm:text-5xl font-bold mb-4">Skills</h1>
          <p className="text-slate-600 dark:text-slate-400 max-w-2xl mx-auto">
            Technologies I work with to build great web applications
          </p>
        </motion.div>

        {/* Skills Grid */}
        <motion.div
          initial={{ opacity: 0 }}
          whileInView={{ opacity: 1 }}
          viewport={{ once: true }}
          className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4 max-w-4xl mx-auto"
        >
          {skills.map((skill, index) => (
            <motion.div
              key={skill.name}
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ delay: index * 0.05 }}
              className="p-4 rounded-xl bg-slate-100 dark:bg-slate-800 hover:bg-slate-200 dark:hover:bg-slate-700 transition-colors"
            >
              <div className="flex items-center justify-between mb-2">
                <span className="font-medium text-slate-900 dark:text-white">{skill.name}</span>
                <span className="text-sm text-slate-500">{skill.level}%</span>
              </div>
              <div className="h-1.5 bg-slate-200 dark:bg-slate-700 rounded-full overflow-hidden">
                <motion.div
                  initial={{ width: 0 }}
                  whileInView={{ width: `${skill.level}%` }}
                  viewport={{ once: true }}
                  transition={{ duration: 0.8, delay: index * 0.05 }}
                  className="h-full bg-indigo-500 rounded-full"
                />
              </div>
            </motion.div>
          ))}
        </motion.div>
      </div>
    </section>
  )
}

export default Skills
