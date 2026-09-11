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

// The `disabled` attribute fires formDisabledCallback on parse or upgrade,
// before the first connect – when no inner control exists yet. Properties
// set before the element is connected (template clones in hybrids, Lit …)
// and own properties from before the upgrade must arrive as well.
test('disabled and checked before the first render: parsed markup, pre-connect properties, pre-upgrade own properties', async ({ page }) => {
  const errors = [];
  page.on('pageerror', e => errors.push(e.message));
  await openHarness(page);
  await setStage(page, `<form>
    <nk-todo id="t" disabled checked>T</nk-todo>
    <nk-check id="c" disabled checked>C</nk-check>
    <nk-radio id="r" name="g" disabled checked>R</nk-radio>
    <nk-switch id="s" disabled checked></nk-switch>
    <nk-input id="i" disabled value="x"></nk-input>
    <nk-textarea id="ta" disabled>y</nk-textarea>
    <nk-select id="sel" disabled><option value="a">A</option></nk-select>
    <nk-slider id="sl" disabled></nk-slider>
    <nk-segmented id="seg" disabled><button value="a">A</button></nk-segmented>
    <fieldset disabled><nk-input id="fi"></nk-input><nk-todo id="ft">F</nk-todo></fieldset>
  </form>`);
  const q = (id, sel) => `document.getElementById('${id}').shadowRoot.querySelector('${sel}')`;
  expect(await page.evaluate(`({
    todo: [${q('t', 'input')}.disabled, ${q('t', 'input')}.checked],
    check: [${q('c', 'input')}.disabled, ${q('c', 'input')}.checked],
    radio: [${q('r', 'input')}.disabled, ${q('r', 'input')}.checked],
    sw: [${q('s', 'button')}.disabled, ${q('s', 'button')}.getAttribute('aria-checked')],
    input: ${q('i', 'input')}.disabled, textarea: ${q('ta', 'textarea')}.disabled,
    select: ${q('sel', 'select')}.disabled, slider: ${q('sl', 'input')}.disabled,
    segmented: document.querySelector('#seg button').disabled,
    fieldsetInput: ${q('fi', 'input')}.disabled, fieldsetTodo: ${q('ft', 'input')}.disabled,
  })`)).toEqual({
    todo: [true, true], check: [true, true], radio: [true, true], sw: [true, 'true'],
    input: true, textarea: true, select: true, slider: true, segmented: true, fieldsetInput: true, fieldsetTodo: true,
  });

  // Properties before connect – what a template engine does with checked="${bool}".
  expect(await page.evaluate(() => {
    const el = document.createElement('nk-todo');
    el.checked = true; el.disabled = true; el.textContent = 'P';
    document.getElementById('stage').appendChild(el);
    const input = el.shadowRoot.querySelector('input');
    el.disabled = false;
    return [input.checked, input.disabled, el.checked];
  })).toEqual([true, false, true]);

  // Own properties from before the upgrade shadow the prototype accessors.
  expect(await page.evaluate(() => {
    const el = document.createElement('nk-input');
    Object.defineProperty(el, 'value', { value: 'pre', writable: true, configurable: true, enumerable: true });
    document.getElementById('stage').appendChild(el);
    return [el.value, el.shadowRoot.querySelector('input').value, Object.getOwnPropertyDescriptor(el, 'value') === undefined];
  })).toEqual(['pre', 'pre', true]);

  // Toggling `disabled` inside a disabled fieldset must not re-enable the control.
  expect(await page.evaluate(() => {
    const fi = document.getElementById('fi');
    fi.disabled = true; fi.disabled = false;
    return fi.shadowRoot.querySelector('input').disabled;
  })).toBe(true);
  expect(errors).toEqual([]);
});
