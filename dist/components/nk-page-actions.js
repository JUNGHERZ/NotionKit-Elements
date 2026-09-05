import { N as NkElement } from './shared/base-6gEcoatG.js';

// <nk-page-actions><span>👤 Ada</span><span>📅 12 May</span><span>🏷️ <nk-tag color="purple">Design</nk-tag></span></nk-page-actions>
// → <div class="nk-page-meta">…</div>  – the meta row under the title
class NkPageActions extends NkElement {
  render() {
    const row = this.createElement('div', ['nk-page-meta']);
    row.appendChild(document.createElement('slot'));
    this._wrapper.appendChild(row);
  }
}

customElements.define('nk-page-actions', NkPageActions);

export { NkPageActions };
