import { NkElement } from './base.js';
import '@jungherz-de/notionkit/notionkit-styles.js';

// <nk-bookmark href="https://notionkit.jungherz.com" title="NotionKit" desc="…"
//              favicon="favicon.svg" cover="og.jpg"></nk-bookmark>
// → <a class="nk-bookmark" href="…" target="_blank" rel="noopener">
//     <span class="bm-text"><span class="bm-title">…</span><span class="bm-desc">…</span>
//       <span class="bm-url"><img class="bm-favicon"><span>…</span></span></span>
//     <span class="bm-cover"><img></span></a>
// Notion's link block (NotionKit 1.8.0), filled from what you know of the
// page: og:title, og:description, og:image. `title` is the heading, never a
// tooltip – see NkElement.takeTitle(); without it the host name stands in.
// The address shown is `href`, or `url` where it should read differently. A
// part without a value is left out, not hidden – the stylesheet gives the
// description its own display. Opens in a new tab unless `target` says so.
class NkBookmark extends NkElement {
  static get observedAttributes() { return ['href', 'title', 'desc', 'favicon', 'cover', 'target', 'url']; }

  render() {
    this.takeTitle();
    this._a = this.createElement('a', ['nk-bookmark']);
    this._wrapper.appendChild(this._a);
    this._sync();
  }

  _sync() {
    if (!this._a) return;
    const href = this.getAttribute('href') || '';
    this._a.setAttribute('href', href);
    const target = this.getAttribute('target') || '_blank';
    this._a.setAttribute('target', target);
    if (target === '_blank') this._a.setAttribute('rel', 'noopener'); else this._a.removeAttribute('rel');
    let host = href;
    try { host = new URL(href, location.href).host; } catch { /* keep the text */ }

    const text = this.createElement('span', ['bm-text']);
    const title = this.createElement('span', ['bm-title']);
    title.textContent = this._titleText || host;
    text.appendChild(title);
    const desc = this.getAttribute('desc');
    if (desc) { const d = this.createElement('span', ['bm-desc']); d.textContent = desc; text.appendChild(d); }
    const url = this.createElement('span', ['bm-url']);
    const favicon = this.getAttribute('favicon');
    if (favicon) url.appendChild(this.createElement('img', ['bm-favicon'], { src: favicon, alt: '' }));
    const address = document.createElement('span');
    address.textContent = this.getAttribute('url') || href;
    url.appendChild(address);
    text.appendChild(url);
    const parts = [text];
    const cover = this.getAttribute('cover');
    if (cover) { const c = this.createElement('span', ['bm-cover']); c.appendChild(this.createElement('img', [], { src: cover, alt: '' })); parts.push(c); }
    this._a.replaceChildren(...parts);
  }

  onAttributeChanged(name, _old, value) {
    if (name === 'title' && !this.takeTitle(value)) return;
    this._sync();
  }

  focus(o) { this._a?.focus(o); }
  get title() { return this._titleText ?? ''; }
  set title(v) { this._titleText = v == null ? '' : String(v); this._sync(); }
  get href() { return this.getAttribute('href') || ''; }
  set href(v) { this.setAttribute('href', v); }
}

customElements.define('nk-bookmark', NkBookmark);

export { NkBookmark };
