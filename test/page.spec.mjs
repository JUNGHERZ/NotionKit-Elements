// Wave 3: tabs + panels, segmented (form), model-card group, member list,
// editable page title, skeleton lines, page icon action.
import { test, expect } from '@playwright/test';
import { openHarness, setStage } from './helpers.mjs';

test('tabs: value drives active tab and panel visibility; keyboard moves', async ({ page }) => {
  await openHarness(page);
  await setStage(page, `<nk-tabs id="tabs">
    <nk-tab id="t1" value="a">A</nk-tab><nk-tab id="t2" value="b">B</nk-tab><nk-tab id="t3" value="c" disabled>C</nk-tab>
    <div slot="panel" data-tab="a" id="pa">PA</div><div slot="panel" data-tab="b" id="pb">PB</div></nk-tabs>`);
  const state = () => ({ value: document.getElementById('tabs').value, active: [...document.querySelectorAll('nk-tab[active]')].map(t => t.id), pa: document.getElementById('pa').hidden, pb: document.getElementById('pb').hidden });
  expect(await page.evaluate(state)).toEqual({ value: 'a', active: ['t1'], pa: false, pb: true });
  const changes = [];
  await page.exposeFunction('chg', v => changes.push(v));
  await page.evaluate(() => document.getElementById('tabs').addEventListener('nk-change', e => window.chg(e.detail.value)));
  await page.evaluate(() => document.getElementById('t2').shadowRoot.querySelector('.nk-tab').click());
  expect(await page.evaluate(state)).toEqual({ value: 'b', active: ['t2'], pa: true, pb: false });
  await page.evaluate(() => document.getElementById('t2').focus());
  await page.keyboard.press('ArrowRight');     // c is disabled → wraps to a
  expect(await page.evaluate(state)).toEqual({ value: 'a', active: ['t1'], pa: false, pb: true });
  await page.evaluate(() => { document.getElementById('tabs').value = 'b'; });
  expect(changes).toEqual(['b', 'a', 'b']);
});

test('segmented: moves .active on light-DOM buttons, submits with the form, resets', async ({ page }) => {
  await openHarness(page);
  await setStage(page, `<form id="f"><nk-segmented id="seg" name="range" value="week"><button value="week">W</button><button value="month">M</button><button value="quarter">Q</button></nk-segmented></form>`);
  const state = () => ({ value: document.getElementById('seg').value, active: [...document.querySelectorAll('#seg button')].map(b => b.classList.contains('active')), types: [...document.querySelectorAll('#seg button')].map(b => b.type), data: [...new FormData(document.getElementById('f')).entries()] });
  expect(await page.evaluate(state)).toEqual({ value: 'week', active: [true, false, false], types: ['button', 'button', 'button'], data: [['range', 'week']] });
  let events = 0;
  await page.exposeFunction('cnt', () => events++);
  await page.evaluate(() => document.getElementById('seg').addEventListener('nk-change', () => window.cnt()));
  await page.locator('#seg button[value=month]').click();
  expect(await page.evaluate(state)).toEqual({ value: 'month', active: [false, true, false], types: ['button', 'button', 'button'], data: [['range', 'month']] });
  await page.keyboard.press('ArrowRight');
  expect(await page.evaluate(() => document.getElementById('seg').value)).toBe('quarter');
  await page.evaluate(() => document.getElementById('f').reset());
  expect(await page.evaluate(() => document.getElementById('seg').value)).toBe('week');
  expect(events).toBe(2);
});

test('model cards with the same name are exclusive and submit one value', async ({ page }) => {
  await openHarness(page);
  await setStage(page, `<form id="f"><nk-model-card id="a" name="m" value="pro" title="Pro" selected></nk-model-card><nk-model-card id="b" name="m" value="fast" title="Fast"></nk-model-card><nk-model-card id="c" name="other" value="x" title="X" selected></nk-model-card></form>`);
  const sel = () => [...document.querySelectorAll('nk-model-card[selected]')].map(c => c.id);
  expect(await page.evaluate(sel)).toEqual(['a', 'c']);
  await page.evaluate(() => document.getElementById('b').shadowRoot.querySelector('.nk-model-card').click());
  expect(await page.evaluate(sel)).toEqual(['b', 'c']);
  expect(await page.evaluate(() => [...new FormData(document.getElementById('f')).entries()])).toEqual([['m', 'fast'], ['other', 'x']]);
  expect(await page.evaluate(() => document.getElementById('b').shadowRoot.querySelector('.nk-model-card').classList.contains('selected'))).toBe(true);
});

test('member list marks the last row; the mark moves when rows change', async ({ page }) => {
  await openHarness(page);
  await setStage(page, `<nk-member-list id="l"><nk-member-row id="r1" name="Ada Lovelace"></nk-member-row><nk-member-row id="r2" name="Grace Hopper"></nk-member-row></nk-member-list>`);
  const last = () => [...document.querySelectorAll('nk-member-row[last]')].map(r => r.id);
  expect(await page.evaluate(last)).toEqual(['r2']);
  expect(await page.evaluate(() => document.getElementById('r1').shadowRoot.querySelector('.mini-avatar').textContent)).toBe('AL');
  await page.evaluate(() => document.getElementById('r2').remove());
  await page.waitForFunction(() => document.querySelectorAll('nk-member-row[last]').length === 1 && document.querySelector('nk-member-row[last]').id === 'r1');
  expect(await page.evaluate(() => getComputedStyle(document.getElementById('r1').shadowRoot.querySelector('.nk-member-row')).borderBottomStyle)).toBe('none');
});

test('editable page title commits on Enter and blur', async ({ page }) => {
  await openHarness(page);
  await setStage(page, `<nk-page-title id="t" editable>Old</nk-page-title>`);
  const values = [];
  await page.exposeFunction('val', v => values.push(v));
  await page.evaluate(() => document.getElementById('t').addEventListener('nk-change', e => window.val(e.detail.value)));
  const h1 = page.locator('#t').locator('h1');
  await h1.click();
  await page.keyboard.press('End');
  await page.keyboard.type(' page');
  await page.keyboard.press('Enter');
  expect(values).toEqual(['Old page']);
  expect(await page.evaluate(() => document.getElementById('t').value)).toBe('Old page');
  expect(await page.evaluate(() => document.getElementById('t').shadowRoot.querySelector('h1').textContent.includes('\n'))).toBe(false);
});

test('skeleton lines, avatar-group more bubble, page icon action', async ({ page }) => {
  await openHarness(page);
  await setStage(page, `<nk-skeleton id="s" lines="3" widths="100%,85%,40%"></nk-skeleton><nk-avatar-group id="g" more="+2"><span class="mini-avatar">A</span></nk-avatar-group><nk-page id="p" icon="🚀" narrow></nk-page>`);
  expect(await page.evaluate(() => [...document.getElementById('s').shadowRoot.querySelectorAll('.nk-skeleton')].map(l => l.style.width))).toEqual(['100%', '85%', '40%']);
  expect(await page.evaluate(() => document.getElementById('g').shadowRoot.querySelector('.more').getBoundingClientRect().width)).toBe(26);
  const actions = [];
  await page.exposeFunction('act', a => actions.push(a));
  await page.evaluate(() => document.getElementById('p').addEventListener('nk-action', e => window.act(e.detail.action)));
  await page.evaluate(() => document.getElementById('p').shadowRoot.querySelector('.nk-page-icon').click());
  expect(actions).toEqual(['icon']);
  expect(await page.evaluate(() => !!document.getElementById('p').shadowRoot.querySelector('.nk-page-scroll'))).toBe(false);
});
