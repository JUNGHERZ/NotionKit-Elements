// Wave 2: tree behaviour (single active, keyboard, manual slots, data),
// breadcrumb cloning, sidebar footer/drawer, theme toggle.
import { test, expect } from '@playwright/test';
import { openHarness, setStage } from './helpers.mjs';

const TREE = `<nk-tree id="tree">
  <nk-section-label id="sec" addable>Favourites</nk-section-label>
  <nk-tree-item id="a" icon="📊" value="a" open>Overview
    <nk-tree-item id="a1" value="a1" active>MVP</nk-tree-item>
    <nk-tree-item id="a2" value="a2">VOH</nk-tree-item>
  </nk-tree-item>
  <nk-tree-item id="b" icon="🧠" value="b">Knowledge
    <nk-tree-item id="b1" value="b1">Onboarding</nk-tree-item>
  </nk-tree-item>
  <nk-tree-item id="c" value="c">Design</nk-tree-item>
</nk-tree>`;

const active = () => [...document.querySelectorAll('nk-tree-item[active]')].map(i => i.id);
// `row` is used inside page.evaluate callbacks – define it in the page.
test.beforeEach(async ({ page }) => {
  await page.addInitScript(() => { window.row = id => document.getElementById(id).shadowRoot.querySelector('.nk-tree-item'); });
});

test('manual slots: text → label, nested items → children, arrow only with children', async ({ page }) => {
  await openHarness(page);
  await setStage(page, TREE);
  const r = await page.evaluate(() => ({
    labelA: document.getElementById('a').label,
    labelA1: document.getElementById('a1').label,
    arrowA: getComputedStyle(document.getElementById('a').shadowRoot.querySelector('.nk-toggle-arrow')).display !== 'none',
    arrowC: getComputedStyle(document.getElementById('c').shadowRoot.querySelector('.nk-toggle-arrow')).display !== 'none',
    childrenA: document.getElementById('a').shadowRoot.querySelector('slot[name=children]').assignedElements().map(e => e.id),
    collapsedB: document.getElementById('b').shadowRoot.querySelector('.nk-tree-children').classList.contains('collapsed'),
    hiddenB1: row('b1').getBoundingClientRect().height === 0,
  }));
  expect(r).toEqual({ labelA: 'Overview', labelA1: 'MVP', arrowA: true, arrowC: false, childrenA: ['a1', 'a2'], collapsedB: true, hiddenB1: true });
});

test('clicking an item moves `active`; the arrow toggles without selecting; hover actions report', async ({ page }) => {
  await openHarness(page);
  await setStage(page, TREE);
  const events = [];
  await page.exposeFunction('rec', (t, d) => events.push([t, d]));
  await page.evaluate(() => ['nk-select', 'nk-toggle', 'nk-action'].forEach(t => document.getElementById('tree').addEventListener(t, e => window.rec(t, t === 'nk-action' ? e.detail.action : e.detail.value))));
  expect(await page.evaluate(active)).toEqual(['a1']);
  await page.evaluate(() => row('c').click());
  expect(await page.evaluate(active)).toEqual(['c']);
  await page.evaluate(() => document.getElementById('b').shadowRoot.querySelector('.nk-toggle-arrow').click());
  expect(await page.evaluate(active)).toEqual(['c']);
  expect(await page.evaluate(() => document.getElementById('b').open)).toBe(true);
  await page.evaluate(() => document.getElementById('a').shadowRoot.querySelector('[data-action=more]').click());
  expect(events).toEqual([['nk-select', 'c'], ['nk-toggle', 'b'], ['nk-action', 'more']]);
  expect(await page.evaluate(active)).toEqual(['c']);
});

test('nk-select can be cancelled to keep the current item', async ({ page }) => {
  await openHarness(page);
  await setStage(page, TREE);
  await page.evaluate(() => document.getElementById('tree').addEventListener('nk-select', e => e.preventDefault()));
  await page.evaluate(() => row('c').click());
  expect(await page.evaluate(active)).toEqual(['a1']);
});

test('one tab stop; arrow keys walk visible rows, → expands, ← collapses / goes up', async ({ page }) => {
  await openHarness(page);
  await setStage(page, `<input id="before">${TREE}`);
  const tabbable = () => [...document.querySelectorAll('nk-tree-item')].filter(i => i.tabbable).map(i => i.id);
  expect(await page.evaluate(tabbable)).toEqual(['a1']);       // the active one
  await page.locator('#before').focus();
  await page.keyboard.press('Tab');
  const focused = () => document.activeElement.id;
  expect(await page.evaluate(focused)).toBe('a1');
  await page.keyboard.press('ArrowDown'); expect(await page.evaluate(focused)).toBe('a2');
  await page.keyboard.press('ArrowDown'); expect(await page.evaluate(focused)).toBe('b');
  await page.keyboard.press('ArrowDown'); expect(await page.evaluate(focused)).toBe('c');   // b1 is collapsed
  await page.keyboard.press('ArrowUp');   expect(await page.evaluate(focused)).toBe('b');
  await page.keyboard.press('ArrowRight'); expect(await page.evaluate(() => document.getElementById('b').open)).toBe(true);
  await page.keyboard.press('ArrowRight'); expect(await page.evaluate(focused)).toBe('b1');
  await page.keyboard.press('ArrowLeft');  expect(await page.evaluate(focused)).toBe('b');
  await page.keyboard.press('ArrowLeft');  expect(await page.evaluate(() => document.getElementById('b').open)).toBe(false);
  await page.keyboard.press('Home');       expect(await page.evaluate(focused)).toBe('a');
  await page.keyboard.press('End');        expect(await page.evaluate(focused)).toBe('c');
  await page.keyboard.press('Enter');      expect(await page.evaluate(active)).toEqual(['c']);
  expect(await page.evaluate(tabbable)).toEqual(['c']);
});

test('tree.data renders nested items and a section label ＋ fires nk-action', async ({ page }) => {
  await openHarness(page);
  await setStage(page, `<nk-tree id="tree"></nk-tree>`);
  await page.evaluate(() => { document.getElementById('tree').data = [
    { label: 'Home', icon: '🏠', value: 'home', active: true },
    { label: 'Docs', icon: '📚', value: 'docs', open: true, children: [{ label: 'Intro', value: 'intro' }] },
  ]; });
  expect(await page.evaluate(() => [...document.querySelectorAll('nk-tree-item')].map(i => [i.value, i.label, i.hasChildren]))).toEqual([['home', 'Home', false], ['docs', 'Docs', true], ['intro', 'Intro', false]]);
  expect(await page.evaluate(() => document.getElementById('tree').value)).toBe('home');
  await setStage(page, `<nk-section-label id="sec" addable>Fav</nk-section-label>`);
  const actions = [];
  await page.exposeFunction('act', a => actions.push(a));
  await page.evaluate(() => document.getElementById('sec').addEventListener('nk-action', e => window.act(e.detail.action)));
  await page.evaluate(() => document.getElementById('sec').shadowRoot.querySelector('.plus').click());
  expect(actions).toEqual(['add']);
});

test('breadcrumb clones children with separators, follows changes, forwards one click', async ({ page }) => {
  await openHarness(page);
  await setStage(page, `<nk-breadcrumb id="bc"><a id="l1" href="#one">One</a><span>Two</span></nk-breadcrumb>`);
  const crumbs = () => [...document.getElementById('bc').shadowRoot.querySelectorAll('.nk-breadcrumb > *')].map(n => n.className + ':' + n.textContent);
  expect(await page.evaluate(crumbs)).toEqual(['crumb:One', 'sep:/', 'crumb current:Two']);
  const seen = [];
  await page.exposeFunction('seen', v => seen.push(v));
  await page.evaluate(() => {
    document.getElementById('l1').addEventListener('click', () => window.seen('original-click'));
    document.getElementById('bc').addEventListener('nk-select', e => window.seen('select:' + e.detail.index + ':' + e.detail.href));
  });
  await page.evaluate(() => document.getElementById('bc').shadowRoot.querySelector('.crumb').click());
  expect(seen).toEqual(['select:0:#one', 'original-click']);
  expect(await page.evaluate(() => location.hash)).toBe('#one');
  await page.evaluate(() => { document.getElementById('bc').insertAdjacentHTML('beforeend', '<span>Three</span>'); });
  await page.waitForFunction(() => document.getElementById('bc').shadowRoot.querySelectorAll('.crumb').length === 3);
  expect(await page.evaluate(crumbs)).toEqual(['crumb:One', 'sep:/', 'crumb:Two', 'sep:/', 'crumb current:Three']);
});

test('sidebar: footer rows are compact, footer hidden when empty, drawer opens below 860px', async ({ page }) => {
  await openHarness(page);
  await setStage(page, `<div style="display:flex;height:300px"><nk-sidebar id="sb"><nk-tree-item id="f" slot="footer" icon="⚙️">Settings</nk-tree-item></nk-sidebar></div><nk-sidebar id="sb2"></nk-sidebar>`);
  expect(await page.evaluate(() => document.getElementById('f').hasAttribute('compact'))).toBe(true);
  expect(await page.evaluate(() => row('f').classList.contains('compact'))).toBe(true);
  expect(await page.evaluate(() => getComputedStyle(document.getElementById('sb2').shadowRoot.querySelector('.nk-sidebar-footer')).display)).toBe('none');
  await page.setViewportSize({ width: 600, height: 700 });
  const asideWidth = () => document.getElementById('sb').shadowRoot.querySelector('.nk-sidebar').getBoundingClientRect().width;
  // Crossing the breakpoint runs the drawer's slide-out (display is held for 240ms).
  await expect.poll(() => page.evaluate(asideWidth)).toBe(0);
  await page.evaluate(() => document.getElementById('sb').show());
  expect(await page.evaluate(asideWidth)).toBe(260);
  expect(await page.evaluate(() => getComputedStyle(document.getElementById('sb').shadowRoot.querySelector('.nk-sidebar')).position)).toBe('fixed');
  await page.keyboard.press('Escape');
  expect(await page.evaluate(() => document.getElementById('sb').open)).toBe(false);
});

test('theme toggle flips <html data-theme>, persists it and updates its glyph', async ({ page }) => {
  await openHarness(page);
  await setStage(page, `<nk-theme-toggle id="tt"></nk-theme-toggle><nk-btn id="b">x</nk-btn>`);
  const state = () => ({ theme: document.documentElement.dataset.theme, glyph: document.getElementById('tt').shadowRoot.querySelector('button').textContent, stored: localStorage.getItem('nk-theme'), wrapper: document.getElementById('b').shadowRoot.querySelector('.nk-wrapper').dataset.theme });
  expect(await page.evaluate(state)).toEqual({ theme: 'light', glyph: '🌙', stored: null, wrapper: 'light' });
  await page.evaluate(() => document.getElementById('tt').shadowRoot.querySelector('button').click());
  expect(await page.evaluate(state)).toEqual({ theme: 'dark', glyph: '☀️', stored: 'dark', wrapper: 'dark' });
  await page.evaluate(() => window.postMessage({ nkTheme: 'light' }, '*'));
  await page.waitForFunction(() => document.documentElement.dataset.theme === 'light');
  expect(await page.evaluate(state)).toEqual({ theme: 'light', glyph: '🌙', stored: 'light', wrapper: 'light' });
  await page.evaluate(() => localStorage.removeItem('nk-theme'));
});

test('a tree item moved to another tree keeps selecting', async ({ page }) => {
  await openHarness(page);
  await setStage(page, `<nk-tree id="t1"><nk-tree-item id="x" value="x">X</nk-tree-item></nk-tree><nk-tree id="t2"><nk-tree-item id="y" value="y" active>Y</nk-tree-item></nk-tree>`);
  await page.evaluate(() => document.getElementById('t2').appendChild(document.getElementById('x')));
  await page.evaluate(() => row('x').click());
  expect(await page.evaluate(active)).toEqual(['x']);
  expect(await page.evaluate(() => document.getElementById('x').label)).toBe('X');
});

// The mobile tab bar: one active item, drawer item, hidden above 860px.
const TABBAR = `<nk-app id="app" style="height:400px">
  <nk-sidebar slot="sidebar" id="sb"><nk-tree><nk-tree-item value="home">Home</nk-tree-item></nk-tree></nk-sidebar>
  <nk-topbar><nk-breadcrumb><span>Home</span></nk-breadcrumb></nk-topbar>
  <nk-page><p>Body</p></nk-page>
  <nk-tab-bar id="bar" value="inbox">
    <nk-tab-bar-item id="home" icon="🏠" value="home">Home</nk-tab-bar-item>
    <nk-tab-bar-item id="inbox" icon="📥" value="inbox">Inbox</nk-tab-bar-item>
    <nk-tab-bar-item id="search" icon="🔍" value="search" disabled>Search</nk-tab-bar-item>
    <nk-tab-bar-item id="more" icon="☰" drawer>More</nk-tab-bar-item>
  </nk-tab-bar>
</nk-app>`;

test('tab bar: value ↔ active, nk-change / nk-select, disabled items, drawer item opens the sidebar', async ({ page }) => {
  await openHarness(page);
  await page.evaluate(() => { window.activeTabs = () => [...document.querySelectorAll('nk-tab-bar-item[active]')].map(i => i.id); });
  await setStage(page, TABBAR);
  expect(await page.evaluate(() => [window.activeTabs(), document.getElementById('bar').value])).toEqual([['inbox'], 'inbox']);

  const events = await page.evaluate(() => {
    const log = [];
    document.getElementById('bar').addEventListener('nk-change', e => log.push(['change', e.detail.value]));
    document.getElementById('bar').addEventListener('nk-select', e => log.push(['select', e.detail.value, e.detail.drawer]));
    document.getElementById('home').shadowRoot.querySelector('button').click();
    document.getElementById('search').shadowRoot.querySelector('button').click();   // disabled – nothing
    window.__log = log;
    return { log, active: window.activeTabs(), value: document.getElementById('bar').value, current: document.getElementById('home').shadowRoot.querySelector('button').getAttribute('aria-current') };
  });
  expect(events).toEqual({ log: [['select', 'home', false], ['change', 'home']], active: ['home'], value: 'home', current: 'page' });

  // Programmatic value moves `active` and reports once; an unknown value is ignored.
  expect(await page.evaluate(() => { document.getElementById('bar').value = 'inbox'; document.getElementById('bar').value = 'nope'; return [window.activeTabs(), window.__log.length]; })).toEqual([['inbox'], 3]);

  // The drawer item toggles the sidebar and never becomes active.
  expect(await page.evaluate(() => {
    document.getElementById('more').shadowRoot.querySelector('button').click();
    const open = document.getElementById('sb').open;
    return [open, window.activeTabs(), window.__log.at(-1)];
  })).toEqual([true, ['inbox'], ['select', 'More', true]]);

  // A cancelled nk-select leaves everything as it is.
  expect(await page.evaluate(() => {
    document.getElementById('bar').addEventListener('nk-select', e => e.preventDefault(), { once: true });
    document.getElementById('home').shadowRoot.querySelector('button').click();
    return window.activeTabs();
  })).toEqual(['inbox']);
});

test('tab bar: hidden on desktop, shown below 860px at the bottom of the main column, `always` overrides', async ({ page }) => {
  await openHarness(page);
  await setStage(page, TABBAR);
  const display = () => page.evaluate(() => getComputedStyle(document.getElementById('bar').shadowRoot.querySelector('.nk-tab-bar')).display);
  expect(await display()).toBe('none');
  await page.evaluate(() => { document.getElementById('bar').always = true; });
  expect(await display()).toBe('flex');
  await page.evaluate(() => { document.getElementById('bar').always = false; });

  await page.setViewportSize({ width: 390, height: 700 });
  expect(await display()).toBe('flex');
  const geo = await page.evaluate(() => {
    const app = document.getElementById('app').shadowRoot.querySelector('.nk-app').getBoundingClientRect();
    const main = document.getElementById('app').shadowRoot.querySelector('.nk-main').getBoundingClientRect();
    const bar = document.getElementById('bar').shadowRoot.querySelector('.nk-tab-bar').getBoundingClientRect();
    const page = document.querySelector('nk-page').shadowRoot.querySelector('.nk-page-scroll').getBoundingClientRect();
    return { barBottomAtApp: Math.round(bar.bottom) === Math.round(app.bottom), fullWidth: Math.round(bar.width) === Math.round(main.width), pageAboveBar: page.bottom <= bar.top + 0.5, height: Math.round(bar.height) };
  });
  expect(geo).toEqual({ barBottomAtApp: true, fullWidth: true, pageAboveBar: true, height: geo.height });
  expect(geo.height).toBeGreaterThan(40);
  expect(geo.height).toBeLessThan(70);
});

test('tab bar `fixed`: pinned to the viewport bottom, the spacer keeps its height, the page ends above it', async ({ page }) => {
  await openHarness(page);
  await page.setViewportSize({ width: 390, height: 700 });
  await setStage(page, TABBAR.replace('<nk-tab-bar id="bar"', '<nk-tab-bar id="bar" fixed'));
  const r = await page.evaluate(() => {
    const root = document.getElementById('bar').shadowRoot;
    const nav = root.querySelector('.nk-tab-bar'), spacer = root.querySelector('.nk-tab-bar-spacer');
    const scroll = document.querySelector('nk-page').shadowRoot.querySelector('.nk-page-scroll').getBoundingClientRect();
    return { position: getComputedStyle(nav).position, navBottom: Math.round(nav.getBoundingClientRect().bottom), spacerDisplay: getComputedStyle(spacer).display,
      spacerHeight: Math.round(spacer.getBoundingClientRect().height), navHeight: Math.round(nav.getBoundingClientRect().height), pageEndsAbove: Math.abs(scroll.bottom - spacer.getBoundingClientRect().top) < 1 };
  });
  expect(r).toEqual({ position: 'fixed', navBottom: 700, spacerDisplay: 'block', spacerHeight: 58, navHeight: 58, pageEndsAbove: true });
  // Not fixed: no spacer, the bar sits in the column.
  expect(await page.evaluate(() => { document.getElementById('bar').fixed = false; const root = document.getElementById('bar').shadowRoot; return [getComputedStyle(root.querySelector('.nk-tab-bar')).position, getComputedStyle(root.querySelector('.nk-tab-bar-spacer')).display]; })).toEqual(['sticky', 'none']);
});

// The drawer animates in CSS only: transform + display with allow-discrete, @starting-style for the way in.
test('sidebar drawer: slides in from the left, scrim fades, display is held while closing, reduced motion snaps', async ({ page }) => {
  await openHarness(page);
  await page.setViewportSize({ width: 600, height: 700 });
  await setStage(page, `<div style="display:flex;height:300px"><nk-sidebar id="sb"><nk-tree><nk-tree-item>Home</nk-tree-item></nk-tree></nk-sidebar></div>`);
  await page.evaluate(() => { window.probe = () => {
    const r = document.getElementById('sb').shadowRoot, a = getComputedStyle(r.querySelector('.nk-sidebar')), b = getComputedStyle(r.querySelector('.nk-sidebar-backdrop'));
    const x = a.transform === 'none' ? 0 : Math.round(Number(a.transform.match(/matrix\(([^)]*)\)/)[1].split(',')[4]));
    return { display: a.display, position: a.position, x, backdrop: b.display, opacity: Math.round(Number(b.opacity) * 100) / 100 };
  }; });
  await page.waitForTimeout(300);
  expect(await page.evaluate(() => window.probe())).toMatchObject({ display: 'none', position: 'fixed', backdrop: 'none' });

  // First frame after show(): starting style – fully off-screen, scrim transparent, but displayed.
  const t0 = await page.evaluate(() => { document.getElementById('sb').show(); return window.probe(); });
  expect(t0).toMatchObject({ display: 'flex', position: 'fixed', x: -260, backdrop: 'block', opacity: 0 });
  await page.waitForTimeout(400);
  expect(await page.evaluate(() => window.probe())).toEqual({ display: 'flex', position: 'fixed', x: 0, backdrop: 'block', opacity: 1 });

  // First frame after close(): still displayed and fixed, moving out.
  const c0 = await page.evaluate(() => { document.getElementById('sb').close(); return window.probe(); });
  expect(c0).toMatchObject({ display: 'flex', position: 'fixed', backdrop: 'block' });
  await page.waitForTimeout(120);
  const mid = await page.evaluate(() => window.probe());
  expect(mid.display).toBe('flex'); expect(mid.x).toBeLessThan(-20); expect(mid.x).toBeGreaterThan(-260); expect(mid.opacity).toBeLessThan(1);
  await page.waitForTimeout(300);
  expect(await page.evaluate(() => window.probe())).toMatchObject({ display: 'none', backdrop: 'none' });

  // Reduced motion: no transition in either direction.
  await page.emulateMedia({ reducedMotion: 'reduce' });
  expect(await page.evaluate(() => { document.getElementById('sb').show(); return window.probe(); })).toMatchObject({ display: 'flex', x: 0, opacity: 1 });
  expect(await page.evaluate(() => { document.getElementById('sb').close(); return window.probe(); })).toMatchObject({ display: 'none', backdrop: 'none' });
  await page.emulateMedia({ reducedMotion: 'no-preference' });
});

// Safe areas (iPhone landscape: Dynamic Island left/right 59px, home indicator 34px), emulated through CDP.
test('safe areas: tab bar, topbar, page and drawer keep their content inside the insets, backgrounds run edge to edge', async ({ page }) => {
  await openHarness(page);
  await page.setViewportSize({ width: 852, height: 393 });
  const cdp = await page.context().newCDPSession(page);
  await cdp.send('Emulation.setSafeAreaInsetsOverride', { insets: { top: 0, left: 59, right: 59, bottom: 34 } });
  await setStage(page, `<nk-app id="app" style="height:360px">
    <nk-sidebar slot="sidebar" id="sb"><nk-tree><nk-tree-item id="home" icon="🏠">Home</nk-tree-item></nk-tree></nk-sidebar>
    <nk-topbar><nk-btn id="menu" variant="topbar">☰</nk-btn><nk-breadcrumb><span>Home</span></nk-breadcrumb></nk-topbar>
    <nk-page><p id="text">Body</p></nk-page>
    <nk-tab-bar id="bar" value="home"><nk-tab-bar-item id="first" icon="🏠" value="home">Home</nk-tab-bar-item><nk-tab-bar-item icon="📥" value="inbox">Inbox</nk-tab-bar-item></nk-tab-bar>
  </nk-app>`);
  const r = await page.evaluate(() => {
    const app = document.getElementById('app').shadowRoot.querySelector('.nk-app').getBoundingClientRect();
    const bar = document.getElementById('bar').shadowRoot.querySelector('.nk-tab-bar');
    const cs = getComputedStyle(bar), b = bar.getBoundingClientRect();
    const first = document.getElementById('first').shadowRoot.querySelector('button').getBoundingClientRect();
    const topbar = document.querySelector('nk-topbar').shadowRoot.querySelector('.nk-topbar');
    const menu = document.getElementById('menu').shadowRoot.querySelector('button').getBoundingClientRect();
    const pg = document.querySelector('nk-page').shadowRoot.querySelector('.nk-page');
    return {
      barPadBottom: cs.paddingBottom, barHeight: Math.round(b.height), barEdgeToEdge: Math.round(b.left) === Math.round(app.left) && Math.round(b.right) === Math.round(app.right),
      firstItemLeft: Math.round(first.left - app.left), topbarPadLeft: getComputedStyle(topbar).paddingLeft, menuLeft: Math.round(menu.left - app.left),
      pagePadLeft: getComputedStyle(pg).paddingLeft, pagePadRight: getComputedStyle(pg).paddingRight,
    };
  });
  expect(r).toEqual({ barPadBottom: '34px', barHeight: 86, barEdgeToEdge: true, firstItemLeft: 59, topbarPadLeft: '59px', menuLeft: 59, pagePadLeft: '59px', pagePadRight: '59px' });
  // The drawer: wider by the inset, its rows start right of the island.
  await page.evaluate(() => document.getElementById('sb').show());
  await page.waitForTimeout(400);
  const d = await page.evaluate(() => {
    const aside = document.getElementById('sb').shadowRoot.querySelector('.nk-sidebar').getBoundingClientRect();
    const row = document.getElementById('home').shadowRoot.querySelector('.nk-tree-item').getBoundingClientRect();
    return { asideWidth: Math.round(aside.width), asideLeft: Math.round(aside.left), rowLeft: Math.round(row.left) };
  });
  expect(d.asideWidth).toBe(260 + 59); expect(d.asideLeft).toBe(0); expect(d.rowLeft).toBeGreaterThanOrEqual(59);
  await cdp.send('Emulation.setSafeAreaInsetsOverride', { insets: {} });
});
