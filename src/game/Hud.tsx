import { useEffect, useRef, useState } from 'react'
import { profile } from '../content/profile'
import { isSoundOn, onSoundChange, setSound } from '../lib/sound'
import { FLOOR_COUNT, FLOORS, playAgain, restartFloor, setMusicPref, skipFloor } from './store'
import { useGame } from './useGame'
import './Hud.css'

type Props = {
  reducedMotion: boolean
  fullscreen: boolean
  onReadMore: () => void
}

function useSoundOn() {
  const [on, setOn] = useState(isSoundOn)
  useEffect(() => onSoundChange(setOn), [])
  return on
}

const Icon = {
  music: (
    <svg viewBox="0 0 16 16" width="14" height="14" aria-hidden="true">
      <path d="M6 12.5V3.5l7-1.5v9" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" />
      <circle cx="4.4" cy="12.5" r="1.7" fill="currentColor" />
      <circle cx="11.4" cy="11" r="1.7" fill="currentColor" />
    </svg>
  ),
  skip: (
    <svg viewBox="0 0 16 16" width="14" height="14" aria-hidden="true">
      <path d="M8 13.5V3M3.5 7.5 8 3l4.5 4.5" fill="none" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round" strokeLinejoin="round" />
    </svg>
  ),
  restart: (
    <svg viewBox="0 0 16 16" width="14" height="14" aria-hidden="true">
      <path d="M13.5 8a5.5 5.5 0 1 1-1.6-3.9M13.5 2.5v3h-3" fill="none" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round" strokeLinejoin="round" />
    </svg>
  ),
}

export function Hud({ reducedMotion, fullscreen, onReadMore }: Props) {
  const g = useGame()
  const soundOn = useSoundOn()
  const meta = FLOORS[g.floor]
  const riding = g.status === 'riding'
  const cleared = g.status === 'cleared' || g.status === 'finished'
  const musicOn = soundOn && g.music
  const shown = riding ? g.rideTo : g.floor
  const pct = cleared ? 1 : g.total > 0 ? Math.min(1, g.progress / g.total) : 0
  const goal = riding ? `Going up to ${FLOORS[g.rideTo].name}…` : cleared ? meta.done : meta.goal

  const onMusic = () => {
    if (!soundOn) {
      setMusicPref(true)
      setSound(true)
    } else setMusicPref(!g.music)
  }

  return (
    <>
      <section className={`game-hud${fullscreen ? ' is-full' : ''}${cleared ? ' is-cleared' : ''}`} aria-label="Game">
        <ol className="game-hud__map" aria-hidden="true">
          {Array.from({ length: FLOOR_COUNT }, (_, i) => FLOOR_COUNT - 1 - i).map((i) => (
            <li key={i} className={`${i === shown ? 'is-here' : ''}${g.cleared[i] ? ' is-done' : ''}`} />
          ))}
        </ol>
        <div className="game-hud__main">
          <p className="game-hud__floor mono">
            <span>
              <span className="game-hud__word">Floor </span>
              {shown + 1}/{FLOOR_COUNT}
            </span>
            <span className="game-hud__sep" aria-hidden="true">
              ·
            </span>
            <span className="game-hud__name">{FLOORS[shown].name}</span>
          </p>
          <p className="game-hud__goal">
            <span className="game-hud__goal-text">{goal}</span>
            {!riding && (
              <span className="game-hud__count mono">{cleared ? 'Done' : `${Math.min(g.progress, g.total)}/${g.total}`}</span>
            )}
          </p>
          <div className="game-hud__bar" aria-hidden="true">
            <span style={{ transform: `scaleX(${riding ? 1 : pct})` }} />
          </div>
          {g.detail && !riding && <p className="game-hud__detail mono">{g.detail}</p>}
          <div className="game-hud__buttons">
            <button type="button" className={`game-btn${musicOn ? ' is-on' : ''}`} aria-pressed={musicOn} onClick={onMusic} title={soundOn ? 'Music' : 'Turns sound on'}>
              {Icon.music}
              <span>Music</span>
            </button>
            <button type="button" className="game-btn" onClick={() => skipFloor(reducedMotion)} disabled={riding || g.floor >= FLOOR_COUNT - 1}>
              {Icon.skip}
              <span>Skip floor</span>
            </button>
            <button type="button" className="game-btn" onClick={restartFloor} disabled={riding}>
              {Icon.restart}
              <span>Restart</span>
            </button>
          </div>
        </div>
      </section>
      <p className="visually-hidden" aria-live="polite" aria-atomic="true">
        {g.announce.text}
        {/* A zero-width variant so repeats are re-announced. */}
        {g.announce.seq % 2 ? '​' : ''}
      </p>
      {g.status === 'finished' && <RoofCard onReadMore={onReadMore} />}
    </>
  )
}

function RoofCard({ onReadMore }: { onReadMore: () => void }) {
  const [copied, setCopied] = useState(false)
  const heading = useRef<HTMLHeadingElement>(null)
  useEffect(() => {
    heading.current?.focus({ preventScroll: true })
  }, [])

  const copy = async () => {
    try {
      await navigator.clipboard.writeText(profile.email)
      setCopied(true)
    } catch {
      // Fallback: select a hidden field and copy.
      const t = document.createElement('textarea')
      t.value = profile.email
      t.setAttribute('readonly', '')
      t.style.position = 'fixed'
      t.style.opacity = '0'
      document.body.appendChild(t)
      t.select()
      try {
        document.execCommand('copy')
        setCopied(true)
      } catch {
        setCopied(false)
      }
      t.remove()
    }
  }
  useEffect(() => {
    if (!copied) return
    const id = setTimeout(() => setCopied(false), 2000)
    return () => clearTimeout(id)
  }, [copied])

  return (
    <div className="game-card" role="dialog" aria-modal="false" aria-labelledby="game-card-title">
      <p className="game-card__eyebrow mono">Floor 5/5 · Rooftop · You made it</p>
      <h2 id="game-card-title" className="game-card__title" ref={heading} tabIndex={-1}>
        Say hello
      </h2>
      <div className="game-card__mail">
        <a href={`mailto:${profile.email}`} className="game-card__email">
          {profile.email}
        </a>
        <button type="button" className="game-btn" onClick={copy} aria-label={copied ? 'Email copied' : 'Copy email address'}>
          {copied ? 'Copied' : 'Copy'}
        </button>
      </div>
      <p className="game-card__note mono" aria-live="polite">
        {copied ? 'Copied to clipboard' : 'Scroll down to read everything'}
      </p>
      <div className="game-card__actions">
        <button type="button" className="game-btn game-btn--solid" onClick={playAgain}>
          Play again
        </button>
        <button type="button" className="game-btn" onClick={onReadMore}>
          Read everything ↓
        </button>
      </div>
    </div>
  )
}
