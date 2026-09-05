// ============================================================
// NotionKit Elements – base classes
//
// Every <nk-*> element is a thin shell around the markup notionkit.css already
// styles. The shadow root adopts the *components* half of that stylesheet and
// nothing else; the element ships no visual CSS of its own.
// ============================================================
import { componentsSheet, tokensCss } from '@jungherz-de/notionkit/notionkit-styles.js';

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

if (typeof window !== 'undefined' && typeof MutationObserver !== 'undefined') {
  new MutationObserver(syncAllThemes).observe(document.documentElement, {
    attributes: true,
    attributeFilter: ['data-theme']
  });
}

// ── Host stylesheets ──
// Layout plumbing only: how the host box participates in the outer layout, and
// that `hidden` keeps working. :host([hidden]) has a higher specificity than
// :host, so it wins regardless of order. The wrapper is layout-transparent.

const hostSheets = new Map();

function hostSheetFor(display) {
  let sheet = hostSheets.get(display);
  if (!sheet) {
    sheet = new CSSStyleSheet();
    sheet.replaceSync(`
      :host { display: ${display}; }
      :host([hidden]) { display: none; }
      .nk-wrapper { display: contents; }
    `);
    hostSheets.set(display, sheet);
  }
  return sheet;
}

// ── Base class ──

export class NkElement extends HTMLElement {

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

export class NkFormElement extends NkElement {

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

  formResetCallback() { this.resetValue(); }
  formStateRestoreCallback(state, mode) { this.restoreValue(state, mode); }
  formDisabledCallback(disabled) { this.onFormDisabled(disabled); }

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

export { getCurrentTheme };
