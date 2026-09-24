// Shared by every element that draws an avatar: nk-avatar itself, member
// rows, comments and the person cells of a database view.
export const AVATAR_COLORS = ['gray', 'brown', 'orange', 'yellow', 'green', 'blue', 'purple', 'pink', 'red'];

/**
 * Paints an .nk-avatar. One of Notion's nine colour names becomes its class,
 * so the tokens decide the shade in each theme; any other value – a hex, a
 * gradient, a var() – is taken as an inline background, as before 1.6.0.
 * Without a colour the avatar keeps the stylesheet's gradient.
 */
export function paintAvatar(el, color) {
  for (const c of AVATAR_COLORS) el.classList.toggle(c, c === color);
  el.style.background = color && !AVATAR_COLORS.includes(color) ? color : '';
}

/** "Sara Lindt" → "SL", "Planer (Dev)" → "PD", "Anna-Lena Groß" → "AG": the first letter or digit of each word; a word without one is skipped. */
export const initialsOf = name => String(name || '').split(/\s+/).map(w => w.match(/[\p{L}\p{N}]/u)?.[0]).filter(Boolean).join('').slice(0, 2).toUpperCase();
