import { NkElement } from '../../base.js';

// <nk-pop placement="bottom-start">
//   <nk-btn slot="trigger" variant="secondary">Options</nk-btn>
//   <nk-menu>…</nk-menu>
// </nk-pop>
// The trigger stays in the light DOM; a click on it toggles `open`, outside
// clicks and Escape close. Content is wrapped in `.nk-pop` unless it brings
// its own surface (nk-menu, nk-emoji-picker) or `bare` is set. The only
// styling here is positioning – the surface look is the stylesheet's.
const popSheet = new CSSStyleSheet();
popSheet.replaceSync(`
  .nk-pop-anchor { position: relative; display: inline-block; }
  .nk-pop-float { display: none; position: absolute; z-index: 50; top: 100%; left: 0; margin-top: 4px; }
  :host([open]) .nk-pop-float { display: block; }
  :host([placement="bottom-end"]) .nk-pop-float { left: auto; right: 0; }
  :host([placement="top-start"]) .nk-pop-float { top: auto; bottom: 100%; margin: 0 0 4px; }
  :host([placement="top-end"]) .nk-pop-float { top: auto; bottom: 100%; left: auto; right: 0; margin: 0 0 4px; }
`);
const OWN_SURFACE = new Set(['nk-menu', 'nk-emoji-picker']);

class NkPop extends NkElement {
  static get hostStyles() { return popSheet; }
  static get observedAttributes() { return ['open', 'placement', 'bare']; }

  render() {
    const anchor = this.createElement('div', ['nk-pop-anchor']);
    this._triggerSlot = this.createElement('slot', [], { name: 'trigger' });
    this._float = this.createElement('div', ['nk-pop-float']);
    this._surface = this.createElement('div', ['nk-pop']);
    this._slot = document.createElement('slot');
    this._surface.appendChild(this._slot);
    this._float.appendChild(this._surface);
    anchor.append(this._triggerSlot, this._float);
    this._wrapper.appendChild(anchor);
    this._syncSurface();
  }

  _syncSurface() {
    const bare = this.getBoolAttr('bare') || this._slot.assignedElements().some(el => OWN_SURFACE.has(el.localName));
    this._surface.className = bare ? '' : 'nk-pop';
  }

  setupEvents() {
    this._onTrigger = (e) => {
      if (!e.composedPath().some(n => n instanceof Element && n.getAttribute?.('slot') === 'trigger')) return;
      e.stopPropagation();
      this.toggle();
    };
    this._onDocClick = (e) => { if (this.getBoolAttr('open') && !e.composedPath().includes(this)) this.close(); };
    this._onKey = (e) => { if (e.key === 'Escape' && this.getBoolAttr('open')) this.close(); };
    this._onSelect = (e) => { if (e.target !== this) this.close(); };
    this._onSlot = () => this._syncSurface();
    this.addEventListener('click', this._onTrigger);
    document.addEventListener('click', this._onDocClick);
    document.addEventListener('keydown', this._onKey);
    this._float.addEventListener('nk-select', this._onSelect);
    this._slot.addEventListener('slotchange', this._onSlot);
  }

  teardownEvents() {
    this.removeEventListener('click', this._onTrigger);
    document.removeEventListener('click', this._onDocClick);
    document.removeEventListener('keydown', this._onKey);
    this._float?.removeEventListener('nk-select', this._onSelect);
    this._slot?.removeEventListener('slotchange', this._onSlot);
  }

  onAttributeChanged(name) {
    if (name === 'bare') this._syncSurface();
    if (name === 'open') {
      const open = this.getBoolAttr('open');
      for (const el of this._triggerSlot.assignedElements()) el.setAttribute('aria-expanded', open ? 'true' : 'false');
      this.emit('nk-toggle', { open });
    }
  }

  show() { this.setBoolAttr('open', true); }
  close() { this.setBoolAttr('open', false); }
  toggle() { this.setBoolAttr('open', !this.getBoolAttr('open')); }

  get open() { return this.getBoolAttr('open'); }
  set open(v) { this.setBoolAttr('open', v); }
  get placement() { return this.getAttribute('placement') || 'bottom-start'; }
  set placement(v) { this.setAttribute('placement', v); }
}

customElements.define('nk-pop', NkPop);
export { NkPop };
