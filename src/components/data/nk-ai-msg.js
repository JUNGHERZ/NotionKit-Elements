import { NkElement } from '../../base.js';

// <nk-ai-msg role="user" name="You" avatar="MK">Summarise the open tasks.</nk-ai-msg>
// <nk-ai-msg role="assistant" name="Mona" badge="· AI" avatar="✨">
//   Two tasks are open …
//   <button slot="actions" value="copy">📋 Copy</button><button slot="actions" value="retry">↻ Rephrase</button>
// </nk-ai-msg>
// → <div class="nk-ai-msg user"><span class="mini-avatar">MK</span><div class="a-body"><div class="a-name">You</div>…<div class="nk-ai-actions">…</div></div></div>
// Action buttons stay in the light DOM (slotted twins) and fire nk-action { action: value }.
class NkAiMsg extends NkElement {
  static get observedAttributes() { return ['role', 'name', 'badge', 'avatar', 'color']; }

  render() {
    this._box = this.createElement('div', ['nk-ai-msg']);
    this._avatar = this.createElement('span', ['mini-avatar']);
    const avatarSlot = this.createElement('slot', [], { name: 'avatar' });
    avatarSlot.appendChild(this._avatar);
    const body = this.createElement('div', ['a-body']);
    this._name = this.createElement('div', ['a-name']);
    this._nameText = document.createTextNode('');
    this._badge = document.createElement('span');
    this._name.append(this._nameText, this._badge);
    this._actions = this.createElement('div', ['nk-ai-actions']);
    this._actionSlot = this.createElement('slot', [], { name: 'actions' });
    this._actions.appendChild(this._actionSlot);
    body.append(this._name, document.createElement('slot'), this._actions);
    this._box.append(avatarSlot, body);
    this._wrapper.appendChild(this._box);
    this._sync();
  }

  _sync() {
    const user = this.getAttribute('role') === 'user';
    this._box.classList.toggle('user', user);
    const name = this.getAttribute('name');
    this._nameText.data = name || '';
    const badge = this.getAttribute('badge');
    this._badge.textContent = badge ? ` ${badge}` : '';
    this._name.style.display = name ? '' : 'none';
    this._avatar.textContent = this.getAttribute('avatar') || (user ? (name || 'U').slice(0, 2).toUpperCase() : '✨');
    const color = this.getAttribute('color');
    this._avatar.style.background = color || '';
    this._actions.style.display = this._actionSlot.assignedElements().length ? '' : 'none';
  }

  setupEvents() {
    this._onSlot = () => this._sync();
    this._onClick = (e) => {
      const btn = e.target.closest?.('button');
      if (btn && this._actionSlot.assignedElements().includes(btn)) this.emit('nk-action', { action: btn.value || btn.textContent.trim(), value: btn.value || btn.textContent.trim() });
    };
    this._actionSlot.addEventListener('slotchange', this._onSlot);
    this.addEventListener('click', this._onClick);
    this._sync();
  }

  teardownEvents() {
    this._actionSlot?.removeEventListener('slotchange', this._onSlot);
    this.removeEventListener('click', this._onClick);
  }

  onAttributeChanged() { this._sync(); }
}

customElements.define('nk-ai-msg', NkAiMsg);
export { NkAiMsg };
