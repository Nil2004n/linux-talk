/* Shared design tokens as JS constants so components and animations stay in sync
   with the CSS theme in src/index.css. Values reference theme variables, so
   inline styles follow the paper/ink theme automatically. */

export const PALETTE = {
  void: 'var(--color-void)',
  abyss: 'var(--color-abyss)',
  panel: 'var(--color-panel)',
  panel2: 'var(--color-panel-2)',
  line: 'var(--color-line)',
  lineSoft: 'var(--color-line-soft)',
  ink: 'var(--color-ink)',
  inkDim: 'var(--color-ink-dim)',
  inkFaint: 'var(--color-ink-faint)',
  cyan: 'var(--color-cyan)',
  cyanDim: 'var(--color-cyan-dim)',
  green: 'var(--color-green)',
  greenDim: 'var(--color-green-dim)',
  red: 'var(--color-red)',
  redDim: 'var(--color-red-dim)',
  amber: 'var(--color-amber)',
  amberDim: 'var(--color-amber-dim)',
  violet: 'var(--color-violet)',
}

/** Badge semantics. Every scene carries exactly one of these. Labels carry
   the meaning; colour stays neutral so the accent is spent only once. */
export const BADGES = {
  LIVE: {
    label: 'Live',
    hint: 'typed live in a real terminal',
    fg: 'var(--color-ink-dim)',
  },
  SLIDE: {
    label: 'Slide',
    hint: 'explained from slides',
    fg: 'var(--color-ink-dim)',
  },
  'TAKE-HOME': {
    label: 'Take-home',
    hint: 'read at home, not covered live',
    fg: 'var(--color-ink-dim)',
  },
}

export const PARTS = {
  intro: { id: 'intro', letter: '•', name: 'Intro' },
  A: { id: 'A', letter: 'A', name: 'Why Linux' },
  B: { id: 'B', letter: 'B', name: 'Terminal fundamentals' },
  C: { id: 'C', letter: 'C', name: 'Servers & system' },
  C2: { id: 'C2', letter: 'C2', name: 'Inside the OS' },
  D: { id: 'D', letter: 'D', name: 'GitHub to deploy' },
  closing: { id: 'closing', letter: '•', name: 'Closing' },
}

export const PART_ORDER = ['intro', 'A', 'B', 'C', 'C2', 'D', 'closing']

/** Every animation in the deck finishes inside this budget. */
export const MOTION = {
  fast: 0.18,
  base: 0.34,
  slow: 0.62,
  cap: 0.78,
  stagger: 0.055,
}

export const PART_COLORS = {
  A: '#22d3ee',
  B: '#39ff14',
  C: '#fbbf24',
  C2: '#f472b6',
  D: '#a78bfa',
}

export const SHORTCUTS = [
  { keys: '↓ / → / Space', action: 'Next reveal or slide' },
  { keys: '↑ / ←', action: 'Previous reveal or slide' },
  { keys: 'Home / End', action: 'First / last slide' },
  { keys: '1 – 5', action: 'Jump to Part A, B, C, C2 or D' },
  { keys: 'G', action: 'Grid overview of all slides' },
  { keys: 'M', action: 'Toggle slide / scroll mode' },
  { keys: 'F', action: 'Toggle fullscreen' },
  { keys: 'P', action: 'Toggle speaker notes' },
  { keys: 'R', action: 'Replay current slide' },
  { keys: 'T', action: 'Toggle paper / ink theme' },
  { keys: '?', action: 'Keyboard help' },
  { keys: 'Esc', action: 'Close overlay' },
]
