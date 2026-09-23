import { NkElement } from './base.js';
import '@jungherz-de/notionkit/notionkit-styles.js';

// <nk-panel title="Weekly review"><p>Three pages changed.</p></nk-panel>
// <nk-panel href="/roadmap" cover="covers/aurora.svg" icon="🚀" title="Roadmap"><p>2 min ago</p></nk-panel>
// → <a class="nk-panel" href="/roadmap"><div class="nk-cover"><img src="…" alt=""></div>
//      <div class="nk-page-icon">🚀</div><h3>Roadmap</h3>…</a>
// `cover` without a value draws the token gradient, with one a picture; `icon`
// overlaps the cover as on a page – a page tile, as on Notion's Home. With
// `href` the panel is a link. `title` is the heading, never a tooltip.
class NkPanel extends NkElement {
  static get observedAttributes() { return ['title', 'icon', 'cover', 'href', 'target']; }

  render() {
    this._cover = this.createElement('div', ['nk-cover']);
    this._img = this.createElement('img', [], { alt: '' });
    this._icon = this.createElement('div', ['nk-page-icon']);
    this._heading = document.createElement('h3');
    this._slot = document.createElement('slot');
    this.takeTitle();
    this._build();
  }

  _build() {
    const href = this.getAttribute('href');
    const box = this.createElement(href ? 'a' : 'div', ['nk-panel']);
    box.append(this._cover, this._icon, this._heading, this._slot);
    this._wrapper.replaceChildren(box);
    this._box = box;
    this._sync();
  }

  _sync() {
    const href = this.getAttribute('href');
    if (href) { this._box.setAttribute('href', href); this._box.target = this.getAttribute('target') || ''; }
    const cover = this.getAttribute('cover');
    this._cover.style.display = cover === null ? 'none' : '';
    if (cover) { this._img.src = cover; if (!this._img.isConnected) this._cover.appendChild(this._img); }
    else this._img.remove();
    const icon = this.getAttribute('icon');
    this._icon.textContent = icon || '';
    this._icon.style.display = icon ? '' : 'none';
    this._heading.textContent = this._titleText || '';
    this._heading.style.display = this._titleText ? '' : 'none';
  }

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
