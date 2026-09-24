import { NkElement } from './base.js';
import '@jungherz-de/notionkit/notionkit-styles.js';

// <nk-btn variant="primary" small>Save</nk-btn>   →  <button class="nk-btn primary small">
// <nk-btn href="/docs" variant="secondary">Docs</nk-btn>  →  <a class="nk-btn secondary">
// <nk-btn variant="topbar">⭐</nk-btn>  →  <button class="nk-topbar-btn">
// <nk-btn variant="tool" active>Filter</nk-btn>  →  <button class="nk-db-tool active">  (slot="tools" of nk-database)
// <nk-btn variant="sidebar" aria-label="Menu">☰</nk-btn>  →  <button class="nk-topbar-btn nk-sidebar-toggle">:
//   on a phone it opens the page's <nk-sidebar> as a drawer; on the desktop
//   it shows while that sidebar is collapsed (.collapsed) and expands it.
//
// Modifier classes become attributes. A slotted <svg> is sized by the
// `.nk-btn ::slotted(svg)` twin; pass the icon itself, never wrapped.
const VARIANTS = ['primary', 'secondary', 'danger', 'danger-solid', 'topbar', 'share'];

class NkBtn extends NkElement {
  static get observedAttributes() { return ['variant', 'small', 'disabled', 'type', 'href', 'title', 'aria-label', 'aria-haspopup', 'active']; }

  render() {
    this._build();
  }

  _build() {
    const href = this.getAttribute('href');
    const el = href ? this.createElement('a', [], { href }) : this.createElement('button', [], { type: this.getAttribute('type') || 'button' });
    el.className = this._computeClasses().join(' ');
    el.appendChild(document.createElement('slot'));
    this._applyState(el);
    if (this._btn) {
      this._btn.removeEventListener('click', this._onClick);
      this._btn.replaceWith(el);
    } else {
      this._wrapper.appendChild(el);
    }
    this._btn = el;
    if (this._onClick) el.addEventListener('click', this._onClick);
  }

  _applyState(el) {
    const disabled = this.getBoolAttr('disabled');
    if (el.tagName === 'BUTTON') el.disabled = disabled;
    else el.setAttribute('aria-disabled', disabled ? 'true' : 'false');
    const title = this.getAttribute('title');
    title ? el.setAttribute('title', title) : el.removeAttribute('title');
    // The accessible name and the popup hint belong on the button itself.
    for (const name of ['aria-label', 'aria-haspopup']) {
      const v = this.getAttribute(name);
      v ? el.setAttribute(name, v) : el.removeAttribute(name);
    }
    if (this.getAttribute('variant') === 'sidebar') el.setAttribute('aria-expanded', this._sidebar()?.open ? 'true' : 'false');
    else el.removeAttribute('aria-expanded');
  }

  /** The sidebar the ☰ opens: the one in its own app, else the page's. */
  _sidebar() { return this.closest('nk-app')?.querySelector('nk-sidebar') ?? document.querySelector('nk-sidebar'); }
  _sidebarCollapsed() { return this.getAttribute('variant') === 'sidebar' && !!this._sidebar()?.hasAttribute('collapsed'); }

  setupEvents() {
    this._onClick = (e) => {
      if (this.getBoolAttr('disabled')) { e.preventDefault(); e.stopPropagation(); return; }
      if (this.getAttribute('variant') === 'sidebar') {
        const sidebar = this._sidebar();
        if (sidebar?.hasAttribute('collapsed') && !matchMedia('(max-width: 860px)').matches) sidebar.expand?.();
        else sidebar?.toggle?.();
        return;
      }
      // A button inside a shadow root is not a submit button of the outer
      // form; forward the intent to the form the host sits in.
      const type = this.getAttribute('type');
      if (type === 'submit' || type === 'reset') {
        const form = this.closest('form');
        if (form) type === 'submit' ? form.requestSubmit() : form.reset();
      }
    };
    // The ☰ says whether its drawer is open, however the drawer closed.
    this._onToggle = (e) => {
      if (this.getAttribute('variant') === 'sidebar' && e.target === this._sidebar()) this._btn.setAttribute('aria-expanded', e.detail.open ? 'true' : 'false');
    };
    // On the desktop the ☰ shows while its sidebar is collapsed.
    this._onCollapse = (e) => {
      if (this.getAttribute('variant') === 'sidebar' && e.target === this._sidebar()) this._btn.classList.toggle('collapsed', e.detail.collapsed);
    };
    this._btn.addEventListener('click', this._onClick);
    document.addEventListener('nk-toggle', this._onToggle);
    document.addEventListener('nk-collapse', this._onCollapse);
    if (this.getAttribute('variant') === 'sidebar') this._btn.className = this._computeClasses().join(' ');
  }

  teardownEvents() {
    this._btn?.removeEventListener('click', this._onClick);
    document.removeEventListener('nk-toggle', this._onToggle);
    document.removeEventListener('nk-collapse', this._onCollapse);
  }

  onAttributeChanged(name) {
    if (!this._btn) return;
    switch (name) {
      case 'href':
        this._build();
        break;
      case 'variant':
        this._btn.className = this._computeClasses().join(' ');
        this._applyState(this._btn);
        break;
      case 'small':
      case 'active':
        this._btn.className = this._computeClasses().join(' ');
        break;
      case 'type':
        if (this._btn.tagName === 'BUTTON') this._btn.setAttribute('type', this.getAttribute('type') || 'button');
        break;
      default:
        this._applyState(this._btn);
    }
  }

  _computeClasses() {
    const variant = this.getAttribute('variant');
    if (variant === 'topbar') return ['nk-topbar-btn'];
    if (variant === 'share') return ['nk-topbar-btn', 'nk-share-btn'];
    if (variant === 'sidebar') return this._sidebarCollapsed() ? ['nk-topbar-btn', 'nk-sidebar-toggle', 'collapsed'] : ['nk-topbar-btn', 'nk-sidebar-toggle'];
    if (variant === 'tool') return this.getBoolAttr('active') ? ['nk-db-tool', 'active'] : ['nk-db-tool'];
    const classes = ['nk-btn'];
    if (VARIANTS.includes(variant)) classes.push(variant);
    if (this.getBoolAttr('small')) classes.push('small');
    return classes;
  }

  focus(options) { this._btn?.focus(options); }
  click() { this._btn?.click(); }

  get variant() { return this.getAttribute('variant'); }
  set variant(v) { v ? this.setAttribute('variant', v) : this.removeAttribute('variant'); }
  get active() { return this.getBoolAttr('active'); }
  set active(v) { this.setBoolAttr('active', v); }
  get small() { return this.getBoolAttr('small'); }
  set small(v) { this.setBoolAttr('small', v); }
  get disabled() { return this.getBoolAttr('disabled'); }
  set disabled(v) { this.setBoolAttr('disabled', v); }
  get type() { return this.getAttribute('type') || 'button'; }
  set type(v) { this.setAttribute('type', v); }
  get href() { return this.getAttribute('href'); }
  set href(v) { v ? this.setAttribute('href', v) : this.removeAttribute('href'); }
}

customElements.define('nk-btn', NkBtn);

export { NkBtn };
