import { useCallback, useEffect, useState } from 'react'
import { motion } from 'framer-motion'
import { PALETTE } from '../lib/constants'

/**
 * Animated terminal deployment flow.
 *
 * Each step shows the exact command, lights up in order, and gets a status
 * tick. The parent replays it by changing React `key` or pressing replay.
 */
export default function DeployFlow({ title = 'deployment', steps = [], reduced = false, stepMs = 750 }) {
  const [runId, setRunId] = useState(0)
  const [reached, setReached] = useState(reduced ? steps.length : 0)
  const still = reduced

  useEffect(() => {
    if (still) {
      setReached(steps.length)
      return undefined
    }
    setReached(0)
    if (!steps.length) return undefined
    const id = window.setInterval(() => {
      setReached((n) => {
        if (n >= steps.length) {
          window.clearInterval(id)
          return n
        }
        return n + 1
      })
    }, stepMs)
    return () => window.clearInterval(id)
  }, [still, stepMs, steps.length, runId])

  const replay = useCallback(() => setRunId((n) => n + 1), [])

  return (
    <div className="overflow-hidden rounded-md border border-line bg-abyss" key={runId}>
      <div className="flex items-center justify-between gap-3 border-b border-line bg-abyss/70 px-4 py-2">
        <p className="font-mono text-[0.75rem] tracking-[0.04em] text-ink-faint">{title}</p>
        <button
          type="button"
          onClick={replay}
          className="rounded-md border border-line px-2.5 py-1 font-mono text-[0.72rem] tracking-[0.04em] text-ink-dim transition-colors hover:text-ink"
        >
          replay
        </button>
      </div>
      <ol className="flex flex-col">
        {steps.map((step, i) => {
          const done = still || i < reached
          return (
            <motion.li
              key={step.id ?? step.command}
              className="flex items-start gap-3 border-b border-line px-4 py-2.5 last:border-b-0"
              initial={still ? false : { opacity: 0 }}
              animate={{ opacity: done ? 1 : 0.45 }}
              transition={{ duration: still ? 0 : 0.2 }}
            >
              <span
                aria-hidden="true"
                className="mt-0.5 grid h-7 w-7 shrink-0 place-items-center rounded-md border border-line font-mono text-[0.85rem] text-ink-faint"
              >
                {done ? <span style={{ color: PALETTE.green }}>✓</span> : i + 1}
              </span>
              <div className="min-w-0 flex-1">
                <p className="font-mono text-[clamp(1rem,1.3vw,1.25rem)]">
                  <span className="text-ink-faint">$ </span>
                  <span className="font-semibold text-ink">{step.command}</span>
                </p>
                {step.detail ? (
                  <p className="mt-0.5 text-[clamp(0.88rem,1.08vw,1.02rem)] text-ink-dim">{step.detail}</p>
                ) : null}
              </div>
              <span className="sr-only">{done ? `completed: ${step.command}` : `waiting: ${step.command}`}</span>
            </motion.li>
          )
        })}
      </ol>
    </div>
  )
}
