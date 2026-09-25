import { NkElement } from '../../base.js';
import { lockScroll, unlockScroll, inertOutside, deepActiveElement } from '../../util/focus.js';

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
//
// `resizable` (NotionKit 1.10.0): the left edge takes the pointer – and the
// arrow keys, 16px a step – to make the peek wider or narrower, as in
// Notion: from `min` (380) to `max` (all but 320px of the window). The width
// is the token --nk-peek-width, set on :root; `width` (px) sets it too, and
// nk-resize { width } fires when a drag or a key ends – the moment to keep
// it. resize-label names the edge (default "Resize", in German "Breite
// ändern").
// `inset`: while it is open on the desktop, the page's <nk-app> gets
// `peek-inset` – its main column makes room instead of lying under the peek.
const CLOSE_ICON = '<svg viewBox="0 0 24 24" aria-hidden="true"><path d="m6 17 5-5-5-5M13 17l5-5-5-5"/></svg>';
const OVERLAYS = new Set(['nk-menu', 'nk-pop', 'nk-modal', 'nk-sheet', 'nk-dialog', 'nk-cmdk', 'nk-toast']);
const OVERLAY_CLASSES = ['nk-pop', 'nk-modal-backdrop', 'nk-sheet-backdrop', 'nk-dialog-backdrop', 'nk-cmdk-backdrop'];
const phone = () => matchMedia('(max-width: 860px)').matches;

class NkPeek extends NkElement {
  static get observedAttributes() { return ['open', 'label', 'close-label', 'resizable', 'width', 'min', 'max', 'resize-label', 'inset']; }

  render() {
    this._backdrop = this.createElement('div', ['nk-peek-backdrop']);
    this._box = this.createElement('aside', ['nk-peek'], { role: 'dialog', tabindex: '-1' });
    this._handle = this.createElement('div', ['pk-resize'], { role: 'separator', 'aria-orientation': 'vertical', tabindex: '0' });
    this._box.appendChild(this._handle);
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
    this._syncResize();
    if (this.hasAttribute('width')) this._setWidth(Number(this.getAttribute('width')));
    this._syncOpen();
  }

  // ── width ──
  get _min() { return Number(this.getAttribute('min')) || 380; }
  get _max() { return Number(this.getAttribute('max')) || Math.max(this._min, innerWidth - 320); }
  /** The peek's width in px – the token --nk-peek-width. */
  get width() { return parseFloat(getComputedStyle(document.documentElement).getPropertyValue('--nk-peek-width')) || 560; }
  set width(v) { this._setWidth(Number(v)); }

  _setWidth(w) {
    if (!Number.isFinite(w)) return;
    w = Math.round(Math.min(Math.max(w, this._min), Math.max(this._min, this._max)));
    document.documentElement.style.setProperty('--nk-peek-width', `${w}px`);
    this._handle.setAttribute('aria-valuenow', w);
  }

  _syncResize() {
    this._handle.hidden = !this.getBoolAttr('resizable');
    this._handle.setAttribute('aria-label', this.getAttribute('resize-label') || this.str('resize'));
    this._handle.setAttribute('aria-valuemin', this._min);
    this._handle.setAttribute('aria-valuenow', Math.round(this.width));
  }

  /** The app whose main column makes room: the peek's own, else the page's. */
  _app() { return this.closest('nk-app') ?? document.querySelector('nk-app'); }
  _syncInset() {
    const on = this.getBoolAttr('inset') && this.getBoolAttr('open') && !phone();
    if (on) this._app()?.setAttribute('peek-inset', '');
    else if (this._insetApp) this._app()?.removeAttribute('peek-inset');
    this._insetApp = on;
  }

  _syncLabels() {
    const label = this.getAttribute('label');
    if (label) this._box.setAttribute('aria-label', label); else this._box.removeAttribute('aria-label');
    this._close.setAttribute('aria-label', this.getAttribute('close-label') || this.str('close'));
  }

  _syncOpen() {
    const open = this.getBoolAttr('open');
    this._backdrop.classList.toggle('open', open);
    this._syncInset();
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
    // The left edge: a drag with pointer capture, or the arrow keys.
    const resized = () => this.emit('nk-resize', { width: Math.round(this.width) });
    this._onResizeStart = (e) => {
      if (e.button !== 0) return;
      e.preventDefault();
      this._handle.setPointerCapture(e.pointerId);
      this._handle.classList.add('active');
    };
    this._onResizeMove = (e) => { if (this._handle.hasPointerCapture(e.pointerId)) this._setWidth(innerWidth - e.clientX); };
    this._onResizeEnd = () => { this._handle.classList.remove('active'); resized(); };
    this._onResizeKey = (e) => {
      const step = { ArrowLeft: 16, ArrowRight: -16 }[e.key];
      if (!step) return;
      e.preventDefault();
      this._setWidth(this.width + step);
      resized();
    };
    this._onViewport = () => this._syncInset();
    this._close.addEventListener('click', this._onClose);
    this._backdrop.addEventListener('click', this._onBackdrop);
    this._handle.addEventListener('pointerdown', this._onResizeStart);
    this._handle.addEventListener('pointermove', this._onResizeMove);
    this._handle.addEventListener('lostpointercapture', this._onResizeEnd);
    this._handle.addEventListener('keydown', this._onResizeKey);
    document.addEventListener('keydown', this._onKey);
    document.addEventListener('click', this._onOutside);
    addEventListener('resize', this._onViewport);
  }

  teardownEvents() {
    this._close?.removeEventListener('click', this._onClose);
    this._backdrop?.removeEventListener('click', this._onBackdrop);
    this._handle?.removeEventListener('pointerdown', this._onResizeStart);
    this._handle?.removeEventListener('pointermove', this._onResizeMove);
    this._handle?.removeEventListener('lostpointercapture', this._onResizeEnd);
    this._handle?.removeEventListener('keydown', this._onResizeKey);
    document.removeEventListener('keydown', this._onKey);
    document.removeEventListener('click', this._onOutside);
    removeEventListener('resize', this._onViewport);
    if (this._insetApp) { this._app()?.removeAttribute('peek-inset'); this._insetApp = false; }
    if (this._modal) { this._modal = false; unlockScroll(); this._undoInert?.(); this._undoInert = null; }
    this._wasOpen = false;
  }

  onStringsChanged() { this._syncResize(); this._syncLabels(); }

  onAttributeChanged(name, _old, value) {
    if (name === 'width') { this._setWidth(Number(value)); return; }
    if (name === 'inset') { this._syncInset(); return; }
    if (name !== 'open') { this._syncLabels(); this._syncResize(); return; }
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
