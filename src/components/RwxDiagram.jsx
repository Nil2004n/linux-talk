import { motion } from 'framer-motion'

/**
 * Read-only rwx permission diagram. Triples reveal left to right so the
 * three-way structure of a mode string is obvious. For the interactive
 * version, see PermissionExplorer.
 */
export default function RwxDiagram({ mode = '-rwxr-xr-x', parts = [], caption, reduced = false }) {
  const groups = [
    { key: 'owner', label: 'owner', hint: 'the user who owns the file' },
    { key: 'group', label: 'group', hint: 'anyone in the file group' },
    { key: 'others', label: 'others', hint: 'everybody else' },
  ]

  return (
    <div className="rounded-md border border-line bg-abyss p-4">
      <div className="flex flex-wrap items-center gap-3">
        <span className="fs-caption font-mono tracking-[0.04em] text-ink-faint">
          ls -l
        </span>
        <code className="font-mono text-[clamp(1.1rem,1.5vw,1.5rem)] font-medium text-ink">
          {mode}
        </code>
      </div>

      <ol className="mt-3 flex flex-col gap-2.5">
        {groups.map((g, gi) => {
          const part = parts.find((p) => p.pos === g.key)
          const bits = part ? part.chars.split('') : []
          return (
            <li key={g.key}>
              <motion.div
                className="flex flex-wrap items-center gap-3"
                initial={reduced ? false : { opacity: 0 }}
                animate={{ opacity: 1 }}
                transition={{ duration: reduced ? 0 : 0.2, delay: reduced ? 0 : Math.min(0.12, gi * 0.06) }}
              >
                <span className="w-20 shrink-0 font-mono text-[clamp(0.85rem,1.05vw,1.05rem)] tracking-[0.04em] text-ink-faint">
                  {g.label}
                </span>

                <span className="flex gap-1.5">
                  {bits.map((bit, bi) => {
                    const on = bit !== '-'
                    return (
                      <motion.span
                        key={bi}
                        className="grid h-9 w-9 place-items-center rounded-md border border-line font-mono text-[clamp(0.95rem,1.15vw,1.15rem)]"
                        style={{
                          background: on ? 'var(--color-abyss)' : 'transparent',
                          color: on ? 'var(--color-ink)' : 'var(--color-ink-faint)',
                        }}
                        initial={reduced ? false : { opacity: 0 }}
                        animate={{ opacity: 1 }}
                        transition={{
                          duration: reduced ? 0 : 0.2,
                          delay: reduced ? 0 : Math.min(0.12, gi * 0.06 + bi * 0.04),
                        }}
                      >
                        {bit}
                      </motion.span>
                    )
                  })}
                </span>

                <span className="text-[clamp(0.85rem,1.05vw,1.05rem)] text-ink-faint">
                  {g.hint}
                </span>
              </motion.div>
            </li>
          )
        })}
      </ol>

      <div className="mt-3 flex flex-wrap gap-x-5 gap-y-1 border-t border-line pt-3">
        {[
          ['r', 'read', 'open and view it'],
          ['w', 'write', 'change its contents'],
          ['x', 'execute', 'run it as a program'],
        ].map(([bit, name, desc]) => (
          <span key={bit} className="flex items-baseline gap-2 text-[clamp(0.8rem,1rem,1rem)]">
            <code className="font-mono font-medium text-ink">{bit}</code>
            <span className="font-mono tracking-[0.04em] text-ink-dim">{name}</span>
            <span className="text-ink-faint">{desc}</span>
          </span>
        ))}
      </div>

      {caption ? (
        <p className="fs-caption mt-2 text-ink-faint">{caption}</p>
      ) : null}
    </div>
  )
}
