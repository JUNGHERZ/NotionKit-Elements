// 1.13.0: what LearnHub's move to 1.11 found – fields in a narrow panel,
// a cover without a page icon, and cover heights as tokens that reach the
// shadow roots.
import { test, expect } from '@playwright/test';
import { openHarness, setStage } from './helpers.mjs';

const settle = page => page.waitForTimeout(350);
const inner = (page, id, sel) => page.evaluate(([id, sel]) => { const r = document.getElementById(id).shadowRoot.querySelector(sel).getBoundingClientRect(); return { w: Math.round(r.width), h: Math.round(r.height), top: Math.round(r.top), bottom: Math.round(r.bottom) }; }, [id, sel]);

test('fields in a 200px nk-panel stay inside it; a field row keeps its 210px, in a panel too', async ({ page }) => {
  await openHarness(page);
  await setStage(page, `<div style="width:200px"><nk-panel title="Pipeline key">
      <nk-copy-field id="c" value="lh_pipe_4f9a8c7d9e" mono></nk-copy-field><nk-input id="i"></nk-input>
      <nk-select id="s"><option>Compliance bei LIST</option></nk-select></nk-panel></div>
    <div style="width:600px"><nk-panel title="Account"><nk-field label="Name"><nk-input id="r"></nk-input></nk-field></nk-panel></div>`);
  await settle(page);
  const panel = await page.evaluate(() => Math.round(document.querySelector('nk-panel').shadowRoot.querySelector('.nk-panel').getBoundingClientRect().width) - 34);
  expect(panel).toBe(166);
  expect([(await inner(page, 'c', '.nk-copy-field')).w, (await inner(page, 'i', '.nk-input')).w, (await inner(page, 's', '.nk-select')).w]).toEqual([166, 166, 166]);
  expect((await inner(page, 'r', '.nk-input')).w).toBe(210);
});

test('nk-page: a cover without an icon keeps the top padding; an icon, even slotted later, makes it covered', async ({ page }) => {
  await openHarness(page);
  await setStage(page, `<div style="height:600px;display:flex;flex-direction:column"><nk-page id="p" cover narrow><nk-page-title>Compliance</nk-page-title></nk-page></div>`);
  const state = () => page.evaluate(() => { const box = document.getElementById('p').shadowRoot.querySelector('.nk-page'); return [box.classList.contains('covered'), getComputedStyle(box).paddingTop]; });
  expect(await state()).toEqual([false, '24px']);
  await page.evaluate(() => { const s = document.createElement('span'); s.slot = 'icon'; s.textContent = '📘'; document.getElementById('p').prepend(s); });
  await settle(page);
  expect(await state()).toEqual([true, '0px']);
  await page.evaluate(() => { document.querySelector('#p [slot="icon"]').remove(); document.getElementById('p').setAttribute('icon', '🚀'); });
  await settle(page);
  expect(await state()).toEqual([true, '0px']);
  await page.evaluate(() => document.getElementById('p').removeAttribute('icon'));
  expect(await state()).toEqual([false, '24px']);
});

test('--nk-cover-height and --nk-panel-cover-height reach the shadow roots, on :root or per element', async ({ page }) => {
  await openHarness(page);
  await setStage(page, `<nk-page-cover id="a"></nk-page-cover><nk-page-cover id="b" style="--nk-cover-height: 120px"></nk-page-cover>
    <div style="width:260px"><nk-panel id="c" cover title="Course"></nk-panel></div>`);
  const h = async () => [(await inner(page, 'a', '.nk-cover')).h, (await inner(page, 'b', '.nk-cover')).h, (await inner(page, 'c', '.nk-cover')).h];
  expect(await h()).toEqual([200, 120, 64]);
  await page.evaluate(() => { document.documentElement.style.setProperty('--nk-cover-height', '260px'); document.documentElement.style.setProperty('--nk-panel-cover-height', '130px'); });
  await settle(page);
  expect(await h()).toEqual([260, 120, 130]);
});
