import { NkElement } from './base.js';
import { d as deepActiveElement, l as lockScroll, i as inertOutside, u as unlockScroll } from './shared/focus-BNAChOXO.js';
import '@jungherz-de/notionkit/notionkit-styles.js';

// <nk-peek id="peek" label="Database Table-View">
//   <nk-btn slot="actions" variant="topbar" aria-label="Open as page"><svg …></svg></nk-btn>
//   <nk-page-title>🗃️ Database Table-View</nk-page-title>
//   <nk-props>…</nk-props>
//   <div class="nk-prose">…</div>
//   <nk-comments>…</nk-comments>
// </nk-peek>
// → <div class="nk-peek-backdrop open"><aside class="nk-peek" role="dialog">
//     <div class="pk-bar"><button class="nk-topbar-btn">»</button>…actions…</div>
//     <div class="pk-body">…</div></aside></div>
//
// Notion's side peek (NotionKit 1.8.0): a row beside the table, which stays
// usable – no scrim, nothing inert. show() slides it in and moves focus to
// it; », Escape and a click elsewhere on the page close it, and Escape and »
// hand focus back. A click that calls show() again – on another row – only
// swaps the content, and clicks inside other overlays (a menu opened from
// the peek) leave it open. Below 860px it is a bottom sheet over a dimmed
// page; there it is modal: the page is inert and scroll-locked, the dimmed
// page takes the tap that closes it. Put it directly under <body>.
const CLOSE_ICON = '<svg viewBox="0 0 24 24" aria-hidden="true"><path d="m6 17 5-5-5-5M13 17l5-5-5-5"/></svg>';
const OVERLAYS = new Set(['nk-menu', 'nk-pop', 'nk-modal', 'nk-sheet', 'nk-cmdk', 'nk-toast']);
const OVERLAY_CLASSES = ['nk-pop', 'nk-modal-backdrop', 'nk-sheet-backdrop', 'nk-cmdk-backdrop'];
const phone = () => matchMedia('(max-width: 860px)').matches;

class NkPeek extends NkElement {
  static get observedAttributes() { return ['open', 'label', 'close-label']; }

  render() {
    this._backdrop = this.createElement('div', ['nk-peek-backdrop']);
    this._box = this.createElement('aside', ['nk-peek'], { role: 'dialog', tabindex: '-1' });
    const bar = this.createElement('div', ['pk-bar']);
    this._close = this.createElement('button', ['nk-topbar-btn'], { type: 'button' });
    this._close.innerHTML = CLOSE_ICON;
    bar.append(this._close, this.createElement('slot', [], { name: 'actions' }));
    const body = this.createElement('div', ['pk-body']);
    body.appendChild(document.createElement('slot'));
    this._box.append(bar, body);
    this._backdrop.appendChild(this._box);
    this._wrapper.appendChild(this._backdrop);
    this._syncLabels();
    this._syncOpen();
  }

  _syncLabels() {
    const label = this.getAttribute('label');
    if (label) this._box.setAttribute('aria-label', label); else this._box.removeAttribute('aria-label');
    this._close.setAttribute('aria-label', this.getAttribute('close-label') || 'Close');
  }

  _syncOpen() {
    const open = this.getBoolAttr('open');
    this._backdrop.classList.toggle('open', open);
    if (open === this._wasOpen) return;
    this._wasOpen = open;
    if (open) {
      this._returnFocus = deepActiveElement();
      if (phone()) {
        this._modal = true;
        this._box.setAttribute('aria-modal', 'true');
        lockScroll();
        this._undoInert = inertOutside(this);
      }
      requestAnimationFrame(() => this._box.focus({ preventScroll: true }));
    } else {
      if (this._modal) { this._modal = false; this._box.removeAttribute('aria-modal'); unlockScroll(); this._undoInert?.(); this._undoInert = null; }
      const active = deepActiveElement();
      const inside = active && (this.contains(active) || this._shadow.contains(active) || active === document.body);
      const back = this._returnFocus;
      this._returnFocus = null;
      if (inside && back?.isConnected && typeof back.focus === 'function') back.focus({ preventScroll: true });
    }
  }

  setupEvents() {
    this._onClose = () => this.close();
    this._onBackdrop = (e) => { if (e.target === this._backdrop) this.close(); };
    this._onKey = (e) => { if (e.key === 'Escape' && this.getBoolAttr('open')) this.close(); };
    // Bubble phase, after the page's own handlers: a click that showed the
    // peek again (another row) must not close it.
    this._onOutside = (e) => {
      if (!this.getBoolAttr('open') || this._shownAt >= e.timeStamp) return;
      const path = e.composedPath();
      if (path.includes(this)) return;
      if (path.some(n => n.nodeType === 1 && (OVERLAYS.has(n.localName) || OVERLAY_CLASSES.some(c => n.classList.contains(c))))) return;
      this.close();
    };
    this._close.addEventListener('click', this._onClose);
    this._backdrop.addEventListener('click', this._onBackdrop);
    document.addEventListener('keydown', this._onKey);
    document.addEventListener('click', this._onOutside);
  }

  teardownEvents() {
    this._close?.removeEventListener('click', this._onClose);
    this._backdrop?.removeEventListener('click', this._onBackdrop);
    document.removeEventListener('keydown', this._onKey);
    document.removeEventListener('click', this._onOutside);
    if (this._modal) { this._modal = false; unlockScroll(); this._undoInert?.(); this._undoInert = null; }
    this._wasOpen = false;
  }

  onAttributeChanged(name) {
    if (name !== 'open') { this._syncLabels(); return; }
    this._syncOpen();
    this.emit('nk-toggle', { open: this.getBoolAttr('open') });
  }

  show() { this._shownAt = performance.now(); this.setBoolAttr('open', true); }
  close() { this.setBoolAttr('open', false); }
  toggle() { this.getBoolAttr('open') ? this.close() : this.show(); }

  get open() { return this.getBoolAttr('open'); }
  set open(v) { v ? this.show() : this.close(); }
}

customElements.define('nk-peek', NkPeek);

export { NkPeek };
