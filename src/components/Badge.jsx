import { BADGES } from '../lib/constants'

/**
 * Badge label. Every scene carries exactly one: LIVE / SLIDE / TAKE-HOME.
 * Flat hairline label, semantic text colour, no pulse, no glow.
 */
export default function Badge({ kind = 'SLIDE', size = 'md', className = '' }) {
  const meta = BADGES[kind] ?? BADGES.SLIDE
  const dims =
    size === 'sm'
      ? 'px-2 py-0.5 text-[0.6rem]'
      : size === 'lg'
        ? 'px-4 py-1.5 text-[0.85rem]'
        : 'px-3 py-1 text-[0.7rem]'

  return (
    <span
      className={`inline-flex items-center rounded-md border border-line bg-abyss font-mono tracking-[0.04em] ${dims} ${className}`}
      style={{ color: meta.fg }}
      title={meta.hint}
    >
      {meta.label}
    </span>
  )
}
