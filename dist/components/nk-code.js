import { N as NkElement } from './shared/base-6gEcoatG.js';

// Minimal HTML highlighter emitting the .tag / .attr hooks .nk-code styles.
// Mirrors tools/highlight.mjs in the NotionKit foundation – no third-party
// highlighter, no other languages. Anything that is not HTML is escaped only.
function escapeHtml(s) {
  return s.replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;');
}

function highlightHtml(source) {
  return escapeHtml(source).replace(/&lt;(\/?)([a-zA-Z][\w-]*)([^&]*?)(\/?)&gt;/g, (m, close, tag, attrs, self) => {
    const attrHtml = attrs.replace(/([\w-]+)(=)("[^"]*"|'[^']*')?/g,
      (a, name, eq, val) => `<span class="attr">${name}</span>${eq}${val ?? ''}`);
    return `&lt;${close}<span class="tag">${tag}</span>${attrHtml}${self}&gt;`;
  });
}

// <nk-code lang="html">&lt;div class="nk-btn"&gt;…</nk-code>
// The block keeps whatever whitespace it is given (white-space: pre). Text
// content is slotted as-is; add `highlight` to colour HTML tags/attributes,
// which copies the text into the shadow tree (light DOM is then ignored).
class NkCode extends NkElement {
  static get observedAttributes() { return ['lang', 'highlight']; }
  static get observesLightDom() { return true; }

  render() {
    this._box = this.createElement('div', ['nk-code']);
    this._lang = this.createElement('span', ['lang']);
    this._slot = document.createElement('slot');
    this._pre = this.createElement('span', ['hl']);
    this._box.appendChild(this._lang);
    this._box.appendChild(this._slot);
    this._box.appendChild(this._pre);
    this._wrapper.appendChild(this._box);
    this._sync();
    this.projectLightDom();
  }

  onAttributeChanged() { this._sync(); this.projectLightDom(); }

  _sync() {
    if (!this._lang) return;
    const lang = this.getAttribute('lang');
    this._lang.textContent = lang || '';
    this._lang.style.display = lang ? '' : 'none';
  }

  projectLightDom() {
    if (!this._pre) return;
    const highlight = this.hasAttribute('highlight');
    this._slot.style.display = highlight ? 'none' : '';
    this._pre.style.display = highlight ? '' : 'none';
    if (!highlight) return;
    const text = this.textContent.replace(/^\n/, '');
    if (text === this._lastText) return;
    this._lastText = text;
    this._pre.innerHTML = highlightHtml(text);
  }

  get lang() { return this.getAttribute('lang'); }
  set lang(v) { v == null ? this.removeAttribute('lang') : this.setAttribute('lang', v); }
}

customElements.define('nk-code', NkCode);

export { NkCode };
