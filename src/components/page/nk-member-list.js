import { NkElement } from '../../base.js';

// <nk-member-list><nk-member-row …></nk-member-row>…</nk-member-list>
// → <div class="nk-member-list">…</div>; the last row gets `last` (no border).
class NkMemberList extends NkElement {
  render() {
    const box = this.createElement('div', ['nk-member-list']);
    this._slot = document.createElement('slot');
    box.appendChild(this._slot);
    this._wrapper.appendChild(box);
    this._mark();
  }

  _mark() {
    const rows = this._slot.assignedElements().filter(el => el.localName === 'nk-member-row');
    rows.forEach((row, i) => { if (i === rows.length - 1) row.setAttribute('last', ''); else row.removeAttribute('last'); });
  }

  setupEvents() {
    this._onSlot = () => this._mark();
    this._slot.addEventListener('slotchange', this._onSlot);
    this._mark();
  }

  teardownEvents() { this._slot?.removeEventListener('slotchange', this._onSlot); }
}

customElements.define('nk-member-list', NkMemberList);
export { NkMemberList };
