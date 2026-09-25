// Overlay plumbing shared by nk-modal, nk-sheet, nk-cmdk and nk-menu: body
// scroll lock with a refcount, `inert` on everything outside the overlay so
// focus and assistive technology stay inside – nested shadow roots included –
// and the focused element behind shadow hosts, to return focus to.
let locks = 0, previousOverflow = '';

export function lockScroll() {
  if (locks++ === 0) {
    previousOverflow = document.documentElement.style.overflow;
    document.documentElement.style.overflow = 'hidden';
  }
}

export function unlockScroll() {
  if (locks > 0 && --locks === 0) document.documentElement.style.overflow = previousOverflow;
}

// Floating layers under <body> that open from inside an overlay – a menu, a
// date picker – and the tooltip and toast stay usable: made inert, a date
// picker opened from a dialog showed but took no click.
const LAYERS = 'nk-menu[floating], nk-calendar[floating], nk-tooltip, nk-toast';

/** Makes every sibling along `el`'s ancestor chain inert (shadow hosts included), floating layers aside; returns the undo. */
export function inertOutside(el) {
  const made = [];
  let node = el;
  while (node && node !== document.body) {
    const parent = node.parentNode instanceof ShadowRoot ? node.parentNode : node.parentNode;
    if (!parent) break;
    for (const sib of parent.children) {
      if (sib === node || sib.inert || /^(SCRIPT|STYLE|LINK|TEMPLATE)$/.test(sib.tagName) || sib.matches(LAYERS)) continue;
      sib.inert = true;
      made.push(sib);
    }
    node = parent instanceof ShadowRoot ? parent.host : parent;
  }
  return () => { for (const c of made) c.inert = false; };
}

/** The focused element itself, looking into shadow roots (document.activeElement stops at the host). */
export function deepActiveElement() {
  let el = document.activeElement;
  while (el?.shadowRoot?.activeElement) el = el.shadowRoot.activeElement;
  return el;
}

/** Whether `node` lies inside `root`, across shadow roots – Node.contains() stops at them. */
export function containsDeep(root, node) {
  for (let n = node; n; n = n.parentNode ?? n.host) if (n === root) return true;
  return false;
}

/** The first tabbable element inside a light-DOM subtree, looking into shadow roots. */
export function firstFocusable(root) {
  const SEL = 'a[href], button:not([disabled]), input:not([disabled]):not([type=hidden]), select:not([disabled]), textarea:not([disabled]), [tabindex]:not([tabindex="-1"]), [contenteditable="true"], [contenteditable="plaintext-only"]';
  const walk = (node) => {
    for (const el of node.querySelectorAll('*')) {
      if (el.matches(SEL) && el.getClientRects().length) return el;
      if (el.shadowRoot) { const inner = walk(el.shadowRoot); if (inner) return inner; }
    }
    return null;
  };
  return walk(root);
}
