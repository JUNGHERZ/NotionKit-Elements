// Escape closes the layer that opened last (NotionKit Elements 1.19.0). The
// overlays – modal, sheet, dialog, side peek, palette, popover, a floating
// menu or date picker – join this stack while they are open, and one
// listener on the document, in the capture phase, hands Escape to the top
// of it only. Each used to listen for itself: a date picker opened from a
// dialog and the dialog both listened on the document in the same phase,
// where stopPropagation() does not part them, so one Escape closed both.
const stack = [];
let listening = false;

function onKey(e) {
  if (e.key !== 'Escape') return;
  // Escape with the focus in a toast is the toast's, not the dialog's below.
  if (e.composedPath().some(n => n.localName === 'nk-toast')) return;
  for (let i = stack.length - 1; i >= 0; i--) if (!stack[i].el.isConnected) stack.splice(i, 1);
  const top = stack.at(-1);
  if (!top) return;
  e.stopPropagation();
  top.close();
}

/** `el` is open on top of the others; Escape calls `close` until closeLayer(el). */
function openLayer(el, close) {
  closeLayer(el);
  stack.push({ el, close });
  if (!listening && typeof document !== 'undefined') { document.addEventListener('keydown', onKey, true); listening = true; }
}

/** `el` is closed or gone. */
function closeLayer(el) {
  const i = stack.findIndex(layer => layer.el === el);
  if (i >= 0) stack.splice(i, 1);
}

export { closeLayer as c, openLayer as o };
