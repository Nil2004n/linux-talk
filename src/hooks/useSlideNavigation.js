import { useCallback, useEffect, useRef, useState } from 'react'

/**
 * Vertical scroll-snap navigation engine.
 *
 * - `railRef`    -> the scrolling container (attached in App)
 * - `slideRefs`  -> ref callback factory, one per slide
 * - `activeIndex`-> index of the slide currently filling the viewport
 *
 * Keyboard, grid overview and part jumps all funnel through `goTo`, which
 * relies on native scroll-snap so trackpad/wheel gestures keep working.
 */
function isScrollableElement(el, root) {
  let curr = el
  while (curr && curr !== root && curr !== document.body && curr !== document.documentElement) {
    const style = window.getComputedStyle(curr)
    const overflowY = style.overflowY
    if (overflowY === 'auto' || overflowY === 'scroll') {
      if (curr.scrollHeight > curr.clientHeight) {
        return curr
      }
    }
    curr = curr.parentElement
  }
  return null
}

export function useSlideNavigation(
  slideCount,
  { reduced = false, mode = 'slide', onStepNext, onStepPrev, stepHandlersRef } = {},
) {
  const railRef = useRef(null)
  const slideRefs = useRef([])
  const [activeIndex, setActiveIndex] = useState(0)
  const activeIndexRef = useRef(0)
  const isTransitioningRef = useRef(false)
  const unlockTimerRef = useRef(0)
  const wheelAccumulatorRef = useRef(0)
  const lastWheelTimeRef = useRef(0)

  const callbacksRef = useRef({ onStepNext, onStepPrev })
  useEffect(() => {
    callbacksRef.current = { onStepNext, onStepPrev }
  }, [onStepNext, onStepPrev])

  useEffect(() => {
    activeIndexRef.current = activeIndex
  }, [activeIndex])

  const registerSlide = useCallback((index) => (el) => {
    slideRefs.current[index] = el
  }, [])

  // Single authoritative transition dispatcher
  const goTo = useCallback(
    (target) => {
      const rail = railRef.current
      if (!rail) return
      const index = Math.min(slideCount - 1, Math.max(0, target))
      const prevIndex = activeIndexRef.current ?? 0

      // Authoritative immediate update
      activeIndexRef.current = index
      setActiveIndex(index)

      // Set transition lock
      isTransitioningRef.current = true
      window.clearTimeout(unlockTimerRef.current)

      if (mode === 'scroll') {
        slideRefs.current[index]?.scrollIntoView({
          behavior: reduced ? 'auto' : 'smooth',
          block: 'start',
        })
        unlockTimerRef.current = window.setTimeout(() => {
          isTransitioningRef.current = false
        }, reduced ? 40 : 400)
        return
      }

      const h = rail.clientHeight || window.innerHeight || 1
      const distance = Math.abs(index - prevIndex)
      const behavior = reduced || distance > 2 ? 'auto' : 'smooth'

      rail.scrollTo({ top: index * h, behavior })

      // Guaranteed unlock after scroll settles
      unlockTimerRef.current = window.setTimeout(() => {
        isTransitioningRef.current = false
        wheelAccumulatorRef.current = 0
      }, behavior === 'auto' ? 40 : 360)
    },
    [slideCount, reduced, mode],
  )

  const nextRef = useRef(null)
  const prevRef = useRef(null)

  const next = useCallback(() => {
    isTransitioningRef.current = true
    window.clearTimeout(unlockTimerRef.current)
    unlockTimerRef.current = window.setTimeout(() => {
      isTransitioningRef.current = false
      wheelAccumulatorRef.current = 0
    }, reduced ? 40 : 280)

    const handleStep = stepHandlersRef?.current?.onStepNext ?? callbacksRef.current.onStepNext
    if (handleStep) {
      handleStep()
    } else {
      goTo(activeIndexRef.current + 1)
    }
  }, [goTo, stepHandlersRef, reduced])

  const prev = useCallback(() => {
    isTransitioningRef.current = true
    window.clearTimeout(unlockTimerRef.current)
    unlockTimerRef.current = window.setTimeout(() => {
      isTransitioningRef.current = false
      wheelAccumulatorRef.current = 0
    }, reduced ? 40 : 280)

    const handleStep = stepHandlersRef?.current?.onStepPrev ?? callbacksRef.current.onStepPrev
    if (handleStep) {
      handleStep()
    } else {
      goTo(activeIndexRef.current - 1)
    }
  }, [goTo, stepHandlersRef, reduced])

  useEffect(() => {
    nextRef.current = next
    prevRef.current = prev
  }, [next, prev])

  const first = useCallback(() => goTo(0), [goTo])
  const last = useCallback(() => goTo(slideCount - 1), [goTo, slideCount])

  // Wheel handling in Slide mode
  useEffect(() => {
    if (mode !== 'slide') return undefined

    const onWheel = (e) => {
      // Intercept wheel in slide mode for deterministic slide step navigation
      e.preventDefault()

      const now = Date.now()
      if (now - lastWheelTimeRef.current > 200) {
        wheelAccumulatorRef.current = 0
      }
      lastWheelTimeRef.current = now

      wheelAccumulatorRef.current += e.deltaY

      if (isTransitioningRef.current) return

      const THRESHOLD = 24
      if (wheelAccumulatorRef.current >= THRESHOLD) {
        wheelAccumulatorRef.current = 0
        nextRef.current?.()
      } else if (wheelAccumulatorRef.current <= -THRESHOLD) {
        wheelAccumulatorRef.current = 0
        prevRef.current?.()
      }
    }

    window.addEventListener('wheel', onWheel, { passive: false })
    return () => window.removeEventListener('wheel', onWheel)
  }, [mode])

  // Scroll mode observer / resize alignment
  useEffect(() => {
    const rail = railRef.current
    if (!rail) return undefined

    if (mode === 'scroll') {
      const observer = new IntersectionObserver(
        (entries) => {
          if (isTransitioningRef.current) return
          let best = null
          entries.forEach((entry) => {
            const index = Number(entry.target.dataset.slideIndex)
            if (!Number.isInteger(index)) return
            if (entry.isIntersecting && (!best || entry.intersectionRatio > best.ratio)) {
              best = { index, ratio: entry.intersectionRatio }
            }
          })
          if (best && best.index !== activeIndexRef.current) {
            activeIndexRef.current = best.index
            setActiveIndex(best.index)
          }
        },
        { root: rail, threshold: [0.1, 0.3, 0.5, 0.7, 0.9] },
      )
      slideRefs.current.forEach((el) => {
        if (el) observer.observe(el)
      })
      return () => observer.disconnect()
    }

    const onResize = () => {
      const h = rail.clientHeight || 1
      rail.scrollTo({ top: activeIndexRef.current * h, behavior: 'auto' })
    }
    window.addEventListener('resize', onResize)

    return () => {
      window.removeEventListener('resize', onResize)
    }
  }, [slideCount, mode])

  return {
    railRef,
    registerSlide,
    activeIndex,
    goTo,
    next,
    prev,
    first,
    last,
    isTransitioning: isTransitioningRef,
  }
}

/**
 * Global keyboard shortcuts. Ignores keys typed into inputs and swallows the
 * browser defaults so Space / arrows never scroll the page behind the deck.
 */
export function useDeckHotkeys(handlers, { enabled = true } = {}) {
  const ref = useRef(handlers)

  useEffect(() => {
    ref.current = handlers
  }, [handlers])

  useEffect(() => {
    if (!enabled) return undefined

    const isTypingTarget = (el) => {
      if (!el) return false
      const tag = el.tagName
      return (
        tag === 'INPUT' ||
        tag === 'TEXTAREA' ||
        tag === 'SELECT' ||
        el.isContentEditable === true
      )
    }

    const onKeyDown = (e) => {
      if (e.metaKey || e.ctrlKey || e.altKey) return
      if (isTypingTarget(e.target)) return

      const h = ref.current
      switch (e.key) {
        case 'ArrowDown':
        case 'ArrowRight':
        case 'PageDown':
        case ' ':
        case 'Spacebar':
          e.preventDefault()
          h.next()
          break
        case 'ArrowUp':
        case 'ArrowLeft':
        case 'PageUp':
          e.preventDefault()
          h.prev()
          break
        case 'Home':
          e.preventDefault()
          h.first()
          break
        case 'End':
          e.preventDefault()
          h.last()
          break
        case 'Escape':
          h.escape()
          break
        case '1':
        case '2':
        case '3':
        case '4':
        case '5':
          e.preventDefault()
          h.goPart(e.key)
          break
        default:
          break
      }

      switch (e.key.toLowerCase()) {
        case 'g':
          e.preventDefault()
          h.toggleGrid()
          break
        case 'f':
          e.preventDefault()
          h.toggleFullscreen()
          break
        case 'm':
          e.preventDefault()
          h.toggleMode?.()
          break
        case 'p':
          e.preventDefault()
          h.togglePresenter()
          break
        case 'r':
          e.preventDefault()
          h.replay?.()
          break
        case 't':
          e.preventDefault()
          h.toggleTheme?.()
          break
        case '?':
          e.preventDefault()
          h.toggleHelp()
          break
        default:
          break
      }
    }

    window.addEventListener('keydown', onKeyDown)
    return () => window.removeEventListener('keydown', onKeyDown)
  }, [enabled])
}

/** requestFullscreen wrapper that degrades quietly when unavailable. */
export function useFullscreen() {
  const [isFullscreen, setIsFullscreen] = useState(false)

  useEffect(() => {
    const onChange = () => setIsFullscreen(Boolean(document.fullscreenElement))
    document.addEventListener('fullscreenchange', onChange)
    return () => document.removeEventListener('fullscreenchange', onChange)
  }, [])

  const toggle = useCallback(() => {
    const el = document.documentElement
    if (!document.fullscreenEnabled) return
    if (document.fullscreenElement) {
      document.exitFullscreen?.().catch(() => { })
    } else {
      el.requestFullscreen?.().catch(() => { })
    }
  }, [])

  return { isFullscreen, toggle, supported: typeof document !== 'undefined' && document.fullscreenEnabled }
}

/**
 * Presentation mode with a persisted preference.
 *
 * `slide` is the default snap-driven deck. `scroll` is a continuous
 * scroll-storytelling layout. On small or coarse-pointer viewports the deck
 * starts in scroll mode unless the presenter has explicitly chosen slide mode.
 */
export function usePresentationMode() {
  const storageKey = 'deck.mode'
  const [mode, setMode] = useState(() => {
    if (typeof window === 'undefined') return 'slide'
    const stored = window.localStorage.getItem(storageKey)
    if (stored === 'slide' || stored === 'scroll') return stored
    const coarse = window.matchMedia?.('(pointer: coarse)').matches ?? false
    const narrow = window.matchMedia?.('(max-width: 768px)').matches ?? false
    return coarse || narrow ? 'scroll' : 'slide'
  })

  useEffect(() => {
    try {
      window.localStorage.setItem(storageKey, mode)
    } catch {
      // Private browsing or a locked-down kiosk should never break navigation.
    }
  }, [mode])

  const toggleMode = useCallback(() => {
    setMode((m) => (m === 'slide' ? 'scroll' : 'slide'))
  }, [])

  return { mode, setMode, toggleMode }
}

/** Persisted boolean flags (presenter mode, help overlay...). */
export function useToggle(initial = false, storageKey = null) {
  const [value, setValue] = useState(() => {
    if (typeof window === 'undefined' || !storageKey) return initial
    const stored = window.localStorage.getItem(storageKey)
    return stored === null ? initial : stored === 'true'
  })

  useEffect(() => {
    if (!storageKey) return
    window.localStorage.setItem(storageKey, String(value))
  }, [storageKey, value])

  const toggle = useCallback(() => setValue((v) => !v), [])
  return [value, toggle, setValue]
}
