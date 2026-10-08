import { motion } from 'framer-motion'
import { useMotionPrefs } from '../hooks/useMotionPrefs'

const CHIPS = [
  {
    id: 'x86_64',
    name: 'x86_64',
    subtitle: 'desktop and server classic',
    body: 'Intel and AMD laptops, lab PCs and most existing servers report this string.',
  },
  {
    id: 'arm',
    name: 'ARM',
    subtitle: 'phones, small boards, efficient cloud',
    body: 'Android phones, Raspberry Pi boards and growing server fleets use ARM cores.',
  },
  {
    id: 'risc-v',
    name: 'RISC-V',
    subtitle: 'open instruction set',
    body: 'An openly specified CPU design anyone may implement; newer but company-neutral.',
  },
]

/**
 * Animated CPU architecture chips with a miniature `uname -m` transcript.
 */
export default function ArchChips({ output = 'x86_64', reduced = false }) {
  const { reduced: motionReduced } = useMotionPrefs()
  const still = reduced || motionReduced

  return (
    <div className="grid gap-3 sm:grid-cols-3">
      {CHIPS.map((chip, i) => (
        <motion.section
          key={chip.id}
          className="relative overflow-hidden rounded-md border border-line bg-abyss p-4"
          
          initial={still ? false : { opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ duration: still ? 0 : 0.25, delay: still ? 0 : Math.min(0.12, i * 0.06) }}
          
          aria-label={`${chip.name} processor architecture`}
        >
          <div className="mx-auto grid h-20 w-20 place-items-center rounded-md border border-line bg-abyss text-ink-faint" aria-hidden="true">
            <svg width="44" height="44" viewBox="0 0 44 44" fill="none">
              <rect x="12" y="12" width="20" height="20" rx="3" stroke="currentColor" strokeWidth="2" />
              <rect x="18" y="18" width="8" height="8" fill="currentColor" />
              {Array.from({ length: 5 }).map((_, pin) => (
                <g key={pin} stroke="currentColor" strokeWidth="2" strokeLinecap="round">
                  <line x1={15 + pin * 3.4} y1="7" x2={15 + pin * 3.4} y2="12" />
                  <line x1={15 + pin * 3.4} y1="32" x2={15 + pin * 3.4} y2="37" />
                  <line x1="7" y1={15 + pin * 3.4} x2="12" y2={15 + pin * 3.4} />
                  <line x1="32" y1={15 + pin * 3.4} x2="37" y2={15 + pin * 3.4} />
                </g>
              ))}
            </svg>
          </div>
          <h3 className="mt-3 text-center font-mono text-[clamp(1.2rem,1.7vw,1.55rem)] font-bold text-ink">
            {chip.name}
          </h3>
          <p className="mt-0.5 text-center font-mono text-[0.72rem] tracking-[0.04em] text-ink-faint">
            {chip.subtitle}
          </p>
          <p className="mt-2 text-center text-[clamp(0.92rem,1.12vw,1.05rem)] leading-snug text-ink-dim">
            {chip.body}
          </p>
        </motion.section>
      ))}

      <div className="rounded-md border border-line bg-abyss px-4 py-3 sm:col-span-3">
        <p className="font-mono text-[clamp(1rem,1.3vw,1.25rem)]">
          <span className="text-ink-faint">$ </span>
          <span className="font-semibold text-ink">uname -m</span>
        </p>
        <p className="mt-1 font-mono text-[clamp(1rem,1.3vw,1.25rem)] font-bold" className="text-ink">
          {output}
        </p>
      </div>
    </div>
  )
}
