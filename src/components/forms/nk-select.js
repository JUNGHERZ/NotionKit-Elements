import { NkFormElement } from '../../base.js';

// <nk-select name="role" value="editor">
//   <option value="viewer">Viewer</option>
//   <option value="editor">Editor</option>
// </nk-select>
//
// The light-DOM <option>s are copied into the shadow <select>. A
// MutationObserver keeps the copy in step when a framework swaps them; the
// empty string is a valid value; the live selection survives a rebuild.
class NkSelect extends NkFormElement {
  static get observedAttributes() { return ['value', 'name', 'disabled', 'required', 'compact', 'aria-label']; }
  static get observesLightDom() { return true; }

  render() {
    this._select = this.createElement('select', ['nk-select']);
    this._forwardAll();
    this._wrapper.appendChild(this._select);
    this._defaultValue = this.getAttribute('value');
    // Children may not be parsed yet when connectedCallback runs.
    this.projectLightDom();
    requestAnimationFrame(() => this.projectLightDom());
  }

  _forwardAll() {
    const name = this.getAttribute('name');
    name ? this._select.setAttribute('name', name) : this._select.removeAttribute('name');
    const label = this.getAttribute('aria-label');
    label ? this._select.setAttribute('aria-label', label) : this._select.removeAttribute('aria-label');
    this._select.disabled = this.getBoolAttr('disabled');
    this._select.required = this.getBoolAttr('required');
    this._select.classList.toggle('compact', this.getBoolAttr('compact'));
  }

  projectLightDom() {
    if (!this._select) return;
    // The options are pure data — the clones carry no listeners — so skipping
    // an unchanged rebuild is safe, and it keeps an open dropdown from
    // snapping shut on light-DOM churn elsewhere.
    const nodes = [...this.children].filter(n => n.matches('option, optgroup'));
    const signature = nodes.map(n => n.outerHTML).join('');
    if (signature === this._optionSignature) return;
    this._optionSignature = signature;

    // innerHTML = '' drops the selection; remember it first. selectedIndex -1
    // means "nothing selected", which is not an option whose value is "".
    const previous = this._select.selectedIndex >= 0 ? this._select.value : null;

    this._select.innerHTML = '';
    for (const node of nodes) this._select.appendChild(node.cloneNode(true));

    // Keep the live selection when it survived; otherwise the value attribute;
    // otherwise the browser default (first option / `selected`).
    if (!this._applyValue(previous)) this._applyValue(this.getAttribute('value'));
    this._syncFormValue();
  }

  /** Selects `value` if an option carries it, and reports whether it did. */
  _applyValue(value) {
    if (value === null) return false;
    if (![...this._select.options].some(o => o.value === value)) return false;
    this._select.value = value;
    return true;
  }

  setupEvents() {
    this._onChange = () => {
      this._syncFormValue();
      this.emit('nk-change', { value: this._select.value, name: this.name });
      this.dispatchEvent(new Event('change', { bubbles: true }));
    };
    this._select.addEventListener('change', this._onChange);
  }

  teardownEvents() {
    this._select?.removeEventListener('change', this._onChange);
  }

  onAttributeChanged(name) {
    if (!this._select) return;
    if (name === 'value') {
      this._applyValue(this.getAttribute('value'));
      this._syncFormValue();
      return;
    }
    this._forwardAll();
    this._syncFormValue();
  }

  _syncFormValue() {
    this.setFormValue(this._select.value);
    this.syncValidityFrom(this._select);
  }

  resetValue() {
    if (!this._applyValue(this._defaultValue)) this._select.selectedIndex = 0;
    this._syncFormValue();
  }

  restoreValue(state) {
    if (typeof state === 'string') { this._applyValue(state); this._syncFormValue(); }
  }

  onFormDisabled(disabled) { this._select.disabled = disabled || this.getBoolAttr('disabled'); }

  focus(options) { this._select?.focus(options); }

  get value() { return this._select?.value ?? ''; }
  set value(v) {
    if (this._select) { this._select.value = v; this._syncFormValue(); }
    else this.setAttribute('value', v);
  }
  get selectedIndex() { return this._select?.selectedIndex ?? -1; }
  get options() { return this._select?.options ?? []; }
  get name() { return this.getAttribute('name'); }
  set name(v) { this.setAttribute('name', v); }
  get disabled() { return this.getBoolAttr('disabled'); }
  set disabled(v) { this.setBoolAttr('disabled', v); }
  get required() { return this.getBoolAttr('required'); }
  set required(v) { this.setBoolAttr('required', v); }
  get compact() { return this.getBoolAttr('compact'); }
  set compact(v) { this.setBoolAttr('compact', v); }
}

customElements.define('nk-select', NkSelect);
export { NkSelect };
