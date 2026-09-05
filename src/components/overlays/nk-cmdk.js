import { NkElement } from '../../base.js';
import { lockScroll, unlockScroll, inertOutside } from '../../util/focus.js';
import { fuzzyScore } from '../../util/fuzzy.js';

// <nk-cmdk id="palette" placeholder="Search or type a command …"></nk-cmdk>
// palette.commands = [
//   { group: 'Pages',   items: [{ id: 'mvp', icon: '🚀', label: 'NotionKit MVP', keywords: 'project' }] },
//   { group: 'Actions', items: [{ id: 'theme', icon: '🌙', label: 'Toggle theme', shortcut: '⌘⇧L', action: () => … }] },
// ];
// → <div class="nk-cmdk-backdrop open"><div class="nk-cmdk"><div class="nk-cmdk-input-row">🔍<input><kbd>esc</kbd></div>
//     <div class="nk-cmdk-list">…</div><div class="nk-cmdk-footer">…</div></div></div>
// mod+K toggles (attribute `hotkey`), ↑↓ move, Enter picks (nk-command +
// item.action), Escape / backdrop close. Fuzzy subsequence search over
// label + keywords. Put the element directly under <body>.
class NkCmdk extends NkElement {
  static get observedAttributes() { return ['open', 'hotkey', 'placeholder']; }

  render() {
    this._backdrop = this.createElement('div', ['nk-cmdk-backdrop']);
    this._backdrop.inert = true;
    this._box = this.createElement('div', ['nk-cmdk'], { role: 'dialog', 'aria-modal': 'true', 'aria-label': 'Command palette' });
    const row = this.createElement('div', ['nk-cmdk-input-row']);
    const glass = document.createElement('span');
    glass.style.fontSize = '15px';
    glass.textContent = '🔍';
    this._input = this.createElement('input', [], { type: 'text', autocomplete: 'off', role: 'combobox', 'aria-expanded': 'true', 'aria-autocomplete': 'list' });
    const esc = this.createElement('kbd', ['nk-kbd']);
    esc.textContent = 'esc';
    row.append(glass, this._input, esc);
    this._list = this.createElement('div', ['nk-cmdk-list'], { role: 'listbox', id: 'list' });
    this._input.setAttribute('aria-controls', 'list');
    this._footer = this.createElement('div', ['nk-cmdk-footer']);
    const footerSlot = this.createElement('slot', [], { name: 'footer' });
    footerSlot.innerHTML = '<span><kbd class="nk-kbd">↑</kbd><kbd class="nk-kbd">↓</kbd> navigate</span><span><kbd class="nk-kbd">↵</kbd> open</span><span><kbd class="nk-kbd">⌘</kbd><kbd class="nk-kbd">K</kbd> toggle</span>';
    this._footer.appendChild(footerSlot);
    this._box.append(row, this._list, this._footer);
    this._backdrop.appendChild(this._box);
    this._wrapper.appendChild(this._backdrop);
    this._commands = [];
    this._index = 0;
    this._syncAttrs();
    this._renderList();
    this._syncOpen();
  }

  _syncAttrs() { this._input.placeholder = this.getAttribute('placeholder') || 'Search or type a command …'; }

  /** Filtered, flat list in group order, best matches first within a group. */
  results() {
    const q = this._input?.value ?? '';
    const out = [];
    for (const group of this._commands) {
      const scored = (group.items || []).map(item => ({ item, group: group.group, score: fuzzyScore(q, `${item.label} ${item.keywords || ''}`) })).filter(r => r.score > 0);
      scored.sort((a, b) => b.score - a.score);
      out.push(...scored);
    }
    return out;
  }

  _renderList() {
    if (!this._list) return;
    const results = this.results();
    this._index = Math.min(this._index, Math.max(0, results.length - 1));
    this._list.replaceChildren();
    if (!results.length) {
      const empty = this.createElement('div', ['nk-cmdk-empty']);
      empty.textContent = `No results for “${this._input.value}”`;
      this._list.appendChild(empty);
      this._input.removeAttribute('aria-activedescendant');
      return;
    }
    let lastGroup = null;
    results.forEach((r, i) => {
      if (r.group && r.group !== lastGroup) {
        const g = this.createElement('div', ['nk-cmdk-group']);
        g.textContent = r.group;
        this._list.appendChild(g);
        lastGroup = r.group;
      }
      const el = this.createElement('div', ['nk-cmdk-item'], { role: 'option', id: `opt-${i}`, 'data-index': i });
      el.classList.toggle('selected', i === this._index);
      el.setAttribute('aria-selected', i === this._index ? 'true' : 'false');
      const icon = this.createElement('span', ['m-icon']);
      icon.textContent = r.item.icon || '';
      const label = document.createElement('span');
      label.textContent = r.item.label;
      el.append(icon, label);
      if (r.item.shortcut) { const sc = this.createElement('span', ['m-shortcut']); sc.textContent = r.item.shortcut; el.appendChild(sc); }
      this._list.appendChild(el);
    });
    this._input.setAttribute('aria-activedescendant', `opt-${this._index}`);
  }

  _move(dir) {
    const n = this.results().length;
    if (!n) return;
    this._index = (this._index + dir + n) % n;
    for (const el of this._list.querySelectorAll('.nk-cmdk-item')) {
      const on = Number(el.dataset.index) === this._index;
      el.classList.toggle('selected', on);
      el.setAttribute('aria-selected', on ? 'true' : 'false');
      if (on) el.scrollIntoView({ block: 'nearest' });
    }
    this._input.setAttribute('aria-activedescendant', `opt-${this._index}`);
  }

  pick(index = this._index) {
    const r = this.results()[index];
    if (!r) return;
    const query = this._input.value;
    this.close();
    const ok = this.emit('nk-command', { id: r.item.id ?? r.item.label, item: r.item, query });
    if (ok && typeof r.item.action === 'function') r.item.action(r.item);
  }

  _matchesHotkey(e) {
    const spec = (this.getAttribute('hotkey') || 'mod+k').toLowerCase().split('+');
    const key = spec.pop();
    const mod = spec.includes('mod') ? (e.metaKey || e.ctrlKey) : true;
    const shift = spec.includes('shift') ? e.shiftKey : !e.shiftKey;
    const alt = spec.includes('alt') ? e.altKey : !e.altKey;
    return mod && shift && alt && e.key.toLowerCase() === key;
  }

  _syncOpen() {
    const open = this.getBoolAttr('open');
    this._backdrop.classList.toggle('open', open);
    this._backdrop.inert = !open;
    if (open === this._wasOpen) return;
    this._wasOpen = open;
    if (open) {
      this._returnFocus = document.activeElement;
      this._input.value = '';
      this._index = 0;
      this._renderList();
      lockScroll();
      this._undoInert = inertOutside(this);
      requestAnimationFrame(() => this._input.focus({ preventScroll: true }));
    } else {
      unlockScroll();
      this._undoInert?.(); this._undoInert = null;
      const back = this._returnFocus;
      if (back && typeof back.focus === 'function' && back.isConnected) back.focus({ preventScroll: true });
      this._returnFocus = null;
    }
  }

  setupEvents() {
    this._onDocKey = (e) => {
      if (this._matchesHotkey(e)) { e.preventDefault(); this.toggle(); return; }
      if (e.key === 'Escape' && this.getBoolAttr('open')) { e.stopPropagation(); this.close(); }
    };
    this._onInput = () => { this._index = 0; this._renderList(); };
    this._onInputKey = (e) => {
      if (e.key === 'ArrowDown') { e.preventDefault(); this._move(1); }
      else if (e.key === 'ArrowUp') { e.preventDefault(); this._move(-1); }
      else if (e.key === 'Enter') { e.preventDefault(); this.pick(); }
    };
    this._onListClick = (e) => { const el = e.target.closest('.nk-cmdk-item'); if (el) this.pick(Number(el.dataset.index)); };
    this._onListMove = (e) => { const el = e.target.closest('.nk-cmdk-item'); if (el && Number(el.dataset.index) !== this._index) { this._index = Number(el.dataset.index); this._move(0); } };
    this._onListDown = (e) => e.preventDefault();   // keep the input focused
    this._onBackdrop = (e) => { if (e.target === this._backdrop) this.close(); };
    document.addEventListener('keydown', this._onDocKey);
    this._input.addEventListener('input', this._onInput);
    this._input.addEventListener('keydown', this._onInputKey);
    this._list.addEventListener('click', this._onListClick);
    this._list.addEventListener('mousemove', this._onListMove);
    this._list.addEventListener('mousedown', this._onListDown);
    this._backdrop.addEventListener('click', this._onBackdrop);
  }

  teardownEvents() {
    document.removeEventListener('keydown', this._onDocKey);
    this._input?.removeEventListener('input', this._onInput);
    this._input?.removeEventListener('keydown', this._onInputKey);
    this._list?.removeEventListener('click', this._onListClick);
    this._list?.removeEventListener('mousemove', this._onListMove);
    this._list?.removeEventListener('mousedown', this._onListDown);
    this._backdrop?.removeEventListener('click', this._onBackdrop);
    if (this._wasOpen) { unlockScroll(); this._undoInert?.(); this._undoInert = null; this._wasOpen = false; }
  }

  onAttributeChanged(name) {
    if (name === 'open') { this._syncOpen(); this.emit('nk-toggle', { open: this.getBoolAttr('open') }); }
    else this._syncAttrs();
  }

  show() { this.setBoolAttr('open', true); }
  close() { this.setBoolAttr('open', false); }
  toggle() { this.setBoolAttr('open', !this.getBoolAttr('open')); }

  get commands() { return this._commands; }
  set commands(list) { this._commands = Array.isArray(list) ? list : []; this._index = 0; this._renderList(); }
  get open() { return this.getBoolAttr('open'); }
  set open(v) { this.setBoolAttr('open', v); }
  get query() { return this._input?.value ?? ''; }
  set query(v) { if (this._input) { this._input.value = v; this._index = 0; this._renderList(); } }
}

customElements.define('nk-cmdk', NkCmdk);
export { NkCmdk };
