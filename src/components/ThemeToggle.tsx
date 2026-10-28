import { useEffect, useState } from 'react'

type Theme = 'light' | 'dark'

const systemTheme = (): Theme => (window.matchMedia('(prefers-color-scheme: dark)').matches ? 'dark' : 'light')

function readStored(): Theme | null {
  try {
    const v = localStorage.getItem('theme')
    return v === 'light' || v === 'dark' ? v : null
  } catch {
    return null
  }
}

export function ThemeToggle() {
  const [theme, setTheme] = useState<Theme>(() => readStored() ?? systemTheme())

  useEffect(() => {
    const stored = readStored()
    if (stored) document.documentElement.dataset.theme = stored
  }, [])

  const toggle = () => {
    const next: Theme = theme === 'dark' ? 'light' : 'dark'
    const apply = () => {
      document.documentElement.dataset.theme = next
      setTheme(next)
      window.dispatchEvent(new CustomEvent('themechange', { detail: next }))
    }
    try {
      localStorage.setItem('theme', next)
    } catch {
      // Private mode: the toggle still works for this visit.
    }
    // Wipe the new theme in from the top where the view transitions API exists.
    const doc = document as Document & { startViewTransition?: (cb: () => void) => unknown }
    if (doc.startViewTransition && !window.matchMedia('(prefers-reduced-motion: reduce)').matches) doc.startViewTransition(apply)
    else apply()
  }

  return (
    <button
      type="button"
      className="theme-toggle"
      onClick={toggle}
      aria-label={`Switch to ${theme === 'dark' ? 'light' : 'dark'} theme`}
      style={{
        width: 36,
        height: 36,
        borderRadius: '50%',
        border: '1px solid var(--line)',
        background: 'var(--paper)',
        cursor: 'pointer',
        display: 'grid',
        placeItems: 'center',
      }}
    >
      <svg width="16" height="16" viewBox="0 0 16 16" aria-hidden="true">
        <circle cx="8" cy="8" r="6.5" fill="none" stroke="currentColor" strokeWidth="1.5" />
        <path d="M8 1.5a6.5 6.5 0 0 1 0 13z" fill="currentColor" />
      </svg>
    </button>
  )
}
