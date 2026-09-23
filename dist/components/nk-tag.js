import { NkElement } from './base.js';
import '@jungherz-de/notionkit/notionkit-styles.js';

// <nk-tag color="blue">Text</nk-tag>  —  modifier class .blue becomes color="blue".
// Notion's nine select colours; without `color` the stylesheet draws the grey tag.
const COLORS = ['gray', 'brown', 'orange', 'yellow', 'green', 'blue', 'purple', 'pink', 'red'];

class NkTag extends NkElement {
  static get observedAttributes() { return ['color']; }

  render() {
    this._tag = this.createElement('span', this._computeClasses());
    this._tag.appendChild(document.createElement('slot'));
    this._wrapper.appendChild(this._tag);
  }

  onAttributeChanged() {
    if (this._tag) this._tag.className = this._computeClasses().join(' ');
  }

  _computeClasses() {
    const classes = ['nk-tag'];
    const color = this.getAttribute('color');
    if (COLORS.includes(color)) classes.push(color);
    return classes;
  }

  get color() { return this.getAttribute('color'); }
  set color(v) { v ? this.setAttribute('color', v) : this.removeAttribute('color'); }
}

customElements.define('nk-tag', NkTag);

export { NkTag };
