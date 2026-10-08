import { useEffect, useState } from 'react'
import { AnimatePresence, motion } from 'framer-motion'
import { PALETTE } from '../lib/constants'

const BOOT_LINES = [
  'Linux version 6.8.0-student (build@linux) (gcc 13.2.0)',
  '[  OK  ] Mounted /home/student',
  '[  OK  ] Reached target local filesystems',
  '[  OK  ] Started terminal login service',
  '[  OK  ] Started container runtime',
  '[  OK  ] Reached target multi-user system',
  '[  OK  ] Started classroom demo session',
]

/**
 * Fake Linux boot log that resolves to a login prompt, then the title.
 * Pressing any key skips directly to the finished title state.
 */
export default function BootSequence({
  title = 'Linux and the Terminal',
  subtitle = 'from first command to live website',
  presenter = 'YOUR NAME',
  user = 'student',
  host = 'laptop',
  reduced = false,
}) {
  const [lines, setLines] = useState(reduced ? BOOT_LINES.length : 0)
  const [phase, setPhase] = useState(reduced ? 'title' : 'boot')

  useEffect(() => {
    if (reduced) return undefined
    if (phase !== 'boot') return undefined
    if (lines >= BOOT_LINES.length) {
      const login = window.setTimeout(() => setPhase('login'), 420)
      const finale = window.setTimeout(() => setPhase('title'), 1180)
      return () => {
        window.clearTimeout(login)
        window.clearTimeout(finale)
      }
    }
    const id = window.setTimeout(() => setLines((n) => n + 1), 135)
    return () => window.clearTimeout(id)
  }, [lines, phase, reduced])

  useEffect(() => {
    if (reduced || phase === 'title') return undefined
    const skip = (e) => {
      e.stopPropagation()
      setLines(BOOT_LINES.length)
      setPhase('title')
    }
    window.addEventListener('keydown', skip, true)
    return () => window.removeEventListener('keydown', skip, true)
  }, [phase, reduced])

  return (
    <div className="relative min-h-[24rem] overflow-hidden rounded-md border border-line bg-abyss p-5 sm:p-7" aria-live="polite">
      <AnimatePresence mode="wait">
        {phase === 'title' ? (
          <motion.div
            key="boot-title"
            className="flex min-h-[20rem] flex-col items-center justify-center gap-2 text-center"
            initial={reduced ? false : { opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ duration: reduced ? 0 : 0.3, ease: [0.2, 0, 0, 1] }}
          >
            <p className="font-mono text-[0.75rem] tracking-[0.04em] text-ink-faint">
              {host} login: {user}
            </p>
            <h2 className="fs-h1 font-display font-bold leading-tight text-ink">{title}</h2>
            <p className="fs-lead max-w-[48ch] text-ink-dim">{subtitle}</p>
            <p className="mt-1 font-mono text-[0.82rem] tracking-[0.04em] text-ink-faint">
              presented by {presenter}
            </p>
          </motion.div>
        ) : (
          <motion.div
            key={phase}
            initial={reduced ? false : { opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: reduced ? 0 : 0.25 }}
          >
            <div className="font-mono text-[clamp(0.95rem,1.25vw,1.2rem)] leading-relaxed" role="log" aria-label="Fake Linux boot log">
              {BOOT_LINES.slice(0, lines).map((line) => (
                <p key={line}>
                  <span style={{ color: PALETTE.green }}>{line.startsWith('[  OK') ? '[  OK  ]' : '»'}</span>{' '}
                  <span className="text-ink-dim">{line.replace(/^\[\s+OK\s+\]\s*/, '')}</span>
                </p>
              ))}
              <p>
                <span className="text-ink-faint">{phase === 'login' ? `${host} login:` : '$'}</span>{' '}
                {phase === 'login' ? (
                  <span className="font-semibold text-ink">{user}</span>
                ) : (
                  <span className="caret inline-block text-green" aria-hidden="true">
                    ▊
                  </span>
                )}
              </p>
            </div>
            <p className="mt-3 font-mono text-[0.72rem] tracking-[0.04em] text-ink-faint">
              press any key to skip
            </p>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  )
}
