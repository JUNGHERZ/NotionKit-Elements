import { NkElement } from '../../base.js';

// <nk-quote cite="Ada Lovelace">The Analytical Engine weaves…</nk-quote>
// .q-cite has no ::slotted() twin, so the citation is rendered here.
class NkQuote extends NkElement {
  static get observedAttributes() { return ['cite']; }

  render() {
    this._quote = this.createElement('blockquote', ['nk-quote']);
    this._quote.appendChild(document.createElement('slot'));
    this._cite = this.createElement('cite', ['q-cite']);
    this._quote.appendChild(this._cite);
    this._wrapper.appendChild(this._quote);
    this._sync();
  }

  onAttributeChanged() { this._sync(); }

  _sync() {
    if (!this._cite) return;
    const cite = this.getAttribute('cite');
    this._cite.textContent = cite || '';
    this._cite.style.display = cite ? '' : 'none';
  }

  get cite() { return this.getAttribute('cite'); }
  set cite(v) { v == null ? this.removeAttribute('cite') : this.setAttribute('cite', v); }
}

customElements.define('nk-quote', NkQuote);
export { NkQuote };
