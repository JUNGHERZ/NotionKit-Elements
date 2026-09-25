# Changelog

All notable changes to NotionKit Elements are documented here. The format follows
[Keep a Changelog](https://keepachangelog.com/en/1.1.0/); versions follow
[Semantic Versioning](https://semver.org/).

## [1.18.0] – 2026-09-25

Built against NotionKit CSS 1.18.0 (peer `>= 1.18.0`). What LearnHub and Auxdesk found after their move to 1.17.0: LearnHub's finding 17 and Auxdesk's 26, 27 and 28.

### Added
- **`<nk-copy-field>` shows icons on a phone.** Each button carries an icon beside its word; below 860px, and with the new `icons` attribute at every width, the icon stands in for the word – two overlapping squares for Copy, an eye and an eye struck through for Show and Hide, a green check for the moment after – and a masked key keeps a dozen characters more (Auxdesk's wish 27). The word stays the button's `aria-label`, from the dictionary or `copy-label` and the other attributes, and while the icons show, its tooltip for `<nk-tooltip>`.

### Changed
- **`<nk-tab-bar>` marks "More" for a page without a tab of its own.** A `value` no item has – a mailbox, the settings, an account page opened from the drawer – makes the `drawer` item active, as iOS marks "More"; a bar without a drawer item marks none. Before, the bar kept the tab the user came from (Auxdesk's finding 28). `nk-change` reports such a value too; without a value the item marked `active`, else the first, is the one, as before.

### Fixed
- **`<nk-progress wide label>` in a panel keeps its label beside the bar.** The host is `display: contents`, so bar and label were two flex items of the panel and stood one under the other. With a label the element sets both in one `.nk-progress-row` (NotionKit 1.18.0): beside each other, the label on the bar's middle, the bar filling the rest (LearnHub's finding 17). In a property value the label now stands 7px from the bar, as in a table cell, instead of 13px.
- **`<nk-prop>` on a phone keeps a long copy field inside its card** – NotionKit 1.18.0's fix for Auxdesk's finding 26 reaches the element's shadow root.

## [1.17.0] – 2026-09-25

Built against NotionKit CSS 1.17.0 (peer `>= 1.17.0`). The rest of LearnHub's consolidated list: German texts in the elements (finding 9) and steps and gallery cards as links (6 and 16), under one link contract. Additive – with `lang="en"` every text stays as it was.

### Added
- **The elements speak English and German.** Button labels, placeholders and the names a screen reader announces – 38 texts, from Copy, Today and ＋ New page to the names of the palette and the modal – come from a dictionary after the element's language: its nearest `lang` attribute, across shadow roots, else `<html lang>`. `de`, `de-DE` or `de-AT` give German, everything else English. An attribute on the element still wins, so a label with a meaning of its own stays. The fixed accessible names – Message, Send, Breadcrumb, Command palette, Comment, Search emoji, Settings, Title, Change icon – come from the same dictionary; before, they could not be changed at all. README lists every key with its attribute, English and German.
- **`setStrings(strings, lang?)` and `builtInStrings(lang)`**, from the bundle and from `base.js`: add or replace texts for every language or for one – a language of its own too. The elements on the page take them at once, and again when `<html lang>` changes.
- **`this.str(key)` and `onStringsChanged()` on `NkElement`**: a project's own element reads the dictionary in its language, its own keys too, and applies new texts when they change.
- **Percentages as `Intl` writes them.** A progress cell, a board card and a gallery card write 45 as `45%` in English and `45 %` in German, with a no-break space – the column's `locale` first, else the page's language. `formatPercent(column, value)` is exported beside `formatDate()`.
- **`<nk-steps>`: a step with `href` is a link.** Its label becomes `<a class="st-label" href>`, with or without `selectable`, and opens in a new tab with a middle click or offers "Copy link" – for chapters whose addresses are shared. Steps without `href` stay buttons.
- **`<nk-gallery-view href-key>`: cards as links.** `href-key` names the row field with a card's address – a string or `{ href }`. Such a card is `<a class="nk-card" href>` in a `.card-item` that carries `role="listitem"`; rows without an address and galleries without `href-key` stay as they were.
- **The link contract, for both:** a plain left click and Enter fire the cancelable `nk-select` as before – `{ index, value, step }` and `{ row, id, value }`; cancel it and the browser stays, for a router of your own, otherwise it follows the link (and a step becomes current). A middle click or one with Cmd, Ctrl, Shift or Alt fires nothing and does what a link does; Space on a link card scrolls, like on any link. The mark beside a step's link counts as the link.

### Changed
- **The German demo sets no text attributes any more.** `de/app.html` takes Kopieren, Heute, Seitenleiste schließen and the others from `<html lang="de">`; `app.html` dropped the English ones it only carried to be translated. The docs have a Languages section, show the defaults of text attributes in both languages and write percentages and the new-row text in the page's language.

## [1.16.0] – 2026-09-25

Built against NotionKit CSS 1.16.0 (peer `>= 1.16.0`). LearnHub checked all its open findings against 1.14.0; this release takes the fixes and small additions from that list – 3, 4, 5, 10, 11 and 15 – together with Auxdesk's finding 25. Links for steps and gallery cards and German texts follow in 1.17.0.

### Fixed
- **`<nk-panel icon>` without `cover` keeps its icon inside the tile.** The band sat in the shadow root even without `cover`, only hidden, and `.nk-cover + .nk-page-icon` still pulled the icon 24px up, 9px over the tile's edge. The band is in the tree only with `cover` now, and follows the attribute both ways.
- **`<nk-select>` waits for the option of a value from the attribute, too.** `<nk-select value="b">` with a static first option and `b` loaded later showed the first option: the browser's preselection survived as the live selection. A value – attribute or property – whose option is missing now waits and wins once it arrives, unless someone has chosen another option in the meantime, and settling on it fires no `nk-change`. While it waits, `value` reports it; the visible selection and the form value stay as they are.
- **`<nk-progress wide>` in a panel is a 6px bar** instead of 60px and more (NotionKit 1.16.0).
- **A floating date picker or menu under `<body>` works from an open dialog.** An open `<nk-dialog>`, `<nk-modal>`, `<nk-sheet>`, the palette or – on a phone – `<nk-peek>` made every sibling inert, the floating layers under `<body>` among them, and they lay under it besides: a date picker opened from a field in a dialog showed but took no click. Floating menus and date pickers, the tooltip and the toast stay out of the inert page now, and NotionKit 1.16.0 lays them above the dialog.
- **`<nk-btn>` stretched across a column keeps its label centred** (NotionKit 1.16.0) – Auxdesk's sign-in page.

### Added
- **`flush` on every element** drops the outer margin of its box, for a block in a flex column with a gap of its own; `--nk-block-space: 0` on the column does it for every block inside (NotionKit 1.16.0). Before, only `<nk-props>` and `<nk-panels>` had `flush`, and the margins of the others sat out of reach in their shadow roots.
- **A minified ES module: `dist/notionkit-elements.esm.min.js`**, with its source map, the same exports as `notionkit-elements.esm.js` – for an import map without a build step, where the minified bundle was an IIFE only. `@jungherz-de/notionkit-elements/esm.min.js` resolves to it.

### Changed
- Peer `@jungherz-de/notionkit >= 1.16.0`.

## [1.15.0] – 2026-09-25

Built against NotionKit CSS 1.15.0 (peer `>= 1.15.0`). Auxdesk's findings 22 and 23 from its jobs, messages and tickets in `<nk-table-view>`.

### Fixed
- **`sortable` sorts by the value, not by the text shown.** Every column but number, progress and checkbox compared its text: dates as text, so 13.09.2026 came before 24.08.2026, and a select by its key – `failed`, `ignored`, `posted` – instead of the order of its options. Dates now sort by their time (D.M.YYYY, ISO dates and date-times, ranges by their start), selects by their options as Notion does, and empty cells come last in both directions. `compareBy()` does the same for tables of one's own.

### Added
- **A value to sort by.** `sortKey` on a column sorts by another field of the row – a “Time” column that shows “4 min ago” sorts by the ISO time next to it – and a `sort` in a cell's object sorts that cell by its own value.
- **Date formats.** A `date` column with `format` – `'short'` (day and month, the year when it is not this one), `'relative'` (minutes or hours ago or ahead within a day, else the short date) or the options of Intl.DateTimeFormat – shows ISO dates and date-times formatted in its `locale`, and sorts by their time. Without `format` a date stands as given, as before. Board, list and gallery show the same format; a range reads start → end.
- **Text cells with a tone, a second line and a tooltip.** A text value may be `{ text, desc, color, tooltip }`: `color` one of Notion's nine text colours – orange for an error –, `desc` a quiet second line under it – the next run under an error, the sender under a subject –, `tooltip` the whole text, which `<nk-tooltip>` shows. A title cell takes `desc` and `tooltip` too. The other views and the filter bar's search read the text of such an object.
- Exported next to `renderPropertyCell()`: `formatDate()`, `timeOf()` and `textOf()`.

### Changed
- The docs example of `<nk-table-view>` shows a quiet line under the first title.
- Peer `@jungherz-de/notionkit >= 1.15.0`.

## [1.14.0] – 2026-09-25

Built against NotionKit CSS 1.14.0 (peer `>= 1.14.0`). The gallery view – 88 elements now – for LearnHub's course catalog.

### Added
- **`<nk-gallery-view>`**, the fifth view of `<nk-database>`: the rows as cards with a picture on top, in a grid that fills the row – Notion's gallery. `cover-key` names the row field with the picture's URL (default: `cover`); a row without one shows the cover gradient, and `no-cover` leaves the pictures out. The picture stands in 2:1, cropped to fill; `fit` shows it whole, for logos. `size` small, medium or large sets the card size – columns from 180, 260 or 340px, one card per row on a phone. Cards show the title and the `meta-keys` (default: the select and date columns); a click, Enter or Space fires `nk-select { row, id, value }` like a row of the table, and `new-row` adds a dashed card that fires `nk-action { action: 'new-row' }`. Standalone it takes `columns` and `rows`, inside `<nk-database>` the database pushes the data.
- Demo: the project database has a Gallery tab, each project with one of the four covers; `#gallery` opens it, a card opens in the side peek, and the app still matches the class demo at 0.00 %.

### Fixed
- **A `<button slot="action">` of `<nk-banner>` stands at the banner's right edge again** (NotionKit 1.14.0). On a page with `class="nk-body"`, NotionKit's scoped button reset won over the `::slotted()` margin – the outer tree wins – so after a short text the action sat right behind it. Since 1.11.0 the docs write the action as a button; a span was never affected. A test now checks it on an `nk-body` page.

### Changed
- Peer `@jungherz-de/notionkit >= 1.14.0`.

## [1.13.0] – 2026-09-25

Built against NotionKit CSS 1.13.0 (peer `>= 1.13.0`). LearnHub moved from 1.5.1 to 1.11 and sent back three findings about fixed sizes; this release answers them.

### Fixed
- **`<nk-page>` with a cover but no icon keeps its top padding.** It set `covered` for every cover, so the page dropped its padding for an icon that was not there, and the title – or tags and a deadline – sat right on the picture. `covered` now needs an icon too, from the attribute or from `slot="icon"`, and follows an icon that arrives later.
- **`<nk-input>`, `<nk-select>`, `<nk-textarea>` and `<nk-copy-field>` stay inside a narrow `<nk-panel>`** (NotionKit 1.13.0). The 210px floor ran past a 200px tile; inside a panel it gives way now, while a field row keeps it. The fix reaches the shadow roots through a custom property, so `wide` and `<nk-field stacked>` are no longer needed for it.

### Added
- **Cover heights you can set**: `--nk-cover-height` (200px) for `<nk-page-cover>` and the page's own cover, `--nk-panel-cover-height` (64px) for `<nk-panel cover>` – on `:root`, or on one element: `<nk-page-cover style="--nk-cover-height: clamp(200px, 30vh, 300px)">`. Until now the band's height sat in the shadow root, out of reach.

### Changed
- Peer `@jungherz-de/notionkit >= 1.13.0`.

## [1.12.0] – 2026-09-25

Built against NotionKit CSS 1.12.0 (peer `>= 1.12.0`). Auxdesk moved from 1.5.1 to 1.11 and sent back eight findings; this release answers all of them.

### Added
- **`<nk-panel>` `slot="end"`** sits at the right edge of the title – a state as a tag, a button – as Notion's settings boxes show a connection, and moves under the title where both do not fit. Until now nothing could stand beside the title, and an `<h3>` of one's own lost the panel's type as soon as it shared a row with a tag.
- **`flush` on `<nk-props>` and `<nk-panels>`** drops the outer margin meant for the flow under a title – for a list inside a panel, a grid inside a flex column with a gap of its own. The margin sat in the shadow root, out of reach from outside.
- **`<nk-prop text>`**: a value that is text – a sentence, an address, a model name with a tag – flows and wraps as text instead of setting its parts one under the other.
- **`<nk-steps>` with a state per step, `selectable` and `horizontal`.** A step object takes `state: 'done' | 'skipped' | 'open'`, which wins over `current`, so a wizard can show a skipped step before a done one; a skipped step shows a dashed ring around a dash. `selectable` makes each label a button: a click or Enter fires `nk-select { index, value, step }` – `index` counts from 1, like `current` – and, unless cancelled, makes that step current; `select(index)` does the same from a script. `horizontal` sets the steps in one row above a wizard.
- **`<nk-tabs scroll>`** keeps many tabs in one row that scrolls sideways and holds the active tab in view – after the first layout, on every change and when the row's width changes – as `<nk-segmented scroll>` does. Ten tabs in a mailbox editor no longer run out of a phone's page.
- **An `actions` column in `<nk-table-view>`.** `{ type: 'actions', actions: [{ action, label, icon, danger, disabled, tooltip }] }` sets small buttons in each row; a row's value – a list of action names – picks which of them it shows. A click fires `nk-action { action, row, id, anchor }` instead of selecting the row, and the column's header sorts nothing. `renderPropertyCell()` draws it for tables of one's own too.
- **A `url` value may be `{ href, label, target }`**: a link of one's own – to another page of the app, with its own text, in the same tab unless `target` says otherwise. A string is still an address outside, opened in a new tab.

### Changed
- **A property value keeps at least 220px** (NotionKit 1.12.0): in a column narrower than 380px – the details beside a message, a third of the page – it moves under its name instead of shrinking until an address breaks into syllables.
- The docs example of `<nk-table-view>` shows the actions column, `<nk-steps>` a wizard row with a skipped step, `<nk-panel>` a tag beside the title and `<nk-prop>` a text value.
- `--nk-page-full-max` (NotionKit 1.12.0) caps `<nk-page full>` as well: the token reaches the shadow root.
- Peer `@jungherz-de/notionkit >= 1.12.0`.

## [1.11.1] – 2026-09-24

Built against NotionKit CSS 1.11.1 (peer `>= 1.11.0`).

### Fixed
- **The package carries SKILL.md and CHANGELOG.md.** `files` in package.json listed `dist/`, `src/` and `LICENSE` only, so no release since 1.0.0 had them. LearnHub found them missing while moving to 1.11.0: an agent that reads SKILL.md from `node_modules` had to fetch it from GitHub.
- **The bundles name no source map.** They embed NotionKit's stylesheet, whose CSS ended in a `sourceMappingURL` comment, so DevTools looked for `notionkit.min.css.map` on the server of every app that loads Elements. NotionKit 1.11.1 drops the comment from the embedded copy.

### Added
- `npm run check:package`, in CI too: it packs the package without publishing and fails when an entry point of package.json, SKILL.md, CHANGELOG.md or a source map named by a shipped file is missing.

## [1.11.0] – 2026-09-24

Built against NotionKit CSS 1.11.0 (peer `>= 1.11.0`). SupaGantt's first weeks on Elements turned up thirteen findings; this release answers all of them. One matters beyond SupaGantt: an `<nk-switch>` without content froze Safari – the demo, the landing page, the docs and the showcase among the pages it hung.

### Fixed
- **An `<nk-switch>` without content no longer freezes Safari** – since 1.2.0 it did. `_syncText()` wrote the slot's fallback text on every call, WebKit fires `slotchange` for such a write even when the text stays the same, and `slotchange` called `_syncText()` again – an endless loop at 100 % CPU for `<nk-switch></nk-switch>` or `<nk-switch text="…"></nk-switch>`. Chromium was never affected, so no test saw it – and the demo, the landing page, the docs and the showcase all have such switches. It writes on a change only now, and so do `<nk-page>`, `<nk-ai-msg>` and `<nk-tree-item>`, which write fallback text as well.
- **`<nk-dialog>` closes for its actions only.** Any button with a `value` inside closed it, an option of an `<nk-segmented>` too, with the option's value as the result. Now a button in `slot="actions"` with a `value` closes it, and one anywhere inside with `data-close` – with that attribute's value.
- **`<nk-select>` keeps a value set before its options.** A framework that sets properties before children – Hybrids – set `value` while the select had no `<option>` yet, and the first option showed. The value now waits and is applied once its option arrives; until then `value` reports it.
- **A floating menu or date picker inside an open `<nk-modal>` or `<nk-dialog>` sits under its anchor.** Their surfaces kept a transform at rest, which made them the containing block of the fixed menu: it opened off by the surface's position and clipped by its overflow. NotionKit 1.11.0 gives the open surfaces no transform at all, and `placeUnder()` and `placeNear()` measure the frame the host really sits in and take it off, for a transformed ancestor of one's own.
- **`<nk-menu floating>` and `<nk-calendar floating>` take no room before their first `show()`.** The fixed host stood at its static position in the flow until then – a long page grew by thousands of pixels, and focusing moved it. The host starts at the window's top left corner.
- **`<nk-tree-item>` takes every text node for its label**, empty and blank ones too: a template engine fills an expression's node after the item is built – `${i} ${title}` read “1Projekte”, and children showed only a “.”.
- **`<nk-avatar>` initials skip punctuation.** They are the first letter or digit of each word, and a word without one is skipped: “Planer (Dev)” → PD, not P(; “Anna-Lena Groß” → AG. The same goes for every element that draws initials from a name – member rows, comments, people in the database views.
- **`<nk-filter-bar>` never changes the caller's array.** Removing a pill spliced the array given to `filters`; the bar keeps a copy now, `filters` returns one, and `nk-change` reports the new list.
- **The banner's action is a button.** `slot="action"` takes a `<button>`, which NotionKit 1.11.0 strips down to underlined text – a button's role and keyboard instead of a span with `role="button"` and a key handler of one's own. Below 860px the action moves under the text, as the docs promised, instead of squeezing the text into a narrow column beside it.
- **SKILL.md documents `<nk-menu-item type="check">`** – a ✓ where the shortcut stands, `nk-change { value, checked }` instead of `nk-select`, the menu stays open – and the new behaviour of `<nk-dialog>`, `<nk-select>`, `<nk-menu>`, `<nk-tooltip>`, `<nk-avatar>` and `<nk-filter-bar>`.

### Added
- **`<nk-fields fit>`**: the fields share the row instead of keeping 150px columns – two fields in a wide dialog are two halves, not two thirds and an empty third column. NotionKit's `.nk-fields.fit`.
- **A floating menu opens upwards and never outgrows the window.** Where the window ends below and there is more room above, `<nk-menu floating>` and `<nk-calendar floating>` open above their anchor; either way they are capped to the room there and a longer menu scrolls – 48 assignees near the bottom of the window.
- **`<nk-tooltip>` for a rect stays, keeps line breaks and hides on the wheel.** A tooltip shown with `show(rect, text)` – a bar of a Gantt chart – stays until `hide()`, the pointer on another `[data-tooltip]`, a press or Escape; before, one shown in the same `pointerover` that left a `[data-tooltip]` closed at once. A line break in the text is kept (NotionKit's `.nk-tooltip.lines`), a long word breaks, and the wheel hides it – scroll events do not leave a shadow root, so scrolling inside a component left it standing.

### Changed
- Tests run in WebKit too: every page loads and answers in WebKit, and the settings pane with its empty switches renders – the suite that would have caught the Safari freeze. CI installs Chromium and WebKit.
- Docs, showcase, SKILL.md and the demo write the banner's action as a `<button>`.
- Peer `@jungherz-de/notionkit >= 1.11.0`.

## [1.10.1] – 2026-09-24

Built against NotionKit CSS 1.10.1 (peer `>= 1.10.1`).

### Fixed
- **A disabled `<nk-btn>` shows its tooltip and its `title`.** NotionKit gave `.nk-btn:disabled` `pointer-events: none`, so the hint that says why a button is disabled never appeared – with `<nk-tooltip>` and `data-tooltip` no more than with `title` – and a click fell through to the element behind it, a table row say. Since NotionKit 1.10.1 a disabled button takes the pointer and shows the `not-allowed` cursor, hover leaves it alone, and a click reaches nothing. A disabled link button (`<nk-btn href disabled>`) is dimmed as well. Found in Auxdesk.

## [1.10.0] – 2026-09-24

Built against NotionKit CSS 1.10.0 (peer `>= 1.10.0`), shell and overlays: two new elements – 87 in all – and two that grow. SupaGantt asked for all four: a Gantt chart at full width, bars that stay visible beside the peek, confirmation and input dialogs, hints on bars and the ribbon.

### Added
- **`<nk-dialog>`** – a question or a short form with the contract of `<nk-modal>` and `<nk-sheet>`: `show()`, `close()`, `toggle()`, `nk-toggle`; Escape – captured, so it closes before a peek, a menu or a modal behind it – and the backdrop close it; focus moves in, to an `[autofocus]` element or the first field or button, and back; the page behind is inert and scroll-locked. It lies above the modal and the sheet and lifts the inertness a modal gave it, so a question can come from inside one. `title` is the heading and the dialog's name, never a tooltip; the default slot takes the text or the fields, `slot="actions"` the buttons. A button with a `value` closes it with that value, so does the submit of a `<form method="dialog">` inside; `nk-close { value }` fires first and can be cancelled – the place to check an input. `returnValue`, `alert` (an alertdialog described by its text), `wide` (560px), `show(from)` to hand focus back to the ⋯ of a menu that has closed. Below 860px a bottom sheet with the buttons stacked, the confirming one on top.
- **`<nk-tooltip>`** – Notion's hover hint. One element without `for` serves every `[data-tooltip]` (with `data-tooltip-key` for a shortcut) on the page, inside shadow roots too – a whole toolbar in one element; with `for` it belongs to one element and shows its own content and `shortcut`. After `delay` ms (400) under the pointer, at once on keyboard focus, never on touch; leaving, a press, blur, scrolling and Escape hide it. 6px below its target and centred, above it where the window ends (`placement="top"` prefers above), 8px inside the window. `show(target, text, shortcut)` takes an element or a rect – the bars of a chart. The target's `aria-describedby` names it while it shows.
- **`<nk-sidebar collapsible>`** – Notion's « beside the workspace row, shown while the pointer is over the sidebar: on the desktop it collapses the sidebar, the main column takes the width, nothing in it takes focus; `<nk-btn variant="sidebar">` shows on the desktop too while it is collapsed and brings it back; ⌘\ or Ctrl+\ toggles it, on a phone the drawer. `collapsed`, `collapse()`, `expand()`, `toggleCollapsed()`, `nk-collapse { collapsed }` to keep it, `collapse-label`. Focus moves to the control that is left.
- **`<nk-peek resizable inset>`** – `resizable` puts Notion's drag on the left edge, with the arrow keys as well (16px a step), from `min` (380) to `max` (all but 320px of the window); the width is NotionKit's new token `--nk-peek-width`, set on `:root`, `width` sets it and `nk-resize { width }` is the moment to keep it. `inset` makes the page's `<nk-app>` move aside while the peek is open on the desktop (`peek-inset`, also an attribute of `<nk-app>`).
- `placeNear()` in `util/floating.js` – the tooltip's placement, for an element or a rect.

### Changed
- Demo: « and ⌘\ collapse the sidebar, the ☰ brings it back; the side peek resizes; “Move to trash” in the page menu asks first, and the ＋ view tab asks for a name and a layout; the topbar's buttons and the « have tooltips; `#dialog` opens the question. The app matches the class demo at 0.00 % – the collapsed sidebar, the tooltip, both dialogs, the dialog as a sheet on a phone and a wider peek included.
- `<nk-workspace-switcher>` fills the new sidebar head beside the «.
- Peer `@jungherz-de/notionkit >= 1.10.0`.

## [1.9.0] – 2026-09-24

Built against NotionKit CSS 1.9.0 (peer `>= 1.9.0`), dates: a date picker
and a calendar view – 85 elements in all. SupaGantt, a planning tool about
to start on NotionKit, asked for both: start and end, constraints and
deadlines, with calendar weeks, working days and holidays.

### Added
- **`<nk-calendar>`** – Notion's date picker (forms): a month with Today
  and ‹ ›, form-associated. The value is a day (`YYYY-MM-DD`); with `range`
  an interval `start/end`, picked in two clicks in either order; with
  `time` a day and a time (`YYYY-MM-DDTHH:MM`) from a time field under the
  month; `clearable` adds Clear. `weeks` puts the ISO calendar week in front
  of each row – “KW” in German –, `weekend` greys the days not worked, and
  the `days` property (or JSON attribute) adds holidays (`off` with a
  `label`, which is also announced) and up to three `marks` per day in the
  nine colours. Days outside `min`/`max` are `aria-disabled`: in the arrow
  path and announced, never picked. After GlassKit Elements'
  `<glk-calendar>`: arrows move by a day or a week, Home/End to the ends of
  the week, PageUp/PageDown by a month (with Shift a year) – moving picks
  nothing –, Enter or Space picks; one day is in the tab order; month names,
  weekdays and the first day of the week come from `Intl` and the page's
  language, `week-start` overrides; a new value brings its month;
  `nk-change { value, start, end, time }` only when the value changes,
  `nk-month`, `required`, reset. `floating sheet` makes it a popover that
  `show(anchor)` puts under a property or a cell – a bottom sheet with 44px
  cells on a phone – with `<nk-menu floating>`'s contract: a tap outside
  closes it and reaches nothing else, Escape closes it, focus goes in when
  opened from the keyboard and comes back; a pick closes it, the second of a
  range.
- **`<nk-calendar-view>`** – the fourth database view: a month, the rows as
  cards on their dates (`date-key`, default the first date column;
  `YYYY-MM-DD`, `D.M.YYYY` or a range on its start). Today on a red pill,
  days of other months washed, `weeks`, `weekend`, `week-start`; a card
  fires `nk-select` like a row of the table, Today and ‹ › `nk-month`. In
  `<nk-database>` a tab like the others, with the same rows.
- `nk-select` of `<nk-table-view>` says which cell was hit: `key` names its
  column and `cell` is the `<td>`, to open an editor there – the date picker
  under a due date.

### Changed
- Demo: Due under the title and the table's due dates open one
  `<nk-calendar floating sheet weeks>` – on the month of the date, weekends
  and holidays greyed, the projects' due dates dotted –, a new date reaches
  table, board, list and calendar; the database has a 📅 Calendar tab whose
  cards open the side peek; `#date` and `#calendar` open those states. The
  app matches the class demo at 0.00 % – the picker on the desktop and as a
  sheet on a phone, the calendar view in two months included.
- `<nk-menu floating>` and `<nk-calendar floating>` share their placement
  (`src/util/floating.js`).
- Peer `@jungherz-de/notionkit >= 1.9.0`.

## [1.8.0] – 2026-09-24

Built against NotionKit CSS 1.8.0 (peer `>= 1.8.0`), links and peeks: four
new elements – 83 in all – for what LearnHub and Auxdesk each built on
their own: a side peek, a bookmark, a copy field and an image picker.

### Added
- **`<nk-peek>`** – Notion's side peek: a database row at the right edge,
  full height, next to the table, which stays usable – no scrim, nothing
  inert. The bar carries » to close and `slot="actions"`; the body is the
  page – `nk-page-title` (32px there), `nk-props`, a `.nk-prose`,
  `nk-comments`. `show()` slides it in and moves focus to it; », Escape and
  a click elsewhere close it, and Escape and » hand focus back. A click that
  calls `show()` again – another row – only swaps the content, and clicks
  inside other overlays (a menu opened from the peek) leave it open. Below
  860px it is a bottom sheet over a dimmed page and modal there: inert page,
  scroll lock, a tap on the dimmed page closes it. `nk-toggle`. LearnHub's
  contextual help is such a panel.
- **`<nk-bookmark>`** – Notion's link block from `href`, `title`, `desc`,
  `favicon` and `cover` – what `og:title`, `og:description` and `og:image`
  give. `title` is the heading, never a tooltip; without it the host name
  stands in; `url` shows another address than `href`; a part without a
  value is left out. Opens in a new tab unless `target` says otherwise.
  LearnHub shows with it how a shared course link will look.
- **`<nk-copy-field>`** – a value to take along, as tall as an input, with
  Copy inside: the clipboard, then “Copied” in green for a moment; where the
  clipboard is not allowed, the value is shown and selected for ⌘C.
  `secret` masks it behind Show/Hide and Copy still copies the real value;
  `value` set as a property is not reflected, so a key never lands in the
  markup. `mono`, `wrap`, `wide`; the texts are attributes. Fires
  `nk-action { action: 'copy', value, ok }`. Auxdesk's inbound addresses,
  Notion URL, widget secret and embed code are such values.
- **`<nk-image-picker>`** – a picture for a person or a workspace on
  NotionKit's profile row, round or `square`, with Upload / Change and
  Remove. Ported from GlassKit Elements' `glk-image-picker`: decoded with
  the EXIF rotation (`createImageBitmap`, `imageOrientation: 'from-image'`),
  drawn no larger than `max` (512), out as `type` at `quality`, handed over
  as a data URL in `nk-change`; an unreadable file fires `nk-error`. `src`
  as a property is not reflected. LearnHub needs it for the customer logo.

### Changed
- Demo: a row, a card or a list item opens in `<nk-peek>` with its
  properties, notes and a comment (it was a toast); the bookmark follows
  the core-idea callout; the profile picture and a square workspace icon are
  `<nk-image-picker>`s; General shows the public address in an
  `<nk-copy-field>`; `#peek` opens the table row. The app matches the class
  demo at 0.00 % – the open peek on the desktop and as a sheet on a phone
  included.
- The social card is rendered with the element count and the bundle size
  from the build; it said 68 elements and 33 KB.
- Peer `@jungherz-de/notionkit >= 1.8.0`.

## [1.7.0] – 2026-09-24

Built against NotionKit CSS 1.7.1 (peer `>= 1.7.1`), the mobile-and-filter
release: menus that float in and become sheets on a phone, a sheet of its
own, the drawer from the stylesheet, Notion's database toolbar with filter
pills, and steps. 1.7.1, not 1.7.0: clean-css broke the minified files of
1.7.0, and those are what the elements adopt – every phone rule after the
drawer applied on the desktop too (see NotionKit's changelog).

### Added
- **`<nk-sheet>`** – Notion's mobile surface, the phone's twin of
  `<nk-modal>` with its contract: `show()`, `close()`, `toggle()`; Escape
  and the backdrop close it; focus moves in and back; the page behind is
  scroll-locked and inert; `nk-toggle`. The panel rises from the bottom edge
  with a grabber, `title` stands under it and names the dialog (taken off
  the host, never a tooltip), rows inside are 40px. A chosen row does not
  close it – `nk-select` bubbles out and the app decides.
- **`<nk-steps>`** – a short flow, vertical: done steps with a check on the
  green tag, the current one ringed in the accent and marked
  `aria-current="step"`. `current` counts from 1 and `next()` moves on;
  `steps` is a comma-separated list or, as a property, strings and
  `{ label, desc }` objects; `label` names the list.
- **`<nk-menu floating sheet>`** – a menu over the page of its own:
  `menu.show(button)` opens it under the button, right edges aligned
  (`align="start"`: left edges), and it fades in like the palette. A tap
  outside closes it and reaches nothing else; Escape and a chosen item close
  it, a switch or check row keeps it open; opened from the keyboard, focus
  moves to the first item and back; `aria-expanded` on the button follows.
  With `sheet` it is a bottom sheet below 860px, whatever position `show()`
  wrote. `nk-toggle` when it opens and closes.
- **`<nk-menu-item type="check">`** – a ✓ where the shortcut stands,
  `menuitemcheckbox`: a click flips `checked` and fires `nk-change`, and the
  menu stays open – the rows of a filter menu.
- **The database toolbar.** `<nk-database>` renders NotionKit's
  `.nk-db-toolbar`: the view tabs on the left, `slot="tools"` on the right,
  `slot="filters"` under it. `<nk-btn variant="tool">` is a tool, `active`
  gives it the accent. The ＋ tab is `.nk-db-tab.add`, no inline style.
- **`<nk-btn variant="sidebar">`** – the ☰, `.nk-topbar-btn.nk-sidebar-toggle`:
  shown below 860px only, a click opens the `nk-sidebar` of its app as a
  drawer, and `aria-expanded` follows however the drawer closes.
- `<nk-segmented scroll>` keeps the chosen option in view – after the first
  layout, on every change and when the row's width changes – by scrolling
  the row, never the page, the least distance, right to left as well.
- `<nk-btn aria-haspopup>` reaches the button, like `aria-label`.

### Changed
- **`<nk-filter-bar>` is NotionKit's filter pills** (`.nk-filter-row`,
  `.nk-filter-pill`, `.fp-remove`, `.add`) instead of tags laid out by
  inline styles: a pill per filter with its ×, the `add` pill at the end;
  its own Filter and Sort are `.nk-db-tool`s. A pill's label fires
  `nk-action { action: 'edit', index, filter, anchor }`, the add pill
  `{ action: 'add', anchor }` – `anchor` is the clicked button, for
  `menu.show(anchor)`. A filter takes `op: 'is-not'`; `color` is no longer
  read, a pill has one look. The texts are attributes: `filter-label`,
  `sort-label`, `add-label`, `remove-label`.
- **The sidebar drawer is the stylesheet's.** `<nk-sidebar open>` sets
  NotionKit 1.7.0's `.nk-sidebar.open` and `.nk-sidebar-backdrop.open`; the
  element's own drawer CSS is gone. Same slide and scrim; with reduced
  motion the stylesheet shortens the transition to .01ms.
- Overlays return focus to the control that had it, also when it sits in a
  shadow root (`nk-sheet`, `nk-menu`); a floating menu's Escape is handled
  before a modal's or a sheet's around it.
- Demo: the database toolbar with live filter pills – "Status: Open" set –
  on table, board and list, a filter menu, Sort, search and New; the ⋯ page
  menu is `<nk-menu floating sheet>` (the positioned wrapper is gone); More
  opens an `<nk-sheet>`; the ☰ is `variant="sidebar"`; the steps in the AI
  pane for a custom model; six ranges in a scrolling segmented control;
  `#menu`, `#filter`, `#more` and `#settings` open that state. The modal is
  `id="settingsModal"`, the sheet `id="moreSheet"`: an id equal to the hash
  made the browser scroll to it and take the focus it had just been given.
  The app matches the class demo at 0.00 % on the desktop, in the menus and
  in the phone's sheets and drawer.
- Peer `@jungherz-de/notionkit >= 1.7.1`.

## [1.6.0] – 2026-09-23

Built against NotionKit CSS 1.6.0 (peer `>= 1.6.0`), the app-views release:
six new elements for the base layer that LearnHub and Auxdesk each built on
their own, and a per-component build that no longer carries its own copy
of the stylesheet.

### Added
- **`<nk-props>` and `<nk-prop>`** – the properties under the title of a
  database page: `label` and `icon` name the row, the content is the value
  (tags, `<nk-avatar>`, a date, `<nk-progress wide>`). Rows are
  `display: contents` hosts, so each renders as a row of the list; a click
  fires `nk-action` with the half that was hit. Stacks below 860px.
- **`<nk-list-view>`** – the third view of `<nk-database>`: one line per
  row, icon and title, `meta-keys` on the right (default: the select and
  date columns). Rows fire `nk-select`, also on Enter; works standalone
  with `columns` and `rows`.
- **`<nk-panels>` and `<nk-panel>`** – neutral surfaces in a grid that
  falls to one column on a phone. `title` is the heading (taken off the
  host, never a tooltip), `cover` draws the gradient band or a picture,
  `icon` overlaps it – a page tile as on Notion's Home – and `href` makes
  the panel a link.
- **`<nk-avatar>`** – initials, an emoji or a photo: `size` small / large /
  xlarge, `color` one of the nine names or any CSS background, `square`,
  initials from `name`, a photo from `src` with `name` as its alt text.
- `<nk-page full small>` – Notion's page options, full width and small
  text, on the page itself.
- `<nk-page-cover src position>` draws the picture as an `<img>`, cropped
  rather than stretched; `position` moves the crop.
- `<nk-ai-msg bubble>` – the message as a grey bubble without avatar or
  name, on the right with `role="user"`, as Notion's AI chat shows your own
  question.
- `<nk-progress wide>` fills its row and keeps its label beside it.
- `<nk-menu-item type="switch" checked>` – a row with a switch on the
  right, like “Small text” in Notion's page menu. A click flips `checked`
  and fires `nk-change`, not `nk-select`, so the menu stays open.
- Number columns stand right-aligned in figures of equal width
  (`td.num`), formatted by the column's `locale` and `format`
  (Intl.NumberFormat options).
- `componentsSheet` is exported from the bundle
  (`NotionKitElements.componentsSheet` from the `<script>` build): a
  project's own views adopt the same instance as the elements instead of
  loading NotionKit's stylesheet a second time. LearnHub and Auxdesk loaded
  it twice.
- `@jungherz-de/notionkit-elements/base.js` – `NkElement` and
  `NkFormElement` for per-component setups, from a stable file.
- `test/app-views.spec.mjs`, 15 tests; six new parity pairs (twelve with
  both themes).

### Changed
- **The per-component files import NotionKit's stylesheet instead of
  inlining it.** The base chunk carried the whole sheet – 64 KB – under a
  hashed name that changed with every build. It is now
  `dist/components/base.js`, 13 KB, and imports
  `@jungherz-de/notionkit/notionkit-styles.js`: a bundler resolves it from
  `node_modules`, a build-free page adds one import-map entry, and the
  sheet exists once. The full bundles keep inlining it – a `<script>` tag
  has nothing to resolve against. (GlassKit Elements 1.14.0 and 1.15.0
  did the same.)
- `<nk-member-row>`, `<nk-comment>` and the person cells of the database
  views draw their avatar as `.nk-avatar`. `color` takes the nine colour
  names as classes – no hex value needed in markup – and still any CSS
  background; **without `color` the avatar takes the gradient**, the
  avatar component's default, instead of the tertiary grey.

### Site
- The reference app shows the same new placements as the NotionKit demo:
  properties under the title, the ⋯ page menu with small text and full
  width, “List” as third view and an “Effort” column, “Edit · Read” for the
  editor, your own question as a grey bubble, members with named avatar
  colours, and the start view behind “Home”. Against the class version at
  1280px: 0.00 % pixel difference in both themes, the start view included.
- Landing page: “Same look, a fraction of the markup” gets the page
  properties as its second example; 77 elements.

## [1.5.3] – 2026-09-23

Built against NotionKit CSS 1.5.3 (peer `>= 1.5.3`), the phone release.

### Fixed
- Through NotionKit 1.5.3: on phones `<nk-topbar>` keeps to one row – only
  the last crumb of `<nk-breadcrumb>` stays, ending in an ellipsis, and
  passive text steps aside. `<nk-field>` rows wrap, so the settings modal
  keeps to the screen – five of the six panes in the demo ran up to 66px
  past a 390px screen. `<nk-member-row>` ends a long address in an
  ellipsis instead of pushing the role select out.
- Demo and docs use `<span class="nk-topbar-meta">` for passive text in the
  topbar, new in NotionKit 1.5.3, instead of an inline-styled
  `nk-topbar-btn`. The topbar is documented as 44px, not 45px.

### Added
- `test/phone.spec.mjs`: at 390px no page of the site scrolls sideways,
  every settings pane keeps to the screen, and the topbar keeps to one row.

### Site
- Navigation on phones: the links move into a second row that scrolls
  sideways. The flat row made every page 748px wide on a 390px phone.
  Anchors in the docs land below the taller bar.
- Docs: attribute and event tables scroll inside their own box; the
  database entry's table made the docs page 437px wide on a phone.

## [1.5.2] – 2026-09-23

Built against NotionKit CSS 1.5.2 (peer `>= 1.5.2`). Two fixes GlassKit
Elements had made before, plus the foundation's five fixes by rebuild.

### Fixed
- **`title` showed as a browser tooltip.** `<nk-settings-pane>`,
  `<nk-danger-zone>`, `<nk-empty>` and `<nk-model-card>` take their
  heading from `title` – which is also the global HTML attribute, so
  hovering a settings pane floated its heading over the whole pane, and the
  model cards and the danger zone did the same. The elements now read the
  attribute and take it off the host (`NkElement.takeTitle()`): a later
  `setAttribute('title', …)` is taken the same way, `el.title` answers
  from the stored value, and setting it never writes the attribute – so a
  framework that binds `title` as a property (hybrids, lit's `.title`)
  never puts one on the host. The API is unchanged, `title="…"` stays the
  documented attribute; what changes is that `getAttribute('title')`
  returns `null` after upgrade. `<nk-model-card>` still reports its name
  in `nk-select`. (GlassKit Elements 1.16.1.)
- **Several actions in `<nk-empty>` touched.** The default slot now sits
  in `.e-actions`, a centred row that wraps with 8px between the buttons
  (NotionKit 1.5.2).
- **`<nk-toast>` lay behind the tab bar on a phone.** notionkit.css lifts a
  class-markup toast above a visible tab bar with `:has()`, which cannot
  see into shadow roots, so the element measures the bar when it opens and
  sits 12px above it – the app's own bar at the bottom of the screen,
  sticky, fixed or floating. A tab bar previewed somewhere inside a page
  does not lift it.
- Through NotionKit 1.5.2: `hidden` hides every nk- element and slotted
  node, the toast paints above dialog and palette and keeps a short message
  on one line on a phone, date and time fields keep to their column on iOS,
  and checkbox and switch sit beside the first line of a wrapping label.

### Added
- `test/regressions-152.spec.mjs`: the title handling of all four
  elements, including a title set as a property before upgrade, the
  empty-state action row and the toast over the app's tab bar. Against the
  1.5.1 bundle seven of the nine tests fail.
- Demo app: "Import" next to "New entry" in the empty state, and a
  two-line product-news checkbox in the notification settings – the same
  changes as in the NotionKit demo.

## [1.5.1] – 2026-09-14

Built against NotionKit CSS 1.5.1 (peer `>= 1.5.1`).

### Fixed
- **`nk-sidebar` drawer transition.** Below 860px the drawer used to snap
  in and out (a bare `display` switch). It now slides in over 240ms while
  the scrim fades, and closing runs the same way backwards – CSS only:
  `display` transitions with `transition-behavior: allow-discrete`,
  `@starting-style` supplies the first frame, `position: fixed` applies in
  both states so the closing aside does not fall back into the flow.
  Browsers without either feature switch hard as before;
  `prefers-reduced-motion` snaps. Crossing the breakpoint downwards runs the
  slide-out once.
- Through NotionKit 1.5.1: the tab bar no longer stacks its 6px on the
  home-indicator inset, and topbar, page, tab bar and the drawer honour the
  left/right safe-area insets (Dynamic Island in landscape). Reported by
  Auxdesk.

## [1.5.0] – 2026-09-13

Rebuilt against NotionKit CSS 1.5.0 (peer `>= 1.5.0`) – the Notion-2025
fidelity release: darker text greys and a dedicated sidebar text colour,
`-webkit-font-smoothing: auto`, filled inputs, white buttons, 36px table
rows, pill view tabs. From this release on, Elements and the foundation
share one version number (1.4.x is skipped).

### Added
- `nk-tag color` accepts all nine Notion select colours: `gray`, `brown`,
  `orange`, `yellow`, `green`, `blue`, `purple`, `pink`, `red`. Without
  `color` the tag is grey, as in Notion – it used to have no fill at all.
- `nk-banner variant="danger"`.
- `nk-table-view wrap` lets cell text break (`.nk-table.wrap`), like
  Notion's "wrap column".

### Changed
- Select and multi-select cells fall back to the grey tag for an option
  without a known colour (was blue).
- Tags are 20px tall with 3px corners and near-black text on the fill; the
  old mid-tone tag text lives on in the foundation as `--nk-color-*`, the
  old soft backgrounds as `--nk-tint-*`. Banners use those tints under the
  normal text colour.

## [1.3.1] – 2026-09-12

Rebuilt against NotionKit CSS 1.4.1 (peer `>= 1.4.1`).

### Fixed
- `nk-page` without `cover` clipped the top of its icon: the stylesheet
  pulled the icon up by 42px regardless of a cover, and the page had no top
  padding, so half the icon sat outside the scroll container. The element
  now sets the stylesheet's `covered` state only with the `cover` attribute
  or a slotted `nk-page-cover`; otherwise the icon sits in 24px top padding.
  Reported by Auxdesk.

## [1.3.0] – 2026-09-12

Built and tested against NotionKit CSS 1.4.0 (peer `>= 1.4.0`).

### Added
- `nk-segmented scroll` / `wrap`: a long filter row scrolls horizontally
  with the scrollbar hidden, capped at the parent width, or wraps onto
  further rows. Default stays one row.
- `nk-tab-bar fixed`: pinned to the viewport bottom for standalone PWAs; the
  element renders the `.nk-tab-bar-spacer` itself, so the page still ends
  above the bar without any padding of yours.

### Fixed
- Through NotionKit 1.4.0: `.nk-app` is `100dvh` (fallback `100vh`), so an
  iOS standalone PWA no longer counts the status bar into the shell and the
  tab bar no longer sits half behind the home indicator. The bar has a fixed
  height now (`--nk-tab-bar-height` + safe area). Reported by Auxdesk.

## [1.2.1] – 2026-09-11

Rebuilt against NotionKit CSS 1.3.1 (peer `>= 1.3.1`); the bundle embeds the
stylesheet, so the fix below needs this release.

### Fixed
- Inputs inside `nk-fields` (and stacked / compact `nk-field`s) overflowed
  their column by about 20px: the controls' `min-width: 210px` became the
  grid item's automatic minimum. NotionKit 1.3.1 sets `min-width: 0` down
  the chain; a test now measures that every control ends inside its column
  at 150px. Reported by Auxdesk.

## [1.2.0] – 2026-09-11

Built and tested against NotionKit CSS 1.3.0; the peer range is now
`>= 1.3.0` (field layouts and the labelled switch need its rules).

### Added
- **Visible text on `nk-switch`.** The default slot (or `text`) renders
  beside the switch inside `label.nk-switch-label`, so several switches in
  one row are readable and the text is part of the hit area. Without text
  the element still renders the bare button. `label` stays the accessible
  name for the bare form.
- **`text` on `nk-check` and `nk-radio`** as the attribute alternative to
  the slotted label text (the slot was always the visible label).
- **`nk-field stacked` / `compact`** – label above a full-width control,
  small tertiary label without row padding. A stacked field sets `wide` on
  its `nk-input` / `nk-textarea` / `nk-select` itself, because the
  stylesheet cannot reach into the control's shadow root.
- **`nk-fields`** – the field grid: `minmax(150px, 1fr)` columns that wrap,
  every `nk-field` inside stacked and compact by default.
- `wide` on `nk-select`. Requested by Auxdesk.

## [1.1.0] – 2026-09-11

Built and tested against NotionKit CSS 1.2.0; the peer range is now
`>= 1.2.0` (the tab bar needs its `.nk-tab-bar` rules, everything else still
works with 1.0.0).

### Added
- **`nk-tab-bar` / `nk-tab-bar-item`** – the mobile tab bar for phones and
  installed PWAs. Last child of `nk-app`, it is slotted into the main column
  below the scrolling page, so it never moves and needs no bottom padding.
  Exactly one item is `active` (`value` ↔ `active`, `nk-change`); an item
  emits a cancelable `nk-select`, navigates with `href`, and with `drawer`
  opens the nearest `nk-sidebar` as a drawer instead of becoming active.
  Hidden above 860px by the stylesheet – there the sidebar is the
  navigation – and shown below; `always` shows it at every width (previews,
  phone frames), `floating` makes it a capsule. Icon as attribute or
  `slot="icon"`. Requested by Auxdesk.
- Demo app and the workspace skeleton in `SKILL.md` carry the tab bar.

### Fixed
- **`disabled` before the first render threw.** A `disabled` attribute in
  the markup fires `formDisabledCallback` on parse or upgrade, before
  `connectedCallback` has rendered anything; `nk-todo`, `nk-check`,
  `nk-radio`, `nk-switch`, `nk-input`, `nk-textarea`, `nk-select`,
  `nk-slider` and `nk-segmented` wrote into the missing inner control
  (`TypeError: Cannot set properties of undefined`). `NkFormElement` now
  remembers the state and applies it after the first render. The same path
  was hit when a template engine set `checked` and `disabled` as properties
  on a not-yet-connected element. Reported by Auxdesk (hybrids).
- **Own properties from before the upgrade** – a `checked = true` set on
  the element while it was still a plain `HTMLElement` (a template clone
  before the bundle loaded) shadowed the accessor for good. `NkElement`
  re-applies such properties through their setters on the first connect.
- `nk-input`, `nk-textarea`, `nk-select`: toggling the `disabled` attribute
  inside a `<fieldset disabled>` no longer re-enables the control.

## [1.0.1] – 2026-09-06

Documentation-only release; the bundles are unchanged.

### Changed
- README: header aligned with GlassKit Elements (centred title, full badge
  row, tagline, link row, "What is" intro with before/after, feature table);
  the family table now lists repository and website for every layer in one
  pattern; Jungherz GmbH links to jungherz.com.
- NotionKit Web is available and linked from the README, the landing page,
  the site navigation, `SKILL.md` and `llms.txt`.
- Landing page content centred; German pages link to their German
  counterparts (including the embedded `de/app.html`); page footers link
  Jungherz GmbH.

## [1.0.0] – 2026-09-06

First release: the Web-Components layer of the NotionKit family. 68 elements,
built and tested against NotionKit CSS 1.1.1 (peer range `>= 1.0.0`).

### Added
- **Base classes.** `NkElement` / `NkFormElement`: open Shadow DOM adopting the
  NotionKit *components* sheet only; design tokens injected once on the
  document inside `@layer notionkit-defaults`; one `MutationObserver` on
  `<html>[data-theme]` for every instance; listeners re-armed on every
  connect; `observesLightDom` / `projectLightDom()` / `refresh()`; manual
  slot assignment for elements that route text and children themselves;
  ElementInternals for form participation. Every host is `display: contents`.
- **Wave 1 – forms & content:** `nk-btn`, `nk-input`, `nk-textarea`,
  `nk-select`, `nk-switch`, `nk-check`, `nk-radio`, `nk-slider`, `nk-field`,
  `nk-tag`, `nk-progress`, `nk-callout`, `nk-divider`, `nk-heading`,
  `nk-toggle`, `nk-todo`, `nk-kbd`, `nk-code`, `nk-quote`.
- **Wave 2 – app shell & navigation:** `nk-app`, `nk-sidebar` (off-canvas
  drawer below 860px), `nk-workspace-switcher`, `nk-section-label`, `nk-tree`
  (single `active`, one tab stop, arrow keys, `data`), `nk-tree-item`,
  `nk-topbar`, `nk-breadcrumb`, `nk-theme-toggle`.
- **Wave 3 – page shell & blocks:** `nk-page`, `nk-page-cover`,
  `nk-page-title` (editable), `nk-page-actions`, `nk-block-host`, `nk-banner`,
  `nk-empty`, `nk-skeleton`, `nk-synced`, `nk-tabs` / `nk-tab`,
  `nk-segmented`, `nk-stats` / `nk-stat`, `nk-avatar-group`, `nk-mention`,
  `nk-template-btn`, `nk-model-card`, `nk-profile-row`, `nk-danger-zone`,
  `nk-member-list` / `nk-member-row`.
- **Wave 4 – overlays:** `nk-modal` (renders its nav from the panes, focus
  in/out, scroll lock, `inert`), `nk-settings-pane`, `nk-settings-user`,
  `nk-cmdk` (fuzzy search, keyboard, hotkey, `nk-command`), `nk-menu` /
  `nk-menu-item`, `nk-pop`, `nk-emoji-picker`, `nk-toast`.
- **Wave 5 – data & collaboration:** `nk-database`, `nk-table-view`,
  `nk-board-view` (drag & drop), `nk-filter-bar`, `nk-comments` /
  `nk-comment`, `nk-ai-thread` / `nk-ai-msg` / `nk-ai-input-row`, and the
  exported `renderPropertyCell()` / `tagFor()` / `compareBy()` helpers.
- **Radio groups across shadow roots.** `<nk-radio>`s with the same `name`
  in the same tree and form clear each other, keep a single tab stop and
  move with arrow keys (wrapping, skipping disabled). Measured: three radios
  in one form put exactly one entry into `FormData`.
- **Documentation**, generated from one catalog: `docs.html` (live preview,
  before/after toggle against the class markup, attribute / slot / event
  tables, mobile notes), `showcase.html` (brand switch), `index.html`,
  German twins under `de/`, `SKILL.md` with all six app skeletons, `llms.txt`.
- **Reference app** `app.html`: the NotionKit demo rebuilt from elements only.
  Pixel difference to the class version, measured with Playwright at
  1280 px: 0.00 %; at 390 px: 0.08 %.
- **Test suite** (Playwright, 180 tests): pixel parity of every element against
  its class markup in light and dark, branding through `:root` (with and
  without `notionkit.css` on the page, either load order), reconnect,
  radio groups, light-DOM drift (empty string is a valid value), form
  participation, overlays, data views, per-component import through a
  packed tarball.

### Notes
- Every host is `display: contents`. Inline-block hosts measured up to 22 px
  of layout drift (a hidden toggle arrow keeping its width, a switch host
  3 px taller than its button, topbar buttons wrapping differently); with
  no host box the inner element sits where the class markup puts it.
- Assigning a property to a custom element that has not been upgraded yet
  creates an own property that shadows the accessor forever. Containers
  therefore talk to their children through methods (`setTabbable()`,
  `setData()`), and children ask their container to resync once rendered.
- NotionKit CSS 1.1.0 / 1.1.1 were released alongside: slot-name twins
  (`::slotted([slot="icon"])`), explicit state classes (`.compact`, `.last`),
  disabled optics, `.nk-new-row`, and `!important` on the margin/padding
  declarations of slotted twins – the document's scoped reset would
  otherwise beat them (the outer tree wins over `::slotted()` for normal
  declarations; the inner tree wins for important ones). With 1.0.0 the
  elements still work, with those small deviations.
- Headless Chromium anti-aliases semi-transparent text inside shadow trees
  slightly brighter in the dark theme (channel delta ≤ 22 on glyph edges,
  geometry identical); the parity test uses a perceptual threshold of 0.25.

### Roadmap
- `<nk-editor>` (v1.1): a thin TipTap wrapper as an optional per-component
  import, never in the core bundle – shadow-less, adding `nk-block-host` to
  itself so the foundation's editor adapter rules apply.

[1.18.0]: https://github.com/JUNGHERZ/NotionKit-Elements/releases/tag/v1.18.0
[1.17.0]: https://github.com/JUNGHERZ/NotionKit-Elements/releases/tag/v1.17.0
[1.16.0]: https://github.com/JUNGHERZ/NotionKit-Elements/releases/tag/v1.16.0
[1.15.0]: https://github.com/JUNGHERZ/NotionKit-Elements/releases/tag/v1.15.0
[1.14.0]: https://github.com/JUNGHERZ/NotionKit-Elements/releases/tag/v1.14.0
[1.13.0]: https://github.com/JUNGHERZ/NotionKit-Elements/releases/tag/v1.13.0
[1.12.0]: https://github.com/JUNGHERZ/NotionKit-Elements/releases/tag/v1.12.0
[1.11.1]: https://github.com/JUNGHERZ/NotionKit-Elements/releases/tag/v1.11.1
[1.11.0]: https://github.com/JUNGHERZ/NotionKit-Elements/releases/tag/v1.11.0
[1.10.1]: https://github.com/JUNGHERZ/NotionKit-Elements/releases/tag/v1.10.1
[1.10.0]: https://github.com/JUNGHERZ/NotionKit-Elements/releases/tag/v1.10.0
[1.9.0]: https://github.com/JUNGHERZ/NotionKit-Elements/releases/tag/v1.9.0
[1.8.0]: https://github.com/JUNGHERZ/NotionKit-Elements/releases/tag/v1.8.0
[1.7.0]: https://github.com/JUNGHERZ/NotionKit-Elements/releases/tag/v1.7.0
[1.6.0]: https://github.com/JUNGHERZ/NotionKit-Elements/releases/tag/v1.6.0
[1.5.3]: https://github.com/JUNGHERZ/NotionKit-Elements/releases/tag/v1.5.3
[1.5.2]: https://github.com/JUNGHERZ/NotionKit-Elements/releases/tag/v1.5.2
[1.5.1]: https://github.com/JUNGHERZ/NotionKit-Elements/releases/tag/v1.5.1
[1.5.0]: https://github.com/JUNGHERZ/NotionKit-Elements/releases/tag/v1.5.0
[1.3.1]: https://github.com/JUNGHERZ/NotionKit-Elements/releases/tag/v1.3.1
[1.3.0]: https://github.com/JUNGHERZ/NotionKit-Elements/releases/tag/v1.3.0
[1.2.1]: https://github.com/JUNGHERZ/NotionKit-Elements/releases/tag/v1.2.1
[1.2.0]: https://github.com/JUNGHERZ/NotionKit-Elements/releases/tag/v1.2.0
[1.1.0]: https://github.com/JUNGHERZ/NotionKit-Elements/releases/tag/v1.1.0
[1.0.1]: https://github.com/JUNGHERZ/NotionKit-Elements/releases/tag/v1.0.1
[1.0.0]: https://github.com/JUNGHERZ/NotionKit-Elements/releases/tag/v1.0.0
