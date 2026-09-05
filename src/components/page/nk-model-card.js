import { NkFormElement } from '../../base.js';

// <nk-model-card name="model" value="gpt" title="Mona Pro" desc="Best for long documents" selected></nk-model-card>
// → <div class="nk-model-card selected"><div class="m-radio"></div><div><div class="m-name">…</div><div class="m-desc">…</div></div></div>
// Cards with the same `name` in the same tree behave like radios and submit
// the selected value with the form.
class NkModelCard extends NkFormElement {
  static get observedAttributes() { return ['name', 'value', 'title', 'desc', 'selected', 'disabled']; }

  render() {
    this._card = this.createElement('div', ['nk-model-card'], { role: 'radio', tabindex: '0' });
    this._card.appendChild(this.createElement('div', ['m-radio']));
    const text = document.createElement('div');
    this._name = this.createElement('div', ['m-name']);
    const titleSlot = this.createElement('slot', [], { name: 'title' });
    titleSlot.appendChild(this._name);
    this._desc = this.createElement('div', ['m-desc']);
    const descSlot = this.createElement('slot', [], { name: 'desc' });
    descSlot.appendChild(this._desc);
    text.append(titleSlot, descSlot);
    this._card.appendChild(text);
    this._wrapper.appendChild(this._card);
    this._defaultSelected = this.getBoolAttr('selected');
    this._sync();
    if (this.getBoolAttr('selected')) this._unselectPeers();
  }

  _sync() {
    const on = this.getBoolAttr('selected');
    this._card.classList.toggle('selected', on);
    this._card.setAttribute('aria-checked', on ? 'true' : 'false');
    this._card.setAttribute('aria-disabled', this.getBoolAttr('disabled') ? 'true' : 'false');
    this._name.textContent = this.getAttribute('title') || '';
    const desc = this.getAttribute('desc');
    this._desc.textContent = desc || '';
    this._desc.style.display = desc ? '' : 'none';
    this.setFormValue(on ? (this.getAttribute('value') || 'on') : null, on ? 'selected' : 'unselected');
  }

  _group() {
    const name = this.getAttribute('name');
    const root = this.getRootNode();
    if (!name || typeof root?.querySelectorAll !== 'function') return [this];
    return [...root.querySelectorAll('nk-model-card')].filter(el => el.getAttribute('name') === name);
  }

  _unselectPeers() {
    for (const el of this._group()) if (el !== this && el.hasAttribute('selected')) el.removeAttribute('selected');
  }

  setupEvents() {
    this._onClick = () => this.select();
    this._onKey = (e) => { if (e.key === 'Enter' || e.key === ' ') { e.preventDefault(); this.select(); } };
    this._card.addEventListener('click', this._onClick);
    this._card.addEventListener('keydown', this._onKey);
  }

  teardownEvents() {
    this._card?.removeEventListener('click', this._onClick);
    this._card?.removeEventListener('keydown', this._onKey);
  }

  select() {
    if (this.getBoolAttr('disabled') || this.getBoolAttr('selected')) return;
    this.setBoolAttr('selected', true);
    this.emit('nk-change', { value: this.value, name: this.name, checked: true });
    this.emit('nk-select', { value: this.value, label: this.getAttribute('title') });
    this.dispatchEvent(new Event('change', { bubbles: true }));
  }

  onAttributeChanged(name) {
    this._sync();
    if (name === 'selected' && this.getBoolAttr('selected')) this._unselectPeers();
  }

  resetValue() { this.setBoolAttr('selected', this._defaultSelected); }
  focus(o) { this._card?.focus(o); }

  get selected() { return this.getBoolAttr('selected'); }
  set selected(v) { this.setBoolAttr('selected', v); }
  get value() { return this.getAttribute('value') || 'on'; }
  set value(v) { this.setAttribute('value', v); }
  get name() { return this.getAttribute('name'); }
  set name(v) { this.setAttribute('name', v); }
}

customElements.define('nk-model-card', NkModelCard);
export { NkModelCard };
