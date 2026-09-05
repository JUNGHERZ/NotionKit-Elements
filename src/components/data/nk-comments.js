import { NkElement } from '../../base.js';

// <nk-comments placeholder="Comment …" send-label="Send">
//   <nk-comment …>…</nk-comment>
// </nk-comments>
// → <div class="nk-comments">…<div class="nk-comment-input"><input class="nk-input"><button class="nk-btn primary small">Send</button></div></div>
// Enter or the button fires nk-submit { text } and clears the field.
class NkComments extends NkElement {
  static get observedAttributes() { return ['placeholder', 'send-label', 'no-input', 'disabled']; }

  render() {
    const box = this.createElement('div', ['nk-comments']);
    box.appendChild(document.createElement('slot'));
    this._row = this.createElement('div', ['nk-comment-input']);
    this._input = this.createElement('input', ['nk-input'], { type: 'text', 'aria-label': 'Comment' });
    this._btn = this.createElement('button', ['nk-btn', 'primary', 'small'], { type: 'button' });
    this._row.append(this._input, this._btn);
    box.appendChild(this._row);
    this._wrapper.appendChild(box);
    this._sync();
  }

  _sync() {
    this._input.placeholder = this.getAttribute('placeholder') || 'Comment …';
    this._btn.textContent = this.getAttribute('send-label') || 'Send';
    this._row.style.display = this.getBoolAttr('no-input') ? 'none' : '';
    this._input.disabled = this._btn.disabled = this.getBoolAttr('disabled');
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
    if (!text) return;
    const ok = this.emit('nk-submit', { text });
    if (ok) this._input.value = '';
  }

  onAttributeChanged() { this._sync(); }
  focus(o) { this._input?.focus(o); }
  get value() { return this._input?.value ?? ''; }
  set value(v) { if (this._input) this._input.value = v ?? ''; }
}

customElements.define('nk-comments', NkComments);
export { NkComments };
