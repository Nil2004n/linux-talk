import { motion } from 'framer-motion'

/**
 * Syntax-highlighted code listing with a filename bar.
 *
 * Highlighting is intentionally minimal and rule-based: no dependency, no
 * parsing, and it can never mangle a shell comment or a YAML key.
 */
export default function CodeBlock({
  file,
  lines = [],
  caption,
  reduced = false,
  highlight = /secrets?|token|key|password/i,
}) {
  return (
    <div className="relative flex min-h-0 flex-col overflow-hidden rounded-none border border-line bg-abyss">
      <div className="flex shrink-0 items-center gap-2 border-b border-line bg-abyss px-3 py-1.5">
        <code className="min-w-0 flex-1 truncate font-mono text-[clamp(0.85rem,1.05vw,1rem)] text-ink-faint">
          {file}
        </code>
      </div>

      <pre className="min-h-0 flex-1 overflow-auto px-3 py-2 font-mono text-[clamp(0.8rem,1.02vw,1.05rem)] leading-snug">
        <code>
          {lines.map((line, i) => (
            <motion.span
              key={i}
              className="block whitespace-pre"
              initial={reduced ? false : { opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{
                duration: reduced ? 0 : 0.18,
                delay: reduced ? 0 : Math.min(0.45, i * 0.022),
              }}
            >
              {highlightLine(line, highlight)}
            </motion.span>
          ))}
        </code>
      </pre>

      {caption ? (
        <p className="fs-caption shrink-0 border-t border-line bg-abyss/40 px-3 py-2 text-ink-faint">
          {caption}
        </p>
      ) : null}
    </div>
  )
}

/* Three tones only: accent for keys, muted for comments, secondary for the
   rest, semantic red for risky names. */
const C = {
  comment: 'var(--color-ink-faint)',
  key: 'var(--color-cyan)',
  string: 'var(--color-ink-dim)',
  flag: 'var(--color-ink-dim)',
  plain: 'var(--color-ink-dim)',
  danger: 'var(--color-red)',
}

function highlightLine(line, highlight) {
  if (!line) return ' '
  if (/^\s*#/.test(line)) return <span style={{ color: C.comment }}>{line}</span>

  // key: value / KEY=value / --flag
  const kv = line.match(/^(\s*(?:-\w|--[\w-]+)\s+)?([A-Za-z_][\w.-]*)(:|=)(.*)$/)
  if (kv) {
    const [, flag, key, sep, rest] = kv
    const risky = highlight.test(key)
    return (
      <>
        {flag ? <span style={{ color: C.flag }}>{flag}</span> : null}
        <span style={{ color: risky ? C.danger : C.key }}>{key}</span>
        <span style={{ color: C.plain }}>{sep}</span>
        <span style={{ color: rest.trim() ? C.string : C.comment }}>
          {rest || ' '}
        </span>
      </>
    )
  }

  if (/^\s*-\s/.test(line)) return <span style={{ color: C.flag }}>{line}</span>
  return <span style={{ color: C.plain }}>{line}</span>
}
