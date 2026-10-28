import { useSyncExternalStore } from 'react'
import { getGame, subscribeGame } from './store'

export function useGame() {
  return useSyncExternalStore(subscribeGame, getGame, getGame)
}

/** Subscribes to one primitive slice, so unrelated updates don't re-render. */
export function useGameValue<T extends string | number | boolean>(select: (s: ReturnType<typeof getGame>) => T) {
  return useSyncExternalStore(subscribeGame, () => select(getGame()), () => select(getGame()))
}
