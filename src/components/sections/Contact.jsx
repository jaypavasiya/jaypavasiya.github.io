import { useRef, useState } from 'react'
import { motion, useScroll, useTransform, useInView } from 'framer-motion'
import { Mail, Github, Linkedin, Twitter, MapPin, Send, CheckCircle, Loader2, ArrowUpRight, MessageCircle, Clock, Heart } from 'lucide-react'

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
      stats: '23 repos',
    },
    {
      icon: Linkedin,
      label: 'LinkedIn',
      href: 'https://www.linkedin.com/in/jaypavasiya',
      description: 'Connect',
      stats: '500+ connections',
    },
    {
      icon: Twitter,
      label: 'Twitter',
      href: 'https://twitter.com/jay_pavasiya',
      description: '@jay_pavasiya',
      stats: 'Follow',
    },
    {
      icon: Mail,
      label: 'Email',
      href: 'mailto:jaypavasiya7@gmail.com',
      description: 'Direct',
      stats: 'Fast response',
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
          <span className="inline-block text-accent font-mono text-sm tracking-wider uppercase mb-4">
            Get in Touch
          </span>
          <h2 className="text-4xl sm:text-5xl lg:text-6xl font-bold tracking-tight mb-6">
            Let's Work
            <br />
            <span className="text-gradient">Together</span>
          </h2>
          <p className="text-lg text-zinc-500 dark:text-zinc-400 max-w-2xl mx-auto">
            Have a project in mind or want to discuss opportunities? I'm always open to 
            new challenges and collaborations. Let's create something amazing together.
          </p>
        </motion.div>

        <div className="grid lg:grid-cols-5 gap-12 max-w-6xl mx-auto">
          {/* Contact Info - Left Column */}
          <motion.div
            initial={{ opacity: 0, x: -30 }}
            whileInView={{ opacity: 1, x: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.6 }}
            className="lg:col-span-2 space-y-8"
          >
            {/* Location */}
            <motion.div
              whileHover={{ scale: 1.02 }}
              className="flex items-start gap-4 p-6 rounded-2xl dark:bg-dark-800/50 bg-zinc-50 border border-zinc-200 dark:border-white/5"
            >
              <div className="p-3 rounded-xl bg-accent/10 text-accent">
                <MapPin size={24} />
              </div>
              <div>
                <h3 className="text-lg font-semibold text-zinc-900 dark:text-white mb-1">Location</h3>
                <p className="text-zinc-600 dark:text-zinc-400">Gujarat, India</p>
                <p className="text-sm text-zinc-500 dark:text-zinc-500 mt-1">
                  Available for remote work worldwide
                </p>
              </div>
            </motion.div>

            {/* Social Links */}
            <div className="space-y-4">
              <h3 className="text-lg font-semibold text-zinc-900 dark:text-white">Connect with me</h3>
              <div className="space-y-3">
                {socialLinks.map((social, index) => (
                  <motion.a
                    key={social.label}
                    href={social.href}
                    target="_blank"
                    rel="noopener noreferrer"
                    initial={{ opacity: 0, y: 20 }}
                    whileInView={{ opacity: 1, y: 0 }}
                    viewport={{ once: true }}
                    whileHover={{ scale: 1.02 }}
                    transition={{ delay: index * 0.1 }}
                    className="flex items-center justify-between p-4 rounded-xl dark:bg-dark-800/50 bg-zinc-50 border border-zinc-200 dark:border-white/5 hover:border-accent/30 transition-all duration-300 group"
                  >
                    <div className="flex items-center gap-4">
                      <div className="p-2.5 rounded-lg dark:bg-zinc-800 bg-white text-zinc-600 dark:text-zinc-400 group-hover:text-accent group-hover:bg-accent/10 transition-colors">
                        <social.icon size={20} />
                      </div>
                      <div>
                        <div className="text-sm font-medium text-zinc-900 dark:text-white">{social.label}</div>
                        <div className="text-xs text-zinc-500 dark:text-zinc-500">{social.description}</div>
                      </div>
                    </div>
                    <ArrowUpRight size={16} className="text-zinc-400 dark:text-zinc-600 group-hover:text-accent transition-colors" />
                  </motion.a>
                ))}
              </div>
            </div>

            {/* Quick Response */}
            <motion.div
              initial={{ opacity: 0 }}
              whileInView={{ opacity: 1 }}
              viewport={{ once: true }}
              className="p-6 rounded-2xl border bg-gradient-to-br from-accent/10 to-accent-light/5 border-accent/20"
            >
              <div className="flex items-center gap-3 mb-3">
                <Clock size={20} className="text-accent" />
                <h3 className="text-lg font-semibold text-zinc-900 dark:text-white">Quick Response</h3>
              </div>
              <p className="text-sm text-zinc-600 dark:text-zinc-400">
                I typically respond within 24 hours. For urgent inquiries, feel free to 
                reach out directly via email.
              </p>
            </motion.div>

            {/* Made with love */}
            <div className="flex items-center justify-center gap-2 text-sm text-zinc-500 dark:text-zinc-500">
              <span>Made with</span>
              <Heart size={14} className="text-red-500 animate-pulse" />
              <span>using React & Tailwind</span>
            </div>
          </motion.div>

          {/* Contact Form - Right Column */}
          <motion.div
            ref={formRef}
            initial={{ opacity: 0, x: 30 }}
            animate={isInView ? { opacity: 1, x: 0 } : {}}
            transition={{ duration: 0.6, delay: 0.2 }}
            className="lg:col-span-3"
          >
            <form
              onSubmit={handleSubmit}
              className="p-8 rounded-3xl dark:bg-dark-800/50 bg-white border border-zinc-200 dark:border-white/5 space-y-6"
            >
              {/* Name */}
              <div className="space-y-2">
                <label htmlFor="name" className="text-sm font-medium text-zinc-700 dark:text-zinc-300">
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
                  className="w-full px-4 py-3.5 rounded-xl dark:bg-dark-700/50 bg-zinc-100 border border-zinc-200 dark:border-white/5 text-zinc-900 dark:text-white placeholder:text-zinc-500 focus:outline-none focus:border-accent focus:ring-1 focus:ring-accent transition-all"
                />
              </div>

              {/* Email */}
              <div className="space-y-2">
                <label htmlFor="email" className="text-sm font-medium text-zinc-700 dark:text-zinc-300">
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
                  className="w-full px-4 py-3.5 rounded-xl dark:bg-dark-700/50 bg-zinc-100 border border-zinc-200 dark:border-white/5 text-zinc-900 dark:text-white placeholder:text-zinc-500 focus:outline-none focus:border-accent focus:ring-1 focus:ring-accent transition-all"
                />
              </div>

              {/* Subject */}
              <div className="space-y-2">
                <label htmlFor="subject" className="text-sm font-medium text-zinc-700 dark:text-zinc-300">
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
                  className="w-full px-4 py-3.5 rounded-xl dark:bg-dark-700/50 bg-zinc-100 border border-zinc-200 dark:border-white/5 text-zinc-900 dark:text-white placeholder:text-zinc-500 focus:outline-none focus:border-accent focus:ring-1 focus:ring-accent transition-all"
                />
              </div>

              {/* Message */}
              <div className="space-y-2">
                <label htmlFor="message" className="text-sm font-medium text-zinc-700 dark:text-zinc-300">
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
                  className="w-full px-4 py-3.5 rounded-xl dark:bg-dark-700/50 bg-zinc-100 border border-zinc-200 dark:border-white/5 text-zinc-900 dark:text-white placeholder:text-zinc-500 focus:outline-none focus:border-accent focus:ring-1 focus:ring-accent transition-all resize-none"
                />
              </div>

              {/* Submit Button */}
              <motion.button
                type="submit"
                disabled={isSubmitting || submitted}
                whileHover={{ scale: isSubmitting || submitted ? 1 : 1.02 }}
                whileTap={{ scale: isSubmitting || submitted ? 1 : 0.98 }}
                className={`w-full py-4 rounded-xl font-medium flex items-center justify-center gap-2 transition-all duration-300 ${
                  submitted
                    ? 'bg-green-500/20 text-green-600 dark:text-green-400 border border-green-500/30'
                    : 'text-white'
                } ${isSubmitting ? 'opacity-70 cursor-not-allowed bg-accent' : 'bg-accent hover:bg-accent-dark'}`}
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
          <p className="text-zinc-500 dark:text-zinc-500 mb-4">
            Prefer a more direct approach?
          </p>
          <motion.a
            href="mailto:jaypavasiya7@gmail.com"
            whileHover={{ scale: 1.02 }}
            className="inline-flex items-center gap-3 text-2xl sm:text-3xl font-bold text-zinc-900 dark:text-white hover:text-accent transition-colors"
          >
            jaypavasiya7@gmail.com
            <Mail size={28} />
          </motion.a>
        </motion.div>
      </motion.div>

      {/* Background decoration */}
      <div className="absolute bottom-0 left-1/2 -translate-x-1/2 w-[600px] h-[600px] bg-accent/5 rounded-full blur-[200px] pointer-events-none" />
    </section>
  )
}

export default Contact
