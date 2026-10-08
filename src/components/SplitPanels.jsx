import { useState } from 'react'
import { motion } from 'framer-motion'
import { PALETTE } from '../lib/constants'

/**
 * Two-column layout used for the "poisons vs healthy commands" style slides.
 * Each panel gets its own semantic tone and keeps its own heading.
 */
export default function SplitPanels({ panels = [], reduced = false, cols = 2 }) {
  const [openKey, setOpenKey] = useState(panels[0]?.key ?? null)

  return (
    <div
      className={`grid min-h-0 gap-4 ${cols === 3 ? 'sm:grid-cols-3' : 'sm:grid-cols-2'}`}
    >
      {panels.map((panel, i) => {
        const color =
          panel.tone === 'good' || panel.tone === 'healthy'
            ? PALETTE.green
            : panel.tone === 'bad' || panel.tone === 'poison'
              ? PALETTE.red
              : panel.tone === 'warn'
                ? PALETTE.amber
                : PALETTE.cyan
        const open = openKey === panel.key
        const expandable = Boolean(panel.reveal)

        return (
          <motion.section
            key={panel.key ?? panel.title}
            className="pad-card relative flex min-w-0 flex-col gap-1.5 overflow-hidden rounded-md border border-line bg-abyss"
            initial={reduced ? false : { opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ duration: reduced ? 0 : 0.25, delay: reduced ? 0 : Math.min(0.12, i * 0.06) }}
          >
            <span
              aria-hidden="true"
              className="pointer-events-none absolute inset-y-0 left-0 w-[3px]"
              style={{ background: color }}
            />
            <div className="pl-2">
              <h3 className="font-display text-[clamp(1.15rem,1.7vw,1.6rem)] font-semibold leading-tight text-ink">
                {panel.title}
              </h3>
              {panel.subtitle ? (
                <p className="fs-caption mt-0.5 font-mono text-ink-faint">{panel.subtitle}</p>
              ) : null}
            </div>

            {panel.commands?.map((c) => (
              <div key={c.cmd}>
                <code className="flex items-baseline gap-2 font-mono text-[clamp(1rem,1.3vw,1.25rem)] text-ink">
                  <span className="text-ink-faint">$ </span>
                  {c.cmd}
                </code>
                {c.note ? (
                  <p className="mt-0.5 pl-4 text-[clamp(0.9rem,1.1vw,1.05rem)] text-ink-dim">
                    {c.note}
                  </p>
                ) : null}
                {c.danger ? (
                  <p className="mt-0.5 pl-4 text-[clamp(0.9rem,1.1vw,1.05rem)] font-semibold text-red">
                    {c.danger}
                  </p>
                ) : null}
              </div>
            ))}

            {expandable ? (
              <>
                <button
                  type="button"
                  onClick={() => setOpenKey(open ? null : panel.key)}
                  aria-expanded={open}
                  className="mt-auto self-start rounded-md border border-line px-2.5 py-1 font-mono text-[0.85rem] tracking-[0.04em] text-ink-dim transition-colors hover:text-ink"
                >
                  {open ? 'hide' : panel.revealLabel ?? 'show'}
                </button>
                {open ? (
                  <motion.p
                    className="rounded-md bg-abyss/60 px-3 py-2 text-[clamp(0.9rem,1.1vw,1.05rem)] leading-snug text-ink-dim"
                    initial={reduced ? false : { opacity: 0, height: 0 }}
                    animate={{ opacity: 1, height: 'auto' }}
                    transition={{ duration: reduced ? 0 : 0.24 }}
                  >
                    {panel.reveal}
                  </motion.p>
                ) : null}
              </>
            ) : null}
          </motion.section>
        )
      })}
    </div>
  )
}
