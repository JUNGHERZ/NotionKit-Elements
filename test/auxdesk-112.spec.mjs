// 1.12.0: what Auxdesk's move to 1.11 found – the panel's end slot, flush
// lists, text values and the narrow column, steps with states that can be
// clicked and set in a row, tabs that scroll, and the table's row actions and
// links of its own.
import { test, expect } from '@playwright/test';
import { openHarness, setStage, comparePng } from './helpers.mjs';

const settle = page => page.waitForTimeout(350);
const shadow = (page, sel, inner, fn) => page.evaluate(([s, i, f]) => new Function('el', `return (${f})(el)`)(document.querySelector(s).shadowRoot.querySelector(i)), [sel, inner, fn.toString()]);

test('nk-panel: slot="end" sits at the right edge of the title; without it the head is the title alone', async ({ page }) => {
  await openHarness(page);
  await setStage(page, `<div style="width:420px"><nk-panel id="a" title="Contacts database"><nk-tag slot="end" color="green">Connected</nk-tag><p>Rows land in “Contacts”.</p></nk-panel></div>
    <div style="width:420px"><nk-panel id="b" title="Weekly review"><p>Three pages changed.</p></nk-panel></div>
    <div style="width:420px"><nk-panel id="c"><p>No title.</p></nk-panel></div>`);
  const m = await page.evaluate(() => {
    const box = id => document.getElementById(id).shadowRoot.querySelector('.nk-panel');
    const a = box('a'), end = a.querySelector('.p-end').getBoundingClientRect(), h = a.querySelector('h3').getBoundingClientRect(), p = a.getBoundingClientRect();
    return {
      endRight: Math.round(p.right - end.right), sameRow: Math.abs((h.top + h.height / 2) - (end.top + end.height / 2)) <= 1,
      b: [getComputedStyle(box('b').querySelector('.p-end')).display, getComputedStyle(box('b').querySelector('.p-head')).display],
      c: getComputedStyle(box('c').querySelector('.p-head')).display,
    };
  });
  expect(m).toEqual({ endRight: 17, sameRow: true, b: ['none', 'flex'], c: 'none' });
  // The end arrives later – a framework renders it after the panel.
  await page.evaluate(() => { const t = document.createElement('nk-tag'); t.slot = 'end'; t.textContent = 'New'; document.getElementById('b').appendChild(t); });
  await settle(page);
  expect(await shadow(page, '#b', '.p-end', el => getComputedStyle(el).display)).toBe('flex');
});

test('nk-props and nk-panels: flush drops the outer margin', async ({ page }) => {
  await openHarness(page);
  await setStage(page, '<nk-props id="a"><nk-prop label="Status">Open</nk-prop></nk-props><nk-props id="b" flush><nk-prop label="Status">Open</nk-prop></nk-props><nk-panels id="c"></nk-panels><nk-panels id="d" flush></nk-panels>');
  const margins = () => page.evaluate(() => [['a', '.nk-props'], ['b', '.nk-props'], ['c', '.nk-panels'], ['d', '.nk-panels']].map(([id, s]) => getComputedStyle(document.getElementById(id).shadowRoot.querySelector(s)).margin));
  expect(await margins()).toEqual(['0px 0px 20px', '0px', '12px 0px', '0px']);
  await page.evaluate(() => { document.getElementById('b').flush = false; document.getElementById('c').flush = true; });
  expect(await margins()).toEqual(['0px 0px 20px', '0px 0px 20px', '0px', '0px']);
});

test('nk-prop: text flows as text; in a column under 380px the value moves under its name', async ({ page }) => {
  await openHarness(page);
  await setStage(page, `<div id="w" style="width:600px"><nk-props><nk-prop id="p" label="Triage" icon="🤖" text>on · <code>bedrock/claude-opus-5@eu-central-1</code> · <nk-tag color="blue">EU</nk-tag></nk-prop></nk-props></div>`);
  const pos = () => page.evaluate(() => { const r = document.getElementById('p').shadowRoot; const n = r.querySelector('.p-name').getBoundingClientRect(), v = r.querySelector('.p-value').getBoundingClientRect(); return { below: v.top >= n.bottom - 1, width: Math.round(v.width), display: getComputedStyle(r.querySelector('.p-value')).display, text: r.querySelector('.p-value').classList.contains('text') }; });
  expect(await pos()).toEqual({ below: false, width: 440, display: 'block', text: true });
  await page.evaluate(() => { document.getElementById('w').style.width = '340px'; });
  await settle(page);
  expect(await pos()).toEqual({ below: true, width: 340, display: 'block', text: true });
  await page.evaluate(() => { document.getElementById('p').text = false; });
  expect((await pos()).display).toBe('flex');
});

test('nk-steps: states per step, selectable labels fire nk-select and move current, horizontal is one row', async ({ page }) => {
  await openHarness(page);
  await setStage(page, '<nk-steps id="s" current="4" selectable horizontal></nk-steps>');
  await page.evaluate(() => { document.getElementById('s').steps = [{ label: 'Inbox' }, { label: 'Database', state: 'open' }, { label: 'Forwarding', state: 'skipped', desc: 'optional' }, { label: 'Test', value: 'test' }, 'Done', { label: 'Later', state: 'done' }]; });
  const state = () => page.evaluate(() => [...document.getElementById('s').shadowRoot.querySelectorAll('li')].map(li => [[...li.classList].filter(c => c !== 'nk-step').join(' '), li.querySelector('.st-mark').textContent, li.querySelector('.st-label')?.localName]));
  expect(await state()).toEqual([
    ['done', '✓', 'button'], ['', '2', 'button'], ['skipped', '–', 'button'], ['current', '4', 'button'], ['', '5', 'button'], ['done', '✓', 'button'],
  ]);
  expect(await shadow(page, '#s', 'ol', el => [el.classList.contains('horizontal'), getComputedStyle(el).flexDirection])).toEqual([true, 'row']);
  // A click on a step: nk-select { index, value, step }, then it is current.
  const events = await page.evaluate(() => { const s = document.getElementById('s'); const got = []; s.addEventListener('nk-select', e => got.push({ index: e.detail.index, value: e.detail.value })); s.shadowRoot.querySelectorAll('.st-label')[1].click(); return got; });
  expect(events).toEqual([{ index: 2, value: 'Database' }]);
  expect(await page.evaluate(() => document.getElementById('s').current)).toBe(2);
  // Cancelled, the step stays where it was; the keyboard keeps its place.
  await page.evaluate(() => document.getElementById('s').addEventListener('nk-select', e => { if (e.detail.index === 5) e.preventDefault(); }));
  await page.evaluate(() => document.getElementById('s').shadowRoot.querySelectorAll('.st-label')[4].click());
  expect(await page.evaluate(() => document.getElementById('s').current)).toBe(2);
  await page.evaluate(() => document.getElementById('s').shadowRoot.querySelectorAll('.st-label')[3].focus());
  await page.keyboard.press('Enter');
  expect(await page.evaluate(() => [document.getElementById('s').current, document.getElementById('s').shadowRoot.activeElement?.closest('li')?.dataset.index])).toEqual([4, '4']);
  // Without selectable the labels are plain text and a click selects nothing.
  await page.evaluate(() => { document.getElementById('s').selectable = false; document.getElementById('s').shadowRoot.querySelector('li').click(); });
  expect(await page.evaluate(() => [document.getElementById('s').current, document.getElementById('s').shadowRoot.querySelector('.st-label')])).toEqual([4, null]);
});

test('nk-tabs: scroll keeps many tabs in one row and the active tab in view', async ({ page }) => {
  await openHarness(page);
  const tabs = Array.from({ length: 10 }, (_, i) => `<nk-tab value="t${i + 1}">Tab number ${i + 1}</nk-tab>`).join('');
  const three = '<nk-tab value="a">Notes</nk-tab><nk-tab value="b">Tasks</nk-tab><nk-tab value="c">Files</nk-tab>';
  await setStage(page, `<div style="width:420px"><nk-tabs id="t" scroll value="t9">${tabs}</nk-tabs></div>
    <div id="p" style="width:420px;margin-top:20px"><nk-tabs value="a">${three}</nk-tabs></div><div id="s" style="width:420px;margin-top:20px"><nk-tabs scroll value="a">${three}</nk-tabs></div>`);
  await settle(page);
  // A strip that fits looks the same with and without scroll.
  expect(comparePng(await page.locator('#p').screenshot(), await page.locator('#s').screenshot()).mismatched).toBe(0);
  const view = () => page.evaluate(() => {
    const strip = document.getElementById('t').shadowRoot.querySelector('.nk-tabs'), r = strip.getBoundingClientRect();
    const active = document.querySelector('#t nk-tab[active]').shadowRoot.querySelector('.nk-tab').getBoundingClientRect();
    return { scroll: strip.classList.contains('scroll'), overflows: strip.scrollWidth > strip.clientWidth, inView: active.left >= r.left && active.right <= r.right, noScrollY: strip.scrollHeight === strip.clientHeight };
  });
  expect(await view()).toEqual({ scroll: true, overflows: true, inView: true, noScrollY: true });
  // Back to the first tab: the row scrolls to it, smoothly where motion is allowed.
  await page.evaluate(() => { document.getElementById('t').value = 't1'; });
  await expect.poll(async () => (await view()).inView, { timeout: 3000 }).toBe(true);
});

test('nk-table-view: an actions column sets buttons per row; a click fires nk-action, not nk-select; url objects link with their own text', async ({ page }) => {
  await openHarness(page);
  await setStage(page, '<nk-table-view id="t" sortable></nk-table-view>');
  await page.evaluate(() => {
    const t = document.getElementById('t');
    t.columns = [
      { key: 'name', label: 'Job', title: true },
      { key: 'ref', label: 'Refers to', type: 'url' },
      { key: 'actions', type: 'actions', actions: [{ action: 'retry', label: 'Retry' }, { action: 'discard', label: 'Discard', danger: true }, { action: 'wait', label: 'Wait', disabled: true, tooltip: 'Nothing to wait for' }] },
    ];
    t.rows = [{ id: 1, name: 'Reply to MH-125', ref: { href: '#/tickets/125', label: 'MH-125' } }, { id: 2, name: 'Import', ref: 'https://example.com/import', actions: ['discard'] }];
  });
  const cells = await page.evaluate(() => {
    const r = document.getElementById('t').shadowRoot;
    return {
      head: [r.querySelector('thead th:last-child').className, r.querySelector('thead th:last-child').hasAttribute('data-key'), r.querySelector('thead th:last-child').textContent],
      rows: [...r.querySelectorAll('tbody tr')].map(tr => [...tr.querySelectorAll('.row-actions button')].map(b => `${b.className}|${b.dataset.action}|${b.disabled}|${b.dataset.tooltip ?? ''}`)),
      links: [...r.querySelectorAll('tbody a')].map(a => [a.textContent, a.getAttribute('href'), a.target]),
    };
  });
  expect(cells).toEqual({
    head: ['actions', false, ''],
    rows: [['nk-btn secondary small|retry|false|', 'nk-btn danger small|discard|false|', 'nk-btn secondary small|wait|true|Nothing to wait for'], ['nk-btn danger small|discard|false|']],
    links: [['MH-125', '#/tickets/125', ''], ['example.com/import', 'https://example.com/import', '_blank']],
  });
  const events = await page.evaluate(() => {
    const t = document.getElementById('t'), got = [];
    for (const type of ['nk-action', 'nk-select']) t.addEventListener(type, e => got.push([type, e.detail.action ?? null, e.detail.id ?? null, e.detail.anchor?.localName ?? null]));
    const r = t.shadowRoot;
    r.querySelector('button[data-action="retry"]').click();
    r.querySelector('button[data-action="wait"]').click();
    r.querySelector('thead th:last-child').click();
    r.querySelector('tbody tr td').click();
    return got;
  });
  expect(events).toEqual([['nk-action', 'retry', 1, 'button'], ['nk-select', null, 1, null]]);
});
