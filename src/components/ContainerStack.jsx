import { motion } from 'framer-motion'

const DEFAULT_LAYERS = [
  { id: 'image', label: 'base image', detail: 'frozen filesystem' },
  { id: 'app', label: 'app container', detail: 'repo plus dependencies' },
  { id: 'runner', label: 'CI runner', detail: 'thrown away after the job' },
]

/**
 * Animated stacked containers.
 * Layers land in sequence; only the status LEDs keep pulsing.
 */
export default function ContainerStack({ layers = DEFAULT_LAYERS, reduced = false }) {
  return (
    <div className="rounded-md border border-line bg-abyss p-4" role="img" aria-label="Stacked Linux containers">
      <div className="mx-auto flex w-full max-w-md flex-col gap-2">
        {layers.map((layer, i) => (
          <motion.div
            key={layer.id}
            className="flex items-center justify-between gap-3 rounded-md border border-line bg-abyss px-3 py-2"
            initial={reduced ? false : { opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ duration: reduced ? 0 : 0.2, delay: reduced ? 0 : Math.min(0.12, i * 0.06) }}
          >
            <div>
              <p className="font-mono text-[0.95rem] text-ink">
                {layer.label}
              </p>
              <p className="text-[0.85rem] text-ink-dim">{layer.detail}</p>
            </div>
            <span aria-hidden="true" className="h-2 w-2 rounded-full bg-ink-faint" />
          </motion.div>
        ))}
      </div>
    </div>
  )
}
