// Phone regressions (1.5.3): at 390px no page of the site scrolls sideways,
// the settings modal keeps to the screen and the topbar keeps to one row.
import { test, expect } from '@playwright/test';

const PHONE = { width: 390, height: 844 };
const PAGES = ['index.html', 'de/index.html', 'docs.html', 'de/docs.html', 'showcase.html', 'de/showcase.html', 'app.html', 'de/app.html'];

async function ready(page) {
  await page.waitForFunction(() => customElements.get('nk-modal') && customElements.get('nk-topbar'));
  await page.evaluate(() => new Promise(r => requestAnimationFrame(() => requestAnimationFrame(r))));
}

for (const path of PAGES) {
  test(`${path} does not scroll sideways at 390px`, async ({ page }) => {
    await page.setViewportSize(PHONE);
    await page.goto('/' + path);
    await ready(page);
    await page.waitForTimeout(200);
    expect(await page.evaluate(() => document.documentElement.scrollWidth)).toBeLessThanOrEqual(PHONE.width);
  });
}

test('every settings pane keeps to the screen at 390px', async ({ page }) => {
  await page.setViewportSize(PHONE);
  await page.goto('/app.html');
  await ready(page);
  const overflow = await page.evaluate(async () => {
    const modal = document.getElementById('settingsModal');
    modal.show();
    await new Promise(r => setTimeout(r, 400));
    const content = modal.shadowRoot.querySelector('.nk-settings-content');
    const out = {};
    for (const pane of modal.panes) {
      modal.setAttribute('pane', pane.name);
      await new Promise(r => requestAnimationFrame(() => requestAnimationFrame(r)));
      out[pane.name] = content.scrollWidth - content.clientWidth;
    }
    return out;
  });
  expect(Object.keys(overflow).length).toBeGreaterThan(4);
  for (const [pane, px] of Object.entries(overflow)) expect(px, pane).toBeLessThanOrEqual(1);
});

test('the topbar keeps to one row on a phone', async ({ page }) => {
  await page.setViewportSize(PHONE);
  await page.goto('/app.html');
  await ready(page);
  const r = await page.evaluate(() => {
    const bar = document.querySelector('nk-topbar').shadowRoot.querySelector('.nk-topbar');
    const actions = bar.querySelector('.nk-topbar-actions').getBoundingClientRect();
    const crumbs = [...document.querySelector('nk-breadcrumb').shadowRoot.querySelector('.nk-breadcrumb').children].filter(el => el.getClientRects().length).length;
    const meta = document.querySelector('nk-topbar .nk-topbar-meta');
    return { height: bar.getBoundingClientRect().height, actionsHeight: actions.height, right: actions.right, crumbs, meta: !!meta.getClientRects().length };
  });
  expect(r.height).toBeLessThanOrEqual(44);
  expect(r.actionsHeight, 'actions on one line').toBeLessThanOrEqual(32);
  expect(r.right).toBeLessThanOrEqual(PHONE.width);
  expect(r.crumbs, 'only the current page').toBe(1);
  expect(r.meta, '"last edited" steps aside').toBe(false);
});
