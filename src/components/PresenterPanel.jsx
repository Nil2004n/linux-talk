import { useState } from 'react'
import { motion } from 'framer-motion'
import { PARTS, SHORTCUTS } from '../lib/constants'
import { copyText } from '../lib/clipboard'

/** Presenter-mode speaker-notes panel (press P). */
export default function PresenterPanel({
  slide,
  part,
  index = 0,
  total = 1,
  mode = 'slide',
  stepIndex = 0,
  maxSteps = 1,
  nextScene = null,
  reduced = false,
  onClose,
}) {
  const [copyState, setCopyState] = useState('idle')
  const copyCommand = async () => {
    if (!slide?.command) return
    setCopyState((await copyText(slide.command)) ? 'copied' : 'failed')
  }

  return (
    <motion.aside
      className="pointer-events-auto fixed bottom-0 right-0 top-0 z-50 w-[min(26rem,calc(100vw-2rem))] overflow-y-auto border-l border-line bg-abyss p-5"
      initial={reduced ? false : { opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      transition={{ duration: reduced ? 0 : 0.2, ease: [0.2, 0, 0, 1] }}
      aria-label="Speaker notes"
      role="complementary"
    >
      <header className="mb-2 flex items-center justify-between gap-3 border-b border-line pb-2">
        <p className="font-mono text-[0.7rem] tracking-[0.04em] text-ink-faint">
          Speaker notes · {PARTS[part]?.name ?? part}
        </p>
        <button
          type="button"
          onClick={onClose}
          aria-label="Hide speaker notes"
          className="rounded-md border border-line px-2 py-0.5 font-mono text-[0.75rem] text-ink-dim transition-colors hover:text-ink"
        >
          Close
        </button>
      </header>

      <p className="font-mono text-[0.72rem] tracking-[0.04em] text-ink-faint">
        Scene {index + 1} of {total} · reveal {Math.min(stepIndex + 1, maxSteps)} of {maxSteps} · {mode} mode
      </p>

      <p className="mt-2 text-[1.05rem] leading-relaxed text-ink">
        {slide?.notes ?? 'No notes for this scene.'}
      </p>

      {slide?.command ? (
        <div className="mt-3 flex items-center justify-between gap-3 border-t border-line pt-2 font-mono text-[0.9rem]">
          <p className="min-w-0 truncate">
            <span className="text-ink-faint">Type: </span>
            <span className="text-ink">{slide.command}</span>
          </p>
          <button
            type="button"
            onClick={copyCommand}
            aria-live="polite"
            className="shrink-0 rounded-md border border-line px-2 py-1 text-[0.72rem] tracking-[0.04em] text-ink-dim transition-colors hover:text-ink"
          >
            {copyState === 'copied' ? 'Copied' : copyState === 'failed' ? 'Unavailable' : 'Copy'}
          </button>
        </div>
      ) : null}

      {nextScene ? (
        <p className="mt-2 border-t border-line pt-2 text-[0.95rem] text-ink-dim">
          <span className="font-mono text-[0.72rem] tracking-[0.04em] text-ink-faint">
            next:{' '}
          </span>
          {nextScene.title ?? nextScene.id}
        </p>
      ) : null}
    </motion.aside>
  )
}

/** Keyboard shortcut cheatsheet, a simple two-column table. */
export function ShortcutHelp() {
  return (
    <div className="rounded-md border border-line bg-abyss p-4">
      <p className="mb-2 font-mono text-[0.7rem] tracking-[0.04em] text-ink-faint">
        Keyboard
      </p>
      <table className="w-full border-collapse">
        <tbody>
          {SHORTCUTS.map((s) => (
            <tr key={s.keys} className="border-b border-line last:border-b-0">
              <td className="whitespace-nowrap py-1 pr-4 font-mono text-[0.9rem] text-ink">
                {s.keys}
              </td>
              <td className="py-1 text-[0.9rem] text-ink-dim">{s.action}</td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  )
}
