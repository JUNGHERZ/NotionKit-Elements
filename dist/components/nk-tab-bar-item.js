import { N as NkElement } from './shared/base-BavgHsS-.js';

// <nk-tab-bar-item icon="📥" value="inbox" active>Inbox</nk-tab-bar-item>
// → <button class="nk-tab-bar-item active" type="button">
//     <span class="icon">📥</span><span class="label">Inbox</span></button>
//
// One destination of <nk-tab-bar>. A click emits nk-select (cancelable);
// inside a bar it then moves the bar's `value`, standalone it sets its own
// `active`. With `href` it navigates afterwards, with `drawer` it opens the
// nearest <nk-sidebar> as a drawer instead of becoming active – the usual
// fifth item ("More"). The icon is an attribute or a `slot="icon"` node.
class NkTabBarItem extends NkElement {
  static get observedAttributes() { return ['icon', 'label', 'value', 'href', 'active', 'disabled', 'drawer']; }

  render() {
    this._btn = this.createElement('button', ['nk-tab-bar-item'], { type: 'button' });
    this._iconSlot = this.createElement('slot', [], { name: 'icon' });
    this._icon = this.createElement('span', ['icon'], { 'aria-hidden': 'true' });
    this._iconSlot.appendChild(this._icon);
    this._label = this.createElement('span', ['label']);
    this._labelSlot = document.createElement('slot');
    this._labelText = document.createTextNode('');
    this._labelSlot.appendChild(this._labelText);
    this._label.appendChild(this._labelSlot);
    this._btn.append(this._iconSlot, this._label);
    this._wrapper.appendChild(this._btn);
    this._sync();
  }

  _sync() {
    this._icon.textContent = this.getAttribute('icon') ?? '';
    this._labelText.data = this.getAttribute('label') ?? '';
    const active = this.getBoolAttr('active');
    this._btn.classList.toggle('active', active);
    active ? this._btn.setAttribute('aria-current', 'page') : this._btn.removeAttribute('aria-current');
    this._btn.disabled = this.getBoolAttr('disabled');
    const href = this.getAttribute('href');
    href ? this._btn.setAttribute('data-href', href) : this._btn.removeAttribute('data-href');
  }

  setupEvents() {
    this._onClick = () => this.select();
    this._btn.addEventListener('click', this._onClick);
  }

  teardownEvents() {
    this._btn?.removeEventListener('click', this._onClick);
  }

  select() {
    if (this.getBoolAttr('disabled')) return;
    const href = this.getAttribute('href');
    const ok = this.emit('nk-select', { value: this.value, label: this.label, href, item: this, drawer: this.getBoolAttr('drawer') });
    if (!ok) return;
    if (this.getBoolAttr('drawer')) {
      const sidebar = this.closest('nk-app')?.querySelector('nk-sidebar') ?? document.querySelector('nk-sidebar');
      sidebar?.toggle?.();
      return;
    }
    const bar = this.closest('nk-tab-bar');
    if (bar) bar.value = this.value;
    else this.setBoolAttr('active', true);
    if (href) location.assign(href);
  }

  onAttributeChanged() { this._sync(); }
  focus(o) { this._btn?.focus(o); }

  get value() { return this.getAttribute('value') ?? this.label; }
  set value(v) { this.setAttribute('value', v); }
  get label() { return this.getAttribute('label') ?? this.textContent.trim(); }
  set label(v) { this.setAttribute('label', v); }
  get active() { return this.getBoolAttr('active'); }
  set active(v) { this.setBoolAttr('active', v); }
  get disabled() { return this.getBoolAttr('disabled'); }
  set disabled(v) { this.setBoolAttr('disabled', v); }
  get drawer() { return this.getBoolAttr('drawer'); }
  set drawer(v) { this.setBoolAttr('drawer', v); }
}

customElements.define('nk-tab-bar-item', NkTabBarItem);

export { NkTabBarItem };
