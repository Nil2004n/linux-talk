import { scenes } from '../src/content/scenes.js';
import { writeFileSync } from 'node:fs';

const dims = ['focal', 'hierarchy', 'typography', 'colour', 'layout', 'density', 'components', 'diagrams', 'polish', 'slop'];
const rows = scenes.map((s, i) => ({
  n: i, id: s.id, part: s.part, title: s.title || '(part card)',
  scores: Object.fromEntries(dims.map((d) => [d, 4])), note: '',
}));
const byId = (id) => rows.find((r) => r.id === id);
const set = (id, patch, note) => {
  const r = byId(id);
  Object.assign(r.scores, patch);
  r.note = note;
};
const all5 = (ids) => ids.forEach((id) => {
  const r = byId(id);
  Object.keys(r.scores).forEach((k) => { r.scores[k] = 5; });
});

all5(['part-a', 'part-b', 'part-c', 'part-d', 'part-closing']);
set('boot', { typography: 3 }, 'markers and login text render 12-15px');
set('hook', { components: 5, slop: 5 }, '');
set('why-linux', { layout: 5, slop: 5 }, 'numbered list is the pattern working as intended');
set('choose-your-os', { density: 2, layout: 3, components: 3, typography: 3 }, 'quiz plus table overflows 1366 by 163px; title clipped; number badges overlap questions');
set('where-linux-runs', { layout: 3 }, 'last item body cut 27px at 1366');
set('text-processing', { layout: 3, components: 3 }, 'caption cut and pipe outputs truncated at 1366');
set('poisonous-vs-healthy', { layout: 3, components: 3 }, 'fourth pipeline node clipped horizontally at 1366');
set('take-home-launch', { layout: 3, density: 3 }, 'replay control and exit line cut 36px at 1366');
set('c2-scheduler-sim', { density: 4, components: 4 }, 'dense but fits; mid-run state verified');
set('pipeline-yaml', { density: 3 }, 'pipeline plus 12-line YAML is the densest compliant scene');

const out = rows.map((r) => {
  const v = Object.values(r.scores);
  return { ...r, avg: +(v.reduce((a, b) => a + b, 0) / v.length).toFixed(1) };
});
writeFileSync(new URL('./scorecard.json', import.meta.url), JSON.stringify(out, null, 1));
console.log('overall avg:', (out.reduce((a, r) => a + r.avg, 0) / out.length).toFixed(1));
