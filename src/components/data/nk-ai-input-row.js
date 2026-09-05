import { NkElement } from '../../base.js';

// <nk-ai-input-row placeholder="Ask Mona something …"></nk-ai-input-row>
// → <div class="nk-ai-input-row"><span>✨</span><input><button class="nk-ai-send">↑</button></div>
// Enter or the send button fires nk-submit { text } and clears the field.
class NkAiInputRow extends NkElement {
  static get observedAttributes() { return ['placeholder', 'value', 'disabled', 'icon']; }

  render() {
    this._row = this.createElement('div', ['nk-ai-input-row']);
    this._icon = document.createElement('span');
    this._icon.style.fontSize = '14px';
    this._input = this.createElement('input', [], { type: 'text', 'aria-label': 'Message' });
    this._btn = this.createElement('button', ['nk-ai-send'], { type: 'button', 'aria-label': 'Send' });
    this._btn.textContent = '↑';
    this._row.append(this._icon, this._input, this._btn);
    this._wrapper.appendChild(this._row);
    this._sync();
  }

  _sync() {
    this._input.placeholder = this.getAttribute('placeholder') || 'Ask something …';
    if (this.hasAttribute('value') && this._input.value !== this.getAttribute('value')) this._input.value = this.getAttribute('value');
    this._input.disabled = this._btn.disabled = this.getBoolAttr('disabled');
    const icon = this.getAttribute('icon') ?? '✨';
    this._icon.textContent = icon;
    this._icon.style.display = icon ? '' : 'none';
  }

  setupEvents() {
    this._onSend = () => this.submit();
    this._onKey = (e) => { if (e.key === 'Enter') { e.preventDefault(); this.submit(); } };
    this._btn.addEventListener('click', this._onSend);
    this._input.addEventListener('keydown', this._onKey);
  }

  teardownEvents() {
    this._btn?.removeEventListener('click', this._onSend);
    this._input?.removeEventListener('keydown', this._onKey);
  }

  submit() {
    const text = this._input.value.trim();
    if (!text || this.getBoolAttr('disabled')) return;
    const ok = this.emit('nk-submit', { text });
    if (ok) this._input.value = '';
  }

  onAttributeChanged() { this._sync(); }
  focus(o) { this._input?.focus(o); }
  get value() { return this._input?.value ?? ''; }
  set value(v) { if (this._input) this._input.value = v ?? ''; }
}

customElements.define('nk-ai-input-row', NkAiInputRow);
export { NkAiInputRow };
