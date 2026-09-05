import { N as NkElement } from './shared/base-6gEcoatG.js';

// <nk-comment author="Sara Lindt" time="1 hr ago" avatar="SL" color="#448361">The board view feels close.</nk-comment>
// → <div class="nk-comment"><span class="mini-avatar">SL</span><div><div class="c-head"><b>Sara Lindt</b> · 1 hr ago</div><div class="c-body">…</div></div></div>
// slot="head" adds content after the name (e.g. an <nk-tag>).
class NkComment extends NkElement {
  static get observedAttributes() { return ['author', 'time', 'avatar', 'color']; }

  render() {
    const box = this.createElement('div', ['nk-comment']);
    this._avatar = this.createElement('span', ['mini-avatar']);
    const avatarSlot = this.createElement('slot', [], { name: 'avatar' });
    avatarSlot.appendChild(this._avatar);
    const text = document.createElement('div');
    this._head = this.createElement('div', ['c-head']);
    this._author = document.createElement('b');
    this._time = document.createTextNode('');
    this._head.append(this._author, this.createElement('slot', [], { name: 'head' }), this._time);
    const body = this.createElement('div', ['c-body']);
    body.appendChild(document.createElement('slot'));
    text.append(this._head, body);
    box.append(avatarSlot, text);
    this._wrapper.appendChild(box);
    this._sync();
  }

  _sync() {
    const author = this.getAttribute('author') || '';
    this._author.textContent = author;
    const time = this.getAttribute('time');
    this._time.data = time ? ` · ${time}` : '';
    this._avatar.textContent = this.getAttribute('avatar') || author.split(/\s+/).map(w => w[0]).join('').slice(0, 2).toUpperCase();
    this._avatar.style.background = this.getAttribute('color') || 'var(--nk-text-tertiary)';
  }

  onAttributeChanged() { this._sync(); }
}

customElements.define('nk-comment', NkComment);

export { NkComment };
