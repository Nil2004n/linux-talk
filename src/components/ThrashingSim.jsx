import { useEffect, useState } from 'react'
import { PALETTE } from '../lib/constants'

const FRAMES = 14

/**
 * Thrashing visualiser: too many processes, constant page faults, the disk
 * flashing while useful CPU work collapses. Replayable; static when calm.
 */
export default function ThrashingSim({ reduced = false }) {
  const [runId, setRunId] = useState(0)
  const [frame, setFrame] = useState(reduced ? FRAMES : 0)

  useEffect(() => {
    if (reduced) {
      setFrame(FRAMES)
      return undefined
    }
    setFrame(0)
    const id = window.setInterval(() => {
      setFrame((f) => {
        if (f >= FRAMES) {
          window.clearInterval(id)
          return f
        }
        return f + 1
      })
    }, 420)
    return () => window.clearInterval(id)
  }, [reduced, runId])

  const t = frame / FRAMES
  const cpu = Math.round(72 * (1 - t) + 6 * t)
  const faults = Math.round(40 + t * 900)
  const done = frame >= FRAMES

  return (
    <div className="rounded-md border border-line bg-abyss p-4" key={runId}>
      <div className="flex items-center gap-4">
        <div className="min-w-0 flex-1">
          <div className="flex items-baseline justify-between gap-2">
            <span className="font-mono text-[0.8rem] tracking-[0.04em] text-ink-dim">useful cpu</span>
            <span className="font-mono text-[1rem] font-bold" style={{ color: cpu > 30 ? PALETTE.green : PALETTE.red }}>
              {cpu}%
            </span>
          </div>
          <div className="mt-1 h-3 overflow-hidden rounded-full bg-abyss">
            <div
              className="h-full rounded-full"
              style={{
                width: `${cpu}%`,
                background: cpu > 30 ? PALETTE.green : PALETTE.red,
                transition: reduced ? 'none' : 'width 0.3s cubic-bezier(0.2, 0, 0, 1)',
              }}
            />
          </div>
          <div className="mt-2 flex items-baseline justify-between gap-2">
            <span className="font-mono text-[0.8rem] tracking-[0.04em] text-ink-dim">page faults</span>
            <span className="font-mono text-[1rem] font-bold tabular-nums" style={{ color: PALETTE.amber }} aria-live="polite">
              {faults}/s
            </span>
          </div>
        </div>
        <div
          className="grid h-20 w-20 shrink-0 place-items-center rounded-md border border-line bg-abyss text-ink-faint"
          aria-hidden="true"
        >
          <svg width="34" height="34" viewBox="0 0 30 30" fill="none">
            <ellipse cx="15" cy="8" rx="9" ry="3.5" stroke="currentColor" strokeWidth="1.5" />
            <path d="M6 8v14c0 1.9 4 3.5 9 3.5s9-1.6 9-3.5V8" stroke="currentColor" strokeWidth="1.5" />
          </svg>
        </div>
      </div>
      <div className="mt-2 flex flex-wrap items-center justify-between gap-2 border-t border-line pt-2">
        <p className="max-w-[52ch] text-[0.9rem] text-ink-dim">
          {done
            ? 'Fix: more RAM, fewer processes, or swap tuning.'
            : 'Too many processes, too few frames — the OS only swaps.'}
        </p>
        <button
          type="button"
          onClick={() => setRunId((n) => n + 1)}
          className="rounded-md border border-line px-3 py-1 font-mono text-[0.78rem] tracking-[0.04em] text-ink-dim transition-colors hover:text-ink"
        >
          replay
        </button>
      </div>
    </div>
  )
}
