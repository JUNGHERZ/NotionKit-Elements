// Light-DOM drift: components that copy children stay in step when a
// framework swaps them; the empty string is a valid value.
import { test, expect } from '@playwright/test';
import { openHarness, setStage } from './helpers.mjs';

const inner = () => [...document.getElementById('sel').shadowRoot.querySelector('select').options].map(o => o.value);

test('<nk-select> options follow the light DOM; selection survives a rebuild', async ({ page }) => {
  await openHarness(page);
  await setStage(page, `<nk-select id="sel" value="b"><option value="a">A</option><option value="b">B</option></nk-select>`);
  expect(await page.evaluate(inner)).toEqual(['a', 'b']);
  expect(await page.evaluate(() => document.getElementById('sel').value)).toBe('b');
  await page.evaluate(() => { document.getElementById('sel').insertAdjacentHTML('beforeend', '<option value="c">C</option>'); });
  await page.waitForFunction(() => document.getElementById('sel').shadowRoot.querySelector('select').options.length === 3);
  expect(await page.evaluate(() => document.getElementById('sel').value)).toBe('b');   // kept
  await page.evaluate(() => { document.getElementById('sel').innerHTML = '<option value="">Auto</option><option value="z">Z</option>'; });
  await page.waitForFunction(() => document.getElementById('sel').shadowRoot.querySelector('select').options.length === 2);
  await page.evaluate(() => { document.getElementById('sel').value = ''; });
  expect(await page.evaluate(() => document.getElementById('sel').value)).toBe('');
  expect(await page.evaluate(() => [...new FormData(Object.assign(document.createElement('form'), {})).entries()])).toEqual([]);
});

test('<nk-select value=""> selects the empty option and a stale value leaves the selection alone', async ({ page }) => {
  await openHarness(page);
  await setStage(page, `<form id="f"><nk-select id="sel" name="s" value=""><option value="x">X</option><option value="">Empty</option></nk-select></form>`);
  expect(await page.evaluate(() => document.getElementById('sel').value)).toBe('');
  expect(await page.evaluate(() => [...new FormData(document.getElementById('f')).entries()])).toEqual([['s', '']]);
  await page.evaluate(() => document.getElementById('sel').setAttribute('value', 'nope'));
  expect(await page.evaluate(() => document.getElementById('sel').value)).toBe('');
});

test('<nk-code highlight> re-highlights when its text changes', async ({ page }) => {
  await openHarness(page);
  await setStage(page, `<nk-code id="c" lang="html" highlight>&lt;div&gt;</nk-code>`);
  await page.waitForFunction(() => document.getElementById('c').shadowRoot.querySelector('.tag'));
  await page.evaluate(() => { document.getElementById('c').textContent = '<span class="x">'; });
  await page.waitForFunction(() => document.getElementById('c').shadowRoot.querySelector('.attr'));
});
