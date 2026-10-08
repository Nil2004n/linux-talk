import { useState } from 'react'
import PoisonPush from './PoisonPush'
import { playSound } from '../lib/sound'

/**
 * Poisonous-versus-healthy push duel.
 *
 * `PoisonPush` already replays both pipelines in sync. This wrapper adds the
 * requested Swap control so the presenter can put either outcome on either
 * side without editing scene content.
 */
export default function PushDuel({ poisonous = {}, healthy = {}, replayLabel, reduced = false }) {
  const [swapped, setSwapped] = useState(false)
  const left = swapped ? healthy : poisonous
  const right = swapped ? poisonous : healthy
  const leftTone = swapped ? 'good' : 'bad'
  const rightTone = swapped ? 'bad' : 'good'

  return (
    <div className="flex min-h-0 flex-col gap-2">
      <div className="flex justify-end">
        <button
          type="button"
          onClick={() => {
            playSound('key')
            setSwapped((s) => !s)
          }}
          aria-pressed={swapped}
          className="rounded-md border border-line bg-abyss px-3 py-1.5 font-mono text-[0.78rem] tracking-[0.04em] text-ink-dim transition-colors hover:text-ink"
        >
          {swapped ? 'Sides swapped' : 'Swap sides'}
        </button>
      </div>
      <PoisonPush
        poisonous={{ ...left, tone: leftTone }}
        healthy={{ ...right, tone: rightTone }}
        replayLabel={replayLabel}
        reduced={reduced}
      />
    </div>
  )
}
