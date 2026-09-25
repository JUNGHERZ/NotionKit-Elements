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
export function setStrings(strings, lang = '*') {
  const key = String(lang).toLowerCase().split('-')[0];
  custom[key] = { ...custom[key], ...strings };
  for (const fn of listeners) fn();
}

/** The keys and texts built in for a language ('en' or 'de'), for an app that fills in its own. */
export function builtInStrings(lang = 'en') {
  return { ...(BUILT_IN[String(lang).toLowerCase().split('-')[0]] || BUILT_IN.en) };
}

/** Called after every setStrings(); base.js hands the change on to the elements. */
export function onStringsChange(fn) { listeners.add(fn); }

/** The language of `el`: its nearest lang attribute, across shadow roots, else the page's; the primary subtag. */
export function langOf(el) {
  for (let node = el; node; node = node.getRootNode?.().host) {
    const hit = node.closest?.('[lang]');
    if (hit) return hit.getAttribute('lang').toLowerCase().split('-')[0];
  }
  return (document.documentElement.lang || 'en').toLowerCase().split('-')[0];
}

/** The text `key` for `el`: its language's own set by setStrings(), then the one for every language, the built-in one, English. */
export function str(key, el) {
  const lang = langOf(el);
  return custom[lang]?.[key] ?? custom['*']?.[key] ?? BUILT_IN[lang]?.[key] ?? BUILT_IN.en[key] ?? key;
}
