import { NkFormElement } from './base.js';
import '@jungherz-de/notionkit/notionkit-styles.js';

// <nk-segmented name="range" value="week">
//   <button value="week">Week</button><button value="month">Month</button>
// </nk-segmented>
// → <div class="nk-segmented">…</div> with .active on the chosen button.
// The buttons stay in the light DOM (their look comes from the ::slotted
// twins); the element sets type/role, moves .active and submits the value.
const KEYS = { ArrowRight: 1, ArrowDown: 1, ArrowLeft: -1, ArrowUp: -1 };

class NkSegmented extends NkFormElement {
  static get observedAttributes() { return ['value', 'name', 'disabled', 'scroll', 'wrap']; }

  render() {
    this._box = this.createElement('div', ['nk-segmented'], { role: 'radiogroup' });
    this._slot = document.createElement('slot');
    this._box.appendChild(this._slot);
    this._wrapper.appendChild(this._box);
    this._syncBox();
    this._sync();
  }

  // `scroll`: one horizontally scrollable row, scrollbar hidden; `wrap`: rows.
  _syncBox() {
    this._box.classList.toggle('scroll', this.getBoolAttr('scroll'));
    this._box.classList.toggle('wrap', this.getBoolAttr('wrap'));
  }

  get buttons() { return this._slot?.assignedElements().filter(el => el.localName === 'button') ?? []; }
  _valueOf(btn) { return btn.getAttribute('value') ?? btn.textContent.trim(); }

  _sync() {
    const buttons = this.buttons;
    if (!buttons.length) return;
    let value = this.getAttribute('value');
    if (value === null || !buttons.some(b => this._valueOf(b) === value)) {
      value = this._valueOf(buttons.find(b => b.classList.contains('active')) || buttons[0]);
    }
    if (this._defaultValue === undefined) this._defaultValue = value;
    const disabled = this.getBoolAttr('disabled') || !!this._formDisabled;
    for (const b of buttons) {
      const on = this._valueOf(b) === value;
      b.type = 'button';
      b.setAttribute('role', 'radio');
      b.setAttribute('aria-checked', on ? 'true' : 'false');
      b.classList.toggle('active', on);
      b.tabIndex = on ? 0 : -1;
      b.disabled = disabled;
    }
    this._value = value;
    this.setFormValue(value);
  }

  setupEvents() {
    this._onSlot = () => this._sync();
    this._onClick = (e) => {
      const btn = e.target.closest?.('button');
      if (!btn || !this.buttons.includes(btn) || btn.disabled) return;
      this._choose(this._valueOf(btn));
    };
    this._onKey = (e) => {
      const dir = KEYS[e.key];
      if (!dir) return;
      const buttons = this.buttons;
      const i = buttons.indexOf(e.target.closest?.('button'));
      if (i < 0 || buttons.length < 2) return;
      e.preventDefault();
      const next = buttons[(i + dir + buttons.length) % buttons.length];
      this._choose(this._valueOf(next));
      next.focus();
    };
    this._slot.addEventListener('slotchange', this._onSlot);
    this.addEventListener('click', this._onClick);
    this.addEventListener('keydown', this._onKey);
    this._sync();
  }

  teardownEvents() {
    this._slot?.removeEventListener('slotchange', this._onSlot);
    this.removeEventListener('click', this._onClick);
    this.removeEventListener('keydown', this._onKey);
  }

  _choose(value) {
    if (value === this._value) return;
    this._syncing = true;
    this.setAttribute('value', value);
    this._syncing = false;
    this._sync();
    this.emit('nk-change', { value, name: this.name });
    this.dispatchEvent(new Event('change', { bubbles: true }));
  }

  onAttributeChanged(name) {
    if (name === 'scroll' || name === 'wrap') { this._syncBox(); return; }
    if (!this._syncing) this._sync();
  }
  resetValue() { if (this._defaultValue !== undefined) this.setAttribute('value', this._defaultValue); }
  onFormDisabled(d) { this._formDisabled = d; this._sync(); }

  get value() { return this._value ?? this.getAttribute('value'); }
  set value(v) { this.setAttribute('value', v); }
  get name() { return this.getAttribute('name'); }
  set name(v) { this.setAttribute('name', v); }
  get scroll() { return this.getBoolAttr('scroll'); }
  set scroll(v) { this.setBoolAttr('scroll', v); }
  get wrap() { return this.getBoolAttr('wrap'); }
  set wrap(v) { this.setBoolAttr('wrap', v); }
}

customElements.define('nk-segmented', NkSegmented);

export { NkSegmented };
