import { NkElement } from '../../base.js';
import { paintAvatar, initialsOf } from '../../util/avatar.js';

// <nk-member-row name="Sara Lindt" mail="sara@…" avatar="SL" color="green">
//   <nk-select slot="role" compact>…</nk-select>
// </nk-member-row>
// → <div class="nk-member-row"><span class="nk-avatar green">SL</span><div>Sara Lindt<div class="m-mail">…</div></div><select …></div>
// color: one of Notion's nine names, or any CSS background; without it the
// avatar gradient. The row sizes the avatar to 28px.
class NkMemberRow extends NkElement {
  static get observedAttributes() { return ['name', 'mail', 'avatar', 'color', 'last']; }

  render() {
    this._row = this.createElement('div', ['nk-member-row']);
    this._avatar = this.createElement('span', ['nk-avatar']);
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
    this._avatar.textContent = avatar || initialsOf(this.getAttribute('name'));
    paintAvatar(this._avatar, this.getAttribute('color'));
    this._row.classList.toggle('last', this.getBoolAttr('last'));
  }

  onAttributeChanged() { this._sync(); }
}

customElements.define('nk-member-row', NkMemberRow);
export { NkMemberRow };
