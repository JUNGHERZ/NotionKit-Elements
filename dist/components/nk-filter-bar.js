import { N as NkElement } from './shared/base-6gEcoatG.js';

// <nk-filter-bar search placeholder="Search rows …"></nk-filter-bar>
// bar.filters = [{ key: 'status', label: 'Status: Done', value: 'done' }];
// Composed from existing classes (nk-btn secondary small, nk-input, nk-tag):
// filter / sort buttons fire nk-action, chips remove on ×, search and chip
// changes fire nk-change { filters, search }. The wrapper is layout only.
class NkFilterBar extends NkElement {
  static get observedAttributes() { return ['search', 'placeholder', 'no-filter', 'no-sort', 'value']; }

  render() {
    this._bar = document.createElement('div');
    this._bar.style.cssText = 'display:flex;align-items:center;gap:6px;flex-wrap:wrap;margin:8px 0';
    this._filterBtn = this.createElement('button', ['nk-btn', 'secondary', 'small'], { type: 'button', 'data-action': 'filter' });
    this._filterBtn.textContent = '⚲ Filter';
    this._sortBtn = this.createElement('button', ['nk-btn', 'secondary', 'small'], { type: 'button', 'data-action': 'sort' });
    this._sortBtn.textContent = '↕ Sort';
    this._chips = document.createElement('span');
    this._chips.style.cssText = 'display:inline-flex;gap:4px;flex-wrap:wrap';
    this._input = this.createElement('input', ['nk-input'], { type: 'search', autocomplete: 'off' });
    this._input.style.marginLeft = 'auto';
    this._bar.append(this._filterBtn, this._sortBtn, this._chips, document.createElement('slot'), this._input);
    this._wrapper.appendChild(this._bar);
    this._filters = [];
    this._sync();
  }

  _sync() {
    this._filterBtn.style.display = this.getBoolAttr('no-filter') ? 'none' : '';
    this._sortBtn.style.display = this.getBoolAttr('no-sort') ? 'none' : '';
    this._input.style.display = this.getBoolAttr('search') ? '' : 'none';
    this._input.placeholder = this.getAttribute('placeholder') || 'Search …';
    if (this.hasAttribute('value') && this._input.value !== this.getAttribute('value')) this._input.value = this.getAttribute('value');
    this._chips.replaceChildren();
    this._filters.forEach((f, i) => {
      const chip = this.createElement('span', ['nk-tag', f.color || 'blue'], { 'data-index': i });
      chip.style.cursor = 'pointer';
      chip.textContent = `${f.label ?? `${f.key}: ${f.value}`} ×`;
      chip.title = 'Remove filter';
      this._chips.appendChild(chip);
    });
  }

  setupEvents() {
    this._onClick = (e) => {
      const btn = e.target.closest('[data-action]');
      if (btn) { this.emit('nk-action', { action: btn.dataset.action }); return; }
      const chip = e.target.closest('[data-index]');
      if (chip) { this._filters.splice(Number(chip.dataset.index), 1); this._sync(); this._emitChange(); }
    };
    this._onInput = () => { clearTimeout(this._debounce); this._debounce = setTimeout(() => this._emitChange(), 150); };
    this._bar.addEventListener('click', this._onClick);
    this._input.addEventListener('input', this._onInput);
  }

  teardownEvents() {
    this._bar?.removeEventListener('click', this._onClick);
    this._input?.removeEventListener('input', this._onInput);
    clearTimeout(this._debounce);
  }

  _emitChange() { this.emit('nk-change', { filters: [...this._filters], search: this._input.value }); }
  onAttributeChanged() { this._sync(); }

  get filters() { return this._filters; }
  set filters(v) { this._filters = Array.isArray(v) ? v : []; this._sync(); }
  get value() { return this._input?.value ?? ''; }
  set value(v) { if (this._input) this._input.value = v ?? ''; }
  /** Applies filters + search to rows: equality per filter key, substring search over every string field. */
  apply(rows) {
    const q = this.value.trim().toLowerCase();
    return rows.filter(r => this._filters.every(f => r[f.key] === f.value) && (!q || Object.values(r).some(v => String(typeof v === 'object' && v ? v.name ?? '' : v ?? '').toLowerCase().includes(q))));
  }
}

customElements.define('nk-filter-bar', NkFilterBar);

export { NkFilterBar };
