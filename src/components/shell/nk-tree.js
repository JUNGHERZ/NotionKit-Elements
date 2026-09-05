import { NkElement } from '../../base.js';

// <nk-tree>
//   <nk-section-label addable>Favourites</nk-section-label>
//   <nk-tree-item icon="📊" open>Project overview
//     <nk-tree-item icon="🚀" active>NotionKit MVP</nk-tree-item>
//   </nk-tree-item>
// </nk-tree>
//
// A container for tree items: keeps a single `active` item (listening to
// nk-select from any depth), gives the group one tab stop with arrow-key
// navigation, and can render items from data:
//   tree.data = [{ label, icon, value, href, open, active, children: [...] }]
const KEYS = new Set(['ArrowUp', 'ArrowDown', 'ArrowLeft', 'ArrowRight', 'Home', 'End']);

class NkTree extends NkElement {
  static get observedAttributes() { return ['manual']; }

  render() {
    const box = this.createElement('div', [], { role: 'tree' });
    box.appendChild(document.createElement('slot'));
    this._wrapper.appendChild(box);
    this._box = box;
  }

  /** Makes `item` the single active item (called by the item after nk-select was not cancelled). */
  setActive(item) {
    if (this.getBoolAttr('manual')) return;
    for (const other of this.querySelectorAll('nk-tree-item[active]')) if (other !== item) other.removeAttribute('active');
    item.setAttribute('active', '');
    this._syncTabIndex(item);
  }

  setupEvents() {
    this._onKey = (e) => {
      if (!KEYS.has(e.key) || e.ctrlKey || e.metaKey || e.altKey) return;
      const item = e.target.closest?.('nk-tree-item');
      if (!item) return;
      const visible = this.visibleItems();
      const i = visible.indexOf(item);
      if (i < 0) return;
      let next = null;
      switch (e.key) {
        case 'ArrowDown': next = visible[i + 1]; break;
        case 'ArrowUp': next = visible[i - 1]; break;
        case 'Home': next = visible[0]; break;
        case 'End': next = visible[visible.length - 1]; break;
        case 'ArrowRight':
          if (item.hasChildren && !item.open) item.open = true;
          else if (item.hasChildren) next = item.querySelector('nk-tree-item');
          break;
        case 'ArrowLeft':
          if (item.hasChildren && item.open) item.open = false;
          else next = item.parentElement?.closest('nk-tree-item');
          break;
      }
      e.preventDefault();
      if (next) { this._syncTabIndex(next); next.focus(); }
    };
    this._onSlot = () => this._syncTabIndex();
    this.addEventListener('keydown', this._onKey);
    this._box.querySelector('slot').addEventListener('slotchange', this._onSlot);
    this._syncTabIndex();
  }

  teardownEvents() {
    this.removeEventListener('keydown', this._onKey);
    this._box?.querySelector('slot').removeEventListener('slotchange', this._onSlot);
  }

  /** Items whose every ancestor item inside this tree is open – i.e. rendered. */
  visibleItems() {
    return [...this.querySelectorAll('nk-tree-item')].filter(item => {
      for (let p = item.parentElement?.closest('nk-tree-item'); p && this.contains(p); p = p.parentElement?.closest('nk-tree-item')) {
        if (!p.open) return false;
      }
      return true;
    });
  }

  /** Items upgrade after the tree; each one asks for a resync once rendered. */
  requestSync() {
    if (this._syncQueued) return;
    this._syncQueued = true;
    queueMicrotask(() => { this._syncQueued = false; this._syncTabIndex(); });
  }

  _syncTabIndex(focusable) {
    const items = [...this.querySelectorAll('nk-tree-item')];
    if (!items.length) return;
    const visible = this.visibleItems();
    const target = focusable || visible.find(i => i.active) || visible[0];
    // A method call, not a property write: assigning a property to an element
    // that has not been upgraded yet would create an own property that shadows
    // the accessor forever.
    for (const item of items) item.setTabbable?.(item === target);
  }

  /** Renders items from data into the light DOM (replacing existing items). */
  set data(list) {
    this._data = list;
    const build = (nodes) => nodes.map(n => {
      const item = document.createElement('nk-tree-item');
      if (n.icon) item.setAttribute('icon', n.icon);
      if (n.value != null) item.setAttribute('value', n.value);
      if (n.href) item.setAttribute('href', n.href);
      if (n.open) item.setAttribute('open', '');
      if (n.active) item.setAttribute('active', '');
      item.append(document.createTextNode(n.label ?? ''), ...build(n.children || []));
      return item;
    });
    for (const old of this.querySelectorAll(':scope > nk-tree-item')) old.remove();
    this.append(...build(list || []));
  }
  get data() { return this._data; }

  get activeItem() { return this.querySelector('nk-tree-item[active]'); }
  get value() { return this.activeItem?.value ?? null; }
}

customElements.define('nk-tree', NkTree);
export { NkTree };
