// Mailverse's wish (JUNGHERZ/NotionKit-Elements#4): a checkbox column with
// `selectAll` selects every row from its header, tri-state as in Notion;
// and NotionKit 1.21.0 draws the dash an indeterminate checkbox never showed.
import { test, expect } from '@playwright/test';
import { openHarness, setStage } from './helpers.mjs';

const COLUMNS = `[
  { key: 'selected', type: 'checkbox', selectAll: true },
  { key: 'name', label: 'Subject', type: 'text', title: true },
  { key: 'done', label: 'Done', type: 'checkbox' },
]`;

/** A table of `n` rows, those in `on` selected; `log` collects its nk-change and nk-action events. */
async function table(page, { n = 4, on = [], attrs = 'sortable', lang } = {}) {
  await setStage(page, `<div${lang ? ` lang="${lang}"` : ''}><nk-table-view id="t" ${attrs}></nk-table-view></div>`);
  await page.evaluate(({ n, on, cols }) => {
    const t = document.getElementById('t');
    t.columns = eval(cols);
    t.rows = Array.from({ length: n }, (_, i) => ({ id: i + 1, name: `Message ${i + 1}`, selected: on.includes(i + 1), done: false }));
    window.log = [];
    t.addEventListener('nk-change', e => window.log.push({ type: 'change', key: e.detail.key, value: e.detail.value, all: !!e.detail.all, rows: e.detail.rows?.length, row: e.detail.row?.id }));
    t.addEventListener('nk-action', e => window.log.push({ type: 'action', action: e.detail.action, key: e.detail.key }));
  }, { n, on, cols: COLUMNS });
}

// The header box and the column it stands over, as the page sees them.
const state = page => page.evaluate(() => {
  const root = document.getElementById('t').shadowRoot;
  const h = root.querySelector('th.select-all input');
  return {
    header: h ? (h.indeterminate ? 'dash' : h.checked ? 'all' : 'none') : 'missing',
    disabled: h?.disabled,
    cells: [...root.querySelectorAll('tbody input[data-key="selected"]')].map(i => i.checked),
    rows: document.getElementById('t').rows.map(r => r.selected),
  };
});
const header = page => page.locator('#t th.select-all input');

test('the header of a selectAll column is a checkbox: empty, a dash, a check – after the rows', async ({ page }) => {
  await openHarness(page);
  await table(page);
  const head = await page.evaluate(() => {
    const th = document.getElementById('t').shadowRoot.querySelector('thead th');
    return { cls: th.className, key: th.dataset.key ?? null, text: th.textContent, label: th.querySelector('input').getAttribute('aria-label'), wrapped: th.querySelector('label.nk-check > input[type=checkbox]') !== null };
  });
  expect(head).toEqual({ cls: 'select-all', key: null, text: '', label: 'Select all', wrapped: true });
  expect(await state(page)).toMatchObject({ header: 'none', disabled: false });
  await table(page, { on: [1, 3] });
  expect((await state(page)).header).toBe('dash');
  await table(page, { on: [1, 2, 3, 4] });
  expect((await state(page)).header).toBe('all');
  // Without rows there is nothing to choose.
  await table(page, { n: 0 });
  expect(await state(page)).toMatchObject({ header: 'none', disabled: true });
  // Only a checkbox column with selectAll gets one: the other checkbox column keeps its name.
  expect(await page.evaluate(() => [...document.getElementById('t').shadowRoot.querySelectorAll('thead th')].map(th => th.className || th.textContent))).toEqual(['select-all', 'Subject', 'Done']);
});

test('a click selects every row – a dash too – and fires one nk-change; the next clears; the header sorts nothing', async ({ page }) => {
  await openHarness(page);
  await table(page, { on: [1, 3] });
  await header(page).click();
  expect(await state(page)).toEqual({ header: 'all', disabled: false, cells: [true, true, true, true], rows: [true, true, true, true] });
  expect(await page.evaluate(() => window.log)).toEqual([{ type: 'change', key: 'selected', value: true, all: true, rows: 4 }]);
  await header(page).click();
  expect(await state(page)).toEqual({ header: 'none', disabled: false, cells: [false, false, false, false], rows: [false, false, false, false] });
  expect(await page.evaluate(() => window.log.length)).toBe(2);
  // The header cell around the box sorts nothing either.
  await page.locator('#t th.select-all').click({ position: { x: 2, y: 2 } });
  expect(await page.evaluate(() => [window.log.filter(e => e.type === 'action').length, document.getElementById('t').getAttribute('sort-key')])).toEqual([0, null]);
  // A name header still sorts.
  await page.locator('#t th[data-key="name"]').click();
  expect(await page.evaluate(() => window.log.at(-1))).toEqual({ type: 'action', action: 'sort', key: 'name' });
});

test('a row\'s box keeps the header in step and keeps its own focus; Space on the header keeps the focus there', async ({ page }) => {
  await openHarness(page);
  await table(page, { on: [] });
  const cell = i => page.locator('#t tbody input[data-key="selected"]').nth(i);
  await cell(1).click();
  expect((await state(page)).header).toBe('dash');
  expect(await page.evaluate(() => document.getElementById('t').shadowRoot.activeElement?.dataset.rowId)).toBe('2');
  for (const i of [0, 2, 3]) await cell(i).click();
  expect((await state(page)).header).toBe('all');
  expect(await page.evaluate(() => window.log.map(e => e.row))).toEqual([2, 1, 3, 4]);
  // Keyboard: focus the header box, Space clears all and the focus stays on it.
  await header(page).focus();
  await page.keyboard.press('Space');
  expect((await state(page)).header).toBe('none');
  expect(await page.evaluate(() => document.getElementById('t').shadowRoot.activeElement?.matches('th.select-all input'))).toBe(true);
  await page.keyboard.press('Space');
  expect((await state(page)).header).toBe('all');
  expect(await page.evaluate(() => window.log.filter(e => e.all).map(e => e.value))).toEqual([false, true]);
});

test('only the rows the view has: an app that passes a filtered set keeps the rest as they were', async ({ page }) => {
  await openHarness(page);
  await setStage(page, `<nk-table-view id="t"></nk-table-view>`);
  const outside = await page.evaluate((cols) => {
    const all = Array.from({ length: 6 }, (_, i) => ({ id: i + 1, name: `M${i + 1}`, selected: false }));
    const t = document.getElementById('t');
    t.columns = eval(cols);
    t.rows = all.slice(0, 3);
    t.shadowRoot.querySelector('th.select-all input').click();
    return all.map(r => r.selected);
  }, COLUMNS);
  expect(outside).toEqual([true, true, true, false, false, false]);
});

test('the accessible name follows the language and setStrings()', async ({ page }) => {
  await openHarness(page);
  await table(page, { lang: 'de' });
  expect(await header(page).getAttribute('aria-label')).toBe('Alle auswählen');
  await page.evaluate(async () => { const { setStrings } = await import('/dist/notionkit-elements.esm.js'); setStrings({ selectAll: 'Alle Nachrichten' }, 'de'); });
  expect(await header(page).getAttribute('aria-label')).toBe('Alle Nachrichten');
});

test('NotionKit 1.21.0: an indeterminate checkbox shows the accent box with a dash; a radio group without a choice stays empty', async ({ page }) => {
  await openHarness(page);
  await setStage(page, `<nk-check id="mixed" indeterminate>All</nk-check><nk-check id="plain">One</nk-check>
    <nk-radio id="r1" name="g">A</nk-radio><nk-radio id="r2" name="g">B</nk-radio>`);
  const look = (id) => page.evaluate((i) => {
    const input = document.getElementById(i).shadowRoot.querySelector('input'), cs = getComputedStyle(input), after = getComputedStyle(input, '::after');
    return { bg: cs.backgroundColor, after: after.content, w: Math.round(parseFloat(after.width)), h: after.height };
  }, id);
  const accent = await page.evaluate(() => { const d = document.createElement('div'); d.style.color = 'var(--nk-accent)'; document.body.appendChild(d); const c = getComputedStyle(d).color; d.remove(); return c; });
  const mixed = await look('mixed');
  expect(mixed).toMatchObject({ bg: accent, after: '""', h: '2px' });
  expect(mixed.w).toBeGreaterThanOrEqual(7);
  expect((await look('plain')).bg).not.toBe(accent);
  // Neither radio is checked, so both match :indeterminate – and must look empty.
  expect(await page.evaluate(() => document.getElementById('r1').shadowRoot.querySelector('input').matches(':indeterminate'))).toBe(true);
  for (const id of ['r1', 'r2']) expect(await look(id)).toMatchObject({ after: 'none' });
  expect((await look('r1')).bg).not.toBe(accent);
  // The header of a partly chosen selection column draws the same dash.
  await table(page, { on: [2] });
  expect(await page.evaluate(() => {
    const input = document.getElementById('t').shadowRoot.querySelector('th.select-all input'), after = getComputedStyle(input, '::after');
    return [input.indeterminate, getComputedStyle(input).backgroundColor, after.content, after.height];
  })).toEqual([true, accent, '""', '2px']);
});

test('the header box stands over the cells\' boxes and the column is as narrow as the box', async ({ page }) => {
  await openHarness(page);
  await table(page, { on: [2] });
  const geo = await page.evaluate(() => {
    const root = document.getElementById('t').shadowRoot;
    const r = el => el.getBoundingClientRect();
    const h = r(root.querySelector('th.select-all input')), th = r(root.querySelector('th.select-all'));
    const c = r(root.querySelector('tbody input[data-key="selected"]')), td = r(root.querySelector('tbody td'));
    return { dx: Math.abs((h.left + h.width / 2) - (c.left + c.width / 2)), headerMiddle: Math.abs((h.top + h.height / 2) - (th.top + th.height / 2)), cellMiddle: Math.abs((c.top + c.height / 2) - (td.top + td.height / 2)), width: Math.round(th.width),
      rows: [...root.querySelectorAll('tbody tr')].map(tr => Math.round(tr.getBoundingClientRect().height)) };
  });
  // A checkbox cell no longer grows its row: 36px, as every other row (it was 39.5px before NotionKit 1.21.0).
  expect(geo.rows).toEqual([36, 36, 36, 36]);
  expect(geo.dx).toBeLessThan(0.5);
  expect(geo.headerMiddle).toBeLessThanOrEqual(1);
  expect(geo.cellMiddle).toBeLessThanOrEqual(1);
  expect(geo.width).toBeLessThanOrEqual(36);
});
