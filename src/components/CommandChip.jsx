import { useEffect, useState } from 'react'
import { AnimatePresence, motion } from 'framer-motion'
import { copyText } from '../lib/clipboard'

/**
 * Persistent bottom-left "command of the scene" chip.
 * Clicking or pressing Enter copies the command for live terminal use.
 */
export default function CommandChip({ command, label = 'command of this scene', reduced = false, onCopy }) {
  const [copied, setCopied] = useState(false)
  const [failed, setFailed] = useState(false)

  useEffect(() => {
    setCopied(false)
    setFailed(false)
  }, [command])

  useEffect(() => {
    if (!copied && !failed) return undefined
    const id = window.setTimeout(() => {
      setCopied(false)
      setFailed(false)
    }, 1600)
    return () => window.clearTimeout(id)
  }, [copied, failed])

  const copyCommand = async () => {
    if (!command) return
    if (await copyText(command)) {
      setFailed(false)
      setCopied(true)
      onCopy?.()
    } else {
      setCopied(false)
      setFailed(true)
    }
  }

  return (
    <div className="pointer-events-none fixed bottom-4 left-4 z-40 flex max-w-[calc(100vw-2rem)] px-0 print:hidden">
      <AnimatePresence mode="wait" initial={false}>
        {command ? (
          <motion.button
            key={command}
            type="button"
            onClick={copyCommand}
            aria-live="polite"
            aria-label={`Copy command ${command}`}
            title="Click to copy"
            initial={reduced ? false : { opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: reduced ? 0 : 0.2, ease: [0.2, 0, 0, 1] }}
            className="pointer-events-auto flex max-w-full items-center gap-3 rounded-md border border-line bg-abyss px-3 py-2 text-left"
          >
            <span className="font-mono text-[0.65rem] tracking-[0.04em] text-ink-faint">
              {copied ? 'copied' : failed ? 'copy unavailable — select manually' : label}
            </span>
            <code className="truncate font-mono text-[0.95rem] text-ink sm:text-[1.05rem]">
              <span className="text-ink-faint">$ </span>
              {command}
            </code>
          </motion.button>
        ) : null}
      </AnimatePresence>
    </div>
  )
}
