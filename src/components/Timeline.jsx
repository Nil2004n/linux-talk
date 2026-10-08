import { motion } from 'framer-motion'

/**
 * Horizontal timeline. A single hairline rail with numbered events in
 * sequence — no gradients, no glow.
 */
export default function Timeline({ events = [], reduced = false }) {
  return (
    <div className="relative">
      <div
        aria-hidden="true"
        className="absolute left-0 right-0 top-[1.35rem] hidden h-px bg-line lg:block"
      />

      <ol className="grid grid-cols-1 gap-3 sm:grid-cols-2 lg:grid-cols-4">
        {events.map((e, i) => (
          <li key={e.year + e.title} className="relative">
            <motion.div
              className="relative h-full rounded-md border border-line bg-abyss p-4"
              initial={reduced ? false : { opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{
                duration: reduced ? 0 : 0.25,
                delay: reduced ? 0 : Math.min(0.12, 0.05 + i * 0.06),
              }}
            >
              <div className="flex items-center gap-2.5">
                <span
                  aria-hidden="true"
                  className="grid h-8 w-8 shrink-0 place-items-center rounded-md border border-line bg-abyss font-mono text-[0.7rem] text-ink-dim"
                >
                  {i + 1}
                </span>
                <span className="font-mono text-[clamp(1rem,1.35vw,1.3rem)] font-medium tabular-nums text-ink">
                  {e.year}
                </span>
              </div>

              <h3 className="mt-2 font-display text-[clamp(1.1rem,1.5vw,1.45rem)] font-semibold text-ink">
                {e.title}
              </h3>
              <p className="mt-1 text-[clamp(0.9rem,1.15vw,1.1rem)] leading-relaxed text-ink-dim">
                {e.text}
              </p>
            </motion.div>
          </li>
        ))}
      </ol>
    </div>
  )
}
