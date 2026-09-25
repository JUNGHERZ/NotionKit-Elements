// 1.19.0: Auxdesk's wish 24 – a toast with an action – and a toast that
// hides by itself again without a duration attribute; SupaGantt's findings
// 14 to 16 – the focus back into a shadow root, Escape for the top layer
// only, a long menu that opens at its top.
import { test, expect } from '@playwright/test';
import { openHarness, setStage } from './helpers.mjs';

const settle = page => page.waitForTimeout(350);
const deep = () => { let el = document.activeElement; while (el?.shadowRoot?.activeElement) el = el.shadowRoot.activeElement; return el; };

test('<nk-toast> without a duration attribute hides after 2200ms again; the attribute and show()\'s duration still set it', async ({ page }) => {
  await openHarness(page);
  await setStage(page, '<nk-toast id="a"></nk-toast><nk-toast id="b" duration="300"></nk-toast><nk-toast id="c"></nk-toast>');
  await page.evaluate(() => { document.getElementById('a').show('Saved'); document.getElementById('b').show('Saved'); document.getElementById('c').show('Saved', { duration: 0 }); });
  await page.waitForTimeout(700);
  expect(await page.evaluate(() => ['a', 'b', 'c'].map(id => document.getElementById(id).open))).toEqual([true, false, true]);
  await page.waitForTimeout(1900);
  expect(await page.evaluate(() => ['a', 'b', 'c'].map(id => document.getElementById(id).open))).toEqual([false, false, true]);
});

test('<nk-toast> with an action: a button and a ×, it stays, the action fires nk-action and closes, a cancelled one keeps it', async ({ page }) => {
  await openHarness(page);
  await setStage(page, '<nk-toast id="t" duration="200"></nk-toast>');
  await page.evaluate(() => {
    window.got = [];
    const t = document.getElementById('t');
    t.addEventListener('nk-action', e => { window.got.push(e.detail); if (window.keep) e.preventDefault(); });
    t.show('Moved to trash', { action: { label: 'Undo', value: 'undo' } });
  });
  await page.waitForTimeout(500);                                   // the attribute's 200ms is for plain messages
  const look = () => page.evaluate(() => { const r = document.getElementById('t').shadowRoot; return { open: document.getElementById('t').open, text: r.querySelector('.nk-toast').textContent, action: r.querySelector('.t-action')?.textContent ?? null, close: r.querySelector('.t-close')?.getAttribute('aria-label') ?? null }; });
  expect(await look()).toEqual({ open: true, text: '✓Moved to trashUndo', action: 'Undo', close: 'Close' });
  // A real click reaches the button of a shown toast.
  await page.evaluate(() => { window.keep = true; });
  await page.locator('#t .t-action').click();
  expect(await page.evaluate(() => [window.got, document.getElementById('t').open])).toEqual([[{ action: 'undo', value: 'undo', label: 'Undo' }], true]);
  await page.evaluate(() => { window.keep = false; });
  await page.locator('#t .t-action').click();
  expect(await page.evaluate(() => [window.got.length, document.getElementById('t').open])).toEqual([2, false]);
  // Hidden, its buttons leave the tab order and take no pointer.
  await settle(page);
  expect(await page.evaluate(() => { const b = document.getElementById('t').shadowRoot.querySelector('.t-action'); return [b.tabIndex, getComputedStyle(b).pointerEvents]; })).toEqual([-1, 'none']);
  // The × closes; a plain message after it has neither button.
  await page.evaluate(() => document.getElementById('t').show('Moved to trash', { action: { label: 'Undo', value: 'undo' } }));
  await page.locator('#t .t-close').click();
  expect(await page.evaluate(() => document.getElementById('t').open)).toBe(false);
  await page.evaluate(() => document.getElementById('t').show('Saved'));
  expect(await look()).toEqual({ open: true, text: '✓Saved', action: null, close: null });
});

test('<nk-toast>: an action with a duration waits while the pointer is on it; Escape inside closes the toast only', async ({ page }) => {
  await openHarness(page);
  await setStage(page, '<nk-toast id="t"></nk-toast><nk-dialog id="d" title="Dialog"><nk-btn id="inside">Inside</nk-btn></nk-dialog>');
  // Long enough for the pointer to get there first; then held well past it.
  await page.evaluate(() => document.getElementById('t').show('Moved to trash', { action: { label: 'Undo', value: 'undo' }, duration: 1200 }));
  await settle(page);
  await page.locator('#t .t-action').hover();
  await page.waitForTimeout(1500);
  expect(await page.evaluate(() => document.getElementById('t').open)).toBe(true);
  await page.mouse.move(5, 5);
  await page.waitForTimeout(1500);
  expect(await page.evaluate(() => document.getElementById('t').open)).toBe(false);
  // A dialog is open; the focus moves into a toast shown over it; Escape closes the toast, not the dialog.
  await page.evaluate(() => { document.getElementById('d').show(); });
  await settle(page);
  await page.evaluate(() => document.getElementById('t').show('Moved to trash', { action: { label: 'Undo', value: 'undo' } }));
  await page.evaluate(() => document.getElementById('t').shadowRoot.querySelector('.t-action').focus());
  await page.keyboard.press('Escape');
  expect(await page.evaluate(() => [document.getElementById('t').open, document.getElementById('d').open])).toEqual([false, true]);
});

test('<nk-toast> with a slotted action: stays, carries the ×, the click fires nk-action with the button\'s value', async ({ page }) => {
  await openHarness(page);
  await setStage(page, '<nk-toast id="t" icon="✨"><button slot="action" value="reload">Reload</button></nk-toast>');
  await page.evaluate(() => { window.got = []; const t = document.getElementById('t'); t.addEventListener('nk-action', e => window.got.push(e.detail)); t.show('A new version of Auxdesk is ready'); });
  await page.waitForTimeout(2600);
  expect(await page.evaluate(() => [document.getElementById('t').open, !!document.getElementById('t').shadowRoot.querySelector('.t-close')])).toEqual([true, true]);
  await page.locator('#t button[slot="action"]').click();
  expect(await page.evaluate(() => [window.got, document.getElementById('t').open])).toEqual([[{ action: 'reload', value: 'reload', label: 'Reload' }], false]);
});

for (const order of ['dialog first', 'picker first']) {
  test(`Escape closes the top layer only – a date picker or menu opened from a dialog, then the dialog (${order})`, async ({ page }) => {
    await openHarness(page);
    const dialog = '<nk-dialog id="d" title="Due"><nk-btn id="pick">Pick a date</nk-btn><nk-btn id="more">More</nk-btn></nk-dialog>';
    const layers = '<nk-calendar id="cal" floating></nk-calendar><nk-menu id="menu" floating><nk-menu-item value="a">A</nk-menu-item></nk-menu>';
    await setStage(page, order === 'dialog first' ? dialog + layers : layers + dialog);
    const state = () => page.evaluate(() => ['d', 'cal', 'menu'].map(id => document.getElementById(id).open));
    await page.evaluate(() => document.getElementById('d').show());
    await settle(page);
    await page.evaluate(() => document.getElementById('cal').show(document.getElementById('pick')));
    await settle(page);
    await page.keyboard.press('Escape');
    expect(await state()).toEqual([true, false, false]);
    await page.evaluate(() => document.getElementById('menu').show(document.getElementById('more')));
    await settle(page);
    await page.keyboard.press('Escape');
    expect(await state()).toEqual([true, false, false]);
    await page.keyboard.press('Escape');
    expect(await state()).toEqual([false, false, false]);
  });
}

test('focus goes back into a shadow root when a floating menu, the modal or the palette closes', async ({ page }) => {
  await openHarness(page);
  await setStage(page, '<div id="view"></div><nk-menu id="menu" floating><nk-menu-item value="a">A</nk-menu-item><nk-menu-item value="b">B</nk-menu-item></nk-menu><nk-modal id="modal"><nk-settings-pane name="p" label="Profile" title="Profile"><nk-input value="x"></nk-input></nk-settings-pane></nk-modal><nk-cmdk id="cmdk"></nk-cmdk>');
  await page.evaluate(() => {
    const root = document.getElementById('view').attachShadow({ mode: 'open' });
    root.innerHTML = '<button id="trigger">Owner</button>';
  });
  const back = () => page.evaluate(d => eval(`(${d})`)()?.id ?? null, deep.toString());
  const focusTrigger = () => page.evaluate(() => document.getElementById('view').shadowRoot.getElementById('trigger').focus());
  // The menu: opened from the view's button, an item focused, closed with Escape.
  await focusTrigger();
  await page.evaluate(() => { const m = document.getElementById('menu'); m.show(document.getElementById('view').shadowRoot.getElementById('trigger')); m.focusFirst(); });
  await settle(page);
  await page.keyboard.press('Escape');
  expect(await back()).toBe('trigger');
  // The modal and the palette.
  for (const id of ['modal', 'cmdk']) {
    await focusTrigger();
    await page.evaluate(id => { document.getElementById(id).open = true; }, id);
    await settle(page);
    await page.keyboard.press('Escape');
    await settle(page);
    expect(await back(), id).toBe('trigger');
  }
});

test('a long floating menu opens at its top again – or at its checked item', async ({ page }) => {
  await openHarness(page);
  const items = Array.from({ length: 48 }, (_, i) => `<nk-menu-item type="check" value="p${i}"${i === 40 ? ' checked' : ''}>Person ${i + 1}</nk-menu-item>`).join('');
  await setStage(page, `<nk-btn id="anchor">Owner</nk-btn><nk-menu id="m" floating><nk-menu-item type="label">Owner</nk-menu-item>${items}</nk-menu>`);
  const box = () => page.evaluate(() => { const b = document.getElementById('m').shadowRoot.querySelector('.nk-pop'); return { top: b.scrollTop, room: b.scrollHeight > b.clientHeight }; });
  const checkedVisible = () => page.evaluate(() => {
    const b = document.getElementById('m').shadowRoot.querySelector('.nk-pop').getBoundingClientRect();
    const r = document.querySelector('#m nk-menu-item[checked]').shadowRoot.querySelector('.nk-menu-item').getBoundingClientRect();
    return r.top >= b.top && r.bottom <= b.bottom;
  });
  await page.evaluate(() => { document.querySelector('#m nk-menu-item[checked]').removeAttribute('checked'); document.getElementById('m').show(document.getElementById('anchor')); });
  await settle(page);
  expect((await box()).room).toBe(true);
  await page.evaluate(() => { document.getElementById('m').shadowRoot.querySelector('.nk-pop').scrollTop = 600; document.getElementById('m').close(); });
  await page.evaluate(() => document.getElementById('m').show(document.getElementById('anchor')));
  expect((await box()).top).toBe(0);
  // With a checked item further down, it opens where that item is.
  await page.evaluate(() => { const m = document.getElementById('m'); m.close(); m.querySelectorAll('nk-menu-item')[41].setAttribute('checked', ''); m.show(document.getElementById('anchor')); });
  expect((await box()).top).toBeGreaterThan(0);
  expect(await checkedVisible()).toBe(true);
});
