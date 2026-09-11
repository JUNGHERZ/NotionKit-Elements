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

// Visible switch text, field layouts, field grid.
test('switch text: slot or attribute renders beside the switch and toggles it; bare switch stays bare', async ({ page }) => {
  await openHarness(page);
  await setStage(page, `<nk-switch id="a">Waiting</nk-switch><nk-switch id="b" text="Done" checked></nk-switch><nk-switch id="c" label="Bare"></nk-switch>`);
  const r = await page.evaluate(() => {
    const q = (id, sel) => document.getElementById(id).shadowRoot.querySelector(sel);
    const rowDisplay = id => getComputedStyle(q(id, '.nk-switch-label')).display;
    q('a', 'span').click();                                   // label text toggles the button
    return {
      a: [rowDisplay('a'), q('a', 'span').hidden, document.getElementById('a').checked],
      b: [rowDisplay('b'), q('b', 'span').textContent, q('b', 'button').getAttribute('aria-checked')],
      c: [rowDisplay('c'), q('c', 'span').hidden, q('c', 'button').getAttribute('aria-label')],
      bHeight: q('b', '.nk-switch-label').getBoundingClientRect().height,
    };
  });
  expect(r.a).toEqual(['inline-flex', false, true]);
  expect(r.b).toEqual(['inline-flex', 'Done', 'true']);
  expect(r.c).toEqual(['contents', true, 'Bare']);
  expect(r.bHeight).toBeGreaterThanOrEqual(20);
  // Text added later flips the wrapper on.
  expect(await page.evaluate(() => { document.getElementById('c').text = 'Late'; return getComputedStyle(document.getElementById('c').shadowRoot.querySelector('.nk-switch-label')).display; })).toBe('inline-flex');
});

test('field layouts: stacked sets wide on the control and stacks the box; nk-fields makes its fields stacked + compact', async ({ page }) => {
  await openHarness(page);
  await setStage(page, `<div style="width:600px">
    <nk-field id="row" label="Row"><nk-input id="ri"></nk-input></nk-field>
    <nk-field id="st" label="Stacked" stacked><nk-textarea id="ta"></nk-textarea></nk-field>
    <nk-fields id="grid"><nk-field id="g1" label="A"><nk-input id="gi"></nk-input></nk-field><nk-field id="g2" label="B"><nk-select id="gs"><option>x</option></nk-select></nk-field><nk-field id="g3" label="C"><nk-input></nk-input></nk-field><nk-field id="g4" label="D"><nk-input></nk-input></nk-field></nk-fields>
  </div>`);
  const r = await page.evaluate(() => {
    const box = (id, sel) => document.getElementById(id).shadowRoot.querySelector(sel).getBoundingClientRect();
    const cls = id => [...document.getElementById(id).shadowRoot.querySelector('.nk-field').classList].sort().join(' ');
    return {
      rowCls: cls('row'), stCls: cls('st'), g1Cls: cls('g1'),
      rowWide: document.getElementById('ri').hasAttribute('wide'),
      taWide: document.getElementById('ta').hasAttribute('wide'), giWide: document.getElementById('gi').hasAttribute('wide'), gsWide: document.getElementById('gs').hasAttribute('wide'),
      stackedFull: Math.round(box('ta', 'textarea').width) === Math.round(box('st', '.nk-field').width),
      labelAbove: box('st', '.f-label').bottom <= box('ta', 'textarea').top,
      gridCols: getComputedStyle(document.getElementById('grid').shadowRoot.querySelector('.nk-fields')).gridTemplateColumns.split(' ').length,
      g1Label: getComputedStyle(document.getElementById('g1').shadowRoot.querySelector('.f-label')).fontSize,
      g1SideBySideG2: Math.abs(box('g1', '.nk-field').top - box('g2', '.nk-field').top) < 1 && box('g1', '.nk-field').right <= box('g2', '.nk-field').left,
    };
  });
  expect(r).toEqual({ rowCls: 'nk-field', stCls: 'nk-field stacked', g1Cls: 'compact nk-field stacked', rowWide: false, taWide: true, giWide: true, gsWide: true, stackedFull: true, labelAbove: true, gridCols: 3, g1Label: '12px', g1SideBySideG2: true });
  // Unstacking removes the wide the field added, but not one the author set.
  expect(await page.evaluate(() => { document.getElementById('st').stacked = false; document.getElementById('ri').setAttribute('wide', ''); document.getElementById('row').stacked = true; document.getElementById('row').stacked = false; return [document.getElementById('ta').hasAttribute('wide'), document.getElementById('ri').hasAttribute('wide')]; })).toEqual([false, true]);
});
