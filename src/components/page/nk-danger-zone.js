import { NkElement } from '../../base.js';

// <nk-danger-zone title="Danger zone">…</nk-danger-zone>
// → <div class="nk-danger-zone"><div class="dz-title">Danger zone</div>…</div>
// `title` is the heading, never a tooltip – see NkElement.takeTitle().
class NkDangerZone extends NkElement {
  static get observedAttributes() { return ['title']; }

  render() {
    const box = this.createElement('div', ['nk-danger-zone']);
    this._titleEl = this.createElement('div', ['dz-title']);
    box.appendChild(this._titleEl);
    box.appendChild(document.createElement('slot'));
    this._wrapper.appendChild(box);
    this.takeTitle();
    this._sync();
  }

  _sync() {
    const t = this._titleText;
    this._titleEl.textContent = t || '';
    this._titleEl.style.display = t ? '' : 'none';
  }

  onAttributeChanged(name, _old, value) {
    if (name === 'title' && !this.takeTitle(value)) return;
    this._sync();
  }

  get title() { return this._titleText ?? ''; }
  set title(v) { this._titleText = v == null ? '' : String(v); if (this._initialized) this._sync(); }
}

customElements.define('nk-danger-zone', NkDangerZone);
export { NkDangerZone };
