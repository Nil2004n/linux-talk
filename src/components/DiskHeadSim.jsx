import { useEffect, useMemo, useState } from 'react'
import { motion } from 'framer-motion'
import { PALETTE } from '../lib/constants'
import { DEFAULT_DISK_HEAD, DEFAULT_DISK_REQUESTS, DISK_ALGORITHMS, DISK_MAX, DISK_META, diskVerdict, scheduleDisk } from '../lib/os-sims/disk.js'
import CompareTable from './CompareTable'
import { useSceneVisible } from '../hooks/useSceneVisible'

const HOP_MS = 420

/**
 * Disk scheduling visualiser.
 *
 * A head slides across cylinders 0..max while the travelled path draws as a
 * glowing line graph. Supports five algorithms, an editable request queue,
 * sweep direction, side-by-side compare, and an HDD-vs-SSD explainer.
 */
export default function DiskHeadSim({
  requests = DEFAULT_DISK_REQUESTS,
  head = DEFAULT_DISK_HEAD,
  max = DISK_MAX,
  reduced = false,
}) {
  const [reqText, setReqText] = useState(requests.join(', '))
  const [reqs, setReqs] = useState(requests)
  const [start, setStart] = useState(head)
  const [algo, setAlgo] = useState('fcfs')
  const [direction, setDirection] = useState('up')
  const [runId, setRunId] = useState(0)
  const [reached, setReached] = useState(0)
  const [compare, setCompare] = useState(false)
  const visible = useSceneVisible()
  const [algoB, setAlgoB] = useState('sstf')
  const [media, setMedia] = useState('hdd')

  const applyRequests = () => {
    const parsed = reqText
      .split(/[^0-9]+/)
      .filter(Boolean)
      .map(Number)
      .filter((n) => n >= 0 && n <= max)
    if (parsed.length) {
      setReqs(parsed)
      setRunId((n) => n + 1)
    }
  }

  const result = useMemo(
    () => scheduleDisk(reqs, start, { algorithm: algo, max, direction }),
    [reqs, start, algo, max, direction, runId],
  )
  const resultB = useMemo(
    () => (compare ? scheduleDisk(reqs, start, { algorithm: algoB, max, direction }) : null),
    [reqs, start, algoB, max, direction, compare, runId],
  )

  useEffect(() => {
    if (reduced) {
      setReached(result.path.length - 1)
      return undefined
    }
    if (!visible) { setReached(0); return undefined }
    setReached(0)
    if (!visible || result.path.length < 2) return undefined
    const id = window.setInterval(() => {
      setReached((n) => {
        if (n >= result.path.length - 1) {
          window.clearInterval(id)
          return n
        }
        return n + 1
      })
    }, HOP_MS)
    return () => window.clearInterval(id)
  }, [reduced, result.path.length, runId, reqs, start, algo, direction, visible])

  const headPos = result.path[Math.min(reached, result.path.length - 1)] ?? start
  const done = reached >= result.path.length - 1
  // Animated counter: movement covered so far.
  const covered = result.steps.slice(0, reached).reduce((a, s) => a + Math.abs(s.to - s.from), 0)

  const W = 100
  const x = (cyl) => 4 + (cyl / max) * (W - 8)

  return (
    <div className="flex min-h-0 flex-col gap-3" key={runId}>
      <div className="flex flex-wrap items-center gap-1.5" role="group" aria-label="Disk algorithm">
        {DISK_ALGORITHMS.map((a) => (
          <button
            key={a}
            type="button"
            onClick={() => setAlgo(a)}
            aria-pressed={algo === a}
            className={`rounded-md border px-2.5 py-1 font-mono text-[0.8rem] tracking-[0.04em] transition-colors ${
              algo === a ? 'border-cyan text-ink' : 'border-line text-ink-dim hover:text-ink'
            }`}

          >
            {DISK_META[a].name}
          </button>
        ))}
        {algo === 'scan' || algo === 'cscan' || algo === 'look' ? (
          <div className="ml-1 flex items-center gap-1" role="group" aria-label="Sweep direction">
            {['up', 'down'].map((d) => (
              <button
                key={d}
                type="button"
                onClick={() => setDirection(d)}
                aria-pressed={direction === d}
                className={`rounded-md border px-2 py-1 font-mono text-[0.75rem] tracking-[0.04em] ${
                  direction === d ? 'border-cyan text-ink' : 'border-line text-ink-dim hover:text-ink'
                }`}
              >
                {d === 'up' ? '↑' : '↓'}
              </button>
            ))}
          </div>
        ) : null}
        <button
          type="button"
          onClick={() => setRunId((n) => n + 1)}
          className="rounded-md border border-line px-2.5 py-1 font-mono text-[0.8rem] tracking-[0.04em] text-ink-dim transition-colors hover:text-ink"
        >
          replay
        </button>
        <button
          type="button"
          onClick={() => setCompare((c) => !c)}
          aria-pressed={compare}
          className={`rounded-md border px-2.5 py-1 font-mono text-[0.8rem] tracking-[0.04em] transition-colors ${
            compare ? 'border-cyan text-ink' : 'border-line text-ink-dim hover:text-ink'
          }`}
        >
          Compare
        </button>
      </div>

      <div className="grid min-h-0 gap-3 lg:grid-cols-[minmax(0,1.5fr)_minmax(0,1fr)]">
        <div className="rounded-md border border-line bg-abyss p-3">
          {/* Cylinder strip */}
          <div className="relative h-14" role="img" aria-label={`Disk head at cylinder ${headPos}`}>
            <div className="absolute inset-x-0 top-1/2 h-1 -translate-y-1/2 rounded bg-line" />
            {reqs.map((c, i) => (
              <span
                key={`${c}-${i}`}
                className="absolute top-1/2 h-2.5 w-2.5 -translate-x-1/2 -translate-y-1/2 rounded-full border border-line bg-abyss"
                style={{ left: `${x(c)}%` }}
                title={`request ${c}`}
              />
            ))}
            <motion.span
              className="absolute top-1/2 z-10 h-5 w-5 -translate-x-1/2 -translate-y-1/2 rounded-full border border-line bg-ink"
              animate={{ left: `${x(headPos)}%` }}
              transition={{ duration: reduced ? 0 : 0.3, ease: [0.2, 0, 0, 1] }}
            />
          </div>
          <div className="flex justify-between font-mono text-[0.7rem] text-ink-faint" aria-hidden="true">
            <span>0</span>
            <span>head {headPos}</span>
            <span>{max}</span>
          </div>

          {/* Path graph */}
          <svg viewBox={`0 0 ${W} 34`} className="mt-2 h-28 w-full" role="img" aria-label="Head path graph">
            <line x1="4" y1="30" x2={W - 4} y2="30" stroke={PALETTE.line} strokeWidth="0.4" />
            {result.path.slice(0, reached + 1).map((c, i) =>
              i === 0 ? null : (
                <line
                  key={i}
                  x1={x(result.path[i - 1])}
                  y1={28 - (i - 1) * (24 / Math.max(1, result.path.length - 1))}
                  x2={x(c)}
                  y2={28 - i * (24 / Math.max(1, result.path.length - 1))}
                  stroke={PALETTE.ink}
                  strokeWidth="0.7"
                  strokeLinecap="round"
                />
              ),
            )}
            {result.path.slice(0, reached + 1).map((c, i) => (
              <circle
                key={`p-${i}`}
                cx={x(c)}
                cy={28 - i * (24 / Math.max(1, result.path.length - 1))}
                r="1.1"
                fill={i === reached ? PALETTE.cyan : PALETTE.inkFaint}
              />
            ))}
          </svg>

          <div className="mt-1 flex flex-wrap items-baseline justify-between gap-2">
            <p className="font-mono text-[0.95rem] tabular-nums text-ink" aria-live="polite">
              head travel: {covered}
              <span className="text-ink-faint"> / {result.movement} cylinders</span>
            </p>
            {done ? (
              <p className="font-mono text-[0.8rem] text-ink-dim">{diskVerdict(algo, result)}</p>
            ) : (
              <p className="font-mono text-[0.8rem] text-ink-faint">seeking…</p>
            )}
          </div>
        </div>

        <div className="flex min-h-0 flex-col gap-2">
          <div className="rounded-md border border-line bg-abyss p-3">
            <label htmlFor="disk-reqs" className="font-mono text-[0.7rem] tracking-[0.04em] text-ink-faint">
              request queue · head starts at
            </label>
            <div className="mt-1.5 flex gap-1.5">
              <input
                id="disk-reqs"
                value={reqText}
                onChange={(e) => setReqText(e.target.value)}
                onBlur={applyRequests}
                onKeyDown={(e) => {
                  if (e.key === 'Enter') applyRequests()
                }}
                spellCheck={false}
                className="min-w-0 flex-1 rounded-md border border-line bg-abyss/70 px-2 py-1 font-mono text-[0.85rem] text-ink"
              />
              <input
                type="number"
                min={0}
                max={max}
                value={start}
                onChange={(e) => setStart(Math.max(0, Math.min(max, Number(e.target.value) || 0)))}
                aria-label="Starting head position"
                className="w-16 shrink-0 rounded-md border border-line bg-abyss/70 px-2 py-1 font-mono text-[0.85rem] text-ink"
              />
            </div>
            <p className="mt-1 font-mono text-[0.72rem] text-ink-faint">weakness: {DISK_META[algo].weakness}</p>
          </div>

          <div className="rounded-md border border-line bg-abyss p-3" role="group" aria-label="HDD versus SSD">
            <div className="flex gap-1.5">
              {['hdd', 'ssd'].map((m) => (
                <button
                  key={m}
                  type="button"
                  onClick={() => setMedia(m)}
                  aria-pressed={media === m}
                  className={`flex-1 rounded-md border px-2 py-1 font-mono text-[0.8rem] tracking-[0.04em] transition-colors ${
                    media === m ? 'border-cyan text-ink' : 'border-line text-ink-dim hover:text-ink'
                  }`}
    
                >
                  {m === 'hdd' ? 'HDD' : 'SSD'}
                </button>
              ))}
            </div>
            <p className="mt-2 text-[0.92rem] leading-snug text-ink-dim">
              {media === 'hdd'
                ? 'Spinning platters must physically seek: reorder requests to cut travel.'
                : 'SSDs and NVMe have no head to move — reordering barely matters.'}
            </p>
          </div>
        </div>
      </div>

      {compare && resultB ? (
        <div className="flex flex-col gap-2">
          <div className="flex flex-wrap items-center gap-1.5" role="group" aria-label="Compare with">
            <span className="font-mono text-[0.75rem] tracking-[0.04em] text-ink-faint">vs</span>
            {DISK_ALGORITHMS.filter((a) => a !== algo).map((a) => (
              <button
                key={a}
                type="button"
                onClick={() => setAlgoB(a)}
                aria-pressed={algoB === a}
                className={`rounded-md border px-2.5 py-1 font-mono text-[0.8rem] tracking-[0.04em] transition-colors ${
                  algoB === a ? 'border-cyan text-ink' : 'border-line text-ink-dim hover:text-ink'
                }`}
  
              >
                {DISK_META[a].name}
              </button>
            ))}
          </div>
          <CompareTable
            head="Metric"
            columns={[
              { key: 'a', title: DISK_META[algo].name, tone: 'a', check: (row) => row._a <= row._b },
              { key: 'b', title: DISK_META[algoB].name, tone: 'b', check: (row) => row._b <= row._a },
            ]}
            rows={[
              {
                label: 'Total head movement',
                a: `${result.movement} cyl`,
                b: `${resultB.movement} cyl`,
                _a: result.movement,
                _b: resultB.movement,
              },
            ]}
            caption={
              result.movement === resultB.movement
                ? 'Both travel the same distance here.'
                : result.movement < resultB.movement
                  ? `${DISK_META[algo].name} wins — less travel, in green.`
                  : `${DISK_META[algoB].name} wins — less travel, in green.`
            }
          />
        </div>
      ) : null}
    </div>
  )
}
