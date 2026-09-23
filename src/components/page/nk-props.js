import { NkElement } from '../../base.js';

// <nk-props>
//   <nk-prop label="Status" icon="◉"><nk-tag color="blue">In progress</nk-tag></nk-prop>
//   <nk-prop label="Owner" icon="👤"><nk-avatar size="small">MK</nk-avatar>Marcel Karas</nk-prop>
// </nk-props>
// → <dl class="nk-props">…</dl> – the properties under a page title. The rows
// are <nk-prop> hosts with display: contents, so each .nk-prop is a row of
// this list.
class NkProps extends NkElement {
  render() {
    const list = this.createElement('dl', ['nk-props']);
    list.appendChild(document.createElement('slot'));
    this._wrapper.appendChild(list);
  }
}

customElements.define('nk-props', NkProps);
export { NkProps };
