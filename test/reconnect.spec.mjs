// DoD 4: an element moved in the DOM keeps working – events fire exactly once,
// the theme observer still reaches it, light-DOM changes are still projected.
import { test, expect } from '@playwright/test';
import { openHarness, setStage } from './helpers.mjs';

test('<nk-select> moved to another parent still fires nk-change once and re-themes', async ({ page }) => {
  await openHarness(page);
  await setStage(page, `
    <div id="p1"><nk-select id="sel" name="s"><option value="a">A</option><option value="b">B</option></nk-select></div>
    <div id="p2"></div>`);
  const counts = { change: 0 };
  await page.exposeFunction('bump', () => counts.change++);
  await page.evaluate(() => document.addEventListener('nk-change', () => window.bump()));
  await page.evaluate(() => document.getElementById('p2').appendChild(document.getElementById('sel')));
  await page.locator('#sel').locator('select').selectOption('b');
  expect(counts.change).toBe(1);
  await page.evaluate(() => { document.getElementById('sel').innerHTML = '<option value="c">C</option>'; });
  await page.waitForFunction(() => document.getElementById('sel').shadowRoot.querySelector('select').options.length === 1);
  expect(await page.evaluate(() => document.getElementById('sel').value)).toBe('c');
  await page.evaluate(() => document.documentElement.setAttribute('data-theme', 'dark'));
  await page.evaluate(() => new Promise(r => requestAnimationFrame(r)));
  expect(await page.evaluate(() => document.getElementById('sel').shadowRoot.querySelector('.nk-wrapper').dataset.theme)).toBe('dark');
});

test('<nk-switch> and <nk-input> keep working after a move', async ({ page }) => {
  await openHarness(page);
  await setStage(page, `<div id="p1"><nk-switch id="sw"></nk-switch><nk-input id="in"></nk-input></div><div id="p2"></div>`);
  const seen = [];
  await page.exposeFunction('seen', v => seen.push(v));
  await page.evaluate(() => document.addEventListener('nk-change', e => window.seen(e.target.id)));
  await page.evaluate(() => { const p2 = document.getElementById('p2'); p2.append(document.getElementById('sw'), document.getElementById('in')); });
  await page.locator('#sw').locator('button').click();
  await page.locator('#in').locator('input').fill('x');
  await page.locator('#in').locator('input').blur();
  expect(seen).toEqual(['sw', 'in']);
  expect(await page.evaluate(() => document.getElementById('sw').checked)).toBe(true);
});
