/**
 * AUDIT ONLY — captures overlays, calm mode and interactive states.
 * No application source is touched.
 */
import { chromium } from 'playwright-core';
import { mkdirSync } from 'node:fs';
import { dirname, join } from 'node:path';
import { fileURLToPath } from 'node:url';

const ROOT = dirname(fileURLToPath(import.meta.url));
const BASE = process.argv[2] || 'http://localhost:5199/';
const OUT = join(ROOT, 'screens', 'extras');
mkdirSync(OUT, { recursive: true });
const { scenes } = await import('../src/content/scenes.js');

const sleep = (ms) => new Promise((r) => setTimeout(r, ms));
const idxOf = (id) => scenes.findIndex((s) => s.id === id);

const browser = await chromium.launch({
  executablePath: '/usr/bin/chromium',
  args: ['--no-sandbox', '--disable-dev-shm-usage', '--force-device-scale-factor=1'],
});

async function newPage(theme = 'paper') {
  const context = await browser.newContext({
    viewport: { width: 1920, height: 1080 },
    reducedMotion: 'no-preference',
  });
  await context.addInitScript((t) => {
    try {
      window.localStorage.setItem('deck.theme', t);
    } catch {}
  }, theme);
  const page = await context.newPage();
  await page.goto(BASE, { waitUntil: 'networkidle' });
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
  }
  return { context, page };
}

// Go to scene index by pressing End then stepping back? No — walk forward
// with G-grid search + click, which is also the realistic presenter path.
async function gotoScene(page, id) {
  const target = idxOf(id);
  if (target < 0) throw new Error('unknown scene ' + id);
  await page.keyboard.press('g');
  await sleep(500);
  await page.fill('#scene-search', id);
  // Wait until the filter settles to exactly one card: clicking while the
  // list re-renders under a stationary mouse hits the wrong card.
  await page.waitForFunction(
    () => document.querySelectorAll('li button').length === 1,
    null,
    { timeout: 8000 },
  );
  await sleep(300);
  const title = scenes[target].title ?? id;
  for (let attempt = 0; attempt < 3; attempt++) {
    const card = page.locator('li button', { hasText: title.slice(0, 18) }).first();
    await card.click();
    // Poll until centred on target AND scroll settles (absorbs any smooth
    // scroll still in flight instead of asserting a single instant).
    let stable = 0;
    let cur = -1;
    for (let w = 0; w < 40; w++) {
      await sleep(150);
      cur = await page.evaluate(() => {
        const els = [...document.querySelectorAll('[data-slide-index]')];
        const mid = window.innerHeight / 2;
        let best = -1;
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
      if (cur === target) {
        stable += 1;
        if (stable >= 3) break;
      } else {
        stable = 0;
      }
    }
    if (cur === target) return;
    // Reopen the grid and retry the click.
    await page.keyboard.press('g');
    await sleep(600);
    await page.fill('#scene-search', id);
    await page.waitForFunction(() => document.querySelectorAll('li button').length === 1, null, { timeout: 8000 });
    await sleep(300);
  }
  throw new Error(`goto ${id}: never centred on target`);
}

// Reveal all steps of the current scene.
async function revealAll(page, id) {
  const s = scenes[idxOf(id)];
  const flat = (x) => (Array.isArray(x) ? x.flatMap(flat) : [x]);
  let n = 1;
  if (s.kind === 'part') n = Math.max(1, s.agenda?.length ?? 0);
  else {
    n = flat(s.body || []).length;
    if (s.bullets?.length) n += 1;
    if (s.terminalScript?.length) n += 1;
  }
  for (let k = 1; k < n; k++) {
    await page.keyboard.press('ArrowRight');
    await sleep(350);
  }
  await sleep(1100);
}

const shot = (page, name) => page.screenshot({ path: join(OUT, name) });

// ---- overlays ----
{
  const { context, page } = await newPage('paper');
  await page.keyboard.press('g');
  await sleep(700);
  await shot(page, 'extra-grid.png');
  await page.keyboard.press('Escape');
  await sleep(400);
  await page.keyboard.press('p');
  await sleep(600);
  await shot(page, 'extra-notes.png');
  await page.keyboard.press('Escape');
  await sleep(400);
  await page.keyboard.press('?');
  await sleep(500);
  await shot(page, 'extra-help.png');
  await page.keyboard.press('Escape');
  await context.close();
  console.log('overlays done');
}

// ---- scheduler mid-run + calm ----
{
  const { context, page } = await newPage('paper');
  await gotoScene(page, 'c2-scheduler-sim');
  await sleep(1500); // mid auto-run
  await shot(page, 'extra-scheduler-midrun.png');
  await sleep(4000); // let it finish
  await shot(page, 'extra-scheduler-done.png');
  await page.getByRole('button', { name: /^Calm/ }).click();
  await sleep(600);
  await shot(page, 'extra-calm.png');
  await context.close();
  console.log('sim done');
}

// ---- quiz result ----
{
  const { context, page } = await newPage('paper');
  await gotoScene(page, 'choose-your-os');
  await revealAll(page, 'choose-your-os');
  const boxes = page.locator('fieldset');
  const count = await boxes.count();
  for (let i = 0; i < count; i++) {
    await boxes.nth(i).locator('button').first().click();
    await sleep(150);
  }
  await page.getByRole('button', { name: /reveal result/i }).click();
  await sleep(900);
  await shot(page, 'extra-quiz-result.png');
  await context.close();
  console.log('quiz done');
}

// ---- push duel, both themes (pass red/green differ per theme) ----
for (const theme of ['paper', 'ink']) {
  const { context, page } = await newPage(theme);
  await gotoScene(page, 'poisonous-vs-healthy');
  await revealAll(page, 'poisonous-vs-healthy');
  await sleep(3500); // both pipelines play out
  await shot(page, `extra-duel-${theme}.png`);
  await context.close();
  console.log('duel done', theme);
}

await browser.close();
console.log('extras complete');
