/**
 * Quiet content card: flat surface, hairline border, no icon, no hover lift.
 * Titles carry hierarchy through size and weight, not colour.
 */
export default function Card({
  children,
  title,
  subtitle,
  className = '',
  bodyClass = '',
  as: Tag = 'div',
}) {
  return (
    <div
      className={`relative ${className}`}
    >
      <Tag
        className={`relative h-full overflow-hidden rounded-md border border-line bg-abyss p-5 ${bodyClass}`}
      >
        <div className="relative min-w-0">
          {title ? (
            <h3 className="fs-h3 font-display font-semibold leading-tight text-ink">
              {title}
            </h3>
          ) : null}
          {subtitle ? (
            <p className="mt-0.5 font-mono text-[0.8rem] tracking-[0.04em] text-ink-faint">
              {subtitle}
            </p>
          ) : null}
          <div className={`fs-card text-ink-dim ${title || subtitle ? 'mt-1.5' : ''}`}>
            {children}
          </div>
        </div>
      </Tag>
    </div>
  )
}

/** Callout with a semantic hairline rail. Used for rm -rf, supply chain, secrets. */
export function Callout({
  tone = 'warn',
  title,
  children,
  className = '',
}) {
  const rail =
    tone === 'bad' || tone === 'poison'
      ? 'var(--color-red)'
      : tone === 'good' || tone === 'healthy'
        ? 'var(--color-green)'
        : tone === 'info'
          ? 'var(--color-cyan)'
          : 'var(--color-amber)'
  return (
    <div
      role="note"
      className={`relative overflow-hidden rounded-md border border-line bg-abyss p-5 pl-6 ${className}`}
    >
      <span
        aria-hidden="true"
        className="absolute inset-y-0 left-0 w-[3px]"
        style={{ background: rail }}
      />
      <div className="min-w-0">
        {title ? (
          <p className="fs-h3 font-display font-semibold text-ink">
            {title}
          </p>
        ) : null}
        <div
          className={`fs-card ${
            tone === 'bad' || tone === 'poison' ? 'text-ink' : 'text-ink-dim'
          }`}
        >
          {children}
        </div>
      </div>
    </div>
  )
}
