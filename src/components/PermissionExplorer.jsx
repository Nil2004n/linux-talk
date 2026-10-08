import { useMemo, useState } from 'react'
import { motion } from 'framer-motion'
import { PALETTE } from '../lib/constants'

const CLASSES = [
  { key: 'owner', label: 'owner', hint: 'the user who owns the file' },
  { key: 'group', label: 'group', hint: 'accounts in the file group' },
  { key: 'others', label: 'others', hint: 'everyone else' },
]
const BITS = [
  { key: 'read', label: 'r', name: 'read' },
  { key: 'write', label: 'w', name: 'write' },
  { key: 'execute', label: 'x', name: 'execute' },
]

function toMode(bits) {
  const value = (entry) => (entry.read ? 4 : 0) + (entry.write ? 2 : 0) + (entry.execute ? 1 : 0)
  return `${value(bits.owner)}${value(bits.group)}${value(bits.others)}`
}

function toSymbolic(bits) {
  const text = (entry) => `${entry.read ? 'r' : '-'}${entry.write ? 'w' : '-'}${entry.execute ? 'x' : '-'}`
  return `-${text(bits.owner)}${text(bits.group)}${text(bits.others)}`
}

/**
 * Interactive permission explorer.
 *
 * Toggling r, w and x updates both the symbolic `ls -l` string and the numeric
 * chmod mode. World-writable files trigger the unsafe-habit warning.
 */
export default function PermissionExplorer({
  filename = 'deploy.sh',
  initial = { owner: { read: true, write: true, execute: true }, group: { read: true, write: false, execute: true }, others: { read: true, write: false, execute: true } },
  reduced = false,
}) {
  const [bits, setBits] = useState(initial)
  const mode = useMemo(() => toMode(bits), [bits])
  const symbolic = useMemo(() => toSymbolic(bits), [bits])
  const worldWritable = bits.others.write
  const executableByEveryone = bits.owner.execute && bits.group.execute && bits.others.execute

  const toggle = (cls, bit) => {
    setBits((old) => ({ ...old, [cls]: { ...old[cls], [bit]: !old[cls][bit] } }))
  }

  return (
    <div className="rounded-md border border-line bg-abyss p-4">
      <div className="flex flex-wrap items-center justify-between gap-3">
        <code className="font-mono text-[clamp(1rem,1.35vw,1.3rem)] font-bold text-ink">
          {symbolic} <span className="text-ink-faint">{filename}</span>
        </code>
        <code
          className="rounded-md border border-line bg-abyss px-3 py-1 font-mono text-[clamp(1rem,1.35vw,1.3rem)] font-medium"
          style={{ color: worldWritable ? PALETTE.red : PALETTE.ink }}
          aria-live="polite"
        >
          chmod {mode}
        </code>
      </div>

      <div className="mt-3 grid gap-2 sm:grid-cols-3">
        {CLASSES.map((cls, ci) => (
          <motion.fieldset
            key={cls.key}
            className="rounded-md border border-line bg-abyss p-2.5"
            initial={reduced ? false : { opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ duration: reduced ? 0 : 0.24, delay: reduced ? 0 : ci * 0.07 }}
          >
            <legend className="px-1 font-mono text-[0.72rem] tracking-[0.04em] text-ink-faint">
              {cls.label}
            </legend>
            <div className="flex gap-1.5" role="group" aria-label={`${cls.label} permissions`}>
              {BITS.map((bit) => {
                const on = bits[cls.key][bit.key]
                return (
                  <button
                    key={bit.key}
                    type="button"
                    aria-pressed={on}
                    aria-label={`${cls.label} ${bit.name} ${on ? 'on' : 'off'}`}
                    onClick={() => toggle(cls.key, bit.key)}
                    className="grid h-10 flex-1 place-items-center rounded-md border font-mono text-[1rem] transition-colors duration-200"
                    style={{
                      borderColor: on ? PALETTE.cyan : PALETTE.line,
                      background: 'transparent',
                      color: on ? PALETTE.cyan : PALETTE.inkFaint,
                    }}
                  >
                    {bit.label}
                  </button>
                )
              })}
            </div>
            <p className="mt-1 text-[0.82rem] text-ink-faint">{cls.hint}</p>
          </motion.fieldset>
        ))}
      </div>

      <p className="fs-caption mt-3 border-t border-line pt-2 text-ink-faint" aria-live="polite">
        {worldWritable
          ? `chmod ${mode} lets every account change this file. Prefer the smallest workable mode.`
          : executableByEveryone
            ? `chmod ${mode} is executable for everyone; keep that only for programs meant to run.`
            : `chmod ${mode} follows least privilege: each class gets only what it needs.`}
      </p>
    </div>
  )
}
