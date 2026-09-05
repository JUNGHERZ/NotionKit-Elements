# Changelog

All notable changes to NotionKit Elements are documented here. The format follows
[Keep a Changelog](https://keepachangelog.com/en/1.1.0/); versions follow
[Semantic Versioning](https://semver.org/).

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

[1.0.0]: https://github.com/JUNGHERZ/NotionKit-Elements/releases/tag/v1.0.0
