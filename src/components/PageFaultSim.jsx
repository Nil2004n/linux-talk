import { useEffect, useMemo, useState } from 'react'
import { motion } from 'framer-motion'
import { PALETTE } from '../lib/constants'
import { DEFAULT_PAGE_FRAMES, DEFAULT_PAGE_REFS, PAGING_ALGORITHMS, PAGING_META, beladyDemo, pagingVerdict, simulatePaging } from '../lib/os-sims/paging.js'

const AUTO_MS = 800

/**
 * Virtual memory and page fault visualiser.
 *
 * Steps through one page request at a time: hits glow green, faults flash
 * red while the page flies in from disk and a victim exits. Includes frame
 * and reference-string editors, hit/fault counters, a Belady's anomaly
 * demo, and a one-picture address-translation diagram.
 */
export default function PageFaultSim({
  frames = DEFAULT_PAGE_FRAMES,
  refs = DEFAULT_PAGE_REFS,
  reduced = false,
}) {
  const [frameCount, setFrameCount] = useState(frames)
  const [refText, setRefText] = useState(refs.join(' '))
  const [refList, setRefList] = useState(refs)
  const [algo, setAlgo] = useState('fifo')
  const [pos, setPos] = useState(0)
  const [auto, setAuto] = useState(false)
  const [showBelady, setShowBelady] = useState(false)

  const applyRefs = () => {
    const parsed = refText.split(/[^0-9]+/).filter(Boolean).map(Number).slice(0, 40)
    if (parsed.length) {
      setRefList(parsed)
      setPos(0)
    }
  }

  const result = useMemo(
    () => simulatePaging(frameCount, refList, { algorithm: algo }),
    [frameCount, refList, algo],
  )
  const demo = useMemo(beladyDemo, [])

  useEffect(() => {
    setPos(0)
  }, [frameCount, refList, algo])

  useEffect(() => {
    if (!auto || reduced) return undefined
    if (pos >= refList.length) {
      setAuto(false)
      return undefined
    }
    const id = window.setTimeout(() => setPos((p) => Math.min(refList.length, p + 1)), AUTO_MS)
    return () => window.clearTimeout(id)
  }, [auto, reduced, pos, refList.length])

  const step = pos > 0 ? result.steps[pos - 1] : null
  const current = pos < refList.length ? refList[pos] : null
  const done = pos >= refList.length
  const shownFaults = result.steps.slice(0, pos).filter((s) => !s.hit).length
  const shownHits = pos - shownFaults

  return (
    <div className="flex min-h-0 flex-col gap-3">
      <div className="flex flex-wrap items-center gap-1.5" role="group" aria-label="Replacement algorithm">
        {PAGING_ALGORITHMS.map((a) => (
          <button
            key={a}
            type="button"
            onClick={() => setAlgo(a)}
            aria-pressed={algo === a}
            className={`rounded-md border px-2.5 py-1 font-mono text-[0.8rem] tracking-[0.04em] transition-colors ${
              algo === a ? 'border-cyan text-ink' : 'border-line text-ink-dim hover:text-ink'
            }`}
          >
            {PAGING_META[a].name}
          </button>
        ))}
        <span className="mx-1 h-4 w-px bg-line" aria-hidden="true" />
        <button
          type="button"
          onClick={() => setShowBelady((b) => !b)}
          aria-pressed={showBelady}
          className={`rounded-md border px-2.5 py-1 font-mono text-[0.8rem] tracking-[0.04em] transition-colors ${
            showBelady ? 'border-cyan text-ink' : 'border-line text-ink-dim hover:text-ink'
          }`}
        >
          Belady demo
        </button>
      </div>

      {showBelady ? (
        <motion.div
          className="rounded-md border border-line bg-abyss p-3"
          style={{ borderColor: `${PALETTE.amber}55` }}
          initial={reduced ? false : { opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ duration: reduced ? 0 : 0.3 }}
        >
          <p className="font-mono text-[0.75rem] tracking-[0.04em]" style={{ color: PALETTE.amber }}>
            belady’s anomaly · fifo · {demo.refs.join(' ')}
          </p>
          <div className="mt-2 grid grid-cols-2 gap-2 text-center">
            <div className="rounded-lg border border-line bg-abyss/60 p-2">
              <p className="font-mono text-[0.72rem] text-ink-faint">3 frames</p>
              <p className="font-mono text-[1.6rem] font-bold text-ink">{demo.three}</p>
              <p className="font-mono text-[0.72rem] text-ink-faint">faults</p>
            </div>
            <div className="rounded-lg border border-red/60 bg-red/10 p-2">
              <p className="font-mono text-[0.72rem] text-ink-faint">4 frames</p>
              <p className="font-mono text-[1.6rem] font-bold" style={{ color: PALETTE.red }}>{demo.four}</p>
              <p className="font-mono text-[0.72rem] text-ink-faint">faults — more!</p>
            </div>
          </div>
          <p className="mt-2 text-[0.92rem] leading-snug text-ink-dim">
            More RAM made FIFO worse: it evicts by age, not by usefulness, so the extra frame
            holds the wrong pages. This is why real systems approximate LRU instead.
          </p>
        </motion.div>
      ) : null}

      <div className="grid min-h-0 gap-3 lg:grid-cols-[minmax(0,1.4fr)_minmax(0,1fr)]">
        <div className="rounded-md border border-line bg-abyss p-3">
          {/* Frames */}
          <div className="flex items-center gap-2" role="img" aria-label={`Physical RAM, ${frameCount} frames`}>
            <svg width="30" height="30" viewBox="0 0 30 30" fill="none" aria-hidden="true">
              <ellipse cx="15" cy="8" rx="9" ry="3.5" stroke={PALETTE.inkFaint} strokeWidth="1.5" />
              <path d="M6 8v14c0 1.9 4 3.5 9 3.5s9-1.6 9-3.5V8" stroke={PALETTE.inkFaint} strokeWidth="1.5" />
              <path d="M6 15c0 1.9 4 3.5 9 3.5s9-1.6 9-3.5" stroke={PALETTE.inkFaint} strokeWidth="1.2" />
            </svg>
            <div className="flex flex-1 gap-1.5">
              {(step ? step.frames : Array.from({ length: frameCount }, () => null)).map((page, i) => {
                const faultHere = step && !step.hit && step.frames[i] === step.page
                return (
                  <motion.div
                    key={`${i}-${page ?? 'empty'}-${pos}`}
                    className="grid h-14 min-w-0 flex-1 place-items-center rounded-lg border font-mono text-[1.2rem] font-bold"
                    style={{
                      borderColor: page == null ? PALETTE.line : faultHere ? PALETTE.red : PALETTE.line,
                      background: 'transparent',
                      color: page == null ? PALETTE.inkFaint : faultHere ? PALETTE.red : PALETTE.green,
                    }}
                    initial={reduced ? false : { opacity: 0 }}
                    animate={{ opacity: 1 }}
                    transition={{ duration: reduced ? 0 : 0.2 }}
                  >
                    {page ?? '·'}
                  </motion.div>
                )
              })}
            </div>
          </div>

          {/* Current request + step controls */}
          <div className="mt-2.5 flex flex-wrap items-center gap-2">
            <p className="font-mono text-[0.95rem] text-ink-dim" aria-live="polite">
              request {done ? 'done' : <strong style={{ color: PALETTE.cyan }}>page {current}</strong>}
              {step && !step.hit ? (
                <span style={{ color: PALETTE.red }}> · FAULT{step.evicted != null ? `, evict ${step.evicted}` : ''}</span>
              ) : step?.hit ? (
                <span style={{ color: PALETTE.green }}> · HIT</span>
              ) : null}
            </p>
            <span className="mx-1 font-mono text-[0.8rem] text-ink-faint">
              {pos}/{refList.length}
            </span>
            <button
              type="button"
              onClick={() => setPos((p) => Math.min(refList.length, p + 1))}
              disabled={done}
              className="rounded-md border border-line px-3 py-1 font-mono text-[0.8rem] tracking-[0.04em] text-ink-dim transition-colors hover:text-ink disabled:cursor-not-allowed disabled:opacity-40"
            >
              next request
            </button>
            <button
              type="button"
              onClick={() => setAuto((a) => !a)}
              aria-pressed={auto}
              disabled={done}
              className="rounded-md border border-line px-3 py-1 font-mono text-[0.8rem] tracking-[0.04em] text-ink-dim transition-colors hover:text-ink disabled:cursor-not-allowed disabled:opacity-40"
            >
              {auto ? 'pause' : 'auto'}
            </button>
            <button
              type="button"
              onClick={() => {
                setPos(0)
                setAuto(false)
              }}
              className="font-mono text-[0.8rem] tracking-[0.04em] text-ink-faint underline-offset-4 hover:text-ink hover:underline"
            >
              reset
            </button>
          </div>

          {/* Reference strip */}
          <div className="mt-2 flex flex-wrap gap-1" aria-hidden="true">
            {refList.map((p, i) => (
              <span
                key={i}
                className="grid h-7 w-7 place-items-center rounded border font-mono text-[0.75rem]"
                style={{
                  borderColor: i === pos ? PALETTE.cyan : PALETTE.line,
                  color: i < pos ? PALETTE.inkDim : i === pos ? PALETTE.cyan : PALETTE.inkFaint,
                  background: i === pos ? 'rgba(34,211,238,0.12)' : 'transparent',
                }}
              >
                {p}
              </span>
            ))}
          </div>

          {/* Counters */}
          <div className="mt-2 flex gap-4 border-t border-line pt-2 font-mono text-[0.9rem]" aria-live="polite">
            <span style={{ color: PALETTE.green }}>hits {shownHits}</span>
            <span style={{ color: PALETTE.red }}>faults {shownFaults}</span>
            <span className="text-ink-faint">
              rate {pos ? Math.round((shownFaults / pos) * 100) : 0}%
            </span>
            {done ? <span className="text-ink-dim">· {pagingVerdict(algo, result)}</span> : null}
          </div>
        </div>

        <div className="flex min-h-0 flex-col gap-2">
          <div className="rounded-md border border-line bg-abyss p-3">
            <div className="flex items-center gap-2">
              <span className="font-mono text-[0.7rem] tracking-[0.04em] text-ink-faint">frames</span>
              <div className="flex gap-1" role="group" aria-label="Frame count">
                {[3, 4].map((n) => (
                  <button
                    key={n}
                    type="button"
                    onClick={() => setFrameCount(n)}
                    aria-pressed={frameCount === n}
                    className={`h-7 w-7 rounded-md border font-mono text-[0.85rem] ${
                      frameCount === n ? 'border-cyan text-ink' : 'border-line text-ink-dim hover:text-ink'
                    }`}
                    
                  >
                    {n}
                  </button>
                ))}
              </div>
            </div>
            <label htmlFor="page-refs" className="mt-2 block font-mono text-[0.7rem] tracking-[0.04em] text-ink-faint">
              reference string
            </label>
            <div className="mt-1 flex gap-1.5">
              <input
                id="page-refs"
                value={refText}
                onChange={(e) => setRefText(e.target.value)}
                onBlur={applyRefs}
                onKeyDown={(e) => {
                  if (e.key === 'Enter') applyRefs()
                }}
                spellCheck={false}
                className="min-w-0 flex-1 rounded-md border border-line bg-abyss/70 px-2 py-1 font-mono text-[0.85rem] text-ink"
              />
            </div>
            <p className="mt-1 font-mono text-[0.72rem] text-ink-faint">{PAGING_META[algo].best} {PAGING_META[algo].weakness}</p>
          </div>

          {/* Address translation mini diagram */}
          <div className="rounded-md border border-line bg-abyss p-3" role="img" aria-label="Address translation: CPU asks for a virtual address, the page table checks RAM, a miss faults and the OS loads the page from disk">
            <p className="font-mono text-[0.7rem] tracking-[0.04em] text-ink-faint">one picture</p>
            <ol className="mt-1.5 flex flex-col gap-1 text-[0.85rem]">
              {[
                ['cpu', 'asks for a virtual address', PALETTE.cyan],
                ['page table', 'in RAM? yes → fast', PALETTE.green],
                ['page fault', 'no → OS loads it from disk', PALETTE.amber],
                ['retry', 'instruction runs again', PALETTE.violet],
              ].map(([label, text, color]) => (
                <li key={label} className="flex items-baseline gap-2">
                  <span className="shrink-0 font-mono" style={{ color }}>
                    {label}
                  </span>
                  <span className="text-ink-dim">{text}</span>
                </li>
              ))}
            </ol>
          </div>
        </div>
      </div>
    </div>
  )
}
