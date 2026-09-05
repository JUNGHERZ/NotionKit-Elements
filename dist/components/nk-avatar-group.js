import { N as NkElement } from './shared/base-6gEcoatG.js';

// <nk-avatar-group more="+2">
//   <span class="mini-avatar" style="background:#448361">SL</span>…
// </nk-avatar-group>
// → <div class="nk-avatar-group">…<span class="mini-avatar more">+2</span></div>
// The avatars stay in the light DOM (::slotted twins size and overlap them);
// the "more" bubble is rendered here from the attribute.
class NkAvatarGroup extends NkElement {
  static get observedAttributes() { return ['more']; }

  render() {
    const box = this.createElement('div', ['nk-avatar-group']);
    box.appendChild(document.createElement('slot'));
    this._more = this.createElement('span', ['mini-avatar', 'more']);
    box.appendChild(this._more);
    this._wrapper.appendChild(box);
    this._sync();
  }

  _sync() {
    const more = this.getAttribute('more');
    this._more.textContent = more || '';
    this._more.style.display = more ? '' : 'none';
  }

  onAttributeChanged() { this._sync(); }

  get more() { return this.getAttribute('more'); }
  set more(v) { v == null ? this.removeAttribute('more') : this.setAttribute('more', v); }
}

customElements.define('nk-avatar-group', NkAvatarGroup);

export { NkAvatarGroup };
