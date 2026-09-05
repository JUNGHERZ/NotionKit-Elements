import { N as NkElement } from './shared/base-6gEcoatG.js';

// <nk-tab value="notes" active>📝 Notes</nk-tab>  →  <span class="nk-tab active" role="tab">
class NkTab extends NkElement {
  static get observedAttributes() { return ['active', 'value', 'disabled']; }

  render() {
    this._tab = this.createElement('span', ['nk-tab'], { role: 'tab' });
    this._tab.appendChild(document.createElement('slot'));
    this._wrapper.appendChild(this._tab);
    this._sync();
  }

  _sync() {
    const active = this.getBoolAttr('active');
    this._tab.classList.toggle('active', active);
    this._tab.setAttribute('aria-selected', active ? 'true' : 'false');
    this._tab.tabIndex = active ? 0 : -1;
    this._tab.setAttribute('aria-disabled', this.getBoolAttr('disabled') ? 'true' : 'false');
  }

  setupEvents() {
    this._onClick = () => this.select();
    this._onKey = (e) => { if (e.key === 'Enter' || e.key === ' ') { e.preventDefault(); this.select(); } };
    this._tab.addEventListener('click', this._onClick);
    this._tab.addEventListener('keydown', this._onKey);
  }

  teardownEvents() {
    this._tab?.removeEventListener('click', this._onClick);
    this._tab?.removeEventListener('keydown', this._onKey);
  }

  select() {
    if (this.getBoolAttr('disabled')) return;
    const ok = this.emit('nk-select', { value: this.value, label: this.textContent.trim(), item: this });
    if (!ok) return;
    const tabs = this.closest('nk-tabs');
    if (tabs) tabs.value = this.value;
    else this.setBoolAttr('active', true);
  }

  onAttributeChanged() { this._sync(); }
  focus(o) { this._tab?.focus(o); }

  get value() { return this.getAttribute('value') ?? this.textContent.trim(); }
  set value(v) { this.setAttribute('value', v); }
  get active() { return this.getBoolAttr('active'); }
  set active(v) { this.setBoolAttr('active', v); }
}

customElements.define('nk-tab', NkTab);

export { NkTab };
