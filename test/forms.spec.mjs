// Native form participation through ElementInternals.
import { test, expect } from '@playwright/test';
import { openHarness, setStage } from './helpers.mjs';

test('FormData, reset and required validation', async ({ page }) => {
  await openHarness(page);
  await setStage(page, `<form id="f">
    <nk-input name="name" value="Ada" required></nk-input>
    <nk-textarea name="bio">Hi</nk-textarea>
    <nk-select name="role" value="editor"><option value="viewer">V</option><option value="editor">E</option></nk-select>
    <nk-switch name="notify" checked></nk-switch>
    <nk-switch name="off"></nk-switch>
    <nk-check name="digest" value="weekly" checked>W</nk-check>
    <nk-todo name="task" value="1">T</nk-todo>
    <nk-slider name="size" min="1" max="10" value="4"></nk-slider>
    <nk-btn id="submit" type="submit" variant="primary">Go</nk-btn>
  </form>`);
  const data = () => [...new FormData(document.getElementById('f')).entries()];
  expect(await page.evaluate(data)).toEqual([['name', 'Ada'], ['bio', 'Hi'], ['role', 'editor'], ['notify', 'on'], ['digest', 'weekly'], ['size', '4']]);

  await page.locator('nk-input input').fill('');
  expect(await page.evaluate(() => document.getElementById('f').checkValidity())).toBe(false);
  await page.locator('nk-input input').fill('Grace');
  await page.locator('nk-todo input').click();
  expect(await page.evaluate(data)).toEqual([['name', 'Grace'], ['bio', 'Hi'], ['role', 'editor'], ['notify', 'on'], ['digest', 'weekly'], ['task', '1'], ['size', '4']]);

  let submitted = 0;
  await page.exposeFunction('submitted', () => submitted++);
  await page.evaluate(() => document.getElementById('f').addEventListener('submit', e => { e.preventDefault(); window.submitted(); }));
  await page.locator('#submit').locator('button').click();
  expect(submitted).toBe(1);

  await page.evaluate(() => document.getElementById('f').reset());
  expect(await page.evaluate(data)).toEqual([['name', 'Ada'], ['bio', 'Hi'], ['role', 'editor'], ['notify', 'on'], ['digest', 'weekly'], ['size', '4']]);
});

test('<fieldset disabled> disables the controls inside', async ({ page }) => {
  await openHarness(page);
  await setStage(page, `<form><fieldset id="fs"><nk-input id="i"></nk-input><nk-switch id="s"></nk-switch></fieldset></form>`);
  await page.evaluate(() => { document.getElementById('fs').disabled = true; });
  expect(await page.evaluate(() => document.getElementById('i').shadowRoot.querySelector('input').disabled)).toBe(true);
  expect(await page.evaluate(() => document.getElementById('s').shadowRoot.querySelector('button').disabled)).toBe(true);
});
