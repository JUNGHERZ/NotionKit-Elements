import { NkFormElement } from '../../base.js';

// <nk-textarea name="bio" rows="3" wide>Text</nk-textarea>  →  <textarea class="nk-textarea wide">
// The initial value is the `value` attribute, or the element's text content.
const FORWARDED = ['placeholder', 'name', 'rows', 'maxlength', 'minlength', 'autocomplete', 'aria-label'];
const BOOLEANS = ['required', 'disabled', 'readonly'];

class NkTextarea extends NkFormElement {
  static get observedAttributes() { return ['value', 'wide', ...FORWARDED, ...BOOLEANS]; }

  render() {
    this._input = this.createElement('textarea', ['nk-textarea']);
    for (const attr of [...FORWARDED, ...BOOLEANS]) this._forward(attr);
    this._input.value = this.getAttribute('value') ?? this.textContent.trim();
    this._syncWide();
    this._wrapper.appendChild(this._input);
    this._syncFormValue();
  }

  _forward(attr) {
    if (BOOLEANS.includes(attr)) {
      this._input[attr === 'readonly' ? 'readOnly' : attr] = this.getBoolAttr(attr);
      return;
    }
    const v = this.getAttribute(attr);
    if (v === null) this._input.removeAttribute(attr);
    else this._input.setAttribute(attr, v);
  }

  _syncWide() { this._input.classList.toggle('wide', this.getBoolAttr('wide')); }

  setupEvents() {
    this._onInput = () => {
      this._syncFormValue();
      this.emit('nk-input', { value: this._input.value, name: this.name });
    };
    this._onChange = () => {
      this._syncFormValue();
      this.emit('nk-change', { value: this._input.value, name: this.name });
      this.dispatchEvent(new Event('change', { bubbles: true }));
    };
    this._input.addEventListener('input', this._onInput);
    this._input.addEventListener('change', this._onChange);
  }

  teardownEvents() {
    this._input?.removeEventListener('input', this._onInput);
    this._input?.removeEventListener('change', this._onChange);
  }

  onAttributeChanged(name) {
    if (!this._input) return;
    if (name === 'value') { this._input.value = this.getAttribute('value') ?? ''; this._syncFormValue(); return; }
    if (name === 'wide') { this._syncWide(); return; }
    this._forward(name);
    this._syncFormValue();
  }

  _syncFormValue() {
    this.setFormValue(this._input.value);
    this.syncValidityFrom(this._input);
  }

  resetValue() {
    this._input.value = this.getAttribute('value') ?? this.textContent.trim();
    this._syncFormValue();
  }

  restoreValue(state) {
    if (typeof state === 'string') { this._input.value = state; this._syncFormValue(); }
  }

  onFormDisabled(disabled) { this._input.disabled = disabled || this.getBoolAttr('disabled'); }

  focus(options) { this._input?.focus(options); }
  blur() { this._input?.blur(); }

  get value() { return this._input?.value ?? (this.getAttribute('value') ?? ''); }
  set value(v) {
    if (this._input) { this._input.value = v ?? ''; this._syncFormValue(); }
    else this.setAttribute('value', v ?? '');
  }
  get name() { return this.getAttribute('name'); }
  set name(v) { this.setAttribute('name', v); }
  get disabled() { return this.getBoolAttr('disabled'); }
  set disabled(v) { this.setBoolAttr('disabled', v); }
  get required() { return this.getBoolAttr('required'); }
  set required(v) { this.setBoolAttr('required', v); }
  get wide() { return this.getBoolAttr('wide'); }
  set wide(v) { this.setBoolAttr('wide', v); }
}

customElements.define('nk-textarea', NkTextarea);
export { NkTextarea };
