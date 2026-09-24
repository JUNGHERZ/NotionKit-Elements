// Placement for elements that float over the page – <nk-menu floating>,
// <nk-calendar floating>: the host is a fixed box put under its anchor.

/** The border box of an element, or of the first descendant with one (display: contents hosts). */
export function boxOf(el) {
  if (el.getClientRects().length) return el.getBoundingClientRect();
  for (const child of [...(el.shadowRoot?.children ?? []), ...el.children]) {
    const r = boxOf(child);
    if (r.width || r.height) return r;
  }
  return el.getBoundingClientRect();
}

/** Puts `host` 6px under `anchor`, right edges aligned – left edges with align="start". */
export function placeUnder(host, anchor, align) {
  const r = boxOf(anchor);
  host.style.top = `${r.bottom + 6}px`;
  if (align === 'start') { host.style.left = `${r.left}px`; host.style.right = ''; }
  else { host.style.right = `${Math.max(8, innerWidth - r.right)}px`; host.style.left = ''; }
}
