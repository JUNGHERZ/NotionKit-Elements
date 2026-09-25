import { NkElement } from '../../base.js';
import { boxOf } from '../../util/floating.js';

// <nk-tabs value="notes">
//   <nk-tab value="notes">📝 Notes</nk-tab>
//   <nk-tab value="tasks">✅ Tasks</nk-tab>
//   <div slot="panel" data-tab="notes" class="nk-tab-panel">…</div>
//   <div slot="panel" data-tab="tasks" class="nk-tab-panel">…</div>
// </nk-tabs>
// → <div class="nk-tabs" role="tablist">…</div> + the panels below it.
// The tabs keep one tab active and hide every panel whose data-tab does not
// match `value` (through the hidden attribute – the panels stay yours).
// `scroll` (NotionKit 1.12.0) keeps many tabs in one row that scrolls
// sideways and holds the active tab in view – after the first layout, on
// every change and when the row's width changes – as <nk-segmented scroll>.
const KEYS = { ArrowRight: 1, ArrowDown: 1, ArrowLeft: -1, ArrowUp: -1 };

class NkTabs extends NkElement {
  static get observedAttributes() { return ['value', 'scroll']; }

  render() {
    this._strip = this.createElement('div', ['nk-tabs'], { role: 'tablist' });
    this._tabSlot = document.createElement('slot');
    this._strip.appendChild(this._tabSlot);
    this._panelSlot = this.createElement('slot', [], { name: 'panel' });
    this._wrapper.append(this._strip, this._panelSlot);
    this._sync();
  }

  get tabs() { return [...this.querySelectorAll(':scope > nk-tab')]; }
  get panels() { return [...this.querySelectorAll(':scope > [slot="panel"]')]; }

  _sync() {
    const tabs = this.tabs;
    if (!tabs.length) return;
    let value = this.getAttribute('value');
    if (value === null || !tabs.some(t => t.getAttribute('value') === value || (t.getAttribute('value') === null && t.textContent.trim() === value))) {
      const preset = tabs.find(t => t.hasAttribute('active')) || tabs[0];
      value = preset.getAttribute('value') ?? preset.textContent.trim();
    }
    for (const tab of tabs) {
      const v = tab.getAttribute('value') ?? tab.textContent.trim();
      if (v === value) tab.setAttribute('active', ''); else tab.removeAttribute('active');
    }
    for (const panel of this.panels) panel.hidden = panel.dataset.tab !== value;
    this._value = value;
    this._strip.classList.toggle('scroll', this.getBoolAttr('scroll'));
    this._reveal(this._revealed ? 'smooth' : 'instant');
  }

  /** Scrolls the row the least distance that shows the active tab whole. */
  _reveal(behavior) {
    if (!this.getBoolAttr('scroll') || !this._strip?.clientWidth) return;
    const tab = this.tabs.find(t => t.hasAttribute('active'));
    if (!tab) return;
    const row = this._strip.getBoundingClientRect(), r = boxOf(tab), pad = 8;
    const delta = r.left < row.left ? r.left - row.left - pad : r.right > row.right ? r.right - row.right + pad : 0;
    const smooth = behavior === 'smooth' && !matchMedia('(prefers-reduced-motion: reduce)').matches;
    if (delta) this._strip.scrollBy({ left: delta, behavior: smooth ? 'smooth' : 'instant' });
    this._revealed = true;
  }

  setupEvents() {
    this._onSlot = () => this._sync();
    this._onKey = (e) => {
      const dir = KEYS[e.key];
      if (!dir) return;
      const tabs = this.tabs.filter(t => !t.hasAttribute('disabled'));
      const i = tabs.indexOf(e.target.closest?.('nk-tab'));
      if (i < 0 || tabs.length < 2) return;
      e.preventDefault();
      const next = tabs[(i + dir + tabs.length) % tabs.length];
      next.select();
      next.focus();
    };
    this._tabSlot.addEventListener('slotchange', this._onSlot);
    this._panelSlot.addEventListener('slotchange', this._onSlot);
    this.addEventListener('keydown', this._onKey);
    this._resize = new ResizeObserver(() => this._reveal('instant'));
    this._resize.observe(this._strip);
    this._sync();
  }

  teardownEvents() {
    this._tabSlot?.removeEventListener('slotchange', this._onSlot);
    this._panelSlot?.removeEventListener('slotchange', this._onSlot);
    this.removeEventListener('keydown', this._onKey);
    this._resize?.disconnect();
  }

  onAttributeChanged() {
    const before = this._value;
    this._sync();
    if (this._value !== before) this.emit('nk-change', { value: this._value });
  }

  get value() { return this._value ?? this.getAttribute('value'); }
  set value(v) { this.setAttribute('value', v); }
  get scroll() { return this.getBoolAttr('scroll'); }
  set scroll(v) { this.setBoolAttr('scroll', v); }
}

customElements.define('nk-tabs', NkTabs);
export { NkTabs };
