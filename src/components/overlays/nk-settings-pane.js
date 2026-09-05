import { NkElement } from '../../base.js';

// <nk-settings-pane name="profile" label="My profile" icon="👤" group="Account" title="My profile" active>…</nk-settings-pane>
// → <section class="nk-settings-pane active"><h2>My profile</h2>…</section>
// `label`, `icon` and `group` feed the nav that <nk-modal> renders; `title`
// renders the pane heading (child-combinator rule, so it lives here). Slotted
// <h2>/<h3> are styled by their twins.
class NkSettingsPane extends NkElement {
  static get observedAttributes() { return ['name', 'label', 'icon', 'group', 'title', 'active']; }

  render() {
    this._section = this.createElement('section', ['nk-settings-pane'], { role: 'tabpanel' });
    this._h2 = document.createElement('h2');
    this._section.appendChild(this._h2);
    this._section.appendChild(document.createElement('slot'));
    this._wrapper.appendChild(this._section);
    this._sync();
  }

  _sync() {
    const title = this.getAttribute('title');
    this._h2.textContent = title || '';
    this._h2.style.display = title ? '' : 'none';
    this._section.classList.toggle('active', this.getBoolAttr('active'));
    this._section.setAttribute('aria-label', this.getAttribute('label') || title || this.getAttribute('name') || '');
  }

  onAttributeChanged(name) {
    this._sync();
    if (['label', 'icon', 'group', 'name'].includes(name)) this.closest('nk-modal')?.requestNav?.();
  }

  get name() { return this.getAttribute('name') ?? this.getAttribute('label') ?? ''; }
  get active() { return this.getBoolAttr('active'); }
  set active(v) { this.setBoolAttr('active', v); }
}

customElements.define('nk-settings-pane', NkSettingsPane);
export { NkSettingsPane };
