import { useMemo, useState } from 'react'
import { AnimatePresence, motion } from 'framer-motion'
import { PALETTE } from '../lib/constants'
import { useMotionPrefs } from '../hooks/useMotionPrefs'
import { playSound } from '../lib/sound'
import Badge from './Badge'

/**
 * Interactive multiple-choice quiz with a result card.
 *
 * questions: [{
 *   id, q, options: [{ id, label, hint?, scores: { 'ubuntu': 2, ... } }],
 * }]
 * results:   { ubuntu: { name, tagline, bullets: [], tone } }
 */
export default function Quiz({
  questions = [],
  results = {},
  defaultResult = null,
  title = 'Which distro are you?',
  accent = PALETTE.cyan,
}) {
  const { reduced } = useMotionPrefs()
  const [answers, setAnswers] = useState({})
  const [submitted, setSubmitted] = useState(false)

  const total = questions.length
  const answered = Object.keys(answers).length

  const winner = useMemo(() => {
    if (!submitted) return null
    const tally = {}
    questions.forEach((q) => {
      const picked = q.options.find((o) => o.id === answers[q.id])
      if (!picked) return
      Object.entries(picked.scores ?? {}).forEach(([k, v]) => {
        tally[k] = (tally[k] ?? 0) + v
      })
    })
    const sorted = Object.entries(tally).sort((a, b) => b[1] - a[1])
    return sorted[0]?.[0] ?? defaultResult
  }, [submitted, answers, questions, defaultResult])

  const reset = () => {
    setAnswers({})
    setSubmitted(false)
  }

  return (
    <div
      className="grid min-h-0 grid-cols-1 gap-4 lg:grid-cols-[minmax(0,2.7fr)_minmax(0,1fr)]"
      style={{ gap: 'var(--gap-slide)' }}
    >
      <div className="flex min-h-0 min-w-0 flex-col gap-2">
        <div className="flex flex-wrap items-center gap-x-3 gap-y-2">
          <p className="font-mono text-[0.75rem] tracking-[0.04em] text-ink-faint">
            {title}
          </p>
          <span className="font-mono text-[0.75rem] tabular-nums" style={{ color: accent }}>
            {answered}/{total} answered
          </span>
          <span className="flex shrink-0 items-center gap-3">
            <button
              type="button"
              onClick={() => {
                setSubmitted(true)
                playSound('success')
              }}
              disabled={answered < total}
              className="rounded-md border border-line bg-abyss px-4 py-2 font-mono text-[0.9rem] tracking-[0.04em] text-ink transition-colors duration-200 hover:border-cyan disabled:cursor-not-allowed disabled:opacity-40"
            >
              {answered < total ? `answer ${total - answered} more` : 'reveal result'}
            </button>
            {submitted ? (
              <button
                type="button"
                onClick={reset}
                className="font-mono text-[0.85rem] tracking-[0.04em] text-ink-faint underline-offset-4 hover:text-ink hover:underline"
              >
                restart
              </button>
            ) : null}
          </span>
        </div>

        {/* Internally scrollable: five questions must stay reachable on short
            viewports (e.g. 1366x768) where the fixed slide clips overflow. */}
        <ol className="slide-rail grid min-h-0 grid-cols-1 gap-2 overflow-y-auto pr-1 sm:grid-cols-2">
          {questions.map((q, qi) => (
            <li key={q.id}>
              <fieldset
                className="relative min-w-0 rounded-md border border-line bg-abyss p-2.5 pl-2.5"
              >
                <span
                  aria-hidden="true"
                  className="absolute left-1 top-1 font-mono text-[0.7rem] text-ink-faint"
                >
                  {qi + 1}
                </span>
                <p className="fs-card font-medium leading-snug text-ink">{q.q}</p>
                <div className="mt-2 grid gap-1">
                  {q.options.map((o) => {
                    const picked = answers[q.id] === o.id
                    return (
                      <button
                        key={o.id}
                        type="button"
                        aria-pressed={picked}
                        onClick={() => {
                          setAnswers((a) => ({ ...a, [q.id]: o.id }))
                          setSubmitted(false)
                        }}
                        className={`flex flex-wrap items-baseline gap-x-1.5 rounded-md border px-2.5 py-1.5 text-left fs-control leading-snug transition-colors duration-200 ${
                          picked
                            ? 'border-cyan bg-abyss text-ink'
                            : 'border-line text-ink-dim hover:border-cyan hover:text-ink'
                        }`}
                      >
                        <span className="font-semibold">{o.label}</span>
                        {o.hint ? (
                          <span className="font-mono text-[0.62em] font-normal text-ink-faint">
                            {o.hint}
                          </span>
                        ) : null}
                      </button>
                    )
                  })}
                </div>
              </fieldset>
            </li>
          ))}
        </ol>
      </div>

      <div className="relative min-h-[9rem]">
        <AnimatePresence mode="wait">
          {submitted && winner ? (
            <ResultCard key={winner} result={results[winner]} reduced={reduced} />
          ) : (
            <motion.div
              key="empty"
              className="flex h-full flex-col items-start justify-center gap-2 rounded-md border border-line bg-abyss p-4"
              initial={reduced ? false : { opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
            >
              <p className="font-mono text-[0.8rem] tracking-[0.04em] text-ink-faint">
                Your result appears here
              </p>
              <p className="max-w-[30ch] text-[0.95rem] text-ink-faint">
                Five questions, one honest answer about which Linux fits you.
              </p>
            </motion.div>
          )}
        </AnimatePresence>
      </div>
    </div>
  )
}

function ResultCard({ result, reduced }) {
  if (!result) return null
  const tone = result.tone ?? 'info'
  const color =
    tone === 'good' || tone === 'healthy'
      ? PALETTE.green
      : tone === 'bad' || tone === 'poison'
        ? PALETTE.red
        : tone === 'warn'
          ? PALETTE.amber
          : PALETTE.cyan

  return (
    <motion.div
      className="relative flex h-full flex-col justify-center gap-3 overflow-hidden rounded-md border border-line bg-abyss p-4 sm:p-5"
      initial={reduced ? false : { opacity: 0 }}
      animate={{ opacity: 1 }}
      transition={{ duration: reduced ? 0 : 0.25, ease: [0.2, 0, 0, 1] }}
    >
      <div className="relative">
        <Badge kind={tone === 'bad' ? 'LIVE' : 'SLIDE'} size="sm" />
        <p className="mt-2 font-mono text-[0.7rem] tracking-[0.04em] text-ink-faint">
          Your match
        </p>
        <h3 className="fs-h2 font-display font-bold leading-tight text-ink">
          {result.name}
        </h3>
        <p className="fs-card mt-1 text-ink-dim">{result.tagline}</p>
        <ul className="mt-3 flex flex-col gap-1">
          {(result.bullets ?? []).map((b) => (
            <li key={b} className="fs-card flex items-start gap-2 text-ink">
              <span style={{ color }} aria-hidden="true">
                ▸
              </span>
              {b}
            </li>
          ))}
        </ul>
      </div>
    </motion.div>
  )
}
