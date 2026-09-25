// Polymorphic property renderer for database views. Returns plain DOM built
// from NotionKit classes – deliberately not a custom element: every cell rule
// starts with `.nk-table`, so a cell inside its own shadow root would never
// be styled. Exported for consumers who render tables themselves.
//
// column: { key, label, type, icon, options: [{ value, label, color }], title }
// types: text | select | multi-select | date | person | checkbox | url | number | progress | actions
// url: a string is an address outside, opened in a new tab; { href, label,
// target } a link of your own – to another page of the app, with its text.
// actions: buttons for the row from column.actions [{ action, label, icon,
// danger, disabled, tooltip }]; the row's value – action names or objects –
// picks which of them it shows, all of them without one.
// text: a string, or { text, desc, color, tooltip, sort } – one of Notion's
// nine text colours for a tone, a quiet second line under it, the whole
// text in a tooltip (served by <nk-tooltip>), a value to sort by.
// progress: 0–100, the bar and its percentage as Intl writes it in
// column.locale, else the page's language ("45 %" in German).
// date: the value as given, or with column.format ('short', 'relative' or
// Intl.DateTimeFormat options) and column.locale formatted from an ISO date
// or date-time, D.M.YYYY, a Date or a timestamp; { start, end } is a range.
// Sorting (compareBy) goes by column.sortKey – another field of the row –
// when there is one, else by a value's `sort`, a date's time, a select's
// place among its options; empty cells come last in both directions.
import { paintAvatar, initialsOf } from './avatar.js';
import { resolveLocale } from './dates.js';

const el = (tag, cls, text) => { const n = document.createElement(tag); if (cls) n.className = cls; if (text != null) n.textContent = text; return n; };
const COLORS = ['gray', 'brown', 'orange', 'yellow', 'green', 'blue', 'purple', 'pink', 'red'];

export function optionFor(column, value) {
  const opts = column.options || [];
  return opts.find(o => o.value === value) || opts.find(o => o.label === value) || null;
}

export function tagFor(column, value) {
  const opt = optionFor(column, value);
  const color = opt?.color && COLORS.includes(opt.color) ? opt.color : 'gray';   // Notion's default option colour
  return el('span', `nk-tag ${color}`, opt?.label ?? String(value));
}

/** The text of a value: a string as it is, a text, link or person object's text, label or name. */
export const textOf = v => (v && typeof v === 'object' ? v.text ?? v.label ?? v.name ?? '' : String(v ?? ''));

/** The time of a date value in ms: an ISO date – local midnight – or date-time, D.M.YYYY, a Date, a timestamp, a range's start; NaN when it is none. */
export function timeOf(v) {
  if (v instanceof Date) return v.getTime();
  if (typeof v === 'number') return v;
  if (v && typeof v === 'object') return timeOf(v.start);
  const s = String(v ?? '').trim();
  let m = s.match(/^(\d{1,2})\.(\d{1,2})\.(\d{4})$/);
  if (m) return new Date(+m[3], +m[2] - 1, +m[1]).getTime();
  m = s.match(/^(\d{4})-(\d{2})-(\d{2})$/);
  if (m) return new Date(+m[1], +m[2] - 1, +m[3]).getTime();
  return /^\d{4}-\d{2}-\d{2}T/.test(s) ? Date.parse(s) : NaN;
}

/**
 * A date as its column shows it: as given without column.format; 'short' –
 * day and month, the year when it is not this one; 'relative' – minutes or
 * hours ago or ahead within a day, else the short date; or the options of
 * Intl.DateTimeFormat. A range { start, end } stands as start → end.
 */
export function formatDate(column, value) {
  if (value && typeof value === 'object' && !(value instanceof Date)) return [value.start, value.end].filter(Boolean).map(v => formatDate(column, v)).join(' → ');
  const format = column.format, t = timeOf(value);
  if (!format || Number.isNaN(t)) return String(value ?? '');
  const d = new Date(t), locale = column.locale || resolveLocale();
  if (format === 'relative') {
    const minutes = Math.round((t - Date.now()) / 60000), rel = new Intl.RelativeTimeFormat(locale, { numeric: 'auto', style: 'short' });
    if (Math.abs(minutes) < 60) return rel.format(minutes, 'minute');
    if (Math.abs(minutes) < 24 * 60) return rel.format(Math.round(minutes / 60), 'hour');
  }
  if (format === 'short' || format === 'relative') {
    const year = d.getFullYear() === new Date().getFullYear() ? {} : { year: 'numeric' };
    return d.toLocaleDateString(locale, { day: '2-digit', month: '2-digit', ...year });
  }
  return typeof format === 'object' ? new Intl.DateTimeFormat(locale, format).format(d) : String(value);
}

export function renderPropertyCell(column, value, row = {}) {
  const type = column.type || 'text';
  if (type === 'actions') return actions(column, value);
  if (value === undefined || value === null || value === '') {
    if (type === 'checkbox') return checkbox(column, false, row);
    if (type === 'progress') return progress(column, 0);
    return el('span', type === 'person' ? 'person-cell' : null, type === 'text' && column.title ? '' : '—');
  }
  switch (type) {
    case 'select': return tagFor(column, value);
    case 'multi-select': {
      const wrap = el('span');
      wrap.style.display = 'inline-flex'; wrap.style.gap = '4px'; wrap.style.flexWrap = 'wrap';
      for (const v of Array.isArray(value) ? value : String(value).split(',').map(s => s.trim()).filter(Boolean)) wrap.appendChild(tagFor(column, v));
      return wrap;
    }
    case 'date': return el('span', 'date-cell', formatDate(column, value));
    case 'person': {
      const cell = el('span', 'person-cell');
      const p = typeof value === 'string' ? { name: value } : value;
      // color: one of Notion's nine names, or any CSS background; none – the avatar gradient.
      const avatar = el('span', 'nk-avatar small', p.initials || p.avatar || initialsOf(p.name));
      paintAvatar(avatar, p.color);
      cell.append(avatar, document.createTextNode(' ' + (p.name || '')));
      return cell;
    }
    case 'checkbox': return checkbox(column, !!value, row);
    case 'url': {
      const link = typeof value === 'object' ? value : { href: String(value), label: String(value).replace(/^https?:\/\//, ''), target: '_blank' };
      const a = el('a', null, link.label ?? link.href);
      a.href = link.href ?? '';
      if (link.target) a.target = link.target;
      if (link.target === '_blank') a.rel = 'noopener';
      return a;
    }
    // column.locale / column.format: Intl.NumberFormat locale and options, e.g. { minimumFractionDigits: 1 }.
    case 'number': return el('span', null, typeof value === 'number' ? value.toLocaleString(column.locale, column.format) : String(value));
    case 'progress': return progress(column, Number(value) || 0);
    default: {
      const o = typeof value === 'object' ? value : { text: value };
      let t;
      if (column.title) {
        t = el('span', 'row-title');
        if (row.icon) t.append(document.createTextNode(row.icon + ' '));
        t.append(document.createTextNode(String(o.text ?? '')));
      } else if (typeof value === 'object') {
        t = el('span', o.color && COLORS.includes(o.color) ? `td-text ${o.color}` : 'td-text', String(o.text ?? ''));
      } else return el('span', null, String(value));
      if (o.tooltip) t.dataset.tooltip = o.tooltip;
      if (!o.desc) return t;
      const frag = document.createDocumentFragment();
      frag.append(t, el('span', 'td-desc', String(o.desc)));
      return frag;
    }
  }
}

function actions(column, value) {
  const all = column.actions || [];
  const list = value == null ? all
    : (Array.isArray(value) ? value : [value]).map(v => typeof v === 'string' ? all.find(a => a.action === v) ?? { action: v, label: v } : v);
  const wrap = el('span', 'row-actions');
  for (const a of list) {
    const b = el('button', `nk-btn ${a.danger ? 'danger' : 'secondary'} small`, [a.icon, a.label ?? a.action].filter(Boolean).join(' '));
    b.type = 'button';
    b.dataset.action = a.action;
    b.disabled = !!a.disabled;
    if (a.tooltip) b.dataset.tooltip = a.tooltip;
    wrap.appendChild(b);
  }
  return wrap;
}

function checkbox(column, checked, row) {
  const label = el('label', 'nk-check');
  const input = el('input');
  input.type = 'checkbox'; input.checked = checked;
  input.dataset.key = column.key;
  if (row.id != null) input.dataset.rowId = row.id;
  label.appendChild(input);
  return label;
}

function progress(column, value) {
  const frag = document.createDocumentFragment();
  const bar = el('span', 'nk-progress');
  const fill = el('i'); fill.style.width = `${Math.max(0, Math.min(100, value))}%`;
  bar.appendChild(fill);
  frag.append(bar, el('span', 'nk-progress-label', formatPercent(column, value)));
  return frag;
}

/** A progress value of 0–100 as Intl writes a percentage in column.locale, else the page's language: 45 → "45%", in German "45 %". */
export function formatPercent(column, value) {
  const n = Number(value) || 0;
  try {
    return new Intl.NumberFormat(column.locale || resolveLocale(), { style: 'percent', maximumFractionDigits: 0 }).format(n / 100);
  } catch { return `${Math.round(n)}%`; }  // a lang Intl does not take
}

/** A select's place among its options: the order Notion sorts by. */
function rankOf(column, value) {
  const i = (column.options || []).findIndex(o => o.value === value || o.label === value);
  return i < 0 ? (column.options || []).length : i;
}

/** What a column sorts a row by – see the head of this file. */
function sortValue(column, row) {
  if (column.sortKey) return row[column.sortKey];
  const v = row[column.key];
  if (v === undefined || v === null || v === '') return null;
  if (typeof v === 'object' && !Array.isArray(v) && 'sort' in v) return v.sort;
  switch (column.type || 'text') {
    case 'number': case 'progress': return Number(v);
    case 'checkbox': return v ? 1 : 0;
    case 'date': { const t = timeOf(v); return Number.isNaN(t) ? String(v) : t; }
    case 'select': return rankOf(column, v);
    case 'multi-select': { const first = (Array.isArray(v) ? v : String(v).split(','))[0]; return first == null ? null : rankOf(column, String(first).trim()); }
    default: return textOf(v);
  }
}

/** Sort comparator for a column; empty cells come last whichever the direction. */
export function compareBy(column, dir = 1) {
  const empty = v => v === null || v === undefined || v === '' || Number.isNaN(v);
  return (a, b) => {
    const x = sortValue(column, a), y = sortValue(column, b);
    if (empty(x) || empty(y)) return empty(x) === empty(y) ? 0 : empty(x) ? 1 : -1;
    if (typeof x === 'number' && typeof y === 'number') return (x - y) * dir;
    return String(x).localeCompare(String(y), undefined, { numeric: true }) * dir;
  };
}
