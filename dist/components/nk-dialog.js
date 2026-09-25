import { NkElement } from './base.js';
import { d as deepActiveElement, l as lockScroll, i as inertOutside, f as firstFocusable, u as unlockScroll } from './shared/focus-C4tbSNND.js';
import '@jungherz-de/notionkit/notionkit-styles.js';

// <nk-dialog id="trash" title="Move “Roadmap” to trash?" alert>
//   The page and its sub-pages can be restored from Trash for 30 days.
//   <nk-btn slot="actions" variant="secondary" value="">Cancel</nk-btn>
//   <nk-btn slot="actions" variant="danger-solid" value="trash">Move to trash</nk-btn>
// </nk-dialog>
// → <div class="nk-dialog-backdrop open"><div class="nk-dialog" role="alertdialog">
//     <div class="dl-title">…</div><div class="dl-body">…</div><div class="dl-actions">…</div></div></div>
//
// A question or a short form (NotionKit 1.10.0) with the contract of
// <nk-modal> and <nk-sheet>: show(), close(), toggle(), nk-toggle; Escape –
// captured, so it closes before a peek, a menu or a modal behind it – and
// the backdrop close it; focus moves in, to an [autofocus] element or the
// first field or button, and back out; the page behind is inert and
// scroll-locked. It lies above the modal and the sheet, so a question can
// come from either. 440px, `wide` 560px; below 860px a bottom sheet with the
// buttons stacked, the confirming one on top.
// A button in slot="actions" with a `value` closes it with that value, and
// one anywhere inside with `data-close` with that attribute's value – a
// button with a value elsewhere, an option of <nk-segmented> say, leaves it
// open. The submit of a <form method="dialog"> inside closes it too, with
// its submitter's value. Before it closes, nk-close { value } fires and can
// be cancelled – the place to check an input dialog; Escape and the
// backdrop close with ''.
// `returnValue` keeps the last value. `alert` makes it an alertdialog, named
// and described by its title and text. `title` is the heading, never a
// tooltip – see NkElement.takeTitle(). Put it directly under <body>.
class NkDialog extends NkElement {
  static get observedAttributes() { return ['open', 'title', 'wide', 'alert']; }

  render() {
    this.takeTitle();
    this.returnValue = '';
    this._backdrop = this.createElement('div', ['nk-dialog-backdrop']);
    this._backdrop.inert = true;
    this._box = this.createElement('div', ['nk-dialog'], { 'aria-modal': 'true', tabindex: '-1' });
    this._heading = this.createElement('div', ['dl-title'], { id: 'title' });
    const body = this.createElement('div', ['dl-body'], { id: 'body' });
    body.appendChild(document.createElement('slot'));
    this._actions = this.createElement('div', ['dl-actions']);
    this._actionsSlot = this.createElement('slot', [], { name: 'actions' });
    this._actions.appendChild(this._actionsSlot);
    this._box.append(this._heading, body, this._actions);
    this._backdrop.appendChild(this._box);
    this._wrapper.appendChild(this._backdrop);
    this._syncTitle();
    this._syncMode();
    this._syncOpen();
  }

  _syncTitle() {
    const text = this._titleText || '';
    this._heading.textContent = text;
    this._heading.hidden = !text;
    if (text) this._box.setAttribute('aria-labelledby', 'title');
    else this._box.removeAttribute('aria-labelledby');
  }

  _syncMode() {
    const alert = this.getBoolAttr('alert');
    this._box.setAttribute('role', alert ? 'alertdialog' : 'dialog');
    if (alert) this._box.setAttribute('aria-describedby', 'body'); else this._box.removeAttribute('aria-describedby');
    this._box.classList.toggle('wide', this.getBoolAttr('wide'));
  }

  _syncOpen() {
    const open = this.getBoolAttr('open');
    this._backdrop.classList.toggle('open', open);
    this._backdrop.inert = !open;
    if (open === this._wasOpen) return;
    this._wasOpen = open;
    if (open) {
      this._returnFocus = this._from ?? deepActiveElement();
      this._from = null;
      // An overlay behind – a modal – made this host inert; the dialog lifts that while it is open.
      this._wasInert = this.inert;
      this.inert = false;
      lockScroll();
      this._undoInert = inertOutside(this);
      requestAnimationFrame(() => (this.querySelector('[autofocus]') || firstFocusable(this) || this._box).focus({ preventScroll: true }));
    } else {
      unlockScroll();
      this._undoInert?.(); this._undoInert = null;
      this.inert = this._wasInert;
      const back = this._returnFocus;
      this._returnFocus = null;
      if (back?.isConnected && typeof back.focus === 'function') back.focus({ preventScroll: true });
    }
  }

  setupEvents() {
    this._onBackdrop = (e) => { if (e.target === this._backdrop) this.close(''); };
    this._onKey = (e) => { if (e.key === 'Escape' && this.getBoolAttr('open')) { e.stopPropagation(); this.close(''); } };
    // A button in the actions with a value closes it, and one with data-close
    // anywhere inside; a submit button is the form's.
    this._onClick = (e) => {
      const path = e.composedPath(), own = path.slice(0, Math.max(0, path.indexOf(this))).filter(n => n instanceof Element && this.contains(n));
      const button = own.find(n => n.localName === 'nk-btn' || n.localName === 'button');
      if (!button || button.getAttribute('type') === 'submit' || button.hasAttribute('disabled')) return;
      if (button.hasAttribute('data-close')) { this.close(button.getAttribute('data-close')); return; }
      if (button.hasAttribute('value') && own.some(n => n.getAttribute('slot') === 'actions')) this.close(button.getAttribute('value'));
    };
    this._onSubmit = (e) => {
      if ((e.target.getAttribute('method') || '').toLowerCase() !== 'dialog') return;
      e.preventDefault();
      this.close(e.submitter?.value || e.submitter?.getAttribute?.('value') || 'submit');
    };
    this._onSlot = () => { this._actions.hidden = !this._actionsSlot.assignedElements().length; };
    this._backdrop.addEventListener('click', this._onBackdrop);
    this.addEventListener('click', this._onClick);
    this.addEventListener('submit', this._onSubmit);
    this._actionsSlot.addEventListener('slotchange', this._onSlot);
    document.addEventListener('keydown', this._onKey, true);
    this._onSlot();
  }

  teardownEvents() {
    this._backdrop?.removeEventListener('click', this._onBackdrop);
    this.removeEventListener('click', this._onClick);
    this.removeEventListener('submit', this._onSubmit);
    this._actionsSlot?.removeEventListener('slotchange', this._onSlot);
    document.removeEventListener('keydown', this._onKey, true);
    if (this._wasOpen) { unlockScroll(); this._undoInert?.(); this._undoInert = null; this._wasOpen = false; }
  }

  onAttributeChanged(name, oldValue, value) {
    if (name === 'title') { if (this.takeTitle(value)) this._syncTitle(); return; }
    if (name !== 'open') { this._syncMode(); return; }
    this._syncOpen();
    this.emit('nk-toggle', { open: this.getBoolAttr('open') });
  }

  /** Opens it; focus goes back to `from` when it closes (default: what had focus – pass the ⋯ of a menu that closes). */
  show(from) { this.returnValue = ''; this._from = from ?? null; this.setBoolAttr('open', true); }
  /** Closes with `value`, unless an nk-close listener cancels it. Returns whether it closed. */
  close(value = '') {
    if (!this.getBoolAttr('open')) return false;
    if (!this.emit('nk-close', { value })) return false;
    this.returnValue = value;
    this.setBoolAttr('open', false);
    return true;
  }
  toggle() { this.getBoolAttr('open') ? this.close('') : this.show(); }

  get open() { return this.getBoolAttr('open'); }
  set open(v) { v ? this.show() : this.close(''); }
  get title() { return this._titleText ?? ''; }
  set title(v) { this._titleText = v == null ? '' : String(v); if (this._initialized) this._syncTitle(); }
}

customElements.define('nk-dialog', NkDialog);

export { NkDialog };
