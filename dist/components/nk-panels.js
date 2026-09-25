import { NkElement } from './base.js';
import '@jungherz-de/notionkit/notionkit-styles.js';

// <nk-panels><nk-panel …></nk-panel><nk-panel …></nk-panel></nk-panels>
// → <div class="nk-panels">…</div>: columns of at least 200px that share the
// row and fall to one on a phone. The <nk-panel> hosts are display: contents,
// so each .nk-panel is a cell of this grid. `flush` (NotionKit 1.12.0) drops
// the grid's outer margin.
class NkPanels extends NkElement {
  static get observedAttributes() { return ['flush']; }

  render() {
    this._grid = this.createElement('div', ['nk-panels']);
    this._grid.appendChild(document.createElement('slot'));
    this._wrapper.appendChild(this._grid);
    this.onAttributeChanged();
  }

  onAttributeChanged() { this._grid?.classList.toggle('flush', this.getBoolAttr('flush')); }

  get flush() { return this.getBoolAttr('flush'); }
  set flush(v) { this.setBoolAttr('flush', v); }
}

customElements.define('nk-panels', NkPanels);

export { NkPanels };
