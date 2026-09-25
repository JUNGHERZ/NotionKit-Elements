import { NkElement } from './base.js';
import { d as deepActiveElement } from './shared/focus-D55JGjRA.js';
import '@jungherz-de/notionkit/notionkit-styles.js';

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
//
// `collapsible` (NotionKit 1.10.0): on the desktop Notion's « beside the
// workspace row collapses the sidebar – it slides out to the left, the main
// column takes the width, nothing in it takes focus – and the topbar's ☰
// brings it back; ⌘\ or Ctrl+\ toggles it (on a phone the drawer).
// `collapsed` is the state, collapse() / expand() / toggleCollapsed() the
// API, nk-collapse { collapsed } the moment to keep it. collapse-label names
// the « (default "Close sidebar", in German "Seitenleiste schließen") and is
// its tooltip for <nk-tooltip>.
const COLLAPSE_ICON = '<svg viewBox="0 0 24 24" aria-hidden="true"><path d="m18 17-5-5 5-5M11 17l-5-5 5-5"/></svg>';
const phone = () => matchMedia('(max-width: 860px)').matches;

class NkSidebar extends NkElement {
  static get observedAttributes() { return ['open', 'collapsible', 'collapsed', 'collapse-label']; }

  render() {
    this._backdrop = this.createElement('div', ['nk-sidebar-backdrop']);
    this._aside = this.createElement('aside', ['nk-sidebar']);
    const head = this.createElement('div', ['nk-sidebar-head']);
    this._collapse = this.createElement('button', ['nk-sidebar-collapse'], { type: 'button', 'data-tooltip-key': '⌘\\' });
    this._collapse.innerHTML = COLLAPSE_ICON;
    head.append(this.createElement('slot', [], { name: 'workspace' }), this._collapse);
    this._aside.appendChild(head);
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
    this._syncCollapse();
  }

  _syncCollapse() {
    const label = this.getAttribute('collapse-label') || this.str('closeSidebar');
    this._collapse.hidden = !this.getBoolAttr('collapsible');
    this._collapse.setAttribute('aria-label', label);
    this._collapse.dataset.tooltip = label;
    this._aside.classList.toggle('collapsed', this.getBoolAttr('collapsed'));
  }

  /** The ☰ that brings the sidebar back: the one in its own app, else the page's. */
  _toggleButton() {
    const sel = 'nk-btn[variant="sidebar"]';
    return this.closest('nk-app')?.querySelector(sel) ?? document.querySelector(sel);
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
    this._onKey = (e) => {
      if (e.key === 'Escape' && this.getBoolAttr('open')) this.close();
      // Notion's ⌘\: the collapse on the desktop, the drawer on a phone.
      if (e.key === '\\' && (e.metaKey || e.ctrlKey) && this.getBoolAttr('collapsible') && !e.defaultPrevented) {
        e.preventDefault();
        phone() ? this.toggle() : this.toggleCollapsed();
      }
    };
    this._onCollapse = () => this.collapse();
    this._footerSlot.addEventListener('slotchange', this._onSlot);
    this._backdrop.addEventListener('click', this._onBackdrop);
    this._collapse.addEventListener('click', this._onCollapse);
    document.addEventListener('keydown', this._onKey);
  }

  teardownEvents() {
    this._footerSlot?.removeEventListener('slotchange', this._onSlot);
    this._backdrop?.removeEventListener('click', this._onBackdrop);
    this._collapse?.removeEventListener('click', this._onCollapse);
    document.removeEventListener('keydown', this._onKey);
  }

  onStringsChanged() { this._syncCollapse(); }

  onAttributeChanged(name) {
    if (name === 'open') {
      this._syncOpen();
      this.emit('nk-toggle', { open: this.getBoolAttr('open') });
      return;
    }
    // Focus follows to the control that is left: the ☰ after collapsing, the « after expanding.
    const active = deepActiveElement();
    const fromSidebar = active && (this.contains(active) || this._shadow.contains(active));
    const fromToggle = active?.closest?.('.nk-sidebar-toggle');
    this._syncCollapse();
    if (name !== 'collapsed') return;
    const collapsed = this.getBoolAttr('collapsed');
    this.emit('nk-collapse', { collapsed });
    // Two frames later: with reduced motion every nk- element transitions for
    // .01ms, the inherited visibility included, so the « is focusable only then.
    const later = fn => requestAnimationFrame(() => requestAnimationFrame(fn));
    if (collapsed && fromSidebar) later(() => this._toggleButton()?.focus({ preventScroll: true }));
    if (!collapsed && fromToggle && !this._collapse.hidden) later(() => this._collapse.focus({ preventScroll: true }));
  }

  show() { this.setBoolAttr('open', true); }
  close() { this.setBoolAttr('open', false); }
  toggle() { this.setBoolAttr('open', !this.getBoolAttr('open')); }

  get open() { return this.getBoolAttr('open'); }
  set open(v) { this.setBoolAttr('open', v); }

  collapse() { this.setBoolAttr('collapsed', true); }
  expand() { this.setBoolAttr('collapsed', false); }
  toggleCollapsed() { this.setBoolAttr('collapsed', !this.getBoolAttr('collapsed')); }
  get collapsed() { return this.getBoolAttr('collapsed'); }
  set collapsed(v) { this.setBoolAttr('collapsed', v); }
}

customElements.define('nk-sidebar', NkSidebar);

export { NkSidebar };
