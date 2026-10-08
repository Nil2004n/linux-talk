import { describe, expect, it } from 'vitest'
import { DEFAULT_DISK_HEAD, DEFAULT_DISK_REQUESTS, scheduleDisk } from './disk.js'

const REQ = DEFAULT_DISK_REQUESTS
const HEAD = DEFAULT_DISK_HEAD

describe('disk scheduling engine', () => {
  it('FCFS services in request order with 640 cylinders', () => {
    const r = scheduleDisk(REQ, HEAD, { algorithm: 'fcfs' })
    expect(r.order).toEqual([98, 183, 37, 122, 14, 124, 65, 67])
    expect(r.movement).toBe(640)
  })

  it('SSTF always picks the nearest head with 236 cylinders', () => {
    const r = scheduleDisk(REQ, HEAD, { algorithm: 'sstf' })
    expect(r.order).toEqual([65, 67, 37, 14, 98, 122, 124, 183])
    expect(r.movement).toBe(236)
  })

  it('SCAN rides to the end before reversing (331 up)', () => {
    const r = scheduleDisk(REQ, HEAD, { algorithm: 'scan', direction: 'up' })
    expect(r.order).toEqual([65, 67, 98, 122, 124, 183, 37, 14])
    expect(r.path).toContain(199)
    expect(r.movement).toBe(331)
  })

  it('LOOK turns at the last request (299 up)', () => {
    const r = scheduleDisk(REQ, HEAD, { algorithm: 'look', direction: 'up' })
    expect(r.order).toEqual([65, 67, 98, 122, 124, 183, 37, 14])
    expect(r.path).not.toContain(199)
    expect(r.movement).toBe(299)
  })

  it('C-SCAN sweeps one way and jumps back (382 up)', () => {
    const r = scheduleDisk(REQ, HEAD, { algorithm: 'cscan', direction: 'up' })
    expect(r.order).toEqual([65, 67, 98, 122, 124, 183, 14, 37])
    expect(r.path).toEqual([53, 65, 67, 98, 122, 124, 183, 199, 0, 14, 37])
    expect(r.movement).toBe(382)
  })

  it('handles the down direction symmetrically', () => {
    expect(scheduleDisk(REQ, HEAD, { algorithm: 'scan', direction: 'down' }).movement).toBe(236)
    expect(scheduleDisk(REQ, HEAD, { algorithm: 'look', direction: 'down' }).movement).toBe(208)
    expect(scheduleDisk(REQ, HEAD, { algorithm: 'cscan', direction: 'down' }).movement).toBe(386)
  })

  it('keeps path, steps and movement consistent', () => {
    for (const algorithm of ['fcfs', 'sstf', 'scan', 'cscan', 'look']) {
      const r = scheduleDisk(REQ, HEAD, { algorithm })
      expect(r.path[0]).toBe(HEAD)
      expect(r.path.length).toBe(r.steps.length + 1)
      const sum = r.steps.reduce((a, s) => a + Math.abs(s.to - s.from), 0)
      expect(sum).toBe(r.movement)
    }
  })
})
