import { NkElement } from './base.js';
import { d as deepActiveElement, l as lockScroll, i as inertOutside, f as firstFocusable, u as unlockScroll } from './shared/focus-D55JGjRA.js';
import { o as openLayer, c as closeLayer } from './shared/layers-D9YYYA5g.js';
import '@jungherz-de/notionkit/notionkit-styles.js';

// <nk-sheet id="more" title="More">
//   <nk-tree manual>
//     <nk-section-label>Favourites</nk-section-label>
//     <nk-tree-item icon="🚀">NotionKit MVP</nk-tree-item>
//   </nk-tree>
// </nk-sheet>
// → <div class="nk-sheet-backdrop open"><div class="nk-sheet" role="dialog">
//     <div class="sh-grabber"></div><div class="sh-title">More</div>…</div></div>
//
// A bottom sheet (NotionKit 1.7.0) with nk-modal's contract: show(), close()
// and toggle(), Escape and the backdrop close it, focus moves in and back
// out, the page behind is scroll-locked and inert. It lies above the tab
// bar; rows inside are 40px high. `title` is the heading shown under the
// grabber and the dialog's name, never a tooltip – see NkElement.takeTitle().
// Choosing a row does not close the sheet – the app decides (nk-select
// bubbles out). Put the element directly under <body>: a transformed
// ancestor would trap the fixed backdrop.
class NkSheet extends NkElement {
  static get observedAttributes() { return ['open', 'title']; }

  render() {
    this.takeTitle();
    this._backdrop = this.createElement('div', ['nk-sheet-backdrop']);
    this._backdrop.inert = true;
    this._box = this.createElement('div', ['nk-sheet'], { role: 'dialog', 'aria-modal': 'true', tabindex: '-1' });
    this._heading = this.createElement('div', ['sh-title'], { id: 'title' });
    this._box.append(this.createElement('div', ['sh-grabber']), this._heading, document.createElement('slot'));
    this._backdrop.appendChild(this._box);
    this._wrapper.appendChild(this._backdrop);
    this._syncTitle();
    this._syncOpen();
  }

  _syncTitle() {
    const text = this._titleText || '';
    this._heading.textContent = text;
    this._heading.hidden = !text;
    if (text) this._box.setAttribute('aria-labelledby', 'title');
    else this._box.removeAttribute('aria-labelledby');
  }

  _syncOpen() {
    const open = this.getBoolAttr('open');
    this._backdrop.classList.toggle('open', open);
    this._backdrop.inert = !open;
    if (open === this._wasOpen) return;
    this._wasOpen = open;
    if (open) {
      this._returnFocus = deepActiveElement();
      lockScroll();
      this._undoInert = inertOutside(this);
      openLayer(this, () => this.close());
      requestAnimationFrame(() => (firstFocusable(this) || this._box).focus({ preventScroll: true }));
    } else {
      closeLayer(this);
      unlockScroll();
      this._undoInert?.(); this._undoInert = null;
      const back = this._returnFocus;
      if (back && typeof back.focus === 'function' && back.isConnected) back.focus({ preventScroll: true });
      this._returnFocus = null;
    }
  }

  setupEvents() {
    this._onBackdrop = (e) => { if (e.target === this._backdrop) this.close(); };
    this._backdrop.addEventListener('click', this._onBackdrop);
  }

  teardownEvents() {
    this._backdrop?.removeEventListener('click', this._onBackdrop);
    if (this._wasOpen) { closeLayer(this); unlockScroll(); this._undoInert?.(); this._undoInert = null; this._wasOpen = false; }
  }

  onAttributeChanged(name, oldValue, value) {
    if (name === 'title') { if (this.takeTitle(value)) this._syncTitle(); return; }
    this._syncOpen();
    this.emit('nk-toggle', { open: this.getBoolAttr('open') });
  }

  show() { this.setBoolAttr('open', true); }
  close() { this.setBoolAttr('open', false); }
  toggle() { this.setBoolAttr('open', !this.getBoolAttr('open')); }

  get open() { return this.getBoolAttr('open'); }
  set open(v) { this.setBoolAttr('open', v); }
  get title() { return this._titleText ?? ''; }
  set title(v) { this._titleText = v == null ? '' : String(v); if (this._initialized) this._syncTitle(); }
}

customElements.define('nk-sheet', NkSheet);

export { NkSheet };
