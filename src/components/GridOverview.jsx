import { useCallback, useMemo, useState } from 'react'
import { motion } from 'framer-motion'
import { PARTS, PART_ORDER } from '../lib/constants'

/**
 * Full-screen grid overview of every slide (press G).
 *
 * Cards are virtual-free but cheap: one small title + badge per slide, no body
 * content. Keyboard: arrows move the selection, Enter jumps, Esc closes.
 */
export default function GridOverview({ scenes = [], activeIndex = 0, onSelect, onClose, reduced = false }) {
  // Selection tracks the active scene only while the user has not moved it:
  // the hover/arrow position wins, so no effect needs to push state back down.
  const [override, setOverride] = useState(null)
  const [query, setQuery] = useState('')
  const [partFilter, setPartFilter] = useState('all')
  const selected = override ?? activeIndex
  const select = useCallback((i) => setOverride(i), [])

  const filtered = useMemo(() => {
    const needle = query.trim().toLowerCase()
    return scenes
      .map((scene, index) => ({ scene, index }))
      .filter(({ scene }) => {
        if (partFilter !== 'all' && scene.part !== partFilter) return false
        if (!needle) return true
        return `${scene.title ?? ''} ${scene.id} ${scene.command ?? ''}`.toLowerCase().includes(needle)
      })
  }, [scenes, query, partFilter])

  const grouped = useMemo(() => {
    const map = new Map()
    filtered.forEach(({ scene, index }) => {
      if (!map.has(scene.part)) map.set(scene.part, [])
      map.get(scene.part).push({ scene, index })
    })
    return PART_ORDER.filter((p) => map.has(p)).map((p) => ({ part: p, items: map.get(p) }))
  }, [filtered])

  const flatIndexes = useMemo(() => filtered.map(({ index }) => index), [filtered])

  // A filter change can hide the selected scene. Fall back to the active
  // scene when it is still visible, otherwise to the first visible scene, so
  // Enter never jumps somewhere the presenter cannot see.
  const visibleSelected = flatIndexes.includes(selected)
    ? selected
    : (flatIndexes.includes(activeIndex) ? activeIndex : (flatIndexes[0] ?? activeIndex))

  const onKeyDown = useCallback(
    (e) => {
      // Let the search field handle its own arrow keys and Enter.
      if (e.target?.tagName === 'INPUT') return
      const position = flatIndexes.indexOf(visibleSelected)
      if (e.key === 'ArrowRight' || e.key === 'ArrowDown') {
        e.preventDefault()
        const next = flatIndexes[Math.min(flatIndexes.length - 1, position + 1)] ?? activeIndex
        setOverride(next)
      } else if (e.key === 'ArrowLeft' || e.key === 'ArrowUp') {
        e.preventDefault()
        const previous = flatIndexes[Math.max(0, position - 1)] ?? activeIndex
        setOverride(previous)
      } else if (e.key === 'Enter') {
        e.preventDefault()
        onSelect(visibleSelected)
      }
    },
    [flatIndexes, visibleSelected, activeIndex, onSelect],
  )

  return (
    <motion.div
      className="fixed inset-0 z-[60] bg-abyss"
      initial={reduced ? false : { opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      transition={{ duration: reduced ? 0 : 0.18 }}
      role="dialog"
      aria-modal="true"
      aria-label="All scenes"
      onKeyDown={onKeyDown}
      tabIndex={-1}
      ref={(el) => el?.focus()}
    >
      <header className="flex items-center justify-between gap-4 border-b border-line px-5 py-3">
        <h2 className="font-display text-[clamp(1rem,1.4vw,1.35rem)] font-semibold text-ink">
          All scenes
          <span className="ml-2 font-mono text-[0.8rem] text-ink-faint">
            {scenes.length} total · arrows to move · enter to jump · esc to close
          </span>
        </h2>
        <button
          type="button"
          onClick={onClose}
          className="rounded-md border border-line px-3 py-1.5 font-mono text-[0.85rem] tracking-[0.04em] text-ink-dim transition-colors hover:text-ink"
        >
          Close
        </button>
      </header>

      <div className="flex flex-wrap items-center gap-2 border-b border-line px-5 py-3">
        <label className="sr-only" htmlFor="scene-search">
          Search scenes
        </label>
        <input
          id="scene-search"
          type="search"
          value={query}
          onChange={(e) => setQuery(e.target.value)}
          placeholder="Search title, id or command"
          className="w-64 max-w-full rounded-md border border-line bg-abyss px-3 py-1.5 font-mono text-[0.85rem] text-ink placeholder:text-ink-faint"
        />
        <div className="flex flex-wrap items-center gap-1" role="group" aria-label="Filter by part">
          {['all', ...PART_ORDER].map((part) => (
            <button
              key={part}
              type="button"
              onClick={() => setPartFilter(part)}
              aria-pressed={partFilter === part}
              className={`rounded-md border px-2.5 py-1 font-mono text-[0.72rem] tracking-[0.04em] ${
                partFilter === part
                  ? 'border-cyan bg-abyss font-medium text-ink'
                  : 'border-line text-ink-dim hover:text-ink'
              }`}
            >
              {part}
            </button>
          ))}
        </div>
        <span className="font-mono text-[0.75rem] text-ink-faint" aria-live="polite">
          {filtered.length} of {scenes.length} shown
        </span>
      </div>

      <div className="h-[calc(100dvh-7rem)] overflow-y-auto px-5 py-4">
        {grouped.length === 0 ? (
          <p className="font-mono text-[0.9rem] text-ink-dim">
            No scenes match this filter. Clear the search or choose another part.
          </p>
        ) : null}
        {grouped.map(({ part, items }) => (
          <section key={part} className="mb-5">
            <h3 className="mb-2 flex items-baseline gap-2 font-mono text-[0.8rem] tracking-[0.04em] text-ink">
              <span aria-hidden="true" className="font-medium">
                {PARTS[part]?.letter === '•' ? '•' : PARTS[part]?.letter ?? part}
              </span>
              {PARTS[part]?.name ?? part}
              <span className="tabular-nums text-ink-faint">{items.length}</span>
            </h3>

            <ul className="grid grid-cols-2 gap-2 sm:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5">
              {items.map(({ scene, index }) => {
                const isActive = index === activeIndex
                const isSelected = index === visibleSelected
                return (
                  <li key={scene.id}>
                    <button
                      type="button"
                      onClick={() => onSelect(index)}
                      onMouseEnter={() => select(index)}
                      aria-current={isActive ? 'true' : undefined}
                      className={`flex h-full w-full flex-col items-start gap-1.5 rounded-md border bg-abyss p-2.5 text-left transition-colors duration-200 ${
                        isSelected ? 'border-cyan' : isActive ? 'border-ink-faint' : 'border-line'
                      }`}
                    >
                      <span className="flex w-full items-center justify-between gap-2">
                        <span className="font-mono text-[0.7rem] tracking-[0.04em] text-ink-faint">
                          {scene.badge}
                        </span>
                        <span className="font-mono text-[0.7rem] tabular-nums text-ink-faint">
                          {String(index + 1).padStart(2, '0')}
                        </span>
                      </span>
                      <span className="line-clamp-3 text-[0.95rem] leading-snug text-ink">
                        {scene.title ?? scene.id}
                      </span>
                      {scene.command ? (
                        <code className="mt-auto truncate font-mono text-[0.72rem] text-ink-faint">
                          {scene.command}
                        </code>
                      ) : null}
                    </button>
                  </li>
                )
              })}
            </ul>
          </section>
        ))}
      </div>
    </motion.div>
  )
}
