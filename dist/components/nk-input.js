import { a as NkFormElement } from './shared/base-6gEcoatG.js';

// <nk-input name="title" value="…" placeholder="…" wide></nk-input>  →  <input class="nk-input wide">
// Takes part in the surrounding <form> through ElementInternals.
const FORWARDED = ['type', 'placeholder', 'name', 'min', 'max', 'step', 'autocomplete', 'pattern', 'maxlength', 'minlength', 'inputmode', 'list', 'aria-label'];
const BOOLEANS = ['required', 'disabled', 'readonly'];

class NkInput extends NkFormElement {
  static get observedAttributes() { return ['value', 'wide', ...FORWARDED, ...BOOLEANS]; }

  render() {
    this._input = this.createElement('input', ['nk-input']);
    for (const attr of FORWARDED) this._forward(attr);
    for (const attr of BOOLEANS) this._forward(attr);
    this._input.value = this.getAttribute('value') ?? '';
    this._defaultValue = this._input.value;
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

  _syncWide() {
    this._input.classList.toggle('wide', this.getBoolAttr('wide'));
  }

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
    this._input.value = this.getAttribute('value') ?? '';
    this._syncFormValue();
  }

  restoreValue(state) {
    if (typeof state === 'string') { this._input.value = state; this._syncFormValue(); }
  }

  onFormDisabled(disabled) {
    this._input.disabled = disabled || this.getBoolAttr('disabled');
  }

  focus(options) { this._input?.focus(options); }
  blur() { this._input?.blur(); }
  select() { this._input?.select(); }

  get value() { return this._input?.value ?? (this.getAttribute('value') ?? ''); }
  set value(v) {
    if (this._input) { this._input.value = v ?? ''; this._syncFormValue(); }
    else this.setAttribute('value', v ?? '');
  }
  get name() { return this.getAttribute('name'); }
  set name(v) { this.setAttribute('name', v); }
  get type() { return this.getAttribute('type') || 'text'; }
  set type(v) { this.setAttribute('type', v); }
  get placeholder() { return this.getAttribute('placeholder'); }
  set placeholder(v) { this.setAttribute('placeholder', v); }
  get disabled() { return this.getBoolAttr('disabled'); }
  set disabled(v) { this.setBoolAttr('disabled', v); }
  get required() { return this.getBoolAttr('required'); }
  set required(v) { this.setBoolAttr('required', v); }
  get readonly() { return this.getBoolAttr('readonly'); }
  set readonly(v) { this.setBoolAttr('readonly', v); }
  get wide() { return this.getBoolAttr('wide'); }
  set wide(v) { this.setBoolAttr('wide', v); }
}

customElements.define('nk-input', NkInput);

export { NkInput };
