import { N as NkElement } from './shared/base-EVtzqKmc.js';

// <nk-divider></nk-divider>  →  <hr class="nk-divider">
class NkDivider extends NkElement {
  render() {
    this._wrapper.appendChild(this.createElement('hr', ['nk-divider']));
  }
}

customElements.define('nk-divider', NkDivider);

export { NkDivider };
