// Mailverse's wish (JUNGHERZ/NotionKit-Elements#2): <nk-theme-toggle> with a
// third state that follows the system. Two states stay the default, so the
// test above this one (shell.spec.mjs) still describes a plain toggle.
import { test, expect } from '@playwright/test';
import { openHarness, setStage } from './helpers.mjs';

const AUTO = `<nk-theme-toggle id="tt" modes="auto light dark"></nk-theme-toggle><nk-btn id="b">x</nk-btn>`;

/** Switches the system preference. emulateMedia alone does not reach the page's media listeners – the renderer needs a frame. */
async function system(page, colorScheme) {
  await page.emulateMedia({ colorScheme });
  await page.evaluate(() => new Promise(r => requestAnimationFrame(() => requestAnimationFrame(r)))); 
}

// `state`, `click` and `bars` are used inside page.evaluate callbacks – they
// are installed in the page, as shell.spec.mjs does with `row`.
test.beforeEach(async ({ page }) => {
  await page.addInitScript(() => {
    window.state = () => {
      const tt = document.getElementById('tt'), btn = tt.shadowRoot.querySelector('button');
      const glyph = btn.querySelector('.nk-theme-glyph');
      return {
        mode: tt.value, theme: tt.theme, next: tt.nextMode(),
        shown: document.documentElement.dataset.theme,
        stored: localStorage.getItem('nk-theme'),
        glyph: glyph ? [...glyph.children].map(s => s.textContent).join('') : btn.textContent,
        auto: !!glyph?.classList.contains('auto'),
        wrapper: document.getElementById('b')?.shadowRoot.querySelector('.nk-wrapper').dataset.theme,
      };
    };
    window.click = () => document.getElementById('tt').shadowRoot.querySelector('button').click();
    window.bars = () => [...document.querySelectorAll('meta[name="theme-color"]')].map(m => m.content).join(' ');
  });
});

test('three states: auto is the default, every click but the last changes what you see', async ({ page }) => {
  await page.emulateMedia({ colorScheme: 'light' });
  await openHarness(page);
  await setStage(page, AUTO);

  // No stored value is `auto`, and auto follows the system – light here.
  expect(await page.evaluate(() => window.state())).toMatchObject({ mode: 'auto', theme: 'light', next: 'dark', shown: 'light', stored: null, glyph: '☀️🌙', auto: true, wrapper: 'light' });

  // System light: auto → dark → light → auto.
  expect(await page.evaluate(() => { window.click(); return window.state(); })).toMatchObject({ mode: 'dark', theme: 'dark', next: 'light', shown: 'dark', stored: 'dark', glyph: '🌙', auto: false });
  // The observer in base.js mirrors the theme into every element one tick later.
  await expect.poll(() => page.evaluate(() => window.state().wrapper)).toBe('dark');
  expect(await page.evaluate(() => { window.click(); return window.state(); })).toMatchObject({ mode: 'light', theme: 'light', next: 'auto', shown: 'light', stored: 'light', glyph: '☀️', auto: false });
  expect(await page.evaluate(() => { window.click(); return window.state(); })).toMatchObject({ mode: 'auto', theme: 'light', next: 'dark', shown: 'light', stored: null, glyph: '☀️🌙', auto: true });

  // System dark: auto → light → dark → auto, so the first click still changes the screen.
  await system(page, 'dark');
  expect(await page.evaluate(() => window.state())).toMatchObject({ mode: 'auto', theme: 'dark', next: 'light', shown: 'dark' });
  expect(await page.evaluate(() => ['auto', 'light', 'dark'].map(m => document.getElementById('tt').nextMode(m)))).toEqual(['light', 'dark', 'auto']);
  await page.evaluate(() => localStorage.removeItem('nk-theme'));
});

test('auto follows a system switch while the page is open, a fixed choice does not', async ({ page }) => {
  await page.emulateMedia({ colorScheme: 'light' });
  await openHarness(page);
  await setStage(page, AUTO);
  await system(page, 'dark');
  await expect.poll(() => page.evaluate(() => window.state().shown)).toBe('dark');
  expect(await page.evaluate(() => window.state())).toMatchObject({ mode: 'auto', theme: 'dark', wrapper: 'dark', glyph: '☀️🌙' });
  await system(page, 'light');
  await expect.poll(() => page.evaluate(() => window.state().shown)).toBe('light');
  expect(await page.evaluate(() => window.state())).toMatchObject({ mode: 'auto', wrapper: 'light' });

  // Fixed light stays light; the mode knows what the system would say.
  await page.evaluate(() => document.getElementById('tt').apply('light'));
  await system(page, 'dark');
  expect(await page.evaluate(() => window.state())).toMatchObject({ mode: 'light', shown: 'light', theme: 'light' });
  expect(await page.evaluate(() => document.getElementById('tt').themeFor('auto'))).toBe('dark');
  await page.evaluate(() => localStorage.removeItem('nk-theme'));
});

test('nk-change reports mode and theme; a choice from another tab arrives; no storage holds until reload', async ({ page }) => {
  await page.emulateMedia({ colorScheme: 'light' });
  await openHarness(page);
  await setStage(page, AUTO);
  const log = await page.evaluate(() => {
    const out = [];
    document.getElementById('tt').addEventListener('nk-change', e => out.push(e.detail));
    window.click(); window.click(); window.click();
    return out;
  });
  expect(log).toEqual([{ value: 'dark', theme: 'dark' }, { value: 'light', theme: 'light' }, { value: 'auto', theme: 'light' }]);

  // Another tab wrote the key: the storage event brings it over.
  expect(await page.evaluate(() => { localStorage.setItem('nk-theme', 'dark'); window.dispatchEvent(new StorageEvent('storage', { key: 'nk-theme' })); return window.state(); })).toMatchObject({ mode: 'dark', shown: 'dark', glyph: '🌙' });
  await page.evaluate(() => { localStorage.removeItem('nk-theme'); window.dispatchEvent(new StorageEvent('storage', { key: 'nk-theme' })); });
  expect(await page.evaluate(() => window.state())).toMatchObject({ mode: 'auto', shown: 'light' });

  // A browser that stores nothing (private mode): the choice holds in the element.
  expect(await page.evaluate(() => {
    const real = localStorage.setItem.bind(localStorage);
    localStorage.setItem = () => { throw new Error('SecurityError'); };
    localStorage.removeItem = () => { throw new Error('SecurityError'); };
    window.click();
    const after = window.state();
    localStorage.setItem = real;
    return after;
  })).toMatchObject({ mode: 'dark', shown: 'dark', stored: null });
});

test('the title names the mode and the next one, in the element\'s language, and is the accessible name', async ({ page }) => {
  await page.emulateMedia({ colorScheme: 'light' });
  await openHarness(page);
  await setStage(page, `${AUTO}<div lang="de"><nk-theme-toggle id="de" modes="auto light dark"></nk-theme-toggle></div><nk-theme-toggle id="own" modes="auto light dark" title="Darstellung"></nk-theme-toggle>`);
  await page.evaluate(() => { window.titles = () => ['tt', 'de', 'own'].map(id => { const b = document.getElementById(id).shadowRoot.querySelector('button'); return [b.title, b.getAttribute('aria-label')]; }); });
  expect(await page.evaluate(() => window.titles())).toEqual([
    ['Appearance: automatic (follows the system) – click: dark', 'Appearance: automatic (follows the system) – click: dark'],
    ['Darstellung: automatisch (wie das System) – Klick: dunkel', 'Darstellung: automatisch (wie das System) – Klick: dunkel'],
    ['Darstellung', 'Darstellung'],
  ]);
  await page.evaluate(() => window.click());
  expect(await page.evaluate(() => document.getElementById('tt').shadowRoot.querySelector('button').title)).toBe('Appearance: dark – click: light');
  await page.evaluate(() => localStorage.removeItem('nk-theme'));
});

test('two states are untouched: no auto, the next theme as the glyph, no system listener', async ({ page }) => {
  await page.emulateMedia({ colorScheme: 'light' });
  await openHarness(page);
  await setStage(page, `<nk-theme-toggle id="tt"></nk-theme-toggle><nk-theme-toggle id="listed" modes="light dark"></nk-theme-toggle><nk-btn id="b">x</nk-btn>`);
  expect(await page.evaluate(() => window.state())).toMatchObject({ mode: 'light', theme: 'light', next: 'dark', shown: 'light', stored: null, glyph: '🌙', auto: false });

  // A system switch leaves a two-state toggle where it is.
  await system(page, 'dark');
  expect(await page.evaluate(() => window.state())).toMatchObject({ shown: 'light', stored: null });
  expect(await page.evaluate(() => { window.click(); return window.state(); })).toMatchObject({ mode: 'dark', shown: 'dark', stored: 'dark', glyph: '☀️' });
  expect(await page.evaluate(() => document.getElementById('listed').shadowRoot.querySelector('button').textContent)).toBe('☀️');
  expect(await page.evaluate(() => document.getElementById('tt').shadowRoot.querySelector('button').title)).toBe('Toggle light / dark');

  // `modes` added later re-arms the element.
  expect(await page.evaluate(() => { const tt = document.getElementById('tt'); tt.setAttribute('modes', 'auto light dark'); return window.state(); })).toMatchObject({ mode: 'dark', glyph: '🌙', auto: false });
  expect(await page.evaluate(() => { window.click(); return window.state(); })).toMatchObject({ mode: 'auto', shown: 'dark', stored: null, glyph: '☀️🌙', auto: true });
  await page.evaluate(() => localStorage.removeItem('nk-theme'));
});

test('theme-color: every bar takes the fixed theme\'s colour, auto gives each its own back', async ({ page }) => {
  await page.emulateMedia({ colorScheme: 'light' });
  await openHarness(page);
  await page.evaluate(() => {
    for (const [media, content] of [['(prefers-color-scheme: light)', '#ffffff'], ['(prefers-color-scheme: dark)', '#191919']]) {
      document.head.appendChild(Object.assign(document.createElement('meta'), { name: 'theme-color', media, content }));
    }
  });
  await setStage(page, `<nk-theme-toggle id="tt" modes="auto light dark" theme-color></nk-theme-toggle><nk-theme-toggle id="plain" modes="auto light dark"></nk-theme-toggle>`);
  const bars = () => [...document.querySelectorAll('meta[name="theme-color"]')].map(m => m.content).join(' ');
  expect(await page.evaluate(() => window.bars())).toBe('#ffffff #191919');
  expect(await page.evaluate(() => { document.getElementById('tt').apply('dark'); return window.bars(); })).toBe('#191919 #191919');
  expect(await page.evaluate(() => { document.getElementById('tt').apply('light'); return window.bars(); })).toBe('#ffffff #ffffff');
  expect(await page.evaluate(() => { document.getElementById('tt').apply('auto'); return window.bars(); })).toBe('#ffffff #191919');
  // Without the attribute the element leaves the page's bars alone.
  expect(await page.evaluate(() => { document.getElementById('plain').apply('dark'); return window.bars(); })).toBe('#ffffff #191919');
  await page.evaluate(() => localStorage.removeItem('nk-theme'));
});
