import { NkElement } from './base.js';
import '@jungherz-de/notionkit/notionkit-styles.js';

// <nk-panels><nk-panel …></nk-panel><nk-panel …></nk-panel></nk-panels>
// → <div class="nk-panels">…</div>: columns of at least 200px that share the
// row and fall to one on a phone. The <nk-panel> hosts are display: contents,
// so each .nk-panel is a cell of this grid.
class NkPanels extends NkElement {
  render() {
    const grid = this.createElement('div', ['nk-panels']);
    grid.appendChild(document.createElement('slot'));
    this._wrapper.appendChild(grid);
  }
}

customElements.define('nk-panels', NkPanels);

export { NkPanels };
