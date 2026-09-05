// Wave 4: modal (nav from panes, focus, inert, scroll lock), palette
// (fuzzy, keyboard, hotkey, nk-command), menu/pop, emoji picker, toast.
import { test, expect } from '@playwright/test';
import { openHarness, setStage } from './helpers.mjs';

const MODAL = `<button id="opener">open</button><nk-modal id="m">
  <nk-settings-user slot="user" name="Ada Lovelace" mail="ada@x"></nk-settings-user>
  <nk-settings-pane name="profile" group="Account" icon="👤" label="My profile" title="My profile" active><nk-input id="first"></nk-input></nk-settings-pane>
  <nk-settings-pane name="appearance" group="Account" icon="🎨" label="Appearance" title="Appearance"><nk-switch></nk-switch></nk-settings-pane>
  <nk-settings-pane name="members" group="Workspace" icon="👥" label="Members" title="Members"></nk-settings-pane>
</nk-modal><p id="outside">text</p>`;

test('modal renders nav rows from panes, switches panes, closes on Escape/backdrop, restores focus', async ({ page }) => {
  await openHarness(page);
  await setStage(page, MODAL);
  const nav = () => [...document.getElementById('m').shadowRoot.querySelectorAll('.nk-settings-nav .nk-section-label, .nk-settings-nav .nk-tree-item')].map(n => (n.classList.contains('nk-tree-item') ? 'row:' : 'group:') + n.textContent.trim() + (n.classList.contains('active') ? '*' : ''));
  expect(await page.evaluate(nav)).toEqual(['group:Account', 'row:👤My profile*', 'row:🎨Appearance', 'group:Workspace', 'row:👥Members']);
  const visible = () => [...document.querySelectorAll('nk-settings-pane')].filter(p => p.active).map(p => p.name);
  expect(await page.evaluate(visible)).toEqual(['profile']);
  await page.locator('#opener').focus();
  await page.evaluate(() => document.getElementById('m').show());
  await page.waitForTimeout(100);
  expect(await page.evaluate(() => ({ open: document.getElementById('m').open, inert: document.getElementById('outside').inert, overflow: document.documentElement.style.overflow, cls: document.getElementById('m').shadowRoot.querySelector('.nk-modal-backdrop').className }))).toEqual({ open: true, inert: true, overflow: 'hidden', cls: 'nk-modal-backdrop open' });
  const selects = [];
  await page.exposeFunction('sel', v => selects.push(v));
  await page.evaluate(() => document.getElementById('m').addEventListener('nk-select', e => window.sel(e.detail.value)));
  await page.evaluate(() => document.getElementById('m').shadowRoot.querySelector('[data-pane=appearance]').click());
  expect(await page.evaluate(visible)).toEqual(['appearance']);
  expect(await page.evaluate(nav)).toContain('row:🎨Appearance*');
  await page.keyboard.press('ArrowDown');
  expect(await page.evaluate(visible)).toEqual(['members']);
  expect(selects).toEqual(['appearance', 'members']);
  await page.keyboard.press('Escape');
  expect(await page.evaluate(() => ({ open: document.getElementById('m').open, inert: document.getElementById('outside').inert, overflow: document.documentElement.style.overflow, focus: document.activeElement.id }))).toEqual({ open: false, inert: false, overflow: '', focus: 'opener' });
  await page.evaluate(() => document.getElementById('m').show('members'));
  expect(await page.evaluate(visible)).toEqual(['members']);
  await page.evaluate(() => document.getElementById('m').shadowRoot.querySelector('.nk-modal-backdrop').click());
  expect(await page.evaluate(() => document.getElementById('m').open)).toBe(false);
});

test('modal nav collapses to the icon rail below 860px (stylesheet rule, no JS breakpoint)', async ({ page }) => {
  await openHarness(page);
  await setStage(page, MODAL);
  await page.evaluate(() => document.getElementById('m').show());
  await page.setViewportSize({ width: 700, height: 700 });
  await page.waitForTimeout(100);
  expect(await page.evaluate(() => { const sr = document.getElementById('m').shadowRoot; return { nav: Math.round(sr.querySelector('.nk-settings-nav').getBoundingClientRect().width), label: getComputedStyle(sr.querySelector('.nk-tree-item .label')).display, group: getComputedStyle(sr.querySelector('.nk-section-label')).display }; })).toEqual({ nav: 60, label: 'none', group: 'none' });
});

const COMMANDS = `[
  { group: 'Pages', items: [{ id: 'mvp', icon: '🚀', label: 'NotionKit MVP', keywords: 'project' }, { id: 'kb', icon: '🧠', label: 'Knowledge base' }] },
  { group: 'Actions', items: [{ id: 'theme', icon: '🌙', label: 'Toggle theme', shortcut: '⌘⇧L' }, { id: 'settings', icon: '⚙️', label: 'Open settings' }] }
]`;

test('palette: hotkey toggles, fuzzy search, arrows + Enter fire nk-command and run the action', async ({ page }) => {
  await openHarness(page);
  await setStage(page, `<nk-cmdk id="c"></nk-cmdk><p id="outside">x</p>`);
  await page.evaluate((cmds) => { const c = document.getElementById('c'); c.commands = eval(cmds); c.commands[1].items[0].action = () => window.ran = true; }, COMMANDS);
  const items = () => [...document.getElementById('c').shadowRoot.querySelectorAll('.nk-cmdk-item')].map(i => i.textContent.trim() + (i.classList.contains('selected') ? '*' : ''));
  await page.keyboard.press('Meta+k');
  expect(await page.evaluate(() => document.getElementById('c').open)).toBe(true);
  await page.waitForTimeout(50);
  expect(await page.evaluate(() => document.activeElement.id)).toBe('c');
  expect(await page.evaluate(items)).toEqual(['🚀NotionKit MVP*', '🧠Knowledge base', '🌙Toggle theme⌘⇧L', '⚙️Open settings']);
  await page.keyboard.type('tgl thm');                                   // fuzzy subsequence
  expect(await page.evaluate(items)).toEqual(['🌙Toggle theme⌘⇧L*']);
  await page.evaluate(() => { document.getElementById('c').query = ''; });
  await page.keyboard.type('proj');                                      // keywords
  expect(await page.evaluate(items)).toEqual(['🚀NotionKit MVP*']);
  await page.evaluate(() => { document.getElementById('c').query = ''; });
  await page.keyboard.press('ArrowDown'); await page.keyboard.press('ArrowDown');
  expect(await page.evaluate(items)).toEqual(['🚀NotionKit MVP', '🧠Knowledge base', '🌙Toggle theme⌘⇧L*', '⚙️Open settings']);
  const picked = [];
  await page.exposeFunction('picked', v => picked.push(v));
  await page.evaluate(() => document.getElementById('c').addEventListener('nk-command', e => window.picked(e.detail.id)));
  await page.keyboard.press('Enter');
  expect(picked).toEqual(['theme']);
  expect(await page.evaluate(() => ({ ran: window.ran === true, open: document.getElementById('c').open, inert: document.getElementById('outside').inert }))).toEqual({ ran: true, open: false, inert: false });
  await page.keyboard.press('Control+k');
  await page.keyboard.type('zzzz');
  expect(await page.evaluate(() => document.getElementById('c').shadowRoot.querySelector('.nk-cmdk-empty')?.textContent)).toContain('zzzz');
  await page.keyboard.press('Escape');
  expect(await page.evaluate(() => document.getElementById('c').open)).toBe(false);
});

test('pop + menu: trigger toggles, item selects and closes, outside click closes', async ({ page }) => {
  await openHarness(page);
  await setStage(page, `<nk-pop id="p"><nk-btn id="t" slot="trigger">Options</nk-btn><nk-menu id="menu"><nk-menu-item id="i1" value="rename">Rename</nk-menu-item><nk-menu-item type="separator"></nk-menu-item><nk-menu-item id="i2" value="delete" danger>Delete</nk-menu-item></nk-menu></nk-pop><p id="outside">out</p>`);
  const state = () => ({ open: document.getElementById('p').open, shown: getComputedStyle(document.getElementById('p').shadowRoot.querySelector('.nk-pop-float')).display, surface: document.getElementById('p').shadowRoot.querySelector('.nk-pop-float > div').className });
  expect(await page.evaluate(state)).toEqual({ open: false, shown: 'none', surface: '' });
  await page.locator('#t button').click();
  expect(await page.evaluate(state)).toEqual({ open: true, shown: 'block', surface: '' });
  const seen = [];
  await page.exposeFunction('seen', v => seen.push(v));
  await page.evaluate(() => document.getElementById('p').addEventListener('nk-select', e => window.seen(e.detail.value)));
  await page.evaluate(() => document.getElementById('menu').focusFirst());
  await page.keyboard.press('ArrowDown');       // skips the separator → delete
  await page.keyboard.press('Enter');
  expect(seen).toEqual(['delete']);
  expect(await page.evaluate(() => document.getElementById('p').open)).toBe(false);
  await page.locator('#t button').click();
  await page.locator('#outside').click();
  expect(await page.evaluate(() => document.getElementById('p').open)).toBe(false);
});

test('emoji picker searches by name, switches categories and reports a pick', async ({ page }) => {
  await openHarness(page);
  await setStage(page, `<nk-emoji-picker id="e"></nk-emoji-picker>`);
  const grid = () => [...document.getElementById('e').shadowRoot.querySelectorAll('.nk-emoji-grid span')].map(s => s.textContent);
  expect((await page.evaluate(grid)).length).toBe(16);
  await page.evaluate(() => document.getElementById('e').shadowRoot.querySelector('[data-cat=travel]').click());
  expect(await page.evaluate(grid)).toContain('🚀');
  await page.locator('#e input').fill('rock');
  expect(await page.evaluate(grid)).toEqual(['🚀']);
  const picks = [];
  await page.exposeFunction('pick', v => picks.push(v));
  await page.evaluate(() => document.getElementById('e').addEventListener('nk-select', e => window.pick(e.detail.emoji)));
  await page.evaluate(() => document.getElementById('e').shadowRoot.querySelector('[data-emoji]').click());
  expect(picks).toEqual(['🚀']);
  expect(await page.evaluate(() => document.getElementById('e').value)).toBe('🚀');
});

test('toast shows a message and hides itself', async ({ page }) => {
  await openHarness(page);
  await setStage(page, `<nk-toast id="t" duration="200"></nk-toast>`);
  await page.evaluate(() => document.getElementById('t').show('Saved'));
  expect(await page.evaluate(() => ({ open: document.getElementById('t').open, text: document.getElementById('t').shadowRoot.querySelector('.nk-toast').textContent, cls: document.getElementById('t').shadowRoot.querySelector('.nk-toast').className }))).toEqual({ open: true, text: '✓Saved', cls: 'nk-toast show' });
  await page.waitForFunction(() => !document.getElementById('t').open);
});
