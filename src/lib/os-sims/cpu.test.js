import { describe, expect, it } from 'vitest'
import { DEFAULT_PROCESSES, simulateCPU } from './cpu.js'

const tiny = [
  { id: 'P1', arrival: 0, burst: 3, priority: 2 },
  { id: 'P2', arrival: 1, burst: 2, priority: 1 },
]

describe('cpu scheduling engine', () => {
  it('runs FCFS in arrival order with exact metrics', () => {
    const r = simulateCPU(tiny, { algorithm: 'fcfs' })
    expect(r.segments).toEqual([
      { pid: 'P1', start: 0, end: 3 },
      { pid: 'P2', start: 3, end: 5 },
    ])
    expect(r.avgWaiting).toBeCloseTo(1, 9)
    expect(r.avgTurnaround).toBeCloseTo(3.5, 9)
    expect(r.switches).toBe(1)
  })

  it('preempts in Round Robin with the quantum', () => {
    const r = simulateCPU(tiny, { algorithm: 'rr', quantum: 2 })
    expect(r.segments).toEqual([
      { pid: 'P1', start: 0, end: 2 },
      { pid: 'P2', start: 2, end: 4 },
      { pid: 'P1', start: 4, end: 5 },
    ])
    expect(r.avgWaiting).toBeCloseTo(1.5, 9)
  })

  it('matches hand-computed FCFS averages on the default set', () => {
    const r = simulateCPU(DEFAULT_PROCESSES, { algorithm: 'fcfs' })
    expect(r.avgWaiting).toBeCloseTo(7, 9)
    expect(r.avgTurnaround).toBeCloseTo(10.75, 9)
  })

  it('matches hand-computed SJF averages on the default set', () => {
    const r = simulateCPU(DEFAULT_PROCESSES, { algorithm: 'sjf' })
    expect(r.segments.map((s) => s.pid)).toEqual(['P1', 'P4', 'P3', 'P2'])
    expect(r.avgWaiting).toBeCloseTo(5.5, 9)
  })

  it('matches hand-computed Priority averages on the default set', () => {
    const r = simulateCPU(DEFAULT_PROCESSES, { algorithm: 'priority' })
    expect(r.segments.map((s) => s.pid)).toEqual(['P1', 'P2', 'P4', 'P3'])
    expect(r.avgWaiting).toBeCloseTo(6.75, 9)
  })

  it('keeps Round Robin invariants on the default set', () => {
    const r = simulateCPU(DEFAULT_PROCESSES, { algorithm: 'rr', quantum: 2 })
    const totalBurst = DEFAULT_PROCESSES.reduce((a, p) => a + p.burst, 0)
    const covered = r.segments.reduce((a, s) => a + (s.end - s.start), 0)
    expect(covered).toBe(totalBurst)
    expect(r.totalTime).toBe(totalBurst) // first arrival is 0, no idle gaps
    for (let i = 1; i < r.segments.length; i += 1) {
      expect(r.segments[i].start).toBe(r.segments[i - 1].end)
    }
    r.perProcess.forEach((p) => {
      expect(p.waiting).toBeGreaterThanOrEqual(0)
      expect(p.turnaround).toBe(p.waiting + p.burst)
    })
  })
})
