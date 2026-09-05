import { NkElement } from '../../base.js';

// <nk-skeleton height="18" width="60%"></nk-skeleton>
// <nk-skeleton lines="3" widths="100%,85%,40%"></nk-skeleton>
// → <div class="nk-skeleton" style="height:…;width:…"></div> × lines
class NkSkeleton extends NkElement {
  static get observedAttributes() { return ['lines', 'height', 'width', 'widths']; }

  render() { this._build(); }

  _build() {
    this._wrapper.replaceChildren();
    const lines = Math.max(1, Number(this.getAttribute('lines')) || 1);
    const height = this.getAttribute('height') || '13';
    const widths = (this.getAttribute('widths') || '').split(',').map(s => s.trim()).filter(Boolean);
    const width = this.getAttribute('width');
    for (let i = 0; i < lines; i++) {
      const line = this.createElement('div', ['nk-skeleton'], { 'aria-hidden': 'true' });
      line.style.height = /^\d+(\.\d+)?$/.test(height) ? `${height}px` : height;
      const w = widths[i] ?? width;
      if (w) line.style.width = w;
      this._wrapper.appendChild(line);
    }
  }

  onAttributeChanged() { this._build(); }
}

customElements.define('nk-skeleton', NkSkeleton);
export { NkSkeleton };
