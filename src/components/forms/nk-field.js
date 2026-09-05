import { NkElement } from '../../base.js';

// <nk-field label="Display name" desc="Shown next to your comments">
//   <nk-input value="Marcel"></nk-input>
// </nk-field>
// → <div class="nk-field"><div><div class="f-label">…</div><div class="f-desc">…</div></div>
//                         <div class="f-control">…</div></div>
// Rich label / description content goes through slot="label" / slot="desc"
// (twins `.nk-field ::slotted([slot="label"])` etc. in notionkit.css).
class NkField extends NkElement {
  static get observedAttributes() { return ['label', 'desc']; }

  render() {
    const field = this.createElement('div', ['nk-field']);
    const text = document.createElement('div');
    this._label = this.createElement('div', ['f-label']);
    const labelSlot = this.createElement('slot', [], { name: 'label' });
    labelSlot.appendChild(this._label);
    this._desc = this.createElement('div', ['f-desc']);
    const descSlot = this.createElement('slot', [], { name: 'desc' });
    descSlot.appendChild(this._desc);
    text.appendChild(labelSlot);
    text.appendChild(descSlot);
    const control = this.createElement('div', ['f-control']);
    control.appendChild(document.createElement('slot'));
    field.appendChild(text);
    field.appendChild(control);
    this._wrapper.appendChild(field);
    this._sync();
  }

  onAttributeChanged() { this._sync(); }

  _sync() {
    if (!this._label) return;
    this._label.textContent = this.getAttribute('label') || '';
    const desc = this.getAttribute('desc');
    this._desc.textContent = desc || '';
    this._desc.style.display = desc ? '' : 'none';
  }

  get label() { return this.getAttribute('label'); }
  set label(v) { this.setAttribute('label', v); }
  get desc() { return this.getAttribute('desc'); }
  set desc(v) { v == null ? this.removeAttribute('desc') : this.setAttribute('desc', v); }
}

customElements.define('nk-field', NkField);
export { NkField };
