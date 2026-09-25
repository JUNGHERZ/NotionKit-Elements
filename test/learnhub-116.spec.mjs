// 1.16.0: LearnHub's list – the panel icon without a cover (3), the select's
// value against the browser's preselection (4), a wide progress bar in a
// panel (5), the minified ES module (10), floating layers next to an open
// dialog (11), block margins in a column (15) – and Auxdesk's stretched
// button (25).
import { test, expect } from '@playwright/test';
import { openHarness, setStage } from './helpers.mjs';
import { CATALOG } from '../tools/catalog.mjs';

const settle = page => page.waitForTimeout(350);
const frames = page => page.evaluate(() => new Promise(r => requestAnimationFrame(() => requestAnimationFrame(r))));

test('nk-panel: an icon without a cover stays inside the tile; with a cover it overlaps the band; both ways at run time', async ({ page }) => {
  await openHarness(page);
  await setStage(page, '<div style="width:300px;padding-top:40px"><nk-panels><nk-panel id="p" icon="🎓" title="Meine Schulungen"><p>Text</p></nk-panel></nk-panels></div>');
  // Without a band the icon starts in the tile's 14px padding; with one it reaches up into the band.
  const pos = () => page.evaluate(() => {
    const r = document.getElementById('p').shadowRoot, box = r.querySelector('.nk-panel').getBoundingClientRect(), icon = r.querySelector('.nk-page-icon').getBoundingClientRect(), band = r.querySelector('.nk-cover');
    return { top: Math.round(icon.top - box.top), band: !!band, overlaps: band ? icon.top < band.getBoundingClientRect().bottom : false };
  });
  expect(await pos()).toEqual({ top: 15, band: false, overlaps: false });
  await page.evaluate(() => document.getElementById('p').setAttribute('cover', ''));
  expect(await pos()).toMatchObject({ band: true, overlaps: true });
  await page.evaluate(() => document.getElementById('p').removeAttribute('cover'));
  expect(await pos()).toEqual({ top: 15, band: false, overlaps: false });
});

test('nk-select: a value from the attribute waits for its option over the browser preselection, without nk-change; a choice made meanwhile stays', async ({ page }) => {
  await openHarness(page);
  await setStage(page, '<nk-select id="a" value="b"><option value="x">X</option></nk-select><nk-select id="c" value="b"><option value="x">X</option><option value="y">Y</option></nk-select>');
  await frames(page);
  const changes = await page.evaluate(() => { window.changes = 0; document.getElementById('a').addEventListener('nk-change', () => window.changes++); return window.changes; });
  expect(changes).toBe(0);
  await page.evaluate(() => document.getElementById('a').append(new Option('B', 'b')));
  await settle(page);
  expect(await page.evaluate(() => { const s = document.getElementById('a'); return [s.value, s.shadowRoot.querySelector('select').selectedOptions[0].textContent, window.changes]; })).toEqual(['b', 'B', 0]);
  // Someone picks Y before b arrives: the choice stays.
  await page.evaluate(() => { const sel = document.getElementById('c').shadowRoot.querySelector('select'); sel.value = 'y'; sel.dispatchEvent(new Event('change')); });
  await page.evaluate(() => document.getElementById('c').append(new Option('B', 'b')));
  await settle(page);
  expect(await page.evaluate(() => document.getElementById('c').value)).toBe('y');
});

test('nk-progress wide in a panel is a 6px bar', async ({ page }) => {
  await openHarness(page);
  await setStage(page, '<div style="width:300px"><nk-panel title="Fortschritt"><p>Text</p><nk-progress id="bar" value="40" wide></nk-progress></nk-panel></div>');
  expect(await page.evaluate(() => Math.round(document.getElementById('bar').shadowRoot.querySelector('.nk-progress').getBoundingClientRect().height))).toBe(6);
});

test('the minified ES module has the exports of the unminified one and defines every element', async ({ page }) => {
  const load = async src => {
    await page.goto(`/test/fixtures/esm.html?src=${src}`);
    await page.waitForFunction(() => window.ready);
    return page.evaluate(tags => ({ keys: Object.keys(window.esm).sort(), defined: tags.filter(t => customElements.get(t)).length, sheet: window.esm.componentsSheet instanceof CSSStyleSheet }), CATALOG.map(e => e.tag));
  };
  const plain = await load('esm.js'), min = await load('esm.min.js');
  expect(min.keys).toEqual(plain.keys);
  expect(min).toMatchObject({ defined: CATALOG.length, sheet: true });
  expect(CATALOG.length).toBe(88);
});

test('a floating date picker and menu under <body> stay usable while a dialog is open', async ({ page }) => {
  await openHarness(page);
  await page.evaluate(() => document.body.insertAdjacentHTML('beforeend', `<nk-dialog id="d" title="Termin"><button id="anchor">Datum</button><button id="more">⋯</button></nk-dialog>
    <nk-calendar id="cal" floating month="2026-09"></nk-calendar><nk-menu id="menu" floating><nk-menu-item value="rename">Rename</nk-menu-item></nk-menu>`));
  await page.evaluate(() => document.getElementById('d').show());
  await settle(page);
  await page.evaluate(() => document.getElementById('cal').show(document.getElementById('anchor')));
  await settle(page);
  expect(await page.evaluate(() => [document.getElementById('cal').inert, document.getElementById('menu').inert, document.getElementById('d').inert])).toEqual([false, false, false]);
  const day = await page.evaluate(() => { const b = [...document.getElementById('cal').shadowRoot.querySelectorAll('.cal-day')].find(x => x.textContent.trim() === '15' && !x.classList.contains('out')).getBoundingClientRect(); return { x: b.left + b.width / 2, y: b.top + b.height / 2 }; });
  const picked = page.evaluate(() => new Promise(r => document.getElementById('cal').addEventListener('nk-change', e => r(e.detail.value), { once: true })));
  await page.mouse.click(day.x, day.y);
  expect(await picked).toBe('2026-09-15');
  // The page behind the dialog is still inert.
  expect(await page.evaluate(() => document.getElementById('stage').inert || !!document.getElementById('stage').closest('[inert]'))).toBe(true);
});

test('--nk-block-space: 0 on a column drops the elements\' outer margins; flush drops one; headings keep theirs', async ({ page }) => {
  await openHarness(page);
  const blocks = '<nk-callout icon="💡">One</nk-callout><nk-callout icon="💡">Two</nk-callout><nk-divider></nk-divider><nk-quote>Quote</nk-quote><nk-code>code</nk-code><nk-steps steps="A, B"></nk-steps><nk-banner variant="info">Banner</nk-banner><nk-toggle summary="Toggle"></nk-toggle><nk-props><nk-prop label="Status">Open</nk-prop></nk-props>';
  await setStage(page, `<div id="col" style="display:flex;flex-direction:column;gap:14px;width:600px">${blocks}</div><div id="flow"><nk-callout id="f" icon="💡" flush>Flush</nk-callout><nk-callout id="n" icon="💡">Not</nk-callout></div>`);
  const gaps = () => page.evaluate(() => {
    const boxes = [...document.getElementById('col').children].map(h => h.shadowRoot.querySelector('.nk-wrapper > *').getBoundingClientRect());
    return boxes.slice(1).map((b, i) => Math.round(b.top - boxes[i].bottom));
  });
  const before = await gaps();
  expect(before[0]).toBe(46);                                    // 16 + 14 + 16
  await page.evaluate(() => document.getElementById('col').style.setProperty('--nk-block-space', '0'));
  await settle(page);
  expect(new Set(await gaps())).toEqual(new Set([14]));
  expect(await page.evaluate(() => ['f', 'n'].map(id => getComputedStyle(document.getElementById(id).shadowRoot.querySelector('.nk-callout')).marginTop))).toEqual(['0px', '16px']);
});

test('nk-btn stretched across a column keeps its label centred', async ({ page }) => {
  await openHarness(page);
  await setStage(page, '<div style="display:flex;flex-direction:column;width:360px"><nk-btn id="b" variant="primary">Mit Code anmelden</nk-btn></div>');
  expect(await page.evaluate(() => { const btn = document.getElementById('b').shadowRoot.querySelector('.nk-btn'); const b = btn.getBoundingClientRect(); const range = document.createRange(); range.selectNodeContents(document.getElementById('b')); const t = range.getBoundingClientRect(); return [Math.round(b.width), Math.abs(Math.round((b.left + b.right) / 2 - (t.left + t.right) / 2)) <= 1]; })).toEqual([360, true]);
});
