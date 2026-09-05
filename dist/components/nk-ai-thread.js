import { N as NkElement } from './shared/base-6gEcoatG.js';

// <nk-ai-thread><nk-ai-msg …>…</nk-ai-msg>…</nk-ai-thread>  →  <div class="nk-ai-thread">
class NkAiThread extends NkElement {
  render() {
    const box = this.createElement('div', ['nk-ai-thread'], { role: 'log', 'aria-live': 'polite' });
    box.appendChild(document.createElement('slot'));
    this._wrapper.appendChild(box);
  }
}

customElements.define('nk-ai-thread', NkAiThread);

export { NkAiThread };
