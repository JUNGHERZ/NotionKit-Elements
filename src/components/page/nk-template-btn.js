import { NkElement } from '../../base.js';

// <nk-template-btn icon="📅" value="week-plan">Insert week plan</nk-template-btn>
// → <button class="nk-template-btn">📅 Insert week plan</button>
class NkTemplateBtn extends NkElement {
  static get observedAttributes() { return ['icon', 'value', 'disabled']; }

  render() {
    this._btn = this.createElement('button', ['nk-template-btn'], { type: 'button' });
    // One flex item: "📅 Insert week plan" is a single text run in the class
    // markup, so icon, space and label must not become separate flex items.
    const run = document.createElement('span');
    this._icon = document.createElement('span');
    this._space = document.createTextNode(' ');
    run.append(this._icon, this._space, document.createElement('slot'));
    this._btn.appendChild(run);
    this._wrapper.appendChild(this._btn);
    this._sync();
  }

  _sync() {
    const icon = this.getAttribute('icon');
    this._icon.textContent = icon || '';
    this._space.data = icon ? ' ' : '';
    this._btn.disabled = this.getBoolAttr('disabled');
  }

  setupEvents() {
    this._onClick = () => this.emit('nk-select', { value: this.value, label: this.textContent.trim() });
    this._btn.addEventListener('click', this._onClick);
  }

  teardownEvents() { this._btn?.removeEventListener('click', this._onClick); }
  onAttributeChanged() { this._sync(); }
  focus(o) { this._btn?.focus(o); }

  get value() { return this.getAttribute('value') ?? this.textContent.trim(); }
  set value(v) { this.setAttribute('value', v); }
}

customElements.define('nk-template-btn', NkTemplateBtn);
export { NkTemplateBtn };
