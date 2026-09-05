import { NkElement } from '../../base.js';

// <nk-block-host handle><p>Editable content lives here.</p></nk-block-host>
// → <div class="nk-block-host"><span class="nk-block-handle">⠿</span>…</div>
// The optical shell for editor content (hover wash, focus ring, drop target).
// Mount an editor into the light DOM; <nk-editor> (v1.1) does that for TipTap.
class NkBlockHost extends NkElement {
  static get observedAttributes() { return ['handle', 'drop-target']; }

  render() {
    this._box = this.createElement('div', ['nk-block-host']);
    this._handle = this.createElement('span', ['nk-block-handle'], { 'aria-hidden': 'true' });
    this._handle.textContent = '⠿';
    this._box.appendChild(this._handle);
    this._box.appendChild(document.createElement('slot'));
    this._wrapper.appendChild(this._box);
    this._sync();
  }

  _sync() {
    this._handle.style.display = this.getBoolAttr('handle') ? '' : 'none';
    this._box.classList.toggle('nk-drop-target', this.getBoolAttr('drop-target'));
  }

  onAttributeChanged() { this._sync(); }

  get handle() { return this.getBoolAttr('handle'); }
  set handle(v) { this.setBoolAttr('handle', v); }
  get dropTarget() { return this.getBoolAttr('drop-target'); }
  set dropTarget(v) { this.setBoolAttr('drop-target', v); }
}

customElements.define('nk-block-host', NkBlockHost);
export { NkBlockHost };
