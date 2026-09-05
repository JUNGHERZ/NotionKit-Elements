// Polymorphic property renderer for database views. Returns plain DOM built
// from NotionKit classes – deliberately not a custom element: every cell rule
// starts with `.nk-table`, so a cell inside its own shadow root would never
// be styled. Exported for consumers who render tables themselves.
//
// column: { key, label, type, icon, options: [{ value, label, color }], title }
// types: text | select | multi-select | date | person | checkbox | url | number | progress
const el = (tag, cls, text) => { const n = document.createElement(tag); if (cls) n.className = cls; if (text != null) n.textContent = text; return n; };
const COLORS = ['blue', 'green', 'orange', 'purple'];

export function optionFor(column, value) {
  const opts = column.options || [];
  return opts.find(o => o.value === value) || opts.find(o => o.label === value) || null;
}

export function tagFor(column, value) {
  const opt = optionFor(column, value);
  const color = opt?.color && COLORS.includes(opt.color) ? opt.color : 'blue';
  return el('span', `nk-tag ${color}`, opt?.label ?? String(value));
}

export function renderPropertyCell(column, value, row = {}) {
  const type = column.type || 'text';
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
      const avatar = el('span', 'mini-avatar', p.initials || p.avatar || (p.name || '').split(/\s+/).map(w => w[0]).join('').slice(0, 2).toUpperCase());
      avatar.style.background = p.color || 'var(--nk-text-tertiary)';
      cell.append(avatar, document.createTextNode(' ' + (p.name || '')));
      return cell;
    }
    case 'checkbox': return checkbox(column, !!value, row);
    case 'url': { const a = el('a', null, String(value).replace(/^https?:\/\//, '')); a.href = String(value); a.target = '_blank'; a.rel = 'noopener'; return a; }
    case 'number': return el('span', null, typeof value === 'number' ? value.toLocaleString() : String(value));
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
export function compareBy(column, dir = 1) {
  const type = column.type || 'text';
  return (a, b) => {
    let x = a[column.key], y = b[column.key];
    if (type === 'person') { x = x?.name ?? x ?? ''; y = y?.name ?? y ?? ''; }
    if (type === 'number' || type === 'progress' || type === 'checkbox') return ((Number(x) || 0) - (Number(y) || 0)) * dir;
    return String(x ?? '').localeCompare(String(y ?? ''), undefined, { numeric: true }) * dir;
  };
}
