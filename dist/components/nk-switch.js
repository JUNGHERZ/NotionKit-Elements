import { a as NkFormElement } from './shared/base-6gEcoatG.js';

// <nk-switch name="notify" checked></nk-switch>
// → <button class="nk-switch" role="switch" aria-checked="true">
// notionkit.css styles the state through [aria-checked]; the toggling is here.
class NkSwitch extends NkFormElement {
  static get observedAttributes() { return ['checked', 'disabled', 'name', 'value', 'label']; }

  render() {
    this._btn = this.createElement('button', ['nk-switch'], { type: 'button', role: 'switch' });
    this._defaultChecked = this.getBoolAttr('checked');
    this._apply();
    this._wrapper.appendChild(this._btn);
    this._syncFormValue();
  }

  _apply() {
    this._btn.setAttribute('aria-checked', this.getBoolAttr('checked') ? 'true' : 'false');
    this._btn.disabled = this.getBoolAttr('disabled') || !!this._formDisabled;
    const label = this.getAttribute('label');
    label ? this._btn.setAttribute('aria-label', label) : this._btn.removeAttribute('aria-label');
  }

  setupEvents() {
    this._onClick = () => this.toggle();
    this._btn.addEventListener('click', this._onClick);
  }

  teardownEvents() {
    this._btn?.removeEventListener('click', this._onClick);
  }

  toggle() {
    if (this.getBoolAttr('disabled') || this._formDisabled) return;
    this.checked = !this.checked;
    this.emit('nk-change', { checked: this.checked, value: this.getAttribute('value') || 'on', name: this.name });
    this.dispatchEvent(new Event('change', { bubbles: true }));
  }

  onAttributeChanged() {
    if (!this._btn) return;
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
}

customElements.define('nk-switch', NkSwitch);

export { NkSwitch };
