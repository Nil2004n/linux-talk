import { useEffect, useMemo, useState } from 'react'
import { motion } from 'framer-motion'
import { PALETTE } from '../lib/constants'
import { compareVerdict, CPU_ALGORITHMS, CPU_META, DEFAULT_PROCESSES, simulateCPU, verdictCPU } from '../lib/os-sims/cpu.js'
import CompareTable from './CompareTable'

const STEP_MS = 520

/**
 * CPU scheduling visualiser.
 *
 * Gantt timeline draws itself segment by segment while a ready queue, a CPU
 * box and a done tray track the same run. Supports all four algorithms with
 * an editable process table, replay, and a two-algorithm compare mode.
 */
export default function SchedulerSim({
  processes = DEFAULT_PROCESSES,
  algorithm = 'fcfs',
  quantum = 2,
  reduced = false,
}) {
  const [algo, setAlgo] = useState(algorithm)
  const [q, setQ] = useState(quantum)
  const [rows, setRows] = useState(() => processes.map((p) => ({ ...p })))
  const [runId, setRunId] = useState(0)
  const [reached, setReached] = useState(0)
  const [compare, setCompare] = useState(false)
  const [algoB, setAlgoB] = useState('rr')

  const result = useMemo(
    () => simulateCPU(rows, { algorithm: algo, quantum: q }),
    [rows, algo, q, runId],
  )
  const resultB = useMemo(
    () => (compare ? simulateCPU(rows, { algorithm: algoB, quantum: q }) : null),
    [rows, algoB, q, compare, runId],
  )

  useEffect(() => {
    if (reduced) {
      setReached(result.segments.length)
      return undefined
    }
    setReached(0)
    if (!result.segments.length) return undefined
    const id = window.setInterval(() => {
      setReached((n) => {
        if (n >= result.segments.length) {
          window.clearInterval(id)
          return n
        }
        return n + 1
      })
    }, STEP_MS)
    return () => window.clearInterval(id)
  }, [reduced, result.segments.length, runId, rows, algo, q])

  const shown = result.segments.slice(0, reached)
  const done = reached >= result.segments.length
  const current = shown[shown.length - 1]
  const totalTime = result.totalTime || 1
  // Processes finished on or before the last drawn segment's end.
  const doneIds = new Set(
    result.perProcess.filter((p) => p.completion <= (current?.end ?? 0)).map((p) => p.id),
  )
  const waitingIds = result.perProcess
    .filter((p) => !doneIds.has(p.id) && p.arrival <= (current?.end ?? 0))
    .map((p) => p.id)

  const updateRow = (id, field, value) => {
    const v = Math.max(0, Math.floor(Number(value) || 0))
    setRows((old) => old.map((r) => (r.id === id ? { ...r, [field]: field === 'id' ? value : v } : r)))
  }

  const addProcess = () => {
    const n = rows.length + 1
    setRows((old) => [...old, { id: `P${n}`, arrival: 0, burst: 3, priority: 2 }])
  }

  return (
    <div className="flex min-h-0 flex-col gap-3" key={runId}>
      {/* Controls */}
      <div className="flex flex-wrap items-center gap-1.5" role="group" aria-label="Scheduling algorithm">
        {CPU_ALGORITHMS.map((a) => (
          <button
            key={a}
            type="button"
            onClick={() => setAlgo(a)}
            aria-pressed={algo === a}
            className={`rounded-md border px-2.5 py-1 font-mono text-[0.8rem] tracking-[0.04em] transition-colors ${
              algo === a ? 'border-cyan text-ink' : 'border-line text-ink-dim hover:text-ink'
            }`}
          >
            {CPU_META[a].name}
          </button>
        ))}
        {algo === 'rr' ? (
          <label className="ml-1 flex items-center gap-2 font-mono text-[0.8rem] text-ink-dim">
            quantum
            <input
              type="number"
              min={1}
              max={8}
              value={q}
              onChange={(e) => setQ(Math.max(1, Math.min(8, Number(e.target.value) || 1)))}
              className="w-14 rounded-md border border-line bg-abyss/70 px-2 py-1 text-ink"
              aria-label="Round Robin quantum"
            />
          </label>
        ) : null}
        <span className="mx-1 h-4 w-px bg-line" aria-hidden="true" />
        <button
          type="button"
          onClick={() => setRunId((n) => n + 1)}
          className="rounded-md border border-line px-2.5 py-1 font-mono text-[0.8rem] tracking-[0.04em] text-ink-dim transition-colors hover:text-ink"
        >
          replay
        </button>
        <button
          type="button"
          onClick={() => {
            setRows(processes.map((p) => ({ ...p })))
            setRunId((n) => n + 1)
          }}
          className="rounded-md border border-line px-2.5 py-1 font-mono text-[0.8rem] tracking-[0.04em] text-ink-dim transition-colors hover:text-ink"
        >
          reset
        </button>
        <button
          type="button"
          onClick={() => setCompare((c) => !c)}
          aria-pressed={compare}
            className={`rounded-md border px-2.5 py-1 font-mono text-[0.8rem] tracking-[0.04em] transition-colors ${
              compare ? 'border-cyan text-ink' : 'border-line text-ink-dim hover:text-ink'
            }`}
        >
          compare
        </button>
      </div>

      <div className="grid min-h-0 gap-3 lg:grid-cols-[minmax(0,1fr)_minmax(0,1.2fr)]">
        {/* Process table */}
        <div className="overflow-hidden rounded-md border border-line bg-abyss">
          <p className="border-b border-line px-3 py-1.5 font-mono text-[0.7rem] tracking-[0.04em] text-ink-faint">
            Processes · arrival / burst / priority
          </p>
          <ul className="flex flex-col">
            {rows.map((r) => (
              <li key={r.id} className="flex items-center gap-2 border-b border-line px-3 py-1.5 last:border-b-0">
                <span className="w-8 shrink-0 font-mono text-[0.95rem] text-ink">{r.id}</span>
                {['arrival', 'burst', 'priority'].map((f) => (
                  <label key={f} className="flex min-w-0 flex-1 items-center gap-1 font-mono text-[0.72rem] text-ink-faint">
                    {f[0]}
                    <input
                      type="number"
                      min={0}
                      value={r[f]}
                      onChange={(e) => updateRow(r.id, f, e.target.value)}
                      aria-label={`${r.id} ${f}`}
                      className="min-w-0 w-full rounded border border-line bg-abyss/70 px-1.5 py-0.5 text-[0.9rem] text-ink"
                    />
                  </label>
                ))}
                <button
                  type="button"
                  onClick={() => setRows((old) => old.filter((x) => x.id !== r.id))}
                  aria-label={`Remove ${r.id}`}
                  className="shrink-0 font-mono text-[0.9rem] text-ink-faint transition-colors hover:text-ink"
                >
                  ✕
                </button>
              </li>
            ))}
          </ul>
          <button
            type="button"
            onClick={addProcess}
            className="w-full px-3 py-1.5 font-mono text-[0.8rem] tracking-[0.04em] text-ink-dim transition-colors hover:text-ink"
          >
            + add process
          </button>
        </div>

        {/* CPU + queues */}
        <div className="flex min-h-0 flex-col gap-2">
          <div className="flex items-stretch gap-2">
            <div className="min-w-0 flex-1 rounded-md border border-line bg-abyss p-2.5">
              <p className="font-mono text-[0.68rem] tracking-[0.04em] text-ink-faint">ready queue</p>
              <div className="mt-1.5 flex min-h-[2rem] flex-wrap gap-1" aria-live="polite">
                {waitingIds.length ? (
                  waitingIds.map((id) => (
                    <motion.span
                      key={id}
                      className="rounded border border-line bg-abyss px-2 py-0.5 font-mono text-[0.8rem] text-ink"
                      initial={reduced ? false : { opacity: 0, scale: 0.85 }}
                      animate={{ opacity: 1, scale: 1 }}
                      transition={{ duration: reduced ? 0 : 0.2 }}
                    >
                      {id}
                    </motion.span>
                  ))
                ) : (
                  <span className="font-mono text-[0.75rem] text-ink-faint">empty</span>
                )}
              </div>
            </div>
            <motion.div
              key={current ? `${current.pid}-${current.start}` : 'idle'}
              className="grid w-28 shrink-0 place-items-center rounded-md border border-line bg-abyss p-2.5 text-center"
              style={current ? { borderColor: PALETTE.cyan } : undefined}
              initial={reduced ? false : { opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ duration: reduced ? 0 : 0.2 }}
            >
              <div>
                <p className="font-mono text-[0.68rem] tracking-[0.04em] text-ink-faint">cpu</p>
                <p className="font-mono text-[1.3rem] text-ink">
                  {current ? current.pid : '···'}
                </p>
              </div>
            </motion.div>
            <div className="min-w-0 flex-1 rounded-md border border-line bg-abyss p-2.5">
              <p className="font-mono text-[0.68rem] tracking-[0.04em] text-ink-faint">done</p>
              <div className="mt-1.5 flex min-h-[2rem] flex-wrap gap-1" aria-live="polite">
                {[...doneIds].map((id) => (
                  <span key={id} className="rounded border border-line bg-abyss px-2 py-0.5 font-mono text-[0.8rem] text-ink-faint">
                    ✓ {id}
                  </span>
                ))}
              </div>
            </div>
          </div>

          {/* Gantt timeline */}
          <div className="rounded-md border border-line bg-abyss p-2.5" role="img" aria-label={`Gantt timeline, ${CPU_META[algo].full}`}>
            <div className="flex h-12 gap-[2px]" aria-hidden="true">
              {result.segments.map((s, i) => {
                const lit = reduced || i < reached
                return (
                  <motion.div
                    key={`${s.pid}-${s.start}`}
                    className="grid h-full place-items-center overflow-hidden rounded"
                    style={{
                      flexGrow: Math.max(1, s.end - s.start),
                      background: lit ? 'var(--color-subtle)' : 'transparent',
                      border: '1px solid var(--color-line)',
                      opacity: lit ? 1 : 0.4,
                    }}
                    initial={reduced ? false : { opacity: 0, scaleX: 0 }}
                    animate={{ opacity: lit ? 1 : 0.35, scaleX: 1 }}
                    transition={{ duration: reduced ? 0 : 0.25 }}
                  >
                    <span className="font-mono text-[0.7rem]" style={{ color: lit ? PALETTE.ink : PALETTE.inkFaint }}>
                      {s.pid}
                    </span>
                  </motion.div>
                )
              })}
            </div>
            <div className="mt-1 flex justify-between font-mono text-[0.7rem] text-ink-faint" aria-hidden="true">
              <span>t=0</span>
              <span>t={totalTime}</span>
            </div>
          </div>

          {/* Metrics + verdict */}
          {done ? (
            <motion.div
              className="rounded-md border border-line bg-abyss p-3"
              initial={reduced ? false : { opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ duration: reduced ? 0 : 0.3 }}
            >
              <p className="font-mono text-[0.95rem] tabular-nums text-ink">
                avg waiting {result.avgWaiting.toFixed(2)} · avg turnaround {result.avgTurnaround.toFixed(2)}
              </p>
              <p className="mt-0.5 text-[0.95rem] text-ink-dim">{verdictCPU(algo, result)}</p>
            </motion.div>
          ) : (
            <p className="font-mono text-[0.8rem] text-ink-faint" aria-live="polite">
              running… {shown.length}/{result.segments.length} slices
            </p>
          )}
        </div>
      </div>

      {/* Compare mode */}
      {compare && resultB ? (
        <div className="flex flex-col gap-2">
          <div className="flex flex-wrap items-center gap-1.5" role="group" aria-label="Compare with">
            <span className="font-mono text-[0.75rem] tracking-[0.04em] text-ink-faint">vs</span>
            {CPU_ALGORITHMS.filter((a) => a !== algo).map((a) => (
              <button
                key={a}
                type="button"
                onClick={() => setAlgoB(a)}
                aria-pressed={algoB === a}
                className={`rounded-md border px-2.5 py-1 font-mono text-[0.8rem] tracking-[0.04em] transition-colors ${
                  algoB === a ? 'border-cyan text-ink' : 'border-line text-ink-dim hover:text-ink'
                }`}
              >
                {CPU_META[a].name}
              </button>
            ))}
          </div>
          <CompareTable
            head="Metric"
            columns={[
              { key: 'a', title: CPU_META[algo].name, tone: 'a' },
              { key: 'b', title: CPU_META[algoB].name, tone: 'b' },
            ]}
            rows={[
              { label: 'Avg waiting', a: result.avgWaiting.toFixed(2), b: resultB.avgWaiting.toFixed(2) },
              { label: 'Avg turnaround', a: result.avgTurnaround.toFixed(2), b: resultB.avgTurnaround.toFixed(2) },
              { label: 'Context switches', a: String(result.switches), b: String(resultB.switches) },
            ]}
            caption={compareVerdict(CPU_META[algo].name, result, CPU_META[algoB].name, resultB)}
          />
        </div>
      ) : null}
    </div>
  )
}
