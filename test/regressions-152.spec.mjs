// Regressions fixed in 1.5.2, each a finding GlassKit Elements had fixed
// before: headings taken from `title` showed as a browser tooltip over the
// whole element, several empty-state actions touched, and the toast lay
// under the tab bar on a phone.
import { test, expect } from '@playwright/test';
import { openHarness, setStage } from './helpers.mjs';

const HEADINGS = [
  ['nk-empty', '.e-title'],
  ['nk-danger-zone', '.dz-title'],
  ['nk-model-card', '.m-name'],
  ['nk-settings-pane', 'h2'],
];

for (const [tag, part] of HEADINGS) {
  test(`<${tag}> takes its heading from title without leaving a tooltip`, async ({ page }) => {
    await openHarness(page);
    await setStage(page, `<${tag} id="el" title="First"${tag === 'nk-settings-pane' ? ' active' : ''}></${tag}>`);
    const read = () => page.evaluate(p => {
      const el = document.getElementById('el');
      return { attr: el.getAttribute('title'), prop: el.title, shown: el.shadowRoot.querySelector(p).textContent };
    }, part);

    expect(await read()).toEqual({ attr: null, prop: 'First', shown: 'First' });

    await page.evaluate(() => document.getElementById('el').setAttribute('title', 'Second'));
    expect(await read(), 'a later setAttribute is taken the same way').toEqual({ attr: null, prop: 'Second', shown: 'Second' });

    await page.evaluate(() => { document.getElementById('el').title = 'Third'; });
    expect(await read(), 'the property never writes the attribute').toEqual({ attr: null, prop: 'Third', shown: 'Third' });

    await page.evaluate(() => document.getElementById('el').setAttribute('title', ''));
    expect((await read()).shown, 'an empty title clears the heading').toBe('');
  });
}

test('a title set as a property before upgrade still becomes the heading', async ({ page }) => {
  await page.goto('/test/fixtures/empty.html');
  const r = await page.evaluate(async () => {
    if (customElements.get('nk-danger-zone')) throw new Error('fixture must not load the bundle');
    const el = document.createElement('nk-danger-zone');
    document.body.appendChild(el);
    el.title = 'Early';                       // plain HTMLElement: reflects to the attribute
    await import('/dist/notionkit-elements.esm.js');
    await customElements.whenDefined('nk-danger-zone');
    await new Promise(r => requestAnimationFrame(r));
    return { attr: el.getAttribute('title'), prop: el.title, shown: el.shadowRoot.querySelector('.dz-title').textContent };
  });
  expect(r).toEqual({ attr: null, prop: 'Early', shown: 'Early' });
});

test('<nk-model-card> reports its title in nk-select', async ({ page }) => {
  await openHarness(page);
  await setStage(page, '<nk-model-card id="el" name="m" value="deep" title="Mona Deep"></nk-model-card>');
  const label = await page.evaluate(() => new Promise(resolve => {
    const el = document.getElementById('el');
    el.addEventListener('nk-select', e => resolve(e.detail.label), { once: true });
    el.select();
  }));
  expect(label).toBe('Mona Deep');
});

test('several <nk-empty> actions sit 8px apart in one centred row', async ({ page }) => {
  await openHarness(page);
  await setStage(page, '<div style="width:420px"><nk-empty id="el" icon="🗂️" title="No entries yet"><nk-btn variant="primary" small>New entry</nk-btn><nk-btn variant="secondary" small>Import</nk-btn></nk-empty></div>');
  const r = await page.evaluate(() => {
    const el = document.getElementById('el');
    const [a, b] = [...el.querySelectorAll('nk-btn')].map(h => h.shadowRoot.querySelector('.nk-btn').getBoundingClientRect());
    const box = el.shadowRoot.querySelector('.nk-empty').getBoundingClientRect();
    return { gap: b.left - a.right, sameRow: Math.abs(a.top - b.top) < 1, centre: (a.left + b.right) / 2 - (box.left + box.right) / 2 };
  });
  expect(r.sameRow).toBe(true);
  expect(r.gap).toBeCloseTo(8, 0);
  expect(Math.abs(r.centre)).toBeLessThanOrEqual(1);
});

test('on a phone <nk-toast> rises above the tab bar of the app', async ({ page }) => {
  await page.setViewportSize({ width: 390, height: 844 });
  await page.goto('/app.html');
  await page.waitForFunction(() => customElements.get('nk-toast') && document.getElementById('toast')?.shadowRoot?.querySelector('.nk-toast'));
  await page.evaluate(() => document.getElementById('toast').show('Einstellungen gespeichert', { duration: 0 }));
  await page.waitForTimeout(450);
  const r = await page.evaluate(() => {
    const t = document.getElementById('toast').shadowRoot.querySelector('.nk-toast').getBoundingClientRect();
    const b = document.getElementById('tabBar').shadowRoot.querySelector('.nk-tab-bar').getBoundingClientRect();
    return { gap: b.top - t.bottom, height: t.height };
  });
  expect(r.gap, 'space between toast and tab bar').toBeGreaterThanOrEqual(8);
  expect(r.height, 'a short message stays on one line').toBeLessThan(40);
});

test('a tab bar previewed inside a page does not lift the toast', async ({ page }) => {
  await openHarness(page);
  await setStage(page, '<nk-tab-bar always><nk-tab-bar-item icon="🏠" value="home">Home</nk-tab-bar-item></nk-tab-bar><nk-toast id="t"></nk-toast>');
  await page.evaluate(() => document.getElementById('t').show('Saved', { duration: 0 }));
  await page.waitForTimeout(450);
  const bottom = await page.evaluate(() => innerHeight - document.getElementById('t').shadowRoot.querySelector('.nk-toast').getBoundingClientRect().bottom);
  expect(bottom).toBeCloseTo(20, 0);
});
