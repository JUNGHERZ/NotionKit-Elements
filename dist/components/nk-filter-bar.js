import { NkElement } from './base.js';
import '@jungherz-de/notionkit/notionkit-styles.js';

// <nk-filter-bar add no-filter no-sort></nk-filter-bar>
// bar.filters = [{ key: 'status', value: 'done', op: 'is-not', label: 'Status: Open' }];
// The filters in effect as NotionKit's filter pills (1.7.0), no inline style:
// → <div class="nk-filter-row">[Filter][Sort]
//     <span class="nk-filter-pill active"><button>Status: Open</button><button class="fp-remove">×</button></span>…
//     <button class="nk-filter-pill add">＋ Filter</button> …slot… [search]</div>
// Filter and Sort are .nk-db-tool buttons (hide them with no-filter / no-sort
// when the database toolbar carries its own); they fire nk-action. A pill's
// label fires nk-action { action: 'edit', index, filter }, the add pill
// nk-action { action: 'add' } – each with the clicked button as `anchor`, to
// open a menu under it. × removes the filter; every change to filters or
// search fires nk-change { filters, search }. In slot="filters" of
// <nk-database> the row sits right under the view tabs. The texts are
// attributes, for other languages: filter-label, sort-label, add-label,
// remove-label (the × reads "<remove-label>: <pill>") and placeholder.
class NkFilterBar extends NkElement {
  static get observedAttributes() { return ['search', 'placeholder', 'no-filter', 'no-sort', 'value', 'add', 'add-label', 'filter-label', 'sort-label', 'remove-label']; }

  render() {
    this._row = this.createElement('div', ['nk-filter-row']);
    this._filterBtn = this.createElement('button', ['nk-db-tool'], { type: 'button', 'data-action': 'filter' });
    this._sortBtn = this.createElement('button', ['nk-db-tool'], { type: 'button', 'data-action': 'sort' });
    this._pillStart = document.createComment('pills');
    this._addBtn = this.createElement('button', ['nk-filter-pill', 'add'], { type: 'button', 'data-action': 'add' });
    this._input = this.createElement('input', ['nk-input'], { type: 'search', autocomplete: 'off' });
    this._row.append(this._filterBtn, this._sortBtn, this._pillStart, this._addBtn, document.createElement('slot'), this._input);
    this._wrapper.appendChild(this._row);
    this._filters = [];
    this._sync();
  }

  _sync() {
    this._filterBtn.textContent = this.getAttribute('filter-label') || 'Filter';
    this._filterBtn.hidden = this.getBoolAttr('no-filter');
    this._filterBtn.classList.toggle('active', this._filters.length > 0);
    this._sortBtn.textContent = this.getAttribute('sort-label') || 'Sort';
    this._sortBtn.hidden = this.getBoolAttr('no-sort');
    this._addBtn.textContent = this.getAttribute('add-label') || '＋ Filter';
    this._addBtn.hidden = !this.getBoolAttr('add');
    this._input.hidden = !this.getBoolAttr('search');
    this._input.placeholder = this.getAttribute('placeholder') || 'Search …';
    if (this.hasAttribute('value') && this._input.value !== this.getAttribute('value')) this._input.value = this.getAttribute('value');
    for (const old of this._row.querySelectorAll('[data-pill]')) old.remove();
    const removeLabel = this.getAttribute('remove-label') || 'Remove filter';
    this._pillStart.after(...this._filters.map((f, i) => {
      const pill = this.createElement('span', ['nk-filter-pill', 'active'], { 'data-pill': i });
      const label = this.createElement('button', [], { type: 'button', 'data-edit': i });
      label.textContent = f.label ?? `${f.key}: ${f.value}`;
      const remove = this.createElement('button', ['fp-remove'], { type: 'button', 'data-remove': i, 'aria-label': `${removeLabel}: ${label.textContent}` });
      remove.textContent = '×';
      pill.append(label, remove);
      return pill;
    }));
  }

  setupEvents() {
    this._onClick = (e) => {
      const remove = e.target.closest('[data-remove]');
      if (remove) { this._filters.splice(Number(remove.dataset.remove), 1); this._sync(); this._emitChange(); return; }
      const edit = e.target.closest('[data-edit]');
      if (edit) { const index = Number(edit.dataset.edit); this.emit('nk-action', { action: 'edit', index, filter: this._filters[index], anchor: edit }); return; }
      const btn = e.target.closest('[data-action]');
      if (btn) this.emit('nk-action', { action: btn.dataset.action, anchor: btn });
    };
    this._onInput = () => { clearTimeout(this._debounce); this._debounce = setTimeout(() => this._emitChange(), 150); };
    this._row.addEventListener('click', this._onClick);
    this._input.addEventListener('input', this._onInput);
  }

  teardownEvents() {
    this._row?.removeEventListener('click', this._onClick);
    this._input?.removeEventListener('input', this._onInput);
    clearTimeout(this._debounce);
  }

  _emitChange() { this.emit('nk-change', { filters: [...this._filters], search: this._input.value }); }
  onAttributeChanged() { this._sync(); }

  get filters() { return this._filters; }
  set filters(v) { this._filters = Array.isArray(v) ? v : []; if (this._row) this._sync(); }
  get value() { return this._input?.value ?? ''; }
  set value(v) { if (this._input) this._input.value = v ?? ''; }
  /**
   * Applies filters and search to rows: a filter keeps rows where row[key]
   * equals value – or differs from it with op: 'is-not'; the search looks
   * for the text in every string field (a person's name).
   */
  apply(rows) {
    const q = this.value.trim().toLowerCase();
    return rows.filter(r => this._filters.every(f => (f.op === 'is-not' ? r[f.key] !== f.value : r[f.key] === f.value))
      && (!q || Object.values(r).some(v => String(typeof v === 'object' && v ? v.name ?? '' : v ?? '').toLowerCase().includes(q))));
  }
}

customElements.define('nk-filter-bar', NkFilterBar);

export { NkFilterBar };
