import { NkFormElement } from './base.js';
import '@jungherz-de/notionkit/notionkit-styles.js';

// <nk-switch name="notify" checked></nk-switch>
// → <button class="nk-switch" role="switch" aria-checked="true">
// notionkit.css styles the state through [aria-checked]; the toggling is here.
//
// <nk-switch checked>Waiting</nk-switch>   (or text="Waiting")
// → <label class="nk-switch-label"><button class="nk-switch" …></button><span>Waiting</span></label>
// Visible text beside the switch, for several switches in one row where no
// nk-field row names them. Without text the label wrapper is layout-
// transparent (display: contents), so the bare button stays the bare button.
class NkSwitch extends NkFormElement {
  static get observedAttributes() { return ['checked', 'disabled', 'name', 'value', 'label', 'text']; }

  render() {
    this._row = this.createElement('label', ['nk-switch-label']);
    this._btn = this.createElement('button', ['nk-switch'], { type: 'button', role: 'switch' });
    this._text = document.createElement('span');
    this._slot = document.createElement('slot');
    this._textNode = document.createTextNode('');
    this._slot.appendChild(this._textNode);
    this._text.appendChild(this._slot);
    this._row.append(this._btn, this._text);
    this._defaultChecked = this.getBoolAttr('checked');
    this._apply();
    this._syncText();
    this._wrapper.appendChild(this._row);
    this._syncFormValue();
  }

  _apply() {
    this._btn.setAttribute('aria-checked', this.getBoolAttr('checked') ? 'true' : 'false');
    this._btn.disabled = this.getBoolAttr('disabled') || !!this._formDisabled;
    const label = this.getAttribute('label');
    label ? this._btn.setAttribute('aria-label', label) : this._btn.removeAttribute('aria-label');
  }

  _syncText() {
    this._textNode.data = this.getAttribute('text') ?? '';
    const hasText = !!(this.getAttribute('text') || this._slot.assignedNodes().some(n => n.nodeType === Node.ELEMENT_NODE || n.data.trim()));
    this._text.hidden = !hasText;
    this._row.style.display = hasText ? '' : 'contents';
  }

  setupEvents() {
    this._onClick = () => this.toggle();
    this._onSlot = () => this._syncText();
    this._btn.addEventListener('click', this._onClick);
    this._slot.addEventListener('slotchange', this._onSlot);
    this._syncText();
  }

  teardownEvents() {
    this._btn?.removeEventListener('click', this._onClick);
    this._slot?.removeEventListener('slotchange', this._onSlot);
  }

  toggle() {
    if (this.getBoolAttr('disabled') || this._formDisabled) return;
    this.checked = !this.checked;
    this.emit('nk-change', { checked: this.checked, value: this.getAttribute('value') || 'on', name: this.name });
    this.dispatchEvent(new Event('change', { bubbles: true }));
  }

  onAttributeChanged(name) {
    if (!this._btn) return;
    if (name === 'text') { this._syncText(); return; }
    this._apply();
    this._syncFormValue();
  }

  _syncFormValue() {
    const val = this.getAttribute('value') || 'on';
    this.setFormValue(this.getBoolAttr('checked') ? val : null, this.getBoolAttr('checked') ? 'checked' : 'unchecked');
  }

  resetValue() { this.setBoolAttr('checked', this._defaultChecked); }
  restoreValue(state) { if (state === 'checked' || state === 'unchecked') this.setBoolAttr('checked', state === 'checked'); }
  onFormDisabled(disabled) { this._formDisabled = disabled; this._apply(); }

  focus(options) { this._btn?.focus(options); }

  get checked() { return this.getBoolAttr('checked'); }
  set checked(v) { this.setBoolAttr('checked', v); }
  get disabled() { return this.getBoolAttr('disabled'); }
  set disabled(v) { this.setBoolAttr('disabled', v); }
  get name() { return this.getAttribute('name'); }
  set name(v) { this.setAttribute('name', v); }
  get value() { return this.getAttribute('value') || 'on'; }
  set value(v) { this.setAttribute('value', v); }
  get text() { return this.getAttribute('text'); }
  set text(v) { v == null ? this.removeAttribute('text') : this.setAttribute('text', v); }
}

customElements.define('nk-switch', NkSwitch);

export { NkSwitch };
