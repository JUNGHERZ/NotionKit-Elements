import { NkElement } from '../../base.js';

// <nk-stats><nk-stat …></nk-stat>…</nk-stats>  →  <div class="nk-stats">
class NkStats extends NkElement {
  render() {
    const row = this.createElement('div', ['nk-stats']);
    row.appendChild(document.createElement('slot'));
    this._wrapper.appendChild(row);
  }
}

customElements.define('nk-stats', NkStats);
export { NkStats };
