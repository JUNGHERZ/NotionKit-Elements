import { NkElement } from '../../base.js';

// <nk-panel title="Weekly review"><p>Three pages changed.</p></nk-panel>
// <nk-panel href="/roadmap" cover="covers/aurora.svg" icon="🚀" title="Roadmap"><p>2 min ago</p></nk-panel>
// → <a class="nk-panel" href="/roadmap"><div class="nk-cover"><img src="…" alt=""></div>
//      <div class="nk-page-icon">🚀</div><h3>Roadmap</h3>…</a>
// <nk-panel title="Contacts database"><nk-tag slot="end" color="green">Connected</nk-tag>…</nk-panel>
// → … <div class="p-head"><h3>Contacts database</h3><span class="p-end">…</span></div>
// `cover` without a value draws the token gradient, with one a picture; `icon`
// overlaps the cover as on a page – a page tile, as on Notion's Home. With
// `href` the panel is a link. `title` is the heading, never a tooltip.
// slot="end" (NotionKit 1.12.0) sits at the right edge of the title – a state
// as a tag, a button – and moves under it where both do not fit.
class NkPanel extends NkElement {
  static get observedAttributes() { return ['title', 'icon', 'cover', 'href', 'target']; }

  render() {
    this._cover = this.createElement('div', ['nk-cover']);
    this._img = this.createElement('img', [], { alt: '' });
    this._icon = this.createElement('div', ['nk-page-icon']);
    this._heading = document.createElement('h3');
    this._endSlot = this.createElement('slot', [], { name: 'end' });
    this._end = this.createElement('span', ['p-end']);
    this._end.appendChild(this._endSlot);
    this._head = this.createElement('div', ['p-head']);
    this._head.append(this._heading, this._end);
    this._slot = document.createElement('slot');
    this.takeTitle();
    this._build();
  }

  _build() {
    const href = this.getAttribute('href');
    const box = this.createElement(href ? 'a' : 'div', ['nk-panel']);
    box.append(this._cover, this._icon, this._head, this._slot);
    this._wrapper.replaceChildren(box);
    this._box = box;
    this._sync();
  }

  _sync() {
    const href = this.getAttribute('href');
    if (href) { this._box.setAttribute('href', href); this._box.target = this.getAttribute('target') || ''; }
    const cover = this.getAttribute('cover');
    // The band is in the tree only with `cover`: hidden, it still matched
    // `.nk-cover + .nk-page-icon` and pulled a lone icon over the tile's edge.
    if (cover === null) this._cover.remove();
    else if (!this._cover.isConnected) this._box.prepend(this._cover);
    if (cover) { this._img.src = cover; if (!this._img.isConnected) this._cover.appendChild(this._img); }
    else this._img.remove();
    const icon = this.getAttribute('icon');
    this._icon.textContent = icon || '';
    this._icon.style.display = icon ? '' : 'none';
    const title = this._titleText || '';
    if (this._heading.textContent !== title) this._heading.textContent = title;
    this._heading.style.display = title ? '' : 'none';
    // The end and the whole head leave the layout when they are empty, so a
    // title alone lays out as it always did.
    const end = this._endSlot.assignedNodes().some(n => n.nodeType === Node.ELEMENT_NODE || n.textContent.trim());
    this._end.style.display = end ? '' : 'none';
    this._head.style.display = title || end ? '' : 'none';
  }

  setupEvents() {
    this._onEnd = () => this._sync();
    this._endSlot.addEventListener('slotchange', this._onEnd);
  }

  teardownEvents() { this._endSlot?.removeEventListener('slotchange', this._onEnd); }

  onAttributeChanged(name, _old, value) {
    if (name === 'title' && !this.takeTitle(value)) return;
    if (name === 'href' && (value === null) !== (this._box.localName === 'div')) { this._build(); return; }
    this._sync();
  }

  get title() { return this._titleText ?? ''; }
  set title(v) { this._titleText = v == null ? '' : String(v); if (this._initialized) this._sync(); }
  get href() { return this.getAttribute('href'); }
  set href(v) { v == null ? this.removeAttribute('href') : this.setAttribute('href', v); }
}

customElements.define('nk-panel', NkPanel);
export { NkPanel };
