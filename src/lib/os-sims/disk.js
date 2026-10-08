/**
 * Disk scheduling engine — pure, deterministic, no timers.
 *
 * Cylinders run 0..max (default 199, the classic textbook disk).
 * scheduleDisk() returns:
 * {
 *   order:    [request cylinders in the order they are serviced],
 *   path:     [every head position: start, services and sweep endpoints],
 *   movement: total cylinders travelled,
 *   steps:    [{ from, to }] for drawing the path segment by segment
 * }
 *
 * Conventions (documented so the UI can explain them):
 * - SCAN goes to the physical end (0 or max) before reversing — the elevator
 *   does not turn around mid-shaft.
 * - C-SCAN sweeps in one direction only; the jump back across the disk
 *   counts as head movement, then servicing resumes from the far edge.
 * - LOOK turns around at the last request instead of the disk end.
 * - Ties in SSTF break toward the lower cylinder, then by request order.
 */

export const DISK_ALGORITHMS = ['fcfs', 'sstf', 'scan', 'cscan', 'look']

export const DISK_META = {
  fcfs: {
    name: 'FCFS',
    full: 'First Come, First Served',
    weakness: 'No reordering: the head wanders back and forth.',
  },
  sstf: {
    name: 'SSTF',
    full: 'Shortest Seek Time First',
    weakness: 'Can starve far requests when new ones keep arriving nearby.',
  },
  scan: {
    name: 'SCAN',
    full: 'SCAN (elevator)',
    weakness: 'Always rides to the end, even with no requests there.',
  },
  cscan: {
    name: 'C-SCAN',
    full: 'C-SCAN (circular)',
    weakness: 'The long jump back adds extra travel every sweep.',
  },
  look: {
    name: 'LOOK',
    full: 'LOOK',
    weakness: 'Still sweeps both ways; direction changes cost turns.',
  },
}

export const DEFAULT_DISK_REQUESTS = [98, 183, 37, 122, 14, 124, 65, 67]
export const DEFAULT_DISK_HEAD = 53
export const DISK_MAX = 199

function fromPath(start, stops, services) {
  const path = [start, ...stops]
  const steps = []
  for (let i = 1; i < path.length; i += 1) steps.push({ from: path[i - 1], to: path[i] })
  const movement = steps.reduce((a, s) => a + Math.abs(s.to - s.from), 0)
  return { order: services, path, movement, steps }
}

export function scheduleDisk(requests, start, { algorithm = 'fcfs', max = DISK_MAX, direction = 'up' } = {}) {
  const req = [...requests]
  if (algorithm === 'fcfs') {
    return fromPath(start, req, req)
  }
  if (algorithm === 'sstf') {
    const pending = req.map((cyl, i) => ({ cyl, i }))
    const order = []
    let head = start
    while (pending.length) {
      pending.sort(
        (a, b) => Math.abs(a.cyl - head) - Math.abs(b.cyl - head) || a.cyl - b.cyl || a.i - b.i,
      )
      const next = pending.shift()
      order.push(next.cyl)
      head = next.cyl
    }
    return fromPath(start, order, order)
  }
  const below = req.filter((c) => c < start).sort((a, b) => a - b)
  const above = req.filter((c) => c >= start).sort((a, b) => a - b)
  const down = [...below].reverse()
  if (algorithm === 'scan') {
    if (direction === 'up') return fromPath(start, [...above, max, ...down], [...above, ...down])
    return fromPath(start, [...down, 0, ...above], [...down, ...above])
  }
  if (algorithm === 'cscan') {
    if (direction === 'up') return fromPath(start, [...above, max, 0, ...below], [...above, ...below])
    const aboveDown = [...above].reverse()
    return fromPath(start, [...down, 0, max, ...aboveDown], [...down, ...aboveDown])
  }
  // look: turn at the last request, never visit the disk ends.
  const order = direction === 'up' ? [...above, ...down] : [...down, ...above]
  return fromPath(start, order, order)
}

export function diskVerdict(algorithm, result) {
  return `${DISK_META[algorithm]?.full ?? algorithm}: ${result.order.length} requests, ${result.movement} cylinders of head travel.`
}
