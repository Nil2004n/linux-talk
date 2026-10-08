import { useCallback, useEffect, useState } from 'react'
import { motion } from 'framer-motion'
import { PALETTE } from '../lib/constants'
import { useMotionPrefs } from '../hooks/useMotionPrefs'
import { useSceneVisible } from '../hooks/useSceneVisible'
import PipelineDiagram from './PipelineDiagram'

/**
 * Dramatic side-by-side comparison of a poisonous push and a healthy push.
 * Each side shows the commit, the pipeline stages and the deploy outcome, and a
 * shared replay button restarts both animations in sync.
 *
  * Everything is scripted data from scenes.js; nothing here talks to a network.
 */
export default function PoisonPush({
  poisonous = {},
  healthy = {},
  replayLabel = 'replay both pipelines',
  onReplay,
  reduced = false,
}) {
  const [run, setRun] = useState(0)

  const replay = useCallback(() => {
    setRun((r) => r + 1)
    onReplay?.()
  }, [onReplay])

  return (
    <div className="flex min-h-0 flex-col gap-3">
      <div className="grid min-h-0 flex-1 grid-cols-1 gap-4 lg:grid-cols-2">
        {/* `key={run}` remounts both sides so the whole sequence replays. */}
        <Side key={`bad-${run}`} {...poisonous} tone="bad" reduced={reduced} />
        <Side key={`good-${run}`} {...healthy} tone="good" reduced={reduced} />
      </div>

      <div className="flex shrink-0 items-center justify-center gap-3">
        <button
          type="button"
          onClick={replay}
          className="inline-flex items-center gap-2.5 rounded-md border border-line bg-abyss px-5 py-2.5 font-mono text-[1rem] tracking-[0.04em] text-ink transition-colors duration-200 hover:border-cyan"
        >
          {replayLabel}
        </button>
      </div>
    </div>
  )
}

function Side({ title, subtitle, file, fileLines, stages, log, outcome, tone, reduced }) {
  const color = tone === 'bad' ? PALETTE.red : PALETTE.green
  const still = reduced
  // Stagger each stage's reveal so the two pipelines visibly race.
  const step = still ? 0 : 0.42

  return (
    <section
      className="relative flex min-h-0 flex-col gap-1.5 overflow-hidden rounded-md border border-line bg-abyss p-3"
      aria-label={title}
    >
      <header className="relative flex flex-wrap items-baseline gap-x-2.5">
        <p
          className="font-mono text-[0.8rem] tracking-[0.04em]"
          style={{ color }}
        >
          {tone === 'bad' ? 'Failing' : 'Passing'}
        </p>
        <h3 className="font-display text-[clamp(1.15rem,1.6vw,1.5rem)] font-semibold leading-tight text-ink">
          {title}
        </h3>
        {subtitle ? (
          <span className="fs-caption font-mono text-ink-dim">{subtitle}</span>
        ) : null}
      </header>

      {file === '.env' ? (
        <p
          className="relative shrink-0 rounded-md border px-3 py-1 font-mono text-[0.72rem] tracking-[0.04em]"
          style={{ borderColor: PALETTE.red, color: PALETTE.red }}
        >
          Demo secret · not real · do not reuse
        </p>
      ) : null}

      {file ? (
        <div className="relative shrink-0 overflow-hidden rounded-md border border-line bg-abyss">
          <div className="flex items-center justify-between border-b border-line px-3 py-1">
            <code className="font-mono text-[0.95rem] text-ink">
              {file}
            </code>
            <span className="fs-caption font-mono tracking-[0.04em] text-ink-faint">
              {fileLines.length} lines
            </span>
          </div>
          <pre className="max-h-[4.5rem] overflow-y-auto whitespace-pre px-3 py-1 font-mono text-[clamp(0.8rem,0.98vw,1rem)] leading-snug text-ink-dim">
            {fileLines.map((line, i) => (
              <motion.span
                key={i}
                className="block"
                initial={still ? false : { opacity: 0 }}
                animate={{ opacity: 1 }}
                transition={{ duration: still ? 0 : 0.2, delay: still ? 0 : Math.min(0.12, i * 0.06) }}
              >
                <span className="text-ink-faint">{String(i + 1).padStart(2, ' ')} </span>
                <span style={{ color: isSecretLine(line) ? PALETTE.red : undefined }}>
                  {line}
                </span>
              </motion.span>
            ))}
          </pre>
        </div>
      ) : null}

      <div className="relative min-h-0 shrink-0">
        <PipelineDiagram
          stages={stages}
          orientation="vertical"
          compact
          reduced={reduced}
          stepInterval={step}
        />
      </div>

      {log ? <Log lines={log} tone={tone} reduced={reduced} step={step} /> : null}

      {outcome ? (
        <motion.div
          className="relative shrink-0 rounded-md border border-line bg-abyss px-3 py-2"
          initial={still ? false : { opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{
            duration: still ? 0 : 0.25,
            delay: still ? 0 : (stages?.length ?? 0) * step,
          }}
        >
          <p className="font-mono text-[clamp(0.95rem,1.15vw,1.1rem)]" style={{ color }}>
            {outcome.title}
          </p>
          <p className="mt-0.5 text-[clamp(0.85rem,1.05vw,1rem)] leading-snug text-ink">
            {outcome.text}
          </p>
        </motion.div>
      ) : null}
    </section>
  )
}

/** Sequenced terminal log that replays whenever `run` changes. */
function Log({ lines = [], tone, reduced, step }) {
  const [shown, setShown] = useState(reduced ? lines.length : 0)

  const visible = useSceneVisible()

  useEffect(() => {
    if (reduced || !visible) return undefined
    const id = window.setInterval(() => {
      setShown((n) => (n >= lines.length ? n : n + 1))
    }, step * 1000)
    return () => window.clearInterval(id)
  }, [reduced, step, lines.length, visible])

  const color = tone === 'bad' ? PALETTE.red : PALETTE.green

  return (
    <pre
      className="relative max-h-[4.75rem] shrink-0 overflow-y-auto rounded-lg border border-line bg-abyss/75 px-3 py-0.5 font-mono text-[clamp(0.78rem,0.92vw,0.92rem)] leading-snug"
      aria-live="off"
    >
      {lines.slice(0, shown).map((line, i) => (
        <span key={i} className="block">
          <span style={{ color: PALETTE.cyan }}>$ </span>
          <span style={{ color }}>{line}</span>
        </span>
      ))}
      {shown < lines.length ? (
        <span aria-hidden="true" className="caret">
          ▊
        </span>
      ) : null}
    </pre>
  )
}

/** A line that looks like it carries a credential. */
function isSecretLine(line) {
  return /(KEY|TOKEN|SECRET|PASSWORD)=.+/.test(line) && !/^\s*[A-Z_]+=\s*$/.test(line)
}

/**
 * Fake animated server dashboard: CPU / memory / disk bars plus a live process
 * list. Values are scripted and loop; no real metrics are read.
 */
export function ServerDashboard({
  metrics = [],
  processes = [],
  reduced = false,
}) {
  const { reduced: rm } = useMotionPrefs()
  const still = reduced || rm
  const [tick, setTick] = useState(0)
  const visible = useSceneVisible()

  useEffect(() => {
    if (still || !visible) return undefined
    const t = window.setInterval(() => setTick((n) => n + 1), 1400)
    return () => window.clearInterval(t)
  }, [still, visible])

  // Deterministic pseudo-jitter: stable per metric id, no Math.random churn.
  const valueFor = (m, i) => {
    if (!still) {
      const seed = Math.abs([...m.label].reduce((a, c) => a + c.charCodeAt(0), 0))
      const wobble = ((tick * 37 + seed + i * 11) % 9) - 4
      return Math.max(2, Math.min(98, m.value + wobble))
    }
    return m.value
  }

  return (
    <div className="grid min-h-0 gap-4 lg:grid-cols-[minmax(0,1fr)_minmax(0,1fr)]">
      <div className="flex flex-col gap-2.5 rounded-md border border-line bg-abyss p-4">
        <p className="fs-caption font-mono tracking-[0.04em] text-ink-faint">
          Resource usage
        </p>
        {metrics.map((m, i) => {
          const v = valueFor(m, i)
          const color = m.tone === 'bad' ? PALETTE.red : m.tone === 'warn' ? PALETTE.amber : PALETTE.ink
          return (
            <div key={m.label}>
              <div className="flex items-baseline justify-between gap-3">
                <span className="font-mono text-[clamp(0.85rem,1.05vw,1.05rem)] text-ink-dim">
                  {m.label}
                </span>
                <span className="font-mono text-[clamp(0.85rem,1.05vw,1.05rem)] tabular-nums" style={{ color }}>
                  {v}%
                </span>
              </div>
              <div className="mt-1 h-2.5 overflow-hidden rounded-full bg-abyss">
                <motion.div
                  className="h-full rounded-full"
                  style={{ background: color }}
                  animate={{ width: `${v}%` }}
                  transition={{ duration: still ? 0 : 0.3, ease: [0.2, 0, 0, 1] }}
                />
              </div>
            </div>
          )
        })}
      </div>

      <div className="overflow-hidden rounded-md border border-line bg-abyss">
        <p className="fs-caption border-b border-line px-4 py-2 font-mono tracking-[0.04em] text-ink-faint">
          Processes
        </p>
        <ul className="flex flex-col">
          {processes.map((p) => {
            const hot = p.cpu > 50
            return (
              <li
                key={p.pid}
                className="flex items-center gap-3 border-b border-line px-4 py-1.5 font-mono text-[clamp(0.8rem,1rem,1rem)] tabular-nums last:border-b-0"
              >
                <span className="w-14 shrink-0 text-ink-faint">{p.pid}</span>
                <span className="min-w-0 flex-1 truncate text-ink">{p.cmd}</span>
                <span
                  className="w-12 shrink-0 text-right"
                  style={{ color: hot ? PALETTE.amber : PALETTE.ink }}
                >
                  {p.cpu}%
                </span>
              </li>
            )
          })}
        </ul>
      </div>
    </div>
  )
}
