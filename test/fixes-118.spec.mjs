// 1.18.0: LearnHub's finding 17 and Auxdesk's 26, 27 and 28 – a bar and its
// label as one row in a panel, stacked properties that keep to their card on
// a phone, icons instead of words in the copy field, and the tab bar marking
// "More" for a page without a tab of its own.
import { test, expect } from '@playwright/test';
import { openHarness, setStage } from './helpers.mjs';

const PHONE = { width: 390, height: 844 };
const settle = page => page.waitForTimeout(350);
const rect = (page, host, sel) => page.evaluate(([h, s]) => { const el = s ? document.getElementById(h).shadowRoot.querySelector(s) : document.getElementById(h); const r = el.getBoundingClientRect(); return { left: Math.round(r.left), right: Math.round(r.right), top: Math.round(r.top), width: Math.round(r.width), height: Math.round(r.height), mid: Math.round(r.top + r.height / 2) }; }, [host, sel]);

test('<nk-progress wide label> in a panel: the label beside the bar, on its middle, the bar filling the rest; without a label the bar stands alone', async ({ page }) => {
  await openHarness(page);
  await setStage(page, '<div style="width:420px"><nk-panel id="panel" title="Progress"><nk-progress id="p" wide value="40" label="40 %"></nk-progress></nk-panel></div>');
  const [bar, label, panel] = await Promise.all([rect(page, 'p', '.nk-progress'), rect(page, 'p', '.nk-progress-label'), rect(page, 'panel', '.nk-panel')]);
  expect(label.left).toBeGreaterThan(bar.right);
  expect(Math.abs(label.mid - bar.mid)).toBeLessThanOrEqual(1);
  expect(bar.height).toBe(6);
  expect(panel.right - label.right).toBeLessThanOrEqual(24);
  expect(await page.evaluate(() => [...document.getElementById('p').shadowRoot.querySelector('.nk-wrapper').children].map(c => c.className))).toEqual(['nk-progress-row']);
  // The label goes and comes back with its attribute.
  await page.evaluate(() => document.getElementById('p').removeAttribute('label'));
  expect(await page.evaluate(() => [...document.getElementById('p').shadowRoot.querySelector('.nk-wrapper').children].map(c => c.className))).toEqual(['nk-progress wide']);
  await page.evaluate(() => { document.getElementById('p').label = '55 %'; document.getElementById('p').value = 55; });
  expect(await page.evaluate(() => { const r = document.getElementById('p').shadowRoot; return [r.querySelector('.nk-progress-row > .nk-progress-label').textContent, r.querySelector('.nk-progress > i').style.width]; })).toEqual(['55 %', '55%']);
});

test('<nk-prop> on a phone keeps a long copy field inside its card', async ({ page }) => {
  await page.setViewportSize(PHONE);
  await openHarness(page);
  const long = 'https://hooks.auxdesk.app/notion/webhooks/4f2a9c1e-7b3d-4e8a-9f61-2c5d8e7a1b04/inbound?token=' + 'x'.repeat(420);
  await setStage(page, `<div id="card" style="width:308px"><nk-props flush><nk-prop label="Webhook" id="prop"><nk-copy-field id="cf" value="${long}" mono wide></nk-copy-field></nk-prop></nk-props></div>`);
  await settle(page);
  const [card, value, field] = await Promise.all([rect(page, 'card'), rect(page, 'prop', '.p-value'), rect(page, 'cf', '.nk-copy-field')]);
  expect(value.right).toBeLessThanOrEqual(card.right);
  expect(field.right).toBeLessThanOrEqual(card.right);
});

const buttons = page => page.evaluate(() => [...document.getElementById('cf').shadowRoot.querySelectorAll('.cf-btn')].map(b => ({
  word: b.querySelector('span').textContent, label: b.getAttribute('aria-label'), tip: b.getAttribute('data-tooltip'),
  svg: getComputedStyle(b.querySelector('svg')).display, span: getComputedStyle(b.querySelector('span')).display, width: Math.round(b.getBoundingClientRect().width),
})));

test('<nk-copy-field>: words on the desktop with the word as the name; `icons` shows the icons with the word as tooltip', async ({ page }) => {
  await openHarness(page);
  await setStage(page, '<nk-copy-field id="cf" value="ntn_4f2a9c1e7b3d" secret mono></nk-copy-field>');
  expect(await buttons(page)).toEqual([
    expect.objectContaining({ word: 'Show', label: 'Show', tip: null, svg: 'none', span: 'inline' }),
    expect.objectContaining({ word: 'Copy', label: 'Copy', tip: null, svg: 'none', span: 'inline' }),
  ]);
  await page.evaluate(() => { document.getElementById('cf').icons = true; });
  expect(await buttons(page)).toEqual([
    { word: 'Show', label: 'Show', tip: 'Show', svg: 'block', span: 'none', width: 28 },
    { word: 'Copy', label: 'Copy', tip: 'Copy', svg: 'block', span: 'none', width: 28 },
  ]);
  // Show turns into Hide with the eye struck through; the words follow the language and the attributes.
  await page.locator('#cf .cf-btn >> nth=0').click();
  await page.evaluate(() => document.getElementById('cf').setAttribute('copy-label', 'Copy key'));
  expect(await page.evaluate(() => [...document.getElementById('cf').shadowRoot.querySelectorAll('.cf-btn')].map(b => [b.getAttribute('aria-label'), b.getAttribute('aria-pressed'), b.querySelectorAll('svg path').length]))).toEqual([['Hide', 'true', 2], ['Copy key', null, 1]]);
});

test('<nk-copy-field>: the moment after copying is a green check, named "Copied"', async ({ page, context }) => {
  await context.grantPermissions(['clipboard-read', 'clipboard-write']);
  await openHarness(page);
  await setStage(page, '<nk-copy-field id="cf" value="https://monahilft.notionkit.app" icons></nk-copy-field>');
  await page.evaluate(() => document.getElementById('cf').copy());
  expect(await page.evaluate(() => { const b = document.getElementById('cf').shadowRoot.querySelector('.cf-btn'); return [b.getAttribute('aria-label'), b.dataset.icon, b.classList.contains('copied'), getComputedStyle(b).color]; })).toEqual(['Copied', 'copied', true, 'rgb(68, 131, 97)']);
});

test('<nk-copy-field> on a phone: the icons stand in for the words by themselves, with tooltips; back on the desktop the words return', async ({ page }) => {
  await openHarness(page);
  await setStage(page, '<nk-copy-field id="cf" value="ntn_4f2a9c1e7b3d" secret mono></nk-copy-field>');
  await page.setViewportSize(PHONE);
  await settle(page);
  expect(await buttons(page)).toEqual([
    { word: 'Show', label: 'Show', tip: 'Show', svg: 'block', span: 'none', width: 28 },
    { word: 'Copy', label: 'Copy', tip: 'Copy', svg: 'block', span: 'none', width: 28 },
  ]);
  await page.setViewportSize({ width: 1100, height: 800 });
  await settle(page);
  expect((await buttons(page)).map(b => [b.tip, b.svg, b.span])).toEqual([[null, 'none', 'inline'], [null, 'none', 'inline']]);
});

test('<nk-tab-bar>: a value no item has marks the drawer item, without one none; no value falls back to the marked item, else the first', async ({ page }) => {
  await openHarness(page);
  await setStage(page, `<nk-tab-bar id="a" value="settings/notion" always><nk-tab-bar-item value="home">Home</nk-tab-bar-item><nk-tab-bar-item value="jobs">Jobs</nk-tab-bar-item><nk-tab-bar-item drawer>More</nk-tab-bar-item></nk-tab-bar>
    <nk-tab-bar id="b" value="settings/notion" always><nk-tab-bar-item value="home">Home</nk-tab-bar-item><nk-tab-bar-item value="jobs">Jobs</nk-tab-bar-item></nk-tab-bar>
    <nk-tab-bar id="c" always><nk-tab-bar-item value="home">Home</nk-tab-bar-item><nk-tab-bar-item value="jobs" active>Jobs</nk-tab-bar-item><nk-tab-bar-item drawer>More</nk-tab-bar-item></nk-tab-bar>`);
  const active = id => page.evaluate(id => [...document.getElementById(id).querySelectorAll('nk-tab-bar-item')].map(i => (i.hasAttribute('active') ? '●' : '○') + (i.shadowRoot.querySelector('button').getAttribute('aria-current') ?? '')), id);
  expect(await active('a')).toEqual(['○', '○', '●page']);
  expect(await active('b')).toEqual(['○', '○']);
  expect(await active('c')).toEqual(['○', '●page', '○']);
  await page.evaluate(() => { document.getElementById('a').value = 'jobs'; });
  expect(await active('a')).toEqual(['○', '●page', '○']);
  await page.evaluate(() => { document.getElementById('a').removeAttribute('value'); });
  expect(await active('a')).toEqual(['○', '●page', '○']);                // the marked item stays
  expect(await page.evaluate(() => document.getElementById('a').value)).toBe('jobs');
});
