import { N as NkElement } from './shared/base-6gEcoatG.js';

// <nk-danger-zone title="Danger zone">…</nk-danger-zone>
// → <div class="nk-danger-zone"><div class="dz-title">Danger zone</div>…</div>
class NkDangerZone extends NkElement {
  static get observedAttributes() { return ['title']; }

  render() {
    const box = this.createElement('div', ['nk-danger-zone']);
    this._title = this.createElement('div', ['dz-title']);
    box.appendChild(this._title);
    box.appendChild(document.createElement('slot'));
    this._wrapper.appendChild(box);
    this._sync();
  }

  _sync() {
    const t = this.getAttribute('title');
    this._title.textContent = t || '';
    this._title.style.display = t ? '' : 'none';
  }
  onAttributeChanged() { this._sync(); }
}

customElements.define('nk-danger-zone', NkDangerZone);

export { NkDangerZone };
