import { NkElement } from '../../base.js';
import { EMOJI, EMOJI_CATEGORIES } from '../../util/emoji.js';

// <nk-emoji-picker></nk-emoji-picker>
// → <div class="nk-pop"><input class="nk-emoji-search"><div class="nk-emoji-grid">…</div><div class="nk-emoji-cats">…</div></div>
// Built-in set with names for search; `picker.emojis = [{ char, name, cat }]`
// replaces it. A click fires nk-select { emoji }.
class NkEmojiPicker extends NkElement {
  static get observedAttributes() { return ['placeholder', 'value']; }

  render() {
    this._box = this.createElement('div', ['nk-pop']);
    this._search = this.createElement('input', ['nk-emoji-search'], { type: 'search', autocomplete: 'off', 'aria-label': 'Search emoji' });
    this._grid = this.createElement('div', ['nk-emoji-grid'], { role: 'listbox' });
    this._cats = this.createElement('div', ['nk-emoji-cats'], { role: 'tablist' });
    this._box.append(this._search, this._grid, this._cats);
    this._wrapper.appendChild(this._box);
    this._emojis = EMOJI;
    this._cat = EMOJI_CATEGORIES[0].id;
    this._renderCats();
    this._renderGrid();
    this._syncAttrs();
  }

  _syncAttrs() { this._search.placeholder = this.getAttribute('placeholder') || 'Search…'; }

  _renderCats() {
    this._cats.replaceChildren();
    const cats = this._categories();
    for (const cat of cats) {
      const el = this.createElement('span', [], { role: 'tab', 'data-cat': cat.id, title: cat.id });
      el.textContent = cat.icon;
      el.classList.toggle('active', cat.id === this._cat);
      this._cats.appendChild(el);
    }
    this._cats.style.display = cats.length > 1 ? '' : 'none';
  }

  _categories() {
    if (this._catList) return this._catList;
    const seen = new Map();
    for (const e of this._emojis) if (e.cat && !seen.has(e.cat)) seen.set(e.cat, { id: e.cat, icon: e.icon || EMOJI_CATEGORIES.find(c => c.id === e.cat)?.icon || e.char });
    return [...seen.values()];
  }

  _renderGrid() {
    const q = this._search.value.trim().toLowerCase();
    const list = q ? this._emojis.filter(e => (e.name || '').toLowerCase().includes(q) || e.char === q) : this._emojis.filter(e => !e.cat || e.cat === this._cat);
    this._grid.replaceChildren();
    for (const e of list.slice(0, 64)) {
      const s = this.createElement('span', [], { role: 'option', title: e.name || '', 'data-emoji': e.char });
      s.textContent = e.char;
      this._grid.appendChild(s);
    }
    for (const el of this._cats.children) el.classList.toggle('active', !q && el.dataset.cat === this._cat);
  }

  setupEvents() {
    this._onInput = () => this._renderGrid();
    this._onGrid = (e) => { const s = e.target.closest('[data-emoji]'); if (s) this.select(s.dataset.emoji); };
    this._onCats = (e) => { const c = e.target.closest('[data-cat]'); if (!c) return; this._cat = c.dataset.cat; this._search.value = ''; this._renderGrid(); };
    this._onKey = (e) => { if (e.key === 'Enter') { const first = this._grid.querySelector('[data-emoji]'); if (first) this.select(first.dataset.emoji); } };
    this._search.addEventListener('input', this._onInput);
    this._search.addEventListener('keydown', this._onKey);
    this._grid.addEventListener('click', this._onGrid);
    this._cats.addEventListener('click', this._onCats);
  }

  teardownEvents() {
    this._search?.removeEventListener('input', this._onInput);
    this._search?.removeEventListener('keydown', this._onKey);
    this._grid?.removeEventListener('click', this._onGrid);
    this._cats?.removeEventListener('click', this._onCats);
  }

  select(emoji) {
    this.setAttribute('value', emoji);
    this.emit('nk-select', { emoji, value: emoji });
  }

  onAttributeChanged() { this._syncAttrs(); }
  focus(o) { this._search?.focus(o); }

  /** Category strip override: [{ id, icon }]. Emojis without `cat` show in every category. */
  get categories() { return this._categories(); }
  set categories(list) { this._catList = Array.isArray(list) && list.length ? list : null; this._cat = this._categories()[0]?.id; this._renderCats(); this._renderGrid(); }
  get emojis() { return this._emojis; }
  set emojis(list) { this._emojis = Array.isArray(list) ? list : EMOJI; this._cat = this._categories()[0]?.id; this._renderCats(); this._renderGrid(); }
  get value() { return this.getAttribute('value'); }
  set value(v) { this.setAttribute('value', v); }
}

customElements.define('nk-emoji-picker', NkEmojiPicker);
export { NkEmojiPicker };
