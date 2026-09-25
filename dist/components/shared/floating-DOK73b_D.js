// Placement for elements that float over the page – <nk-menu floating>,
// <nk-calendar floating>, <nk-tooltip>: the host is a fixed box put under
// its anchor. A transformed ancestor – an open nk-modal or nk-dialog –
// becomes the containing block of a fixed box, so the frame it really sits
// in is measured and taken off.

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
 * Where a fixed `host` really sits: the viewport position of its containing
 * block's left, top and right edges – the viewport's own, unless a
 * transformed ancestor takes its place – and the host's size.
 */
function frameOf(host) {
  const s = host.style;
  s.top = '0px'; s.left = '0px'; s.right = 'auto';
  const a = host.getBoundingClientRect();
  s.left = 'auto'; s.right = '0px';
  const b = host.getBoundingClientRect();
  return { x: a.left, y: a.top, right: b.right, width: a.width, height: a.height };
}

/**
 * Puts `host` 6px below `target` – an element or a rect ({ left, top, right,
 * bottom }, a DOMRect) – centred on it: above with side="top", or where the
 * window ends below; kept 8px inside the window. For <nk-tooltip>.
 */
function placeNear(host, target, side = 'bottom', gap = 6) {
  const r = target instanceof Element ? boxOf(target) : target;
  const f = frameOf(host), w = f.width, h = f.height;
  const below = r.bottom + gap, above = r.top - gap - h;
  const top = side === 'top' ? (above < 8 ? below : above) : (below + h > innerHeight - 8 ? above : below);
  const left = Math.min(Math.max(8, (r.left + r.right) / 2 - w / 2), innerWidth - 8 - w);
  host.style.top = `${Math.round(top - f.y)}px`;
  host.style.left = `${Math.round(left - f.x)}px`;
  host.style.right = 'auto';
}

/**
 * Puts `host` 6px under `anchor`, right edges aligned – left edges with
 * align="start". Where the window ends below and there is more room above,
 * it opens upwards; either way --_nk-float-max caps its height to the room
 * there, and a longer menu scrolls.
 */
function placeUnder(host, anchor, align) {
  const r = boxOf(anchor), gap = 6, edge = 8;
  host.style.removeProperty('--_nk-float-max');
  const f = frameOf(host);
  const roomBelow = innerHeight - r.bottom - gap - edge, roomAbove = r.top - gap - edge;
  const up = f.height > roomBelow && roomAbove > roomBelow;
  const room = Math.max(0, Math.floor(up ? roomAbove : roomBelow));
  if (f.height > room) host.style.setProperty('--_nk-float-max', `${room}px`);
  host.style.top = `${(up ? r.top - gap - Math.min(f.height, room) : r.bottom + gap) - f.y}px`;
  if (align === 'start') { host.style.left = `${r.left - f.x}px`; host.style.right = 'auto'; }
  else { host.style.right = `${f.right - Math.min(r.right, innerWidth - edge)}px`; host.style.left = 'auto'; }
}

export { placeNear as a, boxOf as b, placeUnder as p };
