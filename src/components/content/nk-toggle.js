import { NkElement } from '../../base.js';

// <nk-toggle label="Details" open>Body…</nk-toggle>
// → <details class="nk-toggle" open><summary>Details</summary><div class="toggle-body">…</div></details>
// The summary marker is a pseudo-element and cannot be styled on slotted
// content, so the summary is rendered here (label attribute or slot="label").
class NkToggle extends NkElement {
  static get observedAttributes() { return ['label', 'open']; }

  render() {
    this._details = this.createElement('details', ['nk-toggle']);
    const summary = document.createElement('summary');
    this._label = document.createElement('span');
    const labelSlot = this.createElement('slot', [], { name: 'label' });
    labelSlot.appendChild(this._label);
    summary.appendChild(labelSlot);
    const body = this.createElement('div', ['toggle-body']);
    body.appendChild(document.createElement('slot'));
    this._details.appendChild(summary);
    this._details.appendChild(body);
    this._details.open = this.getBoolAttr('open');
    this._wrapper.appendChild(this._details);
    this._sync();
  }

  setupEvents() {
    this._onToggle = () => {
      this._syncing = true;
      this.setBoolAttr('open', this._details.open);
      this._syncing = false;
      this.emit('nk-toggle', { open: this._details.open });
    };
    this._details.addEventListener('toggle', this._onToggle);
  }

  teardownEvents() {
    this._details?.removeEventListener('toggle', this._onToggle);
  }

  onAttributeChanged(name) {
    if (!this._details) return;
    if (name === 'open') { if (!this._syncing) this._details.open = this.getBoolAttr('open'); return; }
    this._sync();
  }

  _sync() { this._label.textContent = this.getAttribute('label') || ''; }

  get open() { return this.getBoolAttr('open'); }
  set open(v) { this.setBoolAttr('open', v); }
  get label() { return this.getAttribute('label'); }
  set label(v) { this.setAttribute('label', v); }
}

customElements.define('nk-toggle', NkToggle);
export { NkToggle };
