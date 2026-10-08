import { motion } from 'framer-motion'

/**
 * Honest Linux terminal frame: flat surface, 1px hairline border, square
 * corners. No dots, no glow, no scanlines.
 *
 * `TerminalWindow` is the chrome (title bar, optional toolbar).
 * `TerminalLine` renders one scripted step: a command with a `$` prompt and its
 * output, revealed in sequence by the parent `TerminalPlayer`.
 */

const TONES = {
  dim: 'var(--color-ink-dim)',
  secondary: 'var(--color-ink-dim)',
  muted: 'var(--color-ink-faint)',
  green: 'var(--color-green)',
  red: 'var(--color-red)',
  cyan: 'var(--color-cyan)',
  amber: 'var(--color-amber)',
}

export default function TerminalWindow({
  title = '',
  user = 'you',
  host = 'laptop',
  className = '',
  chrome = true,
  compact = false,
  children,
}) {
  return (
    <div
      className={`flex min-h-0 flex-col overflow-hidden rounded-none border border-line bg-abyss ${className}`}
    >
      {chrome ? (
        <div
          className={`flex shrink-0 items-center gap-3 border-b border-line bg-abyss ${
            compact ? 'px-3 py-1.5' : 'px-4 py-2'
          }`}
        >
          <span className="min-w-0 flex-1 truncate font-mono text-[0.75rem] text-ink-faint">
            {title ? (
              <span>{title}</span>
            ) : (
              <>
                <span>{user}</span>
                <span>@</span>
                <span>{host}</span>
                <span>:~$</span>
              </>
            )}
          </span>
        </div>
      ) : null}
      <div
        className={`slide-rail min-h-0 flex-1 overflow-y-auto bg-abyss ${
          compact ? 'p-2.5' : 'p-3 sm:p-4'
        }`}
      >
        {children}
      </div>
    </div>
  )
}

/** One `$ command` line with staggered fade. */
export function CommandLine({ command, prompt = '$', delay = 0, reduced = false }) {
  return (
    <motion.p
      className="fs-term font-mono"
      initial={reduced ? false : { opacity: 0 }}
      animate={{ opacity: 1 }}
      transition={{ duration: reduced ? 0 : 0.2, delay: reduced ? 0 : delay }}
    >
      <span className="text-ink-faint">{prompt}</span>{' '}
      <span className="font-medium text-ink">{command}</span>
    </motion.p>
  )
}

/** Preformatted output block (secondary text, monospace, preserved whitespace). */
export function Output({ children, delay = 0, reduced = false, tone = 'dim', className = '' }) {
  return (
    <motion.pre
      className={`fs-term-out overflow-x-auto whitespace-pre font-mono text-ink-dim ${className}`}
      style={tone !== 'dim' && TONES[tone] ? { color: TONES[tone] } : undefined}
      initial={reduced ? false : { opacity: 0 }}
      animate={{ opacity: 1 }}
      transition={{ duration: reduced ? 0 : 0.2, delay: reduced ? 0 : delay }}
    >
      {children}
    </motion.pre>
  )
}

/**
 * Plays a scripted list of steps: `{ cmd, out, tone, delay }`.
 * Steps appear one after another; each step's command is typed by the parent.
 */
export function TerminalPlayer({ steps = [], prompt = '$', reduced = false, stepMs = 700 }) {
  const visible = reduced ? steps.length : steps.length
  return (
    <div className="flex flex-col gap-1" role="log" aria-live="off">
      {steps.slice(0, visible).map((step, i) => (
        <div key={`${step.cmd}-${i}`}>
          <CommandLine
            command={step.cmd}
            prompt={prompt}
            delay={reduced ? 0 : i * (stepMs / 1000)}
            reduced={reduced}
          />
          {step.out ? (
            <Output
              tone={step.tone ?? 'dim'}
              delay={reduced ? 0 : i * (stepMs / 1000) + 0.22}
              reduced={reduced}
            >
              {step.out}
            </Output>
          ) : null}
        </div>
      ))}
    </div>
  )
}
