import { N as NkElement } from './shared/base-6gEcoatG.js';

// <nk-empty icon="🗂️" title="No entries yet" desc="Create the first one."><nk-btn variant="primary" small>＋ New</nk-btn></nk-empty>
// → <div class="nk-empty"><div class="e-icon">🗂️</div><div class="e-title">…</div><div class="e-desc">…</div>…</div>
class NkEmpty extends NkElement {
  static get observedAttributes() { return ['icon', 'title', 'desc']; }

  render() {
    const box = this.createElement('div', ['nk-empty']);
    this._parts = {};
    for (const [slot, cls] of [['icon', 'e-icon'], ['title', 'e-title'], ['desc', 'e-desc']]) {
      const el = this.createElement('div', [cls]);
      const s = this.createElement('slot', [], { name: slot });
      s.appendChild(el);
      box.appendChild(s);
      this._parts[slot] = el;
    }
    box.appendChild(document.createElement('slot'));
    this._wrapper.appendChild(box);
    this._sync();
  }

  _sync() {
    for (const [slot, el] of Object.entries(this._parts)) {
      const v = this.getAttribute(slot);
      el.textContent = v || '';
      el.style.display = v ? '' : 'none';
    }
  }

  onAttributeChanged() { this._sync(); }
}

customElements.define('nk-empty', NkEmpty);

export { NkEmpty };
