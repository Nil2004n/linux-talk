import { motion } from 'framer-motion'
import { MOTION } from '../lib/constants'
import { useSlideFit } from '../hooks/useSlideFit'
import useOverflowAudit from '../hooks/useOverflowAudit'
import DecodeText from './DecodeText'

/**
 * Reusable slide shell.
 *
 * Owns: the full-viewport scroll-snap section, the semantic heading, the
 * entrance animation and fit-to-viewport scaling for dense slides.
 *
 * Fit strategy: the section is exactly `100dvh`, and the content column is
 * measured against it. When the content would overflow, a local `--h-scale`
 * `tight` trades a little vertical padding for content height without touching
 * type size: for the few slides whose content genuinely needs more room.
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
  fluid = false,
  replayToken = 0,
}) {
  const [fitRef, fitScale] = useSlideFit(0.7)
  // `id` is the full scene object plus its index ({ ...slide, index }), which
  // is exactly what the audit needs to locate `#slide-${index + 1}`.
  useOverflowAudit(id, import.meta.env.DEV)
  const dur = reduced ? 0 : MOTION.base
  const heading = headingId ?? `slide-${index + 1}-heading`
  const Heading = level === 1 ? 'h1' : 'h2'

  return (
    <section
      ref={fitRef}
      id={`slide-${index + 1}`}
      className={`relative z-10 flex w-full ${fluid ? 'min-h-[100dvh] py-20' : 'h-[100dvh] overflow-hidden'
        } ${align === 'top' ? 'items-start' : 'items-center'} ${className}`}
      aria-labelledby={kicker || title ? heading : undefined}
      aria-label={kicker || title ? undefined : `Slide ${index + 1}`}
      style={{ '--h-scale': fitScale }}
    >
      <div
        data-fit-content
        data-tight={tight || undefined}
        className="pad-slide mx-auto flex w-full max-w-[var(--slide-max)] flex-col justify-center px-[var(--shell-pad-x)] text-left"
      >
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
          key={replayToken}
          className="min-h-0"
          initial={reduced ? false : { opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ duration: dur, delay: reduced ? 0 : 0.05, ease: [0.2, 0, 0, 1] }}
        >
          {active ? children : <BodyPlaceholder height={id} />}
        </motion.div>
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
function BodyPlaceholder({ height }) {
  return (
    <div
      aria-hidden="true"
      data-body-placeholder={height}
      className="w-full"
      style={{ minHeight: '18rem' }}
    />
  )
}
