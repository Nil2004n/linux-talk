import { motion } from 'framer-motion'

/**
 * Animated spinning-platter diagram: a rotating disk, a sweeping arm, and
 * the three costs of one read — seek, rotation, transfer.
 */
export default function SpinningPlatter({ reduced = false }) {
  return (
    <div className="flex items-center gap-4 rounded-md border border-line bg-abyss p-4" role="img" aria-label="Spinning disk platter with a read-write arm">
      <div className="relative h-28 w-28 shrink-0" aria-hidden="true">
        <div
          className="absolute inset-0 rounded-full border border-line"
        />
        <span className="absolute left-1/2 top-1/2 h-3 w-3 -translate-x-1/2 -translate-y-1/2 rounded-full bg-ink-faint" />
        <span
          className="absolute left-1/2 top-1/2 h-[2px] w-12 origin-left rounded bg-ink-faint"
          style={{ transform: 'rotate(-30deg)' }}
        />
      </div>
      <ul className="flex min-w-0 flex-1 flex-col gap-1.5">
        {[
          ['seek time', 'arm glides to the cylinder'],
          ['rotational latency', 'platter spins data under the head'],
          ['transfer time', 'bits finally flow'],
        ].map(([label, text], i) => (
          <motion.li
            key={label}
            className="flex items-baseline gap-2 text-[clamp(0.9rem,1.1vw,1.05rem)]"
            initial={reduced ? false : { opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ duration: reduced ? 0 : 0.2, delay: reduced ? 0 : Math.min(0.12, i * 0.06) }}
          >
            <span className="shrink-0 font-mono text-ink">
              {label}
            </span>
            <span className="text-ink-dim">{text}</span>
          </motion.li>
        ))}
      </ul>
    </div>
  )
}
