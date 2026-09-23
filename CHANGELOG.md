# Changelog

All notable changes to NotionKit Elements are documented here. The format follows
[Keep a Changelog](https://keepachangelog.com/en/1.1.0/); versions follow
[Semantic Versioning](https://semver.org/).

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
