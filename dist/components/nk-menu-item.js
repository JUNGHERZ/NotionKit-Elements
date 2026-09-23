import { NkElement } from './base.js';
import '@jungherz-de/notionkit/notionkit-styles.js';

// <nk-menu-item icon="✏️" shortcut="⌘E" value="rename">Rename</nk-menu-item>
// <nk-menu-item type="separator"></nk-menu-item>   <nk-menu-item type="label">Danger</nk-menu-item>
// <nk-menu-item icon="🗑️" danger value="delete">Delete</nk-menu-item>
// <nk-menu-item type="switch" icon="🔡" value="small" checked>Small text</nk-menu-item>
// <nk-menu-item type="check" icon="◉" value="open" checked>Status: Open</nk-menu-item>
// → <div class="nk-menu-item danger"><span class="m-icon">🗑️</span>Delete<span class="m-shortcut">…</span></div>
// A switch item carries a .nk-switch on the right, as "Small text" does in
// Notion's page menu; a check item a ✓ where the shortcut stands, as in a
// filter menu. A click on either flips `checked` and fires nk-change
// { value, checked } instead of nk-select, so the menu around it stays open.
class NkMenuItem extends NkElement {
  static get observedAttributes() { return ['icon', 'shortcut', 'danger', 'value', 'type', 'disabled', 'checked']; }

  render() { this._build(); }

  _build() {
    const type = this.getAttribute('type');
    let el;
    if (type === 'separator') {
      el = this.createElement('div', ['nk-menu-sep'], { role: 'separator' });
    } else if (type === 'label') {
      el = this.createElement('div', ['nk-menu-label']);
      el.appendChild(document.createElement('slot'));
    } else {
      const isSwitch = type === 'switch';
      this._check = type === 'check';
      el = this.createElement('div', ['nk-menu-item'], { role: isSwitch || this._check ? 'menuitemcheckbox' : 'menuitem', tabindex: '-1' });
      this._icon = this.createElement('span', ['m-icon']);
      const iconSlot = this.createElement('slot', [], { name: 'icon' });
      iconSlot.appendChild(this._icon);
      this._shortcut = this.createElement('span', ['m-shortcut']);
      el.append(iconSlot, document.createElement('slot'), this._shortcut);
      this._switch = isSwitch ? this.createElement('span', ['nk-switch'], { 'aria-hidden': 'true' }) : null;
      if (this._switch) el.appendChild(this._switch);
    }
    if (this._el) { this._el.removeEventListener('click', this._onClick); this._el.replaceWith(el); } else this._wrapper.appendChild(el);
    this._el = el;
    if (this._onClick) el.addEventListener('click', this._onClick);
    this._sync();
  }

  _sync() {
    if (!this._el.classList.contains('nk-menu-item')) return;
    const icon = this.getAttribute('icon');
    this._icon.textContent = icon || '';
    this._icon.style.display = icon ? '' : 'none';
    const sc = this.getAttribute('shortcut');
    this._shortcut.textContent = sc || '';
    this._shortcut.style.display = sc ? '' : 'none';
    this._el.classList.toggle('danger', this.getBoolAttr('danger'));
    this._el.setAttribute('aria-disabled', this.getBoolAttr('disabled') ? 'true' : 'false');
    if (this._switch || this._check) {
      const on = this.getBoolAttr('checked') ? 'true' : 'false';
      this._el.setAttribute('aria-checked', on);
      if (this._switch) this._switch.setAttribute('aria-checked', on);
      if (this._check) { this._shortcut.textContent = on === 'true' ? '✓' : ''; this._shortcut.style.display = ''; }
    }
  }

  setupEvents() {
    this._onClick = () => this.select();
    this._el.addEventListener('click', this._onClick);
  }

  teardownEvents() { this._el?.removeEventListener('click', this._onClick); }

  select() {
    if (!this._el.classList.contains('nk-menu-item') || this.getBoolAttr('disabled')) return;
    if (this._switch || this._check) {
      this.checked = !this.checked;
      this.emit('nk-change', { value: this.value, checked: this.checked, item: this });
      return;
    }
    this.emit('nk-select', { value: this.value, label: this.textContent.trim(), item: this });
  }

  onAttributeChanged(name) { name === 'type' ? this._build() : this._sync(); }
  focus(o) { this._el?.focus(o); }
  get selectable() { return this._el?.classList.contains('nk-menu-item') && !this.getBoolAttr('disabled'); }

  get checked() { return this.getBoolAttr('checked'); }
  set checked(v) { this.setBoolAttr('checked', v); }
  get value() { return this.getAttribute('value') ?? this.textContent.trim(); }
  set value(v) { this.setAttribute('value', v); }
}

customElements.define('nk-menu-item', NkMenuItem);

export { NkMenuItem };
