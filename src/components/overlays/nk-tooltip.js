import { NkElement } from '../../base.js';
import { placeNear } from '../../util/floating.js';
import { deepActiveElement } from '../../util/focus.js';

// <nk-tooltip></nk-tooltip>                    one for the page: every [data-tooltip]
//   <button data-tooltip="Close sidebar" data-tooltip-key="⌘\">«</button>
// <nk-tooltip for="saveBtn" shortcut="⌘S">Save the page</nk-tooltip>
// tip.show(barOrRect, 'Shell · 12.10.–30.11.'); tip.hide();
// → <div class="nk-tooltip open" role="tooltip">Close sidebar<span class="tt-key">⌘\</span></div>
//
// Notion's hover hint (NotionKit 1.10.0). Without `for` it serves every
// element with data-tooltip – and data-tooltip-key for a shortcut – on the
// page, inside shadow roots too: the tooltips of a whole toolbar in one
// element. With `for` it belongs to the element with that id and shows its
// own content and `shortcut`. It appears after `delay` ms (400) under the
// pointer and at once on keyboard focus, never on touch; leaving, a press,
// blur, scrolling and Escape hide it. It sits 6px below its target and
// centred, above it where the window ends – placement="top" prefers above –
// and 8px inside the window (placeNear in util/floating.js). show(target,
// text, shortcut) takes an element or a rect, for what has no element of
// its own: the bars of a Gantt chart. While it shows, the target's
// aria-describedby names it (in the same document or shadow root).
const hostSheet = new CSSStyleSheet();
hostSheet.replaceSync(`:host { display: block; position: fixed; top: 0; left: 0; z-index: 130; pointer-events: none; }`);
let count = 0;

class NkTooltip extends NkElement {
  static get hostStyles() { return hostSheet; }
  static get observedAttributes() { return ['for', 'shortcut']; }

  render() {
    this._bubble = this.createElement('div', ['nk-tooltip'], { role: 'tooltip' });
    this._slot = document.createElement('slot');
    this._text = document.createTextNode('');
    this._key = this.createElement('span', ['tt-key']);
    this._bubble.append(this._slot, this._text, this._key);
    this._wrapper.appendChild(this._bubble);
    this._fill(null);
  }

  get _delay() { const d = Number(this.getAttribute('delay')); return this.hasAttribute('delay') && d >= 0 ? d : 400; }

  /** Own content (text null) or a given text and shortcut. */
  _fill(text, key = this.getAttribute('shortcut')) {
    this._slot.style.display = text == null ? '' : 'none';
    this._text.data = text ?? '';
    this._key.textContent = key || '';
    this._key.hidden = !key;
  }

  /** Shows it at `target` – an element or a rect – with `text` (else its own content) and `shortcut`. */
  show(target, text, shortcut) {
    clearTimeout(this._timer);
    if (!target) return;
    this._fill(text ?? null, shortcut);
    this._describe(target);
    placeNear(this, target, this.getAttribute('placement') === 'top' ? 'top' : 'bottom');
    this._bubble.classList.add('open');
  }

  hide() {
    clearTimeout(this._timer);
    this._bubble?.classList.remove('open');
    this._describe(null);
    this._target = null;
  }

  get open() { return !!this._bubble?.classList.contains('open'); }

  _describe(target) {
    if (this._described) {
      const ids = (this._described.getAttribute('aria-describedby') || '').split(/\s+/).filter(id => id && id !== this.id);
      ids.length ? this._described.setAttribute('aria-describedby', ids.join(' ')) : this._described.removeAttribute('aria-describedby');
      this._described = null;
    }
    if (!(target instanceof Element) || target.getRootNode() !== this.getRootNode()) return;
    this.id ||= `nk-tooltip-${++count}`;
    const ids = (target.getAttribute('aria-describedby') || '').split(/\s+/).filter(Boolean);
    if (!ids.includes(this.id)) target.setAttribute('aria-describedby', [...ids, this.id].join(' '));
    this._described = target;
  }

  /** The element this tooltip serves for an event: its `for` target, or the nearest [data-tooltip]. */
  _targetOf(e) {
    const path = e.composedPath();
    const own = this.getAttribute('for');
    if (own) { const el = this.getRootNode().getElementById?.(own); return el && path.includes(el) ? el : null; }
    return path.find(n => n instanceof Element && n.hasAttribute('data-tooltip')) ?? null;
  }

  _showFor(el) {
    const own = this.hasAttribute('for');
    this.show(el, own ? null : el.getAttribute('data-tooltip'), own ? this.getAttribute('shortcut') : el.getAttribute('data-tooltip-key'));
  }

  setupEvents() {
    this._onOver = (e) => {
      const el = e.pointerType === 'touch' ? null : this._targetOf(e);
      if (el === this._target) return;
      this.hide();
      if (!el) return;
      this._target = el;
      this._timer = setTimeout(() => this._showFor(el), this._delay);
    };
    this._onFocus = (e) => {
      const el = this._targetOf(e);
      if (!el || !deepActiveElement()?.matches(':focus-visible')) return;
      this.hide();
      this._target = el;
      this._showFor(el);
    };
    this._onHide = () => this.hide();
    this._onKey = (e) => { if (e.key === 'Escape' && this.open) this.hide(); };
    document.addEventListener('pointerover', this._onOver);
    document.addEventListener('focusin', this._onFocus);
    document.addEventListener('focusout', this._onHide);
    document.addEventListener('pointerdown', this._onHide, true);
    document.addEventListener('scroll', this._onHide, true);
    document.addEventListener('keydown', this._onKey);
  }

  teardownEvents() {
    document.removeEventListener('pointerover', this._onOver);
    document.removeEventListener('focusin', this._onFocus);
    document.removeEventListener('focusout', this._onHide);
    document.removeEventListener('pointerdown', this._onHide, true);
    document.removeEventListener('scroll', this._onHide, true);
    document.removeEventListener('keydown', this._onKey);
    this.hide();
  }

  onAttributeChanged(name) { if (name === 'shortcut' && !this._text.data) this._fill(null); if (name === 'for') this.hide(); }
}

customElements.define('nk-tooltip', NkTooltip);
export { NkTooltip };
