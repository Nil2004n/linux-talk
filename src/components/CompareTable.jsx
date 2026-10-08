const COLUMN_TONES = {
  left: 'var(--color-ink)',
  right: 'var(--color-ink)',
  a: 'var(--color-ink)',
  b: 'var(--color-ink)',
  good: 'var(--color-green)',
  bad: 'var(--color-red)',
  win: 'var(--color-green)',
  lose: 'var(--color-amber)',
}

/**
 * Comparison table: hairline row rules, no zebra fills, tabular numbers,
 * mono for commands. Tones carry meaning (good/bad) or stay neutral.
 */
export default function CompareTable({
  columns = [],
  rows = [],
  head = null,
  caption,
  compact = false,
  className = '',
}) {
  const tones = columns.map((c) => COLUMN_TONES[c.tone] ?? 'var(--color-ink)')
  // One label column plus exactly one track per value column. Getting this
  // count wrong wraps the last cell onto an implicit row and doubles the height
  // of every row, which is invisible in code review but obvious on screen.
  const template = `minmax(9rem,1fr) repeat(${Math.max(columns.length, 1)},minmax(0,1.4fr))`

  return (
    <div className={`overflow-hidden rounded-none border border-line bg-abyss ${className}`}>
      <div
        className="grid border-b border-line"
        style={{ gridTemplateColumns: template }}
      >
        <div className="fs-caption px-4 py-2 font-mono tracking-[0.04em] text-ink-faint">
          {head ?? 'Dimension'}
        </div>
        {columns.map((c, i) => (
          <div
            key={c.title}
            className={`border-l border-line px-5 py-3 font-mono text-[0.85rem] font-medium tracking-[0.04em] ${compact ? 'text-[0.8rem]' : ''}`}
            style={{ color: tones[i] }}
          >
            {c.title}
          </div>
        ))}
      </div>

      <div>
        {rows.map((row, ri) => (
          <div
            key={row.label ?? ri}
            className="grid border-b border-line last:border-b-0"
            style={{ gridTemplateColumns: template }}
          >
            <div className="fs-ref px-4 py-1.5 font-medium break-words text-ink-dim min-w-0">
              {row.label}
            </div>
            {columns.map((c, ci) => {
              const value = row[c.key ?? c.title] ?? row.values?.[ci] ?? ''
              const isGood = c.check?.(row) ?? null
              return (
                <div
                  key={c.title}
                  className={`fs-ref border-l border-line px-4 py-1.5 font-mono tabular-nums leading-snug break-words min-w-0 ${
                    compact ? 'text-[0.85rem]' : 'text-ink'
                  }`}
                >
                  {isGood === true ? (
                    <span className="font-medium" style={{ color: tones[ci] }}>
                      ✓{' '}
                    </span>
                  ) : null}
                  {isGood === false ? (
                    <span className="font-medium" style={{ color: 'var(--color-red)' }}>
                      ✗{' '}
                    </span>
                  ) : null}
                  {value}
                </div>
              )
            })}
          </div>
        ))}
      </div>

      {caption ? (
        <p className="fs-caption border-t border-line bg-abyss px-4 py-2.5 font-mono text-ink-faint">
          {caption}
        </p>
      ) : null}
    </div>
  )
}
