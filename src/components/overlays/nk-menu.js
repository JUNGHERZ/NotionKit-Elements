import { NkElement } from '../../base.js';

// <nk-menu>
//   <nk-menu-item type="label">Page</nk-menu-item>
//   <nk-menu-item icon="✏️" shortcut="⌘E" value="rename">Rename</nk-menu-item>
//   <nk-menu-item type="separator"></nk-menu-item>
//   <nk-menu-item icon="🗑️" danger value="delete">Delete</nk-menu-item>
// </nk-menu>
// → <div class="nk-pop nk-menu" role="menu">…</div>
// ↑↓ move between items, Enter selects, nk-select bubbles from the item.
class NkMenu extends NkElement {
  render() {
    this._box = this.createElement('div', ['nk-pop', 'nk-menu'], { role: 'menu' });
    this._box.appendChild(document.createElement('slot'));
    this._wrapper.appendChild(this._box);
  }

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
  }

  teardownEvents() { this.removeEventListener('keydown', this._onKey); }

  /** Focuses the first item (called by a popover when it opens). */
  focusFirst() { this.items[0]?.focus(); }
}

customElements.define('nk-menu', NkMenu);
export { NkMenu };
