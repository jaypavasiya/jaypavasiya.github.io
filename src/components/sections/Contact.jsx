import { useState } from 'react'
import { motion } from 'framer-motion'
import { Mail, Github, Linkedin, Twitter, MapPin, Send } from 'lucide-react'

const Contact = () => {
  const [form, setForm] = useState({ name: '', email: '', message: '' })
  const [sent, setSent] = useState(false)

  const handleSubmit = (e) => {
    e.preventDefault()
    // Simulate sending
    setSent(true)
    setTimeout(() => setSent(false), 3000)
    setForm({ name: '', email: '', message: '' })
  }

  return (
    <section id="contact" className="py-24 sm:py-32">
      <div className="container-custom">
        {/* Header */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          className="text-center mb-16"
        >
          <h1 className="text-4xl sm:text-5xl font-bold mb-4">Get in Touch</h1>
          <p className="text-slate-600 dark:text-slate-400 max-w-2xl mx-auto">
            Have a project in mind or want to work together? Let's connect!
          </p>
        </motion.div>

        <div className="grid lg:grid-cols-2 gap-12 max-w-4xl mx-auto">
          {/* Contact Info */}
          <motion.div
            initial={{ opacity: 0, x: -20 }}
            whileInView={{ opacity: 1, x: 0 }}
            viewport={{ once: true }}
            className="space-y-6"
          >
            <h2 className="text-2xl font-bold text-slate-900 dark:text-white">
              Let's work together
            </h2>
            <p className="text-slate-600 dark:text-slate-400">
              Currently available for freelance projects and full-time opportunities. 
              I specialize in building modern, performant web applications with React.
            </p>

            {/* Info */}
            <div className="space-y-4">
              <a href="mailto:jaypavasiya7@gmail.com" className="flex items-center gap-3 text-slate-600 dark:text-slate-400 hover:text-indigo-600 dark:hover:text-indigo-400 transition-colors">
                <Mail size={20} />
                jaypavasiya7@gmail.com
              </a>
              <div className="flex items-center gap-3 text-slate-600 dark:text-slate-400">
                <MapPin size={20} />
                Gujarat, India (Remote)
              </div>
            </div>

            {/* Social Links */}
            <div className="flex gap-4 pt-4">
              <a href="https://github.com/jaypavasiya" target="_blank" rel="noopener noreferrer" className="p-3 rounded-lg bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-400 hover:text-indigo-600 dark:hover:text-indigo-400 transition-colors">
                <Github size={20} />
              </a>
              <a href="https://linkedin.com/in/jaypavasiya" target="_blank" rel="noopener noreferrer" className="p-3 rounded-lg bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-400 hover:text-indigo-600 dark:hover:text-indigo-400 transition-colors">
                <Linkedin size={20} />
              </a>
              <a href="https://twitter.com/jay_pavasiya" target="_blank" rel="noopener noreferrer" className="p-3 rounded-lg bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-400 hover:text-indigo-600 dark:hover:text-indigo-400 transition-colors">
                <Twitter size={20} />
              </a>
            </div>
          </motion.div>

          {/* Contact Form */}
          <motion.form
            initial={{ opacity: 0, x: 20 }}
            whileInView={{ opacity: 1, x: 0 }}
            viewport={{ once: true }}
            onSubmit={handleSubmit}
            className="space-y-4"
          >
            <div>
              <input
                type="text"
                placeholder="Your Name"
                value={form.name}
                onChange={(e) => setForm({ ...form, name: e.target.value })}
                required
                className="w-full px-4 py-3 rounded-lg bg-slate-100 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 focus:border-indigo-500 focus:outline-none transition-colors text-slate-900 dark:text-white placeholder:text-slate-500"
              />
            </div>
            <div>
              <input
                type="email"
                placeholder="Your Email"
                value={form.email}
                onChange={(e) => setForm({ ...form, email: e.target.value })}
                required
                className="w-full px-4 py-3 rounded-lg bg-slate-100 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 focus:border-indigo-500 focus:outline-none transition-colors text-slate-900 dark:text-white placeholder:text-slate-500"
              />
            </div>
            <div>
              <textarea
                placeholder="Your Message"
                value={form.message}
                onChange={(e) => setForm({ ...form, message: e.target.value })}
                required
                rows={5}
                className="w-full px-4 py-3 rounded-lg bg-slate-100 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 focus:border-indigo-500 focus:outline-none transition-colors resize-none text-slate-900 dark:text-white placeholder:text-slate-500"
              />
            </div>
            <button
              type="submit"
              className="w-full py-3 rounded-lg bg-indigo-600 hover:bg-indigo-700 text-white font-medium transition-colors flex items-center justify-center gap-2"
            >
              {sent ? 'Sent!' : <><Send size={18} /> Send Message</>}
            </button>
          </motion.form>
        </div>
      </div>
    </section>
  )
}

export default Contact
