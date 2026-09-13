import { N as NkElement } from './shared/base-BPIvRI6K.js';

// <nk-field label="Display name" desc="Shown next to your comments">
//   <nk-input value="Marcel"></nk-input>
// </nk-field>
// → <div class="nk-field"><div><div class="f-label">…</div><div class="f-desc">…</div></div>
//                         <div class="f-control">…</div></div>
// Rich label / description content goes through slot="label" / slot="desc"
// (twins `.nk-field ::slotted([slot="label"])` etc. in notionkit.css).
//
// `stacked` puts the label above a full-width control, `compact` shrinks the
// label and drops the row padding; inside <nk-fields> both are on by
// default. A stacked field sets `wide` on its nk-input / nk-textarea /
// nk-select, since the stylesheet's `.nk-field.stacked .nk-input` cannot
// reach into the control's shadow root.
const WIDE = ['nk-input', 'nk-textarea', 'nk-select'];

class NkField extends NkElement {
  static get observedAttributes() { return ['label', 'desc', 'stacked', 'compact']; }

  render() {
    this._field = this.createElement('div', ['nk-field']);
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
    this._slot = document.createElement('slot');
    control.appendChild(this._slot);
    this._field.appendChild(text);
    this._field.appendChild(control);
    this._wrapper.appendChild(this._field);
    this._widened = new Set();
    this._sync();
  }

  setupEvents() {
    this._onSlot = () => this._syncWide();
    this._slot.addEventListener('slotchange', this._onSlot);
    this._sync();
  }

  teardownEvents() {
    this._slot?.removeEventListener('slotchange', this._onSlot);
  }

  onAttributeChanged() { this._sync(); }

  get stacked() { return this.getBoolAttr('stacked') || !!this.closest('nk-fields'); }
  set stacked(v) { this.setBoolAttr('stacked', v); }
  get compact() { return this.getBoolAttr('compact') || !!this.closest('nk-fields'); }
  set compact(v) { this.setBoolAttr('compact', v); }

  _sync() {
    if (!this._label) return;
    this._label.textContent = this.getAttribute('label') || '';
    const desc = this.getAttribute('desc');
    this._desc.textContent = desc || '';
    this._desc.style.display = desc ? '' : 'none';
    this._field.classList.toggle('stacked', this.stacked);
    this._field.classList.toggle('compact', this.compact);
    this._syncWide();
  }

  _syncWide() {
    if (!this._slot) return;
    const stacked = this.stacked;
    for (const el of this._slot.assignedElements()) {
      if (!WIDE.includes(el.localName)) continue;
      if (stacked && !el.hasAttribute('wide')) { el.setAttribute('wide', ''); this._widened.add(el); }
      else if (!stacked && this._widened.has(el)) { el.removeAttribute('wide'); this._widened.delete(el); }
    }
  }

  get label() { return this.getAttribute('label'); }
  set label(v) { this.setAttribute('label', v); }
  get desc() { return this.getAttribute('desc'); }
  set desc(v) { v == null ? this.removeAttribute('desc') : this.setAttribute('desc', v); }
}

customElements.define('nk-field', NkField);

export { NkField };
