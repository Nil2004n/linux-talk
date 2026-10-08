/**
 * Page replacement engine — pure, deterministic, no timers.
 *
 * simulate(frames, refs, { algorithm }) steps through one page request at a
 * time and returns:
 * {
 *   steps: [{ page, hit, frames: [...], evicted }],
 *     frames: array of length `frames` holding page numbers or null,
 *     evicted: the victim page number, or null,
 *   hits, faults, faultRate
 * }
 *
 * Conventions (documented so the UI can explain them):
 * - FIFO evicts the page that has been resident longest.
 * - LRU evicts the least recently used page; ties break by longest
 *   residence (the earliest-loaded page among the tied ones).
 * - Optimal evicts the page whose next use lies farthest in the future;
 *   pages never used again are evicted first.
 */

export const PAGING_ALGORITHMS = ['fifo', 'lru', 'optimal']

export const PAGING_META = {
  fifo: {
    name: 'FIFO',
    full: 'First In, First Out',
    best: 'Dead simple to implement.',
    weakness: 'Ignores how pages are actually used — evicts the old, not the useless.',
  },
  lru: {
    name: 'LRU',
    full: 'Least Recently Used',
    best: 'Good guess: unused lately usually means unneeded.',
    weakness: 'Tracking every access costs real work.',
  },
  optimal: {
    name: 'Optimal',
    full: "Belady's optimal",
    best: 'Perfect — the fewest faults physically possible.',
    weakness: 'Needs to see the future, so it cannot exist in practice.',
  },
}

export const DEFAULT_PAGE_REFS = [7, 0, 1, 2, 0, 3, 0, 4, 2, 3, 0, 3, 2, 1, 2, 0, 1, 7, 0, 1]
export const DEFAULT_PAGE_FRAMES = 3
export const BELADY_REFS = [1, 2, 3, 4, 1, 2, 5, 1, 2, 3, 4, 5]

function emptyFrames(n) {
  return Array.from({ length: Math.max(1, n) }, () => null)
}

function snapshot(frames) {
  return [...frames]
}

export function simulatePaging(frameCount, refs, { algorithm = 'fifo' } = {}) {
  const frames = emptyFrames(frameCount)
  const loadedAt = new Map() // page -> step index when it entered
  const usedAt = new Map() // page -> step index of last use
  const steps = []
  let hits = 0
  let faults = 0

  refs.forEach((page, t) => {
    if (frames.includes(page)) {
      hits += 1
      usedAt.set(page, t)
      steps.push({ page, hit: true, frames: snapshot(frames), evicted: null })
      return
    }
    faults += 1
    let evicted = null
    const free = frames.indexOf(null)
    if (free !== -1) {
      frames[free] = page
    } else {
      let victim = 0
      if (algorithm === 'fifo') {
        let oldest = Infinity
        frames.forEach((p, i) => {
          const at = loadedAt.get(p) ?? Infinity
          if (at < oldest) {
            oldest = at
            victim = i
          }
        })
      } else if (algorithm === 'lru') {
        let oldest = Infinity
        frames.forEach((p, i) => {
          // Least recently used; ties fall back to longest residence.
          const score = (usedAt.get(p) ?? -1) * 1e9 + (loadedAt.get(p) ?? 0)
          if (score < oldest) {
            oldest = score
            victim = i
          }
        })
      } else {
        // optimal: farthest next use wins eviction; never-again first.
        let farthest = -1
        frames.forEach((p, i) => {
          const next = refs.indexOf(p, t + 1)
          const dist = next === -1 ? Infinity : next
          if (dist > farthest) {
            farthest = dist
            victim = i
          }
        })
      }
      evicted = frames[victim]
      loadedAt.delete(evicted)
      usedAt.delete(evicted)
      frames[victim] = page
    }
    loadedAt.set(page, t)
    usedAt.set(page, t)
    steps.push({ page, hit: false, frames: snapshot(frames), evicted })
  })

  return { steps, hits, faults, faultRate: refs.length ? faults / refs.length : 0 }
}

/**
 * Belady's anomaly demo: FIFO on the classic reference string faults MORE
 * with 4 frames (10) than with 3 frames (9) — more RAM, worse result.
 */
export function beladyDemo() {
  const three = simulatePaging(3, BELADY_REFS, { algorithm: 'fifo' })
  const four = simulatePaging(4, BELADY_REFS, { algorithm: 'fifo' })
  return {
    refs: BELADY_REFS,
    three: three.faults,
    four: four.faults,
    anomaly: four.faults > three.faults,
  }
}

export function pagingVerdict(algorithm, result) {
  return `${PAGING_META[algorithm]?.full ?? algorithm}: ${result.hits} hits, ${result.faults} faults (${Math.round(result.faultRate * 100)}% fault rate).`
}
