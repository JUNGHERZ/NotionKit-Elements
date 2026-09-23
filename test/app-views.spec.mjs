// App views (1.6.0): nk-avatar, nk-props / nk-prop, nk-list-view, nk-panels /
// nk-panel, the page options on nk-page, pictures in nk-page-cover, the grey
// bubble, switch rows in menus, named avatar colours, number columns – and the
// build: a stable base.js and NotionKit's sheet as one shared instance.
import { test, expect } from '@playwright/test';
import { readFileSync, readdirSync } from 'node:fs';
import { openHarness, setStage, saveArtifact } from './helpers.mjs';

const PHONE = { width: 390, height: 844 };

/** The harness plus shadow(id, selector) inside the page. */
async function harness(page) {
  await openHarness(page);
  await page.evaluate(() => { window.shadow = (id, sel) => document.getElementById(id).shadowRoot.querySelector(sel); });
}

// ── nk-avatar ────────────────────────────────────────────────────────────────

test('nk-avatar: sizes, named colours, CSS colours, initials from name, photo with alt', async ({ page }) => {
  await harness(page);
  await setStage(page, `<nk-avatar id="a">AL</nk-avatar><nk-avatar id="b" size="small" color="green">SL</nk-avatar>
    <nk-avatar id="c" size="large" color="#123456" name="Tom Weber"></nk-avatar><nk-avatar id="d" size="xlarge" square src="/covers/tide.svg" name="Ada Lovelace"></nk-avatar>`);
  const m = await page.evaluate(() => Object.fromEntries(['a', 'b', 'c', 'd'].map(id => {
    const box = document.getElementById(id).shadowRoot.querySelector('.nk-avatar');
    const img = box.querySelector('img');
    return [id, { w: box.getBoundingClientRect().width, cls: box.className, text: box.textContent.trim(), bg: box.style.background, img: img && img.alt, role: box.getAttribute('role'), radius: getComputedStyle(box).borderTopLeftRadius }];
  })));
  // Content is slotted: the box's own text is only the initials fallback.
  expect(m.a).toMatchObject({ w: 24, cls: 'nk-avatar', text: '', bg: '', img: null });
  expect(m.b).toMatchObject({ w: 20, cls: 'nk-avatar small green' });
  expect(m.c).toMatchObject({ w: 32, text: 'TW', role: 'img' });
  expect(m.c.bg).toContain('rgb(18, 52, 86)');
  expect(m.d).toMatchObject({ w: 56, img: 'Ada Lovelace', radius: '4px' });
  expect(await page.evaluate(() => document.getElementById('a').hasAttribute('title'))).toBe(false);
});

test('member rows, comments and person cells take colour names; no colour means the gradient', async ({ page }) => {
  await harness(page);
  await setStage(page, `<nk-member-row id="r1" name="Sara Lindt" color="green"></nk-member-row><nk-member-row id="r2" name="Ada Lovelace"></nk-member-row>
    <nk-member-row id="r3" name="Tom Weber" color="#d9730d"></nk-member-row><nk-comment id="c1" author="Mona" color="gray"></nk-comment>`);
  const m = await page.evaluate(() => Object.fromEntries(['r1', 'r2', 'r3', 'c1'].map(id => {
    const a = document.getElementById(id).shadowRoot.querySelector('.nk-avatar');
    return [id, { cls: a.className, bg: a.style.background, w: a.getBoundingClientRect().width, image: getComputedStyle(a).backgroundImage }];
  })));
  expect(m.r1).toMatchObject({ cls: 'nk-avatar green', bg: '', w: 28 });
  expect(m.r2.cls).toBe('nk-avatar');
  expect(m.r2.image).toContain('linear-gradient');
  expect(m.r3.bg).toContain('rgb(217, 115, 13)');
  expect(m.c1).toMatchObject({ cls: 'nk-avatar gray', w: 24 });
});

// ── nk-props / nk-prop ──────────────────────────────────────────────────────

test('nk-props lists nk-prop rows: 160px names, values beside them, stacked on a phone', async ({ page }) => {
  await harness(page);
  await setStage(page, `<nk-props id="p" style="display:block;width:600px">
    <nk-prop id="p1" label="Status" icon="◉"><nk-tag color="blue">In progress</nk-tag></nk-prop>
    <nk-prop id="p2" label="Progress" icon="▰"><nk-progress value="65" label="65 %" wide></nk-progress></nk-prop></nk-props>`);
  const read = () => page.evaluate(() => ['p1', 'p2'].map(id => {
    const r = document.getElementById(id).shadowRoot;
    const n = r.querySelector('.p-name').getBoundingClientRect(), v = r.querySelector('.p-value').getBoundingClientRect();
    return { nameW: n.width, h: r.querySelector('.nk-prop').getBoundingClientRect().height, beside: Math.abs(n.top - v.top) < 1, below: v.top >= n.bottom - 0.5, label: r.querySelector('.p-name').textContent };
  }));
  const desk = await read();
  expect(desk[0]).toMatchObject({ nameW: 160, h: 34, beside: true, label: '◉Status' });
  expect(await page.evaluate(() => shadow('p', 'dl.nk-props') !== null)).toBe(true);
  const bar = await page.evaluate(() => document.querySelector('#p2 nk-progress').shadowRoot.querySelector('.nk-progress').getBoundingClientRect().width);
  expect(bar, 'a wide bar grows').toBeGreaterThan(300);
  await page.setViewportSize(PHONE);
  for (const r of await read()) expect(r.below, 'value under its name').toBe(true);
  const hits = [];
  await page.exposeFunction('hit', v => hits.push(v));
  await page.evaluate(() => document.addEventListener('nk-action', e => window.hit(e.detail.action + ':' + e.detail.label)));
  await page.evaluate(() => { document.getElementById('p1').shadowRoot.querySelector('.p-name').click(); document.getElementById('p1').shadowRoot.querySelector('.p-value').click(); });
  expect(hits).toEqual(['name:Status', 'value:Status']);
});

// ── nk-list-view ────────────────────────────────────────────────────────────

const LIST_DATA = `
  const columns = [{ key: 'name', label: 'Name', title: true }, { key: 'due', label: 'Due', type: 'date' },
    { key: 'status', label: 'Status', type: 'select', options: [{ value: 'open', label: 'Open', color: 'gray' }, { value: 'done', label: 'Done', color: 'green' }] },
    { key: 'effort', label: 'Effort', type: 'number', locale: 'de', format: { minimumFractionDigits: 1 } }];
  const rows = [{ id: 1, icon: '🗃️', name: 'Table view', due: '20 May', status: 'open', effort: 12.5 }, { id: 2, icon: '▤', name: 'Board', due: '2 June', status: 'done', effort: 8 }];`;

test('nk-list-view: one line per row, meta-keys on the right, nk-select on click and Enter', async ({ page }) => {
  await harness(page);
  await setStage(page, `<nk-list-view id="l" meta-keys="due,status" new-row></nk-list-view>`);
  await page.evaluate(`${LIST_DATA} const l = document.getElementById('l'); l.columns = columns; l.rows = rows;`);
  const items = await page.evaluate(() => [...document.getElementById('l').shadowRoot.querySelectorAll('.nk-list-item')].map(i => i.innerHTML));
  expect(items[0]).toBe('<span class="l-icon">🗃️</span><span class="l-title">Table view</span><span class="l-meta">20 May<span class="nk-tag gray">Open</span></span>');
  const seen = [];
  await page.exposeFunction('seen', v => seen.push(v));
  await page.evaluate(() => { const l = document.getElementById('l'); l.addEventListener('nk-select', e => window.seen('select:' + e.detail.id)); l.addEventListener('nk-action', e => window.seen(e.detail.action)); });
  await page.evaluate(() => document.getElementById('l').shadowRoot.querySelectorAll('.nk-list-item')[1].click());
  await page.evaluate(() => document.getElementById('l').shadowRoot.querySelector('.nk-list-item').focus());
  await page.keyboard.press('Enter');
  await page.evaluate(() => document.getElementById('l').shadowRoot.querySelector('.nk-new-row').click());
  expect(seen).toEqual(['select:2', 'select:1', 'new-row']);
});

test('nk-list-view is the third view of nk-database; number columns stand right-aligned in the table', async ({ page }) => {
  await harness(page);
  await setStage(page, `<nk-database id="db"><nk-table-view name="table" label="▦ Table"></nk-table-view><nk-board-view name="board" label="▤ Board" group-by="status"></nk-board-view><nk-list-view name="list" label="☰ List"></nk-list-view></nk-database>`);
  await page.evaluate(`${LIST_DATA} const db = document.getElementById('db'); db.columns = columns; db.rows = rows;`);
  await page.waitForFunction(() => document.getElementById('db').shadowRoot.querySelectorAll('.nk-db-tab').length === 3);
  const td = await page.evaluate(() => { const c = document.querySelector('nk-table-view').shadowRoot.querySelector('tbody td.num'); return { text: c.textContent, align: getComputedStyle(c).textAlign }; });
  expect(td).toEqual({ text: '12,5', align: 'right' });
  await page.evaluate(() => document.getElementById('db').view = 'list');
  expect(await page.evaluate(() => [document.querySelector('nk-list-view').hidden, document.querySelector('nk-table-view').hidden])).toEqual([false, true]);
  // Default meta: the select and date columns, in column order.
  expect(await page.evaluate(() => document.querySelector('nk-list-view').shadowRoot.querySelector('.l-meta').textContent)).toBe('20 MayOpen');
});

// ── nk-panels / nk-panel ────────────────────────────────────────────────────

test('nk-panel: title is the heading, never a tooltip; href makes a link; cover and icon form a page tile', async ({ page }) => {
  await harness(page);
  await setStage(page, `<nk-panels style="display:block;width:700px">
    <nk-panel id="a" href="/x" cover="/covers/aurora.svg" icon="🚀" title="Roadmap"><p>2 min ago</p></nk-panel>
    <nk-panel id="b" cover title="Plain"><p>Text</p></nk-panel>
    <nk-panel id="c" title="Weekly review"><p>Three pages changed.</p></nk-panel></nk-panels>`);
  const m = await page.evaluate(() => ['a', 'b', 'c'].map(id => {
    const el = document.getElementById(id), box = el.shadowRoot.querySelector('.nk-panel');
    const cover = box.querySelector('.nk-cover'), p = el.querySelector('p');
    return { tag: box.localName, href: box.getAttribute('href'), title: el.hasAttribute('title'), h3: box.querySelector('h3').textContent, cover: getComputedStyle(cover).display, img: !!cover.querySelector('img'),
      top: Math.round(box.getBoundingClientRect().top), pSize: getComputedStyle(p).fontSize, pMargin: getComputedStyle(p).marginTop };
  }));
  expect(m[0]).toMatchObject({ tag: 'a', href: '/x', title: false, h3: 'Roadmap', cover: 'block', img: true, pSize: '13px', pMargin: '0px' });
  expect(m[1]).toMatchObject({ tag: 'div', cover: 'block', img: false });
  expect(m[2]).toMatchObject({ cover: 'none' });
  expect(new Set(m.map(x => x.top)).size, 'one row').toBe(1);
  await page.setViewportSize(PHONE);
  await page.evaluate(() => { document.querySelector('nk-panels').style.width = '340px'; });
  const lefts = await page.evaluate(() => ['a', 'b', 'c'].map(id => Math.round(document.getElementById(id).shadowRoot.querySelector('.nk-panel').getBoundingClientRect().left)));
  expect(new Set(lefts).size, 'one column').toBe(1);
});

// ── Page options, cover picture, bubble, switch rows ────────────────────────

test('nk-page full and small: the column fills the window, text and headings step down', async ({ page }) => {
  await harness(page);
  await setStage(page, `<div style="height:600px;display:flex;flex-direction:column"><nk-page id="pg"><nk-page-title>Title</nk-page-title><nk-heading>Heading</nk-heading><p class="lead">Lead</p></nk-page></div>`);
  const read = () => page.evaluate(() => ({
    width: shadow('pg', '.nk-page').getBoundingClientRect().width,
    heading: parseFloat(getComputedStyle(document.querySelector('nk-heading').shadowRoot.querySelector('.nk-heading')).fontSize),
    lead: parseFloat(getComputedStyle(document.querySelector('p.lead')).fontSize),
    title: parseFloat(getComputedStyle(document.querySelector('nk-page-title').shadowRoot.querySelector('.nk-page-title')).fontSize),
  }));
  expect(await read()).toEqual({ width: 760, heading: 24, lead: 16, title: 40 });
  await page.evaluate(() => { const p = document.getElementById('pg'); p.full = true; p.small = true; });
  await page.evaluate(() => new Promise(r => requestAnimationFrame(() => requestAnimationFrame(r))));
  const after = await read();
  expect(after.width).toBeGreaterThan(900);
  expect(after).toMatchObject({ heading: 21, lead: 14, title: 40 });
});

test('nk-page-cover draws a picture as an <img>, cropped and positioned', async ({ page }) => {
  await harness(page);
  await setStage(page, `<nk-page-cover id="c" src="/covers/meadow.svg" position="center 30%"></nk-page-cover>`);
  const m = await page.evaluate(() => { const img = shadow('c', '.nk-cover > img'); const cs = getComputedStyle(img); return { fit: cs.objectFit, pos: cs.objectPosition, h: img.getBoundingClientRect().height, bg: shadow('c', '.nk-cover').style.backgroundImage }; });
  expect(m).toEqual({ fit: 'cover', pos: '50% 30%', h: 200, bg: '' });
});

test('nk-ai-msg bubble: a grey bubble without avatar or name, on the right for the user', async ({ page }) => {
  await harness(page);
  await setStage(page, `<div style="width:480px"><nk-ai-thread><nk-ai-msg id="m" role="user" name="You" bubble>What is open?</nk-ai-msg></nk-ai-thread></div>`);
  const m = await page.evaluate(() => {
    const r = document.getElementById('m').shadowRoot, box = r.querySelector('.nk-ai-msg'), body = r.querySelector('.a-body');
    return { cls: box.className, avatar: !!r.querySelector('.mini-avatar').getClientRects().length, name: !!r.querySelector('.a-name').getClientRects().length,
      right: Math.round(box.getBoundingClientRect().right - body.getBoundingClientRect().right), radius: getComputedStyle(body).borderTopLeftRadius };
  });
  expect(m).toEqual({ cls: 'nk-ai-msg user bubble', avatar: false, name: false, right: 0, radius: '16px' });
});

test('a switch row flips on click, reports nk-change and keeps the popover open', async ({ page }) => {
  await harness(page);
  await setStage(page, `<nk-pop id="pop" open><nk-btn slot="trigger">⋯</nk-btn><nk-menu><nk-menu-item id="s" type="switch" icon="🔡" value="small">Small text</nk-menu-item><nk-menu-item value="link">Copy link</nk-menu-item></nk-menu></nk-pop>`);
  const seen = [];
  await page.exposeFunction('seen', v => seen.push(v));
  await page.evaluate(() => { document.addEventListener('nk-change', e => window.seen('change:' + e.detail.value + '=' + e.detail.checked)); document.addEventListener('nk-select', e => window.seen('select:' + e.detail.value)); });
  const row = () => page.evaluate(() => { const r = shadow('s', '.nk-menu-item'); return { role: r.getAttribute('role'), checked: r.getAttribute('aria-checked'), knob: r.querySelector('.nk-switch').getAttribute('aria-checked'), right: Math.round(r.getBoundingClientRect().right - r.querySelector('.nk-switch').getBoundingClientRect().right) }; });
  expect(await row()).toEqual({ role: 'menuitemcheckbox', checked: 'false', knob: 'false', right: 8 });
  await page.evaluate(() => shadow('s', '.nk-menu-item').click());
  expect((await row()).checked).toBe('true');
  expect(await page.evaluate(() => document.getElementById('pop').open)).toBe(true);
  await page.evaluate(() => document.querySelector('nk-menu-item[value="link"]').shadowRoot.querySelector('.nk-menu-item').click());
  expect(seen).toEqual(['change:small=true', 'select:link']);
  expect(await page.evaluate(() => document.getElementById('pop').open)).toBe(false);
});

// ── Build: one sheet, one base ──────────────────────────────────────────────

test('the per-component build imports NotionKit\'s sheet instead of inlining it, from a stable base.js', async () => {
  const files = readdirSync('dist/components');
  expect(files).toContain('base.js');
  expect(readdirSync('dist/components/shared').some(f => f.startsWith('base-'))).toBe(false);
  const base = readFileSync('dist/components/base.js', 'utf-8');
  expect(base).toContain("from '@jungherz-de/notionkit/notionkit-styles.js'");
  expect(base.length, 'no stylesheet inside').toBeLessThan(20000);
  const btn = readFileSync('dist/components/nk-btn.js', 'utf-8');
  expect(btn).toMatch(/from '\.\/base\.js'/);
  expect(JSON.parse(readFileSync('package.json', 'utf-8')).exports['./base.js']).toBe('./dist/components/base.js');
});

test('the bundle exports the sheet its elements adopt, for a project\'s own views', async ({ page }) => {
  await harness(page);
  await setStage(page, `<nk-tag id="t">x</nk-tag>`);
  const same = await page.evaluate(async () => {
    const { componentsSheet } = await import('/dist/notionkit-elements.esm.js');
    return document.getElementById('t').shadowRoot.adoptedStyleSheets[0] === componentsSheet;
  });
  expect(same).toBe(true);
  const iife = readFileSync('dist/notionkit-elements.js', 'utf-8');
  expect(iife).toContain('exports.componentsSheet');
});

// ── The reference app ───────────────────────────────────────────────────────

for (const path of ['app.html', 'de/app.html']) {
  test(`${path}: "Read" shows the editor's content as prose, pixel for pixel`, async ({ page }) => {
    await page.goto('/' + path);
    await page.waitForFunction(() => window.nkEditor && customElements.get('nk-segmented'), null, { timeout: 30000 });
    await page.locator('#nk-editor-section').scrollIntoViewIfNeeded();
    await page.mouse.move(0, 0);
    const clip = () => page.evaluate(() => {
      const s = document.getElementById('nk-editor-section').getBoundingClientRect();
      // nk-segmented is a display: contents host; its box is the inner .nk-segmented.
      const top = document.getElementById('editorMode').shadowRoot.querySelector('.nk-segmented').getBoundingClientRect().bottom + 1;
      return { x: s.left, y: top, width: s.width, height: s.bottom - top + 8 };
    });
    const editClip = await clip();
    const edit = await page.screenshot({ clip: editClip });
    await page.evaluate(() => document.querySelector('#editorMode button[value="read"]').click());
    await page.mouse.move(0, 0);
    const readClip = await clip();
    const read = await page.screenshot({ clip: readClip });
    expect(await page.locator('#prose-demo').isVisible()).toBe(true);
    if (!edit.equals(read)) { saveArtifact(`prose-${path.replace('/', '-')}-edit.png`, edit); saveArtifact(`prose-${path.replace('/', '-')}-read.png`, read); }
    expect(readClip.height).toBe(editClip.height);
    expect(edit.equals(read), 'edit and read differ – see test/.artifacts').toBe(true);
  });
}

test('app.html: the ⋯ menu switches the page options, Home opens the start view', async ({ page }) => {
  await page.setViewportSize({ width: 1280, height: 800 });
  await page.goto('/app.html');
  await page.waitForFunction(() => customElements.get('nk-menu-item') && customElements.get('nk-page'));
  await page.click('#pageMenuBtn');
  await page.waitForTimeout(300);
  expect(await page.evaluate(() => document.getElementById('pageOptions').open)).toBe(true);
  // Right under the ⋯ button, right edges aligned – not somewhere in the flow.
  const pos = await page.evaluate(() => {
    const b = document.getElementById('pageMenuBtn').shadowRoot.querySelector('button').getBoundingClientRect();
    const m = document.getElementById('pageOptions').shadowRoot.querySelector('.nk-menu').getBoundingClientRect();
    return { gap: Math.round(m.top - b.bottom), right: Math.round(b.right - m.right), inView: m.bottom <= innerHeight };
  });
  expect(pos).toEqual({ gap: 6, right: 0, inView: true });
  await page.evaluate(() => document.querySelector('#pageOptions nk-menu-item[value="full"]').shadowRoot.querySelector('.nk-menu-item').click());
  expect(await page.evaluate(() => document.getElementById('page').hasAttribute('full'))).toBe(true);
  await page.keyboard.press('Escape');
  expect(await page.evaluate(() => document.getElementById('pageOptions').open)).toBe(false);
  await page.evaluate(() => document.querySelector('nk-tree-item[value="home"]').select());
  await expect(page.locator('#home')).toBeVisible();
  await expect(page.locator('#page')).toBeHidden();
  const tops = await page.evaluate(() => [...document.querySelectorAll('#home nk-panel')].map(p => Math.round(p.shadowRoot.querySelector('.nk-panel').getBoundingClientRect().top)));
  expect(tops).toHaveLength(4);
  expect(new Set(tops).size, 'four panels in a row').toBe(1);
  expect(await page.evaluate(() => document.getElementById('upcoming').shadowRoot.querySelectorAll('.nk-list-item').length)).toBe(3);
  await page.setViewportSize(PHONE);
  expect(await page.evaluate(() => document.documentElement.scrollWidth)).toBeLessThanOrEqual(PHONE.width);
});
