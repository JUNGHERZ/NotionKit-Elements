import { NkElement } from '../../base.js';
import { textOf } from '../../util/property-cell.js';
import { isoOf, parseDay, isoWeek, resolveLocale, firstWeekday, weekdayNames, monthGrid, stepMonth, weekLabel, CHEVRONS } from '../../util/dates.js';

// <nk-calendar-view name="calendar" label="📅 Calendar" date-key="due" weeks></nk-calendar-view>
// The fourth database view (NotionKit 1.9.0): a month, the rows as cards on
// their dates. `date-key` names the date column (default: the first one),
// `title-key` the title (default: the title column); dates are YYYY-MM-DD or
// D.M.YYYY, a range { start, end } stands on its start. month (YYYY-MM;
// default today's), weeks (the ISO week in front of each row), week-start
// (0 = Sunday … 6 = Saturday; default from the locale), weekend (weekdays
// washed like the days of other months, "6,0"), today, locale and the texts
// today-label, prev-label, next-label, week-label – without them English
// or German after the language (1.17.0).
// Standalone: view.columns = […]; view.rows = […]. Inside <nk-database> the
// database pushes the data. A card fires nk-select { row, id, value } like a
// row of the table, Today and ‹ › nk-month { month }.
// → <div class="nk-calendar-view weeks"><div class="cv-head"><div class="cv-title">May 2026</div><button class="cal-nav">Today</button>‹ ›</div>
//     <div class="cv-grid"><div class="cv-wd">W</div>…<div class="cv-week">21</div><div class="cv-day today"><span class="cv-num">20</span><button class="cv-item">🗃️ …</button></div>…</div></div>
class NkCalendarView extends NkElement {
  static get observedAttributes() {
    return ['name', 'label', 'badge', 'count', 'date-key', 'title-key', 'month', 'weeks', 'week-start', 'weekend', 'today', 'locale',
      'today-label', 'prev-label', 'next-label', 'week-label'];
  }

  render() {
    this._box = this.createElement('div', ['nk-calendar-view']);
    const head = this.createElement('div', ['cv-head']);
    this._title = this.createElement('div', ['cv-title']);
    this._todayBtn = this.createElement('button', ['cal-nav'], { type: 'button' });
    this._prev = this.createElement('button', ['cal-nav'], { type: 'button' });
    this._prev.innerHTML = CHEVRONS.prev;
    this._next = this.createElement('button', ['cal-nav'], { type: 'button' });
    this._next.innerHTML = CHEVRONS.next;
    head.append(this._title, this._todayBtn, this._prev, this._next);
    this._grid = this.createElement('div', ['cv-grid']);
    this._box.append(head, this._grid);
    this._wrapper.appendChild(this._box);
    this._columns ??= []; this._rows ??= [];
    this._month ??= this._attrMonth() ?? this._todayIso().slice(0, 7);
    this._render();
    this.closest('nk-database')?.requestSync?.();
  }

  _attrMonth() { const m = this.getAttribute('month'); return /^\d{4}-\d{2}$/.test(m || '') ? m : null; }
  _todayIso() { return this.getAttribute('today') || isoOf(new Date()); }
  _dateColumn() {
    const key = this.getAttribute('date-key');
    return this._columns.find(c => c.key === key) || this._columns.find(c => c.type === 'date') || null;
  }
  _titleColumn() {
    const key = this.getAttribute('title-key');
    return this._columns.find(c => c.key === key) || this._columns.find(c => c.title) || this._columns[0] || null;
  }

  _render() {
    if (!this._grid) return;
    const locale = resolveLocale(this.getAttribute('locale')), weeks = this.getBoolAttr('weeks');
    const n = Number(this.getAttribute('week-start'));
    const ws = this.hasAttribute('week-start') && Number.isInteger(n) && n >= 0 && n <= 6 ? n : firstWeekday(locale);
    const g = monthGrid(this._month, ws), today = this._todayIso();
    const weekend = new Set((this.getAttribute('weekend') || '').split(',').map(s => s.trim()).filter(Boolean).map(Number));
    const dateCol = this._dateColumn(), titleCol = this._titleColumn(), byDay = {};
    if (dateCol) for (const row of this._rows) {
      const d = parseDay(row[dateCol.key]);
      if (d) (byDay[isoOf(d)] ||= []).push(row);
    }
    this._box.classList.toggle('weeks', weeks);
    this._title.textContent = new Intl.DateTimeFormat(locale, { month: 'long', year: 'numeric' }).format(g.first);
    this._todayBtn.textContent = this.getAttribute('today-label') || this.str('today');
    this._prev.setAttribute('aria-label', this.getAttribute('prev-label') || this.str('previousMonth'));
    this._next.setAttribute('aria-label', this.getAttribute('next-label') || this.str('nextMonth'));

    const cell = (cls, text) => { const el = this.createElement('div', [cls]); el.textContent = text; return el; };
    const nodes = [];
    if (weeks) nodes.push(cell('cv-wd', this.getAttribute('week-label') || weekLabel(locale)));
    for (const w of weekdayNames(locale, ws)) nodes.push(cell('cv-wd', w));
    for (let i = 0; i < g.rows * 7; i++) {
      const d = g.day(i), iso = isoOf(d);
      if (weeks && i % 7 === 0) nodes.push(cell('cv-week', isoWeek(d)));
      const day = this.createElement('div', ['cv-day', d.getMonth() !== g.m - 1 && 'out', weekend.has(d.getDay()) && 'off', iso === today && 'today'].filter(Boolean));
      const num = this.createElement('span', ['cv-num']);
      num.textContent = d.getDate();
      day.appendChild(num);
      for (const row of byDay[iso] || []) {
        const item = this.createElement('button', ['cv-item'], { type: 'button', 'data-id': row.id ?? '' });
        const title = titleCol ? textOf(row[titleCol.key]) : '';
        item.textContent = row.icon ? `${row.icon} ${title}` : title;
        day.appendChild(item);
      }
      nodes.push(day);
    }
    this._grid.replaceChildren(...nodes);
  }

  _goMonth(month) {
    if (month === this._month) return;
    this._month = month;
    this._render();
    this.emit('nk-month', { month });
  }

  setupEvents() {
    this._onClick = (e) => {
      if (e.target.closest('.cal-nav') === this._todayBtn) { this._goMonth(this._todayIso().slice(0, 7)); return; }
      if (e.target.closest('.cal-nav') === this._prev) { this._goMonth(stepMonth(this._month, -1)); return; }
      if (e.target.closest('.cal-nav') === this._next) { this._goMonth(stepMonth(this._month, 1)); return; }
      const item = e.target.closest('.cv-item');
      if (item) { const row = this._rowById(item.dataset.id); this.emit('nk-select', { row, id: row?.id, value: row?.id }); }
    };
    this._box.addEventListener('click', this._onClick);
  }

  teardownEvents() { this._box?.removeEventListener('click', this._onClick); }

  _rowById(id) { return this._rows.find(r => String(r.id) === String(id)); }

  onStringsChanged() { this._render(); }

  onAttributeChanged(name) {
    if (name === 'month') this._month = this._attrMonth() ?? this._month;
    this._render();
    if (name === 'label' || name === 'badge' || name === 'count') this.closest('nk-database')?.requestSync?.();
  }

  get name() { return this.getAttribute('name') || 'calendar'; }
  /** The month shown, YYYY-MM. */
  get month() { return this._month; }
  set month(v) { if (!/^\d{4}-\d{2}$/.test(v)) return; if (this._grid) this._goMonth(v); else this._month = v; }
  get columns() { return this._columns; }
  set columns(v) { this._columns = Array.isArray(v) ? v : []; this._render(); }
  get rows() { return this._rows; }
  set rows(v) { this._rows = Array.isArray(v) ? v : []; this._render(); }
  set data({ columns, rows }) { this.setData(columns, rows); }
  setData(columns, rows) { this._columns = columns || []; this._rows = rows || []; this._render(); }
  refresh() { this._render(); }
}

customElements.define('nk-calendar-view', NkCalendarView);
export { NkCalendarView };
