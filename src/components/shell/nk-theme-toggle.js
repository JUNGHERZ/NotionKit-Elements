import { NkElement, getCurrentTheme } from '../../base.js';

// <nk-theme-toggle slot="actions"></nk-theme-toggle>
// → <button class="nk-topbar-btn nk-theme-toggle">🌙</button>
// Flips data-theme on <html> (the only theme source), remembers the choice in
// localStorage (`storage-key`, default nk-theme), applies a stored or
// system preference on first connect when <html> carries no theme yet, and
// accepts postMessage({ nkTheme }) from a parent page (the landing page's
// embedded demo uses that).
//
// <nk-theme-toggle modes="auto light dark"> adds a third state (1.20.0):
// `auto` follows prefers-color-scheme, live, and is what no stored value
// means – so the documented inline script before first paint keeps working
// and a choice made without `modes` still counts. The glyph then shows the
// mode (☀️, 🌙, both for auto) instead of the next theme, the title names
// the mode and the next one, other tabs follow through the storage event,
// and `theme-color` keeps <meta name="theme-color"> in step. Two states stay
// the default, where nothing about this element changes.
const GLYPH = { light: '☀️', dark: '🌙' };

class NkThemeToggle extends NkElement {
  static get observedAttributes() { return ['storage-key', 'title', 'modes', 'theme-color']; }

  render() {
    this._btn = this.createElement('button', ['nk-topbar-btn', 'nk-theme-toggle'], { type: 'button' });
    this._wrapper.appendChild(this._btn);
    this._readThemeColors();
    if (this.auto) {
      // With `auto` this element owns the theme: a stored choice, else the
      // system. The inline script before first paint has set the same value.
      this._applyMode();
    } else {
      const root = document.documentElement;
      let stored = null;
      try { stored = localStorage.getItem(this.storageKey); } catch {}
      if (stored === 'light' || stored === 'dark') root.setAttribute('data-theme', stored);
      else if (!root.hasAttribute('data-theme')) root.setAttribute('data-theme', this.systemTheme);
      this._syncThemeColor();
      this._syncGlyph();
      this._syncTitle();
    }
  }

  // ── Modes ──

  /** The states offered, in the author's order; without a theme among them the default two. */
  get modes() {
    const list = [...new Set((this.getAttribute('modes') || '').toLowerCase().split(/\s+/))].filter(m => m === 'auto' || m === 'light' || m === 'dark');
    return list.some(m => m !== 'auto') ? list : ['light', 'dark'];
  }

  /** Whether `auto` is offered – the only thing that changes this element's behaviour. */
  get auto() { return this.modes.includes('auto'); }

  /** One query object per element: a listener on a throwaway one is neither removable nor safe from collection. */
  get systemQuery() { return (this._query ??= matchMedia('(prefers-color-scheme: dark)')); }

  get systemTheme() { return this.systemQuery.matches ? 'dark' : 'light'; }

  /** The mode in force: 'auto' (nothing stored), 'light' or 'dark'. Without `auto` the theme on screen. */
  get mode() {
    if (!this.auto) return getCurrentTheme();
    let stored = null;
    try { stored = localStorage.getItem(this.storageKey); } catch { return this._unsaved || 'auto'; }
    if (stored === 'light' || stored === 'dark') return stored;
    return this._unsaved || 'auto';
  }

  /** The theme on screen for a mode: `auto` is whatever the system says. */
  themeFor(mode = this.mode) { return mode === 'auto' ? this.systemTheme : mode; }

  /**
   * The mode a click moves to. From `auto` to the theme that is *not* on
   * screen, then to the other one, then back to `auto` – so every click but
   * the last changes something visibly. Without `auto` it cycles the themes.
   */
  nextMode(mode = this.mode) {
    const modes = this.modes, themes = modes.filter(m => m !== 'auto'), system = this.systemTheme;
    if (!modes.includes('auto')) return themes[(themes.indexOf(mode) + 1) % themes.length];
    if (mode === 'auto') return themes.find(m => m !== system) ?? themes[0];
    if (mode !== system) return themes.includes(system) ? system : 'auto';
    return 'auto';
  }

  // ── Applying ──

  _applyMode(mode = this.mode) {
    const theme = this.themeFor(mode);
    const root = document.documentElement;
    // Only on a change: the observer in base.js mirrors data-theme into every
    // element, and auto re-applies the same value on every system change.
    if (root.getAttribute('data-theme') !== theme) root.setAttribute('data-theme', theme);
    this._syncThemeColor(mode);
    this._syncGlyph();
    this._syncTitle();
  }

  /** The page's own theme-color values, per medium, before this element touched them. */
  _readThemeColors() {
    this._bars = [...document.querySelectorAll('meta[name="theme-color"]')].map(meta => ({
      meta, dark: (meta.getAttribute('media') || '').includes('dark'), content: meta.getAttribute('content'),
    }));
  }

  /**
   * `theme-color`: while a theme is fixed every meta carries the colour of
   * that theme, so the browser bar follows the choice; back on `auto` each
   * one carries its own again. The colours are the page's – never invented.
   */
  _syncThemeColor(mode = this.mode) {
    if (!this.hasAttribute('theme-color') || !this._bars?.length) return;
    const auto = mode === 'auto', dark = this.themeFor(mode) === 'dark';
    const fixed = (this._bars.find(bar => bar.dark === dark) ?? this._bars[0]).content;
    for (const bar of this._bars) if (bar.content !== null) bar.meta.setAttribute('content', auto ? bar.content : fixed);
  }

  _syncGlyph() {
    if (!this._btn) return;
    if (!this.auto) {
      // Two states: the glyph is the next theme, as it has always been.
      this._btn.replaceChildren(getCurrentTheme() === 'dark' ? GLYPH.light : GLYPH.dark);
      this._btn.removeAttribute('aria-label');
      return;
    }
    const mode = this.mode;
    const glyph = this.createElement('span', ['nk-theme-glyph'], { 'aria-hidden': 'true' });
    if (mode === 'auto') glyph.classList.add('auto');
    for (const text of mode === 'auto' ? [GLYPH.light, GLYPH.dark] : [GLYPH[mode]]) {
      glyph.appendChild(Object.assign(document.createElement('span'), { textContent: text }));
    }
    this._btn.replaceChildren(glyph);
    // Two emojis are no accessible name; the title's text is.
    this._btn.setAttribute('aria-label', this._titleText());
  }

  _syncTheme(theme) {
    super._syncTheme(theme);
    this._syncGlyph();
    this._syncTitle();
  }

  _titleText() {
    const own = this.getAttribute('title');
    if (own) return own;
    if (!this.auto) return this.str('toggleTheme');
    const name = (mode) => this.str(mode === 'auto' ? 'themeAuto' : mode === 'dark' ? 'themeDark' : 'themeLight');
    return this.str('appearance').replace('{mode}', name(this.mode)).replace('{next}', name(this.nextMode()));
  }

  _syncTitle() { if (this._btn) this._btn.title = this._titleText(); }
  onStringsChanged() { this._syncTitle(); if (this.auto) this._syncGlyph(); }

  setupEvents() {
    this._onClick = () => this.apply(this.nextMode());
    this._onMessage = (e) => { const t = e.data?.nkTheme; if (t === 'light' || t === 'dark' || (t === 'auto' && this.auto)) this.apply(t); };
    // `auto` has to notice a system switch while the page is open, and a
    // choice made in another tab. Both only matter where `auto` is offered.
    this._onSystem = () => { if (this.mode === 'auto') this._applyMode(); };
    this._onStorage = (e) => { if (e.key === this.storageKey || e.key === null) this._applyMode(); };
    this._btn.addEventListener('click', this._onClick);
    window.addEventListener('message', this._onMessage);
    if (this.auto) {
      this.systemQuery.addEventListener('change', this._onSystem);
      window.addEventListener('storage', this._onStorage);
    }
  }

  teardownEvents() {
    this._btn?.removeEventListener('click', this._onClick);
    window.removeEventListener('message', this._onMessage);
    if (this._onSystem) this.systemQuery.removeEventListener('change', this._onSystem);
    window.removeEventListener('storage', this._onStorage);
  }

  onAttributeChanged(name) {
    if (!this._btn) return;
    if (name === 'modes') {
      // Re-arm: the listeners above hang on whether `auto` is offered.
      if (this.isConnected) { this.teardownEvents(); this.setupEvents(); }
      this.auto ? this._applyMode() : this._syncGlyph();
    }
    this._syncTitle();
  }

  /**
   * Sets the mode on <html>, persists it and reports it. `light` / `dark`
   * are stored, `auto` (only where it is offered) clears the entry – that is
   * what the inline script before first paint reads.
   */
  apply(mode) {
    const wanted = mode === 'auto' && this.auto ? 'auto' : mode === 'light' || mode === 'dark' ? mode : this.themeFor(mode);
    try {
      if (wanted === 'auto') localStorage.removeItem(this.storageKey);
      else localStorage.setItem(this.storageKey, wanted);
      this._unsaved = null;
    } catch { this._unsaved = wanted; }
    this._applyMode(wanted);
    this.emit('nk-change', { value: this.auto ? wanted : this.themeFor(wanted), theme: this.themeFor(wanted) });
  }

  get storageKey() { return this.getAttribute('storage-key') || 'nk-theme'; }
  /** The mode: 'auto' | 'light' | 'dark'. Without `auto` the theme, as before. */
  get value() { return this.auto ? this.mode : getCurrentTheme(); }
  set value(v) { this.apply(v); }
  /** The theme on screen – 'light' or 'dark', whatever the mode. */
  get theme() { return this.themeFor(); }
}

customElements.define('nk-theme-toggle', NkThemeToggle);
export { NkThemeToggle };
