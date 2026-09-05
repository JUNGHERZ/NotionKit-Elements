import { NkElement } from '../../base.js';

// <nk-banner variant="info">ℹ️ <span>Text</span><span slot="action">Open</span></nk-banner>
// → <div class="nk-banner info">…<span class="b-action">Open</span></div>
const VARIANTS = ['info', 'success', 'warning'];

class NkBanner extends NkElement {
  static get observedAttributes() { return ['variant']; }

  render() {
    this._box = this.createElement('div', this._classes(), { role: 'status' });
    this._box.appendChild(document.createElement('slot'));
    this._box.appendChild(this.createElement('slot', [], { name: 'action' }));
    this._wrapper.appendChild(this._box);
  }

  _classes() {
    const v = this.getAttribute('variant');
    return ['nk-banner', ...(VARIANTS.includes(v) ? [v] : [])];
  }

  onAttributeChanged() { if (this._box) this._box.className = this._classes().join(' '); }

  get variant() { return this.getAttribute('variant'); }
  set variant(v) { v ? this.setAttribute('variant', v) : this.removeAttribute('variant'); }
}

customElements.define('nk-banner', NkBanner);
export { NkBanner };
