import { a as NkFormElement } from './shared/base-6gEcoatG.js';

// <nk-slider name="size" min="12" max="18" value="14" show-value></nk-slider>
// → <input type="range" class="nk-slider"> <div class="nk-slider-value">14</div>
const FORWARDED = ['name', 'min', 'max', 'step', 'aria-label'];

class NkSlider extends NkFormElement {
  static get observedAttributes() { return ['value', 'disabled', 'show-value', 'unit', ...FORWARDED]; }

  render() {
    this._input = this.createElement('input', ['nk-slider'], { type: 'range' });
    this._out = this.createElement('div', ['nk-slider-value']);
    this._apply();
    this._input.value = this.getAttribute('value') ?? this._input.value;
    this._defaultValue = this._input.value;
    this._wrapper.appendChild(this._input);
    this._wrapper.appendChild(this._out);
    this._syncOut();
    this._syncFormValue();
  }

  _apply() {
    for (const attr of FORWARDED) {
      const v = this.getAttribute(attr);
      v === null ? this._input.removeAttribute(attr) : this._input.setAttribute(attr, v);
    }
    this._input.disabled = this.getBoolAttr('disabled') || !!this._formDisabled;
    this._out.style.display = this.getBoolAttr('show-value') ? '' : 'none';
  }

  _syncOut() {
    this._out.textContent = `${this._input.value}${this.getAttribute('unit') || ''}`;
  }

  setupEvents() {
    this._onInput = () => {
      this._syncOut();
      this._syncFormValue();
      this.emit('nk-input', { value: Number(this._input.value), name: this.name });
    };
    this._onChange = () => {
      this._syncFormValue();
      this.emit('nk-change', { value: Number(this._input.value), name: this.name });
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
    if (name === 'value') this._input.value = this.getAttribute('value') ?? '';
    else this._apply();
    this._syncOut();
    this._syncFormValue();
  }

  _syncFormValue() { this.setFormValue(this._input.value); }
  resetValue() { this._input.value = this._defaultValue; this._syncOut(); this._syncFormValue(); }
  restoreValue(state) { if (typeof state === 'string') { this._input.value = state; this._syncOut(); this._syncFormValue(); } }
  onFormDisabled(disabled) { this._formDisabled = disabled; this._apply(); }

  focus(options) { this._input?.focus(options); }

  get value() { return Number(this._input?.value ?? this.getAttribute('value')); }
  set value(v) {
    if (this._input) { this._input.value = v; this._syncOut(); this._syncFormValue(); }
    else this.setAttribute('value', v);
  }
  get name() { return this.getAttribute('name'); }
  set name(v) { this.setAttribute('name', v); }
  get disabled() { return this.getBoolAttr('disabled'); }
  set disabled(v) { this.setBoolAttr('disabled', v); }
  get showValue() { return this.getBoolAttr('show-value'); }
  set showValue(v) { this.setBoolAttr('show-value', v); }
}

customElements.define('nk-slider', NkSlider);

export { NkSlider };
