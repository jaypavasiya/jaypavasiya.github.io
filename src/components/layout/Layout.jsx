import { useState, useEffect, useRef } from 'react'
import { Link, useLocation } from 'react-router-dom'
import { motion, AnimatePresence } from 'framer-motion'
import { Menu, X, Github, Linkedin, Twitter, Mail, Sun, Moon } from 'lucide-react'
import { useTheme } from '../../hooks/useTheme'

const navItems = [
  { path: '/', label: 'Home' },
  { path: '/about', label: 'About' },
  { path: '/experience', label: 'Experience' },
  { path: '/skills', label: 'Skills' },
  { path: '/projects', label: 'Projects' },
  { path: '/contact', label: 'Contact' },
]

const socialLinks = [
  { icon: Github, href: 'https://github.com/jaypavasiya', label: 'GitHub' },
  { icon: Linkedin, href: 'https://www.linkedin.com/in/jaypavasiya', label: 'LinkedIn' },
  { icon: Twitter, href: 'https://twitter.com/jay_pavasiya', label: 'Twitter' },
  { icon: Mail, href: 'mailto:jaypavasiya7@gmail.com', label: 'Email' },
]

// Custom cursor component
const CustomCursor = () => {
  const cursorRef = useRef(null)
  const cursorDotRef = useRef(null)
  const [isHovering, setIsHovering] = useState(false)
  const [isVisible, setIsVisible] = useState(false)

  useEffect(() => {
    const cursor = cursorRef.current
    const cursorDot = cursorDotRef.current
    
    if (!cursor || !cursorDot) return

    let mouseX = 0
    let mouseY = 0
    let cursorX = 0
    let cursorY = 0
    let dotX = 0
    let dotY = 0

    const animate = () => {
      // Smooth cursor follow
      cursorX += (mouseX - cursorX) * 0.15
      cursorY += (mouseY - cursorY) * 0.15
      dotX += (mouseX - dotX) * 0.35
      dotY += (mouseY - dotY) * 0.35

      if (cursor) {
        cursor.style.transform = `translate(${cursorX - 20}px, ${cursorY - 20}px)`
      }
      if (cursorDot) {
        cursorDot.style.transform = `translate(${dotX - 3}px, ${dotY - 3}px)`
      }

      requestAnimationFrame(animate)
    }

    const handleMouseMove = (e) => {
      mouseX = e.clientX
      mouseY = e.clientY
      if (!isVisible) setIsVisible(true)
    }

    const handleMouseOver = (e) => {
      const target = e.target
      if (
        target.tagName === 'BUTTON' ||
        target.tagName === 'A' ||
        target.closest('button') ||
        target.closest('a') ||
        target.closest('[role="button"]')
      ) {
        setIsHovering(true)
      }
    }

    const handleMouseOut = () => {
      setIsHovering(false)
    }

    const handleMouseLeave = () => {
      setIsVisible(false)
    }

    animate()
    
    document.addEventListener('mousemove', handleMouseMove)
    document.addEventListener('mouseover', handleMouseOver)
    document.addEventListener('mouseout', handleMouseOut)
    document.documentElement.addEventListener('mouseleave', handleMouseLeave)

    return () => {
      document.removeEventListener('mousemove', handleMouseMove)
      document.removeEventListener('mouseover', handleMouseOver)
      document.removeEventListener('mouseout', handleMouseOut)
      document.documentElement.removeEventListener('mouseleave', handleMouseLeave)
    }
  }, [isVisible])

  // Hide on mobile
  if (typeof window !== 'undefined' && window.innerWidth < 768) {
    return null
  }

  return (
    <>
      {/* Cursor ring */}
      <div
        ref={cursorRef}
        className={`fixed top-0 left-0 w-10 h-10 rounded-full border border-accent/50 pointer-events-none z-[9998] transition-opacity duration-300 ${
          isVisible ? 'opacity-100' : 'opacity-0'
        } ${isHovering ? 'scale-150 border-accent bg-accent/10' : 'scale-100'}`}
      />
      {/* Cursor dot */}
      <div
        ref={cursorDotRef}
        className={`fixed top-0 left-0 w-1.5 h-1.5 rounded-full bg-accent pointer-events-none z-[9999] transition-opacity duration-300 ${
          isVisible ? 'opacity-100' : 'opacity-0'
        }`}
      />
    </>
  )
}

// Page transition wrapper
const PageTransition = ({ children }) => {
  const variants = {
    initial: { opacity: 0, y: 20 },
    enter: { opacity: 1, y: 0 },
    exit: { opacity: 0, y: -20 },
  }

  return (
    <motion.div
      initial="initial"
      animate="enter"
      exit="exit"
      variants={variants}
      transition={{ duration: 0.4, ease: [0.215, 0.61, 0.355, 1] }}
    >
      {children}
    </motion.div>
  )
}

const Layout = ({ children }) => {
  const [isScrolled, setIsScrolled] = useState(false)
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false)
  const [scrollProgress, setScrollProgress] = useState(0)
  const location = useLocation()
  const { theme, toggleTheme } = useTheme()

  useEffect(() => {
    const handleScroll = () => {
      setIsScrolled(window.scrollY > 50)

      // Calculate scroll progress
      const scrollHeight = document.documentElement.scrollHeight - window.innerHeight
      const currentProgress = scrollHeight > 0 ? window.scrollY / scrollHeight : 0
      setScrollProgress(currentProgress)
    }

    window.addEventListener('scroll', handleScroll, { passive: true })
    return () => window.removeEventListener('scroll', handleScroll)
  }, [])

  useEffect(() => {
    setIsMobileMenuOpen(false)
  }, [location])

  return (
    <div className="min-h-screen bg-[var(--color-bg)] text-[var(--color-text)]">
      {/* Custom cursor */}
      <CustomCursor />

      {/* Scroll Progress Bar */}
      <motion.div
        className="fixed top-0 left-0 right-0 h-[2px] bg-gradient-to-r from-accent via-accent-light to-accent origin-left z-[100] pointer-events-none"
        style={{ scaleX: scrollProgress }}
      />

      {/* Header */}
      <motion.header
        initial={{ y: -100, opacity: 0 }}
        animate={{ y: 0, opacity: 1 }}
        transition={{ duration: 0.6, ease: [0.215, 0.61, 0.355, 1], delay: 0.2 }}
        className={`fixed top-0 left-0 right-0 z-50 transition-all duration-500 ${
          isScrolled
            ? 'py-3 bg-[var(--color-bg)]/80 backdrop-blur-2xl border-b border-white/5'
            : 'py-5 bg-transparent'
        }`}
      >
        <nav className="container-custom flex items-center justify-between">
          {/* Logo */}
          <Link to="/" className="relative group">
            <motion.span
              whileHover={{ scale: 1.05 }}
              className="text-xl font-bold tracking-tight text-white"
            >
              JP
            </motion.span>
            <span className="absolute -bottom-1 left-0 w-0 h-[2px] bg-gradient-to-r from-accent to-accent-light transition-all duration-500 group-hover:w-full" />
          </Link>

          {/* Desktop Navigation */}
          <div className="hidden md:flex items-center gap-1">
            {navItems.map((item, index) => (
              <motion.div
                key={item.path}
                initial={{ opacity: 0, y: -10 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.1 + index * 0.05 }}
              >
                <Link
                  to={item.path}
                  className={`relative px-4 py-2 text-sm font-medium rounded-lg transition-colors duration-200 ${
                    location.pathname === item.path
                      ? 'text-white bg-white/5'
                      : 'text-zinc-400 hover:text-white hover:bg-white/5'
                  }`}
                >
                  {item.label}
                  {location.pathname === item.path && (
                    <motion.span
                      layoutId="activeNav"
                      className="absolute inset-0 rounded-lg bg-accent/10 -z-10"
                      transition={{ type: 'spring', stiffness: 300, damping: 30 }}
                    />
                  )}
                </Link>
              </motion.div>
            ))}
          </div>

          {/* Right side: Theme toggle + Mobile menu */}
          <div className="flex items-center gap-3">
            {/* Theme Toggle */}
            <motion.button
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
              onClick={toggleTheme}
              className="p-2.5 rounded-xl bg-white/5 hover:bg-white/10 border border-white/5 transition-colors"
              aria-label="Toggle theme"
            >
              <motion.div
                initial={false}
                animate={{ rotate: theme === 'dark' ? 0 : 180 }}
                transition={{ duration: 0.3 }}
              >
                {theme === 'dark' ? (
                  <Sun size={18} className="text-zinc-400" />
                ) : (
                  <Moon size={18} className="text-zinc-600" />
                )}
              </motion.div>
            </motion.button>

            {/* Mobile Menu Button */}
            <motion.button
              whileTap={{ scale: 0.95 }}
              onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
              className="md:hidden p-2.5 rounded-xl bg-white/5 hover:bg-white/10 border border-white/5 transition-colors"
              aria-label="Toggle menu"
            >
              <motion.div
                animate={{ rotate: isMobileMenuOpen ? 90 : 0 }}
                transition={{ duration: 0.2 }}
              >
                {isMobileMenuOpen ? (
                  <X size={20} />
                ) : (
                  <Menu size={20} />
                )}
              </motion.div>
            </motion.button>
          </div>
        </nav>
      </motion.header>

      {/* Mobile Menu */}
      <AnimatePresence>
        {isMobileMenuOpen && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.2 }}
            className="fixed inset-0 z-40 md:hidden"
          >
            <div
              className="absolute inset-0 bg-dark-900/95 backdrop-blur-xl"
              onClick={() => setIsMobileMenuOpen(false)}
            />
            <motion.div
              initial={{ x: '100%' }}
              animate={{ x: 0 }}
              exit={{ x: '100%' }}
              transition={{ duration: 0.3, ease: [0.215, 0.61, 0.355, 1] }}
              className="absolute right-0 top-0 bottom-0 w-full max-w-sm bg-dark-800/80 backdrop-blur-xl border-l border-white/5 p-8 pt-24"
            >
              <nav className="flex flex-col gap-2">
                {navItems.map((item, index) => (
                  <motion.div
                    key={item.path}
                    initial={{ opacity: 0, x: 50 }}
                    animate={{ opacity: 1, x: 0 }}
                    transition={{ delay: index * 0.05 }}
                  >
                    <Link
                      to={item.path}
                      className={`block py-4 px-4 text-2xl font-medium rounded-xl transition-colors ${
                        location.pathname === item.path
                          ? 'text-white bg-accent/10'
                          : 'text-zinc-400 hover:text-white hover:bg-white/5'
                      }`}
                    >
                      {item.label}
                    </Link>
                  </motion.div>
                ))}
              </nav>

              {/* Social links in mobile menu */}
              <motion.div
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                transition={{ delay: 0.3 }}
                className="flex gap-3 mt-8 pt-8 border-t border-white/5"
              >
                {socialLinks.map((social) => (
                  <a
                    key={social.label}
                    href={social.href}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="p-3 rounded-xl bg-white/5 hover:bg-white/10 transition-colors"
                    aria-label={social.label}
                  >
                    <social.icon size={20} />
                  </a>
                ))}
              </motion.div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Main Content with Page Transition */}
      <main>
        <AnimatePresence mode="wait">
          <motion.div
            key={location.pathname}
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -20 }}
            transition={{ duration: 0.3, ease: [0.215, 0.61, 0.355, 1] }}
          >
            {children}
          </motion.div>
        </AnimatePresence>
      </main>

      {/* Footer */}
      <footer className="border-t border-white/5 py-10 mt-20">
        <div className="container-custom">
          <div className="flex flex-col md:flex-row items-center justify-between gap-6">
            <motion.p
              initial={{ opacity: 0 }}
              whileInView={{ opacity: 1 }}
              viewport={{ once: true }}
              className="text-sm text-zinc-500"
            >
              &copy; {new Date().getFullYear()} Jay Pavasiya. Crafted with precision.
            </motion.p>
            
            <motion.div
              initial={{ opacity: 0 }}
              whileInView={{ opacity: 1 }}
              viewport={{ once: true }}
              className="flex items-center gap-5"
            >
              {socialLinks.map((social) => (
                <a
                  key={social.label}
                  href={social.href}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="text-zinc-500 hover:text-white transition-colors"
                  aria-label={social.label}
                >
                  <social.icon size={18} />
                </a>
              ))}
            </motion.div>
          </div>
        </div>
      </footer>
    </div>
  )
}

export default Layout
