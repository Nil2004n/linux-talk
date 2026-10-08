import { createContext, useContext } from 'react'

/**
 * Per-scene visibility flag.
 *
 * Scene bodies mount while they are within ±2 of the active scene (so the
 * layout and placeholders stay stable), which means autoplay animations
 * would otherwise run while the scene is still off-screen. Slide publishes
 * whether THIS scene is actually crossing the viewport band, and autoplay
 * components delay their timers until it flips true.
 */
const SceneVisibleContext = createContext(true)

export const SceneVisibleProvider = SceneVisibleContext.Provider

export function useSceneVisible() {
  return useContext(SceneVisibleContext)
}
