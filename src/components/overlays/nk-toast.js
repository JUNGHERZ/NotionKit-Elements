import { NkElement } from '../../base.js';
import { deepActiveElement, containsDeep } from '../../util/focus.js';

// <nk-toast id="toast"></nk-toast>   …   toast.show('Saved');
// toast.show('Moved to trash', { action: { label: 'Undo', value: 'undo' } });
// → <div class="nk-toast show">✓ Moved to trash<button class="t-action">Undo</button><button class="t-close">×</button></div>
// One node, bottom-centred, auto-hides after `duration` ms (default 2200).
// Above a tab bar at the bottom of the screen it rises 12px over the bar:
// notionkit.css does that for class markup with :has(), which cannot see
// into shadow roots, so the element measures the bar when it opens.
// An action (1.19.0) – from show() or a <button slot="action"> – makes it
// Notion's "Moved to trash · Undo": a button, and an × that closes. Such a
// toast stays until one of them is used, unless show() names a duration,
// and waits while the pointer or the focus is on it. The action fires
// nk-action { action, value, label } and, unless cancelled, closes it;
// Escape closes it while the focus is inside.
const CLOSE_ICON = '<svg viewBox="0 0 24 24" aria-hidden="true"><path d="M18 6 6 18M6 6l12 12"/></svg>';

class NkToast extends NkElement {
  static get observedAttributes() { return ['open', 'duration', 'icon']; }

  render() {
    this._box = this.createElement('div', ['nk-toast'], { role: 'status', 'aria-live': 'polite' });
    this._icon = document.createElement('span');
    this._msg = document.createElement('span');
    this._action = this.createElement('button', ['t-action'], { type: 'button' });
    this._actionSlot = this.createElement('slot', [], { name: 'action' });
    this._close = this.createElement('button', ['t-close'], { type: 'button' });
    this._close.innerHTML = CLOSE_ICON;
    this._box.append(this._icon, this._msg, document.createElement('slot'), this._actionSlot);
    this._wrapper.appendChild(this._box);
    this._sync();
  }

  _sync() {
    const open = this.getBoolAttr('open');
    if (open) this._lift();
    this._box.classList.toggle('show', open);
    const icon = this.getAttribute('icon') ?? '✓';
    this._icon.textContent = icon;
    this._icon.style.display = icon ? '' : 'none';
    // An empty message takes no place – with slotted text it added a second gap.
    this._msg.style.display = this._msg.textContent ? '' : 'none';
    // The action from show() and the × sit in the tree only when there is an
    // action; a closed toast keeps them for its fade, out of the tab order.
    const own = this._act, slotted = this._slotted();
    if (own) { this._action.textContent = own.label; if (!this._action.isConnected) this._actionSlot.before(this._action); }
    else this._action.remove();
    if (own || slotted) { if (!this._close.isConnected) this._box.appendChild(this._close); }
    else this._close.remove();
    this._close.setAttribute('aria-label', this.str('close'));
    for (const b of [this._action, this._close]) open ? b.removeAttribute('tabindex') : b.setAttribute('tabindex', '-1');
  }

  _slotted() { return this._actionSlot?.assignedElements()[0] ?? null; }

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

  /**
   * Shows `message` (or the slotted content when omitted) and hides it again
   * after `duration` ms – the attribute's, else 2200; with an `action`
   * ({ label, value }) it stays until the action or the × is used.
   */
  show(message, { duration, action } = {}) {
    if (message !== undefined) this._msg.textContent = message;
    this._shown = (this._shown ?? 0) + 1;
    this._act = action ? { label: String(action.label ?? action.value ?? ''), value: action.value ?? action.label } : null;
    const attr = this.getAttribute('duration'), set = attr !== null && attr.trim() !== '' && Number.isFinite(Number(attr));
    // Number(null) is 0: without the attribute a toast used to stay for good.
    this._ms = duration ?? (this._act || this._slotted() ? 0 : set ? Number(attr) : 2200);
    if (this.getBoolAttr('open')) this._sync(); else this.setBoolAttr('open', true);
    this._arm();
  }

  close() {
    clearTimeout(this._timer);
    // The focus leaves with the toast, back to where it came from.
    const active = deepActiveElement();
    if (active && containsDeep(this, active)) {
      this._from?.isConnected && this._from.focus({ preventScroll: true });
      if (containsDeep(this, deepActiveElement())) active.blur();
    }
    this._from = null;
    this.setBoolAttr('open', false);
  }

  _arm() {
    clearTimeout(this._timer);
    if (this._ms > 0 && !this._held && this.getBoolAttr('open')) this._timer = setTimeout(() => this.close(), this._ms);
  }

  _take(act) {
    if (!act) return;
    // A handler that shows the next message – "Restored" – keeps it open.
    const shown = this._shown;
    if (this.emit('nk-action', { action: act.value, value: act.value, label: act.label }) && this._shown === shown) this.close();
  }

  setupEvents() {
    this._onClick = (e) => {
      const path = e.composedPath();
      if (path.includes(this._close)) { this.close(); return; }
      if (path.includes(this._action)) { this._take(this._act); return; }
      const slotted = this._slotted();
      if (slotted && path.includes(slotted)) this._take({ value: slotted.value || slotted.getAttribute('value') || slotted.textContent.trim(), label: slotted.textContent.trim() });
    };
    // While the pointer or the focus is on it, a toast with a duration waits.
    this._onHold = (e) => {
      if (e.type === 'focusin' && !this._from) this._from = e.relatedTarget ?? null;
      this._held = true; clearTimeout(this._timer);
    };
    this._onRelease = (e) => {
      if (e.relatedTarget && containsDeep(this, e.relatedTarget)) return;
      this._held = false; this._arm();
    };
    this._onKey = (e) => { if (e.key === 'Escape') { e.stopPropagation(); this.close(); } };
    this._onSlot = () => this._sync();
    this._box.addEventListener('click', this._onClick);
    this._box.addEventListener('pointerover', this._onHold);
    this._box.addEventListener('pointerout', this._onRelease);
    this._box.addEventListener('focusin', this._onHold);
    this._box.addEventListener('focusout', this._onRelease);
    this._box.addEventListener('keydown', this._onKey);
    this._actionSlot.addEventListener('slotchange', this._onSlot);
  }

  teardownEvents() {
    this._box?.removeEventListener('click', this._onClick);
    this._box?.removeEventListener('pointerover', this._onHold);
    this._box?.removeEventListener('pointerout', this._onRelease);
    this._box?.removeEventListener('focusin', this._onHold);
    this._box?.removeEventListener('focusout', this._onRelease);
    this._box?.removeEventListener('keydown', this._onKey);
    this._actionSlot?.removeEventListener('slotchange', this._onSlot);
  }

  onAttributeChanged(name) {
    this._sync();
    if (name === 'open') this.emit('nk-toggle', { open: this.getBoolAttr('open') });
  }

  disconnectedCallback() { super.disconnectedCallback(); clearTimeout(this._timer); }

  get open() { return this.getBoolAttr('open'); }
  set open(v) { this.setBoolAttr('open', v); }
  get message() { return this._msg?.textContent ?? ''; }
  set message(v) { if (this._msg) { this._msg.textContent = v; this._sync(); } }
  onStringsChanged() { if (this._box) this._sync(); }
}

customElements.define('nk-toast', NkToast);
export { NkToast };
