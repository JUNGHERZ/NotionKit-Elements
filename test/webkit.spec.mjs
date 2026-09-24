// WebKit: every page loads and answers. An empty <nk-switch> sent 1.10 into
// an endless slotchange loop that only WebKit enters – Safari froze on the
// demo, the docs and the showcase while every Chromium test passed.
import { test, expect } from '@playwright/test';

const answers = page => Promise.race([
  page.evaluate(() => 'ok').catch(() => 'error'),
  new Promise(resolve => setTimeout(() => resolve('frozen'), 5000)),
]);

for (const url of ['/app.html', '/index.html', '/docs.html', '/showcase.html', '/de/app.html']) {
  test(`${url} answers in WebKit`, async ({ page }) => {
    await page.goto(url, { waitUntil: 'commit' });
    await page.waitForTimeout(1500);
    expect(await answers(page)).toBe('ok');
  });
}

test('the settings pane with two empty switches answers in WebKit', async ({ page }) => {
  await page.goto('/app.html#settings', { waitUntil: 'commit' });
  await page.waitForTimeout(1500);
  expect(await answers(page)).toBe('ok');
  expect(await page.evaluate(() => document.querySelectorAll('nk-switch:empty').length)).toBeGreaterThan(0);
});
