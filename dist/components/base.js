import { tokensCss, componentsSheet } from '@jungherz-de/notionkit/notionkit-styles.js';

// The texts the elements show and announce by themselves – button labels,
// placeholders, accessible names – in English and German (NotionKit
// Elements 1.17.0). The language is the element's own: the nearest `lang`
// attribute, across shadow roots, else <html lang>; German for "de…",
// English for anything else. setStrings() adds or replaces texts, for one
// language or for all of them, and an attribute on the element wins over
// every one of these.
const BUILT_IN = {
  en: {
    copy: 'Copy', copied: 'Copied', show: 'Show', hide: 'Hide',
    uploadImage: 'Upload image', changeImage: 'Change image', remove: 'Remove',
    close: 'Close', resize: 'Resize',
    today: 'Today', previousMonth: 'Previous month', nextMonth: 'Next month', clear: 'Clear', time: 'Time',
    filter: 'Filter', sort: 'Sort', addFilter: '＋ Filter', removeFilter: 'Remove filter', search: 'Search …',
    closeSidebar: 'Close sidebar', newPage: '＋ New page',
    commentPlaceholder: 'Comment …', send: 'Send', askPlaceholder: 'Ask something …',
    commandPlaceholder: 'Search or type a command …', emojiPlaceholder: 'Search…',
    toggleTheme: 'Toggle light / dark', synced: '⟳ synced',
    message: 'Message', breadcrumb: 'Breadcrumb', commandPalette: 'Command palette', comment: 'Comment',
    searchEmoji: 'Search emoji', settings: 'Settings', title: 'Title', changeIcon: 'Change icon',
    add: 'Add', more: 'More',
  },
  de: {
    copy: 'Kopieren', copied: 'Kopiert', show: 'Zeigen', hide: 'Verbergen',
    uploadImage: 'Bild hochladen', changeImage: 'Bild ändern', remove: 'Entfernen',
    close: 'Schließen', resize: 'Breite ändern',
    today: 'Heute', previousMonth: 'Voriger Monat', nextMonth: 'Nächster Monat', clear: 'Leeren', time: 'Uhrzeit',
    filter: 'Filter', sort: 'Sortieren', addFilter: '＋ Filter', removeFilter: 'Filter entfernen', search: 'Suchen …',
    closeSidebar: 'Seitenleiste schließen', newPage: '＋ Neue Seite',
    commentPlaceholder: 'Kommentieren …', send: 'Senden', askPlaceholder: 'Frag etwas …',
    commandPlaceholder: 'Suchen oder Befehl eingeben …', emojiPlaceholder: 'Suchen …',
    toggleTheme: 'Hell / Dunkel', synced: '⟳ synchronisiert',
    message: 'Nachricht', breadcrumb: 'Pfad', commandPalette: 'Befehlspalette', comment: 'Kommentar',
    searchEmoji: 'Emoji suchen', settings: 'Einstellungen', title: 'Titel', changeIcon: 'Symbol ändern',
    add: 'Hinzufügen', more: 'Mehr',
  },
};
const custom = {};
const listeners = new Set();

/**
 * Adds or replaces texts: setStrings({ copy: 'Copy link' }) for every
 * language, setStrings({ copy: 'Copier' }, 'fr') for one – a language of its
 * own too. The elements on the page take them at once.
 */
function setStrings(strings, lang = '*') {
  const key = String(lang).toLowerCase().split('-')[0];
  custom[key] = { ...custom[key], ...strings };
  for (const fn of listeners) fn();
}

/** The keys and texts built in for a language ('en' or 'de'), for an app that fills in its own. */
function builtInStrings(lang = 'en') {
  return { ...(BUILT_IN[String(lang).toLowerCase().split('-')[0]] || BUILT_IN.en) };
}

/** Called after every setStrings(); base.js hands the change on to the elements. */
function onStringsChange(fn) { listeners.add(fn); }

/** The language of `el`: its nearest lang attribute, across shadow roots, else the page's; the primary subtag. */
function langOf(el) {
  for (let node = el; node; node = node.getRootNode?.().host) {
    const hit = node.closest?.('[lang]');
    if (hit) return hit.getAttribute('lang').toLowerCase().split('-')[0];
  }
  return (document.documentElement.lang || 'en').toLowerCase().split('-')[0];
}

/** The text `key` for `el`: its language's own set by setStrings(), then the one for every language, the built-in one, English. */
function str(key, el) {
  const lang = langOf(el);
  return custom[lang]?.[key] ?? custom['*']?.[key] ?? BUILT_IN[lang]?.[key] ?? BUILT_IN.en[key] ?? key;
}

// ============================================================
// NotionKit Elements – base classes
//
// Every <nk-*> element is a thin shell around the markup notionkit.css already
// styles. The shadow root adopts the *components* half of that stylesheet and
// nothing else; the element ships no visual CSS of its own.
// ============================================================

// ── Design tokens ──
// The shadow roots deliberately adopt componentsSheet only. The full sheet
// would bring the :root / [data-theme] token blocks along, and those match the
// .nk-wrapper below — every --nk-* token would then be re-declared inside each
// shadow root, where a matching rule always beats an inherited value. A page's
// own `:root { --nk-accent: … }` would never arrive.
//
// So the token defaults go on the document once, and every shadow root
// inherits them like any other custom property. They sit in a cascade layer so
// an ordinary (unlayered) brand stylesheet — and notionkit.css itself, if the
// page loads it — wins over them, no matter the load order.

const TOKENS_INJECTED = '__nkDefaultTokensInjected';

function injectDefaultTokens() {
  if (typeof document === 'undefined') return;              // SSR / non-DOM
  if (globalThis[TOKENS_INJECTED]) return;                   // another bundle copy did it
  globalThis[TOKENS_INJECTED] = true;

  const sheet = new CSSStyleSheet();
  sheet.replaceSync(`@layer notionkit-defaults { ${tokensCss} }`);
  // Append — never assign — so an app's own adopted sheets survive.
  document.adoptedStyleSheets = [...document.adoptedStyleSheets, sheet];
}

injectDefaultTokens();

// ── Global theme sync ──
// data-theme on <html> is the only source of truth. One MutationObserver
// mirrors it onto every registered instance; no element sets a theme itself.

const instances = new Set();

function getCurrentTheme() {
  return document.documentElement.getAttribute('data-theme') || 'light';
}

function syncAllThemes() {
  const theme = getCurrentTheme();
  for (const instance of instances) instance._syncTheme(theme);
}

// The built-in texts follow the language (1.17.0): setStrings() and a new
// lang on <html> reach the elements already on the page, too.
function syncAllStrings() {
  for (const instance of instances) instance.onStringsChanged();
}
onStringsChange(syncAllStrings);

if (typeof window !== 'undefined' && typeof MutationObserver !== 'undefined') {
  new MutationObserver(records => {
    if (records.some(r => r.attributeName === 'data-theme')) syncAllThemes();
    if (records.some(r => r.attributeName === 'lang')) syncAllStrings();
  }).observe(document.documentElement, {
    attributes: true,
    attributeFilter: ['data-theme', 'lang']
  });
}

// ── Host stylesheets ──
// Layout plumbing only: how the host box participates in the outer layout, and
// that `hidden` keeps working. :host([hidden]) has a higher specificity than
// :host, so it wins regardless of order. The wrapper is layout-transparent.
// `flush` on any element drops the outer margin of its box (NotionKit
// 1.16.0) – for a block in a flex column with a gap of its own; a whole
// column does it for every block with --nk-block-space: 0.

const hostSheets = new Map();

function hostSheetFor(display) {
  let sheet = hostSheets.get(display);
  if (!sheet) {
    sheet = new CSSStyleSheet();
    sheet.replaceSync(`
      :host { display: ${display}; }
      :host([hidden]) { display: none; }
      :host([flush]) .nk-wrapper > * { margin-top: 0; margin-bottom: 0; }
      .nk-wrapper { display: contents; }
    `);
    hostSheets.set(display, sheet);
  }
  return sheet;
}

// ── Base class ──

class NkElement extends HTMLElement {

  /**
   * How the host takes part in the outer layout. Default 'contents': the host
   * generates no box, so the inner .nk-* element sits in the parent's layout
   * exactly where the class markup would – a button stays inline, a sidebar
   * is a direct flex child of the app, a tree row and its children box are
   * siblings. That is what makes the pixel parity with the class markup hold.
   * Consequence: style the parent or the tokens, not the host; `hidden` on
   * the host still works. Override with 'block' / 'inline-block' only when a
   * host box is genuinely needed.
   */
  static get display() { return 'contents'; }

  /**
   * Optional CSSStyleSheet with component-specific host rules, adopted after
   * the shared sheets. Positioning and sizing of the host only — never colour,
   * spacing or typography; those belong to notionkit.css.
   */
  static get hostStyles() { return null; }

  /**
   * Opt in when the component *copies* light-DOM children into its shadow tree
   * (options, breadcrumb crumbs). A MutationObserver then calls
   * projectLightDom() again whenever those children change, so a framework
   * that swaps them keeps the rendered element in step. Components that merely
   * *slot* their children use `slotchange` instead.
   */
  static get observesLightDom() { return false; }

  /** What the light-DOM observer watches. Drop `subtree` for shallow copies. */
  static get lightDomObserverInit() {
    return { childList: true, subtree: true, characterData: true, attributes: true };
  }

  /**
   * 'named' (default) or 'manual'. Manual assignment lets a component route
   * light-DOM nodes itself – text nodes into a label slot, nested elements
   * into a children slot – so <nk-tree-item icon="🏠">Home</nk-tree-item>
   * reads naturally. With 'manual' the component calls assignSlots() on
   * every childList change.
   */
  static get slotAssignment() { return 'named'; }

  static get observedAttributes() { return []; }

  constructor() {
    super();
    this._initialized = false;
    this._shadow = this.attachShadow({ mode: 'open', slotAssignment: this.constructor.slotAssignment });
    const sheets = [componentsSheet, hostSheetFor(this.constructor.display)];
    const extra = this.constructor.hostStyles;
    if (extra) sheets.push(extra);
    this._shadow.adoptedStyleSheets = sheets;
  }

  connectedCallback() {
    if (!this._initialized) {
      // A framework may have set properties on the instance before the
      // definition arrived (hybrids binds checked="${bool}" as a property
      // while the element is still a plain HTMLElement). Such an own property
      // shadows the accessor on the prototype for good; re-apply it through
      // the setter so the attribute – and with it render() – sees the value.
      this._upgradeOwnProperties();
      this._initialized = true;

      // The wrapper mirrors data-theme from <html> so [data-theme]-keyed
      // component rules apply inside the root. Token *values* need no
      // mirroring — they inherit.
      this._wrapper = document.createElement('div');
      this._wrapper.className = 'nk-wrapper';
      this._wrapper.setAttribute('data-theme', getCurrentTheme());
      this._shadow.appendChild(this._wrapper);

      this.render();
    } else {
      this._wrapper.setAttribute('data-theme', getCurrentTheme());
    }

    // Everything below runs on every connect, not just the first. Moving an
    // element in the DOM disconnects and reconnects it, and disconnectedCallback
    // tears all of this down — without re-arming it here a moved element would
    // keep its markup but silently stop reacting.
    this.setupEvents();
    instances.add(this);

    if (this.constructor.observesLightDom) {
      this._lightDomObserver ??= new MutationObserver(records => this.projectLightDom(records));
      this._lightDomObserver.observe(this, this.constructor.lightDomObserverInit);
    }
    if (this.constructor.slotAssignment === 'manual') {
      this.assignSlots();
      this._slotObserver ??= new MutationObserver(() => this.assignSlots());
      this._slotObserver.observe(this, { childList: true });
    }
  }

  disconnectedCallback() {
    instances.delete(this);
    this._lightDomObserver?.disconnect();
    this._slotObserver?.disconnect();
    this.teardownEvents();
  }

  attributeChangedCallback(name, oldValue, newValue) {
    if (!this._initialized) return;
    if (oldValue === newValue) return;
    this.onAttributeChanged(name, oldValue, newValue);
  }

  _syncTheme(theme) {
    this._wrapper?.setAttribute('data-theme', theme);
  }

  /**
   * The text `key` in this element's language – its nearest lang attribute,
   * across shadow roots, else the page's: the one setStrings() gave, else the
   * built-in English or German one (1.17.0). A project's own element reads
   * its texts here too, after setStrings({ myKey: '…' }).
   */
  str(key) { return str(key, this); }

  /**
   * The texts may have changed: setStrings() ran or <html lang> changed.
   * Components with built-in texts apply them again here; an attribute on
   * the element still wins.
   */
  onStringsChanged() {}

  _upgradeOwnProperties() {
    for (const key of Object.keys(this)) {
      if (key.startsWith('_')) continue;
      let proto = Object.getPrototypeOf(this), desc;
      while (proto && proto !== HTMLElement.prototype && !(desc = Object.getOwnPropertyDescriptor(proto, key))) proto = Object.getPrototypeOf(proto);
      if (!desc?.set) continue;
      const value = this[key];
      delete this[key];
      this[key] = value;
    }
  }

  /** Subclasses override to build the inner DOM inside this._wrapper. Runs once. */
  render() {}

  /** Subclasses override to attach event listeners. Runs on every connect. */
  setupEvents() {}

  /** Subclasses override to remove event listeners. Runs on every disconnect. */
  teardownEvents() {}

  /** Subclasses override to react to attribute changes after render(). */
  onAttributeChanged(name, oldValue, newValue) {}

  /**
   * Subclasses that set observesLightDom override this to (re-)copy their
   * light-DOM children into the shadow tree. Runs on every change to those
   * children, so it has to be safe to call repeatedly.
   */
  projectLightDom() {}

  /** Components with manual slot assignment override this. */
  assignSlots() {}

  /**
   * Escape hatch: re-copy the light-DOM children now. The observer covers the
   * ordinary cases; this is for the ones it cannot see, so nobody has to reach
   * into element.shadowRoot.
   */
  refresh() { this.projectLightDom(); if (this.constructor.slotAssignment === 'manual') this.assignSlots(); }

  // ── Utilities ──

  /**
   * For elements whose heading arrives as `title` – nk-settings-pane,
   * nk-danger-zone, nk-empty, nk-model-card. `title` is also the global HTML
   * attribute, and a title on the host shows as a browser tooltip over the
   * whole element. So the value is read into this._titleText and the
   * attribute is taken off the host; a later setAttribute('title') arrives
   * through attributeChangedCallback and is taken the same way. The removal
   * fires the callback with null, which is ignored – only '' clears the
   * heading. The element's own `title` accessor answers from the stored
   * value, so a framework that binds `title` as a property never puts an
   * attribute on the host at all. Returns whether a value was taken.
   */
  takeTitle(value = this.getAttribute('title')) {
    if (value === null) return false;
    this._titleText = value;
    this.removeAttribute('title');
    return true;
  }

  getBoolAttr(name) {
    return this.hasAttribute(name);
  }

  setBoolAttr(name, value) {
    if (value) this.setAttribute(name, '');
    else this.removeAttribute(name);
  }

  createElement(tag, classes = [], attrs = {}) {
    const el = document.createElement(tag);
    if (classes.length) el.classList.add(...classes);
    for (const [key, val] of Object.entries(attrs)) {
      if (val !== null && val !== undefined && val !== false) el.setAttribute(key, val === true ? '' : val);
    }
    return el;
  }

  /** Dispatches a composed, bubbling CustomEvent — the nk-* event contract. */
  emit(eventName, detail = null) {
    return this.dispatchEvent(new CustomEvent(eventName, {
      bubbles: true,
      composed: true,
      cancelable: true,
      detail
    }));
  }
}

// ── Form-associated base class ──
// ElementInternals gives the element a place in the surrounding <form>:
// FormData, reset, validation and :disabled through <fieldset>.

class NkFormElement extends NkElement {

  static formAssociated = true;

  constructor() {
    super();
    this._internals = this.attachInternals();
  }

  get form() { return this._internals.form; }
  get validationMessage() { return this._internals.validationMessage; }
  get validity() { return this._internals.validity; }
  get willValidate() { return this._internals.willValidate; }

  checkValidity() { return this._internals.checkValidity(); }
  reportValidity() { return this._internals.reportValidity(); }

  connectedCallback() {
    const first = !this._initialized;
    super.connectedCallback();
    // A `disabled` attribute in the markup fires formDisabledCallback on
    // parse or upgrade – before the first connect, when nothing is rendered
    // yet. The state was remembered below; apply it now that render() ran.
    if (first && this._formDisabled) this.onFormDisabled(true);
  }

  formResetCallback() { this.resetValue(); }
  formStateRestoreCallback(state, mode) { this.restoreValue(state, mode); }
  formDisabledCallback(disabled) {
    this._formDisabled = disabled;
    if (this._initialized) this.onFormDisabled(disabled);
  }

  /** Subclasses override. */
  resetValue() {}
  restoreValue(state, mode) {}
  onFormDisabled(disabled) {}

  setFormValue(value, state) {
    this._internals.setFormValue(value, state);
  }

  setValidity(flags, message, anchor) {
    this._internals.setValidity(flags, message, anchor);
  }

  /** Mirrors the native control's validity onto the host, so required works. */
  syncValidityFrom(control) {
    if (!control) return;
    if (control.validity.valid) this._internals.setValidity({});
    else this._internals.setValidity(control.validity, control.validationMessage, control);
  }
}

export { NkElement, NkFormElement, builtInStrings, getCurrentTheme, setStrings };
