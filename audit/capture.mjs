/**
 * AUDIT ONLY — drives the built site, captures screenshots + measurements.
 * No application source is touched.
 *
 * Usage: node audit/capture.mjs [baseUrl]
 * Output: audit/screens/<viewport>/<theme>/<nn>-<id>.png + JSON data files.
 */
import { chromium } from 'playwright-core';
import { readFileSync, writeFileSync, mkdirSync } from 'node:fs';
import { dirname, join } from 'node:path';
import { fileURLToPath } from 'node:url';
import { createRequire } from 'node:module';

const require = createRequire(import.meta.url);
const axeSource = readFileSync(join(dirname(require.resolve('axe-core/package.json')), 'axe.js'), 'utf8');

const ROOT = join(dirname(fileURLToPath(import.meta.url)));
const BASE = process.argv[2] || 'http://localhost:5199/';
const { scenes: allScenes } = await import('../src/content/scenes.js');
const scenes = process.env.SCENES_MAX ? allScenes.slice(0, Number(process.env.SCENES_MAX)) : allScenes;

const asArray = (x) => (Array.isArray(x) ? x : [x]);
const flattenBody = (body) => asArray(body).flatMap((g) => (Array.isArray(g) ? g : [g]));
function foldKeychips(blocks) {
  const out = [];
  for (const b of blocks) {
    const p = out[out.length - 1];
    if (b?.type === 'keychip' && p?.type === 'keychips') p.items.push(b);
    else if (b?.type === 'keychip') out.push({ type: 'keychips', items: [b] });
    else out.push(b);
  }
  return out;
}
function stepCount(s) {
  if (s.kind === 'part') return Math.max(1, s.agenda?.length ?? 0);
  let n = foldKeychips(flattenBody(s.body)).length;
  if (s.bullets?.length) n += 1;
  if (s.terminalScript?.length) n += 1;
  return Math.max(1, n);
}

const sleep = (ms) => new Promise((r) => setTimeout(r, ms));
const VP = [
  { name: '1920x1080', w: 1920, h: 1080 },
  { name: '1366x768', w: 1366, h: 768 },
];
const THEMES = ['paper', 'ink'];

const consoleLog = [];
const layoutRows = [];
const axeRows = [];
const styleSamples = [];

const browser = await chromium.launch({
  executablePath: '/usr/bin/chromium',
  args: ['--no-sandbox', '--disable-dev-shm-usage', '--force-device-scale-factor=1'],
});

async function centeredIndex(page) {
  return page.evaluate(() => {
    const els = [...document.querySelectorAll('[data-slide-index]')];
    const mid = window.innerHeight / 2;
    let best = 0;
    let bestD = Infinity;
    for (const el of els) {
      const r = el.getBoundingClientRect();
      const d = Math.abs(r.top + r.height / 2 - mid);
      if (d < bestD) {
        bestD = d;
        best = Number(el.dataset.slideIndex);
      }
    }
    return best;
  });
}

async function measureLayout(page, vp, theme, idx, id) {
  const row = await page.evaluate((i) => {
    const sec = document.querySelector(`[data-slide-index="${i}"]`);
    const out = { overflowY: 0, overflowX: false, ellipsis: 0, tinyText: 0 };
    if (!sec) return { missing: true };
    const inner = sec.firstElementChild;
    if (inner) {
      out.overflowY = Math.max(0, inner.scrollHeight - inner.clientHeight);
      out.overflowX = inner.scrollWidth > inner.clientWidth + 1;
    }
    const walker = document.createTreeWalker(sec, NodeFilter.SHOW_ELEMENT);
    let el;
    while ((el = walker.nextNode())) {
      const cs = getComputedStyle(el);
      if (cs.textOverflow === 'ellipsis' && el.textContent.trim()) out.ellipsis += 1;
      if (el.textContent.trim() && el.children.length === 0) {
        const fs = parseFloat(cs.fontSize);
        if (fs < 12) out.tinyText += 1;
      }
    }
    // rail-level horizontal overflow
    const rail = document.querySelector('main');
    out.railOverflowX = rail ? rail.scrollWidth > rail.clientWidth + 1 : false;
    return out;
  }, idx);
  layoutRows.push({ vp, theme, idx, id, ...row });
}

async function sampleStyles(page, vp, theme, idx, id) {
  const rows = await page.evaluate((i) => {
    const sec = document.querySelector(`[data-slide-index="${i}"]`);
    if (!sec) return [];
    const out = [];
    sec.querySelectorAll('h1,h2,h3,p,code,pre,button,a,li,td,th').forEach((el) => {
      const cs = getComputedStyle(el);
      const text = (el.innerText || '').trim().slice(0, 60);
      if (!text && el.tagName !== 'BUTTON') return;
      out.push({
        tag: el.tagName.toLowerCase(),
        cls: el.className?.baseVal ?? el.className ?? '',
        font: cs.fontFamily.split(',')[0].replace(/['"]/g, ''),
        weight: cs.fontWeight,
        size: cs.fontSize,
        lh: cs.lineHeight,
        ls: cs.letterSpacing,
        color: cs.color,
        text,
      });
    });
    return out;
  }, idx);
  for (const r of rows) styleSamples.push({ vp, theme, idx, id, ...r });
}

async function runAxe(page, vp, theme, idx, id) {
  const res = await page.evaluate(async () => {
    const r = await window.axe.run(document, {
      resultTypes: ['violations'],
      runOnly: ['wcag2a', 'wcag2aa', 'wcag21aa'],
    });
    return r.violations.map((v) => ({
      id: v.id,
      impact: v.impact,
      help: v.help,
      nodes: v.nodes.map((n) => ({
        target: n.target,
        html: (n.html || '').slice(0, 200),
        failure: (n.failureSummary || '').slice(0, 300),
      })),
    }));
  });
  axeRows.push({ vp, theme, idx, id, violations: res });
}

for (const vp of VP) {
  for (const theme of THEMES) {
    const context = await browser.newContext({
      viewport: { width: vp.w, height: vp.h },
      colorScheme: theme === 'ink' ? 'dark' : 'light',
      reducedMotion: 'no-preference',
    });
    await context.addInitScript((t) => {
      try {
        window.localStorage.setItem('deck.theme', t);
      } catch {}
    }, theme);
    const page = await context.newPage();
    page.on('console', (m) => {
      if (m.type() === 'error' || m.type() === 'warning') {
        consoleLog.push({ vp: vp.name, theme, type: m.type(), text: m.text().slice(0, 300) });
      }
    });
    page.on('pageerror', (e) => consoleLog.push({ vp: vp.name, theme, type: 'pageerror', text: String(e).slice(0, 300) }));
    await page.goto(BASE, { waitUntil: 'networkidle' });
    await page.evaluate(axeSource);
    // Boot pre-roll: wait for the boot title deterministically (mount +
    // animation take a variable 2-5s). If it stalls in login phase (audit
    // finding F-01), one sacrificial press skips it instead of poisoning
    // every later keypress.
    const bootTitled = () =>
      page.evaluate(() => document.body.innerText.includes('presented by'));
    let titled = false;
    for (let w = 0; w < 30 && !titled; w++) {
      await sleep(500);
      titled = await bootTitled();
    }
    if (!titled) {
      await page.keyboard.press('Space');
      await sleep(800);
      titled = await bootTitled();
      if (!titled) {
        consoleLog.push({ vp: vp.name, theme, type: 'bootstuck', text: 'boot title never resolved' });
      }
    }

    // helper: wait until the viewport-centred scene equals target
    async function awaitScene(target, timeout = 4000) {
      const t0 = Date.now();
      for (;;) {
        const cur = await centeredIndex(page);
        if (cur === target) return true;
        if (Date.now() - t0 > timeout) return false;
        await sleep(120);
      }
    }

    for (let i = 0; i < scenes.length; i++) {
      const s = scenes[i];
      const steps = stepCount(s);
      // advance through this scene's reveal steps (stay on the scene)
      for (let k = 1; k < steps; k++) {
        await page.keyboard.press('ArrowRight');
        await sleep(300);
        const cur = await centeredIndex(page);
        if (cur !== i) break; // moved on (e.g. boot skip consumed a press)
      }
      await sleep(s.id === 'boot' ? 2600 : 1150);
      const cur = await centeredIndex(page);
      if (cur !== i) {
        consoleLog.push({ vp: vp.name, theme, type: 'navdrift', text: `expected ${i} got ${cur}` });
      }
      const dir = join(ROOT, 'screens', vp.name, theme);
      mkdirSync(dir, { recursive: true });
      const shot = join(dir, `${String(i).padStart(2, '0')}-${s.id}.png`);
      await page.screenshot({ path: shot });
      await measureLayout(page, vp.name, theme, i, s.id);
      await sampleStyles(page, vp.name, theme, i, s.id);
      if (vp.name === '1920x1080') await runAxe(page, vp.name, theme, i, s.id);
      if (i < scenes.length - 1) {
        // Retry: a press can be swallowed (e.g. boot-skip consumes it).
        let arrived = false;
        for (let attempt = 0; attempt < 4 && !arrived; attempt++) {
          await page.keyboard.press('ArrowRight');
          arrived = await awaitScene(i + 1, 2500);
        }
        if (!arrived) {
          consoleLog.push({ vp: vp.name, theme, type: 'navtimeout', text: `never centred on ${i + 1}` });
        }
        await sleep(200);
      }
    }
    await context.close();
    console.log(`done ${vp.name} ${theme}`);
  }
}

await browser.close();
mkdirSync(join(ROOT), { recursive: true });
writeFileSync(join(ROOT, 'console.json'), JSON.stringify(consoleLog, null, 1));
writeFileSync(join(ROOT, 'layout.json'), JSON.stringify(layoutRows, null, 1));
writeFileSync(join(ROOT, 'axe.json'), JSON.stringify(axeRows, null, 1));
writeFileSync(join(ROOT, 'styles.json'), JSON.stringify(styleSamples, null, 1));
console.log('capture complete');
