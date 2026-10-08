import { useEffect, useMemo, useState } from 'react'
import { useMotionPrefs } from '../hooks/useMotionPrefs'
import { useSceneVisible } from '../hooks/useSceneVisible'

const GLYPHS = '▓▒░<>/\\|=+*#@$%&01'

/**
 * Heading text-decode effect.
 *
 * Characters resolve left to right inside ~600ms; unrevealed positions show
 * deterministic scramble glyphs. Reduced motion and calm mode render the
 * finished string immediately. Screen readers get the plain text once.
 */
export default function DecodeText({ text = '', as: Tag = 'span', className = '', id }) {
  const { reduced } = useMotionPrefs()
  const visible = useSceneVisible()
  const chars = useMemo(() => Array.from(text), [text])
  const [revealed, setRevealed] = useState(reduced ? chars.length : 0)

  useEffect(() => {
    if (!visible) return undefined
    if (reduced) {
      setRevealed(chars.length)
      return undefined
    }
    setRevealed(0)
    if (chars.length === 0) return undefined
    const total = Math.min(24, Math.max(8, chars.length))
    let frame = 0
    const id = window.setInterval(() => {
      frame += 1
      setRevealed(Math.ceil((frame / total) * chars.length))
      if (frame >= total) window.clearInterval(id)
    }, 25)
    return () => window.clearInterval(id)
  }, [chars, reduced, visible])

  return (
    <Tag className={className} id={id} aria-label={text}>
      <span className="sr-only">{text}</span>
      <span aria-hidden="true">
        {chars.map((char, i) => {
          if (char === ' ') return <span key={i}> </span>
          if (i < revealed) return <span key={i}>{char}</span>
          return (
            <span key={i} className="text-cyan/70">
              {GLYPHS[(i * 7 + revealed * 3) % GLYPHS.length]}
            </span>
          )
        })}
      </span>
    </Tag>
  )
}
