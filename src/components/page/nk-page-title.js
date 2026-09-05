import { NkElement } from '../../base.js';

// <nk-page-title>NotionKit MVP</nk-page-title>          → <h1 class="nk-page-title">
// <nk-page-title editable placeholder="Untitled">…</nk-page-title>
// With `editable` the text is copied into the shadow heading (contenteditable
// cannot edit slotted nodes) and nk-change fires on blur / Enter.
class NkPageTitle extends NkElement {
  static get observedAttributes() { return ['editable', 'placeholder', 'value']; }
  static get observesLightDom() { return true; }

  render() {
    this._h1 = this.createElement('h1', ['nk-page-title']);
    this._slot = document.createElement('slot');
    this._h1.appendChild(this._slot);
    this._wrapper.appendChild(this._h1);
    this._sync();
  }

  _sync() {
    const editable = this.getBoolAttr('editable');
    if (editable) {
      if (this._slot.isConnected) this._slot.remove();
      this._h1.setAttribute('contenteditable', 'plaintext-only');
      this._h1.setAttribute('spellcheck', 'false');
      this._h1.setAttribute('role', 'textbox');
      this._h1.setAttribute('aria-label', 'Title');
      const text = this.getAttribute('value') ?? this.textContent.trim();
      if (this._h1.textContent !== text && document.activeElement !== this) this._h1.textContent = text;
      this._h1.setAttribute('data-placeholder', this.getAttribute('placeholder') || '');
    } else {
      this._h1.removeAttribute('contenteditable');
      this._h1.removeAttribute('role');
      if (this.hasAttribute('value')) { if (this._slot.isConnected) this._slot.remove(); this._h1.textContent = this.getAttribute('value'); }
      else if (!this._slot.isConnected) { this._h1.textContent = ''; this._h1.appendChild(this._slot); }
    }
  }

  projectLightDom() { if (this._h1 && !this.hasAttribute('value')) this._sync(); }

  setupEvents() {
    this._committed = this.value;
    this._onKey = (e) => { if (e.key === 'Enter') { e.preventDefault(); this._h1.blur(); } };
    this._onBlur = () => this._commit();
    this._h1.addEventListener('keydown', this._onKey);
    this._h1.addEventListener('blur', this._onBlur);
  }

  teardownEvents() {
    this._h1?.removeEventListener('keydown', this._onKey);
    this._h1?.removeEventListener('blur', this._onBlur);
  }

  _commit() {
    const value = this._h1.textContent.trim();
    if (value === this._committed) return;
    this._committed = value;
    this.emit('nk-change', { value });
  }

  onAttributeChanged() { this._sync(); }

  get value() { return this.getBoolAttr('editable') ? (this._h1?.textContent.trim() ?? '') : (this.getAttribute('value') ?? this.textContent.trim()); }
  set value(v) { this.setAttribute('value', v); }
  get editable() { return this.getBoolAttr('editable'); }
  set editable(v) { this.setBoolAttr('editable', v); }
  focus(o) { this._h1?.focus(o); }
}

customElements.define('nk-page-title', NkPageTitle);
export { NkPageTitle };
