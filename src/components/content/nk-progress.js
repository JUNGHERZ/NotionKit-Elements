import { NkElement } from '../../base.js';

// <nk-progress value="72" label="72%"></nk-progress>
// The bar is `.nk-progress > i` — a child combinator, so both nodes live here.
class NkProgress extends NkElement {
  static get observedAttributes() { return ['value', 'max', 'label']; }

  render() {
    this._bar = this.createElement('span', ['nk-progress'], { role: 'progressbar' });
    this._fill = document.createElement('i');
    this._bar.appendChild(this._fill);
    this._label = this.createElement('span', ['nk-progress-label']);
    this._wrapper.appendChild(this._bar);
    this._wrapper.appendChild(this._label);
    this._sync();
  }

  onAttributeChanged() { this._sync(); }

  _sync() {
    if (!this._bar) return;
    const max = Number(this.getAttribute('max')) || 100;
    const value = Math.min(max, Math.max(0, Number(this.getAttribute('value')) || 0));
    this._fill.style.width = `${(value / max) * 100}%`;
    this._bar.setAttribute('aria-valuenow', value);
    this._bar.setAttribute('aria-valuemin', 0);
    this._bar.setAttribute('aria-valuemax', max);
    const label = this.getAttribute('label');
    this._label.textContent = label ?? '';
    this._label.style.display = label === null ? 'none' : '';
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
