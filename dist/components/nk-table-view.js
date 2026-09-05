import { N as NkElement } from './shared/base-6gEcoatG.js';
import { c as compareBy, r as renderPropertyCell } from './shared/property-cell-Dn91uFkf.js';

// <nk-table-view name="table" label="▦ Table" count new-row sortable></nk-table-view>
// Standalone: view.columns = […]; view.rows = […];  Inside <nk-database> the
// database pushes `data`. → <div class="nk-table-wrap"><table class="nk-table">…</table><div class="nk-new-row">＋ New page</div></div>
// Cells are plain markup from renderPropertyCell(); rows fire nk-select,
// checkboxes nk-change, headers nk-action { action: 'sort' } (and sort locally
// with `sortable`), the add row nk-action { action: 'new-row' }.
class NkTableView extends NkElement {
  static get observedAttributes() { return ['name', 'label', 'badge', 'count', 'new-row', 'new-row-label', 'sortable', 'sort-key', 'sort-dir']; }

  render() {
    this._wrap = this.createElement('div', ['nk-table-wrap']);
    this._table = this.createElement('table', ['nk-table']);
    this._thead = document.createElement('thead');
    this._tbody = document.createElement('tbody');
    this._table.append(this._thead, this._tbody);
    this._newRow = this.createElement('div', ['nk-new-row'], { role: 'button', tabindex: '0' });
    this._wrap.append(this._table, this._newRow);
    this._wrapper.appendChild(this._wrap);
    this._columns ??= []; this._rows ??= [];
    this._render();
    this.closest('nk-database')?.requestSync?.();
  }

  _sortedRows() {
    const key = this.getAttribute('sort-key');
    const col = this._columns.find(c => c.key === key);
    if (!col) return this._rows;
    return [...this._rows].sort(compareBy(col, this.getAttribute('sort-dir') === 'desc' ? -1 : 1));
  }

  _render() {
    if (!this._thead) return;
    const tr = document.createElement('tr');
    for (const col of this._columns) {
      const th = this.createElement('th', [], { 'data-key': col.key, scope: 'col' });
      if (col.icon) { const i = this.createElement('span', ['th-icon']); i.textContent = col.icon; th.appendChild(i); }
      th.appendChild(document.createTextNode(col.label ?? col.key));
      if (col.key === this.getAttribute('sort-key')) th.appendChild(document.createTextNode(this.getAttribute('sort-dir') === 'desc' ? ' ↓' : ' ↑'));
      if (col.width) th.style.width = col.width;
      tr.appendChild(th);
    }
    this._thead.replaceChildren(tr);
    this._tbody.replaceChildren();
    for (const row of this._sortedRows()) {
      const r = this.createElement('tr', [], { 'data-id': row.id ?? '' });
      for (const col of this._columns) {
        const td = document.createElement('td');
        td.appendChild(renderPropertyCell(col, row[col.key], row));
        r.appendChild(td);
      }
      this._tbody.appendChild(r);
    }
    this._newRow.textContent = this.getAttribute('new-row-label') || '＋ New page';
    this._newRow.style.display = this.getBoolAttr('new-row') ? '' : 'none';
  }

  setupEvents() {
    this._onClick = (e) => {
      if (this._newRow.contains(e.target)) { this.emit('nk-action', { action: 'new-row' }); return; }
      const th = e.target.closest('th[data-key]');
      if (th) {
        const key = th.dataset.key;
        const dir = this.getAttribute('sort-key') === key && this.getAttribute('sort-dir') !== 'desc' ? 'desc' : 'asc';
        const ok = this.emit('nk-action', { action: 'sort', key, value: dir });
        if (ok && this.getBoolAttr('sortable')) { this.setAttribute('sort-key', key); this.setAttribute('sort-dir', dir); }
        return;
      }
      if (e.target.closest('input[type=checkbox], a')) return;
      const tr = e.target.closest('tr[data-id]');
      if (tr) { const row = this._rowById(tr.dataset.id); this.emit('nk-select', { row, id: row?.id, value: row?.id }); }
    };
    this._onChange = (e) => {
      const input = e.target;
      if (input.type !== 'checkbox') return;
      const row = this._rowById(input.dataset.rowId);
      if (row) row[input.dataset.key] = input.checked;
      this.emit('nk-change', { row, key: input.dataset.key, value: input.checked });
    };
    this._onKey = (e) => { if ((e.key === 'Enter' || e.key === ' ') && e.target === this._newRow) { e.preventDefault(); this.emit('nk-action', { action: 'new-row' }); } };
    this._wrap.addEventListener('click', this._onClick);
    this._wrap.addEventListener('change', this._onChange);
    this._wrap.addEventListener('keydown', this._onKey);
  }

  teardownEvents() {
    this._wrap?.removeEventListener('click', this._onClick);
    this._wrap?.removeEventListener('change', this._onChange);
    this._wrap?.removeEventListener('keydown', this._onKey);
  }

  _rowById(id) { return this._rows.find(r => String(r.id) === String(id)); }
  onAttributeChanged() { this._render(); }

  get name() { return this.getAttribute('name') || 'table'; }
  get columns() { return this._columns; }
  set columns(v) { this._columns = Array.isArray(v) ? v : []; this._render(); }
  get rows() { return this._rows; }
  set rows(v) { this._rows = Array.isArray(v) ? v : []; this._render(); }
  set data({ columns, rows }) { this.setData(columns, rows); }
  setData(columns, rows) { this._columns = columns || []; this._rows = rows || []; this._render(); }
  refresh() { this._render(); }
}

customElements.define('nk-table-view', NkTableView);

export { NkTableView };
