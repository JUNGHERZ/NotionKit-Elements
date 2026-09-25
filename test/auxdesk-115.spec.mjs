// 1.15.0: what Auxdesk found in the table after its move – sorting by the
// value instead of the text shown, date formats, and text cells with a tone,
// a second line and a tooltip.
import { test, expect } from '@playwright/test';
import { openHarness, setStage } from './helpers.mjs';

const settle = page => page.waitForTimeout(350);
const setTable = (page, columns, rows, attrs = 'sortable') => page.evaluate(([c, r, a]) => {
  document.getElementById('stage').innerHTML = `<nk-table-view id="t" ${a}></nk-table-view>`;
  const t = document.getElementById('t'); t.columns = c; t.rows = r;
}, [columns, rows, attrs]);
const column = (page, i) => page.evaluate(i => [...document.getElementById('t').shadowRoot.querySelectorAll('tbody tr')].map(tr => tr.children[i].textContent), i);
const sortBy = (page, key, dir) => page.evaluate(([k, d]) => { const t = document.getElementById('t'); t.setAttribute('sort-key', k); t.setAttribute('sort-dir', d); }, [key, dir]);

test('sorting: dates by their time, selects by their options, empty cells last in both directions', async ({ page }) => {
  await openHarness(page);
  await setTable(page, [
    { key: 'name', label: 'Name', title: true },
    { key: 'due', label: 'Due', type: 'date' },
    { key: 'state', label: 'State', type: 'select', options: [{ value: 'queued', label: 'Queued' }, { value: 'posted', label: 'Posted' }, { value: 'failed', label: 'Failed' }, { value: 'ignored', label: 'Ignored' }] },
  ], [
    { id: 1, name: 'A', due: '13.09.2026', state: 'failed' },
    { id: 2, name: 'B', due: '24.08.2026', state: 'ignored' },
    { id: 3, name: 'C', due: '2026-10-02', state: 'queued' },
    { id: 4, name: 'D', due: '', state: 'posted' },
  ]);
  await sortBy(page, 'due', 'asc');
  expect(await column(page, 0)).toEqual(['B', 'A', 'C', 'D']);
  await sortBy(page, 'due', 'desc');
  expect(await column(page, 0)).toEqual(['C', 'A', 'B', 'D']);
  await sortBy(page, 'state', 'asc');
  expect(await column(page, 2)).toEqual(['Queued', 'Posted', 'Failed', 'Ignored']);
});

test('sorting: sortKey sorts by another field, a cell object by its sort', async ({ page }) => {
  await openHarness(page);
  await setTable(page, [
    { key: 'subject', label: 'Subject', title: true },
    { key: 'time', label: 'Time', sortKey: 'at' },
    { key: 'score', label: 'Score' },
  ], [
    { id: 1, subject: 'Invoice', time: 'vor 4 Min', at: '2026-09-25T10:56:00Z', score: { text: 'high', sort: 3 } },
    { id: 2, subject: 'Refund', time: '13.09.', at: '2026-09-13T08:00:00Z', score: { text: 'low', sort: 1 } },
    { id: 3, subject: 'Login', time: 'vor 2 Std', at: '2026-09-25T09:00:00Z', score: { text: 'mid', sort: 2 } },
  ]);
  await sortBy(page, 'time', 'asc');
  expect(await column(page, 1)).toEqual(['13.09.', 'vor 2 Std', 'vor 4 Min']);
  await sortBy(page, 'score', 'desc');
  expect(await column(page, 2)).toEqual(['high', 'mid', 'low']);
});

test('dates: format short, relative, Intl options and ranges; without format as given', async ({ page }) => {
  await openHarness(page);
  const cases = await page.evaluate(() => {
    const now = Date.now(), y = new Date().getFullYear();
    const iso = ms => new Date(ms).toISOString();
    return { now, y, values: [iso(now - 4 * 60000), iso(now - 3 * 3600000), `${y}-09-13`, '2024-12-24', '13.09.2026', `${y}-03-02T14:05:00`] };
  });
  await setTable(page, [
    { key: 'rel', label: 'Rel', type: 'date', format: 'relative', locale: 'de' },
    { key: 'short', label: 'Short', type: 'date', format: 'short', locale: 'de' },
    { key: 'long', label: 'Long', type: 'date', format: { day: 'numeric', month: 'long' }, locale: 'en' },
    { key: 'raw', label: 'Raw', type: 'date' },
  ], [
    { id: 1, rel: cases.values[0], short: cases.values[2], long: cases.values[5], raw: cases.values[4] },
    { id: 2, rel: cases.values[1], short: cases.values[3], long: cases.values[2], raw: { start: '01.10.2026', end: '05.10.2026' } },
    { id: 3, rel: cases.values[3], short: { start: cases.values[2], end: `${cases.y}-09-20` }, long: '', raw: 'soon' },
  ], '');
  const expected = await page.evaluate(() => {
    const rel = new Intl.RelativeTimeFormat('de', { numeric: 'auto', style: 'short' });
    return [rel.format(-4, 'minute'), rel.format(-3, 'hour')];
  });
  expect(await column(page, 0)).toEqual([expected[0], expected[1], '24.12.2024']);
  expect(await column(page, 1)).toEqual(['13.09.', '24.12.2024', '13.09. → 20.09.']);
  expect(await column(page, 2)).toEqual(['March 2', 'September 13', '—']);
  expect(await column(page, 3)).toEqual(['13.09.2026', '01.10.2026 → 05.10.2026', 'soon']);
});

test('text cells: { text, desc, color, tooltip } – a tone, a quiet second line, the whole text in a tooltip', async ({ page }) => {
  await openHarness(page);
  await page.evaluate(() => document.body.insertAdjacentHTML('beforeend', '<nk-tooltip id="tip" delay="0"></nk-tooltip>'));
  await setTable(page, [
    { key: 'subject', label: 'Subject', title: true },
    { key: 'error', label: 'Error' },
    { key: 'plain', label: 'Plain' },
  ], [
    { id: 1, subject: { text: 'Reply to MH-125', desc: 'Anna-Lena Groß' }, error: { text: 'Notion 502: Bad Gateway', desc: 'next run in 4 min', color: 'orange', tooltip: 'Notion 502: Bad Gateway – the API did not answer in 30 s' }, plain: 'ok' },
    { id: 2, subject: 'Import', error: { text: 'Quiet', color: 'nope' }, plain: 'ok' },
  ], '');
  const m = await page.evaluate(() => {
    const r = document.getElementById('t').shadowRoot, row = r.querySelector('tbody tr'), err = row.children[1];
    const text = err.querySelector('.td-text'), desc = err.querySelector('.td-desc');
    return {
      title: [row.children[0].querySelector('.row-title').textContent, row.children[0].querySelector('.td-desc').textContent],
      text: [text.className, text.textContent, text.dataset.tooltip, getComputedStyle(text).color],
      desc: [desc.textContent, getComputedStyle(desc).display, getComputedStyle(desc).fontSize],
      plain: row.children[2].innerHTML, badColor: r.querySelectorAll('tbody tr')[1].children[1].querySelector('.td-text').className,
      taller: Math.round(row.getBoundingClientRect().height) > Math.round(r.querySelectorAll('tbody tr')[1].getBoundingClientRect().height),
    };
  });
  expect(m).toEqual({
    title: ['Reply to MH-125', 'Anna-Lena Groß'],
    text: ['td-text orange', 'Notion 502: Bad Gateway', 'Notion 502: Bad Gateway – the API did not answer in 30 s', 'rgb(217, 115, 13)'],
    desc: ['next run in 4 min', 'block', '12px'],
    plain: '<span>ok</span>', badColor: 'td-text', taller: true,
  });
  // <nk-tooltip> serves the cell inside the table's shadow root.
  const box = await page.evaluate(() => { const b = document.getElementById('t').shadowRoot.querySelector('.td-text').getBoundingClientRect(); return { x: b.left + b.width / 2, y: b.top + b.height / 2 }; });
  await page.mouse.move(box.x, box.y);
  await settle(page);
  expect(await page.evaluate(() => { const t = document.getElementById('tip'); return [t.open, t.shadowRoot.querySelector('.nk-tooltip').textContent]; })).toEqual([true, 'Notion 502: Bad Gateway – the API did not answer in 30 s']);
});

test('the other views take text objects and date formats; the filter bar searches text objects', async ({ page }) => {
  await openHarness(page);
  await setStage(page, '<nk-board-view id="b" meta-keys="due"></nk-board-view><nk-list-view id="l" meta-keys="due,note"></nk-list-view><nk-gallery-view id="g" meta-keys="due" no-cover></nk-gallery-view><nk-filter-bar id="f"></nk-filter-bar>');
  const out = await page.evaluate(() => {
    const columns = [{ key: 'name', title: true }, { key: 'status', type: 'select', options: [{ value: 'open', label: 'Open' }] }, { key: 'due', type: 'date', format: { day: 'numeric', month: 'short', year: 'numeric' }, locale: 'en' }, { key: 'note', type: 'text' }];
    const rows = [{ id: 1, name: { text: 'Compliance', desc: 'LIST' }, status: 'open', due: '2026-10-30', note: { text: 'mandatory', color: 'red' } }];
    for (const id of ['b', 'l', 'g']) document.getElementById(id).setData(columns, rows);
    const r = id => document.getElementById(id).shadowRoot;
    const f = document.getElementById('f'); f.value = 'mandat';
    return {
      board: [r('b').querySelector('.card-title').textContent, r('b').querySelector('.card-meta').textContent],
      list: [r('l').querySelector('.l-title').textContent, r('l').querySelector('.l-meta').textContent],
      gallery: [r('g').querySelector('.card-title').textContent, r('g').querySelector('.card-meta').textContent],
      found: f.apply(rows).length,
    };
  });
  expect(out).toEqual({
    board: ['Compliance', '📅 Oct 30, 2026'],
    list: ['Compliance', 'Oct 30, 2026mandatory'],
    gallery: ['Compliance', '📅 Oct 30, 2026'],
    found: 1,
  });
});
