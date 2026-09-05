import { N as NkElement } from './shared/base-6gEcoatG.js';

// <nk-heading level="2">Section</nk-heading>  →  <h2 class="nk-heading">
// The heading level is real markup (h1–h4), so the outline stays honest.
class NkHeading extends NkElement {
  static get observedAttributes() { return ['level']; }

  render() {
    this._build();
  }

  _build() {
    const level = Math.min(4, Math.max(1, Number(this.getAttribute('level')) || 2));
    const h = this.createElement(`h${level}`, ['nk-heading']);
    h.appendChild(document.createElement('slot'));
    if (this._heading) this._heading.replaceWith(h);
    else this._wrapper.appendChild(h);
    this._heading = h;
  }

  onAttributeChanged() { this._build(); }

  get level() { return Number(this.getAttribute('level')) || 2; }
  set level(v) { this.setAttribute('level', v); }
}

customElements.define('nk-heading', NkHeading);

export { NkHeading };
