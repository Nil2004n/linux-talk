/**
 * AUDIT ONLY — aggregates capture data into inventories.
 * Usage: node audit/analyze.mjs
 * Reads: layout.json, axe.json, styles.json, console.json
 * Writes: audit/inventory.json
 */
import { readFileSync, writeFileSync } from 'node:fs';
import { dirname, join } from 'node:path';
import { fileURLToPath } from 'node:url';

const ROOT = dirname(fileURLToPath(import.meta.url));
const load = (n) => JSON.parse(readFileSync(join(ROOT, n), 'utf8'));
const layout = load('layout.json');
const axe = load('axe.json');
const styles = load('styles.json');
const logs = load('console.json');

const norm = (c) =>
  c.replace(/\s+/g, '').toLowerCase().replace(/^rgba?\((\d+),(\d+),(\d+)(,1)?\)$/, 'rgb($1,$2,$3)');

// ---- colours ----
const colorUses = {};
for (const s of styles) {
  const c = norm(s.color);
  if (!colorUses[c]) colorUses[c] = { count: 0, tags: new Set(), scenes: new Set() };
  colorUses[c].count += 1;
  colorUses[c].tags.add(s.tag);
  colorUses[c].scenes.add(`${s.idx}-${s.id}`);
}
const colors = Object.entries(colorUses)
  .map(([color, v]) => ({ color, uses: v.count, tags: [...v.tags], scenes: v.scenes.size }))
  .sort((a, b) => b.uses - a.uses);

// ---- typography ----
const fonts = {};
for (const s of styles) {
  const key = `${s.font}|${s.weight}|${s.size}`;
  if (!fonts[key]) fonts[key] = { count: 0, ex: [] };
  fonts[key].count += 1;
  if (fonts[key].ex.length < 3) fonts[key].ex.push(`${s.idx}-${s.id} <${s.tag}> ${s.text.slice(0, 40)}`);
}
const typeRows = Object.entries(fonts)
  .map(([k, v]) => {
    const [font, weight, size] = k.split('|');
    return { font, weight, size, uses: v.count, examples: v.ex };
  })
  .sort((a, b) => b.uses - a.uses);

// ---- layout ----
const overflows = layout.filter((r) => r.overflowY > 4 || r.overflowX || r.railOverflowX);
const ellipsis = layout.filter((r) => r.ellipsis > 0);
const tiny = layout.filter((r) => r.tinyText > 0);

// ---- axe ----
const axeSummary = {};
for (const r of axe) {
  for (const v of r.violations) {
    const k = `${v.id}|${v.impact}`;
    if (!axeSummary[k]) axeSummary[k] = { id: v.id, impact: v.impact, help: v.help, scenes: [] };
    axeSummary[k].scenes.push(`${r.vp}/${r.theme}/${r.idx}-${r.id} (${v.nodes.length} nodes)`);
  }
}

// ---- console ----
const consoleIssues = logs;

writeFileSync(
  join(ROOT, 'inventory.json'),
  JSON.stringify(
    {
      colors,
      typography: typeRows,
      overflows,
      ellipsis: ellipsis.map((r) => ({ vp: r.vp, theme: r.theme, idx: r.idx, id: r.id, n: r.ellipsis })),
      tinyText: tiny.map((r) => ({ vp: r.vp, theme: r.theme, idx: r.idx, id: r.id, n: r.tinyText })),
      axe: Object.values(axeSummary),
      console: consoleIssues,
    },
    null,
    1,
  ),
);
console.log(
  `colors=${colors.length} typefaces=${typeRows.length} overflows=${overflows.length} axeRules=${Object.keys(axeSummary).length} console=${consoleIssues.length}`,
);
