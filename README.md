<p align="center">
  <img src="https://img.shields.io/badge/version-1.0.0-2383e2?style=flat-square" alt="Version">
  <a href="https://www.npmjs.com/package/@jungherz-de/notionkit-elements"><img src="https://img.shields.io/npm/v/@jungherz-de/notionkit-elements?style=flat-square&color=529cca" alt="npm"></a>
  <a href="CHANGELOG.md"><img src="https://img.shields.io/badge/changelog-v1.0.0-9065b0?style=flat-square" alt="Changelog"></a>
  <img src="https://img.shields.io/badge/license-MIT-448361?style=flat-square" alt="MIT">
</p>

# NotionKit Elements

Vanilla-JS Web Components for the [NotionKit](https://notionkit.jungherz.com) CSS foundation – 68 `<nk-*>` custom elements with Shadow DOM, automatic light/dark sync, native form participation and pixel parity with the class markup. Same word stem as the CSS classes: `.nk-callout` becomes `<nk-callout>`, a modifier class becomes an attribute, a state class becomes a boolean attribute.

- **Docs:** https://notionkit-elements.jungherz.com/docs.html – attributes, slots, events, before/after against the class markup
- **Showcase:** https://notionkit-elements.jungherz.com/showcase.html – every element live, both themes, brand switch
- **Demo app:** https://notionkit-elements.jungherz.com/app.html – the NotionKit reference app, elements only
- **AI reference:** [SKILL.md](SKILL.md) – copy-paste markup, six app skeletons, rules and common mistakes

## Quick start

```html
<!DOCTYPE html>
<html lang="en" data-theme="light">
<head>
  <link rel="stylesheet" href="https://cdn.jsdelivr.net/npm/@jungherz-de/notionkit@1.1.1/notionkit.min.css">
  <script src="https://cdn.jsdelivr.net/npm/@jungherz-de/notionkit-elements@1.0.0/dist/notionkit-elements.min.js"></script>
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
import '@jungherz-de/notionkit-elements/components/nk-btn.js';         // or one element (shared code is one extra chunk)
```

Two prerequisites, always: `notionkit.css` on the document (the peer dependency, `>= 1.0.0`; 1.1.1 is what the elements are built and tested against) and `class="nk-body"` on `<body>`. The elements ship no visual CSS of their own – every rule comes from the foundation. The bundle injects the design tokens once as `@layer notionkit-defaults`, so any plain `:root { --nk-accent: … }` of yours re-brands every element in both themes.

## Elements

| Group | Elements |
|---|---|
| Forms & controls | `nk-btn` `nk-input` `nk-textarea` `nk-select` `nk-switch` `nk-check` `nk-radio` `nk-slider` `nk-field` |
| Content | `nk-tag` `nk-progress` `nk-callout` `nk-divider` `nk-heading` `nk-toggle` `nk-todo` `nk-kbd` `nk-code` `nk-quote` |
| App shell & navigation | `nk-app` `nk-sidebar` `nk-workspace-switcher` `nk-section-label` `nk-tree` `nk-tree-item` `nk-topbar` `nk-breadcrumb` `nk-theme-toggle` |
| Page shell & blocks | `nk-page` `nk-page-cover` `nk-page-title` `nk-page-actions` `nk-block-host` `nk-banner` `nk-empty` `nk-skeleton` `nk-synced` `nk-tabs` `nk-tab` `nk-segmented` `nk-stats` `nk-stat` `nk-avatar-group` `nk-mention` `nk-template-btn` `nk-model-card` `nk-profile-row` `nk-danger-zone` `nk-member-list` `nk-member-row` |
| Overlays | `nk-modal` `nk-settings-pane` `nk-settings-user` `nk-cmdk` `nk-menu` `nk-menu-item` `nk-pop` `nk-emoji-picker` `nk-toast` |
| Data & collaboration | `nk-database` `nk-table-view` `nk-board-view` `nk-filter-bar` `nk-comments` `nk-comment` `nk-ai-thread` `nk-ai-msg` `nk-ai-input-row` (+ the exported `renderPropertyCell()`) |

Static content goes in through attributes and slots, dynamic data through properties (`tree.data`, `database.rows`, `palette.commands`). Interactions fire custom events with fixed names: `nk-select`, `nk-change`, `nk-view-change`, `nk-command`, `nk-toggle`, `nk-submit`, `nk-action`. No fetching, no two-way binding – the elements render what they get.

## How it works

- Each element's shadow root adopts the NotionKit **components** sheet only; tokens are inherited from the document. A `.nk-wrapper` inside the root mirrors `data-theme` from `<html>` – one observer for all instances.
- Every host is `display: contents`: the inner `.nk-*` element sits in the parent layout exactly where the class markup would. That is what makes the pixel parity hold – and why spacing belongs on a wrapper you own, not on the host.
- Form controls are form-associated custom elements: `FormData`, `reset`, `required` and `<fieldset disabled>` just work. `<nk-radio>`s with the same `name` form a real group across shadow roots, with one tab stop and arrow keys.
- Elements that copy light-DOM children (`nk-select` options, breadcrumb crumbs) watch them; `element.refresh()` is the escape hatch. Listeners are re-armed on every connect, so a moved element keeps working.
- `::slotted()` matches only the assigned node: pass icons directly (`<span slot="icon">📁</span>`), never wrapped.
- Overlays (`nk-modal`, `nk-cmdk`, `nk-toast`) go directly under `<body>`; they lock scroll, make the rest of the page `inert` and return focus.
- The editor stays an adapter: `nk-block-host` is the shell, `docs-editor.js` the TipTap recipe (used in the demo app). `<nk-editor>` follows in v1.1 as an optional import, never in the core bundle.

## Development

```bash
npm install
npm run build        # dist/: IIFE, minified IIFE, ESM, per-component ESM + shared chunk
npm run build:all    # + docs.html, showcase.html, index.html, de/, SKILL.md, llms.txt
npm test             # Playwright: pixel parity vs. class markup (both themes), branding, reconnect, radio groups, light-DOM drift, forms, overlays, data views, per-component import
npm run check:coverage && npm run check:versions
```

`tools/catalog.mjs` is the single source for docs, showcase, SKILL.md, llms.txt, the coverage check and the parity test. `dist/` and the generated pages are committed; CI rebuilds them and fails on drift. `dist/` embeds the installed NotionKit version – release order: publish the CSS package first, `npm install` here, rebuild, commit, tag.

## The NotionKit family

| Layer | Package |
|---|---|
| **NotionKit** – CSS foundation | [`@jungherz-de/notionkit`](https://github.com/JUNGHERZ/NotionKit) |
| **NotionKit Elements** – this package | `@jungherz-de/notionkit-elements` |
| NotionKit Web – Astro template | planned |

MIT · Jungherz GmbH
