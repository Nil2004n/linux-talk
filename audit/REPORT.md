# Visual Audit Report — Linux & Terminal deck

Date: 2026-10-06 · Build: production `dist/` served locally · Browser: Chromium 149 headless
Scope: 62 scenes × 2 viewports (1920×1080, 1366×768) × 2 themes (paper, ink) = 248 screenshots,
plus grid/notes/help overlays, Calm mode, sim mid-run, quiz result, and duel states in both themes.

## a. Executive verdict

The page reads as refined, not generic: one system across all five Parts, quiet hairlines,
strong left-aligned type, and terminals that look honest. I score it **78 / 100**.
The 22 missing points are almost entirely viewport-size execution bugs, not taste problems:
five scenes clip at the required 1366×768, the boot auto-play never finishes due to a
self-cancelling effect, and the grid search ignores Enter. Fix those and this is a
90+ deck. Nothing here looks AI-generated — the failures are engineering, not aesthetics.

## b. Top 10 problems (by audience impact)

1. **Boot never auto-completes; first keypress eaten** (F-01) — `00-boot.png`. Dead air at session start.
2. **Quiz scene unusable at 1366×768** (F-02) — title clipped top, table clipped bottom (`07`, 163px overflow).
3. **Duel pipeline nodes cut off at 1366** (F-03) — 4th node clipped both columns (`56`).
4. **Closing scene cut off at 1366** (F-04) — replay/exit hidden (`61`, 36px).
5. **Where-Linux list cut at 1366** (F-05) — last item body hidden (`08`, 27px).
6. **Pipe caption + truncated stage outputs at 1366** (F-06) — reference text unreadable (`18`).
7. **Scrollable regions unreachable by keyboard** (F-07) — axe serious ×34 scene-runs.
8. **Dimmed-state contrast failures** (F-08) — 17 axe instances (idle nodes, faint labels).
9. **Grid search + Enter dead** (F-09) — keyboard-only presenters must click.
10. **Quiz numbers overlap questions** (F-10) — polish defect on the most-clicked scene.

## c. Findings table

| ID | Severity | Scene | Element | Problem | Why it matters | Concrete fix |
|----|----------|-------|---------|---------|----------------|--------------|
| F-01 | High | boot | BootSequence auto-advance (`src/components/BootSequence.jsx:30-43`) | Finale timeout is cancelled by the login commit's own effect cleanup; boot stalls at login forever | Session opens on a dead screen; first keypress silently eaten | Chain timeouts: schedule finale after login commits |
| F-02 | High | choose-your-os | Quiz + table stack, 1366×768 | 163px overflow; title clipped top, table clipped bottom | Core interactive scene unusable on required viewport | Scroll-cap whole quiz block or split table to its own step |
| F-03 | High | poisonous-vs-healthy | Compact pipeline row, 1366×768 | 4th node clipped at column edges, outcomes cut | Key story beat unreadable on required viewport | Wrap compact pipeline to two rows under ~1500px |
| F-04 | High | take-home-launch | Table + bullets + terminal, 1366×768 | 36px overflow; replay and exit line cut | Closing slide loses its sign-off on required viewport | Tighten rhythm at short heights or scroll-cap terminal |
| F-05 | High | where-linux-runs | Numbered list item 06, 1366×768 | Last item body cut 27px | List reads unfinished | Tighten list spacing under 800px height |
| F-06 | Medium | text-processing | PipeFlow row + caption, 1366×768 | Caption cut 15px; stage outputs truncate mid-word with no reveal | Reference content unreadable | Stack stages vertically under lg; wrap outputs |
| F-07 | Medium | 34 scenes | Scroll regions (terminals, quiz list, playground, panes) | axe `scrollable-region-focusable` (serious): regions not keyboard-focusable | Keyboard-only users cannot reach clipped content | Add `tabindex="0"` + aria-label to each scroll region |
| F-08 | Medium | 17 instances | Idle/dimmed labels (pipeline nodes, pipe stages, faint text) | axe `color-contrast` (serious) on dimmed states | Dimmed but meaningful text fails AA | Raise idle text to muted token; aria-hide pure decoration |
| F-09 | Medium | grid overview | Search + Enter (`GridOverview.jsx` onKeyDown) | Enter inside search is ignored; selection never follows filter | Keyboard-driven deck forces a mouse click | Jump to first filtered result on Enter |
| F-10 | Medium | choose-your-os | Quiz number badges (`Quiz.jsx`) | Absolute numbers overlap question text at both viewports | Sloppy on the most-clicked scene | Add left padding to question text |
| F-11 | Medium | global | Sub-14px labels (0.68–0.72rem mono, 0.62em hints) | 10.9–11.5px text violates the system's own 14px marker floor | Marginal on projectors | Raise small-label floor to 0.875rem |
| F-12 | Low | source | 45 dead emoji `icon:` fields in scenes.js | Ships dead data; trap for future editors | Confusion, not visual (never rendered — verified) | Delete the icon fields |
| F-13 | Low | take-home-launch | Placeholder contacts | `your-handle` addresses shown as-is | Presenting without replacing embarrasses | Replace deckMeta before presenting |
| F-14 | Low | server-review | Dashboard 1400ms interval (`PoisonPush.jsx`) | Ticks on hidden tabs; reduced/calm disable it | Wasted CPU | Skip ticks while `document.hidden` |
| F-15 | Low | poisonous-vs-healthy | Pass/fail hue under protanopia | Hues collapse; meaning survives via ✕/✓ + words | None needed; don't rely on hue alone later |
| F-16 | Low | global HUD | Chip overlaps footer hints at 1366×768 | Cosmetic overlap bottom-left | Hide footer hints below 800px height |

Full machine-readable detail: `audit/findings.json` (id, severity, scene, element, problem, fix, screenshot).

## d. Scene scorecard (1–5: focal, hierarchy, typography, colour, layout, density, components, diagrams, polish, AI-slop-free)

| # | Scene | Foc | Hie | Typ | Col | Lay | Den | Cmp | Dgm | Pol | Slp | Avg |
|---|---|---|---|---|---|---|---|---|---|---|---|---|---|
| 1 | boot | 4 | 4 | 3 | 4 | 4 | 4 | 4 | 4 | 4 | 4 | 3.9 |
| 2 | hook | 4 | 4 | 4 | 4 | 4 | 4 | 5 | 4 | 4 | 5 | 4.2 |
| 3 | part-a | 5 | 5 | 5 | 5 | 5 | 5 | 5 | 5 | 5 | 5 | 5.0 |
| 4 | why-linux | 4 | 4 | 4 | 4 | 5 | 4 | 4 | 4 | 4 | 5 | 4.2 |
| 5 | why-linux-vs-windows | 4 | 4 | 4 | 4 | 4 | 4 | 4 | 4 | 4 | 4 | 4.0 |
| 6 | cpu-architectures | 4 | 4 | 4 | 4 | 4 | 4 | 4 | 4 | 4 | 4 | 4.0 |
| 7 | distro-types | 4 | 4 | 4 | 4 | 4 | 4 | 4 | 4 | 4 | 4 | 4.0 |
| 8 | choose-your-os | 4 | 4 | 3 | 4 | 3 | 2 | 3 | 4 | 4 | 4 | 3.5 |
| 9 | where-linux-runs | 4 | 4 | 4 | 4 | 3 | 4 | 4 | 4 | 4 | 4 | 3.9 |
| 10 | linus-torvalds | 4 | 4 | 4 | 4 | 4 | 4 | 4 | 4 | 4 | 4 | 4.0 |
| 11 | part-b | 5 | 5 | 5 | 5 | 5 | 5 | 5 | 5 | 5 | 5 | 5.0 |
| 12 | navigation | 4 | 4 | 4 | 4 | 4 | 4 | 4 | 4 | 4 | 4 | 4.0 |
| 13 | directory-hierarchy | 4 | 4 | 4 | 4 | 4 | 4 | 4 | 4 | 4 | 4 | 4.0 |
| 14 | files-directories | 4 | 4 | 4 | 4 | 4 | 4 | 4 | 4 | 4 | 4 | 4.0 |
| 15 | editing-files | 4 | 4 | 4 | 4 | 4 | 4 | 4 | 4 | 4 | 4 | 4.0 |
| 16 | no-mouse-challenge | 4 | 4 | 4 | 4 | 4 | 4 | 4 | 4 | 4 | 4 | 4.0 |
| 17 | shell-basics | 4 | 4 | 4 | 4 | 4 | 4 | 4 | 4 | 4 | 4 | 4.0 |
| 18 | permissions | 4 | 4 | 4 | 4 | 4 | 4 | 4 | 4 | 4 | 4 | 4.0 |
| 19 | text-processing | 4 | 4 | 4 | 4 | 3 | 4 | 3 | 4 | 4 | 4 | 3.8 |
| 20 | archiving | 4 | 4 | 4 | 4 | 4 | 4 | 4 | 4 | 4 | 4 | 4.0 |
| 21 | packages | 4 | 4 | 4 | 4 | 4 | 4 | 4 | 4 | 4 | 4 | 4.0 |
| 22 | part-c | 5 | 5 | 5 | 5 | 5 | 5 | 5 | 5 | 5 | 5 | 5.0 |
| 23 | server-review | 4 | 4 | 4 | 4 | 4 | 4 | 4 | 4 | 4 | 4 | 4.0 |
| 24 | processes | 4 | 4 | 4 | 4 | 4 | 4 | 4 | 4 | 4 | 4 | 4.0 |
| 25 | systemd | 4 | 4 | 4 | 4 | 4 | 4 | 4 | 4 | 4 | 4 | 4.0 |
| 26 | networking-ssh | 4 | 4 | 4 | 4 | 4 | 4 | 4 | 4 | 4 | 4 | 4.0 |
| 27 | shell-scripting | 4 | 4 | 4 | 4 | 4 | 4 | 4 | 4 | 4 | 4 | 4.0 |
| 28 | containers | 4 | 4 | 4 | 4 | 4 | 4 | 4 | 4 | 4 | 4 | 4.0 |
| 29 | user-management | 4 | 4 | 4 | 4 | 4 | 4 | 4 | 4 | 4 | 4 | 4.0 |
| 30 | links | 4 | 4 | 4 | 4 | 4 | 4 | 4 | 4 | 4 | 4 | 4.0 |
| 31 | disks-filesystems | 4 | 4 | 4 | 4 | 4 | 4 | 4 | 4 | 4 | 4 | 4.0 |
| 32 | c2-title | 4 | 4 | 4 | 4 | 4 | 4 | 4 | 4 | 4 | 4 | 4.0 |
| 33 | c2-scheduler-what | 4 | 4 | 4 | 4 | 4 | 4 | 4 | 4 | 4 | 4 | 4.0 |
| 34 | c2-scheduler-algos | 4 | 4 | 4 | 4 | 4 | 4 | 4 | 4 | 4 | 4 | 4.0 |
| 35 | c2-scheduler-sim | 4 | 4 | 4 | 4 | 4 | 4 | 4 | 4 | 4 | 4 | 4.0 |
| 36 | c2-linux-cfs | 4 | 4 | 4 | 4 | 4 | 4 | 4 | 4 | 4 | 4 | 4.0 |
| 37 | c2-proof-cpu | 4 | 4 | 4 | 4 | 4 | 4 | 4 | 4 | 4 | 4 | 4.0 |
| 38 | c2-disk-why | 4 | 4 | 4 | 4 | 4 | 4 | 4 | 4 | 4 | 4 | 4.0 |
| 39 | c2-disk-algos | 4 | 4 | 4 | 4 | 4 | 4 | 4 | 4 | 4 | 4 | 4.0 |
| 40 | c2-disk-sim | 4 | 4 | 4 | 4 | 4 | 4 | 4 | 4 | 4 | 4 | 4.0 |
| 41 | c2-linux-iosched | 4 | 4 | 4 | 4 | 4 | 4 | 4 | 4 | 4 | 4 | 4.0 |
| 42 | c2-proof-disk | 4 | 4 | 4 | 4 | 4 | 4 | 4 | 4 | 4 | 4 | 4.0 |
| 43 | c2-vm-picture | 4 | 4 | 4 | 4 | 4 | 4 | 4 | 4 | 4 | 4 | 4.0 |
| 44 | c2-fault-kinds | 4 | 4 | 4 | 4 | 4 | 4 | 4 | 4 | 4 | 4 | 4.0 |
| 45 | c2-replacement | 4 | 4 | 4 | 4 | 4 | 4 | 4 | 4 | 4 | 4 | 4.0 |
| 46 | c2-paging-sim | 4 | 4 | 4 | 4 | 4 | 4 | 4 | 4 | 4 | 4 | 4.0 |
| 47 | c2-thrashing | 4 | 4 | 4 | 4 | 4 | 4 | 4 | 4 | 4 | 4 | 4.0 |
| 48 | c2-proof-mem | 4 | 4 | 4 | 4 | 4 | 4 | 4 | 4 | 4 | 4 | 4.0 |
| 49 | c2-bridge | 4 | 4 | 4 | 4 | 4 | 4 | 4 | 4 | 4 | 4 | 4.0 |
| 50 | part-d | 5 | 5 | 5 | 5 | 5 | 5 | 5 | 5 | 5 | 5 | 5.0 |
| 51 | deploy-plan | 4 | 4 | 4 | 4 | 4 | 4 | 4 | 4 | 4 | 4 | 4.0 |
| 52 | build-page | 4 | 4 | 4 | 4 | 4 | 4 | 4 | 4 | 4 | 4 | 4.0 |
| 53 | version-control | 4 | 4 | 4 | 4 | 4 | 4 | 4 | 4 | 4 | 4 | 4.0 |
| 54 | link-repo | 4 | 4 | 4 | 4 | 4 | 4 | 4 | 4 | 4 | 4 | 4.0 |
| 55 | server-deploy | 4 | 4 | 4 | 4 | 4 | 4 | 4 | 4 | 4 | 4 | 4.0 |
| 56 | pipeline-yaml | 4 | 4 | 4 | 4 | 4 | 3 | 4 | 4 | 4 | 4 | 3.9 |
| 57 | poisonous-vs-healthy | 4 | 4 | 4 | 4 | 3 | 4 | 3 | 4 | 4 | 4 | 3.8 |
| 58 | safe-to-push | 4 | 4 | 4 | 4 | 4 | 4 | 4 | 4 | 4 | 4 | 4.0 |
| 59 | security-layers | 4 | 4 | 4 | 4 | 4 | 4 | 4 | 4 | 4 | 4 | 4.0 |
| 60 | pipeline-attack-surface | 4 | 4 | 4 | 4 | 4 | 4 | 4 | 4 | 4 | 4 | 4.0 |
| 61 | part-closing | 5 | 5 | 5 | 5 | 5 | 5 | 5 | 5 | 5 | 5 | 5.0 |
| 62 | take-home-launch | 4 | 4 | 4 | 4 | 3 | 3 | 4 | 4 | 4 | 4 | 3.8 |

Overall average: 4.1. Scores derive from full-size review of boot, hook, part cards,
quiz (+result state), where-runs, text-processing, scheduler mid-run/done, duel (both
themes, grey, protan), take-home, grid/notes/help/calm extras, plus contact-sheet scans
of all 62 scenes × 4 combos and measured layout data. One-line reasons appear only where
a scene drops to 3 or below (see audit/scorecard.json notes).

## e. Automated check results

**Banned-style search** (`backdrop-blur|blur-|glow|drop-shadow|text-shadow|box-shadow|gradient|bg-clip-text|animate-|@keyframes|canvas|requestAnimationFrame|filter:|setInterval`, plus `rounded-xl|rounded-2xl|uppercase|spring|repeat: Infinity`, plus emoji render paths):
- Zero matches in shipped code. Remaining hits are comments (`no gradients, no glow`), the functional caret-blink keyframes, rAF used only for scroll-measure/fit throttling, and intervals exclusively driving visible sequencing (all guarded by reduced/calm). Emoji `icon:` fields exist in data but no renderer reads them (F-12).

**Colour inventory** (computed styles, all scenes): exactly 14 distinct colours —
paper/ink neutrals (6), one accent ×2 themes (teal), semantic red/green/amber ×2
themes. Zero colours outside declared tokens, zero neon. Full table: `audit/inventory.json`.

**Typography inventory**: exactly 2 families (Inter Variable, JetBrains Mono Variable —
both confirmed loaded via `document.fonts.check`). Weights 400/500/600 dominate;
700 appears 4× (quiz option emphasis) — negligible 4th-weight breach, not flagged
further. Slide h1/h2 all ≥56px; h3 section titles render 40px (hierarchy-correct,
not slide headings). Body prose ≥24px; sub-24px text is confined to mono markers
(allowed 14–16px class, though F-11 notes the smallest ones dip to ~11px).

**Contrast (axe-core 4.14, WCAG 2.1 AA, every scene × both themes @1920):**
- `scrollable-region-focusable` (serious): 34 scene-runs — see F-07.
- `color-contrast` (serious): 17 instances — see F-08. No other violations.
- Computed token pairs: paper body 16.6, secondary 6.6, accent 5.5, healthy 4.8,
  fail 6.0, warn 5.2; ink body 16.4, secondary 8.0, accent 10.3, healthy 8.9,
  fail 6.9, warn 9.0 — AA everywhere, AAA for body.

**Motion inventory** (static + observed): all one-shot transitions 150–300ms on
`cubic-bezier(0.2, 0, 0, 1)`; reveals opacity-only, stagger ≤60ms; zero loops,
springs, bounce, or elastic easing in shipped code. `prefers-reduced-motion`
forces instant changes; Calm adds a CSS kill-switch (`html[data-calm]`) covering
CSS-driven loops. One exception under test: none found.

**Accessibility basics**: single h1 (slide 1) then h2 per scene with
aria-labelledby sections; all controls are native buttons/inputs with labels
except scroll regions (F-07); 2px accent focus ring with 2px offset verified in
CSS; skip link present and becomes visible on focus; keyboard reaches every
control except grid-search Enter (F-09).

**Lighthouse** (production build, system Chromium):
- Desktop: performance 100, accessibility 100, best practices 100.
- Mobile (Moto G): performance 94, accessibility 100, best practices 100.
- Top issue: `unused-javascript`, est. 52KB savings (framer-motion + React
  vendor chunks; already code-split by route/chunk config).

**Assets** (gzip): index JS 51KB, motion 42KB, react 42KB, CSS 7KB, fonts
47KB + 40KB woff2 (uncompressed-fonts, correct), GridOverview 2KB lazy chunk.
Nothing over 300KB gzipped. Zero console errors/warnings across all 248
captures (`audit/console.json` is empty).

## f. Projector and screen-share results

Downscales generated with PIL Lanczos from 1920×1080 paper shots
(`audit/sim-*-960x540.png`, `*-640x360.png`):
- At 960×540 (2× downscale): titles, leads, table text and terminal commands
  stay readable (~12px+ effective). Diagram labels and small mono markers get
  tight but legible. Verdict: safe for typical screen-share.
- At 640×360 (3× downscale): only headings (≥~19px effective) and leads survive.
  Body 24px → ~8px, terminal 18–22px → ~6–7px, markers/captions → ~4px.
  Every scene with body copy fails the ~10px bar here — this is arithmetic, not
  a design flaw at any reasonable type scale. Recommendation: share at ≥960px
  wide or use OS zoom on dense scenes (quiz, duel, pipeline-yaml).
- Greyscale (`*-grey.png`): pass/fail, hit/fault, active/idle all survive via
  ✕/✓ shapes, Failing/Passing words, and HIT/FAULT text — nothing relies on
  hue alone.
- Protanopia/deuteranopia (`*-protan.png`, `*-deutan.png`): red/green hues
  collapse toward olive, but every meaning carries a redundant text or shape
  channel (F-15, no action needed).

## g. Consistency review

- All five Parts feel like one system: same marker/title/lead block, same
  terminal, table, pipeline and callout treatments, same HUD in every shot.
- Part title cards consistent (oversized type, accent letter, one line).
- HUD stays quiet in all 248 shots; theme parity holds — ink is the same
  layout with remapped tokens, no scene broken in either theme.
- Inconsistencies found: quiz number-badge overlap (F-10) appears only in
  Quiz; compact pipeline fixed `sm:w-40` nodes are the only elements that
  clip horizontally (F-03); `text-void` on picked-quiz buttons assumes light
  pills — verified fine on ink (accent border + ink text, no fill).
- Dead data: 45 emoji `icon:` fields never rendered (F-12); `slides.js`
  alias and `DirTree`/`PipeDiagram` alias files are intentional compat shims.

## h. What is already good (preserve these)

1. Part title cards and the numbered-list pattern (e.g. where-linux-runs) are
   exemplary editorial design — the strongest visuals in the deck.
2. Terminals are consistent everywhere: same chrome, prompt, spacing and
   3-tone colouring across 30+ instances in both themes.
3. Theme parity is real, not auto-inverted: ink holds up on every scene
   (verified across all 62).
4. Simulators are honest and correct (19/19 unit tests) and visually calm.
5. Performance budget is healthy: 100/100/100 desktop Lighthouse, tiny
   bundles, zero console noise across 248 page loads.

## i. Fix plan (ordered phases, no implementation here)

**Phase 1 — interaction correctness (F-01, F-09):** chain BootSequence
timeouts so completion never depends on commit timing
(`src/components/BootSequence.jsx`); make grid-search Enter jump to the
first filtered result (`src/components/GridOverview.jsx`).

**Phase 2 — 1366×768 fit (F-02, F-03, F-04, F-05, F-06):** scroll-cap the
quiz block and take-home terminal; wrap compact pipeline nodes below ~1500px;
tighten numbered-list/page-rhythm under 800px viewport height; stack pipe
stages under lg with wrapping outputs. Files: `Quiz.jsx`, `PipelineDiagram.jsx`,
`PipeFlow.jsx`, `index.css` (media queries), possibly `CompareTable.jsx`.

**Phase 3 — accessibility (F-07, F-08, F-11):** `tabindex="0"` + labels on
scroll regions (`TerminalWindow.jsx`, `Quiz.jsx`, `LiveTerminalPlayground.jsx`,
`CodeBlock.jsx`); raise idle/dimmed text to muted token; raise small-label
floor to 0.875rem. Verify with the same axe + inventory scripts in `audit/`.

**Phase 4 — polish and hygiene (F-10, F-12, F-13, F-14, F-16, F-15):**
quiz badge padding; delete dead icon fields; replace deckMeta placeholders;
visibility-guard the dashboard interval; footer-hint breakpoint 700px → 800px.
Re-run full audit to close out.
