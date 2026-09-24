// Placement for elements that float over the page – <nk-menu floating>,
// <nk-calendar floating>: the host is a fixed box put under its anchor.

/** The border box of an element, or of the first descendant with one (display: contents hosts). */
function boxOf(el) {
  if (el.getClientRects().length) return el.getBoundingClientRect();
  for (const child of [...(el.shadowRoot?.children ?? []), ...el.children]) {
    const r = boxOf(child);
    if (r.width || r.height) return r;
  }
  return el.getBoundingClientRect();
}

/**
 * Puts `host` 6px below `target` – an element or a rect ({ left, top, right,
 * bottom }, a DOMRect) – centred on it: above with side="top", or where the
 * window ends below; kept 8px inside the window. For <nk-tooltip>.
 */
function placeNear(host, target, side = 'bottom', gap = 6) {
  const r = target instanceof Element ? boxOf(target) : target;
  const { width: w, height: h } = host.getBoundingClientRect();
  const below = r.bottom + gap, above = r.top - gap - h;
  const top = side === 'top' ? (above < 8 ? below : above) : (below + h > innerHeight - 8 ? above : below);
  host.style.top = `${Math.round(top)}px`;
  host.style.left = `${Math.round(Math.min(Math.max(8, (r.left + r.right) / 2 - w / 2), innerWidth - 8 - w))}px`;
  host.style.right = '';
}

/** Puts `host` 6px under `anchor`, right edges aligned – left edges with align="start". */
function placeUnder(host, anchor, align) {
  const r = boxOf(anchor);
  host.style.top = `${r.bottom + 6}px`;
  if (align === 'start') { host.style.left = `${r.left}px`; host.style.right = ''; }
  else { host.style.right = `${Math.max(8, innerWidth - r.right)}px`; host.style.left = ''; }
}

export { placeNear as a, placeUnder as p };
