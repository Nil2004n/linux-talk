import { useState } from 'react'
import { motion } from 'framer-motion'

/**
 * Animated folder-to-archive illustration.
 * The folder visually compresses into a smaller archive box with its command.
 */
export default function ArchiveBox({ source = 'project/', archive = 'project.tar.gz', command = 'tar -czvf project.tar.gz project/', reduced = false }) {
  const [packed, setPacked] = useState(false)

  return (
    <div className="rounded-md border border-line bg-abyss p-4">
      <div className="flex h-36 items-center justify-center gap-6" aria-hidden="true">
        <motion.div
          className="grid h-24 w-28 place-items-center rounded-md border border-line bg-abyss"
          animate={reduced ? {} : { scaleX: packed ? 0.62 : 1, opacity: packed ? 0.65 : 1 }}
          transition={{ duration: reduced ? 0 : 0.3, ease: [0.2, 0, 0, 1] }}
        >
          <span className="font-mono text-[0.8rem] text-ink-dim">{source}</span>
        </motion.div>
        <span className="font-mono text-xl text-ink-faint">
          →
        </span>
        <motion.div
          className="grid h-20 w-20 place-items-center rounded-md border border-line bg-abyss"
          animate={reduced ? {} : { scale: packed ? 1.06 : 1 }}
          transition={{ duration: reduced ? 0 : 0.3, ease: [0.2, 0, 0, 1] }}
        >
          <span className="px-1 text-center font-mono text-[0.68rem] text-ink">{archive}</span>
        </motion.div>
      </div>
      <p className="mt-1 text-center font-mono text-[clamp(0.95rem,1.2vw,1.15rem)]">
        <span className="text-ink-faint">$ </span>
        <span className="font-semibold text-ink">{command}</span>
      </p>
      <div className="mt-2 flex justify-center">
        <button
          type="button"
          onClick={() => setPacked((p) => !p)}
          aria-pressed={packed}
          className="rounded-md border border-line px-3 py-1.5 font-mono text-[0.78rem] tracking-[0.04em] text-ink-dim transition-colors hover:text-ink"
        >
          {packed ? 'unpack' : 'compress'}
        </button>
      </div>
    </div>
  )
}
