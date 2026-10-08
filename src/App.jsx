import { Suspense, lazy, useCallback, useEffect, useMemo, useState } from 'react'
import { AnimatePresence, motion, useReducedMotion } from 'framer-motion'
import { scenes, partIndex, deckMeta } from './content/scenes'
import { PARTS } from './lib/constants'
import { MotionProvider } from './hooks/useMotionPrefs'
import { playSound, setSoundEnabled } from './lib/sound'
import {
  useDeckHotkeys,
  useFullscreen,
  usePresentationMode,
  useSlideNavigation,
  useToggle,
} from './hooks/useSlideNavigation'

import ProgressBar from './components/ProgressBar'
import PartIndicator from './components/PartIndicator'
import CommandChip from './components/CommandChip'
import Slide from './components/Slide'
import Badge from './components/Badge'
import { countSlideSteps, renderSlideBody } from './slides/renderSlide'

// The grid overview is only needed on demand, so it is split out of the main
// bundle and loaded the first time the presenter presses G.
// The grid overview is only needed when the presenter presses G, so it lives in
// its own chunk. The notes panel is small and imported eagerly so P never waits.
const GridOverview = lazy(() => import('./components/GridOverview'))
import PresenterPanel, { ShortcutHelp } from './components/PresenterPanel'

export default function App() {
  const osReduced = !!useReducedMotion()
  const total = scenes.length
  const { mode, toggleMode } = usePresentationMode()

  const [calm, toggleCalm] = useToggle(false, 'deck.calm')
  const [soundOn, toggleSound] = useToggle(false, 'deck.sound')
  const [theme, setTheme] = useState(() => {
    if (typeof window === 'undefined') return 'paper'
    try {
      return window.localStorage.getItem('deck.theme') || 'paper'
    } catch {
      return 'paper'
    }
  })

  useEffect(() => {
    document.documentElement.dataset.theme = theme
    try {
      window.localStorage.setItem('deck.theme', theme)
    } catch {
      // Locked-down kiosk storage should never break the deck.
    }
  }, [theme])

  const toggleTheme = useCallback(() => {
    playSound('key')
    setTheme((t) => (t === 'paper' ? 'ink' : 'paper'))
  }, [])
  // Calm mode joins OS reduced motion as the single deck-wide stillness flag.
  const still = osReduced || calm

  useEffect(() => {
    setSoundEnabled(soundOn)
  }, [soundOn])

  useEffect(() => {
    // Calm mode forces zero motion: MotionProvider zeroes JS durations and
    // this attribute kills the remaining CSS-driven animation (caret blink).
    if (calm) document.documentElement.dataset.calm = 'true'
    else delete document.documentElement.dataset.calm
  }, [calm])

  const { railRef, registerSlide, activeIndex, goTo } =
    useSlideNavigation(total, { reduced: still, mode })

  const [gridOpen, toggleGrid] = useToggle(false, 'deck.grid')
  const [presenter, togglePresenter] = useToggle(false, 'deck.presenter')
  const [helpOpen, toggleHelp] = useToggle(false, 'deck.help')
  const [stepMap, setStepMap] = useState({})
  const [replayToken, setReplayToken] = useState(0)
  // Last-known pixel height of each fully-rendered section. Far sections in
  // scroll mode render a fixed placeholder; reserving the measured height
  // keeps the scrollbar stable instead of shifting as bodies mount.
  const [heights, setHeights] = useState({})

  useEffect(() => {
    const rail = railRef.current
    if (!rail) return undefined
    const ro = new ResizeObserver((entries) => {
      setHeights((prev) => {
        let changed = false
        const next = { ...prev }
        for (const entry of entries) {
          const i = Number(entry.target.dataset.slideIndex)
          if (!Number.isInteger(i)) continue
          // Never memorize placeholder height — only real bodies count.
          if (entry.target.querySelector('[data-body-placeholder]')) continue
          const h = Math.round(entry.contentRect.height)
          if (Math.abs((next[i] ?? 0) - h) > 2) {
            next[i] = h
            changed = true
          }
        }
        return changed ? next : prev
      })
    })
    const els = []
    rail.querySelectorAll('[data-slide-index]').forEach((el) => {
      els.push(el)
      ro.observe(el)
    })
    return () => ro.disconnect()
  }, [total, mode])

  const { isFullscreen, toggle: toggleFullscreen } = useFullscreen()

  const active = scenes[activeIndex] ?? scenes[0]
  const maxSteps = countSlideSteps(active)
  const stepIndex = Math.max(0, Math.min(stepMap[activeIndex] ?? 0, maxSteps - 1))

  const goToStep = useCallback(
    (index, step) => {
      const clamped = Math.min(scenes.length - 1, Math.max(0, index))
      setStepMap((prev) => ({ ...prev, [clamped]: Math.max(0, step) }))
      goTo(clamped)
    },
    [goTo, scenes.length],
  )

  const stepNext = useCallback(() => {
    if (gridOpen || helpOpen) return
    if (stepIndex < maxSteps - 1) {
      playSound('key')
      setStepMap((prev) => ({ ...prev, [activeIndex]: stepIndex + 1 }))
    } else if (activeIndex < total - 1) {
      playSound('key')
      goToStep(activeIndex + 1, 0)
    }
  }, [gridOpen, helpOpen, stepIndex, maxSteps, activeIndex, total, goToStep])

  const stepPrev = useCallback(() => {
    if (gridOpen || helpOpen) return
    if (stepIndex > 0) {
      playSound('key')
      setStepMap((prev) => ({ ...prev, [activeIndex]: stepIndex - 1 }))
    } else if (activeIndex > 0) {
      playSound('key')
      const target = activeIndex - 1
      goToStep(target, countSlideSteps(scenes[target]) - 1)
    }
  }, [gridOpen, helpOpen, stepIndex, activeIndex, goToStep])

  const goFirst = useCallback(() => goToStep(0, 0), [goToStep])
  const goLast = useCallback(() => {
    const target = total - 1
    goToStep(target, countSlideSteps(scenes[target]) - 1)
  }, [goToStep, total])

  const goPart = useCallback(
    (key) => {
      // Number keys address Parts A, B, C, C2 and D directly.
      const part = ['A', 'B', 'C', 'C2', 'D'][Number(key) - 1]
      if (part != null && partIndex[part] != null) goToStep(partIndex[part], 0)
    },
    [goToStep],
  )

  const replay = useCallback(() => {
    playSound('key')
    setStepMap((prev) => ({ ...prev, [activeIndex]: 0 }))
    setReplayToken((n) => n + 1)
  }, [activeIndex])

  const closeOverlays = useCallback(() => {
    if (gridOpen) toggleGrid()
    if (helpOpen) toggleHelp()
    if (presenter) togglePresenter()
  }, [gridOpen, toggleGrid, helpOpen, toggleHelp, presenter, togglePresenter])

  useDeckHotkeys({
    next: stepNext,
    prev: stepPrev,
    first: goFirst,
    last: goLast,
    goPart,
    toggleMode: () => {
      playSound('key')
      toggleMode()
    },
    toggleTheme,
    replay,
    toggleGrid: () => {
      if (helpOpen) {
        toggleHelp()
        return
      }
      if (gridOpen) goTo(activeIndex)
      toggleGrid()
    },
    toggleFullscreen,
    togglePresenter,
    escape: closeOverlays,
    toggleHelp: () => {
      if (helpOpen) {
        toggleHelp()
        return
      }
      toggleHelp()
    },
  })

  const selectSlide = useCallback(
    (index) => {
      goToStep(index, 0)
      if (gridOpen) toggleGrid()
    },
    [goToStep, gridOpen, toggleGrid],
  )

  const footerHints = useMemo(
    () => (helpOpen ? null : '↓ next · M mode · R replay · G grid · F fullscreen · P notes'),
    [helpOpen],
  )

  return (
    <MotionProvider reduced={still}>
      <a
        href="#slide-1"
        className="sr-only focus:not-sr-only focus:fixed focus:left-4 focus:top-4 focus:z-[70] focus:rounded-lg focus:bg-panel focus:px-4 focus:py-2 focus:text-cyan"
      >
        Skip to first slide
      </a>

      <ProgressBar scenes={scenes} activeIndex={activeIndex} reduced={still} />
      <PartIndicator part={active?.part} activeIndex={activeIndex} total={total} reduced={still} />
      <div className="fixed right-4 top-8 z-40 flex max-w-[calc(100vw-2rem)] flex-wrap items-center justify-end gap-1.5 print:hidden" role="group" aria-label="Display controls">
        <button
          type="button"
          onClick={() => {
            playSound('key')
            toggleMode()
          }}
          aria-pressed={mode === 'scroll'}
          aria-keyshortcuts="m"
          title="Toggle slide or scroll mode (M)"
          className="rounded-md border border-line bg-abyss px-3 py-1.5 font-mono text-[0.7rem] tracking-[0.04em] text-ink-dim transition-colors hover:text-ink"
        >
          {mode === 'slide' ? 'Slide · M' : 'Scroll · M'}
        </button>
        <button
          type="button"
          onClick={toggleCalm}
          aria-pressed={calm}
          title="Calm mode: disable background effects and heavy animation"
          className={`rounded-md border border-line bg-abyss px-3 py-1.5 font-mono text-[0.7rem] tracking-[0.04em] transition-colors hover:text-ink ${
            calm ? 'text-ink' : 'text-ink-dim'
          }`}
        >
          {calm ? 'Calm on' : 'Calm'}
        </button>
        <button
          type="button"
          onClick={toggleSound}
          aria-pressed={soundOn}
          title="Sound: subtle key clicks and success/fail tones (off by default)"
          className={`rounded-md border border-line bg-abyss px-3 py-1.5 font-mono text-[0.7rem] tracking-[0.04em] transition-colors hover:text-ink ${
            soundOn ? 'text-ink' : 'text-ink-dim'
          }`}
        >
          {soundOn ? 'Sound on' : 'Sound'}
        </button>
        <button
          type="button"
          onClick={toggleTheme}
          aria-pressed={theme === 'ink'}
          aria-keyshortcuts="t"
          title="Toggle paper / ink theme (T)"
          className="rounded-md border border-line bg-abyss px-3 py-1.5 font-mono text-[0.7rem] tracking-[0.04em] text-ink-dim transition-colors hover:text-ink"
        >
          {theme === 'paper' ? 'Paper · T' : 'Ink · T'}
        </button>
      </div>
      <CommandChip
        command={active?.command}
        reduced={still}
        onCopy={() => playSound('success')}
      />

      <main
        ref={railRef}
        data-mode={mode}
        className={
          mode === 'slide'
            ? 'slide-rail fixed inset-0 z-10 snap-y snap-proximity overflow-y-scroll overflow-x-hidden scroll-smooth'
            : 'slide-rail fixed inset-0 z-10 overflow-y-auto overflow-x-hidden overscroll-contain'
        }
        aria-label="Linux presentation slides"
      >
        {scenes.map((slide, i) => {
          // Render scene bodies only near the viewport. A full deck mounts
          // every terminal, table and canvas at once otherwise, which dominated
          // first paint. The window is +/-2 scenes so that a one-scene step
          // always has its destination already mounted: content is ready before
          // the scroll lands, never revealed after it. Off-screen sections keep
          // their last measured height (see the heights map above), so mounting
          // a body never shifts the page.
          const near = Math.abs(i - activeIndex) <= 2
          // Scroll mode only: slide mode sections are exactly 100dvh, where a
          // reserved min-height would break the snap layout.
          const reserved = mode === 'scroll' && !near && heights[i] != null ? { minHeight: heights[i] } : undefined
          return (
          <div
            key={slide.id}
            ref={registerSlide(i)}
            data-slide-index={i}
            style={reserved}
            className={mode === 'slide' ? 'h-[100dvh] snap-start snap-always' : 'min-h-[100dvh]'}
          >
            <Slide
              key={i === activeIndex ? `${slide.id}-${replayToken}` : slide.id}
              index={i}
              total={total}
              part={slide.part}
              kicker={slide.kicker}
              title={slide.kind === 'part' ? null : slide.title}
              lead={slide.lead}
              id={{ ...slide, index: i }}
              active={near}
              level={i === 0 ? 1 : 2}
              tight={slide.tight}
              fluid={mode === 'scroll'}
              reduced={still}
            >
              {slide.kind === 'part' ? null : (
                <div className="mb-3 flex flex-wrap items-center gap-3">
                  <Badge kind={slide.badge} />
                  <span className="font-mono text-[0.8rem] tracking-[0.04em] text-ink-faint">
                    {PARTS[slide.part]?.name}
                  </span>
                </div>
              )}
              {renderSlideBody(slide, {
                reduced: still,
                visibleSteps: i === activeIndex ? stepIndex + 1 : Infinity,
              })}
            </Slide>
          </div>
          )
        })}
      </main>

      <footer className="pointer-events-none fixed inset-x-0 bottom-0 z-30 flex items-center justify-between gap-4 px-4 py-3 font-mono text-[0.68rem] text-ink-faint print:hidden">
        {/* The command chip lives bottom-left; yield that corner on short
            viewports instead of rendering underneath it. */}
        <span className="hidden truncate sm:inline [@media(max-height:700px)]:hidden">
          {deckMeta.author}
          {footerHints ? ` · ${footerHints}` : ''}
        </span>
        {/* Small screens never see the full hint line; keep the two
            shortcuts that matter for following along. */}
        <span className="truncate sm:hidden">↓ next · G grid</span>
        <span className="flex items-center gap-3">
          {isFullscreen ? <span className="text-green">fullscreen</span> : null}
          {presenter ? <span className="text-cyan">presenter mode</span> : null}
        </span>
      </footer>

      <AnimatePresence>
        {gridOpen ? (
          <Suspense fallback={null}>
            <GridOverview
              scenes={scenes}
              activeIndex={activeIndex}
              onSelect={selectSlide}
              onClose={toggleGrid}
              reduced={still}
            />
          </Suspense>
        ) : null}
      </AnimatePresence>

      <AnimatePresence>
        {presenter && active ? (
          <PresenterPanel
            slide={active}
            part={active.part}
            index={activeIndex}
            total={total}
            mode={mode}
            stepIndex={stepIndex}
            maxSteps={maxSteps}
            nextScene={scenes[activeIndex + 1] ?? null}
            reduced={still}
            onClose={togglePresenter}
          />
        ) : null}
      </AnimatePresence>

      <AnimatePresence>
        {helpOpen ? (
          <motion.div
            className="fixed bottom-14 left-4 z-50 w-[min(22rem,calc(100vw-2rem))]"
            initial={still ? false : { opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: still ? 0 : 0.2 }}
          >
            <ShortcutHelp />
          </motion.div>
        ) : null}
      </AnimatePresence>
    </MotionProvider>
  )
}
