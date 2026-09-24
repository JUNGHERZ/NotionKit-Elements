// Dates (1.9.0): <nk-calendar> – a month with keys, bounds, a range, days not
// worked, marks, a time and a form value, floating as a popover or a sheet –
// and <nk-calendar-view>, the database's month; and the reference app that
// puts them where the class demo has them.
import { test, expect } from '@playwright/test';
import { openHarness, setStage } from './helpers.mjs';

const PHONE = { width: 390, height: 844 };
const settle = page => page.waitForTimeout(350);

/** The focused element behind shadow hosts: a day's date, or "tag.class". */
const deepFocus = page => page.evaluate(() => {
  let el = document.activeElement;
  while (el?.shadowRoot?.activeElement) el = el.shadowRoot.activeElement;
  return el.dataset?.date ?? `${el.localName}.${el.className}`;
});

/** The calendar inside a host, as plain facts. */
const sheet = (page, id) => page.evaluate(id => {
  const r = document.getElementById(id).shadowRoot, days = [...r.querySelectorAll('.cal-day')];
  const pick = cls => days.filter(d => d.classList.contains(cls)).map(d => d.dataset.date);
  return {
    title: r.querySelector('.cal-title').textContent, heads: [...r.querySelectorAll('.cal-wd')].map(w => w.textContent).join(' '),
    weeks: [...r.querySelectorAll('.cal-week')].map(w => w.textContent).join(' '), days: days.length, first: days[0].dataset.date,
    selected: pick('selected'), start: pick('start'), end: pick('end'), inRange: pick('in-range'), tabStop: r.querySelector('.cal-day[tabindex="0"]')?.dataset.date,
  };
}, id);

// ── nk-calendar ─────────────────────────────────────────────────────────────

test('nk-calendar: six rows of days from the week start; names, week start and the week column follow the language', async ({ page }) => {
  await openHarness(page);
  await setStage(page, `<nk-calendar id="en" value="2026-06-02"></nk-calendar>
    <nk-calendar id="mo" value="2026-06-02" week-start="1" weeks></nk-calendar>
    <nk-calendar id="de" locale="de" value="2026-06-02" weeks></nk-calendar>`);
  // en (US) starts on Sunday; Monday on request; German on Monday with "KW".
  expect(await sheet(page, 'en')).toMatchObject({ title: 'June 2026', heads: 'Su Mo Tu We Th Fr Sa', weeks: '', days: 42, first: '2026-05-31', selected: ['2026-06-02'], tabStop: '2026-06-02' });
  expect(await sheet(page, 'mo')).toMatchObject({ heads: 'W Mo Tu We Th Fr Sa Su', weeks: '23 24 25 26 27 28', first: '2026-06-01' });
  expect(await sheet(page, 'de')).toMatchObject({ title: 'Juni 2026', heads: 'KW Mo Di Mi Do Fr Sa So', weeks: '23 24 25 26 27 28', first: '2026-06-01' });
  // The markup is the class markup: 36px cells, the week column 24px.
  expect(await page.evaluate(() => {
    const r = document.getElementById('mo').shadowRoot;
    return [r.querySelector('.nk-calendar.weeks > .cal-grid > .cal-day').getBoundingClientRect().width, r.querySelector('.cal-week').getBoundingClientRect().width, r.querySelector('.nk-calendar').getAttribute('role')];
  })).toEqual([36, 24, 'group']);
});

test('nk-calendar: arrows, Home/End and PageUp/PageDown move the one tab stop; Enter and Space pick', async ({ page }) => {
  await openHarness(page);
  await setStage(page, `<nk-calendar id="c" value="2026-06-10" week-start="1"></nk-calendar>`);
  await page.evaluate(() => {
    const c = document.getElementById('c');
    window.events = [];
    c.addEventListener('nk-change', e => window.events.push(`change:${e.detail.value}`));
    c.addEventListener('nk-month', e => window.events.push(`month:${e.detail.month}`));
  });
  const events = () => page.evaluate(() => window.events);
  await page.locator('#c .cal-day[tabindex="0"]').focus();
  const steps = [['ArrowRight', '2026-06-11'], ['ArrowDown', '2026-06-18'], ['ArrowLeft', '2026-06-17'], ['ArrowUp', '2026-06-10'], ['Home', '2026-06-08'], ['End', '2026-06-14'], ['PageDown', '2026-07-14'], ['Shift+PageUp', '2025-07-14'], ['PageDown', '2025-08-14']];
  for (const [key, date] of steps) {
    await page.keyboard.press(key);
    expect(await deepFocus(page), key).toBe(date);
  }
  expect((await sheet(page, 'c')).title).toBe('August 2025');
  expect(await events()).toEqual(['month:2026-07', 'month:2025-07', 'month:2025-08']);   // moving picks nothing
  await page.keyboard.press('Enter');
  expect(await page.evaluate(() => document.getElementById('c').value)).toBe('2025-08-14');
  await page.keyboard.press('ArrowRight');
  await page.keyboard.press('Space');
  expect((await events()).slice(3)).toEqual(['change:2025-08-14', 'change:2025-08-15']);
  expect(await deepFocus(page)).toBe('2025-08-15');   // the redraw keeps focus on the day
  // Only one day is in the tab order.
  expect(await page.evaluate(() => document.getElementById('c').shadowRoot.querySelectorAll('.cal-day[tabindex="0"]').length)).toBe(1);
});

test('nk-calendar range: two picks in either order make start/end, one nk-change; the band runs between', async ({ page }) => {
  await openHarness(page);
  await setStage(page, `<nk-calendar id="r" range week-start="1" month="2026-06"></nk-calendar>`);
  await page.evaluate(() => { window.changes = []; document.getElementById('r').addEventListener('nk-change', e => window.changes.push(e.detail)); });
  const changes = () => page.evaluate(() => window.changes);
  await page.locator('#r [data-date="2026-06-12"]').click();
  expect(await sheet(page, 'r')).toMatchObject({ start: ['2026-06-12'], end: ['2026-06-12'], inRange: [] });
  expect(await changes()).toEqual([]);
  await page.locator('#r [data-date="2026-06-08"]').click();
  expect(await changes()).toEqual([{ value: '2026-06-08/2026-06-12', start: '2026-06-08', end: '2026-06-12', time: null }]);
  expect(await sheet(page, 'r')).toMatchObject({ start: ['2026-06-08'], end: ['2026-06-12'], inRange: ['2026-06-09', '2026-06-10', '2026-06-11'] });
  // A third pick starts again.
  await page.locator('#r [data-date="2026-06-22"]').click();
  expect(await page.evaluate(() => document.getElementById('r').value)).toBe('2026-06-22');
  await page.evaluate(() => { document.getElementById('r').value = '2026-06-29/2026-07-03'; });
  expect(await sheet(page, 'r')).toMatchObject({ start: ['2026-06-29'], end: ['2026-07-03'], inRange: ['2026-06-30', '2026-07-01', '2026-07-02'] });
});

test('nk-calendar bounds: days outside min/max are announced as unavailable and cannot be picked', async ({ page }) => {
  await openHarness(page);
  await setStage(page, `<nk-calendar id="b" value="2026-06-10" min="2026-06-08" max="2026-06-19"></nk-calendar>`);
  const disabled = await page.evaluate(() => [...document.getElementById('b').shadowRoot.querySelectorAll('.cal-day[aria-disabled="true"]')].map(d => d.dataset.date));
  expect(disabled).toHaveLength(42 - 12);
  expect(disabled).toContain('2026-06-07');
  expect(disabled).toContain('2026-06-20');
  await page.locator('#b [data-date="2026-06-05"]').click({ force: true });
  expect(await page.evaluate(() => document.getElementById('b').value)).toBe('2026-06-10');
  // The keys may pass over them, Enter does not take one.
  await page.locator('#b [data-date="2026-06-10"]').focus();
  await page.keyboard.press('ArrowUp');
  await page.keyboard.press('Enter');
  expect([await deepFocus(page), await page.evaluate(() => document.getElementById('b').value)]).toEqual(['2026-06-03', '2026-06-10']);
});

test('nk-calendar days: holidays greyed with their name, up to three marks in the nine colours', async ({ page }) => {
  await openHarness(page);
  await setStage(page, `<nk-calendar id="d" value="2026-06-02" week-start="1" weekend="6,0"
    days='{"2026-06-04":{"off":true,"label":"Corpus Christi"},"2026-06-11":{"marks":["orange","red","green","blue"]}}'></nk-calendar>`);
  const m = await page.evaluate(() => {
    const r = document.getElementById('d').shadowRoot, day = iso => r.querySelector(`[data-date="${iso}"]`);
    const dots = [...day('2026-06-11').querySelectorAll('.cal-marks i')];
    return { holiday: [day('2026-06-04').classList.contains('off'), day('2026-06-04').title, day('2026-06-04').getAttribute('aria-label')], weekend: day('2026-06-06').classList.contains('off'), weekday: day('2026-06-05').classList.contains('off'),
      dots: dots.map(i => i.className), colour: getComputedStyle(dots[0]).backgroundColor, size: [dots[0].getBoundingClientRect().width, dots[0].getBoundingClientRect().height] };
  });
  expect(m).toEqual({ holiday: [true, 'Corpus Christi', 'Thursday, June 4, 2026, Corpus Christi'], weekend: true, weekday: false, dots: ['orange', 'red', 'green'], colour: 'rgb(217, 115, 13)', size: [4, 4] });
  // As a property the days replace the attribute's.
  await page.evaluate(() => { document.getElementById('d').days = { '2026-06-05': { off: true, label: 'Bridge day' } }; });
  expect(await page.evaluate(() => { const r = document.getElementById('d').shadowRoot; return [r.querySelector('[data-date="2026-06-04"]').classList.contains('off'), r.querySelector('[data-date="2026-06-05"]').title]; })).toEqual([false, 'Bridge day']);
});

test('nk-calendar in a form: the value goes along, required without one is invalid, reset brings the attribute back', async ({ page }) => {
  await openHarness(page);
  await setStage(page, `<form id="f"><nk-calendar name="due" id="c" required></nk-calendar><nk-calendar name="at" id="t" value="2026-06-02T09:30" time clearable></nk-calendar></form>`);
  const state = () => page.evaluate(() => { const f = document.getElementById('f'); return { data: Object.fromEntries(new FormData(f)), valid: f.checkValidity() }; });
  expect(await state()).toEqual({ data: { due: '', at: '2026-06-02T09:30' }, valid: false });
  await page.locator('#c .cal-day:not(.out) >> nth=14').click();
  const picked = await page.evaluate(() => document.getElementById('c').value);
  expect(await state()).toEqual({ data: { due: picked, at: '2026-06-02T09:30' }, valid: true });
  // The time field and Clear sit in the foot.
  expect(await page.evaluate(() => [...document.getElementById('t').shadowRoot.querySelector('.cal-foot').children].map(e => `${e.localName}.${e.className}`))).toEqual(['input.nk-input', 'button.cal-nav']);
  await page.locator('#t input[type=time]').fill('10:15');
  await page.locator('#t input[type=time]').dispatchEvent('change');
  expect((await state()).data.at).toBe('2026-06-02T10:15');
  await page.locator('#t .cal-foot .cal-nav').click();
  expect((await state()).data.at).toBe('');
  await page.evaluate(() => document.getElementById('f').reset());
  expect(await state()).toEqual({ data: { due: '', at: '2026-06-02T09:30' }, valid: false });
});

test('nk-calendar floating: under its anchor, a pick closes it, Escape and a tap outside too – swallowed; focus comes back', async ({ page }) => {
  await openHarness(page);
  await setStage(page, `<div style="padding:40px 0 0 300px"><button id="a" style="width:120px;height:28px">Due</button><button id="other">Other</button></div>`);
  await page.evaluate(() => {
    const c = Object.assign(document.createElement('nk-calendar'), { id: 'c' });
    c.setAttribute('floating', ''); c.setAttribute('sheet', ''); c.setAttribute('weeks', '');
    document.body.appendChild(c);
    window.hits = 0;
    document.getElementById('other').addEventListener('click', () => window.hits++);
    document.getElementById('a').addEventListener('click', () => { c.value = '2026-06-02'; c.show(document.getElementById('a')); });
  });
  const box = () => page.evaluate(() => {
    const pop = document.getElementById('c').shadowRoot.querySelector('.nk-pop'), r = pop.getBoundingClientRect(), a = document.getElementById('a').getBoundingClientRect();
    return { open: pop.classList.contains('open'), visible: getComputedStyle(pop).visibility, gap: Math.round(r.top - a.bottom), right: Math.round(r.right - a.right), classes: pop.className };
  });
  await page.click('#a');
  await settle(page);
  expect(await box()).toEqual({ open: true, visible: 'visible', gap: 6, right: 0, classes: 'nk-pop floating sheet open' });
  expect(await page.evaluate(() => document.getElementById('a').getAttribute('aria-expanded'))).toBe('true');
  await page.evaluate(() => { window.changes = 0; document.getElementById('c').addEventListener('nk-change', () => window.changes++); });
  await page.locator('#c [data-date="2026-06-18"]').click();
  expect(await page.evaluate(() => [document.getElementById('c').value, document.getElementById('c').open, window.changes])).toEqual(['2026-06-18', false, 1]);
  // The same day again is no change: the popover just closes.
  await page.click('#a');
  await page.locator('#c [data-date="2026-06-02"]').click();
  expect(await page.evaluate(() => [document.getElementById('c').open, window.changes])).toEqual([false, 1]);
  // Opened from the keyboard: focus goes to the chosen day; Escape closes and returns it.
  await page.focus('#a');
  await page.keyboard.press('Enter');
  await settle(page);
  expect(await deepFocus(page)).toBe('2026-06-02');
  await page.keyboard.press('Escape');
  expect(await page.evaluate(() => [document.getElementById('c').open, document.activeElement.id])).toEqual([false, 'a']);
  // A tap outside closes it and reaches nothing else.
  await page.click('#a');
  await page.click('#other');
  expect(await page.evaluate(() => [document.getElementById('c').open, window.hits])).toEqual([false, 0]);
});

test('nk-calendar floating on a phone: a bottom sheet with 44px cells', async ({ page }) => {
  await page.setViewportSize(PHONE);
  await openHarness(page);
  await setStage(page, `<button id="a">Due</button>`);
  await page.evaluate(() => {
    const c = document.createElement('nk-calendar');
    c.id = 'c'; c.setAttribute('floating', ''); c.setAttribute('sheet', ''); c.setAttribute('weeks', ''); c.setAttribute('value', '2026-06-02');
    document.body.appendChild(c);
    c.show(document.getElementById('a'));
  });
  await settle(page);
  expect(await page.evaluate(() => {
    const r = document.getElementById('c').shadowRoot, p = r.querySelector('.nk-pop').getBoundingClientRect();
    return { left: p.left, right: p.right, bottom: Math.round(p.bottom), cell: r.querySelector('.cal-day').getBoundingClientRect().width, sw: document.documentElement.scrollWidth };
  })).toEqual({ left: 0, right: PHONE.width, bottom: PHONE.height, cell: 44, sw: PHONE.width });
});

// ── nk-calendar-view ────────────────────────────────────────────────────────

test('nk-calendar-view: the rows as cards on their dates; ‹ › and Today change the month; a card fires nk-select', async ({ page }) => {
  await openHarness(page);
  await setStage(page, `<div style="width:900px"><nk-calendar-view id="v" date-key="due" month="2026-05" today="2026-05-20" weeks week-start="1" weekend="6,0"></nk-calendar-view></div>`);
  await page.evaluate(() => {
    const v = document.getElementById('v');
    window.events = [];
    v.columns = [{ key: 'name', title: true }, { key: 'due', type: 'date' }];
    v.rows = [{ id: 1, icon: '🧭', name: 'Shell', due: '08.05.2026' }, { id: 2, name: 'Page', due: '2026-05-08' }, { id: 3, icon: '▤', name: 'Board', due: { start: '2026-06-02', end: '2026-06-05' } }, { id: 4, name: 'No date', due: '' }];
    v.addEventListener('nk-select', e => window.events.push(`select:${e.detail.id}`));
    v.addEventListener('nk-month', e => window.events.push(`month:${e.detail.month}`));
  });
  const view = () => page.evaluate(() => {
    const r = document.getElementById('v').shadowRoot;
    return { title: r.querySelector('.cv-title').textContent, rows: r.querySelectorAll('.cv-week').length, items: [...r.querySelectorAll('.cv-item')].map(i => `${i.closest('.cv-day').querySelector('.cv-num').textContent}:${i.textContent}`),
      today: r.querySelector('.cv-day.today .cv-num')?.textContent ?? null, off: r.querySelectorAll('.cv-day.off').length, heads: [...r.querySelectorAll('.cv-wd')].map(w => w.textContent).join(' ') };
  });
  expect(await view()).toEqual({ title: 'May 2026', rows: 5, items: ['8:🧭 Shell', '8:Page'], today: '20', off: 10, heads: 'W Mon Tue Wed Thu Fri Sat Sun' });
  await page.locator('#v .cal-nav >> nth=2').click();
  expect(await view()).toMatchObject({ title: 'June 2026', items: ['2:▤ Board'], today: null });
  await page.locator('#v .cv-item').click();
  await page.locator('#v .cal-nav >> nth=0').click();
  expect((await view()).title).toBe('May 2026');
  expect(await page.evaluate(() => window.events)).toEqual(['month:2026-06', 'select:3', 'month:2026-05']);
});

// ── The reference app ───────────────────────────────────────────────────────

/** Measures the app's date picker. */
const picker = page => page.evaluate(() => {
  const r = document.getElementById('datePicker').shadowRoot, pop = r.querySelector('.nk-pop'), b = pop.getBoundingClientRect();
  return { visible: getComputedStyle(pop).visibility === 'visible', left: Math.round(b.left), top: Math.round(b.top), right: Math.round(b.right), bottom: Math.round(b.bottom),
    title: r.querySelector('.cal-title').textContent, cell: r.querySelector('.cal-day').getBoundingClientRect().width, selected: r.querySelector('.cal-day.selected')?.dataset.date ?? null };
});

test('app: Due opens the picker under it, on the month of its date; a day sets the date and closes it', async ({ page }) => {
  await page.goto('/app.html#date');
  await settle(page);
  const due = await page.evaluate(() => document.getElementById('pageDue').shadowRoot.querySelector('.p-value').getBoundingClientRect());
  const p = await picker(page);
  expect(p).toMatchObject({ visible: true, title: 'June 2026', cell: 36, selected: '2026-06-02' });
  expect(p.top - Math.round(due.bottom)).toBe(6);
  expect(p.right).toBe(Math.round(due.right));
  expect(await page.evaluate(() => {
    const r = document.getElementById('datePicker').shadowRoot;
    return [r.querySelector('[data-date="2026-06-06"]').classList.contains('off'), !!r.querySelector('[data-date="2026-06-02"] .cal-marks'), r.querySelector('.cal-week').textContent];
  })).toEqual([true, true, '23']);
  await page.locator('#datePicker .cal-nav >> nth=1').click();
  expect((await picker(page)).title).toBe('May 2026');
  expect(await page.evaluate(() => document.getElementById('datePicker').shadowRoot.querySelector('[data-date="2026-05-25"]').title)).toBe('Whit Monday');
  await page.locator('#datePicker [data-date="2026-05-29"]').click();
  await settle(page);
  expect(await page.evaluate(() => [document.getElementById('pageDue').textContent, getComputedStyle(document.getElementById('datePicker').shadowRoot.querySelector('.nk-pop')).visibility])).toEqual(['29 May 2026', 'hidden']);
});

test('app: a due cell opens the picker for its row; the new date reaches table, board and list', async ({ page }) => {
  await page.goto('/app.html');
  await page.locator('nk-table-view .date-cell >> nth=0').click();
  await settle(page);
  expect((await picker(page)).selected).toBe('2026-05-20');
  expect(await page.evaluate(() => document.getElementById('sidePeek').open)).toBe(false);   // the cell opens the picker, not the peek
  await page.locator('#datePicker [data-date="2026-05-27"]').click();
  const texts = sel => page.locator(sel).allTextContents();
  expect(await texts('nk-table-view .date-cell')).toContain('27.05.2026');
  expect((await texts('nk-board-view .nk-card')).some(t => t.includes('27.05.2026'))).toBe(true);
  expect((await texts('nk-list-view .l-meta')).some(t => t.includes('27.05.2026'))).toBe(true);
});

test('app: the calendar view shows the rows on their due dates; ‹ › change the month; a card opens the side peek', async ({ page }) => {
  await page.goto('/app.html#calendar');
  await settle(page);
  const view = () => page.evaluate(() => {
    const v = document.querySelector('nk-calendar-view'), r = v.shadowRoot;
    return { hidden: v.hidden, title: r.querySelector('.cv-title').textContent, items: [...r.querySelectorAll('.cv-item')].map(i => `${i.closest('.cv-day').querySelector('.cv-num').textContent}:${i.textContent}`) };
  });
  expect(await view()).toEqual({ hidden: false, title: 'May 2026', items: ['20:🗃️ Database Table-View'] });
  await page.locator('nk-calendar-view .cal-nav >> nth=2').click();
  expect(await view()).toMatchObject({ title: 'June 2026', items: ['2:▤ Board-View & Drag-and-Drop'] });
  await page.locator('nk-calendar-view .cv-item').click();
  await settle(page);
  expect(await page.evaluate(() => [document.getElementById('sidePeek').open, document.getElementById('peekTitle').textContent])).toEqual([true, '▤ Board-View & Drag-and-Drop']);
});

test('app on a phone: the picker is a sheet with 44px cells, and the calendar view keeps seven columns', async ({ page }) => {
  await page.setViewportSize(PHONE);
  await page.goto('/app.html#date');
  await settle(page);
  expect(await picker(page)).toMatchObject({ left: 0, right: PHONE.width, bottom: PHONE.height, cell: 44 });
  await page.goto('about:blank');
  await page.goto('/app.html#calendar');
  await settle(page);
  expect(await page.evaluate(() => {
    const days = [...document.querySelector('nk-calendar-view').shadowRoot.querySelectorAll('.cv-day')];
    return { perRow: new Set(days.slice(0, 7).map(d => Math.round(d.getBoundingClientRect().top))).size, height: Math.round(days[0].getBoundingClientRect().height), sw: document.documentElement.scrollWidth };
  })).toEqual({ perRow: 1, height: 64, sw: PHONE.width });
});
