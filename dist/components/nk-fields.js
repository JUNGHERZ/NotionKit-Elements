import { N as NkElement } from './shared/base-DL7ok-Xt.js';

// <nk-fields>
//   <nk-field label="Name"><nk-input name="name"></nk-input></nk-field>
//   <nk-field label="Email"><nk-input name="email"></nk-input></nk-field>
// </nk-fields>
// → <div class="nk-fields">…</div>
// A grid of short fields side by side, wrapping as the width allows. Every
// nk-field inside renders itself stacked and compact (12px label above a
// full-width control) – the class markup does the same through
// `.nk-fields > .nk-field`, which cannot cross the shadow boundary here.
class NkFields extends NkElement {
  render() {
    const grid = this.createElement('div', ['nk-fields']);
    grid.appendChild(document.createElement('slot'));
    this._wrapper.appendChild(grid);
  }
}

customElements.define('nk-fields', NkFields);

export { NkFields };
