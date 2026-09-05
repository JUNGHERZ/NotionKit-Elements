import { NkElement } from '../../base.js';

// <nk-menu-item icon="✏️" shortcut="⌘E" value="rename">Rename</nk-menu-item>
// <nk-menu-item type="separator"></nk-menu-item>   <nk-menu-item type="label">Danger</nk-menu-item>
// <nk-menu-item icon="🗑️" danger value="delete">Delete</nk-menu-item>
// → <div class="nk-menu-item danger"><span class="m-icon">🗑️</span>Delete<span class="m-shortcut">…</span></div>
class NkMenuItem extends NkElement {
  static get observedAttributes() { return ['icon', 'shortcut', 'danger', 'value', 'type', 'disabled']; }

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
      el = this.createElement('div', ['nk-menu-item'], { role: 'menuitem', tabindex: '-1' });
      this._icon = this.createElement('span', ['m-icon']);
      const iconSlot = this.createElement('slot', [], { name: 'icon' });
      iconSlot.appendChild(this._icon);
      this._shortcut = this.createElement('span', ['m-shortcut']);
      el.append(iconSlot, document.createElement('slot'), this._shortcut);
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
  }

  setupEvents() {
    this._onClick = () => this.select();
    this._el.addEventListener('click', this._onClick);
  }

  teardownEvents() { this._el?.removeEventListener('click', this._onClick); }

  select() {
    if (!this._el.classList.contains('nk-menu-item') || this.getBoolAttr('disabled')) return;
    this.emit('nk-select', { value: this.value, label: this.textContent.trim(), item: this });
  }

  onAttributeChanged(name) { name === 'type' ? this._build() : this._sync(); }
  focus(o) { this._el?.focus(o); }
  get selectable() { return this._el?.classList.contains('nk-menu-item') && !this.getBoolAttr('disabled'); }

  get value() { return this.getAttribute('value') ?? this.textContent.trim(); }
  set value(v) { this.setAttribute('value', v); }
}

customElements.define('nk-menu-item', NkMenuItem);
export { NkMenuItem };
