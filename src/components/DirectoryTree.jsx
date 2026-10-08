import { useState } from 'react'
import { motion } from 'framer-motion'

/**
 * Quiet expandable filesystem tree. Labels sit directly on the row in
 * primary text with muted notes; directories use a real button so expansion
 * works with click, Enter and Space.
 */
export default function DirectoryTree({ nodes = [], reduced = false, defaultOpen = 1 }) {
  return (
    <ul className="flex flex-col gap-0.5 font-mono text-[clamp(1.1rem,1.5vw,1.45rem)] leading-relaxed">
      {nodes.map((node, i) => (
        <TreeNode key={node.label} node={node} depth={0} reduced={reduced} index={i} defaultOpen={defaultOpen} />
      ))}
    </ul>
  )
}

function TreeNode({ node, depth, reduced, index, defaultOpen }) {
  const isFile = node.type === 'file' || (!node.children?.length && node.type !== 'dir')
  const hasChildren = !isFile && node.children?.length > 0
  const [open, setOpen] = useState(() => (reduced ? true : depth < defaultOpen || Boolean(node.open)))

  const pad = { paddingLeft: `${depth * 1.35}rem` }

  const row = (
    <>
      {hasChildren ? (
        <span aria-hidden="true" className="inline-block w-[0.7em] text-center text-ink-faint">
          {open ? '–' : '+'}
        </span>
      ) : (
        <span aria-hidden="true" className="inline-block w-[0.7em] text-center text-ink-faint">
          ·
        </span>
      )}
      <span aria-hidden="true" className="text-ink-faint">
        {isFile ? <FileIcon /> : <FolderIcon open={hasChildren && open} />}
      </span>
    </>
  )

  return (
    <li>
      <div className="flex items-start gap-2">
        <motion.div
          className="flex min-w-0 flex-wrap items-baseline gap-x-2 border-b border-line py-0.5"
          style={pad}
          initial={reduced ? false : { opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ duration: reduced ? 0 : 0.2, delay: reduced ? 0 : Math.min(0.12, index * 0.06) }}
        >
          {hasChildren ? (
            <button
              type="button"
              onClick={() => setOpen((o) => !o)}
              aria-expanded={open}
              aria-label={`${open ? 'Collapse' : 'Expand'} ${node.label}`}
              className="flex items-center gap-2 rounded text-left text-ink transition-colors hover:text-ink"
            >
              {row}
              <span className="font-medium">{node.label}</span>
            </button>
          ) : (
            <span className="flex items-center gap-2">
              {row}
              <span className="font-medium text-ink">{node.label}</span>
            </span>
          )}
          {node.note ? (
            <span className="text-[0.82em] text-ink-dim">{node.note}</span>
          ) : null}
        </motion.div>
      </div>

      {hasChildren && open ? (
        <motion.ul
          className="flex flex-col gap-0.5"
          initial={reduced ? false : { opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ duration: reduced ? 0 : 0.2, ease: [0.2, 0, 0, 1] }}
        >
          {node.children.map((child, ci) => (
            <TreeNode
              key={child.label}
              node={child}
              depth={depth + 1}
              reduced={reduced}
              index={ci}
              defaultOpen={defaultOpen}
            />
          ))}
        </motion.ul>
      ) : null}
    </li>
  )
}

function FolderIcon({ open = false }) {
  return (
    <svg width="18" height="18" viewBox="0 0 18 18" fill="none" aria-hidden="true">
      <path
        d="M1.5 4.5c0-.8.7-1.5 1.5-1.5h3l1.5 1.8H14.5c.8 0 1.5.7 1.5 1.5v6c0 .8-.7 1.5-1.5 1.5H3c-.8 0-1.5-.7-1.5-1.5v-7.8z"
        stroke="currentColor"
        strokeWidth="1.5"
      />
      {open ? <path d="M4 8.5h10" stroke="currentColor" strokeWidth="1.5" /> : null}
    </svg>
  )
}

function FileIcon() {
  return (
    <svg width="15" height="18" viewBox="0 0 15 18" fill="none" aria-hidden="true">
      <path
        d="M2.5 1.5h6.5L12.5 5v11.5h-10V1.5z"
        stroke="currentColor"
        strokeWidth="1.5"
        strokeLinejoin="round"
      />
      <path d="M9 1.5V5h3.5" stroke="currentColor" strokeWidth="1.5" strokeLinejoin="round" />
      <path d="M5 9.5h5M5 12h5" stroke="currentColor" strokeWidth="1.2" strokeLinecap="round" />
    </svg>
  )
}
