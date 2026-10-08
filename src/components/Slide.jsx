import { useEffect, useRef, useState } from 'react'
import { motion } from 'framer-motion'
import { MOTION } from '../lib/constants'
import useOverflowAudit from '../hooks/useOverflowAudit'
import { SceneVisibleProvider } from '../hooks/useSceneVisible'
import DecodeText from './DecodeText'

/**
 * Reusable section shell for the continuous page.
 *
 * Owns: the semantic heading, the entrance animation and, in development,
 * the overflow audit. Sections stack in normal flow with generous vertical
 * padding — there is no viewport-snapping or fixed-height clipping.
 */
export default function Slide({
  index = 0,
  total = 1,
  part = 'intro',
  kicker,
  title,
  lead,
  children,
  reduced = false,
  align = 'center',
  className = '',
  headingId,
  tight = false,
  level = 2,
  id,
  /** Rendered only when near the viewport; see `deferBody` in App. */
  active = true,
}) {
  // `id` is the full scene object plus its index ({ ...slide, index }), which
  // is exactly what the audit needs to locate `#slide-${index + 1}`.
  useOverflowAudit(id, import.meta.env.DEV)
  const dur = reduced ? 0 : MOTION.base
  const heading = headingId ?? `slide-${index + 1}-heading`
  const Heading = level === 1 ? 'h1' : 'h2'

  // Animation gate: children mount while this scene is within ±2 of the
  // active one (stable heights), but autoplay timers should only start once
  // the scene itself is on screen. Monotonic — once seen, stays seen.
  const sectionRef = useRef(null)
  const [seen, setSeen] = useState(false)
  useEffect(() => {
    const el = sectionRef.current
    if (!el || seen) return undefined
    // Trigger on a band through the middle of the viewport, not a ratio:
    // ratio thresholds can never fire for sections taller than the viewport.
    const io = new IntersectionObserver(
      (entries) => {
        if (entries.some((e) => e.isIntersecting)) {
          setSeen(true)
          io.disconnect()
        }
      },
      { rootMargin: '-25% 0px -35% 0px', threshold: 0 },
    )
    io.observe(el)
    return () => io.disconnect()
  }, [sectionRef, seen])

  return (
    <section
      ref={(el) => { sectionRef.current = el }}
      id={`slide-${index + 1}`}
      className={`relative z-10 flex w-full scroll-mt-4 ${
        align === 'top' ? 'items-start' : 'items-center'
      } ${className}`}
      aria-labelledby={kicker || title ? heading : undefined}
      aria-label={kicker || title ? undefined : `Slide ${index + 1}`}
    >
      <div
        data-fit-content
        data-tight={tight || undefined}
        className="pad-slide mx-auto flex w-full max-w-[var(--slide-max)] flex-col justify-center px-[var(--shell-pad-x)] text-left"
      >
        <SceneVisibleProvider value={seen}>
        {(kicker || title) && (
          <motion.header
            className="mb-3 shrink-0"
            initial={reduced ? false : { opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ duration: dur, ease: [0.2, 0, 0, 1] }}
          >
            <p className="fs-kicker mb-1.5 font-mono tracking-[0.04em] text-ink-faint">
              {part} / {index + 1}
              {kicker ? <span className="text-ink-faint"> · {kicker}</span> : null}
            </p>
            {title ? (
              <DecodeText
                as={Heading}
                id={heading}
                className="fs-h2 text-ink"
                text={title}
              />
            ) : null}
            {lead ? <p className="fs-body-sm mt-2.5 max-w-[64ch] text-ink-dim">{lead}</p> : null}
          </motion.header>
        )}

        <motion.div
          className="min-h-0"
          initial={reduced ? false : { opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ duration: dur, delay: reduced ? 0 : 0.05, ease: [0.2, 0, 0, 1] }}
        >
          {active ? children : <BodyPlaceholder sceneId={id?.id ?? index} />}
        </motion.div>
        </SceneVisibleProvider>
      </div>
      <p
        aria-hidden="true"
        className="pointer-events-none absolute bottom-4 right-6 font-mono text-[0.85rem] tabular-nums text-ink-faint"
      >
        {index + 1} / {total}
      </p>
    </section>
  )
}

/**
 * Keeps the layout height stable for a body that is not rendered yet, so
 * scrolling to a slide and watching it mount never shifts the page (CLS).
 */
function BodyPlaceholder({ sceneId }) {
  return (
    <div
      aria-hidden="true"
      data-body-placeholder={sceneId}
      className="w-full"
      style={{ minHeight: '18rem' }}
    />
  )
}
