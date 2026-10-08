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
export function useSlideNavigation(slideCount, { reduced = false, mode = 'slide' } = {}) {
  const railRef = useRef(null)
  const slideRefs = useRef([])
  const [activeIndex, setActiveIndex] = useState(0)

  const registerSlide = useCallback((index) => (el) => {
    slideRefs.current[index] = el
  }, [])

  // Track the active slide from scroll position, throttled to animation frames.
  // Scroll mode uses an IntersectionObserver because sections have natural
  // heights instead of exact viewport heights.
  useEffect(() => {
    const rail = railRef.current
    if (!rail) return undefined

    if (mode === 'scroll') {
      const observer = new IntersectionObserver(
        (entries) => {
          let best = null
          entries.forEach((entry) => {
            const index = Number(entry.target.dataset.slideIndex)
            if (!Number.isInteger(index)) return
            if (entry.isIntersecting && (!best || entry.intersectionRatio > best.ratio)) {
              best = { index, ratio: entry.intersectionRatio }
            }
          })
          if (best) {
            setActiveIndex((prev) => (prev === best.index ? prev : best.index))
          }
        },
        { root: rail, threshold: [0.25, 0.5, 0.75] },
      )
      slideRefs.current.forEach((el) => {
        if (el) observer.observe(el)
      })
      return () => observer.disconnect()
    }

    let frame = 0
    const measure = () => {
      frame = 0
      const h = rail.clientHeight || 1
      const idx = Math.min(
        slideCount - 1,
        Math.max(0, Math.round(rail.scrollTop / h)),
      )
      setActiveIndex((prev) => (prev === idx ? prev : idx))
    }
    const onScroll = () => {
      if (frame) return
      frame = requestAnimationFrame(measure)
    }

    measure()
    rail.addEventListener('scroll', onScroll, { passive: true })
    const onResize = () => {
      // Keep the active slide aligned when the viewport height changes.
      const h = rail.clientHeight || 1
      rail.scrollTo({ top: Math.round(rail.scrollTop / h) * h, behavior: 'auto' })
      measure()
    }
    window.addEventListener('resize', onResize)

    return () => {
      if (frame) cancelAnimationFrame(frame)
      rail.removeEventListener('scroll', onScroll)
      window.removeEventListener('resize', onResize)
    }
  }, [slideCount, mode])

  const goTo = useCallback(
    (target) => {
      const rail = railRef.current
      if (!rail) return
      const index = Math.min(slideCount - 1, Math.max(0, target))
      if (mode === 'scroll') {
        slideRefs.current[index]?.scrollIntoView({
          behavior: reduced ? 'auto' : 'smooth',
          block: 'start',
        })
        setActiveIndex(index)
        return
      }
      const h = rail.clientHeight || 1
      const distance = Math.abs(index - activeIndex)
      // Smooth-scroll one or two slides so the audience can follow the change.
      // A long jump (End, a part shortcut, the grid overview) goes instantly:
      // animating across twenty viewports takes seconds, during which the deck
      // would be scrolling through slides the presenter did not ask to see.
      const behavior = reduced || distance > 2 ? 'auto' : 'smooth'
      rail.scrollTo({ top: index * h, behavior })
      // Optimistic update: keeps the progress bar responsive during the scroll.
      setActiveIndex(index)
    },
    [slideCount, reduced, activeIndex, mode],
  )

  const next = useCallback(() => goTo(activeIndex + 1), [goTo, activeIndex])
  const prev = useCallback(() => goTo(activeIndex - 1), [goTo, activeIndex])
  const first = useCallback(() => goTo(0), [goTo])
  const last = useCallback(() => goTo(slideCount - 1), [goTo, slideCount])

  return { railRef, registerSlide, activeIndex, goTo, next, prev, first, last }
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
      document.exitFullscreen?.().catch(() => {})
    } else {
      el.requestFullscreen?.().catch(() => {})
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
