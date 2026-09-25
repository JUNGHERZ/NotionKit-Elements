import { NkElement } from '../../base.js';

// <nk-props>
//   <nk-prop label="Status" icon="◉"><nk-tag color="blue">In progress</nk-tag></nk-prop>
//   <nk-prop label="Owner" icon="👤"><nk-avatar size="small">MK</nk-avatar>Marcel Karas</nk-prop>
// </nk-props>
// → <dl class="nk-props">…</dl> – the properties under a page title. The rows
// are <nk-prop> hosts with display: contents, so each .nk-prop is a row of
// this list. `flush` (NotionKit 1.12.0) drops the outer margin meant for the
// flow under a title – for a list inside a panel or a flex column.
class NkProps extends NkElement {
  static get observedAttributes() { return ['flush']; }

  render() {
    this._list = this.createElement('dl', ['nk-props']);
    this._list.appendChild(document.createElement('slot'));
    this._wrapper.appendChild(this._list);
    this.onAttributeChanged();
  }

  onAttributeChanged() { this._list?.classList.toggle('flush', this.getBoolAttr('flush')); }

  get flush() { return this.getBoolAttr('flush'); }
  set flush(v) { this.setBoolAttr('flush', v); }
}

customElements.define('nk-props', NkProps);
export { NkProps };
