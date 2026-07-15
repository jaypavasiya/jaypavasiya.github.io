import { useRef, useState } from 'react'
import { motion, useScroll, useTransform, useInView } from 'framer-motion'
import { Mail, Github, Linkedin, Twitter, MapPin, Send, CheckCircle, Loader2 } from 'lucide-react'

const Contact = () => {
  const containerRef = useRef()
  const formRef = useRef()
  const isInView = useInView(formRef, { once: true, margin: '-100px' })
  
  const { scrollYProgress } = useScroll({
    target: containerRef,
    offset: ['start end', 'end start'],
  })

  const y = useTransform(scrollYProgress, [0, 1], ['0%', '10%'])
  const [formState, setFormState] = useState({
    name: '',
    email: '',
    subject: '',
    message: '',
  })
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [submitted, setSubmitted] = useState(false)

  const handleSubmit = async (e) => {
    e.preventDefault()
    setIsSubmitting(true)
    
    // Simulate form submission
    await new Promise(resolve => setTimeout(resolve, 1500))
    
    setIsSubmitting(false)
    setSubmitted(true)
    setFormState({ name: '', email: '', subject: '', message: '' })
    
    // Reset success message after 5 seconds
    setTimeout(() => setSubmitted(false), 5000)
  }

  const handleChange = (e) => {
    setFormState(prev => ({
      ...prev,
      [e.target.name]: e.target.value,
    }))
  }

  const socialLinks = [
    {
      icon: Github,
      label: 'GitHub',
      href: 'https://github.com/jaypavasiya',
      description: '@jaypavasiya',
    },
    {
      icon: Linkedin,
      label: 'LinkedIn',
      href: 'https://www.linkedin.com/in/jaypavasiya',
      description: 'Connect with me',
    },
    {
      icon: Twitter,
      label: 'Twitter',
      href: 'https://twitter.com/jay_pavasiya',
      description: '@jay_pavasiya',
    },
    {
      icon: Mail,
      label: 'Email',
      href: 'mailto:jaypavasiya7@gmail.com',
      description: 'jaypavasiya7@gmail.com',
    },
  ]

  return (
    <section id="contact" ref={containerRef} className="relative py-32 overflow-hidden">
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
            Get in Touch
          </span>
          <h2 className="text-4xl sm:text-5xl lg:text-6xl font-bold tracking-tight">
            Let's Work
            <br />
            <span className="text-gradient">Together</span>
          </h2>
          <p className="mt-6 text-lg text-[var(--color-text-secondary)] max-w-2xl mx-auto">
            Have a project in mind or want to discuss opportunities? I'm always open to 
            new challenges and collaborations. Let's create something amazing together.
          </p>
        </motion.div>

        <div className="grid lg:grid-cols-2 gap-12 max-w-6xl mx-auto">
          {/* Contact Info */}
          <motion.div
            initial={{ opacity: 0, x: -30 }}
            whileInView={{ opacity: 1, x: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.6 }}
            className="space-y-8"
          >
            {/* Location */}
            <div className="flex items-start gap-4 p-6 rounded-2xl bg-dark-800/50 border border-dark-700">
              <div className="p-3 rounded-xl bg-accent/10 text-accent">
                <MapPin size={24} />
              </div>
              <div>
                <h3 className="text-lg font-semibold text-white mb-1">Location</h3>
                <p className="text-[var(--color-text-secondary)]">Gujarat, India</p>
                <p className="text-sm text-[var(--color-text-secondary)] mt-1">
                  Available for remote work worldwide
                </p>
              </div>
            </div>

            {/* Social Links */}
            <div className="space-y-4">
              <h3 className="text-lg font-semibold text-white">Connect with me</h3>
              <div className="grid sm:grid-cols-2 gap-4">
                {socialLinks.map((social, index) => (
                  <motion.a
                    key={social.label}
                    href={social.href}
                    target="_blank"
                    rel="noopener noreferrer"
                    initial={{ opacity: 0, y: 20 }}
                    whileInView={{ opacity: 1, y: 0 }}
                    viewport={{ once: true }}
                    transition={{ duration: 0.4, delay: index * 0.1 }}
                    className="group flex items-center gap-4 p-4 rounded-xl bg-dark-800/50 border border-dark-700 hover:border-accent/50 transition-all duration-300"
                  >
                    <div className="p-2.5 rounded-lg bg-dark-700 text-zinc-400 group-hover:text-accent group-hover:bg-accent/10 transition-colors">
                      <social.icon size={20} />
                    </div>
                    <div>
                      <div className="text-sm font-medium text-white">{social.label}</div>
                      <div className="text-xs text-[var(--color-text-secondary)]">
                        {social.description}
                      </div>
                    </div>
                  </motion.a>
                ))}
              </div>
            </div>

            {/* Quick Response */}
            <div className="p-6 rounded-2xl bg-gradient-to-br from-accent/20 to-accent-light/10 border border-accent/20">
              <h3 className="text-lg font-semibold text-white mb-2">Quick Response</h3>
              <p className="text-[var(--color-text-secondary)] text-sm">
                I typically respond within 24 hours. For urgent inquiries, feel free to 
                reach out directly via email.
              </p>
            </div>
          </motion.div>

          {/* Contact Form */}
          <motion.div
            ref={formRef}
            initial={{ opacity: 0, x: 30 }}
            animate={isInView ? { opacity: 1, x: 0 } : {}}
            transition={{ duration: 0.6, delay: 0.2 }}
            className="relative"
          >
            <form
              onSubmit={handleSubmit}
              className="p-8 rounded-3xl bg-dark-800/50 border border-dark-700 space-y-6"
            >
              {/* Name */}
              <div className="space-y-2">
                <label htmlFor="name" className="text-sm font-medium text-white">
                  Name
                </label>
                <input
                  type="text"
                  id="name"
                  name="name"
                  value={formState.name}
                  onChange={handleChange}
                  required
                  placeholder="Your name"
                  className="w-full px-4 py-3 rounded-xl bg-dark-700/50 border border-dark-600 text-white placeholder:text-zinc-500 focus:outline-none focus:border-accent focus:ring-1 focus:ring-accent transition-all"
                />
              </div>

              {/* Email */}
              <div className="space-y-2">
                <label htmlFor="email" className="text-sm font-medium text-white">
                  Email
                </label>
                <input
                  type="email"
                  id="email"
                  name="email"
                  value={formState.email}
                  onChange={handleChange}
                  required
                  placeholder="your@email.com"
                  className="w-full px-4 py-3 rounded-xl bg-dark-700/50 border border-dark-600 text-white placeholder:text-zinc-500 focus:outline-none focus:border-accent focus:ring-1 focus:ring-accent transition-all"
                />
              </div>

              {/* Subject */}
              <div className="space-y-2">
                <label htmlFor="subject" className="text-sm font-medium text-white">
                  Subject
                </label>
                <input
                  type="text"
                  id="subject"
                  name="subject"
                  value={formState.subject}
                  onChange={handleChange}
                  required
                  placeholder="What's this about?"
                  className="w-full px-4 py-3 rounded-xl bg-dark-700/50 border border-dark-600 text-white placeholder:text-zinc-500 focus:outline-none focus:border-accent focus:ring-1 focus:ring-accent transition-all"
                />
              </div>

              {/* Message */}
              <div className="space-y-2">
                <label htmlFor="message" className="text-sm font-medium text-white">
                  Message
                </label>
                <textarea
                  id="message"
                  name="message"
                  value={formState.message}
                  onChange={handleChange}
                  required
                  rows={5}
                  placeholder="Tell me about your project..."
                  className="w-full px-4 py-3 rounded-xl bg-dark-700/50 border border-dark-600 text-white placeholder:text-zinc-500 focus:outline-none focus:border-accent focus:ring-1 focus:ring-accent transition-all resize-none"
                />
              </div>

              {/* Submit Button */}
              <motion.button
                type="submit"
                disabled={isSubmitting || submitted}
                whileHover={{ scale: 1.02 }}
                whileTap={{ scale: 0.98 }}
                className={`w-full py-4 rounded-xl font-medium flex items-center justify-center gap-2 transition-all duration-300 ${
                  submitted
                    ? 'bg-green-500/20 text-green-400 border border-green-500/30'
                    : 'bg-accent hover:bg-accent-dark text-white'
                } ${isSubmitting ? 'opacity-70 cursor-not-allowed' : ''}`}
              >
                {isSubmitting ? (
                  <>
                    <Loader2 size={18} className="animate-spin" />
                    Sending...
                  </>
                ) : submitted ? (
                  <>
                    <CheckCircle size={18} />
                    Message Sent!
                  </>
                ) : (
                  <>
                    <Send size={18} />
                    Send Message
                  </>
                )}
              </motion.button>
            </form>

            {/* Form decoration */}
            <div className="absolute -z-10 inset-0 -translate-x-4 -translate-y-4 rounded-3xl bg-gradient-to-br from-accent/10 to-transparent opacity-0 group-hover:opacity-100 transition-opacity" />
          </motion.div>
        </div>

        {/* Bottom CTA */}
        <motion.div
          initial={{ opacity: 0, y: 30 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.6 }}
          className="mt-20 text-center"
        >
          <p className="text-[var(--color-text-secondary)] mb-4">
            Prefer a more direct approach?
          </p>
          <a
            href="mailto:jaypavasiya7@gmail.com"
            className="inline-flex items-center gap-2 text-2xl sm:text-3xl font-bold text-white hover:text-accent transition-colors"
          >
            jaypavasiya7@gmail.com
            <Mail size={24} />
          </a>
        </motion.div>
      </motion.div>

      {/* Background decoration */}
      <div className="absolute bottom-0 left-1/2 -translate-x-1/2 w-[600px] h-[600px] bg-accent/5 rounded-full blur-[200px] pointer-events-none" />
    </section>
  )
}

export default Contact
