import { NkElement } from '../../base.js';

// <nk-prop label="Due" icon="📅">2 June 2026</nk-prop>
// → <div class="nk-prop"><dt class="p-name"><span class="p-icon">📅</span>Due</dt><dd class="p-value">2 June 2026</dd></div>
// The value is the element's content – tags, an avatar and a name, a date, a
// <nk-progress wide>. slot="icon" replaces the icon glyph. A click on the
// name or the value fires nk-action { action: 'name' | 'value', label }, the
// moment Notion opens the property's editor. `text` (NotionKit 1.12.0) lets a
// value that is text – an address, a model name with a tag – flow as text
// instead of setting its parts one under the other.
class NkProp extends NkElement {
  static get observedAttributes() { return ['label', 'icon', 'text']; }

  render() {
    this._row = this.createElement('div', ['nk-prop']);
    this._name = this.createElement('dt', ['p-name']);
    this._icon = this.createElement('span', ['p-icon']);
    const iconSlot = this.createElement('slot', [], { name: 'icon' });
    iconSlot.appendChild(this._icon);
    this._label = document.createTextNode('');
    this._name.append(iconSlot, this._label);
    this._value = this.createElement('dd', ['p-value']);
    this._value.appendChild(document.createElement('slot'));
    this._row.append(this._name, this._value);
    this._wrapper.appendChild(this._row);
    this._sync();
  }

  _sync() {
    const icon = this.getAttribute('icon');
    this._icon.textContent = icon || '';
    this._icon.style.display = icon ? '' : 'none';
    this._label.data = this.getAttribute('label') || '';
    this._value.classList.toggle('text', this.getBoolAttr('text'));
  }

  setupEvents() {
    this._onClick = (e) => {
      const part = e.composedPath().includes(this._name) ? 'name' : 'value';
      this.emit('nk-action', { action: part, label: this.label });
    };
    this._row.addEventListener('click', this._onClick);
  }

  teardownEvents() { this._row?.removeEventListener('click', this._onClick); }
  onAttributeChanged() { this._sync(); }

  get label() { return this.getAttribute('label') || ''; }
  set label(v) { this.setAttribute('label', v); }
  get icon() { return this.getAttribute('icon'); }
  set icon(v) { v == null ? this.removeAttribute('icon') : this.setAttribute('icon', v); }
  get text() { return this.getBoolAttr('text'); }
  set text(v) { this.setBoolAttr('text', v); }
}

customElements.define('nk-prop', NkProp);
export { NkProp };
