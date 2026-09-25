import { NkElement } from '../../base.js';

// <nk-page-cover slot="cover"></nk-page-cover>            → the token gradient
// <nk-page-cover slot="cover" src="cover.jpg" position="center 30%"></nk-page-cover>  → a picture
// → <div class="nk-cover"><img src="cover.jpg" alt=""></div>: the picture fills
// the band, cropped rather than stretched; `position` moves the crop, as
// Notion's "Reposition" does. The gradient stays underneath while it loads.
// The band is as tall as the token --nk-cover-height (200px), which reaches
// the shadow root: style="--nk-cover-height: 30vh" sets one cover.
class NkPageCover extends NkElement {
  static get observedAttributes() { return ['src', 'position']; }

  render() {
    this._cover = this.createElement('div', ['nk-cover']);
    this._img = this.createElement('img', [], { alt: '' });
    this._wrapper.appendChild(this._cover);
    this._sync();
  }

  _sync() {
    const src = this.getAttribute('src');
    if (src) {
      this._img.src = src;
      this._img.style.objectPosition = this.getAttribute('position') || '';
      if (!this._img.isConnected) this._cover.appendChild(this._img);
    } else this._img.remove();
  }

  onAttributeChanged() { this._sync(); }

  get src() { return this.getAttribute('src'); }
  set src(v) { v == null ? this.removeAttribute('src') : this.setAttribute('src', v); }
}

customElements.define('nk-page-cover', NkPageCover);
export { NkPageCover };
