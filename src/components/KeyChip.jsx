/**
 * Keyboard shortcut chip rendered as a real `<kbd>` element.
 */
export default function KeyChip({ children, label }) {
  return (
    <kbd
      aria-label={label ?? (typeof children === 'string' ? `keyboard key ${children}` : 'keyboard key')}
      className="inline-flex min-w-[2.25rem] items-center justify-center rounded-md border border-line bg-abyss px-2 py-1 font-mono text-[clamp(0.9rem,1.1vw,1.05rem)] font-medium text-ink"
    >
      {children}
    </kbd>
  )
}
