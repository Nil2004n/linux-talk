const { spawn } = require('child_process');
const http = require('http');
const WebSocket = require('ws');
const path = require('path');
const os = require('os');

const CHROME_PATH = '/Applications/Google Chrome.app/Contents/MacOS/Google Chrome';
const PORT = 9444;
const USER_DATA = path.join(os.tmpdir(), 'chrome_repro_' + Date.now());

function sleep(ms) {
  return new Promise(r => setTimeout(r, ms));
}

function fetchJson(url) {
  return new Promise((resolve, reject) => {
    http.get(url, (res) => {
      let data = '';
      res.on('data', chunk => data += chunk);
      res.on('end', () => {
        try { resolve(JSON.parse(data)); } catch (e) { reject(e); }
      });
    }).on('error', reject);
  });
}

class CDPClient {
  constructor(wsUrl) {
    this.ws = new WebSocket(wsUrl);
    this.id = 1;
    this.callbacks = new Map();
    this.consoleMessages = [];
    this.errors = [];

    this.ws.on('message', (msg) => {
      const parsed = JSON.parse(msg);
      if (parsed.id && this.callbacks.has(parsed.id)) {
        const { resolve, reject } = this.callbacks.get(parsed.id);
        this.callbacks.delete(parsed.id);
        if (parsed.error) reject(parsed.error);
        else resolve(parsed.result);
      } else if (parsed.method) {
        if (parsed.method === 'Runtime.consoleAPICalled') {
          const text = parsed.params.args.map(a => a.value || a.description || '').join(' ');
          this.consoleMessages.push({ type: parsed.params.type, text });
          if (parsed.params.type === 'error') this.errors.push(text);
        }
      }
    });
  }

  async connect() {
    return new Promise((resolve, reject) => {
      this.ws.on('open', resolve);
      this.ws.on('error', reject);
    });
  }

  send(method, params = {}) {
    return new Promise((resolve, reject) => {
      const id = this.id++;
      this.callbacks.set(id, { resolve, reject });
      this.ws.send(JSON.stringify({ id, method, params }));
    });
  }

  async evaluate(expression) {
    const res = await this.send('Runtime.evaluate', { expression, returnByValue: true, awaitPromise: true });
    if (res.exceptionDetails) throw new Error(res.exceptionDetails.text || 'Eval error');
    return res.result ? res.result.value : undefined;
  }

  async dispatchWheel(x, y, deltaX, deltaY) {
    await this.send('Input.dispatchMouseEvent', {
      type: 'mouseWheel',
      x,
      y,
      deltaX,
      deltaY,
    });
  }
}

async function run() {
  console.log('--- REPRODUCING WHEEL & SCROLL FREEZE IN CHROME ---');
  const chromeProcess = spawn(CHROME_PATH, [
    '--headless=new',
    `--remote-debugging-port=${PORT}`,
    `--user-data-dir=${USER_DATA}`,
    '--no-first-run',
    '--disable-gpu',
    '--window-size=1440,900',
    'about:blank'
  ]);

  await sleep(1000);
  const targets = await fetchJson(`http://127.0.0.1:${PORT}/json/list`);
  const pageTarget = targets.find(t => t.type === 'page');
  const cdp = new CDPClient(pageTarget.webSocketDebuggerUrl);
  await cdp.connect();

  await cdp.send('Runtime.enable');
  await cdp.send('Page.enable');

  await cdp.send('Page.navigate', { url: 'http://localhost:5173/' });
  await sleep(1500);

  console.log('1. Page loaded. Initial state:');
  const init = await cdp.evaluate(`
    (() => {
      const rail = document.querySelector('[data-mode]');
      return {
        mode: rail?.dataset.mode,
        scrollTop: rail?.scrollTop,
        heading: document.querySelector('h1, h2')?.innerText
      };
    })()
  `);
  console.log(init);

  console.log('\n2. Simulating small trackpad wheel events (deltaY: 5 to 15)...');
  for (let i = 0; i < 5; i++) {
    await cdp.dispatchWheel(500, 500, 0, 10);
    await sleep(40);
  }
  await sleep(600);

  const stateAfterSmallWheel = await cdp.evaluate(`
    (() => {
      const rail = document.querySelector('[data-mode]');
      return {
        scrollTop: rail?.scrollTop,
        activeSlide: Math.round((rail?.scrollTop || 0) / (rail?.clientHeight || 1)) + 1
      };
    })()
  `);
  console.log('State after small wheel:', stateAfterSmallWheel);

  console.log('\n3. Simulating fast continuous wheel scroll (10 events deltaY: 80)...');
  for (let i = 0; i < 10; i++) {
    await cdp.dispatchWheel(500, 500, 0, 80);
    await sleep(30);
  }
  await sleep(800);

  const stateAfterFastWheel = await cdp.evaluate(`
    (() => {
      const rail = document.querySelector('[data-mode]');
      return {
        scrollTop: rail?.scrollTop,
        activeSlide: Math.round((rail?.scrollTop || 0) / (rail?.clientHeight || 1)) + 1
      };
    })()
  `);
  console.log('State after fast wheel:', stateAfterFastWheel);

  cdp.ws.close();
  chromeProcess.kill();
}

run().catch(err => {
  console.error('Repro script failed:', err);
  process.exit(1);
});
