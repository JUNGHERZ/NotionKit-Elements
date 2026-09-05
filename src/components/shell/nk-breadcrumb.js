import { NkElement } from '../../base.js';

// <nk-breadcrumb>
//   <a href="/overview">📊 Project overview</a>
//   <span>🚀 NotionKit MVP</span>
// </nk-breadcrumb>
// → <nav class="nk-breadcrumb"><a class="crumb">…</a><span class="sep">/</span><span class="crumb current">…</span></nav>
//
// The children are *cloned* into the shadow tree so the separators can be
// interleaved and `.crumb:hover` (no ::slotted twin) applies. A
// MutationObserver keeps the copy in step. Clicking a clone fires nk-select
// and, unless prevented, forwards the click to the original – so an <a>
// navigates exactly once and framework listeners see it.
class NkBreadcrumb extends NkElement {
  static get observedAttributes() { return ['separator']; }
  static get observesLightDom() { return true; }

  render() {
    this._nav = this.createElement('nav', ['nk-breadcrumb'], { 'aria-label': 'Breadcrumb' });
    this._wrapper.appendChild(this._nav);
    this.projectLightDom();
  }

  projectLightDom() {
    if (!this._nav) return;
    const originals = [...this.children];
    const sep = this.getAttribute('separator') ?? '/';
    const signature = originals.map(o => o.outerHTML).join('') + sep;
    if (signature === this._signature) return;
    this._signature = signature;
    this._nav.innerHTML = '';
    const explicitCurrent = originals.some(o => o.hasAttribute('current') || o.classList.contains('current'));
    originals.forEach((original, i) => {
      if (i > 0) {
        const s = this.createElement('span', ['sep'], { 'aria-hidden': 'true' });
        s.textContent = sep;
        this._nav.appendChild(s);
      }
      const clone = original.cloneNode(true);
      clone.removeAttribute('slot');
      clone.classList.add('crumb');
      const current = explicitCurrent ? (original.hasAttribute('current') || original.classList.contains('current')) : i === originals.length - 1;
      clone.classList.toggle('current', current);
      if (current) clone.setAttribute('aria-current', 'page');
      clone.dataset.index = i;
      this._nav.appendChild(clone);
    });
  }

  setupEvents() {
    this._onClick = (e) => {
      const clone = e.target.closest('.crumb');
      if (!clone) return;
      e.preventDefault();
      const index = Number(clone.dataset.index);
      // Look the original up at click time: a framework may have replaced it.
      const original = this.children[index];
      const ok = this.emit('nk-select', {
        index, label: clone.textContent.trim(), href: original?.getAttribute('href') ?? null,
        value: original?.dataset.value ?? original?.getAttribute('href') ?? clone.textContent.trim(),
        current: clone.classList.contains('current'),
      });
      if (ok) original?.click();
    };
    this._nav.addEventListener('click', this._onClick);
  }

  teardownEvents() { this._nav?.removeEventListener('click', this._onClick); }

  onAttributeChanged() { this.projectLightDom(); }

  get separator() { return this.getAttribute('separator') ?? '/'; }
  set separator(v) { this.setAttribute('separator', v); }
}

customElements.define('nk-breadcrumb', NkBreadcrumb);
export { NkBreadcrumb };
