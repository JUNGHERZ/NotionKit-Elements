import { N as NkElement } from './shared/base-6gEcoatG.js';

// <nk-mention type="person"><span slot="avatar" class="mini-avatar" style="background:#448361">SL</span>Sara Lindt</nk-mention>
// <nk-mention type="page">📄 Onboarding</nk-mention>   <nk-mention type="date">📅 May 20</nk-mention>
// → <span class="nk-mention person">…</span>
const TYPES = ['person', 'page', 'date'];

class NkMention extends NkElement {
  static get observedAttributes() { return ['type']; }

  render() {
    this._box = this.createElement('span', this._classes());
    this._box.appendChild(this.createElement('slot', [], { name: 'avatar' }));
    this._box.appendChild(document.createElement('slot'));
    this._wrapper.appendChild(this._box);
  }

  _classes() {
    const t = this.getAttribute('type');
    return ['nk-mention', ...(TYPES.includes(t) ? [t] : [])];
  }

  onAttributeChanged() { if (this._box) this._box.className = this._classes().join(' '); }

  get type() { return this.getAttribute('type'); }
  set type(v) { v ? this.setAttribute('type', v) : this.removeAttribute('type'); }
}

customElements.define('nk-mention', NkMention);

export { NkMention };
