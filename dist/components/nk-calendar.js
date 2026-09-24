import { NkFormElement } from './base.js';
import { p as parseDay, i as isoOf, C as CHEVRONS, r as resolveLocale, f as firstWeekday, m as monthGrid, w as weekLabel, a as weekdayNames, b as isoWeek, s as stepMonth, c as addDays } from './shared/dates-a32DcW1l.js';
import { p as placeUnder } from './shared/floating-CxHxy-Cb.js';
import { d as deepActiveElement } from './shared/focus-BNAChOXO.js';
import '@jungherz-de/notionkit/notionkit-styles.js';

// <nk-calendar name="due" value="2026-06-02" weeks weekend="6,0"></nk-calendar>
// <nk-calendar range value="2026-06-08/2026-06-12"></nk-calendar>
// <nk-calendar floating sheet id="picker"></nk-calendar>   picker.show(button)
// → [<div class="nk-pop floating sheet open">]<div class="nk-calendar weeks">
//     <div class="cal-head"><div class="cal-title">June 2026</div><button class="cal-nav">Today</button>‹ ›</div>
//     <div class="cal-grid"><span class="cal-wd">W</span>…<span class="cal-week">23</span><button class="cal-day selected">2</button>…</div>
//     [<div class="cal-foot"><input class="nk-input" type="time"></div>]</div>
//
// Notion's date picker (NotionKit 1.9.0), after GlassKit Elements'
// glk-calendar, with what a planning tool needs on top: a range, ISO
// calendar weeks, days not worked, marks and a time.
// value: YYYY-MM-DD; with `range` the ISO interval "start/end"; with `time`
//        YYYY-MM-DDTHH:MM. Also as the properties value, start, end.
// month (YYYY-MM shown; default the value's, else today's), min, max, today,
// locale (default the page's lang), week-start (0 = Sunday … 6 = Saturday;
// default from the locale, Monday where the browser cannot say), weeks,
// weekend (weekdays not worked, "6,0" for Saturday and Sunday), range, time,
// clearable, label and the texts today-label, prev-label, next-label,
// week-label, time-label, clear-label. `time` belongs to single days; a
// range has none.
// days (property, or JSON attribute): { 'YYYY-MM-DD': { off, label, marks } }
// – `off` greys a holiday, `label` names the day (tooltip and screen
// reader), `marks` puts up to three dots in the nine colours on it.
// Keys: arrows by a day or a week, Home/End to the ends of the week,
// PageUp/PageDown by a month (Shift: a year); Enter or Space picks. Arrows
// only move, so the picker stays quiet while someone looks around. Days
// outside min/max are aria-disabled – in the arrow path and announced, never
// picked. A range takes two picks, in either order. Form-associated: the
// value goes with the form, reset restores it.
// Events: nk-change { value, start, end, time } when a pick – for a range the
// second one –, a new time or Clear changes the value; nk-month { month } when the month
// changes; nk-toggle { open } with `floating`. `required` makes an empty
// value invalid.
// `floating` makes it a popover over the page – show(anchor) puts it under
// the anchor, right edges aligned (align="start": left edges) – and `sheet`
// a bottom sheet with 44px cells on a phone, as <nk-menu floating sheet>.
// A pick closes it – the second of a range; with `time` Escape or a tap
// outside does. Put a floating calendar directly under <body>.
const STEPS = { ArrowLeft: -1, ArrowRight: 1, ArrowUp: -7, ArrowDown: 7 };
const floatSheet = new CSSStyleSheet();
floatSheet.replaceSync(`:host([floating]) { display: block; position: fixed; z-index: 60; pointer-events: none; }`);

class NkCalendar extends NkFormElement {
  static get hostStyles() { return floatSheet; }
  static get observedAttributes() {
    return ['value', 'month', 'min', 'max', 'today', 'locale', 'week-start', 'weeks', 'weekend', 'range', 'time', 'clearable', 'days',
      'label', 'today-label', 'prev-label', 'next-label', 'week-label', 'time-label', 'clear-label', 'floating', 'sheet', 'open', 'align', 'required'];
  }

  render() {
    // A value or month set as a property before the first connect wins over the attributes.
    this._readValue(this._pendingValue ?? this.getAttribute('value'));
    const month = this._pendingMonth || this._attrMonth();
    if (month) this._month = month;
    this._initialValue = this.getAttribute('value') ?? '';
    this._build();
  }

  // ── value ──
  _readValue(v) {
    const s = String(v ?? '');
    this._start = this._end = this._day = null;
    this._time = '';
    if (this.getBoolAttr('range')) {
      const [a, b] = s.split('/');
      this._start = parseDay(a) ? isoOf(parseDay(a)) : null;
      this._end = parseDay(b) ? isoOf(parseDay(b)) : null;
    } else if (parseDay(s)) {
      this._day = isoOf(parseDay(s));
      this._time = s.match(/T(\d{2}:\d{2})/)?.[1] ?? '';
    }
    // A new value brings its month; without one the month stays.
    const shown = this._day || this._start;
    this._month = shown ? shown.slice(0, 7) : (this._month || this._attrMonth() || this._todayIso().slice(0, 7));
    this._focus = null;
  }

  _attrMonth() { const m = this.getAttribute('month'); return /^\d{4}-\d{2}$/.test(m || '') ? m : null; }
  _todayIso() { return this.getAttribute('today') || isoOf(new Date()); }

  get value() {
    if (this.getBoolAttr('range')) return this._start ? `${this._start}${this._end ? `/${this._end}` : ''}` : '';
    return this._day ? `${this._day}${this.getBoolAttr('time') && this._time ? `T${this._time}` : ''}` : '';
  }
  set value(v) {
    this._readValue(v);
    if (this._grid) this._draw(); else this._pendingValue = String(v ?? '');
  }
  get start() { return this.getBoolAttr('range') ? this._start : this._day; }
  get end() { return this.getBoolAttr('range') ? this._end : this._day; }
  get month() { return this._month; }
  set month(v) {
    if (!/^\d{4}-\d{2}$/.test(v)) return;
    this._month = v; this._focus = null;
    if (this._grid) this._draw(); else this._pendingMonth = v;
  }
  get days() { return this._days ?? {}; }
  set days(v) { this._days = v && typeof v === 'object' ? v : {}; if (this._grid) this._draw(); }

  // ── markup ──
  _build() {
    const floating = this.getBoolAttr('floating');
    this._cal = this.createElement('div', ['nk-calendar'], { role: 'group' });
    const head = this.createElement('div', ['cal-head']);
    this._title = this.createElement('div', ['cal-title'], { 'aria-live': 'polite' });
    this._todayBtn = this.createElement('button', ['cal-nav'], { type: 'button' });
    this._prev = this.createElement('button', ['cal-nav'], { type: 'button' });
    this._prev.innerHTML = CHEVRONS.prev;
    this._next = this.createElement('button', ['cal-nav'], { type: 'button' });
    this._next.innerHTML = CHEVRONS.next;
    head.append(this._title, this._todayBtn, this._prev, this._next);
    this._grid = this.createElement('div', ['cal-grid']);
    this._foot = this.createElement('div', ['cal-foot']);
    this._timeInput = this.createElement('input', ['nk-input'], { type: 'time' });
    this._clear = this.createElement('button', ['cal-nav'], { type: 'button' });
    this._cal.append(head, this._grid);
    this._pop = floating ? this.createElement('div', ['nk-pop', 'floating']) : null;
    if (this._pop) this._pop.appendChild(this._cal);
    this._wrapper.replaceChildren(this._pop ?? this._cal);
    this._draw();
  }

  get _hasTime() { return this.getBoolAttr('time') && !this.getBoolAttr('range'); }
  get _locale() { return resolveLocale(this.getAttribute('locale')); }
  get _weekStart() {
    const n = Number(this.getAttribute('week-start'));
    return this.hasAttribute('week-start') && Number.isInteger(n) && n >= 0 && n <= 6 ? n : firstWeekday(this._locale);
  }

  _syncPop() {
    this._pop?.classList.toggle('sheet', this.getBoolAttr('sheet'));
    this._pop?.classList.toggle('open', this.getBoolAttr('open'));
  }

  _draw() {
    const locale = this._locale, ws = this._weekStart, weeks = this.getBoolAttr('weeks'), range = this.getBoolAttr('range');
    const g = monthGrid(this._month, ws), today = this._todayIso();
    const min = this.getAttribute('min') || '', max = this.getAttribute('max') || '';
    const weekend = new Set((this.getAttribute('weekend') || '').split(',').map(s => s.trim()).filter(Boolean).map(Number));
    let days = this._days;
    if (!days && this.hasAttribute('days')) { try { days = JSON.parse(this.getAttribute('days')); } catch { days = {}; } }
    days ??= {};
    const long = new Intl.DateTimeFormat(locale, { weekday: 'long', day: 'numeric', month: 'long', year: 'numeric' });
    this._cal.classList.toggle('weeks', weeks);
    this._syncPop();
    const label = this.getAttribute('label');
    if (label) this._cal.setAttribute('aria-label', label); else this._cal.removeAttribute('aria-label');
    this._title.textContent = new Intl.DateTimeFormat(locale, { month: 'long', year: 'numeric' }).format(g.first);
    this._todayBtn.textContent = this.getAttribute('today-label') || 'Today';
    this._prev.setAttribute('aria-label', this.getAttribute('prev-label') || 'Previous month');
    this._next.setAttribute('aria-label', this.getAttribute('next-label') || 'Next month');

    // The one tab stop: the focused day, else the chosen one, else the 1st.
    const cells = Array.from({ length: 42 }, (_, i) => isoOf(g.day(i)));
    const chosen = range ? this._start : this._day;
    if (!this._focus || !cells.includes(this._focus)) this._focus = cells.includes(chosen) ? chosen : `${this._month}-01`;

    const nodes = [];
    if (weeks) nodes.push(this._head(this.getAttribute('week-label') || weekLabel(locale)));
    for (const w of weekdayNames(locale, ws, 2)) nodes.push(this._head(w));
    for (let i = 0; i < 42; i++) {
      const d = g.day(i), iso = cells[i], info = days[iso] || {};
      if (weeks && i % 7 === 0) { const wk = this.createElement('span', ['cal-week'], { 'aria-hidden': 'true' }); wk.textContent = isoWeek(d); nodes.push(wk); }
      const inRange = range && this._start && this._end && iso > this._start && iso < this._end;
      const cls = ['cal-day', d.getMonth() !== g.m - 1 && 'out', (weekend.has(d.getDay()) || info.off) && 'off', iso === today && 'today',
        !range && iso === this._day && 'selected', range && iso === this._start && 'start', range && iso === (this._end || this._start) && this._start && 'end', inRange && 'in-range'].filter(Boolean);
      const day = this.createElement('button', cls, { type: 'button', 'data-date': iso, tabindex: iso === this._focus ? '0' : '-1',
        'aria-pressed': String(cls.includes('selected') || cls.includes('start') || cls.includes('end')),
        'aria-label': `${long.format(d)}${info.label ? `, ${info.label}` : ''}` });
      if (info.label) day.title = info.label;
      if ((min && iso < min) || (max && iso > max)) day.setAttribute('aria-disabled', 'true');
      day.textContent = d.getDate();
      const marks = (info.marks || []).slice(0, 3);
      if (marks.length) {
        const m = this.createElement('span', ['cal-marks']);
        for (const tone of marks) m.appendChild(this.createElement('i', [tone]));
        day.appendChild(m);
      }
      nodes.push(day);
    }
    // The days are drawn anew; focus inside the grid moves to the new tab stop.
    const focused = this._grid.contains(this._shadow.activeElement);
    this._grid.replaceChildren(...nodes);
    if (focused) this.focusDay();

    const time = this._hasTime, clearable = this.getBoolAttr('clearable');
    this._timeInput.value = this._time;
    this._timeInput.setAttribute('aria-label', this.getAttribute('time-label') || 'Time');
    this._clear.textContent = this.getAttribute('clear-label') || 'Clear';
    this._foot.replaceChildren(...[time && this._timeInput, clearable && this._clear].filter(Boolean));
    if (time || clearable) this._cal.appendChild(this._foot); else this._foot.remove();
    this._syncForm();
  }

  _syncForm() {
    this.setFormValue(this.value);
    if (this.getBoolAttr('required') && !this.value) this.setValidity({ valueMissing: true }, 'Please choose a date.', this._grid?.querySelector('[tabindex="0"]') ?? undefined);
    else this.setValidity({});
  }

  _head(text) {
    const s = this.createElement('span', ['cal-wd'], { 'aria-hidden': 'true' });
    s.textContent = text;
    return s;
  }

  // ── interaction ──
  _goMonth(month, focus) {
    if (month !== this._month) { this._month = month; this.emit('nk-month', { month }); }
    this._focus = focus ?? null;
    this._draw();
  }

  _pick(iso) {
    const day = this._grid.querySelector(`[data-date="${iso}"]`);
    if (day?.getAttribute('aria-disabled') === 'true') return;
    const before = this.value;
    let done = true;
    if (this.getBoolAttr('range')) {
      if (!this._start || this._end) { this._start = iso; this._end = null; done = false; }
      else if (iso < this._start) { this._end = this._start; this._start = iso; }
      else this._end = iso;
    } else this._day = iso;
    this._focus = iso;
    if (iso.slice(0, 7) !== this._month) this._goMonth(iso.slice(0, 7), iso); else this._draw();
    if (!done) return;
    // Only a new value is a change; the same day again just closes a popover.
    if (this.value !== before) this.emit('nk-change', { value: this.value, start: this.start, end: this.end, time: this._time || null });
    if (this.getBoolAttr('floating') && !this._hasTime) this.close();
  }

  setupEvents() {
    this._onGrid = (e) => { const day = e.target.closest('.cal-day'); if (day) this._pick(day.dataset.date); };
    this._onToday = () => { const t = this._todayIso(); this._goMonth(t.slice(0, 7), t); };
    this._onPrev = () => this._goMonth(stepMonth(this._month, -1));
    this._onNext = () => this._goMonth(stepMonth(this._month, 1));
    this._onKey = (e) => {
      // Enter and Space are the day button's own click.
      const day = e.target.closest?.('.cal-day');
      if (!day) return;
      const date = parseDay(day.dataset.date), ws = this._weekStart, wd = (date.getDay() - ws + 7) % 7;
      let target = null;
      if (STEPS[e.key]) target = addDays(date, STEPS[e.key]);
      else if (e.key === 'Home') target = addDays(date, -wd);
      else if (e.key === 'End') target = addDays(date, 6 - wd);
      else if (e.key === 'PageUp' || e.key === 'PageDown') {
        const months = (e.key === 'PageUp' ? -1 : 1) * (e.shiftKey ? 12 : 1);
        const last = new Date(date.getFullYear(), date.getMonth() + months + 1, 0).getDate();
        target = new Date(date.getFullYear(), date.getMonth() + months, Math.min(date.getDate(), last));
      }
      if (!target) return;
      e.preventDefault();
      const iso = isoOf(target);
      if (iso.slice(0, 7) !== this._month) this._goMonth(iso.slice(0, 7), iso);
      else { this._focus = iso; this._draw(); }
    };
    this._onTime = () => {
      this._time = this._timeInput.value;
      this._syncForm();
      if (this._day) this.emit('nk-change', { value: this.value, start: this.start, end: this.end, time: this._time || null });
    };
    this._onClear = () => {
      if (!this.value) return;
      this._day = this._start = this._end = null; this._time = '';
      this._draw();
      this.emit('nk-change', { value: '', start: null, end: null, time: null });
    };
    // Floating: a tap outside closes it and reaches nothing else; Escape closes (captured, before a modal around it).
    this._onOutside = (e) => {
      const path = e.composedPath();
      if (path.includes(this) || (this._anchor && path.includes(this._anchor))) return;
      e.preventDefault(); e.stopPropagation();
      this.close();
    };
    this._onEscape = (e) => { if (e.key === 'Escape' && this.getBoolAttr('floating') && this.getBoolAttr('open')) { e.stopPropagation(); this.close(); } };
    this._grid.addEventListener('click', this._onGrid);
    this._grid.addEventListener('keydown', this._onKey);
    this._todayBtn.addEventListener('click', this._onToday);
    this._prev.addEventListener('click', this._onPrev);
    this._next.addEventListener('click', this._onNext);
    this._timeInput.addEventListener('change', this._onTime);
    this._clear.addEventListener('click', this._onClear);
    document.addEventListener('keydown', this._onEscape, true);
    if (this.getBoolAttr('open')) document.addEventListener('click', this._onOutside, true);
  }

  teardownEvents() {
    this._grid?.removeEventListener('click', this._onGrid);
    this._grid?.removeEventListener('keydown', this._onKey);
    this._todayBtn?.removeEventListener('click', this._onToday);
    this._prev?.removeEventListener('click', this._onPrev);
    this._next?.removeEventListener('click', this._onNext);
    this._timeInput?.removeEventListener('change', this._onTime);
    this._clear?.removeEventListener('click', this._onClear);
    document.removeEventListener('keydown', this._onEscape, true);
    document.removeEventListener('click', this._onOutside, true);
  }

  onAttributeChanged(name, _old, value) {
    if (name === 'value') { this._readValue(value); this._draw(); return; }
    if (name === 'month') { this.month = value; return; }
    if (name === 'open' || name === 'sheet') { this._syncPop(); if (name === 'open') this._syncOpen(); return; }
    if (name === 'align') return;
    if (name === 'floating') { this.teardownEvents(); this._build(); if (this.isConnected) this.setupEvents(); return; }
    if (name === 'range') this._readValue(this.getAttribute('value'));
    if (name === 'days') this._days = null;
    this._draw();
  }

  _syncOpen() {
    const open = this.getBoolAttr('open');
    if (this._anchor) (this._anchor.shadowRoot?.querySelector('button, a[href]') ?? this._anchor).setAttribute('aria-expanded', String(open));
    if (open) {
      this._returnFocus = deepActiveElement();
      if (this._returnFocus?.matches(':focus-visible')) requestAnimationFrame(() => this.focusDay());
      document.addEventListener('click', this._onOutside, true);
    } else {
      document.removeEventListener('click', this._onOutside, true);
      const back = this._returnFocus;
      this._returnFocus = null;
      const active = deepActiveElement();
      if (back?.isConnected && active && this._shadow.contains(active)) back.focus({ preventScroll: true });
    }
    this.emit('nk-toggle', { open });
  }

  // ── form ──
  resetValue() { this._readValue(this._initialValue); this._draw(); }
  restoreValue(state) { this._readValue(state); this._draw(); }
  onFormDisabled(disabled) { this._cal?.toggleAttribute('inert', disabled); }

  // ── API ──
  /** Opens under `anchor` (with `floating`), on the month of the value. */
  show(anchor) {
    if (anchor) { this._anchor = anchor; placeUnder(this, anchor, this.getAttribute('align')); }
    const shown = this.start;
    if (shown && shown.slice(0, 7) !== this._month) { this._month = shown.slice(0, 7); this._focus = null; this._draw(); }
    this.setBoolAttr('open', true);
  }
  close() { this.setBoolAttr('open', false); }
  toggle(anchor) { this.getBoolAttr('open') ? this.close() : this.show(anchor); }
  get open() { return this.getBoolAttr('open'); }
  set open(v) { this.setBoolAttr('open', v); }
  /** Moves focus to the day with the tab stop. */
  focusDay() { this._grid?.querySelector('[tabindex="0"]')?.focus(); }
}

customElements.define('nk-calendar', NkCalendar);

export { NkCalendar };
