import { N as NkElement } from './shared/base-6gEcoatG.js';

// <nk-page icon="🚀" cover>
//   <nk-page-title>NotionKit MVP</nk-page-title>
//   <nk-page-actions>…</nk-page-actions>
//   <p class="lead">…</p>
//   …blocks…
// </nk-page>
// → <div class="nk-page-scroll"><div class="nk-cover"></div><div class="nk-page">
//     <div class="nk-page-icon">🚀</div>…</div></div>
//
// The host is display:contents, so .nk-page-scroll is the flex child of
// .nk-main that scrolls. `narrow` drops the scroll wrapper for pages that are
// the document itself (landing / docs skeleton). The page icon is rendered
// here because its ::slotted twin is keyed on the parent (.nk-page).
class NkPage extends NkElement {
  static get observedAttributes() { return ['icon', 'cover', 'narrow']; }

  render() {
    this._page = this.createElement('div', ['nk-page']);
    this._icon = this.createElement('div', ['nk-page-icon'], { role: 'button', title: 'Change icon' });
    const iconSlot = this.createElement('slot', [], { name: 'icon' });
    iconSlot.appendChild(this._icon);
    this._page.appendChild(iconSlot);
    this._page.appendChild(document.createElement('slot'));
    this._cover = this.createElement('div', ['nk-cover']);
    this._coverSlot = this.createElement('slot', [], { name: 'cover' });
    this._coverSlot.appendChild(this._cover);
    this._build();
  }

  _build() {
    this._wrapper.replaceChildren();
    if (this.getBoolAttr('narrow')) {
      this._wrapper.append(this._coverSlot, this._page);
    } else {
      const scroll = this.createElement('div', ['nk-page-scroll']);
      scroll.append(this._coverSlot, this._page);
      this._wrapper.appendChild(scroll);
    }
    this._sync();
  }

  _sync() {
    const icon = this.getAttribute('icon');
    this._icon.textContent = icon || '';
    this._icon.style.display = icon ? '' : 'none';
    this._cover.style.display = this.getBoolAttr('cover') ? '' : 'none';
  }

  setupEvents() {
    this._onIcon = () => this.emit('nk-action', { action: 'icon', value: this.getAttribute('icon') });
    this._icon.addEventListener('click', this._onIcon);
  }

  teardownEvents() { this._icon?.removeEventListener('click', this._onIcon); }

  onAttributeChanged(name) {
    if (name === 'narrow') this._build();
    else this._sync();
  }

  get icon() { return this.getAttribute('icon'); }
  set icon(v) { v == null ? this.removeAttribute('icon') : this.setAttribute('icon', v); }
  get cover() { return this.getBoolAttr('cover'); }
  set cover(v) { this.setBoolAttr('cover', v); }
}

customElements.define('nk-page', NkPage);

export { NkPage };
