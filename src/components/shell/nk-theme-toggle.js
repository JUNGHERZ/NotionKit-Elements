import { NkElement, getCurrentTheme } from '../../base.js';

// <nk-theme-toggle slot="actions"></nk-theme-toggle>
// → <button class="nk-topbar-btn nk-theme-toggle">🌙</button>
// Flips data-theme on <html> (the only theme source), remembers the choice in
// localStorage (`storage-key`, default nk-theme), applies a stored or
// system preference on first connect when <html> carries no theme yet, and
// accepts postMessage({ nkTheme }) from a parent page (the landing page's
// embedded demo uses that).
class NkThemeToggle extends NkElement {
  static get observedAttributes() { return ['storage-key', 'title'];

  }

  render() {
    this._btn = this.createElement('button', ['nk-topbar-btn', 'nk-theme-toggle'], { type: 'button' });
    this._btn.title = this.getAttribute('title') || 'Toggle light / dark';
    this._wrapper.appendChild(this._btn);
    const root = document.documentElement;
    let stored = null;
    try { stored = localStorage.getItem(this.storageKey); } catch {}
    if (stored === 'light' || stored === 'dark') root.setAttribute('data-theme', stored);
    else if (!root.hasAttribute('data-theme')) root.setAttribute('data-theme', matchMedia('(prefers-color-scheme: dark)').matches ? 'dark' : 'light');
    this._syncGlyph();
  }

  _syncGlyph() {
    if (this._btn) this._btn.textContent = getCurrentTheme() === 'dark' ? '☀️' : '🌙';
  }

  _syncTheme(theme) {
    super._syncTheme(theme);
    this._syncGlyph();
  }

  setupEvents() {
    this._onClick = () => this.apply(getCurrentTheme() === 'dark' ? 'light' : 'dark');
    this._onMessage = (e) => { const t = e.data?.nkTheme; if (t === 'light' || t === 'dark') this.apply(t); };
    this._btn.addEventListener('click', this._onClick);
    window.addEventListener('message', this._onMessage);
  }

  teardownEvents() {
    this._btn?.removeEventListener('click', this._onClick);
    window.removeEventListener('message', this._onMessage);
  }

  onAttributeChanged(name) {
    if (name === 'title' && this._btn) this._btn.title = this.getAttribute('title') || 'Toggle light / dark';
  }

  /** Sets the theme on <html>, persists it and reports it. */
  apply(theme) {
    document.documentElement.setAttribute('data-theme', theme);
    try { localStorage.setItem(this.storageKey, theme); } catch {}
    this._syncGlyph();
    this.emit('nk-change', { value: theme });
  }

  get storageKey() { return this.getAttribute('storage-key') || 'nk-theme'; }
  get value() { return getCurrentTheme(); }
  set value(v) { this.apply(v); }
}

customElements.define('nk-theme-toggle', NkThemeToggle);
export { NkThemeToggle };
