import { i as initialsOf, p as paintAvatar } from './avatar-CzPZN3uP.js';

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

const el = (tag, cls, text) => { const n = document.createElement(tag); if (cls) n.className = cls; if (text != null) n.textContent = text; return n; };
const COLORS = ['gray', 'brown', 'orange', 'yellow', 'green', 'blue', 'purple', 'pink', 'red'];

function optionFor(column, value) {
  const opts = column.options || [];
  return opts.find(o => o.value === value) || opts.find(o => o.label === value) || null;
}

function tagFor(column, value) {
  const opt = optionFor(column, value);
  const color = opt?.color && COLORS.includes(opt.color) ? opt.color : 'gray';   // Notion's default option colour
  return el('span', `nk-tag ${color}`, opt?.label ?? String(value));
}

function renderPropertyCell(column, value, row = {}) {
  const type = column.type || 'text';
  if (type === 'actions') return actions(column, value);
  if (value === undefined || value === null || value === '') {
    if (type === 'checkbox') return checkbox(column, false, row);
    if (type === 'progress') return progress(0);
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
    case 'date': return el('span', 'date-cell', String(value));
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
    case 'progress': return progress(Number(value) || 0);
    default: {
      if (column.title) {
        const t = el('span', 'row-title');
        if (row.icon) t.append(document.createTextNode(row.icon + ' '));
        t.append(document.createTextNode(String(value)));
        return t;
      }
      return el('span', null, String(value));
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

function progress(value) {
  const frag = document.createDocumentFragment();
  const bar = el('span', 'nk-progress');
  const fill = el('i'); fill.style.width = `${Math.max(0, Math.min(100, value))}%`;
  bar.appendChild(fill);
  frag.append(bar, el('span', 'nk-progress-label', `${Math.round(value)}%`));
  return frag;
}

/** Sort comparator for a column type. */
function compareBy(column, dir = 1) {
  const type = column.type || 'text';
  return (a, b) => {
    let x = a[column.key], y = b[column.key];
    if (type === 'person') { x = x?.name ?? x ?? ''; y = y?.name ?? y ?? ''; }
    if (type === 'number' || type === 'progress' || type === 'checkbox') return ((Number(x) || 0) - (Number(y) || 0)) * dir;
    return String(x ?? '').localeCompare(String(y ?? ''), undefined, { numeric: true }) * dir;
  };
}

export { compareBy as c, renderPropertyCell as r, tagFor as t };
