/**
 * CPU scheduling engine — pure, deterministic, no timers.
 *
 * A process is `{ id, arrival, burst, priority }` where a LOWER priority
 * number means a MORE important process (Unix-like).
 *
 * simulate() returns Gantt segments plus waiting/turnaround metrics:
 * {
 *   segments: [{ pid, start, end }],   // CPU occupation over time, in order
 *   perProcess: [{ id, arrival, burst, completion, waiting, turnaround }],
 *   avgWaiting, avgTurnaround, switches, totalTime
 * }
 *
 * Conventions (documented so the UI can explain them):
 * - FCFS / SJF / Priority are non-preemptive.
 * - Round Robin is preemptive with the given quantum.
 * - In Round Robin, processes that arrive during a quantum join the ready
 *   queue BEFORE the preempted process is re-queued.
 * - Ties break by earliest arrival, then by process id.
 */

export const CPU_ALGORITHMS = ['fcfs', 'sjf', 'rr', 'priority']

export const CPU_META = {
  fcfs: {
    name: 'FCFS',
    full: 'First Come, First Served',
    best: 'Simple and predictable.',
    weakness: 'Long jobs block short ones waiting behind them.',
  },
  sjf: {
    name: 'SJF',
    full: 'Shortest Job First',
    best: 'Minimal average waiting time.',
    weakness: 'Needs to know burst times, and can starve long jobs.',
  },
  rr: {
    name: 'Round Robin',
    full: 'Round Robin',
    best: 'Fair: everyone gets regular turns.',
    weakness: 'Quantum size matters; small quanta switch too often.',
  },
  priority: {
    name: 'Priority',
    full: 'Priority scheduling',
    best: 'Flexible: urgent work jumps the queue.',
    weakness: 'Needs aging, or low-priority jobs starve.',
  },
}

export const DEFAULT_PROCESSES = [
  { id: 'P1', arrival: 0, burst: 8, priority: 2 },
  { id: 'P2', arrival: 1, burst: 4, priority: 1 },
  { id: 'P3', arrival: 2, burst: 2, priority: 3 },
  { id: 'P4', arrival: 3, burst: 1, priority: 2 },
]

function finish(procs, segments) {
  const perProcess = procs.map((p) => {
    const last = [...segments].reverse().find((s) => s.pid === p.id)
    const completion = last ? last.end : p.arrival
    const turnaround = completion - p.arrival
    return { ...p, completion, waiting: turnaround - p.burst, turnaround }
  })
  const n = perProcess.length || 1
  const avgWaiting = perProcess.reduce((a, p) => a + p.waiting, 0) / n
  const avgTurnaround = perProcess.reduce((a, p) => a + p.turnaround, 0) / n
  const totalTime = segments.length ? segments[segments.length - 1].end : 0
  return {
    segments,
    perProcess,
    avgWaiting,
    avgTurnaround,
    switches: Math.max(0, segments.length - 1),
    totalTime,
  }
}

function runToCompletion(sorted, pick) {
  const remaining = new Map(sorted.map((p) => [p.id, { ...p }]))
  const done = new Set()
  const segments = []
  let time = Math.min(...sorted.map((p) => p.arrival))
  while (done.size < sorted.length) {
    const arrived = sorted.filter((p) => !done.has(p.id) && p.arrival <= time)
    if (!arrived.length) {
      time = Math.min(...sorted.filter((p) => !done.has(p.id)).map((p) => p.arrival))
      continue
    }
    const next = pick(arrived)
    segments.push({ pid: next.id, start: time, end: time + next.burst })
    time += next.burst
    done.add(next.id)
    remaining.delete(next.id)
  }
  return finish(sorted, segments)
}

const byArrivalThenId = (list) =>
  [...list].sort((a, b) => a.arrival - b.arrival || (a.id < b.id ? -1 : 1))

function simulateFCFS(processes) {
  return runToCompletion(byArrivalThenId(processes), (arrived) => arrived[0])
}

function simulateSJF(processes) {
  return runToCompletion(processes, (arrived) =>
    [...arrived].sort(
      (a, b) => a.burst - b.burst || a.arrival - b.arrival || (a.id < b.id ? -1 : 1),
    )[0],
  )
}

function simulatePriority(processes) {
  return runToCompletion(processes, (arrived) =>
    [...arrived].sort(
      (a, b) =>
        a.priority - b.priority || a.arrival - b.arrival || (a.id < b.id ? -1 : 1),
    )[0],
  )
}

function simulateRR(processes, quantum = 2) {
  const q = Math.max(1, Math.floor(quantum))
  const sorted = byArrivalThenId(processes)
  const remaining = new Map(sorted.map((p) => [p.id, p.burst ]))
  const enqueued = new Set()
  const queue = []
  const segments = []
  let time = sorted.length ? sorted[0].arrival : 0

  const admit = (upto) => {
    sorted.forEach((p) => {
      if (!enqueued.has(p.id) && remaining.get(p.id) > 0 && p.arrival <= upto) {
        enqueued.add(p.id)
        queue.push(p.id)
      }
    })
  };

  admit(time)
  while (queue.length || [...remaining.values()].some((r) => r > 0)) {
    if (!queue.length) {
      time = Math.min(
        ...sorted.filter((p) => remaining.get(p.id) > 0).map((p) => p.arrival),
      )
      admit(time)
      continue
    }
    const pid = queue.shift()
    const slice = Math.min(q, remaining.get(pid))
    segments.push({ pid, start: time, end: time + slice })
    time += slice
    remaining.set(pid, remaining.get(pid) - slice)
    // New arrivals join before the preempted process is re-queued.
    admit(time)
    if (remaining.get(pid) > 0) queue.push(pid)
  }
  return finish(sorted, segments)
}

export function simulateCPU(processes, { algorithm = 'fcfs', quantum = 2 } = {}) {
  const list = processes.map((p) => ({ ...p }))
  switch (algorithm) {
    case 'sjf':
      return simulateSJF(list)
    case 'rr':
      return simulateRR(list, quantum)
    case 'priority':
      return simulatePriority(list)
    case 'fcfs':
    default:
      return simulateFCFS(list)
  }
}

export function verdictCPU(algorithm, result) {
  const base = `Average waiting ${result.avgWaiting.toFixed(2)}, turnaround ${result.avgTurnaround.toFixed(2)}, ${result.switches} context switches.`
  if (algorithm === 'rr') return `${base} Round Robin is fairer but switches more often.`
  if (algorithm === 'sjf') return `${base} Shortest first keeps waiting low here.`
  if (algorithm === 'priority') return `${base} Urgent work finishes first.`
  return `${base} First come, first served — simple, not always fair.`
}

export function compareVerdict(aLabel, aResult, bLabel, bResult) {
  const diff = aResult.avgWaiting - bResult.avgWaiting
  if (Math.abs(diff) < 1e-9) return `${aLabel} and ${bLabel} tie on waiting time here.`
  const winner = diff < 0 ? aLabel : bLabel
  return `${winner} waits less on average (${Math.min(aResult.avgWaiting, bResult.avgWaiting).toFixed(2)} vs ${Math.max(aResult.avgWaiting, bResult.avgWaiting).toFixed(2)}).`
}
