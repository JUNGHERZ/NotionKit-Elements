import { N as NkElement } from './shared/base-6gEcoatG.js';

// <nk-topbar>
//   <nk-breadcrumb>…</nk-breadcrumb>
//   <nk-btn slot="actions" variant="share">Share</nk-btn>
//   <nk-theme-toggle slot="actions"></nk-theme-toggle>
// </nk-topbar>
// → <div class="nk-topbar">…<div class="nk-topbar-actions">…</div></div>
// display:contents host, so the bar is a direct flex child of .nk-main.
class NkTopbar extends NkElement {

  render() {
    const bar = this.createElement('div', ['nk-topbar']);
    bar.appendChild(document.createElement('slot'));
    const actions = this.createElement('div', ['nk-topbar-actions']);
    actions.appendChild(this.createElement('slot', [], { name: 'actions' }));
    bar.appendChild(actions);
    this._wrapper.appendChild(bar);
  }
}

customElements.define('nk-topbar', NkTopbar);

export { NkTopbar };
