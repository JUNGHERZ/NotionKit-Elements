import { N as NkElement } from './shared/base-6gEcoatG.js';

// <nk-section-label addable>Favourites</nk-section-label>
// → <div class="nk-section-label">Favourites <span class="plus">＋</span></div>
// The ＋ appears on hover (a hover-parent rule, so it lives in the same tree)
// and fires nk-action { action: 'add' }.
class NkSectionLabel extends NkElement {
  static get observedAttributes() { return ['label', 'addable']; }

  render() {
    this._box = this.createElement('div', ['nk-section-label']);
    this._text = document.createElement('span');
    this._text.appendChild(document.createElement('slot'));
    this._plus = this.createElement('span', ['plus'], { role: 'button', title: '+' });
    this._plus.textContent = '＋';
    this._box.append(this._text, this._plus);
    this._wrapper.appendChild(this._box);
    this._sync();
  }

  _sync() {
    const label = this.getAttribute('label');
    if (label !== null) this._text.textContent = label;
    this._plus.style.display = this.getBoolAttr('addable') ? '' : 'none';
  }

  setupEvents() {
    this._onPlus = (e) => { e.stopPropagation(); this.emit('nk-action', { action: 'add' }); };
    this._plus.addEventListener('click', this._onPlus);
  }

  teardownEvents() { this._plus?.removeEventListener('click', this._onPlus); }

  onAttributeChanged() { this._sync(); }

  get addable() { return this.getBoolAttr('addable'); }
  set addable(v) { this.setBoolAttr('addable', v); }
}

customElements.define('nk-section-label', NkSectionLabel);

export { NkSectionLabel };
