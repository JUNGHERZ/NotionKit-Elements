# Changelog

All notable changes to NotionKit Elements are documented here. The format follows
[Keep a Changelog](https://keepachangelog.com/en/1.1.0/); versions follow
[Semantic Versioning](https://semver.org/).

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

[1.3.1]: https://github.com/JUNGHERZ/NotionKit-Elements/releases/tag/v1.3.1
[1.3.0]: https://github.com/JUNGHERZ/NotionKit-Elements/releases/tag/v1.3.0
[1.2.1]: https://github.com/JUNGHERZ/NotionKit-Elements/releases/tag/v1.2.1
[1.2.0]: https://github.com/JUNGHERZ/NotionKit-Elements/releases/tag/v1.2.0
[1.1.0]: https://github.com/JUNGHERZ/NotionKit-Elements/releases/tag/v1.1.0
[1.0.1]: https://github.com/JUNGHERZ/NotionKit-Elements/releases/tag/v1.0.1
[1.0.0]: https://github.com/JUNGHERZ/NotionKit-Elements/releases/tag/v1.0.0
