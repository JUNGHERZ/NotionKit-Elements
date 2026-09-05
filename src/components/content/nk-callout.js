import { NkElement } from '../../base.js';

// <nk-callout icon="💡">text</nk-callout>
// <nk-callout><span slot="icon">📌</span>text</nk-callout>
// The .c-icon rule has ::slotted(.c-icon) / ::slotted([slot="icon"]) twins in
// notionkit.css – those size an icon passed in from the light DOM. Pass the
// icon node itself, never wrapped: ::slotted() only matches the assigned node.
class NkCallout extends NkElement {
  static get observedAttributes() { return ['icon']; }

  render() {
    this._box = this.createElement('div', ['nk-callout']);
    this._icon = this.createElement('span', ['c-icon']);
    const iconSlot = this.createElement('slot', [], { name: 'icon' });
    iconSlot.appendChild(this._icon);
    const body = document.createElement('div');
    body.appendChild(document.createElement('slot'));
    this._box.appendChild(iconSlot);
    this._box.appendChild(body);
    this._wrapper.appendChild(this._box);
    this._syncIcon();
  }

  onAttributeChanged() { this._syncIcon(); }

  _syncIcon() {
    if (this._icon) this._icon.textContent = this.getAttribute('icon') || '💡';
  }

  get icon() { return this.getAttribute('icon'); }
  set icon(v) { v == null ? this.removeAttribute('icon') : this.setAttribute('icon', v); }
}

customElements.define('nk-callout', NkCallout);
export { NkCallout };
