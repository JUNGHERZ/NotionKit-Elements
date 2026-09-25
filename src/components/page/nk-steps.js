import { NkElement } from '../../base.js';

// <nk-steps label="Connect your own model" current="2"
//           steps="Choose a provider, Enter the API key, Test the connection"></nk-steps>
// steps.steps = [{ label: 'Choose a provider', desc: 'Anthropic' }, 'Enter the API key', …];
// → <ol class="nk-steps" aria-label="…">
//     <li class="nk-step done"><span class="st-mark">✓</span><span>Choose a provider<span class="st-desc">Anthropic</span></span></li>
//     <li class="nk-step current" aria-current="step"><span class="st-mark">2</span><span>Enter the API key</span></li>
//     <li class="nk-step"><span class="st-mark">3</span><span>Test the connection</span></li></ol>
// A setup in a few steps (NotionKit 1.7.0). `current` counts from 1; the
// steps before it are done, one past the last marks all of them done. The
// `steps` attribute is a comma-separated list; the property also takes
// { label, desc, state, value } objects for a line under the label and a
// state of its own – 'done', 'skipped' or 'open' (NotionKit 1.12.0) – for a
// wizard that lets a step be skipped while a later one is done.
// `selectable` makes each label a button: a click or Enter fires
// nk-select { index, value, step } – index counts from 1, like `current` –
// and, unless cancelled, makes that step current. `horizontal` sets the
// steps in one row above a wizard.
// A step with `href` (1.17.0) shows its label as a link, <a class="st-label">,
// with or without `selectable` – to open a chapter in a new tab or copy its
// address. A plain click, or Enter, fires the same nk-select; cancelling it
// keeps the browser from following the link, for a router of your own. A
// middle click or one with Cmd, Ctrl, Shift or Alt fires nothing and does
// what a link does.
class NkSteps extends NkElement {
  static get observedAttributes() { return ['steps', 'current', 'label', 'selectable', 'horizontal']; }

  render() {
    this._list = this.createElement('ol', ['nk-steps']);
    this._wrapper.appendChild(this._list);
    this._sync();
  }

  _items() {
    if (this._steps) return this._steps;
    return (this.getAttribute('steps') || '').split(',').map(s => s.trim()).filter(Boolean);
  }

  _step(i) {
    const step = this._items()[i];
    return typeof step === 'object' && step ? step : step === undefined ? undefined : { label: String(step) };
  }

  _sync() {
    const label = this.getAttribute('label');
    if (label) this._list.setAttribute('aria-label', label); else this._list.removeAttribute('aria-label');
    this._list.classList.toggle('horizontal', this.getBoolAttr('horizontal'));
    const current = this.current, selectable = this.getBoolAttr('selectable');
    // Rebuilding drops the focused label; the new one at that place takes it back.
    const focused = this.shadowRoot?.activeElement?.closest?.('li')?.dataset.index;
    this._list.replaceChildren(...this._items().map((_, i) => {
      const n = i + 1, { label: text, desc, state, href } = this._step(i);
      // A state of its own wins; without one, the steps before `current` are done.
      const done = state ? state === 'done' : n < current, skipped = state === 'skipped';
      const li = this.createElement('li', ['nk-step'], { 'data-index': String(n) });
      li.classList.toggle('done', done);
      li.classList.toggle('skipped', skipped);
      li.classList.toggle('current', n === current);
      if (n === current) li.setAttribute('aria-current', 'step');
      const mark = this.createElement('span', ['st-mark'], { 'aria-hidden': 'true' });
      mark.textContent = done ? '✓' : skipped ? '–' : String(n);
      const body = href != null && href !== '' ? this.createElement('a', ['st-label'], { href: String(href) })
        : selectable ? this.createElement('button', ['st-label'], { type: 'button' }) : document.createElement('span');
      body.textContent = text ?? '';
      if (desc) { const d = this.createElement('span', ['st-desc']); d.textContent = desc; body.appendChild(d); }
      li.append(mark, body);
      return li;
    }));
    if (focused) this._list.querySelector(`li[data-index="${focused}"] .st-label`)?.focus();
  }

  setupEvents() {
    this._onClick = (e) => {
      const li = e.target.closest?.('li.nk-step');
      if (!li || !this._list.contains(li)) return;
      const link = li.querySelector('a.st-label');
      if (link) {
        // The link contract: a plain left click is a selection, any other
        // one the browser's. The mark beside the link counts as the link.
        if (e.button !== 0 || e.metaKey || e.ctrlKey || e.shiftKey || e.altKey) return;
        if (!link.contains(e.target)) { link.click(); return; }
        if (!this.select(Number(li.dataset.index))) e.preventDefault();
        return;
      }
      if (this.getBoolAttr('selectable')) this.select(Number(li.dataset.index));
    };
    this._list.addEventListener('click', this._onClick);
  }

  teardownEvents() { this._list?.removeEventListener('click', this._onClick); }
  onAttributeChanged() { this._sync(); }

  /** Jumps to step `index` (from 1): fires nk-select { index, value, step } and, unless cancelled, makes it current. */
  select(index) {
    const step = this._step(index - 1);
    if (!step) return false;
    const ok = this.emit('nk-select', { index, value: step.value ?? step.label, step });
    if (ok) this.current = index;
    return ok;
  }

  get steps() { return this._items(); }
  set steps(v) { this._steps = Array.isArray(v) ? v : null; if (this._list) this._sync(); }
  get current() { const n = parseInt(this.getAttribute('current'), 10); return Number.isFinite(n) ? n : 1; }
  set current(v) { this.setAttribute('current', String(v)); }
  get selectable() { return this.getBoolAttr('selectable'); }
  set selectable(v) { this.setBoolAttr('selectable', v); }
  get horizontal() { return this.getBoolAttr('horizontal'); }
  set horizontal(v) { this.setBoolAttr('horizontal', v); }
  /** Moves on to the next step; returns the new current step. */
  next() { this.current = Math.min(this.current + 1, this._items().length + 1); return this.current; }
}

customElements.define('nk-steps', NkSteps);
export { NkSteps };
