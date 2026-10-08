import { PARTS } from '../lib/constants'

/**
 * Part indicator: small mono text, bottom-centre. The current Part renders
 * in primary text, the rest muted. No pills, no animation.
 */
export default function PartIndicator({ part = 'intro', activeIndex = 0, total = 1 }) {
  const visibleParts = ['A', 'B', 'C', 'C2', 'D']
  const current = PARTS[part] ?? PARTS.intro

  return (
    <div className="pointer-events-none fixed inset-x-0 bottom-3 z-40 flex justify-center px-4 print:hidden">
      <nav
        aria-label="Talk parts"
        className="flex items-center gap-3 font-mono text-[0.8rem] tracking-[0.04em]"
      >
        {visibleParts.map((p) => {
          const isActive = p === part
          const info = PARTS[p]
          return (
            <span
              key={p}
              aria-current={isActive ? 'true' : undefined}
              className={isActive ? 'font-medium text-ink' : 'text-ink-faint'}
            >
              {info.letter}
              <span className="sr-only"> — {info.name}</span>
            </span>
          )
        })}
        <span className="sr-only">
          Current part {current.name}, scene {activeIndex + 1} of {total}
        </span>
      </nav>
    </div>
  )
}
