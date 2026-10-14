// Mailverse's finding (JUNGHERZ/NotionKit-Elements#3): <nk-tooltip> without
// `for` did not follow the pointer or the focus from one [data-tooltip] to
// another inside the same shadow root. pointerover, focusin and focusout
// carry a relatedTarget; when target and relatedTarget share a shadow tree,
// the DOM standard ends the event path at that tree's host, so the listener
// on the document never heard of the move.
import { test, expect } from '@playwright/test';
import { openHarness, setStage } from './helpers.mjs';

// The issue's page: two buttons in the light DOM, a toolbar with two buttons
// and a plain one in one shadow root, a copy field with icons (its Show and
// Copy carry their word as data-tooltip in its own shadow root).
const PAGE = `<nk-tooltip id="tip" delay="0"></nk-tooltip>
  <p style="margin:40px"><button id="la" data-tooltip="Light first">LA</button> <button id="lb" data-tooltip="Light second">LB</button></p>
  <p style="margin:40px"><demo-toolbar id="bar"></demo-toolbar></p>
  <p style="margin:40px;width:420px"><nk-copy-field id="cf" icons secret value="secret-value-1234567890"></nk-copy-field></p>`;

test.beforeEach(async ({ page }) => {
  await page.addInitScript(() => {
    customElements.define('demo-toolbar', class extends HTMLElement {
      connectedCallback() {
        if (this.shadowRoot) return;
        const root = this.attachShadow({ mode: 'open' });
        root.innerHTML = '<button id="a" data-tooltip="First">A</button> <button id="b" data-tooltip="Second">B</button> <button id="plain">plain</button> <demo-pair id="pair"></demo-pair>';
        // A roving tab stop: the arrow keys move the focus in the toolbar's own keydown.
        root.addEventListener('keydown', (e) => {
          if (e.key !== 'ArrowRight' && e.key !== 'ArrowLeft') return;
          const btns = [...root.querySelectorAll('#a, #b')], i = btns.indexOf(root.activeElement);
          if (i < 0) return;
          e.preventDefault();
          btns[(i + (e.key === 'ArrowRight' ? 1 : btns.length - 1)) % btns.length].focus();
        });
      }
    });
    // Nested: a shadow root inside the toolbar's shadow root.
    customElements.define('demo-pair', class extends HTMLElement {
      connectedCallback() {
        if (this.shadowRoot) return;
        this.attachShadow({ mode: 'open' }).innerHTML = '<button id="c" data-tooltip="Deep one">C</button> <button id="d" data-tooltip="Deep two">D</button>';
      }
    });
    /** What the page's tooltip shows: its text, or null while closed. */
    window.tipText = () => {
      const b = document.getElementById('tip').shadowRoot.querySelector('.nk-tooltip');
      return b.classList.contains('open') ? b.textContent : null;
    };
    /** The centre of an element, looking into open shadow roots: "bar a" is #a in the toolbar's root. */
    window.centre = (spec) => {
      const [host, ...inner] = spec.split(' ');
      let el = document.getElementById(host);
      for (const sel of inner) el = el.shadowRoot.querySelector(sel.startsWith('[') ? sel : `#${sel}`);
      const r = el.getBoundingClientRect();
      return { x: r.left + r.width / 2, y: r.top + r.height / 2 };
    };
  });
});

/** Moves the mouse onto an element in several steps, as a hand does, and lets the tooltip's timer run. */
async function pointTo(page, spec) {
  const { x, y } = await page.evaluate(s => window.centre(s), spec);
  await page.mouse.move(x, y, { steps: 4 });
  await page.waitForTimeout(80);
  return page.evaluate(() => window.tipText());
}

test('pointer: the tooltip follows from one [data-tooltip] to the next in the same shadow root', async ({ page }) => {
  await openHarness(page);
  await setStage(page, PAGE);
  // Light DOM – worked before, still does.
  expect(await pointTo(page, 'la')).toBe('Light first');
  expect(await pointTo(page, 'lb')).toBe('Light second');
  // Into the toolbar from outside, then within its shadow root.
  expect(await pointTo(page, 'bar a')).toBe('First');
  expect(await pointTo(page, 'bar b')).toBe('Second');
  expect(await pointTo(page, 'bar a')).toBe('First');
  // Onto the plain button in the same root: no tooltip of its own, so none.
  expect(await pointTo(page, 'bar plain')).toBe(null);
  // And from there – inside the same root – onto one with a tooltip.
  expect(await pointTo(page, 'bar b')).toBe('Second');
  // A shadow root inside that one: in, across and back out.
  expect(await pointTo(page, 'bar pair c')).toBe('Deep one');
  expect(await pointTo(page, 'bar pair d')).toBe('Deep two');
  expect(await pointTo(page, 'bar b')).toBe('Second');
});

test('pointer: <nk-copy-field icons secret> – Show, then Copy, says Copy', async ({ page }) => {
  await openHarness(page);
  await setStage(page, PAGE);
  const words = await page.evaluate(() => [...document.getElementById('cf').shadowRoot.querySelectorAll('[data-tooltip]')].map(b => b.dataset.tooltip));
  expect(words).toEqual(['Show', 'Copy']);
  expect(await pointTo(page, 'cf [data-tooltip="Show"]')).toBe('Show');
  expect(await pointTo(page, 'cf [data-tooltip="Copy"]')).toBe('Copy');
  expect(await pointTo(page, 'cf [data-tooltip="Show"]')).toBe('Show');
});

test('keyboard: Tab from A to B in the same shadow root shows Second; on to a plain button hides it', async ({ page }) => {
  await openHarness(page);
  await setStage(page, PAGE);
  await page.focus('#lb');
  await page.keyboard.press('Tab');
  expect(await page.evaluate(() => window.tipText())).toBe('First');
  await page.keyboard.press('Tab');
  expect(await page.evaluate(() => window.tipText())).toBe('Second');
  await page.keyboard.press('Shift+Tab');
  expect(await page.evaluate(() => window.tipText())).toBe('First');
  await page.keyboard.press('Tab');
  await page.keyboard.press('Tab');
  expect(await page.evaluate(() => window.tipText())).toBe(null);
  // The arrow keys of a roving tab stop: the toolbar moves the focus in its own keydown.
  await page.keyboard.press('Shift+Tab');
  await page.keyboard.press('Shift+Tab');
  expect(await page.evaluate(() => window.tipText())).toBe('First');
  await page.keyboard.press('ArrowRight');
  expect(await page.evaluate(() => window.tipText())).toBe('Second');
  await page.keyboard.press('ArrowRight');
  expect(await page.evaluate(() => window.tipText())).toBe('First');
  // Into the nested root by Tab and across it.
  await page.keyboard.press('Tab');
  await page.keyboard.press('Tab');
  await page.keyboard.press('Tab');
  expect(await page.evaluate(() => window.tipText())).toBe('Deep one');
  await page.keyboard.press('Tab');
  expect(await page.evaluate(() => window.tipText())).toBe('Deep two');
  // aria-describedby follows only within the tooltip's own tree – the toolbar's buttons are in another one.
  expect(await page.evaluate(() => document.getElementById('bar').shadowRoot.querySelector('#b').hasAttribute('aria-describedby'))).toBe(false);
});

test('what kept working keeps working: show(rect) stays under a moving pointer, a key without a focus move changes nothing, touch shows nothing', async ({ page }) => {
  await openHarness(page);
  await setStage(page, `${PAGE}<input id="field" style="margin:40px">`);
  // A tooltip for a rect – the bars of a chart – stays while the pointer moves over plain content.
  await page.evaluate(() => document.getElementById('tip').show({ left: 300, top: 300, right: 340, bottom: 320 }, 'Bar'));
  await page.mouse.move(600, 500, { steps: 5 });
  await page.mouse.move(620, 520, { steps: 5 });
  expect(await page.evaluate(() => window.tipText())).toBe('Bar');
  // …until the pointer reaches an element with a tooltip of its own.
  expect(await pointTo(page, 'bar a')).toBe('First');
  // Typing into a field leaves the hovered tooltip alone: no key moved the focus.
  await page.evaluate(() => document.getElementById('field').focus());
  expect(await pointTo(page, 'bar b')).toBe('Second');
  await page.keyboard.type('abc');
  expect(await page.evaluate(() => window.tipText())).toBe('Second');
  // Touch: nothing.
  await page.mouse.move(5, 5);
  await page.evaluate(() => document.getElementById('tip').hide());
  await page.evaluate(() => {
    const b = document.getElementById('bar').shadowRoot.querySelector('#a');
    for (const type of ['pointerover', 'pointermove']) b.dispatchEvent(new PointerEvent(type, { bubbles: true, composed: true, pointerType: 'touch' }));
  });
  await page.waitForTimeout(80);
  expect(await page.evaluate(() => window.tipText())).toBe(null);
});

// Found while testing #3: the pointer leaving the window over a [data-tooltip]
// left its tooltip standing, and a waiting one appeared after it had gone.
test('leaving the window takes the pointer\'s tooltip along – shown or waiting; a keyboard or rect tooltip stays', async ({ page }) => {
  await openHarness(page);
  await setStage(page, `<nk-tooltip id="tip" delay="200"></nk-tooltip><button id="edge" data-tooltip="At the edge" style="position:fixed;top:0;left:300px">edge</button><button id="key" data-tooltip="By key" style="margin:80px">key</button>`);
  const text = () => page.evaluate(() => window.tipText());
  // Shown, then the pointer leaves over the top edge.
  await page.mouse.move(310, 8, { steps: 3 });
  await page.waitForTimeout(300);
  expect(await text()).toBe('At the edge');
  await page.mouse.move(310, -20, { steps: 2 });
  expect(await text()).toBe(null);
  // Waiting, then the pointer leaves before the delay is up: nothing appears.
  await page.mouse.move(310, 8, { steps: 3 });
  await page.mouse.move(310, -20, { steps: 2 });
  await page.waitForTimeout(300);
  expect(await text()).toBe(null);
  // Back onto the same button: it shows again.
  await page.mouse.move(310, 8, { steps: 3 });
  await page.waitForTimeout(300);
  expect(await text()).toBe('At the edge');
  // A tooltip the keyboard opened, and one for a rect, are not the pointer's:
  // the hand rests on the page, then leaves it straight away.
  await page.mouse.move(600, 300, { steps: 3 });
  await page.focus('#edge');
  await page.keyboard.press('Tab');
  expect(await text()).toBe('By key');
  await page.mouse.move(600, -20);
  expect(await text()).toBe('By key');
  await page.mouse.move(600, 300, { steps: 3 });
  await page.evaluate(() => document.getElementById('tip').show({ left: 300, top: 300, right: 340, bottom: 320 }, 'Bar'));
  await page.mouse.move(600, -20);
  expect(await text()).toBe('Bar');
});
