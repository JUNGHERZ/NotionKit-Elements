import { NkElement } from '../../base.js';
import { renderPropertyCell, textOf, formatDate, formatPercent } from '../../util/property-cell.js';

// <nk-gallery-view name="gallery" label="🖼 Gallery" meta-keys="status,due" new-row></nk-gallery-view>
// The fifth database view (NotionKit 1.14.0): the rows as cards with a
// picture on top, in a grid that fills the row – Notion's gallery, for a
// course catalog or a reading list. `cover-key` names the row field with the
// picture's URL (default: cover); a row without one shows the cover
// gradient, and `no-cover` leaves the pictures out. `size` small | medium |
// large sets the card size, `fit` shows a picture whole instead of cropped.
// Cards show the title column and the `meta-keys` (default: select and date
// columns). Standalone: view.columns = […]; view.rows = […]. Inside
// <nk-database> the database pushes the data. A card fires nk-select
// { row, id, value } on a click, Enter or Space, like a row of the table;
// the add card nk-action { action: 'new-row' }.
// `href-key` (1.17.0) names the row field with the card's address: a row
// with one gets a link, <a class="nk-card" href>, in a .card-item that
// carries the list item's role – to open a course in a new tab or copy its
// address. A plain click, or Enter, fires the same nk-select; cancelling it
// keeps the browser from following the link. A middle click or one with
// Cmd, Ctrl, Shift or Alt fires nothing and does what a link does.
// → <div class="nk-gallery" role="list"><div class="nk-card" role="listitem" tabindex="0">
//     <div class="nk-cover"><img src="…" alt=""></div><div class="card-title">🧭 …</div><div class="card-meta">…</div></div>
//     <div class="card-item" role="listitem"><a class="nk-card" href="/courses/safety">…</a></div>
//     <div class="nk-new-row">＋ New page</div></div>
const SIZES = ['small', 'large'];

class NkGalleryView extends NkElement {
  static get observedAttributes() { return ['name', 'label', 'badge', 'count', 'cover-key', 'no-cover', 'size', 'fit', 'title-key', 'meta-keys', 'href-key', 'new-row', 'new-row-label']; }

  render() {
    this._grid = this.createElement('div', ['nk-gallery'], { role: 'list' });
    this._wrapper.appendChild(this._grid);
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
    if (!this._grid) return;
    const size = this.getAttribute('size');
    this._grid.className = ['nk-gallery', SIZES.includes(size) && size, this.getBoolAttr('fit') && 'fit'].filter(Boolean).join(' ');
    const title = this._titleColumn(), meta = this._metaColumns();
    const coverKey = this.getAttribute('cover-key') || 'cover', covers = !this.getBoolAttr('no-cover');
    const hrefKey = this.getAttribute('href-key');
    this._grid.replaceChildren();
    for (const row of this._rows) {
      const link = hrefKey ? row[hrefKey] : null, href = link && typeof link === 'object' ? link.href : link;
      const card = href
        ? this.createElement('a', ['nk-card'], { href: String(href), 'data-id': row.id ?? '' })
        : this.createElement('div', ['nk-card'], { role: 'listitem', tabindex: '0', 'data-id': row.id ?? '' });
      if (covers) {
        const cover = this.createElement('div', ['nk-cover']);
        if (row[coverKey]) cover.appendChild(this.createElement('img', [], { src: row[coverKey], alt: '' }));
        card.appendChild(cover);
      }
      const t = this.createElement('div', ['card-title']);
      t.textContent = `${row.icon ? row.icon + ' ' : ''}${title ? textOf(row[title.key]) : ''}`;
      const m = this.createElement('div', ['card-meta']);
      for (const c of meta) {
        const v = row[c.key];
        if (v === undefined || v === null || v === '') continue;
        const s = document.createElement('span');
        if (c.type === 'progress') s.textContent = `▰ ${formatPercent(c, v)}`;
        else if (c.type === 'date') s.textContent = `📅 ${formatDate(c, v)}`;
        else s.appendChild(renderPropertyCell(c, v, row));
        m.appendChild(s);
      }
      card.append(t, m);
      if (href) {
        const item = this.createElement('div', ['card-item'], { role: 'listitem' });
        item.appendChild(card);
        this._grid.appendChild(item);
      } else this._grid.appendChild(card);
    }
    if (this.getBoolAttr('new-row')) {
      const add = this.createElement('div', ['nk-new-row'], { role: 'button', tabindex: '0', 'data-add': '' });
      add.textContent = this.getAttribute('new-row-label') || this.str('newPage');
      this._grid.appendChild(add);
    }
  }

  setupEvents() {
    this._onClick = (e) => {
      if (e.target.closest('[data-add]')) { this.emit('nk-action', { action: 'new-row' }); return; }
      const card = e.target.closest('.nk-card');
      if (!card) return;
      // The link contract: a plain left click is a selection, any other one the browser's.
      const link = card.localName === 'a';
      if (link && (e.button !== 0 || e.metaKey || e.ctrlKey || e.shiftKey || e.altKey)) return;
      const row = this._rowById(card.dataset.id);
      if (!this.emit('nk-select', { row, id: row?.id, value: row?.id }) && link) e.preventDefault();
    };
    this._onKey = (e) => {
      if (e.key !== 'Enter' && e.key !== ' ') return;
      if (e.target.localName === 'a') return;  // a link card: Enter is the browser's click, Space scrolls
      if (e.target.matches?.('.nk-card, [data-add]')) { e.preventDefault(); e.target.click(); }
    };
    this._grid.addEventListener('click', this._onClick);
    this._grid.addEventListener('keydown', this._onKey);
  }

  teardownEvents() {
    this._grid?.removeEventListener('click', this._onClick);
    this._grid?.removeEventListener('keydown', this._onKey);
  }

  _rowById(id) { return this._rows.find(r => String(r.id) === String(id)); }
  onAttributeChanged() { this._render(); }
  onStringsChanged() { this._render(); }

  get name() { return this.getAttribute('name') || 'gallery'; }
  get columns() { return this._columns; }
  set columns(v) { this._columns = Array.isArray(v) ? v : []; this._render(); }
  get rows() { return this._rows; }
  set rows(v) { this._rows = Array.isArray(v) ? v : []; this._render(); }
  set data({ columns, rows }) { this.setData(columns, rows); }
  setData(columns, rows) { this._columns = columns || []; this._rows = rows || []; this._render(); }
  refresh() { this._render(); }
}

customElements.define('nk-gallery-view', NkGalleryView);
export { NkGalleryView };
