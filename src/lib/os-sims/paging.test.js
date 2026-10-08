import { describe, expect, it } from 'vitest'
import { BELADY_REFS, DEFAULT_PAGE_FRAMES, DEFAULT_PAGE_REFS, beladyDemo, simulatePaging } from './paging.js'

describe('page replacement engine', () => {
  it('FIFO faults 15 times on the classic 20-reference string', () => {
    const r = simulatePaging(DEFAULT_PAGE_FRAMES, DEFAULT_PAGE_REFS, { algorithm: 'fifo' })
    expect(r.faults).toBe(15)
    expect(r.hits).toBe(5)
    expect(r.faultRate).toBeCloseTo(0.75, 9)
  })

  it('LRU faults 12 times on the classic 20-reference string', () => {
    const r = simulatePaging(DEFAULT_PAGE_FRAMES, DEFAULT_PAGE_REFS, { algorithm: 'lru' })
    expect(r.faults).toBe(12)
    expect(r.hits).toBe(8)
  })

  it('Optimal faults 9 times on the classic 20-reference string', () => {
    const r = simulatePaging(DEFAULT_PAGE_FRAMES, DEFAULT_PAGE_REFS, { algorithm: 'optimal' })
    expect(r.faults).toBe(9)
    expect(r.hits).toBe(11)
  })

  it('emits one step per reference with full frame snapshots', () => {
    const r = simulatePaging(3, [1, 2, 1, 3], { algorithm: 'fifo' })
    expect(r.steps).toHaveLength(4)
    expect(r.steps[2].hit).toBe(true)
    expect(r.steps[2].evicted).toBeNull()
    r.steps.forEach((s) => expect(s.frames).toHaveLength(3))
    expect(r.steps[3].evicted).toBeNull()
    expect(r.steps[3].frames).toEqual([1, 2, 3])
  })

  it('demonstrates Belady’s anomaly: 9 faults with 3 frames, 10 with 4', () => {
    const demo = beladyDemo()
    expect(demo.refs).toEqual(BELADY_REFS)
    expect(demo.three).toBe(9)
    expect(demo.four).toBe(10)
    expect(demo.anomaly).toBe(true)
  })

  it('hits plus faults always equal the reference count', () => {
    for (const algorithm of ['fifo', 'lru', 'optimal']) {
      const r = simulatePaging(4, DEFAULT_PAGE_REFS, { algorithm })
      expect(r.hits + r.faults).toBe(DEFAULT_PAGE_REFS.length)
    }
  })
})
