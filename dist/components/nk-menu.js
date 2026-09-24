import { NkElement } from './base.js';
import { d as deepActiveElement } from './shared/focus-BNAChOXO.js';
import { p as placeUnder } from './shared/floating-CxHxy-Cb.js';
import '@jungherz-de/notionkit/notionkit-styles.js';

// <nk-menu>
//   <nk-menu-item type="label">Page</nk-menu-item>
//   <nk-menu-item icon="✏️" shortcut="⌘E" value="rename">Rename</nk-menu-item>
//   <nk-menu-item type="separator"></nk-menu-item>
//   <nk-menu-item icon="🗑️" danger value="delete">Delete</nk-menu-item>
// </nk-menu>
// → <div class="nk-pop nk-menu" role="menu">…</div>
// ↑↓ move between items, Enter selects, nk-select bubbles from the item.
//
// <nk-menu floating sheet> is a menu over the page (NotionKit 1.7.0): it
// fades in like the palette when `open` is set and is a bottom sheet on a
// phone. The host becomes the fixed box you position – show(anchor) puts it
// under the anchor, right edges aligned (align="start": left edges). A tap
// outside closes it and reaches nothing else; Escape and a chosen item
// close it too, a switch row does not. Opened from the keyboard, focus moves
// to the first item; closing returns it to where it was.
const floatSheet = new CSSStyleSheet();
floatSheet.replaceSync(`:host([floating]) { display: block; position: fixed; z-index: 60; pointer-events: none; }`);

class NkMenu extends NkElement {
  static get hostStyles() { return floatSheet; }
  static get observedAttributes() { return ['floating', 'sheet', 'open', 'align']; }

  render() {
    this._box = this.createElement('div', ['nk-pop', 'nk-menu'], { role: 'menu' });
    this._box.appendChild(document.createElement('slot'));
    this._wrapper.appendChild(this._box);
    this._syncMode();
  }

  _syncMode() {
    this._box.classList.toggle('floating', this.getBoolAttr('floating'));
    this._box.classList.toggle('sheet', this.getBoolAttr('sheet'));
    this._box.classList.toggle('open', this.getBoolAttr('open'));
  }

  onAttributeChanged(name) {
    this._syncMode();
    if (name !== 'open') return;
    const open = this.getBoolAttr('open');
    // aria-expanded belongs on the control itself, inside a host such as <nk-btn>.
    if (this._anchor) (this._anchor.shadowRoot?.querySelector('button, a[href]') ?? this._anchor).setAttribute('aria-expanded', String(open));
    if (open) {
      this._returnFocus = deepActiveElement();
      if (this._returnFocus?.matches(':focus-visible')) requestAnimationFrame(() => this.focusFirst());
      document.addEventListener('click', this._onOutside, true);
    } else {
      document.removeEventListener('click', this._onOutside, true);
      const back = this._returnFocus;
      this._returnFocus = null;
      if (back?.isConnected && this.contains(document.activeElement)) back.focus({ preventScroll: true });
    }
    this.emit('nk-toggle', { open });
  }

  /** Opens under `anchor` (any element, display: contents hosts included). */
  show(anchor) {
    if (anchor) {
      this._anchor = anchor;
      placeUnder(this, anchor, this.getAttribute('align'));
    }
    this.setBoolAttr('open', true);
  }
  close() { this.setBoolAttr('open', false); }
  toggle(anchor) { this.getBoolAttr('open') ? this.close() : this.show(anchor); }
  get open() { return this.getBoolAttr('open'); }
  set open(v) { this.setBoolAttr('open', v); }

  get items() { return [...this.querySelectorAll(':scope > nk-menu-item')].filter(i => i.selectable); }

  setupEvents() {
    this._onKey = (e) => {
      const dir = { ArrowDown: 1, ArrowUp: -1 }[e.key];
      const current = e.target.closest?.('nk-menu-item');
      const items = this.items;
      if (!items.length) return;
      if (dir) {
        e.preventDefault();
        const i = items.indexOf(current);
        items[(i + dir + items.length) % items.length].focus();
      } else if ((e.key === 'Enter' || e.key === ' ') && current) {
        e.preventDefault(); current.select();
      }
    };
    this.addEventListener('keydown', this._onKey);
    // Floating: outside taps close and go nowhere else; Escape and a chosen item close.
    this._onOutside = (e) => {
      const path = e.composedPath();
      if (path.includes(this) || (this._anchor && path.includes(this._anchor))) return;
      e.preventDefault(); e.stopPropagation();
      this.close();
    };
    // Captured, so a menu inside a modal or sheet closes before they do.
    this._onEscape = (e) => { if (e.key === 'Escape' && this.getBoolAttr('floating') && this.getBoolAttr('open')) { e.stopPropagation(); this.close(); } };
    this._onSelect = () => { if (this.getBoolAttr('floating')) this.close(); };
    document.addEventListener('keydown', this._onEscape, true);
    this.addEventListener('nk-select', this._onSelect);
    if (this.getBoolAttr('open')) document.addEventListener('click', this._onOutside, true);
  }

  teardownEvents() {
    this.removeEventListener('keydown', this._onKey);
    document.removeEventListener('keydown', this._onEscape, true);
    this.removeEventListener('nk-select', this._onSelect);
    document.removeEventListener('click', this._onOutside, true);
  }

  /** Focuses the first item (called by a popover when it opens). */
  focusFirst() { this.items[0]?.focus(); }
}

customElements.define('nk-menu', NkMenu);

export { NkMenu };
