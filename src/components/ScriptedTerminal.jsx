import { useCallback, useEffect, useMemo, useRef, useState } from 'react'
import TerminalWindow, { Output } from './TerminalWindow'
import { PALETTE } from '../lib/constants'

const TYPING_CEILING_MS = 620
const MIN_CHAR_MS = 8
const MAX_CHAR_MS = 30
const OUTPUT_MS = 320

/**
 * Scripted terminal playback.
 *
 * Commands type character-by-character, outputs appear after typing finishes,
 * and the presenter can replay the whole script. Reduced motion shows the
 * complete transcript immediately.
 */
export default function ScriptedTerminal({
  title = 'scripted terminal',
  user = 'student',
  host = 'laptop',
  prompt = '$',
  steps = [],
  autoPlay = true,
  reduced = false,
  replayLabel = 'replay terminal',
  className = '',
}) {
  const script = useMemo(
    () =>
      steps.map((step) => ({
        cmd: String(step.command ?? step.cmd ?? ''),
        out: step.output ?? step.out ?? '',
        tone: step.tone ?? 'dim',
      })),
    [steps],
  )
  const [runId, setRunId] = useState(0)
  const [finishedSteps, setFinishedSteps] = useState(() => (reduced || !autoPlay ? script.length : 0))
  const [activeStep, setActiveStep] = useState(() => (reduced || !autoPlay ? script.length : 0))
  const [chars, setChars] = useState(0)
  const [showOutput, setShowOutput] = useState(reduced || !autoPlay)
  const timers = useRef([])

  const clearTimers = useCallback(() => {
    timers.current.forEach((id) => window.clearTimeout(id))
    timers.current = []
  }, [])

  const later = useCallback(
    (fn, ms) => {
      const id = window.setTimeout(() => {
        if (!document.hidden) fn()
        else later(fn, Math.max(120, ms))
      }, ms)
      timers.current.push(id)
    },
    [],
  )

  useEffect(() => {
    clearTimers()
    if (reduced || !autoPlay || script.length === 0) {
      setFinishedSteps(script.length)
      setActiveStep(script.length)
      setChars(0)
      setShowOutput(true)
      return undefined
    }

    setFinishedSteps(0)
    setActiveStep(0)
    setChars(0)
    setShowOutput(false)

    let step = 0
    let char = 0
    let cancelled = false

    const playOutput = () => {
      if (cancelled) return
      setShowOutput(true)
      later(() => {
        if (cancelled) return
        setFinishedSteps(step + 1)
        step += 1
        if (step >= script.length) {
          setActiveStep(script.length)
          return
        }
        char = 0
        setChars(0)
        setShowOutput(false)
        setActiveStep(step)
        playCommand()
      }, OUTPUT_MS)
    }

    const playCommand = () => {
      if (cancelled) return
      const command = script[step]?.cmd ?? ''
      const length = Array.from(command).length
      if (length === 0) {
        playOutput()
        return
      }
      const charMs = Math.max(MIN_CHAR_MS, Math.min(MAX_CHAR_MS, TYPING_CEILING_MS / length))
      later(() => {
        if (cancelled) return
        char += 1
        setChars(char)
        if (char >= length) playOutput()
        else playCommand()
      }, charMs)
    }

    playCommand()
    return () => {
      cancelled = true
      clearTimers()
    }
  }, [autoPlay, clearTimers, later, reduced, runId, script])

  const replay = useCallback(() => {
    setRunId((n) => n + 1)
  }, [])

  const active = script[activeStep]
  const activeText = active ? Array.from(active.cmd).slice(0, chars).join('') : ''
  const done = finishedSteps >= script.length

  return (
    <TerminalWindow
      title={title}
      user={user}
      host={host}
      className={className}
      key={`${title}-${runId}`}
    >
      <div className="flex min-h-0 flex-col gap-1" role="log" aria-label={`${title} transcript`}>
        {script.slice(0, finishedSteps).map((step, i) => (
          <div key={`${step.cmd}-${i}`}>
            <p className="fs-term font-mono">
              <span style={{ color: PALETTE.cyan }}>{prompt} </span>
              <span className="font-semibold text-ink">{step.cmd}</span>
            </p>
            {step.out ? <Output tone={step.tone}>{step.out}</Output> : null}
          </div>
        ))}

        {!done && active ? (
          <div>
            <p className="fs-term font-mono">
              <span style={{ color: PALETTE.cyan }}>{prompt} </span>
              <span className="font-semibold text-ink">{activeText}</span>
              <span className="caret ml-1 inline-block" aria-hidden="true">
                ▊
              </span>
            </p>
            {showOutput && active.out ? <Output tone={active.tone}>{active.out}</Output> : null}
          </div>
        ) : null}

        {done ? (
          <p className="fs-term font-mono">
            <span style={{ color: PALETTE.cyan }}>{prompt} </span>
            <span className="caret inline-block" aria-hidden="true">
              ▊
            </span>
            <span className="sr-only">Terminal script complete</span>
          </p>
        ) : null}
      </div>

      <div className="mt-3 flex shrink-0 justify-end">
        <button
          type="button"
          onClick={replay}
          className="rounded-md border border-line px-3 py-1.5 font-mono text-[0.78rem] tracking-[0.04em] text-ink-dim transition-colors hover:text-ink"
        >
          {replayLabel}
        </button>
      </div>
    </TerminalWindow>
  )
}
