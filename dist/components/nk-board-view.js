import { N as NkElement } from './shared/base-6gEcoatG.js';
import { t as tagFor, r as renderPropertyCell } from './shared/property-cell-Dn91uFkf.js';

// <nk-board-view name="board" label="▤ Board" group-by="status" new-row></nk-board-view>
// Groups rows by a select column (default: the first select column); one
// column per option, in option order. Cards show the title column and the
// `meta-keys` (default: date and progress columns). Drag a card onto another
// column to change its value – the row is updated and nk-change fires.
// → <div class="nk-board active"><div class="nk-board-col">…</div>…</div>
class NkBoardView extends NkElement {
  static get observedAttributes() { return ['name', 'label', 'badge', 'count', 'group-by', 'title-key', 'meta-keys', 'new-row']; }

  render() {
    this._board = this.createElement('div', ['nk-board', 'active']);
    this._wrapper.appendChild(this._board);
    this._columns ??= []; this._rows ??= [];
    this._render();
    this.closest('nk-database')?.requestSync?.();
  }

  _groupColumn() {
    const key = this.getAttribute('group-by');
    return this._columns.find(c => c.key === key) || this._columns.find(c => c.type === 'select') || null;
  }
  _titleColumn() {
    const key = this.getAttribute('title-key');
    return this._columns.find(c => c.key === key) || this._columns.find(c => c.title) || this._columns[0] || null;
  }
  _metaColumns() {
    const keys = (this.getAttribute('meta-keys') || '').split(',').map(s => s.trim()).filter(Boolean);
    if (keys.length) return keys.map(k => this._columns.find(c => c.key === k)).filter(Boolean);
    return this._columns.filter(c => c.type === 'date' || c.type === 'progress');
  }

  _render() {
    if (!this._board) return;
    this._board.replaceChildren();
    const group = this._groupColumn(), title = this._titleColumn();
    if (!group) return;
    const options = group.options?.length ? group.options : [...new Set(this._rows.map(r => r[group.key]))].map(v => ({ value: v, label: String(v) }));
    for (const opt of options) {
      const col = this.createElement('div', ['nk-board-col'], { 'data-value': opt.value });
      const header = this.createElement('div', ['nk-board-col-header']);
      const cards = this._rows.filter(r => r[group.key] === opt.value || r[group.key] === opt.label);
      const count = this.createElement('span', ['count']);
      count.textContent = String(cards.length);
      header.append(tagFor(group, opt.value), count);
      col.appendChild(header);
      for (const row of cards) {
        const card = this.createElement('div', ['nk-card'], { draggable: 'true', 'data-id': row.id ?? '', tabindex: '0' });
        const t = this.createElement('div', ['card-title']);
        t.textContent = `${row.icon ? row.icon + ' ' : ''}${title ? row[title.key] ?? '' : ''}`;
        const meta = this.createElement('div', ['card-meta']);
        for (const c of this._metaColumns()) {
          const v = row[c.key];
          if (v === undefined || v === null || v === '') continue;
          const s = document.createElement('span');
          if (c.type === 'progress') s.textContent = `▰ ${v}%`;
          else if (c.type === 'date') s.textContent = `📅 ${v}`;
          else s.appendChild(renderPropertyCell(c, v, row));
          meta.appendChild(s);
        }
        card.append(t, meta);
        col.appendChild(card);
      }
      if (this.getBoolAttr('new-row')) {
        const add = this.createElement('div', ['nk-new-row'], { role: 'button', tabindex: '0', 'data-add': opt.value });
        add.style.padding = '6px 10px';
        add.textContent = '＋';
        col.appendChild(add);
      }
      this._board.appendChild(col);
    }
  }

  setupEvents() {
    this._onClick = (e) => {
      const add = e.target.closest('[data-add]');
      if (add) { this.emit('nk-action', { action: 'new-row', value: add.dataset.add }); return; }
      const card = e.target.closest('.nk-card');
      if (card) { const row = this._rowById(card.dataset.id); this.emit('nk-select', { row, id: row?.id, value: row?.id }); }
    };
    this._onDragStart = (e) => { const card = e.target.closest?.('.nk-card'); if (!card) return; this._dragId = card.dataset.id; e.dataTransfer.effectAllowed = 'move'; try { e.dataTransfer.setData('text/plain', card.dataset.id); } catch {} };
    this._onDragOver = (e) => { if (this._dragId != null && e.target.closest('.nk-board-col')) { e.preventDefault(); e.dataTransfer.dropEffect = 'move'; } };
    this._onDrop = (e) => {
      const col = e.target.closest('.nk-board-col');
      if (!col || this._dragId == null) return;
      e.preventDefault();
      this.move(this._dragId, col.dataset.value);
      this._dragId = null;
    };
    this._board.addEventListener('click', this._onClick);
    this._board.addEventListener('dragstart', this._onDragStart);
    this._board.addEventListener('dragover', this._onDragOver);
    this._board.addEventListener('drop', this._onDrop);
  }

  teardownEvents() {
    this._board?.removeEventListener('click', this._onClick);
    this._board?.removeEventListener('dragstart', this._onDragStart);
    this._board?.removeEventListener('dragover', this._onDragOver);
    this._board?.removeEventListener('drop', this._onDrop);
  }

  /** Moves a row into another column (sets the group value) and reports it. */
  move(id, value) {
    const row = this._rowById(id), group = this._groupColumn();
    if (!row || !group || row[group.key] === value) return;
    row[group.key] = value;
    this._render();
    this.emit('nk-change', { row, key: group.key, value });
  }

  _rowById(id) { return this._rows.find(r => String(r.id) === String(id)); }
  onAttributeChanged() { this._render(); }

  get name() { return this.getAttribute('name') || 'board'; }
  get columns() { return this._columns; }
  set columns(v) { this._columns = Array.isArray(v) ? v : []; this._render(); }
  get rows() { return this._rows; }
  set rows(v) { this._rows = Array.isArray(v) ? v : []; this._render(); }
  set data({ columns, rows }) { this.setData(columns, rows); }
  setData(columns, rows) { this._columns = columns || []; this._rows = rows || []; this._render(); }
  refresh() { this._render(); }
}

customElements.define('nk-board-view', NkBoardView);

export { NkBoardView };
