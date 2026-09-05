import { N as NkElement } from './shared/base-6gEcoatG.js';

// <nk-app>
//   <nk-sidebar slot="sidebar">…</nk-sidebar>
//   <nk-topbar>…</nk-topbar>
//   <nk-page>…</nk-page>
// </nk-app>
// → <div class="nk-app"><aside class="nk-sidebar">…</aside><main class="nk-main">…</main></div>
// The outermost element of a workspace app: a full-height flex row.
class NkApp extends NkElement {
  render() {
    const app = this.createElement('div', ['nk-app']);
    app.appendChild(this.createElement('slot', [], { name: 'sidebar' }));
    const main = this.createElement('main', ['nk-main']);
    main.appendChild(document.createElement('slot'));
    app.appendChild(main);
    this._wrapper.appendChild(app);
  }
}

customElements.define('nk-app', NkApp);

export { NkApp };
