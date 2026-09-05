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
  expect(await page.evaluate(asideWidth)).toBe(0);
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
