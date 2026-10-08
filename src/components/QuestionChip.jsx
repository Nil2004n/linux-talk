import { useState } from 'react'
import { motion } from 'framer-motion'

/**
 * Classroom question chip with a presenter-controlled reveal.
 * Keyboard and screen-reader users get the same reveal through the button.
 */
export default function QuestionChip({ question, answer, reduced = false }) {
  const [open, setOpen] = useState(false)

  return (
    <div className="rounded-md border border-line bg-abyss p-3 sm:p-4">
      <p className="font-mono text-[0.72rem] tracking-[0.04em] text-ink-faint">Question</p>
      <p className="fs-body mt-1 font-medium text-ink">
        <span className={`key-term${open ? ' revealed' : ''}`}>{question}</span>
      </p>
      <button
        type="button"
        onClick={() => setOpen((o) => !o)}
        aria-expanded={open}
        className="mt-2 rounded-md border border-line px-3 py-1.5 font-mono text-[0.78rem] tracking-[0.04em] text-ink-dim transition-colors hover:text-ink"
      >
        {open ? 'Hide answer' : 'Reveal answer'}
      </button>
      {open ? (
        <motion.p
          className="fs-body mt-2 border-t border-line pt-2 text-ink-dim"
          initial={reduced ? false : { opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ duration: reduced ? 0 : 0.2 }}
        >
          {answer}
        </motion.p>
      ) : null}
    </div>
  )
}
