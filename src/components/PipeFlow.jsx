import { useCallback, useEffect, useState } from 'react'
import { motion } from 'framer-motion'
import { PALETTE } from '../lib/constants'
import { useSceneVisible } from '../hooks/useSceneVisible'

/**
 * Animated pipe flow.
 *
 * Each command lights up in order while a packet travels to the next stage.
 * Earlier stages stay lit; later stages stay dim until data reaches them.
 */
export default function PipeFlow({ cmd, stages = [], caption, reduced = false, stepMs = 700 }) {
  const [runId, setRunId] = useState(0)
  const [reached, setReached] = useState(reduced ? stages.length : 0)
  const still = reduced
  const visible = useSceneVisible()

  useEffect(() => {
    if (still) {
      setReached(stages.length)
      return undefined
    }
    if (!visible) return undefined
    setReached(0)
    if (stages.length === 0) return undefined
    const id = window.setInterval(() => {
      setReached((n) => {
        if (n >= stages.length) {
          window.clearInterval(id)
          return n
        }
        return n + 1
      })
    }, stepMs)
    return () => window.clearInterval(id)
  }, [still, stepMs, stages.length, runId, visible])

  const replay = useCallback(() => {
    setRunId((n) => n + 1)
  }, [])

  return (
    <div className="rounded-md border border-line bg-abyss p-4" key={runId}>
      {cmd ? (
        <p className="mb-3 font-mono text-[clamp(1.1rem,1.6vw,1.55rem)]">
          <span className="text-ink-faint">$ </span>
          <span className="font-semibold text-ink">{cmd}</span>
        </p>
      ) : null}

      <ol className="flex flex-col gap-0 lg:flex-row lg:items-stretch">
        {stages.map((stage, i) => {
          const lit = still || i < reached
          const active = !still && i === reached - 1 && reached < stages.length + 1
          return (
            <li key={`${stage.cmd}-${i}`} className="flex min-w-0 flex-1 flex-col lg:flex-row lg:items-center">
              <motion.div
                className="flex min-w-0 flex-1 flex-col rounded-md border border-line bg-abyss p-3"
                style={{ opacity: lit ? 1 : 0.55 }}
                initial={still ? false : { opacity: 0 }}
                animate={{ opacity: lit ? 1 : 0.55 }}
                transition={{ duration: still ? 0 : 0.2 }}
              >
                <code
                  className="font-mono text-[clamp(0.95rem,1.2vw,1.2rem)]"
                  style={{ color: lit ? PALETTE.ink : PALETTE.inkFaint }}
                >
                  {stage.cmd}
                </code>
                <pre className="mt-1.5 overflow-x-auto whitespace-pre font-mono text-[clamp(0.8rem,1rem,1.05rem)] leading-snug text-ink-dim">
                  {stage.out}
                </pre>
              </motion.div>

              {i < stages.length - 1 ? (
                <span aria-hidden="true" className="relative my-1 flex h-7 items-center justify-center lg:my-0 lg:h-auto lg:w-10">
                  <span className="absolute bg-line" style={{ left: 0, right: 0, top: '50%', height: 2 }} />
                  <span
                    className="absolute"
                    style={{ left: 0, right: 0, top: '50%', height: 2, background: lit ? PALETTE.inkFaint : PALETTE.line }}
                  />
                  <motion.span
                    className="absolute top-1/2 h-2 w-2 -translate-y-1/2 rounded-full"
                    style={{ background: lit ? PALETTE.ink : PALETTE.line }}
                    animate={still || !active ? { left: '100%', opacity: lit ? 0.9 : 0.25 } : { left: ['0%', '100%'], opacity: [0, 1, 0.9] }}
                    transition={still ? { duration: 0 } : { duration: 0.3, ease: [0.2, 0, 0, 1] }}
                  />
                </span>
              ) : null}
            </li>
          )
        })}
      </ol>

      <div className="mt-3 flex flex-wrap items-center justify-between gap-2 border-t border-line pt-2.5">
        <p className="fs-caption min-w-0 flex-1 text-ink-faint">{caption}</p>
        <button
          type="button"
          onClick={replay}
          className="shrink-0 rounded-md border border-line px-3 py-1.5 font-mono text-[0.78rem] tracking-[0.04em] text-ink-dim transition-colors hover:text-ink"
        >
          Replay flow
        </button>
      </div>
      <span className="sr-only" aria-live="polite">
        {Math.min(reached, stages.length)} of {stages.length} pipe stages lit
      </span>
    </div>
  )
}
