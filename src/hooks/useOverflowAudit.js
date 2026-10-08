import { useEffect, useRef } from 'react'

/**
 * Overflow reporter. Runs in development only.
 *
 * The 24px body-text floor means a slide that does not fit is a CONTENT bug,
 * not a styling bug: the fix is shorter copy or a different layout, never
 * smaller type. This warns in the console during `npm run dev` so a dense
 * slide is caught while it is being written, not at 1366x768 on the projector.
 */
export default function useOverflowAudit(slide, enabled) {
  const reported = useRef(new Set())

  useEffect(() => {
    if (!enabled || slide == null || !Number.isInteger(slide.index)) return undefined
    const t = window.setTimeout(() => {
      // Section DOM ids are 1-based (`slide-1` …), scene indexes are 0-based.
      const el = document.querySelector(`#slide-${slide.index + 1}`)
      if (!el) return
      const over = el.scrollHeight - el.clientHeight
      if (over > 4 && !reported.current.has(slide.id)) {
        reported.current.add(slide.id)
        console.warn(
          `[slide-overflow] "${slide.id}" (slide ${slide.index + 1}) overflows by ${over}px ` +
            `at ${window.innerWidth}x${window.innerHeight}. Trim the copy or change the layout ` +
            `in scenes.js; do not shrink the type below 24px.`,
        )
      }
    }, 900)
    return () => window.clearTimeout(t)
  }, [slide.id, slide.index, enabled])
}
