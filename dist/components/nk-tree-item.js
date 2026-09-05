import { N as NkElement } from './shared/base-6gEcoatG.js';

// <nk-tree-item icon="📊" value="overview" open>
//   Project overview
//   <nk-tree-item icon="🚀" value="mvp" active>NotionKit MVP</nk-tree-item>
// </nk-tree-item>
//
// → <div class="nk-tree-item active"><span class="nk-toggle-arrow open">▸</span>
//     <span class="icon">📊</span><span class="label">…</span>
//     <span class="actions"><span>＋</span><span>⋯</span></span></div>
//   <div class="nk-tree-children">…</div>
//
// Both halves – the row and the .nk-tree-children box that must be its next
// sibling – are rendered here. Slots are assigned manually: text becomes the
// label, nested <nk-tree-item>s become the children, `slot="icon"` /
// `slot="end"` nodes go where they say. The hover actions are shadow-internal
// (`.nk-tree-item:hover .actions` is a hover-parent rule) and report through
// nk-action.
class NkTreeItem extends NkElement {
  static get slotAssignment() { return 'manual'; }
  static get observedAttributes() { return ['label', 'icon', 'value', 'href', 'active', 'open', 'compact', 'no-actions']; }

  render() {
    this._row = this.createElement('div', ['nk-tree-item'], { role: 'treeitem', tabindex: '-1' });
    this._arrow = this.createElement('span', ['nk-toggle-arrow'], { 'aria-hidden': 'true' });
    this._arrow.textContent = '▸';
    this._iconSlot = this.createElement('slot', [], { name: 'icon' });
    this._icon = this.createElement('span', ['icon']);
    this._iconSlot.appendChild(this._icon);
    this._label = this.createElement('span', ['label']);
    this._labelSlot = this.createElement('slot', [], { name: 'label' });
    this._labelText = document.createTextNode('');
    this._labelSlot.appendChild(this._labelText);
    this._label.appendChild(this._labelSlot);
    this._actions = this.createElement('span', ['actions']);
    for (const [action, glyph, title] of [['add', '＋', 'Add'], ['more', '⋯', 'More']]) {
      const b = this.createElement('span', [], { 'data-action': action, role: 'button', title });
      b.textContent = glyph;
      this._actions.appendChild(b);
    }
    this._endSlot = this.createElement('slot', [], { name: 'end' });
    this._row.append(this._arrow, this._iconSlot, this._label, this._actions, this._endSlot);
    this._children = this.createElement('div', ['nk-tree-children'], { role: 'group' });
    this._childSlot = this.createElement('slot', [], { name: 'children' });
    this._children.appendChild(this._childSlot);
    this._wrapper.append(this._row, this._children);
    this._sync();
    this.closest('nk-tree')?.requestSync?.();
  }

  /** Routes light-DOM nodes: nested items → children, slot="icon"/"end" → there, the rest → label. */
  assignSlots() {
    if (!this._row) return;
    const icon = [], end = [], children = [], label = [];
    for (const node of this.childNodes) {
      if (node.nodeType === Node.ELEMENT_NODE) {
        const slot = node.getAttribute('slot');
        if (slot === 'icon') icon.push(node);
        else if (slot === 'end') end.push(node);
        else if (node.localName === 'nk-tree-item') children.push(node);
        else label.push(node);
      } else if (node.nodeType === Node.TEXT_NODE && node.data.trim()) {
        label.push(node);
      }
    }
    this._iconSlot.assign(...icon);
    this._endSlot.assign(...end);
    this._childSlot.assign(...children);
    this._labelSlot.assign(...(this.hasAttribute('label') ? [] : label));
    this._hasChildren = children.length > 0;
    this._hasEnd = end.length > 0;
    this._sync();
  }

  _sync() {
    const active = this.getBoolAttr('active'), open = this.getBoolAttr('open');
    this._row.classList.toggle('active', active);
    this._row.classList.toggle('compact', this.getBoolAttr('compact'));
    this._row.setAttribute('aria-selected', active ? 'true' : 'false');
    this._arrow.classList.toggle('open', open);
    this._arrow.style.display = this._hasChildren ? '' : 'none';
    if (this._hasChildren) this._row.setAttribute('aria-expanded', open ? 'true' : 'false');
    else this._row.removeAttribute('aria-expanded');
    this._children.classList.toggle('collapsed', !open || !this._hasChildren);
    this._icon.textContent = this.getAttribute('icon') || '';
    this._icon.style.display = this.getAttribute('icon') ? '' : 'none';
    this._labelText.data = this.getAttribute('label') || '';
    // .actions is display:none until hover (a hover-parent rule); `hidden`
    // would lose to that rule, so the block is detached instead.
    const wantActions = !this.getBoolAttr('no-actions') && !this._hasEnd;
    if (wantActions && !this._actions.isConnected) this._row.insertBefore(this._actions, this._endSlot);
    if (!wantActions && this._actions.isConnected) this._actions.remove();
    const href = this.getAttribute('href');
    href ? this._row.setAttribute('data-href', href) : this._row.removeAttribute('data-href');
  }

  setupEvents() {
    this._onRowClick = (e) => {
      const action = e.target.closest?.('[data-action]');
      if (action) { e.stopPropagation(); this.emit('nk-action', { action: action.dataset.action, value: this.value, label: this.label }); return; }
      if (e.target === this._arrow || this._arrow.contains(e.target)) { e.stopPropagation(); this.toggle(); return; }
      this.select();
    };
    this._onKey = (e) => {
      if (e.key === 'Enter' || e.key === ' ') { e.preventDefault(); this.select(); }
    };
    this._row.addEventListener('click', this._onRowClick);
    this._row.addEventListener('keydown', this._onKey);
  }

  teardownEvents() {
    this._row?.removeEventListener('click', this._onRowClick);
    this._row?.removeEventListener('keydown', this._onKey);
  }

  onAttributeChanged(name) {
    if (name === 'label') this.assignSlots();
    else this._sync();
    if (name === 'open') this.emit('nk-toggle', { open: this.getBoolAttr('open'), value: this.value });
  }

  /** Fires nk-select; a listener may preventDefault to keep the item from becoming active. */
  select() {
    const ok = this.emit('nk-select', { value: this.value, label: this.label, href: this.getAttribute('href'), item: this });
    if (!ok) return;
    const tree = this.closest('nk-tree');
    if (tree) tree.setActive(this);
    else this.setBoolAttr('active', true);
    if (this.getAttribute('href')) location.assign(this.getAttribute('href'));
  }

  toggle() { this.setBoolAttr('open', !this.getBoolAttr('open')); }
  focus(options) { this._row?.focus(options); }
  /** Roving tabindex, managed by <nk-tree>. */
  setTabbable(v) { if (this._row) this._row.tabIndex = v ? 0 : -1; }
  get tabbable() { return this._row?.tabIndex === 0; }
  get hasChildren() { return !!this._hasChildren; }

  get label() { return this.getAttribute('label') ?? this._labelSlot?.assignedNodes().map(n => n.textContent).join('').trim() ?? ''; }
  set label(v) { this.setAttribute('label', v); }
  get value() { return this.getAttribute('value') ?? this.label; }
  set value(v) { this.setAttribute('value', v); }
  get icon() { return this.getAttribute('icon'); }
  set icon(v) { v == null ? this.removeAttribute('icon') : this.setAttribute('icon', v); }
  get active() { return this.getBoolAttr('active'); }
  set active(v) { this.setBoolAttr('active', v); }
  get open() { return this.getBoolAttr('open'); }
  set open(v) { this.setBoolAttr('open', v); }
  get compact() { return this.getBoolAttr('compact'); }
  set compact(v) { this.setBoolAttr('compact', v); }
}

customElements.define('nk-tree-item', NkTreeItem);

export { NkTreeItem };
