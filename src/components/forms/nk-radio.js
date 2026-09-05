import { NkFormElement } from '../../base.js';

// <nk-radio name="style" value="concise" checked>Concise</nk-radio>
// → <label class="nk-check"><input type="radio"> Concise</label>
//
// ── Grouping ──
// Every <nk-radio> keeps its <input type="radio"> in its own shadow root, and
// native radio grouping works per tree — it does not reach across shadow
// boundaries. Two <nk-radio name="x"> would therefore both stay checked. So
// the group is kept here, following the native definition: same `name`,
// same containing tree, same form owner. One tab stop per group, arrow keys
// move within it (wrapping, skipping disabled), and select as they go.

const ARROW_KEYS = { ArrowDown: 1, ArrowRight: 1, ArrowUp: -1, ArrowLeft: -1 };

/** Form owner, also for a peer that has not been upgraded yet. */
function ownerForm(el) {
  return (el.form !== undefined ? el.form : el.closest('form')) ?? null;
}

/** Only the selected radio is a tab stop; arrow keys move within the group. */
function syncGroupTabIndex(group) {
  const enabled = group.filter(el => !el.disabled);
  if (!enabled.length) return;
  const focusable = enabled.find(el => el.checked) || enabled[0];
  for (const el of group) {
    if (el._input) el._input.tabIndex = el === focusable ? 0 : -1;
  }
}

class NkRadio extends NkFormElement {
  static get observedAttributes() { return ['checked', 'disabled', 'name', 'value', 'required']; }

  render() {
    const label = this.createElement('label', ['nk-check']);
    this._input = this.createElement('input', [], { type: 'radio' });
    // `name` on the inner input is inert (it is alone in its tree); it stays
    // as a devtools courtesy. The group above is the real one.
    this._apply();
    this._defaultChecked = this.getBoolAttr('checked');
    label.appendChild(this._input);
    label.appendChild(document.createElement('slot'));
    this._wrapper.appendChild(label);
    this._syncFormValue();
    // Elements upgrade in document order, so the last `checked` one in the
    // markup wins the group — the same outcome native radios produce.
    if (this._input.checked) this._uncheckPeers();
    syncGroupTabIndex(this._group());
  }

  _apply() {
    this._input.checked = this.getBoolAttr('checked');
    this._input.disabled = this.getBoolAttr('disabled') || !!this._formDisabled;
    this._input.required = this.getBoolAttr('required');
    const name = this.getAttribute('name');
    name ? this._input.setAttribute('name', name) : this._input.removeAttribute('name');
    this._input.value = this.getAttribute('value') || '';
  }

  setupEvents() {
    this._onChange = () => this._applyChange();
    this._onKeyDown = (e) => {
      const dir = ARROW_KEYS[e.key];
      if (!dir || e.ctrlKey || e.metaKey || e.altKey) return;
      const group = this._group().filter(el => !el.disabled);
      if (group.length < 2) return;
      e.preventDefault();
      const next = group[(group.indexOf(this) + dir + group.length) % group.length];
      next._input.focus();
      next._input.checked = true;
      next._applyChange();
    };
    this._input.addEventListener('change', this._onChange);
    this._input.addEventListener('keydown', this._onKeyDown);
    syncGroupTabIndex(this._group());
  }

  teardownEvents() {
    this._input?.removeEventListener('change', this._onChange);
    this._input?.removeEventListener('keydown', this._onKeyDown);
  }

  /** Shared by user change and arrow-key selection, so both look identical. */
  _applyChange() {
    if (this._input.checked) this._uncheckPeers();
    this._syncing = true;
    this.setBoolAttr('checked', this._input.checked);
    this._syncing = false;
    this._syncFormValue();
    syncGroupTabIndex(this._group());
    this.emit('nk-change', { checked: this._input.checked, value: this._input.value, name: this.name });
    this.dispatchEvent(new Event('change', { bubbles: true }));
  }

  /** Same name, same tree, same form owner — in document order, this element included. */
  _group() {
    const name = this.getAttribute('name');
    const root = this.getRootNode();
    if (!name || typeof root?.querySelectorAll !== 'function') return [this];
    const form = ownerForm(this);
    return [...root.querySelectorAll('nk-radio')].filter(
      el => el.getAttribute('name') === name && ownerForm(el) === form
    );
  }

  _uncheckPeers() {
    for (const el of this._group()) {
      if (el !== this && el.checked) el.checked = false;
    }
  }

  onAttributeChanged(name) {
    if (this._syncing || !this._input) return;
    this._apply();
    if (name === 'checked' && this._input.checked) this._uncheckPeers();
    this._syncFormValue();
    syncGroupTabIndex(this._group());
  }

  _syncFormValue() {
    const val = this.getAttribute('value') || '';
    this.setFormValue(this._input.checked ? val : null, this._input.checked ? 'checked' : 'unchecked');
    this.syncValidityFrom(this._input);
  }

  resetValue() {
    this._input.checked = this._defaultChecked;
    this.setBoolAttr('checked', this._defaultChecked);
    this._syncFormValue();
    syncGroupTabIndex(this._group());
  }

  restoreValue(state) {
    if (state === 'checked') this.checked = true;
  }

  onFormDisabled(disabled) { this._formDisabled = disabled; this._apply(); syncGroupTabIndex(this._group()); }

  focus(options) { this._input?.focus(options); }

  get checked() { return this._input?.checked ?? this.getBoolAttr('checked'); }
  set checked(v) {
    if (this._input) this._input.checked = v;
    // Also covers the case where the attribute is already present, so
    // setBoolAttr stays silent and onAttributeChanged never runs.
    if (v) this._uncheckPeers();
    this.setBoolAttr('checked', v);
    if (this._input) { this._syncFormValue(); syncGroupTabIndex(this._group()); }
  }
  get disabled() { return this.getBoolAttr('disabled'); }
  set disabled(v) { this.setBoolAttr('disabled', v); }
  get name() { return this.getAttribute('name'); }
  set name(v) { this.setAttribute('name', v); }
  get value() { return this.getAttribute('value') || ''; }
  set value(v) { this.setAttribute('value', v); }
}

customElements.define('nk-radio', NkRadio);
export { NkRadio };
