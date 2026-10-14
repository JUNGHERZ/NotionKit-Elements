// WebKit: every page loads and answers. An empty <nk-switch> sent 1.10 into
// an endless slotchange loop that only WebKit enters – Safari froze on the
// demo, the docs and the showcase while every Chromium test passed.
import { test, expect } from '@playwright/test';

const answers = page => Promise.race([
  page.evaluate(() => 'ok').catch(() => 'error'),
  new Promise(resolve => setTimeout(() => resolve('frozen'), 5000)),
]);

for (const url of ['/app.html', '/index.html', '/docs.html', '/showcase.html', '/de/app.html']) {
  test(`${url} answers in WebKit`, async ({ page }) => {
    await page.goto(url, { waitUntil: 'commit' });
    await page.waitForTimeout(1500);
    expect(await answers(page)).toBe('ok');
  });
}

test('the settings pane with two empty switches answers in WebKit', async ({ page }) => {
  await page.goto('/app.html#settings', { waitUntil: 'commit' });
  await page.waitForTimeout(1500);
  expect(await answers(page)).toBe('ok');
  expect(await page.evaluate(() => document.querySelectorAll('nk-switch:empty').length)).toBeGreaterThan(0);
});

// 1.17.0: the German demo takes its texts from the dictionary, and the link
// contract of <nk-steps> and <nk-gallery-view> holds in Safari's engine too.
test('the German demo shows the built-in German texts in WebKit', async ({ page }) => {
  await page.goto('/de/app.html', { waitUntil: 'commit' });
  await page.waitForTimeout(1500);
  expect(await answers(page)).toBe('ok');
  expect(await page.evaluate(() => {
    const q = (tag, sel) => document.querySelector(tag).shadowRoot.querySelector(sel);
    return [q('nk-copy-field', '.cf-btn').textContent, q('nk-sidebar', '.nk-sidebar-collapse').getAttribute('aria-label'), q('nk-comments', '.nk-btn').textContent];
  })).toEqual(['Kopieren', 'Seitenleiste schließen', 'Senden']);
});

test('the link contract holds in WebKit: a plain click and Enter select, cancelling keeps the page, a modified click fires nothing', async ({ page }) => {
  await page.goto('/test/fixtures/harness.html');
  await page.waitForFunction(() => customElements.get('nk-steps') && customElements.get('nk-gallery-view'));
  await page.evaluate(() => {
    document.getElementById('stage').innerHTML = '<nk-steps id="s"></nk-steps><nk-gallery-view id="g" href-key="href" no-cover></nk-gallery-view>';
    document.getElementById('s').steps = [{ label: 'Intro', value: 'c1', href: '#chapter-1' }];
    document.getElementById('g').setData([{ key: 'name', title: true }], [{ id: 7, name: 'Safety', href: '#course-7' }]);
    window.got = [];
    for (const id of ['s', 'g']) document.getElementById(id).addEventListener('nk-select', e => { window.got.push(e.detail.value); e.preventDefault(); });
    window.addEventListener('click', e => { if (e.metaKey || e.shiftKey) e.preventDefault(); });
  });
  for (const sel of ['#s a.st-label', '#g a.nk-card']) {
    await page.locator(sel).click();
    await page.locator(sel).click({ modifiers: ['Meta'] });
    await page.locator(sel).focus();
    await page.keyboard.press('Enter');
  }
  expect(await page.evaluate(() => [window.got, location.hash])).toEqual([['c1', 'c1', 7, 7], '']);
});

// 1.20.1 (#3): the tooltip follows the pointer and the focus between two
// [data-tooltip] in one shadow root – the event path ends at the host for
// pointerover/focusin there, in Safari's engine as in Chromium.
test('nk-tooltip follows pointer and Tab inside one shadow root in WebKit', async ({ page }) => {
  await page.goto('/test/fixtures/harness.html');
  await page.waitForFunction(() => customElements.get('nk-tooltip'));
  await page.evaluate(() => {
    customElements.define('demo-toolbar', class extends HTMLElement {
      connectedCallback() { this.attachShadow({ mode: 'open' }).innerHTML = '<button id="a" data-tooltip="First">A</button> <button id="b" data-tooltip="Second">B</button>'; }
    });
    document.getElementById('stage').innerHTML = '<nk-tooltip id="tip" delay="0"></nk-tooltip><p style="margin:40px"><button id="before">before</button> <demo-toolbar id="bar"></demo-toolbar></p>';
    window.tipText = () => { const b = document.getElementById('tip').shadowRoot.querySelector('.nk-tooltip'); return b.classList.contains('open') ? b.textContent : null; };
  });
  const centre = id => page.evaluate(i => { const r = document.getElementById('bar').shadowRoot.getElementById(i).getBoundingClientRect(); return { x: r.left + r.width / 2, y: r.top + r.height / 2 }; }, id);
  for (const [id, text] of [['a', 'First'], ['b', 'Second'], ['a', 'First']]) {
    const { x, y } = await centre(id);
    await page.mouse.move(x, y, { steps: 4 });
    await page.waitForTimeout(80);
    expect(await page.evaluate(() => window.tipText())).toBe(text);
  }
  await page.mouse.move(5, 5);
  await page.evaluate(() => document.getElementById('tip').hide());
  // Safari's Tab stops at fields only; Option+Tab reaches every button.
  await page.focus('#before');
  await page.keyboard.press('Alt+Tab');
  const first = await page.evaluate(() => window.tipText());
  await page.keyboard.press('Alt+Tab');
  expect([first, await page.evaluate(() => window.tipText())]).toEqual(['First', 'Second']);
});
