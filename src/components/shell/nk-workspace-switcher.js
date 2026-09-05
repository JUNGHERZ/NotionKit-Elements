import { NkElement } from '../../base.js';

// <nk-workspace-switcher slot="workspace" name="Acme" avatar="A">
//   <nk-menu slot="menu">…</nk-menu>
// </nk-workspace-switcher>
// → <div class="nk-workspace"><div class="avatar">A</div><span>Acme</span><span class="chev">⌄</span></div>
// A click toggles `open` and shows whatever sits in the menu slot below the
// row; clicking outside or pressing Escape closes it.
const menuSheet = new CSSStyleSheet();
menuSheet.replaceSync(`
  .nk-ws-anchor { position: relative; }
  .nk-ws-menu { display: none; position: absolute; left: 8px; top: calc(100% - 2px); z-index: 50; }
  :host([open]) .nk-ws-menu { display: block; }
`);

class NkWorkspaceSwitcher extends NkElement {
  static get hostStyles() { return menuSheet; }
  static get observedAttributes() { return ['name', 'avatar', 'open']; }

  render() {
    this._row = this.createElement('div', ['nk-workspace'], { role: 'button', tabindex: '0', 'aria-haspopup': 'menu' });
    this._avatar = this.createElement('div', ['avatar']);
    const avatarSlot = this.createElement('slot', [], { name: 'avatar' });
    avatarSlot.appendChild(this._avatar);
    this._name = document.createElement('span');
    const chev = this.createElement('span', ['chev']);
    chev.textContent = '⌄';
    this._row.append(avatarSlot, this._name, chev);
    this._menu = this.createElement('div', ['nk-ws-menu']);
    this._menu.appendChild(this.createElement('slot', [], { name: 'menu' }));
    const anchor = this.createElement('div', ['nk-ws-anchor']);
    anchor.append(this._row, this._menu);
    this._wrapper.appendChild(anchor);
    this._sync();
  }

  _sync() {
    const name = this.getAttribute('name') || '';
    this._name.textContent = name;
    this._avatar.textContent = this.getAttribute('avatar') || name.trim().charAt(0).toUpperCase();
    this._row.setAttribute('aria-expanded', this.getBoolAttr('open') ? 'true' : 'false');
  }

  setupEvents() {
    this._onClick = () => this.toggle();
    this._onKey = (e) => { if (e.key === 'Enter' || e.key === ' ') { e.preventDefault(); this.toggle(); } };
    this._onDocClick = (e) => { if (this.getBoolAttr('open') && !e.composedPath().includes(this)) this.close(); };
    this._onDocKey = (e) => { if (e.key === 'Escape' && this.getBoolAttr('open')) this.close(); };
    this._onMenuSelect = () => this.close();
    this._row.addEventListener('click', this._onClick);
    this._row.addEventListener('keydown', this._onKey);
    this._menu.addEventListener('nk-select', this._onMenuSelect);
    document.addEventListener('click', this._onDocClick);
    document.addEventListener('keydown', this._onDocKey);
  }

  teardownEvents() {
    this._row?.removeEventListener('click', this._onClick);
    this._row?.removeEventListener('keydown', this._onKey);
    this._menu?.removeEventListener('nk-select', this._onMenuSelect);
    document.removeEventListener('click', this._onDocClick);
    document.removeEventListener('keydown', this._onDocKey);
  }

  onAttributeChanged(name) {
    this._sync();
    if (name === 'open') this.emit('nk-toggle', { open: this.getBoolAttr('open') });
  }

  show() { this.setBoolAttr('open', true); }
  close() { this.setBoolAttr('open', false); }
  toggle() { this.setBoolAttr('open', !this.getBoolAttr('open')); }

  get name() { return this.getAttribute('name'); }
  set name(v) { this.setAttribute('name', v); }
  get open() { return this.getBoolAttr('open'); }
  set open(v) { this.setBoolAttr('open', v); }
}

customElements.define('nk-workspace-switcher', NkWorkspaceSwitcher);
export { NkWorkspaceSwitcher };
