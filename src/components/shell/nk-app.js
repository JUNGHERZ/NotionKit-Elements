import { NkElement } from '../../base.js';

// <nk-app>
//   <nk-sidebar slot="sidebar">…</nk-sidebar>
//   <nk-topbar>…</nk-topbar>
//   <nk-page>…</nk-page>
// </nk-app>
// → <div class="nk-app"><aside class="nk-sidebar">…</aside><main class="nk-main">…</main></div>
// The outermost element of a workspace app: a full-height flex row.
// `peek-inset` (NotionKit 1.10.0) gives the main column a right padding as
// wide as the side peek – <nk-peek inset> sets it while it is open.
class NkApp extends NkElement {
  static get observedAttributes() { return ['peek-inset']; }

  render() {
    const app = this._app = this.createElement('div', ['nk-app']);
    app.classList.toggle('peek-inset', this.getBoolAttr('peek-inset'));
    app.appendChild(this.createElement('slot', [], { name: 'sidebar' }));
    const main = this.createElement('main', ['nk-main']);
    main.appendChild(document.createElement('slot'));
    app.appendChild(main);
    this._wrapper.appendChild(app);
  }

  onAttributeChanged() { this._app.classList.toggle('peek-inset', this.getBoolAttr('peek-inset')); }
}

customElements.define('nk-app', NkApp);
export { NkApp };
