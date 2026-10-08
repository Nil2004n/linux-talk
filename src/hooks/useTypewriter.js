import { useEffect, useMemo, useRef, useState } from 'react'
import { useMotionPrefs } from './useMotionPrefs'

/**
 * Types text character by character, then resolves when done.
 * The effect restarts whenever `text` changes, so a slide entry replays the
 * typing without any remount bookkeeping.
 *
 * Returns the visible slice plus `done` so callers can chain follow-up lines.
 */
export function useTypewriter(
  text = '',
  { speed = 42, startDelay = 0, enabled = true, cursor = false } = {},
) {
  const { reduced } = useMotionPrefs()
  const fullLength = useMemo(() => Array.from(text ?? '').length, [text])

  // Reduced motion: show the finished string immediately, with no typing.
  const [count, setCount] = useState(() => (enabled && reduced ? fullLength : 0))
  const [done, setDone] = useState(() => !enabled || reduced)
  const tick = useRef(0)

  useEffect(() => {
    if (!enabled || reduced) return undefined

    let i = 0
    const begin = window.setTimeout(() => {
      tick.current = window.setInterval(() => {
        i += 1
        setCount(i)
        if (i >= fullLength) {
          window.clearInterval(tick.current)
          setDone(true)
        }
      }, speed)
    }, startDelay)

    return () => {
      window.clearTimeout(begin)
      window.clearInterval(tick.current)
    }
  }, [fullLength, speed, startDelay, enabled, reduced])

  const chars = useMemo(() => Array.from(text ?? ''), [text])
  const visible = chars.slice(0, count).join('')

  return {
    text: visible,
    done,
    progress: fullLength ? count / fullLength : 1,
    caret: cursor && !done,
  }
}
