import { NkElement } from './base.js';
import { a as textOf, b as formatDate, r as renderPropertyCell } from './shared/property-cell-DcsfnUNF.js';
import '@jungherz-de/notionkit/notionkit-styles.js';
import './shared/avatar-CzPZN3uP.js';
import './shared/dates-a32DcW1l.js';

// <nk-list-view name="list" label="☰ List" meta-keys="due,status" new-row></nk-list-view>
// The third database view: one line per row – icon and title, the `meta-keys`
// on the right (default: the select and date columns, in column order). Dates
// and text stand as text, selects as tags, a person as avatar and name.
// Standalone: view.columns = […]; view.rows = […]. Inside <nk-database> the
// database pushes the data. Rows fire nk-select, the add row nk-action
// { action: 'new-row' }.
// → <div class="nk-list"><div class="nk-list-item"><span class="l-icon">…</span><span class="l-title">…</span><span class="l-meta">…</span></div>…</div>
class NkListView extends NkElement {
  static get observedAttributes() { return ['name', 'label', 'badge', 'count', 'title-key', 'meta-keys', 'new-row', 'new-row-label']; }

  render() {
    this._box = document.createElement('div');
    this._list = this.createElement('div', ['nk-list'], { role: 'list' });
    this._newRow = this.createElement('div', ['nk-new-row'], { role: 'button', tabindex: '0' });
    this._box.append(this._list, this._newRow);
    this._wrapper.appendChild(this._box);
    this._columns ??= []; this._rows ??= [];
    this._render();
    this.closest('nk-database')?.requestSync?.();
  }

  _titleColumn() {
    const key = this.getAttribute('title-key');
    return this._columns.find(c => c.key === key) || this._columns.find(c => c.title) || this._columns[0] || null;
  }
  _metaColumns() {
    const keys = (this.getAttribute('meta-keys') || '').split(',').map(s => s.trim()).filter(Boolean);
    if (keys.length) return keys.map(k => this._columns.find(c => c.key === k)).filter(Boolean);
    return this._columns.filter(c => c.type === 'select' || c.type === 'date');
  }

  _render() {
    if (!this._list) return;
    const title = this._titleColumn(), meta = this._metaColumns();
    this._list.replaceChildren();
    for (const row of this._rows) {
      const item = this.createElement('div', ['nk-list-item'], { role: 'listitem', tabindex: '0', 'data-id': row.id ?? '' });
      const icon = this.createElement('span', ['l-icon']);
      icon.textContent = row.icon || '';
      if (!row.icon) icon.style.display = 'none';
      const t = this.createElement('span', ['l-title']);
      t.textContent = title ? textOf(row[title.key]) : '';
      const m = this.createElement('span', ['l-meta']);
      for (const c of meta) {
        const v = row[c.key];
        if (v === undefined || v === null || v === '') continue;
        m.appendChild(c.type === 'date' ? document.createTextNode(formatDate(c, v)) : c.type === 'text' || !c.type ? document.createTextNode(textOf(v)) : renderPropertyCell(c, v, row));
      }
      item.append(icon, t, m);
      this._list.appendChild(item);
    }
    this._newRow.textContent = this.getAttribute('new-row-label') || this.str('newPage');
    this._newRow.style.display = this.getBoolAttr('new-row') ? '' : 'none';
  }

  setupEvents() {
    this._onClick = (e) => {
      if (this._newRow.contains(e.target)) { this.emit('nk-action', { action: 'new-row' }); return; }
      const item = e.target.closest('.nk-list-item');
      if (item) { const row = this._rowById(item.dataset.id); this.emit('nk-select', { row, id: row?.id, value: row?.id }); }
    };
    this._onKey = (e) => {
      if (e.key !== 'Enter' && e.key !== ' ') return;
      if (e.target === this._newRow || e.target.classList?.contains('nk-list-item')) { e.preventDefault(); e.target.click(); }
    };
    this._box.addEventListener('click', this._onClick);
    this._box.addEventListener('keydown', this._onKey);
  }

  teardownEvents() {
    this._box?.removeEventListener('click', this._onClick);
    this._box?.removeEventListener('keydown', this._onKey);
  }

  _rowById(id) { return this._rows.find(r => String(r.id) === String(id)); }
  onAttributeChanged() { this._render(); }
  onStringsChanged() { this._render(); }

  get name() { return this.getAttribute('name') || 'list'; }
  get columns() { return this._columns; }
  set columns(v) { this._columns = Array.isArray(v) ? v : []; this._render(); }
  get rows() { return this._rows; }
  set rows(v) { this._rows = Array.isArray(v) ? v : []; this._render(); }
  set data({ columns, rows }) { this.setData(columns, rows); }
  setData(columns, rows) { this._columns = columns || []; this._rows = rows || []; this._render(); }
  refresh() { this._render(); }
}

customElements.define('nk-list-view', NkListView);

export { NkListView };
