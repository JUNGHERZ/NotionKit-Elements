import { N as NkElement } from './shared/base-6gEcoatG.js';

// <nk-page-cover slot="cover"></nk-page-cover>            → the token gradient
// <nk-page-cover slot="cover" src="cover.jpg"></nk-page-cover>  → an image
class NkPageCover extends NkElement {
  static get observedAttributes() { return ['src']; }

  render() {
    this._cover = this.createElement('div', ['nk-cover']);
    this._wrapper.appendChild(this._cover);
    this._sync();
  }

  _sync() {
    const src = this.getAttribute('src');
    if (src) {
      this._cover.style.backgroundImage = `url("${src}")`;
      this._cover.style.backgroundSize = 'cover';
      this._cover.style.backgroundPosition = 'center';
    } else {
      this._cover.style.backgroundImage = '';
      this._cover.style.backgroundSize = '';
      this._cover.style.backgroundPosition = '';
    }
  }

  onAttributeChanged() { this._sync(); }

  get src() { return this.getAttribute('src'); }
  set src(v) { v == null ? this.removeAttribute('src') : this.setAttribute('src', v); }
}

customElements.define('nk-page-cover', NkPageCover);

export { NkPageCover };
