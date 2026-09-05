import { NkElement } from '../../base.js';

// <nk-member-row name="Sara Lindt" mail="sara@…" avatar="SL" color="#448361">
//   <nk-select slot="role" compact>…</nk-select>
// </nk-member-row>
// → <div class="nk-member-row"><span class="mini-avatar">SL</span><div>Sara Lindt<div class="m-mail">…</div></div><select …></div>
class NkMemberRow extends NkElement {
  static get observedAttributes() { return ['name', 'mail', 'avatar', 'color', 'last']; }

  render() {
    this._row = this.createElement('div', ['nk-member-row']);
    this._avatar = this.createElement('span', ['mini-avatar']);
    const avatarSlot = this.createElement('slot', [], { name: 'avatar' });
    avatarSlot.appendChild(this._avatar);
    const text = document.createElement('div');
    this._name = document.createTextNode('');
    this._mail = this.createElement('div', ['m-mail']);
    text.append(this._name, this._mail);
    // `.nk-member-row .nk-select { margin-left: auto }` cannot reach a select
    // inside another shadow root, and a display:contents host takes no margin –
    // so the role slot sits in a box that carries that rule.
    const role = document.createElement('div');
    role.style.marginLeft = 'auto';
    role.appendChild(this.createElement('slot', [], { name: 'role' }));
    this._row.append(avatarSlot, text, role, document.createElement('slot'));
    this._wrapper.appendChild(this._row);
    this._sync();
  }

  _sync() {
    this._name.data = this.getAttribute('name') || '';
    const mail = this.getAttribute('mail');
    this._mail.textContent = mail || '';
    this._mail.style.display = mail ? '' : 'none';
    const avatar = this.getAttribute('avatar');
    this._avatar.textContent = avatar || (this.getAttribute('name') || '').split(/\s+/).map(w => w[0]).join('').slice(0, 2).toUpperCase();
    this._avatar.style.background = this.getAttribute('color') || 'var(--nk-text-tertiary)';
    this._row.classList.toggle('last', this.getBoolAttr('last'));
  }

  onAttributeChanged() { this._sync(); }
}

customElements.define('nk-member-row', NkMemberRow);
export { NkMemberRow };
