import { motion } from 'framer-motion'
import { PALETTE } from '../lib/constants'

/**
 * Animated packet travelling from a laptop to a server.
 * Each hop completes quickly, then pauses before the next hop.
 */
export default function PacketHop({ from = 'laptop', to = 'server', reduced = false }) {
  return (
    <div className="rounded-md border border-line bg-abyss p-4" role="img" aria-label={`Packet travelling from ${from} to ${to}`}>
      <div className="relative flex items-center justify-between gap-3">
        <div className="grid w-28 place-items-center gap-1 rounded-md border border-line bg-abyss px-2 py-3 text-ink-faint">
          <svg width="34" height="24" viewBox="0 0 34 24" fill="none" aria-hidden="true">
            <rect x="2" y="3" width="30" height="14" rx="2" stroke="currentColor" strokeWidth="1.8" />
            <path d="M7 21h20" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" />
          </svg>
          <span className="font-mono text-[0.72rem] tracking-[0.04em] text-ink-dim">{from}</span>
        </div>

        <div className="relative h-px min-w-0 flex-1 bg-line" aria-hidden="true">
          <motion.span
            className="absolute top-1/2 h-2.5 w-2.5 -translate-y-1/2 rounded-full"
            style={{ background: PALETTE.cyan }}
            initial={false}
            animate={reduced ? { left: '48%' } : { left: ['6%', '90%'], opacity: [0, 1, 1] }}
            transition={reduced ? { duration: 0 } : { duration: 0.3, ease: [0.2, 0, 0, 1] }}
          />
        </div>

        <div className="grid w-28 place-items-center gap-1 rounded-md border border-line bg-abyss px-2 py-3">
          <svg width="28" height="26" viewBox="0 0 28 26" fill="none" aria-hidden="true">
            <rect x="3" y="2" width="22" height="9" rx="1.5" stroke="currentColor" strokeWidth="1.8" />
            <rect x="3" y="15" width="22" height="9" rx="1.5" stroke="currentColor" strokeWidth="1.8" />
            <circle cx="7" cy="6.5" r="1.2" fill="currentColor" />
            <circle cx="7" cy="19.5" r="1.2" fill="currentColor" />
          </svg>
          <span className="font-mono text-[0.72rem] tracking-[0.04em] text-ink-dim">{to}</span>
        </div>
      </div>
    </div>
  )
}
