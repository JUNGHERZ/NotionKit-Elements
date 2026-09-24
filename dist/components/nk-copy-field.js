import { NkElement } from './base.js';
import '@jungherz-de/notionkit/notionkit-styles.js';

// <nk-copy-field value="https://monahilft.notionkit.app"></nk-copy-field>
// <nk-copy-field value="ntn_4f2…" secret mono></nk-copy-field>
// → <div class="nk-copy-field mono"><span class="cf-value">…</span>
//     <button class="cf-btn">Show</button><button class="cf-btn">Copy</button></div>
// A value to take along – a link, an address, a key (NotionKit 1.8.0). Copy
// writes it to the clipboard and says "Copied" in green for a moment; where
// the clipboard is not allowed, the value is shown and selected instead, for
// ⌘C. `secret` masks it behind a Show/Hide toggle; Copy still copies the
// real value. `value` set as a property is not reflected, so a key never
// lands in the markup. Fires nk-action { action: 'copy', value, ok }. The
// texts are attributes: copy-label, copied-label, show-label, hide-label.
class NkCopyField extends NkElement {
  static get observedAttributes() { return ['value', 'mono', 'wrap', 'wide', 'secret', 'copy-label', 'copied-label', 'show-label', 'hide-label']; }

  render() {
    this._val ??= this.getAttribute('value') ?? '';
    this._box = this.createElement('div', ['nk-copy-field']);
    this._text = this.createElement('span', ['cf-value']);
    this._show = this.createElement('button', ['cf-btn'], { type: 'button' });
    this._copy = this.createElement('button', ['cf-btn'], { type: 'button' });
    this._box.append(this._text, this._copy);
    this._wrapper.appendChild(this._box);
    this._sync();
  }

  _sync() {
    if (!this._box) return;
    for (const m of ['mono', 'wrap', 'wide']) this._box.classList.toggle(m, this.getBoolAttr(m));
    const secret = this.getBoolAttr('secret');
    this._text.textContent = secret && !this._revealed ? '•'.repeat(Math.min(this._val.length, 24)) : this._val;
    // Not `hidden`: .cf-btn sets no display of its own that could lose to it,
    // but a button that is not there cannot be tabbed to either.
    if (secret && !this._show.isConnected) this._copy.before(this._show);
    if (!secret) this._show.remove();
    this._show.textContent = this._revealed ? (this.getAttribute('hide-label') || 'Hide') : (this.getAttribute('show-label') || 'Show');
    this._show.setAttribute('aria-pressed', String(!!this._revealed));
    this._copy.textContent = this._copied ? (this.getAttribute('copied-label') || 'Copied') : (this.getAttribute('copy-label') || 'Copy');
    this._copy.classList.toggle('copied', !!this._copied);
  }

  setupEvents() {
    this._onCopy = () => this.copy();
    this._onShow = () => { this._revealed = !this._revealed; this._sync(); };
    this._copy.addEventListener('click', this._onCopy);
    this._show.addEventListener('click', this._onShow);
  }

  teardownEvents() {
    this._copy?.removeEventListener('click', this._onCopy);
    this._show?.removeEventListener('click', this._onShow);
    clearTimeout(this._timer);
  }

  onAttributeChanged(name, _old, value) {
    if (name === 'value') this._val = value ?? '';
    this._sync();
  }

  /** Copies the value; resolves to whether the clipboard took it. */
  async copy() {
    const value = this._val;
    let ok = true;
    try { await navigator.clipboard.writeText(value); } catch { ok = false; }
    if (ok) {
      this._copied = true;
      clearTimeout(this._timer);
      this._timer = setTimeout(() => { this._copied = false; this._sync(); }, 1500);
    } else {
      this._revealed = true;
    }
    this._sync();
    if (!ok) getSelection()?.selectAllChildren(this._text);
    this.emit('nk-action', { action: 'copy', value, ok });
    return ok;
  }

  get value() { return this._val ?? this.getAttribute('value') ?? ''; }
  set value(v) { this._val = v == null ? '' : String(v); this._sync(); }
  get secret() { return this.getBoolAttr('secret'); }
  set secret(v) { this.setBoolAttr('secret', v); }
}

customElements.define('nk-copy-field', NkCopyField);

export { NkCopyField };
