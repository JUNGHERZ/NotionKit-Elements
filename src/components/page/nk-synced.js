import { NkElement } from '../../base.js';

// <nk-synced badge="⟳ 3 places">…</nk-synced>
// → <div class="nk-synced"><span class="synced-badge">⟳ 3 places</span>…</div>
class NkSynced extends NkElement {
  static get observedAttributes() { return ['badge']; }

  render() {
    const box = this.createElement('div', ['nk-synced']);
    this._badge = this.createElement('span', ['synced-badge']);
    box.appendChild(this._badge);
    box.appendChild(document.createElement('slot'));
    this._wrapper.appendChild(box);
    this._sync();
  }

  _sync() { this._badge.textContent = this.getAttribute('badge') ?? '⟳ synced'; }
  onAttributeChanged() { this._sync(); }

  get badge() { return this.getAttribute('badge'); }
  set badge(v) { this.setAttribute('badge', v); }
}

customElements.define('nk-synced', NkSynced);
export { NkSynced };
