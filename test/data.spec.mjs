// Wave 5: database tabs + data push, table cells and sorting, board grouping
// and move(), filter bar, comments and AI input submit.
import { test, expect } from '@playwright/test';
import { openHarness, setStage } from './helpers.mjs';

const DATA = `
  const columns = [
    { key: 'name', label: 'Name', type: 'text', icon: '📄', title: true },
    { key: 'status', label: 'Status', type: 'select', options: [{ value: 'planned', label: 'Planned', color: 'orange' }, { value: 'progress', label: 'In progress', color: 'blue' }, { value: 'done', label: 'Done', color: 'green' }] },
    { key: 'owner', label: 'Owner', type: 'person' },
    { key: 'due', label: 'Due', type: 'date' },
    { key: 'progress', label: 'Progress', type: 'progress' },
    { key: 'ok', label: 'OK', type: 'checkbox' },
  ];
  const rows = [
    { id: 1, icon: '🧭', name: 'Shell', status: 'done', owner: { name: 'Marcel', initials: 'MK', color: '#9065b0' }, due: '08.05.2026', progress: 100, ok: true },
    { id: 2, icon: '🗃️', name: 'Table', status: 'progress', owner: 'Ada Lovelace', due: '20.05.2026', progress: 65, ok: false },
    { id: 3, icon: '▤', name: 'Board', status: 'planned', due: '02.06.2026', progress: 0 },
  ];`;

test('database: tabs from views, data pushed, view switch hides the other view', async ({ page }) => {
  await openHarness(page);
  await setStage(page, `<nk-database id="db" add-view><nk-table-view name="table" label="Table" count new-row></nk-table-view><nk-board-view name="board" label="Board" group-by="status"></nk-board-view></nk-database>`);
  await page.evaluate(`${DATA} const db = document.getElementById('db'); db.columns = columns; db.rows = rows;`);
  const tabs = () => [...document.getElementById('db').shadowRoot.querySelectorAll('.nk-db-tab')].map(t => t.textContent + (t.classList.contains('active') ? '*' : ''));
  expect(await page.evaluate(tabs)).toEqual(['Table3*', 'Board', '＋']);
  const state = () => ({ view: document.getElementById('db').view, tableHidden: document.querySelector('nk-table-view').hidden, boardHidden: document.querySelector('nk-board-view').hidden, rows: document.querySelector('nk-table-view').shadowRoot.querySelectorAll('tbody tr').length, cards: document.querySelector('nk-board-view').shadowRoot.querySelectorAll('.nk-card').length });
  expect(await page.evaluate(state)).toEqual({ view: 'table', tableHidden: false, boardHidden: true, rows: 3, cards: 3 });
  const events = [];
  await page.exposeFunction('ev', (t, v) => events.push([t, v]));
  await page.evaluate(() => { const db = document.getElementById('db'); db.addEventListener('nk-view-change', e => window.ev('view', e.detail.view)); db.addEventListener('nk-action', e => window.ev('action', e.detail.action)); });
  await page.evaluate(() => document.getElementById('db').shadowRoot.querySelector('[data-view=board]').click());
  expect(await page.evaluate(state)).toEqual({ view: 'board', tableHidden: true, boardHidden: false, rows: 3, cards: 3 });
  await page.evaluate(() => document.getElementById('db').shadowRoot.querySelector('[data-add]').click());
  expect(events).toEqual([['view', 'board'], ['action', 'add-view']]);
});

test('table view: polymorphic cells, row select, checkbox change, local sort', async ({ page }) => {
  await openHarness(page);
  await setStage(page, `<nk-table-view id="t" new-row sortable></nk-table-view>`);
  await page.evaluate(`${DATA} const t = document.getElementById('t'); t.columns = columns; t.rows = rows;`);
  const cells = (r) => [...document.getElementById('t').shadowRoot.querySelectorAll('tbody tr')[r].children].map(td => td.innerHTML.replace(/ style="[^"]*"/g, ''));
  const row0 = await page.evaluate(cells, 0);
  expect(row0[0]).toBe('<span class="row-title">🧭 Shell</span>');
  expect(row0[1]).toBe('<span class="nk-tag green">Done</span>');
  expect(row0[2]).toBe('<span class="person-cell"><span class="mini-avatar">MK</span> Marcel</span>');
  expect(row0[3]).toBe('<span class="date-cell">08.05.2026</span>');
  expect(row0[4]).toBe('<span class="nk-progress"><i></i></span><span class="nk-progress-label">100%</span>');
  expect(row0[5]).toContain('type="checkbox"');
  const row2 = await page.evaluate(cells, 2);
  expect(row2[2]).toBe('<span class="person-cell">—</span>');
  expect((await page.evaluate(cells, 1))[2]).toBe('<span class="person-cell"><span class="mini-avatar">AL</span> Ada Lovelace</span>');
  const events = [];
  await page.exposeFunction('ev', (t, v) => events.push([t, v]));
  await page.evaluate(() => { const t = document.getElementById('t'); t.addEventListener('nk-select', e => window.ev('select', e.detail.id)); t.addEventListener('nk-change', e => window.ev('change', e.detail.row.id + ':' + e.detail.key + '=' + e.detail.value)); t.addEventListener('nk-action', e => window.ev('action', e.detail.action + ':' + (e.detail.key || ''))); });
  await page.evaluate(() => document.getElementById('t').shadowRoot.querySelectorAll('tbody tr')[1].querySelector('.row-title').click());
  await page.evaluate(() => document.getElementById('t').shadowRoot.querySelectorAll('tbody tr')[1].querySelector('input[type=checkbox]').click());
  await page.evaluate(() => document.getElementById('t').shadowRoot.querySelector('.nk-new-row').click());
  await page.evaluate(() => document.getElementById('t').shadowRoot.querySelector('th[data-key=progress]').click());
  const order = () => [...document.getElementById('t').shadowRoot.querySelectorAll('tbody tr')].map(r => r.dataset.id);
  expect(await page.evaluate(order)).toEqual(['3', '2', '1']);
  await page.evaluate(() => document.getElementById('t').shadowRoot.querySelector('th[data-key=progress]').click());
  expect(await page.evaluate(order)).toEqual(['1', '2', '3']);
  expect(events).toEqual([['select', 2], ['change', '2:ok=true'], ['action', 'new-row:'], ['action', 'sort:progress'], ['action', 'sort:progress']]);
  expect(await page.evaluate(() => document.getElementById('t').rows[1].ok)).toBe(true);
});

test('board view: one column per option, counts, move() re-groups and reports', async ({ page }) => {
  await openHarness(page);
  await setStage(page, `<nk-board-view id="b" group-by="status" new-row></nk-board-view>`);
  await page.evaluate(`${DATA} const b = document.getElementById('b'); b.columns = columns; b.rows = rows;`);
  const cols = () => [...document.getElementById('b').shadowRoot.querySelectorAll('.nk-board-col')].map(c => c.querySelector('.nk-tag').textContent + ':' + c.querySelector('.count').textContent + ':' + [...c.querySelectorAll('.card-title')].map(t => t.textContent).join('|'));
  expect(await page.evaluate(cols)).toEqual(['Planned:1:▤ Board', 'In progress:1:🗃️ Table', 'Done:1:🧭 Shell']);
  expect(await page.evaluate(() => document.getElementById('b').shadowRoot.querySelector('.nk-card .card-meta').textContent)).toBe('📅 02.06.2026▰ 0%');
  const events = [];
  await page.exposeFunction('ev', (t, v) => events.push([t, v]));
  await page.evaluate(() => document.getElementById('b').addEventListener('nk-change', e => window.ev('change', e.detail.row.id + ':' + e.detail.key + '=' + e.detail.value)));
  await page.evaluate(() => document.getElementById('b').move(3, 'done'));
  expect(await page.evaluate(cols)).toEqual(['Planned:0:', 'In progress:1:🗃️ Table', 'Done:2:🧭 Shell|▤ Board']);
  expect(events).toEqual([['change', '3:status=done']]);
});

test('filter bar: chips, search, apply()', async ({ page }) => {
  await openHarness(page);
  await setStage(page, `<nk-filter-bar id="f" search></nk-filter-bar>`);
  await page.evaluate(`${DATA} const f = document.getElementById('f'); f.filters = [{ key: 'status', value: 'done', label: 'Status: Done' }]; window.rows = rows;`);
  expect(await page.evaluate(() => document.getElementById('f').apply(window.rows).map(r => r.id))).toEqual([1]);
  const changes = [];
  await page.exposeFunction('chg', v => changes.push(v));
  await page.evaluate(() => document.getElementById('f').addEventListener('nk-change', e => window.chg(e.detail.filters.length + ':' + e.detail.search)));
  await page.evaluate(() => document.getElementById('f').shadowRoot.querySelector('[data-index]').click());
  expect(await page.evaluate(() => document.getElementById('f').filters.length)).toBe(0);
  await page.locator('#f input').fill('tab');
  await page.waitForTimeout(250);
  expect(await page.evaluate(() => document.getElementById('f').apply(window.rows).map(r => r.id))).toEqual([2]);
  expect(changes).toEqual(['0:', '0:tab']);
});

test('comments and AI input fire nk-submit and clear', async ({ page }) => {
  await openHarness(page);
  await setStage(page, `<nk-comments id="c"><nk-comment id="cm" author="Sara Lindt" time="1 hr ago"></nk-comment></nk-comments><nk-ai-input-row id="ai"></nk-ai-input-row><nk-ai-thread><nk-ai-msg id="msg" name="Mona"><button slot="actions" value="copy">Copy</button></nk-ai-msg></nk-ai-thread>`);
  const seen = [];
  await page.exposeFunction('seen', v => seen.push(v));
  await page.evaluate(() => { document.addEventListener('nk-submit', e => window.seen(e.target.id + ':' + e.detail.text)); document.addEventListener('nk-action', e => window.seen('action:' + e.detail.action)); });
  await page.locator('#c input').fill('Hello');
  await page.keyboard.press('Enter');
  await page.locator('#ai input').fill('Summarise');
  await page.locator('#ai button').click();
  await page.locator('#msg button').click();
  expect(seen).toEqual(['c:Hello', 'ai:Summarise', 'action:copy']);
  expect(await page.evaluate(() => [document.getElementById('c').value, document.getElementById('ai').value])).toEqual(['', '']);
  expect(await page.evaluate(() => document.getElementById('cm').shadowRoot.querySelector('.c-head').textContent)).toBe('Sara Lindt · 1 hr ago');
  expect(await page.evaluate(() => document.getElementById('cm').shadowRoot.querySelector('.mini-avatar').textContent)).toBe('SL');
});
