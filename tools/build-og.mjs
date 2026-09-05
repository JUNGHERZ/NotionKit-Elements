// Renders tools/assets/og-card.html to og.png (1200×630) with Playwright.
// Needs a built dist/ and the installed foundation; run manually before a release.
import { chromium } from '@playwright/test';
import { spawn } from 'node:child_process';
const srv = spawn('node', ['test/server.mjs', '4194'], { stdio: 'ignore' });
await new Promise(r => setTimeout(r, 800));
const browser = await chromium.launch();
const page = await browser.newPage({ viewport: { width: 1200, height: 630 }, deviceScaleFactor: 1 });
await page.route('**/esm.sh/**', r => r.abort());
await page.goto('http://127.0.0.1:4194/tools/assets/og-card.html');
await page.waitForTimeout(2000);
await page.screenshot({ path: 'og.png', type: 'png' });
await browser.close(); srv.kill();
console.log('✅ og.png rendered (1200×630)');
