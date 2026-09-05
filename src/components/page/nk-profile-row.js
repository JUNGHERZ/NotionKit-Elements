import { NkElement } from '../../base.js';

// <nk-profile-row avatar="MK"><nk-btn variant="secondary" small>Change photo</nk-btn></nk-profile-row>
// → <div class="nk-profile-row"><div class="big-avatar">MK</div>…</div>
class NkProfileRow extends NkElement {
  static get observedAttributes() { return ['avatar']; }

  render() {
    const row = this.createElement('div', ['nk-profile-row']);
    this._avatar = this.createElement('div', ['big-avatar']);
    const s = this.createElement('slot', [], { name: 'avatar' });
    s.appendChild(this._avatar);
    row.appendChild(s);
    row.appendChild(document.createElement('slot'));
    this._wrapper.appendChild(row);
    this._sync();
  }

  _sync() { this._avatar.textContent = this.getAttribute('avatar') || ''; }
  onAttributeChanged() { this._sync(); }
}

customElements.define('nk-profile-row', NkProfileRow);
export { NkProfileRow };
