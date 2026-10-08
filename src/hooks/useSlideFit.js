import { useCallback, useEffect, useRef, useState } from 'react'

/**
 * Per-slide fit-to-viewport scaling.
 *
 * Every slide has room for exactly `100dvh`, but content density varies a lot
 * between a title card and a six-row comparison table. One global type scale
 * cannot fit both without either clipping or shrinking everything, so each
 * slide measures itself and gets a local `--h-scale` (the type scale and
 * `--gap-slide` are both built on it) just tight enough to fit.
 *
 * Shrinking is monotonic within a viewport size: the hook only ever *grows*
 * the scale back when the viewport itself changes. That asymmetry is what
 * prevents the measure -> scale -> resize-observer feedback loop that a naive
 * implementation falls into.
 *
 * @param minScale floor for the computed scale, so text stays readable
 */
export function useSlideFit(minScale = 0.7) {
  const ref = useRef(null)
  const [scale, setScale] = useState(1)
  const scaleRef = useRef(1)

  const apply = useCallback(
    (allowGrow) => {
      const root = ref.current
      if (!root) return
      const content = root.querySelector('[data-fit-content]')
      if (!content) return

      const available = root.clientHeight
      if (!available) return

      const current = scaleRef.current
      const needed = content.scrollHeight
      if (!needed) return

      // Correct multiplicatively against the CURRENT scale. Measuring the
      // unscaled height instead would over-shrink, because part of the box
      // (safe-area padding, min sizes, borders) does not scale with --h-scale.
      const ratio = available / needed
      let next = current * ratio

      // Below 1: always shrink, so a dense slide always settles.
      // Above 1: only grow on an explicit resize / font-load, otherwise the
      // measure -> scale -> resize-observer cycle oscillates forever.
      if (next > 1 && !allowGrow) return
      next = Math.max(minScale, Math.min(1, next))
      next = Math.round(next * 1000) / 1000

      if (Math.abs(next - current) > 0.004) {
        scaleRef.current = next
        setScale(next)
      }
    },
    [minScale],
  )

  useEffect(() => {
    const root = ref.current
    if (!root) return undefined

    let frame = 0
    const schedule = (allowGrow = false) => {
      cancelAnimationFrame(frame)
      frame = requestAnimationFrame(() => apply(allowGrow))
    }

    const content = root.querySelector('[data-fit-content]')
    const ro = new ResizeObserver(() => schedule(false))
    ro.observe(root)
    if (content) ro.observe(content)

    // Webfonts change metrics after first paint; re-measure once they land.
    document.fonts?.ready?.then(() => schedule(true)).catch(() => {})
    const onResize = () => schedule(true)
    window.addEventListener('resize', onResize)

    return () => {
      cancelAnimationFrame(frame)
      ro.disconnect()
      window.removeEventListener('resize', onResize)
    }
  }, [apply])

  return [ref, scale]
}
