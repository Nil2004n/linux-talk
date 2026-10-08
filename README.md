# Linux and the Terminal: from first command to live website

A cinematic, interactive single-page presentation website that replaces a
PowerPoint deck for a live online session aimed at first-year engineering
students.

Story arc: what Linux is, why it matters, meeting the terminal, controlling
the system, going inside the OS (Part C2: CPU, disk and memory scheduling),
shipping a webpage from the terminal, then shipping it safely.

Built as a static site: React 18 + Vite + Tailwind CSS + Framer Motion, no
backend, no external APIs, no analytics, no secrets, no `.env` files. Fonts
(Inter Variable for sans, JetBrains Mono Variable for code) are self-hosted, so the deck works
fully offline. There are no timers, clocks, countdowns, duration labels,
matrix-rain effects, or novelty-command material anywhere in the experience.

**Keyboard driven · 24px+ body text · slide and scroll modes · paper/ink themes**

---

## Quick start

```bash
npm install        # install dependencies
npm run dev        # dev server with hot reload (http://localhost:5173)
npm run build      # production build -> dist/
npm run preview    # serve the production build locally
npm run lint       # oxlint
npm test           # Vitest suites for the OS simulation engines
```

`npm run build` writes a fully static `dist/` folder. Because `vite.config.js`
sets `base: './'`, the folder can be served from any path — the root of a
domain, `/repo/` on GitHub Pages, or a `dist/` output directory on any
GitHub-connected host.

---

## Keyboard shortcuts

| Key | Action |
| --- | --- |
| `↓` / `→` / `Space` | Next reveal, then next scene |
| `↑` / `←` | Previous reveal, then previous scene |
| `Home` / `End` | First / last scene |
| `1` – `5` | Jump to Part A, B, C, C2 or D |
| `G` | Grid overview of every scene |
| `M` | Toggle slide mode / scroll mode |
| `F` | Toggle fullscreen |
| `P` | Toggle the speaker-notes panel |
| `R` | Replay the current scene's animation |
| `T` | Toggle paper / ink theme |
| `?` | Keyboard help |
| `Esc` | Close the open overlay |

Arrow keys are ignored while a text field has focus, so the interactive
terminal playground and the grid search stay usable. Mode, presenter and grid
state persist in `localStorage` across reloads. On small or touch-first
screens the deck starts in scroll mode.

The top HUD is a 2px accent hairline with a mono `A B C C2 D` part indicator
at the bottom centre. The bottom-left chip shows the command of the scene —
click it to copy; the scene counter sits bottom-right. The top-right cluster
holds the mode toggle,
a visible **Calm** toggle (disables background effects and heavy animation)
and a **Sound** toggle (OFF by default; subtle Web Audio key/success/fail
tones, no audio files).

---

## Editing the scenes

**All scene content lives in one file: [`src/content/scenes.js`](src/content/scenes.js).**
You never need to touch a component to change wording, reorder a scene, or
add a bullet. (`src/content/slides.js` is a backwards-compatible re-export.)

### Scene shape

```js
{
  id: 'permissions',        // stable id, used as the React key
  part: 'B',                // intro | A | B | C | D | closing
  kind: 'blocks',           // 'part' = full-screen transition card
  badge: 'LIVE',            // LIVE | SLIDE | TAKE-HOME
  kicker: 'Part B · topic 14',
  title: 'File permissions: chmod and chown',
  lead: 'Toggle the bits. Watch the chmod number follow.',
  command: 'chmod 754 deploy.sh', // bottom-left chip; click copies
  notes: 'Speaker notes, shown in presenter mode (P).',
  bullets: ['One takeaway'],       // shortcut: appends one bullets block
  terminalScript: [                // shortcut: appends one scripted terminal
    { command: 'uname -m', output: 'x86_64', tone: 'green' },
  ],
  cols: 'split',            // optional: two-column body layout
  body: [ /* blocks below */ ],
}
```

One keyboard step reveals one top-level block, so order `body` as the reveal
order. Titles and leads stay visible throughout the scene.

### Block types

Every scene body is a declarative list of blocks. `src/slides/Blocks.jsx`
implements these:

| Block | Shape |
| --- | --- |
| `boot` | `{ title, subtitle, presenter }` — boot log into title, any key skips |
| `lead` | `{ text }` |
| `bullets` | `{ items: ['text' \| { text, tone, glyph }], cols: 2 }` |
| `cards` | `{ cols: 2, items: [{ title, subtitle, icon, tone, body }] }` |
| `callout` | `{ tone: 'warn'\|'bad'\|'good'\|'info', icon, title, body }` |
| `question` | `{ question, answer }` — classroom chip with reveal button |
| `terminal` | `{ title, steps: [{ cmd, out, tone }] }` — typed playback + replay |
| `playground` | `{ title }` — interactive fake terminal, in-memory filesystem |
| `directory` | `{ nodes: [{ label, note, type, color, children }] }` |
| `permissions` | `{ filename, initial }` — click r/w/x, chmod updates live |
| `pipe` | `{ cmd, stages: [{ cmd, out }], caption }` |
| `scheduler` | `{ processes, algorithm, quantum }` — CPU visualiser + compare |
| `disk` | `{ requests, head }` — disk head visualiser + compare |
| `paging` | `{ frames, refs }` — page fault stepper + Belady demo |
| `fault-types` | minor / major / invalid card |
| `platter` | spinning-disk cost diagram |
| `thrashing` | collapse-and-fix animation |
| `distro` | `{ title, questions, results }` — 5-question OS picker |
| `arch` | `{ output }` — x86_64 / ARM / RISC-V chips + `uname -m` |
| `deploy` | `{ title, steps: [{ id, command, detail }] }` — ticked flow |
| `packet` | `{ from, to }` — animated laptop-to-server packet |
| `containers` | `{ layers: [{ id, label, detail }] }` — stacked container visual |
| `archive` | `{ source, archive, command }` — folder-to-box animation |
| `table` | `{ head, columns: [{ key, title, tone }], rows: [{ label, <key>: value }] }` |
| `pipeline` | `{ stages: [{ id, label, cmd, detail, status }] }` |
| `push-duel` | `{ poisonous: {...}, healthy: {...} }` — split screen + swap |
| `dashboard` | `{ metrics: [{ label, value, tone }], processes: [...] }` |
| `timeline` | `{ events: [{ year, title, text, tone }] }` |
| `code` | `{ file, lines: [...], caption }` — revealed line by line |
| `quiz` | `{ title, questions, results }` |
| `keychip` | `{ text }` — e.g. `Ctrl + O · save` |
| `glow` | `{ title, subtitle, accent, body }` |
| `section-title` | `{ eyebrow, title, lead, part, badge }` |
| `split-panels` | `{ panels: [{ key, title, tone, commands: [...] }] }` |

Tones are `neutral`, `info`, `good` / `healthy`, `warn`, `bad` / `poison`, and
map to the palette in `src/lib/constants.js`.

### Presenter details

Edit `deckMeta` at the top of `scenes.js` for the title, your name, GitHub,
LinkedIn and email. Every fake credential and host name in the deck
(`FAKE_DEMO_KEY_DO_NOT_USE`, `203.0.113.7`) is a reserved documentation
range; replace them with your own before presenting.

---

## Structure

```
src/
  content/scenes.js     <- ALL scene content. Edit this.
  content/slides.js     <- backwards-compatible alias, do not edit
  App.jsx               deck shell: modes, rail, HUD, overlays, hotkeys
  index.css             theme tokens, type scale, reduced-motion rules
  lib/constants.js      palette, badge and part metadata, shortcuts
  lib/tokens.js         semantic tone palettes
  lib/sound.js          optional Web Audio tones (off by default)
  lib/clipboard.js      Clipboard-API copy helper, no deprecated APIs
  lib/os-sims/          deterministic scheduling engines + Vitest suites
    cpu.js              FCFS / SJF / Round Robin / Priority
    disk.js             FCFS / SSTF / SCAN / C-SCAN / LOOK
    paging.js           FIFO / LRU / Optimal + Belady demo
  hooks/
    useSlideNavigation.js  snap/scroll engine, hotkeys, fullscreen, toggles
    useSlideFit.js         per-scene viewport fitting
    useMotionPrefs.js      reduced-motion + calm-mode plumbing
    useTypewriter.js       typed-text hook
    useOverflowAudit.js    dev-only overflow warnings
  components/           SceneBackdrop (per-Part canvas: constellation, grid,
                        rack, circuit board, stream), BootSequence,
                        ScriptedTerminal, LiveTerminalPlayground,
                        DirectoryTree, PermissionExplorer, PipeFlow,
                        DistroPicker, ArchChips, DeployFlow, PipelineDiagram,
                        PushDuel, PacketHop, ContainerStack, ArchiveBox,
                        QuestionChip, KeyChip, GlowCard, SectionTitleCard,
                        DecodeText, SchedulerSim, DiskHeadSim, PageFaultSim,
                        FaultTypesCard, SpinningPlatter, ThrashingSim, Slide,
                        TerminalWindow, Card, CompareTable, Quiz, Badge, ...
  slides/
    Blocks.jsx          block -> component mapping
    renderSlide.jsx     scene -> layout + step-count mapping
.github/workflows/ci.yml  build + gitleaks secret scan
```

### A note on the type scale

Body prose never renders below **24px**, at any viewport, because that is the
floor for readability on a shared screen. Terminal transcripts, table cells and
code use a smaller "reference" tier; they are reference material rather than
reading text.

When you add content and a scene outgrows the viewport, fix it by shortening
the copy or changing the layout — not by shrinking the type. In development,
`useOverflowAudit` logs exactly which scene overflows and by how many pixels.

### Part C2 — Inside the OS

Eighteen scenes (`c2-title`, `c2-scheduler-what`, `c2-scheduler-algos`,
`c2-scheduler-sim`, `c2-linux-cfs`, `c2-proof-cpu`, `c2-disk-why`,
`c2-disk-algos`, `c2-disk-sim`, `c2-linux-iosched`, `c2-proof-disk`,
`c2-vm-picture`, `c2-fault-kinds`, `c2-replacement`, `c2-paging-sim`,
`c2-thrashing`, `c2-proof-mem`, `c2-bridge`) sit between Part C and Part D,
with their own pink progress segment, `1`–`5` part jump, title card
("PART C2 // INSIDE THE OS") and a calm circuit-board backdrop (removed in the editorial redesign; backgrounds are now flat).

The simulators are driven by `src/lib/os-sims/`, covered by
`npm test`. Verified reference values: disk FCFS 640 / SSTF 236 cylinders
(head 53); paging FIFO 15 / LRU 12 / Optimal 9 faults (3 frames, 20 refs);
Belady FIFO 9 faults (3 frames) vs 10 (4 frames).

### Motion and calm

One-shot transitions run 150–300ms with `cubic-bezier(0.2, 0, 0, 1)`;
reveals use opacity only with at most 60ms stagger. There are no ambient
background loops. `prefers-reduced-motion` makes everything instant, and the
visible **Calm** toggle forces zero motion (including CSS loops).

---

## Design system ("quiet technical editorial")

Tokens live as CSS variables in `src/index.css` (`:root` = paper,
`:root[data-theme='ink']` = ink); Tailwind tokens map onto them, so both
themes are fully designed, never auto-inverted. Toggle with `T`.

| Role | Paper | Ink |
| --- | --- | --- |
| bg / surface / subtle / rule | `#F6F4EF` / `#FFFFFF` / `#ECE9E1` / `#D9D5CA` | `#0E0F12` / `#15171B` / `#1C1F24` / `#2A2D33` |
| text primary / secondary / muted | `#14151A` / `#55575F` / `#6B6D75` | `#ECEDEF` / `#A4A7AE` / `#878C96` |
| accent (links, active, one highlight) | `#0B6E6E` | `#4FD1C5` |
| healthy / fail / warning (meaning only) | `#1F7A4D` / `#B3261E` / `#935A00` | `#5BC48A` / `#F2766E` / `#E0A84F` |

Type: Inter Variable (sans, 400/500/600) + JetBrains Mono Variable (code).
Scale 14 / 18 / 24 / 32 / 48 / 72 / 112px; body never below 24px on slides;
headings tight tracking, line-height 1.05–1.15, body 1.45.

Layout: 12-column grid, 8px base, ≥6vw outer margins, 1280px max width,
left-aligned scenes, 1px hairline rules instead of boxes, 6px max radius
(0 for terminals and tables), no shadows. Every scene has one focal element:
top-left mono `Part / N` marker and title, large left-aligned focal, command
chip bottom-left, counter bottom-right.

Components: flat `TerminalWindow` (muted prompt, primary command, secondary
output, 3-tone code), hairline `CompareTable` (tabular numbers, mono cells),
`PipelineDiagram` (flat nodes, red ✕ on failure, greyed downstream),
`DirectoryTree`, `PermissionExplorer`, `PipeFlow`, `PushDuel` (calm columns,
hairline divider, semantic status labels), `SchedulerSim`, `DiskHeadSim`,
`PageFaultSim`, `FaultTypesCard`, `Quiz`, `Timeline`, `Callout` (semantic
hairline rail), `QuestionChip`, `KeyChip`, `GlowCard`, `SectionTitleCard`,
`Badge` (flat label), `DecodeText` (heading descramble), plus the hairline
HUD, contact-sheet grid overview, plain notes drawer and shortcut table.

Contrast (computed): paper body 16.6, secondary 6.6, accent 5.5, healthy 4.8,
fail 6.0, warn 5.2; ink body 16.4, secondary 8.0, accent 10.3, healthy 8.9,
fail 6.9, warn 9.0 — AA everywhere, AAA for body text.

---

## CI

[`.github/workflows/ci.yml`](.github/workflows/ci.yml) runs on every push and
pull request: checkout with full history, Node 22, `npm ci`, `npm run build`, a
gitleaks secret scan, and `npm audit`.

Every third-party action is pinned to a full 40-character commit SHA, with the
version in a trailing comment, and `permissions: contents: read` limits what a
compromised step could reach. Tags like `@v4` can be repointed by whoever owns
the action repository, which would run unreviewed code with your workflow token.

---

## Deploying this deck

1. Push the repo to GitHub.
2. Build locally to verify: `npm ci && npm run build`.
3. Publish `dist/` to any static host (GitHub Pages, Netlify, Vercel, nginx).
4. For GitHub Pages: point Pages at the branch/folder holding `dist/`
   contents; the relative `base: './'` works under project paths.

---

## Licence and attribution

Slides, notes and demo content are yours to reuse and adapt. The commands and
tool names referenced are the property of their respective authors.
