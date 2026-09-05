import { NkElement } from '../../base.js';

// <nk-stat label="Active pages" value="128" delta="▲ 12 this week" trend="up"></nk-stat>
// → <div class="nk-stat"><div class="s-label">…</div><div class="s-value">…</div><div class="s-delta up">…</div></div>
class NkStat extends NkElement {
  static get observedAttributes() { return ['label', 'value', 'delta', 'trend']; }

  render() {
    const box = this.createElement('div', ['nk-stat']);
    this._parts = {};
    for (const [slot, cls] of [['label', 's-label'], ['value', 's-value'], ['delta', 's-delta']]) {
      const el = this.createElement('div', [cls]);
      const s = this.createElement('slot', [], { name: slot });
      s.appendChild(el);
      box.appendChild(s);
      this._parts[slot] = el;
    }
    this._wrapper.appendChild(box);
    this._sync();
  }

  _sync() {
    for (const [slot, el] of Object.entries(this._parts)) {
      const v = this.getAttribute(slot);
      el.textContent = v ?? '';
      el.style.display = v === null ? 'none' : '';
    }
    const trend = this.getAttribute('trend');
    this._parts.delta.className = 's-delta' + (trend === 'up' || trend === 'down' ? ` ${trend}` : '');
  }

  onAttributeChanged() { this._sync(); }

  get value() { return this.getAttribute('value'); }
  set value(v) { this.setAttribute('value', v); }
}

customElements.define('nk-stat', NkStat);
export { NkStat };
