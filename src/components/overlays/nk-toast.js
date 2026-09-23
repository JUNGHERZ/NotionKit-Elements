import { NkElement } from '../../base.js';

// <nk-toast id="toast"></nk-toast>   …   toast.show('Saved');
// → <div class="nk-toast show">✓ Saved</div>
// One node, bottom-centred, auto-hides after `duration` ms (default 2200).
// Above a tab bar at the bottom of the screen it rises 12px over the bar:
// notionkit.css does that for class markup with :has(), which cannot see
// into shadow roots, so the element measures the bar when it opens.
class NkToast extends NkElement {
  static get observedAttributes() { return ['open', 'duration', 'icon']; }

  render() {
    this._box = this.createElement('div', ['nk-toast'], { role: 'status', 'aria-live': 'polite' });
    this._icon = document.createElement('span');
    this._msg = document.createElement('span');
    this._box.append(this._icon, this._msg, document.createElement('slot'));
    this._wrapper.appendChild(this._box);
    this._sync();
  }

  _sync() {
    if (this.getBoolAttr('open')) this._lift();
    this._box.classList.toggle('show', this.getBoolAttr('open'));
    const icon = this.getAttribute('icon') ?? '✓';
    this._icon.textContent = icon;
    this._icon.style.display = icon ? '' : 'none';
  }

  // A bar counts when it is rendered and ends near the bottom of the viewport –
  // the app's own bar, fixed, sticky or floating. A tab bar shown as a preview
  // somewhere in a page does not lift the toast.
  _lift() {
    const bars = [...document.querySelectorAll('.nk-tab-bar')];
    for (const host of document.querySelectorAll('nk-tab-bar')) {
      const bar = host.shadowRoot?.querySelector('.nk-tab-bar');
      if (bar) bars.push(bar);
    }
    const rect = bars.map(b => b.getBoundingClientRect())
      .find(r => r.height > 0 && r.top < innerHeight && r.bottom > innerHeight - 60);
    this._box.style.bottom = rect ? `${Math.round(innerHeight - rect.top + 12)}px` : '';
  }

  /** Shows `message` (or the slotted content when omitted) and hides it again after `duration`. */
  show(message, { duration } = {}) {
    if (message !== undefined) this._msg.textContent = message;
    clearTimeout(this._timer);
    this.setBoolAttr('open', true);
    const ms = duration ?? Number(this.getAttribute('duration')) ?? 2200;
    if (ms > 0) this._timer = setTimeout(() => this.close(), ms || 2200);
  }

  close() { clearTimeout(this._timer); this.setBoolAttr('open', false); }

  onAttributeChanged(name) {
    this._sync();
    if (name === 'open') this.emit('nk-toggle', { open: this.getBoolAttr('open') });
  }

  disconnectedCallback() { super.disconnectedCallback(); clearTimeout(this._timer); }

  get open() { return this.getBoolAttr('open'); }
  set open(v) { this.setBoolAttr('open', v); }
  get message() { return this._msg?.textContent ?? ''; }
  set message(v) { if (this._msg) this._msg.textContent = v; }
}

customElements.define('nk-toast', NkToast);
export { NkToast };
