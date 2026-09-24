// Links and peeks (1.8.0): <nk-bookmark>, <nk-copy-field>, <nk-image-picker>
// and <nk-peek> – and the reference app that puts them where the class demo
// has them.
import { test, expect } from '@playwright/test';
import { openHarness, setStage } from './helpers.mjs';

const PHONE = { width: 390, height: 844 };
const settle = page => page.waitForTimeout(350);

/** The focused element behind shadow hosts, as "tag.class". */
const deepFocus = page => page.evaluate(() => {
  let el = document.activeElement;
  while (el?.shadowRoot?.activeElement) el = el.shadowRoot.activeElement;
  return `${el.localName}.${el.className}`;
});

/** A PNG made in the page, as a file for an <input type="file">. */
async function pngFile(page, width, height) {
  const b64 = await page.evaluate(([w, h]) => {
    const c = Object.assign(document.createElement('canvas'), { width: w, height: h });
    const ctx = c.getContext('2d');
    ctx.fillStyle = '#2383e2'; ctx.fillRect(0, 0, w, h);
    return c.toDataURL('image/png').split(',')[1];
  }, [width, height]);
  return { name: 'photo.png', mimeType: 'image/png', buffer: Buffer.from(b64, 'base64') };
}

// ── nk-bookmark ─────────────────────────────────────────────────────────────

test('nk-bookmark: a new-tab link from its attributes; title never a tooltip; parts without a value are left out', async ({ page }) => {
  await openHarness(page);
  await setStage(page, `<div style="width:600px"><nk-bookmark id="a" href="https://notionkit.jungherz.com/docs.html" title="NotionKit" desc="Calm CSS." favicon="/favicon.svg" cover="/covers/notionkit-og.jpg"></nk-bookmark>
    <nk-bookmark id="b" href="https://example.com/x" url="example.com" target="_self"></nk-bookmark></div>`);
  const r = await page.evaluate(() => ['a', 'b'].map(id => {
    const host = document.getElementById(id), a = host.shadowRoot.querySelector('a.nk-bookmark');
    return { target: a.target, rel: a.rel, title: a.querySelector('.bm-title').textContent, desc: a.querySelector('.bm-desc')?.textContent ?? null, favicon: !!a.querySelector('.bm-favicon'), cover: !!a.querySelector('.bm-cover'), url: a.querySelector('.bm-url').textContent, tooltip: host.hasAttribute('title'), height: a.getBoundingClientRect().height };
  }));
  expect(r[0]).toEqual({ target: '_blank', rel: 'noopener', title: 'NotionKit', desc: 'Calm CSS.', favicon: true, cover: true, url: 'https://notionkit.jungherz.com/docs.html', tooltip: false, height: 92 });
  expect(r[1]).toEqual({ target: '_self', rel: '', title: 'example.com', desc: null, favicon: false, cover: false, url: 'example.com', tooltip: false, height: 74 });
});

// ── nk-copy-field ───────────────────────────────────────────────────────────

test('nk-copy-field: Copy writes the clipboard, says Copied in green, fires nk-action; a secret stays masked until Show', async ({ page, context }) => {
  await context.grantPermissions(['clipboard-read', 'clipboard-write']);
  await openHarness(page);
  await setStage(page, `<div style="width:320px"><nk-copy-field id="c" value="https://monahilft.notionkit.app"></nk-copy-field><nk-copy-field id="s" secret mono></nk-copy-field></div>`);
  const seen = [];
  await page.exposeFunction('seen', v => seen.push(v));
  await page.evaluate(() => { document.getElementById('s').value = 'ntn_secret_4711'; document.addEventListener('nk-action', e => window.seen(`${e.target.id}:${e.detail.action}:${e.detail.ok}:${e.detail.value}`)); });
  const box = id => page.evaluate(id => { const r = document.getElementById(id).shadowRoot; return { text: r.querySelector('.cf-value').textContent, btns: [...r.querySelectorAll('.cf-btn')].map(b => b.textContent + (b.classList.contains('copied') ? '*' : '')), h: r.querySelector('.nk-copy-field').getBoundingClientRect().height }; }, id);
  expect(await box('c')).toEqual({ text: 'https://monahilft.notionkit.app', btns: ['Copy'], h: 32 });
  expect(await box('s')).toEqual({ text: '•'.repeat(15), btns: ['Show', 'Copy'], h: 32 });
  expect(await page.evaluate(() => document.getElementById('s').hasAttribute('value'))).toBe(false);

  await page.locator('#c').locator('button.cf-btn').click();
  expect(await page.evaluate(() => navigator.clipboard.readText())).toBe('https://monahilft.notionkit.app');
  expect((await box('c')).btns).toEqual(['Copied*']);
  expect(await page.evaluate(() => getComputedStyle(document.getElementById('c').shadowRoot.querySelector('.cf-btn')).color)).toBe('rgb(68, 131, 97)');

  await page.locator('#s').locator('button.cf-btn', { hasText: 'Copy' }).click();
  expect(await page.evaluate(() => navigator.clipboard.readText())).toBe('ntn_secret_4711');
  expect((await box('s')).text).toBe('•'.repeat(15));
  await page.locator('#s').locator('button.cf-btn', { hasText: 'Show' }).click();
  expect(await box('s')).toMatchObject({ text: 'ntn_secret_4711', btns: ['Hide', 'Copied*'] });
  expect(seen).toEqual(['c:copy:true:https://monahilft.notionkit.app', 's:copy:true:ntn_secret_4711']);
  await page.waitForTimeout(1700);
  expect((await box('c')).btns).toEqual(['Copy']);
});

test('nk-copy-field: where the clipboard refuses, the value is shown and selected for ⌘C', async ({ page }) => {
  await openHarness(page);
  await setStage(page, `<div style="width:320px"><nk-copy-field id="s" value="ntn_secret_4711" secret></nk-copy-field></div>`);
  const r = await page.evaluate(async () => {
    Object.defineProperty(navigator, 'clipboard', { value: { writeText: () => Promise.reject(new Error('denied')) }, configurable: true });
    const f = document.getElementById('s');
    const ok = await f.copy();
    return { ok, text: f.shadowRoot.querySelector('.cf-value').textContent, selected: getSelection().toString() };
  });
  expect(r).toEqual({ ok: false, text: 'ntn_secret_4711', selected: 'ntn_secret_4711' });
});

// ── nk-image-picker ─────────────────────────────────────────────────────────

test('nk-image-picker: a picked file is scaled, shown and handed over; Remove brings the initials back; a broken file is an nk-error', async ({ page }) => {
  await openHarness(page);
  await setStage(page, `<nk-image-picker id="p" initials="MK"></nk-image-picker><nk-image-picker id="w" square initials="M" max="256" type="image/png"></nk-image-picker>`);
  const events = [];
  await page.exposeFunction('ev', v => events.push(v));
  await page.evaluate(() => { for (const id of ['p', 'w']) { const el = document.getElementById(id); el.addEventListener('nk-change', e => window.ev(`${id}:change:${e.detail.width}x${e.detail.height}:${e.detail.dataUrl.slice(0, 15)}`)); el.addEventListener('nk-error', e => window.ev(`${id}:error:${e.detail.name}`)); } });
  const state = id => page.evaluate(id => { const r = document.getElementById(id).shadowRoot; const a = r.querySelector('.big-avatar'); return { text: a.textContent, img: !!a.querySelector('img'), radius: getComputedStyle(a).borderTopLeftRadius, buttons: [...r.querySelectorAll('.pr-actions .nk-btn')].filter(b => !b.hidden).map(b => b.textContent) }; }, id);
  expect(await state('p')).toEqual({ text: 'MK', img: false, radius: '50%', buttons: ['Upload image'] });
  expect((await state('w')).radius).toBe('8px');

  await page.locator('#p input[type=file]').setInputFiles(await pngFile(page, 1600, 800));
  await expect.poll(() => events.length).toBe(1);
  expect(events[0]).toBe('p:change:512x256:data:image/jpeg');
  expect(await state('p')).toMatchObject({ img: true, buttons: ['Change image', 'Remove'] });
  expect(await page.evaluate(() => document.getElementById('p').hasAttribute('src'))).toBe(false);

  await page.locator('#w input[type=file]').setInputFiles(await pngFile(page, 300, 300));
  await expect.poll(() => events.length).toBe(2);
  expect(events[1]).toBe('w:change:256x256:data:image/png;');

  await page.locator('#p .pr-remove').click();
  expect(await state('p')).toEqual({ text: 'MK', img: false, radius: '50%', buttons: ['Upload image'] });
  expect(events[2]).toBe('p:change:0x0:');
  expect(await deepFocus(page)).toBe('button.nk-btn secondary small');

  await page.locator('#p input[type=file]').setInputFiles({ name: 'broken.png', mimeType: 'image/png', buffer: Buffer.from('not an image') });
  await expect.poll(() => events.length).toBe(4);
  expect(events[3]).toBe('p:error:broken.png');
});

// ── nk-peek ─────────────────────────────────────────────────────────────────

const PEEK = `<nk-btn id="row" variant="secondary">Row</nk-btn><nk-btn id="other" variant="secondary">Other</nk-btn>
  <nk-peek id="pk" label="Database Table-View">
    <nk-page-title id="t">🗃️ Database Table-View</nk-page-title>
    <div class="nk-prose"><p>Notes</p></div>
  </nk-peek>
  <nk-menu floating id="m"><nk-menu-item value="a">Item</nk-menu-item></nk-menu>`;

test('nk-peek: slides in at the right edge next to a usable page, focus goes in and back; Escape and » close it', async ({ page }) => {
  await openHarness(page);
  await setStage(page, PEEK);
  const toggles = [];
  await page.exposeFunction('toggled', v => toggles.push(v));
  await page.evaluate(() => document.getElementById('pk').addEventListener('nk-toggle', e => window.toggled(e.detail.open)));
  await page.evaluate(() => document.getElementById('row').addEventListener('click', () => document.getElementById('pk').show()));
  await page.click('#row');
  await settle(page);
  const m = await page.evaluate(() => {
    const r = document.getElementById('pk').shadowRoot, box = r.querySelector('.nk-peek').getBoundingClientRect(), bd = r.querySelector('.nk-peek-backdrop');
    return { left: Math.round(box.left), width: box.width, top: box.top, bottom: box.bottom, label: r.querySelector('.nk-peek').getAttribute('aria-label'), events: getComputedStyle(bd).pointerEvents, inert: document.getElementById('row').inert, lock: document.documentElement.style.overflow, title: getComputedStyle(document.getElementById('t').shadowRoot.querySelector('.nk-page-title')).fontSize };
  });
  expect(m).toEqual({ left: 1100 - 560, width: 560, top: 0, bottom: 800, label: 'Database Table-View', events: 'none', inert: false, lock: '', title: '32px' });
  expect(await deepFocus(page)).toBe('aside.nk-peek');
  await page.keyboard.press('Escape');
  await settle(page);
  expect(await page.evaluate(() => document.getElementById('pk').open)).toBe(false);
  expect(await deepFocus(page)).toBe('button.nk-btn secondary');
  await page.click('#row');
  await settle(page);
  await page.evaluate(() => document.getElementById('pk').shadowRoot.querySelector('.pk-bar button').click());
  await settle(page);
  expect(await page.evaluate(() => getComputedStyle(document.getElementById('pk').shadowRoot.querySelector('.nk-peek-backdrop')).display)).toBe('none');
  expect(toggles).toEqual([true, false, true, false]);
});

test('nk-peek: a click elsewhere closes it and still reaches the page; a click that shows it again or lands in a menu keeps it', async ({ page }) => {
  await openHarness(page);
  await setStage(page, PEEK);
  await page.evaluate(() => {
    window.hits = 0;
    document.getElementById('row').addEventListener('click', () => document.getElementById('pk').show());
    document.getElementById('other').addEventListener('click', () => window.hits++);
  });
  const open = () => page.evaluate(() => document.getElementById('pk').open);
  await page.click('#row'); await settle(page);
  await page.click('#row'); await settle(page);           // another row: swaps, stays open
  expect(await open()).toBe(true);
  await page.evaluate(() => document.getElementById('m').show(document.getElementById('row')));
  await settle(page);
  await page.click('#m nk-menu-item');                     // inside a menu: stays open
  expect(await open()).toBe(true);
  await page.click('#other');
  expect(await open()).toBe(false);
  expect(await page.evaluate(() => window.hits)).toBe(1);
});

test('nk-peek on a phone: a bottom sheet over a dimmed page, modal there, title in 28px; a tap on the page closes it', async ({ page }) => {
  await openHarness(page);
  await page.setViewportSize(PHONE);
  await setStage(page, PEEK);
  await page.evaluate(() => document.getElementById('pk').show());
  await settle(page);
  const m = await page.evaluate(() => {
    const r = document.getElementById('pk').shadowRoot, box = r.querySelector('.nk-peek').getBoundingClientRect(), bd = r.querySelector('.nk-peek-backdrop');
    return { left: box.left, width: box.width, bottom: Math.round(box.bottom), scrim: getComputedStyle(bd).backgroundColor !== 'rgba(0, 0, 0, 0)', modal: r.querySelector('.nk-peek').getAttribute('aria-modal'), inert: document.getElementById('row').inert, lock: document.documentElement.style.overflow, title: getComputedStyle(document.getElementById('t').shadowRoot.querySelector('.nk-page-title')).fontSize };
  });
  expect(m).toEqual({ left: 0, width: PHONE.width, bottom: PHONE.height, scrim: true, modal: 'true', inert: true, lock: 'hidden', title: '28px' });
  await page.mouse.click(200, 30);
  await settle(page);
  expect(await page.evaluate(() => [document.getElementById('pk').open, document.getElementById('row').inert, document.documentElement.style.overflow])).toEqual([false, false, '']);
});

// ── The reference app ───────────────────────────────────────────────────────

test('app.html: a row opens in the side peek with its properties; another row swaps it; #peek opens the table row', async ({ page }) => {
  await page.goto('/app.html#peek');
  await settle(page);
  const peek = () => page.evaluate(() => {
    const p = document.getElementById('sidePeek');
    return { open: p.open, title: document.getElementById('peekTitle').textContent, status: p.querySelector('[data-peek="status"]').textContent, effort: p.querySelector('[data-peek="effort"]').textContent, notes: document.getElementById('peekNotes').querySelectorAll('li').length };
  });
  expect(await peek()).toEqual({ open: true, title: '🗃️ Database Table-View', status: 'In progress', effort: '12.5', notes: 2 });
  await page.keyboard.press('Escape');
  await page.evaluate(() => document.getElementById('db').shadowRoot.querySelector('.nk-db-tab[data-view="list"]').click());
  await page.evaluate(() => { const list = document.querySelector('nk-list-view'); [...list.shadowRoot.querySelectorAll('.nk-list-item')].pop().click(); });
  await settle(page);
  expect(await peek()).toMatchObject({ open: true, title: '▤ Board-View & Drag-and-Drop', status: 'Planned', effort: '8.0' });
});

test('app.html: the public address copies, the profile picture takes a file', async ({ page, context }) => {
  await context.grantPermissions(['clipboard-read', 'clipboard-write']);
  await page.goto('/app.html#settings');
  await settle(page);
  await page.evaluate(() => document.getElementById('settingsModal').show('general'));
  await page.locator('#publicAddress button.cf-btn').click();
  expect(await page.evaluate(() => navigator.clipboard.readText())).toBe('https://monahilft.notionkit.app');
  await page.evaluate(() => document.getElementById('settingsModal').show('profile'));
  await page.locator('#profilePicture input[type=file]').setInputFiles(await pngFile(page, 800, 800));
  await expect.poll(() => page.evaluate(() => !!document.getElementById('profilePicture').shadowRoot.querySelector('.big-avatar img'))).toBe(true);
  await expect(page.locator('#toast')).toContainText('Picture updated');
});
