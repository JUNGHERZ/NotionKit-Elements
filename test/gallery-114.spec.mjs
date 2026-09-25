// 1.14.0: <nk-gallery-view>, the fifth database view – cards with a picture,
// sizes, fit, no-cover, the events and its place in <nk-database>.
import { test, expect } from '@playwright/test';
import { openHarness, setStage } from './helpers.mjs';

const COLUMNS = [
  { key: 'name', label: 'Name', type: 'text', title: true },
  { key: 'status', label: 'Status', type: 'select', options: [{ value: 'open', label: 'Open', color: 'blue' }, { value: 'done', label: 'Done', color: 'green' }] },
  { key: 'due', label: 'Due', type: 'date' },
  { key: 'hours', label: 'Hours', type: 'number' },
];
const ROWS = [
  { id: 1, icon: '📘', name: 'Compliance', status: 'open', due: '30.10.2026', hours: 2, cover: '/covers/aurora.svg', picture: '/covers/tide.svg' },
  { id: 2, icon: '🦺', name: 'Safety', status: 'done', due: '12.11.2026', hours: 1 },
];
const cards = page => page.evaluate(() => [...document.getElementById('g').shadowRoot.querySelectorAll('.nk-card')].map(c => ({
  img: c.querySelector('.nk-cover img')?.getAttribute('src') ?? (c.querySelector('.nk-cover') ? 'gradient' : 'none'),
  title: c.querySelector('.card-title').textContent,
  meta: [...c.querySelector('.card-meta').children].map(s => s.textContent),
})));

test('nk-gallery-view renders cards: the picture from cover-key, the gradient without one, title and meta-keys', async ({ page }) => {
  await openHarness(page);
  await setStage(page, '<nk-gallery-view id="g"></nk-gallery-view>');
  await page.evaluate(([c, r]) => { const g = document.getElementById('g'); g.columns = c; g.rows = r; }, [COLUMNS, ROWS]);
  // Default meta: the select and date columns, in column order.
  expect(await cards(page)).toEqual([
    { img: '/covers/aurora.svg', title: '📘 Compliance', meta: ['Open', '📅 30.10.2026'] },
    { img: 'gradient', title: '🦺 Safety', meta: ['Done', '📅 12.11.2026'] },
  ]);
  await page.evaluate(() => { const g = document.getElementById('g'); g.setAttribute('cover-key', 'picture'); g.setAttribute('meta-keys', 'hours'); });
  expect(await cards(page)).toEqual([
    { img: '/covers/tide.svg', title: '📘 Compliance', meta: ['2'] },
    { img: 'gradient', title: '🦺 Safety', meta: ['1'] },
  ]);
  await page.evaluate(() => document.getElementById('g').setAttribute('no-cover', ''));
  expect((await cards(page)).map(c => c.img)).toEqual(['none', 'none']);
});

test('nk-gallery-view: size and fit set the classes; the grid is a list of cards that take the keyboard', async ({ page }) => {
  await openHarness(page);
  await setStage(page, '<nk-gallery-view id="g" size="small" fit new-row new-row-label="＋ New course"></nk-gallery-view>');
  await page.evaluate(([c, r]) => { document.getElementById('g').setData(c, r); }, [COLUMNS, ROWS]);
  const grid = () => page.evaluate(() => { const g = document.getElementById('g').shadowRoot.querySelector('.nk-gallery'); return [g.className, g.getAttribute('role'), [...g.children].map(c => `${c.getAttribute('role')}|${c.tabIndex}|${c.className}`)]; });
  expect(await grid()).toEqual(['nk-gallery small fit', 'list', ['listitem|0|nk-card', 'listitem|0|nk-card', 'button|0|nk-new-row']]);
  await page.evaluate(() => document.getElementById('g').setAttribute('size', 'large'));
  expect((await grid())[0]).toBe('nk-gallery large fit');
  await page.evaluate(() => { const g = document.getElementById('g'); g.setAttribute('size', 'huge'); g.removeAttribute('fit'); });
  expect((await grid())[0]).toBe('nk-gallery');
  expect(await page.evaluate(() => document.getElementById('g').shadowRoot.querySelector('.nk-new-row').textContent)).toBe('＋ New course');
});

test('nk-gallery-view: a click, Enter or Space on a card fires nk-select; the add card fires nk-action', async ({ page }) => {
  await openHarness(page);
  await setStage(page, '<nk-gallery-view id="g" new-row></nk-gallery-view>');
  await page.evaluate(([c, r]) => {
    const g = document.getElementById('g'); g.setData(c, r);
    window.got = [];
    g.addEventListener('nk-select', e => window.got.push(['select', e.detail.id, e.detail.row.name]));
    g.addEventListener('nk-action', e => window.got.push(['action', e.detail.action]));
  }, [COLUMNS, ROWS]);
  await page.evaluate(() => document.getElementById('g').shadowRoot.querySelectorAll('.nk-card')[1].click());
  await page.evaluate(() => document.getElementById('g').shadowRoot.querySelector('.nk-card').focus());
  await page.keyboard.press('Enter');
  await page.keyboard.press('Space');
  await page.evaluate(() => document.getElementById('g').shadowRoot.querySelector('.nk-new-row').focus());
  await page.keyboard.press('Enter');
  expect(await page.evaluate(() => window.got)).toEqual([['select', 2, 'Safety'], ['select', 1, 'Compliance'], ['select', 1, 'Compliance'], ['action', 'new-row']]);
});

test('nk-gallery-view inside nk-database: its own tab, the data pushed, shown when chosen', async ({ page }) => {
  await openHarness(page);
  await setStage(page, '<nk-database id="db"><nk-table-view name="table" label="▦ Table"></nk-table-view><nk-gallery-view name="gallery" label="🖼 Gallery"></nk-gallery-view></nk-database>');
  await page.evaluate(([c, r]) => { const db = document.getElementById('db'); db.columns = c; db.rows = r; }, [COLUMNS, ROWS]);
  const state = () => page.evaluate(() => {
    const db = document.getElementById('db'), g = db.querySelector('nk-gallery-view');
    return { tabs: [...db.shadowRoot.querySelectorAll('.nk-db-tab')].map(t => t.textContent), hidden: g.hidden, cards: g.shadowRoot.querySelectorAll('.nk-card').length };
  });
  expect(await state()).toEqual({ tabs: ['▦ Table', '🖼 Gallery'], hidden: true, cards: 2 });
  await page.evaluate(() => { document.getElementById('db').view = 'gallery'; });
  expect(await state()).toEqual({ tabs: ['▦ Table', '🖼 Gallery'], hidden: false, cards: 2 });
  expect(await page.evaluate(() => document.querySelector('#db nk-gallery-view').shadowRoot.querySelector('.nk-card').getBoundingClientRect().width)).toBeGreaterThan(0);
});
