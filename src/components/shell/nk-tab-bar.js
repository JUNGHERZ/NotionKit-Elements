import { NkElement } from '../../base.js';

// <nk-tab-bar value="inbox">
//   <nk-tab-bar-item icon="🏠" value="home">Home</nk-tab-bar-item>
//   <nk-tab-bar-item icon="📥" value="inbox">Inbox</nk-tab-bar-item>
//   <nk-tab-bar-item icon="☰" drawer>More</nk-tab-bar-item>
// </nk-tab-bar>
// → <nav class="nk-tab-bar">…</nav>
//
// The thumb-reachable twin of the sidebar for phones and installed PWAs. As
// the last child of <nk-app> it is slotted into .nk-main below the scrolling
// page, so it never moves and needs no bottom padding anywhere. The
// stylesheet hides it above 860px – there the sidebar is the navigation –
// and shows it below; `always` shows it at every width (previews, phone
// frames), `fixed` pins it to the viewport (standalone PWAs) with a spacer
// holding its place, `floating` makes it a capsule. The item whose value is
// the bar's `value` is `active`; a `drawer` item opens the sidebar instead of
// becoming active when clicked. A value no item has – a page without a tab
// of its own, opened from the drawer – marks the drawer item, as iOS marks
// "More" (1.18.0); without one no item is active. Without a value the item
// marked `active`, else the first, is the one.
class NkTabBar extends NkElement {
  static get observedAttributes() { return ['value', 'always', 'fixed', 'floating', 'label']; }

  render() {
    this._bar = this.createElement('nav', ['nk-tab-bar']);
    this._slot = document.createElement('slot');
    this._bar.appendChild(this._slot);
    // With `fixed` the bar leaves the flow; the spacer (styled by the
    // stylesheet, shown only then) keeps its height so the page ends above it.
    this._spacer = this.createElement('div', ['nk-tab-bar-spacer']);
    this._wrapper.append(this._bar, this._spacer);
    this._syncBar();
    this._sync();
  }

  get items() { return [...this.querySelectorAll(':scope > nk-tab-bar-item')]; }

  // Attribute access only: on the first connect the children are in the DOM
  // but not yet upgraded, so their accessors do not exist.
  _valueOf(item) { return item.getAttribute('value') ?? item.getAttribute('label') ?? item.textContent.trim(); }

  _syncBar() {
    this._bar.classList.toggle('always', this.getBoolAttr('always'));
    this._bar.classList.toggle('fixed', this.getBoolAttr('fixed'));
    this._bar.classList.toggle('floating', this.getBoolAttr('floating'));
    const label = this.getAttribute('label');
    label ? this._bar.setAttribute('aria-label', label) : this._bar.removeAttribute('aria-label');
  }

  _sync() {
    const items = this.items.filter(i => !i.hasAttribute('drawer')), drawers = this.items.filter(i => i.hasAttribute('drawer'));
    if (!items.length) return;
    let value = this.getAttribute('value');
    if (value === null) {
      const preset = items.find(i => i.hasAttribute('active')) || items[0];
      value = this._valueOf(preset);
    }
    const known = items.some(i => this._valueOf(i) === value);
    for (const item of items) {
      if (this._valueOf(item) === value) item.setAttribute('active', ''); else item.removeAttribute('active');
    }
    drawers.forEach((item, n) => { if (!known && n === 0) item.setAttribute('active', ''); else item.removeAttribute('active'); });
    this._value = value;
  }

  setupEvents() {
    this._onSlot = () => this._sync();
    this._slot.addEventListener('slotchange', this._onSlot);
    this._sync();
  }

  teardownEvents() {
    this._slot?.removeEventListener('slotchange', this._onSlot);
  }

  onAttributeChanged(name) {
    if (name !== 'value') { this._syncBar(); return; }
    const before = this._value;
    this._sync();
    if (this._value !== before) this.emit('nk-change', { value: this._value });
  }

  get value() { return this._value ?? this.getAttribute('value'); }
  set value(v) { this.setAttribute('value', v); }
  get always() { return this.getBoolAttr('always'); }
  set always(v) { this.setBoolAttr('always', v); }
  get fixed() { return this.getBoolAttr('fixed'); }
  set fixed(v) { this.setBoolAttr('fixed', v); }
  get floating() { return this.getBoolAttr('floating'); }
  set floating(v) { this.setBoolAttr('floating', v); }
}

customElements.define('nk-tab-bar', NkTabBar);
export { NkTabBar };
