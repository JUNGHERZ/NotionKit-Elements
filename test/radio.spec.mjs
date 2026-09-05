// DoD 5: <nk-radio name="x"> elements – each with its own shadow root – behave
// as one group: clicks clear peers, FormData carries one entry, arrow keys
// wrap and skip disabled entries, and the group has a single tab stop.
import { test, expect } from '@playwright/test';
import { openHarness, setStage } from './helpers.mjs';

const FORM = `
<form id="f">
  <nk-radio id="a" name="x" value="a" checked>A</nk-radio>
  <nk-radio id="b" name="x" value="b">B</nk-radio>
  <nk-radio id="c" name="x" value="c" disabled>C</nk-radio>
  <nk-radio id="d" name="x" value="d">D</nk-radio>
  <nk-radio id="other" name="y" value="o" checked>Other group</nk-radio>
</form>
<form id="g"><nk-radio id="e" name="x" value="e" checked>E (other form)</nk-radio></form>`;

const checked = () => [...document.querySelectorAll('nk-radio')].filter(r => r.checked).map(r => r.id);
const formData = () => [...new FormData(document.getElementById('f')).entries()];

test('click clears the peers; FormData carries exactly one entry per group', async ({ page }) => {
  await openHarness(page);
  await setStage(page, FORM);
  expect(await page.evaluate(checked)).toEqual(['a', 'other', 'e']);
  await page.locator('#b').locator('input').click();
  expect(await page.evaluate(checked)).toEqual(['b', 'other', 'e']);
  expect(await page.evaluate(formData)).toEqual([['x', 'b'], ['y', 'o']]);
  await page.locator('#d').locator('input').click();
  expect(await page.evaluate(checked)).toEqual(['d', 'other', 'e']);
});

test('property and attribute writes keep the group consistent', async ({ page }) => {
  await openHarness(page);
  await setStage(page, FORM);
  await page.evaluate(() => { document.getElementById('d').checked = true; });
  expect(await page.evaluate(checked)).toEqual(['d', 'other', 'e']);
  await page.evaluate(() => { document.getElementById('a').setAttribute('checked', ''); });
  expect(await page.evaluate(checked)).toEqual(['a', 'other', 'e']);
});

test('arrow keys move within the group, wrap, skip disabled and select as they go', async ({ page }) => {
  await openHarness(page);
  await setStage(page, FORM);
  const events = [];
  await page.exposeFunction('record', v => events.push(v));
  await page.evaluate(() => document.getElementById('f').addEventListener('nk-change', e => window.record(e.detail.value)));
  await page.locator('#a').locator('input').focus();
  await page.keyboard.press('ArrowDown');       // a → b
  await page.keyboard.press('ArrowDown');       // b → d (c is disabled)
  await page.keyboard.press('ArrowDown');       // d → a (wrap)
  await page.keyboard.press('ArrowUp');         // a → d (wrap backwards)
  expect(await page.evaluate(checked)).toEqual(['d', 'other', 'e']);
  expect(events).toEqual(['b', 'd', 'a', 'd']);
});

test('a group has a single tab stop', async ({ page }) => {
  await openHarness(page);
  await setStage(page, `<input id="before"> ${FORM} <input id="after">`);
  const tabIndexes = () => ['a', 'b', 'c', 'd'].map(id => document.getElementById(id).shadowRoot.querySelector('input').tabIndex);
  expect(await page.evaluate(tabIndexes)).toEqual([0, -1, -1, -1]);
  await page.locator('#b').locator('input').click();
  expect(await page.evaluate(tabIndexes)).toEqual([-1, 0, -1, -1]);
  await page.locator('#before').focus();
  await page.keyboard.press('Tab');
  expect(await page.evaluate(() => document.activeElement.id)).toBe('b');
  await page.keyboard.press('Tab');
  expect(await page.evaluate(() => document.activeElement.id)).toBe('other');
});

test('form reset restores the initial selection', async ({ page }) => {
  await openHarness(page);
  await setStage(page, FORM);
  await page.locator('#d').locator('input').click();
  await page.evaluate(() => document.getElementById('f').reset());
  expect(await page.evaluate(checked)).toEqual(['a', 'other', 'e']);
});
