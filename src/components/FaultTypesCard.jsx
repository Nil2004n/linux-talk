import { motion } from 'framer-motion'
import { PALETTE } from '../lib/constants'

const FAULTS = [
  {
    name: 'minor',
    color: PALETTE.green,
    text: 'Page is already in RAM, just not mapped for this process. Cheap.',
  },
  {
    name: 'major',
    color: PALETTE.amber,
    text: 'Page must be read from disk. Slow — the disk decides.',
  },
  {
    name: 'invalid',
    color: PALETTE.red,
    text: 'Illegal access. Ends in “Segmentation fault” (SIGSEGV).',
  },
]

/**
 * Small card separating the three page-fault kinds.
 */
export default function FaultTypesCard({ reduced = false }) {
  return (
    <div className="rounded-md border border-line bg-abyss p-3 sm:p-4">
      <p className="font-mono text-[0.7rem] tracking-[0.04em] text-ink-faint">
        not all faults are equal
      </p>
      <ul className="mt-2 grid gap-2 sm:grid-cols-3">
        {FAULTS.map((f, i) => (
          <motion.li
            key={f.name}
            className="rounded-md border border-line bg-abyss p-2.5"
            initial={reduced ? false : { opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ duration: reduced ? 0 : 0.2, delay: reduced ? 0 : Math.min(0.12, i * 0.06) }}
          >
            <p className="font-mono text-[0.95rem] tracking-[0.04em]" style={{ color: f.color }}>
              {f.name}
            </p>
            <p className="mt-1 text-[0.9rem] leading-snug text-ink-dim">{f.text}</p>
          </motion.li>
        ))}
      </ul>
    </div>
  )
}
