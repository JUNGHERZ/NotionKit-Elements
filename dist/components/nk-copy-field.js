import { NkElement } from './base.js';
import '@jungherz-de/notionkit/notionkit-styles.js';

// <nk-copy-field value="https://monahilft.notionkit.app"></nk-copy-field>
// <nk-copy-field value="ntn_4f2…" secret mono></nk-copy-field>
// → <div class="nk-copy-field mono"><span class="cf-value">…</span>
//     <button class="cf-btn" aria-label="Show"><svg>…</svg><span>Show</span></button>
//     <button class="cf-btn" aria-label="Copy"><svg>…</svg><span>Copy</span></button></div>
// A value to take along – a link, an address, a key (NotionKit 1.8.0). Copy
// writes it to the clipboard and says "Copied" in green for a moment; where
// the clipboard is not allowed, the value is shown and selected instead, for
// ⌘C. `secret` masks it behind a Show/Hide toggle; Copy still copies the
// real value. `value` set as a property is not reflected, so a key never
// lands in the markup. Fires nk-action { action: 'copy', value, ok }. The
// texts come in English or German after the language (1.17.0, setStrings()
// for others); copy-label, copied-label, show-label, hide-label set them here.
// Each button carries an icon beside its word (1.18.0): on a phone, and with
// `icons` anywhere, the icon stands in for the word – two overlapping squares,
// an eye, a check in green for the moment after – and a masked key keeps a
// dozen characters more. The word stays the button's name, and while the
// icons show, its tooltip for <nk-tooltip>.
const ICONS = {
  copy: '<svg viewBox="0 0 24 24" aria-hidden="true"><path d="M15 9V5a2 2 0 0 0-2-2H5a2 2 0 0 0-2 2v8a2 2 0 0 0 2 2h4"/><rect x="9" y="9" width="12" height="12" rx="2"/></svg>',
  copied: '<svg viewBox="0 0 24 24" aria-hidden="true"><path d="M20 6 9 17l-5-5"/></svg>',
  show: '<svg viewBox="0 0 24 24" aria-hidden="true"><path d="M2 12s3.5-7 10-7 10 7 10 7-3.5 7-10 7S2 12 2 12Z"/><circle cx="12" cy="12" r="3"/></svg>',
  hide: '<svg viewBox="0 0 24 24" aria-hidden="true"><path d="M2 12s3.5-7 10-7 10 7 10 7-3.5 7-10 7S2 12 2 12Z"/><circle cx="12" cy="12" r="3"/><path d="m3 3 18 18"/></svg>',
};
const PHONE = typeof matchMedia === 'function' ? matchMedia('(max-width: 860px)') : null;

class NkCopyField extends NkElement {
  static get observedAttributes() { return ['value', 'mono', 'wrap', 'wide', 'secret', 'icons', 'copy-label', 'copied-label', 'show-label', 'hide-label']; }

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
    for (const m of ['mono', 'wrap', 'wide', 'icons']) this._box.classList.toggle(m, this.getBoolAttr(m));
    const secret = this.getBoolAttr('secret');
    this._text.textContent = secret && !this._revealed ? '•'.repeat(Math.min(this._val.length, 24)) : this._val;
    // Not `hidden`: .cf-btn sets no display of its own that could lose to it,
    // but a button that is not there cannot be tabbed to either.
    if (secret && !this._show.isConnected) this._copy.before(this._show);
    if (!secret) this._show.remove();
    const tip = this.getBoolAttr('icons') || !!PHONE?.matches;
    this._button(this._show, this._revealed ? 'hide' : 'show', this._revealed ? (this.getAttribute('hide-label') || this.str('hide')) : (this.getAttribute('show-label') || this.str('show')), tip);
    this._show.setAttribute('aria-pressed', String(!!this._revealed));
    this._button(this._copy, this._copied ? 'copied' : 'copy', this._copied ? (this.getAttribute('copied-label') || this.str('copied')) : (this.getAttribute('copy-label') || this.str('copy')), tip);
    this._copy.classList.toggle('copied', !!this._copied);
  }

  /** The icon and the word of a button; the word is its name, and its tooltip while the icon stands in for it. */
  _button(btn, icon, word, tip) {
    if (btn.dataset.icon !== icon) { btn.innerHTML = `${ICONS[icon]}<span></span>`; btn.dataset.icon = icon; }
    btn.lastChild.textContent = word;
    btn.setAttribute('aria-label', word);
    if (tip) btn.setAttribute('data-tooltip', word); else btn.removeAttribute('data-tooltip');
  }

  setupEvents() {
    this._onCopy = () => this.copy();
    this._onShow = () => { this._revealed = !this._revealed; this._sync(); };
    this._onPhone = () => this._sync();
    this._copy.addEventListener('click', this._onCopy);
    this._show.addEventListener('click', this._onShow);
    PHONE?.addEventListener('change', this._onPhone);
  }

  teardownEvents() {
    this._copy?.removeEventListener('click', this._onCopy);
    this._show?.removeEventListener('click', this._onShow);
    PHONE?.removeEventListener('change', this._onPhone);
    clearTimeout(this._timer);
  }

  onStringsChanged() { this._sync(); }

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
  get icons() { return this.getBoolAttr('icons'); }
  set icons(v) { this.setBoolAttr('icons', v); }
}

customElements.define('nk-copy-field', NkCopyField);

export { NkCopyField };
