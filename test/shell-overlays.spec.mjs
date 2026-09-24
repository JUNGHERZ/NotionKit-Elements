// Shell and overlays (1.10.0): <nk-sidebar collapsible>, <nk-peek resizable
// inset>, <nk-dialog> and <nk-tooltip> – and the reference app that puts them
// where the class demo has them. 1.10.1: a disabled <nk-btn> takes the
// pointer again, so its tooltip shows.
import { test, expect } from '@playwright/test';
import { openHarness, setStage } from './helpers.mjs';

const PHONE = { width: 390, height: 844 };
const settle = page => page.waitForTimeout(350);

/** The focused element behind shadow hosts, as "tag.class" or its text. */
const deepFocus = page => page.evaluate(() => {
  let el = document.activeElement;
  while (el?.shadowRoot?.activeElement) el = el.shadowRoot.activeElement;
  return `${el.localName}.${el.className}`.trim();
});
const rect = (page, fn) => page.evaluate(f => { const r = new Function(`return (${f})()`)().getBoundingClientRect(); return { left: Math.round(r.left), top: Math.round(r.top), width: Math.round(r.width), height: Math.round(r.height), right: Math.round(r.right), bottom: Math.round(r.bottom) }; }, fn.toString());

const APP = `<nk-app style="height:600px">
  <nk-sidebar slot="sidebar" id="sb" collapsible>
    <nk-workspace-switcher slot="workspace" name="Acme"></nk-workspace-switcher>
    <nk-tree><nk-tree-item icon="🏠" value="home">Home</nk-tree-item></nk-tree>
  </nk-sidebar>
  <nk-topbar><nk-btn variant="sidebar" id="toggle" aria-label="Menu">☰</nk-btn><nk-breadcrumb><span>Page</span></nk-breadcrumb></nk-topbar>
  <div id="content" style="padding:20px">Content</div>
</nk-app>`;

// ── nk-sidebar collapsible ──────────────────────────────────────────────────

test('nk-sidebar: without collapsible there is no «; with it the « shows over the sidebar', async ({ page }) => {
  await openHarness(page);
  await setStage(page, `<div style="display:flex;height:300px"><nk-sidebar id="plain"><nk-workspace-switcher slot="workspace" name="Acme"></nk-workspace-switcher></nk-sidebar></div>`);
  expect(await page.evaluate(() => getComputedStyle(document.getElementById('plain').shadowRoot.querySelector('.nk-sidebar-collapse')).display)).toBe('none');
  await setStage(page, APP);
  const btn = () => page.evaluate(() => { const b = document.getElementById('sb').shadowRoot.querySelector('.nk-sidebar-collapse'); return [getComputedStyle(b).opacity, b.getAttribute('aria-label'), b.dataset.tooltip, b.dataset.tooltipKey]; });
  expect(await btn()).toEqual(['0', 'Close sidebar', 'Close sidebar', '⌘\\']);
  await page.hover('nk-tree-item');
  await settle(page);
  expect((await btn())[0]).toBe('1');
  // The workspace row makes room for it, as in the class markup.
  const row = await rect(page, () => document.querySelector('nk-workspace-switcher').shadowRoot.querySelector('.nk-workspace'));
  const b = await rect(page, () => document.getElementById('sb').shadowRoot.querySelector('.nk-sidebar-collapse'));
  expect(b.width).toBe(28);
  expect(b.left - row.right).toBe(4);
});

test('nk-sidebar: « collapses it, the ☰ shows and brings it back; nk-collapse and focus follow', async ({ page }) => {
  await openHarness(page);
  await setStage(page, APP);
  await page.evaluate(() => { window.events = []; document.addEventListener('nk-collapse', e => window.events.push(e.detail.collapsed)); });
  const state = () => page.evaluate(() => {
    const aside = document.getElementById('sb').shadowRoot.querySelector('.nk-sidebar'), toggle = document.getElementById('toggle').shadowRoot.querySelector('button');
    return { left: Math.round(aside.getBoundingClientRect().left), hidden: getComputedStyle(aside).visibility, toggle: getComputedStyle(toggle).display, collapsed: document.getElementById('sb').collapsed };
  });
  const start = (await state()).left;   // the stage's padding
  expect(await state()).toEqual({ left: start, hidden: 'visible', toggle: 'none', collapsed: false });
  await page.locator('#sb .nk-sidebar-collapse').focus();
  await page.keyboard.press('Enter');
  await settle(page);
  expect(await state()).toEqual({ left: start - 260, hidden: 'hidden', toggle: 'flex', collapsed: true });
  expect(await deepFocus(page)).toBe('button.nk-topbar-btn nk-sidebar-toggle collapsed');
  await page.keyboard.press('Enter');
  await settle(page);
  expect(await state()).toEqual({ left: start, hidden: 'visible', toggle: 'none', collapsed: false });
  expect(await deepFocus(page)).toBe('button.nk-sidebar-collapse');
  // ⌘\ and Ctrl+\ toggle it.
  await page.keyboard.press('Meta+Backslash');
  await page.keyboard.press('Control+Backslash');
  await page.keyboard.press('Control+Backslash');
  expect(await page.evaluate(() => window.events)).toEqual([true, false, true, false, true]);
});

test.describe('with reduced motion', () => {
  test.use({ reducedMotion: 'reduce' });
  test('nk-sidebar: the ☰ from the keyboard expands it and focus lands on the «', async ({ page }) => {
    await openHarness(page);
    await setStage(page, APP);
    await page.locator('#sb .nk-sidebar-collapse').focus();
    await page.keyboard.press('Enter');
    await settle(page);
    await page.keyboard.press('Enter');
    await settle(page);
    expect(await deepFocus(page)).toBe('button.nk-sidebar-collapse');
  });
});

test('nk-sidebar collapsed on a phone: no effect – the ☰ opens the drawer', async ({ page }) => {
  await page.setViewportSize(PHONE);
  await openHarness(page);
  await setStage(page, APP);
  await page.evaluate(() => document.getElementById('sb').collapse());
  await page.locator('#toggle').click();
  await settle(page);
  expect(await page.evaluate(() => { const aside = document.getElementById('sb').shadowRoot.querySelector('.nk-sidebar'); return [Math.round(aside.getBoundingClientRect().left), getComputedStyle(aside).visibility, document.getElementById('sb').open]; })).toEqual([0, 'visible', true]);
});

// ── nk-peek resizable, inset ────────────────────────────────────────────────

test('nk-peek resizable: the left edge sets --nk-peek-width between min and max; keys by 16px; nk-resize', async ({ page }) => {
  await openHarness(page);
  await setStage(page, `<nk-peek id="p" resizable label="Row"><p>Body</p></nk-peek>`);
  await page.evaluate(() => { window.sizes = []; const p = document.getElementById('p'); p.addEventListener('nk-resize', e => window.sizes.push(e.detail.width)); p.show(); });
  await settle(page);
  const width = () => page.evaluate(() => Math.round(document.getElementById('p').shadowRoot.querySelector('.nk-peek').getBoundingClientRect().width));
  const vw = await page.evaluate(() => innerWidth);
  expect(await width()).toBe(560);
  const h = await rect(page, () => document.getElementById('p').shadowRoot.querySelector('.pk-resize'));
  expect(h).toMatchObject({ left: vw - 564, width: 8 });
  await page.mouse.move(h.left + 4, 300);
  await page.mouse.down();
  await page.mouse.move(vw - 700, 300, { steps: 4 });
  await page.mouse.up();
  expect(await width()).toBe(700);
  expect(await page.evaluate(() => [getComputedStyle(document.documentElement).getPropertyValue('--nk-peek-width'), document.getElementById('p').open])).toEqual(['700px', true]);
  await page.locator('#p .pk-resize').focus();
  await page.keyboard.press('ArrowLeft');
  expect(await width()).toBe(716);
  await page.evaluate(() => document.getElementById('p').setAttribute('width', '100'));
  expect(await width()).toBe(380);
  expect(await page.evaluate(() => window.sizes)).toEqual([700, 716]);
});

test('nk-peek inset: while open on the desktop the app makes room; closed or on a phone it does not', async ({ page }) => {
  await openHarness(page);
  await setStage(page, `${APP}<nk-peek id="p" inset label="Row"><p>Body</p></nk-peek>`);
  await page.evaluate(() => document.documentElement.style.setProperty('--nk-peek-width', '420px'));
  const pad = () => page.evaluate(() => [document.querySelector('nk-app').hasAttribute('peek-inset'), getComputedStyle(document.querySelector('nk-app').shadowRoot.querySelector('.nk-main')).paddingRight]);
  expect(await pad()).toEqual([false, '0px']);
  await page.evaluate(() => document.getElementById('p').show());
  await settle(page);
  expect(await pad()).toEqual([true, '420px']);
  await page.evaluate(() => document.getElementById('p').close());
  await settle(page);
  expect(await pad()).toEqual([false, '0px']);
  await page.setViewportSize(PHONE);
  await page.evaluate(() => document.getElementById('p').show());
  await settle(page);
  expect(await pad()).toEqual([false, '0px']);
});

// ── nk-dialog ───────────────────────────────────────────────────────────────

const TRASH = `<nk-dialog id="d" alert title="Move to trash?">
  The page can be restored for 30 days.
  <nk-btn slot="actions" variant="secondary" value="">Cancel</nk-btn>
  <nk-btn slot="actions" variant="danger-solid" value="trash">Move to trash</nk-btn>
</nk-dialog>`;

test('nk-dialog: 440px in the middle, named by its title; focus on the first button; a button closes with its value', async ({ page }) => {
  await openHarness(page);
  await setStage(page, `<button id="opener">Open</button>${TRASH}`);
  await page.evaluate(() => { window.log = []; const d = document.getElementById('d'); d.addEventListener('nk-close', e => window.log.push(`close:${e.detail.value}`)); d.addEventListener('nk-toggle', e => window.log.push(`toggle:${e.detail.open}`)); });
  await page.focus('#opener');
  await page.evaluate(() => document.getElementById('d').show());
  await settle(page);
  const m = await page.evaluate(() => {
    const box = document.getElementById('d').shadowRoot.querySelector('.nk-dialog'), r = box.getBoundingClientRect();
    return { width: r.width, centre: Math.round(r.left + r.width / 2) === Math.round(innerWidth / 2), role: box.getAttribute('role'), title: box.shadowRoot ? null : box.querySelector('#title').textContent, labelled: box.getAttribute('aria-labelledby'), z: getComputedStyle(box.parentElement).zIndex };
  });
  expect(m).toEqual({ width: 440, centre: true, role: 'alertdialog', title: 'Move to trash?', labelled: 'title', z: '105' });
  expect(await deepFocus(page)).toBe('button.nk-btn secondary');
  expect(await page.evaluate(() => document.getElementById('d').hasAttribute('title'))).toBe(false);   // never a tooltip
  await page.locator('#d nk-btn[value="trash"]').click();
  await settle(page);
  expect(await page.evaluate(() => [document.getElementById('d').open, document.getElementById('d').returnValue, window.log, document.activeElement.id])).toEqual([false, 'trash', ['toggle:true', 'close:trash', 'toggle:false'], 'opener']);
});

test('nk-dialog: nk-close can be cancelled – an input dialog checks its field; a form with method="dialog" submits', async ({ page }) => {
  await openHarness(page);
  await setStage(page, `<nk-dialog id="d" wide title="New view">
    <form method="dialog" id="f"><nk-input id="name" autofocus></nk-input><button type="submit" value="create" id="go">Create</button></form>
    <nk-btn slot="actions" variant="secondary" value="">Cancel</nk-btn>
  </nk-dialog>`);
  await page.evaluate(() => {
    const d = document.getElementById('d');
    d.addEventListener('nk-close', e => { if (e.detail.value === 'create' && !document.getElementById('name').value) e.preventDefault(); });
    d.show();
  });
  await settle(page);
  expect(await page.evaluate(() => Math.round(document.getElementById('d').shadowRoot.querySelector('.nk-dialog').getBoundingClientRect().width))).toBe(560);
  expect(await deepFocus(page)).toMatch(/^input\.nk-input/);   // [autofocus]
  await page.click('#go');
  expect(await page.evaluate(() => document.getElementById('d').open)).toBe(true);   // empty: kept open
  await page.locator('#name input').fill('Timeline');
  await page.click('#go');
  expect(await page.evaluate(() => [document.getElementById('d').open, document.getElementById('d').returnValue])).toEqual([false, 'create']);
});

test('nk-dialog over a modal and a peek: Escape and the backdrop close only the dialog', async ({ page }) => {
  await openHarness(page);
  await setStage(page, `<nk-peek id="p" label="Row"><p>Body</p></nk-peek><nk-modal id="m"><nk-settings-pane value="a" title="A">Pane</nk-settings-pane></nk-modal>${TRASH}`);
  await page.evaluate(() => { document.getElementById('p').show(); document.getElementById('m').show(); });
  await settle(page);
  await page.evaluate(() => document.getElementById('d').show());
  await settle(page);
  expect(await deepFocus(page)).toBe('button.nk-btn secondary');   // the modal made the dialog inert; it lifts that
  await page.keyboard.press('Escape');
  await settle(page);
  expect(await page.evaluate(() => ['d', 'm', 'p'].map(id => document.getElementById(id).open))).toEqual([false, true, true]);
  await page.evaluate(() => document.getElementById('d').show());
  await settle(page);
  await page.mouse.click(10, 10);
  await settle(page);
  expect(await page.evaluate(() => ['d', 'm'].map(id => document.getElementById(id).open))).toEqual([false, true]);
});

test('nk-dialog on a phone: a bottom sheet, the confirming button on top across the width', async ({ page }) => {
  await page.setViewportSize(PHONE);
  await openHarness(page);
  await setStage(page, TRASH);
  await page.evaluate(() => document.getElementById('d').show());
  await settle(page);
  expect(await page.evaluate(() => {
    const r = document.getElementById('d').shadowRoot, box = r.querySelector('.nk-dialog').getBoundingClientRect();
    const [cancel, trash] = [...document.querySelectorAll('#d nk-btn')].map(b => b.shadowRoot.querySelector('button').getBoundingClientRect());
    return { left: box.left, right: box.right, bottom: Math.round(box.bottom), trashOnTop: trash.bottom <= cancel.top, wide: Math.round(trash.width) === Math.round(cancel.width) && trash.width > 300 };
  })).toEqual({ left: 0, right: PHONE.width, bottom: PHONE.height, trashOnTop: true, wide: true });
});

// ── nk-tooltip ──────────────────────────────────────────────────────────────

test('nk-tooltip: every [data-tooltip] after 400ms, 6px below and centred, with its key; a press hides it', async ({ page }) => {
  await openHarness(page);
  await setStage(page, `<div style="padding:40px 200px"><nk-btn variant="topbar" id="a" aria-label="More" data-tooltip="Style, export and more">⋯</nk-btn>
    <button id="b" data-tooltip="Close sidebar" data-tooltip-key="⌘\\">«</button></div><nk-tooltip id="tip"></nk-tooltip>`);
  const tip = () => page.evaluate(() => { const t = document.getElementById('tip'), b = t.shadowRoot.querySelector('.nk-tooltip'), r = b.getBoundingClientRect(); return { open: b.classList.contains('open'), text: b.textContent, key: b.querySelector('.tt-key').hidden ? null : b.querySelector('.tt-key').textContent, left: r.left, top: Math.round(r.top), width: r.width }; });
  await page.hover('#a');
  await page.waitForTimeout(200);
  expect((await tip()).open).toBe(false);
  await page.waitForTimeout(350);
  const a = await rect(page, () => document.getElementById('a').shadowRoot.querySelector('button'));
  const t = await tip();
  expect(t).toMatchObject({ open: true, text: 'Style, export and more', key: null });
  expect(t.top - a.bottom).toBe(6);
  expect(Math.abs(t.left + t.width / 2 - (a.left + a.width / 2))).toBeLessThanOrEqual(1);
  await page.hover('#b');
  await page.waitForTimeout(550);
  expect(await tip()).toMatchObject({ open: true, text: 'Close sidebar⌘\\', key: '⌘\\' });
  expect(await page.evaluate(() => document.getElementById('b').getAttribute('aria-describedby'))).toBe('tip');
  await page.mouse.down();
  expect((await tip()).open).toBe(false);
  expect(await page.evaluate(() => document.getElementById('b').hasAttribute('aria-describedby'))).toBe(false);
});

test('nk-tooltip: `for` with its own content; at once on keyboard focus; show(rect) above where the window ends; never on touch', async ({ page }) => {
  await openHarness(page);
  await setStage(page, `<button id="save">Save</button><nk-tooltip id="own" for="save" shortcut="⌘S">Save the page</nk-tooltip>`);
  await page.focus('#save');
  await page.keyboard.press('Shift+Tab');
  await page.keyboard.press('Tab');
  expect(await page.evaluate(() => { const b = document.getElementById('own').shadowRoot.querySelector('.nk-tooltip'); return [b.classList.contains('open'), document.getElementById('own').textContent.trim(), b.querySelector('.tt-key').textContent]; })).toEqual([true, 'Save the page', '⌘S']);
  // A bar at the bottom of the window: the tooltip goes above it.
  const vh = await page.evaluate(() => innerHeight);
  await page.evaluate(h => document.getElementById('own').show({ left: 100, top: h - 30, right: 300, bottom: h - 10 }, 'Shell · 12.10.–30.11.'), vh);
  expect(await page.evaluate(() => { const r = document.getElementById('own').getBoundingClientRect(); return [Math.round(r.bottom), Math.round(r.left + r.width / 2), document.getElementById('own').shadowRoot.querySelector('.nk-tooltip').textContent]; })).toEqual([vh - 36, 200, 'Shell · 12.10.–30.11.⌘S']);
  await page.evaluate(() => document.getElementById('own').hide());
  // Touch shows nothing.
  await page.evaluate(() => document.getElementById('save').dispatchEvent(new PointerEvent('pointerover', { bubbles: true, composed: true, pointerType: 'touch' })));
  await page.waitForTimeout(550);
  expect(await page.evaluate(() => document.getElementById('own').open)).toBe(false);
});

test('nk-tooltip on a disabled nk-btn: the hint that says why shows; a click reaches nothing', async ({ page }) => {
  await openHarness(page);
  await setStage(page, `<div id="row" style="padding:40px"><nk-btn id="b" variant="primary" disabled data-tooltip="Connect Notion first">Send</nk-btn>
    <nk-btn id="l" href="#x" variant="secondary" disabled>Link</nk-btn></div><nk-tooltip id="tip"></nk-tooltip>`);
  await page.evaluate(() => { window.clicks = []; for (const id of ['b', 'l', 'row']) document.getElementById(id).addEventListener('click', () => window.clicks.push(id)); });
  await page.locator('#b button').hover({ force: true });
  await page.waitForTimeout(550);
  expect(await page.evaluate(() => { const b = document.getElementById('tip').shadowRoot.querySelector('.nk-tooltip'); return [b.classList.contains('open'), b.textContent]; })).toEqual([true, 'Connect Notion first']);
  expect(await page.evaluate(() => ['b', 'l'].map(id => { const cs = getComputedStyle(document.getElementById(id).shadowRoot.querySelector('.nk-btn')); return [cs.opacity, cs.cursor]; }))).toEqual([['0.5', 'not-allowed'], ['0.5', 'not-allowed']]);
  await page.locator('#b button').click({ force: true });
  await page.locator('#l a').click({ force: true });
  // Nothing: not the button, not the row behind it – which took the click while the button had pointer-events: none.
  expect(await page.evaluate(() => [window.clicks, location.hash])).toEqual([[], '']);
});

// ── The reference app ───────────────────────────────────────────────────────

test('app: the page menu asks before the trash; the ＋ view tab asks for a name; Enter creates', async ({ page }) => {
  await page.goto('/app.html');
  await page.locator('#pageMenuBtn').click();
  await page.locator('#pageOptions nk-menu-item[value="trash"]').click();
  await settle(page);
  await page.locator('#trashDialog nk-btn[value="trash"]').click();
  await settle(page);
  expect(await page.evaluate(() => [document.getElementById('toast').shadowRoot.textContent.includes('Moved to trash'), document.activeElement.id])).toEqual([true, 'pageMenuBtn']);
  await page.locator('#db .nk-db-tab.add').click();
  await settle(page);
  expect(await deepFocus(page)).toMatch(/^input\.nk-input/);
  await page.keyboard.type('Timeline');
  await page.keyboard.press('Enter');
  await settle(page);
  expect(await page.evaluate(() => [document.getElementById('viewDialog').open, document.getElementById('toast').shadowRoot.textContent.includes('View “Timeline” created as table')])).toEqual([false, true]);
});

test('app: « collapses the sidebar, ☰ brings it back; ⋯ has its tooltip; the peek can be dragged wider', async ({ page }) => {
  await page.goto('/app.html#peek');
  await settle(page);
  const h = await rect(page, () => document.getElementById('sidePeek').shadowRoot.querySelector('.pk-resize'));
  await page.mouse.move(h.left + 4, 300);
  await page.mouse.down();
  const vw = await page.evaluate(() => innerWidth);
  await page.mouse.move(vw - 720, 300, { steps: 4 });
  await page.mouse.up();
  expect(await page.evaluate(() => Math.round(document.getElementById('sidePeek').width))).toBe(720);
  await page.keyboard.press('Escape');
  await settle(page);
  await page.hover('nk-tree-item[value="home"]');
  await page.locator('#sidebar .nk-sidebar-collapse').click();
  await settle(page);
  expect(await page.evaluate(() => Math.round(document.querySelector('nk-app').shadowRoot.querySelector('.nk-main').getBoundingClientRect().width))).toBe(vw);
  await page.locator('#menuBtn').click();
  await settle(page);
  expect(await page.evaluate(() => Math.round(document.querySelector('nk-app').shadowRoot.querySelector('.nk-main').getBoundingClientRect().width))).toBe(vw - 260);
  await page.hover('#pageMenuBtn');
  await page.waitForTimeout(600);
  expect(await page.evaluate(() => document.querySelector('nk-tooltip').shadowRoot.querySelector('.nk-tooltip').textContent)).toBe('Style, export and more');
});
