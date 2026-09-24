import { NkElement } from '../../base.js';

// <nk-page icon="🚀" cover full small>
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
// here because its ::slotted twin is keyed on the parent (.nk-page). `full` and
// `small` are Notion's page options – full width, 14px text – set on the page.
class NkPage extends NkElement {
  static get observedAttributes() { return ['icon', 'cover', 'narrow', 'full', 'small']; }

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
    const icon = this.getAttribute('icon') || '';
    // Fallback content: write on a change only (see nk-switch).
    if (this._icon.textContent !== icon) this._icon.textContent = icon;
    this._icon.style.display = icon ? '' : 'none';
    this._cover.style.display = this.getBoolAttr('cover') ? '' : 'none';
    // `covered` is the stylesheet's twin of `.nk-cover + .nk-page`: the icon
    // overlaps the cover and the page drops its top padding. Without a cover
    // (attribute or a slotted nk-page-cover) the icon sits in the padding.
    const slotted = this._coverSlot.assignedNodes().some(n => n.nodeType === Node.ELEMENT_NODE || n.data.trim());
    this._page.classList.toggle('covered', this.getBoolAttr('cover') || slotted);
    this._page.classList.toggle('full', this.getBoolAttr('full'));
    this._page.classList.toggle('small', this.getBoolAttr('small'));
  }

  setupEvents() {
    this._onIcon = () => this.emit('nk-action', { action: 'icon', value: this.getAttribute('icon') });
    this._onCover = () => this._sync();
    this._icon.addEventListener('click', this._onIcon);
    this._coverSlot.addEventListener('slotchange', this._onCover);
    this._sync();
  }

  teardownEvents() { this._icon?.removeEventListener('click', this._onIcon); this._coverSlot?.removeEventListener('slotchange', this._onCover); }

  onAttributeChanged(name) {
    if (name === 'narrow') this._build();
    else this._sync();
  }

  get icon() { return this.getAttribute('icon'); }
  set icon(v) { v == null ? this.removeAttribute('icon') : this.setAttribute('icon', v); }
  get cover() { return this.getBoolAttr('cover'); }
  set cover(v) { this.setBoolAttr('cover', v); }
  get full() { return this.getBoolAttr('full'); }
  set full(v) { this.setBoolAttr('full', v); }
  get small() { return this.getBoolAttr('small'); }
  set small(v) { this.setBoolAttr('small', v); }
}

customElements.define('nk-page', NkPage);
export { NkPage };
