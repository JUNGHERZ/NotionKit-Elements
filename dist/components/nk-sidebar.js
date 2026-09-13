import { N as NkElement } from './shared/base-BPIvRI6K.js';

// <nk-sidebar slot="sidebar">
//   <nk-workspace-switcher slot="workspace" name="Acme"></nk-workspace-switcher>
//   <nk-tree>…</nk-tree>
//   <nk-tree-item slot="footer" icon="⚙️">Settings</nk-tree-item>
// </nk-sidebar>
// → <aside class="nk-sidebar"><div class="nk-workspace">…</div>
//     <div class="nk-sidebar-scroll">…</div><div class="nk-sidebar-footer">…</div></aside>
//
// The host is display:contents so the <aside> is a direct flex child of
// .nk-app, exactly like the class markup. Below 860px notionkit.css hides the
// aside; `open` brings it back as an off-canvas drawer (position only – the
// look is still the stylesheet's).
//
// The drawer slides and the scrim fades without a line of JavaScript:
// `display` transitions with transition-behavior: allow-discrete (the old
// value is held for the whole duration, so closing animates too) and
// @starting-style gives the first frame after display: none its start
// values. `position: fixed` lives on the plain .nk-sidebar, not on the open
// state – while closing, the aside is still displayed and must not fall
// back into the flow. Browsers without either feature switch hard, as
// before; prefers-reduced-motion switches hard on purpose.
const drawerSheet = new CSSStyleSheet();
drawerSheet.replaceSync(`
  .nk-sidebar-backdrop { display: none; position: fixed; inset: 0; z-index: 59; background: var(--nk-scrim-soft); }
  @media (max-width: 860px) {
    .nk-sidebar {
      position: fixed; inset: 0 auto 0 0; z-index: 60;
      transform: translateX(-100%);
      transition: background .25s ease, transform .24s cubic-bezier(.2, .8, .25, 1), display .24s;
      transition-behavior: allow-discrete;
    }
    :host([open]) .nk-sidebar { display: flex; transform: none; }
    @starting-style { :host([open]) .nk-sidebar { transform: translateX(-100%); } }
    .nk-sidebar-backdrop {
      opacity: 0;
      transition: opacity .24s ease, display .24s;
      transition-behavior: allow-discrete;
    }
    :host([open]) .nk-sidebar-backdrop { display: block; opacity: 1; }
    @starting-style { :host([open]) .nk-sidebar-backdrop { opacity: 0; } }
  }
  @media (prefers-reduced-motion: reduce) { .nk-sidebar, .nk-sidebar-backdrop { transition: none; } }
`);

class NkSidebar extends NkElement {
  static get hostStyles() { return drawerSheet; }
  static get observedAttributes() { return ['open']; }

  render() {
    this._backdrop = this.createElement('div', ['nk-sidebar-backdrop']);
    this._aside = this.createElement('aside', ['nk-sidebar']);
    this._aside.appendChild(this.createElement('slot', [], { name: 'workspace' }));
    const scroll = this.createElement('div', ['nk-sidebar-scroll']);
    scroll.appendChild(document.createElement('slot'));
    this._aside.appendChild(scroll);
    this._footer = this.createElement('div', ['nk-sidebar-footer']);
    this._footerSlot = this.createElement('slot', [], { name: 'footer' });
    this._footer.appendChild(this._footerSlot);
    this._aside.appendChild(this._footer);
    this._wrapper.appendChild(this._backdrop);
    this._wrapper.appendChild(this._aside);
    this._syncFooter();
  }

  _syncFooter() {
    const nodes = this._footerSlot.assignedElements();
    // The footer box carries padding and a border; only render it when used.
    this._footer.style.display = nodes.length ? '' : 'none';
    // Footer rows are 26px in the class version (.nk-sidebar-footer .nk-tree-item).
    for (const el of nodes) if (el.localName === 'nk-tree-item') el.setAttribute('compact', '');
  }

  setupEvents() {
    this._onSlot = () => this._syncFooter();
    this._onBackdrop = () => this.close();
    this._onKey = (e) => { if (e.key === 'Escape' && this.getBoolAttr('open')) this.close(); };
    this._footerSlot.addEventListener('slotchange', this._onSlot);
    this._backdrop.addEventListener('click', this._onBackdrop);
    document.addEventListener('keydown', this._onKey);
  }

  teardownEvents() {
    this._footerSlot?.removeEventListener('slotchange', this._onSlot);
    this._backdrop?.removeEventListener('click', this._onBackdrop);
    document.removeEventListener('keydown', this._onKey);
  }

  onAttributeChanged(name) {
    if (name === 'open') this.emit('nk-toggle', { open: this.getBoolAttr('open') });
  }

  show() { this.setBoolAttr('open', true); }
  close() { this.setBoolAttr('open', false); }
  toggle() { this.setBoolAttr('open', !this.getBoolAttr('open')); }

  get open() { return this.getBoolAttr('open'); }
  set open(v) { this.setBoolAttr('open', v); }
}

customElements.define('nk-sidebar', NkSidebar);

export { NkSidebar };
