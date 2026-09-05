// DoD 3: `:root { --nk-accent: … }` in the document re-colours every element –
// with notionkit.css on the page and without it (token layer only), and
// regardless of whether the brand sheet loads before or after the bundle.
import { test, expect } from '@playwright/test';
import { openHarness, setStage } from './helpers.mjs';

const GREEN = 'rgb(22, 163, 74)';
const MARKUP = `
  <nk-btn id="btn" variant="primary">Save</nk-btn>
  <nk-switch id="sw" checked></nk-switch>
  <nk-check id="chk" checked>Check</nk-check>
  <nk-todo id="todo" checked>Todo</nk-todo>
  <nk-radio id="rad" name="r" checked>Radio</nk-radio>
  <nk-input id="inp"></nk-input>`;

const readAccents = () => ({
  btn: getComputedStyle(document.getElementById('btn').shadowRoot.querySelector('.nk-btn')).backgroundColor,
  sw: getComputedStyle(document.getElementById('sw').shadowRoot.querySelector('.nk-switch')).backgroundColor,
  chk: getComputedStyle(document.getElementById('chk').shadowRoot.querySelector('input')).backgroundColor,
  todo: getComputedStyle(document.getElementById('todo').shadowRoot.querySelector('input')).backgroundColor,
  rad: getComputedStyle(document.getElementById('rad').shadowRoot.querySelector('input')).backgroundColor,
  hostToken: getComputedStyle(document.getElementById('btn')).getPropertyValue('--nk-accent').trim(),
});

for (const bare of [false, true]) {
  test(`brand sheet appended after the bundle re-colours all elements (${bare ? 'token layer only' : 'notionkit.css on page'})`, async ({ page }) => {
    await openHarness(page, { bare });
    await setStage(page, MARKUP);
    const before = await page.evaluate(readAccents);
    expect(before.btn).toBe('rgb(35, 131, 226)');           // default --nk-accent #2383e2
    await page.addStyleTag({ content: ':root { --nk-accent: #16a34a; }' });
    await page.waitForTimeout(400);   // .nk-btn / .nk-switch transition their background
    const after = await page.evaluate(readAccents);
    expect(after).toEqual({ btn: GREEN, sw: GREEN, chk: GREEN, todo: GREEN, rad: GREEN, hostToken: '#16a34a' });
    // focus ring derives from the accent, too
    await page.locator('#inp').locator('input').focus();
    await page.waitForTimeout(300);   // border-color transition
    const ring = await page.evaluate(() => getComputedStyle(document.getElementById('inp').shadowRoot.querySelector('input')).borderColor);
    expect(ring).toBe(GREEN);
  });
}

test('brand sheet loaded before the bundle still wins (cascade layer)', async ({ page }) => {
  await page.goto('/test/fixtures/harness-bare.html');
  // Inject the brand rule, then the bundle again as a fresh module copy.
  await page.addStyleTag({ content: ':root { --nk-accent: #16a34a; }' });
  await page.waitForFunction(() => customElements.get('nk-btn'));
  await setStage(page, MARKUP);
  await page.waitForTimeout(400);
  const after = await page.evaluate(readAccents);
  expect(after.btn).toBe(GREEN);
  expect(after.sw).toBe(GREEN);
});

test('theme sync: data-theme on <html> re-themes every instance', async ({ page }) => {
  await openHarness(page, { theme: 'light' });
  await setStage(page, MARKUP);
  const light = await page.evaluate(() => getComputedStyle(document.getElementById('inp').shadowRoot.querySelector('input')).backgroundColor);
  await page.evaluate(() => document.documentElement.setAttribute('data-theme', 'dark'));
  await page.evaluate(() => new Promise(r => requestAnimationFrame(r)));
  const dark = await page.evaluate(() => ({
    bg: getComputedStyle(document.getElementById('inp').shadowRoot.querySelector('input')).backgroundColor,
    wrapper: document.getElementById('inp').shadowRoot.querySelector('.nk-wrapper').getAttribute('data-theme'),
  }));
  expect(light).toBe('rgb(255, 255, 255)');
  expect(dark.bg).toBe('rgb(25, 25, 25)');
  expect(dark.wrapper).toBe('dark');
});
