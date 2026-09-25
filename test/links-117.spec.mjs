// 1.17.0: LearnHub's findings 6 and 16 – a step and a gallery card as links
// under one contract: a plain click is a selection that can be cancelled,
// every other click is the browser's, Enter acts like the plain click.
import { test, expect } from '@playwright/test';
import { openHarness, setStage } from './helpers.mjs';

// Records nk-select, cancels it while window.cancel is set, and keeps the
// browser from opening tabs for the clicks that are its own.
const watch = (page, id) => page.evaluate(id => {
  window.got = []; window.cancel = true;
  document.getElementById(id).addEventListener('nk-select', e => { window.got.push(e.detail.value); if (window.cancel) e.preventDefault(); });
  window.addEventListener('click', e => { if (e.metaKey || e.ctrlKey || e.shiftKey || e.altKey) e.preventDefault(); });
  window.addEventListener('auxclick', e => e.preventDefault());
}, id);
const state = (page, id) => page.evaluate(id => ({ got: window.got, hash: location.hash, current: document.getElementById(id).current }), id);

test('nk-steps: a step with href is a link, one without stays a button; the link keeps its role', async ({ page }) => {
  await openHarness(page);
  await setStage(page, '<nk-steps id="s" selectable></nk-steps><nk-steps id="p"></nk-steps>');
  const labels = await page.evaluate(() => {
    const steps = [{ label: 'Intro', href: '#chapter-1' }, { label: 'Safety', desc: '12 min', href: '#chapter-2' }, { label: 'Locked' }];
    for (const id of ['s', 'p']) document.getElementById(id).steps = steps;
    return ['s', 'p'].map(id => [...document.getElementById(id).shadowRoot.querySelectorAll('li > :not(.st-mark)')]
      .map(l => `${l.localName}.${l.className}|${l.getAttribute('href') ?? ''}|${l.getAttribute('role') ?? ''}|${l.textContent}`));
  });
  expect(labels).toEqual([
    ['a.st-label|#chapter-1||Intro', 'a.st-label|#chapter-2||Safety12 min', 'button.st-label|||Locked'],
    ['a.st-label|#chapter-1||Intro', 'a.st-label|#chapter-2||Safety12 min', 'span.|||Locked'],
  ]);
});

test('nk-steps link contract: a plain click or Enter fires nk-select and cancelling it keeps the page; middle and modified clicks fire nothing', async ({ page }) => {
  await openHarness(page);
  await setStage(page, '<nk-steps id="s" selectable current="1"></nk-steps>');
  await page.evaluate(() => { document.getElementById('s').steps = [{ label: 'Intro', value: 'c1', href: '#chapter-1' }, { label: 'Safety', value: 'c2', href: '#chapter-2' }, { label: 'Locked', value: 'c3' }]; });
  await watch(page, 's');
  const link = page.locator('#s a.st-label >> nth=1');
  await link.click();
  expect(await state(page, 's')).toEqual({ got: ['c2'], hash: '', current: 1 });
  await link.click({ modifiers: ['Meta'] });
  await link.click({ modifiers: ['Shift'] });
  await link.click({ modifiers: ['Alt'] });
  await link.click({ button: 'middle' });
  expect(await state(page, 's')).toEqual({ got: ['c2'], hash: '', current: 1 });
  await link.focus();
  await page.keyboard.press('Enter');
  // The number beside the link counts as the link.
  await page.locator('#s li >> nth=1 >> .st-mark').click();
  expect(await state(page, 's')).toEqual({ got: ['c2', 'c2', 'c2'], hash: '', current: 1 });
  // Not cancelled: the browser follows the link and the step becomes current.
  await page.evaluate(() => { window.cancel = false; });
  await link.click();
  expect(await state(page, 's')).toEqual({ got: ['c2', 'c2', 'c2', 'c2'], hash: '#chapter-2', current: 2 });
  // A step without href is the button it was.
  await page.locator('#s button.st-label').click();
  expect(await state(page, 's')).toEqual({ got: ['c2', 'c2', 'c2', 'c2', 'c3'], hash: '#chapter-2', current: 3 });
});

const COLUMNS = [{ key: 'name', label: 'Name', title: true }, { key: 'status', type: 'select', options: [{ value: 'open', label: 'Open' }] }];
const ROWS = [
  { id: 1, name: 'Compliance', status: 'open', href: '#course-1' },
  { id: 2, name: 'Safety', status: 'open', href: { href: '#course-2' } },
  { id: 3, name: 'Draft', status: 'open' },
];

test('nk-gallery-view href-key: a row with an address is a link card in a list item; the others and a gallery without href-key stay as they were', async ({ page }) => {
  await openHarness(page);
  await setStage(page, '<nk-gallery-view id="g" href-key="href" no-cover new-row></nk-gallery-view><nk-gallery-view id="h" no-cover></nk-gallery-view>');
  const items = id => page.evaluate(id => [...document.getElementById(id).shadowRoot.querySelector('.nk-gallery').children].map(c => {
    const card = c.matches('.nk-card, .nk-new-row') ? c : c.firstElementChild;
    return `${c.className}|${c.getAttribute('role')}|${card.localName}.${card.className}|${card.getAttribute('href') ?? ''}|${card.getAttribute('role') ?? ''}|${card.getAttribute('tabindex') ?? ''}`;
  }), id);
  await page.evaluate(([c, r]) => { for (const id of ['g', 'h']) document.getElementById(id).setData(c, r); }, [COLUMNS, ROWS]);
  expect(await items('g')).toEqual([
    'card-item|listitem|a.nk-card|#course-1||',
    'card-item|listitem|a.nk-card|#course-2||',
    'nk-card|listitem|div.nk-card||listitem|0',
    'nk-new-row|button|div.nk-new-row||button|0',
  ]);
  expect(await items('h')).toEqual(['nk-card|listitem|div.nk-card||listitem|0', 'nk-card|listitem|div.nk-card||listitem|0', 'nk-card|listitem|div.nk-card||listitem|0']);
  // The link card is as wide and tall as the card beside it.
  expect(await page.evaluate(() => { const [a, b, c] = [...document.getElementById('g').shadowRoot.querySelectorAll('.nk-card')].map(e => e.getBoundingClientRect()); return [a.width === c.width, a.height === c.height, b.top === a.top]; })).toEqual([true, true, true]);
});

test('nk-gallery-view link contract: a plain click or Enter fires nk-select { row, id, value } once, cancelling keeps the page; other clicks and Space fire nothing', async ({ page }) => {
  await openHarness(page);
  await setStage(page, '<nk-gallery-view id="g" href-key="href" no-cover></nk-gallery-view>');
  await page.evaluate(([c, r]) => { document.getElementById('g').setData(c, r); }, [COLUMNS, ROWS]);
  await watch(page, 'g');
  const got = () => page.evaluate(() => [window.got, location.hash]);
  const link = page.locator('#g a.nk-card >> nth=0');
  await link.click();
  expect(await got()).toEqual([[1], '']);
  await link.click({ modifiers: ['Meta'] });
  await link.click({ modifiers: ['Shift'] });
  await link.click({ button: 'middle' });
  expect(await got()).toEqual([[1], '']);
  await link.focus();
  await page.keyboard.press('Enter');
  await page.keyboard.press('Space');
  expect(await got()).toEqual([[1, 1], '']);
  // The card without an address keeps Enter and Space.
  await page.locator('#g div.nk-card').focus();
  await page.keyboard.press('Enter');
  await page.keyboard.press('Space');
  expect(await got()).toEqual([[1, 1, 3, 3], '']);
  expect(await page.evaluate(() => { let d; document.getElementById('g').addEventListener('nk-select', e => { d = e.detail; }, { once: true }); document.getElementById('g').shadowRoot.querySelectorAll('a.nk-card')[1].click(); return [d.id, d.row.name]; })).toEqual([2, 'Safety']);
  await page.evaluate(() => { window.cancel = false; });
  await link.click();
  expect(await got()).toEqual([[1, 1, 3, 3, 2, 1], '#course-1']);
});
