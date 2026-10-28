import { useEffect, useRef } from 'react'
import { fanfare, goalChime, isSoundOn, liftDing, onSoundChange, setMusicFloor, setMusicPlaying, whoosh } from './audio'
import { getGame, onGameEvent, runtime, subscribeGame } from './store'

/**
 * Game event sounds plus the music loop. Music only plays with sound on,
 * the music pref on, and the hero audible (on screen / full screen, tab
 * visible); it fades in and out around those.
 */
export function useGameAudio(audible: boolean) {
  const audibleRef = useRef(audible)
  audibleRef.current = audible

  useEffect(() => {
    const evaluate = (create = false) => {
      const g = getGame()
      setMusicFloor(g.status === 'riding' ? g.rideTo : g.floor)
      setMusicPlaying(isSoundOn() && g.music && audibleRef.current && !document.hidden, create)
    }
    evaluate()
    const offSound = onSoundChange(() => evaluate())
    const offGame = subscribeGame(() => evaluate())
    const offEvents = onGameEvent((e) => {
      if (e === 'cleared') goalChime()
      else if (e === 'finished') {
        goalChime()
        fanfare()
      } else if (e === 'ride-start') {
        liftDing()
        whoosh(runtime.ride.duration)
      } else if (e === 'ride-end') liftDing()
    })
    // A remembered "sound on" can only start audio from a gesture.
    const gesture = () => evaluate(true)
    const onVis = () => evaluate()
    document.addEventListener('pointerdown', gesture, { passive: true })
    document.addEventListener('keydown', gesture, { passive: true })
    document.addEventListener('visibilitychange', onVis)
    return () => {
      offSound()
      offGame()
      offEvents()
      document.removeEventListener('pointerdown', gesture)
      document.removeEventListener('keydown', gesture)
      document.removeEventListener('visibilitychange', onVis)
      setMusicPlaying(false)
    }
  }, [])

  useEffect(() => {
    const g = getGame()
    setMusicPlaying(isSoundOn() && g.music && audible && !document.hidden)
  }, [audible])
}
