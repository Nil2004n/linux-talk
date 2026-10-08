import { useMemo } from 'react'

/**
 * A 2px hairline progress line in the accent colour, fixed to the very top.
 * Width follows the active scene; per-part widths keep every scene equal.
 */
export default function ProgressBar({ scenes = [], activeIndex = 0, reduced = false }) {
  const width = useMemo(() => {
    const total = Math.max(scenes.length, 1)
    const frac = total > 1 ? activeIndex / (total - 1) : 1
    return Math.max(2, Math.min(100, frac * 100))
  }, [scenes.length, activeIndex])

  return (
    <div
      className="fixed inset-x-0 top-0 z-40 h-[2px] bg-transparent print:hidden"
      role="progressbar"
      aria-label={`Talk progress, scene ${activeIndex + 1} of ${scenes.length}`}
      aria-valuemin={0}
      aria-valuemax={100}
      aria-valuenow={Math.round(width)}
    >
      <div
        className="h-full origin-left bg-cyan"
        style={{
          transform: `scaleX(${width / 100})`,
          transition: reduced ? 'none' : 'transform 0.25s cubic-bezier(0.2, 0, 0, 1)',
        }}
      />
    </div>
  )
}
