// Mobile and filter (1.7.0): <nk-sheet>, floating menus that become sheets
// on a phone, check rows, the database toolbar with filter pills, the ☰ that
// opens the drawer, <nk-steps>, the scrolling segmented control – and the
// reference app that puts them together like the class demo.
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

// ── nk-sheet ─────────────────────────────────────────────────────────────────

const SHEET = `<nk-btn id="opener" variant="secondary">Open</nk-btn>
  <nk-sheet id="s" title="More"><nk-tree manual>
    <nk-section-label>Favourites</nk-section-label>
    <nk-tree-item id="first" icon="🚀" value="mvp" no-actions>NotionKit MVP</nk-tree-item>
    <nk-tree-item icon="🎙️" value="voh" no-actions>Voice-Office-Hub</nk-tree-item>
  </nk-tree></nk-sheet>`;

test('nk-sheet: rises from the bottom above everything, 40px rows, title names the dialog, never a tooltip', async ({ page }) => {
  await openHarness(page);
  await page.setViewportSize(PHONE);
  await setStage(page, SHEET);
  const closed = await page.evaluate(() => getComputedStyle(document.getElementById('s').shadowRoot.querySelector('.nk-sheet-backdrop')).display);
  expect(closed).toBe('none');
  await page.evaluate(() => document.getElementById('s').show());
  await settle(page);
  const m = await page.evaluate(() => {
    const host = document.getElementById('s'), root = host.shadowRoot, sheet = root.querySelector('.nk-sheet'), r = sheet.getBoundingClientRect();
    const title = root.querySelector('.sh-title');
    return {
      bottom: Math.round(r.bottom), left: r.left, width: Math.round(r.width), z: getComputedStyle(root.querySelector('.nk-sheet-backdrop')).zIndex,
      title: title.textContent, labelled: document.getElementById(sheet.getAttribute('aria-labelledby')) === null && root.getElementById(sheet.getAttribute('aria-labelledby')) === title,
      tooltip: host.hasAttribute('title'), row: document.getElementById('first').shadowRoot.querySelector('.nk-tree-item').getBoundingClientRect().height,
    };
  });
  expect(m).toEqual({ bottom: PHONE.height, left: 0, width: PHONE.width, z: '100', title: 'More', labelled: true, tooltip: false, row: 40 });
});

test('nk-sheet: focus moves in and back, the page is inert and scroll-locked, Escape and the backdrop close', async ({ page }) => {
  await openHarness(page);
  await page.setViewportSize(PHONE);
  await setStage(page, SHEET);
  const toggles = [];
  await page.exposeFunction('toggled', v => toggles.push(v));
  await page.evaluate(() => document.getElementById('s').addEventListener('nk-toggle', e => window.toggled(e.detail.open)));
  await page.click('#opener');
  await page.evaluate(() => document.getElementById('s').show());
  await settle(page);
  expect(await deepFocus(page)).toBe('div.nk-tree-item');
  expect(await page.evaluate(() => [document.getElementById('opener').inert, document.documentElement.style.overflow])).toEqual([true, 'hidden']);
  await page.keyboard.press('Escape');
  await settle(page);
  expect(await deepFocus(page)).toBe('button.nk-btn secondary');
  expect(await page.evaluate(() => [document.getElementById('opener').inert, document.documentElement.style.overflow, getComputedStyle(document.getElementById('s').shadowRoot.querySelector('.nk-sheet-backdrop')).display])).toEqual([false, '', 'none']);
  await page.evaluate(() => document.getElementById('s').show());
  await settle(page);
  await page.mouse.click(200, 20);
  await settle(page);
  expect(await page.evaluate(() => document.getElementById('s').open)).toBe(false);
  expect(toggles).toEqual([true, false, true, false]);
});

// ── nk-menu floating / sheet, check rows ────────────────────────────────────

const MENU = `<div style="display:flex;justify-content:flex-end;padding:40px 60px"><nk-btn id="b" variant="topbar" aria-haspopup="menu" aria-label="Options">⋯</nk-btn></div>
  <nk-btn id="elsewhere" variant="secondary">Elsewhere</nk-btn>
  <nk-menu floating sheet id="m">
    <nk-menu-item type="label">Filter by</nk-menu-item>
    <nk-menu-item id="c1" type="check" icon="◉" value="open" checked>Status: Open</nk-menu-item>
    <nk-menu-item id="c2" type="check" icon="◉" value="done">Status: Done</nk-menu-item>
    <nk-menu-item id="plain" icon="🔗" value="link">Copy link</nk-menu-item>
  </nk-menu>`;

test('nk-menu floating: closed it takes nothing; show(anchor) opens it under the anchor, right edges aligned', async ({ page }) => {
  await openHarness(page);
  await setStage(page, MENU);
  const state = () => page.evaluate(() => {
    const box = document.getElementById('m').shadowRoot.querySelector('.nk-pop'), cs = getComputedStyle(box), r = box.getBoundingClientRect();
    const btn = document.getElementById('b').shadowRoot.querySelector('button'), b = btn.getBoundingClientRect();
    return { visibility: cs.visibility, events: cs.pointerEvents, gap: Math.round(r.top - b.bottom), right: Math.round(b.right - r.right), expanded: btn.getAttribute('aria-expanded'), popup: btn.getAttribute('aria-haspopup') };
  });
  expect(await state()).toMatchObject({ visibility: 'hidden', events: 'none' });
  await page.evaluate(() => document.getElementById('m').show(document.getElementById('b')));
  await settle(page);
  expect(await state()).toEqual({ visibility: 'visible', events: 'auto', gap: 6, right: 0, expanded: 'true', popup: 'menu' });
  // Opened by a click, focus stays where it was: no ring in the menu.
  expect(await deepFocus(page)).not.toBe('div.nk-menu-item');
});

test('nk-menu floating: a tap outside closes it and reaches nothing; a check row keeps it open, a plain one closes it', async ({ page }) => {
  await openHarness(page);
  await setStage(page, MENU);
  await page.evaluate(() => { window.hits = 0; document.getElementById('elsewhere').addEventListener('click', () => window.hits++); });
  const open = () => page.evaluate(() => document.getElementById('m').show(document.getElementById('b')));
  const isOpen = () => page.evaluate(() => document.getElementById('m').open);
  await open(); await settle(page);
  await page.click('#elsewhere');
  expect(await page.evaluate(() => window.hits)).toBe(0);
  expect(await isOpen()).toBe(false);
  // Check rows: ✓ where the shortcut stands, nk-change, the menu stays open.
  const changes = [];
  await page.exposeFunction('changed', v => changes.push(v));
  await page.evaluate(() => document.getElementById('m').addEventListener('nk-change', e => window.changed(`${e.detail.value}:${e.detail.checked}`)));
  await open(); await settle(page);
  const marks = () => page.evaluate(() => ['c1', 'c2'].map(id => { const r = document.getElementById(id).shadowRoot.querySelector('.nk-menu-item'); return `${r.getAttribute('role')}:${r.getAttribute('aria-checked')}:${r.querySelector('.m-shortcut').textContent}`; }));
  expect(await marks()).toEqual(['menuitemcheckbox:true:✓', 'menuitemcheckbox:false:']);
  await page.click('#c2');
  expect(changes).toEqual(['done:true']);
  expect(await marks()).toEqual(['menuitemcheckbox:true:✓', 'menuitemcheckbox:true:✓']);
  expect(await isOpen()).toBe(true);
  await page.click('#plain');
  expect(await isOpen()).toBe(false);
  // Escape closes; opened from the keyboard, focus goes in and comes back.
  await page.evaluate(() => document.getElementById('b').focus());
  await page.keyboard.press('Shift');
  await page.evaluate(() => document.getElementById('m').show(document.getElementById('b')));
  await settle(page);
  expect(await deepFocus(page)).toBe('div.nk-menu-item');
  await page.keyboard.press('Escape');
  expect(await isOpen()).toBe(false);
  expect(await deepFocus(page)).toBe('button.nk-topbar-btn');
});

test('nk-menu sheet: on a phone the same menu is a bottom sheet with 40px rows, whatever show() wrote', async ({ page }) => {
  await openHarness(page);
  await page.setViewportSize(PHONE);
  await setStage(page, MENU);
  await page.evaluate(() => document.getElementById('m').show(document.getElementById('b')));
  await settle(page);
  const m = await page.evaluate(() => {
    const host = document.getElementById('m'), box = host.shadowRoot.querySelector('.nk-pop'), r = box.getBoundingClientRect();
    return { left: r.left, right: Math.round(r.right), bottom: Math.round(r.bottom), inline: host.style.top !== '', radius: getComputedStyle(box).borderTopLeftRadius, row: document.getElementById('c1').shadowRoot.querySelector('.nk-menu-item').getBoundingClientRect().height };
  });
  expect(m).toEqual({ left: 0, right: PHONE.width, bottom: PHONE.height, inline: true, radius: '14px', row: 40 });
});

// ── Database toolbar, filter pills ──────────────────────────────────────────

test('nk-database: tools sit right of the tabs, the filter bar under them, no inline style', async ({ page }) => {
  await openHarness(page);
  await setStage(page, `<div style="width:700px"><nk-database id="db" add-view>
    <nk-btn slot="tools" id="f" variant="tool" active>Filter</nk-btn><nk-btn slot="tools" variant="tool">Sort</nk-btn><nk-btn slot="tools" variant="primary" small>New</nk-btn>
    <nk-filter-bar slot="filters" id="bar" add no-filter no-sort></nk-filter-bar>
    <nk-table-view name="table" label="Table" count></nk-table-view></nk-database></div>`);
  await page.evaluate(() => { const db = document.getElementById('db'); db.columns = [{ key: 'name', label: 'Name', title: true }]; db.rows = [{ id: 1, name: 'A' }]; document.getElementById('bar').filters = [{ key: 'status', value: 'done', op: 'is-not', label: 'Status: Open' }]; });
  await page.evaluate(() => new Promise(r => requestAnimationFrame(() => requestAnimationFrame(r))));
  const m = await page.evaluate(() => {
    const root = document.getElementById('db').shadowRoot, bar = root.querySelector('.nk-db-toolbar').getBoundingClientRect();
    const tool = document.getElementById('f').shadowRoot.querySelector('button'), t = tool.getBoundingClientRect(), tools = root.querySelector('.tools').getBoundingClientRect();
    const row = document.getElementById('bar').shadowRoot.querySelector('.nk-filter-row').getBoundingClientRect();
    const tabs = root.querySelector('.nk-db-tabs').getBoundingClientRect();
    return { toolClass: tool.className, toolRight: Math.abs(bar.right - tools.right) < 0.5, sameRow: Math.abs((t.top + t.height / 2) - (tabs.top + tabs.height / 2)) < 2, filtersBelow: row.top >= bar.bottom - 0.5,
      styled: [...root.querySelectorAll('[style]'), ...document.getElementById('bar').shadowRoot.querySelectorAll('[style]')].length, add: root.querySelector('.nk-db-tab.add')?.textContent };
  });
  expect(m).toEqual({ toolClass: 'nk-db-tool active', toolRight: true, sameRow: true, filtersBelow: true, styled: 0, add: '＋' });
});

test('nk-filter-bar: a pill or ＋ Filter fires nk-action with the clicked button as anchor for the menu', async ({ page }) => {
  await openHarness(page);
  await setStage(page, `<nk-filter-bar id="bar" add no-filter no-sort remove-label="Filter entfernen" add-label="＋ Filter"></nk-filter-bar>`);
  await page.evaluate(() => { document.getElementById('bar').filters = [{ id: 'open', key: 'status', value: 'done', op: 'is-not', label: 'Status: Offen' }]; });
  const r = await page.evaluate(() => {
    const bar = document.getElementById('bar'), root = bar.shadowRoot, seen = [];
    bar.addEventListener('nk-action', e => seen.push([e.detail.action, e.detail.anchor === root.querySelector(e.detail.action === 'add' ? '.nk-filter-pill.add' : '[data-edit]')]));
    root.querySelector('[data-edit]').click();
    root.querySelector('.nk-filter-pill.add').click();
    return { seen, remove: root.querySelector('.fp-remove').getAttribute('aria-label'), tools: [...root.querySelectorAll('.nk-db-tool')].map(b => getComputedStyle(b).display) };
  });
  expect(r).toEqual({ seen: [['edit', true], ['add', true]], remove: 'Filter entfernen: Status: Offen', tools: ['none', 'none'] });
});

// ── ☰ and the drawer ────────────────────────────────────────────────────────

test('nk-btn variant="sidebar": only on a phone, opens the drawer and says so in aria-expanded', async ({ page }) => {
  await openHarness(page);
  await page.setViewportSize(PHONE);
  await setStage(page, `<nk-app style="height:600px"><nk-sidebar slot="sidebar" id="sb"><nk-tree><nk-tree-item>Home</nk-tree-item></nk-tree></nk-sidebar>
    <nk-topbar><nk-btn id="burger" variant="sidebar" aria-label="Menu">☰</nk-btn><nk-breadcrumb><span>Home</span></nk-breadcrumb></nk-topbar><nk-page><p>Body</p></nk-page></nk-app>`);
  const btn = () => page.evaluate(() => { const b = document.getElementById('burger').shadowRoot.querySelector('button'); return { cls: b.className, display: getComputedStyle(b).display, expanded: b.getAttribute('aria-expanded'), label: b.getAttribute('aria-label') }; });
  expect(await btn()).toMatchObject({ cls: 'nk-topbar-btn nk-sidebar-toggle', expanded: 'false', label: 'Menu' });
  expect((await btn()).display).not.toBe('none');
  await page.evaluate(() => document.getElementById('burger').click());
  await settle(page);
  expect(await page.evaluate(() => [document.getElementById('sb').open, Math.round(document.getElementById('sb').shadowRoot.querySelector('.nk-sidebar').getBoundingClientRect().left)])).toEqual([true, 0]);
  expect((await btn()).expanded).toBe('true');
  await page.keyboard.press('Escape');
  await settle(page);
  expect((await btn()).expanded).toBe('false');
  await page.setViewportSize({ width: 1100, height: 800 });
  expect((await btn()).display).toBe('none');
});

// ── nk-steps ────────────────────────────────────────────────────────────────

test('nk-steps: done, current and the rest from `current`; the property takes descriptions; next() moves on', async ({ page }) => {
  await openHarness(page);
  await setStage(page, `<nk-steps id="st" label="Connect your own model" current="2" steps="Choose a provider, Enter the API key, Test the connection"></nk-steps>`);
  const state = () => page.evaluate(() => [...document.getElementById('st').shadowRoot.querySelectorAll('.nk-step')].map(li => `${li.className.replace('nk-step', '').trim() || 'todo'}:${li.querySelector('.st-mark').textContent}${li.getAttribute('aria-current') ? '*' : ''}`));
  expect(await state()).toEqual(['done:✓', 'current:2*', 'todo:3']);
  expect(await page.evaluate(() => document.getElementById('st').shadowRoot.querySelector('ol').getAttribute('aria-label'))).toBe('Connect your own model');
  await page.evaluate(() => { const s = document.getElementById('st'); s.steps = [{ label: 'Choose a provider', desc: 'Anthropic' }, 'Enter the API key', 'Test the connection']; s.next(); });
  expect(await state()).toEqual(['done:✓', 'done:✓', 'current:3*']);
  expect(await page.evaluate(() => document.getElementById('st').shadowRoot.querySelector('.st-desc').textContent)).toBe('Anthropic');
  await page.evaluate(() => document.getElementById('st').next());
  expect(await state()).toEqual(['done:✓', 'done:✓', 'done:✓']);
  const mark = await page.evaluate(() => { const r = document.getElementById('st').shadowRoot.querySelector('.st-mark').getBoundingClientRect(); return [r.width, r.height]; });
  expect(mark).toEqual([20, 20]);
});

// ── nk-segmented scroll ─────────────────────────────────────────────────────

for (const dir of ['ltr', 'rtl']) {
  test(`nk-segmented scroll (${dir}): the chosen option comes into view by scrolling the row, never the page`, async ({ page }) => {
    await openHarness(page);
    await setStage(page, `<div dir="${dir}" style="width:220px"><nk-segmented id="seg" value="day" scroll><button value="day">Day</button><button value="week">Week</button><button value="month">Month</button><button value="quarter">Quarter</button><button value="half">Half-year</button><button value="year">Year</button></nk-segmented></div>`);
    const shown = (v) => page.evaluate((v) => {
      const box = document.getElementById('seg').shadowRoot.querySelector('.nk-segmented').getBoundingClientRect();
      const b = document.querySelector(`#seg button[value="${v}"]`).getBoundingClientRect();
      return b.left >= box.left - 0.5 && b.right <= box.right + 0.5;
    }, v);
    expect(await shown('year')).toBe(false);
    const before = await page.evaluate(() => [scrollX, scrollY]);
    await page.evaluate(() => { document.getElementById('seg').value = 'year'; });
    await page.waitForTimeout(600);
    expect(await shown('year')).toBe(true);
    await page.evaluate(() => document.querySelector('#seg button[value="day"]').click());
    await page.waitForTimeout(600);
    expect(await shown('day')).toBe(true);
    expect(await page.evaluate(() => [scrollX, scrollY])).toEqual(before);
  });
}

// ── The reference app ───────────────────────────────────────────────────────

test('app.html: Status: Open filters table, board and list; the pill removes it; ＋ Filter adds one', async ({ page }) => {
  await page.goto('/app.html');
  await page.waitForFunction(() => document.getElementById('db').rows.length);
  const counts = () => page.evaluate(() => {
    const db = document.getElementById('db');
    const badge = db.shadowRoot.querySelector('.nk-db-tab .badge').textContent;
    return { rows: db.rows.length, badge, filterActive: document.getElementById('filterBtn').active, pills: document.getElementById('filterBar').shadowRoot.querySelectorAll('.nk-filter-pill.active').length };
  });
  expect(await counts()).toEqual({ rows: 2, badge: '2', filterActive: true, pills: 1 });
  await page.click('#filterBar .fp-remove');
  expect(await counts()).toEqual({ rows: 4, badge: '4', filterActive: false, pills: 0 });
  await page.click('#filterBar .nk-filter-pill.add');
  await settle(page);
  expect(await page.evaluate(() => document.getElementById('filterMenu').open)).toBe(true);
  await page.click('#filterMenu nk-menu-item[value="done"]');
  expect(await counts()).toEqual({ rows: 2, badge: '2', filterActive: true, pills: 1 });
});

test('app.html on a phone: #menu is a sheet, More opens a sheet and returns focus, the ☰ opens the drawer', async ({ page }) => {
  await page.setViewportSize(PHONE);
  await page.goto('/app.html#menu');
  await settle(page);
  const menu = await page.evaluate(() => { const r = document.getElementById('pageOptions').shadowRoot.querySelector('.nk-pop').getBoundingClientRect(); return [r.left, Math.round(r.bottom)]; });
  expect(menu).toEqual([0, PHONE.height]);
  await page.mouse.click(200, 40);
  await settle(page);
  await page.click('#moreTab');
  await settle(page);
  expect(await page.evaluate(() => document.getElementById('moreSheet').open)).toBe(true);
  expect(await deepFocus(page)).toBe('div.nk-tree-item');
  await page.keyboard.press('Escape');
  await settle(page);
  expect(await page.evaluate(() => { let el = document.activeElement; while (el?.shadowRoot?.activeElement) el = el.shadowRoot.activeElement; return el.closest('nk-tab-bar-item')?.id ?? el.getRootNode().host?.id; })).toBe('moreTab');
  await page.click('#menuBtn');
  await settle(page);
  expect(await page.evaluate(() => document.getElementById('sidebar').open)).toBe(true);
  expect(await page.evaluate(() => document.documentElement.scrollWidth)).toBeLessThanOrEqual(PHONE.width);
});

test('app.html: choosing your own model shows the steps; Save and Test move them on', async ({ page }) => {
  await page.goto('/app.html#settings');
  await settle(page);
  await page.evaluate(() => document.getElementById('settingsModal').show('ai'));
  const steps = () => page.evaluate(() => { const s = document.getElementById('modelSteps'); return s.hidden ? 'hidden' : [...s.shadowRoot.querySelectorAll('.nk-step')].map(li => li.querySelector('.st-mark').textContent).join(''); });
  expect(await steps()).toBe('hidden');
  await page.click('nk-model-card[value="custom"]');
  expect(await steps()).toBe('✓23');
  await page.click('#aiSave');
  expect(await steps()).toBe('✓✓3');
  await page.click('#aiTest');
  expect(await steps()).toBe('✓✓✓');
});
