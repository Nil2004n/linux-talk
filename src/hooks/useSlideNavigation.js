import { useCallback, useEffect, useRef, useState } from 'react'

/**
 * Continuous-page navigation engine.
 *
 * - `railRef`        -> the wrapping <main> (kept for layout refs)
 * - `registerSlide`  -> ref callback factory, one per section
 * - `activeIndex`    -> index of the section currently most visible
 *
 * Keyboard, grid overview and part jumps all funnel through `goTo`, which
 * scrolls the document to the target section. Active-section detection uses
 * an IntersectionObserver against the window.
 */
export function useSlideNavigation(slideCount, { reduced = false } = {}) {
  const railRef = useRef(null)
  const slideRefs = useRef([])
  const [activeIndex, setActiveIndex] = useState(0)

  const registerSlide = useCallback(
    (index) => (el) => {
      slideRefs.current[index] = el
    },
    [],
  )

  // A scene is active when it crosses a thin horizontal band near the top of
  // the viewport. The band (not ratio thresholds) keeps the winner stable:
  // exactly one scene owns the line at a time, and tall scenes can't lose to
  // shorter neighbours just because their ratio is capped by viewport height.
  // When two straddle the boundary, the one covering more of the band wins.
  useEffect(() => {
    const observer = new IntersectionObserver(
      (entries) => {
        let best = null
        entries.forEach((entry) => {
          const index = Number(entry.target.dataset.slideIndex)
          if (!Number.isInteger(index)) return
          if (!entry.isIntersecting) return
          const score = entry.intersectionRect.height
          if (!best || score > best.score) best = { index, score }
        })
        if (best) {
          setActiveIndex((prev) => (prev === best.index ? prev : best.index))
        }
      },
      { rootMargin: '-40% 0px -55% 0px', threshold: 0 },
    )
    slideRefs.current.forEach((el) => {
      if (el) observer.observe(el)
    })
    return () => observer.disconnect()
  }, [slideCount])

  const goTo = useCallback(
    (target) => {
      const index = Math.min(slideCount - 1, Math.max(0, target))
      // Smooth-scroll one or two sections so the reader can follow the change.
      // Long jumps (End, a part shortcut, the grid overview) go instantly:
      // animating across twenty sections takes seconds the reader never asked for.
      const distance = Math.abs(index - activeIndex)
      slideRefs.current[index]?.scrollIntoView({
        behavior: reduced || distance > 2 ? 'auto' : 'smooth',
        block: 'start',
      })
      setActiveIndex(index)
    },
    [slideCount, reduced, activeIndex],
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
