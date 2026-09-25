import { NkElement } from '../../base.js';

// <nk-progress value="72" label="72%"></nk-progress>
// <nk-progress value="72" label="72 %" wide></nk-progress>   → fills its row, the label stays beside it
// The bar is `.nk-progress > i` — a child combinator, so both nodes live here.
// With a label the two form one .nk-progress-row (1.18.0): the label beside
// the bar in a flex column too – a panel – where the host, display: contents,
// would let them stand one under the other.
class NkProgress extends NkElement {
  static get observedAttributes() { return ['value', 'max', 'label', 'wide']; }

  render() {
    this._bar = this.createElement('span', ['nk-progress'], { role: 'progressbar' });
    this._fill = document.createElement('i');
    this._bar.appendChild(this._fill);
    this._label = this.createElement('span', ['nk-progress-label']);
    this._row = this.createElement('span', ['nk-progress-row']);
    this._sync();
  }

  onAttributeChanged() { this._sync(); }

  _sync() {
    if (!this._bar) return;
    const max = Number(this.getAttribute('max')) || 100;
    const value = Math.min(max, Math.max(0, Number(this.getAttribute('value')) || 0));
    this._fill.style.width = `${(value / max) * 100}%`;
    this._bar.classList.toggle('wide', this.getBoolAttr('wide'));
    this._bar.setAttribute('aria-valuenow', value);
    this._bar.setAttribute('aria-valuemin', 0);
    this._bar.setAttribute('aria-valuemax', max);
    const label = this.getAttribute('label');
    this._label.textContent = label ?? '';
    if (label === null) { if (this._bar.parentNode !== this._wrapper) this._wrapper.replaceChildren(this._bar); }
    else if (this._bar.parentNode !== this._row) { this._row.replaceChildren(this._bar, this._label); this._wrapper.replaceChildren(this._row); }
  }

  get value() { return Number(this.getAttribute('value')) || 0; }
  set value(v) { this.setAttribute('value', v); }
  get max() { return Number(this.getAttribute('max')) || 100; }
  set max(v) { this.setAttribute('max', v); }
  get label() { return this.getAttribute('label'); }
  set label(v) { v == null ? this.removeAttribute('label') : this.setAttribute('label', v); }
}

customElements.define('nk-progress', NkProgress);
export { NkProgress };
