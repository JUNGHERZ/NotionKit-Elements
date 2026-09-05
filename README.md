<h1 align="center">🧩 NotionKit Elements</h1>

<p align="center">
  <a href="https://www.npmjs.com/package/@jungherz-de/notionkit-elements"><img src="https://img.shields.io/badge/version-1.0.0-2383e2?style=flat-square" alt="Version"></a>
  <a href="#"><img src="https://img.shields.io/badge/vanilla_JS-no_dependencies-448361?style=flat-square" alt="Vanilla JS"></a>
  <a href="#"><img src="https://img.shields.io/badge/elements-68-529cca?style=flat-square" alt="68 Elements"></a>
  <a href="LICENSE"><img src="https://img.shields.io/badge/license-MIT-9065b0?style=flat-square" alt="MIT License"></a>
  <a href="CHANGELOG.md"><img src="https://img.shields.io/badge/changelog-v1.0.0-lightgrey?style=flat-square" alt="Changelog"></a>
  <a href="https://www.npmjs.com/package/@jungherz-de/notionkit-elements"><img src="https://img.shields.io/badge/npm-%40jungherz--de%2Fnotionkit--elements-cb3837?style=flat-square&logo=npm" alt="npm"></a>
</p>

<p align="center">
  <strong>Drop-in Web Components for <a href="https://github.com/JUNGHERZ/NotionKit">NotionKit CSS</a></strong><br>
  68 vanilla JavaScript custom elements wrapping NotionKit's calm, document-centric workspace look.<br>
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

NotionKit Elements is the companion library to [NotionKit CSS](https://github.com/JUNGHERZ/NotionKit). It provides **68 Web Components** – from buttons and form controls over the sidebar, page tree and page shell to the settings modal, ⌘K palette, database views and AI thread – that encapsulate the class markup of the foundation into simple, declarative custom elements.

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
| 🧩 **68 Elements** | Forms, content blocks, app shell & tree, page shell, overlays (modal, ⌘K palette, menus, popover, emoji picker, toast), database table & board, comments, AI thread |
| 🎛️ **Form participation** | Input, textarea, select, switch, check, radio, slider, segmented and model card work natively with `<form>` via `ElementInternals`; radios group across shadow roots |
| 🌗 **Theme sync** | One observer mirrors `data-theme` on `<html>` into every element |
| 🪶 **Lightweight** | 167 KB minified / 33 KB gzipped (IIFE, foundation sheet included), no external dependencies |
| 📦 **Four bundle shapes** | IIFE, minified IIFE, ESM, and per-component ESM entries with a shared chunk |
| 🤖 **AI-ready** | `SKILL.md` with copy-paste markup, six app skeletons and the rules – an agent given only that file built a working app in the release test |

---

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

| Layer | Repository | Website |
|---|---|---|
| **NotionKit** – CSS foundation | [`JUNGHERZ/NotionKit`](https://github.com/JUNGHERZ/NotionKit) | [notionkit.jungherz.com](https://notionkit.jungherz.com) |
| **NotionKit Elements** – Web Components (this package) | [`JUNGHERZ/NotionKit-Elements`](https://github.com/JUNGHERZ/NotionKit-Elements) | [notionkit-elements.jungherz.com](https://notionkit-elements.jungherz.com) |
| **NotionKit Web** – Astro template for complete websites | [`JUNGHERZ/NotionKit-Web`](https://github.com/JUNGHERZ/NotionKit-Web) | [notionkit-web.jungherz.com](https://notionkit-web.jungherz.com) |

npm: [`@jungherz-de/notionkit`](https://www.npmjs.com/package/@jungherz-de/notionkit) · [`@jungherz-de/notionkit-elements`](https://www.npmjs.com/package/@jungherz-de/notionkit-elements)

MIT · [Jungherz GmbH](https://www.jungherz.com)
