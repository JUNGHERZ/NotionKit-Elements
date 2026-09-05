import { N as NkElement } from './shared/base-6gEcoatG.js';

// <nk-btn variant="primary" small>Save</nk-btn>   →  <button class="nk-btn primary small">
// <nk-btn href="/docs" variant="secondary">Docs</nk-btn>  →  <a class="nk-btn secondary">
// <nk-btn variant="topbar">⭐</nk-btn>  →  <button class="nk-topbar-btn">
//
// Modifier classes become attributes. A slotted <svg> is sized by the
// `.nk-btn ::slotted(svg)` twin; pass the icon itself, never wrapped.
const VARIANTS = ['primary', 'secondary', 'danger', 'danger-solid', 'topbar', 'share'];

class NkBtn extends NkElement {
  static get observedAttributes() { return ['variant', 'small', 'disabled', 'type', 'href', 'title', 'aria-label']; }

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
    const label = this.getAttribute('aria-label');
    label ? el.setAttribute('aria-label', label) : el.removeAttribute('aria-label');
  }

  setupEvents() {
    this._onClick = (e) => {
      if (this.getBoolAttr('disabled')) { e.preventDefault(); e.stopPropagation(); return; }
      // A button inside a shadow root is not a submit button of the outer
      // form; forward the intent to the form the host sits in.
      const type = this.getAttribute('type');
      if (type === 'submit' || type === 'reset') {
        const form = this.closest('form');
        if (form) type === 'submit' ? form.requestSubmit() : form.reset();
      }
    };
    this._btn.addEventListener('click', this._onClick);
  }

  teardownEvents() {
    this._btn?.removeEventListener('click', this._onClick);
  }

  onAttributeChanged(name) {
    if (!this._btn) return;
    switch (name) {
      case 'href':
        this._build();
        break;
      case 'variant':
      case 'small':
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
    const classes = ['nk-btn'];
    if (VARIANTS.includes(variant)) classes.push(variant);
    if (this.getBoolAttr('small')) classes.push('small');
    return classes;
  }

  focus(options) { this._btn?.focus(options); }
  click() { this._btn?.click(); }

  get variant() { return this.getAttribute('variant'); }
  set variant(v) { v ? this.setAttribute('variant', v) : this.removeAttribute('variant'); }
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
