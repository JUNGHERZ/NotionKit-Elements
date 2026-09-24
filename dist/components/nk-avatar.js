import { NkElement } from './base.js';
import { p as paintAvatar, i as initialsOf } from './shared/avatar-CzPZN3uP.js';
import '@jungherz-de/notionkit/notionkit-styles.js';

// <nk-avatar>MK</nk-avatar>                       → <span class="nk-avatar">MK</span>
// <nk-avatar size="small" color="green">SL</nk-avatar>
// <nk-avatar name="Ada Lovelace" size="large"></nk-avatar>   → initials "AL"
// <nk-avatar src="ada.jpg" name="Ada Lovelace" size="xlarge"></nk-avatar>
// <nk-avatar square>A</nk-avatar>                  → a workspace icon
// size: small (20px) · default 24px · large (32px) · xlarge (56px). color: one
// of Notion's nine names, or any CSS background. Without content the initials
// come from `name`; with `src` a photo fills the circle and `name` is its alt.
class NkAvatar extends NkElement {
  static get observedAttributes() { return ['size', 'color', 'square', 'src', 'name']; }

  render() {
    this._box = this.createElement('span', ['nk-avatar']);
    this._slot = document.createElement('slot');
    this._initials = document.createTextNode('');
    this._slot.appendChild(this._initials);
    this._img = this.createElement('img', [], { alt: '' });
    this._box.appendChild(this._slot);
    this._wrapper.appendChild(this._box);
    this._sync();
  }

  _sync() {
    const size = this.getAttribute('size');
    for (const s of ['small', 'large', 'xlarge']) this._box.classList.toggle(s, s === size);
    this._box.classList.toggle('square', this.getBoolAttr('square'));
    paintAvatar(this._box, this.getAttribute('color'));
    const name = this.getAttribute('name');
    this._initials.data = initialsOf(name);
    const src = this.getAttribute('src');
    if (src) {
      this._img.src = src;
      this._img.alt = name || '';
      if (this._slot.isConnected) this._slot.replaceWith(this._img);
    } else if (this._img.isConnected) this._img.replaceWith(this._slot);
    // A picture or initials with a name speak for themselves; a bare glyph is decoration.
    if (name && !src) { this._box.setAttribute('role', 'img'); this._box.setAttribute('aria-label', name); }
    else { this._box.removeAttribute('role'); this._box.removeAttribute('aria-label'); }
  }

  onAttributeChanged() { this._sync(); }

  get size() { return this.getAttribute('size'); }
  set size(v) { v == null ? this.removeAttribute('size') : this.setAttribute('size', v); }
  get color() { return this.getAttribute('color'); }
  set color(v) { v == null ? this.removeAttribute('color') : this.setAttribute('color', v); }
  get src() { return this.getAttribute('src'); }
  set src(v) { v == null ? this.removeAttribute('src') : this.setAttribute('src', v); }
}

customElements.define('nk-avatar', NkAvatar);

export { NkAvatar };
