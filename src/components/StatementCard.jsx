/**
 * Statement card. Flat surface, hairline border, left-aligned. The `accent`
 * prop is accepted for API compatibility and ignored: colour is spent only
 * where it carries meaning.
 */
export default function StatementCard({ title, subtitle, children, className = '' }) {
  return (
    <section
      className={`overflow-hidden rounded-md border border-line bg-abyss p-5 sm:p-6 ${className}`}
      aria-label={title}
    >
      <div>
        {title ? (
          <h3 className="font-display text-[clamp(1.5rem,2.2vw,2rem)] font-semibold leading-tight text-ink">
            {title}
          </h3>
        ) : null}
        {subtitle ? (
          <p className="mt-1 font-mono text-[0.78rem] tracking-[0.04em] text-ink-faint">{subtitle}</p>
        ) : null}
        <div className="fs-body mt-2 text-ink">{children}</div>
      </div>
    </section>
  )
}
