import { NkElement } from './base.js';
import '@jungherz-de/notionkit/notionkit-styles.js';

// <nk-fields>
//   <nk-field label="Name"><nk-input name="name"></nk-input></nk-field>
//   <nk-field label="Email"><nk-input name="email"></nk-input></nk-field>
// </nk-fields>
// → <div class="nk-fields">…</div>
// A grid of short fields side by side, wrapping as the width allows. Every
// nk-field inside renders itself stacked and compact (12px label above a
// full-width control) – the class markup does the same through
// `.nk-fields > .nk-field`, which cannot cross the shadow boundary here.
// `fit` (NotionKit 1.11.0) lets the fields share the row instead of keeping
// 150px columns: two fields in a wide dialog are two halves.
class NkFields extends NkElement {
  static get observedAttributes() { return ['fit']; }

  render() {
    this._grid = this.createElement('div', ['nk-fields']);
    this._grid.appendChild(document.createElement('slot'));
    this._wrapper.appendChild(this._grid);
    this.onAttributeChanged();
  }

  onAttributeChanged() { this._grid?.classList.toggle('fit', this.getBoolAttr('fit')); }

  get fit() { return this.getBoolAttr('fit'); }
  set fit(v) { this.setBoolAttr('fit', v); }
}

customElements.define('nk-fields', NkFields);

export { NkFields };
