// DoD 8: the per-component import resolves for real – through the export map
// of a packed tarball in a fresh install, and in the browser, where a single
// entry registers only its own tag.
import { test, expect } from '@playwright/test';
import { execSync } from 'node:child_process';
import { mkdtempSync, writeFileSync, existsSync } from 'node:fs';
import { tmpdir } from 'node:os';
import { join } from 'node:path';

test('npm pack + install: components/*.js resolves through the export map', async () => {
  const dir = mkdtempSync(join(tmpdir(), 'nk-elements-'));
  const tgz = execSync('npm pack --silent --pack-destination ' + dir, { encoding: 'utf-8' }).trim();
  writeFileSync(join(dir, 'package.json'), JSON.stringify({ name: 'consumer', type: 'module', private: true }));
  execSync(`npm install --no-audit --no-fund --silent ${join(dir, tgz)} @jungherz-de/notionkit`, { cwd: dir, stdio: 'ignore' });
  writeFileSync(join(dir, 'resolve.mjs'), `
    const a = import.meta.resolve('@jungherz-de/notionkit-elements/components/nk-btn.js');
    const b = import.meta.resolve('@jungherz-de/notionkit-elements/components/nk-select.js');
    const c = import.meta.resolve('@jungherz-de/notionkit-elements');
    console.log(JSON.stringify([a, b, c]));`);
  const [a, b, c] = JSON.parse(execSync('node resolve.mjs', { cwd: dir, encoding: 'utf-8' }));
  for (const url of [a, b, c]) expect(existsSync(new URL(url)), url).toBe(true);
  expect(a.endsWith('/dist/components/nk-btn.js')).toBe(true);
  expect(c.endsWith('/dist/notionkit-elements.esm.js')).toBe(true);
});

test('a single component entry registers only its own tag', async ({ page }) => {
  await page.goto('/test/fixtures/empty.html');
  await page.evaluate(() => import('/dist/components/nk-tag.js'));
  expect(await page.evaluate(() => ({ tag: !!customElements.get('nk-tag'), btn: !!customElements.get('nk-btn') }))).toEqual({ tag: true, btn: false });
  await page.evaluate(() => { document.getElementById('stage').innerHTML = '<nk-tag color="green">Done</nk-tag>'; });
  const color = await page.evaluate(() => getComputedStyle(document.querySelector('nk-tag').shadowRoot.querySelector('.nk-tag')).color);
  expect(color).toBe('rgb(68, 131, 97)');
});
