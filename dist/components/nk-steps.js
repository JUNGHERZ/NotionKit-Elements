import { NkElement } from './base.js';
import '@jungherz-de/notionkit/notionkit-styles.js';

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
// { label, desc } objects for a line under the label.
class NkSteps extends NkElement {
  static get observedAttributes() { return ['steps', 'current', 'label']; }

  render() {
    this._list = this.createElement('ol', ['nk-steps']);
    this._wrapper.appendChild(this._list);
    this._sync();
  }

  _items() {
    if (this._steps) return this._steps;
    return (this.getAttribute('steps') || '').split(',').map(s => s.trim()).filter(Boolean);
  }

  _sync() {
    const label = this.getAttribute('label');
    if (label) this._list.setAttribute('aria-label', label); else this._list.removeAttribute('aria-label');
    const current = this.current;
    this._list.replaceChildren(...this._items().map((step, i) => {
      const n = i + 1, { label: text, desc } = typeof step === 'object' && step ? step : { label: String(step) };
      const li = this.createElement('li', ['nk-step']);
      li.classList.toggle('done', n < current);
      li.classList.toggle('current', n === current);
      if (n === current) li.setAttribute('aria-current', 'step');
      const mark = this.createElement('span', ['st-mark'], { 'aria-hidden': 'true' });
      mark.textContent = n < current ? '✓' : String(n);
      const body = document.createElement('span');
      body.textContent = text ?? '';
      if (desc) { const d = this.createElement('span', ['st-desc']); d.textContent = desc; body.appendChild(d); }
      li.append(mark, body);
      return li;
    }));
  }

  onAttributeChanged() { this._sync(); }

  get steps() { return this._items(); }
  set steps(v) { this._steps = Array.isArray(v) ? v : null; if (this._list) this._sync(); }
  get current() { const n = parseInt(this.getAttribute('current'), 10); return Number.isFinite(n) ? n : 1; }
  set current(v) { this.setAttribute('current', String(v)); }
  /** Moves on to the next step; returns the new current step. */
  next() { this.current = Math.min(this.current + 1, this._items().length + 1); return this.current; }
}

customElements.define('nk-steps', NkSteps);

export { NkSteps };
