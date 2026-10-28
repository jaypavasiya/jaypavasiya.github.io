import { useEffect, useState } from 'react'
import { initSound, isSoundOn, onSoundChange, setSound } from '../lib/sound'

export function SoundToggle() {
  const [on, setOn] = useState(isSoundOn)

  useEffect(() => {
    initSound()
    return onSoundChange(setOn)
  }, [])

  return (
    <button
      type="button"
      className={`nav-sound${on ? ' is-on' : ''}`}
      data-sound-toggle=""
      aria-pressed={on}
      aria-label="Interface sounds"
      title={on ? 'Sound on' : 'Sound off'}
      onClick={() => setSound(!on)}
    >
      <svg width="18" height="18" viewBox="0 0 18 18" aria-hidden="true">
        <path d="M2.5 6.75h2.5L9 3.5v11L5 11.25H2.5z" fill="currentColor" />
        <g className="nav-sound-waves" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round">
          <path d="M11.6 6.6a3.4 3.4 0 0 1 0 4.8" />
          <path d="M13.8 4.6a6.2 6.2 0 0 1 0 8.8" />
        </g>
        <g className="nav-sound-mute" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round">
          <path d="m11.5 7 4 4M15.5 7l-4 4" />
        </g>
      </svg>
    </button>
  )
}
