import { useEffect, useRef, useState } from 'react'
import { motion } from 'framer-motion'
import { useMotionPrefs } from '../hooks/useMotionPrefs'

/**
 * Full-screen Part transition card.
 * Oversized type, the Part letter in the accent colour, one line of
 * description. Nothing else.
 */
export default function PartHeader({
  letter = 'A',
  name,
  agenda = [],
  totalAgenda = 0,
  index = 0,
  reduced = false,
}) {
  const line = agenda[0] ?? ''
  return (
    <div className="flex flex-col items-start justify-center gap-4 text-left">
      <motion.p
        className="font-mono text-[1.5rem] tracking-[0.04em] text-ink-faint"
        initial={reduced ? false : { opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ duration: reduced ? 0 : 0.25, ease: [0.2, 0, 0, 1] }}
      >
        Part <span className="font-bold text-cyan">{letter}</span>
      </motion.p>

      <motion.h2
        className="font-display font-semibold leading-[1.05] tracking-[-0.02em] text-ink"
        style={{ fontSize: 'clamp(3.5rem, 9vw, 7rem)' }}
        initial={reduced ? false : { opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ duration: reduced ? 0 : 0.3, delay: reduced ? 0 : 0.06, ease: [0.2, 0, 0, 1] }}
      >
        {name}
      </motion.h2>

      {line ? (
        <motion.p
          className="fs-body max-w-[52ch] text-ink-dim"
          initial={reduced ? false : { opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ duration: reduced ? 0 : 0.3, delay: reduced ? 0 : 0.12, ease: [0.2, 0, 0, 1] }}
        >
          {line}
        </motion.p>
      ) : null}

      <p className="sr-only">
        Section {index + 1}: {name}
        {totalAgenda > agenda.length ? `, ${totalAgenda - agenda.length} more points to reveal` : ''}
      </p>
    </div>
  )
}

/**
 * Staggered list wrapper: opacity-only reveals, at most 60ms apart.
 */
export function Stagger({ children, className = '', gap = 0.06, as: Tag = 'div' }) {
  const { reduced } = useMotionPrefs()
  return (
    <Tag className={className}>
      {Array.isArray(children)
        ? children.map((child, i) => (
            <motion.div
              key={child?.key ?? i}
              initial={reduced ? false : { opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{
                duration: reduced ? 0 : 0.2,
                delay: reduced ? 0 : Math.min(0.12, i * gap),
                ease: [0.2, 0, 0, 1],
              }}
            >
              {child}
            </motion.div>
          ))
        : children}
    </Tag>
  )
}

/** Reveals children with opacity only, whenever the wrapper scrolls into view. */
export function Reveal({ children, className = '', delay = 0 }) {
  const { reduced } = useMotionPrefs()
  const ref = useRef(null)
  const [shown, setShown] = useState(reduced)

  useEffect(() => {
    if (reduced || shown) return undefined
    const el = ref.current
    if (!el) return undefined
    const io = new IntersectionObserver(
      ([entry]) => {
        if (entry.isIntersecting) {
          setShown(true)
          io.disconnect()
        }
      },
      { threshold: 0.15 },
    )
    io.observe(el)
    return () => io.disconnect()
  }, [reduced, shown])

  return (
    <motion.div
      ref={ref}
      className={className}
      initial={reduced ? false : { opacity: 0 }}
      animate={{ opacity: shown ? 1 : 0 }}
      transition={{ duration: reduced ? 0 : 0.2, delay: reduced ? 0 : delay, ease: [0.2, 0, 0, 1] }}
    >
      {children}
    </motion.div>
  )
}
