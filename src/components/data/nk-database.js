import { NkElement } from '../../base.js';

// <nk-database id="db" view="table" add-view>
//   <nk-table-view name="table" label="▦ Table" count></nk-table-view>
//   <nk-board-view name="board" label="▤ Board" group-by="status"></nk-board-view>
// </nk-database>
// db.columns = [{ key: 'name', label: 'Name', type: 'text', icon: '📄', title: true }, { key: 'status', type: 'select', options: [...] }, …];
// db.rows = [{ id: 1, icon: '🧭', name: '…', status: 'done', … }];
// → <div class="nk-database"><div class="nk-db-tabs">…</div>…active view…</div>
// The tabs come from the child views; data is pushed into every view.
class NkDatabase extends NkElement {
  static get observedAttributes() { return ['view', 'add-view']; }

  render() {
    this._box = this.createElement('div', ['nk-database']);
    this._tabs = this.createElement('div', ['nk-db-tabs'], { role: 'tablist' });
    this._slot = document.createElement('slot');
    this._box.append(this._tabs, this._slot);
    this._wrapper.appendChild(this._box);
    this._columns = []; this._rows = [];
    this._sync();
  }

  get views() { return this._slot?.assignedElements().filter(el => /^nk-[a-z]+-view$/.test(el.localName)) ?? []; }

  _sync() {
    if (!this._tabs) return;
    const views = this.views;
    let current = this.getAttribute('view');
    if (!views.some(v => v.name === current)) current = views[0]?.name ?? null;
    this._tabs.replaceChildren();
    for (const v of views) {
      const tab = this.createElement('span', ['nk-db-tab'], { role: 'tab', 'data-view': v.name, tabindex: '0' });
      tab.classList.toggle('active', v.name === current);
      tab.setAttribute('aria-selected', v.name === current ? 'true' : 'false');
      tab.append(document.createTextNode(v.getAttribute('label') || v.name));
      const badge = v.hasAttribute('count') ? String(this._rows.length) : v.getAttribute('badge');
      if (badge) { const b = this.createElement('span', ['badge']); b.textContent = badge; tab.appendChild(b); }
      this._tabs.appendChild(tab);
      v.hidden = v.name !== current;
      // A method call, not a property write: a view that has not been upgraded
      // yet would otherwise get an own `data` property that shadows its setter.
      v.setData?.(this._columns, this._rows);
    }
    if (this.getBoolAttr('add-view')) {
      const add = this.createElement('span', ['nk-db-tab'], { role: 'button', 'data-add': '', tabindex: '0' });
      add.style.color = 'var(--nk-text-tertiary)';
      add.textContent = '＋';
      this._tabs.appendChild(add);
    }
    this._tabs.style.display = views.length ? '' : 'none';
    this._current = current;
  }

  /** Views upgrade after the database; each one asks for a resync once rendered. */
  requestSync() {
    if (this._syncQueued) return;
    this._syncQueued = true;
    queueMicrotask(() => { this._syncQueued = false; this._sync(); });
  }

  setupEvents() {
    this._onClick = (e) => {
      const tab = e.target.closest('[data-view]');
      if (tab) { this.view = tab.dataset.view; return; }
      if (e.target.closest('[data-add]')) this.emit('nk-action', { action: 'add-view' });
    };
    this._onKey = (e) => { if ((e.key === 'Enter' || e.key === ' ') && e.target.closest('[data-view],[data-add]')) { e.preventDefault(); e.target.click(); } };
    this._onSlot = () => this._sync();
    this._tabs.addEventListener('click', this._onClick);
    this._tabs.addEventListener('keydown', this._onKey);
    this._slot.addEventListener('slotchange', this._onSlot);
    this._sync();
  }

  teardownEvents() {
    this._tabs?.removeEventListener('click', this._onClick);
    this._tabs?.removeEventListener('keydown', this._onKey);
    this._slot?.removeEventListener('slotchange', this._onSlot);
  }

  onAttributeChanged(name) {
    const before = this._current;
    this._sync();
    if (name === 'view' && this._current !== before) this.emit('nk-view-change', { view: this._current });
  }

  get columns() { return this._columns; }
  set columns(v) { this._columns = Array.isArray(v) ? v : []; this._sync(); }
  get rows() { return this._rows; }
  set rows(v) { this._rows = Array.isArray(v) ? v : []; this._sync(); }
  get view() { return this._current ?? this.getAttribute('view'); }
  set view(v) { this.setAttribute('view', v); }
  /** Re-renders every view after in-place row mutations. */
  refresh() { this._sync(); }
}

customElements.define('nk-database', NkDatabase);
export { NkDatabase };
