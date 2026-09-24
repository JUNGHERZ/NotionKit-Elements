// 1.11.0: the first findings from SupaGantt – initials, an empty switch, a
// dialog's buttons, a value set before its options, floating surfaces in a
// dialog and at the page's end, long menus, template text in the tree, the
// banner's action, a field grid that fits, the tooltip, the filter bar.
import { test, expect } from '@playwright/test';
import { openHarness, setStage } from './helpers.mjs';

const PHONE = { width: 390, height: 844 };
const settle = page => page.waitForTimeout(350);
const rect = (page, fn) => page.evaluate(f => { const r = new Function(`return (${f})()`)().getBoundingClientRect(); return { left: Math.round(r.left), top: Math.round(r.top), width: Math.round(r.width), height: Math.round(r.height), right: Math.round(r.right), bottom: Math.round(r.bottom) }; }, fn.toString());

test('nk-avatar: initials are the first letter or digit of each word', async ({ page }) => {
  await openHarness(page);
  await setStage(page, ['Planer (Dev)', 'Anna-Lena Groß', 'Sara Lindt', '„Team“ 7'].map(n => `<nk-avatar name="${n}"></nk-avatar>`).join(''));
  expect(await page.evaluate(() => [...document.querySelectorAll('nk-avatar')].map(a => a.shadowRoot.querySelector('.nk-avatar').textContent))).toEqual(['PD', 'AG', 'SL', 'T7']);
});

test('nk-switch: the fallback text is written only when it changes – the write WebKit answers with slotchange', async ({ page }) => {
  await openHarness(page);
  await setStage(page, '<nk-switch id="s"></nk-switch>');
  const writes = await page.evaluate(async () => {
    const s = document.getElementById('s'), slot = s.shadowRoot.querySelector('slot');
    let n = 0;
    new MutationObserver(r => { n += r.length; }).observe(slot, { characterData: true, subtree: true, childList: true });
    for (let i = 0; i < 5; i++) slot.dispatchEvent(new Event('slotchange'));
    await new Promise(r => setTimeout(r, 50));
    const before = n;
    s.setAttribute('text', 'Auto');
    await new Promise(r => setTimeout(r, 50));
    return [before, n - before];
  });
  expect(writes).toEqual([0, 1]);
});

test('nk-dialog: an nk-segmented inside leaves it open; the actions and data-close close it', async ({ page }) => {
  await openHarness(page);
  await setStage(page, `<nk-dialog id="d" title="Link">
    <nk-segmented id="seg" value="fs"><button value="fs">FS</button><button value="ss">SS</button></nk-segmented>
    <button id="plain" value="x">A plain button with a value</button>
    <button id="later" data-close="later">Later</button>
    <nk-btn slot="actions" variant="secondary" value="">Cancel</nk-btn>
    <nk-btn slot="actions" variant="primary" value="link" id="ok">Link</nk-btn>
  </nk-dialog>`);
  const open = () => page.evaluate(() => document.getElementById('d').open);
  await page.evaluate(() => document.getElementById('d').show());
  await settle(page);
  await page.locator('#seg button[value="ss"]').click();
  await page.locator('#plain').click();
  expect(await open()).toBe(true);
  await page.locator('#later').click();
  expect(await page.evaluate(() => [document.getElementById('d').open, document.getElementById('d').returnValue])).toEqual([false, 'later']);
  await page.evaluate(() => document.getElementById('d').show());
  await settle(page);
  await page.locator('#ok').click();
  expect(await page.evaluate(() => [document.getElementById('d').open, document.getElementById('d').returnValue])).toEqual([false, 'link']);
});

test('nk-select: a value set before its options arrive is applied when they do', async ({ page }) => {
  await openHarness(page);
  const value = await page.evaluate(async () => {
    const sel = document.createElement('nk-select');
    document.getElementById('stage').appendChild(sel);
    sel.value = 'editor';                       // a framework sets properties first …
    const early = sel.value;
    for (const [v, t] of [['viewer', 'Viewer'], ['editor', 'Editor']]) sel.appendChild(Object.assign(document.createElement('option'), { value: v, textContent: t }));
    await new Promise(r => setTimeout(r, 50));   // … the children follow
    return [early, sel.value, sel.shadowRoot.querySelector('select').value];
  });
  expect(value).toEqual(['editor', 'editor', 'editor']);
});

test('floating: before its first show() the host sits at 0/0, out of the page\'s way', async ({ page }) => {
  await openHarness(page);
  await setStage(page, '<div style="height:3000px"></div><nk-menu floating id="m"><nk-menu-item>One</nk-menu-item></nk-menu>');
  expect(await page.evaluate(() => { const r = document.getElementById('m').getBoundingClientRect(); return [r.left, r.top, document.documentElement.scrollHeight < 3300]; })).toEqual([0, 0, true]);
});

test('floating: a menu and a date picker inside an open dialog open under their anchor, unclipped', async ({ page }) => {
  await openHarness(page);
  await setStage(page, `<nk-dialog id="d" title="Filter" wide>
    <nk-btn id="a1">Owner</nk-btn> <nk-btn id="a2">Due</nk-btn>
    <nk-menu floating id="m">${Array.from({ length: 6 }, (_, i) => `<nk-menu-item>Person ${i + 1}</nk-menu-item>`).join('')}</nk-menu>
    <nk-calendar floating id="c" value="2026-06-02"></nk-calendar>
  </nk-dialog>`);
  await page.evaluate(() => document.getElementById('d').show());
  await settle(page);
  for (const [anchor, id] of [['a1', 'm'], ['a2', 'c']]) {
    await page.evaluate(([a, id]) => document.getElementById(id).show(document.getElementById(a)), [anchor, id]);
    await settle(page);
    const a = await rect(page, new Function(`return () => document.getElementById('${anchor}').shadowRoot.querySelector('button')`)());
    const pop = await rect(page, new Function(`return () => document.getElementById('${id}').shadowRoot.querySelector('.nk-pop')`)());
    const dialog = await rect(page, () => document.getElementById('d').shadowRoot.querySelector('.nk-dialog'));
    expect(pop.top - a.bottom, id).toBe(6);
    expect(pop.right, id).toBe(a.right);
    expect(pop.bottom > dialog.bottom || pop.height > 0, id).toBe(true);
    // Not clipped: the point in its bottom corner is the pop itself.
    expect(await page.evaluate(([id, x, y]) => document.elementsFromPoint(x, y).includes(document.getElementById(id)), [id, pop.right - 4, pop.bottom - 4]), id).toBe(true);
    await page.evaluate(id => document.getElementById(id).close(), id);
  }
});

test('floating: near the bottom a menu opens upwards; a long one scrolls in the room there is', async ({ page }) => {
  await openHarness(page);
  const vh = await page.evaluate(() => innerHeight);
  await setStage(page, `<div style="position:fixed;left:300px;top:${vh - 60}px"><nk-btn id="a">Owner</nk-btn></div>
    <nk-menu floating id="m">${Array.from({ length: 8 }, (_, i) => `<nk-menu-item>Person ${i + 1}</nk-menu-item>`).join('')}</nk-menu>
    <div style="position:fixed;left:600px;top:${vh / 2}px"><nk-btn id="b">Many</nk-btn></div>
    <nk-menu floating id="long">${Array.from({ length: 48 }, (_, i) => `<nk-menu-item>Person ${i + 1}</nk-menu-item>`).join('')}</nk-menu>`);
  await page.evaluate(() => document.getElementById('m').show(document.getElementById('a')));
  await settle(page);
  const a = await rect(page, () => document.getElementById('a').shadowRoot.querySelector('button'));
  const m = await rect(page, () => document.getElementById('m').shadowRoot.querySelector('.nk-pop'));
  expect(a.top - m.bottom).toBe(6);
  await page.evaluate(() => document.getElementById('m').close());
  await page.evaluate(() => document.getElementById('long').show(document.getElementById('b')));
  await settle(page);
  const l = await page.evaluate(() => { const p = document.getElementById('long').shadowRoot.querySelector('.nk-pop'), r = p.getBoundingClientRect(); return { top: r.top, bottom: r.bottom, scrolls: p.scrollHeight > p.clientHeight }; });
  expect(l.scrolls).toBe(true);
  expect(l.top).toBeGreaterThanOrEqual(8);
  expect(l.bottom).toBeLessThanOrEqual(vh - 8);
});

test('nk-tree-item: text a template engine fills later, and the space between two expressions, reach the label', async ({ page }) => {
  await openHarness(page);
  const label = await page.evaluate(async () => {
    const item = document.createElement('nk-tree-item');
    const n = document.createTextNode(''), sp = document.createTextNode(' '), t = document.createTextNode('');
    item.append(n, sp, t);
    document.getElementById('stage').appendChild(item);
    await new Promise(r => setTimeout(r, 30));
    n.data = '1'; t.data = 'Projects';           // filled after the item is built
    await new Promise(r => setTimeout(r, 30));
    return [item.label, item.shadowRoot.querySelector('.label').innerText ?? ''];
  });
  expect(label[0]).toBe('1 Projects');
  expect(await page.evaluate(() => document.querySelector('nk-tree-item').shadowRoot.querySelector('.label, .nk-tree-item .label')?.getBoundingClientRect().width > 40)).toBe(true);
});

test('nk-banner: the action is a real button; on a phone it goes under the text', async ({ page }) => {
  await openHarness(page);
  const html = '<div style="max-width:700px"><nk-banner variant="warning">⚠️ <span id="t">The “Project overview” database has 2 overdue entries that wait for an owner.</span><button slot="action" id="act">Show all overdue</button></nk-banner></div>';
  await setStage(page, html);
  const layout = () => page.evaluate(() => { const t = document.getElementById('t').getBoundingClientRect(), a = document.getElementById('act').getBoundingClientRect(), cs = getComputedStyle(document.getElementById('act')); return { below: a.top >= t.bottom - 1, textWidth: Math.round(t.width), bg: cs.backgroundColor, border: cs.borderTopWidth, underline: cs.textDecorationLine }; });
  const desk = await layout();
  expect(desk).toMatchObject({ below: false, bg: 'rgba(0, 0, 0, 0)', border: '0px', underline: 'underline' });
  await page.setViewportSize(PHONE);
  await settle(page);
  const phone = await layout();
  expect(phone.below).toBe(true);
  expect(phone.textWidth).toBeGreaterThan(250);   // the text keeps the width, not a narrow column
  await page.focus('#act');
  expect(await page.evaluate(() => document.activeElement.id)).toBe('act');
});

test('nk-fields fit: two fields in a 560px dialog are two halves', async ({ page }) => {
  await openHarness(page);
  await setStage(page, `<div style="width:512px"><nk-fields id="auto"><nk-field label="Type"><nk-input></nk-input></nk-field><nk-field label="Lag"><nk-input></nk-input></nk-field></nk-fields>
    <nk-fields fit id="fit"><nk-field label="Type"><nk-input></nk-input></nk-field><nk-field label="Lag"><nk-input></nk-input></nk-field></nk-fields></div>`);
  const widths = id => page.evaluate(id => [...document.getElementById(id).querySelectorAll('nk-field')].map(f => Math.round(f.shadowRoot.querySelector('.nk-field').getBoundingClientRect().width)), id);
  const [a, f] = [await widths('auto'), await widths('fit')];
  expect(a[0]).toBeLessThan(170);                  // three 150px columns, one empty
  expect(f).toEqual([250, 250]);                   // (512 – 12) / 2
});

test('nk-tooltip: show(rect) stays when the pointer comes from a [data-tooltip]; the wheel hides it; a line break is kept', async ({ page }) => {
  await openHarness(page);
  await setStage(page, `<div style="padding:40px"><button id="b" data-tooltip="Zoom">🔍</button><div id="bar" style="display:inline-block;margin-left:200px;width:200px;height:20px;background:#aac"></div></div><nk-tooltip id="tip"></nk-tooltip>`);
  await page.evaluate(() => document.getElementById('bar').addEventListener('pointerover', () => document.getElementById('tip').show(document.getElementById('bar').getBoundingClientRect(), 'Shell\n12.10.–30.11.')));
  await page.hover('#b');
  await page.waitForTimeout(500);
  await page.hover('#bar');
  await page.waitForTimeout(100);
  const shown = () => page.evaluate(() => { const b = document.getElementById('tip').shadowRoot.querySelector('.nk-tooltip'); return { open: b.classList.contains('open'), lines: b.classList.contains('lines'), height: Math.round(b.getBoundingClientRect().height) }; });
  const s = await shown();
  expect(s).toMatchObject({ open: true, lines: true });
  expect(s.height).toBeGreaterThanOrEqual(40);     // two lines of 16px plus padding
  await page.mouse.wheel(0, 40);
  await page.waitForTimeout(50);
  expect((await shown()).open).toBe(false);
});

test('nk-filter-bar: removing a pill leaves the caller\'s array alone', async ({ page }) => {
  await openHarness(page);
  await setStage(page, '<nk-filter-bar id="f" no-filter no-sort></nk-filter-bar>');
  const r = await page.evaluate(async () => {
    const f = document.getElementById('f'), mine = [{ key: 'a', value: 1, label: 'A' }, { key: 'b', value: 2, label: 'B' }];
    f.filters = mine;
    let reported = null;
    f.addEventListener('nk-change', e => { reported = e.detail.filters.map(x => x.label); });
    f.shadowRoot.querySelector('.fp-remove').click();
    await new Promise(r => setTimeout(r, 20));
    return [mine.length, reported, f.filters.map(x => x.label)];
  });
  expect(r).toEqual([2, ['B'], ['B']]);
});
