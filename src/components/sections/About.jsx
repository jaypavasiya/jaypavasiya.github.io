import { motion } from 'framer-motion'

const About = () => {
  const containerVariants = {
    hidden: { opacity: 0 },
    visible: { opacity: 1, transition: { staggerChildren: 0.1 } },
  }

  const itemVariants = {
    hidden: { opacity: 0, y: 20 },
    visible: { opacity: 1, y: 0, transition: { duration: 0.5 } },
  }

  return (
    <section id="about" className="py-24 sm:py-32">
      <div className="container-custom">
        {/* Header */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          className="text-center mb-16"
        >
          <h1 className="text-4xl sm:text-5xl font-bold mb-4">About Me</h1>
          <p className="text-slate-600 dark:text-slate-400 max-w-2xl mx-auto">
            Frontend Developer passionate about creating exceptional digital experiences
          </p>
        </motion.div>

        {/* Content */}
        <div className="grid lg:grid-cols-2 gap-12 items-center">
          {/* Left - Text */}
          <motion.div
            variants={containerVariants}
            initial="hidden"
            whileInView="visible"
            viewport={{ once: true }}
            className="space-y-6"
          >
            <motion.p variants={itemVariants} className="text-slate-600 dark:text-slate-400 leading-relaxed">
              I'm a <span className="font-semibold text-slate-900 dark:text-white">Frontend Developer</span> based in{' '}
              <span className="font-semibold text-slate-900 dark:text-white">Gujarat, India</span>. I specialize in building 
              performant, accessible, and visually stunning web applications using modern technologies.
            </motion.p>

            <motion.p variants={itemVariants} className="text-slate-600 dark:text-slate-400 leading-relaxed">
              With expertise in <span className="font-semibold text-slate-900 dark:text-white">React</span>,{' '}
              <span className="font-semibold text-slate-900 dark:text-white">TypeScript</span>, and{' '}
              <span className="font-semibold text-slate-900 dark:text-white">JavaScript</span>, I create 
              seamless user experiences that make a difference.
            </motion.p>

            <motion.p variants={itemVariants} className="text-slate-600 dark:text-slate-400 leading-relaxed">
              I'm passionate about clean code, user-centered design, and staying at the forefront 
              of web development trends. I actively contribute to open source and believe in 
              sharing knowledge with the community.
            </motion.p>

            {/* Quick Facts */}
            <motion.div variants={itemVariants} className="grid grid-cols-2 gap-4 pt-4">
              {[
                { label: 'Location', value: 'Gujarat, India' },
                { label: 'Experience', value: '4+ Years' },
                { label: 'Remote', value: 'Available' },
                { label: 'Focus', value: 'Frontend' },
              ].map((fact, i) => (
                <div key={i} className="p-4 rounded-lg bg-slate-100 dark:bg-slate-800">
                  <div className="text-xs text-slate-500 uppercase tracking-wide mb-1">{fact.label}</div>
                  <div className="font-medium text-slate-900 dark:text-white">{fact.value}</div>
                </div>
              ))}
            </motion.div>
          </motion.div>

          {/* Right - Visual */}
          <motion.div
            initial={{ opacity: 0, scale: 0.95 }}
            whileInView={{ opacity: 1, scale: 1 }}
            viewport={{ once: true }}
            className="relative"
          >
            <div className="aspect-square max-w-md mx-auto rounded-2xl bg-gradient-to-br from-indigo-500 to-purple-600 p-1">
              <div className="w-full h-full rounded-2xl bg-slate-50 dark:bg-slate-900 flex items-center justify-center">
                <span className="text-8xl font-bold text-slate-200 dark:text-slate-700">JP</span>
              </div>
            </div>
          </motion.div>
        </div>
      </div>
    </section>
  )
}

export default About
