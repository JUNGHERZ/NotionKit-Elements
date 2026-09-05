import { NkFormElement } from '../../base.js';

// <nk-todo name="task" value="1" checked>Write the docs</nk-todo>
// → <label class="nk-todo"><input type="checkbox"><span>Write the docs</span></label>
// `.nk-todo input:checked + span` strikes the text through — both siblings
// are rendered here so the combinator works; the text is slotted into <span>.
class NkTodo extends NkFormElement {
  static get observedAttributes() { return ['checked', 'disabled', 'name', 'value']; }

  render() {
    const label = this.createElement('label', ['nk-todo']);
    this._input = this.createElement('input', [], { type: 'checkbox' });
    this._apply();
    this._defaultChecked = this.getBoolAttr('checked');
    const text = document.createElement('span');
    text.appendChild(document.createElement('slot'));
    label.appendChild(this._input);
    label.appendChild(text);
    this._wrapper.appendChild(label);
    this._syncFormValue();
  }

  _apply() {
    this._input.checked = this.getBoolAttr('checked');
    this._input.disabled = this.getBoolAttr('disabled') || !!this._formDisabled;
    const name = this.getAttribute('name');
    name ? this._input.setAttribute('name', name) : this._input.removeAttribute('name');
    this._input.value = this.getAttribute('value') || 'on';
  }

  setupEvents() {
    this._onChange = () => {
      this._syncing = true;
      this.setBoolAttr('checked', this._input.checked);
      this._syncing = false;
      this._syncFormValue();
      this.emit('nk-change', { checked: this._input.checked, value: this._input.value, name: this.name });
      this.dispatchEvent(new Event('change', { bubbles: true }));
    };
    this._input.addEventListener('change', this._onChange);
  }

  teardownEvents() {
    this._input?.removeEventListener('change', this._onChange);
  }

  onAttributeChanged() {
    if (this._syncing || !this._input) return;
    this._apply();
    this._syncFormValue();
  }

  _syncFormValue() {
    this.setFormValue(this._input.checked ? this._input.value : null, this._input.checked ? 'checked' : 'unchecked');
  }

  resetValue() { this.setBoolAttr('checked', this._defaultChecked); }
  restoreValue(state) { if (state === 'checked' || state === 'unchecked') this.setBoolAttr('checked', state === 'checked'); }
  onFormDisabled(disabled) { this._formDisabled = disabled; this._apply(); }

  get checked() { return this._input?.checked ?? this.getBoolAttr('checked'); }
  set checked(v) { this.setBoolAttr('checked', v); }
  get disabled() { return this.getBoolAttr('disabled'); }
  set disabled(v) { this.setBoolAttr('disabled', v); }
  get name() { return this.getAttribute('name'); }
  set name(v) { this.setAttribute('name', v); }
  get value() { return this.getAttribute('value') || 'on'; }
  set value(v) { this.setAttribute('value', v); }
}

customElements.define('nk-todo', NkTodo);
export { NkTodo };
