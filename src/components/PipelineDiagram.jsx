import { motion } from 'framer-motion'
import { PALETTE } from '../lib/constants'
import { useEffect, useState } from 'react'
import { useMotionPrefs } from '../hooks/useMotionPrefs'
import { useSceneVisible } from '../hooks/useSceneVisible'

/**
 * Animated CI/CD stage pipeline.
 * Stages light up one after another; a stage can carry its own status
 * (`pass` | `fail` | `skip`) so the poisonous/healthy split-screen can reuse it.
 */
export default function PipelineDiagram({
  stages = [],
  orientation = 'horizontal',
  activeIndex = null,
  compact = false,
  reduced = false,
  stepInterval = 0.42,
  className = '',
}) {
  const { reduced: rm } = useMotionPrefs()
  const still = reduced || rm
  // `compact` stacks stages in a wrapping row instead of a column: for a
  // five-stage pipeline shown beside a file listing, vertical space is scarcer
  // than horizontal space.
  const horizontal = orientation === 'horizontal' || compact

  // Stages light up one at a time, driven by one shared interval. To replay,
  // remount this component with a different React `key`:
  // that resets the counter without any effect-driven state juggling.
  const [reached, setReached] = useState(still ? stages.length : 0)
  const visible = useSceneVisible()

  useEffect(() => {
    if (still || !visible) return undefined
    const id = window.setInterval(() => {
      setReached((n) => (n >= stages.length ? n : n + 1))
    }, stepInterval * 1000)
    return () => window.clearInterval(id)
  }, [still, stepInterval, stages.length, visible])

  const statusOf = (stage, i) => {
    if (stage.status) return stage.status
    if (activeIndex != null) return i <= activeIndex ? 'pass' : 'idle'
    return i < reached ? 'pass' : 'idle'
  }

  return (
    <ol
      className={`flex ${horizontal ? 'flex-col sm:flex-row' : 'flex-col'}  ${className}`}
      aria-label="Pipeline stages"
    >
      {stages.map((stage, i) => {
        const status = statusOf(stage, i)
        const failedBefore = stages.slice(0, i).some((previous, pi) => statusOf(previous, pi) === 'fail')
        const blocked = failedBefore && (status === 'idle' || status === 'skip')

        const nodeBorder =
          status === 'fail'
            ? PALETTE.red
            : status === 'idle' || blocked
              ? PALETTE.line
              : PALETTE.inkFaint
        const Stage = (
          <motion.li
            key={stage.id ?? stage.label}
            aria-label={`${stage.label}: ${status}${blocked ? ', blocked by an earlier failure' : ''}`}
            className={`relative flex min-w-0 items-center gap-3 ${
              horizontal
                ? 'flex-1 flex-col items-center text-center sm:px-1'
                : 'items-center'
            } ${i < stages.length - 1 ? (horizontal ? 'sm:flex-none sm:w-40' : 'pb-1') : ''}`}
            initial={still ? false : { opacity: 0 }}
            animate={{ opacity: blocked ? 0.45 : 1 }}
            transition={{
              duration: still ? 0 : 0.25,
              delay: still ? 0 : (activeIndex != null ? i * 0.06 : i * stepInterval),
              ease: [0.2, 0, 0, 1],
            }}
          >
            <div
              className={`relative flex flex-col items-center justify-center gap-1 rounded-md border border-line bg-abyss px-3 ${
                compact ? 'gap-0.5 py-1.5' : 'py-3'
              } ${horizontal ? 'w-full' : 'w-full flex-row justify-start text-left'}`}
              style={{
                borderColor: nodeBorder,
                opacity: status === 'idle' ? 0.6 : 1,
              }}
            >
              <span
                aria-hidden="true"
                className="grid place-items-center rounded-md border border-line font-mono font-bold"
                style={{
                  width: compact ? 24 : 30,
                  height: compact ? 24 : 30,
                  fontSize: compact ? '0.8rem' : '0.95rem',
                  color:
                    status === 'fail'
                      ? PALETTE.red
                      : status === 'idle' || blocked
                        ? PALETTE.inkFaint
                        : PALETTE.ink,
                }}
              >
                {status === 'pass' ? '✓' : status === 'fail' ? '✕' : status === 'skip' ? '–' : i + 1}
              </span>
              <span
                className={`font-display font-semibold leading-tight ${compact ? 'text-[0.85rem]' : 'fs-card'}`}
                style={{
                  color:
                    status === 'fail'
                      ? PALETTE.red
                      : status === 'idle' || blocked
                        ? PALETTE.inkFaint
                        : PALETTE.ink,
                }}
              >
                {stage.label}
              </span>
              {stage.cmd && !compact ? (
                <code className="truncate font-mono text-[0.75rem] text-ink-faint">
                  {stage.cmd}
                </code>
              ) : null}
              {stage.detail && !compact ? (
                <span className="max-w-[26ch] text-[0.72rem] leading-snug text-ink-faint">
                  {stage.detail}
                </span>
              ) : null}
              {/* Status is otherwise color + glyph only; name fail/skip in text
                  so the outcome never depends on color vision. Pass/idle need
                  no label: the step number and checkmark already say it. */}
              {status === 'fail' || status === 'skip' ? (
                <span
                  className="font-mono text-[0.7rem] uppercase tracking-[0.08em]"
                  style={{ color: status === 'fail' ? PALETTE.red : PALETTE.inkFaint }}
                >
                  {status}
                </span>
              ) : null}
            </div>

            {i < stages.length - 1 ? (
              <span
                aria-hidden="true"
                className={`relative ${horizontal ? 'my-2 h-6 sm:my-0 sm:h-0 sm:w-full' : 'h-6 w-full'} `}
              >
                <span
                  className={`absolute ${horizontal ? 'inset-x-0 top-1/2 h-px sm:h-px' : 'inset-y-0 left-4 h-full w-px'}`}
                  style={{ background: PALETTE.line }}
                />
                <motion.span
                  className={`absolute ${horizontal ? 'inset-x-0 top-1/2 h-px sm:h-px' : 'inset-y-0 left-4 h-full w-px'}`}
                  style={{
                    background: status === 'idle' || blocked ? PALETTE.line : PALETTE.inkFaint,
                    transformOrigin: horizontal ? 'left' : 'top',
                  }}
                  initial={still ? false : horizontal ? { scaleX: 0 } : { scaleY: 0 }}
                  animate={horizontal ? { scaleX: status === 'idle' ? 0 : 1 } : { scaleY: status === 'idle' ? 0 : 1 }}
                  transition={{
                    duration: still ? 0 : 0.25,
                    delay: still ? 0 : Math.max(0, (activeIndex != null ? i : i - 1) * stepInterval),
                    ease: [0.2, 0, 0, 1],
                  }}
                />
              </span>
            ) : null}
          </motion.li>
        )
        return Stage
      })}
    </ol>
  )
}
