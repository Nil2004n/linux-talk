import PartHeader from '../components/PartHeader'
import Blocks from './Blocks'

import { PARTS } from '../lib/constants'

const asArray = (x) => (Array.isArray(x) ? x : [x])

/**
 * Splits a slide body into columns.
 *
 * A body may be written either as explicit groups (an array of arrays) or as a
 * flat block list. For a flat list, `cols` decides how to split it: a two-up
 * layout pairs the first half with the second half, which keeps a terminal
 * transcript beside its callout instead of stacking them into a tall slide.
 */
function groupBody(body, cols) {
  const blocks = asArray(body)
  if (blocks.some(Array.isArray)) return blocks.map(asArray)
  if (cols === 2 || cols === 'split') {
    const half = Math.ceil(blocks.length / 2)
    return [blocks.slice(0, half), blocks.slice(half)]
  }
  return [blocks]
}

/** Flatten explicit body groups without changing their relative order. */
function flattenBody(body) {
  return asArray(body).flatMap((group) => (Array.isArray(group) ? group : [group]))
}

/**
 * One keyboard step reveals one top-level block. Part cards reveal one agenda
 * item per step. Titles and leads stay visible so every scene keeps context.
 *
 * Scenes may use either the full declarative `body` model or the two shortcut
 * fields documented in `src/content/scenes.js`: `bullets` becomes one bullets
 * block and `terminalScript` becomes one scripted terminal block.
 */
/**
 * Adjacent keychip blocks read as one row, so they fold into a single step.
 * Content is untouched; only the reveal grouping changes.
 */
function foldKeychips(blocks) {
  const out = []
  for (const block of blocks) {
    const prev = out[out.length - 1]
    if (block?.type === 'keychip' && prev?.type === 'keychips') {
      prev.items.push(block)
    } else if (block?.type === 'keychip') {
      out.push({ type: 'keychips', items: [block] })
    } else {
      out.push(block)
    }
  }
  return out
}

export function getSlideBlocks(slide, visibleSteps = Infinity) {
  if (!slide || slide.kind !== 'blocks') return []
  const blocks = foldKeychips(flattenBody(slide.body))
  if (Array.isArray(slide.bullets) && slide.bullets.length) {
    blocks.push({ type: 'bullets', items: slide.bullets })
  }
  if (Array.isArray(slide.terminalScript) && slide.terminalScript.length) {
    blocks.push({
      type: 'terminal',
      title: slide.terminalTitle ?? 'scripted terminal',
      steps: slide.terminalScript.map((step) => ({
        cmd: step.command ?? step.cmd ?? '',
        out: step.output ?? step.out ?? '',
        tone: step.tone ?? 'dim',
      })),
    })
  }
  const folded = foldKeychips(blocks)
  if (!Number.isFinite(visibleSteps)) return folded
  return folded.slice(0, Math.max(1, visibleSteps))
}

export function countSlideSteps(slide) {
  if (!slide) return 1
  if (slide.kind === 'part') return Math.max(1, slide.agenda?.length ?? 0)
  return Math.max(1, getSlideBlocks(slide).length)
}

function visibleAgenda(agenda, visibleSteps) {
  if (!Array.isArray(agenda)) return agenda
  if (!Number.isFinite(visibleSteps)) return agenda
  return agenda.slice(0, Math.max(1, visibleSteps))
}

/**
 * Maps a slide descriptor to its renderer.
 * `kind` lives in the content file, so new layouts never need App changes.
 *   kind: 'part'   -> full-screen Part transition card
 *   kind: 'blocks' -> declarative block list (the workhorse)
 */
export function renderSlideBody(slide, ctx) {
  if (!slide) return null
  switch (slide.kind) {
    case 'part':
      return (
        <PartHeader
          letter={PARTS[slide.part]?.letter ?? slide.letter ?? 'A'}
          name={slide.title}
          agenda={visibleAgenda(slide.agenda, ctx.visibleSteps)}
          totalAgenda={slide.agenda?.length ?? 0}
          reduced={ctx.reduced}
        />
      )
    case 'blocks': {
      const groups = groupBody(getSlideBlocks(slide, ctx.visibleSteps), slide.cols)
      const twoUp = slide.cols === 2 || slide.cols === 'split'
      return (
        <div
          className={`grid min-h-0 items-start ${twoUp ? 'lg:grid-cols-2' : ''}`}
          style={{ gap: 'var(--gap-slide)' }}
        >
          {groups.map((group, gi) => (
            <div
              key={gi}
              className="flex min-w-0 flex-col"
              style={{ gap: 'var(--gap-slide)' }}
            >
              <Blocks blocks={group} reduced={ctx.reduced} />
            </div>
          ))}
        </div>
      )
    }
    default:
      return (
        <p className="font-mono text-ink-dim">
          placeholder body for <span className="text-cyan">{slide.id}</span>
        </p>
      )
  }
}
