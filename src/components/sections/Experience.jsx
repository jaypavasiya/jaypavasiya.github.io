import { motion } from 'framer-motion'
import { Briefcase, Calendar, MapPin } from 'lucide-react'

const Experience = () => {
  const experiences = [
    {
      title: 'Frontend Developer',
      company: 'Vibelets / Adsparkx',
      period: '2022 - Present',
      location: 'India (Remote)',
      description: 'Building AI-powered marketing platform frontend with React and TypeScript.',
    },
    {
      title: 'Frontend Developer',
      company: 'Light-Line',
      period: '2021 - 2022',
      location: 'India',
      description: 'Developed responsive web applications for various clients.',
    },
    {
      title: 'Freelance Developer',
      company: 'Self-Employed',
      period: '2020 - 2021',
      location: 'Remote',
      description: 'Built web presence for small businesses and startups.',
    },
  ]

  const containerVariants = {
    hidden: { opacity: 0 },
    visible: { opacity: 1, transition: { staggerChildren: 0.15 } },
  }

  const itemVariants = {
    hidden: { opacity: 0, x: -20 },
    visible: { opacity: 1, x: 0, transition: { duration: 0.5 } },
  }

  return (
    <section id="experience" className="py-24 sm:py-32">
      <div className="container-custom">
        {/* Header */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          className="text-center mb-16"
        >
          <h1 className="text-4xl sm:text-5xl font-bold mb-4">Experience</h1>
          <p className="text-slate-600 dark:text-slate-400 max-w-2xl mx-auto">
            My professional journey in frontend development
          </p>
        </motion.div>

        {/* Timeline */}
        <div className="max-w-2xl mx-auto space-y-8">
          {experiences.map((exp, index) => (
            <motion.div
              key={index}
              variants={containerVariants}
              initial="hidden"
              whileInView="visible"
              viewport={{ once: true }}
              className="relative pl-8 border-l-2 border-indigo-500/30"
            >
              {/* Dot */}
              <div className="absolute -left-[9px] top-0 w-4 h-4 rounded-full bg-indigo-500" />

              {/* Content */}
              <motion.div
                variants={itemVariants}
                className="pb-8 last:pb-0"
              >
                <div className="flex items-start justify-between gap-4 flex-wrap">
                  <div>
                    <h3 className="text-xl font-bold text-slate-900 dark:text-white">
                      {exp.title}
                    </h3>
                    <p className="text-indigo-600 dark:text-indigo-400 font-medium">
                      {exp.company}
                    </p>
                  </div>
                </div>

                <div className="flex flex-wrap gap-4 mt-2 text-sm text-slate-500">
                  <span className="flex items-center gap-1">
                    <Calendar size={14} />
                    {exp.period}
                  </span>
                  <span className="flex items-center gap-1">
                    <MapPin size={14} />
                    {exp.location}
                  </span>
                </div>

                <p className="mt-3 text-slate-600 dark:text-slate-400">
                  {exp.description}
                </p>
              </motion.div>
            </motion.div>
          ))}
        </div>

        {/* Education */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          className="max-w-2xl mx-auto mt-16"
        >
          <h2 className="text-2xl font-bold text-slate-900 dark:text-white mb-6">Education</h2>
          <div className="relative pl-8 border-l-2 border-indigo-500/30">
            <div className="absolute -left-[9px] top-0 w-4 h-4 rounded-full bg-indigo-400" />
            <div>
              <h3 className="text-xl font-bold text-slate-900 dark:text-white">
                Bachelor of Computer Applications
              </h3>
              <p className="text-slate-600 dark:text-slate-400">University of Gujarat</p>
              <p className="text-sm text-slate-500 mt-1">2017 - 2020</p>
            </div>
          </div>
        </motion.div>
      </div>
    </section>
  )
}

export default Experience
