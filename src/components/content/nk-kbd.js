import { NkElement } from '../../base.js';

// <nk-kbd>⌘</nk-kbd> <nk-kbd>K</nk-kbd>  →  <kbd class="nk-kbd">
class NkKbd extends NkElement {

  render() {
    const kbd = this.createElement('kbd', ['nk-kbd']);
    kbd.appendChild(document.createElement('slot'));
    this._wrapper.appendChild(kbd);
  }
}

customElements.define('nk-kbd', NkKbd);
export { NkKbd };
