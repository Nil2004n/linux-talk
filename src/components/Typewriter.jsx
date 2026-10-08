import { useTypewriter } from '../hooks/useTypewriter'

/**
 * Declarative variant: `<Typewriter text="..." />` or with children render-prop
 * `{(t) => <span>{t}</span>}`. Renders a text node when no children are given.
 */
export default function Typewriter({
  text = '',
  speed = 42,
  startDelay = 0,
  enabled = true,
  cursor = true,
  caretClass = 'caret',
  as: Tag = 'span',
  className = '',
  children,
}) {
  const t = useTypewriter(text, { speed, startDelay, enabled, cursor })
  return (
    <Tag className={className}>
      {children ? children(t.text, t) : t.text}
      {cursor && t.caret ? (
        <span className={`ml-0.5 inline-block w-[0.55em] ${caretClass}`} aria-hidden="true">
          ▊
        </span>
      ) : null}
    </Tag>
  )
}
