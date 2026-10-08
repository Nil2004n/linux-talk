import { motion } from 'framer-motion'
import Badge from './Badge'

/**
 * Section title card for major scene changes inside a Part.
 * Flat, left-aligned, one badge and one lead at most.
 */
export default function SectionTitleCard({ eyebrow, title, lead, badge = 'SLIDE', reduced = false }) {
  return (
    <motion.section
      className="rounded-md border border-line bg-abyss px-5 py-6 sm:px-8 sm:py-8"
      initial={reduced ? false : { opacity: 0 }}
      animate={{ opacity: 1 }}
      transition={{ duration: reduced ? 0 : 0.3, ease: [0.2, 0, 0, 1] }}
      aria-label={title}
    >
      <div className="flex flex-col items-start gap-2">
        <Badge kind={badge} size="sm" />
        {eyebrow ? (
          <p className="font-mono text-[0.75rem] tracking-[0.04em] text-ink-faint">{eyebrow}</p>
        ) : null}
        <h3 className="fs-h2 font-display font-semibold leading-tight text-ink">{title}</h3>
        {lead ? <p className="fs-body max-w-[52ch] text-ink-dim">{lead}</p> : null}
      </div>
    </motion.section>
  )
}
