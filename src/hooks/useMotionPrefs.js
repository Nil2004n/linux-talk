import { createContext, createElement, useContext, useEffect, useState } from 'react'
import { useReducedMotion } from 'framer-motion'
import { MOTION } from '../lib/constants'

const MotionPrefsContext = createContext(null)

/** Provides the deck-wide motion preference (OS reduced motion OR calm mode). */
export function MotionProvider({ reduced = false, children }) {
  return createElement(MotionPrefsContext.Provider, { value: { reduced } }, children)
}

/**
 * Single source of truth for motion in the deck.
 * `reduced` is true when the OS asks for reduced motion or when calm mode is
 * on; every animation in the app reads durations through `d()` so nothing has
 * to be re-plumbed.
 */
export function useMotionPrefs() {
  const override = useContext(MotionPrefsContext)
  const osReduced = !!useReducedMotion()
  const reduced = override ? !!override.reduced : osReduced

  /** Duration helper: returns 0 when motion is reduced. */
  const d = (seconds) => (reduced ? 0 : Math.min(seconds, MOTION.cap))

  /** Framer transition presets. */
  const t = {
    get fast() {
      return { duration: d(MOTION.fast), ease: [0.22, 1, 0.36, 1] }
    },
    get base() {
      return { duration: d(MOTION.base), ease: [0.16, 1, 0.3, 1] }
    },
    get slow() {
      return { duration: d(MOTION.slow), ease: [0.16, 1, 0.3, 1] }
    },
  }

  return { reduced, d, t }
}

/** Tracks a media query from JS (used by the background canvas). */
export function useMediaQuery(query) {
  const [matches, setMatches] = useState(
    () => typeof window !== 'undefined' && window.matchMedia(query).matches,
  )

  useEffect(() => {
    const mql = window.matchMedia(query)
    const onChange = (e) => setMatches(e.matches)
    onChange(mql)
    mql.addEventListener('change', onChange)
    return () => mql.removeEventListener('change', onChange)
  }, [query])

  return matches
}
