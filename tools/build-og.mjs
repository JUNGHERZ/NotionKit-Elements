// Renders tools/assets/og-card.html to og.png (1200×630) with Playwright.
// Needs a built dist/ and the installed foundation; run manually before a release.
import { chromium } from '@playwright/test';
import { spawn } from 'node:child_process';
import { readFileSync } from 'node:fs';
import { gzipSync } from 'node:zlib';
import { CATALOG } from './catalog.mjs';

// The numbers come from the build, so the card cannot go stale again.
const count = String(CATALOG.length);
const gzip = `${Math.round(gzipSync(readFileSync('dist/notionkit-elements.min.js'), { level: 9 }).length / 1024)} KB gzip`;
const srv = spawn('node', ['test/server.mjs', '4194'], { stdio: 'ignore' });
await new Promise(r => setTimeout(r, 800));
const browser = await chromium.launch();
const page = await browser.newPage({ viewport: { width: 1200, height: 630 }, deviceScaleFactor: 1 });
await page.route('**/esm.sh/**', r => r.abort());
await page.goto('http://127.0.0.1:4194/tools/assets/og-card.html');
await page.evaluate(([count, gzip]) => {
  document.getElementById('count').textContent = count;
  document.getElementById('countTag').textContent = `${count} elements`;
  document.getElementById('gz').textContent = gzip;
}, [count, gzip]);
await page.waitForTimeout(2000);
await page.screenshot({ path: 'og.png', type: 'png' });
await browser.close(); srv.kill();
console.log(`✅ og.png rendered (1200×630) – ${count} elements, ${gzip}`);
