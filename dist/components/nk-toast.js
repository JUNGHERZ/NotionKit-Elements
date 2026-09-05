import { N as NkElement } from './shared/base-6gEcoatG.js';

// <nk-toast id="toast"></nk-toast>   …   toast.show('Saved');
// → <div class="nk-toast show">✓ Saved</div>
// One node, bottom-centred, auto-hides after `duration` ms (default 2200).
class NkToast extends NkElement {
  static get observedAttributes() { return ['open', 'duration', 'icon']; }

  render() {
    this._box = this.createElement('div', ['nk-toast'], { role: 'status', 'aria-live': 'polite' });
    this._icon = document.createElement('span');
    this._msg = document.createElement('span');
    this._box.append(this._icon, this._msg, document.createElement('slot'));
    this._wrapper.appendChild(this._box);
    this._sync();
  }

  _sync() {
    this._box.classList.toggle('show', this.getBoolAttr('open'));
    const icon = this.getAttribute('icon') ?? '✓';
    this._icon.textContent = icon;
    this._icon.style.display = icon ? '' : 'none';
  }

  /** Shows `message` (or the slotted content when omitted) and hides it again after `duration`. */
  show(message, { duration } = {}) {
    if (message !== undefined) this._msg.textContent = message;
    clearTimeout(this._timer);
    this.setBoolAttr('open', true);
    const ms = duration ?? Number(this.getAttribute('duration')) ?? 2200;
    if (ms > 0) this._timer = setTimeout(() => this.close(), ms || 2200);
  }

  close() { clearTimeout(this._timer); this.setBoolAttr('open', false); }

  onAttributeChanged(name) {
    this._sync();
    if (name === 'open') this.emit('nk-toggle', { open: this.getBoolAttr('open') });
  }

  disconnectedCallback() { super.disconnectedCallback(); clearTimeout(this._timer); }

  get open() { return this.getBoolAttr('open'); }
  set open(v) { this.setBoolAttr('open', v); }
  get message() { return this._msg?.textContent ?? ''; }
  set message(v) { if (this._msg) this._msg.textContent = v; }
}

customElements.define('nk-toast', NkToast);

export { NkToast };
