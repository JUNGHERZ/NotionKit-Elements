import { NkElement } from './base.js';
import { c as compareBy, r as renderPropertyCell } from './shared/property-cell-DcsfnUNF.js';
import '@jungherz-de/notionkit/notionkit-styles.js';
import './shared/avatar-CzPZN3uP.js';
import './shared/dates-a32DcW1l.js';

// <nk-table-view name="table" label="▦ Table" count new-row sortable wrap></nk-table-view>
// `wrap` lets cell text break (`.nk-table.wrap`), like Notion's "wrap column".
// Standalone: view.columns = […]; view.rows = […];  Inside <nk-database> the
// database pushes `data`. → <div class="nk-table-wrap"><table class="nk-table">…</table><div class="nk-new-row">＋ New page</div></div>
// Cells are plain markup from renderPropertyCell(); rows fire nk-select
// { row, id, key, cell } – `key` and `cell` say which cell was hit, to open
// an editor there, like the date picker under a due date – checkboxes
// nk-change, headers nk-action { action: 'sort' } (and sort locally
// with `sortable`), the add row nk-action { action: 'new-row' }. A column of
// type 'actions' (NotionKit 1.12.0) sets buttons in each row; a click on one
// fires nk-action { action, row, id, anchor } instead of selecting the row,
// and its header sorts nothing.
//
// A checkbox column with `selectAll: true` (1.21.0) is a selection column:
// its header holds a checkbox instead of a name – empty, a dash for some
// rows, a check for all – and sorts nothing (th.select-all, NotionKit
// 1.21.0). A click or Space sets the column for every row the view has –
// a dash selects all, as Notion does –, renders again and fires one
// nk-change { key, value, all: true, rows }, so an app that keeps its own
// selection follows with one update. What "all" means beyond these rows –
// more pages, a filter on the server – stays with the app.
class NkTableView extends NkElement {
  static get observedAttributes() { return ['name', 'label', 'badge', 'count', 'new-row', 'new-row-label', 'sortable', 'sort-key', 'sort-dir', 'wrap']; }

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
    this._table.classList.toggle('wrap', this.getBoolAttr('wrap'));
    const tr = document.createElement('tr');
    for (const col of this._columns) {
      if (col.type === 'checkbox' && col.selectAll) { tr.appendChild(this._selectAllHeader(col)); continue; }
      const actions = col.type === 'actions';
      const th = this.createElement('th', actions ? ['actions'] : [], actions ? { scope: 'col' } : { 'data-key': col.key, scope: 'col' });
      if (col.icon) { const i = this.createElement('span', ['th-icon']); i.textContent = col.icon; th.appendChild(i); }
      th.appendChild(document.createTextNode(col.label ?? (actions ? '' : col.key)));
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
        // Numbers right-aligned in figures of equal width, as Notion sets them.
        if (col.type === 'number') td.className = 'num';
        td.appendChild(renderPropertyCell(col, row[col.key], row));
        r.appendChild(td);
      }
      this._tbody.appendChild(r);
    }
    this._newRow.textContent = this.getAttribute('new-row-label') || this.str('newPage');
    this._newRow.style.display = this.getBoolAttr('new-row') ? '' : 'none';
    this._syncSelectAll();
  }

  /** The header of a selection column: the cells' own checkbox, named "Select all". */
  _selectAllHeader(col) {
    const th = this.createElement('th', ['select-all'], { scope: 'col' });
    const label = this.createElement('label', ['nk-check']);
    label.appendChild(this.createElement('input', [], { type: 'checkbox', 'aria-label': this.str('selectAll'), 'data-select-all': col.key }));
    th.appendChild(label);
    if (col.width) th.style.width = col.width;
    return th;
  }

  /** Every header box shows its column: checked for all rows, a dash for some, empty for none – and nothing to choose without rows. */
  _syncSelectAll() {
    for (const input of this._thead?.querySelectorAll('input[data-select-all]') ?? []) {
      const key = input.dataset.selectAll, on = this._rows.filter(r => r[key]).length;
      input.checked = on > 0 && on === this._rows.length;
      input.indeterminate = on > 0 && on < this._rows.length;
      input.disabled = !this._rows.length;
    }
  }

  /** A click or Space on a header box: the column for every row, one event. */
  _selectAll(input) {
    const key = input.dataset.selectAll;
    // A dash selects all, as Notion does; only a full column clears.
    const value = !(this._rows.length && this._rows.every(r => r[key]));
    for (const row of this._rows) row[key] = value;
    const focused = this._shadow.activeElement === input;
    this._render();
    // Space should leave the focus where it was – on the new header box.
    if (focused) [...this._thead.querySelectorAll('input[data-select-all]')].find(i => i.dataset.selectAll === key)?.focus();
    this.emit('nk-change', { key, value, all: true, rows: this._rows });
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
      const act = e.target.closest('button[data-action]');
      if (act) {
        const row = this._rowById(act.closest('tr[data-id]')?.dataset.id);
        if (!act.disabled) this.emit('nk-action', { action: act.dataset.action, row, id: row?.id, anchor: act });
        return;
      }
      if (e.target.closest('input[type=checkbox], a')) return;
      const tr = e.target.closest('tr[data-id]');
      if (!tr) return;
      // Which cell: `key` names its column, `cell` is there to anchor an editor to.
      const cell = e.target.closest('td');
      const row = this._rowById(tr.dataset.id);
      this.emit('nk-select', { row, id: row?.id, value: row?.id, key: cell ? this._columns[cell.cellIndex]?.key : undefined, cell });
    };
    this._onChange = (e) => {
      const input = e.target;
      if (input.type !== 'checkbox') return;
      if (input.dataset.selectAll != null) { this._selectAll(input); return; }
      const row = this._rowById(input.dataset.rowId);
      if (row) row[input.dataset.key] = input.checked;
      this._syncSelectAll();
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
  onStringsChanged() { this._render(); }

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
