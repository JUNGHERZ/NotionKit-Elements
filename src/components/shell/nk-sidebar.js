import { NkElement } from '../../base.js';

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
// aside; `open` brings it back as a drawer over the page. The drawer is the
// stylesheet's since NotionKit 1.7.0 (.nk-sidebar.open, .nk-sidebar-backdrop
// .open) – the sidebar slides and the scrim fades by the same rules as the
// class markup; the element toggles the two classes. <nk-btn variant="sidebar">
// in the topbar is the ☰ that opens it.
class NkSidebar extends NkElement {
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
    this._syncOpen();
  }

  _syncOpen() {
    const open = this.getBoolAttr('open');
    this._aside.classList.toggle('open', open);
    this._backdrop.classList.toggle('open', open);
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
    if (name !== 'open') return;
    this._syncOpen();
    this.emit('nk-toggle', { open: this.getBoolAttr('open') });
  }

  show() { this.setBoolAttr('open', true); }
  close() { this.setBoolAttr('open', false); }
  toggle() { this.setBoolAttr('open', !this.getBoolAttr('open')); }

  get open() { return this.getBoolAttr('open'); }
  set open(v) { this.setBoolAttr('open', v); }
}

customElements.define('nk-sidebar', NkSidebar);
export { NkSidebar };
