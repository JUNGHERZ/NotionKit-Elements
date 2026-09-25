<h1 align="center">🧩 NotionKit Elements</h1>

<p align="center">
  <a href="https://www.npmjs.com/package/@jungherz-de/notionkit-elements"><img src="https://img.shields.io/badge/version-1.17.0-2383e2?style=flat-square" alt="Version"></a>
  <a href="#"><img src="https://img.shields.io/badge/vanilla_JS-no_dependencies-448361?style=flat-square" alt="Vanilla JS"></a>
  <a href="#"><img src="https://img.shields.io/badge/elements-88-529cca?style=flat-square" alt="88 Elements"></a>
  <a href="LICENSE"><img src="https://img.shields.io/badge/license-MIT-9065b0?style=flat-square" alt="MIT License"></a>
  <a href="CHANGELOG.md"><img src="https://img.shields.io/badge/changelog-v1.17.0-lightgrey?style=flat-square" alt="Changelog"></a>
  <a href="https://www.npmjs.com/package/@jungherz-de/notionkit-elements"><img src="https://img.shields.io/badge/npm-%40jungherz--de%2Fnotionkit--elements-cb3837?style=flat-square&logo=npm" alt="npm"></a>
</p>

<p align="center">
  <strong>Drop-in Web Components for <a href="https://github.com/JUNGHERZ/NotionKit">NotionKit CSS</a></strong><br>
  88 vanilla JavaScript custom elements wrapping NotionKit's calm, document-centric workspace look.<br>
  Shadow DOM &middot; Native form participation &middot; Pixel parity with the class markup &middot; Zero dependencies.
</p>

<p align="center">
  <a href="https://notionkit-elements.jungherz.com/">🌐 Live Demo</a> &nbsp;&middot;&nbsp;
  <a href="https://notionkit-elements.jungherz.com/docs.html">📖 Documentation</a> &nbsp;&middot;&nbsp;
  <a href="https://notionkit-elements.jungherz.com/showcase.html">🎨 Showcase</a> &nbsp;&middot;&nbsp;
  <a href="https://notionkit.jungherz.com/">📓 NotionKit CSS</a> &nbsp;&middot;&nbsp;
  <a href="https://notionkit-web.jungherz.com/">🚀 NotionKit Web</a> &nbsp;&middot;&nbsp;
  <a href="SKILL.md">🤖 SKILL.md</a>
</p>

---

## ✨ What is NotionKit Elements?

NotionKit Elements is the companion library to [NotionKit CSS](https://github.com/JUNGHERZ/NotionKit). It provides **88 Web Components** – from buttons, form controls and the date picker over the sidebar, page tree and page shell with its properties to the settings modal, the bottom sheet, the side peek, dialogs, tooltips, ⌘K palette, database views – a calendar and a gallery among them – with Notion’s toolbar and AI thread – that encapsulate the class markup of the foundation into simple, declarative custom elements.

It is the **app layer** of the NotionKit family – three layers, one design language: [NotionKit](https://notionkit.jungherz.com) is the pure-CSS foundation, NotionKit Elements wraps it into web components for application UIs, and [NotionKit Web](https://notionkit-web.jungherz.com) is the Astro template for complete websites on top of the same foundation. The word stem stays the same across the layers: `.nk-callout` becomes `<nk-callout>`, a modifier class becomes an attribute, a state class becomes a boolean attribute.

```html
<!-- Before: 6 elements, 6 classes -->
<div class="nk-field">
  <div>
    <div class="f-label">Email notifications</div>
    <div class="f-desc">Shown next to your comments.</div>
  </div>
  <div class="f-control"><button class="nk-switch" role="switch" aria-checked="true"></button></div>
</div>

<!-- After: 2 elements, 0 classes -->
<nk-field label="Email notifications" desc="Shown next to your comments.">
  <nk-switch checked></nk-switch>
</nk-field>
```

---

## 🎯 Why NotionKit Elements?

| Feature | Details |
|---|---|
| 🎯 **Pixel parity** | Every element renders identically to its class markup – verified by a Playwright pixel test in light and dark; the reference app differs by 0.00 % from the class version |
| 🔌 **Shadow DOM** | Each root adopts the NotionKit *components* sheet via `adoptedStyleSheets`; tokens are inherited from the document, so one `:root { --nk-accent: … }` re-brands everything |
| 🧩 **88 Elements** | Forms with copy field, image picker and date picker, content blocks with bookmarks, app shell & tree with the ☰ drawer and the collapsing sidebar, page shell with properties, panels, avatars and steps, overlays (modal, sheet, dialog, resizable side peek, tooltip, ⌘K palette, menus that float in and become sheets on a phone, popover, emoji picker, toast), database table, board, list, calendar & gallery with toolbar and filter pills, comments, AI thread |
| 🎛️ **Form participation** | Input, textarea, select, switch, check, radio, slider, segmented and model card work natively with `<form>` via `ElementInternals`; radios group across shadow roots |
| 🌗 **Theme sync** | One observer mirrors `data-theme` on `<html>` into every element |
| 🪶 **Lightweight** | 286 KB minified / 57 KB gzipped (IIFE, foundation sheet included), no external dependencies |
| 📦 **Five bundle shapes** | IIFE, minified IIFE, ESM, minified ESM with a source map (`esm.min.js`), and per-component ESM entries on a stable `base.js`, which import NotionKit's sheet instead of carrying a copy |
| 🤖 **AI-ready** | `SKILL.md` with copy-paste markup, six app skeletons and the rules – an agent given only that file built a working app in the release test |

---

## Quick start

```html
<!DOCTYPE html>
<html lang="en" data-theme="light">
<head>
  <link rel="stylesheet" href="https://cdn.jsdelivr.net/npm/@jungherz-de/notionkit@1.17.0/notionkit.min.css">
  <script src="https://cdn.jsdelivr.net/npm/@jungherz-de/notionkit-elements@1.17.0/dist/notionkit-elements.min.js"></script>
</head>
<body class="nk-body">
  <nk-field label="Display name" desc="Shown next to your comments">
    <nk-input name="name" value="Ada Lovelace"></nk-input>
  </nk-field>
  <nk-btn variant="primary">Save</nk-btn>
</body>
</html>
```

```bash
npm install @jungherz-de/notionkit-elements @jungherz-de/notionkit
```

```js
import '@jungherz-de/notionkit/notionkit.css';
import '@jungherz-de/notionkit-elements';                              // everything
import '@jungherz-de/notionkit-elements/components/nk-btn.js';         // or one element (shared code: base.js)
import { componentsSheet } from '@jungherz-de/notionkit-elements';     // the sheet the elements adopt, for your own views
```

The per-component files import NotionKit's sheet as `@jungherz-de/notionkit/notionkit-styles.js` rather than carrying a copy, so a project that adopts the sheet in its own views has it once. A bundler resolves it from `node_modules`; a build-free page adds one import-map entry:

```html
<script type="importmap">{ "imports": { "@jungherz-de/notionkit/notionkit-styles.js": "/node_modules/@jungherz-de/notionkit/notionkit-styles.js" } }</script>
```

Without a build step, an import map can point at the minified module instead: `"@jungherz-de/notionkit-elements": "/node_modules/@jungherz-de/notionkit-elements/dist/notionkit-elements.esm.min.js"` – the same exports as `notionkit-elements.esm.js`, its source map beside it.

Do not mix the full bundle with the per-component files: each brings its own `NkElement`. With the bundle, take `componentsSheet` and `NkElement` from the bundle (`NotionKitElements.componentsSheet` from the `<script>` build).

Two prerequisites, always: `notionkit.css` on the document (the peer dependency, `>= 1.17.0`; 1.17.0 brings a step's label and a gallery card as links, 1.16.0 brings `--nk-block-space` and `flush` for blocks in a column, keeps a wide progress bar and a stretched button's label in shape and lays floating menus above dialogs, 1.15.0 brings table text with a tone and a second line, 1.14.0 brings the gallery view and a banner action that stands at the right edge again, 1.13.0 keeps fields inside narrow panels, leaves a page without icon its padding under the cover and makes cover heights tokens, 1.12.0 brings a tag or button beside a panel's title, lists and grids without outer margin, text values, steps with states in any order and in a row, scrolling tabs, a cap for full pages and buttons per table row, 1.11.0 keeps a floating menu inside an open modal or dialog in place and inside the window and brings the banner's action as a button, fields that share a row and tooltips of several lines, 1.10.1 lets a disabled button show its tooltip, 1.10.0 brings the collapsing sidebar, the resizable side peek, the dialog and the tooltip, 1.9.0 the date picker and the calendar view, 1.8.0 the side peek, the bookmark, the copy field and pictures on the profile row, 1.7.0 the sheet, menus that float in and become sheets on a phone, the sidebar drawer, the database toolbar with filter pills and the steps, 1.7.1 minified files that carry all of it, 1.6.0 page properties, page options, list view, panels, prose and the avatar, 1.5.1 the safe areas, 1.5.0 the Notion-2025 tokens, the nine tag colours and the filled inputs; from 1.5.0 on, Elements and the foundation share one version number – the elements are built and tested against the same release) and `class="nk-body"` on `<body>`. The elements ship no visual CSS of their own – every rule comes from the foundation. The bundle injects the design tokens once as `@layer notionkit-defaults`, so any plain `:root { --nk-accent: … }` of yours re-brands every element in both themes.

## Elements

| Group | Elements |
|---|---|
| Forms & controls | `nk-btn` `nk-input` `nk-textarea` `nk-select` `nk-switch` `nk-check` `nk-radio` `nk-slider` `nk-field` `nk-fields` `nk-copy-field` `nk-image-picker` `nk-calendar` |
| Content | `nk-tag` `nk-progress` `nk-callout` `nk-bookmark` `nk-divider` `nk-heading` `nk-toggle` `nk-todo` `nk-kbd` `nk-code` `nk-quote` |
| App shell & navigation | `nk-app` `nk-sidebar` `nk-workspace-switcher` `nk-section-label` `nk-tree` `nk-tree-item` `nk-topbar` `nk-breadcrumb` `nk-theme-toggle` `nk-tab-bar` `nk-tab-bar-item` |
| Page shell & blocks | `nk-page` `nk-page-cover` `nk-page-title` `nk-page-actions` `nk-props` `nk-prop` `nk-panels` `nk-panel` `nk-avatar` `nk-block-host` `nk-banner` `nk-empty` `nk-skeleton` `nk-synced` `nk-tabs` `nk-tab` `nk-segmented` `nk-steps` `nk-stats` `nk-stat` `nk-avatar-group` `nk-mention` `nk-template-btn` `nk-model-card` `nk-profile-row` `nk-danger-zone` `nk-member-list` `nk-member-row` |
| Overlays | `nk-modal` `nk-sheet` `nk-dialog` `nk-peek` `nk-tooltip` `nk-settings-pane` `nk-settings-user` `nk-cmdk` `nk-menu` `nk-menu-item` `nk-pop` `nk-emoji-picker` `nk-toast` |
| Data & collaboration | `nk-database` `nk-table-view` `nk-board-view` `nk-list-view` `nk-calendar-view` `nk-gallery-view` `nk-filter-bar` `nk-comments` `nk-comment` `nk-ai-thread` `nk-ai-msg` `nk-ai-input-row` (+ the exported `renderPropertyCell()`) |

Static content goes in through attributes and slots, dynamic data through properties (`tree.data`, `database.rows`, `palette.commands`). Interactions fire custom events with fixed names: `nk-select`, `nk-change`, `nk-view-change`, `nk-command`, `nk-toggle`, `nk-submit`, `nk-action`. No fetching, no two-way binding – the elements render what they get.

## Languages

The texts the elements bring along – button labels, placeholders and the names a screen reader announces – come in English and German. The language is the element's own: its nearest `lang` attribute, across shadow roots, else `<html lang>`; `de`, `de-DE` or `de-AT` give German, everything else English. An attribute on the element still wins, so a label with a meaning of its own stays (`choose-label="Upload logo"`).

```js
import { setStrings, builtInStrings } from '@jungherz-de/notionkit-elements'; // or from '…/base.js' with single elements
setStrings({ newPage: '＋ New course' });                    // every language
setStrings({ copy: 'Copier', close: 'Fermer' }, 'fr');       // a language of its own
builtInStrings('de');                                        // the keys and the German texts, a copy
```

The elements on the page take new texts at once, after `setStrings()` and when `<html lang>` changes. An element of your own built on `NkElement` reads the same dictionary with `this.str('key')` – your keys too – and applies it again in `onStringsChanged()`. Percentages follow the language as well: a progress value of 45 reads `45%` in English and `45 %` in German, with a no-break space, as `Intl.NumberFormat` writes it (a column's `locale` first). Dates and month names already did.

| Key | Element | Attribute | English | German |
|---|---|---|---|---|
| `copy` | `nk-copy-field` | `copy-label` | Copy | Kopieren |
| `copied` | `nk-copy-field` | `copied-label` | Copied | Kopiert |
| `show` | `nk-copy-field` | `show-label` | Show | Zeigen |
| `hide` | `nk-copy-field` | `hide-label` | Hide | Verbergen |
| `uploadImage` | `nk-image-picker` | `choose-label` | Upload image | Bild hochladen |
| `changeImage` | `nk-image-picker` | `change-label` | Change image | Bild ändern |
| `remove` | `nk-image-picker` | `remove-label` | Remove | Entfernen |
| `close` | `nk-peek` | `close-label` | Close | Schließen |
| `resize` | `nk-peek` | `resize-label` | Resize | Breite ändern |
| `today` | `nk-calendar`, `nk-calendar-view` | `today-label` | Today | Heute |
| `previousMonth` | `nk-calendar`, `nk-calendar-view` | `prev-label` | Previous month | Voriger Monat |
| `nextMonth` | `nk-calendar`, `nk-calendar-view` | `next-label` | Next month | Nächster Monat |
| `clear` | `nk-calendar` | `clear-label` | Clear | Leeren |
| `time` | `nk-calendar` | `time-label` | Time | Uhrzeit |
| `filter` | `nk-filter-bar` | `filter-label` | Filter | Filter |
| `sort` | `nk-filter-bar` | `sort-label` | Sort | Sortieren |
| `addFilter` | `nk-filter-bar` | `add-label` | ＋ Filter | ＋ Filter |
| `removeFilter` | `nk-filter-bar` | `remove-label` | Remove filter | Filter entfernen |
| `search` | `nk-filter-bar` | `placeholder` | Search … | Suchen … |
| `closeSidebar` | `nk-sidebar` | `collapse-label` | Close sidebar | Seitenleiste schließen |
| `newPage` | `nk-table-view`, `nk-list-view`, `nk-gallery-view` | `new-row-label` | ＋ New page | ＋ Neue Seite |
| `commentPlaceholder` | `nk-comments` | `placeholder` | Comment … | Kommentieren … |
| `send` | `nk-comments`, `nk-ai-input-row` | `send-label` (comments) | Send | Senden |
| `askPlaceholder` | `nk-ai-input-row` | `placeholder` | Ask something … | Frag etwas … |
| `commandPlaceholder` | `nk-cmdk` | `placeholder` | Search or type a command … | Suchen oder Befehl eingeben … |
| `emojiPlaceholder` | `nk-emoji-picker` | `placeholder` | Search… | Suchen … |
| `toggleTheme` | `nk-theme-toggle` | `title` | Toggle light / dark | Hell / Dunkel |
| `synced` | `nk-synced` | `badge` | ⟳ synced | ⟳ synchronisiert |
| `message` | `nk-ai-input-row` | – | Message | Nachricht |
| `comment` | `nk-comments` | – | Comment | Kommentar |
| `commandPalette` | `nk-cmdk` | – | Command palette | Befehlspalette |
| `searchEmoji` | `nk-emoji-picker` | – | Search emoji | Emoji suchen |
| `settings` | `nk-modal` | – | Settings | Einstellungen |
| `title` | `nk-page-title` (editable) | – | Title | Titel |
| `changeIcon` | `nk-page` | – | Change icon | Symbol ändern |
| `breadcrumb` | `nk-breadcrumb` | – | Breadcrumb | Pfad |
| `add` | `nk-tree-item` | – | Add | Hinzufügen |
| `more` | `nk-tree-item` | – | More | Mehr |

## Links

A step of `<nk-steps>` with `href` and a card of `<nk-gallery-view>` whose row has an address in the field named by `href-key` are real links: they open in a new tab with a middle click and offer "Copy link" in the context menu. A plain left click, and Enter, fire the cancelable `nk-select` as before; cancel it and the browser stays, for a router of your own. A middle click or one with Cmd, Ctrl, Shift or Alt fires nothing and does what a link does. Steps and rows without an address stay buttons and cards.

## How it works

- Each element's shadow root adopts the NotionKit **components** sheet only; tokens are inherited from the document. A `.nk-wrapper` inside the root mirrors `data-theme` from `<html>` – one observer for all instances.
- Every host is `display: contents`: the inner `.nk-*` element sits in the parent layout exactly where the class markup would. That is what makes the pixel parity hold – and why spacing belongs on a wrapper you own, not on the host.
- Form controls are form-associated custom elements: `FormData`, `reset`, `required` and `<fieldset disabled>` just work. `<nk-radio>`s with the same `name` form a real group across shadow roots, with one tab stop and arrow keys.
- Elements that copy light-DOM children (`nk-select` options, breadcrumb crumbs) watch them; `element.refresh()` is the escape hatch. Listeners are re-armed on every connect, so a moved element keeps working.
- `::slotted()` matches only the assigned node: pass icons directly (`<span slot="icon">📁</span>`), never wrapped. For the same reason there is no `<nk-prose>`: rendered Markdown goes into a light-DOM `<div class="nk-prose">`, which reads the same rules as the editor adapter.
- Overlays (`nk-modal`, `nk-sheet`, `nk-peek`, `nk-cmdk`, `nk-toast`, a floating `nk-menu`) go directly under `<body>`. The modal, the sheet and the palette lock scroll and make the rest of the page `inert` – the side peek only as a sheet on a phone, beside the page it leaves it usable; all of them return focus to the control that had it.
- The editor stays an adapter: `nk-block-host` is the shell, `docs-editor.js` the TipTap recipe (used in the demo app). `<nk-editor>` follows in v1.1 as an optional import, never in the core bundle.

## Development

```bash
npm install
npm run build        # dist/: IIFE, minified IIFE, ESM, per-component ESM on dist/components/base.js
npm run build:all    # + docs.html, showcase.html, index.html, de/, SKILL.md, llms.txt
npm test             # Playwright: pixel parity vs. class markup (both themes), branding, reconnect, radio groups, light-DOM drift, forms, overlays, data views, per-component import
npm run check:coverage && npm run check:versions
```

`tools/catalog.mjs` is the single source for docs, showcase, SKILL.md, llms.txt, the coverage check and the parity test. `dist/` and the generated pages are committed; CI rebuilds them and fails on drift. `dist/` embeds the installed NotionKit version – release order: publish the CSS package first, `npm install` here, rebuild, commit, tag.

## The NotionKit family

| Layer | Repository | Website |
|---|---|---|
| **NotionKit** – CSS foundation | [`JUNGHERZ/NotionKit`](https://github.com/JUNGHERZ/NotionKit) | [notionkit.jungherz.com](https://notionkit.jungherz.com) |
| **NotionKit Elements** – Web Components (this package) | [`JUNGHERZ/NotionKit-Elements`](https://github.com/JUNGHERZ/NotionKit-Elements) | [notionkit-elements.jungherz.com](https://notionkit-elements.jungherz.com) |
| **NotionKit Web** – Astro template for complete websites | [`JUNGHERZ/NotionKit-Web`](https://github.com/JUNGHERZ/NotionKit-Web) | [notionkit-web.jungherz.com](https://notionkit-web.jungherz.com) |

npm: [`@jungherz-de/notionkit`](https://www.npmjs.com/package/@jungherz-de/notionkit) · [`@jungherz-de/notionkit-elements`](https://www.npmjs.com/package/@jungherz-de/notionkit-elements)

MIT · [Jungherz GmbH](https://www.jungherz.com)
