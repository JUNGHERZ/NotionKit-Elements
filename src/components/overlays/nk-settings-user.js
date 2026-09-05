import { NkElement } from '../../base.js';

// <nk-settings-user slot="user" name="Marcel Karas" mail="marcel@…" avatar="MK"></nk-settings-user>
// → <div class="nk-settings-user"><div class="avatar">MK</div><div class="u-text"><div class="name">…</div><div class="mail">…</div></div></div>
class NkSettingsUser extends NkElement {
  static get observedAttributes() { return ['name', 'mail', 'avatar']; }

  render() {
    const box = this.createElement('div', ['nk-settings-user']);
    this._avatar = this.createElement('div', ['avatar']);
    const s = this.createElement('slot', [], { name: 'avatar' });
    s.appendChild(this._avatar);
    const text = this.createElement('div', ['u-text']);
    this._name = this.createElement('div', ['name']);
    this._mail = this.createElement('div', ['mail']);
    text.append(this._name, this._mail);
    box.append(s, text);
    this._wrapper.appendChild(box);
    this._sync();
  }

  _sync() {
    const name = this.getAttribute('name') || '';
    this._name.textContent = name;
    const mail = this.getAttribute('mail');
    this._mail.textContent = mail || '';
    this._mail.style.display = mail ? '' : 'none';
    this._avatar.textContent = this.getAttribute('avatar') || name.split(/\s+/).map(w => w[0]).join('').slice(0, 2).toUpperCase();
  }

  onAttributeChanged() { this._sync(); }
}

customElements.define('nk-settings-user', NkSettingsUser);
export { NkSettingsUser };
